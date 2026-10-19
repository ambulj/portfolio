// scripts/copy-wasm.mjs
// Extracts self-hosted ONNX Runtime WebAssembly and worker binaries to public/wasm/
// Guarantees 100% offline, zero-CDN operation (§8.2, ML-01)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'node_modules', 'onnxruntime-web', 'dist');
const TARGET_DIR = path.join(ROOT_DIR, 'public', 'wasm');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`[copy-wasm] Source directory not found: ${SOURCE_DIR}`);
  console.error('[copy-wasm] Please run `npm install onnxruntime-web` first.');
  process.exit(1);
}

fs.mkdirSync(TARGET_DIR, { recursive: true });

// Copy all wasm and worker mjs files
const files = fs.readdirSync(SOURCE_DIR);
let copiedCount = 0;

for (const file of files) {
  if (file.endsWith('.wasm') || (file.startsWith('ort-wasm') && file.endsWith('.mjs'))) {
    const src = path.join(SOURCE_DIR, file);
    const dest = path.join(TARGET_DIR, file);
    fs.copyFileSync(src, dest);
    const stat = fs.statSync(dest);
    console.log(`[copy-wasm] Extracted ${file} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
    copiedCount++;
  }
}

// Create aliases for unthreaded names if runtime requests them
const aliases = [
  { src: 'ort-wasm-simd-threaded.wasm', dest: 'ort-wasm-simd.wasm' },
  { src: 'ort-wasm-simd-threaded.jsep.wasm', dest: 'ort-wasm-simd.jsep.wasm' },
  { src: 'ort-wasm-simd-threaded.wasm', dest: 'ort-wasm.wasm' }
];

for (const alias of aliases) {
  const srcPath = path.join(TARGET_DIR, alias.src);
  const destPath = path.join(TARGET_DIR, alias.dest);
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`[copy-wasm] Created fallback alias: ${alias.dest} -> ${alias.src}`);
    copiedCount++;
  }
}

console.log(`[copy-wasm] Successfully populated ${TARGET_DIR} with ${copiedCount} files.`);
