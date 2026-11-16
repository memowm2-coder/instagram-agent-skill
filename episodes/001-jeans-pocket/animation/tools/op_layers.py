import sys
from PIL import Image,ImageDraw,ImageFilter
K,O=sys.argv[1],sys.argv[2]
plate=Image.open(f'{K}/scene01_approved_full_frame.png').convert('RGBA')
clean=plate.copy()
def clone(src_box,dx,dy,feather=10):
  x0,y0,x1,y1=src_box; patch=plate.crop(src_box)
  m=Image.new('L',patch.size,0);ImageDraw.Draw(m).rectangle((feather,feather,patch.size[0]-feather,patch.size[1]-feather),fill=255)
  m=m.filter(ImageFilter.GaussianBlur(feather/2)); clean.paste(patch,(x0+dx,y0+dy),m)
# cover fingers on the pocket lip with denim lip from between the hands
clone((600,505,870,700),-262,-8)   # -> left hand  x338-608
clone((600,505,870,700),262,22)    # -> right hand x862-1132
clone((640,540,860,700),470,40)    # extra coverage right fingertips
clean.save(f'{O}/l/plate_clean.png')
def poly(img,name,pts,fe=3):
  m=Image.new('L',img.size,0);ImageDraw.Draw(m).polygon(pts,fill=255);m=m.filter(ImageFilter.GaussianBlur(fe))
  c=img.copy();c.putalpha(m);c.save(f'{O}/l/{name}.png')
def ell(img,name,box,fe=6):
  m=Image.new('L',img.size,0);ImageDraw.Draw(m).ellipse(box,fill=255);m=m.filter(ImageFilter.GaussianBlur(fe))
  c=img.copy();c.putalpha(m);c.crop(box).save(f'{O}/l/{name}.png')
lip=[(0,500),(150,492),(330,515),(600,528),(860,542),(1120,578),(1300,598),(1545,612),(1560,1080),(0,1080)]
poly(clean,'pocket_front',lip)
poly(clean,'small_patch',[(362,728),(968,736),(958,940),(360,930)],2)
ell(plate,'qmark',(70,80,250,310)); ell(plate,'ticks_l',(470,140,575,285)); ell(plate,'ticks_r',(975,320,1095,435))
ell(plate,'magnifier',(0,85,480,520),10)
# back card: blank paper from the same plate, torn edges
paper=plate.crop((1030,90,1770,520)).resize((760,560))
import random;random.seed(7);w,h=paper.size;pts=[]
for x in range(0,w+1,18):pts.append((x,random.uniform(0,22)))
for y in range(18,h,18):pts.append((w-random.uniform(0,22),y))
for x in range(w,-1,-18):pts.append((x,h-random.uniform(0,22)))
for y in range(h-18,0,-18):pts.append((random.uniform(0,22),y))
m=Image.new('L',paper.size,0);ImageDraw.Draw(m).polygon(pts,fill=255);paper.putalpha(m);paper.save(f'{O}/l/back_card.png')
