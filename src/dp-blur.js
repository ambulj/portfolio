// Differential-privacy blur module (§10.6)
// Clicking "Roorkee, India" shows public city centroid coordinates with Laplace noise added.
// ε slider (0.1 - 5.0) controls scale: b = 1 / ε.
// Plots 50 sampled noisy points on an interactive SVG.
// Uses ONLY public city centroid (29.8543° N, 77.8880° E), never a precise location.

import { unlockSecret } from './secrets-manager.js';

const CITY_LAT = 29.8543;
const CITY_LON = 77.8880;

// Sample from standard Laplace distribution
function sampleLaplace(mu, b) {
  const u = Math.random() - 0.5;
  return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

export function initDpBlur() {
  const triggerBtn = document.getElementById('dp-trigger-btn');
  const modal = document.getElementById('dp-modal');
  const closeBtn = document.getElementById('dp-close-btn');
  const slider = document.getElementById('dp-epsilon-slider');
  const epsilonVal = document.getElementById('dp-epsilon-val');
  const svg = document.getElementById('dp-svg-plot');
  const summaryEl = document.getElementById('dp-sample-summary');

  if (!triggerBtn || !modal) return;

  function openModal() {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    unlockSecret('dp');
    renderPlot();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  const backdrop = document.getElementById('dp-modal-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  function renderPlot() {
    if (!svg || !slider) return;
    const epsilon = parseFloat(slider.value) || 1.0;
    if (epsilonVal) epsilonVal.textContent = epsilon.toFixed(1);

    // Scale b = 0.05 / epsilon (degrees)
    const b = 0.04 / epsilon;

    // Clear SVG
    svg.replaceChildren();

    const width = 400;
    const height = 240;
    const cx = width / 2;
    const cy = height / 2;

    // Grid lines
    const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridG.setAttribute('stroke', 'var(--rule)');
    gridG.setAttribute('stroke-width', '1');

    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', '20');
    hLine.setAttribute('y1', String(cy));
    hLine.setAttribute('x2', String(width - 20));
    hLine.setAttribute('y2', String(cy));
    gridG.appendChild(hLine);

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', String(cx));
    vLine.setAttribute('y1', '20');
    vLine.setAttribute('x2', String(cx));
    vLine.setAttribute('y2', String(height - 20));
    gridG.appendChild(vLine);
    svg.appendChild(gridG);

    // Centroid marker (Public reference)
    const centroid = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centroid.setAttribute('cx', String(cx));
    centroid.setAttribute('cy', String(cy));
    centroid.setAttribute('r', '5');
    centroid.setAttribute('fill', 'var(--mark)');
    svg.appendChild(centroid);

    const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerLabel.setAttribute('x', String(cx + 8));
    centerLabel.setAttribute('y', String(cy - 6));
    centerLabel.setAttribute('font-family', 'var(--font-mono)');
    centerLabel.setAttribute('font-size', '10');
    centerLabel.setAttribute('fill', 'var(--ink)');
    centerLabel.textContent = 'City Centroid';
    svg.appendChild(centerLabel);

    // Plot 50 noisy samples
    let sumDistKm = 0;
    for (let i = 0; i < 50; i++) {
      const noisyLat = sampleLaplace(CITY_LAT, b);
      const noisyLon = sampleLaplace(CITY_LON, b);

      const dLat = (noisyLat - CITY_LAT);
      const dLon = (noisyLon - CITY_LON);

      // Distance approx in km
      const distKm = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
      sumDistKm += distKm;

      // Coordinate mapping (scale factor 800)
      const px = cx + dLon * 1200;
      const py = cy - dLat * 1200;

      // Bound to viewBox
      if (px >= 10 && px <= width - 10 && py >= 10 && py <= height - 10) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', String(px));
        dot.setAttribute('cy', String(py));
        dot.setAttribute('r', '2.5');
        dot.setAttribute('fill', 'var(--ink)');
        dot.setAttribute('opacity', '0.6');
        svg.appendChild(dot);
      }
    }

    const meanDist = (sumDistKm / 50).toFixed(2);
    if (summaryEl) {
      summaryEl.textContent = `Mean perturbation radius: ±${meanDist} km under ε=${epsilon.toFixed(1)} Laplace mechanism.`;
    }
  }

  if (slider) {
    slider.addEventListener('input', renderPlot);
  }
}
