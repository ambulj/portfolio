// src/scene/negotiator.ts — Capability negotiation and tiered rendering resolution

import { DeviceCapability, GraphicsTier } from './types';

const REDUCE_3D_KEY = 'reduce3d';
const REDUCE_3D_EVENT = 'reduce3d-change';

export function getReduce3DPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(REDUCE_3D_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setReduce3DPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REDUCE_3D_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent(REDUCE_3D_EVENT, { detail: { enabled } }));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // LocalStorage access restricted in private mode
  }
}

export function subscribeToReduce3D(callback: (enabled: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ enabled: boolean }>;
    callback(customEvent.detail?.enabled ?? getReduce3DPreference());
  };

  const handleStorageEvent = () => {
    callback(getReduce3DPreference());
  };

  window.addEventListener(REDUCE_3D_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(REDUCE_3D_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export async function negotiateDeviceCapability(): Promise<DeviceCapability> {
  if (typeof window === 'undefined') {
    return {
      tier: 'tier-0-svg',
      isReducedMotion: false,
      userDisabled: false,
      reason: 'Server-side rendering environment',
    };
  }

  // 1. Accessibility First: prefers-reduced-motion check
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotionQuery.matches) {
    return {
      tier: 'tier-0-svg',
      isReducedMotion: true,
      userDisabled: false,
      reason: 'User prefers reduced motion (system accessible override)',
    };
  }

  // 2. User Explicit Override: "Reduce 3D" persisted toggle
  if (getReduce3DPreference()) {
    return {
      tier: 'tier-0-svg',
      isReducedMotion: false,
      userDisabled: true,
      reason: 'User enabled Reduce 3D manual setting',
    };
  }

  // 3. WebGPU Capability Probe (Tier 2)
  const navGpu = typeof navigator !== 'undefined' ? (navigator as unknown as { gpu?: any }).gpu : undefined;
  if (navGpu && typeof navGpu.requestAdapter === 'function') {
    try {
      const adapter = await navGpu.requestAdapter({
        powerPreference: 'high-performance',
      });
      if (adapter) {
        // Attempt device acquisition
        const device = await adapter.requestDevice();
        if (device) {
          const adapterInfo = typeof adapter.requestAdapterInfo === 'function' 
            ? await adapter.requestAdapterInfo() 
            : undefined;
          
          // Cleanup probe device
          device.destroy();

          return {
            tier: 'tier-2-webgpu',
            adapterInfo,
            isReducedMotion: false,
            userDisabled: false,
            reason: 'WebGPU supported with valid device allocation',
          };
        }
      }
    } catch (e) {
      console.warn('[GraphicsNegotiator] WebGPU probe failed, evaluating WebGL2:', e);
    }
  }

  // 4. WebGL2 Capability Probe (Tier 1)
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    if (gl) {
      // Loose context after probe
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();

      return {
        tier: 'tier-1-webgl2',
        isReducedMotion: false,
        userDisabled: false,
        reason: 'WebGL2 initialized successfully',
      };
    }
  } catch (e) {
    console.warn('[GraphicsNegotiator] WebGL2 probe failed:', e);
  }

  // 5. Ultimate Fallback (Tier 0)
  return {
    tier: 'tier-0-svg',
    isReducedMotion: false,
    userDisabled: false,
    reason: 'Hardware acceleration unsupported; fallback to vector SVG',
  };
}
