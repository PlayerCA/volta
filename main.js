// main.js — Volta
// Responsibilities: mobile nav toggle, smooth scroll offset for sticky header

// --------------------------------------------------------------------------
// 1. Mobile Navigation Toggle
// --------------------------------------------------------------------------
const burger = document.getElementById('burger');
const nav    = document.getElementById('nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Close nav when a link is clicked (single-page behaviour)
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', false);
    });
  });
}

// --------------------------------------------------------------------------
// 2. Offset anchor scroll to account for sticky header height
// --------------------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    const headerHeight = document.querySelector('.header')?.offsetHeight ?? 0;
    const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});
