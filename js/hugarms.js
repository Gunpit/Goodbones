// A pair of arms in hugging formation. They come out of an object side by side, spread open like
// parentheses, keep their hands turned inward, and close around whoever they reach.
// Each arm is one smooth tube, rebuilt every frame, shaped and textured like the thing it came out of.
const HugArms = (() => {
  const RINGS = 30, SIDES = 12;

  // m: material name, r: thickness, wide: how far apart the shoulders are, box: square cross-section,
  // prof: how the thickness changes along the arm, band: rings of a second material, every: how many, tip: fingers.
  const LOOKS = {
    fridge: { m: 'white', shine: 70, r: .078, wide: .3, box: true, band: 'steel', every: 3, tip: 'steel', fat: 1.2 },
    cabinet: { m: 'woodl', r: .068, wide: .24, box: true, band: 'steel', every: 2, tip: 'steel', fat: .95 },
    cupboard: { m: 'woodl', r: .062, wide: .26, box: true, band: 'woodd', every: 4, tip: 'woodl', fat: 1 },
    stove: { m: 'enamel', shine: 60, r: .074, wide: .26, box: true, band: 'iron', every: 2, tip: 'iron', fat: 1.05 },
    sink: { m: 'steel', shine: 95, r: .042, wide: .2, band: 'steel', every: 0, tip: 'steel', fat: .85, prof: 'pipe' },
    table: { m: 'woodd', r: .05, wide: .34, box: true, band: 'woodd', every: 0, tip: 'woodd', fat: .95 },
    chair: { m: 'woodd', r: .034, wide: .16, band: 'woodd', every: 2, tip: 'woodd', fat: .75, prof: 'spindle' },
    radiator: { m: 'iron', shine: 30, r: .056, wide: .26, band: 'iron', every: 0, tip: 'iron', fat: 1, prof: 'ribs' },
    wall: { m: 'mustard', r: .085, wide: .36, band: 'trim', every: 7, tip: 'mustard', fat: 1.15 },
    door: { m: 'door', r: .07, wide: .3, box: true, band: 'doorp', every: 5, tip: 'door', fat: 1.05 },
    floor: { m: 'lino', r: .075, wide: .3, band: 'trim', every: 8, tip: 'lino', fat: 1.05 },
    phone: { m: 'dark', r: .02, wide: .14, band: 'iron', every: 0, tip: 'dark', fat: .7, prof: 'coil' },
    window: { m: 'trim', r: .046, wide: .34, box: true, band: 'trim', every: 3, tip: 'trim', fat: .9 },
    ceiling: { m: 'plaster', r: .07, wide: .3, band: 'trim', every: 6, tip: 'plaster', fat: 1 },
  };

  const profile = {
    pipe: t => 1 + (Math.abs((t * 6) % 1 - .5) < .04 ? .3 : 0),
    spindle: t => 1 + .55 * Math.pow(Math.abs(Math.sin(t * Math.PI * 5)), 3),
    ribs: t => 1 + .62 * (Math.sin(t * Math.PI * 22) > 0 ? 1 : 0),
    coil: t => 1 + .9 * Math.abs(Math.sin(t * Math.PI * 26)),
  };
  // An arm's own shape: thick at the shoulder, a dip at the elbow, a real wrist.
  const armShape = t => {
    // Upper arm swells, narrows to the elbow, the forearm swells again and tapers to a wrist.
    const upper = Math.exp(-Math.pow((t - .22) / .16, 2)) * .14;
    const fore = Math.exp(-Math.pow((t - .68) / .12, 2)) * .1;
    const elbow = Math.exp(-Math.pow((t - .47) / .07, 2)) * .1;
    return (1 - .46 * t + upper + fore - elbow) * (t > .95 ? 1 - (t - .95) * 2.4 : 1);
  };

  const cache = {};
  function materialFor(name, shine) {
    const key = name + (shine || 0);
    if (cache[key]) return cache[key];
    const base = Sets.mat(name);
    const m = new THREE.MeshPhongMaterial({
      color: base.map ? 0xffffff : base.color.clone(), map: base.map || null, shininess: shine || 8,
      specular: new THREE.Color(shine ? 0x777777 : 0x141414), side: THREE.DoubleSide,
    });
    return (cache[key] = m);
  }

  function makeTube(scene) {
    const geo = new THREE.BufferGeometry();
    const count = (RINGS + 1) * (SIDES + 1);
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const uv = new Float32Array(count * 2), idx = [];
    for (let r = 0, n = 0; r <= RINGS; r++) for (let s = 0; s <= SIDES; s++, n++) { uv[n * 2] = s / SIDES; uv[n * 2 + 1] = r / RINGS * 3; }
    for (let r = 0; r < RINGS; r++) for (let s = 0; s < SIDES; s++) {
      const a = r * (SIDES + 1) + s, b = a + SIDES + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial());
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }

  function makeHand(scene) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(.06, 14, 12), new THREE.MeshPhongMaterial());
    palm.scale.set(1.0, .36, 1.1); palm.position.z = .045;
    g.add(palm);
    const fingers = [];
    const seg = (l, r) => { const geo = new THREE.CylinderGeometry(r * .82, r, l, 8); geo.rotateX(Math.PI / 2); geo.translate(0, 0, l / 2); return geo; };
    for (let i = 0; i < 5; i++) {
      const thumb = i === 4;
      const base = new THREE.Group();
      const l = thumb ? .06 : .082 - Math.abs(i - 1.3) * .007;
      const m1 = new THREE.Mesh(seg(l, .0155), new THREE.MeshPhongMaterial());
      base.add(m1);
      const mid = new THREE.Group(); mid.position.z = l; base.add(mid);
      const m2 = new THREE.Mesh(seg(l * .8, .013), m1.material); mid.add(m2);
      const tip = new THREE.Group(); tip.position.z = l * .8; mid.add(tip);
      const m3 = new THREE.Mesh(seg(l * .6, .011), m1.material); tip.add(m3);
      if (thumb) { base.position.set(0, -.005, .01); base.rotation.y = 0; }
      else base.position.set(-.048 + i * .032, 0, .095);
      g.add(base);
      fingers.push({ base, mid, tip, mat: m1.material, thumb });
    }
    scene.add(g);
    return { g, palm, fingers };
  }

  const V = () => new THREE.Vector3();
  const tmp = { a: V(), b: V(), c: V(), t: V(), n: V(), bn: V(), up: new THREE.Vector3(0, 1, 0), p: V(), m: new THREE.Matrix4() };

  class Arm {
    constructor(scene) {
      this.tube = makeTube(scene);
      this.hand = makeHand(scene);
      this.bands = [];
      const torus = new THREE.TorusGeometry(1, .1, 6, 16);
      for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(torus, new THREE.MeshPhongMaterial()); b.visible = false; scene.add(b); this.bands.push(b); }
      this.P = [V(), V(), V(), V()];
      this.points = Array.from({ length: RINGS + 1 }, V);
    }
    setLook(look) {
      this.look = look;
      this.tube.material = materialFor(look.m, look.shine);
      this.hand.palm.material = this.tube.material;
      const tip = materialFor(look.tip, look.shine);
      this.hand.fingers.forEach(f => { f.base.children[0].material = tip; f.mid.children[0].material = tip; f.tip.children[0].material = tip; });
      const bm = materialFor(look.band, look.shine);
      this.bands.forEach(b => { b.material = bm; });
    }
    visible(v) {
      this.tube.visible = v; this.hand.g.visible = v;
      if (!v) this.bands.forEach(b => { b.visible = false; });
    }
    // P[0..3] is a cubic curve from shoulder to wrist. side: -1 or 1. curl: 0 open, 1 clasped.
    update(side, curl, ext = 1) {
      const P = this.P, pts = this.points, look = this.look;
      const pos = this.tube.geometry.attributes.position, nor = this.tube.geometry.attributes.normal;
      for (let i = 0; i <= RINGS; i++) {
        const u = (i / RINGS) * ext, w = 1 - u;
        pts[i].set(0, 0, 0)
          .addScaledVector(P[0], w * w * w).addScaledVector(P[1], 3 * w * w * u)
          .addScaledVector(P[2], 3 * w * u * u).addScaledVector(P[3], u * u * u);
      }
      const prof = look.prof ? profile[look.prof] : null;
      const nrm = tmp.n.set(1, 0, 0), t = tmp.t, bn = tmp.bn;
      let bandI = 0;
      for (let i = 0; i <= RINGS; i++) {
        t.copy(pts[Math.min(RINGS, i + 1)]).sub(pts[Math.max(0, i - 1)]);
        if (t.lengthSq() < 1e-9) t.set(0, 1, 0);
        t.normalize();
        // Keep the cross-section from twisting as it goes along.
        nrm.addScaledVector(t, -nrm.dot(t));
        if (nrm.lengthSq() < 1e-6) nrm.set(t.y, -t.x, 0);
        nrm.normalize();
        bn.crossVectors(t, nrm);
        const f = i / RINGS;
        const r = look.r * .78 * (this.thin || 1) * armShape(f) * (prof ? prof(f) : 1);
        for (let s = 0; s <= SIDES; s++) {
          const a = s / SIDES * Math.PI * 2;
          let cx = Math.cos(a), cy = Math.sin(a);
          if (look.box) {
            // A squared-off cross-section with slightly soft corners.
            const k = 1 / Math.max(Math.abs(cx), Math.abs(cy));
            cx *= k * .92; cy *= k * .92;
          }
          const px = pts[i].x + (nrm.x * cx + bn.x * cy) * r, py = pts[i].y + (nrm.y * cx + bn.y * cy) * r, pz = pts[i].z + (nrm.z * cx + bn.z * cy) * r;
          const n = i * (SIDES + 1) + s;
          pos.setXYZ(n, px, py, pz);
          nor.setXYZ(n, nrm.x * Math.cos(a) + bn.x * Math.sin(a), nrm.y * Math.cos(a) + bn.y * Math.sin(a), nrm.z * Math.cos(a) + bn.z * Math.sin(a));
        }
        if (look.every && i > 1 && i < RINGS - 1 && i % look.every === 0 && bandI < this.bands.length) {
          const b = this.bands[bandI++];
          b.visible = true;
          b.position.copy(pts[i]);
          tmp.m.lookAt(tmp.a.copy(pts[i]).add(t), pts[i], tmp.up);
          b.quaternion.setFromRotationMatrix(tmp.m);
          const br = r * 1.02;
          b.scale.set(br, br, br * .6);
        }
      }
      for (let i = bandI; i < this.bands.length; i++) this.bands[i].visible = false;
      pos.needsUpdate = true; nor.needsUpdate = true;

      // The hand: palm toward the middle, fingers along the end of the arm, curling in.
      const end = pts[RINGS], g = this.hand.g;
      t.copy(pts[RINGS]).sub(pts[RINGS - 2]).normalize();
      g.position.copy(end);
      tmp.b.copy(tmp.up).addScaledVector(t, -tmp.up.dot(t)).normalize();
      tmp.c.crossVectors(tmp.b, t).normalize();
      // Y of the hand points outward from the embrace, so a finger curl closes inward.
      tmp.m.makeBasis(tmp.c, tmp.b, t);
      g.quaternion.setFromRotationMatrix(tmp.m);
      g.rotateZ(side * (Math.PI / 2));
      const scale = .85 + look.fat * .22;
      g.scale.setScalar(scale);
      this.hand.fingers.forEach((f, i) => {
        // Open hands are spread and slightly cupped. Closed hands press flat against whatever they found.
        const c = f.thumb ? curl * .3 + .12 : .16 + curl * .32 + i * .012;
        f.base.rotation.x = c * .8;
        f.mid.rotation.x = c * 1.0;
        f.tip.rotation.x = c * .7;
        if (!f.thumb) f.base.rotation.y = (i - 1.5) * .15 * (1 - curl * .7);
        if (f.thumb) { f.base.rotation.y = side * -.95; f.base.position.x = side * -.058; }
      });
    }
  }

  return { Arm, LOOKS };
})();
