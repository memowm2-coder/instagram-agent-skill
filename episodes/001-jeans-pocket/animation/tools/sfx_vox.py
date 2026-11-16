# SFX stems for the Vox cut (src/EpisodeVox.tsx), timed to its camera moves and annotations.
# Writes public/vox/sfx/{paper,stamp,whoosh,watch,pen}.wav (48 kHz mono, full length).
# EpisodeVox plays them -9 dB under Maryam's VO. No music.
import wave, math, random, struct, os
SR = 48000; N = int(SR * 2573 / 30); random.seed(11)
T = {k: [0.0] * N for k in ['paper', 'stamp', 'whoosh', 'watch', 'pen']}
fr = lambda f: f / 30
def add(tr, t, d, fn):
  b = T[tr]; s = int(t * SR)
  for i in range(int(d * SR)):
    if 0 <= s + i < N: b[s + i] += fn(i / SR, d)
def lp(a):
  st = [0.0]
  def n(): st[0] += a * (random.uniform(-1, 1) - st[0]); return st[0]
  return n
def whoosh(f0, f1, a=.5):
  d = max(.25, (f1 - f0) / 30 + .15); n1, n2 = lp(.05), lp(.5)
  add('whoosh', fr(f0) - .05, d, lambda x, D: a * (n1() * 2.2 + n2() * .25) * math.sin(math.pi * x / D) ** 2)
def slide(f, d=.35, a=.28): n = lp(.3); add('paper', fr(f), d, lambda x, D: a * n() * math.sin(math.pi * x / D))
def pen(f, d=.4, a=.18): n = lp(.85); add('pen', fr(f), d, lambda x, D: a * n() * (.6 + .4 * math.sin(2 * math.pi * 23 * x)) * math.sin(math.pi * x / D))
def pop(f, a=.22): n = lp(.8); add('stamp', fr(f), .07, lambda x, D: a * (n() * .5 + math.sin(2 * math.pi * 420 * x)) * math.exp(-x * 45))
def stamp(f, a=.7):
  n = lp(.9); add('stamp', fr(f), .45, lambda x, D: a * math.sin(2 * math.pi * 62 * x) * math.exp(-x * 9)); add('stamp', fr(f), .06, lambda x, D: .45 * n() * (1 - x / D))
def knock(f, a=.3): add('paper', fr(f), .1, lambda x, D: a * math.sin(2 * math.pi * 140 * x) * math.exp(-x * 40))
def tick(f, a=.18, hz=1900): add('watch', fr(f), .03, lambda x, D: a * math.sin(2 * math.pi * hz * x) * math.exp(-x * 170))
# camera moves (whips loud, slow pans soft)
for f0, f1, a in [(200, 214, .55), (378, 394, .3), (556, 574, .6), (700, 724, .25), (896, 912, .6), (1120, 1150, .25),
                  (1328, 1344, .7), (1344, 1394, .25), (1466, 1488, .45), (1624, 1640, .6), (1780, 1800, .25), (1850, 1872, .45),
                  (1906, 1960, .22), (2140, 2166, .5), (2312, 2392, .45), (2418, 2472, .4)]:
  whoosh(f0, f1, a)
# paper strips / cards landing
for f in (26, 236, 322, 518, 566, 700, 904, 1490, 1940, 2000, 2164): slide(f)
# pen: rings, highlighter sweeps, strokes
for f, d in [(140, .3), (146, .3), (150, .6), (352, .35), (495, .4), (507, .4), (556, .3), (604, .3), (724, .4), (752, .4), (822, .45),
             (850, .45), (872, .5), (944, .3), (948, .3), (1040, .5), (1218, .5), (1452, .4), (1520, .3), (1584, .45), (1792, .5),
             (1858, .8), (1912, 1.4), (1966, .7), (2054, .3), (2214, .3), (2218, .3), (2524, .35)]:
  pen(f, d)
# pops and stamps
for f in (34, 52, 70, 92, 112, 244, 714, 740, 858, 978, 994, 1046, 1130, 1252, 1632, 1856, 1880, 1950, 2478): pop(f)
stamp(487); stamp(598, .6); stamp(1437, .85); stamp(1735, .6); stamp(2440, .75)
# the phone tries the pocket
knock(415, .35)
for k in (440, 452, 462, 470): knock(k, .25)
# the watch: ticking through the pause, louder as it lowers; softer after it lands
for i, f in enumerate(range(1336, 1437, 15)): tick(f, .08 + .02 * i)
for f in range(1452, 1620, 15): tick(f, .1)
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'vox', 'sfx'); os.makedirs(out, exist_ok=True)
for k, b in T.items():
  w = wave.open(os.path.join(out, f'{k}.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
  w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 30000)) for v in b)); w.close()
