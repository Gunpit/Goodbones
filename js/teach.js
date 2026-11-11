// Wren teaches the house to talk. Straight after GOOD BONES, in her room, by the vent.
// The house doesn't know any words yet, so she doesn't listen for words. She listens to how it sounds:
// how many sounds, how long one was held, whether the pitch went down or up. Mashing keys to fake talking is the point.
// The last two lessons are the rules of the game: you can only say what you've heard, and Tab goes to another room.
// Each lesson moves on when it's done. If it isn't, she gives it a go herself and moves on anyway. Nobody gets stuck here.

// ---- Listening to the shape of it ----
// One utterance: from the first key to when react() takes it.
const U = { keys: 0, holdMax: 0, up: false, down: false, at: {} };
function resetU() { U.keys = 0; U.holdMax = 0; U.up = false; U.down = false; U.at = {}; }
const inTeach = () => S.scene && S.scene.teach && !S.card;
addEventListener('keydown', e => {
  if (!inTeach() || e.repeat) return;
  if (e.key === 'ArrowUp' && S.keyHeld) U.up = true;
  if (e.key === 'ArrowDown' && S.keyHeld) U.down = true;
  if (/^[a-z]$/i.test(e.key)) { U.keys++; U.at[e.key.toLowerCase()] = S.time; if (S.upHeld) U.up = true; if (S.downHeld) U.down = true; }
});
// An arrow let go without a single letter while it was down: she'll say so, once per lesson, if nothing else happens.
const arrowDownAt = {};
addEventListener('keydown', e => { if (inTeach() && !e.repeat && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) arrowDownAt[e.key] = U.keys; });
addEventListener('keyup', e => {
  if (!inTeach() || !(e.key === 'ArrowUp' || e.key === 'ArrowDown')) return;
  const L = LESSONS[T.i];
  if (L && L.arrow === e.key && T.phase === 'wait' && U.keys === arrowDownAt[e.key] && !T.arrowTold) { T.arrowTold = true; T.arrowOnly = .9; }
});
addEventListener('keyup', e => {
  const c = e.key.toLowerCase();
  if (!inTeach() || U.at[c] === undefined) return;
  U.holdMax = Math.max(U.holdMax, S.time - U.at[c]); delete U.at[c];
});

// ---- The lessons ----
const LESSONS = [
  { ask: [['w', 'You talked.'], ['w', 'You actually talked!'], ['w', 'Do it again. Say anything.']], tip: 'Type anything.',
    pass: () => U.keys >= 1, yes: [['w', 'Hi! That is your voice.']] },
  { ask: [['w', 'Can you make it longer?']], tip: 'Hold a key down.',
    pass: () => U.holdMax >= .8, no: ['Longer!', 'Hold it. Like aaaaaa.'], yes: [['w', 'Whoa.']] },
  { ask: [['w', 'Now talk like a person. Lots of sounds.']], tip: 'Type lots of letters. Hold some.',
    pass: () => U.keys >= 6, no: ['More! Like a whole sentence.', 'Like you are telling me a story.'], yes: [['w', 'That sounded like a whole sentence!']] },
  // Pitch is the one people miss: the arrow has to be held down the whole time you're typing. So she says it, the tip shows the keys,
  // and if you tap the arrow on its own she tells you to talk while you hold it.
  { ask: [['w', 'Do Dad. Dad is low.'], ['w', 'Hold the down arrow, and talk while you hold it.']], arrow: 'ArrowDown',
    tipHtml: 'Hold <kbd>↓</kbd> and type at the same time.',
    pass: () => U.down, no: ['That was you. Hold the down arrow while you talk.', 'Hold it down first. Then talk. Keep holding.'], yes: [['w', 'Ha! That is exactly Dad.']] },
  { ask: [['w', 'Now me! I am high.'], ['w', 'Hold the up arrow, and talk.']], arrow: 'ArrowUp',
    tipHtml: 'Hold <kbd>↑</kbd> and type at the same time.',
    pass: () => U.up, no: ['Higher! Hold the up arrow while you talk.', 'Hold it up first. Then talk. Keep holding.'],
    yes: [['w', 'That is me!'], ['w', 'If you sound like Dad, Mom will think it is Dad. She will go looking for him.']] },
  { ask: [['w', 'Okay. Listen.'], ['w', 'Stay.'], ['w', 'You say it.']], tip: 'Type: stay',
    pass: text => heardWords(text).includes(squeeze('stay')), no: ['Stay. S. T. A. Y.', 'You can only say it if you heard it. I said it. Stay.'],
    yes: [['w', 'You said it!'], ['w', 'You can only say words you hear, I think. So listen to everybody.']] },
  { ask: [['w', 'If they hear you say stay, they will have to.'], ['w', 'Go on. They are downstairs.']], tip: 'Tab goes to another room. Or click one on the map.', tab: true },
];
const T = { i: 0, phase: 'ask', t: 0, tries: 0 };
const GIVE_UP = 20;
function lessonLines(lines) { lines.forEach(([who, text]) => { S.subs.push({ who, text, dur: dur(text) + .2, reply: true }); }); W.talk = 2; }
// The lesson's lines go out on the next tick, once the card has lifted.
function startLesson(i) { T.i = i; T.phase = 'intro'; T.t = 0; T.tries = 0; T.nudged = false; T.arrowTold = false; T.arrowOnly = 0; tip(''); }
// Key caps for the tips.
{
  const css = document.createElement('style');
  css.textContent = '#tip kbd { display: inline-block; min-width: 1.5em; padding: 0 .35em; margin: 0 .1em; border: 1.5px solid rgba(255,240,205,.8); border-bottom-width: 3px; border-radius: 5px; font: bold 1.05em Georgia, serif; font-style: normal; line-height: 1.3; text-align: center; background: rgba(40,28,16,.55); }';
  document.head.appendChild(css);
}
function passLesson() {
  const L = LESSONS[T.i];
  tip('');
  if (L.yes) lessonLines(L.yes);
  W.hop = .7; W.attn = 4;
  T.phase = 'praise'; T.t = 0;
}
function tickTeach(dt) {
  if (S.paused > 0) { S.paused -= dt; return; }
  const L = LESSONS[T.i];
  if (!L) return;
  W.faceYaw = -Math.PI / 2;
  T.t += dt;
  const quiet = !S.sub && !S.subs.length;
  if (T.phase === 'intro') { if (!S.card && T.t > (T.i ? 0 : 1.2)) { lessonLines(L.ask); T.phase = 'ask'; } return; }
  // The lesson's control, bigger than the game's usual tips, while she's teaching.
  if (T.phase === 'ask' && quiet) { T.phase = 'wait'; T.t = 0; resetU(); $('tip').style.fontSize = '24px'; if (L.tipHtml) $('tip').innerHTML = L.tipHtml; else tip(L.tip); }
  else if (T.phase === 'wait') {
    // Tapped the arrow but didn't talk while holding it.
    if (L.arrow && T.arrowOnly > 0 && !S.keyHeld && !S.typed) { T.arrowOnly -= dt; if (T.arrowOnly <= 0 && quiet) { T.arrowOnly = 0; lessonLines([['w', 'Now talk while you hold it!']]); } }
    if (L.tab) {
      if (S.room !== 'wren') { tip(''); $('tip').style.fontSize = ''; startScene(S.sceneI + 1); }
      else if (T.t > GIVE_UP && !T.nudged) { T.nudged = true; lessonLines([['w', 'Downstairs! Go!']]); }
      return;
    }
    // Stuck: she gives it a go herself, and moves on.
    if (T.t > GIVE_UP && quiet && !S.keyHeld) { lessonLines([['w', T.i === 5 ? 'That is okay. You will hear it again.' : 'That is okay. You will get it.']]); T.phase = 'praise'; T.t = 0; }
  } else if (T.phase === 'praise' && quiet && T.t > .6) startLesson(T.i + 1);
}
function teachReact() {
  const text = S.typed; S.typed = '';
  if (!text.trim()) return;
  S.spoke++;
  W.attn = Math.max(W.attn, 3);
  const L = LESSONS[T.i];
  if (T.phase !== 'wait' || !L || L.tab) { if (S.spoke % 2) W.hop = .4; resetU(); return; }
  if (L.pass(text)) { passLesson(); return; }
  // Not that. She reacts to what it did sound like, then asks again.
  T.tries++;
  const shape = U.keys >= 6 ? 'That was a lot!' : U.holdMax >= .8 ? 'Ooh, long.' : U.down ? 'Ha. Low.' : U.up ? 'Ha. High.' : null;
  const again = L.no[(T.tries - 1) % L.no.length];
  lessonLines(shape && T.tries === 1 ? [['w', shape], ['w', again]] : [['w', again]]);
  T.phase = 'ask';
  resetU();
  if (T.tries >= 3) { T.phase = 'praise'; T.t = -dur(again); lessonLines([['w', 'Close enough!']]); }
}

// ---- The scene ----
const TEACH_SCENE = {
  id: 'pro_teach', day: '', part: '', state: 'eve', room: 'wren', prologue: true, teach: true, heard: true, acts: false, obj: 'the vent', boxes: 2,
  place: { w: { room: 'wren', x: -.72, z: 1.25, yaw: -Math.PI / 2 } },
  tracks: [], hot: {},
  onStart: () => { W.floorSit = 1; W.home = null; startLesson(0); S.paused = Math.max(S.paused, 0); },
};
{
  const at = SCENES.findIndex(s => s.id === 'pro_vent');
  if (at >= 0) SCENES.splice(at + 1, 0, TEACH_SCENE);
}
// Nothing else answers in here, and you can't wander off until she sends you.
const _reactTeach = react, _runTracksTeach = runTracks, _nextRoomTeach = nextRoom, _goRoomTeach = goRoom;
react = () => (inTeach() ? teachReact() : _reactTeach());
runTracks = dt => (S.scene && S.scene.teach ? tickTeach(dt) : _runTracksTeach(dt));
const teachHolds = () => S.scene && S.scene.teach && !(LESSONS[T.i] && LESSONS[T.i].tab && T.phase === 'wait');
nextRoom = () => { if (!teachHolds()) _nextRoomTeach(); };
goRoom = (room, quiet) => { if (teachHolds() && room !== 'wren' && S.room === 'wren') return; _goRoomTeach(room, quiet); };
