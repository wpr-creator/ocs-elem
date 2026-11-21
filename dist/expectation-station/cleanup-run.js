'use strict';

const cleanupBins = {
  trash:{label:'Trash',icon:'🗑️'},
  scraps:{label:'Food scraps',icon:'🍎'},
  stack:{label:'Tray rack',icon:'🍽️'}
};

class CleanupRun extends RailwayGame {
  start() {
    this.round = 0;
    this.routes = this.index === 4 ? [4,2] : [2,4];
    this.openCar();
  }

  openCar() {
    this.stop = this.routes[this.round];
    main.querySelector('.arcade-nav a[href^="#stop/"]').href = `#stop/${this.stop+1}`;
    const game = arcadeCatalog()[this.stop];
    this.scene = game.rounds[0];
    this.stamp = game.id;
    this.picked = null;
    this.cleaned = new Set();
    this.done = false;
    this.bins = [...new Set(this.scene.pieces.map(piece => piece.bin))];
    this.root.innerHTML = `<div class="yard-heading"><div><span class="yard-value">C · CITIZENSHIP</span><h2>${escapeGame(this.scene.cue)}</h2></div><span class="yard-shift">${this.round+1} / 2</span></div>
    <div class="cleanup-car">
      <div class="cleanup-windows" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="cleanup-bins">${this.bins.map(id => `<button type="button" data-bin="${id}"><span aria-hidden="true">${cleanupBins[id].icon}</span>${cleanupBins[id].label}</button>`).join('')}</div>
      <div class="cleanup-floor">
        ${this.scene.pieces.map(piece => `<button type="button" class="cleanup-piece ${piece.after ? 'cleanup-tray' : ''}" data-piece="${piece.id}" style="--col:${piece.col};--row:${piece.row}" aria-label="${piece.label}" aria-pressed="false"><span aria-hidden="true">${piece.icon}</span></button>`).join('')}
        <div class="cleanup-spill" role="group" aria-label="${this.scene.spill} spill">${[0,1,2].map(i => `<button class="cleanup-patch" data-patch="${i}" type="button" aria-label="Wipe ${this.scene.spill.toLowerCase()} spot ${i+1}"></button>`).join('')}</div>
      </div>
    </div>
    <div class="cleanup-tools">
      <button class="cleanup-sponge" data-piece="sponge" type="button" aria-pressed="false">🧽 Sponge</button>
      <span class="cleanup-count"></span>
      <button class="arcade-listen railway-sound" type="button" aria-pressed="${stationSound}">Sound</button>
    </div>
    <div class="signal-footer"><p class="arcade-feedback" role="status">Drag a piece, or pick it and tap where it goes.</p></div>
    <div class="signal-footer"><details><summary>School expectation</summary><p>${escapeGame(this.scene.expectation)}</p></details></div>`;

    this.root.querySelectorAll('[data-piece]').forEach(button => {
      button.onclick = event => {
        const id = button.dataset.piece;
        if (this.pick(id) && event.detail === 0) {
          this.root.querySelector(id === 'sponge' ? '[data-patch]:not(.is-wiped)' : '[data-bin]')?.focus();
        }
      };
      this.bindCleanupDrag(button);
    });
    this.root.querySelectorAll('[data-bin],[data-patch]').forEach(button => {
      button.onclick = () => this.drop(this.picked, button);
    });
    const sound = this.root.querySelector('.railway-sound');
    sound.onclick = () => {
      stationSound = !stationSound;
      sound.setAttribute('aria-pressed', stationSound);
    };
    this.progress();
    const heading = this.root.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }

  pick(id, talk = true) {
    if (this.done || this.cleaned.has(id)) return false;
    const piece = this.scene.pieces.find(item => item.id === id);
    if (piece?.after && !this.cleaned.has(piece.after)) {
      this.feedback('Scrape the food off first.');
      return false;
    }
    this.picked = id;
    this.root.querySelectorAll('[data-piece]').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.piece === id);
    });
    if (talk) this.feedback(id === 'sponge' ? 'Wipe the spill.' : piece.label);
    return true;
  }

  bindCleanupDrag(button) {
    button.onpointerdown = event => {
      if (!event.isPrimary || event.button !== 0 || !this.pick(button.dataset.piece, false)) return;
      const id = button.dataset.piece;
      const start = {x:event.clientX,y:event.clientY};
      let moved = false;
      const seek = pointer => document.elementsFromPoint(pointer.clientX,pointer.clientY).map(element =>
        element.closest('[data-bin],[data-patch]')).find(target => target && this.root.contains(target));
      const move = pointer => {
        const x = pointer.clientX-start.x;
        const y = pointer.clientY-start.y;
        if (Math.abs(x)+Math.abs(y)<5 && !moved) return;
        moved = true;
        button.style.transform = `translate(${x}px,${y}px)`;
        button.classList.add('being-dragged');
        const target = seek(pointer);
        if (id === 'sponge' && target?.dataset.patch !== undefined) this.drop(id, target);
      };
      const end = pointer => {
        button.removeEventListener('pointermove',move);
        button.removeEventListener('pointerup',end);
        button.removeEventListener('lostpointercapture',end);
        button.style.transform = '';
        button.classList.remove('being-dragged');
        const target = pointer.type === 'pointerup' && moved ? seek(pointer) : null;
        if (target) this.drop(id,target);
      };
      button.setPointerCapture(event.pointerId);
      button.addEventListener('pointermove',move);
      button.addEventListener('pointerup',end);
      button.addEventListener('lostpointercapture',end);
    };
  }

  drop(id, target) {
    if (this.done) return;
    if (!id) {
      this.feedback('Pick something up first.');
      return;
    }
    const {patch, bin} = target.dataset;
    if (id === 'sponge' && patch !== undefined) {
      const mark = 'spot-' + patch;
      if (this.cleaned.has(mark)) return;
      this.cleaned.add(mark);
      target.classList.add('is-wiped');
      target.setAttribute('aria-disabled','true');
      hiss(.12,.04);
      this.feedback('Spot wiped!');
    } else {
      const piece = this.scene.pieces.find(item => item.id === id);
      if (!piece || piece.bin !== bin) {
        this.feedback(patch !== undefined ? 'Use the sponge on the spill.' : 'Try a different bin.');
        return;
      }
      if (this.cleaned.has(id)) return;
      this.cleaned.add(id);
      this.root.querySelector(`[data-piece="${id}"]`).hidden = true;
      this.picked = null;
      target.classList.remove('cleanup-bump');
      void target.offsetWidth;
      target.classList.add('cleanup-bump');
      boardClack();
      this.feedback(piece.label + ' put away!');
    }

    this.progress();
    if (this.cleaned.size !== this.scene.pieces.length + 3) return;
    this.done = true;
    this.root.querySelector('.cleanup-car').classList.add('cleanup-depart');
    this.feedback('Citizenship · Clean car ready to go!');
    earnStamp(this.stamp);
    railwayStops[this.stop].sound();
    this.after(1250, () => {
      this.round++;
      if (this.round === this.routes.length) this.finish('Both cars clean!');
      else this.openCar();
    });
  }

  progress() {
    this.root.querySelector('.cleanup-count').textContent = `${this.cleaned.size} / ${this.scene.pieces.length + 3} clean`;
  }
}
