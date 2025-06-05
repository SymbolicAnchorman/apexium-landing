/*==========================================================
HEADER • NAV TOGGLE  •  v2.1
==========================================================*/
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.getElementById('primary-nav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('open');
    primaryNav.classList.toggle('mobile-hidden', !isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}
