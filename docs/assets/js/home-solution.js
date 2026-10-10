// ===================================================
// HOMEPAGE · ONE REAL PENTOMINO SOLUTION
// ===================================================

const container = document.querySelector("#home-solution");

if (container) {
  const NS = "http://www.w3.org/2000/svg";

  const colors = {
    I: "#FDCFAB", F: "#FFADA6", L: "#FEE1A7",
    P: "#6BB091", N: "#D2E3AD", T: "#76E1D7",
    U: "#85D7EF", V: "#A9C7E9", W: "#CBBBE8",
    X: "#F0B6DF", Y: "#FFAFD0", Z: "#ECD2C1"
  };

  const tile = 40;
  const padding = 10;

  // Six rows, ten columns.
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 420 260");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "6 × 10 pentomino solution");

  container.append(svg);

  let pieces = [];
  let visible = 0;

  function draw() {
    svg.replaceChildren();

    // Background board
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        const square = document.createElementNS(NS, "rect");

        square.setAttribute("x", padding + col * tile);
        square.setAttribute("y", padding + row * tile);
        square.setAttribute("width", tile);
        square.setAttribute("height", tile);
        square.setAttribute("fill", "#F4F0EA");
        square.setAttribute("stroke", "#D9D1CA");

        svg.append(square);
      }
    }

    // Revealed pentominoes
    pieces.slice(0, visible).forEach(piece => {
      piece.cells.forEach(([row, col]) => {
        const square = document.createElementNS(NS, "rect");

        square.setAttribute("x", padding + col * tile);
        square.setAttribute("y", padding + row * tile);
        square.setAttribute("width", tile);
        square.setAttribute("height", tile);
        square.setAttribute("rx", 3);
        square.setAttribute("fill", colors[piece.shape]);
        square.setAttribute("stroke", "#302B32");
        square.setAttribute("stroke-width", 1.5);

        svg.append(square);
      });
    });
  }

  async function initialize() {
    const [csvText, postures] = await Promise.all([
      fetch(container.dataset.solutions).then(r => {
        if (!r.ok) throw Error("Cannot load solutions");
        return r.text();
      }),
      fetch(container.dataset.postures).then(r => {
        if (!r.ok) throw Error("Cannot load postures");
        return r.json();
      })
    ]);

    // ===================================================
    // ARRANGEMENT CLOCK · CHANGES EVERY 4 HOURS
    // ===================================================
    
    // Read all 2,339 puzzle records, excluding the CSV header.
    const rows = csvText.trim().split(/\r?\n/).slice(1);
    
    // Get the current date and hour in Japan.
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    
    const getPart = type =>
      Number(parts.find(p => p.type === type).value);
    
    // Convert the calendar date into a sequential day number.
    const dayNumber = Math.floor(
      Date.UTC(
        getPart("year"),
        getPart("month") - 1,
        getPart("day")
      ) / 86400000
    );
    
    // Divide each day into six 4-hour periods.
    const hour = getPart("hour");
    const slot = Math.floor(hour / 4);
    
    // Give every 4-hour period a unique sequential number.
    const slotNumber = dayNumber * 6 + slot;
    
    // Select a repeatable, shuffled-looking puzzle index.
    const multiplier = 37;
    const offset = 823;
    
    const index =
      ((slotNumber * multiplier + offset) % rows.length
        + rows.length) % rows.length;
    
    // Retrieve the selected puzzle.
    const selectedRow = rows[index].split(",");
    const answer = selectedRow[2];
    
    // Optional: useful when debugging.
    console.log("Current pentomino arrangement:", selectedRow[0]);

    const placements = answer.match(/.{7}/g);

    pieces = placements.map(code => {
      const postureId = code.slice(0, 3);
      const shape = postureId[0];

      const anchorRow = Number(code.slice(3, 5)) / 10;
      const anchorCol = Number(code.slice(5, 7)) / 10;

      const cells = postures[postureId].map(([r, c]) => [
        anchorRow + r,
        anchorCol + c
      ]);

      return { shape, cells };
    });

    draw();
  }

  document.querySelector("#reveal-solution")
    .addEventListener("click", () => {
      visible = Math.min(visible + 1, pieces.length);
      draw();
    });

  document.querySelector("#reset-solution")
    .addEventListener("click", () => {
      visible = 0;
      draw();
    });

  initialize().catch(error => {
    console.error(error);
    container.textContent = "パズルを読み込めませんでした。";
  });
}