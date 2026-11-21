import wave,math,random,struct,sys
SR=48000;N=SR*10;buf=[0.0]*N;random.seed(4)
def add(t,dur,fn):
  s=int(t*SR)
  for i in range(int(dur*SR)):
    if 0<=s+i<N: buf[s+i]+=fn(i/SR,dur)
def lpn():
  st=[0.0]
  def n(a): st[0]+=a*(random.uniform(-1,1)-st[0]); return st[0]
  return n
def rustle(t,d,a=.3,b=.35):
  n=lpn(); add(t,d,lambda x,D:a*n(b)*math.sin(math.pi*x/D))
def tear(t,d=.7):
  n=lpn(); add(t,d,lambda x,D:.6*n(.6)*(1-x/D)*(1 if random.random()<.7 else .2))
def tick(t,a=.25,f=1800):
  add(t,.03,lambda x,D:a*math.sin(2*math.pi*f*x)*math.exp(-x*160))
def pop(t,a=.35):
  n=lpn(); add(t,.08,lambda x,D:a*(n(.8)*.5+math.sin(2*math.pi*420*x))*math.exp(-x*45))
def thud(t,a=.7):
  add(t,.45,lambda x,D:a*math.sin(2*math.pi*70*x)*math.exp(-x*10))
def knock(t,a=.3): add(t,.1,lambda x,D:a*math.sin(2*math.pi*150*x)*math.exp(-x*45))
fr=lambda f:f/30; n0=lpn()
add(0,10,lambda x,D:.018*n0(.05))
rustle(0,.6)
for f in (10,18,26): pop(fr(f))
pop(fr(40),.3)
tear(fr(95)); tear(fr(195))
pop(fr(116),.3)
for f in (124,132,146,154): knock(fr(f))
thud(fr(164))
for k in range(207,300,15): tick(fr(k),.22,1800 if (k//15)%2 else 1500)
pop(fr(236),.3)
w=wave.open(sys.argv[1],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in buf));w.close()
