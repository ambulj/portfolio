import fs from 'fs';
import path from 'path';

const outDir = path.resolve('out');
const targetEmail = 'ambuljaiswal5@gmail.com';

console.log(`=== SCANNING OUT/ FOR EMAIL LEAKS (${targetEmail}) ===`);

if (!fs.existsSync(outDir)) {
  console.error('ERROR: out/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

let leakCount = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.txt') || entry.name.endsWith('.xml'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(targetEmail)) {
        console.error(`✗ LEAK DETECTED in: ${path.relative(process.cwd(), fullPath)}`);
        leakCount++;
      }
    }
  }
}

scanDir(outDir);

if (leakCount > 0) {
  console.error(`\nFAIL: Detected ${leakCount} occurrence(s) of plaintext email in static build output.`);
  process.exit(1);
} else {
  console.log('✓ PASS: 0 occurrences of plaintext email found in out/. Invariant preserved.');
  process.exit(0);
}
