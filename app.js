/* ========================================
   TRINIUM — app.js
   ======================================== */

'use strict';

// ─── Pill Nav: sliding orange bubble ─────────────────
const track     = document.getElementById('pillTrack');
const bubble    = document.getElementById('pillBubble');
const navLinks  = document.querySelectorAll('.pill-nav__link');

let activeLink  = document.getElementById('pn-inicio');   // default active
let isHovering  = false;

/** Move the bubble to cover a given element */
function moveBubbleTo(el) {
  if (!el || !track) return;
  const trackRect = track.getBoundingClientRect();
  const elRect    = el.getBoundingClientRect();
  bubble.style.left  = (elRect.left - trackRect.left) + 'px';
  bubble.style.width = elRect.width + 'px';
  bubble.classList.add('visible');
}

/** Set which link is the scroll-active one */
function setActiveLink(el) {
  navLinks.forEach(l => l.classList.remove('is-active'));
  if (el) {
    el.classList.add('is-active');
    activeLink = el;
  }
  if (!isHovering) moveBubbleTo(activeLink);
}

// Initial position (defer until layout renders)
window.addEventListener('load', () => {
  setActiveLink(activeLink);
  moveBubbleTo(activeLink);
});

// Hover: bubble follows mouse
navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    isHovering = true;
    moveBubbleTo(link);
    // While hovering, active link turns white; hovered turns black
    navLinks.forEach(l => {
      if (l === link) {
        l.classList.add('is-active');
      } else {
        l.classList.remove('is-active');
      }
    });
  });
});

track.addEventListener('mouseleave', () => {
  isHovering = false;
  // Restore bubble to scroll-active link
  navLinks.forEach(l => l.classList.remove('is-active'));
  activeLink.classList.add('is-active');
  moveBubbleTo(activeLink);
});

// ─── Scroll: bubble follows active section ─────────────
const sectionMap = {
  'hero':     'pn-inicio',
  'clientes': 'pn-inicio',
  'metodo':   'pn-metodo',
  'equipo':   'pn-equipo',
  'contacto': 'pn-contacto',
};

const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const linkId = sectionMap[entry.target.id];
        if (linkId) {
          const el = document.getElementById(linkId);
          setActiveLink(el);
        }
      }
    });
  },
  { threshold: 0.35, rootMargin: '-60px 0px -40% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));

// ─── Mobile hamburger ─────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── Recalculate bubble on resize ─────────
window.addEventListener('resize', () => {
  if (!isHovering) moveBubbleTo(activeLink);
});

// ─── Intersection Observer: fade-in on scroll ──────────
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

document.querySelectorAll('.metodo__step').forEach((step, i) => {
  step.style.opacity    = '0';
  step.style.transform  = 'translateY(24px)';
  step.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  observer.observe(step);
});

document.querySelectorAll('.team-card').forEach((card, i) => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(32px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s, border-color 0.3s ease, box-shadow 0.3s ease`;
  observer.observe(card);
});

document.querySelectorAll('.hero__title, .hero__sub, .hero__cta-row, .hero__stats').forEach((el, i) => {
  el.classList.add('fade-in', `fade-in-${i + 1}`);
});

// ─── Form submit ──────────────────────────
const contactForm = document.getElementById('contactForm');
const toast       = document.getElementById('toast');

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

function validateField(f) {
  const ok = !!f.value.trim();
  f.classList.toggle('error', !ok);
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

document.querySelectorAll('.form__input, .form__textarea').forEach(f => {
  f.addEventListener('input', () => f.classList.remove('error'));
});

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

// ─── Team card 3D tilt ─────────────────────
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    card.style.transform   = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.perspective = '800px';
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
