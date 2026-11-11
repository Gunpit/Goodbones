// Getting round the house. Tab goes forward through the rooms, Shift goes back, and clicking a room on the map goes straight there.
// The controls stay written under the map the whole time it's showing.
// Only rooms that are open today count: on the packing days that's the day's own rooms.
function openRooms() { return typeof inPack === 'function' && inPack() ? cfg().rooms : ROOM_ORDER; }
function canMove() { return S.on && !S.finished && S.scene && !S.scene.locked && !S.card && S.paused <= 0; }
function prevRoom() {
  const rooms = openRooms(), i = rooms.indexOf(S.room);
  goRoom(rooms[(i - 1 + rooms.length) % rooms.length]); Audio2.fx.creak();
}
// Shift on its own goes back a room. It goes on the key coming up, and only if nothing else was pressed while it was down,
// so holding Shift for a capital letter never moves you.
let shiftClean = false;
addEventListener('keydown', e => {
  if (e.key === 'Shift') { if (!e.repeat) shiftClean = true; return; }
  shiftClean = false;
}, true);
addEventListener('keyup', e => {
  if (e.key !== 'Shift' || !shiftClean) return;
  shiftClean = false;
  if (!canMove()) return;
  // The teaching scene keeps you in Wren's room until she sends you (teach.js).
  if (typeof teachHolds === 'function' && teachHolds()) return;
  prevRoom();
}, true);
addEventListener('blur', () => { shiftClean = false; });

// Arriving in a room, you're the first thing in it. If that's already boxed or unplugged, be the first thing that isn't,
// so the first word you type there isn't swallowed.
const _goRoomC = goRoom;
goRoom = (room, quiet) => {
  _goRoomC(room, quiet);
  if (S.obj && S.obj.muted > 0) {
    const o = ROOMS[room].objects.find(x => !(x.muted > 0));
    if (o) { S.obj = o; if (S.voice) S.voice.character(o.voice); showName(quiet ? ROOMS[room].label : `${ROOMS[room].label}: ${o.name}`); }
  }
};

// ---- The map ----
const mapEl = $('map');
mapEl.style.pointerEvents = 'auto';
function mapRoomAt(e) {
  const r = mapEl.getBoundingClientRect(), x = (e.clientX - r.left) * mapEl.width / r.width, y = (e.clientY - r.top) * mapEl.height / r.height;
  for (const key in MAP.rooms) { const m = MAP.rooms[key]; if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h && ROOMS[key] && openRooms().includes(key)) return key; }
  return null;
}
// Don't let the click fall through to whatever object is behind the map.
mapEl.addEventListener('mousedown', e => {
  e.stopPropagation();
  const key = mapRoomAt(e);
  if (!key || key === S.room || !canMove()) return;
  if (typeof teachHolds === 'function' && teachHolds()) return;
  goRoom(key); Audio2.fx.creak();
});
mapEl.addEventListener('mousemove', e => { mapEl.style.cursor = mapRoomAt(e) && canMove() ? 'pointer' : 'default'; });

// ---- The written controls ----
const mapKeys = document.createElement('div');
mapKeys.id = 'mapkeys';
mapKeys.innerHTML = '<b>Tab</b> next room &nbsp;·&nbsp; <b>Shift</b> room before<br>or click a room';
Object.assign(mapKeys.style, { position: 'absolute', right: '14px', top: '164px', width: '236px', textAlign: 'right', font: 'italic 13px Georgia, serif', lineHeight: '1.35', color: 'rgba(255,240,205,.82)', textShadow: '0 1px 2px #000, 0 0 8px rgba(0,0,0,.8)', pointerEvents: 'none', display: 'none' });
mapEl.parentNode.appendChild(mapKeys);
const _drawMapC = drawMap;
drawMap = dt => { _drawMapC(dt); mapKeys.style.display = mapEl.style.display; };
