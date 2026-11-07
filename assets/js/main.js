/* =========================================================
   MÉTODO ALPHA: interações e motion
   ========================================================= */

/* ---------- CONFIGURAÇÃO: edite aqui ---------- */
const CONFIG = {
  // Link do checkout (Hotmart, Kiwify, Eduzz etc.). Todos os botões usam este link.
  checkoutUrl: 'https://pay.kiwify.com.br/A31zAQY',
  // Abrir o checkout em nova aba?
  checkoutNewTab: false,
  // Repassa os parâmetros UTM da URL da página para o link do checkout
  forwardUtm: true,
};
/* --------------------------------------------- */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Links de checkout ---------- */
  function buildCheckoutUrl() {
    if (!CONFIG.checkoutUrl || CONFIG.checkoutUrl === '#') return '#oferta';
    try {
      const url = new URL(CONFIG.checkoutUrl, location.href);
      if (CONFIG.forwardUtm) {
        new URLSearchParams(location.search).forEach((v, k) => {
          if (/^(utm_|src|sck|fbclid|gclid|ttclid)/i.test(k) && !url.searchParams.has(k)) url.searchParams.set(k, v);
        });
      }
      return url.toString();
    } catch (e) { return CONFIG.checkoutUrl; }
  }
  const checkoutHref = buildCheckoutUrl();
  document.querySelectorAll('[data-checkout]').forEach((a) => {
    a.setAttribute('href', checkoutHref);
    if (CONFIG.checkoutNewTab && checkoutHref.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });

  /* ---------- Botões da página: rolam até a caixa de oferta ---------- */
  const offerBox = document.getElementById('comprar');
  document.querySelectorAll('[data-goto-offer]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (!offerBox) return;
      e.preventDefault();
      offerBox.classList.add('is-in');
      offerBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      offerBox.classList.remove('is-highlight');
      void offerBox.offsetWidth;
      offerBox.classList.add('is-highlight');
      history.replaceState(null, '', location.pathname + location.search + '#comprar');
    });
  });

  /* ---------- Entrada (intro + hero) ---------- */
  const intro = document.getElementById('intro');
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem('ma_intro') === '1'; } catch (e) {}

  // Atrasos escalonados do hero
  const stagger = [
    ['.hero .brand', 0],
    ['.hero .eyebrow', .1],
    ['.hero__lead', .75],
    ['.hero__sub', .85],
    ['.hero__offer', .95],
    ['.trust', 1.1],
  ];
  stagger.forEach(([sel, d]) => { const el = document.querySelector(sel); if (el) el.style.setProperty('--d', d + 's'); });
  document.querySelectorAll('.hero-word').forEach((w, i) => w.style.setProperty('--d', (0.2 + i * 0.1) + 's'));

  function startHero() {
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    setTimeout(() => countUpHero(), 1300);
  }

  function finishIntro(fast) {
    if (!intro) return startHero();
    if (fast) {
      intro.classList.add('is-done');
      startHero();
      return;
    }
    intro.classList.add('is-out');
    setTimeout(startHero, 450);
    setTimeout(() => intro.classList.add('is-done'), 1400);
  }

  if (reduceMotion || seenIntro) {
    finishIntro(true);
  } else {
    const minTime = 1900;
    const t0 = performance.now();
    const go = () => {
      const wait = Math.max(0, minTime - (performance.now() - t0));
      setTimeout(() => finishIntro(false), wait);
    };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    // segurança: nunca prender o usuário na intro
    setTimeout(() => { if (!body.classList.contains('is-ready')) finishIntro(false); }, 3500);
    try { sessionStorage.setItem('ma_intro', '1'); } catch (e) {}
  }

  /* ---------- Contadores ---------- */
  function animateNumber(el, to, { decimals = 0, duration = 1600, prefix = '', suffix = '' } = {}) {
    if (reduceMotion) { el.textContent = prefix + format(to, decimals) + suffix; return; }
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + format(to * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function format(n, d) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function parsePrice(txt) { return parseFloat(txt.replace(/\./g, '').replace(',', '.')) || 0; }
  // guarda o valor final e zera os preços do hero antes da animação
  document.querySelectorAll('[data-price-count]').forEach((el) => { el.dataset.to = parsePrice(el.textContent); });
  if (!reduceMotion) document.querySelectorAll('.hero [data-price-count]').forEach((el) => { el.textContent = '0,00'; });

  function countUpHero() {
    document.querySelectorAll('.hero [data-count-to]').forEach((el) => {
      animateNumber(el, +el.dataset.countTo, { suffix: el.dataset.countSuffix || '', prefix: el.dataset.countPrefix || '' });
    });
    document.querySelectorAll('.hero [data-price-count]').forEach((el) => {
      animateNumber(el, +el.dataset.to, { decimals: 2, duration: 1400 });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  // escalona elementos irmãos
  const groups = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.setProperty('--rd', Math.min(idx * 0.08, 0.5) + 's');
    groups.set(parent, idx + 1);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll?.('[data-price-count]').forEach((el) => {
          if (el.dataset.done) return;
          el.dataset.done = '1';
          animateNumber(el, +el.dataset.to, { decimals: 2, duration: 1400 });
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Contagem regressiva (até 23:59:59 de hoje) ---------- */
  const cd = document.querySelector('[data-countdown]');
  const cdInline = document.querySelectorAll('[data-countdown-inline]');
  function tick() {
    const now = new Date();
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    let diff = Math.max(0, end - now);
    const h = String(Math.floor(diff / 3.6e6)).padStart(2, '0'); diff %= 3.6e6;
    const m = String(Math.floor(diff / 6e4)).padStart(2, '0'); diff %= 6e4;
    const s = String(Math.floor(diff / 1e3)).padStart(2, '0');
    if (cd) {
      cd.querySelector('[data-h]').textContent = h;
      cd.querySelector('[data-m]').textContent = m;
      cd.querySelector('[data-s]').textContent = s;
    }
    cdInline.forEach((el) => (el.textContent = `${h}:${m}:${s}`));
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Ciclo do método (auto-play) ---------- */
  const phases = [...document.querySelectorAll('.phase')];
  const nodes = [...document.querySelectorAll('.node')];
  let current = 0, timer;
  function setPhase(i) {
    current = i;
    phases.forEach((p, k) => p.classList.toggle('is-active', k === i));
    nodes.forEach((n, k) => n.classList.toggle('is-active', k === i));
  }
  function autoplay() {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(() => setPhase((current + 1) % phases.length), 3800);
  }
  phases.forEach((p, i) => {
    p.addEventListener('click', () => { setPhase(i); autoplay(); });
    p.addEventListener('mouseenter', () => { setPhase(i); clearInterval(timer); });
    p.addEventListener('mouseleave', autoplay);
  });
  if (phases.length) { setPhase(0); autoplay(); }

  /* ---------- CTA fixo no mobile ---------- */
  const sticky = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const finalSec = document.querySelector('.final');
  const ticket = document.querySelector('.ticket');
  if (sticky && hero && 'IntersectionObserver' in window) {
    let heroVisible = true, endVisible = false;
    const update = () => sticky.classList.toggle('is-visible', !heroVisible && !endVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(hero);
    const endIo = new IntersectionObserver((entries) => {
      endVisible = entries.some((e) => e.isIntersecting) ||
        [finalSec, ticket].some((el) => el && el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0);
      update();
    }, { threshold: 0.2 });
    [finalSec, ticket].forEach((el) => el && endIo.observe(el));
  }

  /* ---------- Lightbox das aprovações ---------- */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const lbImg = lb.querySelector('img');
    let lastFocus;
    const close = () => {
      lb.classList.remove('is-open');
      setTimeout(() => { lb.hidden = true; }, 300);
      lastFocus && lastFocus.focus();
    };
    document.querySelectorAll('.approval').forEach((btn) => {
      btn.addEventListener('click', () => {
        lastFocus = btn;
        lbImg.src = btn.dataset.full;
        lb.hidden = false;
        requestAnimationFrame(() => lb.classList.add('is-open'));
        lb.querySelector('.lightbox__close').focus();
      });
    });
    lb.addEventListener('click', (e) => { if (e.target !== lbImg) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });
  }

  /* ---------- FAQ: um aberto por vez ---------- */
  const qas = document.querySelectorAll('.qa');
  qas.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- Ano no rodapé ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Parallax suave no hero (desktop) ---------- */
  const frame = document.querySelector('.hero__frame');
  if (frame && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const yv = (e.clientY - r.top) / r.height - 0.5;
      frame.style.translate = `${x * -12}px ${yv * -12}px`;
    });
  }
})();
