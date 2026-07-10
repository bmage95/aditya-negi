// ============================================================
//  Aditya Negi — portfolio interactions
// ============================================================
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- mobile nav ----------
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle?.addEventListener('click', (e) => {
  links.classList.toggle('open');
  toggle.classList.toggle('active');   // animate hamburger bars via CSS
  e.stopPropagation();
});
document.addEventListener('click', (e) => {
  if ((toggle && !toggle.contains(e.target) && links && !links.contains(e.target)) || e.target.closest('a')) {
    links?.classList.remove('open');
    toggle?.classList.remove('active');
  }
});

// Anchor scroll flag to prevent nav hiding
window.isAutoScrolling = false;
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => {
    window.isAutoScrolling = true;
    setTimeout(() => window.isAutoScrolling = false, 1200);
  });
});
// ---------- per-word heading reveal ----------
// Splits section h2s into overflow-hidden word spans; `.reveal.in` (below) triggers
// the staggered rise. Skipped entirely under reduced motion — headings just show.
(function () {
  if (reduce) return;
  document.querySelectorAll('.section-head h2, .resume-left h2').forEach((h) => {
    let i = 0;
    [...h.childNodes].forEach((n) => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;   // keep <br> etc.
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi';
        wi.style.setProperty('--wi', i++);
        wi.textContent = part;
        w.appendChild(wi); frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
  });
})();

// ---------- reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- count-up stats ----------
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.target, 10);
    if (!target) { countIO.unobserve(el); return; }
    if (reduce) { el.textContent = target + '+'; countIO.unobserve(el); return; }
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => { n = Math.min(target, n + step); el.textContent = n + '+'; if (n < target) requestAnimationFrame(tick); };
    tick();
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.num[data-target]').forEach(el => countIO.observe(el));

// ---------- active nav link on scroll ----------
const navMap = {};
document.querySelectorAll('.nav-links a').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  if (id) navMap[id] = a;
});
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    const a = navMap[e.target.id];
    if (a && e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
Object.keys(navMap).forEach(id => { const s = document.getElementById(id); if (s) navIO.observe(s); });

// ---------- terminal tilt on cursor ----------
const term = document.querySelector('.terminal');
const heroRight = document.querySelector('.hero-right');
if (term && heroRight && !reduce && window.matchMedia('(pointer:fine)').matches) {
  heroRight.addEventListener('mousemove', (ev) => {
    const r = heroRight.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width - 0.5;
    const py = (ev.clientY - r.top) / r.height - 0.5;
    term.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
  });
  heroRight.addEventListener('mouseleave', () => { term.style.transform = ''; });
}

// ---------- terminal typewriter ----------
const code = document.getElementById('termCode');
// [className, text]  — empty className = typed "command", styled = fast "output"
const SEG = [
  ['c-mute', '$ '], ['', 'whoami\n'],
  ['c-acc', 'aditya_negi\n'],
  ['c-mute', '$ '], ['', 'cat role.txt\n'],
  ['c-txt', 'Full-stack dev · Web & App · Freelance\n'],
  ['c-mute', '$ '], ['', 'ls ./skills\n'],
  ['c-txt', 'react  next  typescript  flutter\nnode   python  shopify  firebase\n'],
  ['c-mute', '$ '], ['', 'status --now\n'],
  ['c-ok', '● open for freelance\n'],
  ['c-mute', '$ '],
];
function renderInstant() {
  code.innerHTML = '';
  SEG.forEach(([c, t]) => {
    const s = document.createElement('span');
    if (c) s.className = c;
    s.textContent = t;
    code.appendChild(s);
  });
  const cur = document.createElement('span');
  cur.className = 'term-cursor blink';
  cur.textContent = '▍';
  code.appendChild(cur);
}
async function typeTerminal() {
  code.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'term-cursor';
  cursor.textContent = '▍';
  code.appendChild(cursor);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  for (const [c, t] of SEG) {
    const span = document.createElement('span');
    if (c) span.className = c;
    code.insertBefore(span, cursor);
    const isCmd = !c;                       // typed slower for "commands"
    for (const ch of t) {
      span.textContent += ch;
      await sleep(isCmd ? 32 : 5);
    }
    if (isCmd) await sleep(110);
  }
  cursor.classList.add('blink');
}
if (code) {
  reduce ? renderInstant() : typeTerminal();
}

// ---------- scroll progress bar ----------
// Fills a `.scroll-progress` bar across the viewport top.
(function () {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop   = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;
      bar.style.width = pct + '%';
      ticking = false;
    });
  });
})();

// ---------- staggered hero load animation ----------
// After a short delay, add `loaded` to `.hero` so CSS stagger kicks in.
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  setTimeout(() => hero.classList.add('loaded'), 200);
})();

// ---------- nav hide / show on scroll ----------
// Hides the header on scroll-down, reveals on scroll-up.
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  nav.style.transition = 'transform 0.3s ease';

  let lastY = window.scrollY;
  let ticking = false;
  const THRESHOLD = 5;       // px — ignore tiny deltas to prevent jitter

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const currY = window.scrollY;
      const delta = currY - lastY;

      if (currY < 100) {
        // Always show nav near the top of the page
        nav.classList.remove('nav-hidden');
      } else if (delta > THRESHOLD && !window.isAutoScrolling) {
        // Scrolling DOWN — hide nav
        nav.classList.add('nav-hidden');
      } else if (delta < -THRESHOLD) {
        // Scrolling UP — show nav
        nav.classList.remove('nav-hidden');
      }

      lastY = currY;
      ticking = false;
    });
  });
})();

// ---------- smooth section parallax ----------
// Subtle translateY on each `.section-head h2` while it's in view.
(function () {
  if (reduce) return;

  const headings = document.querySelectorAll('.section-head h2');
  if (!headings.length) return;

  const MAX_SHIFT = 15;  // px — keep the effect subtle
  const visibleSet = new Set();

  // Only animate headings that are currently visible
  const parallaxIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSet.add(entry.target);
      else visibleSet.delete(entry.target);
    });
  }, { rootMargin: '50px 0px', threshold: 0 });

  headings.forEach((h) => parallaxIO.observe(h));

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || !visibleSet.size) return;
    ticking = true;
    requestAnimationFrame(() => {
      visibleSet.forEach((h) => {
        const rect   = h.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const viewH  = window.innerHeight;
        // Normalised position: 0 at viewport centre, ±1 at edges
        const ratio  = (centre - viewH / 2) / (viewH / 2);
        const shift  = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, ratio * MAX_SHIFT));
        h.style.transform = `translateY(${shift}px)`;
      });
      ticking = false;
    });
  });
})();

// ---------- cursor-following project preview ----------
// A fixed 320×200 image card trails the pointer over `.proj-row` (desktop only).
(function () {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  const prev = document.querySelector('.proj-preview');
  const img = prev?.querySelector('img');
  if (!prev || !img) return;

  const ease = reduce ? 1 : 0.16;         // reduced motion → snap, no trailing
  let tx = 0, ty = 0, x = 0, y = 0, raf = null, hovering = false;

  const place = () => { prev.style.transform = `translate(${x + 22}px, ${y - 100}px)`; };
  const loop = () => {
    x += (tx - x) * ease; y += (ty - y) * ease;
    place();
    if (hovering || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(loop);
    else raf = null;
  };

  document.querySelectorAll('.proj-row').forEach((row) => {
    row.addEventListener('mouseenter', (e) => {
      const src = row.dataset.preview;
      if (!src) return;
      img.src = src;
      hovering = true;
      tx = x = e.clientX; ty = y = e.clientY;
      place();
      prev.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener('mouseleave', () => {
      hovering = false;
      prev.classList.remove('on');
    });
  });
})();

// ---------- magnetic buttons ----------
// `.btn-lg` and `.proj-link` arrows lean toward the cursor, spring back on leave.
(function () {
  if (reduce || !window.matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.btn-lg, .proj-link').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .1s ease-out';
      el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
    });
  });
})();

// ---------- video modal ----------
function openModal(videoSrc) {
  const modal = document.getElementById('vidModal');
  const video = document.getElementById('modalVideo');
  video.src = videoSrc;
  modal.classList.add('active');
  video.play();
}

function closeModal() {
  const modal = document.getElementById('vidModal');
  const video = document.getElementById('modalVideo');
  modal.classList.remove('active');
  video.pause();
  video.src = '';
}

// Close on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ---------- load more projects ----------
(() => {
  const btn = document.getElementById('projMore');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.proj-row-more[hidden]').forEach((row, i) => {
      row.hidden = false;
      if (!reduce) {
        row.classList.add('proj-row-in');
        row.style.animationDelay = `${i * 90}ms`;
      }
    });
    btn.remove();
  });
})();
