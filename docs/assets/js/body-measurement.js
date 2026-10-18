/* STORY 002 — Interactive body measurements. Vanilla JS + SVG.
 * Coordinates represent the five unit-square cells of each pentomino.
 * The story measures the current orientation, not a person's real height.
 */
(() => {
  const root = document.getElementById("measurement-app");
  if (!root) return;

  // Five unit squares per villager. Other metadata comes from the shared catalog.
  const shapes = {
    X:[[1,0],[0,1],[1,1],[2,1],[1,2]],
    I:[[0,0],[0,1],[0,2],[0,3],[0,4]],
    T:[[0,0],[1,0],[2,0],[1,1],[1,2]],
    U:[[0,0],[2,0],[0,1],[1,1],[2,1]],
    V:[[0,0],[0,1],[0,2],[1,2],[2,2]],
    W:[[0,0],[0,1],[1,1],[1,2],[2,2]],
    Z:[[0,0],[1,0],[1,1],[1,2],[2,2]],
    F:[[1,0],[2,0],[0,1],[1,1],[1,2]],
    L:[[0,0],[0,1],[0,2],[0,3],[1,3]],
    N:[[0,0],[0,1],[1,1],[1,2],[1,3]],
    P:[[0,0],[1,0],[0,1],[1,1],[0,2]],
    Y:[[1,0],[1,1],[0,2],[1,2],[1,3]]
  };
  const remarks = {
    X:"「身長3マス、横幅3マス。去年と同じですね。」「はい。ずっとこのままです。」",
    I:"「身長5マス！」「ありがとうございます。」「ほめてはいません。」",
    T:"「測定の順番はわたしが決めます！」「今日は患者さんですよ。」",
    U:"「横幅も測るんですか？」「はい。すき間は身長に含めません。」",
    V:"「測定台の角、落ち着きますね。」「そこから動いてください。」",
    W:"「一段ずつ測ってもいいですか？」「まとめて測らせてください。」",
    Z:"「途中で曲がっていますね。」「つないでいるんです。」",
    F:"「もう一回、別の向きで！」「先ほども測りましたよ。」",
    L:"「高いところには届きます。」「今日は身長だけ測ります。」",
    N:"「ちょっとずれてます？」「いつものことですね。」",
    P:"「ぎゅっとしてきました。」「測定台では力を抜いてください。」",
    Y:"「この一マスは測定に入りますか？」「もちろんです。」"
  };

  const svg = document.getElementById("measurement-svg");
  const reading = document.getElementById("measurement-reading");
  const dialogue = document.getElementById("measurement-dialogue");
  const queue = document.getElementById("measurement-queue");
  const progress = document.getElementById("measurement-progress");
  const finale = document.getElementById("measurement-finale");
  const rotateButton = document.getElementById("measurement-turn");
  const nextButton = document.getElementById("measurement-next");
  const NS = "http://www.w3.org/2000/svg";
  let people = [];
  let selected = 0;
  let turns = 0;
  const measured = new Set();

  function normalize(cells) {
    const minX = Math.min(...cells.map(([x]) => x));
    const minY = Math.min(...cells.map(([,y]) => y));
    return cells.map(([x,y]) => [x-minX,y-minY]);
  }
  function rotate(cells) {
    return normalize(cells.map(([x,y]) => [-y,x]));
  }
  function oriented(shape) {
    let cells = shapes[shape];
    for(let i=0;i<turns;i++) cells = rotate(cells);
    return cells;
  }
  // Pick the topmost occupied square; ties go to the square nearest body center.
  // Keep its identity through rotation, so the face stays on the same square.
  function faceIndex(cells) {
    const top = Math.min(...cells.map(c => c[1]));
    const center = (Math.min(...cells.map(c => c[0])) + Math.max(...cells.map(c => c[0]))) / 2;
    return cells.map((c,i) => ({x:c[0],y:c[1],i}))
      .filter(c => c.y === top)
      .sort((a,b) => Math.abs(a.x-center)-Math.abs(b.x-center) || a.x-b.x)[0].i;
  }
  function drawFace(x,y,unit) {
    const cx=x+unit/2, cy=y+unit/2;
    const gap=unit*0.12;
    el("circle",{cx:cx-gap,cy:cy-unit*0.09,r:unit*0.045,fill:"#42353d"});
    el("circle",{cx:cx+gap,cy:cy-unit*0.09,r:unit*0.045,fill:"#42353d"});
    el("path",{d:"M "+(cx-gap)+" "+(cy+unit*0.08)+" Q "+cx+" "+(cy+unit*0.20)+" "+(cx+gap)+" "+(cy+unit*0.08),fill:"none",stroke:"#42353d","stroke-width":unit*0.035,"stroke-linecap":"round"});
  }
  function dimensions(cells) {
    return {
      width:Math.max(...cells.map(([x]) => x))+1,
      height:Math.max(...cells.map(([,y]) => y))+1
    };
  }
  function el(name,attrs={},parent=svg) {
    const node=document.createElementNS(NS,name);
    Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
    parent.appendChild(node);
    return node;
  }
  function label(text,x,y,size=13) {
    const node=el("text",{x,y,"text-anchor":"middle","font-size":size,fill:"#665d67"});
    node.textContent=text;
  }
  function draw() {
    const person=people[selected];
    const cells=oriented(person.shape);
    const {width,height}=dimensions(cells);
    const unit=48;
    const left=170-width*unit/2;
    const top=280-height*unit;
    svg.replaceChildren();
    // Ruler and floor
    el("line",{x1:35,y1:280,x2:305,y2:280,stroke:"#8d8188","stroke-width":2});
    for(let n=0;n<=5;n++) {
      const y=280-n*unit;
      el("line",{x1:43,y1:y,x2:300,y2:y,stroke:"#b6acb0","stroke-dasharray":"3 7"});
      label(String(n),27,y+4,12);
    }
    cells.forEach(([x,y]) => {
      el("rect",{x:left+x*unit,y:top+y*unit,width:unit-2,height:unit-2,rx:5,fill:person.color,stroke:"#665d67","stroke-width":1.4});
    });
    const head=faceIndex(shapes[person.shape]);
    // The chosen original square follows the rotation, but the eyes stay upright.
    const [faceX,faceY]=cells[head];
    drawFace(left+faceX*unit,top+faceY*unit,unit);
    // Height arrow
    el("line",{x1:314,y1:top,x2:314,y2:280,stroke:"#8c6683","stroke-width":2});
    label(height+"マス",275,top-10,13);
    label(person.name,170,316,14);
    reading.textContent="身長 "+height+"マス ／ 横幅 "+width+"マス";
    dialogue.textContent=remarks[person.shape];
    progress.textContent="測定済み "+measured.size+" / 12";
    queue.querySelectorAll("button").forEach(button=>{
      const active=Number(button.dataset.index)===selected;
      button.setAttribute("aria-pressed",String(active));
      button.classList.toggle("is-done",measured.has(button.dataset.shape));
    });
    finale.hidden=measured.size!==12;
  }
  function choose(index) {
    selected=index;
    turns=0;
    measured.add(people[selected].shape);
    draw();
  }
  function buildQueue() {
    queue.replaceChildren();
    people.forEach((person,index)=>{
      const button=document.createElement("button");
      button.type="button";
      button.dataset.index=String(index);
      button.dataset.shape=person.shape;
      const mini=document.createElementNS(NS,"svg");
      mini.setAttribute("viewBox","0 0 50 50");
      mini.setAttribute("aria-hidden","true");
      const cells=shapes[person.shape];
      const {width,height}=dimensions(cells);
      cells.forEach(([x,y])=>{
        const square=document.createElementNS(NS,"rect");
        square.setAttribute("x",String(25-width*4+x*8));
        square.setAttribute("y",String(25-height*4+y*8));
        square.setAttribute("width","7.5");
        square.setAttribute("height","7.5");
        square.setAttribute("rx","1");
        square.setAttribute("fill",person.color);
        mini.appendChild(square);
      });
      const name=document.createElement("span");
      name.textContent=person.name;
      button.append(mini,name);
      button.addEventListener("click",()=>choose(index));
      queue.appendChild(button);
    });
  }
  rotateButton.addEventListener("click",()=>{turns=(turns+1)%4;draw();});
  nextButton.addEventListener("click",()=>choose((selected+1)%people.length));

  fetch("../data/characters.json")
    .then(response=>{if(!response.ok) throw Error("Character catalog unavailable");return response.json();})
    .then(data=>{
      people=data.filter(person=>Object.hasOwn(shapes,person.shape));
      if(people.length!==12) throw Error("Expected twelve characters");
      buildQueue();
      choose(0);
    })
    .catch(error=>{
      console.error("身体測定室:",error);
      reading.textContent="住民データを読み込めませんでした。";
      dialogue.textContent="「今日は休診です。また来てください。」";
      rotateButton.disabled=true;
      nextButton.disabled=true;
    });
})();
