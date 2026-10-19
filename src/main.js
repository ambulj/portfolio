// Main vanilla JavaScript bundle for Ambul Jaiswal's portfolio.
// Rules: No inline scripts, strict CSP compliance, textContent for all dynamic text, zero third-party CDNs.

(function () {
  'use strict';

  // --- 1. Reduce 3D Switch & Tier Detection (§4.5) ---
  const reduce3dBtn = document.getElementById('reduce-3d-toggle');
  const storedReduce3D = localStorage.getItem('reduce3d');
  let isReduce3D = storedReduce3D === 'true';

  function updateReduce3DButton() {
    if (reduce3dBtn) {
      reduce3dBtn.setAttribute('aria-pressed', isReduce3D ? 'true' : 'false');
      const label = reduce3dBtn.querySelector('.toggle-label');
      if (label) {
        label.textContent = isReduce3D ? '3D: off' : 'Reduce 3D';
      }
    }
  }
  updateReduce3DButton();

  if (reduce3dBtn) {
    reduce3dBtn.addEventListener('click', () => {
      isReduce3D = !isReduce3D;
      localStorage.setItem('reduce3d', isReduce3D ? 'true' : 'false');
      updateReduce3DButton();
      // Reload or refresh scene
      window.location.reload();
    });
  }

  // --- 2. Low FPS Notification Banner (§4.5) ---
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

  // --- 3. Scene Loader (Tier 0 vs Tier 1/2) ---
  const sceneContainer = document.getElementById('constellation-canvas-container');
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

  // --- 4. Email Reveal Handler (§8.1) ---
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

  // --- 5. Contact Panel Drawer (§5 & §8.1) ---
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

  openPanelBtns.forEach(btn => btn.addEventListener('click', openPanel));
  if (closePanelBtn) closePanelBtn.addEventListener('click', closePanel);

  if (panelOverlay) {
    panelOverlay.addEventListener('click', (e) => {
      if (e.target === panelOverlay) closePanel();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOverlay.classList.contains('open')) {
        closePanel();
      }
    });
  }

  // --- 6. Contact Form Submission (§8.1) ---
  function setupContactForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

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
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            message,
            turnstileToken
          })
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

  setupContactForm('contact-page-form');
  setupContactForm('contact-panel-form');

  // --- 7. Pinned Architecture Diagram Highlighting (§3.4) ---
  const sections = document.querySelectorAll('[data-arch-part]');
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const partNum = entry.target.getAttribute('data-arch-part');
            // Highlight part in diagram
            document.querySelectorAll('.diag-part').forEach((el) => {
              const part = el.getAttribute('data-part');
              const rect = el.querySelector('rect');
              if (rect) {
                if (part === partNum) {
                  rect.setAttribute('stroke', 'var(--mark)');
                  rect.setAttribute('stroke-width', '2.5');
                } else {
                  rect.setAttribute('stroke', 'var(--ink)');
                  rect.setAttribute('stroke-width', '1.5');
                }
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -50% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }
})();
