// src/scene/globe/NodeRaycaster.ts — 3D to 2D Raycasting and Screen Projection

import * as THREE from 'three';
import { NodeMeshEntity } from './NodeTopology';
import { ScreenTooltipData } from '../types';

export interface NodeRaycasterInstance {
  checkIntersection: (
    clientX: number,
    clientY: number,
    canvasRect: DOMRect,
    camera: THREE.PerspectiveCamera,
    globeGroup: THREE.Group
  ) => ScreenTooltipData | null;
  dispose: () => void;
}

export function createNodeRaycaster(nodeEntities: NodeMeshEntity[]): NodeRaycasterInstance {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const hitBoxes = nodeEntities.map((e) => e.hitBox);

  return {
    checkIntersection: (clientX, clientY, canvasRect, camera, globeGroup) => {
      // Calculate Normalized Device Coordinates (NDC) relative to canvas
      mouse.x = ((clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
      mouse.y = -((clientY - canvasRect.top) / canvasRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitBoxes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const matchedEntity = nodeEntities.find((e) => e.hitBox === hitMesh);

        if (matchedEntity) {
          // Project 3D node world position to 2D screen coordinates
          const worldPos = new THREE.Vector3();
          matchedEntity.coreMesh.getWorldPosition(worldPos);

          // Check if node is on visible side facing camera
          const camDir = camera.position.clone().sub(worldPos).normalize();
          const nodeNormal = worldPos.clone().normalize();
          const dot = camDir.dot(nodeNormal);

          if (dot > 0.05) {
            const projected = worldPos.clone().project(camera);
            const screenX = ((projected.x + 1) * canvasRect.width) / 2;
            const screenY = ((-projected.y + 1) * canvasRect.height) / 2;

            return {
              node: matchedEntity.telemetry,
              screenX,
              screenY,
              visible: true,
            };
          }
        }
      }

      return null;
    },
    dispose: () => {
      // Clean up internal references
    },
  };
}
