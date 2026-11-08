// The whole week, for the playtest. Days are for playing and nights are for listening.
//   Prologue (as it was) -> Wednesday: packing the kitchen and garage -> Wren's room -> Wednesday night
//   -> Thursday: packing the living room and hall, and the car -> Thursday night (three ways) -> Friday (as it was) -> the yard.
// The garage isn't its own scene any more. When Marion and Dell fight on Thursday they take it out to the car, and if they
// haven't by evening they go out there anyway, to have the talk they've been putting off. The big door is just another thing
// you can talk through. Loaded after pack.js, by playtest.html only.

// ---- Thursday ----
const CAR_TALK = [
  ['d', "It's freezing out here."],
  ['m', "She can't hear us out here."],
  ['m', 'Dr. Feld called. She wants to see Wren once more before we go.'],
  ['d', 'What did you say?'],
  ['m', 'That we are leaving Friday. That it is what she told us to do.'],
  ['d', 'She said a change of scene.'],
  ['m', 'She said, "Get her out of that house," Dell.'],
  ['d', 'Lots of kids have imaginary friends.'],
  ['m', 'She has not asked to have one person over in two years. She has this.'],
  ['m', 'It turned her lamp down last night. I stood in the hall and I watched it.'],
  ['m', 'So we go. It was never the mortgage. It was never the school. We go, and she gets better.'],
  ['d', 'And if it is not the house?'],
  ['m', 'Then at least it is not the house.'],
  ['cap', 'The engine ticks over.'],
  ['d', 'Do you still want to do this? Not the house. I mean this.'],
  ['m', 'Ask me on Saturday.'],
  ['m', 'Come on. Before she does something.'],
];
// A few seconds after the words, they set off for the car.
function carSoon() { PS.carDue = 5; }
function garageWords(text, o) {
  const g = S.g;
  if (!PS.car || g.outcome) return false;
  const tokens = heardWords(text);
  const door = S.room === 'garage' && o.key === 'the garage door';
  const shutW = ['shut', 'close', 'down', 'stay', 'warm'].map(squeeze), openW = ['open', 'up', 'air', 'out'].map(squeeze);
  if (door && !g.shut && M.inCar && D.inCar && tokens.some(t => shutW.includes(t))) { closeGarage(); return true; }
  if (door && g.shut && tokens.some(t => openW.includes(t))) { openGarage(); if (!g.outcome && g.p >= .6) wakeAttempt(text, understand(text), tokens); return true; }
  if (g.shut && g.p >= .55 && S.room === 'garage') { wakeAttempt(text, understand(text), tokens); return true; }
  return false;
}
function tickCar(dt) {
  const g = S.g;
  if (PS.endT > 0) { PS.endT -= dt; if (PS.endT <= 0) endPack(PS.endKind); return; }
  if (PS.carDue > 0) {
    PS.carDue -= dt;
    if (PS.carDue > 0) return;
    if (M.held || D.held || S.sub || S.subs.length) { PS.carDue = .3; return; }
    [M, D].forEach(p => { p.errand = false; p.errHome = null; p.hasBox = false; p.reachWant = 0; });
    // A box in someone's arms gets put down in the hall on the way. Half-packed ones wait for them.
    PS.workers.forEach(w => {
      if (w.phase === 'carry') { PS.hall++; PS.pile++; w.job = null; w.phase = 'idle'; drawBoxes(); }
      else if (w.phase === 'work') w.phase = 'go';
    });
    goToCar();
    PS.car = { i: 0, next: 3 };
    return;
  }
  if (!PS.car) return;
  tickClimb(dt); carPose(dt);
  if (g.engine) { g.rumble = (g.rumble || 0) - dt; if (g.rumble <= 0) { g.rumble = 1.5; if (S.room === 'garage') Audio2.fx.engine(); } }
  if (g.outcome) {
    if (g.outcome === 'never') {
      if (!M.inCar && !D.inCar && !M.climb && !D.climb) { PS.car = null; PS.carDone = true; if (PS.finale) PS.endT = 3; }
      return;
    }
    g.endT -= dt;
    if (g.endT <= 0 && !S.sub && !S.subs.length) { PS.car = null; PS.carDone = true; PS.endAsked = true; endPack('garage'); }
    return;
  }
  if (g.shut) {
    // Nobody says anything about it. The engine runs. Wren goes to the window.
    g.p = Math.min(1, g.p + dt / 75);
    if (g.p > .45 && !PS.wrenGoes) { PS.wrenGoes = true; W.errand = false; moveToGarage(); }
    if (W.room === 'garage' && !W.dest && !W.q.length && !W.cur && g.p > .62) { W.faceYaw = -Math.PI / 2; W.reachWant = Math.sin(S.time * 6) > .2 ? .9 : .55; }
    if (g.p >= 1) finishGarage('dead');
    return;
  }
  // Opened again while they're asleep: the air gets to them, slowly.
  if (g.p >= .55) { g.airT = (g.airT || 0) + dt; if (g.airT > 22) finishGarage('saved'); return; }
  if (!(M.inCar && D.inCar && g.engine) || M.climb || D.climb) return;
  // The talk goes on whether or not you're out there to hear it.
  PS.car.next -= dt;
  if (PS.car.next > 0) return;
  const l = CAR_TALK[PS.car.i];
  if (!l) { if (quiet()) finishGarage('never'); return; }
  PS.car.i++;
  const d = dur(l[1]);
  if (S.room === 'garage') { S.subs.push({ who: l[0], text: l[1], dur: d }); const sp = l[0] !== 'cap' && personById(l[0]); if (sp) sp.talk = d; }
  PS.car.next = d + .45;
}
const THU = {
  standalone: false,
  T: 160,          // left alone, they finish at about 120

  WORK: 7,
  rooms: ['garage', 'kitchen', 'hallway', 'living', 'wren'],
  own: { m: 'living', d: 'hallway' },
  jobs: {
    living: [{ at: 'the bookshelf', pack: true }, { at: 'the sofa' }, { at: 'the floor lamp', pack: true }, { at: 'the radiator' }],
    hallway: [{ at: 'the coats', pack: true }, { at: 'the stair railing' }, { at: 'the hall lamp', pack: true }],
  },
  openerRoom: 'hallway',
  opener: [
    ['m', 'Nobody talks in front of the appliances today.'],
    ['d', 'The appliances.'],
    ['m', 'Anything with a plug, Dell.'],
    ['d', 'Has anybody seen my keys?'],
    ['w', 'Not me.'],
    ['m', 'Dr. Feld called.'],
    ['d', 'And?'],
    ['m', 'Not here.'],
    ['cap', 'Marion looks at the light switch for a long moment.'],
    ['m', 'I will do the living room. The photos of Mom are in there somewhere.'],
    ['d', 'Hall, then.'],
  ],
  onOpened: () => { if (!W.held) moveTo(W, 'wren', .2, .4, Math.PI); },
  barks: {
    m: ['Where are the photos of Mom?', 'Wren, are you packing up there?', 'I am not doing this again on Saturday.', 'Nobody talk to it.'],
    d: ['Keys. Keys, keys, keys.', 'I had my keys in my hand.', 'It is a lot of house. It is a lot to put in boxes.', 'We have still got soup, if anybody wants soup.'],
  },
  hints: [
    { text: 'Mom says nobody is allowed to talk in front of you today.' },
    { when: () => !packed('hallway', 'the coats'), text: 'Dad keeps his keys in his coat. He always forgets.' },
    { when: () => !PS.secret, text: 'Mom gets really upset when anybody says Dr. Feld.' },
    { text: 'They always go to the car when they fight.' },
    { text: 'When it is cold, you shut the door. That is your job.' },
  ],
  fights: {
    feld: [['m', 'Who said that.'], ['d', 'Hon. It is okay.'], ['m', 'It is not okay. Not in here.'], ['m', 'Car. Now.']],
    school: [['d', 'Did it just say that again?'], ['m', 'Not in here. Car.']],
    mortgage: [['d', 'Did it just say that again?'], ['m', 'Not in here. Car.']],
  },
  alone: { m: { feld: 'Who said that?' }, d: { feld: 'Feld? Like the doctor?' } },
  warn: { m: 'We stop when it gets dark.', d: 'Getting dark, hon.' },
  endLabel: 'EVENING',
  fightToCar: carSoon,
  onSay: garageWords,
  tick: tickCar,
  holdEnd: () => PS.carDue > 0 || !!PS.car || PS.endT > 0,
  // If they haven't been out to the car by evening, they go now. They've been putting this talk off all day.
  beforeEnd: kind => {
    if (PS.carDone) return false;
    PS.finale = true; PS.endKind = kind;
    sayAll([['m', 'We should talk.'], ['d', 'Okay.'], ['m', 'Not in here. The car.']]);
    carSoon();
    return true;
  },
};
const THU_SCENE = {
  id: 'thu_pack', pack: true, pk: THU, day: 'THURSDAY', part: 'Day', state: 'day', room: 'hallway', acts: true, heard: true, tracks: [], hot: {},
  place: {
    m: { room: 'hallway', x: -.3, z: -.7, yaw: Math.PI },
    d: { room: 'hallway', x: .75, z: -1.3, yaw: Math.PI },
    w: { room: 'hallway', x: -.42, z: .55, yaw: Math.PI },
  },
  onStart: () => { PS.finale = false; PS.endT = 0; PS.wrenGoes = false; startPack(); },
};
Object.keys(THU.fights).forEach(k => KEY_WORDS.add(squeeze(k)));

// ---- Wednesday afternoon: Wren's room, and nothing else ----
const AFT = ORIGINAL_SCENES.find(s => s.id === 'afternoon');
const WED_WREN = {
  id: 'wed_wren', day: 'WEDNESDAY', part: 'Afternoon', state: 'day', room: 'wren', acts: true, heard: true,
  place: { m: AFT.place.m, d: AFT.place.d, w: { room: 'wren', x: .2, z: .4, yaw: Math.PI } },
  tracks: [{ room: 'wren', start: 2, lines: AFT.tracks.find(t => t.room === 'wren').lines }],
  hot: { wren: AFT.hot.wren },
};

// ---- The week ----
WED.standalone = false;
const byId = id => ORIGINAL_SCENES.find(s => s.id === id);
SCENES.length = 0;
SCENES.push(
  ...ORIGINAL_SCENES.filter(s => s.prologue),
  PACK_SCENE, WED_WREN, byId('night'),
  THU_SCENE, byId('thu_night'), byId('thu_dead'),
  ...DAY3_SCENES,
);
// ?scene=epilogue plays just the yard. &ending=forward, go_dead or forward_dead picks which one (go is the default).
SCENES.push({
  id: 'epilogue', day: '', part: '', state: 'eve', room: 'hallway', acts: false, tracks: [], hot: {}, place: {},
  onStart: () => {
    const e = params.get('ending') || 'go';
    S.f.ending = e;
    if (e.endsWith('_dead')) S.g.outcome = 'dead';
    $('gl').style.opacity = '0';
    setTimeout(finishDay, 0);
  },
});
playIntro = _playIntro;
PACKING.full = true;
// Nobody says "Anyway" when you interrupt them. They just carry on.
RESUME.length = 0;
// Whatever got packed stays packed. Friday morning puts every plug back in, so take the boxed ones out again.
const _startSceneW = startScene;
startScene = i => {
  _startSceneW(i);
  for (const r in ROOMS) ROOMS[r].objects.forEach(o => { if (o.packed) o.muted = 1e9; });
  showCovers();
};

// ---- How much got packed, and what it does to Friday ----
// One number: the boxes still unpacked at the end of Thursday. The more of the house is left, the more your words weigh at the end.
// &band=packed, half or barely forces a band for testing (handy with ?scene=fri_morning or fri_evening).
const WEEK_BOXES = [WED, THU].reduce((n, c) => n + Object.values(c.jobs).reduce((m, l) => m + l.length, 0), 0);
const BAND_AT = { packed: 4, barely: 10 }; // at most 4 left is packed; 10 or more left is barely started
function boxesLeft() {
  const forced = params.get('band');
  if (forced === 'packed') return 0;
  if (forced === 'half') return 7;
  if (forced === 'barely') return WEEK_BOXES;
  return WEEK_BOXES - PS.pile;
}
function band() { const n = boxesLeft(); return n <= BAND_AT.packed ? 'packed' : n >= BAND_AT.barely ? 'barely' : 'half'; }
window.band = band;

// Friday morning: the pile in the hall is what you let them pack. Three boxes stay behind for the afternoon, as before.
const FRI_AM = DAY3_SCENES.find(s => s.id === 'fri_morning');
FRI_AM.boxes = () => 3 + Math.round((WEEK_BOXES - boxesLeft()) / WEEK_BOXES * 5);
// Gary sizes up the hall before anyone carries anything.
const PILE_LINES = [
  ['cap', 'Gary looks at the hall. Then the living room. Then the kitchen.', { if: () => band() === 'barely' }],
  ['g', "This isn't packed.", { if: () => band() === 'barely' }],
  ['d', 'Most of it is.', { if: () => band() === 'barely' }],
  ['g', 'Truck leaves at noon, folks. With or without.', { if: () => band() === 'barely' }],
  ['g', 'Well. You folks are ready.', { if: () => band() === 'packed' }],
  ['m', 'We are ready.', { if: () => band() === 'packed' }],
];
{
  const hall = FRI_AM.tracks.find(t => t.room === 'hallway');
  const at = hall.lines.findIndex(l => l[1] === 'It is a small town.');
  hall.lines.splice(at + 1, 0, ...PILE_LINES);
}

// ---- The endings where they live ----
const END_EXTRA = {
  tried: ['THEY TRIED', 'Everything fit on the truck.', 'Wren tells the new house what you said. It does not answer.'],
  go_rest: ['YOU CAN GO', "They said they'd come back for the rest.", "They don't. You keep it all very tidy."],
  forward_rest: ['FORWARDING ADDRESS', 'Marion locks up. Half the house is still in the hall.', 'Nobody sends for it. You keep it all very tidy.'],
};
Object.assign(ENDINGS, END_EXTRA);
EPI_ENDINGS.push('tried', 'go_rest', 'forward_rest');
// Packed, and you said stay: the house asked, and it was too late to matter. They go anyway.
// The front door can still catch them on the way out, so a loop there is a last way to Saturday.
function triedScript() {
  const f = S.f;
  f.loop = false; f.answered = 'stay'; f.leaving = true; f.goodbye = 0;
  f.script = [
    ['w', 'Okay.'], ['w', 'It says no.'],
    ['m', 'Everything is on the truck, Wren.'],
    ['d', 'Come on, Wrennie. Coat.'],
    ['w', 'But it said.'],
    ['m', 'I know, honey.'],
    () => { all.filter(p => p.room === 'hallway' && !p.gone && p !== W).forEach((p, i) => walkOut(p, i * .9)); walkOut(W, 2.4); }, { until: () => all.every(p => p.room !== 'hallway' || p.gone) },
    1.2, ['cap', 'From the path, not very loud:'], ['w', 'It said stay. I heard it.'],
    () => { f.leaving = false; f.ending = 'tried'; f.endT = 2.5; },
  ];
  f.wait = 0;
}
const _stayScript = stayScript, _goScript = goScript, _leaveScript = leaveScript;
stayScript = answered => {
  if (answered && alive() && !S.f.loop && band() === 'packed') return triedScript();
  return _stayScript(answered);
};
// Barely started, and you let them go: they go, and most of the house stays.
goScript = canGo => {
  _goScript(canGo);
  if (!alive() || band() !== 'barely') return;
  S.f.script.push(['cap', 'Most of their things are still in the hall.'], () => { if (S.f.ending === 'go') S.f.ending = 'go_rest'; });
};
leaveScript = said => {
  _leaveScript(said);
  if (!alive() || band() !== 'barely' || S.f.answered !== 'none') return;
  S.f.script.splice(2, 0, ['m', "We'll send for the rest."]);
  S.f.script.push(() => { if (S.f.ending === 'forward') S.f.ending = 'forward_rest'; });
};
// Whatever you kept out of the boxes, they leave behind. The card says so.
const LEFT_ENDINGS = ['go', 'go_rest', 'forward', 'forward_rest', 'tried'];
const _endCard = endCard;
endCard = () => {
  _endCard();
  if (!LEFT_ENDINGS.includes(S.f.ending)) return;
  const kept = [];
  [WED, THU].forEach(c => { for (const r in c.jobs) c.jobs[r].forEach(j => { if (j.pack && !packed(r, j.at) && !kept.includes(j.at)) kept.push(j.at); }); });
  if (!kept.length) return;
  const list = kept.length > 1 ? `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}` : kept[0];
  const more = $('cardmore');
  more.textContent = more.textContent.replace('Click to start again.', `They left ${list}. Click to start again.`);
};
