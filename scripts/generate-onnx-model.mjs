// scripts/generate-onnx-model.mjs
// Verifies or regenerates the signed 6-feature threat anomaly ONNX model
// Guarantees byte budget (< 10 KB) and computes bit-accurate SHA-256 hash.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const MODEL_DIR = path.join(ROOT_DIR, 'public', 'models');
const MODEL_FILE = path.join(MODEL_DIR, 'threat-anomaly-v1.onnx');
const PYTHON_SCRIPT = path.join(ROOT_DIR, 'scripts', 'generate-threat-model.py');

const forceRebuild = process.argv.includes('--force');

if (!fs.existsSync(MODEL_FILE) || forceRebuild) {
  console.log('[generate-onnx-model] Building ONNX model using Python PyTorch exporter...');
  execSync(`python "${PYTHON_SCRIPT}"`, { stdio: 'inherit', cwd: ROOT_DIR });
}

if (!fs.existsSync(MODEL_FILE)) {
  console.error(`[generate-onnx-model] Error: Target model file not found at ${MODEL_FILE}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(MODEL_FILE);
const byteLength = fileBuffer.length;
const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

console.log('------------------------------------------------------------');
console.log('[generate-onnx-model] Artifact: public/models/threat-anomaly-v1.onnx');
console.log(`[generate-onnx-model] Size:     ${byteLength} bytes (${(byteLength / 1024).toFixed(2)} KB)`);
console.log(`[generate-onnx-model] SHA-256:  ${sha256}`);
console.log('------------------------------------------------------------');

if (byteLength > 10240) {
  console.error(`[generate-onnx-model] Error: Model size ${byteLength} exceeds 10 KB budget!`);
  process.exit(1);
}

console.log('[generate-onnx-model] Verification PASSED.');
