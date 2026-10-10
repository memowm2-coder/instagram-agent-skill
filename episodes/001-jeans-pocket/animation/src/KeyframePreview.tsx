import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {KeyframeScene} from './KeyframeScene';
import {PaperRip} from './PaperRip';
import {keys, pop} from './motion';

// 10 s preview built only from the approved keyframes 1, 9 and 4.
export const KeyframePreview: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < 107 && <KeyframeScene frame={f} start={0} end={106} plate="1.webp" push={[1, 1.08]} focus={[1150, 600]} layers={[
        {src: 'layers/k1_q3.png', box: [155, 85], motion: (g) => ({scale: pop(g, 18), seed: 3})},
        {src: 'layers/k1_q1.png', box: [785, 55], motion: (g) => ({scale: pop(g, 10), seed: 2})},
        {src: 'layers/k1_ex.png', box: [1460, 380], motion: (g) => ({scale: pop(g, 40), seed: 5})},
        {src: 'layers/k1_q2.png', box: [1435, 600], motion: (g) => ({scale: pop(g, 26), seed: 4})},
        {src: 'layers/k1_maryam.png', motion: (g) => ({dx: keys(g, [[0, -4], [6, 0]]), dy: keys(g, [[0, 6], [6, 0]]), seed: 1, amp: 1.6, shadow: true})},
      ]} />}
      {f >= 107 && f < 207 && <KeyframeScene frame={f} start={107} end={206} plate="9.webp" push={[1.02, 1.1]} focus={[520, 560]} layers={[
        {src: 'layers/k9_ring.png', box: [215, 470], motion: (g) => ({scale: keys(g, [[0, 1], [164, 1.14], [166, 1.06], [168, 0.98], [170, 1]]), seed: 9, amp: 0.8})},
        {src: 'layers/k9_arrow.png', box: [290, 120], motion: (g) => ({scale: pop(g, 116), seed: 8})},
        {src: 'layers/k9_phone.png', motion: (g) => ({
          dy: keys(g, [[107, 0], [124, 3], [128, -1], [132, 4], [136, 0], [146, 3], [150, -1], [154, 2], [158, 0]]),
          rot: keys(g, [[107, 0], [124, 0.8], [128, -0.5], [132, 0.9], [136, 0], [146, 0.6], [150, -0.4], [154, 0]]),
          seed: 7, amp: 0.8, shadow: true})},
        {src: 'layers/k9_maryam.png', motion: () => ({seed: 6, amp: 1.6, shadow: true})},
      ]} />}
      {f >= 207 && <KeyframeScene frame={f} start={207} end={300} plate="4.webp" push={[1, 1.12]} focus={[480, 420]} layers={[
        {src: 'layers/k4_arrow.png', box: [650, 320], motion: (g) => ({dx: keys(g, [[0, 0], [236, 10], [238, -4], [240, 0]]), scale: pop(g, 236), seed: 12})},
        {src: 'layers/k4_watch.png', motion: (g) => ({dy: keys(g, [[207, -4], [226, 0], [240, -3], [244, 0], [258, -3], [262, 0], [276, -3], [280, 0]]), seed: 11, amp: 0.6, shadow: true})},
        {src: 'layers/k4_maryam.png', motion: () => ({seed: 10, amp: 1.6, shadow: true})},
      ]} />}
      <PaperRip frame={f} at={107} />
      <PaperRip frame={f} at={207} />
    </AbsoluteFill>
  );
};
