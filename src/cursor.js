// Custom cursor module
// Rules: Only active under (pointer: fine) and not prefers-reduced-motion.
// Never hide native cursor until custom cursor has rendered and moved.
// Restore native cursor on touch, over form fields/terminal, visibilitychange, mouseleave, or error.

export function initCustomCursor() {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isFinePointer || isReducedMotion) {
    // Native cursor remains active
    return;
  }

  let cursorEl = document.getElementById('custom-cursor');
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.id = 'custom-cursor';
    cursorEl.className = 'custom-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorEl);
  }

  let mouseX = -100;
  let mouseY = -100;
  let targetX = -100;
  let targetY = -100;
  let isRendered = false;
  let isNativeRestored = false;
  let rafId = null;

  function restoreNativeCursor() {
    isNativeRestored = true;
    document.documentElement.classList.remove('has-custom-cursor');
    if (cursorEl) {
      cursorEl.style.display = 'none';
    }
  }

  function activateCustomCursor() {
    if (!isFinePointer || isReducedMotion) return;
    isNativeRestored = false;
    document.documentElement.classList.add('has-custom-cursor');
    if (cursorEl) {
      cursorEl.style.display = 'block';
    }
  }

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!isRendered) {
      isRendered = true;
      mouseX = targetX;
      mouseY = targetY;
      activateCustomCursor();
    }

    if (isNativeRestored) {
      activateCustomCursor();
    }

    // Inspect hovered element
    const target = e.target;
    if (!target) return;

    // Check if over form fields, inputs, textareas, selects, or terminal
    const isFormField = target.closest('input, textarea, select, button[type="submit"], [contenteditable="true"], .terminal, #terminal-container');
    if (isFormField) {
      cursorEl.classList.add('cursor-hidden');
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    } else {
      cursorEl.classList.remove('cursor-hidden');
      document.documentElement.classList.add('has-custom-cursor');
    }

    // Check if over links, buttons, interactive nodes
    const isInteractive = target.closest('a, button, [role="button"], summary, .diag-part, .toggle-switch, .index-list a');
    if (isInteractive) {
      cursorEl.classList.add('cursor-hover');
      cursorEl.classList.remove('cursor-text');
      return;
    } else {
      cursorEl.classList.remove('cursor-hover');
    }

    // Check if over textual paragraphs / content
    const isText = target.closest('p, h1, h2, h3, h4, li, td, th, blockquote, .hero-opening-line');
    if (isText) {
      cursorEl.classList.add('cursor-text');
    } else {
      cursorEl.classList.remove('cursor-text');
    }
  }, { passive: true });

  // Update cursor position with RAF
  function render() {
    if (isRendered && !isNativeRestored && cursorEl) {
      // Smooth subtle interpolation
      mouseX += (targetX - mouseX) * 0.45;
      mouseY += (targetY - mouseY) * 0.45;
      cursorEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
    rafId = requestAnimationFrame(render);
  }
  render();

  // Restore native cursor on mouseleave
  document.addEventListener('mouseleave', () => {
    restoreNativeCursor();
  });

  // Restore native cursor on visibilitychange
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      restoreNativeCursor();
    }
  });

  // Handle window blur/error
  window.addEventListener('blur', () => {
    restoreNativeCursor();
  });

  window.addEventListener('error', () => {
    restoreNativeCursor();
    if (rafId) cancelAnimationFrame(rafId);
  });

  // Listen to media queries
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      restoreNativeCursor();
    }
  });
}
