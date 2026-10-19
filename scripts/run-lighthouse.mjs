// scripts/run-lighthouse.mjs — Runs Lighthouse on /, /work/inferyx, and /about
// Launches a dedicated clean browser for each audit to ensure stability.

import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { spawn } from 'node:child_process';

const PORT = 8788;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ROUTES = ['/', '/work/inferyx', '/about'];

async function runAudits() {
  console.log('[lighthouse] Starting preview server...');
  const previewProc = spawn('node', ['scripts/preview.mjs'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500));

  const results = [];
  const debugPort = 9222;

  try {
    for (const route of ROUTES) {
      for (const formFactor of ['mobile', 'desktop']) {
        const url = `${BASE_URL}${route}`;
        console.log(`[lighthouse] Auditing ${route} (${formFactor})...`);

        const isDesktop = formFactor === 'desktop';
        const browser = await chromium.launch({
          args: [`--remote-debugging-port=${debugPort}`],
          headless: true
        });

        try {
          const config = isDesktop
            ? {
                extends: 'lighthouse:default',
                settings: {
                  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                  formFactor: 'desktop',
                  screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
                  throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
                }
              }
            : {
                extends: 'lighthouse:default',
                settings: {
                  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                  formFactor: 'mobile',
                  screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false }
                }
              };

          const runnerResult = await lighthouse(url, { port: debugPort, output: 'json' }, config);
          const cats = runnerResult.lhr.categories;

          const scores = {
            route,
            formFactor,
            performance: Math.round((cats.performance?.score || 0) * 100),
            accessibility: Math.round((cats.accessibility?.score || 0) * 100),
            bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
            seo: Math.round((cats.seo?.score || 0) * 100)
          };

          results.push(scores);
          console.log(`  -> ${route} [${formFactor}]: Perf=${scores.performance}, A11y=${scores.accessibility}, BestPractices=${scores.bestPractices}, SEO=${scores.seo}`);
        } catch (auditErr) {
          console.error(`  -> Failed audit on ${route} [${formFactor}]:`, auditErr.message);
        } finally {
          await browser.close();
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  } finally {
    previewProc.kill();
  }

  console.log('\n=== Lighthouse Final Summary Table ===');
  console.table(results);
  return results;
}

runAudits().catch(err => {
  console.error('[lighthouse] Fatal error:', err);
  process.exit(1);
});
