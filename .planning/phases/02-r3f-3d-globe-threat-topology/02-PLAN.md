---
phase: "02"
phase_slug: "r3f-3d-globe-threat-topology"
status: "planned"
date: "2026-10-19"
author: "gsd-planner"
requirements:
  - GPU-01
  - GPU-02
  - GPU-03
  - GPU-04
---

# Phase 2: R3F Interactive 3D Globe & Threat Topology (WebGPU Compute Particles) — Execution Plan

<phase_header>
Phase: 02 — R3F Interactive 3D Globe & Threat Topology (WebGPU Compute Particles)
Goal: Implement an interactive 3D Cyber Threat Globe & SOC Topology with live ballistic attack arcs, telemetry node inspection, and high-density WebGPU compute particle physics (with WebGL2 instanced mesh & Tier 0 SVG fallbacks).
Outputs:
  - Tiered device capability negotiator (`negotiator.ts`) managing Tier 2 (WebGPU Compute), Tier 1 (WebGL2 Instanced), and Tier 0 (Static SVG).
  - Next.js dynamic client wrapper (`ThreatGlobeDeck.tsx`) with zero hydration errors and persistent 45vw Split Command Deck integration.
  - 3D Cyber Threat Globe (`GlobeSphere.ts`) with 2,400 Fibonacci dot particles, telemetry latitude/longitude rings, and 6 core cybersecurity nodes.
  - Ballistic Great-Circle Threat Arcs (`ThreatArcs.ts`) with pulsing luminous packet beads and shockwave impact rings.
  - Screen-space projected HUD Telemetry Tooltip (`ThreatTooltip.tsx`) driven by 3D node raycasting (`NodeRaycaster.ts`).
  - WebGPU WGSL compute particle field (`gravitationalLensing.wgsl.ts` & `WebGPUComputeParticles.ts`) with 32,768 particles, ping-pong storage buffers, and real-time cursor gravitational lensing.
  - WebGL2 instanced mesh fallback (`WebGLFallbackParticles.ts`) with vertex shader displacement.
  - Explicit GPU memory disposal lifecycle (`engine.ts`) preventing context exhaustion and V8 memory bloat.
  - HUD "Reduce 3D" toggle with `localStorage` persistence and `prefers-reduced-motion` compliance.
  - Automated Gate 2 Playwright test suite (`tests/gate2-gpu.spec.ts`) asserting 60 FPS, fallback behavior, raycasting, and zero context leaks.
</phase_header>

---

## Architecture & Rendering Pipeline Overview

The graphics architecture implements a deterministic tiered hierarchy:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               CAPABILITY PROBE                                   │
│  1. prefers-reduced-motion: reduce?  ──► YES ──► Tier 0: Static Cyber SVG       │
│  2. localStorage.reduce3d == 'true'? ──► YES ──► Tier 0: Static Cyber SVG       │
│  3. navigator.gpu available?         ──► YES ──► Tier 2: WebGPU Compute Engine   │
│  4. WebGL2 supported?                ──► YES ──► Tier 1: WebGL2 Instanced Engine │
│  5. Fallback                         ──────────► Tier 0: Static Cyber SVG       │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
┌───────────────────────────────────┐             ┌───────────────────────────────────┐
│     TIER 2: WEBGPU COMPUTE        │             │      TIER 1: WEBGL2 INSTANCED     │
│ - Three.js WebGPURenderer         │             │ - Three.js WebGLRenderer          │
│ - 32,768 WGSL Compute Particles   │             │ - 3,072 Instanced Mesh Particles  │
│ - Ping-Pong Storage Buffers       │             │ - Vertex Shader Noise & Repulsion │
│ - Cursor Gravitational Lensing    │             │ - Great-Circle Ballistic Arcs     │
│ - 60 FPS Target (DPR capped at 2) │             │ - 45-60 FPS Target (DPR adaptive) │
└─────────────────┬─────────────────┘             └─────────────────┬─────────────────┘
                  │                                                 │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             COMMON 3D SCENE GRAPH                                │
│ - Fibonacci Point Sphere (2,400 points, R=4.2 units, #00f0ff alpha attenuation)  │
│ - 6 Concentric Latitude/Longitude Telemetry Grid Rings (#1b262f)                 │
│ - 6 Cybersecurity & Project Nodes (Cartesian lat/lon coordinate projection)      │
│ - Great-Circle Ballistic Arcs (elevated Bezier splines + traveling pulse heads)  │
│ - Concentric Impact Flash Rings (expanding shockwaves at target nodes)           │
│ - Raycaster (NDC unprojection + projected HTML Telemetry HUD Tooltip)            │
│ - Orbit auto-rotation (0.0015 rad/frame) + Damped mouse tilt (<= 2.5 deg)        │
└──────────────────────────────────────────┬───────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENT DUAL-PANE INTEGRATION                           │
│ - RootLayout shell retains scene across client navigation (/work/inferyx, etc.)  │
│ - Camera transitions to target project node; background dims to 18% opacity      │
│ - Clean disposal protocol on unmount or "Reduce 3D" toggle:                      │
│   buffers.destroy(), geometries.dispose(), materials.dispose(), forceContextLoss()│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Module Organization
```
src/
├── components/
│   ├── layout/
│   │   ├── HudTopBar.tsx                 // Updated with "Reduce 3D" toggle switch
│   │   └── HudBottomBar.tsx              // GPU engine telemetry status
│   └── scene/
│       ├── CanvasDeckContainer.tsx       // Host container with SSR Tier 0 SVG baseline
│       ├── ThreatGlobeDeck.tsx           // Dynamic client component (ssr: false)
│       └── ThreatTooltip.tsx             // Projected HTML telemetry HUD overlay
└── scene/
    ├── types.ts                          // Shared scene, capability & telemetry types
    ├── negotiator.ts                     // Capability negotiation & tier detection
    ├── engine.ts                         // ThreatEngine coordinator (RAF loop & disposal)
    ├── globe/
    │   ├── GlobeSphere.ts                // Fibonacci point grid & telemetry rings
    │   ├── NodeTopology.ts               // Cybersecurity node coordinates & markers
    │   ├── ThreatArcs.ts                 // Great-circle Bezier attack arcs & pulse heads
    │   └── NodeRaycaster.ts              // Raycasting hit test & screen coordinate projection
    ├── particles/
    │   ├── WebGPUComputeParticles.ts     // WGSL compute pipeline & ping-pong storage buffers
    │   └── WebGLFallbackParticles.ts     // Instanced mesh fallback for WebGL2
    └── shaders/
        └── gravitationalLensing.wgsl.ts  // WGSL compute shader source code
```

---

## Tasks

### <task 1: Tracer - Tier Negotiator & Canvas Client Mount>
- **Type**: tracer
- **Files to create/modify**:
  - `src/scene/types.ts` (define `GraphicsTier`, `DeviceCapability`, `NodeTelemetry`, `AttackArc`, `ThreatEngineConfig`, `ThreatEngineInstance`)
  - `src/scene/negotiator.ts` (implement `negotiateDeviceCapability()`, `setReduce3DPreference()`, and `subscribeToReduce3D()`)
  - `src/components/layout/HudTopBar.tsx` (add "Reduce 3D" toggle button with persistent state sync and ARIA accessibility)
  - `src/components/scene/ThreatGlobeDeck.tsx` (dynamic client-side canvas host with loading state, error boundary, and tier status badge)
  - `src/components/scene/CanvasDeckContainer.tsx` (refactor container to dynamically load `ThreatGlobeDeck` via `next/dynamic` with `ssr: false`, keeping Tier 0 SVG as SSR baseline)
- **Action Steps**:
  1. Define TypeScript interfaces in `src/scene/types.ts`:
     - `GraphicsTier`: `'tier-2-webgpu' | 'tier-1-webgl2' | 'tier-0-svg'`.
     - `DeviceCapability`: `{ tier: GraphicsTier; adapterInfo?: GPUAdapterInfo; isReducedMotion: boolean; userDisabled: boolean; reason: string }`.
     - `NodeTelemetry`: `{ id: string; label: string; slug: string; role: string; lat: number; lon: number; anomalyScore: number; status: 'NOMINAL' | 'WARNING' | 'CRITICAL'; protocol: string; position: [number, number, number] }`.
  2. Implement `src/scene/negotiator.ts`:
     - Evaluate `window.matchMedia('(prefers-reduced-motion: reduce)')` -> return `tier-0-svg`.
     - Evaluate `localStorage.getItem('reduce3d') === 'true'` -> return `tier-0-svg`.
     - Evaluate `navigator.gpu` with `requestAdapter()` and `requestDevice()` -> return `tier-2-webgpu`.
     - Evaluate `testCanvas.getContext('webgl2')` -> return `tier-1-webgl2`.
     - Provide `setReduce3DPreference(enabled)` that writes to `localStorage` and dispatches `'storage'` and custom `'reduce3d-change'` events.
  3. Update `src/components/layout/HudTopBar.tsx`:
     - Add a "Reduce 3D" button toggle with monitor icon and active status pill.
     - Ensure `aria-pressed` reflects current state; clicks trigger `setReduce3DPreference()`.
  4. Build `src/components/scene/ThreatGlobeDeck.tsx`:
     - Mounts container `div` and canvas element using React `useRef`.
     - Subscribes to capability updates and mounts the 3D canvas only when tier is Tier 2 or Tier 1.
     - Renders header status badge: `TIER 2 WEBGPU`, `TIER 1 WEBGL2`, or `TIER 0 SVG`.
  5. Refactor `src/components/scene/CanvasDeckContainer.tsx`:
     - Use `dynamic(() => import('./ThreatGlobeDeck'), { ssr: false })` to guarantee zero SSR hydration mismatches.
     - Render the static Tier 0 vector SVG during SSR and when reduced motion / Tier 0 is active.
- **Verification Commands**:
  - `npm run dev` boots without hydration warnings.
  - Verify in browser console: `[GraphicsNegotiator] Evaluated capability: Tier X`.
  - Click "Reduce 3D" in HUD: scene instantly flips to Tier 0 SVG without page refresh.
  - Reload page: "Reduce 3D" choice remains preserved in `localStorage`.
</task>

---

### <task 2: 3D Cyber Threat Globe & Node Topology>
- **Type**: expansion
- **Files to create/modify**:
  - `src/scene/globe/GlobeSphere.ts` (Fibonacci distribution of 2,400 dot points, latitude/longitude cyber telemetry rings, OLED theme materials)
  - `src/scene/globe/NodeTopology.ts` (6 cybersecurity & project nodes with spherical coordinates, pulsing concentric ring markers, and hitboxes)
  - `src/scene/engine.ts` (ThreatEngine core coordinator: Scene, Camera, WebGL2/WebGPU Renderer, auto-rotation loop, damped mouse tilt)
- **Action Steps**:
  1. Implement `src/scene/globe/GlobeSphere.ts`:
     - Radius $R = 4.2$ units.
     - Generate 2,400 dot positions using the golden ratio Fibonacci sphere:
       $\phi = \pi(3 - \sqrt{5}) \approx 2.3999632$, $y_i = 1 - \frac{2i}{N-1}$, $r_i = \sqrt{1 - y_i^2}$, $\theta_i = i\phi$, $x_i = r_i \cos(\theta_i) R$, $z_i = r_i \sin(\theta_i) R$.
     - Construct `BufferGeometry` with custom attribute `aAlpha` for subtle pole-to-equator attenuation.
     - Create `Points` using `PointsMaterial` with color `#00f0ff`, opacity 0.65, size 0.04.
     - Add 6 concentric latitude/longitude wireframe circles using `LineLoop` with `LineBasicMaterial` (color `#1b262f`, opacity 0.35).
  2. Implement `src/scene/globe/NodeTopology.ts`:
     - Map nodes from $(\text{lat}, \text{lon}) \to (x, y, z)$:
       $x = R \cos(\text{lat}) \sin(\text{lon})$, $y = R \sin(\text{lat})$, $z = R \cos(\text{lat}) \cos(\text{lon})$.
     - Nodes:
       - `inferyx-hub` (29.85° N, 77.89° E) — Lead AutoML Studio `#00f0ff`
       - `aegisz-zk` (50.11° N, 8.68° E) — Zero-Knowledge PII Gateway `#00f0ff`
       - `orgmind-kg` (38.90° N, -77.04° E) — Knowledge Graph Engine `#00f0ff`
       - `threat-soc` (37.77° N, -122.41° E) — AI Threat Detection Core `#ff7a6b`
       - `roadsaarthi` (12.97° N, 77.59° E) — Spatial Stream Anomaly Hotspot `#f2c500`
       - `edge-tokyo` (35.67° N, 139.65° E) — APAC Telemetry Collector `#00f0ff`
     - Render each node with a solid core sphere pip ($r = 0.08$) and a pulsating outer ring ($r = 0.16 \to 0.24$) oriented tangent to the sphere surface using `mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)`.
  3. Implement `src/scene/engine.ts`:
     - Configure Three.js `PerspectiveCamera` with low FOV (28°) at $(0, 0, 16)$ for an orthographic technical feel.
     - Add auto-rotation ($0.0015\text{ rad/frame}$) on the globe group.
     - Add smooth mouse parallax tilting ($\le 2.5^\circ$) with exponential damping ($0.05$).
     - Hook requestAnimationFrame (RAF) loop updating scene state.
- **Verification Commands**:
  - Globe renders smoothly in viewport with Fibonacci dot cloud and 6 labeled nodes.
  - Auto-rotation rotates the globe slowly; moving the cursor gently tilts the perspective.
  - FPS counter maintains solid 60 FPS.
</task>

---

### <task 3: Great-Circle Attack Arcs & Particle Packet Trajectories>
- **Type**: expansion
- **Files to create/modify**:
  - `src/scene/globe/ThreatArcs.ts` (elevated 3D quadratic Bezier curves, traveling pulse packet beads, destination impact shockwaves)
  - `src/scene/globe/NodeRaycaster.ts` (pointer raycasting with NDC conversion, 0.25 unit threshold, 3D to 2D screen coordinate projection)
  - `src/components/scene/ThreatTooltip.tsx` (high-tech HUD telemetry card projected onto screen coordinates with node metadata and click action)
  - `src/scene/engine.ts` (integrate threat arcs animation and raycasting hit testing)
- **Action Steps**:
  1. Implement `src/scene/globe/ThreatArcs.ts`:
     - Define simulated cyber attack trajectories:
       - `threat-soc` -> `inferyx-hub` (DDoS / Model Inversion attempt, color `#ff7a6b`)
       - `edge-tokyo` -> `aegisz-zk` (Credential stuffing stream, color `#00f0ff`)
       - `roadsaarthi` -> `orgmind-kg` (Telemetry synchronization, color `#f2c500`)
       - `aegisz-zk` -> `inferyx-hub` (ZK Proof verification packet, color `#00f0ff`)
     - For each trajectory between $\vec{P}_0$ and $\vec{P}_1$:
       - Calculate chord midpoint $\vec{P}_{\text{mid}} = \frac{\vec{P}_0 + \vec{P}_1}{2}$.
       - Calculate angular distance $\theta = \arccos(\frac{\vec{P}_0 \cdot \vec{P}_1}{\|\vec{P}_0\| \|\vec{P}_1\|})$.
       - Elevated control point $\vec{P}_{\text{ctrl}} = \text{normalize}(\vec{P}_{\text{mid}}) \cdot (R + \sin(\theta/2) \cdot 2.3)$.
       - Sample 64 points along $\vec{B}(t) = (1-t)^2 \vec{P}_0 + 2(1-t)t \vec{P}_{\text{ctrl}} + t^2 \vec{P}_1$ into `LineBasicMaterial` (`opacity: 0.35`).
     - Animated packet pulse beads:
       - Small glowing sphere travelling along $\vec{B}(t)$ where $t = ((\text{elapsedTime} \cdot \text{speed}) + \text{offset}) \bmod 1.0$.
     - Impact flash ring:
       - When $t > 0.92$, expand a concentric ring at $\vec{P}_1$ from scale $0.2 \to 1.5$ with fading opacity.
  2. Implement `src/scene/globe/NodeRaycaster.ts`:
     - On pointer move, calculate Normalized Device Coordinates (NDC) relative to canvas bounding box.
     - Perform `raycaster.intersectObjects(nodeHitBoxes)` with threshold $0.25$ units.
     - On hit, compute screen coordinates:
       ```typescript
       const projected = node.mesh.position.clone().applyMatrix4(globeGroup.matrixWorld).project(camera);
       const screenX = ((projected.x + 1) * width) / 2;
       const screenY = ((-projected.y + 1) * height) / 2;
       ```
     - Emit telemetry event with coordinates and node data.
  3. Implement `src/components/scene/ThreatTooltip.tsx`:
     - Absolute positioned HUD panel rendered over canvas deck.
     - Displays Node ID, Role, Anomaly Score (`[0.04 - 0.98]`), Protocol (`WEBSOCKET DUAL-WORKER`, `ZK-SNARK RPC`), and Status badge (`NOMINAL` in cyan, `CRITICAL` in threat red).
     - Action prompt: `[CLICK TO INSPECT ARCHITECTURE]`. Clicking executes Next.js router push to project page (`/work/inferyx`, etc.).
- **Verification Commands**:
  - Arcs arc gracefully above the globe surface with traveling pulse beads and destination impact ripples.
  - Hovering over a node displays the high-density HUD telemetry tooltip at the exact node screen position.
  - Clicking a node navigates to the associated case study route.
</task>

---

### <task 4: WebGPU Compute Particle Field & Gravitational Lensing>
- **Type**: expansion
- **Files to create/modify**:
  - `src/scene/shaders/gravitationalLensing.wgsl.ts` (WGSL compute shader source code with orbital restoring force, cursor gravitational lensing, and velocity damping)
  - `src/scene/particles/WebGPUComputeParticles.ts` (WebGPU compute pipeline, 32,768 particles, ping-pong storage buffers, uniform buffer updates)
  - `src/scene/particles/WebGLFallbackParticles.ts` (WebGL2 instanced geometry fallback with 3,072 particles, noise displacement, and cursor repulsion)
  - `src/scene/engine.ts` (integrate Tier 2 WebGPU compute pipeline when available, otherwise bind Tier 1 WebGL2 fallback)
- **Action Steps**:
  1. Author `src/scene/shaders/gravitationalLensing.wgsl.ts`:
     - Structs: `Particle { pos: vec4<f32>, vel: vec4<f32> }`, `SimulationParams { cursorPos: vec4<f32>, deltaTime: f32, gravityConst: f32, damping: f32, sphereRadius: f32 }`.
     - Compute entry point `@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) global_id : vec3<u32>)`.
     - Physics logic:
       - Restoring force pulling particles toward spherical shell of radius $R = 4.8$.
       - Gravitational lensing: when cursor active (`cursorPos.w > 0.5`), calculate vector $\vec{D} = \vec{P}_{\text{cursor}} - \vec{P}_i$.
       - Apply inverse-square attraction $F = G / (\|\vec{D}\|^2 + 0.16)$ with a repulsive core when $\|\vec{D}\| < 0.6$ (lens burst).
       - Velocity integration: $\vec{V}_{t+1} = (\vec{V}_t + \vec{F}_{\text{total}} \cdot \Delta t) \cdot \text{damping}$.
       - Position update: $\vec{P}_{t+1} = \vec{P}_t + \vec{V}_{t+1} \cdot \Delta t$.
  2. Implement `src/scene/particles/WebGPUComputeParticles.ts`:
     - Allocate 32,768 particles ($2^{15}$).
     - Create two GPUStorageBuffers (`bufferCurrent`, `bufferNext`) with usage `STORAGE | VERTEX | COPY_DST`.
     - Create uniform buffer for `SimulationParams`.
     - Setup compute pipeline with bind groups; ping-pong buffers each animation frame.
     - Render particles using `Points` bound to `bufferNext` position attribute.
  3. Implement `src/scene/particles/WebGLFallbackParticles.ts`:
     - Fallback for Tier 1: `InstancedBufferGeometry` or `BufferGeometry` with 3,072 particles.
     - Custom vertex shader with trigonometric curl noise and uniform `uCursor3D` displacement.
     - Runs entirely on GPU vertex pipeline without WebGPU requirement.
  4. Integrate both engines into `src/scene/engine.ts`:
     - If `capability.tier === 'tier-2-webgpu'`, instantiate `WebGPUComputeParticles`.
     - If `capability.tier === 'tier-1-webgl2'`, instantiate `WebGLFallbackParticles`.
     - Synchronize 3D unprojected cursor coordinates with particle simulation uniforms.
- **Verification Commands**:
  - In WebGPU-supported Chrome/Edge: Verify 32,768 compute particles swirl and lens toward the cursor on hover.
  - In WebGL2 mode (disable WebGPU in browser flags or test environment): Verify fallback particles animate smoothly without errors.
  - Frame rate maintains 60 FPS under active cursor lensing.
</task>

---

### <task 5: Memory Leak & Disposal Hardening, Automated Playwright GPU & Fallback Test Suite>
- **Type**: expansion
- **Files to create/modify**:
  - `src/scene/engine.ts` (implement recursive scene graph disposal, WebGPU buffer destruction, context loss trigger, and event unbinding)
  - `tests/gate2-gpu.spec.ts` (comprehensive Playwright test suite for capability negotiation, fallback, HUD toggle, raycasting, 60 FPS, and memory stability)
  - `package.json` (add `"test:gate2": "playwright test tests/gate2-gpu.spec.ts"`)
  - `.planning/phases/02-r3f-3d-globe-threat-topology/02-VALIDATION.md` (record Gate 2 validation results, benchmarks, and sign-off criteria)
- **Action Steps**:
  1. Complete disposal protocol in `src/scene/engine.ts`:
     - Cancel RAF loop (`cancelAnimationFrame`).
     - Remove window and canvas event listeners (`mousemove`, `resize`, `pointerdown`).
     - Recursively traverse scene graph: call `dispose()` on all geometries and materials.
     - Call `.destroy()` on WebGPU storage buffers.
     - Call `renderer.dispose()` and `renderer.forceContextLoss()`.
     - Remove DOM canvas element cleanly.
  2. Implement median frame rate monitor in `ThreatEngine.ts`:
     - Measure delta time over first 90 frames.
     - If median frame time $> 33\text{ms}$ (less than 30 FPS), automatically drop DPR to 1.0 and disable expensive effects.
  3. Create `tests/gate2-gpu.spec.ts`:
     - Test `GPU-VAL-01`: Canvas deck mounts with capability badge (`TIER 2 WEBGPU` or `TIER 1 WEBGL2`).
     - Test `GPU-VAL-02`: `prefers-reduced-motion: reduce` forces immediate Tier 0 SVG with 0 canvas elements.
     - Test `GPU-VAL-03`: "Reduce 3D" toggle in HUD updates `localStorage.reduce3d = 'true'` and mounts Tier 0 SVG.
     - Test `GPU-VAL-04`: Node hover reveals interactive telemetry HUD tooltip.
     - Test `GPU-VAL-05`: Node click dispatches navigation to target case study route.
     - Test `GPU-VAL-06`: 60 FPS benchmark measures frame deltas over 90 frames ($\le 25\text{ms}$ median).
     - Test `GPU-VAL-07`: Rapid route navigation across 5 routes leaves exactly 1 canvas element in DOM without memory leaks.
  4. Write `02-VALIDATION.md` documenting validation commands, test matrix, and verification sign-off.
- **Verification Commands**:
  - `npm run build` succeeds with zero errors.
  - `npm run test:gate2` passes 100% of test cases.
  - Memory heap profile shows flat, non-accumulating memory usage during route changes.
</task>

---

## Threat Model & Risk Mitigations

<threat_model>
| Threat ID | Threat Description | Severity | Mitigation Strategy |
|-----------|--------------------|----------|---------------------|
| **T-02-01** | **GPU Memory Leak & WebGL Context Exhaustion**: Rapid unmounting of 3D canvas during route transitions or toggling "Reduce 3D" leaves GPU buffers, textures, and contexts allocated in V8/driver heap, resulting in browser tab crash or `CONTEXT_LOST_WEBGL`. | High | Implement strict `dispose()` protocol in `engine.ts`. Recursively traverse scene graph calling `.dispose()` on all geometries and materials, explicitly call `.destroy()` on WebGPU storage buffers, remove event listeners, cancel RAF, and invoke `renderer.forceContextLoss()`. Maintain persistent canvas inside `RootLayout` so scene is never unmounted during normal route changes. |
| **T-02-02** | **Main Thread UI Freeze / Dropped Frames**: High-density particle updates and raycasting calculations choking the main JavaScript thread, dropping frame rates below 30 FPS on integrated GPUs or laptops. | High | In Tier 2, offload 100% of particle physics to GPU via WGSL compute shaders (`gravitationalLensing.wgsl.ts`). In Tier 1, cap particle count to 3,072 using vertex shaders. Implement runtime frame-budget monitor: if median frame time over 90 frames exceeds 33ms, drop DPR to 1.0. Throttle raycasting checks to once every 2 animation frames. |
| **T-02-03** | **Hydration Mismatch on Canvas Mount**: Next.js 15 Server-Side Rendering (SSR) trying to render Three.js / WebGPU elements that depend on `window`, `navigator.gpu`, or `document`, causing hydration errors or visual flash. | Medium | Encapsulate 3D deck in dynamic client wrapper (`next/dynamic(() => import('./ThreatGlobeDeck'), { ssr: false })`). Prerender static Tier 0 vector SVG during SSR and initial HTML generation. Client mounts Three.js only after DOM mount in `useEffect`, ensuring 100% parity and zero hydration warnings. |
| **T-02-04** | **Reduced-Motion Accessibility Violation**: Continuous 3D rotation, attack arcs, and particle lensing triggering vestibular discomfort for users with motion sensitivities, violating WCAG 2.1 2.3.3. | Critical | Check `window.matchMedia('(prefers-reduced-motion: reduce)')` first in `negotiateDeviceCapability()`. If true, bypass Three.js and WebGPU entirely; load zero 3D JavaScript chunks and render crisp, accessible Tier 0 SVG with 0 GPU cycles. Honor persisted user HUD toggle `localStorage.reduce3d = 'true'`. Keep canvas marked `aria-hidden="true"` with full accessible DOM navigation index. |
</threat_model>

---

## Verification & Nyquist Gates

<verification>
Execute the following verification checklist to certify Gate 2 completion:

```bash
# 1. Verify TypeScript compilation and static build
npm run build

# 2. Verify all Phase 1 regression gates still pass
npm run check:content
npm run check:placeholders
npm run check:email-leak
npx playwright test tests/gate1.spec.ts

# 3. Execute Phase 2 Gate 2 GPU & Threat Topology test suite
npx playwright test tests/gate2-gpu.spec.ts
```

### Pass Criteria Checklist
- [ ] Next.js 15 static export (`npm run build`) builds cleanly with zero errors.
- [ ] Zero SSR hydration mismatch warnings in browser console during initial load.
- [ ] Tier Negotiator correctly identifies Tier 2 (WebGPU) on compatible hardware and gracefully falls back to Tier 1 (WebGL2) or Tier 0 (SVG).
- [ ] `prefers-reduced-motion: reduce` emulation mounts Tier 0 SVG with 0 canvas elements created.
- [ ] "Reduce 3D" toggle in HUD flips scene to Tier 0 SVG and persists preference in `localStorage`.
- [ ] 3D Cyber Threat Globe renders with 2,400 Fibonacci dot particles, 6 telemetry rings, and 6 core cybersecurity nodes.
- [ ] Great-circle ballistic attack arcs animate with traveling pulse heads and destination shockwaves.
- [ ] Hovering over nodes triggers raycaster and displays projected screen-space HUD Telemetry Tooltip.
- [ ] Clicking a node navigates cleanly to the corresponding project case study route.
- [ ] WebGPU WGSL compute particles animate with cursor gravitational lensing and turbulence.
- [ ] Frame rate maintains solid 60 FPS ($\le 25\text{ms}$ median frame delta).
- [ ] Route navigation across multiple routes maintains single persistent canvas with zero memory leakage.
</verification>
