import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

// RAF timestamps belong to the frame's clock. Do not seed this clock with performance.now():
// the first callback can carry an earlier timestamp after expensive scene initialization.
export function cityFrameDelta(now, previous) {
  if (!Number.isFinite(now) || !Number.isFinite(previous)) return 0;
  return Math.max(0, Math.min((now - previous) / 1000, 0.05));
}

export function cityMotionPhase(offset, elapsed, speed, length = 1) {
  const start = Number.isFinite(offset) ? offset : 0;
  let phase = start;
  if (Number.isFinite(elapsed) && Number.isFinite(speed) && Number.isFinite(length) && length > 0) {
    const travelled = elapsed * speed / length;
    if (Number.isFinite(travelled) && Number.isFinite(start + travelled)) phase += travelled;
  }
  // JavaScript remainder keeps the dividend's sign; Three's arc-length lookup requires [0, 1].
  const remainder = phase % 1;
  return remainder < 0 ? (remainder + 1) % 1 : remainder === 0 ? 0 : remainder;
}

/* Original, procedural miniature. No downloaded models or image assets. */
export function createCity({ canvas, onSelect = () => {}, onPersona = () => {}, onReady = () => {}, onError = () => {} }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    onError(error);
    return { select() {}, focusPersona() {}, reset() {}, setNight() {}, setPaused() {}, zoom() {}, resize() {}, dispose() {}, getSceneAnchor() { return null; } };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-24, 24, 14, -14, 0.1, 180);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 5.8;
  controls.maxPolarAngle = Math.PI / 2.85;
  controls.minAzimuthAngle = -Math.PI / 4;
  controls.maxAzimuthAngle = Math.PI * 0.62;
  controls.minZoom = 0.75;
  controls.maxZoom = 2.25;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.75;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  const palette = {
    cream: '#F4F1E7', limestone: '#D8CCB3', limestoneDark: '#B4B096',
    sand: '#E8DDC3', road: '#B2B5A6', jade: '#37796A', teal: '#164D49',
    coral: '#D77A5C', coralDark: '#AC5945', ochre: '#C39A56', green: '#779467',
    greenLight: '#9EB287', mint: '#B4CAB0', water: '#88BBB4', waterDeep: '#609D99',
    glass: '#6C9B94', navy: '#294E50', white: '#FFFBEF', bark: '#8A7860',
  };
  const materials = new Map();
  const geometries = new Set();
  const textures = new Set();
  const material = (name, color, extra = {}) => {
    if (!materials.has(name)) materials.set(name, new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra }));
    return materials.get(name);
  };
  const mat = {};
  for (const [name, color] of Object.entries(palette)) mat[name] = material(name, color);
  mat.glass.roughness = 0.3;
  mat.glass.metalness = 0.12;
  mat.window = material('window', '#698D86', { roughness: 0.35, emissive: '#FFD79A', emissiveIntensity: 0 });
  mat.light = material('light', '#FFF3CE', { emissive: '#FFD291', emissiveIntensity: 0.25 });
  mat.gold = material('gold', '#D7AD68', { metalness: 0.2 });
  mat.path = material('path', '#DADAC8');
  mat.foliageDark = material('foliageDark', '#4C7760');
  mat.foliageMid = material('foliageMid', '#6B926B');
  mat.foliageLight = material('foliageLight', '#93A976');
  mat.cloud = material('cloud', '#FFFCF1', { roughness: 1, transparent: true, opacity: 0.92 });
  mat.waterShallow = material('waterShallow', '#ABCAC0');
  mat.waterEdge = material('waterEdge', '#CCDDD0');
  mat.waterOuter = material('waterOuter', '#E3E9DC');
  mat.pond = material('pond', '#629C91', { roughness: 0.25, metalness: 0.1 });
  mat.skinWarm = material('skinWarm', '#D5AB85');
  mat.skinLight = material('skinLight', '#EBC7A2');
  mat.skinDeep = material('skinDeep', '#B98262');
  mat.hair = material('hair', '#514A40');
  mat.hairBrown = material('hairBrown', '#82705B');
  mat.hairSilver = material('hairSilver', '#CACEC1');
  mat.denim = material('denim', '#52787C');
  mat.lilac = material('lilac', '#A79B9B');
  const addGeo = (g) => { geometries.add(g); return g; };
  const boxGeo = addGeo(new THREE.BoxGeometry(1, 1, 1));
  const cylinderGeo = addGeo(new THREE.CylinderGeometry(1, 1, 1, 10));
  const sphereGeo = addGeo(new THREE.IcosahedronGeometry(1, 0));
  const roundGeo = addGeo(new THREE.IcosahedronGeometry(1, 1));
  const coneGeo = addGeo(new THREE.ConeGeometry(1, 1, 8));
  const circleGeo = addGeo(new THREE.CircleGeometry(1, 64));
  const torusGeo = addGeo(new THREE.TorusGeometry(1, 0.028, 5, 64));

  const mesh = (parent, geo, m, position, scale, shadow = true) => {
    const object = new THREE.Mesh(geo, m);
    if (position) object.position.set(...position);
    if (scale) object.scale.set(...scale);
    object.castShadow = shadow;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (parent, x, y, z, w, h, d, m, shadow = true) => mesh(parent, boxGeo, m, [x, y, z], [w, h, d], shadow);
  const cylinder = (parent, x, y, z, radius, height, m, shadow = true) => mesh(parent, cylinderGeo, m, [x, y, z], [radius, height, radius], shadow);
  const group = (parent, x = 0, y = 0, z = 0, rotation = 0) => {
    const object = new THREE.Group(); object.position.set(x, y, z); object.rotation.y = rotation; parent.add(object); return object;
  };
  const disk = (parent, x, y, z, radius, m) => {
    const object = mesh(parent, circleGeo, m, [x, y, z], [radius, radius, 1], false);
    object.rotation.x = -Math.PI / 2; return object;
  };
  const rand = (seed) => { const a = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return a - Math.floor(a); };
  const Y = 1.025;

  function roundedRectangle(w, h, r) {
    const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function sculptedIsland(radius, seed) {
    const points = Array.from({ length: 8 }, (_, i) => {
      const a = i * Math.PI / 4; const r = radius * (0.97 + rand(i + seed) * 0.06);
      return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
    });
    const s = new THREE.Shape();
    points.forEach((p, i) => {
      const previous = points[(i + 7) % 8]; const next = points[(i + 1) % 8];
      const start = p.clone().lerp(previous, 0.14), end = p.clone().lerp(next, 0.14);
      if (i === 0) s.moveTo(start.x, start.y); else s.lineTo(start.x, start.y);
      s.quadraticCurveTo(p.x, p.y, end.x, end.y);
    });
    s.closePath(); return s;
  }

  // The sea is a softly stepped, sculpted pool; its pale perimeter blends into the page.
  const waterRoot = group(scene, 0, 0, 0); waterRoot.scale.set(1.08, 1, 0.9);
  disk(waterRoot, 0, -0.105, 0, 30, mat.waterOuter);
  disk(waterRoot, 0, -0.085, 0, 27.5, mat.waterEdge);
  disk(waterRoot, 0, -0.065, 0, 25, mat.waterShallow);
  disk(waterRoot, 0, -0.045, 0, 23, mat.water);
  const foamMat = material('foam', '#E0EEE3', { transparent: true, opacity: 0.5, depthWrite: false });
  for (let i = 0; i < 26; i++) {
    const angle = rand(i + 150) * Math.PI * 2, radius = 13 + rand(i + 200) * 9;
    const wave = box(scene, Math.cos(angle) * radius, 0.005, Math.sin(angle) * radius, 0.45 + rand(i + 300) * 0.8, 0.015, 0.027, foamMat, false);
    wave.rotation.y = -0.12; // Deliberately quiet, graphic water texture.
  }

  const hemi = new THREE.HemisphereLight('#FFF9E8', '#7D9F8D', 2.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFF1D0', 4.3);
  sun.position.set(-19, 31, 15); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -23, right: 23, top: 23, bottom: -23, near: 1, far: 90 });
  sun.shadow.bias = -0.00045; sun.shadow.normalBias = 0.045; sun.shadow.radius = 3;
  sun.target.position.set(0, 0, -1); scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#C7E6E0', 0.9); fill.position.set(16, 15, -20); scene.add(fill);

  const districts = {
    buy: { id: 'buy', name: '安心買房', center: new THREE.Vector3(-6.9, 1, 3.25), color: palette.coral, rotation: 0.07 },
    sell: { id: 'sell', name: '從容賣房', center: new THREE.Vector3(6.3, 1, 3.8), color: palette.ochre, rotation: -0.05 },
    legacy: { id: 'legacy', name: '好好傳承', center: new THREE.Vector3(0.05, 1, -7.5), color: palette.jade, rotation: 0.08 },
  };
  const carAnimations = [], boatAnimations = [], cloudAnimations = [], labels = [];
  const citizenAnimations = [], citizenBatches = [], personaLabels = [], personaPickTargets = [];
  const personas = {
    'first-home': { id: 'first-home', districtId: 'buy', name: '首購小安', color: palette.coral },
    'move-home': { id: 'move-home', districtId: 'buy', name: '換屋阿成', color: palette.teal },
    seller: { id: 'seller', districtId: 'sell', name: '賣屋美玲', color: palette.ochre },
    'legacy-family': { id: 'legacy-family', districtId: 'legacy', name: '傳承一家', color: palette.jade },
  };
  const dynamicRoots = [];
  const markDynamic = (object) => { object.userData.dynamic = true; dynamicRoots.push(object); return object; };

  function tree(parent, x, z, size = 1, kind = 0, seed = 1) {
    const root = group(parent, x, Y, z);
    cylinder(root, 0, size * 0.46, 0, size * 0.09, size * 0.92, mat.bark);
    if (kind === 1) {
      mesh(root, coneGeo, mat.foliageMid, [0, size * 1.22, 0], [size * 0.46, size * 1.7, size * 0.46]);
      mesh(root, coneGeo, mat.foliageLight, [0, size * 1.62, 0], [size * 0.32, size * 1.15, size * 0.32]);
    } else {
      mesh(root, roundGeo, mat.foliageMid, [0, size * 1.32, 0], [size * 0.58, size * 0.62, size * 0.54]);
      mesh(root, sphereGeo, mat.foliageLight, [size * 0.25, size * 1.52, size * 0.08], [size * 0.41, size * 0.42, size * 0.39]);
      if (size > 1.1) mesh(root, roundGeo, mat.foliageDark, [-size * 0.35, size * 1.2, -size * 0.12], [size * 0.48, size * 0.5, size * 0.45]);
    }
    root.rotation.y = seed * 2.6;
    cylinder(root, 0, 0.045, 0, size * 0.52, 0.09, mat.greenLight, false);
    return root;
  }
  function shrub(parent, x, z, size = 0.35) {
    mesh(parent, roundGeo, mat.foliageMid, [x, Y + size * 0.45, z], [size, size * 0.65, size], false);
  }
  function planter(parent, x, z, length = 1.1, rotation = 0) {
    const p = group(parent, x, Y, z, rotation);
    box(p, 0, 0.1, 0, length, 0.2, 0.4, mat.limestone);
    for (let x2 = -length / 2 + 0.2; x2 < length / 2; x2 += 0.32) shrub(p, x2, 0, 0.22);
    // Shrubs use ground coordinates elsewhere; put these back into the planter.
    p.children.slice(1).forEach((child) => { child.position.y -= Y - 0.1; });
  }
  function bench(parent, x, z, rotation = 0) {
    const b = group(parent, x, Y, z, rotation);
    for (let i = 0; i < 3; i++) box(b, 0, 0.25, -0.12 + i * 0.12, 0.76, 0.045, 0.075, mat.ochre, false);
    for (const side of [-1, 1]) box(b, side * 0.28, 0.12, 0, 0.055, 0.24, 0.3, mat.teal, false);
    box(b, 0, 0.43, -0.18, 0.76, 0.16, 0.05, mat.ochre, false);
  }
  function streetlamp(parent, x, z, rotation = 0, height = 1.35) {
    const l = group(parent, x, Y, z, rotation);
    cylinder(l, 0, height / 2, 0, 0.025, height, mat.teal, false);
    cylinder(l, 0, 0.065, 0, 0.085, 0.13, mat.teal, false);
    box(l, 0.12, height, 0, 0.3, 0.035, 0.04, mat.teal, false);
    box(l, 0.24, height - 0.055, 0, 0.15, 0.07, 0.15, mat.light, false);
    box(l, 0.24, height, 0, 0.2, 0.025, 0.2, mat.teal, false);
  }
  function person(parent, x, z, color = mat.coral, height = 0.39, rotation = 0) {
    const p = group(parent, x, Y, z, rotation);
    cylinder(p, 0, height * 0.46, 0, height * 0.1, height * 0.4, color, false);
    mesh(p, roundGeo, mat.sand, [0, height * 0.82, 0], [height * 0.11, height * 0.13, height * 0.11], false);
    box(p, -height * 0.05, height * 0.16, 0.025, height * 0.06, height * 0.32, height * 0.07, mat.navy, false);
    box(p, height * 0.05, height * 0.16, -0.025, height * 0.06, height * 0.32, height * 0.07, mat.navy, false);
  }

  function walkingRoute(points) {
    return new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'catmullrom', 0.08);
  }
  function citizen(parent, options = {}) {
    const { height: h = 0.65, shirt = mat.jade, hair = mat.hair, skin = mat.skinWarm,
      route = null, offset = 0, speed = 0.24, x = 0, z = 0, rotation = 0,
      personaId = null, style = '', seated = false } = options;
    const root = markDynamic(group(parent, x, Y + 0.045, z, rotation));
    const body = group(root);
    const trousers = style === 'elder' ? mat.limestoneDark : mat.denim;
    box(body, 0, h * 0.59, 0, h * 0.3, h * 0.32, h * 0.19, shirt, false);
    cylinder(body, 0, h * 0.775, 0, h * 0.047, h * 0.08, skin, false);
    mesh(body, roundGeo, skin, [0, h * 0.88, 0.014], [h * 0.13, h * 0.15, h * 0.12], false);
    mesh(body, roundGeo, hair, [0, h * 0.963, -h * 0.025], [h * 0.14, h * 0.09, h * 0.125], false);
    if (style === 'bob') box(body, 0, h * 0.88, -h * 0.08, h * 0.27, h * 0.21, h * 0.13, hair, false);
    if (style === 'bun') mesh(body, roundGeo, hair, [0, h * 0.99, -h * 0.115], [h * 0.09, h * 0.085, h * 0.09], false);
    if (style === 'cap') {
      box(body, 0, h * 1.01, 0, h * 0.28, h * 0.055, h * 0.22, mat.ochre, false);
      box(body, 0, h * 0.985, h * 0.13, h * 0.25, h * 0.025, h * 0.14, mat.ochre, false);
    }
    if (style === 'glasses' || style === 'elder') {
      box(body, 0, h * 0.9, h * 0.12, h * 0.23, h * 0.035, h * 0.025, mat.teal, false);
    }
    const arms = [], legs = [], knees = [];
    for (const side of [-1, 1]) {
      const arm = group(body, side * h * 0.185, h * 0.71, 0);
      box(arm, 0, -h * 0.09, 0, h * 0.09, h * 0.19, h * 0.11, shirt, false);
      box(arm, 0, -h * 0.225, h * 0.018, h * 0.075, h * 0.13, h * 0.08, skin, false);
      arms.push(arm);
      const leg = group(body, side * h * 0.087, h * 0.43, 0);
      box(leg, 0, -h * 0.105, 0, h * 0.105, h * 0.21, h * 0.115, trousers, false);
      const knee = group(leg, 0, -h * 0.205, 0);
      box(knee, 0, -h * 0.095, 0, h * 0.093, h * 0.19, h * 0.105, trousers, false);
      box(knee, 0, -h * 0.195, h * 0.035, h * 0.115, h * 0.07, h * 0.18, mat.cream, false);
      legs.push(leg); knees.push(knee);
    }
    if (style === 'backpack') {
      box(body, 0, h * 0.59, -h * 0.16, h * 0.25, h * 0.28, h * 0.12, mat.ochre, false);
      for (const side of [-1, 1]) box(body, side * h * 0.1, h * 0.63, h * 0.1, h * 0.035, h * 0.25, h * 0.025, mat.ochre, false);
    }
    if (style === 'bun' || style === 'glasses') box(arms[1], h * 0.03, -h * 0.29, 0, h * 0.19, h * 0.2, h * 0.075, style === 'bun' ? mat.coral : mat.ochre, false);
    if (seated) {
      legs.forEach((leg) => { leg.rotation.x = -Math.PI / 2; });
      knees.forEach((knee) => { knee.rotation.x = Math.PI / 2; });
      arms.forEach((arm) => { arm.rotation.x = -0.6; });
    }
    if (personaId) {
      root.userData.personaId = personaId;
      // An invisible hit volume makes small people practical to select on touch screens.
      const hitMat = materials.get('person-hit') || new THREE.MeshBasicMaterial({ visible: false }); materials.set('person-hit', hitMat);
      const hit = mesh(root, roundGeo, hitMat, [0, h * 0.55, 0], [h * 0.42, h * 0.66, h * 0.42], false);
      hit.userData.personaId = personaId; hit.userData.hitVolume = true; personaPickTargets.push(hit);
    }
    const animation = { root, body, arms, legs, knees, height: h, route, offset, speed, seated, dog: null, phase: offset * Math.PI * 2 };
    citizenAnimations.push(animation);
    root.traverse((part) => { if (part.isMesh && !part.userData.hitVolume) part.userData.citizenPart = true; });
    if (route) { const start = route.getPointAt(cityMotionPhase(offset, 0, speed, route.getLength())); root.position.x = start.x; root.position.z = start.z; }
    return animation;
  }

  function personaLabel(persona, actor) {
    persona.actor = actor;
    const c = document.createElement('canvas'); c.width = 576; c.height = 184;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.shadowColor = 'rgba(17,57,47,.2)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#FFFBEF'; ctx.beginPath(); ctx.roundRect(10, 8, 556, 142, 38); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = persona.color; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = persona.color; ctx.beginPath(); ctx.arc(78, 78, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFBEF'; ctx.beginPath(); ctx.arc(78, 67, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(78, 89, 19, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#214C45'; ctx.font = '700 65px "Noto Sans TC", "Microsoft JhengHei", sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText(persona.name, 132, 81);
    ctx.fillStyle = persona.color; ctx.beginPath(); ctx.moveTo(272, 148); ctx.lineTo(288, 169); ctx.lineTo(304, 148); ctx.fill();
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const sm = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false }); materials.set(`persona-label-${persona.id}`, sm);
    const sprite = new THREE.Sprite(sm); sprite.userData.personaId = persona.id; sprite.renderOrder = 26;
    sprite.scale.set(3, 3 * 184 / 576, 1); scene.add(sprite); persona.label = sprite; personaLabels.push(sprite);
    const leaderGeometry = addGeo(new THREE.BufferGeometry()); leaderGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    const leaderMaterial = new THREE.LineBasicMaterial({ color: persona.color, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false }); materials.set(`persona-leader-${persona.id}`, leaderMaterial);
    const leader = new THREE.Line(leaderGeometry, leaderMaterial); leader.renderOrder = 25; leader.frustumCulled = false; scene.add(leader); persona.leader = leader;
    const ringMaterial = new THREE.MeshBasicMaterial({ color: persona.color, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }); materials.set(`persona-ring-${persona.id}`, ringMaterial);
    const ring = mesh(actor.root, addGeo(new THREE.RingGeometry(0.27, 0.34, 36)), ringMaterial, [0, 0.005, 0], null, false); ring.rotation.x = -Math.PI / 2; persona.ring = ring;
  }

  function dogWalker(parent, route) {
    const actor = citizen(parent, { route, offset: 0.25, speed: 0.2, height: 0.61, shirt: mat.lilac, style: 'bob', hair: mat.hairBrown });
    const dog = group(actor.root, 0.38, 0.02, 0.12); const paws = [];
    box(dog, 0, 0.2, 0, 0.17, 0.16, 0.32, mat.ochre, false);
    box(dog, 0, 0.28, 0.18, 0.17, 0.18, 0.17, mat.ochre, false);
    box(dog, 0, 0.24, 0.28, 0.1, 0.08, 0.09, mat.cream, false);
    for (const x of [-0.085, 0.085]) box(dog, x, 0.34, 0.15, 0.05, 0.13, 0.08, mat.hairBrown, false);
    for (const x of [-0.06, 0.06]) for (const z of [-0.11, 0.11]) {
      const paw = group(dog, x, 0.16, z); box(paw, 0, -0.075, 0, 0.045, 0.15, 0.05, mat.ochre, false); paws.push(paw);
    }
    const tail = box(dog, 0, 0.26, -0.21, 0.045, 0.2, 0.045, mat.ochre, false); tail.rotation.x = -0.55;
    const leash = cylinder(actor.root, 0.25, 0.26, 0.09, 0.009, 0.32, mat.coral, false); leash.rotation.z = 0.9;
    actor.dog = { paws, tail }; actor.root.traverse((part) => { if (part.isMesh) part.userData.citizenPart = true; });
  }

  // Independently animated transforms share GPU draws; static buildings stay in the static batcher.
  function batchCitizens() {
    const groups = new Map();
    for (const actor of citizenAnimations) actor.root.traverse((part) => {
      if (!part.isMesh || !part.userData.citizenPart || part.userData.hitVolume) return;
      const key = `${part.geometry.uuid}:${part.material.uuid}`;
      if (!groups.has(key)) groups.set(key, []); groups.get(key).push(part);
    });
    for (const objects of groups.values()) {
      const source = objects[0], instance = new THREE.InstancedMesh(source.geometry, source.material, objects.length);
      instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage); instance.frustumCulled = false;
      instance.castShadow = false; instance.receiveShadow = true; instance.userData.dynamic = true; instance.userData.citizenBatch = true;
      objects.forEach((part) => { part.visible = false; }); scene.add(instance); citizenBatches.push({ instance, objects });
    }
  }

  // Gabled terracotta roofs are custom geometry, not imported models.
  const roofGeo = addGeo(new THREE.BufferGeometry());
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute([
    -.5,0,-.5, .5,0,-.5, 0,.4,-.5, -.5,0,.5, 0,.4,.5, .5,0,.5,
    -.5,0,-.5, 0,.4,-.5, 0,.4,.5, -.5,0,-.5, 0,.4,.5, -.5,0,.5,
    0,.4,-.5, .5,0,-.5, .5,0,.5, 0,.4,-.5, .5,0,.5, 0,.4,.5,
    -.5,0,.5, .5,0,.5, .5,0,-.5, -.5,0,.5, .5,0,-.5, -.5,0,-.5,
  ], 3));
  const roofIndices = [];
  for (let i = 0; i < roofGeo.attributes.position.count; i += 3) roofIndices.push(i, i + 2, i + 1);
  roofGeo.setIndex(roofIndices); roofGeo.computeVertexNormals();

  function windowGrid(parent, width, height, depth, cols, rows, options = {}) {
    const start = options.bottom ?? 0.45;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const x = -width / 2 + (col + 0.5) * width / cols;
      const y = start + row * ((height - start - 0.25) / Math.max(rows - 1, 1));
      const ww = Math.min(width / cols * 0.53, 0.38), wh = options.windowHeight || 0.36;
      box(parent, x, y, depth / 2 + 0.012, ww, wh, 0.025, mat.window, false);
      if (options.back) box(parent, x, y, -depth / 2 - 0.012, ww, wh, 0.025, mat.window, false);
    }
    if (options.sides) for (const side of [-1, 1]) for (let row = 0; row < rows; row++) {
      const y = start + row * ((height - start - 0.25) / Math.max(rows - 1, 1));
      for (let col = 0; col < 2; col++) box(parent, side * (width / 2 + 0.012), y, -depth * 0.25 + col * depth * 0.5, 0.025, options.windowHeight || 0.36, depth * 0.23, mat.window, false);
    }
  }
  function townhouse(parent, x, z, width = 1.22, height = 1.3, rotation = 0, tone = mat.cream, roofTone = mat.coral) {
    const b = group(parent, x, Y, z, rotation), depth = 1.25;
    box(b, 0, 0.05, 0, width + 0.17, 0.1, depth + 0.15, mat.limestone, false);
    box(b, 0, height / 2, 0, width, height, depth, tone);
    box(b, 0, height - 0.03, 0, width + 0.08, 0.11, depth + 0.08, mat.white);
    mesh(b, roofGeo, roofTone, [0, height + 0.015, 0], [width + 0.24, 0.95, depth + 0.25]);
    box(b, width * 0.24, height + 0.3, -0.24, 0.16, 0.4, 0.17, roofTone);
    windowGrid(b, width, height, depth, 2, 2, { bottom: 0.42, windowHeight: 0.28, sides: true });
    box(b, 0, 0.3, depth / 2 + 0.03, 0.23, 0.55, 0.04, mat.teal, false);
    box(b, 0, 0.64, depth / 2 + 0.12, 0.43, 0.055, 0.3, roofTone);
    for (const side of [-1, 1]) box(b, side * 0.37, 0.38, depth / 2 + 0.08, 0.25, 0.08, 0.17, mat.coral, false);
    return b;
  }
  function tower(parent, x, z) {
    const t = group(parent, x, Y, z, -0.03), h = 4.55, w = 1.75, d = 1.55;
    box(t, 0, 0.1, 0, w + 0.3, 0.2, d + 0.3, mat.limestone);
    box(t, 0, h / 2, 0, w, h, d, mat.white);
    box(t, -w * 0.32, h / 2, d / 2 + 0.035, 0.22, h, 0.08, mat.jade);
    windowGrid(t, w, h, d, 3, 6, { bottom: 0.55, windowHeight: 0.4, sides: true, back: true });
    for (let i = 1; i <= 6; i++) {
      box(t, 0, i * 0.63, d / 2 + 0.11, w + 0.12, 0.075, 0.31, mat.sand, false);
      box(t, 0, i * 0.63 + 0.14, d / 2 + 0.245, w + 0.08, 0.04, 0.025, mat.white, false);
    }
    box(t, 0, h + 0.05, 0, w + 0.17, 0.16, d + 0.17, mat.coral);
    box(t, 0.13, h + 0.24, -0.05, 0.85, 0.25, 0.72, mat.cream);
    box(t, 0.13, h + 0.39, -0.05, 0.96, 0.07, 0.8, mat.teal);
    box(t, 0.4, 0.33, d / 2 + 0.1, 0.4, 0.65, 0.12, mat.glass);
    planter(t, 0, 1.2, 1.4); t.children[t.children.length - 1].position.y = 0;
  }
  function roadRing(parent) {
    const outer = roundedRectangle(8.8, 8.8, 2.1);
    const inner = roundedRectangle(6.8, 6.8, 1.1);
    outer.holes.push(new THREE.Path(inner.getPoints(16)));
    const geometry = addGeo(new THREE.ShapeGeometry(outer, 16));
    const r = mesh(parent, geometry, mat.road, [0, Y + 0.015, 0], null, false); r.rotation.x = -Math.PI / 2;
    box(parent, 0, Y + 0.017, 0, 9.7, 0.035, 1.0, mat.road, false);
    for (let x = -4.2; x < 4.4; x += 0.65) box(parent, x, Y + 0.039, 0, 0.29, 0.012, 0.045, mat.white, false);
    for (const x of [-3.55, 3.55]) for (let i = 0; i < 5; i++) box(parent, x + (i - 2) * 0.15, Y + 0.042, 0, 0.09, 0.013, 0.92, mat.white, false);
    for (const z of [-3.9, 3.9]) for (let x = -1.8; x <= 1.8; x += 0.6) box(parent, x, Y + 0.035, z, 0.28, 0.012, 0.04, mat.white, false);
    for (const x of [-3.9, 3.9]) for (let z = -1.8; z <= 1.8; z += 0.6) box(parent, x, Y + 0.035, z, 0.04, 0.012, 0.28, mat.white, false);
  }
  const carPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.3, 0, -3.89), new THREE.Vector3(2.3, 0, -3.89), new THREE.Vector3(3.85, 0, -2.3),
    new THREE.Vector3(3.85, 0, 2.3), new THREE.Vector3(2.3, 0, 3.89), new THREE.Vector3(-2.3, 0, 3.89),
    new THREE.Vector3(-3.85, 0, 2.3), new THREE.Vector3(-3.85, 0, -2.3),
  ], true, 'catmullrom', 0.25);
  function car(parent, color, offset, speed = 0.018) {
    const c = markDynamic(group(parent, 0, Y + 0.06, 0));
    box(c, 0, 0.14, 0, 0.33, 0.19, 0.62, color);
    box(c, 0, 0.275, -0.035, 0.27, 0.13, 0.32, mat.glass);
    box(c, 0, 0.345, -0.035, 0.28, 0.025, 0.34, color);
    for (const x of [-0.16, 0.16]) for (const z of [-0.19, 0.19]) {
      const wheel = cylinder(c, x, 0.085, z, 0.073, 0.047, mat.navy, false); wheel.rotation.z = Math.PI / 2;
    }
    for (const x of [-0.1, 0.1]) box(c, x, 0.15, 0.316, 0.065, 0.045, 0.015, mat.light, false);
    carAnimations.push({ object: c, offset, speed });
  }

  function makeSign(parent, text, width = 1.3, height = 0.5, dark = false) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 192;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = dark ? '#164D49' : '#FFF9EA'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = dark ? '#F4F1E7' : '#164D49'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '600 73px "Noto Sans TC", "Microsoft JhengHei", sans-serif'; ctx.fillText(text, c.width / 2, c.height / 2 + 4);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const sm = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }); materials.set(`sign-${materials.size}`, sm);
    return mesh(parent, addGeo(new THREE.PlaneGeometry(width, height)), sm, null, null, false);
  }
  function commercialPavilion(parent) {
    const p = group(parent, 0, Y, -1.65, 0);
    box(p, 0, 0.08, 0, 4.9, 0.16, 2.7, mat.limestone);
    box(p, 0, 0.9, 0, 4.2, 1.65, 2.15, mat.cream);
    box(p, 0, 0.8, 1.087, 3.9, 1.35, 0.04, mat.glass);
    for (const x of [-1.9, -0.95, 0, 0.95, 1.9]) box(p, x, 0.82, 1.13, 0.075, 1.5, 0.09, mat.sand);
    box(p, 0, 0.79, 1.16, 3.9, 0.05, 0.06, mat.sand, false);
    box(p, 0, 1.79, 0, 4.7, 0.23, 2.6, mat.coral);
    box(p, 0, 1.94, 0, 4.5, 0.08, 2.4, mat.sand);
    box(p, -1.4, 2.2, -0.1, 1.0, 0.5, 1.2, mat.cream);
    box(p, -1.4, 2.5, -0.1, 1.1, 0.1, 1.3, mat.teal);
    for (let i = 0; i < 5; i++) box(p, 0.2 + i * 0.48, 2.03, -0.15, 0.065, 0.18, 1.6, mat.ochre, false);
    const sign = makeSign(p, '售屋規劃', 1.75, 0.43, true); if (sign) sign.position.set(-0.6, 1.77, 1.32);
    for (const x of [-2.2, 2.2]) cylinder(p, x, 0.75, 1.18, 0.06, 1.5, mat.coral);
    planter(parent, -1.5, -0.25, 1.2); planter(parent, 1.5, -0.25, 1.2);
    const plaza = mesh(parent, addGeo(new THREE.ShapeGeometry(roundedRectangle(4.5, 2.2, 0.3))), mat.path, [0, Y + 0.015, 1.65], null, false); plaza.rotation.x = -Math.PI / 2;
    for (let x = -1.8; x < 2; x += 0.45) for (let z = 0.8; z < 2.7; z += 0.45) box(parent, x, Y + 0.028, z, 0.35, 0.015, 0.35, mat.sand, false);
    // An abstract key sculpture: a service symbol, not a transaction claim.
    const sculpture = group(parent, 0, Y, 1.7, 0.35);
    cylinder(sculpture, 0, 0.1, 0, 0.52, 0.2, mat.cream);
    const ring = mesh(sculpture, torusGeo, mat.gold, [0, 1.15, 0], [0.37, 0.37, 2.1]); ring.rotation.y = -0.2;
    box(sculpture, 0, 0.67, 0, 0.09, 0.66, 0.08, mat.gold);
    box(sculpture, 0.11, 0.39, 0, 0.25, 0.08, 0.08, mat.gold);
    box(sculpture, 0.1, 0.54, 0, 0.22, 0.08, 0.08, mat.gold);
    for (const x of [-2.5, 2.5]) { bench(parent, x, 1.45, x > 0 ? -Math.PI / 2 : Math.PI / 2); tree(parent, x, 2.55, 0.82); }
  }

  function hipRoof(parent, x, y, z, width, depth, height, color) {
    // Tiered hip roofs give the garden its own recognisable heritage silhouette.
    const points = [
      [-width / 2, 0.09, -depth / 2], [width / 2, 0.09, -depth / 2], [width / 2, 0.09, depth / 2], [-width / 2, 0.09, depth / 2],
      [-width * 0.31, height, 0], [width * 0.31, height, 0],
    ];
    const indices = [0,4,5, 0,5,1, 1,5,2, 2,5,4, 2,4,3, 3,4,0];
    const values = []; for (const index of indices) values.push(...points[index]);
    const geo = addGeo(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.Float32BufferAttribute(values, 3)); geo.computeVertexNormals();
    mesh(parent, geo, color, [x, y, z]);
    box(parent, x, y + height + 0.015, z, width * 0.68, 0.055, 0.065, color);
    for (const side of [-1, 1]) {
      const eave = box(parent, x, y + 0.055, z + side * depth * 0.48, width * 1.03, 0.065, 0.12, color);
      eave.rotation.x = side * 0.07;
    }
  }
  function heritage(parent) {
    const courtyard = mesh(parent, addGeo(new THREE.ShapeGeometry(roundedRectangle(5.8, 5.2, 0.3))), mat.path, [0, Y + 0.015, -0.3], null, false); courtyard.rotation.x = -Math.PI / 2;
    const h = group(parent, 0, Y, -1.6);
    box(h, 0, 0.12, 0, 3.9, 0.24, 2.1, mat.limestone);
    box(h, 0, 0.87, 0, 3.55, 1.5, 1.75, mat.cream);
    for (const x of [-1.3, 0, 1.3]) { box(h, x, 0.75, 0.895, 0.68, 1.05, 0.04, mat.teal, false); box(h, x, 0.76, 0.923, 0.045, 1.07, 0.025, mat.ochre, false); }
    for (const x of [-1.7, -0.85, 0.85, 1.7]) cylinder(h, x, 0.87, 1.05, 0.06, 1.5, mat.coralDark);
    hipRoof(h, 0, 1.6, 0, 4.3, 2.45, 0.68, mat.jade);
    hipRoof(h, 0, 1.72, 0, 3.8, 2.08, 0.75, mat.teal);
    const name = makeSign(h, '家 · 序', 0.86, 0.3, true); if (name) name.position.set(0, 1.46, 1.17);
    for (const side of [-1, 1]) {
      const wing = group(parent, side * 2.2, Y, -0.2, Math.PI / 2);
      box(wing, 0, 0.55, 0, 2.1, 1.1, 1.0, mat.sand);
      windowGrid(wing, 2.1, 1.1, 1, 3, 1, { bottom: 0.6, windowHeight: 0.44, back: true });
      hipRoof(wing, 0, 1.1, 0, 2.5, 1.4, 0.45, mat.jade);
    }
    for (let x = -1.5; x <= 1.5; x += 0.5) for (let z = -0.35; z <= 1.5; z += 0.48) box(parent, x, Y + 0.035, z, 0.39, 0.025, 0.37, mat.sand, false);
    for (const x of [-1.45, 1.45]) {
      cylinder(parent, x, Y + 0.18, 0.8, 0.26, 0.36, mat.cream);
      shrub(parent, x, 0.8, 0.34);
    }
    const gate = group(parent, 0, Y, 2.5);
    for (const x of [-0.7, 0.7]) { box(gate, x, 0.61, 0, 0.2, 1.22, 0.26, mat.coralDark); box(gate, x, 0.12, 0, 0.32, 0.24, 0.36, mat.limestone); }
    hipRoof(gate, 0, 1.2, 0, 2.1, 0.95, 0.4, mat.teal);
    for (const x of [-0.5, 0.5]) mesh(gate, roundGeo, mat.coral, [x, 1.02, 0], [0.11, 0.14, 0.11], false);
    // Reflecting pond and a small footbridge.
    const pond = disk(parent, 3.6, Y + 0.025, 1.5, 1.0, mat.pond); pond.scale.y = 1.38;
    const rim = mesh(parent, torusGeo, mat.limestone, [3.6, Y + 0.03, 1.5], [1.06, 1.44, 1]); rim.rotation.x = -Math.PI / 2;
    box(parent, 3.6, Y + 0.13, 1.5, 1.85, 0.12, 0.43, mat.ochre);
    for (let i = 0; i < 9; i++) box(parent, 2.85 + i * 0.19, Y + 0.2, 1.5, 0.025, 0.025, 0.43, mat.sand, false);
    tree(parent, -3.7, 1.3, 1.65, 0, 11);
    tree(parent, -3.8, -2.3, 1.0, 1);
    tree(parent, 3.6, -2.3, 1.05, 1);
    bench(parent, -2.9, 2.7, -0.3); bench(parent, 1.8, 3.6, -Math.PI / 2);
    const lantern = group(parent, -2.8, Y, 3.4);
    cylinder(lantern, 0, 0.4, 0, 0.09, 0.8, mat.limestone);
    box(lantern, 0, 0.83, 0, 0.26, 0.26, 0.26, mat.light);
    hipRoof(lantern, 0, 0.97, 0, 0.48, 0.48, 0.16, mat.teal);
  }

  function districtLabel(district) {
    const c = document.createElement('canvas'); c.width = 640; c.height = 160;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.shadowColor = 'rgba(19,60,53,.14)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#FFFCF1'; ctx.beginPath(); ctx.roundRect(14, 16, 610, 126, 63); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#D7DFCC'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = district.color; ctx.beginPath(); ctx.arc(85, 79, 21, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#214C45'; ctx.font = '600 63px "Noto Sans TC", "Microsoft JhengHei", sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText(district.name, 133, 83);
    ctx.strokeStyle = '#8EA494'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(555, 66); ctx.lineTo(568, 79); ctx.lineTo(555, 92); ctx.stroke();
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const sm = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }); materials.set(`label-${district.id}`, sm);
    const sprite = new THREE.Sprite(sm); sprite.scale.set(4.5, 1.125, 1); sprite.position.copy(district.center);
    sprite.position.y = district.id === 'buy' ? 6.65 : district.id === 'legacy' ? 5.9 : 5.2;
    sprite.userData.districtId = district.id; sprite.renderOrder = 20; scene.add(sprite); labels.push(sprite); district.label = sprite;
    const stemMat = material(`stem-${district.id}`, '#FDF9EE', { transparent: true, opacity: 0.75 });
    cylinder(scene, district.center.x, sprite.position.y - 1.05, district.center.z, 0.014, 1.1, stemMat, false);
  }

  Object.values(districts).forEach((district, index) => {
    const root = group(scene, district.center.x, 0, district.center.z, district.rotation); root.userData.districtId = district.id; district.root = root;
    const shape = sculptedIsland(5.8, index * 19 + 1);
    const landGeo = addGeo(new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelSize: 0.22, bevelThickness: 0.2, bevelSegments: 2, steps: 1, curveSegments: 7 }));
    const base = mesh(root, landGeo, [mat.sand, mat.limestone], [0, 0.22, 0]); base.rotation.x = -Math.PI / 2;
    const shore = mesh(root, addGeo(new THREE.ShapeGeometry(sculptedIsland(6.4, index * 19 + 1), 9)), mat.waterShallow, [0, 0.01, 0], null, false); shore.rotation.x = -Math.PI / 2;
    const green = mesh(root, addGeo(new THREE.ShapeGeometry(sculptedIsland(5.55, index * 19 + 1), 9)), mat.greenLight, [0, Y, 0], null, false); green.rotation.x = -Math.PI / 2;
    const selectionMaterial = new THREE.MeshBasicMaterial({ color: district.color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); materials.set(`selection-${district.id}`, selectionMaterial);
    const selection = mesh(root, addGeo(new THREE.RingGeometry(5.93, 6.04, 72)), selectionMaterial, [0, 0.055, 0], null, false); selection.rotation.x = -Math.PI / 2; selection.userData.dynamic = true; district.selection = selection;
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2 + 0.1;
      const rock = mesh(root, sphereGeo, i % 3 === 0 ? mat.limestoneDark : mat.limestone, [Math.cos(a) * 5.7, 0.22, Math.sin(a) * 5.7], [0.35 + rand(i + 3) * 0.25, 0.3, 0.4]); rock.rotation.y = i * 1.4;
    }
    if (district.id === 'buy') {
      roadRing(root);
      tower(root, -1.95, -1.85);
      townhouse(root, 0.5, -2.02, 1.2, 1.45, 0, mat.cream, mat.coral);
      townhouse(root, 2.12, -1.82, 1.17, 1.1, 0, mat.sand, mat.coralDark);
      townhouse(root, -2.05, 1.9, 1.25, 1.35, Math.PI, mat.cream, mat.coral);
      townhouse(root, -0.35, 1.9, 1.22, 1.55, Math.PI, mat.sand, mat.coralDark);
      townhouse(root, 1.5, 1.9, 1.3, 1.15, Math.PI, mat.cream, mat.coral);
      for (const [x, z] of [[-4.4, -1.5], [-4.3, 2.1], [0.7, -4.7], [2.9, 3.7], [-1.0, 4.7], [4.5, -1.4]]) tree(root, x, z, 0.72 + rand(x + z + 4) * 0.2, 0, x);
      for (const x of [-2.8, 0.7, 2.7]) streetlamp(root, x, 0.65);
      bench(root, 2.75, 0.9, Math.PI / 2);
      car(root, mat.coral, 0.12, 0.015); car(root, mat.cream, 0.62, 0.019);
    } else if (district.id === 'sell') {
      roadRing(root); commercialPavilion(root);
      for (const [x, z] of [[-4.5, -1.3], [4.5, 1.6], [-2.0, 4.5], [0.1, 4.8], [2.3, 4.35], [-0.3, -4.7]]) tree(root, x, z, 0.78, 0, z);
      for (const x of [-3.0, 3.0]) streetlamp(root, x, 0.6, x > 0 ? Math.PI : 0);
      car(root, mat.teal, 0.35, 0.017); car(root, mat.ochre, 0.83, 0.014);
    } else {
      heritage(root);
      for (const [x, z, size] of [[-1.7, -4.6, 0.8], [1.1, -4.65, 0.95], [4.65, -0.8, 0.7], [-4.5, -0.5, 0.7], [-0.8, 4.6, 0.75]]) tree(root, x, z, size, 0, x);
      box(root, 0, Y + 0.015, 3.7, 1.4, 0.03, 2.6, mat.path, false);
    }
    districtLabel(district);
  });

  // Walking loops are deliberately confined to the new pavements and existing garden paths.
  const buyNorthWalk = walkingRoute([[-2.65, -0.72], [2.5, -0.72], [2.5, -1.1], [-2.65, -1.1]]);
  const buySouthWalk = walkingRoute([[-2.4, 0.78], [2.15, 0.78], [2.15, 1.13], [-2.4, 1.13]]);
  const buyGardenWalk = walkingRoute([[-2.5, 2.92], [1.7, 2.92], [1.7, 3.23], [-2.5, 3.23]]);
  const sellFrontWalk = walkingRoute([[-2.15, 0.62], [2.15, 0.62], [2.15, 0.98], [-2.15, 0.98]]);
  const sellGardenWalk = walkingRoute([[-2.1, 2.92], [1.85, 2.92], [1.85, 3.23], [-2.1, 3.23]]);
  const heritageCourtWalk = walkingRoute([[-1.05, 1.35], [1.05, 1.35], [1.05, 1.78], [-1.05, 1.78]]);
  const heritageFamilyWalk = walkingRoute([[-0.82, 3.42], [0.82, 3.42], [0.82, 3.7], [-0.82, 3.7]]);
  for (const [districtId, x, z, w, d] of [
    ['buy', 0, -0.91, 6.25, 0.6], ['buy', -0.1, 0.96, 5.65, 0.57], ['buy', -0.4, 3.08, 4.95, 0.51],
    ['sell', 0, 0.8, 5.15, 0.58], ['sell', -0.1, 3.08, 4.75, 0.51], ['sell', 3.08, 1.95, 0.5, 2.5],
    ['legacy', 0, 3.56, 3.55, 0.78],
  ]) box(districts[districtId].root, x, Y + 0.032, z, w, 0.035, d, mat.path, false);
  const clothing = [mat.jade, mat.coral, mat.ochre, mat.cream, mat.lilac, mat.teal];
  const hairstyles = ['', 'bob', 'cap', 'glasses', 'elder', 'backpack'];
  function populate(districtId, route, count, seed) {
    for (let i = 0; i < count; i++) {
      const variant = (i + seed) % 6;
      citizen(districts[districtId].root, {
        route, offset: (i / count + rand(seed + i) * 0.07) % 1,
        speed: 0.21, height: variant === 2 ? 0.5 : 0.6 + rand(i + seed * 2) * 0.1,
        shirt: clothing[variant], style: hairstyles[variant], hair: variant === 4 ? mat.hairSilver : variant % 2 ? mat.hairBrown : mat.hair,
        skin: [mat.skinWarm, mat.skinLight, mat.skinDeep][(i + seed) % 3],
      });
    }
  }
  populate('buy', buyNorthWalk, 3, 2); populate('buy', buySouthWalk, 3, 11); populate('buy', buyGardenWalk, 2, 19);
  populate('sell', sellFrontWalk, 3, 31); populate('sell', sellGardenWalk, 3, 41);
  populate('legacy', heritageCourtWalk, 4, 51);
  const firstHome = citizen(districts.buy.root, { route: buyNorthWalk, offset: 0.23, speed: 0.21, height: 0.83, shirt: mat.coral, skin: mat.skinLight, style: 'backpack', personaId: 'first-home' });
  const moveHome = citizen(districts.buy.root, { route: buyGardenWalk, offset: 0.63, speed: 0.21, height: 0.86, shirt: mat.teal, style: 'glasses', personaId: 'move-home' });
  const seller = citizen(districts.sell.root, { route: sellGardenWalk, offset: 0.27, speed: 0.21, height: 0.83, shirt: mat.ochre, skin: mat.skinLight, style: 'bun', personaId: 'seller' });
  const familyParent = citizen(districts.legacy.root, { route: heritageFamilyWalk, offset: 0.12, speed: 0.15, height: 0.82, shirt: mat.jade, style: 'bob', personaId: 'legacy-family' });
  const familyElder = citizen(districts.legacy.root, { height: 0.78, shirt: mat.cream, hair: mat.hairSilver, style: 'elder', personaId: 'legacy-family' });
  const familyChild = citizen(districts.legacy.root, { height: 0.52, shirt: mat.coral, style: 'cap', skin: mat.skinLight, personaId: 'legacy-family' });
  familyElder.follow = { actor: familyParent, x: -0.34, z: -0.1 }; familyChild.follow = { actor: familyParent, x: 0.31, z: 0.05 };
  personaLabel(personas['first-home'], firstHome); personaLabel(personas['move-home'], moveHome);
  personaLabel(personas.seller, seller); personaLabel(personas['legacy-family'], familyParent);
  dogWalker(districts.sell.root, walkingRoute([[2.98, 1.15], [2.98, 2.83], [3.16, 2.83], [3.16, 1.15]]));
  // Two neighbours share the garden bench; their seated pose has bent knees and relaxed arms.
  for (const [i, shirt] of [mat.lilac, mat.cream].entries()) citizen(districts.legacy.root, {
    x: -3.05 + i * 0.3, z: 2.7, rotation: -0.3, height: 0.59, shirt,
    hair: i ? mat.hairSilver : mat.hairBrown, style: i ? 'elder' : 'bob', seated: true, offset: i * 0.5,
  });
  // A modest neighbourhood bus stop gives the residential waterfront a daily-life landmark.
  const shelter = group(districts.buy.root, 0.8, Y, 4.45);
  box(shelter, 0, 0.025, 0, 1.55, 0.05, 0.62, mat.path, false);
  for (const x of [-0.65, 0.65]) cylinder(shelter, x, 0.55, -0.18, 0.035, 1.1, mat.teal, false);
  box(shelter, 0, 0.61, -0.19, 1.35, 0.7, 0.035, mat.glass, false);
  box(shelter, 0, 1.12, 0, 1.6, 0.08, 0.72, mat.coral, false);
  box(shelter, 0, 0.29, -0.02, 1.1, 0.07, 0.27, mat.ochre, false);
  cylinder(shelter, 1.02, 0.64, 0, 0.025, 1.28, mat.teal, false);
  const busSign = makeSign(shelter, 'BUS', 0.36, 0.23, true); if (busSign) busSign.position.set(1.02, 1.16, 0.02);

  function bridge(a, b, width = 1.5) {
    const direction = b.clone().sub(a); direction.y = 0; const full = direction.length(); direction.normalize();
    const length = full - 9.4; const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const g = group(scene, midpoint.x, 0, midpoint.z, Math.atan2(direction.x, direction.z));
    box(g, 0, Y - 0.08, 0, width + 0.22, 0.25, length, mat.limestone);
    box(g, 0, Y + 0.055, 0, width, 0.045, length + 0.04, mat.path, false);
    for (const x of [-width / 2, width / 2]) {
      box(g, x, Y + 0.38, 0, 0.05, 0.055, length, mat.cream, false);
      box(g, x, Y + 0.23, 0, 0.035, 0.035, length, mat.cream, false);
      const count = Math.max(3, Math.floor(length / 0.5));
      for (let i = 0; i <= count; i++) box(g, x, Y + 0.18, -length / 2 + length * i / count, 0.06, 0.4, 0.07, mat.cream, false);
    }
    for (const z of [-length * 0.3, length * 0.3]) box(g, 0, 0.4, z, width * 0.78, 0.8, 0.3, mat.limestone);
    for (let z = -length / 2; z < length / 2; z += 0.3) box(g, 0, Y + 0.085, z, width - 0.12, 0.015, 0.025, mat.sand, false);
  }
  bridge(districts.buy.center, districts.sell.center, 1.45);
  bridge(districts.buy.center, districts.legacy.center, 1.25);
  bridge(districts.legacy.center, districts.sell.center, 1.25);

  // Boardwalk and moorings on the front shoreline.
  const dock = group(scene, 6.7, 0, 9.15, 0.05);
  box(dock, 0, 0.42, 1.1, 1.15, 0.14, 3.2, mat.ochre);
  box(dock, 1.1, 0.42, 2.5, 3.3, 0.14, 1.0, mat.ochre);
  for (let z = -0.45; z < 2.75; z += 0.22) box(dock, 0, 0.5, z, 1.16, 0.02, 0.035, mat.sand, false);
  for (const x of [-0.5, 0.5]) for (const z of [0, 1.5, 2.65]) cylinder(dock, x, 0.27, z, 0.075, 0.7, mat.bark);

  function sailboat(x, z, rotation, size = 1, offset = 0) {
    const b = markDynamic(group(scene, x, 0.18, z, rotation)); b.scale.setScalar(size);
    const hull = mesh(b, sphereGeo, mat.cream, [0, 0, 0], [0.43, 0.18, 1.05]);
    hull.rotation.y = Math.PI / 12;
    box(b, 0, 0.11, 0, 0.46, 0.1, 1.1, mat.sand);
    cylinder(b, 0, 0.91, 0, 0.025, 1.85, mat.bark, false);
    const sailGeo = addGeo(new THREE.BufferGeometry());
    sailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0,0.36,0.04, 0,1.74,0.04, 0,0.36,0.93], 3)); sailGeo.computeVertexNormals();
    const sailMaterial = material('sail', '#FFF9E8', { side: THREE.DoubleSide }); mesh(b, sailGeo, sailMaterial, null, null, false);
    const secondGeo = addGeo(new THREE.BufferGeometry()); secondGeo.setAttribute('position', new THREE.Float32BufferAttribute([0,0.4,-0.06, 0,1.42,-0.06, 0,0.4,-0.67], 3)); secondGeo.computeVertexNormals();
    const coralSail = material('coralSail', '#D99173', { side: THREE.DoubleSide }); mesh(b, secondGeo, coralSail, null, null, false);
    boatAnimations.push({ object: b, x, z, offset, rotation });
  }
  sailboat(10.5, 10.0, -0.7, 0.85, 0); sailboat(-13.5, -3.2, 0.8, 0.9, 4.1);
  for (let i = 0; i < 3; i++) {
    const positions = [[-13, 9.8, -9], [14, 11, -6], [5, 11.8, 14]];
    const [x, y, z] = positions[i]; const cloud = markDynamic(group(scene, x, y, z));
    for (let j = 0; j < 5; j++) mesh(cloud, roundGeo, mat.cloud, [(j - 2) * 0.64, Math.sin(j * 1.7) * 0.18, (j % 2) * 0.3], [0.77, 0.42 + (j % 3) * 0.12, 0.52], false);
    cloudAnimations.push({ object: cloud, x, z, offset: i * 3.2 });
  }

  // Repeated static details are instanced by geometry/material/district to keep draw calls modest.
  function batchStatics() {
    scene.updateMatrixWorld(true);
    const batches = new Map();
    scene.traverse((object) => {
      if (!object.isMesh || Array.isArray(object.material)) return;
      let ancestor = object, dynamic = false, districtId = null;
      while (ancestor) { dynamic ||= Boolean(ancestor.userData.dynamic); districtId ||= ancestor.userData.districtId; ancestor = ancestor.parent; }
      if (dynamic) return;
      const key = `${object.geometry.uuid}:${object.material.uuid}:${object.castShadow}:${object.receiveShadow}:${districtId || ''}`;
      if (!batches.has(key)) batches.set(key, { objects: [], districtId });
      batches.get(key).objects.push(object);
    });
    for (const { objects, districtId } of batches.values()) {
      if (objects.length < 3) continue;
      const source = objects[0];
      const instance = new THREE.InstancedMesh(source.geometry, source.material, objects.length);
      instance.castShadow = source.castShadow; instance.receiveShadow = source.receiveShadow;
      instance.userData.districtId = districtId;
      objects.forEach((object, i) => { instance.setMatrixAt(i, object.matrixWorld); object.removeFromParent(); });
      instance.instanceMatrix.needsUpdate = true; instance.computeBoundingSphere(); scene.add(instance);
    }
  }
  batchStatics();
  batchCitizens();

  let disposed = false, frame = 0, ready = false, nightTarget = 0, nightMix = 0, paused = false, motionTime = 0;
  let selectedId = null, selectedPersonaId = null, hoveredId = null, hoveredPersonaId = null;
  let transition = null, previousTime = null, pendingZoom = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dayColor = new THREE.Color('#F4F1E7'), nightColor = new THREE.Color('#152D35');
  const waterDay = new THREE.Color(palette.water), waterNight = new THREE.Color('#284F59');
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), projected = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3(31, 29, 36), viewRight = new THREE.Vector3(36, 0, -31).normalize();
  const defaultTarget = new THREE.Vector3();
  const tmpColor = new THREE.Color();
  const citizenPoint = new THREE.Vector3(), citizenTangent = new THREE.Vector3(), citizenWorld = new THREE.Vector3();
  const personaProjection = new THREE.Vector3(), labelWorld = new THREE.Vector3(), leaderEnd = new THREE.Vector3();
  let width = 1, height = 1;
  let labelBounds = null, labelBoundsTime = -Infinity;

  function refreshLabelBounds(now) {
    if (labelBounds && now - labelBoundsTime < 250) return;
    labelBoundsTime = now;
    const canvasRect = canvas.getBoundingClientRect();
    const bounds = { left: 18, right: width - 18, top: 94, bottom: height - 142 };
    const visibleRect = (selector) => {
      const element = document.querySelector(selector); if (!element || element.hidden) return null;
      const style = getComputedStyle(element); if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.1) return null;
      const r = element.getBoundingClientRect();
      return { left: r.left - canvasRect.left, right: r.right - canvasRect.left, top: r.top - canvasRect.top, bottom: r.bottom - canvasRect.top };
    };
    const header = visibleRect('.masthead'), dock = visibleRect('.journey-dock'), intro = visibleRect('#intro'), detail = visibleRect('#detail-panel');
    if (header) bounds.top = Math.max(bounds.top, header.bottom + 8);
    if (dock) bounds.bottom = Math.min(bounds.bottom, dock.top - 12);
    if (intro && !selectedId) {
      if (width < 740) bounds.top = Math.max(bounds.top, intro.bottom + 10);
      else bounds.left = Math.max(bounds.left, intro.right + 10);
    }
    if (detail && selectedId) {
      if (width < 740) bounds.bottom = Math.min(bounds.bottom, detail.top - 10);
      else bounds.right = Math.min(bounds.right, detail.left - 12);
    }
    if (bounds.right - bounds.left < 140) bounds.left = Math.max(16, bounds.right - 145);
    if (bounds.bottom - bounds.top < 70) bounds.top = Math.max(header?.bottom + 8 || 90, bounds.bottom - 80);
    labelBounds = bounds;
  }
  function updatePersonaLabels(now) {
    refreshLabelBounds(now);
    const occupied = [], pixelsWide = width < 740 ? 116 : 128, pixelsHigh = pixelsWide * 184 / 576;
    const unitsPerPixel = (camera.top - camera.bottom) / camera.zoom / height;
    const clamp = THREE.MathUtils.clamp;
    const clampX = (x) => clamp(x, labelBounds.left + pixelsWide / 2, labelBounds.right - pixelsWide / 2);
    const clampY = (y) => clamp(y, labelBounds.top + pixelsHigh / 2, labelBounds.bottom - pixelsHigh / 2);
    for (const persona of Object.values(personas)) {
      if (!persona.label) continue;
      const visible = selectedPersonaId ? selectedPersonaId === persona.id : !selectedId || selectedId === persona.districtId;
      persona.label.visible = visible; persona.leader.visible = visible;
      persona.ring.material.opacity = selectedPersonaId === persona.id ? 0.86 : hoveredPersonaId === persona.id ? 0.72 : 0.34;
      if (!visible) continue;
      persona.actor.root.getWorldPosition(citizenWorld); citizenWorld.y += persona.actor.height + 0.1;
      personaProjection.copy(citizenWorld).project(camera);
      const idealX = (personaProjection.x * 0.5 + 0.5) * width;
      const idealY = (-personaProjection.y * 0.5 + 0.5) * height - 34;
      let best = null;
      for (const [dx, dy] of [[0, 0], [0, -48], [0, 48], [-138, 0], [138, 0], [-138, -48], [138, 48], [0, -96], [0, 96]]) {
        const x = clampX(idealX + dx), y = clampY(idealY + dy);
        let score = Math.hypot(x - idealX, y - idealY);
        for (const previous of occupied) if (Math.abs(x - previous.x) < pixelsWide + 8 && Math.abs(y - previous.y) < pixelsHigh + 7) score += 10000;
        if (!best || score < best.score) best = { x, y, score };
      }
      occupied.push(best);
      labelWorld.set(best.x / width * 2 - 1, -(best.y / height * 2 - 1), personaProjection.z).unproject(camera);
      persona.label.position.copy(labelWorld); persona.label.scale.set(pixelsWide * unitsPerPixel, pixelsHigh * unitsPerPixel, 1);
      leaderEnd.set(best.x / width * 2 - 1, -((best.y + pixelsHigh * 0.33) / height * 2 - 1), personaProjection.z).unproject(camera);
      const attribute = persona.leader.geometry.attributes.position;
      attribute.setXYZ(0, citizenWorld.x, citizenWorld.y, citizenWorld.z); attribute.setXYZ(1, leaderEnd.x, leaderEnd.y, leaderEnd.z); attribute.needsUpdate = true;
    }
  }

  function frameTarget(id = null) {
    const mobile = width < 740;
    if (!id || !districts[id]) {
      const target = new THREE.Vector3(0, 0.7, -0.1);
      target.addScaledVector(viewRight, mobile ? 0 : -4.2);
      // On small screens the city sits a little lower, leaving space for the headline.
      if (mobile) target.y = 3.1;
      return { target, zoom: 1 };
    }
    const target = districts[id].center.clone(); target.y = mobile ? -6.5 : 1.2;
    target.addScaledVector(viewRight, mobile ? 0 : 1.7);
    return { target, zoom: mobile ? 1.75 : 1.48 };
  }
  function moveCamera(id, immediate = false) {
    const destination = frameTarget(id);
    const currentOffset = camera.position.clone().sub(controls.target);
    if (currentOffset.lengthSq() < 1) currentOffset.copy(cameraOffset);
    const endPosition = destination.target.clone().add(currentOffset);
    if (immediate || reducedMotion.matches) {
      controls.target.copy(destination.target); camera.position.copy(endPosition); camera.zoom = destination.zoom; camera.updateProjectionMatrix(); transition = null;
    } else {
      transition = { start: performance.now(), fromTarget: controls.target.clone(), toTarget: destination.target, fromPosition: camera.position.clone(), toPosition: endPosition, fromZoom: camera.zoom, toZoom: destination.zoom };
    }
  }
  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect(); width = Math.max(rect.width, 1); height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false); labelBoundsTime = -Infinity;
    const aspect = width / height;
    const visibleHeight = width < 740 ? Math.max(27.5, 31.5 / aspect) : Math.max(26.8, 38 / aspect);
    camera.left = -visibleHeight * aspect / 2; camera.right = visibleHeight * aspect / 2;
    camera.top = visibleHeight / 2; camera.bottom = -visibleHeight / 2; camera.updateProjectionMatrix();
    if (!ready) {
      const initial = frameTarget(); defaultTarget.copy(initial.target); controls.target.copy(initial.target); camera.position.copy(initial.target).add(cameraOffset);
    } else moveCamera(selectedId, true);
    controls.update();
  }
  function select(id) {
    if (disposed) return;
    selectedPersonaId = null; selectedId = districts[id] ? id : null; pendingZoom = null; labelBoundsTime = -Infinity; moveCamera(selectedId);
  }
  function focusPersona(id) {
    if (disposed || !personas[id]) return;
    selectedPersonaId = id; selectedId = personas[id].districtId;
    pendingZoom = null; labelBoundsTime = -Infinity; moveCamera(selectedId);
  }
  function reset() {
    selectedId = null; selectedPersonaId = null; pendingZoom = null; labelBoundsTime = -Infinity;
    const destination = frameTarget();
    if (reducedMotion.matches) { controls.target.copy(destination.target); camera.position.copy(destination.target).add(cameraOffset); camera.zoom = 1; camera.updateProjectionMatrix(); transition = null; }
    else transition = { start: performance.now(), fromTarget: controls.target.clone(), toTarget: destination.target, fromPosition: camera.position.clone(), toPosition: destination.target.clone().add(cameraOffset), fromZoom: camera.zoom, toZoom: 1 };
  }
  function getSceneAnchor(id) {
    if (personas[id]?.label) {
      const label = personas[id].label; projected.copy(label.position).project(camera);
      return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height, visible: label.visible && projected.z >= -1 && projected.z <= 1, type: 'persona' };
    }
    if (!districts[id]) return null;
    projected.copy(districts[id].label?.position || districts[id].center).project(camera);
    return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height, visible: projected.z >= -1 && projected.z <= 1 };
  }
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    // Named residents take precedence, so a person never also opens the underlying district.
    const personHits = raycaster.intersectObjects(personaLabels.filter((label) => label.visible), false)
      .concat(raycaster.intersectObjects(personaPickTargets, false));
    for (const hit of personHits) if (hit.object.userData.personaId) return { type: 'persona', id: hit.object.userData.personaId };
    const hits = raycaster.intersectObjects(labels.filter((label) => label.visible), false).concat(raycaster.intersectObjects(scene.children, true));
    for (const hit of hits) {
      if ((hit.object.isSprite && !hit.object.visible) || hit.object.userData.citizenPart || hit.object.userData.citizenBatch || hit.object.isLine) continue;
      let object = hit.object;
      while (object) {
        if (object.userData.personaId) return { type: 'persona', id: object.userData.personaId };
        if (object.userData.districtId) return { type: 'district', id: object.userData.districtId };
        object = object.parent;
      }
    }
    return null;
  }
  let pointerDown = null, lastHoverTime = 0;
  const pointers = new Set();
  function onPointerDown(event) {
    pointers.add(event.pointerId);
    if (pointers.size > 1) { pointerDown = null; return; }
    pointerDown = { x: event.clientX, y: event.clientY, time: performance.now(), id: event.pointerId };
  }
  function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (!pointerDown || pointerDown.id !== event.pointerId) return;
    const down = pointerDown; pointerDown = null;
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6 || performance.now() - down.time > 700) return;
    const hit = pick(event);
    if (hit?.type === 'persona') { focusPersona(hit.id); onPersona(hit.id); }
    else if (hit) { select(hit.id); onSelect(hit.id); }
  }
  function onPointerMove(event) {
    if (pointerDown || event.pointerType === 'touch' || performance.now() - lastHoverTime < 70) return;
    lastHoverTime = performance.now(); const hit = pick(event);
    hoveredPersonaId = hit?.type === 'persona' ? hit.id : null;
    hoveredId = hoveredPersonaId ? personas[hoveredPersonaId].districtId : hit?.id || null;
    canvas.style.cursor = hit ? 'pointer' : 'grab';
  }
  function onPointerCancel(event) { pointers.delete(event.pointerId); pointerDown = null; }
  function onPointerLeave() { hoveredId = null; hoveredPersonaId = null; canvas.style.cursor = 'grab'; }
  function onControlStart() { transition = null; pendingZoom = null; }
  function onContextLost(event) { event.preventDefault(); onError(new Error('WebGL context lost. Please reload to restore the city.')); }
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost);
  controls.addEventListener('start', onControlStart);
  canvas.style.touchAction = 'none'; canvas.style.cursor = 'grab';
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(canvas); else window.addEventListener('resize', resize);
  resize();

  function animate(now) {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const delta = cityFrameDelta(now, previousTime);
    if (Number.isFinite(now)) previousTime = now;
    if (!paused && !reducedMotion.matches) motionTime += delta;
    if (transition) {
      const progress = Math.min((now - transition.start) / 1000, 1), ease = 1 - Math.pow(1 - progress, 3);
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, ease);
      camera.position.lerpVectors(transition.fromPosition, transition.toPosition, ease);
      camera.zoom = THREE.MathUtils.lerp(transition.fromZoom, transition.toZoom, ease); camera.updateProjectionMatrix();
      if (progress === 1) transition = null;
    }
    if (pendingZoom !== null) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, pendingZoom, Math.min(delta * 10, 1)); camera.updateProjectionMatrix();
      if (Math.abs(camera.zoom - pendingZoom) < 0.001) pendingZoom = null;
    }
    controls.update();
    for (const actor of citizenAnimations) {
      if (actor.route) {
        const t = cityMotionPhase(actor.offset, motionTime, actor.speed, actor.route.getLength());
        actor.route.getPointAt(t, citizenPoint); actor.route.getTangentAt(t, citizenTangent);
        actor.root.position.x = citizenPoint.x; actor.root.position.z = citizenPoint.z;
        actor.root.rotation.y = Math.atan2(citizenTangent.x, citizenTangent.z);
      } else if (actor.follow) {
        const leader = actor.follow.actor.root, angle = leader.rotation.y;
        actor.root.position.x = leader.position.x + Math.cos(angle) * actor.follow.x + Math.sin(angle) * actor.follow.z;
        actor.root.position.z = leader.position.z - Math.sin(angle) * actor.follow.x + Math.cos(angle) * actor.follow.z;
        actor.root.rotation.y = angle;
      }
      const walking = actor.route || actor.follow;
      const gait = Math.sin(motionTime * 5.7 + actor.phase), lift = Math.cos(motionTime * 5.7 + actor.phase);
      if (walking) {
        actor.legs[0].rotation.x = gait * 0.48; actor.legs[1].rotation.x = -gait * 0.48;
        actor.knees[0].rotation.x = Math.max(0, -gait) * 0.46; actor.knees[1].rotation.x = Math.max(0, gait) * 0.46;
        actor.arms[0].rotation.x = -gait * 0.38; actor.arms[1].rotation.x = gait * 0.38;
        actor.body.position.y = Math.abs(lift) * actor.height * 0.018;
        actor.body.rotation.z = gait * 0.018;
      } else if (actor.seated) actor.arms[0].rotation.x = -0.65 + Math.sin(motionTime * 0.7 + actor.phase) * 0.055;
      if (actor.dog) {
        actor.dog.paws.forEach((paw, i) => { paw.rotation.x = Math.sin(motionTime * 7.8 + (i % 2 ? Math.PI : 0)) * 0.44; });
        actor.dog.tail.rotation.z = Math.sin(motionTime * 6) * 0.25;
      }
    }
    scene.updateMatrixWorld(true); camera.updateMatrixWorld();
    for (const batch of citizenBatches) {
      batch.objects.forEach((part, i) => { batch.instance.setMatrixAt(i, part.matrixWorld); });
      batch.instance.instanceMatrix.needsUpdate = true;
    }
    updatePersonaLabels(now);
    for (const animation of carAnimations) {
      const t = cityMotionPhase(animation.offset, motionTime, animation.speed);
      const point = carPath.getPointAt(t), tangent = carPath.getTangentAt(t);
      animation.object.position.x = point.x; animation.object.position.z = point.z;
      animation.object.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
    for (const animation of boatAnimations) {
      animation.object.position.y = 0.2 + Math.sin(motionTime * 1.15 + animation.offset) * 0.035;
      animation.object.rotation.z = Math.sin(motionTime * 0.7 + animation.offset) * 0.025;
      animation.object.position.x = animation.x + Math.sin(motionTime * 0.045 + animation.offset) * 0.6;
      animation.object.position.z = animation.z + Math.cos(motionTime * 0.045 + animation.offset) * 0.4;
    }
    for (const animation of cloudAnimations) animation.object.position.x = animation.x + Math.sin(motionTime * 0.035 + animation.offset) * 1.2;
    nightMix += (nightTarget - nightMix) * Math.min(delta * 2.4, 1);
    scene.background = tmpColor.copy(dayColor).lerp(nightColor, nightMix);
    mat.water.color.copy(waterDay).lerp(waterNight, nightMix);
    mat.waterShallow.color.set('#ABCAC0').lerp(new THREE.Color('#40676B'), nightMix);
    mat.waterEdge.color.set('#CCDDD0').lerp(new THREE.Color('#28464E'), nightMix);
    mat.waterOuter.color.set('#E3E9DC').lerp(new THREE.Color('#1B353E'), nightMix);
    mat.window.emissiveIntensity = nightMix * 1.6; mat.light.emissiveIntensity = 0.25 + nightMix * 2.1;
    hemi.intensity = THREE.MathUtils.lerp(2.5, 1.05, nightMix);
    sun.intensity = THREE.MathUtils.lerp(4.3, 0.8, nightMix);
    fill.intensity = THREE.MathUtils.lerp(0.9, 1.6, nightMix);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.12, 0.95, nightMix);
    for (const district of Object.values(districts)) {
      const opacity = selectedId === district.id ? 0.7 : hoveredId === district.id ? 0.45 : 0;
      district.selection.material.opacity += (opacity - district.selection.material.opacity) * Math.min(delta * 9, 1);
      const targetScale = hoveredId === district.id || selectedId === district.id ? 4.75 : 4.5;
      district.label?.scale.lerp(new THREE.Vector3(targetScale, targetScale / 4, 1), Math.min(delta * 9, 1));
    }
    try {
      renderer.render(scene, camera);
      if (!ready) { ready = true; onReady({ objects: renderer.info.render.calls, interactive: true }); }
    } catch (error) {
      cancelAnimationFrame(frame); onError(error);
    }
  }
  frame = requestAnimationFrame(animate);
  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(frame); observer?.disconnect();
    window.removeEventListener('resize', resize); controls.removeEventListener('start', onControlStart); controls.dispose();
    canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('pointerleave', onPointerLeave); canvas.removeEventListener('webglcontextlost', onContextLost);
    geometries.forEach((geometry) => geometry.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((texture) => texture.dispose());
    renderer.dispose(); scene.clear();
  }
  return {
    select, focusPersona, reset, resize, dispose, getSceneAnchor,
    setNight(value) { nightTarget = value ? 1 : 0; },
    setPaused(value) { paused = Boolean(value); },
    zoom(delta) { transition = null; pendingZoom = THREE.MathUtils.clamp((pendingZoom ?? camera.zoom) + Number(delta || 0), controls.minZoom, controls.maxZoom); },
  };
}
