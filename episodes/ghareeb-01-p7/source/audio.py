import numpy as np, wave, json, sys
R=sys.argv[1]; T=json.load(open(R+'/tts/timing.json',encoding='utf-8'))
L=lambda i:T[i][0]
SR=48000; DUR=T[-1][1]+2.0; N=int(SR*DUR); rng=np.random.default_rng(7)
def rd(p):
    w=wave.open(p); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    if w.getnchannels()==2: x=x.reshape(-1,2).mean(1)
    return np.interp(np.arange(int(len(x)*SR/sr))*sr/SR,np.arange(len(x)),x)
vo=np.zeros(N); v=rd(R+'/tts/vo_guide.wav'); vo[:min(N,len(v))]=v[:N]
mus=np.zeros(N); sfx=np.zeros(N)
f=lambda m:440*2**((m-69)/12)
def tone(buf,t,m,d,vel,dec=3.0,h=(1,.4,.15)):
    i=int(t*SR); n=int(d*SR); tt=np.arange(n)/SR; fr=f(m)
    w=sum(a*np.sin(2*np.pi*fr*(k+1)*tt)*np.exp(-tt*dec*(k+1)) for k,a in enumerate(h))*(1-np.exp(-tt*400))*vel
    e=min(N,i+n); buf[i:e]+=w[:e-i]
def drone(t0,t1,m,vel):
    i0,i1=int(t0*SR),min(N,int(t1*SR)); tt=np.arange(i1-i0)/SR; Ld=(i1-i0)/SR
    env=np.clip(tt/1.2,0,1)*np.clip((Ld-tt)/0.4,0,1)
    mus[i0:i1]+=(np.sin(2*np.pi*f(m)*tt)+.5*np.sin(2*np.pi*f(m+12)*tt*1.003))*env*vel
# act 1: pulse (low drone + ticking pizzicato) until the stop
stop=L(4)+1.45; drone(0,stop,38,.05)
t=0.2; k=0
while t<stop:
    tone(mus,t,[50,57,53,57][k%4],.5,.18,dec=9); t+=0.5 if t<L(3) else 0.25; k+=1   # speeds up at the auction
# 55 hit, then act 2 low and suspenseful
drone(L(5)+0.45,L(8),33,.06)
for i,tm in enumerate(np.arange(L(5)+0.6,L(8),0.75)): tone(mus,tm,[45,48][i%2],.6,.12,dec=7)
# act 3 the turn: warm piano
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; t=L(8)+0.1; bi=0
while t<DUR-0.5:
    c=prog[bi%4]
    for j,m in enumerate([c[0]-12,c[0],c[1],c[2]]): tone(mus,t+j*0.28,m,3,.16 if j else .2,dec=1.6)
    t+=1.7; bi+=1
# reverb-ish
for d_,g in [(.031,.35),(.047,.28),(.071,.2)]:
    k=int(d_*SR); mus[k:]+=mus[:-k]*g
# SFX
def noise(t,d,vel,hp=True):
    i=int(t*SR); n=int(d*SR); x=rng.normal(0,1,n); x=np.diff(x,prepend=0) if hp else x
    e=min(N,i+n); sfx[i:e]+=(x*np.sin(np.pi*np.arange(n)/n)**2*vel)[:e-i]
def thud(t,vel,fr=60):
    i=int(t*SR); n=int(.35*SR); tt=np.arange(n)/SR
    e=min(N,i+n); sfx[i:e]+=(np.sin(2*np.pi*fr*tt)*np.exp(-tt*14)+rng.normal(0,1,n)*np.exp(-tt*50)*.3)[:e-i]*vel
def click(t,vel=.15):
    i=int(t*SR); n=int(.02*SR); e=min(N,i+n); sfx[i:e]+=(rng.normal(0,1,n)*np.exp(-np.arange(n)/80))[:e-i]*vel
noise(0.0,.3,.05); thud(0.9,.6)                          # plate lands, 55 stamp
for i in range(3): noise(L(1)+[0,.5,1.05][i],.18,.04)    # words set
thud(L(1)+1.05,.3,90)
noise(L(2),.3,.04)
for tm in [L(3)+1.2,L(4)+.15,L(4)+.85]: thud(tm,.35,110); noise(tm,.12,.04)   # counter flips
thud(L(5)+0.45,.75,55); click(L(5)+0.45,.4)               # gavel 55
noise(L(6),.4,.03)
thud(L(7)+0.6,.5,70)                                       # record stamp
noise(L(8)-.05,.45,.09)                                    # paper tear
for i in range(8): click(L(9)+0.35+i*0.2,.12)              # receipt printer
noise(L(11)+0.6,.7,.04,hp=False)
noise(L(12),.35,.04); click(L(13)+0.9,.1)
# ducking music under voice
env=np.abs(vo); win=int(.15*SR); env=np.convolve(env,np.ones(win)/win,'same')
duck=1-0.55*np.clip(env/0.05,0,1)
# silence at the stop
i0,i1=int(stop*SR),int((L(5)+0.45)*SR); mus[i0:i1]*=0.05
mix=vo*1.0+mus*0.55*duck+sfx*0.8
mix=mix/np.max(np.abs(mix))*0.89
fd=int(.5*SR); mix[-fd:]*=np.linspace(1,0,fd)
with wave.open('mix.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.repeat(mix[:,None],2,1)*32767).astype(np.int16).tobytes())
m2=mus*0.55+sfx*0.8; m2=m2/np.max(np.abs(m2))*0.89
with wave.open('music_sfx_no_vo.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.repeat(m2[:,None],2,1)*32767).astype(np.int16).tobytes())
print('ok',round(DUR,2))
