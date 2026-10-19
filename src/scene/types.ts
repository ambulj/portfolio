// src/scene/types.ts — Core TypeScript definitions for the 3D Threat Topology & WebGPU engine

export type GraphicsTier = 'tier-2-webgpu' | 'tier-1-webgl2' | 'tier-0-svg';

export interface DeviceCapability {
  tier: GraphicsTier;
  adapterInfo?: GPUAdapterInfo;
  isReducedMotion: boolean;
  userDisabled: boolean;
  reason: string;
}

export type NodeStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface NodeTelemetry {
  id: string;
  label: string;
  slug: string;
  role: string;
  lat: number;
  lon: number;
  anomalyScore: number;
  status: NodeStatus;
  protocol: string;
  position: [number, number, number];
}

export interface AttackArc {
  id: string;
  sourceId: string;
  targetId: string;
  threatType: string;
  color: string;
  speed: number;
  active: boolean;
}

export interface ScreenTooltipData {
  node: NodeTelemetry;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export interface ThreatEngineConfig {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  capability: DeviceCapability;
  onTooltipChange?: (tooltip: ScreenTooltipData | null) => void;
  onNodeSelect?: (slug: string) => void;
}

export interface ThreatEngineInstance {
  dispose: () => void;
  setCursor: (x: number, y: number, isHovering: boolean) => void;
  setTier: (tier: GraphicsTier) => void;
  getFPS: () => number;
}
