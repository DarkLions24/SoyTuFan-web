const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const progress = document.getElementById('progress');
const menu = document.getElementById('menu');
const menuLinks = [...document.querySelectorAll('.menu [data-go]')];
let cur = 0, lock = false;
const tilt = document.getElementById('micTilt');
const poses = [...document.querySelectorAll('.pose')];
// Qué pose se ve en cada pantalla (0 = frente, 1 = perfil, 2 = primer plano)
const poseFor = [0, 1, 2, 3, 4, 5];

stage.addEventListener('pointermove', e => {
  tilt.style.setProperty('--ry', (e.clientX / window.innerWidth - 0.5) * 40 + 'deg');
  tilt.style.setProperty('--rx', -(e.clientY / window.innerHeight - 0.5) * 20 + 'deg');
});
stage.addEventListener('pointerleave', () => {
  tilt.style.setProperty('--ry', '0deg');
  tilt.style.setProperty('--rx', '0deg');
});

// Indicador lateral + retraso escalonado de los textos
slides.forEach((s, i) => {
  s.querySelectorAll('.rv').forEach((el, k) => el.style.setProperty('--d', k));
  const b = document.createElement('button');
  b.setAttribute('aria-label', 'Ir a la sección ' + (i + 1));
  b.addEventListener('click', () => go(i));
  progress.appendChild(b);
});

function go(n) {
  if (n < 0 || n >= slides.length) return;
  cur = n;
  slides.forEach((s, i) => s.classList.toggle('active', i === n));
  stage.dataset.slide = n;
  poses.forEach((p, i) => p.classList.toggle('on', i === poseFor[n]));
  tilt.classList.remove('swing'); void tilt.offsetWidth; tilt.classList.add('swing');
  [...progress.children].forEach((b, i) => b.classList.toggle('on', i === n));
  menuLinks.forEach(a => a.classList.toggle('active', +a.dataset.go === n));
  menu.classList.remove('open');
  lock = true;
  setTimeout(() => (lock = false), 1100);
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
}
const goFaq = () => document.getElementById('faq').scrollIntoView({ behavior: 'smooth' });

document.querySelectorAll('[data-go]').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); go(+a.dataset.go); })
);

// Rueda del mouse: cambia de slide; en el último deja bajar a las preguntas
window.addEventListener('wheel', e => {
  if (document.body.classList.contains('modal-open')) return;
  if (window.scrollY > 5) return;
  if (e.deltaY > 0 && cur === slides.length - 1) return;
  e.preventDefault();
  if (lock || Math.abs(e.deltaY) < 20) return;
  go(cur + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

// Teclado
window.addEventListener('keydown', e => {
  if (document.body.classList.contains('modal-open')) return;
  if (window.scrollY > 5) return;
  const down = ['ArrowDown', 'PageDown'].includes(e.key);
  const up = ['ArrowUp', 'PageUp'].includes(e.key);
  if (!down && !up) return;
  e.preventDefault();          // evita el scroll nativo
  if (lock) return;
  if (down) cur === slides.length - 1 ? goFaq() : go(cur + 1);
  else go(cur - 1);
});

// Táctil
let ty = 0;
window.addEventListener('touchstart', e => (ty = e.touches[0].clientY), { passive: true });
window.addEventListener('touchend', e => {
  if (document.body.classList.contains('modal-open')) return;
  if (window.scrollY > 5 || lock) return;
  const d = ty - e.changedTouches[0].clientY;
  if (Math.abs(d) < 50) return;
  if (d > 0) cur === slides.length - 1 ? goFaq() : go(cur + 1);
  else go(cur - 1);
});

// Navbar con fondo al bajar, menú móvil, FAQ y año
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('solid', window.scrollY > 20));
document.getElementById('menuBtn').addEventListener('click', () => menu.classList.toggle('open'));
const faqs = document.querySelectorAll('details');
faqs.forEach(d => d.addEventListener('toggle', () => {
  if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
}));
document.getElementById('year').textContent = new Date().getFullYear();

go(0);

// Cuadro de WhatsApp
const waModal = document.getElementById('waModal');
const waOpen = document.getElementById('waOpen');
function waToggle(open) {
  waModal.classList.toggle('open', open);
  document.body.classList.toggle('modal-open', open);
  (open ? document.getElementById('waClose') : waOpen).focus();
}
waOpen.addEventListener('click', () => waToggle(true));
document.getElementById('waClose').addEventListener('click', () => waToggle(false));
waModal.addEventListener('click', e => { if (e.target === waModal) waToggle(false); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') waToggle(false); });