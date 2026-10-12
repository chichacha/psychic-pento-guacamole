(() => {
  const root=document.getElementById('gomasu-tutorial');
  if(!root) return;
  const piece=root.querySelector('#gomasu-piece'), stage=root.querySelector('#gesture-stage');
  const title=root.querySelector('#gesture-title'), instruction=root.querySelector('#gesture-instruction');
  const feedback=root.querySelector('#gesture-feedback'), target=root.querySelector('#gomasu-target');
  const buttons=[...root.querySelectorAll('[data-step]')];
  const lessons=[
    ['① トン、とさわって回そう','ピースを一度タップしてみてね。90度、左に回ります。','☝️ ピースにさわってみよう'],
    ['② すーっと動かそう','ピースを指で押さえたまま、右の「ここへ！」まで動かしてね。','👆 押さえたまま、ゆっくり移動しよう'],
    ['③ シュッ！ とひっくり返そう','ピースを横か縦に、すばやく払って指を離してね。','👉 すばやくフリックしてみよう']
  ];
  let step=0, angle=0, flipX=1, flipY=1, x=0, y=0, gesture=null;
  const render=()=>{piece.style.transform=`translate(${x}px,${y}px) rotate(${angle}deg) scale(${flipX},${flipY})`};
  const success=msg=>{feedback.textContent='🎉 '+msg};
  function setStep(n){
    step=n;angle=0;flipX=1;flipY=1;x=0;y=0;gesture=null;render();
    title.textContent=lessons[n][0];instruction.textContent=lessons[n][1];feedback.textContent=lessons[n][2];
    target.style.display=n===1?'grid':'none';
    buttons.forEach((b,i)=>{b.classList.toggle('is-active',i===n);b.setAttribute('aria-pressed',String(i===n))});
    root.querySelector('#gesture-next').textContent=n===2?'最初から練習 ↺':'次の練習へ →';
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.step))));
  root.querySelector('#gesture-reset').addEventListener('click',()=>setStep(step));
  root.querySelector('#gesture-next').addEventListener('click',()=>setStep((step+1)%3));
  piece.addEventListener('pointerdown',e=>{
    if(!e.isPrimary)return;
    e.preventDefault();piece.setPointerCapture(e.pointerId);
    gesture={id:e.pointerId,sx:e.clientX,sy:e.clientY,px:e.clientX,py:e.clientY,at:performance.now(),lastAt:performance.now(),vx:0,vy:0,moved:false};
  });
  piece.addEventListener('pointermove',e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    const now=performance.now(),dt=Math.max(now-gesture.lastAt,1),dx=e.clientX-gesture.px,dy=e.clientY-gesture.py;
    gesture.vx=dx/dt;gesture.vy=dy/dt;gesture.px=e.clientX;gesture.py=e.clientY;gesture.lastAt=now;
    if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>9)gesture.moved=true;
    if(step===1){x+=dx;y+=dy;render()}
  });
  piece.addEventListener('pointerup',e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    const g=gesture;gesture=null;
    const dx=e.clientX-g.sx,dy=e.clientY-g.sy,dist=Math.hypot(dx,dy),elapsed=Math.max(performance.now()-g.at,1);
    if(step===0){if(dist<12){angle-=90;render();success('回ったね！')}else feedback.textContent='ゆっくり一度タップしてみよう';return}
    if(step===1){
      const a=piece.getBoundingClientRect(),b=target.getBoundingClientRect();
      const overlap=a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      if(overlap)success('上手に動かせたね！');else feedback.textContent='もう少し右の「ここへ！」まで動かしてみよう';
      return;
    }
    // Demo heuristic only: distance + overall gesture speed; tune against the real app.
    const speed=dist/elapsed;
    if(dist>45&&speed>0.45){
      if(Math.abs(dx)>Math.abs(dy)){flipX*=-1;success('左右にひっくり返った！')}
      else{flipY*=-1;success('上下にひっくり返った！')}
      render();
    }else feedback.textContent='もう少し速く、シュッと払ってみよう！';
  });
  piece.addEventListener('pointercancel',()=>{gesture=null});
  setStep(0);
})();