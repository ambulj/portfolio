// scripts/build.mjs — Static site builder for Ambul Jaiswal's portfolio
// Node.js 20+ ES Module

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import Ajv from 'ajv';
import matter from 'gray-matter';
import { marked } from 'marked';
import * as esbuild from 'esbuild';

import { generateConstellationSvg } from './graph-svg.mjs';
import { getDiagramSvg } from './diagrams.mjs';

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const SCHEMAS_DIR = path.join(ROOT_DIR, 'schemas');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIST = path.join(DIST_DIR, 'assets');

const isProd = process.argv.includes('--prod');
console.log(`[build] Starting build in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

// Configure marked with raw HTML disabled (§6: "marked, with raw HTML disabled")
marked.use({
  breaks: false,
  gfm: true
});

// Custom renderer to escape any raw HTML in markdown
const renderer = new marked.Renderer();
renderer.html = function ({ text }) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
marked.setOptions({ renderer });

// --- 1. Content Schema Validation ---
console.log('[build] 1. Validating content against JSON schemas...');
const ajv = new Ajv({ allErrors: true });

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateFile(schemaPath, data, name) {
  const schema = loadJson(schemaPath);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(`[build] Schema validation failed for ${name}:`, validate.errors);
    throw new Error(`Schema validation error in ${name}`);
  }
}

const siteData = loadJson(path.join(CONTENT_DIR, 'site.json'));
validateFile(path.join(SCHEMAS_DIR, 'site.schema.json'), siteData, 'site.json');

const statusData = loadJson(path.join(CONTENT_DIR, 'status.json'));
validateFile(path.join(SCHEMAS_DIR, 'status.schema.json'), statusData, 'status.json');

const graphData = loadJson(path.join(CONTENT_DIR, 'graph.json'));
validateFile(path.join(SCHEMAS_DIR, 'graph.schema.json'), graphData, 'graph.json');

const linesData = loadJson(path.join(CONTENT_DIR, 'lines.json'));
validateFile(path.join(SCHEMAS_DIR, 'lines.schema.json'), linesData, 'lines.json');

const certsData = loadJson(path.join(CONTENT_DIR, 'certs.json'));
validateFile(path.join(SCHEMAS_DIR, 'certs.schema.json'), certsData, 'certs.json');

const timelineData = loadJson(path.join(CONTENT_DIR, 'timeline.json'));
validateFile(path.join(SCHEMAS_DIR, 'timeline.schema.json'), timelineData, 'timeline.json');

// Read About content
const aboutRaw = fs.readFileSync(path.join(CONTENT_DIR, 'about.md'), 'utf8');
const aboutParsed = matter(aboutRaw);

// Read Projects
const projectFiles = fs.readdirSync(path.join(CONTENT_DIR, 'projects')).filter(f => f.endsWith('.md'));
const projects = [];
const projectSchema = loadJson(path.join(SCHEMAS_DIR, 'project.schema.json'));
const validateProject = ajv.compile(projectSchema);

for (const pFile of projectFiles) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'projects', pFile), 'utf8');
  const parsed = matter(raw);
  const valid = validateProject(parsed.data);
  if (!valid) {
    console.error(`[build] Project validation failed for ${pFile}:`, validateProject.errors);
    throw new Error(`Invalid front matter in ${pFile}`);
  }
  projects.push({
    file: pFile,
    meta: parsed.data,
    body: parsed.content,
    html: marked.parse(parsed.content)
  });
}
projects.sort((a, b) => a.meta.order - b.meta.order);

console.log(`[build] Content validation passed (${projects.length} projects).`);

// --- 2. Check Demo URLs (§6: HEAD request, 8s timeout) ---
console.log('[build] 2. Checking demo URLs...');
async function checkDemoUrl(url) {
  if (!url || url.includes('PLACEHOLDER') || url.includes('VERIFY')) {
    return 'none';
  }
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(
        u,
        { method: 'HEAD', timeout: 8000 },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve('live');
          } else {
            resolve('down');
          }
        }
      );
      req.on('timeout', () => {
        req.destroy();
        resolve('slow-start');
      });
      req.on('error', () => {
        resolve('down');
      });
      req.end();
    } catch (e) {
      resolve('none');
    }
  });
}

for (const p of projects) {
  if (p.meta.demo_url && !p.meta.demo_url.includes('PLACEHOLDER')) {
    const status = await checkDemoUrl(p.meta.demo_url);
    p.meta.demo_status = status;
    console.log(`[build] Checked ${p.meta.slug}: ${p.meta.demo_url} -> ${status}`);
  }
}

// Clean and prepare dist directory
fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DIST, { recursive: true });

// Copy public directory to dist
if (fs.existsSync(PUBLIC_DIR)) {
  fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
}

// Copy graph.json to assets for client scene loading
fs.writeFileSync(path.join(ASSETS_DIST, 'graph.json'), JSON.stringify(graphData, null, 2));

// --- 3. esbuild Bundling ---
console.log('[build] 3. Bundling assets with esbuild...');
await esbuild.build({
  entryPoints: [
    { in: path.join(ROOT_DIR, 'src', 'main.js'), out: 'main' },
    { in: path.join(ROOT_DIR, 'src', 'scene', 'scene.js'), out: 'scene' },
    { in: path.join(ROOT_DIR, 'src', 'styles', 'main.css'), out: 'main' }
  ],
  outdir: ASSETS_DIST,
  bundle: true,
  minify: isProd,
  sourcemap: !isProd,
  format: 'esm',
  target: ['es2022'],
  external: ['/fonts/*']
});

// --- 4. Prerendering HTML Pages ---
console.log('[build] 4. Prerendering routes to static HTML...');

// Load GitHub public repositories snapshot for build-time rendering (§9.4)
let githubSnapshot = [];
try {
  githubSnapshot = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'github-snapshot.json'), 'utf8'));
} catch (e) {
  console.warn('[build] Could not load github-snapshot.json:', e.message);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSnapshotItems(repos) {
  return repos.map(repo => `
    <li class="github-repo-item">
      <div class="github-repo-header">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
        <span class="github-repo-owner">${escapeHtml(repo.owner)}</span>
      </div>
      <p class="github-repo-desc">${escapeHtml(repo.description || '')}</p>
      <div class="github-repo-meta">
        <span class="github-repo-lang">${escapeHtml(repo.language || 'Plain text')}</span>
        <span class="github-repo-date">Pushed ${escapeHtml((repo.updated_at || '').split('T')[0])}</span>
      </div>
    </li>
  `).join('\n');
}


function renderGitHubFeedSection() {
  const snapshotJsonEscaped = JSON.stringify(githubSnapshot).replace(/"/g, '&quot;');
  return `
  <section class="github-feed-box mt-6" id="github-feed-container" data-snapshot="${snapshotJsonEscaped}">
    <h2>Public Repositories</h2>
    <div class="github-feed-status" id="github-feed-status">Showing the last saved list.</div>
    <ul class="github-feed-list" id="github-feed-list">
      ${renderSnapshotItems(githubSnapshot)}
    </ul>
  </section>`;
}

// Common layout components
function renderStatusStrip() {
  if (!statusData.open_to_internships) return '';
  return `
  <div class="status-strip" role="region" aria-label="Internship availability">
    Open to internships. Available from ${statusData.available_from}.
  </div>`;
}

function renderNav(activePath) {
  return `
  <header class="site-header">
    ${renderStatusStrip()}
    <nav class="site-nav" aria-label="Main navigation">
      <div class="nav-left">
        <a href="/" class="nav-mark-link" aria-label="${siteData.short_name} — Home">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <polyline points="4,21 12,4 20,21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="4" r="2.5" fill="var(--mark)"/>
          </svg>
        </a>
        <ul class="nav-links">
          <li><a href="/work" ${activePath.startsWith('/work') ? 'aria-current="page"' : ''}>Work</a></li>
          <li><a href="/lab" ${activePath === '/lab' ? 'aria-current="page"' : ''}>Lab</a></li>
          <li><a href="/about" ${activePath === '/about' ? 'aria-current="page"' : ''}>About</a></li>
          <li><a href="/certifications" ${activePath === '/certifications' ? 'aria-current="page"' : ''}>Certifications</a></li>
          <li><a href="/resume" ${activePath === '/resume' ? 'aria-current="page"' : ''}>Resume</a></li>
          <li><a href="/contact" ${activePath === '/contact' ? 'aria-current="page"' : ''}>Contact</a></li>
        </ul>
      </div>
      <div class="nav-right">
        <button type="button" class="btn btn-primary" data-action="open-contact-panel">Get in touch</button>
        <button type="button" class="toggle-switch" id="reduce-3d-toggle" aria-pressed="false" aria-label="Toggle 3D constellation scene">
          <span class="toggle-indicator" aria-hidden="true"></span>
          <span class="toggle-label">Reduce 3D</span>
        </button>
        <div class="sound-toggle-wrapper">
          <button type="button" class="toggle-switch" id="sound-toggle" aria-pressed="false" aria-haspopup="true" aria-expanded="false" aria-label="Toggle UI and ambient sound">
            <span class="toggle-indicator" aria-hidden="true"></span>
            <span class="toggle-label">Sound: OFF</span>
          </button>
          <div class="sound-menu-popup" id="sound-menu-popup" hidden>
            <button type="button" id="sound-ui-btn" aria-pressed="false">UI Tick [OFF]</button>
            <button type="button" id="sound-ambient-btn" aria-pressed="false">Ambient [OFF]</button>
          </div>
        </div>
      </div>
    </nav>
  </header>`;
}

function renderFooter() {
  const buildDate = new Date().toISOString().split('T')[0];
  return `
  <footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-col">
        <div class="footer-heading">Navigation</div>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/work">Work</a></li>
          <li><a href="/lab">Lab</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/certifications">Certifications</a></li>
          <li><a href="/resume">Resume</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/demos">Demos</a></li>
          <li><a href="/security">Security headers</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-heading">Connect</div>
        <ul>
          <li><a href="${siteData.github[0]}" target="_blank" rel="noopener noreferrer">GitHub (${siteData.github[0].replace('https://github.com/', '')})</a></li>
          <li><a href="${siteData.github[1]}" target="_blank" rel="noopener noreferrer">GitHub (${siteData.github[1].replace('https://github.com/', '')})</a></li>
          <li><a href="${siteData.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-heading">Security &amp; Policy</div>
        <ul>
          <li><a href="/.well-known/security.txt">security.txt</a></li>
          <li><a href="/security">Security policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>Hand-built with HTML, CSS and a small amount of JavaScript.</div>
      <div>Last updated ${buildDate}</div>
    </div>
  </footer>

  <!-- Contact Slide-over Drawer (§5 & §8.1) -->
  <div class="contact-panel-overlay" id="contact-panel-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Get in touch panel">
    <div class="contact-panel">
      <div class="contact-panel-header">
        <h2>Get in touch</h2>
        <button type="button" class="btn" id="close-contact-panel" aria-label="Close panel">Close</button>
      </div>
      <form id="contact-panel-form" novalidate>
        <div class="form-group">
          <label for="panel-name">Name</label>
          <input type="text" id="panel-name" name="name" required maxlength="100">
        </div>
        <div class="form-group">
          <label for="panel-email">Email</label>
          <input type="email" id="panel-email" name="email" required maxlength="254">
        </div>
        <div class="form-group">
          <label for="panel-message">Message (max 2,000 characters)</label>
          <textarea id="panel-message" name="message" required maxlength="2000"></textarea>
        </div>
        <div class="form-status" aria-live="polite"></div>
        <button type="submit" class="btn btn-primary">Send message</button>
      </form>
    </div>
  </div>`;
}

function renderHtmlDocument({ title, metaDescription, canonicalPath, content, activePath }) {
  const fullTitle = canonicalPath === '/' ? `${siteData.name} · ${siteData.tag}` : `${title} — ${siteData.name}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${canonicalPath}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg">

  <!-- Open Graph & Twitter Cards (§8.2, §12) -->
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="https://${siteData.domain || 'ambul.dev'}${canonicalPath}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="/og.png">

  <link rel="preload" href="/fonts/IBMPlexSansCondensed-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/IBMPlexSerif-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/main.css">
  <script type="module" src="/assets/main.js"></script>
</head>
<body>
  <div id="wipe-line" class="wipe-line" aria-hidden="true"></div>
  <div id="custom-cursor" class="custom-cursor" aria-hidden="true"></div>
  <div id="route-announcer" class="sr-only" aria-live="polite"></div>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ${renderNav(activePath)}
  <main id="main-content">
    ${content}
  </main>
  ${renderFooter()}
</body>
</html>`;
}

function writeRoute(routePath, html) {
  let filePath;
  if (routePath === '/404') {
    filePath = path.join(DIST_DIR, '404.html');
  } else if (routePath === '/') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else {
    const routeDir = path.join(DIST_DIR, routePath.replace(/^\//, ''));
    fs.mkdirSync(routeDir, { recursive: true });
    filePath = path.join(routeDir, 'index.html');
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[build] Wrote ${routePath} -> ${path.relative(ROOT_DIR, filePath)}`);
}

// 4.1 Home Route (/)
const caseStudyProjects = projects.filter(p => p.meta.slug !== 'phenom');
const staticSvgHome = generateConstellationSvg(graphData, 'inferyx');
const homeOpeningLine = linesData.inferyx || 'Models fail quietly.';
const projectIndexList = caseStudyProjects
  .map(p => `<li><a href="/work/${p.meta.slug}">${p.meta.title}</a></li>`)
  .join('\n');

const homeContent = `
<div class="home-viewport">
  <div class="constellation-container scene-home" id="constellation-canvas-container" data-active-slug="inferyx">
    <div class="constellation-fallback" id="constellation-static-fallback">
      ${staticSvgHome}
    </div>
  </div>
  <div class="home-content">
    <h1 class="hero-opening-line">${homeOpeningLine}</h1>
    <div class="hero-identity">
      <div class="hero-name">${siteData.name}</div>
      <div class="hero-tag">${siteData.tag}</div>
    </div>
    <div class="index-list-container" aria-label="Accessible project navigation">
      <div class="index-label">Index</div>
      <ul class="index-list">
        ${projectIndexList}
      </ul>
    </div>
  </div>
</div>`;

writeRoute('/', renderHtmlDocument({
  title: siteData.name,
  metaDescription: `${siteData.name}: ${siteData.tag}. Portfolio of security-focused machine learning systems.`,
  canonicalPath: '/',
  content: homeContent,
  activePath: '/'
}));


// 4.2 Work Index (/work)
const workItemsHtml = caseStudyProjects
  .map(p => `
  <article class="work-index-item">
    <div class="work-status">${p.meta.status}</div>
    <h2 class="mt-0 mb-2"><a href="/work/${p.meta.slug}">${p.meta.title}</a></h2>
    <p class="text-large mb-3">${p.meta.summary}</p>
    <div class="text-quiet text-small">Data: ${p.meta.data_note}</div>
  </article>`)
  .join('\n');

const workIndexContent = `
<div class="container">
  <h1>Work</h1>
  <p class="project-summary mt-4">Five security-focused machine learning systems. Each project includes real architecture details, honest evaluation notes, and what I'd change.</p>
  <div class="work-list mt-6">
    ${workItemsHtml}
  </div>
  ${renderGitHubFeedSection()}
</div>`;

writeRoute('/work', renderHtmlDocument({
  title: 'Work',
  metaDescription: 'Case studies of security-focused machine learning systems built by Ambul Jaiswal.',
  canonicalPath: '/work',
  content: workIndexContent,
  activePath: '/work'
}));

// 4.3 Five Case Studies (/work/{slug})
for (const p of projects) {
  if (p.meta.slug === 'phenom') continue;

  const diagramSvg = getDiagramSvg(p.meta.slug, p.meta.diagram_verified);
  const metricsRows = p.meta.metrics
    .map(m => `
    <tr>
      <td>${m.measure}</td>
      <td><strong>${m.value}</strong></td>
      <td>${m.data}</td>
      <td>${m.hardware}</td>
      <td>${m.method}</td>
    </tr>`)
    .join('\n');

  const stackHtml = Object.entries(p.meta.stack || {})
    .map(([group, items]) => `
    <div class="stack-group">
      <span class="stack-group-title">${group}:</span>
      <span class="stack-group-items">${items.join(', ')}</span>
    </div>`)
    .join('\n');

  const changesList = p.meta.changes
    .map(c => `<li>${c}</li>`)
    .join('\n');

  const repoHtml = p.meta.repo_private
    ? `<div class="mt-4 font-heading text-quiet">Source is private. Walkthrough on request.</div>`
    : p.meta.repo_url
      ? `<div class="mt-4"><a href="${p.meta.repo_url}" target="_blank" rel="noopener noreferrer">View repository on GitHub</a></div>`
      : '';

  const demoHtml = p.meta.demo_url
    ? `<div class="mt-2"><a href="${p.meta.demo_url}" target="_blank" rel="noopener noreferrer">Open demo</a> ${p.meta.demo_note ? `<span class="text-quiet text-small">(${p.meta.demo_note})</span>` : ''}</div>`
    : '';

  const hardeningHtml = p.meta.hardening_status
    ? `<div class="hardening-callout">
         <h4>Hardening my own tool</h4>
         <p class="m-0 text-small text-italic">Status: ${p.meta.hardening_status}</p>
       </div>`
    : '';

  const independentWarning = p.meta.independent_prototype
    ? `<div class="independent-prototype-box">
         <strong>Independent prototype notice:</strong> An independent prototype. It is not an official product of any government body, and its data is synthetic.
       </div>`
    : '';

  const caseStudyContent = `
  <div class="container">
    <div class="case-study-layout">
      <!-- Pinned Architecture Diagram Column -->
      <aside class="pinned-diagram-column" aria-label="Architecture diagram">
        <div class="diagram-header">
          <div class="diagram-title">System Architecture</div>
          ${!p.meta.diagram_verified ? '<span class="draft-tag">draft diagram</span>' : ''}
        </div>
        <div class="diagram-viewport">
          ${diagramSvg}
        </div>
      </aside>

      <!-- Content Column -->
      <article class="case-study-content">
        <h1>${p.meta.title}</h1>
        <p class="project-summary">${p.meta.summary}</p>

        ${independentWarning}

        <div class="data-note-box">
          <strong>Data note:</strong> ${p.meta.data_note}
        </div>

        <section class="case-study-body" data-arch-part="1">
          ${p.html}
        </section>

        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col">Value</th>
              <th scope="col">Data</th>
              <th scope="col">Hardware</th>
              <th scope="col">Method</th>
            </tr>
          </thead>
          <tbody>
            ${metricsRows}
          </tbody>
        </table>

        <section class="what-i-would-change">
          <h3>What I'd change</h3>
          <ul>
            ${changesList}
          </ul>
        </section>

        ${hardeningHtml}

        <section class="stack-section">
          <h2>Stack</h2>
          ${stackHtml}
          ${repoHtml}
          ${demoHtml}
        </section>
      </article>
    </div>
  </div>`;

  writeRoute(`/work/${p.meta.slug}`, renderHtmlDocument({
    title: p.meta.title,
    metaDescription: `${p.meta.title}: ${p.meta.summary}`,
    canonicalPath: `/work/${p.meta.slug}`,
    content: caseStudyContent,
    activePath: `/work/${p.meta.slug}`
  }));
}

// 4.3b Lab Route (/lab) - phenom only (§5, §7.3)
const phenomProject = projects.find(p => p.meta.slug === 'phenom');
if (phenomProject) {
  const diagramSvg = getDiagramSvg('phenom', phenomProject.meta.diagram_verified);
  const metricsRows = phenomProject.meta.metrics
    .map(m => `
    <tr>
      <td>${m.measure}</td>
      <td><strong>${m.value}</strong></td>
      <td>${m.data}</td>
      <td>${m.hardware}</td>
      <td>${m.method}</td>
    </tr>`)
    .join('\n');

  const stackHtml = Object.entries(phenomProject.meta.stack || {})
    .map(([group, items]) => `
    <div class="stack-group">
      <span class="stack-group-title">${group}:</span>
      <span class="stack-group-items">${items.join(', ')}</span>
    </div>`)
    .join('\n');

  const changesList = phenomProject.meta.changes
    .map(c => `<li>${c}</li>`)
    .join('\n');

  const repoHtml = phenomProject.meta.repo_url
    ? `<div class="mt-4"><a href="${phenomProject.meta.repo_url}" target="_blank" rel="noopener noreferrer">View repository on GitHub</a></div>`
    : '';

  const labContent = `
  <div class="container">
    <div class="case-study-layout">
      <!-- Pinned Architecture Diagram Column -->
      <aside class="pinned-diagram-column" aria-label="Architecture diagram">
        <div class="diagram-header">
          <div class="diagram-title">System Architecture</div>
          ${!phenomProject.meta.diagram_verified ? '<span class="draft-tag">draft diagram</span>' : ''}
        </div>
        <div class="diagram-viewport">
          ${diagramSvg}
        </div>
      </aside>

      <!-- Content Column -->
      <article class="case-study-content">
        <h1>Lab — phenom</h1>
        <p class="project-summary">${phenomProject.meta.summary}</p>

        <div class="data-note-box">
          <strong>Honest framing:</strong> ${phenomProject.meta.data_note}
        </div>

        <section class="case-study-body" data-arch-part="1">
          ${phenomProject.html}
        </section>

        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col">Value</th>
              <th scope="col">Data</th>
              <th scope="col">Hardware</th>
              <th scope="col">Method</th>
            </tr>
          </thead>
          <tbody>
            ${metricsRows}
          </tbody>
        </table>

        <section class="what-i-would-change">
          <h3>What I'd change</h3>
          <ul>
            ${changesList}
          </ul>
        </section>

        <section class="stack-section">
          <h2>Stack</h2>
          ${stackHtml}
          ${repoHtml}
        </section>
      </article>
    </div>
  </div>`;

  writeRoute('/lab', renderHtmlDocument({
    title: 'Lab — phenom',
    metaDescription: `phenom: ${phenomProject.meta.summary}`,
    canonicalPath: '/lab',
    content: labContent,
    activePath: '/lab'
  }));
}


// 4.4 About Route (/about)
const timelineItemsHtml = timelineData
  .map(t => `
  <li class="timeline-item">
    <div class="timeline-date">${t.date}</div>
    <div class="timeline-title">${t.title}</div>
    <div class="timeline-detail">${t.detail}</div>
  </li>`)
  .join('\n');

const howIWorkHtml = (aboutParsed.data.how_i_work || [])
  .map(item => `<li>${item}</li>`)
  .join('\n');

const currentlyHtml = (aboutParsed.data.currently || [])
  .map(item => `<li>${item}</li>`)
  .join('\n');

const aboutContent = `
<div class="container">
  <h1>About</h1>
  <div class="mt-5">
    <p class="text-large">${aboutParsed.data.bio.replace(/\n\n/g, '</p><p class="text-large">')}</p>
  </div>

  <h2>How I work</h2>
  <ul>
    ${howIWorkHtml}
  </ul>

  <h2>Currently learning and building</h2>
  <ul>
    ${currentlyHtml}
  </ul>

  <h2>Timeline</h2>
  <ul class="timeline-list">
    ${timelineItemsHtml}
  </ul>
</div>`;

writeRoute('/about', renderHtmlDocument({
  title: 'About',
  metaDescription: `Bio, work philosophy, and timeline of Ambul Jaiswal.`,
  canonicalPath: '/about',
  content: aboutContent,
  activePath: '/about'
}));

// 4.5 Certifications Route (/certifications)
const featuredCerts = certsData.filter(c => c.featured);
const listedCerts = certsData.filter(c => !c.featured);

function renderCertCard(c) {
  const verifiedBadge = c.verified ? '' : ' <span class="draft-tag">unverified</span>';
  return `
  <div class="cert-card">
    <div class="cert-meta">${c.issuer} · ${c.date}${verifiedBadge}</div>
    <h3 class="cert-title">${c.title}</h3>
    ${c.attach_to ? `<div class="cert-rel">Related project: <strong>${c.attach_to}</strong></div>` : ''}
    <div><a href="${c.url}" target="_blank" rel="noopener noreferrer">View credential</a></div>
  </div>`;
}

const certsContent = `
<div class="container">
  <h1>Certifications</h1>
  <p class="project-summary mt-4">Four featured security and data science credentials, tied to practical projects.</p>

  <h2>Featured</h2>
  <div>
    ${featuredCerts.map(renderCertCard).join('\n')}
  </div>

  <h2>Additional Credentials</h2>
  <div>
    ${listedCerts.map(renderCertCard).join('\n')}
  </div>
</div>`;

writeRoute('/certifications', renderHtmlDocument({
  title: 'Certifications',
  metaDescription: 'Verified certifications in graph databases, cloud threat command, and cybersecurity analysis.',
  canonicalPath: '/certifications',
  content: certsContent,
  activePath: '/certifications'
}));

// 4.6 Resume Route (/resume)
const resumeContent = `
<div class="container">
  <h1>Resume</h1>
  <div class="mb-5 mt-4">
    <a href="/resume.pdf" download class="btn btn-primary" id="download-resume-btn">Download resume</a>
  </div>

  <h2>Summary</h2>
  <div class="mb-6">
    <p><strong>Education:</strong> B.Tech in Computer Science and Engineering, UTU Roorkee (2024–2028).</p>
    <p><strong>Focus:</strong> Security-focused machine learning systems, model integrity, zero-knowledge AI gateways, and statistical anomaly detection.</p>
    <p><strong>Key Projects:</strong> Inferyx (AutoML studio), AegisZ (post-quantum zero-knowledge gateway), OrgMind (grounded knowledge graph), AI Threat Detection System, RoadSaarthi.</p>
  </div>

  <h2>Document Viewer</h2>
  <div class="pdf-viewer-container">
    <object data="/resume.pdf" type="application/pdf" width="100%" height="100%">
      <p class="pdf-placeholder-text">Resume PDF not uploaded yet. <br><br> ${siteData.calendar_url}</p>
    </object>
  </div>
</div>`;

writeRoute('/resume', renderHtmlDocument({
  title: 'Resume',
  metaDescription: 'Resume of Ambul Jaiswal: B.Tech CSE student specializing in cybersecurity and data science.',
  canonicalPath: '/resume',
  content: resumeContent,
  activePath: '/resume'
}));

// 4.7 Contact Route (/contact)
const contactContent = `
<div class="container">
  <h1>Contact</h1>
  <p class="project-summary mt-4">Open to internships and research collaborations. Send a message or reveal email below.</p>

  <div class="mb-6 mt-5">
    <h2>Send a message</h2>
    <form id="contact-page-form" novalidate>
      <div class="form-group">
        <label for="contact-name">Name</label>
        <input type="text" id="contact-name" name="name" required maxlength="100">
      </div>
      <div class="form-group">
        <label for="contact-email">Email</label>
        <input type="email" id="contact-email" name="email" required maxlength="254">
      </div>
      <div class="form-group">
        <label for="contact-message">Message (max 2,000 characters)</label>
        <textarea id="contact-message" name="message" required maxlength="2000"></textarea>
      </div>
      <div class="form-status" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary">Send message</button>
    </form>
  </div>

  <div class="section-divider">
    <h2>Direct channels</h2>
    <div class="mb-4">
      <button type="button" class="btn" id="reveal-email-btn" data-u="${siteData.email_parts[0]}" data-d="${siteData.email_parts[1]}">Show email</button>
      <span id="revealed-email" class="revealed-email-text" aria-live="polite"></span>
    </div>
    <div class="mb-3">
      Calendar: ${siteData.calendar_url}
    </div>
    <div class="mb-3">
      LinkedIn: <a href="${siteData.linkedin}" target="_blank" rel="noopener noreferrer">${siteData.linkedin}</a>
    </div>
    <div>
      GitHub: <a href="${siteData.github[0]}" target="_blank" rel="noopener noreferrer">${siteData.github[0]}</a> · <a href="${siteData.github[1]}" target="_blank" rel="noopener noreferrer">${siteData.github[1]}</a>
    </div>
  </div>
</div>`;

writeRoute('/contact', renderHtmlDocument({
  title: 'Contact',
  metaDescription: 'Get in touch with Ambul Jaiswal via secure message form or verified direct channels.',
  canonicalPath: '/contact',
  content: contactContent,
  activePath: '/contact'
}));

// 4.8 Demos Route (/demos)
const demoRows = caseStudyProjects
  .map(p => {
    const statusLabel = p.meta.demo_status === 'live'
      ? '<span class="status-badge-live">Live</span>'
      : p.meta.demo_status === 'slow-start'
        ? '<span class="status-badge-slow">Slow-start</span>'
        : '<span class="status-badge-none">None / Private</span>';

    const link = p.meta.demo_url && !p.meta.demo_url.includes('PLACEHOLDER')
      ? `<a href="${p.meta.demo_url}" target="_blank" rel="noopener noreferrer">Open demo</a>`
      : p.meta.demo_url || 'None';

    return `
    <tr>
      <td><a href="/work/${p.meta.slug}">${p.meta.title}</a></td>
      <td>${statusLabel}</td>
      <td>${link}</td>
      <td>${p.meta.demo_note || '—'}</td>
    </tr>`;
  })
  .join('\n');

const demosContent = `
<div class="container">
  <h1>Hosted Demos</h1>
  <p class="project-summary mt-4">Status stamped at build time via automated HEAD request checks.</p>
  <table>
    <thead>
      <tr>
        <th scope="col">Project</th>
        <th scope="col">Status</th>
        <th scope="col">Demo Link</th>
        <th scope="col">Notes</th>
      </tr>
    </thead>
    <tbody>
      ${demoRows}
    </tbody>
  </table>
</div>`;

writeRoute('/demos', renderHtmlDocument({
  title: 'Hosted Demos',
  metaDescription: 'Status and links for live demonstrations of projects.',
  canonicalPath: '/demos',
  content: demosContent,
  activePath: '/demos'
}));

// 4.9 Security Page (/security)
const securityContent = `
<div class="container">
  <h1>Security Policy and Headers</h1>
  <p class="project-summary mt-4">This site belongs to a cybersecurity portfolio and follows strict defense-in-depth principles. Every header is explicitly declared with zero inline scripts or styles.</p>

  <h2>HTTP Security Headers</h2>
  <table>
    <thead>
      <tr>
        <th scope="col">Header</th>
        <th scope="col">What it blocks</th>
        <th scope="col">Why it is set</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>Content-Security-Policy</code></td>
        <td>Inline scripts, inline event handlers, style attributes, unauthorized CDNs</td>
        <td>Eliminates Cross-Site Scripting (XSS) and code injection vectors.</td>
      </tr>
      <tr>
        <td><code>Strict-Transport-Security</code></td>
        <td>Unencrypted HTTP connections and downgrade attacks</td>
        <td>Enforces TLS 1.3 across all subdomains for 1 year.</td>
      </tr>
      <tr>
        <td><code>X-Content-Type-Options</code></td>
        <td>MIME-type sniffing</td>
        <td>Forces browsers to respect declared media types.</td>
      </tr>
      <tr>
        <td><code>X-Frame-Options</code></td>
        <td>Framing by any external site</td>
        <td>Prevents clickjacking attacks.</td>
      </tr>
      <tr>
        <td><code>Referrer-Policy</code></td>
        <td>Origin path leakage on outbound requests</td>
        <td>Sends only origin on cross-origin requests.</td>
      </tr>
      <tr>
        <td><code>Permissions-Policy</code></td>
        <td>Camera, microphone, geolocation, USB, payment APIs</td>
        <td>Restricts browser hardware access.</td>
      </tr>
      <tr>
        <td><code>Cross-Origin-Opener-Policy</code></td>
        <td>Cross-origin window interactions</td>
        <td>Isolates top-level browsing context.</td>
      </tr>
      <tr>
        <td><code>Cross-Origin-Resource-Policy</code></td>
        <td>Cross-origin reads of static assets</td>
        <td>Restricts resource loading to same-origin.</td>
      </tr>
    </tbody>
  </table>

  <h2>Third-Party Exceptions</h2>
  <ul>
    <li><strong>Cloudflare Turnstile:</strong> <code>https://challenges.cloudflare.com</code> — Captcha-free bot protection on contact endpoints.</li>
    <li><strong>Cloudflare Web Analytics:</strong> <code>https://static.cloudflareinsights.com</code> and <code>https://cloudflareinsights.com</code> — Cookie-free, privacy-preserving metrics.</li>
    <li><strong>GitHub API:</strong> <code>https://api.github.com</code> — Used in Phase 2 for public repository metadata.</li>
  </ul>

  <div class="section-divider mt-6 mb-6" id="live-header-checker">
    <h2>Live Header Verification</h2>
    <p class="text-quiet mb-4">Verify HTTP response headers delivered by this origin in real-time via same-origin HEAD request.</p>
    <button type="button" class="btn btn-primary" id="check-headers-btn">Check this page</button>
    <div id="header-check-results" class="mt-4" aria-live="polite"></div>
  </div>
</div>`;

writeRoute('/security', renderHtmlDocument({
  title: 'Security',
  metaDescription: 'Detailed breakdown of HTTP security headers and CSP policy.',
  canonicalPath: '/security',
  content: securityContent,
  activePath: '/security'
}));

// 4.10 404 Page (/404)
const notFoundContent = `
<div class="container pt-8">
  <div class="text-quiet mb-2 font-heading">404 Not Found</div>
  <h1>Route not found</h1>
  <p class="mt-4 mb-6">The requested page does not exist. Explore the project index below:</p>
  <ul class="index-list">
    ${projectIndexList}
  </ul>
</div>`;

writeRoute('/404', renderHtmlDocument({
  title: '404 Not Found',
  metaDescription: 'Page not found.',
  canonicalPath: '/404',
  content: notFoundContent,
  activePath: '/404'
}));

// --- 5. Generate Static Assets: _headers, _redirects, sitemap.xml, robots.txt, security.txt ---
console.log('[build] 5. Writing configuration and meta files...');

// Copy og.png if present
if (fs.existsSync(path.join(PUBLIC_DIR, 'og.png'))) {
  fs.copyFileSync(path.join(PUBLIC_DIR, 'og.png'), path.join(DIST_DIR, 'og.png'));
  console.log('[build] Copied public/og.png -> dist/og.png');
}

const headersContent = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache
`;

fs.writeFileSync(path.join(DIST_DIR, '_headers'), headersContent, 'utf8');

const redirectsContent = `/colophon /security 302\n`;
fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsContent, 'utf8');

const robotsContent = `User-agent: *
Allow: /
Sitemap: https://${siteData.domain}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsContent, 'utf8');

const securityTxtDir = path.join(DIST_DIR, '.well-known');
fs.mkdirSync(securityTxtDir, { recursive: true });
const securityTxtContent = `Contact: https://${siteData.domain}/contact
Expires: [[PLACEHOLDER: a date under 12 months from publishing]]
Preferred-Languages: en
Canonical: https://${siteData.domain}/.well-known/security.txt
`;
fs.writeFileSync(path.join(securityTxtDir, 'security.txt'), securityTxtContent, 'utf8');

const sitemapUrls = [
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
  '/security'
];


const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>https://${siteData.domain}${u}</loc></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent, 'utf8');

// --- 6. Placeholder / Verify Token Audit & Email Privacy Check ---
console.log('\n[build] 6. Auditing placeholders, verification tokens, and email leakage...');

function scanDirForTokens(dir) {
  const tokens = [];
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    const full = path.join(dir, f);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(full);
    if (!['.html', '.md', '.json', '.txt', '.xml'].includes(ext)) continue;
    const text = fs.readFileSync(full, 'utf8');

    // Match [[PLACEHOLDER: ...]] or [[VERIFY: ...]]
    const matches = text.match(/\[\[(PLACEHOLDER|VERIFY):?\s*([^\]]+)\]\]/g);
    if (matches) {
      matches.forEach(m => tokens.push({ file: path.relative(ROOT_DIR, full), token: m }));
    }

    // Email address privacy check in built HTML
    if (ext === '.html') {
      const emailPattern = /ambuljaiswal5@gmail\.com/i;
      if (emailPattern.test(text)) {
        throw new Error(`SECURITY LEAK: Raw email address found in built HTML file: ${full}`);
      }
    }
  }
  return tokens;
}

const foundTokens = scanDirForTokens(DIST_DIR);
console.log(`\n=== Placeholder & Verification Report (${foundTokens.length} tokens found) ===`);
foundTokens.forEach(t => console.log(`  [${t.file}] ${t.token}`));

if (isProd) {
  if (foundTokens.length > 0) {
    console.error(`\n[build:prod] ERROR: Production build failed! ${foundTokens.length} placeholder or verify tokens remain in output.`);
    process.exit(1);
  }
}

console.log('\n[build] Build completed successfully.');
