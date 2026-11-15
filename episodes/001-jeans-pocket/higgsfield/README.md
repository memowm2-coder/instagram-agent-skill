# EP01 · Vox-style cut made with Higgsfield

**Latest: `ghareeb_ajeeb_ep01_vox_v2_1920x1080.mp4`** (`build/edit2.js` + `build/sfx2.py`). It's the same voice, music and Kling shots, made
with no new credits. Every board beat is now 2.5D: a Higgsedit compose camera with depth layers, a fast whip in, a drift and push,
and a whip out. Scenes 03, 06, 08c and 12 are built from the approved plates' own layers (keyframes 4 and 9, plus the scene-01 plate),
so the camera moves through the depth. Maryam appears as a presenter cutout in the board beats, the long beats are split
into faster sub-shots, and each element has motion blur.

v1 below (`ghareeb_ajeeb_ep01_vox_1920x1080.mp4`, `build/gen_edit.py`).

`ghareeb_ajeeb_ep01_vox_1920x1080.mp4`: 1920×1080, 30 fps, **62.4 s** (from 85.7 s), H.264 + AAC, −14 LUFS.
Fast cuts on every phrase, with Maryam's original voice, music, and SFX.

## What changed from the earlier cuts

- **Voice:** transcribed with Whisper large-v3 (Arabic, word timestamps) in the Higgsfield sandbox. Two
  repeated takes are cut: the false start «كانوا يستخدمون شي اسمه ساعات…» (original 30.05–34.45 s) and the first
  take of «وعشان شي أول تصاميم الجينز من ليفايز» plus the 3.6 s pause (40.30–47.70 s). Every pause is tightened
  and the voice runs at ×1.10 with pitch kept (`build/edit_vo.py`). The edited voice was transcribed again
  (`build/words_final.json`) to confirm that no repeats are left, and all cuts and text sit on those word times.
- **On-screen text follows what Maryam actually says.** The recording differs from `02-script.md`: it has no patent,
  rivets or 1901, and it does have smart watches and wrist watches, «والجيب للحين موجود», not the fifth pocket, and four pockets from the first design.
- **Music:** ElevenLabs Music v2.5 via Higgsfield (70 s instrumental, Vox-style pizzicato and plucked synth, 120 bpm),
  ducked under the voice with a sidechain compressor (`build/media/music.mp3`).
- **Picture:** four Kling 3.0 image-to-video shots (std, 5 s, silent), each started from an approved plate
  (`build/media/s*.jpg` → `k1–k4.mp4`: Maryam rises from the pocket, the phone jams, the watch goes into the pocket, Maryam points).
  The rest is Vox-style board graphics built in **Higgsedit** (Higgsfield's native editor): the approved cutouts,
  torn-paper cards, yellow right-to-left highlight sweeps, ✗ stamps, a 1873 → today timeline, film grain and a vignette.
  The archival photos are crops of the approved plates, labelled «تصوّر توضيحي».

## Rebuild (Higgsfield sandbox)

1. `python3 edit_vo.py` (needs `vo.mp3`, the original VO, and `words.json`) → `vo_tight.wav`, then
   `ffmpeg -i vo_tight.wav -af "atempo=1.10,loudnorm=I=-16:TP=-1.5:LRA=9" vo_edit.wav`.
2. `python3 gen_edit.py render 1 2 3 4 && higgsedit build edit.js` → `ep/renders/picture.mp4`
   (assets in `../a/`: the cutouts from `animation/public/vox`, `logo.png`, and the IBM Plex Sans Arabic TTFs).
3. `python3 sfx.py` → `sfx.wav`, then mix: voice + music (×0.42, sidechain-ducked, 1.8 s fade-out) + SFX (×0.6), `loudnorm I=-14`.
4. Mux `picture.mp4` + `mix.wav` → H.264 CRF 19 + AAC 192k.

Credits used: Kling shots 4 × 7.5, music 10.18 (≈ 40 of 105.5).
