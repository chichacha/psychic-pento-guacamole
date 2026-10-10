// ===================================================
// PENTOMINO · CHARACTER GALLERY
// ===================================================
// All shapes use the same canvas and square size.
// Rotations and reflections are derived from geometry.
// ===================================================


const gallery = document.querySelector("#character-gallery");
const NS = "http://www.w3.org/2000/svg";

const CANVAS_SIZE = 180;
const TILE_SIZE = 30;


// ---------------------------------------------------
// 1. GEOMETRY HELPERS
// ---------------------------------------------------

// Move the shape so its minimum x and y are zero.
function normalizeCells(cells) {
  const minX = Math.min(...cells.map(c => c[0]));
  const minY = Math.min(...cells.map(c => c[1]));

  return cells.map(([x, y]) => [
    x - minX,
    y - minY
  ]);
}

// Rotate a shape clockwise by 90 degrees.
function rotateCells(cells) {
  return normalizeCells(
    cells.map(([x, y]) => [-y, x])
  );
}

// Reflect the shape horizontally.
function flipCells(cells) {
  return normalizeCells(
    cells.map(([x, y]) => [-x, y])
  );
}

// A consistent representation for comparing shapes.
function shapeSignature(cells) {
  return normalizeCells(cells)
    .map(([x, y]) => `${x},${y}`)
    .sort()
    .join("|");
}


// ---------------------------------------------------
// 2. SVG RENDERER
// ---------------------------------------------------

function makeShapeSVG(cells, fill, name) {
  const normalized = normalizeCells(cells);

  const width =
    Math.max(...normalized.map(c => c[0])) + 1;

  const height =
    Math.max(...normalized.map(c => c[1])) + 1;

  // Center the shape inside the fixed canvas.
  const offsetX =
    (CANVAS_SIZE - width * TILE_SIZE) / 2;

  const offsetY =
    (CANVAS_SIZE - height * TILE_SIZE) / 2;

  const svg = document.createElementNS(NS, "svg");

  svg.setAttribute(
    "viewBox",
    `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`
  );

  svg.setAttribute("class", "character-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    `${name}：5つの正方形`
  );

  normalized.forEach(([x, y]) => {
    const rect = document.createElementNS(NS, "rect");

    rect.setAttribute("x", offsetX + x * TILE_SIZE);
    rect.setAttribute("y", offsetY + y * TILE_SIZE);

    rect.setAttribute("width", TILE_SIZE);
    rect.setAttribute("height", TILE_SIZE);
    rect.setAttribute("rx", 3);

    rect.setAttribute("fill", fill);
    rect.setAttribute("stroke", "#302B32");
    rect.setAttribute("stroke-width", 1.2);

    svg.append(rect);
  });

  return svg;
}


// ---------------------------------------------------
// 3. CHARACTER GALLERY
// ---------------------------------------------------

async function renderGallery() {
  if (!gallery) return;

  try {
    const [charactersResponse, posturesResponse] =
      await Promise.all([
        fetch(gallery.dataset.characters),
        fetch(gallery.dataset.postures)
      ]);

    if (!charactersResponse.ok || !posturesResponse.ok) {
      throw Error("Data files could not be loaded");
    }

    const characters = await charactersResponse.json();
    const postures = await posturesResponse.json();

    gallery.replaceChildren();

    characters.forEach(character => {

      const keys = Object.keys(postures)
        .filter(key => key.startsWith(character.shape))
        .sort();

      if (!keys.length) return;

      // Use the first stored posture as the base shape.
      // Ignore z because this is a 2D gallery.
      const baseCells = postures[keys[0]]
        .map(([x, y]) => [x, y]);

      let rotation = 0;
      let flipped = false;

      // Generate all orientations from geometry.
      const getCurrentCells = () => {
        let cells = normalizeCells(baseCells);

        if (flipped) {
          cells = flipCells(cells);
        }

        for (let i = 0; i < rotation; i++) {
          cells = rotateCells(cells);
        }

        return cells;
      };

      // Count distinct geometric orientations.
      const signatures = new Set();

      for (const mirror of [false, true]) {
        let cells = mirror
          ? flipCells(baseCells)
          : normalizeCells(baseCells);

        for (let r = 0; r < 4; r++) {
          signatures.add(shapeSignature(cells));
          cells = rotateCells(cells);
        }
      }

      const orientationCount = signatures.size;

      // ---------------------------------------------
      // Card elements
      // ---------------------------------------------

      const card = document.createElement("article");
      card.className = "character-card";

      const label = document.createElement("div");
      label.className = "character-en";
      label.textContent =
        `${character.shape} · ${character.title_en}`;

      const figure = document.createElement("div");
      figure.className = "character-figure";

      const name = document.createElement("h2");
      name.textContent = character.name_ja;

      const quote = document.createElement("p");
      quote.className = "character-quote";
      quote.textContent = character.quote;

      const meta = document.createElement("div");
      meta.className = "shape-meta";

      const controls = document.createElement("div");
      controls.className = "character-controls";

      // ---------------------------------------------
      // Update visual and metadata
      // ---------------------------------------------

      function update() {
        figure.replaceChildren(
          makeShapeSVG(
            getCurrentCells(),
            character.color,
            character.name_ja
          )
        );

        meta.textContent =
          `5 squares · ${orientationCount} orientations`;
      }

      // ---------------------------------------------
      // Rotate button
      // ---------------------------------------------
      
      
      // ---------------------------------------------
      // X SPECIAL · A VERY IMPORTANT ROTATION
      // ---------------------------------------------
      
      if (character.shape === "X") {
        const spinButton = document.createElement("button");
      
        spinButton.type = "button";
        spinButton.textContent = "回ってみる ↻";
      
        const reaction = document.createElement("p");
        reaction.className = "character-reaction";
        reaction.setAttribute("aria-live", "polite");
      
        let xRotation = 0;

        spinButton.addEventListener("click", () => {
          const svg = figure.querySelector("svg");
        
          if (!svg) return;
        
          spinButton.disabled = true;
          reaction.textContent = "";
        
          // Rotate another 90 degrees on each click.
          xRotation += 90;
        
          const animation = svg.animate(
            [
              { transform: `rotate(${xRotation - 90}deg)` },
              { transform: `rotate(${xRotation}deg)` }
            ],
            {
              duration: 650,
              easing: "ease-in-out",
              fill: "forwards"
            }
          );
        
          animation.onfinish = () => {
            reaction.textContent = "……変わってない？";
            spinButton.disabled = false;
          };
        });
      
        controls.append(spinButton, reaction);
      }

      if (orientationCount > 1) {
        const rotateButton =
          document.createElement("button");

        rotateButton.type = "button";
        rotateButton.textContent = "向きを変える ↻";

        rotateButton.addEventListener("click", () => {
          rotation = (rotation + 1) % 4;
          update();
        });

        controls.append(rotateButton);
      }

      // ---------------------------------------------
      // Flip button
      // F, L, N, P, Y: 8 orientations (4 rotations × 2 reflections).
      // Z: 4 orientations (2 rotations × 2 reflections).
      // Z looks the same after a 180° turn,
      // but its mirror image is different.
      // ---------------------------------------------

      if (orientationCount === 8 || character.shape === "Z") {
        const flipButton =
          document.createElement("button");

        flipButton.type = "button";
        flipButton.textContent = "ひっくり返す ⇋";

        flipButton.addEventListener("click", () => {
          flipped = !flipped;
          update();
        });

        controls.append(flipButton);
      }
      
      // ---------------------------------------------
      // Mini-story — always visible
      // ---------------------------------------------
      
      const storySection = document.createElement("div");
      storySection.className = "character-story-section";
      
      const storyPanel = document.createElement("p");
      storyPanel.className = "character-story";
      storyPanel.textContent = character.story || "";
      
      storySection.appendChild(storyPanel);
            
      

      // ---------------------------------------------
      // Assemble card
      // ---------------------------------------------

      update();

      card.append(
        label,
        figure,
        name,
        quote,
        meta,
        controls,
        storySection   // ← NEW! Mini-story goes below rotate/flip buttons
      );

      gallery.append(card);
    });

  } catch (error) {
    console.error(error);

    gallery.textContent =
      "形のデータを読み込めませんでした。";
  }
}

renderGallery();