// src/scene/engine.ts — Core 3D Threat Engine Coordinator

import * as THREE from 'three';
import { ThreatEngineConfig, ThreatEngineInstance, GraphicsTier } from './types';
import { createGlobeSphere, GlobeSphereInstance } from './globe/GlobeSphere';
import { createNodeTopology, NodeTopologyInstance } from './globe/NodeTopology';
import { createThreatArcs, ThreatArcsInstance } from './globe/ThreatArcs';
import { createNodeRaycaster, NodeRaycasterInstance } from './globe/NodeRaycaster';
import { createWebGLFallbackParticles, ParticleSwarmInstance } from './particles/WebGLFallbackParticles';
import { createWebGPUComputeParticles, WebGPUParticlesInstance } from './particles/WebGPUComputeParticles';

export async function createThreatEngine(config: ThreatEngineConfig): Promise<ThreatEngineInstance> {
  const { container, canvas, capability, onTooltipChange, onNodeSelect } = config;

  // 1. Scene & Camera Setup
  const scene = new THREE.Scene();

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 800;

  const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
  camera.position.set(0, 0, 16);

  // 2. WebGL Renderer Initialization
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  let currentDPR = Math.min(window.devicePixelRatio || 1, 2.0);
  renderer.setPixelRatio(currentDPR);
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // 3. Globe Container Hierarchy
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const globeRadius = 4.2;

  // Construct Subsystems
  const globeSphere: GlobeSphereInstance = createGlobeSphere(globeRadius);
  globeGroup.add(globeSphere.group);

  const nodeTopology: NodeTopologyInstance = createNodeTopology(globeRadius);
  globeGroup.add(nodeTopology.group);

  const threatArcs: ThreatArcsInstance = createThreatArcs(nodeTopology.nodes, globeRadius);
  globeGroup.add(threatArcs.group);

  const raycaster: NodeRaycasterInstance = createNodeRaycaster(nodeTopology.nodes);

  // 4. Particle Subsystem (Tier 2 WebGPU vs Tier 1 WebGL2)
  let particlesWebGPU: WebGPUParticlesInstance | null = null;
  let particlesWebGL: ParticleSwarmInstance | null = null;

  if (capability.tier === 'tier-2-webgpu') {
    particlesWebGPU = await createWebGPUComputeParticles(32768, globeRadius * 1.15);
    if (particlesWebGPU) {
      scene.add(particlesWebGPU.points);
    }
  }

  // Fallback to WebGL2 particles if WebGPU failed or wasn't available
  if (!particlesWebGPU) {
    particlesWebGL = createWebGLFallbackParticles(3072, globeRadius * 1.15);
    scene.add(particlesWebGL.points);
  }

  // 5. Interaction & Parallax State
  const targetRotation = new THREE.Vector2(0, 0);
  const currentRotation = new THREE.Vector2(0, 0);
  const cursor3D = new THREE.Vector3(0, 0, 0);
  let isHovering = false;

  let animationFrameId = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  const frameTimes: number[] = [];
  let calculatedFPS = 60;

  // 6. Event Listeners
  const handlePointerMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Subtle tilt parallax
    targetRotation.x = y * 0.12;
    targetRotation.y = x * 0.18;

    // Unproject to 3D space for particle lensing
    const unprojected = new THREE.Vector3(x, y, 0.5);
    unprojected.unproject(camera);
    const dir = unprojected.sub(camera.position).normalize();
    const dist = (0 - camera.position.z) / dir.z;
    cursor3D.copy(camera.position).add(dir.multiplyScalar(dist));
    isHovering = true;

    // Check node hit test
    if (onTooltipChange) {
      const tooltipData = raycaster.checkIntersection(e.clientX, e.clientY, rect, camera, globeGroup);
      onTooltipChange(tooltipData);
    }
  };

  const handlePointerLeave = () => {
    isHovering = false;
    targetRotation.set(0, 0);
    if (onTooltipChange) {
      onTooltipChange(null);
    }
  };

  const handleClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const hitData = raycaster.checkIntersection(e.clientX, e.clientY, rect, camera, globeGroup);
    if (hitData && hitData.node.slug && onNodeSelect) {
      onNodeSelect(hitData.node.slug);
    }
  };

  const handleResize = () => {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 800;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener('resize', handleResize);
  canvas.addEventListener('mousemove', handlePointerMove);
  canvas.addEventListener('mouseleave', handlePointerLeave);
  canvas.addEventListener('click', handleClick);

  // 7. Render Animation Loop
  const renderLoop = (timeNow: number) => {
    const delta = Math.min((timeNow - lastTime) / 1000, 0.05);
    lastTime = timeNow;

    // Monitor FPS over first 90 frames for dynamic DPR adaptation
    if (frameCount < 90) {
      frameTimes.push(delta);
      frameCount++;
      if (frameCount === 90) {
        frameTimes.sort((a, b) => a - b);
        const medianDelta = frameTimes[Math.floor(frameTimes.length / 2)];
        calculatedFPS = Math.round(1 / medianDelta);
        if (medianDelta > 0.033 && currentDPR > 1.0) {
          // Frame rate < 30 FPS, throttle down DPR
          currentDPR = 1.0;
          renderer.setPixelRatio(1.0);
          console.warn('[ThreatEngine] Throttling DPR to 1.0 to preserve 60 FPS');
        }
      }
    }

    // Auto-rotation around Y axis
    globeGroup.rotation.y += 0.0015;

    // Damped mouse parallax
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;
    globeGroup.rotation.x = currentRotation.x;

    // Subsystem updates
    globeSphere.update(timeNow * 0.001);
    nodeTopology.update(timeNow * 0.001);
    threatArcs.update(delta);

    if (particlesWebGPU) {
      particlesWebGPU.update(timeNow * 0.001, delta, cursor3D, isHovering);
    } else if (particlesWebGL) {
      particlesWebGL.update(timeNow * 0.001, delta, cursor3D, isHovering);
    }

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(renderLoop);
  };

  animationFrameId = requestAnimationFrame(renderLoop);

  // 8. Disposal Protocol
  const dispose = () => {
    cancelAnimationFrame(animationFrameId);

    window.removeEventListener('resize', handleResize);
    canvas.removeEventListener('mousemove', handlePointerMove);
    canvas.removeEventListener('mouseleave', handlePointerLeave);
    canvas.removeEventListener('click', handleClick);

    globeSphere.dispose();
    nodeTopology.dispose();
    threatArcs.dispose();
    raycaster.dispose();

    if (particlesWebGPU) {
      particlesWebGPU.dispose();
    }
    if (particlesWebGL) {
      particlesWebGL.dispose();
    }

    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return {
    dispose,
    setCursor: (x, y, hovering) => {
      targetRotation.set(y * 0.12, x * 0.18);
      isHovering = hovering;
    },
    setTier: (tier: GraphicsTier) => {
      // Dynamic tier update
    },
    getFPS: () => calculatedFPS,
  };
}
