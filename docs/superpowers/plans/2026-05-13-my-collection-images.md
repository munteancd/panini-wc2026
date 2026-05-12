# „Colecția mea" + Auto-refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Add a "Colecția mea" tab showing real sticker images for owned country stickers, source images from laststicker.com via a Python script, auto-refresh weekly via GitHub Action.

**Architecture:** Static images committed to repo under `images/`. Scrape script in `scripts/`. GitHub Action runs weekly, commits new images, push triggers Pages rebuild. PWA renders tab using `<img src="./images/CODE.jpg" loading="lazy">` with `onerror` placeholder fallback. Service worker caches images on-demand.

**Tech Stack:** Same — HTML/CSS/JS for PWA. Python 3 + cloudscraper for scraping. GitHub Actions for automation.

**Project root:** `D:/Proiecte personale/panini-wc2026/`

---

## Task 1: Scrape script

**Files:**
- Create: `scripts/scrape_images.py`

- [ ] **Step 1: Write the scrape script**

```python
"""Scrape Panini WC2026 sticker images from laststicker.com.

Only country stickers (48 × 20 = 960 codes). Skips FWC and CC (no images on source).
Skips files that already exist. Validates response is a real image before saving.
"""
import sys
import os
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
```

- [ ] **Step 2: Run the script locally to populate `images/`**

```bash
cd "D:/Proiecte personale/panini-wc2026" && pip install cloudscraper Pillow --quiet && python scripts/scrape_images.py
```

Expected: takes ~3-5 minutes (960 requests × ~100ms politeness sleep + network). At the end, summary line like `Coverage: 600/960 (62%)`.

- [ ] **Step 3: Verify the result**

```bash
ls "D:/Proiecte personale/panini-wc2026/images/" | wc -l
du -sh "D:/Proiecte personale/panini-wc2026/images/"
```

Expected: a few hundred files, total size 15-25 MB.

- [ ] **Step 4: Commit script + images**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add scripts/ images/ && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add scrape script and initial sticker images"
```

---

## Task 2: GitHub Action for weekly refresh

**Files:**
- Create: `.github/workflows/refresh-images.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Refresh sticker images

on:
  schedule:
    - cron: '0 6 * * 1'   # every Monday 06:00 UTC
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install cloudscraper

      - name: Scrape new images
        run: python scripts/scrape_images.py

      - name: Commit and push if changed
        run: |
          git config user.name "panini-bot"
          git config user.email "actions@github.com"
          git add images/
          if git diff --cached --quiet; then
            echo "No new images."
            exit 0
          fi
          NEW=$(git diff --cached --name-only | wc -l)
          git commit -m "Refresh sticker images (+$NEW noi)"
          git push
```

- [ ] **Step 2: Commit and push**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add .github/ && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add weekly image refresh GitHub Action"
```

- [ ] **Step 3: Test manually**

After push (next task), go to GitHub → Actions → "Refresh sticker images" → "Run workflow" → Run. Verify the run succeeds. First time it will be a no-op since we just scraped.

---

## Task 3: 5th tab in HTML

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `<section id="tab-collection">` between dupes and missing**

In `index.html`, find:
```html
    <section id="tab-dupes" class="tab"></section>
    <section id="tab-missing" class="tab"></section>
    <section id="tab-settings" class="tab"></section>
```

Replace with:
```html
    <section id="tab-dupes" class="tab"></section>
    <section id="tab-missing" class="tab"></section>
    <section id="tab-collection" class="tab"></section>
    <section id="tab-settings" class="tab"></section>
```

- [ ] **Step 2: Add nav button**

Find:
```html
    <button class="nav-btn" data-tab="missing">❌<span>Lipsă</span></button>
    <button class="nav-btn" data-tab="settings">⚙️<span>Setări</span></button>
```

Replace with:
```html
    <button class="nav-btn" data-tab="missing">❌<span>Lipsă</span></button>
    <button class="nav-btn" data-tab="collection">🖼️<span>Colecția</span></button>
    <button class="nav-btn" data-tab="settings">⚙️<span>Setări</span></button>
```

- [ ] **Step 3: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add index.html && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add Colecția tab to HTML shell"
```

---

## Task 4: renderCollection in app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `renderCollection` function**

In `app.js`, immediately BEFORE `function isValidBackup(obj)`, insert:

```js
const COUNTRY_CODES = new Set([
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI","BRA","MAR","HAI","SCO",
  "USA","PAR","AUS","TUR","GER","CUW","CIV","ECU","NED","JPN","SWE","TUN",
  "BEL","EGY","IRN","NZL","ESP","CPV","KSA","URU","FRA","SEN","IRQ","NOR",
  "ARG","ALG","AUT","JOR","POR","COD","UZB","COL","ENG","CRO","GHA","PAN",
]);

function renderCollection() {
  const root = document.getElementById("tab-collection");
  root.innerHTML = "";

  const intro = document.createElement("p");
  intro.style.color = "var(--muted)";
  intro.style.fontSize = "0.85rem";
  intro.style.margin = "4px 0 12px";
  intro.textContent = "Imaginile sunt agregate de pe laststicker.com (~60% acoperire, crește săptămânal). FWC și Coca-Cola nu sunt disponibile.";
  root.appendChild(intro);

  let totalOwned = 0;
  let renderedAny = false;

  for (const s of SECTIONS) {
    if (!COUNTRY_CODES.has(s.code)) continue;
    const owned = [];
    for (let i = s.start; i <= s.end; i++) {
      const code = s.code + i;
      const state = getState(data, code);
      if (state === "have" || state === "dup") owned.push({ code, state });
    }
    if (!owned.length) continue;
    totalOwned += owned.length;
    renderedAny = true;

    const sec = document.createElement("div");
    sec.className = "section";

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `
      <span class="flag">${s.flag}</span>
      <span class="name">${s.name}</span>
      <span class="count">${owned.length}/${s.end - s.start + 1}</span>
    `;
    sec.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "collection-grid";
    for (const { code, state } of owned) {
      const cell = document.createElement("div");
      cell.className = "collection-cell " + state;
      const img = document.createElement("img");
      img.src = `./images/${code}.jpg`;
      img.alt = code;
      img.loading = "lazy";
      img.onerror = () => {
        const ph = document.createElement("div");
        ph.className = "collection-placeholder";
        ph.textContent = code;
        cell.replaceChild(ph, img);
      };
      const label = document.createElement("div");
      label.className = "collection-label";
      label.textContent = code;
      cell.appendChild(img);
      cell.appendChild(label);
      grid.appendChild(cell);
    }
    sec.appendChild(grid);
    root.appendChild(sec);
  }

  if (!renderedAny) {
    const empty = document.createElement("p");
    empty.style.color = "var(--muted)";
    empty.textContent = "Nu ai bifat încă niciun sticker de țară.";
    root.appendChild(empty);
  } else {
    const tally = document.createElement("p");
    tally.style.color = "var(--muted)";
    tally.style.fontSize = "0.85rem";
    tally.style.marginTop = "12px";
    tally.textContent = `Total țări bifate: ${totalOwned} stickere.`;
    root.appendChild(tally);
  }
}
```

- [ ] **Step 2: Wire `switchTab` to render collection**

In `app.js`, find:
```js
  if (name === "dupes") renderDupes();
  if (name === "missing") renderMissing();
  if (name === "settings") renderSettings();
```

Replace with:
```js
  if (name === "dupes") renderDupes();
  if (name === "missing") renderMissing();
  if (name === "collection") renderCollection();
  if (name === "settings") renderSettings();
```

- [ ] **Step 3: Syntax check + commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && node --check app.js && git add app.js && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add Colecția tab rendering"
```

---

## Task 5: CSS for collection grid

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append CSS to `styles.css`**

```css

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  padding: 4px 8px 10px;
}

.collection-cell {
  background: var(--missing);
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
}

.collection-cell.have { border-color: var(--have); }
.collection-cell.dup  { border-color: var(--dup); }

.collection-cell img,
.collection-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1.4;
  object-fit: cover;
  display: block;
  background: var(--missing);
}

.collection-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.collection-label {
  font-size: 0.7rem;
  text-align: center;
  padding: 2px 0;
  color: var(--text);
  background: rgba(0,0,0,0.25);
}
```

- [ ] **Step 2: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add styles.css && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add styles for Colecția grid"
```

---

## Task 6: Service worker — cache images on demand + bump version

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Update `sw.js` to handle `/images/*` separately**

Replace the entire content of `sw.js` with:

```js
const CACHE_VERSION = "panini-wc26-v3";
const IMAGES_CACHE = "panini-wc26-images-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== IMAGES_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Images: network-first, fall back to cache; populate cache on success.
  if (url.pathname.includes("/images/")) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(IMAGES_CACHE).then((c) => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else: cache-first.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

- [ ] **Step 2: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add sw.js && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Bump SW to v3, add network-first image cache"
```

---

## Task 7: README disclaimer

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append a "Images" section**

Use Edit to add to the end of `README.md`:

```markdown

## Images

Sticker images under `images/` are scraped from [laststicker.com](https://www.laststicker.com/ro/cards/panini_world_cup_2026/).
They are © Panini / FIFA and used here strictly for personal, non-commercial tracking.
Coverage grows over time as the community uploads new ones — a weekly GitHub Action refreshes the folder automatically.
```

- [ ] **Step 2: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add README.md && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Document image source and copyright"
```

---

## Task 8: Push + verify deploy + trigger Action

**Files:** none

- [ ] **Step 1: Push all commits**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git push
```

- [ ] **Step 2: Wait for Pages deploy**

Poll until live (new app.js with renderCollection):
```bash
until curl -s https://munteancd.github.io/panini-wc2026/app.js | grep -q "renderCollection"; do sleep 8; done && echo "LIVE"
```

- [ ] **Step 3: Trigger the Action manually**

```bash
gh workflow run "Refresh sticker images" --repo munteancd/panini-wc2026
```

Wait ~30s and verify:
```bash
gh run list --workflow="Refresh sticker images" --repo munteancd/panini-wc2026 --limit 1
```

Should show recent run, status `completed`, conclusion `success`.

---

## Done

App is updated:
- 5 tabs (Album / Dubluri / Lipsă / Colecția / Setări)
- Real sticker thumbnails in „Colecția mea" for owned country stickers
- Placeholder for missing images
- Weekly auto-refresh of image folder via GitHub Action
