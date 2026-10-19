// src/lib/ml/inference-engine.ts
// In-browser client ML inference engine powered by ONNX Runtime Web (WASM SIMD)
// Gated by Web Crypto SHA-256 buffer integrity validation (ML-01 to ML-04)

import { getOnnxRuntime } from './onnx-runtime';
import { verifyModelBuffer, VerificationResult } from './verifier';
import {
  EXPECTED_MODEL_SHA256,
  MODEL_PATH,
  NetFlowFeatures,
  CLASSIFICATION_THRESHOLDS
} from './model-manifest';

export interface InferenceOutput {
  anomalyScore: number;       // Probability 0.0 - 1.0
  benignScore: number;        // Probability 0.0 - 1.0
  isAnomaly: boolean;         // True if anomalyScore >= CLASSIFICATION_THRESHOLDS.SUSPICIOUS_MAX
  status: 'BENIGN' | 'SUSPICIOUS' | 'ANOMALY';
  confidence: number;         // 0 - 100 percentage
  latencyMs: number;          // Measured latency in milliseconds
  executionProvider: string;  // e.g. 'wasm' or 'webgpu'
  memoryFootprint: number;    // Model buffer size in bytes
}

export interface EngineState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  verification: VerificationResult | null;
  executionProvider: string;
}

let activeSession: any = null;
let cachedModelBuffer: ArrayBuffer | null = null;
let lastVerification: VerificationResult | null = null;
let activeProvider = 'wasm';

/**
 * Initializes the ML inference engine by fetching model weights,
 * verifying SHA-256 checksum, and compiling the WASM inference session.
 */
export async function initInferenceEngine(options?: {
  forceTamper?: boolean;
}): Promise<VerificationResult> {
  // If forceTamper is requested, simulate tampering by corrupting the buffer
  if (options?.forceTamper) {
    if (activeSession) {
      try {
        await activeSession.release?.();
      } catch {
        // Ignore release error
      }
      activeSession = null;
    }

    // Corrupt buffer
    const response = await fetch(MODEL_PATH);
    if (!response.ok) {
      throw new Error(`Failed to fetch model from ${MODEL_PATH}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const tampered = new Uint8Array(buffer);
    // Flip bytes to invalidate signature
    tampered[16] ^= 0xAA;
    tampered[32] ^= 0xFF;

    // This must throw SecurityIntegrityError
    return await verifyModelBuffer(tampered.buffer, EXPECTED_MODEL_SHA256);
  }

  if (activeSession && lastVerification) {
    return lastVerification;
  }

  // 1. Fetch model binary
  const response = await fetch(MODEL_PATH);
  if (!response.ok) {
    throw new Error(`Failed to fetch model from ${MODEL_PATH} (HTTP ${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  cachedModelBuffer = buffer;

  // 2. Cryptographic buffer verification before WASM memory allocation
  const verification = await verifyModelBuffer(buffer, EXPECTED_MODEL_SHA256);
  lastVerification = verification;

  // 3. Initialize ONNX runtime and allocate session
  const ort = await getOnnxRuntime();

  // Try wasm execution provider (robust across all browsers without COOP/COEP headers)
  const sessionOptions = {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all' as const
  };

  const session = await ort.InferenceSession.create(
    new Uint8Array(buffer),
    sessionOptions
  );

  activeSession = session;
  activeProvider = 'wasm';

  return verification;
}

/**
 * Runs client-side inference on 6 continuous NetFlow features.
 * Features: duration, src_bytes, dst_bytes, failed_logins, packet_rate, entropy
 */
export async function runInference(
  features: NetFlowFeatures
): Promise<InferenceOutput> {
  if (!activeSession) {
    await initInferenceEngine();
  }

  const ort = await getOnnxRuntime();

  // Construct flat 1x6 Float32Array
  const inputData = new Float32Array([
    features.duration,
    features.src_bytes,
    features.dst_bytes,
    features.failed_logins,
    features.packet_rate,
    features.entropy
  ]);

  const inputTensor = new ort.Tensor('float32', inputData, [1, 6]);
  const inputName = activeSession.inputNames[0] || 'input';

  // Benchmark high-resolution execution duration
  const startTime = performance.now();
  const results = await activeSession.run({ [inputName]: inputTensor });
  const endTime = performance.now();
  const latencyMs = Number((endTime - startTime).toFixed(2));

  const outputName = activeSession.outputNames[0] || 'probabilities';
  const outputTensor = results[outputName];
  const outputData = outputTensor.data as Float32Array;

  const benignScore = Math.max(0, Math.min(1, outputData[0]));
  const anomalyScore = Math.max(0, Math.min(1, outputData[1]));

  let status: 'BENIGN' | 'SUSPICIOUS' | 'ANOMALY' = 'BENIGN';
  if (anomalyScore >= CLASSIFICATION_THRESHOLDS.SUSPICIOUS_MAX) {
    status = 'ANOMALY';
  } else if (anomalyScore >= CLASSIFICATION_THRESHOLDS.BENIGN_MAX) {
    status = 'SUSPICIOUS';
  }

  const confidence = Math.round(Math.max(benignScore, anomalyScore) * 100);
  const memoryFootprint = cachedModelBuffer ? cachedModelBuffer.byteLength : 4260;

  return {
    anomalyScore,
    benignScore,
    isAnomaly: status === 'ANOMALY',
    status,
    confidence,
    latencyMs,
    executionProvider: activeProvider,
    memoryFootprint
  };
}

/**
 * Releases memory allocations and disposes the ONNX runtime session.
 */
export async function disposeInferenceEngine(): Promise<void> {
  if (activeSession) {
    try {
      await activeSession.release?.();
    } catch {
      // Ignore release error
    }
    activeSession = null;
  }
  cachedModelBuffer = null;
  lastVerification = null;
}
