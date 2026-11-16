"""Synthesise the episode's sound-design stems (48 kHz mono WAV) into public/sfx/.
Everything is generated from noise and tones — no samples, no credits."""
import os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR
noise = lambda d: rng.standard_normal(int(d * SR))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)
def env(n, a, r, curve=3.0):
    e = np.ones(n); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    tail = np.arange(n - ai) / SR; e[ai:] = np.exp(-curve * tail / max(r, 1e-3)); return e
def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(os.path.join(OUT, name + ".wav"), SR, (x * 32767).astype(np.int16))

# documentary whoosh: filtered noise with a swept band
d = 0.7; t = t_(d); x = noise(d); out = np.zeros_like(x)
for i, (lo, hi) in enumerate([(300, 900), (700, 2200), (1500, 5000)]):
    out += bp(x, lo, hi) * np.sin(np.pi * np.clip(t / d - i * 0.08, 0, 1)) ** 2
save("whoosh", out * np.sin(np.pi * t / d) ** 1.5, 0.7)
# paper lift / rustle: crackly bursts
d = 0.45; x = hp(noise(d), 1200) * (rng.random(int(d * SR)) > 0.6); x = bp(x, 1500, 9000)
save("paper_lift", x * env(len(x), 0.01, 0.35, 2.5), 0.55)
d = 1.0; x = bp(noise(d) * (rng.random(int(d * SR)) > 0.75), 1200, 8000)
save("paper_rustle", x * np.sin(np.pi * t_(d) / d) ** 2, 0.45)
# pin tap: short click + small metallic ring
d = 0.18; t = t_(d); x = bp(noise(d), 2500, 9000) * env(len(t), 0.001, 0.02, 5) + 0.35 * np.sin(2 * np.pi * 3400 * t) * env(len(t), 0.001, 0.08, 5)
save("pin_tap", x, 0.7)
# fabric flick: soft low-mid swish with a flap
d = 0.32; t = t_(d); x = bp(noise(d), 250, 2500) * env(len(t), 0.02, 0.22, 3) * (1 + 0.6 * np.sin(2 * np.pi * 28 * t))
save("fabric_flick", x, 0.6)
# page flip: rising rustle then a slap
d = 0.5; t = t_(d); x = bp(noise(d), 1500, 8000) * np.clip(t / 0.35, 0, 1) ** 2 * (t < 0.36)
slap = lp(noise(d), 1800) * env(len(t), 0.002, 0.06, 6); slap[: int(0.36 * SR)] = 0
save("page_flip", x * 0.7 + slap * 1.2, 0.6)
# file open: card slide + thump
d = 0.6; t = t_(d); slide = bp(noise(d), 600, 4000) * np.sin(np.pi * np.clip(t / 0.45, 0, 1))
thump = np.sin(2 * np.pi * 85 * t) * env(len(t), 0.003, 0.12, 6); thump[: int(0.4 * SR)] = 0
save("file_open", slide * 0.6 + np.roll(thump, 0), 0.7)
# paper rip: dense crackle with rising band
d = 0.55; t = t_(d); cr = noise(d) * (rng.random(int(d * SR)) > 0.4)
x = sum(bp(cr, 800 + 900 * k, 2600 + 1800 * k) * np.clip((t / d) * 3 - k, 0, 1) for k in range(3))
save("paper_rip", x * env(len(t), 0.01, 0.5, 1.8), 0.7)
# stamp hit: low thud + paper smack
d = 0.5; t = t_(d); x = np.sin(2 * np.pi * 70 * t * (1 - 0.3 * t)) * env(len(t), 0.002, 0.25, 5) + 0.6 * bp(noise(d), 500, 5000) * env(len(t), 0.001, 0.05, 6)
save("stamp_hit", x, 0.9)
# light hum: 100 Hz mains + harmonics with slow flutter (2 s loopable)
d = 2.0; t = t_(d); x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(100, 1), (200, .5), (300, .25), (400, .12)])
save("light_hum", x * (0.85 + 0.15 * np.sin(2 * np.pi * 3 * t)) + 0.05 * bp(noise(d), 2000, 6000), 0.35)
# marker scribble: modulated scratchy noise
d = 0.6; t = t_(d); x = bp(noise(d), 2500, 7000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / d)
save("marker_scribble", x, 0.4)
# archival flicker (projector-like clicks) 1 s
d = 1.0; t = t_(d); x = np.zeros(int(d * SR))
for k in range(0, int(d * 24)):
    i = int(k / 24 * SR); x[i:i + 200] += bp(noise(200 / SR), 1500, 6000) * 0.5
save("archive_flicker", x + 0.03 * lp(noise(d), 300), 0.3)
print(sorted(os.listdir(OUT)))
