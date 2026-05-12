# Panini WC26

Personal PWA for tracking my Panini FIFA World Cup 2026 sticker album.
Have / duplicate / missing per sticker. Export duplicates list for trades.

Live: https://munteancd.github.io/panini-wc2026/

## Local dev
Open `index.html` in a browser, or serve with `python -m http.server 8000`.

Data lives in `localStorage`. Use Settings → Backup to export.

## Images

Sticker images under `images/` are scraped from [laststicker.com](https://www.laststicker.com/ro/cards/panini_world_cup_2026/).
They are © Panini / FIFA and used here strictly for personal, non-commercial tracking.
Coverage grows over time as the community uploads new ones — a weekly GitHub Action refreshes the folder automatically.
