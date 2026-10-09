"""غريب عجيب · ليش نحب الخصومات؟ — documentary paper-collage stop-motion, 16:9.

Each beat assembles itself element by element on a newsprint table (back to
front, on twos), then holds as a living poster. Locked camera. Hard cuts.
usage: python3 render.py <scratch> [--still t ...] [--part i n]
"""
import sys, math, random, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

R = sys.argv[1]
F = R + '/fonts/thmanyah typeface/'
O = R + '/ep02/'
W, H, FPS = 1920, 1080, 30
TIM = json.load(open(O + 'timing.json', encoding='utf-8'))
DUR = round(TIM[-1][1] + 1.6, 2)

TAN = (216, 201, 174); TAN2 = (226, 214, 190); TAN3 = (200, 184, 155); CREAM = (243, 236, 220)
INK = (24, 22, 20); GRAY = (120, 114, 104); RED = (196, 38, 30); MUSTARD = (214, 168, 52); BRASS = (176, 140, 70)

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def q12(t): return math.floor(t * 12) / 12
_fc = {}
def fnt(fam, wt, s):
    k = (fam, wt, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(f'{F}{fam}/otf/{fam}-{wt}.otf', s)
    return _fc[k]
SD, SS, ST = 'thmanyahserifdisplay', 'thmanyahsans', 'thmanyahseriftext'
RND = np.random.default_rng(11)

# ---------------------------------------------------------------- paper pieces
def rough(mask, amt=46, blur=2.2, seed=0):
    """Scissor-cut edge: blur the mask, add noise, re-threshold."""
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(blur)), np.float32)
    n = np.random.default_rng(seed).normal(0, amt, m.shape)
    return Image.fromarray(((m + n) > 128).astype(np.uint8) * 255, 'L')

def fiber(size, base, seed, k=10):
    w, h = size
    a = np.full((h, w, 3), base, np.float32)
    rng = np.random.default_rng(seed)
    a += rng.normal(0, 4, (h, w, 1))
    n = Image.effect_noise((max(1, w // 6), max(1, h // 6)), 50).resize((w, h), Image.BICUBIC)
    a *= (1 - k / 255 + k / 255 * np.asarray(n, np.float32)[..., None] / 128)
    return np.clip(a, 0, 255)

def halftone(size, dark=0.85, light=0.15, cell=7, angle=0, seed=0, shade=None):
    """Ink dots on white backing; dot size follows a top-left light gradient."""
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    g = shade if shade is not None else (0.35 * xx / max(w, 1) + 0.65 * yy / max(h, 1))
    tone = light + (dark - light) * g
    c = math.cos(math.radians(45)); s = math.sin(math.radians(45))
    u = (xx * c + yy * s) / cell; v = (-xx * s + yy * c) / cell
    d = np.sqrt((u - np.round(u)) ** 2 + (v - np.round(v)) ** 2)
    ink = d < (0.62 * np.sqrt(tone))
    a = np.full((h, w, 3), (245, 241, 232), np.float32)
    a[ink] = (34, 32, 30)
    a += np.random.default_rng(seed).normal(0, 3, (h, w, 1))
    return np.clip(a, 0, 255)

def piece(mask, fill='paper', color=CREAM, seed=0, rim=True, shadow=(9, 13), blur=11, sa=0.38, tone=(0.85, 0.15)):
    mask = rough(mask, seed=seed)
    w, h = mask.size
    if fill == 'halftone':
        rgb = halftone((w, h), tone[0], tone[1], seed=seed)
    elif fill == 'flat':
        rgb = np.full((h, w, 3), color, np.float32)
    else:
        rgb = fiber((w, h), color, seed)
    body = Image.fromarray(rgb.astype(np.uint8), 'RGB').convert('RGBA'); body.putalpha(mask)
    pad = blur * 2 + max(abs(shadow[0]), abs(shadow[1])) + 6
    out = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sm = Image.new('L', out.size, 0); sm.paste(mask, (pad + shadow[0], pad + shadow[1]))
    sm = sm.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * sa))
    sh = Image.new('RGBA', out.size, (20, 14, 8, 255)); sh.putalpha(sm); out.alpha_composite(sh)
    if rim:   # pale paper core showing at the cut edge
        rm = Image.new('L', out.size, 0); rm.paste(mask.filter(ImageFilter.MaxFilter(5)), (pad, pad))
        rl = Image.new('RGBA', out.size, (247, 243, 233, 255)); rl.putalpha(rough(rm, 30, 1.2, seed + 7)); out.alpha_composite(rl)
    out.alpha_composite(body, (pad, pad))
    return out

def canvas(w, h): return Image.new('L', (w, h), 0)

def text_mask_layer(img, s, f, xy, fill, anchor='mm'):
    ImageDraw.Draw(img).text(xy, s, font=f, fill=fill, anchor=anchor, direction='rtl', language='ar')

def label_strip(s, size=64, fam=SD, wt='Black', color=CREAM, ink=INK, pad=(46, 26), seed=0, typewriter=False):
    f = fnt(ST if typewriter else fam, 'Bold' if typewriter else wt, size)
    l, t, r, b = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), s, font=f, direction='rtl', language='ar')
    w, h = r - l + pad[0] * 2, b - t + pad[1] * 2
    m = canvas(w, h); ImageDraw.Draw(m).rectangle([0, 0, w, h], fill=255)
    p = piece(m, color=color, seed=seed, shadow=(6, 9), blur=8)
    off = (p.width - w) // 2
    ImageDraw.Draw(p).text((off + pad[0] - l, off + pad[1] - t), s, font=f, fill=ink, direction='rtl', language='ar')
    return p

def stamp(s, size=96, color=RED, seed=0, rot=-8):
    f = fnt(SD, 'Black', size)
    l, t, r, b = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), s, font=f, direction='rtl', language='ar')
    w, h = r - l + 80, b - t + 60
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([6, 6, w - 6, h - 6], outline=color, width=9)
    d.text((40 - l, 30 - t), s, font=f, fill=color, direction='rtl', language='ar')
    a = np.asarray(im).copy(); rng = np.random.default_rng(seed)
    worn = rng.random(a.shape[:2]) < 0.22; a[worn, 3] = (a[worn, 3] * 0.3).astype(np.uint8)
    return Image.fromarray(a, 'RGBA').rotate(rot, resample=Image.BICUBIC, expand=True)

def pin():
    im = Image.new('RGBA', (60, 60), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([18, 22, 46, 50], fill=(0, 0, 0, 70)); d.ellipse([12, 14, 40, 42], fill=BRASS); d.ellipse([18, 18, 26, 26], fill=(235, 210, 150))
    return im

def tape(w=150, h=46, rot=12, seed=0):
    m = canvas(w, h); ImageDraw.Draw(m).rectangle([0, 0, w, h], fill=255)
    m = rough(m, 60, 1.5, seed)
    im = Image.new('RGBA', (w, h), (236, 228, 200, 0)); im.putalpha(m.point(lambda v: int(v * 0.62)))
    return im.rotate(rot, resample=Image.BICUBIC, expand=True)

# ---------------------------------------------------------------- object masks
def m_tag(w=520, h=280):
    m = canvas(w, h); d = ImageDraw.Draw(m)
    d.polygon([(0, h * .5), (h * .5, 0), (w, 0), (w, h), (h * .5, h)], fill=255)
    d.ellipse([h * .32, h * .4, h * .52, h * .6], fill=0)
    return m

def m_shirt(s=1.0):
    w, h = int(520 * s), int(560 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    k = lambda pts: [(x * s, y * s) for x, y in pts]
    d.polygon(k([(150, 40), (215, 20), (260, 60), (305, 20), (370, 40), (500, 140), (440, 230), (395, 195), (395, 540), (125, 540), (125, 195), (80, 230), (20, 140)]), fill=255)
    d.polygon(k([(225, 30), (260, 90), (295, 30)]), fill=0)
    return m

def m_hanger(s=1.0):
    w, h = int(520 * s), int(200 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    d.line([(30 * s, 180 * s), (260 * s, 70 * s), (490 * s, 180 * s), (30 * s, 180 * s)], fill=255, width=int(12 * s))
    d.arc([230 * s, 0, 290 * s, 60 * s], 180, 420, fill=255, width=int(10 * s)); d.line([(260 * s, 55 * s), (260 * s, 75 * s)], fill=255, width=int(10 * s))
    return m

def m_hand(flip=False, s=1.0):
    w, h = int(560 * s), int(260 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    k = lambda pts: [(x * s, y * s) for x, y in pts]
    d.polygon(k([(0, 90), (250, 70), (330, 40), (520, 30), (540, 60), (360, 90), (500, 100), (510, 130), (370, 140), (480, 160), (470, 190), (350, 190), (420, 215), (400, 240), (250, 225), (0, 210)]), fill=255)
    return m.transpose(Image.FLIP_LEFT_RIGHT) if flip else m

def m_bag(s=1.0):
    w, h = int(420 * s), int(470 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    d.polygon([(40 * s, 130 * s), (380 * s, 130 * s), (410 * s, 465 * s), (10 * s, 465 * s)], fill=255)
    d.arc([110 * s, 10 * s, 310 * s, 230 * s], 180, 360, fill=255, width=int(18 * s))
    return m

def m_circle(r): m = canvas(2 * r, 2 * r); ImageDraw.Draw(m).ellipse([0, 0, 2 * r, 2 * r], fill=255); return m
def m_rect(w, h): m = canvas(w, h); ImageDraw.Draw(m).rectangle([0, 0, w, h], fill=255); return m

def m_heart(s=120):
    m = canvas(s, s); pts = []
    for i in range(80):
        t = i / 80 * 2 * math.pi
        x = 16 * math.sin(t) ** 3; y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((s / 2 + x * s / 36, s / 2 - y * s / 36))
    ImageDraw.Draw(m).polygon(pts, fill=255); return m

def m_cloud(w=520, h=360):
    m = canvas(w, h); d = ImageDraw.Draw(m)
    for cx, cy, r in [(150, 190, 120), (270, 140, 140), (390, 190, 115), (260, 240, 120), (130, 250, 80), (400, 255, 85)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    return m

def m_head(s=1.0):
    w, h = int(380 * s), int(500 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    k = lambda pts: [(x * s, y * s) for x, y in pts]
    d.polygon(k([(170, 10), (280, 30), (340, 120), (345, 200), (375, 245), (340, 260), (345, 300), (320, 330), (320, 370), (260, 380), (250, 440), (330, 500), (20, 500), (70, 420), (60, 300), (40, 180), (80, 60)]), fill=255)
    return m

def m_wallet():
    m = canvas(560, 340); d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 40, 560, 340], 30, fill=255); d.rounded_rectangle([20, 0, 540, 120], 26, fill=255)
    return m

def m_gauge(r=330):
    m = canvas(2 * r, r + 40); d = ImageDraw.Draw(m); d.pieslice([0, 0, 2 * r, 2 * r], 180, 360, fill=255); d.rectangle([0, r, 2 * r, r + 40], fill=255); return m

def m_calendar():
    m = canvas(420, 480); d = ImageDraw.Draw(m); d.rectangle([0, 50, 420, 480], fill=255)
    for x in (90, 210, 330): d.rounded_rectangle([x - 14, 0, x + 14, 90], 12, fill=255)
    return m

def m_store():
    m = canvas(1060, 600); d = ImageDraw.Draw(m)
    d.rectangle([0, 60, 1060, 600], fill=255); d.rectangle([40, 0, 1020, 80], fill=255)
    for x in (70, 330, 690, 850):                 # display windows
        d.rectangle([x, 150, x + 140 if x in (70, 850) else x + 240, 470], fill=0)
    d.rectangle([470, 230, 590, 600], fill=0)     # doors
    d.line([(530, 230), (530, 600)], fill=255, width=8)
    return m

def m_cart(s=1.0):
    w, h = int(460 * s), int(380 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    k = lambda pts: [(x * s, y * s) for x, y in pts]
    d.polygon(k([(60, 60), (440, 80), (400, 250), (110, 250)]), fill=255)
    d.line(k([(0, 20), (60, 20), (120, 300), (400, 300)]), fill=255, width=int(16 * s))
    for cx in (150, 370): d.ellipse([cx * s - 28 * s, 310 * s, cx * s + 28 * s, 366 * s], fill=255)
    return m

def m_arrow(w=180, h=320, down=True):
    m = canvas(w, h); d = ImageDraw.Draw(m)
    d.polygon([(w * .3, 0), (w * .7, 0), (w * .7, h * .6), (w, h * .6), (w / 2, h), (0, h * .6), (w * .3, h * .6)], fill=255)
    return m if down else m.transpose(Image.FLIP_TOP_BOTTOM)

def m_magnifier():
    m = canvas(460, 460); d = ImageDraw.Draw(m); d.ellipse([0, 0, 320, 320], outline=255, width=34)
    d.line([(270, 270), (440, 440)], fill=255, width=50); return m

def m_hat():
    m = canvas(420, 380); d = ImageDraw.Draw(m); d.rectangle([80, 0, 340, 300], fill=255); d.ellipse([0, 270, 420, 380], fill=255); return m

def m_mirror():
    m = canvas(440, 600); ImageDraw.Draw(m).ellipse([0, 0, 440, 600], fill=255); return m

def m_person_back(s=1.0):
    w, h = int(420 * s), int(560 * s); m = canvas(w, h); d = ImageDraw.Draw(m)
    d.ellipse([140 * s, 0, 280 * s, 150 * s], fill=255)
    d.polygon([(40 * s, 560 * s), (60 * s, 230 * s), (150 * s, 160 * s), (270 * s, 160 * s), (360 * s, 230 * s), (380 * s, 560 * s)], fill=255)
    return m

def m_scissors():
    m = canvas(300, 170); d = ImageDraw.Draw(m)
    d.ellipse([0, 10, 80, 70], outline=255, width=14); d.ellipse([0, 100, 80, 160], outline=255, width=14)
    d.polygon([(70, 45), (300, 95), (80, 75)], fill=255); d.polygon([(70, 125), (300, 75), (80, 95)], fill=255)
    return m

def m_spark(s=70):
    m = canvas(s, s); c = s / 2; d = ImageDraw.Draw(m)
    d.polygon([(c, 0), (c + s * .12, c - s * .12), (s, c), (c + s * .12, c + s * .12), (c, s), (c - s * .12, c + s * .12), (0, c), (c - s * .12, c - s * .12)], fill=255)
    return m

# ---------------------------------------------------------------- composite helpers
class El:
    def __init__(self, img, cx, cy, mode='drop', frm=(0, 0), rot=0.0, string=None):
        self.img = img.rotate(rot, resample=Image.BICUBIC, expand=True) if rot else img
        self.cx, self.cy, self.mode, self.frm, self.string = cx, cy, mode, frm, string

def P(mask, fill='paper', color=CREAM, seed=0, **kw): return piece(mask, fill, color, seed, **kw)

def tag_with(label=None, fig=None, w=520, h=280, seed=0, size=None, color=TAN2):
    p = P(m_tag(w, h), color=color, seed=seed)
    if label or fig:
        s = label or fig
        f = fnt(SD if label else SS, 'Black', size or (96 if label else 120))
        off = (p.width - w) // 2
        d = ImageDraw.Draw(p)
        d.text((off + w * .6, off + h * .5), s, font=f, fill=INK, anchor='mm', direction='rtl' if label else None, language='ar' if label else None)
    return p

def string_line(a, b, color=RED, width=5): return ('string', a, b, color, width)

def beat_elems(i):
    """Back to front: background scraps, hero, supports, tape/pins, label/stamp."""
    random.seed(i)
    bg = [El(P(m_rect(random.randint(420, 700), random.randint(260, 460)), color=random.choice([TAN2, TAN3, CREAM]), seed=100 + i, shadow=(4, 6), sa=.2), random.randint(300, 1600), random.randint(250, 800), 'slide', (random.choice([-1, 1]) * 900, 0), random.uniform(-8, 8))]
    E = []
    if i == 0:
        E = [El(tag_with('الخصومات', w=760, h=380, seed=1), 820, 520, 'slide', (-1200, 0), -14),
             El(P(m_scissors(), 'halftone', seed=2), 1380, 700, 'drop', rot=18),
             El(pin(), 655, 455, 'stamp')]
        E.append(El(Image.new('RGBA', (1, 1)), 0, 0, string=string_line((520, 300), (650, 455))))
    elif i in (1, 2, 3):
        fig = {1: '100', 2: '200', 3: None}[i]
        E = [El(P(m_hanger(), 'flat', color=(60, 58, 54), seed=3, rim=False, sa=.25), 860, 250, 'drop'),
             El(P(m_shirt(), 'halftone', seed=4, tone=(.55, .08)), 860, 560, 'slide', (0, -900)),
             El(tape(160, 46, -10, 5), 860, 170, 'stamp'),
             El(tag_with(fig=fig or '200', w=360 if i == 1 else 470, h=190 if i == 1 else 250, seed=6 + i), 1300, 720, 'slide', (900, 0), 10)]
        E.append(El(Image.new('RGBA', (1, 1)), 0, 0, string=string_line((1060, 540), (1150, 690))))
        if i == 3: E.append(El(stamp('50%', 120, seed=9), 1330, 700, 'stamp'))
    elif i == 4:
        E = [El(P(m_shirt(.8), 'halftone', seed=4, tone=(.55, .08)), 640, 470, 'drop'),
             El(P(m_bag(.9), color=MUSTARD, seed=10), 640, 790, 'slide', (0, 700)),
             El(P(m_hand(True), 'halftone', seed=11, tone=(.6, .12)), 1300, 470, 'slide', (900, 0))]
    elif i == 5:
        E = [El(P(m_shirt(.75), 'halftone', seed=4, tone=(.55, .08)), 560, 500, 'slide', (-900, 0), -3),
             El(P(m_shirt(.75), 'halftone', seed=12, tone=(.55, .08)), 1360, 500, 'slide', (900, 0), 3),
             El(tape(130, 40, 8, 13), 560, 290, 'stamp'), El(tape(130, 40, -8, 14), 1360, 290, 'stamp'),
             El(label_strip('ليش؟', 110, seed=15), 960, 520, 'slide', (0, -700), -2)]
    elif i == 6:
        E = [El(P(m_rect(300, 330), color=(110, 84, 60), seed=16), 960, 760, 'slide', (0, 600)),
             El(P(m_person_back(), 'halftone', seed=17, tone=(.95, .55)), 960, 470, 'drop'),
             El(label_strip('ريتشارد ثيلر', 56, seed=18, typewriter=True), 960, 900, 'slide', (-900, 0), -1)]
    elif i == 7:
        E = [El(P(m_rect(80, 260), color=RED, seed=19, shadow=(5, 7)), 960, 300, 'drop'),
             El(P(m_circle(200), color=MUSTARD, seed=20), 960, 560, 'drop'),
             El(P(m_circle(130), 'halftone', seed=21, tone=(.4, .1)), 960, 560, 'stamp'),
             El(label_strip('نوبل', 90, seed=22), 960, 860, 'slide', (900, 0), 2)]
    elif i == 8:
        E = [El(P(m_bag(1.1), color=MUSTARD, seed=10), 960, 640, 'drop'),
             El(P(m_shirt(.6), 'halftone', seed=4, tone=(.55, .08)), 960, 400, 'slide', (0, -800), 8),
             El(tape(170, 44, 4, 23), 960, 465, 'stamp')]
    elif i == 9:
        E = [El(tag_with(w=520, h=260, seed=24), 960, 760, 'drop', rot=-6),
             El(P(m_hand(False), 'halftone', seed=25, tone=(.6, .12)), 720, 520, 'slide', (-900, 0)),
             El(P(m_hand(True), 'halftone', seed=26, tone=(.6, .12)), 1200, 520, 'slide', (900, 0)),
             El(P(m_heart(130), color=RED, seed=27), 960, 320, 'stamp'),
             El(label_strip('الصفقة', 84, seed=28), 1450, 880, 'slide', (700, 0), -3)]
    elif i == 10:
        E = [El(tag_with(w=420, h=220, seed=29), 420, 520, 'slide', (-900, 0), -8),
             El(tag_with(w=420, h=220, seed=30), 1500, 520, 'slide', (900, 0), 8),
             El(pin(), 330, 470, 'stamp'), El(pin(), 1590, 470, 'stamp')]
        E.append(El(Image.new('RGBA', (1, 1)), 0, 0, string=string_line((360, 500), (1560, 500))))
        E.append(El(label_strip('الفرق', 84, seed=31), 960, 500, 'stamp', rot=-2))
    elif i == 11:
        E = [El(P(m_head(), 'halftone', seed=32, tone=(.95, .5)), 1450, 560, 'slide', (800, 0)),
             El(P(m_cloud(), color=CREAM, seed=33), 760, 400, 'drop'),
             El(tag_with(w=360, h=180, seed=34), 760, 410, 'stamp', rot=-6),
             El(P(m_circle(26), color=CREAM, seed=35), 1120, 640, 'stamp'), El(P(m_circle(16), color=CREAM, seed=36), 1200, 690, 'stamp')]
    elif i == 12:
        E = [El(P(m_wallet(), color=(98, 70, 50), seed=37), 860, 600, 'drop'),
             El(P(m_rect(420, 200), color=(196, 206, 180), seed=38), 900, 420, 'slide', (0, -700), -10),
             El(P(m_rect(420, 200), color=(206, 214, 190), seed=39), 960, 380, 'slide', (0, -700), 6),
             El(P(m_circle(70), color=MUSTARD, seed=40), 1330, 700, 'stamp')]
    elif i == 13:
        E = [El(P(m_gauge(), color=TAN2, seed=41), 960, 620, 'drop'),
             El(P(m_rect(60, 40), color=RED, seed=42, rim=False, shadow=(2, 3)), 1220, 470, 'stamp', rot=40),
             El(P(m_rect(380, 22), color=INK, seed=43, shadow=(4, 6), rim=False), 1100, 560, 'slide', (-500, 300), 28),
             El(pin(), 960, 640, 'stamp')]
    elif i == 14:
        E = [El(P(m_calendar(), color=CREAM, seed=44), 960, 470, 'drop'),
             El(label_strip('2012', 110, fam=SS, wt='Black', seed=45, typewriter=False), 960, 560, 'slide', (900, 0), -2),
             El(tape(150, 44, -14, 46), 760, 470, 'stamp')]
    elif i == 15:
        E = [El(P(m_store(), 'halftone', seed=47, tone=(.7, .2)), 960, 460, 'drop'),
             El(P(m_rect(980, 60), color=RED, seed=48, shadow=(4, 6)), 960, 200, 'slide', (0, -500)),
             El(label_strip('جي سي بيني', 64, seed=49, typewriter=True), 960, 860, 'slide', (-900, 0), -1)]
    elif i == 16:
        E = [El(P(m_store(), 'halftone', seed=47, tone=(.7, .2)), 960, 460, 'drop'),
             El(tag_with(w=380, h=200, seed=50), 960, 520, 'stamp', rot=-4),
             El(P(m_rect(160, 60), color=TAN3, seed=51), 600, 880, 'drop', rot=12), El(P(m_rect(140, 50), color=TAN3, seed=52), 1320, 900, 'drop', rot=-18)]
    elif i == 17:
        E = [El(P(m_rect(360, 200), color=MUSTARD, seed=53), 820, 470, 'drop', rot=-10),
             El(P(m_rect(300, 160), color=CREAM, seed=54), 1100, 560, 'drop', rot=8),
             El(P(m_rect(260, 140), color=TAN2, seed=55), 900, 680, 'drop', rot=-4)]
        xm = Image.new('RGBA', (700, 520), (0, 0, 0, 0)); d = ImageDraw.Draw(xm)
        d.line([(40, 40), (660, 480)], fill=RED, width=34); d.line([(660, 40), (40, 480)], fill=RED, width=34)
        E += [El(xm, 960, 560, 'stamp'), El(label_strip('لا خصومات', 80, seed=56), 1560, 860, 'slide', (700, 0), 3)]
    elif i == 18:
        E = [El(tag_with(w=640, h=320, seed=57), 960, 480, 'drop', rot=-3), El(pin(), 790, 440, 'stamp'),
             El(label_strip('سعر واحد', 84, seed=58), 960, 820, 'slide', (0, 500), 1)]
    elif i == 19:
        E = [El(P(m_rect(1500, 120), color=TAN3, seed=59, sa=.2), 960, 820, 'slide', (-1500, 0)),
             El(P(m_cart(1.3), 'halftone', seed=60, tone=(.8, .3)), 960, 560, 'slide', (1300, 0))]
    elif i == 20:
        E = [El(P(m_rect(120, 520), color=TAN2, seed=61), 640, 660, 'drop'), El(P(m_rect(120, 460), color=TAN2, seed=62), 820, 690, 'drop'),
             El(P(m_rect(120, 400), color=TAN2, seed=63), 1000, 720, 'drop'), El(P(m_rect(120, 160), color=TAN3, seed=64), 1180, 840, 'drop'),
             El(P(m_arrow(), color=RED, seed=65), 1400, 600, 'slide', (0, -600)),
             El(stamp('25%', 120, seed=66), 1580, 340, 'stamp')]
    elif i == 21:
        E = []
        for k in range(7):
            E.append(El(P(m_rect(460, 210), color=(196 + k % 2 * 10, 206, 180), seed=67 + k), 860 + k * 14, 760 - k * 62, 'drop', rot=(k * 7 % 13) - 6 + k * 2))
        E += [El(P(m_arrow(), color=RED, seed=75), 1380, 560, 'slide', (0, -600)),
              El(label_strip('$985,000,000', 84, fam=SS, wt='Black', seed=76), 900, 280, 'slide', (-900, 0), -2)]
    elif i == 22:
        E = [El(P(m_store(), 'halftone', seed=47, tone=(.7, .2)), 960, 460, 'drop'),
             El(P(m_rect(300, 170), color=MUSTARD, seed=77), 620, 520, 'drop', rot=-8),
             El(P(m_rect(300, 170), color=RED, seed=78), 960, 470, 'drop', rot=5),
             El(P(m_rect(300, 170), color=MUSTARD, seed=79), 1300, 530, 'drop', rot=-4),
             El(tape(120, 40, 10, 80), 620, 430, 'stamp'), El(tape(120, 40, -10, 81), 1300, 440, 'stamp')]
    elif i == 23:
        E = [El(tag_with(w=600, h=300, seed=82), 900, 560, 'drop', rot=-5),
             El(P(m_magnifier(), 'flat', color=(40, 38, 36), seed=83, rim=False), 1080, 600, 'slide', (900, 400))]
    elif i == 24:
        E = [El(P(m_hat(), 'flat', color=(30, 28, 27), seed=84), 960, 640, 'drop'),
             El(tag_with(w=380, h=200, seed=85), 960, 330, 'slide', (0, 300), 8),
             El(P(m_spark(80), color=MUSTARD, seed=86), 700, 330, 'stamp'), El(P(m_spark(60), color=MUSTARD, seed=87), 1230, 260, 'stamp'),
             El(label_strip('حيلة', 90, seed=88), 1500, 820, 'slide', (700, 0), -3)]
    elif i == 25:
        E = [El(P(m_mirror(), color=(150, 120, 80), seed=89), 960, 520, 'drop'),
             El(P(m_mirror().resize((380, 540)), color=(222, 226, 222), seed=90, rim=False, sa=.15), 960, 520, 'stamp'),
             El(P(m_person_back(.85), 'halftone', seed=91, tone=(.95, .55)), 960, 600, 'drop'),
             El(tag_with(w=240, h=120, seed=92), 1080, 420, 'stamp', rot=-10),
             El(tape(140, 44, 6, 93), 960, 250, 'stamp')]
    else:
        E = [El(tag_with(w=760, h=380, seed=1), 820, 520, 'slide', (-1200, 0), -14),
             El(P(m_scissors(), 'halftone', seed=2), 1380, 700, 'drop', rot=18), El(pin(), 655, 455, 'stamp')]
        E.append(El(Image.new('RGBA', (1, 1)), 0, 0, string=string_line((520, 300), (650, 455))))
    return bg + E

# ---------------------------------------------------------------- timeline + frame
BEATS = None; BG = None; GR = None; BADGE = None; LOGO = None
def init():
    global BEATS, BG, GR, BADGE, LOGO
    rng = np.random.default_rng(3)
    a = fiber((W, H), TAN, 1, k=16)
    for _ in range(14):                        # coffee/age stains
        cx, cy, r = rng.integers(0, W), rng.integers(0, H), rng.integers(80, 300)
        yy, xx = np.ogrid[0:H, 0:W]; d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
        a *= (1 - 0.05 * np.clip(1 - d, 0, 1)[..., None])
    ht = halftone((W, H), 0.12, 0.02, cell=5, shade=np.full((H, W), .5, np.float32))
    a = a * 0.94 + ht * 0.06
    BG = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
    GR = [rng.normal(0, 4, (H, W, 1)).astype(np.float32) for _ in range(3)]
    BEATS = [beat_elems(i) for i in range(len(TIM))]
    BADGE = stamp('غريب عجيب', 40, INK, seed=5, rot=-4)
    lg = Image.open(R + '/reel/logo_white.png'); m = lg.getchannel('A')
    ink = Image.new('RGBA', lg.size, INK + (255,)); ink.putalpha(m)
    LOGO = ink.resize((150, int(lg.height * 150 / lg.width)), Image.LANCZOS)

def beat_at(t):
    for i in range(len(TIM)):
        end = TIM[i + 1][0] if i + 1 < len(TIM) else DUR
        if t < end: return i, TIM[i][0] if i else 0.0, end
    return len(TIM) - 1, TIM[-1][0], DUR

def paste(fr, im, cx, cy, s=1.0, a=1.0):
    if a <= .01: return
    if s != 1: im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BICUBIC)
    if a < 1: im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a)))
    fr.paste(im, (int(cx - im.width / 2), int(cy - im.height / 2)), im)

def frame_at(t):
    i, t0, t1 = beat_at(t)
    els = BEATS[i]
    D = t1 - t0
    A = min(D * 0.62, 0.32 * len(els) + 0.2)
    lt = q12(t - t0)                        # on twos, 12fps
    fr = BG.copy()
    d = ImageDraw.Draw(fr)
    for k, e in enumerate(els):
        te = A * k / max(1, len(els))
        u = (lt - te) / 0.25
        if u <= 0: continue
        u = clamp(u)
        if e.string:
            _, a, b, col, wd = e.string
            k2 = clamp(u * 1.4)
            d.line([a, (a[0] + (b[0] - a[0]) * k2, a[1] + (b[1] - a[1]) * k2)], fill=col, width=wd)
            continue
        ease = 1 - (1 - u) ** 3
        bounce = math.sin(u * math.pi) * 0.04 if u < 1 else 0
        if e.mode == 'slide':
            paste(fr, e.img, e.cx + e.frm[0] * (1 - ease), e.cy + e.frm[1] * (1 - ease) - 8 * bounce * 25)
        elif e.mode == 'stamp':
            s = 1.35 - 0.35 * clamp(u * 2.5)
            paste(fr, e.img, e.cx, e.cy, s, clamp(u * 3))
        else:
            paste(fr, e.img, e.cx, e.cy - 40 * (1 - ease), 1.08 - 0.08 * ease + bounce, clamp(u * 2.5))
    fr.paste(BADGE, (W - BADGE.width - 50, 40), BADGE)
    if i == len(TIM) - 1:
        paste(fr, LOGO, 140, H - 110, 1, clamp((t - t0 - 0.6) / 0.5))
    caption(fr, t)
    a = np.asarray(fr.convert('RGB')).astype(np.float32) + GR[int(q12(t) * 12) % 3]
    return np.clip(a, 0, 255).astype(np.uint8)

_cap = {}
def caption(fr, t):
    for a, b, s in TIM:
        if a <= t < b + 0.12:
            if s not in _cap:
                f = fnt(SS, 'Bold', 40)
                l, tt, r, bb = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), s, font=f, direction='rtl', language='ar')
                im = Image.new('RGBA', (r - l + 56, bb - tt + 30), (20, 18, 16, 175))
                ImageDraw.Draw(im).text((28 - l, 15 - tt), s, font=f, fill=(248, 244, 234), direction='rtl', language='ar')
                _cap[s] = im
            im = _cap[s]
            fr.paste(im, ((W - im.width) // 2, 1000 - im.height // 2), im)
            return

if __name__ == '__main__':
    init()
    args = sys.argv[2:]
    if args and args[0] == '--still':
        for s in args[1:]: Image.fromarray(frame_at(float(s))).save(f'{O}still_{float(s):05.2f}.png')
    else:
        i, n = (int(args[1]), int(args[2])) if args and args[0] == '--part' else (0, 1)
        total = int(round(DUR * FPS)); lo, hi = total * i // n, total * (i + 1) // n
        out = sys.stdout.buffer
        for f in range(lo, hi): out.write(frame_at(f / FPS).tobytes())
