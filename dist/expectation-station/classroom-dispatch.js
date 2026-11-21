'use strict';

const dispatchCargo = [
  {name:'Book', shape:'book'},
  {name:'Pencil', shape:'pencil'},
  {name:'Crayons', shape:'crayons'}
];
const dispatchStops = ['Reading','Writing','Art'];
class ClassroomDispatch extends RailwayGame {
  start() {
    this.round = 0;
    this.enterJob();
  }

  enterJob() {
    this.job = this.config.rounds[this.round];
    this.load = null;
    this.busy = false;
    this.root.innerHTML = `<div class="dispatch-game">
      <div class="dispatch-call"><div><span>TEACHER CALL</span><h2>${this.job.cue}</h2></div><span>${this.round+1} / ${this.config.rounds.length}</span></div>
      <div class="dispatch-world">
        <canvas width="320" height="200" aria-hidden="true"></canvas>
        <div class="dispatch-supplies" aria-label="Supply cart">
          ${dispatchCargo.map((item,i)=>`<button type="button" data-load="${i}" aria-pressed="false">
            <span class="dispatch-icon dispatch-${item.shape}" aria-hidden="true"></span>${item.name}
          </button>`).join('')}
        </div>
        <div class="dispatch-destinations" aria-label="Classroom stations">
          ${dispatchStops.map((name,i)=>`<button type="button" data-platform="${i}">${name}</button>`).join('')}
        </div>
      </div>
      <p class="dispatch-status" role="status">Pick a supply. Send it to a station.</p>
    </div>`;
    this.canvas = this.root.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.status = this.root.querySelector('.dispatch-status');
    this.root.querySelectorAll('[data-load]').forEach(button => button.onclick = () => this.choose(Number(button.dataset.load)));
    this.root.querySelectorAll('[data-platform]').forEach(button => button.onclick = () => this.send(Number(button.dataset.platform)));
    this.paint(32,113);
    const heading = this.root.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }

  choose(index) {
    if (this.busy) return;
    this.load = index;
    this.root.querySelectorAll('[data-load]').forEach(button =>
      button.setAttribute('aria-pressed', Number(button.dataset.load) === index));
    this.status.textContent = dispatchCargo[index].name + ' aboard. Set the switch.';
    boardClack();
    this.paint(32,113);
  }

  send(platform) {
    if (this.busy) return;
    if (this.load === null) {
      this.status.textContent = 'Load a supply first.';
      return;
    }
    this.busy = true;
    this.status.textContent = 'Train to ' + dispatchStops[platform] + '…';
    const canvas = this.canvas;
    const end = [45,97,149][platform];
    let started;
    const drive = time => {
      if (!canvas.isConnected) return;
      started ??= time;
      const progress = Math.min(1,(time-started)/760);
      const x = 32 + progress*236;
      const y = 113 + (end-113)*Math.max(0,Math.min(1,(x-125)/64));
      this.paint(x,y,platform);
      if (progress < 1) requestAnimationFrame(drive);
      else this.arrive(platform);
    };
    requestAnimationFrame(drive);
  }

  arrive(platform) {
    if (platform !== this.job.stop || this.load !== this.job.cargo) {
      this.status.textContent = platform !== this.job.stop
        ? 'That train went to ' + dispatchStops[platform] + '. Check the teacher call.'
        : 'Right station. Try a different supply.';
      this.after(800, () => {
        this.busy = false;
        this.paint(32,113);
      });
      return;
    }
    this.status.textContent = this.job.reminder;
    railwayStops[0].sound();
    this.after(1450, () => {
      this.round++;
      if (this.round === this.config.rounds.length) this.finish();
      else this.enterJob();
    });
  }

  paint(x,y,platform) {
    const ctx = this.context;
    const rect = (left,top,width,height,color) => {
      ctx.fillStyle = color;
      ctx.fillRect(left,top,width,height);
    };
    const line = (points,width,color) => {
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      points.slice(1).forEach(point=>ctx.lineTo(...point));
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    rect(0,0,320,200,'#253a31');
    rect(0,12,320,157,'#a58652');
    rect(4,15,307,148,'#d6ba7e');
    for (let tile=16; tile<163; tile+=9) rect(4,tile,307,1,'#b0905b');
    for (let col=9;col<310;col+=40) {
      rect(col,3,11,18,'#61482e');
      rect(col+2,3,6,17,'#e2c68c');
    }
    const tracks = [45,97,149].map(end=>[[19,113],[125,113],[189,end],[274,end]]);
    tracks.forEach(points=>{
      line(points,12,'#6b4a2f');
      line(points,7,'#272e27');
      line(points,3,'#b99b62');
    });
    if (platform !== undefined) line(tracks[platform],2,'#f9db79');

    // Three classroom bays, individually drawn as pixel-art set pieces.
    for (const [i,top] of [30,82,134].entries()) {
      rect(205,top-14,100,28,'#694a2e');
      rect(208,top-15,96,25,['#52776e','#966844','#756286'][i]);
      rect(208,top+6,96,3,'#e0ba73');
      for(let j=0;j<3;j++){
        rect(214+j*20,top-10,13,12,'#282c25');
        rect(216+j*20,top-9,9,8,['#edcc89','#bdbda0','#dda989'][i]);
      }
    }
    rect(11,45,47,42,'#554130');
    rect(14,43,42,36,'#89663f');
    rect(17,46,36,30,'#2b4e43');
    rect(21,51,25,3,'#c7d4aa');
    rect(22,59,17,2,'#c7d4aa');
    rect(69,54,30,21,'#705034');
    rect(67,50,31,18,'#ad7845');
    rect(74,53,12,9,'#fff0c1');
    rect(115,106,13,13,'#2e3028');
    rect(119,109,6,6,platform===undefined?'#c66a46':'#f4cc67');
    rect(11,139,40,21,'#6a472b');
    rect(13,135,37,21,'#9d7246');
    rect(17,140,27,3,'#edcb83');
    rect(17,148,27,3,'#edcb83');

    const tx = Math.round(x), ty = Math.round(y);
    rect(tx-13,ty-13,27,13,'#292c25');
    rect(tx-11,ty-11,21,9,'#246257');
    rect(tx-12,ty-19,12,11,'#302e24');
    rect(tx-10,ty-17,7,6,'#f3d281');
    rect(tx+5,ty-17,4,6,'#303029');
    rect(tx+9,ty-9,5,3,'#f3d281');
    rect(tx-10,ty-3,6,6,'#342c25');
    rect(tx+5,ty-3,6,6,'#342c25');
    if(this.load!==null) rect(tx-20,ty-8,7,7,['#6bc4cc','#edc783','#c17f5b'][this.load]);
  }
}
