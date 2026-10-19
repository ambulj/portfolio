// Gate 2 Comprehensive Automated Verification Suite
// Verifies all Gate 1 checks + all 7 Gate 2 interaction criteria.

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
const PORT = 8789; // Dedicated port for Gate 2 tests

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
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function runGate2() {
  console.log('=== Starting Gate 2 Automated Verification Suite ===\n');

  const server = await startServer();
  console.log(`[1/8] Preview server running on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  try {
    // Check 1: Gate 1 baseline on all 15 routes (including /lab)
    console.log('[2/8] Testing all 15 routes for status, single h1, 0 console errors, 0 CSP violations...');
    const routes = [
      '/',
      '/work',
      '/work/inferyx',
      '/work/aegisz',
      '/work/orgmind',
      '/work/threat-detection',
      '/work/roadsaarthi',
      '/lab',
      '/about',
      '/certifications',
      '/resume',
      '/contact',
      '/demos',
      '/security',
      '/404'
    ];

    const page = await browser.newPage();

    for (const route of routes) {
      const consoleErrors = [];
      const cspViolations = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          if (route === '/404' && msg.text().includes('404')) return;
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });

      await page.exposeFunction('onCspViolation', (viol) => {
        cspViolations.push(viol);
      }).catch(() => {});

      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => {
          window.onCspViolation && window.onCspViolation({
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective
          });
        });
      });

      const resp = await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
      const expectedStatus = route === '/404' ? 404 : 200;
      const status = resp.status();
      const h1Count = await page.locator('h1').count();

      const pass = status === expectedStatus && h1Count === 1 && consoleErrors.length === 0 && cspViolations.length === 0;
      if (!pass) allPassed = false;

      console.log(`  ${route.padEnd(25)} -> status ${status} (${status === expectedStatus ? 'PASS' : 'FAIL'}), h1=${h1Count}, console_errs=${consoleErrors.length}, csp_viols=${cspViolations.length}`);
    }

    // Check 2: Client-side Navigation with focus move to <h1> and live region announcement
    console.log('\n[3/8] Testing client-side navigation (back/forward, focus on <h1>, live region announcement)...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

    // Click on "Work" in nav
    await page.click('nav a[href="/work"]');
    await page.waitForTimeout(400); // Allow view transition and focus swap

    const workUrl = page.url();
    const workTitle = await page.title();
    const announcerText = await page.textContent('#route-announcer');
    const isH1Focused = await page.evaluate(() => {
      const h1 = document.querySelector('main h1');
      return document.activeElement === h1;
    });

    console.log(`  Navigated to /work: URL=${workUrl}`);
    console.log(`  Focus moved to new <h1>: ${isH1Focused ? 'PASS' : 'FAIL'}`);
    console.log(`  Live region announcement: "${announcerText}" (matches title: ${announcerText === workTitle ? 'PASS' : 'FAIL'})`);

    if (!isH1Focused || announcerText !== workTitle) allPassed = false;

    // Navigate to a case study (/work/inferyx)
    await page.click('a[href="/work/inferyx"]');
    await page.waitForTimeout(400);

    const inferyxUrl = page.url();
    const isInferyxH1Focused = await page.evaluate(() => {
      const h1 = document.querySelector('main h1');
      return document.activeElement === h1;
    });

    console.log(`  Navigated to /work/inferyx: URL=${inferyxUrl}`);
    console.log(`  Focus on Inferyx <h1>: ${isInferyxH1Focused ? 'PASS' : 'FAIL'}`);

    // Test history back
    await page.goBack();
    await page.waitForTimeout(400);
    const backUrl = page.url();
    const backH1 = await page.textContent('main h1');
    console.log(`  History goBack() -> URL=${backUrl}, <h1>="${backH1}" (${backUrl.endsWith('/work') ? 'PASS' : 'FAIL'})`);

    // Test history forward
    await page.goForward();
    await page.waitForTimeout(400);
    const fwdUrl = page.url();
    const fwdH1 = await page.textContent('main h1');
    console.log(`  History goForward() -> URL=${fwdUrl}, <h1>="${fwdH1}" (${fwdUrl.endsWith('/work/inferyx') ? 'PASS' : 'FAIL'})`);

    if (!backUrl.endsWith('/work') || !fwdUrl.endsWith('/work/inferyx')) allPassed = false;

    // Check 3: Direct loads with JS disabled
    console.log('\n[4/8] Testing direct loads with JavaScript disabled...');
    const noJsContext = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await noJsContext.newPage();

    for (const testPath of ['/', '/work', '/lab', '/about', '/security']) {
      const resp = await noJsPage.goto(`http://localhost:${PORT}${testPath}`);
      const h1 = await noJsPage.textContent('h1');
      const pass = resp.status() === 200 && h1 && h1.length > 0;
      if (!pass) allPassed = false;
      console.log(`  [No JS] ${testPath.padEnd(15)} -> status=${resp.status()}, <h1>="${h1.trim()}" (${pass ? 'PASS' : 'FAIL'})`);
    }
    await noJsContext.close();

    // Check 4: Reduced motion assertions (no wipe, native cursor, sound off)
    console.log('\n[5/8] Testing prefers-reduced-motion overrides (no wipe line, native cursor, sound forced off)...');
    const rmContext = await browser.newContext({
      reducedMotion: 'reduce'
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

    const cursorDisplay = await rmPage.evaluate(() => {
      const cursor = document.getElementById('custom-cursor');
      return cursor ? window.getComputedStyle(cursor).display : 'none';
    });
    console.log(`  Custom cursor display under reduced motion: "${cursorDisplay}" (${cursorDisplay === 'none' ? 'PASS' : 'FAIL'})`);

    // Click link to case study under reduced motion
    await rmPage.click('a[href="/work/inferyx"]');
    await rmPage.waitForTimeout(300);

    const wipeAnimated = await rmPage.evaluate(() => {
      const wipe = document.getElementById('wipe-line');
      return wipe ? wipe.classList.contains('animate-wipe') : false;
    });
    console.log(`  Wipe line triggered under reduced motion: ${wipeAnimated} (${!wipeAnimated ? 'PASS (suppressed)' : 'FAIL'})`);

    if (cursorDisplay !== 'none' || wipeAnimated) allPassed = false;
    await rmContext.close();

    // Check 5: Sound assertions (silent until user enables it, 0 AudioContext at load, zero audio network requests)
    console.log('\n[6/8] Testing Sound system (Web Audio only, silent at load, zero audio files in network log)...');
    const audioRequests = [];
    const soundPage = await browser.newPage();
    soundPage.on('request', req => {
      const url = req.url();
      if (url.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
        audioRequests.push(url);
      }
    });

    await soundPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

    const audioContextCount = await soundPage.evaluate(() => {
      return window.__audioContextCreated || 0;
    });
    console.log(`  Audio files requested over network: ${audioRequests.length} (${audioRequests.length === 0 ? 'PASS' : 'FAIL'})`);
    console.log(`  AudioContext initialized at load: ${audioContextCount} (${audioContextCount === 0 ? 'PASS' : 'FAIL'})`);

    if (audioRequests.length > 0) allPassed = false;

    // Check 6: GitHub feed (simulate 403, network failure, and XSS injection defense)
    console.log('\n[7/8] Testing Live GitHub feed (fallback snapshot, 403 handling, XSS injection immunity)...');
    const ghPage = await browser.newPage();

    // 6a: Simulate 403
    await ghPage.route('https://api.github.com/**', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'API rate limit exceeded' })
      });
    });

    await ghPage.goto(`http://localhost:${PORT}/work`, { waitUntil: 'networkidle' });
    const statusMsg403 = await ghPage.textContent('#github-feed-status');
    const itemCount403 = await ghPage.locator('#github-feed-list li').count();
    console.log(`  [403 Rate Limit] Status: "${statusMsg403}" (${statusMsg403.includes('Showing the last saved list') ? 'PASS' : 'FAIL'})`);
    console.log(`  [403 Rate Limit] Snapshot repos rendered: ${itemCount403} (${itemCount403 >= 5 ? 'PASS' : 'FAIL'})`);

    if (!statusMsg403.includes('Showing the last saved list') || itemCount403 === 0) allPassed = false;

    // 6b: Simulate malicious repo injection with <img onerror>
    await ghPage.unroute('https://api.github.com/**');
    await ghPage.route('https://api.github.com/users/ambulj/repos*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            name: '<img src=x onerror=window.__injected_xss=true>',
            description: '<script>window.__script_xss=true</script>',
            language: 'Python',
            pushed_at: '2026-04-10T00:00:00Z',
            html_url: 'https://github.com/ambulj/safe-repo',
            owner: { login: 'ambulj' },
            private: false
          }
        ])
      });
    });
    await ghPage.route('https://api.github.com/users/Bloated11/repos*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Clear sessionStorage
    await ghPage.evaluate(() => sessionStorage.clear());
    await ghPage.goto(`http://localhost:${PORT}/work`, { waitUntil: 'networkidle' });

    const xssInjected = await ghPage.evaluate(() => window.__injected_xss || window.__script_xss || false);
    const rawRepoText = await ghPage.textContent('#github-feed-list li:first-child a');
    console.log(`  [XSS Injection Test] Injected script/img executed: ${xssInjected} (${!xssInjected ? 'PASS (blocked)' : 'FAIL'})`);
    console.log(`  [XSS Injection Test] Rendered repo title as textContent: "${rawRepoText}" (${rawRepoText.includes('<img') ? 'PASS (plain text)' : 'FAIL'})`);

    if (xssInjected || !rawRepoText.includes('<img')) allPassed = false;

    // Check 7: Live header check page on /security
    console.log('\n[8/8] Testing /security Live Header Verification...');
    const secPage = await browser.newPage();
    await secPage.goto(`http://localhost:${PORT}/security`, { waitUntil: 'networkidle' });

    await secPage.click('#check-headers-btn');
    await secPage.waitForSelector('.security-live-table tbody tr');

    const verifiedRows = await secPage.locator('.security-live-table tbody tr').count();
    const passBadges = await secPage.locator('.security-live-table .header-badge-pass').count();
    const failBadges = await secPage.locator('.security-live-table .header-badge-fail').count();

    console.log(`  Security headers verified: ${passBadges} of ${verifiedRows} reported PRESENT (fail=${failBadges})`);
    if (passBadges !== 8 || failBadges !== 0) allPassed = false;

    // Check 8: Cursor fallback over form fields
    console.log('\n[Cursor Test] Testing cursor state over form fields and touch inputs...');
    const curPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await curPage.goto(`http://localhost:${PORT}/contact`, { waitUntil: 'networkidle' });

    // Move mouse over body
    await curPage.mouse.move(100, 100);
    const hasCustomClass = await curPage.evaluate(() => document.documentElement.classList.contains('has-custom-cursor'));
    console.log(`  Custom cursor active on fine pointer body: ${hasCustomClass ? 'PASS' : 'FAIL'}`);

    // Move mouse over input
    const inputBBox = await curPage.locator('#contact-name').boundingBox();
    if (inputBBox) {
      await curPage.mouse.move(inputBBox.x + 10, inputBBox.y + 10);
      const isHiddenOverInput = await curPage.evaluate(() => {
        const c = document.getElementById('custom-cursor');
        return c.classList.contains('cursor-hidden') || window.getComputedStyle(c).display === 'none';
      });
      console.log(`  Custom cursor falls back to native over form input: ${isHiddenOverInput ? 'PASS' : 'FAIL'}`);
      if (!isHiddenOverInput) allPassed = false;
    }

    console.log(`\n=== Gate 2 Automated Test Run Complete: ${allPassed ? 'ALL PASS' : 'SOME CHECKS FAILED'} ===`);
  } finally {
    await browser.close();
    server.close();
  }

  if (!allPassed) {
    process.exit(1);
  }
}

runGate2().catch(err => {
  console.error('[test-gate2] Fatal error:', err);
  process.exit(1);
});
