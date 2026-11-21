'use strict';

const passportStamps = new Set();
const stampKey = 'falcon_station_passport_v1';
try {
  const saved = JSON.parse(localStorage.getItem(stampKey) || '[]');
  if (Array.isArray(saved)) saved.forEach(id => passportStamps.add(id));
} catch {}

const gameIcons = ['🎟️', '🚃', '🫧', '🚦', '🧳', '🔔', '📚', '🎨', '🚂', '🛠️', '🎬', '🗺️'];
const gameNames = ['Punch a Ticket', 'Fill the Line', 'Bathroom Cleanup', 'Stop the Train', 'Lunch Cleanup', 'Curtain Call', 'Library Helpers', 'Art Studio', 'Team Practice', 'Fix the Bridge', 'Make a Movie', 'Station Dispatcher'];

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

function gameHomeMarkup() {
  return `<section class="arcade-callout" aria-labelledby="arcade-callout-title">
    <span aria-hidden="true">🎮</span>
    <div><h2 id="arcade-callout-title">Station Games</h2><p>Play and collect passport stamps.</p></div>
    <a class="arcade-button" href="#games">Pick a game <span aria-hidden="true">→</span></a>
  </section>`;
}

function arcadeArt(index) {
  return `assets/games/${sceneAssets[index] || 'dispatcher'}.webp`;
}

function showGameMenu() {
  main.innerHTML = `<section class="arcade arcade-menu">
    <div class="arcade-nav"><a href="#">← Station home</a><span>⭐ ${passportCount()} of 12 stamps</span></div>
    <h1>Station Games</h1>
    <div class="arcade-grid">${arcadeCatalog().map((game, i) => `
      <a class="arcade-card" href="${i === 11 ? '#game/stations' : '#play/' + (i + 1)}">
        <span class="arcade-card-art" aria-hidden="true" style="--scene:url('${arcadeArt(i)}')"></span>
        <strong>${gameNames[i]}</strong>
        <span>${escapeGame(stops[i]?.name || 'All stations')}${passportStamps.has(game.id) ? ' · ⭐ Stamp earned' : ''}</span>
      </a>`).join('')}</div>
  </section>`;
}

function showArcadeGame(index) {
  const game = arcadeCatalog()[index];
  main.innerHTML = `<section class="arcade arcade-play">
    <div class="arcade-nav"><a href="#games">← All games</a>${index < stops.length ? `<a href="#stop/${index + 1}">Read expectations</a>` : ''}</div>
    <h1><span aria-hidden="true">${gameIcons[index]}</span> ${gameNames[index]}</h1>
    <div class="arcade-stage" id="game-zone"></div>
  </section>`;
  new RailwayGame(main.querySelector('#game-zone'), game, index).start();
}
