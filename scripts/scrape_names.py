"""One-shot scrape of player names from checklistinsider.com.

Run: python scripts/scrape_names.py
"""
import json
import re
import sys
from pathlib import Path

try:
    import cloudscraper
except ImportError:
    print("Run: pip install cloudscraper", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "sticker-names.json"
OUT.parent.mkdir(exist_ok=True)

URL = "https://www.checklistinsider.com/2026-panini-fifa-world-cup-sticker"

PATTERN = re.compile(
    r"\b([A-Z]{2,3}\d{1,3})\s+([^<\n]+?)<br",
    re.UNICODE,
)


def clean(name: str) -> str:
    name = re.sub(r"\s+FOIL\s*$", "", name).strip()
    name = re.sub(r"\s+-\s+[^\d]+$", "", name).strip()
    name = re.sub(r"&amp;", "&", name)
    name = re.sub(r"&#?\w+;", "", name).strip()
    return name


def main() -> int:
    s = cloudscraper.create_scraper()
    r = s.get(URL, timeout=30)
    r.raise_for_status()
    names = {}
    for m in PATTERN.finditer(r.text):
        code, raw = m.group(1), m.group(2)
        name = clean(raw)
        if name:
            names[code] = name

    OUT.write_text(json.dumps(names, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    print(f"Saved {len(names)} names to {OUT}")
    for k in ["FWC1", "MEX1", "MEX2", "BRA10", "GER5", "PAN20"]:
        print(f"  {k}: {names.get(k, '(missing)')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
