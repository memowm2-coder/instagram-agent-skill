import wave,math,random,struct,sys
SR=48000;N=SR*10;buf=[0.0]*N;random.seed(3)
def add(t,dur,fn):
  s=int(t*SR)
  for i in range(int(dur*SR)):
    if s+i<N: buf[s+i]+=fn(i/SR,dur)
def lp_noise():
  st=[0.0]
  def n(a):
    st[0]+=a*(random.uniform(-1,1)-st[0]); return st[0]
  return n
def rustle(t,dur,amp=.35,bright=.35):
  n=lp_noise()
  add(t,dur,lambda x,d: amp*n(bright)*math.sin(math.pi*x/d)*(0.6+0.4*math.sin(x*90)))
def tear(t,dur=.6):
  n=lp_noise()
  add(t,dur,lambda x,d: .55*n(.6)*(1-x/d)*(1 if random.random()<.7 else .2))
def knock(t,amp=.4):
  add(t,.12,lambda x,d: amp*math.sin(2*math.pi*140*x)*math.exp(-x*40))
def boing(t,f0=180,f1=520,amp=.35):
  add(t,.28,lambda x,d: amp*math.sin(2*math.pi*(f0+(f1-f0)*x/d)*x*(1+.04*math.sin(x*60)))*math.exp(-x*7))
def stamp(t):
  n=lp_noise()
  add(t,.5,lambda x,d: .8*math.sin(2*math.pi*65*x)*math.exp(-x*9))
  add(t,.05,lambda x,d: .5*n(.9)*(1-x/d))
fr=lambda f:f/30
n0=lp_noise()
add(0,10,lambda x,d: .02*n0(.05))          # room tone
rustle(fr(12),.6); rustle(fr(44),.35,.3); rustle(fr(70),1.0,.12,.8)
tear(fr(140)); rustle(fr(168),.35,.3)
rustle(fr(188),.5,.25,.15)
for f in (220,224,228,232): knock(fr(f),.35)
boing(fr(236)); boing(fr(244),220,600,.28); boing(fr(252),260,640,.2)
stamp(fr(258))
w=wave.open(sys.argv[1],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in buf));w.close()
