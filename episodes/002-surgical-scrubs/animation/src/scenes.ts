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
export type MaryamAct = {kind: 'enter' | 'exit' | 'present' | 'react' | 'nod' | 'lean' | 'stamp'; at: number; from?: Xf; to?: Xf; amt?: number};
export type Shake = {t: number; amt: number};
export type Flash = {t: number; dur?: number; color?: string; amt?: number};
export type Exit = 'fileOpen' | 'rip' | 'slide' | 'stopJump' | 'diagramWipe' | 'pinSnap' | 'archivalReveal' | 'loopFade';

export type Scene = {
  id: string; title: string; from: number; to: number;
  plate: string; maryam: string; maryamBox: [number, number, number, number];
  board?: string; clean?: string;
  cam: CamKey[]; pieces: Piece[]; glows: Glow[]; traces: Trace[]; marks: Mark[];
  maryamActs: MaryamAct[]; sway?: number; shakes?: Shake[]; flashes?: Flash[]; sfx: Sfx[]; exit: Exit; exitDur: number;
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
  // 03 · 0:10–0:16 — operating light glare: lamp flares hit the eyes, Maryam shields hers.
  {
    id: '03', title: 'surgical_light_collage_portrait', from: 10, to: 16, ...base('03', true),
    cam: [
      {t: 0, s: 1.42, c: [905, 170]},
      {t: 0.95, s: 1.38, c: [925, 185], ease: 'inout'},
      {t: 1.25, s: 1.5, c: [1235, 320], ease: 'whip'},
      {t: 2.55, s: 1.56, c: [1245, 330], ease: 'inout'},
      {t: 2.85, s: 1.45, c: [455, 130], ease: 'whip'},
      {t: 3.75, s: 1.5, c: [460, 135], ease: 'inout'},
      {t: 4.05, s: 1.1, c: CENTER, ease: 'whip'},
      {t: 6.0, s: 1.14, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'anatomy', poly: rect(0, 540, 245, 370), actions: [IN(0.15, {x: -380, r: -8}), {kind: 'wobble', at: 0.8, amt: 0.4}]},
      {id: 'lampSketch', poly: rect(350, 20, 200, 195), actions: [IN(0.25, {y: -320, r: -12}), {kind: 'lift', at: 3.1, amt: 0.12, dur: 0.6}, {kind: 'wobble', at: 3.9, amt: 0.5}]},
      {id: 'chips', poly: rect(562, 14, 44, 142), actions: [IN(0.35, {s: 0.01, r: 120}, 0.3), {kind: 'snap', at: 3.3}]},
      {id: 'greenPatch', poly: rect(645, 100, 70, 105), actions: [IN(0.42, {y: -280, r: 18}), {kind: 'flick', at: 2.2}]},
      {id: 'bluePatch', poly: [[540, 185], [725, 175], [730, 255], [545, 262]], actions: [IN(0.5, {x: -320, r: -18}), {kind: 'flick', at: 2.3}]},
      {id: 'tealSwatch', poly: [[492, 560], [618, 552], [625, 712], [498, 716]], actions: [IN(0.58, {x: -400, y: 80, r: -20}), {kind: 'wobble', at: 1.2}]},
      {id: 'blueSwatchBL', poly: [[212, 712], [352, 705], [356, 848], [215, 852]], actions: [IN(0.66, {x: -420, r: 25}), {kind: 'wobble', at: 1.3}]},
    ],
    glows: [
      {id: 'lamp', at: 0, c: [905, 92], r: 380, color: '255,253,245', mode: 'glare', strength: 0.95},
      {id: 'lampSketchGlow', at: 3.0, c: [450, 110], r: 150, color: '255,250,225', mode: 'pulse', strength: 0.55, until: 4.1},
    ],
    traces: [],
    marks: [
      {id: 'circleLamp', at: 0.45, dur: 0.4, kind: 'ellipse', c: [905, 92], rx: 215, ry: 125, color: '#FFFFFF', width: 9, until: 1.2},
      {id: 'circleEyes', at: 1.6, dur: 0.35, kind: 'ellipse', c: [1262, 268], rx: 120, ry: 55, color: '#FFFFFF', width: 8, until: 2.75},
    ],
    flashes: [{t: 0.05, dur: 0.35, amt: 0.85}, {t: 1.3, dur: 0.3, amt: 0.6}, {t: 2.3, dur: 0.25, amt: 0.45}, {t: 4.6, dur: 0.3, amt: 0.5}],
    shakes: [{t: 1.3, amt: 0.25}, {t: 4.6, amt: 0.2}],
    maryamActs: [
      {kind: 'enter', at: 0.05, from: {x: 820, r: 6}},
      {kind: 'react', at: 1.3}, {kind: 'react', at: 4.6}, {kind: 'nod', at: 5.3},
    ],
    sway: 0.7,
    sfx: [
      {t: -0.3, src: 'paper_rip', vol: 0.6}, {t: 0, src: 'light_hum', vol: 0.28, dur: 6, loop: true}, {t: 0.05, src: 'whoosh', vol: 0.5},
      {t: 0.15, src: 'paper_lift', vol: 0.4}, {t: 0.25, src: 'paper_lift', vol: 0.4}, {t: 0.35, src: 'pin_tap', vol: 0.4}, {t: 0.42, src: 'fabric_flick', vol: 0.4},
      {t: 0.5, src: 'fabric_flick', vol: 0.4}, {t: 0.6, src: 'fabric_flick', vol: 0.35}, {t: 0.45, src: 'marker_scribble', vol: 0.4},
      {t: 1.15, src: 'whoosh', vol: 0.5}, {t: 1.6, src: 'marker_scribble', vol: 0.4}, {t: 2.2, src: 'fabric_flick', vol: 0.35},
      {t: 2.75, src: 'whoosh', vol: 0.45}, {t: 3.1, src: 'paper_lift', vol: 0.5}, {t: 3.3, src: 'pin_tap', vol: 0.4}, {t: 3.95, src: 'whoosh', vol: 0.45},
    ],
    exit: 'stopJump', exitDur: 0.3,
    textSafe: [{x: 30, y: 230, w: 470, h: 380, label: 'question'}], texts: [], status: 'animated',
  },
  // 04 · 0:16–0:23 — afterimage: stare at the red half of the eye… then the silhouette glows green.
  {
    id: '04', title: 'vision_science_collage_with_medical_presenter', from: 16, to: 23, ...base('04', true),
    cam: [
      {t: 0, s: 1.12, c: [640, 330]},
      {t: 1.0, s: 1.15, c: [650, 320], ease: 'inout'},
      {t: 1.3, s: 1.62, c: [745, 300], ease: 'whip'},
      {t: 3.0, s: 1.72, c: [755, 300], ease: 'inout'},
      {t: 3.3, s: 1.6, c: [1045, 270], ease: 'whip'},
      {t: 5.0, s: 1.66, c: [1045, 268], ease: 'inout'},
      {t: 5.35, s: 1.1, c: CENTER, ease: 'whip'},
      {t: 7.0, s: 1.14, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'redPatch', poly: [[935, 15], [1255, 20], [1250, 125], [940, 120]], actions: [IN(0.45, {y: -320, r: -8})]},
      {id: 'faceSketch', poly: rect(1490, 0, 182, 260), actions: [IN(0.6, {x: 320, r: 10}), {kind: 'wobble', at: 1.2, amt: 0.4}]},
      {id: 'eyeballDiagram', poly: rect(370, 640, 500, 210), actions: [IN(0.55, {y: 400, r: 10}), {kind: 'wobble', at: 1.2, amt: 0.5}]},
      {id: 'greenScrap', poly: [[525, 505], [740, 505], [740, 625], [525, 625]], actions: [IN(0.5, {x: -320, r: -20}), {kind: 'flick', at: 3.4}]},
      {id: 'eyeCard', poly: [[242, 62], [905, 58], [905, 520], [245, 525]], actions: [IN(0.0, {x: -900, r: -10}, 0.5), {kind: 'lift', at: 1.3, amt: 0.04, dur: 1.6}]},
      {id: 'silhouette', poly: [[900, 95], [1195, 95], [1195, 450], [900, 450]], actions: [IN(0.3, {y: -520, r: 12}), {kind: 'lift', at: 3.35, amt: 0.06, dur: 1.7}]},
    ],
    glows: [
      {id: 'redStare', at: 1.35, c: [760, 300], r: 150, color: '255,70,55', mode: 'pulse', strength: 0.75, until: 3.15},
      {id: 'afterimage', at: 3.5, c: [1045, 262], r: 190, color: '70,230,170', mode: 'pulse', strength: 0.85, until: 6.6},
    ],
    traces: [{id: 'gaze', at: 3.05, dur: 0.4, d: 'M 705 305 L 990 250', width: 8}],
    marks: [
      {id: 'circleRed', at: 1.5, dur: 0.4, kind: 'ellipse', c: [760, 300], rx: 125, ry: 112, color: '#D2342B', width: 9, until: 3.1},
      {id: 'circleAfter', at: 3.7, dur: 0.45, kind: 'ellipse', c: [1045, 268], rx: 170, ry: 195, color: '#8BE6C2', width: 9, until: 5.3},
    ],
    flashes: [{t: 3.3, dur: 0.3, amt: 0.55}],
    maryamActs: [
      {kind: 'enter', at: 0.15, from: {y: 620, r: -4}},
      {kind: 'present', at: 3.45, amt: 1}, {kind: 'nod', at: 5.6},
    ],
    sway: 0.8,
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.5}, {t: 0.05, src: 'paper_lift', vol: 0.5}, {t: 0.3, src: 'paper_lift', vol: 0.45}, {t: 0.45, src: 'fabric_flick', vol: 0.4},
      {t: 0.55, src: 'paper_lift', vol: 0.35}, {t: 0.6, src: 'paper_lift', vol: 0.3}, {t: 1.2, src: 'whoosh', vol: 0.5}, {t: 1.5, src: 'marker_scribble', vol: 0.45},
      {t: 1.6, src: 'light_hum', vol: 0.15, dur: 1.5, loop: true}, {t: 3.05, src: 'marker_scribble', vol: 0.35}, {t: 3.2, src: 'whoosh', vol: 0.5},
      {t: 3.4, src: 'fabric_flick', vol: 0.35}, {t: 3.7, src: 'marker_scribble', vol: 0.45}, {t: 5.25, src: 'whoosh', vol: 0.45},
    ],
    exit: 'diagramWipe', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 200, h: 600, label: 'term'}], texts: [], status: 'animated',
  },
  // 05 · 0:23–0:30 — colour analysis board: swatches pinned, wheel spins in, Maryam points green vs blue.
  {
    id: '05', title: 'color_analysis_scrub_style_collage', from: 23, to: 30, ...base('05', true),
    cam: [
      {t: 0, s: 1.08, c: CENTER},
      {t: 1.0, s: 1.1, c: [820, 440], ease: 'inout'},
      {t: 1.3, s: 1.55, c: [965, 170], ease: 'whip'},
      {t: 2.2, s: 1.6, c: [965, 168], ease: 'inout'},
      {t: 2.5, s: 1.55, c: [835, 420], ease: 'whip'},
      {t: 3.5, s: 1.6, c: [835, 425], ease: 'inout'},
      {t: 3.75, s: 1.55, c: [1035, 405], ease: 'whip'},
      {t: 4.8, s: 1.6, c: [1035, 405], ease: 'inout'},
      {t: 5.1, s: 1.1, c: CENTER, ease: 'whip'},
      {t: 7.0, s: 1.14, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'eyeCardR', poly: [[1360, 40], [1672, 40], [1672, 330], [1360, 330]], actions: [IN(0.3, {x: 420, r: 10}), {kind: 'wobble', at: 1.0, amt: 0.4}]},
      {id: 'headCard', poly: [[485, 248], [712, 240], [716, 418], [488, 424]], actions: [IN(0.2, {x: -520, r: -14}), {kind: 'wobble', at: 0.8}]},
      {id: 'orPhoto', poly: [[476, 415], [722, 410], [728, 688], [480, 692]], actions: [IN(0.32, {x: -540, y: 100, r: 12}), {kind: 'wobble', at: 0.9, amt: 0.6}]},
      {id: 'palette', poly: rect(522, 690, 215, 70), actions: [IN(0.44, {y: 320}), {kind: 'snap', at: 4.0}]},
      {id: 'fan', poly: [[505, 760], [725, 760], [725, 905], [505, 905]], actions: [IN(0.5, {y: 360, r: 20}), {kind: 'wobble', at: 1.0}]},
      {id: 'greenSwatch', poly: [[600, 80], [790, 75], [795, 250], [605, 255]], actions: [IN(0.1, {y: -420, r: -25}), {kind: 'flick', at: 2.55}]},
      {id: 'blueSwatch', poly: [[1130, 45], [1292, 40], [1296, 238], [1135, 242]], actions: [IN(0.15, {y: -440, r: 20}), {kind: 'flick', at: 3.8}]},
      {id: 'wheel', poly: Array.from({length: 24}, (_, i) => [967 + 136 * Math.cos(i * Math.PI / 12), 163 + 118 * Math.sin(i * Math.PI / 12)] as Pt),
        actions: [IN(0.05, {s: 0.01, r: -200}, 0.6), {kind: 'lift', at: 1.4, amt: 0.08, dur: 0.8}]},
      {id: 'card', poly: [[705, 300], [1142, 262], [1152, 532], [718, 578]], actions: [IN(0.6, {y: 620, r: -10}, 0.5), {kind: 'lift', at: 2.6, amt: 0.05, dur: 2.2}]},
    ],
    glows: [{id: 'orLamp', at: 0.6, c: [600, 480], r: 90, color: '255,250,235', mode: 'pulse', strength: 0.5}],
    traces: [
      {id: 'arrowL', at: 1.55, dur: 0.35, d: 'M 762 240 Q 790 195 832 170', width: 7},
      {id: 'arrowTR', at: 1.7, dur: 0.3, d: 'M 1092 118 L 1140 100', width: 7},
      {id: 'arrowBR', at: 1.85, dur: 0.35, d: 'M 1118 240 Q 1150 278 1192 292', width: 7},
    ],
    marks: [
      {id: 'circleGreen', at: 2.65, dur: 0.4, kind: 'ellipse', c: [822, 420], rx: 125, ry: 150, color: '#FFFFFF', width: 9, until: 3.7},
      {id: 'circleBlue', at: 3.9, dur: 0.4, kind: 'ellipse', c: [1032, 400], rx: 120, ry: 150, color: '#FFFFFF', width: 9, until: 5.0},
    ],
    maryamActs: [
      {kind: 'enter', at: 0.0, from: {x: 820, r: 6}},
      {kind: 'present', at: 2.6, amt: 0.9}, {kind: 'present', at: 3.85, amt: 0.7}, {kind: 'nod', at: 5.5},
    ],
    sway: 0.8,
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.5}, {t: 0.05, src: 'whoosh', vol: 0.35}, {t: 0.1, src: 'fabric_flick', vol: 0.45}, {t: 0.15, src: 'fabric_flick', vol: 0.45},
      {t: 0.2, src: 'paper_lift', vol: 0.4}, {t: 0.32, src: 'paper_lift', vol: 0.4}, {t: 0.44, src: 'pin_tap', vol: 0.4}, {t: 0.5, src: 'paper_lift', vol: 0.35},
      {t: 0.6, src: 'paper_lift', vol: 0.5}, {t: 1.2, src: 'whoosh', vol: 0.5}, {t: 1.55, src: 'marker_scribble', vol: 0.4},
      {t: 2.4, src: 'whoosh', vol: 0.45}, {t: 2.55, src: 'fabric_flick', vol: 0.45}, {t: 2.65, src: 'marker_scribble', vol: 0.45},
      {t: 3.65, src: 'whoosh', vol: 0.45}, {t: 3.8, src: 'fabric_flick', vol: 0.45}, {t: 3.9, src: 'marker_scribble', vol: 0.45},
      {t: 4.0, src: 'pin_tap', vol: 0.4}, {t: 5.0, src: 'whoosh', vol: 0.45},
    ],
    exit: 'slide', exitDur: 0.45,
    textSafe: [{x: 30, y: 40, w: 440, h: 560, label: 'comparison'}], texts: [], status: 'animated',
  },
  // 06 · 0:30–0:38 — strain vs comfort: glaring white side shakes, then the green/blue side builds calmly.
  {
    id: '06', title: 'balancing_scrubs_strain_to_comfort', from: 30, to: 38, ...base('06', true),
    cam: [
      {t: 0, s: 1.1, c: CENTER},
      {t: 0.9, s: 1.12, c: CENTER, ease: 'inout'},
      {t: 1.2, s: 1.48, c: [600, 340], ease: 'whip'},
      {t: 3.0, s: 1.55, c: [610, 350], ease: 'inout'},
      {t: 3.3, s: 1.12, c: CENTER, ease: 'whip'},
      {t: 4.2, s: 1.14, c: CENTER, ease: 'inout'},
      {t: 4.5, s: 1.45, c: [1400, 340], ease: 'whip'},
      {t: 6.4, s: 1.5, c: [1405, 345], ease: 'inout'},
      {t: 6.75, s: 1.1, c: CENTER, ease: 'whip'},
      {t: 8.0, s: 1.13, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'eyeDiagramTop', poly: rect(1065, 30, 190, 130), actions: [IN(3.3, {y: -280, r: 10}), {kind: 'wobble', at: 3.9, amt: 0.4}]},
      {id: 'whiteScrub', poly: [[445, 150], [690, 130], [800, 190], [810, 330], [740, 470], [560, 470], [455, 330]], actions: [IN(0.1, {x: -520, r: -15}), {kind: 'pulse', at: 1.0, amt: 0.035}]},
      {id: 'arrowsL', poly: rect(445, 160, 95, 180), actions: [IN(0.6, {s: 0.01}, 0.25), {kind: 'pulse', at: 0.9, amt: 0.14}]},
      {id: 'arrowsR', poly: rect(730, 335, 80, 150), actions: [IN(0.7, {s: 0.01}, 0.25), {kind: 'pulse', at: 0.95, amt: 0.14}]},
      {id: 'eyeStrain', poly: Array.from({length: 24}, (_, i) => [526 + 134 * Math.cos(i * Math.PI / 12), 452 + 112 * Math.sin(i * Math.PI / 12)] as Pt),
        actions: [IN(0.8, {y: 320, r: -20}), {kind: 'flick', at: 1.6}, {kind: 'flick', at: 2.2}, {kind: 'flick', at: 2.8}]},
      {id: 'greenScrub', poly: [[1150, 145], [1420, 135], [1440, 300], [1400, 480], [1170, 480], [1150, 330]], actions: [IN(3.45, {y: -520, r: 12}, 0.5), {kind: 'wobble', at: 4.2, amt: 0.5}]},
      {id: 'blueScrub', poly: [[1335, 230], [1550, 215], [1640, 320], [1620, 520], [1345, 520]], actions: [IN(3.65, {x: 520, r: 15}, 0.5), {kind: 'wobble', at: 4.4, amt: 0.5}]},
      {id: 'eyeComfort', poly: Array.from({length: 24}, (_, i) => [1530 + 112 * Math.cos(i * Math.PI / 12), 482 + 100 * Math.sin(i * Math.PI / 12)] as Pt),
        actions: [IN(3.95, {s: 0.01, r: 90}, 0.4), {kind: 'lift', at: 5.0, amt: 0.1, dur: 0.9}, {kind: 'pulse', at: 6.0, amt: 0.03}]},
    ],
    glows: [
      {id: 'glare', at: 0.6, c: [625, 260], r: 280, color: '255,255,250', mode: 'glare', strength: 0.7, until: 3.25},
      {id: 'calm', at: 4.3, c: [1400, 340], r: 320, color: '120,220,190', mode: 'pulse', strength: 0.35},
    ],
    traces: [
      {id: 'arrowG', at: 4.55, dur: 0.35, d: 'M 1180 330 Q 1225 330 1242 282', width: 8},
      {id: 'arrowB', at: 4.75, dur: 0.35, d: 'M 1388 382 Q 1362 335 1395 300', width: 8},
    ],
    marks: [
      {id: 'circleStrain', at: 1.45, dur: 0.4, kind: 'ellipse', c: [526, 452], rx: 158, ry: 136, color: '#D2342B', width: 10, until: 3.2},
      {id: 'circleComfort', at: 5.2, dur: 0.45, kind: 'ellipse', c: [1530, 482], rx: 138, ry: 124, color: '#FFFFFF', width: 9, until: 6.7},
    ],
    flashes: [{t: 1.6, dur: 0.2, amt: 0.4}, {t: 2.2, dur: 0.2, amt: 0.35}, {t: 2.8, dur: 0.2, amt: 0.3}],
    shakes: [{t: 1.6, amt: 0.22}, {t: 2.2, amt: 0.2}, {t: 2.8, amt: 0.18}],
    maryamActs: [
      {kind: 'enter', at: 0.0, from: {y: 660, r: 4}},
      {kind: 'lean', at: 1.1, amt: -1}, {kind: 'lean', at: 4.3, amt: 2}, {kind: 'nod', at: 6.9},
    ],
    sway: 0.6,
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.5}, {t: 0.1, src: 'paper_lift', vol: 0.5}, {t: 0.6, src: 'pin_tap', vol: 0.4}, {t: 0.7, src: 'pin_tap', vol: 0.4},
      {t: 0.6, src: 'light_hum', vol: 0.22, dur: 2.7, loop: true}, {t: 0.8, src: 'paper_lift', vol: 0.45}, {t: 1.1, src: 'whoosh', vol: 0.5},
      {t: 1.45, src: 'marker_scribble', vol: 0.5}, {t: 1.6, src: 'stamp_hit', vol: 0.3}, {t: 2.2, src: 'stamp_hit', vol: 0.25}, {t: 2.8, src: 'stamp_hit', vol: 0.2},
      {t: 3.2, src: 'whoosh', vol: 0.5}, {t: 3.45, src: 'fabric_flick', vol: 0.5}, {t: 3.65, src: 'fabric_flick', vol: 0.5}, {t: 3.95, src: 'pin_tap', vol: 0.4},
      {t: 4.4, src: 'whoosh', vol: 0.45}, {t: 4.55, src: 'marker_scribble', vol: 0.35}, {t: 5.0, src: 'paper_lift', vol: 0.4},
      {t: 5.2, src: 'marker_scribble', vol: 0.45}, {t: 6.65, src: 'whoosh', vol: 0.45},
    ],
    exit: 'pinSnap', exitDur: 0.45,
    textSafe: [{x: 20, y: 40, w: 240, h: 520, label: 'strain vs comfort'}], texts: [], status: 'animated',
  },
  // 07 · 0:38–0:47 — case conclusion: evidence photos pinned, red strings light up, Maryam slams the stamp.
  {
    id: '07', title: 'forensic_scrub_evidence_board_reveal', from: 38, to: 47, ...base('07', true),
    cam: [
      {t: 0, s: 1.08, c: CENTER},
      {t: 1.0, s: 1.1, c: [850, 400], ease: 'inout'},
      {t: 1.3, s: 1.38, c: [900, 230], ease: 'whip'},
      {t: 2.0, s: 1.42, c: [880, 225], ease: 'inout'},
      {t: 2.3, s: 1.62, c: [805, 215], ease: 'out'},
      {t: 3.3, s: 1.66, c: [805, 215], ease: 'inout'},
      {t: 3.6, s: 1.3, c: [1010, 600], ease: 'whip'},
      {t: 4.4, s: 1.32, c: [1010, 610], ease: 'inout'},
      {t: 4.55, s: 1.48, c: [990, 660], ease: 'back'},
      {t: 6.2, s: 1.52, c: [985, 680], ease: 'inout'},
      {t: 6.55, s: 1.1, c: CENTER, ease: 'whip'},
      {t: 9.0, s: 1.16, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'orLeft', poly: [[468, 200], [730, 182], [740, 440], [480, 458]], actions: [IN(0.2, {x: -620, r: -15}), {kind: 'wobble', at: 0.9, amt: 0.4}]},
      {id: 'greenPhoto', poly: [[985, 15], [1230, 25], [1225, 262], [985, 255]], actions: [IN(0.35, {y: -440, r: -10}), {kind: 'wobble', at: 1.0, amt: 0.4}]},
      {id: 'orRight', poly: [[1200, 25], [1430, 40], [1420, 280], [1195, 270]], actions: [IN(0.45, {x: 420, r: 12})]},
      {id: 'bluePhoto', poly: [[1040, 250], [1250, 265], [1245, 425], [1035, 415]], actions: [IN(0.55, {x: 440, y: 100, r: -14}), {kind: 'wobble', at: 1.2, amt: 0.4}]},
      {id: 'surgeryPhoto', poly: [[830, 330], [1035, 320], [1040, 520], [840, 530]], actions: [IN(0.65, {y: 420, r: 10}), {kind: 'wobble', at: 1.3, amt: 0.4}]},
      {id: 'tealSwatch', poly: [[618, 400], [785, 412], [775, 565], [612, 555]], actions: [IN(0.75, {x: -420, r: -25}), {kind: 'flick', at: 1.9}]},
      {id: 'whitePhoto', poly: [[650, 60], [955, 45], [965, 370], [662, 385]], actions: [IN(0.1, {y: -520, r: 14}, 0.5), {kind: 'lift', at: 2.3, amt: 0.08, dur: 1.0}]},
      {id: 'folder', poly: [[520, 545], [1300, 560], [1310, 941], [515, 941]], actions: [IN(0.0, {y: 720, r: 4}, 0.5), {kind: 'snap', at: 4.5}]},
    ],
    glows: [{id: 'stampBurst', at: 4.5, c: [1010, 640], r: 260, color: '255,240,220', mode: 'glare', strength: 0.5, until: 5.1}],
    traces: [
      {id: 's1', at: 1.3, dur: 0.35, d: 'M 880 115 L 1058 38', color: '#FF5A4D', width: 7},
      {id: 's2', at: 1.5, dur: 0.35, d: 'M 945 250 L 1100 233', color: '#FF5A4D', width: 7},
      {id: 's3', at: 1.7, dur: 0.35, d: 'M 970 345 L 1100 233', color: '#FF5A4D', width: 7},
      {id: 's4', at: 1.9, dur: 0.35, d: 'M 755 455 L 865 470', color: '#FF5A4D', width: 7},
    ],
    marks: [
      {id: 'circleWhite', at: 2.4, dur: 0.45, kind: 'ellipse', c: [805, 215], rx: 190, ry: 175, color: '#D2342B', width: 10, until: 3.5},
      {id: 'circleFolder', at: 4.65, dur: 0.45, kind: 'ellipse', c: [975, 740], rx: 185, ry: 150, color: '#D2342B', width: 12, until: 6.5},
    ],
    flashes: [{t: 4.5, dur: 0.22, amt: 0.75}],
    shakes: [{t: 4.5, amt: 0.6}],
    maryamActs: [
      {kind: 'enter', at: 0.3, from: {x: 720, r: 6}},
      {kind: 'stamp', at: 4.5}, {kind: 'nod', at: 6.8},
    ],
    sway: 0.5,
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.45}, {t: 0.05, src: 'page_flip', vol: 0.5}, {t: 0.1, src: 'page_flip', vol: 0.5}, {t: 0.2, src: 'page_flip', vol: 0.45},
      {t: 0.3, src: 'whoosh', vol: 0.45}, {t: 0.35, src: 'page_flip', vol: 0.4}, {t: 0.45, src: 'pin_tap', vol: 0.45}, {t: 0.55, src: 'pin_tap', vol: 0.45},
      {t: 0.65, src: 'pin_tap', vol: 0.45}, {t: 0.75, src: 'fabric_flick', vol: 0.4}, {t: 1.2, src: 'whoosh', vol: 0.45},
      {t: 1.3, src: 'marker_scribble', vol: 0.35}, {t: 1.5, src: 'marker_scribble', vol: 0.35}, {t: 1.7, src: 'marker_scribble', vol: 0.35}, {t: 1.9, src: 'marker_scribble', vol: 0.35},
      {t: 2.3, src: 'paper_lift', vol: 0.5}, {t: 2.4, src: 'marker_scribble', vol: 0.5}, {t: 3.5, src: 'whoosh', vol: 0.5},
      {t: 4.05, src: 'paper_rustle', vol: 0.3}, {t: 4.5, src: 'stamp_hit', vol: 0.95}, {t: 4.65, src: 'marker_scribble', vol: 0.5},
      {t: 6.45, src: 'whoosh', vol: 0.45},
    ],
    exit: 'archivalReveal', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 420, h: 430, label: 'case conclusion'}], texts: [], status: 'animated',
  },
  // 08 · 0:47–0:57 — the answer: white → green → blue line up, chalk circles, then the board clears
  // (pieces fly off, Maryam slides out) so the episode loops into scene 01's empty board.
  {
    id: '08', title: 'surgical_scrubs_collage_explainer', from: 47, to: 57, ...base('08', true),
    cam: [
      {t: 0, s: 1.06, c: CENTER},
      {t: 1.2, s: 1.08, c: CENTER, ease: 'inout'},
      {t: 1.5, s: 1.38, c: [690, 320], ease: 'whip'},
      {t: 2.4, s: 1.4, c: [790, 320], ease: 'inout'},
      {t: 3.3, s: 1.4, c: [930, 330], ease: 'inout'},
      {t: 3.6, s: 1.16, c: [836, 420], ease: 'whip'},
      {t: 5.6, s: 1.2, c: [836, 410], ease: 'inout'},
      {t: 7.6, s: 1.38, c: [1240, 290], ease: 'inout'},
      {t: 8.1, s: 1.04, c: CENTER, ease: 'whip'},
      {t: 10.0, s: 1.04, c: CENTER, ease: 'inout'},
    ],
    pieces: [
      {id: 'eyeDiagram', poly: rect(810, 22, 195, 125), actions: [IN(0.15, {y: -300, r: 8}), {kind: 'wobble', at: 0.8, amt: 0.4}, {kind: 'exit', at: 8.55, to: {y: -420, r: 14}}]},
      {id: 'chips', poly: rect(1045, 18, 48, 165), actions: [IN(0.2, {s: 0.01, r: 90}, 0.3), {kind: 'snap', at: 4.6}, {kind: 'exit', at: 8.6, to: {y: -380, r: -30}}]},
      {id: 'tealSwatch', poly: [[662, 520], [800, 525], [795, 680], [665, 678]], actions: [IN(0.5, {y: 400, r: -20}), {kind: 'wobble', at: 1.0}, {kind: 'exit', at: 8.65, to: {y: 520, r: 30}}]},
      {id: 'blueBL', poly: [[200, 760], [350, 758], [352, 880], [205, 885]], actions: [IN(0.6, {x: -400, r: 20}), {kind: 'wobble', at: 1.1}, {kind: 'exit', at: 8.7, to: {x: -520, r: -30}}]},
      {id: 'whiteCard', poly: [[398, 135], [720, 130], [725, 525], [402, 530]], actions: [IN(0.3, {x: -720, r: -14}, 0.5), {kind: 'dim', at: 2.0, dur: 0.4}, {kind: 'exit', at: 8.75, to: {x: -900, r: -20}}]},
      {id: 'greenScrub', poly: [[690, 110], [935, 105], [930, 500], [695, 500]], actions: [IN(1.4, {y: -620, r: 12}, 0.5), {kind: 'lift', at: 4.0, amt: 0.06, dur: 0.7}, {kind: 'exit', at: 8.8, to: {y: -760, r: 16}}]},
      {id: 'blueScrub', poly: [[885, 190], [1140, 185], [1140, 500], [890, 505]], actions: [IN(2.4, {x: 520, y: -200, r: 18}, 0.5), {kind: 'lift', at: 4.5, amt: 0.06, dur: 0.7}, {kind: 'exit', at: 8.85, to: {x: 700, y: -300, r: 24}}]},
    ],
    glows: [{id: 'orLamp', at: 0.4, c: [1462, 60], r: 190, color: '255,250,235', mode: 'pulse', strength: 0.55}],
    traces: [
      {id: 'arrowWG', at: 1.95, dur: 0.35, d: 'M 690 362 Q 715 336 756 330', width: 8},
      {id: 'arrowGB', at: 2.95, dur: 0.35, d: 'M 905 382 Q 932 356 972 350', width: 8},
    ],
    marks: [
      {id: 'circleGreen', at: 4.0, dur: 0.4, kind: 'ellipse', c: [812, 305], rx: 145, ry: 215, color: '#FFFFFF', width: 9, until: 6.0},
      {id: 'circleBlue', at: 4.5, dur: 0.4, kind: 'ellipse', c: [1012, 345], rx: 145, ry: 190, color: '#FFFFFF', width: 9, until: 6.0},
    ],
    maryamActs: [
      {kind: 'enter', at: 0.0, from: {x: 820, r: 7}},
      {kind: 'present', at: 1.5, amt: 0.8}, {kind: 'present', at: 2.5, amt: 0.8}, {kind: 'present', at: 4.0, amt: 0.6},
      {kind: 'nod', at: 6.6}, {kind: 'exit', at: 9.05, to: {x: 900, r: 7}},
    ],
    sway: 0.8,
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.5}, {t: 0.15, src: 'paper_lift', vol: 0.4}, {t: 0.2, src: 'pin_tap', vol: 0.4}, {t: 0.3, src: 'paper_lift', vol: 0.55},
      {t: 0.5, src: 'fabric_flick', vol: 0.4}, {t: 0.6, src: 'fabric_flick', vol: 0.4}, {t: 1.4, src: 'whoosh', vol: 0.5}, {t: 1.45, src: 'fabric_flick', vol: 0.55},
      {t: 1.95, src: 'marker_scribble', vol: 0.4}, {t: 2.4, src: 'fabric_flick', vol: 0.55}, {t: 2.95, src: 'marker_scribble', vol: 0.4},
      {t: 3.5, src: 'whoosh', vol: 0.4}, {t: 4.0, src: 'marker_scribble', vol: 0.45}, {t: 4.5, src: 'marker_scribble', vol: 0.45}, {t: 4.6, src: 'pin_tap', vol: 0.4},
      {t: 7.95, src: 'whoosh', vol: 0.45}, {t: 8.55, src: 'paper_rustle', vol: 0.45}, {t: 8.75, src: 'whoosh', vol: 0.5}, {t: 9.05, src: 'whoosh', vol: 0.5},
    ],
    exit: 'loopFade', exitDur: 0.15,
    textSafe: [{x: 30, y: 40, w: 340, h: 470, label: 'insight'}], texts: [], status: 'animated',
  },
];

export const EPISODE_SECONDS = 57;
export const PREVIEW_SECONDS = 10;
