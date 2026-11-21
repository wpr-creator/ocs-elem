'use strict';

class FirstRideClassroom extends ClassroomDispatch {
  finish() {
    this.root.innerHTML = `<div class="arcade-win ride-arrival">
      <h2 tabindex="-1">Classroom reached!</h2>
      <p>Focus · You followed the teacher’s directions.</p>
      <a class="timetable-games" href="#ride/playground">Playground →</a>
    </div>`;
    this.root.querySelector('h2').focus({preventScroll:true});
  }
}

class RidePlayground extends SignalRun {
  start() {
    this.round = 0;
    this.routes = [3];
    this.crossing = true;
    this.openRun();
    paintPlayground(this.root.querySelector('canvas'));
  }

  finish() {
    this.root.innerHTML = `<div class="arcade-win ride-arrival">
      <h2 tabindex="-1">Crossing clear!</h2>
      <a class="timetable-games" href="#destinations">Falcon Central</a>
    </div>`;
    this.root.querySelector('h2').focus({preventScroll:true});
  }
}

function showFirstRide() {
  const route = location.hash;
  const playground = route === '#ride/playground';
  const stop = playground ? 'Playground' : 'Classroom';
  main.innerHTML = `<section class="arcade first-ride">
    <div class="arcade-nav"><a href="#destinations">← Departures</a></div>
    <div class="terminal-game-title"><span class="terminal-clock" aria-hidden="true"></span>
      <div><p class="terminal-platform">${playground ? 'Classroom → Playground' : 'Falcon Central · Platform 01'}</p><h1>Ride with the Falcon</h1></div>
    </div>
    <div class="arcade-stage" id="ride-stage">
      <div class="ride-scene" aria-hidden="true">
        <div class="ride-vault"></div>
        <div class="ride-colonnade"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ride-track"></div>
        <div class="ride-perspective">
          <div class="ride-locomotive">
            <div class="ride-coach"><i></i><i></i><i></i><i></i></div>
            <div class="ride-cab"><div class="ride-window"><img src="assets/conductor.webp" alt=""></div></div>
            <div class="ride-boiler"><i></i><b>${playground ? '04' : '01'}</b></div>
            <div class="ride-wheelset"><i></i><i></i><i></i></div>
            <div class="ride-wheelset ride-wheelset-far"><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
      <div class="ride-caption"><p role="status">Next stop · ${stop}</p><button type="button" class="secondary ride-skip">Skip ride</button></div>
    </div>
  </section>`;
  const stage = main.querySelector('#ride-stage');
  const skip = stage.querySelector('.ride-skip');
  const openBoard = () => {
    if (!stage.isConnected || location.hash !== route || !stage.contains(skip)) return;
    clearTimeout(timer);
    main.querySelector('h1').textContent = playground ? 'Playground crossing' : 'Classroom control board';
    const Player = playground ? RidePlayground : FirstRideClassroom;
    const index = playground ? 3 : 0;
    new Player(stage, arcadeCatalog()[index], index).start();
  };
  const timer = setTimeout(openBoard, 4700);
  skip.onclick = openBoard;
  skip.focus({preventScroll:true});
  whistle();
}


function paintPlayground(canvas) {
  const ctx = canvas.getContext('2d');
  const rect = (x,y,w,h,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
  };
  rect(0,0,320,154,'#729f94');
  rect(0,90,320,64,'#657653');
  rect(0,114,320,40,'#536649');
  for (const [x,y] of [[19,26],[103,13],[219,26],[278,17]]) {
    rect(x,y+4,29,5,'#aabfa9');
    rect(x+6,y,16,8,'#aabfa9');
  }
  for (const x of [8,83,174,292]) {
    rect(x+10,77,5,20,'#584732');
    rect(x,69,28,15,'#365b45');
    rect(x+5,61,18,19,'#406b4d');
    rect(x+5,68,5,10,'#658253');
  }
  // School and playground, built with the same hard-edged palette as dispatch.
  rect(39,48,65,44,'#554536');
  rect(42,52,59,39,'#b0865b');
  rect(38,48,68,6,'#744f3a');
  for (const x of [48,67,86]) {
    rect(x,59,11,13,'#46392d');
    rect(x+2,61,7,9,'#bdd0ae');
    rect(x+5,61,1,9,'#715943');
  }
  rect(64,76,14,15,'#594e3c');
  rect(209,55,53,4,'#e2bb6e');
  rect(210,58,4,33,'#765034');
  rect(257,58,4,33,'#765034');
  for (const x of [223,243]) {
    rect(x,59,1,23,'#3d4331');
    rect(x+8,59,1,23,'#3d4331');
    rect(x-1,81,11,3,'#b77f50');
  }
  rect(0,98,320,2,'#af9c68');
  rect(0,105,320,2,'#af9c68');
  for(let x=2;x<320;x+=9) rect(x,95,3,15,'#c9b781');
  rect(0,119,320,24,'#806548');
  rect(0,124,320,2,'#b59463');
  rect(0,138,320,2,'#ab8a59');
  rect(193,96,17,49,'#c2a275');
  for(let y=99;y<145;y+=9) rect(194,y,15,3,'#e4cda1');
}
