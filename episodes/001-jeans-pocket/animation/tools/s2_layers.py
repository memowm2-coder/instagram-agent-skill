import sys,random
from PIL import Image,ImageDraw,ImageFilter
K,O=sys.argv[1],sys.argv[2]
p=Image.open(f'{K}/scene02_approved_full_frame.png').convert('RGBA')
def poly(name,pts,fe=3):
  m=Image.new('L',p.size,0);ImageDraw.Draw(m).polygon(pts,fill=255);m=m.filter(ImageFilter.GaussianBlur(fe))
  c=p.copy();c.putalpha(m);c.save(f'{O}/l/{name}.png')
poly('s2_maryam',[(1085,420),(1130,250),(1190,90),(1260,25),(1420,5),(1720,10),(1765,110),(1765,320),(1750,600),(1840,690),(1920,720),(1920,790),(1500,760),(1180,800),(1150,700),(1110,560)])
poly('s2_patch',[(330,655),(560,668),(820,712),(840,880),(320,860)],2)
# cover card from the plate's own blank paper (top-left scrap)
paper=p.crop((60,50,340,300)).resize((720,560));random.seed(11);w,h=paper.size;pts=[]
for x in range(0,w+1,18):pts.append((x,random.uniform(0,22)))
for y in range(18,h,18):pts.append((w-random.uniform(0,22),y))
for x in range(w,-1,-18):pts.append((x,h-random.uniform(0,26)))
for y in range(h-18,0,-18):pts.append((random.uniform(0,22),y))
m=Image.new('L',paper.size,0);ImageDraw.Draw(m).polygon(pts,fill=255);paper.putalpha(m);paper.save(f'{O}/l/s2_card.png')
p.save(f'{O}/l/s2_plate.png')
