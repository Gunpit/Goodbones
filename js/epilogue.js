// The epilogue, for the endings where they leave. Out front, framed the way they were in the photograph on the title screen,
// except this time they're walking away from it. Wren stops on the path to say goodbye. Then a slow push in on the house,
// and the last thing it says, one letter at a time, the way it said the first. The world goes dark and the words stay a while.
const EPI_ENDINGS = ['go', 'go_dead', 'forward', 'forward_dead'];
const EPI_WORD = 'GOOD BYE';
// One sound per key, the tune of someone saying it and letting it fall: g-oo-d, b-eye. The Y and the E just carry the vowel on.
const EPI_SOUNDS = [['g', 'uh', 1.1], ['uh', null, 1.04], ['uh', null, .98], ['d', null, .92], null, ['b', 'ay', 1.0], ['ay', null, .92], ['ay', null, .82]];
// The photograph's own framing, then in toward the front door.
const EPI_CAM = { a: { p: [0, 1.2, 6.5], t: [0, 2.15, -2], fov: 52 }, b: { p: [0, 1.55, 3.9], t: [0, 1.85, -3], fov: 44 } };
const EPI_DOOR = [0, 1.55, -2.95];
const EPI = { on: false, done: false };
// The endings where they stay get the same yard, at night, with nobody on the path. Someone inside says goodnight,
// and the house says it back: GOOD NIGHT instead of GOOD BYE.
const EPI_NIGHT_SOUNDS = [['g', 'uh', 1.1], ['uh', null, 1.04], ['uh', null, .98], ['d', null, .92], null, ['n', 'ay', 1.0], ['ay', null, .95], ['ay', null, .9], ['ay', null, .86], ['t', null, .8]];
const EPI_STAY = {
  saturday: { word: 'GOOD NIGHT', lines: [['w', 'Goodnight, house.'], ['d', 'Night, buddy.'], ['g', 'Night, pal.']] },
  all_home: { word: 'GOOD NIGHT', lines: [['w', 'Goodnight, house.'], ['w', 'Goodnight, Mom. Goodnight, Dad.']] },
};
EPI_ENDINGS.push(...Object.keys(EPI_STAY));
const _epA = new THREE.Vector3(), _epB = new THREE.Vector3(), _epC = new THREE.Vector3(), _epD = new THREE.Vector3();

function epiCam(from, to, k) {
  const e = k * k * (3 - 2 * k), s = EPI.shake || 0;
  _epA.set(...from.p).lerp(_epC.set(...to.p), e);
  _epB.set(...from.t).lerp(_epD.set(...to.t), e);
  if (s > 0) { _epB.x += (Math.random() - .5) * .012 * s; _epB.y += (Math.random() - .5) * .012 * s; }
  Render.liveCam(_epA, _epB, from.fov + (to.fov - from.fov) * e);
}
// Who's on the path: the three of them, or, if the garage went the other way, Wren and her aunt.
function epiCast() { return alive() ? [M, D, W] : [ANNIE, W]; }
function epiReady(p, x, z) {
  Object.assign(p, { room: 'photo', x, z, yaw: 0, faceYaw: 0, q: [], cur: null, home: null, dest: null, errand: false, gone: false, held: false, lie: false, dead: false, inCar: false, carSit: false, floorSit: 0, eyesShut: false,
    seated: 0, seatWant: 0, reachA: 0, reachWant: 0, wave: 0, waveWant: 0, sway: 0, headRoll: 0, headYaw: 0, headPitch: .03, lean: 0, baseY: 0, y: 0, hop: 0, dance: 0, attn: 0, hasBox: false, carrying: false, jobWander: false, climb: null, crawl: 0 });
  p.root.rotation.set(0, 0, 0);
  p.root.visible = true;
}
const epiWalk = (...pts) => pts.map(([x, z]) => ({ t: 'walk', x, z }));

function playEpilogue(done) {
  EPI.on = true; EPI.done = true; EPI.then = done; EPI.t = 0; EPI.phase = 'black'; EPI.shake = 0;
  const stay = EPI.stay = EPI_STAY[S.f.ending] || null;
  EPI.wordText = stay ? stay.word : EPI_WORD; EPI.sounds = stay ? EPI_NIGHT_SOUNDS : EPI_SOUNDS; EPI.linesOut = false;
  const lit = stay ? 'night' : 'eve';
  releaseArms();
  tip(''); $('hover').textContent = ''; $('said').textContent = '';
  // Nothing of the game's own on screen out here: no map, no names.
  ['map', 'who', 'meter', 'voices'].forEach(id => { $(id).style.display = 'none'; });
  S.subs = []; S.sub = null;
  showCard('', '');
  // Once it's black, set up the yard behind it, then let it fade back in.
  setTimeout(() => {
    all.forEach(p => { p.root.visible = false; p.room = null; });
    S.cans.forEach(c => { c.visible = false; });
    S.room = 'photo';
    // The inside doors are real objects, not part of the picture: tell the house nobody is in any of its rooms.
    HOUSE.update(0, 'photo', {});
    Render.stopLive();
    Render.showRoom('photo', undefined, lit, { dim: 1, tint: [1, 1, 1], flick: 1 });
    Render.goLive('photo', lit);
    epiCam(EPI_CAM.a, EPI_CAM.a, 0);
    $('gl').style.transition = ''; $('gl').style.opacity = '1';
    // Nobody leaves. They're all inside.
    // The yard has its own fixed light, so night is a filter over the picture. The words sit above it and stay bright.
    if (stay) { $('gl').style.filter = 'brightness(.5) saturate(.6) sepia(.4) hue-rotate(180deg) contrast(1.08)'; EPI.phase = 'walk'; EPI.t = 0; hideCard(); return; }
    const cast = epiCast(), grown = cast.filter(p => p !== W);
    // The grown-ups go first, side by side, down the path and off to the right where the truck is.
    grown.forEach((p, i) => {
      const x = i ? .32 : -.32;
      epiReady(p, x, -1.3);
      p.q = epiWalk([x, 3.0], [5.5 + i * .4, 4.2 + i * .3]).concat(doIt(q => { q.gone = true; }));
    });
    // Wren is a little behind them. Halfway down the path she stops and turns round.
    epiReady(W, .1, -1.6);
    W.q = [wait(1.1)].concat(epiWalk([.12, 1.7]), doIt(q => { q.faceYaw = Math.PI; }), wait(1.1),
      doIt(() => { S.subs.push({ who: 'w', text: 'Goodbye, house.', dur: 2.8 }); W.talk = 2.8; }), wait(4.2),
      epiWalk([.3, 3.0], [5.2, 4.6]), doIt(q => { q.gone = true; }));
    EPI.phase = 'walk'; EPI.t = 0;
    hideCard();
  }, params.has('fast') ? 30 : 1400);
}

function tickEpilogue(dt) {
  if (!EPI.on) return;
  EPI.t += dt;
  EPI.shake = Math.max(0, EPI.shake - dt * 1.4);
  // The subtitle clock: the game's own step has stopped by now.
  if (S.sub) { S.sub.dur -= dt; if (S.sub.dur <= 0) S.sub = null; }
  if (!S.sub && S.subs.length) S.sub = S.subs.shift();
  if (EPI.phase === 'black') return;
  if (!EPI.stay) epiCast().forEach(p => {
    if (p.room !== 'photo') return;
    runPerson(p, dt);
    People.pose(p, dt, S.time);
    p.root.visible = !p.gone;
    p.root.position.y = 0;
    p.boxM.visible = false; p.can.visible = false; p.quilt.visible = false; p.blob.visible = true;
  });
  S.time += dt;
  if (EPI.phase === 'walk' && EPI.stay) {
    // Voices from inside, through the walls. Then the same slow push in, with no truck.
    epiCam(EPI_CAM.a, EPI_CAM.a, 0);
    if (EPI.t > 2.2 && !EPI.linesOut) { EPI.linesOut = true; EPI.stay.lines.forEach(([who, text]) => S.subs.push({ who, text, dur: dur(text) + .4 })); }
    if ((EPI.linesOut && EPI.t > 4 && !S.sub && !S.subs.length) || EPI.t > 30) { EPI.phase = 'push'; EPI.t = 0; }
  } else if (EPI.phase === 'walk') {
    epiCam(EPI_CAM.a, EPI_CAM.a, 0);
    if ((W.gone && !S.sub && !S.subs.length) || EPI.t > 30) { EPI.phase = 'push'; EPI.t = 0; Audio2.fx.engine && Audio2.fx.engine(); }
  } else if (EPI.phase === 'push') {
    // Somewhere off to the right, the truck. The camera doesn't follow it.
    if (!EPI.stay && EPI.t > 1.5 && !EPI.engine2) { EPI.engine2 = true; Audio2.fx.engine && Audio2.fx.engine(); }
    epiCam(EPI_CAM.a, EPI_CAM.b, Math.min(1, EPI.t / 9));
    if (EPI.t >= 9.4) {
      EPI.phase = 'word'; EPI.t = 0;
      const door = ROOMS.hallway.objects.find(o => o.name.startsWith('the front door'));
      if (S.voice) { S.voice.character(door.voice); S.voice.stage(1); S.voice.air(1); S.voice.borrow(null); S.voice.mush(false); }
      epiBuildWord();
    }
  } else if (EPI.phase === 'word') {
    epiCam(EPI_CAM.b, EPI_CAM.b, 1);
    epiPlaceWord();
    const st = EPI.word;
    if (st.held) {
      st.heldT += dt;
      EPI.shake = Math.min(1.6, 1 + st.heldT * .5);
      if (S.voice) S.voice.bend(st.bend * (1 + Math.min(.22, st.heldT * .12)) + Math.sin(EPI.t * 26) * .012);
    } else if (st.relT > 0) {
      st.relT -= dt;
      if (st.relT <= 0 && S.voice) S.voice.release();
    }
    if (st.done && !st.held) {
      st.finale -= dt;
      if (st.finale <= 0) epiFade();
    } else if (!st.done && !st.held) {
      st.idle += dt;
      if (st.idle > 7 && !st.told) { st.told = true; tip('Type the letter.'); }
    }
  } else if (EPI.phase === 'fade') {
    epiCam(EPI_CAM.b, EPI_CAM.b, 1);
  }
}

// ---- The word ----
function epiBuildWord() {
  const el = $('strain');
  el.innerHTML = '';
  EPI.word = { i: -1, spans: [], idle: 0, held: null, heldT: 0, relT: 0, done: false, finale: 1.1 };
  [...EPI.wordText].forEach((c, i) => {
    const sp = document.createElement('span');
    sp.textContent = c;
    sp.className = c === ' ' ? 'gap' : 'l';
    sp.style.setProperty('--r', `${(i * 37 % 13 - 6) * .8}deg`);
    sp.style.setProperty('--y', `${(i * 53 % 9 - 4) * 2}px`);
    sp.style.setProperty('--s', `${1 + (i * 29 % 7) * .03}`);
    el.appendChild(sp); EPI.word.spans.push(sp);
  });
  el.classList.add('on');
  epiNextLetter();
}
function epiNextLetter() {
  const st = EPI.word;
  if (st.i >= 0 && st.spans[st.i]) st.spans[st.i].classList.remove('now');
  st.i++;
  while (st.i < EPI.wordText.length && EPI.wordText[st.i] === ' ') { st.spans[st.i].classList.add('seen'); st.i++; }
  if (st.i >= EPI.wordText.length) { st.done = true; return; }
  st.spans[st.i].classList.add('seen', 'now');
  st.idle = 0;
}
function epiKey(e) {
  const st = EPI.word;
  if (!EPI.on || EPI.phase !== 'word' || !st || st.done || e.repeat || e.key.length !== 1) return;
  const c = e.key.toLowerCase(), sp = st.spans[st.i];
  tip('');
  if (c !== EPI.wordText[st.i].toLowerCase()) {
    Audio2.fx.flop && Audio2.fx.flop();
    sp.classList.remove('nope'); void sp.offsetWidth; sp.classList.add('nope');
    return;
  }
  const snd = EPI.sounds[st.i];
  st.held = c; st.heldT = 0; st.bend = snd[2]; st.relT = 0;
  sp.classList.add('said');
  EPI.shake = 1;
  if (S.voice) { S.voice.bend(snd[2]); S.voice.phone(snd[0], snd[1]); }
  epiNextLetter();
}
function epiUp(e) {
  const st = EPI.word;
  if (!st || st.held !== e.key.toLowerCase()) return;
  st.held = null;
  st.relT = st.done ? .35 : .26;
}
function epiPlaceWord() {
  const p = Render.project(EPI_DOOR), el = $('strain');
  el.style.left = clamp(p.x, 440, 840) + 'px';
  el.style.top = clamp(p.y - 60, 140, 560) + 'px';
}
// The yard goes dark. The words don't, for a while. Then they go too, and the card comes up.
function epiFade() {
  EPI.phase = 'fade';
  tip('');
  EPI.word.spans.forEach(sp => sp.classList.remove('now'));
  const gl = $('gl');
  gl.style.transition = 'opacity 2.6s'; gl.style.opacity = '0';
  $('sub').innerHTML = ''; S.subs = []; S.sub = null;
  const fast = params.has('fast');
  setTimeout(() => {
    $('strain').style.transition = 'opacity 1.6s';
    $('strain').classList.remove('on');
    setTimeout(() => { EPI.on = false; EPI.then && EPI.then(); }, fast ? 20 : 1900);
  }, fast ? 20 : 6500);
}
addEventListener('keydown', epiKey);
addEventListener('keyup', epiUp);
