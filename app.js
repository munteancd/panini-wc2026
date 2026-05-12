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

let data = loadData();
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
  applySearchFilter();
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add("active");
  if (name === "dupes") renderDupes();
  if (name === "missing") renderMissing();
  if (name === "collection") renderCollection();
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
  intro.textContent = "Imaginile sunt agregate de pe laststicker.com (acoperire parțială, crește săptămânal). FWC și Coca-Cola nu sunt disponibile.";
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

renderAlbum();
updateStats();
