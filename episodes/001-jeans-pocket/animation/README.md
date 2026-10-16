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
(1920×1080, 30 fps, 2573 frames = 85.8 s). The committed `ghareeb_ajeeb_ep01_remotion_1920x1080.mp4`
is that render re-encoded to H.264 CRF 23 so it fits under GitHub's 100 MB file limit.

Built **only on the approved storyboard plates** and the paper cutouts extracted from them.
Every moving piece is its own cutout layer, stepped on fours (stop motion). On-screen text
sits on paper scraps over the plates' blank torn-paper cards.

| Scene | Frames | Plate | What moves |
| --- | --- | --- | --- |
| 01 Mystery | 0–237 | `op5/plate_clean` | Maryam rises from the pocket in 3 steps; ?, ticks, torn card, title words; ring + arrow; push to the small pocket |
| 02 Modern problem | 237–522 | `op10/s2_plate` | diagonal paper peel in; phone drops, jams, bounces out; «حتى الجوال… ما يدخل!»; red ✗ |
| 03 1873 | 522–720 | keyframe 4 (close on the sepia man) | «نرجع لسنة ١٨٧٣», labelled «تصوّر توضيحي» |
| 04 Discovery | 720–1038 | keyframe 4 (full) | camera pulls back; watch ticks in the fingers; arrow stamps; Maryam leans; «شي كان الكل يحمله…» |
| 05 Reveal | 1038–1437 | keyframe 4 (close on the watch) | pocket-width line; red ring + «ساعة جيب» in the 3.6 s VO pause |
| 06 Twist | 1437–1908 | keyframe 1 | ? marks stamp; «١٨٧٣: أربع جيوب…», then «١٩٠١: الجيب الخامس…»; source label |
| 07 Today | 1908–2313 | keyframe 9 | phone keeps trying the pocket; ring + arrow stamp; «١٥٠ سنة… والجيب باقي» |
| 08 Loop | 2313–2573 | `op5/plate_clean` | logo on the torn card; Maryam sinks back in 3 steps = frame 0 |

Paper rips (`PaperRip`, texture cut from keyframe 1) at 522, 1437, 1908 and 2313.

Audio: Maryam's original VO (`public/ep01/vo.wav`, from the approved clean VO cut) at full level, plus
SFX stems retimed to these moves (`tools/sfx_ep01.py` → `public/ep01/sfx/`) at −9 dB. **No music.**
