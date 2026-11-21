'use strict';

class SignalRun extends RailwayGame {
  start() {
    this.round = 0;
    this.routes = this.index === 8 ? [8,3] : [3,8];
    this.openRun();
  }

  openRun() {
    const stop = this.routes[this.round];
    this.position = 2;
    this.speed = 0;
    this.power = false;
    this.gate = 0;
    this.clear = false;
    this.cued = false;
    this.done = false;
    const {gates, expectation, reminder} = arcadeCatalog()[stop].rounds[0];
    this.gates = this.crossing ? [62] : gates;
    this.reminder = reminder;
    this.root.innerHTML = `${this.crossing ? '' : `<div class="yard-heading">
      <div><span class="yard-value">F · FOCUS</span><h2>${stop === 3 ? 'Playground' : 'PE'} run</h2></div>
      <span class="yard-shift">${this.round+1} / 2</span>
    </div>`}
    <div class="signal-cab ${this.crossing ? 'pixel-crossing' : ''}" data-course="${stop}" tabindex="0" aria-label="Train controls. Press space to go or brake.">
      ${this.crossing ? '<canvas width="320" height="154" aria-hidden="true"></canvas>' : ''}
      <div class="signal-readout"><p role="status">${this.crossing ? 'Brake at the whistle.' : 'Go. Brake at red.'}</p>${this.crossing ? '<span aria-hidden="true">○</span>' : `<span>0 / ${this.gates.length} stops</span>`}</div>
      <div class="signal-line">
        ${this.gates.map((position,i)=>`<span class="signal-post" data-gate="${i}" style="--mile:${position}%" aria-hidden="true"><i></i></span>`).join('')}
        <span class="signal-finish" aria-hidden="true">⚑</span>
        <div class="signal-engine" aria-hidden="true"><span></span><i></i><b></b></div>
      </div>
      <div class="signal-controls"><button class="signal-go" type="button">▶ Go</button><button class="signal-brake" type="button">■ Brake</button></div>
    </div>
    ${this.crossing ? '' : `<div class="signal-footer"><details><summary>School expectation</summary><p>${escapeGame(expectation)}</p></details>
      <button class="arcade-listen railway-sound" type="button" aria-pressed="${stationSound}">Sound</button></div>`}`;
    const cab = this.root.querySelector('.signal-cab');
    this.cab = cab;
    this.engine = cab.querySelector('.signal-engine');
    this.status = cab.querySelector('[role="status"]');
    this.posts = cab.querySelectorAll('.signal-post');
    this.counter = cab.querySelector('.signal-readout span');
    cab.querySelector('.signal-go').onclick = () => this.drive(true);
    cab.querySelector('.signal-brake').onclick = () => this.drive(false);
    cab.onkeydown = event => {
      if (event.target !== cab || ![' ','ArrowRight','ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) this.drive(event.key === 'ArrowRight' || (event.key === ' ' && !this.power));
    };
    const sound = this.root.querySelector('.railway-sound');
    if (sound) sound.onclick = () => {
      stationSound = !stationSound;
      sound.setAttribute('aria-pressed', stationSound);
    };
    cab.focus({preventScroll:true});
    this.drawTrain();
    let time;
    const tick = now => {
      if (!cab.isConnected || this.done) return;
      if (time !== undefined && !document.hidden) this.advance(Math.min((now-time)/1000, .05));
      time = now;
      if (!this.done) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  drive(power) {
    if (this.done || this.power === power) return;
    this.power = power;
    if (power) {
      this.status.textContent = this.cued && !this.clear ? 'Brake at red.' : (this.crossing ? 'Listen…' : 'Watch the next signal.');
      boardClack();
    } else hiss(.25, .035);
  }

  advance(dt) {
    if (!this.power && this.speed === 0) return;
    const gate = this.gates[this.gate];
    const playground = this.routes[this.round] === 3;
    this.speed = this.power ? Math.min(13,this.speed+22*dt) : Math.max(0,this.speed-36*dt);
    this.position += this.speed*dt;

    if (gate !== undefined && !this.clear && this.position >= gate-22 && !this.cued) {
      this.cued = true;
      this.status.textContent = playground ? 'Whistle! Freeze.' : 'Coach says stop.';
      this.posts[this.gate].classList.add('calling');
      if (playground) whistle();
      else boardClack();
    }

    if (gate !== undefined && this.position >= gate) {
      if (!this.clear) {
        this.position = gate-22;
        this.speed = 0;
        this.power = false;
        if (this.crossing) {
          this.cued = false;
          this.posts[this.gate].classList.remove('calling');
        }
        this.status.textContent = this.crossing ? 'Too late. Try again.' : 'Try again. Go, then brake at red.';
        this.drawTrain();
        return;
      }
      this.gate++;
      this.clear = false;
      this.cued = false;
      this.status.textContent = this.gate < this.gates.length ? 'Watch the next signal.' : 'Head to the station.';
    }

    if (gate !== undefined && this.cued && !this.clear && !this.power && this.speed === 0) {
      this.clear = true;
      this.posts[this.gate].classList.add('cleared');
      this.status.textContent = `${this.reminder} ${this.crossing ? 'Go.' : playground ? 'Go to the line.' : 'Coach says go!'}`;
      this.counter.textContent = this.crossing ? '✓' : `${this.gate+1} / ${this.gates.length} stops`;
      stationBell();
    }
    if (this.position >= 96) {
      this.position = 96;
      this.done = true;
      this.power = false;
      this.status.textContent = this.reminder;
      earnStamp(playground ? 'playground' : 'pe');
      railwayStops[this.routes[this.round]].sound();
      this.after(2200, () => {
        this.round++;
        if (this.round === this.routes.length) this.finish('Both runs complete!');
        else this.openRun();
      });
    }
    this.drawTrain();
  }

  drawTrain() {
    this.engine.style.setProperty('--mile', this.position + '%');
    this.engine.classList.toggle('rolling', this.speed > 0 && !this.done);
  }
}
