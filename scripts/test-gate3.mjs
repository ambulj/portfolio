// scripts/test-gate3.mjs — Gate 3 Comprehensive Automated Verification Suite
// Verifies all Gate 1 + Gate 2 checks and all 8 Gate 3 hidden browser features.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORT = 8791; // Dedicated port for Gate 3 test suite

// Parse dist/_headers
function getSecurityHeaders() {
  const headersFile = path.join(DIST_DIR, '_headers');
  const headers = {};
  if (fs.existsSync(headersFile)) {
    const lines = fs.readFileSync(headersFile, 'utf8').split('\n');
    let isGlobal = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '/*') {
        isGlobal = true;
        continue;
      }
      if (isGlobal) {
        if (trimmed.startsWith('/') || trimmed === '') {
          if (trimmed.startsWith('/')) break;
          continue;
        }
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0) {
          const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
          const val = trimmed.slice(colonIdx + 1).trim();
          headers[key] = val;
        }
      }
    }
  }
  return headers;
}

const securityHeaders = getSecurityHeaders();

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      let reqPath = decodeURIComponent(url.pathname);

      // Apply production security headers
      for (const [k, v] of Object.entries(securityHeaders)) {
        res.setHeader(k, v);
      }

      if (req.method === 'HEAD') {
        res.statusCode = 200;
        res.end();
        return;
      }

      let filePath = path.join(DIST_DIR, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, '404.html');
        res.statusCode = 404;
      } else {
        res.statusCode = 200;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.woff2': 'font/woff2',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.txt': 'text/plain; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.pdf': 'application/pdf'
      };

      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function runGate3() {
  console.log('=== STARTING GATE 3 COMPREHENSIVE VERIFICATION ===\n');

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // Listen for uncaught errors
    page.on('pageerror', err => {
      console.error('  [BROWSER ERROR]:', err.message);
      allPassed = false;
    });

    // -------------------------------------------------------------
    // PART 1: Gate 1 & 2 Regressions & Build Verification
    // -------------------------------------------------------------
    console.log('[1/10] Verifying build artifacts, routes, and regression checks...');
    const routes = [
      '/', '/work', '/work/inferyx', '/work/aegisz', '/work/orgmind',
      '/work/threat-detection', '/work/roadsaarthi', '/lab', '/about',
      '/certifications', '/resume', '/contact', '/demos', '/security',
      '/colophon', '/404'
    ];

    let missingRoutes = 0;
    for (const r of routes) {
      const file = r === '/' ? 'index.html' : r === '/404' ? '404.html' : path.join(r.slice(1), 'index.html');
      if (!fs.existsSync(path.join(DIST_DIR, file))) {
        console.error(`  MISSING ROUTE ARTIFACT: ${file}`);
        missingRoutes++;
      }
    }
    console.log(`  All 16 static routes prerendered: ${missingRoutes === 0 ? 'PASS' : 'FAIL'}`);
    if (missingRoutes > 0) allPassed = false;

    // Accessibility check with axe-core on representative routes
    console.log('  Running axe-core accessibility checks on key pages...');
    for (const testPath of ['/', '/about', '/colophon', '/work/inferyx']) {
      await page.goto(`http://localhost:${PORT}${testPath}`, { waitUntil: 'networkidle' });
      const axeResults = await new AxeBuilder({ page }).analyze();
      const serious = axeResults.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      console.log(`    Axe on ${testPath}: ${axeResults.violations.length} violations (${serious.length} critical/serious)`);
      if (serious.length > 0) allPassed = false;
    }

    // -------------------------------------------------------------
    // PART 2: Zero Cookies & Zero External Network Requests Guarantee
    // -------------------------------------------------------------
    console.log('\n[2/10] Checking Cookie and Network Privacy Guarantees...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    const cookie = await page.evaluate(() => document.cookie);
    console.log(`  document.cookie is strictly empty: "${cookie}" (${cookie === '' ? 'PASS' : 'FAIL'})`);
    if (cookie !== '') allPassed = false;

    // Track network requests during hidden features
    const networkRequests = [];
    page.on('request', req => {
      const u = req.url();
      if (!u.startsWith(`http://localhost:${PORT}`) && !u.startsWith('data:')) {
        networkRequests.push(u);
      }
    });

    // -------------------------------------------------------------
    // PART 3: Secrets Counter Initial State
    // -------------------------------------------------------------
    console.log('\n[3/10] Checking Secrets Counter Initial State...');
    // Clear localStorage to ensure fresh state
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const counterHiddenInitial = await page.evaluate(() => {
      const el = document.getElementById('secrets-counter-container');
      return el ? (el.hidden || window.getComputedStyle(el).display === 'none') : false;
    });
    console.log(`  Secrets counter hidden when 0 discovered: ${counterHiddenInitial ? 'PASS' : 'FAIL'}`);
    if (!counterHiddenInitial) allPassed = false;

    // -------------------------------------------------------------
    // PART 4: Feature 1 - Interactive Terminal & Focus Trap & XSS Sanitization
    // -------------------------------------------------------------
    console.log('\n[4/10] Testing Feature 1: Interactive Terminal...');
    // Open via backtick key
    await page.keyboard.press('Backquote');
    await page.waitForTimeout(100);

    let isTerminalOpen = await page.evaluate(() => {
      const m = document.getElementById('terminal-modal');
      return m && !m.hidden && m.getAttribute('aria-hidden') === 'false';
    });
    console.log(`  Terminal opened via backtick key: ${isTerminalOpen ? 'PASS' : 'FAIL'}`);
    if (!isTerminalOpen) allPassed = false;

    // Verify focus is trapped in input
    const isFocused = await page.evaluate(() => document.activeElement.id === 'terminal-input');
    console.log(`  Focus trapped on terminal prompt input: ${isFocused ? 'PASS' : 'FAIL'}`);
    if (!isFocused) allPassed = false;

    // Test terminal command: help
    await page.fill('#terminal-input', 'help');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);

    const helpOutput = await page.textContent('#terminal-output');
    const helpWorks = helpOutput.includes('Available commands') && helpOutput.includes('unlock');
    console.log(`  Terminal "help" command executed: ${helpWorks ? 'PASS' : 'FAIL'}`);
    if (!helpWorks) allPassed = false;

    // Test XSS sanitization in terminal input
    console.log('  Testing Terminal HTML injection (XSS defense)...');
    await page.fill('#terminal-input', '<script>window.__term_xss=true</script><img src=x onerror=window.__term_img_xss=true>');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);

    const xssExecuted = await page.evaluate(() => window.__term_xss || window.__term_img_xss || false);
    const terminalHtml = await page.innerHTML('#terminal-output');
    const xssEscaped = !terminalHtml.includes('<script>') && !terminalHtml.includes('<img');
    console.log(`  Terminal input cannot inject HTML: executed=${xssExecuted}, raw_tags_in_DOM=${!xssEscaped} (${!xssExecuted && xssEscaped ? 'PASS' : 'FAIL'})`);
    if (xssExecuted || !xssEscaped) allPassed = false;

    // Close terminal via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    const isTerminalClosed = await page.evaluate(() => {
      const m = document.getElementById('terminal-modal');
      return m && (m.hidden || m.getAttribute('aria-hidden') === 'true');
    });
    console.log(`  Terminal closed via Escape: ${isTerminalClosed ? 'PASS' : 'FAIL'}`);
    if (!isTerminalClosed) allPassed = false;

    // Reopen terminal via footer button
    await page.click('[data-action="open-terminal"]');
    await page.waitForTimeout(100);
    isTerminalOpen = await page.evaluate(() => !document.getElementById('terminal-modal').hidden);
    console.log(`  Terminal opened via footer link [&gt;]: ${isTerminalOpen ? 'PASS' : 'FAIL'}`);
    if (!isTerminalOpen) allPassed = false;

    // -------------------------------------------------------------
    // PART 5: Feature 2 - CTF Passphrase Challenge
    // -------------------------------------------------------------
    console.log('\n[5/10] Testing Feature 2: CTF Passphrase Challenge...');
    // Inspect view-source easter egg comment in raw index.html
    const indexHtmlRaw = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
    const hasEasterEggComment = indexHtmlRaw.includes('bW9kZWxzLWZhaWwtcXVpZXRseQ==') && indexHtmlRaw.includes('CTF Flag');
    console.log(`  View-source easter egg comment with base64 puzzle present: ${hasEasterEggComment ? 'PASS' : 'FAIL'}`);
    if (!hasEasterEggComment) allPassed = false;

    // Try wrong passphrase
    await page.fill('#terminal-input', 'unlock wrong-secret');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const wrongOutput = await page.textContent('#terminal-output');
    const wrongRejected = wrongOutput.includes('Access denied: invalid passphrase hash');
    console.log(`  Incorrect passphrase rejected: ${wrongRejected ? 'PASS' : 'FAIL'}`);
    if (!wrongRejected) allPassed = false;

    // Try correct passphrase: "models-fail-quietly"
    await page.fill('#terminal-input', 'unlock models-fail-quietly');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const correctOutput = await page.textContent('#terminal-output');
    const correctAccepted = correctOutput.includes('Recruiter note unlocked: models-fail-quietly');
    console.log(`  Correct passphrase "models-fail-quietly" unlocked recruiter note: ${correctAccepted ? 'PASS' : 'FAIL'}`);
    if (!correctAccepted) allPassed = false;

    // Close terminal
    await page.keyboard.press('Escape');

    // -------------------------------------------------------------
    // PART 6: Feature 3 - Konami Code & Pulse Rate Limiting
    // -------------------------------------------------------------
    console.log('\n[6/10] Testing Feature 3: Konami IDS Intrusion Mode...');
    // Key sequence: ↑ ↑ ↓ ↓ ← → ← → B A
    const konamiKeys = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    for (const key of konamiKeys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(150);

    const isKonamiActive = await page.evaluate(() => {
      const overlay = document.getElementById('konami-overlay');
      return !overlay.hidden && document.body.classList.contains('konami-active');
    });
    console.log(`  Konami overlay triggered and body.konami-active set: ${isKonamiActive ? 'PASS' : 'FAIL'}`);
    if (!isKonamiActive) allPassed = false;

    // Check pulse rate limit: strictly <= 3 Hz (animation-duration >= 0.333s)
    const animDuration = await page.evaluate(() => {
      return window.getComputedStyle(document.body).animationDuration;
    });
    const durationSeconds = parseFloat(animDuration) || 0;
    const pulseFreqHz = durationSeconds > 0 ? (1 / durationSeconds) : 0;
    console.log(`  Konami pulse duration: ${animDuration} (${pulseFreqHz.toFixed(1)} Hz <= 3 Hz: ${pulseFreqHz <= 3.0 ? 'PASS' : 'FAIL'})`);
    if (pulseFreqHz > 3.0) allPassed = false;

    // Check prefers-reduced-motion suppression
    const reducedMotionPage = await context.newPage();
    await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });
    await reducedMotionPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    for (const key of konamiKeys) {
      await reducedMotionPage.keyboard.press(key);
      await reducedMotionPage.waitForTimeout(20);
    }
    await reducedMotionPage.waitForTimeout(100);
    const reducedAnim = await reducedMotionPage.evaluate(() => {
      return window.getComputedStyle(document.body).animationName;
    });
    console.log(`  Konami animation under prefers-reduced-motion: "${reducedAnim}" (${reducedAnim === 'none' ? 'PASS (suppressed)' : 'FAIL'})`);
    if (reducedAnim !== 'none') allPassed = false;
    await reducedMotionPage.close();

    // Close konami with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    const isKonamiDismissed = await page.evaluate(() => {
      const overlay = document.getElementById('konami-overlay');
      return overlay.hidden && !document.body.classList.contains('konami-active');
    });
    console.log(`  Konami overlay dismissed via Escape: ${isKonamiDismissed ? 'PASS' : 'FAIL'}`);
    if (!isKonamiDismissed) allPassed = false;

    // -------------------------------------------------------------
    // PART 7: Feature 4 - Tamper-Detection Ledger on /work/aegisz
    // -------------------------------------------------------------
    console.log('\n[7/10] Testing Feature 4: Tamper-Detection Ledger (/work/aegisz)...');
    await page.goto(`http://localhost:${PORT}/work/aegisz`, { waitUntil: 'networkidle' });

    await page.waitForSelector('#tamper-chain-container');
    const blockCount = await page.locator('.tamper-block-card').count();
    console.log(`  Tamper blocks rendered: ${blockCount} (expected 5) (${blockCount === 5 ? 'PASS' : 'FAIL'})`);
    if (blockCount !== 5) allPassed = false;

    const initialStatus = await page.textContent('#tamper-chain-status');
    console.log(`  Initial chain status: "${initialStatus}" (${initialStatus.includes('verified') ? 'PASS' : 'FAIL'})`);
    if (!initialStatus.includes('verified')) allPassed = false;

    // Edit payload of block 1
    const block1Input = page.locator('#tamper-payload-1');
    await block1Input.fill('TAMPERED_PAYLOAD_DATA');
    await page.waitForTimeout(200);

    const tamperedStatus = await page.textContent('#tamper-chain-status');
    const invalidBlocksCount = await page.locator('.tamper-block-card.block-invalid').count();
    console.log(`  Tampered chain status: "${tamperedStatus}"`);
    console.log(`  Invalid blocks flagged: ${invalidBlocksCount} (${invalidBlocksCount >= 3 && tamperedStatus.includes('chain invalid') ? 'PASS' : 'FAIL'})`);
    if (invalidBlocksCount < 3 || !tamperedStatus.includes('chain invalid')) allPassed = false;

    // -------------------------------------------------------------
    // PART 8: Feature 5 - Differential Privacy Blur on /about
    // -------------------------------------------------------------
    console.log('\n[8/10] Testing Feature 5: Differential Privacy Blur (/about)...');
    await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'networkidle' });

    const dpTrigger = page.locator('#dp-trigger-btn');
    await dpTrigger.click();
    await page.waitForTimeout(100);

    const dpModalVisible = await page.evaluate(() => {
      const m = document.getElementById('dp-modal');
      return m && !m.hidden;
    });
    console.log(`  DP modal opened on clicking Roorkee: ${dpModalVisible ? 'PASS' : 'FAIL'}`);
    if (!dpModalVisible) allPassed = false;

    const dotCount = await page.locator('#dp-svg-plot circle').count();
    console.log(`  Laplace scatter points plotted: ${dotCount} (expected 50) (${dotCount >= 40 ? 'PASS' : 'FAIL'})`);
    if (dotCount < 40) allPassed = false;

    // Move slider to tighter budget (epsilon = 4.0)
    await page.locator('#dp-epsilon-slider').evaluate((el, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '4.0');
    await page.waitForTimeout(100);

    const summaryText = await page.textContent('#dp-sample-summary');
    console.log(`  Tightened privacy budget summary: "${summaryText}" (${summaryText.includes('ε=4.0') ? 'PASS' : 'FAIL'})`);
    if (!summaryText.includes('ε=4.0')) allPassed = false;

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    const dpModalClosed = await page.evaluate(() => document.getElementById('dp-modal').hidden);
    console.log(`  DP modal closed via Escape: ${dpModalClosed ? 'PASS' : 'FAIL'}`);
    if (!dpModalClosed) allPassed = false;

    // -------------------------------------------------------------
    // PART 9: Feature 6 & 7 - Anomaly Hunt & Drift Slider
    // -------------------------------------------------------------
    console.log('\n[9/10] Testing Feature 6 & 7: Anomaly Hunt & Drift Slider...');
    // Feature 6: Anomaly Hunt on /work/threat-detection
    await page.goto(`http://localhost:${PORT}/work/threat-detection`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#anomaly-hunt-svg');

    const totalPoints = await page.locator('#anomaly-hunt-svg circle').count();
    const outlierPoints = await page.locator('#anomaly-hunt-svg circle.scatter-anomaly').count();
    console.log(`  Anomaly Hunt: Total points=${totalPoints}, Outliers=${outlierPoints} (${totalPoints === 200 && outlierPoints === 6 ? 'PASS' : 'FAIL'})`);
    if (totalPoints !== 200 || outlierPoints !== 6) allPassed = false;

    // Click first outlier
    await page.click('#anomaly-hunt-svg circle.scatter-anomaly');
    await page.waitForTimeout(100);
    const anomalyStatus = await page.textContent('#anomaly-hunt-status');
    console.log(`  Anomaly clicked status: "${anomalyStatus}" (${anomalyStatus.includes('Anomaly detected!') ? 'PASS' : 'FAIL'})`);
    if (!anomalyStatus.includes('Anomaly detected!')) allPassed = false;

    // Feature 7: Drift Slider on /work/inferyx
    await page.goto(`http://localhost:${PORT}/work/inferyx`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#drift-shift-slider');

    const initialBadge = await page.textContent('#drift-status-badge');
    console.log(`  Initial Drift Status: "${initialBadge}" (${initialBadge.includes('Stable') ? 'PASS' : 'FAIL'})`);
    if (!initialBadge.includes('Stable')) allPassed = false;

    // Move slider to warning threshold (shift = 0.35)
    await page.locator('#drift-shift-slider').evaluate((el, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '0.35');
    await page.waitForTimeout(100);
    const warningBadge = await page.textContent('#drift-status-badge');
    console.log(`  Drift shift=0.35 Status: "${warningBadge}" (${warningBadge.includes('Warning') ? 'PASS' : 'FAIL'})`);
    if (!warningBadge.includes('Warning')) allPassed = false;

    // Move slider to critical threshold (shift = 2.2)
    await page.locator('#drift-shift-slider').evaluate((el, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '2.2');
    await page.waitForTimeout(100);
    const criticalBadge = await page.textContent('#drift-status-badge');
    console.log(`  Drift shift=2.2 Status: "${criticalBadge}" (${criticalBadge.includes('Critical') ? 'PASS' : 'FAIL'})`);
    if (!criticalBadge.includes('Critical')) allPassed = false;

    // -------------------------------------------------------------
    // PART 10: Feature 8 - /colophon & Secrets Persistence
    // -------------------------------------------------------------
    console.log('\n[10/10] Testing Feature 8 (/colophon) & Secrets Persistence...');
    await page.goto(`http://localhost:${PORT}/colophon`, { waitUntil: 'networkidle' });

    const depTableCount = await page.locator('table tbody tr').count();
    const hasThree = (await page.textContent('table')).includes('0.186.1');
    const hasEsbuild = (await page.textContent('table')).includes('0.28.2');
    const hasNoFrameworkNote = (await page.textContent('main')).includes('Why this isn\'t built on a frontend framework');
    const hasNoJsNote = (await page.textContent('main')).includes('What happens when JavaScript is turned off');

    console.log(`  Colophon dependency table rows: ${depTableCount} (has three=${hasThree}, esbuild=${hasEsbuild})`);
    console.log(`  Architecture rationale notes present: ${hasNoFrameworkNote && hasNoJsNote ? 'PASS' : 'FAIL'}`);
    if (depTableCount < 8 || !hasThree || !hasEsbuild || !hasNoFrameworkNote || !hasNoJsNote) allPassed = false;

    // Check Secrets Counter State
    const counterText = await page.textContent('#secrets-counter-container');
    const counterVisible = await page.evaluate(() => {
      const el = document.getElementById('secrets-counter-container');
      return el && !el.hidden;
    });
    console.log(`  Secrets counter visible: ${counterVisible}, text: "${counterText}" (${counterVisible && counterText.includes('Secrets found:') ? 'PASS' : 'FAIL'})`);
    if (!counterVisible || !counterText.includes('Secrets found:')) allPassed = false;

    // Test persistence across page reload
    await page.reload({ waitUntil: 'networkidle' });
    const persistedText = await page.textContent('#secrets-counter-container');
    console.log(`  Secrets counter survived page reload: "${persistedText}" (${persistedText === counterText ? 'PASS' : 'FAIL'})`);
    if (persistedText !== counterText) allPassed = false;

    // Verify zero external network requests made by hidden features
    console.log(`  Total external requests made by hidden features: ${networkRequests.length} (${networkRequests.length === 0 ? 'PASS (0 external requests)' : 'FAIL'})`);
    if (networkRequests.length > 0) {
      console.error('    Unexpected external requests:', networkRequests);
      allPassed = false;
    }

    console.log(`\n=== GATE 3 AUTOMATED VERIFICATION RESULT: ${allPassed ? 'ALL PASS' : 'SOME CHECKS FAILED'} ===`);
  } finally {
    await browser.close();
    server.close();
  }

  if (!allPassed) {
    process.exit(1);
  }
}

runGate3().catch(err => {
  console.error('[test-gate3] Fatal error:', err);
  process.exit(1);
});
