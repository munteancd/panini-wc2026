# Preview + Progress bar + Player names — Design

**Data:** 2026-05-13
**Status:** Aprobat
**Extinde:** PWA existent

Trei features mici peste app-ul existent.

## Feature 1 — Modal preview pe long-press în Album

**Trigger:**
- Mobile: `touchstart` ține apăsat **500ms** fără să miști → deschide modal
- Desktop: `contextmenu` (right-click) sau aceeași logică de long-press cu mouse
- `touchmove` sau `mouseup` înainte de 500ms = anulează (tap normal cicleaza starea, neschimbat)

**Conținut modal:**
- Backdrop semi-transparent dark, închidere la tap pe backdrop sau buton ✕ sus dreapta
- Card centrat: imaginea stickerului (sau placeholder dacă lipsește) + dedesubt **codul mare** + **numele jucătorului** (dacă există)
- Sub asta, un mic indicator de stare actuală: pătrat colorat + text (`Am`, `Dublură`, `Lipsă`)

**Fără săgeți de navigare** între stickere — închizi și apeși altul.

## Feature 2 — Bară de progres per țară

**Sub headerul fiecărei secțiuni** (Album + Colecția): bară orizontală subțire (4-6px), full-width, cu două culori:
- Segment verde = porțiunea bifată ca „have"
- Segment galben = porțiunea bifată ca „dup"
- Restul rămâne gri (missing)

**Textul `12/20` rămâne** la dreapta în header. Bara e doar reprezentare vizuală adițională.

Calcul:
- `pct_have = have / total * 100`
- `pct_dup  = dup / total * 100`
- Bara folosește `linear-gradient` cu stop-uri exacte la procentele astea

## Feature 3 — Numele jucătorilor

**Sursa:** scrape din checklistinsider.com — un singur fișier `data/sticker-names.json` în repo. Numele nu se schimbă, deci NU intră în GitHub Action — un scrape manual o singură dată.

**Format JSON:**
```json
{
  "FWC1": "Official Emblem",
  "MEX1": "Team Logo",
  "MEX2": "Luis Malagón",
  "MEX3": "Johan Vasquez",
  ...
}
```

Numele e curățat: fără sufixul „ - Country", fără „FOIL", fără caractere HTML.

**Unde apar:**
- ✅ În modal preview (sub cod, font mediu)
- ✅ În tab Colecția (sub fiecare imagine, font mic)
- ❌ NU în export-urile Dubluri/Lipsă (mesajele rămân scurte pentru WhatsApp)

**Loading:** `fetch('./data/sticker-names.json')` la pornirea app-ului, stocat într-un `const STICKER_NAMES = {}` în memorie. Cache în SW ca asset static. Dacă fetch eșuează, app-ul continuă fără nume (graceful degradation).

## Structura fișierelor

```
panini-wc2026/
├── scripts/
│   ├── scrape_images.py
│   └── scrape_names.py         # NEW (one-shot)
├── data/                        # NEW
│   └── sticker-names.json
├── app.js                       # extins
├── index.html                   # adăugare modal container
├── styles.css                   # progres bar + modal styles
└── sw.js                        # adăugare data/ la ASSETS
```

## Considerații tehnice

**Long-press fără să interfereze cu tap normal:** folosim flag `longPressTriggered` setat în timer. La `touchend`/`mouseup`, dacă flag-ul e true → modal deja deschis, NU executăm cycleState. Dacă false → comportament normal (tap = cicleaza starea).

**Modal accesibilitate:** focus trap minim — pe `Escape` se închide.

**Numele lipsă:** dacă un cod nu e în JSON (ex: CC1-14 sau orice neacoperit), pur și simplu nu afișăm linia de nume. Niciun „—" sau placeholder text.

**Service worker:** `data/sticker-names.json` se adaugă la ASSETS în `sw.js` și bump la `CACHE_VERSION = "panini-wc26-v4"` ca să forțeze refresh la deploy.

## Out of scope (cum ai zis)

- Săgeți navigare modal
- History timestamps
- Quick-nav cu steaguri sus
- Reset per țară
- Nume în export-uri
- Calculator de schimb (separat, viitor)
