// Population Stability Index (PSI) Drift Simulator for Inferyx (§10.8)
// Reference distribution vs shifted live distribution.
// Live PSI over 10 bins with warning (0.10) and critical (0.25) thresholds.

import { unlockSecret } from './secrets-manager.js';

// Normal PDF function
function normalPdf(x, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

export function initDriftSlider() {
  const container = document.getElementById('drift-slider-container');
  if (!container) return;

  const slider = document.getElementById('drift-shift-slider');
  const shiftValEl = document.getElementById('drift-shift-val');
  const psiValEl = document.getElementById('drift-psi-val');
  const statusEl = document.getElementById('drift-status-badge');
  const svg = document.getElementById('drift-svg-chart');

  if (!slider || !svg) return;

  function calculateAndRender() {
    const shift = parseFloat(slider.value) || 0.0;
    if (shiftValEl) shiftValEl.textContent = shift.toFixed(2);

    // 10 bins from -3.0 to +3.0 (step 0.6)
    const bins = 10;
    const minX = -3.0;
    const maxX = 3.0;
    const binWidth = (maxX - minX) / bins;

    let refProbs = [];
    let liveProbs = [];

    let refSum = 0;
    let liveSum = 0;

    for (let i = 0; i < bins; i++) {
      const mid = minX + (i + 0.5) * binWidth;
      const refVal = normalPdf(mid, 0.0, 1.0);
      const liveVal = normalPdf(mid, shift, 1.0 + shift * 0.2);
      refProbs.push(refVal);
      liveProbs.push(liveVal);
      refSum += refVal;
      liveSum += liveVal;
    }

    // Normalize
    refProbs = refProbs.map(p => Math.max(p / refSum, 0.0001));
    liveProbs = liveProbs.map(p => Math.max(p / liveSum, 0.0001));

    // Calculate PSI
    let psi = 0;
    for (let i = 0; i < bins; i++) {
      const actual = liveProbs[i];
      const expected = refProbs[i];
      psi += (actual - expected) * Math.log(actual / expected);
    }

    if (psiValEl) psiValEl.textContent = psi.toFixed(3);

    // Threshold classification
    if (statusEl) {
      if (psi < 0.10) {
        statusEl.className = 'status-badge-live';
        statusEl.textContent = 'Stable (PSI < 0.10)';
      } else if (psi < 0.25) {
        statusEl.className = 'status-badge-slow';
        statusEl.textContent = 'Moderate Drift Warning (PSI ≥ 0.10)';
        unlockSecret('drift');
      } else {
        statusEl.className = 'status-badge-fault';
        statusEl.textContent = 'Critical Drift Alert (PSI ≥ 0.25)';
        unlockSecret('drift');
      }
    }

    // Render bar chart comparison in SVG
    svg.replaceChildren();

    const chartW = 500;
    const chartH = 180;
    const barWidth = 18;
    const gap = 12;

    for (let i = 0; i < bins; i++) {
      const groupX = 30 + i * (barWidth * 2 + gap);

      // Reference bar (Ink)
      const refH = refProbs[i] * 400;
      const refRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      refRect.setAttribute('x', String(groupX));
      refRect.setAttribute('y', String(chartH - 25 - refH));
      refRect.setAttribute('width', String(barWidth));
      refRect.setAttribute('height', String(refH));
      refRect.setAttribute('fill', 'var(--quiet)');
      refRect.setAttribute('opacity', '0.5');
      svg.appendChild(refRect);

      // Live bar (Mark)
      const liveH = liveProbs[i] * 400;
      const liveRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      liveRect.setAttribute('x', String(groupX + barWidth + 2));
      liveRect.setAttribute('y', String(chartH - 25 - liveH));
      liveRect.setAttribute('width', String(barWidth));
      liveRect.setAttribute('height', String(liveH));
      liveRect.setAttribute('fill', psi >= 0.25 ? 'var(--fault)' : 'var(--mark)');
      svg.appendChild(liveRect);

      // Bin label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(groupX + barWidth));
      label.setAttribute('y', String(chartH - 8));
      label.setAttribute('font-family', 'var(--font-mono)');
      label.setAttribute('font-size', '9');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--quiet)');
      label.textContent = `B${i + 1}`;
      svg.appendChild(label);
    }
  }

  slider.addEventListener('input', calculateAndRender);
  calculateAndRender();
}
