// Talking back. Every word you type gets an answer straight away, from whoever is there to give one.
// Wren understands all of it from the start: every word in the dictionary, near misses, even noise. She has always talked to the house.
// Marion and Dell only answer words they have heard said in this house. Lures, fights and hugs still need heard words, as before.
// None of this stops the packing. Only harmless things happen (lights, cold, Wren jumping), never anything that pulls a grown-up off a job.

// Wren's own answers, for words the day's lines don't give her. Two or three each; past that she cycles.
const WREN_SAYS = {
  hello: ['Hi!', 'Hi again.', 'Hello, hello.'],
  bye: ['Bye!', 'You always say bye and you are always still here.'],
  morning: ['Morning!', 'It is morning in here. It is always morning in here.'],
  night: ['Goodnight, house.', 'It is not bedtime. Nice try.'],
  come: ['I am right here.', 'Coming!', 'I am already here, silly.'],
  stay: ['I told them.', 'I know. I asked too.', 'I want to stay too.'],
  hug: ['It wants a hug.', 'I will hug the wall. There.', 'Hugging you. Can you feel it?'],
  love: ['Aww.', 'Love you too.', 'It means it.'],
  go: ['Do you mean it?', 'We have to. It is Friday.', 'Do not say that.'],
  no: ['No what?', 'It said no.', 'You can say no. I say no all the time.'],
  yes: ['Yes what?', 'Yes!', 'Yes is a good one.'],
  sorry: ['It is okay.', 'You did not do anything.', 'They are not mad at you.'],
  please: ['You have nice manners.', 'Please what?'],
  thanks: ['You are welcome!', 'Any time.'],
  help: ['What is wrong? Are you broken?', "It's not broken. It just wants something."],
  eat: ['There is nothing left in you.', 'I had cereal. You can have the crumbs.'],
  soup: ['It likes soup.', 'Dad! It wants soup again.', 'Soup soup soup.'],
  milk: ['I drank it.', 'Sorry. I drank it.'],
  cold: ['Brr. You are good at that.', 'Do it again! No, do not, Mom will notice.'],
  hot: ['You are good at that.', 'It is like summer in here.'],
  dark: ['Ooh.', 'Spooky.'],
  light: ['Yay.', 'There you are.'],
  mom: ['That is my mom. You can share.', 'She can not hear you like I can.'],
  dad: ['He will get you soup.', 'That is my dad. He is funny.'],
  marion: ['That is Mom.', 'It knows your name, Mom. ...She is not listening.'],
  dell: ['That is Dad.', 'Dad! It said your name. ...He did not hear.'],
  wren: ['That is me!', 'Yes?', 'Hi. I am here.'],
  fridge: ['Good job.', 'That is you!', 'You know what you are.'],
  house: ['It wants us to know.', 'You are the best house.', 'I know you are.'],
  move: ['They did not tell you?', 'Friday. Nine o\'clock. I am sorry.', 'I do not want to either.'],
  who: ['You are {obj}.', 'I am Wren. You know that.'],
  sad: ['I can sit with you.', 'Me too.', 'Do not be sad. I will draw you something.'],
  happy: ['Me too!', 'Yay!'],
  friend: ['Best friends.', 'Best friends forever. Even after Friday.'],
  dance: ['Okay!', 'Again!', 'You are a good dancer for a house.'],
  jump: ['Okay!', 'How high?', 'Higher!'],
  sit: ['I am sitting.', 'Okay. Sitting on the floor.'],
  up: ['I am up.', 'I have been up since six.'],
  run: ['Where?', 'You can not run. You are a house.'],
  quiet: ['That is not nice.', 'Shh yourself.'],
  poop: ['Ha!', 'It was not me.', 'Say it again! No, do not.'],
  name: ['I named you. I can not tell you.', 'It is a secret name.'],
  sorrynot: ['I can keep a secret.', 'Pinky promise.'],
  aldous: ['He says hi.', 'He is quiet today.'],
  money: ['Dad says it is the money.', 'I have four dollars. You can have it.'],
  kiss: ['Ew.', 'EW.'],
  game: ['What do you want to play?', 'I will get my crayons.', 'You be it.'],
  school: ['I do not want a new school.', 'Mom says it is a very good school. I do not care.'],
  grandma: ['Grandma stays here. She does not have to go anywhere.', 'She liked you.'],
  annie: ['Aunt Annie? She calls a lot.', 'Annie is Mom\'s sister.'],
  car: ['I told you about the car.', 'Dad sits in the car sometimes. Just sits.'],
};
// She catches what you nearly said.
const WREN_NEAR = ['Did you say "{w}"?', 'Almost. "{w}."', '"{w}"? I think you mean "{w}."'];
// And when it's just noise, she plays along anyway.
const WREN_NOISE = ['What?', 'Say it slower.', 'That is not a word. I like it, though.', 'Bless you.', 'You need real letters.', 'Try again. Hello. Say hello.'];
// When she's used up everything she has for a word, she changes the subject instead of complaining. Days she can chat freely only.
const WREN_RIFFS = [
  'Do you want to know a secret? I hid a crayon behind you.',
  'I am going to miss the stairs most. And you.',
  'Mom says houses do not have feelings. I think she is wrong.',
  'My new room has a window that does not open.',
  'Can you hear me from upstairs too?',
  'I drew you. You are the one with the face.',
  'Dad hums when he is sad. Did you know that?',
  'The condo does not even have stairs.',
  'If you had a name, what would it be? Not fridge.',
  'I am teaching you so you can tell them yourself.',
  'When I was little I thought you were breathing. You were, right?',
  'Do you get cold at night? I do.',
];
const RIFF_DAYS = new Set(['WEDNESDAY', 'THURSDAY', 'NIGHT_WED', 'NIGHT_THU']);

// ---- Nobody says the same thing twice in a row ----
// Every line said is remembered for a while. While the house is being answered, a line that was said recently is just dropped:
// better a look than the same sentence again. Pickers below try fresh lines first, so this rarely has to drop anything.
const FRESH_FOR = 90;
const lineText = l => Array.isArray(l) ? l[1] : l;
function recentLine(l) { const t = lineText(l); return !!t && S.lineT && S.time - (S.lineT[fill(t)] ?? -999) < FRESH_FOR; }
function freshOf(list) { return (list || []).find(l => l && typeof l !== 'function' && !recentLine(l)) || null; }
addEventListener('load', () => {
  const _say = say;
  say = (who, text) => {
    S.lineT = S.lineT || {};
    const t = fill(text);
    if (S.replying && who !== 'cap' && S.time - (S.lineT[t] ?? -999) < FRESH_FOR) return;
    S.lineT[t] = S.time;
    _say(who, text);
  };
  const _react = react;
  react = () => {
    const before = S.subs.length + (S.sub ? 1 : 0), typed = S.typed;
    S.replying = true;
    try { _react(); } finally { S.replying = false; }
    // Nobody had anything new to say. Wren still lets you know she heard.
    if (typed.trim() && S.subs.length + (S.sub ? 1 : 0) <= before && typeof wrenFree === 'function' && wrenFree()) {
      W.attn = Math.max(W.attn, 3);
      if (S.spoke % 3 === 0) W.hop = .5; else if (S.spoke % 3 === 1) { W.waveWant = 1; setTimeout(() => { W.waveWant = 0; }, 1200); }
    }
  };
});
// Only things that can't pull a grown-up off a job.
const CHAT_SAFE = new Set(['look', 'wave', 'cold', 'hot', 'dark', 'light', 'sleep', 'jump', 'rude']);
let chatI = { noise: 0, near: 0 };
// The list starting from position i, wrapping round: the next line in turn comes first, but any of them can come up.
const rotate = (list, i) => list.slice(i % list.length).concat(list.slice(0, i % list.length));

function wrenFree() { return isHere(W) && !W.held && !W.lie && !wrenAsleep(); }
function fillObj(l, o) { return typeof l === 'string' ? l.replace(/\{obj\}/g, o ? o.name : 'the house').replace(/\{Obj\}/g, o ? o.name[0].toUpperCase() + o.name.slice(1) : 'The house') : l; }
// knownAny: did at least one word come out in a voice they've heard? Only then do the grown-ups answer.
// Returns true if anybody said anything.
function chat(text, o, knownAny) {
  const u = understand(text), st = stanceNow();
  const adults = ['m', 'd'].filter(k => { const p = personById(k); return p && isHere(p) && !p.held && !p.inCar && canAnswer(st, k); });
  let spoke = false;
  S.chatN = S.chatN || {};
  if (wrenFree()) {
    W.attn = Math.max(W.attn, 3);
    let l = null;
    if (!u) l = freshOf(rotate(WREN_NOISE, chatI.noise++));
    else if (!u.clear) l = freshOf(rotate(WREN_NEAR, chatI.near++).map(x => x.replace(/\{w\}/g, u.as)));
    else {
      // The day's lines for this word first, then hers, then anything she hasn't said yet.
      const e = st.words[u.key] || {};
      const dayLines = (e.w || []).map(x => typeof x === 'function' ? x() : x).filter(fits);
      l = freshOf(dayLines.map(x => fillObj(x, o))) || freshOf((WREN_SAYS[u.key] || WORDS[u.key].w || []).map(x => fillObj(x, o)));
    }
    if (!l && RIFF_DAYS.has(st.id)) l = freshOf(rotate(WREN_RIFFS, chatI.riff = (chatI.riff || 0) + 1));
    if (l) { say('w', l); spoke = true; }
    // A long chat with the fridge doesn't go unnoticed.
    if (isHere(M)) S.heat += .3;
  }
  // The grown-ups chime in only on words they've heard. Every other time at most, so it stays a chat, not a crowd.
  if (u && u.clear && knownAny && adults.length && (!spoke || S.spoke % 2)) {
    // Whoever was named, else whoever has something fresh to say about it.
    const linesFor = k => { const e = st.words[u.key] || {}; const list = (k === 'd' && !isHere(M) && e.d_alone) || e[k] || []; return list.map(x => typeof x === 'function' ? x() : x).filter(x => x && fits(x)).map(x => fillObj(x, o)); };
    const turn = STANCE_NAMED[u.key] && adults.includes(STANCE_NAMED[u.key]) ? [STANCE_NAMED[u.key]].concat(adults) : adults;
    const k = turn.find(k => freshOf(linesFor(k)));
    if (k) { sayLine(k, freshOf(linesFor(k))); personById(k).attn = 2.6; S.heat += 1; spoke = true; }
    else if (!spoke) { const p = personById(adults[S.spoke % adults.length]); const pl = poolLine(st, p.id); if (pl && !recentLine(pl)) { sayLine(p.id, fillObj(pl, o)); S.heat += .6; spoke = true; } else p.attn = 2; }
  }
  if (u && u.clear) { const act = WORDS[u.key].do; if (act && CHAT_SAFE.has(act) && ACTS[act]) ACTS[act](o, u.key); }
  return spoke;
}
