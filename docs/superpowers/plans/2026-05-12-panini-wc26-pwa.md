# Panini WC26 PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static PWA tracking Panini FIFA World Cup 2026 stickers (have / duplicate / missing), hosted on GitHub Pages, installable on phone, offline-capable.

**Architecture:** Single-page vanilla JS app. All state in `localStorage`. Static files served from GitHub Pages. Service worker caches assets for offline use. No framework, no build step, no backend.

**Tech Stack:** HTML5, CSS3 (mobile-first), vanilla JavaScript (ES2020), Service Worker API, Web Share API, GitHub Pages.

**Note on testing:** This is a personal static PWA with no test framework. Verification is by opening `index.html` in Chrome (desktop + DevTools mobile view) and observing behavior. Each task ends with concrete manual verification steps.

**Project root for all paths:** `D:/Proiecte personale/panini-wc2026/`

---

## Task 1: Project scaffold

**Files:**
- Create: `README.md`
- Create: `.gitignore`

The git repo was already initialized when the spec was committed. This task just adds the basics.

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
Thumbs.db
*.log
node_modules/
.vscode/
```

- [ ] **Step 2: Create `README.md`**

```markdown
# Panini WC26

Personal PWA for tracking my Panini FIFA World Cup 2026 sticker album.
Have / duplicate / missing per sticker. Export duplicates list for trades.

Live: https://<user>.github.io/panini-wc2026/

## Local dev
Open `index.html` in a browser, or serve with `python -m http.server 8000`.

Data lives in `localStorage`. Use Settings → Backup to export.
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "Add gitignore and README"
```

---

## Task 2: Sticker data (SECTIONS constant)

**Files:**
- Create: `app.js`

- [ ] **Step 1: Create `app.js` with full SECTIONS list**

```js
const SECTIONS = [
  { code: "FWC", name: "FIFA World Cup", flag: "🏆", start: 0,  end: 19 },
  { code: "MEX", name: "Mexic",             flag: "🇲🇽", start: 1, end: 20 },
  { code: "RSA", name: "Africa de Sud",     flag: "🇿🇦", start: 1, end: 20 },
  { code: "KOR", name: "Coreea de Sud",     flag: "🇰🇷", start: 1, end: 20 },
  { code: "CZE", name: "Cehia",             flag: "🇨🇿", start: 1, end: 20 },
  { code: "CAN", name: "Canada",            flag: "🇨🇦", start: 1, end: 20 },
  { code: "BIH", name: "Bosnia",            flag: "🇧🇦", start: 1, end: 20 },
  { code: "QAT", name: "Qatar",             flag: "🇶🇦", start: 1, end: 20 },
  { code: "SUI", name: "Elveția",           flag: "🇨🇭", start: 1, end: 20 },
  { code: "BRA", name: "Brazilia",          flag: "🇧🇷", start: 1, end: 20 },
  { code: "MAR", name: "Maroc",             flag: "🇲🇦", start: 1, end: 20 },
  { code: "HAI", name: "Haiti",             flag: "🇭🇹", start: 1, end: 20 },
  { code: "SCO", name: "Scoția",            flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", start: 1, end: 20 },
  { code: "USA", name: "USA",               flag: "🇺🇸", start: 1, end: 20 },
  { code: "PAR", name: "Paraguay",          flag: "🇵🇾", start: 1, end: 20 },
  { code: "AUS", name: "Australia",         flag: "🇦🇺", start: 1, end: 20 },
  { code: "TUR", name: "Turcia",            flag: "🇹🇷", start: 1, end: 20 },
  { code: "GER", name: "Germania",          flag: "🇩🇪", start: 1, end: 20 },
  { code: "CUW", name: "Curaçao",           flag: "🇨🇼", start: 1, end: 20 },
  { code: "CIV", name: "Coasta de Fildeș", flag: "🇨🇮", start: 1, end: 20 },
  { code: "ECU", name: "Ecuador",           flag: "🇪🇨", start: 1, end: 20 },
  { code: "NED", name: "Olanda",            flag: "🇳🇱", start: 1, end: 20 },
  { code: "JPN", name: "Japonia",           flag: "🇯🇵", start: 1, end: 20 },
  { code: "SWE", name: "Suedia",            flag: "🇸🇪", start: 1, end: 20 },
  { code: "TUN", name: "Tunisia",           flag: "🇹🇳", start: 1, end: 20 },
  { code: "BEL", name: "Belgia",            flag: "🇧🇪", start: 1, end: 20 },
  { code: "EGY", name: "Egipt",             flag: "🇪🇬", start: 1, end: 20 },
  { code: "IRN", name: "Iran",              flag: "🇮🇷", start: 1, end: 20 },
  { code: "NZL", name: "Noua Zeelandă",     flag: "🇳🇿", start: 1, end: 20 },
  { code: "ESP", name: "Spania",            flag: "🇪🇸", start: 1, end: 20 },
  { code: "CPV", name: "Capul Verde",       flag: "🇨🇻", start: 1, end: 20 },
  { code: "KSA", name: "Arabia Saudită",    flag: "🇸🇦", start: 1, end: 20 },
  { code: "URU", name: "Uruguay",           flag: "🇺🇾", start: 1, end: 20 },
  { code: "FRA", name: "Franța",            flag: "🇫🇷", start: 1, end: 20 },
  { code: "SEN", name: "Senegal",           flag: "🇸🇳", start: 1, end: 20 },
  { code: "IRQ", name: "Irak",              flag: "🇮🇶", start: 1, end: 20 },
  { code: "NOR", name: "Norvegia",          flag: "🇳🇴", start: 1, end: 20 },
  { code: "ARG", name: "Argentina",         flag: "🇦🇷", start: 1, end: 20 },
  { code: "ALG", name: "Algeria",           flag: "🇩🇿", start: 1, end: 20 },
  { code: "AUT", name: "Austria",           flag: "🇦🇹", start: 1, end: 20 },
  { code: "JOR", name: "Iordania",          flag: "🇯🇴", start: 1, end: 20 },
  { code: "POR", name: "Portugalia",        flag: "🇵🇹", start: 1, end: 20 },
  { code: "COD", name: "RD Congo",          flag: "🇨🇩", start: 1, end: 20 },
  { code: "UZB", name: "Uzbekistan",        flag: "🇺🇿", start: 1, end: 20 },
  { code: "COL", name: "Columbia",          flag: "🇨🇴", start: 1, end: 20 },
  { code: "ENG", name: "Anglia",            flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", start: 1, end: 20 },
  { code: "CRO", name: "Croația",           flag: "🇭🇷", start: 1, end: 20 },
  { code: "GHA", name: "Ghana",             flag: "🇬🇭", start: 1, end: 20 },
  { code: "PAN", name: "Panama",            flag: "🇵🇦", start: 1, end: 20 },
  { code: "CC",  name: "Coca-Cola",         flag: "🥤", start: 1, end: 14 },
];

const STORAGE_KEY = "panini-wc26-data";

function allStickerCodes() {
  const out = [];
  for (const s of SECTIONS) {
    for (let i = s.start; i <= s.end; i++) out.push(s.code + i);
  }
  return out;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, updated: null, stickers: {} };
    const d = JSON.parse(raw);
    if (!d.stickers || typeof d.stickers !== "object") throw new Error("bad shape");
    return d;
  } catch {
    return { version: 1, updated: null, stickers: {} };
  }
}

function saveData(data) {
  data.updated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getState(data, code) {
  return data.stickers[code] || "missing";
}

function cycleState(data, code) {
  const cur = getState(data, code);
  const next = cur === "missing" ? "have" : cur === "have" ? "dup" : "missing";
  if (next === "missing") delete data.stickers[code];
  else data.stickers[code] = next;
  saveData(data);
  return next;
}
```

- [ ] **Step 2: Verify total sticker count in browser console**

Create a quick `verify.html` (delete after):

```html
<!DOCTYPE html>
<script src="app.js"></script>
<script>
  const codes = allStickerCodes();
  document.body.textContent = `Total: ${codes.length} (expected 994)`;
</script>
```

Open in browser. Expected text: `Total: 994 (expected 994)`. Delete `verify.html`.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "Add sticker sections data and storage helpers"
```

---

## Task 3: HTML shell + CSS (mobile-first, 3 tabs)

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0a3d62" />
  <title>Panini WC26</title>
  <link rel="manifest" href="./manifest.json" />
  <link rel="icon" href="./icons/icon-192.png" />
  <link rel="apple-touch-icon" href="./icons/icon-192.png" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="title">Panini WC26</div>
    <div class="stats" id="stats">— / 994 • Dubluri: 0</div>
  </header>

  <main>
    <section id="tab-album" class="tab active"></section>
    <section id="tab-dupes" class="tab"></section>
    <section id="tab-settings" class="tab"></section>
  </main>

  <nav class="bottom-nav">
    <button class="nav-btn active" data-tab="album">📋<span>Album</span></button>
    <button class="nav-btn" data-tab="dupes">🔁<span>Dubluri</span></button>
    <button class="nav-btn" data-tab="settings">⚙️<span>Setări</span></button>
  </nav>

  <div id="toast" class="toast"></div>

  <script src="./app.js"></script>
  <script>
    // sw registration happens in Task 7
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
:root {
  --bg: #0f1724;
  --panel: #16223a;
  --text: #e6edf5;
  --muted: #93a3b8;
  --missing: #2c3a55;
  --have: #22c55e;
  --dup: #f59e0b;
  --accent: #0a3d62;
  --danger: #ef4444;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.topbar {
  position: sticky;
  top: 0;
  background: var(--accent);
  padding: 12px 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: calc(12px + env(safe-area-inset-top));
}

.topbar .title { font-weight: 700; font-size: 1.1rem; }
.topbar .stats { font-size: 0.85rem; color: #c9d6e8; }

main {
  padding: 12px;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}

.tab { display: none; }
.tab.active { display: block; }

.section {
  background: var(--panel);
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}

.section-header .flag { font-size: 1.2rem; }
.section-header .name { flex: 1; font-weight: 600; }
.section-header .count { font-size: 0.85rem; color: var(--muted); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 4px;
  padding: 0 8px 10px;
}

.section.collapsed .grid { display: none; }

.sticker {
  background: var(--missing);
  color: var(--text);
  border: none;
  border-radius: 4px;
  padding: 8px 2px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.sticker.have { background: var(--have); color: #062c0f; }
.sticker.dup  { background: var(--dup);  color: #3a1e00; }

.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--panel);
  display: flex;
  border-top: 1px solid #0008;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-btn {
  flex: 1;
  background: none;
  border: none;
  color: var(--muted);
  padding: 10px 4px;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  font-family: inherit;
}

.nav-btn span { font-size: 0.7rem; }
.nav-btn.active { color: var(--text); }

.btn {
  background: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
  margin: 4px 0;
  width: 100%;
}

.btn.danger { background: var(--danger); }
.btn.ghost  { background: transparent; border: 1px solid var(--muted); }

.dupes-section h3 {
  margin: 12px 0 4px;
  font-size: 0.95rem;
  color: var(--muted);
}
.dupes-list { color: var(--text); margin-bottom: 8px; }

.settings-row {
  background: var(--panel);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--accent);
  color: var(--text);
  padding: 10px 16px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  z-index: 100;
}

.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in Chrome. Expected: dark background, "Panini WC26" header, "— / 994 • Dubluri: 0" subtitle, 3 empty tab sections, bottom nav with 3 buttons (Album/Dubluri/Setări). DevTools mobile view: layout looks OK at 375px width.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "Add HTML shell and base styles"
```

---

## Task 4: Album tab — render grid, tap to cycle, persistence

**Files:**
- Modify: `app.js` — append rendering + event logic

- [ ] **Step 1: Append render and tab logic to `app.js`**

Add to end of `app.js`:

```js
let data = loadData();

function updateStats() {
  let have = 0, dup = 0;
  for (const v of Object.values(data.stickers)) {
    if (v === "have") have++;
    else if (v === "dup") dup++;
  }
  const total = allStickerCodes().length;
  document.getElementById("stats").textContent =
    `${have + dup} / ${total} • Dubluri: ${dup}`;
}

function sectionCounts(section) {
  let owned = 0, total = section.end - section.start + 1;
  for (let i = section.start; i <= section.end; i++) {
    const v = data.stickers[section.code + i];
    if (v === "have" || v === "dup") owned++;
  }
  return { owned, total };
}

function renderAlbum() {
  const root = document.getElementById("tab-album");
  root.innerHTML = "";
  for (const s of SECTIONS) {
    const sec = document.createElement("div");
    sec.className = "section";
    const { owned, total } = sectionCounts(s);

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `
      <span class="flag">${s.flag}</span>
      <span class="name">${s.name}</span>
      <span class="count">${owned}/${total}</span>
    `;
    header.addEventListener("click", () => sec.classList.toggle("collapsed"));
    sec.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid";
    for (let i = s.start; i <= s.end; i++) {
      const code = s.code + i;
      const btn = document.createElement("button");
      btn.className = "sticker " + getState(data, code);
      btn.textContent = code;
      btn.addEventListener("click", () => {
        const next = cycleState(data, code);
        btn.className = "sticker " + next;
        const c = sectionCounts(s);
        header.querySelector(".count").textContent = `${c.owned}/${c.total}`;
        updateStats();
      });
      grid.appendChild(btn);
    }
    sec.appendChild(grid);
    root.appendChild(sec);
  }
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add("active");
  if (name === "dupes") renderDupes();
  if (name === "settings") renderSettings();
}

document.querySelectorAll(".nav-btn").forEach(b => {
  b.addEventListener("click", () => switchTab(b.dataset.tab));
});

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1500);
}

// stubs filled in later tasks
function renderDupes() {
  document.getElementById("tab-dupes").innerHTML = "<p>TODO</p>";
}
function renderSettings() {
  document.getElementById("tab-settings").innerHTML = "<p>TODO</p>";
}

renderAlbum();
updateStats();
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Expected:
- All sections render with country names and flags, each showing `0/20` (or `0/14`, `0/20` for FWC).
- Tap a sticker → it turns green ("have"). Tap again → orange ("dup"). Tap again → gray (missing).
- Top stats updates: tap MEX1 to "have", stats becomes `1 / 994 • Dubluri: 0`. Tap again to "dup", becomes `1 / 994 • Dubluri: 1`.
- Section header `count` updates too: tap MEX1 → header shows `1/20`.
- Click section header → collapses/expands the grid.
- Reload page → state persists (read from localStorage).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "Render album tab with three-state toggles and persistence"
```

---

## Task 5: Dubluri tab — list, copy, share

**Files:**
- Modify: `app.js` — replace `renderDupes` stub

- [ ] **Step 1: Replace the `renderDupes` stub in `app.js`**

Find:
```js
function renderDupes() {
  document.getElementById("tab-dupes").innerHTML = "<p>TODO</p>";
}
```

Replace with:
```js
function collectDupes() {
  const bySection = [];
  let total = 0;
  for (const s of SECTIONS) {
    const codes = [];
    for (let i = s.start; i <= s.end; i++) {
      const c = s.code + i;
      if (data.stickers[c] === "dup") codes.push(c);
    }
    if (codes.length) {
      bySection.push({ section: s, codes });
      total += codes.length;
    }
  }
  return { bySection, total };
}

function dupesAsText() {
  const { bySection, total } = collectDupes();
  if (total === 0) return "Nicio dublură.";
  const lines = [`Dubluri (${total}):`];
  for (const { section, codes } of bySection) {
    lines.push(`${section.name}: ${codes.join(", ")}`);
  }
  return lines.join("\n");
}

function renderDupes() {
  const root = document.getElementById("tab-dupes");
  const { bySection, total } = collectDupes();
  root.innerHTML = "";

  const actions = document.createElement("div");
  actions.innerHTML = `
    <button class="btn" id="btn-copy">Copiază lista</button>
    <button class="btn ghost" id="btn-share">Distribuie</button>
    <p style="color:var(--muted); margin:8px 0;">Total dubluri: <strong>${total}</strong></p>
  `;
  root.appendChild(actions);

  if (total === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nicio dublură deocamdată.";
    empty.style.color = "var(--muted)";
    root.appendChild(empty);
  } else {
    const list = document.createElement("div");
    list.className = "dupes-section";
    for (const { section, codes } of bySection) {
      const h = document.createElement("h3");
      h.textContent = `${section.flag} ${section.name} (${codes.length})`;
      list.appendChild(h);
      const p = document.createElement("div");
      p.className = "dupes-list";
      p.textContent = codes.join(", ");
      list.appendChild(p);
    }
    root.appendChild(list);
  }

  document.getElementById("btn-copy").addEventListener("click", async () => {
    const text = dupesAsText();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copiat!");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("Copiat!");
    }
  });

  document.getElementById("btn-share").addEventListener("click", async () => {
    const text = dupesAsText();
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Web Share indisponibil — copiat în clipboard");
    }
  });
}
```

- [ ] **Step 2: Verify in browser**

Reload. Set a few stickers to "dup" (tap twice). Switch to "Dubluri" tab.
- Expected: list shows the duplicates grouped by country, total count matches.
- Click "Copiază lista" → toast shows "Copiat!". Paste in a notepad → see the formatted text.
- Click "Distribuie" on desktop → Web Share may not be available; falls back to clipboard with toast.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "Add Dubluri tab with copy and share"
```

---

## Task 6: Setări tab — backup, restore, reset

**Files:**
- Modify: `app.js` — replace `renderSettings` stub

- [ ] **Step 1: Replace the `renderSettings` stub in `app.js`**

Find:
```js
function renderSettings() {
  document.getElementById("tab-settings").innerHTML = "<p>TODO</p>";
}
```

Replace with:
```js
function isValidBackup(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (obj.version !== 1) return false;
  if (!obj.stickers || typeof obj.stickers !== "object") return false;
  for (const [k, v] of Object.entries(obj.stickers)) {
    if (!/^[A-Z]{2,3}\d+$/.test(k)) return false;
    if (v !== "have" && v !== "dup") return false;
  }
  return true;
}

function renderSettings() {
  const root = document.getElementById("tab-settings");
  let have = 0, dup = 0;
  for (const v of Object.values(data.stickers)) {
    if (v === "have") have++;
    else if (v === "dup") dup++;
  }
  const total = allStickerCodes().length;
  const missing = total - have - dup;

  root.innerHTML = `
    <div class="settings-row">
      <strong>Statistici</strong>
      <p style="color:var(--muted); margin:6px 0;">
        Total: ${total}<br>
        Am: ${have}<br>
        Dubluri: ${dup}<br>
        Lipsă: ${missing}<br>
        Ultim update: ${data.updated || "—"}
      </p>
    </div>
    <div class="settings-row">
      <button class="btn" id="btn-backup">Backup (descarcă .json)</button>
      <button class="btn ghost" id="btn-restore">Restore (încarcă .json)</button>
      <input type="file" id="file-restore" accept="application/json" hidden />
    </div>
    <div class="settings-row">
      <button class="btn danger" id="btn-reset">Reset (șterge tot)</button>
    </div>
  `;

  document.getElementById("btn-backup").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `stickere-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Backup descărcat");
  });

  const fileInput = document.getElementById("file-restore");
  document.getElementById("btn-restore").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const f = fileInput.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const obj = JSON.parse(text);
      if (!isValidBackup(obj)) {
        alert("Fișier invalid.");
        fileInput.value = "";
        return;
      }
      if (!confirm("Suprascrii datele curente cu cele din fișier?")) {
        fileInput.value = "";
        return;
      }
      data = obj;
      saveData(data);
      fileInput.value = "";
      renderAlbum();
      updateStats();
      renderSettings();
      showToast("Restaurat");
    } catch {
      alert("Eroare la citirea fișierului.");
      fileInput.value = "";
    }
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("Ești sigur că vrei să ștergi TOATE datele?")) return;
    if (!confirm("Confirmă încă o dată: se șterge tot.")) return;
    data = { version: 1, updated: null, stickers: {} };
    saveData(data);
    renderAlbum();
    updateStats();
    renderSettings();
    showToast("Resetat");
  });
}
```

- [ ] **Step 2: Verify in browser**

- Set a few stickers to "have"/"dup".
- Settings tab → "Backup" → file `stickere-YYYY-MM-DD.json` downloads. Open it, verify JSON shape matches `{ version: 1, updated: ..., stickers: { ... } }`.
- Click Reset, confirm twice → grid all goes gray, stats `0 / 994 • Dubluri: 0`.
- Click Restore, pick the backup file → confirm → grid restores to previous state.
- Try restoring a junk file (e.g. `index.html`) → expect alert "Fișier invalid."

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "Add Settings tab with backup, restore and reset"
```

---

## Task 7: PWA manifest, icons, service worker

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`
- Modify: `index.html` — register service worker

- [ ] **Step 1: Create `icons/` with two PNG icons**

Generate two simple square icons (192×192 and 512×512). One option is to draw a green/blue square with "WC 26" text using ImageMagick (if installed):

```bash
mkdir -p icons
magick -size 512x512 xc:"#0a3d62" -fill "#22c55e" -gravity center -pointsize 130 -annotate 0 "WC\n26" icons/icon-512.png
magick icons/icon-512.png -resize 192x192 icons/icon-192.png
```

If ImageMagick isn't available: open https://www.favicon-generator.org or use any 512×512 PNG with a soccer/world cup theme. Save as `icons/icon-512.png` and `icons/icon-192.png`. Both must exist.

Verify both files exist:
```bash
ls icons/
# expected: icon-192.png  icon-512.png
```

- [ ] **Step 2: Create `manifest.json`**

```json
{
  "name": "Panini WC26",
  "short_name": "Panini WC26",
  "description": "Evidența albumului Panini FIFA World Cup 2026",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0f1724",
  "theme_color": "#0a3d62",
  "lang": "ro",
  "icons": [
    { "src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Create `sw.js`**

```js
const CACHE_VERSION = "panini-wc26-v1";
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
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

- [ ] **Step 4: Register service worker in `index.html`**

In `index.html`, replace:
```html
<script>
  // sw registration happens in Task 7
</script>
```

with:
```html
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(console.error);
    });
  }
</script>
```

- [ ] **Step 5: Verify locally with a real server**

Service workers don't run from `file://`. Run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in Chrome. DevTools → Application:
- Manifest: shows "Panini WC26", icons render, no errors.
- Service Workers: registered, status "activated and is running".
- Application → Cache Storage → `panini-wc26-v1`: contains all 7 assets.

Toggle DevTools → Network → "Offline" → reload page. Expected: app still loads and works.

- [ ] **Step 6: Commit**

```bash
git add manifest.json sw.js icons/ index.html
git commit -m "Add PWA manifest, icons and service worker"
```

---

## Task 8: Deploy to GitHub Pages

**Files:** none (remote operations)

- [ ] **Step 1: Create GitHub repo and push**

```bash
gh repo create panini-wc2026 --public --source=. --remote=origin --push
```

Expected: repo created at `https://github.com/<user>/panini-wc2026`, `main` branch pushed.

- [ ] **Step 2: Enable GitHub Pages**

```bash
gh api -X POST repos/:owner/panini-wc2026/pages -f source[branch]=main -f source[path]=/
```

Or via web UI: repo Settings → Pages → Source: branch `main`, folder `/ (root)` → Save.

- [ ] **Step 3: Verify deployed site**

Wait ~1 minute for first deploy. Open `https://<user>.github.io/panini-wc2026/` in Chrome.

Expected:
- App loads, grid renders, tap interactions work.
- DevTools → Application → Manifest: no errors, icons load.
- DevTools → Application → Service Workers: registered, scope `https://<user>.github.io/panini-wc2026/`.
- On Android Chrome: menu → "Add to Home Screen" → app installs, opens fullscreen, "Panini WC26" name.

- [ ] **Step 4: Update README with live URL**

In `README.md`, replace `<user>` with the actual GitHub username.

```bash
git add README.md
git commit -m "Add live URL to README"
git push
```

---

## Done

The PWA is live, installable, offline-capable, and backed by `localStorage` with manual backup/restore.

**Manual smoke test checklist after deploy:**
- [ ] Cycle a sticker through all 3 states, reload, state persists.
- [ ] Top stats and section count update on every tap.
- [ ] Dubluri tab shows the right list; "Copiază lista" puts correct text in clipboard.
- [ ] Backup downloads a valid JSON; Restore brings the same state back.
- [ ] Reset clears everything (with two confirmations).
- [ ] Mobile install works; app runs offline after install.
