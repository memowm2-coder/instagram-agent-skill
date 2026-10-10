# ملف ٠٠١ · Keyframe animation (locked approved art)

`ghareeb_ajeeb_keyframes_preview_10s.mp4`: 1920×1080, 30 fps, 10 s. Built **only**
from approved keyframes 1, 9 and 4 (uploaded at 1672×941, scaled ×1.148).

| Time | Keyframe | Motion |
| --- | --- | --- |
| 0.0–3.5 s | 1 (pointing + pocket) | push-in, Maryam layer settles + boils, question marks and the red marks stamp-pop one by one |
| 3.5 s | — | paper rip (texture cut from keyframe 1) |
| 3.6–6.9 s | 9 (phone) | push to pocket, arrow pops, phone layer jiggles (trying to get in), red ellipse stamps |
| 6.9 s | — | paper rip |
| 6.9–10 s | 4 (watch) | push to watch, hand + watch bob, arrow nudges, clock-tick SFX |

**Layers** (`public/layers/`): extracted from the same images with `tools/layers.py`:
traced polygons with a 3–4 px feather (the sticker layers) and soft ellipses (the marks).
No pixel is generated or redrawn, including Maryam's face.

**Two builds of the same animation:**
- `src/` is Remotion + React + TypeScript (`KeyframeScene`, `PaperRip`, `motion.ts`).
  **Not yet run**, because the environment blocks the npm registry. `npm i && npm run preview` once it's open.
- `preview-scene.html` + `tools/frames.js` is the identical motion rendered in Chromium,
  which is how the MP4 was produced.

SFX are synthesised placeholders (`tools/sfx2.py`).

---

## EP01 first 5 s (asset pack v1): `ghareeb_ajeeb_ep01_first5s.mp4`

1920×1080, 30 fps, 5.0 s. Remotion composition `Opening5s` (`src/Opening5s.tsx`); identical
Chromium build `opening5s-scene.html`. Layers in `public/op5/` (made by `tools/op_layers.py`).

| Time | What moves |
| --- | --- |
| 0–0.7 s | Stepped camera settle (6 fps), magnifier and paper boil |
| 0.7–1.8 s | Maryam (original-photo cutout, cream outline) rises from behind the pocket lip in **three steps** (f21, f33, f45), each with a small overshoot |
| 0.8–1.9 s | Question mark and red ticks stamp in (layers cut from the plate) |
| 2.5–3.0 s | Blank torn-paper card slides in from the right (stepped, no text) |
| 2.6–3.6 s | SVG ring draws around the small pocket, SVG arrow draws in, dimension line across the pocket mouth |
| 3.3–5 s | Camera pushes to the small pocket; the unbranded phone steps in, drops into the pocket, jams, bounces out; Maryam reacts with a jolt |

**No duplicate Maryam:** her original figure in the plate is covered by a torn card cut
from the plate's own blank paper; the plate's fingers on the pocket lip were cloned out
with denim from the same lip. **Limitation:** small cloning seams are visible on the lip
stitching at x≈340 and x≈870 when you look closely.
