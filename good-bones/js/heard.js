// Prototype: the house can only say words it has heard, in the voice it heard them in.
// Noise doesn't stop anyone. The right word stops the room, and some words send people off around the house.
const heardWords = text => text.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/'/g, '').split(/\s+/).map(squeeze).filter(Boolean);
function learnLine(text, who) {
  if (who === 'cap') return;
  heardWords(text).forEach(w => { S.known[w] = who; S.recent[w] = S.time; });
  text.toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/'/g, '').split(/\s+/).forEach(Speech.learn);
}
// While you're partway through a word: does it look like one you know? If so, whose is it?
function ownerOfStart(cur) {
  if (!cur) return null;
  if (S.known[cur]) return S.known[cur];
  for (const k in S.known) if (k.startsWith(cur)) return S.known[k];
  return null;
}
function voiceForTyping() {
  if (!S.voice || !S.scene.heard) return;
  const m = S.said.match(/[a-z]+$/), who = ownerOfStart(m ? squeeze(m[0]) : '');
  S.voice.borrow(who ? PITCH[who] : null);
  S.voice.mush(!who);
}
// ---- Errands ----
// Someone leaves what they're doing and goes. The conversation they were in waits for them to get back.
function endErrand(p) {
  const h = p.errHome;
  p.home = h; p.errand = false; p.jobWander = h.wander; p.dest = null;
}
function comeBack(p) {
  const h = p.errHome;
  if (!h) { p.errand = false; return; }
  const st = h.stand || [h.x, h.z];
  p.q = (p.room === h.room ? [] : travelSteps(p, h.room, st[0], st[1], h.yaw)).concat(doIt(endErrand));
  p.cur = null;
}
function goOff(p, steps) {
  if (p.held || p.lie || p.errand || p.gone) return false;
  const h = Object.assign({}, p.home || { x: p.x, z: p.z, yaw: p.yaw });
  h.room = p.room; h.wander = p.jobWander;
  p.errHome = h; p.errand = true; p.jobWander = false; p.home = null; p.dest = null;
  order(p, steps.concat(doIt(comeBack)));
  S.delays++;
  return true;
}
const sayIfHere = (who, text) => doIt(() => { const p = personById(who); if (p && isHere(p)) say(who, text); });
const reach = v => doIt(q => { q.reachWant = v; });
const facing = yaw => doIt(q => { q.faceYaw = yaw; });
const walkTo = (p, x, z) => route(p, x, z);
const BOXES_AT = { kitchen: [1.7, .85], living: [1.3, 1.3], hallway: [.7, .9], bedroom: [1.2, 1.3], wren: [.5, 1.1], garage: [2.1, 2.2] };
// In order of how much each word matters. Each returns true if somebody actually did something.
const ERRANDS = {
  tape() {
    if (!isHere(D)) return false;
    const b = BOXES_AT[D.room] || [D.x, D.z];
    say('d', 'The tape. Right. The tape.');
    return goOff(D, walkTo(D, b[0], b[1]).concat(reach(1), wait(2.6), reach(0), sayIfHere('d', 'Not in this one.')));
  },
  truck() {
    if (!isHere(D)) return false;
    say('d', 'Is that the truck? I will just go look.');
    return goOff(D, travelSteps(D, 'hallway', 0, -3.35, Math.PI).concat(doIt(() => HOUSE.want('front', 5)), wait(3.4), sayIfHere('d', 'No truck.')));
  },
  soup(o) {
    if (!isHere(D)) return false;
    say('d', 'Right. Yes. Soup.');
    D.carrying = true;
    return goOff(D, walkTo(D, o.stand[0], o.stand[1]).concat(faceObj(o), reach(1), wait(1.2), doIt(q => { q.carrying = false; q.reachWant = 0; addCan(o); Audio2.fx.click(); }), wait(.8)));
  },
  toast() {
    if (!isHere(D) || D.room !== 'kitchen') return false;
    return goOff(D, walkTo(D, -.5, -1.35).concat(facing(Math.PI), reach(1), wait(3.6), reach(0), doIt(() => Audio2.fx.click()), sayIfHere('d', 'There. Toast.'), sayIfHere('w', 'It does not like toast.')));
  },
  friday() {
    if (!isHere(W) || W.room !== 'kitchen') return false;
    return goOff(W, walkTo(W, 1.1, -1.4).concat(facing(Math.PI), wait(2.6), sayIfHere('w', 'It is still circled.'), wait(1)));
  },
  annie() {
    if (!isHere(M) || M.room !== 'kitchen') return false;
    if (M.reachA > .5 && Math.hypot(M.x + 2.35, M.z + .6) < .6) { say('m', 'Hang on, Annie. I thought I heard your name.'); return true; }
    return goOff(M, walkTo(M, -2.35, -.6).concat(facing(-Math.PI / 2), reach(1), wait(1.4), sayIfHere('m', 'Annie? Did you just call me?'), wait(2.4), sayIfHere('m', 'No. No, I know you did not.'), reach(0), wait(1)));
  },
  mortgage() {
    if (!isHere(D)) return false;
    say('d', 'I have the papers somewhere.');
    return goOff(D, travelSteps(D, 'hallway', 1.05, -.75, Math.PI / 2).concat(reach(1), wait(3), reach(0), sayIfHere('d', 'It is all here somewhere.')));
  },
  mom() {
    if (!isHere(M)) return false;
    say('cap', 'Marion stops what she is doing. She goes upstairs without saying anything. A door shuts.');
    if (isHere(W)) say('w', 'Mom?');
    return goOff(M, travelSteps(M, 'bedroom', -1.4, .4, Math.PI).concat(wait(11)));
  },
  stairs() {
    if (!isHere(W)) return false;
    say('w', 'I will go and sit on them.');
    return goOff(W, travelSteps(W, 'hallway', -1.2, -.95, 0).concat(wait(9), sayIfHere('w', 'This is a good staircase.')));
  },
  box(o) {
    if (!isHere(D)) return false;
    say('d', 'Right. Boxes.');
    D.hasBox = true;
    return goOff(D, travelSteps(D, 'hallway', .7, .9, Math.PI / 2).concat(doIt(q => { q.hasBox = false; }), wait(1.4), sayIfHere('d', 'Now where did she want these?')));
  },
  stay(o) {
    // The word that brings them close enough. It's what the arms were waiting for.
    const p = [M, D].filter(isHere).sort((a, b) => Math.hypot(a.x - o.at.x, a.z - o.at.z) - Math.hypot(b.x - o.at.x, b.z - o.at.z))[0];
    if (!p || S.arm !== 'none') return false;
    say(p.id, p === M ? 'What is that noise?' : 'What was that, buddy?');
    return goOff(p, walkTo(p, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(q => { endErrand(q); q.q = []; q.cur = null; startHug(q, o); })));
  },
  go() {
    if (!isHere(M) || M.errand) return false;
    say('m', 'I have things to do anyway.');
    S.delays++;
    ACTS.leave();
    return true;
  },
  dell(o) {
    if (!isHere(D)) return false;
    say('d', 'Yeah?');
    return goOff(D, walkTo(D, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(q => { q.attn = 5; }), wait(4.5), sayIfHere('d', 'Okay. Well. Good talk.')));
  },
  marion(o) {
    if (!isHere(M)) return false;
    say('m', 'Dell, was that you?');
    return goOff(M, walkTo(M, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(q => { q.attn = 5; }), wait(3.5), sayIfHere('m', 'It is the compressor.')));
  },
  // She can always hear you. Wherever she is, she comes.
  wren(o) {
    if (W.errand) return true;
    if (W.room === S.room) { say('w', 'That is me!'); W.attn = 4; return true; }
    const room = S.room;
    return goOff(W, travelSteps(W, room, o.stand[0], o.stand[1], 0).concat(faceObj(o), doIt(q => { q.attn = 5; }), sayIfHere('w', 'You called me.'), wait(5), sayIfHere('w', 'I have to go back now. I was in the middle of something.'), wait(1.2)));
  },
};
ERRANDS.boxes = ERRANDS.box;
ERRANDS.leave = ERRANDS.go;
ERRANDS.dad = ERRANDS.dell;
const ECHO = {
  m: ['Who said that?', 'Dell, was that you?', 'I said that. I said that a minute ago.'],
  d: ['Hey. That is what I said.', 'Did it just say "{w}"?', 'That is word for word, that is.'],
  w: ['It is listening!', 'You heard that? Good.', 'That was me. You did me.'],
  g: ['Huh.', 'Pal, I am working.'],
  a: ['Who is that?'],
};
const MUSH_TELL = [['w', 'You are saying it wrong. You have to hear it first.'], ['cap', 'It comes out as nothing. The house has never heard that word.']];
let echoI = 0;
function heardReact(text, u, tokens, people, o) {
  const sc = S.scene;
  const heard = tokens.filter(t => S.known[t]);
  const asking = S.tracks.find(t => t.room === S.room && t.waiting > 0);
  const land = () => { S.tracks.forEach(t => { if (t.room === S.room && !t.done && t.i > 0) t.interrupted = true; }); people.forEach(p => { p.attn = Math.max(p.attn, 2.6); }); };
  if (!heard.length) {
    // Just noise. Nobody stops. Somebody might look up.
    S.heat = Math.max(0, S.heat - 1);
    if (people.length) people[S.spoke % people.length].attn = 1.4;
    if (!S.mushTold) {
      S.mushTold = true;
      const l = isHere(W) ? MUSH_TELL[0] : MUSH_TELL[1];
      say(l[0], l[1]);
    } else if (asking && isHere(W)) { asking.waiting = 0; asking.silent = false; say('w', 'I did not get that.'); }
    return;
  }
  // A known word, somewhere in what you said. Stop at the first one that does anything.
  const heardS = new Set(heard);
  const hotKey = sc.hot && Object.keys(sc.hot).find(k => heardS.has(squeeze(k)) && !(S.hotUsed = S.hotUsed || {})[sc.id + k]);
  const errKey = heard.find(t => ERRANDS[t]);
  const count = errKey ? (S.errandN[errKey] = (S.errandN[errKey] || 0) + 1) : 0;
  if (asking) { asking.waiting = 0; asking.silent = false; asking.interrupted = false; }
  if (hotKey) {
    S.hotUsed[sc.id + hotKey] = true;
    land();
    sc.hot[hotKey].forEach(l => { if (l[0] === 'cap' || isHere(personById(l[0]))) say(l[0], l[1]); });
    if (errKey && count <= 2) ERRANDS[errKey](o);
    checkHeat();
    return;
  }
  if (errKey && count <= 2 && ERRANDS[errKey](o)) { land(); checkHeat(); return; }
  if (errKey && count > 2 && people.length) {
    land();
    say(isHere(M) ? 'm' : people[0].id, isHere(M) ? 'Dell, make it stop.' : 'Okay. Okay, buddy.');
    checkHeat();
    return;
  }
  // A word out of what they were just saying, said back at them. That stops them too.
  const echo = heard.find(t => t.length >= 4 && !STOPS.has(t) && S.time - (S.recent[t] || -99) < 14);
  if (echo && people.length) {
    land();
    const owner = personById(S.known[echo]), speaker = owner && isHere(owner) ? owner : people[0], set = ECHO[speaker.id] || ECHO.g;
    say(speaker.id, set[echoI++ % set.length].replace('{w}', echo));
    checkHeat();
    return;
  }
  // A word they know, but nothing to do with anything. A glance, and they carry on.
  S.heat = Math.max(0, S.heat - .6);
  if (asking && isHere(W)) { say('w', wrenReply()); return; }
  if (people.length) {
    const p = people[S.spoke % people.length];
    p.attn = 1.8;
    if (S.spoke % 5 === 0 && p !== W) say('cap', `${NAMES[p.id]} glances at ${o.name}, and goes on.`);
  }
}
