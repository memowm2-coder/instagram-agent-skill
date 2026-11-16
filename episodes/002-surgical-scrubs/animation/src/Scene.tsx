import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, random, staticFile, useVideoConfig} from 'remotion';
import {getLength} from '@remotion/paths';
import {Action, CamKey, Glow, Piece, Scene, Trace, Pt} from './scenes';

export const PW = 1672, PH = 941, K = 1920 / PW; // plate → frame scale

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// Stop-motion: piece motion is sampled "on twos" (15 fps feel) while the camera stays smooth.
export const onTwos = (frame: number, fps: number) => (Math.floor(frame / 2) * 2) / fps;
const springish = (t: number, w = 15, z = 0.42) => (t <= 0 ? 0 : 1 - Math.exp(-z * w * t) * Math.cos(w * Math.sqrt(1 - z * z) * t));
const decayWave = (t: number, f: number, k: number) => (t <= 0 ? 0 : Math.exp(-k * t) * Math.sin(2 * Math.PI * f * t));

type PieceState = {s: number; rot: number; skew: number; lift: number; filter: string[]; jitter: boolean};

function pieceState(actions: Action[], t: number): PieceState {
  const st: PieceState = {s: 1, rot: 0, skew: 0, lift: 0, filter: [], jitter: false};
  for (const a of actions) {
    const u = t - a.at;
    switch (a.kind) {
      case 'lift': {
        const sp = springish(u);
        st.s *= 1 + (a.amt ?? 0.03) * sp; st.lift = Math.max(st.lift, clamp01(sp));
        st.rot += -0.9 * decayWave(u, 1.6, 3.5); st.jitter = st.jitter || u > 0;
        break;
      }
      case 'flick': {
        if (u <= 0) break;
        st.rot += 2.6 * decayWave(u, 3.2, 4.5); st.skew += 3 * decayWave(u + 0.04, 3.2, 4.5);
        st.s *= 1 + 0.035 * Math.exp(-3 * u) + 0.012; st.lift = Math.max(st.lift, 0.6); st.jitter = true;
        break;
      }
      case 'snap': {
        if (u <= 0) break;
        st.s *= Math.max(1, 1 + 0.22 * Math.exp(-7 * u) * Math.cos(16 * u)) + 0.01; st.lift = Math.max(st.lift, 0.5);
        break;
      }
      case 'develop': {
        const d = a.dur ?? 0.6, k = Easing.out(Easing.cubic)(clamp01(u / d));
        st.filter.push(`brightness(${1 + 0.9 * (1 - k)}) contrast(${0.6 + 0.4 * k}) sepia(${0.5 * (1 - k)}) blur(${(2.5 * (1 - k)).toFixed(2)}px)`);
        break;
      }
      case 'dim': {
        const k = Easing.inOut(Easing.cubic)(clamp01(u / (a.dur ?? 0.5)));
        if (k > 0) st.filter.push(`saturate(${1 - 0.5 * k}) brightness(${1 - 0.06 * k})`);
        break;
      }
      case 'pulse': {
        if (u > 0) st.s *= 1 + (a.amt ?? 0.01) * (0.5 - 0.5 * Math.cos(2 * Math.PI * u / 1.4));
        break;
      }
    }
  }
  return st;
}

const centroid = (poly: Pt[]): Pt => [poly.reduce((a, p) => a + p[0], 0) / poly.length, poly.reduce((a, p) => a + p[1], 0) / poly.length];

const PieceLayer: React.FC<{plate: string; piece: Piece; t: number; frame: number}> = ({plate, piece, t, frame}) => {
  const st = pieceState(piece.actions, t);
  const [cx, cy] = centroid(piece.poly);
  const seed = piece.id + Math.floor(frame / 2);
  const jx = st.jitter ? (random(seed + 'x') - 0.5) * 1.6 : 0;
  const jy = st.jitter ? (random(seed + 'y') - 0.5) * 1.6 : 0;
  const jr = st.jitter ? (random(seed + 'r') - 0.5) * 0.35 : 0;
  // scale ≥ 1 about an interior point always covers the original pixels underneath
  const s = Math.max(1, st.s) + (st.jitter ? 0.006 : 0);
  const sh = st.lift;
  return (
    <div style={{position: 'absolute', inset: 0,
      filter: sh > 0.01 ? `drop-shadow(${-4 * sh}px ${9 * sh}px ${10 * sh}px rgba(30,20,10,${0.45 * sh}))` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH,
        backgroundImage: `url(${staticFile(plate)})`, backgroundSize: `${PW}px ${PH}px`,
        clipPath: `polygon(${piece.poly.map(([x, y]) => `${x}px ${y}px`).join(',')})`,
        transformOrigin: `${cx}px ${cy}px`,
        transform: `translate(${jx}px,${jy}px) rotate(${st.rot + jr}deg) skewX(${st.skew}deg) scale(${s})`,
        filter: st.filter.length ? st.filter.join(' ') : undefined}} />
    </div>
  );
};

const GlowLayer: React.FC<{g: Glow; t: number; frame: number}> = ({g, t, frame}) => {
  const u = t - g.at;
  if (u < 0 || (g.until !== undefined && t > g.until)) return null;
  const S = g.strength ?? 0.5;
  let o = 0;
  const step = Math.floor(frame / 2);
  if (g.mode === 'pulse') o = S * clamp01(u / 0.4) * (0.75 + 0.25 * Math.sin(2 * Math.PI * u / 1.8));
  if (g.mode === 'flicker') o = S * clamp01(u / 0.25) * (0.7 + 0.3 * random('fl' + g.id + step));
  if (g.mode === 'glare') o = S * (clamp01(u / 0.2) * (0.8 + 0.2 * Math.sin(2 * Math.PI * u / 0.9)) + 0.25 * Math.exp(-8 * u));
  const R = g.r;
  return (
    <div style={{position: 'absolute', left: g.c[0] - R, top: g.c[1] - R, width: 2 * R, height: 2 * R, opacity: o,
      mixBlendMode: 'screen',
      background: `radial-gradient(circle, rgba(${g.color},0.95) 0%, rgba(${g.color},0.55) 22%, rgba(${g.color},0.18) 48%, rgba(${g.color},0) 70%)`}} />
  );
};

const TraceLayer: React.FC<{tr: Trace; t: number}> = ({tr, t}) => {
  const len = getLength(tr.d);
  const passes = [tr.at, ...(tr.repeat !== undefined ? [tr.repeat] : [])];
  return (
    <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {passes.map((at, i) => {
        const k = (t - at) / tr.dur;
        if (k < 0 || k > 1.25) return null;
        const head = Easing.inOut(Easing.cubic)(clamp01(k));
        const dash = len * 0.28;
        const fade = k > 1 ? 1 - (k - 1) / 0.25 : 1;
        return (
          <path key={i} d={tr.d} fill="none" stroke={tr.color ?? '#ffffff'} strokeWidth={tr.width ?? 7} strokeLinecap="round"
            strokeDasharray={`${dash} ${len * 2}`} strokeDashoffset={-(head * (len + dash) - dash)}
            opacity={0.9 * fade} style={{filter: 'drop-shadow(0 0 6px rgba(255,255,255,.9))'}} />
        );
      })}
    </svg>
  );
};

const camAt = (keys: CamKey[], t: number): {s: number; c: Pt} => {
  if (t <= keys[0].t) return {s: keys[0].s, c: keys[0].c};
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const e = b.ease === 'back' ? Easing.out(Easing.back(1.6)) : b.ease === 'out' ? Easing.out(Easing.cubic) : Easing.inOut(Easing.sin);
      const k = e(clamp01((t - a.t) / (b.t - a.t)));
      return {s: a.s + (b.s - a.s) * k, c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k]};
    }
  }
  const z = keys[keys.length - 1];
  return {s: z.s, c: z.c};
};

// Maryam: the cutout from the same plate. Motion stays within ~6 px at her extremities, so the
// approved plate underneath never shows a double edge; a soft shadow sells the paper-cutout depth.
const MaryamLayer: React.FC<{sc: Scene; t: number; frame: number; camS: number}> = ({sc, t, frame, camS}) => {
  const [bx, by, bw, bh] = sc.maryamBox;
  const ox = bx + bw * 0.5, oy = by + bh * 0.62;
  let s = 1 + 0.0035 * Math.sin(2 * Math.PI * t / 3.2), rot = 0, dy = 0;
  for (const a of sc.maryamActs) {
    const u = t - a.at;
    if (a.kind === 'present') { const sp = springish(u, 11, 0.5); s += 0.008 * sp; rot += -0.3 * decayWave(u, 1.2, 2.2); }
    if (a.kind === 'nod') { dy += 3.5 * decayWave(u, 2.2, 3); }
    if (a.kind === 'react') { const sp = springish(u, 14, 0.35); s += -0.004 * sp + 0.006; rot += 0.35 * decayWave(u, 1.6, 2.5); dy += -3 * decayWave(u, 1.6, 2.5); }
  }
  s += 0.12 * (camS - 1) * 0.08; // a touch more zoom than the plate: parallax depth
  const step = Math.floor(frame / 2);
  const jx = (random('mx' + step) - 0.5) * 1.0, jy = (random('my' + step) - 0.5) * 1.0;
  return (
    <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(-6px 10px 12px rgba(25,18,10,0.38))'}}>
      <Img src={staticFile(sc.maryam)} style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH,
        transformOrigin: `${ox}px ${oy}px`, transform: `translate(${jx}px,${jy + dy}px) rotate(${rot}deg) scale(${Math.max(1, s)})`}} />
    </div>
  );
};

export const SceneView: React.FC<{sc: Scene; t: number; frame: number; showZones?: boolean}> = ({sc, t, frame, showZones}) => {
  const {fps} = useVideoConfig();
  const ts = onTwos(frame, fps) - (frame / fps - t); // scene-local time, sampled on twos
  const cam = camAt(sc.cam, t);
  const step = Math.floor(frame / 2);
  const cjx = (random('cx' + step) - 0.5) * 1.2, cjy = (random('cy' + step) - 0.5) * 1.2;
  const s = Math.max(1.02, cam.s);
  // scale about the focus point c (identity at s = 1), plus a tiny hand-held weave
  const tx = cam.c[0] * K * (1 - s) + cjx, ty = cam.c[1] * K * (1 - s) + cjy;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#EFE6D4'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformOrigin: '0 0',
        transform: `translate(${tx}px,${ty}px) scale(${K * s})`}}>
        <Img src={staticFile(sc.plate)} style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH}} />
        {sc.pieces.map((p) => <PieceLayer key={p.id} plate={sc.plate} piece={p} t={ts} frame={frame} />)}
        {sc.glows.filter((g) => !g.front).map((g) => <GlowLayer key={g.id} g={g} t={ts} frame={frame} />)}
        {sc.traces.map((tr) => <TraceLayer key={tr.id} tr={tr} t={t} />)}
        <MaryamLayer sc={sc} t={ts} frame={frame} camS={s} />
        {sc.glows.filter((g) => g.front).map((g) => <GlowLayer key={g.id} g={g} t={ts} frame={frame} />)}
        {showZones && sc.textSafe.map((z, i) => (
          <div key={i} style={{position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, border: '4px dashed #D2342B',
            background: 'rgba(210,52,43,0.08)', color: '#D2342B', fontSize: 26, fontFamily: 'sans-serif', padding: 8}}>{`TEXT SAFE · ${z.label}`}</div>
        ))}
        {sc.texts.filter((x) => t >= x.at && t < x.at + x.dur).map((x, i) => {
          const z = sc.textSafe[x.zone];
          return (
            <div key={'tx' + i} style={{position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, display: 'flex', alignItems: 'center',
              justifyContent: 'center', direction: 'rtl', fontFamily: 'PlexArabic', fontSize: x.size ?? 64, color: '#1C1B19', textAlign: 'center', lineHeight: 1.2}}>{x.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const interp = interpolate;
