(function(root){'use strict';
const TASKS=[
  {
    "name": "Desk & seat back pockets",
    "lines": [
      "Desk & seat",
      "back pockets"
    ],
    "icon": "🪑",
    "color": "#bcdcd5",
    "steps": [
      "Check your desk and seat back pockets.",
      "Put papers in the correct folder. Keep only what belongs here.",
      "Recycle scraps and leave your learning space neat."
    ]
  },
  {
    "name": "Binder",
    "lines": [
      "Binder"
    ],
    "icon": "📒",
    "color": "#d8cbed",
    "steps": [
      "Open your binder and look for loose papers.",
      "Put each paper in the right folder or section.",
      "Close the binder rings carefully."
    ]
  },
  {
    "name": "Planner",
    "lines": [
      "Planner"
    ],
    "icon": "📅",
    "color": "#f1d5c2",
    "steps": [
      "Find your planner and open to this week.",
      "Check your reminders and homework with your teacher.",
      "Put your planner where you can find it again."
    ]
  },
  {
    "name": "Backpack",
    "lines": [
      "Backpack"
    ],
    "icon": "🎒",
    "color": "#efdcab",
    "steps": [
      "Open your backpack and check each pocket.",
      "Put school supplies and papers in their places.",
      "Remove trash and zip up your backpack."
    ]
  },
  {
    "name": "Pencil box",
    "lines": [
      "Pencil box"
    ],
    "icon": "✏️",
    "color": "#cfdfed",
    "steps": [
      "Open your pencil box and take a quick look.",
      "Put pencils, crayons, and erasers together neatly.",
      "Close it carefully so your tools stay safe."
    ]
  }
];
TASKS.forEach(task=>{Object.freeze(task.steps);Object.freeze(task.lines);Object.freeze(task)});Object.freeze(TASKS);
function pickIndex(randomFill,size=TASKS.length){if(!Number.isInteger(size)||size<1||size>4294967296)throw new RangeError('Invalid wheel size');const limit=Math.floor(4294967296/size)*size,a=new Uint32Array(1);do{randomFill(a)}while(a[0]>=limit);return a[0]%size}
function targetRotation(from,index,size=TASKS.length,turns=8){if(!Number.isInteger(size)||size<1||!Number.isFinite(from)||!Number.isInteger(index)||index<0||index>=size||!Number.isInteger(turns)||turns<1)throw new RangeError('Invalid spin');const base=((from%360)+360)%360,target=(360-(index*360/size+180/size))%360;return base+turns*360+(target-base+360)%360}
const api=Object.freeze({TASKS,pickIndex,targetRotation});if(typeof module!=='undefined')module.exports=api;if(typeof document==='undefined')return;
const fx=root.ResourceFX,ns='http://www.w3.org/2000/svg',wheel=document.getElementById('wheel'),button=document.getElementById('spin'),skip=document.getElementById('skip-spin'),read=document.getElementById('read-steps'),panel=document.getElementById('wheel-panel'),status=document.getElementById('spin-status');
let rotation=0,frameId=0,pending=null,lastClick=-Infinity,labels=[];
function svgEl(tag,attrs,text){const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text)el.textContent=text;return el}
function point(a,r){const t=(a-90)*Math.PI/180;return[270+r*Math.cos(t),270+r*Math.sin(t)]}
TASKS.forEach((task,i)=>{const a=i*72,b=a+72,[x1,y1]=point(a,255),[x2,y2]=point(b,255);wheel.append(svgEl('path',{d:`M270 270 L${x1} ${y1} A255 255 0 0 1 ${x2} ${y2} Z`,fill:task.color,class:'slice'}));const[x,y]=point(a+36,167),group=svgEl('g',{'aria-hidden':'true'});group.append(svgEl('text',{x,y:y-15,class:'wheel-label emoji'},task.icon));task.lines.forEach((line,j)=>group.append(svgEl('text',{x,y:y+20+j*23,class:'wheel-label'},line)));wheel.append(group);labels.push({group,x,y})});
for(let i=0;i<25;i++){const[x,y]=point(i*14.4,251);wheel.append(svgEl('circle',{cx:x,cy:y,r:5,class:'spoke-peg','aria-hidden':'true'}))}
function renderRotation(value){wheel.style.transform=`rotate(${value}deg)`;labels.forEach(({group,x,y})=>group.setAttribute('transform',`rotate(${-value} ${x} ${y})`))}
function celebrate(){if(fx.reducedMotion())return;const container=document.createElement('div');container.className='confetti';container.setAttribute('aria-hidden','true');document.querySelector('.instructions').append(container);for(let i=0;i<10;i++){const el=document.createElement('span');el.textContent='▰';el.style.color=['#c7b7e7','#91c5b7','#edbd9c'][i%3];el.style.left=(20+Math.random()*60)+'%';el.style.top='15%';container.append(el);el.animate([{transform:'translateY(0) rotate(0deg)',opacity:1},{transform:`translate(${(Math.random()-.5)*150}px,160px) rotate(${(Math.random()-.5)*240}deg)`,opacity:0}],{duration:900,easing:'ease-out',fill:'forwards'})}setTimeout(()=>container.remove(),1000)}
function finish(){if(!pending)return;cancelAnimationFrame(frameId);const{index,to}=pending;pending=null;rotation=to%360;renderRotation(rotation);const task=TASKS[index],mission=document.getElementById('mission');mission.replaceChildren();const icon=document.createElement('div');icon.className='badge';icon.setAttribute('aria-hidden','true');icon.textContent=task.icon;const title=document.createElement('h2');title.tabIndex=-1;title.textContent=task.name;const steps=document.createElement('ol');steps.className='steps';task.steps.forEach(text=>{const li=document.createElement('li');li.textContent=text;steps.append(li)});mission.append(icon,title,steps);const shape=wheel.querySelectorAll('.slice')[index];wheel.append(svgEl('path',{d:shape.getAttribute('d'),class:'selected-outline','aria-hidden':'true'}));panel.setAttribute('aria-busy','false');button.disabled=false;button.textContent='Spin again';skip.hidden=true;read.hidden=!('speechSynthesis'in root);read.onclick=()=>fx.read(task.name+'. '+task.steps.join('. '),read);status.textContent='';title.focus({preventScroll:true});if(innerWidth<=760)document.querySelector('.instructions').scrollIntoView({behavior:fx.reducedMotion()?'auto':'smooth',block:'start'});fx.complete();celebrate()}
button.addEventListener('click',()=>{if(pending)return;fx.stopReading();fx.unlock();wheel.querySelector('.selected-outline')?.remove();document.querySelector('.confetti')?.remove();read.hidden=true;button.disabled=true;button.textContent='Spinning…';skip.hidden=false;panel.setAttribute('aria-busy','true');status.textContent='Choosing an organization check.';const index=pickIndex(a=>crypto.getRandomValues(a)),from=rotation,to=targetRotation(from,index),duration=fx.reducedMotion()?200:6200,start=performance.now();pending={index,to};let lastSpoke=Math.floor(from/14.4);function frame(now){if(!pending)return;const progress=fx.reducedMotion()?1:Math.min(1,(now-start)/duration),value=from+(to-from)*(1-Math.pow(1-progress,4));renderRotation(value);const spoke=Math.floor(value/14.4);if(spoke!==lastSpoke&&!fx.reducedMotion()){if(now-lastClick>45){fx.tick();lastClick=now}document.querySelector('.pointer').animate([{transform:'translateX(-50%) rotate(-12deg)'},{transform:'translateX(-50%) rotate(0deg)'}],{duration:75});lastSpoke=spoke}if(progress<1)frameId=requestAnimationFrame(frame);else finish()}frameId=requestAnimationFrame(frame)});
skip.addEventListener('click',finish);root.addEventListener('pagehide',()=>{cancelAnimationFrame(frameId);pending=null;fx.stopReading()});
})(typeof window!=='undefined'?window:globalThis);
