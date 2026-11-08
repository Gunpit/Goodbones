// What the family understands, and how they work out what you said. Shared by the toy and the story.
// The story only uses also and do from this table. What people say back in the story is in reactions.js. The m/d/w lines are the toy's.
// ---- What they understand ----
// also: other spellings. do: what happens. m / d / w: what each says, getting more worn out with each repeat.
const WORDS = {
  hello: { also: ['hi', 'hey', 'howdy', 'hiya', 'yo', 'greetings'], do: 'wave', m: ['Who said that?', 'Hello.', 'Hello. I am busy.'], d: ['Did {obj} just say hello?', 'Hey, buddy.'], w: ['Hi!', 'Hi. I knew you could.'] },
  bye: { also: ['goodbye', 'later', 'cya'], do: 'wave', m: ['Where do you think you are going?', 'You are bolted in.'], w: ['Bye!', 'You always say that and you are always still here.'] },
  morning: { also: ['goodmorning', 'afternoon', 'evening'], m: ['Good morning.', 'It has been morning for some time.'], w: ['Morning!'] },
  night: { also: ['goodnight', 'sleep', 'bed', 'bedtime', 'nap'], do: 'sleep', w: ['Goodnight, house.', 'It is the middle of the day, but okay.'], m: ['It is ten in the morning.', 'Do not tempt me.'] },
  come: { also: ['here', 'over', 'closer'], do: 'come', m: ['I beg your pardon?', 'What? What do you want?', 'I am coming. I am not coming because you said so.'], d: ['I think it wants you.'] },
  stay: { also: ['remain', 'wait'], do: 'hug', m: ['We have signed the papers.', 'I know you want that.', "I can't."], w: ['I told them.'] },
  hug: { also: ['hold', 'cuddle', 'embrace', 'squeeze', 'arms'], do: 'hug', m: ['You want a what?', 'Absolutely not.', 'Oh, come on, then.'], d: ['Ha! ...Is that a joke?'], w: ['It wants a hug.'] },
  love: { also: ['adore', 'luv'], do: 'hug', m: ['Dell?', 'Do not say that.', '{Obj} is an appliance, Marion.'], d: ['Love you too, hon. Wait.'], w: ['Aww.'] },
  go: { also: ['leave', 'away', 'out', 'getout', 'scram'], do: 'leave', m: ['Thank you. I will.', 'Gladly.', 'I was going anyway.'], d: ['Did it just tell us to go?'], w: ['Do you mean it?'] },
  no: { also: ['nope', 'dont', 'stop', 'nah', 'never', 'quit', 'halt', 'freeze'], do: 'stop', m: ['No what?', 'Excuse me?', 'Do not take that tone with me.'], d: ['Okay. Sorry.'] },
  yes: { also: ['yeah', 'ok', 'okay', 'yep', 'sure', 'yup', 'fine', 'right'], m: ['Yes what?', 'Good.', 'I did not ask you anything.'], d: ['Great. Glad we agree.'] },
  sorry: { also: ['apologize', 'oops', 'forgive', 'whoops'], m: ['For what?', 'What did you do?', 'It is a little late for that.'], d: ['Me too, buddy.'] },
  please: { also: ['beg', 'pretty'], do: 'stop', m: ['Please what?', 'Well, you have nice manners.', "Don't."], d: ['It said please.'] },
  thanks: { also: ['thank', 'thx', 'grateful'], m: ['For what?', 'You are welcome. I think.'], d: ['No problem, buddy.'], w: ['You are welcome!'] },
  help: { also: ['broken', 'stuck', 'fix', 'hurt', 'pain', 'ow', 'ouch', 'sick'], do: 'inspect', m: ['What is wrong with it?', 'Is it the compressor?'], d: ['I can take a look at it.', 'Let me just... hang on.'] },
  eat: { also: ['food', 'hungry', 'dinner', 'lunch', 'breakfast', 'snack', 'meal', 'pizza', 'sandwich', 'cereal', 'toast', 'cake', 'cheese', 'eggs'], do: 'eat', m: ['We ate.', 'It is ten in the morning.', 'Fine. Fine, I will sit down.'], w: ['There is nothing left in you.'] },
  soup: { also: ['soop', 'sup', 'stew', 'broth', 'chowder'], do: 'soup', m: ['We do not have any soup.', 'Why does it keep saying soup?', 'Dell, stop giving it soup.'], d: ['I can get it some soup.', 'More soup. Okay.', 'It really likes the soup.'], w: ['It likes soup.'] },
  milk: { also: ['juice', 'water', 'drink', 'thirsty', 'beer', 'coffee', 'tea'], m: ['Is it not in you?', 'We packed the good mugs.'], d: ['Is the milk off?', 'Hang on, I will have a look.'], w: ['I drank it.'] },
  cold: { also: ['freezing', 'ice', 'chilly', 'winter', 'snow', 'frost'], do: 'cold', m: ['Who did that?', 'Yes. Thank you. I noticed.'], d: ['Should I turn something down?'] },
  hot: { also: ['warm', 'burning', 'heat', 'fire', 'summer', 'sweat'], do: 'hot', m: ['Why is it so warm in here?', 'Who touched the thermostat?'], d: ['That can not be good.'] },
  dark: { also: ['lights', 'off', 'black', 'shadow'], do: 'dark', m: ['Dell, the bulb.', 'I can barely see you. That is not an invitation.'], d: ['I will get another bulb.'], w: ['Ooh.'] },
  light: { also: ['bright', 'on', 'sun', 'day'], do: 'light', m: ['Thank you.', 'That is better.'], w: ['Yay.'] },
  mom: { also: ['mama', 'mother', 'mum', 'mommy'], m: ['I am not your mother.', 'Do not call me that.', 'Fine. What?'], w: ['That is my mom. You can share.'] },
  dad: { also: ['father', 'dada', 'daddy', 'papa'], d: ['No. No, buddy.', 'That is a lot of responsibility.', 'Yeah. Okay. What do you need?'], m: ['It thinks you are its father.'] },
  marion: { do: 'come', m: ['What?', 'How does it know my name?', 'WHAT.'], d: ['Marion, {obj} wants you.'] },
  dell: { do: 'dell', d: ['Yeah?', 'Who is that?', 'Hey, you.'], m: ['Dell. It wants you.'] },
  wren: { do: 'wren', w: ['That is me!', 'Yes?', 'Hi. I am coming.'], m: ['Do not talk to my daughter.'] },
  fridge: { also: ['refrigerator', 'stove', 'oven', 'kettle', 'dishwasher', 'sink', 'radiator', 'telephone', 'phone', 'lamp', 'door', 'table'], m: ['Yes. We are aware.', 'It knows what it is.'], w: ['Good job.'] },
  house: { also: ['home', 'walls', 'roof', 'stairs', 'kitchen', 'room', 'here'], m: ['It is just a house.', 'Stop it.'], w: ['It wants us to know.'] },
  move: { also: ['moving', 'friday', 'truck', 'leaving', 'condo', 'boxes', 'box', 'packing', 'sold', 'buyers', 'rick', 'pruitts', 'mortgage'], m: ['Friday. The truck comes on Friday.', 'Who has been telling it that?', 'It is decided.'], d: ['Should it know that?'], w: ['They did not tell you?'] },
  who: { also: ['what', 'why', 'where', 'when', 'how', 'huh'], m: ['I could ask you the same thing.', 'That is a very big question for {obj}.'], w: ['You are {obj}.'] },
  sad: { also: ['tired', 'lonely', 'alone', 'cry', 'crying', 'miss', 'scared', 'afraid'], do: 'look', m: ['I know.', 'So am I.'], d: ['Yeah. Me too.'], w: ['I can sit with you.'] },
  happy: { also: ['good', 'great', 'nice', 'fun', 'yay', 'wow', 'cool', 'awesome'], m: ['Well, good for you.', 'I am glad somebody is.'], w: ['Me too!'], d: ['That is nice, buddy.'] },
  friend: { also: ['friends', 'buddy', 'pal', 'family', 'together'], m: ['We are not friends.', 'We are not family. I have the paperwork.'], d: ['Sure, buddy.'], w: ['Best friends.'] },
  dance: { also: ['party', 'boogie', 'groove', 'music', 'song', 'sing', 'la'], do: 'dance', w: ['Okay!', 'Again!'], d: ['Oh, are we doing this?'], m: ['Not in my kitchen.', 'It is still my kitchen until Friday.'] },
  jump: { also: ['hop', 'bounce', 'leap'], do: 'jump', w: ['Okay!', 'How high?'], m: ['Wren. Do not listen to it.'] },
  sit: { also: ['down', 'chair', 'rest', 'relax', 'calm'], do: 'eat', m: ['Do not tell me what to do.', 'Fine. For a minute.'] },
  up: { also: ['stand', 'rise', 'wake'], do: 'standup', d: ['Okay, okay.', 'I was just sitting.'], w: ['I am up.'] },
  run: { also: ['hurry', 'quick', 'fast', 'late'], do: 'leave', m: ['Where? What happened?', 'I am not running from a kitchen appliance.'], d: ['Should we be running?'] },
  quiet: { also: ['shutup', 'shush', 'silence', 'shh', 'hush', 'enough'], m: ['You first.', 'Yes. Exactly.'], w: ['That is not nice.'] },
  poop: { also: ['butt', 'fart', 'pee', 'toot', 'booger', 'dumb', 'stupid', 'idiot', 'hate', 'shit', 'damn', 'fuck', 'hell', 'crap', 'ugly'], do: 'rude', m: ['Language.', 'Wren, did you teach it that?', 'That is it.'], w: ['Ha!', 'It was not me.'], d: ['Hey. Not in front of the fridge.'] },
  name: { also: ['called', 'names', 'identity'], m: ['You do not have one.', 'It is on the warranty.'], w: ['I named you. I can not tell you.'] },
  sorrynot: { also: ['liar', 'lie', 'lying', 'secret', 'promise', 'trust'], m: ['Who have you been talking to?', 'I do not have any secrets from an appliance.'], d: ['Keep that one between us.'] },
  aldous: { also: ['downstairs', 'basement', 'crawlspace', 'dead', 'death', 'ghost', 'die'], do: 'look', m: ['There is no one down there.', 'Stop it.'], d: ['What did it say?'], w: ['He says hi.'] },
  money: { also: ['deposit', 'pay', 'rent', 'bills', 'price'], m: ['Do not get me started.', 'Dell was going to call them.'], d: ['I said I would call.'] },
  kiss: { also: ['marry', 'wife', 'husband', 'wedding', 'date'], m: ['Excuse me?', 'I am married. Barely.'], d: ['Hey now.'], w: ['Ew.'] },
  game: { also: ['play', 'toy', 'toys', 'draw', 'homework'], w: ['What do you want to play?', 'I will get my crayons.'], m: ['Wren has homework.'] },
  school: { also: ['classes', 'teacher', 'kids'], m: ['Who told you about the school?', 'It is a very good school.', 'Stop saying that.'], w: ['I do not want a new school.'], d: ['It is a good school, I hear.'] },
  grandma: { also: ['granny', 'nana', 'grandmother'], m: ['What did you say?', 'Do not talk about her.', 'Not in here.'], w: ['Grandma stays here. She does not have to go anywhere.'] },
  annie: { also: ['sister', 'aunt'], m: ['Were you listening to my call?', 'That was a private call.'], d: ['How does it know about Annie?'] },
  car: { also: ['garage', 'drive', 'driving', 'engine', 'keys'], m: ['What about the car?', 'We are not going anywhere until Friday.'], d: ['The car is fine. Leave the car alone.'], w: ['I told you about the car.'] },
};
const PHRASES = { 'shut up': 'quiet', 'go away': 'go', 'get out': 'go', 'come here': 'come', 'come back': 'come', 'good night': 'night', 'good morning': 'morning', 'thank you': 'thanks', 'dont go': 'stay', 'do not go': 'stay', 'please stay': 'stay', 'i love you': 'love', 'love you': 'love', 'wake up': 'up', 'stand up': 'up', 'sit down': 'sit', 'lights off': 'dark', 'lights on': 'light' };
const STOPWORDS = new Set(['i', 'you', 'u', 'the', 'a', 'an', 'is', 'am', 'are', 'me', 'my', 'we', 'it', 'to', 'and', 'of', 'in', 'so', 'do', 'at', 'be', 'that', 'this', 'your', 'im', 'very', 'really', 'just', 'for']);
const REPEATED = ['You said.', 'Yes. We heard you.', 'You have said that.', 'Is that all you know?', 'Okay.'];
const MUSH = [
  ['cap', 'Marion stops what she is doing and looks at {obj}.'],
  ['m', 'What is wrong with {obj}?'],
  ['d', 'It sounds like it is gargling.'],
  ['w', 'Say it again. Slower.'],
  ['m', 'Dell, {obj} is doing the thing.'],
  ['d', 'We should tell the buyers. No. Should we?'],
  ['w', 'I think you need to use real letters.'],
  ['m', 'I am not going to answer that.'],
];
const MISHEARD = ['Did {obj} just say "{w}"?', 'It said "{w}." I heard "{w}."', '"{w}"? What about {w}?'];
const NEW_SPEAKER = [
  ['m', 'Now {obj}.'], ['d', 'Oh, {obj} too?'], ['w', 'Hi, {obj}!'], ['m', 'I have just about had it with {obj}.'], ['d', 'That one has a deep voice.'], ['w', 'They all want to talk.'], ['m', 'How many of you are there?'], ['d', 'Is that all of it? Is that the whole kitchen?'], ['w', 'I knew about {obj}.'],
];

// ---- Understanding ----
const squeeze = w => w.toLowerCase().replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1');
const DICT = {}, SPELLED = {};
for (const k in WORDS) { DICT[squeeze(k)] = k; SPELLED[squeeze(k)] = k; (WORDS[k].also || []).forEach(a => { DICT[squeeze(a)] = k; SPELLED[squeeze(a)] = a; }); }
const STOPS = new Set([...STOPWORDS].map(squeeze));
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function hear(token) {
  const t = squeeze(token);
  if (!t || STOPS.has(t)) return null;
  if (DICT[t]) return { key: DICT[t], clear: true };
  if (t.length < 3) return null;
  let best = null, bd = 9;
  for (const w in DICT) { const dist = distance(t, w); if (dist < bd) { bd = dist; best = w; } }
  if (bd <= 1 || (bd === 2 && t.length >= 5)) return { key: DICT[best], clear: false, as: SPELLED[best] };
  return null;
}
const PRIORITY = ['poop', 'hug', 'love', 'stay', 'soup', 'dance', 'come', 'wren', 'dell', 'marion', 'help', 'eat', 'go', 'no', 'please'];
function understand(text) {
  const clean = text.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const sq = clean.split(' ').map(squeeze).join(' ');
  for (const ph in PHRASES) if ((' ' + sq + ' ').includes(' ' + ph.split(' ').map(squeeze).join(' ') + ' ')) return { key: PHRASES[ph], clear: true };
  const found = clean.split(' ').map(hear).filter(Boolean);
  if (!found.length) return null;
  found.sort((a, b) => (b.clear ? 1 : 0) - (a.clear ? 1 : 0) || ((PRIORITY.indexOf(b.key) + 1 ? 20 - PRIORITY.indexOf(b.key) : 0) - (PRIORITY.indexOf(a.key) + 1 ? 20 - PRIORITY.indexOf(a.key) : 0)));
  return found[0];
}

