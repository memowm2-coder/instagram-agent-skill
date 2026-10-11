# EP01 · ليش الجينز فيه جيب صغير؟ · full episode

| File | Content |
| --- | --- |
| `ghareeb_ajeeb_EP01_full_vo_sfx.mp4` | 1920×1080, 30 fps, H.264 + AAC, 85.7 s: Maryam's original VO + SFX, **no music** |
| `ghareeb_ajeeb_EP01_clean_vo_only.mp4` | Same picture, VO only |
| `project/sfx/{paper,stamp,phone,watch}.wav` | SFX as separate 48 kHz stems (mixed at −9 dB under the VO) |

## Timeline (cut points = detected pauses in the VO)

| Scene | Time | Content |
| --- | --- | --- |
| 01 Mystery | 0.0–7.9 | Pocket; Maryam rises in 3 steps; title words «ليش الجينز فيه جيب صغير؟» |
| 02 Modern problem | 7.9–17.4 | Phone drops, jams, bounces out; ✗ stamp; «حتى الجوال… ما يدخل!» |
| 03 Time travel | 17.4–24.0 | Tear to sepia; illustrative street + 1873 card, labelled «تصوّر توضيحي» |
| 04 Discovery | 24.0–34.6 | Watch descends and swings, ticking; «شي كان الكل يحمله…» |
| 05 Pocket reveal | 34.6–47.9 | Section cut splits the pocket; watch drops inside; dimensions; red ring + «ساعة جيب» in the 3.6 s pause (44.3–47.9) |
| 06 Historical twist | 47.9–63.6 | Jeans front, small pocket front-right circled; 1873: four pockets; 1901: the fifth = second back pocket |
| 07 Present day | 63.6–77.1 | Denim, jeans/phone/pocket collage; «١٥٠ سنة… والجيب باقي» |
| 08 Loop | 77.1–85.7 | Opening composition, logo stamp, Maryam sinks back behind the pocket = frame 0 |

## Build
`project/episode.html` exposes `render(frame)`. Render frames with
`node frames2.js $PWD/episode.html frames 0 2573`, build the SFX stems with `python3 sfx.py`,
then run the ffmpeg commands in the top-level delivery notes. Swap the logo by replacing `project/a/logo.png`.
