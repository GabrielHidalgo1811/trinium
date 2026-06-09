/* ========================================
   TRINIUM — app.js
   ======================================== */

'use strict';

// ─── Header scroll effect ─────────────────
const siteHeader = document.getElementById('siteHeader');
function handleNavScroll() {
  siteHeader.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ─── Mobile hamburger ─────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── Intersection Observer: fade-in on scroll ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// Animate método steps
document.querySelectorAll('.metodo__step').forEach((step, i) => {
  step.style.opacity    = '0';
  step.style.transform  = 'translateY(24px)';
  step.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  observer.observe(step);
});

// Animate team cards
document.querySelectorAll('.team-card').forEach((card, i) => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(32px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s, border-color 0.3s ease, box-shadow 0.3s ease`;
  observer.observe(card);
});

// Animate hero elements
document.querySelectorAll('.hero__badge, .hero__title, .hero__sub, .hero__cta-row, .hero__stats').forEach((el, i) => {
  el.classList.add('fade-in', `fade-in-${i + 1}`);
});

// ─── Active nav link on scroll ───────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.hnav__link');

const sectionMap = {
  'hero':     'hl-inicio',
  'clientes': 'hl-inicio',
  'metodo':   'hl-metodo',
  'equipo':   'hl-equipo',
  'contacto': 'hl-contacto',
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetId = sectionMap[entry.target.id];
        navLinks.forEach(link => {
          link.classList.remove('hnav__link--active');
          if (targetId && link.id === targetId) {
            link.classList.add('hnav__link--active');
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach(s => sectionObserver.observe(s));

// ─── Form submit ──────────────────────────
const contactForm = document.getElementById('contactForm');
const toast       = document.getElementById('toast');

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

function validateField(field) {
  const ok = !!field.value.trim();
  field.classList.toggle('error', !ok);
  return ok;
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombreEmpresa');
  const correo = document.getElementById('correo');
  const cuello = document.getElementById('cuelloBottella');

  if (!validateField(nombre) | !validateField(correo) | !validateField(cuello)) return;

  const btn      = document.getElementById('submitBtn');
  const original = btn.innerHTML;
  btn.innerHTML  = '<span style="display:inline-block;animation:spin 0.7s linear infinite">⟳</span> Enviando...';
  btn.disabled   = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled  = false;
    contactForm.reset();
    showToast();
  }, 1600);
});

document.querySelectorAll('.form__input, .form__textarea').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});

// ─── Spin keyframe ────────────────────────
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

// ─── Parallax: hero glow follows mouse ───
const heroGlow = document.querySelector('.hero__glow');
document.addEventListener('mousemove', (e) => {
  if (!heroGlow) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 40;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  heroGlow.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
});

// ─── Team card 3D tilt ────────────────────
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    card.style.transform   = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.perspective = '800px';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
