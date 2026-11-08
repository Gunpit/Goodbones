// What hangs on the walls. Each picture is drawn once onto a canvas and used as a texture in the baked rooms.
// Two of them come off the title screen itself: the fireman fork painting and the photograph of the house.
// One is the visitor, from art/visitor.webp, hung as a family portrait as though he had always been one of them.
const Pictures = (() => {
  const cache = {};
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // The visitor's picture loads before any room is baked. Boot waits for this.
  const visitor = new Image();
  const ready = new Promise(res => { visitor.onload = res; visitor.onerror = res; });
  visitor.src = 'art/visitor.webp';

  // ---- Helpers ----
  // Oil paint, more or less: warm varnish, canvas weave, and the corners falling into shadow.
  function varnish(g, w, h, dark = .5) {
    g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(210,160,90,.3)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,.03)'; for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
    const v = g.createRadialGradient(w * .5, h * .45, Math.min(w, h) * .3, w * .5, h * .5, Math.max(w, h) * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(6,3,0,${dark})`);
    g.fillStyle = v; g.fillRect(0, 0, w, h);
  }
  // Short brush dabs of one colour over an area, so a flat shape reads as painted.
  function dabs(g, x, y, w, h, color, n, size, alpha = .18) {
    g.fillStyle = color;
    for (let i = 0; i < n; i++) {
      g.globalAlpha = alpha * (.5 + rnd());
      g.beginPath(); g.ellipse(x + rnd() * w, y + rnd() * h, size * (.6 + rnd()), size * (.25 + rnd() * .3), rnd() * 3, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }
  // Crayon: a wobbly line gone over a few times, never quite in the same place.
  function crayon(g, pts, color, width = 4, passes = 3, closed = false) {
    g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let p = 0; p < passes; p++) {
      g.globalAlpha = .55 + rnd() * .3; g.lineWidth = width * (.7 + rnd() * .5);
      g.beginPath();
      pts.forEach(([x, y], i) => { const jx = x + (rnd() - .5) * width * .9, jy = y + (rnd() - .5) * width * .9; i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); });
      if (closed) g.closePath();
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // Crayon fill: scribbled back and forth inside a box.
  function scribble(g, x, y, w, h, color, step = 5) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.strokeStyle = color; g.globalAlpha = .45; g.lineWidth = step * .9; g.lineCap = 'round';
    g.beginPath();
    for (let i = -h; i < w + h; i += step) { g.moveTo(x + i + rnd() * 3, y - 2); g.lineTo(x + i - h + rnd() * 3, y + h + 2); }
    g.stroke(); g.restore(); g.globalAlpha = 1;
  }
  function paper(g, w, h, tone = '#f5f0e2') {
    g.fillStyle = tone; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,100,60,${rnd() * .05})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  }
  const stick = (g, x, y, s, color, hair) => {
    crayon(g, circle(x, y, s * .5), color, 3, 2, true);
    crayon(g, [[x, y + s * .5], [x, y + s * 1.9]], color, 3, 2);
    crayon(g, [[x - s * .8, y + s * 1.0], [x, y + s * .9], [x + s * .8, y + s * 1.0]], color, 3, 2);
    crayon(g, [[x - s * .6, y + s * 2.9], [x, y + s * 1.9], [x + s * .6, y + s * 2.9]], color, 3, 2);
    if (hair) crayon(g, [[x - s * .5, y - s * .1], [x - s * .3, y - s * .6], [x + s * .3, y - s * .6], [x + s * .5, y - s * .1]], hair, 4, 2);
  };
  const circle = (x, y, r, n = 14) => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos(i / n * 6.283) * r, y + Math.sin(i / n * 6.283) * r]);
  function houseFace(g, x, y, s, arms) {
    // Wren's house: a square with a roof, two windows for eyes and a door for a mouth. She always gives it a face.
    scribble(g, x, y, s, s, '#5a83c4', 6);
    crayon(g, [[x, y], [x + s, y], [x + s, y + s], [x, y + s]], '#2f4f86', 4, 3, true);
    scribble(g, x - s * .1, y - s * .55, s * 1.2, s * .55, '#c8402e', 6);
    crayon(g, [[x - s * .12, y], [x + s * .5, y - s * .58], [x + s * 1.12, y]], '#962a1c', 5, 3);
    for (const ex of [.27, .73]) { crayon(g, circle(x + s * ex, y + s * .33, s * .11), '#222', 3, 2, true); g.fillStyle = '#222'; g.beginPath(); g.arc(x + s * ex + s * .02, y + s * .35, s * .045, 0, 7); g.fill(); }
    crayon(g, [[x + s * .3, y + s * .66], [x + s * .5, y + s * .78], [x + s * .7, y + s * .66]], '#222', 4, 2);
    if (arms) {
      crayon(g, [[x, y + s * .55], [x - s * .45, y + s * .45], [x - s * .62, y + s * .62]], '#8a5a2c', 6, 3);
      crayon(g, [[x + s, y + s * .55], [x + s * 1.45, y + s * .45], [x + s * 1.62, y + s * .62]], '#8a5a2c', 6, 3);
    }
  }
  const caps = (g, text, x, y, size, color) => {
    g.font = `bold ${size}px "Comic Sans MS", "Chalkboard", "Marker Felt", cursive`; g.fillStyle = color; g.textAlign = 'center';
    [...text].forEach((ch, i) => { g.save(); g.translate(x + (i - (text.length - 1) / 2) * size * .72, y + (rnd() - .5) * size * .2); g.rotate((rnd() - .5) * .3); g.fillText(ch, 0, 0); g.restore(); });
  };

  // ---- The pictures ----
  const DRAW = {
    // Off the title screen: the fireman fork, in its gilt frame.
    fork() {
      const c = canvas(680, 900), src = document.getElementById('titlefork');
      if (src && src.width) c.getContext('2d').drawImage(src, 0, 0, 680, 900);
      else if (window.ForkPortrait) ForkPortrait.paint(c);
      return c;
    },
    // Off the title screen: the photograph of them in front of the house, frame and brass plate and all.
    housephoto() {
      const c = canvas(1140, 702), src = document.getElementById('titlephoto'), g = c.getContext('2d');
      g.fillStyle = '#5a3a20'; g.fillRect(0, 0, 1140, 702);
      if (src && src.width) g.drawImage(src, 70, 9, 1140, 702, 0, 0, 1140, 702);
      return c;
    },
    // The visitor, painted as if he sat for it: a dark green study, a gilt rule, a little brass label. He has always been here.
    visitor() {
      const W = 420, H = 560, c = canvas(W, H), g = c.getContext('2d');
      const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#3e5341'); bg.addColorStop(1, '#1f2c22');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      dabs(g, 0, 0, W, H, '#5d7457', 260, 26, .12); dabs(g, 0, H * .55, W, H * .45, '#1a2219', 160, 30, .15);
      // A curtain on the left, the way portraits have.
      const cur = g.createLinearGradient(0, 0, W * .3, 0); cur.addColorStop(0, '#5b1d18'); cur.addColorStop(1, 'rgba(91,29,24,0)');
      g.fillStyle = cur; g.fillRect(0, 0, W * .3, H);
      if (visitor.complete && visitor.naturalWidth) {
        // Lift him off his white paper: flood out from the edges, so the white of his teeth stays.
        const s = 450 / visitor.naturalHeight, w = Math.round(visitor.naturalWidth * s), h = Math.round(visitor.naturalHeight * s);
        const t = canvas(w, h), tg = t.getContext('2d');
        tg.imageSmoothingEnabled = false; tg.drawImage(visitor, 0, 0, w, h);
        const d = tg.getImageData(0, 0, w, h), px = d.data, seen = new Uint8Array(w * h), q = [];
        const white = i => px[i * 4] > 225 && px[i * 4 + 1] > 225 && px[i * 4 + 2] > 225;
        for (let x = 0; x < w; x++) q.push(x, (h - 1) * w + x);
        for (let y = 0; y < h; y++) q.push(y * w, y * w + w - 1);
        while (q.length) {
          const i = q.pop();
          if (seen[i] || !white(i)) continue;
          seen[i] = 1; px[i * 4 + 3] = 0;
          const x = i % w;
          if (x > 0) q.push(i - 1); if (x < w - 1) q.push(i + 1); if (i >= w) q.push(i - w); if (i < w * (h - 1)) q.push(i + w);
        }
        tg.putImageData(d, 0, 0);
        // A soft shadow behind him, then him, a touch muted so he belongs to the same paint as the rest.
        g.save(); g.filter = 'blur(14px)'; g.globalAlpha = .45; g.drawImage(t, W * .5 - w / 2 + 14, H * .53 - h / 2 + 10, w, h); g.restore();
        g.save(); g.filter = 'saturate(.8) contrast(1.05)'; g.drawImage(t, W * .5 - w / 2, H * .53 - h / 2, w, h); g.restore();
      }
      varnish(g, W, H, .55);
      // Gilt frame and a brass label.
      const f = 26, gold = g.createLinearGradient(0, 0, W, H);
      gold.addColorStop(0, '#f2d576'); gold.addColorStop(.35, '#9c7428'); gold.addColorStop(.6, '#e8c562'); gold.addColorStop(1, '#8a6320');
      g.strokeStyle = gold; g.lineWidth = f; g.strokeRect(f / 2, f / 2, W - f, H - f);
      g.strokeStyle = 'rgba(60,35,5,.8)'; g.lineWidth = 2; g.strokeRect(f - 1, f - 1, W - 2 * f + 2, H - 2 * f + 2);
      g.fillStyle = '#c9a54e'; g.fillRect(W / 2 - 56, H - f - 30, 112, 20);
      g.fillStyle = '#4a3410'; g.font = 'italic 13px Georgia, serif'; g.textAlign = 'center'; g.fillText('Uncle', W / 2, H - f - 15);
      return c;
    },
    // Marion's mother. Somebody paid for this, a long time ago.
    grandma() {
      const W = 440, H = 520, c = canvas(W, H), g = c.getContext('2d');
      const bg = g.createRadialGradient(W * .5, H * .4, 20, W * .5, H * .45, W * .8); bg.addColorStop(0, '#6b5038'); bg.addColorStop(1, '#22170e');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      dabs(g, 0, 0, W, H, '#7c5d40', 220, 24, .1);
      // Dark dress, a lace collar, pearls.
      g.fillStyle = '#1f2330'; g.beginPath(); g.moveTo(W * .12, H); g.quadraticCurveTo(W * .2, H * .62, W * .5, H * .6); g.quadraticCurveTo(W * .8, H * .62, W * .88, H); g.fill();
      dabs(g, W * .15, H * .65, W * .7, H * .35, '#343a4c', 70, 18, .2);
      g.fillStyle = '#e9e1cf'; g.beginPath(); g.ellipse(W * .5, H * .63, W * .13, H * .045, 0, 0, 7); g.fill();
      g.fillStyle = '#f4efe2'; for (let i = 0; i < 13; i++) { const a = Math.PI * (.15 + i * .055); g.beginPath(); g.arc(W * .5 + Math.cos(a) * W * .12, H * .6 + Math.sin(a) * H * .08, 4.5, 0, 7); g.fill(); }
      // Neck, face, a small kind mouth, eyes that follow you round the room.
      g.fillStyle = '#d9b394'; g.fillRect(W * .44, H * .47, W * .12, H * .13);
      g.fillStyle = '#e2bf9f'; g.beginPath(); g.ellipse(W * .5, H * .36, W * .14, H * .15, 0, 0, 7); g.fill();
      dabs(g, W * .38, H * .24, W * .24, H * .24, '#c99a7c', 60, 9, .14);
      g.fillStyle = 'rgba(190,110,100,.35)'; for (const ex of [.42, .58]) { g.beginPath(); g.ellipse(W * ex, H * .41, 13, 8, 0, 0, 7); g.fill(); }
      g.fillStyle = '#3a2a20'; for (const ex of [.445, .555]) { g.beginPath(); g.ellipse(W * ex, H * .345, 6, 4, 0, 0, 7); g.fill(); }
      g.strokeStyle = '#8e4a40'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .465, H * .44); g.quadraticCurveTo(W * .5, H * .455, W * .535, H * .44); g.stroke();
      // Grey hair, up in a bun.
      g.fillStyle = '#b9b3a6'; g.beginPath(); g.ellipse(W * .5, H * .26, W * .16, H * .09, 0, Math.PI, 0); g.fill();
      g.beginPath(); g.arc(W * .5, H * .16, W * .07, 0, 7); g.fill();
      dabs(g, W * .34, H * .1, W * .32, H * .18, '#d8d2c4', 50, 10, .3);
      varnish(g, W, H, .6);
      return c;
    },
    // Over the bed: the sea, in the kind of painting people buy for over the bed.
    sea() {
      const W = 640, H = 400, c = canvas(W, H), g = c.getContext('2d');
      const sky = g.createLinearGradient(0, 0, 0, H * .55); sky.addColorStop(0, '#9cb7c8'); sky.addColorStop(1, '#f0d7a6');
      g.fillStyle = sky; g.fillRect(0, 0, W, H * .55);
      dabs(g, 0, 0, W, H * .4, '#f6ecd8', 90, 30, .2);
      const sea = g.createLinearGradient(0, H * .55, 0, H); sea.addColorStop(0, '#5b8790'); sea.addColorStop(1, '#2b4a52');
      g.fillStyle = sea; g.fillRect(0, H * .55, W, H * .45);
      for (let i = 0; i < 260; i++) { const y = H * .56 + rnd() * H * .44; g.fillStyle = `rgba(${rnd() < .5 ? '230,240,235' : '20,40,45'},${.1 + rnd() * .15})`; g.fillRect(rnd() * W, y, 20 + rnd() * 50, 2); }
      // A little boat, nowhere in particular.
      g.fillStyle = '#3a2a1c'; g.beginPath(); g.moveTo(W * .6, H * .6); g.lineTo(W * .7, H * .6); g.lineTo(W * .68, H * .63); g.lineTo(W * .62, H * .63); g.fill();
      g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(W * .65, H * .6); g.lineTo(W * .65, H * .44); g.lineTo(W * .69, H * .59); g.fill();
      varnish(g, W, H, .4);
      return c;
    },
    // Wren's, framed by her parents in the kitchen: MY HOUSE, with its face, and the three of them, and the sun.
    myhouse() {
      const W = 400, H = 520, c = canvas(W, H), g = c.getContext('2d');
      paper(g, W, H);
      caps(g, 'MY HOUSE', W / 2, 62, 40, '#c8402e');
      scribble(g, 0, H * .86, W, H * .14, '#5aa043', 7);
      crayon(g, circle(W * .82, H * .22, 34), '#e8b923', 5, 3, true);
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; crayon(g, [[W * .82 + Math.cos(a) * 44, H * .22 + Math.sin(a) * 44], [W * .82 + Math.cos(a) * 64, H * .22 + Math.sin(a) * 64]], '#e8b923', 4, 2); }
      houseFace(g, W * .22, H * .42, W * .5);
      stick(g, W * .13, H * .66, 16, '#7a4ea0', '#5a3a20');
      stick(g, W * .82, H * .64, 17, '#2f7a3a', '#4a3a28');
      stick(g, W * .72, H * .72, 11, '#d43a2c', '#c87a2c');
      return c;
    },
    // Wren's drawings, pinned over her bed.
    wren1() { // The three of them, holding hands under a rainbow.
      const W = 360, H = 280, c = canvas(W, H), g = c.getContext('2d'); paper(g, W, H);
      ['#d43a2c', '#e8a023', '#e8d023', '#4aa043', '#3a6ac4'].forEach((col, i) => crayon(g, Array.from({ length: 16 }, (_, k) => [W * .1 + k / 15 * W * .8, H * .55 - Math.sin(k / 15 * Math.PI) * (H * .42 - i * 12)]), col, 6, 2));
      stick(g, W * .3, H * .5, 15, '#7a4ea0', '#5a3a20'); stick(g, W * .7, H * .5, 16, '#2f7a3a', '#4a3a28'); stick(g, W * .5, H * .62, 10, '#d43a2c', '#c87a2c');
      return c;
    },
    wren2() { // The vent, with eyes, saying hello.
      const W = 360, H = 280, c = canvas(W, H), g = c.getContext('2d'); paper(g, W, H);
      crayon(g, [[W * .25, H * .3], [W * .75, H * .3], [W * .75, H * .75], [W * .25, H * .75]], '#666', 5, 3, true);
      for (let i = 0; i < 5; i++) crayon(g, [[W * .29, H * (.38 + i * .08)], [W * .71, H * (.38 + i * .08)]], '#888', 3, 2);
      for (const ex of [.4, .6]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(W * ex, H * .45, 13, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(W * ex + 3, H * .46, 6, 0, 7); g.fill(); }
      caps(g, 'HELLO', W / 2, H * .2, 30, '#3a6ac4');
      return c;
    },
    wren3() { // The car. Two heads in it.
      const W = 360, H = 280, c = canvas(W, H), g = c.getContext('2d'); paper(g, W, H);
      scribble(g, W * .15, H * .45, W * .7, H * .22, '#3f6a4a', 6);
      crayon(g, [[W * .15, H * .67], [W * .15, H * .45], [W * .3, H * .45], [W * .38, H * .28], [W * .65, H * .28], [W * .72, H * .45], [W * .85, H * .45], [W * .85, H * .67]], '#2a4a32', 5, 3, true);
      for (const x of [.3, .7]) crayon(g, circle(W * x, H * .7, 22), '#222', 6, 3, true);
      for (const x of [.45, .58]) crayon(g, circle(W * x, H * .36, 10), '#c87a2c', 4, 2, true);
      return c;
    },
    wren4() { // The house, hugging. She saw it first.
      const W = 360, H = 280, c = canvas(W, H), g = c.getContext('2d'); paper(g, W, H);
      houseFace(g, W * .34, H * .35, W * .32, true);
      stick(g, W * .14, H * .45, 11, '#7a4ea0', '#5a3a20');
      scribble(g, 0, H * .88, W, H * .12, '#5aa043', 6);
      return c;
    },
  };

  function texture(name) {
    if (cache[name]) return cache[name];
    if (!DRAW[name]) return null;
    seed = 11 + name.length * 97;
    const t = new THREE.CanvasTexture(DRAW[name]());
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return (cache[name] = t);
  }
  function material(name) { const t = texture(name); return t ? new THREE.MeshLambertMaterial({ map: t }) : null; }
  return { ready, material, texture, names: Object.keys(DRAW) };
})();
