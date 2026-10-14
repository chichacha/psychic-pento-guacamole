/* Secret Lab #30 — static Quarto prototype, no framework or game connection. */
(async function () {
  const root = document.getElementById("celebration-lab");
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const base = new URL("../../", window.location.href);
  const asset = (path) => new URL(path, base).href;
  const [config, characters] = await Promise.all([
    fetch(asset("data/celebration.json")).then((r) => {
      if (!r.ok) throw Error("celebration.json");
      return r.json();
    }),
    fetch(asset("data/characters.json")).then((r) => {
      if (!r.ok) throw Error("characters.json");
      return r.json();
    }),
  ]).catch((err) => {
    $("lab-message").textContent = `Could not load data: ${err.message}`;
    return [null, null];
  });
  if (!config || !characters) return;
  // Canonical five-square shapes (one fixed orientation per character).
  const cells = {
    F: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    I: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    L: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
    ],
    N: [
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    P: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
    T: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
    U: [
      [0, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    V: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    W: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    X: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    Y: [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
      [1, 3],
    ],
    Z: [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
  };
  const byShape = Object.fromEntries(characters.map((c) => [c.shape, c]));
  const order = "FILNPTUVWXYZ".split("");
  const language = () => $("lab-lang").value;
  const t = (key) => {
    const msg = config.messages[key];
    return msg?.[language()] ?? msg?.[config.fallbackLanguage] ?? key;
  };
  const num = (id) => Number($(id).value);
  // Illustration only: use the canonical character palette automatically.
  const palette = () => order.map((shape) => byShape[shape].color);
  const piece = () => $("lab-piece").value;
  const svg = (shape) => {
    const coords = cells[shape];
    const maxX = Math.max(...coords.map((c) => c[0])) + 1;
    const maxY = Math.max(...coords.map((c) => c[1])) + 1;
    const size = 35,
      pad = 5,
      width = maxX * size + pad * 2,
      height = maxY * size + pad * 2;
    const squares = coords
      .map(
        ([x, y]) =>
          `<rect x="${pad + x * size}" y="${
            pad + y * size
          }" width="${size}" height="${size}" rx="5" fill="${
            byShape[shape].color
          }" stroke="#4e4650" stroke-width="1.7"/>`
      )
      .join("");
    const [fx, fy] = coords[Math.floor(coords.length / 2)];
    const face = `<circle cx="${pad + (fx + 0.36) * size}" cy="${
      pad + (fy + 0.4) * size
    }" r="2.5" fill="#3a3038"/><circle cx="${pad + (fx + 0.64) * size}" cy="${
      pad + (fy + 0.4) * size
    }" r="2.5" fill="#3a3038"/><path d="M${pad + (fx + 0.35) * size} ${
      pad + (fy + 0.6) * size
    } Q${pad + (fx + 0.5) * size} ${pad + (fy + 0.77) * size} ${
      pad + (fx + 0.65) * size
    } ${
      pad + (fy + 0.6) * size
    }" stroke="#3a3038" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">${squares}${face}</svg>`;
  };
  function renderPiece() {
    $("lab-character").innerHTML = svg(piece());
    $("lab-piece-name").textContent =
      language() === "ja"
        ? byShape[piece()].name_ja
        : byShape[piece()].title_en;
  }
  function renderControls() {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $("lab-hints-value").textContent = num("lab-hints");
    $("lab-checks-value").textContent = num("lab-checks");
    $("lab-level-value").textContent = num("lab-level");
    renderPiece();
  }
  function addProps(count, file) {
    const limit = Math.min(count, config.maxVisibleProps ?? 5);
    for (let i = 0; i < limit; i++) {
      const img = document.createElement("img");
      img.src = asset(`assets/svg/${file}.svg`);
      img.alt = "";
      img.style.animationDelay = `${i * 90}ms`;
      $("lab-props").append(img);
    }
    if (count > limit) {
      const extra = document.createElement("span");
      extra.textContent = `+${count - limit}`;
      $("lab-props").append(extra);
    }
  }
  function candySVG(kind, color) {
    const shape =
      kind === "circle"
        ? '<circle cx="12" cy="12" r="7"/>'
        : kind === "diamond"
        ? '<path d="M12 3 L21 12 L12 21 L3 12 Z"/>'
        : kind === "candy"
        ? '<path d="M6 9 L1 5 L1 19 L6 15 M18 9 L23 5 L23 19 L18 15"/><rect x="6" y="7" width="12" height="10" rx="4"/>'
        : '<rect x="5" y="8" width="14" height="8" rx="2"/>';
    return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" fill="${color}" stroke="#655d61" stroke-width=".8">${shape}</svg>`;
  }
  function butterflySVG(color, accent) {
    return `<svg viewBox="0 0 32 28" width="100%" height="100%" aria-hidden="true">
      <path d="M16 14 C4 -3 -2 4 5 14 C-1 23 10 28 16 17 C22 28 33 23 27 14 C34 4 28 -3 16 14Z" fill="${color}" stroke="#6b646b" stroke-width="1"/>
      <path d="M7 10 Q11 9 13 14 Q10 17 7 16Z M25 10 Q21 9 19 14 Q22 17 25 16Z" fill="${accent}" opacity=".75"/>
      <path d="M16 11 V21" stroke="#6b646b" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 12 Q11 5 9 6 M16 12 Q21 5 23 6" fill="none" stroke="#6b646b" stroke-width=".8"/>
    </svg>`;
  }
  function celebrate() {
    const h = num("lab-hints"),
      c = num("lab-checks"),
      perfect = !h && !c;
    const key = perfect
      ? "brilliant"
      : h && c
      ? "both"
      : h
      ? "caterpillars"
      : "butterflies";
    $("lab-message").textContent = t(key);
    $("lab-description").textContent = perfect
      ? t("confettiDescription")
      : [
          h ? t("caterpillarsDescription") : "",
          c ? t("butterfliesDescription") : "",
        ]
          .filter(Boolean)
          .join(" ");
    $("lab-props").replaceChildren();
    $("lab-particles").replaceChildren();
    if (h) addProps(h, "caterpillar");
    // Checks become butterflies floating among the candy confetti.
    const colors = palette(),
      level = num("lab-level");
    const count = perfect ? 46 : 20;
    // Level changes shape variety, not the identity of the character colors.
    const kinds =
      level <= 3
        ? ["rectangle"]
        : level <= 6
        ? ["rectangle", "circle"]
        : level <= 8
        ? ["rectangle", "circle", "diamond"]
        : ["rectangle", "circle", "diamond", "candy"];
    const stageHeight = $("lab-stage").clientHeight;
    // Suspend the particles across the upper/middle of the illustration, not on the floor.
    const midTop = stageHeight * 0.2;
    const midSpan = stageHeight * 0.45;
    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = 5 + Math.random() * 90,
        drift = (Math.random() - 0.5) * 75;
      const landing = midTop + Math.random() * midSpan;
      const el = document.createElement("span");
      el.className = "lab-particle";
      el.innerHTML = candySVG(kind, color);
      el.style.setProperty("--x", `${x}%`);
      el.style.setProperty("--size", `${9 + Math.random() * 9}px`);
      el.style.setProperty("--duration", `${1.6 + Math.random() * 1.5}s`);
      el.style.setProperty("--delay", `${Math.random() * 0.9}s`);
      el.style.setProperty("--drift", `${drift}px`);
      el.style.setProperty("--landing", `${landing}px`);
      el.style.setProperty(
        "--rotation-start",
        `${Math.round(Math.random() * 360)}deg`
      );
      el.style.setProperty(
        "--rotation-end",
        `${Math.round(Math.random() * 720 - 360)}deg`
      );
      $("lab-particles").append(el);
    }
    // One butterfly per check (up to a visual cap), mixed into the same suspended layer.
    for (let i = 0; i < Math.min(c, config.maxVisibleProps ?? 5); i++) {
      const el = document.createElement("span");
      el.className = "lab-particle lab-butterfly-particle";
      const wing = colors[Math.floor(Math.random() * colors.length)];
      const accent = colors[Math.floor(Math.random() * colors.length)];
      el.innerHTML = butterflySVG(wing, accent);
      el.style.setProperty("--x", `${10 + Math.random() * 80}%`);
      el.style.setProperty("--size", `${21 + Math.random() * 9}px`);
      el.style.setProperty("--duration", `${1.9 + Math.random() * 0.9}s`);
      el.style.setProperty("--delay", `${0.15 + i * 0.15}s`);
      el.style.setProperty("--drift", `${(Math.random() - 0.5) * 50}px`);
      el.style.setProperty(
        "--landing",
        `${midTop + Math.random() * midSpan}px`
      );
      // Butterflies stay upright: gentle tilt rather than a full spin.
      el.style.setProperty(
        "--rotation-start",
        `${-12 + Math.random() * 24}deg`
      );
      el.style.setProperty("--rotation-end", `${-18 + Math.random() * 36}deg`);
      $("lab-particles").append(el);
    }
    $("lab-stage").classList.remove("is-celebrating");
    void $("lab-stage").offsetWidth;
    $("lab-stage").classList.add("is-celebrating");
  }
  function resetPreview() {
    $("lab-message").textContent = t("ready");
    $("lab-description").textContent = "";
    $("lab-props").replaceChildren();
    $("lab-particles").replaceChildren();
    $("lab-stage").classList.remove("is-celebrating");
    renderControls();
  }
  order.forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape;
    option.textContent = `${shape} — ${byShape[shape].name_ja}`;
    $("lab-piece").append(option);
  });
  $("lab-piece").value = "F";
  $("lab-lang").addEventListener("change", resetPreview);
  $("lab-piece").addEventListener("change", resetPreview);
  ["lab-hints", "lab-checks", "lab-level"].forEach((id) =>
    $(id).addEventListener("input", resetPreview)
  );
  $("lab-celebrate").addEventListener("click", celebrate);
  $("lab-replay").addEventListener("click", celebrate);
  resetPreview();
})();
