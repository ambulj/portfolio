// src/scene/globe/GlobeSphere.ts — 2,400-point Fibonacci sphere & telemetry grid lines

import * as THREE from 'three';

export interface GlobeSphereInstance {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createGlobeSphere(radius: number = 4.2): GlobeSphereInstance {
  const group = new THREE.Group();

  // 1. Fibonacci Sphere Dot Distribution (2,400 points)
  const dotCount = 2400;
  const positions = new Float32Array(dotCount * 3);
  const alphas = new Float32Array(dotCount);

  // Golden ratio angle
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < dotCount; i++) {
    const y = 1 - (i / (dotCount - 1)) * 2; // From 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    positions[i * 3] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;

    // Attenuate alpha near poles for high-tech telemetry focus
    alphas[i] = 0.35 + (1 - Math.abs(y)) * 0.45;
  }

  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dotGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

  // Custom vertex/fragment shader material or points material with alpha blending
  const dotMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(0x00f0ff),
    size: 0.045,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const dotMesh = new THREE.Points(dotGeometry, dotMaterial);
  group.add(dotMesh);

  // 2. Telemetry Latitude / Longitude Wireframe Rings
  const ringsGroup = new THREE.Group();
  const ringMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x112233),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const latitudes = [-60, -30, 0, 30, 60];
  const ringGeometries: THREE.BufferGeometry[] = [];

  latitudes.forEach((latDeg) => {
    const latRad = (latDeg * Math.PI) / 180;
    const ringRadius = radius * Math.cos(latRad);
    const ringY = radius * Math.sin(latRad);

    const segments = 64;
    const ringPositions = new Float32Array((segments + 1) * 3);

    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      ringPositions[j * 3] = Math.cos(angle) * ringRadius;
      ringPositions[j * 3 + 1] = ringY;
      ringPositions[j * 3 + 2] = Math.sin(angle) * ringRadius;
    }

    const ringGeom = new THREE.BufferGeometry();
    ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringGeometries.push(ringGeom);

    const ringLine = new THREE.Line(ringGeom, ringMaterial);
    ringsGroup.add(ringLine);
  });

  // Longitude Meridians (0, 60, 120, 180, 240, 300 degrees)
  const longitudes = [0, 60, 120];
  longitudes.forEach((lonDeg) => {
    const lonRad = (lonDeg * Math.PI) / 180;
    const segments = 64;
    const meridianPositions = new Float32Array((segments + 1) * 3);

    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const x = Math.sin(angle) * Math.cos(lonRad) * radius;
      const y = Math.cos(angle) * radius;
      const z = Math.sin(angle) * Math.sin(lonRad) * radius;

      meridianPositions[j * 3] = x;
      meridianPositions[j * 3 + 1] = y;
      meridianPositions[j * 3 + 2] = z;
    }

    const meridianGeom = new THREE.BufferGeometry();
    meridianGeom.setAttribute('position', new THREE.BufferAttribute(meridianPositions, 3));
    ringGeometries.push(meridianGeom);

    const meridianLine = new THREE.Line(meridianGeom, ringMaterial);
    ringsGroup.add(meridianLine);
  });

  group.add(ringsGroup);

  return {
    group,
    update: (time: number) => {
      // Gentle pulse on points opacity
      dotMaterial.opacity = 0.6 + Math.sin(time * 1.5) * 0.08;
    },
    dispose: () => {
      dotGeometry.dispose();
      dotMaterial.dispose();
      ringGeometries.forEach((g) => g.dispose());
      ringMaterial.dispose();
    },
  };
}
