import re
RATIO = "16:9"
STYLE = ("hand-cut documentary paper collage on aged newsprint and archival map surfaces, black and white halftone photograph cutouts with rough scissor-cut edges and offset accent strokes, torn paper edges, masking tape fragments, typewriter caption strips, rubber stamp marks, red string and brass pins where the story calls for connections, desaturated archival palette of tan, ink black, and halftone gray with ONE hot red signal accent and a restrained mustard yellow secondary, condensed bold headline lettering only where a label is specified, visible print grain and paper fiber, matte, flat even documentary lighting with soft cutout drop shadows.")
MOTION = ("Motion: hand-cut documentary paper collage in motion, every element moving as a rigid physical paper piece with visible cutout thickness, print grain, and soft layered shadows, stop-motion cadence with stepped easing and 2-3 frame holds, the hand-made cutting-on-twos feel, never smooth CGI motion. CAMERA, STRICT: locked static top-down shot for the entire clip, no zoom, no pan, no tilt, no rotation, no dolly, no shake, no focus pulls, no cuts, no transitions, no morphing, one continuous shot. FIRST TWO THIRDS OF THE CLIP, BUILD-ON ASSEMBLY: the frame opens on the empty blank paper surface only, then elements enter one by one, back to front: background scraps settle first, the hero cutout slides in with paper drag and a small settle, supporting cutouts drop or pin on with a 2-frame stamp settle, tape presses down, label strips slide in already printed, stamps slap on with their full word intact, red string draws itself from pin to pin where present. Each entrance lands with a tiny handcrafted bounce and casts a real shadow. No element moves again after it lands. FINAL THIRD, LIVING PAPER POSTER: everything holds position; only paper corners lift a millimeter, halftone dots shimmer faintly, shadows breathe. Nothing enters, exits, scales, or moves. TEXT PROTECTION, STRICT: any Arabic lettering or numbers are pre-printed ink on their paper piece and move as one rigid unit with it, never typed on, written on, or revealed letter by letter, never morphing, flickering, warping, or mirroring at any frame, Arabic always right-to-left with connected letters. No other text ever appears. AUDIO: no music, no narration, no voices, only close-up paper ASMR: paper sliding, cardstock taps, tape press, stamp thud, pin click, soft room tone.")
CLOSER = ("Every element must appear physically hand-cut and layered from real paper, with visible cutout edges, halftone print texture, and soft shadow separation between layers. The composition stays clean, minimal, and editorial with generous negative space. NOT digital illustration, NOT cartoon, NOT 3D render, NOT glossy, no gradients, no clutter, no watermark, no logos, no text beyond the specified label. Premium documentary collage aesthetic, " + RATIO + ", ultra-detailed, 8K.")
BLANK = "The background paper is blank and textless: only soft stains, fibers, and faint unreadable halftone grain, no newspaper headlines, no columns of text, no place names, no invented signage."
NOTEXT = "There is no readable text anywhere in the frame."

def ar(word, kind="word", script="Kufi"):
    return (f'bearing the Arabic {kind} "{word}" as the only label, rendered in bold Arabic {script} lettering with correctly connected letters, right-to-left, crisp and legible',
            f'The {kind} "{word}" is the only readable text anywhere in the frame.')
def num(n):
    return (f'bearing the figure "{n}" as the only label, printed in bold condensed Western numerals, crisp and legible',
            f'The figure "{n}" is the only readable text anywhere in the frame.')
BLANKTAG = "plain surface with no printed words or numbers"

# (timecode, narration, scene, label)  scene uses {L} where the label sits
S = [
 ("0:00","ليش نحب الخصومات؟ فكّر فيها.", "a large tan cardstock price tag cutout tied with a loop of red string, its torn corner cut in a sharp notch, laid diagonally across the left third with a brass eyelet, {L}, a small pair of halftone scissors resting at its edge as the single supporting element", ar("الخصومات")),
 ("0:02","نفس القميص بمية درهم، ما تبيه.", "a black and white halftone cutout of a plain folded shirt on a wire hanger, centered, with a small cardstock price tag hanging from its sleeve by red string, {L}, a strip of masking tape holding the hanger hook to the page", num("100")),
 ("0:05","بس لو كان بمئتين", "the same halftone folded shirt on its hanger, now with a noticeably larger cardstock price tag swinging from the sleeve on red string, {L}, the tag's edge cut with a crisp scissor line", num("200")),
 ("0:07","وعليه خصم خمسين بالمية،", "a hot red rubber stamp impression slammed diagonally across a cardstock price tag that hangs from a halftone shirt sleeve, the stamp box {L}, a brass pin fixing the tag to the page", num("50%")),
 ("0:09","تحس إنك لازم تاخذه.", "a black and white halftone cutout of a reaching hand entering from the right edge toward a halftone folded shirt, a plain mustard yellow paper shopping bag with rope handles waiting below, the shirt tag shown as a " + BLANKTAG, None),
 ("0:11","نفس السعر، نفس القميص. ليش؟", "two identical halftone folded shirts placed side by side like evidence photos, each with a blank cardstock tag showing a " + BLANKTAG + ", a torn paper strip pinned between them {L}", ar("ليش؟")),
 ("0:14","عالم اقتصاد اسمه ريتشارد ثيلر،", "a black and white halftone cutout of an anonymous man in a suit and glasses seen from behind standing at a plain lecture lectern, face never visible, a typewriter caption strip below him {L}", ar("ريتشارد ثيلر","phrase","Naskh")),
 ("0:16","خذ جائزة نوبل، فسّرها كذا.", "a round mustard yellow paper medal cutout hanging from a short red ribbon, its face a " + BLANKTAG + " with only a faint embossed halftone profile shape, a torn label strip beneath it {L}", ar("نوبل")),
 ("0:19","احنا ما نشتري الغرض بس،", "a mustard yellow paper shopping bag cutout seen from above, half open, with the halftone folded shirt sliding into it, the shirt tag a " + BLANKTAG + ", one strip of masking tape on the bag rim", None),
 ("0:21","نشتري إحساس إن الصفقة حلوة.", "two black and white halftone cutout hands meeting in a handshake over a cardstock price tag, a small hot red paper heart pinned above the handshake, a torn label strip {L}", ar("الصفقة")),
 ("0:24","والإحساس هذا يجي من الفرق", "two cardstock price tags pinned far apart with brass pins, a taut red string stretched between them like a measured gap, a torn label strip at the middle of the string {L}, both tags shown as a " + BLANKTAG, ar("الفرق")),
 ("0:26","بين السعر اللي في بالك،", "a black and white halftone cutout of a head in profile on the right, a torn cloud shaped paper thought bubble beside it containing a single cardstock price tag shown as a " + BLANKTAG + ", joined by two small paper dots", None),
 ("0:29","والسعر اللي تدفعه.", "a worn halftone leather wallet cutout lying open, blank paper banknote cutouts sliding out of it with " + BLANKTAG + ", one coin shaped mustard disk beside it", None),
 ("0:30","وكل ما كبر الفرق، كبرت الفرحة.", "a semicircular paper gauge dial cutout with a plain tan face showing only abstract tick marks and no numbers, its black paper needle pushed into a hot red segment at the far end, a brass pin as the pivot", None),
 ("0:33","في ألفين واثنعش، شركة أمريكية كبيرة", "a tear-off desk calendar page cutout on aged paper, the page itself a " + BLANKTAG + ", with a typewriter caption strip taped across it {L}, a small red circle of marker around the strip", num("2012")),
 ("0:36","اسمها جي سي بيني", "a black and white halftone cutout of a large generic department store facade with tall glass windows and a blank sign band showing no letters, a torn label strip pinned under the facade {L}", ar("جي سي بيني","phrase","Naskh")),
 ("0:38","قررت تكون صادقة.", "a halftone store window cutout with a single neat cardstock price tag pinned in the center as a " + BLANKTAG + ", several torn empty paper scraps lying below where old signs were removed", None),
 ("0:40","لا خصومات، لا كوبونات،", "a small pile of torn sale sign scraps and coupon scraps, all blank with " + BLANKTAG + ", crossed by one bold hot red marker X, a torn label strip on top {L}", ar("لا خصومات","phrase")),
 ("0:42","سعر واحد رخيص طول السنة.", "one clean cardstock price tag pinned dead center with a brass pin, surrounded by generous empty paper, a torn label strip beneath it {L}", ar("سعر واحد","phrase")),
 ("0:44","والنتيجة؟ الناس هجروها.", "a black and white halftone cutout of an empty shopping cart standing alone in a wide empty store aisle cutout, long soft paper shadows, no people anywhere", None),
 ("0:46","مبيعاتها طاحت خمسة وعشرين بالمية،", "a paper bar chart made of tan cardstock bars with no axis labels, the last bar cut short, a bold hot red paper arrow pointing down beside it, a stamp box {L}", num("25%")),
 ("0:48","وخسرت تسعمية وخمسة وثمانين مليون دولار", "a tall messy stack of blank paper banknote cutouts with " + BLANKTAG + " leaning and toppling to one side, a hot red paper arrow pointing down, a torn label strip across the stack {L}", num("$985,000,000")),
 ("0:51","في سنة وحدة. وبعدها رجّعت الخصومات.", "the halftone store window cutout again, now with three bright mustard and red sale signs pinned back on it, every sign a " + BLANKTAG + ", fresh masking tape on each corner", None),
 ("0:54","يعني الخصم مب دايماً", "a black and white halftone magnifying glass cutout lying over a cardstock price tag, the tag a " + BLANKTAG + " seen enlarged through the lens", None),
 ("0:56","حيلة من المحل.", "a black paper magician's top hat cutout with a cardstock price tag rising out of it on red string, two small mustard paper sparkles, a torn label strip beside the hat {L}", ar("حيلة")),
 ("0:58","أحياناً احنا اللي نطلبه.", "an oval paper mirror frame cutout showing a black and white halftone shopper silhouette holding up a price tag toward the viewer, the tag a " + BLANKTAG + ", a strip of masking tape on the frame", None),
 ("1:00","والحين، تعرفون ليش.", "the large tan cardstock price tag from the opening, tied with its loop of red string, laid diagonally across the left third with its brass eyelet, now a " + BLANKTAG + ", the small halftone scissors at its edge", None),
]
out=[]
for i,(tc,nar,scene,lab) in enumerate(S,1):
    if lab: scene = scene.replace("{L}", lab[0]); only = lab[1]
    else: scene = scene.replace(", {L}","").replace(" {L}",""); only = NOTEXT
    if "{L}" in scene: raise SystemExit(f"unfilled label in {i}")
    p = (f"Create a {RATIO} stop-motion documentary paper-collage video clip that assembles itself on a table and ends on this finished frame. "
         f"Final frame composition: a hand-cut paper collage centered on {scene}. {BLANK} {only} Visual style: {STYLE} {MOTION} {CLOSER}")
    out.append(f"━━━━━━━━━━ المشهد {i} ━━━━━━━━━━\n⏱ {tc} | {nar}\n\n{p}\n")
txt="\n".join(out)
assert not re.search("[–—]", txt), "dash found"
assert all(STYLE in b and MOTION in b and CLOSER in b for b in out)
open("why-we-love-discounts-video-prompts-ar.txt","w",encoding="utf-8").write(txt)
print(len(out),"prompts ok")
