// Baked backdrops plus live flat-shaded figures. Each room is rendered many times
// from jittered lights into one image; at runtime that image is drawn behind the
// figures, and the room's geometry is drawn into the depth buffer only, so figures
// still pass behind furniture.
const Render = (() => {
  const W = 1280, H = 720;
  let renderer, cam, roomScene, dynScene, bgScene, bgCam, bgMat, depthMat;
  let sunL, fillL, lampSpot, lampGlow, hemi, dynHemi, dynDir;
  let current = null, samples = 24;
  const baked = {}, figs = {};
  const dyn = { boxes: [], haze: [] };
  const buf = new Uint8Array(W * H * 4);
  let accum = null;
  let dimNow = 1, tintNow = new THREE.Color(1, 1, 1), hazeNow = 0, hazeTarget = 0;
  let view = { dim: 1, tint: [1, 1, 1], flick: 1 };

  function init(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;

    cam = new THREE.PerspectiveCamera(55, W / H, .05, 60);
    roomScene = new THREE.Scene();
    dynScene = new THREE.Scene();
    bgScene = new THREE.Scene();
    bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    bgMat = new THREE.MeshBasicMaterial({ depthTest: false, depthWrite: false, toneMapped: false });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));
    depthMat = new THREE.MeshBasicMaterial({ colorWrite: false });

    sunL = new THREE.DirectionalLight(0xffffff, 1);
    sunL.castShadow = true;
    sunL.shadow.mapSize.set(1024, 1024);
    Object.assign(sunL.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 40 });
    sunL.shadow.bias = -.0012;
    fillL = new THREE.SpotLight(0xffffff, 1, 10, 1.45, 1, 1.3);
    fillL.castShadow = true;
    fillL.shadow.mapSize.set(512, 512);
    fillL.shadow.bias = -.002;
    lampSpot = new THREE.SpotLight(0xffffff, 1, 7, 1.4, .9, 1.4);
    lampSpot.castShadow = true;
    lampSpot.shadow.mapSize.set(512, 512);
    lampSpot.shadow.bias = -.002;
    lampGlow = new THREE.PointLight(0xffffff, 1, 7, 1.6);
    hemi = new THREE.HemisphereLight(0xfff8ea, 0xc4b08c, .3);
    roomScene.add(sunL, sunL.target, fillL, fillL.target, lampSpot, lampSpot.target, lampGlow, hemi);
    setBakeLights(false);

    dynHemi = new THREE.HemisphereLight(0xfff4e0, 0x53463a, 1);
    dynDir = new THREE.DirectionalLight(0xffffff, .5);
    dynDir.position.set(-2, 4, 2);
    dynScene.add(dynHemi, dynDir);

    buildProps();
    renderer.shadowMap.autoUpdate = false;
    return renderer.capabilities.isWebGL2 !== undefined;
  }

  function setBakeLights(on) {
    for (const l of [sunL, fillL, lampSpot, lampGlow, hemi]) l.visible = on;
  }

  function setCamera(def, jx = 0, jy = 0) {
    const c = def.cam;
    cam.fov = c.fov;
    cam.position.set(c.p[0], c.p[1], c.p[2]);
    cam.up.set(Math.sin(c.roll || 0), Math.cos(c.roll || 0), 0);
    cam.lookAt(c.t[0], c.t[1], c.t[2]);
    if (jx || jy) cam.setViewOffset(W, H, jx, jy, W, H); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }

  function isBaked(room, variant, state) {
    const set = Sets.get(room, variant);
    return !!baked[`${set.key}@${state}`];
  }

  // Halton sequence so a handful of samples still spreads evenly.
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  const nextTask = () => new Promise(r => setTimeout(r, 0));

  async function bake(room, variant, state, onProgress) {
    const set = Sets.get(room, variant);
    const key = `${set.key}@${state}`;
    if (baked[key]) return baked[key];

    const def = set.def, light = Sets.LIGHT[state];
    Sets.applyLight(state);
    if (!set.group.parent) roomScene.add(set.group);
    for (const c of roomScene.children) if (c.isGroup) c.visible = c === set.group;
    setBakeLights(true);
    roomScene.overrideMaterial = null;

    const exposure = def.exposure || 1;
    sunL.color.set(light.sun[0]); sunL.intensity = (def.noSun ? 0 : light.sun[1]) * exposure;
    fillL.color.set(light.fill[0]); fillL.intensity = (def.noSun ? .05 : light.fill[1]) * exposure;
    hemi.intensity = (def.noSun ? .08 : light.amb) * exposure;
    const lamp = def.lamps[0];
    const lampLevel = def.alwaysLamp ? 1 : light.lamp;
    lampSpot.color.set(lamp[3]); lampGlow.color.set(lamp[3]);
    lampSpot.intensity = lamp[4] * lampLevel * .9;
    lampGlow.intensity = lamp[4] * lampLevel * .55;
    if (def.alwaysLamp) Sets.mat('bulb').color.set('#ffe0a8');

    if (!accum) accum = new Float32Array(W * H * 3);
    accum.fill(0);
    const sun = new THREE.Vector3(...def.sun);
    let n = samples;
    const t0 = performance.now();

    for (let i = 0; i < n; i++) {
      const a = halton(i + 1, 2), b = halton(i + 1, 3), c = halton(i + 1, 5);
      setCamera(def, a - .5, b - .5);
      sunL.position.set(sun.x + (a - .5) * .9, sun.y + (b - .5) * .9, sun.z + (c - .5) * .9).add(new THREE.Vector3(0, 0, 0));
      sunL.target.position.set(0, 1, 0);
      fillL.position.set((b - .5) * set.W * .42, set.H - .08, (c - .5) * set.D * .42);
      fillL.target.position.set(fillL.position.x, 0, fillL.position.z);
      lampSpot.position.set(lamp[0] + (c - .5) * .16, lamp[1] + (a - .5) * .06, lamp[2] + (b - .5) * .16);
      lampSpot.target.position.set(lampSpot.position.x, 0, lampSpot.position.z);
      lampGlow.position.set(lamp[0], lamp[1], lamp[2]);
      for (const l of [sunL, fillL, lampSpot]) { l.target.updateMatrixWorld(); l.shadow.needsUpdate = true; }
      renderer.shadowMap.needsUpdate = true;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(roomScene, cam);
      const gl = renderer.getContext();
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      for (let p = 0, q = 0; p < buf.length; p += 4, q += 3) {
        accum[q] += buf[p]; accum[q + 1] += buf[p + 1]; accum[q + 2] += buf[p + 2];
      }
      if (i === 1) {
        // Slow machine: spend fewer samples rather than hang on a black screen.
        const per = (performance.now() - t0) / 2;
        if (per > 250) n = Math.min(n, 6); else if (per > 110) n = Math.min(n, 12);
        samples = Math.min(samples, n);
      }
      if (onProgress) onProgress((i + 1) / n);
      if (i % 3 === 2) await nextTask();
    }

    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const g = out.getContext('2d');
    const img = g.createImageData(W, H), d = img.data, s = 1 / n;
    for (let y = 0; y < H; y++) {
      const row = (H - 1 - y) * W * 3;
      for (let x = 0; x < W; x++) {
        const q = row + x * 3, p = (y * W + x) * 4, noise = Math.random() * 1.4 - .7;
        d[p] = accum[q] * s + noise; d[p + 1] = accum[q + 1] * s + noise; d[p + 2] = accum[q + 2] * s + noise; d[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(out);
    tex.encoding = THREE.sRGBEncoding;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    baked[key] = tex;

    setBakeLights(false);
    cam.clearViewOffset();
    return tex;
  }

  function showRoom(room, variant, state, opts = {}) {
    const set = Sets.get(room, variant);
    const tex = baked[`${set.key}@${state}`];
    if (!set.group.parent) roomScene.add(set.group);
    for (const c of roomScene.children) if (c.isGroup) c.visible = c === set.group;
    setCamera(set.def);
    bgMat.map = tex || null;
    bgMat.needsUpdate = true;
    current = { room, variant, state, set };
    Object.assign(view, opts);
    lightDyn(state, set.def);
    placeProps();
    syncFigures();
  }

  function lightDyn(state, def) {
    const t = { day: [1.0, .55], eve: [.68, .42], night: [.34, .2] }[state];
    let a = t[0], b = t[1];
    if (def.alwaysLamp) { a = .6; b = .35; }
    dyn.a = a; dyn.b = b;
    dynHemi.color.set(state === 'night' && !def.alwaysLamp ? 0xb4c6e8 : state === 'eve' || def.alwaysLamp ? 0xffd8a8 : 0xfff4e0);
  }

  function setView(opts) { Object.assign(view, opts); }

  // Live mode: the room is lit and rendered directly, so the camera can move freely.
  // The baked image only works from the one angle it was baked at.
  let live = false, liveShadowsReady = false, liveRoom = null;
  function goLive(room, state) {
    const set = Sets.get(room), def = set.def, light = Sets.LIGHT[state], lamp = def.lamps[0];
    Sets.applyLight(state);
    setBakeLights(true);
    roomScene.overrideMaterial = null;
    const lampLevel = def.alwaysLamp ? 1 : light.lamp;
    sunL.color.set(light.sun[0]); sunL.intensity = def.noSun ? 0 : light.sun[1];
    fillL.color.set(light.fill[0]); fillL.intensity = def.noSun ? .05 : light.fill[1];
    hemi.intensity = def.noSun ? .08 : light.amb;
    lampSpot.color.set(lamp[3]); lampGlow.color.set(lamp[3]);
    lampSpot.intensity = lamp[4] * lampLevel * .9;
    lampGlow.intensity = lamp[4] * lampLevel * .55;
    sunL.position.set(def.sun[0], def.sun[1], def.sun[2]);
    sunL.target.position.set(0, 1, 0);
    fillL.position.set(0, set.H - .08, 0);
    fillL.target.position.set(0, 0, 0);
    lampSpot.position.set(lamp[0], lamp[1], lamp[2]);
    lampSpot.target.position.set(lamp[0], 0, lamp[2]);
    lampGlow.position.set(lamp[0], lamp[1], lamp[2]);
    // A bake averages many soft lights and never shows this, but one light on its own draws fine stripes across anything
    // it hits at a shallow angle, and they crawl and flicker as the camera moves. Push the shadows off the surfaces.
    if (!liveShadowsReady) {
      liveShadowsReady = true;
      for (const l of [sunL, fillL, lampSpot]) {
        l.shadow.bakeBias = l.shadow.bias;
        if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; }
      }
      sunL.shadow.mapSize.set(2048, 2048); fillL.shadow.mapSize.set(1024, 1024); lampSpot.shadow.mapSize.set(1024, 1024);
    }
    sunL.shadow.bias = -.0035; sunL.shadow.normalBias = .05;
    fillL.shadow.bias = -.005; fillL.shadow.normalBias = .05;
    lampSpot.shadow.bias = -.005; lampSpot.shadow.normalBias = .05;
    for (const l of [sunL, fillL, lampSpot]) { l.target.updateMatrixWorld(); l.shadow.needsUpdate = true; }
    renderer.shadowMap.needsUpdate = true;
    cam.clearViewOffset();
    // A slowly moving camera makes every thin bright edge crawl from pixel to pixel, and a window bar against a bright sky
    // shows it worst. So the moving shots are drawn at double size and scaled down. The bars also skip fine shadow detail.
    renderer.setPixelRatio(2);
    Sets.get(room).group.traverse(m => { if (m.isMesh && m.material === Sets.mat('trim')) m.receiveShadow = false; });
    liveRoom = room;
    live = true;
  }
  function stopLive() {
    if (live) {
      renderer.setPixelRatio(1);
      if (liveRoom) Sets.get(liveRoom).group.traverse(m => { if (m.isMesh && m.material === Sets.mat('trim')) m.receiveShadow = true; });
    }
    live = false; setBakeLights(false);
  }
  function liveCam(p, t, fov) {
    cam.fov = fov;
    cam.position.copy(p);
    cam.up.set(0, 1, 0);
    cam.lookAt(t);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }

  // ---- Figures ----
  const flat = c => new THREE.MeshPhongMaterial({ color: new THREE.Color(c), flatShading: true, shininess: 0, specular: 0 });
  const limb = (r0, r1, len, m, seg = 5) => {
    const geo = new THREE.CylinderGeometry(r0, r1, len, seg, 1);
    geo.translate(0, -len / 2, 0);
    return new THREE.Mesh(geo, m);
  };

  const POSES = {
    stand: {},
    carry: { ls: -1.15, rs: -1.15, le: -.7, re: -.7 },
    phone: { rs: -2.5, re: -2.0, ls: -.15 },
    sit: { seat: 1, rootY: -.38, lh: -1.5, rh: -1.5, lk: 1.5, rk: 1.5, ls: -.45, rs: -.45, le: -.7, re: -.7 },
    carsit: { seat: 1, rootY: -.28, lh: -1.45, rh: -1.45, lk: 1.4, rk: 1.4, ls: -.7, rs: -.7, le: -.9, re: -.9 },
    lie: { lieX: -Math.PI / 2, rootY: .56, lieZ: .85, ls: 0, rs: 0 },
    floorlie: { lieX: -Math.PI / 2, rootY: .13, lieZ: .85, ls: -.08, rs: -.08 },
    kneel: { rootY: -.42, lh: -.6, rh: -.6, lk: 2.2, rk: 2.2, ls: -.3, rs: -.3, le: -.8, re: -.8, spine: .15 },
    droop: { head: .55, ls: -.1, rs: -.1, spine: .2 },
    carslump: { seat: 1, rootY: -.28, lh: -1.45, rh: -1.45, lk: 1.4, rk: 1.4, ls: -.3, rs: -.3, le: -.4, re: -.4, spine: .3, head: .7 },
    hug: { ls: -1.3, rs: -1.3, le: -.5, re: -.5 },
    still: { seat: 1, rootY: -.38, lh: -1.5, rh: -1.5, lk: 1.5, rk: 1.5, ls: -.1, rs: -.1, le: -.4, re: -.4, head: .08 },
  };
  const JOINTS = ['ls', 'rs', 'le', 're', 'lh', 'rh', 'lk', 'rk', 'spine', 'head', 'rootY', 'lieX', 'lieZ', 'seat'];

  function makeFigure(id, spec) {
    const s = spec.scale || 1;
    const root = new THREE.Group(), body = new THREE.Group();
    root.add(body);
    const skin = flat(spec.skin), top = flat(spec.top), bot = flat(spec.bottom), hair = flat(spec.hair), shoe = flat('#1b1612');
    const hip = new THREE.Group(); hip.position.y = .85 * s; body.add(hip);
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(.14 * s, .15 * s, .14 * s, 5), bot);
    pelvis.position.y = -.02; hip.add(pelvis);
    const spine = new THREE.Group(); hip.add(spine);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.19 * s, .14 * s, .52 * s, 5), top);
    torso.position.y = .28 * s; torso.scale.z = .68; spine.add(torso);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.04 * s, .05 * s, .07 * s, 5), skin);
    neck.position.y = .57 * s; spine.add(neck);
    const head = new THREE.Group(); head.position.y = .6 * s; spine.add(head);
    const hr = .105 * (s < .8 ? s * 1.22 : s);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(hr, 0), skin);
    skull.position.y = hr * .9; skull.scale.set(.92, 1.12, 1); head.add(skull);
    const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(hr * 1.06, 0), hair);
    cap.position.set(0, hr * 1.22, -hr * .2); cap.scale.set(1, spec.hairLong ? 1.5 : .8, 1); head.add(cap);
    if (spec.hairLong) cap.position.y = hr * .85;
    const eye = new THREE.MeshBasicMaterial({ color: 0x0a0806 });
    const eyes = [];
    for (const x of [-.36, .36]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(hr * .22, hr * .17, hr * .08), eye);
      e.position.set(x * hr, hr * 1.0, hr * .95); head.add(e); eyes.push(e);
    }
    // The same smile on everyone, whatever is happening.
    const lip = new THREE.MeshBasicMaterial({ color: 0x4a1f18 });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(hr * .62, hr * .07, hr * .08), lip);
    mouth.position.set(0, hr * .46, hr * .86); head.add(mouth);
    for (const x of [-.36, .36]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(hr * .12, hr * .15, hr * .08), lip);
      c.position.set(x * hr, hr * .53, hr * .82); head.add(c);
    }

    const arm = (side) => {
      const sh = new THREE.Group(); sh.position.set(side * .205 * s, .5 * s, 0); spine.add(sh);
      sh.add(limb(.05 * s, .04 * s, .29 * s, top));
      const el = new THREE.Group(); el.position.y = -.29 * s; sh.add(el);
      el.add(limb(.04 * s, .03 * s, .27 * s, top));
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(.04 * s, 0), skin); h.position.y = -.3 * s; el.add(h);
      return { sh, el };
    };
    const leg = (side) => {
      const th = new THREE.Group(); th.position.set(side * .085 * s, -.05 * s, 0); hip.add(th);
      th.add(limb(.075 * s, .055 * s, .4 * s, bot));
      const kn = new THREE.Group(); kn.position.y = -.4 * s; th.add(kn);
      kn.add(limb(.055 * s, .04 * s, .39 * s, bot));
      const f = new THREE.Mesh(new THREE.BoxGeometry(.09 * s, .05 * s, .22 * s), shoe);
      f.position.set(0, -.39 * s, .05 * s); kn.add(f);
      return { th, kn };
    };
    const L = arm(-1), R = arm(1), LL = leg(-1), RL = leg(1);

    const blob = new THREE.Mesh(new THREE.CircleGeometry(.34 * s, 14), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .65 }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = .012;
    root.add(blob);

    const carry = new THREE.Group(); carry.position.set(0, 1.0 * s, .3 * s); root.add(carry);
    const boxM = new THREE.MeshLambertMaterial({ map: Sets.mat('card').map });
    const cbox = new THREE.Mesh(new THREE.BoxGeometry(.52 * s, .36 * s, .36 * s), boxM); carry.add(cbox);
    const clamp = new THREE.Group(); clamp.add(new THREE.Mesh(new THREE.CylinderGeometry(.016, .02, .55, 5), flat('#3a3a38')));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.09, .19, .2, 7), flat('#b89a5e')); shade.position.y = .3; clamp.add(shade);
    carry.add(clamp);
    carry.visible = false;

    const j = {};
    for (const k of JOINTS) j[k] = 0;
    const f = {
      id, spec, s, root, body, spineG: spine, head, L, R, LL, RL, mouth, carry, cbox, clamp, blob, j, pose: 'stand',
      room: null, x: 0, z: 0, r: 0, tx: 0, tz: 0, tr: 0, walkT: 0, talk: 0, y: 0, ty: 0, speed: 1.05 + Math.random() * .1,
      phase: Math.random() * 7, frozen: false, eyes, sink: 0, sinkT: 0, gx: 0, gy: 0, headY: 0,
    };
    root.visible = false;
    dynScene.add(root);
    return (figs[id] = f);
  }

  let _blob;
  function blobTex() {
    if (_blob) return _blob;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.6, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (_blob = new THREE.CanvasTexture(c));
  }

  function marksFor(room, variant) {
    const d = Sets.defs[room];
    return d.marksFor ? d.marksFor(variant) : d.marks;
  }

  function place(id, room, mark, variant, poseOverride, instant = true, yaw) {
    const f = figs[id]; if (!f) return;
    const m = marksFor(room, variant)[mark] || [0, 0, 0];
    const sameRoom = f.room === room && f.root.visible !== undefined && !instant;
    f.tx = m[0]; f.tz = m[1]; f.tr = yaw !== undefined ? yaw : m[2];
    f.pose = poseOverride || m[3] || 'stand';
    if (!sameRoom) {
      f.room = room; f.x = f.tx; f.z = f.tz; f.r = f.tr;
      const p = POSES[f.pose] || {};
      for (const k of JOINTS) f.j[k] = p[k] || 0;
    }
    syncFigure(f);
  }

  function hide(id) { const f = figs[id]; if (f) { f.room = null; f.root.visible = false; } }
  function setPose(id, pose) { if (figs[id]) figs[id].pose = pose; }
  function setCarry(id, what) {
    const f = figs[id]; if (!f) return;
    f.carry.visible = !!what;
    f.cbox.visible = what === 'box'; f.clamp.visible = what === 'lamp';
  }
  function speak(id, secs) { if (figs[id]) figs[id].talk = secs; }
  function syncFigure(f) { f.root.visible = !!current && f.room === current.room; }
  function syncFigures() { for (const id in figs) syncFigure(figs[id]); }

  function updateFig(f, dt, time) {
    const dx = f.tx - f.x, dz = f.tz - f.z, dist = Math.hypot(dx, dz);
    const walking = dist > .03;
    if (walking) {
      // An arm around you does not stop you walking. It just stops the walking from getting anywhere.
      const step = Math.min(dist, f.speed * dt * (1 - (f.held || 0)));
      f.x += dx / dist * step; f.z += dz / dist * step;
      f.r = turn(f.r, Math.atan2(dx, dz), dt * 7);
      f.walkT += dt * 6.2;
    } else {
      f.r = turn(f.r, f.tr, dt * 4);
    }
    const p = POSES[walking ? (f.carry.visible ? 'carry' : 'stand') : f.pose] || {};
    const rate = Math.min(1, dt * (walking ? 10 : 3.6));
    for (const k of JOINTS) f.j[k] += ((p[k] || 0) - f.j[k]) * rate;
    const swing = walking ? Math.sin(f.walkT) * .55 : 0;
    const j = f.j;
    const idle = f.frozen ? 0 : Math.sin(time * 1.1 + f.phase) * .012;
    f.L.sh.rotation.x = j.ls - swing * (f.carry.visible ? 0 : .7);
    f.R.sh.rotation.x = j.rs + swing * (f.carry.visible ? 0 : .7);
    f.L.el.rotation.x = j.le; f.R.el.rotation.x = j.re;
    f.LL.th.rotation.x = j.lh + swing; f.RL.th.rotation.x = j.rh - swing;
    f.LL.kn.rotation.x = j.lk + Math.max(0, -swing) * .9; f.RL.kn.rotation.x = j.rk + Math.max(0, swing) * .9;
    f.spineG.rotation.x = j.spine + idle;
    const talkNod = f.talk > 0 ? Math.sin(time * 9 + f.phase) * .035 : 0;
    f.head.rotation.x = j.head + talkNod + (f.frozen ? 0 : Math.sin(time * .43 + f.phase) * .03);
    f.mouth.scale.y = f.talk > 0 ? 1 + Math.abs(Math.sin(time * 15)) * 2.5 : 1;
    f.talk = Math.max(0, f.talk - dt);

    // Everyone in the house blinks at exactly the same moment.
    const shut = !f.frozen && (time % 4.7) < .13;
    f.eyes.forEach(e => { e.scale.y = shut ? .12 : 1; });

    // Now and then, everyone in the room looks at the camera. Then they stop.
    let wantHead = 0;
    if (time < lookUntil && !f.frozen && !walking && Math.abs(j.lieX) < .1) {
      let d = Math.atan2(cam.position.x - f.x, cam.position.z - f.z) - f.r;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      wantHead = Math.max(-1.45, Math.min(1.45, d));
    }
    f.headY += (wantHead - f.headY) * Math.min(1, dt * 11);
    f.head.rotation.y = f.headY;
    // Looking down at the arm.
    if (f.stare > 0) { f.stare -= dt; f.head.rotation.x += .5; }

    // Knocked by a hand arriving too fast, then back to the mark as if nothing happened.
    f.kvx = (f.kvx || 0) + (-34 * (f.kx || 0) - 7 * (f.kvx || 0)) * dt;
    f.kvz = (f.kvz || 0) + (-34 * (f.kz || 0) - 7 * (f.kvz || 0)) * dt;
    f.kx = (f.kx || 0) + f.kvx * dt;
    f.kz = (f.kz || 0) + f.kvz * dt;

    // Sinking: the floor is in the depth buffer, so it simply hides them. The stutter is the phasing.
    f.sink += Math.sign(f.sinkT - f.sink) * Math.min(Math.abs(f.sinkT - f.sink), dt * (f.sinkRate || .4));
    if (f.sink > .005 && Math.random() < dt * 5) { f.gx = (Math.random() - .5) * .035; f.gy = (Math.random() - .5) * .03; }
    if (f.sink <= .005) { f.gx = 0; f.gy = 0; }
    f.body.position.y = j.rootY + j.seat * (1 - f.s) * .85 + (walking ? Math.abs(Math.sin(f.walkT)) * .018 : 0) - f.sink + f.gy;
    f.body.rotation.x = j.lieX;
    f.body.position.z = j.lieZ * f.s;
    f.body.position.x = f.gx;
    f.root.position.set(f.x + f.kx, 0, f.z + f.kz);
    f.root.rotation.y = f.r;
    f.blob.visible = Math.abs(j.lieX) < .1 && j.rootY > -.2 && f.sink < .03;
  }
  function setSink(id, v, rate, instant) {
    const f = figs[id]; if (!f) return;
    f.sinkT = v; f.sinkRate = rate;
    if (instant) f.sink = v;
  }
  function turn(a, b, k) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * Math.min(1, k * .05 + .02 + k * .02);
  }

  // ---- Dynamic props ----
  function buildProps() {
    const card = new THREE.MeshLambertMaterial({ map: Sets.mat('card').map });
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(.56, .4, .46), card);
      m.visible = false; dynScene.add(m); dyn.boxes.push(m);
    }
    const gm = new THREE.MeshLambertMaterial({ color: 0x7c7a68 });
    dyn.gdoor = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(4.3, .39, .05), gm);
      p.position.y = .2 + i * .4; dyn.gdoor.add(p);
    }
    dyn.gdoor.position.set(0, 2.4, -3.85);
    dynScene.add(dyn.gdoor);

    const dm = new THREE.MeshLambertMaterial({ color: 0xe6e2d4 });
    dyn.hdoor = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.13, .07), dm);
    slab.position.set(.5, 1.07, 0); dyn.hdoor.add(slab);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, .14), new THREE.MeshLambertMaterial({ color: 0x8b8d88 }));
    knob.position.set(.9, 1, .05); dyn.hdoor.add(knob);
    dyn.hdoor.position.set(-.5, 0, -3.98);
    dyn.hdoorAngle = 0; dyn.hdoorTarget = 0;
    dynScene.add(dyn.hdoor);

    dyn.plate = new THREE.Group();
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, .02, 10), new THREE.MeshLambertMaterial({ color: 0xc7c2ad }));
    const food = new THREE.Mesh(new THREE.BoxGeometry(.1, .04, .08), new THREE.MeshLambertMaterial({ color: 0x6a3d22 }));
    food.position.y = .03; dyn.plate.add(pl, food); dyn.plateFood = food;
    const note = new THREE.Mesh(new THREE.BoxGeometry(.16, .006, .12), new THREE.MeshLambertMaterial({ color: 0xd8d0b6 }));
    note.position.y = .02; note.visible = false; dyn.plate.add(note); dyn.plateNote = note;
    dyn.plate.position.set(1.5, .49, -1.84);
    dyn.plate.visible = false;
    dynScene.add(dyn.plate);

    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(190,190,175,.6)'); gr.addColorStop(1, 'rgba(190,190,175,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const ht = new THREE.CanvasTexture(c);
    for (let i = 0; i < 22; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ht, transparent: true, opacity: 0, depthWrite: false }));
      sp.visible = false; sp.userData = { t: Math.random(), a: Math.random() * 6.28, r: Math.random() };
      dynScene.add(sp); dyn.haze.push(sp);
    }
  }

  let props = { boxes: {}, garageClosed: 0, hallOpen: 0, plate: null };
  function setProps(p) { Object.assign(props, p); placeProps(); }
  function placeProps() {
    if (!current) return;
    const { room, variant } = current;
    const d = Sets.defs[room];
    const spots = d.boxSpotsFor ? d.boxSpotsFor(variant) : (d.boxSpots || []);
    const n = Math.min(props.boxes[room] || 0, spots.length);
    dyn.boxes.forEach((m, i) => {
      if (i < n) {
        const s = spots[i];
        m.visible = true;
        m.position.set(s[0], s[2] ? .6 : .2, s[1]);
        m.rotation.y = (i * 2.399) % .7 - .35;
      } else m.visible = false;
    });
    dyn.gdoor.visible = room === 'garage';
    dyn.hdoor.visible = room === 'hall';
    dyn.plate.visible = room === 'crawl' && !!props.plate;
    dyn.plateFood.visible = props.plate === 'food';
    dyn.plateNote.visible = props.plate === 'note';
    if (room === 'hall' && variant) {
      const w = parseFloat(variant);
      dyn.hdoor.scale.x = Math.min(1, (w - .1) / 1.1);
      dyn.hdoor.position.x = -Math.min(1.1, w - .1) / 2;
    }
  }

  function setHaze(v) { hazeTarget = v; }
  function setGarage(v) { props.garageTarget = v; }
  function setHallDoor(v) { dyn.hdoorTarget = v; }
  function hallDoorMoving() { return Math.abs(dyn.hdoorAngle - dyn.hdoorTarget) > .02; }

  let time = 0, lookUntil = 0, nextLook = 26;
  function frame(dt) {
    time += dt;
    if (!current) return;
    if (time > nextLook) { lookUntil = time + 1.7; nextLook = time + 24 + Math.random() * 22; }
    for (const id in figs) { if (figs[id].room) updateFig(figs[id], dt, time); }

    // Garage door and haze keep moving whether or not you are looking.
    const gt = props.garageTarget || 0;
    props.garageClosed += Math.sign(gt - props.garageClosed) * Math.min(Math.abs(gt - props.garageClosed), dt * .32);
    dyn.gdoor.position.y = 2.42 * (1 - props.garageClosed);
    hazeNow += (hazeTarget - hazeNow) * Math.min(1, dt * .18);
    const showHaze = current.room === 'garage' && hazeNow > .01;
    dyn.haze.forEach(sp => {
      sp.visible = showHaze;
      if (!showHaze) return;
      const u = sp.userData;
      u.t = (u.t + dt * .05) % 1;
      const spread = u.t * 2.4;
      sp.position.set(Math.sin(u.a) * spread + (u.r - .5), .3 + u.t * 1.2, 1.9 + Math.cos(u.a) * spread * .8 - u.t * .8);
      sp.scale.setScalar(.6 + u.t * 3.2);
      sp.material.opacity = Math.sin(u.t * Math.PI) * hazeNow * .22;
    });

    dyn.hdoorAngle += (dyn.hdoorTarget - dyn.hdoorAngle) * Math.min(1, dt * 2.6);
    dyn.hdoor.rotation.y = dyn.hdoorAngle * 1.5;

    dimNow += (view.dim - dimNow) * Math.min(1, dt * 2.2);
    tintNow.r += (view.tint[0] - tintNow.r) * Math.min(1, dt * .9);
    tintNow.g += (view.tint[1] - tintNow.g) * Math.min(1, dt * .9);
    tintNow.b += (view.tint[2] - tintNow.b) * Math.min(1, dt * .9);
    // A flicker is instant on purpose: dim eases, a bad connection doesn't.
    const lit = dimNow * view.flick;
    bgMat.color.setRGB(lit * tintNow.r, lit * tintNow.g, lit * tintNow.b);
    dynHemi.intensity = dyn.a * lit;
    dynDir.intensity = dyn.b * lit;

    renderer.setRenderTarget(null);
    renderer.clear();
    if (live) {
      renderer.render(roomScene, cam);
      renderer.render(dynScene, cam);
      return;
    }
    renderer.render(bgScene, bgCam);
    renderer.clearDepth();
    roomScene.overrideMaterial = depthMat;
    renderer.render(roomScene, cam);
    roomScene.overrideMaterial = null;
    renderer.render(dynScene, cam);
    drawOutline();
  }

  // A glow around one object's real shape. Its pieces are drawn white to a small mask, and the mask's edge is painted over the frame.
  let glow = null;
  function setupGlow() {
    const rt = new THREE.WebGLRenderTarget(640, 360, { depthBuffer: false });
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false,
      uniforms: { mask: { value: rt.texture }, t: { value: 0 }, px: { value: new THREE.Vector2(1 / 640, 1 / 360) } },
      vertexShader: 'varying vec2 u; void main(){ u = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `varying vec2 u; uniform sampler2D mask; uniform float t; uniform vec2 px;
        void main(){
          float c = texture2D(mask, u).r, near = 0., far = 0.;
          for (int i = 0; i < 16; i++) {
            float a = float(i) * 0.3927; vec2 d = vec2(cos(a), sin(a)) * px;
            near = max(near, texture2D(mask, u + d * 1.6).r);
            far += texture2D(mask, u + d * 4.5).r + texture2D(mask, u + d * 8.).r * .6;
          }
          far /= 25.6;
          float edge = max(near - c, 0.), halo = max(far - c, 0.);
          float pulse = .82 + .18 * sin(t * 4.);
          float a = clamp(edge * .95 + halo * 1.05 * pulse + c * .12, 0., 1.);
          gl_FragColor = vec4(mix(vec3(1., .78, .36), vec3(1., .97, .82), edge), a);
        }`,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    glow = { rt, mat, scene, shapes: new THREE.Scene(), current: null };
  }
  function setOutline(group) {
    if (!glow) setupGlow();
    if (glow.current === group) return;
    if (glow.current) glow.shapes.remove(glow.current);
    glow.current = group;
    if (group) glow.shapes.add(group);
  }
  function drawOutline() {
    if (!glow || !glow.current) return;
    glow.mat.uniforms.t.value = time;
    renderer.setRenderTarget(glow.rt);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(glow.shapes, cam);
    renderer.setRenderTarget(null);
    renderer.render(glow.scene, bgCam);
  }

  function project(p) {
    const v = new THREE.Vector3(p[0], p[1], p[2]).project(cam);
    return { x: (v.x + 1) / 2 * 1280, y: (1 - v.y) / 2 * 720 };
  }

  function spotsFor(room, variant) {
    const d = Sets.defs[room];
    return d.spotsFor ? d.spotsFor(variant) : d.spots;
  }

  return {
    init, bake, isBaked, showRoom, setView, frame, project, spotsFor, marksFor, makeFigure, place, hide, setPose, setCarry, speak,
    setProps, setHaze, setGarage, setHallDoor, hallDoorMoving, setSink, figs, setFrozen: (id, v) => { if (figs[id]) figs[id].frozen = v; },
    setSamples: n => { samples = n; },
    scene: () => dynScene, camera: () => cam, goLive, stopLive, liveCam,
    setOutline,
    bakedTex: (room, state) => baked[`${Sets.get(room).key}@${state}`] || null,
    lookNow: secs => { lookUntil = time + secs; },
  };
})();
