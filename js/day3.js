// Day 3. The truck comes. Everything you have learned is on the table, and there are only two things left to say.
// The front door is yours. You can make it go wherever you like, and they will keep trying it, very politely.
// Then Wren asks the only question anybody has asked you all week.
const alive = () => S.g.outcome !== 'dead';
const wasSaved = () => S.g.outcome === 'saved';
const HALL_FINAL = {
  g: { room: 'hallway', x: .4, z: -3.1, yaw: 0 },
  m: { room: 'hallway', x: 1.05, z: -.55, yaw: -2.4 },
  w: { room: 'hallway', x: -.3, z: -1.7, yaw: Math.PI },
  d: { room: 'hallway', x: -.5, z: .6, yaw: 2.7 },
};
const SAT_PLACE = {
  m: { room: 'kitchen', x: 0, z: -.46, yaw: 0, seat: 1, stand: [0, -1.3] },
  d: { room: 'kitchen', x: 1.14, z: .3, yaw: -Math.PI / 2, seat: 1, stand: [2.15, .3] },
  w: { room: 'kitchen', x: -1.14, z: .3, yaw: Math.PI / 2, seat: 1, stand: [-2.4, .8] },
  g: { room: 'kitchen', x: 0, z: 1.06, yaw: Math.PI, seat: 1, stand: [0, 1.9] },
};
// On Saturday nobody minds anything you say. That is what is wrong with it.
const SAT_HOT = {
  go: [['m', 'Go where?'], ['w', 'We live here.']],
  truck: [['g', 'What truck?']],
  friday: [['m', 'What is that, honey?'], ['w', 'I do not know.']],
  sorry: [['m', 'For what?'], ['d', 'We are all fine here.']],
  stay: [['m', 'Yes.'], ['d', 'Yep.'], ['g', 'Yep.']],
  love: [['m', 'We know.']],
  soup: [['d', 'Coming right up, buddy.']],
  help: [['cap', 'Everyone looks up, pleasantly, and waits to see if there is any more.']],
};
const DAY3_SCENES = [
  {
    id: 'fri_morning', day: 'FRIDAY', part: 'Morning', state: 'day', room: 'hallway', obj: 'the front door', acts: true, friday: true, boxes: 8, keep: 3, minT: 62, only: alive,
    place: {
      m: { room: 'hallway', x: -.3, z: -.7, yaw: Math.PI },
      d: { room: 'hallway', x: .75, z: -1.3, yaw: Math.PI },
      g: { room: 'hallway', x: .35, z: -3.0, yaw: 0 },
      w: { room: 'wren', x: -.4, z: .3, yaw: -Math.PI / 2 },
    },
    tracks: [
      { room: 'hallway', start: 2.5, lines: [
        ['g', 'Morning.'],
        ['m', 'It is you.'],
        ['g', 'It is me.'],
        ['d', 'You do fridges and moving.'],
        ['g', 'It is a small town.'],
        ['cap', 'Every window in the house is open. Nobody has said why.', { if: wasSaved }],
        ['g', 'Little cold in here.', { if: wasSaved }],
        ['m', 'Yes.', { if: wasSaved }],
        ['g', 'That the fridge, in there? The one that says things?'],
        ['m', 'The fridge stays.'],
        ['g', 'Okay. Boxes first.', { after: () => { startCarrying([D, GARY]); } }],
        ['m', 'I will do the coats.', { after: () => { M.home = { x: 1.05, z: -.75, yaw: Math.PI / 2, reach: 1 }; } }],
      ] },
      { room: 'wren', start: 4, lines: [
        ['cap', 'Her room is mostly boxes now. She has written on them. They all say WREN.'],
        ['w', 'The truck is here. It is smaller than I thought.'],
        ['w', () => wasSaved() ? 'I am not allowed to talk to you any more. So this is me not talking to you.' : 'Mom says you stay here. Houses do not come.'],
        ['w', 'I asked if we could take you. She said you would not fit.', { ask: 6 }],
        ['w', 'I packed my things in the order you like them.'],
        ['w', 'Do you know what I would do, if I was a door?'],
        ['w', 'I would open onto the kitchen. Every time. It is much nicer than outside.', { ask: 7 }],
        ['w', 'But I am not a door. I am eight.'],
      ] },
    ],
    hot: {
      gary: [['g', 'Morning, pal.'], ['m', 'Do not talk to it.'], ['g', 'I am just being polite.']],
      fridge: [['g', 'Is that the same one?'], ['d', 'They are all the same one.']],
      truck: [['g', 'Yep. That is the truck.']],
    },
  },
  {
    id: 'fri_afternoon', day: 'FRIDAY', part: 'Afternoon', state: 'day', room: 'living', acts: true, friday: true, boxes: () => S.boxesNow, minT: 40, only: alive,
    place: {
      m: { room: 'living', x: -2.05, z: .9, yaw: -Math.PI / 2 },
      d: { room: 'kitchen', x: 1.75, z: -.75, yaw: Math.PI * .85 },
      g: { room: 'hallway', x: .5, z: -2.6, yaw: Math.PI },
      w: { room: 'wren', x: .2, z: .4, yaw: Math.PI },
    },
    tracks: [
      { room: 'hallway', id: 'gary', start: 1, lines: [
        ['g', () => S.f.loop ? 'I will just keep trying it.' : 'Almost there.', { after: () => { startCarrying([GARY]); } }],
      ] },
      { room: 'living', id: 'marion', start: 3, lines: [
        ['cap', 'Marion takes one book off the shelf, and looks at it, and puts it in a box.'],
        ['m', 'I know you can hear me.', { after: () => { S.marionAnswers = true; } }],
        ['m', 'I have known since Wednesday. I want that on the record.'],
        ['cap', 'Nobody is writing it down.'],
        ['m', () => wasSaved() ? 'You shut that door. And you woke us up. I can\'t get those to be the same house.' : 'You have been good to her. I don\'t know what you are, but you have.'],
        ['m', 'My mother held on for eleven days. Nobody could tell her anything. She was very stubborn, and she was very tired.'],
        ['m', 'And then I told her it was all right, and she stopped.'],
        ['m', 'It took me eleven days to say four words.'],
        ['cap', 'She takes down another book.'],
        ['m', 'Anyway.'],
      ] },
      { room: 'kitchen', id: 'dell', start: 2, lines: [
        ['d', 'Well.'],
        ['d', 'I took the milk.'],
        ['d', 'You were a good fridge, buddy. I do not know what else you were.', { ask: 7 }],
        ['d', 'I left you the soup. It seemed like you wanted it.', { if: () => S.cans.length > 0 }],
        ['d', 'Thanks for the other night. She says I should not say that.', { if: wasSaved }],
        ['d', 'I told everybody it was the mortgage.'],
        ['d', 'We have a very nice elevator now. I am going to stand in it.'],
        ['d', 'There is a couple coming. The Pruitts. They have got a baby on the way.', { ask: 6 }],
        ['d', 'So, you know. Take it slow with them. Be a fridge for a while.'],
        ['cap', 'Dell reaches behind the fridge for the plug. He stays down there a moment. He stands back up without it.'],
        ['d', 'I will tell her I did it.'],
      ] },
      { room: 'wren', start: 5, lines: [
        ['w', 'I said goodbye to the hatch. I said goodbye to the third stair.'],
        ['w', 'They did not say anything. You do not have to do the voice for them.', { ask: 6 }],
        ['w', 'Dr. Feld says I can bring something that reminds me. I picked this.'],
        ['cap', 'She holds up a piece of the wallpaper, about the size of a playing card. It is not clear when she got it.'],
        ['w', 'Is that okay? It came off by itself.', { ask: 7 }],
        ['w', 'I am going to go downstairs now, I think.', { after: () => { moveTo(W, 'hallway', -.3, .9, Math.PI); } }],
      ] },
    ],
    hot: {
      milk: [['d', 'I know. I took it. I am sorry.']],
      love: [['d', 'Yeah. Yeah, buddy.']],
      bye: [['d', 'See you, pal.']],
      soup: [['d', 'There it is.']],
      book: [['m', 'Yes. They are books. They are coming with me.']],
      baby: [['d', 'Hey. Be nice.']],
      pruitt: [['d', 'Hey. Be nice.']],
    },
  },
  {
    id: 'fri_evening', day: 'FRIDAY', part: 'Evening', state: 'eve', room: 'hallway', obj: 'the front door', acts: false, friday: true, final: true, boxes: () => S.f.loop ? Math.max(S.boxesNow, 4) : 0, only: alive,
    place: HALL_FINAL,
    tracks: [
      { room: 'hallway', id: 'final', start: 2.5, lines: [
        ['g', () => S.f.loop ? 'Well, that is everything. It is all still here, but that is everything.' : 'That is everything.'],
        ['m', 'Coat, Wrennie.'],
        ['w', 'Wait.'],
        ['cap', 'Wren stands in the middle of the hall. She is looking at the door. Then the ceiling. Then all of it.'],
        ['w', 'House?'],
        ['m', 'Wren.'],
        ['d', 'Let her, hon.'],
        ['w', 'Do you want us to go?', { after: () => { askFinal(); } }],
      ] },
    ],
    hot: {},
  },
  // If you kept Wren and nobody else, Friday is short and everyone is very gentle.
  {
    id: 'fri_dead', day: 'FRIDAY', part: 'Morning', state: 'day', room: 'kitchen', acts: false, boxes: 8, gShut: true, only: () => !alive(),
    place: {
      w: { room: 'kitchen', x: -1.14, z: .3, yaw: Math.PI / 2, seat: 1, stand: [-2.4, .8] },
      m: { room: 'garage', x: -.42, z: .25, yaw: Math.PI, car: true, dead: true },
      d: { room: 'garage', x: .42, z: .25, yaw: Math.PI, car: true, dead: true },
      g: { room: 'kitchen', x: 2.3, z: -.95, yaw: -Math.PI / 2 },
    },
    tracks: [
      { room: 'kitchen', start: 2.5, lines: [
        ['cap', 'The truck comes at nine. Nobody has told the truck.'],
        ['g', 'Hello? Front door was open. Hey, kid. Your folks around?'],
        ['w', 'They are in the car.'],
        ['g', 'Okay. I will just go on out there.', { after: () => { moveTo(GARY, 'garage', 1.35, 1.2, -Math.PI / 2); } }],
        ['cap', 'He is gone for some time.'],
        ['w', 'He is nice. He was here before.'],
        ['cap', 'All day there are people in the house. They wipe their feet. They hold the big door open. Nobody talks to you.'],
      ] },
      // If you've gone out there, you see him find them.
      { room: 'garage', start: 1, waitFor: () => GARY.room === 'garage' && !GARY.dest, lines: [
        ['g', 'Hello? Folks? I am here about the...', { after: () => { Render.setGarage(0); Render.setHaze(0); } }],
        ['cap', 'He gets the big door up with both hands, and it is morning in the garage.'],
        ['g', 'Oh.'],
        ['g', 'Oh, no. No, no.'],
        ['cap', 'He stands by the car for a while. He does not touch anything. Then he takes off his hat, though he is not wearing one.'],
      ] },
    ],
    hot: {},
  },
  {
    id: 'fri_dead_eve', day: 'FRIDAY', part: 'Evening', state: 'eve', room: 'hallway', obj: 'the front door', acts: false, friday: true, final: true, boxes: 8, only: () => !alive(),
    place: {
      a: { room: 'hallway', x: .55, z: -2.7, yaw: 0 },
      w: { room: 'hallway', x: -.2, z: -1.1, yaw: Math.PI },
    },
    tracks: [
      { room: 'hallway', id: 'final', start: 2.5, lines: [
        ['a', 'Hi, Wrennie. It is Aunt Annie. Do you remember me?'],
        ['a', 'Let\'s get your coat, sweetheart. We can come back for all this.'],
        ['a', 'Is there anything you want to bring?'],
        ['w', 'It would not fit.'],
        ['cap', 'Annie does not ask. She has been told not to ask about things.'],
        ['w', 'House?'],
        ['w', 'Do you want me to go?', { after: () => { askFinal(); } }],
      ] },
    ],
    hot: {},
  },
  // Three Saturdays. It could be any number of them.
  {
    id: 'sat_1', day: 'SATURDAY', part: '', state: 'day', room: 'kitchen', acts: true, boxes: 3, saturday: true, only: () => S.f.ending === 'saturday',
    place: SAT_PLACE,
    tracks: [{ room: 'kitchen', start: 2.5, lines: [
      ['w', 'Why is Saturday circled?'],
      ['m', 'It is not circled, honey.'],
      ['w', 'It is circled on all of them.'],
      ['m', 'Eat.'],
      ['d', 'Have you seen the tape? The good tape?'],
      ['m', 'We do not need the tape.'],
      ['d', 'No. That is right.'],
      ['g', 'Could you pass the salt?'],
      ['cap', 'Marion passes Gary the salt.'],
      ['g', 'I had a van.'],
      ['d', 'Did you?'],
      ['g', 'I think it was a van.'],
      ['cap', 'Everyone chews.'],
    ] }],
    hot: SAT_HOT,
  },
  {
    id: 'sat_2', day: 'SATURDAY', part: '', state: 'day', room: 'kitchen', acts: true, boxes: 1, saturday: true, only: () => S.f.ending === 'saturday',
    place: SAT_PLACE,
    tracks: [{ room: 'kitchen', start: 2.5, lines: [
      ['w', 'Good morning, house.'],
      ['m', 'Say good morning to Gary.'],
      ['w', 'Good morning, Gary.'],
      ['g', 'Morning, kid.'],
      ['d', 'You want toast?'],
      ['w', 'It does not like toast.'],
      ['d', 'Okay, no toast.'],
      ['m', 'I slept very well.'],
      ['d', 'Me too.'],
      ['cap', 'Everyone chews.'],
    ] }],
    hot: SAT_HOT,
  },
  {
    id: 'sat_3', day: 'SATURDAY', part: '', state: 'day', room: 'kitchen', acts: true, boxes: 0, saturday: true, only: () => S.f.ending === 'saturday',
    place: SAT_PLACE,
    tracks: [{ room: 'kitchen', start: 2.5, lines: [
      ['m', 'Is it warm enough for everybody?'],
      ['d', 'It is very warm.'],
      ['w', 'It is really good at it.'],
      ['cap', 'Everyone chews.'],
      ['cap', 'Everyone is home.'],
    ] }],
    hot: SAT_HOT,
  },
];
const LOOP_BEATS = [
  [['cap', '{p} went out the front door with a box. {p} has come in from the kitchen with a box.'], ['carrier', 'Huh.']],
  [['m', 'Where are you going with that?'], ['d', 'The truck.'], ['m', 'The truck is that way.'], ['d', 'I know where the truck is.']],
  [['g', 'Folks, I have had this box for a while.'], ['d', 'Try it again.'], ['g', 'I did try it again.']],
  [['cap', 'Marion takes the box from {p}. She sets it on the floor. She walks out the front door, and comes in from the kitchen.'], ['m', 'Okay.'], ['carrier', 'Okay.']],
  [['g', 'Thirty years.'], ['d', 'You have never had one do that?'], ['g', 'Oh, I have had one do that.']],
  [['g', 'This is going to be extra.']],
  [['cap', 'Nobody screams. They try it again.']],
  [['d', 'It is a good door. It just does not go outside.']],
  [['cap', 'Nobody says anything. They try it again.']],
];
// "Don't go" is a no, and "I love you, go" is a go, so a real no beats a go, and a go beats a wish.
const FINAL_STAY = ['stay', 'no', 'nope', 'never', 'dont', 'not', 'remain', 'wait', 'shut', 'close'].map(squeeze);
const FINAL_WISH = ['please', 'love', 'mine', 'hug', 'hold', 'home', 'here', 'back', 'kitchen'].map(squeeze);
const FINAL_GO = ['go', 'yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'leave', 'bye', 'goodbye', 'out', 'open', 'fine', 'alright', 'free'].map(squeeze);
const DOOR_LOOP_WORDS = ['stay', 'no', 'dont', 'never', 'shut', 'close', 'kitchen', 'back', 'home', 'here', 'wait', 'stop', 'lock', 'please', 'in', 'inside', 'loop', 'again', 'around'].map(squeeze);
const DOOR_OPEN_WORDS = ['go', 'open', 'out', 'leave', 'outside', 'truck', 'free', 'bye', 'goodbye', 'ok', 'okay', 'yes'].map(squeeze);
const WREN_GOODBYE = [['w', 'You are really cold.'], ['m', 'Wren.'], ['d', 'One minute, hon.'], ['cap', 'Marion looks at her watch, and does not look at it.']];
const ENDINGS = {
  go: ['YOU CAN GO', 'The kitchen is sixty-eight degrees.', 'Nobody is home.'],
  go_dead: ['YOU CAN GO', 'The kitchen is sixty-eight degrees. Two of them never left.', ''],
  forward: ['FORWARDING ADDRESS', 'Marion locks up, and does not look back.', 'Their mail still comes, for a while. You keep it very tidy.'],
  forward_dead: ['FORWARDING ADDRESS', 'Annie locks up.', 'Her mail still comes, for a while. You keep it very tidy.'],
  saturday: ['SATURDAY', '', ''],
  all_home: ['EVERYONE IS HOME', '', ''],
};
