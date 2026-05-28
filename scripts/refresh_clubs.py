#!/usr/bin/env python3
"""Rebuild data/clubs.json: map each album sticker (player) to their club.

Sources club info from Wikipedia "2026 FIFA World Cup squads" and matches it
against the player names in data/sticker-names.json (by normalized name).
Coverage grows as national squads are announced. Stdlib only.

Only writes if it matched a plausible number of players, so a half-published
squads page never wipes existing data.
"""

import re
import json
import os
import sys
import unicodedata
import urllib.request

UA = "panini-wc26-bot/1.0 (clubs refresh; +https://github.com/munteancd/panini-wc2026)"
SQUADS_URL = "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads?action=raw"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMES = os.path.join(ROOT, "data", "sticker-names.json")
OUT = os.path.join(ROOT, "data", "clubs.json")


def norm(s):
    s = s.replace("�", "")  # drop replacement chars from broken names
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-zA-Z ]", " ", s).lower()
    return re.sub(r"\s+", " ", s).strip()


def disp_link(x):
    x = x.strip()
    if "|" in x:
        x = x.split("|", 1)[1]
    x = re.sub(r"\[\[|\]\]", "", x)
    x = re.sub(r"\s*\(.*?\)", "", x)
    return x.strip()


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def main():
    sq = fetch(SQUADS_URL)
    name2club = {}
    for m in re.finditer(r"name=(\[\[.*?\]\]).*?club=(\[\[.*?\]\])", sq):
        name2club[norm(disp_link(m.group(1)))] = disp_link(m.group(2))

    names = json.load(open(NAMES, encoding="utf-8"))
    code2club = {}
    for code, player in names.items():
        if re.search(r"logo|photo|badge", player.lower()):
            continue
        club = name2club.get(norm(player))
        if club:
            code2club[code] = club

    if len(code2club) < 300:
        print(f"ERROR: only matched {len(code2club)} players (<300). Aborting.", file=sys.stderr)
        sys.exit(1)

    json.dump(code2club, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Wrote {len(code2club)} player->club mappings to {OUT}")


if __name__ == "__main__":
    main()
