import sys,json
from PIL import Image,ImageDraw,ImageFilter
S=sys.argv[1]; O=f'{S}/prev2/layers'
def poly(src,name,pts,feather=4):
  im=Image.open(f'{S}/images/{src}.webp').convert('RGBA'); m=Image.new('L',im.size,0)
  ImageDraw.Draw(m).polygon(pts,fill=255); m=m.filter(ImageFilter.GaussianBlur(feather))
  im.putalpha(m); im.save(f'{O}/{name}.png')
def ell(src,name,box,feather=8):
  im=Image.open(f'{S}/images/{src}.webp').convert('RGBA'); m=Image.new('L',im.size,0)
  ImageDraw.Draw(m).ellipse(box,fill=255); m=m.filter(ImageFilter.GaussianBlur(feather))
  im.putalpha(m); im=im.crop(box); im.save(f'{O}/{name}.png'); return box
# keyframe 1
poly(1,'k1_maryam',[(0,941),(0,620),(100,520),(130,470),(205,420),(235,330),(250,240),(290,120),(350,40),(450,8),(560,10),(660,50),(712,110),(722,210),(705,300),(735,420),(765,520),(835,600),(880,650),(910,730),(940,820),(975,941)])
B={}
B['k1_q1']=ell(1,'k1_q1',(785,55,1005,345)); B['k1_q2']=ell(1,'k1_q2',(1435,600,1615,835)); B['k1_q3']=ell(1,'k1_q3',(155,85,305,295)); B['k1_ex']=ell(1,'k1_ex',(1460,380,1650,600))
# keyframe 9
poly(9,'k9_maryam',[(960,470),(985,330),(1030,230),(1090,120),(1160,40),(1280,5),(1440,15),(1505,110),(1525,260),(1535,420),(1570,555),(1672,605),(1672,690),(1500,690),(1250,688),(1030,700),(995,600)])
poly(9,'k9_phone',[(330,250),(400,180),(600,170),(650,150),(780,130),(845,180),(850,300),(840,400),(760,470),(700,600),(640,595),(360,515),(325,420)],3)
B['k9_ring']=ell(9,'k9_ring',(215,470,760,790),6); B['k9_arrow']=ell(9,'k9_arrow',(290,120,490,360))
# keyframe 4
poly(4,'k4_maryam',[(850,941),(865,820),(930,690),(1000,575),(1060,470),(1110,370),(1165,250),(1235,150),(1325,95),(1445,85),(1535,165),(1545,330),(1565,425),(1625,520),(1672,555),(1672,941)])
poly(4,'k4_watch',[(0,0),(520,0),(520,230),(560,300),(645,380),(650,470),(610,535),(330,540),(300,450),(330,330),(250,320),(0,320)],3)
B['k4_arrow']=ell(4,'k4_arrow',(650,320,910,510))
json.dump(B,open(f'{O}/boxes.json','w'))
print(B)
