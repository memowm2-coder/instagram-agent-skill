import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {boil, easeInOut, step} from './motion';

const SRC_W = 1672, SRC_H = 941, K = 1920 / SRC_W;

export type LayerMotion = {dx?: number; dy?: number; rot?: number; scale?: number; seed: number; amp?: number; shadow?: boolean};
export type Layer = {src: string; box?: [number, number]; motion: (f: number) => LayerMotion};

// One locked keyframe (the approved PNG) + layers extracted from that same image.
export const KeyframeScene: React.FC<{
  frame: number; start: number; end: number; plate: string;
  push: [number, number]; focus: [number, number]; layers: Layer[];
}> = ({frame, start, end, plate, push, focus, layers}) => {
  const t = easeInOut((frame - start) / (end - start));
  const s = K * (push[0] + (push[1] - push[0]) * t);
  const cx = Math.min(0, Math.max(1920 - SRC_W * s, 960 - focus[0] * s * t - (1 - t) * (SRC_W * s - 1920) / 2));
  const cy = Math.min(0, Math.max(1080 - SRC_H * s, 540 - focus[1] * s * t - (1 - t) * (SRC_H * s - 1080) / 2));
  const g = step(frame);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#1C1B19'}}>
      <div style={{position: 'absolute', width: SRC_W, height: SRC_H, transformOrigin: '0 0', transform: `translate(${cx}px,${cy}px) scale(${s})`}}>
        <Img src={staticFile(plate)} style={{position: 'absolute', left: 0, top: 0}} />
        {layers.map((l, i) => {
          const m = l.motion(g);
          const b = boil(g, m.seed, m.amp ?? 1.4);
          return (
            <Img key={i} src={staticFile(l.src)} style={{
              position: 'absolute', left: l.box?.[0] ?? 0, top: l.box?.[1] ?? 0, transformOrigin: 'center',
              transform: `translate(${(m.dx ?? 0) + b.x}px,${(m.dy ?? 0) + b.y}px) rotate(${(m.rot ?? 0) + b.r}deg) scale(${m.scale ?? 1})`,
              filter: m.shadow ? 'drop-shadow(-6px 9px 7px rgba(0,0,0,.35))' : undefined,
            }} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
