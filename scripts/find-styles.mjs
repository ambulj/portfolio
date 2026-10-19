import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const files = fs.readdirSync(dist, { recursive: true });

for (const f of files) {
  if (f.endsWith('.html')) {
    const full = path.join(dist, f);
    const content = fs.readFileSync(full, 'utf8');
    const matches = content.match(/style="[^"]*"/g);
    if (matches) {
      console.log(`${f}: ${matches.length} inline style attributes! Example:`, matches[0]);
    }
  }
}
