# Phase 2 Context: R3F Interactive 3D Globe & Threat Topology (WebGPU Compute Particles)

## Requirements Covered
- **GPU-01**: React Three Fiber (R3F) or Three.js context initialization with WebGPU/WebGL device capability negotiation.
- **GPU-02**: Interactive 3D Globe & Threat Topology rendering live simulated SOC attack arcs and node inspection.
- **GPU-03**: Custom WebGPU compute particle field with real-time cursor gravitational lensing and velocity buffers.
- **GPU-04**: Robust automatic fallback to WebGL / 2D Canvas when WebGPU is unsupported or under `prefers-reduced-motion`.

## Architectural Goals
1. **React 19 Compatibility & Zero Hydration Overhead:**
   - Integrate with the existing `src/components/layout/CanvasDeckContainer.tsx`.
   - Ensure dynamic client-only loading (`ssr: false`) so static HTML pre-rendering remains instantaneous and zero-hydration-error.
2. **Capability Negotiation (Tiered Rendering Pipeline):**
   - **Tier 2 (WebGPU):** Custom compute shaders (WGSL) running particle simulation buffers and gravitational lensing, rendering via Three.js WebGPU / WebGPU canvas.
   - **Tier 1 (WebGL2):** Instanced mesh / vertex shader fallback for particle swarm and ballistic threat arcs.
   - **Tier 0 (Static / Reduced Motion):** Crisp cybernetic SVG fallback rendered instantly with zero GPU cycles for `prefers-reduced-motion` or low-end devices.
3. **Interactive Threat Topology Visuals:**
   - Deep cyber aesthetics matching the OLED `#000000` theme.
   - Nodes representing cybersecurity hubs and Ambul's project data sources.
   - Great-circle attack arcs with pulsing glow heads.
   - Interactive mouse hover tooltip displaying node telemetry (Node ID, Anomaly Score, Protocol, Status).
4. **Safety & Performance Constraints:**
   - Memory disposal on component unmount (buffers, geometries, materials, renderers).
   - "Reduce 3D" switch toggle in HUD respected and persisted in `localStorage`.
   - `aria-hidden="true"` on canvas deck so screen readers use accessible HTML content.
