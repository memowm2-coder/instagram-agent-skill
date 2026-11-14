import json
END = 62.4
Y, CREAM, INK, RED = '#F2CB3A', '#F6F0E3', '#1C1B19', '#D2342B'
B = [  # beat starts (s), from the edited VO's word times
 ('k1', 0.00), ('k2', 5.04), ('coins', 9.24), ('y1873', 13.15), ('watches', 17.40), ('pocketwatch', 23.70),
 ('k3', 28.95), ('changed', 34.80), ('jeans', 40.80), ('timeline', 49.20), ('k4', 54.35), ('logo', 60.10)]
starts = {n: s for n, s in B}
ends = {n: (B[i+1][1] if i+1 < len(B) else END) for i, (n, s) in enumerate(B)}
js = r'''
export default async ({ project, text, rect, media, frame, icon }) => {
  const p = await project({ dir: "ep", size: "1920x1080", fps: 30, background: "#1C1B19" });
  const add = (f) => p.add(f);
  const bold = await add("../a/IBMPlexSansArabic-Bold.ttf"), med = await add("../a/IBMPlexSansArabic-Medium.ttf");
  const I = {};
  for (const n of ["board","torn","tape","jeans","watch","n1","n2","n3","n4","n5","xstamp","archive_man","archive_street","archive_building","tag","phone","pocket","qmark","maryam_peek","logo","grain0","k3_last","k4_last"])
    I[n] = await add(`../a/${n}.png`);
  const K = { k1: await add("../media/k1.mp4"), k2: await add("../media/k2.mp4"), k3: await add("../media/k3.mp4"), k4: await add("../media/k4.mp4") };
  const Y = "#F2CB3A", CREAM = "#F6F0E3", INK = "#1C1B19", RED = "#D2342B";
  const SH = { x: -10, y: 16, blur: 22, color: "rgba(0,0,0,.55)" };
  const pop = { enter: { from: { scale: 0.45, rotation: -6 }, duration: 0.22, easing: { kind: "overshoot", amount: 2.2 } } };
  const FADE = [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.06, value: 1 }] }];
  const HOLD = { enter: { from: { scale: 1 }, duration: 0.05 } };
  const slam = { enter: { from: { scale: 1.9, rotation: 8 }, duration: 0.16, easing: "ease-in" } };
  const slideR = { enter: { from: { x: 260 }, duration: 0.2, easing: "house" } };
  const T = (s, size, o = {}) => text(s, { typography: { fontAssetId: (o.medium ? med : bold).id, direction: "rtl", script: "Arab", language: "ar" },
    fontSize: size, color: o.color ?? INK, align: "center", x: o.x ?? 0, y: o.y ?? 0, width: o.width, lineHeight: 1.15 });
  // a torn-paper card with centred text; hl = [x, y, w, h, delay] yellow sweep behind part of the text
  const card = (at, x, y, w, h, s, size, o = {}) => frame({ at, x, y, width: w, height: h, layout: "none", origin: "center", motion: o.motion ?? pop, animate: o.noFade ? undefined : FADE, shadow: SH }, [
    media({ file: I.torn, x: 0, y: 0, width: w, height: h, fit: "fill" }),
    ...(o.hl ? [frame({ at: o.hl[4], x: o.hl[0], y: o.hl[1], width: o.hl[2], height: o.hl[3], background: o.hlColor ?? Y, layout: "none", reveal: { from: "right", duration: 0.22, easing: "house" } })] : []),
    T(s, size, { x: 20, y: (h - size * 1.3) / 2, width: w - 40, color: o.color, medium: o.medium }),
  ]);
  const img = (at, file, x, y, w, o = {}) => frame({ at, duration: o.dur, x, y, width: w, height: o.h ?? w, layout: "none", origin: "center", motion: o.motion ?? pop, animate: FADE, shadow: o.noShadow ? undefined : SH }, [
    media({ file, x: 0, y: 0, width: w, height: o.h, fit: o.h ? "contain" : "width" }),
    ...(o.kids ?? []),
  ]);
  const xmark = (at, x, y, w = 240, dur) => img(at, I.xstamp, x, y, w, { motion: slam, noShadow: true, dur });
  const label = (at, s, x, y, size = 30, o = {}) => frame({ at, duration: o.dur, x, y, width: o.w ?? 420, height: size * 1.6, layout: "none", origin: "center", background: CREAM, motion: slideR, animate: FADE, shadow: SH }, [
    T(s, size, { x: 0, y: size * 0.12, width: o.w ?? 420, color: INK }) ]);
  // board background that keeps pushing in, so stills never sit still
  const board = (dur, kids, push = 1.07) => frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none", origin: "center",
      animate: [{ property: "scale", from: 1.0, to: push, duration: dur, easing: "linear" }] }, [
    media({ file: I.board, x: 0, y: 0, width: 1920, height: 1080, fit: "cover" }), ...kids ]);
  const finish = (dur) => [
    rect({ x: 0, y: 0, width: 1920, height: 1080, fill: { kind: "radial", stops: [{ offset: 0.55, color: "#000000", opacity: 0 }, { offset: 1, color: "#000000", opacity: 0.55 }] } }),
    media({ file: I.grain0, x: 0, y: 0, width: 1920, height: 1080, fit: "cover", opacity: 0.9,
      animate: [{ property: "offsetX", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 0.067, value: -7, easing: "hold" }, { at: 0.133, value: 5, easing: "hold" }, { at: 0.2, value: 0 }], repeat: Math.floor(dur / 0.2) - 1 }] }),
  ];
  const beat = (at, dur, kids) => p.compose([frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none", clip: true }, [...kids, ...finish(dur)])], { at, dur });
  const clip = (k, dur, trim = 0) => media({ file: K[k], x: 0, y: 0, width: 1920, height: 1080, fit: "cover", trimStart: trim });
  const still = (file, dur, z0 = 1.0, z1 = 1.12) => frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none", origin: "center", animate: [{ property: "scale", from: z0, to: z1, duration: dur, easing: "ease-out" }] }, [
    media({ file, x: 0, y: 0, width: 1920, height: 1080, fit: "cover" }) ]);
__BEATS__
  await p.frame(__F1__, "renders/f1.png"); await p.frame(__F2__, "renders/f2.png"); await p.frame(__F3__, "renders/f3.png"); await p.frame(__F4__, "renders/f4.png");
  __RENDER__
};
'''
def L(n): return round(ends[n] - starts[n], 3)
def R(t, n): return round(t - starts[n], 3)
beats = []
# 1 · the pocket, 150+ years
n='k1'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ clip("k1", {L(n)}),
    card({R(2.80,n)}, 560, 820, 800, 190, "موجود من أكثر من ١٥٠ سنة", 64, {{ hl: [190, 50, 200, 95, {R(3.46,n)-R(2.80,n)}] }}) ]);''')
# 2 · the phone doesn't fit
n='k2'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ clip("k2", {L(n)}, 0.3),
    card({R(5.50,n)}, 1040, 60, 820, 180, "ليش للحين موجود؟", 84, {{ hl: [330, 40, 330, 110, 0.5] }}),
    xmark({R(8.55,n)}, 620, 520, 300) ]);''')
# 3 · not for coins, not for small things
n='coins'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    label({R(9.30,n)}, "مو حق…", 760, 140, 64, {{ w: 400 }}),
    img({R(10.20,n)}, I.tag, 1010, 330, 700, {{ kids: [ T("العملات؟", 90, {{ x: 150, y: 70, width: 500 }}) ] }}),
    xmark({R(10.80,n)}, 1560, 300, 190),
    img({R(11.50,n)}, I.tag, 200, 560, 700, {{ kids: [ T("الأشياء اللي نضيعها؟", 42, {{ x: 150, y: 96, width: 520 }}) ] }}),
    xmark({R(12.70,n)}, 750, 530, 190) ]) ]);''')
# 4 · back to 1873
n='y1873'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    card({R(13.20,n)}, 560, 80, 800, 170, "عشان نفهم السالفة…", 70),
    img({R(14.70,n)}, I.archive_man, 260, 300, 380, {{ h: 540 }}),
    img({R(15.00,n)}, I.archive_street, 760, 360, 380, {{ h: 470 }}),
    img({R(15.30,n)}, I.archive_building, 1250, 300, 330, {{ h: 560 }}),
    frame({{ at: {R(16.30,n)}, x: 610, y: 560, width: 700, height: 330, layout: "none", origin: "center", motion: slam, animate: FADE, background: "rgba(28,27,25,.55)", radius: 20 }}, [
      rect({{ x: 0, y: 0, width: 700, height: 330, fill: "rgba(0,0,0,0)", strokeColor: RED, strokeWidth: 14, radius: 20 }}),
      T("١٨٧٣", 230, {{ x: 0, y: 20, width: 700, color: RED }}) ]),
    label({R(16.30,n)}+0.3, "تصوّر توضيحي", 1400, 910, 42, {{ w: 360 }}) ], 1.1) ]);''')
# 5 · no smart watches, no wrist watches
n='watches'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    card({R(17.45,n)}, 460, 70, 1000, 170, "في هالوقت ما كان عند الناس…", 62),
    frame({{ at: {R(20.05,n)}, x: 1080, y: 330, width: 520, height: 520, layout: "none", origin: "center", motion: pop, animate: FADE }}, [
      icon("watch", {{ x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }}), T("ساعات ذكية", 60, {{ x: 0, y: 380, width: 520, color: CREAM }}) ]),
    xmark({R(20.75,n)}, 1210, 330, 300),
    frame({{ at: {R(21.75,n)}, x: 320, y: 330, width: 520, height: 520, layout: "none", origin: "center", motion: pop, animate: FADE }}, [
      icon("clock", {{ x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }}), T("ساعات إيد", 60, {{ x: 0, y: 380, width: 520, color: CREAM }}) ]),
    xmark({R(22.60,n)}, 450, 330, 300) ]) ]);''')
# 6 · the pocket watch
n='pocketwatch'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    frame({{ at: {R(23.80,n)}, x: 980, y: 140, width: 760, height: 760, layout: "none", origin: "center",
      motion: {{ enter: {{ from: {{ y: -700 }}, duration: 0.35, easing: {{ kind: "overshoot", amount: 1.6 }} }} }},
      animate: [{{ property: "rotation", keyframes: [{{ at: 0, value: -25 }}, {{ at: 0.4, value: 0 }}, {{ at: 1.2, value: 6 }}, {{ at: 2.0, value: -5 }}, {{ at: 2.8, value: 3 }}, {{ at: 3.6, value: 0 }}], easing: "ease-in-out" }}] }}, [
      media({{ file: I.watch, x: 0, y: 0, width: 760 }}) ]),
    card({R(25.55,n)}, 120, 220, 820, 210, "ساعة الجيب", 120, {{ hl: [180, 40, 470, 140, 0.45] }}),
    img({R(26.50,n)}, I.archive_man, 300, 520, 300, {{ h: 430 }}),
    card({R(27.70,n)}, 620, 760, 620, 150, "يحطونها في مخابيهم", 54),
    label({R(26.50,n)}+0.2, "تصوّر توضيحي", 270, 965, 42, {{ w: 360 }}) ], 1.08) ]);''')
# 7 · first jeans from Levi's had a pocket made for it
n='k3'; kd=5.0; beats.append(f'''  beat({starts[n]}, {kd}, [ clip("k3", {kd}),
    label({R(30.10,n)}, "أول جينز من ليفايز", 1180, 70, 60, {{ w: 660 }}),
    card({R(32.70,n)}, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, {{ hl: [80, 45, 640, 100, 0.7] }}) ]);
  beat({starts[n]+kd}, {round(L(n)-kd,3)}, [ still(I.k3_last, {round(L(n)-kd,3)}, 1.0, 1.15),
    card(0, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, {{ motion: HOLD, noFade: true, hl: [80, 45, 640, 100, 0] }}) ]);''')
# 8 · watches changed, tech moved on, the pocket stayed
n='changed'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    card({R(35.45,n)}, 560, 60, 800, 170, "بس الغريب العجيب…", 72, {{ hl: [120, 40, 560, 100, 0.4] }}),
    img({R(36.55,n)}, I.watch, 1280, 330, 380),
    T("الساعات تغيّرت", 56, {{ x: 1170, y: 760, width: 600, color: CREAM }}),
    img({R(37.70,n)}, I.phone, 840, 300, 260, {{ h: 520 }}),
    frame({{ at: {R(37.70,n)}, x: 700, y: 840, width: 540, height: 90, layout: "none" }}, [ T("والتكنولوجيا تطوّرت", 52, {{ x: 0, y: 0, width: 540, color: CREAM }}) ]),
    img({R(39.30,n)}, I.pocket, 60, 380, 620, {{ h: 260, motion: slam }}),
    card({R(39.95,n)}, 60, 700, 640, 160, "والجيب… للحين موجود", 56, {{ hl: [40, 35, 330, 90, 0.35] }}) ], 1.06) ]);''')
# 9 · not the fifth pocket; four pockets from the first design
n='jeans'; jx, jy, jw = 560, 120, 760
sc = jw/913
def jp(px, py): return (round(jx + px*sc), round(jy + py*sc))
s1, f1, f2 = jp(266, 140), jp(255, 245), jp(640, 245)
beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    img({R(40.85,n)}, I.jeans, {jx}, {jy}, {jw}, {{ h: {round(1086*sc)} }}),
    card({R(40.85,n)}, 1330, 60, 540, 160, "والأغرب…", 76),
    img({R(43.30,n)}, I.n5, {s1[0]-190}, {s1[1]-130}, 130, {{ dur: {round(46.35-43.30,2)} }}),
    label({R(43.55,n)}, "الجيب الخامس؟", 40, {s1[1]-130}, 58, {{ w: 440, dur: {round(46.35-43.55,2)} }}),
    xmark({R(45.25,n)}, {s1[0]-230}, {s1[1]-170}, 230, {round(46.35-45.25,2)}),
    card({R(46.40,n)}, 1330, 300, 540, 260, "موجود من أول تصميم", 58),
    img({R(48.40,n)}, I.n1, {f1[0]-55}, {f1[1]-10}, 110),
    img({R(48.52,n)}, I.n2, {f2[0]-55}, {f2[1]-10}, 110),
    img({R(48.64,n)}, I.n3, {s1[0]+40}, {s1[1]-140}, 100),
    img({R(48.76,n)}, I.n4, 1390, 640, 120),
    label({R(48.76,n)}, "+ جيب خلفي واحد", 1510, 655, 50, {{ w: 400 }}),
    card({R(48.80,n)}, 1330, 820, 540, 170, "٤ جيوب", 96, {{ hl: [140, 25, 260, 125, 0.15] }}) ], 1.05) ]);''')
# 10 · a design older than a century and a half
n='timeline'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    frame({{ at: {R(49.40,n)}, x: 260, y: 470, width: 1400, height: 12, layout: "none", background: CREAM, radius: 6, reveal: {{ from: "right", duration: 0.7, easing: "house" }} }}),
    frame({{ at: {R(49.40,n)}, x: 1490, y: 380, width: 340, height: 300, layout: "none", origin: "center", motion: pop, animate: FADE }}, [
      rect({{ x: 130, y: 60, width: 80, height: 80, fill: CREAM, radius: 40 }}), T("١٨٧٣", 80, {{ x: 0, y: 160, width: 340, color: CREAM }}) ]),
    frame({{ at: {R(50.10,n)}, x: 90, y: 380, width: 340, height: 300, layout: "none", origin: "center", motion: pop, animate: FADE }}, [
      rect({{ x: 130, y: 60, width: 80, height: 80, fill: RED, radius: 40 }}), T("اليوم", 80, {{ x: 0, y: 160, width: 340, color: CREAM }}) ]),
    card({R(51.10,n)}, 360, 90, 1200, 190, "نلبس قطعة عمرها…", 76),
    card({R(53.00,n)}, 460, 760, 1000, 220, "أكثر من قرن ونص", 104, {{ hl: [80, 50, 520, 130, 0.75], motion: slam }}) ], 1.06) ]);''')
# 11 · the question
n='k4'; kd=5.0; beats.append(f'''  beat({starts[n]}, {kd}, [ clip("k4", {kd}),
    card({R(56.50,n)}, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, {{ hl: [60, 45, 330, 115, 0.75] }}),
    card({R(57.80,n)}, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64) ]);
  beat({starts[n]+kd}, {round(L(n)-kd,3)}, [ still(I.k4_last, {round(L(n)-kd,3)}, 1.0, 1.06),
    card(0, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, {{ motion: HOLD, noFade: true, hl: [60, 45, 330, 115, 0] }}),
    card(0, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64, {{ motion: HOLD, noFade: true }}) ]);''')
# 12 · غريب… عجيب
n='logo'; beats.append(f'''  beat({starts[n]}, {L(n)}, [ board({L(n)}, [
    img({R(60.18,n)}, I.logo, 560, 160, 800, {{ h: 571, motion: slam }}),
    img({R(60.30,n)}, I.maryam_peek, 1380, 560, 520, {{ motion: {{ enter: {{ from: {{ y: 500 }}, duration: 0.3, easing: {{ kind: "overshoot", amount: 1.4 }} }} }} }}),
    label({R(60.86,n)}, "ملف ٠٠١، الجيب الصغير", 600, 800, 54, {{ w: 720 }}) ], 1.04) ]);''')
open('edit_beats.js','w').write('\n'.join(beats))
import sys
mode = sys.argv[1] if len(sys.argv) > 1 else 'frames'
times = [float(x) for x in (sys.argv[2:6] if len(sys.argv) >= 6 else [11.2, 16.6, 26.3, 48.9])]
out = js.replace('__BEATS__', '\n'.join(beats))
for i, t in enumerate(times): out = out.replace(f'__F{i+1}__', str(t))
out = out.replace('__RENDER__', 'await p.render("renders/picture.mp4");' if mode == 'render' else '')
open('edit.js', 'w').write(out)
print('beats', len(B), 'end', END)
