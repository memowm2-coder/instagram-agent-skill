// EP02 · 10 s preview — surgical light (0–5 s) → afterimage eye (5–10 s). 2.5D camera, Higgsedit native.
export default async ({ project, text, rect, media, frame, icon, group }) => {
  const p = await project({ dir: "pv", size: "1920x1080", fps: 30, background: "#EFE6D4" });
  const add = (f) => p.add(f);
  const bold = await add("../../ep01/a/IBMPlexSansArabic-Bold.ttf");
  const A = {}, P = {}, M = {};
  for (const n of ["torn", "grain0"]) A[n] = await add(`../../ep01/a/${n}.png`);
  for (const n of ["surgical_light_collage_portrait", "vision_science_collage_with_medical_presenter"]) {
    P[n] = await add(`../P/${n}.png`); M[n] = await add(`../M/${n}__maryam.png`); }
  const Y = "#F2CB3A", CREAM = "#F6F0E3", INK = "#1C1B19", GREEN = "#1F7A5A";
  const SH = { x: -12, y: 20, blur: 24, color: "rgba(0,0,0,.55)" };
  const MB = { samples: 8, shutter: 0.7 };
  const OS = (a = 2.2) => ({ kind: "overshoot", amount: a });
  const FADE = [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.05, value: 1 }] }];
  let D = 0;
  const life = (at, dur) => ({ at, duration: dur ?? Math.max(0.05, D - at) });
  const Fz = (opts, kids) => { const { z, ...rest } = opts; const f = frame(rest, kids); const holder = frame({ x: 0, y: 0, width: 1920, height: 1080, layout: "none" }, [f]); return z === undefined ? holder : group({ z }, [holder]); };
  const T = (s, size, o = {}) => text(s, { typography: { fontAssetId: bold.id, direction: "rtl", script: "Arab", language: "ar" },
    fontSize: size, color: o.color ?? INK, align: "center", x: o.x ?? 0, y: o.y ?? 0, width: o.width, lineHeight: 1.15 });
  const pop = (r = -6) => ({ enter: { from: { scale: 0.4, rotation: r }, duration: 0.22, easing: OS() } });
  const slam = { enter: { from: { scale: 2.0, rotation: 9 }, duration: 0.15, easing: "ease-in" } };
  const card = (at, x, y, w, h, s, size, o = {}) => Fz({ ...life(at, o.dur), x, y, width: w, height: h, layout: "none", origin: "center",
      motion: o.motion ?? pop(o.r ?? -5), animate: FADE, shadow: SH, z: o.z, motionBlur: MB }, [
    media({ file: A.torn, x: 0, y: 0, width: w, height: h, fit: "fill" }),
    ...(o.hl ? [frame({ at: o.hl[4], x: o.hl[0], y: o.hl[1], width: o.hl[2], height: o.hl[3], background: o.hlc ?? Y, layout: "none", reveal: { from: "right", duration: 0.2, easing: "house" } })] : []),
    T(s, size, { x: 20, y: (h - size * 1.3) / 2, width: w - 40 }) ]);
  const label = (at, s, x, y, size, w, o = {}) => Fz({ ...life(at, o.dur), x, y, width: w, height: size * 1.6, layout: "none", origin: "center",
      background: o.bg ?? INK, motion: { enter: { from: { x: 300 }, duration: 0.2, easing: "house" } }, animate: FADE, shadow: SH, z: o.z, motionBlur: MB }, [
    T(s, size, { x: 0, y: size * 0.12, width: w, color: CREAM }) ]);
  const plateLayer = (file, z, o = {}) => { const s = o.s ?? 1.3, W = 1920 * s, H = 1080 * s;
    return media({ file, x: (1920 - W) / 2, y: (1080 - H) / 2, width: W, height: H, fit: "fill", z, shadow: o.shadow ? SH : undefined, motionBlur: MB, animate: o.animate }); };
  const box = (bx, by, s = 1.3) => { const k = 1920 * s / 1672, W = 1920 * s, H = 1080 * s; return [(1920 - W) / 2 + bx * k, (1080 - H) / 2 + by * k, k]; };
  const glow = (cx, cy, r, color, z, keys) => { const [x, y, k] = box(cx, cy); const R = r * k;
    return Fz({ ...life(0), x: x - R, y: y - R, width: 2 * R, height: 2 * R, layout: "none", z,
      animate: [{ property: "opacity", keyframes: keys }] }, [
      rect({ x: 0, y: 0, width: 2 * R, height: 2 * R, fill: { kind: "radial", stops: [{ offset: 0, color, opacity: 0.95 }, { offset: 0.3, color, opacity: 0.6 }, { offset: 0.68, color, opacity: 0 }] } }) ]); };
  const finishNodes = (dur) => [
    rect({ x: 0, y: 0, width: 1920, height: 1080, fill: { kind: "radial", stops: [{ offset: 0.55, color: "#2A1A0A", opacity: 0 }, { offset: 1, color: "#2A1A0A", opacity: 0.32 }] } }),
    media({ file: A.grain0, x: 0, y: 0, width: 1920, height: 1080, fit: "cover", opacity: 0.9,
      animate: [{ property: "offsetX", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 0.067, value: -7, easing: "hold" }, { at: 0.133, value: 5, easing: "hold" }, { at: 0.2, value: 0 }], repeat: Math.max(1, Math.floor(dur / 0.2) - 1) }] }) ];
  const beat3d = (at, dur, kids, o = {}) => {
    D = dur;
    const w = o.whip ?? 520, e = Math.min(0.2, dur / 6), dx = o.dx ?? 90, dl = o.dolly ?? 150;
    const keys = [{ at, x: w, y: 0, dolly: 0 }, { at: at + e, x: -dx / 2, y: 0, dolly: 10, easing: "ease-out" },
      { at: at + dur - 0.12, x: dx / 2, y: o.dy ?? -20, dolly: dl, easing: "linear" }, { at: at + dur, x: dx / 2 - (o.whipOut ?? 380), y: o.dy ?? -20, dolly: dl + 20, easing: "ease-in" }];
    p.compose([...kids(), ...finishNodes(dur)], { at, dur, camera: { focal: 1000, keyframes: keys } });
  };

  // 1 · 0–5 s surgical light: lamp flares, Maryam shields her eyes
  beat3d(0, 5.0, () => [
    plateLayer(P.surgical_light_collage_portrait, 320),
    glow(905, 90, 330, "#FFFFFF", 300, [{ at: 0, value: 0 }, { at: 0.25, value: 1 }, { at: 0.55, value: 0.55 }, { at: 0.9, value: 0.95 }, { at: 1.4, value: 0.5 }, { at: 2.2, value: 0.85 }, { at: 3.2, value: 0.45 }, { at: 5, value: 0.7 }]),
    plateLayer(M.surgical_light_collage_portrait, 0, { shadow: true }),
    label(0.35, "غرفة العمليات", 230, 150, 50, 440, { z: -30 }),
    card(1.10, 200, 360, 720, 190, "ضو قوي… ولون أحمر", 62, { z: -30, hl: [395, 40, 250, 110, 0.5] }),
    card(2.80, 220, 640, 680, 210, "ليش مب أبيض؟", 92, { z: -40, motion: slam, hl: [70, 40, 240, 130, 0.35] }) ],
    { dolly: 110, dx: 100, whip: 520, whipOut: 420 });

  // 2 · 5–10 s afterimage: red fades, a green ghost appears on the silhouette
  beat3d(5.0, 5.0, () => [
    plateLayer(P.vision_science_collage_with_medical_presenter, 320),
    glow(1050, 290, 300, "#2FD39A", 300, [{ at: 0, value: 0 }, { at: 0.9, value: 0 }, { at: 1.2, value: 0.9 }, { at: 1.8, value: 0.5 }, { at: 2.4, value: 0.95 }, { at: 3.2, value: 0.55 }, { at: 4.0, value: 0.9 }, { at: 5, value: 0.6 }]),
    glow(760, 290, 120, "#FF3B2F", 300, [{ at: 0, value: 0.8 }, { at: 0.8, value: 0.8 }, { at: 1.1, value: 0 }]),
    plateLayer(M.vision_science_collage_with_medical_presenter, 0, { shadow: true }),
    label(0.25, "عيونك تتعب من الأحمر", 220, 120, 48, 600, { z: -30 }),
    card(1.20, 200, 650, 760, 210, "الصورة اللاحقة", 100, { z: -40, motion: slam, hl: [70, 40, 620, 130, 0.35], hlc: "#7FD8B4" }),
    label(3.00, "الأخضر والأزرق يريّحون العين", 200, 890, 46, 760, { z: -30, bg: GREEN }) ],
    { dolly: 100, dx: 100, whip: 520, whipOut: 0 });

  await p.render("renders/picture.mp4");
};
