import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const semiBoldFont = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/IBMPlexSansCondensed-SemiBold.woff2')).toString('base64');
const monoFont = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/IBMPlexMono-Regular.woff2')).toString('base64');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'IBM Plex Sans Condensed';
    font-weight: 600;
    src: url('data:font/woff2;base64,${semiBoldFont}') format('woff2');
  }
  @font-face {
    font-family: 'IBM Plex Mono';
    font-weight: 400;
    src: url('data:font/woff2;base64,${monoFont}') format('woff2');
  }
  body {
    margin: 0;
    width: 1200px;
    height: 630px;
    background: #f6f5f0;
    color: #111111;
    font-family: 'IBM Plex Sans Condensed', sans-serif;
    box-sizing: border-box;
    padding: 80px 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid #dcd9d0;
  }
  .mark {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 20px;
    color: #555555;
    letter-spacing: 0.05em;
  }
  .dot {
    width: 14px;
    height: 14px;
    background: #b1361e;
  }
  h1 {
    font-size: 64px;
    line-height: 1.1;
    margin: 0 0 20px 0;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .tag {
    font-size: 30px;
    color: #555555;
    margin: 0;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    color: #777777;
    border-top: 1px solid #dcd9d0;
    padding-top: 24px;
  }
</style>
</head>
<body>
  <div class="mark"><div class="dot"></div>AMBUL JAISWAL · PORTFOLIO</div>
  <div>
    <h1>Models fail quietly.</h1>
    <p class="tag">Data science × cybersecurity · B.Tech CSE '28</p>
  </div>
  <div class="footer">
    <span>Inferyx · AegisZ · OrgMind · AI Threat Detection · RoadSaarthi</span>
    <span>Roorkee, India</span>
  </div>
</body>
</html>`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.screenshot({ path: path.join(ROOT_DIR, 'public/og.png') });
  await browser.close();
  console.log('[og] Generated public/og.png (1200x630)');
}

main().catch(err => {
  console.error('[og] Error generating OG image:', err);
  process.exit(1);
});
