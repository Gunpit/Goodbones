// Day 1. You learn what is going on from what they say to each other, in whichever room you happen to be listening.
// You can always type. Typing stops the conversation in that room, and they answer you, and then they go on, or don't.
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- The house ----
const obj = (name, look, at, stand, voice) => ({ name, look, at: V3(...at), stand, voice, muted: 0, cans: 0, spoke: 0 });
const ROOMS = {
  kitchen: {
    label: 'the kitchen',
    ring: [[-2.2, -1.25], [-.5, -1.35], [.6, -1.35], [1.6, -1.2], [2.35, -.95], [2.15, .3], [2.0, 1.75], [0, 1.85], [-1.9, 1.75], [-2.4, 1.1], [-2.4, .1]],
    exit: 'gk',
    objects: [
      obj('the fridge', 'fridge', [2.45, 1.12, -1.84], [1.75, -1.2], { pitch: 150 }),
      obj('the stove', 'stove', [1.55, .62, -1.95], [1.5, -1.3], { pitch: 108, comb: .012, ring: .5, shakeRate: 11, shake: 6 }),
      obj('the kettle', 'sink', [1.45, 1.02, -2.2], [1.3, -1.35], { pitch: 395, wave: 'square', comb: .0031, ring: .62, shakeRate: 37, shake: 14 }),
      obj('the dishwasher', 'cabinet', [-.02, .5, -1.97], [0, -1.3], { pitch: 92, comb: .017, ring: .55, shakeRate: 8, shake: 15, wander: .4 }),
      obj('the sink', 'sink', [-.5, 1.05, -2.2], [-.5, -1.35], { pitch: 235, wave: 'triangle', comb: .0048, ring: .55, shakeRate: 13, shake: 12 }),
      obj('the radiator', 'radiator', [-2.9, .42, -.4], [-2.2, -.45], { pitch: 68, comb: .021, ring: .62, shakeRate: 6, shake: 5, wander: .12 }),
      obj('the telephone', 'phone', [-2.97, 1.4, -.6], [-2.35, -.6], { pitch: 285, comb: .002, ring: .3, shake: 1, wander: .1 }),
      obj('the lamp', 'chair', [0, 1.85, .3], [.6, -1.3], { pitch: 470, wave: 'triangle', comb: .0026, ring: .45, shakeRate: 52, shake: 20, wander: .35 }),
      obj('the garage door', 'door', [-3.02, 1.05, 1.1], [-2.35, 1.1], { pitch: 124, comb: .014, ring: .35, shakeRate: 4, shake: 18, wander: .5 }),
      obj('the hall door', 'door', [3.02, 1.05, -.95], [2.35, -.95], { pitch: 138, comb: .012, ring: .35, shakeRate: 4, shake: 16, wander: .45 }),
    ],
  },
  hallway: {
    label: 'the hall',
    // Around the foot of the stairs, never across them: the bottom step is the corner to clear.
    ring: [[0, -3.35], [1.05, -2.3], [.55, -.9], [.25, 1.3], [-1.05, 1.0], [-1.2, .1], [-.42, .42], [-.35, -.6], [-.3, -2.4]],
    exit: 'front',
    objects: [
      obj('the front door', 'door', [0, 1.05, -4.0], [0, -3.3], { pitch: 104, comb: .017, ring: .4, shakeRate: 3, shake: 14, wander: .4 }),
      obj('the stair railing', 'chair', [-.68, 1.5, -1.4], [-.35, -1.0], { pitch: 178, wave: 'triangle', comb: .006, ring: .5, shakeRate: 22, shake: 10, wander: .3 }),
      obj('the coats', 'wall', [1.6, 1.2, -.75], [1.0, -.75], { pitch: 88, wave: 'triangle', comb: .022, ring: .08, shake: 1, wander: .08 }),
      obj('the hall lamp', 'chair', [.2, 2.0, .9], [.25, .5], { pitch: 455, wave: 'triangle', comb: .0026, ring: .45, shakeRate: 50, shake: 18 }),
      obj('the kitchen door', 'door', [-1.72, 1.05, 1.0], [-1.05, 1.0], { pitch: 138, comb: .012, ring: .35, shakeRate: 4, shake: 16, wander: .45 }),
      obj('the living room door', 'door', [1.72, 1.05, -2.3], [1.05, -2.3], { pitch: 118, comb: .015, ring: .35, shakeRate: 4, shake: 16, wander: .5 }),
    ],
  },
  living: {
    label: 'the living room',
    ring: [[1.05, -.6], [1.7, 1.1], [1.0, 1.35], [-.6, 1.3], [-1.9, .75], [-2.35, -1.0], [-1.6, -.55], [-.2, -.6]],
    exit: 'hl',
    objects: [
      obj('the bookshelf', 'cabinet', [-2.8, 1.2, 1.0], [-2.1, .9], { pitch: 112, comb: .016, ring: .3, shake: 2, wander: .15 }),
      obj('the sofa', 'wall', [-.25, .5, -1.45], [-.2, -.6], { pitch: 84, wave: 'triangle', comb: .02, ring: .2, shakeRate: 5, shake: 3 }),
      obj('the radiator', 'radiator', [.75, .4, -2.36], [1.05, -.6], { pitch: 68, comb: .021, ring: .62, shakeRate: 6, shake: 5, wander: .12 }),
      obj('the floor lamp', 'chair', [-2.3, 1.5, -2.15], [-1.75, -.55], { pitch: 440, wave: 'triangle', comb: .0026, ring: .45, shakeRate: 48, shake: 18 }),
      obj('the door', 'door', [-3.02, 1.05, -1.0], [-2.35, -1.0], { pitch: 118, comb: .015, ring: .35, shakeRate: 4, shake: 16, wander: .5 }),
    ],
  },
  wren: {
    label: "Wren's room",
    ring: [[-.4, -1.0], [-.4, .3], [-1.3, .6], [.2, 1.35], [1.3, .8], [1.35, -.2], [.4, -.4]],
    exit: 'wd',
    objects: [
      obj('the vent', 'ceiling', [-1.95, .67, 1.25], [-1.25, 1.25], { pitch: 96, comb: .022, ring: .68, shakeRate: 9, shake: 7, wander: .2 }),
      obj('the wall', 'door', [.2, 1.5, -2.06], [.2, -1.0], { pitch: 132, comb: .009, ring: .35, shake: 2, wander: .18 }),
      obj('the little hatch', 'phone', [-2.02, 1.05, .3], [-1.3, .4], { pitch: 76, comb: .023, ring: .68, shakeRate: 3, shake: 8, wander: .2 }),
      obj('the desk', 'cabinet', [.9, .5, -1.92], [.8, -.6], { pitch: 165, wave: 'triangle', comb: .008, ring: .25, shake: 2 }),
      obj('the bedside lamp', 'chair', [-.62, .82, -1.72], [-.4, -1.0], { pitch: 420, wave: 'triangle', comb: .0026, ring: .45, shakeRate: 48, shake: 18 }),
      obj('the door', 'door', [2.02, 1.05, -.2], [1.35, -.2], { pitch: 132, comb: .012, ring: .35, shakeRate: 4, shake: 15, wander: .4 }),
    ],
  },
  garage: {
    label: 'the garage',
    ring: [[2.35, -.6], [1.35, .25], [1.35, 2.3], [-1.35, 2.3], [-1.35, .25], [-1.45, -3.0], [1.45, -3.0]],
    exit: 'gk',
    objects: [
      obj('the garage door', 'ceiling', [.2, 2.3, -3.8], [1.45, -3.0], { pitch: 82, comb: .024, ring: .7, shakeRate: 5, shake: 9, wander: .15 }),
      obj('the car radio', 'phone', [0, 1.0, -.3], [1.35, 1.9], { pitch: 260, comb: .0024, ring: .35, shake: 2, wander: .1 }),
      obj('the workbench', 'cabinet', [-2.72, .9, 1.5], [-1.9, 1.6], { pitch: 110, comb: .015, ring: .3, shake: 3 }),
      obj('the side door', 'door', [3.02, 1.05, -.6], [2.35, -.6], { pitch: 124, comb: .014, ring: .35, shakeRate: 4, shake: 18, wander: .5 }),
    ],
  },
  bedroom: {
    label: 'the bedroom',
    ring: [[.6, -1.4], [1.4, -.5], [1.9, 1], [.8, 1.7], [-1.2, 1.6], [-1.5, .1], [-1.9, -.6], [.4, .35]],
    exit: 'bd',
    objects: [
      obj('the radiator', 'radiator', [1.0, .4, -2.26], [1.0, -1.5], { pitch: 68, comb: .021, ring: .62, shakeRate: 6, shake: 5, wander: .12 }),
      obj('the headboard', 'cabinet', [-.6, .75, -2.26], [.5, -1.3], { pitch: 96, comb: .015, ring: .3, shake: 3, wander: .15 }),
      obj('the dresser', 'cabinet', [-2.1, .6, .9], [-1.3, .8], { pitch: 118, comb: .012, ring: .3, shake: 3 }),
      obj('the bedside lamp', 'chair', [-1.75, .9, -1.95], [-1.4, .4], { pitch: 420, wave: 'triangle', comb: .0026, ring: .45, shakeRate: 48, shake: 18 }),
      obj('the door', 'door', [-2.52, 1.05, -.6], [-1.9, -.6], { pitch: 132, comb: .012, ring: .35, shakeRate: 4, shake: 15, wander: .4 }),
    ],
  },
};
const ROOM_ORDER = ['garage', 'kitchen', 'hallway', 'living', 'wren', 'bedroom'];
// What each thing is, so you can tell them apart with your eyes shut. The voice settings keep the words readable: enough top end,
// not too much chopping, a pitch low enough to have harmonics for the vowels. "body" is the thing itself, playing under the voice:
// hum: [Hz, level, wave, lowpass], hum2: [Hz, level], noise: [Hz, Q, level, type], wob: [rate, depth], rise: [multiple, secs], tic: [kind, every Nth sound, level].
const V_RADIATOR = { pitch: 78, fm: .8, sub: .2, chop: .15, chopRate: 4.5, chopWave: 'square', drive: 1.2, lp: 2800, ring: .45, shake: 3, body: { noise: [5200, 2, .012], tic: ['clank', 3, .16] } };
const V_LAMP = { pitch: 300, fm: 1.15, chop: .22, chopRate: 120, chopWave: 'square', hp: 350, gain: .75, wave: 'triangle', shake: 7, wander: .2, body: { hum: [120, .035, 'sawtooth', 3000], tic: ['snap', 6, .06] } };
const V_DOOR = { fm: .92, lean: 12, leanRate: 1.2, scoop: 1.1, glide: .14, double: .25, detune: 18, lp: 3600, shake: 6, wander: .24, body: { tic: ['creak', 4, .28] } };
const VOICES = {
  'kitchen/the fridge': { fm: .96, sub: .12, chop: .12, chopRate: 60, lp: 3800, double: .2, detune: 9, body: { hum: [60, .075, 'sawtooth', 420], noise: [250, .7, .03, 'lowpass'], tic: ['relay', 7, .12] } },    // the compressor, cutting in
  'kitchen/the stove': { pitch: 115, fm: .85, hiss: .14, hissF: 1100, lp: 3000, drive: 1.3, echo: .06, body: { noise: [3200, .8, .035, 'highpass'], tic: ['click', 5, .09] } },                                      // gas, and the igniter
  'kitchen/the kettle': { pitch: 300, fm: 1.3, hp: 600, lp: 7000, scoop: .85, glide: .1, shake: 6, ring: .45, gain: .78, body: { hum: [2350, .03, 'sine', 9000], rise: [1.35, 2.2], noise: [3600, 2, .02], tic: ['rattle', 6, .05] } }, // climbs into a whistle
  'kitchen/the dishwasher': { pitch: 105, fm: .9, chop: .25, chopRate: 5, lp: 3200, shake: 6, lean: 4, leanRate: 1.7, ring: .45, body: { noise: [700, .8, .05], wob: [3.2, .7], tic: ['slosh', 3, .1] } },            // water going around
  'kitchen/the sink': { pitch: 210, fm: 1.05, chop: .15, chopRate: 13, chopWave: 'triangle', echo: .26, echoT: .06, echoFb: .35, peakF: 1900, shake: 6, ring: .45, body: { noise: [1500, 2.5, .018], tic: ['drip', 2, .09] } }, // down a pipe, dripping
  'kitchen/the radiator': V_RADIATOR,
  'kitchen/the telephone': { pitch: 190, hp: 420, lp: 3200, drive: 2.5, hiss: .03, hissF: 1800, peakF: 1600, peak: 8, gain: .9, body: { hum: [350, .018, 'sine', 9000], hum2: [440, .018], tic: ['bell', 9, .035] } }, // a dial tone behind it
  'kitchen/the lamp': V_LAMP,
  'kitchen/the garage door': Object.assign({}, V_DOOR, { pitch: 120, fm: .88, lean: 14, lp: 3400, ring: .3 }),
  'kitchen/the hall door': V_DOOR,
  'hallway/the front door': Object.assign({}, V_DOOR, { fm: .82, sub: .2, lean: 7, leanRate: .7, echo: .26, echoT: .3, echoFb: .3, lp: 3000, body: { noise: [400, .6, .018], wob: [.4, .5], tic: ['creak', 5, .3] } }), // heavy, and the outdoors behind it
  'hallway/the stair railing': { fm: 1.1, chop: .2, chopRate: 19, chopWave: 'triangle', lp: 4200, double: .25, detune: 30, shake: 5, gain: .9, body: { tic: ['rattle', 3, .07] } },                                     // a loose spindle
  'hallway/the coats': { pitch: 110, voiced: .45, hiss: .3, hissF: 1800, lp: 2800, fm: .92, comb: .001, ring: .05, peak: 0, gain: 1.15, body: { noise: [900, .7, .012], tic: ['rustle', 2, .07] } },                  // whispering into wool
  'hallway/the hall lamp': Object.assign({}, V_LAMP, { echo: .12 }),
  'hallway/the kitchen door': V_DOOR,
  'hallway/the living room door': Object.assign({}, V_DOOR, { fm: .86, lean: 14, lp: 3400 }),
  'living/the bookshelf': { pitch: 120, fm: .95, lp: 2600, hiss: .06, hissF: 900, peak: 2, ring: .2, double: .15, detune: 6, body: { tic: ['rustle', 3, .06] } },                                                      // dusty, and turning pages
  'living/the sofa': { pitch: 92, fm: .82, lp: 1700, peak: 1, ring: .1, comb: .001, gain: 1.25, sub: .15, shake: 2, body: { noise: [220, .7, .015, 'lowpass'], tic: ['spring', 4, .08] } },                           // into a cushion, on old springs
  'living/the radiator': V_RADIATOR,
  'living/the floor lamp': Object.assign({}, V_LAMP, { pitch: 285 }),
  'living/the door': Object.assign({}, V_DOOR, { fm: .86, lean: 14, lp: 3400 }),
  'wren/the vent': { fm: 1.04, hp: 280, peakF: 1450, peak: 9, echo: .32, echoT: .13, echoFb: .4, double: .25, detune: 16, shake: 5, ring: .55, body: { noise: [900, 1, .018], wob: [.7, .4], tic: ['tin', 5, .06] } },  // the original: sheet metal and a long duct
  'wren/the wall': { pitch: 125, fm: .88, voiced: .7, hiss: .1, hissF: 1100, lp: 2400, peak: 1, ring: .15, gain: 1.1, body: { tic: ['thump', 6, .06] } },                                                               // through plaster
  'wren/the little hatch': { pitch: 84, fm: .82, echo: .42, echoT: .42, echoFb: .4, lp: 2600, hp: 120, shake: 4, ring: .45, body: { noise: [300, 1, .02], wob: [.5, .5], tic: ['tin', 7, .04] } },                      // from a long way down
  'wren/the desk': { fm: 1.0, chop: .2, chopRate: 9, chopWave: 'square', lp: 3400, peak: 2, body: { tic: ['wood', 2, .09] } },                                                                                         // knocking it out in wood
  'wren/the bedside lamp': Object.assign({}, V_LAMP, { pitch: 270, chop: .14, lp: 5000 }),
  'wren/the door': Object.assign({}, V_DOOR, { fm: 1.02, lean: 9, lp: 4200 }),
  'garage/the garage door': { pitch: 86, fm: .72, sub: .4, echo: .45, echoT: .46, echoFb: .45, glide: .25, scoop: .9, lp: 2400, double: .25, detune: 12, gain: 1.1, ring: .5, body: { hum: [48, .06, 'sawtooth', 300], noise: [180, 1, .03], tic: ['clank', 5, .15] } }, // enormous, and it knows it
  'garage/the car radio': { pitch: 230, hp: 480, lp: 3000, drive: 2.2, hiss: .08, hissF: 2600, chop: .12, chopRate: .7, peakF: 1300, peak: 7, gain: .9, body: { noise: [3000, .5, .035], tic: ['pop', 2, .05] } },     // AM, between stations
  'garage/the workbench': { pitch: 125, fm: .95, lp: 3200, double: .3, detune: 40, drive: 1.2, body: { tic: ['rattle', 2, .1] } },                                                                                     // tools, all of them at once
  'garage/the side door': Object.assign({}, V_DOOR, { pitch: 124, fm: .88, lean: 14, echo: .2, echoT: .2, lp: 3400 }),
  'bedroom/the radiator': Object.assign({}, V_RADIATOR, { gain: .9, chopRate: 3.2, lp: 2500 }),
  'bedroom/the headboard': { pitch: 100, fm: .85, chop: .2, chopRate: 2.2, lp: 2400, peak: 1, sub: .15, body: { tic: ['thump', 3, .12] } },                                                                             // bumping gently, nobody mention it
  'bedroom/the dresser': { fm: .93, lp: 2600, double: .25, detune: 8, hiss: .05, hissF: 900, echo: .14, echoT: .05, echoFb: .3, body: { tic: ['wood', 4, .07] } },                                                      // from inside a drawer
  'bedroom/the bedside lamp': Object.assign({}, V_LAMP, { pitch: 270, chop: .14, lp: 5000 }),
  'bedroom/the door': Object.assign({}, V_DOOR, { fm: .97, lean: 9, lp: 4000 }),
};
for (const r in ROOMS) ROOMS[r].objects.forEach(o => {
  Object.assign(o.voice, VOICES[`${r}/${o.name}`]); o.room = r;
  // Chopping a sound up also makes it quieter, so the choppy ones get that back.
  if (o.voice.chop) o.voice.gain = (o.voice.gain || 1) * (1 + o.voice.chop * .7);
});
// The house is learning. On Wednesday it can barely get a word out. By Friday you can hear exactly what it means.
function howClear(sc) {
  if (sc.prologue) return .1;
  const day = { WEDNESDAY: .15, THURSDAY: .5, FRIDAY: .85, SATURDAY: 1 }[sc.day];
  const part = { Morning: 0, Afternoon: .06, Evening: .12, Night: .16 }[sc.part] || 0;
  return Math.min(1, (day === undefined ? 1 : day) + part);
}
// The words themselves come through better than the story's clarity would say. Breath and the family's own mumble still go by the story's number.
const voiceClear = c => .3 + .7 * c;
const MUMBLE = { m: { pitch: 205, fm: 1, rate: 1 }, d: { pitch: 118, fm: .84, rate: .92 }, w: { pitch: 330, fm: 1.2, rate: 1.1, near: 1 }, g: { pitch: 94, fm: .78, rate: .85 }, a: { pitch: 228, fm: 1.05, rate: 1.05 } };

// ---- Day 1 ----
const SAID_MOST = () => { let b = null, n = 0; for (const k in S.saidCount) if (S.saidCount[k] > n) { n = S.saidCount[k]; b = k; } return b; };
const SCENES = [
  {
    id: 'morning', day: 'WEDNESDAY', part: 'Morning', state: 'day', room: 'kitchen', acts: true, heard: true,
    place: { m: { room: 'kitchen', x: -.5, z: -1.35, yaw: Math.PI, wander: true }, d: { room: 'kitchen', x: 1.14, z: .3, yaw: -Math.PI / 2, seat: 1, stand: [2.15, .3] }, w: { room: 'kitchen', x: -1.14, z: .3, yaw: Math.PI / 2, seat: 1, stand: [-2.4, .8] } },
    tracks: [{ room: 'kitchen', start: 2.5, lines: [
      ['w', 'Why is Friday circled?'],
      ['m', "That's the truck, honey."],
      ['w', 'What if the truck is late?'],
      ['m', 'Eat.'],
      ['d', 'Have you seen the tape? The good tape?'],
      ['m', 'It is in a box.'],
      ['d', 'Which box?'],
      ['m', 'The one you taped.'],
      ['w', 'Dad, why are we moving?'],
      ['d', "It's the mortgage, Wrennie. Grown-up stuff. Money."],
      ['w', 'Mom said it was the school.'],
      ['cap', 'Marion puts a spoon down, very carefully.'],
      ['m', "It's both. It is a lot of things."],
      ['d', "Yeah. It's both."],
      ['w', "The house doesn't want us to go."],
      ['m', 'Wren. We talked about this.'],
      ['w', "I didn't say anything. It's just a fact."],
      ['d', 'You want toast?'],
      ['w', "It doesn't like toast."],
      ['cap', 'Nobody asks how she knows.'],
      ['d', 'We have got soup.'],
      ['m', 'It is nine in the morning, Dell.'],
    ] }],
    hot: {
      friday: [['m', 'Who told you about Friday?'], ['w', 'I did.']],
      truck: [['w', 'See? It knows about the truck.'], ['m', 'It does not know anything. It is a compressor.']],
      mortgage: [['d', 'Did it just say mortgage?'], ['m', 'It has been listening to you.']],
      toast: [['w', 'See.'], ['d', 'Okay, no toast.']],
    },
  },
  {
    id: 'afternoon', day: 'WEDNESDAY', part: 'Afternoon', state: 'day', room: 'kitchen', acts: true, heard: true,
    place: { m: { room: 'kitchen', x: -2.35, z: -.6, yaw: -Math.PI / 2, reach: 1 }, d: { room: 'living', x: -1.9, z: .35, yaw: -Math.PI / 2, reach: 1 }, w: { room: 'living', x: -1.0, z: 1.0, yaw: -Math.PI / 2 } },
    tracks: [
      { room: 'kitchen', start: 2, lines: [
        ['m', "Hi, Annie. No, we're fine. We're packing."],
        ['m', "It's a good school. Small classes. They have a person there, for the kids who..."],
        ['m', "No. She's fine. She's eight."],
        ['m', "She has plenty of friends."],
        ['cap', 'Marion winds the cord around her hand, then lets it go.'],
        ['m', 'Dell tells everyone it is the mortgage. It is easier.'],
        ['m', "I'm not sleeping, is the thing."],
        ['m', 'I keep thinking about Mom. In that bed.'],
        ['m', 'The nurse said sometimes they wait for permission.'],
        ['m', 'So I held her hand and I said, "You can go, Mom. You can go."'],
        ['cap', 'Marion stands there for a while.'],
        ['m', "No. It's just a house, Annie."],
        ['m', 'Anyway. Do you want the good pots?'],
      ] },
      { room: 'living', start: 3, lines: [
        ['d', 'These going or staying? Wrennie?'],
        ['w', 'What are they?'],
        ['d', 'Books. We used to have books.'],
        ['w', 'Will they fit at the condo?'],
        ['d', "You'll like the condo. Everything's new. In-unit laundry."],
        ['w', 'I like the stairs. Does the condo have stairs?'],
        ['d', 'The condo has a very nice elevator.'],
        ['w', 'Do you like the condo?'],
        ['d', 'Sure. Yeah. Sure.'],
        ['w', 'You said sure twice.'],
        ['d', 'I am going to go find more boxes.'],
        ['w', 'Okay. I have to go tell my room.', { after: () => moveTo(W, 'wren', .2, .4, Math.PI) }],
      ] },
      // Wren talks to you. She always has. These are the things that matter later, and they should just sound sweet.
      { room: 'wren', after: 'living', waitFor: () => W.room === 'wren' && !W.dest, start: 1.5, lines: [
        ['w', 'Hi. Did you hear? They said Friday again.'],
        ['w', "You don't have to be sad. I can visit."],
        ['w', 'You talk now, right? I heard you. Say something.', { ask: 7 }],
        ['w', 'Wow!'],
        ['w', 'When I fall asleep in the car, I wake up in my bed. Dad carries me in. You do not even have to do anything.'],
        ['w', 'That is a good one, right?', { ask: 4 }],
        ['w', 'Grandma went to sleep in the big bed. She got really still and really calm.'],
        ['w', 'And Mom said it is okay. She does not have to go anywhere now.'],
        ['w', 'So that is nice for her.'],
        ['w', 'And when it is cold, you shut the door. That is your job. You keep everybody warm.'],
        ['w', "You're really good at it."],
        ['w', 'Okay. Practice. Say "Wren."', { ask: 8 }],
      ] },
    ],
    hot: {
      mortgage: [['m', 'Hang on, Annie. No. Nothing. The fridge.'], ['d', 'Who said that?']],
      school: [['m', "Hang on. Who said that?"], ['m', "Nothing. It's the appliance. I told you about the appliance."]],
      grandma: [['cap', 'Marion stops with the cord in her hand.'], ['m', 'I will call you back.']],
      condo: [['d', 'Everybody has an opinion about the condo.'], ['w', 'It does not like it either.']],
      laundry: [['d', "It's a selling point. It's just a selling point."]],
      elevator: [['d', 'It is a very nice elevator, buddy.']],
      wren: [['w', 'Good! That is me!']],
    },
  },
  {
    id: 'dinner', day: 'WEDNESDAY', part: 'Evening', state: 'eve', room: 'kitchen', acts: true,
    place: { m: { room: 'kitchen', x: 0, z: -.46, yaw: 0, seat: 1, stand: [0, -1.3] }, d: { room: 'kitchen', x: 1.14, z: .3, yaw: -Math.PI / 2, seat: 1, stand: [2.15, .3] }, w: { room: 'kitchen', x: -1.14, z: .3, yaw: Math.PI / 2, seat: 1, stand: [-2.4, .8] } },
    tracks: [{ room: 'kitchen', start: 2, lines: [
      ['d', 'Pass the salt.'],
      ['cap', 'Marion passes the salt.'],
      ['m', 'You look tired.'],
      ['d', "I'm fine. You look tired."],
      ['w', 'The house says hi.'],
      ['m', 'Eat your dinner.'],
      ['d', () => S.spoke ? `The fridge said "${SAID_MOST() || 'something'}" to me today. Clear as day.` : 'Did the fridge make a noise today?'],
      ['m', 'It is a compressor, Dell.', { if: () => S.spoke }],
      ['m', 'Did you call the guy?'],
      ['d', "I'm calling the guy. He's coming tomorrow."],
      ['w', 'What is he going to do?'],
      ['d', 'Fix it.'],
      ['w', "It's not broken."],
      ['m', 'Wren.'],
      ['w', "It's learning."],
      ['cap', 'Everyone chews.'],
    ] }],
    hot: {
      salt: [['cap', 'Marion passes the salt to the fridge. She stops. She takes it back.']],
      guy: [['d', 'Yeah. A guy is coming. No offense.']],
      fix: [['w', 'See? It knows what you said.'], ['d', 'That is exactly what a broken fridge would say.']],
    },
  },
  {
    id: 'night', day: 'WEDNESDAY', part: 'Night', state: 'night', room: 'bedroom', acts: false,
    place: { m: { room: 'bedroom', x: -1.0, z: -.1, yaw: 0, lie: true }, d: { room: 'bedroom', x: -.2, z: -.1, yaw: 0, lie: true }, w: { room: 'wren', x: -1.42, z: -.2, yaw: 0, lie: true } },
    tracks: [
      { room: 'wren', start: 1, lines: [['w', 'Goodnight, house.', { ask: 5 }], ['cap', 'Wren is asleep, with one foot out of the blanket.']] },
      { room: 'bedroom', start: 3, lines: [
        ['m', () => S.delays >= 3 ? 'We got nothing done today.' : 'We got the kitchen done. Most of it.'],
        ['d', () => S.delays >= 3 ? 'No. It was a strange day.' : 'That is good.'],
        ['cap', 'The radiator ticks.'],
        ['m', 'Are you awake?'],
        ['d', 'No.'],
        ['m', "It's started again."],
        ['d', 'What has?'],
        ['m', 'You know what.'],
        ['d', "She's eight, Marion. Kids talk to houses."],
        ['m', 'I know they do.'],
        ['d', 'So.'],
        ['cap', 'The radiator ticks. Neither of them sleeps.'],
        ['m', "It's not her I heard."],
      ] },
    ],
    // If you make a sound here, she hears it, and that is all she needs.
    hot: { any: [['m', 'There. THERE. You heard that.'], ['d', '...It is the pipes, Marion. Go to sleep.']] },
    anyHot: 'bedroom',
  },
];
SCENES.unshift(...PROLOGUE_SCENES);
SCENES.push(...DAY2_SCENES, ...DAY3_SCENES);
const RESUME = ['Anyway.', 'Where was I.', 'As I was saying.', 'Ignore it.', 'Like I said.'];
const WREN_SILENT = 'That is okay. You can do it later.';

const S = {
  ready: false, on: false, time: 0, room: 'kitchen', obj: ROOMS.kitchen.objects[0], typed: '', said: '', sinceKey: 99, keyHeld: null, pressT: 0, bend: 1, upHeld: false, downHeld: false, voice: null, cursor: { x: 0, y: 0 },
  heard: {}, saidCount: {}, muI: 0, misI: 0, newI: 0, resI: 0, wrenI: 0, spoke: 0, heat: 0, subs: [], sub: null, arm: 'none', len: .02, close: 0, hugT: 0, hugs: 0, hugObj: null, hugP: null, left: null, right: null,
  moodT: 0, tipped: 0, cans: [], unplugs: 0, scene: null, sceneI: -1, tracks: [], paused: 0, endT: 0, card: false, finished: false, roomTold: false,
};
S.g = { shut: false, p: 0, asleep: false, wake: 0, outcome: null, noteI: 0, spoke: 0 };
S.tenseTalks = 0; S.tenseI = 0; S.tenseHug = 0;
S.air = 1; S.winded = false; S.pullIn = false; S.saidAir = []; S.airTold = false;
S.known = { [squeeze('good')]: 'w', [squeeze('bones')]: 'w' }; S.recent = {}; S.delays = 0; S.errandN = {}; S.mushTold = false;
S.f = { loop: false, loops: 0, beat: 0, time: 0, carriers: [], asked: false, askT: 0, tries: 0, answered: null, ending: null, endT: 0, script: null, wait: 0, goodbye: 0, hugged: false, leaving: false };
let M, D, W, GARY, ANNIE, scene, all, CAN_MAT, BOX_MAT;
const v = { a: V3(0, 0, 0), b: V3(0, 0, 0), c: V3(0, 0, 0), d: V3(0, 0, 0), g: V3(0, 0, 0), f: V3(0, 0, 0), r: V3(0, 0, 0), mid: V3(0, 0, 0), ch: V3(0, 0, 0) };
const NAMES = { m: 'Marion', d: 'Dell', w: 'Wren', g: 'Gary', a: 'Annie' };
const PITCH = { m: 205, d: 118, w: 330, g: 96, a: 225 };

function fill(text, o, w) {
  const nm = (o || S.obj).name;
  return text.replace(/\{obj\}/g, nm).replace(/\{Obj\}/g, nm.charAt(0).toUpperCase() + nm.slice(1)).replace(/\{w\}/g, w || '');
}
function dur(text) { return Math.max(1.9, text.length * .056 + .85); }
function say(who, text) { if (S.subs.length > 3) S.subs.shift(); const t = fill(text); S.subs.push({ who, text: t, dur: dur(t), reply: true }); }
function tip(t) { $('tip').textContent = t || ''; }
function drawSub() {
  const el = $('sub');
  if (S.sub && !S.sub.drawn) {
    S.sub.drawn = true; el.innerHTML = '';
    const sp = document.createElement('span');
    if (S.sub.who === 'cap') { sp.className = 'cap'; sp.textContent = S.sub.text; }
    else {
      // Everyone's words are the same color as their dot on the map.
      sp.style.color = MAP.COL[S.sub.who] || '';
      const b = document.createElement('b'); b.textContent = NAMES[S.sub.who] || ''; sp.appendChild(b);
      sp.appendChild(document.createTextNode(S.sub.text));
      Audio2.mumble(S.sub.text, MUMBLE[S.sub.who] || MUMBLE.m, S.sub.dur * .86, S.clear === undefined ? 1 : S.clear);
    }
    el.appendChild(sp);
  }
  if (!S.sub && el.firstChild) el.innerHTML = '';
}

// ---- People ----
function controller(p, id) {
  Object.assign(p, { id, q: [], cur: null, seatWant: 0, attn: 0, faceYaw: null, carrying: false, gone: false, dance: 0, hop: 0, sleepy: 0, held: false, home: null, reachWant: 0, waveWant: 0, y: 0, wave: 0, room: null, lie: false, jobWander: false });
}
function ringOf(p) { return ROOMS[p.room].ring; }
function ringIndex(ring, x, z) { let best = 0, bd = 1e9; ring.forEach((r, i) => { const d = Math.hypot(r[0] - x, r[1] - z); if (d < bd) { bd = d; best = i; } }); return best; }
function route(p, x, z) { return routeIn(p.room, p.x, p.z, x, z); }
function routeIn(room, fx, fz, x, z) {
  const steps = [], ring = ROOMS[room].ring;
  if (Math.hypot(x - fx, z - fz) > 1.1) {
    let i = ringIndex(ring, fx, fz); const end = ringIndex(ring, x, z), n = ring.length, fwd = (end - i + n) % n, dir = fwd <= n - fwd ? 1 : -1;
    steps.push({ t: 'walk', x: ring[i][0], z: ring[i][1] });
    while (i !== end) { i = (i + dir + n) % n; steps.push({ t: 'walk', x: ring[i][0], z: ring[i][1] }); }
  }
  steps.push({ t: 'walk', x, z });
  return steps;
}
const wait = s => ({ t: 'wait', s });
const doIt = f => ({ t: 'do', f });
const faceObj = o => doIt(p => { p.faceYaw = Math.atan2(o.at.x - p.x, o.at.z - p.z); });
function order(p, steps) { if (p.held || p.lie) return false; p.q = steps; p.cur = null; p.reachWant = 0; p.waveWant = 0; p.faceYaw = null; return true; }
function goHome(p) {
  const h = p.home;
  const stand = h.stand || [h.x, h.z];
  return route(p, stand[0], stand[1]).concat({ t: 'walk', x: h.x, z: h.z }, doIt(q => { if (h.seat) q.seatWant = 1; q.faceYaw = h.yaw; if (h.seat) q.yaw = h.yaw; q.reachWant = h.reach || 0; }));
}
// Getting from room to room. Nobody teleports: they walk to the door, it opens, they go through, it shuts,
// and they come in the other side of it. If you are in either room, you see that half of it.
const openDoor = id => ({ t: 'dooropen', id });
const shutDoor = id => ({ t: 'doorshut', id, s: 1.5 });
function passThrough(from, to, id) {
  const a = HOUSE.end(id, from), b = HOUSE.end(id, to), steps = [];
  if (a && a.stand) steps.push(openDoor(id), { t: 'walk', x: a.beyond[0], z: a.beyond[1] }, shutDoor(id));
  return steps.concat(doIt(q => {
    q.room = to; q.cur = null;
    if (b && b.stand) { q.x = b.beyond[0]; q.z = b.beyond[1]; q.yaw = Math.atan2(b.stand[0] - q.x, b.stand[1] - q.z); q.gone = false; }
    else q.gone = true;
  }), ...(b && b.stand ? [openDoor(id), { t: 'walk', x: b.stand[0], z: b.stand[1] }] : []));
}
function travelSteps(p, room, x, z, yaw) {
  const steps = [];
  let cx = p.x, cz = p.z;
  HOUSE.path(p.room, room).forEach(leg => {
    const st = HOUSE.STAIRS;
    if (leg.id === 'stairs') {
      if (leg.from === 'hallway') {
        steps.push(...routeIn('hallway', cx, cz, st.base[0], st.base[1]), { t: 'walk', x: st.top[0], z: st.top[1] }, doIt(q => { q.room = 'landing'; q.gone = true; q.cur = null; }), wait(1.4));
      } else {
        steps.push(wait(1.2), doIt(q => { q.room = 'hallway'; q.x = st.top[0]; q.z = st.top[1]; q.gone = false; q.cur = null; }), { t: 'walk', x: st.base[0], z: st.base[1] });
        cx = st.base[0]; cz = st.base[1];
      }
      return;
    }
    const a = HOUSE.end(leg.id, leg.from), b = HOUSE.end(leg.id, leg.to);
    if (a && a.stand) steps.push(...routeIn(leg.from, cx, cz, a.stand[0], a.stand[1]));
    steps.push(...passThrough(leg.from, leg.to, leg.id));
    if (b && b.stand) { cx = b.stand[0]; cz = b.stand[1]; }
  });
  if (ROOMS[room]) steps.push(...routeIn(room, cx, cz, x, z));
  steps.push(doIt(q => { q.dest = null; q.home = { x, z, yaw }; q.faceYaw = yaw; }));
  return steps;
}
function moveTo(p, room, x, z, yaw) {
  p.errand = false;
  p.dest = { room, x, z, yaw }; p.home = null;
  order(p, travelSteps(p, room, x, z, yaw));
}
// Go through this room's door, stay gone a moment, come back. Marion, mostly.
function stepOut(p, secs, then) {
  const id = ROOMS[p.room].exit, a = HOUSE.end(id, p.room);
  return route(p, a.stand[0], a.stand[1]).concat(openDoor(id), { t: 'walk', x: a.beyond[0], z: a.beyond[1] }, shutDoor(id), doIt(q => { q.gone = true; }), wait(secs), doIt(q => { q.gone = false; }), openDoor(id), { t: 'walk', x: a.stand[0], z: a.stand[1] }, doIt(q => { if (then) then(q); }));
}
function place(p, c) {
  p.room = c.room; p.x = c.x; p.z = c.z; p.yaw = c.yaw;
  p.seated = c.seat ? 1 : 0; p.seatWant = c.seat ? 1 : 0;
  p.reachA = c.reach || 0; p.reachWant = c.reach || 0;
  p.lie = !!c.lie; p.q = []; p.cur = null; p.faceYaw = c.yaw; p.gone = false; p.held = false; p.dance = 0; p.attn = 0; p.dest = null; p.errand = false; p.errHome = null; p.squeezeT = 0; p.waited = 0; p.yieldT = 0;
  p.climb = null; p.dead = false; p.inCar = false; p.carSit = false; p.eyesShut = false; p.crawl = 0; p.sway = 0; p.headRoll = 0;
  if (c.car) { seatInCar(p, c.x); if (c.dead) setDead(p); return; }
  p.home = { x: c.x, z: c.z, yaw: c.yaw, seat: c.seat, stand: c.stand, reach: c.reach };
  p.jobWander = !!c.wander;
  p.moving = 0; p.carrying = false; p.hasBox = false; p.baseY = c.y || 0; p.sleepy = 0;
  if (!c.lie) { p.root.rotation.x = 0; }
}
function runPerson(p, dt) {
  p.seated += (p.seatWant - p.seated) * Math.min(1, dt * 3.4);
  p.reachA += (p.reachWant - p.reachA) * Math.min(1, dt * 4);
  p.wave += (p.waveWant - p.wave) * Math.min(1, dt * 6);
  let moving = 0;
  if (p.held || p.lie || p.dead || p.inCar) { p.moving += (0 - p.moving) * Math.min(1, dt * 9); return; }
  if (!p.cur && p.q.length) p.cur = p.q.shift();
  const c = p.cur;
  if (c) {
    if (c.t === 'wait') { c.s -= dt; if (c.s <= 0) p.cur = null; }
    else if (c.t === 'do') { c.f(p); if (p.cur === c) p.cur = null; }
    else if (c.t === 'dooropen') { HOUSE.want(c.id, 2.1); if (HOUSE.state[c.id].a > .62) p.cur = null; }
    else if (c.t === 'doorshut') { c.s -= dt; if (HOUSE.state[c.id].a < .1 || c.s <= 0) p.cur = null; }
    else if (c.t === 'walk') {
      p.seatWant = 0;
      if (p.yieldT > 0) p.yieldT -= dt; // Waiting for someone to get out of the way.
      else if (p.seated < .12) {
        const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
        // If someone's standing on the spot, don't push at them forever.
        if (c.best === undefined || d < c.best - .04) { c.best = d; c.stall = 0; } else c.stall = (c.stall || 0) + dt;
        // Getting nowhere from further out: stop trying to go around anything for a moment and just walk.
        if (c.stall > 3 && d >= .7) { p.squeezeT = 2.2; c.stall = 0; c.best = d; }
        if (d < .06 || (c.stall > 1.5 && d < .7)) p.cur = null;
        else {
          const st = p.room === 'hallway' && HOUSE.stairY(p.x, p.z) > .01;
          p.stairK = (p.stairK || 0) + ((st ? 1 : 0) - (p.stairK || 0)) * Math.min(1, dt * 7);
          const sp = 1.05 * (p === W ? .95 : 1) * (st ? .68 : 1);
          p.x += dx / d * Math.min(d, sp * dt); p.z += dz / d * Math.min(d, sp * dt);
          // In the last few inches the direction to the spot swings wildly, so don't turn to follow it.
          // And people turn at the speed people turn, however sharp the corner is.
          if (d > .18) p.yaw += clamp(wrapA(Math.atan2(dx, dz) - p.yaw) * dt * 8, -dt * 4.6, dt * 4.6);
          p.walkT += dt * (st ? 9.4 : 6.5);
          moving = 1;
        }
      }
    }
  } else if (p.errand) comeBack(p); // Something cut the errand short. They still go back to what they were doing.
  else if (p.dest) p.q = travelSteps(p, p.dest.room, p.dest.x, p.dest.z, p.dest.yaw); // Something stopped them on the way. They set off again.
  else if (p.home && p.home.x !== undefined && Math.hypot(p.x - p.home.x, p.z - p.home.z) > .2 && ROOMS[p.room]) p.q = goHome(p);
  else if (p.jobWander) {
    // She keeps busy. People do, the week they are moving.
    const ring = ringOf(p), r = ring[Math.floor(Math.random() * 4)];
    p.home = { x: r[0], z: r[1], yaw: Math.PI, reach: 1 };
    p.q = route(p, r[0], r[1]).concat(doIt(q => { q.faceYaw = Math.PI; q.reachWant = 1; }), wait(rand(6, 11)), doIt(q => { q.reachWant = 0; }));
  }
  if (!moving) {
    if (p.attn > 0) p.yaw += wrapA(Math.atan2(S.obj.at.x - p.x, S.obj.at.z - p.z) - p.yaw) * Math.min(1, dt * (p.seated > .5 ? 0 : 3.5));
    else if (p.faceYaw !== null) p.yaw += wrapA(p.faceYaw - p.yaw) * Math.min(1, dt * 4);
  }
  if (p.dance > 0) { p.dance -= dt; p.walkT += dt * 7; moving = Math.max(moving, .7); p.sway = Math.sin(S.time * 7) * .11; p.headRoll = Math.sin(S.time * 7) * .14; p.seatWant = 0; }
  else { p.sway += (0 - p.sway) * Math.min(1, dt * 4); p.headRoll += (0 - p.headRoll) * Math.min(1, dt * 4); }
  p.moving += (moving - p.moving) * Math.min(1, dt * 9);
  p.bracing += (0 - p.bracing) * Math.min(1, dt * 4);
  p.patA += (0 - p.patA) * Math.min(1, dt * 3);
  p.squeeze += (0 - p.squeeze) * Math.min(1, dt * 4);
}
// Nobody walks through anybody, and nobody gets shoved. If someone's ahead of you going your way, or busy in your way, you wait.
// If they're coming toward you or just standing there, you step around them. People standing still are left alone.
// Cutscenes are staged by hand and don't use this.
function keepApart(dt) {
  if (S.scene && S.scene.locked) return;
  const ps = all.filter(p => p.room && ROOMS[p.room] && !p.gone && !p.lie && !p.inCar && !p.floorSit);
  const heading = p => {
    const c = p.cur;
    if (!c || c.t !== 'walk') return null;
    const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
    return d > .05 ? [dx / d, dz / d] : null;
  };
  const toGo = p => p.cur && p.cur.t === 'walk' ? Math.hypot(p.cur.x - p.x, p.cur.z - p.z) : 0;
  ps.forEach(a => {
    if (a.squeezeT > 0) { a.squeezeT -= dt; return; }
    const h = heading(a);
    if (!h) { a.waited = 0; return; }
    let blocked = false;
    ps.forEach(b => {
      if (a === b || a.room !== b.room || b.squeezeT > 0) return;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || .001;
      const r = ((a.hasBox ? .4 : .27) * a.s + (b.hasBox ? .4 : .27) * b.s) * 1.05;
      if (d > r + .3) return;
      const ahead = (h[0] * dx + h[1] * dz) / d;
      if (ahead < .35) return;
      const hb = heading(b), sameWay = hb && hb[0] * h[0] + hb[1] * h[1] > .2;
      const busy = !hb && b.seated < .3 && (b.cur || b.q.length);
      // Two people heading for the same spot can each think the other's in front. Only one gives way: whoever's further off.
      if (sameWay) {
        const mine = toGo(a), theirs = toGo(b);
        if (mine > theirs || (mine === theirs && a.id > b.id)) blocked = true;
        return;
      }
      if (busy) { blocked = true; return; }
      // Step around, to the right of the way you're going, a bit more the closer they are. Your feet keep pointing where you're headed.
      const k = Math.min(1, (r + .3 - d) / .3) * dt * .95, sign = h[0] * dz - h[1] * dx >= 0 ? -1 : 1;
      a.x += -h[1] * sign * k; a.z += h[0] * sign * k;
    });
    // Wait your turn, but not forever. After a few seconds, a squeeze past someone beats standing there all day.
    if (blocked) {
      a.yieldT = .12; a.waited = (a.waited || 0) + dt;
      if (a.waited > 2.5) { a.waited = 0; a.yieldT = 0; a.squeezeT = 2.2; }
    } else a.waited = Math.max(0, (a.waited || 0) - dt * .5);
  });
}
function updateHeads(dt) {
  all.forEach(p => {
    p.attn = Math.max(0, p.attn - dt);
    if (p.dead || p.inCar) return; // Those are posed on their own.
    const here = p.room === S.room;
    const a = here && (p.attn > 0 || (S.sinceKey < 1.5 && S.typed && !S.scene.heard));
    const want = a && !p.held && !p.lie ? clamp(wrapA(Math.atan2(S.obj.at.x - p.x, S.obj.at.z - p.z) - p.yaw), -1.25, 1.25) : 0;
    p.headYaw += (want - p.headYaw) * Math.min(1, dt * 6);
    p.sleepy = Math.max(0, p.sleepy - dt);
    p.headPitch += ((p.sleepy > 0 ? .75 : p.held ? .28 : .03) - p.headPitch) * Math.min(1, dt * 3);
    if (p.hop > 0) { p.hop -= dt; p.y = Math.max(0, Math.sin(p.hop * 9)) * .24; } else p.y = 0;
  });
}
const here = () => all.filter(p => p.room === S.room && !p.gone && !p.dead && p.root.visible);
const isHere = p => p.room === S.room && !p.gone && !p.dead;

// ---- Conversations ----
function startScene(i) {
  while (SCENES[i] && SCENES[i].only && !SCENES[i].only()) i++;
  S.sceneI = i;
  const sc = SCENES[i];
  // The end of a day gets its own card.
  const prev = S.scene;
  if (!sc) return finishDay();
  if (prev && prev.day !== sc.day && !sc.saturday && !prev.prologue && !S.dayEnded) {
    S.dayEnded = true;
    S.tracks = []; S.subs = []; S.sub = null;
    if (prev.day === 'WEDNESDAY') showCard('END OF WEDNESDAY', 'One day down.');
    else if (S.g.outcome === 'dead') showCard('TWO IS MOST OF THEM', '');
    else showCard('END OF THURSDAY', 'One more day.');
    S.paused = 9;
    setTimeout(() => startScene(i), params.has('fast') ? 30 : 4800);
    return;
  }
  S.dayEnded = false;
  S.scene = sc; S.subs = []; S.sub = null; S.heat = 0; S.endT = 0;
  Object.assign(S.f, { time: 0, carriers: [], asked: false, script: null, wait: 0, goodbye: 0 });
  HOUSE.force('front', false);
  S.holdT = 0;
  S.clear = howClear(sc);
  if (S.voice) { S.voice.stage(sc.prologue ? S.clear : voiceClear(S.clear)); S.voice.air(1); S.voice.borrow(null); S.voice.mush(false); }
  S.air = 1; S.winded = false; S.pullIn = false;
  [M, D].forEach(p => { if (p) p.inCar = false; });
  if (sc.friday) Object.keys(ROOMS).forEach(rk => ROOMS[rk].objects.forEach(o => { o.muted = 0; }));
  showCard(sc.day, sc.part);
  S.paused = 4.4;
  releaseArms();
  setTimeout(() => {
    all.forEach(p => { if (sc.place[p.id]) place(p, sc.place[p.id]); else { p.room = null; p.q = []; p.cur = null; p.root.visible = false; p.lie = false; } });
    S.boxesNow = sc.boxes === undefined ? 2 : typeof sc.boxes === 'function' ? sc.boxes() : sc.boxes;
    setBoxes();
    // The big door stays shut until somebody comes and opens it.
    Render.setGarage(sc.gShut ? 1 : 0); Render.setHaze(sc.gShut ? 1 : 0);
    S.tracks = sc.tracks.map(t => ({ ...t, i: 0, t: t.start || 0, waiting: 0, done: false, interrupted: false, asked: false }));
    S.anyHotUsed = false;
    Render.stopLive();
    goRoom(sc.room, true);
    if (sc.locked) showName('');
    if (sc.live) Render.goLive(sc.room, sc.state);
    if (sc.onStart) sc.onStart();
    if (sc.id === 'morning') showFirstTips();
    if (sc.obj) { S.obj = ROOMS[sc.room].objects.find(o => o.name === sc.obj) || S.obj; if (S.voice) S.voice.character(S.obj.voice); showName(S.obj.name); }
    hideCard();
  }, params.has('fast') ? 30 : 3200);
}
// The title screen no longer explains anything, so the first morning does, a little, out of the way.
function showFirstTips() {
  const seq = [[1700, 'Listen, or type. You are the fridge.'], [8000, 'You can only say what you have heard.'], [14000, 'Hold a key to hold the sound.'], [20000, 'Left and right change what you are talking out of.'], [26000, 'Tab goes to another room. You only hear the room you are in.'], [32000, '']];
  seq.forEach(([t, s]) => setTimeout(() => { if (S.scene && S.scene.id === 'morning') tip(s); }, t));
}
function trackRunning(t) {
  if (t.done) return false;
  if (t.after) { const dep = S.tracks.find(x => x.room === t.after); if (dep && !dep.done) return false; }
  if (t.waitFor && !t.waitFor()) return false;
  return true;
}
function runTracks(dt) {
  if (S.paused > 0) {
    S.paused -= dt;
    // Wren is already humming and the camera is already moving as this one fades in.
    if (S.scene.vent && S.pv) tickVent(dt);
    return;
  }
  S.tracks.forEach(t => {
    if (!trackRunning(t)) return;
    const present = t.room === S.room;
    // While you are talking in that room, or they are answering you, the conversation there waits.
    // In the overheard scenes they don't wait for you. They only stop if you've actually said something.
    const typingStops = !S.scene.heard && (S.keyHeld || S.typed.trim());
    const replying = present && (typingStops || (S.sub && S.sub.reply) || S.subs.some(x => x.reply));
    if (replying) return;
    if (t.waiting > 0) { t.waiting -= dt; if (t.waiting <= 0 && t.silent) { t.silent = false; if (present) say('w', WREN_SILENT); } return; }
    // Only the first time she asks does she tell you it's all right. After that, she just goes on.
    t.t -= dt;
    if (t.t > 0) return;
    if (present && (S.sub || S.subs.length)) return;
    const l = t.lines[t.i];
    if (!l) { t.done = true; return; }
    // Whoever's line this is has gone off somewhere. The conversation waits for them.
    if (S.scene.heard && l[0] !== 'cap') { const sp0 = personById(l[0]); if (sp0 && sp0.errand) { t.t = .3; return; } }
    t.i++;
    const opts = l[2] || {};
    if (opts.if && !opts.if()) { t.t = .01; return; }
    const text = typeof l[1] === 'function' ? l[1]() : l[1];
    if (t.interrupted && present && l[0] !== 'cap' && RESUME.length) { t.interrupted = false; const r = RESUME[S.resI++ % RESUME.length]; S.subs.push({ who: l[0], text: r, dur: 1.4 }); }
    const d = dur(text);
    if (present) { S.subs.push({ who: l[0], text, dur: d }); const sp = l[0] !== 'cap' && personById(l[0]); if (sp) sp.talk = d; }
    t.t = d + (present ? .42 : .25) + (opts.pause || 0);
    if (opts.after) opts.after();
    if (opts.ask) { t.waiting = opts.ask; t.silent = present && !S.wrenNudged; if (t.silent) S.wrenNudged = true; }
  });
  if (S.scene.garage) return tickGarage(dt);
  if (S.scene.final) return tickFinal(dt);
  if (S.scene.vent) return tickVent(dt);
  S.f.time += dt;
  if (S.scene.friday) tickCarry(dt);
  if (S.tracks.every(t => t.done) && !S.sub && !S.subs.length && S.f.time >= (S.scene.minT || 0) && (!S.scene.holdUntil || S.scene.holdUntil() || (S.holdT = (S.holdT || 0) + dt) > 15)) {
    S.endT += dt;
    if (S.endT > (S.scene.part === 'Night' ? 3.2 : 1.6)) startScene(S.sceneI + 1);
  }
}
const personById = id => id === 'm' ? M : id === 'd' ? D : id === 'w' ? W : id === 'g' ? GARY : id === 'a' ? ANNIE : null;

// ---- Friday: the boxes, and the front door ----
const frontDoor = () => ROOMS.hallway.objects.find(o => o.name === 'the front door');
function startCarrying(list) {
  S.f.carriers = list;
  list.forEach(p => { p.home = null; p.doneCarry = false; });
}
const FRONT = HOUSE.DOORS.front.a, KH = HOUSE.DOORS.kh.b;
// Out the front door, down the path, and on the far side it's up to you.
const outFront = (p, fx, fz) => routeIn('hallway', fx, fz, FRONT.stand[0], FRONT.stand[1]).concat(openDoor('front'), { t: 'walk', x: FRONT.beyond[0], z: FRONT.beyond[1] }, shutDoor('front'));
// If you have made the front door open onto the kitchen, then that's where they are, and the way back is the kitchen door.
function backFromKitchen(endX, endZ, then) {
  return [doIt(q => { q.gone = true; q.cur = null; }), wait(1.6), doIt(q => { q.x = KH.beyond[0]; q.z = KH.beyond[1]; q.yaw = Math.PI / 2; q.gone = false; }), openDoor('kh'), { t: 'walk', x: KH.stand[0], z: KH.stand[1] }, { t: 'walk', x: endX, z: endZ }, doIt(q => { if (then) then(q); })];
}
function carryTrip(p) {
  const f = S.f, keep = S.scene.keep || 0;
  if (!p.hasBox && !f.loop && S.boxesNow <= keep) { p.doneCarry = true; p.home = { x: .5, z: -2.2, yaw: Math.PI }; return; }
  if (p.hasBox) { p.q = outFront(p, p.x, p.z).concat(doIt(q => throughDoor(q))); return; }
  const pile = [.65, .75];
  p.q = routeIn('hallway', p.x, p.z, pile[0], pile[1]).concat(doIt(q => { q.faceYaw = Math.PI / 2; q.reachWant = 1; }), wait(.7), doIt(q => { q.hasBox = true; if (S.boxesNow > 0) { S.boxesNow--; setBoxes(); } }));
}
function throughDoor(p) {
  if (S.f.loop) {
    S.f.loops++;
    p.q = backFromKitchen(-.2, .3, q => loopBeat(q)).concat(wait(rand(1.6, 2.8)));
    return;
  }
  p.hasBox = false; p.gone = true; p.reachWant = 0;
  p.q = [wait(rand(6, 9)), doIt(q => { q.gone = false; }), openDoor('front'), { t: 'walk', x: FRONT.stand[0], z: FRONT.stand[1] }];
}
function loopBeat(p) {
  const f = S.f;
  // One beat at a time. If someone is still talking, this trip passes without comment.
  if (S.room !== 'hallway' || S.scene.final || S.sub || S.subs.length) return;
  const b = LOOP_BEATS[Math.min(f.beat++, LOOP_BEATS.length - 1)];
  b.forEach(l => {
    const who = l[0] === 'carrier' ? p.id : l[0];
    if (who === 'cap' || isHere(personById(who))) say(who, l[1].replace(/\{p\}/g, NAMES[p.id]));
  });
  // The fourth time, Marion goes and looks for herself.
  if (b === LOOP_BEATS[3] && isHere(M) && !M.held) {
    p.hasBox = false;
    const home = M.home;
    M.home = null;
    order(M, outFront(M, M.x, M.z).concat(backFromKitchen(.6, -.9, q => { q.home = home; })));
  }
}
function tickCarry(dt) {
  S.f.carriers.forEach(p => { if (!p.q.length && !p.cur && !p.held && !p.doneCarry && p.room === 'hallway') carryTrip(p); });
}
function setLoop(on) {
  S.f.loop = on;
  S.f.carriers.forEach(p => { p.doneCarry = false; });
  Audio2.fx.door();
  say('cap', on ? 'Something in the front door turns over, and goes still.' : 'Something in the front door lets go.');
}

// ---- Friday: the question ----
// She's asking. Whatever else the house has been doing, it has the breath for this.
function askFinal() { S.f.asked = true; S.f.askT = 38; S.f.tries = 0; S.air = 1; S.winded = false; S.pullIn = false; if (S.voice) S.voice.air(1); }
function walkOut(p, delay) {
  p.home = null;
  order(p, [wait(delay || 0)].concat(outFront(p, p.x, p.z), doIt(q => { q.gone = true; })));
}
function walkLoop(p, delay, x, z) {
  p.home = null; p.gone = false; p.hasBox = false; p.back = false;
  order(p, [wait(delay || 0)].concat(outFront(p, p.x, p.z), backFromKitchen(x, z, r => { r.back = true; r.home = { x, z, yaw: Math.PI }; })));
}
function goScript(canGo) {
  const f = S.f, live = alive(), list = [['w', 'Okay.']];
  f.loop = false; f.answered = 'go';
  if (live && canGo) list.push(['m', 'What did it say?'], ['w', 'It said you can go.'], ['cap', 'Marion stops with the keys in her hand. She stands there for a while.'], ['m', 'Thank you.']);
  else if (live) list.push(['m', 'What did it say?'], ['w', 'It said go.'], ['d', 'Did it?'], ['m', 'Coat. Now.']);
  else list.push(['a', 'Who are you talking to, sweetheart?'], ['w', 'Nobody.']);
  list.push(() => { HOUSE.force('front', true); mood({ tint: [.9, .95, 1.1] }, 90); }, ['cap', 'The front door opens by itself, all the way, and stays open. The cold comes in.']);
  if (live) list.push(() => walkOut(GARY));
  list.push(() => { W.home = null; order(W, routeIn('hallway', W.x, W.z, .1, -2.35).concat(doIt(p => { p.faceYaw = Math.PI; }))); }, { until: () => !W.q.length && !W.cur });
  list.push(['w', 'You never did me. Only them.'], ['w', 'You can, if you want.'], () => { f.goodbye = 14; }, { until: () => f.goodbye <= 0 && S.arm === 'none' });
  list.push(['w', () => f.hugged ? 'Bye, house.' : 'That is okay. Bye, house.']);
  list.push(() => { all.filter(p => p !== W && p !== GARY && p.room === 'hallway').forEach((p, i) => walkOut(p, i * .9)); walkOut(W, 2.2); }, { until: () => W.gone });
  // Wren's goodbye from the path, and the truck pulling away, are the epilogue now (epilogue.js).
  list.push(1.5, ['cap', 'The door stays open a while, just in case.']);
  list.push(() => { f.ending = live ? 'go' : 'go_dead'; f.endT = 2.5; });
  f.script = list; f.wait = 0;
}
function stayScript(answered) {
  const f = S.f, live = alive();
  f.loop = true; f.answered = 'stay'; f.leaving = false; f.goodbye = 0;
  const list = [];
  if (answered) list.push(['w', 'Okay.'], ['w', live ? 'It says no.' : 'I can stay, it says.']);
  if (live) {
    if (answered) list.push(['d', 'Did it say that?'], ['m', 'Get your coat on, Wren.']);
    const line = [[GARY, .75, -2.6], [D, -.3, -1.8], [M, .65, -1.2], [W, -.2, -.4]];
    list.push(() => line.forEach(([p, x, z], i) => walkLoop(p, i * .9, x, z)), ['cap', 'They go out the front door, all four of them, in a line.'], { until: () => line.every(l => l[0].back) });
    list.push(['cap', 'They come in from the kitchen, in the same order.'], ['d', 'Okay.'], ['m', 'Okay.'], ['g', 'I am going to need to call someone.'], ['cap', 'Nobody can think who.'], ['cap', 'Around nine, Dell starts putting the plates back.']);
    list.push(() => { f.ending = 'saturday'; f.endT = 2; });
  } else {
    if (answered) list.push(['a', 'Who are you talking to, sweetheart? Come on.']);
    const line = [[ANNIE, .6, -1.9], [W, -.2, -1.0]];
    list.push(() => line.forEach(([p, x, z], i) => walkLoop(p, i * .9, x, z)), { until: () => line.every(l => l[0].back) });
    list.push(['a', 'Huh.'], ['a', 'Let\'s try the other way.'], ['w', 'It is okay, Aunt Annie.'], ['w', 'You can stay too.']);
    list.push(() => { f.ending = 'all_home'; f.endT = 3; });
  }
  f.script = list; f.wait = 0;
}
function leaveScript(said) {
  const f = S.f, live = alive();
  if (f.loop) return stayScript(false);
  f.answered = 'none'; f.leaving = true;
  const list = [said || ['w', 'That is okay. You do not have to say.'], [live ? 'm' : 'a', live ? 'Come on.' : 'Come on, sweetheart.'], ['w', 'Bye, house.']];
  list.push(() => { const ps = all.filter(p => p.room === 'hallway' && !p.gone); ps.filter(p => p !== W).forEach((p, i) => walkOut(p, i * .9)); walkOut(W, 1.4); }, { until: () => all.every(p => p.room !== 'hallway' || p.gone) });
  list.push(1.5, ['cap', 'The lock turns. You have never felt that from this side.']);
  list.push(() => { f.leaving = false; f.ending = live ? 'forward' : 'forward_dead'; f.endT = 2.5; });
  f.script = list; f.wait = 0;
}
function answerFinal(u, tokens) {
  const f = S.f, has = l => tokens.some(t => l.includes(t));
  const go = tokens.includes(squeeze('go'));
  const no = has(FINAL_STAY);
  if (go && tokens.includes(squeeze('can')) && !no) return goScript(true);
  if (no || (u && !has(FINAL_GO) && u.key === 'stay')) return stayScript(true);
  if (has(FINAL_GO) || (u && ['go', 'yes', 'bye'].includes(u.key))) return goScript(go && tokens.includes(squeeze('can')));
  if (has(FINAL_WISH) || (u && ['hug', 'love', 'please'].includes(u.key))) return stayScript(true);
  if (u && u.key === 'soup') return leaveScript(['w', 'Okay. I will tell them soup.']);
  f.tries++;
  f.askT = Math.max(f.askT, 14);
  if (f.tries >= 3) return leaveScript(['w', 'That is okay. I do not think you know.']);
  say('w', f.tries === 1 ? 'I do not know what that means.' : 'It is a yes or a no.');
}
// Back from the door, Friday's own answers. True means nothing else should answer.
function fridayWords(u, tokens) {
  const f = S.f, sc = S.scene, has = l => tokens.some(t => l.includes(t));
  const atDoor = S.room === 'hallway' && S.obj === frontDoor();
  if (sc.final && f.asked && !f.answered && S.room === 'hallway') { answerFinal(u, tokens); return true; }
  if (f.goodbye > 0 && S.room === 'hallway' && S.arm === 'none') {
    if (has(FINAL_STAY)) { f.goodbye = 0; return true; }
    f.goodbye = 0; f.hugged = true;
    startHug(W, frontDoor());
    return true;
  }
  if (sc.final && f.answered) {
    if (f.leaving && atDoor && has(DOOR_LOOP_WORDS)) { all.forEach(p => { if (p.room === 'hallway') p.gone = false; }); stayScript(false); return true; }
    if (f.leaving && S.room === 'hallway') { f.leaving = 'told'; say('cap', 'They are already going.'); }
    return true;
  }
  if (atDoor && !f.asked) {
    if (!f.loop && has(DOOR_LOOP_WORDS)) { setLoop(true); return true; }
    if (f.loop && has(DOOR_OPEN_WORDS)) { setLoop(false); return true; }
  }
  return false;
}
function tickFinal(dt) {
  const f = S.f;
  if (f.goodbye > 0) f.goodbye -= dt;
  if (f.script) {
    if (f.wait > 0) { f.wait -= dt; return; }
    const it = f.script[0];
    if (it === undefined) { f.script = null; return; }
    if (it && it.until) { if (it.until()) f.script.shift(); return; }
    if (typeof it === 'number') { f.wait = it; f.script.shift(); return; }
    if (typeof it === 'function') { f.script.shift(); it(); return; }
    if (S.sub || S.subs.length) return;
    f.script.shift();
    const text = typeof it[1] === 'function' ? it[1]() : it[1], d = dur(text);
    S.subs.push({ who: it[0], text, dur: d });
    const sp = it[0] !== 'cap' && personById(it[0]); if (sp) sp.talk = d;
    f.wait = .3;
    return;
  }
  if (f.ending) {
    if (S.sub || S.subs.length) return;
    f.endT -= dt;
    if (f.endT <= 0) startScene(S.sceneI + 1);
    return;
  }
  if (f.asked && !f.answered && !S.keyHeld && !S.typed.trim() && !S.sub && !S.subs.length) {
    f.askT -= dt;
    if (f.askT <= 0) leaveScript();
  }
}

// ---- The garage ----
function seatInCar(p, x) {
  p.room = 'garage'; p.x = x; p.z = .25; p.yaw = Math.PI; p.faceYaw = Math.PI; p.q = []; p.cur = null; p.home = null; p.dest = null;
  p.seated = 1; p.seatWant = 1; p.baseY = -.08; p.carSit = true; p.inCar = true; p.gone = false;
}
// Over the side and in, or over the side and out. The car has no doors worth the name: this way nobody walks through its flank.
function climb(p, toX, out, then) {
  p.climb = { fromX: p.x, toX, out, t: 0, then };
}
function tickClimb(dt) {
  [M, D].forEach(p => {
    const c = p && p.climb;
    if (!c) return;
    c.t = Math.min(1, c.t + dt / .95);
    const k = c.t * c.t * (3 - 2 * c.t), f = c.out ? k : 1 - k; // f: 0 in the seat, 1 standing beside the car.
    p.x = c.fromX + (c.toX - c.fromX) * k;
    p.baseY = -.08 * (1 - f) + Math.sin(c.t * Math.PI) * .66;
    p.seated = p.seatWant = 1 - f;
    p.carSit = f < .35;
    if (c.t >= 1) { p.climb = null; if (c.then) c.then(p); }
  });
}
function climbOut(p, side, then) {
  p.sway = 0; p.headRoll = 0; p.lean = 0; p.eyesShut = false;
  climb(p, side, true, q => { leaveCar(q); if (then) then(q); });
}
function leaveCar(p) { p.inCar = false; p.carSit = false; p.baseY = 0; p.seatWant = 0; p.eyesShut = false; p.sway = 0; p.headRoll = 0; p.lean = 0; p.headPitch = .03; }
function goToCar() {
  // They go out through the kitchen door together, walk around to their own sides, and get in. Then the engine.
  [[M, -.42, -1.35], [D, .42, 1.35]].forEach(([p, x, side]) => {
    p.home = null;
    order(p, travelSteps(p, 'garage', side, .25, Math.PI).concat(doIt(q => {
      seatInCar(q, x);
      q.x = side; q.seated = 1; climb(q, x, false);
      if (M.inCar && D.inCar && !S.g.engine) { S.g.engine = true; Render.setHaze(.25); if (S.room === 'garage') Audio2.fx.engine(); }
    })));
  });
}
function closeGarage() {
  const g = S.g;
  if (g.shut || g.outcome) return;
  g.shut = true; S.gClosedOnce = true;
  Render.setGarage(1); Render.setHaze(1);
  Audio2.fx.garage && Audio2.fx.garage();
  const car = S.tracks.find(t => t.id === 'car'); if (car) car.done = true;
  S.subs = [];
  say('cap', 'The big door comes down, slowly, on its own.');
  say('d', 'Did the door just...');
  say('m', 'Leave it. It is warmer.');
}
function openGarage() {
  const g = S.g;
  if (!g.shut) return;
  g.shut = false;
  Render.setGarage(0); Render.setHaze(.2);
  Audio2.fx.garage && Audio2.fx.garage();
  if (g.p < .6 && !g.outcome) {
    // Not asleep yet. They think nothing of it, and they come in with sore heads.
    say('d', 'Well, there goes the heat.');
    say('m', 'Come on. I have got a headache anyway.');
    finishGarage('never');
  }
}
function wakeAttempt(text, u, tokens) {
  const g = S.g;
  // A word cut off by running out of air still counts. "Mari..." is plenty, if you know what it's for.
  const clear = tokens.some(t => WAKE_WORDS.map(squeeze).some(w => w === t || (t.length >= 3 && w.startsWith(t))));
  g.wake += clear ? 1 : .35;
  const need = 2 + Math.min(4, Math.floor(sillyCount() / 3));
  if (g.wake >= need) {
    say('cap', 'Marion lifts her head. It takes her a long time to work out what she is looking at.');
    say('m', 'Dell. Dell. Dell, the door.');
    finishGarage('saved');
    return;
  }
  // Something gets through, for a moment. They stir, and go back under.
  g.stirT = 2.2;
  // Past a certain point there's nobody left to answer. Your words still count. They just don't get a reply.
  if (g.p >= .82) { if (!g.quietTold) { g.quietTold = true; say('cap', 'Neither of them moves.'); } return; }
  g.spoke++;
  const silly = sillyCount() >= 3;
  const lines = silly
    ? [['d', '...It is just the fridge. It has been saying soup all week.'], ['d', 'Mm. Soup.'], ['cap', "Dell's head goes back down."], ['m', '...Tell it... later...']]
    : [['m', '...Dell?'], ['d', '...mm. In a minute.'], ['cap', 'Marion moves one hand, a little.'], ['d', '...who...']];
  const l = lines[Math.min(g.spoke - 1, lines.length - 1)];
  say(l[0], l[1]);
  if (l[0] === 'cap' && l[1].startsWith('Marion')) M.patA = 1;
}
// Everyone in the car, every frame: who's looking at who, who's slumping, and whose eyes have closed. It all follows how far along the air is.
function carPose(dt) {
  const g = S.g, ease = (a, b, r) => a + (b - a) * Math.min(1, dt * r);
  if (!M.inCar || !D.inCar || M.climb || D.climb || g.outcome) return;
  let mS = 0, mR = 0, mP = .04, mY = 0, dS = 0, dR = 0, dP = .04, dY = 0, x = -.42;
  const p = g.p, band = (a, b) => clamp((p - a) / (b - a), 0, 1);
  if (!g.shut) {
    // Talking in a parked car: you look at the other one when you're saying it, and through the windshield when you're not.
    if (M.talk > 0) { mY = -.55; dY = .12; } else if (D.talk > 0) { dY = .55; mY = -.12; }
  } else {
    // The door comes down: Dell looks round at it. Marion doesn't.
    if (p < .07) dY = 1.1 * Math.sin(Math.min(1, p / .05) * Math.PI);
    // They stop arguing. Then her head goes down on his shoulder.
    const lean = band(.4, .5);
    mS = .3 * lean; mR = .46 * lean; x = -.42 + .13 * lean; mP = .04 + .16 * lean;
    dR = -.16 * lean; dS = -.04 * lean;
    // Then neither of them is really there.
    const under = band(.56, .8);
    dP = .04 + .62 * under; dR -= .12 * under; mP += .3 * under; mS += .05 * under;
    M.eyesShut = p > .5 && !(g.stirT > 0); D.eyesShut = p > .56 && !(g.stirT > 0);
    if (g.stirT > 0) { g.stirT -= dt; mP *= .45; dP *= .4; }
  }
  M.x = ease(M.x, x, 2);
  M.sway = ease(M.sway, mS, 2.4); M.headRoll = ease(M.headRoll, mR, 2.4); M.headPitch = ease(M.headPitch, mP, 2.4); M.headYaw = ease(M.headYaw, mY, 4);
  D.sway = ease(D.sway, dS, 2.4); D.headRoll = ease(D.headRoll, dR, 2.4); D.headPitch = ease(D.headPitch, dP, 2.4); D.headYaw = ease(D.headYaw, dY, 4);
}
// How they stay, afterward. People don't animate once they're like this, and they aren't people the house can talk to.
function setDead(p) {
  p.dead = true; p.eyesShut = true; p.q = []; p.cur = null; p.home = null; p.dest = null; p.talk = 0;
  if (p === M) { p.x = -.29; p.sway = .36; p.headRoll = .46; p.headPitch = .55; } else { p.sway = -.05; p.headRoll = -.28; p.headPitch = .72; }
  p.headYaw = 0;
}
function finishGarage(outcome) {
  const g = S.g;
  if (g.outcome) return;
  g.outcome = outcome;
  S.tracks.forEach(t => { t.done = true; });
  if (outcome === 'dead') {
    Render.setHaze(1);
    S.subs = [];
    setDead(M); setDead(D);
    if (isHere(W)) { W.reachWant = 0; W.headPitch = .1; }
    g.endT = 7;
    return;
  }
  Render.setGarage(0); Render.setHaze(0);
  if (outcome === 'saved') {
    // She gets herself out, onto the concrete. It takes him longer.
    if (isHere(W)) say('w', 'Mom!');
    say('cap', 'The big door goes up. Marion gets herself over the side of the car, and then she is on the concrete, on her hands and knees.');
    say('d', 'What... what happened?');
    climbOut(M, -1.12, q => order(q, [{ t: 'walk', x: -1.3, z: .3 }, doIt(r => { r.crawl = 1; r.faceYaw = Math.PI; })]));
    D.eyesShut = false; D.sway = 0; D.headRoll = 0; D.headPitch = .25;
    setTimeout(() => { if (D.inCar && S.scene && S.scene.garage) { climbOut(D, 1.12, q => order(q, [{ t: 'walk', x: 1.3, z: .3 }, doIt(r => { r.faceYaw = -Math.PI / 2; })])); } }, params.has('fast') ? 0 : 4500);
    if (W.room === 'garage') { W.home = null; W.reachWant = 0; order(W, routeIn('garage', W.x, W.z, -1.05, 1.0).concat(doIt(q => { q.faceYaw = Math.PI; q.reachWant = .7; }))); }
    g.endT = 11;
    return;
  }
  // Nothing happened. They finish up, get out and go in.
  [[M, -1.35], [D, 1.35]].forEach(([p, side]) => {
    if (!p.inCar) return;
    climbOut(p, side, q => order(q, travelSteps({ x: side, z: .25, room: 'garage' }, 'kitchen', q === M ? -.4 : .6, -1.3, Math.PI)));
  });
  g.endT = 6;
}
function tickGarage(dt) {
  const g = S.g;
  tickClimb(dt);
  carPose(dt);
  if (g.outcome) {
    g.endT -= dt;
    if (g.endT <= 0 && !S.sub && !S.subs.length) startScene(S.sceneI + 1);
    return;
  }
  if (g.engine) {
    g.rumble = (g.rumble || 0) - dt;
    if (g.rumble <= 0) { g.rumble = 1.5; if (S.room === 'garage') Audio2.fx.engine(); }
  }
  if (g.shut) {
    g.p = Math.min(1, g.p + dt / 75);
    while (g.noteI < G_NOTES.length && g.p >= G_NOTES[g.noteI][0]) {
      const n = G_NOTES[g.noteI++];
      if (n[1] === S.room) say(n[2], n[3]);
    }
    if (g.p > .45 && !g.wrenGoes && W.room === 'kitchen') { g.wrenGoes = true; moveToGarage(); }
    // She gets to the window and knocks on it.
    if (W.room === 'garage' && !W.dest && !W.q.length && !W.cur && g.p > .62) {
      W.faceYaw = -Math.PI / 2;
      W.reachWant = Math.sin(S.time * 6) > .2 ? .9 : .55;
      W.headPitch = g.p > .8 ? -.25 : .02;
    }
    if (g.p >= 1) finishGarage('dead');
  } else if (g.p >= .55) {
    // Opened while they're asleep: the air gets to them, slowly. You can still call them, and it's quicker if you do.
    g.airT = (g.airT || 0) + dt; if (g.airT > 22) finishGarage('saved');
  } else {
    // If nobody shuts it, they finish talking and come back inside.
    const car = S.tracks.find(t => t.id === 'car');
    if (car && car.done && !S.sub && !S.subs.length) finishGarage('never');
  }
}
function moveToGarage() { moveTo(W, 'garage', 1.3, .5, -Math.PI / 2); }
function setBoxes() {
  const n = S.boxesNow || 0;
  Render.setProps({ boxes: { kitchen: Math.min(8, n), living: Math.min(8, n), hallway: Math.min(8, n), bedroom: Math.min(5, Math.floor(n / 2)), wren: Math.min(3, Math.floor(n / 3)) } });
}
function voicesElsewhere() {
  if (!S.tracks || S.paused > 0) return null;
  const hereActive = S.tracks.some(t => trackRunning(t) && t.room === S.room);
  if (hereActive) return null;
  const t = S.tracks.find(t => trackRunning(t) && t.room !== S.room);
  return t ? ROOMS[t.room].label : null;
}

// ---- What happens when you speak ----
function react() {
  const text = S.typed; S.typed = '';
  if (!text.trim()) return;
  const o = S.obj;
  if (o.muted > 0) { say('cap', 'Nothing comes out. It has been unplugged.'); return; }
  S.spoke++; S.heat += 1;
  const people = here();
  people.forEach(p => { p.attn = Math.max(p.attn, 2.6); });
  // Anyone in the room stops to answer. The conversation in that room will pick up after.
  if (!S.scene.heard) S.tracks.forEach(t => { if (t.room === S.room && !t.done && t.i > 0) t.interrupted = true; });
  const u = understand(text);
  if (u && u.clear) S.saidCount[u.key] = (S.saidCount[u.key] || 0) + 1;
  // A question hanging in the air gets answered. Wren is the only one who waits for you.
  const asking = S.tracks.find(t => t.room === S.room && t.waiting > 0);
  if (asking) { asking.waiting = 0; asking.silent = false; asking.interrupted = false; }

  // The scene's own reactions come first.
  const sc = S.scene;
  const tokens = text.toLowerCase().split(/\s+/).map(squeeze).filter(Boolean);
  // Thursday: every time you talk, they pack a little faster.
  if (sc.tense && people.some(p => p.id === 'm' || p.id === 'd')) { S.tenseTalks++; S.boxesNow = Math.min(8, (S.boxesNow || 0) + 1); setBoxes(); }
  if (sc.friday && fridayWords(u, tokens)) return;
  if (sc.heard) { heardReact(text, u, tokens, people, o); return; }

  if (sc.garage) {
    const g = S.g;
    if (g.outcome === 'dead') return;
    const door =S.room === 'garage' && S.obj.name === 'the garage door';
    const shutWords = ['shut', 'close', 'down', 'stay', 'warm'].map(squeeze), openWords = ['open', 'up', 'air', 'out'].map(squeeze);
    if (door && !g.shut && !g.outcome && tokens.some(t => shutWords.includes(t))) { closeGarage(); return; }
    if (door && g.shut && !g.outcome && tokens.some(t => openWords.includes(t))) { openGarage(); if (g.outcome) return; if (g.p >= .6) wakeAttempt(text, u, tokens); return; }
    if (!g.outcome && g.p >= .55 && S.room === 'garage') { wakeAttempt(text, u, tokens); return; }
    if (S.room === 'garage' && !g.outcome && isHere(M)) { say(S.spoke % 2 ? 'd' : 'm', S.spoke % 2 ? 'Did you hear something?' : 'See? It is out here too.'); return; }
  }
  if (sc.anyHot === S.room && !S.anyHotUsed) { S.anyHotUsed = true; sc.hot.any.forEach(l => say(l[0], l[1])); return; }
  const hotKey = sc.hot && Object.keys(sc.hot).find(k => tokens.includes(squeeze(k)));
  if (hotKey && !(S.hotUsed = S.hotUsed || {})[sc.id + hotKey]) {
    S.hotUsed[sc.id + hotKey] = true;
    sc.hot[hotKey].forEach(l => { if (l[0] === 'cap' || isHere(personById(l[0]))) say(l[0], l[1]); });
    if (u && u.clear && WORDS[u.key].do && ACTS[WORDS[u.key].do] && sc.acts) ACTS[WORDS[u.key].do](o, u.key);
    return;
  }
  if (!people.length) { if (S.spoke % 4 === 1) say('cap', 'You say it to an empty room. It goes very well.'); return; }
  if (asking && isHere(W)) { say('w', wrenReply()); return; }
  respond(u, o, people);
}
function checkHeat() {
  if (S.scene.acts && !S.scene.friday && !S.scene.saturday && S.heat >= 6 && S.obj.muted <= 0 && !M.held && !M.errand && !S.unplugging && isHere(M)) unplug(S.obj);
}
function unplug(o) {
  S.unplugging = true; S.heat = 2; S.unplugs++;
  S.subs = [];
  say('m', S.unplugs === 1 ? "Okay. That's it." : S.unplugs === 2 ? 'That one too.' : 'I can do this all day, Dell. I have until Friday.');
  order(M, route(M, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.seatWant = .55; p.reachWant = 1; }), wait(1.1), doIt(() => {
    o.muted = 22;
    Audio2.fx.click(); Audio2.fx.settle();
    say('cap', `Marion reaches behind ${o.name} and pulls the plug.`);
    if (S.obj === o) { release(); drawSaid(); }
  }), wait(.8), doIt(p => { p.seatWant = 0; p.reachWant = 0; S.unplugging = false; })));
}
function replug(o, room) {
  const who = o.name === 'the fridge' ? D : W;
  if (who.held || who.lie || who.room !== room) { o.muted = 0; return; }
  order(who, route(who, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.reachWant = 1; }), wait(1), doIt(p => {
    p.reachWant = 0; o.muted = 0;
    if (who === D) say('d', "The milk's going to go off."); else say('w', 'I plugged it back in. Do not tell Mom.');
    Audio2.fx.click();
  }), wait(.5)));
}
const ACTS = {
  look() { here().forEach(p => { p.attn = 3.5; }); },
  wave() { [W, D].filter(isHere).forEach(p => { p.attn = 3; p.waveWant = 1; setTimeout(() => { p.waveWant = 0; }, 1900); }); },
  come(o) { if (!isHere(M)) return; order(M, route(M, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.attn = 7; }), wait(7))); },
  stop() { if (!isHere(M) || M.held) return; order(M, [doIt(p => { p.attn = 5; }), wait(5)]); },
  leave() {
    if (!isHere(M)) return;
    order(M, stepOut(M, rand(4, 7), p => { if (isHere(p)) say('m', 'I forgot I live here.'); }));
  },
  eat() {
    if (!isHere(M) || M.room !== 'kitchen') { ACTS.look(); return; }
    order(M, route(M, 0, 1.9).concat({ t: 'walk', x: 0, z: 1.06 }, doIt(p => { p.yaw = Math.PI; p.faceYaw = Math.PI; p.seatWant = 1; }), wait(8), doIt(p => { p.seatWant = 0; }), wait(.6)));
  },
  soup(o) {
    if (!isHere(D)) return;
    order(D, route(D, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.reachWant = 1; }), wait(1.2), doIt(p => { p.carrying = false; p.reachWant = 0; addCan(o); Audio2.fx.click(); }), wait(.8)));
    D.carrying = true;
  },
  inspect(o) {
    if (!isHere(D)) return;
    order(D, route(D, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.reachWant = 1; Audio2.fx.door(); }), wait(.5), doIt(() => Audio2.fx.door()), wait(.6), doIt(p => { p.reachWant = 0; say('d', 'Sounds fine to me.'); }), wait(1.5)));
  },
  dell(o) { if (isHere(D)) order(D, route(D, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.attn = 6; }), wait(6))); },
  wren(o) { if (isHere(W)) order(W, route(W, o.stand[0], o.stand[1]).concat(faceObj(o), doIt(p => { p.attn = 7; p.reachWant = .6; }), wait(6), doIt(p => { p.reachWant = 0; }))); },
  hug(o) {
    if (S.arm !== 'none' || !S.scene.acts) return;
    const dm = isHere(M) ? Math.hypot(M.x - o.at.x, M.z - o.at.z) : 9, dd = isHere(D) ? Math.hypot(D.x - o.at.x, D.z - o.at.z) : 9;
    const target = dm < 2.0 ? M : dd < 2.0 ? D : null;
    if (target) startHug(target, o);
    else { here().forEach(p => { p.attn = 2.6; }); if (S.tipped < 2 && isHere(W)) { S.tipped = 2; say('w', 'They can not hear you from there. Tell them to come here.'); } }
  },
  cold() { mood({ tint: [.78, .93, 1.22] }, 9); },
  hot() { mood({ tint: [1.25, .95, .74] }, 9); },
  dark() { mood({ dim: .32 }, 10); },
  light() { mood({ dim: 1, tint: [1.1, 1.06, .96] }, 5); },
  sleep() { if (isHere(W)) W.sleepy = 6; },
  dance() { [[W, 7], [D, 5]].forEach(([p, s]) => { if (isHere(p) && !p.lie) { p.dance = s; order(p, [wait(s)]); } }); },
  jump() { if (isHere(W)) { W.hop = 2.1; W.seatWant = 0; order(W, [wait(2.2)]); } },
  standup() { [D, W].filter(isHere).forEach(p => { p.seatWant = 0; order(p, [wait(4)]); }); },
  rude() { S.heat += 2; if (isHere(W)) W.hop = .6; },
};
function mood(m, secs) { Render.setView(Object.assign({ dim: 1, tint: [1, 1, 1] }, m)); S.moodT = secs; }
function addCan(o) {
  if (S.cans.length >= 24) return;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.046, .046, .125, 14), CAN_MAT);
  m.add(new THREE.Mesh(new THREE.CylinderGeometry(.047, .047, .06, 14), new THREE.MeshPhongMaterial({ color: 0xf0e9d6, shininess: 20 })));
  const i = o.cans++;
  const sx = o.stand[0] * .35 + o.at.x * .65, sz = o.stand[1] * .35 + o.at.z * .65;
  m.position.set(sx + ((i % 3) - 1) * .11, .064 + Math.floor(i / 3) * .127, sz + .14);
  m.userData.room = S.room;
  scene.add(m); S.cans.push(m);
  if (o.cans === 3) say('m', `Dell. There are three cans of soup next to ${o.name}.`);
}

// ---- The arms ----
function startHug(target, o) {
  S.hugP = target; S.hugObj = o; target.held = true; target.q = []; target.cur = null;
  S.arm = 'out'; S.len = .05; S.close = 0; S.hugT = 0; S.hugs++;
  S.left.setLook(HugArms.LOOKS[o.look]); S.right.setLook(HugArms.LOOKS[o.look]);
  S.left.visible(true); S.right.visible(true);
  Audio2.fx.reach();
  if (target === W) say('cap', 'Two long arms come in from the front door. They are very careful.');
  else say('cap', S.hugs === 1 ? `Two long arms come out of ${o.name}, very slowly.` : `The arms come out of ${o.name}. Nobody bothers to look surprised.`);
}
function releaseArms() {
  if (S.hugP) S.hugP.held = false;
  S.arm = 'none';
  if (S.left) { S.left.visible(false); S.right.visible(false); }
}
function updateArms(dt) {
  if (S.arm === 'none') return;
  const P0 = S.hugP, o = S.hugObj;
  if (P0.room !== S.room) { releaseArms(); return; }
  P0.chest(v.ch);
  const O = o.at;
  if (S.arm === 'out') {
    const dist = Math.hypot(P0.x - O.x, P0.z - O.z);
    S.len = Math.min(dist, S.len + dt * .85);
    if (S.len >= dist - .02) {
      S.arm = 'hold'; Audio2.fx.hug();
      hugBeat(P0).forEach(l => { if (l[0] === 'cap' || isHere(personById(l[0]))) say(l[0], l[1]); });
    }
  } else if (S.arm === 'hold') {
    S.close = Math.min(1, S.close + dt * .8);
    S.hugT += dt;
    P0.bracing = 1;
    P0.sway = Math.sin(S.time * 1.05) * .03;
    P0.headRoll += (clamp((S.hugT - 2.5) / 3, 0, 1) * .22 - P0.headRoll) * Math.min(1, dt * 1.3);
    if (S.hugT > 4) P0.patA += (1 - P0.patA) * Math.min(1, dt * 1.1);
    P0.squeeze = S.close * (.55 + .45 * Math.sin(S.time * 2.1));
    if (S.hugT > 8) { S.arm = 'back'; P0.held = false; P0.attn = 3; if (P0 !== W) say(P0.id, hugEnd(P0)); }
  } else {
    S.close = Math.max(0, S.close - dt * 1.3);
    S.len -= dt * .9;
    if (S.len <= .03) { S.arm = 'none'; S.left.visible(false); S.right.visible(false); return; }
  }
  const dx = P0.x - O.x, dz = P0.z - O.z, d = Math.hypot(dx, dz) || 1, fx = dx / d, fz = dz / d;
  const F = v.f.set(fx, 0, fz), R = v.r.set(-fz, 0, fx);
  const look = HugArms.LOOKS[o.look], wide = look.wide;
  const hy = O.y + (Math.max(.6, v.ch.y - .05) - O.y) * clamp(S.len, 0, 1);
  v.mid.set(O.x + fx * S.len, hy, O.z + fz * S.len);
  const k = S.close * S.close * (3 - 2 * S.close);
  const openW = .3 + Math.min(.22, S.len * .1);
  [[S.left, -1], [S.right, 1]].forEach(([arm, s]) => {
    const P = arm.P;
    P[0].copy(O).addScaledVector(R, s * wide);
    v.a.copy(v.mid).addScaledVector(R, s * openW * clamp(S.len / .5, .2, 1));
    v.b.copy(P[0]).addScaledVector(R, s * (.18 + S.len * .2)).addScaledVector(F, S.len * .36);
    v.b.y = O.y + (hy - O.y) * .3 + .08;
    v.c.copy(v.a).addScaledVector(R, s * .08).addScaledVector(F, -Math.min(.45, S.len * .4));
    if (k > 0) {
      const high = s > 0 ? .12 : -.08;
      v.d.copy(v.ch).addScaledVector(F, .135 * P0.s).addScaledVector(R, s * .03); v.d.y += high - .05;
      v.a.lerp(v.d, k);
      v.g.copy(v.ch).addScaledVector(R, s * .26 * P0.s).addScaledVector(F, -.05); v.g.y += high * .7 - .05;
      v.c.lerp(v.g, k);
    }
    P[1].copy(v.b); P[2].copy(v.c); P[3].copy(v.a);
    arm.thin = 1;
    arm.update(s, k);
  });
}

// ---- Moving around the house ----
function goRoom(room, quiet) {
  if (S.arm !== 'none') releaseArms();
  S.room = room;
  S.obj = ROOMS[room].objects[0];
  Render.showRoom(room, undefined, S.scene.state, { dim: 1, tint: [1, 1, 1] });
  if (S.voice) S.voice.character(S.obj.voice);
  S.cans.forEach(c => { c.visible = c.userData.room === room; });
  S.subs = S.subs.filter(s => s.reply && false); S.sub = null; $('sub').innerHTML = '';
  S.typed = ''; S.said = ''; drawSaid();
  showName(quiet ? ROOMS[room].label : `${ROOMS[room].label}: ${S.obj.name}`);
}
function become(o) {
  if (o === S.obj) return;
  release();
  if (S.typed.trim()) react();
  S.obj = o; S.said = ''; S.selT = 1.3;
  if (S.voice) S.voice.character(o.voice);
  showName(o.name);
  drawSaid();
  Audio2.fx.click();
}
function cycle(dir) { const l = ROOMS[S.room].objects, i = l.indexOf(S.obj); become(l[(i + dir + l.length) % l.length]); }
function nextRoom() {
  const i = ROOM_ORDER.indexOf(S.room);
  goRoom(ROOM_ORDER[(i + 1) % ROOM_ORDER.length]);
  Audio2.fx.creak();
}
let nameT = 0;
function showName(n) { $('who').textContent = n; $('who').style.opacity = 1; nameT = 2.2; }
function showCard(a, b, c) { $('cardday').textContent = a; $('cardpart').textContent = b || ''; $('cardmore').textContent = c || ''; $('card').classList.add('on'); S.card = true; }
function hideCard() { $('card').classList.remove('on'); S.card = false; }
function finishDay() {
  S.finished = true; S.tracks = [];
  $('voices').textContent = ''; $('sub').innerHTML = ''; $('said').textContent = '';
  // The endings where they leave go out to the front yard first.
  if (typeof EPI !== 'undefined' && !EPI.done && EPI_ENDINGS.includes(S.f.ending)) { playEpilogue(endCard); return; }
  endCard();
}
function endCard() {
  const e = ENDINGS[S.f.ending] || ENDINGS[S.g.outcome === 'dead' ? 'forward_dead' : 'forward'];
  showCard(e[0], e[1], `${e[2]} Click to start again.`.trim());
  $('card').onclick = () => location.reload();
}

// ---- Typing ----
// ---- Breath ----
// The house only has so much air in its ducts. Talking uses it up, and nothing on screen says so except the words themselves.
// A breath is measured in letters: a short sentence on Wednesday, a long one on Thursday, plenty by Friday.
function breathLetters() {
  const c = S.clear === undefined ? 1 : S.clear, full = 30 + 40 * c + 40 * c * c * c;
  // With the big door down, there isn't much air in the house to speak of.
  const g = S.g, foul = S.scene && S.scene.garage && g.shut && !g.outcome && g.p > .3;
  return foul ? Math.max(12, full * .42) : full;
}
const isFoul = () => S.scene && S.scene.garage && S.g.shut && !S.g.outcome && S.g.p > .3;
function spendAir() {
  if (S.obj.muted > 0) return;
  S.air = Math.max(0, S.air - 1 / breathLetters());
  if (S.voice) S.voice.air(S.air);
  if (S.air <= 0) { S.winded = true; S.pullIn = false; release(); }
}
function tickBreath(dt) {
  // It can't breathe in while it's still talking.
  if (S.sinceKey < (S.winded ? 1.1 : .9) || S.air >= 1) return;
  const secs = isFoul() ? 3.9 : 3.3;
  if (!S.pullIn && S.air < .7) {
    S.pullIn = true;
    Audio2.fx.groan(secs * (1 - S.air), .55 + (S.clear || 0) * .45);
    if (S.winded && !S.airTold && !S.scene.locked) { S.airTold = true; say('cap', 'That is all the air there is. The house breathes in.'); }
  }
  S.air = Math.min(1, S.air + dt / secs);
  if (S.voice) S.voice.air(S.air);
  if (S.air >= .45) S.winded = false;
  if (S.air >= 1) S.pullIn = false;
}
// What talking does to the house you can see. Breathing in, the whole room swells, barely, and it settles after.
// And talking browns out the wiring: you'd hardly catch it on Wednesday, a stray flicker on Thursday, and on Friday you can't miss it.
const LIGHT_FLICKER = { WEDNESDAY: .1, THURSDAY: .3, FRIDAY: 1, SATURDAY: 1 };
let swell = 0;
const flick = { wait: 0, on: 0, dips: 0 };
function setFlick(v) { Render.setView({ flick: v }); }
function tickFlicker(dt, amount) {
  if (!amount) { if (flick.on > 0 || flick.dips) { flick.on = 0; flick.dips = 0; setFlick(1); } return; }
  const strain = 1 - S.air;
  if (flick.on > 0) {
    flick.on -= dt;
    if (flick.on > 0) return;
    setFlick(1);
    // Never more than about three a second: this is a bad connection, not a strobe.
    flick.wait = --flick.dips > 0 ? .26 + Math.random() * .2 : (.7 + Math.random() * 1.2) * (2.6 - 2 * strain) / (.35 + .65 * amount);
    return;
  }
  flick.wait -= dt;
  // It only does it while the voice is drawing on them.
  if (S.sinceKey > .5 || S.obj.muted > 0) { if (flick.wait <= 0) flick.wait = .6 + Math.random() * 1.5; return; }
  if (flick.wait > 0) return;
  if (!flick.dips) flick.dips = 1 + Math.floor(Math.random() * (1 + 2.4 * amount * (.4 + .6 * strain)));
  flick.on = .05 + Math.random() * .07;
  setFlick(1 - (Math.min(.1, amount * .33) + amount * (.15 + .35 * Math.random()) * (.6 + .4 * strain)));
}
function tickBreathEffects(dt) {
  const want = S.pullIn ? (S.winded || S.air < .4 ? 1 : .6) : 0;
  swell += (want - swell) * Math.min(1, dt * (want > swell ? 1.1 : .75));
  $('gl').style.transform = swell > .002 ? `scale(${(1 + swell * .007).toFixed(4)})` : 'none';
  noticeLights();
  tickFlicker(dt, S.scene && !(S.moodT > 0) ? LIGHT_FLICKER[S.scene.day] : 0);
}
// On Friday the flicker is bad enough that someone says so, once, once it has stopped.
function noticeLights() {
  const sc = S.scene;
  if (S.lightsTold || !sc || sc.day !== 'FRIDAY' || S.f.asked || S.f.answered) return;
  // Remember it: by the time anyone has finished answering you, the air and the lights may already be back.
  if (S.air <= .6) S.lightsDue = true;
  if (!S.lightsDue || S.sinceKey < 1 || S.typed.trim() || S.sub || S.subs.length) return;
  const m = isHere(M), d = isHere(D), w = isHere(W);
  if (!m && !d && !w) return;
  S.lightsTold = true;
  const lines = m && d ? [['m', 'The lights flicker when it talks.'], ['d', 'That is the wiring, hon.'], ['m', 'It is using them, Dell.']]
    : m ? [['m', 'And now it is using the lights.']]
    : d ? [['d', 'You are making the lights jump, buddy.'], ['d', 'That is okay. They stay with you.']]
    : [['w', 'You are using the lights to talk. That is new.']];
  lines.forEach(l => say(l[0], l[1]));
}
function addSaid(c) { S.said += c; S.saidAir.push(S.air); }
function keyDown(e) {
  if (!S.on || S.finished) return;
  if (S.scene && S.scene.locked) {
    // In the prologue there is nothing you can do yet, and then there is one letter.
    if (e.key === 'Tab' || e.key === ' ') e.preventDefault();
    if (!e.repeat && S.strain && e.key.length === 1) strainKey(e.key.toLowerCase(), e);
    return;
  }
  if (e.key === 'Tab') { e.preventDefault(); if (!e.repeat && S.paused <= 0) nextRoom(); return; }
  if (e.key === 'ArrowUp') { S.upHeld = true; e.preventDefault(); return; }
  if (e.key === 'ArrowDown') { S.downHeld = true; e.preventDefault(); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); if (!e.repeat) cycle(1); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); if (!e.repeat) cycle(-1); return; }
  if (e.repeat) return;
  const c = e.key.toLowerCase();
  if (e.key === ' ') { e.preventDefault(); if (S.winded) return; S.typed += ' '; addSaid(' '); drawSaid(); S.sinceKey = 0; release(); return; }
  if (e.key === 'Backspace' || e.key === 'Enter') { e.preventDefault(); if (e.key === 'Enter') S.sinceKey = 9; return; }
  if (c.length !== 1 || c < 'a' || c > 'z' || e.ctrlKey || e.metaKey || e.altKey) return;
  // Out of air: the key does nothing but let a little out. It doesn't even hold up the next breath.
  if (S.winded) { if (S.obj.muted <= 0) Audio2.fx.puff(); return; }
  S.keyHeld = c; S.pressT = 0; S.pullIn = false;
  S.typed += c; addSaid(c); S.sinceKey = 0;
  drawSaid();
  voiceForTyping();
  if (S.voice && S.obj.muted <= 0) { S.voice.air(S.air); sayNextLetter(); }
  spendAir();
  if (S.tipped < 1) { S.tipped = 1; tip(''); }
}
function keyUp(e) {
  if (S.strain && e.key.length === 1) strainUp(e.key.toLowerCase());
  if (e.key === 'ArrowUp') S.upHeld = false;
  if (e.key === 'ArrowDown') S.downHeld = false;
  // Don't cut the sound the moment the key comes up, or a word comes out as separate letters. A short gap and it stops.
  if (e.key.toLowerCase() === S.keyHeld) { S.keyHeld = null; S.voiceRel = .2; }
}
function release() { S.keyHeld = null; if (S.voice) S.voice.release(); }
function drawSaid() {
  const el = $('said');
  if (!S.said) S.saidAir.length = 0;
  while (S.saidAir.length > S.said.length) S.saidAir.shift();
  el.innerHTML = '';
  // Each letter is the size of the breath it was said on, so a sentence tails off as the air goes.
  // In the overheard scenes, a word it has heard firms up in the color of whoever it took it from. Anything else stays a smear.
  const from = Math.max(0, S.said.length - 38), off = S.said.length - S.saidAir.length, tell = S.scene && S.scene.heard;
  const ownerAt = [];
  if (tell) S.said.replace(/[a-z]+/g, (w, at) => { const who = S.known[squeeze(w)]; for (let n = 0; n < w.length; n++) ownerAt[at + n] = who || 0; return w; });
  for (let i = from; i < S.said.length; i++) {
    const sp = document.createElement('span'), air = S.saidAir[i - off], k = air === undefined ? 1 : Math.min(1, air / .4);
    sp.textContent = S.said[i];
    sp.style.fontSize = (15 + 21 * k) + 'px';
    let op = .32 + .68 * k;
    if (tell && ownerAt[i] === 0) { sp.style.filter = 'blur(1.6px)'; op *= .62; }
    else if (tell && ownerAt[i]) sp.style.color = MAP.COL[ownerAt[i]];
    sp.style.opacity = op.toFixed(2);
    el.appendChild(sp);
  }
  el.style.color = S.obj.muted > 0 ? 'rgba(255,253,243,.35)' : '#fffdf3';
}
function placeSaid() {
  const p = Render.project([S.obj.at.x, S.obj.at.y + .5, S.obj.at.z]);
  const el = $('said'), w = $('who');
  // Keep the words below the map if they would land on it.
  const left = clamp(p.x - 260, 20, 740), inMap = p.x > 1000;
  el.style.left = left + 'px'; el.style.top = clamp(p.y - 110, inMap ? 190 : 60, 500) + 'px';
  w.style.left = left + 'px'; w.style.top = clamp(p.y - 142, inMap ? 158 : 30, 470) + 'px';
}
function updateTyping(dt) {
  if (S.keyHeld) {
    S.pressT += dt; S.sinceKey = 0;
    if (S.pressT > .16) { S.pressT -= .13; spendAir(); if (S.keyHeld && S.said.length < 60) { addSaid(S.keyHeld); drawSaid(); } }
  } else S.sinceKey += dt;
  if (S.voiceRel > 0) { S.voiceRel -= dt; if (S.voiceRel <= 0 && !S.keyHeld) release(); }
  tickBreath(dt);
  tickBreathEffects(dt);
  const want = S.upHeld ? 1.55 : S.downHeld ? .62 : 1;
  S.bend += (want - S.bend) * Math.min(1, dt * 7);
  if (S.voice && Math.abs(S.bend - want) > .002) S.voice.bend(S.bend);
  if (S.sinceKey > .95 && S.typed.trim()) react();
  if (S.sinceKey > 2.2 && S.said) { S.said = ''; drawSaid(); }
}
// The mouse is over a thing if it's over the shape of the thing on screen. When two overlap, the smaller one wins.
function under() {
  let best = null, area = 1e12, near = null, bd = 62;
  ROOMS[S.room].objects.forEach(o => {
    HOUSE.outlineFor(o);
    const p0 = Render.project([o.at.x, o.at.y, o.at.z]), d = Math.hypot(p0.x - S.cursor.x, p0.y - S.cursor.y);
    if (d < bd) { bd = d; near = o; }
    const b = o.glowBox;
    if (!b) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
      const p = Render.project([x, y, z]);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const a = (x1 - x0) * (y1 - y0);
    if (S.cursor.x >= x0 - 6 && S.cursor.x <= x1 + 6 && S.cursor.y >= y0 - 6 && S.cursor.y <= y1 + 6 && a < area) { area = a; best = o; }
  });
  return best || near;
}
// The little plan of the house. It never takes a click: everything underneath it still works.
const MAP = (() => {
  const k = 10, dn = 64, up = 6, gx = 11;
  const at = (x, y, w, d, name, label) => ({ x, y, w: w * k, h: d * k, W: w, D: d, name, label });
  const rooms = {
    garage: at(gx, dn, 6, 7.5, 'garage', 'garage'),
    kitchen: at(gx + 6 * k, dn + 1.25 * k, 6, 5, 'kitchen', 'kitchen'),
    hallway: at(gx + 12 * k, dn, 3.4, 7.5, 'hallway', 'hall'),
    living: at(gx + 15.4 * k, dn + 1.25 * k, 6, 5, 'living', 'living'),
    wren: at(gx + 6.6 * k, up, 4, 4, 'wren', 'Wren'),
    landing: at(gx + 10.6 * k, up + .6 * k, 2.2, 2.8, 'landing', ''),
    bedroom: at(gx + 12.8 * k, up, 5, 4.6, 'bedroom', 'bedroom'),
  };
  const COL = { m: '#efc64e', d: '#79c56c', w: '#ff5a4a', g: '#6ea8ea', a: '#c9a2e8' };
  return { rooms, COL };
})();
// How long is left in this scene, worked out from what's still to be said. Talking holds the scene up, so it holds this up too.
const meter = { el: 0, p: 0, rem: 1, t: 0, scene: null };
function trackLeft(t) {
  if (t.done) return 0;
  let s = Math.max(0, t.t) + Math.max(0, t.waiting);
  for (let i = t.i; i < t.lines.length; i++) {
    const l = t.lines[i], o = l[2] || {};
    if (o.if && !o.if()) continue;
    s += dur(typeof l[1] === 'function' ? l[1]() : l[1]) + .42 + (o.ask || 0);
  }
  if (t.after) { const dep = S.tracks.find(x => x.room === t.after); if (dep) s += trackLeft(dep); }
  if (t.waitFor && !t.waitFor()) s += 6;
  return s;
}
function sceneLeft() {
  const sc = S.scene, f = S.f, g = S.g;
  let rem = 0;
  S.tracks.forEach(t => { rem = Math.max(rem, trackLeft(t)); });
  if (sc.garage) {
    if (g.outcome) return Math.max(0, g.endT);
    if (g.shut) rem = Math.max(rem, (1 - g.p) * 75);
    return rem + 4;
  }
  if (sc.final) {
    if (f.ending) return Math.max(0, f.endT);
    if (f.script) {
      let s = Math.max(0, f.wait);
      f.script.forEach(it => { s += typeof it === 'number' ? it : it.until ? 4 : Array.isArray(it) ? dur(typeof it[1] === 'function' ? it[1]() : it[1]) + .3 : 0; });
      return s + 2.5;
    }
    if (f.asked && !f.answered) return Math.max(0, f.askT) + 12;
    return rem + 38 + 12;
  }
  if (sc.minT) rem = Math.max(rem, sc.minT - f.time);
  return rem + 1.6;
}
function drawMeter(dt) {
  const box = $('meter');
  const show = S.scene && !S.scene.locked && !S.finished && !S.card;
  box.style.display = show ? 'block' : 'none';
  if (meter.scene !== S.scene) { meter.scene = S.scene; meter.el = 0; meter.p = 0; meter.t = 0; }
  if (!show) return;
  const talking = (!S.scene.heard && (S.keyHeld || S.typed.trim())) || (S.sub && S.sub.reply) || S.subs.some(x => x.reply);
  if (S.paused <= 0 && !talking) meter.el += dt;
  meter.t -= dt;
  if (meter.t <= 0) { meter.t = .2; meter.rem = sceneLeft(); }
  meter.p = Math.max(meter.p, meter.el / Math.max(.01, meter.el + meter.rem));
  $('meterfill').style.width = (meter.p * 100).toFixed(1) + '%';
}
let mapT = 0;
function drawMap(dt) {
  const el = $('map');
  const show = S.scene && !S.scene.locked && !S.finished && !S.card;
  el.style.display = show ? 'block' : 'none';
  if (!show) return;
  mapT -= dt;
  if (mapT > 0) return;
  mapT = .08;
  const g = el.getContext('2d');
  g.clearRect(0, 0, el.width, el.height);
  for (const key in MAP.rooms) {
    const r = MAP.rooms[key];
    g.fillStyle = key === S.room ? 'rgba(255,226,160,.5)' : 'rgba(24,17,10,.55)';
    g.fillRect(r.x, r.y, r.w, r.h);
    g.strokeStyle = key === S.room ? 'rgba(255,240,205,.95)' : 'rgba(255,240,205,.5)';
    g.lineWidth = key === S.room ? 2 : 1;
    g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1);
    if (r.label) { g.fillStyle = key === S.room ? '#22160a' : 'rgba(255,240,205,.8)'; g.font = 'italic 11px Georgia, serif'; g.fillText(r.label, r.x + 4, r.y + r.h - 4); }
  }
  // The stairs, and everyone.
  const h = MAP.rooms.hallway, l = MAP.rooms.landing;
  g.strokeStyle = 'rgba(255,240,205,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(h.x + 7, h.y); g.lineTo(l.x + 7, l.y + l.h); g.stroke();
  all.forEach(p => {
    if (!p.room || p.gone || !MAP.rooms[p.room]) return;
    const r = MAP.rooms[p.room], sx = p.room === 'landing' ? 0 : p.x, sz = p.room === 'landing' ? 0 : p.z;
    const x = r.x + clamp(sx / r.W + .5, .08, .92) * r.w, y = r.y + clamp(sz / r.D + .5, .08, .92) * r.h;
    g.fillStyle = MAP.COL[p.id] || '#fff'; g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = 1.2;
    g.beginPath(); g.arc(x, y, p === W ? 3.4 : 4.2, 0, 7); g.fill(); g.stroke();
  });
}

function step(dt) {
  S.time += dt;
  if (S.finished || !S.scene) return;
  updateTyping(dt);
  all.forEach(p => { if (!p.room) return; runPerson(p, dt); });
  keepApart(dt);
  HOUSE.update(dt, S.room, { loop: S.f.loop && S.scene && S.scene.friday, tex: S.scene && Render.bakedTex('kitchen', S.scene.state), truck: S.scene && S.scene.friday && alive() });
  updateHeads(dt);
  updateArms(dt);
  runTracks(dt);
  S.heat = Math.max(0, S.heat - dt / 9);
  Object.keys(ROOMS).forEach(rk => ROOMS[rk].objects.forEach(o => {
    if (o.muted > 0) { o.muted = Math.max(.01, o.muted - dt); if (o.muted <= 3 && !o.fixing) { o.fixing = true; replug(o, rk); } }
    else o.fixing = false;
  }));
  if (S.moodT > 0) { S.moodT -= dt; if (S.moodT <= 0) Render.setView({ dim: 1, tint: [1, 1, 1] }); }
  if (S.sub) { S.sub.dur -= dt; if (S.sub.dur <= 0) S.sub = null; }
  // Whatever's said in the room you're in, the house now has those words.
  if (!S.sub && S.subs.length) { S.sub = S.subs.shift(); learnLine(S.sub.text, S.sub.who); }
  all.forEach(p => {
    People.pose(p, dt, S.time);
    p.root.visible = p.room === S.room && !p.gone;
    p.canHold = p.carrying;
    p.can.visible = p.carrying;
    // The box rises with the arms when it's picked up, and goes down with them when it's put down.
    const ca = p.carryA || 0;
    p.boxM.visible = !!p.hasBox || ca > .12;
    p.boxM.position.y = (-.39 + .64 * ca) * p.s;
    p.quilt.visible = p.lie;
    if (p.lie) {
      // In bed, on their backs, looking at the ceiling.
      p.root.rotation.set(-Math.PI / 2 + .2, 0, 0); // Propped a little, on the pillow.
      p.root.position.y = p === W ? .53 : .62;
      p.blob.visible = false;
    } else {
      p.root.rotation.x = 0;
      p.root.position.y = p.y + (p.baseY || 0) + (p.room === 'hallway' ? HOUSE.stairY(p.x, p.z) : 0);
      p.blob.visible = p.seated < .5;
    }
  });
  placeSaid();
  if (nameT > 0) { nameT -= dt; if (nameT <= 0) $('who').style.opacity = 0; }
  const h = S.scene && S.scene.locked ? null : under();
  // The thing under the mouse glows. So does the one you just became, for a moment, so you can find yourself.
  S.selT = Math.max(0, (S.selT || 0) - dt);
  const lit = S.card ? null : h || (S.selT > 0 && !S.scene.locked ? S.obj : null);
  Render.setOutline(lit ? HOUSE.outlineFor(lit) : null);
  drawMap(dt);
  drawMeter(dt);
  $('stage').style.cursor = h ? 'pointer' : 'default';
  $('hover').textContent = h && h !== S.obj ? h.name : '';
  $('hover').style.left = S.cursor.x + 18 + 'px'; $('hover').style.top = S.cursor.y - 8 + 'px';
  const el = S.scene && S.scene.locked ? null : voicesElsewhere();
  $('voices').textContent = el ? `Voices in ${el}. Tab.` : '';
}
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(.1, (now - last) / 1000);
  last = now;
  if (S.on) step(dt);
  if (typeof EPI !== 'undefined' && EPI.on) tickEpilogue(dt);
  if (S.ready) { Render.frame(dt); drawSub(); if (S.on) Audio2.tick(dt); }
}
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  $('stage').style.transform = `scale(${s}) translate(-50%, -50%)`;
}
async function boot() {
  fit(); addEventListener('resize', fit);
  Render.init($('gl'));
  if (params.get('samples')) Render.setSamples(parseInt(params.get('samples'), 10));
  scene = Render.scene();
  M = People.make(People.CAST.m); D = People.make(People.CAST.d); W = People.make(People.CAST.w);
  GARY = People.make({ height: 1.02, bulk: 1.12, skin: '#c29a7c', blush: 'rgba(190,100,80,.22)', lip: '#8d463d', iris: '#3f3a2a', brow: '#2a2118', browW: 7, hair: '#6b6660', hairStyle: 'short', top: '#54667c', topDark: '#3f4e60', bottom: '#39414d', shoe: '#17120e', stubble: true, shoulder: .205, armR: .046, legR: .08 });
  ANNIE = People.make(Object.assign({}, People.CAST.m, { height: 1.0, hair: '#7c5a34', top: '#4d5f7d', topDark: '#3a4963', bottom: '#2f2d2c', skin: '#d6ab8d' }));
  all = [M, D, W, GARY, ANNIE];
  all.forEach(p => { scene.add(p.root); });
  controller(M, 'm'); controller(D, 'd'); controller(W, 'w'); controller(GARY, 'g'); controller(ANNIE, 'a');
  CAN_MAT = new THREE.MeshPhongMaterial({ color: 0xb0322a, shininess: 40 });
  BOX_MAT = new THREE.MeshLambertMaterial({ map: Sets.mat('card').map });
  const LABEL_MAT = new THREE.MeshPhongMaterial({ color: 0xf0e9d6, shininess: 20 });
  all.forEach(p => {
    // Sized to the person, resting on the forearms, and part of the upper body so it moves when they do.
    p.boxM = new THREE.Mesh(new THREE.BoxGeometry(.5 * p.s, .24 * p.s, .3 * p.s), BOX_MAT);
    p.boxM.position.set(0, .25 * p.s, .25 * p.s); p.boxM.visible = false; p.spine.add(p.boxM);
    // A can in the palm. It's turned so it stands upright once the forearm is level.
    p.can = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.046, .046, .125, 14), CAN_MAT);
    const label = new THREE.Mesh(new THREE.CylinderGeometry(.047, .047, .06, 14), LABEL_MAT);
    p.can.add(body, label);
    p.can.position.set(0, -.082 * p.s, .05 * p.s); p.can.rotation.x = 1.7; p.can.visible = false; p.R.hand.add(p.can);
    p.root.visible = false;
    // A blanket for when they're in bed, pulled up to the chest.
    // Thick and wide enough to lie over arms, knees and toes. It stops at the collarbone, so there's a head on the pillow.
    p.quilt = new THREE.Mesh(new THREE.BoxGeometry(.74 * p.s, 1.44 * p.s, .26 * p.s), new THREE.MeshPhongMaterial({ color: p === W ? 0xa7686a : 0x44565f, shininess: 3 }));
    p.quilt.position.set(0, .64 * p.s, 0);
    // It tents up over the toes.
    const toes = new THREE.Mesh(new THREE.BoxGeometry(.74 * p.s, .42 * p.s, .36 * p.s), p.quilt.material);
    toes.position.set(0, -.51 * p.s, .05 * p.s); p.quilt.add(toes);
    p.quilt.visible = false; p.root.add(p.quilt);
  });
  HOUSE.build(scene);
  HOUSE.onOpen(id => { const d = HOUSE.DOORS[id]; if (d.a.room === S.room || d.b.room === S.room) Audio2.fx.door(); });
  S.left = new HugArms.Arm(scene); S.right = new HugArms.Arm(scene);
  S.left.visible(false); S.right.visible(false);
  // The photograph comes first: you see it from across the room, hanging on the wall, while the rest of the house bakes behind it.
  await makeTitlePhoto();
  $('title').classList.add('seen');
  if (!params.has('mute') && !params.has('auto')) Audio2.startMenuSong();
  // You stand back and look at the wall. Your first click starts the song. Once you've clicked and the house has finished
  // loading, whichever comes last, you get 2.5 more seconds of the wall before you walk up to the picture.
  const wallHold = { at: null, loaded: false, done: false, walk: null };
  wallHold.go = () => {
    if (wallHold.done || !wallHold.loaded || wallHold.at === null || !wallHold.walk) return;
    wallHold.done = true;
    setTimeout(wallHold.walk, 2500);
  };
  const firstTouch = () => {
    if (wallHold.at !== null) return;
    wallHold.at = performance.now();
    removeEventListener('pointerdown', firstTouch); removeEventListener('keydown', firstTouch);
    wallHold.go();
  };
  addEventListener('pointerdown', firstTouch); addEventListener('keydown', firstTouch);
  // The pictures on the walls go into the bake, so wait for the one that loads from a file.
  if (typeof Pictures !== 'undefined') await Pictures.ready;
  const views = [];
  ROOM_ORDER.forEach(r => ['day', 'eve', 'night'].forEach(st => views.push([r, st])));
  for (let i = 0; i < views.length; i++) await Render.bake(views[i][0], undefined, views[i][1]);
  Render.showRoom('kitchen', undefined, 'day', { dim: 1, tint: [1, 1, 1] });
  S.ready = true;
  let begun = false;
  const begin = () => {
    if (begun) return;
    begun = true;
    if (!params.has('mute')) { Audio2.start(); Audio2.stopMenuSong(4); S.voice = Audio2.liveVoice(); if (S.voice) S.voice.character(S.obj.voice); }
    S.on = true;
    const sceneArg = params.get('scene');
    if (sceneArg) {
      $('title').style.display = 'none';
      startScene(SCENES.findIndex(s => s.id === sceneArg));
      return;
    }
    // Fade to black, the conversation, then in.
    $('intro').classList.add('on');
    setTimeout(() => { $('title').style.display = 'none'; playIntro(() => startScene(0)); }, params.has('fast') ? 10 : 1100);
  };
  // The front door is the way in: it lights up under the mouse, like anything else you can be. Enter works too.
  const door = $('doorhit');
  door.onclick = begin;
  door.addEventListener('mouseenter', () => { $('doorglow').classList.add('on'); });
  door.addEventListener('mouseleave', () => { $('doorglow').classList.remove('on'); });
  if (params.get('scene')) { const pro = SCENES.filter(s => s.prologue); pro.forEach(s => s.tracks.forEach(t => t.lines.forEach(l => { if (typeof l[1] === 'string') learnLine(l[1], l[0]); }))); S.recent = {}; }
  // Everything's ready, so walk up to the picture. The door wakes up as you arrive.
  const wake = () => { door.classList.add('ready'); $('doorglow').classList.add('ready'); door.focus({ preventScroll: true }); };
  wallHold.walk = () => { $('titlecam').classList.add('in'); setTimeout(wake, 1250); };
  wallHold.loaded = true;
  if (params.has('fast') || params.has('auto')) { firstTouch(); wallHold.done = true; $('titlecam').classList.add('in'); wake(); }
  else wallHold.go();
  if (params.has('auto')) begin();
  const stage = $('stage');
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    S.cursor.x = (e.clientX - r.left) / r.width * 1280;
    S.cursor.y = (e.clientY - r.top) / r.height * 720;
  });
  stage.addEventListener('mousedown', () => { if (!S.on || S.finished || !S.scene || S.scene.locked) return; const h = under(); if (h) become(h); });
  addEventListener('keydown', keyDown);
  addEventListener('keyup', keyUp);
  addEventListener('blur', release);
  requestAnimationFrame(loop);
}
window.Y = { heardReact, ERRANDS, strainKey, strainUp, S, SCENES, ROOMS, step, react, become, nextRoom, goRoom, startScene, ACTS, closeGarage, openGarage, finishGarage, sillyCount, get M() { return M; }, get D() { return D; }, get W() { return W; }, get G() { return GARY; }, get A() { return ANNIE; } };
boot();
