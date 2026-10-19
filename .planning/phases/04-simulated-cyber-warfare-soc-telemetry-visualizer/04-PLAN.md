---
phase: "04"
phase_slug: "simulated-cyber-warfare-soc-telemetry-visualizer"
status: "planned"
date: "2026-10-19"
author: "gsd-planner"
requirements:
  - SOC-01
  - SOC-02
  - SOC-03
---

# Phase 4: Simulated Cyber Warfare / SOC Telemetry Visualizer — Execution Plan

<phase_header>
Phase: 04 — Simulated Cyber Warfare / SOC Telemetry Visualizer
Goal: Engineer a mission-critical, interactive Security Operations Center (SOC) cyber warfare telemetry visualizer and alert triage deck embedded in `/lab`. The visualizer pairs a real-time synthetic NetFlow/Zeek stream engine (bounded by a deterministic 60-event FIFO ring-buffer) with an interactive 5-node SVG attack topology graph, an accessible Deep Packet Inspection (DPI) slide-out drawer featuring dual-pane Hex/ASCII payloads, and a human-in-the-loop analyst triage feed integrated directly with Phase 3's in-browser ONNX Runtime WASM anomaly classifier.
Outputs:
  - Strongly-typed telemetry data models, event interfaces, and protocol definitions (`src/lib/soc/types.ts`).
  - Client-side deterministic synthetic telemetry event stream generator (`src/lib/soc/generator.ts`) supporting 6 realistic cyber threat signatures, 5-tier topology routing, stream controls (pause, play, 0.5x, 1.0x, 2.0x), and unit verification.
  - Interactive React hook `useSocTelemetryStream` managing event buffering, tick timing, node isolation filtering, and analyst action state.
  - Interactive SVG Multi-Tier Cyber Attack Topology Graph (`src/components/soc/AttackTopologyMap.tsx`) visualizing 5 nodes (Ingress Gateway, DMZ Bastion, Microservices Mesh, Auth Vault, Database Cluster), dynamic attack pulse vectors, status transitions (HEALTHY, DEGRADED, UNDER_ATTACK, ISOLATED), and keyboard-accessible node selection.
  - Decoded Deep Packet Inspection Slide-Out HUD Drawer (`src/components/soc/PacketInspectionDrawer.tsx`) meeting WCAG 2.2 AA modal standards (`role="dialog"`, focus trap, Escape to close), decoded Layer 3/4 headers, Layer 7 metadata, dual-pane Hex/ASCII viewer with highlighted anomalous offsets, and analyst remediation actions.
  - Live Alert Triage Feed & Mission Control Command Deck (`src/components/soc/AlertTriageFeed.tsx`, `src/components/soc/SocCommandDeck.tsx`) with stream controls, live metrics ticker, triage actions ([INVESTIGATE], [ISOLATE HOST], [MARK FALSE POSITIVE]), and live hookup to Phase 3 ONNX Runtime inference engine (`runInference`).
  - Experimental Lab route integration (`src/app/lab/page.tsx`) showcasing the command deck with data provenance callouts while preserving the `phenom` prototype.
  - Automated Gate 4 Playwright test suite (`tests/gate4-soc.spec.ts`) asserting stream generation, control operations, drawer accessibility, node isolation, false positive override, sub-50ms ML scoring, 60 FPS performance, and reduced-motion fallback.
</phase_header>

---

## Architectural & Execution Flow Overview

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                              SOC TELEMETRY COMMAND DECK (/lab)                                        |
|                                                                                                                       |
|  +-------------------------------------------------------+  +------------------------------------------------------+  |
|  |  TOPOLOGY FLOW MAP (Interactive Vector SVG Graph)     |  |  INCIDENT METRICS HUD TICKER                         |  |
|  |                                                       |  |                                                      |  |
|  |   [01: Ingress Gateway]                               |  |  PACKETS EVALUATED: 1,482   ACTIVE ANOMALIES: 3      |  |
|  |           |                                           |  |  ISOLATED HOSTS: 1        FALSE POSITIVE RATE: 4.2%  |  |
|  |           v                                           |  |  STREAM: [PAUSE] [PLAY] SPEED: [0.5x] [1.0x] [2.0x]   |  |
|  |     [02: DMZ Bastion]                                 |  +------------------------------------------------------+  |
|  |      /         \                                      |                                                            |
|  |     v           v                                     |  +------------------------------------------------------+  |
|  |  [03: Micro]   [04: Auth Vault]                       |  |  ALERT TRIAGE FEED (Human-in-the-Loop)               |  |
|  |     \           /                                     |  |                                                      |  |
|  |      v         v                                      |  |  [CRIT] C2 Beaconing -> Auth Vault (0.94) [ISOLATE]  |  |
|  |     [05: DB Cluster]                                  |  |  [HIGH] SYN Flood    -> Ingress    (0.88) [TRIAGE]   |  |
|  |                                                       |  |  [LOW]  TLS Handshake-> Microserv  (0.04) [FP]       |  |
|  |  Node States: HEALTHY | DEGRADED | ATTACK | ISOLATED  |  +------------------------------------------------------+  |
|  +-------------------------------------------------------+                                                            |
|                                                                                                                       |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|  |  PACKET INSPECTION SLIDE-OUT DRAWER (HUD Modal Dialog / Escape to close / ARIA role="dialog")                   |  |
|  |                                                                                                                 |  |
|  |  - Signature & Severity: [CRITICAL] | ML Anomaly Score: 0.94 | Confidence: 98% (ONNX WASM)                      |  |
|  |  - Layer 3/4 Decoded Headers: IPv4 (198.51.100.42:54820 -> 10.0.4.12:8443), TCP Flags [SYN, PSH, ACK], TTL 64   |  |
|  |  - Layer 7 Metadata: TLS SNI: auth.internal.corp | Cipher: TLS_AES_256_GCM_SHA384                               |  |
|  |  - Hex + ASCII Dual-Pane Payload Viewer (16 bytes/line) with Highlighted Anomaly Byte Offsets                  |  |
|  |  - Analyst Action Dock: [INVESTIGATE] | [ISOLATE HOST NODE] | [MARK FALSE POSITIVE] | [RE-RUN ML CLASSIFIER]   |  |
|  +-----------------------------------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------------------------------+
```

### Module Organization
```
portfolio/
├── src/
│   ├── lib/
│   │   ├── ml/
│   │   │   └── inference-engine.ts           // Phase 3 ONNX Runtime WASM client classifier
│   │   └── soc/
│   │       ├── types.ts                      // Event schemas, protocol types, node & stream models
│   │       ├── generator.ts                  // Synthetic NetFlow/Zeek/Suricata generator & ring buffer
│   │       └── useSocTelemetryStream.ts      // React hook orchestrating clock, ring buffer, and triage
│   ├── components/
│   │   └── soc/
│   │       ├── AttackTopologyMap.tsx         // Interactive 5-tier SVG attack graph with live pulse arcs
│   │       ├── PacketInspectionDrawer.tsx    // Accessible slide-out HUD DPI modal with Hex/ASCII viewer
│   │       ├── AlertTriageFeed.tsx           // Real-time telemetry feed table with analyst triage actions
│   │       └── SocCommandDeck.tsx            // Top-level command deck orchestrating map, feed, drawer, HUD
│   └── app/
│       └── lab/
│           └── page.tsx                      // Flagship mount for SocCommandDeck with technical data notes
└── tests/
    └── gate4-soc.spec.ts                     // Comprehensive Playwright end-to-end Gate 4 test suite
```

---

## Tasks

### <task 1: Tracer - Telemetry Data Structures & Synthetic Stream Engine>
- **Type**: tracer
- **Files to create/modify**:
  - `src/lib/soc/types.ts` (type definitions for events, decoded headers, raw payload frames, nodes, stream controls, and triage states)
  - `src/lib/soc/generator.ts` (deterministic synthetic event generator, attack signature catalog, hex/ascii frame synthesizer, and ring-buffer logic)
  - `src/lib/soc/useSocTelemetryStream.ts` (React state management hook handling tick intervals, speed changes, event FIFO queue, node status transitions, and analyst actions)
- **Action Steps**:
  1. Author `src/lib/soc/types.ts`:
     - Define `SeverityLevel`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`.
     - Define `ProtocolType`: `'TCP' | 'UDP' | 'ICMP' | 'TLS 1.3' | 'HTTP/2' | 'DNS'`.
     - Define `NodeId`: `'ingress-gateway' | 'dmz-bastion' | 'microservices' | 'auth-vault' | 'db-cluster'`.
     - Define `NodeStatus`: `'HEALTHY' | 'DEGRADED' | 'UNDER_ATTACK' | 'ISOLATED'`.
     - Define `DecodedHeaders`: `srcIp`, `srcPort`, `dstIp`, `dstPort`, `protocol`, `ttl`, `ipVersion`, `tcpFlags` (`syn`, `ack`, `fin`, `rst`, `psh`, `urg`), `windowSize`, and `layer7` metadata (`dnsQuery`, `tlsSni`, `httpMethod`, `httpPath`, `userAgent`).
     - Define `RawPayloadFrame`: `rawHex` (formatted hex string), `rawAscii` (ASCII representation with `·` substitute for non-printables), and `anomalousOffsets?: [number, number]`.
     - Define `SocTelemetryEvent`: `id`, `timestamp`, `timestampMs`, `sourceNode`, `targetNode`, `signature`, `mitreTechnique`, `severity`, `headers`, `payload`, `netflow` (duration, src_bytes, dst_bytes, failed_logins, packet_rate, entropy), `mlScore?` (anomalyScore, confidence, status), and `triaged?` (analystAction, timestamp, note).
     - Define stream control types: `StreamSpeed` (0.5 | 1 | 2), `StreamStatus` ('PLAYING' | 'PAUSED'), and `SocMetrics` (totalPackets, activeAnomalies, isolatedHosts, falsePositiveCount, falsePositiveRate).
  2. Author `src/lib/soc/generator.ts`:
     - Implement synthetic generator with 6 realistic cyber threat profiles:
       1. *Benign HTTPS Flow* (Ingress -> Microservices, TLS 1.3, normal entropy ~4.2, 0 failed logins, 45 pps).
       2. *SSH Credential Brute-Force* (Ingress -> DMZ Bastion, TCP 22, 14 failed logins, 65 pps, MITRE T1110).
       3. *CobaltStrike C2 Beacon* (DMZ Bastion -> Auth Vault, TCP 8443, high entropy ~7.85, large payload, MITRE T1071).
       4. *Volumetric SYN Flood* (Ingress -> Ingress, TCP 80/443, 8500 pps, SYN=1 ACK=0, MITRE T1498).
       5. *DNS Data Exfiltration* (Microservices -> Ingress, UDP 53, high entropy TXT queries, MITRE T1048).
       6. *SQL Injection / RBAC Bypass* (Microservices -> DB Cluster, TCP 5432, UNION SELECT payload, MITRE T1190).
     - Provide deterministic hex/ascii generator formatting 32–64 bytes of realistic protocol payload with identified suspicious byte offset windows.
     - Implement ring-buffer FIFO helper: `pushEventToRingBuffer(buffer: SocTelemetryEvent[], newEvent: SocTelemetryEvent, maxCapacity = 60): SocTelemetryEvent[]`.
  3. Author `src/lib/soc/useSocTelemetryStream.ts`:
     - Coordinate timer ticks via `setTimeout` based on speed: base interval 1200ms (1x), 2400ms (0.5x), 600ms (2x).
     - Maintain state: `events` (FIFO array capped at 60), `selectedEvent` (for drawer inspection), `isolatedNodes` (Set of quarantined NodeIds), `streamStatus` ('PLAYING' | 'PAUSED'), `streamSpeed`, and `metrics`.
     - If a target node is `ISOLATED`, tag inbound events with `status: 'DROPPED_BY_FIREWALL'` and drop severity to avoid false active anomaly alerts.
     - Expose analyst action handlers:
       - `togglePause()`
       - `setSpeed(speed)`
       - `isolateNode(nodeId)` / `unisolateNode(nodeId)`
       - `markFalsePositive(eventId)`
       - `selectEvent(event | null)`
       - `rescoreEventWithMl(eventId)` (connects to Phase 3 `runInference`)
- **Verification Commands**:
  - Run TypeScript compile check: `npx tsc --noEmit`.
  - Verify generator emits valid `SocTelemetryEvent` objects with required NetFlow features for Phase 3 ML integration.
</task>

---

### <task 2: Interactive SVG Multi-Tier Cyber Topology Graph>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/soc/AttackTopologyMap.tsx` (interactive 5-tier cyber topology vector graph with animated attack vectors, node status badges, and accessible selection)
- **Action Steps**:
  1. Author `src/components/soc/AttackTopologyMap.tsx`:
     - Construct high-precision SVG canvas (e.g. `viewBox="0 0 800 380"`) with 5 enterprise infrastructure nodes:
       - Node 1: `ingress-gateway` (x: 400, y: 40) — Edge Ingress & WAF
       - Node 2: `dmz-bastion` (x: 400, y: 125) — Zero-Trust Jump Host
       - Node 3: `microservices` (x: 230, y: 220) — Application Service Mesh
       - Node 4: `auth-vault` (x: 570, y: 220) — Secrets KMS & Auth Vault
       - Node 5: `db-cluster` (x: 400, y: 320) — Distributed PostgreSQL & FalkorDB
     - Render interconnecting vector paths (curved cubic/quadratic beziers or clean orthogonal line links) between nodes.
     - Visualize dynamic attack arcs:
       - Highlight active link when the latest telemetry event traverses between `sourceNode` and `targetNode`.
       - For `HIGH` or `CRITICAL` severity events, animate a traveling packet particle (`<circle>` following SVG path or `stroke-dashoffset` pulse animation) along the vector route.
       - Color code paths according to severity: Cyan (`#00FFFF`) for benign, Amber (`#F2C500`) for medium, Crimson (`#FF7A6B`) for attack anomalies.
     - Render node cards:
       - Architectural node icon, node title, tier index, and current status pill (`HEALTHY`, `DEGRADED`, `UNDER_ATTACK`, `ISOLATED`).
       - Isolated nodes render with a slashed quarantine border, graphite fill (`#5B6A6E`), and `QUARANTINED` badge.
     - Keyboard & accessibility support:
       - Wrap each node in `<g role="button" tabIndex={0} aria-label="...">` with `onKeyDown` supporting `Enter` and `Space` to inspect that node's latest telemetry.
       - Focus ring with high-contrast `--mark` yellow border.
     - Respect `prefers-reduced-motion`:
       - Detect reduced motion media query; replace animated moving particles with a static high-contrast stroke color shift.
- **Verification Commands**:
  - Mount component in isolation or test harness; verify SVG scales responsively.
  - Assert all 5 nodes render with correct IDs, status transitions, and vector linkages.
  - Verify keyboard tab navigation lands on each node and triggers selection.
</task>

---

### <task 3: Decoded Packet Inspection HUD Slide-out Drawer>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/soc/PacketInspectionDrawer.tsx` (slide-out DPI inspection HUD dialog meeting WCAG 2.2 AA modal standards)
- **Action Steps**:
  1. Author `src/components/soc/PacketInspectionDrawer.tsx`:
     - Modal & Drawer UX Architecture:
       - Render as a slide-out HUD drawer anchored to the right side of the screen (or full drawer on mobile).
       - Modal accessibility: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`, `aria-describedby="drawer-subtitle"`.
       - Focus management: Auto-focus the close button or primary action on mount; trap tab focus within the drawer; restore focus to the triggering element upon dismissal.
       - Keyboard listener: Close drawer immediately on `Escape` key press.
       - Document scroll lock: Set `document.body.style.overflow = 'hidden'` while open; cleanly restore on unmount.
     - Drawer Content Structure:
       - **Header Bar:** Event ID (`#b9e7-4260`), UTC timestamp, protocol badge, severity indicator, and dismiss `[ESC / CLOSE]` button.
       - **Threat Intelligence & ML Scoring:** Signature title, MITRE ATT&CK technique reference, Phase 3 ONNX WASM anomaly score bar, and confidence rating.
       - **Decoded Layer 3 / Layer 4 Headers:**
         - Source IP:Port -> Destination IP:Port.
         - Protocol (TCP/UDP/ICMP), IP Version (IPv4/IPv6), TTL, Packet Size.
         - TCP Flags pill matrix: `SYN`, `ACK`, `FIN`, `RST`, `PSH`, `URG` (active flags highlighted in accent cyan or fault red).
         - TCP Window Size & Sequence/Ack counters.
       - **Decoded Layer 7 Metadata:**
         - TLS SNI, Cipher suite, HTTP Method, Path, User-Agent, or DNS Query record.
       - **Dual-Pane Hex / ASCII Payload Viewer:**
         - Wireshark/tcpdump style 16-bytes-per-line display.
         - Column 1: 8-digit hex offset (`00000000`, `00000010`, etc.).
         - Column 2: 16 space-separated hex byte pairs (`45 00 00 54 1a 2b...`).
         - Column 3: ASCII representation of printable bytes, with `·` for non-printables.
         - Highlight anomalous byte offsets defined in `event.payload.anomalousOffsets` using a glowing border/background `<mark class="bg-fault/20 text-fault font-semibold">`.
       - **Analyst Action Dock (Human-in-the-Loop):**
         - `[ISOLATE HOST NODE]` / `[RESTORE NODE]`: Instantly triggers quarantine state machine on target node.
         - `[MARK FALSE POSITIVE]`: Re-labels alert as benign and recalibrates false-positive metrics.
         - `[RE-RUN ML INFERENCE]`: Executes client-side `runInference(event.netflow)` from `src/lib/ml/inference-engine.ts` in real time and displays sub-millisecond execution latency.
- **Verification Commands**:
  - Test opening drawer by selecting an event; verify focus lands inside drawer.
  - Press `Escape` and verify drawer closes and focus returns.
  - Verify Hex and ASCII columns align correctly at 16 bytes per line with highlighted offsets.
</task>

---

### <task 4: SOC Mission Control Command Deck & Alert Triage Feed>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/soc/AlertTriageFeed.tsx` (live real-time telemetry feed table with triage action shortcuts and ARIA live announcements)
  - `src/components/soc/SocCommandDeck.tsx` (top-level master command deck unifying topology map, metrics HUD ticker, stream controls, triage feed, and inspection drawer)
- **Action Steps**:
  1. Author `src/components/soc/AlertTriageFeed.tsx`:
     - Real-time tabular event feed styled with high-density monospace telemetry:
       - Columns: Timestamp (HH:mm:ss.SSS), Severity Badge, Source -> Target, Signature, Protocol, ML Score, Quick Actions.
     - Severity styling:
       - `CRITICAL`: Crimson red badge with pulse beacon.
       - `HIGH`: Orange/Amber alert indicator.
       - `MEDIUM`: Yellow warning indicator.
       - `LOW`: Muted cyan/slate normal indicator.
     - Quick Action Buttons per row:
       - `[INSPECT]`: Opens DPI drawer for this event.
       - `[ISOLATE]`: Quarantines target node immediately.
       - `[FP]`: Marks event as false positive.
     - ARIA Live Announcements:
       - Include hidden `<div aria-live="polite" className="sr-only">` announcing newly arrived `CRITICAL` intrusion alerts for screen readers.
     - Filtering & search controls:
       - Filter by severity: ALL, ANOMALIES ONLY, CRITICAL.
       - Search by IP, signature, or node ID.
  2. Author `src/components/soc/SocCommandDeck.tsx`:
     - Mount and orchestrate `useSocTelemetryStream()`.
     - Layout structure:
       - **Header & Metric HUD Ticker:**
         - Status badge: `LIVE STREAM ACTIVE` / `STREAM PAUSED`.
         - Metrics: Total Packets Inspected, Active Anomalies, Isolated Hosts, False Positive Ratio (%).
         - Controls: `[PAUSE]` / `[PLAY]`, Speed toggles (`0.5x`, `1.0x`, `2.0x`), `[RESET / FLUSH STREAM]`.
       - **Upper Split Grid:**
         - Left Column (or Top on mobile): `<AttackTopologyMap />` showing live nodes and animated vectors.
         - Right Column (or Bottom): Compact Active Incident Queue / Threat Radar.
       - **Lower Section:**
         - `<AlertTriageFeed />` showing the full streaming event queue.
       - **Slide-Out Drawer Overlay:**
         - `<PacketInspectionDrawer />` conditionally rendered when `selectedEvent` is not null.
     - Connect `runInference(event.netflow)` from Phase 3 `src/lib/ml/inference-engine.ts`:
       - Allow visitors to click `[RE-RUN ML INFERENCE]` inside the drawer or feed, running the 6 NetFlow parameters directly through ONNX Runtime Web WASM and displaying verified latency and confidence.
- **Verification Commands**:
  - Verify speed controls correctly change stream tick frequency (0.5x = 2400ms, 1x = 1200ms, 2x = 600ms).
  - Verify pausing stops event accumulation; playing resumes smoothly without frame drops.
  - Verify ring buffer never exceeds 60 events in memory.
  - Verify clicking `[ISOLATE HOST]` updates both topology and metrics counter.
</task>

---

### <task 5: Lab Route Integration & Automated Gate 4 Playwright Test Suite>
- **Type**: expansion
- **Files to create/modify**:
  - `src/app/lab/page.tsx` (embed flagship `SocCommandDeck` with technical framing, data notes, and retain existing `phenom` case study)
  - `tests/gate4-soc.spec.ts` (comprehensive Playwright end-to-end test suite verifying SOC-01, SOC-02, SOC-03, performance, and accessibility)
  - `package.json` (add `"test:gate4": "playwright test tests/gate4-soc.spec.ts"`)
  - `.planning/phases/04-simulated-cyber-warfare-soc-telemetry-visualizer/04-VALIDATION.md` (record Gate 4 test execution outputs and criteria verification)
- **Action Steps**:
  1. Update `src/app/lab/page.tsx`:
     - Dynamically import `SocCommandDeck` with SSR enabled or client hydration wrapper (`'use client'` boundary).
     - Place `<SocCommandDeck />` prominently at the top of the page under the header.
     - Add technical data provenance banner:
       - *"Data Provenance: 100% Client-Side Synthetic Stream. Zero network telemetry requests. NetFlow v9 & Zeek format simulation with live client-side ONNX Runtime WASM anomaly classification."*
     - Preserve existing `phenom` prototype section below the command deck with all metrics and data notes intact.
  2. Author `tests/gate4-soc.spec.ts` with 7 automated test suites:
     - **SOC-VAL-01 (Component Mount & Layout):** Navigate to `/lab`; assert `[data-testid="soc-command-deck"]`, topology map (`[data-testid="attack-topology-map"]`), triage feed (`[data-testid="alert-triage-feed"]`), and HUD tickers are visible.
     - **SOC-VAL-02 (Real-Time Stream & Controls):** Wait 3.5s; assert event feed contains $\ge 3$ rows. Click `[data-testid="btn-stream-pause"]`; assert stream status shows PAUSED and packet count halts. Click `[data-testid="btn-stream-play"]`; assert packet count increments.
     - **SOC-VAL-03 (Packet Inspection Drawer & A11y):** Click on a telemetry row; assert drawer (`[data-testid="packet-drawer"]`) opens with `role="dialog"`, `aria-modal="true"`. Assert decoded headers, TCP flags, and Hex/ASCII viewer are visible. Press `Escape` key; assert drawer closes.
     - **SOC-VAL-04 (Node Isolation Workflow):** Open drawer or topology node; click `[data-testid="btn-isolate-node"]`. Assert target node changes status to `ISOLATED` and HUD ticker `[data-testid="stat-isolated-hosts"]` increments to 1.
     - **SOC-VAL-05 (False Positive Override):** Click `[data-testid="btn-mark-false-positive"]` on an anomaly; assert badge changes to `[FALSE POSITIVE]` and False Positive Rate metric recalculates.
     - **SOC-VAL-06 (Client ML Model Re-Scoring):** In drawer, click `[data-testid="btn-rescore-ml"]`; assert Phase 3 ONNX Runtime WASM inference executes and displays latency $< 50$ms and updated classification.
     - **SOC-VAL-07 (60 FPS Benchmark & Reduced Motion):** Measure requestAnimationFrame delta over 5 seconds of active streaming; assert 0 long task freezes. Enable `prefers-reduced-motion: reduce`; assert traveling pulse animations are disabled and static indicators are used. Assert zero console errors throughout.
  3. Register npm script in `package.json`:
     - `"test:gate4": "playwright test tests/gate4-soc.spec.ts"`.
  4. Author validation documentation `04-VALIDATION.md`:
     - Document Gate 4 verification results, Playwright test runs, performance benchmarks, and compliance with SOC-01, SOC-02, and SOC-03.
- **Verification Commands**:
  - `npm run test:gate4` passes 100% of tests.
  - Regression check: `npm run test:gate1`, `npm run test:gate2`, `npm run test:gate3` all pass.
  - Production build: `npm run build:prod` passes with 0 errors.
</task>

---

## Threat Model & Risk Mitigations

<threat_model>
| Threat ID | Threat Description | Severity | Mitigation Strategy |
|-----------|--------------------|----------|---------------------|
| **T-04-01** | **Main-Thread UI Freeze from Unthrottled Streaming**: High-frequency event ticks (< 100ms) or heavy DOM reflows block the main thread, causing dropped animation frames, frozen cursor interactions, or lagging 3D canvas background. | High | Throttle event generation to a steady, predictable clock (default 1,200ms per event). Ensure generator compute time is strictly $< 0.5$ms per tick. Defer heavy header decoding and hex formatting until a specific event is opened in the inspection drawer. |
| **T-04-02** | **Memory Leak from Unbounded Event Arrays**: Leaving the SOC dashboard running continuously in a browser tab accumulates thousands of event objects, consuming hundreds of megabytes of heap memory and causing browser tab crashes. | High | Enforce a strict FIFO ring-buffer pattern capped at exactly 60 events. When array length reaches 60, immediately evict the oldest event (`events.slice(0, 59)`). Ensure zero lingering event listeners or uncollected closures upon component unmount. |
| **T-04-03** | **Accessibility Focus Trap & Keyboard Lockup**: Modal slide-out drawer traps keyboard focus incorrectly or fails to release focus on Escape key, leaving keyboard-only and screen reader visitors trapped in the inspection panel. | High | Adhere strictly to WCAG 2.2 AA modal guidelines: implement `role="dialog"`, `aria-modal="true"`, trap tab key focus cyclically within the drawer container, listen for `Escape` keydown to cleanly dismiss, and automatically restore focus to the initiating row trigger element. |
| **T-04-04** | **Reduced-Motion Accessibility Violation**: Continuous animated SVG pulse vectors and blinking status badges trigger vestibular distress or disorientation for users with vestibular disorders. | Medium | Query `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, completely disable traveling SVG pulse circles and moving stroke animations. Replace them with static, high-contrast color shifts on vector connectors. Provide a visible manual stream pause toggle. |
</threat_model>

---

## Verification & Nyquist Gates

<verification>
Execute the following verification checklist to certify Gate 4 completion:

```bash
# 1. Type check and code integrity
npx tsc --noEmit

# 2. Production build verification
npm run build:prod

# 3. Regression test suites for prior gates
npm run test:gate1
npm run test:gate2
npm run test:gate3

# 4. Phase 4 Gate 4 SOC Telemetry Visualizer test suite
npm run test:gate4
```

### Pass Criteria Checklist
- [ ] Telemetry stream engine continuously synthesizes realistic NetFlow v9/Zeek events on client without external network requests.
- [ ] Memory footprint is strictly bounded by FIFO ring-buffer (max 60 events) with zero leaks over continuous execution.
- [ ] Speed controls (Pause, Play, 0.5x, 1x, 2x) accurately adjust generator frequency.
- [ ] Interactive 5-tier SVG attack topology renders all 5 infrastructure nodes with dynamic vector pulses and status states.
- [ ] Packet Inspection Drawer opens on row click with `role="dialog"`, focus trap, and dismisses on `Escape` key press.
- [ ] Dual-pane Hex/ASCII payload viewer cleanly displays 16 bytes per line with highlighted anomaly byte offsets.
- [ ] Analyst actions ([ISOLATE HOST], [MARK FALSE POSITIVE]) update node state, recalculate HUD metrics, and update triage badges.
- [ ] Live integration with Phase 3 ONNX Runtime WASM (`runInference`) allows real-time re-scoring of telemetry NetFlow features.
- [ ] `/lab` route mounts the SOC Command Deck seamlessly alongside existing `phenom` documentation.
- [ ] System respects `prefers-reduced-motion` by disabling moving particles and continuous vector animations.
- [ ] All automated tests in `tests/gate4-soc.spec.ts` pass with 100% success and 0 console errors.
</verification>
