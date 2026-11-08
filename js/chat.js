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
const WREN_AGAIN = ['You said that already.', 'Try a new one.', 'You know more than that.'];
// Only things that can't pull a grown-up off a job.
const CHAT_SAFE = new Set(['look', 'wave', 'cold', 'hot', 'dark', 'light', 'sleep', 'jump', 'rude']);
let chatI = { noise: 0, near: 0 };

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
    if (!u) say('w', WREN_NOISE[chatI.noise++ % WREN_NOISE.length]);
    else if (!u.clear) say('w', WREN_NEAR[chatI.near++ % WREN_NEAR.length].replace(/\{w\}/g, u.as));
    else {
      const n = S.chatN['w' + st.id + u.key] = (S.chatN['w' + st.id + u.key] || 0) + 1;
      const day = wordLine(st, u.key, 'w', n);
      const own = WREN_SAYS[u.key] || WORDS[u.key].w || [];
      const l = day || (n <= own.length ? own[n - 1] : n === own.length + 1 ? WREN_AGAIN[n % WREN_AGAIN.length] : own[(n - 1) % (own.length || 1)]);
      if (l) say('w', fillObj(l, o));
    }
    spoke = true;
    // A long chat with the fridge doesn't go unnoticed.
    if (isHere(M)) S.heat += .3;
  }
  // The grown-ups chime in only on words they've heard. Every other time at most, so it stays a chat, not a crowd.
  if (u && u.clear && knownAny && adults.length && (!spoke || S.spoke % 2)) {
    const n = S.chatN[st.id + u.key] = (S.chatN[st.id + u.key] || 0) + 1;
    const k = STANCE_NAMED[u.key] && adults.includes(STANCE_NAMED[u.key]) ? STANCE_NAMED[u.key] : adults.find(k => wordLine(st, u.key, k, n)) || null;
    const l = k && wordLine(st, u.key, k, n);
    if (l) { sayLine(k, fillObj(l, o)); personById(k).attn = 2.6; S.heat += 1; spoke = true; }
    else if (!spoke) { const p = personById(adults[S.spoke % adults.length]); const pl = poolLine(st, p.id); if (pl) { sayLine(p.id, fillObj(pl, o)); S.heat += .6; spoke = true; } }
  }
  if (u && u.clear) { const act = WORDS[u.key].do; if (act && CHAT_SAFE.has(act) && ACTS[act]) ACTS[act](o, u.key); }
  return spoke;
}
