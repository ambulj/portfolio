// src/scene/globe/NodeTopology.ts — Global Cybersecurity & Case Study Node Markers

import * as THREE from 'three';
import { NodeTelemetry } from '../types';

export interface NodeMeshEntity {
  telemetry: NodeTelemetry;
  coreMesh: THREE.Mesh;
  pulseRing: THREE.Mesh;
  hitBox: THREE.Mesh;
}

export interface NodeTopologyInstance {
  group: THREE.Group;
  nodes: NodeMeshEntity[];
  update: (time: number) => void;
  dispose: () => void;
}

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export const CYBER_NODES: Omit<NodeTelemetry, 'position'>[] = [
  {
    id: 'inferyx-hub',
    label: 'INFERYX STUDIO',
    slug: 'inferyx',
    role: 'Automated ML & Drift Engine',
    lat: 29.8543,
    lon: 77.8880,
    anomalyScore: 0.12,
    status: 'NOMINAL',
    protocol: 'WASM LOCAL EVAL',
  },
  {
    id: 'aegisz-zk',
    label: 'AEGIS-Z GATEWAY',
    slug: 'aegisz',
    role: 'Zero-Knowledge PII Masking',
    lat: 50.1109,
    lon: 8.6821,
    anomalyScore: 0.28,
    status: 'NOMINAL',
    protocol: 'ZK-SNARK / ED25519',
  },
  {
    id: 'orgmind-kg',
    label: 'ORGMIND KG CORE',
    slug: 'orgmind',
    role: 'Enterprise Knowledge Graph',
    lat: 38.9072,
    lon: -77.0369,
    anomalyScore: 0.45,
    status: 'WARNING',
    protocol: 'GRAPH-RAG PIPELINE',
  },
  {
    id: 'threat-soc',
    label: 'SOC DEFENSE SENTINEL',
    slug: 'threat-detection',
    role: 'Hybrid Network Threat Classifier',
    lat: 37.7749,
    lon: -122.4194,
    anomalyScore: 0.88,
    status: 'CRITICAL',
    protocol: 'ZEEK / NETFLOW GBDT',
  },
  {
    id: 'roadsaarthi',
    label: 'ROADSAARTHI EDGE',
    slug: 'roadsaarthi',
    role: 'Spatial Stream Anomaly Hotspot',
    lat: 12.9716,
    lon: 77.5946,
    anomalyScore: 0.35,
    status: 'WARNING',
    protocol: 'INDEPENDENT PROTOTYPE',
  },
  {
    id: 'edge-tokyo',
    label: 'APAC TELEMETRY RELAY',
    slug: 'inferyx',
    role: 'APAC Edge Inference Collector',
    lat: 35.6762,
    lon: 139.6503,
    anomalyScore: 0.08,
    status: 'NOMINAL',
    protocol: 'CLOUDFLARE EDGE WORKER',
  },
];

export function createNodeTopology(radius: number = 4.2): NodeTopologyInstance {
  const group = new THREE.Group();
  const entities: NodeMeshEntity[] = [];

  const coreGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const ringGeometry = new THREE.RingGeometry(0.12, 0.16, 32);
  const hitBoxGeometry = new THREE.SphereGeometry(0.35, 8, 8);

  const materialsToDispose: THREE.Material[] = [];

  CYBER_NODES.forEach((nodeData) => {
    const pos = latLonToVector3(nodeData.lat, nodeData.lon, radius);
    const normal = pos.clone().normalize();

    // Color based on status
    let baseColor = 0x00f0ff;
    if (nodeData.status === 'CRITICAL') baseColor = 0xff3b30;
    else if (nodeData.status === 'WARNING') baseColor = 0xffb800;

    // 1. Core Pip Mesh
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: baseColor,
      depthTest: true,
    });
    materialsToDispose.push(coreMaterial);

    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.copy(pos);
    group.add(coreMesh);

    // 2. Tangent Pulse Ring
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materialsToDispose.push(ringMaterial);

    const pulseRing = new THREE.Mesh(ringGeometry, ringMaterial);
    pulseRing.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.01)));
    pulseRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    group.add(pulseRing);

    // 3. Invisible Hitbox for Raycaster
    const hitBoxMaterial = new THREE.MeshBasicMaterial({
      visible: false,
    });
    materialsToDispose.push(hitBoxMaterial);

    const hitBox = new THREE.Mesh(hitBoxGeometry, hitBoxMaterial);
    hitBox.position.copy(pos);
    hitBox.userData = {
      nodeId: nodeData.id,
      slug: nodeData.slug,
    };
    group.add(hitBox);

    const fullTelemetry: NodeTelemetry = {
      ...nodeData,
      position: [pos.x, pos.y, pos.z],
    };

    entities.push({
      telemetry: fullTelemetry,
      coreMesh,
      pulseRing,
      hitBox,
    });
  });

  return {
    group,
    nodes: entities,
    update: (time: number) => {
      entities.forEach((entity, idx) => {
        // Individualized pulse phase
        const phase = time * 2.2 + idx * 1.1;
        const scale = 1.0 + (Math.sin(phase) * 0.5 + 0.5) * 0.8;
        entity.pulseRing.scale.set(scale, scale, 1);
        
        const mat = entity.pulseRing.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.8 - (scale - 1.0) * 0.8;
      });
    },
    dispose: () => {
      coreGeometry.dispose();
      ringGeometry.dispose();
      hitBoxGeometry.dispose();
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
