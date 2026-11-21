import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame} from 'remotion';
import {getLength} from '@remotion/paths';

// EP01 · ليش الجينز فيه جيب صغير؟ — Vox-style explainer cut, 1920×1080, 30 fps, 85.8 s.
// One big dark board. The approved collage pieces (plates, Maryam's cutouts, the pocket, the phone,
// the watch, the torn-paper numbers) are pinned on it with tape; a single camera travels across it
// with eased moves, whip pans and a zoom-through. Highlighter sweeps, hand-drawn rings, a patent
// card, a loupe, and a 1873 → 1901 → today timeline carry the facts (claims C1–C10 in 01-research.md).
// Timing follows the speech segments of Maryam's original VO (silence detection on vo.wav).

export const VOX_FRAMES = 2573;

const DARK = '#1C1B19';
const CREAM = '#F6F0E3';
const PAPER = '#F3EAD6';
const INK = '#1C1B19';
const RED = '#D2342B';
const YELLOW = '#F2CB3A';
const SFX_GAIN = 10 ** (-9 / 20);
const V = (p: string) => staticFile(`vox/${p}`);

// ---- easing ----
const cl = (t: number) => Math.max(0, Math.min(1, t));
const ez = (t: number) => {
  t = cl(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const out = (t: number) => 1 - Math.pow(1 - cl(t), 3);
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pop = (f: number, at: number) => (f < at ? 0 : spring({frame: f - at, fps: 30, config: {damping: 11, stiffness: 160, mass: 0.7}}));
const settle = (f: number, at: number) => (f < at ? 0 : spring({frame: f - at, fps: 30, config: {damping: 15, stiffness: 90, mass: 1}}));
const fade = (f: number, at: number, d = 8) => cl((f - at) / d);

// ---- camera: [frame, x, y, zoom]; eased between keys, hard cut where two keys share a frame ----
type Key = [number, number, number, number];
const CAM: Key[] = [
  [0, -250, 175, 2.05], [40, -235, 170, 1.9], [100, 0, 120, 0.78], [200, 0, 130, 0.8],
  [214, 2350, 140, 0.86], [378, 2360, 160, 0.86], [394, 2350, 1360, 0.84], [556, 2350, 1380, 0.84],
  [574, -250, 2560, 0.8], [700, -230, 2560, 0.82], [724, 960, 2640, 0.86], [828, 980, 2640, 0.86], [850, 1180, 2620, 0.8],
  [896, 1180, 2620, 0.8], [912, 4320, 2440, 0.8], [1120, 4320, 2480, 0.8], [1150, 3725, 2215, 1.7],
  [1214, 3712, 2205, 1.85], [1240, 3712, 2210, 2.35], [1328, 3712, 2212, 2.6], [1344, 3712, 2212, 9],
  [1344, 3758, 4689, 9], [1394, 3900, 4420, 0.86], [1436, 3900, 4410, 0.9], [1466, 3900, 4410, 0.9],
  [1488, 5560, 4470, 0.82], [1624, 5560, 4470, 0.84], [1640, 4120, 2440, 0.86], [1780, 4140, 2450, 0.86],
  [1800, 4560, 2640, 0.92], [1850, 4560, 2640, 0.92], [1872, 3700, 3330, 0.8], [1906, 3700, 3330, 0.8],
  [1960, 5000, 3150, 0.72], [2140, 5040, 3150, 0.72], [2166, 7150, 3350, 0.86], [2312, 7160, 3350, 0.88],
  [2392, 3500, 2200, 0.19], [2418, 3500, 2200, 0.19], [2472, 250, 1350, 0.9], [2573, 250, 1350, 0.94],
];
const camAt = (f: number) => {
  let i = 0;
  while (i < CAM.length - 1 && f >= CAM[i + 1][0]) i++;
  const a = CAM[i];
  const b = CAM[i + 1];
  if (!b || b[0] === a[0]) return {x: a[1], y: a[2], z: a[3]};
  const t = ez((f - a[0]) / (b[0] - a[0]));
  // zoom in log space so dives and pull-backs feel even
  const z = Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * t);
  return {x: a[1] + (b[1] - a[1]) * t, y: a[2] + (b[2] - a[2]) * t, z};
};
type CamT = ReturnType<typeof camAt>;

// ---- board items ----
// An item is placed by its centre in board space; depth > 1 sits a little above the board (parallax).
const It: React.FC<{cam: CamT; x: number; y: number; rot?: number; s?: number; d?: number; o?: number; children: React.ReactNode}> = ({
  cam, x, y, rot = 0, s = 1, d = 1, o = 1, children,
}) => {
  const k = (d - 1) * 0.18;
  const px = x + (x - cam.x) * k;
  const py = y + (y - cam.y) * k;
  if (o <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: o, transformOrigin: '0 0',
      transform: `translate(${px}px,${py}px) rotate(${rot}deg) scale(${s * (1 + (d - 1) * 0.06)}) translate(-50%,-50%)`}}>
      {children}
    </div>
  );
};
const SHADOW = 'drop-shadow(-10px 16px 14px rgba(0,0,0,.55))';
const Tape: React.FC<{x: number; y: number; r: number; w?: number}> = ({x, y, r, w = 200}) => (
  <Img src={V('tape.png')} style={{position: 'absolute', left: x - w / 2, top: y - 27, width: w, transform: `rotate(${r}deg)`, opacity: 0.92}} />
);
const Photo: React.FC<{src: string; w: number; h: number; border?: number; tapes?: boolean; children?: React.ReactNode; filter?: string}> = ({
  src, w, h, border = 14, tapes = true, children, filter,
}) => (
  <div style={{position: 'relative', width: w + border * 2, height: h + border * 2, background: '#EFE7D6', filter: SHADOW}}>
    <Img src={src} style={{position: 'absolute', left: border, top: border, width: w, height: h, objectFit: 'cover', filter}} />
    <div style={{position: 'absolute', left: border, top: border, width: w, height: h}}>{children}</div>
    {tapes && <><Tape x={60} y={6} r={-24} /><Tape x={w + border * 2 - 60} y={6} r={22} /></>}
  </div>
);
const Cut: React.FC<{src: string; w: number; style?: React.CSSProperties}> = ({src, w, style}) => (
  <Img src={V(src)} style={{display: 'block', width: w, filter: SHADOW, ...style}} />
);

// ---- type ----
const Mark: React.FC<{p: number; children: React.ReactNode; color?: string}> = ({p, children, color = YELLOW}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span style={{position: 'absolute', right: '-0.14em', top: '0.2em', bottom: '0.04em', borderRadius: '0.14em',
      width: `calc(${ez(p) * 100}% + ${ez(p) * 0.28}em)`, background: color, opacity: 0.94, transform: 'skewX(-8deg) rotate(-1.2deg)'}} />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);
type W = {t: string; at: number; mark?: number; markColor?: string};
const Words: React.FC<{f: number; words: W[]; size: number; color?: string; width?: number; weight?: number; gap?: number}> = ({
  f, words, size, color = INK, width, weight = 700, gap = 0.28,
}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', direction: 'rtl', justifyContent: 'center', alignItems: 'baseline',
    columnGap: `${gap}em`, rowGap: '0.05em', width, fontFamily: 'Plex', fontWeight: weight, fontSize: size, lineHeight: 1.25, color}}>
    {words.map((w, i) => {
      const t = out((f - w.at) / 7);
      return (
        <span key={i} style={{display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 0.35}em)`, whiteSpace: 'nowrap'}}>
          {w.mark !== undefined ? <Mark p={(f - w.mark) / 10} color={w.markColor}>{w.t}</Mark> : w.t}
        </span>
      );
    })}
  </div>
);
const Strip: React.FC<{w: number; h: number; children: React.ReactNode; pad?: number}> = ({w, h, children, pad = 40}) => (
  <div style={{position: 'relative', width: w, height: h, filter: SHADOW}}>
    <Img src={V('torn.png')} style={{position: 'absolute', inset: 0, width: w, height: h}} />
    <div style={{position: 'absolute', inset: 0, padding: `0 ${pad}px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
  </div>
);
const Label: React.FC<{size?: number; children: React.ReactNode; dark?: boolean}> = ({size = 26, children, dark = true}) => (
  <div style={{fontFamily: 'Plex', fontWeight: 500, fontSize: size, lineHeight: 1.2, whiteSpace: 'nowrap', direction: 'rtl',
    padding: `${size * 0.22}px ${size * 0.5}px`, color: dark ? CREAM : INK, background: dark ? DARK : CREAM,
    border: dark ? `2px solid ${CREAM}` : `2px solid ${INK}`}}>
    {children}
  </div>
);

// ---- hand-drawn strokes ----
const rough = (cx: number, cy: number, rx: number, ry: number, seed: number, turns = 1.12) => {
  const n = 72;
  const a0 = -2.2 + hash(seed, 1);
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = a0 + (i / n) * turns * Math.PI * 2;
    const w = 1 + (hash(Math.floor(i / 6), seed) - 0.5) * 0.07 + (i / n) * 0.05;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(t) * rx * w).toFixed(1)} ${(cy + Math.sin(t) * ry * w).toFixed(1)} `;
  }
  return d;
};
const lenCache = new Map<string, number>();
const len = (d: string) => {
  if (!lenCache.has(d)) lenCache.set(d, getLength(d));
  return lenCache.get(d)!;
};
const Draw: React.FC<{d: string; p: number; color?: string; w?: number; dash?: string}> = ({d, p, color = RED, w = 9, dash}) => {
  if (p <= 0) return null;
  const L = len(d);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    style={{strokeDasharray: dash ?? L, strokeDashoffset: dash ? undefined : L * (1 - ez(p)), opacity: dash ? ez(p) : 1}} />;
};
const Svg: React.FC<{w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>{children}</svg>
);

// ===== region 1 · the question (living photo: Maryam rises out of the pocket) =====
const LivingPocket: React.FC<{f: number}> = ({f}) => {
  const rise = settle(f, 18);
  const ring = cl((f - 150) / 18);
  const sink = f > 2600 ? 1 : 0;
  return (
    <div style={{position: 'relative', width: 1920, height: 1080, overflow: 'hidden'}}>
      <Img src={staticFile('op5/plate_clean.png')} style={{position: 'absolute', left: 0, top: 0}} />
      <Img src={staticFile('op5/back_card.png')} style={{position: 'absolute', left: 315, top: 25, width: 860, height: 600, transform: 'rotate(-2deg)'}} />
      <Img src={staticFile('op5/maryam_paper_cutout_cream_outline.png')}
        style={{position: 'absolute', left: 270, top: 60, width: 940, filter: 'drop-shadow(-8px 12px 9px rgba(0,0,0,.4))',
          transform: `translateY(${470 - (470 + 135) * rise + sink * 600}px) rotate(${(1 - rise) * -4}deg)`}} />
      <Img src={staticFile('op5/pocket_front.png')} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(-8px 12px 9px rgba(0,0,0,.4))'}} />
      <Img src={staticFile('op5/small_patch.png')} style={{position: 'absolute', left: 0, top: 0}} />
      <Svg w={1920} h={1080}><Draw d={rough(668, 838, 330, 150, 3)} p={ring} w={12} /></Svg>
    </div>
  );
};

// ===== region 3 · the phone does not fit =====
const PhoneTest: React.FC<{f: number}> = ({f}) => {
  const o = 395;
  // phone path: drop, jam at the mouth, two bounces, falls out to the right
  const drop = settle(f, o);
  let y = -900 + 760 * drop;
  let r = 6;
  let x = 0;
  if (f >= o + 40) {
    const b = f - (o + 40);
    y = -140 - Math.abs(Math.sin(b / 6)) * 110 * Math.exp(-b / 22);
    r = 6 + Math.sin(b / 4) * 4 * Math.exp(-b / 20);
  }
  if (f >= o + 78) {
    const t = out((f - (o + 78)) / 18);
    x = 1150 * t;
    y = -140 - 380 * Math.sin(t * Math.PI) + 60 * t;
    r = 6 + 80 * t;
  }
  const xs = pop(f, o + 92);
  const dims = cl((f - (o + 100)) / 14);
  return (
    <div style={{position: 'relative', width: 1880, height: 1100}}>
      <Img src={V('pocket.png')} style={{position: 'absolute', left: 0, top: 380, width: 1880, filter: SHADOW}} />
      {f >= o - 2 && <Img src={V('phone.png')} style={{position: 'absolute', left: 560, top: 300, width: 300, filter: SHADOW,
        transform: `translate(${x}px,${y}px) rotate(${r}deg)`}} />}
      {/* the front of the small pocket stays over the phone */}
      <Img src={V('pocket.png')} style={{position: 'absolute', left: 0, top: 380, width: 1880,
        clipPath: 'polygon(21% 52%, 61% 60%, 61% 100%, 21% 100%)'}} />
      <Svg w={1880} h={1100}>
        <Draw d="M410 1030 L1150 1030 M410 1005 L410 1055 M1150 1005 L1150 1055" p={dims} color={CREAM} w={5} />
        <Draw d="M1700 120 L1700 520 M1675 120 L1725 120 M1675 520 L1725 520" p={cl((f - (o + 112)) / 12)} color={CREAM} w={5} />
      </Svg>
      {dims > 0.6 && <div style={{position: 'absolute', left: 640, top: 1052}}><Label>فتحة الجيب الصغير</Label></div>}
      {f >= o + 118 && <div style={{position: 'absolute', left: 1745, top: 290}}><Label>الجوال</Label></div>}
      {xs > 0 && <Img src={V('xstamp.png')} style={{position: 'absolute', left: 600, top: 520, width: 420,
        transform: `rotate(-8deg) scale(${0.4 + 0.6 * xs})`, opacity: cl(xs * 2)}} />}
    </div>
  );
};

// ===== region 5 · the patent card =====
const Patent: React.FC<{f: number}> = ({f}) => {
  const row = (at: number, children: React.ReactNode, size = 40, weight = 500) => (
    <div style={{fontSize: size, fontWeight: weight, opacity: out((f - at) / 8), transform: `translateY(${(1 - out((f - at) / 8)) * 14}px)`, lineHeight: 1.45}}>
      {children}
    </div>
  );
  return (
    <div style={{position: 'relative', width: 1060, height: 1180, background: PAPER, filter: SHADOW, fontFamily: 'Plex', color: INK,
      direction: 'rtl', textAlign: 'right', padding: '70px 80px', boxSizing: 'border-box',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(42,40,38,.05) 0 2px, transparent 2px 58px)'}}>
      <Tape x={530} y={4} r={-3} w={240} />
      {row(706, <span style={{letterSpacing: 2}}>براءة اختراع أمريكية</span>, 34, 500)}
      {row(714, <Mark p={(f - 724) / 12}>رقم ١٣٩٬١٢١</Mark>, 92, 700)}
      {row(740, <Mark p={(f - 752) / 12}>٢٠ مايو ١٨٧٣</Mark>, 60, 700)}
      <div style={{height: 2, background: INK, opacity: 0.6, margin: '22px 0 26px', width: `${ez((f - 760) / 20) * 100}%`}} />
      {row(772, <>«تحسين في <Mark p={(f - 822) / 14}>تثبيت فتحات الجيوب</Mark>»</>, 46, 700)}
      {row(790, <>مسمار معدني عند طرفي فتحة الجيب، عشان <Mark p={(f - 850) / 14}>ما تنشق</Mark>.</>, 38)}
      {row(806, <span style={{opacity: 0.75}}>جايكوب ديفيس · ليفاي شتراوس وشركاه</span>, 32)}
      <div style={{position: 'absolute', left: 60, bottom: 50}}>{f >= 760 && <Label size={22} dark={false}>ملخص · U.S. Patent 139,121</Label>}</div>
    </div>
  );
};
const Loupe: React.FC<{f: number}> = ({f}) => {
  const s = pop(f, 858);
  return (
    <div style={{position: 'relative', width: 560, height: 560, transform: `scale(${s})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: '22px solid #B08A3E',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,.6), 0 18px 30px rgba(0,0,0,.6)'}}>
        <Img src={V('pocket_detail.png')} style={{position: 'absolute', width: 1650, left: -870, top: -420}} />
      </div>
      <Svg w={560} h={560}><Draw d={rough(282, 262, 96, 92, 11)} p={cl((f - 872) / 14)} w={10} /></Svg>
      {f >= 882 && <div style={{position: 'absolute', left: 150, top: 520}}><Label>مسمار نحاسي</Label></div>}
    </div>
  );
};

// ===== region 6 · the first jeans: four pockets, then the twist =====
// jeans.png is 913×1086; pocket centres in that image:
const J = {front1: [255, 245], front2: [640, 245], small: [266, 140]};
const Jeans: React.FC<{f: number}> = ({f}) => {
  const tag = (src: string, at: number, x: number, y: number, r: number, w = 120) => {
    const s = pop(f, at);
    return s > 0 && <Img src={V(src)} style={{position: 'absolute', left: x - w / 2, top: y - w * 0.7, width: w, filter: SHADOW,
      transform: `rotate(${r}deg) scale(${s})`}} />;
  };
  const small = J.small;
  const mystery = cl((f - 1252) / 14);
  // the "5" first sits by the small pocket, gets crossed out, then moves to the back pocket
  const toBack = ez((f - 1790) / 22);
  const fiveX = 400 + (1430 - 400) * toBack;
  const fiveY = 70 + (560 - 70) * toBack;
  return (
    <div style={{position: 'relative', width: 1900, height: 1200}}>
      <Img src={V('jeans.png')} style={{position: 'absolute', left: 0, top: 60, width: 913, filter: SHADOW}} />
      {/* back view hint: one back pocket in 1873 */}
      <div style={{position: 'absolute', left: 1180, top: 330, width: 560, opacity: fade(f, 1040, 10)}}>
        <Svg w={560} h={460}>
          <Draw d="M60 40 L300 40 L292 230 L180 300 L68 230 Z" p={cl((f - 1040) / 16)} color={CREAM} w={6} />
          <Draw d="M330 40 L520 40 L512 230 L425 290 L338 230 Z" p={cl((f - 1792) / 16)} color={YELLOW} w={6} dash="18 14" />
        </Svg>
        <div style={{position: 'absolute', left: 30, top: 330}}><Label>الخلف: جيب واحد بس</Label></div>
      </div>
      {tag('n1.png', 978, J.front1[0] + 10, 60 + J.front1[1] + 40, -6)}
      {tag('n2.png', 994, J.front2[0], 60 + J.front2[1] + 40, 5)}
      {tag('n3.png', 1046, 1300, 420, -4)}
      {tag('n4.png', 1130, small[0] - 150, 60 + small[1] - 30, 8, 110)}
      <Svg w={913} h={1200}>
        <Draw d={rough(small[0], 60 + small[1], 66, 50, 7)} p={cl((f - 1218) / 14)} w={7} />
      </Svg>
      {/* a slot sized to the pocket, waiting for its object */}
      {mystery > 0 && f < 1345 && (
        <div style={{position: 'absolute', left: small[0] - 40, top: 60 + small[1] - 46, width: 80, height: 74, opacity: mystery,
          border: `3px dashed ${CREAM}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plex', fontWeight: 700, fontSize: 46, color: CREAM, background: 'rgba(28,27,25,.35)'}}>؟</div>
      )}
      {f >= 1630 && (
        <div style={{position: 'absolute', left: fiveX - 60, top: fiveY - 84, width: 120}}>
          <Img src={V('n5.png')} style={{width: 120, filter: SHADOW, transform: `scale(${pop(f, 1632)}) rotate(-5deg)`}} />
          {f < 1790 && f >= 1735 && (
            <Img src={V('xstamp.png')} style={{position: 'absolute', left: -40, top: -20, width: 200, transform: `scale(${pop(f, 1735)})`}} />
          )}
        </div>
      )}
      {f >= 1640 && f < 1790 && <div style={{position: 'absolute', left: 470, top: 30, opacity: fade(f, 1640)}}><Label size={30}>الجيب الخامس؟</Label></div>}
      {f >= 1812 && <div style={{position: 'absolute', left: 1290, top: 700, opacity: fade(f, 1812)}}><Label size={30}>الخامس = الخلفي الثاني</Label></div>}
    </div>
  );
};

// ===== region 7 · zoom-through into the pocket: the cross-section =====
const Cutaway: React.FC<{f: number}> = ({f}) => {
  // the watch hangs as a silhouette through the 3.6 s pause, then lands on «ساعة جيب»
  const hang = ez((f - 1350) / 70);
  const land = settle(f, 1437);
  const y = f < 1437 ? -760 + 330 * hang : -430 + 580 * land;
  const swing = Math.sin(f / 9) * (f < 1437 ? 5 : 3 * Math.exp(-(f - 1437) / 20));
  const sil = f < 1437 ? 1 : cl(1 - (f - 1437) / 4);
  const xray = cl((f - 1452) / 12);
  return (
    <div style={{position: 'relative', width: 1880, height: 1250}}>
      <Img src={V('pocket.png')} style={{position: 'absolute', left: 0, top: 500, width: 1880, filter: SHADOW}} />
      <Img src={V('watch.png')} style={{position: 'absolute', left: 520, top: 360, width: 360, transformOrigin: '75% 0%',
        transform: `translateY(${y}px) rotate(${swing}deg)`, filter: `brightness(${1 - sil}) ${SHADOW}`}} />
      <Img src={V('pocket.png')} style={{position: 'absolute', left: 0, top: 500, width: 1880, opacity: 1 - 0.62 * xray,
        clipPath: 'polygon(21% 41%, 61% 49%, 61% 100%, 21% 100%)'}} />
      <Svg w={1880} h={1250}>
        <Draw d="M440 700 L1130 760 L1120 1100 L430 1080 Z" p={xray} color={CREAM} w={5} dash="16 12" />
      </Svg>
      {xray > 0.5 && <div style={{position: 'absolute', left: 1180, top: 900, opacity: fade(f, 1460)}}><Label size={30}>مقاسها بالضبط</Label></div>}
    </div>
  );
};

// ===== the timeline =====
const Timeline: React.FC<{f: number}> = ({f}) => {
  const a = ez((f - 1858) / 26);
  const b = ez((f - 1912) / 44);
  const node = (x: number, at: number, year: string, note: string, hi = false) => {
    const s = pop(f, at);
    return (
      <div style={{position: 'absolute', left: x - 160, top: -38, width: 320, textAlign: 'center', opacity: cl(s * 2)}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', background: hi ? RED : CREAM, margin: '0 auto', transform: `scale(${s})`,
          boxShadow: '0 8px 14px rgba(0,0,0,.5)'}} />
        <div style={{fontFamily: 'Plex', fontWeight: 700, fontSize: 84, color: CREAM, marginTop: 12}}>{year}</div>
        <div style={{fontFamily: 'Plex', fontWeight: 500, fontSize: 36, color: CREAM, opacity: 0.85}}>{note}</div>
      </div>
    );
  };
  const brace = cl((f - 1966) / 22);
  return (
    <div style={{position: 'relative', width: 3400, height: 400}}>
      <div style={{position: 'absolute', left: 300, top: 0, height: 8, background: CREAM, width: 1000 * a, borderRadius: 4}} />
      <div style={{position: 'absolute', left: 1300, top: 0, height: 8, background: CREAM, width: 1800 * b, borderRadius: 4}} />
      {node(300, 1856, '١٨٧٣', '٤ جيوب')}
      {node(1300, 1880, '١٩٠١', 'الجيب الخامس')}
      {node(3100, 1950, 'اليوم', 'الجيب الصغير باقي', true)}
      <Svg w={3400} h={400} style={{top: -330}}>
        <Draw d="M300 250 C 300 160 1650 200 1700 90 C 1750 200 3100 160 3100 250" p={brace} color={YELLOW} w={8} />
      </Svg>
    </div>
  );
};

// ===== the board =====
const Board: React.FC<{f: number; cam: CamT}> = ({f, cam}) => {
  const c = {cam};
  return (
    <>
      <div style={{position: 'absolute', left: -4000, top: -3000, width: 16000, height: 11000,
        backgroundImage: `url(${V('board.png')})`, backgroundSize: '1024px 1024px'}} />

      {/* 1 · the question */}
      <It {...c} x={0} y={-70} rot={-1.2}>
        <div style={{transform: 'scale(.8)', transformOrigin: '0 0', width: 1536, height: 864, position: 'relative', filter: SHADOW}}>
          <div style={{position: 'absolute', left: -14, top: -14, width: 1948, height: 1108, background: '#EFE7D6'}} />
          <LivingPocket f={f} />
          <Tape x={160} y={-6} r={-20} w={300} /><Tape x={1760} y={-6} r={18} w={300} />
        </div>
      </It>
      <It {...c} x={20} y={520} rot={0.8} d={1.12} o={fade(f, 26, 6)}>
        <Strip w={1460} h={250}>
          <Words f={f} size={98} words={[
            {t: 'ليش', at: 34}, {t: 'الجينز', at: 52}, {t: 'فيه', at: 70}, {t: 'جيب', at: 92, mark: 140}, {t: 'صغير؟', at: 112, mark: 146},
          ]} />
        </Strip>
      </It>

      {/* 2 · what people call it */}
      <It {...c} x={2120} y={20} rot={-7} s={1.5} o={fade(f, 236, 4)}>
        <div style={{position: 'relative', transform: `rotate(${Math.sin(f / 18) * 2}deg)`, transformOrigin: '10% 50%'}}>
          <Img src={V('tag.png')} style={{display: 'block', width: 488, filter: SHADOW}} />
          <div style={{position: 'absolute', left: 120, top: 70, width: 340, textAlign: 'center', fontFamily: 'Plex', fontWeight: 700,
            fontSize: 62, color: INK, direction: 'rtl', opacity: out((f - 244) / 8)}}>جيب الفكّة</div>
        </div>
      </It>
      <It {...c} x={2150} y={420} rot={1.5} d={1.1} o={fade(f, 322, 6)}>
        <div style={{position: 'relative'}}>
          <Strip w={980} h={190}>
            <Words f={f} size={74} words={[{t: 'جيب', at: 324}, {t: 'ما', at: 330}, {t: 'له', at: 334}, {t: 'أي', at: 338}, {t: 'فايدة؟', at: 342}]} />
          </Strip>
          <Svg w={980} h={190}><Draw d="M120 104 C 360 92 640 118 880 96" p={cl((f - 352) / 10)} w={11} /></Svg>
        </div>
      </It>
      <It {...c} x={3020} y={300} d={1.22} o={fade(f, 214, 6)}>
        <Cut src="maryam_think.png" w={640} style={{transform: `translateY(${(1 - settle(f, 214)) * 300}px)`}} />
      </It>

      {/* 3 · not even the phone */}
      <It {...c} x={2250} y={1330} s={0.86}><PhoneTest f={f} /></It>
      <It {...c} x={2250} y={1840} rot={-0.8} d={1.12} o={fade(f, 518, 5)}>
        <Strip w={1180} h={200}>
          <Words f={f} size={84} words={[{t: 'عيل…', at: 520}, {t: 'حق', at: 534}, {t: 'شو', at: 540}, {t: 'انسوى؟', at: 546, mark: 556}]} />
        </Strip>
      </It>
      <It {...c} x={3080} y={1560} d={1.25} o={fade(f, 520, 4)}>
        <Cut src="maryam_chin.png" w={560} style={{transform: `translateY(${(1 - settle(f, 520)) * 260}px)`}} />
      </It>

      {/* 4 · back to 1873 */}
      <It {...c} x={-760} y={2560} rot={-4} s={1.55}><Photo src={V('archive_man.png')} w={280} h={395} border={12} /></It>
      <It {...c} x={-250} y={2700} rot={3} s={1.5}><Photo src={V('archive_street.png')} w={250} h={310} border={12} /></It>
      <It {...c} x={200} y={2560} rot={-2} s={1.5}><Photo src={V('archive_building.png')} w={192} h={330} border={12} /></It>
      <It {...c} x={-250} y={2950} d={1.08} o={fade(f, 574, 6)}><Label size={30}>تصوّر توضيحي</Label></It>
      <It {...c} x={-260} y={2150} d={1.2} rot={-3} s={0.6 + 0.4 * pop(f, 598)} o={cl(pop(f, 598) * 2)}>
        <div style={{fontFamily: 'Plex', fontWeight: 700, fontSize: 260, lineHeight: 1, padding: '10px 50px 30px',
          border: `10px solid ${RED}`, color: RED, background: 'rgba(28,27,25,.25)', borderRadius: 18}}>١٨٧٣</div>
      </It>
      <It {...c} x={-250} y={3110} d={1.1} o={fade(f, 566, 6)}>
        <Words f={f} size={64} width={900} color={CREAM} words={[{t: 'نرجع', at: 568}, {t: 'لسنة', at: 580}, {t: '١٨٧٣', at: 596, mark: 604}]} />
      </It>

      {/* 5 · the patent */}
      <It {...c} x={900} y={2640} rot={1.2} o={fade(f, 700, 8)}><Patent f={f} /></It>
      <It {...c} x={1720} y={2470} d={1.25}><Loupe f={f} /></It>

      {/* 6 · four pockets, then the twist */}
      <It {...c} x={4250} y={2520}><Jeans f={f} /></It>
      <It {...c} x={4560} y={1990} rot={-1} d={1.12} o={fade(f, 904, 6)}>
        <Strip w={1300} h={210}>
          <Words f={f} size={80} words={[{t: 'أول', at: 906}, {t: 'جينز:', at: 916}, {t: '٤', at: 932, mark: 944}, {t: 'جيوب', at: 938, mark: 948}, {t: 'بس', at: 950}]} />
        </Strip>
      </It>
      <It {...c} x={3420} y={1880} d={1.08} o={fade(f, 1252, 8) * (f < 1346 ? 1 : 0)}><Label size={22}>مفصّل على مقاس شي محدّد</Label></It>

      {/* 7 · the cross-section */}
      <It {...c} x={3900} y={4600} s={1.2}><Cutaway f={f} /></It>
      <It {...c} x={3900} y={4010} d={1.15} rot={-1} o={fade(f, 1437, 2)} s={0.7 + 0.3 * pop(f, 1437)}>
        <Strip w={1100} h={240}>
          <Words f={f} size={120} words={[{t: 'ساعة', at: 1437}, {t: 'جيب', at: 1441, mark: 1446}]} />
        </Strip>
      </It>
      <It {...c} x={5200} y={4420} rot={-3} s={1.45}><Photo src={V('archive_man.png')} w={280} h={395} border={12} /></It>
      <It {...c} x={5980} y={4500} rot={2}>
        <Photo src={V('watch_in_pocket.png')} w={720} h={609}>
          <Svg w={720} h={609}>
            <Draw d="M560 120 C 470 60 380 120 360 230" p={cl((f - 1584) / 12)} color={CREAM} w={8} />
            <Draw d="M330 196 L360 236 L396 204" p={cl((f - 1594) / 5)} color={CREAM} w={8} />
          </Svg>
          {f >= 1592 && <div style={{position: 'absolute', left: 480, top: 40, opacity: fade(f, 1592)}}><Label size={34}>بيتها</Label></div>}
        </Photo>
      </It>
      <It {...c} x={5560} y={3970} d={1.12} o={fade(f, 1490, 6)}>
        <Words f={f} size={60} width={1100} color={CREAM} words={[{t: 'أهم', at: 1490}, {t: 'شي', at: 1496}, {t: 'يحمله', at: 1502}, {t: 'الرجّال', at: 1510, mark: 1520}, {t: 'وياه', at: 1530}]} />
      </It>
      <It {...c} x={5560} y={4930} d={1.06} o={fade(f, 1490, 6)}><Label size={22}>تصوّر توضيحي</Label></It>

      {/* 8 · the timeline */}
      <It {...c} x={4300} y={3340}><Timeline f={f} /></It>
      <It {...c} x={3000} y={3700} o={fade(f, 1870, 8)}><Label size={22}>المصدر: Levi Strauss &amp; Co.</Label></It>

      {/* 9 · today */}
      <It {...c} x={6150} y={2700} rot={-2} s={0.85} o={fade(f, 1940, 8)}><Photo src={V('phone_in_pocket.png')} w={760} h={617} /></It>
      <It {...c} x={4700} y={2740} rot={1} d={1.12} o={fade(f, 2000, 6)}>
        <Strip w={1100} h={200}>
          <Words f={f} size={76} words={[{t: '١٥٠', at: 2002}, {t: 'سنة…', at: 2010}, {t: 'والجيب', at: 2034}, {t: 'باقي', at: 2044, mark: 2054}]} />
        </Strip>
      </It>
      <It {...c} x={7000} y={3260} rot={-1} d={1.08} o={fade(f, 2164, 6)}>
        <Strip w={1180} h={320} pad={60}>
          <Words f={f} size={72} width={1000} words={[{t: 'شو', at: 2170}, {t: 'تحطّون', at: 2176}, {t: 'انتو', at: 2182}, {t: 'في', at: 2188},
            {t: 'الجيب', at: 2194, mark: 2214}, {t: 'الصغير؟', at: 2200, mark: 2218}]} />
        </Strip>
      </It>
      <It {...c} x={7820} y={3500} d={1.25} o={fade(f, 2160, 4)}>
        <Cut src="maryam_point.png" w={620} style={{transform: `translateX(${(1 - settle(f, 2160)) * 500}px) scaleX(-1)`}} />
      </It>

      {/* 10 · sign-off */}
      <It {...c} x={250} y={1350} rot={-1.5}>
        <div style={{position: 'relative', width: 1700, height: 980, background: PAPER, filter: SHADOW}}>
          <Tape x={240} y={4} r={-14} w={300} /><Tape x={1460} y={4} r={12} w={300} />
          <Img src={staticFile('ep01/logo.png')} style={{position: 'absolute', left: 500, top: 70, width: 700,
            transform: `scale(${f < 2440 ? 0 : 0.5 + 0.5 * pop(f, 2440)}) rotate(-3deg)`}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
            <Words f={f} size={64} weight={500} words={[{t: 'ملف', at: 2470}, {t: '٠٠١', at: 2474}, {t: '·', at: 2478}, {t: 'الجيب', at: 2482}, {t: 'الصغير', at: 2486, mark: 2517}]} />
          </div>
        </div>
      </It>
      <It {...c} x={1200} y={1720} d={1.2} o={fade(f, 2478, 4)}>
        <Cut src="maryam_peek.png" w={560} style={{transform: `translateY(${(1 - settle(f, 2478)) * 400}px)`}} />
      </It>
    </>
  );
};

// ---- fonts ----
const useFontsReady = () => {
  const [handle] = useState(() => delayRender('Loading IBM Plex Sans Arabic'));
  useEffect(() => {
    Promise.all(
      [['ep01/fonts/IBMPlexSansArabic-Bold.ttf', '700'], ['ep01/fonts/IBMPlexSansArabic-Medium.ttf', '500']].map(async ([url, weight]) => {
        const face = new FontFace('Plex', `url(${staticFile(url)})`, {weight});
        await face.load();
        (document.fonts as unknown as {add(f: FontFace): void}).add(face);
      }),
    ).then(() => continueRender(handle)).catch((err) => {
      throw err;
    });
  }, [handle]);
};

export const EpisodeVox: React.FC = () => {
  useFontsReady();
  const f = useCurrentFrame();
  const cam = camAt(f);
  const prev = camAt(Math.max(0, f - 1));
  // motion blur from the camera's speed on screen (whip pans)
  const vx = Math.abs(cam.x - prev.x) * cam.z;
  const vy = Math.abs(cam.y - prev.y) * cam.z;
  const vz = Math.abs(Math.log(cam.z / prev.z)) * 900;
  const cut = Math.hypot(cam.x - prev.x, cam.y - prev.y) * cam.z > 1500;
  const bx = cut ? 0 : Math.min(26, vx * 0.09 + vz * 0.04);
  const by = cut ? 0 : Math.min(26, vy * 0.09 + vz * 0.04);
  const blur = bx + by > 0.6;
  const fadeIn = cl(f / 10);
  const fadeOut = 1;
  return (
    <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="vox-mb"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter>
      </svg>
      <AbsoluteFill style={{filter: blur ? 'url(#vox-mb)' : undefined, opacity: fadeIn * fadeOut}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
          transform: `translate(960px,540px) scale(${cam.z}) translate(${-cam.x}px,${-cam.y}px)`}}>
          <Board f={f} cam={cam} />
        </div>
      </AbsoluteFill>
      {/* 1873 flash: a brief sepia grade as the camera lands in the past */}
      <AbsoluteFill style={{background: '#7A5A30', mixBlendMode: 'color', opacity: 0.55 * cl(1 - Math.abs(f - 590) / 30) * (f > 560 ? 1 : 0), pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundImage: `url(${V(`grain${Math.floor(f / 2) % 8}.png`)})`, backgroundSize: '1920px 1080px', pointerEvents: 'none'}} />
      <Audio src={staticFile('ep01/vo.wav')} />
      {['paper', 'stamp', 'whoosh', 'watch', 'pen'].map((n) => (
        <Audio key={n} src={staticFile(`vox/sfx/${n}.wav`)} volume={SFX_GAIN} />
      ))}
    </AbsoluteFill>
  );
};
