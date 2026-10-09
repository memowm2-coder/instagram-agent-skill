import sys, json, wave, math, numpy as np
sys.argv=[sys.argv[0], sys.argv[1]]
import render as Rn
Rn.init()
T=Rn.TIM; DUR=Rn.DUR; SR=48000; N=int(DUR*SR); rng=np.random.default_rng(5)
def rd(p):
    w=wave.open(p); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    return np.interp(np.arange(int(len(x)*SR/sr))*sr/SR,np.arange(len(x)),x)
vo=np.zeros(N); v=rd('vo_guide.wav'); vo[:min(N,len(v))]=v[:N]
sfx=np.zeros(N); mus=np.zeros(N)
def add(buf,t,x):
    i=int(t*SR); e=min(N,i+len(x));
    if i<N: buf[i:e]+=x[:e-i]
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
def slide(d=.22,v=.10):
    n=int(d*SR); x=bp(rng.normal(0,1,n),900,6000); env=np.sin(np.pi*np.arange(n)/n)**1.5; return x*env*v
def tap(v=.35):
    n=int(.09*SR); tt=np.arange(n)/SR; x=bp(rng.normal(0,1,n),300,3500)*np.exp(-tt*70)+np.sin(2*np.pi*180*tt)*np.exp(-tt*50)*.6; return x*v
def thud(v=.6):
    n=int(.3*SR); tt=np.arange(n)/SR; return (np.sin(2*np.pi*70*tt)*np.exp(-tt*16)+bp(rng.normal(0,1,n),200,2500)*np.exp(-tt*45)*.5)*v
def scratch(d=.35,v=.05):
    n=int(d*SR); x=bp(rng.normal(0,1,n),2500,9000)*(0.6+0.4*np.sin(np.arange(n)/SR*2*np.pi*30)); return x*np.hanning(n)*v
def whoosh(d=.35,v=.06):
    n=int(d*SR); x=rng.normal(0,1,n); x=bp(x,400,4000); return x*np.hanning(n)**2*v
for i,els in enumerate(Rn.BEATS):
    t0=T[i][0] if i else 0.0; t1=T[i+1][0] if i+1<len(T) else DUR; D=t1-t0
    A=min(D*0.62,0.32*len(els)+0.2)
    if i: add(sfx,t0-0.05,whoosh())
    for k,e in enumerate(els):
        te=t0+math.ceil((A*k/max(1,len(els)))*12)/12
        if e.string: add(sfx,te,scratch()); continue
        land=te+0.25
        if e.mode=='slide': add(sfx,te,slide()); add(sfx,land-0.04,tap(.22))
        elif e.mode=='stamp': add(sfx,te+0.05,thud(.55 if e.img.width>200 else .3))
        else: add(sfx,land-0.05,tap(.3))
# music: minimal documentary piano + pulse, enters after the opening beat
f=lambda m:440*2**((m-69)/12)
def note(t,m,d,v,dec=1.8):
    n=int(d*SR); tt=np.arange(n)/SR; x=sum(a*np.sin(2*np.pi*f(m)*(h+1)*tt)*np.exp(-tt*dec*(h+1)) for h,a in enumerate((1,.35,.12)))*(1-np.exp(-tt*300)); add(mus,t,x*v)
start=T[1][0]; jc=T[14][0]; res=T[19][0]; turn=T[23][0]
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; t=start; b=0; beat=60/84
while t<DUR-1:
    if res-0.3<t<res+1.2: t+=beat; continue           # silence before "النتيجة؟"
    c=prog[(b//4)%4]; m=[c[0]-12,c[2],c[1],c[2]][b%4]
    note(t,m,1.6,.16 if t<jc else .2)
    if t>=jc and b%2==0: note(t,c[0]-24,1.2,.12,dec=3)  # low pulse from the JCPenney act
    t+=beat; b+=1
for d_,g in [(.029,.3),(.043,.24),(.067,.16)]:
    k=int(d_*SR); mus[k:]+=mus[:-k]*g
env=np.convolve(np.abs(vo),np.ones(int(.12*SR))/int(.12*SR),'same'); duck=1-0.5*np.clip(env/.05,0,1)
mix=vo+mus*.5*duck+sfx*.9; mix=mix/np.abs(mix).max()*.89; fd=int(.6*SR); mix[-fd:]*=np.linspace(1,0,fd)
with wave.open('mix.wav','wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.repeat(mix[:,None],2,1)*32767).astype(np.int16).tobytes())
nv=mus*.5+sfx*.9; nv=nv/np.abs(nv).max()*.89
with wave.open('music_sfx_no_vo.wav','wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.repeat(nv[:,None],2,1)*32767).astype(np.int16).tobytes())
print('ok',DUR)
