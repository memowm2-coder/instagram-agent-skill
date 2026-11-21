import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS, SCENES, Scene} from './scenes';
import {SceneView} from './Scene';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const W = 1920, H = 1080;

// jagged tear line (top → bottom) for the paper rip, seeded so it is stable across frames
const tearPoints = (seed: string, x0: number) => {
  const pts: [number, number][] = [];
  for (let y = -20; y <= H + 40; y += 36) pts.push([x0 + (random(seed + y) - 0.5) * 70 + (y / H) * 120, y]);
  return pts;
};

const Exit: React.FC<{sc: Scene; p: number; children: React.ReactNode}> = ({sc, p, children}) => {
  if (p <= 0) return <>{children}</>;
  if (p >= 1) return null;
  if (sc.exit === 'fileOpen') {
    // RTL file cover: the scene swings open on its right-hand spine, revealing the next page
    const e = Easing.in(Easing.cubic)(p);
    return (
      <AbsoluteFill style={{perspective: 2600}}>
        <AbsoluteFill style={{transformOrigin: '100% 50%', transform: `rotateY(${-105 * e}deg)`, backfaceVisibility: 'hidden',
          boxShadow: `0 0 ${80 * e}px rgba(0,0,0,${0.5 * e})`}}>
          {children}
          <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${0.35 * e}), rgba(0,0,0,0) 70%)`}} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (sc.exit === 'rip') {
    const e = Easing.in(Easing.quad)(p);
    const pts = tearPoints('rip' + sc.id, 1000);
    const left = [[-50, -50], ...pts, [-50, H + 50]], right = [[W + 50, -50], ...pts, [W + 50, H + 50]];
    const poly = (a: number[][]) => `polygon(${a.map(([x, y]) => `${x}px ${y}px`).join(',')})`;
    const edge = pts.map(([x, y]) => `${x},${y}`).join(' ');
    const half = (pp: number[][], tf: string, key: string) => (
      <AbsoluteFill key={key} style={{transform: tf, transformOrigin: key === 'L' ? '0% 100%' : '100% 0%', filter: `drop-shadow(0 12px 18px rgba(0,0,0,${0.45 * clamp01(p * 3)}))`}}>
        <AbsoluteFill style={{clipPath: poly(pp)}}>{children}</AbsoluteFill>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <polyline points={edge} fill="none" stroke="#F1E7D3" strokeWidth={12} strokeLinejoin="round" />
          <polyline points={edge} fill="none" stroke="rgba(120,95,60,.35)" strokeWidth={2} strokeDasharray="3 5" />
        </svg>
      </AbsoluteFill>
    );
    return (
      <>
        {half(left, `translate(${-900 * e}px, ${60 * e}px) rotate(${-6 * e}deg)`, 'L')}
        {half(right, `translate(${1000 * e}px, ${-140 * e}px) rotate(${9 * e}deg)`, 'R')}
      </>
    );
  }
  if (sc.exit === 'stopJump') {
    if (p > 0.5) return null;
    const j = Math.floor(p * 6);
    return <AbsoluteFill style={{transform: `translate(${(j % 2 ? -1 : 1) * 14}px, ${j * 6}px) rotate(${(j % 2 ? 1 : -1) * 0.6}deg)`}}>{children}</AbsoluteFill>;
  }
  if (sc.exit === 'diagramWipe') {
    // a dashed technical line sweeps right→left and wipes the scene away behind it
    const e = Easing.inOut(Easing.cubic)(p), X = W * (1 - e);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{clipPath: `inset(0 ${W - X}px 0 0)`}}>{children}</AbsoluteFill>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <line x1={X} y1={-10} x2={X} y2={H + 10} stroke="#1C1B19" strokeWidth={3} strokeDasharray="14 10" />
          <circle cx={X} cy={H * 0.5} r={16} fill="none" stroke="#1C1B19" strokeWidth={3} />
          <line x1={X - 26} y1={H * 0.5} x2={X + 26} y2={H * 0.5} stroke="#1C1B19" strokeWidth={3} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (sc.exit === 'pinSnap') {
    // the pin pops: the whole sheet drops off the board, swinging from its top-right corner
    const e = Easing.in(Easing.quad)(p);
    return <AbsoluteFill style={{transformOrigin: '100% 0%', transform: `rotate(${-28 * e}deg) translateY(${H * 1.1 * e * e}px)`,
      filter: `drop-shadow(-10px 30px 30px rgba(0,0,0,${0.5 * e}))`}}>{children}</AbsoluteFill>;
  }
  if (sc.exit === 'archivalReveal') {
    // flash to sepia, then the sheet slides up like a card pulled from the file
    const sep = clamp01(p / 0.35), e = Easing.in(Easing.cubic)(clamp01((p - 0.3) / 0.7));
    return <AbsoluteFill style={{transform: `translateY(${-H * 1.05 * e}px) rotate(${-2 * e}deg)`, filter: `sepia(${sep}) brightness(${1 + 0.25 * sep * (1 - e)}) drop-shadow(0 30px 30px rgba(0,0,0,${0.5 * e}))`}}>{children}</AbsoluteFill>;
  }
  if (sc.exit === 'slide') {
    const e = Easing.in(Easing.cubic)(p);
    return <AbsoluteFill style={{transform: `translateX(${W * 1.05 * e}px) rotate(${3 * e}deg)`, filter: `drop-shadow(-20px 0 30px rgba(0,0,0,${0.5 * e}))`}}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{opacity: 1 - p}}>{children}</AbsoluteFill>;
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.16}}>
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 97} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={W} height={H} filter="url(#g)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(42,26,10,0) 58%, rgba(42,26,10,0.30) 100%)'}} />
  </AbsoluteFill>
);

export const Episode: React.FC<{showZones?: boolean}> = ({showZones}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tGlobal = frame / fps;
  const visible = SCENES.map((sc, i) => {
    const prevExit = i > 0 ? SCENES[i - 1].exitDur : 0;
    return {sc, start: sc.from - prevExit, end: sc.to};
  }).filter((v) => tGlobal >= v.start && tGlobal < v.end);
  return (
    <AbsoluteFill style={{backgroundColor: '#EFE6D4'}}>
      <style>{`@font-face{font-family:PlexArabic;src:url(${staticFile('fonts/IBMPlexSansArabic-Bold.ttf')});}`}</style>
      {[...visible].reverse().map(({sc}) => {
        const p = clamp01((tGlobal - (sc.to - sc.exitDur)) / sc.exitDur);
        return (
          <AbsoluteFill key={sc.id}>
            <Exit sc={sc} p={p}><SceneView sc={sc} t={tGlobal - sc.from} frame={frame} showZones={showZones} /></Exit>
          </AbsoluteFill>
        );
      })}
      <Grain frame={frame} />
      {SCENES.flatMap((sc) => sc.sfx.map((s, i) => {
        const from = Math.round((sc.from + s.t) * FPS);
        const dur = Math.round((s.dur ?? 1.5) * FPS);
        return (
          <Sequence key={sc.id + i} from={from} durationInFrames={dur} layout="none">
            <Audio src={staticFile(`sfx/${s.src}.wav`)} volume={s.vol ?? 0.5} loop={s.loop} />
          </Sequence>
        );
      }))}
    </AbsoluteFill>
  );
};

// reference sheet: all 8 plates with their text-safe zones
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1C1B19', display: 'flex', flexWrap: 'wrap', alignContent: 'center'}}>
    {SCENES.map((sc) => (
      <div key={sc.id} style={{width: 480, height: 270, position: 'relative', overflow: 'hidden'}}>
        <div style={{width: 1920, height: 1080, transform: 'scale(0.25)', transformOrigin: '0 0'}}>
          <SceneView sc={{...sc, maryamActs: [], pieces: [], glows: [], traces: []}} t={0} frame={0} showZones />
        </div>
        <div style={{position: 'absolute', left: 8, top: 6, color: '#fff', fontFamily: 'sans-serif', fontSize: 18}}>{sc.id}</div>
      </div>
    ))}
  </AbsoluteFill>
);
