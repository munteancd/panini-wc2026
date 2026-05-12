# Panini WC26 — PWA pentru evidența stickerelor

**Data:** 2026-05-12
**Autor:** Cristi
**Status:** Design aprobat — pending review final

## Context

Tracker personal pentru albumul Panini FIFA World Cup 2026. Aplicație web statică, hostată pe GitHub Pages, instalabilă ca PWA pe telefon. Folosire single-user (proprietarul), fără autentificare, fără backend.

## Obiective

- Evidența stickerelor deținute din album (994 stickere)
- Evidența dublurilor pentru schimburi
- Export rapid al listei de dubluri către WhatsApp/SMS
- Backup/restore manual al datelor (control total al utilizatorului)
- Funcționare offline după prima încărcare

## Non-obiective

- Multi-user / autentificare
- Sincronizare automată între dispozitive (utilizatorul acceptă backup manual)
- Contor pentru dubluri (1 dublură per sticker e suficient)
- View partajabil prin link (textul copiat e suficient pentru schimburi)

## Arhitectură

PWA 100% static:

- **HTML + CSS + JavaScript vanilla** — fără framework
- **`manifest.json`** — instalare pe home screen, fullscreen
- **Service Worker** (`sw.js`) — cache offline (cache-first pentru asset-uri)
- **GitHub Pages** servește fișierele din branch-ul `main`
- **`localStorage`** stochează datele ca un singur JSON: `{ "MEX5": "have", "BRA12": "dup", ... }`
- Stickerele lipsă **nu apar în obiect** (default) — minimizează dimensiunea storage

## Structura datelor

```js
const SECTIONS = [
  { code: "FWC", name: "FIFA World Cup", flag: "🏆", range: [0, 19] },
  { code: "MEX", name: "Mexic", flag: "🇲🇽", range: [1, 20] },
  { code: "RSA", name: "Africa de Sud", flag: "🇿🇦", range: [1, 20] },
  // ... 48 echipe în total
  { code: "CC",  name: "Coca-Cola", flag: "🥤", range: [1, 14] },
];
```

**Total:** 20 (FWC 0–19) + 48 × 20 (echipe) + 14 (CC) = **994 stickere**

**Lista de echipe** (ordinea din checklist, nume în română):
Mexic, Africa de Sud, Coreea de Sud, Cehia, Canada, Bosnia, Qatar, Elveția, Brazilia, Maroc, Haiti, Scoția, USA, Paraguay, Australia, Turcia, Germania, Curaçao, Coasta de Fildeș, Ecuador, Olanda, Japonia, Suedia, Tunisia, Belgia, Egipt, Iran, Noua Zeelandă, Spania, Capul Verde, Arabia Saudită, Uruguay, Franța, Senegal, Irak, Norvegia, Argentina, Algeria, Austria, Iordania, Portugalia, RD Congo, Uzbekistan, Columbia, Anglia, Croația, Ghana, Panama.

**Format storage** (în `localStorage` la cheia `panini-wc26-data`):
```json
{
  "version": 1,
  "updated": "2026-05-12T10:30:00Z",
  "stickers": {
    "MEX5": "have",
    "MEX12": "dup",
    "BRA3": "have"
  }
}
```

Valori posibile: `"have"`, `"dup"`. Lipsa cheii = "missing".

## Componente / Ecrane

Layout mobile-first cu **3 tab-uri** în partea de jos (bottom nav).

### Tab 1 — Album (principal)

- Bară de progres sus: `Total: 247 / 994  •  Dubluri: 23`
- Secțiuni colapsabile, una sub alta, în ordinea din checklist
- Header per secțiune: `🇲🇽 Mexic  12/20` (steag + nume + count)
- Sub header, grilă de pătrate cu codul stickerului (`MEX1`, `MEX2`, ...)
- Stări vizuale:
  - **Gri** = Lipsă (default)
  - **Verde** = Am
  - **Galben/portocaliu** = Dublură
- **Tap** pe sticker → ciclează: Lipsă → Am → Dublură → Lipsă
- Update instant în `localStorage` la fiecare tap

### Tab 2 — Dubluri

- Listă cu toate dublurile, grupate pe secțiune
- Format: `🇲🇽 Mexic: MEX5, MEX12`
- Sus, două butoane:
  - **„Copiază lista"** → clipboard:
    ```
    Dubluri (23):
    Mexic: MEX5, MEX12
    Brazilia: BRA3, BRA7
    ...
    ```
  - **„Distribuie"** → Web Share API (deschide WhatsApp/SMS direct pe telefon, fallback la copy pe desktop)

### Tab 3 — Setări

- **Backup** → descarcă `stickere-YYYY-MM-DD.json` (toată cheia `panini-wc26-data`)
- **Restore** → upload `.json`, validează schema, suprascrie cu confirmare
- **Reset** → șterge tot, dublă confirmare
- Statistici: total / am / dubluri / lipsă

## Structura fișierelor

```
panini-wc2026/
├── index.html
├── styles.css
├── app.js              # SECTIONS const + logica UI + storage
├── sw.js               # service worker
├── manifest.json
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── README.md
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-12-panini-wc26-pwa-design.md
```

## Deploy

1. `gh repo create panini-wc2026 --public --source=. --remote=origin`
2. `git push -u origin main`
3. GitHub: Settings → Pages → Source: `main` / root → Save
4. URL: `https://<user>.github.io/panini-wc2026/`
5. Pe telefon: Chrome → meniu → „Add to Home Screen"

Numele pe home screen: **Panini WC26**.

## Considerații tehnice

**Service worker:** strategie cache-first pentru fișierele statice (HTML, CSS, JS, iconițele). Bump la `CACHE_VERSION` constantă în `sw.js` când se modifică fișierele pentru a forța refresh.

**Validare restore:** la upload JSON, verifică `version`, `stickers` să fie obiect, cheile să matcheze pattern-ul `[A-Z]{2,3}\d+`. Refuză și arată eroare dacă nu match.

**Web Share API:** disponibil pe mobile prin `navigator.share()`. Fallback: copy în clipboard cu toast „Copiat!".

**GitHub Pages + PWA gotcha:** `manifest.json` trebuie să folosească căi relative (`./icons/...`), nu absolute, pentru că app-ul e servit sub `/panini-wc2026/`, nu sub root. La fel pentru `start_url`.

## Testare

- Test manual pe Chrome desktop: ciclare stări, backup/restore, copiere clipboard
- Test pe telefon (Android Chrome): install prompt, funcționare offline (mod avion), Web Share
- Sanity check: dimensiune storage după bifare totală (~30KB max — OK)
