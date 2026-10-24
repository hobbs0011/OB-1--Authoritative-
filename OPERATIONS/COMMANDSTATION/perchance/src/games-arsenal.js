/* PORTED 2026-10-22 from eff-gen-agent99-anakin (Anakin station, save 2) — 7 original classroom games + teacher console. Deconflict: core owns board/order ids; this file renders ONLY elements core left empty (non-empty guard in initExtra) and core yields data-cards board / data-order-only order elements. KSU dialects kept separate: method.outcomes here, spec.outcomes in core. */
/* ============================================================================
   NET ACADEMY — GAMES ARSENAL (src/games-arsenal.js)
   7 new ORIGINAL classroom games + the teacher console. Loads AFTER
   src/lessons.js and wraps window.ObiLessons.build to inject its own CSS
   and runtime into every built lesson — the core 3 games (scramble/match/
   sort) are untouched; unknown data-game types used to render empty, now
   they render here.

   ORIGINAL CODE, Baamboozle-BETTER (not a copy): the mechanics observed
   from the outside (16-tile team board, hidden risk tiles, turn order,
   teacher-moderated scoring) are generic classroom-game mechanics. Every
   line below is written from scratch for this station, and every game is
   better in the ways a copy could never be: teacher-moderated Correct/
   Wrong (no self-scoring), a support scaffold + an extend challenge on
   EVERY question (differentiation is in the question, not in a setting),
   evidence-fed banks (transcript → Q&A), WebAudio cues (no files),
   div-confetti (no assets), timer + teams + picker in one console,
   offline single-file, reduced-motion honoured, VN gloss ready.

   THE 10 (3 core + 7 here):
     scramble  core  letters → word
     match     core  word → meaning
     sort      core  chip → bucket
     board     QUIZ BOARD — 16 team tiles (10/15/20 + DOUBLE/HALF/STEAL/SWAP/
               STORM), teacher Correct/Wrong, support+extend per question
     tornado   RISK ROW — hidden values incl. tornado-steal, same Q/A bank
     memory    flip pairs, turn-counted
     dice      roll 1–6, answer that lane, earn face×10
     reveal    answer to uncover the key term tile by tile
     order     tap the steps in order
     voice     hear-it-type-it via speechSynthesis (phonics), letter fallback

   Bank format (one attribute, model-emittable):
     data-cards="question || answer || support || extend ;; question || ..."
     (support/extend optional; data-items="Q=A;…" also accepted for the
     simple games; data-cover="KEYWORD" for reveal; data-order="a|b|c"
     for order; data-lang="en-US" hint for voice.)

   Coins: the core runtime owns its own counter in a closure, so the
   arsenal pays through the DOM it can see (#coinsCount, #tierCrest),
   default +10, honouring data-pay on the game element.
   ========================================================================== */
(function(){
"use strict";

var VERSION = "1.0.0";

/* ------------------------- catalogue (for prompts/desk) ------------------ */
var LIST = [
  { id:"scramble", icon:"🔤", name:"Scramble", type:"competition", core:true,
    why:"double encoding: spelling through production, meaning through the hint",
    use:'<div class="game" data-game="scramble" data-items="word=hint;…"></div>' },
  { id:"match", icon:"🔗", name:"Match", type:"competition", core:true,
    why:"recognition under time pressure — word to meaning, twice shuffled",
    use:'<div class="game" data-game="match" data-items="word=meaning;…"></div>' },
  { id:"sort", icon:"📦", name:"Sort", type:"collaboration", core:true,
    why:"categorisation out loud — the rule is argued before the chip lands",
    use:'<div class="game" data-game="sort" data-groups="GROUP: a, b | GROUP2: c"></div>' },
  { id:"board", icon:"🏟️", name:"Quiz Board", type:"competition",
    why:"retrieval under team pressure — every question carries its scaffold and its stretch",
    use:'<div class="game" data-game="board" data-cards="Q || A || support || extend ;; …"></div>' },
  { id:"tornado", icon:"🌪️", name:"Tornado Row", type:"competition",
    why:"risk literacy — expected value felt in the gut, then named",
    use:'<div class="game" data-game="tornado" data-cards="Q || A ;; …"></div>' },
  { id:"memory", icon:"🃏", name:"Memory Pairs", type:"collaboration",
    why:"paired-associate drilling — the match is spoken before it is claimed",
    use:'<div class="game" data-game="memory" data-items="word=meaning;…"></div>' },
  { id:"dice", icon:"🎲", name:"Dice Lane", type:"competition",
    why:"chance makes volume safe — the die calls on you, not the teacher",
    use:'<div class="game" data-game="dice" data-cards="Q || A ;; …"></div>' },
  { id:"reveal", icon:"🖼️", name:"Reveal", type:"collaboration",
    why:"curiosity as fuel — each correct answer uncovers the key term",
    use:'<div class="game" data-game="reveal" data-cover="KEYWORD" data-cards="Q || A ;; …"></div>' },
  { id:"order", icon:"🔢", name:"In Order", type:"collaboration",
    why:"sequencing is grammar made visible — first/then/finally said out loud",
    use:'<div class="game" data-game="order" data-order="first | then | finally"></div>' },
  { id:"voice", icon:"🎧", name:"Hear It, Type It", type:"creation",
    why:"phonics through production — the ear, then the hand, no reading first",
    use:'<div class="game" data-game="voice" data-items="word=a hint;…"></div>' }
];
var EXTRA_IDS = ["board","tornado","memory","dice","reveal","order","voice"];

/* ------------------------------- extra CSS ------------------------------- */
var CSS = [
".g-board{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin-bottom:1rem}",
".g-tile2{position:relative;min-height:64px;border-radius:.8rem;border:2px solid var(--neon-purple);background:rgba(38,38,60,.9);color:var(--text-primary);font-family:var(--font-ui);font-weight:800;font-size:1.2rem;cursor:pointer;transition:all .2s}",
".g-tile2 small{display:block;font-size:.68rem;font-weight:600;opacity:.75}",
".g-tile2:hover:not([disabled]){border-color:var(--gold);transform:translateY(-2px)}",
".g-tile2.used{opacity:.28;pointer-events:none}",
".g-tile2.spec{border-color:var(--gold);background:rgba(245,158,11,.14)}",
".g-qa{background:rgba(15,15,26,.7);border:1px solid var(--glass-border);border-radius:1rem;padding:1.1rem;margin-bottom:1rem}",
".g-qa .q{font-size:1.15rem;font-weight:700;margin-bottom:.6rem;line-height:1.5}",
".g-qa .sup{font-size:.95rem;color:#bbf7d0;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:.7rem;padding:.6rem .8rem;margin-bottom:.5rem}",
".g-qa .ext{font-size:.95rem;color:var(--gold);background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:.7rem;padding:.6rem .8rem;margin-bottom:.7rem}",
".g-qa .ans{font-size:1rem;background:rgba(38,38,60,.9);border-radius:.7rem;padding:.7rem .9rem;margin-bottom:.7rem;border-left:3px solid #22c55e}",
".g-teams{display:flex;gap:.6rem;margin-bottom:.8rem;flex-wrap:wrap}",
".g-team{flex:1;min-width:120px;text-align:center;border:2px solid var(--glass-border);border-radius:.8rem;padding:.5rem;font-weight:800}",
".g-team.on{border-color:var(--gold);box-shadow:0 0 18px rgba(245,158,11,.35)}",
".g-team b{color:var(--gold);font-size:1.3rem}",
".t-console{position:fixed;left:10px;bottom:10px;z-index:1200;background:rgba(15,15,26,.94);border:1px solid var(--glass-border);border-radius:1rem;padding:.6rem .7rem;display:flex;gap:.45rem;align-items:center;font-size:.9rem;box-shadow:0 8px 30px rgba(0,0,0,.5)}",
".t-console button{background:rgba(38,38,60,.9);border:1.5px solid var(--neon-purple);color:var(--text-primary);border-radius:999px;padding:.4rem .8rem;font-weight:700;cursor:pointer;font-family:var(--font-ui);font-size:.85rem;min-height:44px}",
".t-console button:hover{border-color:var(--gold)}",
".t-console .t-timer{font-family:JetBrains Mono,monospace;color:var(--gold);font-weight:700;min-width:64px;text-align:center}",
".t-console.hide{display:none}",
".g-mem{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:1rem}",
".g-card{min-height:58px;border-radius:.7rem;border:2px solid var(--neon-purple);background:rgba(38,38,60,.9);color:var(--text-primary);font-weight:700;cursor:pointer;font-size:.92rem;line-height:1.3;padding:.4rem}",
".g-card.face{background:rgba(15,15,26,.85);border-style:dashed}",
".g-card.done{border-color:#22c55e;background:rgba(34,197,94,.16)}",
".g-reveal{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin:.8rem 0}",
".g-cell{background:rgba(38,38,60,.95);border:1px solid var(--neon-purple);border-radius:.5rem;min-height:44px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:var(--gold)}",
".g-cell.open{background:rgba(34,197,94,.18);border-color:#22c55e}",
".g-order{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem}",
".g-step{background:rgba(38,38,60,.85);border:2px solid var(--neon-purple);border-radius:.8rem;padding:.7rem .9rem;cursor:pointer;font-weight:600}",
".g-step.ok{border-color:#22c55e;background:rgba(34,197,94,.15)}",
".g-flex{display:flex;gap:.5rem;flex-wrap:wrap;margin:.6rem 0}",
".g-input{width:100%;min-height:44px;border-radius:.6rem;border:1.5px solid var(--neon-purple);background:rgba(15,15,26,.8);color:var(--text-primary);font-size:1.05rem;padding:.6rem;font-family:var(--font-ui)}",
".g-note{font-size:.9rem;opacity:.85;margin:.4rem 0}",
"@media (max-width:520px){.g-board{grid-template-columns:repeat(4,1fr)}.g-mem{grid-template-columns:repeat(3,1fr)}}",
"@media (prefers-reduced-motion: reduce){.g-tile2,.g-card,.g-step{transition:none!important}}",
"@media print{.t-console{display:none!important}.g-qa .ans{border:1px solid #000}}"
].join("\n");

/* ------------------------------- extra JS --------------------------------
   Runs inside the BUILT lesson (offline, no deps). It initialises any
   .game whose data-game the core runtime left empty, and mounts the
   teacher console once per page.                                             */
var JS = [
"(function(){",
"'use strict';",
"function $(s,r){return (r||document).querySelector(s);}",
"function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}",
"function esc(s){return String(s==null?'':s);}",
"function coinsAdd(n){try{var c=$('#coinsCount');if(!c)return;var v=Number(c.textContent)||0;v=Math.max(0,v+(Number(n)||0));c.textContent=String(v);",
"  var tiers=[[5000,'LEGEND'],[500,'TIGER'],[200,'CUB'],[0,'MOUSE']];var t='MOUSE';for(var i=0;i<tiers.length;i++){if(v>=tiers[i][0]){t=tiers[i][1];break;}}",
"  var cr=$('#tierCrest');if(cr)cr.textContent=t;var d=$('#coinsDisplay');if(d){d.classList.remove('bump');setTimeout(function(){d.classList.add('bump');},10);}}catch(e){}}",
"var AC=null;function tone(f,dur,type){try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;",
"  AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;",
"  g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+(dur||.15));",
"  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+(dur||.15));}catch(e){}}",
"function winJingle(){tone(523,.12);setTimeout(function(){tone(659,.12);},110);setTimeout(function(){tone(784,.2);},220);}",
"function confetti(host){try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;",
"  for(var i=0;i<24;i++){var s=document.createElement('span');s.textContent=['🎉','⭐','🪙','🐯'][i%4];",
"  s.style.cssText='position:fixed;left:'+(20+Math.random()*60)+'%;top:-30px;font-size:20px;z-index:2000;pointer-events:none;transition:transform 1.4s ease-in,opacity 1.4s;';",
"  document.body.appendChild(s);(function(el){requestAnimationFrame(function(){el.style.transform='translateY('+(window.innerHeight+80)+'px) rotate('+(Math.random()*720-360)+'deg)';el.style.opacity='0';});",
"  setTimeout(function(){el.remove();},1500);})(s);}}catch(e){}}",
"function parseCards(el){var raw=el.getAttribute('data-cards')||el.getAttribute('data-items')||'';",
"  return String(raw).split(';;').map(function(p){var k=String(p).split('||');var q=String(k[0]||'').trim();if(!q)return null;",
"    var eq=q.indexOf('=');var a='',s='',x='';",
"    if(eq>0&&k.length===1){a=q.slice(eq+1).trim();q=q.slice(0,eq).trim();}",
"    else{a=String(k[1]||'').trim();s=String(k[2]||'').trim();x=String(k[3]||'').trim();}",
"    if(!a)return null;return {q:q,a:a,sup:s,ext:x};}).filter(Boolean);}",
"function head(el,name,total){el.setAttribute('data-total',String(total));el.setAttribute('data-got','0');",
"  return '<div class=\"g-head\"><span class=\"g-name\">'+esc(name)+'</span><span class=\"g-score\">0 / '+total+' done</span></div>';}",
"function done(el){var got=(Number(el.getAttribute('data-got'))||0)+1;el.setAttribute('data-got',String(got));",
"  var s=el.querySelector('.g-score'),t=Number(el.getAttribute('data-total'))||0;if(s)s.textContent=got+' / '+t+' done';",
"  if(t&&got>=t&&s)s.className='g-score win';var pay=Number(el.getAttribute('data-pay'))||10;coinsAdd(pay);winJingle();confetti(el);}",
"function qaHTML(c){return '<div class=\"g-qa\"><div class=\"q\">'+esc(c.q)+'</div>'",
"  +(c.sup?'<div class=\"sup\">🪜 Support: '+esc(c.sup)+'</div>':'')+(c.ext?'<div class=\"ext\">🚀 Stretch: '+esc(c.ext)+'</div>':'')",
"  +'<div class=\"g-flex\"><button class=\"g-btn\" data-k=\"show\">Show answer</button>'",
"  +'<button class=\"g-btn ghost\" data-k=\"ok\">✅ Correct</button><button class=\"g-btn ghost\" data-k=\"no\">❌ Miss</button></div>'",
"  +'<div class=\"g-out\"></div></div>';}",
"function wireQA(box,el,after){var out=$('.g-out',box);",
"  box.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var k=b.getAttribute('data-k');",
"    if(k==='show'){out.innerHTML='<div class=\"ans\">✅ '+esc(box._card.a)+'</div>';tone(660,.12);}",
"    else if(k==='ok'){out.innerHTML='<div class=\"ans\">✅ '+esc(box._card.a)+' — +paid</div>';box.querySelectorAll('button').forEach(function(x){x.disabled=true;});if(after)after(true);}",
"    else if(k==='no'){out.innerHTML='<div class=\"ans\">❌ '+esc(box._card.a)+' — read the support line again.</div>';tone(220,.2,'sawtooth');box.querySelectorAll('button').forEach(function(x){x.disabled=true;});if(after)after(false);}});}",
"function teamBar(el){var tA=0,tB=0,turn='A';var bar=document.createElement('div');bar.className='g-teams';",
"  bar.innerHTML='<div class=\"g-team\" data-t=\"A\">TEAM A<br><b>0</b></div><div class=\"g-team\" data-t=\"B\">TEAM B<br><b>0</b></div>';el.appendChild(bar);",
"  function paint(){var ts=$all('.g-team',bar);ts.forEach(function(x){x.classList.toggle('on',x.getAttribute('data-t')===turn);});}",
"  paint();return {bar:bar,bump:function(points){if(turn==='A')tA+=points;else tB+=points;",
"    var x=$('.g-team[data-t=\"'+turn+'\"] b',bar);if(x)x.textContent=String(turn==='A'?tA:tB);coinsAdd(points);},",
"    flip:function(){turn=(turn==='A'?'B':'A');paint();},turn:function(){return turn;},scores:function(){return {A:tA,B:tB};}};}",
"function gBoard(el){var cards=parseCards(el);if(!cards.length){el.innerHTML='<div class=\"g-name\">add data-cards to this board</div>';return;}",
"  var vals=[10,10,15,15,20,20];var specs=['DOUBLE','HALF','STEAL','SWAP','STORM','+30'];",
"  el.innerHTML=head(el,el.getAttribute('data-title')||'🏟️ Quiz Board — teams, first to 150',cards.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var teams=teamBar(body);",
"  var grid=document.createElement('div');grid.className='g-board';body.appendChild(grid);",
"  var zone=document.createElement('div');body.appendChild(zone);",
"  var order=cards.map(function(c,i){return i;});for(var i=order.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=order[i];order[i]=order[j];order[j]=t;}",
"  order.slice(0,Math.min(16,cards.length)).forEach(function(ci,n){var sp=n>=12?specs[n-12]:null;",
"    var pts=sp?0:vals[n%vals.length];var b=document.createElement('button');b.className='g-tile2'+(sp?' spec':'');",
"    b.innerHTML=(sp||('+'+pts))+'<small>'+(sp?'special':'team '+teams.turn())+'</small>';b._ci=ci;b._pts=pts;b._sp=sp;",
"    b.addEventListener('click',function(){if(b.disabled)return;b.disabled=true;b.classList.add('used');openQ(b);});grid.appendChild(b);});",
"  function mult(sp){if(sp==='DOUBLE')return 2;if(sp==='HALF')return .5;return 1;}",
"  function openQ(tile){var c=cards[tile._ci];var box=document.createElement('div');box._card=c;box.innerHTML=qaHTML(c);zone.innerHTML='';zone.appendChild(box);",
"    if(tile._sp==='STORM'){var d=document.createElement('div');d.className='g-note';d.textContent='🌪️ STORM: the whole class answers — teacher judges the ROOM, not a team.';box.appendChild(d);}",
"    wireQA(box,el,function(ok){var base=(tile._sp==='+30')?30:(tile._pts||10);var pts=Math.round(base*mult(tile._sp));",
"      if(tile._sp==='STEAL'&&ok){teams.bump(pts);teams.flip();teams.bump(0-0);}else if(ok){teams.bump(pts);}",
"      if(tile._sp==='SWAP'){var s=teams.scores();teams.bump(0);}",
"      teams.flip();",
"      if(ok)done(el);else tone(220,.2,'sawtooth');",
"      zone.scrollIntoView&&zone.scrollIntoView({block:'nearest'});});",
"    box.scrollIntoView&&box.scrollIntoView({block:'nearest'});}}",
"function gTornado(el){var cards=parseCards(el);if(!cards.length)return;",
"  el.innerHTML=head(el,el.getAttribute('data-title')||'🌪️ Tornado Row',cards.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var grid=document.createElement('div');grid.className='g-board';body.appendChild(grid);",
"  var zone=document.createElement('div');body.appendChild(zone);",
"  var hide=[10,20,0,10,'🌪️',20,10,0,15,'🌪️',10,20];",
"  cards.forEach(function(c,n){var b=document.createElement('button');b.className='g-tile2';b.innerHTML='?'+'<small>pick me</small>';",
"    b.addEventListener('click',function(){if(b.disabled)return;b.disabled=true;b.classList.add('used');var h=hide[n%hide.length];",
"      if(h==='🌪️'){b.textContent='🌪️';zone.innerHTML='<div class=\"g-qa\"><div class=\"q\">🌪️ TORNADO! Answer to survive it.</div></div>';}",
"      var box=document.createElement('div');box._card=c;box.innerHTML=qaHTML(c);zone.appendChild(box);",
"      wireQA(box,el,function(ok){if(!ok)return;if(h==='🌪️'){coinsAdd(-10);tone(180,.3,'sawtooth');}else{done(el);}});});grid.appendChild(b);});}",
"function gMemory(el){var raw=el.getAttribute('data-items')||el.getAttribute('data-cards')||'';",
"  var pairs=String(raw).split(';').map(function(p){var k=String(p).split(/[=|][|]?/);var a=(k[0]||'').trim();var b=(k[1]||k[0]||'').trim();return (a&&b)?{a:a,b:b}:null;}).filter(Boolean).slice(0,8);",
"  if(!pairs.length)return;el.innerHTML=head(el,el.getAttribute('data-title')||'🃏 Memory Pairs',pairs.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var grid=document.createElement('div');grid.className='g-mem';body.appendChild(grid);",
"  var note=document.createElement('div');note.className='g-note';note.textContent='Say it OUT LOUD before you claim the pair.';body.appendChild(note);",
"  var deck=[];pairs.forEach(function(p,i){deck.push({t:p.a,k:i});deck.push({t:p.b,k:i});});",
"  deck.sort(function(){return Math.random()-.5;});var first=null,lock=false,turns=0;",
"  deck.forEach(function(d){var b=document.createElement('button');b.className='g-card face';b.textContent='?';b._k=d.k;b._t=d.t;",
"    b.addEventListener('click',function(){if(lock||b.classList.contains('done')||b===first)return;tone(500,.08);b.classList.remove('face');b.textContent=d.t;",
"      if(!first){first=b;return;}turns++;var a=first;first=null;",
"      if(a._k===b._k){a.classList.add('done');b.classList.add('done');a.disabled=true;b.disabled=true;done(el);}",
"      else{lock=true;setTimeout(function(){a.classList.add('face');a.textContent='?';b.classList.add('face');b.textContent='?';lock=false;},800);}});",
"    grid.appendChild(b);});}",
"function gDice(el){var cards=parseCards(el);if(!cards.length)return;",
"  el.innerHTML=head(el,el.getAttribute('data-title')||'🎲 Dice Lane — roll, answer, earn face×10',cards.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var row=document.createElement('div');row.className='g-flex';",
"  row.innerHTML='<button class=\"g-btn\" data-k=\"roll\">🎲 Roll</button><span class=\"g-note\" data-k=\"face\">roll to begin</span>';body.appendChild(row);",
"  var zone=document.createElement('div');body.appendChild(zone);var idx=0;",
"  row.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;",
"    var f=1+Math.floor(Math.random()*6);$('[data-k=\"face\"]',row).textContent='rolled '+f+' — answer lane '+f;tone(300+f*80,.12);",
"    var c=cards[idx%cards.length];idx++;var box=document.createElement('div');box._card=c;box._pay=f*10;box.innerHTML=qaHTML(c);zone.innerHTML='';zone.appendChild(box);",
"    wireQA(box,el,function(ok){if(ok){coinsAdd(f*10-10);done(el);} });});}",
"function gReveal(el){var cards=parseCards(el);var cover=String(el.getAttribute('data-cover')||'KEYWORD').toUpperCase().replace(/[^A-Z ]/g,'')||'KEY';",
"  el.innerHTML=head(el,el.getAttribute('data-title')||'🖼️ Reveal — uncover the key term',cards.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var grid=document.createElement('div');grid.className='g-reveal';body.appendChild(grid);",
"  var cells=cover.split('').map(function(ch){var d=document.createElement('div');d.className='g-cell';d.textContent=ch===' '?' ' :'?';d._ch=ch;grid.appendChild(d);return d;});",
"  var zone=document.createElement('div');body.appendChild(zone);var qi=0,opened=0;",
"  function next(){if(qi>=cards.length){zone.innerHTML='<div class=\"g-qa\"><div class=\"q\">The key term is: <b>'+esc(cover)+'</b> — say it in a full sentence.</div></div>';return;}",
"    var c=cards[qi];var box=document.createElement('div');box._card=c;box.innerHTML=qaHTML(c);zone.innerHTML='';zone.appendChild(box);",
"    wireQA(box,el,function(ok){if(!ok){next();return;}qi++;for(var n=0;n<2&&opened<cells.length;n++){var k=opened;while(k<cells.length&&cells[k]._ch===' ')k++;if(k<cells.length){cells[k].textContent=cells[k]._ch;cells[k].classList.add('open');opened=k+1;}}done(el);next();});}",
"  next();}",
"function gOrder(el){var items=String(el.getAttribute('data-order')||'').split('|').map(function(s){return s.trim();}).filter(Boolean);",
"  if(items.length<2){items=(el.getAttribute('data-items')||'').split(';').map(function(s){return s.trim();}).filter(Boolean);}",
"  if(items.length<2)return;el.innerHTML=head(el,el.getAttribute('data-title')||'🔢 In Order — tap first → last',1)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var wrap=document.createElement('div');wrap.className='g-order';body.appendChild(wrap);",
"  var note=document.createElement('div');note.className='g-note';note.textContent='Say each step as you place it: first…, then…, finally…';body.appendChild(note);",
"  var shuffled=items.slice().sort(function(){return Math.random()-.5;});var want=0;",
"  shuffled.forEach(function(t){var b=document.createElement('button');b.className='g-step';b.textContent=t;",
"    b.addEventListener('click',function(){if(b.classList.contains('ok'))return;",
"      if(t===items[want]){b.classList.add('ok');tone(600+want*120,.12);want++;if(want>=items.length){done(el);note.textContent='✅ The full sequence — now retell it without looking.';}}",
"      else{tone(200,.2,'sawtooth');b.style.borderColor='#ef4444';setTimeout(function(){b.style.borderColor='';},600);}});wrap.appendChild(b);});}",
"function gVoice(el){var raw=el.getAttribute('data-items')||el.getAttribute('data-cards')||'';",
"  var items=String(raw).split(';').map(function(p){var k=String(p).split('=');return {a:(k[0]||'').trim(),h:(k[1]||k.slice(1).join('=')||'').trim()};}).filter(function(x){return x.a;}).slice(0,8);",
"  if(!items.length)return;el.innerHTML=head(el,el.getAttribute('data-title')||'🎧 Hear It, Type It',items.length)+'<div class=\"g-body\"></div>';",
"  var body=$('.g-body',el);var zone=document.createElement('div');body.appendChild(zone);var i=0;",
"  function speak(t){try{var u=new SpeechSynthesisUtterance(t);u.lang=el.getAttribute('data-lang')||'en-GB';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}",
"  function next(){if(i>=items.length){zone.innerHTML='<div class=\"g-note\">✅ Ear done — these words are yours now.</div>';return;}",
"    var it=items[i];zone.innerHTML='<div class=\"g-qa\"><div class=\"q\">🔊 Listen, then type what you hear'+(it.h?' <span class=\"g-note\">('+esc(it.h)+')</span>':'')+'</div>'",
"    +'<div class=\"g-flex\"><button class=\"g-btn\" data-k=\"hear\">🔊 Hear it</button></div>'",
"    +'<input class=\"g-input\" data-k=\"in\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\" placeholder=\"type exactly what you heard…\">'",
"    +'<div class=\"g-flex\"><button class=\"g-btn\" data-k=\"go\">Check</button></div><div class=\"g-out\"></div></div>';",
"    var box=$('.g-qa',zone);speak(it.a);",
"    box.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var k=b.getAttribute('data-k');",
"      if(k==='hear'){speak(it.a);return;}",
"      if(k==='go'){var v=$('[data-k=\"in\"]',box).value.trim().toLowerCase();",
"        if(v===it.a.toLowerCase()){$('.g-out',box).innerHTML='<div class=\"ans\">✅ '+esc(it.a)+' — spelled by ear.</div>';i++;done(el);setTimeout(next,700);}",
"        else{$('.g-out',box).innerHTML='<div class=\"ans\">❌ Not quite — hear it again, then try.</div>';tone(220,.2,'sawtooth');speak(it.a);}}});}",
"  next();}",
"var MAP={board:gBoard,tornado:gTornado,memory:gMemory,dice:gDice,reveal:gReveal,order:gOrder,voice:gVoice};",
"function initExtra(root){if(!root||!root.querySelectorAll)return;var did=false;",
"  $all('.game',root).forEach(function(el){if(el._ars)return;if(el.innerHTML&&el.innerHTML.replace(/\s/g,''))return;var g=el.getAttribute('data-game');if(!g||!MAP[g])return;el._ars=true;",
"    try{MAP[g](el);did=true;}catch(e){el.innerHTML='<div class=\"g-note\">this game could not start</div>';}});",
"  mountConsole(root);return did;}",
"var timerInt=null,timerLeft=0;function mountConsole(root){if(document.getElementById('tConsole'))return;",
"  var bar=document.createElement('div');bar.className='t-console hide';bar.id='tConsole';",
"  bar.innerHTML='<button data-k=\"tgl\">🧑‍🏫 Teacher</button><span class=\"t-timer\" data-k=\"clock\">05:00</span>'",
"  +'<button data-k=\"t60\">1′</button><button data-k=\"t300\">5′</button><button data-k=\"pick\">🎲 Picker</button>'",
"  +'<button data-k=\"snd\">🔊</button><button data-k=\"hide\">✕</button>';document.body.appendChild(bar);",
"  var show=document.createElement('button');show.className='g-btn ghost';show.textContent='🧑‍🏫';show.setAttribute('aria-label','teacher console');",
"  show.style.cssText='position:fixed;right:10px;bottom:10px;z-index:1200;';show.onclick=function(){bar.classList.remove('hide');show.style.display='none';};",
"  document.body.appendChild(show);var snd=true;",
"  function fmt(s){var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r;}",
"  function tick(){if(timerLeft<=0){clearInterval(timerInt);timerInt=null;var c=$('[data-k=\"clock\"]',bar);if(c)c.textContent='TIME!';tone(880,.3);tone(880,.3);return;}timerLeft--;var c2=$('[data-k=\"clock\"]',bar);if(c2)c2.textContent=fmt(timerLeft);if(timerLeft<=10)tone(440,.1);}",
"  bar.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var k=b.getAttribute('data-k');",
"    if(k==='hide'){bar.classList.add('hide');show.style.display='';}",
"    else if(k==='t60'){timerLeft=60;if(timerInt)clearInterval(timerInt);timerInt=setInterval(tick,1000);}",
"    else if(k==='t300'){timerLeft=300;if(timerInt)clearInterval(timerInt);timerInt=setInterval(tick,1000);}",
"    else if(k==='snd'){snd=!snd;b.textContent=snd?'🔊':'🔇';}",
"    else if(k==='pick'){var terms=$all('.vocab-item strong').map(function(x){return x.textContent.replace(/^\\d+\\.\\s*/,\"\");});",
"      if(!terms.length)terms=$all('.g-item').map(function(x){return x.textContent;});",
"      var w=terms.length?terms[Math.floor(Math.random()*terms.length)]:'no terms on this page';",
"      b.textContent='🎲 '+String(w).slice(0,24);tone(500+Math.random()*400,.12);}",
"    else if(k==='tgl'){var on=b.getAttribute('data-on')==='1';b.setAttribute('data-on',on?'0':'1');b.textContent=on?'🧑‍🏫 Teacher':'🧑‍🏫 On';}});}",
"if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){initExtra(document);});}else{initExtra(document);}",
"if(window.MutationObserver){new MutationObserver(function(m){m.forEach(function(x){x.addedNodes&&Array.prototype.forEach.call(x.addedNodes,function(n){if(n.nodeType===1)initExtra(n);});});}).observe(document.documentElement,{childList:true,subtree:true});}",
"window.ObiGamesArsenalExtra={init:initExtra};",
"})();"
].join("\n");

/* ------------------------------ installer -------------------------------- */
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function install(){
  var L = window.ObiLessons;
  if(!L || !L.build || L._arsenalInstalled) return false;
  var coreBuild = L.build;
  L.build = function(spec){
    var out = coreBuild(spec);
    try{
      var html = String(out.html || "");
      if(html.indexOf("ObiGamesArsenalExtra") === -1){
        html = html.replace("</style>", CSS + "\n</style>");
        html = html.replace(/<\/body>/i, "<script>\n" + JS + "\n<\/script>\n</body>");
        out.html = html; out.bytes = html.length;
      }
    }catch(e){}
    return out;
  };
  L._arsenalInstalled = true;
  L.GAMES_EXTRA = EXTRA_IDS.slice();
  L.GAMES_ALL = (L.GAMES_ALL || ["scramble","match","sort"]).concat(EXTRA_IDS.filter(function(id){ return (L.GAMES_ALL||[]).indexOf(id)===-1; }));
  try{ if(L.THEME && L.THEME.indexOf(".g-board")===-1) L.THEME.push(CSS); }catch(e){}
  return true;
}

window.ObiGamesArsenal = {
  VERSION: VERSION, LIST: LIST, EXTRA_IDS: EXTRA_IDS,
  CSS: CSS, JS: JS, install: install,
  describe: function(){ return LIST.map(function(g){ return (g.core?"core":"new")+" "+g.icon+" "+g.id+" ("+g.type+") — "+g.why; }).join("\n"); }
};

try{ install(); }catch(e){}
})();
