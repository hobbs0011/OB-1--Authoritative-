/* ============================================================================
   NET ACADEMY — src/lessons.js
   The lesson engine. Turns a JSON spec into the sovereign's lesson format.

   THE STANDARD IS THE LAW: src/LESSON-STANDARD.md — Part I (the lesson format,
   derived from the two reference lessons) and Part II (the method and the machine,
   derived from NET-CLASSROOM-MANAGER.html: the 10-5-5-3 session, the game
   taxonomy, the tiers and coins, the sovereign's voice, and the ten defects in the
   specimen that are never inherited). This module does not have an opinion — it
   enforces that document:

     · one self-contained .html file, no build, no framework (LSN-1)
     · the fixed brand tokens, glass cards, purple→gold gradient (LSN-2)
     · landing → lesson, nothing else (LSN-3)
     · six rooms on the same spine — entrance, scenes, vocab, test, exit (LSN-4/5)
     · Chatty teaches: clue (reality check) · hint (the transferable rule) ·
       feedback that re-teaches, never a bare "wrong" (LSN-6)
     · practice scores, with coins, on data-answer buttons (LSN-7)
     · the exit hands over a key (summary card + level up or a writing task) (LSN-8)
     · transform/opacity motion only, phone-first at 720px (LSN-9/10)
     · a lesson that fails the check is not shipped (LSN-11)

   Commands: /lesson (the desk) · /lesson <topic> · /lesson check · /lesson standard
             · /lesson list · /lesson push <id>
   Module:   window.ObiLessons  { SPEC?, validate, build, prompt, run, standard,
             mount, act, plan, push, records, desk }
   The DESK (◈ Phoenix Generators → NET → 📚 Lesson Creator) is the four-room UI:
   🧭 Plan (evidence → topic → objectives) · ✍ Build (Agent 99 or your own spec) ·
   🗂 Library (everything built for this client) · 📐 Standard (the eleven laws).
   ========================================================================== */
(function(){
  "use strict";

  const KV_FOLDER = "lessons";
  const REF_DIR = "src/lessons/reference/";
  const REFS = ["NET-Sarcasm-Academy.html", "NET-Highschool-Careers.html", "NET-Neon-City-Genesis.html", "NET-CLASSROOM-MANAGER.html"];
  const STANDARD = "src/LESSON-STANDARD.md";

  /* the approved component vocabulary — content may use nothing else (LSN-5).
     STATE classes (empty/selected/correct/wrong on the feedback + choice pills)
     and the writing-task class are part of the contract too. */
  const CLASSES = ["dialogue-block","speaker","chatty-clue","chatty-hint","vocab-list","vocab-item",
                   "chatty-choices","chatty-feedback","summary-card","write-task","reading","game","picker","timer",
                   "empty","selected","correct","wrong"];
  /* THE ICONOGRAPHY ARSENAL (LSN-39) — one registry, every icon intentional.
     Authors tag any content element with data-icon="key" and the runtime prepends
     the emoji; the validator warns on unknown keys and on fallback graphics. */
  const ICONS = {coin:"🪙",die:"🎲",marble:"🔮",card:"🃏",spinner:"🎡",heads:"🙂",tails:"🙃",ticket:"🎫",
    rain:"🌧",sun:"☀️",cloud:"☁️",fruit:"🍎",apple:"🍎",banana:"🍌",animal:"🐾",shape:"🔷",color:"🎨",
    red:"🔴",blue:"🔵",green:"🟢",yellow:"🟡",month:"📅",day:"📆",student:"🧑‍🎓",teacher:"🧑‍🏫",school:"🏫",
    book:"📚",word:"🔤",speak:"🎤",listen:"👂",write:"✍️",read:"📖",play:"🎮",team:"👥",win:"🏆",key:"🔑",
    star:"⭐",check:"✅",cross:"❌",question:"❓",idea:"💡",time:"⏱️",number:"🔢",letter:"🔡",traffic:"🚦",
    weather:"⛅",drink:"🥤",club:"🎭",music:"🎵",art:"🎨",math:"🧮",science:"🔬",probability:"🎲",
    outcome:"🪙",sample:"🗺️",event:"🎯",certain:"🔒",possible:"🌱",impossible:"🚫",chance:"🍀",
    result:"📝",happen:"⚡",warm:"🔥",spin:"🎡",chat:"💬",scene:"🎬",learn:"📚",test:"🎯",mastery:"🔑",
    game:"🎮",duel:"⚔️",drill:"🥁",timer:"⏱️",print:"🖨️",sound:"🔊"};
  /* THE GAMES (the lesson's own runtime plays them — no scripts in the content).
     One element, nine core game types + five arsenal games, driven entirely by data attributes:
       <div class="game" data-game="scramble" data-items="cooker=the machine you cook on;pot=…"></div>
       <div class="game" data-game="match"    data-items="shelf=a flat board on the wall;…"></div>
       <div class="game" data-game="sort"     data-groups="Identity: clothes, food, language | Home: shelf, pot"></div>
     Scramble: the learner clicks letter tiles in order to rebuild each word.
     Match:    click a word, then its meaning — a wrong pair shakes and releases.
     Sort:     click a chip, then the group it belongs to.
     Every correct answer pays the lesson's own coin reward; nothing is scored twice.
     Order: click the steps back into their true sequence (data-items in true order, tiles shuffled).
     Odd: spot the one that does not belong (data-items="a;b;c", data-odd="c").
     Flip: flashcards, click to flip word to meaning (data-items pairs).
     Battle: two teams wager coins on every answer (data-items pairs, data-teams="A|B"). */
  /* STORM (tornado port, mechanics adopted from p-serrano/tornado — that repo carries no license file, so mechanics only, code is original): answer a question, then brave the hidden-tile risk board. Grid 4/5/6 via data-grid; specials density 4:{storm 1, swap 2, half 1, double 1} 5:{2,3,2,2} 6:{3,4,3,3}; score tiles pay team points; STORM wipes the picking team, swap trades with the next team, half ceils, double doubles; wrong answers rebound once to the next team. Phases run question -> board-pick -> reveal -> apply -> next team.
     BOARD (jeopardy port, mechanics adopted from domlet/jeopardy-csv — same no-license situation, mechanics only): data-board with Cat: clue = answer pairs (values auto 100/200/...); current team picks a cell, says the answer out loud, teacher taps Correct (banks value) or Wrong (one rebound, then the cell burns and the answer is shown). */
  const GAMES = ["scramble","match","sort","order","odd","flip","battle","storm","board","tiles","tornado","memory","dice","reveal","voice"];
  /* + games-arsenal (src/games-arsenal.js, ported from the Anakin station 2026-10-22): tornado|memory|dice|reveal|voice render THERE (core validator passes them, core runtime leaves them empty); board/order elements carrying data-cards (board) or data-order-without-data-items (order) also yield to it — see initGames. KSU dialects: core spec.outcomes{know,do,understand} vs arsenal method.outcomes{knowledge,skills,understanding} — separate fields, no war. */
  /* the spine (LSN-4) — the four anchors never move */
  const SPINE = [
    { at:0,     graphic:"🏠", label:"Warm-Up", what:"welcome + what you will leave with, as bullets", fixed:true },
    { at:1,     graphic:"🖥️", label:"Scene",   what:"verbatim dialogue between named people" },
    { at:2,     graphic:"📱", label:"Text Scene", what:"the same skill in chat / emoji form" },
    { at:3,     graphic:"📚", label:"Learn",   what:"five numbered terms (the session's vault holds ten) — 10-5-5-3", fixed:true },
    { at:4,     graphic:"🎯", label:"Test",    what:"clickable scenarios that score", fixed:true },
    { at:"last",graphic:"🔑", label:"Mastery", what:"the summary card + what to do next", fixed:true }
  ];

  /* ------------------------------- helpers -------------------------------- */
  function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function bubble(html){ if(typeof window.addBubble === "function") window.addBubble("ass", html); else console.log(html); }
  function log(o){ try{ if(typeof window.logOp === "function") window.logOp(o); }catch(e){} }
  function dna(line){ try{ if(typeof window.rrlAppend === "function") window.rrlAppend(window.runNoOf ? window.runNoOf() : null, "DNA", line); }catch(e){} }
  function scroll(){ try{ if(typeof window.scrollDown === "function") window.scrollDown(); }catch(e){} }
  function folder(){
    try{ return (typeof root !== "undefined" && root && root.kv) ? (root.kv[KV_FOLDER] || null) : null; }catch(e){ return null; }
  }
  /* never let a model put a script, a style block, an event handler or a
     javascript: URL into a lesson — even though the validator refuses first. */
  function sanitize(html){
    return String(html == null ? "" : html)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<(iframe|object|embed|link|meta|base|form)\b[^>]*>/gi, "")
      .replace(/<\/?(html|head|body|script|style)\b[^>]*>/gi, "")
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript:/gi, "");
  }

  /* ------------------------------ validation ------------------------------- */
  function validate(spec){
    const errors = [], warnings = [];
    spec = spec || {};
    if(!spec.title || !String(spec.title).trim()) errors.push("no title");
    if(!spec.logo) errors.push("no logo emoji");
    if(!spec.subtitle) errors.push("no subtitle (the one-line promise)");
    if(!spec.cta) errors.push("no CTA label");
    const feats = Array.isArray(spec.features) ? spec.features : [];
    if(feats.length < 3 || feats.length > 4) errors.push("features must be 3–4 (found " + feats.length + ")");
    feats.forEach((f, i) => { if(!f || !f.icon || !f.title || !f.desc) errors.push("feature " + (i+1) + " needs icon + title + desc"); });

    const rooms = Array.isArray(spec.rooms) ? spec.rooms : [];
    if(rooms.length < 6) errors.push("six rooms minimum — found " + rooms.length);
    const at = i => rooms[i] ? rooms[i] : null;
    const last = rooms[rooms.length - 1] || {};
    const labelOf = r => String((r && r.label) || "").toLowerCase();
    if(rooms.length){
      if(!/warm/.test(labelOf(at(0))))  errors.push("room 1 must be the warm-up (label contains 'warm')");
      if(!/mastery|finish/.test(labelOf(last))) errors.push("the last room must be the exit (label 'mastery' or 'finish')");
    }
    /* THE ANCHORS ARE FOUND BY LABEL, NOT BY POSITION. The spine still opens with the
       warm-up and closes with the exit, and the learn room still comes before the test
       room — but a lesson may now carry MORE rooms than the six (games, extra practice,
       a reading room) without breaking the check. */
    const learnIdx = rooms.findIndex(r => labelOf(r) === "learn");
    const testIdx  = rooms.findIndex(r => /test|quiz/.test(labelOf(r)));
    if(learnIdx < 0) errors.push("no learn room — one room must be labelled 'learn' (exactly)");
    if(testIdx  < 0) errors.push("no test room — one room must be labelled 'test' or 'quiz'");
    if(learnIdx >= 0 && testIdx >= 0 && testIdx < learnIdx) errors.push("the test room must come after the learn room");
    rooms.forEach((r, i) => {
      const n = "room " + (i+1);
      if(!r || !r.graphic) errors.push(n + ": no graphic emoji");
      if(!r || !r.title) errors.push(n + ": no title");
      if(!r || !r.content) errors.push(n + ": empty content");
      const c = String((r && r.content) || "");
      if(/<script|<style|onclick=|onerror=/i.test(c)) errors.push(n + ": content carries script/style/handler — refused");
      /* only approved classes outside the wrapper tags */
      const used = (c.match(/class="([^"]+)"/g) || []).map(s => s.slice(7, -1)).join(" ").split(/\s+/).filter(Boolean);
      used.forEach(cl => { if(CLASSES.indexOf(cl) === -1) errors.push(n + ": unknown class \"" + cl + "\" (the vocabulary is fixed)"); });
      const styleAttr = (c.match(/style="([^"]*)"/g) || []);
      styleAttr.forEach(s => { const decl = s.slice(7, -1); if(!/^(margin[^;]*;?\s*)+$/.test(decl)) errors.push(n + ": inline style is only allowed for margin one-offs"); });
      /* the arsenal is fixed: unknown game kinds, icon keys and coin overrides fail or warn here, never in the classroom */
      const gkinds = (c.match(/data-game="([^"]*)"/g) || []).map(function(x){ return x.slice(11, -1); });
      gkinds.forEach(function(k){ if(GAMES.indexOf(k) === -1) errors.push(n + ": unknown game \"" + k + "\" (the arsenal: " + GAMES.join("|") + ")"); });
      const ikeys = (c.match(/data-icon="([^"]*)"/g) || []).map(function(x){ return x.slice(11, -1); });
      ikeys.forEach(function(k){ if(!ICONS[k]) warnings.push(n + ": unknown icon \"" + k + "\" (no glyph ships, nothing breaks)"); });
      const dcs = (c.match(/data-coins="([^"]*)"/g) || []).map(function(x){ return x.slice(12, -1); });
      dcs.forEach(function(k){ if(!(Number(k) > 0)) warnings.push(n + ": data-coins should be a positive number (found \"" + k + "\")"); });
      const timers = (c.match(/class=(["'])timer\1/g) || []).length;
      if(timers && c.indexOf("data-seconds") === -1) warnings.push(n + ": .timer without data-seconds -- defaults to 60");
    });
    const learn = (learnIdx >= 0 ? rooms[learnIdx] : {}) || {}; const learnC = String(learn.content || "");
    const vocab = (learnC.match(/class="vocab-item"/g) || []).length;
    if(vocab < 3) errors.push("the learn room needs a .vocab-list with 3+ .vocab-item (found " + vocab + ")");
    if(vocab && (learnC.match(/<strong>/gi) || []).length < vocab) errors.push("every vocab item needs a <strong> term");

    const test = (testIdx >= 0 ? rooms[testIdx] : {}) || {}; const testC = String(test.content || "");
    const blocks = (testC.match(/class="chatty-choices"/g) || []).length;
    if(!blocks) errors.push("the test room needs at least one .chatty-choices block");
    const answers = (testC.match(/data-answer="/g) || []).length;
    if(blocks && answers < blocks * 2) errors.push("every choice block needs 2–3 buttons carrying data-answer");
    if(testC.indexOf("data-correct-feedback") === -1 || testC.indexOf("data-wrong-feedback") === -1) errors.push("each choice block must carry data-correct-feedback and data-wrong-feedback");
    /* the runtime writes the re-teaching into .chatty-feedback — without the
       element the miss has nowhere to land (LESSON.004). Both reference lessons
       carry it; the check now does too. */
    if(testC.indexOf("chatty-feedback") === -1) errors.push("the test room needs a .chatty-feedback element — a miss must re-teach the rule, not vanish");

    const lastC = String(last.content || "");
    if(lastC.indexOf("summary-card") === -1) errors.push("the exit room needs a .summary-card");
    const lis = (lastC.match(/<li>/g) || []).length;
    if(lis < 3) errors.push("the summary card needs 3+ <li> takeaways (found " + lis + ")");
    if(!/level up/i.test(lastC) && lastC.indexOf("<textarea") === -1) errors.push("the exit needs either a Level Up hint or a writing <textarea>");

    const before = rooms.slice(0, learnIdx < 0 ? 4 : learnIdx).map(r => String((r && r.content) || "")).join("");
    if(before.indexOf("chatty-clue") === -1) errors.push("no .chatty-clue before the test — Chatty must do the reality check");
    if(before.indexOf("chatty-hint") === -1) errors.push("no .chatty-hint before the test — Chatty must give the transferable rule");

    /* a duel without a game is a poster; every room earns its own face */
    rooms.forEach(function(r, i){ var lb = labelOf(r); if(/duel|drill|battle|arena/.test(lb) && String((r && r.content) || "").indexOf('class="game"') === -1) errors.push("room " + (i + 1) + ": a " + lb + " room must carry at least one game"); });
    (function(){ var seen = {}; rooms.forEach(function(r, i){ var g = String((r && r.graphic) || ""); if(!g) return; if(seen[g]) warnings.push("room " + (i + 1) + " repeats the graphic of room " + seen[g] + " (every room earns its own face)"); else seen[g] = i + 1; }); })();
    /* warnings — allowed, but the sovereign should see them */
    const sceneRooms = rooms.slice(1, 3).filter(r => /dialogue-block/.test(String((r && r.content) || ""))).length;
    if(sceneRooms < 1) warnings.push("room 2 has no .dialogue-block — the middle rooms are the scene rooms");
    if(rooms.length < 6) warnings.push("fewer than six rooms");
    const coins = spec.coins || {};
    if(coins.correct != null && !(Number(coins.correct) > 0)) warnings.push("coins.correct should be > 0");
    if(coins.wrong != null && Number(coins.wrong) > Number(coins.correct || 0)) warnings.push("losing more than you gain punishes the learner");
    /* LESSON.016 / LSN-37 — a lesson is chosen by evidence, and says so on its face */
    if(!spec.evidence) warnings.push("no evidence named — say which writeup/review chose this lesson (LESSON.016)");

    /* LSN-23 / LESSON.001 & .011 — when the spec carries a `method` block it is
       checked; a full session's lesson set carries it (10-5-5-3, three typed games,
       a named phase, the sovereign's lines it used). Absent, the lesson is still
       legal — but a session without three games teaches without retrieval. */
    const m = spec.method;
    let games = 0;
    if(m && typeof m === "object"){
      if(String(m.structure || "").replace(/\s/g, "") !== "10-5-5-3") warnings.push("method.structure should be '10-5-5-3' (10 vocab · 5 idioms · 5 slang · 3 games)");
      if(!m.phase) warnings.push("method: name the phase this lesson sits in (Hook / Vocab / Idioms / Slang / Review)");
      const gs = Array.isArray(m.games) ? m.games : [];
      games = gs.length;
      if(gs.length < 3) errors.push("method.games needs 3+ games (found " + gs.length + ") — a NET session carries three");
      gs.forEach((g, i) => {
        if(!g || !g.name) errors.push("method.games[" + i + "] needs a name");
        if(!g || !g.why) errors.push("method.games[" + i + "] must own up to its mechanism (a `why` line — what it does to the learner)");
      });
      const kinds = gs.map(g => String((g && g.type) || ""));
      kinds.forEach((k, i) => { if(["competition","collaboration","creation"].indexOf(k) === -1) warnings.push("method.games[" + i + "] type should be competition | collaboration | creation"); });
      if(kinds.length >= 3 && kinds.every(k => k === kinds[0])) warnings.push("three games of one type — the mix is the method (🔴 adrenaline / 🟢 social proof / 🟣 ownership)");
      if(m.voice != null && !Array.isArray(m.voice)) warnings.push("method.voice should be a list of the sovereign's lines the lesson used");
    }

        /* KSU outcomes + differentiation (LPG harvest, 2026-10-21, ported from the
       edtech station — checked only when present; absent is legal (specs built
       before them still ship). Present-but-malformed is an error: a half-triple
       trains nothing and a single rope is not differentiation. */
    if(spec.outcomes != null){
      const o = spec.outcomes;
      if(!o || typeof o !== "object" || !o.know || !o.do || !o.understand) errors.push("outcomes must be the full KSU triple (know + do + understand)");
    }
    if(spec.differentiation != null){
      const d = spec.differentiation;
      if(!d || typeof d !== "object" || !d.support || !d.extend) errors.push("differentiation must carry both ropes (support + extend)");
    }

    return { ok: errors.length === 0, errors: errors, warnings: warnings, rooms: rooms.length, vocab: vocab, blocks: blocks, games: games };
  }

  /* --------------------------------- theme -------------------------------- */
  const THEME = [
":root{--neon-purple:#a855f7;--gold:#f59e0b;--deep-dark:#0f0f1a;--glass-bg:rgba(26,26,38,0.7);--glass-border:rgba(168,85,247,0.2);--text-primary:#e5e7eb;--font-ui:Inter,system-ui,sans-serif}",
"*{margin:0;padding:0;box-sizing:border-box}",
"body{background:var(--deep-dark);font-family:var(--font-ui);color:var(--text-primary);min-height:100vh;overflow-x:hidden;position:relative}",
"body::before,body::after{content:'';position:fixed;width:60%;height:60%;filter:blur(80px);opacity:.2;z-index:-1;animation:pulse 10s infinite alternate}",
"body::before{top:-20%;left:-10%;background:radial-gradient(circle,var(--neon-purple),transparent 60%)}",
"body::after{bottom:-20%;right:-10%;background:radial-gradient(circle,var(--gold),transparent 60%);animation:pulse 12s infinite alternate-reverse}",
"@keyframes pulse{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.3) translate(20px,20px)}}",
".landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;position:relative;z-index:1}",
/* LSN-32 (2026-09-23): flex items shrink by default, so on a phone a long hero
   title was squashed into a box shorter than its own glyphs and the status bar printed
   over the last line. A lesson named the school's way is a full guide row, not a short
   brand name, so the hero must never be allowed to shrink: it overflows and scrolls. */
".landing>*{flex:0 0 auto}",
".hero-logo{width:140px;height:140px;margin-bottom:2rem;animation:heroFloat 3s ease-in-out infinite;filter:drop-shadow(0 0 50px var(--neon-purple));display:flex;align-items:center;justify-content:center;font-size:5rem;line-height:1}",
"@keyframes heroFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-25px) rotate(5deg)}}",
".hero-title{font-size:clamp(3rem,10vw,7rem);font-weight:800;background:linear-gradient(135deg,var(--neon-purple),var(--gold));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1.5rem;text-align:center;letter-spacing:-.02em;animation:titleGlow 3s ease-in-out infinite}",
"@keyframes titleGlow{0%,100%{filter:drop-shadow(0 0 30px rgba(168,85,247,.5))}50%{filter:drop-shadow(0 0 60px rgba(245,158,11,.8))}}",
".hero-subtitle{font-size:clamp(1.2rem,3vw,1.9rem);text-align:center;margin-bottom:3rem;max-width:700px;opacity:.95;line-height:1.6}",
".hero-cta{background:linear-gradient(135deg,var(--neon-purple),var(--gold));color:var(--deep-dark);font-size:1.5rem;font-weight:700;padding:1.3rem 3.5rem;border:none;border-radius:999px;cursor:pointer;transition:all .3s;box-shadow:0 0 50px rgba(168,85,247,.6);font-family:var(--font-ui);position:relative;overflow:hidden}",
".hero-cta::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold),var(--neon-purple));opacity:0;transition:opacity .3s}",
".hero-cta:hover::before{opacity:1}",
".hero-cta span{position:relative;z-index:1}",
".hero-cta:hover{transform:scale(1.08) translateY(-3px);box-shadow:0 0 80px rgba(168,85,247,.9),0 0 100px rgba(245,158,11,.5)}",
".hero-features{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2rem;margin-top:5rem;max-width:1000px;width:100%}",
".feature-card{background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:1.2rem;padding:2rem;text-align:center;transition:all .3s;box-shadow:0 8px 32px rgba(0,0,0,.4)}",
".feature-card:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 15px 50px rgba(168,85,247,.4);border-color:var(--gold)}",
".feature-icon{font-size:3.5rem;margin-bottom:1rem;filter:drop-shadow(0 0 25px var(--gold));animation:iconBounce 2s ease-in-out infinite}",
"@keyframes iconBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}",
".feature-title{font-weight:700;color:var(--gold);margin-bottom:.8rem;font-size:1.2rem}",
".feature-desc{opacity:.9;line-height:1.5}",
".classroom{display:none;min-height:100vh;align-items:center;justify-content:center;padding:2rem 1rem}",
".classroom.active{display:flex}",
".rooms-container{width:100%;max-width:650px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:1.8rem;box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 80px rgba(168,85,247,.3);overflow:hidden;position:relative;min-height:650px}",
".progress-bar{position:absolute;top:0;left:0;right:0;height:4px;background:rgba(255,255,255,.1);z-index:10}",
".progress-fill{height:100%;background:linear-gradient(90deg,var(--neon-purple),var(--gold));transition:width .5s cubic-bezier(.68,-.55,.265,1.55);box-shadow:0 0 15px var(--gold)}",
".room{opacity:0;transform:translateX(30px);pointer-events:none;position:absolute;inset:0;transition:opacity .5s,transform .6s cubic-bezier(.68,-.55,.265,1.55);display:flex;flex-direction:column;padding:3rem 2.5rem;z-index:0;overflow-y:auto}",
".room.active{opacity:1;pointer-events:auto;transform:translateX(0);z-index:2}",
".room-header{display:flex;align-items:center;gap:1.5rem;margin-bottom:2rem;flex-wrap:wrap}",
".scene-graphic{width:90px;height:90px;border-radius:1.8rem;background:linear-gradient(140deg,var(--neon-purple) 60%,var(--gold) 96%);box-shadow:0 0 40px rgba(168,85,247,.7);display:flex;align-items:center;justify-content:center;font-size:3.5rem;text-shadow:0 0 25px rgba(245,158,11,.9);animation:sceneEntrance .9s cubic-bezier(.68,-.55,.265,1.55);will-change:transform,opacity}",
"@keyframes sceneEntrance{0%{transform:scale(.4) rotate(-15deg);opacity:0}100%{transform:scale(1) rotate(0);opacity:1}}",
".room-title{font-size:1.8rem;font-weight:800;letter-spacing:-.01em}",
".room-label{background:var(--neon-purple);color:#fff;font-size:.8rem;border-radius:999px;padding:.4rem 1.1rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;box-shadow:0 0 25px rgba(168,85,247,.6);animation:labelPulse 2s ease-in-out infinite}",
"@keyframes labelPulse{0%,100%{box-shadow:0 0 15px rgba(168,85,247,.4)}50%{box-shadow:0 0 35px rgba(245,158,11,.7)}}",
".dialogue-block{background:rgba(38,38,60,.9);border-left:4px solid var(--neon-purple);border-radius:1rem;padding:1.3rem;margin-bottom:1.3rem;box-shadow:0 5px 20px rgba(0,0,0,.4);line-height:1.7;transition:all .3s}",
".dialogue-block:hover{border-left-color:var(--gold);box-shadow:0 8px 30px rgba(168,85,247,.3)}",
".speaker{font-weight:700;color:var(--gold);font-size:1.1rem;margin-bottom:.5rem;display:block;text-shadow:0 0 12px rgba(245,158,11,.5)}",
".chatty-clue{padding:1rem;background:rgba(187,247,208,.12);color:#bbf7d0;border-radius:1rem;margin-bottom:1.3rem;border:1px solid rgba(187,247,208,.25);font-size:1rem;line-height:1.7;box-shadow:0 0 20px rgba(34,197,94,.1)}",
".chatty-hint{font-size:1rem;color:var(--gold);margin-bottom:1.8rem;background:rgba(50,35,68,.7);padding:1rem;border-radius:1rem;border:1px solid rgba(245,158,11,.25);line-height:1.7}",
".vocab-list{display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem}",
".vocab-item{background:rgba(38,38,60,.8);padding:1rem;border-radius:.8rem;border-left:3px solid var(--neon-purple);transition:all .3s}",
".vocab-item:hover{border-left-color:var(--gold);background:rgba(168,85,247,.15);transform:translateX(5px)}",
".vocab-item strong{color:var(--gold);display:block;margin-bottom:.3rem}",
".nav-btns{display:flex;justify-content:space-between;margin-top:auto;gap:1rem;padding:1.5rem .25rem .25rem;position:sticky;bottom:0;z-index:3;background:linear-gradient(180deg,rgba(15,15,26,0) 0%,rgba(15,15,26,.72) 40%);backdrop-filter:blur(8px)}",
".nav-btn{flex:1;background:linear-gradient(135deg,var(--neon-purple),var(--gold));color:var(--deep-dark);font-weight:700;font-size:1.1rem;border:none;border-radius:999px;padding:1rem 2rem;cursor:pointer;transition:all .3s;box-shadow:0 0 25px rgba(168,85,247,.5);font-family:var(--font-ui);position:relative;overflow:hidden}",
".nav-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold),var(--neon-purple));opacity:0;transition:opacity .3s}",
".nav-btn:hover:not([disabled])::before{opacity:1}",
".nav-btn span{position:relative;z-index:1}",
".nav-btn:hover:not([disabled]){transform:translateY(-3px);box-shadow:0 0 40px rgba(168,85,247,.7)}",
".nav-btn:disabled{opacity:.4;pointer-events:none}",
".nav-btn:focus-visible,.chatty-choices button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
".chatty-choices{margin-bottom:1.5rem}",
".chatty-choices>div:first-child{margin-bottom:1.2rem;font-weight:600;font-size:1.1rem}",
".chatty-choices button{background:rgba(38,38,60,.7);border:2px solid var(--neon-purple);color:var(--text-primary);border-radius:999px;margin-bottom:1rem;padding:1rem 1.5rem;cursor:pointer;transition:all .3s;font-size:1.05rem;width:100%;text-align:left;font-family:var(--font-ui);box-shadow:0 0 12px rgba(168,85,247,.3)}",
".chatty-choices button:hover:not(:disabled){background:rgba(168,85,247,.25);border-color:var(--gold);transform:translateX(8px);box-shadow:0 0 25px rgba(245,158,11,.4)}",
".chatty-choices button.selected.correct{font-weight:700;background:linear-gradient(135deg,rgba(34,197,94,.3),rgba(168,85,247,.3));color:#fff;border-color:#22c55e;box-shadow:0 0 30px rgba(34,197,94,.5);animation:correctPulse .6s}",
"@keyframes correctPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}",
".chatty-choices button.selected.wrong{font-weight:700;background:linear-gradient(135deg,rgba(239,68,68,.3),rgba(168,85,247,.3));color:#fff;border-color:#ef4444;animation:shake .6s}",
"@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-8px)}50%{transform:translateX(8px)}}",
".chatty-feedback{margin-top:1.5rem;font-size:1.15rem;font-weight:700;min-height:3.5rem;background:rgba(38,38,60,.9);border-radius:1rem;text-align:center;padding:1.2rem;display:flex;align-items:center;justify-content:center;border:2px solid var(--glass-border);box-shadow:0 0 20px rgba(168,85,247,.3);line-height:1.5;transition:all .4s}",
".chatty-feedback.empty{display:none}",
".chatty-feedback.feedback-correct{color:#bbf7d0;border-color:#22c55e;box-shadow:0 0 30px rgba(34,197,94,.4)}",
".chatty-feedback.feedback-wrong{color:#fca5a5;border-color:#ef4444;box-shadow:0 0 30px rgba(239,68,68,.4)}",
".summary-card{background:rgba(192,132,252,.18);border:1px solid rgba(168,85,247,.35);border-radius:1.2rem;padding:2rem;margin-bottom:2rem;box-shadow:0 10px 30px rgba(168,85,247,.3)}",
".summary-card strong{color:var(--gold);font-size:1.4rem;display:block;margin-bottom:1.5rem}",
".summary-card ul{list-style:none;padding-left:0}",
".summary-card li{padding-left:2rem;margin-bottom:1.2rem;position:relative;line-height:1.7}",
".summary-card li::before{content:'\\2728';position:absolute;left:0;font-size:1.3rem;filter:drop-shadow(0 0 15px var(--gold));animation:sparkle 2s ease-in-out infinite}",
"@keyframes sparkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.2) rotate(15deg)}}",
".write-task{width:98%;min-height:80px;border-radius:.6rem;margin-top:.8rem;border:1.5px solid var(--neon-purple);background:rgba(38,38,60,.2);color:var(--text-primary);font-size:1rem;padding:.7rem;font-family:var(--font-ui)}",
".reading{background:rgba(38,38,60,.7);border:1px solid var(--glass-border);border-left:4px solid var(--gold);border-radius:1rem;padding:1.4rem;margin-bottom:1.4rem;line-height:1.8}",
".game{background:rgba(26,26,38,.75);border:1px solid rgba(168,85,247,.35);border-radius:1.2rem;padding:1.4rem;margin-bottom:1.6rem;box-shadow:0 8px 30px rgba(0,0,0,.35)}",
".g-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}",
".g-name{font-weight:800;color:var(--gold);letter-spacing:.02em}",
".g-score{font-size:.9rem;opacity:.85}",
".g-row{margin-bottom:1.1rem}",
".g-hint{font-size:.95rem;opacity:.9;margin-bottom:.5rem}",
".g-life{font-size:.85rem;opacity:.9;margin:.15rem 0 .6rem;color:var(--gold)}",
".g-tiles{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.5rem}",
".g-tile,.g-slot{font-family:var(--font-ui);font-weight:700;font-size:1.05rem;border-radius:.6rem;padding:.5rem .7rem;min-width:2.3rem;text-align:center}",
".g-tile{background:rgba(38,38,60,.9);border:2px solid var(--neon-purple);color:var(--text-primary);cursor:pointer;transition:all .2s}",
".g-tile:hover:not([disabled]){background:rgba(168,85,247,.3);border-color:var(--gold);transform:translateY(-2px)}",
".g-tile.used{opacity:.25;pointer-events:none}",
".g-slot{display:inline-block;background:rgba(15,15,26,.8);border:2px dashed rgba(168,85,247,.5);color:var(--gold);margin-right:.3rem;min-height:2.4rem}",
".g-row.ok .g-slot{border-style:solid;border-color:#22c55e;color:#bbf7d0}",
".g-row.bad .g-tiles{animation:shake .5s}",
".g-btn{background:linear-gradient(135deg,var(--neon-purple),var(--gold));color:var(--deep-dark);font-weight:700;border:none;border-radius:999px;padding:.5rem 1.2rem;cursor:pointer;font-family:var(--font-ui);font-size:.95rem}",
".g-btn.ghost{background:transparent;border:1.5px solid var(--neon-purple);color:var(--text-primary)}",
".g-cols{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}",
".g-item{background:rgba(38,38,60,.85);border:2px solid var(--neon-purple);border-radius:.8rem;padding:.7rem .9rem;cursor:pointer;transition:all .2s;line-height:1.4}",
".g-item:hover:not(.done){border-color:var(--gold);transform:translateX(4px)}",
".g-item.picked{background:rgba(245,158,11,.25);border-color:var(--gold)}",
".g-item.done{background:rgba(34,197,94,.18);border-color:#22c55e;cursor:default}",
".g-item.bad{animation:shake .5s;border-color:#ef4444}",
".g-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}",
".g-buckets{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.8rem}",
".g-bucket{background:rgba(15,15,26,.6);border:2px dashed rgba(168,85,247,.5);border-radius:.9rem;padding:.8rem;min-height:4.5rem;cursor:pointer;transition:all .2s}",
".g-bucket.on{border-style:solid;border-color:var(--gold)}",
".g-bucket b{display:block;color:var(--gold);margin-bottom:.4rem;font-size:.95rem}",
".g-bucket .g-placed{display:inline-block;background:rgba(34,197,94,.2);border:1px solid #22c55e;border-radius:999px;padding:.15rem .6rem;margin:.15rem .2rem;font-size:.9rem}",
".g-score.win{color:#bbf7d0}",
".g-slots{margin-bottom:.5rem}",
".g-bucket.bad{animation:shake .5s;border-color:#ef4444}",
"@media (max-width:520px){.g-cols{grid-template-columns:1fr}}",
".coins-display{position:fixed;top:20px;right:20px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:999px;padding:.8rem 1.5rem;font-size:1.2rem;font-weight:700;color:var(--gold);box-shadow:0 0 25px rgba(168,85,247,.4);z-index:1000;display:none;align-items:center;gap:.5rem}",
".coins-display.active{display:flex}",
".coins-display.bump{animation:correctPulse .6s}",
/* ---- BRAND LAYER (AMENDMENT III / BRAND.002 + BRAND.004) ------------------
   The frozen tokens stand: --neon-purple is the system, --gold is the reward,
   --deep-dark is the ground (LESSON.008). This adds the chrome the dossier gave
   the family and nothing else: the plum court, the antique-gold hairline and
   corner bracket, the monospace status bar, the sigil. It may not restyle a
   lesson for a topic's mood — that is still the breach LESSON.008 names. */
":root{--hud-court:#3b1d5c;--hud-court-deep:#2a1040;--hud-ancient:#e8c565;--hud-line:rgba(120,80,200,.35);--hud-mono:JetBrains Mono,ui-monospace,SFMono-Regular,Menlo,monospace}",
".rooms-container{border-radius:.4rem;border-color:rgba(232,197,101,.22);box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 80px rgba(168,85,247,.25),inset 0 0 60px rgba(59,29,92,.35)}",
".rooms-container::before{content:'';position:absolute;top:7px;left:7px;width:20px;height:20px;border-top:2px solid var(--hud-ancient);border-left:2px solid var(--hud-ancient);pointer-events:none;z-index:11;opacity:.85}",
".rooms-container::after{content:'';position:absolute;bottom:7px;right:7px;width:20px;height:20px;border-bottom:2px solid var(--hud-ancient);border-right:2px solid var(--hud-ancient);pointer-events:none;z-index:11;opacity:.85}",
".hud-bar{font-family:var(--hud-mono);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--hud-ancient);opacity:.82;line-height:1.7;text-align:center;max-width:760px;margin:0 auto}",
".hud-bar .sep{opacity:.5;margin:0 .35em}",
".hud-bar b{color:#fff;font-weight:700}",
".hud-sigil{display:inline-block;background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(0 0 14px rgba(232,197,101,.5))}",
".hud-hero{display:flex;align-items:center;justify-content:center;gap:1.1rem;margin-bottom:1.2rem;flex-wrap:wrap}",
".hud-hero .hud-sigil{width:62px;height:62px}",
".hud-hero .hero-logo{margin-bottom:0}",
".hud-bar{margin:1.1rem 0 0}",
".hud-foot{margin-top:2.5rem}",
".game,.summary-card,.reading,.dialogue-block,.vocab-item{position:relative}",
".game{border-radius:.5rem;border-color:rgba(232,197,101,.22)}",
".summary-card{border-radius:.5rem}",
".reading{border-radius:.5rem}",
".dialogue-block{border-radius:.45rem;border-top:1px solid rgba(232,197,101,.14);border-bottom:1px solid rgba(232,197,101,.14)}",
".vocab-item{border-radius:.4rem;box-shadow:inset 0 0 0 1px rgba(232,197,101,.07)}",
".feature-card{border-radius:.5rem}",
".game::before,.summary-card::before{content:'';position:absolute;top:-1px;left:-1px;width:15px;height:15px;border-top:2px solid rgba(232,197,101,.7);border-left:2px solid rgba(232,197,101,.7);pointer-events:none;border-top-left-radius:.5rem}",
".game::after,.summary-card::after{content:'';position:absolute;bottom:-1px;right:-1px;width:15px;height:15px;border-bottom:2px solid rgba(232,197,101,.7);border-right:2px solid rgba(232,197,101,.7);pointer-events:none;border-bottom-right-radius:.5rem}",
".coins-display{border-radius:.4rem;border:1px solid rgba(232,197,101,.3);background:linear-gradient(180deg,rgba(59,29,92,.8),rgba(15,15,26,.86));padding:.45rem .7rem;gap:.55rem;align-items:center;box-shadow:0 0 25px rgba(168,85,247,.35),0 0 0 1px rgba(0,0,0,.4)}",
".coins-display .hud-sigil{width:26px;height:26px;filter:none}",
".coins-display .hud-lab{font-family:var(--hud-mono);font-size:.6rem;letter-spacing:.16em;color:var(--hud-ancient);opacity:.85;text-transform:uppercase}",
".coins-display .hud-sep{width:1px;align-self:stretch;background:rgba(232,197,101,.25)}",
".coins-display .hud-crest{font-family:Orbitron,system-ui,sans-serif;font-size:.6rem;letter-spacing:.12em;color:var(--hud-ancient);border:1px solid rgba(232,197,101,.4);border-radius:2px;padding:2px 6px}",
".coins-display .hud-coins{font-family:var(--hud-mono);font-size:.82rem;color:var(--gold)}",
".coins-display .hud-room{font-family:var(--hud-mono);font-size:.7rem;color:#cbb6ff;opacity:.9}",
"@media (max-width:720px){.coins-display .hud-lab,.coins-display .hud-sep{display:none}.hud-hero .hud-sigil{width:48px;height:48px}}",
"@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}",
"/* ---- VIETNAMESE GLOSS + TOGGLE (2026-10-20, LSN-33): any English line may carry a subordinate Vietnamese gloss in <span lang=\"vi\"> (no class, no style — the validator only knows classes). body.vi-hide hides every gloss; #viToggle flips it. */",
"[lang=\"vi\"]{display:block;font-size:.9em;line-height:1.6;opacity:.88;color:#cbb6ff;margin-top:.25rem;font-weight:400}",
"button [lang=\"vi\"]{font-size:.85em}",
".room-title [lang=\"vi\"]{font-size:.65rem;font-weight:600;letter-spacing:.02em}",
"#landing>p[lang=\"vi\"]{font-size:clamp(1rem,2.4vw,1.4rem);text-align:center;margin:-1.5rem 0 2.5rem;max-width:700px;opacity:.85;line-height:1.6;color:#cbb6ff}",
".feature-card [lang=\"vi\"]{display:block;font-size:.92rem;opacity:.85;margin-top:.5rem;line-height:1.5;color:#cbb6ff}",
"body.vi-hide [lang=\"vi\"]{display:none!important}",
"#viToggle{position:fixed;top:20px;left:20px;z-index:1001;background:linear-gradient(180deg,rgba(59,29,92,.9),rgba(15,15,26,.9));border:1px solid rgba(232,197,101,.45);color:var(--gold);font-family:var(--font-ui);font-weight:700;font-size:.9rem;border-radius:999px;padding:.55rem 1.1rem;cursor:pointer;box-shadow:0 0 20px rgba(168,85,247,.35)}",
"#viToggle.off{opacity:.6}",
"#viToggle:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
"@media (max-width:720px){#viToggle{top:10px;left:10px;font-size:.78rem;padding:.45rem .9rem}}",
"/* ---- STUDENT PICKER (2026-10-20): a teacher tool, not a scored game. <div class=\"picker\"> is built by the runtime: class-size input (2–99) + SPIN landing on 1..N. */",
".picker{background:rgba(26,26,38,.75);border:1px solid rgba(168,85,247,.35);border-radius:1.2rem;padding:1.6rem 1.4rem;margin-bottom:1.6rem;box-shadow:0 8px 30px rgba(0,0,0,.35);text-align:center;position:relative}",
".picker::before{content:'';position:absolute;top:-1px;left:-1px;width:15px;height:15px;border-top:2px solid rgba(232,197,101,.7);border-left:2px solid rgba(232,197,101,.7);pointer-events:none;border-top-left-radius:1.2rem}",
".picker::after{content:'';position:absolute;bottom:-1px;right:-1px;width:15px;height:15px;border-bottom:2px solid rgba(232,197,101,.7);border-right:2px solid rgba(232,197,101,.7);pointer-events:none;border-bottom-right-radius:1.2rem}",
".p-wrap{display:flex;flex-direction:column;align-items:center;gap:1rem}",
".p-lab{font-weight:700;color:var(--gold);display:flex;flex-direction:column;align-items:center;gap:.5rem;font-size:1.05rem}",
".p-input{font-family:var(--font-ui);font-size:1.4rem;font-weight:700;text-align:center;color:var(--text-primary);background:rgba(15,15,26,.8);border:2px solid var(--neon-purple);border-radius:.8rem;padding:.5rem 1rem;width:7rem}",
".p-input:focus{outline:2px solid var(--gold);border-color:var(--gold)}",
".p-display{font-size:4.5rem;font-weight:800;color:var(--gold);text-shadow:0 0 30px rgba(245,158,11,.6);min-height:5.5rem;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}",
".p-btn{background:linear-gradient(135deg,var(--neon-purple),var(--gold));color:var(--deep-dark);font-weight:800;font-size:1.3rem;border:none;border-radius:999px;padding:.9rem 3rem;cursor:pointer;font-family:var(--font-ui);box-shadow:0 0 30px rgba(168,85,247,.5);transition:all .3s;min-height:44px}",
".p-btn:hover:not([disabled]){transform:scale(1.06)}",
".p-btn:disabled{opacity:.6;cursor:wait}",
".p-btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
"/* ---- SPINNER TAB (2026-10-20): fixed tab + dialog overlay so the picker opens from any room. */",
"#spinTab{position:fixed;left:20px;top:76px;z-index:1001;background:linear-gradient(180deg,rgba(59,29,92,.9),rgba(15,15,26,.9));border:1px solid rgba(232,197,101,.45);color:var(--gold);font-family:var(--font-ui);font-weight:700;font-size:.95rem;border-radius:999px;padding:.6rem 1.2rem;cursor:pointer;box-shadow:0 0 20px rgba(168,85,247,.35)}",
"#spinTab:hover{transform:scale(1.05)}",
"#spinTab:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
"#spinOverlay{position:fixed;inset:0;z-index:2000;background:rgba(10,10,20,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:1.5rem}",
"#spinOverlay[hidden]{display:none!important}",
".spin-panel{width:100%;max-width:480px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid rgba(232,197,101,.3);border-radius:1.2rem;padding:1.6rem 1.4rem;position:relative;box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 80px rgba(168,85,247,.25)}",
".spin-panel .picker{margin-bottom:0}",
".spin-close{position:absolute;top:.6rem;right:.6rem;background:transparent;border:1px solid var(--glass-border);color:var(--text-primary);border-radius:999px;width:2.6rem;height:2.6rem;font-size:1.1rem;cursor:pointer;font-family:var(--font-ui)}",
".spin-close:hover{border-color:var(--gold);color:var(--gold)}",
".spin-close:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
"@media (max-width:720px){#spinTab{left:10px;top:62px;font-size:.8rem;padding:.5rem 1rem}}",
"/* ---- BIG WHEEL (2026-10-20, loud + dramatic): canvas wheel, result flash, confetti. */",
".wheel{width:min(300px,74vw);height:auto;filter:drop-shadow(0 0 25px rgba(168,85,247,.5))}",
".p-result{font-size:3.4rem;font-weight:800;color:var(--gold);text-shadow:0 0 30px rgba(245,158,11,.6);min-height:4rem;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}",
".p-result.win{animation:winPop .7s cubic-bezier(.68,-.55,.265,1.55)}",
"@keyframes winPop{0%{transform:scale(.4)}55%{transform:scale(1.3)}100%{transform:scale(1)}}",
".p-called{font-size:1.15rem;font-weight:700;min-height:2rem;line-height:1.5}",
".cfetti{position:absolute;top:8px;width:8px;height:14px;z-index:6;pointer-events:none;animation:confetti-fall 1.6s ease-in forwards}",
"@keyframes confetti-fall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(240px) rotate(540deg);opacity:0}}",
"@media (max-width:720px){.hero-features{grid-template-columns:1fr}.room{padding:2rem 1.5rem}.room-header{gap:1rem}.scene-graphic{width:70px;height:70px;font-size:2.5rem}.coins-display{top:10px;right:10px;font-size:1rem;padding:.6rem 1.2rem}.rooms-container{max-width:99vw;border-radius:0;box-shadow:none}}",
"/* ---- STAGE MODE (TV, LSN-34, src/LESSON-DISPLAY.md): on wide screens the lesson fills the room, not a phone column. */",
"@media (min-width:721px) and (max-width:1099px){.rooms-container{max-width:800px}}",
"@media (min-width:1100px){",
".classroom{padding:1.2rem}",
".rooms-container{max-width:min(1500px,97vw);min-height:calc(100vh - 2.4rem);border-radius:.8rem}",
".room{padding:3rem 4rem;font-size:1.3rem}",
".room-title{font-size:2.6rem}",
".room-label{font-size:1rem}",
".scene-graphic{width:120px;height:120px;font-size:4.5rem}",
".dialogue-block,.chatty-clue,.chatty-hint{font-size:1.3rem;line-height:1.8}",
".vocab-list{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}",
".vocab-item{font-size:1.3rem}",
".chatty-choices>div:first-child{font-size:1.4rem}",
".chatty-choices button{font-size:1.3rem;padding:1.2rem 1.8rem}",
".chatty-feedback{font-size:1.4rem}",
".summary-card{font-size:1.3rem}",
".summary-card strong{font-size:1.8rem}",
".nav-btn{font-size:1.35rem;padding:1.2rem 2rem}",
".g-tile,.g-slot{font-size:1.3rem}",
".g-hint{font-size:1.15rem}",
".g-item{font-size:1.2rem}",
".g-bucket{font-size:1.2rem;min-height:6rem}",
".wheel{width:min(420px,44vw)}",
".p-result{font-size:4.5rem}",
".p-called{font-size:1.5rem}",
".write-task{font-size:1.25rem;min-height:120px}",
".reading{font-size:1.3rem}",
".spin-panel{max-width:640px}",
"/* ---- ARSENAL (Anakin, 10 upgrades): icons, voice, timer, arena, duel, erupt, finale, print. */",
".game+.game{margin-top:1.2rem;border-top:1px dashed var(--glass-border);padding-top:1.2rem}",
".g-flip{display:inline-block;margin:.3rem;padding:.7rem 1rem;border-radius:10px;border:1px solid var(--gold);background:rgba(245,158,11,.12);color:var(--text-primary);font-size:1.05rem;cursor:pointer;min-width:7rem}",
".g-flip.back{background:rgba(168,85,247,.2);border-color:var(--neon-purple)}",
".g-battle-bar{display:flex;gap:1rem;font-size:1.2rem;font-weight:700;margin-bottom:.6rem;color:var(--gold)}",
".with-icon{margin-right:.3em}",
".can-say{cursor:pointer;border-bottom:2px dotted var(--gold)}",
".t-big{font-size:3rem;font-weight:800;color:var(--gold);text-align:center}",
"  .storm-board,.board-grid{display:grid;gap:.5rem;margin:.75rem 0}",
"  .storm-board .g-tile,.board-grid .g-tile{min-height:3rem;font-size:1.05rem}",
".erupt{position:fixed;z-index:9999;font-size:1.4rem;pointer-events:none;animation:eruptUp 1.1s ease-out forwards}",
"@keyframes eruptUp{0%{transform:translate(-50%,-50%) scale(.6);opacity:1}100%{transform:translate(-50%,-160px) scale(1.2);opacity:0}}",
".tierflash{animation:tierFlash .8s ease}",
"@keyframes tierFlash{0%{box-shadow:0 0 0 0 rgba(245,158,11,.9)}100%{box-shadow:0 0 0 18px rgba(245,158,11,0)}}",
".room.finale{border:2px solid var(--gold);box-shadow:0 0 60px rgba(245,158,11,.35);animation:finaleBreathe 4s ease-in-out infinite}",
"@keyframes finaleBreathe{0%,100%{box-shadow:0 0 30px rgba(245,158,11,.25)}50%{box-shadow:0 0 70px rgba(245,158,11,.5)}}",
"@media (prefers-reduced-motion: reduce){.erupt,.tierflash,.room.finale{animation:none}}",
"@media print{.landing,#coinsDisplay,#viToggle,#spinTab,#spinOverlay,.nav-btns,.p-btn,.t-go{display:none!important}.classroom{display:block}.room{display:block}}",
"}"].join("\n");

  /* the lesson's own runtime — plain strings, no backticks, so the built file
     stays a self-contained document (LSN-1). */
  function runtime(coins){
    const c = coins || {};
    const code = [
"(function(){",
'"use strict";',
"var START=" + JSON.stringify(Number(c.start) || 0) + ",PER_CORRECT=" + JSON.stringify(Number(c.correct == null ? 10 : c.correct)) + ",PER_WRONG=" + JSON.stringify(Number(c.wrong == null ? 0 : c.wrong)) + ";",
"var rooms=window.__LESSON_ROOMS__||[];",
"var currentRoom=0,coins=START;",
"var writeCache={};",
"var landing=document.getElementById('landing'),classroom=document.getElementById('classroom'),startBtn=document.getElementById('startBtn'),coinsDisplay=document.getElementById('coinsDisplay'),coinsCount=document.getElementById('coinsCount'),progressFill=document.getElementById('progressFill'),host=document.getElementById('roomsContainer');",
"var TIERS=[[5000,'LEGEND'],[500,'TIGER'],[200,'CUB'],[0,'MOUSE']];",
"function tierOf(n){for(var i=0;i<TIERS.length;i++){if(n>=TIERS[i][0])return TIERS[i][1];}return 'MOUSE';}",
"function renderCoins(){coinsCount.textContent=coins;var cr=document.getElementById('tierCrest');if(cr)cr.textContent=tierOf(coins);coinsDisplay.classList.remove('bump');setTimeout(function(){coinsDisplay.classList.add('bump');},10);}",
"function fbClear(){var fb=host.querySelector('.chatty-feedback');if(fb){fb.textContent='';fb.className='chatty-feedback empty';}}",
"function blockReset(b){b.querySelectorAll('button').forEach(function(x){x.classList.remove('selected','correct','wrong');x.disabled=false;});}",
"function feedbackReset(){fbClear();host.querySelectorAll('.chatty-choices button').forEach(function(b){b.classList.remove('selected','correct','wrong');b.disabled=false;});}",
"function showFeedback(msg,type){var fb=host.querySelector('.chatty-feedback');if(fb){fb.className='chatty-feedback feedback-'+type;fb.textContent=msg;}}",
"function render(){",
"  var room=rooms[currentRoom],isFirst=currentRoom===0,isLast=currentRoom===rooms.length-1;",
"  var h='<div class=\"room active\"><div class=\"room-header\"><div class=\"scene-graphic\">'+room.graphic+'</div><div><div class=\"room-title\">'+room.title+'</div><span class=\"room-label\">'+room.label+'</span></div></div>';",
"  h+=room.content;",
"  h+='<div class=\"nav-btns\"><button class=\"nav-btn\" data-action=\"prev\"'+(isFirst?' disabled':'')+'><span>\\u2b05\\ufe0f Back</span></button>';",
"  h+='<button class=\"nav-btn\" data-action=\"'+(isLast?'restart':'next')+'\"><span>'+(isLast?'\\ud83d\\udd04 Restart':'Next \\u27a1\\ufe0f')+'</span></button></div></div>';",
"  host.innerHTML=h;", "  if(isLast){var rm=host.querySelector('.room');if(rm)rm.classList.add('finale');}",
"  if(isLast){mountReport(host);}",
"  initGames(host);", "  initIcons(host);", "  initSay(host);", "  initTimers(host);",
"  host.querySelectorAll('textarea').forEach(function(ta,ix){var k=currentRoom+'_'+ix;if(writeCache[k]!=null)ta.value=writeCache[k];});",
"  progressFill.style.width=(((currentRoom+1)/rooms.length)*100)+'%';",
"  var rc=document.getElementById('roomCount');if(rc)rc.textContent=(currentRoom+1)+'/'+rooms.length;",
"}",
"startBtn.addEventListener('click',function(){landing.style.display='none';classroom.classList.add('active');coinsDisplay.classList.add('active');render();renderCoins();});",
"host.addEventListener('input',function(e){",
"  var t=e.target;if(t&&t.tagName==='TEXTAREA'){var tas=host.querySelectorAll('textarea');for(var i=0;i<tas.length;i++){if(tas[i]===t){writeCache[currentRoom+'_'+i]=t.value;break;}}}",
"});",
"host.addEventListener('click',function(e){",
"  var t=e.target.closest?e.target.closest('button'):null;if(!t)return;",
"  var action=t.getAttribute('data-action');",
"  if(action==='prev'){if(currentRoom>0){feedbackReset();currentRoom--;render();}return;}",
"  if(action==='next'){if(currentRoom<rooms.length-1){feedbackReset();currentRoom++;render();}return;}",
"  if(action==='restart'){feedbackReset();currentRoom=0;coins=START;render();renderCoins();return;}",
"  var answer=t.getAttribute('data-answer');",
"  if(!answer)return;",
"  var block=t.closest('.chatty-choices');if(!block)return;",
"  fbClear();blockReset(block);",
"  block.querySelectorAll('button').forEach(function(b){b.disabled=true;});",
"  t.classList.add('selected');",
"  if(answer==='correct'){t.classList.add('correct');pay(block,PER_CORRECT);eruptXY(e.clientX||0,e.clientY||0,8);showFeedback(block.getAttribute('data-correct-feedback')||'\\ud83c\\udf89 Correct!','correct');}",
"  else{t.classList.add('wrong');coins=Math.max(0,coins-PER_WRONG);renderCoins();showFeedback(block.getAttribute('data-wrong-feedback')||'\\u274c Not quite \\u2014 read the rule again.','wrong');}",
"});",
"/* ------------------------------- the games ------------------------------- */",
"function gShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}",
"function gPairs(s){return String(s==null?'':s).split(';').map(function(p){var k=String(p).split('=');return {a:(k[0]||'').trim(),b:(k.slice(1).join('=')||'').trim()};}).filter(function(p){return p.a&&p.b;});}",
"function gHead(el,name,total){el.setAttribute('data-total',String(total));el.setAttribute('data-got','0');return '<div class=\\\"g-head\\\"><span class=\\\"g-name\\\">'+name+'</span><span class=\\\"g-score\\\">0 / '+total+' done</span></div>';}",
"function tone(f,d){try{if(REDUCE)return;var C=window.AudioContext||window.webkitAudioContext;if(!C)return;var c=new C();if(c.state==='suspended')c.resume();var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f||880;var t=c.currentTime;g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+(d||0.12));o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+(d||0.12)+0.05);}catch(e){}}",
"function winJingle(){tone(523,.12);setTimeout(function(){tone(659,.12);},110);setTimeout(function(){tone(784,.2);},220);}",
"function mountReport(host){",
"  var wins=host.querySelectorAll('.game .g-score.win').length;",
"  var picks=host.querySelectorAll('.chatty-choices button.selected.correct').length;",
"  var msg='Report: '+coins+' coins, tier '+tierOf(coins)+', '+(wins+picks)+' wins this run.';",
"  var rep=document.createElement('div');rep.className='report';rep.setAttribute('role','status');",
"  rep.innerHTML='<b>End-of-lesson report</b><br>'+msg;",
"  var b=document.createElement('button');b.type='button';b.className='g-btn ghost';b.textContent='Copy for teacher';",
"  b.addEventListener('click',function(){var txt=msg+' Lesson: '+document.title;",
"    function done(ok){b.textContent=ok?'Copied':'Copy failed';tone(ok?784:220,.15);} ",
"    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){done(true);},function(){done(false);});}",
"    else{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done(true);}catch(x){done(false);}ta.remove();}}",
"    catch(x){done(false);}});",
"  rep.appendChild(document.createElement('br'));rep.appendChild(b);host.appendChild(rep);}",
"function gDone(el,extra){var got=(Number(el.getAttribute('data-got'))||0)+1;el.setAttribute('data-got',String(got));var s=el.querySelector('.g-score');var total=Number(el.getAttribute('data-total'))||0;if(s)s.textContent=got+' / '+total+' done';if(total&&got>=total&&s)s.className='g-score win';pay(el,PER_CORRECT+(extra||0));eruptEl(el,10);winJingle();}",
"function gScramble(el){",
"  var items=gPairs(el.getAttribute('data-items'));",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'🔤 Scramble',items.length)+'<div class=\\\"g-body\\\"></div>';",
"  var body=el.querySelector('.g-body');",
"  items.forEach(function(it){",
"    var word=String(it.a).toLowerCase().replace(/[^a-z]/g,'');",
"    var row=document.createElement('div');row.className='g-row';",
"    var hint=document.createElement('div');hint.className='g-hint';hint.textContent=it.b||'';",
"    var slots=document.createElement('div');slots.className='g-slots';",
"    var tiles=document.createElement('div');tiles.className='g-tiles';",
"    var box=document.createElement('span');box.className='g-slot';box.textContent='…';",
"    var clear=document.createElement('button');clear.className='g-btn ghost';clear.textContent='Clear';",
"    var built='';",
"    slots.appendChild(box);slots.appendChild(clear);",
"    gShuffle(word.split('')).forEach(function(ch){",
"      var t=document.createElement('button');t.className='g-tile';t.textContent=ch;",
"      t.addEventListener('click',function(){",
"        if(row.classList.contains('ok'))return;",
"        t.classList.add('used');built+=ch;box.textContent=built;",
"        if(built.length===word.length){",
"          if(built===word){row.classList.add('ok');box.textContent=word+' \\u2713';tiles.querySelectorAll('.g-tile').forEach(function(x){x.classList.add('used');});gDone(el);}",
"          else{row.classList.add('bad');setTimeout(function(){row.classList.remove('bad');built='';box.textContent='…';tiles.querySelectorAll('.g-tile').forEach(function(x){x.classList.remove('used');});},700);}",
"        }",
"      });",
"      tiles.appendChild(t);",
"    });",
"    clear.addEventListener('click',function(){if(row.classList.contains('ok'))return;built='';box.textContent='…';tiles.querySelectorAll('.g-tile').forEach(function(x){x.classList.remove('used');});});",
"    row.appendChild(hint);row.appendChild(slots);row.appendChild(tiles);body.appendChild(row);",
"  });",
"}",
"function gMatch(el){",
"  var items=gPairs(el.getAttribute('data-items'));",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'🔗 Match',items.length)+'<div class=\\\"g-body g-cols\\\"></div>';",
"  var body=el.querySelector('.g-body'),left=document.createElement('div'),right=document.createElement('div');",
"  body.appendChild(left);body.appendChild(right);",
"  var pick=null;",
"  function hit(d){",
"    if(d.classList.contains('done'))return;",
"    if(!pick){pick=d;d.classList.add('picked');return;}",
"    if(pick===d){d.classList.remove('picked');pick=null;return;}",
"    if(pick.getAttribute('data-side')===d.getAttribute('data-side')){pick.classList.remove('picked');pick=d;d.classList.add('picked');return;}",
"    var a=pick,b=d;pick=null;a.classList.remove('picked');",
"    if(a.getAttribute('data-key')===b.getAttribute('data-key')){a.classList.add('done');b.classList.add('done');gDone(el);}",
"    else{a.classList.add('bad');b.classList.add('bad');setTimeout(function(){a.classList.remove('bad');b.classList.remove('bad');},700);}",
"  }",
"  function mk(side,it,ki){var d=document.createElement('div');d.className='g-item';d.textContent=(side==='a'?it.a:it.b);d.setAttribute('data-key',String(ki));d.setAttribute('data-side',side);d.addEventListener('click',function(){hit(d);});return d;}",
"  gShuffle(items.map(function(it,i){return {it:it,i:i};})).forEach(function(o){left.appendChild(mk('a',o.it,o.i));});",
"  gShuffle(items.map(function(it,i){return {it:it,i:i};})).forEach(function(o){right.appendChild(mk('b',o.it,o.i));});",
"}",
"function gSort(el){",
"  var groups=String(el.getAttribute('data-groups')||'').split('|').map(function(g){var k=g.split(':');return {name:(k[0]||'').trim(),items:(k.slice(1).join(':')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)};}).filter(function(g){return g.name&&g.items.length;});",
"  var total=groups.reduce(function(n,g){return n+g.items.length;},0);",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'📦 Sort it out',total)+'<div class=\\\"g-body\\\"></div>';",
"  var body=el.querySelector('.g-body'),chips=document.createElement('div'),buckets=document.createElement('div');",
"  chips.className='g-chips';buckets.className='g-buckets';",
"  var pick=null,all=[];",
"  groups.forEach(function(g){g.items.forEach(function(x){all.push({t:x,g:g.name});});});",
"  gShuffle(all).forEach(function(o){",
"    var c=document.createElement('button');c.className='g-tile';c.textContent=o.t;c.setAttribute('data-g',o.g);",
"    c.addEventListener('click',function(){if(c.classList.contains('used'))return;if(pick)pick.classList.remove('picked');pick=c;c.classList.add('picked');});",
"    chips.appendChild(c);",
"  });",
"  groups.forEach(function(g){",
"    var b=document.createElement('div');b.className='g-bucket';b.setAttribute('data-g',g.name);b.innerHTML='<b>'+g.name+'</b>';",
"    b.addEventListener('click',function(){",
"      if(!pick)return;",
"      if(pick.getAttribute('data-g')===g.name){",
"        var c=pick;pick=null;c.classList.remove('picked');c.classList.add('used');c.disabled=true;c.style.display='none';",
"        var s=document.createElement('span');s.className='g-placed';s.textContent=c.textContent;b.appendChild(s);gDone(el);",
"      }",
"      else{b.classList.add('bad');var c2=pick;pick=null;setTimeout(function(){b.classList.remove('bad');if(c2)c2.classList.remove('picked');},700);}",
"    });",
"    buckets.appendChild(b);",
"  });",
"  body.appendChild(chips);body.appendChild(buckets);",
"}",
"function gPicker(el){",
"  var max0=Math.max(2,Math.min(50,Number(el.getAttribute('data-max'))||50));",
"  el._n=max0;el._R=0;",
"  el.innerHTML='<div class=\\\"g-head\\\"><span class=\\\"g-name\\\">'+(el.getAttribute('data-title')||'\\ud83c\\udfa1 Spinner')+'</span><span class=\\\"g-score\\\">fair picks only</span></div>'",
"    +'<div class=\\\"p-wrap\\\"><label class=\\\"p-lab\\\">Students in class <span lang=\\\"vi\\\">S\\u0129 s\\u1ed1 l\\u1edbap</span><input class=\\\"p-input\\\" type=\\\"number\\\" min=\\\"2\\\" max=\\\"50\\\"/></label>'",
"    +'<canvas class=\\\"wheel\\\" width=\\\"300\\\" height=\\\"300\\\" role=\\\"img\\\" aria-label=\\\"Spinning wheel\\\"></canvas>'",
"    +'<div><button class=\\\"p-btn\\\">SPIN \\ud83c\\udfb2</button></div>'",
"    +'<div class=\\\"p-result\\\" aria-live=\\\"polite\\\">?</div>'",
"    +'<div class=\\\"p-called\\\"></div></div>';",
"  var input=el.querySelector('.p-input'),box=el.querySelector('.p-result'),called=el.querySelector('.p-called'),btn=el.querySelector('.p-btn'),cv=el.querySelector('.wheel');",
"  input.value=String(max0);",
"  var reduce=false;try{reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}",
"  var AC=null;",
"  function ac(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C();}if(AC&&AC.state==='suspended')AC.resume();}catch(e){}return AC;}",
"  function blip(f,dur,type,vol,when){var c=ac();if(!c)return;try{var o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.value=f;var t=c.currentTime+(when||0);g.gain.setValueAtTime(vol||0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+0.03);}catch(e){}}",
"  function fanfare(){blip(523,.16,'triangle',.16,0);blip(659,.16,'triangle',.16,.12);blip(784,.16,'triangle',.16,.24);blip(1047,.34,'triangle',.18,.36);blip(1319,.4,'sine',.1,.55);}",
"  function draw(){",
"    if(!cv)return;var ctx=null;try{ctx=cv.getContext('2d');}catch(e){return;}",
"    var dpr=1;try{dpr=window.devicePixelRatio||1;}catch(e){}",
"    if(cv.width!==Math.round(300*dpr)){cv.width=Math.round(300*dpr);cv.height=Math.round(300*dpr);}",
"    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,300,300);",
"    var m=el._n||max0,seg=Math.PI*2/m,cx=150,cy=150,rad=138;",
"    ctx.save();ctx.translate(cx,cy);ctx.rotate(el._R||0);",
"    for(var i=0;i<m;i++){",
"      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rad,i*seg,(i+1)*seg+0.002);ctx.closePath();",
"      ctx.fillStyle=i%2?'#f59e0b':'#a855f7';ctx.fill();",
"      ctx.strokeStyle='rgba(15,15,26,.9)';ctx.lineWidth=2;ctx.stroke();",
"      ctx.save();ctx.rotate(i*seg+seg/2);ctx.textAlign='right';ctx.textBaseline='middle';",
"      var fs=m>30?9:(m>18?11:14);",
"      try{ctx.font='700 '+fs+'px Inter,system-ui,sans-serif';}catch(e){}",
"      ctx.fillStyle=i%2?'#0f0f1a':'#ffffff';",
"      ctx.fillText(String(i+1),rad-9,0);ctx.restore();",
"    }",
"    ctx.restore();",
"    ctx.beginPath();ctx.moveTo(cx-13,4);ctx.lineTo(cx+13,4);ctx.lineTo(cx,30);ctx.closePath();",
"    ctx.fillStyle='#e8c565';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#0f0f1a';ctx.stroke();",
"    ctx.beginPath();ctx.arc(cx,cy,27,0,Math.PI*2);ctx.fillStyle='#0f0f1a';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#e8c565';ctx.stroke();",
"    ctx.font='24px serif';ctx.textAlign='center';ctx.textBaseline='middle';",
"    ctx.fillText('\\ud83c\\udfa1',cx,cy+2);",
"  }",
"  function idxAt(R){var m=el._n||max0,seg=Math.PI*2/m;var a=(-Math.PI/2-R)%(Math.PI*2);if(a<0)a+=Math.PI*2;return Math.floor(a/seg)%m;}",
"  function boom(){if(reduce)return;var cols=['#a855f7','#f59e0b','#22c55e','#ef4444','#e8c565','#ffffff'];for(var k=0;k<36;k++){var s=document.createElement('div');s.className='cfetti';s.style.left=(4+Math.random()*92)+'%';s.style.background=cols[k%cols.length];s.style.animationDelay=(Math.random()*0.35)+'s';el.appendChild(s);}setTimeout(function(){var c=el.querySelectorAll('.cfetti');for(var j=0;j<c.length;j++)c[j].remove();},2600);}",
"  function land(w){el._R=(el._R||0)%(Math.PI*2);draw();var n=w+1;box.textContent=String(n);box.classList.remove('win');void box.offsetWidth;box.classList.add('win');called.textContent='Student '+n+', you are UP! B\\u1ea1n s\\u1ed1 '+n+', l\\u00ean n\\u00e0o!';fanfare();boom();busy=false;btn.disabled=false;input.disabled=false;}",
"  var busy=false,raf=null;",
"  input.addEventListener('change',function(){var m=Math.max(2,Math.min(50,Math.round(Number(input.value)||max0)));input.value=String(m);el._n=m;el._R=0;box.textContent='?';box.classList.remove('win');called.textContent='';draw();});",
"  btn.addEventListener('click',function(){",
"    if(busy)return;busy=true;btn.disabled=true;input.disabled=true;ac();",
"    var m=el._n||max0,seg=Math.PI*2/m;",
"    var w=Math.floor(Math.random()*m);",
"    if(reduce){el._R=0;land(w);return;}",
"    var R0=el._R||0;",
"    var want=(-Math.PI/2-(w+0.5)*seg)%(Math.PI*2);",
"    var dR=want-R0%(Math.PI*2);dR=((dR%(Math.PI*2))+Math.PI*2)%(Math.PI*2);",
"    var turns=5+Math.floor(Math.random()*3);",
"    var R1=R0+turns*Math.PI*2+dR;",
"    var t0=null,last=idxAt(R0),dur=4600;",
"    box.classList.remove('win');called.textContent='';",
"    function step(t){",
"      if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur);",
"      var e=1-Math.pow(1-p,5);",
"      el._R=R0+(R1-R0)*e;draw();",
"      var ix=idxAt(el._R);",
"      if(ix!==last){last=ix;blip(500+600*(1-p),0.03,'square',0.07,0);}",
"      if(p<1){raf=requestAnimationFrame(step);}else{land(w);}",
"    }",
"    raf=requestAnimationFrame(step);",
"  });",
"  draw();",
"}",
"var REDUCE=false;try{REDUCE=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}",
"var LASTTIER='MOUSE';",
"function pay(el,n){var v=(el&&el.getAttribute&&(Number(el.getAttribute('data-coins'))||0))||n;coins+=v;renderCoins();if(!REDUCE){var t=tierOf(coins);if(t!==LASTTIER){LASTTIER=t;var pill=document.getElementById('coinsDisplay');if(pill){pill.classList.remove('tierflash');void pill.offsetWidth;pill.classList.add('tierflash');}}}return v;}",
"function eruptXY(x,y,n){if(REDUCE)return;try{var cols=['\\u2b50','\\u2728','\\ud83c\\udf89','\\ud83d\\udcab','\\ud83e\\ude99'];for(var k=0;k<(n||8);k++){var d=document.createElement('div');d.className='erupt';d.textContent=cols[k%cols.length];d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);(function(z){setTimeout(function(){if(z.parentNode)z.parentNode.removeChild(z);},1100);})(d);}}catch(e){}}",
"function eruptEl(el,n){if(!el)return;try{var r=el.getBoundingClientRect();eruptXY(r.left+r.width/2,r.top,n||8);}catch(e){}}",
"function initIcons(root){",
"  var IU=(window.__LESSON_ICONS__||{});",
"  if(!root||!root.querySelectorAll)return;",
"  root.querySelectorAll(\u0027[data-icon]\u0027).forEach(function(el){",
"    var k=el.getAttribute(\u0027data-icon\u0027);if(!k||!IU[k])return;",
"    if(el.firstChild&&el.firstChild.className===\u0027with-icon\u0027)return;",
"    var sp=document.createElement(\u0027span\u0027);sp.className=\u0027with-icon\u0027;sp.textContent=IU[k]+\u0027 \u0027;el.insertBefore(sp,el.firstChild);",
"  });",
"}",
"function initSay(root){",
"  if(!root||!root.querySelectorAll)return;",
"  root.querySelectorAll(\u0027[data-say]\u0027).forEach(function(el){",
"    if(el._said)return;el._said=1;el.classList.add(\u0027can-say\u0027);",
"    el.addEventListener(\u0027click\u0027,function(){",
"      try{var u=new SpeechSynthesisUtterance(el.getAttribute(\u0027data-say\u0027)||el.textContent||\u0027\u0027);u.lang=\u0027en-GB\u0027;u.rate=0.95;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}catch(e){}",
"    });",
"  });",
"}",
"function gTimer(el){",
"  if(el._t)return;el._t=1;",
"  var secs=Math.max(5,Math.min(600,Number(el.getAttribute(\u0027data-seconds\u0027))||60));",
"  el.innerHTML=\u0027<div class=\\\"g-head\\\"><span class=\\\"g-name\\\">\u0027+(el.getAttribute(\u0027data-title\u0027)||\u0027\\u23f1\\ufe0f Timer\u0027)+\u0027</span><span class=\\\"g-score\\\">ready</span></div><div class=\\\"g-body\\\"><div class=\\\"t-big\\\">\u0027+secs+\u0027s</div><button class=\\\"p-btn t-go\\\">GO</button></div>\u0027;",
"  var big=el.querySelector(\u0027.t-big\u0027),out=el.querySelector(\u0027.g-score\u0027),go=el.querySelector(\u0027.t-go\u0027),left=secs,iv=null;",
"  function blip(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;var c=new C();var o=c.createOscillator(),g=c.createGain();o.type=\u0027sine\u0027;o.frequency.value=880;var t=c.currentTime;g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.4);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.43);}catch(e){}}",
"  go.addEventListener(\u0027click\u0027,function(){",
"    if(iv)return;go.disabled=true;",
"    iv=setInterval(function(){left--;if(left<=0){clearInterval(iv);iv=null;big.textContent=\u0027DONE\u0027;out.textContent=\u0027time\u0027;if(!REDUCE)blip();go.disabled=false;left=secs;}else{big.textContent=left+\u0027s\u0027;out.textContent=left+\u0027s left\u0027;}},1000);",
"    out.textContent=left+\u0027s left\u0027;",
"  });",
"}",
"function initTimers(root){",
"  if(!root||!root.querySelectorAll)return;",
"  root.querySelectorAll(\u0027.timer\u0027).forEach(function(el){try{gTimer(el);}catch(e){}});",
"}",
"function gTiles(el){",
"  var items=gPairs(el.getAttribute('data-items')||el.getAttribute('data-cards')||'').slice(0,8);",
"  if(!items.length){el.innerHTML='<div class=\\\"g-note\\\">add data-items to this tiles game</div>';return;}",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'\\ud83c\\udfb2 Tiles — say it, then mark it',items.length)+'<div class=\\\"g-body\\\"></div>';",
"  var body=el.querySelector('.g-body');var grid=document.createElement('div');grid.className='g-board';grid.setAttribute('role','group');grid.setAttribute('aria-label','face-down tiles');body.appendChild(grid);",
"  var zone=document.createElement('div');body.appendChild(zone);",
"  var vals=[10,15,20,10,'DOUBLE',15,10,'\\u2601'];",
"  var dbl=false;",
"  items.forEach(function(it,i){var v=vals[i%vals.length];var b=document.createElement('button');b.type='button';b.className='g-tile2';b.innerHTML='?'+'<small>'+(v==='\\u2601'?'storm':('+'+v))+'</small>';b.setAttribute('aria-label','tile '+(i+1)+' — tap to reveal');",
"    b.addEventListener('click',function(){if(b.disabled)return;b.disabled=true;b.classList.add('used');tone(500+i*60,.1);",
"      var box=document.createElement('div');box.className='g-qa';var hint=it.b?'<div class=\\\"sup\\\">'+it.b+'</div>':'';",
"      box.innerHTML='<div class=\\\"q\\\">'+it.a+'</div>'+hint+'<div class=\\\"g-note\\\">Say it OUT LOUD, then mark it.</div><div class=\\\"g-flex\\\"><button class=\\\"g-btn\\\" data-k=\\\"got\\\">Got it</button><button class=\\\"g-btn ghost\\\" data-k=\\\"miss\\\">Missed</button></div>';zone.innerHTML='';zone.appendChild(box);",
"      box.addEventListener('click',function(ev){var k=ev.target.closest?ev.target.closest('button'):null;if(!k)return;var kind=k.getAttribute('data-k');box.querySelectorAll('button').forEach(function(x){x.disabled=true;});",
"        if(kind==='got'){if(v==='\\u2601'){coins=Math.max(0,coins-10);renderCoins();tone(180,.3,'sawtooth');box.innerHTML+='<div class=\\\"g-note\\\">Storm — minus 10.</div>';}else if(v==='DOUBLE'){dbl=true;box.innerHTML+='<div class=\\\"g-note\\\">DOUBLE — the next gain counts twice.</div>';tone(880,.15);gDone(el);}else{var extra=dbl?v:0;dbl=false;gDone(el,extra);}}",
"        else{tone(220,.2,'sawtooth');box.innerHTML+='<div class=\\\"g-note\\\">Missed — read the hint line again.</div>';}box.scrollIntoView&&box.scrollIntoView({block:'nearest'});});});",
"    grid.appendChild(b);});",
"}",
"function gOrder(el){",
"  var items=gPairs(el.getAttribute(\u0027data-items\u0027));",
"  el.innerHTML=gHead(el,el.getAttribute(\u0027data-title\u0027)||\u0027\\ud83d\\udd22 Order it\u0027,items.length)+\u0027<div class=\\\"g-body\\\"></div>\u0027;",
"  var body=el.querySelector(\u0027.g-body\u0027),seq=0,box=document.createElement(\u0027div\u0027);",
"  box.className=\u0027g-slots\u0027;body.appendChild(box);",
"  var tiles=document.createElement(\u0027div\u0027);tiles.className=\u0027g-tiles\u0027;body.appendChild(tiles);",
"  gShuffle(items.slice()).forEach(function(it){",
"    var t=document.createElement(\u0027button\u0027);t.className=\u0027g-tile\u0027;t.textContent=it.a;",
"    t.addEventListener(\u0027click\u0027,function(){",
"      if(t.classList.contains(\u0027used\u0027))return;",
"      if(it===items[seq]){t.classList.add(\u0027used\u0027);var sp=document.createElement(\u0027span\u0027);sp.className=\u0027g-placed\u0027;sp.textContent=it.a;box.appendChild(sp);seq++;gDone(el);if(seq>=items.length){box.textContent+=\u0027 \\u2713\u0027;}}",
"      else{el.classList.add(\u0027bad\u0027);setTimeout(function(){el.classList.remove(\u0027bad\u0027);},600);}",
"    });",
"    tiles.appendChild(t);",
"  });",
"}",
"function gOdd(el){",
"  var items=String(el.getAttribute(\u0027data-items\u0027)||\u0027\u0027).split(\u0027;\u0027).map(function(x){return x.trim();}).filter(Boolean);",
"  var odd=String(el.getAttribute(\u0027data-odd\u0027)||\u0027\u0027).trim();",
"  el.innerHTML=gHead(el,el.getAttribute(\u0027data-title\u0027)||\u0027\\ud83d\\udc40 Odd one out\u0027,1)+\u0027<div class=\\\"g-body\\\"></div>\u0027;",
"  var body=el.querySelector(\u0027.g-body\u0027),tiles=document.createElement(\u0027div\u0027);tiles.className=\u0027g-tiles\u0027;body.appendChild(tiles);",
"  gShuffle(items.slice()).forEach(function(x){",
"    var t=document.createElement(\u0027button\u0027);t.className=\u0027g-tile\u0027;t.textContent=x;",
"    t.addEventListener(\u0027click\u0027,function(){",
"      if(el.getAttribute(\u0027data-got\u0027)===\u00271\u0027)return;",
"      if(x===odd){t.classList.add(\u0027used\u0027);gDone(el);}",
"      else{t.classList.add(\u0027bad\u0027);setTimeout(function(){t.classList.remove(\u0027bad\u0027);},600);}",
"    });",
"    tiles.appendChild(t);",
"  });",
"}",
"function gFlip(el){",
"  var items=gPairs(el.getAttribute(\u0027data-items\u0027));",
"  el.innerHTML=gHead(el,el.getAttribute(\u0027data-title\u0027)||\u0027\\ud83c\\udccf Flip\u0027,items.length)+\u0027<div class=\\\"g-body\\\"></div>\u0027;",
"  var body=el.querySelector(\u0027.g-body\u0027),seen={};",
"  items.forEach(function(it){",
"    var c=document.createElement(\u0027button\u0027);c.className=\u0027g-flip\u0027;c.textContent=it.a;",
"    c.addEventListener(\u0027click\u0027,function(){",
"      if(c.classList.contains(\u0027back\u0027)){c.classList.remove(\u0027back\u0027);c.textContent=it.a;}",
"      else{c.classList.add(\u0027back\u0027);c.textContent=it.b;if(!seen[it.a]){seen[it.a]=1;gDone(el);}}",
"    });",
"    body.appendChild(c);",
"  });",
"}",
"function gBattle(el){",
"  var items=gPairs(el.getAttribute(\u0027data-items\u0027));",
"  var teams=String(el.getAttribute(\u0027data-teams\u0027)||\u0027A|B\u0027).split(\u0027|\u0027).map(function(x){return x.trim();}).filter(Boolean);",
"  if(teams.length<2)teams=[teams[0]||\u0027A\u0027,\u0027B\u0027];",
"  el.innerHTML=gHead(el,el.getAttribute(\u0027data-title\u0027)||\u0027\\u2694\\ufe0f Battle\u0027,items.length)+\u0027<div class=\\\"g-body\\\"></div>\u0027;",
"  var body=el.querySelector(\u0027.g-body\u0027),score={};teams.forEach(function(tm){score[tm]=0;});",
"  var bar=document.createElement(\u0027div\u0027);bar.className=\u0027g-battle-bar\u0027;body.appendChild(bar);",
"  function paint(){bar.innerHTML=teams.map(function(tm){return \u0027<b>\u0027+tm+\u0027</b> \u0027+score[tm];}).join(\u0027 \\u2022 \u0027);}",
"  paint();",
"  var turn=0,qi=0,q=document.createElement(\u0027div\u0027);q.className=\u0027g-hint\u0027;body.appendChild(q);",
"  gLife(el,body);",
"  var tiles=document.createElement(\u0027div\u0027);tiles.className=\u0027g-tiles\u0027;body.appendChild(tiles);",
"  function round(){",
"    if(qi>=items.length){q.textContent=\u0027Battle over.\u0027;return;}",
"    var it=items[qi],tm=teams[turn%teams.length];",
"    q.textContent=\u0027Team \u0027+tm+\u0027: \u0027+it.b;",
"    tiles.innerHTML=\u0027\u0027;",
"    gShuffle(items.slice()).forEach(function(o){",
"      var t=document.createElement(\u0027button\u0027);t.className=\u0027g-tile\u0027;t.textContent=o.a;",
"      t.addEventListener(\u0027click\u0027,function(){",
"        if(o.a===it.a){score[tm]++;paint();qi++;turn++;gDone(el);round();}",
"        else{t.classList.add(\u0027bad\u0027);setTimeout(function(){t.classList.remove(\u0027bad\u0027);},600);}",
"      });",
"      tiles.appendChild(t);",
"    });",
"  }",
"  round();",
"}",
"function gLife(el,body){",
"  var sup=el.getAttribute('data-support'),ext=el.getAttribute('data-extend');",
"  if(!sup&&!ext)return;",
"  var lf=document.createElement('div');lf.className='g-life';",
"  if(sup){var b1=document.createElement('b');b1.textContent='\ud83d\udedf support: ';lf.appendChild(b1);lf.appendChild(document.createTextNode(sup));}",
"  if(sup&&ext)lf.appendChild(document.createElement('br'));",
"  if(ext){var b2=document.createElement('b');b2.textContent='\ud83d\ude80 extend: ';lf.appendChild(b2);lf.appendChild(document.createTextNode(ext));}",
"  body.appendChild(lf);",
"}",
"function gStorm(el){",
"  var items=gPairs(el.getAttribute('data-items'));",
"  if(!items.length){el.innerHTML='<div class=\\\"g-name\\\">add data-items pairs first</div>';return;}",
"  var teams=String(el.getAttribute('data-teams')||'Lions|Tigers').split('|').map(function(x){return x.trim();}).filter(Boolean);",
"  if(teams.length<2){teams.push(teams[0]==='Lions'?'Tigers':'Lions');}",
"  var grid=Number(el.getAttribute('data-grid'))||4;if(grid!==4&&grid!==5&&grid!==6)grid=4;",
"  var dens={4:[1,2,1,1],5:[2,3,2,2],6:[3,4,3,3]}[grid];",
"  var pool=[5,5,10,10,10,20,20,20,25,25,50];",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'⛈ Storm Board',items.length)+'<div class=\\\"g-body\\\"></div>';",
"  var body=el.querySelector('.g-body'),score={};teams.forEach(function(tm){score[tm]=0;});",
"  var bar=document.createElement('div');bar.className='g-battle-bar';body.appendChild(bar);",
"  function paint(){bar.innerHTML=teams.map(function(tm){return '<b>'+tm+'</b> '+score[tm];}).join(' | ');}",
"  paint();",
"  var tiles=[];",
"  function freshBoard(){tiles=[];var kinds=['storm','swap','half','double'];kinds.forEach(function(k,ix){for(var i2=0;i2<dens[ix];i2++)tiles.push({t:k,v:0,open:false});});var need=grid*grid-tiles.length;for(var j=0;j<need;j++)tiles.push({t:'score',v:pool[j%pool.length],open:false});tiles=gShuffle(tiles);}",
"  freshBoard();",
"  var turn=0,qi=0;",
"  var q=document.createElement('div');q.className='g-hint';body.appendChild(q);",
"  gLife(el,body);",
"  var opts=document.createElement('div');opts.className='g-tiles';body.appendChild(opts);",
"  var sboard=document.createElement('div');sboard.className='storm-board';sboard.style.display='none';sboard.style.gridTemplateColumns='repeat('+grid+',1fr)';body.appendChild(sboard);",
"  var note=document.createElement('div');note.className='g-hint';body.appendChild(note);",
"  function round(){",
"    if(qi>=items.length){q.textContent='Storm over. Final scores above.';opts.innerHTML='';sboard.style.display='none';sboard.innerHTML='';note.textContent='';return;}",
"    var it=items[qi],tm=teams[turn%teams.length];",
"    q.textContent='Team '+tm+': '+it.b;note.textContent='';sboard.style.display='none';sboard.innerHTML='';opts.innerHTML='';",
"    var tried=false;",
"    gShuffle(items.slice()).forEach(function(o){",
"      var t=document.createElement('button');t.className='g-tile';t.textContent=o.a;",
"      t.addEventListener('click',function(){",
"        if(o.a===it.a){t.classList.add('used');stormPick(tm);}",
"        else{t.classList.add('bad');setTimeout(function(){t.classList.remove('bad');},600);if(!tried){tried=true;turn++;tm=teams[turn%teams.length];q.textContent='Rebound! Team '+tm+': '+it.b;}}",
"      });",
"      opts.appendChild(t);",
"    });",
"  }",
"  function stormPick(tm){",
"    opts.innerHTML='';q.textContent='Team '+tm+', pick a storm tile!';",
"    if(!tiles.some(function(tl){return !tl.open;}))freshBoard();",
"    sboard.style.display='grid';sboard.innerHTML='';",
"    tiles.forEach(function(tl){",
"      if(tl.open)return;",
"      var b=document.createElement('button');b.className='g-tile storm-tile';b.textContent='?';",
"      b.addEventListener('click',function(){tl.open=true;resolve(tm,tl,b);},{once:true});",
"      sboard.appendChild(b);",
"    });",
"    note.textContent='Points hide behind the tiles. So does the STORM.';",
"  }",
"  function resolve(tm,tl,b){",
"    var msg='';",
"    if(tl.t==='score'){score[tm]+=tl.v;msg='+'+tl.v+' for '+tm;b.textContent='+'+tl.v;b.classList.add('used');}",
"    else if(tl.t==='double'){score[tm]*=2;msg=tm+' doubles to '+score[tm];b.textContent='x2';b.classList.add('used');}",
"    else if(tl.t==='half'){score[tm]=Math.ceil(score[tm]/2);msg=tm+' cut to '+score[tm];b.textContent='half';b.classList.add('used');}",
"    else if(tl.t==='storm'){score[tm]=0;msg='STORM! '+tm+' is wiped out';b.textContent='STORM';b.classList.add('bad');eruptEl(el,6);}",
"    else{var oi=(teams.indexOf(tm)+1)%teams.length,other=teams[oi],s=score[tm];score[tm]=score[other];score[other]=s;msg=tm+' swaps scores with '+other;b.textContent='swap';b.classList.add('used');}",
"    paint();note.textContent=msg;",
"    gDone(el);qi++;turn++;setTimeout(round,1400);",
"  }",
"  round();",
"}",
"function gBoard(el){",
"  var teams=String(el.getAttribute('data-teams')||'Lions|Tigers').split('|').map(function(x){return x.trim();}).filter(Boolean);",
"  if(teams.length<2){teams.push(teams[0]==='Lions'?'Tigers':'Lions');}",
"  var cats=String(el.getAttribute('data-board')||'').split('|').map(function(c){var k=c.split(':');return {name:(k[0]||'').trim(),cells:gPairs(k.slice(1).join(':'))};}).filter(function(c){return c.name&&c.cells.length;});",
"  if(!cats.length){el.innerHTML='<div class=\\\"g-name\\\">add data-board categories first</div>';return;}",
"  var total=0;cats.forEach(function(c){c.cells=c.cells.map(function(p,ix){total++;return {q:p.a,a:p.b,v:(ix+1)*100,done:false,tried:false,tm:null};});});",
"  el.innerHTML=gHead(el,el.getAttribute('data-title')||'📋 Category Board',total)+'<div class=\\\"g-body\\\"></div>';",
"  var body=el.querySelector('.g-body'),score={};teams.forEach(function(tm){score[tm]=0;});",
"  var bar=document.createElement('div');bar.className='g-battle-bar';body.appendChild(bar);",
"  function paint(){bar.innerHTML=teams.map(function(tm){return '<b>'+tm+'</b> '+score[tm];}).join(' | ');}",
"  paint();",
"  var turn=0;",
"  var grid=document.createElement('div');grid.className='board-grid';grid.style.gridTemplateColumns='repeat('+cats.length+',1fr)';body.appendChild(grid);",
"  var q=document.createElement('div');q.className='g-hint';body.appendChild(q);",
"  gLife(el,body);",
"  var ctl=document.createElement('div');ctl.className='g-tiles';ctl.style.display='none';body.appendChild(ctl);",
"  function draw(){",
"    grid.innerHTML='';",
"    cats.forEach(function(c){",
"      var col=document.createElement('div');",
"      var h=document.createElement('div');h.className='g-hint';h.textContent=c.name;col.appendChild(h);",
"      c.cells.forEach(function(cell){",
"        var b=document.createElement('button');b.className='g-tile'+(cell.done?' used':'');b.textContent=cell.done?'---':cell.v;b.disabled=!!cell.done;",
"        if(!cell.done)b.addEventListener('click',function(){ask(cell);});",
"        col.appendChild(b);",
"      });",
"      grid.appendChild(col);",
"    });",
"  }",
"  function ask(cell){cell.tm=teams[turn%teams.length];cell.tried=false;showQ(cell);}",
"  function showQ(cell){",
"    q.textContent='Team '+cell.tm+' for '+cell.v+': '+cell.q;",
"    ctl.style.display='';ctl.innerHTML='';",
"    var ok=document.createElement('button');ok.className='p-btn';ok.textContent='Correct';",
"    var no=document.createElement('button');no.className='p-btn';no.textContent='Wrong';",
"    ok.addEventListener('click',function(){score[cell.tm]+=cell.v;cell.done=true;after(true,cell.tm+' banks '+cell.v);});",
"    no.addEventListener('click',function(){",
"      if(!cell.tried){cell.tried=true;turn++;cell.tm=teams[turn%teams.length];showQ(cell);}",
"      else{cell.done=true;after(false,'Nobody banks it. Answer: '+cell.a);}",
"    });",
"    ctl.appendChild(ok);ctl.appendChild(no);",
"  }",
"  function after(win,msg){",
"    q.textContent=msg;ctl.style.display='none';ctl.innerHTML='';",
"    var got=Number(el.getAttribute('data-got'))||0;got++;el.setAttribute('data-got',String(got));",
"    var s=el.querySelector('.g-score');if(s)s.textContent=got+' / '+total+' done';",
"    if(win){pay(el,PER_CORRECT);eruptEl(el,8);}",
"    if(got>=total&&s)s.className='g-score win';",
"    paint();turn++;draw();",
"  }",
"  draw();q.textContent='Team '+teams[0]+', pick a cell to start.';",
"}",
"function initGames(root){",
"  if(!root||!root.querySelectorAll)return;",
"  root.querySelectorAll('.game').forEach(function(el){",
"    var g=el.getAttribute('data-game');",
"    try{ if(g==='scramble')gScramble(el); else if(g==='match')gMatch(el); else if(g==='sort')gSort(el); else if(g==='order'){if(!(el.hasAttribute('data-order')&&!el.hasAttribute('data-items')))gOrder(el);} else if(g==='odd')gOdd(el); else if(g==='flip')gFlip(el); else if(g==='battle')gBattle(el); else if(g==='storm')gStorm(el); else if(g==='board'){if(!el.hasAttribute('data-cards'))gBoard(el);} else if(g==='tiles')gTiles(el); }",
"    catch(e){ el.innerHTML='<div class=\\\"g-name\\\">this game could not start</div>'; }",
"  });",
"  root.querySelectorAll('.picker').forEach(function(el){",
"    try{ gPicker(el); }",
"    catch(e){ el.innerHTML='<div class=\\\"g-name\\\">the spinner could not start</div>'; }",
"  });",
"}",
"var viBtn=document.getElementById('viToggle');",
"function viSet(on){try{document.body.classList.toggle('vi-hide',!on);if(viBtn){viBtn.textContent=on?'\\ud83c\\uddfb\\ud83c\\uddf3 VI: ON':'\\ud83c\\uddfb\\ud83c\\uddf3 VI: OFF';viBtn.setAttribute('aria-pressed',on?'true':'false');if(on){viBtn.classList.remove('off');}else{viBtn.classList.add('off');}}try{if(window.localStorage)window.localStorage.setItem('obi-vi',on?'1':'0');}catch(e){}}catch(e){}}",
"if(viBtn){viBtn.addEventListener('click',function(){viSet(document.body.classList.contains('vi-hide'));});var viSaved=null;try{viSaved=(window.localStorage?window.localStorage.getItem('obi-vi'):null);}catch(e){}viSet(viSaved!=='0');}",
"var spinTab=document.getElementById('spinTab'),spinOverlay=document.getElementById('spinOverlay');",
"function spinOpen(){if(spinOverlay){spinOverlay.hidden=false;var b=spinOverlay.querySelector('.p-btn');if(b)b.focus();}}",
"function spinClose(){if(spinOverlay){spinOverlay.hidden=true;}if(spinTab)spinTab.focus();}",
"if(spinTab)spinTab.addEventListener('click',function(){spinOpen();});",
"if(spinOverlay){spinOverlay.addEventListener('click',function(e){if(e.target===spinOverlay){spinClose();return;}var c=e.target.closest?e.target.closest('[data-spin-close]'):null;if(c)spinClose();});}",
"document.addEventListener('keydown',function(e){if(e.key==='Escape'&&spinOverlay&&!spinOverlay.hidden)spinClose();});",
"try{var sp=document.getElementById('spinPicker');if(sp)gPicker(sp);}catch(e){}",
"window.ObiLesson={go:function(i){currentRoom=i;render();},rooms:rooms};",
"})();"
    ].join("\n");
    return code;
  }

  /* ------------------------------ brand marks ----------------------------- */
  /* BRAND.005: the brand's marks are shipped files, so a lesson INLINES the one it
     uses instead of linking anywhere (LESSON.010: one file, handed over). The
     sigil's data URL is fetched once when this module loads; a lesson built
     before it lands, or with no brand module at all, simply carries no sigil —
     never a broken image. */
  let SIGIL = null;
  function marksNow(){
    const m = {};
    if(SIGIL) m.head = SIGIL;
    try{ const B = window.ObiBrand; const s = B && B.assetDataUrlSync && (B.assetDataUrlSync("head-ui") || B.assetDataUrlSync("head")); if(s){ SIGIL = s; m.head = s; } }catch(e){}
    return m;
  }
  /* the UI-size sigil first (132 px, ~9 KB) and the full mark only as a fallback:
     a lesson inlines this, and 29 lessons in the library is 300 KB of difference */
  try{
    if(window.ObiBrand && window.ObiBrand.assetDataUrl){
      window.ObiBrand.assetDataUrl("head-ui")
        .catch(() => window.ObiBrand.assetDataUrl("head"))
        .then(u => { if(u) SIGIL = u; })
        .catch(() => {});
    }
  }catch(e){}

  /* --------------------------------- build -------------------------------- */
  function build(spec){
    /* NEVER MUTATE THE CALLER'S SPEC. build() is called with the caller's own object
       (a library record's spec, the desk's spec) and an earlier version assigned to
       it — which silently baked a 25 KB data URL into every stored spec. Copy first.
       Fresh marks also WIN over any marks already on the spec: the brand module is
       the source of truth, a stored copy is only a cache (BRAND.005). */
    spec = Object.assign({}, spec || {});
    spec.marks = Object.assign({}, spec.marks || {}, marksNow());
    const rooms = (spec.rooms || []).map(r => ({
      graphic: String(r.graphic || "•"),
      title: String(r.title || ""),
      label: String(r.label || ""),
      content: sanitize(r.content)
    }));
    const feats = (spec.features || []).slice(0, 4);
    const title = String(spec.title || "Lesson");
    const logo = String(spec.logo || "📚");
    /* the brand layer: the sigil is INLINED (one data URL, referenced from CSS so
       it appears in several places without being copied), and the status line is
       built from this lesson's real numbers — rooms, the per-correct rate, the
       standard. BRAND.004: the bar states, it does not decorate. */
    const marks = spec.marks || {};
    const sigil = marks.head ? String(marks.head) : null;
    const coinsSpec = spec.coins || {};
    const hudLine = [
      "NET ACADEMY",
      spec.topic ? esc(String(spec.topic).toUpperCase()) : null,
      rooms.length + " ROOMS",
      "+" + Number(coinsSpec.correct == null ? 10 : coinsSpec.correct) + " PER CORRECT",
      spec.evidence ? "EVIDENCE " + esc(String(spec.evidence).slice(0,60).toUpperCase()) : null,
      "STANDARD " + esc(String(STANDARD).replace(/^src\//, ""))
    ].filter(Boolean).join(' <span class="sep">//</span> ');
    const html = [];
    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('<head>');
    html.push('<meta charset="UTF-8">');
    html.push('<title>' + esc(title) + '</title>');
    html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    html.push('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">');
    html.push('<style>');
    html.push(THEME);
    if(sigil) html.push('.hud-sigil{background-image:url("' + sigil + '")}');
    /* a lesson titled the school's way is a whole guide row, not a short brand name —
       the hero gets a smaller clamp so the name still reads as a hero and is never
       clipped by the status bar underneath it (LSN-32) */
    if(title.length > 30) html.push('.hero-title{font-size:clamp(1.6rem,5.6vw,3.6rem);line-height:1.12}');
    html.push('</style>');
    html.push('</head>');
    html.push('<body>');
    html.push('<div class="landing" id="landing">');
    html.push('<div class="hud-hero">' + (sigil ? '<span class="hud-sigil" aria-hidden="true"></span>' : '') + '<div class="hero-logo">' + logo + '</div></div>');
    html.push('<h1 class="hero-title">' + esc(title) + '</h1>');
    html.push('<div class="hud-bar">' + hudLine + '</div>');
    html.push('<p class="hero-subtitle">' + esc(spec.subtitle || "") + '</p>');
    if(spec.subtitleVi) html.push('<p lang="vi">' + esc(String(spec.subtitleVi)) + '</p>');
    html.push('<button class="hero-cta" id="startBtn"><span>' + esc(spec.cta || "🚀 Begin") + '</span></button>');
    html.push('<div class="hero-features">');
    feats.forEach(f => {
      var fvi = (f && f.vi) ? '<span lang="vi">' + esc(String(f.vi)) + '</span>' : '';
      html.push('<div class="feature-card"><div class="feature-icon">' + String(f.icon || "") + '</div><div class="feature-title">' + esc(f.title) + '</div><div class="feature-desc">' + esc(f.desc) + '</div>' + fvi + '</div>');
    });
    html.push('</div>');
    html.push('<div class="hud-bar hud-foot">' + hudLine + '</div>');
    html.push('</div>');
    html.push('<div class="coins-display" id="coinsDisplay">'
      + (sigil ? '<span class="hud-sigil" aria-hidden="true"></span>' : '')
      + '<span class="hud-lab">NET Academy</span><span class="hud-sep"></span>'
      + '<span class="hud-crest" id="tierCrest">MOUSE</span>'
      + '<span class="hud-coins">🪙 <b id="coinsCount">0</b></span>'
      + '<span class="hud-room" id="roomCount">1/' + rooms.length + '</span></div>');
    html.push('<button id="viToggle" type="button" aria-pressed="true" title="Show / hide Vietnamese (hiện / ẩn tiếng Việt)">🇻🇳 VI: ON</button>');
    html.push('<button id="spinTab" type="button" aria-haspopup="dialog" title="Pick a random student (chọn số ngẫu nhiên)">🎡 Spin</button>');
    html.push('<div id="spinOverlay" hidden><div class="spin-panel" role="dialog" aria-modal="true" aria-label="Student Spinner"><button class="spin-close" type="button" data-spin-close aria-label="Close">✕</button><div class="picker" id="spinPicker" data-max="50" data-title="Student Spinner"></div></div></div>');
    html.push('<div class="classroom" id="classroom"><div class="rooms-container"><div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div><div id="roomsContainer"></div></div></div>');
    html.push('<script>window.__LESSON_ICONS__=' + JSON.stringify(ICONS) + ';</script>');
    html.push('<script>window.__LESSON_ROOMS__=' + JSON.stringify(rooms).replace(/<\//g, "<\\/") + ';window.__LESSON_STANDARD__=' + JSON.stringify({ standard: "NET Academy Lesson Standard", spec: STANDARD, built: new Date().toISOString(), topic: spec.topic || null }) + ';<\/script>');
    html.push('<script>');
    html.push(runtime(spec.coins));
    html.push('<\/script>');
    html.push('</body>');
    html.push('</html>');
    const out = html.join("\n");
    return { html: out, bytes: out.length, rooms: rooms.length, spec: spec };
  }

  /* ------------------------------- the prompts ---------------------------- */
  /* THE MODEL'S OUTPUT IS 1024 TOKENS (measured against the live service, 2026-09-21:
     a "count to 900" reply came back exactly 1024 tokens long). A six-room lesson with
     dialogue, five vocab items, scored choice blocks and an exit card does NOT fit in
     one reply — the first version asked for the whole spec at once and came back cut
     off mid-<button>, twice, on every topic. So the build is STAGED:

       pass 1  the shell  — title, promise, features, coins, the storyline, and the
                            six-room outline. Small JSON, ~1000 characters.
       pass 2+ the rooms  — ONE room per reply, returned as RAW HTML (no JSON escaping,
                            no truncation risk), each ~500-900 characters.

     Seven replies instead of one, each comfortably inside the cap, and the room
     prompts share a byte-identical prefix (contract + brief + outline) so every call
     after the first is a prefix-cache hit — the slow part is paid once. */

  const SHELL_CONTRACT = [
"You are Agent 99 writing a NET ACADEMY lesson in the sovereign's format (the standard: " + STANDARD + ").",
"The lesson is built in stages. THIS STAGE IS THE SHELL ONLY: the frame and the six-room outline — no room content yet.",
"Return ONE compact SINGLE-LINE JSON object and nothing else — no prose, no code fences:",
"{\"topic\":\"…\",\"title\":\"… Academy\",\"logo\":\"one emoji\",\"subtitle\":\"the one-line promise, with a wink\",\"cta\":\"🚀 Begin Your Journey\",",
" \"features\":[{\"icon\":\"🏠\",\"title\":\"…\",\"desc\":\"…\"},{\"icon\":\"🎯\",\"title\":\"…\",\"desc\":\"…\"},{\"icon\":\"🔑\",\"title\":\"…\",\"desc\":\"…\"}],",
" \"coins\":{\"start\":0,\"correct\":10,\"wrong\":0},",
" \"outcomes\":{\"know\":\"…\",\"do\":\"…\",\"understand\":\"…\"},",
" \"differentiation\":{\"support\":\"…\",\"extend\":\"…\"},",
 " \"evidence\":\"which class writeup, review or summary chose this lesson, and the gap it showed \u2014 one line\",",
" \"method\":{\"structure\":\"10-5-5-3\",\"phase\":\"which part of the session this is: Hook|Vocab|Idioms|Slang|Review\",\"games\":[{\"name\":\"…\",\"type\":\"competition|collaboration|creation\",\"why\":\"what it does to the learner, one line\"},{\"name\":\"…\",\"type\":\"…\",\"why\":\"…\"},{\"name\":\"…\",\"type\":\"…\",\"why\":\"…\"}]},",
" \"storyline\":\"two sentences: who the people are, and what happens in the two scenes\",",
" \"rooms\":[{\"graphic\":\"🏠\",\"title\":\"The Entrance\"},{\"graphic\":\"…\",\"title\":\"…\"},{\"graphic\":\"📱\",\"title\":\"…\"},{\"graphic\":\"📚\",\"title\":\"…\"},{\"graphic\":\"🎯\",\"title\":\"…\"},{\"graphic\":\"🔑\",\"title\":\"…\"}]}",
"THE SIX ROOMS, in this order, every time — they are the spine and they never move:",
"  1 the warm-up (🏠) · 2 the scene where people SPEAK · 3 the same thing in a group chat (📱) · 4 the words (📚) · 5 the test (🎯) · 6 the key (🔑).",
"Labels are fixed: room 1 is 'Warm-Up', room 4 is exactly 'Learn', room 5 is 'Test', room 6 is 'Mastery'. You only invent the two scene titles.",
"Outcomes are the KSU triple — one line each: what they leave KNOWING, what they can DO, what they UNDERSTAND. Differentiation is grade-aware (the brief names the age): support is the lifeline for strugglers, extend is the stretch for fast finishers. Both from this lesson’s own material.",
"\"method\" is the session method — 10 vocab · 5 idioms · 5 slang · 3 games (the 10-5-5-3 sacred structure). Give THREE games built from this lesson's own material, each with a type (competition = adrenaline, collaboration = social proof, creation = ownership) and a one-line mechanism: what the game does to the learner.",
"The title is a real lesson title (a word or two + 'Academy'), the subtitle is one line that promises something and winks.",
"The features are three cards: what the learner actually gets. Keep the whole reply under 1200 characters."
  ].join("\n");
  const SHELL_REPAIR = "\n\nNOTE: your last reply was not one parseable JSON object. Return ONLY the compact single-line JSON object, nothing before the { and nothing after the }.";

  /* the room calls share this WHOLE block, byte for byte, so only the last line
     changes between them (and after the same brief is used twice, it is all cache) */
  const ROOM_RULES = [
"Room 1 — the Warm-Up: welcome the learner in second person, then a <ul> of exactly three or four <li>, each one short line: what they will leave with. No dialogue here.",
"Room 2 — the SPOKEN scene: 3–5 <div class=\"dialogue-block\"> turns between named people, each turn beginning <span class=\"speaker\">Name:</span> and then only the words they actually say. Real school talk, not textbook talk. End the room with exactly one <div class=\"chatty-clue\">🤔 Reality check: …</div> saying what is really happening underneath the words.",
"Room 3 — the TEXT scene: the same skill, in a group chat. Same dialogue-block markup and named speakers, but short lines with 📱🙄😏 as punctuation. End the room with a <div class=\"chatty-clue\">🤔 Reality check: …</div> AND a <div class=\"chatty-hint\"><strong>Pro Tip:</strong> the transferable rule they can use tomorrow</div>.",
"Room 4 — Learn: <div class=\"vocab-list\"> holding exactly FIVE <div class=\"vocab-item\"><strong>N. Term:</strong> <span>one line</span></div>, numbered 1 to 5, and they must be the real phrases that were used in the two scenes. A whole NET session carries 10 vocab · 5 idioms · 5 slang · 3 games (the 10-5-5-3 sacred structure) — this room holds the five the scenes actually used, drawn from that session's ten.",
"Room 5 — Test: two to four <div class=\"chatty-choices\"> blocks, staged as role-play (a named friend asks, you answer — wrong options are the class's real mistakes). Each one starts with <div><strong>Scenario:</strong> …</div>, has 2–3 <button>s carrying data-answer=\"correct\" (exactly one) or data-answer=\"wrong\", carries data-correct-feedback AND data-wrong-feedback on the block, and ends with <div class=\"chatty-feedback empty\"></div>. The wrong feedback RE-TEACHES the rule — it never just says wrong.",
"Room 6 — Mastery: <div class=\"summary-card\"><strong>🎓 the reward line</strong><ul> with 4–6 <li><strong>Rule Name:</strong> one-line reason</li></ul></div>, then <div class=\"chatty-hint\"><strong>Level Up:</strong> how to use this outside the classroom</div>, then a write-task AI prompt card: a <textarea class=\"write-task\"> whose placeholder is a worked personal frame (your city, your words) the learner rewrites as themselves."
  ];
  const ROOM_CONTRACT = [
"You are Agent 99 writing ONE ROOM of a NET ACADEMY lesson (the standard: " + STANDARD + "). You are given the shell, the storyline and the six-room outline below.",
"You write ONLY the HTML content of the room you are asked for. Output RAW HTML and nothing else: no JSON, no code fences, no prose before or after. Start with '<' and end with '>'.",
"ALLOWED CLASSES ONLY: dialogue-block, speaker, chatty-clue, chatty-hint, vocab-list, vocab-item, chatty-choices, chatty-feedback, summary-card, write-task (a real textarea for writing rooms), reading, game (data-game scramble|match|sort|order|odd|flip|battle|storm|board|tiles|tornado|memory|dice|reveal|voice), picker (the student spinner), and the state classes empty/selected/correct/wrong.",
"VIETNAMESE GLOSS (LSN-33): after any English sentence you may add <span lang=\"vi\">the Vietnamese</span> — a plain span with lang only, no class, no style. Keep definitions as simple as possible (one short clause + one real example). The lesson toggle shows/hides every gloss at once.",
"STUDENT PICKER (a teacher tool, never a scored game): <div class=\"picker\" data-max=\"50\" data-title=\"Student Spinner\"></div> — class-size input (2–50) + a big canvas wheel: 4–5 s spin, ticking past every number, fanfare + confetti on the winner. Give it its own early room with a How-to-use hint.",
"ICONOGRAPHY (LSN-39): tag any element with data-icon=\"key\" (coin, die, ticket, animal, math, chance...) and the runtime prepends the glyph; unknown keys warn, never break the build.",
"VOICE: tag any line with data-say=\"words to speak\" and the learner taps to hear it (speech synthesis, no files, no network).",
"TIMER: <div class=\"timer\" data-seconds=\"60\" data-title=\"Decide!\"></div> is a countdown ending in a soft blip; silent under reduced motion.",
"DATA-COINS: any .game or .chatty-choices may carry data-coins=\"N\" to pay N per correct instead of the lesson rate.",
"PRINT: the built file prints clean — the open room expanded, chrome and chrome buttons hidden (@media print).",
"SPINNER TAB: every built lesson also ships a fixed Spin tab + dialog overlay (the same picker, openable from any room) — the picker room teaches it, the tab carries it. No content markup needed for the tab.",
"STAGE MODE (the TV standard, src/LESSON-DISPLAY.md): lessons present on classroom televisions — content stays short lines and lists (never walls of text) so the wide-screen stage layout reads from the back row.",
"CELEBRATION (LSN-35): every correct answer erupts — an emoji burst plus a floating +10 coin chip at the click point; a tier-up flashes the coin pill with a burst; the exit room glows (finale). Juice is visual-only, never scored, and sleeps under prefers-reduced-motion.",
"GAME ARENA: the three games may share one arena room (label Game) instead of three rooms — scramble, match and sort back to back, one coin economy.",
"No <script>, no <style>, no onclick or any other handler, no inline style except a margin one-off. Plain <p>, <div>, <ul>, <li>, <strong>, <span>, <em>, <button> are all fine.",
"VOICE: second person present tense · ordinary school life (late to class, a group project, the group chat afterwards) · emoji as punctuation · British English · nothing longer than two sentences — lists carry the volume, never walls of text.",
"",
"THE ROOM RULES",
ROOM_RULES[0], "", ROOM_RULES[1], "", ROOM_RULES[2], "", ROOM_RULES[3], "", ROOM_RULES[4], "", ROOM_RULES[5]
  ].join("\n");
  const ROOM_REPAIR = "\n\nNOTE: your last reply was rejected — it was empty, cut off, or it used markup outside the allowed vocabulary. Write the room again, complete, raw HTML only, ending with the closing tag of its last block.";

  function briefText(topic, opts){
    opts = opts || {};
    const bits = [];
    if(opts.level) bits.push("level/age: " + opts.level);
    if(opts.language) bits.push("teaching language: " + opts.language);
    if(opts.notes) bits.push("the sovereign's notes (obey these): " + opts.notes);
    return "\n\n<TOPIC>" + String(topic || "").trim() + "</TOPIC>" + (bits.length ? "\n<BRIEF>" + bits.join(" · ") + "</BRIEF>" : "");
  }
  function outlineText(outline, storyline){
    return "\n\n<THE LESSON>\n" + (storyline ? "Storyline: " + storyline + "\n" : "")
      + outline.map((r, i) => "Room " + (i + 1) + " [" + r.label + "] " + r.graphic + " " + r.title).join("\n")
      + "\n</THE LESSON>";
  }
  function tidyHTML(s){
    let t = String(s == null ? "" : s).trim();
    const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/);
    if(fence) t = fence[1].trim();
    const a = t.indexOf("<"), b = t.lastIndexOf(">");
    if(a >= 0 && b > a) t = t.slice(a, b + 1);
    return t.trim();
  }
  /* the six anchors are not negotiable — a shell that loses one gets it back here,
     and rooms 1/4/5/6 keep their names: the model invents the two scene titles only
     (LESSON.001 — the spine never moves, and its labels are the contract). */
  const ANCHORS = [
    { graphic:"🏠", title:"The Entrance" }, { graphic:"🖥️", title:"The Scene" }, { graphic:"📱", title:"The Group Chat" },
    { graphic:"📚", title:"The Words" }, { graphic:"🎯", title:"The Test" }, { graphic:"🔑", title:"The Key" }
  ];
  const ANCHOR_LABELS = ["Warm-Up", null, null, "Learn", "Test", "Mastery"];
  const ANCHOR_TITLES = ["The Entrance", null, null, "The Words", "The Test", "The Key"];
  function normalizeOutline(rs){
    return ANCHORS.map((a, i) => {
      const r = (Array.isArray(rs) && rs[i]) || {};
      return { graphic: String(r.graphic || a.graphic).slice(0, 4),
               title: String(ANCHOR_TITLES[i] || r.title || a.title).slice(0, 60),
               label: (ANCHOR_LABELS[i] || String(r.label || (i === 1 ? "Scene" : "Text Scene"))).slice(0, 24) };
    });
  }
  /* what a room must contain to be worth keeping — a local gate, so a bad reply is
     retried before it can waste a validator run */
  function roomSane(i, html){
    const t = String(html || "");
    if(t.length < 60) return false;
    if(!/^</.test(t)) return false;
    if(i === 0) return /<ul>/i.test(t) && /<li>/i.test(t);
    if(i === 1) return /dialogue-block/.test(t) && /chatty-clue/.test(t);
    if(i === 2) return /dialogue-block/.test(t) && /chatty-clue/.test(t) && /chatty-hint/.test(t);
    if(i === 3) return (t.match(/vocab-item/g) || []).length >= 3;
    if(i === 4) return /chatty-choices/.test(t) && /data-answer=/.test(t) && /data-correct-feedback/.test(t) && /data-wrong-feedback/.test(t) && /chatty-feedback/.test(t);
    if(i === 5) return /summary-card/.test(t) && (t.match(/<li>/g) || []).length >= 3;
    return true;
  }
  function roomTask(i, r){
    return "TASK: write ONLY the content HTML for room " + (i + 1) + " — \"" + r.title + "\" (label: " + r.label + ").\n" + ROOM_RULES[i]
      + "\nOutput the raw HTML for that one room and nothing else.";
  }

  /* THE STAGED BUILD. `ctx.call(instruction, label)` performs one reply (each UI owns
     its own streaming), `ctx.progress(msg)` narrates, `ctx.stop()` asks to abort.
     Returns { spec } | { stopped:true } | { err, raw }. */
  async function compose(topic, opts, ctx){
    ctx = ctx || {};
    const go = () => !(ctx.stop && ctx.stop());
    const brief = briefText(topic, opts);
    const total = 1 + ANCHORS.length;
    /* pass 1 — the shell */
    if(ctx.progress) ctx.progress("pass 1/" + total + " — the shape of the lesson");
    let shell = null, raw = "";
    for(let a = 1; a <= 2 && !shell; a++){
      raw = await ctx.call(SHELL_CONTRACT + brief + "\n\nWrite the shell now. Return the JSON object only." + (a === 2 ? SHELL_REPAIR : ""), "shell");
      if(/^__ERR__/.test(raw)) return { err:raw.slice(8) };
      if(!go()) return { stopped:true };
      const p = parseSpec(raw);
      if(p.ok && p.spec && p.spec.title && Array.isArray(p.spec.rooms) && p.spec.rooms.length) shell = p.spec;
    }
    if(!shell) return { err:"the shell did not come back as JSON (two attempts)", raw:raw };
    const outline = normalizeOutline(shell.rooms);
    /* passes 2..7 — one room per reply, raw HTML */
    const rooms = [];
    for(let i = 0; i < outline.length; i++){
      const r = outline[i];
      if(ctx.progress) ctx.progress("pass " + (i + 2) + "/" + total + " — room " + (i + 1) + " · " + r.title);
      let content = "";
      for(let a = 1; a <= 2; a++){
        const html = await ctx.call(ROOM_CONTRACT + brief + outlineText(outline, shell.storyline) + "\n\n" + roomTask(i, r) + (a === 2 ? ROOM_REPAIR : ""), "room " + (i + 1));
        if(/^__ERR__/.test(html)) return { err:html.slice(8) };
        if(!go()) return { stopped:true };
        content = tidyHTML(html);
        if(roomSane(i, content)) break;
        if(a === 2 && ctx.progress) ctx.progress("room " + (i + 1) + " came back thin — the validator will say so");
      }
      rooms.push({ graphic:r.graphic, title:r.title, label:r.label, content:content });
    }
    /* THE METHOD BLOCK (LESSON.001/.011/.023) — the session method the lesson sits
       inside. A malformed one is dropped rather than allowed to fail the build: the
       model gets its shot at naming three typed games, and the lesson never dies for
       it. When it is well-formed, the validator checks it (LSN-23). */
    let method = null;
    try{
      const mRaw = shell.method;
      if(mRaw && typeof mRaw === "object"){
        const gs = (Array.isArray(mRaw.games) ? mRaw.games : []).filter(g => g && g.name && g.why)
          .map(g => ({ name:String(g.name).slice(0, 60), type:String(g.type || "").slice(0, 20), why:String(g.why).slice(0, 160) }));
        if(gs.length >= 3) method = { structure:"10-5-5-3", phase:mRaw.phase ? String(mRaw.phase).slice(0, 40) : null, games: gs.slice(0, 6) };
        else if(ctx.progress) ctx.progress("the shell came back without three typed games — the method block was dropped");
      }
    }catch(e){}
        /* THE KSU + DIFFERENTIATION (LPG harvest, 2026-10-21, ported from the edtech
       station — asiln/Lesson-Plan-Generator prompt.txt: well-formed is carried,
       malformed is dropped, absent is legal; old shells without these fields
       still compose. */
    let outcomes = null, differentiation = null;
    try{
      const oRaw = shell.outcomes;
      if(oRaw && typeof oRaw === "object"){
        const k = String(oRaw.know || "").slice(0, 140), d = String(oRaw.do || oRaw.skills || "").slice(0, 140), u = String(oRaw.understand || "").slice(0, 140);
        if(k && d && u) outcomes = { know:k, do:d, understand:u };
        else if(ctx.progress) ctx.progress("the shell came back without a full KSU triple — outcomes dropped");
      }
      const dRaw = shell.differentiation;
      if(dRaw && typeof dRaw === "object"){
        const sp = String(dRaw.support || "").slice(0, 140), ex = String(dRaw.extend || "").slice(0, 140);
        if(sp && ex) differentiation = { support:sp, extend:ex };
        else if(ctx.progress) ctx.progress("the shell came back without both ropes — differentiation dropped");
      }
    }catch(e){}
    const spec = { topic: shell.topic || String(topic || "").trim(), title: shell.title, logo: String(shell.logo || "📚").slice(0, 4),
      subtitle: shell.subtitle, cta: shell.cta || "🚀 Begin Your Journey",
      features: (Array.isArray(shell.features) ? shell.features : []).slice(0, 4),
      coins: shell.coins || { start:0, correct:10, wrong:0 }, outcomes: outcomes, differentiation: differentiation, evidence: shell.evidence ? String(shell.evidence).slice(0, 160) : null, method: method, rooms: rooms };
    return { spec:spec, passes:total, storyline:shell.storyline || null };
  }

  /* ------------------------------ spec parsing ---------------------------- */
  /* Find the FIRST balanced {...} and parse exactly that: a model that appends
     commentary (or a second object) after the spec must not cost us the lesson.
     The old version sliced from the first `{` to the LAST `}` — so one stray brace
     in the trailing prose made JSON.parse fail with "unexpected character after
     JSON" and the whole build was refused. Brace counting is string- and
     escape-aware, because a room's content is HTML full of braces-free text but
     the spec itself can carry `{` inside a string. */
  function firstObject(t){
    const start = t.indexOf("{");
    if(start < 0) return null;
    let depth = 0, inStr = false, esc2 = false;
    for(let i = start; i < t.length; i++){
      const c = t[i];
      if(inStr){
        if(esc2){ esc2 = false; continue; }
        if(c === "\\"){ esc2 = true; continue; }
        if(c === "\"") inStr = false;
        continue;
      }
      if(c === "\""){ inStr = true; continue; }
      if(c === "{") depth++;
      else if(c === "}"){
        depth--;
        if(depth === 0) return t.slice(start, i + 1);
      }
    }
    return null;   /* the reply was cut off mid-object — the caller retries */
  }
  function parseSpec(raw){
    let t = String(raw == null ? "" : raw).trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if(fence) t = fence[1].trim();
    const one = firstObject(t);
    if(one){
      try{ return { ok:true, spec: JSON.parse(one) }; }
      catch(e){
        /* one more try: the reply may hold prose BEFORE the object, so scan on */
        const idx = t.indexOf("{", t.indexOf(one) + one.length);
        if(idx >= 0){
          const two = firstObject(t.slice(idx));
          if(two){ try{ return { ok:true, spec: JSON.parse(two) }; }catch(e2){} }
        }
        return { ok:false, why:String((e && e.message) || e).slice(0, 160), raw:t.slice(0, 400) };
      }
    }
    return { ok:false, why:"no complete JSON object in the reply (" + t.length + " chars)", raw:t.slice(0, 400) };
  }

  /* ------------------------------- rendering ------------------------------ */
  function previewCard(spec, built, check){
    const rows = check.errors.map(e => '<div class="rrow bad"><b>FAIL</b><span class="vd">✖</span><div class="rd">' + esc(e) + '</div></div>').join("")
      + check.warnings.map(w => '<div class="rrow"><b>WARN</b><span class="vd">!</span><div class="rd">' + esc(w) + '</div></div>').join("");
    return '<div class="rise"><div class="rhead">📚 ' + esc(spec.title || "lesson") + (check.ok ? " — built" : " — REFUSED") + '</div>'
      + '<div class="rrow"><b>SPEC</b><span class="vd">' + check.rooms + ' ROOMS</span><div class="rd">' + check.vocab + ' vocab · ' + check.blocks + ' choice blocks' + (check.games ? ' · ' + check.games + ' games' : '') + ' · ' + built.bytes + ' bytes of HTML</div></div>'
      + rows
      + '<div class="lf-acts"></div>'
      + '<div class="rfoot">The standard this obeys: <b>' + esc(STANDARD) + '</b> · reference lessons in <b>' + esc(REF_DIR) + '</b>.</div></div>';
  }
  function wireActions(bubble, spec, built){
    const acts = bubble.querySelector(".lf-acts");
    if(!acts) return;
    acts.innerHTML = "";
    const mk = (label, fn) => { const b = document.createElement("button"); b.className = "ci-act"; b.textContent = label; b.onclick = fn; acts.appendChild(b); };
    mk("▶ Preview", () => openPreview(built.html, spec.title));
    mk("⬇ .html", () => download(built.html, fileName(spec)));
    mk("🗂 Save", () => save(spec, built));
    mk("📄 Spec", () => download(JSON.stringify(spec, null, 2), fileName(spec).replace(/\.html$/, ".spec.json"), "application/json"));
  }
  function fileName(spec){ return String(spec.title || "lesson").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".html"; }
  function download(text, name, mime){
    try{
      const url = URL.createObjectURL(new Blob([text], { type: mime || "text/html;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = name; a.rel = "noopener"; a.style.display = "none";
      document.body.appendChild(a); a.click();
      setTimeout(() => { try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 4000);
    }catch(e){ bubble('⚠ download failed: ' + esc(String((e && e.message) || e))); }
  }
  let overlay = null;
  function openPreview(html, title){
    try{
      if(overlay){ overlay.remove(); overlay = null; }
      overlay = document.createElement("div");
      overlay.className = "lf-overlay";
      const bar = document.createElement("div");
      bar.className = "lf-bar";
      bar.innerHTML = '<b>📚 ' + esc(title || "lesson") + '</b>';
      const close = document.createElement("button");
      close.className = "ci-act"; close.textContent = "✕ Close";
      close.onclick = () => { try{ overlay.remove(); }catch(e){} overlay = null; };
      bar.appendChild(close);
      const frame = document.createElement("iframe");
      frame.className = "lf-frame";
      /* no sandbox attribute: the lesson is the station's own build (content is
         sanitized of scripts/handlers at build time) and a same-origin frame is
         what makes the preview honest — fonts, scripts and the writing task all
         behave exactly as they will when the file is opened by a class. */
      frame.setAttribute("title", title || "lesson preview");
      frame.srcdoc = html;
      overlay.appendChild(bar); overlay.appendChild(frame);
      document.body.appendChild(overlay);
    }catch(e){ bubble('⚠ preview failed: ' + esc(String((e && e.message) || e))); }
  }

  /* --------------------------------- store -------------------------------- */
  /* A lesson belongs to a CLIENT, exactly like the evidence it came from
     (src/clients.js): one station, many engagements, and nothing leaks sideways. */
  const CLIENT_FALLBACK = "unassigned";
  function clientId(){
    try{ if(window.ObiClients && window.ObiClients.id) return window.ObiClients.id(); }catch(e){}
    return CLIENT_FALLBACK;
  }
  function clientName(){
    try{ if(window.ObiClients && window.ObiClients.name) return window.ObiClients.name(); }catch(e){}
    return clientId();
  }
  function mine(rec){ return ((rec && rec.client) || CLIENT_FALLBACK) === clientId(); }
  async function records(){
    const f = folder();
    if(!f) return [];
    let rows = [];
    try{ rows = (await f.entries()).map(p => p[1]).filter(Boolean); }catch(e){ return []; }
    return rows.filter(mine).sort((a, b) => (b.created || 0) - (a.created || 0));
  }
  async function save(spec, built){
    const f = folder();
    const rec = { id: "L" + Date.now().toString(36), title: spec.title || "lesson", topic: spec.topic || null,
      client: clientId(), created: Date.now(), rooms: built.rooms, bytes: built.bytes, html: built.html, src: window.generatorName || null,
      /* the record keeps the spec WITHOUT the inlined marks: they are re-attached
         from src/brand.js at every rebuild, and a data URL per record would bloat
         the library for nothing (the built html keeps the copy it needs) */
      spec: (function(s){ const c = Object.assign({}, s); delete c.marks; return c; })(spec) };
    if(f){ try{ await f.set(rec.id, rec); bubble('🗂 Saved as <b>' + esc(rec.title) + '</b> · id ' + esc(rec.id) + ' · /lesson list'); return rec; }catch(e){} }
    try{ download(built.html, fileName(spec)); }catch(e){}
    bubble('🗂 Storage unavailable — the file was downloaded instead.');
    return rec;
  }
  async function list(){
    const rows = await records();
    if(!rows.length){ bubble('📚 No lessons built yet. <b>/lesson &lt;topic&gt;</b> to make one, or open the Lesson Creator desk (◈ Phoenix Generators → NET → 📚 Lesson Creator).'); return; }
    const html = rows.map(r => '<div class="rrow"><b>' + esc(r.title) + '</b><span class="vd">' + esc(String(r.rooms)) + ' ROOMS</span><div class="rd">' + new Date(r.created).toLocaleString() + ' · ' + esc(String(r.bytes)) + ' bytes · ' + esc(r.id) + '</div></div>').join("");
    const b = window.addBubble ? window.addBubble("ass", '<div class="rise"><div class="rhead">📚 Lessons built (' + rows.length + ') — ' + esc(clientName()) + '</div>' + html + '<div class="rfoot">Saved in the browser (kv <b>' + KV_FOLDER + '</b>, scoped to the active client). <b>/lesson desk</b> opens the creator · <b>/lesson &lt;topic&gt;</b> builds one.</div></div>') : null;
    if(b){
      const acts = document.createElement("div"); acts.className = "lf-acts";
      rows.slice(0, 8).forEach(r => {
        const btn = document.createElement("button"); btn.className = "ci-act"; btn.textContent = "⬇ " + r.title;
        btn.onclick = () => download(r.html, fileName(r.spec || { title:r.title }));
        acts.appendChild(btn);
      });
      b.appendChild(acts);
    }
    return rows;
  }

  /* ------------------------------- the run -------------------------------- */
  async function run(arg){
    const text = String(arg || "").trim();
    if(!text || text === "desk" || text === "creator" || text === "create" || text === "build"){ openDesk(text === "build" ? "build" : "plan"); return; }
    if(text === "standard" || text === "spec"){ standard(); return; }
    if(text === "list" || text === "library"){ await list(); return; }
    if(/^forge(\s|$)/.test(text)){
      /* AUDIT 2026-09-21: this module is src/lesson-forge.js and it owns window.ObiLessonForge.
         It used to publish itself as window.ObiForge — the SAME global the self-forge (src/forge.js)
         uses — so whichever loaded last (lesson-forge) won and the self-forge was unreachable:
         /forge selftest ran the lesson queue instead. Renamed. */
      if(window.ObiLessonForge && window.ObiLessonForge.cmd) await window.ObiLessonForge.cmd(text.replace(/^forge\s*/, ""));
      else bubble('⚠ the lesson forge did not load — reload the page.');
      return;
    }
    if(/^push(\s|$)/.test(text)){ await pushToCanon(text.replace(/^push\s*/, "").trim()); return; }
    if(text === "check"){
      bubble('<div class="rise"><div class="rhead">✅ /lesson check — the validator</div><div class="rd">The rules are in <b>' + esc(STANDARD) + '</b>: the spine (six rooms), the fixed component vocabulary, Chatty\'s three voices, the scoring practice block, the exit card, phone + reduced-motion, one self-contained file. Every lesson this station builds is checked against it before it is called done — <b>a lesson that fails the check is not shipped</b>.</div><div class="rfoot">/lesson &lt;topic&gt; builds one and runs the check on it.</div></div>');
      return;
    }
    if(!root.generateText){ bubble('⚠ the ai-text plugin is not available — reload the page.'); return; }

    const b = window.addBubble ? window.addBubble("ass", "") : null;
    if(!b){ console.log("no bubble host"); return; }
    let stopped = false, gen = null;
    let status = "";
    b.innerHTML = '<div class="rhead">📚 Agent 99 is writing the lesson…</div><div class="lf-note rd"></div><div class="lf-out rd"></div>';
    const out = b.querySelector(".lf-out"), statusEl = b.querySelector(".lf-note");
    const call = async (instruction, label) => {
      let acc = "";
      try{
        gen = root.generateText({
          instruction: instruction,
          onChunk: d => { acc = d.fullTextSoFar || acc; if(out) out.textContent = "…" + acc.slice(-200).replace(/\s+/g, " "); scroll(); }
        });
        const res = await gen;
        return acc || (res && (res.generatedText || res.text)) || "";
      }catch(e){ return stopped ? "" : "__ERR__ " + String((e && e.message) || e); }
      finally { gen = null; }
    };
    const res = await compose(text, {}, {
      call: call,
      progress: msg => { status = msg; if(statusEl) statusEl.textContent = msg + (out && out.textContent ? " · streaming…" : ""); scroll(); },
      stop: () => stopped
    });
    if(res.stopped){
      b.innerHTML = '<div class="rise"><div class="rhead">📚 /lesson ' + esc(text) + ' — stopped</div><div class="rd">You stopped the build. Nothing was saved, nothing was shipped — /lesson ' + esc(text) + ' picks it up again from the top.</div></div>';
      log({ kind:"op", action:"lesson build", ok:false, detail:text, result:"stopped by the sovereign" });
      return;
    }
    if(res.err){
      b.innerHTML = '<div class="rise"><div class="rhead">📚 the build did not finish</div><div class="rrow bad"><b>99</b><span class="vd">✖</span><div class="rd">' + esc(res.err) + '</div></div>'
        + '<div class="rfoot">The build runs in ' + (1 + ANCHORS.length) + ' passes (the model\'s reply is capped at 1024 tokens, so a whole six-room lesson cannot come back in one). Reply was ' + esc(String((res.raw || "").length)) + ' chars. <b>/lesson ' + esc(text) + '</b> to try again.</div></div>';
      log({ kind:"op", action:"lesson build", ok:false, detail:text, result:"staged build failed: " + res.err });
      return;
    }
    const spec = res.spec;
    const check = validate(spec);
    const built = build(spec);
    lastBuilt = built;
    b.innerHTML = previewCard(spec, built, check);
    wireActions(b, spec, built);
    if(check.ok) await save(spec, built);
    log({ kind:"op", action:"lesson build", ok:check.ok, detail:spec.title + " on \"" + text + "\"", result:check.rooms + " rooms · " + built.bytes + " bytes · " + res.passes + " passes · " + (check.ok ? "check passed" : check.errors.length + " failures") });
    dna("Obi: [/lesson " + text + " — " + spec.title + " (" + check.rooms + " rooms, " + (check.ok ? "check passed" : "REFUSED: " + check.errors[0]) + ")]");
    return built;
  }

  /* ------------------------------- the doctrine --------------------------- */
  /* ONE source of truth for the lesson laws — Part I (LSN-1…12) and Part II
     (LSN-13…23): the chat (`/lesson standard`) and the desk's 📐 Standard room both
     render from here, so they can never disagree. */
  function standardRows(){
    return [
      ["LSN-1", "One file, no build", "a single self-contained .html — <style> in the head, one <script> at the end, no framework, Inter from Google Fonts"],
      ["LSN-2", "The brand is fixed", "#a855f7 purple · #f59e0b gold · #0f0f1a ground · glass cards · purple→gold gradient on every heading and button"],
      ["LSN-3", "Two screens", "landing (logo, promise with a wink, one CTA, 3–4 feature cards) → the lesson card"],
      ["LSN-4", "Six rooms, one spine", "🏠 Warm-Up → scene → text scene → 📚 Learn → 🎯 Test → 🔑 Mastery — the anchors never move"],
      ["LSN-5", "The room contract", "{graphic, title, label, content} and only the approved classes inside content"],
      ["LSN-6", "Chatty teaches", "clue = reality check · hint = the transferable rule · feedback re-teaches, never a bare \"wrong\""],
      ["LSN-7", "Practice scores", "data-answer buttons disable the block, colour the choice, and move coins (+10 / −5)"],
      ["LSN-8", "The exit hands over a key", "summary card with 4–6 bolded takeaways + a Level Up hint or a writing task"],
      ["LSN-9", "Motion is soft and cheap", "transform/opacity only, 0.5–0.9 s entrances, ambient loops 2–13 s, honour prefers-reduced-motion"],
      ["LSN-10", "Phone first", "at 720px: features stack, padding drops, the tile shrinks, the card flattens"],
      ["LSN-11", "Fail closed", "a lesson that fails the check is not shipped — /lesson check runs the validator"],
      ["LSN-12", "Two deviations from the sources", "earlier answers keep their marks · the nav row is sticky (both are defects in the reference files)"],
      ["LSN-13", "The method is the arithmetic", "10 vocab · 5 idioms · 5 slang · 3 games over 60 minutes — Hook → Vocab → Game → Idioms → Game → Slang → Game → Review; a lesson is one session's slice"],
      ["LSN-14", "A game owns its mechanism", "every block names what it does to the learner and its type: 🔴 competition · 🟢 collaboration · 🟣 creation — three games minimum, never three of a type"],
      ["LSN-15", "One economy", "🐭 Mouse · 🐻 Cub 200 · 🐅 Tiger 500 · 👑 Legend 5000; +10 vocab · +25 idiom · +5 participation · +50 game · +100 perfect; lesson coins are the smaller denomination of the same currency"],
      ["LSN-16", "The voice is the sovereign's", "second person, short, imperative; caps are weight; loud-and-wrong beats silent-and-correct; no hedging, no apology, no sarcasm aimed at the learner"],
      ["LSN-17", "Two families, displayed with intent", "amend LSN-1: at most two Google Fonts — a display face for headings (Orbitron, uppercase, letter-spaced) and a body face (Rajdhani or Inter)"],
      ["LSN-18", "The full palette", "the semantic four — green/red/orange/yellow + their dim fills — plus glass-light, text-dim, text-bright, and the radius tokens; purple is the system, gold is the reward, the four are only state"],
      ["LSN-19", "The card and the pill", "every panel is a glass card; every card title is emoji + uppercase display label; every statistic is icon + gold mono value; every tag is a pill"],
      ["LSN-20", "Juice, generated not downloaded", "WebAudio oscillator cues and div confetti only — no asset files; the context is created and resumed on the first gesture; a miss never gets the win cue"],
      ["LSN-21", "It survives the classroom", "targets ≥ 44px, keyboard-reachable, live regions announce state, no native dialogs, print-friendly, offline, one home per setting"],
      ["LSN-22", "Defects are not inherited", "the reference files are ground truth for taste, never for correctness — the ten documented defects (four fonts, eager AudioContext, overlapping phases, unescaped names, no reduced-motion, no aria-live, duplicate settings, innerHTML +=, confirm(), unnamed emoji) are never copied"],
      ["LSN-23", "The spec declares its method", "when a spec carries a `method` block the validator checks it: 3+ typed games, a mechanism line each, a named phase, the sovereign's lines it used"]
    ];
  }
  function standardHTML(){
    const rows = standardRows();
    return '<div class="rise"><div class="rhead">📐 The NET Academy Lesson Standard</div>'
      + '<div class="rrow"><b>WHO OBEYS IT</b><span class="vd">AGENT 99</span><div class="rd">through GOSPEL-999 (the mandates) and the Legionnaire Field Guide (the laws) — every lesson, in every generator</div></div>'
      + rows.map(r => '<div class="rrow"><b>' + esc(r[0]) + ' — ' + esc(r[1]) + '</b><span class="vd">LAW</span><div class="rd">' + esc(r[2]) + '</div></div>').join("")
      + '<div class="rrow"><b>GROUND TRUTH</b><span class="vd">' + REFS.length + ' FILES</span><div class="rd">' + REFS.map(r => '<span class="cmd">' + esc(REF_DIR + r) + '</span>').join(" ") + ' — the sovereign\'s own work. Sarcasm + Careers are the six-room format, Neon City Genesis is the Grade-12 deck-and-games shape, the Classroom Manager is the method and the machine; where this document and those files disagree about taste, the files win.</div></div>'
      + '<div class="rfoot">The document: <b>' + esc(STANDARD) + '</b> · build one with <b>/lesson &lt;topic&gt;</b> · /lesson check · /lesson list</div></div>';
  }
  function standard(){
    const rows = standardRows();
    bubble(standardHTML());
    return rows;
  }

  /* ============================================================================
     THE LESSON CREATOR — the desk (src/divisions.js: Phoenix Generators → NET →
     📚 Lesson Creator). The engine above turns a spec into a lesson file; the desk
     is where a human decides WHICH lesson, looks at it, and ships it.

     Four rooms, one job, and the loop closes here:
       🧭 PLAN   — read this week's evidence (the Student Evaluator's writeups,
                   reviews and summaries) and choose the next lesson, with the
                   objectives named. This is the evidence → gap → objective layer.
       ✍ BUILD   — Agent 99 writes the spec, or the sovereign pastes/edits one.
                   Everything goes through the validator before it is called done.
       🗂 LIBRARY — every lesson built for this client, re-openable, re-downloadable,
                   pushable to the canon beside the class it came from.
       📐 STANDARD— the lesson laws (Part I: the format · Part II: the method and the
                   machine), rendered from the same source as /lesson standard.
     ========================================================================== */

  const CANON_DIR = "NET/LESSONS";
  const EVIDENCE = [
    { folder:"writeups",  icon:"🏫", label:"class writeup",  key:"subject" },
    { folder:"reviews",   icon:"📝", label:"student review", key:"subject" },
    { folder:"summaries", icon:"📚", label:"study summary",  key:"title" }
  ];
  /* what the desk is holding right now. Kept out of the DOM so a re-render (a tab
     switch, a rebuild) never loses what the sovereign typed or what 99 returned. */
  const desk = { tab:"plan", topic:"", level:"", notes:"", specJson:"", spec:null, check:null, built:null,
                 busy:false, gen:null, plan:null, planFor:null, msg:"", evidence:[], savedId:null, stopped:false, storyline:null };

  function el(id){ return document.getElementById(id); }
  function clip(s, n){ s = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function say(msg){
    desk.msg = msg || "";
    const n = el("lcNote");
    if(n){ n.textContent = msg || ""; n.className = "lc-note" + (/^[⚠⛔]/.test(msg || "") ? " bad" : ""); }
  }
  function scrollBox(b){ try{ if(b) b.scrollTop = b.scrollHeight; }catch(e){} }
  function slugOf(s){ return String(s || "lesson").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "lesson"; }

  /* ------------------------------- 🧭 PLAN -------------------------------- */
  async function loadEvidence(limit){
    const out = [];
    for(const E of EVIDENCE){
      let rows = [];
      try{ rows = (await root.kv[E.folder].entries()).map(p => p[1]).filter(Boolean); }catch(e){ continue; }
      rows.filter(mine).sort((a, b) => (b.created || 0) - (a.created || 0)).slice(0, limit || 3)
        .forEach(r => out.push({ folder:E.folder, icon:E.icon, label:E.label, rec:r }));
    }
    return out;
  }
  /* PREFIX-CACHE FRIENDLY: the contract is byte-identical on every call, so the
     model only ever pays for the evidence and the sovereign's hint. */
  const PLAN_CONTRACT = [
"You are Agent 99, the NET Academy planner. You do NOT write the lesson here — you decide WHICH lesson comes next.",
"Read the EVIDENCE (a class writeup, a student review, a study summary, or the sovereign's own note) and choose the single most valuable next lesson for that class.",
"Return ONE compact single-line JSON object and nothing else:",
"{\"topic\":\"the next lesson, named as a teachable English skill\",\"why\":\"one sentence tying it to the evidence\",\"level\":\"level/age — from the evidence if it says, else a short guess\",\"notes\":\"what to load into the lesson: the exact mistakes, the phrases to drill, the register\",\"objectives\":[\"three concrete things the learner will be able to DO\"]}",
"The topic must be a SKILL the learner practises (asking good questions, softening a refusal, disagreeing politely, holding your turn in a group chat) — never a text, a page, or a bare category like 'grammar'.",
"Name the actual language the evidence shows they need. No preamble, no code fences, no line breaks inside strings. Keep the whole reply under 900 characters."
  ].join("\n");

  async function plan(evidenceText, hint){
    const instruction = PLAN_CONTRACT
      + "\n\n<EVIDENCE>\n" + clip(evidenceText, 6000) + "\n</EVIDENCE>"
      + (hint ? "\n<THE SOVEREIGN ASKS FOR>\n" + String(hint).trim() + "\n</THE SOVEREIGN ASKS FOR>" : "")
      + "\n\nReturn the JSON object only.";
    const res = await root.generateText({ instruction: instruction });
    const raw = (res && (res.generatedText || res.text)) || "";
    const p = parseSpec(raw);
    return p.ok ? p.spec : { topic:(hint || ""), why:"the plan did not parse (" + (p.why || "?") + ")", objectives:[] };
  }

  /* ------------------------------- ✍ BUILD ------------------------------- */
  async function generateFromFields(){
    if(desk.busy) return;
    const t = el("lcTopic"), l = el("lcLevel"), nt = el("lcNotes");
    if(t) desk.topic = t.value.trim();
    if(l) desk.level = l.value.trim();
    if(nt) desk.notes = nt.value.trim();
    if(!desk.topic){ say("⚠ Name the topic first — or plan one from evidence in the 🧭 Plan room."); return; }
    if(!root.generateText){ say("⚠ the ai-text plugin is not available."); return; }
    desk.busy = true; desk.spec = null; desk.check = null; desk.built = null; desk.savedId = null; desk.stopped = false;
    if(el("lcResult")) el("lcResult").innerHTML = "";
    setBusy(true);
    const out = el("lcStream");
    const call = async (instruction, label) => {
      let acc = "";
      try{
        desk.gen = root.generateText({
          instruction: instruction,
          onChunk: d => { acc = d.fullTextSoFar || acc; if(out) out.textContent = "…" + acc.slice(-600); scrollBox(out); }
        });
        const r = await desk.gen;
        return acc || (r && (r.generatedText || r.text)) || "";
      }catch(e){ return desk.stopped ? "" : "__ERR__ " + String((e && e.message) || e); }
      finally { desk.gen = null; }
    };
    const res = await compose(desk.topic, { level:desk.level || null, notes:desk.notes || null }, {
      call: call,
      progress: msg => say("📚 " + msg),
      stop: () => desk.stopped
    });
    desk.busy = false; setBusy(false);
    if(res.stopped){ say("⏹ Stopped on room " + (desk.built ? "?" : "") + " — nothing was saved. Build again when you are ready."); return; }
    if(res.err){ say("⛔ The build did not finish — " + res.err + ". Try again, or author the spec by hand below."); log({ kind:"op", action:"lesson build", ok:false, detail:desk.topic, result:"staged build failed: " + res.err }); return; }
    desk.spec = res.spec;
    desk.specJson = JSON.stringify(res.spec, null, 2);
    desk.storyline = res.storyline;
    finishBuild();
  }
  function finishBuild(){
    const spec = desk.spec;
    spec.topic = spec.topic || desk.topic;
    desk.topic = spec.topic;
    desk.savedId = null;
    desk.check = validate(spec);
    desk.built = build(spec);
    lastBuilt = desk.built;
    log({ kind:"op", action:"lesson build", ok:desk.check.ok, detail:spec.title + " on \"" + spec.topic + "\"",
      result:desk.check.rooms + " rooms · " + desk.built.bytes + " bytes · " + (desk.check.ok ? "check passed" : desk.check.errors.length + " failures") });
    say(desk.check.ok
      ? "✔ " + spec.title + " — built and checked (" + desk.check.rooms + " rooms · " + desk.built.bytes + " bytes)."
      : "⛔ " + spec.title + " was REFUSED by the validator — " + desk.check.errors.length + " failure(s), listed below. Fix the spec and build again.");
    paint();
    if(desk.check.ok && autoSave){
      save(spec, desk.built).then(rec => { desk.savedId = rec && rec.id || null; if(desk.tab === "build") paint(); });
    }
  }
  let autoSave = true;
  async function buildFromSpec(){
    const ta = el("lcSpec");
    if(ta) desk.specJson = ta.value;
    const p = parseSpec(desk.specJson);
    if(!p.ok){ say("⛔ That is not valid JSON — " + (p.why || "?")); return; }
    desk.spec = p.spec;
    desk.topic = p.spec.topic || desk.topic;
    finishBuild("manual");
  }

  /* ------------------------------ 🗂 LIBRARY ------------------------------ */
  async function byId(id){
    const rows = await records();
    return rows.filter(r => r.id === id)[0] || null;
  }
  async function removeRec(id){
    const f = folder();
    if(!f) return;
    try{ await f.delete(id); }catch(e){}
    try{ log({ kind:"delete", action:"lesson", detail:id, result:"removed from this browser" }); }catch(e){}
    say("🗑 Lesson " + id + " deleted.");
    paint();
  }
  async function pushToCanon(id){
    const rec = id ? await byId(id) : null;
    const spec = rec ? rec.spec : desk.spec;
    const html = rec ? rec.html : (desk.built && desk.built.html);
    if(!spec || !html){ say("⚠ Nothing built to push."); return; }
    const L = window.ObiILog;
    const R = (L && L.REPO) || {};
    if(!L || !L.gitCommitFiles || !R.owner){ say("⚠ src/ilog.js (the git primitive) is not loaded."); return; }
    if(window.omegaRequire && !(await window.omegaRequire("lesson push — " + (spec.title || "")))) return;
    const slug = slugOf(spec.title);
    const files = {};
    files[CANON_DIR + "/" + slug + ".html"] = html;
    files[CANON_DIR + "/" + slug + ".spec.json"] = JSON.stringify(spec, null, 2);
    say("📡 pushing " + slug + " to the canon…");
    const res = await L.gitCommitFiles({ owner:R.owner, repo:R.repo, branch:"master", files:files,
      message:"net academy lesson — " + (spec.title || slug) + " · " + new Date().toISOString() });
    if(res.pushed){
      say("✔ " + CANON_DIR + "/" + slug + ".html is on the canon · commit " + String(res.commitSha || "").slice(0, 8));
      log({ kind:"push", action:"lesson push", ok:true, detail:slug, result:res.pushed + " file(s) · " + String(res.commitSha || "").slice(0, 8), ref:res.commitSha });
    } else {
      say("⚠ Nothing was committed — " + ((res.errors || [])[0] || "no error text"));
      log({ kind:"push", action:"lesson push", ok:false, detail:slug, result:(res.errors || []).join(" · ").slice(0, 200) });
    }
    paint();
  }

  /* ------------------------------- the desk ------------------------------- */
  function tabBtn(id, label){ return '<button class="lctab' + (desk.tab === id ? " on" : "") + '" data-lctab="' + id + '">' + label + '</button>'; }
  function setBusy(on){
    const p = el("lessonPanel");
    if(p) p.classList.toggle("lc-busy", !!on);
    const g = p && p.querySelector('[data-lc="gen"]');
    if(g){ g.disabled = !!on; g.textContent = on ? "… writing" : "✨ Agent 99 writes the lesson"; }
  }
  function evidenceHTML(){
    const rows = desk.evidence;
    if(!rows.length) return '<div class="lc-empty">No evidence filed for <b>' + esc(clientName()) + '</b> yet — record a lesson and write it up in the 👤 Student Evaluator, then come back. You can still plan from your own note below.</div>';
    return '<div class="sel-group">The latest evidence for ' + esc(clientName()) + '</div>'
      + rows.map((e, i) => {
          const r = e.rec;
          const who = r.subject || r.title || "untitled";
          return '<div class="rrow"><b>' + e.icon + ' ' + esc(who) + ' — ' + esc(e.label) + '</b><span class="vd">' + esc(new Date(r.created || Date.now()).toLocaleDateString()) + '</span>'
            + '<div class="rd">' + esc(clip(r.text, 220)) + '</div>'
            + '<div class="lc-acts"><button class="ci-act" data-lc="from" data-id="' + i + '">🧠 Plan the next lesson from this ▸</button>'
            + '<button class="ci-act" data-lc="seed" data-id="' + i + '">✍ Fill in this subject as the topic</button></div></div>';
        }).join("");
  }
  function planOutHTML(){
    const p = desk.plan;
    if(!p) return "";
    return '<div class="rise" style="margin-top:12px"><div class="rhead">🧠 Agent 99 — the next lesson is: ' + esc(p.topic || "?") + '</div>'
      + '<div class="rrow"><b>WHY NOW</b><span class="vd"></span><div class="rd">' + esc(p.why || "") + '</div></div>'
      + (p.level ? '<div class="rrow"><b>LEVEL</b><span class="vd"></span><div class="rd">' + esc(p.level) + '</div></div>' : "")
      + (p.notes ? '<div class="rrow"><b>LOAD INTO IT</b><span class="vd"></span><div class="rd">' + esc(p.notes) + '</div></div>' : "")
      + ((p.objectives || []).length ? '<div class="rrow"><b>OBJECTIVES</b><span class="vd">' + p.objectives.length + '</span><div class="rd">' + p.objectives.map(o => "• " + esc(o)).join("<br>") + '</div></div>' : "")
      + '<div class="lc-acts">'
      + '<button class="ci-act primary" data-lc="use" data-topic="' + esc(p.topic || "") + '" data-level="' + esc(p.level || "") + '" data-notes="' + esc(p.notes || "") + '">✍ Build this lesson ▸</button>'
      + '<button class="ci-act" data-lc="replan">🔄 Ask again</button>'
      + '</div>'
      + '<div class="rfoot">The plan is the sovereign\'s call, not the model\'s. Edit the topic on the way in if you disagree — the ✍ Build room takes whatever you give it.</div></div>';
  }
  function planHTML(){
    return '<div class="hint" style="margin-top:12px">The loop: <b>the Student Evaluator records what happened</b> → the planner reads that evidence and names the next lesson → the builder writes it in the NET Academy format → the library keeps it, and the canon holds it beside the class. Nothing here is guessed: the planner is handed real writeups, reviews and summaries, scoped to the active client.</div>'
      + '<div id="lcEvidence">' + evidenceHTML() + '</div>'
      + '<div class="sel-group">Or say what it should fix yourself</div>'
      + '<div class="lc-form"><label class="lc-f"><span>What should the next lesson fix?</span>'
      + '<textarea id="lcPlanHint" class="lc-ta" rows="2" placeholder="e.g. they keep answering in one word — I want them holding a turn in a group conversation">' + esc(desk.planFor || "") + '</textarea></label>'
      + '<div class="lc-acts"><button class="ci-act primary" data-lc="plan">🧠 Ask Agent 99 to plan it</button></div></div>'
      + '<div id="lcPlanOut">' + planOutHTML() + '</div>';
  }
  function resultHTML(){
    if(!desk.spec || !desk.built) return "";
    const c = desk.check, b = desk.built;
    const rows = c.errors.map(x => '<div class="rrow bad"><b>FAIL</b><span class="vd">✖</span><div class="rd">' + esc(x) + '</div></div>').join("")
      + c.warnings.map(x => '<div class="rrow"><b>WARN</b><span class="vd">!</span><div class="rd">' + esc(x) + '</div></div>').join("");
    return '<div id="lcResult"><div class="rise" style="margin-top:12px"><div class="rhead">📚 ' + esc(desk.spec.title || "lesson") + (c.ok ? " — built and checked" : " — REFUSED") + '</div>'
      + '<div class="rrow"><b>SPEC</b><span class="vd">' + c.rooms + ' ROOMS</span><div class="rd">' + c.vocab + ' vocab · ' + c.blocks + ' choice blocks · ' + b.bytes + ' bytes of HTML · topic: ' + esc(desk.spec.topic || "") + '</div></div>'
      + rows
      + '<div class="lc-acts">'
      + '<button class="ci-act primary" data-lc="preview">▶ Preview</button>'
      + '<button class="ci-act" data-lc="dl">⬇ .html</button>'
      + '<button class="ci-act" data-lc="dlspec">📄 .spec.json</button>'
      + (desk.savedId ? '' : '<button class="ci-act" data-lc="save">🗂 Save to the library</button>')
      + '<button class="ci-act" data-lc="push">📡 Push to the canon</button>'
      + '</div>'
      + (desk.savedId && c.ok ? '<div class="rrow"><b>LIBRARY</b><span class="vd">' + esc(desk.savedId) + '</span><div class="rd">saved automatically for ' + esc(clientName()) + ' — open 🗂 Library to re-open, re-download or push it.</div></div>' : "")
      + (c.ok ? "" : '<div class="rfoot">A lesson that fails the check is not shipped (LSN-11). The spec is in the editor below — fix it and build again.</div>')
      + '</div></div>';
  }
  function buildHTML(){
    return '<div class="sel-group">The brief</div>'
      + '<div class="lc-form">'
      + '<label class="lc-f"><span>Topic — the skill the learner practises</span><input id="lcTopic" value="' + esc(desk.topic) + '" placeholder="asking good questions in class"></label>'
      + '<label class="lc-f"><span>Level / age <i>(optional)</i></span><input id="lcLevel" value="' + esc(desk.level) + '" placeholder="Year 8 · 13–14 · A2"></label>'
      + '<label class="lc-f"><span>Sovereign\'s notes — the exact language to load in <i>(optional)</i></span><textarea id="lcNotes" class="lc-ta" rows="2" placeholder="drill: «Do you mean…?» · they answer in one word, force a full sentence">' + esc(desk.notes) + '</textarea></label>'
      + '</div>'
      + '<div class="lc-acts"><button class="ci-act primary" data-lc="gen">✨ Agent 99 writes the lesson</button>'
      + '<button class="ci-act" data-lc="stop">⏹ Stop</button>'
      + '<button class="ci-act" data-lc="check">✅ Check the spec</button>'
      + '<label class="ci-act">📎 From deck (PDF)<input type="file" id="lcDeck" accept="application/pdf,.pdf" hidden></label></div>'
      + '<div class="hint">From deck: a slide-deck PDF fills the topic + notes above from its own words — parsed in this browser, never uploaded. Read the brief, change what you disagree with, then generate.</div>'
      + '<div id="lcStream" class="lc-stream"></div>'
      + resultHTML()
      + '<div class="sel-group">The spec <i>(exactly what Agent 99 returns — edit it and build again)</i></div>'
      + '<textarea id="lcSpec" class="lc-spec" spellcheck="false" placeholder=\'{"topic":"…","title":"…","logo":"❓","subtitle":"…","cta":"🚀 Begin Your Journey","features":[…],"coins":{"start":0,"correct":10,"wrong":0},"rooms":[…]} (see 📐 Standard)\'>' + esc(desk.specJson) + '</textarea>'
      + '<div class="lc-acts"><button class="ci-act" data-lc="buildspec">🔨 Build from this spec</button>'
      + '<button class="ci-act" data-lc="blank">🗎 Blank skeleton</button>'
      + '<button class="ci-act" data-lc="std">📐 Show me the standard</button></div>';
  }
  async function libraryHTML(){
    const rows = await records();
    if(!rows.length) return '<div class="lc-empty">Nothing built for <b>' + esc(clientName()) + '</b> yet. Build one in ✍ Build — every lesson that passes the check is saved here automatically.</div>';
    return '<div class="sel-group">' + rows.length + ' lesson(s) for ' + esc(clientName()) + ' <i>(kv · ' + KV_FOLDER + ')</i></div>'
      + rows.map(r => '<div class="lr-row"><div class="lr-top"><b>📚 ' + esc(r.title) + '</b><span class="lr-tag">' + esc(String(r.rooms)) + ' rooms · ' + Math.round((r.bytes || 0) / 1024) + ' KB</span></div>'
        + '<div class="lr-sub">' + esc(clip(r.topic || r.spec && r.spec.topic, 90)) + ' · ' + new Date(r.created).toLocaleString() + ' · ' + esc(r.id) + '</div>'
        + '<div class="lc-acts">'
        + '<button class="ci-act" data-lc="preview" data-id="' + esc(r.id) + '">▶ Preview</button>'
        + '<button class="ci-act" data-lc="dl" data-id="' + esc(r.id) + '">⬇ .html</button>'
        + '<button class="ci-act" data-lc="dlspec" data-id="' + esc(r.id) + '">📄 spec</button>'
        + '<button class="ci-act" data-lc="copy" data-id="' + esc(r.id) + '">✍ Copy to Build</button>'
        + '<button class="ci-act" data-lc="push" data-id="' + esc(r.id) + '">📡 Canon</button>'
        + '<button class="ci-act danger" data-lc="del" data-id="' + esc(r.id) + '">🗑 Delete</button>'
        + '</div></div>').join("");
  }
  async function paint(){
    const panel = el("lessonPanel");
    if(!panel) return;
    let body = "";
    if(desk.tab === "plan") body = planHTML();
    else if(desk.tab === "build") body = buildHTML();
    else if(desk.tab === "library") body = await libraryHTML();
    else body = standardHTML();
    panel.innerHTML = '<div class="lc-head"><div class="lc-title">📚 Lesson Creator <span class="lc-sub">NET · the NET Academy format</span></div>'
      + '<div class="hint">Turn this week\'s evidence into the next lesson — in the sovereign\'s own format, then checked against the standard before it is called done.</div>'
      + '<div class="lc-tabs">' + tabBtn("plan", "🧭 Plan") + tabBtn("build", "✍ Build") + tabBtn("library", "🗂 Library") + tabBtn("standard", "📐 Standard") + '</div>'
      + '<div id="lcNote" class="lc-note' + (/^[⚠⛔]/.test(desk.msg || "") ? " bad" : "") + '">' + esc(desk.msg || "") + '</div></div>'
      + '<div id="lcBody">' + body + '</div>';
    wire();
  }
  function wire(){
    const p = el("lessonPanel");
    if(!p) return;
    p.querySelectorAll("[data-lctab]").forEach(b => { b.onclick = () => { desk.tab = b.dataset.lctab; paint(); }; });
    p.querySelectorAll("[data-lc]").forEach(b => { b.onclick = () => { act(b.dataset.lc, b).catch(err => say("⚠ " + ((err && err.message) || err))); }; });
    const sync = (id, k) => { const e = el(id); if(e) e.addEventListener("input", () => { desk[k] = e.value; }); };
    sync("lcTopic", "topic"); sync("lcLevel", "level"); sync("lcNotes", "notes");
    const sp = el("lcSpec"); if(sp) sp.addEventListener("input", () => { desk.specJson = sp.value; });
    const ph = el("lcPlanHint"); if(ph) ph.addEventListener("input", () => { desk.planFor = ph.value; });
    const dk = el("lcDeck");
    if(dk) dk.addEventListener("change", () => { deckFromFile(dk.files && dk.files[0]).catch(function(err){ say("⛔ " + ((err && err.message) || err)); }); });
  }
  /* THE DECK INTAKE (plug-and-play): a slide-deck PDF → the Build brief.
     Parsed in this browser (src/deck.js, pdf.js CDN); the file never leaves
     the machine. Fills topic + notes, then hands back control — the sovereign
     reads the brief and generates. */
  async function deckFromFile(file){
    if(!file) return;
    if(!window.ObiDeck){ say("⚠ The deck reader did not load — reload the page and try again."); return; }
    if(!/\.(pdf|pptx)$/i.test(file.name || "")){ say("⚠ Only PDF and PPTX decks for now — «" + file.name + "» is not one."); return; }
    say("📎 Reading «" + file.name + "» (" + Math.round(file.size / 1024) + " KB) in this browser…");
    var ex;
    try{ ex = /\.pptx$/i.test(file.name || "") ? await window.ObiDeck.extractPptx(file) : await window.ObiDeck.extractPdf(file); }
    catch(e){ say("⛔ Could not read that deck — " + String((e && e.message) || e).slice(0, 200)); return; }
    if(!ex.text){ say("⚠ That deck has no selectable text (" + ex.pageCount + " page(s) — scanned images, most likely). Paste the lesson words into the notes by hand, or run it through transcription first."); return; }
    var b = (/\.pptx$/i.test(file.name || "") ? window.ObiDeck.briefFromPptx(file.name, ex) : window.ObiDeck.briefFromPdf(file.name, ex));
    desk.topic = b.topic;
    desk.notes = b.notes;
    log({ kind:"op", action:"lesson deck intake", ok:true, detail:file.name, result:ex.pagesRead + "/" + ex.pageCount + " page(s) · brief filled" });
    say("📎 Brief filled from «" + file.name + "» — " + ex.pagesRead + " of " + ex.pageCount + " page(s)" + (b.clipped ? " (deck words clipped to fit the build)" : "") + ". Read it, change what you disagree with, then ✨ generate.");
    paint();
  }
  async function act(name, btn){
    const id = btn && btn.dataset ? btn.dataset.id : null;
    if(name === "from" || name === "seed"){
      const e = desk.evidence[Number(id)];
      if(!e){ say("⚠ That evidence is no longer loaded — switch to 🧭 Plan to refresh."); return; }
      const who = e.rec.subject || e.rec.title || "";
      if(name === "seed"){ desk.topic = who; desk.tab = "build"; say("✍ Topic set to \"" + who + "\" — sharpen it into a skill before building."); paint(); return; }
      desk.plan = null; paint();
      say("🧠 Agent 99 is reading the " + e.label + "…");
      const p = await plan(String(e.rec.text || "").slice(0, 6000), "the evidence is a " + e.label + " for " + who);
      desk.plan = p;
      say("🧠 Planned from " + who + " — " + (p.topic || "?"));
      log({ kind:"op", action:"lesson plan", ok:!!p.topic, detail:who + " · " + e.label, result:p.topic || "no topic" });
      paint();
      return;
    }
    if(name === "plan"){
      const hint = (el("lcPlanHint") && el("lcPlanHint").value || "").trim();
      const seed = desk.evidence.map(e => (e.rec.subject || e.rec.title || "") + " (" + e.label + "): " + clip(e.rec.text, 900)).join("\n\n");
      if(!hint && !seed){ say("⚠ Nothing to plan from — file some evidence in the 👤 Student Evaluator, or type what the lesson should fix."); return; }
      desk.plan = null; paint();
      say("🧠 Agent 99 is reading the evidence…");
      const p = await plan(seed, hint);
      desk.plan = p;
      say("🧠 The next lesson: " + (p.topic || "?"));
      log({ kind:"op", action:"lesson plan", ok:!!p.topic, detail:hint || "from the filed evidence", result:(p.topic || "no topic") + " · " + ((p.objectives || []).length) + " objective(s)" });
      paint();
      return;
    }
    if(name === "replan"){ await act("plan", btn); return; }
    if(name === "use"){
      desk.topic = btn.dataset.topic || desk.topic;
      desk.level = btn.dataset.level || desk.level;
      desk.notes = btn.dataset.notes || desk.notes;
      desk.tab = "build";
      say("✍ The brief is loaded — read it, change what you disagree with, then let 99 write it.");
      paint();
      return;
    }
    if(name === "gen"){ await generateFromFields(); return; }
    if(name === "stop"){ desk.stopped = true; if(desk.gen && desk.gen.stop) desk.gen.stop(); say("⏹ Stopping…"); return; }
    if(name === "buildspec"){ await buildFromSpec(); return; }
    if(name === "blank"){
      desk.specJson = JSON.stringify(BLANK, null, 2);
      desk.spec = null; desk.check = null; desk.built = null;
      say("🗎 A skeleton with the six rooms already in order — replace the words, keep the shape. Build it to see the check pass, then make it yours.");
      paint();
      return;
    }
    if(name === "std"){ desk.tab = "standard"; paint(); return; }
    if(name === "check"){
      const ta = el("lcSpec"); if(ta) desk.specJson = ta.value;
      const p = parseSpec(desk.specJson);
      if(!p.ok){ say("⛔ Not valid JSON — " + (p.why || "?")); return; }
      desk.spec = p.spec; finishBuild("check");
      return;
    }
    if(name === "save"){
      if(!desk.spec || !desk.built){ say("⚠ Nothing built to save."); return; }
      const rec = await save(desk.spec, desk.built);
      say(rec ? "🗂 Saved to the library as " + rec.id + "." : "⚠ Could not save.");
      return;
    }
    const rec = id ? await byId(id) : null;
    if(name === "preview"){
      const html = rec ? rec.html : desk.built && desk.built.html;
      const title = rec ? rec.title : desk.spec && desk.spec.title;
      if(!html){ say("⚠ Nothing to preview."); return; }
      openPreview(html, title);
      return;
    }
    if(name === "dl"){
      const html = rec ? rec.html : desk.built && desk.built.html;
      if(!html){ say("⚠ Nothing to download."); return; }
      download(html, fileName(rec ? (rec.spec || { title:rec.title }) : desk.spec));
      return;
    }
    if(name === "dlspec"){
      const spec = rec ? rec.spec : desk.spec;
      if(!spec){ say("⚠ No spec to download."); return; }
      download(JSON.stringify(spec, null, 2), fileName(spec).replace(/\.html$/, ".spec.json"), "application/json");
      return;
    }
    if(name === "copy"){
      if(!rec || !rec.spec){ say("⚠ That record has no spec stored."); return; }
      desk.spec = rec.spec; desk.specJson = JSON.stringify(rec.spec, null, 2);
      desk.topic = rec.spec.topic || rec.topic || ""; desk.level = ""; desk.notes = "";
      desk.check = null; desk.built = null; desk.tab = "build";
      say("✍ Loaded \"" + rec.title + "\" into the builder — change what you want and build again.");
      paint();
      return;
    }
    if(name === "push"){ await pushToCanon(id); return; }
    if(name === "del"){
      if(!rec) return;
      if(!window.confirm("Delete the lesson \"" + rec.title + "\" from this browser? The canon copy (if you pushed one) is untouched.")) return;
      await removeRec(rec.id);
      return;
    }
  }
  /* a skeleton the sovereign can fill in by hand — the spine, in order, with the
     labels the validator insists on and every required field non-empty, so authoring
     by hand starts from something that already passes the check (replace the words,
     keep the shape). */
  const BLANK = { topic:"", title:"Template Lesson — replace this title", logo:"📚",
    subtitle:"One line of promise, ending with a wink ✨", cta:"🚀 Begin Your Journey",
    features:[{ icon:"🏠", title:"6 Interactive Rooms", desc:"Entrance → two scenes → the words → the test → the key." },
              { icon:"🎯", title:"Practice Mode", desc:"Clickable scenarios that score, so they find out by doing." },
              { icon:"🔑", title:"Unlock Mastery", desc:"They leave with the rule in their own words, not your notes." }],
    coins:{ start:0, correct:10, wrong:0 },
    rooms:[
      { graphic:"🏠", title:"The Entrance", label:"Warm-Up", content:"<p>Welcome! …</p><ul><li>…</li><li>…</li><li>…</li></ul>" },
      { graphic:"🖥️", title:"The Scene", label:"Scene", content:'<div class="dialogue-block"><span class="speaker">Name:</span> …</div>' },
      { graphic:"📱", title:"The Group Chat", label:"Text Scene", content:'<div class="dialogue-block"><span class="speaker">Name:</span> …</div><div class="chatty-clue">🤔 Reality check: …</div><div class="chatty-hint"><strong>Pro Tip:</strong> …</div>' },
      { graphic:"📚", title:"The Words", label:"Learn", content:'<div class="vocab-list"><div class="vocab-item"><strong>1. Term:</strong> <span>one line</span></div><div class="vocab-item"><strong>2. Term:</strong> <span>one line</span></div><div class="vocab-item"><strong>3. Term:</strong> <span>one line</span></div><div class="vocab-item"><strong>4. Term:</strong> <span>one line</span></div><div class="vocab-item"><strong>5. Term:</strong> <span>one line</span></div></div>' },
      { graphic:"🎯", title:"The Test", label:"Test", content:'<div class="chatty-choices" data-correct-feedback="Yes — and here is why." data-wrong-feedback="Not quite — read the rule again: …"><div><strong>Scenario:</strong> …</div><button data-answer="correct">…</button><button data-answer="wrong">…</button></div><div class="chatty-feedback empty"></div>' },
      { graphic:"🔑", title:"The Key", label:"Mastery", content:'<div class="summary-card"><strong>🎓 You now hold the key</strong><ul><li><strong>Rule:</strong> …</li><li><strong>Rule:</strong> …</li><li><strong>Rule:</strong> …</li></ul></div><div class="chatty-hint"><strong>Level Up:</strong> …</div>' }
    ] };

  function mount(opts){
    const panel = el("lessonPanel");
    if(!panel) return false;
    if(opts && opts.tab) desk.tab = opts.tab;
    paint();
    if(desk.tab === "plan" && !desk.evidence.length){
      loadEvidence().then(rows => { desk.evidence = rows; if(desk.tab === "plan") paint(); });
    }
    return true;
  }
  function openDesk(tab){
    try{ if(window.Obi && window.Obi.view && window.Obi.view.show) window.Obi.view.show("lesson"); }catch(e){}
    return mount({ tab:tab });
  }

  let lastBuilt = null;
  window.ObiLessons = {
    run: run, build: build, validate: validate, compose: compose, SHELL_CONTRACT: SHELL_CONTRACT, ROOM_CONTRACT: ROOM_CONTRACT,
    standard: standard, standardHTML: standardHTML, library: list, save: save, THEME: THEME, CLASSES: CLASSES, SPINE: SPINE,
    preview: openPreview, download: download, fileName: fileName, tidyHTML: tidyHTML, roomSane: roomSane,
    lastBuild: () => lastBuilt,
    /* the desk (◈ Phoenix Generators → NET → 📚 Lesson Creator) */
    mount: mount, openDesk: openDesk, act: act, plan: plan, push: pushToCanon,
    records: records, remove: removeRec, desk: desk, blank: BLANK,
    STANDARD: STANDARD, REFS: REFS, REF_DIR: REF_DIR, KV_FOLDER: KV_FOLDER, CANON_DIR: CANON_DIR,
    refs: () => REFS.map(r => REF_DIR + r)
  };

  /* IF THE PAGE BOOTED STRAIGHT INTO THE DESK (a reload while the Lesson Creator is
     open, or #lesson in the URL) the app already ran its own openView BEFORE this
     file loaded — so there was nothing to mount into it. Paint now, and let every
     later view change repaint normally. */
  try{
    if(window.Obi && window.Obi.view && window.Obi.view.current && window.Obi.view.current() === "lesson") mount();
  }catch(e){}
})();
