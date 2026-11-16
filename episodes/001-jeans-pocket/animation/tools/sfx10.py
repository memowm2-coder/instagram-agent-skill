import wave,math,random,struct,sys
SR=48000;N=SR*10;buf=[0.0]*N;random.seed(6)
def add(t,d,fn):
  s=int(t*SR)
  for i in range(int(d*SR)):
    if 0<=s+i<N: buf[s+i]+=fn(i/SR,d)
def lpn():
  st=[0.0]
  def n(a): st[0]+=a*(random.uniform(-1,1)-st[0]); return st[0]
  return n
def rustle(t,d,a=.3,b=.35):
  n=lpn(); add(t,d,lambda x,D:a*n(b)*math.sin(math.pi*x/D))
def pop(t,a=.3):
  n=lpn(); add(t,.08,lambda x,D:a*(n(.8)*.5+math.sin(2*math.pi*420*x))*math.exp(-x*45))
def knock(t,a=.4): add(t,.12,lambda x,D:a*math.sin(2*math.pi*130*x)*math.exp(-x*35))
def boing(t,f0,f1,a): add(t,.28,lambda x,D:a*math.sin(2*math.pi*(f0+(f1-f0)*x/D)*x*(1+.04*math.sin(x*60)))*math.exp(-x*7))
def thud(t,a=.75):
  n=lpn(); add(t,.45,lambda x,D:a*math.sin(2*math.pi*65*x)*math.exp(-x*9)); add(t,.05,lambda x,D:.5*n(.9)*(1-x/D))
def peel(t,d):
  n=lpn(); add(t,d,lambda x,D:.4*n(.5)*(x/D)*(1 if random.random()<.8 else .3))
fr=lambda f:f/30;n0=lpn();add(0,10,lambda x,D:.018*n0(.05))
for f in (21,33,45): rustle(fr(f),.18,.35,.5)
for f in (24,40,56): pop(fr(f),.25)
rustle(fr(60),.5,.3)
for i in range(5): pop(fr(78+i*6),.3)
rustle(fr(96),.8,.1,.8); rustle(fr(120),.4,.1,.8)
peel(fr(135),1.1)
F=150
rustle(fr(F+20),.3,.1,.8); rustle(fr(F+20),.5,.22,.15)
for k in (36,40,44,48,52): knock(fr(F+k),.35)
boing(fr(F+56),180,520,.35); boing(fr(F+64),230,620,.25); knock(fr(F+72),.35)
thud(fr(F+80))
w=wave.open(sys.argv[1],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in buf));w.close()
