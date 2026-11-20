/* Shared, local-only sound, read-aloud, and reduced-motion controls. */
(function(root){'use strict';
let context,readingButton=null,readVersion=0;
const media=matchMedia('(prefers-reduced-motion: reduce)'),Audio=root.AudioContext||root.webkitAudioContext;
function reduced(){return media.matches}
function controls(){document.body.classList.toggle('motion-reduced',reduced())}
async function unlock(){if(!Audio||document.hidden)return;try{context ||= new Audio();await context.resume()}catch{}}
function tone(frequency=450,duration=.09,volume=.025,type='sine',delay=0){if(context?.state!=='running')return;const o=context.createOscillator(),g=context.createGain(),t=context.currentTime+delay;o.type=type;o.frequency.setValueAtTime(frequency,t);o.connect(g);g.connect(context.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(readingButton?volume*.12:volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.start(t);o.stop(t+duration+.01);o.onended=()=>{o.disconnect();g.disconnect()}}
function stopReading(){readVersion++;if('speechSynthesis'in root)speechSynthesis.cancel();if(readingButton){readingButton.textContent=readingButton.dataset.readLabel||'Read aloud';readingButton.setAttribute('aria-pressed','false');readingButton=null}}
function read(text,button){if(!('speechSynthesis'in root))return;if(readingButton===button){stopReading();return}stopReading();const version=++readVersion,u=new SpeechSynthesisUtterance(text);u.lang=document.documentElement.lang||'en';u.rate=.82;readingButton=button;button.dataset.readLabel ||= button.textContent;button.textContent='Stop reading';button.setAttribute('aria-pressed','true');const finish=()=>{if(version===readVersion&&readingButton===button){button.textContent=button.dataset.readLabel;button.setAttribute('aria-pressed','false');readingButton=null}};u.onend=u.onerror=finish;speechSynthesis.speak(u)}
function tap(){tone(440,.07,.022)}
function complete(){tone(523,.18,.035);tone(659,.2,.03,'sine',.1);tone(784,.3,.03,'sine',.21)}
function tick(){tone(1100,.035,.025,'triangle')}
document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
media.addEventListener?.('change',controls);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopReading();context?.suspend().catch(()=>{})}else unlock()});root.addEventListener('pagehide',()=>{stopReading();context?.suspend().catch(()=>{})});
document.querySelectorAll('[data-read]').forEach(b=>{if(!('speechSynthesis'in root))b.hidden=true});controls();
root.ResourceFX=Object.freeze({unlock,tone,tap,tick,complete,read,stopReading,reducedMotion:reduced});
})(window);
