(() => {
  const $ = (id) => document.getElementById(id);
  const frame = $("device-frame"),
    game = $("game");
  if (!frame || !game) return;
  const palette = {
    I: "#FDCFAB",
    F: "#FFADA6",
    L: "#FEE1A7",
    P: "#6BB091",
    N: "#D2E3AD",
    T: "#76E1D7",
    U: "#85D7EF",
    V: "#A9C7E9",
    W: "#CBBBE8",
    X: "#F0B6DF",
    Y: "#FFAFD0",
    Z: "#ECD2C1",
  };
  const rows = [
    "TTTX......",
    "ITXXX.....",
    "ITUXU.....",
    "IVUUU.....",
    "IVYYYY....",
    "IVVVY.....",
  ];
  const board = $("board");
  rows.forEach((row) =>
    [...row].forEach((ch) => {
      const c = document.createElement("div");
      c.className = "cell";
      if (ch !== ".") {
        c.style.background = palette[ch];
        c.textContent = ch;
      }
      board.appendChild(c);
    })
  );
  ["F", "L", "N", "P", "W", "Z"].forEach((ch) => {
    const img = document.createElement("img");
    img.src = "assets/pieces/" + ch + ".svg";
    img.alt = ch + " remaining piece";
    $("piece-tray").appendChild(img);
  });
  ["X", "I", "U", "P"].forEach((ch) => {
    const img = document.createElement("img");
    img.src = "assets/pieces/" + ch + ".svg";
    img.alt = ch + " celebration character";
    $("party-pieces").appendChild(img);
  });
  function update() {
    frame.className =
      "device-frame " + $("device").value + " " + $("orientation").value;
    const belt = $("belt").value;
    game.dataset.belt = belt;
    game.classList.toggle("original", $("appearance").value === "original");
    const ja = $("language").value === "ja";
    $("belt-label").textContent = ja
      ? { white: "白帯", yellow: "黄帯", black: "黒帯" }[belt]
      : { white: "White Belt", yellow: "Yellow Belt", black: "Black Belt" }[
          belt
        ];
    $("check-btn").textContent = ja ? "チェック" : "Check";
    $("hint-btn").textContent = ja ? "ヒント" : "Hint";
    const state = $("puzzle-state").value;
    const completed = state !== "playing";
    $("piece-tray").hidden = completed;
    $("celebration").hidden = !completed;
    $("celebration").classList.toggle("playing-now", state === "completed");
    $("rainbow").hidden = $("used-hint").checked || $("used-check").checked;
    $("check-count").textContent = $("used-check").checked ? "1" : "0";
    $("hint-count").textContent = $("used-hint").checked ? "1" : "0";
    $("celebration-message").textContent = ja
      ? "よくできました！"
      : "Well done!";
  }
  document
    .querySelectorAll(".lab-toolbar select,.lab-toolbar input")
    .forEach((el) => el.addEventListener("change", update));
  $("check-btn").addEventListener("click", () => {
    $("used-check").checked = true;
    update();
  });
  $("hint-btn").addEventListener("click", () => {
    $("used-hint").checked = true;
    update();
  });
  update();
})();
