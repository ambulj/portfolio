// scripts/preview.mjs — Zero-dependency preview server for local testing.
// Strictly applies production headers from dist/_headers and mocks /api/contact.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8788;
const DIST_DIR = path.join(process.cwd(), 'dist');

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
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

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

  // Resolve file path
  let filePath = path.join(DIST_DIR, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  if (pathname === '/404' || pathname === '/404.html' || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
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
