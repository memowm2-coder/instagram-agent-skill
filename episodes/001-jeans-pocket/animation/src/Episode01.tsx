import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';

// EP01 · ليش الجينز فيه جيب صغير؟ — full 85.7 s episode, 1920×1080, 30 fps.
// Port of full/project/episode.html (the approved cut). Same timeline, same keys,
// same layers: render(frame) became a React function of useCurrentFrame().
// Stop motion: paper moves on fours (boil) and on hold keys; no tweening except the camera.

export const EP01_FRAMES = 2573;

const W = 1920;
const H = 1080;
const INK = '#2A2826';
const PAPER = '#FBF6EA';
const RED = '#D2342B';
const BLUE = '#2F4A6D';
const DARK = '#1C1B19';
const SH = 'drop-shadow(-9px 13px 10px rgba(0,0,0,.38))';
const SFX_GAIN = 10 ** (-9 / 20); // stems sit −9 dB under the VO, as in the approved cut

const A = (p: string) => staticFile(`ep01/a/${p}`);
const abs: React.CSSProperties = {position: 'absolute'};

// ---- timing helpers (verbatim logic from episode.html) ----
const S4 = (f: number) => f - (((f % 4) + 4) % 4);
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const boil = (g: number, id: number, a = 1.5, r = 0.4) => {
  const k = Math.floor(g / 4);
  return {
    x: (hash(k, id) - 0.5) * 2 * a,
    y: (hash(k, id + 9) - 0.5) * 2 * a,
    r: (hash(k, id + 17) - 0.5) * 2 * r,
  };
};
const keys = <T,>(f: number, ks: [number, T][]): T => {
  let v = ks[0][1];
  for (const [k, x] of ks) if (f >= k) v = x;
  return v;
};
const ez = (t: number) => {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};
const cl = (t: number) => Math.max(0, Math.min(1, t));
const pop = (f: number, at: number) => keys(f, [[0, 0], [at, 1.25], [at + 4, 0.95], [at + 8, 1]]);
// hand-held transform: boil + keyed offset (B() in episode.html; origin is set per element)
const B = (f: number, seed: number, dx = 0, dy = 0, r = 0, s = 1, a = 1.5): React.CSSProperties => {
  const b = boil(S4(f), seed, a);
  return {transform: `translate(${dx + b.x}px,${dy + b.y}px) rotate(${r + b.r}deg) scale(${s})`};
};
// camera move over `len` frames (cam() in episode.html)
const camT = (f: number, len: number, s0: number, s1: number, dx = 0, dy = 0) => {
  const t = ez(f / len);
  return `translate(${dx * t}px,${dy * t}px) scale(${s0 + (s1 - s0) * t})`;
};
// stroke-draw progress; path lengths precomputed so no DOM measuring is needed
const dashOf = (len: number, t: number): React.CSSProperties => ({
  strokeDasharray: len,
  strokeDashoffset: len * (1 - cl(t)),
});
const ellipsePerimeter = (rx: number, ry: number) => {
  let L = 0;
  let px = rx;
  let py = 0;
  for (let i = 1; i <= 4000; i++) {
    const t = (i / 4000) * 2 * Math.PI;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    L += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return L;
};
const cubicLength = ([[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: number[][]) => {
  let L = 0;
  let px = x0;
  let py = y0;
  for (let i = 1; i <= 2000; i++) {
    const t = i / 2000;
    const u = 1 - t;
    const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
    const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
    L += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return L;
};
const LEN_RING5 = ellipsePerimeter(300, 250);
const LEN_RING6 = ellipsePerimeter(95, 68);
const LEN_LEAD6 = cubicLength([[445, 160], [560, 100], [700, 90], [830, 110]]);
const LEN_BLADE = Math.hypot(34, 880);
const LEN_DIM1 = 430 + 40 + 40; // three subpaths of the dimension line
const LEN_D1 = 580;
const LEN_D2 = 560;

// ---- paper-tear wipe (seeded, same sequence as episode.html) ----
let ripSeed = 5;
const ripRand = () => {
  ripSeed = (ripSeed * 16807) % 2147483647;
  return ripSeed / 2147483647;
};
const RIP_EDGE: [number, number][] = [];
for (let y = 0; y <= 1080; y += 16) RIP_EDGE.push([ripRand() * 60, y]);
const RIP_POLY = [...RIP_EDGE, [2700, 1080], [2700, 0]].map((q) => q.join(',')).join(' ');
const RIP_LINE = RIP_EDGE.map((q) => q.join(',')).join(' ');

// scene table (global frames) from the detected speech pauses
const SC: [string, number, number][] = [
  ['S1', 0, 237],
  ['S2', 237, 522],
  ['S3', 522, 720],
  ['S4', 720, 1038],
  ['S5', 1038, 1437],
  ['S6', 1437, 1908],
  ['S7', 1908, 2313],
  ['S8', 2313, 2573],
];

// ---- shared pieces ----
const Cam: React.FC<{transform: string; children: React.ReactNode}> = ({transform, children}) => (
  <div style={{...abs, left: 0, top: 0, width: W, height: H, transformOrigin: '960px 540px', transform}}>
    {children}
  </div>
);

const Words: React.FC<{
  f: number;
  at: number;
  gap?: number;
  size: number;
  texts: string[];
  left: number;
  top: number;
  width: number;
  wordStyle?: React.CSSProperties;
}> = ({f, at, gap = 6, size, texts, left, top, width, wordStyle}) => (
  <div
    style={{
      ...abs,
      left,
      top,
      width,
      display: 'flex',
      flexWrap: 'wrap',
      direction: 'rtl',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {texts.map((t, i) => {
      const a = at + i * gap;
      const s = keys(f, [[0, 1], [a, 1.3], [a + 2, 1.08], [a + 4, 0.96], [a + 6, 1]]);
      const b = boil(S4(f), 40 + i, 1, 0.4);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            fontFamily: 'Plex',
            fontWeight: 700,
            fontSize: size,
            color: DARK,
            background: PAPER,
            padding: '6px 20px 14px',
            direction: 'rtl',
            filter: 'drop-shadow(-4px 6px 4px rgba(0,0,0,.35))',
            margin: 6,
            visibility: f >= a ? 'visible' : 'hidden',
            transform: `translate(${b.x}px,${b.y}px) rotate(${(i % 2 ? 2 : -2.5) + b.r}deg) scale(${s})`,
            ...wordStyle,
          }}
        >
          {t}
        </span>
      );
    })}
  </div>
);

const Lab: React.FC<{left: number; top: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  left,
  top,
  style,
  children,
}) => (
  <div
    style={{
      ...abs,
      left,
      top,
      fontFamily: 'Plex',
      fontWeight: 500,
      fontSize: 26,
      color: '#2A2826',
      background: '#F6F0E3',
      padding: '4px 14px',
      direction: 'rtl',
      border: `2px solid ${INK}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Ivory: React.FC = () => <Img src={A('backgrounds/ivory_paper_1920x1080.png')} style={{...abs, left: 0, top: 0}} />;
const Grid: React.FC<{opacity: number}> = ({opacity}) => (
  <Img src={A('overlays/engineering_grid.png')} style={{...abs, left: 0, top: 0, opacity}} />
);

// ---- scenes ----
const Scene1: React.FC<{f: number; end: boolean}> = ({f, end}) => {
  const y = end
    ? keys(f, [[0, -6], [200, 104], [204, 120], [212, 262], [216, 280], [224, 420]])
    : keys(f, [[0, 420], [21, 280], [25, 262], [33, 120], [37, 104], [45, -20], [49, 0], [53, -6]]);
  const r = end
    ? keys(f, [[0, -1], [200, 2], [212, -3], [224, 0]])
    : keys(f, [[0, 0], [21, -3], [33, 2.5], [45, -2], [53, -1]]);
  const logoScale = keys(f, [[0, 1], [40, 1.35], [42, 1.1], [44, 0.96], [46, 1]]);
  return (
    <Cam transform={camT(f, 240, 1.03, 1.0)}>
      <Ivory />
      <Grid opacity={0.6} />
      <Img src={A('characters/maryam_original_paper_cutout.png')}
        style={{...abs, left: 150, top: 80, width: 760, filter: SH, ...B(f, 1, 0, y, r, 1)}} />
      <Img src={A('objects/watch_pocket_master.png')}
        style={{...abs, left: 60, top: 420, width: 1000, filter: SH, ...B(f, 2, 0, 0, 0, 1, 1.2)}} />
      <svg width={W} height={H} style={{...abs, left: 0, top: 0}} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round">
        <path
          d="M330 1010 L760 1010 M330 990 L330 1030 M760 990 L760 1030"
          style={{...dashOf(LEN_DIM1, (f - (end ? 9999 : 70)) / 14), visibility: end ? 'hidden' : 'visible'}}
        />
      </svg>
      {!end && f >= 86 && <Lab left={450} top={1032}>فتحة الجيب</Lab>}
      {!end && <Words f={f} at={60} size={96} texts={['ليش', 'الجينز', 'فيه', 'جيب', 'صغير؟']} left={1080} top={180} width={760} />}
      {end && f >= 40 && (
        <Img src={A('logo.png')} style={{...abs, left: 1110, top: 150, width: 720, ...B(f, 7, 0, 0, -2, logoScale, 1)}} />
      )}
    </Cam>
  );
};

const Scene2: React.FC<{f: number}> = ({f}) => {
  const P: [number, [number, number, number]][] = [
    [0, [0, -900, -8]], [30, [0, -640, -5]], [34, [0, -380, 0]], [38, [0, -160, 4]], [42, [0, 40, 6]],
    [46, [0, 200, 6]], [52, [0, 230, 8]], [56, [0, 205, 4]], [60, [0, 228, 9]], [64, [0, 210, 5]],
    [68, [0, 226, 8]], [96, [-60, 40, -10]], [100, [-200, -200, -26]], [104, [-380, -150, -48]],
    [108, [-520, 120, -70]], [112, [-560, 330, -86]], [116, [-570, 300, -88]], [120, [-570, 320, -90]],
  ];
  const pv = keys(f, P);
  const my = f >= 96 ? keys(f, [[96, -26], [100, -8], [104, -16], [108, 0]]) : 0;
  const mr = f >= 96 ? keys(f, [[96, 3], [104, -2], [108, 0]]) : 0;
  const xs = keys(f, [[0, 1], [124, 1.4], [126, 1.1], [128, 0.95], [130, 1]]);
  return (
    <Cam transform={camT(f, 285, 1.0, 1.06, -40, 0)}>
      <Ivory />
      <Grid opacity={0.6} />
      <Img src={A('objects/watch_pocket_master.png')}
        style={{...abs, left: 160, top: 300, width: 1000, filter: SH, ...B(f, 3, 0, 0, 0, 1, 1.2)}} />
      <Img src={A('objects/smartphone_unbranded.png')}
        style={{...abs, left: 470, top: 0, width: 330, filter: SH, ...B(f, 4, pv[0], pv[1], pv[2], 1, 1)}} />
      <Img src={A('characters/maryam_original_paper_cutout.png')}
        style={{...abs, left: 1180, top: 330, width: 740, filter: SH, ...B(f, 5, 0, my, mr, 1)}} />
      <Img src={A('objects/watch_pocket_master.png')}
        style={{...abs, left: 160, top: 300, width: 1000, clipPath: 'inset(45% 0 0 0)', ...B(f, 3, 0, 0, 0, 1, 1.2)}} />
      {f >= 124 && (
        <Img src={A('xstamp.png')} style={{...abs, left: 470, top: 560, width: 380, ...B(f, 6, 0, 0, -6, xs, 1)}} />
      )}
      <Words f={f} at={70} gap={8} size={80} texts={['حتى الجوال…', 'ما يدخل!']} left={1100} top={110} width={760} />
    </Cam>
  );
};

const Scene3: React.FC<{f: number}> = ({f}) => {
  const cardS = keys(f, [[0, 0], [30, 1.4], [32, 1.1], [34, 0.96], [36, 1]]);
  return (
    <Cam transform={camT(f, 198, 1.0, 1.08, 30, 0)}>
      <Img src={A('backgrounds/sepia_archival_1920x1080.png')} style={{...abs, left: 0, top: 0}} />
      <Img src={A('citystrip.png')}
        style={{
          ...abs, left: 150, top: 120, width: 1200,
          filter: `sepia(.6) ${SH}`,
          ...B(f, 8, keys(f, [[0, -1500], [6, -900], [10, -360], [14, -60], [18, 0]]), 0, -2, 1, 1.2),
        }} />
      <Img src={A('overlays/date_1873_card.png')}
        style={{...abs, left: 0, top: 0, width: W, filter: SH, transformOrigin: '960px 540px', ...B(f, 9, 0, 0, -4, cardS, 1)}} />
      <Img src={A('characters/maryam_original_paper_cutout.png')}
        style={{
          ...abs, left: 1300, top: 420, width: 640, filter: SH,
          ...B(f, 10, keys(f, [[0, 700], [50, 420], [54, 140], [58, -20], [62, 0]]), 0,
            keys(f, [[0, 0], [50, 3], [58, -2], [62, 0]]), 1),
        }} />
      <Lab left={170} top={470}>تصوّر توضيحي</Lab>
      <Words f={f} at={40} size={72} texts={['نرجع لسنة ١٨٧٣']} left={540} top={800} width={840} />
    </Cam>
  );
};

const Scene4: React.FC<{f: number}> = ({f}) => {
  const sw = Math.sin(S4(f) / 10) * 8 * Math.max(0.3, 1 - f / 318);
  return (
    <Cam transform={camT(f, 318, 1.08, 1.0, 0, -20)}>
      <Ivory />
      <Grid opacity={0.5} />
      <Img src={A('objects/watch_illustrative_NOT_ARCHIVE.png')}
        style={{
          ...abs, left: 420, top: 150, width: 760, filter: SH, transformOrigin: '50% 10%',
          ...B(f, 11, 0, keys(f, [[0, -900], [10, -560], [14, -260], [18, -60], [22, 0]]), sw, 1, 1),
        }} />
      <Img src={A('characters/maryam_original_paper_cutout.png')}
        style={{
          ...abs, left: 1230, top: 400, width: 700, filter: SH,
          ...B(f, 12, keys(f, [[0, 700], [60, 360], [64, 120], [68, -10], [72, 0]]), 0,
            keys(f, [[0, 0], [60, -3], [68, 2], [72, 0]]), 1),
        }} />
      <Img src={A('tag.png')} style={{...abs, left: 1130, top: 110, width: 600, filter: SH, ...B(f, 13, 0, 0, 4, pop(f, 90), 1)}} />
      <div
        style={{
          ...abs, left: 1270, top: 170, width: 400, fontFamily: 'Plex', fontWeight: 700, fontSize: 48,
          direction: 'rtl', textAlign: 'center', color: DARK, opacity: f >= 96 ? 1 : 0,
        }}
      >
        شي كان الكل يحمله…
      </div>
      <Lab left={470} top={930}>تصوّر توضيحي</Lab>
    </Cam>
  );
};

const Scene5: React.FC<{f: number}> = ({f}) => {
  const e = ez((f - 60) / 20);
  const sep = e * 60;
  const wy = keys(f, [[0, 0], [150, 240], [154, 560], [158, 780], [162, 880], [166, 860], [170, 870]]);
  const wr = keys(f, [[0, -12], [158, -4], [166, 0]]);
  const secOpacity = cl((f - 80) / 10) * 0.85;
  return (
    <Cam transform={camT(f, 399, 1.0, 1.06, -30, 10)}>
      <Ivory />
      <Grid opacity={0.7} />
      <Img src={A('objects/watch_pocket_master.png')}
        style={{...abs, left: 420, top: 180, width: 860, filter: SH, clipPath: 'polygon(0 0,52% 0,48% 100%,0 100%)',
          ...B(f, 14, -sep / 2, 0, -e * 2, 1, 1)}} />
      <Img src={A('objects/watch_illustrative_NOT_ARCHIVE.png')}
        style={{...abs, left: 610, top: -700, width: 420, filter: SH, ...B(f, 16, 0, wy, wr, 1, 1)}} />
      <Img src={A('objects/watch_pocket_master.png')}
        style={{...abs, left: 420, top: 180, width: 860, filter: SH, clipPath: 'polygon(52% 0,100% 0,100% 100%,48% 100%)',
          ...B(f, 15, sep / 2, 0, e * 2, 1, 1)}} />
      <Img src={A('overlays/pocket_section_overlay.png')} style={{...abs, left: 0, top: 0, opacity: secOpacity}} />
      <svg width={W} height={H} style={{...abs, left: 0, top: 0}} fill="none" strokeLinecap="round">
        <path
          d="M867 120 L833 1000"
          stroke={INK}
          strokeWidth={4}
          style={{...dashOf(LEN_BLADE, (f - 30) / 24), opacity: f < 110 ? 1 : 0.25}}
        />
        <g stroke={BLUE} strokeWidth={3}>
          <path d="M560 1020 L1140 1020" style={dashOf(LEN_D1, (f - 110) / 16)} />
          <path d="M1340 260 L1340 820" style={dashOf(LEN_D2, (f - 126) / 16)} />
        </g>
        <ellipse
          cx={820}
          cy={480}
          rx={300}
          ry={250}
          stroke={RED}
          strokeWidth={10}
          style={{...dashOf(LEN_RING5, (f - 290) / 20), visibility: f >= 290 ? 'visible' : 'hidden'}}
        />
      </svg>
      {f >= 126 && <Lab left={740} top={1030}>عرض الجيب</Lab>}
      {f >= 142 && <Lab left={1370} top={520}>مقطع</Lab>}
      {f >= 300 && (
        <Words f={f} at={300} size={96} texts={['ساعة جيب']} left={1350} top={120} width={520}
          wordStyle={{color: PAPER, background: '#A8291F'}} />
      )}
    </Cam>
  );
};

const Scene6: React.FC<{f: number}> = ({f}) => {
  const nodes: [string, number, number, number, number][] = [
    // [src, left, top, width, start frame]
    ['n1.png', 110, 300, 110, 40],
    ['n2.png', 640, 300, 110, 52],
    ['n3.png', 300, 20, 110, 64],
  ];
  const card = (
    left: number, top: number, borderColor: string, seed: number, t1: string, t2: string,
    slide: [number, number][], rot: number,
  ) => (
    <div
      style={{
        ...abs, left, top, width: 720, boxSizing: 'content-box', fontFamily: 'Plex', direction: 'rtl', textAlign: 'right',
        background: PAPER, padding: '26px 32px', borderTop: `8px solid ${borderColor}`,
        filter: 'drop-shadow(-6px 9px 7px rgba(0,0,0,.35))',
        ...B(f, seed, keys(f, slide), 0, rot, 1, 1),
      }}
    >
      <div style={{fontWeight: 700, fontSize: 62, color: DARK}}>{t1}</div>
      <div style={{fontWeight: 500, fontSize: 34, color: INK}}>{t2}</div>
    </div>
  );
  return (
    <Cam transform={camT(f, 471, 1.0, 1.05, 0, 0)}>
      <Ivory />
      <Grid opacity={0.5} />
      <Img src={A('objects/jeans_master.png')}
        style={{...abs, left: -60, top: 60, width: 1100, filter: SH, ...B(f, 17, 0, 0, -1, 1, 1.2)}} />
      <svg width={W} height={H} style={{...abs, left: 0, top: 0}} fill="none">
        <ellipse cx={353} cy={167} rx={95} ry={68} stroke={RED} strokeWidth={9}
          style={{...dashOf(LEN_RING6, (f - 64) / 16), visibility: f >= 64 ? 'visible' : 'hidden'}} />
        <path d="M445 160 C 560 100 700 90 830 110" stroke={INK} strokeWidth={4}
          style={dashOf(LEN_LEAD6, (f - 80) / 14)} />
      </svg>
      {nodes.map(([src, left, top, width, start], i) => (
        <Img key={src} src={A(src)}
          style={{...abs, left, top, width, visibility: f >= start ? 'visible' : 'hidden',
            ...B(f, 20 + i, 0, 0, (i - 1) * 4, pop(f, start), 1)}} />
      ))}
      <div
        style={{
          ...abs, left: 930, top: 560, visibility: f >= 76 ? 'visible' : 'hidden',
          ...B(f, 24, 0, 0, 3, pop(f, 76), 1),
        }}
      >
        <img src={A('n4.png')} style={{position: 'relative', width: 110}} />
        <div style={{position: 'relative', fontFamily: 'Plex', fontWeight: 500, fontSize: 26, color: '#2A2826',
          background: '#F6F0E3', padding: '4px 14px', direction: 'rtl', border: `2px solid ${INK}`}}>
          جيب خلفي واحد
        </div>
      </div>
      {card(1120, 120, INK, 25, '١٨٧٣: أربع جيوب', 'والصغير موجود من البداية… في الأمام',
        [[0, 900], [24, 500], [28, 120], [32, -10], [36, 0]], -1.5)}
      {card(1120, 470, BLUE, 26, '١٩٠١: الجيب الخامس', 'هو الجيب الخلفي الثاني، مب الصغير',
        [[0, 900], [250, 500], [254, 120], [258, -10], [262, 0]], 1.5)}
      <Lab left={1120} top={920} style={{fontSize: 22}}>المصدر: Levi Strauss &amp; Co.</Lab>
    </Cam>
  );
};

const Scene7: React.FC<{f: number}> = ({f}) => (
  <Cam transform={camT(f, 405, 1.0, 1.06, 0, 0)}>
    <Img src={A('backgrounds/denim_blue_1920x1080.png')} style={{...abs, left: 0, top: 0}} />
    <Img src={A('objects/jeans_master.png')}
      style={{...abs, left: 80, top: 120, width: 900, filter: SH,
        ...B(f, 27, keys(f, [[0, -1200], [6, -500], [10, -60], [14, 0]]), 0, -2, 1)}} />
    <Img src={A('objects/smartphone_unbranded.png')}
      style={{...abs, left: 1050, top: 180, width: 300, filter: SH,
        ...B(f, 28, 0, keys(f, [[0, -1100], [50, -500], [54, -80], [58, 0]]), keys(f, [[0, 8], [58, 4]]), 1)}} />
    <Img src={A('objects/watch_pocket_master.png')}
      style={{...abs, left: 640, top: 330, width: 700, filter: SH,
        ...B(f, 29, keys(f, [[0, 1300], [100, 600], [104, 80], [108, 0]]), 0, 3,
          keys(f, [[0, 1], [220, 1.08], [224, 1.04]]))}} />
    <Words f={f} at={130} gap={10} size={84} texts={['١٥٠ سنة…', 'والجيب باقي']} left={1180} top={120} width={700} />
  </Cam>
);

// ---- assets that must be ready before a frame is captured ----
const useAssetsReady = () => {
  const [handle] = useState(() => delayRender('Loading IBM Plex Sans Arabic and paper texture'));
  useEffect(() => {
    const fonts = [
      ['ep01/fonts/IBMPlexSansArabic-Bold.ttf', '700'],
      ['ep01/fonts/IBMPlexSansArabic-Medium.ttf', '500'],
    ].map(async ([url, weight]) => {
      const face = new FontFace('Plex', `url(${staticFile(url)})`, {weight});
      await face.load();
      (document.fonts as unknown as {add(f: FontFace): void}).add(face);
    });
    const texture = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = staticFile('ep01/a/backgrounds/ivory_paper_1920x1080.png');
    });
    Promise.all([...fonts, texture])
      .then(() => continueRender(handle))
      .catch((err) => {
        throw err;
      });
  }, [handle]);
};

export const Episode01: React.FC = () => {
  useAssetsReady();
  const F = useCurrentFrame();
  const cur = SC.find((s) => F >= s[1] && F < s[2]) ?? SC[SC.length - 1];
  const f = F - cur[1];

  let tr: number | null = null;
  for (const s of SC.slice(1)) if (F >= s[1] - 12 && F <= s[1] + 12) tr = s[1];
  const ripT = tr === null ? 0 : (S4(F) - (tr - 12)) / 24;
  const ripLeft = 1920 - (1920 + 2700) * ripT;

  const scene = {
    S1: <Scene1 f={f} end={false} />,
    S2: <Scene2 f={f} />,
    S3: <Scene3 f={f} />,
    S4: <Scene4 f={f} />,
    S5: <Scene5 f={f} />,
    S6: <Scene6 f={f} />,
    S7: <Scene7 f={f} />,
    S8: <Scene1 f={f} end />,
  }[cur[0]];

  return (
    <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
      <AbsoluteFill>{scene}</AbsoluteFill>
      {tr !== null && (
        <svg width={2700} height={H} style={{...abs, top: 0, left: ripLeft, filter: 'drop-shadow(-18px 0 16px rgba(0,0,0,.5))'}}>
          <defs>
            <pattern id="ep01-paper" width={2700} height={H} patternUnits="userSpaceOnUse">
              <image href={A('backgrounds/ivory_paper_1920x1080.png')} width={2700} height={H} preserveAspectRatio="none" />
            </pattern>
          </defs>
          <polygon points={RIP_POLY} fill="url(#ep01-paper)" />
          <polyline points={RIP_LINE} fill="none" stroke="#FFF8EA" strokeWidth={10} />
        </svg>
      )}
      <Audio src={staticFile('ep01/vo.wav')} />
      {['paper', 'stamp', 'phone', 'watch'].map((n) => (
        <Audio key={n} src={staticFile(`ep01/sfx/${n}.wav`)} volume={SFX_GAIN} />
      ))}
    </AbsoluteFill>
  );
};
