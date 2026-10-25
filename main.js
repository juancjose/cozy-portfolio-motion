(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // menú móvil
  const t = $('.bar__toggle'), nav = $('#menu');
  const setMenu = o => { t.setAttribute('aria-expanded', String(o)); nav.classList.toggle('is-open', o); document.body.style.overflow = o ? 'hidden' : ''; };
  t.addEventListener('click', () => setMenu(t.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // contadores
  const fmt = n => n.toLocaleString('es-AR');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count; if (reduce) return;
    const t0 = performance.now(), d = 1600;
    const step = now => { const p = Math.min(1, (now - t0) / d); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // carrusel de deportistas
  const rail = $('#rail');
  $$('.rowhead__ctrl .round').forEach(b => b.addEventListener('click', () => {
    const w = rail.firstElementChild.getBoundingClientRect().width + 20;
    rail.scrollBy({ left: w * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
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
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % imgs.length), 6000); };
  thumbs.forEach(b => b.addEventListener('click', () => { show(+b.dataset.i); auto(); }));
  auto();

  // video mochila
  const v = $('#reel-video');
  if (v) {
    const vio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (!v.dataset.loaded) {
          v.dataset.loaded = 1;
          [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => { const s = document.createElement('source'); s.src = v.dataset[k]; s.type = type; v.appendChild(s); });
          v.load();
        }
        if (!reduce) v.play().then(() => v.classList.add('is-playing')).catch(() => {});
      } else v.pause();
    }), { threshold: .35 });
    vio.observe(v);
  }

  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();
