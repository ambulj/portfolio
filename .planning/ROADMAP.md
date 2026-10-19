# Roadmap: Ambul Jaiswal — Futuristic Portfolio

## Phase 1: Next.js 15 Architecture & Content Pipeline

**Goal:** Establish the Next.js 15 App Router baseline, TypeScript configuration, Tailwind CSS OLED aesthetic, and content ingestion pipeline.

### Deliverables:
- Project structure configured with Next.js 15, React 19, TypeScript, and Tailwind CSS.
- Static export build (`output: 'export'`) outputting to `out/` or `dist/`.
- Layout shell, persistent background canvas wrapper, navigation, skip links, and footer.
- Migrated content for all 5 core case studies, Lab, About, Certifications, Resume, and Colophon.
- Verification: Clean compile, single `<h1>` per route, zero broken links, and perfect static routing.

---

## Phase 2: WebGPU Constellation Engine (WGSL Compute Shaders)

**Goal:** Replace basic canvas geometry with a high-performance WebGPU compute shader engine simulating thousands of interactive particles with a WebGL/Canvas fallback.

### Deliverables:
- WebGPU device and adapter initialization pipeline with fallback detection.
- Custom WGSL compute shaders calculating particle positions, turbulence, and graph node connections in parallel on the GPU.
- High-resolution rendering pipeline drawing dynamic particle constellations and ray-traced edges.
- Seamless automatic fallback to WebGL / 2D Canvas under `prefers-reduced-motion` or unsupported hardware.
- Verification: Stable 60fps frame rate, zero GPU memory leaks, and accessible static SVG fallback.

---

## Phase 3: In-Browser Client ML Inference (ONNX Runtime Web WASM)

**Goal:** Embed local machine learning inference running directly inside the visitor's browser with zero server roundtrips.

### Deliverables:
- ONNX Runtime Web (`onnxruntime-web`) integration compiled to WebAssembly.
- Lightweight trained anomaly detection / tabular classifier model packaged in public assets.
- Cryptographic SHA-256 integrity check verifying model weight signatures before WASM memory allocation.
- Interactive client inference playground on `/work/inferyx` and `/work/threat-detection`: live latency benchmarking, memory usage graphing, and classification output.
- Verification: Model loads and executes within < 50ms locally, zero network leaks of inference data.

---

## Phase 4: Simulated Cyber Warfare / SOC Telemetry Visualizer

**Goal:** Create a high-tech, mission-critical SOC telemetry radar and alert triage interface demonstrating security operational expertise.

### Deliverables:
- Interactive cyber attack topology visualizer with glowing packet vectors and node status indicators.
- Live stream simulator generating realistic synthetic NetFlow/Zeek network log events.
- Packet inspection slide-out drawer displaying decoded payloads, protocol headers, and isolation scores.
- Interactive triage actions allowing visitors to investigate alerts and evaluate threat severity.
- Verification: Responsive layout, accessible keyboard navigation, and zero impact on main thread frame rate.

---

## Phase 5: Cloudflare Workers AI Neural Research Copilot

**Goal:** Connect an edge AI assistant trained on Ambul's research papers, case studies, and code to guide recruiters and technical visitors.

### Deliverables:
- Cloudflare Pages Function / Worker API endpoint using Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`).
- Case studies and research documentation indexed into Cloudflare Vectorize vector embeddings.
- HUD terminal research copilot interface with streaming token response, strict markdown rendering, and citation pills.
- Integration of Phase 3 hidden features (terminal backtick toggle, CTF challenge, Konami intrusion mode, differential privacy blur).
- Verification: Streaming response under 500ms TTFT, zero hallucinations of unverified facts, strict CSP compliance.

---

## Phase 6: Edge Hardening, A11y Audit & Deployment to ambul.dev

**Goal:** Finalize security headers, accessibility compliance, performance audits, and deploy to Cloudflare Pages on `ambul.dev`.

### Deliverables:
- Production `_headers` configuring strict Content Security Policy, HSTS, X-Content-Type-Options, and Permissions-Policy.
- Automated Playwright and axe-core accessibility audit asserting 0 violations across all routes.
- Lighthouse performance, accessibility, best practices, and SEO scores $\ge 90$.
- Cloudflare Pages deployment configuration and custom domain binding for `https://ambul.dev`.
- Final STATUS.md and README.md documentation update.

---
*Roadmap defined: 2026-10-19*
