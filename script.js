/**
 * JUAN CAMARGO · PORTFOLIO — script.js
 * Pure vanilla JS — no framework required
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. HEADER — scroll background + active nav link
   ══════════════════════════════════════════════════════════ */
(function initHeader() {
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  // Scrolled class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  };

  // Active nav link based on scroll position
  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ══════════════════════════════════════════════════════════
   2. HAMBURGER MENU
   ══════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!btn || !navLinks) return;

  btn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ══════════════════════════════════════════════════════════
   3. SMOOTH SCROLL (fallback for older browsers)
   ══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   4. SCROLL REVEAL (IntersectionObserver)
   ══════════════════════════════════════════════════════════ */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings within same parent
          const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
          siblings.forEach((el, idx) => {
            setTimeout(() => el.classList.add('visible'), idx * 80);
          });
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   5. CV DOWNLOAD
   ══════════════════════════════════════════════════════════ */
(function initCVDownload() {
  const btn = document.getElementById('cv-download-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    /**
     * INSTRUCCIONES:
     * Reemplaza la URL de abajo con la URL real de tu CV en Google Drive.
     * En Google Drive: "Compartir" → "Cualquier persona con el enlace"
     * → copiar enlace, cambiar "/view" por "/export?format=pdf"
     *
     * Ejemplo:
     * https://drive.google.com/uc?export=download&id=TU_FILE_ID
     */
    const CV_URL = 'https://drive.google.com/uc?export=download&id=1q0yR1SpG-2vyISPTni9kDOANJJLloOgE';

    // Intenta descargar; si no hay archivo configurado, muestra un toast
    if (CV_URL.includes('https://drive.google.com/file/d/1q0yR1SpG-2vyISPTni9kDOANJJLloOgE/export?format=pdf?usp=sharing')) {
      showToast('CV próximamente disponible. Contáctame directamente.', 'info');
      return;
    }

    const a = document.createElement('a');
    a.href = CV_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  });
})();


/* ══════════════════════════════════════════════════════════
   6. CONTACT FORM — Formspree integration
   ══════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submit = document.getElementById('submit-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      setStatus('Por favor completa todos los campos.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Ingresa un correo electrónico válido.', 'error');
      return;
    }

    // Check if Formspree ID is configured
    const action = form.getAttribute('action');
    if (action.includes('YOUR_FORM_ID') || !action.includes('formspree.io')) {
      // Dev fallback: simulate success
      setStatus('', '');
      submit.disabled = true;
      submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      await delay(1200);
      setStatus('¡Mensaje enviado! Te contactaré pronto.', 'success');
      form.reset();
      submit.disabled = false;
      submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Propuesta';
      return;
    }

    // Real Formspree submission
    submit.disabled = true;
    submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    setStatus('', '');

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        setStatus('¡Mensaje enviado! Te contactaré pronto.', 'success');
        form.reset();
      } else {
        const data = await res.json();
        const msg = data.errors
          ? data.errors.map(e => e.message).join(', ')
          : 'Hubo un error. Intenta de nuevo.';
        setStatus(msg, 'error');
      }
    } catch (_) {
      setStatus('Error de red. Verifica tu conexión.', 'error');
    } finally {
      submit.disabled = false;
      submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Propuesta';
    }
  });

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form-status ' + type;
  }
})();


/* ══════════════════════════════════════════════════════════
   7. TOAST NOTIFICATION (helper)
   ══════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.portfolio-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'portfolio-toast';
  toast.textContent = message;

  const colors = {
    info: { bg: '#5c5b64', text: '#fff' },
    success: { bg: '#166534', text: '#fff' },
    error: { bg: '#ba1a1a', text: '#fff' },
  };
  const { bg, text } = colors[type] || colors.info;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: bg,
    color: text,
    padding: '0.875rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: '9999',
    opacity: '0',
    transform: 'translateY(12px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    maxWidth: '320px',
    lineHeight: '1.45',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}


/* ══════════════════════════════════════════════════════════
   8. UTILITY
   ══════════════════════════════════════════════════════════ */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
