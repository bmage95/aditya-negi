// ============================================================
//  Aditya Negi — portfolio interactions
// ============================================================
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- mobile nav ----------
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle?.addEventListener('click', () => links.classList.toggle('open'));
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
  ['c-txt', 'Full-stack dev · AI & RAG · Finance-tech\n'],
  ['c-mute', '$ '], ['', 'ls ./skills\n'],
  ['c-txt', 'react  next  typescript  python\nnode   postgres  llm-apps  supabase\n'],
  ['c-mute', '$ '], ['', 'status --now\n'],
  ['c-ok', '● available for work\n'],
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
