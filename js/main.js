'use strict';

// =============================================================
// 1. COPYRIGHT YEAR
// =============================================================
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============================================================
// 2. HEADER SCROLL SHADOW
// =============================================================
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// =============================================================
// 3. HAMBURGER MENU
// =============================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});

// Close nav when a link is clicked
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
});

// =============================================================
// 4. SCROLL SPY
// =============================================================
const navLinks = mainNav.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, {
  rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim()} 0px -60% 0px`,
  threshold: 0,
});

sections.forEach(section => spyObserver.observe(section));

// =============================================================
// 5. SCROLL REVEAL
// =============================================================
const revealEls = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Stagger app cards
const appCards = document.querySelectorAll('.app-card[data-reveal]');
appCards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

revealEls.forEach(el => revealObserver.observe(el));

// =============================================================
// 6. LIGHTBOX
// =============================================================
class Lightbox {
  constructor() {
    this.el        = document.getElementById('lightbox');
    this.backdrop  = document.getElementById('lightbox-backdrop');
    this.imgEl     = document.getElementById('lightbox-img');
    this.captionEl = document.getElementById('lightbox-caption');
    this.closeBtn  = document.getElementById('lightbox-close');
    this.prevBtn   = document.getElementById('lightbox-prev');
    this.nextBtn   = document.getElementById('lightbox-next');

    this.items     = [];
    this.current   = 0;
    this.prevFocus = null;

    this._bindEvents();
  }

  /** Collect all .gallery-item elements that have data-src (real photos, not placeholders) */
  _collectItems() {
    this.items = Array.from(
      document.querySelectorAll('.gallery-item[data-src]')
    );
  }

  _bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', () => this.navigate(-1));
    this.nextBtn.addEventListener('click', () => this.navigate(1));

    document.addEventListener('keydown', e => {
      if (!this.el.classList.contains('is-open')) return;
      if (e.key === 'Escape')      this.close();
      if (e.key === 'ArrowLeft')   this.navigate(-1);
      if (e.key === 'ArrowRight')  this.navigate(1);
    });

    // Attach click handlers to gallery items (delegated)
    document.getElementById('gallery-grid').addEventListener('click', e => {
      const item = e.target.closest('.gallery-item[data-src]');
      if (!item) return;
      this._collectItems();
      const index = this.items.indexOf(item);
      if (index !== -1) this.open(index);
    });
  }

  open(index) {
    this.current   = index;
    this.prevFocus = document.activeElement;

    this._load(index);

    this.el.classList.add('is-open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    this.closeBtn.focus();

    this._updateNav();
  }

  close() {
    this.el.classList.remove('is-open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (this.prevFocus) this.prevFocus.focus();
  }

  navigate(dir) {
    const next = this.current + dir;
    if (next < 0 || next >= this.items.length) return;
    this.current = next;
    this._load(this.current);
    this._updateNav();
  }

  _load(index) {
    const item    = this.items[index];
    const src     = item.dataset.src;
    const caption = item.dataset.caption || '';
    const imgAlt  = item.querySelector('img')?.alt || '';

    this.imgEl.src             = src;
    this.imgEl.alt             = imgAlt;
    this.captionEl.textContent = caption;
  }

  _updateNav() {
    this.prevBtn.style.visibility = this.current === 0 ? 'hidden' : 'visible';
    this.nextBtn.style.visibility = this.current === this.items.length - 1 ? 'hidden' : 'visible';
  }
}

// Only initialise if gallery exists
if (document.getElementById('gallery-grid')) {
  new Lightbox();
}

// =============================================================
// 7. GALLERY EXPAND
// =============================================================
const expandBtn  = document.getElementById('gallery-expand-btn');
const galleryMore = document.getElementById('gallery-more');

if (expandBtn && galleryMore) {
  expandBtn.addEventListener('click', () => {
    const isOpen = galleryMore.classList.toggle('is-open');
    expandBtn.setAttribute('aria-expanded', String(isOpen));
    galleryMore.setAttribute('aria-hidden', String(!isOpen));
    // Update label (last text node in button)
    const textNode = [...expandBtn.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = isOpen ? ' Show less' : ' Show more photos';
    // Trigger reveal observer on newly visible items
    if (isOpen) {
      galleryMore.querySelectorAll('[data-reveal]:not(.visible)').forEach(el => {
        revealObserver.observe(el);
      });
    }
  });
}
