// src/scene/particles/WebGLFallbackParticles.ts — High-Performance WebGL2 Instanced Fallback

import * as THREE from 'three';

export interface ParticleSwarmInstance {
  points: THREE.Points;
  update: (time: number, delta: number, cursor3D: THREE.Vector3, isHovering: boolean) => void;
  dispose: () => void;
}

export function createWebGLFallbackParticles(
  count: number = 3072,
  radius: number = 4.8
): ParticleSwarmInstance {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Generate spherical coordinates around shell
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius + (Math.random() - 0.5) * 1.2;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    basePositions[i * 3] = x;
    basePositions[i * 3 + 1] = y;
    basePositions[i * 3 + 2] = z;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.5 + Math.random() * 0.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

  // Custom vertex shader for high-efficiency GPU vertex displacement
  const uniforms = {
    uTime: { value: 0 },
    uCursor: { value: new THREE.Vector3(0, 0, 0) },
    uCursorActive: { value: 0.0 },
    uColor: { value: new THREE.Color(0x00f0ff) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      attribute float phase;
      attribute float speed;
      uniform float uTime;
      uniform vec3 uCursor;
      uniform float uCursorActive;
      varying float vAlpha;

      void main() {
        vec3 pos = position;

        // Gentle orbital drift
        float angle = uTime * 0.15 * speed + phase;
        pos.x += sin(angle) * 0.25;
        pos.y += cos(angle * 0.8) * 0.2;
        pos.z += sin(angle * 0.5) * 0.25;

        // Cursor gravitational repulsion/lensing
        if (uCursorActive > 0.5) {
          vec3 toCursor = pos - uCursor;
          float dist = length(toCursor);
          if (dist < 3.0 && dist > 0.05) {
            vec3 push = normalize(toCursor) * (1.0 - dist / 3.0) * 0.7;
            pos += push;
          }
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (14.0 / -mvPosition.z) * (0.8 + 0.4 * sin(angle * 2.0));
        gl_Position = projectionMatrix * mvPosition;

        vAlpha = 0.4 + 0.35 * sin(angle);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        // Circular point disc
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;

        float alpha = vAlpha * (1.0 - length(coord) * 2.0);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    update: (time, delta, cursor3D, isHovering) => {
      uniforms.uTime.value = time;
      uniforms.uCursor.value.copy(cursor3D);
      uniforms.uCursorActive.value = isHovering ? 1.0 : 0.0;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
