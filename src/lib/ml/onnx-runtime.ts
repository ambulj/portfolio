// src/lib/ml/onnx-runtime.ts
// Browser-only singleton loader for ONNX Runtime Web
// Strictly binds wasmPaths to self-hosted '/wasm/' with zero external CDN dependencies

let ortPromise: Promise<typeof import('onnxruntime-web')> | null = null;

export async function getOnnxRuntime(): Promise<typeof import('onnxruntime-web')> {
  if (typeof window === 'undefined') {
    throw new Error('ONNX Runtime Web can only be executed in a browser client environment.');
  }

  if (!ortPromise) {
    ortPromise = (async () => {
      const ort = await import('onnxruntime-web');

      // Configure strictly self-hosted paths with single-threaded execution
      // Single-threaded eliminates SharedArrayBuffer and COOP/COEP isolation requirements
      if (ort.env && ort.env.wasm) {
        ort.env.wasm.wasmPaths = '/wasm/';
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;
      }

      return ort;
    })();
  }

  return ortPromise;
}
