/* Apexium • CTA Handling & Sticky Button (cta.js)
   ------------------------------------------------
   Unified, optimized, semantically precise, and robust implementation.
   Incorporates explicit event binding, detailed logging, busy-state management,
   reduced-motion respect, and IntersectionObserver for sticky CTA visibility.
   Convergent synthesis by Greene, Rauch, Schoger, Wathan, Dean. */
(() => {
  'use strict';

  /* ── UTILITIES ─────────────────────────────────────────────── */
  const log = {
    info:  (msg, data) => console.info('[AX-CTA]', msg, data || ''),
    warn:  (msg, data) => console.warn('[AX-CTA]', msg, data || ''),
    error: (msg, data) => console.error('[AX-CTA]', msg, data || '')
  };
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ── DISABLE BUTTON & REDIRECT ─────────────────────────────── */
function handleClick(btn) {
  if (!btn || btn.dataset.busy === '1') return;          // Already processing

  const href = btn.dataset.href;                         // ← no placeholder check
  if (!href) {
    log.warn('CTA missing data-href:', btn);
    return;
  }

  btn.dataset.busy = '1';
  btn.setAttribute('aria-disabled', 'true');
  btn.classList.add('opacity-60', 'cursor-not-allowed');
  btn.textContent = 'Redirecting…';

  setTimeout(() => { window.location.href = href; }, 500);
}

/* ── INITIALIZE ALL CTA BUTTONS ───────────────────────────── */
function initCTAs() {
  const buttons = $$('[data-ax-cta]');                   // tighten selector
  if (!buttons.length) {
    log.warn('No CTA buttons found');
    return;
  }

  buttons.forEach(btn => {
    if (!btn.dataset.href) btn.dataset.href = '/form.html';  // default to form
    btn.addEventListener('click', () => handleClick(btn), { once: true });
  });

  log.info('CTA buttons bound:', { count: buttons.length });
}

  /* ── STICKY CTA SHOW / HIDE ────────────────────────────────── */
  function initStickyCTA() {
    const sticky = $('#stickyCTA');
    if (!sticky) {
      log.warn('No sticky CTA container (#stickyCTA) found');
      return;
    }

    // Insert an invisible “sentinel” 400px from top to trigger IntersectionObserver
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:400px;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting;
        sticky.classList.toggle('hidden', !show);
        requestAnimationFrame(() => {
          sticky.classList.toggle('opacity-0', !show);
        });
        log.info('Sticky CTA visibility toggled:', { visible: show });
      },
      { threshold: 0 }
    );
    io.observe(sentinel);

    // Bind click on the sticky CTA button inside the container
    const btn = sticky.querySelector('button[data-ax-cta]');
    if (btn) {
      btn.addEventListener('click', () => handleClick(btn));
      log.info('Sticky CTA button bound.');
    } else {
      log.warn('No [data-ax-cta] button inside #stickyCTA.');
    }
  }

  /* ── REDUCED MOTION SUPPORT ───────────────────────────────── */
  function initReducedMotion() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('prefers-reduced-motion');
      log.info('Prefers-reduced-motion detected; animations suppressed.');
    }
  }

  /* ── BOOTSTRAP ON DOMCONTENTLOADED ────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initReducedMotion();
    } catch (e) {
      log.error('initReducedMotion failed:', e);
    }

    try {
      initCTAs();
    } catch (e) {
      log.error('initCTAs failed:', e);
    }

    try {
      initStickyCTA();
    } catch (e) {
      log.error('initStickyCTA failed:', e);
    }
  });

})();
