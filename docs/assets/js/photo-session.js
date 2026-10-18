(() => {
  const svg = document.getElementById("photo-svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
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
  const button = document.getElementById("photo-level");
  const dialogue = document.getElementById("photo-dialogue");
  const caption = document.getElementById("photo-status");
  let phase = 0;
  function element(tag, attrs, parent = svg) {
    const e = document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,String(v)));
    parent.append(e);
    return e;
  }
  function say(x,y,text,fill="#66555d",size=11) {
    const t=element("text",{x,y,fill,"font-size":size,"text-anchor":"middle"});
    t.textContent=text;
  }
  function faceIndex(cells) {
    const top=Math.min(...cells.map(c=>c[1]));
    const center=(Math.min(...cells.map(c=>c[0]))+Math.max(...cells.map(c=>c[0])))/2;
    return cells.map((c,i)=>({x:c[0],y:c[1],i}))
      .filter(c=>c.y===top)
      .sort((a,b)=>Math.abs(a.x-center)-Math.abs(b.x-center)||a.x-b.x)[0].i;
  }
  function draw(people) {
    const unit=15, slot=83, floor=178;
    svg.setAttribute("viewBox","0 0 1010 230");
    svg.replaceChildren();
    element("rect",{x:0,y:0,width:1010,height:230,rx:15,fill:"#f7f3ed"});
    element("line",{x1:8,y1:floor-5*unit,x2:1002,y2:floor-5*unit,stroke:"#c97a7e","stroke-width":1.5,"stroke-dasharray":"5 5"});
    element("line",{x1:8,y1:floor,x2:1002,y2:floor,stroke:"#746c68","stroke-width":2});
    say(506,17,"📸 みんな、頭をそろえてくださーい！","#67565f",15);
    people.forEach((p,i) => {
      const cells=shapes[p.shape];
      const height=Math.max(...cells.map(c=>c[1]))+1;
      const width=Math.max(...cells.map(c=>c[0]))+1;
      const steps=phase===0?0:5-height;
      const left=13+i*slot+(slot-width*unit)/2;
      const bottom=floor-steps*unit;
      for(let j=0;j<steps;j++) {
        element("rect",{x:13+i*slot+8,y:floor-(j+1)*unit,width:slot-16,height:unit,rx:2,fill:"#d6c2a5",stroke:"#aa9278","stroke-width":1});
      }
      const top=bottom-height*unit;
      cells.forEach(([x,y])=>element("rect",{x:left+x*unit,y:top+y*unit,width:unit-1,height:unit-1,rx:2,fill:p.color,stroke:"#615760","stroke-width":0.9}));
      // Place the entire face inside a real, topmost occupied square.
      const [hx,hy]=cells[faceIndex(cells)];
      const cx=left+(hx+0.5)*unit, cy=top+(hy+0.5)*unit;
      element("circle",{cx:cx-2.6,cy:cy-1.4,r:1.15,fill:"#3d363c"});
      element("circle",{cx:cx+2.6,cy:cy-1.4,r:1.15,fill:"#3d363c"});
      element("path",{d:"M "+(cx-2.5)+" "+(cy+2)+" Q "+cx+" "+(cy+5)+" "+(cx+2.5)+" "+(cy+2),fill:"none",stroke:"#3d363c","stroke-width":0.9,"stroke-linecap":"round"});
      say(13+i*slot+slot/2,196,p.shape, "#554c53",13);
      say(13+i*slot+slot/2,212,steps+"段", "#73666a",11);
    });
  }
  fetch("../data/characters.json").then(r => {
    if(!r.ok) throw Error("Catalog missing");
    return r.json();
  }).then(people => {
    draw(people);
    button.addEventListener("click",() => {
      phase=(phase+1)%3;
      draw(people);
      if(phase===1) {
        dialogue.textContent="写真家「はい！ 全員、同じ高さになりました！」　Uおばさん「私は３段も登ったんですけど！」";
        caption.textContent="身長が低いほど、台が高くなります。必要な段数 = 5 − 身長。";
        button.textContent="📸 はい、チーズ！";
      } else if(phase===2) {
        dialogue.textContent="写真家「では、横幅もそろえましょう。」　全員「えっ！？」";
        caption.textContent="次の問題：高さはそろったけれど、横幅は……？";
        button.textContent="もう一度撮影する ↻";
      } else {
        dialogue.textContent="写真家「みなさん、頭の高さをそろえてください！」";
        caption.textContent="みんなの身長はバラバラ。どうすれば同じ高さになる？";
        button.textContent="踏み台を用意する！";
      }
    });
  }).catch(() => {
    dialogue.textContent="「あれ？ みなさん、まだ来ていませんね。」";
    button.disabled=true;
  });
})();
