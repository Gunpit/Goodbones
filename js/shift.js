// The unpacking shift. After the talk in bed on Wednesday and Thursday nights, everyone's asleep and the taped boxes are in the hall.
// Press and hold on the boxes to work one open. That makes noise. Noise carries upstairs, and the map shows who's stirring.
// Every so often the furnace kicks on, and nobody can hear anything over it. That's when to work.
// Each box you open is one fewer packed: the same count the tally, Friday's pile and the endings use.
// Wake someone and they come down, tape it back up, and the next day starts with Marion on edge.
// With two of Wren's hearts, say her name and she sneaks down to help.

const SH_NIGHTS = { night: 'WED', thu_night: 'THU' };
const SH = { on: false, done: {}, opened: {}, caught: {}, first: true };
const SH_LEN = 75, SH_MAX = 3, SH_WORK = .22;
const SH_PILE = [1.3, .45, .95]; // the middle of the hall's stack of boxes
const SH_STAND = [.72, .95];
// Down the stairs the way the prologue brings Dell down: the stairs are a straight walk, not a route.
// Whoever comes down stays by the boxes until morning, not wandering back to bed mid-scene.
const stayHere = p => { p.home = { x: SH_STAND[0], z: SH_STAND[1], yaw: Math.PI / 2 }; p.jobWander = false; p.dest = null; };
const downStairs = () => [{ t: 'walk', x: -1.2, z: .1 }, { t: 'walk', x: -.42, z: .42 }, { t: 'walk', x: SH_STAND[0], z: SH_STAND[1] }, doIt(q => { q.faceYaw = Math.PI / 2; })];

// ---- Starting and ending the night ----
const _startSceneSH = startScene;
startScene = i => {
  const sc = S.scene;
  if (sc && SH_NIGHTS[sc.id] && !SH.done[sc.id] && i === S.sceneI + 1 && alive()) {
    if (!SH.on) beginShift(i);
    return;
  }
  _startSceneSH(i);
};
function beginShift(next) {
  const id = S.scene.id;
  SH.on = true; SH.id = id; SH.next = next; SH.t = 0; SH.noise = 0; SH.prog = 0; SH.working = false; SH.n = 0;
  SH.wake = { m: 0, d: 0 }; SH.stir = { m: false, d: false }; SH.coming = null; SH.wren = null;
  SH.furnace = 0; SH.furnaceIn = 9; SH.told = {}; SH.ended = false;
  S.subs = []; S.sub = null;
  showCard('', 'Later.');
  S.paused = 99;
  setTimeout(() => {
    SH.going = true; goRoom('hallway', true); SH.going = false;
    S.boxesNow = Math.min(8, PS.pile); setBoxes();
    Render.setView({ dim: .6, tint: [.8, .88, 1.14] }); // two in the morning
    S.paused = 0;
    hideCard();
    SH.max = Math.min(SH_MAX, PS.pile);
    // Nothing got packed today: nothing to undo.
    if (!SH.max) { endShift('The hall is empty. There is nothing to undo tonight.'); return; }
    const lines = SH.first
      ? [['cap', 'Two in the morning. Everybody is asleep.'], ['cap', 'The boxes they packed are in the hall.']]
      : [['cap', 'Two in the morning. Everybody is asleep.']];
    lines.forEach(([who, text]) => S.subs.push({ who, text, dur: dur(text) }));
    const wrenCan = typeof FAV !== 'undefined' && FAV.trust >= 2;
    SH.tipNext = SH.first ? 'Press and hold on <b>the boxes</b> to work one open.'
      : 'Work the boxes while the furnace is on.' + (wrenCan ? ' Say <b>Wren</b>, and she will come and help.' : '');
  }, params.has('fast') ? 30 : 1500);
}
function endShift(line) {
  if (SH.ended) return;
  SH.ended = true; SH.working = false;
  tipHtml('');
  if (line) S.subs.push({ who: 'cap', text: line, dur: dur(line) });
  SH.endT = 3;
}
function finishShift() {
  SH.on = false; SH.done[SH.id] = true; SH.first = false;
  if (typeof fxg !== 'undefined') fxg.clearRect(0, 0, 1280, 720);
  Render.setView({ dim: 1, tint: [1, 1, 1] });
  // The next scene puts everyone back where the morning finds them.
  startScene(SH.next);
}
const tipHtml = h => { $('tip').innerHTML = h; $('tip').style.fontSize = h ? '22px' : ''; };

// ---- Every frame of it ----
const pileAt = () => Render.project(SH_PILE);
function overPile() { const p = pileAt(); return Math.hypot(S.cursor.x - p.x, S.cursor.y - p.y) < 95; }
$('stage').addEventListener('mousedown', () => { if (SH.on && !SH.ended && !S.card && S.paused <= 0 && overPile() && !SH.coming) SH.working = true; });
addEventListener('mouseup', () => { SH.working = false; });
function tickShift(dt) {
  if (S.paused > 0 || S.card) { if (S.paused > 0) S.paused -= dt; if (typeof fxg !== 'undefined') fxg.clearRect(0, 0, 1280, 720); return; }
  if (SH.ended) { if (!S.sub && !S.subs.length && (SH.endT -= dt) <= 0) finishShift(); drawShift(dt); return; }
  SH.t += dt;
  if (SH.tipNext && !S.sub && !S.subs.length) { tipHtml(SH.tipNext); SH.tipNext = null; }
  // The furnace: on for a few seconds every so often. Nobody hears anything over it.
  if (SH.furnace > 0) { SH.furnace -= dt; if (SH.furnace <= 0) { SH.furnaceIn = 12 + Math.random() * 7; if (!SH.told.off && SH.first) { SH.told.off = true; } } }
  else if ((SH.furnaceIn -= dt) <= 0) {
    SH.furnace = 5;
    Audio2.fx.walls && Audio2.fx.walls();
    if (!SH.told.furnace) { SH.told.furnace = true; S.subs.push({ who: 'cap', text: 'The furnace kicks on.', dur: 1.8 }); if (SH.first) SH.tipNext = 'Nobody can hear you over the furnace. <b>Now.</b>'; }
  }
  if (SH.furnace > 0 && Math.random() < dt * 2) Audio2.fx.engine && Audio2.fx.engine();
  const cover = SH.furnace > 0;
  // A box popping open: a moment, then it's gone.
  if (SH.popT > 0 && (SH.popT -= dt) <= 0) finishOpen();
  // Working the boxes.
  if (SH.working && !overPile()) SH.working = false;
  if (SH.working) {
    if (!(SH.popT > 0)) SH.prog += SH_WORK * dt;
    SH.noise = Math.min(1, SH.noise + 1.4 * dt);
    if (Math.random() < dt * 5) (Math.random() < .5 ? Audio2.fx.creak : Audio2.fx.flop)();
    if (!SH.told.noise && SH.first && !cover) { SH.told.noise = true; tipHtml('It makes noise. Watch the bedroom on the map.'); }
    if (SH.prog >= 1) openBox();
  } else SH.noise = Math.max(0, SH.noise - .9 * dt);
  // Wren, if she came down, works on it too. She is very quiet about it.
  if (SH.wren === 'working') { if (!(SH.popT > 0)) SH.prog += SH_WORK * .55 * dt; W.reachWant = .8; if (SH.prog >= 1) openBox(); }
  // Noise carries upstairs, unless the furnace is on.
  const heard = cover ? 0 : SH.noise;
  for (const [id, rate] of [['m', 1.15], ['d', .85]]) {
    SH.wake[id] = Math.max(0, Math.min(1, SH.wake[id] + (heard * rate * .2 - .025) * dt));
    if (SH.wake[id] > .55 && !SH.stir[id]) { SH.stir[id] = true; S.subs.push({ who: 'cap', text: id === 'm' ? 'Upstairs, Marion turns over.' : 'Upstairs, Dell says something in his sleep.', dur: 2.2 }); Audio2.fx.creak(); }
    if (SH.wake[id] < .3) SH.stir[id] = false;
    if (SH.wake[id] >= 1 && !SH.coming) comeDown(personById(id));
  }
  if (SH.t > SH_LEN && !SH.coming) endShift('The sky starts to go grey.');
  drawShift(dt);
}
// The tape snaps and the flaps pop first. The box goes a moment later (finishOpen).
function openBox() {
  if (SH.popT > 0) return;
  SH.prog = 0; SH.popT = .6; SH.popBox = topBox();
  Audio2.fx.snap();
  const b = SH.popBox, p = b ? Render.project([b.position.x, b.position.y + .22, b.position.z]) : pileAt();
  SHP.push({ k: 'tape', x: p.x, y: p.y, vx: -70, vy: -160, rot: 0, vr: -9, t: 0, life: .9 });
  SHP.push({ k: 'flaps', x: p.x, y: p.y, t: 0, life: .7 });
  for (let i = 0; i < 10; i++) PARTS.push({ k: 'dust', x: p.x + (Math.random() - .5) * 60, y: p.y, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 40, t: 0, life: 1.2, d: 0 });
}
function finishOpen() {
  SH.popBox = null;
  SH.n++;
  PS.pile = Math.max(0, PS.pile - 1);
  SH.opened[SH.id] = (SH.opened[SH.id] || 0) + 1;
  S.boxesNow = Math.max(0, S.boxesNow - 1); setBoxes();
  Audio2.fx.flop();
  if (typeof spawn === 'function') spawn('books', { at: { x: SH_PILE[0], y: SH_PILE[1] + .2, z: SH_PILE[2] } });
  if (typeof winFlash === 'function') winFlash('Box opened');
  if (SH.n === 1) S.subs.push({ who: 'cap', text: SH.first ? 'The tape gives. The flaps lift. Everything inside is home again.' : 'The tape gives.', dur: 3 });
  if (SH.n >= SH.max) { SH.working = false; endShift('That is enough for one night. Any more and they would notice.'); }
}
// Woken: they come down to look. Whatever you were working on gets taped back up.
function comeDown(p) {
  SH.coming = p; SH.working = false; SH.shadowT = 1.6;
  S.subs.push({ who: 'cap', text: 'Footsteps on the stairs.', dur: 2 });
  Audio2.fx.creak(); setTimeout(() => Audio2.fx.creak(), 500);
  place(p, { room: 'hallway', x: -1.2, z: -2.0, yaw: 0 }); stayHere(p);
  p.root.visible = true;
  const opened = SH.n > 0;
  // The shadow crosses the light first; then they're on the stairs.
  p.gone = true;
  order(p, [wait(1.3), doIt(q => { q.gone = false; })].concat(downStairs(), wait(.8), doIt(() => say(p.id, p === M ? 'Hello?' : 'Buddy?')), wait(1.6),
    doIt(q => { q.reachWant = 1; SH.prog = 0; if (opened) { PS.pile++; SH.opened[SH.id]--; S.boxesNow++; setBoxes(); } }), wait(1.6),
    doIt(q => { q.reachWant = 0; say(p.id, opened ? (p === M ? 'I taped that. I know I taped that.' : 'Huh. Must not have taped it.') : (p === M ? 'Nothing. It is nothing.' : 'Old house.')); }), wait(2),
    doIt(() => { SH.caught[SH.id] = p.id; endShift(p === M ? 'Marion stands in the hall for a long time before she goes back up.' : 'Dell goes back up. The stairs creak the whole way.'); })));
}
// Two hearts: say her name, and she comes down to help.
function callWren() {
  if (SH.wren || !(typeof FAV !== 'undefined' && FAV.trust >= 2)) return false;
  SH.wren = 'coming';
  place(W, { room: 'hallway', x: -1.2, z: -2.0, yaw: 0 }); stayHere(W);
  W.root.visible = true;
  order(W, downStairs().concat(doIt(() => { say('w', 'Shh. I will do this side.'); SH.wren = 'working'; })));
  return true;
}

// ---- Talking, at night ----
// Words are noise too. Her name is the only one that does anything.
const _reactSH = react;
react = () => {
  if (!SH.on) return _reactSH();
  const text = S.typed; S.typed = '';
  if (!text.trim()) return;
  SH.noise = Math.min(1, SH.noise + .12 * text.replace(/\s/g, '').length);
  if (heardWords(text).includes(squeeze('wren')) && S.known[squeeze('wren')]) {
    if (!callWren() && !SH.wren) S.subs.push({ who: 'cap', text: 'Wren does not wake up. Not for that.', dur: 2.2 });
  }
};
// No wandering off in the middle of it, and no moving other things.
const _nextRoomSH = nextRoom, _goRoomSH = goRoom, _canActSH = canActNow;
nextRoom = () => { if (!SH.on) _nextRoomSH(); };
goRoom = (room, quiet) => { if (SH.on && !SH.going) return; _goRoomSH(room, quiet); };
canActNow = () => !SH.on && _canActSH();
const _runTracksSH = runTracks;
runTracks = dt => {
  if (SH.on) return tickShift(dt);
  _runTracksSH(dt);
  // Caught on Wednesday night: Marion is on edge all Thursday. Suspicion fades half as fast.
  if (SH.caught.night && S.scene && S.scene.id === 'thu_pack' && S.heat > 0) S.heat += dt / 18;
};

// ---- What it looks like ----
// The hall's boxes are real 3D boxes. The top one rocks and shudders while you work it, harder as it gives.
const SHP = [];
const isPileBox = m => m.isMesh && m.geometry && m.geometry.parameters && m.geometry.parameters.width === .56 && m.geometry.parameters.depth === .46;
const pileBoxes = () => Render.scene().children.filter(m => isPileBox(m) && m.visible);
// The box you're working is the one inside the ring.
function topBox() {
  const c = pileAt();
  let best = null, bd = 1e9;
  pileBoxes().forEach(m => { const p = Render.project([m.position.x, m.position.y + .1, m.position.z]), d = Math.hypot(p.x - c.x, p.y - c.y); if (d < bd) { bd = d; best = m; } });
  return best;
}
// Our wobble is added on top of where the game put the box; take it back off before moving it again.
function unwobble(m) { const u = m.userData; if (u.dy) m.position.y -= u.dy; if (u.drz) m.rotation.z -= u.drz; if (u.drx) m.rotation.x -= u.drx; if (u.sy) m.scale.y = 1; u.dy = u.drz = u.drx = u.sy = 0; }
const _setBoxesSH = setBoxes;
setBoxes = () => { Render.scene().children.filter(isPileBox).forEach(m => { m.userData.dy = m.userData.drz = m.userData.drx = m.userData.sy = 0; m.scale.y = 1; }); _setBoxesSH(); };
let dustT = 0;
function rockBoxes(dt) {
  const list = pileBoxes(), top = SH.popBox || topBox();
  const workingNow = (SH.working || SH.wren === 'working') && !SH.ended;
  const k = workingNow ? .3 + SH.prog * .9 : 0, t = SH.t;
  list.forEach(m => {
    unwobble(m);
    const u = m.userData, w = m === top ? k : k * .25;
    if (SH.popT > 0 && m === SH.popBox) {
      // Popping: it jumps and stretches as the flaps go.
      const q = 1 - SH.popT / .6;
      u.dy = Math.sin(q * Math.PI) * .14; u.sy = 1 + Math.sin(q * Math.PI) * .12; m.scale.y = u.sy;
    } else if (w > 0) {
      u.drz = Math.sin(t * 38 + m.id) * .07 * w; u.drx = Math.sin(t * 27 + 1 + m.id) * .045 * w; u.dy = Math.abs(Math.sin(t * 19 + m.id)) * .035 * w;
    }
    m.position.y += u.dy || 0; m.rotation.z += u.drz || 0; m.rotation.x += u.drx || 0;
  });
  // Dust shaken out of the top box.
  if (workingNow && top && (dustT -= dt) <= 0) {
    dustT = .12;
    const p = Render.project([top.position.x, top.position.y + .2, top.position.z]);
    PARTS.push({ k: 'dust', x: p.x + (Math.random() - .5) * 50, y: p.y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 40, vy: -12 - Math.random() * 22, t: 0, life: 1.1, d: 0 });
  }
}
// Upstairs, a strip of light spills down the top of the stairs when someone stirs. A shadow crosses it before they come.
const LANDING = { x: 512, y: 146 };
function drawLanding(g) {
  const wake = Math.max(SH.wake.m || 0, SH.wake.d || 0), coming = SH.shadowT > 0;
  if (wake < .12 && !coming) return;
  const a = coming ? .85 : Math.min(.8, (wake - .12) * 1.1) * (.9 + .1 * Math.sin(SH.t * 7));
  const { x, y } = LANDING;
  const gr = g.createLinearGradient(0, y - 6, 0, y + 110);
  gr.addColorStop(0, `rgba(255,214,140,${a})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(x - 46, y - 6); g.lineTo(x + 46, y - 6); g.lineTo(x + 78, y + 110); g.lineTo(x - 70, y + 110); g.closePath(); g.fill();
  g.fillStyle = `rgba(255,232,180,${a})`; g.fillRect(x - 46, y - 8, 92, 4);
  if (coming) {
    const q = 1 - SH.shadowT / 1.6, sx = x - 60 + q * 120;
    const sg = g.createRadialGradient(sx, y + 40, 4, sx, y + 40, 46);
    sg.addColorStop(0, 'rgba(10,6,2,.75)'); sg.addColorStop(1, 'rgba(10,6,2,0)');
    g.fillStyle = sg; g.beginPath(); g.ellipse(sx, y + 40, 30, 66, 0, 0, 7); g.fill();
  }
}
function drawShift(dt) {
  if (typeof drawFx === 'function') drawFx(dt); // the effects layer, cleared and redrawn
  rockBoxes(dt);
  if (SH.shadowT > 0) SH.shadowT -= dt;
  const g = fxg, p = pileAt();
  drawLanding(g);
  // Too loud, with nothing to cover it: the edges of the room close in.
  const loud = SH.furnace > 0 ? 0 : Math.max(0, (SH.noise - .3) / .7);
  if (loud > 0) {
    const vg = g.createRadialGradient(640, 360, 260, 640, 360, 760);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(20,6,0,${.55 * loud})`);
    g.fillStyle = vg; g.fillRect(0, 0, 1280, 720);
  }
  // The tape and the flaps.
  for (let i = SHP.length - 1; i >= 0; i--) {
    const q = SHP[i]; q.t += dt;
    if (q.t > q.life) { SHP.splice(i, 1); continue; }
    const a = 1 - q.t / q.life;
    if (q.k === 'tape') {
      q.vy += 420 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
      g.save(); g.translate(q.x, q.y); g.rotate(q.rot); g.globalAlpha = a; g.fillStyle = '#e8d9a8'; g.fillRect(-26, -4, 52, 8); g.restore();
    } else if (q.k === 'flaps') {
      // Two cardboard flaps swinging up and out from the top of the box.
      const open = Math.min(1, q.t / .22) * .85;
      g.globalAlpha = a; g.fillStyle = '#c4935a'; g.strokeStyle = '#5e4020'; g.lineWidth = 2.5;
      for (const s of [-1, 1]) {
        g.save(); g.translate(q.x + s * 3, q.y); g.rotate(-s * open); g.beginPath(); g.rect(s > 0 ? 0 : -54, -16, 54, 16); g.fill(); g.stroke(); g.restore();
      }
      g.globalAlpha = 1;
    }
  }
  // The pile: a ring that fills as you work it, gold, or grey when someone's coming.
  g.lineWidth = 5; g.strokeStyle = 'rgba(255,226,160,.22)'; g.beginPath(); g.arc(p.x, p.y, 44, 0, 7); g.stroke();
  g.strokeStyle = SH.coming ? 'rgba(180,170,160,.6)' : 'rgba(255,214,120,.95)'; g.beginPath(); g.arc(p.x, p.y, 44, -Math.PI / 2, -Math.PI / 2 + SH.prog * Math.PI * 2); g.stroke();
  g.font = 'italic 17px Georgia, serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,240,205,.85)'; g.fillText(`the boxes  ${SH.n}/${SH.max}`, p.x, p.y + 66);
  // Noise, going out from the pile.
  // Soft white when it's fine; sharp amber when it would carry upstairs.
  if (SH.noise > .02) {
    const c = loud > 0 ? [255, Math.round(240 - 90 * loud), Math.round(205 - 170 * loud)] : [255, 240, 205];
    for (let i = 0; i < 3; i++) { const k = ((SH.t * 1.4 + i / 3) % 1); g.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${SH.noise * (.5 + .4 * loud) * (1 - k)})`; g.lineWidth = 2 + loud * 2; g.beginPath(); g.arc(p.x, p.y, 50 + k * 120, -Math.PI * .85, -Math.PI * .15); g.stroke(); }
  }
  // The clock, and the furnace.
  const mins = Math.min(SH_LEN, SH.t) / SH_LEN * 210, h = 2 + Math.floor(mins / 60), m = Math.floor(mins % 60);
  g.textAlign = 'left'; g.font = 'italic 20px Georgia, serif'; g.fillStyle = 'rgba(255,240,205,.85)';
  g.fillText(`${h}:${String(m).padStart(2, '0')} a.m.`, 26, 44);
  if (SH.furnace > 0) {
    g.fillStyle = `rgba(255,170,90,${.55 + .25 * Math.sin(SH.t * 9)})`; g.fillText('the furnace is on', 26, 72);
    const gr = g.createRadialGradient(640, 760, 40, 640, 760, 700); gr.addColorStop(0, 'rgba(255,140,60,.16)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1280, 720);
  }
  g.textAlign = 'start';
}
// Who's stirring, drawn on the map around their dots in the bedroom.
const _drawMapSH = drawMap;
drawMap = dt => {
  _drawMapSH(dt);
  if (!SH.on || $('map').style.display === 'none') return;
  const g = $('map').getContext('2d'), r = MAP.rooms.bedroom;
  if (!r) return;
  [['m', -1.0], ['d', -.2]].forEach(([id, x]) => {
    const w = SH.wake[id] || 0, px = r.x + clamp(x / r.W + .5, .08, .92) * r.w, py = r.y + clamp(-.1 / r.D + .5, .08, .92) * r.h;
    g.fillStyle = MAP.COL[id]; g.beginPath(); g.arc(px, py, 3.6, 0, 7); g.fill();
    g.strokeStyle = w > .75 ? 'rgba(255,90,70,.95)' : w > .4 ? 'rgba(255,200,90,.9)' : 'rgba(255,240,205,.5)'; g.lineWidth = 2;
    g.beginPath(); g.arc(px, py, 6 + w * 8, -Math.PI / 2, -Math.PI / 2 + Math.max(.05, w) * Math.PI * 2); g.stroke();
  });
};

// ---- The morning after ----
// Thursday: what they find in the hall, and whether anyone heard.
const _startPackSH = startPack;
startPack = () => {
  _startPackSH();
  if (cfg() !== THU) return;
  const lines = [];
  if (SH.opened.night > 0) lines.push(['d', 'Did I not tape this one?'], ['m', 'You taped it. I watched you.']);
  if (SH.caught.night === 'm') lines.push(['m', 'Somebody was in the hall last night.'], ['d', 'The house settling, hon.'], ['m', 'I was standing in it, Dell.']);
  if (SH.caught.night === 'd') lines.push(['d', 'I heard something in the hall last night.'], ['m', 'Write it down.']);
  if (SH.caught.night) S.heat = 3;
  if (lines.length) THU.opener = lines.concat(THU.opener);
};
// Friday: Gary notices before anybody else does.
{
  const fam = DAY3_SCENES.find(s => s.id === 'fri_morning'), hall = fam && fam.tracks.find(t => t.room === 'hallway');
  // Nobody is "ready" if the boxes were got at in the night.
  if (hall) hall.lines.forEach(l => { if (l[1] === 'Well. You folks are ready.' || l[1] === 'We are ready.') { const o = l[2] = l[2] || {}, was = o.if; o.if = () => (!was || was()) && !(SH.opened.thu_night > 0); } });
  const at = hall ? hall.lines.findIndex(l => l[1] === 'It is a small town.') + 1 : 0;
  if (at > 0) hall.lines.splice(at, 0,
    ['g', 'Some of these are open, folks.', { if: () => SH.opened.thu_night > 0 }],
    ['m', 'I taped those. Last night. I taped them myself.', { if: () => SH.opened.thu_night > 0 }],
    ['d', 'Somebody was up at three.', { if: () => !!SH.caught.thu_night }],
    ['m', 'It was not somebody, Dell.', { if: () => !!SH.caught.thu_night }]);
}
