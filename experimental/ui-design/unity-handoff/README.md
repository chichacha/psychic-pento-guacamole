# Unity handoff — Gomasu UI Design Kit (#81)

## Non-negotiable layout
- Keep Dad’s existing composition: gear/title, Check/Hint/navigation/belt row, counters/puzzle number/level, **horizontal 10 columns × 6 rows**, remaining pieces below.
- Puzzle board stays 10×6 in all screen sizes/orientations; cells must stay square. Never transpose to 6×10.
- On completion, **replace the remaining-pieces region** with celebration content; no separate celebration screen or board relocation.
- On revisiting a solved puzzle, show the static final celebration state, no animation replay.
- Rainbow only if no hints and no checks. Butterfly and caterpillar remain visible. (Actual hint/check character rules should follow existing celebration spec #80.)
- Existing board data and game logic remain authoritative; prototype cells and piece arrangements are only illustrative.

## Assets and portability
- `assets/backgrounds/`: three original vector motifs; scale/crop behind controls and board. Do not obscure touch targets.
- `assets/icons/`: settings, arrows, hint, check icons.
- `assets/pieces/`: 12 pentomino SVGs using Dad's exact colours. **Verify orientation/geometry against actual app data before use**; these are visual placeholders, not puzzle definitions.
- `assets/celebration/`: rainbow, butterfly, caterpillar, confetti. Simplified editable vectors, not traced copies of concept art.
- `design-tokens.json`: colour, layout, belt tokens; use as shared source of intent, not automatic Unity runtime configuration.

## Framework choice
- uGUI: Canvas + RectTransforms + CanvasScaler + Image/Button/TextMeshPro. Implement 10×6 board in a constrained RectTransform with fixed aspect ratio, safe area, and responsive scaling. Reuse the lower-slot RectTransform for either tray or celebration.
- UI Toolkit: UXML + USS + C#; use a fixed-aspect board container, flex layouts for surrounding controls, and switch lower-slot child visibility by puzzle state.
- SVG import in Unity may need Vector Graphics package or rasterized sprites. Test on target Unity version; don't assume SVG is plug-and-play.
- Device safe areas, text localization, accessibility and performance require native testing on iOS, Android, and Kindle Fire.

## Behaviour
`playing -> completed (animation) -> revisit (static)`; puzzle board and header persist throughout. Web controls simulate these states only.

## What this prototype does not do
No real puzzle solving, dragging, save state, or production-ready Unity implementation. The supplied reference screenshot (#0672) is the layout reference, not a validated full board state.
