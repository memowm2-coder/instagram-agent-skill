import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {boil, easeInOut, keys} from './motion';

// EP01 · first 5 s. Locked plate = scene01 (fingers on the lip cloned out from the same lip),
// Maryam's original-photo cutout rises from behind the pocket in three stop-motion steps.
const S4 = (f: number) => f - (f % 4); // 7.5 fps character/object stepping
const DEPTH: Record<string, number> = {plate: 1, mag: 1.05, card: 1.03, mar: 1.06, pocket: 1.09, phone: 1.12, patch: 1.1, deco: 1.12, svg: 1.1};
const PHONE: [number, [number, number, number]][] = [[0, [1700, -900, 24]], [100, [1500, -620, 18]], [104, [1150, -380, 10]], [108, [870, -140, 4]], [112, [650, 40, 0]], [116, [465, 170, 0]], [120, [465, 300, 0]], [122, [465, 280, -2]], [124, [465, 295, 2]], [126, [520, 90, -14]], [130, [700, -120, -28]], [134, [960, -200, -38]], [138, [1180, -80, -50]], [142, [1300, 180, -64]], [146, [1330, 260, -70]]];

const tf = (x: number, y: number, r = 0, s = 1) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const dash = (len: number, t: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - Math.max(0, Math.min(1, t)))});

export const Opening5s: React.FC = () => {
  const f = useCurrentFrame();
  const g = S4(f);
  let cs = keys(f, [[0, 1.035], [5, 1.025], [10, 1.015], [15, 1.008], [20, 1]]), fx = 960, fy = 540;
  if (f >= 100) { const t = easeInOut((f - 100) / 50); cs = 1 + 0.32 * t; fx = 960 - 300 * t; fy = 540 + 280 * t; }
  const drift = Math.sin((f / 150) * Math.PI) * 6;
  const layer = (name: string, children: React.ReactNode) => {
    const s = 1 + (cs - 1) * DEPTH[name];
    return <div style={{position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${fx - fx * s + drift * (DEPTH[name] - 1) * 8}px,${fy - fy * s}px) scale(${s})`}}>{children}</div>;
  };
  const pop = (at: number) => keys(f, [[0, 0], [at, 1.25], [at + 4, 0.95], [at + 8, 1]]);
  let my = keys(f, [[0, 470], [21, 300], [25, 275], [33, 90], [37, 70], [45, -150], [49, -125], [53, -135]]);
  let mr = keys(f, [[0, 0], [21, -3], [33, 2], [45, -1.5], [53, 0]]);
  if (f >= 124) { my += keys(f, [[124, -28], [128, -10], [132, -18], [136, 0]]); mr += keys(f, [[124, 3], [132, -2], [136, 0]]); }
  const b = (id: number, a = 1.5) => boil(g, id, a);
  let pv = PHONE[0][1]; for (const [k, v] of PHONE) if (f >= k) pv = v;
  const img = (src: string, style: React.CSSProperties) => <Img src={staticFile(`op5/${src}`)} style={{position: 'absolute', ...style}} />;
  const shadow = 'drop-shadow(-8px 12px 9px rgba(0,0,0,.4))';
  return (
    <AbsoluteFill style={{background: '#1C1B19', overflow: 'hidden'}}>
      {layer('plate', img('plate_clean.png', {left: 0, top: 0}))}
      {layer('mag', img('magnifier.png', {left: 0, top: 85, transform: tf(b(3, 2).x, b(3, 2).y, b(3, 2).r)}))}
      {layer('card', img('back_card.png', {left: 315, top: 25, width: 860, height: 600, filter: shadow, transform: tf(b(4, 1).x, b(4, 1).y, -2 + b(4, 1).r)}))}
      {layer('mar', img('maryam_paper_cutout_cream_outline.png', {left: 270, top: 60, width: 940, filter: shadow, transform: tf(b(1).x, my + b(1).y, mr + b(1).r)}))}
      {layer('pocket', img('pocket_front.png', {left: 0, top: 0, filter: shadow, transform: tf(b(5, 1.2).x, b(5, 1.2).y)}))}
      {layer('phone', f >= 100 && img('smartphone_unbranded_alpha.png', {left: 0, top: 0, width: 400, filter: shadow, transform: tf(pv[0] + b(9, 1).x, pv[1] + b(9, 1).y, pv[2] + b(9, 1).r)}))}
      {layer('patch', img('small_patch.png', {left: 0, top: 0, transform: tf(b(6, 1.2).x, b(6, 1.2).y)}))}
      {layer('deco', <>
        {img('qmark.png', {left: 70, top: 80, filter: shadow, transform: tf(b(7).x, b(7).y, b(7).r, pop(24))})}
        {img('ticks_l.png', {left: 470, top: 140, transform: `scale(${pop(40)})`})}
        {img('ticks_r.png', {left: 975, top: 320, transform: `scale(${pop(56)})`})}
        {img('torn_paper_blank_alpha.png', {left: 1060, top: 110, width: 720, filter: shadow, transform: tf(keys(f, [[0, 1200], [75, 820], [79, 420], [83, 120], [87, -20], [91, 0]]) + b(8, 1).x, b(8, 1).y, 3 + b(8, 1).r)})}
      </>)}
      {layer('svg', <svg width={1920} height={1080} style={{position: 'absolute', filter: 'drop-shadow(2px 3px 0 rgba(28,27,25,.85))'}} fill="none" stroke="#F6F0E3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M660 700 C 990 690 1020 770 990 870 C 960 975 420 985 345 900 C 285 830 330 712 660 700" strokeWidth={7} style={dash(1900, (f - 78) / 18)} />
        <path d="M1400 480 C 1320 640 1180 720 1040 760" strokeWidth={9} style={dash(560, (f - 92) / 12)} />
        <path d="M1072 724 L1040 760 L1086 772" strokeWidth={9} style={dash(110, (f - 104) / 4)} />
        {f >= 110 && <g strokeWidth={4}><line x1={368} y1={1000} x2={368 + 594 * Math.min(1, (f - 110) / 10)} y2={1000} /><line x1={368} y1={980} x2={368} y2={1020} /><line x1={962} y1={980} x2={962} y2={1020} /></g>}
      </svg>)}
    </AbsoluteFill>
  );
};
