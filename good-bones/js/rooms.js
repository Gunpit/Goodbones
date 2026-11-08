// Room sets: geometry, procedural textures, lighting setups, marks and hotspots.
// Every room is built once per variant and baked by render.js.
const Sets = (() => {
  const texCache = {}, matCache = {};

  function canvasTex(name, size, draw) {
    if (texCache[name]) return texCache[name];
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return (texCache[name] = t);
  }

  // Seeded so that every bake of a room gets identical grime.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function grime(g, s, n, alpha) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = `rgba(${rnd() < .5 ? '30,20,10' : '240,225,190'},${rnd() * alpha})`;
      const r = rnd() * s * .04 + 1;
      g.fillRect(rnd() * s, rnd() * s, r, r);
    }
  }

  function wallpaper(name, base, ink) {
    return canvasTex(name, 256, (g, s) => {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 2;
      for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
        const cx = x * 128 + (y % 2 ? 64 : 0), cy = y * 128 + 64;
        for (const ox of [0, 256, -256]) {
          g.save(); g.translate(cx + ox, cy);
          g.beginPath(); g.moveTo(0, -48); g.bezierCurveTo(26, -24, 26, 24, 0, 48); g.bezierCurveTo(-26, 24, -26, -24, 0, -48); g.stroke();
          g.beginPath(); g.moveTo(0, -22); g.bezierCurveTo(10, -8, 10, 8, 0, 22); g.bezierCurveTo(-10, 8, -10, -8, 0, -22); g.fill();
          g.restore();
        }
      }
      grime(g, s, 500, .05);
    });
  }

  const textures = {
    wood: () => canvasTex('wood', 512, (g, s) => {
      for (let i = 0; i < 8; i++) {
        const l = 58 + rnd() * 16;
        g.fillStyle = `rgb(${l * 2.4 | 0},${l * 1.45 | 0},${l * .85 | 0})`;
        g.fillRect(i * 64, 0, 64, s);
        for (let k = 0; k < 40; k++) {
          g.strokeStyle = `rgba(20,10,4,${rnd() * .28})`;
          const x = i * 64 + rnd() * 64;
          g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + rnd() * 6 - 3, s * .3, x + rnd() * 6 - 3, s * .6, x, s); g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(i * 64, 0, 2, s);
        g.fillRect(i * 64, rnd() * s, 64, 2);
      }
    }),
    lino: () => canvasTex('lino', 256, (g, s) => {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        g.fillStyle = (x + y) % 2 ? '#c2bb98' : '#7f9483';
        g.fillRect(x * 64, y * 64, 64, 64);
      }
      grime(g, s, 900, .09);
    }),
    tile: () => canvasTex('tile', 256, (g, s) => {
      g.fillStyle = '#a8a58f'; g.fillRect(0, 0, s, s);
      g.fillStyle = '#c9c7b0';
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
      grime(g, s, 500, .07);
    }),
    carpet: () => canvasTex('carpet', 256, (g, s) => {
      g.fillStyle = '#a28b76'; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = `rgba(${rnd() < .5 ? '20,10,8' : '150,105,85'},${rnd() * .22})`;
        g.fillRect(rnd() * s, rnd() * s, 2, 2);
      }
    }),
    concrete: () => canvasTex('concrete', 256, (g, s) => {
      g.fillStyle = '#58564e'; g.fillRect(0, 0, s, s);
      grime(g, s, 2600, .12);
      g.fillStyle = 'rgba(10,8,6,.35)';
      g.beginPath(); g.ellipse(120, 140, 62, 34, .4, 0, 7); g.fill();
    }),
    dirt: () => canvasTex('dirt', 256, (g, s) => {
      g.fillStyle = '#2d2318'; g.fillRect(0, 0, s, s);
      grime(g, s, 3500, .2);
    }),
    plaster: () => canvasTex('plaster', 256, (g, s) => {
      g.fillStyle = '#b7ad8e'; g.fillRect(0, 0, s, s);
      grime(g, s, 1000, .05);
    }),
    card: () => canvasTex('card', 128, (g, s) => {
      g.fillStyle = '#9a7a4e'; g.fillRect(0, 0, s, s);
      g.fillStyle = 'rgba(210,190,140,.5)'; g.fillRect(0, s * .44, s, s * .12);
      grime(g, s, 200, .1);
    }),
    mustard: () => wallpaper('mustard', '#f0e4b8', 'rgba(170,140,80,.07)'),
    oxblood: () => wallpaper('oxblood', '#ecdcc8', 'rgba(150,110,90,.07)'),
    green: () => wallpaper('green', '#ece6d0', 'rgba(120,120,90,.06)'),
    nicotine: () => wallpaper('nicotine', '#efe8d4', 'rgba(150,130,90,.06)'),
    wren: () => canvasTex('wrenpaper', 256, (g, s) => {
      g.fillStyle = '#7c8ea0'; g.fillRect(0, 0, s, s);
      g.fillStyle = 'rgba(230,220,180,.65)';
      for (let i = 0; i < 12; i++) {
        const x = rnd() * s, y = rnd() * s;
        g.beginPath();
        for (let k = 0; k < 10; k++) {
          const r = k % 2 ? 3 : 8, a = k * Math.PI / 5;
          g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        g.fill();
      }
      grime(g, s, 300, .05);
    }),
  };

  const flats = {
    white: '#e9e6da', enamel: '#dedccf', trim: '#f2efe4', dark: '#6e5540', woodd: '#a0764a', woodl: '#c49c6c', door: '#f0eee4', doorp: '#e2dfd2',
    metal: '#6d6f6b', iron: '#3a3a38', red: '#6b2520', sofa: '#5d4a2d', blanket: '#44565f', steel: '#8b8d88',
    tub: '#c8c6b6', black: '#0b0a09', paper: '#d8d0b6', car: '#3f5244', carglass: '#14181a', tyre: '#141312',
    book1: '#63281f', book2: '#2f4538', book3: '#7c6424', book4: '#34405a', chalk: '#a39d88', shade: '#b89a5e',
    cal: '#d0c8ae', pink: '#a7686a',
  };

  function mat(name) {
    if (matCache[name]) return matCache[name];
    let m;
    if (name === 'glass') m = new THREE.MeshBasicMaterial({ color: 0xffffff });
    else if (name === 'bulb') m = new THREE.MeshBasicMaterial({ color: 0xffffff });
    else if (name === 'outside') m = new THREE.MeshBasicMaterial({ color: 0xffffff });
    else if (name === 'photosky') m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#a9c6da') });
    else if (textures[name]) m = new THREE.MeshLambertMaterial({ map: textures[name]() });
    else m = new THREE.MeshLambertMaterial({ color: new THREE.Color(flats[name] || name) });
    return (matCache[name] = m);
  }

  // One texture repeat per metre, whatever the size of the box.
  function worldUV(geo, w, h, d) {
    const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }

  class Builder {
    constructor(W, D, H) { this.W = W; this.D = D; this.H = H; this.group = new THREE.Group(); }
    // x, z are the centre; y is the underside.
    box(w, h, d, x, y, z, m, opts = {}) {
      const geo = new THREE.BoxGeometry(w, h, d);
      worldUV(geo, w, h, d);
      const mesh = new THREE.Mesh(geo, mat(m));
      mesh.position.set(x, y + h / 2, z);
      if (opts.ry) mesh.rotation.y = opts.ry;
      if (opts.rz) mesh.rotation.z = opts.rz;
      if (opts.rx) mesh.rotation.x = opts.rx;
      mesh.castShadow = opts.cast !== false && m !== 'glass' && m !== 'bulb' && m !== 'outside';
      mesh.receiveShadow = m !== 'glass' && m !== 'bulb' && m !== 'outside';
      this.group.add(mesh);
      return mesh;
    }
    cyl(r, h, x, y, z, m, seg = 10, r2) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r2 === undefined ? r : r2, r, h, seg), mat(m));
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = m !== 'bulb'; mesh.receiveShadow = m !== 'bulb';
      this.group.add(mesh);
      return mesh;
    }
    shell(wall, floor, ceil = 'plaster') {
      const { W, D, H } = this;
      this.box(W + .6, .2, D + .6, 0, -.2, 0, floor);
      this.box(W + .6, .2, D + .6, 0, H, 0, ceil);
      this.wallMat = wall;
    }
    // side: n (-z), s (+z), w (-x), e (+x). Openings are cut along the wall.
    wall(side, openings = [], mWall) {
      const { W, D, H } = this, t = .2, m = mWall || this.wallMat;
      const horiz = side === 'n' || side === 's';
      const L = horiz ? W : D;
      const off = side === 'n' ? -D / 2 - t / 2 : side === 's' ? D / 2 + t / 2 : side === 'w' ? -W / 2 - t / 2 : W / 2 + t / 2;
      const seg = (a, b, y0, y1, mm = m) => {
        const len = b - a, mid = (a + b) / 2;
        if (len <= .001 || y1 - y0 <= .001) return;
        if (horiz) this.box(len, y1 - y0, t, mid, y0, off, mm);
        else this.box(t, y1 - y0, len, off, y0, mid, mm);
      };
      let cur = -L / 2 - t;
      const ops = openings.slice().sort((a, b) => a.at - b.at);
      for (const o of ops) {
        const a = o.at - o.w / 2, b = o.at + o.w / 2;
        seg(cur, a, 0, H);
        seg(a, b, 0, o.y0);
        seg(a, b, o.y1, H);
        cur = b;
        const glassOff = off + (off < 0 ? -.02 : .02), y = o.y0, h = o.y1 - o.y0;
        const put = (w, hh, along, yy, depth, mm, opts) => horiz
          ? this.box(w, hh, depth, along, yy, glassOff, mm, opts)
          : this.box(depth, hh, w, glassOff, yy, along, mm, opts);
        if (o.kind !== 'hole') {
          put(o.w, h, o.at, y, .02, o.glass || 'glass');
          put(.05, h, o.at, y, .08, 'trim');
          put(o.w, .05, o.at, y + h / 2 - .025, .08, 'trim');
        }
        // The trim stands a hair proud of the cut in the wall. If its inner faces sat exactly on the wall's, the two would
        // fight over the same pixels and flicker from any angle that can see them.
        const lip = .005;
        put(o.w + .14, .08, o.at, y - .08 + lip, .3, 'trim');
        put(o.w + .14, .08, o.at, y + h - lip, .3, 'trim');
        put(.07, h, a - .035 + lip, y, .28, 'trim');
        put(.07, h, b + .035 - lip, y, .28, 'trim');
      }
      seg(cur, L / 2 + t, 0, H);
      // Baseboard and picture rail.
      const inner = off + (off < 0 ? .12 : -.12);
      if (horiz) {
        this.box(L, .13, .05, 0, 0, inner, 'trim');
        if (H > 2) this.box(L, .04, .03, 0, H - .32, inner, 'trim');
      } else {
        this.box(.05, .13, L, inner, 0, 0, 'trim');
        if (H > 2) this.box(.03, .04, L, inner, H - .32, 0, 'trim');
      }
    }
    // Decorative door flush against a wall. "at" is along the wall.
    door(side, at, m0) {
      // Every door in a house like this is the same white door.
      const m = m0 === 'white' ? 'white' : 'door';
      const { W, D } = this, w = .9, h = 2.05;
      const horiz = side === 'n' || side === 's';
      const off = side === 'n' ? -D / 2 + .02 : side === 's' ? D / 2 - .02 : side === 'w' ? -W / 2 + .02 : W / 2 - .02;
      const p = (ww, hh, along, y, dep, mm) => horiz ? this.box(ww, hh, dep, along, y, off, mm) : this.box(dep, hh, ww, off, y, along, mm);
      p(w + .16, h + .08, at, 0, .05, 'trim');
      p(w, h, at, 0, .08, m);
      p(w * .7, h * .36, at, h * .55, .1, 'doorp');
      p(w * .7, h * .36, at, h * .1, .1, 'doorp');
      p(.07, .07, at + w * .38 * (side === 'e' || side === 'n' ? 1 : -1), 1, .16, 'steel');
    }
    frame(side, at, y, w, h, m = 'book4') {
      const { W, D } = this;
      const horiz = side === 'n' || side === 's';
      const off = side === 'n' ? -D / 2 + .03 : side === 's' ? D / 2 - .03 : side === 'w' ? -W / 2 + .03 : W / 2 - .03;
      const p = (ww, hh, dep, mm) => horiz ? this.box(ww, hh, dep, at, y + (h - hh) / 2, off, mm) : this.box(dep, hh, ww, off, y + (h - hh) / 2, at, mm);
      p(w, h, .03, 'dark');
      // "pic:name" hangs a real picture (pictures.js) in the frame. Anything else is a plain colour, as before.
      if (typeof m === 'string' && m.startsWith('pic:') && this.pic(side, at, y + .04, w - .08, h - .08, m.slice(4), .05)) return;
      p(w - .08, h - .08, .05, m);
    }
    // A picture with no frame of its own, or with one painted into it: a flat face just proud of the wall. y is the bottom edge.
    pic(side, at, y, w, h, name, proud = .02) {
      const m = typeof Pictures !== 'undefined' && Pictures.material(name);
      if (!m) return null;
      const { W, D } = this, mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), yy = y + h / 2;
      if (side === 'n') mesh.position.set(at, yy, -D / 2 + proud);
      else if (side === 's') { mesh.position.set(at, yy, D / 2 - proud); mesh.rotation.y = Math.PI; }
      else if (side === 'w') { mesh.position.set(-W / 2 + proud, yy, at); mesh.rotation.y = Math.PI / 2; }
      else { mesh.position.set(W / 2 - proud, yy, at); mesh.rotation.y = -Math.PI / 2; }
      mesh.receiveShadow = true;
      this.group.add(mesh);
      return mesh;
    }
    chair(x, z, ry = 0, m = 'woodd') {
      const g0 = this.group, g = new THREE.Group();
      this.group = g;
      this.box(.42, .05, .42, 0, .43, 0, m);
      for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) this.box(.04, .43, .04, a, 0, b, m);
      this.box(.42, .5, .04, 0, .48, -.2, m);
      g.position.set(x, 0, z); g.rotation.y = ry;
      this.group = g0; g0.add(g);
    }
    radiator(x, z, along = 'x', n = 9) {
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * .09;
        if (along === 'x') this.box(.06, .62, .14, x + o, .08, z, 'iron');
        else this.box(.14, .62, .06, x, .08, z + o, 'iron');
      }
    }
    vent(side, at, y) {
      const { W, D } = this;
      const horiz = side === 'n' || side === 's';
      const off = side === 'n' ? -D / 2 + .02 : side === 's' ? D / 2 - .02 : side === 'w' ? -W / 2 + .02 : W / 2 - .02;
      for (let i = 0; i < 5; i++) horiz
        ? this.box(.5, .025, .04, at, y + i * .05, off, 'iron')
        : this.box(.04, .025, .5, off, y + i * .05, at, 'iron');
    }
    lamp(x, y, z) {
      this.box(.015, this.H - y - .26, .015, x, y + .26, z, 'iron');
      const c = this.cyl(.34, .26, x, y, z, 'shade', 8, .14);
      c.castShadow = false;
      this.cyl(.06, .08, x, y - .04, z, 'bulb', 8);
    }
    books(x, y, z, w) {
      let cx = x - w / 2, i = 0;
      while (cx < x + w / 2 - .05) {
        const t = .03 + (i * 37 % 5) * .012, h = .2 + (i * 13 % 7) * .014;
        this.box(t, h, .17, cx + t / 2, y, z, ['book1', 'book2', 'book3', 'book4', 'chalk'][i * 7 % 5]);
        cx += t + .003; i++;
      }
    }
  }

  const defs = {
    kitchen: {
      label: 'The kitchen',
      cam: { p: [2.75, 2.4, 2.25], t: [-.85, .55, -1.05], fov: 56, roll: .02 },
      sun: [-3.2, 7, -8], lamps: [[0, 2.0, .3, '#ffd9a0', 1.1]],
      build(b) {
        b.shell('mustard', 'lino');
        b.wall('n', [{ at: -.5, w: 1.5, y0: 1.05, y1: 2.15 }]);
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('w', 1.1);
        // Counters, sink and cabinets.
        b.box(3.7, .88, .6, -.75, 0, -2.2, 'woodl');
        b.box(3.74, .05, .64, -.75, .88, -2.18, 'enamel');
        b.box(.8, .04, .42, -.5, .9, -2.2, 'steel');
        b.box(.04, .22, .04, -.5, .93, -2.38, 'steel');
        for (let i = 0; i < 5; i++) b.box(.66, .74, .02, -2.3 + i * .76, .08, -1.89, 'woodd');
        b.box(.8, .78, .34, -2.1, 1.55, -2.32, 'woodl');
        b.box(.8, .78, .34, 1.2, 1.55, -2.32, 'woodl');
        // Stove and kettle.
        b.box(.76, .92, .62, 1.55, 0, -2.18, 'enamel');
        b.box(.76, .03, .62, 1.55, .92, -2.18, 'iron');
        b.cyl(.11, .15, 1.45, .95, -2.2, 'steel', 10, .07);
        // Fridge.
        b.box(.8, 1.8, .7, 2.5, 0, -2.1, 'white');
        b.box(.03, .5, .03, 2.14, .9, -1.74, 'steel');
        // Table and chairs.
        b.box(1.7, .05, 1.0, 0, .73, .3, 'woodd');
        for (const [a, c] of [[-.75, -.08], [.75, -.08], [-.75, .68], [.75, .68]]) b.box(.06, .73, .06, a, 0, c, 'woodd');
        b.chair(0, -.5, 0); b.chair(-1.22, .3, Math.PI / 2); b.chair(1.22, .3, -Math.PI / 2); b.chair(0, 1.1, Math.PI);
        b.cyl(.05, .1, 0, .78, .3, 'white', 8);
        // Wall things.
        b.radiator(-2.86, -.4, 'z');
        b.box(.36, .5, .02, 1.35, 1.25, -2.47, 'cal');
        b.box(.09, .09, .02, 1.43, 1.37, -2.455, 'red');
        b.box(.05, .26, .13, -2.95, 1.25, -.6, 'dark');
        b.box(.02, .38, .16, -2.97, 1.2, -.6, 'iron');
        b.box(.04, .05, .34, -2.95, 1.62, -1.5, 'woodl');
        b.box(.02, .13, .03, -2.93, 1.47, -1.5, 'steel');
        b.vent('e', -.5, 2.15);
        b.frame('e', .8, 1.25, .5, .65, 'book2');
        b.lamp(0, 2.0, .3);
      },
      marks: {
        counter: [-.5, -1.45, Math.PI], stove: [1.5, -1.45, Math.PI], door: [-2.45, 1.1, Math.PI / 2], mid: [-1.45, 1.5, Math.PI / 2],
        north: [0, -.46, 0, 'sit'], west: [-1.18, .3, Math.PI / 2, 'sit'], east: [1.18, .3, -Math.PI / 2, 'sit'], south: [0, 1.06, Math.PI, 'sit'],
        wrenfloor: [-1.55, 1.75, -1.25, 'floorlie'], dellfloor: [.75, -1.05, Math.PI / 2, 'floorlie'],
        phone: [-2.45, -.6, -Math.PI / 2], boxes: [1.8, 1.4, 0],
      },
      spots: {
        tile: [-.5, .03, -1.3], radiator: [-2.8, .75, -.4], kettle: [1.45, 1.15, -2.2], calendar: [1.35, 1.5, -2.45],
        phone: [-2.9, 1.5, -.6], hook: [-2.9, 1.5, -1.5], vent: [2.9, 2.27, -.5], table: [.55, .85, .4], lamp: [0, 1.85, .3],
        boxes: [1.8, .5, 1.5], door: [-2.9, 1.1, 1.1], sink: [-.5, 1.0, -2.2],
      },
      boxSpots: [[1.8, 1.5], [2.35, 1.0], [2.3, 1.75], [1.75, 1.95], [2.35, .25], [1.8, 1.5, 1], [2.35, 1.0, 1], [2.3, 1.75, 1]],
    },

    living: {
      label: 'The living room',
      cam: { p: [2.7, 2.35, 2.2], t: [-.9, .6, -1.0], fov: 56, roll: -.02 },
      sun: [-1, 6, -8], lamps: [[-2.2, 1.45, -1.9, '#ffcf90', 1.0]],
      build(b) {
        b.shell('oxblood', 'wood');
        b.wall('n', [{ at: .75, w: 1.5, y0: .8, y1: 2.2 }]);
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('e', 1.2);
        b.box(3.4, .015, 2.6, -.2, 0, .1, 'carpet');
        // Bookshelf on the west wall.
        b.box(.3, 2.2, 2.4, -2.84, 0, .1, 'woodd');
        for (let i = 0; i < 5; i++) {
          b.box(.32, .03, 2.3, -2.68, .18 + i * .42, .1, 'woodl');
          const g0 = b.group, g = new THREE.Group();
          b.group = g; b.books(0, .21 + i * .42, 0, 2.0 - i * .12); g.rotation.y = Math.PI / 2; g.position.set(-2.62, 0, .1);
          b.group = g0; g0.add(g);
        }
        // Sofa, armchair, side table and floor lamp.
        b.box(2.0, .42, .85, -.25, 0, -1.3, 'sofa');
        b.box(2.0, .55, .22, -.25, .42, -1.68, 'sofa');
        b.box(.22, .25, .85, -1.25, .42, -1.3, 'sofa'); b.box(.22, .25, .85, .75, .42, -1.3, 'sofa');
        b.box(.8, .42, .8, 1.75, 0, .2, 'red'); b.box(.8, .55, .2, 2.05, .42, .2, 'red', { ry: Math.PI / 2 });
        b.box(1.0, .4, .55, -.2, 0, .1, 'woodd');
        b.box(.04, 1.4, .04, -2.2, 0, -1.9, 'iron');
        const s = b.cyl(.24, .3, -2.2, 1.4, -1.9, 'shade', 8, .14); s.castShadow = false;
        b.cyl(.05, .08, -2.2, 1.38, -1.9, 'bulb', 8);
        b.radiator(.75, -2.32, 'x', 11);
        b.frame('e', -.9, 1.3, .9, .65, 'book3');
        b.frame('n', -1.5, 1.3, .55, .75, 'book1');
        b.vent('n', -.3, 2.2);
      },
      marks: {
        shelf: [-2.1, .2, -Math.PI / 2], sofa: [-.3, -1.1, 0, 'sit'], sofa2: [.3, -1.1, 0, 'sit'], rug: [-.6, .95, Math.PI], chair: [1.72, .2, -Math.PI / 2, 'sit'],
        door: [2.4, 1.2, -Math.PI / 2], center: [.2, 1.2, Math.PI], window: [.75, -1.95, Math.PI],
      },
      spots: {
        books: [-2.55, 1.2, .2], lamp: [-2.2, 1.55, -1.9], radiator: [.75, .8, -2.3], window: [.75, 1.5, -2.45], vent: [-.3, 2.3, -2.45],
        boxes: [-.8, .6, 1.8], floor: [.2, .05, 1.1], sofa: [-.25, .7, -1.2],
      },
      boxSpots: [[-1.3, 1.9], [-.7, 1.9], [-1.0, 1.25], [-1.3, 1.9, 1], [-.7, 1.9, 1], [1.2, 1.9], [1.8, 1.9], [1.2, 1.9, 1]],
    },

    hall: {
      label: 'The hall',
      cam: { p: [0, 2.28, 3.75], t: [0, .95, -3.2], fov: 46, roll: .012 },
      sun: [.3, 3.2, -9], lamps: [[0, 2.15, .4, '#ffd9a0', 1.0]],
      variant: G => `${G.hallWidth}:${G.flags.space_built ? 1 : 0}:${G.flags.nook_built ? 1 : 0}`,
      size: v => [parseFloat(v.split(':')[0]), 8, 2.6],
      build(b, v) {
        const [ws, sp, nk] = v.split(':'), w = parseFloat(ws);
        b.shell('green', 'wood');
        b.wall('n', [{ at: 0, w: Math.min(1.1, w - .1), y0: 0, y1: 2.15, kind: 'hole' }]);
        b.box(w, 2.6, .02, 0, 0, -4.6, 'outside');
        b.box(w + 3, .1, 1, 0, -.1, -4.3, 'chalk');
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('w', 1.05); b.door('e', 1.2, 'woodl'); b.door('w', -1.35, 'woodl');
        if (sp === '1') b.door('e', -.7, 'white');
        if (nk === '1') { b.box(.05, .8, .6, -w / 2 + .02, 0, -.2, 'dark'); }
        b.frame('e', .25, 1.3, .5, .65, 'book1');
        b.frame('e', -1.65, 1.4, .3, .4, 'book3');
        b.frame('w', -.2, 1.35, .6, .5, 'book2');
        b.vent('e', -2.6, 2.1);
        b.lamp(0, 2.15, .4);
        if (w >= 1.6) {
          b.box(.3, .8, .9, -w / 2 + .16, 0, -2.6, 'woodd');
          b.cyl(.09, .16, -w / 2 + .16, .8, -2.6, 'shade', 8);
        }
        // The stair railing. The stairs are around the corner, as far as anyone has checked.
        b.box(.05, .05, 1.5, -w / 2 + .1, .93, .05, 'woodd');
        for (let i = 0; i < 6; i++) b.box(.025, .93, .025, -w / 2 + .1, 0, -.65 + i * .28, 'woodl');
        b.box(.04, .04, .9, w / 2 - .03, 1.75, -3.1, 'woodl');
        b.box(.09, .75, .3, w / 2 - .06, .95, -3.1, 'book4');
      },
      marksFor: v => {
        const w = parseFloat(v), q = w / 2 - .22;
        return {
          door: [0, -3.1, Math.PI], out: [0, -4.1, Math.PI], mid: [0, -.4, Math.PI], near: [0, 1.5, Math.PI], stairs: [-q, .6, 1.2],
          a: [-Math.min(q, .4), -.3, Math.PI / 2], b: [Math.min(q, .4), -.3, -Math.PI / 2], wren: [0, 1.2, Math.PI], kid: [.2, -2.2, 0],
          space: [q, -.7, Math.PI / 2], rick: [.25, -2, 0], p1: [-.25, -1, 0], p2: [.2, -.5, 0],
        };
      },
      spotsFor: v => {
        const w = parseFloat(v);
        return {
          door: [0, 1.1, -3.9], wall: [w / 2 - .02, 1.7, -.2], wallw: [-w / 2 + .02, 1.1, 1.0], vent: [w / 2 - .03, 2.2, -2.6], lamp: [0, 2.05, .4],
          newdoor: [w / 2 - .05, 1.2, -.7], nook: [-w / 2 + .05, .4, -.2], floor: [0, .03, -.3],
        };
      },
      boxSpotsFor: v => {
        const w = parseFloat(v), x = w / 2 - .3;
        return [[-x, 3.1], [-x, 2.5], [x, .1], [-x, 3.1, 1], [-x, 2.5, 1], [x, .1, 1], [x, 1.7], [x, 1.7, 1]];
      },
    },

    bedroom: {
      label: 'The bedroom',
      cam: { p: [2.25, 2.3, 2.05], t: [-.75, .5, -.8], fov: 58, roll: .025 },
      sun: [-3.5, 6, -8], lamps: [[-1.62, .95, -1.3, '#ffc98a', .9]],
      build(b) {
        b.W = 5; b.D = 4.6; b.H = 2.6;
        b.shell('nicotine', 'carpet');
        b.wall('n', [{ at: -.3 + 1.3, w: 1.1, y0: .9, y1: 2.1 }]);
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('e', 1);
        // Bed.
        b.box(1.7, .32, 2.1, -.6, 0, -1.1, 'woodd');
        b.box(1.62, .2, 2.02, -.6, .32, -1.1, 'white');
        b.box(1.66, .07, 1.35, -.6, .52, -.72, 'blanket');
        b.box(1.7, 1.05, .08, -.6, 0, -2.2, 'woodd');
        b.box(.68, .1, .42, -1.0, .52, -1.86, 'paper'); b.box(.68, .1, .42, -.2, .52, -1.86, 'paper');
        // Nightstands.
        b.box(.5, .55, .45, -1.75, 0, -1.95, 'woodl');
        b.box(.5, .55, .45, .55, 0, -1.95, 'woodl');
        b.cyl(.05, .24, -1.75, .55, -1.95, 'chalk', 8);
        const s = b.cyl(.17, .2, -1.75, .78, -1.95, 'shade', 8, .1); s.castShadow = false;
        b.cyl(.04, .06, -1.75, .78, -1.95, 'bulb', 8);
        // Dresser and mirror.
        b.box(.5, .9, 1.4, -2.22, 0, .9, 'woodd');
        b.box(.04, .8, 1.0, -2.45, 1.05, .9, 'steel');
        b.vent('e', -.6, 2.1);
        b.radiator(1.0, -2.2, 'x', 7);
        b.frame('w', -1, 1.3, .55, .7, 'book3');
      },
      marks: {
        dresser: [-1.7, .9, -Math.PI / 2], door: [1.9, 1, -Math.PI / 2], bedL: [-1.0, -1.25, 0, 'lie'], bedR: [-.2, -1.25, 0, 'lie'], edge: [.45, -.8, -Math.PI / 2, 'sit'], window: [1.0, -1.7, Math.PI], mid: [.6, .5, Math.PI],
      },
      spots: { bed: [-.6, .75, -.6], pillow: [-.2, .8, -1.85], vent: [2.45, 2.2, -.6], radiator: [1.0, .8, -2.1], lamp: [-1.75, 1.1, -1.95], boxes: [1.2, .55, 1.6], walls: [-2.4, 1.7, -.4] },
      boxSpots: [[1.2, 1.7], [1.8, 1.7], [.6, 1.8], [1.2, 1.7, 1], [1.8, 1.7, 1]],
    },

    wren: {
      label: "Wren's room",
      cam: { p: [1.75, 2.15, 1.75], t: [-.65, .55, -.7], fov: 60, roll: -.03 },
      sun: [-2, 6, -8], lamps: [[-1.55, .95, 1.2, '#ffc070', .8]],
      build(b) {
        b.W = 4; b.D = 4; b.H = 2.5;
        b.shell('wren', 'wood');
        b.wall('n', [{ at: .7, w: 1, y0: .95, y1: 2.05 }]);
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('e', 1);
        // Bed.
        b.box(.95, .3, 1.85, -1.42, 0, -.9, 'woodl');
        b.box(.9, .15, 1.8, -1.42, .3, -.9, 'white');
        b.box(.92, .05, 1.2, -1.42, .45, -.6, 'pink');
        b.box(.55, .08, .35, -1.42, .45, -1.6, 'paper');
        // Desk with drawings.
        b.box(1.0, .05, .55, .9, .62, -1.68, 'woodl');
        b.box(.05, .62, .5, .45, 0, -1.68, 'woodl'); b.box(.05, .62, .5, 1.35, 0, -1.68, 'woodl');
        b.box(.3, .005, .22, .75, .67, -1.65, 'paper'); b.box(.3, .005, .22, 1.1, .67, -1.7, 'paper', { ry: .3 });
        b.chair(.9, -1.05, Math.PI);
        // Dumbwaiter hatch.
        b.box(.05, .7, .7, -1.97, .7, .3, 'trim');
        b.box(.06, .6, .6, -1.965, .75, .3, 'dark');
        b.box(.1, .05, .15, -1.92, .95, .3, 'steel');
        // Drawings pinned to the wall.
        for (let i = 0; i < 4; i++) b.box(.28, .22, .01, -1.2 + i * .36, 1.35 + (i % 2) * .18, -1.98, 'paper');
        // Lamp on a low shelf.
        b.box(.4, .5, .4, -1.75, 0, 1.2, 'woodl');
        const s = b.cyl(.15, .18, -1.75, .72, 1.2, 'shade', 8, .09); s.castShadow = false;
        b.cyl(.03, .06, -1.75, .7, 1.2, 'bulb', 6); b.cyl(.04, .22, -1.75, .5, 1.2, 'chalk', 6);
        b.vent('e', -.8, 2.05);
      },
      marks: { bed: [-1.42, -1.05, 0, 'lie'], desk: [.9, -1.1, Math.PI, 'sit'], hatch: [-1.45, .3, -Math.PI / 2], floor: [-.4, .5, Math.PI / 2, 'kneel'], door: [1.4, 1, -Math.PI / 2] },
      spots: { hatch: [-1.93, 1.1, .3], bed: [-1.42, .7, -.5], vent: [1.95, 2.13, -.8], lamp: [-1.75, .95, 1.2], wall: [-.6, 1.5, -1.95], boxes: [.7, .55, 1.4] },
      boxSpots: [[.4, 1.55], [1.0, 1.6], [.4, 1.55, 1]],
    },

    bath: {
      label: 'The bathroom',
      cam: { p: [1.2, 2.1, 1.4], t: [-.5, .65, -.65], fov: 66, roll: .03 },
      sun: [-2, 6.5, -8], lamps: [[0, 2.15, 0, '#fff0d0', .9]],
      build(b) {
        b.W = 3; b.D = 3.2; b.H = 2.5;
        b.shell('green', 'tile');
        b.wall('n', [{ at: .4, w: .6, y0: 1.4, y1: 2.1 }]);
        b.wall('s'); b.wall('e'); b.wall('w');
        b.door('e', .9);
        b.box(.8, .55, 1.7, -1.05, 0, -.6, 'tub');
        b.box(.62, .03, 1.5, -1.05, .53, -.6, 'iron');
        b.box(.05, .2, .05, -1.05, .55, -1.42, 'steel');
        b.box(.55, .1, .42, .85, .75, -1.35, 'tub');
        b.box(.14, .75, .14, .85, 0, -1.35, 'tub');
        b.box(.5, .65, .03, .85, 1.15, -1.58, 'steel');
        b.box(.42, .4, .6, -1.05, 0, 1.1, 'tub'); b.box(.42, .4, .15, -1.05, .4, 1.34, 'tub');
        b.vent('w', .5, 2.0);
        b.cyl(.09, .06, 0, 2.42, 0, 'bulb', 8);
      },
      marks: { sink: [.85, -.85, Math.PI], tub: [-1.05, -.6, 0, 'lie'], door: [1.0, .9, -Math.PI / 2], mid: [0, .1, Math.PI] },
      spots: { tub: [-1.05, .7, -.5], sink: [.85, .95, -1.35], mirror: [.85, 1.5, -1.55], vent: [-1.45, 2.1, .5] },
      boxSpots: [],
    },

    garage: {
      label: 'The garage',
      cam: { p: [2.75, 1.42, 2.75], t: [-.35, .85, -1.1], fov: 58, roll: -.015 },
      sun: [1.2, 3.2, -9], lamps: [[1.8, 2.3, 1.2, '#ddd6b0', .9]],
      build(b) {
        b.W = 6; b.D = 7.5; b.H = 2.8;
        b.shell('plaster', 'concrete', 'dark');
        b.wall('n', [{ at: 0, w: 4.2, y0: 0, y1: 2.4, kind: 'hole' }], 'concrete');
        b.box(8, 2.8, .05, 0, 0, -5.6, 'outside');
        b.wall('s', [], 'concrete'); b.wall('e', [], 'plaster'); b.wall('w', [], 'plaster');
        b.door('s', -1.8, 'white');
        // The car.
        b.box(1.76, .5, 4.2, 0, .3, -.4, 'car');
        b.box(1.7, .05, 1.0, 0, .8, -1.95, 'car');
        b.box(1.7, .05, .75, 0, .8, 1.3, 'car');
        for (const [x, z] of [[-.84, -.74], [.84, -.74], [-.84, .94], [.84, .94]]) b.box(.06, .55, .06, x, .8, z, 'car');
        b.box(1.7, .05, 1.76, 0, 1.33, .1, 'car');
        b.box(1.5, .46, .1, 0, .78, -.2, 'dark');
        for (const [x, z] of [[-.88, -1.7], [.88, -1.7], [-.88, .9], [.88, .9]]) { const c = b.cyl(.3, .22, x, .19, z, 'tyre', 10); c.rotation.z = Math.PI / 2; c.position.y = .3; }
        b.box(.3, .07, .04, .55, .35, 1.72, 'steel');
        b.box(.3, .07, .04, -.55, .35, 1.72, 'steel');
        // Workbench, shelves and a box of tapes.
        b.box(2.4, .08, .6, -2.65, .85, 1.5, 'woodl', { ry: Math.PI / 2 });
        b.box(.5, .85, .06, -2.65, 0, .4, 'woodd'); b.box(.5, .85, .06, -2.65, 0, 2.6, 'woodd');
        b.box(.34, .22, .28, -2.65, .93, 2.2, 'card');
        b.box(.3, .03, 2.8, -2.82, 1.7, -.8, 'woodl');
        for (let i = 0; i < 7; i++) b.cyl(.09, .2 + i % 3 * .05, -2.82, 1.73, -1.9 + i * .36, ['book3', 'iron', 'book2'][i % 3], 7);
        b.box(.018, .7, .018, 1.8, 2.1, 1.2, 'iron');
        b.cyl(.1, .1, 1.8, 2.05, 1.2, 'bulb', 8);
      },
      marks: {
        carL: [-.42, .25, Math.PI, 'carsit'], carR: [.42, .25, Math.PI, 'carsit'], bench: [-2.1, 1.7, -Math.PI / 2], door: [-1.8, 3.2, Math.PI], beside: [1.35, 1.6, Math.PI],
      },
      spots: { gdoor: [.2, 1.9, -3.7], bench: [-2.65, 1.2, 2.2], car: [0, 1.5, .1], vent: [2.9, 2.2, 1] },
      boxSpots: [[2.5, 2.9], [1.9, 3.1], [2.5, 2.9, 1], [2.5, 2.2]],
    },

    crawl: {
      label: 'The crawlspace',
      cam: { p: [1.5, 1.12, 2.1], t: [-.35, .42, -.65], fov: 60, roll: .05 },
      sun: [0, 0, 0], noSun: true, lamps: [[-.2, 1.05, -.2, '#ffcf88', 1.0]], alwaysLamp: true,
      build(b) {
        b.W = 4.5; b.D = 4.5; b.H = 1.35;
        b.shell('dirt', 'dirt', 'woodd');
        b.wall('n', [], 'dirt'); b.wall('s', [], 'dirt'); b.wall('e', [], 'dirt'); b.wall('w', [], 'dirt');
        for (let i = 0; i < 5; i++) b.box(.16, .16, 4.5, -2 + i, 1.19, 0, 'woodl');
        for (const [x, z] of [[-1.5, -1.5], [1.5, -1.3], [1.4, 1.4], [-1.6, 1.3]]) b.box(.2, 1.2, .2, x, 0, z, 'woodl');
        b.chair(-.3, -.75, Math.PI);
        b.box(.018, .22, .018, -.2, 1.1, -.2, 'iron');
        b.cyl(.04, .06, -.2, 1.04, -.2, 'bulb', 6);
        // Dumbwaiter shaft.
        b.box(.7, 1.35, .05, 1.5, 0, -2.1, 'trim');
        b.box(.56, .56, .06, 1.5, .44, -2.08, 'dark');
        b.box(.5, .03, .4, 1.5, .44, -1.88, 'woodl');
        // Plates, stacked neatly, going back a long time.
        for (let s = 0; s < 4; s++) for (let i = 0; i < 9 - s * 2; i++) b.cyl(.11, .012, -1.4 + s * .28, i * .014, -1.8, 'chalk', 10);
      },
      marks: { chair: [-.3, -.72, Math.PI, 'sit'] },
      spots: { shaft: [1.5, .72, -2.05], chair: [-.3, 1.08, -1.0] },
      boxSpots: [],
    },

    space: {
      label: 'The space',
      cam: { p: [.85, 2.0, 1.0], t: [-.1, .55, -.7], fov: 62, roll: 0 },
      sun: [0, 0, 0], noSun: true, lamps: [[0, 2.15, 0, '#f3e6c6', .95]], alwaysLamp: true,
      build(b) {
        b.W = 2.4; b.D = 2.4; b.H = 2.3;
        b.shell('plaster', 'plaster');
        b.wall('n'); b.wall('s'); b.wall('e'); b.wall('w');
        b.chair(0, -.6, Math.PI);
        b.cyl(.05, .05, 0, 2.25, 0, 'bulb', 8);
      },
      marks: { chair: [0, -.56, Math.PI, 'sit'], in: [.6, .7, Math.PI] },
      spots: { wall: [0, 1.3, -1.18], chair: [0, .75, -.7] },
      boxSpots: [],
    },

    // Only ever used for the photograph on the title screen.
    photo: {
      label: 'The front of the house',
      size: () => [16, 16, 9],
      cam: { p: [0, 1.2, 6.5], t: [0, 2.15, -2], fov: 52, roll: -.008 },
      sun: [-5, 9, 8], lamps: [[0, 3, 0, '#ffd9a0', .01]], exposure: .36,
      build(b) {
        const lawn = '#7d9a5a', siding = '#ece3cd', shadow = '#b9ae95', roof = '#5c4a3e';
        b.box(40, .2, 40, 0, -.2, 0, lawn);
        b.box(60, 30, .2, 0, -1, -12, 'photosky', { cast: false });
        b.box(1.5, .03, 9, 0, 0, 2, 'chalk');
        // The front wall, in clapboard.
        b.box(11, 5.2, 3, 0, 0, -4.5, siding);
        for (let i = 0; i < 26; i++) b.box(11.02, .02, .03, 0, .1 + i * .2, -3, shadow);
        // Roof.
        b.box(12.6, .22, 5.4, 0, 6.15, -5.1, roof, { rx: -.48 });
        b.box(12.6, .22, 5.4, 0, 6.15, -7.3, roof, { rx: .48 });
        b.box(11, 1.3, 3, 0, 5.2, -4.5, siding);
        // Porch and steps.
        b.box(3.8, .34, 1.5, 0, 0, -2.3, 'chalk');
        b.box(2.2, .17, .4, 0, 0, -1.4, 'chalk');
        for (const x of [-1.75, 1.75]) b.box(.14, 2.55, .14, x, .34, -1.72, 'white');
        b.box(4.1, .16, 1.75, 0, 2.86, -2.3, siding);
        // Door.
        b.box(1.22, 2.3, .06, 0, .34, -2.97, 'trim');
        b.box(1.02, 2.14, .08, 0, .34, -2.95, '#7c2a22');
        b.box(.07, .07, .09, .36, 1.32, -2.9, 'steel');
        // Windows, downstairs and up.
        const win = (x, y, w, h) => {
          b.box(w + .2, h + .2, .05, x, y - .1, -2.98, 'trim');
          b.box(w, h, .06, x, y, -2.96, 'carglass');
          b.box(.05, h, .07, x, y, -2.95, 'trim');
          b.box(w, .05, .07, x, y + h / 2 - .025, -2.95, 'trim');
          for (const s of [-1, 1]) b.box(.32, h + .1, .05, x + s * (w / 2 + .28), y - .05, -2.97, '#47604f');
        };
        win(-3.4, 1.05, 1.3, 1.5); win(3.4, 1.05, 1.3, 1.5);
        win(-3.4, 3.5, 1.3, 1.3); win(0, 3.5, 1.1, 1.3); win(3.4, 3.5, 1.3, 1.3);
        // Hedges and a tree.
        for (const x of [-5, -4.1, -2.5, 2.5, 4.1, 5]) { const c = b.cyl(.48, .7, x, 0, -2.6, '#4d6b40', 7, .34); }
        b.cyl(.18, 3.4, -7.2, 0, -1.4, 'woodd', 7, .13);
        for (const [x, y, r] of [[-7.2, 4, 1.4], [-6.4, 3.4, 1], [-8, 3.3, 1]]) b.cyl(r, 1.6, x, y - .4, -1.4, '#55763f', 8, r * .55);
      },
      marks: { m: [-.62, 2.1, .05], d: [.68, 2.1, -.06], w: [.03, 2.75, 0] },
      spots: {},
      boxSpots: [],
    },

    nook: {
      label: 'Her room',
      cam: { p: [.72, 1.25, .95], t: [-.2, .25, -.5], fov: 68, roll: .04 },
      sun: [0, 0, 0], noSun: true, lamps: [[-.3, .35, -.5, '#ffb765', 1.1]], alwaysLamp: true,
      build(b) {
        b.W = 2.2; b.D = 2.2; b.H = 1.4;
        b.shell('wren', 'carpet');
        b.wall('n'); b.wall('s'); b.wall('e'); b.wall('w');
        b.box(1.5, .1, 1.1, -.25, 0, -.4, 'blanket');
        b.box(.5, .1, .3, -.7, .1, -.7, 'paper');
        b.cyl(.05, .14, -.3, .1, -.5, 'bulb', 6);
        for (let i = 0; i < 6; i++) b.box(.25, .19, .01, -.85 + i * .34, .55 + (i % 3) * .15, -1.08, 'paper');
      },
      marks: { sit: [-.1, -.35, 0, 'kneel'] },
      spots: { wall: [0, .85, -1.08] },
      boxSpots: [],
    },
  };

  const LIGHT = {
    day: { sky: '#f4f4e8', out: '#eef1e6', sun: ['#fff0d2', 3.2], fill: ['#fff4dc', 1.1], amb: .56, lamp: 0, bulb: '#e8d8b8' },
    eve: { sky: '#f2bd86', out: '#f2bd86', sun: ['#ffb878', 2.6], fill: ['#fad8ae', .86], amb: .42, lamp: 1.2, bulb: '#ffefc8' },
    night: { sky: '#26385a', out: '#1c2b48', sun: ['#8ca4d0', .7], fill: ['#7384aa', .2], amb: .11, lamp: .8, bulb: '#f0c088' },
  };

  function applyLight(state) {
    const l = LIGHT[state];
    mat('glass').color.set(l.sky);
    mat('outside').color.set(l.out);
    mat('bulb').color.set(l.bulb);
  }

  const built = {};
  function get(name, variant) {
    const key = variant ? `${name}|${variant}` : name;
    if (built[key]) return built[key];
    const def = defs[name];
    const sz = def.size ? def.size(variant) : [6, 5, 2.7];
    seed = 7;
    const b = new Builder(sz[0], sz[1], sz[2]);
    def.build(b, variant);
    b.group.updateMatrixWorld(true);
    return (built[key] = { key, name, def, group: b.group, W: b.W, D: b.D, H: b.H });
  }

  return { defs, get, LIGHT, applyLight, mat };
})();
