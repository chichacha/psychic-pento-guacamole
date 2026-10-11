/* ==========================================================================
   GOMASU PEOPLE · POPULATION CENSUS
   ==========================================================================
   Page: stories/population-census.qmd
   Data: data/characters.json + data/postures.json

   Responsibilities:
     01. Load character identities and canonical posture coordinates
     02. Group postures by rotation / reflection equivalence
     03. Render free (12), one-sided (18), fixed (63) census
     04. Validate source data and mathematical counts

   Character identity comes from characters.json.
   Canonical posture geometry and IDs come from postures.json.

   Note: DATA_URL is resolved relative to the HTML page URL,
   not relative to this JavaScript file.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     01. CONFIGURATION AND GEOMETRY
     ------------------------------------------------------------------------ */

  const CHARACTERS_URL = "../data/characters.json";
  const POSTURES_URL = "../data/postures.json";
  const INITIAL_MODE = "free";

  const MODES = {
    free: {
      label: "FREE",
      expected: 12,
      explanation: "回しても、裏返しても、同じ形なら同じ住人として数えます。"
    },
    "one-sided": {
      label: "ONE-SIDED",
      expected: 18,
      explanation: "回転は同じもの。でも、裏返して初めて現れる形は別の住人として数えます。"
    },
    fixed: {
      label: "FIXED",
      expected: 63,
      explanation: "向きが違えば別の姿として数えます。回しても同じ姿になる場合は、重複して数えません。"
    }
  };

  /* ------------------------------------------------------------------------
     02. GEOMETRIC EQUIVALENCE
     ------------------------------------------------------------------------
     Posture coordinates come from postures.json, not from a second SHAPES
     dictionary. Translation is ignored when comparing shapes.

     Free:      reflections and rotations are considered equivalent.
     One-sided: rotations are considered equivalent, reflections are not.
     Fixed:     only identical normalized coordinates are equivalent.
     ------------------------------------------------------------------------ */

  function normalize(points) {
    const minX = Math.min(...points.map(([x]) => x));
    const minY = Math.min(...points.map(([, y]) => y));

    return points
      .map(([x, y]) => [x - minX, y - minY])
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }

  function shapeKey(points) {
    return normalize(points).map(([x, y]) => `${x},${y}`).join(";");
  }

  function rotate(points) {
    return points.map(([x, y]) => [-y, x]);
  }

  function reflect(points) {
    return points.map(([x, y]) => [-x, y]);
  }

  function equivalenceKey(points, mode) {
    if (mode === "fixed") return shapeKey(points);

    const versions = mode === "free"
      ? [points, reflect(points)]
      : [points];
    const signatures = [];

    for (const version of versions) {
      let current = version;
      for (let turn = 0; turn < 4; turn += 1) {
        signatures.push(shapeKey(current));
        current = rotate(current);
      }
    }

    return signatures.sort()[0];
  }

  /* ------------------------------------------------------------------------
     03. LOAD AND VALIDATE CANONICAL DATA
     ------------------------------------------------------------------------
     characters.json: one entry per character, including its official color.
     postures.json: keyed coordinate triples, e.g. "X00": [[x,y,z], ...].

     The census is 2D, so z must be zero. No posture ID is synthesized.
     ------------------------------------------------------------------------ */

  async function loadJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cannot load ${url} (HTTP ${response.status})`);
    }
    return response.json();
  }

  async function loadCensusData() {
    const [characters, rawPostures] = await Promise.all([
      loadJson(CHARACTERS_URL),
      loadJson(POSTURES_URL)
    ]);

    if (!Array.isArray(characters) || characters.length !== 12) {
      throw new Error("characters.json must contain exactly 12 characters.");
    }
    if (!rawPostures || Array.isArray(rawPostures) || typeof rawPostures !== "object") {
      throw new Error("postures.json must be an object keyed by posture ID.");
    }

    const characterMap = new Map();
    for (const character of characters) {
      const { shape, name_ja: name, color, orientation_count: expected } = character;
      if (typeof shape !== "string" || !/^[A-Z]$/.test(shape) || characterMap.has(shape)) {
        throw new Error(`Invalid or duplicate character: ${shape}`);
      }
      if (typeof name !== "string" || !name.trim()) {
        throw new Error(`Missing Japanese name for ${shape}`);
      }
      if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) {
        throw new Error(`Invalid character color for ${shape}`);
      }
      if (!Number.isInteger(expected) || expected < 1) {
        throw new Error(`Invalid orientation_count for ${shape}`);
      }
      characterMap.set(shape, character);
    }

    const byShape = new Map(characters.map(character => [character.shape, []]));
    for (const [id, triples] of Object.entries(rawPostures)) {
      if (!/^[A-Z]\d{2}$/.test(id)) {
        throw new Error(`Unexpected posture ID: ${id}`);
      }
      const shape = id[0];
      if (!characterMap.has(shape)) {
        throw new Error(`No character metadata for posture ${id}`);
      }
      if (!Array.isArray(triples) || triples.length !== 5 ||
          !triples.every(point => Array.isArray(point) && point.length === 3 &&
            point.every(Number.isInteger) && point[2] === 0)) {
        throw new Error(`Invalid coordinate triples in posture ${id}`);
      }
      const points = triples.map(([x, y]) => [x, y]);
      if (new Set(points.map(([x, y]) => `${x},${y}`)).size !== 5) {
        throw new Error(`Duplicate square in posture ${id}`);
      }
      byShape.get(shape).push({ id, points, character: characterMap.get(shape) });
    }

    // Sort by canonical posture ID, independent of JSON object ordering.
    const all = [];
    for (const character of characters) {
      const postures = byShape.get(character.shape);
      postures.sort((a, b) => a.id.localeCompare(b.id));
      if (postures.length !== character.orientation_count) {
        throw new Error(
          `${character.shape}: JSON expects ${character.orientation_count} postures; found ${postures.length}`
        );
      }
      if (new Set(postures.map(posture => shapeKey(posture.points))).size !== postures.length) {
        throw new Error(`Duplicate fixed orientations for ${character.shape}`);
      }
      // Every posture of one character must represent the same free shape.
      if (new Set(postures.map(posture => equivalenceKey(posture.points, "free"))).size !== 1) {
        throw new Error(`Inconsistent geometry for ${character.shape}`);
      }
      all.push(...postures);
    }
    if (all.length !== 63) {
      throw new Error(`Expected 63 postures; found ${all.length}`);
    }
    return { characters, byShape };
  }

  /* ------------------------------------------------------------------------
     04. COUNTING RULES AND VALIDATION
     ------------------------------------------------------------------------
     Deduplicate each character's canonical postures under the chosen
     equivalence rule. Keep the original posture ID for every tile.
     ------------------------------------------------------------------------ */

  function getEntries(mode, data) {
    const entries = [];
    for (const character of data.characters) {
      const seen = new Set();
      for (const posture of data.byShape.get(character.shape)) {
        const key = equivalenceKey(posture.points, mode);
        if (seen.has(key)) continue;
        seen.add(key);
        entries.push(posture);
      }
    }
    return entries;
  }

  function validateCensus(data) {
    for (const [mode, config] of Object.entries(MODES)) {
      const actual = getEntries(mode, data).length;
      if (actual !== config.expected) {
        throw new Error(`${mode}: expected ${config.expected}, got ${actual}`);
      }
    }
  }

  /* ------------------------------------------------------------------------
     05. SVG RENDERING
     ------------------------------------------------------------------------
     Build SVG nodes with DOM methods rather than interpolating JSON
     values into innerHTML. Character colors come from characters.json.
     ------------------------------------------------------------------------ */

  function createShapeSvg(points, character) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    const normalized = normalize(points);
    const width = Math.max(...normalized.map(([x]) => x)) + 1;
    const height = Math.max(...normalized.map(([, y]) => y)) + 1;

    const cellSize = 15;
    const extent = 81;
    const offsetX = (extent - width * cellSize) / 2;
    const offsetY = (extent - height * cellSize) / 2;

    svg.setAttribute("viewBox", `0 0 ${extent} ${extent}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${character.name_ja}の形`);

    for (const [x, y] of normalized) {
      const square = document.createElementNS(namespace, "rect");
      square.setAttribute("x", offsetX + x * cellSize);
      square.setAttribute("y", offsetY + y * cellSize);
      square.setAttribute("width", "14");
      square.setAttribute("height", "14");
      square.setAttribute("rx", "2");
      square.setAttribute("fill", character.color);
      svg.appendChild(square);
    }

    return svg;
  }

  function createTile(entry, mode) {
    const { character, points, id } = entry;
    const tile = document.createElement("div");
    const label = document.createElement("span");

    tile.className = "census-tile";
    tile.dataset.posture = id;
    tile.appendChild(createShapeSvg(points, character));

    label.className = "census-tile-label";
    label.textContent = mode === "free"
      ? `${character.name_ja} · ${character.shape}`
      : `${character.name_ja} · ${id}`;

    tile.appendChild(label);
    return tile;
  }

  /* ------------------------------------------------------------------------
     06. INTERACTION AND INITIALIZATION
     ------------------------------------------------------------------------ */

  async function initialize() {
    const grid = document.getElementById("census-grid");
    if (!grid) return;

    const countEl = document.getElementById("census-count");
    const modeLabelEl = document.getElementById("census-mode-label");
    const explanationEl = document.getElementById("census-explanation");
    const statusEl = document.getElementById("census-status");
    const buttons = [...document.querySelectorAll(".census-story [data-mode]")];

    function showError(error) {
      console.error("Gomasu census:", error);
      if (statusEl) statusEl.textContent = "人口調査のデータを読み込めませんでした。";
    }

    try {
      const data = await loadCensusData();
      validateCensus(data);

      function render(mode) {
        const config = MODES[mode];
        if (!config) return;

        const entries = getEntries(mode, data);
        const fragment = document.createDocumentFragment();

        for (const entry of entries) {
          fragment.appendChild(createTile(entry, mode));
        }

        grid.replaceChildren(fragment);
        if (countEl) countEl.textContent = String(entries.length);
        if (modeLabelEl) modeLabelEl.textContent = `${config.label} · ${entries.length}`;
        if (explanationEl) explanationEl.textContent = config.explanation;
        if (statusEl) {
          statusEl.textContent = `12種類のペントミノから ${entries.length} 種類の異なる姿を確認しました。`;
        }

        for (const button of buttons) {
          const active = button.dataset.mode === mode;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        }
      }

      for (const button of buttons) {
        button.addEventListener("click", () => render(button.dataset.mode));
      }

      render(INITIAL_MODE);
    } catch (error) {
      showError(error);
    }
  }

  initialize();
})();