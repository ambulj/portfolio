# Phase 4 Context: Simulated Cyber Warfare / SOC Telemetry Visualizer

## Requirements Covered
- **SOC-01**: High-tech real-time simulated telemetry dashboard monitoring edge traffic anomalies.
- **SOC-02**: Interactive vector topology / packet flow map with dynamic packet inspection drawer.
- **SOC-03**: Live alert triage feed allowing visitors to flag false positives and evaluate classifier confidence.

## Architectural Goals
1. **Realistic Mission-Control SOC Radar & Dashboard:**
   - Display real-time streaming telemetry (synthetic NetFlow/Zeek events) with pause/play/speed controls, incident severity ratings (LOW, MEDIUM, HIGH, CRITICAL), and active threat counters.
   - High-tech OLED command deck visual language: scanlines, glowing cyan/amber/red status indicators, monospace telemetry tickers, and grid maps.
2. **Interactive Vector Topology & Attack Graph:**
   - Interactive SVG/Canvas node-link attack topology showing ingress vectors (Edge Router, DMZ Gateway, Bastion, Auth Service, DB Cluster, Storage Node).
   - Dynamic packet pulse animations visualizing live vector propagation across nodes during simulated incidents.
3. **Decoded Packet Inspection Drawer:**
   - Accessible slide-out inspection panel triggered by clicking any telemetry row or topology node.
   - Decoded protocol headers (Ethernet, IPv4/IPv6, TCP/UDP, TLS 1.3 handshake flags, HTTP/2 frames).
   - Hex / ASCII payload viewer with syntax coloring and heuristic anomaly indicator scores.
4. **Interactive Alert Triage Feed & Human-in-the-Loop Feedback:**
   - Live triage queue with realistic security analyst workflow:
     - `[INVESTIGATE]`, `[CONFIRM INCIDENT - ISOLATE NODE]`, `[MARK FALSE POSITIVE / OVERRIDE]`.
   - Real-time tie-in with Phase 3 ONNX Runtime anomaly scoring: triage actions dynamically update model threshold calibrations and telemetry metrics.
5. **Zero Main-Thread Degradation & Accessibility:**
   - Web Worker or `requestAnimationFrame`-throttled event generation ensuring steady 60 FPS.
   - Full keyboard accessibility (`Escape` closes drawer, tab focus trapping, ARIA live regions for high-severity alerts).
   - Respect `prefers-reduced-motion` by freezing continuous pulse animations into static telemetry state.
