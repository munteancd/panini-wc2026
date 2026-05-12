"""Scrape Panini WC2026 sticker images from laststicker.com.

Only country stickers (48 x 20 = 960 codes). Skips FWC and CC (no images on source).
Skips files that already exist. Validates response is a real image before saving.
"""
import sys
import time
from pathlib import Path

try:
    import cloudscraper
except ImportError:
    print("Run: pip install cloudscraper", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "images"
IMG_DIR.mkdir(exist_ok=True)

COUNTRY_CODES = [
    "mex","rsa","kor","cze","can","bih","qat","sui","bra","mar","hai","sco",
    "usa","par","aus","tur","ger","cuw","civ","ecu","ned","jpn","swe","tun",
    "bel","egy","irn","nzl","esp","cpv","ksa","uru","fra","sen","irq","nor",
    "arg","alg","aut","jor","por","cod","uzb","col","eng","cro","gha","pan",
]

BASE = "https://www.laststicker.com/i/cards/12176/{}.jpg"
MIN_BYTES = 4000  # 404 page is ~946 bytes; real images are 20-40 KB


def is_image(data: bytes) -> bool:
    return data.startswith(b"\xff\xd8\xff") and len(data) >= MIN_BYTES


def main() -> int:
    s = cloudscraper.create_scraper()
    already = 0
    added = 0
    missing = 0

    for country in COUNTRY_CODES:
        for n in range(1, 21):
            code_upper = f"{country.upper()}{n}"
            target = IMG_DIR / f"{code_upper}.jpg"
            if target.exists():
                already += 1
                continue
            url = BASE.format(f"{country}{n}")
            try:
                r = s.get(url, timeout=20)
            except Exception as e:
                print(f"  {code_upper}: error {e}")
                missing += 1
                continue
            if r.status_code == 200 and is_image(r.content):
                target.write_bytes(r.content)
                added += 1
                print(f"  + {code_upper} ({len(r.content)} bytes)")
            else:
                missing += 1
            time.sleep(0.1)  # be polite

    total = 48 * 20
    coverage = already + added
    print()
    print(f"Already on disk: {already}")
    print(f"Added now:       {added}")
    print(f"Still missing:   {missing}")
    print(f"Coverage:        {coverage}/{total} ({coverage*100//total}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
