'use strict';

const passportStamps = new Set();
const stampKey = 'falcon_station_passport_v1';
try {
  const saved = JSON.parse(localStorage.getItem(stampKey) || '[]');
  if (Array.isArray(saved)) saved.forEach(id => passportStamps.add(id));
} catch {}

// Each stop has a visual reward and a short, distinct sound.
const railwayStops = [
  {name:'Punch a Ticket', effect:'✦', motion:'punch', sound:() => {boardClack(); tone(988, .28, 'triangle', .035, .09)}},
  {name:'Line-Up Express', effect:'🚃', motion:'roll', sound:() => {boardClack(); tone(196, .38, 'triangle', .05)}},
  {name:'Washroom Steam Stop', effect:'🫧', motion:'float', sound:() => {hiss(.26); tone(480, .11, 'sine', .045); tone(820, .18, 'sine', .04, .1)}},
  {name:'Stop the Train', effect:'🚦', motion:'signal', sound:() => {hiss(.32, .04); tone(330, .22, 'triangle', .04)}},
  {name:'Lunch Cart Express', effect:'🛒', motion:'roll', sound:() => {tone(587, .15, 'triangle'); tone(784, .22, 'triangle', .045, .12)}},
  {name:'Curtain Call Car', effect:'🔔', motion:'swing', sound:() => stationBell()},
  {name:'Library Book Car', effect:'📚', motion:'slide', sound:() => {hiss(.12, .032); tone(440, .25, 'sine', .03, .08)}},
  {name:'Art Supply Car', effect:'🎨', motion:'splash', sound:() => {tone(523, .12); tone(659, .14, 'sine', .04, .09); tone(880, .2, 'sine', .035, .17)}},
  {name:'Team Track', effect:'🚂', motion:'roll', sound:() => {tone(349, .31, 'triangle', .05); tone(523, .38, 'triangle', .035, .1)}},
  {name:'Bridge Repair Crew', effect:'🛠️', motion:'punch', sound:() => {tone(190, .1, 'triangle', .065); tone(285, .2, 'triangle', .04, .12)}},
  {name:'Picture Show Car', effect:'🎞️', motion:'swing', sound:() => {boardClack(); tone(698, .15); tone(932, .2, 'sine', .04, .17)}},
  {name:'Station Dispatcher', effect:'✦', motion:'splash', sound:() => {tone(660, .1); tone(880, .1, 'sine', .045, .12); tone(1175, .25, 'sine', .035, .25)}}
];

function escapeGame(text) {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

function shuffleGame(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function arcadeCatalog() {
  const {games, match} = FalconGames.buildGames(stops);
  return [...games, match];
}

function earnStamp(id) {
  passportStamps.add(id);
  try { localStorage.setItem(stampKey, JSON.stringify([...passportStamps])); } catch {}
}

function passportCount() {
  return arcadeCatalog().filter(game => passportStamps.has(game.id)).length;
}

function arcadeArt(index) {
  return `assets/games/${sceneAssets[index] || 'dispatcher'}.webp`;
}

function showGameMenu() {
  main.innerHTML = `<section class="arcade arcade-menu">
    <div class="terminal-game-title menu-title"><h1>Station Games</h1><span class="passport-total">${passportCount()} of 12 stamps</span></div>
    <div class="arcade-grid">${arcadeCatalog().map((game, i) => `
      <a class="arcade-card" href="${i === 11 ? '#game/stations' : '#play/' + (i + 1)}">
        <span class="arcade-card-art" aria-hidden="true" style="--scene:url('${arcadeArt(i)}')"></span>
        <strong>${railwayStops[i].name}</strong>
        <span><b class="platform-number">${i === 11 ? '↔' : String(i + 1).padStart(2, '0')}</b> ${escapeGame(stops[i]?.name || 'All stations')}${passportStamps.has(game.id) ? ' · ⭐ Stamp earned' : ''}</span>
      </a>`).join('')}</div>
  </section>`;
}

function showArcadeGame(index) {
  const game = arcadeCatalog()[index];
  const stop = stops[index];
  const platform = stop ? `Platform ${String(index + 1).padStart(2, '0')} · ${escapeGame(stop.name)}` : 'All school stops';
  main.innerHTML = `<section class="arcade arcade-play">
    <div class="arcade-nav"><a href="#games">← All games</a>${index < stops.length ? `<a href="#stop/${index + 1}">Read expectations</a>` : ''}</div>
    <div class="terminal-game-title"><span class="terminal-clock" aria-hidden="true"></span><div>
      <p class="terminal-platform">${platform}</p><h1>${railwayStops[index].name}</h1>
    </div></div>
    <div class="arcade-stage" id="game-zone"></div>
  </section>`;
  new RailwayGame(main.querySelector('#game-zone'), game, index).start();
}
