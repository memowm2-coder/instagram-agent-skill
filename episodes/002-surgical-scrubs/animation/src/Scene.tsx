import React from 'react';
import {AbsoluteFill, Img, Easing, random, staticFile, useVideoConfig} from 'remotion';
import {getLength} from '@remotion/paths';
import {Action, CamKey, Glow, Mark, Piece, Scene, Trace, Pt} from './scenes';

export const PW = 1672, PH = 941, K = 1920 / PW; // plate → frame scale

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// Stop-motion: pieces and Maryam are sampled "on twos" (15 fps feel); the camera stays smooth.
export const onTwos = (frame: number, fps: number) => (Math.floor(frame / 2) * 2) / fps;
const springish = (t: number, w = 15, z = 0.42) => (t <= 0 ? 0 : 1 - Math.exp(-z * w * t) * Math.cos(w * Math.sqrt(1 - z * z) * t));
const decayWave = (t: number, f: number, k: number) => (t <= 0 ? 0 : Math.exp(-k * t) * Math.sin(2 * Math.PI * f * t));
const land = Easing.out(Easing.back(1.5));
const hash = (s: string) => random(s) * Math.PI * 2;

type St = {x: number; y: number; s: number; rot: number; skew: number; lift: number; opacity: number; filter: string[]; jitter: boolean};

// ── pieces ──────────────────────────────────────────────────────────────────
function pieceState(id: string, actions: Action[], t: number): St {
  const st: St = {x: 0, y: 0, s: 1, rot: 0, skew: 0, lift: 0, opacity: 1, filter: [], jitter: false};
  for (const a of actions) {
    const u = t - a.at;
    switch (a.kind) {
      case 'enter': {
        const d = a.dur ?? 0.42, f = a.from ?? {};
        if (u < 0) { st.opacity = 0; break; }
        const k = clamp01(u / d), e = land(k), r = 1 - e;
        st.x += (f.x ?? 0) * r; st.y += (f.y ?? 0) * r; st.rot += (f.r ?? 0) * r;
        st.s *= 1 + ((f.s ?? 1) - 1) * (1 - Easing.out(Easing.cubic)(k));
        st.lift = Math.max(st.lift, 1 - k * k);
        // paper "thump" when it lands
        st.s *= 1 + 0.035 * decayWave(u - d, 3, 7);
        st.jitter = true;
        break;
      }
      case 'exit': {
        if (u < 0) break;
        const d = a.dur ?? 0.35, k = Easing.in(Easing.cubic)(clamp01(u / d)), to = a.to ?? {};
        st.x += (to.x ?? 0) * k; st.y += (to.y ?? 0) * k; st.rot += (to.r ?? 0) * k;
        st.lift = Math.max(st.lift, k); if (k >= 1) st.opacity = 0;
        break;
      }
      case 'lift': {
        if (u < 0) break;
        const d = a.dur ?? 0.6;
        const up = springish(u, 16, 0.45) * (u < d ? 1 : 0) + (u >= d ? 1 - springish(u - d, 14, 0.5) : 0);
        st.s *= 1 + (a.amt ?? 0.08) * up; st.rot += -2 * up * Math.sin(hash(id) + 1); st.y += -10 * up;
        st.lift = Math.max(st.lift, up); st.jitter = true;
        break;
      }
      case 'flick': {
        if (u <= 0) break;
        st.rot += 7 * decayWave(u, 3.2, 4); st.skew += 6 * decayWave(u + 0.04, 3.2, 4);
        st.s *= 1 + 0.06 * Math.exp(-3 * u); st.lift = Math.max(st.lift, 0.7 * Math.exp(-2 * u)); st.jitter = true;
        break;
      }
      case 'snap': {
        if (u <= 0) break;
        st.s *= Math.max(0.9, 1 + 0.35 * Math.exp(-7 * u) * Math.cos(16 * u)); st.lift = Math.max(st.lift, 0.5 * Math.exp(-4 * u));
        break;
      }
      case 'develop': {
        const d = a.dur ?? 0.6, k = Easing.out(Easing.cubic)(clamp01(u / d));
        st.filter.push(`brightness(${1 + 0.9 * (1 - k)}) contrast(${0.6 + 0.4 * k}) sepia(${0.5 * (1 - k)}) blur(${(2.5 * (1 - k)).toFixed(2)}px)`);
        break;
      }
      case 'dim': {
        const k = Easing.inOut(Easing.cubic)(clamp01(u / (a.dur ?? 0.5)));
        if (k > 0) st.filter.push(`saturate(${1 - 0.5 * k}) brightness(${1 - 0.07 * k})`);
        break;
      }
      case 'wobble': {
        if (u <= 0) break;
        const ph = hash(id), amt = a.amt ?? 1;
        st.rot += amt * 0.9 * Math.sin(2 * Math.PI * u / 2.4 + ph); st.y += amt * 2.5 * Math.sin(2 * Math.PI * u / 1.9 + ph * 2);
        st.jitter = true;
        break;
      }
      case 'pulse': {
        if (u > 0) st.s *= 1 + (a.amt ?? 0.02) * (0.5 - 0.5 * Math.cos(2 * Math.PI * u / 1.2));
        break;
      }
    }
  }
  return st;
}

const centroid = (poly: Pt[]): Pt => [poly.reduce((a, p) => a + p[0], 0) / poly.length, poly.reduce((a, p) => a + p[1], 0) / poly.length];

const PieceLayer: React.FC<{src: string; piece: Piece; t: number; frame: number}> = ({src, piece, t, frame}) => {
  const st = pieceState(piece.id, piece.actions, t);
  if (st.opacity <= 0) return null;
  const [cx, cy] = centroid(piece.poly);
  const seed = piece.id + Math.floor(frame / 2);
  const J = st.jitter ? 1 : 0;
  const jx = J * (random(seed + 'x') - 0.5) * 2.2, jy = J * (random(seed + 'y') - 0.5) * 2.2, jr = J * (random(seed + 'r') - 0.5) * 0.6;
  const sh = st.lift;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: st.opacity,
      filter: `drop-shadow(${-3 - 14 * sh}px ${5 + 26 * sh}px ${6 + 22 * sh}px rgba(30,20,10,${0.32 + 0.25 * sh}))`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH,
        backgroundImage: `url(${staticFile(src)})`, backgroundSize: `${PW}px ${PH}px`,
        clipPath: `polygon(${piece.poly.map(([x, y]) => `${x}px ${y}px`).join(',')})`,
        transformOrigin: `${cx}px ${cy}px`,
        transform: `translate(${st.x + jx}px,${st.y + jy}px) rotate(${st.rot + jr}deg) skewX(${st.skew}deg) scale(${st.s})`,
        filter: st.filter.length ? st.filter.join(' ') : undefined}} />
    </div>
  );
};

// ── light ───────────────────────────────────────────────────────────────────
const GlowLayer: React.FC<{g: Glow; t: number; frame: number}> = ({g, t, frame}) => {
  const u = t - g.at;
  if (u < 0 || (g.until !== undefined && t > g.until)) return null;
  const S = g.strength ?? 0.5, step = Math.floor(frame / 2);
  let o = 0;
  if (g.mode === 'pulse') o = S * clamp01(u / 0.4) * (0.65 + 0.35 * Math.sin(2 * Math.PI * u / 1.3));
  if (g.mode === 'flicker') o = S * clamp01(u / 0.25) * (0.55 + 0.45 * random('fl' + g.id + step));
  if (g.mode === 'glare') o = S * (clamp01(u / 0.2) * (0.8 + 0.2 * Math.sin(2 * Math.PI * u / 0.9)) + 0.25 * Math.exp(-8 * u));
  const R = g.r;
  return (
    <div style={{position: 'absolute', left: g.c[0] - R, top: g.c[1] - R, width: 2 * R, height: 2 * R, opacity: o, mixBlendMode: 'screen',
      background: `radial-gradient(circle, rgba(${g.color},0.95) 0%, rgba(${g.color},0.55) 22%, rgba(${g.color},0.18) 48%, rgba(${g.color},0) 70%)`}} />
  );
};

// ── travelling highlight along an existing arrow ────────────────────────────
const TraceLayer: React.FC<{tr: Trace; t: number}> = ({tr, t}) => {
  const len = getLength(tr.d);
  const passes = [tr.at, ...(tr.repeat !== undefined ? [tr.repeat] : [])];
  return (
    <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {passes.map((at, i) => {
        const k = (t - at) / tr.dur;
        if (k < 0 || k > 1.3) return null;
        const head = Easing.inOut(Easing.cubic)(clamp01(k)), dash = len * 0.3, fade = k > 1 ? 1 - (k - 1) / 0.3 : 1;
        return (
          <path key={i} d={tr.d} fill="none" stroke={tr.color ?? '#ffffff'} strokeWidth={tr.width ?? 7} strokeLinecap="round"
            strokeDasharray={`${dash} ${len * 2}`} strokeDashoffset={-(head * (len + dash) - dash)}
            opacity={0.95 * fade} style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,.95))'}} />
        );
      })}
    </svg>
  );
};

// ── hand-drawn chalk marks (circle / underline), drawn on stroke by stroke ──
const markPath = (m: Mark): {d: string; len: number} => {
  const pts: Pt[] = [];
  if (m.kind === 'ellipse') {
    const a0 = -2.2 + random(m.id) * 0.6, turns = 1.12, n = 90, ph = hash(m.id);
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * turns * Math.PI * 2;
      const wob = 1 + 0.035 * Math.sin(3 * a + ph) + 0.02 * Math.sin(7 * a + ph * 2) + 0.05 * (i / n);
      pts.push([m.c[0] + m.rx * wob * Math.cos(a), m.c[1] + m.ry * wob * Math.sin(a) * (1 - 0.04 * Math.cos(a))]);
    }
  } else {
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      pts.push([m.c[0] + m.rx * (1 - 2 * k), m.c[1] + 6 * Math.sin(k * Math.PI * 1.3 + hash(m.id)) + 5 * k]);
    }
  }
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return {d: 'M ' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L '), len};
};

const MarkLayer: React.FC<{m: Mark; t: number}> = ({m, t}) => {
  const u = t - m.at;
  if (u < 0) return null;
  const out = m.until !== undefined ? clamp01((t - m.until) / 0.15) : 0;
  if (out >= 1) return null;
  const {d, len} = markPath(m);
  const k = Easing.inOut(Easing.quad)(clamp01(u / m.dur));
  return (
    <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - out}}>
      <path d={d} fill="none" stroke={m.color} strokeWidth={m.width ?? 8} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - k)}
        style={{filter: 'drop-shadow(1px 3px 2px rgba(0,0,0,.35))'}} />
    </svg>
  );
};

// ── camera ──────────────────────────────────────────────────────────────────
const camAt = (keys: CamKey[], t: number): {s: number; c: Pt} => {
  if (t <= keys[0].t) return {s: keys[0].s, c: keys[0].c};
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const e = b.ease === 'back' ? Easing.out(Easing.back(1.6)) : b.ease === 'out' ? Easing.out(Easing.cubic)
        : b.ease === 'whip' ? Easing.inOut(Easing.poly(4)) : Easing.inOut(Easing.sin);
      const k = e(clamp01((t - a.t) / (b.t - a.t)));
      return {s: a.s + (b.s - a.s) * k, c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k]};
    }
  }
  const z = keys[keys.length - 1];
  return {s: z.s, c: z.c};
};

// ── Maryam: the cutout from the same plate, pinned at her base like a paper puppet ─────────
const MaryamLayer: React.FC<{sc: Scene; t: number; frame: number}> = ({sc, t, frame}) => {
  const [bx, by, bw, bh] = sc.maryamBox;
  const ox = bx + bw * 0.5, oy = by + bh;
  const sway = sc.sway ?? 0;
  let x = 0, y = 0, rot = sway * 0.7 * Math.sin(2 * Math.PI * t / 2.8), s = 1 + 0.006 * Math.sin(2 * Math.PI * t / 2.2), move = 0, op = 1;
  for (const a of sc.maryamActs) {
    const u = t - a.at;
    if (a.kind === 'enter') {
      const f = a.from ?? {}, d = 0.45;
      if (u < 0) { op = 0; continue; }
      const k = clamp01(u / d), r = 1 - land(k);
      x += (f.x ?? 0) * r; y += (f.y ?? 0) * r; rot += (f.r ?? 0) * r; move = Math.max(move, 1 - k);
      s *= 1 + 0.03 * decayWave(u - d, 2.5, 6);
    }
    if (a.kind === 'present') { // leans in and pushes forward, holds, eases back halfway
      if (u <= 0) continue;
      const amt = a.amt ?? 1, inn = springish(u, 12, 0.45), back = u > 0.9 ? 0.5 * springish(u - 0.9, 8, 0.7) : 0;
      const k = inn - back; s *= 1 + 0.045 * amt * k; rot += -2.6 * amt * k; x += -14 * amt * k; move = Math.max(move, 0.5 * Math.exp(-3 * u));
    }
    if (a.kind === 'nod') { y += 9 * decayWave(u, 2.2, 3); rot += 0.8 * decayWave(u, 2.2, 3); }
    if (a.kind === 'lean') { if (u > 0) { const k = springish(u, 10, 0.5); rot += 2.2 * (a.amt ?? 1) * k; } }
    if (a.kind === 'react') { const k = springish(u, 14, 0.35); s *= 1 - 0.01 * k + 0.02; rot += 1.4 * decayWave(u, 1.6, 2.5); y += -10 * decayWave(u, 1.6, 2.5); }
  }
  const step = Math.floor(frame / 2);
  const jx = (random('mx' + step) - 0.5) * 1.6, jy = (random('my' + step) - 0.5) * 1.6;
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, filter: `drop-shadow(${-8 - 16 * move}px ${12 + 24 * move}px ${14 + 20 * move}px rgba(25,18,10,${0.4 + 0.15 * move}))`}}>
      <Img src={staticFile(sc.maryam)} style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH,
        transformOrigin: `${ox}px ${oy}px`, transform: `translate(${x + jx}px,${y + jy}px) rotate(${rot}deg) scale(${s})`}} />
    </div>
  );
};

export const SceneView: React.FC<{sc: Scene; t: number; frame: number; showZones?: boolean}> = ({sc, t, frame, showZones}) => {
  const {fps} = useVideoConfig();
  const ts = onTwos(frame, fps) - (frame / fps - t); // scene-local time, sampled on twos
  const cam = camAt(sc.cam, t), prev = camAt(sc.cam, t - 1 / fps);
  const s = Math.max(1.02, cam.s);
  // camera speed → motion blur on whips
  const v = Math.hypot(cam.c[0] - prev.c[0], cam.c[1] - prev.c[1]) * K * s + Math.abs(cam.s - prev.s) * 1400;
  const blur = Math.min(5, Math.max(0, (v - 8) * 0.06));
  const step = Math.floor(frame / 2);
  const cjx = (random('cx' + step) - 0.5) * 1.6, cjy = (random('cy' + step) - 0.5) * 1.6;
  // keep the frame covered: clamp the focus so the scaled plate never shows an edge
  const minX = (PW / 2) / s, minY = (PH / 2) / s;
  const fx = Math.min(PW - minX, Math.max(minX, cam.c[0])), fy = Math.min(PH - minY, Math.max(minY, cam.c[1]));
  // centre the focus point on screen (blend toward plain zoom-about-point at low zoom)
  const tx = 960 - fx * K * s + cjx, ty = 540 - fy * K * s + cjy;
  const baseSrc = sc.clean ?? sc.plate, pieceSrc = sc.board ?? sc.plate;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#EFE6D4'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transformOrigin: '0 0',
        transform: `translate(${tx}px,${ty}px) scale(${K * s})`, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
        <Img src={staticFile(baseSrc)} style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH}} />
        {sc.pieces.map((p) => <PieceLayer key={p.id} src={pieceSrc} piece={p} t={ts} frame={frame} />)}
        {sc.glows.filter((g) => !g.front).map((g) => <GlowLayer key={g.id} g={g} t={ts} frame={frame} />)}
        {sc.traces.map((tr) => <TraceLayer key={tr.id} tr={tr} t={t} />)}
        <MaryamLayer sc={sc} t={ts} frame={frame} />
        {sc.marks.map((m) => <MarkLayer key={m.id} m={m} t={t} />)}
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
