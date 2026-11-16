<!-- Imported from the show's ChatGPT planning thread (shared link, Claude animation brief). Kept verbatim as the brief. -->

أكيد — **هذا بالضبط البرومبت اللي يخلّي Claude يستخدم نفس الصور نفسها ويحركها** بدل ما يعيد تصميمها أو يولّد شي جديد.  
انسخيه له **كما هو**:

---

## Prompt for Claude Code

```text
You are my Creative Technologist, Remotion Developer, and Motion Graphics Animator.

Your task is to ANIMATE the exact supplied storyboard scene images for my Arabic documentary-style series:

غريب عجيب

Episode title:
ليش ملابس العمليات خضراء أو زرقاء؟

IMPORTANT CREATIVE RULE:
You must use the exact supplied PNG scene images as the visual base.
Do NOT redesign them from scratch.
Do NOT regenerate a new style.
Do NOT replace Maryam with a new generated face.
Do NOT create a different collage direction.

The goal is:
Take the existing static storyboard images and turn them into a polished animated motion-graphics video.

-----------------------------------
PROJECT FORMAT
-----------------------------------
- Resolution: 1920x1080
- Aspect ratio: 16:9 landscape
- FPS: 30
- Duration target: 45–60 seconds
- Output: MP4
- Framework: Remotion + React + TypeScript + FFmpeg

-----------------------------------
EPISODE STYLE
-----------------------------------
The visual identity is already established in the supplied images:
- Editorial paper collage
- Stop-motion energy
- Paper cutout documentary
- Maryam as a photographic cutout
- Warm beige paper backgrounds
- Technical/architectural linework
- Teal/green/blue fabric accents
- Red only as a highlight for important reveal moments
- Present-day scenes in color
- Historical/archive scenes in sepia or black-and-white

You MUST preserve this exact visual language.

-----------------------------------
CRITICAL RULE: USE THE PROVIDED SCENES AS-IS
-----------------------------------
The supplied images are the actual storyboard keyframes and visual design direction.

Use them directly as the base scenes.

You may:
- Separate foreground and background elements using masking/segmentation
- Extract Maryam from each scene for subtle independent movement
- Create parallax layers from existing elements
- Animate arrows, circles, lighting, fabric swatches, eyes, diagrams, stamps, and paper pieces
- Add camera push-ins, pans, subtle rotations, and stop-motion jitter
- Add paper-rip transitions and evidence-board style reveals

You may NOT:
- Redesign the compositions from scratch
- Replace Maryam’s face
- Invent a different outfit identity
- Change the visual style
- Make it look like generic slideshow animation

-----------------------------------
SCENE IMAGE FILES
-----------------------------------
Use these exact scene images in this sequence:

1. medical_scrubs_transformation_collage.png
2. archival_medicine_collage_with_presenter.png
3. surgical_light_collage_portrait.png
4. vision_science_collage_with_medical_presenter.png
5. color_analysis_scrub_style_collage.png
6. balancing_scrubs_strain_to_comfort.png
7. forensic_scrub_evidence_board_reveal.png
8. surgical_scrubs_collage_explainer.png

If additional variants exist, use them only if they match the same visual identity.

-----------------------------------
ANIMATION GOAL
-----------------------------------
This should feel like a premium motion graphics documentary.
The scenes must feel alive, layered, and tactile.

The animation style should include:
- subtle stop-motion movement
- paper cutout bounce
- micro jitter
- animated push pins / paper shadows
- parallax depth between layers
- camera movement
- animated reveal lines
- gentle spotlight/light pulses
- diagram overlays
- animated evidence circles and arrows
- smooth but handcrafted transitions

-----------------------------------
MARYAM RULES
-----------------------------------
Maryam must remain the same recognizable person across all scenes.

Preserve:
- exact facial features
- skin tone
- hijab identity
- overall look

You may animate her by:
- position shifts
- slight scale changes
- slight rotation
- hand/arm emphasis if separable
- subtle documentary-style cutout movement

Do NOT morph, repaint, beautify, or regenerate her face.

-----------------------------------
TEXT RULES
-----------------------------------
Arabic text will be added later in editing.
So DO NOT permanently embed Arabic text into the scene images.

Instead:
- preserve the existing blank composition areas for text
- keep title-safe negative space
- if needed, create optional editable text layers in code
- mark text-safe zones in a scene config
- do not rasterize fake Arabic typography into the image

-----------------------------------
TIMING / SCENE PLAN
-----------------------------------
Create an edit roughly like this:

Scene 01 (0:00–0:05)
Use medical_scrubs_transformation_collage.png
Animate the white scrub changing attention toward green/blue scrubs.
Maryam should subtly present the color shift.
Use a punchy opening camera push-in.

Scene 02 (0:05–0:10)
Use archival_medicine_collage_with_presenter.png
Create an archival reveal transition.
Animate slight movement in the historical paper photos.
Make this feel like opening an evidence file.

Scene 03 (0:10–0:16)
Use surgical_light_collage_portrait.png
Animate the surgical light glow.
Maryam reacts to brightness.
Use subtle light pulses to suggest eye strain / glare.

Scene 04 (0:16–0:23)
Use vision_science_collage_with_medical_presenter.png
Animate the eye diagram and afterimage concept.
Use diagram lines and focus movement.
Keep it clean and smart, not gimmicky.

Scene 05 (0:23–0:30)
Use color_analysis_scrub_style_collage.png
Animate fabric swatches, arrows, and analysis board elements.
Maryam should point toward the comparison logic.

Scene 06 (0:30–0:38)
Use balancing_scrubs_strain_to_comfort.png
Animate the comparison between strain and comfort.
Use small eye detail movement and directional cues.

Scene 07 (0:38–0:47)
Use forensic_scrub_evidence_board_reveal.png
This is a stronger reveal moment.
Animate the stamp impact, evidence lines, and red emphasis.
This should feel like a case conclusion building.

Scene 08 (0:47–0:57)
Use surgical_scrubs_collage_explainer.png
Create the final explanation frame and loop-friendly ending.
Return to the main insight visually.
End in a way that can loop back naturally to Scene 01.

-----------------------------------
TRANSITIONS
-----------------------------------
Use transitions like:
- paper rip
- tape peel
- file open
- push-pin snap
- evidence-board slide
- stop-motion cut jump
- diagram wipe
- archival card reveal

No cheesy digital transitions.

-----------------------------------
AUDIO
-----------------------------------
Add subtle sound design:
- paper rustle
- page flip
- pin tap
- fabric flick
- stamp hit
- light hum
- documentary whoosh
- tiny marker scribble

If voiceover is not available yet:
- build the full animation timeline without voice
- keep timing easy to retime later
- structure scenes clearly for later voice sync

-----------------------------------
TECHNICAL EXECUTION
-----------------------------------
1. Inspect the supplied images.
2. Build a Remotion project.
3. Import each storyboard image as a base composition.
4. Use masking / segmentation to separate layers where useful.
5. Animate each scene with parallax and stop-motion style.
6. Render a 10-second preview first.
7. Export the preview as:
   ghareeb_ajeeb_scrubs_preview.mp4
8. After preview approval, render the full episode as:
   ghareeb_ajeeb_scrubs_full.mp4

-----------------------------------
DELIVERABLES
-----------------------------------
Provide:
- full Remotion project
- source code
- asset manifest
- scene configuration
- preview render
- final render
- notes about any manual masks created
- instructions for rerendering

Most important:
ANIMATE THE PROVIDED SCENES.
Do not redesign the project.
Keep the same visual identity exactly.
```

---

## وإذا تبينه أوضح أكثر، أرسلي له بعد هذا التنبيه القصير:

```text
Important:
I do not want new generated artwork.
I want animation applied to the exact storyboard scenes I already approved.

Think like a motion graphics director:
use the existing PNG scenes as master keyframes,
separate layers from them,
animate them beautifully,
preserve the same identity.
```

---

## شو تسوين الحين؟
ارسلي له مع البرومبت:
- كل صور المشاهد الثمانية
- صورة مريم الأصلية
- السكربت إذا تبين يضبط التايمينغ بعدين

---

## وأفضل جملة أخيرة تضيفينها له:
```text
Start with the 10-second preview only.
Do not render the full episode until I approve the movement quality.
```

إذا تبين، أقدر الحين بعد **أكتب لج رسالة أقصر وأذكى لـClaude**  
يعني **نسخة مختصرة جدًا** بدل البرومبت الطويل.

---

If you want, I can:

- Generate a precise shot list with timing and motion details for animation
- Write a concise animation brief tailored for Claude's motion graphics task
- Prepare character styling guidelines by episode for Maryam's outfit transitions