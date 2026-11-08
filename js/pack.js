// They're packing you, one mouth at a time. A packing day: Marion and Dell each have a room to pack, and every finished box
// goes to the pile in the hall. Some boxes take a thing you talk through with them. Words you've overheard pull whoever cares
// about them to wherever you said them from. Each day is a config (WED here, THU in week.js); the engine below runs any of them.
// Loaded after days.js. On its own (pack.html) it plays Wednesday morning as a test. With week.js after it (playtest.html), the whole week.

const PK = {
  HEAT_LURE: 1.5,  // suspicion per lure; at 6 Marion unplugs whatever you're talking out of
  HEAT_SECRET: 4,
  HEAT_HUG: 3,
  USES: 2,         // a word works this many times a day, then they stop falling for it
  PILE: [.7, .9],  // where the boxes go, in the hall
};
for (const r in ROOMS) ROOMS[r].objects.forEach(o => { o.key = o.name; });

// Through a door, and they're off into the next room. Out the front, and they're outside.
const DOOR_TO = {
  'kitchen/the garage door': 'garage', 'kitchen/the hall door': 'hallway', 'hallway/the kitchen door': 'kitchen',
  'hallway/the living room door': 'living', 'hallway/the front door': 'out', 'garage/the side door': 'kitchen', 'garage/the garage door': 'out',
  'living/the door': 'hallway', 'wren/the door': 'hallway',
};

// Who cares about which word, on any day. "best" is the one thing that word really works through. "to" sends them to that room.
const LURES = {
  tape: { who: ['d'], line: ['The tape?', 'Is the tape in there?'], away: 'Not in here either.', wise: { d: 'Not the tape again, buddy.' }, linger: 6 },
  soup: { who: ['d'], line: ['Soup. Right.', 'More soup. Okay.'], wise: { d: 'We have got enough soup, buddy.' }, linger: 2, soup: true },
  annie: { who: ['m'], line: ['Annie?', 'Annie? Is that you?'], best: 'the telephone', bestLine: 'Hello? Annie? ...Hello?', away: 'Annie?', wise: { m: 'Annie does not call the fridge.' }, linger: 4, bestLinger: 14 },
  coffee: { who: ['m'], line: ['Coffee?', 'Yes. Coffee.'], best: 'the kettle', bestLine: 'Fine. One coffee.', wise: { m: 'I have had my coffee.' }, linger: 3, bestLinger: 12 },
  truck: { who: ['m', 'd'], line: ['Is that the truck?', 'Is that the truck?'], best: 'the front door', away: 'No truck.', wise: { m: 'There is no truck until Friday.', d: 'Nice try, buddy.' }, linger: 4, bestLinger: 9 },
  keys: { who: ['d'], line: ['My keys?', 'Did somebody find my keys?'], best: 'the coats', bestLine: 'Hang on. My coat.', away: 'Not in here.', wise: { d: 'I will find them myself, thanks.' }, linger: 4, bestLinger: 10 },
  photos: { who: ['m'], line: ['The photos?', 'Are they in there?'], best: 'the bookshelf', bestLine: 'Oh. There she is.', wise: { m: 'I have them. I have the photos.' }, linger: 4, bestLinger: 14 },
  wren: { who: ['m'], to: 'wren', line: ['Wren?', 'Wren, honey?'], away: 'Are you packing? Good.', wise: { m: 'She is fine. She is upstairs.' }, linger: 7 },
  stay: { who: ['m', 'd'], hug: true, line: ['What is that noise?', 'What was that, buddy?'], wise: { m: 'I am not going over there.', d: 'Not right now, buddy.' } },
};
// What it hears is squeezed ("coffee" is "cofe"), so look the words up that way.
const LURE_BY = {};
for (const k in LURES) LURE_BY[squeeze(k)] = k;

// ---- Wednesday ----
const WED = {
  standalone: true, // pack.html: the card at the end is the end. week.js turns this off.
  T: 230,           // seconds until lunch. Left alone, they finish at about 195.
  WORK: 7,          // seconds of packing per box
  rooms: ['garage', 'kitchen', 'hallway'],
  own: { m: 'kitchen', d: 'garage' },
  jobs: {
    kitchen: [{ at: 'the sink' }, { at: 'the stove' }, { at: 'the kettle', pack: true }, { at: 'the telephone', pack: true }, { at: 'the lamp', pack: true }],
    garage: [{ at: 'the workbench', pack: true }, { spot: [-1.0, -2.5], yaw: Math.PI }, { at: 'the car radio', pack: true }],
  },
  openerRoom: 'kitchen',
  opener: [
    ['w', 'Why is Friday circled?'],
    ['m', "That's when the truck comes. Nine o'clock."],
    ['d', 'Has anybody seen the good tape?'],
    ['m', 'In a box.'],
    ['d', 'Which box?'],
    ['m', 'The one you taped.'],
    ['w', 'Dad, why are we moving?'],
    ['d', "It's the mortgage, Wrennie."],
    ['w', 'Mom said it was the school.'],
    ['cap', 'Marion puts a spoon down, very carefully.'],
    ['m', 'Garage, Dell. I have the kitchen.'],
  ],
  barks: {
    m: ['I need a coffee before I do the cups.', 'Annie is supposed to call about the pots.', 'Wren. Eat.', 'If Annie calls, I am here. Tell her I am here.', "Nine o'clock Friday. The truck will not wait."],
    d: ['Tape. Tape, tape, tape.', 'I had the good tape in my hand.', 'We have got soup. Nobody has to cook until Friday.', 'If anybody asks, it is the mortgage. It is easier.'],
  },
  hints: [
    { when: () => !PS.lured, text: 'When you say a thing, Dad goes and looks for it. He cannot help it.' },
    { when: () => !packed('kitchen', 'the telephone'), text: 'Mom answers the telephone if it says Annie. Before it goes in a box.' },
    { text: 'I want to stay.' },
    { when: () => !PS.secret, text: 'Mom and Dad only fight when they are in the same room.' },
    { text: 'If you say stay, they come over. Then you can hold on.' },
  ],
  fights: {
    school: [['d', 'The school? I thought we were saying it was the money.'], ['m', 'It is both. I told you it is both.'], ['d', 'You told Annie it was the school.'], ['m', 'Can we not do this in front of the fridge.'], ['cap', 'They stand there, not doing it in front of the fridge.']],
    mortgage: [['m', 'Is that what you tell people? The mortgage?'], ['d', "It's easier."], ['m', 'Easier for who, Dell.'], ['d', 'Can we not do this in front of the fridge.'], ['cap', 'They stand there, not doing it in front of the fridge.']],
  },
  alone: { m: { mortgage: "That is Dell's word." }, d: { school: 'School?' } },
  warn: { m: 'It is nearly lunch.', d: 'Lunch soon, hon?' },
  tips: [[1500, 'They are packing the house. Keep them busy until lunch.'], [9000, 'Say words you have heard. Whoever cares about a word goes to look where you said it.'], [17000, 'Click a thing to talk through it. Tab changes room.'], [26000, '']],
  endLabel: 'LUNCH',
};

const packed = (room, name) => ROOMS[room].objects.some(o => o.key === name && o.packed);
const objAt = (room, name) => ROOMS[room].objects.find(o => o.key === name);
const typing = () => S.keyHeld || S.typed.trim();
const quiet = () => !S.sub && !S.subs.length && !typing();
const cfg = () => S.scene.pk;
// What carries over from one day to the next: the pile, and what's been packed.
const PS = { t: 0, hall: 0, pile: 0, total: 0, left: {}, queue: null, workers: [], opener: 0, openT: 2, hintI: 0, hintT: 30, lastSpoke: -99, lured: 0, secret: false, fight: 0, uses: {}, covers: [], warned: false, over: false };

function jobFrom(room, j) {
  const o = j.at && objAt(room, j.at);
  if (!o) return { room, x: j.spot[0], z: j.spot[1], yaw: j.yaw, pack: null };
  return { room, x: o.stand[0], z: o.stand[1], yaw: Math.atan2(o.at.x - o.stand[0], o.at.z - o.stand[1]), pack: j.pack && !o.packed ? o : null };
}
function nextJob(w) {
  const mine = PS.queue[w.own];
  if (mine && mine.length) return mine.shift();
  for (const r in PS.queue) if (PS.queue[r].length) return PS.queue[r].pop();
  return null;
}
// Boxes still to fill stand in the room they're for. The full ones are the pile in the hall.
function drawBoxes() {
  const b = { hallway: Math.min(8, PS.pile) };
  for (const r in PS.left) if (r !== 'hallway') b[r] = PS.left[r];
  Render.setProps({ boxes: b });
}
function showCovers() { PS.covers.forEach(m => { m.visible = m.userData.room === S.room; }); }

// ---- Packing a thing you talk through ----
function packObj(o, p) {
  HOUSE.outlineFor(o);
  o.packed = true; o.muted = 1e9;
  const b = o.glowBox;
  if (b) {
    const size = new THREE.Vector3(), mid = new THREE.Vector3();
    b.getSize(size); b.getCenter(mid);
    const m = new THREE.Mesh(new THREE.BoxGeometry(clamp(size.x + .08, .3, 1.1), clamp(size.y + .08, .3, 1.1), clamp(size.z + .08, .3, 1.1)), BOX_MAT);
    m.position.copy(mid); m.rotation.y = rand(-.08, .08);
    m.userData.room = o.room;
    scene.add(m); PS.covers.push(m);
    showCovers();
  }
  const was = o.name;
  o.name = `${was} (in a box)`;
  Audio2.fx.click();
  if (S.room === o.room) say('cap', `${NAMES[p.id]} tapes ${was} into a box.`);
  if (S.obj === o) { release(); S.typed = ''; drawSaid(); showName(o.name); }
}

// ---- The work ----
const paused = () => PS.fight > 0 || PS.carDue > 0 || (PS.car && !S.g.outcome);
function work(w, dt) {
  const p = w.p;
  if (!w.active || paused() || p.errand || p.held || p.cur || p.q.length || p.gone || p.inCar || p.climb || p.dead) return;
  if (!w.job) {
    w.job = nextJob(w);
    if (!w.job) { w.phase = 'done'; p.reachWant = 0; return; }
    w.phase = 'go'; w.prog = 0;
  }
  const j = w.job;
  if (w.phase === 'go') {
    if (p.room !== j.room || Math.hypot(p.x - j.x, p.z - j.z) > .3) { p.home = null; order(p, travelSteps(p, j.room, j.x, j.z, j.yaw)); return; }
    w.phase = 'work';
    p.home = { x: j.x, z: j.z, yaw: j.yaw, reach: 1 };
  }
  if (w.phase === 'work') {
    p.reachWant = 1; p.faceYaw = j.yaw;
    // During the opener they're only looking busy, so nobody walks out in the middle of it.
    if (PS.openerDone) w.prog += dt;
    if (w.prog >= cfg().WORK) {
      if (j.pack && !j.pack.packed) packObj(j.pack, p);
      PS.left[j.room]--; drawBoxes();
      p.hasBox = true; p.reachWant = 0; w.phase = 'carry';
    }
    return;
  }
  if (w.phase === 'carry') {
    const [x, z] = PK.PILE;
    if (p.room !== 'hallway' || Math.hypot(p.x - x, p.z - z) > .35) { p.home = null; order(p, travelSteps(p, 'hallway', x, z, Math.PI / 2)); return; }
    p.hasBox = false; PS.hall++; PS.pile++; drawBoxes();
    if (S.room === 'hallway') Audio2.fx.settle();
    w.job = null; w.phase = 'idle';
  }
}
function bark(w, dt) {
  const p = w.p;
  if (!PS.openerDone || w.phase !== 'work' || !isHere(p) || p.errand || paused()) return;
  w.barkT -= dt;
  if (w.barkT > 0 || !quiet()) return;
  const list = cfg().barks[p.id];
  say(p.id, list[w.barkI++ % list.length]);
  w.barkT = rand(10, 16);
}

// ---- Words ----
function lureSteps(p, o, L, best) {
  if (L.to) {
    const ring = ROOMS[L.to].ring, r = ring[Math.floor(ring.length / 2)];
    return travelSteps(p, L.to, r[0], r[1], 0).concat(wait(L.linger || 6), sayIfHere(p.id, L.away || 'Huh.'));
  }
  const to = DOOR_TO[`${o.room}/${o.key}`];
  if (to === 'out' && o.room === 'hallway') {
    const F = HOUSE.DOORS.front.a;
    return route(p, F.stand[0], F.stand[1]).concat(openDoor('front'), { t: 'walk', x: F.beyond[0], z: F.beyond[1] }, shutDoor('front'), doIt(q => { q.gone = true; }),
      wait((best ? L.bestLinger : L.linger) || 6), doIt(q => { q.gone = false; }), openDoor('front'), { t: 'walk', x: F.stand[0], z: F.stand[1] }, sayIfHere(p.id, L.away || 'Huh.'));
  }
  if (to && to !== 'out' && ROOMS[to]) {
    const ring = ROOMS[to].ring, r = ring[Math.floor(ring.length / 2)];
    return travelSteps(p, to, r[0], r[1], 0).concat(reach(1), wait(10), reach(0), sayIfHere(p.id, L.away || 'Huh.'));
  }
  const steps = route(p, o.stand[0], o.stand[1]).concat(faceObj(o), reach(1), wait((best ? L.bestLinger : L.linger) || 5), reach(0));
  if (best && L.bestLine) steps.splice(steps.length - 2, 0, sayIfHere(p.id, L.bestLine));
  if (L.soup) steps.splice(steps.length - 1, 0, doIt(() => { addCan(o); Audio2.fx.click(); }));
  return steps;
}
function lure(word, o) {
  const L = LURES[word], n = PS.uses[word] || 0;
  const free = L.who.map(personById).filter(p => isHere(p) && !p.errand && !p.held && !p.gone && !p.inCar && !p.dead);
  if (!free.length) return false;
  if (n >= PK.USES) {
    const p = free[0];
    p.attn = 2.5; say(p.id, L.wise[p.id] || 'No.');
    S.heat += 1;
    return true;
  }
  if (L.hug) {
    if (S.arm !== 'none') return false;
    const p = free.sort((a, b) => Math.hypot(a.x - o.at.x, a.z - o.at.z) - Math.hypot(b.x - o.at.x, b.z - o.at.z))[0];
    say(p.id, L.line[p === M ? 0 : 1]);
    goOff(p, route(p, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(q => { endErrand(q); q.q = []; q.cur = null; startHug(q, o); })));
    S.heat += PK.HEAT_HUG;
  } else {
    const best = L.best === o.key;
    free.forEach((p, i) => {
      if (i === 0) say(p.id, L.line[Math.min(n, L.line.length - 1)]);
      goOff(p, lureSteps(p, o, L, best));
    });
    S.heat += PK.HEAT_LURE;
  }
  PS.uses[word] = n + 1; PS.lured++;
  return true;
}
// Straight onto the queue: say() only keeps the last few, and these can be whole conversations.
function sayAll(lines) { lines.forEach(l => { const p = l[0] !== 'cap' && personById(l[0]); if (l[0] === 'cap' || (p && isHere(p))) S.subs.push({ who: l[0], text: l[1], dur: dur(l[1]), reply: true }); }); }
function fight(word) {
  const c = cfg();
  PS.secret = true; PS.secretObj = S.obj;
  sayAll(c.fights[word]);
  S.heat += PK.HEAT_SECRET;
  // Some days they take it out to the car. That's for week.js.
  if (c.fightToCar) { c.fightToCar(); return; }
  PS.fight = 22;
  // They square up and stay put. Anyone who was off on an errand goes back to it afterwards.
  [[M, D], [D, M]].forEach(([a, b]) => { order(a, [doIt(q => { q.reachWant = 0; q.attn = 0; q.faceYaw = Math.atan2(b.x - q.x, b.z - q.z); }), wait(PS.fight)]); });
}
function suspicious() {
  if (S.heat >= 6 && isHere(M) && !M.errand && !M.held && !M.inCar && !S.unplugging && S.obj.muted <= 0 && !paused()) unplug(S.obj);
}
function packReact() {
  const text = S.typed; S.typed = '';
  if (!text.trim()) return;
  const o = S.obj, c = cfg();
  if (o.muted > 0) return;
  S.spoke++; PS.lastSpoke = S.time;
  // The day's own business first (the garage, on Thursday).
  if (c.onSay && c.onSay(text, o)) return;
  const people = here();
  const known = heardWords(text).filter(t => S.known[t]);
  // Nothing it has heard: a noise. Somebody glances over, and that's all.
  if (!known.length) { if (people.length) people[S.spoke % people.length].attn = 1.4; return; }
  const fightBy = {};
  for (const k in c.fights) fightBy[squeeze(k)] = k;
  const secret = known.map(t => fightBy[t]).find(Boolean);
  if (secret && !PS.secret && isHere(M) && isHere(D) && !M.held && !D.held && !M.inCar && !paused()) { fight(secret); return; }
  if (secret && !PS.secret) {
    for (const id of ['m', 'd']) {
      const line = c.alone && c.alone[id] && c.alone[id][secret], p = personById(id);
      if (line && isHere(p)) { p.attn = 2.5; say(id, line); return; }
    }
  }
  for (const t of known) if (LURE_BY[t] && lure(LURE_BY[t], o)) { suspicious(); return; }
  people.forEach(p => { p.attn = Math.max(p.attn, 1.8); });
}

// ---- The day ----
function tickPack(dt) {
  if (S.paused > 0) { S.paused -= dt; return; }
  if (PS.over) return;
  const c = cfg();
  PS.t += dt;
  // The opener plays where it's set. Whoever's waiting for it gets to work after.
  if (!PS.openerDone) {
    PS.openT -= dt;
    if (PS.openT <= 0 && !S.sub && !S.subs.length) {
      const l = c.opener[PS.opener];
      const sp = l && l[0] !== 'cap' && personById(l[0]);
      if (!l) { PS.openerDone = true; PS.workers.forEach(w => { w.active = true; }); if (c.onOpened) c.onOpened(); }
      else if (sp && sp.errand) PS.openT = .3;
      else {
        PS.opener++;
        if (S.room === c.openerRoom && (!sp || isHere(sp))) { say(l[0], l[1]); if (sp) sp.talk = dur(l[1]); PS.openT = dur(l[1]) + .4; }
        else PS.openT = .1;
      }
    }
  }
  PS.workers.forEach(w => { work(w, dt); bark(w, dt); });
  if (PS.fight > 0) {
    PS.fight -= dt;
    // She knows who started it. Whatever you said it through gets unplugged.
    if (PS.fight <= 0) {
      const o = PS.secretObj;
      if (o && o.muted <= 0 && o.room === M.room && !M.errand && !M.held && !S.unplugging) unplug(o);
      else if (isHere(M)) say('m', 'Fine.');
    }
  }
  if (c.tick) c.tick(dt);
  // That may have ended the day.
  if (PS.over || !inPack()) return;
  // Wren, now and then, when it's quiet.
  if (PS.openerDone && isHere(W) && !W.held) {
    PS.hintT -= dt;
    if (PS.hintT <= 0 && quiet() && S.time - PS.lastSpoke > 6) {
      while (PS.hintI < c.hints.length && c.hints[PS.hintI].when && !c.hints[PS.hintI].when()) PS.hintI++;
      if (PS.hintI < c.hints.length) say('w', c.hints[PS.hintI++].text);
      PS.hintT = 26;
    }
  }
  if (!PS.warned && PS.t > c.T - 40) {
    PS.warned = true;
    const p = [M, D].find(q => isHere(q) && !q.inCar);
    if (p) say(p.id, c.warn[p.id]);
  }
  if (c.holdEnd && c.holdEnd()) return;
  if (PS.hall >= PS.total) return endPack(false);
  if (PS.t >= c.T && quiet()) endPack(true);
}
function endPack(timeUp) {
  if (PS.over || !inPack()) return;
  const c = cfg();
  if (c.beforeEnd && !PS.endAsked) { PS.endAsked = true; if (c.beforeEnd(timeUp)) return; }
  PS.over = true; release();
  $('said').textContent = ''; tip('');
  const kept = [];
  for (const r in c.jobs) c.jobs[r].forEach(j => { if (j.pack && objAt(r, j.at) && !packed(r, j.at)) kept.push(j.at); });
  const list = kept.length > 1 ? `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}` : kept[0];
  const left = PS.total - PS.hall;
  const head = timeUp === 'garage' ? '' : left ? `${left} of ${PS.total} boxes still to pack.` : 'Everything is packed.';
  const more = timeUp === 'garage' ? '' : kept.length ? `You still have ${list}.` : 'You have nothing left in here to talk through but the fixtures.';
  if (c.standalone) {
    S.finished = true; $('sub').innerHTML = '';
    showCard(c.endLabel, head, `${more} Click to try again.`);
    $('card').onclick = () => location.reload();
    return;
  }
  // In the full week, the day's result goes on the card for whatever comes next.
  PS.result = [head, more].filter(Boolean).join(' ');
  startScene(S.sceneI + 1);
  if (S.card) $('cardmore').textContent = PS.result;
}
function startPack() {
  const c = cfg();
  Object.assign(PS, { t: 0, hall: 0, opener: 0, openT: 2, openerDone: false, hintI: 0, hintT: 30, lastSpoke: -99, lured: 0, secret: false, fight: 0, carDue: 0, car: null, carDone: false, uses: {}, warned: false, over: false, endAsked: false, secretObj: null });
  PS.queue = {}; PS.left = {}; PS.total = 0;
  for (const r in c.jobs) { PS.queue[r] = c.jobs[r].map(j => jobFrom(r, j)); PS.left[r] = c.jobs[r].length; PS.total += c.jobs[r].length; }
  PS.workers = [
    { p: M, own: c.own.m, active: false, job: null, phase: 'idle', prog: 0, barkT: 5, barkI: 0 },
    { p: D, own: c.own.d, active: false, job: null, phase: 'idle', prog: 0, barkT: 8, barkI: 0 },
  ];
  // If her room is where the opener is, Marion gets to work at once, as far as anyone can tell. Otherwise she stays for it.
  PS.workers[0].active = c.own.m === c.openerRoom;
  S.heat = 0;
  drawBoxes();
  showCovers();
  (c.tips || []).forEach(([t, s]) => setTimeout(() => { if (!PS.over) tip(s); }, t));
  if (c.onStart) c.onStart();
}

const PACK_SCENE = {
  id: 'pack', pack: true, pk: WED, day: 'WEDNESDAY', part: 'Morning', state: 'day', room: 'kitchen', acts: true, heard: true, tracks: [], hot: {},
  place: {
    m: { room: 'kitchen', x: -.5, z: -1.35, yaw: Math.PI },
    d: { room: 'kitchen', x: 1.14, z: .3, yaw: -Math.PI / 2, seat: 1, stand: [2.15, .3] },
    w: { room: 'kitchen', x: -1.14, z: .3, yaw: Math.PI / 2, seat: 1, stand: [-2.4, .8] },
  },
  onStart: startPack,
};
const ORIGINAL_SCENES = SCENES.slice();
SCENES.length = 0;
SCENES.push(PACK_SCENE);

// ---- Words that matter ----
// Any word someone can be pulled by is underlined whenever it's said. The first time you hear one, it lights up,
// and when the line ends the rest of it fades and that word stays a moment on its own.
const KEY_WORDS = new Set([...Object.keys(LURE_BY), ...[WED].flatMap(c => Object.keys(c.fights).map(squeeze))]);
const LINGER = 1.8;
const noticed = new Set();
function drawPackSub() {
  const el = $('sub'), s = S.sub;
  if (s && !s.drawn) {
    s.drawn = true; el.innerHTML = '';
    const sp = document.createElement('span');
    if (s.who === 'cap') sp.className = 'cap';
    else {
      sp.style.color = MAP.COL[s.who] || '';
      const b = document.createElement('b'); b.textContent = NAMES[s.who] || ''; sp.appendChild(b);
      Audio2.mumble(s.text, MUMBLE[s.who] || MUMBLE.m, s.dur * .86, S.clear === undefined ? 1 : S.clear);
    }
    let fresh = false;
    s.text.split(/([A-Za-z']+)/).forEach(part => {
      if (!part) return;
      const k = squeeze(part);
      if (s.who !== 'cap' && KEY_WORDS.has(k)) {
        const w = document.createElement('em'); w.className = 'key'; w.textContent = part;
        if (!noticed.has(k)) { noticed.add(k); w.classList.add('new'); fresh = true; }
        sp.appendChild(w);
      } else {
        const r = document.createElement('span'); r.className = 'rest'; r.textContent = part; sp.appendChild(r);
      }
    });
    // It stays up a little longer, and the last of that time is just the word.
    if (fresh) { s.dur += LINGER; s.fresh = true; }
    el.appendChild(sp);
  }
  if (s && s.fresh && !s.letgo && s.dur <= LINGER && el.firstChild) { s.letgo = true; el.firstChild.classList.add('letgo'); }
  if (!s && el.firstChild) el.innerHTML = '';
}

// ---- Being held ----
// Marion and Dell can't see the arms. Wren can, and so can you. To the grown-ups it's a feeling that comes over them out of
// nowhere: they stop, and they remember something, and they don't know why. Over the week Marion starts to notice.
// Each line has to stand on its own: anyone who isn't in the room is skipped.
const FELT = {
  m: {
    WEDNESDAY: [
      [['cap', 'Marion stops, with a cup in her hand.'], ['m', 'Huh.'], ['m', 'My mother used to stand right here. Every morning.']],
      [['cap', 'Her eyes are wet. She seems surprised by it.'], ['m', 'I am fine. I am just tired.']],
      [['m', 'Why do I always get like this in the kitchen?']],
    ],
    THURSDAY: [
      [['cap', 'Marion goes very still.'], ['m', 'There is something here.'], ['d', 'It is the house, hon. It is a lot, leaving it.']],
      [['m', 'It is warm. Why is it warm?']],
      [['m', 'I am not going to cry in front of {obj}.']],
    ],
    FRIDAY: [
      [['cap', 'For a second, Marion looks down at the arms. She can see them. She does not pull away.'], ['m', 'Oh. There you are.']],
      [['m', 'I know. I know you do.']],
      [['m', 'I know.']],
    ],
    SATURDAY: [[['m', 'Thank you.']], [['m', 'That is lovely.']], [['cap', 'Marion goes on with what she was saying.']]],
  },
  d: {
    WEDNESDAY: [
      [['cap', 'Dell stops, holding a roll of the wrong tape.'], ['d', 'We had good years in here, you know.'], ['d', 'I do not know why I said that.']],
      [['d', 'I carried Wren in through that door. She was this big.']],
      [['d', 'Huh. I could use a sit-down.']],
    ],
    THURSDAY: [
      [['d', 'You ever get the feeling a place is going to miss you?'], ['d', 'Me neither.']],
      [['d', 'Warm in here. Is the heat on?']],
      [['d', 'Marion would say I am being sentimental.']],
    ],
    FRIDAY: [
      [['d', 'Yeah.'], ['d', 'Yeah, me too, buddy.']],
      [['d', 'Best four years of my life, this place. Five. Whatever it was.']],
    ],
    SATURDAY: [[['d', 'Good talk, buddy.']], [['d', 'Yep.']]],
  },
};
// Wren, if she's there to see it.
const WREN_SEES = {
  m: { WEDNESDAY: [['w', 'It is hugging you, Mom.'], ['m', 'Eat your breakfast, Wren.']], THURSDAY: [['w', 'It likes you best, I think.'], ['m', 'Wren. Please.']], FRIDAY: [['w', 'You can see it now.'], ['m', 'Just for a second, honey.']] },
  d: { WEDNESDAY: [['w', 'It is hugging you, Dad.'], ['d', 'Do not be weird, Wrennie.']], THURSDAY: [['w', 'It is holding you really tight.'], ['d', 'Yeah? Tell it I said thanks.']], FRIDAY: [['w', 'It does not want you to go.'], ['d', 'I know, Wrennie.']] },
};
// When it lets go, they go back to work. Marion, by Thursday, knows something happened to her.
const FELT_END = {
  m: { WEDNESDAY: 'Okay. Cups.', THURSDAY: 'Do not do that again.', FRIDAY: 'That is enough now. Thank you.', SATURDAY: 'Thank you. That was lovely.' },
  d: { WEDNESDAY: 'Right. Tape.', THURSDAY: 'Okay. Boxes.', FRIDAY: 'Okay, buddy. Okay.', SATURDAY: 'Good talk.' },
};
function feltBeat(P0) {
  const day = S.scene.day, set = (FELT[P0.id] || FELT.d)[day] || FELT.d.WEDNESDAY;
  S.hugN = S.hugN || {};
  const k = day + P0.id, i = S.hugN[k] = (S.hugN[k] || 0) + 1;
  const lines = set[Math.min(i - 1, set.length - 1)].slice();
  // Wren says so the first time each of them is held that day.
  const seen = (WREN_SEES[P0.id] || {})[day];
  if (i === 1 && seen && isHere(W) && !W.held) lines.push(...seen);
  lines.forEach(l => {
    if (l[0] !== 'cap' && !isHere(personById(l[0]))) return;
    const t = fill(l[1]); S.subs.push({ who: l[0], text: t, dur: dur(t), reply: true });
  });
  return [];
}
function feltEnd(P0) { const m = FELT_END[P0.id] || FELT_END.d; return m[S.scene.day] || m.WEDNESDAY; }
// Same as days.js, but nobody is described as noticing.
function startFelt(target, o) {
  S.hugP = target; S.hugObj = o; target.held = true; target.q = []; target.cur = null;
  S.arm = 'out'; S.len = .05; S.close = 0; S.hugT = 0; S.hugs++;
  S.left.setLook(HugArms.LOOKS[o.look]); S.right.setLook(HugArms.LOOKS[o.look]);
  S.left.visible(true); S.right.visible(true);
  Audio2.fx.reach();
  say('cap', S.hugs === 1 ? `Two long arms come out of ${o.name}, very slowly, and close around ${NAMES[target.id]}.` : `The arms come out of ${o.name} again.`);
}

// ---- Hooks into days.js ----
// FULL is turned on by week.js: then the felt hugs, the key words and the hidden meter apply to every scene, not just packing days.
const PACKING = { full: false };
const inPack = () => S.scene && S.scene.pack;
const anyScene = () => S.scene && (inPack() || (PACKING.full && !S.scene.locked));
const _playIntro = playIntro;
playIntro = done => { $('intro').classList.remove('on'); done(); };
const _runTracks = runTracks, _react = react, _drawMeter = drawMeter, _drawSub = drawSub, _nextRoom = nextRoom, _goRoom = goRoom;
const _hugBeat = hugBeat, _hugEnd = hugEnd, _startHug = startHug;
runTracks = dt => (inPack() ? tickPack(dt) : _runTracks(dt));
react = () => (inPack() ? packReact() : _react());
drawMeter = dt => { if (inPack() || PACKING.full) { $('meter').style.display = 'none'; return; } _drawMeter(dt); };
drawSub = () => (anyScene() ? drawPackSub() : _drawSub());
nextRoom = () => {
  if (!inPack()) return _nextRoom();
  const rooms = cfg().rooms;
  goRoom(rooms[(rooms.indexOf(S.room) + 1) % rooms.length]); Audio2.fx.creak();
};
goRoom = (room, quiet) => { _goRoom(room, quiet); showCovers(); };
hugBeat = P0 => (anyScene() && P0 !== W ? feltBeat(P0) : _hugBeat(P0));
hugEnd = P0 => (anyScene() ? feltEnd(P0) : _hugEnd(P0));
startHug = (target, o) => (anyScene() && target !== W ? startFelt(target, o) : _startHug(target, o));
window.PK = PK; window.PS = PS;
