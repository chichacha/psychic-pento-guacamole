# 身体測定室 — 制作メモ

**Story 002:** [body-measurement.qmd](body-measurement.qmd)

- `../assets/js/body-measurement.js` — shapes, measurements, event listeners, SVG rendering.
- `../assets/css/body-measurement.css` — responsive story layout.
- `../data/characters.json` — shared names and colors, fetched at runtime.

## JavaScript concepts to learn

1. **Object / Array:** Each shape has five coordinate pairs.
2. **Function:** `dimensions(cells)` calculates bounding-box width and height.
3. **Event listener:** Buttons select a villager or rotate the shape.
4. **State:** `selected`, `turns`, and `measured` track reader actions.
5. **SVG DOM:** Five `rect` elements draw the current shape.
6. **Fetch:** Reuse the existing character catalog instead of duplicating names and colors.

This is a playful story, **not** a mathematically optimized orb calculator. The orb investigation remains a separate idea in issue #92.

## Local preview

Run `quarto preview stories/body-measurement.qmd` from the repository root, or render the whole site. Use a local web server rather than opening the generated HTML directly as a `file://` URL because the page fetches JSON.
