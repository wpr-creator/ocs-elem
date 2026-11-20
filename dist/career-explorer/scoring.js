/* Pure scoring for the classroom RIASEC activities. No grade norms or career-match percentages. */
(function(root){
'use strict';
const RIASEC_CODES=Object.freeze(['R','I','A','S','E','C']);
const SCORE_MAP=Object.freeze({yes:3,kinda:2,'not-really':1,nope:0});
function calculateAllResults(scores={},counts={}){
 return RIASEC_CODES.map(code=>{
  const total=scores[code]??0,count=counts[code]??0,maxScore=count*3;
  if(!Number.isInteger(count)||count<0||!Number.isInteger(total)||total<0||total>maxScore)throw new RangeError('Invalid score or question count for '+code);
  return {code,total,count,maxScore,percentage:maxScore?total/maxScore*100:0};
 });
}
function compare(a,b){return b.total*a.maxScore-a.total*b.maxScore}
function calculateResults(scores,counts,limit=3){
 if(!Number.isInteger(limit)||limit<1||limit>6)throw new RangeError('Result limit must be 1–6');
 const pool=calculateAllResults(scores,counts).filter(r=>r.total>0).sort(compare);
 if(!pool.length)return [];
 const cutoff=pool[Math.min(limit,pool.length)-1];
 return pool.filter(r=>compare(r,cutoff)<=0).map(r=>({...r,rank:1+pool.filter(other=>compare(other,r)<0).length,tied:pool.filter(other=>compare(other,r)===0).length>1}));
}
function validateQuestions(questions){
 if(!Array.isArray(questions)||!questions.length)throw new TypeError('Questions are required');
 const counts=Object.fromEntries(RIASEC_CODES.map(code=>[code,0])),ids=new Set();
 for(const q of questions){if(!q||!RIASEC_CODES.includes(q.riasec)||!Number.isInteger(q.id)||ids.has(q.id))throw new TypeError('Invalid or duplicate question');ids.add(q.id);counts[q.riasec]++}
 const n=counts.R;if(n<2||!Object.values(counts).every(v=>v===n))throw new RangeError('Each RIASEC area must have the same number of questions');
 return counts;
}
function calculateProfile(questions,answers,{requireComplete=true}={}){
 const questionCounts=validateQuestions(questions);
 if(!Array.isArray(answers)||answers.length!==questions.length)throw new TypeError('One answer slot is required for each question');
 const scores=Object.fromEntries(RIASEC_CODES.map(c=>[c,0]));let answered=0;
 answers.forEach((answer,i)=>{if(answer===null||answer===undefined)return;if(!Object.hasOwn(SCORE_MAP,answer))throw new TypeError('Unknown answer');scores[questions[i].riasec]+=SCORE_MAP[answer];answered++});
 const complete=answered===questions.length;if(requireComplete&&!complete)throw new RangeError('Finish all questions before calculating results');
 const all=calculateAllResults(scores,questionCounts),top=complete?calculateResults(scores,questionCounts):[];
 const status=!complete?'incomplete':!top.length?'no-preference':all.every(r=>r.total===all[0].total)?'tied':'ready';
 return {scores,questionCounts,answered,totalQuestions:questions.length,complete,all,top,status};
}
function rankLabel(result,noun='INTEREST'){return `#${result.rank} ${noun}${result.tied?' (TIE)':''}`}
const api=Object.freeze({RIASEC_CODES,SCORE_MAP,calculateAllResults,calculateResults,calculateProfile,validateQuestions,rankLabel});
root.CareerExplorerScoring=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
