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
      start: 'top top',
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
      // Split into words, preserving spaces between them
      var words = seg.text.split(/( +)/);
      words.forEach(function(token) {
        if (/^ +$/.test(token)) {
          // Pure whitespace — insert as text node
          manifestoText.appendChild(document.createTextNode(token));
        } else {
          // Wrap entire word in a no-break span
          var wordSpan = document.createElement('span');
          wordSpan.className = 'ml-word';
          token.split('').forEach(function(char) {
            var letterSpan = document.createElement('span');
            letterSpan.className = 'ml' + (seg.color ? ' ml--' + seg.color : '');
            letterSpan.textContent = char;
            wordSpan.appendChild(letterSpan);
          });
          manifestoText.appendChild(wordSpan);
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

  // Section headings — every h2 that enters viewport
  gsap.utils.toArray('section h2, .trust h2, .process h2, .faq h2, .cta h2, .expertise h2, .services h2, .problem h2, .manifesto h2').forEach(function(el) {
    // Skip if already inside a pinned element (insider / manifesto pin-wrap)
    if (el.closest('#insiderPinWrap') || el.closest('#manifestoPin')) return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      y: 35, opacity: 0, duration: 0.75, ease: 'power3.out'
    });
  });

  // Section intro paragraphs
  gsap.utils.toArray('.section-intro').forEach(function(el) {
    if (el.closest('#insiderPinWrap')) return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      y: 25, opacity: 0, duration: 0.65, delay: 0.1, ease: 'power3.out'
    });
  });

  // Techstack cards — staggered per group
  gsap.utils.toArray('.techstack__grid').forEach(function(grid) {
    var cards = grid.querySelectorAll('.techstack__card');
    gsap.from(cards, {
      scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 40, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out'
    });
  });

  // Entry cards (horizontal scroll cards)
  gsap.utils.toArray('.entry-card').forEach(function(card, i) {
    gsap.from(card, {
      scrollTrigger: { trigger: '.entry-paths__scroll-wrapper', start: 'top 80%', toggleActions: 'play none none reverse' },
      y: 50, opacity: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out'
    });
  });

  // Team heading
  if (document.querySelector('.team__heading')) {
    gsap.from('.team__heading', {
      scrollTrigger: { trigger: '.team__heading', start: 'top 88%', toggleActions: 'play none none reverse' },
      y: 30, opacity: 0, duration: 0.7, ease: 'power3.out'
    });
  }

  // Reviews header
  if (document.querySelector('.reviews__header')) {
    gsap.from('.reviews__header', {
      scrollTrigger: { trigger: '.reviews__header', start: 'top 88%', toggleActions: 'play none none reverse' },
      y: 25, opacity: 0, duration: 0.6, ease: 'power3.out'
    });
  }

  // Cases CTA strip
  if (document.querySelector('.cases__cta-strip')) {
    gsap.from('.cases__cta-strip', {
      scrollTrigger: { trigger: '.cases__cta-strip', start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 30, opacity: 0, duration: 0.6, ease: 'power3.out'
    });
  }

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
        window.location.href = '/danke';
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

/* =============================================
   GOOGLE ADS SERVICE PAGE — google-ads.html
   ============================================= */

window.addEventListener('load', function () {

  /* GSAP SCROLL ANIMATIONS */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

    gsap.registerPlugin(ScrollTrigger);
    var scrubDef = { start: 'top 85%', end: 'top 20%', scrub: 1 };

    // Neutralize script.js reveal observer — prevent dual-animation conflict
    document.querySelectorAll('.problem__card, .faq__item, .solution-col, .strategist__card, .package-card').forEach(function(el) {
      el.classList.remove('reveal-item');
      el.classList.add('is-visible');
      revealObserver.unobserve(el);
    });

    // Hero stat tiles (toggleActions for clean stagger)
    if (document.querySelector('.svc-hero__stats')) {
      gsap.from('.stat-tile', {
        scrollTrigger: { trigger: '.svc-hero__stats', start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out'
      });
    }

    // Problem grid — cards + solution as one timeline (toggleActions for clean stagger)
    if (document.querySelector('.problem-grid')) {
      var problemTl = gsap.timeline({
        scrollTrigger: { trigger: '.problem-grid', start: 'top 85%', end: 'top 15%', toggleActions: 'play none none reverse' }
      });
      problemTl.from('.problem__card', {
        y: 40, opacity: 0, stagger: 0.2, duration: 0.6, ease: 'power3.out'
      }, 0);
      problemTl.from('.solution-col', {
        y: 30, opacity: 0, duration: 0.6, ease: 'power3.out'
      }, 0.15);
    }

    // Strategist card
    if (document.querySelector('.strategist__card')) {
      gsap.from('.strategist__card', {
        scrollTrigger: Object.assign({ trigger: '.strategist__card' }, scrubDef),
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
      });
    }

    // Timeline steps
    gsap.utils.toArray('.timeline__step').forEach(function (step, i) {
      var fromX = i % 2 === 0 ? -60 : 60;
      gsap.from(step, {
        scrollTrigger: Object.assign({ trigger: step }, scrubDef),
        x: fromX, opacity: 0, duration: 0.8, ease: 'power3.out'
      });
    });

    // Timeline animated line
    var timelineLine = document.querySelector('.timeline__line');
    if (timelineLine) {
      gsap.to(timelineLine, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 30%', scrub: true }
      });
    }

    // Investment cards (toggleActions for clean stagger)
    if (document.querySelector('.investment__grid')) {
      gsap.from('.package-card', {
        scrollTrigger: { trigger: '.investment__grid', start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out'
      });
    }

    // CTA section
    if (document.querySelector('.svc-cta')) {
      gsap.from('.svc-cta__content', {
        scrollTrigger: Object.assign({ trigger: '.svc-cta' }, scrubDef),
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out'
      });
      gsap.from('.svc-funnel', {
        scrollTrigger: Object.assign({ trigger: '.svc-cta', start: 'top 80%', end: 'top 15%', scrub: 1 }),
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out'
      });
    }
  }

  /* FAQ SMOOTH ACCORDION */
  var faqSection = document.querySelector('.svc-faq, .leist-faq');
  if (faqSection) {

    function faqClose(btn, el, dur) {
      btn.setAttribute('aria-expanded', 'false');
      gsap.killTweensOf(el);
      var tl = gsap.timeline({
        onComplete: function() { el.hidden = true; el.removeAttribute('style'); }
      });
      tl.to(el, { opacity: 0, duration: dur * 0.45, ease: 'power2.in' }, 0);
      tl.to(el, { height: 0, duration: dur, ease: 'power3.inOut' }, 0);
      return tl;
    }

    function faqOpen(el, dur) {
      gsap.killTweensOf(el);
      el.hidden = false;
      el.style.overflow = 'hidden';
      el.style.height = 'auto';
      var h = el.offsetHeight;
      el.style.height = '0px';
      el.style.opacity = '0';
      var tl = gsap.timeline({
        onComplete: function() {
          el.style.height = 'auto';
          el.style.overflow = '';
          el.style.opacity = '';
        }
      });
      tl.to(el, { height: h, duration: dur, ease: 'expo.out' }, 0);
      tl.to(el, { opacity: 1, duration: dur * 0.65, ease: 'power2.out' }, dur * 0.15);
      return tl;
    }

    faqSection.addEventListener('click', function(e) {
      var button = e.target.closest('.faq__q');
      if (!button) return;
      e.stopPropagation();

      var expanded = button.getAttribute('aria-expanded') === 'true';
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      if (!answer) return;

      var useGSAP = typeof gsap !== 'undefined' &&
                    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      faqSection.querySelectorAll('.faq__q').forEach(function(btn) {
        if (btn === button || btn.getAttribute('aria-expanded') !== 'true') return;
        var a = document.getElementById(btn.getAttribute('aria-controls'));
        if (!a) return;
        if (useGSAP) { faqClose(btn, a, 0.35); }
        else { btn.setAttribute('aria-expanded', 'false'); a.hidden = true; }
      });

      if (expanded) {
        if (useGSAP) { faqClose(button, answer, 0.4); }
        else { button.setAttribute('aria-expanded', 'false'); answer.hidden = true; }
      } else {
        button.setAttribute('aria-expanded', 'true');
        if (useGSAP) { faqOpen(answer, 0.5); }
        else { answer.hidden = false; }
      }
    }, true);
  }

  /* FUNNEL — Multi-Step Form */
  var svcForm = document.getElementById('svcContactForm');
  if (svcForm) {
    var steps = svcForm.querySelectorAll('.funnel__step');
    var bar = document.getElementById('svcFunnelBar');
    var stepLabel = document.getElementById('svcFunnelStepLabel');
    var backBtn = document.getElementById('svcFunnelBack');
    var currentStep = 1;
    var totalSteps = steps.length;

    function goToStep(n) {
      currentStep = n;
      steps.forEach(function(s) {
        s.hidden = parseInt(s.dataset.step) !== n;
      });
      if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
      if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
      if (backBtn) backBtn.hidden = n === 1;
    }

    svcForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        if (currentStep < totalSteps) {
          setTimeout(function() { goToStep(currentStep + 1); }, 250);
        }
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (currentStep > 1) goToStep(currentStep - 1);
      });
    }

    svcForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = svcForm.querySelector('.funnel__submit');
      var originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Wird gesendet\u2026';

      var prevErr = svcForm.querySelector('.form-error');
      if (prevErr) prevErr.remove();

      try {
        var res = await fetch(svcForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(svcForm)
        });
        if (res.ok) {
          window.location.href = '/danke';
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        var el = document.createElement('p');
        el.className = 'form-error';
        el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
        el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
        svcForm.appendChild(el);
      }
    });
  }

});

/* ===========================
   SCROLL CHEVRONS — index.html
   =========================== */
(function() {
  var sections = ['hero', 'team', 'insiderIntro'];
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sections.forEach(function(id) {
    var section = document.getElementById(id);
    if (!section) return;

    var chevron = document.createElement('div');
    chevron.className = 'scroll-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    chevron.style.pointerEvents = 'auto';
    section.appendChild(chevron);

    // Fade in after delay
    var delay = id === 'hero' ? 2500 : 0;
    setTimeout(function() {
      chevron.style.opacity = '1';
    }, delay);

    // Click scrolls to next section
    chevron.addEventListener('click', function() {
      var next = section.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hide hero chevron on scroll
  var heroChevron = document.querySelector('#hero .scroll-chevron');
  if (heroChevron) {
    var hidden = false;
    window.addEventListener('scroll', function() {
      if (hidden) return;
      if (window.scrollY > 100) {
        hidden = true;
        heroChevron.style.opacity = '0';
        heroChevron.style.pointerEvents = 'none';
      }
    }, { passive: true });
  }
})();

/* =============================================
   SOCIAL ADS PAGE — social-ads.html
   ============================================= */

/* GSAP: Platform card animations */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.platform-grid')) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.platform-card', {
    scrollTrigger: { trigger: '.platform-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out'
  });
});

/* FUNNEL — Social Ads Multi-Step Form */
(function() {
  var socialForm = document.getElementById('socialContactForm');
  if (!socialForm) return;

  var steps = socialForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('socialFunnelBar');
  var stepLabel = document.getElementById('socialFunnelStepLabel');
  var backBtn = document.getElementById('socialFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  socialForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  socialForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = socialForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = socialForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(socialForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(socialForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      socialForm.appendChild(el);
    }
  });
})();

/* =============================================
   SST PAGE — server-side-tracking.html
   ============================================= */

/* FUNNEL — SST Multi-Step Form */
(function() {
  var sstForm = document.getElementById('sstContactForm');
  if (!sstForm) return;

  var steps = sstForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('sstFunnelBar');
  var stepLabel = document.getElementById('sstFunnelStepLabel');
  var backBtn = document.getElementById('sstFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  sstForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  sstForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = sstForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = sstForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(sstForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(sstForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      sstForm.appendChild(el);
    }
  });
})();

/* =============================================
   WEBDESIGN PAGE — webdesign.html
   ============================================= */

/* FUNNEL — Webdesign Multi-Step Form */
(function() {
  var webForm = document.getElementById('webContactForm');
  if (!webForm) return;

  var steps = webForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('webFunnelBar');
  var stepLabel = document.getElementById('webFunnelStepLabel');
  var backBtn = document.getElementById('webFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  webForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  webForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = webForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = webForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(webForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(webForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      webForm.appendChild(el);
    }
  });
})();

/* =============================================
   UI/UX PAGE — ui-ux-design.html
   ============================================= */

/* GSAP: Deliverable card animations */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.deliverable-grid')) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.deliverable-card', {
    scrollTrigger: { trigger: '.deliverable-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out'
  });
});

/* FUNNEL — UI/UX Multi-Step Form */
(function() {
  var uxForm = document.getElementById('uxContactForm');
  if (!uxForm) return;

  var steps = uxForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('uxFunnelBar');
  var stepLabel = document.getElementById('uxFunnelStepLabel');
  var backBtn = document.getElementById('uxFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  uxForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  uxForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = uxForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = uxForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(uxForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(uxForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      uxForm.appendChild(el);
    }
  });
})();

/* =============================================
   STRATEGY PAGE — strategy.html
   ============================================= */

/* GSAP: Segment card animations */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.segment-grid')) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.segment-card', {
    scrollTrigger: { trigger: '.segment-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out'
  });
});

/* FUNNEL — Strategy Multi-Step Form */
(function() {
  var stratForm = document.getElementById('stratContactForm');
  if (!stratForm) return;

  var steps = stratForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('stratFunnelBar');
  var stepLabel = document.getElementById('stratFunnelStepLabel');
  var backBtn = document.getElementById('stratFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  stratForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  stratForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = stratForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = stratForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(stratForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(stratForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      stratForm.appendChild(el);
    }
  });
})();

/* =============================================
   TEAM PAGE — team.html
   ============================================= */

/* GSAP: Philosophy card + Trust card animations */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.philosophy-grid')) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.philosophy-card', {
    scrollTrigger: { trigger: '.philosophy-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out'
  });

  if (document.querySelector('.trust-grid')) {
    gsap.from('.trust-card', {
      scrollTrigger: { trigger: '.trust-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out'
    });
  }
});

/* FUNNEL — Team Multi-Step Form */
(function() {
  var teamForm = document.getElementById('teamContactForm');
  if (!teamForm) return;

  var steps = teamForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('teamFunnelBar');
  var stepLabel = document.getElementById('teamFunnelStepLabel');
  var backBtn = document.getElementById('teamFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  teamForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  teamForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = teamForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = teamForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(teamForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(teamForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      teamForm.appendChild(el);
    }
  });
})();

/* =============================================
   KOOPERATION PAGE — agentur-kooperation.html
   ============================================= */

/* GSAP: Flow blocks + Partner card animations */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  if (document.querySelector('.flow-diagram')) {
    gsap.from('.flow-block', {
      scrollTrigger: { trigger: '.flow-diagram', start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 20, opacity: 0, stagger: 0.2, duration: 0.5, ease: 'power3.out'
    });
    gsap.from('.flow-arrow', {
      scrollTrigger: { trigger: '.flow-diagram', start: 'top 85%', toggleActions: 'play none none reverse' },
      opacity: 0, stagger: 0.2, duration: 0.4, delay: 0.3, ease: 'power3.out'
    });
  }

  if (document.querySelector('.partner-grid')) {
    gsap.from('.partner-card', {
      scrollTrigger: { trigger: '.partner-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
      y: 25, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out'
    });
  }
});

/* FUNNEL — Kooperation Multi-Step Form */
(function() {
  var koopForm = document.getElementById('koopContactForm');
  if (!koopForm) return;

  var steps = koopForm.querySelectorAll('.funnel__step');
  var bar = document.getElementById('koopFunnelBar');
  var stepLabel = document.getElementById('koopFunnelStepLabel');
  var backBtn = document.getElementById('koopFunnelBack');
  var currentStep = 1;
  var totalSteps = steps.length;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function(s) {
      s.hidden = parseInt(s.dataset.step) !== n;
    });
    if (bar) bar.style.width = ((n / totalSteps) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Schritt ' + n + ' von ' + totalSteps;
    if (backBtn) backBtn.hidden = n === 1;
  }

  koopForm.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (currentStep < totalSteps) {
        setTimeout(function() { goToStep(currentStep + 1); }, 250);
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  }

  koopForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var submitBtn = koopForm.querySelector('.funnel__submit');
    var originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wird gesendet\u2026';

    var prevErr = koopForm.querySelector('.form-error');
    if (prevErr) prevErr.remove();

    try {
      var res = await fetch(koopForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(koopForm)
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      var el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff6b6b;font-size:.85rem;margin-top:.75rem;text-align:center;';
      el.textContent = 'Fehler beim Senden. Bitte versuche es erneut oder schreib uns direkt.';
      koopForm.appendChild(el);
    }
  });
})();

/* =============================================
   LEGAL PAGES — TOC Active Highlight
   ============================================= */
(function () {
  var tocLinks = document.querySelectorAll('.legal-toc nav a');
  if (!tocLinks.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var id = entry.target.getAttribute('id');
      var link = document.querySelector('.legal-toc nav a[href="#' + id + '"]');
      if (link) {
        if (entry.isIntersecting) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('.legal-content section[id]')
    .forEach(function (el) { observer.observe(el); });
})();

/* =============================================
   LEGAL PAGES — TOC Mobile Toggle
   ============================================= */
(function () {
  var toggle = document.querySelector('.legal-toc__toggle');
  if (!toggle) return;

  var nav = toggle.parentElement.querySelector('nav');
  if (!nav) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
    toggle.textContent = expanded
      ? 'Inhaltsverzeichnis anzeigen \u25BE'
      : 'Inhaltsverzeichnis ausblenden \u25B4';
  });
})();

/* =============================================
   KONTAKT PAGE — Funnel Logic
   ============================================= */
(function () {
  const form = document.getElementById('mainContactForm');
  if (!form) return;

  const steps = form.querySelectorAll('.funnel__step');
  const bar = document.getElementById('mainFunnelBar');
  const label = document.getElementById('mainFunnelStepLabel');
  const success = document.getElementById('mainFunnelSuccess');
  const error = document.getElementById('mainFunnelError');
  let current = 0;

  function goTo(index) {
    steps[current].hidden = true;
    steps[index].hidden = false;
    current = index;
    const pct = Math.round(((index + 1) / steps.length) * 100);
    if (bar) bar.style.width = pct + '%';
    if (bar) bar.closest('[role="progressbar"]')
               .setAttribute('aria-valuenow', pct);
    if (label) label.textContent =
      `Schritt ${index + 1} von ${steps.length}`;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Next buttons
  ['mainFunnelNext1', 'mainFunnelNext2'].forEach((id, i) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const required = steps[i].querySelectorAll('[required]');
      const valid = [...required].every(el =>
        el.type === 'radio'
          ? steps[i].querySelector(`[name="${el.name}"]:checked`)
          : el.value.trim()
      );
      if (!valid) {
        steps[i].querySelector('[required]').reportValidity();
        return;
      }
      goTo(i + 1);
    });
  });

  // Back buttons
  ['mainFunnelBack2', 'mainFunnelBack3'].forEach((id, i) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => goTo(i));
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        window.location.href = '/danke';
      } else {
        throw new Error('Network response not ok');
      }
    } catch {
      error.hidden = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

/* ============================================
   LEISTUNGEN — PROZESS SCROLL ANIMATION
   ============================================ */
(function initLeistProzess() {
  var stepsWrap = document.getElementById('leistSteps');
  if (!stepsWrap) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stepsWrap.querySelectorAll('.leist-step').forEach(function(s) {
      s.classList.add('is-active');
    });
    return;
  }

  var isMobile = window.matchMedia('(max-width: 900px)').matches;
  var fill     = document.getElementById('leistTrackFill');
  var steps    = stepsWrap.querySelectorAll('.leist-step');
  var n        = steps.length;

  if (fill) {
    gsap.to(fill, {
      [isMobile ? 'height' : 'width']: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: stepsWrap,
        start: 'top 70%',
        end:   'bottom 55%',
        scrub: 1.2,
      }
    });
  }

  steps.forEach(function(step, i) {
    var progress = i / (n - 1);

    ScrollTrigger.create({
      trigger: stepsWrap,
      start: 'top 70%',
      end:   'bottom 55%',
      scrub: true,
      onUpdate: function(self) {
        if (self.progress >= progress - 0.02) {
          step.classList.add('is-active');
        } else {
          step.classList.remove('is-active');
        }
      }
    });
  });
})();

/* ============================================
   FAQ HUB PAGE — ACCORDION
   ============================================ */
(function() {
  var faqHub = document.querySelector('.faq-hub');
  if (!faqHub) return;

  function faqClose(btn, el, dur) {
    btn.setAttribute('aria-expanded', 'false');
    if (typeof gsap !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(el);
      var tl = gsap.timeline({
        onComplete: function() { el.hidden = true; el.removeAttribute('style'); }
      });
      tl.to(el, { opacity: 0, duration: dur * 0.45, ease: 'power2.in' }, 0);
      tl.to(el, { height: 0, duration: dur, ease: 'power3.inOut' }, 0);
    } else {
      el.hidden = true;
    }
  }

  function faqOpen(btn, el, dur) {
    btn.setAttribute('aria-expanded', 'true');
    if (typeof gsap !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(el);
      el.hidden = false;
      el.style.overflow = 'hidden';
      el.style.height = 'auto';
      var h = el.offsetHeight;
      el.style.height = '0px';
      el.style.opacity = '0';
      gsap.timeline({
        onComplete: function() {
          el.style.height = 'auto';
          el.style.overflow = '';
          el.style.opacity = '';
        }
      })
      .to(el, { height: h, duration: dur, ease: 'expo.out' }, 0)
      .to(el, { opacity: 1, duration: dur * 0.65, ease: 'power2.out' }, dur * 0.15);
    } else {
      el.hidden = false;
    }
  }

  faqHub.addEventListener('click', function(e) {
    var button = e.target.closest('.faq__q');
    if (!button) return;
    e.stopPropagation();

    var expanded = button.getAttribute('aria-expanded') === 'true';
    var answer = document.getElementById(button.getAttribute('aria-controls'));
    if (!answer) return;

    /* Close all others */
    faqHub.querySelectorAll('.faq__q').forEach(function(btn) {
      if (btn === button || btn.getAttribute('aria-expanded') !== 'true') return;
      var a = document.getElementById(btn.getAttribute('aria-controls'));
      if (a) faqClose(btn, a, 0.35);
    });

    if (expanded) {
      faqClose(button, answer, 0.4);
    } else {
      faqOpen(button, answer, 0.5);
    }
  }, true);
})();

/* ============================================
   FAQ HUB PAGE — ACTIVE PILL ON SCROLL
   ============================================ */
(function() {
  var pills = document.querySelectorAll('.faq-nav__pill');
  var categories = document.querySelectorAll('.faq__category');
  if (!pills.length || !categories.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      pills.forEach(function(pill) {
        var isActive = pill.getAttribute('href') === '#' + id;
        pill.classList.toggle('faq-nav__pill--active', isActive);
        pill.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  categories.forEach(function(cat) { observer.observe(cat); });
})();

/* ============================================
   BLOG — Scroll Animations + Filter
   ============================================ */
(function initBlog() {
  /* ── Blog Card Reveal ── */
  var blogCards = document.querySelectorAll('.blog-card');
  if (!blogCards.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap !== 'undefined' && !reducedMotion) {
    blogCards.forEach(function(card, i) {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: (i % 3) * 0.1,
        ease: 'power3.out'
      });
    });

    /* Blog Hero */
    var blogHero = document.querySelector('.blog-hero');
    if (blogHero) {
      gsap.from('.blog-hero__eyebrow', {
        y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.1
      });
      gsap.from('.blog-hero__title', {
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.2
      });
      gsap.from('.blog-hero__sub', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.35
      });
      gsap.from('.blog-filter__pill', {
        y: 15, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.45
      });
    }

    /* Post Hero */
    var postHero = document.querySelector('.post-hero');
    if (postHero) {
      gsap.from('.post-hero__eyebrow', {
        y: 15, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.1
      });
      gsap.from('.post-hero__title', {
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.2
      });
      gsap.from('.post-hero__excerpt', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.3
      });
      gsap.from('.post-hero__meta', {
        y: 15, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.4
      });
      gsap.from('.post-hero__cover', {
        y: 25, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.5
      });
    }
  }

  /* ── Filter Pills — active state toggle ── */
  var pills = document.querySelectorAll('.blog-filter__pill');
  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      pills.forEach(function(p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
    });
  });
})();

/* ============================================
   BLOG POST — Sidebar TOC + Reading Time
   ============================================ */
(function initPostSidebar() {
  var body = document.querySelector('.post-body');
  var tocList = document.getElementById('tocList');
  var readingEl = document.getElementById('readingTime');
  var heroReadingEl = document.getElementById('heroReadingTime');
  if (!body || !tocList) return;

  // 1. Reading time (200 WPM average)
  var words = (body.textContent || '').trim().split(/\s+/).length;
  var minutes = Math.max(1, Math.round(words / 200));
  var readingText = minutes + ' Min Lesezeit';
  if (readingEl) readingEl.textContent = readingText;
  if (heroReadingEl) heroReadingEl.textContent = readingText;

  // 2. Build TOC from h2/h3
  var headings = body.querySelectorAll('h2, h3');
  if (!headings.length) return;

  headings.forEach(function(h, i) {
    if (!h.id) h.id = 'section-' + i;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = 'post-toc__link' +
      (h.tagName === 'H3' ? ' post-toc__link--h3' : '');
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // 3. Active heading via IntersectionObserver
  var links = tocList.querySelectorAll('.post-toc__link');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        links.forEach(function(l) { l.classList.remove('post-toc__link--active'); });
        var active = tocList.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('post-toc__link--active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

  headings.forEach(function(h) { observer.observe(h); });
})();

/* ============================================
   TRUTHS SECTION — GSAP SCROLL ANIMATION
   Drei Cards fliegen nacheinander ein,
   richten sich gerade aus und docken an.
   ============================================ */
(function initTruthsAnimation() {

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var cards = gsap.utils.toArray('.truths__card');
  if (!cards.length) return;

  // Mobile: keine Rotation, nur einfaches fade-up
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    cards.forEach(function(card) {
      gsap.from(card, {
        opacity: 0, y: 30, duration: 0.5, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
      });
    });
    return;
  }

  // Desktop: Einflug-Animation — jede Card kommt schräg rein und richtet sich gerade aus
  // Kein pin:true — verhindert den 1100px-freeze-Bug
  var startStates = [
    { x: -100, y: 50, rotation: -7, opacity: 0 },
    { x:    0, y: 70, rotation:  4, opacity: 0 },
    { x:  100, y: 50, rotation: -3, opacity: 0 }
  ];

  cards.forEach(function(card, i) {
    gsap.set(card, startStates[i]);

    gsap.to(card, {
      x: 0, y: 0, rotation: 0, opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      delay: i * 0.15,  // gestaffelt: Card 1 sofort, 2 nach 150ms, 3 nach 300ms
      scrollTrigger: {
        trigger: '.truths__stage',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  ScrollTrigger.refresh();

})();

/* ============================================
   BLOG PREVIEW — Card Reveal
   ============================================ */
(function initBlogPreview() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var blogCards = gsap.utils.toArray('.blog-preview__card');
  if (!blogCards.length) return;

  blogCards.forEach(function(card, i) {
    gsap.from(card, {
      opacity: 0, y: 40, duration: 0.6, delay: i * 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%' }
    });
  });
})();

/* ============================================
   SCROLLTRIGGER REFRESH
   ============================================ */
if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.refresh(); }
