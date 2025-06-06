/*==========================================================
HEADER NAV TOGGLE — Optimized and Integrated
==========================================================*/
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('primaryNav');

  if (!toggle || !menu) return;

  const handleToggle = () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  toggle.addEventListener('click', handleToggle);
});
