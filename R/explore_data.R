# Optional R exploration — run interactively from the project root.
# install.packages(c("jsonlite", "dplyr", "purrr", "readr", "stringr", "tidyr", "janitor"))
library(jsonlite)
library(dplyr)
library(purrr)
library(readr)
library(stringr)
library(tidyr)
library(janitor)

posture_db <- fromJSON("data/postures.json", simplifyVector = TRUE)
piece_cells <- posture_db |>
  imap_dfr(\(coords, shape_id) {
    as_tibble(coords, .name_repair = ~c("row_offset", "col_offset", "z")) |>
      mutate(shape_id = shape_id, .before = 1)
  }) |>
  mutate(shape = str_sub(shape_id, 1, 1), orientation = str_sub(shape_id, 2, 3))

sol <- read_csv("data/solutions.csv", show_col_types = FALSE) |> clean_names()

# Each answer consists of 12 seven-character placements.
decode_solutions <- function(sol) {
  sol |>
    mutate(piece_answer = str_extract_all(answer, ".{7}")) |>
    unnest_longer(piece_answer) |>
    transmute(group_number, level,
              shape_id = str_sub(piece_answer, 1, 3),
              shape = str_sub(shape_id, 1, 1),
              anchor_row = as.numeric(str_sub(piece_answer, 4, 5)) / 10,
              anchor_col = as.numeric(str_sub(piece_answer, 6, 7)) / 10)
}
solution_pieces <- decode_solutions(sol)
print(sol |> count(level))
print(piece_cells |> count(shape))

# TODO: Validate coordinate axes and anchor placement against the app's board
# before calculating adjacency or animating full solutions.
