# 03 · The Production System

**غريب عجيب · Maryam Studios · Show Bible, part 3 of 4**

Every file goes through the same 14 stages, in the same order, with the same
gates. A stage isn't done until its **gate** is passed and its **output** is
saved in the episode folder.

---

## The episode folder

```
episodes/
  007-alo/
    01-research.md          ← templates/research.md
    02-script.md            ← templates/script.md (story, script, beats, scenes)
    03-storyboard.md        ← templates/storyboard.md
    04-motion.md            ← templates/motion.md (motion plan, collage plan, asset list)
    05-thumbnail-cover.md   ← templates/thumbnail.md + templates/cover.md
    06-edit-qc.md           ← templates/editing-checklist.md
    07-publish.md           ← templates/publishing-checklist.md (caption included)
    08-review.md            ← templates/performance-review.md
    assets/                 scans, photos, archival files with rights proof
    project/                edit and motion project files
```

Naming: `{file number 3 digits}-{one english slug word}`.

## The pipeline

| # | Stage | Owner | Input | Output | Gate (must be true to move on) | Time |
| -: | --- | --- | --- | --- | --- | --- |
| 1 | **Research** | Researcher | Greenlit question | `01-research.md` sections A–D | ≥ 8 leads pulled to source; the story has a person, a turn, a local angle | 4–5 h |
| 2 | **Fact Verification** | Fact-checker (≠ writer) | Research brief | Claim Ledger complete | Every claim has 2 sources (one T1/T2) and a grade; no "غير مؤكد" claim survives | 1.5–2 h |
| 3 | **Story Development** | Showrunner (Maryam) + writer | Verified ledger | The 7-beat **story spine** (one line per beat) | Passes the Majlis Test on paper; the reveal is *visual* | 1 h |
| 4 | **Script** | Writer, voiced by Maryam | Story spine | `02-script.md`: VO + on-screen text, three scored hooks | Read aloud by Maryam at speed; within target length; every line in the ledger | 2 h |
| 5 | **Storyboard** | Director / designer | Script | `03-storyboard.md`: one frame per beat | Every beat has a picture; layout codes L1–L7 assigned; the Cut is drawn | 2 h |
| 6 | **Beat Breakdown** | Editor | Script + storyboard | Timed beat table in `02-script.md` | No beat over 4 s without a visual change; answer after 60% | 30 min |
| 7 | **Scene Breakdown** | Director | Beats | Scene table: camera A/B, props, setup | Shoot list grouped by camera setup | 45 min |
| 8 | **Motion Graphics Plan** | Motion designer | Scenes | `04-motion.md` section A | Every move uses sanctioned transitions (T1–T5), the Red Rule is respected | 1 h |
| 9 | **Paper Collage Plan** | Collage artist (can be Maryam) | Motion plan | `04-motion.md` section B | Cut vs torn edges assigned by meaning; people B&W; ≤ 4 layers | 1 h |
| 10 | **Asset List** | Producer | Motion + collage plans | `04-motion.md` section C | Every asset has a source and a **rights status**; nothing "TBD" at shoot day | 30 min |
| — | *Shoot + record + build + edit* | Crew | All above | Picture lock | `06-edit-qc.md` all green | 8–12 h |
| 11 | **Thumbnail** (and cover) | Designer | Picture lock | `05-thumbnail-cover.md` + exported files | Frame 0 and 3:4 cover pass the checks in the template | 1 h |
| 12 | **Caption** | Writer | Final cut | Caption block in `07-publish.md` | First 125 characters carry the question; sources listed; one ask | 30 min |
| 13 | **Publishing** | Producer | All above | Posted, logged | Every box in the publishing checklist | 30 min |
| 14 | **Performance Review** | Showrunner + producer | 48 h and 7 d data | `08-review.md` | One decision written down: keep / change / test next | 45 min |

**Realistic total: about 25–30 working hours per file.** Plan the calendar around that.

## Gates that can send a file backwards

| Found at | Problem | Goes back to |
| --- | --- | --- |
| Fact Verification | Core claim can't reach الأرجح | **Kill or reframe the topic.** Don't write around it. |
| Story Development | No visual reveal possible | Research (R5 visual research) |
| Script | Over length by > 15% | Story: cut a clue, never speed up the read |
| Storyboard | A beat has nothing to show | Script: rewrite the beat around something showable |
| Edit QC | Fails the Majlis or Mute Test | Script/edit, whichever is weaker |
| Any stage | A new fact enters | Fact Verification for that claim, before it goes in |

## The weekly rhythm (once a season is running)

Three files are always in motion: one in research, one in production, one in
post. **Bank three finished files before launching a season.**

| Day | File N (publishing) | File N+1 (production) | File N+2 (development) |
| --- | --- | --- | --- |
| Sun | Final QC | Storyboard, breakdowns | Research |
| Mon | Thumbnail, caption | Motion and collage plans, asset list | Research |
| Tue | **Publish** (fixed slot) | Shoot desk + Maryam | Fact verification |
| Wed | Comments: first 2 h live | Edit | Story development |
| Thu | 48 h review | Edit, motion build | Script |
| Fri–Sat | — | Edit QC | — |
| +7 d | 7-day review | | |

*(The publish day is a placeholder. Choose the slot using the Insights data on
when your audience is active, then never move it during a season.)*

## Season structure

- **مجلد (Volume) = 8 files** + a trailer (ملف ٠٠٠) + a season recap carousel.
- **Pillar rotation across 8 files:** P2, P1, P3, P4, P1, P3, P2, P3. The
  architect pillar (P3) appears three times because it's the moat.
- **Two-week break between seasons.** Use it for the community-question drive,
  the texture library and Paper Maryam reshoots.

## How the Claude skill fits

`skills/ghareeb-ajeeb/SKILL.md` runs this pipeline stage by stage with
Claude. It reads this Bible, fills the templates, refuses to move past a failed
gate, and never invents a fact or a source. It reuses the repo's existing tools
where they apply (`beats.py` for timing, `caption.py` for the 125-character
window) and flags where they're English-tuned and need an Arabic check by eye.
