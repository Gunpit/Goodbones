// How you're doing. Two small things by the map on the packing days:
// a row of boxes for today's packing (taped shut when one goes to the hall), and a word that floats up when something you did worked.
// It's the same count the endings use: the fewer boxes they get to the hall, the more of the house is still here on Friday.

// ---- The tally ----
const tally = document.createElement('div');
tally.id = 'tally';
Object.assign(tally.style, { position: 'absolute', right: '14px', top: '164px', width: '236px', textAlign: 'right', pointerEvents: 'none', display: 'none', font: 'italic 13px Georgia, serif', color: 'rgba(255,240,205,.88)', textShadow: '0 1px 2px #000, 0 0 8px rgba(0,0,0,.8)' });
$('map').parentNode.appendChild(tally);
// The controls go underneath it.
if (typeof mapKeys !== 'undefined') mapKeys.style.top = '212px';
const tallyCss = document.createElement('style');
tallyCss.textContent = `
  #tally .boxes { display: flex; justify-content: flex-end; gap: 4px; margin-bottom: 3px; }
  #tally .bx { width: 16px; height: 13px; border: 1.5px solid rgba(255,240,205,.55); border-radius: 2px; box-sizing: border-box; }
  #tally .bx.packed { background: #b98a52; border-color: #6b4a26; box-shadow: inset 0 -2px 0 rgba(0,0,0,.25); position: relative; }
  #tally .bx.packed::after { content: ''; position: absolute; left: 0; right: 0; top: 4px; height: 3px; background: #e2cf9c; }
  #tally .bx.fresh { animation: bxthud .5s ease-out; }
  @keyframes bxthud { 0% { transform: translateY(-6px) scale(1.25); } 60% { transform: translateY(1px) scale(.95); } 100% { transform: none; } }
  .winflash { position: absolute; right: 18px; pointer-events: none; font: bold 19px Georgia, serif; color: #ffd36b; text-shadow: 0 2px 2px #000, 0 0 12px rgba(0,0,0,.9); white-space: nowrap; animation: winup 2.4s ease-out forwards; }
  @keyframes winup { 0% { opacity: 0; transform: translateY(10px) scale(.9); } 12% { opacity: 1; transform: translateY(0) scale(1.06); } 70% { opacity: 1; } 100% { opacity: 0; transform: translateY(-34px); } }
`;
document.head.appendChild(tallyCss);
let tallyKey = '';
function drawTally() {
  const show = typeof inPack === 'function' && inPack() && $('map').style.display !== 'none' && PS.total > 0;
  tally.style.display = show ? 'block' : 'none';
  if (!show) return;
  const key = PS.hall + '/' + PS.total;
  if (key === tallyKey) return;
  const grew = tallyKey && +tallyKey.split('/')[0] < PS.hall;
  tallyKey = key;
  const n = Math.min(PS.hall, PS.total);
  let row = '';
  for (let i = 0; i < PS.total; i++) row += `<span class="bx${i < n ? ' packed' : ''}${grew && i === n - 1 ? ' fresh' : ''}"></span>`;
  tally.innerHTML = `<div class="boxes">${row}</div>${PS.total - n} of ${PS.total} still out`;
}
const _drawMapP = drawMap;
drawMap = dt => { _drawMapP(dt); drawTally(); };

// ---- The flashes ----
let flashN = 0;
function winFlash(text) {
  const el = document.createElement('div');
  el.className = 'winflash';
  el.textContent = text;
  el.style.top = (250 + (flashN++ % 2) * 26) + 'px';
  $('map').parentNode.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
const busy = () => all.filter(p => p.errand).map(p => p.id);
const _lureP = lure;
lure = (word, o) => {
  const before = PS.lured, was = busy();
  const r = _lureP(word, o);
  if (PS.lured > before) {
    const off = busy().filter(id => !was.includes(id) && (id === 'm' || id === 'd'));
    if (LURES[word] && LURES[word].hug) winFlash('Holding on');
    else winFlash(off.length > 1 ? 'Both stalled' : off.length ? `${NAMES[off[0]]} stalled` : 'Stalled');
  }
  return r;
};
const _fightP = fight;
fight = word => { _fightP(word); winFlash('They stop to argue'); };
