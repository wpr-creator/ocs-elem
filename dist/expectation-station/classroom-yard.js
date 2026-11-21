'use strict';

function yardNeighbor(cell, direction) {
  if ((direction === -1 && cell % 5 === 0) || (direction === 1 && cell % 5 === 4)) return -1;
  return cell + direction;
}

// A turn moves the engine one square. Tasks advance only when it arrives.
function driveClassroom(state, next) {
  const {shift, position, cargo, loaded, carried} = state;
  if (![1,-1,5,-5].some(dir => yardNeighbor(position, dir) === next) || shift.map.join('')[next] !== '+') {
    return 'Follow a rail beside your train.';
  }
  state.position = next;
  const pickup = cargo.find(item => item.at === next && !loaded.has(item));
  if (shift.sorting) {
    if (carried && next === carried.dock) {
      loaded.add(carried);
      state.carried = null;
      return carried.name + ' put away!';
    }
    if (pickup && !carried) {
      state.carried = pickup;
      return 'On board: ' + pickup.name;
    }
    if (pickup && carried !== pickup) return 'Put away the ' + carried.name.toLowerCase() + ' first.';
    const dock = cargo.find(item => item.dock === next);
    if (dock && carried) return 'This is the ' + dock.place.toLowerCase() + '.';
  } else if (pickup) {
    if (cargo[loaded.size] !== pickup) return 'Check the teacher’s order.';
    loaded.add(pickup);
    return 'On board: ' + pickup.name;
  }

  if (next === shift.finish) {
    if (loaded.size < cargo.length) return 'Finish loading before you park.';
    state.complete = true;
    return 'Train parked. Directions followed!';
  }
  return '';
}

class ClassroomYard extends RailwayGame {
  start() {
    this.round = 0;
    this.openShift();
  }

  openShift() {
    const shift = this.config.rounds[this.round];
    this.state = {
      shift, cargo:shift.sorting ? shift.cargo : shuffleGame(shift.cargo),
      position:shift.start, loaded:new Set(), carried:null, complete:false
    };
    this.root.innerHTML = `<div class="yard-heading">
      <div><span class="yard-value">${shift.sorting ? 'O · ORGANIZATION' : 'F · FOCUS'}</span><h2>${shift.cue}</h2></div>
      <span class="yard-shift">Run ${this.round + 1} / 3</span>
    </div>
    <div class="yard-ticket">
      <div class="yard-directions" ${shift.sorting ? 'hidden' : ''}></div>
      <button type="button" class="yard-order" ${shift.sorting ? 'hidden' : ''}>Hide directions</button>
      <span class="yard-inventory" aria-live="polite"></span>
    </div>
    <p class="arcade-feedback action-reminder" role="status"></p>
    <div class="yard-surface">
      <div class="yard-grid" tabindex="0" role="group" aria-label="Classroom railway. Use arrow keys to drive." aria-describedby="yard-controls">
        ${shift.map.join('').split('').map((tile, i) => this.tile(tile, i)).join('')}
        <span class="yard-engine" aria-hidden="true"><span class="yard-locomotive">🚂</span><small class="yard-load"></small></span>
      </div>
    </div>
    <div class="yard-footer">
      <p id="yard-controls">Tap the next rail or use arrow keys.</p>
      <button type="button" class="arcade-listen railway-sound" aria-pressed="${stationSound}">Sound</button>
    </div>`;
    this.root.querySelector('.yard-order').onclick = () => this.toggleDirections();
    const grid = this.root.querySelector('.yard-grid');
    grid.onclick = event => {
      const cell = event.target.closest('[data-yard]');
      if (cell) this.move(Number(cell.dataset.yard));
    };
    grid.onkeydown = event => {
      const directions = {ArrowUp:-5, ArrowRight:1, ArrowDown:5, ArrowLeft:-1};
      if (!(event.key in directions)) return;
      event.preventDefault();
      this.move(yardNeighbor(this.state.position, directions[event.key]));
    };
    const sound = this.root.querySelector('.railway-sound');
    sound.onclick = () => {
      stationSound = !stationSound;
      sound.setAttribute('aria-pressed', stationSound);
    };
    this.paint();
    grid.focus({preventScroll:true});
  }

  tile(tile, i) {
    if (tile !== '+') return '<span class="yard-desk" aria-hidden="true"></span>';
    const rails = [-5,1,5,-1].map((direction,j) => this.state.shift.map.join('')[yardNeighbor(i,direction)] === '+'
      ? `<i class="yard-rail yard-rail-${j}"></i>` : '').join('');
    return `<span class="yard-cell" data-yard="${i}" aria-hidden="true">${rails}<span class="yard-prop"></span><span class="yard-dock-label"></span></span>`;
  }

  toggleDirections() {
    const directions = this.root.querySelector('.yard-directions');
    directions.hidden = !directions.hidden;
    this.root.querySelector('.yard-order').textContent = directions.hidden ? 'Check directions' : 'Hide directions';
    this.root.querySelector('.yard-grid').focus({preventScroll:true});
  }

  paint() {
    const {shift, cargo, position, carried, loaded, complete} = this.state;
    const grid = this.root.querySelector('.yard-grid');
    this.root.querySelector('.yard-directions').textContent = 'Teacher’s order: ' + cargo.map(item => item.icon + ' ' + item.name).join(' → ');
    this.root.querySelector('.yard-inventory').textContent = carried ? 'On board: ' + carried.icon + ' ' + carried.name
      : loaded.size === cargo.length ? 'Park at the flag.' : loaded.size + ' / ' + cargo.length + ' ' + (shift.sorting ? 'put away' : 'loaded');
    grid.setAttribute('aria-label', `Classroom railway. Row ${Math.floor(position / 5) + 1}, column ${position % 5 + 1}. ${cargo.filter(item=>!loaded.has(item)).map(item=>
      `${item.name} at row ${Math.floor(item.at/5)+1}, column ${item.at%5+1}${shift.sorting?`; ${item.place} at row ${Math.floor(item.dock/5)+1}, column ${item.dock%5+1}`:''}`).join('. ')}. Flag at row ${Math.floor(shift.finish/5)+1}, column ${shift.finish%5+1}.`);
    for (const cell of grid.querySelectorAll('[data-yard]')) {
      const i = Number(cell.dataset.yard);
      const object = cargo.find(item => item.at === i && !loaded.has(item) && item !== carried);
      const dock = cargo.find(item => item.dock === i);
      const prop = cell.querySelector('.yard-prop');
      prop.textContent = i === shift.finish ? '⚑' : object?.icon || dock?.mark || '';
      cell.title = i === shift.finish ? 'Park here' : object?.name || dock?.place || '';
      cell.querySelector('.yard-dock-label').textContent = dock?.place || '';
      cell.classList.toggle('yard-next', !complete && [-5,1,5,-1].some(dir => yardNeighbor(position,dir) === i));
      cell.classList.toggle('yard-park', i === shift.finish && loaded.size === cargo.length);
    }
    const engine = grid.querySelector('.yard-engine');
    engine.style.setProperty('--yard-x', position % 5);
    engine.style.setProperty('--yard-y', Math.floor(position / 5));
    engine.querySelector('.yard-load').textContent = carried?.icon || '';
  }

  move(next) {
    const state = this.state;
    if (state.complete) return;
    const previous = state.position;
    const loaded = state.loaded.size;
    const message = driveClassroom(state, next);
    if (previous !== state.position && !state.shift.sorting && !this.root.querySelector('.yard-directions').hidden) {
      if (previous === state.shift.start) this.toggleDirections();
    }
    if (previous !== state.position) {
      const heading = state.position - previous;
      if (Math.abs(heading) === 1) this.root.querySelector('.yard-locomotive').classList.toggle('heading-right', heading > 0);
      tone(180, .06, 'triangle', .018);
      this.paint();
    }
    if (state.loaded.size > loaded) {
      this.feedback(state.shift.sorting ? message + ' Supplies belong in their places.' : message + ' You followed the order.');
    } else if (message) this.feedback(message);
    if (!state.complete) return;
    this.root.querySelector('.yard-engine').classList.add('yard-arrived');
    this.feedback(state.shift.reminder);
    railwayStops[0].sound();
    this.after(2200, () => {
      this.round++;
      if (this.round === this.config.rounds.length) this.finish();
      else this.openShift();
    });
  }
}
