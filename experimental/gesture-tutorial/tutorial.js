(() => {
  const root = document.getElementById('gomasu-tutorial');
  if (!root) return;
  const piece = root.querySelector('#gomasu-piece');
  const stage = root.querySelector('#gesture-stage');
  const title = root.querySelector('#gesture-title');
  const instruction = root.querySelector('#gesture-instruction');
  const feedback = root.querySelector('#gesture-feedback');
  const target = root.querySelector('#gomasu-target');
  const goal = root.querySelector('#gomasu-goal');
  const goalLabel = root.querySelector('#goal-label');
  const cue = root.querySelector('#gesture-cue');
  const buttons = [...root.querySelectorAll('[data-step]')];
  const lessons = [
    ['① トンッとタップで、くるっ！', 'ピースを一度タップして、点線の形にしてみよう。90度、左に回ります。', '☝️ ピースをタップしてみよう'],
    ['② すーっとドラッグしよう', 'ピースを押さえたまま、右の「ここへ！」まで動かしてね。', '👆 押さえたまま、ゆっくり動かそう'],
    ['③ シュッ！ とひっくり返そう', 'ピースを横にすばやくフリックして、点線の鏡うつしにしてみよう。', '👉 横にシュッとフリックしてみよう']
  ];
  // This is the exact five-square geometry used by #piece-shape.
  const cells = [[1,0],[2,0],[0,1],[1,1],[1,2]];
  const svgNS = 'http://www.w3.org/2000/svg';
  let step = 0, angle = 0, flipX = 1, flipY = 1, x = 0, y = 0, gesture = null, completed = false;

  function drawGoal() {
    goal.replaceChildren();
    if (step === 1) return;
    // SVG/CSS transform-origin is the SVG viewport center (75,75).
    // CSS rotate(-90deg) maps (px,py) -> (py,-px) on screen.
    const mapped = cells.map(([cx,cy]) => {
      const px = 25 + cx*25 + 12.5 - 75;
      const py = 25 + cy*25 + 12.5 - 75;
      return step === 0 ? [py,-px] : [-px,py];
    });
    mapped.forEach(([px,py]) => {
      const r = document.createElementNS(svgNS,'rect');
      r.setAttribute('x',String(px+75-12.5));
      r.setAttribute('y',String(py+75-12.5));
      r.setAttribute('width','25');r.setAttribute('height','25');
      r.setAttribute('fill','#6a9d89');r.setAttribute('fill-opacity','0.16');
      r.setAttribute('stroke','#39735c');r.setAttribute('stroke-width','2.5');
      r.setAttribute('stroke-dasharray','5 3');
      goal.appendChild(r);
    });
  }
  const render = () => { piece.style.transform = `translate(${x}px,${y}px) rotate(${angle}deg) scale(${flipX},${flipY})`; };
  function success(msg) {
    completed = true;
    stage.classList.add('is-complete');
    cue.textContent = '✓ できた！';
    feedback.textContent = '🎉 ' + msg;
  }
  function setStep(n) {
    step=n;angle=0;flipX=1;flipY=1;x=0;y=0;gesture=null;completed=false;
    stage.classList.remove('is-complete');
    stage.dataset.lesson=['tap','drag','flick'][n];
    title.textContent=lessons[n][0];instruction.textContent=lessons[n][1];feedback.textContent=lessons[n][2];
    goalLabel.textContent=n===2?'鏡うつしの形':'めざす形';
    cue.textContent=['↶ 90° 左に回す','→ ここへ動かす','⇄ 横にフリックして反転'][n];
    target.style.display=n===1?'grid':'none';
    drawGoal();render();
    buttons.forEach((b,i)=>{b.classList.toggle('is-active',i===n);b.setAttribute('aria-pressed',String(i===n));});
    root.querySelector('#gesture-next').textContent=n===2?'最初から練習 ↺':'次の練習へ →';
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.step))));
  root.querySelector('#gesture-reset').addEventListener('click',()=>setStep(step));
  root.querySelector('#gesture-next').addEventListener('click',()=>setStep((step+1)%3));
  piece.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||completed)return;
    e.preventDefault();piece.setPointerCapture(e.pointerId);
    gesture={id:e.pointerId,sx:e.clientX,sy:e.clientY,px:e.clientX,py:e.clientY,at:performance.now()};
  });
  piece.addEventListener('pointermove',e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    const dx=e.clientX-gesture.px,dy=e.clientY-gesture.py;
    gesture.px=e.clientX;gesture.py=e.clientY;
    if(step===1){x+=dx;y+=dy;render();}
  });
  piece.addEventListener('pointerup',e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    const g=gesture;gesture=null;
    const dx=e.clientX-g.sx,dy=e.clientY-g.sy,dist=Math.hypot(dx,dy),elapsed=Math.max(performance.now()-g.at,1);
    if(step===0){
      if(dist<12){angle=-90;render();success('点線の形になったね！');}
      else feedback.textContent='動かさず、トンとタップしてみよう';
      return;
    }
    if(step===1){
      const a=piece.getBoundingClientRect(),b=target.getBoundingClientRect();
      const overlap=a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      if(overlap)success('上手にドラッグできたね！');
      else feedback.textContent='もう少し右の「ここへ！」まで動かしてみよう';
      return;
    }
    const speed=dist/elapsed;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25&&speed>0.45){
      flipX=-1;render();success('鏡うつしになったね！');
    } else feedback.textContent='横に、もう少し速くシュッと払ってみよう！';
  });
  piece.addEventListener('pointercancel',()=>{gesture=null;});
  setStep(0);
})();
