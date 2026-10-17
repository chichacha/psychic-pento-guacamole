# 山は、数式でできている。 🌄

Interactive research note for [issue #84](https://github.com/chichacha/psychic-pento-guacamole/issues/84).

## Files
- `index.qmd` — Japanese research story and accessible controls
- `mountain.js` — deterministic SVG sine-wave generator (vanilla JS)
- `mountain.css` — responsive lab styling

## Preview
From the repository root:

```bash
quarto preview research/mountain-generator/index.qmd
```

If the website project renders all pages, that's fine too. No R packages needed.

## Design rules
- Belt controls palette and *default* roughness; roughness remains editable.
- Level influences broad wave frequency and phase.
- Puzzle number deterministically chooses phases; the same inputs recreate the same view.
- Mist blends each layer toward the sky colour, strongest in the distance; it does not change geometry.
- This is stylized mathematical scenery, not a geological model.

## Next
Link the article from `research/index.qmd` when ready; compare with UI experiment #81 and Unity architecture #83.
