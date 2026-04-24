/* =============================================
   MAGNATINE LLC — Website JavaScript
   Handles: Navigation, Page Routing, Animations,
            Scroll Effects, Expertise Bars, Form
   ============================================= */

'use strict';

// ─── DOM REFS ─────────────────────────────────
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');
const pages       = document.querySelectorAll('.page');

// ─── NAVBAR: SCROLL EFFECT ────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveNavOnScroll();
});

// ─── NAVBAR: MOBILE TOGGLE ────────────────────
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  // Animate hamburger to X
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// ─── PAGE ROUTING ─────────────────────────────
function showPage(pageId) {
  // Hide all pages
  pages.forEach(p => p.classList.remove('active'));

  // Show target
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-run reveal for new page
    setTimeout(() => {
      initReveal();
      if (pageId === 'about') initExpertiseBars();
    }, 50);
  }

  // Update active nav
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === pageId);
  });

  // Close mobile nav
  navLinks.classList.remove('open');
  navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });

  // Update URL hash (no reload)
  history.pushState(null, '', '#' + pageId);
}

// Intercept all anchor clicks that reference page IDs
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href]');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href || !href.startsWith('#')) return;

  const pageId = href.slice(1);
  const pageEl = document.getElementById(pageId);
  if (!pageEl || !pageEl.classList.contains('page')) return;

  e.preventDefault();
  showPage(pageId);
});

// Handle back/forward navigation
window.addEventListener('popstate', () => {
  const hash = window.location.hash.slice(1) || 'home';
  const pageEl = document.getElementById(hash);
  if (pageEl && pageEl.classList.contains('page')) {
    pages.forEach(p => p.classList.remove('active'));
    pageEl.classList.add('active');
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === hash);
    });
    setTimeout(() => initReveal(), 50);
  }
});

// Initial page load from hash
function loadInitialPage() {
  const hash = window.location.hash.slice(1);
  const validPage = hash && document.getElementById(hash)?.classList.contains('page');
  showPage(validPage ? hash : 'home');
}

// ─── REVEAL ANIMATION (Intersection Observer) ─
let revealObserver;

function initReveal() {
  if (revealObserver) revealObserver.disconnect();

  const reveals = document.querySelectorAll('.page.active .reveal:not(.visible)');

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));
}

// ─── EXPERTISE BARS ───────────────────────────
function initExpertiseBars() {
  const bars = document.querySelectorAll('.page.active .exp-bar-fill');
  if (!bars.length) return;

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetWidth = entry.target.getAttribute('data-width') + '%';
        entry.target.style.width = targetWidth;
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    bar.style.width = '0%';
    barObserver.observe(bar);
  });
}

// ─── ACTIVE NAV ON SCROLL (home page sections) ─
function updateActiveNavOnScroll() {
  // Only relevant for home page scroll
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
}

// ─── SMOOTH COUNTER ANIMATION ─────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.page.active .stat-num');
  counters.forEach(counter => {
    const text = counter.textContent;
    const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return;

    const duration = 1800;
    const startTime = performance.now();
    const suffix = text.replace(/[0-9.]/g, '');

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * num * 10) / 10;

      counter.textContent = (Number.isInteger(num) ? Math.floor(current) : current) + suffix;

      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ─── CONTACT FORM ─────────────────────────────
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn');
    const btnText = btn.querySelector('.btn-text');

    // Simple validation
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        valid = false;
      }
    });
    if (!valid) return;

    // Email validation
    const emailField = document.getElementById('email');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && !emailRe.test(emailField.value)) {
      emailField.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      return;
    }

    // Loading state
    btnText.textContent = 'Sending…';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    // Simulate submission
    setTimeout(() => {
      contactForm.reset();
      btnText.textContent = 'Send Message';
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    }, 1400);
  });

  // Clear error highlight on input
  contactForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
}

// ─── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadInitialPage();

  // Small delay to ensure page is shown, then trigger counter on hero
  setTimeout(() => {
    animateCounters();
    initReveal();
  }, 200);
});
