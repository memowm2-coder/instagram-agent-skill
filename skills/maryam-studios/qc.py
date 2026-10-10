#!/usr/bin/env python3
"""
qc.py - the Maryam Studios script check. Run it before an episode is approved.

Checks a script against its show's bible (shows.md):

  hacks   the fixed opening, rush and closing lines, word for word
  gharib  the eight-beat order, a ليش question early, a source, 30-60s
  basata  a source with a checked date, no government PR language, 30-60s
  all     no greeting opener, no stock creator phrases, no unfilled
          {{...}} placeholders, length inside the show's range

Script format: one spoken line per line. Lines starting with "[" are beat
tags or directions, lines starting with "(" are directions, "#" is a comment.
A speaker prefix such as "مريم:" or "صوت:" is allowed and not counted as
spoken. A line starting with "source:" or "المصدر:" records the source.

The timing is an estimate from word count. Gulf Arabic on camera runs around
120 to 140 words a minute because Arabic words carry more per word than
English ones; the default is 130. Time Maryam reading a script once and pass
--wpm with the real number.

Usage
  python3 qc.py script.txt --show gharib
  python3 qc.py script.txt --show hacks --wpm 125
  python3 qc.py script.txt --json
  (the show can also be a first line "show: gharib")
"""

import argparse
import json
import re
import sys

TASHKEEL = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]")
WORD_RE = re.compile(r"[\w؀-ۿ]+")
SPEAKER_RE = re.compile(r"^\s*[^\s:]{1,12}\s*:\s*")
SOURCE_RE = re.compile(r"^\s*(source|sources|المصدر|المصادر)\s*:\s*(.*)$", re.I)
SHOW_RE = re.compile(r"^\s*show\s*:\s*(\w+)", re.I)
TAG_RE = re.compile(r"^\s*\[([A-Z]+)\]")
PLACEHOLDER_RE = re.compile(r"\{\{.*?\}\}")
DATE_RE = re.compile(r"\b(19|20)\d{2}\b|[٠-٩]{4}")

SHOWS = {
    "gharib": {
        "name": "غريب عجيب",
        "range": (30, 60),
        "ideal": (35, 50),
        "order": ["INTERRUPT", "QUESTION", "MYSTERY", "STORY",
                  "REVEAL", "EXPLAIN", "TWIST", "END"],
        "source": True,
    },
    "hacks": {
        "name": "مريم هاكس",
        "range": (15, 35),
        "ideal": (18, 30),
        "order": ["OPEN", "RUSH", "HACK", "PROOF", "CLOSE"],
        "source": False,
    },
    "basata": {
        "name": "بكل بساطة",
        "range": (30, 60),
        "ideal": (35, 50),
        "order": ["HOOK", "STAKE", "STEPS", "CATCH", "END"],
        "source": True,
    },
}
ALIASES = {
    "غريب": "gharib", "غريب_عجيب": "gharib", "mystery": "gharib",
    "هاكس": "hacks", "hack": "hacks",
    "بساطة": "basata", "simply": "basata",
}

# The fixed lines of مريم هاكس, normalised. Order matters.
HACKS_OPEN = ["مريم مريم", "هلا", "ممكن تعطينا هاك اليوم"]
HACKS_RUSH = ["بسرعه", "يلا تم"]
HACKS_CLOSE = ["عطيتكم الهاك", "والباقي عليكم", "يلا باي"]

GREETINGS = [
    "السلام عليكم", "مرحبا", "هلا والله", "هلا وغلا", "هاي", "صباح الخير",
    "مساء الخير", "اهلا وسهلا", "يا هلا", "هلا فيكم", "هلا يا جماعه",
]
STOCK = {
    "في هذا الفيديو": "Preamble. Start at the sentence after it.",
    "فيديو اليوم": "Preamble. Start at the sentence after it.",
    "تابعوني": "Follow-bait inside the episode. The work earns the follow.",
    "لا تنسون": "Reflex ask. Cut it.",
    "لايك": "Asking for likes. Never inside an episode.",
    "اشتراك": "Asking to subscribe. Never inside an episode.",
    "شير": "Asking for shares. Make it worth sending instead.",
    "لا تسحب": "\"Don't scroll\" proves you have not earned the stop.",
    "وقف لا تسكرول": "\"Don't scroll\" proves you have not earned the stop.",
    "عاجل": "News-presenter language. Maryam is a show host.",
    "اعزائي المتابعين": "Presenter language. Talk to one person.",
    "اعزائي المشاهدين": "Presenter language. Talk to one person.",
    "معلومه ممكن ما تعرفها": "Template opener. Show the strange thing instead.",
    "هل تعلم": "Wikipedia opener. Tell a story instead.",
}
PR_LANGUAGE = {
    "في اطار": "Press-release phrasing. Say what it does for the person.",
    "تماشيا مع": "Press-release phrasing.",
    "يسرنا": "Press-release phrasing.",
    "يسعدنا": "Press-release phrasing.",
    "بهدف تعزيز": "Press-release phrasing.",
    "نعلن": "Announcement. بكل بساطة explains, it does not announce.",
    "حرصا على": "Press-release phrasing.",
}
WHY = re.compile(r"(?<!\w)(ليش|ليه|لماذا|شمعني)(?!\w)")


def norm(text):
    t = TASHKEEL.sub("", text)
    t = re.sub("[إأآٱ]", "ا", t)
    t = t.replace("ى", "ي").replace("ة", "ه")
    t = t.replace("…", " ").replace("...", " ")
    t = re.sub("[،؛؟٪«»]", " ", t)
    t = re.sub(r"[^\w\s؀-ۿ]", " ", t)
    return re.sub(r"\s+", " ", t).strip().lower()


def parse(raw):
    show, sources, beats, spoken, placeholders = None, [], [], [], []
    current = None
    for i, line in enumerate(raw.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        placeholders += PLACEHOLDER_RE.findall(s)
        m = SHOW_RE.match(s)
        if m and show is None and not spoken:
            show = m.group(1).lower()
            continue
        m = SOURCE_RE.match(s)
        if m:
            sources.append(m.group(2).strip())
            continue
        m = TAG_RE.match(s)
        if m:
            current = m.group(1)
            beats.append(current)
            rest = s[m.end():].strip()
            if not rest or rest.startswith("("):
                continue
            s = rest
        if s.startswith("("):
            continue
        text = SPEAKER_RE.sub("", s)
        text = re.sub(r"\(.*?\)", " ", text)
        if text.strip():
            spoken.append({"line": i, "beat": current, "text": text.strip()})
    return show, sources, beats, spoken, placeholders


def contains_in_order(lines, needles):
    """Each needle appears, in order, across the normalised lines."""
    joined = " | ".join(norm(l) for l in lines)
    pos = 0
    missing = []
    for n in needles:
        k = joined.find(n, pos)
        if k < 0:
            missing.append(n)
        else:
            pos = k + len(n)
    return missing


def check(raw, show_arg, wpm):
    show, sources, beats, spoken, placeholders = parse(raw)
    show = ALIASES.get(show_arg or "", show_arg) or ALIASES.get(show or "", show)
    if show not in SHOWS:
        raise SystemExit(
            "Which show? Pass --show gharib|hacks|basata or put 'show: ...' "
            "on the first line. If it fits none of the three, it is not a "
            "Maryam episode.")
    spec = SHOWS[show]
    results = []

    def add(level, name, msg):
        results.append({"level": level, "check": name, "message": msg})

    texts = [s["text"] for s in spoken]
    nwords = sum(len(WORD_RE.findall(t)) for t in texts)
    secs = nwords / wpm * 60 if wpm else 0
    lo, hi = spec["range"]
    ilo, ihi = spec["ideal"]
    if not spoken:
        add("FAIL", "SCRIPT", "No spoken lines found.")
    elif secs < lo or secs > hi:
        add("FAIL", "LENGTH",
            f"~{secs:.0f}s ({nwords} words at {wpm} wpm). {spec['name']} "
            f"runs {lo}-{hi}s.")
    elif secs < ilo or secs > ihi:
        add("WARN", "LENGTH",
            f"~{secs:.0f}s. Inside the range, outside the ideal {ilo}-{ihi}s.")
    else:
        add("PASS", "LENGTH", f"~{secs:.0f}s, {nwords} words at {wpm} wpm")

    # Beat order, when the script is tagged.
    if beats:
        expected = spec["order"]
        unknown = [b for b in beats if b not in expected]
        seen = [b for b in beats if b in expected]
        dedup = [b for k, b in enumerate(seen) if k == 0 or seen[k - 1] != b]
        missing = [b for b in expected if b not in seen]
        ordered = dedup == [b for b in expected if b in dedup]
        if unknown:
            add("WARN", "BEATS", f"Unknown tags for this show: {', '.join(unknown)}")
        if missing:
            add("FAIL", "BEATS", f"Missing beats: {', '.join(missing)}")
        elif not ordered:
            add("FAIL", "BEATS",
                f"Out of order. The show runs {' > '.join(expected)}")
        else:
            add("PASS", "BEATS", " > ".join(expected))
    else:
        add("WARN", "BEATS",
            "No beat tags. Tag each beat ([" + "] [".join(spec["order"])
            + "]) so the order can be checked.")

    # Openers and stock phrases.
    if spoken and show != "hacks":
        first = norm(spoken[0]["text"])
        hit = next((g for g in GREETINGS
                    if re.match(re.escape(norm(g)) + r"(?!\w)", first)), None)
        if hit:
            add("FAIL", "OPENER",
                f'Opens on a greeting ("{hit}"). The first frame is the story.')
        else:
            add("PASS", "OPENER", "no greeting")
    body = norm(" \n ".join(texts))
    for phrase, why in STOCK.items():
        if re.search(r"(?<!\w)(?:ال|و|ف)?" + re.escape(norm(phrase)) + r"(?!\w)", body):
            add("FAIL", "STOCK", f'"{phrase}": {why}')

    if placeholders:
        add("FAIL", "UNFILLED",
            f"{len(placeholders)} placeholder(s) still open: "
            + ", ".join(placeholders[:4])
            + ". Not approved until every one is verified and filled.")

    # Sources.
    if spec["source"]:
        real = [s for s in sources if s and not PLACEHOLDER_RE.search(s)]
        if not real:
            add("FAIL", "SOURCE",
                "No source line. Add 'source: ...' with the primary source. "
                "Nothing unverified ships.")
        else:
            add("PASS", "SOURCE", f"{len(real)} source(s)")
            if show == "basata" and not any(DATE_RE.search(s) for s in real):
                add("WARN", "SOURCE DATE",
                    "Service details change. Add the date the source was "
                    "checked, e.g. '(checked 2026-10-09)'.")

    # Show-specific.
    if show == "hacks":
        early = texts[:6]
        late = texts[-5:]
        miss = contains_in_order(early, [norm(x) for x in HACKS_OPEN])
        if miss:
            add("FAIL", "SIGNATURE OPEN",
                "The opening must be, word for word: مريم... مريم... / هلا. / "
                "ممكن تعطينا هاك اليوم؟  Missing: " + ", ".join(miss))
        else:
            add("PASS", "SIGNATURE OPEN", "مريم... مريم... / هلا / هاك اليوم")
        miss = contains_in_order(texts, [norm(x) for x in HACKS_RUSH])
        if miss:
            add("FAIL", "SIGNATURE RUSH",
                'Needs "بسرعة" answered by "يلا تم."  Missing: ' + ", ".join(miss))
        else:
            add("PASS", "SIGNATURE RUSH", "بسرعة / يلا تم")
        miss = contains_in_order(late, [norm(x) for x in HACKS_CLOSE])
        if miss:
            add("FAIL", "SIGNATURE CLOSE",
                "The ending must be: عطيتكم الهاك... والباقي عليكم... يلا باي. "
                "Missing: " + ", ".join(miss))
        else:
            add("PASS", "SIGNATURE CLOSE", "عطيتكم الهاك... يلا باي")

    if show == "gharib" and spoken:
        cut = max(2, len(texts) // 4)
        if any(WHY.search(norm(t)) for t in texts[:cut]):
            add("PASS", "WHY", "the ليش؟ lands in the first quarter")
        elif any(WHY.search(norm(t)) for t in texts):
            add("WARN", "WHY", "The ليش؟ comes late. Ask it in the first 5 seconds.")
        else:
            add("FAIL", "WHY", "Every غريب عجيب answers ليش؟ and this one never asks it.")
        reveal = next((k for k, x in enumerate(spoken) if x["beat"] == "REVEAL"), None)
        if reveal is not None and reveal < len(spoken) * 0.4:
            add("WARN", "SUSPENSE",
                "The reveal arrives in the first 40% of the lines. Make them wait.")

    if show == "basata":
        hits = [(p, w) for p, w in PR_LANGUAGE.items()
                if re.search(r"(?<!\w)" + re.escape(norm(p)) + r"(?!\w)", body)]
        for p, w in hits:
            add("FAIL", "PR LANGUAGE", f'"{p}": {w}')
        if not hits:
            add("PASS", "PR LANGUAGE", "none")

    verdict = "FAIL" if any(r["level"] == "FAIL" for r in results) else "PASS"
    return {"show": show, "name": spec["name"], "words": nwords,
            "seconds": round(secs, 1), "verdict": verdict, "results": results}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("file", help="script file, or - for stdin")
    ap.add_argument("--show", help="gharib | hacks | basata")
    ap.add_argument("--wpm", type=int, default=130)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    raw = sys.stdin.read() if a.file == "-" else open(a.file, encoding="utf-8").read()
    r = check(raw, a.show.lower() if a.show else None, a.wpm)
    if a.json:
        print(json.dumps(r, ensure_ascii=False, indent=2))
        return 0 if r["verdict"] == "PASS" else 1
    print(f"MARYAM STUDIOS QC  ·  {r['name']}  ·  {r['words']} words  ·  ~{r['seconds']}s")
    print("=" * 72)
    order = {"FAIL": 0, "WARN": 1, "PASS": 2}
    for x in sorted(r["results"], key=lambda x: order[x["level"]]):
        print(f"  {x['level']:<5} {x['check']:<16} {x['message']}")
    print("-" * 72)
    print(f"  {r['verdict']}" + ("" if r["verdict"] == "PASS"
                                 else "  -  not approved. Fix every FAIL."))
    return 0 if r["verdict"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
