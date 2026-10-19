// scripts/preview.mjs — Zero-dependency preview server for local testing.
// Strictly applies production headers from dist/_headers and mocks /api/contact.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8788;
const DIST_DIR = fs.existsSync(path.join(process.cwd(), 'out'))
  ? path.join(process.cwd(), 'out')
  : path.join(process.cwd(), 'dist');

// Parse _headers
function loadHeadersMap() {
  const headersFile = path.join(DIST_DIR, '_headers');
  if (!fs.existsSync(headersFile)) return [];
  const lines = fs.readFileSync(headersFile, 'utf8').split('\n');
  const rules = [];
  let currentPattern = null;
  let currentHeaders = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentPattern) {
        rules.push({ pattern: currentPattern, headers: currentHeaders });
      }
      currentPattern = trimmed;
      currentHeaders = {};
    } else {
      const idx = trimmed.indexOf(':');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        currentHeaders[k] = v;
      }
    }
  }
  if (currentPattern) {
    rules.push({ pattern: currentPattern, headers: currentHeaders });
  }
  return rules;
}

const headerRules = loadHeadersMap();

function getHeadersForPath(urlPath) {
  const result = {};
  for (const rule of headerRules) {
    if (rule.pattern === '/*' || rule.pattern === '/*.*') {
      Object.assign(result, rule.headers);
    } else if (rule.pattern === urlPath) {
      Object.assign(result, rule.headers);
    } else if (rule.pattern.endsWith('/*')) {
      const prefix = rule.pattern.slice(0, -2);
      if (urlPath.startsWith(prefix)) {
        Object.assign(result, rule.headers);
      }
    } else if (rule.pattern === '/*.html') {
      if (urlPath.endsWith('.html') || !urlPath.includes('.')) {
        Object.assign(result, rule.headers);
      }
    }
  }
  return result;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.onnx': 'application/octet-stream'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let rawPathname = parsedUrl.pathname;
  let pathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    pathname = rawPathname;
  }

  // Mock /api/contact endpoint (§8.1)
  if (pathname === '/api/contact' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(bodyStr);
        if (!data.name || !data.email || !data.message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Message delivered successfully.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Mock /api/copilot SSE Streaming endpoint (AI-01, AI-03)
  if (pathname === '/api/copilot' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(bodyStr || '{}');
        let query = (data.message || '').trim();
        if (!query && Array.isArray(data.messages)) {
          const lastUser = data.messages.filter(m => m.role === 'user').pop();
          if (lastUser && lastUser.content) {
            query = lastUser.content.trim();
          }
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        });

        // Load knowledge base
        const kbPath = path.join(process.cwd(), 'public', 'data', 'knowledge-base.json');
        let kb = [];
        if (fs.existsSync(kbPath)) {
          try {
            kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
          } catch {}
        }

        const qLower = query.toLowerCase();
        let answer = '';

        if (qLower.includes('inferyx')) {
          answer = 'Inferyx is an automated ML model profiling and data drift detection engine designed for mission-critical production pipelines. It benchmarks distribution shifts, computes Wasserstein distances, and flags data drift before inference degradation. [REF: /work/inferyx]\n\nNote: Source code is private enterprise intellectual property; detailed technical architecture walkthrough is available upon request.';
        } else if (qLower.includes('aegisz')) {
          answer = 'AegisZ is a Post-Quantum Cryptographic (PQC) and Zero-Trust architecture designed for hybrid cloud systems. It integrates NIST-standardized quantum-resistant algorithms (ML-KEM / Kyber and ML-DSA / Dilithium) with hardware acceleration. [REF: /work/aegisz]';
        } else if (qLower.includes('threat') || qLower.includes('anomaly')) {
          answer = 'The Threat Detection system is an in-browser NetFlow anomaly detection pipeline executing 100% on client hardware via ONNX Runtime Web WASM SIMD, verified by SHA-256 integrity checks. [REF: /work/threat-detection]';
        } else if (qLower.includes('roadsaarthi')) {
          answer = 'RoadSaarthi is an edge IoT prototype leveraging YOLOv8 on Raspberry Pi 4 for real-time pothole detection. Important Note: RoadSaarthi is an independent engineering prototype, not an officially deployed government transit system. [REF: /work/roadsaarthi]';
        } else if (qLower.includes('cert') || qLower.includes('credential')) {
          answer = 'Ambul Jaiswal holds 10 verified certifications covering cloud architecture, security engineering, and applied machine learning (including AWS, CompTIA, and IBM credentials). [REF: /certifications]';
        } else {
          // General grounded query response
          const match = kb.find(c => query.split(' ').some(w => w.length > 3 && (c.title.toLowerCase().includes(w) || c.content.toLowerCase().includes(w))));
          if (match) {
            answer = `Based on verified project documentation for ${match.source}: ${match.title}.\n\n${match.content.slice(0, 280)}... [REF: ${match.ref}]`;
          } else {
            answer = `Ambul Jaiswal specializes in security-focused machine learning systems, in-browser edge inference, and zero-trust architectures. Review verified case studies at [REF: /work] or explore interactive prototypes in the Lab at [REF: /lab].`;
          }
        }

        // Stream tokens via SSE
        const words = answer.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i === words.length - 1 ? '' : ' ');
          res.write(`data: ${JSON.stringify({ response: chunk })}\n\n`);
          await new Promise(r => setTimeout(r, 15));
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Normalize pathname: remove trailing slash if present (except for root '/')
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // Resolve file path
  let filePath = path.join(DIST_DIR, cleanPath);

  if (cleanPath === '/') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // Direct file exists (e.g., .css, .js, .svg, robots.txt)
  } else if (fs.existsSync(filePath + '.html') && fs.statSync(filePath + '.html').isFile()) {
    // Clean route mapped to static HTML (e.g., /work -> out/work.html, /work/inferyx -> out/work/inferyx.html)
    filePath = filePath + '.html';
  } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  if (cleanPath === '/404' || cleanPath === '/404.html' || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(DIST_DIR, '404.html');
    res.statusCode = 404;
  } else {
    res.statusCode = 200;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const customHeaders = getHeadersForPath(pathname);

  // Set custom security and caching headers
  for (const [k, v] of Object.entries(customHeaders)) {
    res.setHeader(k, v);
  }
  res.setHeader('Content-Type', contentType);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`[preview] Server listening at http://localhost:${PORT}`);
});
