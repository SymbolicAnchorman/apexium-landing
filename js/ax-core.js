/* apexium • core UI interactions (dark-mode, nav menu, reveal, parallax) */
(() => {
  'use strict';

  const CONFIG = {
    selectors: {
      darkToggle:      '#darkModeToggle',
      mobileMenuBtn:   '#mobileMenuBtn',
      mobileMenu:      '#mobileMenu',
      openIcon:        '#menuIcon',
      closeIcon:       '#closeIcon',
      revealItems:     '[data-reveal]',
      parallaxLayers:  '.parallax-layer',
      stickyCTA:       '#stickyCTA'
    },
    reveal: {
      rootMargin: '0px 0px -10% 0px',
      threshold:  0.15
    },
    parallax: {
      speeds:    [0.1, 0.2, 0.3],
      sentinelY: 400
    },
    storageKey: 'ax-ui-state'
  };

  const log = {
    info:  (msg, data) => console.info('[AX-CORE]', msg, data || ''),
    warn:  (msg, data) => console.warn('[AX-CORE]', msg, data || ''),
    error: (msg, data) => console.error('[AX-CORE]', msg, data || '')
  };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const throttleRAF = (fn) => {
    let scheduled = false;
    return (...args) => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn(...args);
      });
    };
  };

  function initDarkMode() {
    const btn = $(CONFIG.selectors.darkToggle);
    if (!btn) return;
    const root  = document.documentElement;
    const key   = CONFIG.storageKey;
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    const initial = stored.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const applyTheme = (theme) => {
      const isDark = (theme === 'dark');
      root.classList.toggle('dark', isDark);
      btn.setAttribute('aria-pressed', String(isDark));
      stored.theme = theme;
      try { localStorage.setItem(key, JSON.stringify(stored)); } catch {}
      log.info('Theme applied', { theme });
    };
    applyTheme(initial);
    btn.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  function initMobileMenu() {
    const toggle   = $(CONFIG.selectors.mobileMenuBtn);
    const menu     = $(CONFIG.selectors.mobileMenu);
    const openIcon = $(CONFIG.selectors.openIcon);
    const closeIcon= $(CONFIG.selectors.closeIcon);
    if (!toggle || !menu || !openIcon || !closeIcon) return;
    toggle.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      const next   = isOpen ? 'close' : 'open';
      menu.classList.toggle('hidden');
      menu.classList.toggle('opacity-0', next === 'open');
      menu.classList.toggle('scale-95', next === 'open');
      openIcon.classList.toggle('opacity-0', next === 'open');
      closeIcon.classList.toggle('opacity-0', next === 'close');
      toggle.setAttribute('aria-expanded', String(next === 'open'));
      log.info('Mobile menu toggled', { state: next });
    });
  }

  function initReveal() {
    const items = $$(CONFIG.selectors.revealItems);
    if (!items.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(el => el.classList.add('revealed'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
            log.info('Item revealed', entry.target);
          }
        });
      },
      { rootMargin: CONFIG.reveal.rootMargin, threshold: CONFIG.reveal.threshold }
    );
    items.forEach(el => observer.observe(el));
  }

  function initParallax() {
    const layers = $$(CONFIG.selectors.parallaxLayers);
    if (!layers.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const speeds = CONFIG.parallax.speeds;
    const onScroll = throttleRAF(() => {
      const y = window.scrollY;
      layers.forEach((layer, i) => {
        const speed = speeds[i] !== undefined ? speeds[i] : speeds[speeds.length - 1];
        layer.style.transform = `translateY(${y * speed}px)`;
      });
    });
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initStickyCTA() {
    const sticky = $(CONFIG.selectors.stickyCTA);
    if (!sticky) return;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = `position:absolute;top:${CONFIG.parallax.sentinelY}px;width:1px;height:1px;pointer-events:none;`;
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting;
        sticky.classList.toggle('hidden', !show);
        requestAnimationFrame(() => {
          sticky.classList.toggle('opacity-0', !show);
        });
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    const btn = sticky.querySelector('button[data-ax-cta]');
    if (btn) {
      btn.addEventListener('click', () => {
        const url = btn.dataset.href || '';
        if (!url || url === 'YOUR_STRIPE_CHECKOUT_URL') return;
        handleCTAClick(btn);
      });
    }
  }

  function handleCTAClick(btn) {
    if (!btn || btn.dataset.busy === '1') return;
    const href = btn.dataset.href || '';
    btn.dataset.busy = '1';
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.add('opacity-60', 'cursor-not-allowed');
    const orig = btn.textContent;
    btn.textContent = 'Requesting…';
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    try { initDarkMode(); } catch (e) { log.error('initDarkMode failed', e); }
    try { initMobileMenu(); } catch (e) { log.error('initMobileMenu failed', e); }
    const deferred = () => {
      try { initReveal(); } catch (e) { log.error('initReveal failed', e); }
      try { initParallax(); } catch (e) { log.error('initParallax failed', e); }
      try { initStickyCTA(); } catch (e) { log.error('initStickyCTA failed', e); }
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(deferred, { timeout: 200 });
    } else {
      setTimeout(deferred, 200);
    }
  });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('prefers-reduced-motion');
  }
})();
