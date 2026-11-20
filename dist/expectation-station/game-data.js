(function(root){
'use strict';
const values=['FOCUS','ATTITUDE','LEADERSHIP','CITIZENSHIP','ORGANIZATION','NON-VIOLENCE'];
function buildGames(stops){
 const e=(s,n)=>stops[s].expectations[n];
 const choice=(s,n,prompt,other=[(n+1)%6,(n+3)%6])=>({prompt,answer:e(s,n),options:[e(s,n),...other.map(k=>e(s,k))]});
 const games=[
 {id:'classroom',type:'quiz',title:'Classroom Coach',icon:'🎓',intro:'Read the question. Choose the matching classroom expectation.',rounds:[choice(0,0,'Your teacher is giving directions. Which expectation helps?'),choice(0,1,'A classmate is trying something difficult. Which expectation helps?'),choice(0,4,'It is time to put materials away. Which expectation helps?')]},
 {id:'hallway',type:'line',title:'Line Leader',icon:'🚶',intro:'Choose an expectation to help each Falcon join the line.',rounds:[choice(1,0,'Help the leader face the right way.'),choice(1,4,'Help the next Falcon close the gap.'),choice(1,5,'Help the last Falcon keep a safe body.')]},
 {id:'bathroom',type:'sort',title:'Badge Sort',icon:'🧼',intro:'Read the sentence. Tap its FALCON word.',items:stops[2].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'playground',type:'whistle',title:'Whistle Stop',icon:'🏁',intro:'Blow the whistle. Then choose what to do.',rounds:[choice(3,0,'The whistle blows. Which expectation tells you what to do?'),choice(3,1,'Someone wants to join the game. Which expectation helps?'),choice(3,5,'A game is starting. Which expectation helps everyone stay safe?')]},
 {id:'cafeteria',type:'sort-station',title:'Lunch Tray Detective',icon:'🍎',intro:'Read the sentence. Is it a lunch-area expectation or from another stop?',items:[{text:e(4,0),answer:true},{text:e(6,2),answer:false,station:stops[6].name},{text:e(4,2),answer:true},{text:e(2,4),answer:false,station:stops[2].name},{text:e(4,4),answer:true},{text:e(10,4),answer:false,station:stops[10].name}]},
 {id:'auditorium',type:'spotlight',title:'Audience Spotlight',icon:'👏',intro:'Light the stage. Read the question and choose an expectation.',rounds:[choice(5,0,'The performance begins. What is your expectation?'),choice(5,1,'It is time for applause. What is your expectation?'),choice(5,3,'A new class joins the audience. What is your expectation?')]},
 {id:'library',type:'pairs',title:'Library Book Pairs',icon:'📚',intro:'Tap a FALCON word. Then tap the matching library sentence.',items:stops[6].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'vapa',type:'palette',title:'Paint the FALCON Way',icon:'🎨',intro:'Read the sentence. Tap its FALCON word to add a color.',items:stops[7].expectations.map((text,i)=>({text,answer:values[i]}))},
 {id:'pe',type:'team',title:'Team Huddle',icon:'⚽',intro:'Read the question. Choose two sentences, then check your answers.',rounds:[{prompt:'Choose two PE expectations about fair play and including others.',answers:[e(8,2),e(8,3)],options:[e(8,2),e(8,3),e(8,4),e(8,0)]},{prompt:'Choose two PE expectations about directions and equipment.',answers:[e(8,0),e(8,4)],options:[e(8,0),e(8,4),e(8,1),e(8,5)]},{prompt:'Choose two PE expectations about trying and playing safely.',answers:[e(8,1),e(8,5)],options:[e(8,1),e(8,5),e(8,2),e(8,3)]}]},
 {id:'steam',type:'bridge',title:'Build a Team Bridge',icon:'🌉',intro:'Choose an expectation for each question. Each correct answer adds a bridge piece.',rounds:[choice(9,1,'Your design did not work. Which expectation helps you try again?'),choice(9,2,'Your team needs everyone’s ideas. Which expectation helps?'),choice(9,4,'You have finished building. Which expectation helps you clean up?')]},
 {id:'animation',type:'sequence',title:'FALCON Storyboard',icon:'🎬',intro:'Fill the frames in F-A-L-C-O-N order. Choose the sentence for each word.',items:stops[10].expectations.map((text,i)=>({text,answer:values[i]}))}
 ];
 // Each sentence below is distinctive to its printed station; do not turn shared
 // expectations into questions with more than one defensible station answer.
 const sourceIndices=[4,0,4,0,4,0,2,0,4,0,2];
 const match={id:'station-match',type:'destinations',title:'Match the Station',icon:'🎟️',intro:'Read the expectation. Tap the station it belongs to.',rounds:stops.map((s,i)=>({prompt:e(i,sourceIndices[i]),answer:i,options:[i,(i+3)%stops.length,(i+7)%stops.length]}))};
 return {games,match,values};
}
root.FalconGames={buildGames};if(typeof module!=='undefined')module.exports={buildGames};
})(typeof window!=='undefined'?window:globalThis);
