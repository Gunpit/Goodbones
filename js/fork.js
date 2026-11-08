// The other thing on the wall: a straight-faced portrait of a real silver fork in a real fire helmet.
// It's a small 3D still life, modelled and lit once, then hung in a gilt frame. It's only ever a picture.
const ForkPortrait = (() => {
  // Vertices that share a position share a normal, so polished metal shades as one smooth surface.
  function smooth(geo) {
    const src = geo.index ? geo.toNonIndexed() : geo, p = src.attributes.position, map = new Map(), pos = [], idx = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = `${Math.round(x * 2000)},${Math.round(y * 2000)},${Math.round(z * 2000)}`;
      let n = map.get(k);
      if (n === undefined) { n = pos.length / 3; pos.push(x, y, z); map.set(k, n); }
      idx.push(n);
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setIndex(idx);
    out.computeVertexNormals();
    return out;
  }
  // The fork is built in four long strips that run from the handle up into each tine, side by side through the head.
  // Every point is placed on purpose, so polished metal gets an even surface to reflect in, with rolled edges.
  function forkGeometry() {
    const xs = [-.47, -.157, .157, .47], tw = .088, tip = 1.9, root = .76, outer = xs[3] + tw, T = .036, E = .05;
    const ease = t => t * t * (3 - 2 * t);
    const body = y => y < -.75 ? .2 + (.085 - .2) * ease((y + 4.4) / 3.65) : y < .5 ? .085 + (outer - .085) * ease((y + .75) / 1.25) : outer;
    const taper = y => y > tip - .42 ? Math.sqrt(Math.max(0, (tip - y) / .42)) : 1;
    const gap = (y, m, i) => {
      const full = Math.abs(m - xs[i]) - tw; // half the width of the slot between two tines
      if (y <= root) return 0;
      if (y >= root + full) return full;
      const k = 1 - (root + full - y) / full;
      return full * Math.sqrt(Math.max(0, 1 - (1 - k) * (1 - k)));
    };
    const rows = [], nR = 340;
    for (let r = 0; r <= nR; r++) rows.push(-4.4 + (tip + 4.4) * r / nR);
    const C = 16, pos = [], idx = [];
    const zOf = (x, y, d, side) => {
      // Rolled edge, flat face.
      const k = Math.min(1, d / E), t = T * Math.sqrt(Math.max(0, 1 - (1 - k) * (1 - k)));
      let z = side * t;
      // The real curves of a fork: the handle sweeps back, the neck dips, the head cups, and the tines lift at the tips.
      z += -.34 * Math.exp(-Math.pow((y + .5) / .75, 2));
      z += y > -.2 ? .3 * x * x * Math.min(1, (y + .2) / .6) : 0;
      z += y > .9 ? .13 * Math.pow(y - .9, 2) : 0;
      z += y < -1 ? .018 * Math.pow(-1 - y, 2) : 0;
      return z;
    };
    for (let i = 0; i < 4; i++) {
      const base = pos.length / 3;
      for (const side of [1, -1]) for (let r = 0; r <= nR; r++) {
        const y = rows[r], w = body(y);
        // Each strip's share of the head, and how far the slots have opened at this height.
        const headL = -w + 2 * w * i / 4, headR = -w + 2 * w * (i + 1) / 4;
        const open = y > root ? 1 : 0;
        const mL = i > 0 ? (xs[i - 1] + xs[i]) / 2 : null, mR = i < 3 ? (xs[i] + xs[i + 1]) / 2 : null;
        const gL = i > 0 ? gap(y, mL, i) : 0, gR = i < 3 ? gap(y, mR, i) : 0;
        let L = i > 0 ? mL * (1 - ease(Math.min(1, Math.max(0, (.5 - y) / 1.25)))) + headL * ease(Math.min(1, Math.max(0, (.5 - y) / 1.25))) + gL : headL;
        let R = i < 3 ? mR * (1 - ease(Math.min(1, Math.max(0, (.5 - y) / 1.25)))) + headR * ease(Math.min(1, Math.max(0, (.5 - y) / 1.25))) - gR : headR;
        if (y > tip - .42) { const c = xs[i], k = taper(y); L = c - tw * k; R = c + tw * k; }
        for (let j = 0; j <= C; j++) {
          const s = .5 - .5 * Math.cos(Math.PI * j / C), x = L + (R - L) * s;
          // How far this point is from an edge that's actually open air.
          const dL = i === 0 || open ? x - L : 9, dR = i === 3 || open ? R - x : 9;
          pos.push(x, y, zOf(x, y, Math.min(dL, dR), side));
        }
      }
      const W0 = C + 1, H0 = nR + 1;
      for (let f = 0; f < 2; f++) for (let r = 0; r < nR; r++) for (let j = 0; j < C; j++) {
        const a = base + f * H0 * W0 + r * W0 + j, b = a + 1, c = a + W0, d = c + 1;
        if (f === 0) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return smooth(g);
  }
  // Helmet surface, from the crown out over the dome and along the brim. Theta 0 is the front.
  function helmetPoint(t, th, out) {
    const brimStart = .6, back = Math.pow(Math.max(0, -Math.cos(th)), 1.5), side = Math.abs(Math.sin(th));
    let r, y;
    if (t <= brimStart) {
      const a = t / brimStart * Math.PI / 2, ribs = Math.cos(th * 8) * .022 * Math.sin(a * 2);
      r = Math.sin(a) * (1 + ribs * .6);
      y = .86 * Math.cos(a) + .04 * Math.cos(th * 8) * Math.sin(a) * .35 + ribs * .2;
    } else {
      const u = (t - brimStart) / (1 - brimStart), w = .3 + side * .1 + back * 1.0;
      r = 1 + w * u;
      y = -.26 * back * u * u - .1 * u * (1 - back) + .05 * Math.sin(u * Math.PI) * side;
    }
    out.set(r * Math.sin(th) * .8, y, r * Math.cos(th) * .95);
    return out;
  }
  function helmetGeometry() {
    const N = 90, M = 128, pos = [], idx = [], v = new THREE.Vector3();
    for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { helmetPoint(i / N, j / M * Math.PI * 2, v); pos.push(v.x, v.y, v.z); }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + 1, c = a + M + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    const sm = smooth(g);
    return sm;
  }
  function backdrop(g, w, h) {
    // Old-master dark: warm umber falling to near black, with a soft pool of light behind the sitter.
    g.fillStyle = '#17110c'; g.fillRect(0, 0, w, h);
    const glow = g.createRadialGradient(w * .55, h * .36, 20, w * .5, h * .42, h * .68);
    glow.addColorStop(0, '#6a5338'); glow.addColorStop(.42, '#3a2b1d'); glow.addColorStop(1, '#100b07');
    g.fillStyle = glow; g.fillRect(0, 0, w, h);
    let seed = 9; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    g.lineCap = 'round';
    for (let i = 0; i < 520; i++) {
      const x = rnd() * w, y = rnd() * h, a = rnd() * 6.28, l = 40 + rnd() * 130;
      g.strokeStyle = rnd() < .5 ? `rgba(214,174,120,${.008 + rnd() * .02})` : `rgba(6,3,1,${.02 + rnd() * .05})`;
      g.lineWidth = 8 + rnd() * 34;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + rnd() * 30, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  }
  function render(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(w, h, false); r.setClearColor(0x000000, 0);
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    // A photographer's studio, for the metal to reflect: dark room, big soft window on the left, a strip on the right, warm floor.
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ color: 0x241b14, side: THREE.BackSide })));
    const card = (w0, h0, x, y, z, col, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w0, h0), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
    card(20, 26, -24, 8, 16, '#fff4e2', 7);
    card(5, 30, 24, 2, 10, '#e4ecff', 4.5);
    card(30, 8, 0, 26, 8, '#ffffff', 3.2);
    card(40, 14, 0, -24, 10, '#7a4a28', 1.4);
    card(3, 18, -8, 2, 30, '#ffffff', 3);
    const pm = new THREE.PMREMGenerator(r), envMap = pm.fromScene(env, .012).texture;
    const scene = new THREE.Scene();
    scene.environment = envMap;
    const cam = new THREE.PerspectiveCamera(21, w / h, .5, 60);
    cam.position.set(.5, .15, 15); cam.lookAt(0, -.4, 0);
    const key = new THREE.DirectionalLight(0xfff0dc, 1.5);
    key.position.set(-5, 8, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0006; key.shadow.normalBias = .02;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -5, near: .5, far: 30 });
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xbcd2ff, .9); rim.position.set(6, 3, -5); scene.add(rim);
    // The fork: real silver, a touch of wear in the polish.
    const silver = new THREE.MeshStandardMaterial({ color: 0xe6e4df, metalness: 1, roughness: .17, envMapIntensity: 1.5 });
    const fork = new THREE.Mesh(forkGeometry(), silver);
    fork.castShadow = fork.receiveShadow = true;
    fork.rotation.y = -.16; fork.rotation.z = -.022; fork.position.set(0, -.7, 0);
    scene.add(fork);
    // The helmet: lacquered red leather, a brass comb and front piece, and a dark trim around the brim.
    const hat = new THREE.Group();
    const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x560302, roughness: .5, metalness: 0, clearcoat: .8, clearcoatRoughness: .14, envMapIntensity: .32, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(helmetGeometry(), lacquer);
    shell.castShadow = shell.receiveShadow = true;
    hat.add(shell);
    const brass = new THREE.MeshStandardMaterial({ color: 0xc99a3e, metalness: 1, roughness: .26, envMapIntensity: 1.4 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1c0806, metalness: 0, roughness: .5 });
    const curve = (fn, n, closed) => { const pts = []; const v = new THREE.Vector3(); for (let i = 0; i < n; i++) { fn(i / (closed ? n : n - 1), v); pts.push(v.clone()); } return new THREE.CatmullRomCurve3(pts, !!closed); };
    hat.add(new THREE.Mesh(new THREE.TubeGeometry(curve((u, v) => helmetPoint(1, u * Math.PI * 2, v), 120, true), 260, .024, 8, true), dark));
    hat.add(new THREE.Mesh(new THREE.TubeGeometry(curve((u, v) => helmetPoint(.6, u * Math.PI * 2, v).multiplyScalar(1.003), 100, true), 220, .018, 8, true), dark));
    // Comb along the crown, front to back.
    const comb = new THREE.Mesh(new THREE.TubeGeometry(curve((u, v) => {
      // From just behind the front piece, over the crown, and down the back.
      const th = u < .2 ? 0 : Math.PI, t = u < .2 ? (.2 - u) / .2 * .16 : (u - .2) / .8 * .52;
      helmetPoint(t, th, v); v.y += .035;
    }, 40), 120, .036, 10, false), brass);
    comb.castShadow = true;
    hat.add(comb);
    // Front piece: a shaped brass shield holding the company number, raised off the dome.
    const sh = new THREE.Shape();
    sh.moveTo(0, .47); sh.bezierCurveTo(.16, .47, .26, .4, .33, .3); sh.bezierCurveTo(.32, 0, .3, -.24, 0, -.46); sh.bezierCurveTo(-.3, -.24, -.32, 0, -.33, .3); sh.bezierCurveTo(-.26, .4, -.16, .47, 0, .47);
    const shieldG = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .025, bevelEnabled: true, bevelSize: .022, bevelThickness: .018, bevelSegments: 3, curveSegments: 20 }), brass);
    plate.castShadow = true;
    shieldG.add(plate);
    const tc = document.createElement('canvas'); tc.width = tc.height = 256;
    const tg = tc.getContext('2d');
    tg.font = 'bold 190px Georgia, serif'; tg.textAlign = 'center'; tg.textBaseline = 'middle';
    tg.fillStyle = '#231303'; tg.fillText('4', 128, 136);
    const tex = new THREE.CanvasTexture(tc); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const num = new THREE.Mesh(new THREE.PlaneGeometry(.56, .56), new THREE.MeshStandardMaterial({ map: tex, transparent: true, metalness: .3, roughness: .5 }));
    num.position.set(0, .01, .056); shieldG.add(num);
    shieldG.scale.setScalar(.72);
    shieldG.position.set(0, .38, .93); shieldG.rotation.x = -.4;
    hat.add(shieldG);
    hat.rotation.set(.1, .3, -.07);
    hat.position.set(.0, .86, -.02);
    scene.add(hat);
    r.render(scene, cam);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    out.getContext('2d').drawImage(canvas, 0, 0);
    pm.dispose(); r.dispose(); if (r.forceContextLoss) r.forceContextLoss();
    return out;
  }
  function paint(target) {
    const g = target.getContext('2d'), W = target.width, H = target.height, f = 46;
    const iw = W - 2 * f, ih = H - 2 * f;
    g.save();
    g.beginPath(); g.rect(f, f, iw, ih); g.clip();
    g.translate(f, f);
    backdrop(g, iw, ih);
    // A soft shadow cast on the painted ground, so it sits in the room.
    g.save(); g.filter = 'blur(26px)'; g.fillStyle = 'rgba(0,0,0,.42)'; g.beginPath(); g.ellipse(iw * .59, ih * .3, iw * .34, ih * .13, .08, 0, 7); g.fill(); g.fillRect(iw * .53, ih * .4, iw * .13, ih * .7); g.restore();
    g.drawImage(render(iw * 2, ih * 2), 0, 0, iw, ih);
    // Varnish: a little warmth over everything, fine canvas weave, and the corners falling off.
    g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(210,160,90,.28)'; g.fillRect(0, 0, iw, ih); g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,.022)'; for (let x = 0; x < iw; x += 3) g.fillRect(x, 0, 1, ih); for (let y = 0; y < ih; y += 3) g.fillRect(0, y, iw, 1);
    const v = g.createRadialGradient(iw * .5, ih * .42, ih * .3, iw * .5, ih * .46, ih * .76);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,2,0,.6)');
    g.fillStyle = v; g.fillRect(0, 0, iw, ih);
    g.restore();
    // A heavy gilt frame.
    const gold = g.createLinearGradient(0, 0, W, H);
    gold.addColorStop(0, '#f4d778'); gold.addColorStop(.3, '#a87d2c'); gold.addColorStop(.55, '#f0cf6c'); gold.addColorStop(.8, '#8d6520'); gold.addColorStop(1, '#d9b552');
    g.strokeStyle = gold; g.lineWidth = f; g.strokeRect(f / 2, f / 2, W - f, H - f);
    g.strokeStyle = 'rgba(60,35,5,.8)'; g.lineWidth = 2; g.strokeRect(2, 2, W - 4, H - 4); g.strokeRect(f - 1, f - 1, W - 2 * f + 2, H - 2 * f + 2);
    g.strokeStyle = 'rgba(70,45,10,.55)'; g.lineWidth = 3; g.strokeRect(14, 14, W - 28, H - 28); g.strokeRect(32, 32, W - 64, H - 64);
    g.fillStyle = 'rgba(255,240,180,.8)';
    for (let x = 28; x < W - 20; x += 18) for (const y of [23, H - 23]) { g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); }
    for (let y = 28; y < H - 20; y += 18) for (const x of [23, W - 23]) { g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); }
    for (const [x, y] of [[23, 23], [W - 23, 23], [23, H - 23], [W - 23, H - 23]]) { g.fillStyle = '#fff0b0'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.strokeStyle = '#5a3b0c'; g.lineWidth = 3; g.stroke(); }
  }
  // The side table under the photograph, in the same plain flat-lit look as the rooms in the game, with what ends up on a table like this.
  function paintTable(target) {
    const W = target.width, H = target.height;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(W, H, false); r.setClearColor(0x000000, 0);
    r.outputEncoding = THREE.sRGBEncoding;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x8a7458, .95));
    const sun = new THREE.DirectionalLight(0xfff0d2, .95);
    sun.position.set(-2.2, 4, 3.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.001; sun.shadow.normalBias = .01;
    Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2.4, bottom: -1, near: .5, far: 12 });
    scene.add(sun, sun.target);
    const mat = c => new THREE.MeshLambertMaterial({ color: new THREE.Color(c) });
    const box = (w, h, d, x, y, z, c, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y + h / 2, z); if (ry) m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
    const cyl = (r0, r1, h, x, y, z, c, seg = 18) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, seg), mat(c)); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
    const wood = '#a0764a', dark = '#6e4a2b', top = 1.0;
    // The table: a top with a lip, an apron with a drawer, four tapered legs.
    box(2.4, .05, .72, 0, top - .05, 0, '#b58a57');
    box(2.26, .15, .6, 0, top - .2, 0, wood);
    box(.8, .1, .012, 0, top - .175, .305, '#b58a57');
    const knob = cyl(.024, .024, .03, 0, top - .14, .32, '#c9a64e', 10); knob.rotation.x = Math.PI / 2;
    for (const [x, z] of [[-1.07, -.24], [1.07, -.24], [-1.07, .24], [1.07, .24]]) cyl(.022, .042, top - .2, x, 0, z, dark, 8);
    // On it: a lamp that's been on for years, the good bowl full of keys, some books, a mug, a clock, and a can of soup nobody has mentioned.
    cyl(.1, .07, .05, -.82, top, -.05, '#3a3a38');
    cyl(.024, .024, .34, -.82, top + .05, -.05, '#8b8d88', 10);
    cyl(.09, .15, .2, -.82, top + .36, -.05, '#b89a5e', 18);
    const bk = [['#63281f', .5, .07, -.28, .05], ['#2f4538', .46, .06, -.27, -.1], ['#7c6424', .4, .055, -.29, .16]];
    let by = top;
    bk.forEach(([c, w, h, x, ry]) => { box(w, h, .32, x, by, .03, c, ry); by += h; });
    cyl(.05, .035, .06, -.29, by, .03, '#dedccf', 14);
    const bowl = cyl(.14, .07, .09, .3, top, .08, '#3f5f6e', 22);
    box(.07, .012, .025, .29, top + .09, .07, '#8b8d88', .6); box(.06, .012, .022, .33, top + .094, .1, '#c9a64e', -.5);
    cyl(.046, .046, .125, .72, top, .15, '#b0322a', 16);
    cyl(.047, .047, .06, .72, top + .033, .15, '#f0e9d6', 16);
    box(.2, .26, .05, 1.0, top, -.1, '#5b3f26', -.2);
    const face = cyl(.078, .078, .012, 1.0, top + .14, -.066, '#efe9d6', 22); face.rotation.x = Math.PI / 2; face.rotation.z = .2;
    const cw = 3.4, ch = cw * H / W, cam = new THREE.OrthographicCamera(-cw / 2, cw / 2, ch / 2, -ch / 2, .1, 30);
    cam.position.set(0, ch / 2 - .14 + 1.1, 8); cam.lookAt(0, ch / 2 - .14, 0);
    r.render(scene, cam);
    const g = target.getContext('2d');
    g.clearRect(0, 0, W, H);
    // Its shadows: soft on the wallpaper behind it, and pooled on the floor beneath it.
    g.save(); g.filter = 'blur(26px)'; g.fillStyle = 'rgba(55,35,12,.3)'; g.fillRect(W * .15, H * .34, W * .72, H * .46); g.fillStyle = 'rgba(25,14,4,.5)'; g.beginPath(); g.ellipse(W * .5, H * .93, W * .38, H * .045, 0, 0, 7); g.fill(); g.restore();
    g.drawImage(canvas, 0, 0);
    r.dispose(); if (r.forceContextLoss) r.forceContextLoss();
  }
  return { paint, paintTable };
})();
