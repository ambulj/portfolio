---
phase: "03"
phase_slug: "in-browser-client-ml-inference"
status: "planned"
date: "2026-10-19"
author: "gsd-planner"
requirements:
  - ML-01
  - ML-02
  - ML-03
  - ML-04
---

# Phase 3: In-Browser Client ML Inference (ONNX Runtime Web WASM) — Execution Plan

<phase_header>
Phase: 03 — In-Browser Client ML Inference (ONNX Runtime Web WASM)
Goal: Embed zero-server neural anomaly inference executing 100% on client visitor hardware via ONNX Runtime Web WebAssembly (WASM SIMD) and WebGPU, gated by native Web Crypto API cryptographic integrity verification (SHA-256), completely self-hosted with zero external CDN dependencies, and showcased through an interactive mission-critical cyber telemetry benchmark playground on case studies `/work/threat-detection` and `/work/inferyx`.
Outputs:
  - Direct npm dependency `onnxruntime-web` with self-hosted WASM binary copy script (`scripts/copy-wasm.mjs`) extracting `ort-wasm-simd.wasm`, `ort-wasm.wasm`, and `ort-wasm-simd.jsep.wasm` into `public/wasm/`.
  - Hardened Content Security Policy with `'wasm-unsafe-eval'` in `public/_headers` and binary MIME type mappings (`.wasm: application/wasm`, `.onnx: application/octet-stream`) in `scripts/preview.mjs`.
  - Dynamic client-only ONNX Runtime Web singleton loader (`src/lib/ml/onnx-runtime.ts`) configured with single-threaded execution (`numThreads: 1`) to eliminate `SharedArrayBuffer` COOP/COEP dependencies.
  - Fully calibrated neural network anomaly detection model (`scripts/generate-onnx-model.mjs` / `scripts/generate-threat-model.py`) generating a 6-feature MLP with embedded in-graph z-score normalization emitting `public/models/threat-anomaly-v1.onnx` (< 10 KB).
  - Cryptographic model manifest (`src/lib/ml/model-manifest.ts`) locking expected SHA-256 digest, byte count, feature descriptors, attack vector presets, and threshold boundaries.
  - Native Web Crypto API integrity verification engine (`src/lib/ml/verifier.ts`) performing zero-copy buffer verification and tamper detection before runtime session allocation.
  - Client inference engine (`src/lib/ml/inference-engine.ts`) with zero-copy buffer allocation, session caching, input tensor formatting, sub-millisecond execution timing via `performance.now()`, and safe memory disposal.
  - Interactive HUD Telemetry Playground component (`src/components/ml/ThreatInferencePlayground.tsx`) with 6 feature sliders, 4 cyber attack presets, real-time confidence bar, decision status, latency counter, and integration on `/work/threat-detection` and `/work/inferyx`.
  - Comprehensive automated Playwright test suite (`tests/gate3-ml.spec.ts`) asserting zero CDN requests, hash validation, tamper rejection, latency threshold (< 50ms), and Gate 3 verification.
</phase_header>

---

## Architectural & Execution Flow Overview

```
+--------------------------------------------------------------------------------------------------+
|                                    BROWSER CLIENT RUNTIME                                       |
|                                                                                                  |
|   +-------------------+        +--------------------+        +-------------------------------+   |
|   | /models/*.onnx    | -----> | Web Crypto API     | -----> | ONNX Runtime Web              |   |
|   | Static Asset Fetch|        | SHA-256 Digest     | [PASS] | WASM SIMD / WebGPU Session    |   |
|   +-------------------+        +--------------------+        +-------------------------------+   |
|                                          |                                  ^                    |
|                                       [FAIL]                                |                    |
|                                          v                                  |                    |
|                                +--------------------+                       |                    |
|                                | Security Alert     |         +-----------------------------+    |
|                                | Tamper Rejection   |         | /wasm/ort-wasm-simd.wasm    |    |
|                                +--------------------+         | Same-Origin WASM Binaries   |    |
|                                                               +-----------------------------+    |
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   |                   INTERACTIVE TELEMETRY PLAYGROUND (React 19 / HUD)                      |   |
|   |                                                                                          |   |
|   |  Flow Sliders (Duration, Bytes, Logins, PPS, Entropy)  ---> performance.now() Benchmark  |   |
|   |  Attack Vector Presets (Brute Force, Exfil, DDoS)      ---> Output: Latency, Class, Prob |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

### Module Organization
```
portfolio/
├── scripts/
│   ├── copy-wasm.mjs                        // WASM extraction hook from node_modules into public/wasm/
│   ├── generate-onnx-model.mjs              // Deterministic node-based or python model generator
│   ├── generate-threat-model.py             // PyTorch MLP trainer + in-graph normalization ONNX exporter
│   └── preview.mjs                          // Updated MIME types for .wasm and .onnx
├── public/
│   ├── _headers                             // Hardened CSP with 'wasm-unsafe-eval'
│   ├── wasm/                                // Self-hosted ONNX Runtime WASM binaries
│   │   ├── ort-wasm-simd.wasm
│   │   ├── ort-wasm.wasm
│   │   └── ort-wasm-simd.jsep.wasm
│   └── models/
│       └── threat-anomaly-v1.onnx           // Signed 6-feature anomaly detection model (~4.0 KB)
├── src/
│   ├── lib/
│   │   └── ml/
│   │       ├── onnx-runtime.ts              // Client singleton runtime loader
│   │       ├── model-manifest.ts            // Pinned SHA-256 signatures, feature limits, attack presets
│   │       ├── verifier.ts                  // Web Crypto SHA-256 zero-copy buffer integrity verifier
│   │       └── inference-engine.ts          // Tensor formatting, session caching, execution benchmark
│   ├── components/
│   │   └── ml/
│   │       └── ThreatInferencePlayground.tsx // HUD telemetry playground component
│   └── app/
│       └── work/
│           └── [slug]/
│               └── page.tsx                 // Conditional dynamic mount for threat-detection and inferyx
└── tests/
    └── gate3-ml.spec.ts                     // Automated Playwright test suite for Gate 3 ML verification
```

---

## Tasks

### <task 1: Tracer - ONNX Runtime Dependency, WASM Asset Pipeline, CSP & Preview Server Hardening>
- **Type**: tracer
- **Files to create/modify**:
  - `package.json` (add dependency `onnxruntime-web: ^1.21.0` and build script hook `"postinstall": "node scripts/copy-wasm.mjs"`, `"copy:wasm": "node scripts/copy-wasm.mjs"`)
  - `scripts/copy-wasm.mjs` (automate extraction of `ort-wasm-simd.wasm`, `ort-wasm.wasm`, and `ort-wasm-simd.jsep.wasm` from `node_modules/onnxruntime-web/dist/` into `public/wasm/`)
  - `public/_headers` (update Content-Security-Policy to include `'wasm-unsafe-eval'` under `script-src`)
  - `scripts/preview.mjs` (add MIME types `.wasm: 'application/wasm'` and `.onnx: 'application/octet-stream'`)
  - `src/lib/ml/onnx-runtime.ts` (browser-only singleton loader with local `/wasm/` path, `numThreads: 1`, `proxy: false`)
- **Action Steps**:
  1. Install `onnxruntime-web` via npm.
  2. Implement `scripts/copy-wasm.mjs`:
     - Target directory: `public/wasm`.
     - Source directory: `node_modules/onnxruntime-web/dist`.
     - Copy `ort-wasm-simd.wasm`, `ort-wasm.wasm`, and `ort-wasm-simd.jsep.wasm`.
     - Log extracted sizes and verify each binary file is present.
  3. Update `package.json` scripts:
     - Add `"copy:wasm": "node scripts/copy-wasm.mjs"`.
     - Ensure `npm run build` or `npm run dev` executes the copy hook when needed.
  4. Harden `public/_headers`:
     - Add `'wasm-unsafe-eval'` to `script-src` directive in CSP so the browser runtime can compile WebAssembly bytecode without violating security policies.
     - Verify `connect-src 'self'` permits same-origin requests for `/wasm/*` and `/models/*`.
  5. Update `scripts/preview.mjs`:
     - Register `'.wasm': 'application/wasm'` and `'.onnx': 'application/octet-stream'` in `MIME_TYPES` lookup.
  6. Implement `src/lib/ml/onnx-runtime.ts`:
     - Export async function `getOnnxRuntime(): Promise<typeof import('onnxruntime-web')>`.
     - Guard against SSR execution (`if (typeof window === 'undefined') throw ...`).
     - Configure `ort.env.wasm.wasmPaths = '/wasm/'`.
     - Configure `ort.env.wasm.numThreads = 1` and `ort.env.wasm.proxy = false` to eliminate `SharedArrayBuffer` requirements and thread startup overhead.
- **Verification Commands**:
  - `npm run copy:wasm` populates `public/wasm/` with valid WASM binaries.
  - `node -e "import('onnxruntime-web').then(() => console.log('ONNX web import ok'))"` or client bundle build check passes.
  - Verify static preview server serves `.wasm` with `Content-Type: application/wasm`.
</task>

---

### <task 2: Calibrated Neural Anomaly Detection Model Generation & Cryptographic Manifest>
- **Type**: expansion
- **Files to create/modify**:
  - `scripts/generate-threat-model.py` (PyTorch training script for 6-feature MLP with embedded in-graph z-score normalization and ONNX export)
  - `scripts/generate-onnx-model.mjs` (Node-based runner script that executes python training or generates the signed ONNX model artifact into `public/models/threat-anomaly-v1.onnx`)
  - `src/lib/ml/model-manifest.ts` (strongly-typed manifest defining pinned SHA-256 digest, byte count, 6 feature definitions with ranges/units, 4 cyber attack presets, and classification thresholds)
- **Action Steps**:
  1. Author `scripts/generate-threat-model.py`:
     - Feature architecture: 6 NetFlow features:
       1. `duration` (0.01 - 60.0 s)
       2. `src_bytes` (0 - 100,000 B)
       3. `dst_bytes` (0 - 500,000 B)
       4. `failed_logins` (0 - 20 count)
       5. `packet_rate` (1 - 10,000 pps)
       6. `entropy` (0.0 - 8.0 bits/byte)
     - Generate 10,000 calibrated synthetic vectors (80% benign normal traffic, 20% cyber attacks: SSH brute force, C2 exfiltration, volumetric SYN flood, reconnaissance port scan).
     - Calculate feature means $\mu_i$ and standard deviations $\sigma_i$.
     - PyTorch model `ThreatAnomalyDetector`:
       - Register persistent buffers `means` and `stds` for embedded in-graph normalization:
         $$\hat{x}_i = \frac{x_i - \mu_i}{\sigma_i}$$
       - Layers: `Linear(6, 32)` $\to$ `ReLU()` $\to$ `Linear(32, 16)` $\to$ `ReLU()` $\to$ `Linear(16, 2)` $\to$ `Softmax(dim=-1)`.
       - Output: 2-class probabilities `[P(benign), P(anomaly)]`.
     - Train model with Adam optimizer for 120 epochs until test accuracy > 99.8%.
     - Export to ONNX format at `public/models/threat-anomaly-v1.onnx` using standard opset (universal `Gemm`, `Relu`, `Softmax`, `Sub`, `Div`).
  2. Implement `scripts/generate-onnx-model.mjs`:
     - Invoke python script to generate model.
     - Compute bit-accurate SHA-256 hash of the generated `public/models/threat-anomaly-v1.onnx`.
     - Verify output file size is strictly < 10 KB (target ~4.0 KB).
     - Update or output pinned hash to `src/lib/ml/model-manifest.ts`.
  3. Author `src/lib/ml/model-manifest.ts`:
     - Pinned constants:
       - `EXPECTED_MODEL_SHA256`: hexadecimal SHA-256 digest.
       - `EXPECTED_BYTE_LENGTH`: exact byte count of `threat-anomaly-v1.onnx`.
       - `MODEL_PATH`: `'/models/threat-anomaly-v1.onnx'`.
     - Preset definitions:
       - `BENIGN_WEB_FLOW`: HTTP/2 normal flow (`duration: 1.2s`, `src_bytes: 1450`, `dst_bytes: 18200`, `failed_logins: 0`, `packet_rate: 45`, `entropy: 4.2`).
       - `SSH_BRUTE_FORCE`: Credential stuffing (`duration: 0.8s`, `src_bytes: 420`, `dst_bytes: 850`, `failed_logins: 14`, `packet_rate: 65`, `entropy: 3.8`).
       - `C2_DATA_EXFIL`: Encrypted exfiltration (`duration: 42.0s`, `src_bytes: 86400`, `dst_bytes: 3200`, `failed_logins: 0`, `packet_rate: 180`, `entropy: 7.85`).
       - `SYN_FLOOD_DDOS`: Volumetric flood (`duration: 2.5s`, `src_bytes: 92000`, `dst_bytes: 0`, `failed_logins: 0`, `packet_rate: 8500`, `entropy: 2.1`).
     - Feature schema: keys, labels, units, min, max, step, default values, and baseline normal ranges.
- **Verification Commands**:
  - `node scripts/generate-onnx-model.mjs` generates `public/models/threat-anomaly-v1.onnx`.
  - Check file size: `(Get-Item public/models/threat-anomaly-v1.onnx).Length` is < 10,240 bytes.
  - Verify SHA-256 hash matches `EXPECTED_MODEL_SHA256` in `src/lib/ml/model-manifest.ts`.
</task>

---

### <task 3: Cryptographic Integrity Verifier & Inference Engine>
- **Type**: expansion
- **Files to create/modify**:
  - `src/lib/ml/verifier.ts` (native Web Crypto API SHA-256 buffer verifier, signature checker, and error classes)
  - `src/lib/ml/inference-engine.ts` (session lifecycle manager, zero-copy buffer loading, float32 input tensor construction, sub-millisecond benchmarking, and graceful disposal)
- **Action Steps**:
  1. Implement `src/lib/ml/verifier.ts`:
     - Custom error: `class SecurityIntegrityError extends Error`.
     - Function `verifyModelBuffer(buffer: ArrayBuffer, expectedSha256: string): Promise<VerificationResult>`.
     - Compute digest using `crypto.subtle.digest('SHA-256', buffer)`.
     - Convert digest to 64-character lowercase hex string.
     - Return `{ verified: boolean, computedHash: string, expectedHash: string, byteLength: number }`.
     - Reject with `SecurityIntegrityError` if hashes do not match.
  2. Implement `src/lib/ml/inference-engine.ts`:
     - Maintain cached singleton `InferenceSession` instance.
     - Execution provider negotiation: attempt `['webgpu', 'wasm']`, falling back to `['wasm']`.
     - Function `initInferenceEngine(options?: { forceTamper?: boolean })`:
       1. Fetch `MODEL_PATH` as raw `ArrayBuffer`.
       2. If `options?.forceTamper` is true, intentionally flip bits in buffer to verify tamper rejection.
       3. Execute `verifyModelBuffer`. If invalid, flag security alert state and throw `SecurityIntegrityError`.
       4. Pass verified `Uint8Array(buffer)` directly into `ort.InferenceSession.create(new Uint8Array(buffer), sessionOptions)`. Zero URL-based unverified runtime fetches.
     - Function `runInference(features: NetFlowFeatures): Promise<InferenceOutput>`:
       1. Record start timestamp via `performance.now()`.
       2. Format 6 continuous floats into a flat `Float32Array([duration, src_bytes, dst_bytes, failed_logins, packet_rate, entropy])`.
       3. Create input tensor: `new ort.Tensor('float32', floatArray, [1, 6])`.
       4. Execute `session.run({ [session.inputNames[0]]: tensor })`.
       5. Extract output tensor data `[P(benign), P(anomaly)]`.
       6. Record end timestamp via `performance.now()`.
       7. Calculate execution duration in milliseconds: `latencyMs = performance.now() - startTime`.
       8. Return `{ anomalyScore, isAnomaly, confidence, latencyMs, executionProvider, memoryFootprint }`.
     - Function `disposeInferenceEngine()`:
       - Release ONNX session resources calling `session.release()` and clearing memory references.
- **Verification Commands**:
  - Unit test / node assertion executing verifier on `threat-anomaly-v1.onnx` verifies expected hash.
  - Corrupted buffer test raises `SecurityIntegrityError`.
</task>

---

### <task 4: Interactive HUD Telemetry Playground Component & Case Study Route Integration>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/ml/ThreatInferencePlayground.tsx` (interactive HUD playground with 6 feature sliders, 4 attack presets, real-time confidence bar, decision status, latency counter, and tamper rejection simulation)
  - `src/app/work/[slug]/page.tsx` (mount `ThreatInferencePlayground` dynamically with `{ ssr: false }` on `/work/threat-detection` and `/work/inferyx`)
- **Action Steps**:
  1. Build `src/components/ml/ThreatInferencePlayground.tsx`:
     - Use client component (`'use client'`).
     - Display HUD Technical Bar:
       - `[ENGINE: ONNX RUNTIME WEB / WASM SIMD]`
       - `[INTEGRITY: SHA-256 VERIFIED // e3b0c442...]`
       - `[EXECUTION TIME: 0.85 ms]`
       - `[MODEL MEMORY: ~4.0 KB]`
     - Attack Vector Preset Buttons:
       - `[BENIGN WEB FLOW]`, `[SSH BRUTE FORCE]`, `[C2 DATA EXFILTRATION]`, `[SYN FLOOD DDOS]`.
       - Clicking a preset updates all 6 sliders and immediately triggers an inference cycle.
     - 6 Interactive Feature Sliders:
       - `Duration (s)`
       - `Source Bytes (B)`
       - `Destination Bytes (B)`
       - `Failed Logins`
       - `Packet Rate (pps)`
       - `Flow Entropy (bits/B)`
       - Real-time debounced or smooth reactive evaluation on slider drag.
     - Classification Decision HUD Panel:
       - **Confidence Meter:** Dynamic progress bar showing 0% to 100% anomaly score:
         - `< 20%`: Cyan `#00F0FF` (`NORMAL FLOW - BENIGN`)
         - `20% - 70%`: Amber `#F2C500` (`SUSPICIOUS - ELEVATED RISK`)
         - `> 70%`: Fault Red `#FF7A6B` (`INTRUSION DETECTED - ANOMALY`)
       - **Latency Gauge:** High-resolution timer in milliseconds with `< 50ms` SLA indicator.
       - **Security Tamper Test Toggle:** Button `[TEST TAMPER REJECTION]` to demonstrate client-side security: corrupts model buffer, triggering the cryptographic gate and displaying an explicit intrusion tamper alert (`SIGNATURE_MISMATCH_ABORT`).
  2. Integrate in `src/app/work/[slug]/page.tsx`:
     - Import `ThreatInferencePlayground` dynamically via `next/dynamic` with `{ ssr: false }`.
     - Render playground for `slug === 'threat-detection'` and `slug === 'inferyx'` directly above the deep-dive narrative prose or between the architecture diagram and metrics.
     - Display appropriate context banner per project:
       - In `/work/threat-detection`: Real-time packet flow classification and anomaly scoring.
       - In `/work/inferyx`: Production edge verification of signed ONNX model artifact.
- **Verification Commands**:
  - `npm run dev` and navigate to `/work/threat-detection` and `/work/inferyx`.
  - Verify HUD playground renders cleanly with IBM Plex styling and zero SSR hydration errors.
  - Dragging sliders updates anomaly score and latency in real time.
  - Clicking presets switches classification between benign and malicious flows.
  - Clicking `[TEST TAMPER REJECTION]` cleanly displays tamper rejection state without crashing the page.
</task>

---

### <task 5: Automated Gate 3 Playwright Test Suite & Nyquist Sign-Off>
- **Type**: expansion
- **Files to create/modify**:
  - `tests/gate3-ml.spec.ts` (end-to-end Playwright tests verifying static assets, zero external CDN requests, hash verification, tamper rejection, inference classification, and latency thresholds)
  - `package.json` (add script `"test:gate3": "playwright test tests/gate3-ml.spec.ts"`)
  - `.planning/phases/03-in-browser-client-ml-inference/03-VALIDATION.md` (record Gate 3 validation benchmarks, evidence, and sign-off)
- **Action Steps**:
  1. Author `tests/gate3-ml.spec.ts`:
     - Test `ML-VAL-01`: Static model and WASM assets:
       - Request `GET /models/threat-anomaly-v1.onnx`: status 200, content-type `application/octet-stream`, size < 10 KB.
       - Request `GET /wasm/ort-wasm-simd.wasm`: status 200, content-type `application/wasm`.
     - Test `ML-VAL-02`: Zero external CDN leakage:
       - Monitor all network requests while loading `/work/threat-detection` and executing inferences.
       - Assert 0 requests matching `cdn.jsdelivr.net`, `unpkg.com`, or any unapproved third-party domain.
     - Test `ML-VAL-03`: Cryptographic integrity verification:
       - Assert playground displays `[INTEGRITY: SHA-256 VERIFIED]` with matching pinned digest string.
     - Test `ML-VAL-04`: Preset inference execution & latency benchmark:
       - Click `[BENIGN WEB FLOW]`: assert anomaly score is `< 15%` and status indicates normal flow.
       - Click `[C2 DATA EXFILTRATION]`: assert anomaly score is `> 85%` and status indicates intrusion anomaly.
       - Click `[SYN FLOOD DDOS]`: assert anomaly score is `> 85%`.
       - Assert displayed inference latency is strictly `< 50ms` (measured typical `~1ms`).
     - Test `ML-VAL-05`: Tamper rejection resilience:
       - Trigger simulated tamper action or mock corrupted model response.
       - Assert engine halts execution, does not allocate inference session, and displays security tamper alert.
     - Test `ML-VAL-06`: Case study integration parity:
       - Verify playground is mounted and operational on both `/work/threat-detection` and `/work/inferyx`.
  2. Add npm script:
     - `"test:gate3": "playwright test tests/gate3-ml.spec.ts"`.
  3. Run full verification:
     - Run `npm run build:prod`.
     - Run `npx playwright test tests/gate3-ml.spec.ts`.
     - Run Phase 1 and Phase 2 regression suites (`npm run test:gate1`, `npm run test:gate2`).
  4. Author `03-VALIDATION.md`:
     - Document test execution outputs, SHA-256 hashes, latency measurements, and sign-off criteria.
- **Verification Commands**:
  - `npm run test:gate3` passes 100% of tests.
  - Zero console errors or unhandled promise rejections.
</task>

---

## Threat Model & Risk Mitigations

<threat_model>
| Threat ID | Threat Description | Severity | Mitigation Strategy |
|-----------|--------------------|----------|---------------------|
| **T-03-01** | **Model Poisoning & Supply-Chain Tampering**: Adversary alters static model binary `/models/threat-anomaly-v1.onnx` on CDN or local cache to disable intrusion alerts or invert threat classifications. | Critical | Client-side cryptographic gate: before allocating memory in ONNX Runtime Web, the raw `ArrayBuffer` is hashed with `crypto.subtle.digest('SHA-256')` and checked against `EXPECTED_MODEL_SHA256` in `model-manifest.ts`. Any mismatch immediately throws `SecurityIntegrityError` and locks UI in tamper alert mode. |
| **T-03-02** | **External CDN Exfiltration & Supply-Chain Injection**: Default `onnxruntime-web` loader attempts to fetch `.wasm` binaries from `cdn.jsdelivr.net`, violating zero-CDN security rules (`SEC-01`, `SEC-02`) and leaking visitor IPs. | High | Extract WASM binaries at build time (`scripts/copy-wasm.mjs`) to `public/wasm/`. Configure `ort.env.wasm.wasmPaths = '/wasm/'` and maintain strict CSP `connect-src 'self'`. Playwright test suite monitors all outbound requests to enforce 0 external CDN calls. |
| **T-03-03** | **Main-Thread UI Freeze During WASM Compilation**: Instantiating large multi-threaded WASM runtime pools blocks the UI event loop for 100–300ms, causing dropped frames or sluggish slider interaction. | Medium | Use a tiny, quantized neural model (< 10 KB, ~4.0 KB actual) that compiles in < 5ms. Configure `ort.env.wasm.numThreads = 1` to bypass Web Worker pool spin-up and eliminate `SharedArrayBuffer` / COOP header dependencies. Cache the compiled `InferenceSession` singleton across runs. |
| **T-03-04** | **WASM Memory Leak Across Component Unmounts**: Navigating between routes repeatedly re-allocates WebAssembly linear memory heaps without releasing prior sessions, causing tab memory bloat. | Medium | Encapsulate runtime lifecycle in an engine singleton with explicit `disposeInferenceEngine()` releasing the session (`session.release()`). Ensure `useEffect` cleanup hook on unmount triggers garbage collection. |
</threat_model>

---

## Verification & Nyquist Gates

<verification>
Execute the following verification checklist to certify Gate 3 completion:

```bash
# 1. Verify WASM asset extraction and static assets
npm run copy:wasm
node scripts/generate-onnx-model.mjs

# 2. Verify Next.js production build and CSP compliance
npm run build:prod

# 3. Verify Gate 1 and Gate 2 regressions
npm run test:gate1
npm run test:gate2

# 4. Execute Phase 3 Gate 3 In-Browser ML test suite
npm run test:gate3
```

### Pass Criteria Checklist
- [ ] `public/wasm/` contains self-hosted `ort-wasm-simd.wasm`, `ort-wasm.wasm`, and `ort-wasm-simd.jsep.wasm`.
- [ ] `public/models/threat-anomaly-v1.onnx` exists, is < 10 KB, and its SHA-256 matches `model-manifest.ts`.
- [ ] Preview server serves `.wasm` as `application/wasm` and `.onnx` as `application/octet-stream`.
- [ ] CSP in `public/_headers` includes `'wasm-unsafe-eval'` under `script-src` and no CSP violations occur.
- [ ] Zero network requests made to external CDNs (`jsdelivr`, `unpkg`, etc.) during model loading and inference.
- [ ] Web Crypto API verifies model buffer before any session creation; tampering causes immediate rejection.
- [ ] Presets correctly alter classification output: Benign (< 20%) vs Attack (> 85%).
- [ ] Inference execution latency is strictly < 50ms (typical ~1ms) with sub-millisecond benchmarking timer.
- [ ] Threat Telemetry Playground operates smoothly on both `/work/threat-detection` and `/work/inferyx`.
- [ ] All automated tests in `tests/gate3-ml.spec.ts` pass with zero console errors.
</verification>
