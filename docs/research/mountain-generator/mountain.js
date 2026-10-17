/* 山は、数式でできている。 — standalone, dependency-free SVG research toy */
(() => {
  "use strict";
  const root = document.getElementById("mountain-lab");
  if (!root) return;
  const $ = (id) => root.querySelector(`#${id}`);
  const W = 900,
    H = 400;
  const palettes = {
    white: {
      sky: "#F2F7FA",
      back: "#DCEAF2",
      middle: "#BCD5E5",
      front: "#91B8D0",
      ink: "#365F7A",
      rough: 2,
    },
    yellow: {
      sky: "#FBF4E7",
      back: "#F1E7CA",
      middle: "#E6D6AC",
      front: "#D5C08D",
      ink: "#705A35",
      rough: 8,
    },
    black: {
      sky: "#E5EAE5",
      back: "#BACDBF",
      middle: "#83A38C",
      front: "#4D775E",
      ink: "#244A34",
      rough: 16,
    },
  };
  const initial = {
    belt: "white",
    level: 4,
    seed: 84,
    broad: 35,
    small: 14,
    rough: 5,
    frequency: 5,
    mist: 35,
  };
  const fields = [
    "level",
    "seed",
    "broad",
    "small",
    "rough",
    "frequency",
    "mist",
  ];
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  // Deterministic 32-bit hash: independent of Math.random and render order.
  function hash(n) {
    let x = (n >>> 0) + 0x9e3779b9;
    x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
    x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
    return ((x ^ (x >>> 15)) >>> 0) / 4294967296;
  }
  function phase(seed, layer, component) {
    return hash(seed * 101 + layer * 17 + component * 7919) * 2 * Math.PI;
  }
  function settings() {
    const s = { belt: $("belt").value };
    fields.forEach((k) => {
      const el = $(k);
      const n = Number(el.value);
      s[k] = Number.isFinite(n) ? n : initial[k];
    });
    s.seed = Math.round(clamp(s.seed, 1, 999999));
    return s;
  }
  function component(t, s, layer, kind) {
    const levelShift = s.level * 0.14;
    if (kind === "broad")
      return (
        s.broad *
        Math.sin(
          2 * Math.PI * (1.2 + s.level * 0.055) * t +
            phase(s.seed, layer, 1) +
            levelShift
        )
      );
    if (kind === "small")
      return (
        s.small *
        Math.sin(2 * Math.PI * s.frequency * t + phase(s.seed, layer, 2))
      );
    if (kind === "fine")
      return (
        s.rough *
        Math.sin(
          2 * Math.PI * (s.frequency * 2.6) * t + phase(s.seed, layer, 3)
        )
      );
    return 0;
  }
  function height(t, s, layer, mode) {
    const scale = [0.65, 0.84, 1][layer];
    const kinds = mode === "combined" ? ["broad", "small", "fine"] : [mode];
    return scale * kinds.reduce((sum, k) => sum + component(t, s, layer, k), 0);
  }
  function ridge(s, layer, mode) {
    const base = [188, 240, 300][layer];
    let d = `M 0 ${base - height(0, s, layer, mode).toFixed(2)}`;
    for (let x = 5; x <= W; x += 5) {
      const y = base - height(x / W, s, layer, mode);
      d += ` L ${x} ${y.toFixed(2)}`;
    }
    return d;
  }
  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  }
  function blend(hex1, hex2, amount) {
    const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = parse(hex1),
      b = parse(hex2);
    return `#${a
      .map((v, i) =>
        Math.round(v * (1 - amount) + b[i] * amount)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")}`;
  }
  function render() {
    const s = settings();
    const palette = palettes[s.belt];
    const mode = root.querySelector('input[name="wave"]:checked').value;
    const svg = $("mountain-scene");
    svg.replaceChildren();
    svg.append(svgEl("rect", { width: W, height: H, fill: palette.sky }));
    const colors = [palette.back, palette.middle, palette.front];
    for (let layer = 0; layer < 3; layer++) {
      const d = ridge(s, layer, mode);
      const haze = (s.mist / 100) * [0.85, 0.5, 0.16][layer];
      const color = blend(colors[layer], palette.sky, haze);
      svg.append(
        svgEl("path", { d: `${d} L ${W} ${H} L 0 ${H} Z`, fill: color })
      );
      svg.append(
        svgEl("path", {
          d,
          fill: "none",
          stroke: blend(color, palette.ink, 0.16),
          "stroke-width": 1.5,
          "vector-effect": "non-scaling-stroke",
        })
      );
    }
    $("scene-note").textContent = `パズル ${s.seed} · レベル ${s.level} · ${
      { white: "白帯", yellow: "黄帯", black: "黒帯" }[s.belt]
    }`;
    fields
      .filter((k) => k !== "seed")
      .forEach((k) => {
        $(`${k}-value`).textContent = s[k];
      });
    const explanation = {
      combined:
        "3つの波を足した輪郭。細かな凹凸が増えると、険しい山に見えてきます。",
      broad: "大きく、ゆっくりした波だけ。なだらかな丘の土台です。",
      small: "少し速い波だけ。大きな丘に重ねると表情が生まれます。",
      fine: "細かく速い波だけ。振幅が小さくても、輪郭の印象を変えます。",
    };
    $("lab-explain").textContent = explanation[mode];
  }
  function applyBelt() {
    const p = palettes[$("belt").value];
    $("rough").value = p.rough;
    render();
  }
  $("belt").addEventListener("change", applyBelt);
  fields.forEach((k) => $(k).addEventListener("input", render));
  root
    .querySelectorAll('input[name="wave"]')
    .forEach((el) => el.addEventListener("change", render));
  $("next-seed").addEventListener("click", () => {
    $("seed").value = (settings().seed % 999999) + 1;
    render();
  });
  $("reset").addEventListener("click", () => {
    $("belt").value = initial.belt;
    fields.forEach((k) => {
      $(k).value = initial[k];
    });
    root.querySelector('input[name="wave"][value="combined"]').checked = true;
    render();
  });
  render();
})();

/* First experiment: a single sine wave, independent from the mountain scene. */
(() => {
  "use strict";
  const root = document.getElementById("single-wave");
  if (!root) return;
  const $ = (id) => root.querySelector(`#${id}`);
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag, attrs) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) =>
      node.setAttribute(key, String(value))
    );
    return node;
  };
  const initial = { amplitude: 48, frequency: 1, phase: 0, position: 0.25 };
  const controls = Object.keys(initial);
  function render() {
    const values = Object.fromEntries(
      controls.map((key) => [key, Number($("wave-" + key).value)])
    );
    const { amplitude: A, frequency: f, phase: phi, position: t } = values;
    const svg = $("single-wave-svg");
    const left = 48,
      right = 770,
      center = 130;
    const xAt = (t) => left + t * (right - left);
    const yAt = (t) => center - A * Math.sin(2 * Math.PI * f * t + phi);
    const path = Array.from({ length: 401 }, (_, i) => {
      const u = i / 400;
      return `${i === 0 ? "M" : "L"}${xAt(u).toFixed(2)},${yAt(u).toFixed(2)}`;
    }).join(" ");
    const x = xAt(t),
      y = yAt(t);
    svg.replaceChildren();
    svg.append(
      make("rect", { x: 0, y: 0, width: 800, height: 270, fill: "#f5f3ed" })
    );
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      svg.append(
        make("line", {
          x1: xAt(u),
          x2: xAt(u),
          y1: 25,
          y2: 224,
          stroke: "#dce3db",
          "stroke-dasharray": "4 6",
        })
      );
      const label = make("text", {
        x: xAt(u),
        y: 244,
        "text-anchor": "middle",
        fill: "#52675a",
        "font-size": 13,
      });
      label.textContent = u.toFixed(2).replace(/0$/, "");
      svg.append(label);
    }
    svg.append(
      make("line", {
        x1: left,
        x2: right,
        y1: center,
        y2: center,
        stroke: "#879c8d",
        "stroke-width": 1.4,
      })
    );
    svg.append(
      make("path", {
        d: path,
        fill: "none",
        stroke: "#335d4c",
        "stroke-width": 4,
        "stroke-linecap": "round",
      })
    );
    svg.append(
      make("line", {
        x1: x,
        x2: x,
        y1: center,
        y2: y,
        stroke: "#ed735c",
        "stroke-width": 2,
        "stroke-dasharray": "5 4",
      })
    );
    svg.append(
      make("circle", {
        cx: x,
        cy: y,
        r: 7,
        fill: "#ed735c",
        stroke: "#fffefa",
        "stroke-width": 2,
      })
    );
    const tLabel = make("text", {
      x: right,
      y: 263,
      "text-anchor": "end",
      fill: "#52675a",
      "font-size": 13,
    });
    tLabel.textContent = "t = x / width →";
    svg.append(tLabel);
    for (const key of controls)
      $("wave-" + key + "-value").textContent =
        key === "phase"
          ? values[key].toFixed(2) + " rad"
          : key === "position"
          ? values[key].toFixed(2)
          : values[key];
    const h = A * Math.sin(2 * Math.PI * f * t + phi);
    $("single-wave-readout").textContent = `t = ${t.toFixed(
      2
    )} のとき、h(t) = ${h.toFixed(1)}。赤い点が数式から生まれた1点です。`;
  }
  controls.forEach((key) => $("wave-" + key).addEventListener("input", render));
  $("single-wave-reset").addEventListener("click", () => {
    controls.forEach((key) => {
      $("wave-" + key).value = initial[key];
    });
    render();
  });
  render();
})();
