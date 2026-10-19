// Konami intrusion mode (§10.4)
// Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
// Rules:
// - Scene/viewport tints to --fault
// - Mock IDS anomaly log
// - Flashing rate strictly <= 3 Hz (steady 1 Hz pulse or static tint)
// - Disabled under prefers-reduced-motion
// - Escape exits
// - Unlocks secret 'konami'

import { unlockSecret } from './secrets-manager.js';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

let currentIndex = 0;
let isActive = false;

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initKonami() {
  const overlay = document.getElementById('konami-overlay');

  window.addEventListener('keydown', (e) => {
    if (isReducedMotion()) return;

    if (e.key === 'Escape' && isActive) {
      exitKonami();
      return;
    }

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expected = KONAMI_CODE[currentIndex].length === 1
      ? KONAMI_CODE[currentIndex].toLowerCase()
      : KONAMI_CODE[currentIndex];

    if (key === expected) {
      currentIndex++;
      if (currentIndex === KONAMI_CODE.length) {
        currentIndex = 0;
        triggerKonami();
      }
    } else {
      currentIndex = (key === 'ArrowUp') ? 1 : 0;
    }
  });

  function triggerKonami() {
    isActive = true;
    unlockSecret('konami');
    document.body.classList.add('konami-active');

    if (overlay) {
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
    }
  }

  function exitKonami() {
    isActive = false;
    document.body.classList.remove('konami-active');
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  const closeBtn = document.getElementById('konami-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', exitKonami);
  }
}
