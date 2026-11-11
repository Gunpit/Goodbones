// More of what they understand. Loaded after words.js, reactions.js and chat.js: it adds words, phrases and spellings,
// gives each new word Wren's answers, and Marion's and Dell's for each day, then rebuilds the dictionary.
// The story's own nouns get their own answers now (tape, keys, the truck, the photos, Dr. Feld, the condo...),
// so saying one back at them lands on what it means to them, not on a general "moving" line.

// ---- New things they understand ----
const MORE_WORDS = {
  why: { also: ['because', 'reason', 'how come'] },
  condo: { also: ['apartment', 'flat', 'newplace', 'newhouse', 'highway', 'pool'] },
  friday: { also: ['tomorrow', 'nine', 'oclock', 'calendar', 'circled', 'deadline', 'today'] },
  truck: { also: ['van', 'movers', 'lorry'] },
  tape: { also: ['tapes', 'scotch', 'sticky', 'ducttape'] },
  keys: { also: ['key', 'keychain', 'keyring'] },
  box: { also: ['boxes', 'cardboard', 'packing', 'pack', 'packed', 'unpack', 'carton', 'cartons'] },
  photo: { also: ['photos', 'picture', 'pictures', 'photograph', 'album', 'frame', 'portrait'] },
  coffee: { also: ['tea', 'mug', 'mugs', 'cup', 'cups', 'espresso', 'decaf'] },
  feld: { also: ['doctor', 'dr', 'hospital', 'appointment', 'clinic', 'results', 'diagnosis', 'nurse'] },
  gary: { also: ['mover'] },
  stairs: { also: ['staircase', 'steps', 'upstairs', 'banister', 'railing', 'landing'] },
  window: { also: ['windows', 'outside', 'yard', 'garden', 'lawn', 'tree', 'street', 'sky'] },
  crayon: { also: ['crayons', 'drawing', 'drawings', 'paint', 'painting', 'marker', 'markers', 'art'] },
  remember: { also: ['forget', 'memory', 'memories', 'forgot', 'birthday', 'christmas', 'remembered'] },
  laugh: { also: ['haha', 'hehe', 'lol', 'lmao', 'funny', 'joke', 'joking', 'silly', 'giggle', 'ha'] },
  pet: { also: ['dog', 'cat', 'puppy', 'kitten', 'hamster', 'fish', 'pets'] },
  takeme: { also: [] },
  care: { also: [] },
  bones: { also: ['skeleton', 'bone'] },
};
// More spellings for the words they already knew.
const MORE_ALSO = {
  hello: ['heya', 'hullo', 'hallo', 'hai', 'helo'], bye: ['farewell', 'seeya', 'ciao', 'bai'], yes: ['yea', 'ya', 'mhm', 'absolutely', 'definitely', 'correct', 'true', 'aye'],
  no: ['nay', 'wrong', 'false', 'nuh'], sorry: ['sry', 'apologies', 'mybad'], help: ['save', 'rescue', 'emergency', 'danger', 'trapped'], cold: ['brr'], hot: ['sweaty', 'boiling'],
  sad: ['upset', 'unhappy', 'depressed', 'heartbroken', 'lost', 'sob'], friend: ['bestie', 'mate', 'bff', 'pals'], dance: ['dancing', 'twirl', 'spin', 'wiggle'],
  night: ['sleepy', 'dream', 'dreams'], happy: ['glad', 'yippee', 'hooray', 'excited', 'love it'], money: ['mortgage', 'bank', 'loan', 'debt', 'cash', 'dollars', 'broke'],
  aldous: ['spooky', 'haunted', 'boo', 'spirit'], who: ['what', 'where', 'when', 'huh'], move: ['leaving', 'sold', 'buyers', 'rick', 'pruitts', 'relocate'],
};
// Whole sayings. Checked before single words.
Object.assign(PHRASES, {
  'take me': 'takeme', 'take me with you': 'takeme', 'can i come': 'takeme', 'bring me': 'takeme', 'dont leave me': 'stay', 'do not leave me': 'stay',
  'dont leave': 'stay', 'please dont go': 'stay', 'please dont leave': 'stay', 'stay here': 'stay', 'stay with me': 'stay', 'dont go': 'stay',
  'are you ok': 'care', 'are you okay': 'care', 'you ok': 'care', 'you okay': 'care', 'whats wrong': 'care', 'what is wrong': 'care', 'how are you': 'care', 'are you sad': 'care', 'are you alright': 'care',
  'where are you going': 'condo', 'where are we going': 'condo', 'where will you go': 'condo', 'where will you live': 'condo', 'new house': 'condo',
  'when are you leaving': 'friday', 'when do you go': 'friday', 'when is the truck': 'friday', 'how long': 'friday',
  'why are you leaving': 'why', 'why are you moving': 'why', 'why do you have to go': 'why',
  'good bones': 'bones', 'i miss you': 'sad', 'i will miss you': 'sad', 'miss you': 'sad', 'remember me': 'remember', 'dont forget me': 'remember', 'do not forget me': 'remember',
  'i hate you': 'poop', 'what are you': 'house', 'who are you': 'who', 'my name': 'name', 'whats your name': 'name', 'what is your name': 'name',
});
PRIORITY.push('takeme', 'care', 'bones', 'feld', 'tape', 'keys', 'truck', 'photo', 'friday', 'condo', 'why', 'remember', 'coffee', 'gary', 'crayon', 'pet', 'box', 'stairs', 'laugh', 'window');
for (const k in MORE_WORDS) WORDS[k] = Object.assign({ also: [] }, MORE_WORDS[k]);
for (const k in MORE_ALSO) WORDS[k].also = (WORDS[k].also || []).concat(MORE_ALSO[k]);
// "why" was one of the question words; it has its own answers now.
WORDS.who.also = WORDS.who.also.filter(a => a !== 'why');
// The truck, Friday, boxes and the mortgage were all one big "moving" word. Now they're their own.
WORDS.move.also = WORDS.move.also.filter(a => !['truck', 'friday', 'boxes', 'box', 'packing', 'mortgage'].includes(a));
WORDS.help.also = WORDS.help.also.filter(a => a !== 'sick');
WORDS.milk.also = WORDS.milk.also.filter(a => !['coffee', 'tea'].includes(a));
WORDS.house.also = WORDS.house.also.filter(a => a !== 'stairs');
WORDS.game.also = WORDS.game.also.filter(a => a !== 'draw');
WORDS.crayon.also.push('draw');
WORDS.feld.also.push('sick', 'ill');
// Rebuild the dictionary with all of it.
for (const k in DICT) delete DICT[k];
for (const k in SPELLED) delete SPELLED[k];
for (const k in WORDS) { DICT[squeeze(k)] = k; SPELLED[squeeze(k)] = k; (WORDS[k].also || []).forEach(a => { DICT[squeeze(a)] = k; SPELLED[squeeze(a)] = a; }); }

// ---- Wren's answers to the new words ----
Object.assign(WREN_SAYS, {
  why: ['Because of the mortgage. Or the school. They keep changing it.', 'Nobody tells me why. They just say Friday.', 'I asked why like a hundred times.'],
  condo: ['The condo is by the highway. You can hear trucks all night.', 'It has a pool, but you are not allowed in it.', 'It is all one floor. No stairs.'],
  friday: ['Friday. Nine o\'clock. It is circled.', 'Two more sleeps. I counted.', 'I hate Friday.'],
  truck: ['The truck is huge. Everything fits in it except you.', 'I want to ride in the back. They said no.'],
  tape: ['Dad loses the tape every single day.', 'I know where the good tape is.', 'Shh. About the tape.'],
  keys: ['Dad loses his keys more than the tape.', 'I am not telling where his keys are.'],
  box: ['I hate the boxes.', 'Everything smells like boxes now.', 'My box says WREN STUFF. I wrote it.'],
  photo: ['There is one of me as a baby in the hall.', 'Mom took Grandma\'s picture down. Then she put it back up.', 'You are in all the photos. In the back.'],
  coffee: ['Mom drinks it black. Like a grown-up.', 'Dad puts four sugars. Do not tell.'],
  feld: ['Mom went to Dr. Feld. She came home and sat in the car for a long time.', 'Is Mom sick? Nobody says.', 'Shh. We do not say that name.'],
  gary: ['Gary is the truck man.', 'Gary smells like gum and cigarettes.'],
  stairs: ['This is a good staircase.', 'I counted them. Fourteen.', 'I slide down on my bottom. Do not tell.'],
  window: ['I can see the whole street from my window.', 'The tree is going to miss us too.'],
  crayon: ['I drew you. You have a face.', 'I left one behind the radiator for you. A drawing.', 'I am keeping the red one out. For emergencies.'],
  remember: ['I will remember you forever. Even the noises.', 'Will you remember me?', 'I put my height on the door frame. So you remember.'],
  laugh: ['Ha! You laughed.', 'You have a weird laugh.', 'Do it again!'],
  pet: ['We cannot have a dog at the condo.', 'I wanted a cat. You could have been the cat\'s house.'],
  takeme: ['You cannot come. You are too big.', 'I asked. Dad said houses do not fit in trucks.', 'I would if I could.'],
  care: ['I am okay. Are you okay?', 'I am a little sad. Are you?', 'You asked! Nobody asks.'],
  bones: ['Good bones! That is what Dad said!', 'That means you are strong inside.'],
});

// ---- Marion's and Dell's, by day ----
// m / d / w as in reactions.js; d_alone is Dell when Marion isn't there. They only answer words the house has heard (chat.js).
const DAY_WORDS = {
  WEDNESDAY: {
    why: { m: ['That is not a question for an appliance.', 'Because, Dell. Because.'], d: ['Long story, buddy.', 'Ask Marion.'] },
    condo: { m: ['Who told it about the condo?', 'It is a perfectly nice condo.'], d: ['Two bedrooms, buddy. You would hate it.'] },
    friday: { m: ['Friday. Nine o\'clock.', 'The truck will not wait.'], d: ['Friday, buddy.'], w: ['Friday. It is circled.'] },
    truck: { m: ['Friday.', 'Not until Friday.'], d: ['Not yet, buddy.'] },
    tape: { m: ['Dell, it is talking about the tape.'], d: ['The tape? Where?', 'Do not tease me, buddy.'] },
    keys: { d: ['My keys?', 'Did it say keys?'], m: ['They are in your coat, Dell.'] },
    box: { m: ['Yes. Boxes. Thank you.', 'I know about the boxes.'], d: ['So many boxes, buddy.'] },
    photo: { m: ['Nobody touches the photos.', 'I will do the photos.'], d: ['She will do those, buddy.'] },
    coffee: { m: ['I have had my coffee.', 'One more. Then the cups.'], d: ['I could make a pot.'] },
    feld: { m: ['That is private.', 'Who said that?'], d: ['Hey. Not that one, buddy.'] },
    gary: { m: ['Gary comes Friday.'], d: ['Gary is the mover, buddy.'] },
    stairs: { m: ['Mind the stairs.'], d: ['Fourteen of them, buddy.'] },
    window: { m: ['Close the window, Dell.'], d: ['Nice day out.'] },
    crayon: { m: ['Wren, pack your crayons.'], d: ['She draws you, you know.'] },
    remember: { m: ['I remember everything about this house.', 'Do not.'], d: ['We had good years in here, buddy.'] },
    laugh: { m: ['Is it laughing?', 'Do not laugh at me.'], d: ['Ha. Glad somebody is.'] },
    pet: { m: ['No dog.'], d: ['Maybe at the new place, buddy. Maybe.'] },
    takeme: { m: ['You are bolted to the floor.', 'Absolutely not.'], d: ['Ha. Wish we could, buddy.'] },
    care: { m: ['Did it just ask if I was okay?', 'I am fine.'], d: ['I am okay, buddy. Thanks for asking.'] },
    bones: { m: ['Dell, it is repeating you.'], d: ['Ha! Good bones, buddy.'] },
  },
  THURSDAY: {
    why: { m: ['It is asking why. Write that down.'], d_alone: ['I do not know, buddy. I really do not.'], w: ['Shh. Nobody knows why.'] },
    condo: { m: ['It knows about the condo. Write that down.'], d_alone: ['It is fine, buddy. It is nice.'], w: ['Shh. The condo.'] },
    friday: { m: ['Tomorrow.', 'Write it down. Tomorrow.'], d_alone: ['Tomorrow, buddy. Nine.'], w: ['Tomorrow. I counted.'] },
    truck: { m: ['Tomorrow. Nine.'], d_alone: ['Tomorrow, buddy.'], w: ['Tomorrow. Shh.'] },
    tape: { d: ['Do you know where it is?', 'Somebody has my tape.'], d_alone: ['Buddy. Where is the tape. Please.'], w: ['Shh.'] },
    keys: { d: ['Keys! Where?'], m: ['Your coat, Dell. Your coat.'] },
    box: { m: ['Box it.', 'Keep packing.'], d_alone: ['Last few, buddy.'] },
    photo: { m: ['The photos are mine to pack.'], d_alone: ['Her mom is in those. She has not looked at them yet.'] },
    coffee: { m: ['No coffee until we are done.'], d_alone: ['I could use one, buddy.'] },
    feld: { m: ['Not here.', 'Do not say that name in this house.'], d: ['Hon.'], d_alone: ['She is okay, buddy. She is going to be okay.'], w: ['Shh. Not that.'] },
    remember: { m: ['Write that down.'], d_alone: ['I will, buddy. I promise.'], w: ['I will. Shh.'] },
    laugh: { m: ['It is laughing at us. Write that down.'], d_alone: ['Heh. Yeah.'], w: ['Ha. Shh.'] },
    takeme: { m: ['Write that down.'], d_alone: ['I would if I could, buddy.'], w: ['Shh. I asked already.'] },
    care: { m: ['I am fine. Write that down.'], d_alone: ['Not really, buddy.'], w: ['I am okay. Quiet.'] },
    bones: { m: ['Dell. It is using your words.'], d_alone: ['Yeah. You do, buddy.'] },
  },
  FRIDAY: {
    why: { m: ['Because I could not do it anymore. Not here.'], d: ['Because it is time, buddy.'], w: ['They never said.'] },
    condo: { m: ['It is nice. It is small.'], d: ['It is small, buddy. No stairs.'], w: ['It does not have stairs.'] },
    friday: { m: ['Today.'], d: ['Today, buddy.'], w: ['It is today.'], g: ['Today, pal. Noon.'] },
    truck: { m: ['It is here.'], d: ['It is here, buddy.'], g: ['That is my truck, pal.'], w: ['It is parked on the lawn.'] },
    tape: { d: ['We are done with tape, buddy.'], w: ['I gave it back.'] },
    keys: { m: ['I have the keys.'], d: ['She has the keys.'] },
    box: { m: ['Almost done.'], d: ['Last one, buddy.'], g: ['Boxes first, pal.'] },
    photo: { m: ['I have them. I have all of them.'], d: ['She has them.'] },
    feld: { m: ['It is going to be fine.'], d: ['Not today, buddy.'] },
    gary: { g: ['That is me, pal.', 'How does the fridge know my name?'], m: ['Gary is working.'], d: ['Gary, it knows you.'] },
    remember: { m: ['I will remember.'], d: ['Me too, buddy.'], w: ['I will. I promise.'] },
    takeme: { m: ['I know.'], d: ['I know, buddy.'], w: ['I asked. I really asked.'] },
    care: { m: ['No. But I will be.'], d: ['Not really. Thanks.'], w: ['No.'] },
    bones: { m: ['It does have good bones.'], d: ['The best, buddy.'] },
  },
};
for (const day in DAY_WORDS) {
  const st = STANCE[day];
  if (!st) continue;
  for (const k in DAY_WORDS[day]) st.words[k] = Object.assign({}, st.words[k] || {}, DAY_WORDS[day][k]);
}
