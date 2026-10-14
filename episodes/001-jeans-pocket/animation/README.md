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
  Installed and checked with `npm install` (Remotion 4.0.242); `npm run preview` renders the 10 s test.
- `preview-scene.html` + `tools/frames.js` is the identical motion rendered in Chromium,
  which is how the MP4 was produced.

---

## EP01 full episode in Remotion: `src/Episode01.tsx`

`npm install && npm run ep01` renders `out/ghareeb_ajeeb_EP01_remotion_1920x1080.mp4`
(1920×1080, 30 fps, 2573 frames = 85.8 s, H.264 CRF 16 + AAC).

- A port of `full/project/episode.html`, the approved 85.7 s cut. Same scene table, camera moves,
  hold keys, boil offsets, stepped stop motion, and paper-tear wipes. `render(frame)` became
  React as a function of `useCurrentFrame()`.
- Assets are in `public/ep01/` (copied from `full/project/a/`, the approved paper cutouts and
  transparent PNGs; fonts are IBM Plex Sans Arabic Bold and Medium).
- Audio: the original Maryam VO (`public/ep01/vo.wav`, extracted from the approved clean VO cut,
  so it is unchanged apart from one AAC decode and encode) at full level. The four SFX stems in
  `public/ep01/sfx/` at −9 dB under it. **No music.**
- Check: frames 0–2572 compared against the approved MP4 (see the verification notes in the commit).

**Delivered file:** `ghareeb_ajeeb_ep01_remotion_1920x1080.mp4` (71 MB, H.264 CRF 23 + AAC re-encoded from the
CRF 16 `npm run ep01` output, which was 259 MB and over GitHub's limit).

Edit the timing in `Episode01.tsx` only, not in the HTML source. The HTML stays as the approved reference.

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

---

## v2: Scene 01 refined + Scene 02 (`s01-s02-scene.html`, global frames 0–299)

| File | Frames |
| --- | --- |
| `ghareeb_ajeeb_ep01_scene01_5s.mp4` | 0–149 (Scene 01, peel begins at 4.5 s) |
| `ghareeb_ajeeb_ep01_scene02_5s.mp4` | 150–299 (peel completes, Scene 02) |
| `ghareeb_ajeeb_ep01_s01_s02_10s.mp4` | 0–299 continuous |

**Scene 01 changes:** three distinct stepped rises with −3°, +2.5°, −2° tilt (7.5 fps holds);
editable title «ليش الجينز فيه جيب صغير؟» in IBM Plex Sans Arabic Bold, each word its own
paper scrap stamped in RTL order (live text, browser-shaped); the ring around the tiny pocket
draws progressively as its own SVG stroke (3.2–4.0 s); the phone has moved to Scene 02;
a diagonal paper peel starts at 4.5 s and finishes at 5.6 s.

**Scene 02:** locked plate `scene02_approved_full_frame.png`. The plate's phone and hand are
covered by a torn card cut from the plate's own blank paper (so Maryam's arm reads as tucked
behind paper); Maryam (thinking pose from this plate) is a separate layer that reacts; the
unbranded phone asset descends, jams at the pocket mouth (behind the extracted pocket front),
bounces out and lands; the red ✗ stamps the pocket (disproved belief, Bible R5).

**Remotion:** `src/Opening5s.tsx` still holds the previous 5 s version. The v2 timeline exists
only as `s01-s02-scene.html` (same `render(frame)` model), because npm is blocked in this
environment and the Remotion port couldn't be compiled or tested.
