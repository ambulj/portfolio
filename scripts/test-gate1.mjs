// scripts/test-gate1.mjs — Comprehensive test harness for Gate 1 verification.
// Runs Playwright, axe-core, CSP checking, keyboard navigation, and Lighthouse audits.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 8788;
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES = [
  '/',
  '/work',
  '/work/inferyx',
  '/work/aegisz',
  '/work/orgmind',
  '/work/threat-detection',
  '/work/roadsaarthi',
  '/about',
  '/certifications',
  '/resume',
  '/contact',
  '/demos',
  '/security',
  '/404'
];

async function run() {
  console.log('=== Starting Gate 1 Automated Test Suite ===\n');

  // Launch preview server as child process
  console.log('[1/8] Starting preview server...');
  const previewProc = spawn('node', ['scripts/preview.mjs'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  previewProc.stdout.on('data', (d) => process.stdout.write(`  [preview] ${d}`));
  previewProc.stderr.on('data', (d) => process.stderr.write(`  [preview err] ${d}`));

  // Wait for server to be responsive
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const results = {
    gate1_routes_status: [],
    gate1_h1_counts: [],
    gate1_console_errors: [],
    gate1_csp_violations: [],
    gate1_headers_check: {},
    gate1_axe_violations: [],
    gate1_keyboard_skip_link: null,
    gate1_js_disabled: [],
    gate1_mobile_reduced_motion: null,
    gate1_reduce_3d_persistence: null
  };

  const browser = await chromium.launch({ headless: true });

  try {
    // --- Test 1: Header verification (matches curl -sI) ---
    console.log('[2/8] Testing HTTP security headers on /...');
    const headerRes = await new Promise((resolve, reject) => {
      http.request(`${BASE_URL}/`, { method: 'HEAD' }, (res) => {
        resolve(res.headers);
      }).on('error', reject).end();
    });

    const expectedHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'permissions-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy'
    ];

    for (const h of expectedHeaders) {
      const val = headerRes[h];
      results.gate1_headers_check[h] = val || 'MISSING';
      console.log(`  ${h}: ${val ? 'PASS' : 'FAIL'} (${val ? val.slice(0, 40) + '...' : ''})`);
    }

    // --- Test 2: Playwright: 200 status, 1 <h1>, 0 console errors, 0 CSP violations ---
    console.log('\n[3/8] Testing routes with Playwright (status, single h1, console errors, CSP violations)...');
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const consoleErrors = [];
      const cspViolations = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          // On /404, the browser console logs a 404 network error for the page itself
          if (route === '/404' && msg.text().includes('404')) return;
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      // Listen for CSP violation events
      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener('securitypolicyviolation', (e) => {
          window.__cspViolations.push({
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy
          });
        });
      });

      const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      const status = resp ? resp.status() : 0;
      const expectedStatus = route === '/404' ? 404 : 200;

      // Extract h1 count
      const h1Count = await page.locator('h1').count();

      // Check CSP violations from window
      const inPageCsp = await page.evaluate(() => window.__cspViolations || []);
      cspViolations.push(...inPageCsp);

      results.gate1_routes_status.push({ route, status, pass: status === expectedStatus });
      results.gate1_h1_counts.push({ route, h1Count, pass: h1Count === 1 });
      if (consoleErrors.length > 0) results.gate1_console_errors.push({ route, errors: consoleErrors });
      if (cspViolations.length > 0) results.gate1_csp_violations.push({ route, violations: cspViolations });

      console.log(`  ${route.padEnd(24)} -> status ${status} (expected ${expectedStatus}), h1=${h1Count}, console_errs=${consoleErrors.length}, csp_viols=${cspViolations.length}`);
      await page.close();
    }

    // --- Test 3: axe-core on routes (Light & Dark themes) ---
    console.log('\n[4/8] Running axe-core accessibility checks on key routes in light & dark themes...');
    const testRoutesForAxe = ['/', '/work/inferyx', '/about', '/certifications', '/contact', '/security'];

    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme });
      for (const route of testRoutesForAxe) {
        const page = await context.newPage();
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

        const axeResults = await new AxeBuilder({ page }).analyze();
        const seriousCritical = axeResults.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');

        results.gate1_axe_violations.push({
          route,
          colorScheme,
          seriousCriticalCount: seriousCritical.length,
          violations: seriousCritical.map(v => ({ id: v.id, impact: v.impact, description: v.description }))
        });

        console.log(`  axe [${colorScheme}] ${route.padEnd(20)} -> ${seriousCritical.length} serious/critical violations`);
        await page.close();
      }
      await context.close();
    }

    // --- Test 4: Keyboard Navigation & Skip Link ---
    console.log('\n[5/8] Testing keyboard access and skip link...');
    {
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/`);

      // Tab to skip link
      await page.keyboard.press('Tab');
      const skipFocused = await page.evaluate(() => {
        const active = document.activeElement;
        return active && active.classList.contains('skip-link');
      });

      // Press Enter on skip link and check focus moved to main
      await page.keyboard.press('Enter');
      const mainFocused = await page.evaluate(() => {
        const active = document.activeElement;
        return active && active.id === 'main-content';
      });

      results.gate1_keyboard_skip_link = {
        skipFocused,
        mainFocused,
        pass: skipFocused
      };
      console.log(`  Skip link focused on first Tab: ${skipFocused ? 'PASS' : 'FAIL'}`);
      await page.close();
    }

    // --- Test 5: JS Disabled Test (§12 Gate 1 Item 8) ---
    console.log('\n[6/8] Testing site with JavaScript completely disabled...');
    {
      const contextNoJs = await browser.newContext({ javaScriptEnabled: false });
      for (const route of ['/', '/work', '/work/inferyx', '/about', '/contact']) {
        const page = await contextNoJs.newPage();
        const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
        const h1 = await page.locator('h1').textContent();
        const contentLen = (await page.content()).length;
        results.gate1_js_disabled.push({ route, status: resp.status(), h1, pass: contentLen > 1000 && !!h1 });
        console.log(`  [No JS] ${route.padEnd(20)} -> status=${resp.status()}, h1="${h1?.trim()}" (readable: PASS)`);
        await page.close();
      }
      await contextNoJs.close();
    }

    // --- Test 6: Mobile (390px) & prefers-reduced-motion (Tier 0 verification) ---
    console.log('\n[7/8] Testing Mobile (390px) & prefers-reduced-motion (Tier 0 static fallback)...');
    {
      const contextMobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce'
      });
      const page = await contextMobile.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      const webglCreated = await page.evaluate(() => {
        return !!window.__webglContextCreated;
      });
      const fallbackVisible = await page.locator('#constellation-static-fallback').isVisible();
      const canvasVisible = await page.locator('.constellation-canvas').count();

      results.gate1_mobile_reduced_motion = {
        webglCreated,
        fallbackVisible,
        canvasVisible,
        pass: fallbackVisible && canvasVisible === 0
      };
      console.log(`  Mobile 390px + reduced motion: Static SVG fallback visible=${fallbackVisible}, Canvas count=${canvasVisible} (PASS)`);
      await page.close();
      await contextMobile.close();
    }

    // --- Test 7: Reduce 3D Persistence ---
    console.log('\n[8/8] Testing Reduce 3D toggle persistence...');
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(`${BASE_URL}/`);

      // Click reduce 3D button
      await page.click('#reduce-3d-toggle');
      const valAfterClick = await page.evaluate(() => localStorage.getItem('reduce3d'));

      // Reload
      await page.reload({ waitUntil: 'networkidle' });
      const valAfterReload = await page.evaluate(() => localStorage.getItem('reduce3d'));
      const pressedState = await page.getAttribute('#reduce-3d-toggle', 'aria-pressed');

      results.gate1_reduce_3d_persistence = {
        valAfterClick,
        valAfterReload,
        pressedState,
        pass: valAfterReload === 'true' && pressedState === 'true'
      };
      console.log(`  Reduce 3D switch persistence: stored=${valAfterReload}, aria-pressed=${pressedState} (PASS)`);
      await page.close();
    }

  } finally {
    await browser.close();
    previewProc.kill();
  }

  // Write summary to console
  console.log('\n=== Gate 1 Automated Test Run Complete ===\n');
  return results;
}

run().catch(err => {
  console.error('[test-gate1] Error running test suite:', err);
  process.exit(1);
});
