const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const stops=JSON.parse(fs.readFileSync('dist/expectation-station/data.json','utf8'));
const {games,match,values}=require('../dist/expectation-station/game-data.js').buildGames(stops);

function setup(config) {
 const queue = [];
 const target = {classList:{add(){}}, focus(){}};
 const root = {isConnected:true, querySelector:()=>target};
 const context = {
  labels:values, window:{}, stationNarrating:false, stationBell(){}, shuffleGame:items=>[...items],
  setTimeout(callback){queue.push(callback);return queue.length},
  clearTimeout(){}
 };
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('dist/expectation-station/railway-games.js','utf8')+'\nthis.Game=RailwayGame;', context);
 const game = new context.Game(root,config,[...games,match].indexOf(config));
 game.draw = () => {};
 game.memory = () => {};
 game.finish = () => {game.finished = true};
 game.start();
 return {game, next:()=>queue.shift()(), pending:()=>queue.length};
}

test('each choice game advances on correct taps and awards its stamp without a continue click',()=>{
 for (const config of [...games,match].filter(game=>game.type!=='pairs')) {
  const {game,next,pending} = setup(config);
  assert.equal(game.rounds.length,3,config.id);
  for (const [index,round] of game.rounds.entries()) {
   const tap = option => game.pick({
    dataset:{choice:round.options.indexOf(option)},classList:{add(){}},setAttribute(){}
   },round);
   const wrong = round.options.find(option=>!round.answers.includes(option));
   tap(wrong);
   assert.equal(pending(),0,config.id+' accepted an incorrect answer');
   for (const answer of round.answers) tap(answer);
   tap(round.answers[0]);
   assert.equal(pending(),1,config.id+' should advance exactly once');
   next();
   assert.equal(game.round,index+1);
  }
  assert.equal(game.finished,true,config.id);
 }
});

test('memory flips only two tickets at a time and collects the stamp on the last pair',()=>{
 const {game,next,pending} = setup(games.find(game=>game.type==='pairs'));
 game.flip(0);
 game.flip(2);
 game.flip(1);
 assert.equal(pending(),1);
 assert.deepEqual([...game.flipped],[0,2]);
 next();
 assert.equal(game.flipped.length,0);
 assert.equal(game.matched.size,0);
 for (let i=0;i<6;i+=2) {
  game.flip(i);
  game.flip(i+1);
  next();
 }
 assert.equal(game.matched.size,3);
 assert.equal(game.finished,true);
});

test('leaving a game stops its queued round change',()=>{
 const {game,next} = setup(games[0]);
 const round = game.rounds[0];
 game.pick({dataset:{choice:round.options.indexOf(round.answers[0])},classList:{add(){}},setAttribute(){}},round);
 game.root.isConnected=false;
 next();
 assert.equal(game.round,0);
});

test('station uses local railway fonts and the original expectation data remains untouched',()=>{
 const css=fs.readFileSync('dist/expectation-station/style.css','utf8'),html=fs.readFileSync('dist/expectation-station/index.html','utf8');
 assert.ok(!css.includes('@import'));assert.ok(css.includes('BarlowCondensed-Bold.ttf'));assert.ok(html.includes('railway-games.js'));assert.ok(!html.includes('.pdf'));
 const original=require('node:child_process').execFileSync('git',['show','HEAD:dist/expectation-station/data.json'],{encoding:'utf8'});assert.equal(fs.readFileSync('dist/expectation-station/data.json','utf8'),original);
});
