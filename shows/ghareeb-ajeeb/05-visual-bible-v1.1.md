# 05 · Visual Bible v1.1 (LOCKED RULES)

**غريب عجيب · Maryam Studios · approved direction, 10 Oct 2026**

These ten rules are locked. Where they conflict with `02-show-bible.md` (v1.0),
**this file wins**. Superseded sections are listed at the end.

---

## R1 · Format: 16:9 landscape only (FINAL)

- **The only format is 1920×1080, 16:9, 30 fps.** Every storyboard, composition,
  layer, typographic layout, transition and render is designed for it.
- **No vertical version.** No 9:16 safe areas, no crops, no reframes for Reels.
  Where the file is posted to Instagram, it's posted as the 16:9 video.
- **Composition grid:** 1920×1080, outer margin 96 px, 12 columns, 24 px gutter,
  8 px baseline. Title-safe area: x 96–1824, y 72–1008.
- **RTL reading:** the eye enters top-right; headlines sit in the right half, and
  "forward" motion runs right → left.

## R2 · Typography: IBM Plex Sans Arabic (supplied, OFL)

- **The show's only typeface is IBM Plex Sans Arabic**, from the files supplied
  by Maryam Studios in `brand/fonts/`, under the SIL Open Font License
  (`brand/fonts/OFL.txt`), which allows commercial use and embedding.
  *(Replaces the earlier Thmanyah decision, 10 Oct 2026.)*
- **Text is a live layer in Remotion or the edit, and is never generated inside an image.**
- **Weights:** Bold 700 for the logo and headlines · Medium 500 for the tagline and
  subtitles · Regular 400 for technical labels and title-block text.
- Supersedes Bible §18 typefaces (the rules on line length, numerals and
  maximum lines still apply).

## R2b · Logo

- **Lockup:** «غريب» in Ink #1C1B19 on a torn Kraft scrap, laid over «عجيب»
  in Ivory #F6F0E3 on a torn deep-red scrap, with masking tape, the tagline
  «حكايات من العالم… وما وراء المألوف» on a paper scrap underlined by an
  architectural dimension line, and a charcoal magnifier.
- **Red in the logo** is the brand mark, which is the one standing exception
  to R5. Inside episodes, red still means discovery only.
- **Files:** `brand/logo/ghareeb_ajeeb_logo.png` (transparent),
  `brand/logo/ghareeb_ajeeb_logo_card_1920x1080.png`. Source:
  `brand/logo/logo.html`, rendered with `render.js`.

## R3 · Maryam: photographic cutouts from original photographs only

- **Source:** only original photographs of Maryam supplied by her.
- **Allowed processing:** background removal, edge cleanup, paper border,
  drop shadow, global scale, rotation and position, and global colour
  matching applied evenly to the whole layer.
- **Forbidden:** face regeneration, beautification, retouching, face swap,
  expression change, inpainting of the face, AI pose synthesis, and
  "upscaling" models that redraw facial detail.
- **New poses or expressions = a new photo shoot.** If a pose isn't in the
  supplied photos, it goes on the shot list. It doesn't get generated.
- Every cutout file records its source photo in the asset manifest.

## R4 · Colour language

| Layer | Treatment |
| --- | --- |
| Present day (objects, phones, today's denim) | Natural colour |
| History (archives, 19th-century scenes) | Sepia: desaturate, then tone to the Kraft/Paper range |
| **Maryam** | **Always natural colour**, in every scene including historical ones. She's the visitor from today. |

Supersedes v1.0 §16.5 ("people are B&W").

## R5 · Red is for discoveries only

- **Correction Red #D2342B** appears only on **major discoveries and verified
  answers**: the circle on the answer, the reveal annotation, the stamp, and the
  "✗" on a disproved belief.
- **Ordinary annotations** (arrows, emphasis ticks, question marks, labels)
  use **Charcoal #2A2826**, **Ivory #F6F0E3** or **Denim Blue #2F4A6D**.
- Red question marks, red action lines and decorative red paper strips are **banned**.
- At most **one red moment per scene**, and fewer than 5% of the frame.

Palette update: `paper #F2EBDD · ivory #F6F0E3 · charcoal #2A2826 · ink #1C1B19 · kraft #B98B5E · denim #2F4A6D · blueprint #2B5C8A · red #D2342B`.

## R6 · Architectural annotation in every scene

Every scene carries at least **one purposeful technical layer**: a dimension
line, construction line, detail callout, section mark, scale bar, exploded-view
leader, or measured grid. It has to *say* something, such as size, structure or
sequence. Decoration doesn't count. Values shown must come from the Claim Ledger
or from measurements of a real reference object (recorded in the manifest).

Generic YouTube vocabulary (cartoon "!" bursts, white action lines, emoji,
bouncing question marks) is replaced by this layer.

## R7 · Documentary authenticity

- Historical images are **verified archives** (e.g. National Archives, Library of
  Congress, museum collections, Levi Strauss & Co. archives where permitted).
  Each one has its **source line on screen** (in the title block or a caption strip).
- Any AI-generated or artist reconstruction carries the on-screen label
  **«تصوّر توضيحي»** (Illustrative reconstruction) for the whole time it's visible.
- An AI image is never toned to look like a period photograph without that label.

## R8 · Title Block system

A fixed block, bottom-left of the frame (x 96–616, y 888–1008), always the same size:

```
┌───────────────────────────────────────┐
│ غريب عجيب              │ ملف ٠٠١        │
│ الحلقة: الجيب الصغير في الجينز          │
│ المصدر: {short source of this scene}   │
└───────────────────────────────────────┘
```

- **File number:** ملف + 3 digits, never reset.
- **Source line changes per scene** to the archive or claim shown.
  "—" when the scene makes no factual claim.

## R9 · Production layers

Every scene is delivered as separate layers whenever motion requires it:

| # | Layer | Format |
| -: | --- | --- |
| L0 | Background (paper, textures, denim field) | PNG/JPG, full canvas, oversized 10% for camera moves |
| L1 | Archive / historical image | PNG with alpha, cut edges, source logged |
| L2 | Photographic character (Maryam) | PNG with alpha, one file per pose |
| L3 | Objects (pocket, watch, phone, coin) | PNG with alpha, one per object; sub-parts separate if they move |
| L4 | Diagrams (technical drawings, sections) | **SVG** (so lines can draw on) |
| L5 | Annotations (arrows, circles, marks) | SVG strokes |
| L6 | Text | Live text in Remotion (Thmanyah) |
| L7 | Transition elements (torn edges, paper wipes) | PNG with alpha, sequences for stop motion |

Naming: `{file}_{scene}_{layer}_{name}.{ext}`, e.g. `001_s03_L3_watch.png`.
Flattened images aren't accepted as animation sources.

## R10 · Brand safety

- No third-party logos or trademarks unless the brand is the documented subject
  of a claim (e.g. Levi Strauss & Co. as the source in the title block).
- Phones, watches and clothing are shown **unbranded**. Logos are removed from
  reference photos or the object is re-photographed.
- Using brand names in speech or source lines is fine. Their logos and
  trademarked artwork on screen aren't.

---

## Stop-motion and camera standard (from the approved test brief)

- Character and paper elements animate **on twos (15 fps steps in a 30 fps timeline)**,
  with ±1–2 px position and ±0.5–1° rotation "boil" per held drawing.
- Entrances and exits are stepped (3–6 drawings), never eased tweens.
- The camera moves smoothly on ones, so the stepped paper reads as handmade.
- Shadows: soft, offset toward bottom-left (light from top-right), 25–35% opacity, and the
  offset grows when an element "lifts".
- Transitions: torn-paper wipe (stepped), paper slide, folder flip, the Section Cut (reveal only).

## Superseded in 02-show-bible.md

| v1.0 section | Replaced by |
| --- | --- |
| §13 Thumbnail layout (1080×1920) | R1 (16:9 only; thumbnail = 1920×1080 frame) |
| §14 Cover system (3:4 grid crop, B&W Paper Maryam) | R1 + R3 + R4: 16:9 cover, Maryam in natural colour |
| §16.5 "People are B&W" | R4 |
| §17 grid/safe area for 9:16 | R1, R8 (16:9 grid) |
| §18 typefaces | R2 |
| §19 Red Rule wording | R5 (stricter, adds the ordinary-annotation colours) |
| §22 Camera B live footage | Pending decision. Cutout is the primary host presence |
