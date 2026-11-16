// ─────────────────────────────────────────────────────────────────────────────
// غريب عجيب · EP02 «ليش ملابس العمليات خضراء أو زرقاء؟» — scene configuration
//
// Every coordinate is in PLATE PIXELS of the approved storyboard PNGs (1672×941).
// The renderer scales plates to 1920×1080 (×1.1483). Times are SCENE-LOCAL seconds.
//
// Nothing here generates artwork: a "piece" is a polygon cut from the scene's own
// plate (same pixels), lifted / flicked / developed in place. Maryam is the mask cut
// from the same plate (public/layers/NN_maryam.png). Glows and traces are light and
// motion overlays on top of existing elements.
// ─────────────────────────────────────────────────────────────────────────────
import layers from './layers.json';

export type Pt = [number, number];
export type ActionKind =
  | 'lift'     // paper lifts off the board: scale overshoot + growing shadow + on-twos jitter
  | 'flick'    // fabric swatch flick: damped rotation/skew wobble
  | 'snap'     // pin / clip / colour chip snap: quick scale pop
  | 'develop'  // archival photo develops from washed-out to the approved print
  | 'dim'      // loses attention: desaturate + darken slightly
  | 'pulse';   // continuous gentle breathing
export type Action = {kind: ActionKind; at: number; amt?: number; dur?: number};
export type Piece = {id: string; poly: Pt[]; actions: Action[]};
export type Glow = {
  id: string; at: number; c: Pt; r: number; color: string;
  mode: 'pulse' | 'flicker' | 'glare'; strength?: number; front?: boolean; until?: number;
};
export type Trace = {id: string; at: number; dur: number; d: string; color?: string; width?: number; repeat?: number};
export type CamKey = {t: number; s: number; c: Pt; ease?: 'out' | 'inout' | 'back'};
export type Sfx = {t: number; src: string; vol?: number; dur?: number; loop?: boolean};
export type Zone = {x: number; y: number; w: number; h: number; label: string};
export type TextLayer = {at: number; dur: number; text: string; zone: number; size?: number}; // optional, editable
export type MaryamAct = {kind: 'present' | 'react' | 'nod'; at: number};
export type Exit = 'fileOpen' | 'rip' | 'slide' | 'stopJump' | 'diagramWipe' | 'pinSnap' | 'archivalReveal' | 'loopFade';

export type Scene = {
  id: string; title: string; from: number; to: number;
  plate: string; maryam: string; maryamBox: [number, number, number, number];
  cam: CamKey[]; pieces: Piece[]; glows: Glow[]; traces: Trace[];
  maryamActs: MaryamAct[]; sfx: Sfx[]; exit: Exit; exitDur: number;
  textSafe: Zone[]; texts: TextLayer[];
  status: 'animated' | 'base-only';
};

const L = layers as unknown as Record<string, {plate: string; maryam: string; maryamBox: [number, number, number, number]}>;
const base = (k: string) => ({plate: L[k].plate, maryam: L[k].maryam, maryamBox: L[k].maryamBox});
const rect = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const CENTER: Pt = [836, 470];

export const FPS = 30;

export const SCENES: Scene[] = [
  // 01 · 0:00–0:05 — white scrub → green/blue. Punchy push-in, Maryam presents the colour shift.
  {
    id: '01', title: 'medical_scrubs_transformation_collage', from: 0, to: 5, ...base('01'),
    cam: [
      {t: 0, s: 1.02, c: CENTER},
      {t: 0.55, s: 1.15, c: [760, 390], ease: 'back'},
      {t: 2.4, s: 1.17, c: [850, 370], ease: 'inout'},
      {t: 5.0, s: 1.22, c: [930, 360], ease: 'inout'},
    ],
    pieces: [
      {id: 'blueSwatchBL', poly: [[198, 765], [345, 762], [352, 882], [205, 888]], actions: [{kind: 'flick', at: 2.9}]},
      {id: 'tealSwatch', poly: [[632, 578], [782, 582], [792, 700], [640, 698]], actions: [{kind: 'flick', at: 1.35}]},
      {id: 'eyeDiagram', poly: rect(820, 28, 220, 140), actions: [{kind: 'lift', at: 0.75, amt: 0.03}]},
      {id: 'greenTop', poly: [[688, 112], [790, 110], [794, 198], [690, 202]], actions: [{kind: 'flick', at: 0.95}]},
      {id: 'greenPatches', poly: [[762, 165], [872, 160], [892, 205], [884, 300], [960, 335], [985, 392], [872, 402], [860, 300], [790, 240]], actions: [{kind: 'flick', at: 1.15}, {kind: 'pulse', at: 2.2, amt: 0.012}]},
      {id: 'bluePatches', poly: [[888, 192], [1095, 198], [1140, 262], [1132, 392], [992, 395], [985, 335], [884, 290]], actions: [{kind: 'flick', at: 1.6}, {kind: 'pulse', at: 2.6, amt: 0.012}]},
      {id: 'whiteScrub', poly: [[498, 218], [612, 196], [705, 214], [772, 224], [802, 258], [832, 330], [764, 392], [762, 578], [518, 582], [496, 520]], actions: [{kind: 'lift', at: 0.35, amt: 0.035}, {kind: 'dim', at: 1.6}]},
      {id: 'paperclip', poly: rect(628, 138, 50, 84), actions: [{kind: 'snap', at: 0.3}]},
      {id: 'chip1', poly: rect(1049, 23, 41, 38), actions: [{kind: 'snap', at: 2.05}]},
      {id: 'chip2', poly: rect(1049, 62, 41, 38), actions: [{kind: 'snap', at: 2.15}]},
      {id: 'chip3', poly: rect(1049, 101, 41, 38), actions: [{kind: 'snap', at: 2.25}]},
      {id: 'chip4', poly: rect(1049, 140, 41, 40), actions: [{kind: 'snap', at: 2.35}]},
    ],
    glows: [
      {id: 'orLamp', at: 0, c: [1468, 72], r: 170, color: '255,250,235', mode: 'pulse', strength: 0.55},
    ],
    traces: [
      // the approved white arrow from the white scrub to the green scrub
      {id: 'arrowWG', at: 1.25, dur: 0.55, d: 'M 728 356 Q 758 440 888 468', repeat: 3.3},
    ],
    maryamActs: [{kind: 'present', at: 1.45}, {kind: 'nod', at: 3.6}],
    sfx: [
      {t: 0.0, src: 'whoosh', vol: 0.55}, {t: 0.3, src: 'pin_tap', vol: 0.5}, {t: 0.35, src: 'paper_lift', vol: 0.6},
      {t: 0.75, src: 'paper_lift', vol: 0.35}, {t: 0.95, src: 'fabric_flick', vol: 0.5}, {t: 1.15, src: 'fabric_flick', vol: 0.45},
      {t: 1.25, src: 'marker_scribble', vol: 0.35}, {t: 1.35, src: 'fabric_flick', vol: 0.35}, {t: 1.6, src: 'fabric_flick', vol: 0.5},
      {t: 2.05, src: 'pin_tap', vol: 0.3}, {t: 2.15, src: 'pin_tap', vol: 0.3}, {t: 2.25, src: 'pin_tap', vol: 0.3}, {t: 2.35, src: 'pin_tap', vol: 0.3},
      {t: 2.9, src: 'fabric_flick', vol: 0.35}, {t: 3.3, src: 'marker_scribble', vol: 0.25},
    ],
    exit: 'fileOpen', exitDur: 0.5,
    textSafe: [{x: 30, y: 40, w: 440, h: 470, label: 'title / question'}],
    texts: [],
    status: 'animated',
  },
  // 02 · 0:05–0:10 — archive: the evidence file opens, the old photos develop one by one.
  {
    id: '02', title: 'archival_medicine_collage_with_presenter', from: 5, to: 10, ...base('02'),
    cam: [
      {t: 0, s: 1.05, c: [800, 360]},
      {t: 2.4, s: 1.13, c: [790, 330], ease: 'inout'},
      {t: 3.6, s: 1.15, c: [860, 640], ease: 'inout'},
      {t: 5.0, s: 1.17, c: [870, 660], ease: 'inout'},
    ],
    pieces: [
      {id: 'archiveOR', poly: [[1252, 0], [1672, 0], [1672, 330], [1262, 345]], actions: [{kind: 'develop', at: 0.6, dur: 0.6}]},
      {id: 'trayPhoto', poly: [[392, 735], [688, 728], [692, 941], [395, 941]], actions: [{kind: 'develop', at: 0.95}, {kind: 'lift', at: 0.95, amt: 0.02}]},
      {id: 'wardPhoto', poly: [[692, 568], [1048, 566], [1052, 882], [694, 880]], actions: [{kind: 'develop', at: 0.7}, {kind: 'lift', at: 0.7, amt: 0.02}]},
      {id: 'scissorsCard', poly: [[426, 604], [698, 600], [700, 716], [430, 722]], actions: [{kind: 'lift', at: 1.5, amt: 0.03}]},
      {id: 'blueSwatch', poly: rect(492, 482, 96, 136), actions: [{kind: 'flick', at: 1.8}]},
      {id: 'clothesPhoto', poly: [[1026, 118], [1248, 128], [1244, 455], [1031, 446]], actions: [{kind: 'develop', at: 0.45}, {kind: 'lift', at: 0.45, amt: 0.02}]},
      {id: 'mainPhoto', poly: [[562, 142], [1004, 90], [1018, 553], [602, 583]], actions: [{kind: 'develop', at: 0.15, dur: 0.7}, {kind: 'lift', at: 0.15, amt: 0.022}]},
      {id: 'clipMain', poly: rect(634, 78, 48, 104), actions: [{kind: 'snap', at: 0.18}]},
    ],
    glows: [
      {id: 'archLamp', at: 0.6, c: [820, 185], r: 150, color: '255,240,210', mode: 'flicker', strength: 0.5},
      {id: 'archLamp2', at: 1.1, c: [1452, 38], r: 110, color: '255,240,210', mode: 'flicker', strength: 0.35},
    ],
    traces: [],
    maryamActs: [{kind: 'present', at: 1.0}, {kind: 'nod', at: 3.4}],
    sfx: [
      {t: 0.18, src: 'pin_tap', vol: 0.45}, {t: 0.15, src: 'page_flip', vol: 0.55}, {t: 0.45, src: 'page_flip', vol: 0.45},
      {t: 0.6, src: 'archive_flicker', vol: 0.22, dur: 3.8, loop: true},
      {t: 0.7, src: 'page_flip', vol: 0.45}, {t: 0.95, src: 'page_flip', vol: 0.4}, {t: 1.5, src: 'paper_lift', vol: 0.45},
      {t: 1.8, src: 'fabric_flick', vol: 0.35}, {t: 3.6, src: 'paper_rustle', vol: 0.3},
    ],
    exit: 'rip', exitDur: 0.5,
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
