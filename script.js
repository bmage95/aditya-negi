// ============================================================
//  Aditya Negi — portfolio interactions
// ============================================================
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- mobile nav ----------
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle?.addEventListener('click', () => {
  links.classList.toggle('open');
  toggle.classList.toggle('active');   // animate hamburger bars via CSS
});
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

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

// ---------- cursor glow effect ----------
// A 400 × 400 `.cursor-glow` div follows the pointer (desktop only).
if (!reduce && window.matchMedia('(pointer:fine)').matches) {
  const glow = document.querySelector('.cursor-glow');
  if (glow) {
    document.addEventListener('mousemove', (e) => {
      // Offset by half the element size (400/2 = 200) to centre on the cursor
      glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    });
  }
}

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
      } else if (delta > THRESHOLD) {
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
