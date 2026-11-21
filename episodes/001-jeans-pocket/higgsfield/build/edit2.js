// EP01 · Vox v2 — 2.5D camera on every beat, Higgsedit native. Times = edited VO word times (words_final.json).
export default async ({ project, text, rect, media, frame, icon, group }) => {
  const p = await project({ dir: "ep2", size: "1920x1080", fps: 30, background: "#1C1B19" });
  const add = (f) => p.add(f);
  const bold = await add("../a/IBMPlexSansArabic-Bold.ttf");
  const A = {}, L = {};
  for (const n of ["board","torn","jeans","watch","n1","n2","n3","n4","n5","xstamp","archive_man","archive_street","archive_building","tag","phone","pocket","logo","grain0","k3_last","k4_last"]) A[n] = await add(`../a/${n}.png`);
  for (const n of ["plate4","plate9","plate1","k4_maryam","k4_watch","k4_arrow","k9_maryam","k9_phone","k9_ring","k9_arrow","k1_maryam","k1_q1","k1_q2","k1_q3","k1_ex",
    "plate_clean","back_card","maryam_paper_cutout_cream_outline","pocket_front","small_patch","magnifier","maryam_think","maryam_chin","maryam_point"]) L[n] = await add(`../L/${n}.png`);
  const K = { k1: await add("../media/k1.mp4"), k2: await add("../media/k2.mp4"), k3: await add("../media/k3.mp4"), k4: await add("../media/k4.mp4") };
  const Y = "#F2CB3A", CREAM = "#F6F0E3", INK = "#1C1B19", RED = "#D2342B";
  const SH = { x: -12, y: 20, blur: 24, color: "rgba(0,0,0,.6)" };
  const MB = { samples: 8, shutter: 0.7 };
  const OS = (a = 2.2) => ({ kind: "overshoot", amount: a });
  const FADE = [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.05, value: 1 }] }];
  let D = 0; // current beat length, so delayed nodes get an explicit lifetime
  const life = (at, dur) => ({ at, duration: dur ?? Math.max(0.05, D - at) });
  const Fz = (opts, kids) => { const { z, ...rest } = opts; const f = frame(rest, kids); const holder = frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none" }, [f]); return z === undefined ? holder : group({ z }, [holder]); };
  const T = (s, size, o = {}) => text(s, { typography: { fontAssetId: bold.id, direction: "rtl", script: "Arab", language: "ar" },
    fontSize: size, color: o.color ?? INK, align: "center", x: o.x ?? 0, y: o.y ?? 0, width: o.width, lineHeight: 1.15 });
  const pop = (r = -6) => ({ enter: { from: { scale: 0.4, rotation: r }, duration: 0.22, easing: OS() } });
  const slam = { enter: { from: { scale: 2.0, rotation: 9 }, duration: 0.15, easing: "ease-in" } };
  const fly = (dx, dy = 0) => ({ enter: { from: { x: dx, y: dy, rotation: dx > 0 ? 8 : -8 }, duration: 0.28, easing: OS(1.5) } });
  // nodes (top level of a 2.5D beat: each takes z)
  const card = (at, x, y, w, h, s, size, o = {}) => Fz({ ...life(at, o.dur), x, y, width: w, height: h, layout: "none", origin: "center",
      motion: o.motion ?? pop(o.r ?? -5), animate: FADE, shadow: SH, z: o.z, motionBlur: MB }, [
    media({ file: A.torn, x: 0, y: 0, width: w, height: h, fit: "fill" }),
    ...(o.hl ? [frame({ at: o.hl[4], x: o.hl[0], y: o.hl[1], width: o.hl[2], height: o.hl[3], background: Y, layout: "none", reveal: { from: "right", duration: 0.2, easing: "house" } })] : []),
    T(s, size, { x: 20, y: (h - size * 1.3) / 2, width: w - 40 }) ]);
  const img = (at, file, x, y, w, o = {}) => Fz({ ...life(at, o.dur), x, y, width: w, height: o.h ?? w, layout: "none", origin: "center",
      motion: o.motion ?? pop(o.r ?? -6), animate: o.animate ?? FADE, shadow: o.noShadow ? undefined : SH, z: o.z, motionBlur: MB }, [
    media({ file, x: 0, y: 0, width: w, height: o.h, fit: o.h ? "contain" : "width" }), ...(o.kids ?? []) ]);
  const X = (at, x, y, w = 240, o = {}) => img(at, A.xstamp, x, y, w, { motion: slam, noShadow: true, z: o.z, dur: o.dur });
  const label = (at, s, x, y, size, w, o = {}) => Fz({ ...life(at, o.dur), x, y, width: w, height: size * 1.6, layout: "none", origin: "center",
      background: CREAM, motion: { enter: { from: { x: 300 }, duration: 0.2, easing: "house" } }, animate: FADE, shadow: SH, z: o.z, motionBlur: MB }, [
    T(s, size, { x: 0, y: size * 0.12, width: w }) ]);
  const bg = (file = A.board) => media({ file, x: -700, y: -500, width: 3320, height: 2080, fit: "cover", z: 500 });
  // a plate as a 2.5D layer stack (1672×941 keyframes or 1920×1080 plates), oversized so camera moves never show an edge
  const plateLayer = (file, srcW, z, o = {}) => {
    const s = o.s ?? 1.3, W = 1920 * s, H = 1080 * s, x0 = (1920 - W) / 2, y0 = (1080 - H) / 2;
    return media({ file, x: x0 + (o.dx ?? 0), y: y0 + (o.dy ?? 0), width: W, height: H, fit: "fill", z, shadow: o.shadow ? SH : undefined, motionBlur: MB, animate: o.animate });
  };
  const box = (srcW, bx, by, s = 1.3) => { const k = 1920 * s / srcW, W = 1920 * s, H = 1080 * s; return [(1920 - W) / 2 + bx * k, (1080 - H) / 2 + by * k, k]; };
  const finishNodes = (dur) => [
    rect({ x: 0, y: 0, width: 1920, height: 1080, fill: { kind: "radial", stops: [{ offset: 0.5, color: "#000000", opacity: 0 }, { offset: 1, color: "#000000", opacity: 0.6 }] } }),
    media({ file: A.grain0, x: 0, y: 0, width: 1920, height: 1080, fit: "cover", opacity: 0.9,
      animate: [{ property: "offsetX", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 0.067, value: -7, easing: "hold" }, { at: 0.133, value: 5, easing: "hold" }, { at: 0.2, value: 0 }], repeat: Math.max(1, Math.floor(dur / 0.2) - 1) }] }) ];
  // a 2.5D beat: whip in from the right, drift and push, whip out to the left
  const beat3d = (at, dur, kids, o = {}) => {
    D = dur;
    const w = o.whip ?? 520, e = Math.min(0.2, dur / 6), dx = o.dx ?? 90, dl = o.dolly ?? 150;
    const keys = [{ at, x: w, y: 0, dolly: 0 }, { at: at + e, x: -dx / 2, y: 0, dolly: 10, easing: "ease-out" },
      { at: at + dur - 0.12, x: dx / 2, y: o.dy ?? -20, dolly: dl, easing: "linear" }, { at: at + dur, x: dx / 2 - (o.whipOut ?? 380), y: o.dy ?? -20, dolly: dl + 20, easing: "ease-in" }];
    p.compose([...kids(), ...finishNodes(dur)], { at, dur, camera: { focal: 1000, keyframes: keys } });
  };
  // an AI shot: whip in, then the shot; overlays on top
  const shot = (at, dur, k, trim, overlays) => {
    D = dur;
    p.compose([frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none", motionBlur: MB,
        motion: { enter: { from: { x: 420 }, duration: 0.16, easing: "ease-out" } } }, [
      media({ file: K[k], x: 0, y: 0, width: 1920, height: 1080, fit: "cover", trimStart: trim }) ]), ...overlays(), ...finishNodes(dur)], { at, dur });
  };
  const still = (at, dur, file, overlays) => {
    D = dur;
    p.compose([frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none", origin: "center", animate: [{ property: "scale", from: 1.0, to: 1.12, duration: dur, easing: "ease-out" }] }, [
      media({ file, x: 0, y: 0, width: 1920, height: 1080, fit: "cover" }) ]), ...overlays(), ...finishNodes(dur)], { at, dur });
  };
  const HOLD = { enter: { from: { scale: 1 }, duration: 0.05 } };

  // 1 · 0.00 «تخيلوا… موجود من أكثر من ١٥٠ سنة»
  shot(0, 5.04, "k1", 0, () => [ card(2.80, 560, 820, 800, 190, "موجود من أكثر من ١٥٠ سنة", 64, { hl: [190, 50, 200, 95, 0.66] }) ]);
  // 2 · 5.04 «ليش للحين موجود إذا حتى تليفوننا ما يدخل فيه؟»
  shot(5.04, 4.20, "k2", 0.3, () => [ card(0.46, 1040, 60, 820, 180, "ليش للحين موجود؟", 84, { hl: [330, 40, 330, 110, 0.5] }), X(3.51, 620, 520, 300) ]);
  // 3 · 9.24 «لا مو بحق العملات ولا حق الأشياء اللي دايماً نضيعها»
  beat3d(9.24, 3.91, () => [ bg(),
    label(0.06, "مو حق…", 700, 120, 64, 400),
    img(0.96, A.tag, 560, 280, 680, { z: 60, kids: [ T("العملات؟", 88, { x: 150, y: 68, width: 490 }) ] }),
    X(1.56, 1100, 260, 190),
    img(2.26, A.tag, 120, 560, 680, { z: 30, kids: [ T("الأشياء اللي نضيعها؟", 42, { x: 150, y: 94, width: 510 }) ] }),
    X(3.46, 660, 520, 190),
    img(0.10, L.maryam_think, 1360, 520, 540, { z: -40, motion: fly(700), animate: [ ...FADE, { property: "scale", keyframes: [{ at: 1.6, value: 1 }, { at: 1.7, value: 1.06 }, { at: 1.85, value: 1 }, { at: 3.3, value: 1 }, { at: 3.4, value: 1.06 }, { at: 3.55, value: 1 }] } ] }) ], { dolly: 170 });
  // 4 · 13.15 «عشان نفهم السالفة لازم نرجع لسنة ١٨٧٣»
  beat3d(13.15, 4.25, () => [ bg(),
    card(0.05, 560, 70, 800, 170, "عشان نفهم السالفة…", 70, { z: -40 }),
    img(1.55, A.archive_man, 220, 280, 400, { h: 560, z: 120, r: -9 }),
    img(1.80, A.archive_street, 760, 330, 400, { h: 500, z: 220, r: 6 }),
    img(2.05, A.archive_building, 1290, 280, 350, { h: 590, z: 80, r: -4 }),
    Fz({ ...life(3.15), x: 560, y: 500, width: 800, height: 360, layout: "none", origin: "center", motion: slam, animate: FADE, background: "rgba(28,27,25,.6)", radius: 22, z: -40, motionBlur: MB }, [
      rect({ x: 0, y: 0, width: 800, height: 360, fill: "rgba(0,0,0,0)", strokeColor: RED, strokeWidth: 16, radius: 22 }),
      T("١٨٧٣", 250, { x: 0, y: 20, width: 800, color: RED }) ]),
    label(3.45, "تصوّر توضيحي", 1400, 920, 42, 360) ], { dolly: 260, dx: 140 });
  // 5a · 17.40 «في هالوقت ما كان عند الناس ساعات ذكية»
  beat3d(17.40, 3.55, () => [ bg(),
    card(0.05, 460, 70, 1000, 170, "في هالوقت ما كان عند الناس…", 62, { z: -30 }),
    Fz({ ...life(2.65), x: 700, y: 330, width: 520, height: 520, layout: "none", origin: "center", motion: pop(), animate: FADE, z: 40, motionBlur: MB }, [
      icon("watch", { x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }), T("ساعات ذكية", 64, { x: 0, y: 380, width: 520, color: CREAM }) ]),
    X(3.35, 830, 330, 300),
    img(0.20, L.maryam_chin, 1380, 500, 520, { z: -40, motion: fly(700) }) ], { dolly: 140 });
  // 5b · 20.95 «ولا حتى ساعات إيد منتشرة مثل اليوم»
  beat3d(20.95, 2.75, () => [ bg(),
    Fz({ ...life(0.05), x: 700, y: 260, width: 520, height: 560, layout: "none", origin: "center", motion: pop(6), animate: FADE, z: 40, motionBlur: MB }, [
      icon("clock", { x: 110, y: 40, size: 300, color: CREAM, strokeWidth: 1.6 }), T("ساعات إيد", 64, { x: 0, y: 380, width: 520, color: CREAM }) ]),
    X(1.65, 830, 260, 300),
    img(0.10, L.maryam_think, 120, 500, 520, { z: -40, motion: fly(-700) }) ], { dolly: 140, whip: -520, whipOut: -380 });
  // 6 · 23.70 «كانوا يستخدمون شيء اسمه ساعة الجيب، ساعة صغيرة يحطونها في مخابيهم» — keyframe 4 in depth
  beat3d(23.70, 5.25, () => {
    const [ax, ay, k] = box(1672, 650, 320);
    return [
      plateLayer(L.plate4, 1672, 320),
      plateLayer(L.k4_watch, 1672, 140, { shadow: true, animate: [{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.3, value: -8 }, { at: 0.6, value: 0 }], repeat: 8 }] }),
      media({ file: L.k4_arrow, x: ax, y: ay, width: 260 * k, z: 100, animate: [{ property: "scale", keyframes: [{ at: 1.9, value: 1 }, { at: 2.0, value: 1.35 }, { at: 2.15, value: 1 }] }] }),
      plateLayer(L.k4_maryam, 1672, 0, { shadow: true }),
      card(1.85, 900, 690, 820, 200, "ساعة الجيب", 120, { hl: [180, 35, 470, 140, 0.4], z: -50, motion: slam }),
      card(4.00, 160, 120, 700, 150, "يحطونها في مخابيهم", 56, { z: -50 }),
      label(0.4, "تصوّر توضيحي", 1380, 140, 40, 340, { z: -50 }) ];
  }, { dolly: 300, dx: 160, whip: 300, whipOut: 260 });
  // 7 · 28.95 «وعشان شي أول تصاميم الجينز من ليفايز كان فيها جيب صغير مخصّص لهالساعة»
  shot(28.95, 5.0, "k3", 0, () => [ label(1.15, "أول جينز من ليفايز", 1180, 70, 60, 660), card(3.75, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, { hl: [80, 45, 640, 100, 0.7] }) ]);
  still(33.95, 0.85, A.k3_last, () => [ card(0, 120, 800, 800, 180, "جيب صغير مخصّص للساعة", 64, { motion: HOLD, hl: [80, 45, 640, 100, 0] }) ]);
  // 8a · 34.80 «بس الغريب العجيب أن الساعات اتغيّرت»
  beat3d(34.80, 2.90, () => [ bg(),
    card(0.60, 520, 100, 880, 180, "بس الغريب العجيب…", 76, { hl: [130, 40, 610, 105, 0.4], z: -20 }),
    img(1.75, A.watch, 700, 330, 520, { z: 60, r: -18 }),
    card(2.10, 1300, 760, 560, 150, "الساعات تغيّرت", 60, { z: -30 }) ], { dolly: 160 });
  // 8b · 37.70 «والتكنولوجيا اتطوّرت»
  beat3d(37.70, 1.65, () => [ bg(),
    img(0.02, A.phone, 790, 160, 340, { h: 680, z: 40, motion: fly(0, -600) }),
    card(0.20, 1260, 760, 600, 150, "والتكنولوجيا تطوّرت", 58, { z: -30 }) ], { dolly: 200, whip: 420 });
  // 8c · 39.35 «والجيب للحين موجود» — keyframe 9 in depth, the phone still trying
  beat3d(39.35, 1.45, () => [
    plateLayer(L.plate9, 1672, 320),
    plateLayer(L.k9_phone, 1672, 120, { shadow: true, animate: [{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.12, value: 10 }, { at: 0.24, value: -4 }, { at: 0.36, value: 0 }], repeat: 3 }] }),
    plateLayer(L.k9_maryam, 1672, 0, { shadow: true }),
    card(0.08, 860, 740, 820, 190, "والجيب… للحين موجود", 72, { hl: [40, 45, 380, 105, 0.3], z: -50, motion: slam }) ], { dolly: 180, whip: 300, whipOut: 300 });
  // 9a · 40.80 «والأغرب أن هالجيب أصلاً مو هو الجيب الخامس مثل ما يعتقد البعض»
  const jx = 560, jy = 120, jw = 760, sc = jw / 913, jp = (px, py) => [jx + px * sc, jy + py * sc];
  const s1 = jp(266, 140), f1 = jp(255, 245), f2 = jp(640, 245);
  beat3d(40.80, 5.55, () => [ bg(),
    img(0.05, A.jeans, jx, jy, jw, { h: 1086 * sc, z: 60 }),
    card(0.05, 1280, 110, 540, 160, "والأغرب…", 76, { z: -20 }),
    img(2.50, A.n5, s1[0] - 190, s1[1] - 130, 140, { z: -40 }),
    label(2.75, "الجيب الخامس؟", 120, s1[1] - 130, 60, 450, { z: -20 }),
    X(4.45, s1[0] - 230, s1[1] - 170, 240, { z: -30 }) ], { dolly: 130, dx: 60, dy: -40 });
  // 9b · 46.35 «لأنه كان موجود من أول تصميم في أربع جيوب»
  beat3d(46.35, 2.85, () => [ bg(),
    img(0.02, A.jeans, jx, jy, jw, { h: 1086 * sc, z: 60, motion: { enter: { from: { scale: 1.15 }, duration: 0.2, easing: "ease-out" } } }),
    card(0.05, 1330, 80, 540, 240, "موجود من أول تصميم", 58, { z: -60 }),
    img(2.05, A.n1, f1[0] - 55, f1[1] - 10, 120, { z: -30 }),
    img(2.17, A.n2, f2[0] - 55, f2[1] - 10, 120, { z: -30 }),
    img(2.29, A.n3, s1[0] + 40, s1[1] - 150, 110, { z: -30 }),
    img(2.41, A.n4, 1390, 620, 130, { z: -30 }),
    label(2.41, "+ جيب خلفي واحد", 1520, 640, 50, 400, { z: -60 }),
    card(2.45, 1330, 820, 540, 170, "٤ جيوب", 100, { hl: [140, 25, 260, 125, 0.12], z: -90, motion: slam }) ], { dolly: 120, whip: 260 });
  // 10 · 49.20 «يعني إحنا للحين نلبس قطعة تصميم عمرها أكثر من قرن ونص» — the jeans travel the timeline
  beat3d(49.20, 5.15, () => [ bg(),
    Fz({ ...life(0.20), x: 260, y: 600, width: 1400, height: 12, layout: "none", background: CREAM, radius: 6, z: 40, reveal: { from: "right", duration: 0.8, easing: "house" } }),
    Fz({ ...life(0.20), x: 1490, y: 510, width: 340, height: 300, layout: "none", origin: "center", motion: pop(), animate: FADE, z: 40 }, [
      rect({ x: 130, y: 60, width: 80, height: 80, fill: CREAM, radius: 40 }), T("١٨٧٣", 80, { x: 0, y: 160, width: 340, color: CREAM }) ]),
    Fz({ ...life(0.95), x: 90, y: 510, width: 340, height: 300, layout: "none", origin: "center", motion: pop(), animate: FADE, z: 40 }, [
      rect({ x: 130, y: 60, width: 80, height: 80, fill: RED, radius: 40 }), T("اليوم", 80, { x: 0, y: 160, width: 340, color: CREAM }) ]),
    Fz({ ...life(0.30), x: 1520, y: 300, width: 260, height: 310, layout: "none", origin: "center", z: -60, shadow: SH, motionBlur: MB,
        animate: [{ property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 0.6, value: 0 }, { at: 3.4, value: -1360, easing: "ease-in-out" }] },
                  { property: "rotation", keyframes: [{ at: 0.6, value: 0 }, { at: 1.4, value: -6 }, { at: 2.2, value: 5 }, { at: 3.0, value: -4 }, { at: 3.4, value: 0 }] }] }, [
      media({ file: A.jeans, x: 0, y: 0, width: 260, height: 310, fit: "contain" }) ]),
    card(1.90, 360, 90, 1200, 190, "نلبس قطعة عمرها…", 76, { z: -40 }),
    card(3.80, 460, 740, 1000, 220, "أكثر من قرن ونص", 106, { hl: [80, 50, 520, 130, 0.65], z: -50, motion: slam }) ], { dolly: 90, dx: 30 });
  // 11 · 54.35 «الحين عندي سؤال: انتو شو تحطون في هالجيب؟ ولا للحين ما عرفتوا حق شو تستخدمونه؟»
  shot(54.35, 5.0, "k4", 0, () => [ card(2.15, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, { hl: [60, 45, 330, 115, 0.75] }), card(3.45, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64) ]);
  still(59.35, 0.75, A.k4_last, () => [ card(0, 980, 70, 880, 200, "شو تحطّون في هالجيب؟", 76, { motion: HOLD, hl: [60, 45, 330, 115, 0] }), card(0, 1060, 820, 800, 170, "ولا للحين ما عرفتوا؟", 64, { motion: HOLD }) ]);
  // 12 · 60.10 «غريب… عجيب» — Maryam rises out of the pocket (scene-01 plate, in depth) as the logo stamps
  beat3d(60.10, 2.30, () => [
    plateLayer(L.plate_clean, 1920, 320, { s: 1.25 }),
    media({ file: L.back_card, x: 315 * 1.25 - 240, y: 25 * 1.25 - 135, width: 860 * 1.25, height: 600 * 1.25, z: 260 }),
    Fz({ x: -240, y: -135, width: 2400, height: 1350, layout: "none", z: 180, motionBlur: MB }, [
      media({ file: L.maryam_paper_cutout_cream_outline, x: 270 * 1.25, y: 60 * 1.25, width: 940 * 1.25, shadow: SH,
        animate: [{ property: "offsetY", keyframes: [{ at: 0, value: 600 }, { at: 0.12, value: 600 }, { at: 0.4, value: -170, easing: [0.34, 1.56, 0.64, 1] }, { at: 2.3, value: -170 }] }] }) ]),
    plateLayer(L.pocket_front, 1920, 100, { s: 1.25, shadow: true }),
    plateLayer(L.small_patch, 1920, 100, { s: 1.25 }),
    img(0.08, A.logo, 1060, 110, 720, { h: 514, motion: slam, z: -40 }),
    label(0.76, "ملف ٠٠١، الجيب الصغير", 1090, 680, 52, 660, { z: -40 }) ], { dolly: 120, dx: 50, whip: 300, whipOut: 0 });
  await p.render("renders/picture.mp4");
};
