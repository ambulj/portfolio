// scripts/check-links.mjs — Internal link integrity checker
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');
const htmlFiles = [];

function findHtml(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      findHtml(full);
    } else if (f.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

findHtml(DIST_DIR);

let brokenCount = 0;
let totalChecked = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Find href="..."
  const matches = content.matchAll(/href="([^"#:]+)(#[^"]*)?"/g);

  for (const m of matches) {
    const target = m[1];
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:')) continue;
    totalChecked++;

    // Resolve target path in dist
    let resolved = path.join(DIST_DIR, target.startsWith('/') ? target.slice(1) : target);
    let exists = false;

    if (fs.existsSync(resolved)) {
      if (fs.statSync(resolved).isDirectory()) {
        exists = fs.existsSync(path.join(resolved, 'index.html'));
      } else {
        exists = true;
      }
    } else if (fs.existsSync(resolved + '.html')) {
      exists = true;
    } else if (fs.existsSync(path.join(resolved, 'index.html'))) {
      exists = true;
    }

    if (!exists) {
      console.error(`[check-links] Broken link in ${path.relative(DIST_DIR, file)} -> ${target}`);
      brokenCount++;
    }
  }
}

console.log(`[check-links] Checked ${totalChecked} internal links across ${htmlFiles.length} files. Broken: ${brokenCount}`);

if (brokenCount > 0) {
  process.exit(1);
}
