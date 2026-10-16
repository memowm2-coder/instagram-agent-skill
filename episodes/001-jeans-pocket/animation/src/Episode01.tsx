import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {getLength} from '@remotion/paths';
import {PaperRip} from './PaperRip';

// EP01 · ليش الجينز فيه جيب صغير؟ — full episode, 1920×1080, 30 fps, 85.8 s.
// Built only on the approved storyboard plates (op5 scene 01, op10 scene 02, keyframes 1, 9, 4)
// and the paper cutouts extracted from them. Every moving piece is its own cutout layer,
// stepped on fours (stop motion). On-screen text sits on paper scraps over the plates' blank
// torn-paper cards. Scene cut points = the pauses in Maryam's original VO.

export const EP01_FRAMES = 2573;

const DARK = '#1C1B19';
const PAPER = '#FBF6EA';
const INK = '#2A2826';
const RED = '#D2342B';
const CHALK = '#F6F0E3';
const SH = 'drop-shadow(-8px 12px 9px rgba(0,0,0,.4))';
const SH_LAYER = 'drop-shadow(-6px 9px 7px rgba(0,0,0,.35))';
const CHALK_SH = 'drop-shadow(2px 3px 0 rgba(28,27,25,.85))';
const SFX_GAIN = 10 ** (-9 / 20); // SFX stems sit −9 dB under the VO
const src = (p: string) => staticFile(p);

// Cut points (global frames).
const CUT_S2 = 237; // peel
const CUT_S3 = 522; // rip
const CUT_S4 = 720; // continuous camera on plate 4
const CUT_S5 = 1038; // continuous camera on plate 4
const CUT_S6 = 1437; // rip
const CUT_S7 = 1908; // rip
const CUT_S8 = 2313; // rip

// ---- stop-motion helpers (same logic as the approved s01-s02 build) ----
const S4 = (f: number) => f - (((f % 4) + 4) % 4);
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const boil = (g: number, id: number, a = 1.5, r = 0.4) => {
  const k = Math.floor(g / 4);
  return {x: (hash(k, id) - 0.5) * 2 * a, y: (hash(k, id + 9) - 0.5) * 2 * a, r: (hash(k, id + 17) - 0.5) * 2 * r};
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
// a cutout that appears from nothing
const popIn = (f: number, at: number) => keys(f, [[0, 0], [at, 1.25], [at + 4, 0.95], [at + 8, 1]]);
// a cutout that is already in the plate: stamp bump only
const bump = (f: number, at: number) => keys(f, [[0, 1], [at, 1.22], [at + 2, 1.1], [at + 4, 0.97], [at + 6, 1]]);
const tf = (x: number, y: number, r = 0, s = 1) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const dash = (len: number, t: number): React.CSSProperties => ({strokeDasharray: len, strokeDashoffset: len * (1 - cl(t))});

// ---- strokes ----
const P_RING1 = 'M660 700 C 990 690 1020 770 990 870 C 960 975 420 985 345 900 C 285 830 330 712 660 700';
const P_ARROW1 = 'M1400 480 C 1320 640 1180 720 1040 760';
const P_HEAD1 = 'M1072 724 L1040 760 L1086 772';
const P_ARROW2 = 'M1060 160 C 960 120 860 160 800 260';
const P_HEAD2 = 'M790 222 L800 262 L838 244';
const P_X1 = 'M480 650 L700 870';
const P_X2 = 'M700 650 L480 870';
const P_WATCH_RING = 'M670 435 A200 185 0 1 1 270 435 A200 185 0 1 1 670 435';
const LEN: Record<string, number> = Object.fromEntries(
  [P_RING1, P_ARROW1, P_HEAD1, P_ARROW2, P_HEAD2, P_X1, P_X2, P_WATCH_RING].map((p) => [p, getLength(p)]),
);

// ---- paper scraps with text (each word / line is its own cutout, stamped in RTL order) ----
type Scrap = {t: string; size: number; at: number};
const WR = [-3, 2, -2, 2.5, -1.5];
const Scraps: React.FC<{
  f: number;
  items: Scrap[];
  left: number;
  top: number;
  width: number;
  height: number;
  seed: number;
  out?: number; // frame the scraps are pulled away (stepped)
  red?: boolean;
}> = ({f, items, left, top, width, height, seed, out, red}) => {
  if (out !== undefined && f >= out + 6) return null;
  const g = S4(f);
  const ox = out === undefined ? 0 : keys(f, [[0, 0], [out, -30], [out + 2, 60], [out + 4, 500]]);
  return (
    <div
      style={{
        position: 'absolute', left, top, width, height, display: 'flex', flexWrap: 'wrap', direction: 'rtl',
        justifyContent: 'center', alignContent: 'center', gap: '10px 14px', transform: `translateX(${ox}px)`,
      }}
    >
      {items.map((it, i) => {
        const s = keys(f, [[0, 0], [it.at, 1.3], [it.at + 2, 1.08], [it.at + 4, 0.96], [it.at + 6, 1]]);
        const dy = keys(f, [[0, -30], [it.at, -18], [it.at + 2, -4], [it.at + 4, 0]]);
        const b = boil(g, seed + i, 1, 0.4);
        return (
          <div
            key={i}
            style={{
              position: 'relative', fontFamily: 'Plex', fontWeight: 700, fontSize: it.size, lineHeight: 1,
              color: red ? PAPER : DARK, background: red ? '#A8291F' : PAPER, direction: 'rtl', whiteSpace: 'nowrap',
              padding: `${it.size * 0.135}px ${it.size * 0.243}px ${it.size * 0.243}px`,
              filter: 'drop-shadow(-4px 6px 4px rgba(0,0,0,.35))', transformOrigin: 'center',
              visibility: f >= it.at ? 'visible' : 'hidden', transform: tf(b.x, b.y + dy, WR[i % 5] + b.r, s),
            }}
          >
            {it.t}
          </div>
        );
      })}
    </div>
  );
};

const Lab: React.FC<{left: number; top: number; size: number; children: React.ReactNode}> = ({left, top, size, children}) => (
  <div
    style={{
      position: 'absolute', left, top, fontFamily: 'Plex', fontWeight: 500, fontSize: size, color: INK,
      background: CHALK, padding: `${size * 0.15}px ${size * 0.54}px`, direction: 'rtl', whiteSpace: 'nowrap',
      border: `${Math.max(1, size * 0.077)}px solid ${INK}`, filter: 'drop-shadow(-3px 4px 3px rgba(0,0,0,.3))',
    }}
  >
    {children}
  </div>
);

// ---- scenes 01, 02 and 08: depth layers over 1920×1080 plates (approved s01-s02 build) ----
const Depth: React.FC<{d: number; cs: number; fx: number; fy: number; drift: number; children: React.ReactNode}> = ({
  d, cs, fx, fy, drift, children,
}) => {
  const s = 1 + (cs - 1) * d;
  return (
    <div
      style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0',
        transform: `translate(${fx - fx * s + drift * (d - 1) * 8}px,${fy - fy * s}px) scale(${s})`,
      }}
    >
      {children}
    </div>
  );
};
const abs = (style: React.CSSProperties): React.CSSProperties => ({position: 'absolute', ...style});

const TITLE: Scrap[] = ['ليش', 'الجينز', 'فيه', 'جيب', 'صغير؟'].map((t, i) => ({t, size: 74, at: 78 + i * 6}));

// Scene 01 (end = false) and the loop scene 08 (end = true, Maryam sinks back = frame 0).
const Pocket: React.FC<{f: number; end?: boolean}> = ({f, end = false}) => {
  const g = S4(f);
  let cs = keys(f, [[0, 1.035], [5, 1.025], [10, 1.015], [15, 1.008], [20, 1]]);
  let fx = 960;
  let fy = 540;
  if (!end && f >= 100) {
    const t = ez((f - 100) / 50);
    cs = 1 + 0.32 * t;
    fx = 960 - 300 * t;
    fy = 540 + 280 * t;
  }
  const drift = Math.sin((f / 150) * Math.PI) * 6;
  const L = (d: number, children: React.ReactNode) => (
    <Depth d={d} cs={cs} fx={fx} fy={fy} drift={drift}>{children}</Depth>
  );
  const bm = boil(g, 3, 2, 0.6);
  const bc = boil(g, 4, 1, 0.3);
  const ba = boil(g, 1, 1.5, 0.3);
  const bp = boil(g, 5, 1.2, 0);
  const bq = boil(g, 6, 1.2, 0);
  const b7 = boil(g, 7);
  const b8 = boil(g, 8, 1, 0.3);
  // three stepped rises (scene 01) / three stepped sinks (scene 08)
  const y = end
    ? keys(f, [[0, -135], [200, 78], [204, 95], [212, 282], [216, 300], [224, 470]])
    : keys(f, [[0, 470], [21, 300], [25, 282], [33, 95], [37, 78], [45, -150], [49, -128], [53, -135]]);
  const r = end
    ? keys(f, [[0, -1], [200, 2], [212, -2.5], [216, -3], [224, 0]])
    : keys(f, [[0, 0], [21, -3], [25, -2.5], [33, 2.5], [37, 2], [45, -2], [49, -1.2], [53, -1]]);
  const deco = (at: number) => (end ? keys(f, [[0, 0], [4, 1.25], [8, 0.95], [12, 1], [236, 1.15], [238, 0]]) : popIn(f, at));
  const tx = end
    ? keys(f, [[0, 1200], [20, 820], [24, 420], [28, 120], [32, -20], [36, 0], [232, 120], [236, 820], [240, 1200]])
    : keys(f, [[0, 1200], [60, 820], [64, 420], [68, 120], [72, -20], [76, 0]]);
  const logoS = keys(f, [[0, 0], [40, 1.35], [42, 1.1], [44, 0.96], [46, 1]]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: DARK}}>
      {L(1, <Img src={src('op5/plate_clean.png')} style={abs({left: 0, top: 0})} />)}
      {L(1.05, <Img src={src('op5/magnifier.png')} style={abs({left: 0, top: 85, transform: tf(bm.x, bm.y, bm.r)})} />)}
      {L(1.03, <Img src={src('op5/back_card.png')}
        style={abs({left: 315, top: 25, width: 860, height: 600, filter: SH, transform: tf(bc.x, bc.y, -2 + bc.r)})} />)}
      {L(1.06, <Img src={src('op5/maryam_paper_cutout_cream_outline.png')}
        style={abs({left: 270, top: 60, width: 940, filter: SH, transform: tf(ba.x, y + ba.y, r + ba.r)})} />)}
      {L(1.09, <Img src={src('op5/pocket_front.png')} style={abs({left: 0, top: 0, filter: SH, transform: tf(bp.x, bp.y)})} />)}
      {L(1.1, <Img src={src('op5/small_patch.png')}
        style={abs({left: 0, top: 0, filter: 'drop-shadow(0 -6px 6px rgba(0,0,0,.35))', transform: tf(bq.x, bq.y)})} />)}
      {L(1.12, <>
        <Img src={src('op5/qmark.png')} style={abs({left: 70, top: 80, filter: SH, transform: tf(b7.x, b7.y, b7.r, deco(24))})} />
        <Img src={src('op5/ticks_l.png')} style={abs({left: 470, top: 140, transform: `scale(${deco(40)})`})} />
        <Img src={src('op5/ticks_r.png')} style={abs({left: 975, top: 320, transform: `scale(${deco(56)})`})} />
        <div style={abs({left: 1060, top: 110, width: 720, height: 272, transform: tf(tx + b8.x, b8.y, 3 + b8.r)})}>
          <Img src={src('op5/torn_paper_blank_alpha.png')} style={abs({left: 0, top: 0, width: 720, filter: SH})} />
          {end
            ? <Img src={src('ep01/logo.png')} style={abs({left: 185, top: 11, height: 250, transform: `scale(${logoS})`})} />
            : <Scraps f={f} items={TITLE} left={30} top={22} width={660} height={230} seed={20} />}
        </div>
      </>)}
      {!end && L(1.1, (
        <svg width={1920} height={1080} style={abs({left: 0, top: 0, filter: CHALK_SH})} fill="none" stroke={CHALK}
          strokeLinecap="round" strokeLinejoin="round">
          <path d={P_RING1} strokeWidth={7} style={dash(LEN[P_RING1], (f - 96) / 24)} />
          <path d={P_ARROW1} strokeWidth={9} style={dash(LEN[P_ARROW1], (f - 120) / 10)} />
          <path d={P_HEAD1} strokeWidth={9} style={dash(LEN[P_HEAD1], (f - 130) / 4)} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};

// Scene 02: the phone tries the tiny pocket, jams, bounces out; ✗ on the belief.
const PHONE: [number, [number, number, number]][] = [
  [-99, [420, -1000, -10]], [20, [430, -820, -6]], [24, [420, -560, 0]], [28, [400, -300, 5]], [32, [392, -90, 8]],
  [36, [390, -21, 8]], [40, [390, 12, 9]], [44, [390, -16, 6]], [48, [390, 10, 10]], [52, [390, -8, 7]],
  [56, [330, -220, -6]], [60, [200, -420, -22]], [64, [60, -380, -46]], [68, [-30, -80, -70]], [72, [-60, 150, -86]],
  [76, [-70, 190, -90]],
];
const Phone: React.FC<{g: number}> = ({g}) => {
  const h = S4(g);
  let cs = keys(g, [[-99, 1.06], [0, 1.045], [6, 1.03], [12, 1.015], [18, 1]]);
  let fx = 960;
  let fy = 540;
  if (g >= 100) {
    const t = ez((g - 100) / 50);
    cs = 1 + 0.18 * t;
    fx = 960 - 370 * t;
    fy = 540 + 220 * t;
  }
  const drift = Math.sin((g / 150) * Math.PI) * 6;
  const L = (d: number, children: React.ReactNode) => (
    <Depth d={d} cs={cs} fx={fx} fy={fy} drift={drift}>{children}</Depth>
  );
  const bc = boil(h, 31, 1, 0.3);
  const ba = boil(h, 32, 1.5, 0.3);
  const bq = boil(h, 33, 1.2, 0);
  const bph = boil(h, 34, 1, 0.4);
  const my = g >= 56 ? keys(g, [[56, -22], [60, -8], [64, -14], [68, 0]]) : 0;
  const mr = g >= 56 ? keys(g, [[56, 2], [64, -1], [68, 0]]) : 0;
  const pv = keys(g, PHONE);
  const xs = keys(g, [[0, 0], [80, 1.35], [82, 1.1], [84, 0.96], [86, 1]]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: DARK}}>
      {L(1, <Img src={src('op10/s2_plate.png')} style={abs({left: 0, top: 0})} />)}
      {L(1.03, (
        <div style={abs({left: 335, top: 120, width: 720, height: 560, transform: tf(bc.x, bc.y, -3 + bc.r)})}>
          <Img src={src('op10/s2_card.png')} style={abs({left: 0, top: 0, filter: SH})} />
          <Scraps f={g} items={[{t: 'حتى الجوال…', size: 70, at: 40}, {t: 'ما يدخل!', size: 70, at: 48}]}
            left={60} top={70} width={600} height={400} seed={40} />
        </div>
      ))}
      {L(1.06, <Img src={src('op10/s2_maryam.png')} style={abs({left: 0, top: 0, filter: SH, transform: tf(ba.x, my + ba.y, mr + ba.r)})} />)}
      {L(1.1, <Img src={src('op5/smartphone_unbranded_alpha.png')}
        style={abs({left: 0, top: 0, width: 400, filter: SH, transformOrigin: '50% 50%',
          transform: tf(pv[0] + bph.x, pv[1] + bph.y, pv[2] + bph.r)})} />)}
      {L(1.09, <Img src={src('op10/s2_patch.png')}
        style={abs({left: 0, top: 0, filter: 'drop-shadow(0 -6px 6px rgba(0,0,0,.35))', transform: tf(bq.x, bq.y)})} />)}
      {L(1.1, (
        <svg width={1920} height={1080} style={abs({left: 0, top: 0})} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g style={{filter: CHALK_SH}} stroke={CHALK}>
            <path d={P_ARROW2} strokeWidth={9} style={dash(LEN[P_ARROW2], (g - 20) / 10)} />
            <path d={P_HEAD2} strokeWidth={9} style={dash(LEN[P_HEAD2], (g - 30) / 4)} />
          </g>
          {g >= 80 && (
            <g stroke={RED} strokeWidth={44} style={{transformOrigin: '590px 760px', transform: `rotate(-6deg) scale(${xs})`}}>
              <path d={P_X1} style={dash(LEN[P_X1], (g - 80) / 2)} />
              <path d={P_X2} style={dash(LEN[P_X2], (g - 82) / 2)} />
            </g>
          )}
        </svg>
      ))}
    </AbsoluteFill>
  );
};

// diagonal paper peel from scene 01 to scene 02 (approved s01-s02 build)
const RECT: [number, number][] = [[0, 0], [1920, 0], [1920, 1080], [0, 1080]];
const clipHalf = (poly: [number, number][], keep: (q: [number, number]) => boolean, C: number) => {
  const out: [number, number][] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ia = keep(a);
    const ib = keep(b);
    if (ia) out.push(a);
    if (ia !== ib) {
      const fa = a[0] + a[1] - C;
      const fb = b[0] + b[1] - C;
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
};

// ---- scenes on the 1672×941 keyframes (1, 9, 4): camera + cutout layers in plate space ----
const SRC_W = 1672;
const SRC_H = 941;
const K = 1920 / SRC_W;
type Cam = [number, number, number, number]; // [frame, zoom, focus x, focus y]
const camAt = (f: number, ks: Cam[]): Cam => {
  if (f <= ks[0][0]) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const [a, b] = [ks[i], ks[i + 1]];
    if (f < b[0]) {
      const t = ez((f - a[0]) / (b[0] - a[0]));
      return [f, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
    }
  }
  return ks[ks.length - 1];
};
const PlateScene: React.FC<{plate: string; f: number; cam: Cam[]; children: React.ReactNode}> = ({plate, f, cam, children}) => {
  const [, z, fx, fy] = camAt(f, cam);
  const s = K * z;
  const x = Math.min(0, Math.max(1920 - SRC_W * s, 960 - fx * s));
  const y = Math.min(0, Math.max(1080 - SRC_H * s, 540 - fy * s));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: DARK}}>
      <div style={abs({left: 0, top: 0, width: SRC_W, height: SRC_H, transformOrigin: '0 0', transform: `translate(${x}px,${y}px) scale(${s})`})}>
        <Img src={src(plate)} style={abs({left: 0, top: 0})} />
        {children}
      </div>
    </AbsoluteFill>
  );
};
const Lay: React.FC<{
  img: string; f: number; seed: number; box?: [number, number]; dx?: number; dy?: number; rot?: number;
  scale?: number; amp?: number; shadow?: boolean;
}> = ({img, f, seed, box, dx = 0, dy = 0, rot = 0, scale = 1, amp = 1.4, shadow}) => {
  const b = boil(S4(f), seed, amp, 0.35);
  return (
    <Img src={src(img)} style={abs({
      left: box?.[0] ?? 0, top: box?.[1] ?? 0, transformOrigin: 'center',
      transform: tf(dx + b.x, dy + b.y, rot + b.r, scale), filter: shadow ? SH_LAYER : undefined,
    })} />
  );
};

// Scenes 03 (1873), 04 (discovery) and 05 (reveal): keyframe 4, one continuous camera.
const Watch: React.FC<{f: number}> = ({f}) => {
  const s4 = CUT_S4 - CUT_S3; // 198
  const s5 = CUT_S5 - CUT_S3; // 516
  const cam: Cam[] = [[0, 1.9, 1010, 200], [s4, 1.75, 980, 210], [s4 + 40, 1.0, 836, 470], [s5, 1.05, 836, 470],
    [s5 + 60, 1.75, 470, 420], [CUT_S6 - CUT_S3, 1.8, 470, 425]];
  const bob = f % 18 < 4 ? -3 : 0; // the watch hangs from the fingers and ticks in place
  const lean = keys(f, [[0, 0], [s4 + 60, -6], [s4 + 64, -12], [s4 + 68, -10]]);
  const dimP = cl((f - (s5 + 110)) / 10);
  return (
    <PlateScene plate="4.webp" f={f} cam={cam}>
      <Lay img="layers/k4_arrow.png" f={f} seed={12} box={[650, 320]} scale={bump(f, s4 + 30)}
        dx={keys(f, [[0, 0], [s4 + 30, 10], [s4 + 32, -4], [s4 + 34, 0]])} />
      <Lay img="layers/k4_watch.png" f={f} seed={11} dy={bob} amp={0.6} shadow />
      <Lay img="layers/k4_maryam.png" f={f} seed={10} dx={lean} amp={1.6} shadow />
      {f < s5 + 4 && <Lab left={985} top={388} size={22}>تصوّر توضيحي</Lab>}
      {/* 03: back to 1873 */}
      <Scraps f={f} items={[{t: 'نرجع لسنة', size: 40, at: 40}, {t: '١٨٧٣', size: 52, at: 46}]}
        left={610} top={45} width={380} height={200} seed={50} out={s4 + 2} />
      {/* 04: something everyone carried */}
      <Scraps f={f} items={[{t: 'شي كان الكل', size: 54, at: s4 + 90}, {t: 'يحمله…', size: 54, at: s4 + 96}]}
        left={70} top={715} width={420} height={210} seed={55} />
      {/* 05: pocket width, red ring, "pocket watch" in the 3.6 s pause */}
      <svg width={SRC_W} height={SRC_H} style={abs({left: 0, top: 0})} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {dimP > 0 && (
          <g stroke={CHALK} strokeWidth={5} style={{filter: CHALK_SH}}>
            <line x1={240} y1={618} x2={240 + 490 * dimP} y2={618} />
            <line x1={240} y1={600} x2={240} y2={636} />
            {dimP >= 1 && <line x1={730} y1={600} x2={730} y2={636} />}
          </g>
        )}
        {f >= s5 + 290 && (
          <path d={P_WATCH_RING} stroke={RED} strokeWidth={9} style={{...dash(LEN[P_WATCH_RING], (f - (s5 + 290)) / 20),
            transformOrigin: '470px 435px', transform: 'rotate(-6deg)'}} />
        )}
      </svg>
      {f >= s5 + 126 && <Lab left={420} top={642} size={18}>عرض الجيب</Lab>}
      <Scraps f={f} items={[{t: 'ساعة جيب', size: 46, at: s5 + 300}]} left={620} top={190} width={330} height={110} seed={60} red />
    </PlateScene>
  );
};

// Scene 06: historical twist on keyframe 1.
const Twist: React.FC<{f: number}> = ({f}) => (
  <PlateScene plate="1.webp" f={f} cam={[[0, 1.0, 836, 470], [CUT_S7 - CUT_S6, 1.08, 1300, 250]]}>
    <Lay img="layers/k1_q3.png" f={f} seed={3} box={[155, 85]} scale={bump(f, 18)} />
    <Lay img="layers/k1_q1.png" f={f} seed={2} box={[785, 55]} scale={bump(f, 10)} />
    <Lay img="layers/k1_ex.png" f={f} seed={5} box={[1460, 380]} scale={bump(f, 40)} />
    <Lay img="layers/k1_q2.png" f={f} seed={4} box={[1435, 600]} scale={bump(f, 26)} />
    <Lay img="layers/k1_maryam.png" f={f} seed={1} amp={1.6} shadow
      dx={keys(f, [[0, -4], [6, 0]])} dy={keys(f, [[0, 6], [6, 0]])} />
    <Scraps f={f} seed={70} out={250} left={1015} top={75} width={570} height={310} items={[
      {t: '١٨٧٣: أربع جيوب', size: 66, at: 30},
      {t: 'والصغير موجود من البداية…', size: 42, at: 40},
      {t: 'في الأمام', size: 42, at: 46},
    ]} />
    <Scraps f={f} seed={75} left={1015} top={75} width={570} height={310} items={[
      {t: '١٩٠١: الجيب الخامس', size: 66, at: 258},
      {t: 'هو الجيب الخلفي الثاني،', size: 42, at: 268},
      {t: 'مب الصغير', size: 42, at: 274},
    ]} />
    {f >= 30 && <Lab left={1110} top={396} size={21}>المصدر: Levi Strauss &amp; Co.</Lab>}
  </PlateScene>
);

// Scene 07: present day on keyframe 9.
const Today: React.FC<{f: number}> = ({f}) => {
  const ph = f % 96; // the phone keeps trying to get in
  return (
    <PlateScene plate="9.webp" f={f} cam={[[0, 1.02, 836, 470], [CUT_S8 - CUT_S7, 1.1, 700, 560]]}>
      <Lay img="layers/k9_ring.png" f={f} seed={9} box={[215, 470]} amp={0.8} scale={bump(f, 60)} />
      <Lay img="layers/k9_arrow.png" f={f} seed={8} box={[290, 120]} scale={bump(f, 40)} />
      <Lay img="layers/k9_phone.png" f={f} seed={7} amp={0.8} shadow
        dy={keys(ph, [[0, 0], [17, 3], [21, -1], [25, 4], [29, 0], [39, 3], [43, -1], [47, 2], [51, 0]])}
        rot={keys(ph, [[0, 0], [17, 0.8], [21, -0.5], [25, 0.9], [29, 0], [39, 0.6], [43, -0.4], [47, 0]])} />
      <Lay img="layers/k9_maryam.png" f={f} seed={6} amp={1.6} shadow />
      <Scraps f={f} seed={80} left={880} top={705} width={730} height={210}
        items={[{t: '١٥٠ سنة…', size: 72, at: 130}, {t: 'والجيب باقي', size: 72, at: 140}]} />
    </PlateScene>
  );
};

// ---- fonts must be ready before a frame is captured ----
const useFontsReady = () => {
  const [handle] = useState(() => delayRender('Loading IBM Plex Sans Arabic'));
  useEffect(() => {
    Promise.all(
      [['ep01/fonts/IBMPlexSansArabic-Bold.ttf', '700'], ['ep01/fonts/IBMPlexSansArabic-Medium.ttf', '500']].map(
        async ([url, weight]) => {
          const face = new FontFace('Plex', `url(${staticFile(url)})`, {weight});
          await face.load();
          (document.fonts as unknown as {add(f: FontFace): void}).add(face);
        },
      ),
    )
      .then(() => continueRender(handle))
      .catch((err) => {
        throw err;
      });
  }, [handle]);
};

export const Episode01: React.FC = () => {
  useFontsReady();
  const F = useCurrentFrame();

  let scene: React.ReactNode;
  if (F < CUT_S3) {
    // scene 01 → peel → scene 02
    const p = ez((F - (CUT_S2 - 15)) / 33);
    const C = (1920 + 1080) * (1 - p) + 2;
    const peeling = p > 0 && p < 1;
    const kept = peeling ? clipHalf(RECT, (q) => q[0] + q[1] <= C, C) : RECT;
    const flap = peeling ? clipHalf(RECT, (q) => q[0] + q[1] > C, C).map(([x, y]) => [C - y, C - x]) : [];
    scene = (
      <>
        {F >= CUT_S2 - 15 && <Phone g={F - CUT_S2} />}
        {F < CUT_S2 + 18 && (
          <AbsoluteFill style={{clipPath: peeling ? `polygon(${kept.map(([x, y]) => `${x}px ${y}px`).join(',')})` : undefined}}>
            <Pocket f={F} />
          </AbsoluteFill>
        )}
        {peeling && (
          <svg width={1920} height={1080} style={abs({left: 0, top: 0})}>
            <defs>
              <linearGradient id="ep01-flap" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F6EEDC" />
                <stop offset=".7" stopColor="#E2D3B4" />
                <stop offset="1" stopColor="#C9B48E" />
              </linearGradient>
            </defs>
            <polygon points={flap.map(([x, y]) => `${x + 18},${y + 22}`).join(' ')} fill="rgba(0,0,0,.35)" style={{filter: 'blur(14px)'}} />
            <polygon points={flap.map(([x, y]) => `${x},${y}`).join(' ')} fill="url(#ep01-flap)" stroke="#FFF8EA" strokeWidth={3} />
          </svg>
        )}
      </>
    );
  } else if (F < CUT_S6) {
    scene = <Watch f={F - CUT_S3} />;
  } else if (F < CUT_S7) {
    scene = <Twist f={F - CUT_S6} />;
  } else if (F < CUT_S8) {
    scene = <Today f={F - CUT_S7} />;
  } else {
    scene = <Pocket f={F - CUT_S8} end />;
  }

  return (
    <AbsoluteFill style={{background: DARK, overflow: 'hidden'}}>
      {scene}
      {[CUT_S3, CUT_S6, CUT_S7, CUT_S8].map((at) => <PaperRip key={at} frame={F} at={at} />)}
      <Audio src={staticFile('ep01/vo.wav')} />
      {['paper', 'stamp', 'phone', 'watch'].map((n) => (
        <Audio key={n} src={staticFile(`ep01/sfx/${n}.wav`)} volume={SFX_GAIN} />
      ))}
    </AbsoluteFill>
  );
};
