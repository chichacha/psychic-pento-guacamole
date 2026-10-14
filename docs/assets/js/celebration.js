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
  const selectedColors = () => [...root.querySelectorAll('.lab-color-input:checked')].map(el => byShape[el.value].color);
  const palette = () => selectedColors().length ? selectedColors() : [byShape[piece()].color];
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
    $('lab-level-value').textContent = num('lab-level');
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
  function candySVG(kind, color) {
    const shape = kind === 'circle' ? '<circle cx="12" cy="12" r="7"/>'
      : kind === 'diamond' ? '<path d="M12 3 L21 12 L12 21 L3 12 Z"/>'
      : kind === 'candy' ? '<path d="M6 9 L1 5 L1 19 L6 15 M18 9 L23 5 L23 19 L18 15"/><rect x="6" y="7" width="12" height="10" rx="4"/>'
      : '<rect x="5" y="8" width="14" height="8" rx="2"/>';
    return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" fill="${color}" stroke="#655d61" stroke-width=".8">${shape}</svg>`;
  }
  function celebrate() {
    const h = num('lab-hints'), c = num('lab-checks'), perfect = !h && !c;
    const key = perfect ? 'brilliant' : h && c ? 'both' : h ? 'caterpillars' : 'butterflies';
    $('lab-message').textContent = t(key);
    $('lab-description').textContent = perfect ? t('confettiDescription') : [h ? t('caterpillarsDescription') : '', c ? t('butterfliesDescription') : ''].filter(Boolean).join(' ');
    $('lab-props').replaceChildren(); $('lab-particles').replaceChildren();
    if (h) addProps(h, 'caterpillar');
    if (c) addProps(c, 'butterfly');
    const colors = palette(), level = num('lab-level');
    const count = perfect ? 46 : 20;
    // Level changes shape variety, not the identity of the character colors.
    const kinds = level <= 3 ? ['rectangle'] : level <= 6 ? ['rectangle','circle'] : level <= 8 ? ['rectangle','circle','diamond'] : ['rectangle','circle','diamond','candy'];
    const stageHeight = $('lab-stage').clientHeight;
    const floor = Math.max(75, stageHeight - 32);
    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random()*kinds.length)];
      const color = colors[Math.floor(Math.random()*colors.length)];
      const x = 5 + Math.random()*90, drift = (Math.random()-.5)*75;
      const landing = floor - Math.random()*28;
      const el = document.createElement('span');
      el.className = 'lab-particle';
      el.innerHTML = candySVG(kind, color);
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--size', `${9+Math.random()*9}px`);
      el.style.setProperty('--duration', `${1.6+Math.random()*1.5}s`);
      el.style.setProperty('--delay', `${Math.random()*.9}s`);
      el.style.setProperty('--drift', `${drift}px`);
      el.style.setProperty('--landing', `${landing}px`);
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
  // All twelve pieces selected by default; toggle to simulate a partial palette.
  order.forEach(shape => {
    const label = document.createElement('label'); label.className = 'lab-color-chip';
    const input = document.createElement('input'); input.type = 'checkbox'; input.className = 'lab-color-input';
    input.value = shape; input.checked = true;
    const dot = document.createElement('span'); dot.className = 'lab-color-dot'; dot.style.background = byShape[shape].color;
    const text = document.createElement('span'); text.textContent = shape;
    label.append(input, dot, text); $('lab-colors').append(label);
    input.addEventListener('change', resetPreview);
  });
  $('lab-lang').addEventListener('change', resetPreview);
  $('lab-piece').addEventListener('change', resetPreview);
  ['lab-hints','lab-checks','lab-level'].forEach(id => $(id).addEventListener('input', resetPreview));
  $('lab-celebrate').addEventListener('click', celebrate);
  $('lab-replay').addEventListener('click', celebrate);
  resetPreview();
})();
