# 五マス村 — Data catalog

> **Purpose:** A living inventory of the datasets used to research, explain, and illustrate pentominoes in 五マス村 (Gomasu Village).
>
> **Status:** Working documentation. `TODO` means a detail has not yet been verified; it is not an invitation to guess.

## How to use this catalog

- **Source data** records mathematical definitions or solutions collected or created independently. Preserve its original meaning and document any transformations separately.
- **Editorial data** gives mathematical pieces their names, personalities, colours, and other storytelling attributes.
- **Derived data** is produced reproducibly from source data by scripts in `R/`.
- **Grain** means what a single record represents. **Key** means the field or combination of fields intended to identify it uniquely; proposed keys should be validated.

The file paths below describe the working project layout. Adjust entries if the repository uses different locations or filenames.

## Inventory

| File | Role | Grain | Origin / producer | Notes |
|---------------|---------------|---------------|---------------|---------------|
| [`characters.json`](characters.json) | Editorial | One pentomino character | 五マス村 character design | Twelve characters, one for each free pentomino shape |
| [`postures.json`](postures.json) | Source / reference | One fixed pentomino orientation | Dad's `Posture_DB_revised.json` | 63 posture definitions; five relative cells per posture |
| [`character_postures.json`](character_postures.json) | Editorial | TODO: verify record structure | 五マス村 presentation data | Posture-specific display or character metadata; inspect schema |
| [`solutions.csv`](solutions.csv) | Source | One encoded 6×10 solution | Dad's `Hint_pattern_6x10.csv` | 2,339 rows; placement-based representation |
| [`pentomino_solution.csv`](pentomino_solution.csv) | Source | One solution for a specified puzzle configuration | Chi's independently collected dataset | 33,008 rows across configurations; 2,339 rows where `dim == "6×10"` |
| [`derived/solution_crosswalk_6x10.csv`](derived/solution_crosswalk_6x10.csv) | Derived | One candidate Dad–Chi solution pairing | `R/match_6x10_solutions.R` | Matching accounts for board symmetries; see validation notes |
| [`derived/solution_match_summary_6x10.csv`](derived/solution_match_summary_6x10.csv) | Derived | One comparison summary | `R/match_6x10_solutions.R` | Aggregate match and coverage metrics |
| [`derived/unmatched_dad_6x10.csv`](derived/unmatched_dad_6x10.csv) | Derived | One unmatched Dad solution | `R/match_6x10_solutions.R` | Empty when all Dad solutions match |
| [`derived/unmatched_chi_6x10.csv`](derived/unmatched_chi_6x10.csv) | Derived | One unmatched Chi solution | `R/match_6x10_solutions.R` | Empty when all Chi solutions match |

> **Availability:** A catalog entry does not imply that a generated file is committed to Git. Derived outputs can be regenerated locally. If an entry does not exist in your checkout, update the inventory or document how to generate it.

## Dataset details

### `postures.json` — fixed pentomino orientations

- **Origin:** Dad's posture database, previously named `Posture_DB_revised.json`.
- **Purpose:** Define the five occupied cells of each orientation relative to an anchor.
- **Structure:** JSON object keyed by posture IDs such as `N04`; each value is a collection of five coordinate triples, interpreted by the comparison script as `[row_offset, col_offset, z]`.
- **Key:** Posture ID, e.g. `N04`.
- **Expected scope:** 63 distinct fixed orientations of the 12 pentominoes.
- **Assumption for 6×10 comparison:** `z = 0`; offsets are integer cell units.
- **Used by:** `solutions.csv` decoder and `R/match_6x10_solutions.R`.
- **TODO:** Record original creation/version date and verify coordinate conventions against Dad's own documentation.

### `solutions.csv` — Dad's encoded 6×10 solutions

- **Origin:** Dad's `Hint_pattern_6x10.csv`.

- **Grain:** One complete 6×10 pentomino arrangement per row.

- **Rows observed:** 2,339.

- **Fields:**

  | Field | Meaning |
  |------------------------------------|------------------------------------|
  | `Group number` | Dad's solution identifier, e.g. `#0001` |
  | `Level` | Puzzle-level metadata; not required for full-board matching |
  | `Answer` | Twelve concatenated seven-character placement tokens |

- **Encoding used in analysis:** Each token is a piece letter, two-digit posture code, two-digit anchor-row code, and two-digit anchor-column code. The analysis divides each encoded anchor coordinate by 10; for example, `N044000` is interpreted as posture `N04`, anchor row 4, column 0.

- **Decoding dependency:** `postures.json`.

- **Validation:** Every reconstructed solution should occupy 60 distinct cells inside a 6×10 board, with each of the 12 pieces represented once.

- **TODO:** Confirm the meaning of `Level` and record source creation/version details.

### `pentomino_solution.csv` — Chi's collected solutions

- **Origin:** External collection assembled independently of Dad's solutions. **Original external source: TODO. Retrieval date: TODO.** Do not substitute the GitHub hosting URL for the original provenance.

- **Current hosted copy:** [chichacha/pentomino — pentomino_solution.csv](https://github.com/chichacha/pentomino/blob/main/pentomino_solution.csv).

- **Grain:** One board solution for one puzzle configuration (`dim`). Not every row is a complete 12-piece 6×10 pentomino tiling.

- **Rows observed:** 33,008 across configurations; 2,339 where `dim == "6×10"`.

- **Fields:**

  | Field | Meaning |
  |------------------------------------|------------------------------------|
  | `dim` | Puzzle configuration identifier, e.g. `6×10` |
  | `sol_text` | Row-major board representation using piece letters; rows separated by whitespace |
  | `row_cnt` | Number of board rows |
  | `col_cnt` | Number of board columns |
  | `sol_idx` | Solution index within the relevant configuration; validate uniqueness within `dim` |

- **Comparison convention:** For the 6×10 subset, remove whitespace from `sol_text` to obtain a 60-character board key.

- **TODO:** Record the original source, any license/attribution requirements, retrieval date, and transformations applied during collection.

### `characters.json` — 五マス村 residents

- **Role:** Editorial.
- **Purpose:** Give each of the twelve pentomino shapes a recognizable character identity.
- **Expected grain:** One record per shape (F, I, L, N, P, T, U, V, W, X, Y, Z).
- **Potential join key:** Shape letter; verify the actual JSON field name and uniqueness.
- **TODO:** Document actual fields, authoring conventions, and the source of any illustrations.

### `character_postures.json` — posture presentation data

- **Role:** Editorial.
- **Purpose:** Associate mathematical orientations with presentation information used in the site.
- **TODO:** Inspect the JSON structure before asserting its grain, keys, or field definitions. Record how its posture references relate to `postures.json`.

### `derived/solution_crosswalk_6x10.csv` — Dad ↔ Chi correspondence

- **Producer:** `R/match_6x10_solutions.R`.
- **Inputs:** `solutions.csv`, `postures.json`, and the 6×10 subset of `pentomino_solution.csv`.
- **Grain:** One candidate pairing between a Dad group number and a Chi solution index.
- **Fields expected:** `group_number`, `sol_idx`, `match_type`, `dad_candidate_count`, `chi_candidate_count`, `unique_pair`.
- **Matching method:** Reconstruct Dad's 60-cell board, normalize Chi's board text, then compare exact boards and their rectangle-preserving symmetries: identity, left/right reflection, up/down reflection, and 180° rotation.
- **Observed result:** The latest reported analysis found **0 unmatched Dad solutions, 0 unmatched Chi solutions, and 0 ambiguous candidate pairs**. Preserve the full generated summary as evidence; rerun after source or logic changes.
- **Research record:** `analysis/compare_6x10_solutions.qmd`.

## Relationships and lineage

``` text
postures.json ────────┐
                      ├── R/match_6x10_solutions.R ──> data/derived/*
solutions.csv ────────┤                                │
pentomino_solution.csv┘                                └── analysis/compare_6x10_solutions.qmd

characters.json ───────────────> storytelling / character UI
character_postures.json ───────> posture presentation / character UI
```

The source datasets have different representations:

- **Dad:** a solution is twelve piece placements (shape + posture + position).
- **Chi:** a solution is a board of occupied cells labelled by shape.
- **Crosswalk:** a verified correspondence between the two representations, allowing for whole-board symmetry.

## Reproducing the comparison

From an R session opened at the repository root:

``` r
source(here::here("R", "match_6x10_solutions.R"))
```

Then render `analysis/compare_6x10_solutions.qmd` locally to review the findings. Rendering a local QMD does **not** publish it to the website. Confirm the project root with `here::here()` if file paths fail.

## Maintenance rules

1.  **Do not overwrite original source files** during transformations.
2.  **Record provenance honestly.** Unknown dates, authors, and licensing remain `TODO` until verified.
3.  **Update this catalog** when a file, field, interpretation, or generating script changes.
4.  **Keep research outputs reproducible.** Derived files should point to their producing script and input dependencies.
5.  **Review publication boundaries.** A file committed to a public GitHub repository is publicly accessible even if it is excluded from the Quarto website.

## Open documentation questions

- [x] Confirm the original external source and retrieval date of Chi's solution collection.
- [ ] Record Dad's posture and solution file version dates and intended `Level` semantics.
- [ ] Inspect and document the actual schemas of both editorial JSON files.
- [ ] Verify keys and record counts programmatically for all cataloged datasets.
- [x] Decide which derived CSVs belong in Git and which should be generated locally.
