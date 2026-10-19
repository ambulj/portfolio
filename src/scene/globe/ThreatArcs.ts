// src/scene/globe/ThreatArcs.ts — Ballistic Great-Circle Cyber Attack Trajectories

import * as THREE from 'three';
import { NodeMeshEntity } from './NodeTopology';

export interface ThreatArcConfig {
  sourceId: string;
  targetId: string;
  color: number;
  speed: number;
  heightScale: number;
}

export interface ThreatArcsInstance {
  group: THREE.Group;
  update: (delta: number) => void;
  dispose: () => void;
}

const ARC_CONFIGS: ThreatArcConfig[] = [
  {
    sourceId: 'threat-soc',
    targetId: 'inferyx-hub',
    color: 0xff3b30, // Threat Red
    speed: 0.35,
    heightScale: 1.35,
  },
  {
    sourceId: 'edge-tokyo',
    targetId: 'aegisz-zk',
    color: 0x00f0ff, // Cyber Cyan
    speed: 0.42,
    heightScale: 1.25,
  },
  {
    sourceId: 'roadsaarthi',
    targetId: 'orgmind-kg',
    color: 0xffb800, // Amber
    speed: 0.28,
    heightScale: 1.45,
  },
  {
    sourceId: 'aegisz-zk',
    targetId: 'inferyx-hub',
    color: 0x00f0ff, // Cyan
    speed: 0.5,
    heightScale: 1.15,
  },
];

interface AnimatedArc {
  curve: THREE.QuadraticBezierCurve3;
  lineMesh: THREE.Line;
  pulseMesh: THREE.Mesh;
  impactMesh: THREE.Mesh;
  progress: number;
  speed: number;
}

export function createThreatArcs(nodes: NodeMeshEntity[], radius: number = 4.2): ThreatArcsInstance {
  const group = new THREE.Group();
  const animatedArcs: AnimatedArc[] = [];

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  const pulseGeometry = new THREE.SphereGeometry(0.06, 8, 8);
  geometriesToDispose.push(pulseGeometry);

  const impactGeometry = new THREE.RingGeometry(0.05, 0.1, 16);
  geometriesToDispose.push(impactGeometry);

  ARC_CONFIGS.forEach((cfg, index) => {
    const sourceNode = nodes.find((n) => n.telemetry.id === cfg.sourceId);
    const targetNode = nodes.find((n) => n.telemetry.id === cfg.targetId);

    if (!sourceNode || !targetNode) return;

    const p0 = sourceNode.coreMesh.position.clone();
    const p1 = targetNode.coreMesh.position.clone();

    // Calculate angular distance and elevated control point
    const midPoint = p0.clone().add(p1).multiplyScalar(0.5);
    const distance = p0.distanceTo(p1);
    const elevation = radius + distance * 0.38 * cfg.heightScale;
    const pCtrl = midPoint.normalize().multiplyScalar(elevation);

    // 3D Quadratic Bezier Spline
    const curve = new THREE.QuadraticBezierCurve3(p0, pCtrl, p1);
    const points = curve.getPoints(50);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    geometriesToDispose.push(lineGeometry);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materialsToDispose.push(lineMaterial);

    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
    group.add(lineMesh);

    // 2. Animated Pulse Bead Mesh
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(pulseMaterial);

    const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulseMesh.position.copy(p0);
    group.add(pulseMesh);

    // 3. Impact Ring at destination
    const impactMaterial = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(impactMaterial);

    const impactMesh = new THREE.Mesh(impactGeometry, impactMaterial);
    const normal = p1.clone().normalize();
    impactMesh.position.copy(p1.clone().add(normal.clone().multiplyScalar(0.02)));
    impactMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    group.add(impactMesh);

    animatedArcs.push({
      curve,
      lineMesh,
      pulseMesh,
      impactMesh,
      progress: (index * 0.25) % 1.0, // Stagger initial phase
      speed: cfg.speed,
    });
  });

  return {
    group,
    update: (delta: number) => {
      animatedArcs.forEach((arc) => {
        arc.progress = (arc.progress + delta * arc.speed) % 1.0;

        // Position pulse bead along curve
        const currentPos = arc.curve.getPoint(arc.progress);
        arc.pulseMesh.position.copy(currentPos);

        // Scale pulse bead smoothly
        const beadScale = 0.8 + Math.sin(arc.progress * Math.PI) * 0.5;
        arc.pulseMesh.scale.set(beadScale, beadScale, beadScale);

        // Destination impact ripple
        if (arc.progress > 0.88) {
          const impactFactor = (arc.progress - 0.88) / 0.12; // 0 to 1
          const scale = 1.0 + impactFactor * 2.5;
          arc.impactMesh.scale.set(scale, scale, 1);
          (arc.impactMesh.material as THREE.MeshBasicMaterial).opacity = (1.0 - impactFactor) * 0.8;
        } else {
          (arc.impactMesh.material as THREE.MeshBasicMaterial).opacity = 0.0;
        }
      });
    },
    dispose: () => {
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
