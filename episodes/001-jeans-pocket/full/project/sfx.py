import wave,math,random,struct,sys,json
SR=48000;DUR=85.74;N=int(SR*DUR);random.seed(9)
tracks={k:[0.0]*N for k in ['paper','stamp','phone','watch']}
def add(tr,t,d,fn):
  b=tracks[tr];s=int(t*SR)
  for i in range(int(d*SR)):
    if 0<=s+i<N:b[s+i]+=fn(i/SR,d)
def lpn():
  st=[0.0]
  def n(a): st[0]+=a*(random.uniform(-1,1)-st[0]); return st[0]
  return n
def slide(t,d=.4,a=.3):n=lpn();add('paper',t,d,lambda x,D:a*n(.3)*math.sin(math.pi*x/D))
def tear(t,d=.7):n=lpn();add('paper',t,d,lambda x,D:.55*n(.6)*(1-x/D)*(1 if random.random()<.7 else .2))
def stamp(t,a=.7):
  n=lpn();add('stamp',t,.4,lambda x,D:a*math.sin(2*math.pi*68*x)*math.exp(-x*10));add('stamp',t,.05,lambda x,D:.4*n(.9)*(1-x/D))
def pop(t,a=.25):n=lpn();add('stamp',t,.07,lambda x,D:a*(n(.8)*.5+math.sin(2*math.pi*420*x))*math.exp(-x*45))
def knock(t,a=.35):add('phone',t,.1,lambda x,D:a*math.sin(2*math.pi*140*x)*math.exp(-x*40))
def boing(t,f0,f1,a):add('phone',t,.28,lambda x,D:a*math.sin(2*math.pi*(f0+(f1-f0)*x/D)*x)*math.exp(-x*7))
def tick(t,a=.2):add('watch',t,.03,lambda x,D:a*math.sin(2*math.pi*1800*x)*math.exp(-x*160))
fr=lambda f:f/30
SC=[0,237,522,720,1038,1437,1908,2313]
for c in SC[1:]: tear(fr(c-10))
# S1
for f in (21,33,45): slide(fr(f),.18,.3)
for i in range(5): pop(fr(60+i*6))
# S2
o=237;slide(fr(o+30),.4)
for k in (52,56,60,64,68): knock(fr(o+k))
boing(fr(o+96),180,520,.3);boing(fr(o+104),230,600,.22);knock(fr(o+112),.3)
stamp(fr(o+124));[pop(fr(o+70+i*8)) for i in range(2)]
# S3
o=522;slide(fr(o+6),.5);stamp(fr(o+30),.6);slide(fr(o+50),.3)
# S4 watch
o=720;slide(fr(o+10),.4)
for k in range(o+22,1038,15): tick(fr(k))
pop(fr(o+90))
# S5
o=1038;slide(fr(o+30),.6,.15);tear(fr(o+60),.5)
for k in range(o+150,o+175,8): knock(fr(k),.2)
stamp(fr(o+300),.6)
# S6
o=1437
for k in (40,52,64,76): pop(fr(o+k),.3)
slide(fr(o+24));slide(fr(o+250))
# S7
o=1908;slide(fr(o+6));slide(fr(o+50));slide(fr(o+100));[pop(fr(o+130+i*10)) for i in range(2)]
# S8
o=2313;stamp(fr(o+40),.7)
for k,b in tracks.items():
  w=wave.open(f'sfx/{k}.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
  w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in b));w.close()
