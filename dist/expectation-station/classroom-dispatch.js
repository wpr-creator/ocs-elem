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
    this.platform = null;
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
          ${dispatchStops.map((name,i)=>`<button type="button" data-platform="${i}"><span aria-hidden="true">${i+1}</span>${name}</button>`).join('')}
        </div>
      </div>
      <p class="dispatch-status" role="status">Pick a supply. Send it to a station.</p>
    </div>`;
    this.canvas = this.root.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.status = this.root.querySelector('.dispatch-status');
    this.root.querySelectorAll('[data-load]').forEach(button => button.onclick = () => this.choose(Number(button.dataset.load)));
    this.root.querySelectorAll('[data-platform]').forEach(button => button.onclick = () => this.send(Number(button.dataset.platform)));
    this.paint(36,113);
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
    this.paint(36,113);
  }

  send(platform) {
    if (this.busy) return;
    if (this.load === null) {
      this.status.textContent = 'Load a supply first.';
      return;
    }
    this.busy = true;
    this.platform = platform;
    this.root.querySelector('[data-platform="' + platform + '"]').classList.add('dispatch-route-active');
    this.status.textContent = 'Train to ' + dispatchStops[platform] + '…';
    this.travel(false, () => this.arrive(platform));
  }

  travel(reverse, finish) {
    const canvas = this.canvas;
    const platform = this.platform;
    const end = [45,97,149][platform];
    let started;
    const drive = time => {
      if (!canvas.isConnected) return;
      started ??= time;
      const progress = Math.min(1,(time-started)/1000);
      const x = 36 + (reverse ? 1-progress : progress)*232;
      const y = 113 + (end-113)*Math.max(0,Math.min(1,(x-125)/64));
      this.paint(x,y,platform,progress,reverse);
      if (progress < 1) requestAnimationFrame(drive);
      else finish();
    };
    requestAnimationFrame(drive);
  }

  arrive(platform) {
    if (platform !== this.job.stop || this.load !== this.job.cargo) {
      this.status.textContent = platform !== this.job.stop
        ? 'That train went to ' + dispatchStops[platform] + '. Check the teacher call.'
        : 'Right station. Try a different supply.';
      this.after(800, () => {
        this.travel(true, () => {
          this.root.querySelector('.dispatch-route-active').classList.remove('dispatch-route-active');
          this.busy = false;
          this.platform = null;
          this.paint(36,113);
        });
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

  paint(x,y,platform,progress=0,reverse=false) {
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
    const pixel = (left,top,pattern,colors,scale=1) => {
      pattern.forEach((row,dy) => [...row].forEach((key,dx) => {
        if (colors[key]) rect(left+dx*scale,top+dy*scale,scale,scale,colors[key]);
      }));
    };
    rect(0,0,320,200,'#1a251f');
    rect(0,12,320,158,'#7a5f3c');
    rect(4,15,310,150,'#d7b881');
    for (let tile=17; tile<165; tile+=10) {
      rect(4,tile,310,1,'#b49563');
      for(let joint=8+(tile%3)*9;joint<314;joint+=28) rect(joint,tile,1,10,'#c7a674');
    }
    for (let col=9;col<310;col+=40) {
      rect(col,3,12,19,'#514130');
      rect(col+2,3,7,17,'#d5ac70');
      rect(col+2,3,2,17,'#ead195');
      rect(col-2,19,15,3,'#8a6b46');
    }
    const tracks = [45,97,149].map(end=>[[18,113],[125,113],[189,end],[279,end]]);
    tracks.forEach(points=>{
      line(points,11,'#906643');
      for(let i=1;i<points.length;i++){
        const [sx,sy]=points[i-1], [ex,ey]=points[i];
        const length=Math.hypot(ex-sx,ey-sy), nx=-(ey-sy)/length, ny=(ex-sx)/length;
        for(let d=4;d<length;d+=7){
          const x=sx+(ex-sx)*d/length,y=sy+(ey-sy)*d/length;
          line([[x+nx*6,y+ny*6],[x-nx*6,y-ny*6]],2,'#61422e');
        }
      }
      line(points,7,'#262b24');
      line(points,4,'#a79977');
      line(points,2,'#665743');
    });
    if (platform !== undefined) line(tracks[platform],2,'#ffe397');

    const shelves = [
      ['#638372','#a4ab7a',['#894637','#e0bb6c','#627375','#9b6046']],
      ['#987056','#d1ac76',['#d3bb85','#b69b70','#ddd2a2']],
      ['#765d79','#b18d86',['#a55449','#d0a452','#537a75','#9d7092']]
    ];
    for (const [i,top] of [30,82,134].entries()) {
      const [wall,trim,items] = shelves[i];
      rect(204,top-14,107,28,'#493726');
      rect(207,top-14,102,24,wall);
      rect(207,top-14,102,2,trim);
      rect(207,top+6,102,3,'#e1b67b');
      rect(207,top+9,102,3,'#705237');
      rect(213,top-11,36,16,'#302e25');
      items.forEach((color,j)=>{
        if(i===0) rect(215+j*7,top-8-(j%2)*2,5,12+(j%2)*2,color);
        if(i===1) rect(215+j*10,top-7,7,9,color);
        if(i===2){
          rect(215+j*7,top-5,5,9,color);
          rect(216+j*7,top-9,2,5,'#d8b580');
        }
      });
      rect(200,top-8,5,7,'#292f26');
      rect(201,top-7,3,4,platform===i?'#ffdf80':'#678e70');
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
    const palette = {o:'#252a22',g:'#236257',l:'#478574',b:'#e3b869',h:'#f9dc96',r:'#8f4d38',d:'#5e392c'};
    const engine = [
      '..oooo..........oo....','..obho..........oo....','..obho........oobbo...',
      '..obho.....ooooggoooo.','..obhooooooogllgggbho.','..oggggggggggllgggbho.',
      '..ogggggggggggggggoooo','ooooobbbbbbbbbbbbboooo','..oordroo..oordroo....',
      '...orrdo....orrdo.....','....ooo......ooo......'
    ];
    if(this.load!==null) {
      rect(tx-40,ty-6,23,6,'#2c2921');
      rect(tx-38,ty-8,20,4,'#a5774d');
      rect(tx-37,ty,5,3,'#2c2921');
      rect(tx-24,ty,5,3,'#2c2921');
      const cargo = [
        ['.aaaa.','abbbba','abbcba','abbcba','aaaaaa'],
        ['....aa','...abb','..abb.','.abb..','abc...'],
        ['a.a.a.','b.c.b.','b.c.b.','aaaaaa','acccca']
      ];
      pixel(tx-34,ty-18,cargo[this.load],{a:'#362d23',b:['#70b9c0','#d7af61','#ac6554'][this.load],c:'#f0d398'},2);
    }
    pixel(tx-17,ty-25,engine,palette,1.4);
    if(platform!==undefined && progress<.98){
      const drift=Math.floor(progress*20)%6;
      rect(tx+4-drift,ty-22-drift,4,3,'#e3d3ac');
      rect(tx+1-drift*2,ty-25-drift,3,2,'#b7b295');
      if(reverse) rect(tx-15,ty-8,2,2,'#b75b47');
    }

  }
}
