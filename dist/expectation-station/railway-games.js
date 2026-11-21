'use strict';

class RailwayGame {
  constructor(root, config, index) {
    this.root = root;
    this.config = config;
    this.index = index;
  }

  start() {
    this.round = 0;
    this.draw();
  }

  meter(count) {
    return `<div class="arcade-meter" role="img" aria-label="${count} of 3 complete"><i class="progress-engine" aria-hidden="true"></i>${[0,1,2].map(i =>
      `<span aria-hidden="true" class="${i < count ? 'filled' : ''}">${i < count ? '✓' : ''}</span>`).join('')}</div>`;
  }

  draw() {
    const scene = this.config.rounds[this.round];
    this.scene = scene;
    this.step = 0;
    this.finished = false;
    this.deliveries = new Set();
    this.track = scene.track?.map(tile => tile && {...tile});
    this.cargo = scene.cargo ? shuffleGame(scene.cargo) : [];
    this.sequence = scene.spots.map((_, i) => i);
    if (this.index === 0 && scene.mode === 'order') this.sequence = shuffleGame(this.sequence);
    const spots = scene.spots.map((spot, i) => ({...spot, i}));
    const layout = scene.mode === 'signal' ? spots : shuffleGame(spots);
    this.orderOpen = scene.mode === 'order';
    const length = this.track ? 1 : this.cargo.length || scene.signals?.length || this.sequence.length;
    const waybill = this.orderOpen ? `<div class="play-waybill"><ol>${this.sequence.map(i => `<li><span aria-hidden="true">${scene.spots[i].icon}</span> ${escapeGame(scene.spots[i].label)}</li>`).join('')}</ol></div>` : '';
    this.root.innerHTML = `<div class="play-instruction"><h2 tabindex="-1">${escapeGame(scene.cue)}</h2>
      ${scene.mode === 'move' ? '<p>Drag it or tap where it goes.</p>' : ''}</div>
    <div class="arcade-scene playfield playfield-${scene.mode}" style="--scene:url('${arcadeArt(this.index)}')">
      ${this.meter(this.round)}
      <div class="falcon-value"><b aria-hidden="true">${scene.value[0]}</b> ${scene.value}</div>
      <div class="railway-effect" aria-hidden="true"></div>
      <div class="playfield-objects">
        <div class="round-steps" role="img" aria-label="0 of ${length} actions"><b aria-hidden="true">🚂</b>${Array.from({length}, () => '<span aria-hidden="true"></span>').join('')}</div>
        ${scene.mode === 'move' ? '<div class="play-piece" aria-hidden="true"></div>' : ''}
        ${scene.mode === 'signal' ? '<div class="play-signal"><i></i><strong></strong></div>' : ''}
        ${waybill}
        ${this.track ? `<div class="track-layout">
          <span class="track-depart">🚂 Start</span>
          <div class="track-grid">${this.track.map((tile, i) => tile
            ? `<button class="track-tile" type="button" data-track="${i}"></button>`
            : '<span class="track-water" aria-hidden="true">≈</span>').join('')}</div>
          <span class="track-arrive">Finish ⚑</span>
        </div>` : ''}
        ${scene.mode === 'order' ? '<button type="button" class="waybill-toggle">Hide &amp; play</button>' : ''}
        <div class="play-targets" ${this.orderOpen ? 'hidden' : ''}>${layout.map(spot => `<button type="button" class="play-target" data-target="${spot.i}">
          <span aria-hidden="true">${spot.icon}</span><strong>${escapeGame(spot.label)}</strong>
        </button>`).join('')}</div>
      </div>
    </div>
    <div class="arcade-console play-console">
      <div class="arcade-tools"><p class="arcade-feedback" role="status"></p>
        <div class="railway-audio"><button class="arcade-listen" type="button">Read aloud</button>
        <button class="arcade-listen railway-sound" type="button" aria-pressed="${stationSound}">Sound</button></div></div>
    </div>`;
    this.root.querySelectorAll('[data-target]').forEach(button => {
      button.onclick = () => this.act(button);
    });
    const sound = this.root.querySelector('.railway-sound');
    sound.onclick = () => {
      stationSound = !stationSound;
      sound.setAttribute('aria-pressed', stationSound);
      if (stationSound) railwayStops[this.index].sound();
    };
    this.root.querySelector('.arcade-listen').onclick = () => this.read();
    this.root.querySelector('.arcade-listen').hidden = !('speechSynthesis' in window);
    if (scene.mode === 'move') {
      this.showCargo();
      this.bindDrag();
    }
    if (scene.mode === 'signal') this.showSignal();
    if (this.orderOpen) this.root.querySelector('.waybill-toggle').onclick = () => this.toggleWaybill();
    if (this.track) this.bindTrack();
    this.focus();
  }

  bindTrack() {
    const buttons = this.root.querySelectorAll('[data-track]');
    buttons.forEach(button => {
      const i = Number(button.dataset.track);
      this.paintTrack(button, i);
      button.onclick = () => {
        if (this.finished) return;
        this.track[i].turn = (this.track[i].turn + 1) % 4;
        this.paintTrack(button, i);
        this.feedback('Keep trying. Join the rails.');
        if (!this.connectedTrack()) return;
        buttons.forEach(tile => tile.classList.add('on-track'));
        this.root.querySelector('.round-steps span').classList.add('filled');
        this.completeRound();
      };
    });
  }

  trackPorts(i) {
    const tile = this.track[i];
    return tile ? tile.ports.map(port => (port + tile.turn) % 4) : [];
  }

  paintTrack(button, i) {
    const sides = ['up','right','down','left'];
    const ports = this.trackPorts(i);
    button.setAttribute('aria-label', `Track ${i + 1}: ${ports.map(port => sides[port]).join(' and ')}. Turn.`);
    button.innerHTML = ports.map(port => `<i aria-hidden="true" class="track-arm track-arm-${port}"></i>`).join('');
  }

  connectedTrack() {
    // The train enters from the left of cell 3 and exits to the right of cell 2.
    let cell = 3;
    let entry = 3;
    const visited = new Set();
    while (!visited.has(cell)) {
      visited.add(cell);
      const ports = this.trackPorts(cell);
      if (!ports.includes(entry)) return false;
      const exit = ports.find(port => port !== entry);
      if (cell === 2 && exit === 1) return true;
      if ((exit === 1 && cell % 3 === 2) || (exit === 3 && cell % 3 === 0)) return false;
      cell += [-3,1,3,-1][exit];
      entry = (exit + 2) % 4;
    }
    return false;
  }

  bindDrag() {
    const piece = this.root.querySelector('.play-piece');
    piece.addEventListener('pointerdown', event => {
      if (this.finished || !event.isPrimary || event.button !== 0) return;
      piece.setPointerCapture(event.pointerId);
      const x = event.clientX;
      const y = event.clientY;
      const onMove = move => {
        piece.style.transform = `translate(${move.clientX-x}px,${move.clientY-y}px)`;
      };
      const stopDrag = end => {
        piece.removeEventListener('pointermove', onMove);
        piece.removeEventListener('lostpointercapture', stopDrag);
        piece.removeEventListener('pointerup', stopDrag);
        piece.style.transform = '';
        if (end.type !== 'pointerup') return;
        const target = document.elementsFromPoint(end.clientX, end.clientY)
          .map(element => element.closest('[data-target]')).find(element => element && this.root.contains(element));
        if (target) this.act(target);
      };
      piece.addEventListener('pointermove', onMove);
      piece.addEventListener('lostpointercapture', stopDrag);
      piece.addEventListener('pointerup', stopDrag);
    });
  }

  showSignal() {
    const current = this.scene.signals[this.step];
    const signal = this.root.querySelector('.play-signal');
    signal.classList.toggle('is-ready', current.to === 0);
    signal.querySelector('strong').textContent = current.label;
    this.feedback(current.label);
    if (this.index === 3 && current.to === 1) whistle();
    else boardClack();
  }

  showCargo() {
    const item = this.cargo[this.step];
    this.root.querySelector('.play-piece').innerHTML = `<span>${item.icon}</span>${escapeGame(item.label)}`;
    this.feedback(item.label);
  }

  toggleWaybill() {
    this.orderOpen = !this.orderOpen;
    this.root.querySelector('.play-waybill').hidden = !this.orderOpen;
    const targets = this.root.querySelector('.play-targets');
    targets.hidden = this.orderOpen;
    const toggle = this.root.querySelector('.waybill-toggle');
    toggle.textContent = this.orderOpen ? 'Hide & play' : 'Show directions';
    if (!this.orderOpen) targets.querySelector('button:not([aria-disabled="true"])').focus();
  }

  act(button) {
    if (this.finished || this.orderOpen || button.classList.contains('is-done')) return;
    const {mode, signals} = this.scene;
    const expected = mode === 'move' ? this.cargo[this.step].to
      : mode === 'signal' ? signals[this.step].to : this.sequence[this.step];
    const destination = Number(button.dataset.target);
    const correct = Array.isArray(expected) ? expected.includes(destination) && !this.deliveries.has(destination) : destination === expected;
    if (!correct) {
      this.feedback(mode === 'order' ? 'Check the directions and try again.' : mode === 'signal' ? 'Check the signal.' : 'Try another place.');
      return;
    }

    if (mode === 'order') {
      button.classList.add('is-done');
      button.setAttribute('aria-disabled', 'true');
    }
    if (mode === 'move') {
      const item = this.cargo[this.step];
      if (Array.isArray(expected)) {
        this.deliveries.add(destination);
        button.querySelector('strong').textContent = this.scene.spots[destination].label.replace('waiting', 'played');
        button.setAttribute('aria-disabled', 'true');
      }
      let tokens = button.querySelector('.loaded-tokens');
      if (!tokens) {
        tokens = document.createElement('small');
        tokens.className = 'loaded-tokens';
        tokens.setAttribute('aria-hidden', 'true');
        button.append(tokens);
      }
      tokens.textContent += item.icon;
    }
    button.classList.remove('on-hit');
    void button.offsetWidth;
    button.classList.add('on-hit');
    const progress = this.root.querySelector('.round-steps');
    const cars = progress.querySelectorAll('span');
    const car = cars[this.step];
    car.textContent = mode === 'move' ? this.cargo[this.step].icon : this.scene.spots[destination]?.icon || '✓';
    car.classList.add('filled');
    this.step++;
    progress.setAttribute('aria-label', `${this.step} of ${cars.length} actions`);
    if (this.step < cars.length) {
      if (mode === 'move') this.showCargo();
      if (mode === 'signal') this.showSignal();
      if (mode === 'order') this.feedback('✓ Next step');
      return;
    }
    if (mode === 'move') this.root.querySelector('.play-piece').classList.add('delivered');
    this.completeRound();
  }

  completeRound() {
    this.finished = true;
    this.root.querySelector('.round-steps').classList.add('is-departing');
    this.root.querySelector('.arcade-meter').outerHTML = this.meter(this.round + 1);
    const lesson = this.index === 0 ? (this.round === 2 ? ' · Supplies put away' : ' · Directions followed')
      : this.scene.mode === 'track' ? ' · You tried again' : '';
    this.feedback(`★ ${this.scene.value}${lesson}`);
    this.reward();
    this.after(1300, () => {
      window.speechSynthesis?.cancel();
      stationNarrating = false;
      this.round++;
      if (this.round === 3) this.finish();
      else this.draw();
    });
  }

  reward() {
    const {effect, motion, sound} = railwayStops[this.index];
    const overlay = this.root.querySelector('.railway-effect');
    overlay.textContent = effect;
    overlay.classList.add('railway-effect-' + motion);
    sound();
  }

  after(delay, callback) {
    setTimeout(() => {
      if (this.root.isConnected) callback();
    }, delay);
  }

  feedback(text) {
    this.root.querySelector('.arcade-feedback').textContent = text;
  }

  focus() {
    const heading = this.root.querySelector('h2');
    heading.focus({preventScroll:true});
    if (heading.getBoundingClientRect().bottom > window.innerHeight) {
      this.root.scrollIntoView({block:'nearest', behavior:'instant'});
    }
  }

  read() {
    speechSynthesis.cancel();
    const {value, cue, spots, expectation} = this.scene;
    const detail = this.scene.mode === 'move' ? [this.cargo[this.step]?.label]
      : this.scene.mode === 'signal' ? [this.scene.signals[this.step]?.label]
      : this.orderOpen ? this.sequence.map(i => spots[i].label) : [];
    const lines = [value, cue, ...detail, expectation].filter(Boolean);
    const utterance = new SpeechSynthesisUtterance(lines.join('. '));
    utterance.rate = .8;
    stationNarrating = true;
    utterance.onend = utterance.onerror = () => { stationNarrating = false; };
    speechSynthesis.speak(utterance);
  }

  finish() {
    earnStamp(this.config.id);
    this.root.innerHTML = `<div class="arcade-win"><span aria-hidden="true">✦</span>
      <h2 tabindex="-1">You earned a stamp!</h2>
      <p>${passportCount()} of 12 passport stamps</p>
      <div class="arcade-win-actions"><button class="arcade-listen replay" type="button">Play again</button></div>
    </div>`;
    this.root.querySelector('.replay').onclick = () => this.start();
    this.focus();
  }
}
