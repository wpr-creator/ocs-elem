const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const stops=JSON.parse(fs.readFileSync('dist/expectation-station/data.json','utf8'));
const {games,match,values}=require('../dist/expectation-station/game-data.js').buildGames(stops);
function harness(config){
 const pending=[];const generic={focus(){},classList:{add(){},remove(){}},textContent:''};
 const root={isConnected:true,nodes:[],set innerHTML(html){this.nodes=[...html.matchAll(/<button\b([^>]*)>/g)].map(m=>{const attrs={};for(const a of m[1].matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];return {attrs,dataset:Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v])),disabled:/\sdisabled(?:\s|$)/.test(m[1]),classList:generic.classList,focus(){},addEventListener(event,fn){this['on'+event]=fn}}})},querySelectorAll(selector){return this.nodes.filter(n=>matches(n,selector))},querySelector(selector){return this.querySelectorAll(selector)[0]||(!selector.startsWith('.')&&!selector.startsWith('[')?generic:selector==='.rail-game-board'?generic:null)}};
 function matches(node,selector){return selector.split(',').some(part=>{part=part.trim();if(part.endsWith(':not(:disabled)')){if(node.disabled)return false;part=part.replace(':not(:disabled)','')}if(part.startsWith('.'))return (node.attrs.class||'').split(' ').includes(part.slice(1));const m=part.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return m&&Object.hasOwn(node.attrs,m[1])&&(m[2]===undefined||node.attrs[m[1]]===m[2])})}
 const ctx={localStorage:{getItem:()=>null,setItem(){}},window:{},stops,labels:values,FalconGames:{buildGames:()=>({games,match,values})},scene:()=>'<div></div>',stationBell(){},boardClack(){},whistle(){},setTimeout(fn){pending.push(fn);return pending.length},clearTimeout(){}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/expectation-station/games.js','utf8')+'\n'+fs.readFileSync('dist/expectation-station/railway-games.js','utf8')+'\nthis.Game=RailwayGame;',ctx);
 const g=new ctx.Game(root,config,games.indexOf(config));g.complete=()=>g.finished=true;g.say=text=>g.feedback=text;
 const click=selector=>{const el=root.querySelector(selector);assert.ok(el,'Missing control '+selector);assert.equal(el.disabled,false,'Disabled '+selector);assert.equal(typeof el.onclick,'function','No handler '+selector);el.onclick()};
 g.start();return {g,root,click,pending};
}
test('all nine station railway activities and dispatcher complete through their controls',()=>{
 for(const c of [...games,match].filter(c=>!['pairs','bubbles'].includes(c.type))){
 const {g,click,pending}=harness(c);
 if(c.type==='line'||c.type==='palette'||c.type==='sequence'){
   const n=c.type==='line'?3:6;
   click('[data-slot="0"]');assert.equal(g.placed.size,0,'No placement without a selected piece');
   click('[data-piece="0"]');click('[data-slot="1"]');assert.equal(g.placed.size,0,'Wrong placements must not advance');
   for(let i=0;i<n;i++){click(`[data-piece="${i}"]`);click(`[data-slot="${i}"]`);assert.equal(g.placed.size,i+1)}
   if(c.type==='line'){click('.rail-depart');pending.at(-1)()}
   if(c.type==='palette')click('.mural-finish');
   if(c.type==='sequence'){click('.film-play');for(let i=0;i<6;i++)click('.film-step')}
 }else{
   for(let round=0;round<g.total();round++){
     if(c.type==='sort-station'){const item=c.items[g.order[g.round]];click('[data-piece="0"]');click(`[data-slot="${item.answer?0:1}"]`)}
     else if(c.type==='team'){for(const answer of c.rounds[round].answers)click(`[data-switch="${g.options.indexOf(answer)}"]`);click('.send-team')}
     else if(c.type==='whistle'){click('.signal-go');click('.signal-stop');assert.equal(g.phase,'moving');pending.at(-1)();click('.signal-stop');click(`[data-signal-answer="${g.options.indexOf(c.rounds[round].answer)}"]`)}
     else if(c.type==='spotlight'){const i=g.options.indexOf(c.rounds[round].answer);click(`[data-window="${i}"]`);click(`[data-ring="${i}"]`)}
     else if(c.type==='destinations'){click('[data-piece="0"]');click(`[data-slot="${c.rounds[round].answer}"]`)}
     else{click(`[data-piece="${g.options.indexOf(c.rounds[round].answer)}"]`);click(`[data-slot="${c.type==='quiz'?'punch':'track'}"]`)}
     assert.equal(g.success,true,c.type+' round '+round);click('.rail-next');
   }
 }
 assert.equal(g.finished,true,c.type+' must finish');
 }
});
test('restarting clears placed pieces, switch choices, and pending game phase',()=>{
 const {g,click}=harness(games[1]);click('[data-piece="0"]');click('[data-slot="0"]');assert.equal(g.placed.size,1);g.start();assert.equal(g.placed.size,0);assert.equal(g.pick,null);assert.equal(g.phase,'ready');assert.equal(g.round,0);
});
test('station uses local railway fonts and the original expectation data remains untouched',()=>{
 const css=fs.readFileSync('dist/expectation-station/style.css','utf8'),html=fs.readFileSync('dist/expectation-station/index.html','utf8');
 assert.ok(!css.includes('@import'));assert.ok(css.includes('BarlowCondensed-Bold.ttf'));assert.ok(html.includes('railway-games.js'));assert.ok(!html.includes('.pdf'));
 const original=require('node:child_process').execFileSync('git',['show','HEAD:dist/expectation-station/data.json'],{encoding:'utf8'});assert.equal(fs.readFileSync('dist/expectation-station/data.json','utf8'),original);
});
