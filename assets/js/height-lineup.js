(() => {
  const target = document.getElementById("measurement-ranking-list");
  if (!target) return;
  const dimensions = {
    X:[3,3], I:[5,1], T:[3,3], U:[2,3],
    V:[3,3], W:[3,3], Z:[3,3], F:[3,3],
    L:[4,2], N:[4,2], P:[3,2], Y:[4,2]
  };
  const heightButton = document.getElementById("sort-height");
  const widthButton = document.getElementById("sort-width");
  const note = document.getElementById("measurement-sort-note");
  fetch("../data/characters.json").then(r => {
    if (!r.ok) throw new Error("Missing characters");
    return r.json();
  }).then(people => {
    const villagers = people.map(p => ({
      ...p, height: dimensions[p.shape][0], width: dimensions[p.shape][1]
    }));
    function render(primary) {
      const secondary = primary === "height" ? "width" : "height";
      const ordered = [...villagers].sort((a,b) =>
        a[primary]-b[primary] || a[secondary]-b[secondary] || a.shape.localeCompare(b.shape)
      );
      heightButton.setAttribute("aria-pressed", String(primary === "height"));
      widthButton.setAttribute("aria-pressed", String(primary === "width"));
      note.textContent = primary === "height"
        ? "身長で同順位。横幅、形のアルファベット順で並びます。"
        : "横幅で同順位。身長、形のアルファベット順で並びます。";
      target.replaceChildren();
      let rank=0, previous=null;
      for(const person of ordered) {
        if(person[primary] !== previous) rank++;
        previous = person[primary];
        const row=document.createElement("div");
        row.className="measurement-rank-row";
        const label=document.createElement("strong");
        label.textContent=rank+"位";
        const name=document.createElement("span");
        name.textContent=person.name_ja;
        const bar=document.createElement("span");
        bar.className="measurement-rank-bar";
        bar.style.width=(person[primary]*20)+"%";
        bar.style.backgroundColor=person.color;
        const size=document.createElement("span");
        size.textContent=person.height+" × "+person.width+" マス";
        row.append(label,name,bar,size);
        target.append(row);
      }
    }
    heightButton.addEventListener("click",()=>render("height"));
    widthButton.addEventListener("click",()=>render("width"));
    render("height");
  }).catch(() => { target.textContent="身長順を読み込めませんでした。"; });
})();
