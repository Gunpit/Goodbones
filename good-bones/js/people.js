// The family, remodeled: smooth bodies with real proportions, painted faces, hands with fingers.
// Everyone still has the same fixed smile and still blinks at the same moment.
const People = (() => {
  const phong = (color, shininess = 6, extra = {}) => new THREE.MeshPhongMaterial({ color: new THREE.Color(color), shininess, specular: new THREE.Color(0x151515), ...extra });

  // A rounded limb from the joint downward.
  function limb(r0, r1, len, mat) {
    const pts = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const bulge = Math.sin(t * Math.PI) * (r0 + r1) * .07;
      pts.push(new THREE.Vector2(Math.max(.001, r0 + (r1 - r0) * t + bulge), -t * len));
    }
    pts.unshift(new THREE.Vector2(.001, r0 * .35));
    pts.push(new THREE.Vector2(.001, -len - r1 * .35));
    return new THREE.Mesh(new THREE.LatheGeometry(pts, 14), mat);
  }

  // A shape turned from a [radius, height] outline, then squashed front to back.
  function turned(profile, mat, depth = .72) {
    const geo = new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(Math.max(.001, p[0]), p[1])), 20);
    geo.scale(1, 1, depth);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }

  function faceTexture(spec, shut) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = spec.skin; g.fillRect(0, 0, 1024, 512);
    const cx = 256, y0 = 256;  // the middle of the face, in sphere coordinates
    const blush = g.createRadialGradient(0, 0, 2, 0, 0, 46);
    blush.addColorStop(0, spec.blush); blush.addColorStop(1, 'rgba(0,0,0,0)');
    for (const s of [-1, 1]) { g.save(); g.translate(cx + s * 62, y0 + 44); g.fillStyle = blush; g.fillRect(-50, -50, 100, 100); g.restore(); }
    // Sockets.
    for (const s of [-1, 1]) {
      const x = cx + s * 44, y = y0 - 22;
      g.fillStyle = 'rgba(90,50,35,.16)'; g.beginPath(); g.ellipse(x, y - 2, 28, 15, 0, 0, 7); g.fill();
      if (shut) {
        g.strokeStyle = 'rgba(50,28,18,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y + 6, x + 20, y); g.stroke();
      } else {
        g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - 21, y); g.quadraticCurveTo(x, y - 14, x + 21, y); g.quadraticCurveTo(x, y + 11, x - 21, y); g.fill();
        g.save(); g.beginPath(); g.moveTo(x - 21, y); g.quadraticCurveTo(x, y - 14, x + 21, y); g.quadraticCurveTo(x, y + 11, x - 21, y); g.clip();
        g.fillStyle = spec.iris; g.beginPath(); g.arc(x, y - 1, 10, 0, 7); g.fill();
        g.fillStyle = '#0d0a08'; g.beginPath(); g.arc(x, y - 1, 5, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x + 3, y - 4, 2, 0, 7); g.fill();
        g.restore();
        g.strokeStyle = 'rgba(30,18,12,.9)'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - 22, y + 1); g.quadraticCurveTo(x, y - 15, x + 22, y + 1); g.stroke();
      }
      // Brow.
      g.strokeStyle = spec.brow; g.lineWidth = spec.browW; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 25, y - 21 + (s > 0 ? -2 : 2)); g.quadraticCurveTo(x, y - 31, x + 25, y - 21 + (s > 0 ? 2 : -2)); g.stroke();
    }
    // Nose shading.
    g.strokeStyle = 'rgba(90,50,35,.28)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 8, y0 - 12); g.quadraticCurveTo(cx - 11, y0 + 24, cx - 14, y0 + 36); g.stroke();
    g.fillStyle = 'rgba(70,35,25,.45)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 8, y0 + 40, 4.5, 2.6, 0, 0, 7); g.fill(); }
    // The smile. It is exactly the same on everyone and a little too wide.
    g.fillStyle = spec.lip; g.beginPath(); g.moveTo(cx - 38, y0 + 66); g.quadraticCurveTo(cx - 14, y0 + 60, cx, y0 + 64); g.quadraticCurveTo(cx + 14, y0 + 60, cx + 38, y0 + 66); g.quadraticCurveTo(cx, y0 + 92, cx - 38, y0 + 66); g.fill();
    g.fillStyle = '#f2eee2'; g.beginPath(); g.moveTo(cx - 29, y0 + 68); g.quadraticCurveTo(cx, y0 + 72, cx + 29, y0 + 68); g.quadraticCurveTo(cx, y0 + 83, cx - 29, y0 + 68); g.fill();
    g.strokeStyle = 'rgba(70,35,25,.35)'; g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 45, y0 + 54); g.quadraticCurveTo(cx + s * 50, y0 + 66, cx + s * 42, y0 + 76); g.stroke(); }
    if (spec.stubble) { g.fillStyle = 'rgba(50,35,25,.16)'; g.beginPath(); g.ellipse(cx, y0 + 76, 66, 42, 0, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }

  function makeHand(mat, side, s) {
    const h = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(.042 * s, 12, 10), mat);
    palm.scale.set(.95, 1.2, .5); palm.position.y = -.035 * s; h.add(palm);
    for (let i = 0; i < 4; i++) {
      const f = limb(.0098 * s, .0078 * s, .068 * s - Math.abs(i - 1.5) * .006 * s, mat);
      f.position.set((-.027 + i * .018) * s, -.08 * s, 0);
      f.rotation.x = -.2;
      h.add(f);
    }
    const th = limb(.011 * s, .009 * s, .05 * s, mat);
    th.position.set(side * -.038 * s, -.04 * s, .01 * s);
    th.rotation.z = side * -.7;
    h.add(th);
    return h;
  }

  // spec: skin, blush, lip, iris, brow, browW, hair, hairStyle, top, topDark, bottom, shoe, height(1 = 1.72m), bulk
  function make(spec) {
    const s = spec.height || 1, b = spec.bulk || 1;
    const root = new THREE.Group();
    const skin = phong(spec.skin, 12), top = phong(spec.top, 3), bottom = phong(spec.bottom, 3), hairM = phong(spec.hair, 22), shoe = phong(spec.shoe || '#23180f', 35);
    const hips = new THREE.Group(); hips.position.y = .92 * s; root.add(hips);
    const pelvis = turned([[.001, -.1], [.1, -.085], [.158, -.03], [.165, .03], [.145, .09], [.001, .1]].map(p => [p[0] * s * b, p[1] * s]), bottom, .68);
    hips.add(pelvis);

    const spine = new THREE.Group(); spine.position.y = .06 * s; hips.add(spine);
    const shoulderR = spec.shoulder || .19;
    const torso = turned([[.13, 0], [.138, .08], [.13, .15], [.15, .27], [shoulderR * .96, .4], [shoulderR, .455], [.14, .5], [.05, .53], [.001, .535]].map(p => [p[0] * s * b, p[1] * s]), top, .64);
    spine.add(torso);
    // Collar, so she is wearing something rather than being coated in it.
    const collar = new THREE.Mesh(new THREE.TorusGeometry(.052 * s, .014 * s, 8, 16), phong(spec.topDark || spec.top, 3));
    collar.rotation.x = Math.PI / 2 - .25; collar.position.set(0, .515 * s, .004 * s); spine.add(collar);
    if (spec.buttons) for (let i = 0; i < 5; i++) { const bt = new THREE.Mesh(new THREE.SphereGeometry(.0078 * s, 6, 6), phong('#e8dfc8', 40)); bt.position.set(0, (.13 + i * .078) * s, (.094 + (i > 1 ? .012 : 0)) * s * b); spine.add(bt); }

    const neck = limb(.043 * s, .05 * s, .08 * s, skin);
    neck.rotation.x = Math.PI; neck.position.set(0, .515 * s, 0); spine.add(neck);

    const head = new THREE.Group(); head.position.set(0, .585 * s, .008 * s); spine.add(head);
    const hr = .108 * (spec.headScale || 1) * s;
    const headGeo = new THREE.SphereGeometry(hr, 32, 24);
    // Shape the sphere into a head: a narrower jaw, a real chin, a flatter back.
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const v = y / hr;
      const jaw = v < 0 ? 1 - .34 * v * v : 1;
      x *= .88 * jaw; z *= .98 * (v < 0 ? 1 - .1 * v * v : 1);
      y *= v < 0 ? 1.26 : 1.06;
      if (z < 0) z *= .93;
      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();
    const openTex = faceTexture(spec, false), shutTex = faceTexture(spec, true);
    const faceMat = new THREE.MeshPhongMaterial({ map: openTex, shininess: 10, specular: new THREE.Color(0x121212) });
    const skull = new THREE.Mesh(headGeo, faceMat);
    skull.position.y = hr * .92; head.add(skull);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(hr * .17, 10, 8), skin);
    nose.scale.set(.72, 1.2, 1); nose.position.set(0, hr * .78, hr * .95); head.add(nose);
    for (const sd of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(hr * .17, 8, 8), skin);
      ear.scale.set(.42, 1, .72); ear.position.set(sd * hr * .88, hr * .86, -hr * .05); head.add(ear);
    }

    // Hair.
    const cap = new THREE.Mesh(new THREE.SphereGeometry(hr * 1.06, 24, 16, 0, Math.PI * 2, 0, Math.PI * .56), hairM);
    cap.position.set(0, hr * 1.03, -hr * .08); cap.scale.set(.96, 1.04, 1.03); cap.rotation.x = -.38; head.add(cap);
    if (spec.hairStyle === 'bob' || spec.hairStyle === 'long') {
      const len = spec.hairStyle === 'long' ? 1.55 : 1.05;
      const drape = turned([[hr * .86, hr * .95], [hr * .98, hr * .5], [hr * .96, 0], [hr * .88, -hr * .6 * len], [hr * .62, -hr * .95 * len], [.001, -hr * .9 * len]], hairM, .78);
      drape.position.set(0, hr * .78, -hr * .36); head.add(drape);
      for (const sd of [-1, 1]) {
        const lock = new THREE.Mesh(new THREE.SphereGeometry(hr * .32, 10, 10), hairM);
        lock.scale.set(.5, 2.1 * Math.min(1.2, len), .78); lock.position.set(sd * hr * .78, hr * .48, hr * .1); head.add(lock);
      }
    }

    const armR = spec.armR || .043;
    const arm = side => {
      const sh = new THREE.Group(); sh.position.set(side * (shoulderR - .008) * s * b, .445 * s, 0); spine.add(sh);
      sh.add(limb(armR * s, armR * .78 * s, .285 * s, top));
      const el = new THREE.Group(); el.position.y = -.285 * s; sh.add(el);
      el.add(limb(armR * .76 * s, armR * .55 * s, .25 * s, top));
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(armR * .6 * s, armR * .6 * s, .018 * s, 12), phong(spec.topDark || spec.top, 3)); cuff.position.y = -.24 * s; el.add(cuff);
      const hand = makeHand(skin, side, s * (spec.handScale || 1)); hand.position.y = -.255 * s; el.add(hand);
      sh.rotation.z = side * .09;
      return { sh, el, side, hand };
    };
    const legR = spec.legR || .075;
    const leg = side => {
      const th = new THREE.Group(); th.position.set(side * .083 * s * b, -.05 * s, 0); hips.add(th);
      th.add(limb(legR * s * b, legR * .72 * s, .43 * s, bottom));
      const kn = new THREE.Group(); kn.position.y = -.43 * s; th.add(kn);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(legR * .72 * s, 12, 10), bottom); kn.add(knee);
      kn.add(limb(legR * .68 * s, legR * .45 * s, .41 * s, bottom));
      const ft = new THREE.Group(); ft.position.y = -.42 * s; kn.add(ft);
      const foot = new THREE.Mesh(new THREE.SphereGeometry(.05 * s, 12, 8), shoe);
      foot.scale.set(.86, .62, 2.2); foot.position.set(0, -.012 * s, .055 * s); ft.add(foot);
      return { th, kn, ft };
    };
    const L = arm(-1), R = arm(1), LL = leg(-1), RL = leg(1);

    const blob = new THREE.Mesh(new THREE.CircleGeometry(.36 * s, 20), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .55 }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = .014;
    root.add(blob);

    return {
      root, hips, spine, head, torso, L, R, LL, RL, s, blob, faceMat, openTex, shutTex,
      sway: 0, headRoll: 0, squeeze: 0, patA: 0,
      x: 0, z: 0, yaw: 0, headYaw: 0, headPitch: 0, walkT: 0, moving: 0, seated: 0, reachA: 0, phase: Math.random() * 7, bracing: 0,
      chest(out) { out.set(0, .34 * s, .02 * s); return spine.localToWorld(out); },
    };
  }

  let _shadow;
  function shadowTex() {
    if (_shadow) return _shadow;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.6, 'rgba(0,0,0,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (_shadow = new THREE.CanvasTexture(c));
  }

  // Every frame: place the rig from its state. Walking, sitting, being held, and turning the head.
  function pose(p, dt, time) {
    p.root.position.set(p.x, 0, p.z);
    p.root.rotation.y = p.yaw;
    p.head.rotation.y = p.headYaw;
    p.head.rotation.x = p.headPitch + (p.dead ? 0 : Math.sin(time * .5 + p.phase) * .012);
    const breath = p.dead ? 0 : Math.sin(time * 1.5 + p.phase) * .008;
    p.spine.rotation.x = .01 + breath + p.seated * .05 + p.bracing * .05 + (p.lean || 0);
    // Being held: the ribs give a little, the body rocks, the head tips over.
    p.spine.rotation.z = p.sway;
    p.head.rotation.z = p.headRoll;
    p.torso.scale.set(1 - p.squeeze * .07, 1 + p.squeeze * .018, 1 - p.squeeze * .1);

    const k = p.moving;
    const sw = Math.sin(p.walkT) * .46 * k;
    const lift = (ph) => Math.max(0, Math.sin(p.walkT + ph)) * .75 * k;
    // Sitting puts your hips at the height of the chair, however tall you are. A child's feet just don't reach the floor.
    p.hips.position.y = .92 * p.s * (1 - p.seated) + .5 * p.seated + Math.abs(Math.cos(p.walkT)) * .012 * k;
    p.hips.rotation.y = sw * .1;
    p.spine.rotation.y = -sw * .18;

    const sit = p.seated;
    p.LL.th.rotation.x = sw - sit * 1.5;
    p.RL.th.rotation.x = -sw - sit * 1.5;
    p.LL.kn.rotation.x = lift(Math.PI) + sit * 1.5;
    p.RL.kn.rotation.x = lift(0) + sit * 1.5;

    // On the stairs: one knee comes right up for each step instead of the flat stride, and the body tips into it.
    const onSt = (p.stairK || 0) * k;
    if (onSt > .01) {
      const a = Math.max(0, Math.sin(p.walkT)), b = Math.max(0, Math.sin(p.walkT + Math.PI));
      p.LL.th.rotation.x += (-.12 - .85 * a - p.LL.th.rotation.x) * onSt;
      p.RL.th.rotation.x += (-.12 - .85 * b - p.RL.th.rotation.x) * onSt;
      p.LL.kn.rotation.x += (.12 + 1.25 * a - p.LL.kn.rotation.x) * onSt;
      p.RL.kn.rotation.x += (.12 + 1.25 * b - p.RL.kn.rotation.x) * onSt;
      p.spine.rotation.x += .07 * onSt;
    }

    // Arms swing, or reach forward to do whatever she's doing at the counter, or pin to the sides when held.
    const reach = p.reachA, held = p.bracing;
    const rest = -.08 - sit * .55;
    p.L.sh.rotation.x = (-sw * .7 + rest) * (1 - reach) + (-1.0) * reach;
    p.R.sh.rotation.x = (sw * .7 + rest) * (1 - reach) + (-1.0) * reach + Math.sin(time * 3.1 + p.phase) * .06 * reach;
    p.L.el.rotation.x = -.16 - sit * .75 - reach * .62;
    p.R.el.rotation.x = -.16 - sit * .75 - reach * .62;
    p.L.sh.rotation.z = -.09 + held * .03;
    p.R.sh.rotation.z = .09 - held * .03;
    // After a while, one hand comes up and rests on the arm. She does not seem to have decided to.
    p.R.sh.rotation.x += p.patA * -.42;
    p.R.el.rotation.x += p.patA * -1.25;
    p.R.sh.rotation.z += p.patA * -.25;
    // Waving.
    if (p.wave > .01) {
      p.R.sh.rotation.x += p.wave * -2.5;
      p.R.sh.rotation.z += p.wave * (.3 + Math.sin(time * 9) * .22);
      p.R.el.rotation.x += p.wave * -.5;
    }

    // Carrying a box: both forearms level underneath it, fingers curled up around the far edge, leaning back a little against the weight.
    p.carryA = (p.carryA || 0) + ((p.hasBox ? 1 : 0) - (p.carryA || 0)) * Math.min(1, dt * 7);
    const c = p.carryA;
    if (c > .001) {
      const mixTo = (a, b) => a + (b - a) * c;
      p.L.sh.rotation.x = mixTo(p.L.sh.rotation.x, -.3); p.R.sh.rotation.x = mixTo(p.R.sh.rotation.x, -.3);
      p.L.el.rotation.x = mixTo(p.L.el.rotation.x, -1.05); p.R.el.rotation.x = mixTo(p.R.el.rotation.x, -1.05);
      p.L.sh.rotation.z = mixTo(p.L.sh.rotation.z, .14); p.R.sh.rotation.z = mixTo(p.R.sh.rotation.z, -.14);
      p.spine.rotation.x -= .06 * c;
    }
    p.L.hand.rotation.x = -.85 * c; p.R.hand.rotation.x = -.85 * c;
    // Holding a can: one elbow bent, can upright in the hand, out in front as if someone had asked to see it.
    p.canA = (p.canA || 0) + ((p.canHold ? 1 : 0) - (p.canA || 0)) * Math.min(1, dt * 7);
    const h = p.canA * (1 - reach);
    if (h > .001) {
      p.R.sh.rotation.x += (-.42 - p.R.sh.rotation.x) * h;
      p.R.el.rotation.x += (-1.28 - p.R.el.rotation.x) * h;
      p.R.sh.rotation.z += (-.05 - p.R.sh.rotation.z) * h;
    }

    // In a car seat: legs out straight into the footwell, so nothing comes through the floor of the car. Hands in the lap.
    if (p.carSit) {
      p.LL.th.rotation.x = -1.4; p.RL.th.rotation.x = -1.4;
      p.LL.kn.rotation.x = .55; p.RL.kn.rotation.x = .55;
      p.L.sh.rotation.x = -.5; p.R.sh.rotation.x = -.5 + p.patA * -.5;
      p.L.el.rotation.x = -.9; p.R.el.rotation.x = -.9;
    }
    // On your hands and knees on a concrete floor, trying to breathe.
    if (p.crawl) {
      p.hips.position.y = .47 * p.s;
      p.spine.rotation.x = 1.22; p.head.rotation.x = -.55 + Math.sin(time * 2.4) * .05;
      p.LL.th.rotation.x = -1.4; p.RL.th.rotation.x = -1.4;
      p.LL.kn.rotation.x = 1.5; p.RL.kn.rotation.x = 1.5;
      p.L.sh.rotation.x = -1.15; p.R.sh.rotation.x = -1.15;
      p.L.el.rotation.x = 0; p.R.el.rotation.x = 0;
    }
    // Sitting on the floor, knees up, arms around them.
    if (p.floorSit) {
      // Knees bent far enough that the feet land flat on the floor rather than through it.
      p.hips.position.y = .15 * p.s;
      p.LL.th.rotation.x = -2.5; p.RL.th.rotation.x = -2.5;
      p.LL.kn.rotation.x = 2.34; p.RL.kn.rotation.x = 2.34;
      p.L.sh.rotation.x = -.6; p.R.sh.rotation.x = -.6;
      p.L.el.rotation.x = -1.2; p.R.el.rotation.x = -1.2;
    }

    // Everyone blinks at exactly the same moment.
    const shut = (time % 4.7) < .13 || p.eyesShut;
    const want = shut ? p.shutTex : p.openTex;
    if (p.faceMat.map !== want) { p.faceMat.map = want; p.faceMat.needsUpdate = true; }
  }

  const CAST = {
    m: { height: .985, skin: '#d9b294', blush: 'rgba(200,110,90,.28)', lip: '#a4483f', iris: '#5d4a2c', brow: '#3a2416', browW: 4.5, hair: '#46291a', hairStyle: 'bob', top: '#b08f3c', topDark: '#8c6f2a', bottom: '#3c3a35', shoe: '#2a1c12', buttons: true, shoulder: .175, armR: .037, legR: .07 },
    d: { height: 1.05, bulk: 1.06, skin: '#cda486', blush: 'rgba(190,100,80,.2)', lip: '#92483e', iris: '#3f5a5c', brow: '#3a2a1c', browW: 7, hair: '#5a4530', hairStyle: 'short', top: '#55704f', topDark: '#3f5639', bottom: '#4b3e2f', shoe: '#1d1510', stubble: true, shoulder: .205, armR: .045, legR: .08 },
    w: { height: .72, skin: '#e2bea3', blush: 'rgba(225,120,100,.34)', lip: '#b8574d', iris: '#4c3a22', brow: '#7a4f28', browW: 4, hair: '#83522a', hairStyle: 'long', top: '#a33830', topDark: '#7d2a24', bottom: '#33405c', shoe: '#efe8da', headScale: 1.2, shoulder: .155, armR: .038, legR: .065, handScale: 1.1 },
  };
  return { make, pose, CAST };
})();
