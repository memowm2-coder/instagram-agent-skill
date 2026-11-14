import json, subprocess, numpy as np, wave
W = json.load(open('words.json'))
# decode to mono float 48k
raw = subprocess.run(['ffmpeg','-v','error','-i','vo.mp3','-ac','1','-ar','48000','-f','f32le','-'],capture_output=True,check=True).stdout
y = np.frombuffer(raw, dtype=np.float32).copy(); sr = 48000
CUTS = [(30.05, 34.45), (40.30, 47.70)]   # false start «كانوا يستخدمون شي اسمه ساعات…»; first take of «وعشان شي أول تصاميم…» + long pause
keep = np.ones(len(y), bool)
for a,b in CUTS: keep[int(a*sr):int(b*sr)] = False
cut_at = lambda t: any(a <= t < b for a,b in CUTS)
# speech islands by energy (20 ms frames)
hop = int(.02*sr); n = len(y)//hop
rms = np.sqrt(np.mean(y[:n*hop].reshape(n,hop)**2, axis=1)); thr = max(1e-4, np.percentile(rms, 95) * 10**(-32/20))
voiced = (rms > thr) & keep[:n*hop:hop]
segs=[]; i=0
while i<n:
    if voiced[i]:
        j=i
        while j<n and voiced[j]: j+=1
        segs.append([max(0,i*hop-int(.05*sr)), min(len(y), j*hop+int(.05*sr))]); i=j
    else: i+=1
isl=[]
for a,b in segs:
    if isl and a <= isl[-1][1] + int(.12*sr): isl[-1][1]=b
    else: isl.append([a,b])
isl=[[a,b] for a,b in isl if not any(a/sr>c0-0.01 and b/sr<c1+0.01 for c0,c1 in CUTS)]
out=[]; mapping=[]; pos=0; prev=None
for a,b in isl:
    if prev is not None:
        gap=(a-prev)/sr; tgt=0.08 if gap<0.45 else (0.16 if gap<1.0 else 0.30)
        k=int(min(gap,tgt)*sr); out.append(np.zeros(k,np.float32)); pos+=k
    mapping.append((a/sr,b/sr,pos/sr)); out.append(y[a:b]); pos+=b-a; prev=b
o=np.concatenate(out)
with wave.open('vo_tight.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(o,-1,1)*32767).astype('<i2').tobytes())
TEMPO=1.10
def remap(t):
    for a,b,p in mapping:
        if a-0.06 <= t <= b+0.06: return (p + min(max(t-a,0),b-a)) / TEMPO
    return None
ew=[]
for s,e,t in W:
    if cut_at(s): continue
    rs, re_ = remap(s), remap(e)
    if rs is None:
        nxt=[p for a,b,p in mapping if a>=s]; rs=(nxt[0] if nxt else pos/sr)/TEMPO
    if re_ is None: re_=rs+0.25
    ew.append([round(rs,3),round(max(re_,rs+0.08),3),t])
json.dump(ew,open('words_edit.json','w'),ensure_ascii=False)
print('islands',len(isl),'tight',round(pos/sr,2),'s  final≈',round(pos/sr/TEMPO,2),'s')
