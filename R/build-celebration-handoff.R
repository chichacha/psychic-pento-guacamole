
# R/build-celebration-handoff.R

library(fs)

# Run from the repository root
stopifnot(file_exists("_quarto.yml"))

# 1. Files to include
files <- c(
  "experimental/celebration/index.qmd",
  "experimental/celebration/README.md",
  "experimental/celebration/how-it-works.qmd",
  "experimental/celebration/unity-handoff/README.md",
  "assets/js/celebration.js",
  "assets/css/celebration.css",
  "data/celebration.json",
  "data/characters.json",
  "assets/svg/caterpillar.svg",
  "assets/svg/butterfly.svg"
)

# 2. Validate the source files
missing <- files[!file_exists(files)]

if (length(missing) > 0) {
  stop(
    "Missing files:\n",
    paste(missing, collapse = "\n")
  )
}

# 3. Prepare a clean staging directory
staging <- path("dist", "gomasu-celebration")

if (dir_exists(staging)) {
  dir_delete(staging)
}

dir_create(staging, recurse = TRUE)

# 4. Copy files, preserving folder structure
for (file in files) {
  destination <- path(staging, file)
  
  dir_create(path_dir(destination), recurse = TRUE)
  file_copy(file, destination)
}

###. Adding extra step for usability.  README should be at top level
fs::file_copy(
  "experimental/celebration/unity-handoff/README.md",
  fs::path(staging, "README.md"),
  overwrite = TRUE
)

# 5. Create ZIP
zip_file <- path_abs(
  path("dist", "gomasu-celebration-v0.1.0.zip")
)

if (file_exists(zip_file)) {
  file_delete(zip_file)
}

# utils::zip uses an external zip utility.
# Check that it is available on your machine.
if (!nzchar(Sys.getenv("R_ZIPCMD")) &&
    !nzchar(Sys.which("zip"))) {
  stop("No ZIP utility found. Try zip::zipr() instead.")
}

old_dir <- getwd()
tryCatch({
  setwd(staging)
  utils::zip(
    zipfile = zip_file,
    files = files
  )
}, finally = {
  setwd(old_dir)
})

stopifnot(file_exists(zip_file))

# 6. Verify the ZIP contents
archived <- utils::unzip(zip_file, list = TRUE)$Name
stopifnot(all(files %in% archived))

message("🎉 Package created: ", zip_file)
