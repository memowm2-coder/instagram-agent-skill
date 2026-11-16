import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Sticker, Strip, Label, Draw, Halftone, keys, step, boil, ease, pop, ringPath, clamp} from './kit';

const I = (p: string) => `img/${p}`;
const S = (p: string) => `st/${p}.png`;
const BG: React.FC<{img: string; grid?: number; filter?: string}> = ({img, grid = 0, filter}) => (
  <>
    <Img src={staticFile(I(img))} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, filter}} />
    {grid > 0 && <Img src={staticFile(I('engineering_grid.png'))} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, opacity: grid}} />}
  </>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(2px 3px 0 rgba(20,16,10,.35))'}}>{children}</svg>
);
export type BoardProps = {f: number; len: number};

// Maryam's original photo cutout. Rigid paper only: translate / rotate / scale, never redrawn.
const Maryam: React.FC<{f: number; x: number; y: number; w: number; dx?: number; dy?: number; rot?: number; seed?: number; paper?: boolean; z?: number}> = ({f, x, y, w, dx = 0, dy = 0, rot = 0, seed = 3, paper = true, z}) => (
  <Sticker f={f} s={I(paper ? 'maryam_original_paper_cutout.png' : 'maryam_original_identity_cutout.png')} x={x} y={y} w={w} mode="none" dx={dx} dy={dy} rot={rot} seed={seed} amp={1.4} z={z} />
);

// ── 01 · THE MYSTERY ─────────────────────────────────────────────────
export const B1: React.FC<BoardProps & {loop?: boolean}> = ({f, loop}) => {
  const g = step(f);
  // three distinct stop-motion rises from behind the pocket lip (reversed for the loop)
  const rise: [number, number][] = [[-99, 520], [18, 360], [21, 340], [30, 180], [33, 162], [42, -4], [45, 14], [48, 0]];
  const sink: [number, number][] = [[-99, 0], [150, 162], [153, 180], [162, 340], [165, 360], [174, 520]];
  const dy = keys(g, loop ? sink : rise);
  const rot = keys(g, loop ? [[-99, 0], [150, 2.5], [162, -3], [174, 0]] : [[-99, 0], [18, -3], [30, 2.5], [42, -2], [48, -0.8]]);
  return (
    <AbsoluteFill>
      <BG img="ivory_paper_1920x1080.png" grid={0.35} />
      {/* background collage */}
      <Sticker f={f} s={S('letter')} x={40} y={40} w={420} rot={-8} mode="none" seed={11} />
      <Sticker f={f} s={S('city')} x={1290} y={720} w={600} rot={4} mode="none" seed={12} filter="sepia(.4)" />
      <Sticker f={f} s={S('redstrip')} x={-60} y={330} w={760} rot={-3} mode="none" seed={13} />
      <Sticker f={f} s={S('bluestrip')} x={1150} y={36} w={760} rot={2} mode="none" seed={14} />
      <Sticker f={f} s={S('notebook')} x={1330} y={420} w={430} rot={6} mode="none" seed={15} />
      {/* Maryam behind the pocket */}
      <Maryam f={f} x={520} y={40} w={760} dy={dy} rot={rot} />
      <Sticker f={f} s={I('watch_pocket_master.png')} x={300} y={330} w={1100} mode="none" seed={16} amp={1} />
      <Sticker f={f} s={S('tape1')} x={290} y={360} w={220} rot={-32} mode="none" seed={17} />
      <Sticker f={f} s={S('tape2')} x={1230} y={380} w={220} rot={28} mode="none" seed={18} />
      {!loop && (
        <>
          <Strip f={f} words={['ليش', 'الجينز', 'فيه', 'جيب', 'صغير؟']} x={1180} y={110} w={700} at={58} size={96} hl={[4]} />
          <Sticker f={f} s={S('zig')} x={1340} y={560} w={230} rot={-120} at={112} seed={19} />
          <Svg><Draw d={ringPath(830, 770, 300, 175)} p={(f - 96) / 22} color="#F6F0E3" w={8} /></Svg>
          <Label f={f} text="ملف ٠٠١" x={70} y={940} at={130} />
        </>
      )}
      {loop && (
        <Sticker f={f} s={I('logo.png')} x={1160} y={90} w={720} at={36} rot={-3} seed={20} />
      )}
    </AbsoluteFill>
  );
};

// ── 02 · THE MODERN PROBLEM ──────────────────────────────────────────
export const B2: React.FC<BoardProps> = ({f}) => {
  const g = step(f);
  const P: [number, [number, number, number]][] = [
    [-99, [0, -1100, -10]], [30, [0, -860, -6]], [33, [0, -560, -2]], [36, [0, -300, 2]], [39, [0, -120, 4]], [42, [0, 20, 5]], [46, [0, 80, 4]],
    [52, [0, 66, 7]], [56, [0, 82, 2]], [60, [0, 68, 8]], [64, [0, 80, 3]], [68, [0, 70, 7]], [72, [0, 78, 4]],
    [96, [80, -60, -12]], [99, [260, -260, -28]], [102, [470, -230, -46]], [105, [640, -40, -64]], [108, [740, 220, -82]], [111, [770, 300, -90]], [114, [770, 286, -88]], [117, [770, 294, -90]],
  ];
  let pv = P[0][1];
  for (const [k, v] of P) if (g >= k) pv = v;
  const jolt = f >= 96 ? keys(g, [[96, -30], [99, -8], [102, -18], [105, 0]]) : 0;
  return (
    <AbsoluteFill>
      <BG img="denim_blue_1920x1080.png" />
      <Sticker f={f} s={S('denimstrip')} x={-40} y={20} w={900} rot={-2} mode="none" seed={21} />
      <Sticker f={f} s={S('lined')} x={1260} y={760} w={520} rot={-6} mode="none" seed={22} />
      <Sticker f={f} s={I('watch_pocket_master.png')} x={110} y={240} w={1020} mode="none" seed={23} amp={1} />
      {/* the phone sits between the pocket's back and front layers */}
      <Sticker f={f} s={I('smartphone_unbranded.png')} x={455} y={150} w={330} mode="none" dx={pv[0]} dy={pv[1]} extraRot={pv[2]} seed={24} amp={1} />
      <Sticker f={f} s={I('watch_pocket_master.png')} x={110} y={240} w={1020} mode="none" seed={23} amp={1} shadow={false} clip="inset(50% 0 0 0)" />
      <Maryam f={f} x={1200} y={300} w={760} dy={jolt} rot={f >= 96 ? keys(g, [[96, 3], [102, -2], [105, 0]]) : 0} paper={false} seed={25} />
      <Strip f={f} words={['حتى', 'الجوال…', 'ما', 'يدخل!']} x={1110} y={90} w={760} at={74} gap={7} size={88} hl={[3]} hlColor="#F28B6B" />
      {f >= 124 && <Sticker f={f} s={S('x')} x={400} y={470} w={420} at={124} rot={-6} seed={26} />}
      <Svg>
        <Draw d="M 420 900 L 860 900 M 420 880 L 420 920 M 860 880 L 860 920" p={(f - 60) / 12} color="#F6F0E3" w={4} />
      </Svg>
      <Label f={f} text="فتحة الجيب" x={540} y={920} at={66} />
    </AbsoluteFill>
  );
};

// ── 03 · TIME TRAVEL ─────────────────────────────────────────────────
export const B3: React.FC<BoardProps> = ({f}) => (
  <AbsoluteFill>
    <BG img="sepia_archival_1920x1080.png" />
    <Sticker f={f} s={S('letter')} x={1340} y={60} w={520} rot={7} mode="none" seed={31} filter="sepia(.5)" />
    <Sticker f={f} s={S('city')} x={90} y={130} w={1240} rot={-3} at={0} mode="slideR" seed={32} filter="sepia(.7) contrast(1.05)" />
    <Halftone opacity={0.14} />
    <Sticker f={f} s={I('date_1873_card.png')} x={-40} y={60} w={1920} rot={-4} at={28} seed={33} />
    <Sticker f={f} s={S('arrowB')} x={1240} y={760} w={460} rot={180} at={60} seed={34} />
    <Sticker f={f} s={S('tape2')} x={500} y={360} w={230} rot={-20} at={36} seed={35} />
    <Maryam f={f} x={1360} y={460} w={600} dx={keys(step(f), [[-99, 700], [50, 380], [53, 120], [56, -16], [59, 0]])} rot={keys(step(f), [[-99, 0], [50, 3], [56, -2], [59, 0]])} seed={36} />
    <Strip f={f} words={['نرجع', 'لسنة', '١٨٧٣']} x={300} y={830} w={900} at={44} size={84} hl={[2]} />
    <Label f={f} text="تصوّر توضيحي" x={120} y={140} at={20} size={26} dark />
  </AbsoluteFill>
);

// ── 04 · THE DISCOVERY ───────────────────────────────────────────────
export const B4: React.FC<BoardProps> = ({f, len}) => {
  const g = step(f);
  const enter = keys(g, [[-99, -1100], [9, -700], [12, -320], [15, -60], [18, 14], [21, 0]]);
  const swing = Math.sin(g / 9) * 9 * Math.max(0.25, 1 - f / len);
  return (
    <AbsoluteFill>
      <BG img="ivory_paper_1920x1080.png" grid={0.3} />
      <Sticker f={f} s={S('notebook')} x={60} y={640} w={560} rot={-7} mode="none" seed={41} />
      <Sticker f={f} s={S('redstrip')} x={1100} y={980} w={900} rot={2} mode="none" seed={42} />
      <Sticker f={f} s={I('watch_illustrative_NOT_ARCHIVE.png')} x={380} y={60} w={820} mode="none" dy={enter} extraRot={swing} origin="62% 8%" seed={43} amp={1} />
      <Sticker f={f} s={S('loop')} x={300} y={220} w={260} rot={10} at={60} seed={44} />
      <Maryam f={f} x={1240} y={380} w={700} dx={keys(g, [[-99, 700], [54, 380], [57, 120], [60, -14], [63, 0]])} rot={keys(g, [[-99, 0], [54, -3], [60, 2], [63, 0]])} seed={45} />
      <Sticker f={f} s={S('tag')} x={1100} y={70} w={720} rot={4} at={84} seed={46} />
      {f >= 92 && (
        <div style={{position: 'absolute', left: 1390, top: 168, width: 400, transform: 'rotate(4deg)', direction: 'rtl', textAlign: 'center', fontFamily: 'Plex', fontWeight: 700, fontSize: 46, color: '#1C1B19', lineHeight: 1.45}}>
          شي كان <span style={{background: `linear-gradient(transparent 55%, #F2D14B 55%)`, backgroundSize: `${clamp((f - 104) / 10) * 100}% 100%`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right'}}>كل الناس</span><br />تحمله…
        </div>
      )}
      <Label f={f} text="تصوّر توضيحي" x={420} y={950} at={30} size={24} dark />
    </AbsoluteFill>
  );
};

// ── 05 · THE POCKET REVEAL (architectural section) ──────────────────
export const B5: React.FC<BoardProps> = ({f}) => {
  const g = step(f);
  const sep = ease(f, 60, 78) * 70;
  const wy = keys(g, [[-99, -900], [150, -560], [153, -260], [156, -40], [159, 40], [162, 22], [165, 30]]);
  const reveal = f >= 290;
  return (
    <AbsoluteFill>
      <BG img="ivory_paper_1920x1080.png" grid={0.75} />
      <Img src={staticFile(I('pocket_section_overlay.png'))} style={{position: 'absolute', inset: 0, opacity: ease(f, 80, 96) * 0.7}} />
      <Sticker f={f} s={S('framecard')} x={1360} y={640} w={480} rot={5} mode="none" seed={51} />
      <Sticker f={f} s={I('watch_pocket_master.png')} x={400} y={170} w={880} mode="none" dx={-sep / 2} extraRot={-ease(f, 60, 78) * 2} seed={52} amp={1} clip="polygon(0 0, 51% 0, 49% 100%, 0 100%)" />
      <Sticker f={f} s={I('watch_illustrative_NOT_ARCHIVE.png')} x={630} y={220} w={420} mode="none" dy={wy} extraRot={keys(g, [[-99, -14], [156, -4], [162, 0]])} seed={53} amp={1} />
      <Sticker f={f} s={I('watch_pocket_master.png')} x={400} y={170} w={880} mode="none" dx={sep / 2} extraRot={ease(f, 60, 78) * 2} seed={54} amp={1} clip="polygon(51% 0, 100% 0, 100% 100%, 49% 100%)" />
      <Svg>
        <Draw d="M 848 90 L 832 1010" p={(f - 30) / 24} color="#1C1B19" w={5} />
        <Draw d="M 520 1000 L 1160 1000 M 520 980 L 520 1020 M 1160 980 L 1160 1020" p={(f - 112) / 14} color="#2F4A6D" w={4} />
        <Draw d="M 1330 240 L 1330 820 M 1310 240 L 1350 240 M 1310 820 L 1350 820" p={(f - 128) / 14} color="#2F4A6D" w={4} />
        {reveal && <Draw d={ringPath(840, 520, 300, 250, 14)} p={(f - 290) / 18} color="#C9302A" w={11} />}
      </Svg>
      <Label f={f} text="مقطع" x={860} y={60} at={44} />
      <Label f={f} text="عرض الجيب" x={760} y={1018} at={124} size={26} />
      <Label f={f} text="العمق" x={1360} y={510} at={140} size={26} />
      {reveal && <Strip f={f} words={['ساعة', 'جيب!']} x={1250} y={110} w={600} at={302} gap={6} size={110} red={[0, 1]} />}
      <Label f={f} text="تصوّر توضيحي" x={70} y={970} at={20} size={24} dark />
    </AbsoluteFill>
  );
};

// ── 06 · THE HISTORICAL TWIST ───────────────────────────────────────
export const B6: React.FC<BoardProps> = ({f}) => {
  const card = (at: number, top: number, border: string, title: string, sub: string, rot: number, seed: number) => {
    if (f < at) return null;
    const g = step(f);
    const b = boil(g, seed, 1, 0.3);
    const tx = keys(g, [[at, 900], [at + 3, 420], [at + 6, 80], [at + 9, -12], [at + 12, 0]]);
    return (
      <div style={{position: 'absolute', left: 1120, top, width: 720, direction: 'rtl', textAlign: 'right', fontFamily: 'Plex', background: '#FBF6EA', padding: '26px 34px 30px', borderTop: `10px solid ${border}`,
        transform: `translate(${tx + b.x}px,${b.y}px) rotate(${rot + b.r}deg)`, filter: 'drop-shadow(-8px 12px 9px rgba(0,0,0,.38))'}}>
        <div style={{fontWeight: 700, fontSize: 66, color: '#1C1B19'}}>{title}</div>
        <div style={{fontWeight: 500, fontSize: 36, color: '#2A2826'}}>{sub}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <BG img="ivory_paper_1920x1080.png" grid={0.3} />
      <Sticker f={f} s={S('bluestrip')} x={-80} y={990} w={1200} rot={-2} mode="none" seed={61} />
      <Sticker f={f} s={I('jeans_master.png')} x={-40} y={40} w={1180} rot={-2} mode="none" seed={62} amp={1} />
      <Sticker f={f} s={S('n1')} x={160} y={300} w={120} at={40} seed={63} />
      <Sticker f={f} s={S('n2')} x={760} y={300} w={120} at={54} seed={64} />
      <Sticker f={f} s={S('n3')} x={300} y={-10} w={120} at={68} seed={65} />
      <Sticker f={f} s={S('n4')} x={880} y={620} w={120} at={82} seed={66} />
      <Label f={f} text="جيب خلفي واحد" x={830} y={760} at={84} size={28} />
      <Svg>
        <Draw d={ringPath(380, 170, 95, 66, 6)} p={(f - 68) / 16} color="#C9302A" w={9} />
      </Svg>
      {card(26, 110, '#1C1B19', '١٨٧٣: أربع جيوب', 'والصغير موجود من البداية… قدّام', -1.5, 67)}
      {card(250, 470, '#2F4A6D', '١٩٠١: الجيب الخامس', 'هو الخلفي الثاني… مب الصغير', 1.5, 68)}
      <Sticker f={f} s={S('n5')} x={1700} y={420} w={130} at={266} rot={8} seed={69} />
      <Label f={f} text="المصدر: Levi Strauss & Co." x={1130} y={900} at={60} size={24} />
    </AbsoluteFill>
  );
};

// ── 07 · PRESENT DAY ─────────────────────────────────────────────────
export const B7: React.FC<BoardProps> = ({f}) => (
  <AbsoluteFill>
    <BG img="denim_blue_1920x1080.png" />
    <Sticker f={f} s={S('redstrip')} x={-60} y={60} w={1100} rot={-3} mode="none" seed={71} />
    <Sticker f={f} s={I('jeans_master.png')} x={40} y={140} w={880} rot={-3} at={4} mode="slideL" seed={72} />
    <Sticker f={f} s={I('smartphone_unbranded.png')} x={1030} y={200} w={290} rot={8} at={48} mode="drop" seed={73} />
    <Sticker f={f} s={I('watch_pocket_master.png')} x={600} y={330} w={720} rot={4} at={96} mode="slideR" seed={74} />
    <Sticker f={f} s={S('arrowA')} x={600} y={160} w={420} rot={160} at={150} seed={75} />
    <Strip f={f} words={['١٥٠', 'سنة…']} x={1200} y={110} w={680} at={124} size={96} />
    <Strip f={f} words={['والجيب', 'باقي']} x={1200} y={300} w={680} at={150} size={96} hl={[1]} rot={1.5} seed={50} />
    <Sticker f={f} s={S('clipcard')} x={1280} y={600} w={540} rot={-5} at={200} seed={76} />
    {f >= 206 && (
      <div style={{position: 'absolute', left: 1350, top: 790, width: 400, transform: `rotate(-5deg) scale(${pop(step(f), 206)})`, direction: 'rtl', textAlign: 'center', fontFamily: 'Plex', fontWeight: 700, fontSize: 40, color: '#1C1B19', lineHeight: 1.3}}>
        الساعة راحت…<br />والجيب ظل
      </div>
    )}
  </AbsoluteFill>
);
