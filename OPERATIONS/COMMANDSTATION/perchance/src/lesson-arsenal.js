/* PORTED 2026-10-22 from eff-gen-agent99-anakin (Anakin station, save 2) — iconography, 6 templates, method-KSU, worksheet, bank, a11y, validator+. Wraps core ObiLessons without rewriting. + edtech save-10 bank lane (bankCmd/bankHelp/boardRoom/escHtml, v1.2.0). */
/* ============================================================================
   NET ACADEMY — LESSON ARSENAL (src/lesson-arsenal.js)
   Improvements 1,3,5,7,8,9,10 of the chaos 10. Loads AFTER src/lessons.js
   (and after src/games-arsenal.js). Wraps — never rewrites — ObiLessons.

   1. ICONOGRAPHY ARSENAL — 116 brand icons usable inside lessons:
      features/tools accept "brand:<name>" or "icon:<name>"; build inlines
      the SVG so the standalone .html stays offline. Bare emoji still works.
   3. TEMPLATE ARSENAL — 6 starters (vocab / grammar / song / video /
      reading / boss-fight review) + /lesson template <name>.
   5. KSU + DIFFERENTIATION — method.outcomes {knowledge, skills,
      understanding} + per-activity support/extend; checked-when-present.
   7. WORKSHEET EXPORT — printable worksheet + answer key from any spec.
   8. BANK GENERATOR — transcript/curriculum text → game bank JSON in kv.
   9. A11Y + VN + MOBILE — extra CSS + lang help, honours reduced motion.
   10. VALIDATOR+ — wraps validate(): new games, icon names, KSU, templates.
   ========================================================================== */
(function(){
"use strict";
var VERSION = "1.2.0";

/* ---------------- 1. iconography arsenal ---------------- */
var CLASSROOM_ICONS = ["book","cap","ear","speak","pencil","cards","stack","timer","bell","handUp","ladder","medal","certificate","gamepad","megaphone","tiger","paw","mouse","crown","coin","trophy","star","chat","mic","wave","headphones","eye","video","image","doc","clipboard","log","key","lock","shield","radar","hammer","flame","bolt","spark","seal","compass","gauge","target","brain","users","user","map","calendar","clock","chart","terminal","globe","search","flag","play","pause","record","timer","timer"];
function uniq(a){ var s={},o=[]; a.forEach(function(x){ if(!s[x]){ s[x]=1; o.push(x); } }); return o; }
CLASSROOM_ICONS = uniq(CLASSROOM_ICONS);

function brandHas(name){ try{ return window.ObiBrand && window.ObiBrand.has && window.ObiBrand.has(name); }catch(e){ return false; } }
function brandIcon(name, size){
  try{
    if(window.ObiBrand && window.ObiBrand.icon) return window.ObiBrand.icon(name, { size: size || "1em" });
  }catch(e){}
  return null;
}
/* "brand:gamepad" / "icon:timer" / "gamepad" → inline SVG or null */
function resolveIconToken(tok, size){
  var t = String(tok == null ? "" : tok).trim();
  var m = t.match(/^(?:brand|icon)\s*:\s*([a-zA-Z0-9_-]+)$/);
  var name = m ? m[1] : (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(t) && !/[\u{1F000}-\u{1FAFF}]/u.test(t) ? t : null);
  if(!name || !brandHas(name)) return null;
  return brandIcon(name, size);
}
function featureIconHTML(icon){
  var svg = resolveIconToken(icon, "3.2rem");
  if(svg) return svg;
  return String(icon == null ? "" : icon);
}

/* ---------------- 3. template arsenal ---------------- */
function vocabRoom(n, terms){
  var items = terms.map(function(t,i){ return '<div class="vocab-item"><strong>'+(i+1)+'. '+t.term+':</strong> <span>'+t.def+'</span></div>'; }).join("");
  return { graphic:"📚", title:"The Words", label:"Learn",
    content:'<div class="vocab-list">'+items+'</div>' };
}
function testRoom(blocks){
  var bs = blocks.map(function(b){
    var btns = b.choices.map(function(c){ return '<button data-answer="'+(c.ok?"correct":"wrong")+'">'+c.t+'</button>'; }).join("");
    return '<div class="chatty-choices" data-correct-feedback="'+b.okFb+'" data-wrong-feedback="'+b.noFb+'"><div><strong>Scenario:</strong> '+b.q+'</div>'+btns+'</div>';
  }).join("");
  return { graphic:"🎯", title:"The Test", label:"Test", content: bs + '<div class="chatty-feedback empty"></div>' };
}
function boardRoom(cards, title){
  var c = cards.map(function(x){ return x.q+" || "+x.a+(x.sup?" || "+x.sup:"")+(x.ext?" || "+x.ext:""); }).join(" ;; ");
  return { graphic:"🏟️", title: title || "The Arena", label:"Game",
    content:'<div class="chatty-hint"><strong>How to play:</strong> Teams A/B take turns. Teacher taps Correct/Wrong — every question shows its support scaffold and stretch.</div><div class="game" data-game="board" data-cards="'+c.replace(/"/g,"&quot;")+'"></div>' };
}
var TEMPLATES = {
  vocab: { name:"Vocab Sprint", desc:"5 terms → scenes use them → test → arena",
    make: function(topic){ return { topic:topic||"Vocab", title:(topic||"Vocab")+" Academy", logo:"📚",
      subtitle:"Five words you will actually use — with a wink 😉", cta:"🚀 Begin Your Journey",
      features:[{icon:"brand:book",title:"5 Real Words",desc:"The exact terms the scenes use."},{icon:"brand:gamepad",title:"Arena",desc:"Teams battle on the board."},{icon:"brand:key",title:"The Key",desc:"Leave with the rule."}],
      coins:{start:0,correct:10,wrong:0}, method:{structure:"10-5-5-3",phase:"Vocab",
      outcomes:{knowledge:"recall the 5 terms and their meanings",skills:"use each term in a spoken sentence",understanding:"explain when the term fits and when it does not"},
      games:[
        {name:"Quiz Board",type:"competition",why:"retrieval under team pressure"},
        {name:"Memory Pairs",type:"collaboration",why:"paired drilling, spoken before claimed"},
        {name:"Hear It Type It",type:"creation",why:"phonics through the ear then the hand"}]},
      rooms:[
        {graphic:"🏠",title:"The Entrance",label:"Warm-Up",content:"<p>Welcome! Today "+topic+" gets loud.</p><ul><li>Five words you will own</li><li>Two scenes where they live</li><li>One arena to win them</li></ul>"},
        {graphic:"🖥️",title:"The Scene",label:"Scene",content:'<div class="dialogue-block"><span class="speaker">Minh:</span> I forgot the words again…</div><div class="dialogue-block"><span class="speaker">Linh:</span> Then we win them back — one game at a time.</div><div class="chatty-clue">🤔 Reality check: forgetting in class is normal; forgetting without a game to win them back is the problem.</div>'},
        {graphic:"📱",title:"The Group Chat",label:"Text Scene",content:'<div class="dialogue-block"><span class="speaker">Minh:</span> rematch?? 📱🙃</div><div class="dialogue-block"><span class="speaker">Linh:</span> arena after class 💪</div><div class="chatty-clue">🤔 Reality check: the chat is where the words survive.</div><div class="chatty-hint"><strong>Pro Tip:</strong> use each new word once today outside class.</div>'},
        vocabRoom(5,[{term:"Word 1",def:"replace with the row's own words"},{term:"Word 2",def:"… "},{term:"Word 3",def:"… "},{term:"Word 4",def:"… "},{term:"Word 5",def:"… "}]),
        testRoom([{q:"Which line uses the word right?",choices:[{t:"correct use",ok:true},{t:"wrong use",ok:false}],okFb:"Yes — that is exactly the transfer.",noFb:"Not quite — reread the support line above."}]),
        boardRoom([{q:"Use Word 1 in a sentence",a:"any correct sentence",sup:"sentence frame: I ___ every day.",ext:"add a time clause"},{q:"Use Word 2 in a sentence",a:"any correct sentence",sup:"sentence frame: She ___ yesterday.",ext:"add a reason with because"},{q:"Use Word 3 in a sentence",a:"any correct sentence",sup:"sentence frame: They ___ at school.",ext:"ask a follow-up question"},{q:"Use Word 4 in a sentence",a:"any correct sentence",sup:"sentence frame: We ___ after class.",ext:"retell it without looking"}]),
        {graphic:"🔑",title:"The Key",label:"Mastery",content:'<div class="summary-card"><strong>🎓 You hold the words</strong><ul><li><strong>Say it:</strong> use each word once today.</li><li><strong>Write it:</strong> one sentence per word.</li><li><strong>Win it:</strong> rematch in the arena.</li></ul></div><div class="chatty-hint"><strong>Level Up:</strong> teach one word to someone at home.</div>'}
      ]}; } },
  grammar: { name:"Grammar Engine", desc:"one rule → scenes → drill → order game",
    make: function(topic){ var b=TEMPLATES.vocab.make(topic); b.title=(topic||"Grammar")+" Academy"; b.rooms[3]=vocabRoom(5,[{term:"Rule part 1",def:"one line"},{term:"Rule part 2",def:"one line"},{term:"Rule part 3",def:"one line"},{term:"Rule part 4",def:"one line"},{term:"Rule part 5",def:"one line"}]);
      b.rooms.splice(5,0,{graphic:"🔢",title:"Put It In Order",label:"Game",content:'<div class="game" data-game="order" data-order="first step | then step | finally step"></div>'});
      return b; } },
  song: { name:"Song Room", desc:"chant → lyric hunt → act it out",
    make: function(topic){ var b=TEMPLATES.vocab.make(topic); b.rooms.splice(2,0,{graphic:"🎵",title:"The Chant",label:"Song",content:'<div class="reading">Chant from the unit\'s own target words — teacher pastes the school lyrics over this verbatim when allowed.</div><div class="chatty-choices" data-correct-feedback="Yes — that word tells you HOW." data-wrong-feedback="Listen again — which word tells you how?"><div><strong>Lyric hunt:</strong> which word tells you HOW it is done?</div><button data-answer="correct">the -ly word</button><button data-answer="wrong">a naming word</button></div><div class="chatty-feedback empty"></div><div class="chatty-hint"><strong>Act it out:</strong> mime one line, partner returns it in a full sentence.</div>'});
      return b; } },
  video: { name:"Video Room", desc:"transcript → comprehension → definitions from memory",
    make: function(topic){ var b=TEMPLATES.vocab.make(topic); b.rooms.splice(2,0,{graphic:"🎬",title:"The Video",label:"Video",content:'<div class="reading">Transcript goes here (verbatim when the school provides it).</div><div class="chatty-choices" data-correct-feedback="Yes — the transcript says so." data-wrong-feedback="Rewatch that line — the answer is spoken, not guessed."><div><strong>Circle it:</strong> what did they actually say?</div><button data-answer="correct">the spoken line</button><button data-answer="wrong">the guessed line</button></div><div class="chatty-feedback empty"></div>'});
      return b; } },
  reading: { name:"Reading Sprint", desc:"short text → hunt → sort the ideas",
    make: function(topic){ var b=TEMPLATES.vocab.make(topic); b.rooms.splice(4,0,{graphic:"📖",title:"The Text",label:"Reading",content:'<div class="reading">Two short paragraphs, school level. Longest block two sentences.</div><div class="game" data-game="sort" data-groups="TRUE: line one, line two | FALSE: the trap line"></div>'});
      return b; } },
  bossfight: { name:"Boss Fight Review", desc:"mixed test → tornado risk → reveal key",
    make: function(topic){ var b=TEMPLATES.vocab.make(topic); b.title="Boss Fight: "+(topic||"Review"); b.rooms.splice(5,0,
      {graphic:"🌪️",title:"Risk Row",label:"Game",content:'<div class="game" data-game="tornado" data-cards="Q1 || A1 ;; Q2 || A2 ;; Q3 || A3"></div>'},
      {graphic:"🖼️",title:"Final Reveal",label:"Game",content:'<div class="game" data-game="reveal" data-cover="THE KEY RULE" data-cards="Q1 || A1 ;; Q2 || A2"></div>'});
      return b; } }
};

/* ---------------- 5. KSU + differentiation ---------------- */
function checkKSU(spec){
  var errs=[], warns=[];
  var m = spec && spec.method;
  /* VENDOR SHIM (command, 2026-10-22 — ported from edtech mastermind: core KSU triple accepted, silence preserved): the core carries the KSU triple at
     spec.outcomes {know, do, understand} (LSN-33…36, checked-when-present).
     A spec that declares it there is covered — no duplicate warning; a spec
     with neither dialect stays legal and silent, exactly like the core. */
  var co = spec && spec.outcomes;
  if(co && typeof co === "object" && co.know && co.do && co.understand) return { errs:errs, warns:warns };
  if(!m || typeof m !== "object") return { errs:errs, warns:warns };
  var o = m.outcomes;
  if(!o || typeof o !== "object"){ warns.push("method.outcomes missing — declare {knowledge, skills, understanding} (checked-when-present)"); }
  else{
    ["knowledge","skills","understanding"].forEach(function(k){
      if(!o[k] || !String(o[k]).trim()) errs.push("method.outcomes."+k+" is empty — one line each: what they KNOW, can DO, and UNDERSTAND");
    });
  }
  (spec.rooms||[]).forEach(function(r,i){
    var c = String((r&&r.content)||"");
    if(/data-game="(board|tornado|dice|reveal)"/.test(c) && c.indexOf("||") === -1 && c.indexOf("data-cards") !== -1)
      warns.push("room "+(i+1)+": arena game without support||extend — add 'Q || A || support || extend' so every question scaffolds and stretches");
  });
  return { errs:errs, warns:warns };
}

/* ---------------- 7. worksheet export ---------------- */
function stripTags(s){ return String(s||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(); }
function worksheetHTML(spec, withAnswers){
  var L = window.ObiLessons;
  var rows = (spec.rooms||[]).map(function(r,i){
    var c = String(r.content||"");
    var vocab = (c.match(/vocab-item[\s\S]*?<\/div>/g)||[]).map(stripTags);
    var choices = (c.match(/chatty-choices[\s\S]*?(?=<div class="chatty-choices|<div class="game|$)/g)||[]);
    return { i:i+1, title:r.title, label:r.label, vocab:vocab, raw:c };
  });
  var h = [];
  h.push('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>'+spec.title+' — Worksheet'+(withAnswers?' (Answer Key)':'')+'</title>');
  h.push('<style>body{font-family:Inter,system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#111}h1{font-size:1.6rem}h2{font-size:1.1rem;margin-top:1.6rem;border-bottom:2px solid #a855f7}li{margin:.4rem 0}.write{border:1px solid #999;border-radius:.5rem;min-height:70px;margin:.6rem 0}@media print{.noprint{display:none}}</style></head><body>');
  h.push('<h1>'+spec.title+' — Worksheet'+(withAnswers?' (Answer Key)':'')+'</h1><p>Name: ______________  Class: ______  Date: ______</p>');
  rows.forEach(function(r){
    if(!r.vocab.length && r.raw.indexOf("chatty-choices")===-1 && r.raw.indexOf('data-game')===-1) return;
    h.push('<h2>Room '+r.i+': '+r.title+'</h2>');
    r.vocab.forEach(function(v){ h.push('<li>'+v+'</li>'); });
    var blocks = r.raw.match(/<div class="chatty-choices[\s\S]*?<\/div>\s*(?=<div|<button|$)/g) || [];
    h.push('<p><em>'+(blocks.length? blocks.length+' question(s) — circle the answer on your sheet.' : '')+'</em></p>');
    var games = (r.raw.match(/data-game="([a-z]+)"/g)||[]).join(" ");
    if(games) h.push('<p>🎮 In class: '+games+' '+(withAnswers?'(played on the board)':'(played on the board)')+'</p>');
    h.push('<div class="write"></div>');
  });
  h.push('<p class="noprint"><button onclick="window.print()">🖨️ Print</button></p></body></html>');
  return h.join("\n");
}

/* ---------------- 8. bank generator ---------------- */
function folder(name){ try{ return (root && root.kv) ? (root.kv[name] || null) : null; }catch(e){ return null; } }
/* BANK LANE v1.2.0 (edtech save 10, vendored 2026-10-22 — byte-identical logic, provenance: that station filed REAL bank Bmvip64wg) */
function escHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]; }); }
function bankHelp(){
  return '<div class="rise"><div class="rhead">BANK filed</div><div class="rrow"><b>USE</b><span class="vd">/lesson bank label :: text</span><div class="rd">paste text after :: — filed in kv:gamebanks</div></div><div class="rrow"><b>FILE</b><span class="vd">/lesson bank label @path</span><div class="rd">read live from the tree; provenance printed, never assumed</div></div></div>';
}
function boardRoom(cards, title){
  var c = cards.map(function(x){ return x.q+" || "+x.a+(x.sup?" || "+x.sup:"")+(x.ext?" || "+x.ext:""); }).join(" ;; ");
  return { graphic:"🏟️", title: title || "The Arena", label:"Game",
    content:'<div class="chatty-hint"><strong>How to play:</strong> Teams A/B take turns. Teacher taps Correct/Wrong — every question shows its support scaffold and stretch.</div><div class="game" data-game="board" data-cards="'+c.replace(/"/g,"&quot;")+'"></div>' };
}
async function bankCmd(arg){
  function say(html){ try{ if(window.addBubble) window.addBubble("ass", html); }catch(e){} }
  var parts = String(arg || "").split(/::/);
  if(parts.length < 2){
    var atm = String(arg || "").trim().match(/^(\S+)\s+(@\S+)$/);
    if(atm) parts = [atm[1], atm[2]];
  }
  if(parts.length < 2 || !parts[0].trim() || !parts.slice(1).join("::").trim()){ say(bankHelp()); return null; }
  var label = parts[0].trim().slice(0, 60);
  var src = parts.slice(1).join("::").trim();
  var text = src, provenance = "pasted by the sovereign (" + src.length + " chars)";
  if(/^@\S/.test(src)){
    var path = src.slice(1).trim().replace(/^\.\//, "");
    if(!/^[A-Za-z0-9._\/-]+$/.test(path) || path.indexOf("..") !== -1){ say(bankHelp()); return null; }
    try{
      var r = await fetch(path);
      if(!r.ok) throw new Error("HTTP " + r.status);
      text = await r.text();
      provenance = "file " + path + " (" + text.length + " chars, read live)";
    }catch(e){ say('<div class="rise"><div class="rhead">BANK — could not read</div><div class="rrow bad"><b>' + escHtml(path) + '</b><span class="vd">UNREAD</span><div class="rd">' + escHtml(String((e && e.message) || e)).slice(0, 200) + '</div></div></div>'); return null; }
  }
  if(text.replace(/\s+/g, " ").trim().length < 50){ say('<div class="rise"><div class="rhead">BANK — too short</div><div class="rrow bad"><b>TEXT</b><span class="vd">REFUSED</span><div class="rd">a bank needs real sentences (50+ chars after cleanup).</div></div></div>'); return null; }
  var bank = await bankFromText(text, label);
  try{ bank.provenance = provenance; var f = folder("gamebanks"); if(f) await f.set(bank.id, bank); }catch(e){}
  var room = boardRoom(bank.cards, "The Arena — " + label);
  var sample = bank.cards.slice(0, 3).map(function(c, i){ return "<b>" + (i + 1) + ".</b> " + escHtml(c.q) + "<br><span style='opacity:.75'>to " + escHtml(String(c.a)).slice(0, 90) + "</span>"; }).join("<br>");
  say('<div class="rise"><div class="rhead">Bank filed: ' + escHtml(label) + ' (' + escHtml(bank.id) + ')</div>'
    +'<div class="rrow"><b>CARDS</b><span class="vd">' + bank.cards.length + ' Q+A</span><div class="rd">' + sample + '</div></div>'
    +'<div class="rrow"><b>SOURCE</b><span class="vd">REAL TEXT</span><div class="rd">' + escHtml(provenance) + ' · filed in <b>kv:gamebanks</b> under <b>' + escHtml(bank.id) + '</b> (durable across reloads)</div></div>'
    +'<div class="rrow"><b>BOARD BLOCK</b><span class="vd">copy to game room</span><div class="rd">paste this room content into any lesson game room, then /lesson check + build:<br><pre style="white-space:pre-wrap;font-size:11px;max-height:180px;overflow:auto">' + escHtml(room.content).slice(0, 1500) + '</pre></div></div>'
    +'<div class="rfoot">Every card carries support + extend.</div></div>');
  try{ if(window.rrlAppend) window.rrlAppend(window.runNoOf ? window.runNoOf() : 0, "DNA", "Obi: [/lesson bank " + label + " — " + bank.cards.length + " cards from " + provenance.slice(0, 80) + "]"); }catch(e){}
  try{ if(window.logOp) window.logOp({ kind:"lesson", action:"bank " + label, ok:true, detail:provenance.slice(0, 140), result:bank.id + " · " + bank.cards.length + " cards · kv:gamebanks" }); }catch(e){}
  return bank;
}
function sentencesFrom(text, n){
  var out = String(text||"").replace(/\s+/g," ").replace(/\*\*/g, "").split(/(?<=[.!?])\s+/).map(function(s){return s.trim();})
    .filter(function(s){ return s.length>24 && s.length<220 && /[a-zA-Z]{3,}/.test(s); });
  var seen={}, res=[];
  out.forEach(function(s){ var k=s.toLowerCase().slice(0,40); if(!seen[k]){ seen[k]=1; res.push(s); } });
  return res.slice(0, n || 12);
}
async function bankFromText(text, label){
  var sents = sentencesFrom(text, 12);
  var cards = sents.slice(0,8).map(function(s,i){
    var words = s.split(" ").filter(function(w){return w.length>4;});
    var key = words[Math.floor(words.length/2)] || words[0] || "idea";
    return { q:"Say this in your own words: “"+s.slice(0,90)+"”", a:key,
      sup:"Sentence frame: The main idea is ___.", ext:"Add one detail the text gives." };
  });
  var bank = { id:"B"+Date.now().toString(36), label:String(label||"bank").slice(0,60),
    created:Date.now(), cards:cards,
    board:'<div class="game" data-game="board" data-cards="'+cards.map(function(c){return c.q+" || "+c.a+" || "+c.sup+" || "+c.ext;}).join(" ;; ").replace(/"/g,"&quot;")+'"></div>' };
  var f = folder("gamebanks");
  if(f){ try{ await f.set(bank.id, bank); }catch(e){} }
  return bank;
}

/* ---------------- 9. a11y/VN/mobile hardening ---------------- */
var HARD_CSS = [
"/* arsenal hardening: focus visible everywhere, 44px targets, VN-ready */",
".g-tile2:focus-visible,.g-card:focus-visible,.g-step:focus-visible,.g-btn:focus-visible,.t-console button:focus-visible{outline:3px solid var(--gold);outline-offset:2px}",
".g-input:focus{border-color:var(--gold);outline:2px solid var(--gold)}",
".g-qa .q{line-height:1.55}"
].join("\n");
var VN = { start:"Bắt đầu", next:"Tiếp →", back:"← Quay lại", correct:"✅ Đúng", wrong:"❌ Chưa đúng — đọc lại quy tắc", listen:"🔊 Nghe rồi gõ lại" };

/* ---------------- 10. validator+ / install ---------------- */
function install(){
  var L = window.ObiLessons;
  if(!L || L._lessonArsenalInstalled) return false;

  /* build: inline brand icons in feature cards + arsenal CSS */
  var coreBuild = L.build;
  L.build = function(spec){
    var out = coreBuild(spec);
    try{
      var html = String(out.html || "");
      html = html.replace(/<div class="feature-icon">([\s\S]*?)<\/div>/g, function(m, inner){
        var t = String(inner).replace(/<[^>]*>/g,"").trim();
        var svg = resolveIconToken(t, "3.2rem");
        return '<div class="feature-icon">'+(svg || inner)+'</div>';
      });
      if(html.indexOf("arsenal hardening") === -1) html = html.replace("</style>", HARD_CSS + "\n</style>");
      out.html = html; out.bytes = html.length;
    }catch(e){}
    return out;
  };

  /* validate: core + KSU + arsenal game ids + icon names */
  var coreValidate = L.validate;
  L.validate = function(spec){
    var r = coreValidate(spec);
    try{
      var k = checkKSU(spec);
      k.errs.forEach(function(e){ r.errors.push(e); });
      k.warns.forEach(function(w){ r.warnings.push(w); });
      var ids = [];
      (spec.rooms||[]).forEach(function(rm){
        var c = String(rm.content||"");
        var re = /data-game="([a-z]+)"/g, m;
        while((m = re.exec(c))) ids.push(m[1]);
      });
      var known = ["scramble","match","sort","order","odd","flip","battle","storm","board","tiles","tornado","memory","dice","reveal","voice"];
      ids.forEach(function(id){ if(known.indexOf(id)===-1) r.errors.push('unknown game "'+id+'" — arsenal knows: '+known.join(", ")); });
      (spec.features||[]).forEach(function(f,i){
        var t = String((f&&f.icon)||"");
        if(/^(brand|icon)\s*:/.test(t)){
          var name = t.split(":")[1].trim();
          if(!brandHas(name)) r.errors.push("feature "+(i+1)+' icon "'+t+'" — no brand icon "'+name+'" (116 available)');
        }
      });
      r.ok = r.errors.length === 0;
    }catch(e){ r.warnings.push("arsenal check skipped: "+String((e&&e.message)||e).slice(0,120)); }
    return r;
  };

  /* run: /lesson template <name> [topic] */
  var coreRun = L.run;
  L.run = async function(arg){
    var text = String(arg || "").trim();
    var m = text.match(/^(template|tpl)\b\s*([a-z-]*)\s*([\s\S]*)$/i);
    if(m){
      var name = (m[2]||"").toLowerCase();
      if(!name || !TEMPLATES[name]){
        var list = Object.keys(TEMPLATES).map(function(k){ return "• <b>"+k+"</b> — "+TEMPLATES[k].name+": "+TEMPLATES[k].desc; }).join("<br>");
        if(window.addBubble) window.addBubble("ass", '<div class="rise"><div class="rhead">📐 Template arsenal</div><div class="rd">'+list+'</div><div class="rfoot">Use: <b>/lesson template &lt;name&gt; [topic]</b> — builds the starter into the desk for editing, then validate + build like any lesson.</div></div>');
        return;
      }
      var spec = TEMPLATES[name].make((m[3]||"").trim() || "English");
      try{
        if(L.desk){ L.desk.spec = spec; L.desk.specJson = JSON.stringify(spec, null, 2); L.desk.tab = "build"; }
      }catch(e){}
      var check = L.validate(spec);
      var built = L.build(spec);
      if(window.addBubble){
        window.addBubble("ass", '<div class="rise"><div class="rhead">📐 Template: '+TEMPLATES[name].name+' — '+(check.ok?"ready to edit":"needs words")+'</div>'
          +'<div class="rrow"><b>SPEC</b><span class="vd">'+check.rooms+' ROOMS</span><div class="rd">'+check.vocab+' vocab · '+check.blocks+' choice blocks · '+built.bytes+' bytes</div></div>'
          +(check.errors.map(function(e){return '<div class="rrow bad"><b>FAIL</b><span class="vd">✖</span><div class="rd">'+e+'</div></div>';}).join(""))
          +'<div class="rfoot">Loaded into the builder — replace the placeholder words with the row\'s own, then build. Brand icons already inline ('+Object.keys(TEMPLATES).length+' templates).</div></div>');
      }
      return { spec:spec, built:built, check:check };
    }
    var bmatch = text.match(/^bank\b\s*([\s\S]*)$/i);
    if(bmatch){ await bankCmd((bmatch[1] || "").trim()); return; }
    return coreRun(arg);
  };

  if(L.SHELL_CONTRACT && L.SHELL_CONTRACT.indexOf("outcomes") === -1){
    L.SHELL_CONTRACT = L.SHELL_CONTRACT + "\nDeclare the KSU triple in method.outcomes: {\"knowledge\":\"one line\",\"skills\":\"one line\",\"understanding\":\"one line\"} — checked-when-present; a half triple is refused.";
  }

  L._lessonArsenalInstalled = true;
  return true;
}

window.ObiLessonArsenal = {
  VERSION: VERSION, CLASSROOM_ICONS: CLASSROOM_ICONS,
  TEMPLATES: TEMPLATES, VN: VN, HARD_CSS: HARD_CSS,
  resolveIconToken: resolveIconToken, featureIconHTML: featureIconHTML,
  checkKSU: checkKSU, worksheetHTML: worksheetHTML, bankCmd: bankCmd, bankHelp: bankHelp,
  bankFromText: bankFromText, install: install,
  iconCount: function(){ try{ return window.ObiBrand.iconNames().length; }catch(e){ return 0; } }
};
try{ install(); }catch(e){}
})();
