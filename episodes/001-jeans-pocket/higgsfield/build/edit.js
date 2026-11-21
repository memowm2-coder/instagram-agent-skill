
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
  beat(0.0, 5.04, [ clip("k1", 5.04),
    card(2.8, 560, 820, 800, 190, "موجود من أكثر من ١٥٠ سنة", 64, { hl: [190, 50, 200, 95, 0.6600000000000001] }) ]);
  beat(5.04, 4.2, [ clip("k2", 4.2, 0.3),
    card(0.46, 1040, 60, 820, 180, "ليش للحين موجود؟", 84, { hl: [330, 40, 330, 110, 0.5] }),
    xmark(3.51, 620, 520, 300) ]);
  beat(9.24, 3.91, [ board(3.91, [
    label(0.06, "مو حق…", 760, 140, 64, { w: 400 }),
    img(0.96, I.tag, 1010, 330, 700, { kids: [ T("العملات؟", 90, { x: 150, y: 70, width: 500 }) ] }),
    xmark(1.56, 1560, 300, 190),
    img(2.26, I.tag, 200, 560, 700, { kids: [ T("الأشياء اللي نضيعها؟", 42, { x: 150, y: 96, width: 520 }) ] }),
    xmark(3.46, 750, 530, 190) ]) ]);
  beat(13.15, 4.25, [ board(4.25, [
    card(0.05, 560, 80, 800, 170, "عشان نفهم السالفة…", 70),
    img(1.55, I.archive_man, 260, 300, 380, { h: 540 }),
    img(1.85, I.archive_street, 760, 360, 380, { h: 470 }),
    img(2.15, I.archive_building, 1250, 300, 330, { h: 560 }),
    frame({ at: 3.15, x: 610, y: 560, width: 700, height: 330, layout: "none", origin: "center", motion: slam, animate: FADE, background: "rgba(28,27,25,.55)", radius: 20 }, [
      rect({ x: 0, y: 0, width: 700, height: 330, fill: "rgba(0,0,0,0)", strokeColor: RED, strokeWidth: 14, radius: 20 }),
      T("١٨٧٣", 230, { x: 0, y: 20, width: 700, color: RED }) ]),
    label(3.15+0.3, "تصوّر توضيحي", 1400, 910, 42, { w: 360 }) ], 1.1) ]);
  beat(17.4, 6.3, [ board(6.3, [
    card(0.05, 460, 70, 1000, 170, "في هالوقت ما كان عند الناس…", 62),
    frame({ at: 2.65, x: 1080, y: 330, width: 520, height: 520, layout: "none", origin: "center", motion: pop, animate: FADE }, [
      icon("watch", { x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }), T("ساعات ذكية", 60, { x: 0, y: 380, width: 520, color: CREAM }) ]),
    xmark(3.35, 1210, 330, 300),
    frame({ at: 4.35, x: 320, y: 330, width: 520, height: 520, layout: "none", origin: "center", motion: pop, animate: FADE }, [
      icon("clock", { x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }), T("ساعات إيد", 60, { x: 0, y: 380, width: 520, color: CREAM }) ]),
    xmark(5.2, 450, 330, 300) ]) ]);
  beat(23.7, 5.25, [ board(5.25, [
    frame({ at: 0.1, x: 980, y: 140, width: 760, height: 760, layout: "none", origin: "center",
      motion: { enter: { from: { y: -700 }, duration: 0.35, easing: { kind: "overshoot", amount: 1.6 } } },
      animate: [{ property: "rotation", keyframes: [{ at: 0, value: -25 }, { at: 0.4, value: 0 }, { at: 1.2, value: 6 }, { at: 2.0, value: -5 }, { at: 2.8, value: 3 }, { at: 3.6, value: 0 }], easing: "ease-in-out" }] }, [
      media({ file: I.watch, x: 0, y: 0, width: 760 }) ]),
    card(1.85, 120, 220, 820, 210, "ساعة الجيب", 120, { hl: [180, 40, 470, 140, 0.45] }),
    img(2.8, I.archive_man, 300, 520, 300, { h: 430 }),
    card(4.0, 620, 760, 620, 150, "يحطونها في مخابيهم", 54),
    label(2.8+0.2, "تصوّر توضيحي", 270, 965, 42, { w: 360 }) ], 1.08) ]);
  beat(28.95, 5.0, [ clip("k3", 5.0),
    label(1.15, "أول جينز من ليفايز", 1180, 70, 60, { w: 660 }),
    card(3.75, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, { hl: [80, 45, 640, 100, 0.7] }) ]);
  beat(33.95, 0.85, [ still(I.k3_last, 0.85, 1.0, 1.15),
    card(0, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, { motion: HOLD, noFade: true, hl: [80, 45, 640, 100, 0] }) ]);
  beat(34.8, 6.0, [ board(6.0, [
    card(0.65, 560, 60, 800, 170, "بس الغريب العجيب…", 72, { hl: [120, 40, 560, 100, 0.4] }),
    img(1.75, I.watch, 1280, 330, 380),
    T("الساعات تغيّرت", 56, { x: 1170, y: 760, width: 600, color: CREAM }),
    img(2.9, I.phone, 840, 300, 260, { h: 520 }),
    frame({ at: 2.9, x: 700, y: 840, width: 540, height: 90, layout: "none" }, [ T("والتكنولوجيا تطوّرت", 52, { x: 0, y: 0, width: 540, color: CREAM }) ]),
    img(4.5, I.pocket, 60, 380, 620, { h: 260, motion: slam }),
    card(5.15, 60, 700, 640, 160, "والجيب… للحين موجود", 56, { hl: [40, 35, 330, 90, 0.35] }) ], 1.06) ]);
  beat(40.8, 8.4, [ board(8.4, [
    img(0.05, I.jeans, 560, 120, 760, { h: 904 }),
    card(0.05, 1330, 60, 540, 160, "والأغرب…", 76),
    img(2.5, I.n5, 591, 107, 130, { dur: 3.05 }),
    label(2.75, "الجيب الخامس؟", 40, 107, 58, { w: 440, dur: 2.8 }),
    xmark(4.45, 551, 67, 230, 1.1),
    card(5.6, 1330, 300, 540, 260, "موجود من أول تصميم", 58),
    img(7.6, I.n1, 717, 314, 110),
    img(7.72, I.n2, 1038, 314, 110),
    img(7.84, I.n3, 821, 97, 100),
    img(7.96, I.n4, 1390, 640, 120),
    label(7.96, "+ جيب خلفي واحد", 1510, 655, 50, { w: 400 }),
    card(8.0, 1330, 820, 540, 170, "٤ جيوب", 96, { hl: [140, 25, 260, 125, 0.15] }) ], 1.05) ]);
  beat(49.2, 5.15, [ board(5.15, [
    frame({ at: 0.2, x: 260, y: 470, width: 1400, height: 12, layout: "none", background: CREAM, radius: 6, reveal: { from: "right", duration: 0.7, easing: "house" } }),
    frame({ at: 0.2, x: 1490, y: 380, width: 340, height: 300, layout: "none", origin: "center", motion: pop, animate: FADE }, [
      rect({ x: 130, y: 60, width: 80, height: 80, fill: CREAM, radius: 40 }), T("١٨٧٣", 80, { x: 0, y: 160, width: 340, color: CREAM }) ]),
    frame({ at: 0.9, x: 90, y: 380, width: 340, height: 300, layout: "none", origin: "center", motion: pop, animate: FADE }, [
      rect({ x: 130, y: 60, width: 80, height: 80, fill: RED, radius: 40 }), T("اليوم", 80, { x: 0, y: 160, width: 340, color: CREAM }) ]),
    card(1.9, 360, 90, 1200, 190, "نلبس قطعة عمرها…", 76),
    card(3.8, 460, 760, 1000, 220, "أكثر من قرن ونص", 104, { hl: [80, 50, 520, 130, 0.75], motion: slam }) ], 1.06) ]);
  beat(54.35, 5.0, [ clip("k4", 5.0),
    card(2.15, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, { hl: [60, 45, 330, 115, 0.75] }),
    card(3.45, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64) ]);
  beat(59.35, 0.75, [ still(I.k4_last, 0.75, 1.0, 1.06),
    card(0, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, { motion: HOLD, noFade: true, hl: [60, 45, 330, 115, 0] }),
    card(0, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64, { motion: HOLD, noFade: true }) ]);
  beat(60.1, 2.3, [ board(2.3, [
    img(0.08, I.logo, 560, 160, 800, { h: 571, motion: slam }),
    img(0.2, I.maryam_peek, 1380, 560, 520, { motion: { enter: { from: { y: 500 }, duration: 0.3, easing: { kind: "overshoot", amount: 1.4 } } } }),
    label(0.76, "ملف ٠٠١، الجيب الصغير", 600, 800, 54, { w: 720 }) ], 1.04) ]);
  await p.frame(1.0, "renders/f1.png"); await p.frame(2.0, "renders/f2.png"); await p.frame(3.0, "renders/f3.png"); await p.frame(4.0, "renders/f4.png");
  await p.render("renders/picture.mp4");
};
