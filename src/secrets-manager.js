// Secrets Discovery & State Management System (§10)
// Rules: All run client-side. Zero cookies. Zero network requests.
// Persists in localStorage under 'secrets' (an array of discovered secret IDs).
// The counter "Secrets found: n of 8" appears ONLY after the first discovery and survives reloads.

export const ALL_SECRETS = [
  {
    id: 'terminal',
    name: 'Interactive Terminal',
    hint: 'Press the backtick key ` or inspect the footer shortcuts.'
  },
  {
    id: 'puzzle',
    name: 'CTF Hash Challenge',
    hint: 'Inspect the HTML source of the page; decode the base64 string and unlock in terminal.'
  },
  {
    id: 'colophon',
    name: 'Technical Colophon',
    hint: 'Visit /colophon to inspect the architectural decisions and build pipeline.'
  },
  {
    id: 'konami',
    name: 'Konami IDS Intrusion Mode',
    hint: 'Input the classic arcade controller sequence: ↑ ↑ ↓ ↓ ← → ← → B A.'
  },
  {
    id: 'tamper',
    name: 'Tamper-Detection Ledger',
    hint: 'On the AegisZ page, edit a data block in the SHA-256 hash-chain.'
  },
  {
    id: 'dp',
    name: 'Differential-Privacy Blur',
    hint: 'On the About page, click the Roorkee location coordinates to add Laplace noise.'
  },
  {
    id: 'anomaly',
    name: 'Isolation Anomaly Hunt',
    hint: 'On the AI Threat Detection page, find and flag the network outliers.'
  },
  {
    id: 'drift',
    name: 'Statistical Drift Slider',
    hint: 'On the Inferyx page, slide the feature distribution to trigger the PSI warning.'
  }
];

export function getDiscoveredSecrets() {
  try {
    const raw = localStorage.getItem('secrets');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function unlockSecret(secretId) {
  const current = getDiscoveredSecrets();
  if (!current.includes(secretId)) {
    current.push(secretId);
    try {
      localStorage.setItem('secrets', JSON.stringify(current));
    } catch (e) {
      // storage quota or disabled
    }
    updateSecretsCounter();
    notifySecretDiscovered(secretId);
  }
}

export function getNextHint() {
  const discovered = getDiscoveredSecrets();
  const remaining = ALL_SECRETS.filter(s => !discovered.includes(s.id));
  if (remaining.length === 0) {
    return 'All 8 secrets have been discovered! The system is fully audited.';
  }
  return `Next clue: ${remaining[0].hint}`;
}

export function updateSecretsCounter() {
  const container = document.getElementById('secrets-counter-container');
  if (!container) return;

  const discovered = getDiscoveredSecrets();
  if (discovered.length === 0) {
    container.hidden = true;
    container.textContent = '';
  } else {
    container.hidden = false;
    container.textContent = `Secrets found: ${discovered.length} of ${ALL_SECRETS.length}`;
  }
}

function notifySecretDiscovered(secretId) {
  const secret = ALL_SECRETS.find(s => s.id === secretId);
  if (!secret) return;

  const toast = document.createElement('div');
  toast.className = 'secret-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = `[Secret Unlocked: ${secret.name}]`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

export function initSecretsManager() {
  updateSecretsCounter();
}
