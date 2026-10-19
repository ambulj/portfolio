// Tamper-detection chain module for AegisZ (§10.5)
// Five blocks: each hash = SHA-256 (Web Crypto) of data + previous hash.
// Editing one block turns every later block --fault and prints "chain invalid at block n".
// Labelled: "Simplified. The real ledger uses SHA3-512 and ML-DSA-65."

import { unlockSecret } from './secrets-manager.js';

async function sha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const INITIAL_BLOCKS = [
  { index: 1, data: 'Genesis Record: Clinic A Ingress Policy', prevHash: '0000000000000000000000000000000000000000000000000000000000000000' },
  { index: 2, data: 'Tokenized Batch #104: 84 Clinical Entries', prevHash: '' },
  { index: 3, data: 'Laplace Differential Privacy ε=0.5 Applied', prevHash: '' },
  { index: 4, data: 'ONNX Anomaly Filter: Zero Injection Signatures', prevHash: '' },
  { index: 5, data: 'Triage Summary Export: ML-DSA-65 Signed', prevHash: '' }
];

export async function initTamperChain() {
  const container = document.getElementById('tamper-chain-container');
  if (!container) return;

  const blocksContainer = document.getElementById('tamper-blocks-list');
  const statusEl = document.getElementById('tamper-chain-status');
  if (!blocksContainer || !statusEl) return;

  const currentData = INITIAL_BLOCKS.map(b => ({ ...b }));

  // Compute initial valid chain
  for (let i = 0; i < currentData.length; i++) {
    if (i > 0) {
      currentData[i].prevHash = currentData[i - 1].hash;
    }
    currentData[i].hash = await sha256(currentData[i].data + currentData[i].prevHash);
  }

  // Track user edits
  let blockInputs = [];

  async function renderChain() {
    blocksContainer.replaceChildren();

    // Verify chain integrity
    let firstInvalidIndex = -1;
    for (let i = 0; i < currentData.length; i++) {
      const inputVal = blockInputs[i] ? blockInputs[i].value : currentData[i].data;
      const expectedHash = await sha256(inputVal + currentData[i].prevHash);

      // Check if previous link matches
      if (i > 0 && currentData[i].prevHash !== currentData[i - 1].currentRenderedHash) {
        if (firstInvalidIndex === -1) firstInvalidIndex = i + 1;
      }

      currentData[i].currentRenderedHash = expectedHash;
    }

    if (firstInvalidIndex !== -1) {
      statusEl.className = 'tamper-status status-fault';
      statusEl.textContent = `chain invalid at block ${firstInvalidIndex}`;
      unlockSecret('tamper');
    } else {
      statusEl.className = 'tamper-status status-valid';
      statusEl.textContent = 'Chain verified: all 5 blocks cryptographically linked.';
    }

    // Render cards
    blockInputs = [];
    currentData.forEach((b, idx) => {
      const isInvalid = firstInvalidIndex !== -1 && (idx + 1) >= firstInvalidIndex;

      const card = document.createElement('div');
      card.className = isInvalid ? 'tamper-block-card block-invalid' : 'tamper-block-card';

      const header = document.createElement('div');
      header.className = 'tamper-block-header';
      header.textContent = `Block #${b.index} ${isInvalid ? '— TAMPER DETECTED' : '— VERIFIED'}`;
      card.appendChild(header);

      const inputId = `tamper-payload-${b.index}`;
      const dataLabel = document.createElement('label');
      dataLabel.className = 'tamper-label';
      dataLabel.htmlFor = inputId;
      dataLabel.textContent = 'Payload Data:';
      card.appendChild(dataLabel);

      const input = document.createElement('input');
      input.type = 'text';
      input.id = inputId;
      input.setAttribute('aria-label', `Block ${b.index} payload`);
      input.className = 'tamper-input';
      input.value = b.data;
      input.addEventListener('input', async (e) => {
        b.data = e.target.value;
        await renderChain();
      });
      blockInputs.push(input);
      card.appendChild(input);

      const prevHashRow = document.createElement('div');
      prevHashRow.className = 'tamper-hash-row';
      prevHashRow.textContent = `Prev: ${b.prevHash.slice(0, 16)}...`;
      card.appendChild(prevHashRow);

      const currHashRow = document.createElement('div');
      currHashRow.className = 'tamper-hash-row';
      currHashRow.textContent = `Hash: ${b.currentRenderedHash ? b.currentRenderedHash.slice(0, 16) : ''}...`;
      card.appendChild(currHashRow);

      blocksContainer.appendChild(card);
    });
  }

  await renderChain();
}
