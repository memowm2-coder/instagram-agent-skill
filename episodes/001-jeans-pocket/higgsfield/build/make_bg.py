# Paper-scrap collage background, cut only from the approved plates' own paper, kraft and script pieces.
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import random, math
random.seed(7)
W, H = 3320, 2080
P = {n: Image.open(f'L/plate{n}.png').convert('RGB') for n in ('1', '4', '9')}
# paper sources (plate px): blank cream cards, kraft/tape, script & map scraps
SRC = [('1', (1060, 110, 1560, 360)), ('4', (630, 50, 960, 230)), ('4', (70, 720, 470, 920)), ('4', (690, 840, 1060, 941)),
       ('9', (50, 30, 300, 150)), ('9', (880, 720, 1600, 920)), ('1', (0, 830, 220, 941)), ('1', (1000, 0, 1380, 55)),
       ('1', (1580, 30, 1672, 330)), ('4', (530, 20, 610, 280)), ('9', (1500, 600, 1672, 700))]
base = Image.new('RGB', (W, H), (214, 196, 160))
# warm paper base with fibre noise
noise = Image.effect_noise((W // 2, H // 2), 22).resize((W, H)).convert('L')
base = Image.composite(Image.new('RGB', (W, H), (226, 210, 176)), Image.new('RGB', (W, H), (200, 180, 142)), noise.point(lambda v: min(255, max(0, v))))
def torn_mask(w, h, jag=10):
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); pts = []
    for x in range(0, w, 14): pts.append((x, random.randint(0, jag)))
    for y in range(0, h, 14): pts.append((w - random.randint(0, jag), y))
    for x in range(w, 0, -14): pts.append((x, h - random.randint(0, jag)))
    for y in range(h, 0, -14): pts.append((random.randint(0, jag), y))
    d.polygon(pts, fill=255); return m.filter(ImageFilter.GaussianBlur(0.8))
canvas = base.copy().convert('RGBA')
pieces = 46
cells = [(cx, cy) for cy in range(-150, H, 330) for cx in range(-200, W, 460)]
random.shuffle(cells)
for i, (cx, cy) in enumerate(cells):
    n, box = random.choice(SRC)
    crop = P[n].crop(box)
    s = random.uniform(1.3, 2.2)
    crop = crop.resize((int(crop.width * s), int(crop.height * s)))
    if random.random() < 0.5: crop = ImageEnhance.Brightness(crop).enhance(random.uniform(0.92, 1.08))
    m = torn_mask(*crop.size, jag=random.randint(8, 22))
    piece = crop.convert('RGBA'); piece.putalpha(m)
    ang = random.uniform(-14, 14)
    piece = piece.rotate(ang, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', piece.size, (0, 0, 0, 0)); sh.putalpha(piece.split()[-1].point(lambda v: int(v * 0.35)))
    sh = sh.filter(ImageFilter.GaussianBlur(9))
    x = cx + random.randint(-80, 80); y = cy + random.randint(-60, 60)
    canvas.alpha_composite(sh, (max(0, x - 10), max(0, y + 14)) if x > 10 and y > -14 else (max(0, x), max(0, y)))
    canvas.alpha_composite(piece, (max(0, x), max(0, y)))
# a few strips of tape
tape = Image.open('a/tape.png').convert('RGBA')
for i in range(14):
    t = tape.resize((random.randint(220, 380), random.randint(60, 90))).rotate(random.uniform(-40, 40), expand=True, resample=Image.BICUBIC)
    canvas.alpha_composite(t, (random.randint(0, W - 400), random.randint(0, H - 150)))
# soften so the foreground stays the hero
out = canvas.convert('RGB').filter(ImageFilter.GaussianBlur(1.6))
out = ImageEnhance.Contrast(out).enhance(0.8)
out = ImageEnhance.Brightness(out).enhance(1.04)
out.save('a/paper_bg.jpg', quality=90)
out.resize((W // 4, H // 4)).save('paper_bg_small.jpg', quality=80)
print('ok', out.size)
