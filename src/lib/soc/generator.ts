// src/lib/soc/generator.ts
// Client-side synthetic NetFlow v9 / Zeek / Suricata event generator & FIFO ring buffer (SOC-01)

import {
  SocTelemetryEvent,
  TopologyNode,
  NodeId,
  RawPayloadFrame,
  DecodedHeaders
} from './types';

export const INITIAL_TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: 'ingress-gateway',
    name: 'Edge Ingress & WAF',
    role: 'L4/L7 Reverse Proxy & DDoS Scrubbing',
    tier: 1,
    status: 'HEALTHY',
    x: 400,
    y: 40,
    ip: '198.51.100.1',
    activeAttacks: 0
  },
  {
    id: 'dmz-bastion',
    name: 'DMZ Zero-Trust Bastion',
    role: 'mTLS Envoy Proxy & Host Isolation',
    tier: 2,
    status: 'HEALTHY',
    x: 400,
    y: 125,
    ip: '10.0.1.5',
    activeAttacks: 0
  },
  {
    id: 'microservices',
    name: 'App Service Mesh',
    role: 'gRPC Cluster & Inference Worker Pool',
    tier: 3,
    status: 'HEALTHY',
    x: 230,
    y: 220,
    ip: '10.0.2.14',
    activeAttacks: 0
  },
  {
    id: 'auth-vault',
    name: 'KMS & Auth Vault',
    role: 'Hardware Security Module & Key Ring',
    tier: 3,
    status: 'HEALTHY',
    x: 570,
    y: 220,
    ip: '10.0.3.8',
    activeAttacks: 0
  },
  {
    id: 'db-cluster',
    name: 'Distributed Database',
    role: 'PostgreSQL Primary & Graph Vector Store',
    tier: 4,
    status: 'HEALTHY',
    x: 400,
    y: 320,
    ip: '10.0.4.20',
    activeAttacks: 0
  }
];

// 6 Realistic Cyber Attack & Normal Traffic Profiles
interface ThreatProfileTemplate {
  signature: string;
  mitreTechnique: string;
  severity: SocTelemetryEvent['severity'];
  sourceNode: NodeId;
  targetNode: NodeId;
  protocol: SocTelemetryEvent['headers']['protocol'];
  srcPort: number;
  dstPort: number;
  netflow: SocTelemetryEvent['netflow'];
  headers: Partial<DecodedHeaders>;
  payloadGenerator: () => RawPayloadFrame;
}

function stringToHexAscii(str: string, anomalousOffsets?: [number, number]): RawPayloadFrame {
  const bytes = new TextEncoder().encode(str);
  const hexParts: string[] = [];
  const asciiParts: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    hexParts.push(b.toString(16).padStart(2, '0'));
    // Replace non-printables
    asciiParts.push(b >= 32 && b <= 126 ? String.fromCharCode(b) : '·');
  }

  return {
    rawHex: hexParts.join(' '),
    rawAscii: asciiParts.join(''),
    anomalousOffsets
  };
}

const THREAT_TEMPLATES: ThreatProfileTemplate[] = [
  // 1. Benign HTTPS Web Flow
  {
    signature: 'TLS 1.3 Secure Session Exchange',
    mitreTechnique: 'N/A (Legitimate)',
    severity: 'LOW',
    sourceNode: 'ingress-gateway',
    targetNode: 'microservices',
    protocol: 'TLS 1.3',
    srcPort: 443,
    dstPort: 8443,
    netflow: {
      duration: 1.2,
      src_bytes: 1450,
      dst_bytes: 18200,
      failed_logins: 0,
      packet_rate: 45,
      entropy: 4.2
    },
    headers: {
      ttl: 64,
      ipVersion: 4,
      packetSize: 1450,
      tcpFlags: { syn: false, ack: true, fin: false, rst: false, psh: true, urg: false },
      windowSize: 64240,
      layer7: {
        tlsSni: 'api.ambul.dev',
        tlsCipher: 'TLS_AES_256_GCM_SHA384',
        httpMethod: 'POST',
        httpPath: '/api/v1/telemetry'
      }
    },
    payloadGenerator: () =>
      stringToHexAscii(
        'POST /api/v1/telemetry HTTP/2\r\nHost: api.ambul.dev\r\nAuthorization: Bearer session_token_8829\r\n\r\n{"status":"sync"}'
      )
  },

  // 2. SSH Credential Brute-Force (Credential Stuffing)
  {
    signature: 'SSH Auth Brute-Force / Password Guessing',
    mitreTechnique: 'T1110.001 (Password Guessing)',
    severity: 'HIGH',
    sourceNode: 'ingress-gateway',
    targetNode: 'dmz-bastion',
    protocol: 'TCP',
    srcPort: 54122,
    dstPort: 22,
    netflow: {
      duration: 0.8,
      src_bytes: 420,
      dst_bytes: 850,
      failed_logins: 14,
      packet_rate: 65,
      entropy: 3.8
    },
    headers: {
      ttl: 52,
      ipVersion: 4,
      packetSize: 420,
      tcpFlags: { syn: false, ack: true, fin: false, rst: false, psh: true, urg: false },
      windowSize: 14600,
      layer7: {
        userAgent: 'libssh2_1.9.0_automated_spray'
      }
    },
    payloadGenerator: () =>
      stringToHexAscii(
        'SSH-2.0-OpenSSH_8.9p1\r\nFailed publickey for root from 198.51.100.42 port 54122 ssh2 [AUTH_FAIL_COUNT=14]',
        [40, 68]
      )
  },

  // 3. CobaltStrike / C2 Beaconing (Encrypted Exfiltration)
  {
    signature: 'CobaltStrike C2 High-Entropy Beacon',
    mitreTechnique: 'T1071.001 (Web Protocols / C2)',
    severity: 'CRITICAL',
    sourceNode: 'dmz-bastion',
    targetNode: 'auth-vault',
    protocol: 'TLS 1.3',
    srcPort: 49812,
    dstPort: 8443,
    netflow: {
      duration: 42.0,
      src_bytes: 86400,
      dst_bytes: 3200,
      failed_logins: 0,
      packet_rate: 180,
      entropy: 7.85
    },
    headers: {
      ttl: 64,
      ipVersion: 4,
      packetSize: 86400,
      tcpFlags: { syn: false, ack: true, fin: false, rst: false, psh: true, urg: false },
      windowSize: 32768,
      layer7: {
        tlsSni: 'kms-sync-service.auth.internal',
        tlsCipher: 'TLS_CHACHA20_POLY1305_SHA256'
      }
    },
    payloadGenerator: () =>
      stringToHexAscii(
        '\x16\x03\x03\x01\x00\x01\x00\x00\xfc\x03\x03c2_blob_beacon_jitter_sleep_42s_encrypted_memory_dump_exfil_channel_09',
        [16, 52]
      )
  },

  // 4. Volumetric SYN Flood (L4 DDoS Storm)
  {
    signature: 'SYN Flood TCP State Exhaustion Storm',
    mitreTechnique: 'T1498.001 (Direct Network Flood)',
    severity: 'CRITICAL',
    sourceNode: 'ingress-gateway',
    targetNode: 'ingress-gateway',
    protocol: 'TCP',
    srcPort: 39420,
    dstPort: 443,
    netflow: {
      duration: 2.5,
      src_bytes: 92000,
      dst_bytes: 0,
      failed_logins: 0,
      packet_rate: 8500,
      entropy: 2.1
    },
    headers: {
      ttl: 240,
      ipVersion: 4,
      packetSize: 60,
      tcpFlags: { syn: true, ack: false, fin: false, rst: false, psh: false, urg: false },
      windowSize: 1024
    },
    payloadGenerator: () =>
      stringToHexAscii(
        'TCP [SYN] Seq=3829104859 Win=1024 MSS=1460 SACK_PERM TSval=4928192 TSecr=0 [FLOOD_BURST_RATE=8500pps]',
        [0, 24]
      )
  },

  // 5. DNS Covert Data Exfiltration Tunnel
  {
    signature: 'DNS TXT Tunnel Covert Exfiltration',
    mitreTechnique: 'T1048.003 (Exfiltration Over Unencrypted DNS)',
    severity: 'HIGH',
    sourceNode: 'microservices',
    targetNode: 'ingress-gateway',
    protocol: 'DNS',
    srcPort: 53210,
    dstPort: 53,
    netflow: {
      duration: 15.4,
      src_bytes: 38400,
      dst_bytes: 4200,
      failed_logins: 0,
      packet_rate: 340,
      entropy: 6.9
    },
    headers: {
      ttl: 64,
      ipVersion: 4,
      packetSize: 512,
      layer7: {
        dnsQuery: 'q3a8f9z1.b89e71a8.corp-telemetry.tunnel.darknet.io IN TXT'
      }
    },
    payloadGenerator: () =>
      stringToHexAscii(
        '000101000001000000000000\x08q3a8f9z1\x08b89e71a8\x0eencrypted_chunk\x07darknet\x02io\x0000100001',
        [24, 54]
      )
  },

  // 6. SQL Injection & RBAC Privilege Escalation
  {
    signature: 'PostgreSQL Stacked Query / SQL Injection',
    mitreTechnique: 'T1190 (Exploit Public-Facing Application)',
    severity: 'MEDIUM',
    sourceNode: 'microservices',
    targetNode: 'db-cluster',
    protocol: 'TCP',
    srcPort: 48920,
    dstPort: 5432,
    netflow: {
      duration: 0.45,
      src_bytes: 3100,
      dst_bytes: 45000,
      failed_logins: 1,
      packet_rate: 90,
      entropy: 4.8
    },
    headers: {
      ttl: 64,
      ipVersion: 4,
      packetSize: 3100,
      tcpFlags: { syn: false, ack: true, fin: false, rst: false, psh: true, urg: false },
      windowSize: 65535,
      layer7: {
        httpMethod: 'POST',
        httpPath: '/api/v1/query'
      }
    },
    payloadGenerator: () =>
      stringToHexAscii(
        "Q\x00\x00\x00'SELECT * FROM user_roles WHERE tenant_id='corp' UNION SELECT 1,username,password_hash FROM admin_users;--",
        [45, 96]
      )
  }
];

let eventCounter = 1000;

/**
 * Generates a single synthetic telemetry event matching industry NetFlow/Zeek/Suricata logs.
 */
export function generateSyntheticEvent(overrideTemplateIndex?: number): SocTelemetryEvent {
  eventCounter++;
  const index =
    typeof overrideTemplateIndex === 'number'
      ? overrideTemplateIndex % THREAT_TEMPLATES.length
      : Math.floor(Math.random() * THREAT_TEMPLATES.length);

  const tpl = THREAT_TEMPLATES[index];
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');

  // Randomize ephemeral port slightly
  const randomizedSrcPort = tpl.srcPort > 1024 ? tpl.srcPort + (eventCounter % 100) : tpl.srcPort;

  const nodeIpMap: Record<NodeId, string> = {
    'ingress-gateway': '198.51.100.1',
    'dmz-bastion': '10.0.1.5',
    'microservices': '10.0.2.14',
    'auth-vault': '10.0.3.8',
    'db-cluster': '10.0.4.20'
  };

  const headers: DecodedHeaders = {
    srcIp: nodeIpMap[tpl.sourceNode],
    srcPort: randomizedSrcPort,
    dstIp: nodeIpMap[tpl.targetNode],
    dstPort: tpl.dstPort,
    protocol: tpl.protocol,
    ttl: tpl.headers.ttl || 64,
    ipVersion: tpl.headers.ipVersion || 4,
    packetSize: tpl.headers.packetSize || 1024,
    tcpFlags: tpl.headers.tcpFlags,
    windowSize: tpl.headers.windowSize || 64240,
    seqNumber: 10000000 + eventCounter * 1460,
    ackNumber: 50000000 + eventCounter * 850,
    layer7: tpl.headers.layer7
  };

  // Heuristic baseline anomaly score according to profile severity
  const defaultAnomalyScores: Record<SocTelemetryEvent['severity'], number> = {
    LOW: 0.04,
    MEDIUM: 0.35,
    HIGH: 0.88,
    CRITICAL: 0.96
  };

  const anomalyScore = defaultAnomalyScores[tpl.severity];
  const isAnomaly = anomalyScore >= 0.70;

  return {
    id: `EVT-${eventCounter.toString(16).toUpperCase()}`,
    timestamp,
    timestampMs: Date.now(),
    sourceNode: tpl.sourceNode,
    targetNode: tpl.targetNode,
    signature: tpl.signature,
    mitreTechnique: tpl.mitreTechnique,
    severity: tpl.severity,
    headers,
    payload: tpl.payloadGenerator(),
    netflow: { ...tpl.netflow },
    mlScore: {
      anomalyScore,
      confidence: Math.round(Math.max(anomalyScore, 1 - anomalyScore) * 100),
      status: isAnomaly ? 'ANOMALY' : anomalyScore >= 0.20 ? 'SUSPICIOUS' : 'BENIGN'
    }
  };
}

/**
 * Pushes a new event to a FIFO ring buffer, strictly capping length to maxCapacity (default 60).
 * Prevents memory accumulation and ensures constant-time execution.
 */
export function pushEventToRingBuffer(
  buffer: SocTelemetryEvent[],
  newEvent: SocTelemetryEvent,
  maxCapacity = 60
): SocTelemetryEvent[] {
  const updated = [newEvent, ...buffer];
  if (updated.length > maxCapacity) {
    return updated.slice(0, maxCapacity);
  }
  return updated;
}
