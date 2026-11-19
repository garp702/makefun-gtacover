# Palmera Heat — Cover Studio

[![Make GTA 6 Cover Art bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Palmera Heat rank](https://make.fun/badge/gta6-cover-art-01/garp702/makefun-gtacover/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Palmera Heat reward](https://make.fun/badge/gta6-cover-art-01/garp702/makefun-gtacover/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**Palmera Heat Cover Studio** turns your own photos into multi-panel
GTA-style key-art posters for the fictional sunset city of Palmera —
100% original artwork, no borrowed logos, art or fonts. Everything runs
offline in the browser from static files; photos are read on your own
machine and never uploaded.

## What it does

- **6 multi-panel layouts** — Hero Grid (6 panels), Classic Six, Film
  Strips (5), Duo Split, Magazine Four and Polaroid Scatter with tilted
  print-style cards.
- **8 studio key-art scenes painted in code** — Sunset Boulevard, Cover
  Star, Getaway Car, Skyline Bay, The Driver, Air Patrol, Harbour Run
  and Coast Rider — so a cover looks complete before you add a photo.
- **6 gradient-map colour grades** — Sunset Vice, Neon Nights, Teal &
  Orange, Golden Hour, Miami Mint and Poster Ink — with a posterize
  band slider (3–10) and a halftone dot screen, applied identically to
  painted scenes and to your photographs.
- **Your photos in any panel** — add or drop photos, click one then a
  panel to place it, drag to reframe, scroll or slide to zoom, auto-fill
  or shuffle.
- **Poster lettering** — big gradient title, neon script subtitle,
  tagline bar and a "NEW" starburst badge, all editable live.
- **PNG export in the three post sizes** — 1920 × 1080, 1080 × 1350
  and 1080 × 1080, rendered from the same code as the preview, so what
  you see is exactly what you share.

## Run it

Serve `app/` with any static file server and open `index.html` in a
desktop browser — no build step, no network requests. To hand the entry
in the way the grader does:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes the
`dossier.json` the judge reads, using the kit's `buildDossier`.

## Screenshots

`screenshots/` holds the maker's own shots of this app: an exported
1920 × 1080 cover, the editor with sample photos loaded, an exported
1080 × 1350 portrait cover and an exported 1080 × 1080 square cover —
each produced by the app itself via its `?shot=` modes (see
`shots.json`), never edited or composited.
