/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initScrollReveal();
  initXpBar();
  initChatButton();
  initExperienceMap();
  initPillNav();
  initTcpPacket();
});

/* ============================================
   HERO ENTRANCE
   ============================================ */
function initHero() {
  const content = document.getElementById('heroContent');
  const label   = document.getElementById('heroLabel');

  // Trigger hero entrance after short delay
  setTimeout(() => {
    content && content.classList.add('in');
  }, 200);

  setTimeout(() => {
    label && label.classList.add('in');
  }, 500);
}

/* ============================================
   SCROLL REVEAL  (IntersectionObserver)
   ============================================ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

/* ============================================
   XP BAR — fills when character card scrolls into view
   ============================================ */
function initXpBar() {
  const bar = document.getElementById('xpBar');
  if (!bar) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bar.classList.add('filled');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(bar);
}

/* ============================================
   CHAT BUTTON — entrance after page load
   ============================================ */
function initChatButton() {
  const btn = document.getElementById('chatBtn');
  if (!btn) return;

  setTimeout(() => {
    btn.classList.add('visible');
  }, 1800);

  btn.addEventListener('click', () => {
    window.location.href = 'mailto:contact@udayveersingh.in';
  });
}

/* ============================================
   EXPERIENCE MAP — stop click interaction
   ============================================ */
function initExperienceMap() {
  // map stop id → card id
  const stopToCard = {
    vaishnavi:  'cardVaishnavi',
    avyukta19:  'cardAvyukta19',
    avyukta20:  'cardAvyukta20',
    avyukta21:  'cardAvyukta21',
    avyuktaTH:  'cardAvyuktaTH',
    mystery:    null,
  };

  // Activate a stop (highlight card + map stop)
  window.activateStop = function(stopId) {
    // Clear all active states
    document.querySelectorAll('.map-stop-btn').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.exp-card').forEach(el => el.style.outline = '');

    // Activate clicked stop
    const stopEl = document.getElementById('stop' + capitalize(stopId));
    if (stopEl) stopEl.classList.add('active');

    // Highlight corresponding card
    const cardId = stopToCard[stopId];
    if (cardId) {
      const card = document.getElementById(cardId);
      if (card) {
        card.style.outline = '2px solid rgba(139,111,71,0.5)';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Auto-activate current role on load
  setTimeout(() => activateStop('avyuktaTH'), 1200);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ============================================
   PILL NAV — show on scroll + active section
   ============================================ */
function initPillNav() {
  const nav = document.getElementById('pillNav');
  if (!nav) return;

  const links = nav.querySelectorAll('a');
  const hero  = document.querySelector('.hero');

  // Show nav after scrolling past ~60% of hero height
  window.addEventListener('scroll', () => {
    const threshold = hero ? hero.offsetHeight * 0.6 : window.innerHeight * 0.6;
    nav.classList.toggle('visible', window.scrollY > threshold);
  }, { passive: true });

  // Track active section with IntersectionObserver
  const sectionIds = ['about', 'experience', 'projects', 'cta'];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-10% 0px -50% 0px' }
  );

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ============================================
   TCP PACKET — moves along trail on scroll
   ============================================ */
function initTcpPacket() {
  const section    = document.getElementById('experience');
  const trailPath  = document.getElementById('expTrailPath');
  const trailGlow  = document.getElementById('expTrailGlow');
  const packet     = document.getElementById('tcpPacket');
  if (!section || !trailPath || !packet) return;

  const totalLength = trailPath.getTotalLength();

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    // 0 when section top hits viewport top, 1 when section scrolls fully past
    const progress = Math.max(0, Math.min(1, -rect.top / section.offsetHeight));

    const traveled = progress * totalLength;
    const pt  = trailPath.getPointAtLength(traveled);
    const epsilon = Math.min(4, totalLength * 0.01);
    const ptB = trailPath.getPointAtLength(Math.min(traveled + epsilon, totalLength));
    const angle = Math.atan2(ptB.y - pt.y, ptB.x - pt.x) * (180 / Math.PI);

    packet.setAttribute('transform',
      `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);

    // Golden highlight for traveled portion of trail
    if (trailGlow) {
      trailGlow.setAttribute('stroke-dasharray', `${traveled.toFixed(1)} ${totalLength + 10}`);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================
   SMOOTH ANCHOR SCROLL (for "venture forth")
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================
   PARALLAX — subtle hero depth on scroll
   ============================================ */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const landscape = document.querySelector('.hero-landscape');
      const moon      = document.querySelector('.moon');
      const heroContent = document.querySelector('.hero-content');

      if (landscape)   landscape.style.transform   = `translateY(${scrollY * 0.22}px)`;
      if (moon)        moon.style.transform         = `translateY(${scrollY * 0.08}px)`;
      if (heroContent) heroContent.style.transform  = `translateY(${scrollY * 0.12}px)`;

      ticking = false;
    });
    ticking = true;
  }
});

/* ============================================
   ACHIEVEMENT BADGE — tooltip on hover
   ============================================ */
document.querySelectorAll('.ach-badge').forEach(badge => {
  badge.addEventListener('mouseenter', function() {
    this.querySelector('.ach-ring').style.transform = 'scale(1.12)';
  });
  badge.addEventListener('mouseleave', function() {
    this.querySelector('.ach-ring').style.transform = '';
  });
});

/* ============================================
   CONNECT CARDS — ripple effect
   ============================================ */
document.querySelectorAll('.connect-card').forEach(card => {
  card.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      top:${e.clientY - rect.top - size/2}px;
      left:${e.clientX - rect.left - size/2}px;
      background:rgba(0,0,0,0.06);
      border-radius:50%;
      transform:scale(0);
      animation:ripple 0.5s linear;
      pointer-events:none;
    `;
    if (!this.style.position || this.style.position === 'static') {
      this.style.position = 'relative';
    }
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* Add ripple keyframe */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

/* ============================================
   CURSOR GLOW on hero (subtle effect)
   ============================================ */
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  });
}

/* ============================================
   SKILL CHIP — pause marquee on hover
   ============================================ */
const marqueeTrack = document.querySelector('.skills-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* ============================================
   EXPERIENCE CARD — keyboard accessibility
   ============================================ */
document.querySelectorAll('.map-stop-btn').forEach(stop => {
  stop.setAttribute('role', 'button');
  stop.setAttribute('tabindex', '0');
  stop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const stopId = stop.getAttribute('data-stop');
      if (stopId) activateStop(stopId);
    }
  });
});

/* ============================================
   FOOTER — embers on scroll into view
   ============================================ */
const footer = document.querySelector('footer');
if (footer) {
  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          spawnEmbers(footer);
          footerObserver.unobserve(footer);
        }
      });
    },
    { threshold: 0.3 }
  );
  footerObserver.observe(footer);
}

function spawnEmbers(container) {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const ember = document.createElement('div');
      const size = Math.random() * 3 + 2;
      const left = 35 + Math.random() * 30; // Center area
      ember.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${left}%;
        bottom:60px;
        border-radius:50%;
        background:#FFB800;
        box-shadow:0 0 6px 2px rgba(255,184,0,0.4);
        opacity:0.9;
        animation:ember-rise ${4 + Math.random() * 3}s ease-out forwards;
        pointer-events:none;
        z-index:1;
      `;
      container.appendChild(ember);
      setTimeout(() => ember.remove(), 7000);
    }, i * 600);
  }
}
