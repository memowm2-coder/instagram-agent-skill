"""Paper-cut motion reel renderer: «الأمان… إن أمك تنام».

usage: python3 render.py <root> [--still T ...] [--part i n]
"""
import math, random, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = sys.argv[1]
FONTS = ROOT + '/fonts/thmanyah typeface/'
OUT = ROOT + '/reel'
W, H, FPS = 1080, 1920, 30
DUR = 42.7
CX = 470            # text centre, keeps clear of the right action rail

def hx(s): s = s.lstrip('#'); return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))
NAVY, DEEP, MID, WALL = hx('14213D'), hx('0E1730'), hx('2A3D66'), hx('22355E')
CREAM, PAPER, SAND, SAND2 = hx('F3EBDD'), hx('FBF7F0'), hx('D8C3A5'), hx('C4AA85')
SKY, BROWN, BROWN2, GOLD = hx('A9CCE3'), hx('8B5E3C'), hx('6E4529'), hx('E9B44C')
INK, NIGHT = hx('1B191A'), hx('0B1226')

def font(fam, wt, size):
    return ImageFont.truetype(f'{FONTS}{fam}/otf/{fam}-{wt}.otf', size)

def lighten(c, k): return tuple(min(255, int(v + (255 - v) * k)) for v in c)
def darken(c, k): return tuple(int(v * (1 - k)) for v in c)
def clamp(x, a=0., b=1.): return max(a, min(b, x))
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_in(x): x = clamp(x); return x ** 3
def ease_io(x): x = clamp(x); return 3 * x * x - 2 * x ** 3
def back_out(x):
    x = clamp(x); c = 1.7
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def q12(t): return math.floor(t * 12) / 12          # stop-motion clock

# ------------------------------------------------------------ sprites
class Sprite:
    def __init__(self, img, x, y): self.img, self.x, self.y = img, x, y

def torn(pts, jit, rnd, step=18):
    out = []
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        n = max(2, int(math.hypot(x2 - x1, y2 - y1) / step))
        for k in range(n):
            f = k / n
            out.append((x1 + (x2 - x1) * f + rnd.uniform(-jit, jit),
                        y1 + (y2 - y1) * f + rnd.uniform(-jit, jit)))
    return out

_seed = [7]
def paper(pts, color, jit=2.5, shadow=(7, 9), blur=9, sa=120, rim=True, shade=True, alpha=255):
    _seed[0] += 1; rnd = random.Random(_seed[0])
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    pad = int(blur * 3 + max(abs(shadow[0]), abs(shadow[1])) + jit * 3 + 6)
    x0, y0 = int(min(xs)) - pad, int(min(ys)) - pad
    w, h = int(max(xs)) - x0 + pad, int(max(ys)) - y0 + pad
    loc = [(x - x0, y - y0) for x, y in pts]
    main = torn(loc, jit, rnd)
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if sa:
        sh = Image.new('L', (w, h), 0)
        ImageDraw.Draw(sh).polygon([(x + shadow[0], y + shadow[1]) for x, y in main], fill=sa)
        sh = sh.filter(ImageFilter.GaussianBlur(blur))
        img.putalpha(sh)
        img = Image.composite(Image.new('RGBA', (w, h), (0, 0, 0, 255)), img, sh)
        img.putalpha(sh)
    d = ImageDraw.Draw(img)
    if rim:
        d.polygon(torn(loc, jit + 1.6, rnd), fill=lighten(color, .55) + (alpha,))
    body = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(body).polygon(main, fill=color + (alpha,))
    if shade:   # light from the top: paper is a little brighter at the top edge
        arr = np.asarray(body).astype(np.float32)
        g = np.linspace(1.04, 0.9, h, dtype=np.float32)[:, None]
        arr[..., :3] = np.clip(arr[..., :3] * g[..., None], 0, 255)
        body = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    img.alpha_composite(body)
    return Sprite(img, x0, y0)

def rect(x, y, w, h): return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
def ell(cx, cy, rx, ry, n=40, a0=0, a1=2 * math.pi):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def glow(cx, cy, r, color, peak=150):
    s = int(r * 2)
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    d = np.sqrt((xx - r) ** 2 + (yy - r) ** 2) / r
    a = (np.clip(1 - d, 0, 1) ** 2.2 * peak).astype(np.uint8)
    arr = np.zeros((s, s, 4), np.uint8); arr[..., :3] = color; arr[..., 3] = a
    return Sprite(Image.fromarray(arr, 'RGBA'), int(cx - r), int(cy - r))

def text_sprite(txt, size, color=PAPER, fam='thmanyahserifdisplay', wt='Black', maxw=860, shadow=True):
    f = font(fam, wt, size)
    dd = ImageDraw.Draw(Image.new('L', (1, 1)))
    l, t, r, b = dd.textbbox((0, 0), txt, font=f, direction='rtl', language='ar')
    while r - l > maxw and size > 30:
        size -= 4; f = font(fam, wt, size)
        l, t, r, b = dd.textbbox((0, 0), txt, font=f, direction='rtl', language='ar')
    pad = 40
    w, h = r - l + pad * 2, b - t + pad * 2
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if shadow:   # cut-paper letters sitting slightly above the page
        m = Image.new('L', (w, h), 0)
        ImageDraw.Draw(m).text((pad - l + 5, pad - t + 7), txt, font=f, fill=150, direction='rtl', language='ar')
        m = m.filter(ImageFilter.GaussianBlur(7))
        sh = Image.new('RGBA', (w, h), (0, 0, 0, 255)); sh.putalpha(m); img.alpha_composite(sh)
    ImageDraw.Draw(img).text((pad - l, pad - t), txt, font=f, fill=color, direction='rtl', language='ar')
    return img

_tcache = {}
def T(txt, size, color=PAPER, **kw):
    k = (txt, size, color, tuple(sorted(kw.items())))
    if k not in _tcache:
        base = text_sprite(txt, size, color, **kw)
        _tcache[k] = [base.rotate(a, resample=Image.BICUBIC, expand=True) for a in (-0.7, 0, 0.7)]
    return _tcache[k]

def put(frame, spr, dx=0, dy=0, alpha=1.0):
    if alpha <= 0: return
    img = spr.img
    if alpha < 1:
        img = img.copy(); img.putalpha(img.getchannel('A').point(lambda v: int(v * alpha)))
    frame.alpha_composite(img, (int(spr.x + dx), int(spr.y + dy)))

def put_img(frame, img, cx, cy, scale=1.0, alpha=1.0, rot=0):
    if alpha <= 0 or scale <= 0.01: return
    if scale != 1: img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.BICUBIC)
    if rot: img = img.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        img = img.copy(); img.putalpha(img.getchannel('A').point(lambda v: int(v * alpha)))
    x, y = int(cx - img.width / 2), int(cy - img.height / 2)
    frame.alpha_composite(img, (x, y)) if x >= 0 and y >= 0 else frame.paste(img, (x, y), img)

def headline(frame, txt, t, t0, cy, size=110, color=PAPER, cx=CX, **kw):
    """Drop-in like a paper cut-out placed on the page, then boil at 12fps."""
    if t < t0: return
    k = clamp((t - t0) / 0.35)
    v = T(txt, size, color, **kw)
    boil = v[int(q12(t) * 12) % 3]
    put_img(frame, boil, cx, cy - 26 * (1 - ease_out(k)), 1.0 + 0.07 * (1 - back_out(k)), clamp(k * 2.2))

def gradient(top, bot):
    g = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    arr = (np.array(top, np.float32) * (1 - g) + np.array(bot, np.float32) * g)
    arr = np.repeat(arr, W, axis=1)
    return Image.fromarray(np.dstack([arr.astype(np.uint8), np.full((H, W, 1), 255, np.uint8)]), 'RGBA')

def stars(n, seed, ymax=1100):
    rnd = random.Random(seed)
    return [(rnd.randint(30, W - 30), rnd.randint(120, ymax), rnd.uniform(2.5, 5.5), rnd.random()) for _ in range(n)]

def draw_stars(frame, st, t):
    d = ImageDraw.Draw(frame)
    tick = int(q12(t) * 12)
    for x, y, r, ph in st:
        a = 0.55 + 0.45 * math.sin(tick * 0.9 + ph * 6.28)
        c = tuple(int(v * a + NAVY[i] * (1 - a)) for i, v in enumerate(CREAM))
        d.ellipse([x - r, y - r, x + r, y + r], fill=c + (255,))

# ------------------------------------------------------------ scene: mother's room
class Room:
    def __init__(self):
        self.bg = gradient(hx('1B2B50'), hx('2A3D66'))
        self.st = stars(14, 3, 640)
        self.win_frame = paper(rect(270, 250, 520, 470), CREAM, jit=2)
        self.win_in = paper(rect(300, 280, 460, 410), DEEP, sa=0, rim=False, jit=1)
        self.moon = paper(ell(640, 400, 70, 70), PAPER, shadow=(3, 4), blur=6)
        self.moon_cut = paper(ell(675, 382, 62, 62), DEEP, sa=0, rim=False, jit=1)
        self.mull_v = paper(rect(522, 280, 16, 410), CREAM, sa=60, jit=1)
        self.mull_h = paper(rect(300, 478, 460, 16), CREAM, sa=60, jit=1)
        self.photo = paper(rect(850, 330, 150, 190), BROWN, jit=2)
        self.photo_in = paper(rect(866, 346, 118, 158), SKY, sa=0, rim=False, jit=1)
        self.photo_man = paper([(925, 382), (952, 400), (957, 432), (945, 450), (980, 470), (982, 504), (868, 504), (870, 470), (905, 450), (893, 432), (898, 400)], NAVY, sa=40, jit=1.2)
        self.beam = Sprite(self._beam(), 0, 0)
        self.floor = paper([(0, 1430), (W, 1400), (W, H + 40), (0, H + 40)], hx('16223F'), shadow=(0, -6))
        self.rug = paper(ell(470, 1600, 400, 70), SAND2, shadow=(0, 6))
        self.bed_head = paper(rect(60, 980, 70, 470), BROWN, jit=2)
        self.bed = paper(rect(90, 1170, 880, 260), CREAM, jit=2.5)
        self.bed_leg = [paper(rect(110, 1420, 40, 60), BROWN2), paper(rect(910, 1420, 40, 60), BROWN2)]
        self.pillow = paper([(130, 1080), (360, 1070), (380, 1180), (140, 1190)], PAPER)
        self.hair = paper(ell(255, 1100, 82, 74), BROWN2)
        self.face = paper(ell(285, 1118, 54, 56, a0=-1.2, a1=1.9), hx('E7C9A9'), sa=50)
        self.blanket = paper([(250, 1150)] + [(300 + i * 70, 1140 - 26 * math.sin(i * 0.9)) for i in range(10)] + [(985, 1160), (985, 1440), (240, 1440)], SKY, jit=3)
        self.fold = paper([(250, 1150), (985, 1160), (985, 1215), (250, 1205)], lighten(SKY, .45), sa=60)
        self.stand = paper(rect(990, 1150, 110, 300), BROWN, jit=2)
        self.lamp_stem = paper(rect(1040, 1035, 12, 120), INK, sa=60, jit=0.8)
        self.lamp = paper([(990, 960), (1080, 960), (1105, 1040), (965, 1040)], GOLD, jit=2)
        self.lamp_glow = glow(1040, 1010, 420, GOLD, 120)
        self.phone = paper(rect(1003, 1128, 66, 24), INK, sa=60, jit=0.8)

    def _beam(self):
        m = Image.new('L', (W, H), 0)
        ImageDraw.Draw(m).polygon([(300, 300), (760, 300), (900, 1440), (120, 1440)], fill=34)
        m = m.filter(ImageFilter.GaussianBlur(30))
        img = Image.new('RGBA', (W, H), SKY + (0,)); img.putalpha(m); return img

    def draw(self, t, lamp=0.0, moon=1.0):
        f = self.bg.copy()
        for s in (self.win_frame, self.win_in): put(f, s)
        draw_stars(f, self.st, t)
        put(f, self.moon); put(f, self.moon_cut)
        put(f, self.mull_v); put(f, self.mull_h)
        for s in (self.photo, self.photo_in, self.photo_man): put(f, s)
        put(f, self.beam, alpha=moon)
        put(f, self.floor); put(f, self.rug)
        put(f, self.bed_head)
        for s in self.bed_leg: put(f, s)
        put(f, self.bed); put(f, self.pillow); put(f, self.hair); put(f, self.face)
        breathe = 3 * math.sin(q12(t) * 2.4)
        put(f, self.blanket, dy=breathe); put(f, self.fold, dy=breathe)
        put(f, self.stand); put(f, self.phone); put(f, self.lamp_stem); put(f, self.lamp)
        if lamp > 0: put(f, self.lamp_glow, alpha=lamp)
        return f

# ------------------------------------------------------------ scene: the thread between two homes
class Map:
    def __init__(self):
        self.bg = gradient(hx('0E1730'), hx('22355E'))
        self.st = stars(26, 5)
        self.sea = [paper([(0, 1300 + i * 70)] + [(x, 1290 + i * 70 + 14 * math.sin(x / 60 + i)) for x in range(0, W + 60, 60)] + [(W, H + 40), (0, H + 40)], c, shadow=(0, -5))
                    for i, c in enumerate([hx('2F4A7A'), hx('263E6A'), hx('1D3158')])]
        self.land_l = paper([(-20, 1290), (120, 1230), (300, 1250), (420, 1320), (420, H + 40), (-20, H + 40)], SAND2)
        self.house = paper([(150, 1250), (150, 1140), (230, 1070), (310, 1140), (310, 1250)], CREAM)
        self.roof = paper([(130, 1150), (230, 1055), (330, 1150)], BROWN)
        self.win = paper(rect(205, 1160, 50, 50), GOLD, sa=40)
        self.win_glow = glow(230, 1185, 120, GOLD, 90)
        self.land_r = paper([(600, 1330), (760, 1270), (1100, 1260), (1100, H + 40), (600, H + 40)], SAND)
        self.burj = paper(burj_pts(900, 1280, 700, 46), PAPER, jit=1.5)
        self.towers = [paper(rect(x, 1280 - h, w, h), c) for x, h, w, c in [(700, 260, 70, MID), (780, 340, 60, hx('3A5288')), (980, 300, 80, MID), (1040, 200, 70, hx('3A5288'))]]
        self.heart = text_sprite('♥', 40, GOLD, fam='thmanyahsans', wt='Bold', shadow=False)

    def draw(self, t):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        for s in self.towers: put(f, s)
        put(f, self.burj)
        put(f, self.land_r)
        put(f, self.land_l); put(f, self.house); put(f, self.roof); put(f, self.win_glow); put(f, self.win)
        for i, s in enumerate(self.sea): put(f, s, dx=10 * math.sin(q12(t) * 2 + i))
        p0, p1, c = (230, 1180), (880, 760), (520, 420)
        k = ease_io((t - 0.2) / 1.6)
        d = ImageDraw.Draw(f)
        n = int(60 * k)
        for i in range(0, n, 2):
            u = i / 60
            x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0]
            y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]
            d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=CREAM + (255,))
        if n > 2:
            u = n / 60
            x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0]
            y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]
            put_img(f, self.heart, x, y, 1 + 0.15 * math.sin(q12(t) * 9))
        return f

def burj_pts(cx, base, h, w):
    """Stepped, tapering tower in the Burj Khalifa spirit."""
    left, right = [], []
    steps = 9
    for i in range(steps + 1):
        y = base - h * (i / steps) ** 0.9
        hw = w * (1 - i / steps) ** 0.8 + 3
        left.append((cx - hw, y)); right.append((cx + hw * 0.8, y))
        if i < steps:
            yn = base - h * ((i + 1) / steps) ** 0.9
            left.append((cx - hw, yn)); right.append((cx + hw * 0.8, yn))
    spire = [(cx - 2, base - h - 120), (cx + 2, base - h - 120)]
    return left + spire + right[::-1]

# ------------------------------------------------------------ scene: Dubai at night
class Skyline:
    def __init__(self):
        self.bg = gradient(hx('0B1430'), hx('2A3D66'))
        self.st = stars(30, 9, 900)
        self.moon = paper(ell(190, 330, 60, 60), PAPER, shadow=(3, 4), blur=6)
        self.moon_cut = paper(ell(218, 314, 54, 54), hx('0F1A38'), sa=0, rim=False, jit=1)
        rnd = random.Random(2)
        self.back = [paper(rect(x, 1260 - h, rnd.randint(60, 110), h), hx('22365F'), sa=60) for x, h in [(rnd.randint(-40, W), rnd.randint(180, 420)) for _ in range(14)]]
        self.burj = paper(burj_pts(840, 1265, 560, 64), hx('DCE4EE'), jit=1.5)
        self.sail = paper([(150, 1265), (150, 960), (205, 960), (330, 1080), (360, 1265)], hx('C9D6E6'), jit=2)
        self.mid = []
        self.wins = []
        for x, h, w in [(20, 300, 110), (250, 380, 90), (390, 260, 120), (560, 330, 100), (900, 410, 110), (1000, 280, 100)]:
            self.mid.append(paper(rect(x, 1265 - h, w, h), MID, jit=2))
            for wy in range(1265 - h + 30, 1240, 46):
                for wx in range(x + 16, x + w - 20, 30):
                    self.wins.append((wx, wy, rnd.random()))
        self.water = paper([(-20, 1262), (W + 20, 1262), (W + 20, H + 40), (-20, H + 40)], hx('101B38'), shadow=(0, -6))
        self.refl = [(rnd.randint(0, W), rnd.randint(1300, 1700), rnd.randint(40, 140), rnd.choice([GOLD, CREAM, SKY])) for _ in range(40)]

    def draw(self, t, pan=0.0):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        put(f, self.moon, dx=-pan * .1); put(f, self.moon_cut, dx=-pan * .1)
        for s in self.back: put(f, s, dx=-pan * .3)
        put(f, self.sail, dx=-pan * .6); put(f, self.burj, dx=-pan * .6)
        for s in self.mid: put(f, s, dx=-pan)
        d = ImageDraw.Draw(f); tick = int(q12(t) * 12)
        for wx, wy, ph in self.wins:
            if math.sin(tick * 0.35 + ph * 40) > -0.2:
                d.rectangle([wx - pan, wy, wx - pan + 14, wy + 20], fill=GOLD + (255,))
        put(f, self.water)
        for x, y, w, c in self.refl:
            o = 8 * math.sin(tick * .8 + x)
            d.rectangle([x + o - pan * .5, y, x + o - pan * .5 + w, y + 5], fill=c + (150,))
        return f

# ------------------------------------------------------------ scene: phone, "وصلت البيت"
class Phone:
    def __init__(self):
        self.bg = gradient(hx('1B2B50'), hx('2A3D66'))
        self.body = paper(rect(240, 380, 520, 1060), INK, jit=1.5, shadow=(14, 18), blur=16)
        self.screen = paper(rect(264, 430, 472, 960), hx('EEF2F6'), sa=0, rim=False, jit=1)
        self.header = paper(rect(264, 430, 472, 120), CREAM, sa=40, rim=False, jit=1)
        self.avatar = paper(ell(660, 490, 36, 36), BROWN, sa=40)
        self.out = paper(rect(380, 900, 330, 110), SKY, jit=2)
        self.inc = paper(rect(290, 1060, 400, 110), PAPER, jit=2)
        self.t_name = text_sprite('ماما', 46, INK, fam='thmanyahsans', wt='Bold', shadow=False)
        self.t_out = text_sprite('وصلت البيت', 50, INK, fam='thmanyahsans', wt='Bold', shadow=False)
        self.t_in = text_sprite('الحمدلله، تصبح على خير', 40, INK, fam='thmanyahsans', wt='Medium', shadow=False)
        self.t_time = text_sprite('١١:٤٨ م', 30, darken(SKY, .5), fam='thmanyahsans', wt='Medium', shadow=False)

    def draw(self, t, tt):
        f = self.bg.copy()
        put(f, self.body); put(f, self.screen); put(f, self.header); put(f, self.avatar)
        put_img(f, self.t_name, 560, 490)
        k1 = clamp((tt - 0.4) / 0.25)
        if k1 > 0:
            s = 0.6 + 0.4 * back_out(k1)
            img = self.out.img.resize((int(self.out.img.width * s), int(self.out.img.height * s)))
            f.alpha_composite(img, (int(self.out.x + self.out.img.width * (1 - s)), int(self.out.y + self.out.img.height * (1 - s) / 2)))
            put_img(f, self.t_out, 545, 955, s, clamp(k1 * 2))
            c = SKY if tt > 1.2 else (150, 150, 150)
            d = ImageDraw.Draw(f)
            for o in (0, 14):
                d.line([(400 + o, 992), (408 + o, 1000), (422 + o, 982)], fill=darken(c, .35) + (255,), width=4)
            put_img(f, self.t_time, 470, 1030, 1, clamp(k1 * 2))
        k2 = clamp((tt - 1.5) / 0.25)
        if k2 > 0:
            s = 0.6 + 0.4 * back_out(k2)
            put(f, self.inc, alpha=clamp(k2 * 2))
            put_img(f, self.t_in, 490, 1115, s, clamp(k2 * 2))
        return f

# ------------------------------------------------------------ scene: 2am street
class Street:
    def __init__(self):
        self.bg = gradient(hx('0B1430'), hx('3B3F70'))
        self.st = stars(22, 11, 800)
        rnd = random.Random(5)
        self.far = [paper(rect(x, 1330 - h, rnd.randint(80, 140), h), hx('1E2E55'), sa=50) for x, h in [(i * 130 - 60, rnd.randint(200, 480)) for i in range(10)]]
        self.road = paper([(-20, 1330), (W + 20, 1330), (W + 20, H + 40), (-20, H + 40)], hx('141F3D'), shadow=(0, -6))
        self.walk = paper(rect(-20, 1330, W + 40, 60), hx('4A5478'), sa=60)
        self.lamp_pole = paper(rect(0, 820, 16, 520), NIGHT, sa=60, jit=1)
        self.lamp_arm = paper(rect(-50, 820, 66, 12), NIGHT, sa=40, jit=1)
        self.lamp_head = paper([(-70, 812), (-20, 812), (-30, 840), (-60, 840)], CREAM, jit=1)
        self.cone = self._cone()
        self.girl_rim = paper(self._girl(5), hx('F2C46B'), sa=0, rim=False, jit=1.2)
        self.girl = paper(self._girl(0), hx('101626'), shadow=(10, 6), blur=10, jit=1.2)
        self.bag = paper(rect(560, 1070, 40, 70), BROWN, sa=50, jit=1)
        self.clock = paper(ell(200, 360, 95, 95), CREAM)
        self.clock_in = paper(ell(200, 360, 80, 80), PAPER, sa=0, rim=False)

    def _cone(self):
        m = Image.new('L', (420, 620), 0)
        ImageDraw.Draw(m).polygon([(185, 0), (235, 0), (420, 620), (0, 620)], fill=70)
        m = m.filter(ImageFilter.GaussianBlur(24))
        img = Image.new('RGBA', m.size, GOLD + (0,)); img.putalpha(m); return img

    def _girl(self, g):
        cx, base = 520, 1350
        r = 40 + g
        head = ell(cx, base - 400, r, r * 1.12, n=24, a0=math.pi * 0.85, a1=math.pi * 2.15)
        return head + [(cx + 52 + g, base - 330), (cx + 78 + g, base - 300), (cx + 74 + g, base - 200),
                       (cx + 100 + g, base + g), (cx - 100 - g, base + g), (cx - 74 - g, base - 200),
                       (cx - 78 - g, base - 300), (cx - 52 - g, base - 330)]

    def draw(self, t, tt):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        scroll = 160 * tt
        for s in self.far: put(f, s, dx=(scroll * .25) % 130 - 65)
        put(f, self.road); put(f, self.walk)
        for i in range(-1, 4):
            x = (i * 420 + scroll) % (420 * 4) - 260
            f.alpha_composite(self.cone, (int(x - 255), 830)) if x - 255 >= 0 else f.paste(self.cone, (int(x - 255), 830), self.cone)
            for s in (self.lamp_pole, self.lamp_arm, self.lamp_head): put(f, s, dx=x)
        tick = int(q12(t) * 12)
        bob = -6 if tick % 3 == 0 else 0
        sway = (-3, 0, 3)[tick % 3]
        put(f, self.girl_rim, dx=sway, dy=bob); put(f, self.girl, dx=sway, dy=bob)
        put(f, self.clock); put(f, self.clock_in)
        d = ImageDraw.Draw(f)
        d.line([(200, 360), (200, 300)], fill=INK + (255,), width=7)                 # minute on 12
        d.line([(200, 360), (200 + 40 * math.cos(-math.pi / 6), 360 + 40 * math.sin(-math.pi / 6))], fill=INK + (255,), width=9)  # hour on 2
        d.ellipse([192, 352, 208, 368], fill=GOLD + (255,))
        return f

# ------------------------------------------------------------ scene: the bag in the mall (architect's arches)
class Mall:
    def __init__(self):
        self.bg = gradient(hx('E9DCC6'), hx('D9C6A6'))
        self.arches = []
        for i in range(5):
            x = 40 + i * 205
            pts = [(x, 1150), (x, 520)] + ell(x + 80, 520, 80, 90, a0=math.pi, a1=2 * math.pi)[1:-1] + [(x + 160, 520), (x + 160, 1150)]
            self.arches.append(paper(pts, SAND2, shadow=(-6, 8), sa=70))
            self.arches.append(paper([(p[0] + 18 if p[0] > x + 80 else p[0] + 18, p[1] + 22) for p in pts[:2]] + [(px, py + 22) for px, py in ell(x + 80, 520, 62, 70, a0=math.pi, a1=2 * math.pi)[1:-1]] + [(x + 142, 542), (x + 142, 1150)], hx('B8996F'), sa=0, rim=False, jit=1))
        self.floor = paper([(-20, 1150), (W + 20, 1150), (W + 20, H + 40), (-20, H + 40)], CREAM, shadow=(0, -8))
        self.tiles = []
        self.bench = paper(rect(220, 1180, 560, 46), BROWN, jit=1.5)
        self.bench2 = paper(rect(220, 1240, 560, 30), BROWN2, jit=1.5)
        self.legs = [paper(rect(250, 1270, 26, 110), INK, sa=50), paper(rect(720, 1270, 26, 110), INK, sa=50)]
        self.bag = paper([(440, 1180), (460, 1060), (620, 1060), (640, 1180)], hx('5A3420'), jit=1.5)
        self.flap = paper([(458, 1062), (622, 1062), (612, 1110), (468, 1110)], hx('7A4A2E'), sa=50, jit=1)
        self.clasp = paper(ell(540, 1108, 13, 13), GOLD, sa=40)
        self.handle = paper(ell(540, 1062, 70, 60, a0=math.pi, a1=2 * math.pi) + ell(540, 1062, 54, 46, a0=2 * math.pi, a1=math.pi), hx('5A3420'), sa=60, jit=1)
        self.clock = paper(ell(880, 330, 92, 92), PAPER)
        self.ghosts = [paper(ell(60, 700, 38, 40) + [(110, 790), (125, 1180), (-5, 1180), (10, 790)], c, sa=0, rim=False, alpha=95) for c in (SKY, GOLD, BROWN, NAVY, SKY)]

    def draw(self, t, tt):
        f = self.bg.copy()
        for s in self.arches: put(f, s)
        put(f, self.floor)
        d = ImageDraw.Draw(f)
        for i in range(-6, 12):
            d.line([(540 + i * 140, 1150), (540 + i * 330, H)], fill=SAND2 + (255,), width=3)
        for y in (1300, 1500, 1760):
            d.line([(0, y), (W, y)], fill=SAND2 + (255,), width=3)
        for i, g in enumerate(self.ghosts):                       # people rushing past = time passing
            x = ((tt * 900 + i * 410) % 1600) - 300
            put(f, g, dx=x if i % 2 else W - x - 120)
        for s in self.legs: put(f, s)
        put(f, self.bench2); put(f, self.bench)
        for s in (self.handle, self.bag, self.flap, self.clasp): put(f, s)
        put(f, self.clock)
        a = q12(tt) * 2 * math.pi * 1.6
        d.line([(880, 330), (880 + 70 * math.sin(a), 330 - 70 * math.cos(a))], fill=INK + (255,), width=6)
        d.line([(880, 330), (880 + 44 * math.sin(a / 12 + 1), 330 - 44 * math.cos(a / 12 + 1))], fill=INK + (255,), width=9)
        d.ellipse([872, 322, 888, 338], fill=GOLD + (255,))
        return f

# ------------------------------------------------------------ scene: Abu Dhabi pop-up book
class AbuDhabi:
    def __init__(self):
        self.bg = gradient(hx('0E1730'), hx('2A3D66'))
        self.st = stars(30, 13, 760)
        self.moon = paper(ell(900, 560, 66, 66), PAPER, shadow=(3, 4), blur=6)
        self.moon_cut = paper(ell(930, 542, 60, 60), hx('16234A'), sa=0, rim=False, jit=1)
        base = 1290
        parts = []
        parts.append(('base', [(120, base), (120, base - 150), (900, base - 150), (900, base)], hx('DCE4EE')))
        for cx, r, top in [(510, 150, base - 150), (300, 70, base - 150), (720, 70, base - 150), (190, 50, base - 150), (830, 50, base - 150)]:
            parts.append(('dome', ell(cx, top, r, r * 1.15, a0=math.pi, a1=2 * math.pi) + [(cx + r, top), (cx - r, top)], PAPER))
        for x in (95, 905):
            parts.append(('min', [(x - 16, base), (x - 16, base - 560), (x, base - 610), (x + 16, base - 560), (x + 16, base)], hx('EEF2F6')))
        for x in (250, 770):
            parts.append(('min', [(x - 13, base - 150), (x - 13, base - 520), (x, base - 560), (x + 13, base - 520), (x + 13, base - 150)], hx('EEF2F6')))
        self.parts = [(paper(p, c, jit=1.5), kind) for kind, p, c in parts]
        self.parts.sort(key=lambda s: {'min': 0, 'base': 2, 'dome': 1}[s[1]])
        self.dune = [paper([(-20, base + i * 40)] + [(x, base - 30 + i * 50 + 40 * math.sin(x / 260 + i * 2)) for x in range(0, W + 100, 100)] + [(W + 20, H + 40), (-20, H + 40)], c, shadow=(0, -6))
                     for i, c in enumerate([SAND, SAND2, hx('B39770')])]
        self.base_y = base

    def draw(self, t, tt):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        put(f, self.moon); put(f, self.moon_cut)
        for i, (s, kind) in enumerate(self.parts):
            k = back_out(clamp((q12(tt) - 0.1 - i * 0.07) / 0.35))
            if k <= 0: continue
            img = s.img
            hh = max(1, int(img.height * k))
            img = img.resize((img.width, hh), Image.BICUBIC)
            yb = s.y + s.img.height
            f.alpha_composite(img, (int(s.x), int(yb - hh)))
        for s in self.dune: put(f, s)
        return f

# ------------------------------------------------------------ scene: 200 nationalities holding hands, threads to homes
class People:
    def __init__(self):
        self.bg = gradient(hx('0E1730'), hx('2A3D66'))
        self.st = stars(20, 17, 600)
        self.ground = paper([(-20, 1330), (W + 20, 1300), (W + 20, H + 40), (-20, H + 40)], hx('16223F'), shadow=(0, -6))
        cols = [SKY, GOLD, BROWN, CREAM, hx('6E9C9F'), hx('C98B8B'), hx('8C9A6B'), SAND, hx('9C8CC0')]
        skins = [hx('E7C9A9'), hx('C99A6E'), hx('8D5B3A'), hx('F1D7BC'), hx('B07B52')]
        self.people = []
        for i, c in enumerate(cols):
            cx = 80 + i * 112; base = 1320
            body = paper([(cx - 46, base), (cx - 38, base - 170), (cx - 22, base - 196), (cx + 22, base - 196), (cx + 38, base - 170), (cx + 46, base)], c, jit=1.5)
            head = paper(ell(cx, base - 236, 34, 36), skins[i % 5], jit=1.2)
            self.people.append((cx, body, head))
        self.arms = [paper(rect(80 + i * 112 + 30, 1320 - 150, 52, 14), lighten(cols[i], .2), sa=50, jit=1) for i in range(len(cols) - 1)]
        self.houses = []
        for i in range(5):
            hx0 = 70 + i * 190; hy = 240 + (i % 2) * 70
            self.houses.append((paper([(hx0, hy + 120), (hx0, hy + 50), (hx0 + 60, hy), (hx0 + 120, hy + 50), (hx0 + 120, hy + 120)], CREAM, jit=1.5),
                                paper([(hx0 - 12, hy + 56), (hx0 + 60, hy - 8), (hx0 + 132, hy + 56)], BROWN, jit=1.2),
                                paper(rect(hx0 + 42, hy + 64, 36, 36), hx('2A3D66'), sa=0, rim=False, jit=0.8),
                                paper(rect(hx0 + 42, hy + 64, 36, 36), GOLD, sa=30, jit=0.8),
                                glow(hx0 + 60, hy + 82, 90, GOLD, 90), (hx0 + 60, hy + 120)))

    def draw(self, t, tt):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        put(f, self.ground)
        T0 = 3.2      # threads/homes start (25.8s)
        d = ImageDraw.Draw(f)
        if tt > T0:
            for i, h in enumerate(self.houses):
                k = clamp((tt - T0 - 0.1 * i) / 0.4)
                put(f, h[0], dy=-30 * (1 - ease_out(k)), alpha=k); put(f, h[1], dy=-30 * (1 - ease_out(k)), alpha=k)
                put(f, h[2], alpha=k)
                lit = clamp((tt - T0 - 1.4 - 0.25 * i) / 0.2)
                if lit > 0: put(f, h[4], alpha=lit); put(f, h[3], alpha=lit)
            for j, (cx, body, head) in enumerate(self.people):
                h = self.houses[min(4, j * 5 // len(self.people))]
                k = ease_io((q12(tt) - T0 - 0.3 - 0.06 * j) / 0.9)
                if k <= 0: continue
                x0, y0 = cx, 1320 - 276; x1, y1 = h[5]
                n = int(30 * k)
                for s in range(0, n, 2):
                    u = s / 30
                    x = x0 + (x1 - x0) * u + 40 * math.sin(u * 3.14) * (1 if j % 2 else -1)
                    y = y0 + (y1 - y0) * u
                    d.ellipse([x - 3.5, y - 3.5, x + 3.5, y + 3.5], fill=GOLD + (220,))
        for i, a in enumerate(self.arms):
            k = clamp((tt - 0.15 * (i + 1) - 0.1) / 0.2)
            if k > 0: put(f, a, alpha=k)
        for i, (cx, body, head) in enumerate(self.people):
            k = clamp((q12(tt) - 0.15 * i) / 0.3)
            if k <= 0: continue
            dy = -260 * (1 - back_out(k))
            put(f, body, dy=dy); put(f, head, dy=dy)
        return f

# ------------------------------------------------------------ scene: the camera is lifted away
class Cctv:
    def __init__(self, sky):
        self.sky = sky
        self.pole = paper(rect(-40, 300, 300, 20), NIGHT, sa=60, jit=1)
        self.body = paper([(210, 260), (430, 300), (420, 380), (200, 350)], hx('DCE4EE'), jit=1.5)
        self.lens = paper(ell(430, 340, 34, 34), INK, sa=50)
        self.string = None

    def draw(self, t, tt):
        f = self.sky.draw(t, pan=40 + 30 * tt)
        lift = -700 * ease_in((tt - 1.1) / 1.4)
        d = ImageDraw.Draw(f)
        if lift > -690:
            d.line([(320, 0), (320, 290 + lift)], fill=CREAM + (200,), width=3)
        for s in (self.pole, self.body, self.lens): put(f, s, dy=lift)
        if int(q12(t) * 12) % 6 < 3:
            d.ellipse([268, 286 + lift, 282, 300 + lift], fill=GOLD + (255,))
        return f

# ------------------------------------------------------------ scene: paper plane = Instagram send
class Plane:
    def __init__(self):
        self.bg = gradient(hx('0E1730'), hx('2A3D66'))
        self.st = stars(34, 21, 1700)
        pl = Image.new('RGBA', (260, 200), (0, 0, 0, 0))
        d = ImageDraw.Draw(pl)
        d.polygon([(10, 100), (250, 10), (110, 120)], fill=PAPER + (255,))
        d.polygon([(110, 120), (250, 10), (140, 190)], fill=hx('C9D6E6') + (255,))
        d.polygon([(110, 120), (140, 190), (120, 135)], fill=hx('9FB2CC') + (255,))
        sh = Image.new('RGBA', (300, 240), (0, 0, 0, 0))
        m = pl.getchannel('A').filter(ImageFilter.GaussianBlur(6)).point(lambda v: v * 0.5)
        blk = Image.new('RGBA', pl.size, (0, 0, 0, 255)); blk.putalpha(m)
        sh.alpha_composite(blk, (18, 22)); sh.alpha_composite(pl, (10, 10))
        self.plane = sh

    def path(self, u):
        p0, c, p1 = (940, 1560), (980, 520), (120, 380)
        x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0]
        y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]
        return x, y

    def draw(self, t, tt):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        u = ease_io(q12(tt) / 2.6)
        d = ImageDraw.Draw(f)
        for i in range(0, int(u * 80), 2):
            x, y = self.path(i / 80)
            d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=CREAM + (180,))
        x, y = self.path(u)
        x2, y2 = self.path(min(1, u + 0.01))
        ang = -math.degrees(math.atan2(y2 - y, x2 - x)) + 20
        put_img(f, self.plane, x, y, 1.0, 1.0, rot=ang)
        return f

# ------------------------------------------------------------ scene: white logo end card
class EndCard:
    def __init__(self):
        self.bg = gradient(hx('0B1430'), hx('1E2F55'))
        self.st = stars(40, 31, 1700)
        lg = Image.open(OUT + '/logo_white.png')
        sc = 470 / lg.width
        lg = lg.resize((470, int(lg.height * sc)), Image.LANCZOS)
        m = lg.getchannel('A').filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v * .6))
        pad = 40
        self.logo = Image.new('RGBA', (lg.width + pad * 2, lg.height + pad * 2), (0, 0, 0, 0))
        blk = Image.new('RGBA', lg.size, (0, 0, 0, 255)); blk.putalpha(m)
        self.logo.alpha_composite(blk, (pad + 6, pad + 9)); self.logo.alpha_composite(lg, (pad, pad))

    def draw(self, t, tt):
        f = self.bg.copy(); draw_stars(f, self.st, t)
        k = clamp(tt / 0.4)
        put_img(f, self.logo, CX, 860 - 20 * (1 - ease_out(k)), 1 + 0.06 * (1 - back_out(k)), clamp(k * 2))
        return f

# ------------------------------------------------------------ timeline
LINES = [
    (0.0, 2.4, 'في أم الحين نايمة مرتاحة.'),
    (2.4, 4.8, 'وولدها بعيد عنها آلاف الكيلومترات.'),
    (4.8, 7.6, 'تدرون ليش مرتاحة؟ لأنه في الإمارات.'),
    (7.6, 11.7, 'كل أم ما تنام إلا لما تسمع: "وصلت البيت".'),
    (11.7, 15.0, 'بس هني، البنت ترجع الفجر من دوامها،'),
    (15.0, 16.1, 'وتمشي عادي.'),
    (16.1, 18.9, 'تنسى شنطتك فالمول، وترجع تلقاها مكانها.'),
    (18.9, 22.6, 'أبوظبي، سنوات ورا بعض، أأمن مدينة في العالم.'),
    (22.6, 25.8, 'وأكثر من ميتين جنسية عايشين ويا بعض.'),
    (25.8, 29.9, 'كل واحد فيهم، له أم تدعي له من بعيد.'),
    (29.9, 32.8, 'الأمان هني مب بس شرطة وكاميرات.'),
    (32.8, 35.1, 'الأمان... إن أمك تنام.'),
    (35.1, 38.7, 'طرشوا هالفيديو لأمكم، أو لحد أهله بعيدين عنه.'),
    (38.7, 40.3, 'اللهم احفظ الإمارات.'),
    (40.3, 42.7, 'وكل أم نايمة مرتاحة الليلة.'),
]
CUTS = [2.4, 4.8, 7.6, 9.6, 11.7, 16.1, 18.9, 22.6, 29.9, 32.8, 35.1, 38.7, 40.3]
WIPE = 0.32

room = map_ = sky = phone = street = mall = ad = people = cctv = plane = endc = None
def init():
    global room, map_, sky, phone, street, mall, ad, people, cctv, plane, endc
    room, map_, sky, phone = Room(), Map(), Skyline(), Phone()
    street, mall, ad, people = Street(), Mall(), AbuDhabi(), People()
    cctv, plane, endc = Cctv(sky), Plane(), EndCard()

def camera(img, z, fx=CX, fy=H / 2):
    if abs(z - 1) < 1e-3: return img
    w, h = W / z, H / z
    x0 = clamp(fx - w / 2, 0, W - w); y0 = clamp(fy - h / 2, 0, H - h)
    return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))

def scene_at(t):
    """Art + headline cards for time t (no subtitles, no transition)."""
    if t < 2.4:
        f = camera(room.draw(t), 1 + 0.05 * ease_io(t / 2.4), 470, 1100)
        headline(f, 'أمك نايمة مرتاحة؟', t, -1, 820, 118)
    elif t < 4.8:
        tt = t - 2.4; f = map_.draw(tt)
        headline(f, 'آلاف الكيلومترات', t, 2.5, 470, 104)
    elif t < 7.6:
        tt = t - 4.8; f = sky.draw(t, pan=tt * 30)
        if t < 6.3: headline(f, 'ليش مرتاحة؟', t, 4.9, 480, 120)
        else: headline(f, 'لأنه في الإمارات', t, 6.3, 480, 112, GOLD)
    elif t < 9.6:
        f = phone.draw(t, t - 7.6)
    elif t < 11.7:
        tt = t - 9.6
        lamp = 1.0 if tt < 0.35 else 0.0
        f = camera(room.draw(t, lamp=lamp, moon=0.6 if lamp else 1.0), 1.04 - 0.02 * tt / 2.1, 470, 1100)
    elif t < 16.1:
        tt = t - 11.7; f = street.draw(t, tt)
        if t < 15.0: headline(f, '٢:٠٠ الفجر', t, 11.8, 620, 120, GOLD)
        else: headline(f, 'وتمشي عادي', t, 15.0, 620, 120)
    elif t < 18.9:
        tt = t - 16.1; f = mall.draw(t, tt)
        headline(f, 'شنطتك… مكانها', t, 16.2, 330, 100, INK, cx=420)
    elif t < 22.6:
        tt = t - 18.9; f = ad.draw(t, tt)
        headline(f, 'أبوظبي', t, 19.0, 300, 64, GOLD, fam='thmanyahsans', wt='Bold')
        headline(f, 'أأمن مدينة في العالم', t, 19.25, 420, 92)
        if t > 20.4:     # the stamp
            k = clamp((t - 20.4) / 0.18)
            s = 1.9 - 0.9 * ease_out(k)
            stamp = T('#١', 120, NAVY, fam='thmanyahserifdisplay', wt='Black', shadow=False)[1]
            disc = _disc()
            put_img(f, disc, CX, 620, s, clamp(k * 3), rot=-8)
            put_img(f, stamp, CX, 612, s, clamp(k * 3), rot=-8)
            if k < 1: f = camera(f, 1.012, CX, 620)
    elif t < 29.9:
        tt = t - 22.6; f = people.draw(t, tt)
        if t < 25.8: headline(f, '+٢٠٠ جنسية', t, 22.7, 560, 124, GOLD)
        else: headline(f, 'له أم تدعي له من بعيد', t, 25.9, 640, 92)
    elif t < 32.8:
        tt = t - 29.9; f = cctv.draw(t, tt)
        headline(f, 'مب بس شرطة وكاميرات', t, 30.0, 640, 92)
    elif t < 35.1:
        tt = t - 32.8
        f = camera(room.draw(t, moon=1.0), 1.0 + 0.08 * ease_io(tt / 2.3), 300, 1250)
        headline(f, 'الأمان…', t, 32.9, 830, 124)
        headline(f, 'إن أمك تنام', t, 33.55, 980, 124, GOLD)
    elif t < 38.7:
        tt = t - 35.1; f = plane.draw(t, tt)
        headline(f, 'طرشوه لأمك', t, 35.3, 820, 124)
        headline(f, 'أو لحد أهله بعيدين عنه', t, 36.4, 960, 56, CREAM, fam='thmanyahsans', wt='Medium')
    elif t < 40.3:
        tt = t - 38.7; f = endc.draw(t, tt)
        headline(f, 'اللهم احفظ الإمارات', t, 38.95, 1160, 72, CREAM, fam='thmanyahserifdisplay', wt='Bold')
    else:
        tt = t - 40.3
        f = camera(room.draw(t), 1.05 - 0.05 * ease_io(tt / 2.4), 470, 1100)    # lands on frame 1 framing: loop
        headline(f, 'وكل أم نايمة', t, 40.4, 820, 110)
        headline(f, 'مرتاحة الليلة', t, 40.9, 960, 110, GOLD)
    return f

_d = [None]
def _disc():
    if _d[0] is None:
        img = Image.new('RGBA', (300, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        pts = [(150 + (130 if i % 2 else 118) * math.cos(i * math.pi / 18), 150 + (130 if i % 2 else 118) * math.sin(i * math.pi / 18)) for i in range(36)]
        sh = Image.new('L', (300, 300), 0); ImageDraw.Draw(sh).polygon([(x + 6, y + 8) for x, y in pts], fill=120)
        blk = Image.new('RGBA', (300, 300), (0, 0, 0, 255)); blk.putalpha(sh.filter(ImageFilter.GaussianBlur(8)))
        img.alpha_composite(blk); d.polygon(pts, fill=GOLD + (255,))
        d.ellipse([40, 40, 260, 260], outline=darken(GOLD, .25) + (255,), width=5)
        _d[0] = img
    return _d[0]

_tear = None
def tear_edge():
    global _tear
    if _tear is None:
        rnd = random.Random(99); xs = []; x = 0
        for y in range(H):
            x += rnd.uniform(-2.2, 2.2); x *= 0.97; xs.append(x)
        _tear = np.array(xs, np.float32)
    return _tear

def wipe(a, b, k):
    """Torn-paper wipe, right to left, with a paper strip riding the edge."""
    edge = W + 80 - (W + 160) * ease_io(k)
    xs = edge + tear_edge() * 6
    cols = np.arange(W, dtype=np.float32)[None, :]
    m = (cols >= xs[:, None]).astype(np.uint8) * 255
    strip = ((cols >= xs[:, None] - 26) & (cols < xs[:, None])).astype(np.uint8) * 255
    sh = ((cols >= xs[:, None] - 60) & (cols < xs[:, None] - 26)).astype(np.float32)
    out = Image.composite(b, a, Image.fromarray(m, 'L'))
    arr = np.asarray(out).astype(np.float32)
    arr[..., :3] *= (1 - 0.35 * sh[..., None])
    s = strip.astype(bool)
    arr[s, :3] = np.array(CREAM, np.float32)
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')

def subtitle(f, t):
    for a, b, txt in LINES:
        if a <= t < b:
            img = T(txt, 46, PAPER, fam='thmanyahsans', wt='Bold', maxw=800)[1]
            k = clamp((t - a) / 0.18)
            bx = Image.new('RGBA', (img.width - 30, img.height - 46), (11, 18, 38, 150))
            put_img(f, bx, CX, 1352, 1, k)
            put_img(f, img, CX, 1350, 1, k)
            return

_grain = None
def finish(f, t):
    global _grain
    if _grain is None:
        rnd = np.random.default_rng(1)
        _grain = [rnd.normal(0, 7, (H, W, 1)).astype(np.float32) for _ in range(4)]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
        _grain.append((1 - 0.45 * np.clip(d - 0.25, 0, 1) ** 1.4)[..., None])
    arr = np.asarray(f.convert('RGB')).astype(np.float32)
    arr = arr * _grain[4] + _grain[int(q12(t) * 12) % 4]
    return np.clip(arr, 0, 255).astype(np.uint8)

def frame_at(t):
    f = None
    for c in CUTS:
        if c <= t < c + WIPE and c != 9.6:
            k = (t - c) / WIPE
            f = wipe(scene_at(c - 1e-3), scene_at(t), k)
            break
    if f is None: f = scene_at(t)
    subtitle(f, t)
    return finish(f, t)

if __name__ == '__main__':
    init()
    args = sys.argv[2:]
    if args and args[0] == '--still':
        for s in args[1:]:
            Image.fromarray(frame_at(float(s))).save(f'{OUT}/still_{float(s):05.2f}.png')
    else:
        i, n = (int(args[1]), int(args[2])) if args and args[0] == '--part' else (0, 1)
        total = int(round(DUR * FPS))
        lo, hi = total * i // n, total * (i + 1) // n
        sys.stdout.buffer.flush()
        out = sys.stdout.buffer
        for fr in range(lo, hi):
            out.write(frame_at(fr / FPS).tobytes())
