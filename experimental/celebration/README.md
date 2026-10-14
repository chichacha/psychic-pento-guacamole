# 🎉 お祝いシミュレーター — Celebration Playground

> **ひみつの実験室 / Secret Lab · Experiment 002**  
> **Status:** Exploratory web prototype — **not** part of the production Unity game  
> **Related:** [Issue #30 — Celebration screen](https://github.com/chichacha/psychic-pento-guacamole/issues/30) · [Issue #45 — Progress summary](https://github.com/chichacha/psychic-pento-guacamole/issues/45)

## Why this exists

What if completing a pentomino puzzle felt like a tiny illustrated celebration, with a different personality depending on *how* the player solved it?

This page is a **visual and interaction simulation** built with Quarto, HTML, CSS, JavaScript, SVG and JSON. It is a place to experiment, show Dad a working idea, and gather feedback **before** discussing changes to his Unity app.

**Prototype first. Propose later.**  
**まず作る。あとで提案。採用されるかどうかは、また別の話。**

The goal is **not** to port the web page directly into Unity. The goal is to communicate the desired appearance, behaviors and rules clearly enough that the Unity implementation can be designed separately.

## Design philosophy from Dad

Dad designed the puzzle dataset and saved state to address frustrations of playing with physical pentominoes:

| Physical puzzle friction | App design response |
| --- | --- |
| To play again, a finished arrangement must be dismantled; the achievement disappears. | Preserve completed puzzle results. |
| A player may give up because a puzzle seems impossible. | Each puzzle has at least one guaranteed solution. |
| Stopping halfway means packing away the physical pieces. | Preserve the board, including incomplete or incorrectly placed pieces, so play can resume later. |

**「完成した成果を壊さず残す」** — Preserve what the player has accomplished.

Dad has explained that the app stores data for **2,339 puzzles × 3 modes = 7,017 puzzle/mode records**. Each record remembers **Hint count, Check count, and placed/stored pieces**, including incorrect placements. Confirm the exact schema and counter semantics against the Unity project before integrating anything.

The celebration experiment extends that philosophy: a completion should feel rewarding, whether the player solved independently, asked for hints, checked their work, or did both.

## Current design concept

| Input | Visual response | Meaning |
| --- | --- | --- |
| **Hint = 0, Check = 0** | Extra-generous candy-shaped confetti | A joyful independent discovery 🎊 |
| **Hint > 0** | Cute caterpillars along the ground; more hints can mean more caterpillars | A helping hand and growth 🐛 |
| **Check > 0** | Butterflies floating among the confetti | Careful progress: 石橋を叩いて渡る 🦋 |
| **Hint > 0, Check > 0** | Caterpillars **and** butterflies | Different approaches can coexist |
| **Last successfully placed piece** | The selected pentomino character appears at center | Make the completion personal |
| **Level 1–10** | Increasing variety of simple confetti shapes | Visual richness, not a score or judgment |

**Everyone who completes a puzzle is celebrated.** Hints are not cheating; checks are not failure. An unassisted solve gets *bonus* confetti, not exclusive permission to celebrate.

### Current visual direction

- **Caterpillars remain on the ground.** Their current cute appearance is intentional; no need to make them climb onto the character.
- **Butterflies float among confetti**, with varied wing colors and gentle upright tilts; they can layer **in front of** the character.
- **Confetti uses simple, outline-free SVG shapes** (including candy shapes), with varied sizes and rotations.
- **Particles stop around the middle of the scene and remain visible**, rather than falling all the way to the ground or fading out.
- **Colors come automatically from the existing 12 Gomasu character colors.** No palette-selector UI is needed.
- The scene should remain legible and not bury the character's face in particles.

These are **design choices for the illustration prototype**, not specifications for Unity's rendering or particle system.

## Files and responsibilities

Paths are relative to the **repository root**:

| File | Purpose |
| --- | --- |
| `experimental/celebration/index.qmd` | Quarto page, HTML structure, simulation controls and page content |
| `assets/css/celebration.css` | Layout, layers (`z-index`), styling, keyframes, positioning and animation presentation |
| `assets/js/celebration.js` | Reads data, draws character SVG, composes celebration props/particles and handles controls |
| `data/celebration.json` | Localized celebration messages and configuration, including prop limits |
| `data/characters.json` | Existing character names, shapes/IDs and canonical colors used by this experiment |
| `assets/svg/caterpillar.svg` | Caterpillar illustration displayed for hints |
| `assets/svg/butterfly.svg` | Butterfly asset/reference, where applicable; check the current implementation, as butterflies may also be generated inline in JavaScript |

> **Important:** In the current JavaScript, `candySVG()` and `butterflySVG()` generate inline SVG markup. Editing an external `butterfly.svg` alone may **not** change the floating butterflies. Check the code path actually used before modifying an asset.

### Where to tweak the look

Search `assets/js/celebration.js` for the following functions and variables:

| Change | Find |
| --- | --- |
| Character size, face and five-square drawing | `svg(shape)` |
| Caterpillar count and cap | `addProps()` / `config.maxVisibleProps` |
| Candy geometry and outline | `candySVG()` / `stroke="none"` |
| Butterfly wings, markings and outline | `butterflySVG()` |
| Amount of confetti | `const count = perfect ? 46 : 20` *(current prototype value; may change)* |
| Confetti shape variety by level | `const kinds` |
| Confetti colors | `palette()` |
| Particle landing zone | `midTop` and `midSpan` |
| Particle size, timing, drift and rotation | CSS custom properties set in `celebrate()` (`--size`, `--duration`, `--delay`, `--drift`, `--rotation-start`, `--rotation-end`) |
| Butterfly size, count and gentle tilt | Butterfly loop inside `celebrate()` |
| Messages and language fallback | `data/celebration.json`, `t(key)` |

In `assets/css/celebration.css`, look for `.lab-particle`, `.lab-butterfly-particle`, character/stage rules, and the particle animation keyframes. **CSS `z-index` only works as expected within compatible stacking contexts**; verify actual layers in the browser.

The JS file may include `🎨 TWEAK` comments to make the most useful adjustments easy to find.

## Language strategy 🌐

- Author short player-facing messages in **Japanese (`ja`) and English (`en`)**.
- If another language is selected or requested, **fall back to English** for this experiment.
- Keep text **outside decorative SVG images** so illustrations can be reused without making language-specific artwork.
- Translate for tone and feeling, not necessarily word-for-word.

Example phrases (confirm the actual keys and wording in `data/celebration.json`):

| Situation | Japanese | English |
| --- | --- | --- |
| Completion | できた！ | You did it! |
| No hints or checks | ひらめいた！ | Brilliant! |
| Hints used | 助けてもらって、できた！ | A helping hand! |
| Checks used | たしかめながら、できた！ | Steady and sure! |
| Replay | もう一回！ | Again! |

## How to preview locally

1. Place the files in their paths within the Gomasu repository, preserving the directory structure.
2. From the **repository root**, run:

   ```bash
   quarto preview
   ```

3. Open the celebration page at the URL produced by Quarto (normally `experimental/celebration/` in the site).
4. Change the **piece**, **Hint**, **Check**, **level** and **language** controls, then press the celebration/replay buttons.
5. Inspect the page at **mobile width** as well as desktop width.

**Quarto HTML note:** If the interactive markup in `index.qmd` is misinterpreted by Pandoc, keep the entire custom HTML section in a fenced raw-HTML block:

````markdown
```{=html}
<div id="celebration-lab">
  <!-- interactive interface -->
</div>
```
````

The exact DOM IDs used by the JavaScript must match those in `index.qmd`.

## Data and behavior contract for a possible Unity handoff

The web page currently uses **manual simulation controls**, not a connection to Dad's game data. A Unity version should obtain the equivalent inputs from the real game at the appropriate completion event:

```json
{
  "mode": "white_belt",
  "puzzleId": "example-puzzle-id",
  "level": 5,
  "lastPlacedPiece": "F",
  "hintCount": 2,
  "checkCount": 1,
  "placedPieces": ["F", "I", "L"]
}
```

**Illustrative contract only:** Field names, mode IDs, puzzle IDs, availability of the last-placed piece, and whether counts are per attempt or cumulative **must be verified** in the Unity code. Do not assume this JSON matches the actual save format.

### Behavioral rules (conceptual)

```text
Always: show a positive completion message and a celebratory scene.
If hintCount > 0: show caterpillars (cap visible count for readability).
If checkCount > 0: show butterflies (cap visible count for readability).
If hintCount == 0 AND checkCount == 0: add extra confetti/candy.
Use the completed piece to select the character.
Use the canonical character palette for decorative colors.
Use level to vary confetti shapes, not to judge the player.
Keep the scene visible until the player dismisses it or moves on.
```

## Handoff to Dad / Claude Code (Unity)

If Dad likes the concept, share **the working page URL plus this README and the source files listed above**. The moving prototype is the visual reference; the files document how it was assembled.

Suggested instruction to Claude Code:

> Review `experimental/celebration/README.md`, the celebration page, and its CSS, JS, JSON and SVG dependencies as a **visual and behavioral reference**. Inspect the existing Unity project, version, UI system, game-completion event, persistence model, and localization implementation **before** proposing changes. Recreate the approved visual behaviors using appropriate Unity components/C# rather than attempting to run the Quarto page or CSS/JS directly. Preserve all existing puzzle logic, saved states, and completed results. Start with one isolated, reversible prototype; identify assumptions and ask for confirmation before changing production game behavior.

### Unity implementation notes

- The HTML/CSS/JS implementation is **not directly portable** to Unity; animation, layout, layering, input events and rendering will need Unity equivalents.
- SVG artwork, palette values, JSON copy, and composition rules are reusable **references/assets**, subject to the Unity project's supported asset import and UI setup.
- Keep **content (text/data)**, **visual assets**, and **celebration rules** separate to avoid creating dozens of language-specific congratulation images.
- Honor reduced-motion and readability needs where feasible.
- Verify mobile performance and screen-safe placement of particles.
- Do **not** alter how puzzles are saved, how hints/checks work, or how solutions are validated as part of this visual experiment.

## Scope / not in scope

**In scope now:** A convincing, mobile-friendly web simulation that communicates the illustration and animation concept and is easy to tweak.

**Not in scope now:** Replacing the production Unity screen, integrating live saved-puzzle data, implementing all eight languages, recreating Unity animation infrastructure, or turning Hint/Check counts into a player score.

## Feedback to capture

- Do the caterpillars, butterflies and confetti feel delightful rather than distracting?
- Can the player still clearly see the completed character and message?
- Are the Hint/Check metaphors understandable without explanatory text?
- Does the scene work on a small phone screen?
- Which details does Dad actually want to adopt, change or leave out?

**Secret Lab rule:** The prototype is a conversation starter, not an approved redesign. 🥑