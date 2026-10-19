# Phase 4 Research: Simulated Cyber Warfare / SOC Telemetry Visualizer

**Phase:** 04 — Simulated Cyber Warfare / SOC Telemetry Visualizer  
**Status:** Complete  
**Date:** 2026-10-19  
**Requirements Covered:** **SOC-01**, **SOC-02**, **SOC-03**  
**Integration Points:** `/lab` route, Phase 3 client ONNX inference engine (`src/lib/ml/inference-engine.ts`), Gate 4 Playwright suite (`tests/gate4-soc.spec.ts`)

---

## 1. Executive Summary & Architectural Overview

The core objective of Phase 4 is to build a mission-critical, interactive **Security Operations Center (SOC) Cyber Warfare Telemetry Visualizer**. This system elevates Ambul Jaiswal's portfolio from a static collection of project write-ups into a live, interactive cyber-defense command center where technical recruiters and security engineers can observe, inspect, and triage real-time network attack streams directly in the browser.

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                              SOC TELEMETRY COMMAND DECK (/lab)                                        |
|                                                                                                                       |
|  +-------------------------------------------------------+  +------------------------------------------------------+  |
|  |  TOPOLOGY FLOW MAP (Interactive Vector Graph)         |  |  INCIDENT METRICS HUD TICKER                         |  |
|  |                                                       |  |                                                      |  |
|  |   [Ingress Gateway]                                   |  |  TOTAL EVENTS: 1,482   ACTIVE ANOMALIES: 3            |  |
|  |           |                                           |  |  ISOLATED NODES: 1     FALSE POSITIVE RATE: 4.2%      |  |
|  |           v                                           |  |  STREAM: [PAUSE] [PLAY] SPEED: [0.5x] [1.0x] [2.0x]   |  |
|  |     [DMZ Bastion]                                     |  +------------------------------------------------------+  |
|  |      /         \                                      |                                                            |
|  |     v           v                                     |  +------------------------------------------------------+  |
|  |  [Auth Vault]  [Microservices]                        |  |  ALERT TRIAGE FEED (Human-in-the-Loop)               |  |
|  |     \           /                                     |  |                                                      |  |
|  |      v         v                                      |  |  [CRIT] C2 Beaconing -> Auth Vault (0.94) [ISOLATE]  |  |
|  |     [Database Cluster]                                |  |  [HIGH] SYN Flood    -> Ingress    (0.88) [TRIAGE]   |  |
|  |                                                       |  |  [LOW]  TLS Handshake-> Microserv  (0.04) [FP]       |  |
|  |  Status: HEALTHY | DEGRADED | ATTACK | ISOLATED       |  +------------------------------------------------------+  |
|  +-------------------------------------------------------+                                                            |
|                                                                                                                       |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|  |  PACKET INSPECTION SLIDE-OUT DRAWER (HUD Modal Dialog / Escape to close / ARIA role="dialog")                   |  |
|  |                                                                                                                 |  |
|  |  - Header: Flow Signature, Protocol (TCP/UDP/TLS/HTTP/DNS), Anomaly Score, Confidence Bar                      |  |
|  |  - Layer 3/4 Header Decoders: IPv4/IPv6, Flags (SYN/ACK/FIN/RST), TTL, Window, Ports                           |  |
|  |  - Layer 7 Metadata: SNI, Request Path, User-Agent, DNS Question Record                                        |  |
|  |  - Hex + ASCII Dual-Pane Payload Viewer with Highlighted Anomalous Byte Offsets                                |  |
|  |  - Analyst Action Dock: [INVESTIGATE] | [ISOLATE HOST NODE] | [MARK AS FALSE POSITIVE / RE-CALIBRATE]          |  |
|  +-----------------------------------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------------------------------+
```

### Architectural Highlights
1. **Zero-Server Synthetic Event Generation:** Continuous generation of realistic NetFlow v9, Zeek/Bro, and Suricata telemetry entirely on the client, avoiding external API dependencies or polling.
2. **Deterministic Ring-Buffer / FIFO Windowing:** Fixed memory footprint (maximum 50–100 events in memory) with automatic eviction, guaranteeing zero memory leak over hours of continuous streaming.
3. **Interactive Multi-Tier SVG Attack Topology:** 5-node cyber architecture (Ingress Edge -> DMZ Bastion -> Microservices Mesh -> Auth Vault -> Database Cluster) with dynamic SVG animated pulse vectors and stateful node status indicators (`HEALTHY`, `DEGRADED`, `UNDER_ATTACK`, `ISOLATED`).
4. **Deep Packet Inspection (DPI) HUD Drawer:** Accessible slide-out inspection panel featuring decoded Layer 3/4/7 headers and a synchronized Hex/ASCII payload viewer.
5. **Interactive Anomaly Scoring & Analyst Feedback Loop:** Live integration with Phase 3's ONNX Runtime WASM model (`runInference`), allowing users to compare classifier predictions against manual analyst overrides.
6. **Strict Accessibility & Performance SLA:** Throttled generator loop, `prefers-reduced-motion` compliance, full keyboard accessibility (Escape to dismiss, focus trap, ARIA dialog), and 60 FPS rendering.

---

## 2. Telemetry Stream Architecture & Event Generator

### 2.1 Synthetic Log Schema: NetFlow / Zeek / Suricata Hybrid

The telemetry visualizer synthesizes logs combining three industry-standard formats:
- **NetFlow / IPFIX:** Flow duration, byte counts, packet rates, source/destination IP and port.
- **Zeek (Bro):** Connection UID, protocol state, service classification, TLS SNI, HTTP URI.
- **Suricata / Snort:** Threat signature classification, CVE / MITRE ATT&CK technique reference, rule ID, and raw packet frame slice.

```typescript
// Proposed src/lib/soc/types.ts

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'TLS 1.3' | 'HTTP/2' | 'DNS';

export type NodeId = 
  | 'ingress-gateway'
  | 'dmz-bastion'
  | 'microservices'
  | 'auth-vault'
  | 'db-cluster';

export type NodeStatus = 'HEALTHY' | 'DEGRADED' | 'UNDER_ATTACK' | 'ISOLATED';

export interface DecodedHeaders {
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: ProtocolType;
  ttl: number;
  ipVersion: 4 | 6;
  tcpFlags?: {
    syn: boolean;
    ack: boolean;
    fin: boolean;
    rst: boolean;
    psh: boolean;
    urg: boolean;
  };
  windowSize?: number;
  layer7?: {
    dnsQuery?: string;
    tlsSni?: string;
    httpMethod?: string;
    httpPath?: string;
    userAgent?: string;
  };
}

export interface RawPayloadFrame {
  rawHex: string;           // Space-separated hex pairs, e.g. "45 00 00 3c 1a 2b..."
  rawAscii: string;         // Printable ASCII with '.' placeholder for non-printable chars
  anomalousOffsets?: [number, number]; // [startIndex, endIndex] of suspicious bytes
}

export interface SocTelemetryEvent {
  id: string;               // UUID / stream sequence identifier
  timestamp: string;        // ISO 8601 UTC timestamp
  timestampMs: number;      // Epoch for sorting & eviction
  sourceNode: NodeId;
  targetNode: NodeId;
  signature: string;        // E.g. "ET MALWARE Win32/CobaltStrike Beacon" or "Standard HTTPS Session"
  mitreTechnique?: string;  // E.g. "T1071.001 - Application Layer Protocol"
  severity: SeverityLevel;
  headers: DecodedHeaders;
  payload: RawPayloadFrame;
  netflow: {
    duration: number;
    src_bytes: number;
    dst_bytes: number;
    failed_logins: number;
    packet_rate: number;
    entropy: number;
  };
  mlScore?: {
    anomalyScore: number;
    confidence: number;
    status: 'BENIGN' | 'SUSPICIOUS' | 'ANOMALY';
  };
  triaged?: {
    analystAction: 'INVESTIGATING' | 'ISOLATED' | 'FALSE_POSITIVE' | 'ACKNOWLEDGED';
    timestamp: string;
    note?: string;
  };
}
```

### 2.2 Attack Vectors & Realistic Telemetry Generation

The generator alternates between benign baseline flows and targeted attack vectors derived from realistic cybersecurity incident logs:

| Threat Signature | Source -> Target | Protocol | NetFlow Indicators | Decoded Payload Clues |
|---|---|---|---|---|
| **Benign Web Traffic** | Ingress -> Microservices | TLS 1.3 / HTTP/2 | Low entropy (4.2), 45 pps, 0 failed logins | Valid SNI `api.ambul.dev`, GET `/v1/status` |
| **SSH Credential Stuffing** | Ingress -> DMZ Bastion | TCP (22) | 14 failed logins, 65 pps, small packets | Repeated `SSH-2.0-OpenSSH_8.9p1`, failed auth banner |
| **C2 Encrypted Tunnel** | DMZ Bastion -> Auth Vault | TCP (8443) | High entropy (7.85), large src_bytes (86KB), long duration | Encrypted hex chunk, suspicious beacon interval |
| **Volumetric SYN Flood** | Ingress -> Ingress | TCP (80/443) | 8,500 pps, dst_bytes = 0, low entropy (2.1) | TCP Flags: SYN=1, ACK=0, repeated identical seq numbers |
| **DNS Data Exfiltration** | Microservices -> Ingress | UDP (53) | High entropy (7.2), high frequency | TXT record `dGhpc2lzYW5leGZpbHRyYXRpb24=.tunnel.evil.io` |
| **SQLi / RBAC Escalation** | Microservices -> DB Cluster | TCP (5432) | Med entropy, dst_bytes spike | Payload contains `' UNION SELECT * FROM credentials --` |

### 2.3 Throttling, Ring-Buffer & Main-Thread Protection

Uncontrolled streaming in a Single Page App (SPA) causes memory leaks, garbage collection spikes, and dropped animation frames. Phase 4 enforces strict memory and CPU throttling rules:

1. **Fixed Ring Buffer (FIFO):**
   - Retain a maximum of 60 events in client memory.
   - When a new event arrives, `events.slice(0, 59)` prepends the new event. Old events are immediately unreferenced for GC.
2. **Adjustable Tick Rate (Generator Clock):**
   - Default rate: 1 event every 1,200ms (~0.83 Hz).
   - Speed controls:
     - `PAUSE`: Tick timer stopped.
     - `0.5x`: 1 event every 2,400ms.
     - `1.0x`: 1 event every 1,200ms.
     - `2.0x`: 1 event every 600ms.
3. **Execution via `requestAnimationFrame` / `setTimeout` Loop:**
   - Generation logic is non-blocking (<0.2ms compute time per tick).
   - Telemetry ticks are coordinated via a custom React hook `useSocTelemetryStream()`.

---

## 3. Interactive Cyber Attack Topology / Flow Map

### 3.1 Technology Comparison: SVG vs. Canvas vs. HTML/CSS DOM

| Criterion | Inline SVG (Recommended) | HTML5 2D Canvas | React DOM / CSS Grid |
|---|---|---|---|
| **Node Count Scale** | Ideal for 5–20 high-value architecture nodes. | Required for 10,000+ particles. | Rigid; hard to draw arbitrary curved vector lines. |
| **DOM Accessibility** | Native: `<g role="button" tabIndex={0} aria-label="...">` | Poor: requires hidden DOM fallback canvas tree. | Good: native buttons. |
| **Vector Sharpness** | Resolution-independent on retina/4K displays. | Requires DPI scaling math; can blur on window resize. | Crisp text, but connector borders are clunky. |
| **Animated Arcs** | Smooth SVG `stroke-dasharray` and `<circle>` motion paths. | Requires manual tick rasterization loop. | Hard to animate curved arcs across elements. |
| **Styling & Theming** | Direct Tailwind classes (`fill-deck`, `stroke-accent-cyan`). | Manual context styling with canvas API colors. | Standard Tailwind classes. |

**Verdict:** **Inline SVG** is the optimal choice. The topology represents a 5-tier enterprise cyber infrastructure (Ingress Gateway, DMZ Bastion, Microservices Mesh, Auth Vault, Database Cluster). SVG enables crisp cyberpunk aesthetics, accessible keyboard focusable nodes, and responsive vector arcs with SVG motion paths.

### 3.2 5-Tier Cyber Topology Nodes

```
                 [ 01: INGRESS GATEWAY ]
                  (Edge BGP / Cloudflare)
                            |
                            | (Public Ingress)
                            v
                   [ 02: DMZ BASTION ]
                    (Jump Host / Zero-Trust)
                         /       \
         (Internal VPC) /         \ (Internal VPC)
                       v           v
           [ 03: MICROSERVICES ]  [ 04: AUTH VAULT ]
             (App Mesh / APIs)      (Secrets / KMS / JWT)
                       \           /
           (Private DB) \         / (Audit Log)
                         v       v
                 [ 05: DATABASE CLUSTER ]
                  (PostgreSQL / FalkorDB)
```

### 3.3 Dynamic Attack Pulse Vectors & Node Statuses

1. **Active Attack Pulse Visualization:**
   - When an event occurs between `sourceNode` and `targetNode`, an SVG arc lights up.
   - For `ANOMALY` or `CRITICAL` events, an animated pulse particle travels along the vector path.
   - Under `prefers-reduced-motion`, continuous travel pulses are disabled; instead, a solid colored stroke indicator lights up momentarily without motion.
2. **Interactive Node Status State Machine:**
   - **HEALTHY (Normal):** Green/Cyan subtle glow (`#00FFFF`), standard heartbeat icon.
   - **DEGRADED:** Amber warning (`#F2C500`), moderate anomaly activity.
   - **UNDER ATTACK:** Glowing crimson/red (`#FF7A6B`), active critical threat vector detected.
   - **ISOLATED:** Dark graphite with slashed border (`#5B6A6E`), quarantine state triggered by visitor analyst intervention. Isolated nodes reject inbound packet arcs.

---

## 4. Packet Inspection Drawer Architecture

### 4.1 HUD Drawer UX & Accessibility Specifications

The Packet Inspection Drawer is a slide-out panel that provides deep packet inspection (DPI) for any selected telemetry record.

```
+------------------------------------------------------------------------------------------+
|  PACKET INSPECTION // EVENT #b9e7-4260                   [ESC] [CLOSE]                   |
+------------------------------------------------------------------------------------------+
|  SIGNATURE: ET MALWARE Win32/CobaltStrike Beacon Observed                                |
|  SEVERITY: [CRITICAL]   ML SCORE: 0.94 (CONFIDENCE: 98%)   CLASSIFIER: ANOMALY           |
|                                                                                          |
|  [LAYER 3 / 4 HEADERS]                                                                   |
|  IPv4: 198.51.100.42:54820 -> 10.0.4.12:8443 | TTL: 64 | ID: 0x4fa1                      |
|  TCP: Flags [SYN, PSH, ACK] | Window: 64240 | Seq: 31849201 | Ack: 1048291               |
|                                                                                          |
|  [LAYER 7 METADATA]                                                                      |
|  TLS SNI: auth.internal.corp | Cipher: TLS_AES_256_GCM_SHA384 | Session ID: 0x9a8b...     |
|                                                                                          |
|  [DECODED PAYLOAD VIEW (HEX + ASCII DUAL PANE)]                                          |
|  OFFSET    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F   ASCII                      |
|  00000000  45 00 00 54 1a 2b 40 00  40 06 b2 c1 c6 33 64 2a   E..T.+@.@....3d*           |
|  00000010  0a 00 04 0c d6 24 20 fb  01 e6 04 91 00 10 00 00   .....$ .........           |
|  00000020  16 03 03 00 a5 01 00 00  a1 03 03 [suspicious]     ................           |
|                                                                                          |
|  [HUMAN-IN-THE-LOOP ANALYST ACTION DOCK]                                                 |
|  [1. CONFIRM & ISOLATE NODE]      [2. FLAG FALSE POSITIVE]      [3. RE-RUN ML INFERENCE] |
+------------------------------------------------------------------------------------------+
```

### 4.2 WCAG 2.2 AA Modal / Drawer Standards
- **Role & Labels:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`, `aria-describedby="drawer-desc"`.
- **Keyboard Handling:**
  - `Escape` key immediately closes the drawer and restores focus to the invoking trigger row.
  - Tab focus trap keeps keyboard navigation inside the drawer while open.
- **Scroll Lock:** Background document body scroll is locked (`overflow: hidden`) when drawer is open.
- **Auto-Focus:** First actionable element (the Close button or primary action) is focused on mount.

### 4.3 Hex + ASCII Dual-Pane Formatter

A custom TypeScript utility formats raw byte arrays into standard Wireshark/tcpdump hex view:
- 16 bytes per line.
- Offset column: 8-digit hex `00000000`, `00000010`, etc.
- Hex column: Space-delimited pairs, e.g. `45 00 00 54...` with anomalous slice wrapped in `<mark class="bg-fault/20 text-fault">`.
- ASCII column: Printable characters (`char >= 32 && char <= 126`), otherwise rendered as `·` (middle dot).

---

## 5. Alert Triage Feed & Human-in-the-Loop Actions

### 5.1 Security Analyst Workflow

A major flaw of generic "tech demos" is passive visual flair without real interaction. Phase 4 provides an authentic Security Analyst triage loop:

1. **Investigate:** Clicking any alert pauses auto-eviction of that record and opens the Packet Inspection Drawer.
2. **Isolate Host Node:**
   - Action: Visitor clicks `[ISOLATE NODE]`.
   - Effect: Target node is marked `ISOLATED` in the Topology Map.
   - Consequence: Subsequent telemetry flows targeting this node are dropped/blocked at the edge (`STATUS: BLOCKED BY EDGE ISOLATION RULE`). A live banner displays `NODE QUARANTINED: dmz-bastion`.
   - Reversible: An `[UNISOLATE]` button allows the visitor to restore normal traffic flow.
3. **Flag False Positive / Analyst Override:**
   - Action: Visitor flags an anomaly as a false positive.
   - Effect: The incident count decreases, False Positive Rate metric dynamically recalculates, and the alert is marked with a verified green `[FALSE POSITIVE]` analyst badge.
   - ML Tie-In: Injects updated calibration data into Phase 3 inference feedback buffer.
4. **Re-Run In-Browser ML Classifier:**
   - Triggers `runInference(event.netflow)` from `src/lib/ml/inference-engine.ts`.
   - Dynamically demonstrates sub-millisecond local execution against the selected packet's 6 NetFlow parameters.

### 5.2 Real-Time Stats HUD Ticker

Four key metrics update dynamically as the stream runs and the visitor performs actions:
- **Packets Inspected:** Total count of simulated flows evaluated.
- **Active Anomalies:** Current count of un-triaged high/critical severity threats.
- **Isolated Hosts:** Count of currently quarantined nodes (0 to 5).
- **False Positive Ratio:** Percentage of flagged flows marked as benign by human analyst.

---

## 6. Route Placement & Integration: `/lab`

### 6.1 Rationale for Locating SOC Visualizer on `/lab`

In DESIGN.md and ROADMAP.md:
- `/lab` is the home of **"Experimental Lab & Prototypes"** and local-first architecture experiments.
- Phase 1 and 2 established `phenom` as an experimental prototype on `/lab`.
- Placing the **Simulated Cyber Warfare / SOC Telemetry Visualizer** on `/lab` transforms this page into a premier showcase of Ambul's security operations and data science tooling.
- It also allows cross-linking directly from `/work/threat-detection` and `/work/inferyx` ("Test in Live SOC Visualizer").

### 6.2 Component Structure for `/lab`
- Keep existing `phenom` documentation intact at the bottom of `/lab`.
- Embed `<SocCommandDeck />` prominently at the top of `/lab` as the flagship live interactive system.
- Add clear technical framing:
  - *Data Provenance:* "100% Client-Side Synthetic Stream. Zero network requests. NetFlow v9 & Zeek format simulation with live ONNX Runtime WASM anomaly classification."

---

## 7. Accessibility, Motion & Performance Guardrails

### 7.1 Accessibility (WCAG 2.2 AA)
1. **ARIA Live Regions:**
   - Use `aria-live="polite"` on the status ticker for new critical alerts so screen readers announce high-severity intrusions without interrupting current speech.
2. **Keyboard Operability:**
   - Telemetry table rows are focusable via keyboard (`tabIndex={0}`) and operable with `Enter` or `Space` to inspect.
   - Drawer dismissible via `Escape` or Close button. Focus returns to the initiating row.
3. **Color Contrast:**
   - Text contrast must exceed 4.5:1 against the dark OLED background (`--paper` / `--ink`).
   - Badges use dark background with bright text (e.g. Critical: `#FF7A6B` on `#2A1615`).

### 7.2 Motion Safeguards (`prefers-reduced-motion`)
- Respect system preference via media query `(prefers-reduced-motion: reduce)`.
- Pulse traveling particles along SVG paths are disabled.
- Threat status transitions use instant color switching rather than CSS transitions.
- The stream pause button is clearly visible for manual freeze.

### 7.3 Performance Guardrails
- **Zero Memory Leaks:** Ring buffer strictly bounds memory usage to $\le 60$ events.
- **Frame Rate:** SVG-based rendering ensures steady 60 FPS without WebGL/Canvas overhead.
- **Zero Console Errors:** Clean React 19 lifecycle management with cleanup functions on unmount.

---

## 8. Validation Strategy (Nyquist Gate 4)

To satisfy Gate 4, we define an automated Playwright test suite `tests/gate4-soc.spec.ts`:

### Gate 4 Test Matrix (`tests/gate4-soc.spec.ts`)

| Test ID | Objective | Assertion / Verification Criteria |
|---|---|---|
| **SOC-VAL-01** | Component Mount & Layout | Verify `/lab` renders SOC Command Deck (`[data-testid="soc-command-deck"]`), Topology Map, Stream Feed, and Metric Tickers. |
| **SOC-VAL-02** | Real-time Stream Generation | Verify event stream populates at least 3 rows within 4 seconds. Test Pause/Play button freezes and resumes counter. |
| **SOC-VAL-03** | Interactive Packet Drawer | Click a telemetry row; assert drawer (`[data-testid="packet-drawer"]`) opens with Decoded Headers and Hex/ASCII viewer. Press `Escape`; assert drawer closes. |
| **SOC-VAL-04** | Node Isolation Workflow | From drawer or topology, click `[data-testid="btn-isolate-node"]`. Assert node status changes to `ISOLATED` and "Isolated Hosts" HUD counter increments to 1. |
| **SOC-VAL-05** | False Positive Triage | Click `[data-testid="btn-mark-false-positive"]`. Assert event badge updates to `[FALSE POSITIVE]` and False Positive Rate reflects change. |
| **SOC-VAL-06** | Local ML Model Evaluation | In drawer, assert ML anomaly score is displayed; click `[data-testid="btn-rescore-ml"]` and assert inference runs with $<50$ms latency. |
| **SOC-VAL-07** | A11y & Reduced Motion | Verify `aria-expanded`, `role="dialog"`, keyboard tab trapping in drawer, and zero console errors during 10s streaming. |

---

## 9. Implementation Plan Preview

The upcoming plan (`04-PLAN.md`) will divide Phase 4 into cohesive tasks:
1. **Task 1: Core Telemetry Engine & Types (`src/lib/soc/`)**
   - Implement `types.ts`, `generator.ts` (synthetic NetFlow/Zeek generator), and `useSocStream.ts` hook with ring-buffer FIFO and speed controls.
2. **Task 2: Vector Topology Map (`src/components/soc/AttackTopology.tsx`)**
   - Build interactive 5-node SVG topology with live pulse connectors, node status indicators, and click-to-inspect handlers.
3. **Task 3: Slide-Out Packet Inspection Drawer (`src/components/soc/PacketInspectionDrawer.tsx`)**
   - Implement accessible slide-out modal, protocol header decoder, Hex/ASCII dual-pane payload visualizer, and analyst action buttons.
4. **Task 4: Alert Triage Feed & HUD Controls (`src/components/soc/AlertTriageFeed.tsx` & `SocCommandDeck.tsx`)**
   - Build the telemetry table, filtering, speed controls, metric HUD ticker, and link to Phase 3 ONNX inference engine.
5. **Task 5: Route Integration & Gate 4 Validation**
   - Mount `<SocCommandDeck />` into `src/app/lab/page.tsx`.
   - Write comprehensive Playwright suite `tests/gate4-soc.spec.ts`.
   - Run validation, verify 0 console errors, 0 memory leaks, and update `STATUS.md`.

---
*Research complete. Ready for plan generation.*
