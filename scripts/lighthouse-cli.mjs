// scripts/lighthouse-cli.mjs — Runs Lighthouse via CLI on target routes
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';

const PORT = 8788;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ROUTES = ['/', '/work/inferyx', '/about'];

async function main() {
  console.log('[lh] Starting preview server...');
  const preview = spawn('node', ['scripts/preview.mjs'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500));

  const tableData = [];

  try {
    for (const route of ROUTES) {
      for (const preset of ['desktop', 'mobile']) {
        const url = `${BASE_URL}${route}`;
        const tmpFile = `lh-${route.replace(/[/]/g, '_')}-${preset}.json`;
        console.log(`[lh] Auditing ${url} (${preset})...`);

        const args = [
          'lighthouse',
          url,
          '--output=json',
          `--output-path=${tmpFile}`,
          '--chrome-flags=--headless=new --no-sandbox',
          '--only-categories=performance,accessibility,best-practices',
          '--quiet'
        ];

        if (preset === 'desktop') {
          args.push('--preset=desktop');
        }

        try {
          execFileSync('npx.cmd', args, { shell: true, stdio: 'ignore' });
          if (fs.existsSync(tmpFile)) {
            const lhr = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
            fs.unlinkSync(tmpFile);
            const perf = Math.round((lhr.categories.performance?.score || 0) * 100);
            const a11y = Math.round((lhr.categories.accessibility?.score || 0) * 100);
            const bp = Math.round((lhr.categories['best-practices']?.score || 0) * 100);

            tableData.push({ route, preset, perf, a11y, bestPractices: bp });
            console.log(`  -> ${route} [${preset}]: Perf=${perf}, A11y=${a11y}, BestPractices=${bp}`);
          }
        } catch (e) {
          console.error(`  -> Failed ${route} (${preset}):`, e.message);
        }
      }
    }
  } finally {
    preview.kill();
  }

  console.log('\n=== Lighthouse Recorded Scores ===');
  console.table(tableData);
}

main();
