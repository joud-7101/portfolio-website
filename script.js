/* =============================================
   SCRIPT.JS — Portfolio Interactions
   ============================================= */

// ── Image Carousels
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track   = carousel.querySelector('.carousel-track');
    const slides  = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-btn--prev');
    const nextBtn = carousel.querySelector('.carousel-btn--next');
    const dotsWrap = carousel.querySelector('.carousel-dots');

    if (!slides.length) return;

    let current = 0;
    let timer;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function startAuto() {
      timer = setInterval(() => goTo(current + 1), 4000);
    }
    function stopAuto() { clearInterval(timer); }

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current + 1); startAuto(); });

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Touch / swipe support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });

    startAuto();
  });
}

initCarousels();


// ── Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Intersection Observer for scroll animations
const animatedEls = document.querySelectorAll('.process-item, .project-card, .testi-card, .cert-card, .skill-group');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement.children);
      const index = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

animatedEls.forEach(el => {
  // Make cert-card and skill-group start hidden
  if (el.classList.contains('cert-card') || el.classList.contains('skill-group')) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  }
  observer.observe(el);
});

// Visible class also handles cert-card / skill-group
document.querySelectorAll('.cert-card.visible, .skill-group.visible').forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
});

// Override: add visible via observer for cert/skill
const styleObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 120);
      styleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cert-card, .skill-group').forEach(el => styleObserver.observe(el));

// ── Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--text)';
        }
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

// ── Lightbox
(function () {
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightbox-img');
  const lbCounter  = document.getElementById('lightbox-counter');
  const lbClose    = document.getElementById('lightbox-close');
  const lbBackdrop = document.getElementById('lightbox-backdrop');
  const lbPrev     = document.getElementById('lightbox-prev');
  const lbNext     = document.getElementById('lightbox-next');

  let images  = [];  // array of { src, alt } for the active carousel
  let current = 0;

  function openLightbox(imgs, idx) {
    images  = imgs;
    current = idx;
    showImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage() {
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src       = images[current].src;
      lbImg.alt       = images[current].alt;
      lbCounter.textContent = (current + 1) + ' / ' + images.length;
      lbImg.style.opacity = '1';
    }, 120);
    lbImg.style.transition = 'opacity 0.18s ease';
  }

  function prev() { current = (current - 1 + images.length) % images.length; showImage(); }
  function next() { current = (current + 1) % images.length; showImage(); }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Touch swipe inside lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  }, { passive: true });

  // Attach click-to-open on every carousel
  document.querySelectorAll('.carousel').forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const overlay = carousel.closest('.project-img-wrap').querySelector('.project-overlay--zoom');

    // Build image list once
    const imgList = Array.from(slides).map(img => ({ src: img.src, alt: img.alt }));

    // Click on the overlay (or anywhere on the carousel) to open lightbox
    // We track which slide is current from the data-carousel-current attribute
    function getCurrentIdx() {
      const track = carousel.querySelector('.carousel-track');
      const tx = track.style.transform;
      const match = tx.match(/-?([\d.]+)%/);
      if (!match) return 0;
      return Math.round(parseFloat(match[1]) / 100);
    }

    carousel.addEventListener('click', (e) => {
      // Don't trigger if user clicked a carousel button/dot
      if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dots')) return;
      openLightbox(imgList, getCurrentIdx());
    });

    if (overlay) {
      overlay.style.cursor = 'zoom-in';
    }
  });
})();

// ── Contact form
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      formSuccess.style.display = 'flex';
      formSuccess.style.flexDirection = 'column';
      formSuccess.style.alignItems = 'center';
    }, 1200);
  });
}

// ── Cursor glow (desktop only)
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,92,191,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.18s ease, top 0.18s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ── Parallax stars on hero
const stars = document.querySelectorAll('.star');
window.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  stars.forEach((star, i) => {
    const speed = (i % 3 + 1) * 6;
    star.style.transform = `translate(${dx * speed}px, ${dy * speed}px)`;
  });
}, { passive: true });
