# Missing Tab + Search — Design

**Data:** 2026-05-12
**Status:** Aprobat
**Extinde:** `2026-05-12-panini-wc26-pwa-design.md`

## Context

Două features peste PWA existent: un tab nou pentru stickerele lipsă (oglindă a tab-ului Dubluri) și un câmp de search pentru filtrare rapidă pe tab-ul Album.

## Feature 1 — Tab Lipsă

**Buton nou în bottom nav** între Dubluri și Setări:
- `❌ Lipsă`
- Tab order final: Album / Dubluri / Lipsă / Setări (4 tab-uri)

**Conținut:** mirror al tab-ului Dubluri:
- Listă grupată pe secțiuni
- Pentru fiecare secțiune cu stickere lipsă: `<flag> <nume> (<count>)` + codurile separate prin virgulă
- Total mare sus: `Total lipsă: N`
- Buton „Copiază lista" → clipboard cu format:
  ```
  Lipsă (456):
  Mexic: MEX2, MEX7, MEX15
  Brazilia: BRA1, BRA3, ...
  ```
- Buton „Distribuie" → Web Share API cu fallback la clipboard

**Criteriu:** un sticker este „lipsă" dacă nu există cheie pentru el în `data.stickers` (nici `have`, nici `dup`).

**Edge case:** dacă toate cele 994 sunt deja bifate, afișează mesaj „Nicio lipsă — albumul e complet! 🎉".

## Feature 2 — Search pe Album

**Input sticky** între topbar și prima secțiune:
- Placeholder: `🔍 Caută țară...`
- Sub input, contor: `Afișate: X din 50` (doar când filtru activ)
- Buton X în dreapta input-ului pentru reset rapid

**Logică de match** (case-insensitive):
- Match dacă **codul** începe cu textul tastat (`bra` → `BRA`)
- SAU match dacă **numele** conține substring (`razil` → `Brazilia`)
- Diacriticele se ignoră (`scotia` matchează `Scoția`)

**Comportament:**
- Match → secțiunea rămâne vizibilă
- Non-match → `display: none` pe wrapper-ul secțiunii
- NU modifică datele; e pur vizual
- Input gol → toate secțiunile vizibile

**Persistență:** nu salvăm filtrul — la reîncărcare începe gol.

## Structura datelor

Fără modificări. Toate aceste features sunt pur UI peste structura existentă din `data.stickers`.

## Fișiere atinse

- `index.html` — adăugare al 4-lea nav button + input search (HTML structural)
- `styles.css` — stiluri pentru input search + chip nav
- `app.js` — funcție `renderMissing()`, `applySearchFilter()`, eveniment pe input, extindere `switchTab()`

## Considerații tehnice

**Normalize diacritice:**
```js
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
```

**Sticky search input:** trebuie `position: sticky; top: <inaltime-topbar>` ca să rămână vizibil când dai scroll prin secțiuni.

**Performance:** la fiecare keystroke parcurgem 50 de secțiuni, fără re-render — doar toggle clase. E instant.

## Out of scope

- Sincronizare între device-uri (amânat — folosim Backup/Restore manual)
- Search după codul individual al stickerului (`MEX5`) — nu necesar, scroll vertical e rapid odată în secțiune
