// Client-side Navigation with View Transitions & Persistent Canvas (§9.1)
// Rules:
// - Intercepts same-origin <a> clicks
// - Swaps <main>, updates <title>, moves focus to new <h1> (tabindex -1)
// - Announces title in #route-announcer (aria-live="polite")
// - Canvas lives outside <main> and is never torn down
// - Entering/leaving a case study triggers 2px --mark wipe line (350ms), unless reduced-motion
// - View Transitions API where supported, instant swap on prefers-reduced-motion
// - popstate listener for back/forward navigation

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCaseStudyRoute(pathname) {
  const clean = pathname.replace(/\/$/, '') || '/';
  return clean.startsWith('/work/') || clean === '/lab';
}

function triggerWipeLine() {
  if (isReducedMotion()) return;
  const wipeEl = document.getElementById('wipe-line');
  if (!wipeEl) return;

  wipeEl.classList.remove('animate-wipe');
  // force reflow
  void wipeEl.offsetWidth;
  wipeEl.classList.add('animate-wipe');
  setTimeout(() => {
    wipeEl.classList.remove('animate-wipe');
  }, 400);
}

export function initRouter(onRouteChangeCallbacks = []) {
  // Intercept all same-origin link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check special links
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.defaultPrevented
    ) {
      return;
    }

    // Must be same origin
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;

    // Don't re-navigate to identical route
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      if (url.hash) return; // Allow anchor scrolling
      e.preventDefault();
      return;
    }

    e.preventDefault();
    navigate(url.pathname + url.search + url.hash, true);
  });

  // Handle browser back and forward
  window.addEventListener('popstate', () => {
    navigate(window.location.pathname + window.location.search + window.location.hash, false);
  });

  async function navigate(targetUrl, pushState = true) {
    const currentPath = window.location.pathname;
    const targetPath = new URL(targetUrl, window.location.origin).pathname;

    // Check case study entry/exit for the wipe line
    const fromCaseStudy = isCaseStudyRoute(currentPath);
    const toCaseStudy = isCaseStudyRoute(targetPath);
    if ((fromCaseStudy !== toCaseStudy) || (fromCaseStudy && toCaseStudy && currentPath !== targetPath)) {
      triggerWipeLine();
    }

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        window.location.href = targetUrl;
        return;
      }

      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const newMain = doc.querySelector('main#main-content');
      const currentMain = document.querySelector('main#main-content');
      const newTitle = doc.title || document.title;

      if (!newMain || !currentMain) {
        window.location.href = targetUrl;
        return;
      }

      const updateDom = () => {
        // Swap content
        currentMain.innerHTML = newMain.innerHTML;
        document.title = newTitle;

        if (pushState) {
          history.pushState(null, '', targetUrl);
        }

        // Update nav active states
        updateNavLinks(targetPath);

        // Update persistent scene mode and dimming
        updateSceneContainer(targetPath);

        // CRITICAL A11Y: Move focus to the new <h1> and announce title
        const newH1 = currentMain.querySelector('h1');
        if (newH1) {
          newH1.setAttribute('tabindex', '-1');
          newH1.focus();
        }

        const announcer = document.getElementById('route-announcer');
        if (announcer) {
          announcer.textContent = newTitle;
        }

        // Window scroll to top
        window.scrollTo(0, 0);

        // Notify scene and page callbacks
        window.dispatchEvent(new CustomEvent('portfolio:routechange', {
          detail: { path: targetPath }
        }));

        onRouteChangeCallbacks.forEach(cb => {
          try { cb(targetPath); } catch (err) { console.warn('[router] Callback error:', err); }
        });
      };

      // Use View Transitions API if supported and not reduced motion
      if (document.startViewTransition && !isReducedMotion()) {
        document.startViewTransition(() => {
          updateDom();
        });
      } else {
        updateDom();
      }
    } catch (err) {
      console.warn('[router] Navigation fetch failed, falling back to full reload:', err);
      window.location.href = targetUrl;
    }
  }
}

function updateNavLinks(pathname) {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === pathname || (href !== '/' && pathname.startsWith(href))) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateSceneContainer(pathname) {
  const container = document.getElementById('constellation-canvas-container') || document.getElementById('global-scene-container');
  if (!container) return;

  const isHome = pathname === '/' || pathname === '';
  const isCase = isCaseStudyRoute(pathname);

  if (isHome) {
    container.classList.remove('scene-dimmed');
    container.classList.add('scene-home');
  } else if (isCase) {
    container.classList.add('scene-dimmed');
    container.classList.remove('scene-home');
  } else {
    container.classList.remove('scene-home');
    container.classList.add('scene-dimmed');
  }
}
