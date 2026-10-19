'use client';

// src/components/scene/ThreatTooltip.tsx — High-tech HUD Telemetry Tooltip projected onto screen coordinates

import React from 'react';
import Link from 'next/link';
import { ScreenTooltipData } from '@/scene/types';
import { ShieldAlert, Activity, Cpu, ArrowUpRight } from 'lucide-react';

interface ThreatTooltipProps {
  data: ScreenTooltipData | null;
}

export default function ThreatTooltip({ data }: ThreatTooltipProps) {
  if (!data || !data.visible) return null;

  const { node, screenX, screenY } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-accent-red border-accent-red/40 bg-accent-red/10';
      case 'WARNING': return 'text-accent-amber border-accent-amber/40 bg-accent-amber/10';
      default: return 'text-accent-cyan border-accent-cyan/40 bg-accent-cyan/10';
    }
  };

  return (
    <div
      className="absolute pointer-events-auto z-30 transition-all duration-75 ease-out"
      style={{
        left: `${screenX + 16}px`,
        top: `${screenY - 32}px`,
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      <div className="w-64 p-3 bg-black/90 backdrop-blur-md border border-border-subtle rounded-md shadow-2xl corner-bracket text-xs font-mono space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/80 pb-1.5">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-accent-cyan animate-pulse" aria-hidden="true" />
            <span className="font-semibold text-ink-primary tracking-wide">{node.label}</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getStatusColor(node.status)}`}>
            {node.status}
          </span>
        </div>

        {/* Telemetry rows */}
        <div className="space-y-1 text-[11px] text-ink-secondary">
          <div className="flex justify-between">
            <span>ROLE:</span>
            <span className="text-ink-primary truncate max-w-[140px]">{node.role}</span>
          </div>
          <div className="flex justify-between">
            <span>PROTOCOL:</span>
            <span className="text-accent-cyan truncate max-w-[130px]">{node.protocol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>ANOMALY SCORE:</span>
            <div className="flex items-center space-x-1">
              <div className="w-12 h-1.5 bg-black/80 rounded-full overflow-hidden border border-border-subtle/60">
                <div
                  className={`h-full ${node.anomalyScore > 0.6 ? 'bg-accent-red' : node.anomalyScore > 0.3 ? 'bg-accent-amber' : 'bg-accent-cyan'}`}
                  style={{ width: `${Math.round(node.anomalyScore * 100)}%` }}
                />
              </div>
              <span className="font-bold text-ink-primary">{(node.anomalyScore).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-ink-secondary/70 pt-0.5">
            <span>COORDINATES:</span>
            <span>{node.lat.toFixed(1)}°N, {node.lon.toFixed(1)}°E</span>
          </div>
        </div>

        {/* Navigation prompt */}
        {node.slug && (
          <div className="pt-1.5 border-t border-border-subtle/60">
            <Link
              href={`/work/${node.slug}`}
              className="w-full flex items-center justify-between px-2 py-1 rounded bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 text-accent-cyan text-[10px] transition-colors"
            >
              <span>INSPECT ARCHITECTURE</span>
              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
