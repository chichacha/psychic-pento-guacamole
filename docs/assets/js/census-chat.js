/* ==========================================================================
   GOMASU PEOPLE · CENSUS CHAT
   A separate, read-only gallery of villagers' posture-specific remarks.

   Data sources (relative to the published HTML page):
     ../data/characters.json
     ../data/postures.json
     ../data/character_postures.json

   Does not modify or depend on census.js.
   ========================================================================== */

(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const DATA_ROOT = "../data";
  const container = document.getElementById("census-chat");

  if (!container) return;

  /* ------------------------------------------------------------------------
     01. DATA LOADING
     ------------------------------------------------------------------------ */

  async function loadJson(filename) {
    const response = await fetch(`${DATA_ROOT}/${filename}`);
    if (!response.ok) {
      throw new Error(`${filename}: HTTP ${response.status}`);
    }
    return response.json();
  }

  /* ------------------------------------------------------------------------
     02. GEOMETRY — normalize coordinates for a compact SVG thumbnail
     ------------------------------------------------------------------------ */

  function createPostureSvg(coordinates, color, label) {
    const points = coordinates.map(([x, y]) => [x, y]);
    const minX = Math.min(...points.map(([x]) => x));
    const minY = Math.min(...points.map(([, y]) => y));
    const maxX = Math.max(...points.map(([x]) => x));
    const maxY = Math.max(...points.map(([, y]) => y));

    const unit = 20;
    const padding = 4;
    const width = (maxX - minX + 1) * unit + padding * 2;
    const height = (maxY - minY + 1) * unit + padding * 2;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.classList.add("census-chat-shape");

    for (const [x, y] of points) {
      const square = document.createElementNS(SVG_NS, "rect");
      square.setAttribute("x", padding + (x - minX) * unit + 0.5);
      square.setAttribute("y", padding + (y - minY) * unit + 0.5);
      square.setAttribute("width", unit - 1);
      square.setAttribute("height", unit - 1);
      square.setAttribute("rx", "3");
      square.setAttribute("fill", color);
      svg.appendChild(square);
    }

    return svg;
  }

  /* ------------------------------------------------------------------------
     03. SPEECH CARDS — only postures with authored comments are shown
     ------------------------------------------------------------------------ */

  function createCard(character, postureId, posture, coordinates) {
    const card = document.createElement("article");
    card.className = "census-chat-card";

    const figure = document.createElement("div");
    figure.className = "census-chat-figure";
    figure.appendChild(createPostureSvg(
      coordinates,
      posture.color || character.color,
      `${character.name_ja} ${postureId}`
    ));

    const content = document.createElement("div");
    content.className = "census-chat-content";

    const name = document.createElement("div");
    name.className = "census-chat-name";
    name.textContent = character.name_ja;

    const postureLabel = document.createElement("span");
    postureLabel.className = "census-chat-posture-id";
    postureLabel.textContent = postureId;
    name.appendChild(document.createTextNode(" · "));
    name.appendChild(postureLabel);

    const bubble = document.createElement("blockquote");
    bubble.className = "census-chat-bubble";
    bubble.textContent = `「${posture.comment.replace(/^[「]|[」]$/g, "")}」`;

    content.append(name, bubble);
    card.append(figure, content);
    return card;
  }

  /* ------------------------------------------------------------------------
     04. GALLERY — follow characters.json order, then posture ID order
     ------------------------------------------------------------------------ */

  async function renderChat() {
    const [characters, postures, postureDetails] = await Promise.all([
      loadJson("characters.json"),
      loadJson("postures.json"),
      loadJson("character_postures.json")
    ]);

    const fragment = document.createDocumentFragment();
    let total = 0;

    for (const character of characters) {
      const ids = Object.keys(postureDetails)
        .filter(id => id.startsWith(character.shape) && postureDetails[id].comment)
        .sort();

      for (const id of ids) {
        if (!postures[id]) {
          console.warn(`Census chat: missing geometry for ${id}`);
          continue;
        }
        fragment.appendChild(createCard(character, id, postureDetails[id], postures[id]));
        total++;
      }
    }

    container.replaceChildren(fragment);
    container.setAttribute("aria-label", `住民の声・${total}件`);
  }

  renderChat().catch(error => {
    console.error("Census chat could not load:", error);
    container.textContent = "住民の声を読み込めませんでした。";
  });
})();