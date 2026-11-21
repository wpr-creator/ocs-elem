const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {buildGames}=require('../dist/expectation-station/game-data.js');
const stops=JSON.parse(fs.readFileSync('dist/expectation-station/data.json','utf8'));
const {games,match,values}=buildGames(stops);

test('every stop has three short playable scenes linked to exact FALCON matrix rows',()=>{
 assert.equal(games.length,11);
 assert.equal(new Set([...games,match].map(game=>game.id)).size,12);
 [...games,match].forEach((game,index)=>{
  assert.equal(game.rounds.length,3);
  for(const scene of game.rounds){
   assert.equal(scene.value,values[scene.category]);
   assert.equal(scene.expectation,stops[scene.source??index].expectations[scene.category]);
   assert.ok(scene.cue.split(/\s+/).length<=10,scene.cue);
   if(scene.mode==='yard'){
    const cells=scene.map.join('');
    for(const cell of [scene.start,scene.finish,...scene.cargo.flatMap(item=>scene.sorting?[item.at,item.dock]:[item.at])]){
     assert.equal(cells[cell],'+');
    }
   }else if(scene.mode==='move'){
    assert.ok(scene.spots.length>=2);
    assert.ok(scene.cargo.length>=2);
    for(const cargo of scene.cargo){
     for(const destination of [cargo.to].flat()) assert.ok(scene.spots[destination]);
    }
   }else if(scene.mode==='signal'){
    assert.ok(scene.spots.length>=2);
    assert.ok(scene.signals.length>=3);
    for(const signal of scene.signals) assert.ok(scene.spots[signal.to]);
   }else if(scene.mode==='track'){
    assert.equal(scene.track.length,6);
   }else{
    assert.equal(scene.mode,'order');
    assert.ok(scene.spots.length>=2);
   }
  }
 });
});
