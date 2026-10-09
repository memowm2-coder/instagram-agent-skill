import sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R=sys.argv[1]; F=R+'/fonts/thmanyah typeface/'; O=R+'/ep01/'
W,H=1080,1920; CX=470
PAPER=(241,236,226); PAPER2=(232,225,212); INK=(20,20,20); GREY=(138,133,124); GOLD=(186,146,84)
def fnt(fam,wt,s): return ImageFont.truetype(f"{F}{fam}/otf/{fam}-{wt}.otf",s)
def base():
    rnd=np.random.default_rng(2)
    a=np.full((H,W,3),PAPER,np.float32)+rnd.normal(0,5,(H,W,1))
    fib=Image.effect_noise((W//4,H//4),60).resize((W,H),Image.BICUBIC).filter(ImageFilter.GaussianBlur(2))
    a*= (0.97+0.03*np.asarray(fib,np.float32)[...,None]/255)
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8)).convert('RGBA')
def text(d,xy,s,f,fill=INK,anchor='mm'):
    d.text(xy,s,font=f,fill=fill,anchor=anchor,direction='rtl',language='ar')
def shadow_paste(im,layer,xy,off=(10,16),blur=16,a=0.35):
    m=layer.getchannel('A').filter(ImageFilter.GaussianBlur(blur)).point(lambda v:int(v*a))
    sh=Image.new('RGBA',layer.size,(0,0,0,255)); sh.putalpha(m)
    im.alpha_composite(sh,(xy[0]+off[0],xy[1]+off[1])); im.alpha_composite(layer,xy)
def masthead(d,ep='٠١'):
    d.line([(60,250),(880,250)],fill=INK,width=3)
    text(d,(880,215),'غريب عجيب',fnt('thmanyahserifdisplay','Black',44),anchor='rm')
    text(d,(60,215),'العدد '+ep,fnt('thmanyahsans','Medium',32),GREY,anchor='lm')
def plate(w=760,h=170,letter='P',num='7'):
    L=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(L)
    d.rounded_rectangle([0,0,w-1,h-1],22,fill=(252,252,250),outline=INK,width=6)
    d.rounded_rectangle([14,14,w-15,h-15],14,outline=(200,200,200),width=2)
    fl=ImageFont.truetype(F+'thmanyahsans/otf/thmanyahsans-Bold.otf',88)
    fn=ImageFont.truetype(F+'thmanyahsans/otf/thmanyahsans-Black.otf',150)
    d.text((80,h//2),letter,font=fl,fill=INK,anchor='mm')
    d.text((w//2+60,h//2+6),num,font=fn,fill=INK,anchor='mm')
    d.text((w-70,h//2),'دبي',font=ImageFont.truetype(F+'thmanyahsans/otf/thmanyahsans-Bold.otf',40),fill=INK,anchor='mm',direction='rtl',language='ar')
    return L.rotate(-4,resample=Image.BICUBIC,expand=True)
def torn_card(w,h,color,seed=1):
    rnd=random.Random(seed); pts=[]
    for x in range(0,w+1,14): pts.append((x,rnd.uniform(0,7)))
    for y in range(0,h+1,14): pts.append((w-rnd.uniform(0,7),y))
    for x in range(w,-1,-14): pts.append((x,h-rnd.uniform(0,7)))
    for y in range(h,-1,-14): pts.append((rnd.uniform(0,7),y))
    L=Image.new('RGBA',(w,h),(0,0,0,0)); ImageDraw.Draw(L).polygon(pts,fill=color); return L
def logo(im,w=150,xy=(66,1720)):
    lg=Image.open(R+'/reel/logo_white.png'); a=lg.getchannel('A')
    ink=Image.new('RGBA',lg.size,INK+(255,)); ink.putalpha(a)
    ink=ink.resize((w,int(lg.height*w/lg.width)),Image.LANCZOS); im.alpha_composite(ink,xy)

# 1 hook
im=base(); d=ImageDraw.Draw(im); masthead(d)
text(d,(CX,470),'هذا الرقم',fnt('thmanyahserifdisplay','Medium',72),GREY)
p=plate(); shadow_paste(im,p,(CX-p.width//2,560))
text(d,(CX,1000),'٥٥',fnt('thmanyahserifdisplay','Black',330))
text(d,(CX,1215),'مليون درهم',fnt('thmanyahserifdisplay','Bold',96))
d.line([(CX-60,1300),(CX+60,1300)],fill=GOLD,width=6)
text(d,(CX,1370),'دبي · أبريل ٢٠٢٣',fnt('thmanyahsans','Medium',38),GREY)
im.convert('RGB').save(O+'sf01_hook.png')

# 2 twist: money becomes meals
im=base(); d=ImageDraw.Draw(im); masthead(d)
text(d,(CX,430),'ولا درهم',fnt('thmanyahserifdisplay','Black',120))
text(d,(CX,560),'راح لجيب أحد',fnt('thmanyahserifdisplay','Medium',80),GREY)
# stack of paper notes morphing into bowls along a curve
for i in range(7):
    u=i/6; x=int(150+u*640); y=int(1000-math.sin(u*math.pi)*120)
    if u<0.5:
        c=torn_card(170,90,(214,206,186),i); dd=ImageDraw.Draw(c); dd.rectangle([20,22,150,68],outline=GREY,width=2)
        dd.text((85,45),'٥٥',font=fnt('thmanyahsans','Bold',34),fill=GREY,anchor='mm'); c=c.rotate(8-i*3,expand=True,resample=Image.BICUBIC)
    else:
        c=Image.new('RGBA',(190,120),(0,0,0,0)); dd=ImageDraw.Draw(c)
        dd.pieslice([5,-60,185,115],0,180,fill=(250,248,243),outline=INK,width=4)
        dd.ellipse([30,0,160,26],fill=GOLD)
    shadow_paste(im,c,(x-c.width//2,y-c.height//2),off=(6,10),blur=10)
d.line([(120,1180),(820,1180)],fill=INK,width=2)
text(d,(CX,1260),'كلها راحت لحملة',fnt('thmanyahsans','Medium',46),GREY)
text(d,(CX,1340),'مليار وجبة',fnt('thmanyahserifdisplay','Black',96),GOLD)
im.convert('RGB').save(O+'sf02_twist.png')

# 3 ending: the question
im=base(); d=ImageDraw.Draw(im); masthead(d)
c=torn_card(820,560,(250,248,243),9); shadow_paste(im,c,(CX-410,520))
text(d,(CX,660),'لو معك',fnt('thmanyahserifdisplay','Medium',80),GREY)
text(d,(CX,800),'٥٥ مليون',fnt('thmanyahserifdisplay','Black',150))
text(d,(CX,960),'تشتري رقم؟',fnt('thmanyahserifdisplay','Black',110),GOLD)
text(d,(CX,1220),'قولولي في التعليقات',fnt('thmanyahsans','Medium',44),INK)
text(d,(CX,1450),'غريب… عجيب.',fnt('thmanyahserifdisplay','Bold',64),GREY)
logo(im)
im.convert('RGB').save(O+'sf03_end.png')
print('ok')
