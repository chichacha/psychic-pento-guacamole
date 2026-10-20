(() => {
  "use strict";
  const root = document.getElementById("mushroom-app");
  if (!root) return;
  const svg = document.getElementById("mushroom-svg");
  const ns = "http://www.w3.org/2000/svg";
  const names = { I: "まっすぐおじさん", F: "くねくねちゃん", L: "のびのびちゃん", P: "ぎゅっとくん", N: "ずらしくん", T: "しきりやおばさん", U: "ぎゅーおばさん", V: "かどっこおばさん", W: "こつこつおばさん", X: "まんなかおじさん", Y: "はみだしくん", Z: "つなぎおばさん" }; 
  const palette = { I: "#FDCFAB", F: "#FFADA6", L: "#FEE1A7", P: "#6BB091", N: "#D2E3AD", T: "#76E1D7", U: "#85D7EF", V: "#A9C7E9", W: "#CBBBE8", X: "#F0B6DF", Y: "#FFAFD0", Z: "#ECD2C1" };
  const defaults = { piece: "P", pattern: "dots", profile: "bell", width: 165, height: 78, stem: 92, tilt: 0, density: 16 };
  let seed = 42;
  const controls = {};
  for (const name of Object.keys(defaults)) controls[name] = document.getElementById("mushroom-" + name);
  Object.entries(palette).forEach(([name, color]) => {
    const option = document.createElement("option");
    option.value = name; option.textContent = name + " · " + names[name];
    controls.piece.append(option);
  });
  function node(tag, attrs = {}, parent = svg) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    parent.append(el); return el;
  }
  function random(i, salt = 0) {
    const v = Math.sin((i + 1) * 127.1 + seed * 31.7 + salt * 53.2) * 43758.5453;
    return v - Math.floor(v);
  }
  function capPath(w, h, profile) {
    const l = 180 - w / 2, r = 180 + w / 2, y = 172, top = y - h;
    if (profile === "cone") return `M${l} ${y} Q${l + 9} ${y - 9} 180 ${top} Q${r - 9} ${y - 9} ${r} ${y} Z`;
    if (profile === "dented") return `M${l} ${y} C${l + 6} ${top + 18} ${180 - w * .27} ${top - 5} 180 ${top + 13} C${180 + w * .27} ${top - 5} ${r - 6} ${top + 18} ${r} ${y} Z`; 
    if (profile === "flat") return `M${l} ${y} Q180 ${top + 15} ${r} ${y} Q180 ${y + 7} ${l} ${y} Z`;
    if (profile === "dome") return `M${l} ${y} C${l} ${top + 12} ${r} ${top + 12} ${r} ${y} Z`;
    return `M${l} ${y} C${l + 10} ${top + 12} ${180 - w * .20} ${top} 180 ${top} C${180 + w * .20} ${top} ${r - 10} ${top + 12} ${r} ${y} Z`;
  }
  function render() {
    const s = Object.fromEntries(Object.entries(controls).map(([k, el]) => [k, el.type === "range" ? Number(el.value) : el.value]));
    for (const name of ["width", "height", "stem", "tilt", "density"]) document.getElementById("out-" + name).textContent = s[name] + (name === "tilt" ? "°" : "");
    svg.replaceChildren();
    node("ellipse", { cx: 180, cy: 272, rx: 76, ry: 8, fill: "#a6a09b", opacity: .17 });
    const groundY = 264;
    const group = node("g", { transform: `rotate(${s.tilt} 180 ${groundY})` });
    const stemBottom = groundY, stemTop = groundY - s.stem;
    // Cap coordinates are authored around y=172; translate the entire cap
    // (including gills, spots, and clipping) to meet the changing stem top.
    const capGroup = node("g", { transform: `translate(0 ${stemTop - 172})` }, group);

    node("ellipse", { cx: 180, cy: 172, rx: s.width / 2, ry: 14, fill: "#e4c9b6", stroke: "#ad9286", "stroke-width": 1.5 }, capGroup);
    for (let i = -6; i <= 6; i++) node("line", { x1: 180, y1: 172, x2: 180 + i * s.width / 14, y2: 180, stroke: "#b9968e", "stroke-width": .9 }, capGroup);
    // Layering: gills behind, stem in front of gills, cap in front of stem.
    node("path", { d: `M166 ${stemTop - 4} Q157 ${stemTop + s.stem * .48} 163 ${stemBottom} Q180 ${stemBottom + 10} 197 ${stemBottom} Q189 ${stemTop + s.stem * .45} 194 ${stemTop - 4} Z`, fill: "#f7e8cf", stroke: "#aa9384", "stroke-width": 2 }, group);
    const path = capPath(s.width, s.height, s.profile);
    node("path", { d: path, fill: palette[s.piece], stroke: "#806f70", "stroke-width": 2 }, capGroup);
    const defs = node("defs", {}, capGroup), clip = node("clipPath", { id: "mushroom-cap-clip" }, defs);
    node("path", { d: path }, clip);
    const decoration = node("g", { "clip-path": "url(#mushroom-cap-clip)" }, capGroup);
    if (s.pattern === "dots") {
      // Staggered polka-dot lattice: odd rows shift half a column.
      // Positions stay fixed; only dot radii change with seed.
      // The cap clipPath trims dots at the curved edge.
      const columns = Math.max(3, Math.round(Math.sqrt(s.density * s.width / s.height)));
      const rows = Math.max(2, Math.ceil(s.density / columns));
      const stepX = s.width / (columns + 0.4);
      const stepY = s.height / (rows + 0.4);
      let i = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = 180 + (col - (columns - 1) / 2 + (row % 2 ? 0.5 : 0)) * stepX;
          const y = 172 - s.height / 2 + (row - (rows - 1) / 2) * stepY;
          const radius = Math.min(stepX, stepY) * (0.16 + 0.09 * random(i++, 3));
          node("circle", { cx: x, cy: y, r: radius, fill: "#fffdf3", opacity: .92 }, decoration);
        }
      }
    } else if (["speckles", "stars"].includes(s.pattern)) {
      // Stratified sampling: one jittered candidate per grid cell, then
      // test against the actual SVG cap outline. This prevents bunching and
      // avoids wasting spots outside a narrow or dented cap.
      const columns = Math.max(4, Math.ceil(Math.sqrt(s.density * s.width / s.height)));
      const rows = Math.max(3, Math.ceil(s.density / columns * 1.8));
      const candidates = [];
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        const i = row * columns + col;
        candidates.push({
          x: 180 - s.width / 2 + (col + .18 + .64 * random(i, 1)) * s.width / columns,
          y: 172 - s.height + (row + .18 + .64 * random(i, 2)) * s.height / rows,
          rank: random(i, 4)
        });
      }
      const capElement = clip.firstElementChild;
      const inside = (x, y) => capElement.isPointInFill(new DOMPoint(x, y));
      const valid = candidates.filter(p => inside(p.x, p.y)).sort((a, b) => a.rank - b.rank);
      // If a cap is unusually narrow, supplement with a finer jittered grid.
      if (valid.length < s.density) {
        for (let i = 0; i < 400 && valid.length < s.density; i++) {
          const x = 180 - s.width / 2 + random(i, 8) * s.width;
          const y = 172 - s.height + random(i, 9) * s.height;
          if (inside(x, y) && valid.every(p => Math.hypot(p.x - x, p.y - y) > 8)) valid.push({ x, y });
        }
      }
      valid.slice(0, s.density).forEach((p, i) => {
        const x = p.x, y = p.y;
        const radius = s.pattern === "speckles" ? 1.2 + random(i, 3) * 1.8 : 2.5 + random(i, 3) * 3.3;
        if (s.pattern === "stars") {
          const points = Array.from({ length: 8 }, (_, j) => {
            const angle = j * Math.PI / 4 - Math.PI / 2, rr = j % 2 ? radius * .38 : radius;
            return `${x + Math.cos(angle) * rr},${y + Math.sin(angle) * rr}`;
          }).join(" ");
          node("polygon", { points, fill: "#fffdf3", opacity: .92 }, decoration);
        } else node("circle", { cx: x, cy: y, r: radius, fill: "#fffdf3", opacity: .9 }, decoration);
      });
    } else if (s.pattern === "stripes") {
      for (let i = -9; i <= 9; i++) node("line", { x1: 180 + i * 17 - 35, y1: 50, x2: 180 + i * 17 + 35, y2: 190, stroke: "#fffdf3", "stroke-width": 5, opacity: .8 }, decoration);
    } else if (s.pattern === "bands") {
      for (let i = 0; i < 5; i++) node("path", { d: `M${180 - s.width / 2} ${170 - i * 19} Q180 ${143 - i * 19} ${180 + s.width / 2} ${170 - i * 19}`, fill: "none", stroke: "#fffdf3", "stroke-width": 5, opacity: .8 }, decoration);
    }
    const faceY = stemTop + s.stem * .44;
    node("ellipse", { cx: 172, cy: faceY, rx: 3.5, ry: 4.8, fill: "#302b32" }, group);
    node("ellipse", { cx: 188, cy: faceY, rx: 3.5, ry: 4.8, fill: "#302b32" }, group);
    node("path", { d: `M175 ${faceY+12} Q180 ${faceY+17} 185 ${faceY+12}`, fill: "none", stroke: "#8c665b", "stroke-width": 2, "stroke-linecap": "round" }, group);
    document.getElementById("mushroom-caption").textContent = `${names[s.piece]}色のきのこ。傘の幅 ${s.width}、高さ ${s.height}。本人はまだ名前を決めていません。`;
  }
  Object.values(controls).forEach(el => el.addEventListener("input", render));
  function reset() { for (const [key, value] of Object.entries(defaults)) controls[key].value = value; seed = 42; render(); }
  document.getElementById("mushroom-shuffle").addEventListener("click", () => { seed++; render(); });
  document.getElementById("mushroom-reset").addEventListener("click", reset);
  document.getElementById("mushroom-download").addEventListener("click", () => {
    const copy = svg.cloneNode(true);
    copy.setAttribute("xmlns", ns);
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "gomasu-mushroom.svg"; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  reset();
})();
