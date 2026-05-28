#!/usr/bin/env python3
"""Rebuild data/matches.json from Wikipedia (2026 FIFA World Cup).

Fetches the 12 group sub-articles + knockout + final articles, parses the
football-box templates, converts kickoff times to Romania time (EEST, UTC+3),
and writes data/matches.json. Knockout teams stay as placeholders ("Locul 2
Gr. A", "Câștig. M97"...) until Wikipedia fills in the real teams, at which
point this script picks them up automatically.

No external dependencies (stdlib only). Safe: only writes if it parsed a
plausible number of matches.
"""

import re
import json
import datetime
import os
import sys
import urllib.request

UA = "panini-wc26-bot/1.0 (schedule refresh; +https://github.com/munteancd/panini-wc2026)"
RAW = "https://en.wikipedia.org/wiki/{}?action=raw"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "matches.json")


def fetch(title):
    url = RAW.format(title)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def parse_time(t):
    t = t.replace("&nbsp;", " ").replace("−", "-")  # unicode minus -> ascii
    m = re.search(r"(\d{1,2}):(\d{2})\s*([ap])\.m\.", t)
    hh, mm, ap = int(m.group(1)), int(m.group(2)), m.group(3)
    if ap == "p" and hh != 12:
        hh += 12
    if ap == "a" and hh == 12:
        hh = 0
    off = re.search(r"UTC(-?\d{1,2}):?(\d{2})?", t)
    oh = int(off.group(1))
    om = int(off.group(2) or 0)
    return hh, mm, oh, om


def to_ro(y, mo, d, hh, mm, oh, om):
    local = datetime.datetime(y, mo, d, hh, mm)
    utc = local - datetime.timedelta(hours=oh, minutes=om)
    ro = utc + datetime.timedelta(hours=3)  # Europe/Bucharest in Jun-Jul = EEST
    return ro.strftime("%Y-%m-%d"), ro.strftime("%H:%M")


def clean_stadium(st):
    st = re.sub(r"\[\[([^\]|]+\|)?([^\]]+)\]\]", r"\2", st).strip()
    parts = [p.strip() for p in st.split(",")]
    return parts[0], (parts[1] if len(parts) > 1 else "")


def stage_for(n):
    if n <= 72:
        return "group"
    if n <= 88:
        return "R32"
    if n <= 96:
        return "R16"
    if n <= 100:
        return "QF"
    if n <= 102:
        return "SF"
    if n == 103:
        return "3rd"
    return "Final"


def ro_label(s):
    s = s.strip()
    s = re.sub(r"Runners?-up Group ([A-L])", r"Locul 2 · Gr. \1", s)
    s = re.sub(r"Winners? Group ([A-L])", r"Câștig. · Gr. \1", s)
    s = re.sub(r"3rd Group ([A-L/]+)", r"Locul 3 · Gr. \1", s)
    s = re.sub(r"Winners? Match (\d+)", r"Câștig. M\1", s)
    s = re.sub(r"Losers? Match (\d+)", r"Învinsă M\1", s)
    return s


def parse_group(txt, g, matches):
    for b in re.findall(r"football box\|main(.*?)\n}}", txt, re.S):
        dm = re.search(r"\|date=\{\{Start date\|(\d+)\|(\d+)\|(\d+)\}\}", b)
        if not dm:
            continue
        y, mo, d = map(int, dm.groups())
        hh, mm, oh, om = parse_time(re.search(r"\|time=(.*)", b).group(1))
        date, time = to_ro(y, mo, d, hh, mm, oh, om)
        t1 = re.search(r"\|team1=\{\{#invoke:flag\|fb-rt\|(\w+)\}\}", b)
        t2 = re.search(r"\|team2=\{\{#invoke:flag\|fb\|(\w+)\}\}", b)
        num = int(re.search(r"\|Match (\d+)", b).group(1))
        stadium, city = clean_stadium(re.search(r"\|stadium=(.*)", b).group(1))
        matches.append({
            "n": num, "stage": "group", "group": g, "date": date, "time": time,
            "team1": t1.group(1) if t1 else None,
            "team2": t2.group(1) if t2 else None,
            "label1": None, "label2": None, "stadium": stadium, "city": city,
        })


def parse_knockout(txt, matches):
    for b in re.findall(r"football box\|main(.*?)\n}}", txt, re.S):
        dm = re.search(r"\|date=\{\{Start date\|(\d+)\|(\d+)\|(\d+)\}\}", b)
        if not dm:
            continue
        y, mo, d = map(int, dm.groups())
        hh, mm, oh, om = parse_time(re.search(r"\|time=(.*)", b).group(1))
        date, time = to_ro(y, mo, d, hh, mm, oh, om)
        num = int(re.search(r"\|Match (\d+)", b).group(1))

        def side(s):
            m = re.search(r"\|team" + s + r"=(?:<!--.*?-->)?\s*([^\n|]*)", b)
            return m.group(1).strip() if m else ""

        # team can be a real flag code once decided, else a placeholder label
        def resolve(s):
            raw = side(s)
            code = re.search(r"\{\{#invoke:flag\|fb(?:-rt)?\|(\w+)\}\}", raw)
            if code:
                return code.group(1), None
            return None, ro_label(re.sub(r"<!--.*?-->", "", raw))

        c1, l1 = resolve("1")
        c2, l2 = resolve("2")
        stadium, city = clean_stadium(re.search(r"\|stadium=(.*)", b).group(1))
        matches.append({
            "n": num, "stage": stage_for(num), "group": None, "date": date, "time": time,
            "team1": c1, "team2": c2, "label1": l1, "label2": l2,
            "stadium": stadium, "city": city,
        })


def main():
    matches = []
    for g in "ABCDEFGHIJKL":
        parse_group(fetch(f"2026_FIFA_World_Cup_Group_{g}"), g, matches)
    ko = fetch("2026_FIFA_World_Cup_knockout_stage") + "\n" + fetch("2026_FIFA_World_Cup_final")
    parse_knockout(ko, matches)

    seen = {}
    for m in matches:
        seen[m["n"]] = m
    matches = sorted(seen.values(), key=lambda m: m["n"])

    groups = sum(1 for m in matches if m["stage"] == "group")
    if groups < 72:
        print(f"ERROR: only parsed {groups} group matches (<72). Aborting, not writing.", file=sys.stderr)
        sys.exit(1)

    data = {"timezone": "Europe/Bucharest (EEST, UTC+3)", "matches": matches}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(matches)} matches ({groups} group, {len(matches) - groups} knockout) to {OUT}")


if __name__ == "__main__":
    main()
