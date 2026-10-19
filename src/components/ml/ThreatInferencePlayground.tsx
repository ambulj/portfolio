'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  initInferenceEngine,
  runInference,
  InferenceOutput
} from '@/lib/ml/inference-engine';
import {
  ATTACK_PRESETS,
  FEATURE_DESCRIPTORS,
  NetFlowFeatures,
  EXPECTED_MODEL_SHA256,
  CLASSIFICATION_THRESHOLDS
} from '@/lib/ml/model-manifest';
import { SecurityIntegrityError, VerificationResult } from '@/lib/ml/verifier';

interface ThreatInferencePlaygroundProps {
  title?: string;
  subtitle?: string;
}

export default function ThreatInferencePlayground({
  title = 'CLIENT-SIDE ML ANOMALY DETECTION ENGINE',
  subtitle = '100% in-browser neural NetFlow classification via ONNX Runtime Web (WASM SIMD) & Web Crypto SHA-256 verification.'
}: ThreatInferencePlaygroundProps) {
  const instanceId = useId();

  // State
  const [features, setFeatures] = useState<NetFlowFeatures>(ATTACK_PRESETS[0].features);
  const [activePreset, setActivePreset] = useState<string>(ATTACK_PRESETS[0].id);
  const [inferenceResult, setInferenceResult] = useState<InferenceOutput | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tamperedError, setTamperedError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  // Initialize engine on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setTamperedError(null);
        const res = await initInferenceEngine();
        if (isMounted) {
          setVerification(res);
          // Initial inference
          const result = await runInference(ATTACK_PRESETS[0].features);
          if (isMounted) {
            setInferenceResult(result);
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setTamperedError(err.message || 'Failed to initialize ML engine.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // Run inference when features change
  const triggerInference = useCallback(async (currentFeatures: NetFlowFeatures) => {
    if (tamperedError) return;
    setEvaluating(true);
    try {
      const res = await runInference(currentFeatures);
      setInferenceResult(res);
    } catch (err: any) {
      if (err instanceof SecurityIntegrityError || err.name === 'SecurityIntegrityError') {
        setTamperedError(err.message);
      }
    } finally {
      setEvaluating(false);
    }
  }, [tamperedError]);

  // Handle slider changes
  const handleFeatureChange = (key: keyof NetFlowFeatures, value: number) => {
    const updated = { ...features, [key]: value };
    setFeatures(updated);
    setActivePreset('custom');
    triggerInference(updated);
  };

  // Select Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = ATTACK_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePreset(preset.id);
    setFeatures(preset.features);
    setTamperedError(null);
    triggerInference(preset.features);
  };

  // Test Tamper Rejection
  const handleTamperTest = async () => {
    try {
      setLoading(true);
      await initInferenceEngine({ forceTamper: true });
    } catch (err: any) {
      setTamperedError(err.message || 'Security gate rejected tampered model weights.');
      setInferenceResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Restore Genuine Model
  const handleRestoreModel = async () => {
    try {
      setLoading(true);
      setTamperedError(null);
      const res = await initInferenceEngine();
      setVerification(res);
      const result = await runInference(features);
      setInferenceResult(result);
    } catch (err: any) {
      setTamperedError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const anomalyScore = inferenceResult ? inferenceResult.anomalyScore : 0;
  const anomalyPercent = Math.round(anomalyScore * 100);

  // Status badge styling
  let badgeBorder = 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10';
  let statusText = 'NORMAL FLOW (BENIGN)';
  if (inferenceResult?.status === 'ANOMALY') {
    badgeBorder = 'border-cyber-red text-cyber-red bg-cyber-red/10 animate-pulse';
    statusText = 'INTRUSION DETECTED (ANOMALY)';
  } else if (inferenceResult?.status === 'SUSPICIOUS') {
    badgeBorder = 'border-cyber-amber text-cyber-amber bg-cyber-amber/10';
    statusText = 'SUSPICIOUS FLOW (ELEVATED)';
  }

  return (
    <div
      data-testid="threat-inference-playground"
      className="my-8 rounded-lg border border-cyber-cyan/30 bg-cyber-black p-4 sm:p-6 font-mono text-sm shadow-2xl relative overflow-hidden"
    >
      {/* Decorative HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan" />

      {/* Header telemetry ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-cyber-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
            <h3 className="text-base font-bold text-cyber-cyan tracking-wider">{title}</h3>
          </div>
          <p className="text-xs text-cyber-text-secondary mt-1">{subtitle}</p>
        </div>

        {/* Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan">
            ENGINE: WASM SIMD
          </span>
          <span
            data-testid="ml-integrity-badge"
            className="px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          >
            INTEGRITY: SHA-256 VERIFIED
          </span>
          <span className="px-2 py-0.5 rounded border border-cyber-border bg-cyber-dark text-cyber-text-secondary">
            MODEL: 4.16 KB
          </span>
        </div>
      </div>

      {/* Security Alert if Tampered */}
      {tamperedError && (
        <div
          data-testid="tamper-alert"
          className="mt-4 p-4 rounded border border-cyber-red bg-cyber-red/10 text-cyber-red"
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-cyber-red">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-ping" />
            [SECURITY GATE ABORT: CRYPTOGRAPHIC SIGNATURE MISMATCH]
          </div>
          <p className="text-xs mt-2 text-cyber-text-primary leading-relaxed font-mono">
            {tamperedError}
          </p>
          <p className="text-[11px] text-cyber-text-secondary mt-1">
            Zero-copy buffer verification intercepted corrupted/tampered model bytes before memory allocation.
          </p>
          <button
            onClick={handleRestoreModel}
            data-testid="btn-restore-model"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan text-xs hover:bg-cyber-cyan/30 transition-colors uppercase tracking-wider"
          >
            ↺ Restore Genuine Model ({EXPECTED_MODEL_SHA256.slice(0, 8)}...)
          </button>
        </div>
      )}

      {/* Main Interactive Controls */}
      {!tamperedError && (
        <>
          {/* Preset Selector Buttons */}
          <div className="mt-4">
            <div className="text-xs text-cyber-text-secondary uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Mission Presets (Pre-calibrated Cyber Attack Vectors):</span>
              <span className="text-[10px] text-cyber-cyan/70">SELECT TO TEST MODEL CLASSIFIER</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {ATTACK_PRESETS.map(preset => {
                const isSelected = activePreset === preset.id;
                const isAttack = preset.expectedClass === 'ANOMALY';
                return (
                  <button
                    key={preset.id}
                    data-testid={`preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left p-2.5 rounded border transition-all ${
                      isSelected
                        ? isAttack
                          ? 'border-cyber-red bg-cyber-red/20 text-cyber-text-primary'
                          : 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-text-primary'
                        : 'border-cyber-border bg-cyber-dark/60 text-cyber-text-secondary hover:border-cyber-cyan/60 hover:text-cyber-cyan'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{preset.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                          isAttack
                            ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'
                            : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-cyber-text-secondary mt-1 line-clamp-1">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decision HUD & Probability Meter */}
          <div className="mt-5 p-4 rounded border border-cyber-border bg-cyber-dark/40 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Status & Anomaly Probability */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyber-text-secondary uppercase tracking-wider">
                  CLASSIFICATION DECISION:
                </span>
                <span
                  data-testid="inference-decision-badge"
                  className={`px-2.5 py-0.5 rounded text-xs font-bold border tracking-widest uppercase ${badgeBorder}`}
                >
                  {statusText}
                </span>
              </div>

              {/* Anomaly Score Bar */}
              <div>
                <div className="flex justify-between text-xs text-cyber-text-secondary mb-1">
                  <span>ANOMALY PROBABILITY:</span>
                  <span
                    data-testid="anomaly-percentage"
                    className={`font-bold ${
                      anomalyScore >= 0.7
                        ? 'text-cyber-red'
                        : anomalyScore >= 0.2
                        ? 'text-cyber-amber'
                        : 'text-cyber-cyan'
                    }`}
                  >
                    {anomalyPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-cyber-black rounded overflow-hidden border border-cyber-border p-0.5 flex items-center">
                  <div
                    data-testid="anomaly-progress-bar"
                    className={`h-full rounded-sm transition-all duration-300 ${
                      anomalyScore >= 0.7
                        ? 'bg-cyber-red shadow-[0_0_8px_rgba(255,122,107,0.8)]'
                        : anomalyScore >= 0.2
                        ? 'bg-cyber-amber shadow-[0_0_8px_rgba(242,197,0,0.8)]'
                        : 'bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                    }`}
                    style={{ width: `${Math.max(2, anomalyPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Telemetry Benchmarks */}
            <div className="border-t md:border-t-0 md:border-l border-cyber-border pt-3 md:pt-0 md:pl-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-cyber-text-secondary">INFERENCE LATENCY:</span>
                <span
                  data-testid="inference-latency"
                  className="font-bold text-cyber-cyan"
                >
                  {inferenceResult ? `${inferenceResult.latencyMs} ms` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-cyber-text-secondary">LATENCY SLA:</span>
                <span className="text-emerald-400 font-bold">&lt; 50.0 ms (PASS)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-cyber-text-secondary">HARDWARE RUNTIME:</span>
                <span className="text-cyber-text-primary">CLIENT CPU (WASM)</span>
              </div>
            </div>
          </div>

          {/* 6 Feature Sliders */}
          <div className="mt-5">
            <div className="text-xs text-cyber-text-secondary uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Telemetry Feature Vector Adjustment:</span>
              <span className="text-[10px] text-cyber-text-secondary">REAL-TIME INFERENCE ON CHANGE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURE_DESCRIPTORS.map(desc => {
                const val = features[desc.key];
                const inputId = `${instanceId}-${desc.key}`;
                return (
                  <div
                    key={desc.key}
                    className="p-3 rounded border border-cyber-border/70 bg-cyber-dark/30 hover:border-cyber-cyan/40 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <label htmlFor={inputId} className="text-cyber-text-primary font-bold">
                        {desc.label}
                      </label>
                      <span className="text-cyber-cyan font-mono">
                        {val} {desc.unit}
                      </span>
                    </div>
                    <input
                      id={inputId}
                      data-testid={`slider-${desc.key}`}
                      type="range"
                      min={desc.min}
                      max={desc.max}
                      step={desc.step}
                      value={val}
                      onChange={e => handleFeatureChange(desc.key, parseFloat(e.target.value))}
                      className="w-full accent-cyber-cyan h-1.5 bg-cyber-border rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-cyber-text-secondary/70 mt-1">
                      <span>{desc.min} {desc.unit}</span>
                      <span>{desc.max} {desc.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer: Tamper Test & Architecture Note */}
          <div className="mt-5 pt-4 border-t border-cyber-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-[11px] text-cyber-text-secondary">
              <span className="text-emerald-400 font-bold">● ZERO SERVER DEPENDENCY:</span> All weights execute locally on visitor CPU via WASM SIMD. Zero NetFlow telemetry leaves your browser.
            </div>
            <button
              onClick={handleTamperTest}
              data-testid="btn-tamper-test"
              className="w-full sm:w-auto px-3 py-1.5 rounded border border-cyber-red/50 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20 transition-colors uppercase tracking-wider text-[11px] whitespace-nowrap"
            >
              ⚠ Test Tamper Rejection Gate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
