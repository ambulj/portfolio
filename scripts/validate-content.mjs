import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  ProjectFrontmatterSchema,
  SiteSchema,
  StatusSchema,
  CertSchema,
  TimelineEventSchema,
} from '../src/lib/content/schemas.ts';

const contentDir = path.resolve('content');
let hasError = false;

console.log('=== VALIDATING CONTENT SCHEMAS (Zod) ===');

// 1. Site config
try {
  const site = JSON.parse(fs.readFileSync(path.join(contentDir, 'site.json'), 'utf-8'));
  SiteSchema.parse(site);
  console.log('✓ site.json valid');
} catch (err) {
  console.error('✗ site.json invalid:', err.message);
  hasError = true;
}

// 2. Status config
try {
  const status = JSON.parse(fs.readFileSync(path.join(contentDir, 'status.json'), 'utf-8'));
  StatusSchema.parse(status);
  console.log('✓ status.json valid');
} catch (err) {
  console.error('✗ status.json invalid:', err.message);
  hasError = true;
}

// 3. Certs
try {
  const certs = JSON.parse(fs.readFileSync(path.join(contentDir, 'certs.json'), 'utf-8'));
  certs.forEach((c) => CertSchema.parse(c));
  console.log(`✓ certs.json valid (${certs.length} certifications)`);
} catch (err) {
  console.error('✗ certs.json invalid:', err.message);
  hasError = true;
}

// 4. Timeline
try {
  const timeline = JSON.parse(fs.readFileSync(path.join(contentDir, 'timeline.json'), 'utf-8'));
  timeline.forEach((t) => TimelineEventSchema.parse(t));
  console.log(`✓ timeline.json valid (${timeline.length} events)`);
} catch (err) {
  console.error('✗ timeline.json invalid:', err.message);
  hasError = true;
}

// 5. Projects
const projectsDir = path.join(contentDir, 'projects');
if (fs.existsSync(projectsDir)) {
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
      const { data } = matter(raw);
      ProjectFrontmatterSchema.parse({
        ...data,
        slug: data.slug || file.replace(/\.md$/, ''),
      });
      console.log(`✓ projects/${file} valid`);
    } catch (err) {
      console.error(`✗ projects/${file} invalid:`, err.message);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\nContent schema validation failed.');
  process.exit(1);
} else {
  console.log('\nAll content schemas passed validation.');
  process.exit(0);
}
