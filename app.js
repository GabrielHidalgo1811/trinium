/* ========================================
   TRINIUM — app.js
   ======================================== */

'use strict';

// ─── Reduced motion check ─────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Pill Nav: sliding orange bubble ─────────────────
const track    = document.getElementById('pillTrack');
const bubble   = document.getElementById('pillBubble');
const navLinks = document.querySelectorAll('.pill-nav__link');
const pillNav  = document.getElementById('pillNav');

let activeLink = document.getElementById('pn-inicio');
let isHovering = false;

function moveBubbleTo(el) {
  if (!el || !track) return;
  const trackRect = track.getBoundingClientRect();
  const elRect    = el.getBoundingClientRect();
  bubble.style.left  = (elRect.left - trackRect.left) + 'px';
  bubble.style.width = elRect.width + 'px';
  bubble.classList.add('visible');
}

function setActiveLink(el) {
  navLinks.forEach(l => l.classList.remove('is-active'));
  if (el) {
    el.classList.add('is-active');
    activeLink = el;
  }
  if (!isHovering) moveBubbleTo(activeLink);
}

window.addEventListener('load', () => {
  setActiveLink(activeLink);
  moveBubbleTo(activeLink);
});

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    isHovering = true;
    moveBubbleTo(link);
    navLinks.forEach(l => l.classList.toggle('is-active', l === link));
  });
});

track.addEventListener('mouseleave', () => {
  isHovering = false;
  navLinks.forEach(l => l.classList.remove('is-active'));
  activeLink.classList.add('is-active');
  moveBubbleTo(activeLink);
});

window.addEventListener('resize', () => {
  if (!isHovering) moveBubbleTo(activeLink);
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
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const linkId = sectionMap[entry.target.id];
        if (linkId) setActiveLink(document.getElementById(linkId));
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

// ─── Hero: word-by-word reveal ─────────────
function heroWordReveal() {
  if (prefersReducedMotion) return;
  const h1 = document.querySelector('.hero__title');
  if (!h1) return;

  // Walk text nodes and wrap individual words
  function wrapWords(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return;
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w.length > 0) {
          const span = document.createElement('span');
          span.className = 'hero__word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.nodeName !== 'SPAN'
    ) {
      Array.from(node.childNodes).forEach(wrapWords);
    }
  }

  // Wrap all text inside h1 but not inside .hero__title-accent (keep it intact)
  const accent = h1.querySelector('.hero__title-accent');
  Array.from(h1.childNodes).forEach(child => {
    if (child !== accent) wrapWords(child);
  });

  // Also wrap words inside the accent span
  if (accent) {
    const accentText = accent.textContent;
    const words = accentText.split(/(\s+)/);
    accent.textContent = '';
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        accent.appendChild(document.createTextNode(w));
      } else if (w.length > 0) {
        const span = document.createElement('span');
        span.className = 'hero__word';
        span.style.cssText = 'background:inherit;-webkit-background-clip:inherit;-webkit-text-fill-color:inherit;background-clip:inherit;';
        span.textContent = w;
        accent.appendChild(span);
      }
    });
  }

  // Stagger reveal
  const wordSpans = h1.querySelectorAll('.hero__word');
  wordSpans.forEach((span, i) => {
    setTimeout(() => span.classList.add('revealed'), 300 + i * 80);
  });
}

heroWordReveal();

// ─── Animated counters (stats) ────────────
function animateCounter(el, target, suffix, duration) {
  if (prefersReducedMotion) return;
  if (target === 0) return; // 0 stays as is
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const statsSection = document.querySelector('.hero__stats');
if (statsSection) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.hero__stat-num[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          if (target > 0) animateCounter(el, target, suffix, 1200);
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });
  counterObserver.observe(statsSection);
}

// ─── Scroll reveal: general ────────────────
const scrollRevealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// Método steps: slide in from left with stagger
document.querySelectorAll('.metodo__step').forEach((step, i) => {
  step.classList.add('js-reveal-x');
  step.style.transitionDelay = `${i * 120}ms`;
  scrollRevealObserver.observe(step);
});

// Team cards: scale in with stagger
document.querySelectorAll('.team-card').forEach((card, i) => {
  card.classList.add('js-scale');
  card.style.transitionDelay = `${i * 100}ms`;
  scrollRevealObserver.observe(card);
});

// Section headers: fade up
document.querySelectorAll(
  '.equipo__header, .metodo__left, .contacto__left, .trusted__label'
).forEach(el => {
  el.classList.add('js-reveal');
  scrollRevealObserver.observe(el);
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

contactForm.addEventListener('submit', e => {
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
