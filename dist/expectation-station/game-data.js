(function(root){
'use strict';
const values=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];
function buildGames(stops){
 const e=(s,n)=>stops[s].expectations[n];
 const choice=(s,n,prompt,other=[(n+1)%6,(n+3)%6])=>({prompt,answer:e(s,n),options:[e(s,n),...other.map(k=>e(s,k))]});
 const games=[
 {id:'classroom',type:'quiz',rounds:[choice(0,0,'Your teacher gives directions. What do you do?'),choice(0,1,'A classmate is trying something difficult. Which expectation helps?'),choice(0,4,'It is time to put materials away. Which expectation helps?')]},
 {id:'hallway',type:'line',rounds:[choice(1,0,'Help the leader face the right way.'),choice(1,4,'Help the next Falcon close the gap.'),choice(1,5,'Help the last Falcon keep a safe body.')]},
 {id:'bathroom',type:'bubbles',pool:stops.flatMap(s=>s.expectations.map((text,i)=>({text,answer:values[i]}))),items:stops[2].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'playground',type:'whistle',rounds:[choice(3,0,'You hear the whistle. What do you do?'),choice(3,1,'Someone wants to join the game. Which expectation helps?'),choice(3,5,'A game is starting. Which expectation helps everyone stay safe?')]},
 {id:'cafeteria',type:'sort-station',items:[{text:e(4,0),answer:true},{text:e(6,2),answer:false,station:stops[6].name},{text:e(4,2),answer:true},{text:e(2,4),answer:false,station:stops[2].name},{text:e(4,4),answer:true},{text:e(10,4),answer:false,station:stops[10].name}]},
 {id:'auditorium',type:'spotlight',rounds:[choice(5,0,'The performance begins. What is your expectation?'),choice(5,1,'It is time for applause. What is your expectation?'),choice(5,3,'A new class joins the audience. What is your expectation?')]},
 {id:'library',type:'pairs',items:stops[6].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'vapa',type:'palette',items:stops[7].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'pe',type:'team',rounds:[{prompt:'Pick two ways to play fair and include others.',answers:[e(8,2),e(8,3)],options:[e(8,2),e(8,3),e(8,4),e(8,0)]},{prompt:'Pick two ways to follow directions and care for gear.',answers:[e(8,0),e(8,4)],options:[e(8,0),e(8,4),e(8,1),e(8,5)]},{prompt:'Pick two ways to keep trying and play safely.',answers:[e(8,1),e(8,5)],options:[e(8,1),e(8,5),e(8,2),e(8,3)]}]},
 {id:'steam',type:'bridge',rounds:[choice(9,1,'Your design did not work. Which expectation helps you try again?'),choice(9,2,'Your team needs everyone’s ideas. Which expectation helps?'),choice(9,4,'You have finished building. Which expectation helps you clean up?')]},
 {id:'animation',type:'sequence',items:stops[10].expectations.map((text,i)=>({text,answer:values[i]}))}
 ];
 // Each sentence below is distinctive to its printed station; do not turn shared
 // expectations into questions with more than one defensible station answer.
 const sourceIndices=[4,0,4,0,4,0,2,0,4,0,2];
 const match={id:'station-match',type:'destinations',rounds:stops.map((s,i)=>({prompt:e(i,sourceIndices[i]),answer:i,options:[i,(i+3)%stops.length,(i+7)%stops.length]}))};
 return {games,match,values};
}
root.FalconGames={buildGames};if(typeof module!=='undefined')module.exports={buildGames};
})(typeof window!=='undefined'?window:globalThis);
