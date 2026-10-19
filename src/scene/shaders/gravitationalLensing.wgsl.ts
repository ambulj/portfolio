// src/scene/shaders/gravitationalLensing.wgsl.ts — WGSL Compute Shader for 32,768 Cyber Particles

export const GRAVITATIONAL_LENSING_WGSL = /* wgsl */ `
struct Particle {
  pos : vec4<f32>,
  vel : vec4<f32>,
};

struct SimParams {
  cursorPos    : vec4<f32>, // x, y, z, active (1.0 or 0.0)
  deltaTime    : f32,
  gravityConst : f32,
  damping      : f32,
  sphereRadius : f32,
};

@group(0) @binding(0) var<storage, read>       particlesSrc : array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesDst : array<Particle>;
@group(0) @binding(2) var<uniform>             params       : SimParams;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let index = global_id.x;
  if (index >= arrayLength(&particlesSrc)) {
    return;
  }

  var p = particlesSrc[index];
  var pos = p.pos.xyz;
  var vel = p.vel.xyz;

  // 1. Spherical Restoring Force (pulls particles gently toward orbital shell R)
  let distToCenter = length(pos);
  let normal = normalize(pos);
  let radialError = distToCenter - params.sphereRadius;
  let restoringForce = -normal * radialError * 1.8;

  // 2. Swirling Orbital Velocity around Y axis
  let orbitDir = normalize(vec3<f32>(-pos.z, 0.0, pos.x));
  let orbitForce = orbitDir * 0.45;

  var totalForce = restoringForce + orbitForce;

  // 3. Gravitational Lensing towards mouse cursor if active
  if (params.cursorPos.w > 0.5) {
    let toCursor = params.cursorPos.xyz - pos;
    let distCursor = length(toCursor);

    if (distCursor > 0.1 && distCursor < 6.0) {
      let dirCursor = normalize(toCursor);
      // Inverse-square attraction with soft core
      let pullStrength = params.gravityConst / (distCursor * distCursor + 0.25);
      
      // Repulsion inside immediate radius (lensing bubble)
      var lensAccel = dirCursor * pullStrength;
      if (distCursor < 0.8) {
        lensAccel = -dirCursor * (0.8 - distCursor) * 8.0;
      }
      totalForce += lensAccel;
    }
  }

  // Velocity integration & damping
  vel = (vel + totalForce * params.deltaTime) * params.damping;
  pos = pos + vel * params.deltaTime;

  // Store updated particle in destination buffer
  particlesDst[index].pos = vec4<f32>(pos, p.pos.w);
  particlesDst[index].vel = vec4<f32>(vel, p.vel.w);
}
`;
