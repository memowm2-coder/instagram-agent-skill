// ─────────────────────────────────────────────────────────────────────────────
// غريب عجيب · EP02 «ليش ملابس العمليات خضراء أو زرقاء؟» — scene configuration
//
// Every coordinate is in PLATE PIXELS of the approved storyboard PNGs (1672×941).
// The renderer scales plates to 1920×1080 (×1.1483). Times are SCENE-LOCAL seconds.
//
// No artwork is generated. Each animated scene is rebuilt from its own approved plate:
//   • board  = the plate with Maryam lifted out (gap filled from the surrounding plate pixels)
//   • clean  = the board with every "piece" lifted out too (tools/clean_plates.py)
//   • pieces = polygons cut from the board (same pixels), free to drop in, fly, flick, lift
//   • Maryam = the cutout mask from the same plate, free to slide in, lean and present
// At rest every layer sits exactly where it is in the approved image.
// ─────────────────────────────────────────────────────────────────────────────
import layers from './layers.json';

export type Pt = [number, number];
export type Xf = {x?: number; y?: number; r?: number; s?: number};
export type ActionKind =
  | 'enter'    // arrives from an offset (x/y/r/s) with an overshoot landing — hidden before `at`
  | 'exit'     // leaves to an offset
  | 'lift'     // paper lifts off the board: scale up + big shadow, settles back after `dur`
  | 'flick'    // fabric swatch flick: damped rotation/skew wobble
  | 'snap'     // pin / clip / colour chip snap: quick scale pop
  | 'develop'  // archival photo develops from washed-out to the approved print
  | 'dim'      // loses attention: desaturate + darken
  | 'wobble'   // continuous paper flutter (idle life)
  | 'pulse';   // continuous breathing
export type Action = {kind: ActionKind; at: number; amt?: number; dur?: number; from?: Xf; to?: Xf};
export type Piece = {id: string; poly: Pt[]; actions: Action[]};
export type Glow = {
  id: string; at: number; c: Pt; r: number; color: string;
  mode: 'pulse' | 'flicker' | 'glare'; strength?: number; front?: boolean; until?: number;
};
export type Trace = {id: string; at: number; dur: number; d: string; color?: string; width?: number; repeat?: number};
// hand-drawn chalk / marker marks drawn on over the existing art
export type Mark = {id: string; at: number; dur: number; kind: 'ellipse' | 'underline'; c: Pt; rx: number; ry: number; color: string; width?: number; until?: number};
export type CamKey = {t: number; s: number; c: Pt; ease?: 'out' | 'inout' | 'back' | 'whip'};
export type Sfx = {t: number; src: string; vol?: number; dur?: number; loop?: boolean};
export type Zone = {x: number; y: number; w: number; h: number; label: string};
export type TextLayer = {at: number; dur: number; text: string; zone: number; size?: number}; // optional, editable
export type MaryamAct = {kind: 'enter' | 'present' | 'react' | 'nod' | 'lean'; at: number; from?: Xf; amt?: number};
export type Exit = 'fileOpen' | 'rip' | 'slide' | 'stopJump' | 'diagramWipe' | 'pinSnap' | 'archivalReveal' | 'loopFade';

export type Scene = {
  id: string; title: string; from: number; to: number;
  plate: string; maryam: string; maryamBox: [number, number, number, number];
  board?: string; clean?: string;
  cam: CamKey[]; pieces: Piece[]; glows: Glow[]; traces: Trace[]; marks: Mark[];
  maryamActs: MaryamAct[]; sway?: number; sfx: Sfx[]; exit: Exit; exitDur: number;
  textSafe: Zone[]; texts: TextLayer[];
  status: 'animated' | 'base-only';
};

type LayerMeta = {plate: string; maryam: string; maryamBox: [number, number, number, number]; board?: string; clean?: string};
const L = layers as unknown as Record<string, LayerMeta>;
const base = (k: string, useBoards = false) => ({
  plate: L[k].plate, maryam: L[k].maryam, maryamBox: L[k].maryamBox,
  ...(useBoards ? {board: `plates/${k}_board.png`, clean: `plates/${k}_clean.png`} : {}),
  marks: [] as Mark[],
});
const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const CENTER: Pt = [836, 470];
const IN = (at: number, from: Xf, dur = 0.42): Action => ({kind: 'enter', at, from, dur});

export const FPS = 30;

export const SCENES: Scene[] = [
  // 01 · 0:00–0:05 — the board assembles itself in stop motion, Maryam slides in holding the green scrub,
  // the camera whips white → green → blue, chalk circle on the green scrub.
  {
    id: '01', title: 'medical_scrubs_transformation_collage', from: 0, to: 5, ...base('01', true),
    cam: [
      {t: 0, s: 1.04, c: CENTER},
      {t: 0.85, s: 1.06, c: CENTER, ease: 'inout'},
      {t: 1.15, s: 1.3, c: [640, 380], ease: 'whip'},
      {t: 1.75, s: 1.33, c: [660, 390], ease: 'inout'},
      {t: 2.05, s: 1.3, c: [960, 600], ease: 'whip'},
      {t: 2.85, s: 1.34, c: [975, 610], ease: 'inout'},
      {t: 3.15, s: 1.32, c: [1010, 300], ease: 'whip'},
      {t: 3.75, s: 1.34, c: [1015, 295], ease: 'inout'},
      {t: 4.15, s: 1.08, c: CENTER, ease: 'whip'},
      {t: 5.0, s: 1.1, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'blueSwatchBL', poly: [[198, 765], [345, 762], [352, 882], [205, 888]], actions: [IN(0.30, {x: -420, y: 60, r: -25}), {kind: 'wobble', at: 0.8}, {kind: 'flick', at: 3.2}]},
      {id: 'tealSwatch', poly: [[632, 578], [782, 582], [792, 700], [640, 698]], actions: [IN(0.24, {y: 420, r: 18}), {kind: 'wobble', at: 0.8}]},
      {id: 'eyeDiagram', poly: rect(820, 28, 220, 140), actions: [IN(0.06, {y: -320, r: 8}), {kind: 'wobble', at: 0.6, amt: 0.5}]},
      {id: 'greenTop', poly: [[688, 112], [790, 110], [794, 198], [690, 202]], actions: [IN(0.12, {y: -380, r: -20}), {kind: 'flick', at: 2.15}]},
      {id: 'greenPatches', poly: [[762, 165], [872, 160], [892, 205], [884, 300], [960, 335], [985, 392], [872, 402], [860, 300], [790, 240]], actions: [IN(0.17, {x: 120, y: -420, r: 25}), {kind: 'flick', at: 2.2}, {kind: 'pulse', at: 2.4, amt: 0.03}]},
      {id: 'bluePatches', poly: [[888, 192], [1095, 198], [1140, 262], [1132, 392], [992, 395], [985, 335], [884, 290]], actions: [IN(0.21, {x: 520, y: -200, r: 30}), {kind: 'lift', at: 3.2, amt: 0.12, dur: 0.6}, {kind: 'flick', at: 3.3}]},
      {id: 'whiteScrub', poly: [[498, 218], [612, 196], [705, 214], [772, 224], [802, 258], [832, 330], [764, 392], [762, 578], [518, 582], [496, 520]], actions: [IN(0.04, {x: -760, y: 40, r: -16}, 0.5), {kind: 'lift', at: 1.2, amt: 0.14, dur: 0.6}, {kind: 'dim', at: 1.9, dur: 0.4}, {kind: 'wobble', at: 1.9, amt: 0.6}]},
      {id: 'paperclip', poly: rect(628, 138, 50, 84), actions: [IN(0.62, {y: -140, r: 30, s: 1.6}, 0.3), {kind: 'snap', at: 1.2}]},
      {id: 'chip1', poly: rect(1049, 23, 41, 38), actions: [IN(0.45, {s: 0.01, r: 90}, 0.3), {kind: 'snap', at: 2.25}]},
      {id: 'chip2', poly: rect(1049, 62, 41, 38), actions: [IN(0.50, {s: 0.01, r: -90}, 0.3), {kind: 'snap', at: 2.35}]},
      {id: 'chip3', poly: rect(1049, 101, 41, 38), actions: [IN(0.55, {s: 0.01, r: 90}, 0.3), {kind: 'snap', at: 3.35}]},
      {id: 'chip4', poly: rect(1049, 140, 41, 40), actions: [IN(0.60, {s: 0.01, r: -90}, 0.3), {kind: 'snap', at: 3.45}]},
    ],
    glows: [
      {id: 'orLamp', at: 0.5, c: [1468, 72], r: 190, color: '255,250,235', mode: 'pulse', strength: 0.6},
    ],
    traces: [
      // the approved white arrow from the white scrub to the green scrub
      {id: 'arrowWG', at: 1.85, dur: 0.45, d: 'M 728 356 Q 758 440 888 468', width: 9},
    ],
    marks: [
      {id: 'circleGreen', at: 2.25, dur: 0.45, kind: 'ellipse', c: [985, 625], rx: 235, ry: 255, color: '#FFFFFF', width: 9, until: 4.1},
      {id: 'circleBlue', at: 3.35, dur: 0.35, kind: 'ellipse', c: [1012, 292], rx: 155, ry: 118, color: '#FFFFFF', width: 8, until: 4.1},
    ],
    maryamActs: [
      {kind: 'enter', at: 0.0, from: {x: 900, r: 7}},
      {kind: 'present', at: 2.05, amt: 1},
      {kind: 'nod', at: 3.2},
      {kind: 'lean', at: 4.1, amt: -1},
    ],
    sway: 1,
    sfx: [
      {t: 0.02, src: 'whoosh', vol: 0.5}, {t: 0.06, src: 'paper_lift', vol: 0.55}, {t: 0.12, src: 'paper_lift', vol: 0.4},
      {t: 0.2, src: 'fabric_flick', vol: 0.5}, {t: 0.26, src: 'fabric_flick', vol: 0.45}, {t: 0.0, src: 'whoosh', vol: 0.55},
      {t: 0.45, src: 'pin_tap', vol: 0.35}, {t: 0.5, src: 'pin_tap', vol: 0.35}, {t: 0.55, src: 'pin_tap', vol: 0.35}, {t: 0.6, src: 'pin_tap', vol: 0.35},
      {t: 0.7, src: 'pin_tap', vol: 0.6}, {t: 0.9, src: 'paper_rustle', vol: 0.3},
      {t: 1.0, src: 'whoosh', vol: 0.45}, {t: 1.2, src: 'paper_lift', vol: 0.6},
      {t: 1.85, src: 'marker_scribble', vol: 0.4}, {t: 1.9, src: 'whoosh', vol: 0.45}, {t: 2.1, src: 'fabric_flick', vol: 0.55},
      {t: 2.25, src: 'marker_scribble', vol: 0.5}, {t: 2.25, src: 'pin_tap', vol: 0.35}, {t: 2.35, src: 'pin_tap', vol: 0.35},
      {t: 3.0, src: 'whoosh', vol: 0.45}, {t: 3.2, src: 'fabric_flick', vol: 0.55}, {t: 3.35, src: 'pin_tap', vol: 0.35},
      {t: 3.4, src: 'marker_scribble', vol: 0.35}, {t: 3.45, src: 'pin_tap', vol: 0.35}, {t: 4.0, src: 'whoosh', vol: 0.4},
    ],
    exit: 'fileOpen', exitDur: 0.45,
    textSafe: [{x: 30, y: 40, w: 440, h: 470, label: 'title / question'}],
    texts: [],
    status: 'animated',
  },
  // 02 · 0:05–0:10 — the evidence file: archival photos are dealt onto the board one by one and develop,
  // Maryam pops up from below, camera travels photo to photo.
  {
    id: '02', title: 'archival_medicine_collage_with_presenter', from: 5, to: 10, ...base('02', true),
    cam: [
      {t: 0, s: 1.08, c: [800, 380]},
      {t: 1.3, s: 1.12, c: [790, 360], ease: 'inout'},
      {t: 1.6, s: 1.32, c: [790, 300], ease: 'whip'},
      {t: 2.4, s: 1.36, c: [800, 290], ease: 'inout'},
      {t: 2.7, s: 1.32, c: [1130, 300], ease: 'whip'},
      {t: 3.2, s: 1.34, c: [1135, 300], ease: 'inout'},
      {t: 3.5, s: 1.3, c: [860, 720], ease: 'whip'},
      {t: 4.2, s: 1.33, c: [860, 725], ease: 'inout'},
      {t: 4.6, s: 1.12, c: CENTER, ease: 'whip'},
    ],
    pieces: [
      {id: 'archiveOR', poly: [[1252, 0], [1672, 0], [1672, 330], [1262, 345]], actions: [IN(0.5, {y: -420, r: 6}), {kind: 'develop', at: 0.7, dur: 0.6}]},
      {id: 'trayPhoto', poly: [[392, 735], [688, 728], [692, 941], [395, 941]], actions: [IN(0.78, {x: -520, y: 160, r: -22}), {kind: 'develop', at: 0.95}, {kind: 'wobble', at: 1.4}]},
      {id: 'wardPhoto', poly: [[692, 568], [1048, 566], [1052, 882], [694, 880]], actions: [IN(0.62, {y: 560, r: 14}), {kind: 'develop', at: 0.8}, {kind: 'lift', at: 3.6, amt: 0.08, dur: 0.6}, {kind: 'wobble', at: 1.4, amt: 0.5}]},
      {id: 'scissorsCard', poly: [[426, 604], [698, 600], [700, 716], [430, 722]], actions: [IN(0.95, {x: -600, r: -40}), {kind: 'wobble', at: 1.5}]},
      {id: 'blueSwatch', poly: rect(492, 482, 96, 136), actions: [IN(1.05, {x: -300, y: -80, r: -30}), {kind: 'flick', at: 2.0}]},
      {id: 'clothesPhoto', poly: [[1026, 118], [1248, 128], [1244, 455], [1031, 446]], actions: [IN(0.34, {x: 600, y: -60, r: 18}), {kind: 'develop', at: 0.5}, {kind: 'lift', at: 2.75, amt: 0.1, dur: 0.5}]},
      {id: 'mainPhoto', poly: [[562, 142], [1004, 90], [1018, 553], [602, 583]], actions: [IN(0.08, {y: -720, r: -14}, 0.5), {kind: 'develop', at: 0.3, dur: 0.7}, {kind: 'lift', at: 1.65, amt: 0.06, dur: 0.7}, {kind: 'wobble', at: 1.0, amt: 0.4}]},
      {id: 'clipMain', poly: rect(634, 78, 48, 104), actions: [IN(0.5, {y: -160, r: -35, s: 1.5}, 0.28), {kind: 'snap', at: 1.65}]},
    ],
    glows: [
      {id: 'archLamp', at: 0.6, c: [820, 185], r: 170, color: '255,240,210', mode: 'flicker', strength: 0.6},
      {id: 'archLamp2', at: 1.1, c: [1452, 38], r: 120, color: '255,240,210', mode: 'flicker', strength: 0.4},
    ],
    traces: [],
    marks: [
      {id: 'circleMain', at: 1.9, dur: 0.45, kind: 'ellipse', c: [790, 330], rx: 215, ry: 150, color: '#F6F0E3', width: 8, until: 2.65},
      {id: 'circleClothes', at: 2.85, dur: 0.35, kind: 'ellipse', c: [1138, 290], rx: 120, ry: 175, color: '#F6F0E3', width: 8, until: 3.45},
    ],
    maryamActs: [
      {kind: 'enter', at: -0.2, from: {y: 640, r: -5}},
      {kind: 'present', at: 1.55, amt: 1},
      {kind: 'present', at: 2.75, amt: 0.7},
      {kind: 'nod', at: 3.6},
    ],
    sway: 1,
    sfx: [
      {t: 0.08, src: 'page_flip', vol: 0.55}, {t: 0.34, src: 'page_flip', vol: 0.5}, {t: 0.4, src: 'whoosh', vol: 0.45},
      {t: 0.5, src: 'pin_tap', vol: 0.55}, {t: 0.5, src: 'page_flip', vol: 0.4}, {t: 0.6, src: 'archive_flicker', vol: 0.22, dur: 3.8, loop: true},
      {t: 0.62, src: 'page_flip', vol: 0.45}, {t: 0.78, src: 'page_flip', vol: 0.4}, {t: 0.95, src: 'paper_lift', vol: 0.45},
      {t: 1.05, src: 'fabric_flick', vol: 0.4}, {t: 1.5, src: 'whoosh', vol: 0.45}, {t: 1.65, src: 'paper_lift', vol: 0.5},
      {t: 1.9, src: 'marker_scribble', vol: 0.45}, {t: 2.0, src: 'fabric_flick', vol: 0.35}, {t: 2.6, src: 'whoosh', vol: 0.45},
      {t: 2.75, src: 'paper_lift', vol: 0.45}, {t: 2.85, src: 'marker_scribble', vol: 0.4}, {t: 3.4, src: 'whoosh', vol: 0.45},
      {t: 3.6, src: 'paper_lift', vol: 0.45}, {t: 4.5, src: 'whoosh', vol: 0.35},
    ],
    exit: 'rip', exitDur: 0.45,
    textSafe: [{x: 30, y: 40, w: 440, h: 460, label: 'era label / date'}],
    texts: [],
    status: 'animated',
  },
  // 03 · 0:10–0:16 — surgical light glare (animated now only for the preview's rip-in; full pass after approval)
  {
    id: '03', title: 'surgical_light_collage_portrait', from: 10, to: 16, ...base('03'),
    cam: [{t: 0, s: 1.06, c: [905, 200]}, {t: 6, s: 1.16, c: [1000, 330], ease: 'inout'}],
    pieces: [],
    glows: [{id: 'lamp', at: 0, c: [905, 92], r: 330, color: '255,253,245', mode: 'glare', strength: 0.85}],
    traces: [], maryamActs: [{kind: 'react', at: 0.3}],
    sfx: [{t: -0.3, src: 'paper_rip', vol: 0.6}, {t: 0, src: 'light_hum', vol: 0.25, dur: 6, loop: true}],
    exit: 'stopJump', exitDur: 0.3,
    textSafe: [{x: 30, y: 230, w: 470, h: 380, label: 'question'}], texts: [], status: 'base-only',
  },
  // 04–08: base camera only until the preview movement is approved.
  {
    id: '04', title: 'vision_science_collage_with_medical_presenter', from: 16, to: 23, ...base('04'),
    cam: [{t: 0, s: 1.05, c: CENTER}, {t: 7, s: 1.14, c: [760, 300], ease: 'inout'}],
    pieces: [], glows: [], traces: [], maryamActs: [], sfx: [], exit: 'diagramWipe', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 330, h: 600, label: 'term'}], texts: [], status: 'base-only',
  },
  {
    id: '05', title: 'color_analysis_scrub_style_collage', from: 23, to: 30, ...base('05'),
    cam: [{t: 0, s: 1.05, c: CENTER}, {t: 7, s: 1.14, c: [920, 300], ease: 'inout'}],
    pieces: [], glows: [], traces: [], maryamActs: [], sfx: [], exit: 'slide', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 440, h: 560, label: 'comparison'}], texts: [], status: 'base-only',
  },
  {
    id: '06', title: 'balancing_scrubs_strain_to_comfort', from: 30, to: 38, ...base('06'),
    cam: [{t: 0, s: 1.05, c: CENTER}, {t: 8, s: 1.12, c: CENTER, ease: 'inout'}],
    pieces: [], glows: [], traces: [], maryamActs: [], sfx: [], exit: 'pinSnap', exitDur: 0.4,
    textSafe: [{x: 20, y: 40, w: 330, h: 520, label: 'strain vs comfort'}], texts: [], status: 'base-only',
  },
  {
    id: '07', title: 'forensic_scrub_evidence_board_reveal', from: 38, to: 47, ...base('07'),
    cam: [{t: 0, s: 1.05, c: CENTER}, {t: 9, s: 1.16, c: [980, 700], ease: 'inout'}],
    pieces: [], glows: [], traces: [], maryamActs: [], sfx: [], exit: 'archivalReveal', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 440, h: 430, label: 'case conclusion'}], texts: [], status: 'base-only',
  },
  {
    id: '08', title: 'surgical_scrubs_collage_explainer', from: 47, to: 57, ...base('08'),
    cam: [{t: 0, s: 1.12, c: [800, 330]}, {t: 10, s: 1.02, c: CENTER, ease: 'inout'}],
    pieces: [], glows: [], traces: [], maryamActs: [], sfx: [], exit: 'loopFade', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 370, h: 470, label: 'insight'}], texts: [], status: 'base-only',
  },
];

export const EPISODE_SECONDS = 57;
export const PREVIEW_SECONDS = 10;
