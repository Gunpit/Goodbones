// The prologue. Three days out. A conversation in the dark, then the boxes, then Wren talking to a vent,
// and the first thing the house ever says, one letter at a time.
const INTRO_LINES = [
  'We could be out by Friday.',
  'That soon?',
  'The sooner the better.',
  'What do we tell Wren?',
  "That it's a good school.",
  "I've been telling people it's the mortgage.",
  "Then it's both.",
  'Wren still keeps asking to stay.',
];
// The last line lets go of everything except this word, which hangs on a moment longer.
const INTRO_LINGER = 'stay';
// The cutscene: everyone just gets on with moving boxes, on their own schedule, and the conversation happens over the top of it.
// Boxes go one way along one side of the room and people come back along the other, half a trip apart, so nobody meets anybody.
const stageWalk = (...pts) => pts.map(([x, z]) => ({ t: 'walk', x, z }));
const faceTo = yaw => doIt(q => { q.faceYaw = yaw; });
function startBehindDoor(p, end) { p.home = null; p.gone = true; p.x = end.beyond[0]; p.z = end.beyond[1]; p.yaw = Math.atan2(end.stand[0] - p.x, end.stand[1] - p.z); }
function comeThrough(id, end) { return [doIt(q => { q.gone = false; }), openDoor(id), { t: 'walk', x: end.stand[0], z: end.stand[1] }]; }
function goThrough(id, end) { return [{ t: 'walk', x: end.stand[0], z: end.stand[1] }, openDoor(id), { t: 'walk', x: end.beyond[0], z: end.beyond[1] }, shutDoor(id), doIt(q => { q.gone = true; })]; }
const addBoxToPile = n => { S.boxesNow = Math.max(0, Math.min(8, S.boxesNow + (n || 1))); setBoxes(); };
const setBox = p => { p.hasBox = false; addBoxToPile(); };
// Hall: in from the kitchen with a box, across to the living room, back the other way with empty hands, for another.
function hallRound(p) {
  const kh = HOUSE.DOORS.kh.b, hl = HOUSE.DOORS.hl.a;
  p.hasBox = true;
  p.q = comeThrough('kh', kh).concat(stageWalk([.15, .35], [.72, -1.55]), goThrough('hl', hl), wait(1),
    doIt(q => { q.hasBox = false; }), comeThrough('hl', hl), stageWalk([.2, -2.05], [-.4, -.75], [-.42, .55]), goThrough('kh', kh), wait(1), doIt(q => { hallRound(q); q.cur = null; }));
}
const hallStart = () => {
  const kh = HOUSE.DOORS.kh.b, hl = HOUSE.DOORS.hl.a;
  // Dell's on his way down the stairs when the picture comes up, with the first box of the round.
  D.hasBox = true; D.home = null;
  D.q = stageWalk([-1.2, .1], [-.42, .42], [.15, .2], [.72, -1.55]).concat(goThrough('hl', hl), wait(4), doIt(q => { q.hasBox = false; }), comeThrough('hl', hl), stageWalk([.2, -2.05], [-.4, -.75], [-.42, .55]), goThrough('kh', kh), wait(1), doIt(q => { hallRound(q); q.cur = null; }));
  // Marion comes in and works at the pile for a while first, which puts her half a round behind him. They never reach a door together.
  startBehindDoor(M, kh); M.hasBox = true;
  M.q = [wait(1)].concat(comeThrough('kh', kh), stageWalk([.62, .85]), faceTo(Math.PI / 2), doIt(q => { q.reachWant = .7; }), wait(11.8), doIt(q => { q.reachWant = 0; }), stageWalk([.72, -1.55]), goThrough('hl', hl), wait(9.5), doIt(q => { q.hasBox = false; }), comeThrough('hl', hl), stageWalk([.2, -2.05], [-.4, -.75], [-.42, .55]), goThrough('kh', kh), wait(1), doIt(q => { hallRound(q); q.cur = null; }));
  // Wren comes in behind them and stands about for a bit with her box, then takes it through.
  startBehindDoor(W, kh); W.hasBox = true;
  W.q = [wait(9)].concat(comeThrough('kh', kh), stageWalk([-.25, 1.45]), faceTo(1.2), wait(12.5), stageWalk([.15, .35], [.72, -1.55]), goThrough('hl', hl));
};
// Living room: along the window side to the pile, back along the near side to the door.
function livingRound(p, pile) {
  const a = HOUSE.DOORS.hl.b;
  p.hasBox = true;
  p.q = comeThrough('hl', a).concat(stageWalk([-1.6, -.55], [-.2, -.62], [1.05, -.55], pile), doIt(setBox), wait(.7), stageWalk([.45, 1.32], [-.95, 1.32], [-1.9, .72]), goThrough('hl', a), wait(1), doIt(q => { livingRound(q, pile); q.cur = null; }));
}
const livingStart = () => {
  const a = HOUSE.DOORS.hl.b;
  // Same moment, other side of the door: Dell's just put one down, Marion's nearly there with hers, Wren's right behind them.
  D.home = null; M.home = null; D.hasBox = false; M.hasBox = true;
  D.q = [wait(.7)].concat(stageWalk([.45, 1.32], [-.95, 1.32], [-1.9, .72]), goThrough('hl', a), wait(1), doIt(q => { livingRound(q, [1.55, .92]); q.cur = null; }));
  M.q = stageWalk([1.05, -.55], [1.3, .72]).concat(doIt(setBox), doIt(q => { q.reachWant = .7; }), wait(7.5), doIt(q => { q.reachWant = 0; }), stageWalk([.45, 1.32], [-.95, 1.32], [-1.9, .72]), goThrough('hl', a), wait(1), doIt(q => { livingRound(q, [1.3, .72]); q.cur = null; }));
  W.hasBox = true; startBehindDoor(W, a);
  W.q = [wait(.5)].concat(comeThrough('hl', a), stageWalk([-1.6, -.55], [-.75, -.5], [-.95, .62]), doIt(q => { q.hasBox = false; }), wait(.4), stageWalk([-.42, .72]), faceTo(1.2));
};
const PROLOGUE_SCENES = [
  {
    id: 'pro_hall', day: '', part: '', state: 'day', room: 'hallway', locked: true, prologue: true, boxes: 3, holdUntil: () => W.gone,
    place: {
      d: { room: 'hallway', x: -1.2, z: -2.0, yaw: 0 },
      m: { room: 'hallway', x: -1.05, z: 1.0, yaw: Math.PI / 2 },
      w: { room: 'hallway', x: -1.05, z: 1.0, yaw: Math.PI / 2 },
    },
    tracks: [{ room: 'hallway', start: 2.2, lines: [
      ['m', 'Three days, Dell.'],
      ['d', 'I know how many days.'],
      ['m', 'That does not go in the living room.'],
      ['d', 'You said everything goes in the living room.'],
      ['m', 'Everything that is going.'],
      ['w', 'Is this going?'],
      ['m', 'Yes, honey.'],
      ['w', 'It is really heavy for a box of nothing.'],
    ] }],
    onStart: hallStart,
    hot: {},
  },
  {
    id: 'pro_living', day: '', part: '', state: 'day', room: 'living', locked: true, prologue: true, boxes: 5, holdUntil: () => W.room !== 'living',
    place: {
      d: { room: 'living', x: 1.55, z: .92, yaw: .4 },
      m: { room: 'living', x: .3, z: -.62, yaw: Math.PI / 2 },
      w: { room: 'living', x: -2.35, z: -1.0, yaw: Math.PI / 2 },
    },
    tracks: [{ room: 'living', start: 2, lines: [
      ['w', 'How many days is three days?'],
      ['d', 'Three, Wrennie.'],
      ['w', 'Could it be four?'],
      ['m', 'The truck comes Friday.'],
      ['w', 'What if I am not done?'],
      ['d', 'Done with what?'],
      ['w', 'Being here.'],
      ['m', 'Go play, honey. We have three days of this.'],
      ['w', 'Okay.', { after: () => { moveTo(W, 'wren', .2, .4, Math.PI); } }],
    ] }],
    onStart: livingStart,
    hot: {},
  },
  {
    id: 'pro_vent', day: '', part: '', state: 'eve', room: 'wren', locked: true, prologue: true, vent: true, live: true, boxes: 2,
    place: { w: { room: 'wren', x: -.72, z: 1.25, yaw: -Math.PI / 2, seat: 1, y: 0 } },
    tracks: [{ room: 'wren', start: 4.5, lines: [
      ['w', 'I like it here, though.', { after: () => { S.pv.hum = false; } }],
      ['w', "I don't know why we can't stay."],
      ['w', 'Dad even says you have good bones.'],
      ['w', 'That means we should stay!'],
    ] }],
    // The shot has to be framed before the fade starts, or the room's usual view shows for a moment first.
    onStart: () => { W.floorSit = 1; S.pv = { t: 0, phase: 'wren', hum: true, humT: .3, humI: 0, panT: 0, shake: 0 }; setPvCam(PV_CAM.a, PV_CAM.b, 0); },
    hot: {},
  },
];
// Where the camera goes: a slow push on Wren from the side, with the wall on the left. Then a slow turn to the vent.
const PV_CAM = {
  a: { p: [-1.3, .78, 3.75], t: [-1.42, .55, 1.2], fov: 37 },
  b: { p: [-1.32, .74, 3.05], t: [-1.42, .53, 1.2], fov: 35 },
  c: { p: [-.86, .74, 2.62], t: [-2.0, .5, 1.25], fov: 35 },
};
const PV_HUM = [[330, .42], [392, .42], [440, .84], [392, .42], [349, .42], [330, .84], [294, .42], [330, 1.26]];
// Low and rough, but with enough of a voice in it that the vowels read as vowels.
const PV_VENT = { pitch: 84, comb: .011, ring: .42, shakeRate: 6, shake: 4, wander: 0, hp: 120, echo: .16, echoT: .13, echoFb: .25 };
const STRAIN_WORD = 'GOOD BONES';
const _pvA = new THREE.Vector3(), _pvB = new THREE.Vector3();
function setPvCam(from, to, k) {
  const e = k * k * (3 - 2 * k), s = S.pv.shake;
  _pvA.set(...from.p).lerp(new THREE.Vector3(...to.p), e);
  _pvB.set(...from.t).lerp(new THREE.Vector3(...to.t), e);
  if (s > 0) { _pvB.x += (Math.random() - .5) * .012 * s; _pvB.y += (Math.random() - .5) * .012 * s; }
  Render.liveCam(_pvA, _pvB, from.fov + (to.fov - from.fov) * e);
}
function buildStrain() {
  const el = $('strain');
  el.innerHTML = '';
  S.strain = { i: -1, spans: [], wait: 0, idle: 0, held: 0, done: false, heldLetter: null };
  [...STRAIN_WORD].forEach((c, i) => {
    const sp = document.createElement('span');
    sp.textContent = c === ' ' ? ' ' : c;
    sp.className = c === ' ' ? 'gap' : 'l';
    sp.style.setProperty('--r', `${(i * 37 % 13 - 6) * .8}deg`);
    sp.style.setProperty('--y', `${(i * 53 % 9 - 4) * 2}px`);
    sp.style.setProperty('--s', `${1 + (i * 29 % 7) * .03}`);
    el.appendChild(sp); S.strain.spans.push(sp);
  });
  el.classList.add('on');
  nextStrainLetter();
}
// Each key doesn't play its letter any more. It plays the next sound of the actual words: g-oo-d, b-oh-n-z.
// The first O and the second are one long vowel, and the E is silent, so it just carries the N on. Bends are the tune of someone saying it.
// The S is a soft, short Z with an eighth of the usual hiss: the end of the word, not a burst of steam. It stops on its own after a moment.
const STRAIN_SOUNDS = [['g', 'uh', 1.12], ['uh', null, 1.04], ['uh', null, .96], ['d', null, .9], null, ['b', 'ow', 1.08], ['ow', null, 1], ['n', null, .86], ['n', null, .8], ['z', null, .76, .12]];
function nextStrainLetter() {
  const st = S.strain;
  if (st.i >= 0 && st.spans[st.i]) st.spans[st.i].classList.remove('now');
  st.i++;
  while (st.i < STRAIN_WORD.length && STRAIN_WORD[st.i] === ' ') { st.spans[st.i].classList.add('seen'); st.i++; }
  if (st.i >= STRAIN_WORD.length) { st.done = true; st.finale = .9; return; }
  st.spans[st.i].classList.add('seen', 'now');
  st.idle = 0;
}
function strainKey(c, e) {
  const st = S.strain;
  if (!st || st.done) return;
  const want = STRAIN_WORD[st.i].toLowerCase();
  const sp = st.spans[st.i];
  tip('');
  if (c !== want) {
    // Only that letter will come. Anything else is just the duct.
    Audio2.fx.flop();
    sp.classList.remove('nope'); void sp.offsetWidth; sp.classList.add('nope');
    return;
  }
  const snd = STRAIN_SOUNDS[st.i];
  st.heldLetter = c; st.held = 0; st.bend = snd[2]; st.relT = 0;
  sp.classList.add('said');
  S.pv.shake = 1;
  if (S.voice) { S.voice.bend(snd[2]); S.voice.phone(snd[0], snd[1], snd[3]); }
  if (snd[0] === 'z') setTimeout(() => { if (S.voice) S.voice.release(); }, 300);
  // The next letter's ready the moment you've hit this one, so a confident typist can just say it.
  nextStrainLetter();
}
function strainUp(c) {
  const st = S.strain;
  if (!st || st.heldLetter !== c) return;
  st.heldLetter = null;
  // Don't cut the sound the instant the key comes up. Letters typed in a run should join into one word.
  st.relT = st.done || STRAIN_WORD[st.i] === undefined ? .2 : .26;
}
function tickVent(dt) {
  const pv = S.pv, st = S.strain;
  pv.t += dt;
  pv.shake = Math.max(0, pv.shake - dt * 1.4);
  const track = S.tracks[0];
  if (pv.hum) {
    pv.humT -= dt;
    if (pv.humT <= 0) { const n = PV_HUM[pv.humI++ % PV_HUM.length]; pv.humT = n[1]; Audio2.fx.hum(n[0], n[1] * 1.05); }
  }
  // Bobbing. She has a tune, and she is not going to stop for this.
  const bob = pv.hum ? 1 : .45;
  W.sway = Math.sin(pv.t * 3.0) * .055 * bob;
  W.headRoll = Math.sin(pv.t * 3.0 + .5) * .13 * bob;
  W.lean = .05 + Math.sin(pv.t * 6.0) * .03 * bob;
  if (pv.phase === 'wren') {
    setPvCam(PV_CAM.a, PV_CAM.b, Math.min(1, pv.t / 22));
    if (track.done && !S.sub && !S.subs.length) { pv.phase = 'hold'; pv.panT = 0; }
  } else if (pv.phase === 'hold') {
    pv.panT += dt;
    setPvCam(PV_CAM.a, PV_CAM.b, Math.min(1, pv.t / 22));
    if (pv.panT > .4) { pv.phase = 'pan'; pv.panT = 0; pv.b0 = { p: _pvA.toArray(), t: _pvB.toArray(), fov: Render.camera().fov }; pv.hum = false; }
  } else if (pv.phase === 'pan') {
    pv.panT += dt;
    setPvCam(pv.b0, PV_CAM.c, Math.min(1, pv.panT / 4.2));
    // The first words have to be recognizable, so this voice is clearer than the rest of Wednesday's. The fade back is the next scene.
    if (pv.panT >= 4.2) { pv.phase = 'word'; if (S.voice) { S.voice.stage(.8); S.voice.character(PV_VENT); } buildStrain(); }
  } else {
    setPvCam(PV_CAM.c, PV_CAM.c, 1);
    placeStrain();
    if (st.heldLetter) {
      // Lean on a sound and it strains upward and shakes, but it stays on the word's tune.
      st.held += dt;
      pv.shake = Math.min(1.6, 1 + st.held * .5);
      if (S.voice) S.voice.bend(st.bend * (1 + Math.min(.22, st.held * .12)) + Math.sin(pv.t * 26) * .012);
    } else if (st.relT > 0) {
      st.relT -= dt;
      if (st.relT <= 0 && S.voice) S.voice.release();
    }
    if (st.done) {
      if (st.heldLetter) return;
      // A breath after the last sound, and into the dark.
      st.finale -= dt;
      if (st.finale <= 0) { finishPrologue(); return; }
    } else if (!st.heldLetter) {
      st.idle += dt;
      if (st.idle > 7 && !st.toldOnce) { st.toldOnce = true; tip('Type the letter.'); }
    }
  }
}
function placeStrain() {
  const p = Render.project([-1.98, .38, 1.25]);
  const el = $('strain');
  el.style.left = clamp(p.x, 440, 840) + 'px';
  el.style.top = clamp(p.y, 200, 590) + 'px';
}
// Like the goodbye at the end: the room goes dark, the words stay up a while on their own, then they go and the card comes.
function finishPrologue() {
  const st = S.strain, fast = params.has('fast');
  st.finale = 1e9;
  st.spans.forEach(sp => sp.classList.remove('now'));
  tip('');
  const gl = $('gl');
  gl.style.transition = 'opacity 2.6s'; gl.style.opacity = '0';
  $('sub').innerHTML = ''; S.subs = []; S.sub = null;
  setTimeout(() => {
    $('strain').style.transition = 'opacity 1.6s';
    $('strain').classList.remove('on');
    setTimeout(() => {
      S.strain = null;
      W.floorSit = 0; W.lean = 0;
      $('strain').style.transition = '';
      startScene(S.sceneI + 1);
      // Bring the picture back behind the card once the card is black.
      setTimeout(() => { gl.style.transition = ''; gl.style.opacity = '1'; }, fast ? 20 : 1400);
    }, fast ? 20 : 1900);
  }, fast ? 20 : 6500);
}
function playIntro(done) {
  const el = $('intro'), fast = params.has('fast');
  el.classList.add('on');
  const lines = $('introlines');
  lines.innerHTML = '';
  let i = 0, timer = null, letGo = false;
  const finish = () => { el.onclick = null; showCard('', ''); setTimeout(() => { el.classList.remove('on'); done(); }, fast ? 10 : 1400); };
  const next = () => {
    clearTimeout(timer);
    if (i >= INTRO_LINES.length) {
      if (!letGo && !fast) {
        letGo = true;
        lines.lastElementChild.classList.add('letgo');
        timer = setTimeout(next, 2300);
        return;
      }
      lines.classList.add('out');
      timer = setTimeout(finish, fast ? 10 : 1200);
      return;
    }
    // Marion on the left, Dell on the right, each in their own color. A new line comes up and the last one lets go.
    const prev = lines.lastElementChild;
    const p = document.createElement('p'); p.className = i % 2 ? 'b' : 'a';
    if (i === INTRO_LINES.length - 1) INTRO_LINES[i].split(new RegExp(`(${INTRO_LINGER})`)).forEach(part => {
      const s = document.createElement('span'); s.textContent = part; if (part !== INTRO_LINGER) s.className = 'rest'; p.appendChild(s);
    });
    else p.textContent = INTRO_LINES[i];
    p.style.color = MAP.COL[i % 2 ? 'd' : 'm'];
    lines.appendChild(p); void p.offsetWidth; p.classList.add('on');
    if (prev) prev.classList.remove('on');
    i++;
    timer = setTimeout(next, fast ? 10 : 2600);
  };
  timer = setTimeout(next, fast ? 10 : 1400);
  el.onclick = next;
}
// The photograph on the title screen, taken with the same people.
async function makeTitlePhoto() {
  // The fork gets its own small render. If that ever fails, the wall is just a wall.
  try { ForkPortrait.paint($('titlefork')); } catch (e) { console.error(e); $('titlefork').style.display = 'none'; }
  try { ForkPortrait.paintTable($('titletable')); } catch (e) { console.error(e); $('titletable').style.display = 'none'; }
  const c = $('titlephoto'), g = c.getContext('2d');
  const wall = () => {
    g.fillStyle = '#e6d9b6'; g.fillRect(0, 0, 1280, 720);
    g.strokeStyle = 'rgba(150,120,70,.16)'; g.lineWidth = 2;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 15; x++) {
      const cx = x * 96 + (y % 2 ? 48 : 0), cy = y * 92;
      g.beginPath(); g.moveTo(cx, cy - 34); g.bezierCurveTo(cx + 20, cy - 16, cx + 20, cy + 16, cx, cy + 34); g.bezierCurveTo(cx - 20, cy + 16, cx - 20, cy - 16, cx, cy - 34); g.stroke();
    }
  };
  // The wallpaper goes on the wall behind the picture, as a tile, so there's plenty of it when you're standing back.
  wall();
  const tile = document.createElement('canvas'); tile.width = 192; tile.height = 184;
  tile.getContext('2d').drawImage(c, 0, 92, 192, 184, 0, 0, 192, 184);
  $('titlewall').style.backgroundImage = `url(${tile.toDataURL()})`;
  g.clearRect(0, 0, 1280, 720);
  await Render.bake('photo', undefined, 'day');
  Render.showRoom('photo', undefined, 'day', { dim: 1, tint: [1, 1, 1] });
  // Father, mother, child, in front of the house. They were told to smile, and they are still doing it.
  // Just right of the path and closer to the camera, with the door standing clear to their left.
  [[M, 1.1, 4.35, -.16], [D, 2.06, 4.3, -.26], [W, 1.57, 4.72, -.2]].forEach(([p, x, z, yaw]) => {
    p.x = x; p.z = z; p.yaw = yaw; p.room = 'photo'; p.root.visible = true; p.root.position.y = 0; p.seated = 0; p.moving = 0; p.reachA = 0; p.sway = 0; p.headRoll = 0; p.squeeze = 0; p.patA = 0; p.bracing = 0; p.wave = 0;
    p.lean = 0; p.blob.visible = true;
    People.pose(p, .016, 1.5);
    p.can.visible = false; p.boxM.visible = false; p.quilt.visible = false;
  });
  // A hand on her shoulder, as if that were a normal thing to do with a hand.
  D.L.sh.rotation.x = -.34; D.L.sh.rotation.z = -.5; D.L.el.rotation.x = -.5;
  M.R.sh.rotation.x = -.2; M.R.sh.rotation.z = .4; M.R.el.rotation.x = -.5;
  Render.frame(.02); Render.frame(.02);
  // A big framed picture in a wide wooden frame, the same all the way around, with a brass plate set into the bottom of it.
  const w = 1000, h = 562, x0 = 640 - w / 2, y0 = 79, mat = 12, rail = 58, base = rail;
  // Where the front door landed in the picture. It's the way in, so everything else on this screen points at it.
  const toPhoto = (x, y, z) => { const q = Render.project([x, y, z]); return [x0 + q.x / 1280 * w, y0 + q.y / 720 * h]; };
  const [dx0, dy0] = toPhoto(-.65, 2.72, -2.97), [dx1, dy1] = toPhoto(.65, .36, -2.97);
  g.clearRect(0, 0, 1280, 720);
  g.save();
  g.shadowColor = 'rgba(40,25,10,.55)'; g.shadowBlur = 26; g.shadowOffsetX = 5; g.shadowOffsetY = 12;
  const fx = x0 - mat - rail, fy = y0 - mat - rail, fw = w + 2 * (mat + rail), fh = h + 2 * mat + rail + base;
  const gr = g.createLinearGradient(fx, fy, fx + fw, fy + fh);
  gr.addColorStop(0, '#6e4a2a'); gr.addColorStop(.5, '#51341c'); gr.addColorStop(1, '#6b4727');
  g.fillStyle = gr; g.fillRect(fx, fy, fw, fh);
  g.shadowColor = 'transparent';
  // The wood: a little grain, a mitre at each corner, a raised outer edge and a thin gilt bead around the picture.
  for (let i = 0; i < 26; i++) {
    const t = (i + .5) / 26 * rail, a = .03 + (i * 7 % 5) * .012;
    g.strokeStyle = `rgba(${i % 2 ? '30,15,5' : '230,190,130'},${a})`; g.lineWidth = 1;
    g.strokeRect(fx + t, fy + t, fw - 2 * t, fh - 2 * t);
  }
  g.strokeStyle = 'rgba(25,12,4,.5)'; g.lineWidth = 1.5; g.beginPath();
  for (const [ax, ay, bx, by] of [[fx, fy, x0 - mat, y0 - mat], [fx + fw, fy, x0 + w + mat, y0 - mat], [fx, fy + fh, x0 - mat, y0 + h + mat], [fx + fw, fy + fh, x0 + w + mat, y0 + h + mat]]) { g.moveTo(ax, ay); g.lineTo(bx, by); }
  g.stroke();
  g.strokeStyle = 'rgba(255,225,170,.3)'; g.lineWidth = 2; g.strokeRect(fx + 5, fy + 5, fw - 10, fh - 10);
  g.strokeStyle = 'rgba(20,10,3,.55)'; g.lineWidth = 2; g.strokeRect(fx + 8, fy + 8, fw - 16, fh - 16);
  g.strokeStyle = '#b89a55'; g.lineWidth = 3; g.strokeRect(x0 - mat - 2, y0 - mat - 2, w + 2 * mat + 4, h + 2 * mat + 4);
  g.fillStyle = '#f1e8d2'; g.fillRect(x0 - mat, y0 - mat, w + 2 * mat, h + 2 * mat);
  // Printed like an old Kodachrome: deep color, real blacks, and the corners falling away.
  g.filter = 'saturate(1.38) contrast(1.24) brightness(.94)';
  g.drawImage($('gl'), x0, y0, w, h);
  g.filter = 'none';
  const vig = g.createRadialGradient(640, y0 + h * .55, h * .42, 640, y0 + h * .55, w * .68);
  vig.addColorStop(0, 'rgba(20,10,0,0)'); vig.addColorStop(1, 'rgba(20,10,0,.42)');
  g.fillStyle = vig; g.fillRect(x0, y0, w, h);
  // The plate, as a framer would fit it: clipped corners, a cast bevel, brushed brass, two engraved lines and a slotted screw in each corner.
  const px = 640 - 170, py = 658, pw = 340, ph = 48, cut = 6;
  const plateShape = (a) => {
    g.beginPath();
    g.moveTo(px + cut + a, py + a); g.lineTo(px + pw - cut - a, py + a); g.lineTo(px + pw - a, py + cut + a); g.lineTo(px + pw - a, py + ph - cut - a);
    g.lineTo(px + pw - cut - a, py + ph - a); g.lineTo(px + cut + a, py + ph - a); g.lineTo(px + a, py + ph - cut - a); g.lineTo(px + a, py + cut + a); g.closePath();
  };
  g.shadowColor = 'rgba(10,5,1,.8)'; g.shadowBlur = 8; g.shadowOffsetX = 1; g.shadowOffsetY = 3;
  const edge = g.createLinearGradient(px, py, px, py + ph);
  edge.addColorStop(0, '#f6e4a6'); edge.addColorStop(.5, '#b08a3e'); edge.addColorStop(1, '#6e5220');
  g.fillStyle = edge; plateShape(0); g.fill();
  g.shadowColor = 'transparent'; g.shadowOffsetX = 0; g.shadowOffsetY = 0; g.shadowBlur = 0;
  const br = g.createLinearGradient(px, py, px + pw, py + ph);
  br.addColorStop(0, '#a98740'); br.addColorStop(.28, '#e6cb82'); br.addColorStop(.5, '#bb9849'); br.addColorStop(.72, '#e0c277'); br.addColorStop(1, '#9a7732');
  g.fillStyle = br; plateShape(2.5); g.fill();
  g.save(); plateShape(2.5); g.clip();
  for (let i = 0; i < ph; i++) { g.fillStyle = `rgba(${i * 13 % 2 ? '255,245,210' : '70,45,10'},${.04 + (i * 29 % 7) * .012})`; g.fillRect(px, py + i, pw, 1); }
  g.restore();
  g.strokeStyle = 'rgba(70,45,10,.6)'; g.lineWidth = 1; plateShape(6.5); g.stroke();
  g.strokeStyle = 'rgba(255,244,205,.45)'; plateShape(7.5); g.stroke();
  for (const [sx, sy, turn] of [[px + 15, py + 14, .5], [px + pw - 15, py + 14, 1.9], [px + 15, py + ph - 14, 2.6], [px + pw - 15, py + ph - 14, -.7]]) {
    const sc = g.createRadialGradient(sx - 1, sy - 1, .5, sx, sy, 4);
    sc.addColorStop(0, '#f2dfa2'); sc.addColorStop(1, '#7c5e24');
    g.fillStyle = sc; g.beginPath(); g.arc(sx, sy, 3.6, 0, 7); g.fill();
    g.strokeStyle = 'rgba(40,25,5,.7)'; g.lineWidth = .8; g.stroke();
    g.strokeStyle = 'rgba(30,18,3,.95)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(sx - Math.cos(turn) * 3, sy - Math.sin(turn) * 3); g.lineTo(sx + Math.cos(turn) * 3, sy + Math.sin(turn) * 3); g.stroke();
  }
  g.restore();
  // The glow for the door, on its own layer above the picture, and the part of the picture you can click.
  const gc = $('doorglow'), c2 = gc.getContext('2d');
  c2.clearRect(0, 0, 1280, 720);
  c2.strokeStyle = '#ffd98a'; c2.lineJoin = 'round';
  for (const [blur, width, alpha] of [[34, 7, .55], [18, 5, .8], [6, 3, 1]]) {
    c2.shadowColor = '#ffb845'; c2.shadowBlur = blur; c2.globalAlpha = alpha; c2.lineWidth = width;
    c2.strokeRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
  }
  c2.shadowBlur = 0; c2.globalAlpha = .13; c2.fillStyle = '#ffd98a'; c2.fillRect(dx0, dy0, dx1 - dx0, dy1 - dy0); c2.globalAlpha = 1;
  const hit = $('doorhit');
  hit.style.left = dx0 - 8 + 'px'; hit.style.top = dy0 - 8 + 'px'; hit.style.width = dx1 - dx0 + 16 + 'px'; hit.style.height = dy1 - dy0 + 16 + 'px';
  [M, D, W].forEach(p => { p.room = null; p.root.visible = false; });
}
