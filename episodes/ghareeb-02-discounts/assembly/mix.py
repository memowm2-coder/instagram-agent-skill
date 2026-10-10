"""Runs in the Higgsfield sandbox: VO + composed music (ducked) + paper SFX -> mix.m4a
usage: python3 mix.py music.wav vo.wav
"""
import json, sys, wave, subprocess, numpy as np
SR=48000; rng=np.random.default_rng(7)
T=json.load(open('timing.json',encoding='utf-8'))
starts=[0.0]+[t[0] for t in T[1:]]; END=T[-1][1]+1.6
FPS=30; cuts=[round(x*FPS)/FPS for x in starts]; N=int(round(END*FPS)/FPS*SR)
def rd(p):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    x=np.frombuffer(raw,np.float32).reshape(-1,2); y=np.zeros((N,2)); y[:min(N,len(x))]=x[:N]; return y
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
def whoosh(d=.38,v=.07): n=int(d*SR); return bp(rng.normal(0,1,n),400,4000)*np.hanning(n)**2*v
def slide(d=.22,v=.09): n=int(d*SR); return bp(rng.normal(0,1,n),900,6000)*np.sin(np.pi*np.arange(n)/n)**1.5*v
def tap(v=.3):
    n=int(.09*SR); t=np.arange(n)/SR; return (bp(rng.normal(0,1,n),300,3500)*np.exp(-t*70)+np.sin(2*np.pi*180*t)*np.exp(-t*50)*.6)*v
def thud(v=.5):
    n=int(.3*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*70*t)*np.exp(-t*16)+bp(rng.normal(0,1,n),200,2500)*np.exp(-t*45)*.5)*v
def keys(k=5,v=.18):
    out=np.zeros(int((k*.075+.1)*SR))
    for j in range(k): x=tap(v*rng.uniform(.6,1)); x=bp(x,1200,7000); i=int(j*.075*SR); out[i:i+len(x)]+=x
    return out
sfx=np.zeros(N)
def add(t,x,pan=0):
    i=int(t*SR); e=min(N,i+len(x))
    if 0<=i<N: sfx[i:e]+=x[:e-i]
LAB={1,6,7,8,10,11,16,18,19,25}
for i,c in enumerate(cuts):
    s=i+1
    if i: add(c-.12,whoosh())
    add(c+.05,slide()); add(c+.3,tap(.22))
    if s in LAB: add(c+.35,slide(.18,.07)); add(c+.5,tap(.28))
add(cuts[19]-.02,thud(.75))     # «والنتيجة؟» landing
add(cuts[20]+.4,thud(.45)); add(cuts[21]+.4,thud(.45))
add(cuts[14]+.3,keys(7))         # 2012 typewriter
add(cuts[26]+.35,thud(.35))      # logo ink
vo=rd(sys.argv[2]); mus=rd(sys.argv[1])
env=np.convolve(np.abs(vo).mean(1),np.ones(int(.15*SR))/int(.15*SR),'same')
duck=1-0.55*np.clip(env/.04,0,1); duck=np.convolve(duck,np.ones(int(.1*SR))/int(.1*SR),'same')
mix=vo+mus*duck[:,None]*.8+np.stack([sfx,sfx],1)*.9
fd=int(1.0*SR); mix[-fd:]*=np.linspace(1,0,fd)[:,None]
with wave.open('mix_raw.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix/np.abs(mix).max()*.9,-1,1)*32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','mix_raw.wav','-af','loudnorm=I=-14:TP=-1.5:LRA=11','-ar','48000','-c:a','aac','-b:a','256k','mix.m4a'],check=True)
print('mix ok', N/SR)
