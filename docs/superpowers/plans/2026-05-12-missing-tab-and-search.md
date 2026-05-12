# Missing Tab + Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 4th tab "Lipsă" (missing stickers) mirroring the Dubluri tab, and a search filter on the Album tab.

**Architecture:** Pure UI additions over the existing structure in `data.stickers`. No data model changes. All work in `index.html`, `styles.css`, `app.js`.

**Tech Stack:** Same as base — HTML/CSS/vanilla JS.

**Project root:** `D:/Proiecte personale/panini-wc2026/`

---

## Task 1: Add Lipsă nav button + tab section in HTML

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the missing tab section**

In `index.html`, find:
```html
    <section id="tab-dupes" class="tab"></section>
    <section id="tab-settings" class="tab"></section>
```

Replace with:
```html
    <section id="tab-dupes" class="tab"></section>
    <section id="tab-missing" class="tab"></section>
    <section id="tab-settings" class="tab"></section>
```

- [ ] **Step 2: Add the missing nav button**

In `index.html`, find:
```html
    <button class="nav-btn" data-tab="dupes">🔁<span>Dubluri</span></button>
    <button class="nav-btn" data-tab="settings">⚙️<span>Setări</span></button>
```

Replace with:
```html
    <button class="nav-btn" data-tab="dupes">🔁<span>Dubluri</span></button>
    <button class="nav-btn" data-tab="missing">❌<span>Lipsă</span></button>
    <button class="nav-btn" data-tab="settings">⚙️<span>Setări</span></button>
```

- [ ] **Step 3: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add index.html && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add Lipsă tab to HTML shell"
```

---

## Task 2: Implement renderMissing() in app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `collectMissing()` and `missingAsText()` functions**

In `app.js`, locate the `dupesAsText` function definition. Immediately AFTER it (and before `renderDupes`), insert:

```js
function collectMissing() {
  const bySection = [];
  let total = 0;
  for (const s of SECTIONS) {
    const codes = [];
    for (let i = s.start; i <= s.end; i++) {
      const c = s.code + i;
      if (!(c in data.stickers)) codes.push(c);
    }
    if (codes.length) {
      bySection.push({ section: s, codes });
      total += codes.length;
    }
  }
  return { bySection, total };
}

function missingAsText() {
  const { bySection, total } = collectMissing();
  if (total === 0) return "Nicio lipsă — albumul e complet!";
  const lines = [`Lipsă (${total}):`];
  for (const { section, codes } of bySection) {
    lines.push(`${section.name}: ${codes.join(", ")}`);
  }
  return lines.join("\n");
}
```

- [ ] **Step 2: Add `renderMissing()` function**

Locate the `renderSettings` function. Immediately BEFORE it, insert:

```js
function renderMissing() {
  const root = document.getElementById("tab-missing");
  const { bySection, total } = collectMissing();
  root.innerHTML = "";

  const actions = document.createElement("div");
  actions.innerHTML = `
    <button class="btn" id="btn-copy-missing">Copiază lista</button>
    <button class="btn ghost" id="btn-share-missing">Distribuie</button>
    <p style="color:var(--muted); margin:8px 0;">Total lipsă: <strong>${total}</strong></p>
  `;
  root.appendChild(actions);

  if (total === 0) {
    const done = document.createElement("p");
    done.textContent = "Nicio lipsă — albumul e complet! 🎉";
    done.style.color = "var(--have)";
    done.style.fontWeight = "600";
    root.appendChild(done);
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

  document.getElementById("btn-copy-missing").addEventListener("click", async () => {
    const text = missingAsText();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copiat!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("Copiat!");
    }
  });

  document.getElementById("btn-share-missing").addEventListener("click", async () => {
    const text = missingAsText();
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Web Share indisponibil — copiat în clipboard");
      } catch {
        showToast("Eroare la copiere");
      }
    }
  });
}
```

- [ ] **Step 3: Wire `switchTab` to render the missing tab**

In `app.js`, find:
```js
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add("active");
  if (name === "dupes") renderDupes();
  if (name === "settings") renderSettings();
}
```

Replace with:
```js
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add("active");
  if (name === "dupes") renderDupes();
  if (name === "missing") renderMissing();
  if (name === "settings") renderSettings();
}
```

- [ ] **Step 4: Syntax check**

```bash
cd "D:/Proiecte personale/panini-wc2026" && node --check app.js
```

Expected: no output (success).

- [ ] **Step 5: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add app.js && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add Lipsă tab rendering and helpers"
```

---

## Task 3: Add search input to Album tab

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Add normalization helper and `applySearchFilter` in `app.js`**

In `app.js`, find the existing line:
```js
let data = loadData();
```

Immediately AFTER it (so this is at module scope), insert:

```js
let searchQuery = "";

function normText(s) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function sectionMatches(section, query) {
  if (!query) return true;
  const q = normText(query);
  return normText(section.code).startsWith(q) || normText(section.name).includes(q);
}

function applySearchFilter() {
  const root = document.getElementById("tab-album");
  const sections = root.querySelectorAll(".section");
  let visible = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    const wrapper = sections[i];
    if (!wrapper) continue;
    const match = sectionMatches(SECTIONS[i], searchQuery);
    wrapper.style.display = match ? "" : "none";
    if (match) visible++;
  }
  const counter = document.getElementById("search-counter");
  if (counter) {
    if (searchQuery) {
      counter.textContent = `Afișate: ${visible} din ${SECTIONS.length}`;
      counter.style.display = "block";
    } else {
      counter.style.display = "none";
    }
  }
}
```

- [ ] **Step 2: Modify `renderAlbum` to include the search input**

In `app.js`, find the start of `renderAlbum`:
```js
function renderAlbum() {
  const root = document.getElementById("tab-album");
  root.innerHTML = "";
  for (const s of SECTIONS) {
```

Replace with:
```js
function renderAlbum() {
  const root = document.getElementById("tab-album");
  root.innerHTML = "";

  const searchWrap = document.createElement("div");
  searchWrap.className = "search-wrap";
  searchWrap.innerHTML = `
    <div class="search-input-row">
      <input type="search" id="search-input" placeholder="🔍 Caută țară..." autocomplete="off" />
      <button type="button" id="search-clear" aria-label="Resetează" hidden>✕</button>
    </div>
    <div id="search-counter" class="search-counter" style="display:none;"></div>
  `;
  root.appendChild(searchWrap);

  const input = searchWrap.querySelector("#search-input");
  const clearBtn = searchWrap.querySelector("#search-clear");
  input.value = searchQuery;
  clearBtn.hidden = !searchQuery;
  input.addEventListener("input", () => {
    searchQuery = input.value.trim();
    clearBtn.hidden = !searchQuery;
    applySearchFilter();
  });
  clearBtn.addEventListener("click", () => {
    searchQuery = "";
    input.value = "";
    clearBtn.hidden = true;
    applySearchFilter();
    input.focus();
  });

  for (const s of SECTIONS) {
```

(The rest of `renderAlbum`'s body stays the same — the `for (const s of SECTIONS)` line that was there continues unchanged.)

- [ ] **Step 3: Apply filter after rendering**

In `app.js`, find the end of `renderAlbum`:
```js
    sec.appendChild(grid);
    root.appendChild(sec);
  }
}
```

Replace with:
```js
    sec.appendChild(grid);
    root.appendChild(sec);
  }
  applySearchFilter();
}
```

- [ ] **Step 4: Add CSS for the search input**

In `styles.css`, APPEND to the end of the file:

```css
.search-wrap {
  position: sticky;
  top: calc(60px + env(safe-area-inset-top));
  background: var(--bg);
  z-index: 5;
  padding: 8px 0;
  margin-bottom: 4px;
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--panel);
  border-radius: 8px;
  padding: 0 10px;
}

#search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  padding: 10px 0;
}

#search-input::placeholder { color: var(--muted); }

#search-clear {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
}

.search-counter {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 4px;
  padding: 0 4px;
}
```

- [ ] **Step 5: Syntax check**

```bash
cd "D:/Proiecte personale/panini-wc2026" && node --check app.js
```

- [ ] **Step 6: Commit**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git add app.js styles.css && git -c user.email=munteancd@gmail.com -c user.name=Cristi commit -m "Add search filter on Album tab"
```

---

## Task 4: Deploy

**Files:** none (push existing commits)

- [ ] **Step 1: Push to GitHub**

```bash
cd "D:/Proiecte personale/panini-wc2026" && git push
```

- [ ] **Step 2: Verify deploy**

Wait ~1 minute, then:
```bash
curl -sI https://munteancd.github.io/panini-wc2026/ | head -3
```

Expected: `HTTP/1.1 200 OK`. The new tab and search should appear after a hard refresh (Ctrl+Shift+R) — the service worker may serve a cached old version on first load.

---

## Done

App is updated with:
- 4-tab nav (Album / Dubluri / Lipsă / Setări)
- Search filter on Album with sticky input
