# Match Dad's and Chi's 6 x 10 pentomino solutions
# ------------------------------------------------------------
# Research question:
#   Which of Dad's 2,339 encoded solutions corresponds to which
#   of Chi's 2,339 board-text solutions?
#
# Inputs (relative to the project root):
#   data/solutions.csv
#   data/postures.json
#   data/pentomino_solution.csv
#
# Outputs (generated; source files are never modified):
#   data/derived/solution_crosswalk_6x10.csv
#   data/derived/solution_match_summary_6x10.csv
#   data/derived/unmatched_dad_6x10.csv
#   data/derived/unmatched_chi_6x10.csv
#
# Run from RStudio or Quarto:
#   source(here::here("R", "match_6x10_solutions.R"))

library(dplyr)
library(tidyr)
library(stringr)
library(purrr)
library(readr)
library(jsonlite)

# 1. Settings -------------------------------------------------

board_rows <- 6L
board_cols <- 10L
board_size <- board_rows * board_cols
piece_letters <- str_split("FILNPTUVWXYZ", "", simplify = TRUE) |> as.vector()

input_dir <- here::here("data")
output_dir <- here::here("data", "derived")

solution_path <- file.path(input_dir, "solutions.csv")
posture_path <- file.path(input_dir, "postures.json")
chi_path <- file.path(input_dir, "pentomino_solution.csv")

check <- function(condition, message) {
  if (!isTRUE(condition)) stop(message, call. = FALSE)
}

check(file.exists(solution_path), paste("Missing file:", solution_path))
check(file.exists(posture_path), paste("Missing file:", posture_path))
check(file.exists(chi_path), paste("Missing file:", chi_path))

# 2. Read Dad's posture definitions ----------------------------
# Each posture ID (e.g. N04) contains five relative [row, col, z] cells.

read_posture_cells <- function(path) {
  postures <- jsonlite::fromJSON(path, simplifyVector = FALSE)
  
  cells <- purrr::imap_dfr(postures, function(coordinates, posture_id) {
    check(length(coordinates) == 5L,
          paste("Posture does not contain five cells:", posture_id))
    
    check(all(lengths(coordinates) == 3L),
          paste("Invalid coordinate triple in posture:", posture_id))
    
    tibble(
      posture_id = posture_id,
      row_offset = map_dbl(coordinates, ~ as.numeric(.x[[1]])),
      col_offset = map_dbl(coordinates, ~ as.numeric(.x[[2]])),
      z = map_dbl(coordinates, ~ as.numeric(.x[[3]]))
    )
  })
  
  check(all(cells$z == 0), "Expected flat 2D postures (z = 0).")
  check(all(cells$row_offset == round(cells$row_offset) &
              cells$col_offset == round(cells$col_offset)),
        "Posture offsets must be integer cell coordinates.")
  
  cells
}

posture_cells <- read_posture_cells(posture_path)

# 3. Decode Dad's solution records -----------------------------
# Example: N044000 = posture N04, anchor row 4, anchor col 0.
# Every Answer contains 12 consecutive seven-character records.

read_dad_solutions <- function(path) {
  solutions <- readr::read_csv(path, show_col_types = FALSE) |>
    janitor::clean_names()
  
  check(all(c("group_number", "answer") %in% names(solutions)),
        "Dad's CSV must contain Group number and Answer columns.")
  check(!anyDuplicated(solutions$group_number),
        "Dad's CSV contains duplicate group numbers.")
  check(all(!is.na(solutions$answer) & nchar(solutions$answer) == 84L),
        "Every Answer must contain exactly twelve 7-character records.")
  
  solutions
}

decode_dad_pieces <- function(solutions, valid_postures) {
  pieces <- solutions |>
    mutate(token = str_extract_all(answer, ".{7}")) |>
    unnest_longer(token) |>
    mutate(
      posture_id = str_sub(token, 1, 3),
      shape = str_sub(token, 1, 1),
      anchor_row = as.numeric(str_sub(token, 4, 5)) / 10,
      anchor_col = as.numeric(str_sub(token, 6, 7)) / 10
    ) |>
    select(group_number, any_of("level"), posture_id, shape,
           anchor_row, anchor_col)
  
  check(all(pieces$posture_id %in% valid_postures),
        "A solution references an unknown posture ID.")
  check(all(!is.na(pieces$anchor_row) & !is.na(pieces$anchor_col) &
              pieces$anchor_row == round(pieces$anchor_row) &
              pieces$anchor_col == round(pieces$anchor_col)),
        "Anchor positions must be integer board coordinates.")
  check(all(pieces |> count(group_number) |> pull(n) == 12L),
        "Every Dad solution must contain twelve pieces.")
  check(all(pieces |> count(group_number, shape) |> pull(n) == 1L),
        "A Dad solution contains a repeated piece.")
  
  pieces
}

dad <- read_dad_solutions(solution_path)

# Validate token syntax BEFORE numeric conversion in the decoder.
check(all(str_detect(
  unlist(str_extract_all(dad$answer, ".{7}")),
  "^[FILNPTUVWXYZ][0-9]{6}$"
)), "Dad's Answer contains a malformed token.")

dad_pieces <- decode_dad_pieces(dad, unique(posture_cells$posture_id))

# 4. Reconstruct Dad's occupied board cells --------------------
# Each placement contributes five cells. Each solution must cover
# the 6 x 10 board once, with no overlap and no out-of-bounds cells.

dad_cells <- dad_pieces |>
  left_join(
    posture_cells |> select(-z),
    by = "posture_id",
    relationship = "many-to-many"
  ) |>
  transmute(
    group_number,
    shape,
    row = anchor_row + row_offset,
    col = anchor_col + col_offset
  )

board_validation <- dad_cells |>
  group_by(group_number) |>
  summarise(
    cells = n(),
    unique_cells = n_distinct(row, col),
    within_board = all(
      row >= 0 & row < board_rows &
        col >= 0 & col < board_cols
    ),
    valid = cells == board_size &
      unique_cells == board_size & within_board,
    .groups = "drop"
  )

check(nrow(board_validation) == nrow(dad) && all(board_validation$valid),
      "Some Dad boards are invalid. Inspect board_validation.")

# Convert ordered cells into a 60-letter row-major string.
# The row and column ordering is essential for comparison.

dad_boards <- dad_cells |>
  arrange(group_number, row, col) |>
  group_by(group_number) |>
  summarise(board = paste0(shape, collapse = ""), .groups = "drop")

# 5. Read Chi's 6 x 10 boards ---------------------------------

chi_boards <- readr::read_csv(chi_path, show_col_types = FALSE) |>
  filter(dim == "6×10") |>
  transmute(
    sol_idx,
    row_cnt,
    col_cnt,
    board = str_remove_all(sol_text, "\\s+")
  )

check(!anyDuplicated(chi_boards$sol_idx), "Chi has duplicate sol_idx values.")
check(all(chi_boards$row_cnt == board_rows &
            chi_boards$col_cnt == board_cols),
      "Chi's 6 x 10 board dimensions are inconsistent.")
check(all(nchar(chi_boards$board) == board_size),
      "Every Chi board must have 60 cells.")
check(all(str_detect(chi_boards$board, "^[FILNPTUVWXYZ]{60}$")),
      "Chi board contains an unexpected character.")

chi_boards <- chi_boards |> select(sol_idx, board)

# 6. Normalize board symmetries -------------------------------
# For a non-square 6 x 10 rectangle, only four transformations
# preserve its dimensions: identity, left-right reflection,
# up-down reflection, and 180-degree rotation.

symmetry_modes <- c("identity", "flip_lr", "flip_ud", "rotate_180")

transform_board <- function(board, mode) {
  cells <- str_split(board, "", simplify = TRUE) |> as.vector()
  grid <- matrix(cells, nrow = board_rows, ncol = board_cols, byrow = TRUE)
  
  transformed <- switch(
    mode,
    identity = grid,
    flip_lr = grid[, board_cols:1L, drop = FALSE],
    flip_ud = grid[board_rows:1L, , drop = FALSE],
    rotate_180 = grid[board_rows:1L, board_cols:1L, drop = FALSE]
  )
  
  check(!is.null(transformed), paste("Unknown symmetry mode:", mode))
  paste0(as.vector(t(transformed)), collapse = "")
}

canonical_board <- function(board) {
  variants <- vapply(
    symmetry_modes,
    function(mode) transform_board(board, mode),
    character(1)
  )
  min(variants)
}

dad_boards <- dad_boards |>
  mutate(canonical = vapply(board, canonical_board, character(1)))

chi_boards <- chi_boards |>
  mutate(canonical = vapply(board, canonical_board, character(1)))

# 7. Find exact and symmetry-equivalent matches ----------------
# Exact: the 60 letters are identical.
# Symmetry: the boards are equivalent after a whole-board transform.
# We keep every candidate instead of forcing a one-to-one mapping.

crosswalk <- dad_boards |>
  inner_join(
    chi_boards |> select(sol_idx, chi_board = board, canonical),
    by = "canonical",
    relationship = "many-to-many"
  ) |>
  mutate(
    match_type = if_else(board == chi_board, "exact", "symmetry")
  ) |>
  select(group_number, sol_idx, match_type) |>
  add_count(group_number, name = "dad_candidate_count") |>
  add_count(sol_idx, name = "chi_candidate_count") |>
  mutate(
    unique_pair = dad_candidate_count == 1L & chi_candidate_count == 1L
  ) |>
  arrange(group_number, sol_idx)

# 8. Summarize coverage and unmatched solutions ---------------

unmatched_dad <- dad_boards |>
  anti_join(crosswalk, by = "group_number")

unmatched_chi <- chi_boards |>
  anti_join(crosswalk, by = "sol_idx")

match_summary <- tibble(
  dad_solutions = nrow(dad_boards),
  chi_solutions = nrow(chi_boards),
  exact_pairs = sum(crosswalk$match_type == "exact"),
  symmetry_candidate_pairs = nrow(crosswalk),
  matched_dad = n_distinct(crosswalk$group_number),
  matched_chi = n_distinct(crosswalk$sol_idx),
  uniquely_matched_pairs = sum(crosswalk$unique_pair),
  ambiguous_candidate_pairs = sum(!crosswalk$unique_pair),
  unmatched_dad = nrow(unmatched_dad),
  unmatched_chi = nrow(unmatched_chi)
)

# 9. Export reproducible results -------------------------------

dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

write_csv(crosswalk, file.path(output_dir, "solution_crosswalk_6x10.csv"))
write_csv(match_summary, file.path(output_dir, "solution_match_summary_6x10.csv"))
write_csv(unmatched_dad, file.path(output_dir, "unmatched_dad_6x10.csv"))
write_csv(unmatched_chi, file.path(output_dir, "unmatched_chi_6x10.csv"))

print(match_summary)
