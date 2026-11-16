import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, Easing} from 'remotion';

// ── Stop-motion timing ────────────────────────────────────────────────
// Paper and characters move on threes (10 fps) inside the 30 fps render.
export const step = (f: number, n = 3) => Math.floor(f / n) * n;
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// Hand-made "boil": a fresh tiny offset every 4 frames.
export const boil = (f: number, seed: number, amp = 1.6, rot = 0.45) => {
  const k = Math.floor(f / 4);
  return {
    x: (hash(k, seed) - 0.5) * 2 * amp,
    y: (hash(k, seed + 9) - 0.5) * 2 * amp,
    r: (hash(k, seed + 17) - 0.5) * 2 * rot,
  };
};
// Stepped hold keys: [[frame, value], ...]
export const keys = (f: number, ks: [number, number][]) => {
  let v = ks[0][1];
  for (const [k, x] of ks) if (f >= k) v = x;
  return v;
};
export const clamp = (t: number) => Math.max(0, Math.min(1, t));
export const ease = (f: number, a: number, b: number, from = 0, to = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

// Stepped pop: 0 → overshoot → settle (stamp-like).
export const pop = (f: number, at: number) =>
  keys(f, [[-99999, 0], [at, 1.28], [at + 3, 0.92], [at + 6, 1.04], [at + 9, 1]]);

const src = (p: string) => staticFile(p);

// ── Sticker: any transparent cutout, with paper shadow + boil ────────
export type In = 'pop' | 'drop' | 'slideR' | 'slideL' | 'none';
export const Sticker: React.FC<{
  f: number; s: string; x: number; y: number; w: number; h?: number; rot?: number; at?: number; mode?: In;
  seed?: number; amp?: number; dx?: number; dy?: number; extraRot?: number; scale?: number; shadow?: boolean;
  filter?: string; z?: number; origin?: string; opacity?: number; clip?: string;
}> = ({f, s, x, y, w, h, rot = 0, at = 0, mode = 'pop', seed = 1, amp = 1.6, dx = 0, dy = 0, extraRot = 0, scale = 1, shadow = true, filter, z, origin = 'center', opacity = 1, clip}) => {
  if (f < at && mode !== 'none') return null;
  const g = step(f);
  const b = boil(g, seed, amp);
  let sc = 1, tx = 0, ty = 0;
  if (mode === 'pop') sc = pop(g, at);
  if (mode === 'drop') ty = keys(g, [[at, -700], [at + 3, -260], [at + 6, -40], [at + 9, 12], [at + 12, 0]]);
  if (mode === 'slideR') tx = keys(g, [[at, 1400], [at + 3, 640], [at + 6, 120], [at + 9, -18], [at + 12, 0]]);
  if (mode === 'slideL') tx = keys(g, [[at, -1400], [at + 3, -640], [at + 6, -120], [at + 9, 18], [at + 12, 0]]);
  const sh = shadow ? 'drop-shadow(-10px 14px 10px rgba(20,16,10,.42)) ' : '';
  return (
    <Img
      src={src(s)}
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z, opacity,
        transformOrigin: origin, clipPath: clip,
        transform: `translate(${tx + dx + b.x}px,${ty + dy + b.y}px) rotate(${rot + extraRot + b.r}deg) scale(${sc * scale})`,
        filter: sh + (filter ?? ''),
      }}
    />
  );
};

// ── Arabic paper strip with words stamped in, RTL, + marker highlight ─
export const Strip: React.FC<{
  f: number; words: string[]; x: number; y: number; w: number; at: number; gap?: number; size?: number;
  hl?: number[]; hlColor?: string; bg?: string; color?: string; rot?: number; seed?: number; red?: number[];
}> = ({f, words, x, y, w, at, gap = 5, size = 92, hl = [], hlColor = '#F2D14B', bg = '#FBF6EA', color = '#1C1B19', rot = -1.5, seed = 40, red = []}) => {
  const g = step(f, 2);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', flexWrap: 'wrap', direction: 'rtl', justifyContent: 'center', gap: '10px 14px', transform: `rotate(${rot}deg)`}}>
      {words.map((wd, i) => {
        const a = at + i * gap;
        if (f < a) return <span key={i} style={{visibility: 'hidden', fontSize: size, fontFamily: 'Plex', fontWeight: 700, padding: '4px 22px 14px'}}>{wd}</span>;
        const b = boil(g, seed + i, 1, 0.5);
        const sc = keys(g, [[a, 1.35], [a + 2, 1.08], [a + 4, 0.96], [a + 6, 1]]);
        const isRed = red.includes(i);
        const hp = hl.includes(i) ? clamp((f - a - 8) / 8) : 0;
        return (
          <span key={i} style={{
            position: 'relative', fontFamily: 'Plex', fontWeight: 700, fontSize: size, lineHeight: 1.05,
            color: isRed ? '#FBF6EA' : color, background: isRed ? '#A8291F' : bg, padding: '4px 22px 14px',
            transform: `translate(${b.x}px,${b.y}px) rotate(${(i % 2 ? 2.2 : -2.6) + b.r}deg) scale(${sc})`,
            filter: 'drop-shadow(-5px 7px 5px rgba(0,0,0,.35))', direction: 'rtl', whiteSpace: 'nowrap',
          }}>
            {hp > 0 && (
              <span style={{position: 'absolute', right: 8, bottom: 10, height: '42%', width: `calc(${hp * 100}% - 16px)`, background: hlColor, opacity: 0.85, mixBlendMode: 'multiply', borderRadius: 4, transform: 'skewX(-8deg)'}} />
            )}
            <span style={{position: 'relative'}}>{wd}</span>
          </span>
        );
      })}
    </div>
  );
};

// ── Small typewriter label on a paper tab ────────────────────────────
export const Label: React.FC<{f: number; text: string; x: number; y: number; at: number; size?: number; rot?: number; dark?: boolean; seed?: number}> = ({f, text, x, y, at, size = 30, rot = -2, dark, seed = 70}) => {
  if (f < at) return null;
  const b = boil(step(f), seed, 1, 0.3);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, fontFamily: 'Plex', fontWeight: 600, fontSize: size, direction: 'rtl',
      color: dark ? '#F6F0E3' : '#1C1B19', background: dark ? '#1C1B19' : '#F6F0E3', padding: '6px 16px 8px',
      border: dark ? 'none' : '2.5px solid #1C1B19', transform: `translate(${b.x}px,${b.y}px) rotate(${rot + b.r}deg) scale(${pop(step(f), at)})`,
      filter: 'drop-shadow(-4px 6px 4px rgba(0,0,0,.3))', whiteSpace: 'nowrap',
    }}>{text}</div>
  );
};

// ── SVG stroke that draws on ─────────────────────────────────────────
export const Draw: React.FC<{d: string; p: number; color?: string; w?: number; dash?: string; len?: number}> = ({d, p, color = '#1C1B19', w = 6, dash, len = 3000}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={dash ?? len} strokeDashoffset={dash ? 0 : len * (1 - clamp(p))} opacity={dash ? clamp(p * 3) : 1} />
);

// ── Film / print texture over everything ─────────────────────────────
export const Grain: React.FC<{f: number}> = ({f}) => {
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1920" height="1080" style={{position: 'absolute', mixBlendMode: 'multiply', opacity: 0.22}}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} /><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .3  0 0 0 1.4 -.3" /></filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,20,10,.38) 100%)'}} />
      <AbsoluteFill style={{background: '#FFF4DA', opacity: 0.025 + (hash(seed, 3) - 0.5) * 0.02, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

// Halftone dots (newsprint) for archival boards.
export const Halftone: React.FC<{opacity?: number; size?: number}> = ({opacity = 0.18, size = 9}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'multiply',
    backgroundImage: 'radial-gradient(circle, #3A2A18 30%, transparent 33%)', backgroundSize: `${size}px ${size}px`}} />
);

// Marker scribble ellipse (hand-drawn ring) path around a box.
export const ringPath = (cx: number, cy: number, rx: number, ry: number, wob = 10) => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2.15 - 0.4;
    const r = 1 + Math.sin(i * 1.7) * 0.02;
    pts.push(`${(cx + Math.cos(t) * rx * r + Math.sin(i) * wob * 0.2).toFixed(1)},${(cy + Math.sin(t) * ry * r - i * 0.25).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
};
