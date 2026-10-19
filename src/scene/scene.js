import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  LineDashedMaterial,
  Mesh,
  RingGeometry,
  MeshBasicMaterial,
  Vector3,
  CatmullRomCurve3
} from 'three';

// Constellation 3D scene engine (Tier 1 & Tier 2)
export function initConstellation(container, graphData, options = {}) {
  if (!container) return null;

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new Scene();

  // Low FOV (~28°) for orthographic drafted feel
  const camera = new PerspectiveCamera(28, width / height, 0.1, 100);
  camera.position.set(0, 0, 18);

  let renderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    console.warn('WebGL2 not available, falling back to Tier 0');
    return null;
  }

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let isTier1 = false;
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);
  renderer.domElement.classList.add('constellation-canvas');
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Overlay container for HTML node labels
  const labelOverlay = document.createElement('div');
  labelOverlay.className = 'scene-label-overlay';
  container.appendChild(labelOverlay);

  // Read CSS custom property colours
  const computedStyle = getComputedStyle(document.documentElement);
  const getCssVar = (name, fallback) => {
    const val = computedStyle.getPropertyValue(name).trim();
    return val || fallback;
  };

  const inkColor = getCssVar('--ink', '#1E2528');
  const ruleColor = getCssVar('--rule', '#C3CCC7');
  const markColor = getCssVar('--mark', '#F2C500');

  // Build nodes
  const nodeMeshes = [];
  const nodeMap = new Map();
  const labelElements = [];

  const ringGeomLarge = new RingGeometry(0.18, 0.28, 32);
  const ringGeomSmall = new RingGeometry(0.1, 0.18, 24);

  const activeSlug = options.activeSlug || 'inferyx';

  graphData.nodes.forEach(n => {
    const isLarge = n.size === 'large';
    const isActive = n.slug === activeSlug;
    const geom = isLarge ? ringGeomLarge : ringGeomSmall;

    const mat = new MeshBasicMaterial({
      color: isActive ? markColor : inkColor,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new Mesh(geom, mat);
    mesh.position.set(n.position.x, n.position.y, n.position.z);
    scene.add(mesh);

    nodeMap.set(n.id, { mesh, data: n });
    nodeMeshes.push(mesh);

    // HTML label element
    const label = document.createElement('span');
    label.className = `scene-node-label ${isLarge ? 'large' : 'small'} ${isActive ? 'active' : ''}`;
    label.textContent = n.label;
    labelOverlay.appendChild(label);

    labelElements.push({ label, position: n.position });
  });

  // Build edges
  const solidPositions = [];
  const dashedPositions = [];

  graphData.edges.forEach(e => {
    const s = nodeMap.get(e.source);
    const t = nodeMap.get(e.target);
    if (!s || !t) return;

    const list = e.type === 'tech' ? dashedPositions : solidPositions;
    list.push(
      s.mesh.position.x, s.mesh.position.y, s.mesh.position.z,
      t.mesh.position.x, t.mesh.position.y, t.mesh.position.z
    );
  });

  if (solidPositions.length > 0) {
    const geom = new BufferGeometry();
    geom.setAttribute('position', new Float32BufferAttribute(solidPositions, 3));
    const mat = new LineBasicMaterial({ color: ruleColor, transparent: true, opacity: 0.7 });
    const lines = new LineSegments(geom, mat);
    scene.add(lines);
  }

  if (dashedPositions.length > 0) {
    const geom = new BufferGeometry();
    geom.setAttribute('position', new Float32BufferAttribute(dashedPositions, 3));
    const mat = new LineDashedMaterial({
      color: ruleColor,
      dashSize: 0.2,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.6
    });
    const dashedLines = new LineSegments(geom, mat);
    dashedLines.computeLineDistances();
    scene.add(dashedLines);
  }

  // Camera spline path through nodes: Inferyx -> AegisZ -> OrgMind -> Threat -> RoadSaarthi -> Lab
  const splinePoints = [
    new Vector3(0, 0, 18),
    new Vector3(-4, 1.5, 14),
    new Vector3(4, 1, 10),
    new Vector3(-2.5, -2, 7),
    new Vector3(3.5, -2, 4),
    new Vector3(7, 3, 2)
  ];
  const curve = new CatmullRomCurve3(splinePoints);

  // Mouse tilt tracking (<= 2.5 deg)
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  const onMouseMove = (evt) => {
    if (isTier1) return;
    const nx = (evt.clientX / window.innerWidth) * 2 - 1;
    const ny = (evt.clientY / window.innerHeight) * 2 - 1;
    targetTiltX = ny * (2.5 * Math.PI / 180);
    targetTiltY = nx * (2.5 * Math.PI / 180);
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Frame timing check for Tier 1 (§4.5: first 90 frames median > 33ms)
  let frameCount = 0;
  const frameTimes = [];
  let lastTime = performance.now();
  let lowFpsCount = 0;
  let destroyed = false;

  const tempVec = new Vector3();

  function updateLabels() {
    const halfW = width / 2;
    const halfH = height / 2;

    labelElements.forEach(item => {
      tempVec.set(item.position.x, item.position.y, item.position.z);
      tempVec.project(camera);

      // Check if in front of camera
      if (tempVec.z > 1) {
        item.label.style.display = 'none';
        return;
      }

      item.label.style.display = 'block';
      const x = (tempVec.x * halfW) + halfW;
      const y = -(tempVec.y * halfH) + halfH;
      item.label.style.left = `${Math.round(x)}px`;
      item.label.style.top = `${Math.round(y)}px`;
    });
  }

  function render(time) {
    if (destroyed) return;

    const delta = time - lastTime;
    lastTime = time;

    // Performance profiling for first 90 frames
    if (frameCount < 90) {
      frameTimes.push(delta);
      frameCount++;
      if (frameCount === 90) {
        frameTimes.sort((a, b) => a - b);
        const median = frameTimes[Math.floor(frameTimes.length / 2)];
        if (median > 33) {
          isTier1 = true;
          renderer.setPixelRatio(1);
          console.info('Switching to Tier 1: median frame time', median.toFixed(1), 'ms');
        }
      }
    } else {
      // Long-running FPS monitor: if < 24 fps (delta > 41ms) for 3s
      if (delta > 41) {
        lowFpsCount++;
        if (lowFpsCount > 70) {
          window.dispatchEvent(new CustomEvent('constellation:low-fps'));
          lowFpsCount = 0;
        }
      } else {
        lowFpsCount = Math.max(0, lowFpsCount - 1);
      }
    }

    // Camera tilt damping
    if (!isTier1) {
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;
      camera.rotation.x = currentTiltX;
      camera.rotation.y = currentTiltY;
    }

    renderer.render(scene, camera);
    updateLabels();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  const onResize = () => {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', onResize, { passive: true });

  return {
    destroy: () => {
      destroyed = true;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
