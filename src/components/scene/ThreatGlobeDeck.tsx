'use client';

// src/components/scene/ThreatGlobeDeck.tsx — Client-Side 3D Threat Deck Mount

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  negotiateDeviceCapability,
  subscribeToReduce3D,
  getReduce3DPreference,
} from '@/scene/negotiator';
import { DeviceCapability, ScreenTooltipData, ThreatEngineInstance } from '@/scene/types';
import { createThreatEngine } from '@/scene/engine';
import ThreatTooltip from './ThreatTooltip';
import { Cpu, ShieldCheck, EyeOff } from 'lucide-react';

export default function ThreatGlobeDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ThreatEngineInstance | null>(null);

  const [capability, setCapability] = useState<DeviceCapability | null>(null);
  const [tooltip, setTooltip] = useState<ScreenTooltipData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    let active = true;

    async function initCapability() {
      const cap = await negotiateDeviceCapability();
      if (!active) return;
      setCapability(cap);
    }

    initCapability();

    // Subscribe to Reduce 3D setting changes
    const unsubscribe = subscribeToReduce3D(async (enabled) => {
      if (!active) return;
      if (enabled) {
        if (engineRef.current) {
          engineRef.current.dispose();
          engineRef.current = null;
        }
        setCapability((prev) =>
          prev
            ? { ...prev, tier: 'tier-0-svg', userDisabled: true }
            : { tier: 'tier-0-svg', isReducedMotion: false, userDisabled: true, reason: 'Reduce 3D active' }
        );
      } else {
        const cap = await negotiateDeviceCapability();
        if (active) setCapability(cap);
      }
    });

    return () => {
      active = false;
      unsubscribe();
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  // Initialize ThreatEngine when capability and canvas are ready
  useEffect(() => {
    if (!isMounted || !capability || capability.tier === 'tier-0-svg') {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    if (!containerRef.current || !canvasRef.current) return;

    let disposed = false;

    createThreatEngine({
      container: containerRef.current,
      canvas: canvasRef.current,
      capability,
      onTooltipChange: (data) => {
        if (!disposed) setTooltip(data);
      },
      onNodeSelect: (slug) => {
        if (!disposed && slug) {
          router.push(`/work/${slug}`);
        }
      },
    }).then((instance) => {
      if (disposed) {
        instance.dispose();
      } else {
        engineRef.current = instance;
      }
    });

    return () => {
      disposed = true;
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [capability, isMounted, router]);

  // If Tier 0, return null so parent CanvasDeckContainer renders clean SSR SVG baseline
  if (!capability || capability.tier === 'tier-0-svg') {
    return null;
  }

  const getTierBadge = () => {
    if (capability.tier === 'tier-2-webgpu') {
      return (
        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-mono">
          <Cpu className="w-3 h-3" aria-hidden="true" />
          <span>TIER 2 WEBGPU COMPUTE</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 text-accent-amber text-[10px] font-mono">
        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
        <span>TIER 1 WEBGL2 INSTANCED</span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto"
      aria-hidden="true"
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair focus:outline-none"
        tabIndex={-1}
      />

      {/* Floating HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        {getTierBadge()}
      </div>

      {/* Interactive Tooltip Overlay */}
      <ThreatTooltip data={tooltip} />
    </div>
  );
}
