import numpy as np, wave
SR=48000; DUR=42.7; N=int(SR*DUR); rng=np.random.default_rng(3)
mus=np.zeros(N); sfx=np.zeros(N)
def f(n): return 440*2**((n-69)/12)
def note(buf,t,midi,dur,vel=.3):
    i=int(t*SR); n=int(dur*SR); tt=np.arange(n)/SR
    fr=f(midi); env=np.exp(-tt*2.6)*(1-np.exp(-tt*300))
    w=(np.sin(2*np.pi*fr*tt)+.45*np.sin(4*np.pi*fr*tt)*np.exp(-tt*3)+.18*np.sin(6*np.pi*fr*tt)*np.exp(-tt*5))*env*vel
    e=min(N,i+n); buf[i:e]+=w[:e-i]
def pad(buf,t0,t1,midis,vel=.05,att=1.5):
    i0,i1=int(t0*SR),min(N,int(t1*SR)); tt=np.arange(i1-i0)/SR; L=(i1-i0)/SR
    env=np.clip(tt/att,0,1)*np.clip((L-tt)/1.0,0,1)
    w=sum(np.sin(2*np.pi*f(m)*tt*(1+d))+np.sin(2*np.pi*f(m)*tt*(1-d)) for m in midis for d in (0.002,))
    w*=1+.15*np.sin(2*np.pi*5*tt)  # gentle vibrato-ish tremolo
    buf[i0:i1]+=w*env*vel
# progression: Am F C G  (bar = 3.33s at 72bpm)
bar=60/72*4; beat=bar/4
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
t=0;bi=0
while t<DUR-1.5:
    c=chords[bi%4]
    if not (32.55<t<33.15):
        for k,m in enumerate([c[0]-12,c[1],c[2],c[1]+12]):
            tb=t+k*beat
            if tb<DUR-0.5 and not (32.55<tb<33.15): note(mus,tb,m,3.0,.22 if k else .28)
        if t>=18.9-bar: pad(mus,t,min(t+bar+.3,32.55 if t<32.55 else DUR),[m+12 for m in c],.035)
    t+=bar; bi+=1
note(mus,33.2,69,4,.3); note(mus,33.2,64,4,.22); note(mus,33.2,57,4,.22)  # after the silence
pad(mus,40.3,DUR,[57+12,60+12,64+12],.03,0.6)
# simple reverb: comb filters
def reverb(x):
    y=x.copy()
    for d,g in [(0.0297,.5),(0.0371,.45),(0.0411,.42),(0.0437,.4)]:
        k=int(d*SR); z=np.zeros_like(x)
        for i in range(0,len(x),k):
            pass
        z[k:]=x[:-k]*g; y+=z
        z2=np.zeros_like(x); z2[2*k:]=x[:-2*k]*g*g; y+=z2
    return y
mus=reverb(mus)
# ducking silence before "تنام"
i0,i1=int(32.6*SR),int(33.15*SR); mus[i0:i1]*=np.linspace(1,0,i1-i0)**3
# SFX
def noise_burst(t,d,vel,hp=True):
    i=int(t*SR); n=int(d*SR); x=rng.normal(0,1,n)
    if hp: x=np.diff(x,prepend=0)
    env=np.sin(np.pi*np.arange(n)/n)**2
    e=min(N,i+n); sfx[i:e]+=(x*env*vel)[:e-i]
def blip(t,f0,f1,d=.12,vel=.25):
    i=int(t*SR); n=int(d*SR); tt=np.arange(n)/SR
    fr=np.linspace(f0,f1,n); ph=2*np.pi*np.cumsum(fr)/SR
    e=min(N,i+n); sfx[i:e]+=(np.sin(ph)*np.exp(-tt*25)*vel)[:e-i]
def thump(t,vel=.3,fr=85):
    i=int(t*SR); n=int(.2*SR); tt=np.arange(n)/SR
    e=min(N,i+n); sfx[i:e]+=(np.sin(2*np.pi*fr*tt)*np.exp(-tt*22)*vel+rng.normal(0,1,n)*np.exp(-tt*60)*vel*.15)[:e-i]
for c in [2.4,4.8,7.6,11.7,16.1,18.9,22.6,29.9,32.8,35.1,38.7,40.3]: noise_burst(c-.02,.32,.06)
blip(8.0,900,1350); blip(9.1,700,1050,vel=.2)        # message sent / reply
sfx[int(9.95*SR):int(9.95*SR)+200]+=rng.normal(0,.4,200)  # lamp click
for k in range(8): thump(12.0+k*.5,.18)              # footsteps
for k in range(11): blip(16.15+k*.25,2400,2300,.03,.07)   # fast clock
for k in range(9): noise_burst(19.0+k*.07,.12,.03)   # pop-up paper
thump(20.4,.55,60)                                     # stamp
for k in range(9): blip(22.65+k*.15,500+k*40,560+k*40,.08,.08)   # people pop
noise_burst(31.0,1.2,.03,hp=False)                     # camera lifted
noise_burst(35.3,1.6,.05)                              # plane whoosh
mix=mus*.9+sfx
mix/=np.max(np.abs(mix))/0.6
fade=int(.4*SR); mix[-fade:]*=np.linspace(1,0,fade)
st=np.stack([mix,mix],1)
with wave.open('music_sfx.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes())
mm=mus/np.max(np.abs(mus))*0.6
with wave.open('music_only.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([mm,mm],1)*32767).astype(np.int16).tobytes())
print('ok')
