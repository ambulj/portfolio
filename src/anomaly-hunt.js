// Anomaly hunt widget for AI Threat Detection (§10.7)
// Seeded scatter of 200 points with 6 true outliers.
// Visitor clicks suspected anomalies; reveals Isolation Forest score.

import { unlockSecret } from './secrets-manager.js';

// Seeded pseudorandom generator for deterministic reproducible scatter
function createRng(seed = 42) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function initAnomalyHunt() {
  const container = document.getElementById('anomaly-hunt-container');
  if (!container) return;

  const svg = document.getElementById('anomaly-hunt-svg');
  const statusEl = document.getElementById('anomaly-hunt-status');
  if (!svg || !statusEl) return;

  const rng = createRng(1337);
  const points = [];
  const width = 600;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;

  // Generate 194 normal flow points (clustered around center)
  for (let i = 0; i < 194; i++) {
    const u1 = rng();
    const u2 = rng();
    const radius = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * 40;
    const theta = 2.0 * Math.PI * u2;
    const x = cx + radius * Math.cos(theta);
    const y = cy + radius * Math.sin(theta);
    points.push({ x, y, isAnomaly: false, score: (0.15 + rng() * 0.25).toFixed(2), clicked: false });
  }

  // Generate 6 distinct outlier points
  const outliers = [
    { x: 50, y: 45, isAnomaly: true, score: '0.89', clicked: false },
    { x: 540, y: 55, isAnomaly: true, score: '0.94', clicked: false },
    { x: 60, y: 260, isAnomaly: true, score: '0.91', clicked: false },
    { x: 530, y: 245, isAnomaly: true, score: '0.87', clicked: false },
    { x: 290, y: 25, isAnomaly: true, score: '0.84', clicked: false },
    { x: 310, y: 280, isAnomaly: true, score: '0.86', clicked: false }
  ];
  points.push(...outliers);

  let outliersCaught = 0;

  function render() {
    svg.replaceChildren();

    // Border
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    border.setAttribute('width', String(width));
    border.setAttribute('height', String(height));
    border.setAttribute('fill', 'var(--paper)');
    border.setAttribute('stroke', 'var(--rule)');
    border.setAttribute('stroke-width', '1');
    svg.appendChild(border);

    // Crosshairs
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', '0');
    hLine.setAttribute('y1', String(cy));
    hLine.setAttribute('x2', String(width));
    hLine.setAttribute('y2', String(cy));
    hLine.setAttribute('stroke', 'var(--rule)');
    svg.appendChild(hLine);

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', String(cx));
    vLine.setAttribute('y1', '0');
    vLine.setAttribute('x2', String(cx));
    vLine.setAttribute('y2', String(height));
    vLine.setAttribute('stroke', 'var(--rule)');
    svg.appendChild(vLine);

    points.forEach((p, idx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x.toFixed(1));
      circle.setAttribute('cy', p.y.toFixed(1));
      circle.setAttribute('r', p.clicked ? '6' : '3.5');

      if (p.isAnomaly) {
        circle.classList.add('scatter-anomaly');
      }
      circle.classList.add('scatter-point');

      if (!p.clicked) {
        circle.setAttribute('fill', 'var(--ink)');
        circle.setAttribute('opacity', '0.6');
      } else if (p.isAnomaly) {
        circle.setAttribute('fill', 'var(--fault)');
        circle.setAttribute('stroke', 'var(--ink)');
        circle.setAttribute('stroke-width', '1.5');
      } else {
        circle.setAttribute('fill', 'var(--quiet)');
        circle.setAttribute('opacity', '0.3');
      }

      circle.addEventListener('click', () => {
        if (!p.clicked) {
          p.clicked = true;
          if (p.isAnomaly) {
            outliersCaught++;
            unlockSecret('anomaly');
            statusEl.textContent = `Anomaly detected! Score: ${p.score} (threshold: 0.60). ${outliersCaught} of 6 outliers flagged.`;
          } else {
            statusEl.textContent = `Normal traffic flow. Isolation score: ${p.score} (below threshold). ${outliersCaught} of 6 outliers flagged.`;
          }
          render();
        }
      });

      svg.appendChild(circle);
    });
  }

  render();
}
