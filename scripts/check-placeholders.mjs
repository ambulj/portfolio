import fs from 'fs';
import path from 'path';

const contentDir = path.resolve('content');
const isStrict = process.argv.includes('--strict');
const isWarn = process.argv.includes('--warn');

console.log('=== SCANNING FOR PLACEHOLDERS & VERIFY TOKENS ===');

const found = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.matchAll(/\[\[(PLACEHOLDER|VERIFY):\s*([^\]]+)\]\]/g);
      for (const m of matches) {
        found.push({
          file: path.relative(process.cwd(), fullPath),
          type: m[1],
          text: m[2],
        });
      }
    }
  }
}

scanDir(contentDir);

if (found.length > 0) {
  console.log(`Found ${found.length} placeholder / verify token(s):`);
  for (const item of found) {
    console.log(`  [${item.type}] ${item.file}: "${item.text}"`);
  }

  if (isStrict) {
    console.error('\nFAIL: strict check enabled and placeholder tokens remain.');
    process.exit(1);
  } else {
    console.log('\nNotice: placeholder tokens preserved as required by DESIGN.md honesty rules.');
    process.exit(0);
  }
} else {
  console.log('Zero placeholder / verify tokens found.');
  process.exit(0);
}
