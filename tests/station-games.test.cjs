const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {buildGames}=require('../dist/expectation-station/game-data.js');
const stops=JSON.parse(fs.readFileSync('dist/expectation-station/data.json','utf8'));
const {games,match,values}=buildGames(stops);
test('each station has a distinct game and valid source expectations',()=>{
 assert.equal(games.length,11);assert.equal(new Set(games.map(g=>g.type)).size,11);
 assert.equal(new Set([...games,match].map(g=>g.id)).size,12);
 games.forEach((g,i)=>{
  if(g.rounds)g.rounds.forEach(r=>{
   for(const a of r.answers||[r.answer]){assert.ok(stops[i].expectations.includes(a));assert.ok(r.options.includes(a))}
   assert.equal(new Set(r.options).size,r.options.length);
   r.options.forEach(a=>assert.ok(stops[i].expectations.includes(a)));
  });
  if(g.items)g.items.forEach(item=>{
   assert.ok(stops.some(s=>s.expectations.includes(item.text)),item.text);
   if(g.type==='sort-station')assert.equal(stops[i].expectations.includes(item.text),item.answer);
   else assert.equal(item.text,stops[i].expectations[values.indexOf(item.answer)]);
  });
 });
});
test('every destination matching prompt has exactly one printed station answer',()=>{
 assert.equal(match.rounds.length,11);
 match.rounds.forEach(r=>{
  const owners=stops.flatMap((s,i)=>s.expectations.includes(r.prompt)?[i]:[]);
  assert.deepEqual(owners,[r.answer]);assert.ok(r.options.includes(r.answer));assert.equal(new Set(r.options).size,3);
 });
});
test('the PDF expectation data has not been duplicated into rewritten game text',()=>{
 const raw=fs.readFileSync('dist/expectation-station/game-data.js','utf8');
 for(const s of stops)for(const expectation of s.expectations)assert.ok(!raw.includes(expectation),'Games must use the canonical matrix data');
});

test('bubble pool uses exact matrix text and supplies three targets for every category',()=>{
 const bubble=games.find(g=>g.type==='bubbles');
 assert.equal(bubble.pool.length,66);
 bubble.pool.forEach(item=>assert.ok(stops.some(s=>s.expectations[values.indexOf(item.answer)]===item.text)));
 for(const category of values){assert.ok(new Set(bubble.pool.filter(i=>i.answer===category).map(i=>i.text)).size>=3)}
});
test('memory reveals only two cards, retains a match, and resets mismatches',()=>{
 const vm=require('node:vm');let pending,bells=0;
 const context={localStorage:{getItem:()=>null},setTimeout:fn=>{pending=fn;return 1},clearTimeout:()=>{},stationBell:()=>bells++,labels:values};
 vm.createContext(context);vm.runInContext(fs.readFileSync('dist/expectation-station/games.js','utf8')+'\nthis.Game=StationGame;',context);
 const root={isConnected:true,querySelector:()=>({focus(){}})},g=new context.Game(root,games[6],6);
 g.deck=[{pair:0},{pair:1},{pair:0},{pair:1}];g.drawPairs=()=>{};
 g.flipMemory(0);assert.deepEqual([...g.flipped],[0]);g.flipMemory(1);assert.equal(g.memoryBusy,true);
 g.flipMemory(2);assert.deepEqual([...g.flipped],[0,1]);pending();assert.equal(g.flipped.length,0);assert.equal(g.memoryBusy,false);
 g.flipMemory(0);g.flipMemory(2);assert.equal(g.matched.has(0),true);assert.equal(g.flipped.length,0);assert.equal(bells,1);
 g.flipMemory(0);assert.equal(g.flipped.length,0);
});
