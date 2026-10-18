(() => {
  const target = document.getElementById("measurement-ranking-list");
  if (!target) return;
  const dimensions = {
    X:[3,3], I:[5,1], T:[3,3], U:[2,3],
    V:[3,3], W:[3,3], Z:[3,3], F:[3,3],
    L:[4,2], N:[4,2], P:[3,2], Y:[4,2]
  };
  fetch("../data/characters.json").then(r => r.json()).then(people => {
    const ordered = people.map(p => ({
      ...p, height: dimensions[p.shape][0], width: dimensions[p.shape][1]
    })).sort((a,b) => a.height-b.height || a.width-b.width || a.shape.localeCompare(b.shape));
    let rank = 0;
    let previous = null;
    for (const person of ordered) {
      if (person.height !== previous) rank++;
      previous = person.height;
      const row = document.createElement("div");
      row.className = "measurement-rank-row";
      const label = document.createElement("strong");
      label.textContent = rank + "位";
      const name = document.createElement("span");
      name.textContent = person.name_ja;
      const bar = document.createElement("span");
      bar.className = "measurement-rank-bar";
      bar.style.width = (person.height * 20) + "%";
      bar.style.backgroundColor = person.color;
      const size = document.createElement("span");
      size.textContent = person.height + " × " + person.width + " マス";
      row.append(label, name, bar, size);
      target.append(row);
    }
  }).catch(() => { target.textContent = "身長順を読み込めませんでした。"; });
})();
