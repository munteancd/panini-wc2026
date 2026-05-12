# Preview + Progress + Names — Implementation Plan

**Goal:** Add long-press preview modal, per-country progress bar, and player names from checklistinsider.

**Architecture:** All client-side, vanilla JS. New scrape script for names (one-shot). New `data/sticker-names.json`. Modal added to index.html. Styles for progress bar and modal.

**Project root:** `D:/Proiecte personale/panini-wc2026/`

---

## Task 1: Scrape player names from checklistinsider

**Files:**
- Create: `scripts/scrape_names.py`
- Create: `data/sticker-names.json`

- [ ] **Step 1: Write scrape script**

`scripts/scrape_names.py`:

```python
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

# Format per line: "FWC5 Official Ball FOIL<br />" or "MEX2 Luis Malagón - Mexico<br />"
PATTERN = re.compile(
    r"\b([A-Z]{2,3}\d{1,3})\s+([^<\n]+?)(?:\s+FOIL)?(?:\s+-\s+[A-Z][a-z]+(?:[\s/-][A-Z][a-z]+)*)?\s*<br",
    re.UNICODE,
)


def clean(name: str) -> str:
    name = re.sub(r"\s+FOIL\s*$", "", name).strip()
    name = re.sub(r"\s+-\s+[A-Z][a-zA-Z\s]+$", "", name).strip()
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

    OUT.write_text(json.dumps(names, ensure_ascii=False, indent=2, sort_keys=True))
    print(f"Saved {len(names)} names to {OUT}")
    sample = list(names.items())[:5]
    for k, v in sample:
        print(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Run it**

```bash
cd "D:/Proiecte personale/panini-wc2026" && python scripts/scrape_names.py
```

Expected: line `Saved N names to data/sticker-names.json` where N is 200-994. Sample print should show recognizable names.

- [ ] **Step 3: Spot-check the output**

```bash
python -c "import json; d=json.load(open('D:/Proiecte personale/panini-wc2026/data/sticker-names.json')); print('count:', len(d)); print('MEX2:', d.get('MEX2')); print('FWC1:', d.get('FWC1')); print('BRA10:', d.get('BRA10'))"
```

Expected: `MEX2` close to `Luis Malagón`. If names look wrong (HTML entities, garbage), STOP and refine the regex.

- [ ] **Step 4: Commit script + data**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add scripts/scrape_names.py data/ && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add player names from checklistinsider"
```

---

## Task 2: Load names in app.js + extend album rendering with progress bar

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add `STICKER_NAMES` loader at top of `app.js`**

In `app.js`, immediately AFTER `const STORAGE_KEY = "panini-wc26-data";`, insert:

```js
let STICKER_NAMES = {};
fetch("./data/sticker-names.json")
  .then((r) => (r.ok ? r.json() : {}))
  .then((data) => { STICKER_NAMES = data; })
  .catch(() => {});
```

- [ ] **Step 2: Modify `renderAlbum` to include progress bar after each section header**

In `renderAlbum`, find:
```js
    header.addEventListener("click", () => sec.classList.toggle("collapsed"));
    sec.appendChild(header);
```

Replace with:
```js
    header.addEventListener("click", () => sec.classList.toggle("collapsed"));
    sec.appendChild(header);

    const progress = makeProgressBar(s);
    sec.appendChild(progress);
```

- [ ] **Step 3: Add helper `makeProgressBar` and `updateProgressBar`**

In `app.js`, immediately BEFORE `function sectionCounts(section)`, insert:

```js
function makeProgressBar(section) {
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  bar.dataset.code = section.code;
  updateProgressBar(bar, section);
  return bar;
}

function updateProgressBar(bar, section) {
  const total = section.end - section.start + 1;
  let have = 0, dup = 0;
  for (let i = section.start; i <= section.end; i++) {
    const v = data.stickers[section.code + i];
    if (v === "have") have++;
    else if (v === "dup") dup++;
  }
  const havePct = (have / total) * 100;
  const dupPct = (dup / total) * 100;
  bar.style.background = `linear-gradient(to right,
    var(--have) 0 ${havePct}%,
    var(--dup) ${havePct}% ${havePct + dupPct}%,
    var(--missing) ${havePct + dupPct}% 100%)`;
}
```

- [ ] **Step 4: Wire the progress bar refresh on tap**

In `renderAlbum`, find the click handler on `btn`:
```js
      btn.addEventListener("click", () => {
        const next = cycleState(data, code);
        btn.className = "sticker " + next;
        const c = sectionCounts(s);
        header.querySelector(".count").textContent = `${c.owned}/${c.total}`;
        updateStats();
      });
```

Replace with:
```js
      btn.addEventListener("click", () => {
        if (longPressTriggered) { longPressTriggered = false; return; }
        const next = cycleState(data, code);
        btn.className = "sticker " + next;
        const c = sectionCounts(s);
        header.querySelector(".count").textContent = `${c.owned}/${c.total}`;
        const progressBar = sec.querySelector(".progress-bar");
        if (progressBar) updateProgressBar(progressBar, s);
        updateStats();
      });
```

(The `longPressTriggered` flag is introduced in Task 3. Declaring it now is fine; until Task 3 it will be `undefined` which is falsy → no behavior change.)

Also at the very top of `app.js`, right after `let searchQuery = "";`, add:
```js
let longPressTriggered = false;
```

- [ ] **Step 5: Update `renderCollection` to show progress bar too**

In `renderCollection`, find:
```js
    header.innerHTML = `
      <span class="flag">${s.flag}</span>
      <span class="name">${s.name}</span>
      <span class="count">${owned.length}/${s.end - s.start + 1}</span>
    `;
    sec.appendChild(header);
```

Replace with:
```js
    header.innerHTML = `
      <span class="flag">${s.flag}</span>
      <span class="name">${s.name}</span>
      <span class="count">${owned.length}/${s.end - s.start + 1}</span>
    `;
    sec.appendChild(header);
    sec.appendChild(makeProgressBar(s));
```

- [ ] **Step 6: Add CSS for progress bar**

In `styles.css`, APPEND:

```css
.progress-bar {
  height: 5px;
  border-radius: 0 0 4px 4px;
  margin: 0 0 4px;
  background: var(--missing);
}
```

- [ ] **Step 7: Syntax check + commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && node --check app.js && git add app.js styles.css && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add per-section progress bar and load names"
```

---

## Task 3: Long-press preview modal

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add modal container to `index.html`**

In `index.html`, find:
```html
  <div id="toast" class="toast"></div>
```

Replace with:
```html
  <div id="toast" class="toast"></div>

  <div id="preview-modal" class="preview-modal" hidden>
    <div class="preview-backdrop"></div>
    <div class="preview-card">
      <button class="preview-close" type="button" aria-label="Închide">✕</button>
      <div class="preview-image-wrap">
        <img id="preview-img" alt="" />
        <div id="preview-placeholder" class="preview-placeholder" hidden></div>
      </div>
      <div class="preview-meta">
        <div id="preview-code" class="preview-code"></div>
        <div id="preview-name" class="preview-name"></div>
        <div id="preview-state" class="preview-state"></div>
      </div>
    </div>
  </div>
```

- [ ] **Step 2: Add `openPreview` and long-press wiring in `app.js`**

In `app.js`, immediately BEFORE `function switchTab(name)`, insert:

```js
function openPreview(code) {
  const modal = document.getElementById("preview-modal");
  const img = document.getElementById("preview-img");
  const ph = document.getElementById("preview-placeholder");
  document.getElementById("preview-code").textContent = code;
  const name = STICKER_NAMES[code] || "";
  document.getElementById("preview-name").textContent = name;
  const state = getState(data, code);
  const stateLabel = state === "have" ? "Am" : state === "dup" ? "Dublură" : "Lipsă";
  const stateEl = document.getElementById("preview-state");
  stateEl.textContent = stateLabel;
  stateEl.className = "preview-state " + state;

  img.hidden = false;
  ph.hidden = true;
  img.onerror = () => {
    img.hidden = true;
    ph.hidden = false;
    ph.textContent = code;
  };
  img.src = `./images/${code}.jpg`;
  modal.hidden = false;
}

function closePreview() {
  document.getElementById("preview-modal").hidden = true;
}

document.getElementById("preview-modal").addEventListener("click", (e) => {
  if (e.target.classList.contains("preview-backdrop") || e.target.classList.contains("preview-close")) {
    closePreview();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePreview();
});

function attachLongPress(el, code) {
  let timer = null;
  const start = (e) => {
    timer = setTimeout(() => {
      longPressTriggered = true;
      openPreview(code);
    }, 500);
  };
  const cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
  };
  el.addEventListener("touchstart", start, { passive: true });
  el.addEventListener("touchend", cancel);
  el.addEventListener("touchmove", cancel);
  el.addEventListener("mousedown", start);
  el.addEventListener("mouseup", cancel);
  el.addEventListener("mouseleave", cancel);
  el.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    longPressTriggered = true;
    openPreview(code);
  });
}
```

- [ ] **Step 3: Attach long-press to each sticker button in `renderAlbum`**

In `renderAlbum`, find:
```js
      btn.addEventListener("click", () => {
        if (longPressTriggered) { longPressTriggered = false; return; }
```

Immediately BEFORE that block, insert:
```js
      attachLongPress(btn, code);
```

So the resulting code is:
```js
      attachLongPress(btn, code);
      btn.addEventListener("click", () => {
        if (longPressTriggered) { longPressTriggered = false; return; }
        ...
```

- [ ] **Step 4: Attach long-press to each cell in `renderCollection`**

In `renderCollection`, find:
```js
      const cell = document.createElement("div");
      cell.className = "collection-cell " + state;
```

Immediately AFTER it, add:
```js
      attachLongPress(cell, code);
```

Also add a player-name line under each cell. Find:
```js
      const label = document.createElement("div");
      label.className = "collection-label";
      label.textContent = code;
```

Replace with:
```js
      const label = document.createElement("div");
      label.className = "collection-label";
      const playerName = STICKER_NAMES[code];
      label.textContent = playerName ? `${code} · ${playerName}` : code;
```

- [ ] **Step 5: Add CSS for modal**

In `styles.css`, APPEND:

```css
.preview-modal[hidden] { display: none; }

.preview-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.preview-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
}

.preview-card {
  position: relative;
  max-width: 320px;
  width: 100%;
  background: var(--panel);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-close {
  position: absolute;
  top: 6px;
  right: 6px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px 10px;
  font-family: inherit;
}

.preview-image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1.4;
  background: var(--missing);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  color: var(--muted);
  font-size: 1.2rem;
  font-weight: 600;
}

.preview-meta {
  text-align: center;
  width: 100%;
}

.preview-code {
  font-size: 1.3rem;
  font-weight: 700;
}

.preview-name {
  font-size: 0.95rem;
  color: var(--muted);
  margin-top: 2px;
  min-height: 1.2em;
}

.preview-state {
  margin-top: 8px;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.preview-state.have { background: var(--have); color: #062c0f; }
.preview-state.dup  { background: var(--dup); color: #3a1e00; }
.preview-state.missing { background: var(--missing); color: var(--muted); }

.collection-label {
  font-size: 0.65rem;
  line-height: 1.2;
  padding: 3px 4px;
}
```

- [ ] **Step 6: Bump SW cache version + add data/ to assets**

In `sw.js`, change:
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
```

To:
```js
const CACHE_VERSION = "panini-wc26-v4";
const IMAGES_CACHE = "panini-wc26-images-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./data/sticker-names.json",
];
```

- [ ] **Step 7: Syntax check + commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && node --check app.js && node --check sw.js && git add app.js styles.css index.html sw.js && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add long-press preview modal with player names"
```

---

## Task 4: Push + verify

- [ ] **Step 1: Push**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git push
```

- [ ] **Step 2: Wait until live**

```bash
until curl -s https://munteancd.github.io/panini-wc2026/sw.js | grep -q "v4"; do sleep 8; done && echo "LIVE"
```

- [ ] **Step 3: Verify in browser**

Hard refresh https://munteancd.github.io/panini-wc2026/. Check:
- Album tab: progress bars appear sub-headers with proper colors
- Long-press on a sticker tile: modal opens with image + code + player name (if known) + state
- Modal closes on tap on backdrop, ✕ button, or Escape
- Tab Colecția: each cell shows `CODE · Player Name` if name available
- Counts still show `12/20` etc.
