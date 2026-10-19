import { initRouter } from './router.js';
import { initCustomCursor } from './cursor.js';
import { initSound, shiftAmbientPitch } from './sound.js';
import { initDiagramHighlighting } from './diagram-highlight.js';
import { initGitHubFeed } from './github.js';
import { initSecurityCheck } from './security-check.js';
import { initSecretsManager, unlockSecret } from './secrets-manager.js';
import { initTerminal } from './terminal.js';
import { initKonami } from './konami.js';
import { initTamperChain } from './tamper-chain.js';
import { initDpBlur } from './dp-blur.js';
import { initAnomalyHunt } from './anomaly-hunt.js';
import { initDriftSlider } from './drift-slider.js';

// --- 1. Reduce 3D Switch & Tier Detection (§4.5) ---
let isReduce3D = localStorage.getItem('reduce3d') === 'true';

function updateReduce3DButton() {
  const reduce3dBtn = document.getElementById('reduce-3d-toggle');
  if (reduce3dBtn) {
    reduce3dBtn.setAttribute('aria-pressed', isReduce3D ? 'true' : 'false');
    const label = reduce3dBtn.querySelector('.toggle-label');
    if (label) {
      label.textContent = isReduce3D ? '3D: off' : 'Reduce 3D';
    }
  }
}

function initReduce3D() {
  updateReduce3DButton();
  const reduce3dBtn = document.getElementById('reduce-3d-toggle');
  if (reduce3dBtn) {
    reduce3dBtn.addEventListener('click', () => {
      isReduce3D = !isReduce3D;
      localStorage.setItem('reduce3d', isReduce3D ? 'true' : 'false');
      updateReduce3DButton();
      window.location.reload();
    });
  }
}

// Low FPS Notification Banner (§4.5)
window.addEventListener('constellation:low-fps', () => {
  if (document.getElementById('low-fps-banner') || isReduce3D) return;
  const banner = document.createElement('div');
  banner.id = 'low-fps-banner';
  banner.className = 'status-strip banner-notice';

  const msg = document.createElement('span');
  msg.textContent = 'Frame rate dropped. Switch to 2D technical diagram? ';

  const actBtn = document.createElement('button');
  actBtn.type = 'button';
  actBtn.className = 'btn ml-2';
  actBtn.textContent = 'Reduce 3D';
  actBtn.addEventListener('click', () => {
    isReduce3D = true;
    localStorage.setItem('reduce3d', 'true');
    window.location.reload();
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn ml-1';
  closeBtn.textContent = 'Dismiss';
  closeBtn.addEventListener('click', () => banner.remove());

  banner.appendChild(msg);
  banner.appendChild(actBtn);
  banner.appendChild(closeBtn);

  const nav = document.querySelector('.site-nav');
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(banner, nav);
  }
});

// --- 2. Persistent 3D Scene Loader (Tier 0 vs Tier 1/2) ---
function initScene() {
  const sceneContainer = document.getElementById('constellation-canvas-container') || document.getElementById('global-scene-container');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.innerWidth >= 1024;

  const hasWebGL2 = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  })();

  const isTier0 = !isDesktop || prefersReducedMotion || isReduce3D || !hasWebGL2;

  if (sceneContainer) {
    if (isTier0) {
      // Tier 0: keep static SVG fallback, do not load Three.js
      const fallback = document.getElementById('constellation-static-fallback');
      if (fallback) fallback.classList.remove('hidden');
    } else {
      // Fetch graph data and lazy load Three.js scene chunk
      const graphUrl = '/assets/graph.json';
      fetch(graphUrl)
        .then(r => r.json())
        .then(graphData => {
          import('/assets/scene.js')
            .then(mod => {
              const fallback = document.getElementById('constellation-static-fallback');
              if (fallback) fallback.classList.add('hidden');
              mod.initConstellation(sceneContainer, graphData, {
                activeSlug: sceneContainer.getAttribute('data-active-slug') || 'inferyx'
              });
            })
            .catch(err => {
              console.warn('Failed to load scene chunk, retaining fallback:', err);
            });
        })
        .catch(err => console.warn('Could not load graph data:', err));
    }
  }
}

// --- 3. Page Components Initializer ---
function setupEmailReveal() {
  const revealBtn = document.getElementById('reveal-email-btn');
  const revealedContainer = document.getElementById('revealed-email');

  if (revealBtn && revealedContainer) {
    revealBtn.addEventListener('click', () => {
      const u = revealBtn.getAttribute('data-u');
      const d = revealBtn.getAttribute('data-d');
      if (u && d) {
        const full = `${u}@${d}`;
        revealedContainer.textContent = '';
        const mailLink = document.createElement('a');
        mailLink.href = `mailto:${full}`;
        mailLink.textContent = full;
        revealedContainer.appendChild(mailLink);
        revealBtn.classList.add('hidden');
      }
    });
  }
}

function setupContactPanel() {
  const openPanelBtns = document.querySelectorAll('[data-action="open-contact-panel"]');
  const panelOverlay = document.getElementById('contact-panel-overlay');
  const closePanelBtn = document.getElementById('close-contact-panel');

  function openPanel() {
    if (panelOverlay) {
      panelOverlay.classList.add('open');
      panelOverlay.setAttribute('aria-hidden', 'false');
      const firstInput = panelOverlay.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }

  function closePanel() {
    if (panelOverlay) {
      panelOverlay.classList.remove('open');
      panelOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  openPanelBtns.forEach(btn => {
    btn.removeEventListener('click', openPanel);
    btn.addEventListener('click', openPanel);
  });

  if (closePanelBtn) {
    closePanelBtn.removeEventListener('click', closePanel);
    closePanelBtn.addEventListener('click', closePanel);
  }

  if (panelOverlay) {
    panelOverlay.addEventListener('click', (e) => {
      if (e.target === panelOverlay) closePanel();
    });
  }
}

function setupContactForm(formId) {
  const form = document.getElementById(formId);
  if (!form || form.dataset.initialized === 'true') return;
  form.dataset.initialized = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusBox = form.querySelector('.form-status');
    if (statusBox) statusBox.textContent = '';

    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const messageInput = form.querySelector('[name="message"]');
    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    const turnstileToken = turnstileInput ? turnstileInput.value : '';

    if (!name || !email || !message) {
      if (statusBox) {
        statusBox.className = 'form-status form-error';
        statusBox.textContent = 'Please fill in name, email, and message.';
      }
      return;
    }

    if (message.length > 2000) {
      if (statusBox) {
        statusBox.className = 'form-status form-error';
        statusBox.textContent = 'Message exceeds the 2,000 character limit.';
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, turnstileToken })
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        form.reset();
        if (statusBox) {
          statusBox.className = 'form-status form-success';
          statusBox.textContent = data.message || 'Message sent. Thank you.';
        }
      } else {
        if (statusBox) {
          statusBox.className = 'form-status form-error';
          statusBox.textContent = data.error || 'Failed to deliver message. Please try again.';
        }
      }
    } catch (err) {
      if (statusBox) {
        statusBox.className = 'form-status form-error';
        statusBox.textContent = 'Network error while sending message. Please try again.';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initPageInteractions(pathname = window.location.pathname) {
  setupEmailReveal();
  setupContactPanel();
  setupContactForm('contact-page-form');
  setupContactForm('contact-panel-form');
  initDiagramHighlighting();
  initSecurityCheck();
  initGitHubFeed();
  initTamperChain();
  initDpBlur();
  initAnomalyHunt();
  initDriftSlider();

  if (pathname === '/colophon' || pathname.endsWith('/colophon')) {
    unlockSecret('colophon');
  }
}

// Global escape key listener for panel
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const panelOverlay = document.getElementById('contact-panel-overlay');
    if (panelOverlay && panelOverlay.classList.contains('open')) {
      panelOverlay.classList.remove('open');
      panelOverlay.setAttribute('aria-hidden', 'true');
    }
  }
});

// Scroll listener for subtle ambient pitch shift (§9.3)
window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    const progress = window.scrollY / maxScroll;
    shiftAmbientPitch(progress);
  }
}, { passive: true });

// --- 4. Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initSecretsManager();
  initReduce3D();
  initScene();
  initCustomCursor();
  initSound();
  initTerminal();
  initKonami();
  initRouter([initPageInteractions]);
  initPageInteractions();
});

