const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup(scene, length) {
 const actions=[];
 const classes={add(){},remove(){},contains(){return false}};
 const target={classList:classes,outerHTML:'',setAttribute(){},
  querySelectorAll:()=>Array.from({length},()=>({classList:classes}))};
 const root={isConnected:true,querySelector:()=>target};
 const context={setTimeout:fn=>actions.push(fn),stationNarrating:false,window:{}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('dist/expectation-station/railway-games.js','utf8')+'\nthis.Game=RailwayGame;',context);
 const game=new context.Game(root,{},0);
 Object.assign(game,{scene:{spots:[],...scene},round:0,step:0,finished:false,deliveries:new Set(),draw(){},reward(){},showSignal(){}});
 const act=id=>game.act({dataset:{target:id},classList:classes,setAttribute(){},querySelector:()=>target});
 return {game,actions,act,root};
}

test('waybill must close before loading, and the remembered order is checked',()=>{
 const {game,actions,act}=setup({mode:'order',value:'FOCUS'},2);
 game.sequence=[1,0];
 game.orderOpen=true;
 act(1);
 assert.equal(game.step,0);
 game.orderOpen=false;
 act(0);
 assert.equal(game.step,0);
 act(1);
 assert.equal(game.step,1);
 act(0);
 act(0);
 assert.equal(actions.length,1);
 actions[0]();
 assert.equal(game.round,1);
});

test('signal rounds check every changing cue and stop advancing after exit',()=>{
 const {game,actions,act,root}=setup({mode:'signal',value:'FOCUS',signals:[{to:0},{to:1},{to:0}]},3);
 act(1); assert.equal(game.step,0);
 act(0); assert.equal(game.step,1);
 act(0); assert.equal(game.step,1);
 act(1); act(0);
 assert.equal(actions.length,1);
 root.isConnected=false;
 actions[0]();
 assert.equal(game.round,0);
});

test('the bridge checks rail continuity from entrance to exit',()=>{
 const {game}=setup({mode:'track'},1);
 game.track=[null,{ports:[1,2],turn:2},{ports:[1,3],turn:1},{ports:[1,3],turn:1},{ports:[0,3],turn:1},null];
 assert.equal(game.connectedTrack(),false);
 for (const tile of game.track.filter(Boolean)) tile.turn=0;
 assert.equal(game.connectedTrack(),true);
 game.track[1].turn=1;
 assert.equal(game.connectedTrack(),false);
});
