'use client';

import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, ShieldCheck, HelpCircle, Sliders } from 'lucide-react';

interface TelemetryPoint {
  metric: string;
  trueValue: number;
  unit: string;
  sensitivity: number; // Delta f
}

const SAMPLE_TELEMETRY: TelemetryPoint[] = [
  { metric: 'Ingress Packet Count (10s)', trueValue: 1420, unit: 'pkts', sensitivity: 1.0 },
  { metric: 'Mean Anomaly Probability', trueValue: 0.84, unit: 'score', sensitivity: 0.1 },
  { metric: 'Active Operator Sessions', trueValue: 3, unit: 'users', sensitivity: 1.0 },
  { metric: 'WASM SIMD Latency', trueValue: 0.88, unit: 'ms', sensitivity: 0.2 },
];

/**
 * Laplace noise generator using Inverse Transform Sampling:
 * X = mu - b * sgn(U) * ln(1 - 2*|U|) where U ~ Uniform(-0.5, 0.5), b = sensitivity / epsilon
 */
function sampleLaplace(scale: number): number {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

export default function DifferentialPrivacyDemo() {
  const [epsilon, setEpsilon] = useState<number>(1.0);
  const [isNoisy, setIsNoisy] = useState<boolean>(true);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  // Calibrate noisy values based on current epsilon and seed
  const randomizedData = useMemo(() => {
    return SAMPLE_TELEMETRY.map((item) => {
      const scale = item.sensitivity / epsilon;
      const noise = sampleLaplace(scale);
      const perturbed = isNoisy ? item.trueValue + noise : item.trueValue;
      return {
        ...item,
        noise: isNoisy ? noise : 0,
        displayValue: Number(perturbed.toFixed(item.unit === 'score' || item.unit === 'ms' ? 3 : 0)),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epsilon, isNoisy, refreshSeed]);

  return (
    <div 
      data-testid="differential-privacy-demo"
      className="p-5 bg-surface-subtle border border-border-subtle rounded-lg space-y-4 font-mono text-ink-primary"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border-subtle gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accent-cyan" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
            Client-Side Differential Privacy (Laplace Mechanism)
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <button
            onClick={() => setIsNoisy(!isNoisy)}
            className={`px-2.5 py-1 rounded border flex items-center space-x-1.5 transition-colors ${
              isNoisy 
                ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan' 
                : 'bg-surface-elevated border-border-subtle text-ink-secondary'
            }`}
          >
            {isNoisy ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{isNoisy ? 'DP NOISE ACTIVE' : 'RAW TELEMETRY'}</span>
          </button>

          <button
            onClick={() => setRefreshSeed((s) => s + 1)}
            className="px-2.5 py-1 rounded bg-surface-elevated border border-border-subtle hover:border-accent-cyan/50 text-ink-secondary hover:text-ink-primary transition-colors"
            title="Sample new Laplace noise draw"
          >
            RE-DRAW
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed font-sans">
        Demonstrates mathematical privacy guarantees for published telemetry data. The Laplace mechanism injects calibrated noise{' '}
        <span className="font-mono text-accent-cyan font-semibold">Lap(0, Δf / ε)</span>, preventing adversaries from reconstructing individual user sessions or exact query counts while preserving aggregate statistical utility.
      </p>

      {/* Interactive Epsilon Slider */}
      <div className="p-3 bg-surface-elevated/70 border border-border-subtle rounded space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1.5 font-bold">
            <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
            <span>PRIVACY BUDGET (ε - EPSILON):</span>
            <span className="text-accent-cyan text-sm">{epsilon.toFixed(1)}</span>
          </span>

          <span className="text-[10px] text-ink-muted">
            {epsilon <= 0.5 ? 'HIGH PRIVACY (HEAVY NOISE)' : epsilon >= 3.0 ? 'LOW PRIVACY (NEAR RAW)' : 'BALANCED (PROD RECOMMENDED)'}
          </span>
        </div>

        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={epsilon}
          onChange={(e) => setEpsilon(parseFloat(e.target.value))}
          data-testid="dp-epsilon-slider"
          className="w-full h-1.5 bg-oled rounded-lg appearance-none cursor-pointer accent-accent-cyan"
          aria-label="Differential Privacy Epsilon Slider"
        />

        <div className="flex justify-between text-[10px] text-ink-muted">
          <span>ε = 0.1 (Strict Confidentiality)</span>
          <span>ε = 1.0 (Standard)</span>
          <span>ε = 5.0 (High Precision)</span>
        </div>
      </div>

      {/* Telemetry Output Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] text-ink-muted uppercase">
              <th className="pb-2">Telemetry Attribute</th>
              <th className="pb-2 text-right">Published Output</th>
              <th className="pb-2 text-right">Injected Noise</th>
              <th className="pb-2 text-right">Sensitivity (Δf)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {randomizedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface-elevated/30 transition-colors">
                <td className="py-2 text-ink-secondary">{item.metric}</td>
                <td className="py-2 text-right font-bold text-accent-cyan">
                  {item.displayValue} {item.unit}
                </td>
                <td className="py-2 text-right text-accent-amber text-[11px]">
                  {item.noise >= 0 ? `+${item.noise.toFixed(2)}` : item.noise.toFixed(2)}
                </td>
                <td className="py-2 text-right text-ink-muted text-[11px]">
                  {item.sensitivity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
