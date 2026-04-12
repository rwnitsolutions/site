'use strict';

/* ================================================================
   RWN IT SOLUTIONS — main.js
   ================================================================ */

// ── 1 · PARTICLE CANVAS ──────────────────────────────────────────
function initParticleCanvas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const section = document.getElementById('hero');

  const isMobile = () => window.innerWidth <= 768;

  const CFG = {
    count:        () => isMobile() ? 60 : 110,
    connDist:     () => isMobile() ? 130 : 175,
    mouseRadius:  220,
    mouseRepel:   0.042,
    lineAlphaMax: 0.48,
    lineWidth:    1.1,
    nodeColor:    '0,200,255',
    velMax:       0.5,
    padding:      60,
  };

  let particles = [];
  let mouseX = -9999, mouseY = -9999;
  let rafId = null;
  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    particles = createParticles();
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CFG.velMax;
    return {
      x:           Math.random() * W,
      y:           Math.random() * H,
      vx:          Math.cos(angle) * speed,
      vy:          Math.sin(angle) * speed,
      r:           1.2 + Math.random() * 1.4,
      alpha:       0.25 + Math.random() * 0.55,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed:  0.0008 + Math.random() * 0.001,
    };
  }

  function createParticles() {
    return Array.from({ length: CFG.count() }, createParticle);
  }

  function updateParticle(p) {
    p.x += p.vx;
    p.y += p.vy;

    const pad = CFG.padding;
    if (p.x < -pad) p.x = W + pad;
    else if (p.x > W + pad) p.x = -pad;
    if (p.y < -pad) p.y = H + pad;
    else if (p.y > H + pad) p.y = -pad;

    // Mouse repulsion
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < CFG.mouseRadius && dist > 0) {
      const force = (CFG.mouseRadius - dist) / CFG.mouseRadius;
      p.vx += (dx / dist) * force * CFG.mouseRepel;
      p.vy += (dy / dist) * force * CFG.mouseRepel;
      // Dampen
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > CFG.velMax * 3) {
        p.vx = (p.vx / speed) * CFG.velMax * 3;
        p.vy = (p.vy / speed) * CFG.velMax * 3;
      }
    } else {
      // Gently drift back to base speed
      p.vx *= 0.995;
      p.vy *= 0.995;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        p.vx = Math.cos(angle) * CFG.velMax * 0.3;
        p.vy = Math.sin(angle) * CFG.velMax * 0.3;
      }
    }
  }

  function drawParticle(p) {
    const now = Date.now();
    const pulse = 1 + 0.35 * Math.sin(now * p.pulseSpeed + p.pulseOffset);
    const r = p.r * pulse;

    // Outer glow halo
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${CFG.nodeColor},${p.alpha * 0.08})`;
    ctx.fill();

    // Core node
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${CFG.nodeColor},0.9)`;
    ctx.fillStyle = `rgba(${CFG.nodeColor},${p.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawConnections() {
    const connDist = CFG.connDist();
    const n = particles.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connDist) {
          const t = 1 - dist / connDist;
          const alpha = t * CFG.lineAlphaMax;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CFG.nodeColor},${alpha})`;
          ctx.lineWidth = CFG.lineWidth * t + 0.3; // thicker at close range
          ctx.shadowBlur = t > 0.6 ? 4 : 0;
          ctx.shadowColor = `rgba(${CFG.nodeColor},0.5)`;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      updateParticle(p);
      drawParticle(p);
    });
    rafId = requestAnimationFrame(draw);
  }

  // Pause when hero is out of view
  const heroObserver = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (!rafId) rafId = requestAnimationFrame(draw);
    } else {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
  }, { threshold: 0 });
  heroObserver.observe(section);

  // Mouse tracking
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  // Touch support (move particles away from touch)
  canvas.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
  }, { passive: true });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
}

// ── 2 · NAVBAR ────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll effect
  function handleScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open.toString());
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));
}

// ── 3 · SMOOTH SCROLL ────────────────────────────────────────────
function initSmoothScroll() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── 4 · GSAP ANIMATIONS ──────────────────────────────────────────
function initGSAP() {
  if (typeof gsap === 'undefined') {
    initCSSFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ─── Hero load sequence ───
  const tl = gsap.timeline({ delay: 0.1 });

  // Nav
  tl.fromTo('#navbar',
    { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
  );

  // Eyebrow
  tl.fromTo('.hero-eyebrow',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );

  // Title word-split
  const titleEl = document.getElementById('heroTitle');
  if (titleEl) {
    splitAndAnimateTitle(titleEl, tl);
  }

  // Subtitle
  tl.fromTo('.hero-subtitle',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );

  // Stats
  tl.fromTo('.hero-stats',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );

  // Buttons
  tl.fromTo('.hero-actions',
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.3'
  );

  // Scroll hint
  tl.fromTo('.hero-scroll-hint',
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.2'
  );

  // ─── Scroll-triggered reveals ───
  initScrollAnimations();
}

function splitAndAnimateTitle(el, tl) {
  const lines = el.querySelectorAll('.title-line');
  lines.forEach(line => {
    const text = line.textContent;
    const isGradient = line.classList.contains('gradient-text');

    const words = text.trim().split(/\s+/);
    line.innerHTML = words.map(word =>
      `<span class="word" style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="word-inner" style="display:inline-block;">${word}</span></span>`
    ).join(' ');

    if (isGradient) {
      line.querySelectorAll('.word-inner').forEach(wi => {
        wi.style.background = 'linear-gradient(135deg, #00c8ff 0%, #0066ff 50%, #7b2fff 100%)';
        wi.style.webkitBackgroundClip = 'text';
        wi.style.webkitTextFillColor = 'transparent';
        wi.style.backgroundClip = 'text';
      });
    }
  });

  const wordInners = el.querySelectorAll('.word-inner');

  tl.fromTo(wordInners,
    { y: '110%' },
    {
      y: '0%',
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.045,
    },
    '-=0.4'
  );
}

function initScrollAnimations() {
  // Helper: create a ScrollTrigger reveal
  function revealFrom(targets, vars, triggerEl) {
    if (!document.querySelectorAll(targets).length) return;
    gsap.fromTo(targets,
      { opacity: 0, ...vars.from },
      {
        opacity: 1,
        ...vars.to,
        scrollTrigger: {
          trigger: triggerEl || targets,
          start: 'top 82%',
          once: true,
        },
        stagger: vars.stagger || 0,
        duration: vars.duration || 0.7,
        ease: vars.ease || 'power2.out',
      }
    );
  }

  // ── Sobre ──
  revealFrom('#sobre .section-label',  { from: { x: -20, y: 0 }, to: { x: 0 } }, '#sobre');
  revealFrom('#sobre .sobre-visual',   { from: { y: 40 }, to: { y: 0 } });
  revealFrom('#sobre .sobre-content',  { from: { y: 40 }, to: { y: 0 }, duration: 0.8 });

  gsap.fromTo('#sobre .cert-badge',
    { opacity: 0, x: -16 },
    { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: '#sobre .cert-badges', start: 'top 85%', once: true } }
  );

  gsap.fromTo('#sobre .formacao-item',
    { opacity: 0, x: -12 },
    { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: '#sobre .formacao-list', start: 'top 85%', once: true } }
  );

  // ── Serviços ──
  revealFrom('#servicos .section-label',   { from: { x: -20, y: 0 }, to: { x: 0 } }, '#servicos');
  revealFrom('#servicos .section-title',   { from: { y: 30 }, to: { y: 0 } });
  revealFrom('#servicos .section-subtitle',{ from: { y: 20 }, to: { y: 0 } });

  gsap.fromTo('.servico-card',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.servicos-grid', start: 'top 80%', once: true } }
  );

  revealFrom('.servicos-mais', { from: { y: 20 }, to: { y: 0 } });

  // ── Trajetória ──
  revealFrom('#trajetoria .section-label',    { from: { x: -20, y: 0 }, to: { x: 0 } }, '#trajetoria');
  revealFrom('#trajetoria .section-title',    { from: { y: 30 }, to: { y: 0 } });
  revealFrom('#trajetoria .section-subtitle', { from: { y: 20 }, to: { y: 0 } });

  gsap.fromTo('.timeline-item',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, stagger: 0.08, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: '.timeline', start: 'top 78%', once: true } }
  );

  gsap.fromTo('.highlight-card',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.traj-highlights', start: 'top 82%', once: true } }
  );

  // ── Contato ──
  revealFrom('#contato .section-label',    { from: { x: -20, y: 0 }, to: { x: 0 } }, '#contato');
  revealFrom('#contato .section-title',    { from: { y: 30 }, to: { y: 0 } });
  revealFrom('#contato .section-subtitle', { from: { y: 20 }, to: { y: 0 } });

  gsap.fromTo('.contato-card',
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: '.contato-grid', start: 'top 82%', once: true } }
  );
}

// ── 5 · COUNTERS ─────────────────────────────────────────────────
function initCounters() {
  const statsEl = document.querySelector('.hero-stats');
  if (!statsEl) return;

  let fired = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(easeOutCubic(progress) * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function animateTypewriter(el, text, delay) {
    let i = 0;
    el.textContent = '';
    function type() {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1);
        i++;
        setTimeout(type, delay);
      }
    }
    type();
  }

  function startCounters() {
    if (fired) return;
    fired = true;

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const duration = target <= 4 ? 1400 : 2000;
      animateCounter(el, target, suffix, duration);
    });

    const typewriterEl = document.querySelector('.stat-typewriter');
    if (typewriterEl) {
      const text = typewriterEl.dataset.text || '';
      setTimeout(() => animateTypewriter(typewriterEl, text, 180), 400);
    }
  }

  // Trigger when stats are visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) startCounters();
  }, { threshold: 0.4 });
  observer.observe(statsEl);

  // Also trigger on load if already visible
  const rect = statsEl.getBoundingClientRect();
  if (rect.top < window.innerHeight) startCounters();
}

// ── 6 · CSS FALLBACK (when GSAP fails) ───────────────────────────
function initCSSFallback() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

  // Make all animate-in elements visible on load/scroll
  document.querySelectorAll('.animate-in').forEach((el, i) => {
    const delay = (i % 6) * 80;
    el.style.transitionDelay = delay + 'ms';
    observer.observe(el);
  });

  // Hero immediate reveals
  setTimeout(() => {
    document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-subtitle, .hero-stats, .hero-actions, .hero-scroll-hint').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.getElementById('navbar').style.opacity = '1';
  }, 100);
}

// ── 7 · MISC UX ──────────────────────────────────────────────────
function initMiscUX() {
  // Footer year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Logo fallbacks (navbar + footer): if PNG and SVG both fail, show CSS text
  [
    ['.nav-logo-img',    '.nav-logo-text'],
    ['.footer-logo-img', '.footer-logo-text'],
  ].forEach(([imgSel, textSel]) => {
    const img  = document.querySelector(imgSel);
    const text = document.querySelector(textSel);
    if (!img || !text) return;
    img.addEventListener('error', () => {
      img.style.display = 'none';
      text.style.display = 'flex';
    });
    if (!img.complete || img.naturalWidth === 0) {
      img.style.display = 'none';
      text.style.display = 'flex';
    }
  });

  // Reduced-motion: ensure all animate-in elements are visible
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.animate-in').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}

// ── BOOTSTRAP ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initNavbar();
  initSmoothScroll();
  initGSAP();
  initCounters();
  initMiscUX();
});
