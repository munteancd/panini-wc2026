# „Colecția mea" + auto-refresh imagini — Design

**Data:** 2026-05-13
**Status:** Aprobat
**Extinde:** PWA-ul existent

## Context

Adăugare tab nou „Colecția mea" care arată imaginile reale ale stickerelor deținute (have/dup). Sursa imaginilor: `laststicker.com` (URL pattern `https://www.laststicker.com/i/cards/12176/<cod_lowercase>.jpg`). Imaginile se stochează în `images/` în repo, se servesc local prin Pages, se re-fresh-uiesc săptămânal via GitHub Action.

## Scope

**Incluse:** 48 × 20 = 960 stickere de țară (MEX1..PAN20).
**Excluse:** FWC1-19 + 00 (Panini Logo) și CC1-14 — laststicker n-are imagini pentru ele. În tab nu apar deloc, chiar dacă sunt bifate.

## Obiective

- Tab „Colecția mea": grid cu imaginile stickerelor deținute, grupate pe țări
- Placeholder elegant pentru cele bifate dar fără imagine disponibilă
- Acoperire crește automat în timp prin GitHub Action săptămânal

## Non-obiective (amânate)

- Nume jucători (overlay text) — păstrat ca extensie viitoare
- Sticker FWC și CC cu imagini — așteptăm să apară pe laststicker sau găsim altă sursă
- Imagine la tap pe sticker în Album tab (modal preview)

## Arhitectură

### Scrape script

`scripts/scrape_images.py`:

```python
# Pentru fiecare cod XYZn (XYZ ∈ 48 country codes lowercase, n ∈ 1..20):
#   - Dacă images/XYZn.jpg există → skip
#   - Altfel: GET https://www.laststicker.com/i/cards/12176/xyzn.jpg
#   - Dacă 200 și body e imagine validă → salvează în images/XYZn.jpg
#   - Altfel: trece mai departe
# Raportează la stdout: cât are deja, cât a adăugat nou, cât e încă lipsă
```

Dependențe: `cloudscraper`, `Pillow` (validare imagine). Imaginile rămân JPG, dimensiune nativă (~25-40KB fiecare).

### GitHub Action

`.github/workflows/refresh-images.yml`:

- Cron weekly (Luni 06:00 UTC) + `workflow_dispatch` (rulare manuală)
- Setup Python 3.11, instalează deps
- Rulează `python scripts/scrape_images.py`
- Dacă `git diff --quiet images/` returnează diferențe → commit „Refresh sticker images (N noi)" + push
- Permisiuni: `contents: write`

### PWA — schimbări

**Bottom nav** devine 5 tab-uri:
```
📋 Album  |  🔁 Dubluri  |  ❌ Lipsă  |  🖼️ Colecția  |  ⚙️ Setări
```

**Tab nou `tab-collection`**:
- Renderează doar secțiunile de țară (skip FWC, CC)
- Pentru fiecare țară care are minim 1 sticker bifat (have/dup):
  - Header: `🇲🇽 Mexic (12/20)` — bifate / total
  - Grid de thumbnails (auto-fill, min 80px), pentru fiecare sticker bifat
  - Imaginea = `<img src="./images/MEX5.jpg" alt="MEX5" loading="lazy" onerror="this.replaceWith(<placeholder>)">`
  - Placeholder = `<div class="sticker-placeholder">MEX5</div>` (chenar gri cu codul)
  - Bordură verde pe „have", galbenă pe „dup", subtilă
- Dacă nu există nicio țară cu stickere bifate → mesaj „Nu ai bifat încă niciun sticker de țară."

**Service Worker**:
- NU precache `images/*` la install (s-ar lua 30MB la prima vizită)
- Strategie pentru `/images/*`: cache-on-demand (network-then-cache). La primul request reușit → salvăm. La requesturile următoare → servim din cache.

## Structura fișierelor

```
panini-wc2026/
├── .github/
│   └── workflows/
│       └── refresh-images.yml   # NEW
├── scripts/
│   └── scrape_images.py         # NEW
├── images/                       # NEW (populat după primul run)
│   ├── MEX1.jpg
│   ├── MEX2.jpg
│   └── ...
├── app.js                        # modificat (renderCollection)
├── index.html                    # modificat (5th tab)
├── styles.css                    # modificat (collection styles)
└── sw.js                         # modificat (image strategy)
```

## Considerații tehnice

**Hotlink prevention:** laststicker pare să servească imaginile direct fără verificare de Referer (am testat cu curl simplu, returnează 200). Dar din politețe către ei, descărcăm o singură dată și hostăm local pe GitHub Pages — nu hot-linkăm runtime.

**Repo size:** 960 imagini × ~30KB = ~28MB total când e plin. Sub limita soft de 1GB a Pages. Inițial probabil ~15-18MB cu acoperirea actuală.

**Disclaimer copyright:** README primește o secțiune „Imaginile sunt © Panini / FIFA, agregate de la laststicker.com, folosite doar pentru evidență personală non-comercială."

**Cache busting la update:** când Action-ul adaugă imagini noi, SW-ul vechi servește versiunea cached. Strategia network-then-cache pe `/images/*` rezolvă asta natural — imaginile noi se descarcă la prima accesare după update.

## Testare

- **Local:** rulează `python scripts/scrape_images.py` o dată, verifică folderul `images/`
- **Tab Colecția:** bifează câteva stickere, deschide tab-ul, vezi imaginile reale + placeholdere unde lipsesc
- **Action:** declanșează manual din UI (Actions → workflow → Run), verifică log-ul, verifică că pushează commit nou cu imagini
