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
