// NAV scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));

// Scroll reveal
const revealEls = document.querySelectorAll('.service-card, .tl-item, .sobre-text, .sobre-card, .contato-card, .cert-chip, .traj-story');
revealEls.forEach(el => el.classList.add('reveal'));
document.querySelectorAll('.service-card').forEach((el, i) => el.style.transitionDelay = (i * 70) + 'ms');
document.querySelectorAll('.contato-card').forEach((el, i) => el.style.transitionDelay = (i * 80) + 'ms');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
