const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function setup(scene){
 const callbacks=[];
 const target={classList:{add(){}},outerHTML:''};
 const root={isConnected:true,querySelector:()=>target};
 const context={setTimeout:fn=>callbacks.push(fn),stationBell(){},stationNarrating:false,window:{}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('dist/expectation-station/railway-games.js','utf8')+'\nthis.Game=RailwayGame;',context);
 const game=new context.Game(root,{},0);
 Object.assign(game,{scene,round:0,step:0,ready:false,finished:false,draw(){}});
 const act=id=>game.act({
  dataset:{target:id},classList:{add(){},contains(){return false}},setAttribute(){},querySelector:()=>target
 });
 return {game,callbacks,act,root};
}

test('ordered actions reject skipped steps and skip the continue click after completion',()=>{
 const {game,callbacks,act}=setup({mode:'order',spots:[{},{}],value:'FOCUS'});
 act(1);
 assert.equal(game.step,0);
 act(0);
 assert.equal(game.step,1);
 act(1);
 act(1);
 assert.equal(callbacks.length,1);
 callbacks[0]();
 assert.equal(game.round,1);
});

test('signal action has no time limit and rejects early taps',()=>{
 const {game,callbacks,act}=setup({mode:'signal',spots:[{}],value:'FOCUS'});
 act(0);
 assert.equal(callbacks.length,0);
 game.ready=true;
 act(0);
 assert.equal(callbacks.length,1);
});

test('moving a piece to the wrong spot does not advance and leaving cancels progression',()=>{
 const {game,callbacks,act,root}=setup({mode:'move',piece:{icon:'✏️'},spots:[{},{}],value:'ORGANIZATION'});
 act(1);
 assert.equal(callbacks.length,0);
 act(0);
 assert.equal(callbacks.length,1);
 root.isConnected=false;
 callbacks[0]();
 assert.equal(game.round,0);
});
