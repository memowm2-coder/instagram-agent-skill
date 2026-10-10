"""Runs in the Higgsfield sandbox: builds the final cut from AI clips + overlays + mix.
usage: python3 assemble.py clips.json   (clips.json maps scene number -> clip URL)
"""
import json, subprocess, sys, os, urllib.request
BASE='https://raw.githubusercontent.com/memowm2-coder/instagram-agent-skill/claude/determined-franklin-xwbqt8/episodes/ghareeb-02-discounts/assembly/'
def get(name):
    if not os.path.exists(name): urllib.request.urlretrieve(BASE+name, name)
    return name
clips=json.load(open(sys.argv[1]))
T=json.load(open(get('timing.json'),encoding='utf-8')); get('mix.m4a')
starts=[0.0]+[t[0] for t in T[1:]]; end=T[-1][1]+1.6
LAB={1,6,7,8,10,11,16,18,19,25}
segs=[]
for i in range(1,len(T)+1):
    D=(starts[i] if i<len(T) else end)-starts[i-1]
    src=f'c{i:02d}.mp4'
    if not os.path.exists(src): urllib.request.urlretrieve(clips[str(i)], src)
    lab=get(f'lab_{i:02d}.png'); cap=get(f'cap_{i:02d}.png')
    sp=min(2.0,max(1.0,4.0/D))            # compress the build-on into short beats, never over 2x
    capdur=T[i-1][1]-T[i-1][0]+0.12; capst=T[i-1][0]-starts[i-1]
    fl=(f"[0:v]scale=1920:1080:flags=lanczos,fps=30,setpts=PTS/{sp:.4f},tpad=stop_mode=clone:stop_duration=6,trim=duration={D:.3f},setpts=PTS-STARTPTS[v];"
        f"[1:v]format=rgba,fade=in:st=0.35:d=0.15:alpha=1[l];"
        f"[2:v]format=rgba,fade=in:st={max(0,capst):.3f}:d=0.12:alpha=1,fade=out:st={max(0,capst)+capdur:.3f}:d=0.08:alpha=1[c];"
        f"[v][l]overlay=0:0:enable='gte(t,0.35)'[v2];[v2][c]overlay=0:0[out]")
    out=f's{i:02d}.mp4'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',src,'-loop','1','-t',f'{D:.3f}','-i',lab,'-loop','1','-t',f'{D:.3f}','-i',cap,
                    '-filter_complex',fl,'-map','[out]','-an','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r','30',out],check=True)
    segs.append(out)
open('list.txt','w').write(''.join(f"file '{s}'\n" for s in segs))
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i','list.txt','-i','mix.m4a','-map','0:v','-map','1:a',
                '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','-shortest','final.mp4'],check=True)
print('done')
