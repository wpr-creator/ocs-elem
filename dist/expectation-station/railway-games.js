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
    this.ready = false;
    const spots = scene.spots.map((spot, i) => ({...spot, i}));
    const layout = scene.mode === 'signal' ? spots : shuffleGame(spots);
    this.root.innerHTML = `<div class="play-instruction"><h2 tabindex="-1">${escapeGame(scene.cue)}</h2>
      ${scene.mode === 'move' ? '<p>Drag or tap a spot.</p>' : ''}</div>
    <div class="arcade-scene playfield playfield-${scene.mode}" style="--scene:url('${arcadeArt(this.index)}')">
      ${this.meter(this.round)}
      <div class="falcon-value"><b aria-hidden="true">${scene.value[0]}</b> ${scene.value}</div>
      <div class="railway-effect" aria-hidden="true"></div>
      <div class="playfield-objects">
        ${scene.piece ? `<div class="play-piece" aria-hidden="true"><span>${scene.piece.icon}</span>${escapeGame(scene.piece.label)}</div>` : ''}
        ${scene.mode === 'signal' ? '<div class="play-signal"><i></i><strong>Wait…</strong></div>' : ''}
        <div class="play-targets">${layout.map(spot => `<button type="button" class="play-target" data-target="${spot.i}">
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
    if (scene.mode === 'move') this.bindDrag();
    if (scene.mode === 'signal') this.after(1400, () => this.showSignal());
    this.focus();
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
    this.ready = true;
    const signal = this.root.querySelector('.play-signal');
    signal.classList.add('is-ready');
    signal.querySelector('strong').textContent = this.scene.ready;
    this.feedback(this.scene.ready);
    if (this.index === 3 && this.round === 0) whistle();
    else stationBell();
  }

  act(button) {
    if (this.finished || button.classList.contains('is-done')) return;
    const {mode, spots} = this.scene;
    if (mode === 'signal' && !this.ready) {
      this.feedback('Wait for the signal.');
      return;
    }
    if (Number(button.dataset.target) !== this.step) {
      this.feedback(mode === 'order' ? 'Try a different step first.' : 'Try the other spot.');
      return;
    }

    button.classList.add('is-done');
    button.setAttribute('aria-disabled', 'true');
    this.step++;
    if (mode === 'order' && this.step < spots.length) {
      this.feedback('✓ Next step!');
      return;
    }
    if (mode === 'move') {
      const piece = this.root.querySelector('.play-piece');
      piece.classList.add('delivered');
      button.querySelector('span').textContent = this.scene.piece.icon;
    }
    this.finished = true;
    this.root.querySelector('.arcade-meter').outerHTML = this.meter(this.round + 1);
    this.feedback(`★ ${this.scene.value}`);
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
    const lines = [value, cue, ...spots.map(spot => spot.label), expectation];
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
