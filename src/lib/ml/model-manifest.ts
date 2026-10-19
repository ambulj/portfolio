// src/lib/ml/model-manifest.ts
// Pinned cryptographic manifest, feature definitions, and presets for client ML inference

export const EXPECTED_MODEL_SHA256 = 'b39e71a8e807258c8bb079f2a13e766bedd370777a1969b828ca04d259ed99c1';
export const EXPECTED_BYTE_LENGTH = 4260;
export const MODEL_PATH = '/models/threat-anomaly-v1.onnx';

export interface NetFlowFeatures {
  duration: number;      // Seconds
  src_bytes: number;     // Source payload bytes
  dst_bytes: number;     // Destination payload bytes
  failed_logins: number; // Authentication failures
  packet_rate: number;   // Packets per second
  entropy: number;       // Shannon entropy (bits per byte)
}

export interface FeatureDescriptor {
  key: keyof NetFlowFeatures;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
}

export const FEATURE_DESCRIPTORS: FeatureDescriptor[] = [
  {
    key: 'duration',
    label: 'Flow Duration',
    unit: 's',
    min: 0.01,
    max: 60.0,
    step: 0.1,
    defaultValue: 1.2,
    description: 'Total connection duration in seconds'
  },
  {
    key: 'src_bytes',
    label: 'Source Volume',
    unit: 'B',
    min: 0,
    max: 100000,
    step: 100,
    defaultValue: 1450,
    description: 'Outbound payload size transmitted by source'
  },
  {
    key: 'dst_bytes',
    label: 'Destination Volume',
    unit: 'B',
    min: 0,
    max: 500000,
    step: 500,
    defaultValue: 18200,
    description: 'Inbound payload size returned by server'
  },
  {
    key: 'failed_logins',
    label: 'Failed Auth Attempts',
    unit: 'count',
    min: 0,
    max: 20,
    step: 1,
    defaultValue: 0,
    description: 'Number of consecutive authentication rejections'
  },
  {
    key: 'packet_rate',
    label: 'Packet Velocity',
    unit: 'pps',
    min: 1,
    max: 10000,
    step: 10,
    defaultValue: 45,
    description: 'Packet transmission throughput per second'
  },
  {
    key: 'entropy',
    label: 'Payload Entropy',
    unit: 'bits/B',
    min: 0.0,
    max: 8.0,
    step: 0.05,
    defaultValue: 4.2,
    description: 'Shannon randomness score (encrypted/compressed vs plaintext)'
  }
];

export interface AttackPreset {
  id: string;
  name: string;
  tag: string;
  expectedClass: 'BENIGN' | 'ANOMALY';
  description: string;
  features: NetFlowFeatures;
}

export const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: 'benign-web',
    name: 'Benign Web Flow',
    tag: 'HTTP/2 REST',
    expectedClass: 'BENIGN',
    description: 'Typical authenticated TLS web browsing session with balanced payload exchange.',
    features: {
      duration: 1.2,
      src_bytes: 1450,
      dst_bytes: 18200,
      failed_logins: 0,
      packet_rate: 45,
      entropy: 4.2
    }
  },
  {
    id: 'ssh-brute-force',
    name: 'SSH Brute Force',
    tag: 'Credential Stuffing',
    expectedClass: 'ANOMALY',
    description: 'Rapid credential stuffing loop with abnormal failed login spikes and small packet payloads.',
    features: {
      duration: 0.8,
      src_bytes: 420,
      dst_bytes: 850,
      failed_logins: 14,
      packet_rate: 65,
      entropy: 3.8
    }
  },
  {
    id: 'c2-data-exfil',
    name: 'C2 Data Exfiltration',
    tag: 'Encrypted Tunnel',
    expectedClass: 'ANOMALY',
    description: 'Sustained beaconing session leaking high-entropy encrypted blobs to unknown external endpoint.',
    features: {
      duration: 42.0,
      src_bytes: 86400,
      dst_bytes: 3200,
      failed_logins: 0,
      packet_rate: 180,
      entropy: 7.85
    }
  },
  {
    id: 'syn-flood-ddos',
    name: 'SYN Flood DDoS',
    tag: 'Volumetric L4',
    expectedClass: 'ANOMALY',
    description: 'Saturating one-way packet storm designed to exhaust connection state tables without response.',
    features: {
      duration: 2.5,
      src_bytes: 92000,
      dst_bytes: 0,
      failed_logins: 0,
      packet_rate: 8500,
      entropy: 2.1
    }
  }
];

export const CLASSIFICATION_THRESHOLDS = {
  BENIGN_MAX: 0.20,
  SUSPICIOUS_MAX: 0.70
} as const;
