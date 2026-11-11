// The house can move its own body. Press and hold on a thing, and after a moment it does the one thing it does:
// the tap runs, a lamp flickers, a door slams, the radiator clanks, the phone rings.
// Whoever's nearest goes to deal with it. That's a stall that costs no words.
// It's introduced slowly: on Wednesday morning Wren asks for one thing (the tap). After that, everything can move.
// Limits: each thing works twice a day, then they've noticed. Every move adds to the same suspicion as talking.

// ---- What each thing does ----
const DOOR_ID = {
  'kitchen/the garage door': 'gk', 'kitchen/the hall door': 'kh', 'hallway/the front door': 'front', 'hallway/the kitchen door': 'kh',
  'hallway/the living room door': 'hl', 'living/the door': 'hl', 'wren/the door': 'wd', 'garage/the side door': 'gk', 'bedroom/the door': 'bd',
};
function actKind(o) {
  const n = o.name;
  if (DOOR_ID[o.room + '/' + n]) return 'door';
  if (/lamp/.test(n)) return 'lamp';
  if (n === 'the sink') return 'tap';
  if (n === 'the kettle') return 'kettle';
  if (n === 'the radiator') return 'radiator';
  if (n === 'the telephone') return 'phone';
  if (n === 'the bookshelf') return 'books';
  if (n === 'the coats') return 'coats';
  if (n === 'the car radio') return 'radio';
  if (/vent|hatch|wall/.test(n)) return 'breath';
  if (/fridge|stove|dishwasher/.test(n)) return 'rumble';
  if (n === 'the garage door' && o.room === 'garage') return null; // the garage door has its own story on Thursday
  return 'creak';
}
// What the nearest grown-up says when it happens, and when they've fixed it. Two each, so a second time isn't the same.
const ACT_LINES = {
  door: { m: ['Who is that?', 'Who keeps doing that?'], d: ['Hello?', 'Again, door?'], fix: ['Nobody.', 'Draft.'], stall: 4, wise: ['That door does that.', 'It is the house settling.'] },
  lamp: { m: ['The bulb, Dell.', 'Again?'], d: ["Bulb's going.", 'Hang on.'], fix: ['There.', 'That should hold.'], stall: 5, wise: ['It is the wiring.', 'It is the wiring. I know.'] },
  tap: { m: ['Who left this on?', 'Again?'], d: ['Who left the tap on?', 'Huh.'], fix: ['Off. Off.', 'It is off.'], stall: 4, wise: ['The washer is going.', 'Nobody touch the tap.'] },
  kettle: { m: ['Who put the kettle on?', 'Nobody wants tea.'], d: ['Tea? Is somebody making tea?', 'Kettle again.'], fix: ['There.', 'Off.'], stall: 5, wise: ['The kettle is broken.', 'It is in a box tomorrow.'] },
  radiator: { m: ['The pipes.', 'Dell, the pipes.'], d: ['That is the pipes.', 'Easy, pipes.'], fix: ['There.', 'Bled it.'], stall: 6, wise: ['Old pipes.', 'It does that.'] },
  phone: { m: ['Hello?', 'Hello? Annie?'], d: ['Hello?', 'Yeah, hello?'], fix: ['Nobody.', 'Nobody again.'], stall: 6, wise: ['I am not answering that.', 'Let it ring.'] },
  books: { m: ['Oh!', 'Not again.'], d: ['Whoa.', 'Again?'], fix: ['They just fell.', 'There.'], stall: 5, wise: ['That shelf is crooked.', 'Leave them.'] },
  coats: { m: ['Is somebody in there?', 'Wren, are you in the coats?'], d: ['Hello?', 'Buddy?'], fix: ['Just coats.', 'Coats.'], stall: 4, wise: ['It is the draft.', 'Just coats.'] },
  radio: { m: ['Who turned that on?', 'Off.'], d: ['Hey, that is my station.', 'Again?'], fix: ['Off.', 'There.'], stall: 4, wise: ['It does that.', 'Battery.'] },
  breath: { m: ['What was that?', 'It is doing it again.'], d: ['Hear that?', 'The vents.'], fix: ['The vent.', 'Air.'], stall: 3, wise: ['It is air.', 'Old ducts.'] },
  rumble: { m: ['What is it doing?', 'Dell. It is doing it again.'], d: ['Easy, buddy.', 'Hey. Easy.'], fix: ['It is fine.', 'Fine.'], stall: 4, wise: ['It is the compressor.', 'It does that.'] },
  creak: { m: ['Did that move?', 'Again?'], d: ['Huh.', 'Did you see that?'], fix: ['Settling.', 'Old house.'], stall: 3, wise: ['Old house.', 'It is settling.'] },
};
// Wren's in on it. If nobody else is dealing with it, she's delighted.
const WREN_ACT = ['Ha!', 'Again!', 'Do the other one!', 'That was you, right?', 'I saw that.', 'Not too much. Mom is watching.'];
const ACT_HOLD = .55, ACT_GAP = 3.5, ACT_HEAT = 1.2;

// ---- The effects layer ----
const fxc = document.createElement('canvas');
fxc.id = 'fx'; fxc.width = 1280; fxc.height = 720;
Object.assign(fxc.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
$('gl').after(fxc);
const fxg = fxc.getContext('2d');
const PARTS = [];
let shakeT = 0, flickT = 0;
const proj = o => Render.project([o.at.x, o.at.y, o.at.z]);
function spawn(kind, o) {
  const p = proj(o), r = Math.random;
  const add = (n, f) => { for (let i = 0; i < n; i++) PARTS.push(Object.assign({ x: p.x, y: p.y, t: 0, life: 1 }, f(i))); };
  if (kind === 'tap') add(26, i => ({ k: 'drop', x: p.x + (r() - .5) * 10, y: p.y + 4, vx: (r() - .5) * 20, vy: 30 + r() * 60, life: .9 + r() * .5, d: i * .04 }));
  if (kind === 'kettle') add(14, i => ({ k: 'steam', x: p.x + (r() - .5) * 8, y: p.y - 10, vx: (r() - .5) * 18, vy: -40 - r() * 30, life: 1.6, d: i * .08 }));
  if (kind === 'breath') add(16, i => ({ k: 'dust', x: p.x + (r() - .5) * 20, y: p.y, vx: 30 + r() * 50, vy: (r() - .5) * 26, life: 1.4, d: i * .03 }));
  if (kind === 'door') add(10, i => ({ k: 'dust', x: p.x + (r() - .5) * 60, y: p.y + 70 + r() * 30, vx: (r() - .5) * 60, vy: -10 - r() * 20, life: 1.2, d: .25 }));
  if (kind === 'phone') add(4, i => ({ k: 'ring', life: 1.1, d: i * .28 }));
  if (kind === 'radio') add(6, i => ({ k: 'note', x: p.x + (r() - .5) * 20, vx: (r() - .5) * 30, vy: -35, life: 1.6, d: i * .2 }));
  if (kind === 'books') add(5, i => ({ k: 'book', x: p.x + (r() - .5) * 50, y: p.y - 20 + r() * 30, vx: (r() - .5) * 30, vy: 0, rot: r() * 3, vr: (r() - .5) * 8, life: 1.1, d: i * .09, c: ['#7a2e24', '#2e4a6b', '#6b5a2e', '#38563a', '#5a3a5e'][i] }));
  if (['radiator', 'rumble', 'creak', 'coats', 'lamp'].includes(kind)) add(kind === 'lamp' ? 0 : 3, i => ({ k: 'rattle', life: .7, d: i * .15, w: kind === 'creak' || kind === 'coats' ? 30 : 46 }));
  if (kind === 'radiator' || kind === 'rumble' || kind === 'door') shakeT = kind === 'door' ? .25 : .45;
  if (kind === 'lamp') flickT = 1.3;
}
function drawFx(dt) {
  fxg.clearRect(0, 0, 1280, 720);
  // A held press: a ring filling in around the thing, so you can feel it building.
  const h = ACT.hold;
  if (h && h.o) {
    const p = proj(h.o), k = Math.min(1, h.t / ACT_HOLD);
    fxg.lineWidth = 4; fxg.strokeStyle = 'rgba(255,226,160,.25)'; fxg.beginPath(); fxg.arc(p.x, p.y, 26, 0, 7); fxg.stroke();
    fxg.strokeStyle = h.ok ? 'rgba(255,214,120,.95)' : 'rgba(200,190,170,.5)'; fxg.beginPath(); fxg.arc(p.x, p.y, 26, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); fxg.stroke();
  }
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const q = PARTS[i];
    if (q.d > 0) { q.d -= dt; continue; }
    q.t += dt;
    if (q.t > q.life) { PARTS.splice(i, 1); continue; }
    const a = 1 - q.t / q.life;
    if (q.vx !== undefined) { q.x += q.vx * dt; q.y += q.vy * dt; }
    if (q.k === 'drop') { q.vy += 300 * dt; fxg.fillStyle = `rgba(170,210,255,${.85 * a})`; fxg.beginPath(); fxg.ellipse(q.x, q.y, 3.2, 6, 0, 0, 7); fxg.fill(); }
    else if (q.k === 'steam') { fxg.fillStyle = `rgba(245,245,240,${.45 * a})`; fxg.beginPath(); fxg.arc(q.x, q.y, 6 + q.t * 22, 0, 7); fxg.fill(); }
    else if (q.k === 'dust') { q.vx *= .97; fxg.fillStyle = `rgba(210,200,180,${.4 * a})`; fxg.beginPath(); fxg.arc(q.x, q.y, 3 + q.t * 10, 0, 7); fxg.fill(); }
    else if (q.k === 'ring') { fxg.strokeStyle = `rgba(255,236,190,${.8 * a})`; fxg.lineWidth = 3; fxg.beginPath(); fxg.arc(q.x, q.y, 12 + q.t * 70, -1.1, 1.1); fxg.stroke(); fxg.beginPath(); fxg.arc(q.x, q.y, 12 + q.t * 70, Math.PI - 1.1, Math.PI + 1.1); fxg.stroke(); }
    else if (q.k === 'note') { fxg.fillStyle = `rgba(255,236,190,${a})`; fxg.font = 'bold 22px Georgia, serif'; fxg.fillText('♪', q.x + Math.sin(q.t * 9) * 6, q.y); }
    else if (q.k === 'book') { q.vy += 520 * dt; q.rot += q.vr * dt; fxg.save(); fxg.translate(q.x, q.y); fxg.rotate(q.rot); fxg.globalAlpha = Math.min(1, a * 2); fxg.fillStyle = q.c; fxg.fillRect(-8, -16, 16, 32); fxg.fillStyle = 'rgba(255,240,205,.5)'; fxg.fillRect(-8, -16, 16, 3); fxg.restore(); }
    else if (q.k === 'rattle') {
      fxg.strokeStyle = `rgba(255,240,205,${.75 * a})`; fxg.lineWidth = 2.5;
      for (const s of [-1, 1]) { fxg.beginPath(); const x0 = q.x + s * q.w; for (let j = 0; j < 4; j++) fxg.lineTo(x0 + s * (j % 2 ? 7 : 0) + s * q.t * 20, q.y - 16 + j * 10); fxg.stroke(); }
    }
  }
  // The room jolts, or the light stutters.
  if (shakeT > 0) { shakeT -= dt; const s = shakeT > 0 ? 3.5 * Math.min(1, shakeT * 4) : 0; const tr = s ? `translate(${(Math.random() - .5) * s}px, ${(Math.random() - .5) * s}px)` : ''; $('gl').style.transform = tr; fxc.style.transform = tr; }
  if (flickT > 0) {
    flickT -= dt;
    const on = flickT <= 0 || Math.sin(flickT * 31) + Math.sin(flickT * 13) > -.4;
    if (!(S.moodT > 0)) Render.setView({ dim: on ? 1 : .35, tint: [1, 1, 1] });
  }
}

// ---- Pressing and holding ----
const ACT = { open: 'none', hold: null, lastT: -99, uses: {} };
function actAllowed(o) {
  if (!o || !actKind(o) || ACT.open === 'none') return false;
  if (ACT.open === 'tap') return o.room === 'kitchen' && o.name === 'the sink';
  return true;
}
function canActNow() { return S.on && !S.finished && S.scene && !S.scene.locked && !S.scene.teach && !S.card && S.paused <= 0 && !(typeof EPI !== 'undefined' && EPI.on); }
$('stage').addEventListener('mousedown', () => {
  if (!canActNow()) return;
  const o = under();
  if (!actAllowed(o)) return;
  ACT.hold = { o, t: 0, ok: o.muted <= 0 && S.time - ACT.lastT >= ACT_GAP };
});
addEventListener('mouseup', () => { ACT.hold = null; });
function tickActs(dt) {
  const h = ACT.hold;
  if (h) {
    if (under() !== h.o || !canActNow()) ACT.hold = null;
    else if (h.ok) { h.t += dt; if (h.t >= ACT_HOLD) { ACT.hold = null; actOn(h.o); } }
    else h.t = Math.min(h.t + dt, ACT_HOLD * .3); // too soon, or unplugged: it won't go
  }
  drawFx(dt);
  actIntro(dt);
}

// ---- When it goes ----
function actOn(o) {
  const kind = actKind(o), L = ACT_LINES[kind];
  ACT.lastT = S.time;
  spawn(kind, o);
  actSound(kind, o);
  if (o.room !== S.room) return;
  const key = (S.scene.id || '') + o.room + '/' + o.name;
  const store = typeof inPack === 'function' && inPack() ? PS.uses : ACT.uses;
  const n = store['act:' + key] || 0;
  store['act:' + key] = n + 1;
  const free = [M, D].filter(p => p && isHere(p) && !p.errand && !p.held && !p.inCar && !p.dead && !p.lie)
    .sort((a, b) => Math.hypot(a.x - o.at.x, a.z - o.at.z) - Math.hypot(b.x - o.at.x, b.z - o.at.z));
  const wrenHere = typeof wrenFree === 'function' && wrenFree() && !ACT.quietWren;
  S.heat += ACT_HEAT;
  if (!free.length || !S.scene.acts) {
    if (wrenHere) { const l = freshOf(rotate(WREN_ACT, ACT.wi = (ACT.wi || 0) + 1)); if (l) say('w', l); W.hop = .6; W.attn = 4; }
    else { all.filter(isHere).forEach(p => { p.attn = Math.max(p.attn, 2.5); }); }
    return;
  }
  const p = free[0];
  if (n >= PK.USES) {
    // They've noticed. No stall, just suspicion.
    say(p.id, L.wise[(n - PK.USES) % 2]); p.attn = 3; S.heat += 1;
    if (typeof suspicious === 'function') suspicious(); else checkHeat();
    return;
  }
  say(p.id, L[p.id][Math.min(n, 1)]);
  const stand = o.stand || [p.x, p.z];
  const fix = [doIt(q => { q.reachWant = 1; }), wait(L.stall * .6), doIt(q => { q.reachWant = 0; if (kind === 'door') HOUSE.want(DOOR_ID[o.room + '/' + o.name], .1); }), sayIfHere(p.id, L.fix[Math.min(n, 1)]), wait(L.stall * .4)];
  if (typeof goOff === 'function' && goOff(p, route(p, stand[0], stand[1]).concat(faceObj(o), fix))) {
    if (typeof winFlash === 'function' && typeof inPack === 'function' && inPack()) winFlash(`${NAMES[p.id]} stalled`);
  }
  if (wrenHere && Math.random() < .5) { const l = freshOf(rotate(WREN_ACT, ACT.wi = (ACT.wi || 0) + 1)); if (l) say('w', l); }
  if (typeof suspicious === 'function') suspicious(); else checkHeat();
  ACT.done = (ACT.done || 0) + 1;
}
function actSound(kind, o) {
  const f = Audio2.fx;
  if (kind === 'door') { HOUSE.want(DOOR_ID[o.room + '/' + o.name], .45); setTimeout(() => f.door(), 420); f.creak(); }
  else if (kind === 'tap') { f.water(); setTimeout(() => f.water(), 1000); }
  else if (kind === 'kettle') { f.pipe(); setTimeout(() => f.ding(), 500); }
  else if (kind === 'radiator') { f.pipe(); f.bump(); setTimeout(() => f.bump(), 220); }
  else if (kind === 'phone') { f.phone(); }
  else if (kind === 'books') { setTimeout(() => f.bump(), 250); setTimeout(() => f.flop(), 450); }
  else if (kind === 'lamp') { f.click(); setTimeout(() => f.click(), 300); setTimeout(() => f.click(), 700); }
  else if (kind === 'radio') { f.word(); f.click(); }
  else if (kind === 'breath') { f.breath(); }
  else if (kind === 'rumble') { f.settle(); f.bump(); }
  else { f.creak(); }
}

// ---- Introducing it: Wednesday morning, one thing first ----
function actIntro(dt) {
  if (!S.scene || S.scene.locked || S.scene.teach) return;
  // After the tap: once whoever went to it has had their say, Wren tells you the rest. Game time, so it stays in this scene.
  if (ACT.after !== undefined && ACT.after !== null) {
    if (S.scene.id !== 'pack') { ACT.after = null; $('tip').innerHTML = ''; $('tip').style.fontSize = ''; }
    else if (!S.sub && !S.subs.length && (ACT.after += dt) > 1.2) {
      ACT.after = null;
      if (isHere(W)) S.subs.push({ who: 'w', text: 'You can do that to anything.', dur: 2.4, reply: true }, { who: 'w', text: 'Not too much, though. Mom notices.', dur: 2.8, reply: true });
      $('tip').innerHTML = 'Press and hold on anything to make it move. Each thing works twice a day.';
      ACT.tipT = 9;
    }
  }
  if (ACT.tipT > 0 && (ACT.tipT -= dt) <= 0) { $('tip').innerHTML = ''; $('tip').style.fontSize = ''; }
  // Anywhere after Wednesday morning (or jumped straight into), everything already moves.
  if (ACT.open !== 'all' && S.scene.id !== 'pack' && S.scene.day && !S.scene.prologue) { ACT.open = 'all'; return; }
  if (S.scene.id !== 'pack' || ACT.open === 'all' || typeof PS === 'undefined' || !PS.openerDone) return;
  ACT.t = (ACT.t || 0) + dt;
  if (ACT.open === 'none') {
    if (ACT.t < 12 || S.room !== 'kitchen' || !isHere(W) || S.sub || S.subs.length) return;
    ACT.open = 'tap';
    S.subs.push({ who: 'w', text: 'Mom hates it when the tap runs.', dur: 2.6, reply: true }, { who: 'w', text: 'Can you do the tap? Push on it.', dur: 2.6, reply: true });
    $('tip').style.fontSize = '22px';
    $('tip').innerHTML = 'Press and hold on <b>the sink</b>.';
    ACT.introT = 0;
  } else if (ACT.open === 'tap') {
    ACT.introT += dt;
    if (ACT.done) { ACT.open = 'all'; ACT.after = 0; }
    else if (ACT.introT > 45) {
      // Never got round to it. Open it all anyway, quietly.
      ACT.open = 'all'; $('tip').innerHTML = ''; $('tip').style.fontSize = '';
    }
  }
}

// Every frame, after the day's own business.
const _runTracksA = runTracks;
runTracks = dt => { _runTracksA(dt); tickActs(dt); };
