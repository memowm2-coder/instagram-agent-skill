# EP02 · ليش ملابس العمليات خضراء أو زرقاء؟ — Remotion animation

Animates the **8 approved storyboard PNGs as master keyframes**. No artwork is generated or redrawn:
every moving layer is cut from the approved plate's own pixels, and Maryam is the mask cut from the same image.

**Status:** all 8 scenes animated. `ghareeb_ajeeb_scrubs_full.mp4` is the full episode (57 s, 1920×1080, 30 fps; the Remotion render re-encoded at H.264 CRF 21 to stay under GitHub's 100 MB limit) and
`ghareeb_ajeeb_scrubs_preview.mp4` is the approved 10 s preview. No voice-over yet: the timeline is built scene by scene in
`src/scenes.ts`, so it can be retimed to the VO later.

| Scene | Time | Choreography | Exit |
| --- | --- | --- | --- |
| 01 | 0:00–0:05 | board assembles in stop motion, Maryam slides in with the green scrub, whips white → green → blue, chalk circles | file opens (RTL) |
| 02 | 0:05–0:10 | archival photos dealt onto the board and develop, Maryam pops up, camera travels photo to photo | paper rip |
| 03 | 0:10–0:16 | operating-lamp glare and flashes, Maryam shields her eyes, chalk on the lamp and her eyes, lamp blueprint lifts | stop-motion jump |
| 04 | 0:16–0:23 | afterimage: stare at the red half of the eye (red pulse + red circle) → gaze line → silhouette glows green | diagram wipe |
| 05 | 0:23–0:30 | swatches pinned, colour wheel spins in, comparison card rises into her hands, arrows traced, green / blue circled | slide |
| 06 | 0:30–0:38 | strain: glaring white scrub, pulsing red arrows, shaking eye; comfort: green/blue scrubs and calm eye build in, Maryam leans side to side | pin snaps |
| 07 | 0:38–0:47 | evidence photos pinned, red strings light up, red circle on the white scrub, Maryam slams the stamp (shake + flash), red ring on the file | archival reveal |
| 08 | 0:47–0:57 | white → green → blue line up with traced arrows and chalk circles, then the board clears and Maryam slides out → loops into 01 | — |

## Rerender
```bash
npm install                 # Remotion 4.0.242
npm run prepare-layers      # copies storyboard/ + layers/ into public/, writes src/layers.json
npm run sfx                 # synthesises the sound-design stems into public/sfx/
npm run clean-plates        # builds NN_board / NN_clean plates (needs opencv-python-headless)
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

## v2 — more animation: clean boards
`npm run clean-plates` (`tools/clean_plates.py`) builds two extra plates for every scene that uses `base(k, true)`:
- `NN_board.png`: the approved plate with Maryam lifted out.
- `NN_clean.png`: the board with every animated piece lifted out too.

The gaps are filled with blank paper mirror-tiled from the plate's own empty paper area, like the bare collage board
before things are pasted on. Pieces are cut from the board, so they can drop in, fly, flick and lift freely. Maryam can
slide in, lean and present. At rest every layer sits exactly where it is in the approved image.

New moves: `enter` (drop / slide in with an overshoot landing and a paper thump), `exit`, a bigger `lift`, `wobble`
(idle flutter), hand-drawn chalk `marks` (circle / underline, drawn on), camera `whip` keys with motion blur scaled to
camera speed, and Maryam `enter` / `present` / `lean` / `nod` pinned at her base like a paper puppet.

## How layers are separated (masks)
- **Maryam**: `rembg` (isnet-general-use) on the plate, cropped to the presenter's side (05 and 06 were re-segmented and
  merged, because the first pass missed her right arm and the hijab tail). `tools/prepare_layers.py` then removes artwork rembg
  pulled in: the instrument tray (03), the eye card (04), the two eye circles and the eye diagram (06), and the evidence board
  and folders (07, body + stamp arm only). It keeps every part ≥ 12k px and fills enclosed holes with the plate's own pixels. The largest connected component
  is kept, and holes smaller than 2,500 px are filled with the plate's own pixels. Scene 01's cutout includes the green
  scrub she holds, so the green scrub moves with her. Her hand on the white scrub was not separated, so it moves with
  the white-scrub piece.
- **Pieces** (photos, swatches, chips, clips, eye diagram): hand-placed polygons in `scenes.ts`, rendered as
  `clip-path` copies of the same plate. Each piece only ever scales **≥ 1** about its own centre (with ≤1° rotation), so it
  always covers its original pixels and no double edge appears.
- **Maryam motion** (v2): scenes with clean boards move her freely (slide-in, lean, present). Scenes still on the
  original plate keep her within ~6 px so the plate's copy of her never shows.
- **No text is baked in.** `textSafe` zones are in the config. `texts: []` takes optional editable Arabic layers
  (IBM Plex Sans Arabic Bold), set in code.

## Motion language
Camera moves stay smooth, while the pieces animate **on twos** for the stop-motion feel. Each piece has a lift
(spring overshoot + growing paper shadow), a fabric flick (damped wobble), a pin/chip snap, archival photo development
(washed-out to the approved print), attention dim, and a breathing pulse. On top of that: lamp glows (pulse / archive
flicker / glare), white highlights travelling along the existing arrows, and turbulence grain plus a warm vignette.
