'use strict';

const lunchStages = [
  {name:'Scrape the tray.', tool:'Scraper', shape:'scraper', done:'You cleared the scraps.'},
  {name:'Stack the tray.', tool:'Tray', shape:'tray', done:'You put the tray away.'},
  {name:'Wipe the spill.', tool:'Sponge', shape:'sponge', done:'You kept the lunch area clean.'}
];

class RideLunch extends CleanupRun {
  start() {
    this.round = 0;
    this.openTask();
  }

  openTask() {
    const mode = lunchStages[this.round];
    this.done = false;
    this.cleaned = new Set();
    const stack = mode.shape === 'tray';
    this.root.innerHTML = `<div class="lunch-pixel lunch-${mode.shape}">
      <div class="lunch-windows" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="lunch-call"><h2 tabindex="-1">${mode.name}</h2><span aria-label="Task ${this.round+1} of 3">${'■'.repeat(this.round+1)}${'□'.repeat(2-this.round)}</span></div>
      <div class="lunch-counter">
        ${stack
          ? '<button class="lunch-rack" type="button" data-bin="rack">Tray rack</button>'
          : `<div class="lunch-work ${mode.shape === 'scraper' ? 'lunch-dirty-tray' : 'lunch-spill'}">
            ${[0,1,2].map(i=>`<button class="lunch-patch" type="button" data-patch="${i}" aria-label="${mode.shape === 'scraper' ? 'Scrape scraps' : 'Wipe spill'} ${i+1}"></button>`).join('')}
          </div>`}
        <button class="lunch-tool" type="button" data-piece="tool" aria-label="${mode.tool}"><span aria-hidden="true"></span><b>${mode.tool}</b></button>
      </div>
      <p class="lunch-message" role="status"></p>
    </div>`;
    const tool = this.root.querySelector('.lunch-tool');
    this.bindCleanupDrag(tool);
    tool.onclick = () => {
      if (this.done) return;
      this.pick('tool');
      this.root.querySelector('[data-bin],[data-patch]:not(.lunch-clean)')?.focus();
    };
    const targets = this.root.querySelectorAll('[data-bin],[data-patch]');
    targets.forEach(target => target.onclick = () => this.drop('tool', target));
    this.root.querySelector('h2').focus({preventScroll:true});
  }

  pick() {
    return !this.done;
  }

  sweeps() {
    return lunchStages[this.round].shape !== 'tray';
  }

  drop(id, target) {
    if (this.done || id !== 'tool' || !target.isConnected) return;
    const {patch, bin} = target.dataset;
    const mode = lunchStages[this.round];
    const stack = mode.shape === 'tray';
    if (stack ? bin !== 'rack' : patch === undefined) return;
    const marker = stack ? bin : patch;
    if (this.cleaned.has(marker)) return;
    this.cleaned.add(marker);
    target.classList.add('lunch-clean');
    target.setAttribute('aria-disabled','true');
    if (!stack) hiss(.09,.025);
    if (this.cleaned.size < (stack ? 1 : 3)) return;

    this.done = true;
    if (stack) boardClack();
    this.root.querySelector('.lunch-tool').classList.add('lunch-tool-used');
    this.root.querySelector('.lunch-message').textContent = mode.done;
    this.after(1400, () => {
      this.round++;
      if (this.round < lunchStages.length) {
        this.openTask();
        return;
      }
      earnStamp('cafeteria');
      railwayStops[4].sound();
      this.root.innerHTML = `<div class="arcade-win ride-arrival">
        <h2 tabindex="-1">Lunch car clean!</h2>
        <a class="timetable-games" href="#destinations">Falcon Central</a>
      </div>`;
      this.root.querySelector('h2').focus({preventScroll:true});
    });
  }
}
