const labels=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];
let stops=[],timer,boardIndex=0;let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const main=document.querySelector('main');
const journey = document.querySelector('#journey');
const skipRide = document.querySelector('#skip-ride');
let rideTimer, rideSounds, rideMessageTimer;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');function syncMotion(){reduced=motionPreference.matches;document.body.classList.toggle('reduced',reduced)}syncMotion();motionPreference.addEventListener?.('change',syncMotion);
const sceneAssets=['classroom','hallway','bathroom','playground','cafeteria','auditorium','library','vapa','pe','steam','animation'];
function scene(i,cls='scene'){return `<div class="${cls}" role="img" aria-label="${['Falcon student listening in class','Falcon students walking calmly in line','Falcon student washing hands','Falcon students taking turns with a ball','Falcon student sitting safely at lunch','Falcon student applauding a performance','Falcon student reading gently','Falcon student painting carefully','Falcon students playing fairly','Falcon students building together','Falcon student carefully using a computer'][i]}" style="background-image:url(assets/${sceneAssets[i]}.webp)"></div>`}
function home(){clearInterval(timer);main.innerHTML=`<section class="hero concourse"><div class="concourse-clock" aria-hidden="true"><span class="clock-xii">XII</span><span class="clock-iii">III</span><span class="clock-vi">VI</span><span class="clock-ix">IX</span><i class="concourse-hour"></i><i class="concourse-minute"></i><b>●</b></div><div class="concourse-title"><span class="eyebrow">WELCOME, FALCONS</span><h1>All Aboard the<br>Expectation Station</h1><p>Play a game or visit a stop to read the school expectations.</p></div><div class="porter-portrait"><div class="hero-art" role="img" aria-label="A friendly Falcon conductor beside a vintage train"></div></div></section>${gameHomeMarkup()}${stationPlatform()}<section class="board" aria-label="Station departure board"><div class="board-heading"><h2>Departures</h2><span>ALL ROUTES · THE FALCON WAY</span></div><div class="departure-labels"><span>DESTINATION</span><span>PLATFORM</span><span>STATUS</span></div><div id="departure-rows" aria-label="Rotating school destinations"></div><p class="board-note">Choose a stop below.</p></section><section id="destinations"><div class="section-head"><div><span class="eyebrow">WHERE SHALL WE GO?</span><h2>Choose your next stop.</h2></div><p>Tap a picture to visit that stop.</p></div><div class="destinations">${stops.map((s,i)=>`<button class="destination" data-stop="${i}" aria-label="Board the train to ${s.name}">${scene(i)}<span class="dest-body"><span class="platform">PLATFORM ${String(i+1).padStart(2,'0')}</span><h3>${s.name}</h3><span class="board-btn">Board the train <span class="ticket" aria-hidden="true">✦</span></span></span></button>`).join('')}</div></section><div class="values">${labels.map(l=>`<span><b>${l[0]}</b>${l}</span>`).join('')}</div>`;
 main.querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>board(+b.dataset.stop));updateDepartures();document.querySelector('#call-train').onclick=arrival;arrival();timer=setInterval(()=>{if(!reduced&&!document.hidden&&!document.activeElement?.closest('#departure-rows'))updateDepartures()},4200);
}
function updateDepartures(){const el=document.querySelector('#departure-rows');if(!el)return;el.innerHTML=[0,1,2].map((offset)=>{const i=(boardIndex+offset)%stops.length;return `<button class="departure-row" data-route="${i}" aria-label="Board the train to ${stops[i].name}"><span class="flaps" aria-hidden="true">${[...stops[i].name].map((c,j)=>`<span class="flap ${reduced?'':'flip'}" style="animation-delay:${j*22}ms">${c===' '?'&nbsp;':c==='&'?'&amp;':c}</span>`).join('')}</span><span class="platform-number">${String(i+1).padStart(2,'0')}</span><span class="departure-status">${offset===0?'BOARDING':'ON TIME'}</span></button>`}).join('');el.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>board(+b.dataset.route));boardIndex=(boardIndex+1)%stops.length;boardClack()}
function closeJourney() {
  clearTimeout(rideTimer);
  clearTimeout(rideMessageTimer);
  clearInterval(rideSounds);
  if (journey.open) journey.close();
}

function board(i) {
  window.speechSynthesis?.cancel();
  clearInterval(timer);
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
function stop(i){clearInterval(timer);const s=stops[i];main.innerHTML=`<button class="back" id="back">Back to the station</button><section class="stop-hero"><div><span class="eyebrow">PLATFORM ${String(i+1).padStart(2,'0')} · THE FALCON WAY</span><h1 tabindex="-1">${s.name}</h1><p>I can show the FALCON way every day!</p><div class="stop-actions"><a class="primary" href="#play/${i+1}">Play game</a><button class="secondary" id="read">Read aloud</button><button class="secondary" id="stop-reading" hidden>Stop reading</button></div></div>${scene(i,'scene stop-picture')}</section><section class="expectations" aria-label="FALCON expectations">${s.expectations.map((e,j)=>`<article class="expectation"><span class="letter" aria-hidden="true">${labels[j][0]}</span><div><h2>${labels[j]}</h2><p>${e}</p></div></article>`).join('')}</section><div class="stop-nav"><button class="secondary" id="station">Choose another stop</button><button class="primary" id="next">Next stop: ${stops[(i+1)%stops.length].name}</button></div>`;
 document.querySelector('#back').onclick=document.querySelector('#station').onclick=()=>location.hash='destinations';document.querySelector('#next').onclick=()=>board((i+1)%stops.length);
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
    clearInterval(timer);
    showGameMenu();
    window.scrollTo(0, 0);
    focusHeading('h1');
    return;
  }
  if (location.hash === '#game/stations' || (validStop && route[1] === 'play')) {
    clearInterval(timer);
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

  home();
  if (location.hash === '#destinations') focusHeading('#destinations h2', true);
  else window.scrollTo(0, 0);
}
window.addEventListener('hashchange',render);fetch('data.json').then(r=>r.json()).then(d=>{stops=d;render()}).catch(()=>main.innerHTML='<p>The station could not load. Please refresh to try again.</p>');
