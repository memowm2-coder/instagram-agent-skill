# ملف ٠٠١ · 10-second animation test

`ghareeb_ajeeb_preview_10s.mp4`: 1920×1080, 30 fps, 10.0 s, H.264 + AAC.

**Renderer:** Chromium (Playwright) frame-by-frame + ffmpeg. Remotion couldn't
be installed because the environment blocks the npm registry. `scene.html`
exposes `render(frame)` exactly like a Remotion composition, so it ports
1:1 once npm access is enabled.

| File | Role |
| --- | --- |
| `scene.html` | Both scenes: layers, stepped stop-motion keys, camera, tear wipe |
| `frames.js` | Renders `render(0..299)` to PNGs |
| `sfx.py` | Synthesised placeholder SFX (paper, tear, knocks, bounce, stamp) |
| `cutout.py` | Background removal of the original portrait (no face processing) |
| `maryam_cutout.png` | Transparent cutout of the supplied portrait, pixels unaltered |

Build: `node frames.js $PWD/scene.html frames 300 && python3 sfx.py sfx.wav && ffmpeg -framerate 30 -i frames/f%04d.png -i sfx.wav -c:v libx264 -pix_fmt yuv420p -crf 16 -c:a aac out.mp4`

Fonts: `../../../shows/ghareeb-ajeeb/brand/fonts/` (copy beside `scene.html`).

**Known placeholders:** the denim and phone are vector illustrations (not a
real denim photo yet); there's only one photograph of Maryam, so there's a
single pose; the SFX are synthesised.
