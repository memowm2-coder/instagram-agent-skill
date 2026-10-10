import sys
from PIL import Image, ImageFilter, ImageChops, ImageDraw
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
# background = near-white region connected to the border (flood fill on a mask)
gray = im.convert("L")
near_white = gray.point(lambda v: 255 if v > 232 else 0)
seed = near_white.copy()
for x, y in [(0,0),(w-1,0),(0,h//2),(w-1,h//2),(w//2,0)]:
    if seed.getpixel((x,y)) == 255:
        ImageDraw.floodfill(seed, (x,y), 128)
bg = seed.point(lambda v: 255 if v == 128 else 0)
alpha = ImageChops.invert(bg).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
im.putalpha(alpha)
im = im.crop(im.getbbox())
im.save(out)
print(out, im.size)
