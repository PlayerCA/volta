/* ==========================================================================
   VOLTA — main.js  v2.0
   Responsibilities:
   1. Header — transparent → frosted glass on scroll
   2. Mobile nav toggle
   3. Scroll reveal — IntersectionObserver on .reveal elements
   4. Parallax — hero bg + why-us bg shift on scroll
   5. Animated counters — count up when stats enter viewport
   6. Smooth scroll — offset for fixed header height
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Utility: run after DOM is ready
  // --------------------------------------------------------------------------
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {

    // ------------------------------------------------------------------------
    // 1. HEADER — add .is-scrolled after 60px
    // ------------------------------------------------------------------------
    const header = document.getElementById('header');

    function updateHeader() {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // run once on load


    // ------------------------------------------------------------------------
    // 2. MOBILE NAV TOGGLE
    // ------------------------------------------------------------------------
    const burger = document.getElementById('burger');
    const nav    = document.getElementById('nav');

    if (burger && nav) {
      burger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('is-open');
        burger.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close nav when a link is tapped
      nav.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }


    // ------------------------------------------------------------------------
    // 3. SCROLL REVEAL — IntersectionObserver
    // ------------------------------------------------------------------------
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // animate once only
          }
        });
      }, {
        threshold: 0.12,      // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px' // slight bottom offset for feel
      });

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      // Fallback: show everything immediately (older browsers)
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }


    // ------------------------------------------------------------------------
    // 4. PARALLAX — shift background layers on scroll
    //    Each bg element shifts at a fraction of scroll speed (parallax ratio)
    //    Uses requestAnimationFrame for smooth, non-jank rendering
    // ------------------------------------------------------------------------
    const parallaxTargets = [
      { bg: document.getElementById('heroBg'),    ratio: 0.35 },
      { bg: document.getElementById('whyUsBg'),   ratio: 0.25 }
    ];

    // Only run parallax on non-touch devices (no benefit on mobile, hurts perf)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    if (!prefersReducedMotion && !isTouchDevice) {
      let ticking = false;

      function applyParallax() {
        const scrollY = window.scrollY;

        parallaxTargets.forEach(function (target) {
          if (!target.bg) return;

          const section   = target.bg.closest('section') || target.bg.parentElement;
          const rect      = section.getBoundingClientRect();
          const vh        = window.innerHeight;

          // Only compute when section is near viewport
          if (rect.bottom < -vh || rect.top > 2 * vh) return;

          const offset = scrollY * target.ratio;
          target.bg.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
        });

        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(applyParallax);
          ticking = true;
        }
      }, { passive: true });

      applyParallax(); // run once on load
    }


    // ------------------------------------------------------------------------
    // 5. ANIMATED COUNTERS
    //    Elements with data-count="500" count up from 0 when they enter view
    //    Optional data-divide="10" → divides final value (e.g. 49 → 4.9)
    // ------------------------------------------------------------------------
    const counterEls = document.querySelectorAll('.stat__number[data-count]');

    function animateCounter(el) {
      const target   = parseInt(el.getAttribute('data-count'), 10);
      const divide   = parseFloat(el.getAttribute('data-divide') || '1');
      const duration = 1800; // ms
      const start    = performance.now();

      function easeOut(t) {
        return 1 - Math.pow(1 - t, 3); // cubic ease-out
      }

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value    = Math.round(easeOut(progress) * target);
        const display  = divide !== 1 ? (value / divide).toFixed(1) : value;

        el.textContent = display;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Ensure exact final value
          el.textContent = divide !== 1 ? (target / divide).toFixed(1) : target;
        }
      }

      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window && counterEls.length) {
      const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counterEls.forEach(function (el) {
        counterObserver.observe(el);
      });
    }


    // ------------------------------------------------------------------------
    // 6. SMOOTH SCROLL — offset anchor links for fixed header height
    // ------------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const id     = this.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });

  }); // end ready()

})(); // end IIFE
