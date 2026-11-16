import wave,math,random,struct,sys
SR=48000;N=SR*5;buf=[0.0]*N;random.seed(5)
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
fr=lambda f:f/30;n0=lpn();add(0,5,lambda x,D:.018*n0(.05))
for f in (21,33,45): rustle(fr(f),.18,.35,.5)
for f in (24,40,56): pop(fr(f),.25)
rustle(fr(75),.5,.3)
rustle(fr(78),.6,.1,.8); rustle(fr(92),.4,.1,.8)
rustle(fr(100),.45,.2,.15)
knock(fr(116)); knock(fr(120),.3); knock(fr(122),.25); knock(fr(124),.3)
boing(fr(126),180,520,.35); boing(fr(134),220,600,.25); knock(fr(142),.3)
w=wave.open(sys.argv[1],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in buf));w.close()
