"""غريب عجيب · العدد ٠١ — editorial paper motion, synced to timing.json.

usage: python3 render.py <root> [--still t ...] [--part i n]
"""
import sys, math, random, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

R = sys.argv[1]
F = R + '/fonts/thmanyah typeface/'
O = R + '/ep01/'
W, H, FPS = 1080, 1920, 30
CX = W // 2
TIM = json.load(open(R + '/tts/timing.json', encoding='utf-8'))
DUR = round(TIM[-1][1] + 2.0, 2)

PAPER = (241, 236, 226); PAPER2 = (232, 225, 212); WHITE = (250, 248, 243)
INK = (20, 20, 20); GREY = (138, 133, 124); GOLD = (186, 146, 84); DARK = (28, 27, 25)

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def eo(x): x = clamp(x); return 1 - (1 - x) ** 3
def eio(x): x = clamp(x); return 3 * x * x - 2 * x ** 3
def bo(x):
    x = clamp(x); c = 1.6
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def q12(t): return math.floor(t * 12) / 12
def L(i): return TIM[i][0]          # line start
def E(i): return TIM[i][1]          # line end

_fc = {}
def fnt(fam, wt, s):
    k = (fam, wt, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(f'{F}{fam}/otf/{fam}-{wt}.otf', s)
    return _fc[k]
SD, SS = 'thmanyahserifdisplay', 'thmanyahsans'

# ------------------------------------------------------------------ base layers
def paper_bg(color, seed):
    rnd = np.random.default_rng(seed)
    a = np.full((H, W, 3), color, np.float32)
    fib = Image.effect_noise((W // 4, H // 4), 60).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2))
    a *= (0.97 + 0.03 * np.asarray(fib, np.float32)[..., None] / 255)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
BG = None; BG_DARK = None

_tc = {}
def txt(s, fam, wt, size, color=INK, shadow=False):
    k = (s, fam, wt, size, color, shadow)
    if k in _tc: return _tc[k]
    f = fnt(fam, wt, size)
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    l, t, r, b = d.textbbox((0, 0), s, font=f, direction='rtl', language='ar')
    pad = 30
    im = Image.new('RGBA', (r - l + pad * 2, b - t + pad * 2), (0, 0, 0, 0))
    if shadow:
        m = Image.new('L', im.size, 0)
        ImageDraw.Draw(m).text((pad - l + 4, pad - t + 6), s, font=f, fill=110, direction='rtl', language='ar')
        sh = Image.new('RGBA', im.size, (0, 0, 0, 255)); sh.putalpha(m.filter(ImageFilter.GaussianBlur(6))); im.alpha_composite(sh)
    ImageDraw.Draw(im).text((pad - l, pad - t), s, font=f, fill=color, direction='rtl', language='ar')
    _tc[k] = im
    return im

def put(fr, im, cx, cy, s=1.0, a=1.0, rot=0.0):
    if a <= 0.01 or s <= 0.01: return
    if s != 1: im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BICUBIC)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if a < 1:
        im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a)))
    fr.paste(im, (int(cx - im.width / 2), int(cy - im.height / 2)), im)

def with_shadow(layer, off=(10, 16), blur=16, alpha=0.32):
    pad = blur * 2 + max(off)
    out = Image.new('RGBA', (layer.width + pad * 2, layer.height + pad * 2), (0, 0, 0, 0))
    m = layer.getchannel('A').filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha))
    sh = Image.new('RGBA', layer.size, (0, 0, 0, 255)); sh.putalpha(m)
    out.alpha_composite(sh, (pad + off[0], pad + off[1])); out.alpha_composite(layer, (pad, pad))
    return out

def torn(w, h, color, seed, j=7):
    rnd = random.Random(seed); pts = []
    for x in range(0, w + 1, 12): pts.append((x, rnd.uniform(0, j)))
    for y in range(0, h + 1, 12): pts.append((w - rnd.uniform(0, j), y))
    for x in range(w, -1, -12): pts.append((x, h - rnd.uniform(0, j)))
    for y in range(h, -1, -12): pts.append((rnd.uniform(0, j), y))
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).polygon(pts, fill=color); return im

def headline(fr, s, t, t0, cy, size, color=INK, fam=SD, wt='Black', cx=CX, dur=0.35):
    """Type set like a print block: rises 24px and settles. No bounce, no flash."""
    if t < t0: return
    k = eo((t - t0) / dur)
    put(fr, txt(s, fam, wt, size, color), cx, cy + 24 * (1 - k), 1, k)

# ------------------------------------------------------------------ objects
def make_plate(letter='P', num='7', city='دبي', w=760, h=170):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], 22, fill=(252, 252, 250), outline=INK, width=6)
    d.rounded_rectangle([14, 14, w - 15, h - 15], 14, outline=(205, 205, 205), width=2)
    d.text((80, h // 2), letter, font=fnt(SS, 'Bold', 88), fill=INK, anchor='mm')
    d.text((w // 2 + 40, h // 2 + 6), num, font=fnt(SS, 'Black', 150), fill=INK, anchor='mm')
    d.text((w - 72, h // 2), city, font=fnt(SS, 'Bold', 40), fill=INK, anchor='mm', direction='rtl', language='ar')
    return with_shadow(im)

def make_stamp(lines, size=300, color=GOLD):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    c = size // 2
    d.ellipse([8, 8, size - 8, size - 8], outline=color, width=8)
    d.ellipse([28, 28, size - 28, size - 28], outline=color, width=3)
    y = c - (len(lines) - 1) * 26
    for s, sz in lines:
        d.text((c, y), s, font=fnt(SS, 'Bold', sz), fill=color, anchor='mm', direction='rtl', language='ar'); y += 52
    rnd = np.random.default_rng(5)   # worn ink
    a = np.asarray(im).copy(); mask = rnd.random(a.shape[:2]) < 0.18
    a[mask, 3] = (a[mask, 3] * 0.35).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')

def make_head():
    im = Image.new('RGBA', (420, 520), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([110, 40, 310, 270], fill=DARK)
    d.polygon([(30, 520), (60, 360), (150, 290), (270, 290), (360, 360), (390, 520)], fill=DARK)
    d.text((210, 165), '؟', font=fnt(SD, 'Black', 170), fill=PAPER, anchor='mm')
    return with_shadow(im, (8, 14), 14, .28)

def make_paddle(n='٧'):
    im = Image.new('RGBA', (240, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([108, 200, 132, 420], fill=(120, 90, 60))
    d.ellipse([10, 0, 230, 230], fill=WHITE, outline=INK, width=5)
    d.text((120, 112), n, font=fnt(SD, 'Black', 140), fill=INK, anchor='mm')
    return with_shadow(im, (8, 12), 12, .3)

def make_receipt():
    w, h = 640, 1120
    im = torn(w, h, WHITE, 77, j=6); d = ImageDraw.Draw(im)
    rows = [('إيصال', SD, 'Black', 64, INK, 'c'), ('مزاد أرقام مميزة · دبي', SS, 'Medium', 30, GREY, 'c'), ('---', 0, 0, 0, 0, 0),
            ('اللوحة', 'P 7'), ('المشتري', 'مجهول'), ('المبلغ', '٥٥ مليون درهم'), ('---', 0, 0, 0, 0, 0),
            ('المستفيد', 'حملة مليار وجبة'), ('---', 0, 0, 0, 0, 0), ('ربح أحد', '٠ درهم')]
    ys = []; y = 90
    for r in rows:
        ys.append(y)
        if r[0] == '---':
            for x in range(50, w - 50, 22): d.line([(x, y), (x + 11, y)], fill=GREY, width=3)
            y += 70; continue
        if len(r) == 6:
            d.text((w // 2, y), r[0], font=fnt(r[1], r[2], r[3]), fill=r[4], anchor='mm', direction='rtl', language='ar'); y += 80 if r[3] > 40 else 60; continue
        k, v = r
        last = k == 'ربح أحد'
        d.text((w - 60, y), k, font=fnt(SS, 'Medium', 34), fill=GREY, anchor='rm', direction='rtl', language='ar')
        d.text((60, y), v, font=fnt(SD if last else SS, 'Black' if last else 'Bold', 60 if last else 38), fill=GOLD if last else INK, anchor='lm', direction='rtl', language='ar')
        y += 110 if last else 86
    return im, ys

def make_dish():
    s = 360; im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([10, 10, s - 10, s - 10], fill=WHITE, outline=INK, width=5)
    d.ellipse([60, 60, s - 60, s - 60], outline=(200, 196, 186), width=3)
    d.ellipse([95, 95, s - 95, s - 95], fill=GOLD)
    return with_shadow(im, (8, 14), 14, .28)

OBJ = {}
def init():
    global BG, BG_DARK
    BG = paper_bg(PAPER, 2); BG_DARK = paper_bg(DARK, 3)
    OBJ['plate'] = make_plate()
    OBJ['plate_ad'] = make_plate('', '1', 'أبوظبي', 620, 150)
    OBJ['stamp'] = make_stamp([('رقم قياسي', 40), ('عالمي', 48), ('٢٠٢٣', 34)])
    OBJ['head'] = make_head()
    OBJ['paddle'] = make_paddle()
    rc, ys = make_receipt(); k = 0.84
    OBJ['receipt'] = rc.resize((int(rc.width * k), int(rc.height * k)), Image.LANCZOS); OBJ['rys'] = [int(y * k) for y in ys]
    OBJ['dish'] = make_dish()
    OBJ['card'] = with_shadow(torn(840, 600, WHITE, 9))
    lg = Image.open(R + '/reel/logo_white.png'); a = lg.getchannel('A')
    ink = Image.new('RGBA', lg.size, INK + (255,)); ink.putalpha(a)
    OBJ['logo'] = ink.resize((150, int(lg.height * 150 / lg.width)), Image.LANCZOS)

def masthead(fr, a=1.0, dark=False):
    c = PAPER if dark else INK
    d = ImageDraw.Draw(fr)
    d.line([(120, 250), (960, 250)], fill=c + (int(255 * a),), width=3)
    put(fr, txt('غريب عجيب', SD, 'Black', 42, c), 860, 214, 1, a)
    put(fr, txt('العدد ٠١', SS, 'Medium', 30, GREY), 210, 214, 1, a)

def camera(img, z, fy=H / 2):
    if abs(z - 1) < 1e-3: return img
    w, h = W / z, H / z
    x0 = (W - w) / 2; y0 = clamp(fy - h / 2, 0, H - h)
    return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))

def boil(t, amp=1.2):
    k = int(q12(t) * 12); r = random.Random(k)
    return r.uniform(-amp, amp), r.uniform(-amp, amp), r.uniform(-0.5, 0.5)

# ------------------------------------------------------------------ scenes
def scene(t):
    dark = L(8) <= t < L(12)
    fr = (BG_DARK if dark else BG).copy()
    d = ImageDraw.Draw(fr)
    bx, by, br = boil(t)

    if t < L(1):                                               # 1 hook
        masthead(fr)
        headline(fr, 'هذا الرقم', t, -1, 470, 72, GREY, wt='Medium')
        k = eo((t + 0.25) / 0.4)
        put(fr, OBJ['plate'], CX + bx, 660 - 40 * (1 - k) + by, 1, k, -4 + br)
        ks = clamp((t - 0.9) / 0.16)
        if ks > 0:
            put(fr, txt('٥٥', SD, 'Black', 330), CX, 1010, 1.5 - 0.5 * eo(ks), clamp(ks * 3))
        headline(fr, 'مليون درهم', t, 1.2, 1225, 96, wt='Bold')
        if t > 1.5:
            ww = int(120 * eo((t - 1.5) / 0.4)); d.line([(CX - ww // 2, 1310), (CX + ww // 2, 1310)], fill=GOLD, width=6)
        out = camera(fr, 1 + 0.025 * t / 4, 900)
        if 0.9 < t < 1.06: out = camera(out, 1.015)
        return out

    if t < L(2):                                               # 2 مب سيارة. مب بيت. رقم.
        masthead(fr)
        tt = t - L(1); words = [('مب سيارة', 0.0, 640), ('مب بيت', 0.5, 860), ('رقم.', 1.05, 1120)]
        for i, (w_, t0, y) in enumerate(words):
            if tt < t0: continue
            big = i == 2
            headline(fr, w_, tt, t0, y, 170 if big else 110, GOLD if big else INK)
            if not big and tt > t0 + 0.3:
                im = txt(w_, SD, 'Black', 110); ww = int((im.width - 50) * eo((tt - t0 - 0.3) / 0.2))
                d.line([(CX + (im.width - 50) // 2 - ww, y + 6), (CX + (im.width - 50) // 2, y + 6)], fill=INK, width=8)
        return camera(fr, 1 + 0.02 * tt)

    if t < L(3):                                               # 3 لوحة دبي P 7
        masthead(fr)
        tt = t - L(2)
        put(fr, OBJ['plate'], CX + bx, 760 + by, 1.12 + 0.05 * tt, 1, -4 + br)
        k = eo((tt - 0.3) / 0.4)
        put(fr, txt('دبي · أبريل ٢٠٢٣', SS, 'Bold', 44, INK), CX, 1060 + 20 * (1 - k), 1, k)
        put(fr, txt('مزاد «أرقام مميزة»', SS, 'Medium', 40, GREY), CX, 1130 + 20 * (1 - k), 1, k)
        return fr

    if t < L(6):                                               # 4–6 the auction counter
        masthead(fr)
        marks = [(L(3), 0), (L(3) + 1.2, 15), (L(4) + 0.15, 30), (L(4) + 0.85, 35), (L(5) + 0.45, 55)]
        val = 0; tchg = L(3)
        for tm, v in marks:
            if t >= tm: val, tchg = v, tm
        stop = L(4) + 1.45 <= t < L(5) + 0.45
        gold = val == 55
        num = txt({0: '٠', 15: '١٥', 30: '٣٠', 35: '٣٥', 55: '٥٥'}[val], SD, 'Black', 360, GOLD if gold else INK)
        k = clamp((t - tchg) / 0.14)
        shake = (random.Random(int(t * 30)).uniform(-5, 5) if stop else 0)
        if val: put(fr, num, CX + shake, 820, (1.35 - 0.35 * eo(k)) if gold else (1.08 - 0.08 * eo(k)), clamp(k * 3))
        else: headline(fr, 'المزاد بدأ…', t, L(3), 820, 110, GREY, wt='Medium')
        put(fr, txt('مليون درهم', SD, 'Bold', 80, GREY), CX, 1070)
        if stop:
            put(fr, txt('… ووقف', SD, 'Medium', 64, GREY), CX, 520, 1, clamp((t - L(4) - 1.45) / 0.2))
        if gold:
            kp = eo((t - tchg) / 0.35)
            put(fr, OBJ['paddle'], CX + 300 + bx, 1300 - 120 * kp + by, 0.8, kp, 8 + br)
        out = camera(fr, 1 + 0.02 * (t - L(3)) / 6, 820)
        if gold and t - tchg < 0.15: out = camera(out, 1.02, 820)
        return out

    if t < L(7):                                               # 7 the anonymous buyer
        masthead(fr)
        tt = t - L(6)
        k = eo(tt / 0.5)
        put(fr, OBJ['head'], CX + bx, 860 + 60 * (1 - k) + by, 1, k, br)
        headline(fr, 'المشتري: مجهول', tt, 0.6, 1240, 92)
        return camera(fr, 1 + 0.02 * tt, 900)

    if t < L(8):                                               # 8 world record
        masthead(fr)
        tt = t - L(7)
        put(fr, OBJ['plate'], CX + bx, 720 + by, 1, 1, -4 + br)
        ks = clamp((tt - 0.6) / 0.15)
        if ks > 0: put(fr, OBJ['stamp'], CX + 210, 640, 1.6 - 0.6 * eo(ks), clamp(ks * 3), -12)
        headline(fr, 'أغلى لوحة سيارة في العالم', tt, 0.2, 1010, 78)
        if tt > 1.4:
            k = eo((tt - 1.4) / 0.4)
            put(fr, txt('الرقم القياسي السابق: لوحة أبوظبي «١» · ٢٠٠٨', SS, 'Medium', 34, GREY), CX, 1110, 1, k)
        out = camera(fr, 1 + 0.015 * tt, 800)
        if 0 < tt - 0.6 < 0.12: out = camera(out, 1.02, 640)
        return out

    if t < L(9):                                               # 9 the turn
        tt = t - L(8)
        masthead(fr, dark=True)
        headline(fr, 'بس الغريب العجيب', tt, 0.1, 860, 104, PAPER)
        headline(fr, 'مب هني.', tt, 0.9, 1010, 130, GOLD)
        return camera(fr, 1 + 0.03 * tt)

    if t < L(11):                                              # 10–11 the receipt
        tt = t - L(9)
        masthead(fr, dark=True)
        rc = OBJ['receipt']; ys = OBJ['rys']
        rise = eo(tt / 0.6)
        top = int(1920 - (1920 - 300) * rise)
        nrows = sum(1 for i, y in enumerate(ys) if tt > 0.35 + i * 0.2)
        cut = ys[nrows - 1] + 50 if nrows else 0
        if t >= L(10): cut = rc.height
        vis = rc.crop((0, 0, rc.width, max(1, min(rc.height, cut))))
        sh = with_shadow(vis, (10, 18), 18, .45)
        fr.paste(sh, (CX - sh.width // 2 + int(bx), top - 52 + int(by)), sh)
        if t >= L(10) + 0.6:      # circle the zero like an editor's pen
            k = eo((t - L(10) - 0.6) / 0.5)
            x0 = CX - rc.width // 2 + 36; y0 = top + ys[-1] - 50
            ImageDraw.Draw(fr).arc([x0, y0, x0 + 270, y0 + 100], 200, 200 + 340 * k, fill=GOLD, width=5)
        return camera(fr, 1 + 0.02 * tt, 900)

    if t < L(12):                                              # 12 plate becomes a meal
        tt = t - L(11)
        masthead(fr, dark=True)
        k = eio((tt - 0.6) / 0.8)
        put(fr, OBJ['plate'], CX - 900 * k + bx, 800 + by, 0.8, 1 - k * 0.3, -4)
        put(fr, OBJ['dish'], CX + 900 * (1 - k) + bx, 800 + by, 1, 1, br + 120 * (1 - k))
        headline(fr, 'رقم على سيارة', tt, 0.0, 480, 72, GREY, wt='Medium')
        headline(fr, 'صار أكل', tt, 1.5, 1130, 130, PAPER)
        return camera(fr, 1 + 0.02 * tt, 900)

    if t < L(13):                                              # 13 the question
        masthead(fr)
        tt = t - L(12)
        k = eo(tt / 0.45)
        put(fr, OBJ['card'], CX + bx, 830 + 50 * (1 - k) + by, 1, k, br)
        headline(fr, 'لو معك', tt, 0.25, 700, 80, GREY, wt='Medium')
        headline(fr, '٥٥ مليون', tt, 0.6, 840, 150)
        headline(fr, 'تشتري رقم؟', tt, 1.6, 1000, 110, GOLD)
        headline(fr, 'قولولي في التعليقات', tt, 2.6, 1240, 46, INK, fam=SS, wt='Bold')
        return camera(fr, 1 + 0.015 * tt, 850)

    tt = t - L(13)                                             # 14 sign-off
    masthead(fr)
    headline(fr, 'غريب…', tt, 0.0, 820, 150)
    headline(fr, 'عجيب.', tt, 0.5, 990, 150, GOLD)
    put(fr, OBJ['logo'], CX, 1270, 1, eo((tt - 0.9) / 0.5))
    return camera(fr, 1 + 0.01 * tt)

# ------------------------------------------------------------------ captions + finish
def caption(fr, t):
    for i, (a, b, s) in enumerate(TIM):
        if a <= t < b + 0.15:
            dark = L(8) <= t < L(12)
            im = txt(s.replace('...', '…'), SS, 'Bold', 44, PAPER if dark else INK)
            if im.width > 960: im = im.resize((960, int(im.height * 960 / im.width)), Image.BICUBIC)
            put(fr, im, CX, 1395, 1, clamp((t - a) / 0.12))
            return

_g = None
def finish(fr, t):
    global _g
    if _g is None:
        rnd = np.random.default_rng(1)
        _g = [rnd.normal(0, 4.5, (H, W, 1)).astype(np.float32) for _ in range(3)]
    a = np.asarray(fr.convert('RGB')).astype(np.float32) + _g[int(q12(t) * 12) % 3]
    return np.clip(a, 0, 255).astype(np.uint8)

CUT_TEAR = L(8)
def frame_at(t):
    if CUT_TEAR - 0.05 <= t < CUT_TEAR + 0.3:      # torn-paper reveal into the dark spread
        k = eio((t - CUT_TEAR + 0.05) / 0.35)
        a, b = scene(CUT_TEAR - 0.06), scene(t if t >= CUT_TEAR else CUT_TEAR)
        rnd = random.Random(4); xs = []; y = 0.0
        edge = []
        for x in range(W):
            y += rnd.uniform(-3, 3); y *= 0.96; edge.append(y)
        cut = H * (1 - k)
        cols = np.array(edge, np.float32)[None, :] + cut
        rows = np.arange(H, dtype=np.float32)[:, None]
        m = Image.fromarray(((rows >= cols) * 255).astype(np.uint8), 'L')
        fr = Image.composite(b, a, m)
        strip = ((rows >= cols - 18) & (rows < cols)).astype(bool)
        arr = np.asarray(fr).copy(); arr[strip, :3] = WHITE; fr = Image.fromarray(arr, 'RGBA')
    else:
        fr = scene(t)
    caption(fr, t)
    return finish(fr, t)

if __name__ == '__main__':
    init()
    args = sys.argv[2:]
    if args and args[0] == '--still':
        for s in args[1:]:
            Image.fromarray(frame_at(float(s))).save(f'{O}still_{float(s):05.2f}.png')
    else:
        i, n = (int(args[1]), int(args[2])) if args and args[0] == '--part' else (0, 1)
        total = int(round(DUR * FPS)); lo, hi = total * i // n, total * (i + 1) // n
        out = sys.stdout.buffer
        for f in range(lo, hi): out.write(frame_at(f / FPS).tobytes())
