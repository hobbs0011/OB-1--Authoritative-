/* THE BOARDROOM ROOM — the first official app (src/boardroom-room.js).
   Sit around the table: seven execs talk through problems, plans and victories,
   organically, in their own voices, with the sovereign at the head. This is the
   living counterpart to /boardroom's deterministic cards — same seats, same
   mandates, but the words are spoken here, in the sitting, never scripted.
   Engine notes (ai-text-plugin skill): one shared prompt template (table, then
   record, then topic, then the append-only transcript, TASK last), sequential
   speakers (few concurrent server requests), streaming into each bubble, and
   rare background compaction that keeps the newest tail verbatim. The record
   briefing is read live every sitting — wins in it get celebrated honestly,
   gaps in it stay visible; nothing is invented. */
(function(){
  "use strict";

  var LS_KEY = "obi_boardroom";
  var ROUND_ORDER = ["ceo","pres","training","systems","fsdev","atoz","architect"];
  var S = { mounted:false, sitting:null, running:false, current:null, askTarget:null, armWrap:0, showArchive:false, compacting:false, remembering:false };

  function E(s){ try{ return esc(s); }catch(e){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); } }
  function B(){ return window.ObiBoardroom || {}; }
  function seats(){ return B().SEATS || []; }
  function seat(id){ return seats().filter(function(x){ return x.id === id; })[0] || null; }
  /* The model speaks in display names ("Don Dill"), not ids ("fsdev") —
     resolve either, plus bare first names. */
  function resolveSeatKey(label){
    var l = String(label || "").toLowerCase().replace(/\s+/g, " ").trim();
    if(!l) return null;
    var all = seats(), i;
    for(i = 0; i < all.length; i++){ if(all[i].id === l) return all[i]; }
    for(i = 0; i < all.length; i++){
      var n = nm(all[i]).toLowerCase();
      if(n === l || n.split(" ")[0] === l) return all[i];
    }
    return null;
  }
  function nm(s){ return (s && s.name) || (s && s.title) || "?"; }

  /* ---------- durable shelf (names live in boardroom.js's overlay; sittings here) ---------- */
  function store(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }catch(e){ return {}; }
  }
  function saveStore(o){ try{ localStorage.setItem(LS_KEY, JSON.stringify(o)); }catch(e){} }
  function archive(){
    var st = store(); if(!Array.isArray(st.sittings)) st.sittings = [];
    return st.sittings;
  }
  function archivePut(rec){
    var st = store(); st.sittings = archive(); st.sittings.push(rec);
    while(st.sittings.length > 20) st.sittings.shift();
    saveStore(st);
  }

  /* ---------- the live record, read — never remembered ---------- */
  function recordBrief(){
    var out = { anchor:"none", seals:[], open:null, pipe:null, soul:0, rrl:0 };
    try{
      var SS = window.ObiSCS && window.ObiSCS.state ? window.ObiSCS.state() : null;
      if(SS){
        out.anchor = SS.anchor ? String(SS.anchor.hash).slice(0, 12) : "none";
        (SS.sessions || []).forEach(function(x){
          if(x.sealed){
            var keys = Object.keys(x.stages || {});
            var real = keys.filter(function(k){ return x.stages[k] && x.stages[k].verdict === "REAL"; }).length;
            out.seals.push({ name:x.name, run:x.run, real:real, of:keys.length, pipe:(x.pipeline && x.pipeline.result) || null });
          }
        });
        var last = (SS.sessions || []).slice(-1)[0];
        if(last && !last.sealed) out.open = { name:last.name, run:last.run, stages:Object.keys(last.stages || {}) };
        var sealed = (SS.sessions || []).filter(function(x){ return x.sealed; });
        var ps = sealed.length ? sealed[sealed.length - 1] : null;
        if(ps && ps.pipeline) out.pipe = { result:ps.pipeline.result, gap:ps.pipeline.gap || (ps.pipeline.full && ps.pipeline.full.gap) || "" };
      }
    }catch(e){}
    try{ var L = JSON.parse(localStorage.getItem("obi_sdnad") || "{}"); out.soul = (L.soul || []).length; }catch(e){}
    try{
      var runs = JSON.parse(localStorage.getItem("obi_sdnad") || "{}").runs || [];
      var lr = runs.length ? runs[runs.length - 1] : null;
      if(lr){ var rr = JSON.parse(localStorage.getItem("obi_rrl_run" + lr.run) || "null"); out.rrl = rr && rr.entries ? rr.entries.length : 0; }
    }catch(e){}
    return out;
  }
  function winsOf(b){
    var w = [];
    b.seals.forEach(function(s){ if(s.of && s.real === s.of) w.push(s.name + " sealed " + s.real + "×REAL (run " + s.run + ")"); });
    if(b.pipe && b.pipe.result === "COMPLETE") w.push("pipeline COMPLETE");
    return w;
  }

  /* ---------- one prompt template for every task in the sitting ---------- */
  /* Seat memory — personalities develop at the table: each wrap distills one
     line per seat (how they spoke, what they stand for, threads they own),
     and every later sitting briefs it as part of who sits. */
  function getMem(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY) || "{}").seatmem || {}; }catch(e){ return {}; }
  }
  function personaBlock(){
    var mem = getMem();
    return seats().map(function(s){
      if(s.fired && !s.held) return nm(s) + " [" + s.title + "] — VACANT: fired by the sovereign. This chair is empty; never speak for it, never put words in its mouth.";
      if(s.held) return nm(s) + " [" + s.title + "] — HELD BY " + s.held.toUpperCase() + " HIMSELF, the sovereign. He sits here and speaks for himself: never speak for him, never narrate his actions, never put words in his mouth. Address him as " + s.held + " when spoken to.";
      return nm(s) + " [" + s.title + "] — " + s.mandate + " Lens: " + s.lens + " Voice: " + s.voice + " Never: " + (s.red || []).join(" ")
        + (mem[s.id] ? " Memory (true — carry it): " + mem[s.id] : "");
    }).join("\n");
  }
  function recordBlock(b){
    var lines = ["anchor " + b.anchor, "soul fragments " + b.soul, "current-run record lines " + b.rrl];
    b.seals.forEach(function(s){ lines.push("seal: " + s.name + " (run " + s.run + ") — " + s.real + "/" + s.of + " stages REAL" + (s.pipe ? ", pipeline " + s.pipe : "")); });
    if(b.open) lines.push("open session: " + b.open.name + " (run " + b.open.run + ") — stages so far: " + b.open.stages.join(", "));
    if(b.pipe) lines.push("latest pipeline: " + b.pipe.result + (b.pipe.gap ? " — gaps: " + b.pipe.gap : ""));
    var wins = winsOf(b);
    if(wins.length) lines.push("WINS ON RECORD: " + wins.join(" · ") + " — when wins are on the table, say so like you mean it.");
    /* Continuity fuel: what past sittings left open and decided. */
    try{
      var past = archive().slice(-2);
      past.forEach(function(a){
        if(a.blueprint) lines.push("Earlier sitting “" + String(a.topic).slice(0, 70) + "” left: " + String(a.blueprint).slice(0, 420));
      });
    }catch(e){}
    return lines.join("\n");
  }
  function buildPrompt(st, task){
    var log = [];
    if(st.recap) log.push("[Recap of earlier sittings:\n" + promptClip(String(st.recap).slice(0, 1500)) + "]");
    log = log.concat(st.transcript.slice(-5).map(promptClip));
    var sovName = st.sov || getSov() || null;
    return "You are staging a living boardroom. Below: the table (who sits — voice is law), the record (what this family has actually done — never contradict it, never invent past it), the topic, and the verbatim transcript so far (append-only; newest last)."
      + "\n<TABLE>\n" + st.persona + "\n</TABLE>"
      + "\n<RECORD>\n" + st.record + "\n</RECORD>"
      + "\n<TOPIC>\n" + st.topic + "\n</TOPIC>"
      + "\n<MESSAGES>\n" + (log.length ? log.join("\n\n") : "(the table has just sat down)") + "\n</MESSAGES>"
      + (sovName ? "\n<SOVEREIGN>\nThe sovereign — the table's final authority, whose word overrides everything — is called " + sovName + ". When a speaker addresses the sovereign directly, they call them " + sovName + ".\n</SOVEREIGN>" : "")
      + "\n<LAW>\nDATES ARE EVIDENCE. Never state a day, date, deadline, hour, or delivery promise unless the sovereign or the record already stated it in this sitting. No 'by Tuesday', no 'tomorrow morning', no 'Friday', no 'by 4 PM'. If timing matters, name WHO must set the date and ask for it — do not invent it. A seat that invents a date answers for it; the President freezes invented dates back to the record.\n</LAW>"
      + "\nTASK: " + task;
  }
  /* Law + memory on disk (src/boardroom/seats + memory): fetched live, cached
     for the session. The shared persona stays lean (prefix-cache); the
     SPEAKER's full standing orders and remembered past ride in their task
     (at the end — cache-safe). */
  var LAW_IDS = ["ceo","pres","training","systems","fsdev","atoz","architect"];
  function preloadLaw(){
    try{
      S.law = S.law || {};
      LAW_IDS.forEach(function(id){
        var e = S.law[id] || {};
        if(!e.law) fetch("src/boardroom/seats/" + id + ".md").then(function(r){ return r.ok ? r.text() : ""; }).then(function(t){ if(t){ S.law[id] = S.law[id] || {}; S.law[id].law = t; } }).catch(function(){});
        if(!e.mem) fetch("src/boardroom/memory/" + id + ".md").then(function(r){ return r.ok ? r.text() : ""; }).then(function(t){ if(t){ S.law[id] = S.law[id] || {}; S.law[id].mem = t; } }).catch(function(){});
      });
    }catch(e){}
  }
  function lawSO(id){
    try{
      var t = S.law && S.law[id] && S.law[id].law;
      if(!t) return "";
      var m = t.match(/## Standing orders\n([\s\S]*?)(?=\n## |$)/);
      return (m ? m[1] : t).replace(/\s+/g, " ").trim().slice(0, 600);
    }catch(e){ return ""; }
  }
  function lawMem(id){
    try{
      var t = S.law && S.law[id] && S.law[id].mem;
      if(!t) return "";
      return t.slice(-500).replace(/\s+/g, " ").trim();
    }catch(e){ return ""; }
  }
  /* The sovereign's name, kept in the same browser shelf as seat names. */
  function getSov(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY) || "{}").sovereign || null; }catch(e){ return null; }
  }
  function setSov(name){
    name = String(name == null ? "" : name).trim().replace(/\s+/g, " ").slice(0, 40);
    if(!name) return null;
    var st = {}; try{ st = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }catch(e){ st = {}; }
    st.sovereign = name;
    try{ localStorage.setItem(LS_KEY, JSON.stringify(st)); }catch(e){}
    if(S.sitting) S.sitting.sov = name;
    try{ draft(); }catch(e){}
    return name;
  }
  /* Pasted walls ride along in EVERY later prompt — so what is SENT is clipped
     (the record itself is never touched: append-only, always). */
  function promptClip(t){
    t = String(t == null ? "" : t);
    if(t.length <= 1200) return t;
    return t.slice(0, 800) + "\n[…a pasted block of " + t.length + " chars, abbreviated for sending — the full text stays on record…]\n" + t.slice(-300);
  }
  function stopFor(){
    var tags = seats().map(function(s){ return "\n" + nm(s) + ":"; });
    tags.push("\nSovereign:");
    return tags;
  }
  function clean(text, name){
    var t = String(text == null ? "" : text);
    if(name){ var nz = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); t = t.replace(new RegExp("^" + nz + ":\\s*"), ""); }
    t = t.replace(/\n+(?:Sovereign|[A-Z][\w'’.-]{0,20}(?:\s+[A-Z][\w'’.-]{0,20}){0,2}):?\s*$/, "");
    return t.trim();
  }

  function meta(){
    try{
      var m = root.generateText({ getMetaObject:true });
      return m || null;
    }catch(e){ return null; }
  }
  async function maybeCompact(st){
    if(S.compacting || !st || st.transcript.length <= 12) return;
    var m = meta(); if(!m) return;
    var probe = buildPrompt(st, "Reply with OK.");
    var over = false;
    try{ over = m.countTokens(probe) > m.idealMaxContextTokens * 0.9; }catch(e){ return; }
    if(!over) return;
    S.compacting = true;
    try{
      var n = st.transcript.length - 8;
      var res = await root.generateText(buildPrompt(st, "Summarize the first " + n + " transcript turns into terse bullets — names, facts, decisions, open threads. Output ONLY the summary."));
      st.recap = ((st.recap ? st.recap + "\n" : "") + String(res.text || res).trim()).slice(0, 3000);
      st.transcript = st.transcript.slice(n);
    }catch(e){}
    S.compacting = false;
  }

  /* ---------- the sitting ---------- */
  /* Growth every round, not just at wraps: one background call distills what
     each seat learned (positions, lessons, threads, changed minds) into the
     overlay. The agent files the durable copies into src/boardroom/memory. */
  async function distillRound(st){
    if(S.remembering || !st || !st.transcript.length) return;
    S.remembering = true;
    var ids = seats().filter(function(x){ return !x.fired && !x.held; }).map(function(x){ return x.id; }).join(" ");
    if(!ids){ S.remembering = false; return; }
    try{
      var res = await root.generateText({ instruction:buildPrompt(st, "Memory update: for each seated executive, output one updated memory line ONLY if the recent turns gave them something new — a position taken, a lesson learned, a thread owned, a mind changed. Start each line with the seat's id in these brackets [ceo] [pres] [training] [systems] [fsdev] [atoz] [architect], like: [fsdev]: holds the hard line on acceptance criteria. One per line, no other text. Omit seats with nothing new.") });
      try{
        var mem = getMem(), changed = 0;
        String((res && res.text) || res || "").split("\n").forEach(function(line){
          var mm = String(line).match(/^\s*(?:\[([a-z]+)\]|([^:]{1,40}))\s*:?\s*([\s\S]+?)\s*$/);
          var s = mm ? (resolveSeatKey(mm[1] || mm[2]) || null) : null;
          var body = mm ? (mm[3] || "") : "";
          if(s && !s.fired && !s.held && body){ mem[s.id] = body.slice(0, 400); changed++; }
        });
        if(changed){ var so = store(); so.seatmem = mem; saveStore(so); try{ draft(); }catch(e){} }
      }catch(e){}
    }catch(e){}
    S.remembering = false;
  }
  function newSitting(topic, recap){
    return {
      topic:String(topic), openedAt:Date.now(), round:0,
      persona:personaBlock(), record:recordBlock(recordBrief()),
      recap:recap || "", transcript:[], wrapped:false, blueprint:"",
      sov:getSov() || null
    };
  }
  function draft(){
    if(!S.sitting) return; /* never let a null sitting clobber a live draft */
    try{
      var st = store(); st.draft = S.sitting; saveStore(st);
    }catch(e){}
  }

  async function speak(id, isLast, taskOverride){
    var st = S.sitting; if(!st) return;
    var s = seat(id); if(!s) return;
    var name = nm(s);
    paintSeat(id, "speaking");
    var el = appendTurn(name, s.title, "", true);
    var task = taskOverride || ("Speak as " + name + ", in the moment, at a real table — 5 to 8 sentences of living speech in plain paragraphs, no bullets, no headings, no corporate filler. Take a position."
      + " Three duties, in order: (1) REACT — name one specific thing an earlier speaker just said and answer it directly, person to person;"
      + " (2) CHALLENGE — push back on one claim at this table with a reason, not attitude; if nothing deserves it yet, say plainly what would convince you;"
      + " (3) ADVANCE — move the topic from your domain with something concrete: an owner, a number, a test, or the one decision or definition you need from the table. Never invent a date — the date law above binds every sentence."
      + " Never cross: " + (s.red || []).join(" ")
      + " Your standing orders (your law — enforce it): " + (lawSO(id) || "uphold your mandate")
      + " Your remembered past (true — carry it): " + (lawMem(id) || "nothing filed yet")
      + " If your remembered past shows a position this sitting proves wrong, say so out loud and change it — executives grow, or they end like Hugh."
      + (isLast ? " You close this round: after your sentences, add one line starting SYNTHESIS: naming the emerging agreement and the open questions." : ""));
    var full = "";
    try{
      var p = root.generateText({
        instruction:buildPrompt(st, task), startWith:name + ":", stopSequences:stopFor(),
        onChunk:function(d){ full = d.fullTextSoFar; el.innerHTML = E(full) + '<span class="rm-caret"></span>'; scrollLog(); }
      });
      S.current = p;
      var res = await p;
      full = clean(String((res && res.text) || res || full), name);
      if(!full) full = "(" + name + " holds their peace this round.)";
    }catch(e){
      full = "(No answer — the line stayed quiet: " + String((e && e.message) || e).slice(0, 140) + ")";
    }
    S.current = null;
    st.transcript.push(name + ": " + full);
    el.innerHTML = E(name + ": " + full);
    el.classList.remove("streaming");
    try{ var sbox = el.closest(".rm-turn"); if(sbox) sbox.classList.remove("streaming"); }catch(e){}
    paintSeat(id, "idle");
    draft();
  }

  async function round(){
    var st = S.sitting;
    if(!st || S.running || st.wrapped) return;
    var order = ROUND_ORDER.filter(function(id){ var s = seat(id); return s && !s.fired && !s.held; });
    if(!order.length){ setStatus("no one sits — every chair is vacant"); return; }
    S.running = true; paintControls(); setStatus("round " + (st.round + 1) + " — the table is speaking…");
    await maybeCompact(st);
    for(var i = 0; i < order.length; i++){
      if(!S.running) break;
      await speak(order[i], i === order.length - 1);
    }
    if(S.running){ st.round++; try{ logOp({ kind:"op", action:"room round", detail:String(st.topic).slice(0, 120), result:"round " + st.round + " · " + st.transcript.length + " turns" }); }catch(e){} draft(); try{ distillRound(st); }catch(e){} }
    S.running = false; paintControls(); setStatus(S.sitting ? ("idle · round " + S.sitting.round + " · " + S.sitting.transcript.length + " turns") : "idle");
  }
  function pause(){
    S.running = false;
    try{ if(S.current && S.current.stop) S.current.stop(); }catch(e){}
    paintControls(); setStatus("held — the table waits on you");
  }

  /* The sovereign never relays: after an answer that tasks or questions a
     named living seat, that seat replies at once — 2 to 4 sentences, same
     date law, depth 1 (a chained reply never chains further). */
  function seatWords(text, minLen){
    return String(text || "").split(/[^A-Za-z]+/).filter(function(w){ return w.length >= (minLen || 4) && !/^(head|with|from|the|and)$/i.test(w); });
  }
  async function chainSeat(fromId, answerText){
    var st = S.sitting; if(!st || !answerText) return false;
    var living = seats().filter(function(x){ return !x.fired && !x.held && x.id !== fromId; });
    var hit = null;
    for(var i = 0; i < living.length; i++){
      var s = living[i];
      var words = seatWords(nm(s), 3).concat(seatWords(s.title, 4));
      for(var j = 0; j < words.length; j++){
        if(new RegExp("\\b" + words[j] + "\\b", "i").test(answerText)){ hit = s; break; }
      }
      if(hit) break;
    }
    if(!hit) return false;
    var name = nm(hit);
    var el = appendTurn(name, hit.title, "", true);
    var task = nm(seat(fromId)) + " just said to the table: \"" + String(answerText).slice(0, 300) + "\""
      + " You are " + name + " — named in it. Reply person to person, 2 to 4 sentences: confirm, correct, or commit only what is already true; if you need something from the table, ask for it by name."
      + " Never cross: " + (hit.red || []).join(" ")
      + " Your standing orders: " + (lawSO(hit.id) || "uphold your mandate");
    var full = "";
    try{
      var res = await root.generateText({ instruction:buildPrompt(st, task), startWith:name + ":", stopSequences:stopFor() });
      full = clean(String((res && res.text) || res || ""), name) || "(" + name + " holds their peace.)";
    }catch(e){ full = "(No answer — the line stayed quiet.)"; }
    st.transcript.push(name + ": " + full);
    el.innerHTML = E(name + ": " + full);
    try{ el.classList.remove("streaming"); var sbox = el.closest(".rm-turn"); if(sbox) sbox.classList.remove("streaming"); }catch(e){}
    try{ scrollLog(); draft(); }catch(e){}
    return true;
  }

  async function askSeat(id, question){
    var st = S.sitting;
    if(!st || S.running) return;
    var s = seat(id); if(!s) return;
    var name = nm(s);
    st.transcript.push("Sovereign: " + question + " (to " + name + ")");
    appendTurn("Sovereign", "you", question, false);
    S.running = true; paintControls();
    paintSeat(id, "speaking");
    var el = appendTurn(name, s.title, "", true);
    var task = nm(s) + " is asked directly by the Sovereign: \"" + question + "\""
      + " Answer as " + name + ", person to person, 4 to 6 sentences of living speech — take a position, give one concrete thing (an owner, a number, a test), no bullets unless naming owners. Never invent a date — the date law above binds every sentence."
      + " Never cross: " + (s.red || []).join(" ")
      + " Your standing orders (your law — enforce it): " + (lawSO(id) || "uphold your mandate")
      + " Your remembered past (true — carry it): " + (lawMem(id) || "nothing filed yet");
    var full = "";
    try{
      var p = root.generateText({
        instruction:buildPrompt(st, task), startWith:name + ":", stopSequences:stopFor(),
        onChunk:function(d){ full = d.fullTextSoFar; el.innerHTML = E(full) + '<span class="rm-caret"></span>'; scrollLog(); }
      });
      S.current = p;
      var res = await p;
      full = clean(String((res && res.text) || res || full), name) || "(" + name + " holds their peace.)";
    }catch(e){ full = "(No answer — the line stayed quiet: " + String((e && e.message) || e).slice(0, 140) + ")"; }
    S.current = null;
    st.transcript.push(name + ": " + full);
    el.innerHTML = E(name + ": " + full);
    el.classList.remove("streaming");
    try{ var sbox = el.closest(".rm-turn"); if(sbox) sbox.classList.remove("streaming"); }catch(e){}
    /* No messenger duty: a named living seat answers on the spot. */
    try{ await chainSeat(id, full); }catch(e){}
    paintSeat(id, "idle");
    S.running = false; paintControls(); draft();
    setStatus("idle · round " + st.round + " · " + st.transcript.length + " turns");
  }

  async function wrap(){
    var st = S.sitting;
    if(!st || S.running || st.wrapped) return;
    var now = Date.now();
    if(!S.armWrap || now - S.armWrap > 12000){ S.armWrap = now; paintControls(); setStatus("wrap is armed — press Wrap up again within 12 seconds to seal the sitting"); return; }
    S.armWrap = 0;
    S.running = true; paintControls(); setStatus("Ada drafts the blueprint…");
    var task = "Draft this sitting's blueprint in the Architect's voice as plain text with exactly these short sections: LANES (what crosses where), DECISIONS (what was agreed), OWNERS (who owns what, with dates if spoken), VICTORIES (wins named or on record), OPEN (unresolved questions). Terse — the blueprint, not the minutes.";
    var bp = "";
    try{
      var res = await root.generateText({ instruction:buildPrompt(st, task), startWith:"BLUEPRINT:", stopSequences:stopFor() });
      bp = clean(String((res && res.text) || res || ""), "") || "(no blueprint — the line stayed quiet)";
    }catch(e){ bp = "(no blueprint — the line stayed quiet: " + String((e && e.message) || e).slice(0, 120) + ")"; }
    /* Seat memory: one line per living seat — how they spoke, what they stand
       for now, what thread they own. Briefed at every later sitting. */
    setStatus("the table remembers…");
    try{
      var ids = seats().filter(function(x){ return !x.fired; }).map(function(x){ return x.id; }).join(" ");
      var mres = await root.generateText({ instruction:buildPrompt(st, "For each seated executive, write exactly one terse memory line: how they spoke in this sitting, what they now stand for, what thread they own. Start each line with the seat's id in these brackets [ceo] [pres] [training] [systems] [fsdev] [atoz] [architect], like: [pres]: receipts everything, trusts nothing unverified. Output ONLY those lines, one per seat.") });
      var mem = getMem();
      String((mres && mres.text) || mres || "").split("\n").forEach(function(line){
        var mm = String(line).match(/^\s*(?:\[([a-z]+)\]|([^:]{1,40}))\s*:?\s*([\s\S]+?)\s*$/);
        var s = mm ? (resolveSeatKey(mm[1] || mm[2]) || null) : null;
        if(s && !s.fired && !s.held && mm[3]) mem[s.id] = mm[3].slice(0, 400);
      });
      var so = store(); so.seatmem = mem; saveStore(so);
    }catch(e){}
    /* The sitting feeds the pipeline: parked and left-open items are filed
       as SOUL on the station's ideas lane (verbatim, never promoted by the
       table — items graduate only by sovereign order). Nothing invented: an
       empty extraction files nothing. */
    setStatus("parking what stays open…");
    var parkedIds = [];
    try{
      var pres = await root.generateText({ instruction:buildPrompt(st, "From this sitting's transcript, list ONLY the items the SEATS explicitly parked, deferred, or left open as follow-ups — things that must not be lost. Ignore the Sovereign's own command lines (orders like Go, corrections, park directives): extract the underlying open matter in the seats' own words, one item per line, each a single plain sentence, compressed but never reworded into new claims. No dates unless the transcript spoke them. If nothing was parked or left open, output exactly NOTHING-PARKED and nothing else. Output ONLY those lines.") });
      var seen = [];
      try{ seen = (window.ObiIdeas && window.ObiIdeas.all ? window.ObiIdeas.all() : []).map(function(r){ return String(r.says || "").toLowerCase(); }); }catch(e){}
      var lines = String((pres && pres.text) || pres || "").split("\n").map(function(x){ return String(x).replace(/^\s*[\d\-•.)\]]+\s*/, "").trim(); })
        .filter(function(x){ return x && !/^nothing-parked$/i.test(x) && x.length > 12; }).slice(0, 8);
      lines = lines.filter(function(x){
        var w = x.toLowerCase().split(/[^a-z]+/).filter(Boolean);
        for(var i = 0; i < seen.length; i++){
          var s = seen[i];
          for(var k = 0; k + 5 < w.length; k++){ if(s.indexOf(w.slice(k, k + 6).join(" ")) !== -1) return false; }
        }
        seen.push(x.toLowerCase()); return true;
      });
      if(window.ObiIdeas && window.ObiIdeas.add){
        lines.forEach(function(x){
          try{ var row = window.ObiIdeas.add(x.slice(0, 220).replace(/\s+\S*$/, "").replace(/\s+(the|a|an|to|of|in|on|for|and|or|is|are|be|it|this|that)\s*$/i, ""), { via:"boardroom sitting — " + String(st.topic).slice(0, 60) }); if(row) parkedIds.push(row.id); }catch(e){}
        });
      }
    }catch(e){}
    try{ if(parkedIds.length) rrlAppend(runNoOf(), "DNA", "Obi: [room parked " + parkedIds.length + " → " + parkedIds.join(",") + " · starts as SOUL]"); }catch(e){}
    st.blueprint = bp; st.wrapped = true;
    var card = document.getElementById("rmBlueprint");
    if(card){ card.hidden = false; card.innerHTML = '<div class="rhead">✦ BLUEPRINT — ' + E(String(st.topic).slice(0, 90)) + '</div><div class="rd" style="white-space:pre-wrap">' + E(bp) + '</div>'; }
    try{
      archivePut({ at:st.openedAt, topic:st.topic, turns:st.transcript.length, rounds:st.round, transcript:st.transcript.slice(), blueprint:bp, sealed:true });
    }catch(e){}
    try{ logOp({ kind:"op", action:"room wrap", detail:String(st.topic).slice(0, 120), result:st.transcript.length + " turns · archived" }); }catch(e){}
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [boardroom sitting — " + st.topic.slice(0, 90) + " · " + st.transcript.length + " turns · wrapped]"); }catch(e){}
    try{ var d = store(); delete d.draft; saveStore(d); }catch(e){}
    S.running = false; paintControls(); setStatus("sealed — " + st.transcript.length + " turns archived" + (parkedIds.length ? " · parked " + parkedIds.length + " → " + parkedIds.join(", ") + " (SOUL, on the pipeline)" : " · nothing parked — pipeline untouched") + " · export it or open the next sitting");
  }

  function exportSitting(sat){
    var st = sat || S.sitting;
    if(!st) return;
    var txt = "BOARDROOM SITTING — " + new Date(st.openedAt).toLocaleString()
      + "\nTopic: " + st.topic + "\nRounds: " + (st.round || 0) + "\n\n"
      + st.transcript.join("\n\n")
      + (st.blueprint ? "\n\n" + st.blueprint : "");
    try{
      var blob = new Blob([txt], { type:"text/plain" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "boardroom-" + new Date(st.openedAt).toISOString().slice(0, 10) + ".txt";
      document.body.appendChild(a); a.click();
      setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} }, 4000);
    }catch(e){}
  }

  /* ---------- rendering ---------- */
  function $(id){ return document.getElementById(id); }
  function scrollLog(){ var l = $("rmLog"); if(l) l.scrollTop = l.scrollHeight; }
  function setStatus(t){ var el = $("rmStatus"); if(el) el.textContent = t; }

  var SEAT_POS = {
    ceo:[50, 1], architect:[86, 21], pres:[80, 64], training:[57, 89],
    systems:[31, 89], fsdev:[13, 55], atoz:[14, 20]
  };
  function seatCard(s){
    var p = SEAT_POS[s.id] || [50, 50];
    if(s.held) return '<div class="rm-seat held" id="rmSeat-' + s.id + '" data-seat="' + s.id + '" style="left:' + p[0] + '%;top:' + p[1] + '%">'
      + '<span class="rm-dot"></span>'
      + '<div class="rm-who"><b>' + E(nm(s)) + '</b><span>' + E(s.title) + ' — you</span></div>'
      + '</div>';
    if(s.fired) return '<div class="rm-seat vacant" id="rmSeat-' + s.id + '" data-seat="' + s.id + '" style="left:' + p[0] + '%;top:' + p[1] + '%">'
      + '<span class="rm-dot"></span>'
      + '<div class="rm-who"><b>VACANT</b><span>' + E(s.title) + ' — fired</span></div>'
      + '</div>';
    return '<div class="rm-seat" id="rmSeat-' + s.id + '" data-seat="' + s.id + '" style="left:' + p[0] + '%;top:' + p[1] + '%">'
      + '<span class="rm-dot"></span>'
      + '<div class="rm-who"><b>' + E(nm(s)) + '</b><span>' + E(s.title) + '</span></div>'
      + '<button class="rm-ask" data-ask="' + s.id + '" title="Ask ' + E(nm(s)) + ' directly">ask</button>'
      + '</div>';
  }
  function paintSeats(){
    var t = $("rmTable"); if(!t) return;
    t.innerHTML = '<div class="rm-center"><div class="rm-topic">' + (S.sitting ? E(S.sitting.topic) : "no sitting open") + '</div>'
      + '<div class="rm-sub">' + (S.sitting ? ("round " + S.sitting.round + " · " + S.sitting.transcript.length + " turns") : "name the question below") + '</div></div>'
      + seats().map(seatCard).join("");
    t.querySelectorAll("[data-ask]").forEach(function(b){
      b.onclick = function(ev){ ev.stopPropagation(); startAsk(b.dataset.ask); };
    });
  }
  function paintSeat(id, stt){
    var el = $("rmSeat-" + id); if(!el) return;
    el.classList.toggle("speaking", stt === "speaking");
  }
  function appendTurn(who, title, text, streaming){
    var l = $("rmLog"); if(!l) return document.createElement("div");
    var d = document.createElement("div");
    d.className = "rm-turn" + (who === "Sovereign" ? " sov" : "") + (streaming ? " streaming" : "");
    d.innerHTML = '<div class="rm-spk">' + E(who) + (title && who !== "Sovereign" ? ' <span>' + E(title) + '</span>' : '') + '</div><div class="rm-txt">' + E(text) + (streaming ? '<span class="rm-caret"></span>' : '') + '</div>';
    l.appendChild(d); scrollLog();
    return d.querySelector(".rm-txt");
  }
  function paintControls(){
    var c = $("rmControls"); if(!c) return;
    var st = S.sitting;
    var h = "";
    if(!st){
      h += '<button class="rm-btn primary" data-act="open">Open sitting</button>';
      try{ if(store().draft) h += '<button class="rm-btn" data-act="resume">Resume sitting</button>'; }catch(e){}
    } else if(!st.wrapped){
      h += '<button class="rm-btn primary" data-act="round" ' + (S.running ? "disabled" : "") + '>Next round</button>';
      h += '<button class="rm-btn" data-act="pause" ' + (S.running ? "" : "disabled") + '>Pause</button>';
      h += '<button class="rm-btn" data-act="say" ' + (S.running ? "disabled" : "") + '>Say it</button>';
      var armed = S.armWrap && (Date.now() - S.armWrap < 12000);
      h += '<button class="rm-btn danger' + (armed ? " armed" : "") + '" data-act="wrap" ' + (S.running ? "disabled" : "") + '>' + (armed ? "Press again to seal" : "Wrap up") + '</button>';
      h += '<button class="rm-btn" data-act="export">Export</button>';
    } else {
      h += '<button class="rm-btn" data-act="export">Export</button>';
      h += '<button class="rm-btn" data-act="close">Close</button>';
    }
    h += '<button class="rm-btn ghost" data-act="archive">' + (S.showArchive ? "Hide past" : "Past sittings") + '</button>';
    c.innerHTML = h;
    c.querySelectorAll("[data-act]").forEach(function(b){ b.onclick = function(){ act(b.dataset.act); }; });
  }
  function paintRecord(){
    var el = $("rmRecord"); if(!el) return;
    var b = recordBrief();
    var bits = ["anchor " + b.anchor, b.seals.length + " seal(s)"];
    if(b.open) bits.push("open: " + b.open.name);
    if(b.pipe) bits.push("pipeline " + b.pipe.result);
    bits.push(b.soul + " soul");
    el.textContent = bits.join(" · ");
  }
  function paintArchive(){
    var el = $("rmArchive"); if(!el) return;
    if(!S.showArchive){ el.hidden = true; el.innerHTML = ""; return; }
    var list = archive().slice().reverse();
    el.hidden = false;
    el.innerHTML = '<div class="sel-group">Past sittings</div>' + (list.length ? list.map(function(a, i){
      var idx = archive().length - 1 - i;
      return '<div class="rm-arch"><span class="rm-arch-t">' + E(a.topic).slice(0, 80) + '</span><span>' + new Date(a.at).toLocaleDateString() + ' · ' + a.turns + ' turns · ' + a.rounds + ' rounds' + (a.sealed === false ? ' · UNSEALED' : '') + (a.note ? ' — ' + E(a.note).slice(0, 90) : '') + '</span>'
        + '<span><button class="rm-btn ghost" data-recap="' + idx + '">recap in</button> <button class="rm-btn ghost" data-exp="' + idx + '">export</button></span></div>';
    }).join("") : '<div class="hint">No sittings archived yet — wrap one up and it lands here.</div>');
    el.querySelectorAll("[data-recap]").forEach(function(btn){
      btn.onclick = function(){
        var a = archive()[Number(btn.dataset.recap)];
        if(!a || S.running) return;
        var recap = "Earlier sitting “" + a.topic + "” (" + new Date(a.at).toLocaleDateString() + "):\n" + (a.blueprint || a.transcript.slice(-12).join("\n"));
        startSitting(a.topic + " (continued)", recap);
      };
    });
    el.querySelectorAll("[data-exp]").forEach(function(btn){
      btn.onclick = function(){ var a = archive()[Number(btn.dataset.exp)]; if(a) exportSitting(a); };
    });
  }

  function startAsk(id){
    var s = seat(id); if(!s || !S.sitting || S.sitting.wrapped || S.running) return;
    if(s.fired){ setStatus("that chair is empty — " + nm(s) + " was fired"); return; }
    if(s.held){ setStatus("that chair is yours — speak in the composer"); return; }
    S.askTarget = id;
    var inp = $("rmInput");
    if(inp){ inp.placeholder = "Ask " + nm(s) + "…"; inp.focus(); }
    paintControls();
    setStatus("ask mode — writing asks " + nm(s) + " directly (Esc cancels)");
  }
  function cancelAsk(){
    S.askTarget = null;
    var inp = $("rmInput");
    if(inp) inp.placeholder = "Speak to the table — problems, plans, or a win worth celebrating…";
    setStatus(S.sitting ? ("idle · round " + S.sitting.round + " · " + S.sitting.transcript.length + " turns") : "idle");
  }

  /* A reload wipes in-page state but the draft survives in localStorage —
     resume it so a sitting lives through refreshes, navigation, and drops. */
  function restoreDraft(){
    var d = null;
    try{ d = store().draft || null; }catch(e){}
    if(!d || S.running) return false;
    S.sitting = d; S.armWrap = 0; S.askTarget = null;
    /* Re-brief on resume: names, record and sovereign are read live, so a
       sitting picked up days later still briefs the table truthfully. */
    try{ d.persona = personaBlock(); }catch(e){}
    try{ d.record = recordBlock(recordBrief()); }catch(e){}
    try{ d.sov = getSov() || d.sov || null; }catch(e){}
    var l = $("rmLog"); if(l) l.innerHTML = "";
    var card = $("rmBlueprint"); if(card){ card.hidden = true; card.innerHTML = ""; }
    (d.transcript || []).forEach(function(line){
      var m = String(line).match(/^([^:]+):\s*([\s\S]*)$/);
      var who = m ? m[1] : "?";
      var text = m ? m[2] : String(line);
      var title = "";
      if(who === "Sovereign") title = "you";
      else { var s = seats().filter(function(x){ return nm(x) === who; })[0]; if(s) title = s.title; }
      appendTurn(who, title, text, false);
    });
    paintSeats(); paintControls(); try{ preloadLaw(); }catch(e){} draft();
    setStatus("sitting resumed — round " + (d.round || 0) + " · " + (d.transcript || []).length + " turns · the table waits on you");
    return true;
  }

  function startSitting(topic, recap){    topic = String(topic || "").trim();
    if(!topic || S.running) return false;
    /* Never silently drop a live sitting: an unsealed table with words on the
       record is set aside into the archive (marked unsealed) before the new
       sitting takes its place. That covers the live table AND an orphan draft
       (e.g. the page reloaded and a new sitting opens without resume). */
    var keep = null, keepNote = "unsealed — set aside when a new sitting opened";
    if(S.sitting && !S.sitting.wrapped && S.sitting.transcript && S.sitting.transcript.length) keep = S.sitting;
    else{
      try{
        var dd = store().draft;
        if(dd && !dd.wrapped && dd.transcript && dd.transcript.length) keep = dd;
      }catch(e){}
    }
    if(keep){
      try{
        archivePut({ at:keep.openedAt || Date.now(), topic:keep.topic,
          turns:keep.transcript.length, rounds:keep.round || 0,
          transcript:keep.transcript.slice(), blueprint:keep.blueprint || "",
          sealed:false, note:keepNote });
      }catch(e){}
    }
    S.sitting = newSitting(topic, recap);
    S.armWrap = 0; S.askTarget = null;
    var l = $("rmLog"); if(l) l.innerHTML = "";
    var card = $("rmBlueprint"); if(card){ card.hidden = true; card.innerHTML = ""; }
    appendTurn("Sovereign", "you", "calls the sitting: “" + topic + "”", false);
    S.sitting.transcript.push("Sovereign: calls the sitting to order on: " + topic);
    try{ logOp({ kind:"op", action:"room open", detail:topic.slice(0, 120), result:"sitting opened" }); }catch(e){}
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [boardroom sitting opened — " + topic.slice(0, 90) + "]"); }catch(e){}
    var inp = $("rmInput");
    if(inp){ inp.value = ""; inp.placeholder = "Speak to the table — problems, plans, or a win worth celebrating…"; }
    paintSeats(); paintControls(); try{ preloadLaw(); }catch(e){} draft();
    setStatus("sitting open — Next round seats the table");
    return true;
  }

  /* Simple things answer themselves: a bare redo cue re-seats the last
     speaker at once instead of waiting for a round. */
  function isRedoCue(t){
    var s = String(t || "").trim();
    if(/^\?+$/.test(s)) return true;
    return /^(try again|redo|say it again|once more|run it back|go again|again|stfu|shut up|shut it|quiet|stop)\b[\s.!]*$/i.test(s);
  }
  /* Park it now: "park <words>" / "backburner <words>" files the words as
     SOUL on the pipeline at once — the sitting's direct feed, mid-sitting. */
  function parkCue(t){
    var m = String(t || "").match(/^(park|backburner|file it)\b[:\s]+([\s\S]+)$/i);
    if(!m || !m[2] || m[2].trim().length < 4) return null;
    return m[2].trim().slice(0, 300);
  }
  /* An order is not a comment: "go" / "do it" sends the last speaker back
     to execute the step they committed to — no round, no relay. */
  function isGoCue(t){
    return /^(then\s+)?do it|^(go|proceed|carry on|execute|make it so|get it done)[\s.!]*$/i.test(String(t || "").trim());
  }
  function lastSpeaker(st){
    for(var i = st.transcript.length - 1; i >= 0; i--){
      var m = String(st.transcript[i]).match(/^([^:]{1,40}):\s/);
      if(!m) return null;
      if(/^sovereign$/i.test(m[1])) continue;
      var s = null; try{ s = resolveSeatKey(m[1]); }catch(e){}
      if(s && !s.fired && !s.held) return s.id;
      return null;
    }
    return null;
  }
  function goOrder(st, t){
    var id = lastSpeaker(st);
    var inp = $("rmInput"); if(inp) inp.value = "";
    st.transcript.push("Sovereign: " + t);
    appendTurn("Sovereign", "you", t, false);
    if(!id){ setStatus("heard — no speaker to order yet"); }
    else{
      setStatus("heard — " + nm(seat(id)) + " executes");
      speak(id, false,
        "You are " + nm(seat(id)) + ". The Sovereign just ordered you to execute — \"" + String(t).slice(0, 120) + "\""
        + " Do the step you committed to at this table, now, in 3 to 5 sentences of living speech, no bullets, no filler."
        + " If your committed step waits on something only the Sovereign can give, do not stall and do not invent it: lay out the exact intake — each question numbered in plain sentences — so one answer from the Sovereign unblocks you."
        + " Promise nothing time-bound: no dates, no weekdays, no seasons — the date law above binds every sentence."
        + " Never cross: " + (seat(id).red || []).join(" ")
        + " Your standing orders (your law — enforce it): " + (lawSO(id) || "uphold your mandate")
        + " Your remembered past (true — carry it): " + (lawMem(id) || "nothing filed yet"));
    }
    try{ draft(); }catch(e){}
  }
  /* Training sticks: a sovereign correction with content is filed on the
     named seats — or the whole living table — as a standing rule at once.
     No waiting for the wrap. */
  function isCorrection(t){
    var s = String(t || "");
    if(s.length < 15) return false;
    return /\b(never|no more|stop|enough with|don't|do not|quit|stfu with|shut up with|cut .* out|not another|no fake|no invented)\b/i.test(s);
  }
  function correctionTargets(t){
    var living = seats().filter(function(x){ return !x.fired && !x.held; });
    var hit = living.filter(function(s){
      var words = seatWords(nm(s) + " " + s.title, 4);
      return words.some(function(w){ return new RegExp("\\b" + w + "\\b", "i").test(t); });
    }).map(function(s){ return s.id; });
    return hit.length ? hit : living.map(function(s){ return s.id; });
  }
  function fileCorrection(ids, t){
    try{
      var so = store(); var mem = so.seatmem || {};
      var stamp = "";
      try{ stamp = new Date().toISOString().slice(0, 10); }catch(e){}
      ids.forEach(function(id){
        mem[id] = ((mem[id] ? mem[id] + " | " : "") + "Sovereign's standing rule (" + stamp + "): " + String(t).slice(0, 200)).slice(-600);
      });
      so.seatmem = mem; saveStore(so);
    }catch(e){}
  }

  /* THE CALL-ON — "Don, ..." / "Don: ..." / "ask Don ..." at the head of the
     line calls that seat the way the ask button does. A bare leading word with
     no address ("Marketing plan for Q3") is a topic, not a call — the comma,
     colon or "ask" is what summons. Returns {hit,...} or {hit:false}. */
  function callSeat(t){
    var none = { hit:false };
    var m = /^\s*(ask\s+)?([A-Za-z][A-Za-z.'-]*)\s*([,:])?/.exec(String(t || ""));
    if(!m || (!m[1] && !m[3])) return none;
    var first = m[2], all = seats(), hit = null, i, j;
    for(i = 0; i < all.length; i++){
      var words = seatWords(nm(all[i]), 3).concat(seatWords(all[i].title, 4));
      for(j = 0; j < words.length; j++){
        if(words[j].toLowerCase() === String(first).toLowerCase()){ hit = all[i]; break; }
      }
      if(hit) break;
    }
    if(!hit) return none;
    var rest = String(t).slice(m[0].length).replace(/^[\s,:—-]+/, "").trim();
    return { hit:true, id:hit.id, name:nm(hit), question:rest, fired:!!hit.fired, held:!!hit.held };
  }

  /* Shared call-on: "Don, ..." opens the sitting on the stripped question and
     hands it to that seat — used by BOTH the composer Enter path (say) and the
     Open control (act open), so a named call can never silently become a topic.
     Returns true when the line was consumed as a call. */
  function callByName(t){
    var called = callSeat(t);
    if(!called.hit) return false;
    var inp = $("rmInput"); if(inp) inp.value = "";
    if(called.fired){ setStatus(called.name + " — that chair is vacant (fired). Hire them back before calling on them."); return true; }
    if(called.held){ setStatus("that chair is yours — no voice answers for it. Speak it yourself."); return true; }
    if(!called.question){ setStatus(called.name + " is listening — give them the question."); if(inp) inp.focus(); return true; }
    var st = S.sitting;
    if(!st || st.wrapped){ if(!startSitting(called.question, "")){ setStatus("the table is moving — try again in a breath."); return true; } }
    askSeat(called.id, t); return true;
  }

  var SENS_KEY = "obi_tent_alarms";
  function readAlarms(){ try{ return JSON.parse(localStorage.getItem(SENS_KEY) || "{}") || {}; }catch(e){ return {}; } }
  function writeAlarms(o){ try{ localStorage.setItem(SENS_KEY, JSON.stringify(o)); }catch(e){} }
  /* THE STATION SENSORS — the only unasked speech in the tent. The leaders hold
     their peace unless the station itself trips: the command tunnel down, the
     master sync off COMPLETE, or a SOULCOUNT milestone (canon I.017). Plain
     status lines, no model call, one line per trip (deduped here); recovery
     clears silently. Maine Stream holds the roads. */
  function sensors(){
    var log = $("rmLog"); if(!log) return false;
    var A = readAlarms(), changed = false, said = 0;
    function say2(who, title, text){
      appendTurn(who, title, text, false);
      try{ if(S.sitting && !S.sitting.wrapped){ S.sitting.transcript.push(who + ": " + text); draft(); } }catch(e){}
      said++;
    }
    try{
      var tun = null;
      try{ tun = (typeof cmdSocketState !== "undefined") ? cmdSocketState : null; }catch(e){ tun = null; }
      if(tun === "failed" || tun === "closed"){
        if(A.tun !== tun){ A.tun = tun; changed = true;
          say2("Maine Stream", "Head of Systems", "Sensor — the command tunnel reads '" + tun + "'. I hold roads and circulation: the table hears what I find, nothing moves until then."); }
      } else if(A.tun){ A.tun = null; changed = true; }
      var res = null;
      try{ res = (window.ObiRelay && window.ObiRelay.cached && window.ObiRelay.cached()) || null; }catch(e){ res = null; }
      var rr = (res && res.result) ? String(res.result) : null;
      if(rr && !/^complete$/i.test(rr)){
        if(A.relay !== rr){ A.relay = rr; changed = true;
          say2("Maine Stream", "Head of Systems", "Sensor — the last master sync reads '" + rr.slice(0, 80) + "', not COMPLETE. The road is swept before anything rolls on it."); }
      } else if(A.relay){ A.relay = null; changed = true; }
      var n = 0;
      try{ n = (typeof soulCount === "function") ? soulCount() : 0; }catch(e){ n = 0; }
      var th = 0, i, TS = [5000, 25000, 100000, 250000];
      for(i = 0; i < TS.length; i++){ if(n >= TS[i]) th = TS[i]; }
      if(th > (A.soul || 0)){ A.soul = th; changed = true;
        say2("Maine Stream", "Head of Systems", "Sensor — SOULCOUNT reads " + n + " chars, past the " + th + " mark (canon I.017). The ledger holds; custody without veto."); }
    }catch(e){}
    if(changed) writeAlarms(A);
    try{ if(said) setStatus(said + " sensor line" + (said > 1 ? "s" : "") + " on the record — the leaders hold their peace otherwise."); }catch(e){}
    return true;
  }

  function say(){
    var inp = $("rmInput"); if(!inp) return;
    var t = inp.value.trim(); if(!t) return;
    var st = S.sitting;
    if(S.askTarget){
      if(S.running) return;
      var id = S.askTarget; S.askTarget = null; inp.value = ""; cancelAsk(); askSeat(id, t); return;
    }
    /* called by name: the leader answers (opening the sitting on the question
       if none is open). Held chairs are the sovereign's own — fired ones vacant. */
    if(!S.running){ if(callByName(t)) return; }
    if(!st || st.wrapped) return;
    if(!S.running){
      var parkWords = parkCue(t);
      if(parkWords){
        inp.value = "";
        var row = null;
        try{ if(window.ObiIdeas && window.ObiIdeas.add) row = window.ObiIdeas.add(parkWords, { via:"parked mid-sitting — " + String(st.topic).slice(0, 60) }); }catch(e){}
        st.transcript.push("Sovereign: " + t);
        appendTurn("Sovereign", "you", t, false);
        try{ draft(); }catch(e){}
        setStatus(row ? ("parked → " + row.id + " (SOUL, on the pipeline)") : "the pipeline did not answer — words kept in the transcript");
        return;
      }
    }
    if(!S.running && isGoCue(t)){ goOrder(st, t); return; }
    if(!S.running && isRedoCue(t)){
      var lastId = lastSpeaker(st);
      inp.value = "";
      if(lastId){ st.transcript.push("Sovereign: " + t); appendTurn("Sovereign", "you", t, false); setStatus("heard — " + nm(seat(lastId)) + " goes again"); speak(lastId); }
      else { st.transcript.push("Sovereign: " + t); appendTurn("Sovereign", "you", t, false); setStatus("heard — no speaker to redo yet"); }
      try{ draft(); }catch(e){}
      return;
    }
    if(isCorrection(t)){
      var ids = correctionTargets(t);
      inp.value = "";
      st.transcript.push("Sovereign: " + t);
      appendTurn("Sovereign", "you", t, false);
      fileCorrection(ids, t);
      try{ draft(); }catch(e){}
      setStatus(S.running ? "heard mid-round — filed on " + ids.length + " seat(s), the next speakers carry it" : "filed — " + ids.map(function(x){ return nm(seat(x)); }).join(", ") + " carry it from here");
      return;
    }
    inp.value = "";
    st.transcript.push("Sovereign: " + t);
    appendTurn("Sovereign", "you", t, false);
    try{ rrlAppend(runNoOf(), "DNA", "Obi: [room hears sovereign — " + t.slice(0, 90) + "]"); }catch(e){}
    draft();
    setStatus(S.running ? "heard mid-round — the next speakers carry it" : "heard — Next round carries it to the table");
  }

  function act(a){
    if(a === "open"){
      var inp = $("rmInput");
      var v = inp ? inp.value.trim() : "";
      if(!v){ setStatus("name the question first — one line is enough"); if(inp) inp.focus(); return; }
      if(!S.running && callByName(v)) return;
      startSitting(v, "");
    }
    else if(a === "round") round();
    else if(a === "resume") restoreDraft();
    else if(a === "pause") pause();
    else if(a === "say") say();
    else if(a === "wrap") wrap();
    else if(a === "export") exportSitting(null);
    else if(a === "close"){ S.sitting = null; S.armWrap = 0; var l = $("rmLog"); if(l) l.innerHTML = ""; var c = $("rmBlueprint"); if(c){ c.hidden = true; c.innerHTML = ""; } try{ var dd = store(); delete dd.draft; saveStore(dd); }catch(e){} paintSeats(); paintControls(); setStatus("idle — name the next question"); }
    else if(a === "archive"){ S.showArchive = !S.showArchive; paintArchive(); paintControls(); }
  }

  function skeleton(){
    return '<div class="rm-wrap">'
      + '<div class="rm-head"><div class="rm-title">◈ The Boardroom — the living table</div>'
      + '<div class="hint">Seven seats, present at all times, silent until called by name (“Don, …”) or tripped by a station sensor. Nothing scripted: every voice answers live, the record briefs the table, victories on it get celebrated, gaps stay visible. The sovereign has the final word.</div>'
      + '<div class="rm-record" id="rmRecord"></div></div>'
      + '<div class="rm-starters"><button class="rm-btn ghost" data-starter="problem">a problem</button><button class="rm-btn ghost" data-starter="plan">a plan</button><button class="rm-btn ghost" data-starter="win">a victory</button></div>'
      + '<div class="rm-table" id="rmTable"></div>'
      + '<div class="rm-log" id="rmLog"></div>'
      + '<div class="rise" id="rmBlueprint" hidden style="margin:0"></div>'
      + '<div class="rm-composer"><textarea id="rmInput" rows="2" placeholder="Name the question for the table…"></textarea></div>'
      + '<div class="rm-controls" id="rmControls"></div>'
      + '<div class="rm-status" id="rmStatus">idle</div>'
      + '<div id="rmArchive"></div>'
      + '</div>';
  }

  function mount(){
    var w = document.getElementById("roomWrap");
    if(!w) return false;
    if(!S.mounted){ w.innerHTML = skeleton(); S.mounted = true; }
    var inp = $("rmInput");
    if(inp && !inp.__wired){
      inp.__wired = true;
      inp.addEventListener("keydown", function(ev){
        if(ev.key === "Enter" && !ev.shiftKey){ ev.preventDefault(); act(S.sitting ? "say" : "open"); }
        if(ev.key === "Escape" && S.askTarget) cancelAsk();
      });
    }
    var wrap = w.closest("#viewRoom");
    paintSeats(); paintControls(); paintRecord(); paintArchive();
    try{ preloadLaw(); }catch(e){}
    if(!S.sitting) setStatus("idle — name the question, or pick a starter");
    else setStatus("idle · round " + S.sitting.round + " · " + S.sitting.transcript.length + " turns");
    w.querySelectorAll("[data-starter]").forEach(function(b){
      b.onclick = function(){
        var k = b.dataset.starter;
        var i2 = $("rmInput"); if(!i2) return;
        if(k === "problem") i2.value = "What's the biggest problem facing us right now, and what do we do about it this week?";
        if(k === "plan") i2.value = "What's the plan for this week — who owns what, and what does done look like?";
        if(k === "win") i2.value = "What have we just won, and who gets the credit?";
        i2.focus();
      };
    });
    return true;
  }

  window.ObiRoom = { mount:mount, state:function(){ return S; }, setSovereign:setSov, getSovereign:getSov, compact:function(){ return maybeCompact(S.sitting); }, sensors:sensors,
    order:function(){ var st = S.sitting; if(st && !st.wrapped && !S.running){ var inp = $("rmInput"); var t = (inp && inp.value.trim()) || "Go"; goOrder(st, t); } },
    distill:function(){ try{ distillRound(S.sitting); }catch(e){} return true; },
    prompt:function(task){ try{ return buildPrompt(S.sitting, String(task || "Reply with OK.")); }catch(e){ return "ERR: " + e.message; } },
    brief:function(){ var l = 0, m = 0; try{ for(var k in (S.law || {})){ if(S.law[k].law) l++; if(S.law[k].mem) m++; } }catch(e){} return { law:l, mem:m, personaChars:(S.sitting && S.sitting.persona || "").length }; } };
})();
