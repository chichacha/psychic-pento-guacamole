/* Secret Lab #30 — static Quarto prototype, no framework or game connection. */
(async function () {
  const root = document.getElementById('celebration-lab');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const base = new URL('../../', window.location.href);
  const asset = path => new URL(path, base).href;
  const [config, characters] = await Promise.all([
    fetch(asset('data/celebration.json')).then(r => { if (!r.ok) throw Error('celebration.json'); return r.json(); }),
    fetch(asset('data/characters.json')).then(r => { if (!r.ok) throw Error('characters.json'); return r.json(); })
  ]).catch(err => { $('lab-message').textContent = `Could not load data: ${err.message}`; return [null, null]; });
  if (!config || !characters) return;
  // Canonical five-square shapes (one fixed orientation per character).
  const cells = {
    F:[[1,0],[2,0],[0,1],[1,1],[1,2]], I:[[0,0],[0,1],[0,2],[0,3],[0,4]],
    L:[[0,0],[0,1],[0,2],[0,3],[1,3]], N:[[1,0],[1,1],[0,1],[0,2],[0,3]],
    P:[[0,0],[1,0],[0,1],[1,1],[0,2]], T:[[0,0],[1,0],[2,0],[1,1],[1,2]],
    U:[[0,0],[2,0],[0,1],[1,1],[2,1]], V:[[0,0],[0,1],[0,2],[1,2],[2,2]],
    W:[[0,0],[0,1],[1,1],[1,2],[2,2]], X:[[1,0],[0,1],[1,1],[2,1],[1,2]],
    Y:[[1,0],[1,1],[0,2],[1,2],[1,3]], Z:[[0,0],[1,0],[1,1],[1,2],[2,2]]
  };
  const byShape = Object.fromEntries(characters.map(c => [c.shape, c]));
  const order = 'FILNPTUVWXYZ'.split('');
  const language = () => $('lab-lang').value;
  const t = key => { const msg = config.messages[key]; return msg?.[language()] ?? msg?.[config.fallbackLanguage] ?? key; };
  const num = id => Number($(id).value);
  const piece = () => $('lab-piece').value;
  const svg = shape => {
    const coords = cells[shape]; const maxX = Math.max(...coords.map(c => c[0])) + 1;
    const maxY = Math.max(...coords.map(c => c[1])) + 1;
    const size = 35, pad = 5, width = maxX*size+pad*2, height = maxY*size+pad*2;
    const squares = coords.map(([x,y]) => `<rect x="${pad+x*size}" y="${pad+y*size}" width="${size}" height="${size}" rx="5" fill="${byShape[shape].color}" stroke="#4e4650" stroke-width="1.7"/>`).join('');
    const [fx,fy] = coords[Math.floor(coords.length/2)];
    const face = `<circle cx="${pad+(fx+.36)*size}" cy="${pad+(fy+.4)*size}" r="2.5" fill="#3a3038"/><circle cx="${pad+(fx+.64)*size}" cy="${pad+(fy+.4)*size}" r="2.5" fill="#3a3038"/><path d="M${pad+(fx+.35)*size} ${pad+(fy+.6)*size} Q${pad+(fx+.5)*size} ${pad+(fy+.77)*size} ${pad+(fx+.65)*size} ${pad+(fy+.6)*size}" stroke="#3a3038" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">${squares}${face}</svg>`;
  };
  function renderPiece() {
    $('lab-character').innerHTML = svg(piece());
    $('lab-piece-name').textContent = language() === 'ja' ? byShape[piece()].name_ja : byShape[piece()].title_en;
  }
  function renderControls() {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('lab-hints-value').textContent = num('lab-hints');
    $('lab-checks-value').textContent = num('lab-checks');
    renderPiece();
  }
  function addProps(count, file) {
    const limit = Math.min(count, config.maxVisibleProps ?? 5);
    for (let i = 0; i < limit; i++) {
      const img = document.createElement('img'); img.src = asset(`assets/svg/${file}.svg`);
      img.alt = ''; img.style.animationDelay = `${i*90}ms`; $('lab-props').append(img);
    }
    if (count > limit) { const extra = document.createElement('span'); extra.textContent = `+${count-limit}`; $('lab-props').append(extra); }
  }
  function celebrate() {
    const h = num('lab-hints'), c = num('lab-checks'), perfect = !h && !c;
    const key = perfect ? 'brilliant' : h && c ? 'both' : h ? 'books' : 'butterflies';
    $('lab-message').textContent = t(key);
    $('lab-description').textContent = perfect ? t('confettiDescription') : [h ? t('booksDescription') : '', c ? t('butterfliesDescription') : ''].filter(Boolean).join(' ');
    $('lab-props').replaceChildren(); $('lab-particles').replaceChildren();
    if (h) addProps(h, 'book');
    if (c) addProps(c, 'butterfly');
    const symbols = perfect ? ['🎊','🍬','✨','🎉','🍭'] : ['✨','🎉','⭐'];
    for (let i=0; i<(perfect?48:16); i++) {
      const el = document.createElement('span'); el.className = 'lab-particle';
      el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      el.style.setProperty('--x', `${Math.random()*100}%`);
      el.style.setProperty('--size', `${14+Math.random()*13}px`);
      el.style.setProperty('--duration', `${2+Math.random()*1.5}s`);
      el.style.setProperty('--delay', `${Math.random()*.9}s`);
      el.style.setProperty('--drift', `${(Math.random()-.5)*130}px`);
      $('lab-particles').append(el);
    }
    $('lab-stage').classList.remove('is-celebrating');
    void $('lab-stage').offsetWidth;
    $('lab-stage').classList.add('is-celebrating');
  }
  function resetPreview() {
    $('lab-message').textContent = t('ready'); $('lab-description').textContent = '';
    $('lab-props').replaceChildren(); $('lab-particles').replaceChildren();
    $('lab-stage').classList.remove('is-celebrating'); renderControls();
  }
  order.forEach(shape => {
    const option = document.createElement('option'); option.value = shape;
    option.textContent = `${shape} — ${byShape[shape].name_ja}`;
    $('lab-piece').append(option);
  });
  $('lab-piece').value = 'F';
  $('lab-lang').addEventListener('change', resetPreview);
  $('lab-piece').addEventListener('change', resetPreview);
  ['lab-hints','lab-checks'].forEach(id => $(id).addEventListener('input', resetPreview));
  $('lab-celebrate').addEventListener('click', celebrate);
  $('lab-replay').addEventListener('click', celebrate);
  resetPreview();
})();
