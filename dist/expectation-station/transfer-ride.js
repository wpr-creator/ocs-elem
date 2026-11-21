'use strict';

const transferStops = [
  {name:'Classroom', label:'Follow the teacher’s directions', feedback:'You followed directions.', color:'#558275'},
  {name:'Playground', label:'Freeze at the whistle', feedback:'You froze at the whistle.', color:'#9e6650'},
  {name:'Lunch car', label:'Stack the clean tray', feedback:'You put the tray away.', color:'#82705e'}
];

class RideTransfer extends CleanupRun {
  start() {
    this.queue = shuffleGame([0,1,2]);
    this.round = 0;
    this.done = false;
    this.root.innerHTML = `<div class="transfer-pixel">
      <div class="lunch-call"><h2 tabindex="-1">Match the stop.</h2></div>
      <div class="transfer-desk">
        <button class="transfer-ticket" data-piece="ticket" type="button">
          <canvas width="112" height="70" aria-hidden="true"></canvas>
        </button>
        <div class="transfer-platforms">
          ${transferStops.map((stop,i)=>`<button type="button" data-bin="${i}"><span aria-hidden="true">${['01','04','05'][i]}</span>${stop.name}</button>`).join('')}
        </div>
      </div>
      <div class="transfer-line" role="img" aria-label="0 cars coupled">
        <div class="transfer-engine" aria-hidden="true"><i></i></div>
        <div class="transfer-cars" aria-hidden="true"></div>
      </div>
      <p class="lunch-message" role="status"></p>
    </div>`;
    this.ticket = this.root.querySelector('.transfer-ticket');
    this.bindCleanupDrag(this.ticket);
    this.ticket.onclick = () => this.root.querySelector('[data-bin]').focus();
    this.root.querySelectorAll('[data-bin]').forEach(button => {
      button.onclick = () => this.drop('ticket',button);
    });
    this.showTicket();
    this.root.querySelector('h2').focus({preventScroll:true});
  }

  showTicket() {
    const index = this.queue[this.round];
    this.ticket.setAttribute('aria-label',transferStops[index].label);
    paintTransferTicket(this.ticket.querySelector('canvas'),index);
  }

  pick() {
    return !this.done;
  }

  drop(id,target) {
    if (this.done || id !== 'ticket') return;
    const index = this.queue[this.round];
    const status = this.root.querySelector('[role="status"]');
    if (Number(target.dataset.bin) !== index) {
      status.textContent = 'Try another stop.';
      return;
    }
    this.done = true;
    target.classList.add('transfer-hit');
    const cars = this.root.querySelector('.transfer-cars');
    const car = document.createElement('i');
    car.style.setProperty('--car-color',transferStops[index].color);
    cars.append(car);
    this.root.querySelector('.transfer-line').setAttribute('aria-label',`${cars.children.length} cars coupled`);
    status.textContent = transferStops[index].feedback;
    boardClack();
    this.after(1300, () => {
      this.round++;
      if (this.round === this.queue.length) {
        earnStamp('station-match');
        stationBell();
        status.textContent = 'Train complete!';
        this.ticket.hidden = true;
        this.root.querySelector('.transfer-platforms').hidden = true;
        this.root.querySelector('h2').textContent = 'All aboard!';
        const exit = document.createElement('a');
        exit.className = 'timetable-games transfer-exit';
        exit.href = '#destinations';
        exit.textContent = 'Falcon Central';
        status.after(exit);
        exit.focus({preventScroll:true});
        return;
      }
      target.classList.remove('transfer-hit');
      this.done = false;
      this.showTicket();
      this.ticket.focus({preventScroll:true});
    });
  }
}

function paintTransferTicket(canvas, index) {
  const ctx = canvas.getContext('2d');
  const rect = (x,y,w,h,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
  };
  rect(0,0,112,70,'#25352c');
  rect(3,3,106,64,'#ebd39d');
  rect(6,6,100,58,'#c0aa75');
  if (index === 0) {
    // Chalkboard, teacher pointing, and a student with an open book.
    rect(10,11,53,27,'#664c32');
    rect(13,13,47,22,'#365c4b');
    rect(18,18,32,2,'#c2ceb2');
    rect(18,23,25,2,'#c2ceb2');
    rect(18,28,13,2,'#c2ceb2');
    rect(72,17,12,12,'#725039');
    rect(74,20,9,9,'#d9a36d');
    rect(68,30,22,25,'#55796b');
    rect(54,31,15,4,'#d9a36d');
    rect(50,29,5,4,'#d9a36d');
    rect(24,42,11,10,'#754f36');
    rect(20,51,19,10,'#567b71');
    rect(15,56,34,5,'#6b5036');
    rect(36,50,9,5,'#f9e6b4');
  } else if (index === 1) {
    // Whistle and a red stop hand at the playground fence.
    rect(8,8,96,26,'#78a295');
    rect(8,34,96,28,'#778052');
    for (let x=9;x<105;x+=8) rect(x,42,2,15,'#ccb982');
    rect(10,47,94,2,'#ccb982');
    rect(14,27,22,13,'#bc8656');
    rect(17,22,16,7,'#d9af72');
    rect(29,32,18,5,'#744e36');
    rect(18,30,8,7,'#263832');
    rect(48,23,10,2,'#fff0bd');
    rect(48,28,14,2,'#fff0bd');
    rect(66,14,29,38,'#a45342');
    rect(74,28,14,16,'#ffdc9c');
    for (let x=74;x<87;x+=4) rect(x,20+(x%3),3,14,'#ffdc9c');
    rect(71,29,5,9,'#ffdc9c');
  } else {
    // Lift a clean cafeteria tray onto the stack.
    rect(10,10,94,52,'#ab8b5a');
    rect(19,19,74,40,'#6e5439');
    rect(22,22,68,31,'#435d4a');
    for(let y=38;y<=49;y+=5){
      rect(50,y,31,4,'#ccb887');
      rect(52,y,28,1,'#f8df9d');
    }
    rect(23,30,24,5,'#dfcc9e');
    rect(25,31,18,2,'#8a805f');
    rect(32,35,7,6,'#c28759');
    rect(26,41,13,6,'#577f75');
    rect(47,31,13,2,'#f2cb76');
    rect(56,28,2,8,'#f2cb76');
  }
}
