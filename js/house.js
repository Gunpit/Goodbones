// The floor plan. West to east downstairs: garage, kitchen, hall, living room. Upstairs: Wren's room, the landing, the bedroom.
// Every door here is a real hole in a real wall with a door that opens, and each one joins the same two rooms from both sides.
// This file only loads in play.html, and it replaces those rooms for this game. talk.html keeps its own kitchen.
const HOUSE = (() => {
  const DOOR_W = .96, DOOR_H = 2.1, T = .2;
  // Where each door is. A door has an end in each room it joins. "stand" is just inside the room, "beyond" is just past the wall.
  const DOORS = {
    gk: { a: { room: 'garage', side: 'e', at: -.6, stand: [2.35, -.6], beyond: [3.75, -.6] }, b: { room: 'kitchen', side: 'w', at: 1.1, stand: [-2.4, 1.1], beyond: [-3.75, 1.1] } },
    kh: { a: { room: 'kitchen', side: 'e', at: -.95, stand: [2.35, -.95], beyond: [3.75, -.95] }, b: { room: 'hallway', side: 'w', at: 1.0, stand: [-1.05, 1.0], beyond: [-2.45, 1.0] } },
    hl: { a: { room: 'hallway', side: 'e', at: -2.3, stand: [1.05, -2.3], beyond: [2.45, -2.3] }, b: { room: 'living', side: 'w', at: -1.0, stand: [-2.35, -1.0], beyond: [-3.75, -1.0] } },
    front: { a: { room: 'hallway', side: 'n', at: 0, stand: [0, -3.35], beyond: [0, -4.85], color: '#7c2a22' }, b: { room: 'outside' } },
    wd: { a: { room: 'wren', side: 'e', at: -.2, stand: [1.35, -.2], beyond: [2.75, -.2] }, b: { room: 'landing' } },
    bd: { a: { room: 'bedroom', side: 'w', at: -.6, stand: [-1.9, -.6], beyond: [-3.25, -.6] }, b: { room: 'landing' } },
  };
  const STAIRS = { x: -1.2, base: [-1.2, .1], top: [-1.2, -3.3], z0: -.2, z1: -3.2, rise: 2.5 };
  const EDGES = [['garage', 'kitchen', 'gk'], ['kitchen', 'hallway', 'kh'], ['hallway', 'living', 'hl'], ['hallway', 'outside', 'front'], ['hallway', 'landing', 'stairs'], ['landing', 'wren', 'wd'], ['landing', 'bedroom', 'bd']];
  function path(from, to) {
    const seen = { [from]: null }, q = [from];
    while (q.length) {
      const r = q.shift();
      if (r === to) break;
      EDGES.forEach(([a, b, id]) => {
        const n = a === r ? b : b === r ? a : null;
        if (n && !(n in seen)) { seen[n] = { from: r, id }; q.push(n); }
      });
    }
    const legs = [];
    let at = to;
    while (seen[at]) { legs.unshift({ from: seen[at].from, to: at, id: seen[at].id }); at = seen[at].from; }
    return legs;
  }
  const end = (id, room) => { const d = DOORS[id]; return d && (d.a.room === room ? d.a : d.b.room === room ? d.b : null); };
  // Height on the stairs goes up in steps, tread by tread, rather than up a ramp, and each foot lands on top of a tread.
  const stairY = (x, z) => {
    if (x >= -.62 || z >= STAIRS.z0) return 0;
    const n = 12, f = Math.min(1, (STAIRS.z0 - z) / (STAIRS.z0 - STAIRS.z1)) * n, i = Math.floor(f), t = f - i;
    return (Math.min(n, i + 1 - Math.pow(1 - Math.min(1, t * 2.2), 2))) * (STAIRS.rise / n);
  };

  // ---- Building the rooms ----
  // The wall nearest you is gone, like the front of a dollhouse, so the camera can stand back and see every door.
  function open(b, floor, ceil) {
    const { W, D, H } = b;
    b.box(W + .6, .2, 6, 0, -.2, D / 2 + 3, floor);
    b.box(W + .6, .2, 6, 0, H, D / 2 + 3, ceil || 'plaster');
  }
  function doorWall(b, side, at, m, beyondMat, floor) {
    const { W, D, H } = b, horiz = side === 'n', m0 = m || b.wallMat;
    const L = horiz ? W : D, sign = side === 'w' || side === 'n' ? -1 : 1;
    const off = (horiz ? D : W) / 2 * sign + T / 2 * sign, inner = (horiz ? D : W) / 2 * sign;
    const put = (w, h, along, y, dep, mm, across) => horiz ? b.box(w, h, dep, along, y, across, mm) : b.box(dep, h, w, across, y, along, mm);
    const a0 = at - DOOR_W / 2, a1 = at + DOOR_W / 2;
    const seg = (s, e) => put(e - s, H, (s + e) / 2, 0, T, m0, off);
    seg(-L / 2 - T, a0); seg(a1, L / 2 + T);
    put(DOOR_W, H - DOOR_H, at, DOOR_H, T, m0, off);
    // Trim around the opening, baseboard either side of it, picture rail over it.
    put(.09, DOOR_H + .09, a0 - .04, 0, .3, 'trim', off); put(.09, DOOR_H + .09, a1 + .04, 0, .3, 'trim', off);
    put(DOOR_W + .17, .09, at, DOOR_H - .005, .3, 'trim', off);
    const bx = inner - sign * .12;
    put(a0 - .09 + L / 2, .13, (a0 - .09 - L / 2) / 2, 0, .05, 'trim', bx);
    put(L / 2 - a1 - .09, .13, (a1 + .09 + L / 2) / 2, 0, .05, 'trim', bx);
    if (H > 2) put(L, .04, 0, H - .32, .03, 'trim', bx);
    // What you can see when it opens: a bit of floor, and the next room's wall.
    put(DOOR_W + .2, .02, at, -.01, 1.5, floor, inner + sign * .8);
    if (!beyondMat) return;
    put(3.2, H, at, 0, .05, beyondMat, inner + sign * 1.55);
    put(.05, H, a0 - .1, 0, 1.5, beyondMat, inner + sign * .8); put(.05, H, a1 + .1, 0, 1.5, beyondMat, inner + sign * .8);
  }
  const D = Sets.defs;

  D.kitchen = Object.assign({}, D.kitchen, {
    cam: { p: [1.1, 2.45, 4.35], t: [-.2, .75, -1.0], fov: 47, roll: 0 },
    build(b) {
      b.shell('mustard', 'lino'); open(b, 'lino');
      b.wall('n', [{ at: -.5, w: 1.5, y0: 1.05, y1: 2.15 }]);
      doorWall(b, 'w', 1.1, null, 'plaster', 'concrete');
      doorWall(b, 'e', -.95, null, 'green', 'wood');
      b.box(3.7, .88, .6, -.75, 0, -2.2, 'woodl');
      b.box(3.74, .05, .64, -.75, .88, -2.18, 'enamel');
      b.box(.8, .04, .42, -.5, .9, -2.2, 'steel');
      b.box(.04, .22, .04, -.5, .93, -2.38, 'steel');
      for (let i = 0; i < 5; i++) b.box(.66, .74, .02, -2.3 + i * .76, .08, -1.89, 'woodd');
      b.box(.8, .78, .34, -2.1, 1.55, -2.32, 'woodl');
      b.box(.8, .78, .34, 1.2, 1.55, -2.32, 'woodl');
      b.box(.76, .92, .62, 1.55, 0, -2.18, 'enamel');
      b.box(.76, .03, .62, 1.55, .92, -2.18, 'iron');
      b.cyl(.11, .15, 1.45, .95, -2.2, 'steel', 10, .07);
      b.box(.8, 1.8, .7, 2.5, 0, -2.1, 'white');
      b.box(.03, .5, .03, 2.14, .9, -1.74, 'steel');
      b.box(1.7, .05, 1.0, 0, .73, .3, 'woodd');
      for (const [a, c] of [[-.75, -.08], [.75, -.08], [-.75, .68], [.75, .68]]) b.box(.06, .73, .06, a, 0, c, 'woodd');
      b.chair(0, -.5, 0); b.chair(-1.22, .3, Math.PI / 2); b.chair(1.22, .3, -Math.PI / 2); b.chair(0, 1.1, Math.PI);
      b.cyl(.05, .1, 0, .78, .3, 'white', 8);
      b.radiator(-2.86, -.4, 'z');
      b.box(.36, .5, .02, 1.35, 1.25, -2.47, 'cal');
      b.box(.09, .09, .02, 1.43, 1.37, -2.455, 'red');
      b.box(.05, .26, .13, -2.95, 1.25, -.6, 'dark');
      b.box(.02, .38, .16, -2.97, 1.2, -.6, 'iron');
      b.box(.04, .05, .34, -2.95, 1.62, -1.5, 'woodl');
      b.box(.02, .13, .03, -2.93, 1.47, -1.5, 'steel');
      b.vent('e', .7, 2.15);
      // Wren's drawing of the house, on the fridge door under a magnet, where you can see it.
      if (b.pic('n', 2.42, .98, .32, .42, 'myhouse', .755)) b.box(.05, .05, .02, 2.42, 1.37, -1.735, 'red');
      b.frame('e', 1.5, 1.25, .5, .65, 'book2');
      b.lamp(0, 2.0, .3);
    },
  });

  D.living = Object.assign({}, D.living, {
    cam: { p: [.9, 2.4, 4.3], t: [-.25, .7, -1.0], fov: 47, roll: 0 },
    build(b) {
      b.shell('oxblood', 'wood'); open(b, 'wood');
      b.wall('n', [{ at: .75, w: 1.5, y0: .8, y1: 2.2 }]);
      doorWall(b, 'w', -1.0, null, 'green', 'wood');
      b.wall('e');
      b.box(3.4, .015, 2.6, -.2, 0, .1, 'carpet');
      // Bookshelf on the west wall, past the door.
      b.box(.3, 2.2, 2.0, -2.84, 0, 1.0, 'woodd');
      for (let i = 0; i < 5; i++) {
        b.box(.32, .03, 1.9, -2.68, .18 + i * .42, 1.0, 'woodl');
        const g0 = b.group, g = new THREE.Group();
        b.group = g; b.books(0, .21 + i * .42, 0, 1.7 - i * .1); g.rotation.y = Math.PI / 2; g.position.set(-2.62, 0, 1.0);
        b.group = g0; g0.add(g);
      }
      b.box(2.0, .42, .85, -.25, 0, -1.3, 'sofa');
      b.box(2.0, .55, .22, -.25, .42, -1.68, 'sofa');
      b.box(.22, .25, .85, -1.25, .42, -1.3, 'sofa'); b.box(.22, .25, .85, .75, .42, -1.3, 'sofa');
      b.box(.8, .42, .8, 2.35, 0, .2, 'red'); b.box(.2, .55, .8, 2.65, .42, .2, 'red');
      b.box(1.0, .4, .55, -.2, 0, .1, 'woodd');
      b.box(.04, 1.4, .04, -2.3, 0, -2.15, 'iron');
      const s = b.cyl(.24, .3, -2.3, 1.4, -2.15, 'shade', 8, .14); s.castShadow = false;
      b.cyl(.05, .08, -2.3, 1.38, -2.15, 'bulb', 8);
      b.radiator(.75, -2.32, 'x', 11);
      // The wall off the title screen: the fireman fork, the photograph of the house, and the side table under it,
      // with the lamp, the books and the mug, the bowl of keys, the clock and the can of soup nobody mentions.
      b.pic('e', -2.05, 1.08, .5, .66, 'fork', .03);
      b.pic('e', -1.2, 1.14, .97, .6, 'housephoto', .03);
      {
        const tx = 2.78, tz = -1.2, top = .78;
        b.box(.42, .04, 1.25, tx, top - .04, tz, 'woodl');
        b.box(.36, .1, 1.15, tx, top - .14, tz, 'woodd');
        for (const [dx, dz] of [[-.16, -.54], [.16, -.54], [-.16, .54], [.16, .54]]) b.box(.04, top - .14, .04, tx + dx, 0, tz + dz, 'dark');
        b.cyl(.06, .03, tx - .02, top, tz - .42, 'iron', 10);
        b.cyl(.012, .17, tx - .02, top + .03, tz - .42, 'steel', 6);
        const sh = b.cyl(.09, .11, tx - .02, top + .18, tz - .42, 'shade', 10, .05); sh.castShadow = false;
        b.box(.16, .035, .25, tx - .03, top, tz - .12, 'book1'); b.box(.15, .03, .23, tx - .03, top + .035, tz - .12, 'book2'); b.box(.14, .03, .2, tx - .03, top + .065, tz - .12, 'book3');
        b.cyl(.025, .05, tx - .03, top + .095, tz - .12, 'enamel', 10);
        b.cyl(.07, .045, tx, top, tz + .15, '#3f5f6e', 14, .04);
        b.cyl(.023, .062, tx + .02, top, tz + .38, 'red', 10);
        b.box(.04, .13, .1, tx + .06, top, tz + .52, 'dark', { ry: .2 });
      }
      // And the visitor, who has always been here.
      b.frame('n', -1.55, 1.12, .72, .96, 'pic:visitor');
      b.vent('n', -.3, 2.2);
    },
    boxSpots: [[1.3, 2.0], [1.9, 2.0], [1.6, 1.4], [1.3, 2.0, 1], [1.9, 2.0, 1], [2.4, 1.5], [2.4, 2.1], [2.4, 2.1, 1]],
    lamps: [[-2.3, 1.45, -2.15, '#ffcf90', 1.0]],
  });

  D.hallway = {
    label: 'The hall',
    // A tall entry hall, open up to the second floor, so people going upstairs walk up out of the shot and not into a ceiling.
    size: () => [3.4, 8, 5.0],
    cam: { p: [.45, 2.3, 5.2], t: [-.05, .85, -2.0], fov: 41, roll: 0 },
    sun: [.3, 4, -9], lamps: [[.2, 2.15, .9, '#ffd9a0', 1.0]],
    build(b) {
      const { W, D: DD, H } = b;
      b.shell('green', 'wood'); open(b, 'wood');
      doorWall(b, 'n', 0, null, null, 'chalk');
      // Doors either side.
      doorWall(b, 'w', 1.0, null, 'mustard', 'lino');
      doorWall(b, 'e', -2.3, null, 'oxblood', 'wood');
      // The stairs face you down the west side, and climb away up through the ceiling.
      const n = 12, tread = (STAIRS.z0 - STAIRS.z1) / n, rise = STAIRS.rise / n;
      for (let i = 0; i < n; i++) b.box(1.0, rise * (i + 1), tread, -1.2, 0, STAIRS.z0 - tread * (i + .5), 'woodl');
      b.box(.08, 1.05, .08, -.68, 0, STAIRS.z0 + .02, 'woodd');
      for (let i = 1; i < n; i += 2) b.box(.025, .9, .025, -.68, rise * (i + 1), STAIRS.z0 - tread * (i + .5), 'woodl');
      const len = Math.hypot(STAIRS.z0 - STAIRS.z1, STAIRS.rise);
      b.box(.05, .05, len, -.68, .95 + STAIRS.rise / 2, (STAIRS.z0 + STAIRS.z1) / 2, 'woodd', { rx: Math.atan2(STAIRS.rise, STAIRS.z0 - STAIRS.z1) });
      // The upstairs landing they arrive on, along the far wall.
      b.box(W, .3, .85, 0, STAIRS.rise - .3, -3.58, 'woodd');
      b.box(W, .05, .05, 0, STAIRS.rise + .9, -3.2, 'woodd');
      for (let i = 0; i < 14; i++) b.box(.025, .9, .025, -W / 2 + .95 + i * .19, STAIRS.rise, -3.2, 'woodl');
      // The picture rail, down where you can see it.
      for (const s of [-1, 1]) b.box(.03, .04, DD, s * (W / 2 - .12), 2.28, 0, 'trim');
      // Coats, a small table, a framed thing, a runner.
      b.box(.06, .08, 1.3, W / 2 - .05, 1.62, -.75, 'woodl');
      for (const [z, m] of [[-1.15, 'book4'], [-.7, 'book1'], [-.35, 'book2']]) b.box(.1, .85, .32, W / 2 - .1, .78, z, m);
      // Marion's mother.
      b.frame('w', 2.4, 1.3, .55, .65, 'pic:grandma');
      b.box(1.0, .012, 4.8, .3, 0, -.8, 'carpet');
      b.lamp(.2, 2.15, .9);
      // Out the front: a path, a lawn, and the sky. A rug-sized piece of the outdoors.
      b.box(40, .1, 30, 0, -.14, -20, '#7d9a5a');
      b.box(1.5, .02, 14, 0, -.03, -11, 'chalk');
      b.box(60, 24, .1, 0, -2, -26, 'outside');
    },
    marks: {}, spots: {},
    boxSpots: [[1.3, .35], [1.3, .95], [1.3, 1.55], [1.3, .35, 1], [1.3, .95, 1], [1.3, 1.55, 1], [.7, 1.55], [1.3, 2.15]],
  };

  D.wren = Object.assign({}, D.wren, {
    cam: { p: [.55, 2.2, 4.1], t: [-.15, .7, -.9], fov: 44, roll: 0 },
    lamps: [[-.6, .95, -1.72, '#ffc070', .8]],
    build(b) {
      b.W = 4; b.D = 4; b.H = 2.5;
      b.shell('wren', 'wood'); open(b, 'wood');
      b.wall('n', [{ at: .7, w: 1, y0: .95, y1: 2.05 }]);
      b.wall('w');
      doorWall(b, 'e', -.2, null, 'nicotine', 'carpet');
      b.box(.95, .3, 1.85, -1.42, 0, -.9, 'woodl');
      b.box(.9, .15, 1.8, -1.42, .3, -.9, 'white');
      b.box(.92, .05, 1.2, -1.42, .45, -.6, 'pink');
      b.box(.55, .08, .35, -1.42, .45, -1.6, 'paper');
      b.box(1.0, .05, .55, .9, .62, -1.68, 'woodl');
      b.box(.05, .62, .5, .45, 0, -1.68, 'woodl'); b.box(.05, .62, .5, 1.35, 0, -1.68, 'woodl');
      b.box(.3, .005, .22, .75, .67, -1.65, 'paper'); b.box(.3, .005, .22, 1.1, .67, -1.7, 'paper', { ry: .3 });
      b.chair(.9, -1.05, Math.PI);
      b.box(.05, .7, .7, -1.97, .7, .3, 'trim');
      b.box(.06, .6, .6, -1.965, .75, .3, 'dark');
      b.box(.1, .05, .15, -1.92, .95, .3, 'steel');
      // Her drawings, pinned up: the three of them under a rainbow, the vent saying hello, the car, and the house hugging.
      for (let i = 0; i < 4; i++) if (!b.pic('n', -1.2 + i * .36, 1.35 + (i % 2) * .18, .28, .22, `wren${i + 1}`, .025)) b.box(.28, .22, .01, -1.2 + i * .36, 1.35 + (i % 2) * .18, -1.98, 'paper');
      // The lamp, now beside the bed where a lamp goes.
      b.box(.4, .5, .4, -.62, 0, -1.72, 'woodl');
      const s = b.cyl(.15, .18, -.62, .72, -1.72, 'shade', 8, .09); s.castShadow = false;
      b.cyl(.03, .06, -.62, .7, -1.72, 'bulb', 6); b.cyl(.04, .22, -.62, .5, -1.72, 'chalk', 6);
      // More of the west wall, past the cut-away, so the side shot of Wren and the vent has something behind it.
      b.box(.2, b.H, 3, -2.1, 0, 3.7, 'wren');
      b.box(.05, .13, 3, -1.98, 0, 3.7, 'trim');
      // The vent. It is at about the height of an eight-year-old sitting on the floor, which is nobody's fault.
      b.box(.05, .46, .76, -1.975, .44, 1.25, 'trim');
      b.box(.03, .36, .66, -1.955, .49, 1.25, 'black');
      for (let i = 0; i < 7; i++) b.box(.05, .022, .62, -1.94, .51 + i * .05, 1.25, 'steel', { rz: .4 });
    },
  });

  // The front of the house, for the photograph on the title screen.
  D.photo = Object.assign({}, D.photo, {
    cam: { p: [0, 1.3, 9.4], t: [0, 2.35, -2], fov: 42, roll: -.006 },
    sun: [-6, 10, 9], exposure: .4,
    build(b) {
      const lawn = '#6f9a3e', lawn2 = '#628c36', siding = '#f3ecd9', shade = '#a89c80', roof = '#463529', trim = 'trim', shutter = '#2f5140', door = '#8a2318', brick = '#823f2c', green = '#35592d', green2 = '#467238';
      Sets.mat('photosky').color.set('#6fa8d6');
      b.box(60, .2, 60, 0, -.2, 0, lawn);
      for (let i = 0; i < 7; i++) b.box(60, .004, 1.1, 0, 0, -1 + i * 2.2, lawn2);
      b.box(90, 40, .2, 0, -1, -22, 'photosky', { cast: false });
      // Far trees, behind the house.
      for (const [x, z, r, h] of [[-12, -13, 2.6, 8], [-8, -15, 3, 9], [11, -14, 2.8, 8.5], [14.5, -11, 2.2, 7], [5, -18, 3.2, 10], [-3, -18, 3, 9]]) b.cyl(r, h, x, 0, z, green, 9, r * .5);
      // The house: two storeys of clapboard.
      const X = 11.4, Y = 5.3, Zf = -3;
      b.box(X, Y, 6, 0, 0, Zf - 3, siding);
      for (let i = 0; i < 27; i++) b.box(X + .02, .018, .03, 0, .08 + i * .2, Zf, shade);
      for (const x of [-X / 2, X / 2]) b.box(.16, Y, .08, x, 0, Zf + .03, trim);
      b.box(X + .1, .14, .08, 0, Y - .14, Zf + .03, trim);
      b.box(X + .1, .3, .1, 0, 0, Zf + .03, '#8c8675');
      // Roof, pitched front to back, with a chimney.
      b.box(X + 1.1, .2, 4.3, 0, Y + 1.0, Zf - 1.35, roof, { rx: .56 });
      b.box(X + 1.1, .2, 4.3, 0, Y + 1.0, Zf - 4.65, roof, { rx: -.56 });
      b.box(X - .04, 1.1, 2.2, 0, Y, Zf - 3, siding);
      b.box(.85, 2.5, .85, 3.5, Y + .5, Zf - 2.7, brick);
      b.box(.98, .12, .98, 3.5, Y + 3.0, Zf - 2.7, '#5e3a2e');
      // A gable over the middle, with a little round window. It looks like a face if you let it.
      const gx = 2.1;
      b.box(2.74, .16, 2.65, -1.11, Y + .9, Zf + .15, roof, { rz: .62, ry: 0 });
      b.box(2.74, .16, 2.65, 1.11, Y + .9, Zf + .15, roof, { rz: -.62, ry: 0 });
      for (let i = 0; i < 28; i++) { const w = 3.3 - i * .115; b.box(w, .05, .06, 0, Y - .15 + i * .05, Zf + .06, siding); }
      b.cyl(.34, .06, 0, Y + .28, Zf + .02, trim, 18).rotation.x = Math.PI / 2;
      b.cyl(.26, .08, 0, Y + .28, Zf + .03, 'carglass', 18).rotation.x = Math.PI / 2;
      // Porch: floor, steps, posts, rail, a roof, a light.
      b.box(5.0, .36, 1.8, 0, 0, Zf + .9, '#a59f8b');
      b.box(2.4, .12, .4, 0, .12, Zf + 2.0, 'chalk');
      b.box(2.8, .12, .44, 0, 0, Zf + 2.3, 'chalk');
      for (const x of [-2.3, -.92, .92, 2.3]) b.box(.16, 2.5, .16, x, .36, Zf + 1.64, 'white');
      for (const [a, c] of [[-1.61, 1.2], [1.61, 1.2]]) {
        b.box(c, .05, .05, a, 1.15, Zf + 1.64, 'white'); b.box(c, .05, .05, a, .5, Zf + 1.64, 'white');
        for (let i = 0; i < 7; i++) b.box(.035, .65, .035, a - .5 + i * .17, .5, Zf + 1.64, 'white');
      }
      b.box(5.5, .2, 2.2, 0, 2.86, Zf + 1.0, siding);
      b.box(5.8, .12, 2.5, 0, 3.05, Zf + 1.08, roof);
      b.cyl(.07, .16, .95, 2.2, Zf + .08, 'book3', 8);
      // Front door.
      b.box(1.3, 2.36, .06, 0, .36, Zf + .02, trim);
      b.box(1.06, 2.2, .08, 0, .36, Zf + .03, door);
      for (const y of [.55, 1.55]) b.box(.72, .72, .1, 0, y, Zf + .03, '#6a221b');
      b.box(.07, .07, .1, .4, 1.36, Zf + .08, 'steel');
      // Windows, with shutters and boxes of something that is doing well.
      const win = (x, y, w, h, box) => {
        b.box(w + .22, h + .22, .05, x, y - .11, Zf + .02, trim);
        b.box(w, h, .06, x, y, Zf + .03, 'carglass');
        b.box(.05, h, .07, x, y, Zf + .05, trim);
        b.box(w, .05, .07, x, y + h / 2 - .025, Zf + .05, trim);
        for (const s of [-1, 1]) {
          b.box(.34, h + .12, .05, x + s * (w / 2 + .29), y - .06, Zf + .03, shutter);
        }
        if (box) {
          b.box(w + .2, .2, .22, x, y - .3, Zf + .12, 'woodd');
          for (let i = 0; i < 7; i++) b.cyl(.09, .14, x - w / 2 + i * w / 6, y - .12, Zf + .12, i % 2 ? '#b0473c' : '#d4a43a', 6);
        }
      };
      win(-3.9, 1.1, 1.3, 1.5, true); win(3.9, 1.1, 1.3, 1.5, true);
      win(-3.9, 3.45, 1.2, 1.3); win(-1.7, 3.45, .9, 1.3); win(1.7, 3.45, .9, 1.3); win(3.9, 3.45, 1.2, 1.3);
      // The path, in stones. The shrubs, in a row. A mailbox, a tree, and some fence.
      for (let i = 0; i < 14; i++) b.box(1.5, .025, .62, ((i * 37) % 5 - 2) * .025, 0, Zf + 3.0 + i * .82, 'chalk');
      for (const x of [-5.3, -4.5, -3.1, -2.8, 2.8, 3.1, 4.5, 5.3]) { const c = b.cyl(.48, .78, x, 0, Zf + .4, green, 8, .32); c.castShadow = true; }
      // The mailbox, out front of the fence on the left: a post, a bracket, a round-topped box and its little red flag, up.
      const mx = -3.05, mz = 3.3;
      b.box(.12, 1.12, .12, mx, 0, mz, 'woodd');
      b.box(.34, .05, .46, mx, 1.12, mz, 'woodl');
      b.box(.34, .2, .62, mx, 1.17, mz, '#39424a');
      const arch = b.cyl(.17, .62, mx, 1.06, mz, '#39424a', 16); arch.rotation.x = Math.PI / 2; arch.position.set(mx, 1.37, mz);
      b.box(.3, .3, .03, mx, 1.17, mz + .315, '#4b555e');
      b.box(.09, .025, .03, mx, 1.3, mz + .335, 'steel');
      b.box(.025, .3, .03, mx + .185, 1.28, mz + .08, '#c22a1e');
      b.box(.025, .1, .15, mx + .185, 1.5, mz + .14, '#c22a1e');
      b.cyl(.22, 4.0, -8.6, 0, -2.2, 'woodd', 8, .15);
      for (const [x, y, r, h] of [[-8.6, 3.5, 1.9, 2.4], [-7.3, 3.0, 1.2, 1.6], [-9.9, 3.0, 1.3, 1.7], [-8.5, 5.2, 1.2, 1.5]]) b.cyl(r, h, x, y, -2.2, green2, 9, r * .45);
      for (let i = 0; i < 18; i++) for (const s of [-1, 1]) {
        const x = s * (1.25 + i * .42);
        if (Math.abs(x) > 10) continue;
        b.box(.1, .78, .035, x, 0, 2.4, 'white');
      }
      for (const s of [-1, 1]) for (const y of [.25, .58]) b.box(7.6, .05, .03, s * 5.05, y, 2.38, 'white');
    },
  });

  D.bedroom = Object.assign({}, D.bedroom, {
    cam: { p: [.75, 2.3, 4.5], t: [-.3, .6, -.9], fov: 45, roll: 0 },
    build(b) {
      b.W = 5; b.D = 4.6; b.H = 2.6;
      b.shell('nicotine', 'carpet'); open(b, 'carpet');
      b.wall('n', [{ at: 1, w: 1.1, y0: .9, y1: 2.1 }]);
      b.wall('e');
      doorWall(b, 'w', -.6, null, 'nicotine', 'carpet');
      b.box(1.7, .32, 2.1, -.6, 0, -1.1, 'woodd');
      b.box(1.62, .2, 2.02, -.6, .32, -1.1, 'white');
      b.box(1.66, .07, 1.35, -.6, .52, -.72, 'blanket');
      b.box(1.7, 1.05, .08, -.6, 0, -2.2, 'woodd');
      b.box(.68, .1, .42, -1.0, .52, -1.86, 'paper'); b.box(.68, .1, .42, -.2, .52, -1.86, 'paper');
      b.box(.5, .55, .45, -1.75, 0, -1.95, 'woodl');
      b.box(.5, .55, .45, .55, 0, -1.95, 'woodl');
      b.cyl(.05, .24, -1.75, .55, -1.95, 'chalk', 8);
      const s = b.cyl(.17, .2, -1.75, .78, -1.95, 'shade', 8, .1); s.castShadow = false;
      b.cyl(.04, .06, -1.75, .78, -1.95, 'bulb', 8);
      b.box(.5, .9, 1.4, -2.22, 0, .95, 'woodd');
      b.box(.04, .8, 1.0, -2.45, 1.05, .95, 'steel');
      b.vent('e', -.6, 2.1);
      b.radiator(1.0, -2.2, 'x', 7);
      // The sea, over the bed, where the sea goes.
      b.frame('n', -.6, 1.25, .9, .58, 'pic:sea');
    },
  });

  D.garage = Object.assign({}, D.garage, {
    cam: { p: [-.2, 1.72, 4.5], t: [.05, .95, -.6], fov: 46, roll: 0 },
    build(b) {
      b.W = 6; b.D = 7.5; b.H = 2.8;
      b.shell('plaster', 'concrete', 'dark'); open(b, 'concrete', 'dark');
      b.wall('n', [{ at: 0, w: 4.2, y0: 0, y1: 2.4, kind: 'hole' }], 'concrete');
      b.box(8, 2.8, .05, 0, 0, -5.6, 'outside');
      b.wall('w', [], 'plaster');
      doorWall(b, 'e', -.6, 'plaster', 'mustard', 'lino');
      b.box(1.76, .5, 4.2, 0, .3, -.4, 'car');
      b.box(1.7, .05, 1.0, 0, .8, -1.95, 'car');
      b.box(1.7, .05, .75, 0, .8, 1.3, 'car');
      for (const [x, z] of [[-.84, -.74], [.84, -.74], [-.84, .94], [.84, .94]]) b.box(.06, .68, .06, x, .8, z, 'car');
      // A higher roof, and proper seat backs: people sit in this car, not through it.
      b.box(1.7, .05, 1.76, 0, 1.46, .1, 'car');
      // They face the windshield, toward the room. The seats are behind them, and there's a dash in front.
      b.box(1.5, .16, .08, 0, .86, .9, 'dark');
      for (const x of [-.42, .42]) b.box(.62, .46, .1, x, .8, .01, 'dark');
      for (const [x, z] of [[-.88, -1.7], [.88, -1.7], [-.88, .9], [.88, .9]]) { const c = b.cyl(.3, .22, x, .19, z, 'tyre', 10); c.rotation.z = Math.PI / 2; c.position.y = .3; }
      b.box(.3, .07, .04, .55, .35, 1.72, 'steel');
      b.box(.3, .07, .04, -.55, .35, 1.72, 'steel');
      b.box(2.4, .08, .6, -2.65, .85, 1.5, 'woodl', { ry: Math.PI / 2 });
      b.box(.5, .85, .06, -2.65, 0, .4, 'woodd'); b.box(.5, .85, .06, -2.65, 0, 2.6, 'woodd');
      b.box(.34, .22, .28, -2.65, .93, 2.2, 'card');
      b.box(.3, .03, 2.8, -2.82, 1.7, -.8, 'woodl');
      for (let i = 0; i < 7; i++) b.cyl(.09, .2 + i % 3 * .05, -2.82, 1.73, -1.9 + i * .36, ['book3', 'iron', 'book2'][i % 3], 7);
      b.box(.018, .7, .018, 1.8, 2.1, 1.2, 'iron');
      b.cyl(.1, .1, 1.8, 2.05, 1.2, 'bulb', 8);
    },
    boxSpots: [[2.5, 2.4], [1.9, 2.8], [2.5, 2.4, 1], [2.5, 1.7]],
  });

  // ---- The doors themselves ----
  // Baked rooms have a hole where the door is. The door is a live thing drawn in front of it, one for each side.
  const leaves = [];
  const sizes = { kitchen: [6, 5], living: [6, 5], hallway: [3.4, 8], wren: [4, 4], bedroom: [5, 4.6], garage: [6, 7.5] };
  function makeLeaf(scene, id, e) {
    const [W, Dp] = sizes[e.room];
    const color = e.color || '#ded9c8', slab = new THREE.MeshLambertMaterial({ color }), inset = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(.9) });
    const g = new THREE.Group(), w = DOOR_W - .01, h = DOOR_H - .01;
    const main = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), slab); main.position.set(w / 2, h / 2, 0); g.add(main);
    for (const y of [.62, 1.5]) { const p = new THREE.Mesh(new THREE.BoxGeometry(w * .68, h * .34, .07), inset); p.position.set(w / 2, y, 0); g.add(p); }
    const k = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshLambertMaterial({ color: '#8b8d88' })); k.position.set(w - .08, 1, .06); g.add(k);
    const k2 = k.clone(); k2.position.z = -.06; g.add(k2);
    // Hinged on one jamb. It swings into whichever room this side belongs to.
    let hx, hz, ux, uz, nx, nz;
    if (e.side === 'n') { hx = e.at - DOOR_W / 2; hz = -Dp / 2 - .1; ux = 1; uz = 0; nx = 0; nz = 1; }
    else if (e.side === 'w') { hx = -W / 2 - .1; hz = e.at - DOOR_W / 2; ux = 0; uz = 1; nx = 1; nz = 0; }
    else { hx = W / 2 + .1; hz = e.at - DOOR_W / 2; ux = 0; uz = 1; nx = -1; nz = 0; }
    g.position.set(hx, 0, hz);
    const base = Math.atan2(-uz, ux), dir = (uz * nx - ux * nz) > 0 ? 1 : -1;
    g.visible = false; scene.add(g);
    leaves.push({ id, room: e.room, g, base, dir });
  }
  const state = {};
  let kitchenPlane = null, truck = null;
  function build(scene) {
    for (const id in DOORS) {
      state[id] = { a: 0, hold: 0, forced: false };
      [DOORS[id].a, DOORS[id].b].forEach(e => { if (sizes[e.room]) makeLeaf(scene, id, e); });
    }
    // What the front door opens onto, when you have decided it opens onto the kitchen.
    kitchenPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
    kitchenPlane.position.set(0, 1.1, -4.42); kitchenPlane.visible = false; scene.add(kitchenPlane);
    // The truck, out at the curb.
    truck = new THREE.Group();
    const white = new THREE.MeshLambertMaterial({ color: '#d9d6ca' }), dark = new THREE.MeshLambertMaterial({ color: '#2b2b2b' }), cab = new THREE.MeshLambertMaterial({ color: '#8c3d2c' });
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 2.2), white); body.position.set(-.6, 1.7, 0); truck.add(body);
    const front = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 2.1), cab); front.position.set(2.8, 1.3, 0); truck.add(front);
    for (const x of [-2.4, 2.6]) { const t = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, 2.3), dark); t.position.set(x, .4, 0); truck.add(t); }
    truck.position.set(1.5, 0, -15); truck.visible = false; scene.add(truck);
  }
  let onOpen = null;
  function update(dt, room, opts) {
    for (const id in state) {
      const d = state[id], want = d.forced || d.hold > 0 ? 1 : 0;
      if (want && d.a < .02 && onOpen) onOpen(id);
      d.hold = Math.max(0, d.hold - dt);
      d.a += Math.sign(want - d.a) * Math.min(Math.abs(want - d.a), dt * 1.9);
    }
    leaves.forEach(l => {
      l.g.visible = l.room === room;
      if (l.g.visible) { const k = state[l.id].a; l.g.rotation.y = l.base + l.dir * (k * k * (3 - 2 * k)) * 1.75; }
    });
    kitchenPlane.visible = room === 'hallway' && !!opts.loop;
    if (kitchenPlane.visible && opts.tex && kitchenPlane.material.map !== opts.tex) { kitchenPlane.material.map = opts.tex; kitchenPlane.material.needsUpdate = true; }
    truck.visible = room === 'hallway' && !!opts.truck;
  }
  // ---- Which pieces of each room make up each thing you can be ----
  // [minX, maxX, minY, maxY, minZ, maxZ]: the room's own meshes inside this box get the glow. "door" uses the door itself; "boxes" are extra shapes.
  const SHAPES = {
    kitchen: {
      'the fridge': { r: [2.05, 2.95, -.05, 1.9, -2.5, -1.7] },
      'the stove': { r: [1.1, 1.98, -.05, .98, -2.52, -1.84] },
      'the kettle': { r: [1.3, 1.6, .94, 1.15, -2.32, -2.08] },
      'the dishwasher': { r: [-.4, .36, .05, .86, -1.93, -1.85] },
      'the sink': { r: [-.95, -.05, .88, 1.2, -2.5, -2.0] },
      'the radiator': { r: [-3.0, -2.72, 0, .75, -.9, .1] },
      'the telephone': { r: [-3.0, -2.9, 1.15, 1.65, -.74, -.46] },
      'the lamp': { r: [-.5, .5, 1.9, 2.72, -.2, .8] },
      'the garage door': { door: 'gk' }, 'the hall door': { door: 'kh' },
    },
    hallway: {
      'the front door': { door: 'front' },
      'the stair railing': { r: [-.75, -.6, 0, 4, -3.3, .4] },
      'the coats': { r: [1.4, 1.72, .75, 1.76, -1.5, -.1] },
      'the hall lamp': { r: [-.3, .7, 2.0, 2.62, .4, 1.4] },
      'the kitchen door': { door: 'kh' }, 'the living room door': { door: 'hl' },
    },
    living: {
      'the bookshelf': { r: [-3.0, -2.4, -.05, 2.35, -.1, 2.1] },
      'the sofa': { r: [-1.4, .9, -.05, 1.02, -1.82, -.82] },
      'the radiator': { r: [.2, 1.3, 0, .75, -2.45, -2.2] },
      'the floor lamp': { r: [-2.6, -2.0, 0, 1.8, -2.45, -1.85] },
      'the door': { door: 'hl' },
    },
    wren: {
      'the vent': { r: [-2.01, -1.9, .4, .95, .8, 1.7] },
      'the wall': { r: [-1.3, -.1, 1.3, 1.8, -2.02, -1.95], boxes: [[1.75, 2.3, .02, -.8, 1.15, -1.985]] },
      'the little hatch': { r: [-2.01, -1.85, .65, 1.45, -.1, .7] },
      'the desk': { r: [.35, 1.45, 0, .72, -2.0, -1.35] },
      'the bedside lamp': { r: [-.85, -.4, 0, 1.0, -1.95, -1.5] },
      'the door': { door: 'wd' },
    },
    garage: {
      'the garage door': { boxes: [[4.2, 2.4, .05, 0, 1.2, -3.82]] },
      'the car radio': { boxes: [[.34, .13, .1, 0, 1.0, -.26]] },
      'the workbench': { r: [-3.0, -2.3, 0, 1.2, .3, 2.7] },
      'the side door': { door: 'gk' },
    },
    bedroom: {
      'the radiator': { r: [.55, 1.45, 0, .75, -2.35, -2.1] },
      'the headboard': { r: [-1.5, .3, -.05, 1.1, -2.3, -2.14] },
      'the dresser': { r: [-2.5, -1.95, -.05, 1.9, .2, 1.7] },
      'the bedside lamp': { r: [-2.05, -1.45, -.05, 1.05, -2.2, -1.7] },
      'the door': { door: 'bd' },
    },
  };
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthTest: false, depthWrite: false, toneMapped: false });
  const _box = new THREE.Box3(), _size = new THREE.Vector3();
  // The glow shape for an object, and the box around it for working out when the mouse is over it.
  function outlineFor(o) {
    if (o.glow) return o.glow;
    const spec = (SHAPES[o.room] || {})[o.name] || {}, g = new THREE.Group(), set = Sets.get(o.room).group, whole = new THREE.Box3();
    const addBox = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), white); m.position.set(x, y, z); m.updateMatrix(); g.add(m); whole.union(new THREE.Box3().setFromObject(m)); };
    if (spec.r) {
      const [x0, x1, y0, y1, z0, z1] = spec.r, sx = x1 - x0, sy = y1 - y0, sz = z1 - z0;
      set.updateMatrixWorld(true);
      set.traverse(m => {
        if (!m.isMesh) return;
        _box.setFromObject(m); _box.getSize(_size);
        const c = _box.getCenter(new THREE.Vector3());
        if (c.x < x0 || c.x > x1 || c.y < y0 || c.y > y1 || c.z < z0 || c.z > z1) return;
        if (_size.x > sx + .12 || _size.y > sy + .12 || _size.z > sz + .12) return;
        const clone = new THREE.Mesh(m.geometry, white);
        clone.matrixAutoUpdate = false; clone.matrix.copy(m.matrixWorld);
        g.add(clone); whole.union(_box);
      });
    }
    (spec.boxes || []).forEach(b => addBox(...b));
    if (spec.door) {
      const d = DOORS[spec.door], e = d.a.room === o.room ? d.a : d.b, [W, Dp] = sizes[o.room], w = DOOR_W + .1, h = DOOR_H + .05;
      if (e.side === 'n') addBox(w, h, .05, e.at, h / 2, -Dp / 2 - .08);
      else addBox(.05, h, w, (e.side === 'w' ? -1 : 1) * (W / 2 + .08), h / 2, e.at);
    }
    o.glow = g; o.glowBox = whole.isEmpty() ? null : whole;
    return g;
  }
  return { outlineFor, DOORS, STAIRS, path, end, stairY, build, update, state, want: (id, s) => { state[id].hold = Math.max(state[id].hold, s); }, force: (id, v) => { state[id].forced = v; }, onOpen: f => { onOpen = f; } };
})();
