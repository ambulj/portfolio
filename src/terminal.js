// In-Browser Terminal (§10.1 & §10.2)
// Rules:
// - Opens with backtick key (`) or from footer button.
// - Escape closes; focus trapped while open; Plex Mono font.
// - CRITICAL SECURITY REQUIREMENT: Output is built strictly with textContent (never innerHTML).
// - Commands: help, projects, certs, contact, theme, hint, secrets, clear, unlock <phrase>.
// - SHA-256 of 'models-fail-quietly' unlocks recruiter note.

import { unlockSecret, getNextHint, getDiscoveredSecrets, ALL_SECRETS } from './secrets-manager.js';

const PUZZLE_HASH = 'bd5ed1ff1770a5baf15a56647beea23650940d7f5ce7dac27395a2fb5d903baf';

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function initTerminal() {
  let terminalModal = document.getElementById('terminal-modal');
  if (!terminalModal) return;

  const outputEl = document.getElementById('terminal-output');
  const inputEl = document.getElementById('terminal-input');
  const closeBtn = document.getElementById('terminal-close-btn');
  const openBtns = document.querySelectorAll('[data-action="open-terminal"]');

  function openTerminal() {
    terminalModal.hidden = false;
    terminalModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('terminal-open');
    unlockSecret('terminal');
    if (inputEl) {
      inputEl.focus();
    }
  }

  function closeTerminal() {
    terminalModal.hidden = true;
    terminalModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('terminal-open');
  }

  // Toggle on backtick
  window.addEventListener('keydown', (e) => {
    // If not typing in input/textarea outside terminal
    const active = document.activeElement;
    const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active !== inputEl;
    if (isEditing) return;

    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      if (terminalModal.hidden) {
        openTerminal();
      } else {
        closeTerminal();
      }
    } else if (e.key === 'Escape' && !terminalModal.hidden) {
      e.preventDefault();
      closeTerminal();
    }
  });

  openBtns.forEach(btn => btn.addEventListener('click', openTerminal));
  if (closeBtn) closeBtn.addEventListener('click', closeTerminal);

  // Focus trap inside terminal
  terminalModal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = terminalModal.querySelectorAll('button, input, [tabindex="0"]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Print helper - CRITICAL: textContent only!
  function printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = className ? `term-line ${className}` : 'term-line';
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Command executor
  async function executeCommand(cmdStr) {
    const raw = cmdStr.trim();
    if (!raw) return;

    printLine(`ambul@portfolio:~$ ${raw}`, 'term-prompt-line');
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        printLine('Available commands:');
        printLine('  help       - List available commands');
        printLine('  projects   - Summary of security-focused ML systems');
        printLine('  certs      - Verified industry & academic credentials');
        printLine('  contact    - Communication endpoints');
        printLine('  theme      - Explains site colour system');
        printLine('  hint       - Get clue for the next undiscovered secret');
        printLine('  secrets    - List discovered system secrets');
        printLine('  unlock <s> - Submit CTF passphrase');
        printLine('  clear      - Clear terminal output');
        break;

      case 'projects':
        printLine('1. Inferyx: AutoML studio with drift detection & model signing.');
        printLine('2. AegisZ: Zero-knowledge AI gateway for clinical records (IBM Z).');
        printLine('3. OrgMind: Grounded knowledge graph with LLM tool loop.');
        printLine('4. AI Threat Detection: Network traffic anomaly scoring.');
        printLine('5. RoadSaarthi: Spatial road degradation clustering on edge.');
        printLine('6. phenom: Offline personal assistant (Lab).');
        break;

      case 'certs':
        printLine('Verified credentials:');
        printLine('- Neo4j Certified Professional (Jun 2025)');
        printLine('- Google Cloud: Mitigate Threats with SCC (Jun 2025)');
        printLine('- Cisco: Junior Cybersecurity Analyst Career Path (Jun 2025)');
        printLine('- IIT Guwahati: Summer Analytics top 25% (Apr 2025)');
        break;

      case 'contact':
        printLine('Direct channels:');
        printLine('- GitHub: github.com/ambulj · github.com/Bloated11');
        printLine('- LinkedIn: linkedin.com/in/ambul');
        printLine('- Use the web contact form on /contact');
        break;

      case 'theme':
        printLine('Theme policy:');
        printLine('No manual toggle. The site respects prefers-color-scheme (light/dark) automatically.');
        break;

      case 'hint':
        printLine(getNextHint(), 'term-highlight');
        break;

      case 'secrets': {
        const found = getDiscoveredSecrets();
        printLine(`Discovered secrets (${found.length} of ${ALL_SECRETS.length}):`);
        ALL_SECRETS.forEach(s => {
          const isDone = found.includes(s.id);
          printLine(`  [${isDone ? 'X' : ' '}] ${s.name} - ${isDone ? 'Unlocked' : 'Locked'}`);
        });
        break;
      }

      case 'unlock': {
        const phrase = args.join(' ').toLowerCase();
        if (!phrase) {
          printLine('Usage: unlock <passphrase>');
          return;
        }
        const inputHash = await sha256Hex(phrase);
        if (inputHash === PUZZLE_HASH) {
          printLine('[CTF HASH VERIFIED] Passphrase accepted!', 'term-success');
          printLine('Recruiter note unlocked: models-fail-quietly. Welcome! Ambul Jaiswal builds security-focused ML systems.', 'term-highlight');
          unlockSecret('puzzle');
        } else {
          printLine('Access denied: invalid passphrase hash. Check the view-source note for clues.', 'term-error');
        }
        break;
      }

      case 'clear':
        outputEl.replaceChildren();
        break;

      default:
        printLine(`Command not recognized: ${cmd}. Type "help" for a list of commands.`, 'term-dim');
        break;
    }
  }

  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = inputEl.value;
        inputEl.value = '';
        executeCommand(val);
      }
    });
  }
}
