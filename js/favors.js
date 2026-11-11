// Wren's favors. She asks the house for small things, one at a time, across the week. Each one uses something you already know how to do.
// Doing them builds her trust, shown as hearts by the map, and she starts helping:
//   1 heart: she hides the good tape, so Dell packs slower on Thursday.
//   3 hearts: she sits on her own boxes, so they stay out of the truck (they count toward the endings).
//   4 hearts: on Friday, at the door, she speaks up for the house before she asks.
// A favor you don't get to just lapses. She's not cross about it.

const FAVORS = [
  // Wednesday morning: the tap. This is how the house learns it can move things (actions.js asks; this just counts it).
  { id: 'tap', scene: 'pack', ask: null, want: 'Do the tap', done: e => e.act && e.o.name === 'the sink' && e.o.room === 'kitchen',
    thanks: [['w', 'Ha! Thank you.']] },
  // Wednesday afternoon, in her room.
  { id: 'lamp', scene: 'wed_wren', after: 5, room: 'wren',
    ask: [['w', 'Can you blink my lamp? So I know you are here.']], want: 'Blink her lamp',
    done: e => e.act && e.kind === 'lamp' && e.o.room === 'wren', thanks: [['w', 'Hi! I knew it.'], ['w', 'That is our signal now.']] },
  // Thursday: whispering. First the phone, then a voice.
  { id: 'phone', scene: 'thu_pack', after: 22, ask: [['w', 'Psst. Ring the phone in the kitchen.'], ['w', 'Mom thinks it will be Dr. Feld. She will run.']], want: 'Ring the kitchen phone',
    done: e => e.act && e.kind === 'phone', thanks: [['w', 'I heard it ring! All the way up here.'], ['w', 'Okay. I am going to help you now. Watch.']] },
  { id: 'voice', scene: 'thu_pack', after: 20, ask: [['w', 'Do Dad. Make Mom go and look for him.']], want: "Fool Mom with Dad's voice",
    done: e => e.voice === 'd', thanks: [['w', 'You sounded exactly like him.']] },
  // Friday morning: Gary.
  { id: 'gary', scene: 'fri_morning', after: 14, ask: [['w', 'Make Gary think there is a ghost.']], want: 'Spook Gary',
    done: e => e.act && isHere(GARY), thanks: [['w', 'He jumped! Did you see him jump?']] },
];
const FAV = { i: 0, cur: null, t: 0, trust: 0, done: {}, told: {} };
const FAVOR_TIME = 100;

// ---- The line by the map ----
const favEl = document.createElement('div');
favEl.id = 'favor';
Object.assign(favEl.style, { position: 'absolute', right: '14px', top: '252px', width: '236px', textAlign: 'right', pointerEvents: 'none', display: 'none', font: 'italic 14px Georgia, serif', lineHeight: '1.4', color: 'rgba(255,240,205,.92)', textShadow: '0 1px 2px #000, 0 0 8px rgba(0,0,0,.8)' });
$('map').parentNode.appendChild(favEl);
let favKey = '';
function drawFavor() {
  const show = $('map').style.display !== 'none' && (FAV.cur || FAV.trust > 0);
  favEl.style.display = show ? 'block' : 'none';
  if (!show) return;
  const hearts = FAV.trust ? `<span style="color:${MAP.COL.w};font-style:normal;letter-spacing:2px">${'♥'.repeat(FAV.trust)}<span style="opacity:.35">${'♥'.repeat(Math.max(0, 5 - FAV.trust))}</span></span>` : '';
  const key = (FAV.cur ? FAV.cur.id : '') + FAV.trust;
  if (key === favKey) return;
  favKey = key;
  favEl.innerHTML = (FAV.trust ? `Wren ${hearts}` : '') + (FAV.cur ? `<br><span style="color:${MAP.COL.w}">Wren asks:</span> ${FAV.cur.want}` : '');
}
// The flashes go below it now.
if (typeof winFlash === 'function') {
  const _wf = winFlash;
  winFlash = text => { _wf(text); const el = [...document.querySelectorAll('.winflash')].pop(); if (el) el.style.top = (parseInt(el.style.top) + 52) + 'px'; };
}

// ---- Asking ----
function favorLines(lines) { lines.forEach(([who, text]) => S.subs.push({ who, text, dur: dur(text) + .2, reply: true })); if (W) W.talk = 2; }
function tickFavors(dt) {
  drawFavor();
  const sc = S.scene;
  if (!sc || S.card || S.paused > 0 || S.finished) return;
  // A favor only lives in its own scene.
  if (FAV.cur && FAV.cur.scene !== sc.id) { FAV.cur = null; }
  if (FAV.cur) {
    FAV.t += dt;
    if (FAV.t > FAVOR_TIME) { if (isHere(W)) favorLines([['w', 'You were busy. That is okay.']]); FAV.cur = null; }
    return;
  }
  // The tap is asked by actions.js on Wednesday morning; pick it up when it is.
  if (sc.id === 'pack' && !FAV.done.tap && typeof ACT !== 'undefined' && ACT.open === 'tap') { FAV.cur = FAVORS[0]; FAV.t = 0; return; }
  const next = FAVORS.find(f => f.ask && f.scene === sc.id && !FAV.done[f.id] && !FAV.told[f.id]);
  if (!next) return;
  FAV.wait = (FAV.wait || 0) + dt;
  if (FAV.wait < next.after || !isHere(W) || W.held || W.lie || (next.room && S.room !== next.room) || S.sub || S.subs.length) return;
  if (typeof PS !== 'undefined' && sc.pack && !PS.openerDone) return;
  FAV.wait = 0; FAV.told[next.id] = true; FAV.cur = next; FAV.t = 0;
  favorLines(next.ask);
}
// ---- Doing them ----
function favorEvent(e) {
  const f = FAV.cur;
  if (!f || FAV.done[f.id] || !f.done(e)) return;
  FAV.done[f.id] = true; FAV.cur = null;
  const before = FAV.trust;
  FAV.trust++;
  // She says thank you when you're next with her, if she isn't here now.
  FAV.pending = (FAV.pending || []).concat(f.thanks);
  if (before < 3 && FAV.trust >= 3) FAV.pending.push(['w', 'I am going to sit on my boxes.'], ['w', 'They cannot put them on the truck if I am sitting on them.']);
  W.hop = .7; W.attn = 5;
  if (typeof winFlash === 'function') { winFlash('♥ Wren trusts you more'); if (before < 3 && FAV.trust >= 3) winFlash('Wren keeps her boxes'); }
  Audio2.fx.word && Audio2.fx.word();
}
function tickThanks() {
  if (!FAV.pending || !FAV.pending.length || !isHere(W) || W.held || W.lie || S.sub || S.subs.length) return;
  favorLines(FAV.pending); FAV.pending = [];
}
const _actOnF = actOn;
// When a move completes her favor, she thanks you instead of the usual "Again!".
actOn = o => { const e = { act: true, o, kind: actKind(o) }; ACT.quietWren = !!(FAV.cur && FAV.cur.done(e)); _actOnF(o); ACT.quietWren = false; favorEvent(e); };
const _impersonateF = impersonate;
impersonate = (v, text, o) => { const t0 = PS.voiceT; const r = _impersonateF(v, text, o); if (PS.voiceT !== t0) favorEvent({ voice: v }); return r; };

// ---- What her trust does ----
// One heart: the good tape goes missing on Thursday. Dell packs at three quarters speed, and says so.
const _workF = work;
work = (w, dt) => _workF(w, w.p === D && FAV.trust >= 1 && S.scene && S.scene.id === 'thu_pack' ? dt * .75 : dt);
{
  const thuOpener = THU.opener;
  const at = thuOpener.findIndex(l => l[1] === 'Not me.');
  if (at >= 0) thuOpener.splice(at + 1, 0, ['d', 'And the good tape. I had the good tape.', { tape: true }], ['cap', 'Wren does not look up. She is sitting very still.', { tape: true }]);
  // The opener plays every line; drop the tape ones if she isn't helping yet.
  const _startPackF = startPack;
  startPack = () => { if (cfg() === THU && FAV.trust < 1) THU.opener = thuOpener.filter(l => !(l[2] && l[2].tape)); else if (cfg() === THU) THU.opener = thuOpener; _startPackF(); };
}
// Three hearts: her own boxes stay off the truck. They count as still out.
const WREN_BOXES = 2;
const _boxesLeftF = boxesLeft;
boxesLeft = () => _boxesLeftF() + (FAV.trust >= 3 && !params.get('band') ? WREN_BOXES : 0);
// Four hearts: at the door on Friday, she speaks up for it first.
{
  const fe = DAY3_SCENES.find(s => s.id === 'fri_evening');
  const lines = fe && fe.tracks[0].lines, at = lines ? lines.findIndex(l => l[1] === 'Do you want us to go?') : -1;
  if (at >= 0) lines.splice(at, 0,
    ['w', 'It did everything I asked. All week.', { if: () => FAV.trust >= 4 }],
    // Only the things it really did, the two she liked best.
    ['w', () => [['gary', 'It made Gary jump.'], ['lamp', 'It blinked my lamp.'], ['voice', 'It did Dad.'], ['phone', 'It rang the phone for me.'], ['tap', 'It did the tap.']].filter(([id]) => FAV.done[id]).slice(0, 2).map(x => x[1]).join(' '), { if: () => FAV.trust >= 4 }],
    ['m', 'Wren.', { if: () => FAV.trust >= 4 }],
    ['w', 'It should get to say.', { if: () => FAV.trust >= 4 }]);
}

const _runTracksF = runTracks;
runTracks = dt => { _runTracksF(dt); tickFavors(dt); if (S.scene && !S.card && !(S.paused > 0)) tickThanks(); };
