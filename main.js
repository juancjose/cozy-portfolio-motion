(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasIO = 'IntersectionObserver' in window;
  window.__cozyMotion = true;

  // menú móvil
  const t = $('.bar__toggle'), nav = $('#menu');
  const setMenu = o => { t.setAttribute('aria-expanded', String(o)); nav.classList.toggle('is-open', o); document.body.style.overflow = o ? 'hidden' : ''; };
  t.addEventListener('click', () => setMenu(t.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // reveal
  if (hasIO) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('is-in')); // sin IntersectionObserver: todo visible

  // contadores
  const fmt = n => n.toLocaleString('es-AR');
  const cio = !hasIO ? null : new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count;
    const t0 = performance.now(), d = 1600;
    const step = now => { const p = Math.min(1, (now - t0) / d); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .4 });
  if (cio) $$('[data-count]').forEach(el => cio.observe(el));

  // carrusel de deportistas
  const rail = $('#rail');
  $$('.rowhead__ctrl .round').forEach(b => b.addEventListener('click', () => {
    const w = rail.firstElementChild.getBoundingClientRect().width + 20;
    rail.scrollBy({ left: w * +b.dataset.dir, behavior: 'smooth' });
  }));
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-drag'); } rail.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; rail.classList.remove('is-drag'); });
  rail.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);

  // galería con miniaturas
  const imgs = $$('.stage__bg img'), label = $('#stage-label'), thumbs = $$('.thumbs button');
  let cur = 0, timer;
  const show = i => {
    cur = i;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    thumbs.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    label.textContent = thumbs[i].dataset.label;
  };
  const auto = () => { clearInterval(timer); timer = setInterval(() => show((cur + 1) % imgs.length), 6000); };
  thumbs.forEach(b => b.addEventListener('click', () => { show(+b.dataset.i); auto(); }));
  auto();

  // video mochila
  const v = $('#reel-video');
  const loadV = () => {
    if (v.dataset.loaded) return; v.dataset.loaded = 1;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => { const s = document.createElement('source'); s.src = v.dataset[k]; s.type = type; v.appendChild(s); });
    v.load();
  };
  const playV = () => v.play().then(() => v.classList.add('is-playing')).catch(() => {});
  if (v && !hasIO) { loadV(); playV(); }
  if (v && hasIO) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        loadV();
        playV();
      } else v.pause();
    }), { threshold: .35 });
    vio.observe(v);
  }

  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();

/* Carrusel continuo de deportistas: pasa solo, no se frena con el mouse */
(() => {
  const rail = document.getElementById('rail');
  if (!rail) return;
  const items = [...rail.children];
  items.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('img').forEach(i => i.alt = ''); rail.appendChild(c); });
  rail.classList.add('is-auto');
  let pos = rail.scrollLeft, touching = false, last = performance.now();
  const half = () => rail.scrollWidth / 2;
  rail.addEventListener('touchstart', () => touching = true, { passive: true });
  rail.addEventListener('touchend', () => { touching = false; pos = rail.scrollLeft; }, { passive: true });
  rail.addEventListener('pointerdown', () => { touching = true; });
  addEventListener('pointerup', () => { if (touching) { touching = false; pos = rail.scrollLeft; } });
  document.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => setTimeout(() => pos = rail.scrollLeft, 700)));
  const tick = now => {
    const dt = Math.min(now - last, 50); last = now;
    if (!touching) {
      pos += dt * 0.045;
      if (pos >= half()) pos -= half();
      if (pos < 0) pos += half();
      rail.scrollLeft = pos;
    } else if (rail.scrollLeft >= half()) { rail.scrollLeft -= half(); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
