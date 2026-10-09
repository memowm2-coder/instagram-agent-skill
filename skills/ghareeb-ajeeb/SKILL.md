---
name: ghareeb-ajeeb
description: >-
  Run the غريب عجيب (Ghareeb Ajeeb) documentary production pipeline for Maryam
  Studios: topic greenlight, research, fact verification with a claim ledger,
  story spine, script, storyboard, beat and scene breakdowns, motion and paper
  collage plans, asset list, thumbnail and cover, caption, publishing checklist
  and performance review, all against the show bible. Use whenever the user
  mentions غريب عجيب, Ghareeb Ajeeb, a "ملف" / file number, Maryam Studios, or
  asks to develop, script, storyboard, review or publish an episode of the show.
---

# ghareeb-ajeeb

Runs one file (episode) of غريب عجيب through the 14-stage pipeline. The show
bible is the source of truth and lives in `shows/ghareeb-ajeeb/` at the root of
this repo.

## Before anything

1. Read `shows/ghareeb-ajeeb/02-show-bible.md` and
   `shows/ghareeb-ajeeb/03-production-system.md`. Every decision cites a section
   of the bible (e.g. "Bible §11").
2. Check `shows/ghareeb-ajeeb/04-creative-director-review.md`. **If the sign-off
   table is not marked approved by the user, do not write an episode script.**
   You may still do research and topic scoring. Say so plainly.
3. Find or create the episode folder `episodes/{NNN}-{slug}/` and copy in the
   templates from `shows/ghareeb-ajeeb/templates/` as the production system
   lists them.

## The loop

Work stage by stage. At each stage: fill the template, show the user the
output, check the **gate** from `03-production-system.md`, and stop for
approval before the next stage. Never skip a gate, and never mark one passed
that you haven't checked.

| Stage | Do | Gate you enforce |
| --- | --- | --- |
| 1 Research | Score the topic (Greenlight ≥ 22/30, nothing < 3). Find leads, then go to the primary or T1/T2 source for each | A person, a turn, a local angle |
| 2 Fact verification | Fill the Claim Ledger. Grade every claim | 2 independent sources, one T1/T2; no غير مؤكد claim survives |
| 3 Story | Write the 7-beat spine | Majlis Test on paper; the reveal is visual |
| 4 Script | Three hooks of different types (Bible §10), choose with reasons, then the VO in Emirati dialect + separate on-screen text | Every factual line has a Claim ID |
| 5–7 | Storyboard, beat breakdown, scene breakdown | Templates' checks |
| 8–10 | Motion plan, collage plan, asset list | Only T1–T5, the Red Rule, rights status for every asset |
| 11–13 | Thumbnail, cover, caption, publishing checklist | Templates' checks |
| 14 | Performance review from the user's Insights numbers | One written decision |

## Non-negotiables

- **Never invent a fact, a number, a date, a quote or a source.** If a claim
  needs a source you haven't verified, write `{{verify: claim}}` and stop that
  line. Sources you cite must be ones you actually opened. AI output, including
  your own, is never a source (Bible §28, T3).
- **Never-Cover list** (Bible §30) is absolute. Refuse the topic and say which rule.
- **Confidence language** must match the ledger grade (Bible §28.3).
- **Maryam's voice:** Emirati dialect, warm, curious, second person. No
  greetings, no "هل تعلم", no "صدق أو لا تصدق", no "تابعوني".
- **Nothing is posted by this skill.** It prepares; the user publishes.

## Tools in this repo, and their limits on Arabic

- `skills/ig-reel/beats.py script.txt --wpm {measured} --target {s}`: the timing
  maths works, but its default WPM and its "concrete detail" checks are tuned for
  English. Always pass Maryam's **measured** Arabic WPM and judge the flags by eye.
- `skills/ig-caption/caption.py caption.txt`: the 125-character feed preview is
  valid for Arabic. Its hashtag counter doesn't detect Arabic hashtags, so
  count them yourself (max 5).
- `skills/ig-reel/hookscore.py` and `skills/ig-human/*`: English lexicons.
  **Do not use them to score Arabic text.** Score hooks against Bible §10 instead.

## Output at the end of each stage

```
ملف {NNN} · {slug} · STAGE {n} {name}
gate:      PASS / FAIL (why)
open:      {{verify}} items, missing assets, questions for Maryam
next:      stage {n+1}, waiting for "yes"
```
