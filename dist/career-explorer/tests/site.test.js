const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),banks=require('../question-banks.js'),s=require('../scoring.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'career-data.js'),'utf8'),context);const data=context.window.CareerExplorerData;
const counts=Object.fromEntries(s.RIASEC_CODES.map(c=>[c,3]));
function totals(values){return Object.fromEntries(s.RIASEC_CODES.map((c,i)=>[c,values[i]]))}
test('grade forms have 12, 18, and 24 unique, equally balanced questions',()=>{
 for(const [key,n]of [['tkk',12],['grades12',18],['grades35',24]]){const b=banks[key];assert.equal(b.questions.length,n);assert.equal(new Set(b.questions.map(q=>q.id)).size,n);assert.deepEqual(Object.values(s.validateQuestions(b.questions)),Array(6).fill(n/6));assert.ok(b.version);b.questions.forEach(q=>{assert.ok(q.text.trim());assert.ok(q.emoji)})}
});
test('each grade computes a known social-only profile with its own denominator',()=>{
 for(const b of Object.values(banks)){const p=s.calculateProfile(b.questions,b.questions.map(q=>q.riasec==='S'?'yes':'nope'));assert.equal(p.status,'ready');assert.deepEqual(p.top.map(x=>x.code),['S']);assert.equal(p.top[0].percentage,100);assert.equal(p.top[0].maxScore,b.questions.length/2);assert.equal(p.top[0].total,b.questions.length/2);assert.ok(p.all.filter(x=>x.code!=='S').every(x=>x.total===0))}
});
test('all responses contribute the specified 3, 2, 1, or 0 points in every grade',()=>{
 for(const b of Object.values(banks))for(const [answer,points]of Object.entries(s.SCORE_MAP)){const p=s.calculateProfile(b.questions,b.questions.map(()=>answer));assert.ok(p.all.every(r=>r.total===b.questions.length/6*points));assert.ok(p.all.every(r=>r.percentage===points/3*100))}
});
test('top three means three areas, with ties only at the cutoff, not three score bands',()=>{
 const r=s.calculateResults(totals([9,9,6,3,0,0]),counts);assert.deepEqual(r.map(x=>x.code),['R','I','A']);assert.deepEqual(r.map(x=>x.rank),[1,1,3]);assert.deepEqual(r.map(x=>x.tied),[true,true,false]);
 const tied=s.calculateResults(totals([9,6,3,3,0,0]),counts);assert.deepEqual(tied.map(x=>x.code),['R','I','A','S']);assert.equal(tied[2].rank,3);assert.ok(tied[2].tied&&tied[3].tied);
});
test('ties at first place remain equal and all-zero responses invent no favorite',()=>{
 const b=banks.tkk,equal=s.calculateProfile(b.questions,b.questions.map(()=> 'kinda'));assert.equal(equal.status,'tied');assert.equal(equal.top.length,6);assert.ok(equal.top.every(r=>r.rank===1&&r.tied));const zero=s.calculateProfile(b.questions,b.questions.map(()=> 'nope'));assert.equal(zero.status,'no-preference');assert.deepEqual(zero.top,[]);assert.ok(zero.all.every(r=>r.percentage===0));
});
test('changing an answer replaces its contribution and does not mutate input',()=>{
 const b=banks.grades12,answers=b.questions.map(()=> 'nope'),copy=[...answers];const first=s.calculateProfile(b.questions,answers);assert.deepEqual(answers,copy);answers[0]='yes';const second=s.calculateProfile(b.questions,answers);assert.equal(first.scores.R,0);assert.equal(second.scores.R,3);assert.equal(second.all.reduce((n,r)=>n+r.total,0),3);answers[0]='kinda';assert.equal(s.calculateProfile(b.questions,answers).scores.R,2);
});
test('missing answers cannot produce a finished profile or an inflated denominator',()=>{
 const b=banks.grades35,a=b.questions.map(()=>null);a[0]='yes';assert.throws(()=>s.calculateProfile(b.questions,a),/Finish all/);const p=s.calculateProfile(b.questions,a,{requireComplete:false});assert.equal(p.status,'incomplete');assert.equal(p.answered,1);assert.deepEqual(p.top,[]);assert.equal(p.all[0].maxScore,12);assert.equal(p.all[0].percentage,25);
});
test('invalid values, unbalanced questions and duplicate ids are rejected',()=>{
 assert.throws(()=>s.calculateAllResults({R:NaN},counts),RangeError);assert.throws(()=>s.calculateAllResults({R:10},counts),RangeError);assert.throws(()=>s.calculateAllResults({R:-1},counts),RangeError);assert.throws(()=>s.calculateAllResults({}, {...counts,R:1.5}),RangeError);assert.throws(()=>s.calculateResults({},counts,0),RangeError);assert.throws(()=>s.calculateProfile(banks.tkk.questions,['yes']),TypeError);assert.throws(()=>s.calculateProfile(banks.tkk.questions,banks.tkk.questions.map(()=> 'maybe')),TypeError);assert.throws(()=>s.validateQuestions(banks.tkk.questions.slice(1)),RangeError);const duplicate=banks.tkk.questions.map(q=>({...q}));duplicate[1].id=duplicate[0].id;assert.throws(()=>s.validateQuestions(duplicate),TypeError);
});
test('exact ratio ties and sorting do not depend on rounded display values',()=>{
 const c={R:2,I:4,A:3,S:3,E:3,C:3},scores={R:1,I:2,A:0,S:0,E:0,C:0},copy={...scores};const r=s.calculateResults(scores,c);assert.deepEqual(r.map(x=>x.code),['R','I']);assert.ok(r.every(x=>x.rank===1&&x.tied));assert.deepEqual(scores,copy);
});
test('all referenced jobs exist in the correct grade source, including daily activities',()=>{
 for(const b of Object.values(banks))for(const code of s.RIASEC_CODES)for(const id of b.jobs[code]){const c=data.careers[b.id][id];assert.ok(c,`${b.id} ${code}: ${id}`);assert.equal(typeof c.label,'string');assert.equal(typeof c.does,'string');if(Array.isArray(c.day))c.day.forEach(d=>assert.ok(typeof d==='string'||typeof d.task==='string'))}
});
test('shared career profiles retain their original review metadata',()=>{assert.match(data.source.url,/^https:\/\/www\.bls\.gov\/ooh\//);assert.equal(data.source.reviewed,'July 2026');assert.equal(data.source.wageDataYear,'2024')});
test('pages use the shared controller, accessible forms and local fonts',()=>{
 for(const file of ['index.html','tk-k.html','grades1-2.html','grades3-5.html','careers.html']){const html=fs.readFileSync(path.join(ROOT,file),'utf8');assert.match(html,/career-app\.js/);assert.match(html,/og-preview\.jpg/);assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com|onclick=/);for(const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){if(/^(?:https?:|data:|#)/.test(m[1]))continue;const local=m[1].split(/[?#]/)[0];if(local)assert.ok(fs.existsSync(path.resolve(ROOT,local)),`${file}: ${local}`)}}
 const app=fs.readFileSync(path.join(ROOT,'career-app.js'),'utf8');assert.match(app,/type="radio"/);assert.match(app,/<fieldset/);assert.match(app,/<progress/);assert.match(app,/requireComplete|calculateProfile/);assert.doesNotMatch(app,/innerHTML\s*\+=/);assert.ok(fs.statSync(path.join(ROOT,'og-preview.jpg')).size<500000);
});
