import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {B1, B2, B3, B4, B5, B6, B7} from './boards';
import {Grain, Sticker} from './kit';

// Scene cut points (frames @30fps) = natural pauses detected in Maryam's voiceover.
export const CUTS = [0, 237, 522, 720, 1038, 1437, 1908, 2313, 2571];
export const DURATION = 2571;
const SPAN = 2400; // distance between boards on the collage table
const T = 14;      // half-length of each fly-over transition

const fonts = `
@font-face{font-family:Plex;src:url(${staticFile('fonts/IBMPlexSansArabic-Bold.ttf')});font-weight:700}
@font-face{font-family:Plex;src:url(${staticFile('fonts/IBMPlexSansArabic-SemiBold.ttf')});font-weight:600}
@font-face{font-family:Plex;src:url(${staticFile('fonts/IBMPlexSansArabic-Medium.ttf')});font-weight:500}`;

const BOARDS = [B1, B2, B3, B4, B5, B6, B7, B1];

// Camera across the giant collage: boards laid right → left (Arabic reading direction).
const camera = (f: number) => {
  let pos = 0, zoom = 1, tilt = 0;
  for (let i = 1; i < CUTS.length - 1; i++) {
    const c = CUTS[i];
    if (f >= c + T) pos = i;
    else if (f > c - T) {
      const t = (f - (c - T)) / (2 * T);
      pos = i - 1 + Easing.inOut(Easing.cubic)(t);
      zoom = 1 - 0.42 * Math.sin(Math.PI * t);
      tilt = Math.sin(Math.PI * t) * (i % 2 ? -3 : 3);
      return {pos, zoom, tilt};
    }
  }
  // gentle documentary push inside each board
  let i = 0;
  while (i < CUTS.length - 2 && f >= CUTS[i + 1]) i++;
  const p = (f - CUTS[i]) / (CUTS[i + 1] - CUTS[i]);
  zoom = interpolate(p, [0, 1], [1.0, 1.06]);
  return {pos, zoom, tilt};
};

// Scraps scattered on the table between boards, seen during fly-overs.
const TableScraps: React.FC<{f: number}> = ({f}) => (
  <>
    {Array.from({length: 7}).map((_, i) => {
      const x = -(i + 1) * SPAN + 1920 + 30;
      const pieces = ['tape1', 'redstrip', 'letter', 'bluestrip', 'tag', 'lined', 'denimstrip'];
      return (
        <React.Fragment key={i}>
          <Sticker f={f} s={`st/${pieces[i]}.png`} x={x + 20} y={180} w={420} rot={(i % 2 ? 1 : -1) * 70} mode="none" seed={100 + i} />
          <Sticker f={f} s={`st/${pieces[(i + 3) % 7]}.png`} x={x + 80} y={640} w={360} rot={(i % 2 ? -1 : 1) * 80} mode="none" seed={120 + i} />
        </React.Fragment>
      );
    })}
  </>
);

export const Episode: React.FC<{sfx?: boolean}> = ({sfx = true}) => {
  const f = useCurrentFrame();
  const {pos, zoom, tilt} = camera(f);
  let cur = 0;
  while (cur < CUTS.length - 2 && f >= CUTS[cur + 1]) cur++;
  return (
    <AbsoluteFill style={{background: '#3B2A1C'}}>
      <style>{fonts}</style>
      {/* table texture */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 40%, #5A4330 0%, #3B2A1C 70%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '960px 540px',
        transform: `scale(${zoom}) rotate(${tilt}deg) translateX(${pos * SPAN}px)`}}>
        <TableScraps f={f} />
        {BOARDS.map((B, i) => {
          if (Math.abs(i - pos) > 1.2) return null;
          const lf = Math.min(f - CUTS[i], CUTS[i + 1] - CUTS[i] - 1);
          return (
            <div key={i} style={{position: 'absolute', left: -i * SPAN, top: 0, width: 1920, height: 1080, overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,.55)'}}>
              <B f={Math.max(lf, -1)} len={CUTS[i + 1] - CUTS[i]} loop={i === 7} />
            </div>
          );
        })}
      </div>
      <Grain f={f} />
      <Audio src={staticFile('vo.m4a')} />
      {sfx && ['paper', 'stamp', 'phone', 'watch'].map((k) => <Audio key={k} src={staticFile(`sfx/${k}.wav`)} volume={0.35} />)}
    </AbsoluteFill>
  );
};
