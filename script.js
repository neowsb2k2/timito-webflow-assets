/* ============================================
   TIMITO MEDIA — Cyberpunk / WCAG 2.2 / GSAP
   ============================================ */

/* ============================================
   MEGA DROPDOWN NAV
   ============================================ */
(function initMegaNav() {
  var dropdowns = document.querySelectorAll('.nav__dropdown');
  var closeTimer;

  function openDD(dd) {
    clearTimeout(closeTimer);
    dropdowns.forEach(function(d) { if (d !== dd) closeDD(d); });
    var btn = dd.querySelector('.nav__link--dd');
    var mega = dd.querySelector('.mega');
    if (!btn || !mega) return;
    btn.setAttribute('aria-expanded', 'true');
    mega.classList.add('is-open');
  }

  function closeDD(dd) {
    var btn = dd.querySelector('.nav__link--dd');
    var mega = dd.querySelector('.mega');
    if (!btn || !mega) return;
    btn.setAttribute('aria-expanded', 'false');
    mega.classList.remove('is-open');
  }

  function closeAll() {
    dropdowns.forEach(closeDD);
  }

  dropdowns.forEach(function(dd) {
    var btn = dd.querySelector('.nav__link--dd');
    var mega = dd.querySelector('.mega');

    // Hover open/close with delay
    dd.addEventListener('mouseenter', function() { openDD(dd); });
    dd.addEventListener('mouseleave', function() {
      closeTimer = setTimeout(function() { closeDD(dd); }, 150);
    });

    // Click toggle for accessibility
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (btn.getAttribute('aria-expanded') === 'true') closeDD(dd);
      else openDD(dd);
    });

    // Keyboard: ESC closes
    dd.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { closeDD(dd); btn.focus(); }
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav__dropdown')) closeAll();
  });

  // Close dropdowns on scroll anchor click inside mega
  document.querySelectorAll('.mega a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', closeAll);
  });
})();

/* ============================================
   HEXAGON CANVAS — Floating Background System
   ============================================ */
(function initHexagonCanvas() {
  const canvas = document.getElementById('hexCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const CONFIG = {
    count: 18,
    minSize: 18,
    maxSize: 72,
    colors: [
      'rgba(0, 212, 255, HEX_ALPHA)',
      'rgba(255, 45, 120, HEX_ALPHA)',
      'rgba(0, 255, 136, HEX_ALPHA)',
      'rgba(0, 212, 255, HEX_ALPHA)',
    ],
    minSpeed: 0.12,
    maxSpeed: 0.45,
    minRotSpeed: 0.002,
    maxRotSpeed: 0.008,
    minOpacity: 0.08,
    maxOpacity: 0.28,
  };

  let hexagons = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createHex(initialSpawn) {
    const size = rand(CONFIG.minSize, CONFIG.maxSize);
    const opacity = rand(CONFIG.minOpacity, CONFIG.maxOpacity);
    const colorTemplate = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    const color = colorTemplate.replace('HEX_ALPHA', opacity.toFixed(2));

    return {
      x: initialSpawn ? rand(0, canvas.width) : rand(-size * 2, canvas.width + size * 2),
      y: initialSpawn ? rand(0, canvas.height) : canvas.height + size * 2,
      size, color, opacity,
      vx: rand(-CONFIG.maxSpeed, CONFIG.maxSpeed) * 0.5,
      vy: -rand(CONFIG.minSpeed, CONFIG.maxSpeed),
      rotation: rand(0, Math.PI * 2),
      rotSpeed: rand(CONFIG.minRotSpeed, CONFIG.maxRotSpeed) * (Math.random() > 0.5 ? 1 : -1),
      pulsePhase: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.008, 0.02),
      filled: Math.random() > 0.65,
      lineWidth: rand(1, 2.5),
    };
  }

  function drawHexagon(ctx, x, y, size, rotation, filled, color, lineWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = size * Math.cos(angle);
      const py = size * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (filled) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke(); }
    ctx.restore();
  }

  function init() {
    resize();
    hexagons = Array.from({ length: CONFIG.count }, () => createHex(true));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagons.forEach((h, i) => {
      h.x += h.vx;
      h.y += h.vy;
      h.rotation += h.rotSpeed;
      h.pulsePhase += h.pulseSpeed;
      const pulsedSize = h.size + Math.sin(h.pulsePhase) * (h.size * 0.08);
      if (h.y < -h.size * 3 || h.x < -h.size * 3 || h.x > canvas.width + h.size * 3) {
        hexagons[i] = createHex(false);
        return;
      }
      drawHexagon(ctx, h.x, h.y, pulsedSize, h.rotation, h.filled, h.color, h.lineWidth);
    });
    requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    hexagons.forEach(h => {
      const depth = h.size / CONFIG.maxSize;
      h.x += mx * depth * 0.4;
      h.y += my * depth * 0.4;
    });
  }, { passive: true });

  window.addEventListener('resize', resize);
  init();
  tick();
})();

/* ===========================
   CURSOR GLOW
   =========================== */
(function() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    glow.style.display = 'none';
    return;
  }

  let glowX = 0, glowY = 0, targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  document.querySelectorAll('.btn--hot, .entry-card--design').forEach(el => {
    el.addEventListener('mouseenter', () => {
      glow.style.background = 'radial-gradient(circle, rgba(255,45,120,0.1) 0%, transparent 70%)';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.background = 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)';
    });
  });
  document.querySelectorAll('.entry-card--tracking').forEach(el => {
    el.addEventListener('mouseenter', () => {
      glow.style.background = 'radial-gradient(circle, rgba(0,255,136,0.09) 0%, transparent 70%)';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.background = 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)';
    });
  });

  function animateGlow() {
    glowX += (targetX - glowX) * 0.08;
    glowY += (targetY - glowY) * 0.08;
    glow.style.transform = `translate(${glowX - 250}px, ${glowY - 250}px)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
})();

/* ===========================
   HERO DATA FLOW CANVAS
   =========================== */
(function initHeroDataFlow() {
  const canvas = document.getElementById('heroDataCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');

  function resize() {
    canvas.width = hero?.offsetWidth || window.innerWidth;
    canvas.height = hero?.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = 40;
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2.5 + 1,
    broken: Math.random() > 0.55,
    transitionDelay: Math.random() * 4000,
    transitioned: false,
  }));

  setTimeout(() => {
    nodes.forEach(n => {
      setTimeout(() => { n.broken = false; n.transitioned = true; }, n.transitionDelay * 0.5);
    });
  }, 2500);

  const CONNECTION_DIST = 130;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          const bothBroken = nodes[i].broken && nodes[j].broken;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = bothBroken
            ? `rgba(255, 80, 60, ${alpha})`
            : `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.broken
        ? 'rgba(255, 80, 60, 0.7)'
        : (n.transitioned ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 212, 255, 0.6)');
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

// ── HERO ENTRANCE ANIMATION (Webflow-style) ──
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.querySelectorAll(
      '.hero-type__line,.hero__sub,.hero__ctas'
    ).forEach(el => { el.style.opacity = 1; });
    return;
  }

  const heroLines = document.querySelectorAll('.hero-type__line');
  const subline = document.querySelector('.hero__sub');
  const ctaWrap = document.querySelector('.hero__ctas');
  const trust = document.querySelector('.hero-trust');
  const scrollInd = document.querySelector('.hero__scroll');

  gsap.set(['.hero-type__line', '.hero__sub', '.hero__ctas'], { opacity: 1 });

  // Big type lines — staggered dramatic reveal
  heroLines.forEach((line, i) => {
    gsap.fromTo(line,
      { opacity: 0, y: 80, scale: 0.95, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, delay: 0.3 + i * 0.2, ease: 'power4.out' }
    );
  });

  // Sub-headline
  if (subline) {
    gsap.fromTo(subline, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.0, ease: 'power3.out' });
  }

  // CTA button — elastic scale in
  if (ctaWrap && ctaWrap.children.length) {
    gsap.fromTo(ctaWrap.children,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, stagger: 0.15, duration: 0.6, delay: 1.3, ease: 'elastic.out(1, 0.6)' }
    );
  }

  // Credibility line
  const credibility = document.querySelector('.hero__credibility');
  if (credibility) {
    gsap.fromTo(credibility, { opacity: 0, y: 10 }, { opacity: 0.7, y: 0, duration: 0.6, delay: 1.6, ease: 'power3.out' });
  }

  // Trust bar
  if (trust) {
    gsap.from(trust, { opacity: 0, y: 40, duration: 0.8, delay: 1.6, ease: 'power3.out' });
  }

  // Scroll indicator
  if (scrollInd) {
    gsap.to(scrollInd, { opacity: 1, delay: 2, duration: 0.6 });
    gsap.to(scrollInd, { y: 10, duration: 1.2, repeat: -1, yoyo: true, ease: 'power2.inOut', delay: 2 });
  }

  // Parallax on scroll
  gsap.to('.hero-content', {
    y: -100, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
}

window.addEventListener('load', initHeroAnimation);

/* ===========================
   GSAP INIT
   =========================== */
gsap.registerPlugin(ScrollTrigger);

/* ===========================
   SCROLL PROGRESS BAR
   =========================== */
const progressBar = document.querySelector('.scroll-progress__bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
  }, { passive: true });
}

/* ===========================
   NAVIGATION — Sticky
   =========================== */
const header = document.getElementById('site-header');
const scrollThreshold = 80;

window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > scrollThreshold);
}, { passive: true });

/* ===========================
   NAVIGATION — Mobile Hamburger
   =========================== */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  if (!burger || !mobileMenu) return;
  mobileMenu.hidden = true;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Menü öffnen');
  document.body.style.overflow = '';
  burger.focus();
}

function openMobileMenu() {
  if (!burger || !mobileMenu) return;
  mobileMenu.hidden = false;
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Menü schließen');
  document.body.style.overflow = 'hidden';
  const firstLink = mobileMenu.querySelector('a');
  if (firstLink) firstLink.focus();
}

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Close button inside mobile menu
  var mobileClose = document.getElementById('mobileMenuClose');
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hidden) closeMobileMenu();
  });
}

/* ===========================
   SMOOTH SCROLL
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = header ? header.offsetHeight + 16 : 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});

/* ===========================
   FAQ ACCORDION (WCAG 2.2)
   =========================== */
document.querySelectorAll('.faq__q').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const answerId = button.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);

    // Close all others
    document.querySelectorAll('.faq__q').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      const a = document.getElementById(btn.getAttribute('aria-controls'));
      if (a) a.hidden = true;
    });

    // Toggle current
    if (!expanded && answer) {
      button.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});

/* ===========================
   MAGNETIC BUTTON EFFECT
   =========================== */
document.querySelectorAll('.btn--hot, .btn--green, .btn--primary').forEach(btn => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    btn.style.transform = '';
  });
});

/* ===========================
   COUNTER ANIMATION
   =========================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(el, target, duration) {
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion) {
    el.textContent = prefix + target + suffix;
    return;
  }

  const dur = duration || 2000;
  const start = performance.now();

  (function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  })(performance.now());
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      const target = parseFloat(entry.target.dataset.count);
      animateCounter(entry.target, target, 2200);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ===========================
   GSAP ANIMATIONS
   =========================== */
if (!prefersReducedMotion) {

  // Hero entrance handled by initHeroAnimation() on window load

  // Generic scroll reveal
  function scrollReveal(selector, vars) {
    gsap.utils.toArray(selector).forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        y: 50, opacity: 0, duration: 0.7, delay: i * 0.08, ease: 'power3.out',
        ...vars
      });
    });
  }

  // Tech stack cards
  // Techstack — reveal groups then cards
  gsap.utils.toArray('.techstack__group').forEach((group) => {
    gsap.from(group.querySelector('.techstack__group-label'), {
      scrollTrigger: { trigger: group, start: 'top 88%', toggleActions: 'play none none reverse' },
      x: -20, opacity: 0, duration: 0.5, ease: 'power3.out'
    });
    gsap.utils.toArray(group.querySelectorAll('.techstack__card')).forEach((card, ci) => {
      gsap.from(card, {
        scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 35, opacity: 0, scale: 0.97,
        duration: 0.55, delay: ci * 0.07,
        ease: 'power3.out'
      });
    });
  });

  // Problem cards
  scrollReveal('.problem__card');

  // Case story cards — alternate left/right, rotated to straight, fade in
  gsap.utils.toArray('.case-story').forEach((card, i) => {
    var fromLeft = i % 2 === 0;
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      x: fromLeft ? -80 : 80,
      rotation: fromLeft ? -3 : 3,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Inner columns stagger after card lands
    var cols = card.querySelectorAll('.case-story__problem, .case-story__solution');
    gsap.from(cols, {
      scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' },
      y: 40, opacity: 0, duration: 0.7, stagger: 0.2, delay: 0.3, ease: 'power3.out'
    });
  });

  // Solution bridge
  gsap.from('.solution-bridge', {
    scrollTrigger: { trigger: '.solution-bridge', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
  });

  // Insider section — pinned scroll sequence:
  // Phase 1: Heading + copy centered → fade out
  // Phase 2: BTS text fades in centered → moves to top
  // Phase 3: Cards appear below BTS heading
  const insiderWrap = document.getElementById('insiderPinWrap');
  if (insiderWrap) {
    const insiderIntro = document.getElementById('insiderIntro');
    const btsEl = document.getElementById('btsHeading');
    const btsText = insiderWrap.querySelector('.bts__text');
    const insiderCards = insiderWrap.querySelectorAll('.insider__card');
    const insiderGrid = insiderWrap.querySelector('.insider__grid');

    // Initial states
    gsap.set(insiderCards, { opacity: 0, y: 50 });
    if (btsText) gsap.set(btsText, { opacity: 0 });
    if (insiderGrid) gsap.set(insiderGrid, { opacity: 0 });

    ScrollTrigger.create({
      trigger: insiderWrap,
      start: 'top 10%',
      end: '+=500%',
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // ── Phase 1 (0–0.25): Heading + copy HOLD visible, readable ──
        // ── Phase 1b (0.25–0.35): Scale up bigger + fade out ──
        if (insiderIntro) {
          if (p < 0.25) {
            gsap.set(insiderIntro, { opacity: 1, scale: 1, filter: 'blur(0px)' });
          } else if (p < 0.35) {
            const t = (p - 0.25) / 0.10;
            gsap.set(insiderIntro, {
              opacity: 1 - t,
              scale: 1 + t * 0.25,
              filter: `blur(${t * 12}px)`
            });
          } else {
            gsap.set(insiderIntro, { opacity: 0, scale: 1.25 });
          }
        }

        // ── Whitespace pause: 0.35–0.42 (nothing visible) ──

        // ── Phase 2 (0.42–0.62): BTS fades in centered, then moves to top ──
        if (btsText && btsEl) {
          if (p < 0.42) {
            gsap.set(btsText, { opacity: 0, y: 0 });
          } else if (p < 0.50) {
            // Fade in centered
            const t = (p - 0.42) / 0.08;
            gsap.set(btsText, {
              opacity: t,
              scale: 0.9 + t * 0.1,
              filter: `blur(${(1 - t) * 8}px)`,
              y: 0
            });
          } else if (p < 0.56) {
            // Hold centered
            gsap.set(btsText, { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 });
          } else if (p < 0.65) {
            // Move to top
            const t = (p - 0.56) / 0.09;
            const wrapH = insiderWrap.offsetHeight;
            const targetY = -(wrapH / 2) + 60;
            gsap.set(btsText, { opacity: 1, scale: 1 - t * 0.15, filter: 'blur(0px)', y: targetY * t });
          } else {
            // Parked at top
            const wrapH = insiderWrap.offsetHeight;
            const targetY = -(wrapH / 2) + 60;
            gsap.set(btsText, { opacity: 1, scale: 0.85, filter: 'blur(0px)', y: targetY });
          }
        }

        // ── Phase 3 (0.65–0.88): Cards fade in staggered ──
        if (insiderGrid) {
          gsap.set(insiderGrid, { opacity: p >= 0.64 ? 1 : 0 });
        }

        insiderCards.forEach((card, i) => {
          const cardStart = 0.65 + i * 0.05;
          const cardEnd = cardStart + 0.12;
          let cardOpacity, cardY;
          if (p < cardStart) {
            cardOpacity = 0;
            cardY = 50;
          } else if (p < cardEnd) {
            const t = (p - cardStart) / (cardEnd - cardStart);
            cardOpacity = t;
            cardY = 50 * (1 - t);
          } else {
            cardOpacity = 1;
            cardY = 0;
          }

          gsap.set(card, { opacity: cardOpacity, y: cardY });
        });
      }
    });
  }

  // Team cards
  scrollReveal('.team__card', { delay: 0 });

  // Trust quote
  gsap.from('.trust-quote', {
    scrollTrigger: { trigger: '.trust-quote', start: 'top 85%', toggleActions: 'play none none reverse' },
    x: -30, opacity: 0, duration: 0.8, ease: 'power3.out'
  });

  // Manifesto — pinned letter-by-letter reveal on scroll
  const manifestoPin = document.getElementById('manifestoPin');
  const manifestoText = document.getElementById('manifestoText');
  const manifestoHeading = document.getElementById('manifestoHeading');
  if (manifestoPin && manifestoText) {
    // Build letter spans from data attribute
    const segments = JSON.parse(manifestoText.dataset.lines);
    manifestoText.innerHTML = '';
    segments.forEach(seg => {
      seg.text.split('').forEach(char => {
        if (char === ' ') {
          manifestoText.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.className = 'ml' + (seg.color ? ' ml--' + seg.color : '');
          span.textContent = char;
          manifestoText.appendChild(span);
        }
      });
    });

    const allLetters = manifestoText.querySelectorAll('.ml');

    ScrollTrigger.create({
      trigger: manifestoPin,
      start: 'top top',
      end: '+=500%',
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Heading fades in 0–0.08
        if (manifestoHeading) {
          if (p < 0.08) {
            gsap.set(manifestoHeading, { opacity: p / 0.08 });
          } else {
            gsap.set(manifestoHeading, { opacity: 1 });
          }
        }

        // Letters reveal 0.08–0.70
        const total = allLetters.length;
        const revealStart = 0.08;
        const revealEnd = 0.70;
        const revealP = Math.max(0, Math.min(1, (p - revealStart) / (revealEnd - revealStart)));
        const lettersToLight = Math.floor(revealP * total);

        allLetters.forEach((letter, i) => {
          if (i < lettersToLight) {
            letter.classList.add('is-lit');
          } else {
            letter.classList.remove('is-lit');
          }
        });

        // After fully revealed (0.75–0.95): scale up + fade out
        const mContent = manifestoPin.querySelector('.manifesto__content');
        if (mContent) {
          if (p < 0.75) {
            gsap.set(mContent, { scale: 1, opacity: 1, filter: 'blur(0px)' });
          } else if (p < 0.95) {
            const t = (p - 0.75) / 0.20;
            gsap.set(mContent, {
              scale: 1 + t * 1.5,
              opacity: 1 - t,
              filter: `blur(${t * 6}px)`
            });
          } else {
            gsap.set(mContent, { opacity: 0 });
          }
        }
      }
    });
  }

  // Service cards — staggered fly-in one after another
  const svcCards = gsap.utils.toArray('.svc');
  if (svcCards.length) {
    svcCards.forEach((card, i) => {
      const arrow = card.querySelector('.svc__arrow');

      gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services__scroll-wrap',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
            onEnter: () => { if (arrow) arrow.classList.add('is-animated') },
            onLeaveBack: () => { if (arrow) arrow.classList.remove('is-animated') }
          }
        }
      );
    });
  }

  // Case cards
  scrollReveal('.case');

  // Review cards
  gsap.from('.review-card', {
    scrollTrigger: { trigger: '.reviews__track', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 40, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out'
  });

  // Process steps
  scrollReveal('.step');

  // FAQ items
  scrollReveal('.faq__item', { y: 25, duration: 0.5, delay: 0 });

  // CTA section
  gsap.from('.cta__content', {
    scrollTrigger: { trigger: '.cta', start: 'top 70%', toggleActions: 'play none none reverse' },
    x: -40, opacity: 0, duration: 0.8, ease: 'power3.out'
  });
  if (document.querySelector('.contact-form')) {
    gsap.from('.contact-form', {
      scrollTrigger: { trigger: '.cta', start: 'top 70%', toggleActions: 'play none none reverse' },
      x: 40, opacity: 0, duration: 0.8, delay: 0.15, ease: 'power3.out'
    });
  }

  // Section labels
  scrollReveal('.section-label', { y: 20, duration: 0.5, delay: 0 });

  // Big Footer Type Reveal
  gsap.from('.footer-hero__line', {
    scrollTrigger: { trigger: '.footer-hero', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 80, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power4.out'
  });
  gsap.from('.footer-hero__cta', {
    scrollTrigger: { trigger: '.footer-hero', start: 'top 75%' },
    scale: 0.8, opacity: 0, duration: 0.6, delay: 0.3, ease: 'elastic.out(1, 0.6)'
  });

  // Horizontal marquee scroll effect on footer lines
  gsap.to('.footer-hero__line--accent:first-child', {
    scrollTrigger: { trigger: '.footer-hero', start: 'top bottom', end: 'bottom top', scrub: 1 },
    x: -60, ease: 'none'
  });
  gsap.to('.footer-hero__line--outline', {
    scrollTrigger: { trigger: '.footer-hero', start: 'top bottom', end: 'bottom top', scrub: 1 },
    x: 60, ease: 'none'
  });
  gsap.to('.footer-hero__line--accent:last-child', {
    scrollTrigger: { trigger: '.footer-hero', start: 'top bottom', end: 'bottom top', scrub: 1 },
    x: -40, ease: 'none'
  });
}

/* ===========================
   REVIEWS — Scroll Buttons
   =========================== */
(function() {
  const wrap = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  if (!wrap || !prevBtn || !nextBtn) return;

  const scrollAmount = 540;

  function updateButtons() {
    prevBtn.disabled = wrap.scrollLeft <= 5;
    nextBtn.disabled = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 5;
  }

  nextBtn.addEventListener('click', () => {
    wrap.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
  prevBtn.addEventListener('click', () => {
    wrap.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  wrap.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();
})();

/* ===========================
   FUNNEL — Multi-Step Form
   =========================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const steps = contactForm.querySelectorAll('.funnel__step');
  const bar = document.getElementById('funnelBar');
  const stepLabel = document.getElementById('funnelStepLabel');
  const backBtn = document.getElementById('funnelBack');
  let currentStep = 1;
  const totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(s => {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  // Auto-advance on radio select (steps 1 & 2)
  contactForm.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (currentStep < totalSteps) {
        setTimeout(() => goToStep(currentStep + 1), 250);
      }
    });
  });

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  // Form submission — redirect to thank you page
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.funnel__submit');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet…';

    const prevErr = contactForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (res.ok) {
        window.location.href = 'thankyou.html';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;

      const el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'text-align:center;color:var(--color-accent-hot);font-size:.85rem;margin-top:1rem';
      el.textContent = 'Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreib uns direkt an office@timito-media.at';
      submitBtn.after(el);
    }
  });
}

/* ===========================
   INIT
   =========================== */
console.log('%c TIMITO MEDIA %c Tracking-First ', 'background:#ff2d78;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;font-size:11px', 'background:#00d4ff;color:#0a0a0f;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:bold;font-size:11px');

// ── SECTION REVEAL ON SCROLL ──
// Adds .is-visible class when sections enter viewport
// CSS handles the actual animation — JS only triggers the class

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Stop observing once revealed (one-shot)
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all major cards and grid items
document.querySelectorAll(
  '.problem__card, .team__card, .case, .step, .faq__item'
).forEach(el => {
  el.classList.add('reveal-item');
  revealObserver.observe(el);
});

/* ===========================
   ENTRY PATHS — Drag Scroll + Stacked Card Effect
   =========================== */
(function() {
  const track = document.getElementById('entryPathsTrack');
  const wrapper = track?.parentElement;
  if (!track || !wrapper) return;

  // Drag to scroll
  let isDown = false, startX, scrollLeft;
  wrapper.addEventListener('mousedown', e => {
    isDown = true;
    wrapper.style.cursor = 'grabbing';
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });
  wrapper.addEventListener('mouseleave', () => { isDown = false; wrapper.style.cursor = 'grab'; });
  wrapper.addEventListener('mouseup', () => { isDown = false; wrapper.style.cursor = 'grab'; });
  wrapper.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    wrapper.scrollLeft = scrollLeft - (x - startX) * 1.2;
  });

  // Touch support
  let touchStartX = 0, touchScrollLeft = 0;
  wrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = wrapper.scrollLeft;
  }, { passive: true });
  wrapper.addEventListener('touchmove', e => {
    const diff = touchStartX - e.touches[0].pageX;
    wrapper.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });

  // GSAP ScrollTrigger reveal for section heading
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.from('.entry-paths .section-label, .entry-paths h2, .entry-paths .section-intro', {
      scrollTrigger: { trigger: '.entry-paths', start: 'top 85%' },
      y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out'
    });
  }
})();

/* ===========================
   SCROLL VELOCITY TILT
   =========================== */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 1024) return;

  let lastScrollY = 0, velocity = 0, ticking = false;
  const tiltCards = document.querySelectorAll('.entry-card, .insider__card, .team__card');

  window.addEventListener('scroll', () => {
    velocity = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;

    if (!ticking) {
      requestAnimationFrame(() => {
        const tilt = Math.max(-4, Math.min(4, velocity * 0.3));
        tiltCards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            card.style.transform = `perspective(1000px) rotateX(${-tilt}deg)`;
          }
        });
        setTimeout(() => {
          tiltCards.forEach(card => {
            card.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
            card.style.transform = '';
          });
        }, 80);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================
   CASE SCREENSHOT LIGHTBOX
   ============================================ */
(function () {
  const lightbox = document.getElementById('csLightbox');
  if (!lightbox) return;
  const content = document.getElementById('csLightboxContent');
  const closeBtn = lightbox.querySelector('.cs-lightbox__close');
  const backdrop = lightbox.querySelector('.cs-lightbox__backdrop');
  const isMobile = () => window.innerWidth <= 768;

  function openLightbox(thumbEl) {
    const imgEl = thumbEl.querySelector('.case-story__thumb-img');
    if (!imgEl) return;
    content.innerHTML = '';
    const clone = imgEl.cloneNode(true);
    clone.style.width = '100%';
    clone.style.aspectRatio = '16/9';
    content.appendChild(clone);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    setTimeout(() => {
      lightbox.hidden = true;
      content.innerHTML = '';
      document.body.style.overflow = '';
    }, 200);
  }

  document.querySelectorAll('.case-story__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (isMobile()) return; // no lightbox on mobile
      openLightbox(thumb);
    });
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isMobile()) return;
        openLightbox(thumb);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
})();
