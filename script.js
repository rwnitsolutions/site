document.addEventListener('DOMContentLoaded', function () {

  // ── NAV SCROLL ──────────────────────────────────────
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });

  // ── HAMBURGER ───────────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      mobileMenu.classList.toggle('open');
    });

    // Close when a link is clicked
    var mmLinks = mobileMenu.querySelectorAll('.mm-link');
    mmLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
      });
    });

    // Close when clicking outside the nav
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }

  // ── SCROLL REVEAL ───────────────────────────────────
  var revealEls = document.querySelectorAll(
    '.service-card, .sobre-text, .sobre-card, .contato-card, .cert-chip, .traj-story'
  );

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
  });

  document.querySelectorAll('.service-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 70) + 'ms';
  });

  document.querySelectorAll('.contato-card').forEach(function (el, i) {
    el.style.transitionDelay = (i * 80) + 'ms';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  // ── SMOOTH SCROLL ───────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

});
