// Shared stop-motion helpers for غريب عجيب.
export const step = (f: number) => f - (f % 2); // paper animates on twos
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// Hand-made "boil": a new tiny offset every 4 frames.
export const boil = (f: number, seed: number, amp = 1.4, rot = 0.35) => {
  const k = Math.floor(f / 4);
  return {x: (hash(k, seed) - 0.5) * 2 * amp, y: (hash(k, seed + 9) - 0.5) * 2 * amp, r: (hash(k, seed + 17) - 0.5) * 2 * rot};
};
// Stepped hold keys: [[frame, value], ...]
export const keys = (f: number, ks: [number, number][]) => {
  let v = ks[0][1];
  for (const [k, x] of ks) if (f >= k) v = x;
  return v;
};
export const pop = (g: number, at: number) => keys(g, [[0, 1], [at, 1.22], [at + 2, 1.1], [at + 4, 0.97], [at + 6, 1]]);
export const easeInOut = (t: number) => {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};
