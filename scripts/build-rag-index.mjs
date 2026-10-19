// scripts/build-rag-index.mjs
// Pre-computes structured RAG knowledge base from content directory
// Outputs public/data/knowledge-base.json for zero-hallucination edge and client Copilot retrieval

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'knowledge-base.json');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const chunks = [];

// 1. Ingest About Profile
const aboutPath = path.join(CONTENT_DIR, 'about.md');
if (fs.existsSync(aboutPath)) {
  const fileContent = fs.readFileSync(aboutPath, 'utf8');
  const parsed = matter(fileContent);
  chunks.push({
    id: 'about-profile',
    source: 'About Ambul Jaiswal',
    ref: '/about',
    title: 'Background & Mission',
    tags: ['about', 'bio', 'background', 'ai', 'cybersecurity', 'skills'],
    content: parsed.content.trim()
  });
}

// 2. Ingest Certifications
const certsPath = path.join(CONTENT_DIR, 'certs.json');
if (fs.existsSync(certsPath)) {
  const certsData = JSON.parse(fs.readFileSync(certsPath, 'utf8'));
  const certList = certsData
    .map(c => `- ${c.name} (${c.issuer}, ${c.date}): Skills: ${c.skills?.join(', ') || 'N/A'}`)
    .join('\n');
  chunks.push({
    id: 'certs-list',
    source: 'Verified Certifications',
    ref: '/certifications',
    title: 'Professional Certifications & Security Badges',
    tags: ['certifications', 'credentials', 'security', 'comptia', 'aws', 'ibm'],
    content: `Ambul Jaiswal holds 10 verified certifications in machine learning, cybersecurity, and cloud security:\n${certList}`
  });
}

// 3. Ingest Timeline
const timelinePath = path.join(CONTENT_DIR, 'timeline.json');
if (fs.existsSync(timelinePath)) {
  const timelineData = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const eventList = timelineData
    .map(t => `- ${t.date}: ${t.title} (${t.organization || 'Independent'}): ${t.description}`)
    .join('\n');
  chunks.push({
    id: 'career-timeline',
    source: 'Career Timeline',
    ref: '/about#timeline',
    title: 'Milestones & Research Timeline',
    tags: ['timeline', 'experience', 'career', 'education', 'hackathons'],
    content: `Key career milestones and research achievements:\n${eventList}`
  });
}

// 4. Ingest Projects / Case Studies
const projectsDir = path.join(CONTENT_DIR, 'projects');
if (fs.existsSync(projectsDir)) {
  const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));

  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const slug = path.basename(file, '.md');
    const data = parsed.data;

    // Overview Chunk
    chunks.push({
      id: `${slug}-overview`,
      source: `${data.title} Case Study`,
      ref: `/work/${slug}`,
      title: `${data.title}: Overview & Goals`,
      tags: [slug, 'project', 'case study', ...(Array.isArray(data.stack) ? data.stack : Object.keys(data.stack || {}))],
      content: `${data.title} (${data.status}). ${data.summary}\nData Note: ${data.data_note || 'N/A'}\nStack: ${Array.isArray(data.stack) ? data.stack.join(', ') : JSON.stringify(data.stack)}`,
      metrics: data.metrics || []
    });

    // Sub-sections from markdown
    const sections = parsed.content.split(/\n(?=## )/);
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i].trim();
      if (!sec) continue;
      const lines = sec.split('\n');
      const headerLine = lines[0].replace(/^##\s*/, '').trim();
      const body = lines.slice(1).join('\n').trim();

      if (body.length > 30) {
        chunks.push({
          id: `${slug}-sec-${i}`,
          source: `${data.title} (${headerLine})`,
          ref: `/work/${slug}#${headerLine.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: `${data.title}: ${headerLine}`,
          tags: [slug, headerLine.toLowerCase(), 'deep dive'],
          content: `${headerLine}:\n${body}`
        });
      }
    }
  }
}

// Write JSON artifact
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunks, null, 2), 'utf8');
console.log(`[build-rag-index] Successfully generated ${chunks.length} knowledge chunks in ${OUTPUT_FILE}`);
