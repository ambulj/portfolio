# Phase 3 Context: In-Browser Client ML Inference (ONNX Runtime Web WASM)

## Requirements Covered
- **ML-01**: ONNX Runtime Web integration configured with WebAssembly (WASM) and WebGPU execution providers.
- **ML-02**: Pre-packaged lightweight anomaly detection model running completely on client hardware.
- **ML-03**: Client-side cryptographic integrity verification (SHA-256) of model weights before WASM memory allocation.
- **ML-04**: Interactive model benchmark widget: latency timer, memory profile, and inference confidence output.

## Architectural Goals
1. **Zero-Server Client-Side Execution:**
   - Inference runs 100% inside the client browser with zero network calls, preserving visitor privacy and demonstrating client-edge AI expertise.
2. **Cryptographic Supply-Chain Verification:**
   - Model weights downloaded from static public assets (`/models/*.onnx`) are hashed via `crypto.subtle.digest('SHA-256', buffer)` and verified against a pinned digest signature before passing to the runtime session.
3. **Interactive Benchmarking & Visuals:**
   - Interactive inference widget on `/work/inferyx` (AutoML drift classifier / profile tester) and `/work/threat-detection` (NetFlow anomaly detector with Isolation Forest / GBDT output).
   - Real-time telemetry: execution time ($\mu\text{s} / \text{ms}$), confidence probability, model memory footprint, and decision classification.
4. **Resilient Loading & Performance:**
   - Lightweight quantized model ($< 250\text{ KB}$) for instant loading.
   - Fallback execution provider chain: WebGPU $\to$ WASM SIMD $\to$ WASM standard.
   - Dynamic client loading with Web Worker or deferred initialization to avoid main thread jank during compilation.
