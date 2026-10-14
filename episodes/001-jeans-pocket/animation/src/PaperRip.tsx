import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {step} from './motion';

// Torn-paper wipe (right → left, stepped on twos) using paper texture cut from keyframe 1.
export const PaperRip: React.FC<{frame: number; at: number; half?: number}> = ({frame, at, half = 12}) => {
  const edge = useMemo(() => {
    let sd = 5; const R = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const e: string[] = []; for (let y = 0; y <= 1080; y += 16) e.push(`${(R() * 60).toFixed(1)}px ${y}px`);
    return `polygon(${e.join(',')}, 2700px 1080px, 2700px 0px)`;
  }, []);
  if (frame < at - half || frame > at + half) return null;
  const t = (step(frame) - (at - half)) / (2 * half);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 0, width: 2700, height: 1080, left: 1920 - (1920 + 2700) * t, filter: 'drop-shadow(-18px 0 16px rgba(0,0,0,.5))'}}>
        <Img src={staticFile('layers/paper.png')} style={{width: 2700, height: 1080, clipPath: edge}} />
      </div>
    </AbsoluteFill>
  );
};
