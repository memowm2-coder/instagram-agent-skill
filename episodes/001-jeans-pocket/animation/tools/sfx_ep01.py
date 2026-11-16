# SFX stems for the Remotion EP01 (src/Episode01.tsx), timed to its cutout moves.
# Same synthesis as full/project/sfx.py. Writes public/ep01/sfx/{paper,stamp,phone,watch}.wav
# (48 kHz mono, full episode length); Episode01 plays them -9 dB under the VO. No music.
import wave, math, random, struct, os
SR = 48000; DUR = 2573 / 30; N = int(SR * DUR); random.seed(9)
tracks = {k: [0.0] * N for k in ['paper', 'stamp', 'phone', 'watch']}
def add(tr, t, d, fn):
  b = tracks[tr]; s = int(t * SR)
  for i in range(int(d * SR)):
    if 0 <= s + i < N: b[s + i] += fn(i / SR, d)
def lpn():
  st = [0.0]
  def n(a): st[0] += a * (random.uniform(-1, 1) - st[0]); return st[0]
  return n
def slide(t, d=.4, a=.3): n = lpn(); add('paper', t, d, lambda x, D: a * n(.3) * math.sin(math.pi * x / D))
def tear(t, d=.7): n = lpn(); add('paper', t, d, lambda x, D: .55 * n(.6) * (1 - x / D) * (1 if random.random() < .7 else .2))
def stamp(t, a=.7):
  n = lpn(); add('stamp', t, .4, lambda x, D: a * math.sin(2 * math.pi * 68 * x) * math.exp(-x * 10)); add('stamp', t, .05, lambda x, D: .4 * n(.9) * (1 - x / D))
def pop(t, a=.25): n = lpn(); add('stamp', t, .07, lambda x, D: a * (n(.8) * .5 + math.sin(2 * math.pi * 420 * x)) * math.exp(-x * 45))
def knock(t, a=.35): add('phone', t, .1, lambda x, D: a * math.sin(2 * math.pi * 140 * x) * math.exp(-x * 40))
def boing(t, f0, f1, a): add('phone', t, .28, lambda x, D: a * math.sin(2 * math.pi * (f0 + (f1 - f0) * x / D) * x) * math.exp(-x * 7))
def tick(t, a=.2): add('watch', t, .03, lambda x, D: a * math.sin(2 * math.pi * 1800 * x) * math.exp(-x * 160))
fr = lambda f: f / 30
# S1 · pocket (0)
for f in (21, 33, 45): slide(fr(f), .18, .3)
for f in (24, 40, 56): pop(fr(f))
slide(fr(60), .35)
for i in range(5): pop(fr(78 + i * 6))
slide(fr(96), .7, .12); slide(fr(120), .3, .15)
# peel to S2
tear(fr(222), 1.0)
# S2 · phone (237)
o = 237; slide(fr(o + 20), .4)
for k in (36, 40, 44, 48, 52): knock(fr(o + k))
for k in (40, 48): pop(fr(o + k))
boing(fr(o + 56), 180, 520, .3); boing(fr(o + 64), 230, 600, .22); knock(fr(o + 72), .3)
stamp(fr(o + 80))
# rips
for c in (522, 1437, 1908, 2313): tear(fr(c - 10))
# S3-S5 · keyframe 4 (522)
o = 522; pop(fr(o + 40)); pop(fr(o + 46)); slide(fr(o + 200), .3)
o = 720; pop(fr(o + 30), .3); pop(fr(o + 90)); pop(fr(o + 96)); slide(fr(o + 60), .2, .15)
for k in range(722, 1437, 18): tick(fr(k), .2 if k < 1038 else .12)
o = 1038; slide(fr(o + 110), .3, .15); pop(fr(o + 126), .2); stamp(fr(o + 290), .5); pop(fr(o + 300), .3)
# S6 · keyframe 1 (1437)
o = 1437
for k in (10, 18, 26, 40): pop(fr(o + k), .3)
for k in (30, 40, 46): pop(fr(o + k))
slide(fr(o + 250), .3)
for k in (258, 268, 274): pop(fr(o + k))
# S7 · keyframe 9 (1908)
o = 1908; pop(fr(o + 40), .3); pop(fr(o + 60), .3)
for base in range(0, 405, 96):
  for k in (17, 25, 39, 47): knock(fr(o + base + k), .12)
for k in (130, 140): pop(fr(o + k))
# S8 · loop (2313)
o = 2313; slide(fr(o + 20), .35); stamp(fr(o + 40), .7)
for k in (200, 212, 224): slide(fr(o + k), .18, .3)
slide(fr(o + 232), .35)
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'ep01', 'sfx')
for k, b in tracks.items():
  w = wave.open(os.path.join(out, f'{k}.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
  w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 30000)) for v in b)); w.close()
