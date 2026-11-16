# EP02 · ليش ملابس العمليات خضراء أو زرقاء؟ — Remotion animation

Animates the **8 approved storyboard PNGs as master keyframes**. No artwork is generated or redrawn:
every moving layer is cut from the approved plate's own pixels, and Maryam is the mask cut from the same image.

**Status:** the 10 s preview (`ghareeb_ajeeb_scrubs_preview.mp4`, scenes 01–02 + the rip into 03) is waiting for
approval of the movement. Scenes 03–08 have their timing, camera and safe zones in the config (`status: 'base-only'`);
they get their full animation pass, and `ghareeb_ajeeb_scrubs_full.mp4` gets rendered, only after the preview is approved.

## Rerender
```bash
npm install                 # Remotion 4.0.242
npm run prepare-layers      # copies storyboard/ + layers/ into public/, writes src/layers.json
npm run sfx                 # synthesises the sound-design stems into public/sfx/
npm run preview             # → out/ghareeb_ajeeb_scrubs_preview.mp4 (300 frames)
npm run full                # → out/ghareeb_ajeeb_scrubs_full.mp4  (1710 frames, after approval)
npm run safezones           # → out/safezones.png, the text-safe zones on all 8 plates
npm run studio              # live preview / scrubbing
```

## Files
| Path | What it is |
| --- | --- |
| `src/scenes.ts` | **Scene configuration**: timing, camera keys, pieces, glows, traces, Maryam acts, SFX cues, exit transition, text-safe zones, optional text layers |
| `src/Scene.tsx` | Scene renderer: camera, plate, cut pieces, glows, traces, Maryam layer |
| `src/Episode.tsx` | Timeline, transitions (file open, paper rip, stop-motion jump, slide), grain/vignette, audio |
| `src/layers.json` | Generated asset manifest (plate, cutout and Maryam bounding box per scene) |
| `tools/prepare_layers.py` | Copies plates/cutouts into `public/` and writes the manifest |
| `tools/make_sfx.py` | Sound design: whoosh, paper lift/rustle, pin tap, fabric flick, page flip, file open, rip, stamp, light hum, marker scribble, archive flicker |

## Asset manifest (`public/`)
| Scene | Time | Plate | Maryam cutout |
| --- | --- | --- | --- |
| 01 | 0:00–0:05 | `plates/01_medical_scrubs_transformation_collage.png` | `layers/01_maryam.png` |
| 02 | 0:05–0:10 | `plates/02_archival_medicine_collage_with_presenter.png` | `layers/02_maryam.png` |
| 03 | 0:10–0:16 | `plates/03_surgical_light_collage_portrait.png` | `layers/03_maryam.png` |
| 04 | 0:16–0:23 | `plates/04_vision_science_collage_with_medical_presenter.png` | `layers/04_maryam.png` |
| 05 | 0:23–0:30 | `plates/05_color_analysis_scrub_style_collage.png` | `layers/05_maryam.png` |
| 06 | 0:30–0:38 | `plates/06_balancing_scrubs_strain_to_comfort.png` | `layers/06_maryam.png` |
| 07 | 0:38–0:47 | `plates/07_forensic_scrub_evidence_board_reveal.png` | `layers/07_maryam.png` |
| 08 | 0:47–0:57 | `plates/08_surgical_scrubs_collage_explainer.png` | `layers/08_maryam.png` |

All plates are 1672×941 and are drawn at ×1.1483 to fill 1920×1080. Config coordinates are plate pixels.

## How layers are separated (masks)
- **Maryam**: `rembg` (isnet-general-use) on the plate, cropped to the presenter's side. The largest connected component
  is kept, and holes smaller than 2,500 px are filled with the plate's own pixels. Scene 01's cutout includes the green
  scrub she holds, so the green scrub moves with her. Her hand on the white scrub was not separated, so it moves with
  the white-scrub piece.
- **Pieces** (photos, swatches, chips, clips, eye diagram): hand-placed polygons in `scenes.ts`, rendered as
  `clip-path` copies of the same plate. Each piece only ever scales **≥ 1** about its own centre (with ≤1° rotation), so it
  always covers its original pixels and no double edge appears.
- **Maryam motion budget**: scale ≤ ~1.2 % about her torso, rotation ≤ 0.35°, 1 px on-twos jitter. Her extremities move
  ≤ ~6 px, which stays inside her white sticker border, so the plate's copy of her never shows.
- **No text is baked in.** `textSafe` zones are in the config. `texts: []` takes optional editable Arabic layers
  (IBM Plex Sans Arabic Bold), set in code.

## Motion language
Camera moves stay smooth, while the pieces animate **on twos** for the stop-motion feel. Each piece has a lift
(spring overshoot + growing paper shadow), a fabric flick (damped wobble), a pin/chip snap, archival photo development
(washed-out to the approved print), attention dim, and a breathing pulse. On top of that: lamp glows (pulse / archive
flicker / glare), white highlights travelling along the existing arrows, and turbulence grain plus a warm vignette.
