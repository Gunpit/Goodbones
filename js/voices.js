// Doing their voices. Hold ↓ while you talk and you sound like Dell; hold ↑ and you sound like Wren.
// Said from a room the real one isn't in, whoever hears it thinks it's them, and goes to find them. That's a stall, with any word you know.
// Said in front of the real one, it doesn't work, and it's a little funny.
// It can't be spammed: each voice works twice a day, there's a cooldown between tries, and every try makes them more suspicious.
// Past that, they've worked it out, and it only gets you closer to being unplugged.

// ---- Whose voice was that ----
const VO = { n: 0, low: 0, high: 0 };
addEventListener('keydown', e => {
  if (e.repeat || !/^[a-z]$/i.test(e.key) || !S.scene) return;
  // The game's own handler has already added this letter: if it's the only one, this is a new utterance.
  if (S.typed.trim().length <= 1) VO.n = VO.low = VO.high = 0;
  VO.n++; if (S.downHeld) VO.low++; if (S.upHeld) VO.high++;
});
// Most of it said low is Dell; most of it high is Wren. Anything else is just the house.
function voiceOf() {
  const v = VO.n && VO.low * 2 > VO.n ? 'd' : VO.n && VO.high * 2 > VO.n ? 'w' : null;
  VO.n = VO.low = VO.high = 0;
  return v;
}
const VOICE_COOLDOWN = 25;
const VOICE_HEAT = 2;
const VOICE_WISE = {
  d: [['m', 'That is not Dell. Very funny.'], ['m', 'Dell does not sound like that. Write that down.']],
  w: [['m', 'Wren is right there. I can hear her.'], ['d', 'Nice try, buddy. That is not Wren.']],
};
// Somewhere safe to stand in the room they go to.
const lookFor = room => BOXES_AT[room] || [0, 0];

function impersonate(v, text, o) {
  const known = heardWords(text).filter(t => S.known[t]);
  if (!known.length) return false; // still only words it's heard
  const real = personById(v);
  const listeners = ['m', 'd'].map(personById).filter(p => p !== real && isHere(p) && !p.held && !p.inCar && !p.dead);
  const cfgNow = cfg();
  // In front of the real one, nobody's fooled.
  if (isHere(real)) {
    const i = PS.caught = (PS.caught || 0) + 1;
    const lines = v === 'd'
      ? (listeners.length ? [[['d', 'That was not me.'], ['m', 'It sounded exactly like you.']], [['d', 'Still not me.']], [['m', 'Dell. Stop doing the voice.'], ['d', 'I am not doing anything!']]] : [[['d', 'Huh. Do I sound like that?']], [['d', 'I do not sound like that.']]])
      : (listeners.length ? [[['w', 'That was not me! That was the house.'], [listeners[0].id, 'Sure it was, honey.']], [['w', 'It was the house again!']], [[listeners[0].id, 'Wren. Enough.']]] : [[['w', 'Hey! That is my voice.']], [['w', 'Stop it! That is mine.']]]);
    lines[(i - 1) % lines.length].forEach(l => say(l[0], l[1]));
    S.heat += 1 + i * .25; suspicious();
    return true;
  }
  const p = listeners.find(q => !q.errand);
  if (!p) return false;
  S.spoke++;
  const key = 'voice_' + v, n = PS.uses[key] || 0, since = S.time - (PS.voiceT ?? -99);
  // Seen through: used up for today, or tried again too soon. No stall, just suspicion.
  if (n >= PK.USES || since < VOICE_COOLDOWN) {
    const wise = since < VOICE_COOLDOWN && n < PK.USES ? [[p.id, p === M ? 'I just went. I am not going again.' : 'I just looked, buddy.']] : [VOICE_WISE[v][(n - PK.USES) % 2]].filter(l => l[0] === 'cap' || isHere(personById(l[0])));
    wise.forEach(l => say(l[0], l[1]));
    p.attn = 3; S.heat += VOICE_HEAT; suspicious();
    PS.uses[key] = n + 1;
    return true;
  }
  // Fooled. They go and find whoever they think called.
  PS.uses[key] = n + 1; PS.voiceT = S.time; PS.lured++;
  const room = real.room && ROOMS[real.room] ? real.room : 'hallway', at = lookFor(room);
  const callLine = v === 'd' ? (p === M ? ['Dell?', 'What, Dell?'][n] : 'Was that... me?') : ['Wren? Honey?', 'Coming, Wren.'][n];
  say(p.id, callLine);
  const found = v === 'd'
    ? [sayIfHere(p.id, 'What?'), sayIfHere('d', 'What what?'), sayIfHere(p.id, 'You called me.'), sayIfHere('d', 'I did not call you.')]
    : [sayIfHere(p.id, 'Did you call me, honey?'), sayIfHere('w', 'No?'), sayIfHere(p.id, 'Okay.')];
  goOff(p, travelSteps(p, room, at[0], at[1], 0).concat(found.slice(0, 1), wait(.8), found.slice(1), wait(2.5)));
  S.heat += VOICE_HEAT; suspicious();
  if (typeof winFlash === 'function') winFlash(`${NAMES[p.id]} stalled`);
  return true;
}
const _packReactV = packReact;
packReact = () => {
  const v = voiceOf(), text = S.typed, o = S.obj;
  // The garage on Thursday has its own words; leave those alone.
  const garageBusy = cfg().onSay && S.room === 'garage';
  if (v && text.trim() && o.muted <= 0 && !garageBusy && impersonate(v, text, o)) { S.typed = ''; PS.lastSpoke = S.time; return; }
  return _packReactV();
};
