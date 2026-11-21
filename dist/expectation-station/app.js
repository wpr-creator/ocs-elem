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
      <a class="timetable-games" href="#games">Play games <span aria-hidden="true">→</span></a>
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
function stop(i){const s=stops[i];main.innerHTML=`<a class="back" href="#destinations">← School stops</a><section class="stop-hero"><div><span class="eyebrow">PLATFORM ${String(i+1).padStart(2,'0')} · THE FALCON WAY</span><h1 tabindex="-1">${s.name}</h1><div class="stop-actions"><a class="primary" href="#play/${i+1}">Play game</a><button class="secondary" id="read">Read aloud</button><button class="secondary" id="stop-reading" hidden>Stop reading</button></div></div>${scene(i,'scene stop-picture')}</section><section class="expectations" aria-label="FALCON expectations">${s.expectations.map((e,j)=>`<article class="expectation"><span class="letter" aria-hidden="true">${labels[j][0]}</span><div><h2>${labels[j]}</h2><p>${e}</p></div></article>`).join('')}</section><div class="stop-nav"><button class="primary" id="next">Next stop: ${stops[(i+1)%stops.length].name}</button></div>`;
 document.querySelector('#next').onclick=()=>board((i+1)%stops.length);
 const read=document.querySelector('#read'),cancel=document.querySelector('#stop-reading');if(!('speechSynthesis'in window)){read.hidden=true}else{read.onclick=()=>{speechSynthesis.cancel();stationNarrating=true;const u=new SpeechSynthesisUtterance(`${s.name}. I can show the FALCON way every day! ${s.expectations.map((e,j)=>`${labels[j]}. ${e}`).join(' ')}`);u.rate=.8;u.onend=u.onerror=()=>{stationNarrating=false;cancel.hidden=true;read.textContent='Read aloud'};speechSynthesis.speak(u);cancel.hidden=false;read.textContent='Read again'};cancel.onclick=()=>{speechSynthesis.cancel();stationNarrating=false;cancel.hidden=true;read.textContent='Read aloud'}}
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
