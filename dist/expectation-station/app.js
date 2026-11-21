const labels=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];
let stops=[];let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const main=document.querySelector('main');
const journey = document.querySelector('#journey');
const skipRide = document.querySelector('#skip-ride');
let rideTimer, rideSounds, rideMessageTimer;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');function syncMotion(){reduced=motionPreference.matches;document.body.classList.toggle('reduced',reduced)}syncMotion();motionPreference.addEventListener?.('change',syncMotion);
const sceneAssets=['classroom','hallway','bathroom','playground','cafeteria','auditorium','library','vapa','pe','steam','animation'];
function scene(i,cls='scene'){return `<div class="${cls}" role="img" aria-label="${['Falcon student listening in class','Falcon students walking calmly in line','Falcon student washing hands','Falcon students taking turns with a ball','Falcon student sitting safely at lunch','Falcon student applauding a performance','Falcon student reading gently','Falcon student painting carefully','Falcon students playing fairly','Falcon students building together','Falcon student carefully using a computer'][i]}" style="background-image:url(assets/${sceneAssets[i]}.webp)"></div>`}
function home() {
  main.innerHTML = `${stationPlatform()}
  <section class="school-timetable" id="destinations" aria-labelledby="timetable-title">
    <div class="timetable-heading">
      <h2 id="timetable-title">Departures</h2>
      <div class="departure-actions"><a class="timetable-games" href="#ride">Ride with the Falcon</a><a class="departure-games" href="#games">Play games</a></div>
    </div>
    <div class="timetable-labels" aria-hidden="true"><span>Platform</span><span>School stop</span></div>
    <ul class="timetable-rows">${stops.map((stop, i) => `<li>
      <button class="timetable-row" data-stop="${i}" aria-label="Board the train to ${stop.name}">
        <span class="timetable-platform" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <span>${stop.name}</span><span class="timetable-arrow" aria-hidden="true">→</span>
      </button>
    </li>`).join('')}</ul>
  </section>`;
  main.querySelectorAll('[data-stop]').forEach(button => {
    button.onclick = () => board(Number(button.dataset.stop));
  });
  arrival();
}
function closeJourney() {
  clearTimeout(rideTimer);
  clearTimeout(rideMessageTimer);
  clearInterval(rideSounds);
  if (journey.open) journey.close();
}

function board(i) {
  window.speechSynthesis?.cancel();
  closeJourney();
  const destination = `stop/${i + 1}`;
  if (reduced) {
    location.hash = destination;
    return;
  }

  const message = document.querySelector('#journey-message');
  document.querySelector('#travel-name').textContent = stops[i].name;
  document.querySelector('#journey-train').innerHTML = trainArt();
  message.textContent = 'Your train is pulling in…';
  journey.showModal();
  whistle();

  const finish = () => {
    closeJourney();
    stationBell();
    location.hash = destination;
  };
  skipRide.onclick = finish;
  rideSounds = setInterval(() => hiss(.12, .06), 330);
  rideTimer = setTimeout(finish, 4200);
  rideMessageTimer = setTimeout(() => {
    message.textContent = 'All aboard! Off to our next stop!';
  }, 1700);
}

journey.addEventListener('cancel', event => {
  event.preventDefault();
  skipRide.click();
});
function stop(i) {
  const school = stops[i];
  const game = arcadeCatalog()[i];
  const practiced = new Set(game.rounds.map(round => round.category));
  const gameName = combinedGame(i)?.name || railwayStops[i].name;
  const row = (expectation, category) => `<article class="behavior-row">
    <span class="behavior-letter" aria-hidden="true">${labels[category][0]}</span>
    <div><h3>${labels[category]}</h3><p>${escapeGame(expectation)}</p></div>
  </article>`;
  const behaviors = school.expectations.map(row);
  main.innerHTML = `<a class="back" href="#destinations">← School stops</a>
    <div class="behavior-header">
      <div><span class="eyebrow">Platform ${String(i+1).padStart(2, '0')}</span>
      <h1 tabindex="-1">${escapeGame(school.name)}</h1></div>
      <button class="secondary" id="read">Read aloud</button>
    </div>
    <section class="behavior-ticket" aria-labelledby="practice-title">
      <div class="behavior-ticket-content"><h2 id="practice-title">What you’ll practice</h2>
        ${behaviors.filter((_, category) => practiced.has(category)).join('')}
        <a class="primary" href="#play/${i+1}">Play ${escapeGame(gameName)} <span aria-hidden="true">→</span></a>
      </div>
      ${scene(i, 'scene behavior-picture')}
    </section>
    <section class="behavior-more" aria-labelledby="more-title">
      <h2 id="more-title">More ways to show FALCON</h2>
      <div class="behavior-grid">${behaviors.filter((_, category) => !practiced.has(category)).join('')}</div>
    </section>
    <div class="stop-nav"><button class="secondary" id="next">Next stop: ${escapeGame(stops[(i+1)%stops.length].name)}</button></div>`;

  document.querySelector('#next').onclick = () => board((i+1)%stops.length);
  const read = document.querySelector('#read');
  if (!('speechSynthesis' in window)) {
    read.hidden = true;
    return;
  }
  let narration;
  const reset = () => {
    narration = null;
    stationNarrating = false;
    read.textContent = 'Read aloud';
  };
  read.onclick = () => {
    if (narration) {
      speechSynthesis.cancel();
      reset();
      return;
    }
    const categories = labels.map((_, j) => j);
    const order = [...practiced].sort((a, b) => a-b).concat(categories.filter(j => !practiced.has(j)));
    narration = new SpeechSynthesisUtterance(`${school.name}. ${order.map(j => `${labels[j]}. ${school.expectations[j]}`).join(' ')}`);
    narration.rate = .8;
    const current = narration;
    current.onend = current.onerror = () => {
      if (narration === current && read.isConnected) reset();
    };
    stationNarrating = true;
    read.textContent = 'Stop reading';
    speechSynthesis.speak(current);
  };
}

function focusHeading(selector, scroll = false) {
  const heading = main.querySelector(selector);
  heading.tabIndex = -1;
  heading.focus({preventScroll: true});
  if (scroll) heading.scrollIntoView();
}

function render() {
  closeJourney();
  if (!stops.length) return;
  window.speechSynthesis?.cancel();
  stationNarrating = false;
  const route = location.hash.match(/^#(stop|play)\/(\d+)$/);
  const stopNumber = Number(route?.[2]);
  const validStop = stopNumber > 0 && stopNumber <= stops.length;
  if (['#ride','#ride/playground','#ride/lunch','#ride/transfer'].includes(location.hash)) {
    window.scrollTo(0, 0);
    showFirstRide();
    return;
  }
  if (location.hash === '#games') {
      showGameMenu();
    window.scrollTo(0, 0);
    focusHeading('h1');
    return;
  }
  if (location.hash === '#game/stations' || (validStop && route[1] === 'play')) {
      window.scrollTo(0, 0);
    showArcadeGame(validStop ? stopNumber - 1 : stops.length);
    return;
  }
  if (validStop) {
    stop(stopNumber - 1);
    window.scrollTo(0, 0);
    focusHeading('h1');
    return;
  }

  if (!main.querySelector('#destinations')) home();
  if (location.hash === '#destinations') focusHeading('#destinations h2', true);
  else window.scrollTo(0, 0);
}
window.addEventListener('hashchange',render);fetch('data.json').then(r=>r.json()).then(d=>{stops=d;render()}).catch(()=>main.innerHTML='<p>The station could not load. Please refresh to try again.</p>');
