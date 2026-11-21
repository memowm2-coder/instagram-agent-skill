# Background A: one clean aged sheet of paper (fibre noise + soft stains), 3320×2080.
from PIL import Image, ImageDraw, ImageFilter
import random
W, H = 3320, 2080
random.seed(1)
n = Image.effect_noise((W // 2, H // 2), 30).resize((W, H)).convert('L')
img = Image.composite(Image.new('RGB', (W, H), (236, 222, 192)), Image.new('RGB', (W, H), (214, 194, 156)), n)
random.seed(2); ov = Image.new('L', (W, H), 0); d = ImageDraw.Draw(ov)
for _ in range(10):
    x, y, r = random.randint(0, W), random.randint(0, H), random.randint(120, 420)
    d.ellipse((x - r, y - r, x + r, y + r), fill=random.randint(18, 40))
ov = ov.filter(ImageFilter.GaussianBlur(90))
Image.composite(Image.new('RGB', (W, H), (150, 110, 60)), img, ov).save('a/bg_A.jpg', quality=90)
print('bg A ok')
