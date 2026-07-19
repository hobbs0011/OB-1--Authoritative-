# RAW VERBATIM — AIPET.txt
## Corpus Metadata
- chunk_seq   : 0164
- chunk_id    : 0164-RAW-AIPET_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\AIPET.txt
- sha256      : 1E2983ABA31594D4E6E6D776CAC38FDBB8CE77372F96F3D6B73E58859A1F62CF
- size_bytes  : 4460
- lines       : 85
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX

---

<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Phoenix Quick Launch</title>
  <style>
    body{font-family:Arial;background:#111;color:#eee;margin:0;padding:12px}
    header{font-size:1.2rem;padding:8px 0;text-align:center}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .panel{background:#222;padding:12px;border-radius:8px}
    .bar{height:18px;background:#333;border-radius:6px;overflow:hidden;margin:6px 0}
    .fill{height:100%;background:#4caf50;transition:width .3s}
    button{padding:8px 10px;margin:6px;border-radius:6px;border:none;background:#444;color:#fff;cursor:pointer}
    .log{height:160px;overflow:auto;background:#000;padding:6px;border-radius:6px;font-size:.85rem}
  </style>
</head>
<body>
<header>PHOENIX QUICK LAUNCH (single-file)</header>

<div class="grid">
  <div class="panel">
    <h3>Pet: Nova</h3>
    <div>Energy<div class="bar"><div id="p1energy" class="fill" style="width:80%"></div></div></div>
    <div>Hunger<div class="bar"><div id="p1hunger" class="fill" style="width:20%"></div></div></div>
    <div>Happiness<div class="bar"><div id="p1happy" class="fill" style="width:80%"></div></div></div>
    <button id="feed1">Feed</button><button id="play1">Play</button>
  </div>

  <div class="panel">
    <h3>Pet: Zoe</h3>
    <div>Energy<div class="bar"><div id="p2energy" class="fill" style="width:60%"></div></div></div>
    <div>Hunger<div class="bar"><div id="p2hunger" class="fill" style="width:30%"></div></div></div>
    <div>Happiness<div class="bar"><div id="p2happy" class="fill" style="width:70%"></div></div></div>
    <button id="feed2">Feed</button><button id="play2">Play</button>
  </div>

  <div class="panel" style="grid-column:1/3">
    <h3>XP / Lessons</h3>
    <div>XP<div class="bar"><div id="xp" class="fill" style="width:10%"></div></div></div>
    <div>Level <span id="lvl">1</span></div>
    <div>Lessons completed <span id="lc">0</span>/200</div>
    <button id="complete">Complete Random Lesson</button>
    <h4>Telemetry</h4>
    <div class="log" id="log"></div>
  </div>
</div>

<script>
/* ---------- MINI PHOENIX ENGINE ---------- */
window.PhoenixRisingControls=(function(){
 const S={Pet1:{name:"Nova",energy:80,hunger:20,happiness:80,XP:0,Level:1,completed:new Set()},
          Pet2:{name:"Zoe",energy:60,hunger:30,happiness:70},chat:[]};
 const log=(m,l="INFO")=>{
   S.chat.push({t:new Date().toLocaleTimeString(),l,m});
   if(S.chat.length>40)S.chat.shift();
   document.getElementById('log').innerHTML=S.chat.map(e=>`[${e.t}] ${e.l}: ${e.m}`).join('<br>');
 };
 const update=()=>{
   const P1=S.Pet1,P2=S.Pet2;
   document.getElementById('p1energy').style.width=P1.energy+'%';
   document.getElementById('p1hunger').style.width=P1.hunger+'%';
   document.getElementById('p1happy').style.width=P1.happiness+'%';
   document.getElementById('p2energy').style.width=P2.energy+'%';
   document.getElementById('p2hunger').style.width=P2.hunger+'%';
   document.getElementById('p2happy').style.width=P2.happiness+'%';
   document.getElementById('xp').style.width=(P1.XP%1000)/10+'%';
   document.getElementById('lvl').textContent=P1.Level;
   document.getElementById('lc').textContent=P1.completed.size;
 };
 const feed=(p)=>{p.hunger=Math.max(0,p.hunger-20);p.happiness=Math.min(100,p.happiness+10);log(`Fed ${p.name}`);update();};
 const play=(p)=>{p.energy=Math.max(0,p.energy-10);p.happiness=Math.min(100,p.happiness+15);log(`Played with ${p.name}`);update();};
 const lesson=()=>{S.Pet1.completed.add(Math.random());S.Pet1.XP+=20;S.Pet1.Level=1+Math.floor(S.Pet1.XP/1000);
                   log("Lesson complete +20XP");update();};
 return{Pet1:S.Pet1,Pet2:S.Pet2,override:{feed,play,completeLesson:lesson},chatLog:()=>S.chat};
})();
document.getElementById('feed1').onclick=()=>PhoenixRisingControls.override.feed(PhoenixRisingControls.Pet1);
document.getElementById('play1').onclick=()=>PhoenixRisingControls.override.play(PhoenixRisingControls.Pet1);
document.getElementById('feed2').onclick=()=>PhoenixRisingControls.override.feed(PhoenixRisingControls.Pet2);
document.getElementById('play2').onclick=()=>PhoenixRisingControls.override.play(PhoenixRisingControls.Pet2);
document.getElementById('complete').onclick=()=>PhoenixRisingControls.override.completeLesson();
</script>
</body>
</html>

