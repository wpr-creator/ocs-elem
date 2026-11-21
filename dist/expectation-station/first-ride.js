'use strict';

class FirstRideClassroom extends ClassroomYard {
  finish() {
    this.root.innerHTML = `<div class="arcade-win ride-arrival">
      <h2 tabindex="-1">Classroom reached!</h2>
      <p>Focus · You followed the teacher’s directions.</p>
      <a class="timetable-games" href="#destinations">Back to Falcon Central</a>
    </div>`;
    this.root.querySelector('h2').focus({preventScroll:true});
  }
}

function showFirstRide() {
  main.innerHTML = `<section class="arcade first-ride">
    <div class="arcade-nav"><a href="#destinations">← Departures</a></div>
    <div class="terminal-game-title"><span class="terminal-clock" aria-hidden="true"></span>
      <div><p class="terminal-platform">Falcon Central · Platform 01</p><h1>Ride with the Falcon</h1></div>
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
            <div class="ride-boiler"><i></i><b>01</b></div>
            <div class="ride-wheelset"><i></i><i></i><i></i></div>
            <div class="ride-wheelset ride-wheelset-far"><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
      <div class="ride-caption"><p role="status">Next stop · Classroom</p><button type="button" class="secondary ride-skip">Skip ride</button></div>
    </div>
  </section>`;
  const stage = main.querySelector('#ride-stage');
  const skip = stage.querySelector('.ride-skip');
  const openBoard = () => {
    if (!stage.isConnected || location.hash !== '#ride' || !stage.contains(skip)) return;
    clearTimeout(timer);
    main.querySelector('h1').textContent = 'Classroom control board';
    const game = arcadeCatalog()[0];
    new FirstRideClassroom(stage, {...game, rounds:game.rounds.slice(0,1)}, 0).start();
  };
  const timer = setTimeout(openBoard, reduced ? 0 : 4700);
  skip.onclick = openBoard;
  if (!reduced) {
    skip.focus({preventScroll:true});
    whistle();
  }
}
