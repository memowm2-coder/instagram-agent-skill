import numpy as np, wave
SR=48000; END=62.4; N=int(SR*END); rng=np.random.default_rng(11)
out=np.zeros(N,np.float32)
def put(t, sig, g=1.0):
    s=int(t*SR); e=min(N,s+len(sig))
    if s<N and e>s: out[s:e]+=g*sig[:e-s]
def lp(x,a):  # one-pole low-pass
    y=np.empty_like(x); acc=0.0
    for i,v in enumerate(x): acc+=a*(v-acc); y[i]=acc
    return y
def whoosh(d=0.32):
    n=int(d*SR); x=rng.uniform(-1,1,n).astype(np.float32)
    env=np.sin(np.linspace(0,np.pi,n))**2
    # rising then falling band: blend two low-passes
    a=lp(x,0.08); b=lp(x,0.35); m=np.linspace(0,1,n)
    return (a*(1-m)+b*m)*env*2.0
def pop():
    n=int(.07*SR); t=np.arange(n)/SR
    return (np.sin(2*np.pi*520*t)*.7+rng.uniform(-1,1,n)*.25)*np.exp(-t*55)
def stamp():
    n=int(.35*SR); t=np.arange(n)/SR
    return np.sin(2*np.pi*64*t)*np.exp(-t*12)*1.1 + rng.uniform(-1,1,n)*np.exp(-t*60)*.5
def marker(d=.28):
    n=int(d*SR); x=lp(rng.uniform(-1,1,n).astype(np.float32),0.6)
    return x*np.sin(np.linspace(0,np.pi,n))*(.6+.4*np.sin(2*np.pi*31*np.arange(n)/SR))*.8
def tick():
    n=int(.03*SR); t=np.arange(n)/SR
    return np.sin(2*np.pi*2100*t)*np.exp(-t*170)*.6
for c in (5.04,9.24,13.15,17.40,20.95,23.70,28.95,34.80,37.70,39.35,40.80,46.35,49.20,54.35,60.10): put(c-0.16, whoosh(), .6)
for t in (2.80,5.50,9.30,10.20,11.50,13.20,14.70,15.00,15.30,17.45,20.05,21.75,25.55,26.50,27.70,30.10,32.70,35.45,36.55,37.70,
          39.95,40.85,43.30,43.55,46.40,48.40,48.52,48.64,48.76,48.80,49.40,50.10,51.10,56.50,57.80,60.30,60.86): put(t, pop(), .35)
for t in (8.55,10.80,12.70,16.30,20.75,22.60,25.55,39.43,45.25,48.80,53.00,60.18): put(t, stamp(), .7)
for t in (3.46,6.0,26.0,33.4,35.85,40.3,48.95,53.75,57.25): put(t, marker(), .45)
put(23.95, stamp(), .4)
for k in range(int((28.9-24.2)/0.5)): put(24.2+k*0.5, tick(), .35)
out=np.clip(out,-1,1)
with wave.open('sfx2.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*30000).astype('<i2').tobytes())
print('sfx ok', round(N/SR,2))
