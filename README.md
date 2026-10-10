# 五マスの人たち。 — Pentomino companion site

A small, Japanese-first Quarto website accompanying a family-made pentomino mobile app and 3D-printed puzzle pieces.

## Start in RStudio

1. Unzip this folder and open it as your working directory in RStudio.
2. Ensure [Quarto](https://quarto.org/) is available (RStudio's Quarto integration is fine).
3. In the RStudio Terminal run `quarto preview` (or `quarto render` to generate `docs/`).
4. The working character gallery is at `/characters/` and loads the included JSON files.

**Important:** Don't double-click the generated HTML using `file://`; browser security can block JSON `fetch()`. Use Quarto preview or a local web server.

## Files

- `_quarto.yml` — website configuration; GitHub Pages output is `docs/`.
- `index.qmd` — home page, existing hero and introductory sections.
- `about.qmd` — relationship between physical puzzle, mobile app, companion site.
- `characters/index.qmd` — working gallery of 12 pieces with orientation buttons.
- `discover/`, `neighbours/`, `solutions/` — **draft placeholders**, not in navigation yet.
- `assets/css/style.css` — commented, reusable site-wide CSS plus gallery styles.
- `assets/js/characters.js` — dependency-free SVG renderer for the gallery.
- `data/postures.json` — 63 real piece postures, from `Posture_DB_revised.json`.
- `data/solutions.csv` — 2,339 puzzle records, from `Hint_pattern_6X10.csv`.
- `data/characters.json` — character names, palette, quotes, orientation counts.
- `R/explore_data.R` — optional R data exploration / decoding.

## Design notes

- Mathematical geometry and invented character personalities are kept separate.
- The gallery currently draws **plain geometric SVGs**, not final illustrated character faces.
- Its orientation button cycles through stored postures; it is not a physical rotation animation yet.
- Adjacency and animated full-board solutions are **future features**. Validate placement coordinate conventions against the mobile app first.
- The 2,339 rows are puzzle records; three belt modes offer potentially 7,017 mode × puzzle combinations, not 7,017 unique layouts.
- Source data is bundled for local exploration. If you do not want to publish the complete solution file, remove `data/solutions.csv` from public resources before deploying.

## GitHub Pages

Render with `quarto render`, commit the generated `docs/` folder, then configure Pages to deploy from your branch's `/docs` folder. Do not overwrite your existing Git repository's `.git` directory when copying these starter files.
