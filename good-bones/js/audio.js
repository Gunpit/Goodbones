// All sound is synthesised: hum, pipes, creaks, heartbeat, pitched babble, a little piano.
const Audio2 = (() => {
  let ctx, master, humGain, heartLevel = 0, heartTimer = 0, creakTimer = 6;
  let noiseBuf;

  function start() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }

    // A refrigerator, more or less.
    humGain = ctx.createGain(); humGain.gain.value = .05; humGain.connect(master);
    const o1 = ctx.createOscillator(); o1.frequency.value = 120;
    const o2 = ctx.createOscillator(); o2.frequency.value = 120.7; o2.type = 'triangle';
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
    o1.connect(lp); o2.connect(lp); lp.connect(humGain); o1.start(); o2.start();
    const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 280;
    const ng = ctx.createGain(); ng.gain.value = .5;
    n.connect(nf); nf.connect(ng); ng.connect(humGain); n.start();
  }

  function burst(freq, q, dur, vol, type = 'bandpass', when = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  function tone(freq, dur, vol, type = 'sine', when = 0, attack = .005) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(.0004, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    return o;
  }

  // A timber creak is stick-slip: a slow, uneven train of little catches, each one ringing the wood. So: a wandering low
  // sawtooth, through a few narrow resonances. Different board each time. It fades in, so it never arrives all at once.
  function groanInto(c, out, t, secs, level) {
    const o = c.createOscillator(); o.type = 'sawtooth';
    const base = 16 + Math.random() * 9, steps = Math.ceil(secs * 5);
    o.frequency.setValueAtTime(base, t);
    for (let i = 1; i <= steps; i++) o.frequency.linearRampToValueAtTime(base * (.7 + Math.random() * .8 + .5 * i / steps), t + secs * i / steps);
    const g = c.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(level, t + secs * .35);
    g.gain.setValueAtTime(level, t + secs * .6); g.gain.linearRampToValueAtTime(.0001, t + secs);
    const board = .85 + Math.random() * .4;
    [[300, 11, .55], [620, 13, .4], [1120, 15, .2]].forEach(([f, q, a]) => {
      const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f * board; b.Q.value = q;
      const v = c.createGain(); v.gain.value = a;
      o.connect(b); b.connect(v); v.connect(g);
    });
    g.connect(out); o.start(t); o.stop(t + secs + .05);
  }

  const fx = {
    creak() { if (!ctx) return; const n = 3 + Math.random() * 5; for (let i = 0; i < n; i++) burst(240 + Math.random() * 500, 16, .09, .3, 'bandpass', i * (.05 + Math.random() * .07)); },
    pipe() { if (!ctx) return; const n = 2 + Math.random() * 4 | 0; for (let i = 0; i < n; i++) tone(420 + Math.random() * 60, .09, .1, 'triangle', i * .23); },
    settle() { burst(90, 2, .5, .75, 'lowpass'); },
    door() { burst(130, 3, .3, .9, 'lowpass'); burst(900, 4, .05, .22); },
    click() { burst(2400, 5, .03, .14); },
    water() { if (!ctx) return; for (let i = 0; i < 12; i++) burst(600 + Math.random() * 900, 7, .06, .1, 'bandpass', i * .09); },
    walls() { burst(70, 2, 1.4, 1, 'lowpass'); for (let i = 0; i < 6; i++) burst(200 + Math.random() * 220, 14, .12, .3, 'bandpass', .1 + i * .18); },
    garage() { if (!ctx) return; for (let i = 0; i < 24; i++) burst(170 + (i % 3) * 30, 6, .12, .22, 'bandpass', i * .13); burst(80, 2, .6, 1, 'lowpass', 3.1); },
    breath() { if (!ctx) return; burst(340, 1, 2.3, .13, 'lowpass'); },
    phone() { if (!ctx) return; for (let i = 0; i < 2; i++) { for (let k = 0; k < 14; k++) tone(k % 2 ? 480 : 620, .05, .05, 'square', i * 1.5 + k * .05); } },
    dial() { tone(350, 2.2, .05, 'sine'); tone(440, 2.2, .05, 'sine'); },
    engine() { burst(70, 3, 1.5, .5, 'lowpass'); },
    floor() { burst(150, 2, 1.1, .5, 'lowpass'); tone(90, 1.0, .1, 'sine'); },
    ding() { tone(1320, 1.2, .07, 'sine'); },
    reach() { if (!ctx) return; for (let i = 0; i < 7; i++) burst(170 + i * 45, 11, .1, .22, 'bandpass', i * .07); tone(70, .7, .08, 'sine'); },
    hug() { burst(130, 2, .55, .55, 'lowpass'); burst(340, 1, 1.4, .1, 'lowpass', .12); },
    bump() { burst(110, 3, .22, 1, 'lowpass'); burst(1300, 4, .04, .2); },
    snap() { burst(900, 6, .07, .4); burst(140, 3, .4, .6, 'lowpass', .03); },
    flop() { burst(170, 2, .16, .4, 'lowpass'); },
    // A long wooden groan that lasts as long as the arm takes to arrive.
    reachSlow(secs) { if (!ctx) return; const n = Math.floor(secs * 7); for (let i = 0; i < n; i++) burst(120 + (i / n) * 240, 13, .1, .16, 'bandpass', i / 7); },
    air() { burst(320, 1, 1.1, .16, 'lowpass'); tone(196, .5, .05, 'sine'); tone(165, .8, .05, 'sine', .32); },
    squeeze(n) { const s = [392, 494, 587, 659, 784]; tone(s[Math.min(n, 4)], .28, .11, 'triangle'); burst(120, 2, .18, .4, 'lowpass'); },
    word() { tone(880, .25, .06, 'triangle'); tone(1175, .4, .05, 'triangle', .1); },
    perfect() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .55, .08, 'triangle', i * .09)); },
    // Nothing left in the ducts: a little air, and no voice.
    puff() { burst(1100, 1, .14, .1, 'lowpass'); },
    // The house getting its air back: not a gasp, just the frame taking the strain, somewhere in the walls.
    groan(secs, level = 1) { if (ctx) groanInto(ctx, master, ctx.currentTime, Math.max(.9, Math.min(2.2, secs)), level * .6); },
    // A child humming to herself: mostly closed mouth, not quite the note.
    hum(f, d) { const w = f * (.985 + Math.random() * .03); tone(w, d, .07, 'sine', 0, .06); tone(w * 2, d * .9, .016, 'triangle', 0, .08); tone(w * 3, d * .7, .005, 'sine', 0, .1); },
  };

  function babble(pitch, secs) {
    if (!ctx) return;
    const n = Math.max(2, Math.min(18, secs * 3.4 | 0));
    for (let i = 0; i < n; i++) {
      tone(pitch * (.86 + Math.random() * .34), .1, .028, 'sawtooth', i * (.11 + Math.random() * .08), .02);
    }
  }

  // ---- The vent voice ----
  // A small formant synthesizer. The house has no voice of its own, so it reassembles the family's
  // words through a sheet-metal duct: each stolen word at its owner's pitch, with the stress in the
  // wrong place and the last vowel held too long. Close enough to understand. Not close enough.
  const V = (a, b, c, ms, b2) => ({ f: [a, b, c], ms, to: b2 });
  const VOWELS = {
    iy: V(270, 2290, 3010, 150), ih: V(390, 1990, 2550, 100), eh: V(530, 1840, 2480, 120), ae: V(660, 1720, 2410, 150),
    aa: V(730, 1090, 2440, 160), ao: V(570, 840, 2410, 160), uh: V(440, 1020, 2240, 100), uw: V(300, 870, 2240, 150),
    ah: V(640, 1190, 2390, 90), er: V(490, 1350, 1690, 130),
    ay: V(730, 1090, 2440, 210, [300, 2200, 2900]), aw: V(730, 1090, 2440, 210, [320, 870, 2240]),
    ey: V(530, 1840, 2480, 190, [290, 2250, 2950]), ow: V(570, 840, 2410, 200, [320, 870, 2240]),
  };
  const SONORANT = {
    y: [280, 2200, 2900, 60, 1], w: [300, 610, 2200, 70, 1], r: [420, 1300, 1600, 70, .9], l: [360, 1300, 2700, 70, .85],
    m: [280, 1000, 2200, 80, .5], n: [280, 1700, 2600, 75, .5], ng: [280, 2300, 2750, 85, .5],
  };
  // ms, noise centre, noise amount, voiced amount
  const FRIC = { s: [120, 5600, .75, 0], sh: [120, 2900, .8, 0], f: [100, 4400, .35, 0], th: [90, 5200, .3, 0], z: [110, 5200, .55, .4], v: [75, 3800, .22, .5], dh: [55, 4800, .2, .5], hh: [70, 1500, .3, 0], jh: [90, 2900, .6, .3] };
  // closure ms, burst ms, burst centre, burst amount, aspirated, voiced
  const STOP = { p: [55, 30, 900, .4, 1, 0], b: [45, 14, 900, .35, 0, 1], t: [50, 28, 4200, .55, 1, 0], d: [40, 14, 3800, .4, 0, 1], k: [55, 36, 2100, .55, 1, 0], g: [45, 18, 1900, .4, 0, 1] };

  function planVoice(words, rnd = Math.random) {
    const segs = [], pitch = [];
    let t = 0, cur = [500, 1500, 2500];
    const add = (ms, f, voice, noise, fc) => { segs.push({ t, dur: ms / 1000, f, voice, noise, fc }); t += ms / 1000; };
    words.forEach((w, wi) => {
      const plain = !!w.plain;
      // clarity 0 to 1: how well the house has learned this word. Low clarity loses consonants and flattens vowels.
      const clarity = w.clarity === undefined ? 1 : w.clarity;
      const list = w.ph.trim().split(/\s+/).map(p => {
        if (clarity >= 1) return p;
        if (VOWELS[p]) return rnd() > clarity + .25 ? (rnd() < .5 ? 'ah' : 'uw') : p;
        return rnd() > clarity + .2 ? (rnd() < .45 ? 'm' : rnd() < .5 ? 'hh' : '') : p;
      }).filter(Boolean);
      if (!list.some(p => VOWELS[p])) list.push('ah');
      const slow = 1 + (1 - clarity) * .75;
      const add0 = add;
      const addW = (ms, f, voice, noise, fc) => add0(ms * slow, f, voice, noise, fc);
      const vowels = list.map((p, i) => (VOWELS[p] ? i : -1)).filter(i => i >= 0);
      // Stress lands somewhere. Not necessarily on the right syllable.
      const stressed = vowels[Math.floor(rnd() * vowels.length)];
      const lastV = vowels[vowels.length - 1];
      const isLast = wi === words.length - 1;
      const p0 = w.pitch * (plain ? 1 : .86 + rnd() * .34);
      const start = t;
      list.forEach((p, i) => {
        const next = VOWELS[list[i + 1]] ? VOWELS[list[i + 1]].f : cur;
        if (VOWELS[p]) {
          const v = VOWELS[p];
          let ms = v.ms * 1.3;
          if (!plain && i === stressed) ms *= 1.35;
          if (!plain && isLast && i === lastV) ms *= 1.85;
          const end = v.to || v.f;
          addW(ms, [v.f, end], 1, 0, 0);
          cur = end;
        } else if (SONORANT[p]) {
          const s = SONORANT[p];
          addW(s[3] * 1.15, [[s[0], s[1], s[2]], [s[0], s[1], s[2]]], s[4], 0, 0);
          cur = [s[0], s[1], s[2]];
        } else if (FRIC[p]) {
          const s = FRIC[p];
          if (p === 'hh') addW(s[0] * 1.15, [next, next], .05, s[2], s[1]);
          else addW(s[0] * 1.15, [cur, next], s[3], s[2], s[1]);
        } else if (STOP[p]) {
          const s = STOP[p];
          addW(s[0], [cur, next], s[5] ? .12 : 0, 0, 0);
          addW(s[1], [next, next], s[5] ? .2 : 0, s[3], s[2]);
          if (s[4]) addW(30, [next, next], .05, .18, 1800);
        }
      });
      const wordDur = t - start;
      if (plain) {
        pitch.push({ t: start, v: p0 }, { t: start + wordDur, v: p0 * .88 });
      } else {
        // Each word has its own idea of where the sentence is going.
        const mid = p0 * (.84 + rnd() * .46);
        pitch.push({ t: start, v: p0 }, { t: start + wordDur * .55, v: mid }, { t: start + wordDur, v: p0 * (.78 + rnd() * .55) });
      }
      add(plain ? 200 : 70 + rnd() * 130, [cur, cur], 0, 0, 0);
    });
    return { segs, pitch, dur: t };
  }

  function renderVoice(actx, when, plan, dest, noise, odd = 1) {
    const T = s => when + s;
    const o = actx.createOscillator(); o.type = 'sawtooth';
    const voiceG = actx.createGain(); voiceG.gain.value = 0;
    const filters = [[9, 1], [11, .55], [14, .32]].map(([q, g]) => {
      const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
      const gain = actx.createGain(); gain.gain.value = g * 2.4;
      o.connect(f); f.connect(gain); gain.connect(voiceG);
      return f;
    });
    const n = actx.createBufferSource(); n.buffer = noise; n.loop = true;
    const nf = actx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 1.6;
    const noiseG = actx.createGain(); noiseG.gain.value = 0;
    n.connect(nf); nf.connect(noiseG);

    // The duct: a hard band, a tin comb, and a slap off the far end.
    const mix = actx.createGain();
    voiceG.connect(mix); noiseG.connect(mix);
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 170;
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6800;
    const peak = actx.createBiquadFilter(); peak.type = 'peaking'; peak.frequency.value = 1450; peak.Q.value = 1.8; peak.gain.value = 5;
    mix.connect(hp); hp.connect(peak); peak.connect(lp);
    const comb = actx.createDelay(.05); comb.delayTime.value = .0074;
    const fb = actx.createGain(); fb.gain.value = .42;
    const wet = actx.createGain(); wet.gain.value = .38;
    lp.connect(comb); comb.connect(fb); fb.connect(comb); comb.connect(wet);
    const slap = actx.createDelay(.5); slap.delayTime.value = .19;
    const slapG = actx.createGain(); slapG.gain.value = .13;
    lp.connect(slap); slap.connect(slapG);
    // Even out the loudness: narrow formants ring much harder on some pitches than on others.
    const comp = actx.createDynamicsCompressor();
    comp.threshold.value = -30; comp.knee.value = 12; comp.ratio.value = 8; comp.attack.value = .004; comp.release.value = .12;
    const master2 = actx.createGain(); master2.gain.value = 1.5;
    lp.connect(comp); wet.connect(comp); slapG.connect(comp);
    comp.connect(master2);
    master2.connect(dest);

    // A tremble in the sheet metal.
    const lfo = actx.createOscillator(); lfo.frequency.value = 29;
    const lfoG = actx.createGain(); lfoG.gain.value = 3.2 * odd;
    lfo.connect(lfoG); lfoG.connect(o.frequency);

    o.frequency.setValueAtTime(plan.pitch[0].v, T(0));
    plan.pitch.forEach(p => o.frequency.linearRampToValueAtTime(p.v, T(p.t)));

    filters.forEach((f, i) => f.frequency.setValueAtTime(plan.segs[0].f[0][i], T(0)));
    voiceG.gain.setValueAtTime(0, T(0));
    noiseG.gain.setValueAtTime(0, T(0));
    nf.frequency.setValueAtTime(3000, T(0));
    plan.segs.forEach(s => {
      const a = Math.min(.018, s.dur * .3);
      filters.forEach((f, i) => {
        f.frequency.linearRampToValueAtTime(s.f[0][i], T(s.t + a));
        f.frequency.linearRampToValueAtTime(s.f[1][i], T(s.t + s.dur));
      });
      voiceG.gain.linearRampToValueAtTime(s.voice * .55, T(s.t + a));
      voiceG.gain.linearRampToValueAtTime(s.voice * .55, T(s.t + s.dur - a * .4));
      noiseG.gain.linearRampToValueAtTime(s.noise * .85, T(s.t + a));
      noiseG.gain.linearRampToValueAtTime(s.noise * .85, T(s.t + s.dur - a * .4));
      if (s.fc) nf.frequency.setValueAtTime(s.fc, T(s.t));
    });
    voiceG.gain.linearRampToValueAtTime(0, T(plan.dur + .02));
    noiseG.gain.linearRampToValueAtTime(0, T(plan.dur + .02));
    const end = T(plan.dur + .1);
    o.start(T(0)); n.start(T(0), Math.random()); lfo.start(T(0));
    o.stop(end); n.stop(end); lfo.stop(end);
    return plan.dur;
  }

  function makeNoise(sr) {
    const b = new AudioBuffer({ length: sr, numberOfChannels: 1, sampleRate: sr });
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  let voiceNoise = null;
  // words: [{ ph, pitch, plain }]. Returns how many seconds it will take, sound or no sound.
  function speak(words) {
    const plan = planVoice(words);
    if (ctx) {
      if (!voiceNoise) voiceNoise = makeNoise(ctx.sampleRate);
      renderVoice(ctx, ctx.currentTime + .12, plan, master, voiceNoise, words.some(w => w.plain) ? .25 : 1);
    }
    return plan.dur + .15;
  }
  // For testing: draw a phrase to a buffer without using the speakers.
  async function renderToBuffer(words) {
    const plan = planVoice(words);
    const sr = 22050, off = new OfflineAudioContext(1, Math.ceil(sr * (plan.dur + .5)), sr);
    renderVoice(off, 0, plan, off.destination, makeNoise(sr));
    return { buffer: await off.startRendering(), plan };
  }

  // ---- The menu song ----
  // An original folk tune: someone whistling to themselves, a guitar being picked in the next room, and drums you mostly just feel.
  const BPM = 74;
  const TUNE = [
    // [note, beats]; 0 is a breath. In G.
    [71, 1.5], [74, .5], [79, 1], [76, 1],    [74, 2], [71, 1], [67, 1],
    [72, 1.5], [76, .5], [74, 1], [71, 1],    [69, 3], [0, 1],
    [71, 1.5], [74, .5], [79, 1], [81, 1],    [83, 2], [79, 1], [76, 1],
    [74, 1], [71, .5], [72, .5], [69, 1], [66, 1],    [67, 3], [0, 1],
    [76, 1.5], [78, .5], [79, 1], [76, 1],    [74, 2], [71, 2],
    [72, 1], [76, 1], [74, 1], [72, 1],       [71, 2], [67, 1], [69, 1],
    [71, 1.5], [74, .5], [76, 1], [79, 1],    [78, 1], [76, 1], [74, 2],
    [72, 1], [69, .5], [71, .5], [74, 1], [66, 1],    [67, 3], [0, 1],
  ];
  // One chord for each bar, as the notes the guitar picks through.
  const G = [43, 55, 59, 62, 67], C = [48, 55, 60, 64, 67], D = [50, 57, 62, 66, 69], Em = [40, 55, 59, 64, 67], Am = [45, 57, 60, 64, 69];
  const BARS = [G, G, C, D, G, Em, D, G, C, G, Am, G, G, D, Am, G];
  const PICK = [0, 2, 3, 2, 1, 3, 4, 3]; // which string on each eighth note
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function buildTune(actx, dest, noise) {
    const bus = actx.createGain(); bus.gain.value = 1; bus.connect(dest);
    // A small warm room, shared by everything.
    const room = actx.createDelay(1); room.delayTime.value = .23;
    const fb = actx.createGain(); fb.gain.value = .3;
    const damp = actx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 2200;
    const wet = actx.createGain(); wet.gain.value = .3;
    room.connect(damp); damp.connect(fb); fb.connect(room); damp.connect(wet); wet.connect(bus);
    const beat = 60 / BPM;
    const whistleAt = (start) => {
      const o = actx.createOscillator(); o.type = 'sine';
      const v = actx.createGain(); v.gain.value = 0;
      const vib = actx.createOscillator(); vib.frequency.value = 5.3;
      const vd = actx.createGain(); vd.gain.value = 0; vib.connect(vd); vd.connect(o.frequency);
      const n = actx.createBufferSource(); n.buffer = noise; n.loop = true;
      const nf = actx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 9;
      const ng = actx.createGain(); ng.gain.value = 0;
      n.connect(nf); nf.connect(ng);
      o.connect(v); ng.connect(v); v.connect(bus); v.connect(room);
      let t = start, first = true;
      TUNE.forEach(([m, b]) => {
        const d = b * beat;
        if (!m) { v.gain.setTargetAtTime(0, t, .05); first = true; t += d; return; }
        const f = hz(m + 12);
        // Whistlers don't hit a note, they slide up into it. Long notes get a little wobble once they've settled.
        if (first) { o.frequency.setValueAtTime(f * .955, t); first = false; }
        o.frequency.setTargetAtTime(f, t, .035);
        nf.frequency.setTargetAtTime(f, t, .03);
        const swell = .085 + (m - 66) * .0016;
        v.gain.setTargetAtTime(swell, t, .03);
        ng.gain.setTargetAtTime(.1, t, .03);
        vd.gain.setValueAtTime(0, t);
        if (d > beat * .9) vd.gain.setTargetAtTime(f * .009, t + .22, .14);
        if (d > beat * .7) v.gain.setTargetAtTime(swell * .62, t + d * .62, d * .3);
        t += d;
      });
      v.gain.setTargetAtTime(0, t - .3, .12);
      o.start(start); vib.start(start); n.start(start, Math.random());
      o.stop(t + .6); vib.stop(t + .6); n.stop(t + .6);
      return t;
    };
    const pluck = (t, f, vol) => {
      const o = actx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const o2 = actx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.003;
      const g2 = actx.createGain(); g2.gain.value = .3;
      const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2300, t); lp.frequency.exponentialRampToValueAtTime(600, t + .5);
      const v = actx.createGain();
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(vol, t + .006); v.gain.exponentialRampToValueAtTime(.0003, t + 1.5);
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(v); v.connect(bus); v.connect(room);
      o.start(t); o2.start(t); o.stop(t + 1.55); o2.stop(t + 1.55);
    };
    const hit = (t, freq, q, dur, vol, type) => {
      const s = actx.createBufferSource(); s.buffer = noise; s.loop = true;
      const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const v = actx.createGain();
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(vol, t + .012); v.gain.exponentialRampToValueAtTime(.0002, t + dur);
      s.connect(f); f.connect(v); v.connect(bus); s.start(t, Math.random()); s.stop(t + dur + .05);
    };
    const kick = (t, vol) => {
      const o = actx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(48, t + .13);
      const v = actx.createGain();
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(vol, t + .012); v.gain.exponentialRampToValueAtTime(.0002, t + .3);
      o.connect(v); v.connect(bus); o.start(t); o.stop(t + .34);
    };
    // One time through: sixteen bars. Returns when it ends.
    function play(start) {
      const end = whistleAt(start);
      BARS.forEach((ch, bar) => {
        const b0 = start + bar * 4 * beat;
        PICK.forEach((str, i) => {
          // Very slightly behind and uneven, because a person is playing it.
          const swing = i % 2 ? beat * .07 : 0, jit = (bar * 7 + i * 13) % 5 * .0022;
          pluck(b0 + i * beat / 2 + swing + jit, hz(ch[str]), (i === 0 ? .1 : .058) * (1 - (i % 4) * .05));
        });
        // Really, really soft: a felted kick, brushes on two and four, and a shaker you'd miss if it stopped.
        kick(b0, .085); kick(b0 + beat * 2.5, .05);
        for (const k of [1, 3]) hit(b0 + k * beat, 2300, .6, .17, .02, 'bandpass');
        for (let e = 0; e < 8; e++) hit(b0 + e * beat / 2 + (e % 2 ? beat * .07 : 0), 6200, 1.2, .05, e % 2 ? .0048 : .0075, 'bandpass');
      });
      return end;
    }
    return { play, bus, length: BARS.length * 4 * beat };
  }
  let menu = null;
  // Sound can't begin until the person clicks or presses something. The song is laid out and waits at the start;
  // the first thing they do sets it going. On some browsers it just plays, if they've let this page make sound before.
  function startMenuSong() {
    start();
    if (!ctx || menu) return;
    if (humGain) humGain.gain.value = 0;
    const out = ctx.createGain(); out.gain.value = 0; out.connect(master);
    const tune = buildTune(ctx, out, noiseBuf);
    menu = { out, tune, next: 0, timer: null };
    const line = () => {
      if (!menu || ctx.state !== 'running') return;
      // Only begin counting once the sound is really running.
      if (!menu.next) { menu.next = ctx.currentTime + .25; out.gain.setValueAtTime(0, ctx.currentTime); out.gain.linearRampToValueAtTime(.8, ctx.currentTime + 1.6); }
      if (menu.next - ctx.currentTime < 5) { tune.play(menu.next); menu.next += tune.length + 60 / BPM * 2; }
    };
    menu.timer = setInterval(line, 400);
    const wake = () => { if (ctx.state !== 'running') ctx.resume(); };
    menu.wake = wake;
    addEventListener('pointerdown', wake); addEventListener('keydown', wake);
    wake();
  }
  function stopMenuSong(secs = 4) {
    if (!menu) return;
    const m = menu; menu = null;
    clearInterval(m.timer);
    removeEventListener('pointerdown', m.wake); removeEventListener('keydown', m.wake);
    if (ctx.state !== 'running') ctx.resume();
    const t = ctx.currentTime;
    m.out.gain.cancelScheduledValues(t);
    m.out.gain.setValueAtTime(m.out.gain.value, t);
    m.out.gain.linearRampToValueAtTime(0, t + secs);
    setTimeout(() => m.out.disconnect(), secs * 1000 + 300);
    if (humGain) humGain.gain.setTargetAtTime(.05, t + secs * .5, 1);
  }

  // ---- What the house hears ----
  // The family, the way you'd hear them through a wall: no words, just the tune of the sentence and the shape of its vowels.
  // It follows the actual text, so the same line always sounds the same. As the house learns, the wall gets thinner.
  const MUMBLE_V = { a: [730, 1090], e: [530, 1840], i: [300, 2200], o: [570, 840], u: [440, 1020], y: [300, 2200] };
  function renderMumble(actx, when, text, who, secs, clear, dest, noise) {
    const words = text.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const syl = [];
    let seed = 7;
    words.forEach((w, wi) => {
      const groups = w.match(/[aeiouy]+/g) || ['u'];
      groups.forEach((g, i) => { for (const ch of g) seed = (seed * 31 + ch.charCodeAt(0)) % 9973; syl.push({ v: g[0], first: i === 0, last: i === groups.length - 1, lastWord: wi === words.length - 1, r: seed / 9973 }); });
    });
    const unit = Math.min(.24, secs / (syl.length + words.length * .35)) / (who.rate || 1);
    const near = who.near ? 1 : 0, open = Math.min(1, clear + near * .2);
    const o = actx.createOscillator(); o.type = 'sawtooth';
    const v = actx.createGain(); v.gain.value = 0;
    const f1 = actx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5;
    const f2 = actx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 7;
    const g2 = actx.createGain(); g2.gain.value = .25 + open * .75;
    o.connect(f1); o.connect(f2); f2.connect(g2); f1.connect(v); g2.connect(v);
    // The wall: it takes the top off, and a little of it comes back off the far side of the room.
    const wall = actx.createBiquadFilter(); wall.type = 'lowpass'; wall.Q.value = .8; wall.frequency.value = 480 + open * open * 2600;
    const room = actx.createDelay(.2); room.delayTime.value = .045 + (1 - open) * .05;
    const roomG = actx.createGain(); roomG.gain.value = .32 * (1 - open * .6);
    const level = actx.createGain(); level.gain.value = (.34 + open * .5);
    v.connect(wall); wall.connect(level); wall.connect(room); room.connect(roomG); roomG.connect(level); level.connect(dest);
    let ticks = null;
    if (noise) {
      ticks = actx.createBufferSource(); ticks.buffer = noise; ticks.loop = true;
      var tf = actx.createBiquadFilter(); tf.type = 'bandpass'; tf.frequency.value = 900 + open * 1800; tf.Q.value = 1.2;
      var tg = actx.createGain(); tg.gain.value = 0;
      ticks.connect(tf); tf.connect(tg); tg.connect(wall);
    }
    const q = /\?\s*$/.test(text), ex = /!\s*$/.test(text), n = syl.length;
    let t = when;
    o.frequency.setValueAtTime(who.pitch, t);
    syl.forEach((s, i) => {
      const k = i / Math.max(1, n - 1), dur = unit * (s.last ? 1.25 : .85) * (s.lastWord && s.last ? 1.5 : 1);
      // Sentences fall, questions lift at the end, and nobody is ever quite on the note twice.
      let p = who.pitch * (1.08 - k * .24) * (.93 + s.r * .16);
      if (q && k > .7) p = who.pitch * (1 + (k - .7) * 1.5);
      if (ex && i < 2) p *= 1.18;
      const F = MUMBLE_V[s.v] || MUMBLE_V.u, fm = who.fm || 1;
      o.frequency.linearRampToValueAtTime(p, t + dur * .6);
      f1.frequency.setTargetAtTime(F[0] * fm, t, .03); f2.frequency.setTargetAtTime(F[1] * fm, t, .03);
      if (s.first && tg) { tg.gain.setValueAtTime(.16 + open * .3, t); tg.gain.setTargetAtTime(0, t + .012, .012); }
      v.gain.setTargetAtTime(.8, t, .018);
      v.gain.setTargetAtTime(.16, t + dur * .72, .022);
      t += dur;
      if (s.last) { v.gain.setTargetAtTime(.02, t, .02); t += unit * .35; }
    });
    v.gain.setTargetAtTime(0, t, .03);
    const end = t + .3;
    o.start(when); o.stop(end);
    if (ticks) { ticks.start(when, Math.random()); ticks.stop(end); }
    return end - when;
  }
  function mumble(text, who, secs, clear) {
    if (!ctx) return;
    if (!voiceNoise) voiceNoise = makeNoise(ctx.sampleRate);
    renderMumble(ctx, ctx.currentTime + .02, text, who, secs, clear, master, voiceNoise);
  }

  // ---- The voice you play ----
  // Letters are mouth shapes. Hold a key and the sound holds. Works on any audio context, so it can be tested silently.
  const LETTERS = {
    a: { f: [730, 1090, 2440], v: 1 }, e: { f: [530, 1840, 2480], v: 1 }, i: { f: [290, 2250, 2950], v: 1 }, o: { f: [520, 820, 2400], v: 1 }, u: { f: [310, 870, 2240], v: 1 },
    y: { f: [280, 2200, 2900], v: .9 }, w: { f: [300, 610, 2200], v: .9 }, r: { f: [420, 1300, 1600], v: .85 }, l: { f: [360, 1300, 2700], v: .8 },
    m: { f: [280, 1000, 2200], v: .5 }, n: { f: [280, 1700, 2600], v: .5 },
    s: { n: .8, fc: 5600 }, z: { n: .55, fc: 5200, v: .35 }, f: { n: .4, fc: 4400 }, v: { n: .25, fc: 3800, v: .5 }, h: { n: .3, fc: 1500 }, j: { n: .6, fc: 2900, v: .3 },
    p: { burst: 900 }, b: { burst: 900, v: .2 }, t: { burst: 4200 }, d: { burst: 3800, v: .2 }, k: { burst: 2100 }, c: { burst: 2100 }, q: { burst: 2100 }, g: { burst: 1900, v: .2 }, x: { burst: 2100, then: 's' },
  };
  function buildLiveVoice(actx, dest, noise) {
    const o = actx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 188;
    const voiceG = actx.createGain(); voiceG.gain.value = 0;
    const filters = [[9, 1], [11, .55], [14, .32]].map(([q, g], i) => {
      const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.value = [500, 1500, 2500][i];
      const gain = actx.createGain(); gain.gain.value = g * 2.4;
      o.connect(f); f.connect(gain); gain.connect(voiceG);
      return f;
    });
    const n = actx.createBufferSource(); n.buffer = noise; n.loop = true;
    const nf = actx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 1.6; nf.frequency.value = 3000;
    const noiseG = actx.createGain(); noiseG.gain.value = 0;
    n.connect(nf); nf.connect(noiseG);
    const mix = actx.createGain(); voiceG.connect(mix); noiseG.connect(mix);
    // A second, detuned source for anything with two sheets of metal in it, and an octave down for anything heavy.
    const o2 = actx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 188;
    const o2G = actx.createGain(); o2G.gain.value = 0; o2.connect(o2G);
    filters.forEach(f => o2G.connect(f));
    const sub = actx.createOscillator(); sub.type = 'triangle'; sub.frequency.value = 94;
    const subG = actx.createGain(); subG.gain.value = 0; const subLevel = actx.createGain(); subLevel.gain.value = 0;
    sub.connect(subLevel); subLevel.connect(subG); subG.connect(mix);
    // Overdrive, for the telephone and the radio and anything else that was never meant to carry this.
    const shaper = actx.createWaveShaper();
    const driveCurve = new Float32Array(257);
    for (let i = 0; i < 257; i++) { const x = i / 128 - 1; driveCurve[i] = Math.tanh(x * 3) / Math.tanh(3); }
    shaper.curve = driveCurve;
    const driveIn = actx.createGain(); driveIn.gain.value = .04;
    const driveOut = actx.createGain(); driveOut.gain.value = 1 / (.04 * 3 / Math.tanh(3));
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 170;
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6800;
    const peak = actx.createBiquadFilter(); peak.type = 'peaking'; peak.frequency.value = 1450; peak.Q.value = 1.8; peak.gain.value = 5;
    mix.connect(driveIn); driveIn.connect(shaper); shaper.connect(driveOut); driveOut.connect(hp); hp.connect(peak); peak.connect(lp);
    const comb = actx.createDelay(.05); comb.delayTime.value = .0074;
    const fb = actx.createGain(); fb.gain.value = .42;
    const wet = actx.createGain(); wet.gain.value = .38;
    lp.connect(comb); comb.connect(fb); fb.connect(comb); comb.connect(wet);
    // How much room there is behind the thing: nothing for a sofa, a long way for a garage door.
    const echo = actx.createDelay(.8); echo.delayTime.value = .19;
    const echoFb = actx.createGain(); echoFb.gain.value = 0; const echoG = actx.createGain(); echoG.gain.value = 0;
    lp.connect(echo); echo.connect(echoFb); echoFb.connect(echo); echo.connect(echoG);
    const comp = actx.createDynamicsCompressor();
    comp.threshold.value = -30; comp.knee.value = 12; comp.ratio.value = 8; comp.attack.value = .004; comp.release.value = .12;
    // Chop: a light buzzing, a sloshing dishwasher, a radiator ticking over.
    const chop = actx.createGain(); chop.gain.value = 1;
    const chopO = actx.createOscillator(); chopO.frequency.value = 5;
    const chopD = actx.createGain(); chopD.gain.value = 0; chopO.connect(chopD); chopD.connect(chop.gain);
    const out = actx.createGain(); out.gain.value = 1.4;
    lp.connect(comp); wet.connect(comp); echoG.connect(comp); comp.connect(chop); chop.connect(out); out.connect(dest);
    const lfo = actx.createOscillator(); lfo.frequency.value = 29;
    const lfoG = actx.createGain(); lfoG.gain.value = 3;
    lfo.connect(lfoG); lfoG.connect(o.frequency); lfoG.connect(o2.frequency);
    // A slow lean in the pitch, like a hinge.
    const slow = actx.createOscillator(); slow.frequency.value = 1.3;
    const slowG = actx.createGain(); slowG.gain.value = 0; slow.connect(slowG); slowG.connect(o.frequency); slowG.connect(o2.frequency);
    o.start(); o2.start(); sub.start(); n.start(); lfo.start(); chopO.start(); slow.start();

    // The thing itself, under the voice: its hum or its hiss while it's talking, and its own little noises as the sounds go by.
    // This is what makes it a radiator. It goes around the voice's filters, so the words stay words.
    const bodyOut = actx.createGain(); bodyOut.connect(dest);
    const bodyG = actx.createGain(); bodyG.gain.value = 0; bodyG.connect(bodyOut);
    const wobG = actx.createGain(); wobG.connect(bodyG);
    const humO = actx.createOscillator(), humLP = actx.createBiquadFilter(), humL = actx.createGain(); humLP.type = 'lowpass'; humL.gain.value = 0;
    humO.connect(humLP); humLP.connect(humL); humL.connect(wobG);
    const hum2O = actx.createOscillator(), hum2L = actx.createGain(); hum2L.gain.value = 0; hum2O.connect(hum2L); hum2L.connect(wobG);
    const bodyN = actx.createBufferSource(); bodyN.buffer = noise; bodyN.loop = true;
    const bodyF = actx.createBiquadFilter(), bodyNL = actx.createGain(); bodyNL.gain.value = 0; bodyN.connect(bodyF); bodyF.connect(bodyNL); bodyNL.connect(wobG);
    const wobO = actx.createOscillator(), wobD = actx.createGain(); wobD.gain.value = 0; wobO.connect(wobD); wobD.connect(wobG.gain);
    humO.start(); hum2O.start(); bodyN.start(); wobO.start();
    const ping = (t, f, dur, vol, type = 'sine', to = 0) => {
      const a = actx.createOscillator(), g = actx.createGain(); a.type = type;
      a.frequency.setValueAtTime(f, t); if (to) a.frequency.exponentialRampToValueAtTime(to, t + dur * .7);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0004, t + dur);
      a.connect(g); g.connect(bodyOut); a.start(t); a.stop(t + dur + .02);
    };
    const hit = (t, f, q, dur, vol, type = 'bandpass', rise = .002) => {
      const s = actx.createBufferSource(), b = actx.createBiquadFilter(), g = actx.createGain();
      s.buffer = noise; b.type = type; b.frequency.value = f; b.Q.value = q;
      g.gain.setValueAtTime(.0004, t); g.gain.linearRampToValueAtTime(vol, t + rise); g.gain.exponentialRampToValueAtTime(.0004, t + rise + dur);
      s.connect(b); b.connect(g); g.connect(bodyOut); s.start(t, Math.random() * 1.2); s.stop(t + rise + dur + .02);
    };
    const r01 = () => Math.random();
    const TICS = {
      relay(t, v) { hit(t, 1400, 4, .015, v); ping(t, 95, .09, v * .7); },                                                   // a fridge cutting in
      click(t, v) { [0, .08, .14].forEach(d => hit(t + d, 3800, 3, .012, v)); },                                             // a stove trying to light
      drip(t, v) { ping(t, 850, .06, v, 'sine', 1700); if (r01() < .4) ping(t + .1, 1150, .05, v * .5, 'sine', 2100); },
      slosh(t, v) { hit(t, 750, 1.2, .2, v, 'bandpass', .05); hit(t + .08, 1500, 2, .1, v * .4); },
      clank(t, v) { ping(t, 410, .16, v); ping(t, 1130, .11, v * .6); ping(t, 2370, .07, v * .35); hit(t, 130, 2, .08, v * .9, 'lowpass'); },
      bell(t, v) { [0, .05, .1, .15].forEach(d => { ping(t + d, 1250, .05, v); ping(t + d, 1480, .05, v); }); },
      snap(t, v) { hit(t, 6000, 2, .01, v); ping(t, 120, .05, v * .5, 'square'); },                                          // a filament, thinking about it
      creak(t, v) { groanInto(actx, bodyOut, t, .34 + r01() * .16, v); },
      rattle(t, v) { for (let i = 0; i < 5; i++) hit(t + i * .045, 1200 + r01() * 2300, 6, .02, v * (.5 + r01() * .5)); },
      rustle(t, v) { for (let i = 0; i < 4; i++) hit(t + i * (.025 + r01() * .03), 2600 + r01() * 2600, 1.5, .03, v * (.4 + r01() * .6)); },
      spring(t, v) { ping(t, 320, .28, v, 'triangle', 300); ping(t, 327, .24, v * .7, 'triangle', 305); },
      thump(t, v) { ping(t, 95, .12, v, 'sine', 55); hit(t, 220, 1.5, .04, v * .5, 'lowpass'); },
      wood(t, v) { ping(t, 430, .05, v, 'triangle'); ping(t, 880, .03, v * .5, 'triangle'); },
      tin(t, v) { ping(t, 520, .14, v, 'sine', 680); ping(t, 1020, .1, v * .5); ping(t, 1710, .07, v * .3); },
      pop(t, v) { const n = 1 + (r01() * 3 | 0); for (let i = 0; i < n; i++) hit(t + r01() * .08, 2500, .7, .008, v); },
    };
    // Filtered noise comes out much quieter than a tone at the same level. These bring each kind up to about the same loudness.
    const TIC_TRIM = { relay: 2, click: 4, drip: 2.5, slosh: 4, clank: 1.1, bell: 2, snap: 4, creak: 8, rattle: 11, rustle: 8, spring: 2, thump: 2, wood: 2.5, tin: 3, pop: 6 };
    const NOISE_TRIM = 3;
    let bodyC = null, bodyOn = false, ticN = 0, ticAt = -1;
    function bodyHit() {
      if (!bodyC) return;
      const t = actx.currentTime;
      if (!bodyOn) {
        bodyOn = true; ticN = 0;
        bodyG.gain.cancelScheduledValues(t); bodyG.gain.setTargetAtTime(1, t, .05);
        // Things that build up while they're going, like a kettle.
        if (bodyC.rise && bodyC.hum) { humO.frequency.cancelScheduledValues(t); humO.frequency.setValueAtTime(bodyC.hum[0], t); humO.frequency.exponentialRampToValueAtTime(bodyC.hum[0] * bodyC.rise[0], t + bodyC.rise[1]); }
      }
      const k = bodyC.tic;
      if (k && t - ticAt > .16 && ticN++ % k[1] === 0) { ticAt = t; TICS[k[0]](t, k[2] * TIC_TRIM[k[0]]); }
    }
    function bodyOff() { if (!bodyOn) return; bodyOn = false; const t = actx.currentTime; bodyG.gain.cancelScheduledValues(t); bodyG.gain.setTargetAtTime(0, t, .1); }
    function bodySet(c) {
      bodyC = c || null; bodyOn = false;
      const b = c || {}, h = b.hum, h2 = b.hum2, nz = b.noise, w = b.wob;
      humL.gain.value = h ? h[1] : 0; if (h) { humO.frequency.value = h[0]; humO.type = h[2] || 'sawtooth'; humLP.frequency.value = h[3] || 500; }
      hum2L.gain.value = h2 ? h2[1] : 0; if (h2) hum2O.frequency.value = h2[0];
      bodyNL.gain.value = nz ? nz[2] * NOISE_TRIM : 0; if (nz) { bodyF.frequency.value = nz[0]; bodyF.Q.value = nz[1]; bodyF.type = nz[3] || 'bandpass'; }
      wobD.gain.value = w ? w[1] : 0; wobO.frequency.value = w ? w[0] : 1;
      bodyG.gain.cancelScheduledValues(actx.currentTime); bodyG.gain.value = 0;
    }

    let center = 188, wander = .26, base = 188, bend = 1, cur = null, fm = 1, hiss = 0, hissF = 3000, scoop = 1, glide = .03, voiced = 1;
    // How far along the house is: 0 can hardly speak, 1 has it. Quieter and duller at the start, with the vowels all running together.
    let age = 1, lastC = null, curPhone = null, phoneV = 0, phoneN = 0;
    // How much air is left. Over about a third of a breath it changes nothing; under that the voice drains out and the wheeze comes up.
    let airV = 1;
    const airK = () => Math.min(1, airV / .35);
    const voicedNow = () => { const k = airK(); return voiced * (k <= 0 ? 0 : .12 + .88 * k); };
    const wheeze = () => hiss + (1 - airK()) * .42;
    const shape = i => { const mid = [520, 1400, 2500][i], a = mushed ? 0 : age; return f => mid + (f - mid) * ((mushed ? .25 : .3) + a * .7); };
    // A word it doesn't have comes out as a smear. A word it does comes out at the pitch of whoever it heard it from.
    let mushed = false, borrowed = null, lpNormal = 6800, outNormal = 1.4;
    const applyMush = () => { lp.frequency.value = mushed ? Math.min(lpNormal, 1300) : lpNormal; out.gain.value = outNormal * (mushed ? .85 : 1); };
    const setPitch = () => {
      const t = actx.currentTime, f = base * bend;
      o.frequency.setTargetAtTime(f, t, glide); o2.frequency.setTargetAtTime(f, t, glide); sub.frequency.setTargetAtTime(f / 2, t, glide);
    };
    const silence = t => { voiceG.gain.setTargetAtTime(0, t, .02); noiseG.gain.setTargetAtTime(0, t, .012); subG.gain.setTargetAtTime(0, t, .03); };
    function sound(letter) {
      const L = LETTERS[letter], t = actx.currentTime;
      if (!L) return false;
      cur = letter;
      subG.gain.setTargetAtTime(L.n && !L.v ? 0 : 1, t, .02);
      if (L.f) filters.forEach((f, i) => f.frequency.setTargetAtTime(shape(i)(L.f[i]) * fm, t, .022));
      if (L.burst) {
        // A stop is a closure and a pop, then a small "uh" if you keep leaning on it.
        voiceG.gain.cancelScheduledValues(t); noiseG.gain.cancelScheduledValues(t);
        voiceG.gain.setValueAtTime(L.v ? .1 : .001, t);
        nf.frequency.setValueAtTime(L.burst, t + .04);
        noiseG.gain.setValueAtTime(.001, t);
        noiseG.gain.setValueAtTime(.75, t + .04);
        noiseG.gain.setTargetAtTime(.02, t + .05, .02);
        filters.forEach((f, i) => f.frequency.setTargetAtTime([560, 1300, 2400][i] * fm, t + .05, .03));
        voiceG.gain.setTargetAtTime(.34 * voicedNow(), t + .075, .03);
      } else {
        voiceG.gain.cancelScheduledValues(t); noiseG.gain.cancelScheduledValues(t);
        voiceG.gain.setTargetAtTime((L.v || 0) * .6 * voicedNow(), t, .018);
        noiseG.gain.setTargetAtTime(Math.max((L.n || 0) * .85, wheeze()), t, .012);
        nf.frequency.setValueAtTime(L.fc || (airK() < 1 ? 1500 : hissF), t);
      }
      return true;
    }
    return {
      press(letter) {
        if (!LETTERS[letter]) return false;
        curPhone = null;
        // Every new sound lands at a slightly different pitch. It never quite holds a tune.
        const w0 = wander + (1 - age) * .22, mid = borrowed ? Math.pow(center, .35) * Math.pow(borrowed, .65) : center;
        base = mid * (1 - w0 / 2 + Math.random() * w0);
        if (scoop !== 1) { const t = actx.currentTime, f = base * bend * scoop; o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f, t); }
        setPitch();
        bodyHit();
        sound(letter);
        if (LETTERS[letter].then) setTimeout(() => { if (cur === letter) sound(LETTERS[letter].then); }, 90);
        return true;
      },
      release() { cur = null; curPhone = null; silence(actx.currentTime); bodyOff(); },
      bend(v) { bend = v; setPitch(); },
      // Who is talking: how high, how buzzy, how tinny, how much it shakes.
      stage(v) { age = v; if (lastC) this.character(lastC); },
      // Speech sounds rather than letters, for when the voice should actually say a word. "next" is the vowel a consonant runs into.
      // "airK" scales how much hiss a fricative gets: 1 is a normal S, lower is a softer one.
      phone(p, next, airK2) {
        const t = actx.currentTime;
        // Still never quite the same note twice, but steadier than letters: this is meant to pass for talking.
        const w0 = (wander + (1 - age) * .22) * .4, mid = borrowed ? Math.pow(center, .35) * Math.pow(borrowed, .65) : center;
        base = mid * (1 - w0 / 2 + Math.random() * w0);
        setPitch();
        bodyHit();
        voiceG.gain.cancelScheduledValues(t); noiseG.gain.cancelScheduledValues(t);
        filters.forEach(f => f.frequency.cancelScheduledValues(t));
        subG.gain.setTargetAtTime(1, t, .02);
        // Everything that makes each object itself still applies: its mouth size, how much voice it has, its air, how far along the house is.
        const toF = (F, at, tc) => filters.forEach((f, i) => f.frequency.setTargetAtTime(shape(i)(F[i]) * fm, at, tc));
        const voice = v => { phoneV = v; return v * voicedNow(); };
        const hissNow = () => Math.max(wheeze(), 0);
        cur = null; curPhone = p;
        if (VOWELS[p]) {
          const v = VOWELS[p];
          toF(v.f, t, .03);
          phoneN = 0;
          voiceG.gain.setTargetAtTime(voice(.6), t, .02);
          noiseG.gain.setTargetAtTime(hissNow(), t, .02);
          nf.frequency.setValueAtTime(airK() < 1 ? 1500 : hissF, t);
          if (v.to) toF(v.to, t + .14, .12);
        } else if (SONORANT[p]) {
          const s = SONORANT[p];
          toF([s[0], s[1], s[2]], t, .03);
          phoneN = 0;
          voiceG.gain.setTargetAtTime(voice(.6 * s[4] * 1.3), t, .025);
          noiseG.gain.setTargetAtTime(hissNow(), t, .02);
        } else if (FRIC[p]) {
          const s = FRIC[p];
          nf.frequency.setValueAtTime(s[1], t);
          phoneN = s[2] * .85 * (airK2 === undefined ? 1 : airK2);
          voiceG.gain.setTargetAtTime(voice(.6 * s[3]), t, .02);
          noiseG.gain.setTargetAtTime(Math.max(phoneN, hissNow()), t, .015);
        } else if (STOP[p]) {
          // Close, pop, and open out into whatever comes next. Or, at the end of a word, just the pop and a breath of voice.
          const s = STOP[p], after = next && VOWELS[next] ? VOWELS[next].f : null;
          phoneN = 0;
          voiceG.gain.setValueAtTime(s[5] ? .08 : .001, t);
          noiseG.gain.setValueAtTime(.001, t);
          nf.frequency.setValueAtTime(s[2], t + .04);
          noiseG.gain.setValueAtTime(s[3] * 1.25, t + .04);
          noiseG.gain.setTargetAtTime(.005, t + .055, .018);
          if (after) { toF(after, t + .04, .03); voiceG.gain.setTargetAtTime(voice(.6), t + .06, .025); }
          else voiceG.gain.setTargetAtTime(voice(.14), t + .06, .02);
        }
      },
      // This key adds no sound of its own. Whatever's sounding keeps going.
      sustain() {},
      borrow(p) { borrowed = p || null; },
      mush(v) { if (mushed !== !!v) { mushed = !!v; applyMush(); } },
      air(v) {
        airV = v;
        // Holding a sound while the air runs out: it drains away under your finger.
        if (curPhone) {
          const t = actx.currentTime;
          voiceG.gain.setTargetAtTime(phoneV * voicedNow(), t, .05);
          noiseG.gain.setTargetAtTime(Math.max(phoneN, wheeze()), t, .05);
        }
        const L = cur && LETTERS[cur];
        if (L && !L.burst) {
          const t = actx.currentTime;
          voiceG.gain.setTargetAtTime((L.v || 0) * .6 * voicedNow(), t, .05);
          noiseG.gain.setTargetAtTime(Math.max((L.n || 0) * .85, wheeze()), t, .05);
        }
      },
      character(c) {
        lastC = c;
        bodySet(c.body);
        center = c.pitch; wander = c.wander === undefined ? .26 : c.wander;
        o.type = c.wave || 'sawtooth';
        comb.delayTime.value = c.comb || .0074;
        fb.gain.value = c.ring === undefined ? .42 : c.ring;
        lfo.frequency.value = c.shakeRate || 29;
        lfoG.gain.value = c.shake === undefined ? 3 : c.shake;
        // What the thing is made of. Anything left out stays as it always was.
        fm = c.fm || 1;                                     // mouth size: below 1 is a big cavity, above is a small one
        hp.frequency.value = c.hp || 170;
        lpNormal = Math.min(c.lp || 6800, 1100 + age * age * 5700);
        peak.frequency.value = c.peakF || 1450; peak.gain.value = c.peak === undefined ? 5 : c.peak;
        hiss = c.hiss || 0; hissF = c.hissF || 3000;        // air leaking through the voice
        voiced = c.voiced === undefined ? 1 : c.voiced;     // how much actual voice there is
        scoop = c.scoop || 1;                               // each sound starts this far off the note and slides on
        glide = c.glide || .03;
        o2G.gain.value = c.double || 0; o2.detune.value = c.detune || 0; o2.type = c.wave || 'sawtooth';
        subLevel.gain.value = c.sub || 0;
        chopO.type = c.chopWave || 'sine'; chopO.frequency.value = c.chopRate || 5;
        const cd = c.chop || 0; chop.gain.value = 1 - cd / 2; chopD.gain.value = cd / 2;
        slow.frequency.value = c.leanRate || 1.3; slowG.gain.value = c.lean || 0;
        echo.delayTime.value = c.echoT || .19; echoG.gain.value = c.echo || 0; echoFb.gain.value = c.echoFb || 0;
        outNormal = 1.4 * (c.gain || 1) * (.32 + age * .68);
        applyMush();
        // The curve never changes (a browser may only let it be set once). How hard the sound hits it does.
        const hit = c.drive ? Math.min(1.2, c.drive / 3) : .04;
        driveIn.gain.value = hit; driveOut.gain.value = c.drive ? 1 / Math.max(.45, hit) : 1 / (hit * 3 / Math.tanh(3));
        setPitch();
      },
    };
  }
  let live = null;
  function liveVoice() {
    if (!ctx) return null;
    if (!live) live = buildLiveVoice(ctx, master, makeNoise(ctx.sampleRate));
    return live;
  }

  function setHeart(level) { heartLevel = level; }

  // Faint, tinny hold music. It never quite resolves and it never stops being nice.
  let muzakOn = false, muzakT = 1, muzakI = 0;
  function setMuzak(v) { muzakOn = v; }
  const MUZAK = [[392, 494, 587], [440, 523, 659], [349, 440, 523], [392, 494, 659]];
  function muzakTick(dt) {
    if (!muzakOn) return;
    muzakT -= dt;
    if (muzakT > 0) return;
    muzakT = 2.3;
    const chord = MUZAK[muzakI++ % MUZAK.length];
    chord.forEach((f, i) => {
      tone(f * (1 + Math.random() * .004), 1.5, .007, 'triangle', i * .18);
      tone(f * 2, .45, .002, 'square', i * .18);
    });
  }

  function tick(dt) {
    if (!ctx) return;
    muzakTick(dt);
    // Attention is a kitchen timer, not a heartbeat. It speeds up as they notice you.
    if (heartLevel > .08) {
      heartTimer -= dt;
      if (heartTimer <= 0) {
        heartTimer = .95 - heartLevel * .68;
        tone(1750, .03, .02 + heartLevel * .055, 'square');
      }
    }
    creakTimer -= dt;
    if (creakTimer <= 0) {
      creakTimer = 9 + Math.random() * 22;
      const r = Math.random();
      if (r < .55) fx.creak(); else if (r < .85) fx.pipe(); else fx.settle();
    }
  }

  // The one piece of music in the game. Plays once, in the last ending.
  function piano() {
    if (!ctx) return;
    const N = { e3: 164.8, g3: 196, a3: 220, c4: 261.6, d4: 293.7, e4: 329.6, g4: 392, a4: 440 };
    const seq = [['c4', 0], ['e4', 1.1], ['g4', 2.2], ['e4', 3.3], ['a3', 4.4], ['c4', 5.5], ['e4', 6.6], ['c4', 7.7], ['g3', 8.8], ['d4', 9.9], ['g4', 11], ['d4', 12.1], ['c4', 13.2], ['e4', 14.3], ['a4', 15.8], ['g4', 18.2]];
    for (const [k, t] of seq) {
      tone(N[k], 3.2, .09, 'sine', t); tone(N[k] * 2, 1.6, .025, 'sine', t); tone(N[k] * 3, .7, .008, 'sine', t);
    }
  }

  function setHum(v) { if (humGain) humGain.gain.linearRampToValueAtTime(v, ctx.currentTime + .8); }

  return { groanInto, startMenuSong, stopMenuSong, buildTune, mumble, renderMumble, start, fx, babble, speak, renderToBuffer, planVoice, liveVoice, buildLiveVoice, makeNoise, setHeart, setMuzak, tick, piano, setHum };
})();
