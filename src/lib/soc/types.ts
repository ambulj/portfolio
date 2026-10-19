// src/lib/soc/types.ts
// Strongly-typed data models for the SOC Cyber Warfare Telemetry Visualizer (SOC-01, SOC-02, SOC-03)

import { NetFlowFeatures } from '@/lib/ml/model-manifest';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'TLS 1.3' | 'HTTP/2' | 'DNS';

export type NodeId =
  | 'ingress-gateway'
  | 'dmz-bastion'
  | 'microservices'
  | 'auth-vault'
  | 'db-cluster';

export type NodeStatus = 'HEALTHY' | 'DEGRADED' | 'UNDER_ATTACK' | 'ISOLATED';

export interface TopologyNode {
  id: NodeId;
  name: string;
  role: string;
  tier: number;
  status: NodeStatus;
  x: number;
  y: number;
  ip: string;
  activeAttacks: number;
}

export interface DecodedHeaders {
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: ProtocolType;
  ttl: number;
  ipVersion: 4 | 6;
  packetSize: number;
  tcpFlags?: {
    syn: boolean;
    ack: boolean;
    fin: boolean;
    rst: boolean;
    psh: boolean;
    urg: boolean;
  };
  windowSize?: number;
  seqNumber?: number;
  ackNumber?: number;
  layer7?: {
    dnsQuery?: string;
    tlsSni?: string;
    tlsCipher?: string;
    httpMethod?: string;
    httpPath?: string;
    userAgent?: string;
  };
}

export interface RawPayloadFrame {
  rawHex: string;
  rawAscii: string;
  anomalousOffsets?: [number, number]; // [startByte, endByte] for highlighting
}

export interface MlScoreResult {
  anomalyScore: number;
  confidence: number;
  status: 'BENIGN' | 'SUSPICIOUS' | 'ANOMALY';
  latencyMs?: number;
}

export interface TriagedAction {
  action: 'ISOLATED' | 'FALSE_POSITIVE' | 'INVESTIGATING';
  timestamp: string;
  analystNote?: string;
}

export interface SocTelemetryEvent {
  id: string;
  timestamp: string;
  timestampMs: number;
  sourceNode: NodeId;
  targetNode: NodeId;
  signature: string;
  mitreTechnique: string;
  severity: SeverityLevel;
  headers: DecodedHeaders;
  payload: RawPayloadFrame;
  netflow: NetFlowFeatures; // Direct input features for Phase 3 ONNX Runtime WASM model
  mlScore?: MlScoreResult;
  triaged?: TriagedAction;
}

export type StreamSpeed = 0.5 | 1 | 2;
export type StreamStatus = 'PLAYING' | 'PAUSED';

export interface SocMetrics {
  totalPackets: number;
  activeAnomalies: number;
  isolatedHosts: number;
  falsePositiveCount: number;
  falsePositiveRate: number; // Percentage 0 - 100
}
