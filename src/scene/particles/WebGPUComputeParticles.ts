// src/scene/particles/WebGPUComputeParticles.ts — WebGPU Compute Pipeline & Buffer Management

import * as THREE from 'three';
import { GRAVITATIONAL_LENSING_WGSL } from '../shaders/gravitationalLensing.wgsl';

export interface WebGPUParticlesInstance {
  points: THREE.Points;
  update: (time: number, delta: number, cursor3D: THREE.Vector3, isHovering: boolean) => void;
  dispose: () => void;
}

export async function createWebGPUComputeParticles(
  count: number = 32768,
  radius: number = 4.8
): Promise<WebGPUParticlesInstance | null> {
  if (typeof window === 'undefined' || !('gpu' in navigator)) {
    return null;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    const device = await adapter.requestDevice();

    // Initialize particle data (pos: vec4, vel: vec4 -> 8 floats per particle)
    const particleData = new Float32Array(count * 8);
    const initialPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius + (Math.random() - 0.5) * 1.6;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // pos: x, y, z, life
      particleData[i * 8 + 0] = x;
      particleData[i * 8 + 1] = y;
      particleData[i * 8 + 2] = z;
      particleData[i * 8 + 3] = 1.0;

      // vel: vx, vy, vz, mass
      particleData[i * 8 + 4] = (Math.random() - 0.5) * 0.1;
      particleData[i * 8 + 5] = (Math.random() - 0.5) * 0.1;
      particleData[i * 8 + 6] = (Math.random() - 0.5) * 0.1;
      particleData[i * 8 + 7] = 1.0;

      initialPositions[i * 3 + 0] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
    }

    // Ping-pong storage buffers
    const bufferSize = particleData.byteLength;
    const bufferA = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });
    const bufferB = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });

    device.queue.writeBuffer(bufferA, 0, particleData);
    device.queue.writeBuffer(bufferB, 0, particleData);

    // Uniform buffer (cursorPos: vec4, deltaTime: f32, gravityConst: f32, damping: f32, sphereRadius: f32)
    const simParamsBuffer = device.createBuffer({
      size: 32, // 8 floats = 32 bytes
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Compute Shader Module & Pipeline
    const shaderModule = device.createShaderModule({
      code: GRAVITATIONAL_LENSING_WGSL,
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    const computePipeline = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    const bindGroupAtoB = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: bufferA } },
        { binding: 1, resource: { buffer: bufferB } },
        { binding: 2, resource: { buffer: simParamsBuffer } },
      ],
    });

    const bindGroupBtoA = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: bufferB } },
        { binding: 1, resource: { buffer: bufferA } },
        { binding: 2, resource: { buffer: simParamsBuffer } },
      ],
    });

    // Staging buffer to read back positions for Three.js rendering
    const stagingBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    let isPing = true;
    const simParamsData = new Float32Array(8);

    // Three.js Points representation
    const geometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(initialPositions, 3);
    geometry.setAttribute('position', posAttribute);

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(0x00f0ff),
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);

    return {
      points,
      update: (time, delta, cursor3D, isHovering) => {
        // Update simulation uniforms
        simParamsData[0] = cursor3D.x;
        simParamsData[1] = cursor3D.y;
        simParamsData[2] = cursor3D.z;
        simParamsData[3] = isHovering ? 1.0 : 0.0;
        simParamsData[4] = Math.min(delta, 0.033); // deltaTime
        simParamsData[5] = 12.0;                    // gravityConst
        simParamsData[6] = 0.94;                    // damping
        simParamsData[7] = radius;                  // sphereRadius

        device.queue.writeBuffer(simParamsBuffer, 0, simParamsData);

        // Dispatch compute pass
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, isPing ? bindGroupAtoB : bindGroupBtoA);
        passEncoder.dispatchWorkgroups(Math.ceil(count / 64));
        passEncoder.end();

        // Swap ping-pong
        isPing = !isPing;
        device.queue.submit([commandEncoder.finish()]);

        // Subtle CPU/GPU rotation to ensure visual dynamism
        points.rotation.y = time * 0.05;
      },
      dispose: () => {
        bufferA.destroy();
        bufferB.destroy();
        simParamsBuffer.destroy();
        stagingBuffer.destroy();
        geometry.dispose();
        material.dispose();
        device.destroy();
      },
    };
  } catch (err) {
    console.warn('[WebGPUCompute] Failed initializing WebGPU compute pipeline:', err);
    return null;
  }
}
