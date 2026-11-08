// How the house says what you type. English spelling turned into speech sounds, one sound per key, as you go.
// Each key gets a sound, or null when it makes none of its own: the second O in "good", the E in "home".
// It can't know the word you haven't finished, so if what you've typed so far starts a word it has heard or knows, it says it like that word.
const Speech = (() => {
  const VOW = 'aeiou';
  const isV = c => VOW.includes(c);
  // Words English won't let you work out. One entry per letter; "-" means that letter adds no sound.
  const ODD = {
    the: 'dh - ah', you: 'y uw -', i: 'ay', a: 'ah', to: 't uw', do: 'd uw', of: 'ah v', is: 'ih z', was: 'w ah z', are: 'aa r -', love: 'l ah v -', come: 'k ah m -', some: 's ah m -',
    have: 'hh ae v -', one: 'w ah n', said: 's eh - d', soup: 's uw - p', good: 'g uh - d', food: 'f uw - d', book: 'b uh - k', look: 'l uh - k', house: 'hh aw - s -', door: 'd ao - r', floor: 'f l ao - r',
    work: 'w er - k', word: 'w er - d', they: 'dh ey - -', there: 'dh eh r - -', here: 'hh iy r -', where: 'w - eh r -', what: 'w - ah t', who: 'hh - uw', why: 'w - ay', we: 'w iy', me: 'm iy', he: 'hh iy', she: 'sh - iy',
    be: 'b iy', my: 'm ay', by: 'b ay', hi: 'hh ay', no: 'n ow', go: 'g ow', so: 's ow', mom: 'm aa m', dad: 'd ae d', wren: '- r eh n', dell: 'd eh l -', marion: 'm eh r iy ah n', truck: 't r ah k -', mortgage: 'm ao r - g ih jh -',
    how: 'hh aw -', now: 'n aw -', down: 'd aw - n', mother: 'm ah dh - er -', father: 'f aa dh - er -', brother: 'b r ah dh - er -', other: 'ah dh - er -',
    friday: 'f r ay d ey -', school: 's k - uw - l', condo: 'k aa n d ow', could: 'k uh - - d', would: 'w uh - - d', should: 'sh - uh - - d', water: 'w ao t er -', fire: 'f ay r -', please: 'p l iy - z -', stay: 's t ey -', bones: 'b ow n - z',
  };
  const LONG = { a: 'ey', e: 'iy', i: 'ay', o: 'ow', u: 'uw' }, SHORT = { a: 'ae', e: 'eh', i: 'ih', o: 'aa', u: 'ah' };
  const TEAMS = { ee: 'iy', ea: 'iy', ai: 'ey', ay: 'ey', oa: 'ow', oo: 'uw', ou: 'aw', ow: 'ow', oi: 'ay', oy: 'ay', au: 'ao', aw: 'ao', ie: 'iy', ue: 'uw', ew: 'uw', ei: 'ey', ey: 'ey' };
  const RS = { er: 'er', ir: 'er', ur: 'er', ar: 'aa', or: 'ao' };
  const CONS = { b: 'b', d: 'd', f: 'f', g: 'g', h: 'hh', j: 'jh', k: 'k', l: 'l', m: 'm', n: 'n', p: 'p', q: 'k', r: 'r', s: 's', t: 't', v: 'v', w: 'w', x: 'k', z: 'z' };
  const cache = {};
  function pronounce(word) {
    if (cache[word]) return cache[word];
    if (ODD[word]) return (cache[word] = ODD[word].split(' ').map(p => (p === '-' ? null : p)));
    const w = word, n = w.length, out = new Array(n).fill(null);
    // A final E after a single consonant: it's silent, and it stretches the vowel before it. Same with a plural or -d on the end.
    const tail = w.endsWith('es') || w.endsWith('ed') ? n - 2 : n - 1;
    const magic = n >= 3 && w[tail] === 'e' && tail >= 2 && !isV(w[tail - 1]) && isV(w[tail - 2]) && (tail < 3 || !isV(w[tail - 3]));
    for (let i = 0; i < n; i++) {
      const c = w[i], two = w.slice(i, i + 2), next = w[i + 1], prev = w[i - 1];
      if (c === 'y') {
        if (i === 0) out[i] = 'y';
        else out[i] = i === n - 1 ? (n <= 3 ? 'ay' : 'iy') : 'ih';
        continue;
      }
      if (isV(c)) {
        if (magic && i === tail) continue;
        if (w.slice(i, i + 3) === 'igh') { out[i] = 'ay'; i += 2; continue; }
        if (TEAMS[two]) { out[i] = TEAMS[two]; i++; continue; }
        if (RS[two] && (i + 2 >= n || !isV(w[i + 2]))) { out[i] = RS[two]; i++; continue; }
        if (magic && i === tail - 2) { out[i] = LONG[c]; continue; }
        // A vowel on the end of a short word usually says its name. A final E in a longer one mostly says nothing.
        if (i === n - 1 && c === 'e') continue;
        if (i === n - 1 && c === 'o') { out[i] = 'ow'; continue; }
        if (i === n - 1 && c === 'a') { out[i] = 'ah'; continue; }
        if (i === n - 1 && n <= 3) { out[i] = LONG[c]; continue; }
        out[i] = SHORT[c];
        continue;
      }
      if (two === 'sh') { out[i] = 'sh'; i++; continue; }
      if (two === 'ch') { out[i] = 'jh'; i++; continue; }
      if (two === 'th') { out[i] = i === 0 && ['this', 'that', 'them', 'then', 'these', 'those', 'than'].includes(w) ? 'dh' : 'th'; i++; continue; }
      if (two === 'ph') { out[i] = 'f'; i++; continue; }
      if (two === 'ck') { out[i] = 'k'; i++; continue; }
      if (two === 'ng') { out[i] = 'ng'; i++; continue; }
      if (two === 'wh') { i++; out[i] = 'w'; continue; }
      if (two === 'wr' || two === 'kn') continue;
      if (two === 'gh') { i++; continue; }
      if (two === 'qu') { out[i] = 'k'; out[i + 1] = 'w'; i++; continue; }
      if (next === c) { out[i] = CONS[c] || null; i++; continue; }
      if (c === 'c') { out[i] = next && 'eiy'.includes(next) ? 's' : 'k'; continue; }
      if (c === 'g' && next && 'ei'.includes(next) && i > 0) { out[i] = 'jh'; continue; }
      if (c === 's') {
        // S buzzes between vowels and after a voiced sound at the end of a word.
        if (prev && next && isV(prev) && isV(next)) out[i] = 'z';
        else if (i === n - 1 && prev && !'ptkf'.includes(prev) && (i >= 1)) out[i] = 'z';
        else out[i] = 's';
        continue;
      }
      out[i] = CONS[c] || null;
    }
    return (cache[word] = out);
  }
  const heard = new Set();
  function learn(raw) { if (raw && raw.length > 1) heard.add(raw); }
  // What word does this look like the start of? Words it's heard first, then ones it has a meaning for. Shortest wins.
  function guess(cur) {
    if (cur.length < 2) return cur;
    if (heard.has(cur) || ODD[cur]) return cur;
    let best = null;
    const look = list => { for (const w of list) if (w.length > cur.length && w.startsWith(cur) && (!best || w.length < best.length)) best = w; };
    look(heard);
    if (!best) look(Object.keys(ODD));
    if (!best) look(Object.keys(WORDS));
    return best || cur;
  }
  // The sound for the last key of a word in progress, and the vowel it would run into next.
  function soundFor(cur) {
    const word = guess(cur), phones = pronounce(word), i = cur.length - 1;
    const p = phones[i] === undefined ? null : phones[i];
    let next = null;
    for (let k = i + 1; k < phones.length; k++) if (phones[k]) { next = phones[k]; break; }
    return { p, next, word };
  }
  return { pronounce, soundFor, learn, guess };
})();
// How much of what it says comes out as real speech. The rest comes out as the raw shape of the letter:
// on Wednesday it's mostly mouthing with the odd real sound in it, by Friday it's just talking.
function speechShare() {
  const c = S.clear === undefined ? 1 : voiceClear(S.clear);
  return clamp((c - .1) / .75, .12, 1);
}
// One key's worth of voice. A key with no sound of its own just lets the one before it carry on.
function sayNextLetter() {
  if (!S.voice || S.obj.muted > 0) return;
  const m = S.typed.match(/[a-z]+$/);
  if (!m) return;
  S.voiceRel = 0;
  // A word it has actually heard comes out more like the word. It's had practice at that one.
  const known = S.scene && S.scene.heard && ownerOfStart(squeeze(m[0]));
  if (Math.random() > speechShare() + (known ? .45 : 0)) { S.voice.press(m[0][m[0].length - 1]); return; }
  const snd = Speech.soundFor(m[0]);
  if (snd.p) S.voice.phone(snd.p, snd.next);
  else S.voice.sustain();
}
