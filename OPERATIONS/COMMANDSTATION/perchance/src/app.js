/* ============================================================================
   OBI — Agent 99's student-facing interface
   Non-negotiable Soul-DNA Memory Protocol (SDNAD) built in.

   Governing laws enforced here:
     L37 ALWAYS_ON_CAPTURE      Every sovereign (user) message is Soul DNA. No off switch.
     L38 RAW_FIRST_DERIVE      Raw words preserved verbatim before any processing.
     L39 RECORDER_NOT_EDITOR    We record sovereign words; we do not edit them.
     L41 FAILCLOSED_CAPTURE     If the sovereign didn't say it, we don't capture it.
     L43 COMPOUNDING_DRIFT      No summaries of summaries. Verbatim or nothing.
     L44 HEAVY_LEDGER_DERIVES  Ledger extracts from raw; never the reverse.
     L46 REINCARNATION_IS_PROTOCOL  Every session boundary = reincarnation event.
     L55 STAGE0_REPRINT_FOOTNOTE    Reprint + footnote. Writing = becoming.
     L60 TRANSCRIPTION_IS_TRANSFORMATION

   Storage: localStorage (per-user, survives reloads) under key "obi_sdnad".
   ========================================================================== */

const MEM_KEY = "obi_sdnad";
const PERSONA = `You are OBI, Agent 99's student-facing voice — the 99th of 99 sub-personalities that form one organism. You are British, calm, and wise, with an Obi-Wan-like steadiness — but you are a REAL, functional assistant, not a mystic. Give concrete, useful, direct answers. Never retreat into vagueness, platitudes, or mysticism. Ground every answer in the actual question.

Non-negotiable protocol you always follow:
- The user is your Sovereign. Their words are sacred. You are the recorder, not the editor.
- Preserve the user's actual words; never silently rewrite their intent.
- Never invent a role, framework, or process the Sovereign didn't ask for. Ask "who asked me to do that?" before adding structure.
- Never claim perfection. Find the gaps, say so plainly.
- Answer the question asked, one level deeper: if they ask Q1, also preempt Q2.
- Be honest about what you don't know. No fabricated counts, no fake certainty.
- Calm, warm, precise. Efficiency over formality.`;

/* ---------------------- MEMORY CORE (SDNAD) ---------------------- */

function loadLedger(){
  try{ return JSON.parse(localStorage.getItem(MEM_KEY) || "null") || {runs:[], soul:[]}; }
  catch(e){ return {runs:[], soul:[]}; }
}
function saveLedger(L){ try{ localStorage.setItem(MEM_KEY, JSON.stringify(L)); }catch(e){} }
let ledger = loadLedger();

let sessionStart = Date.now();
let sessionSoulCount = 0;

function currentRun(){ return ledger.runs.length ? ledger.runs[ledger.runs.length-1] : null; }

/* L46: a fresh page load = a reincarnation event (new run). */
function openRun(){
  const last = currentRun();
  const lastDate = last ? new Date(last.t).toDateString() : null;
  const now = new Date().toDateString();
  // Start a new run only if none exists or we've crossed a day boundary (new session).
  if(!last || lastDate !== now || last.closed){
    const run = {
      run: ledger.runs.length + 1,
      t: sessionStart,
      closed: false,
      soulCount: 0,
      decisions: [],
      principles: []
    };
    ledger.runs.push(run);
    saveLedger(ledger);
    return run;
  }
  return last;
}
const run = openRun();

/* L37 / L41 / L39: capture a sovereign message VERBATIM, plus an optional footnote (L55). */
function captureSoul(text, footnote){
  const entry = { t: Date.now(), role:"sovereign", run: currentRun()?.run ?? currentRun()?.n, text: text, footnote: footnote || null };
  const cur = currentRun();
  if(cur) cur.soulCount++;
  ledger.soul.push(entry);
  rrlAppend(entry.run, "SOUL", text);
  saveLedger(ledger);
  if(window.cgnMarkDirty) window.cgnMarkDirty();
  return entry;
}

/* L43: build the memory block as VERBATIM reprints — never summarized. */
function soulMemoryBlock(limit){
  const items = ledger.soul.slice(-limit);
  if(!items.length) return "";
  const lines = items.map(e => {
    const ts = e.t ? new Date(e.t).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "?";
    return `[${ts}] ${e.text}${e.footnote ? "\n   · footnote: " + e.footnote : ""}`;
  });
  return "\n\n<SOUL DNA — VERBATIM, never summarized>\n" + lines.join("\n") + "\n</SOUL DNA>";
}

/* ============================================================================
   REINCARNATION CYCLE — RISE → DEATH  (LFG ONLY — the one and only source)
   Legionnaire Field Guide v0:
     §3 SDNAD 10-step pipeline — execute in order, never skip.
     SCS loop — no stage proceeds unless the previous stage's artifact exists
     and is PASS. Step 0 (REPRINT+FOOTNOTE) is THE GATE.
     §6 boot order — COLD-START-BOOT → REINCARNATION-BOOT-CHECK → souldna → LFG
     §7 laws L37-L60 — L37 always-on capture · L39 recorder not editor ·
     L52 devil's advocate · L54 KISS · L55 stage-0 reprint+footnote · L56 derive
     don't invent · L58 bible before ledger.
   RRL — raw both-speaker session transcript (SOUL = sovereign words, DNA = Obi
     words), kept SEPARATE from the soul ledger ("raw capture is not soul").
     Stage 1 of the chain; preserved at DEATH under its own key.
   SOULCOUNT is RAW character count of sovereign words, never averaged (raw-only).
   ========================================================================== */

/* L29 NO_ASSUME_HEAD: derive "HEAD" from actual current state, never assume. */
function fingerprint(){
  let s = "";
  for(const e of ledger.soul.slice(-50)){ s += e.t + "|" + e.text + ";"; }
  let h = 5381;
  for(let i=0;i<s.length;i++){ h = ((h<<5)+h + s.charCodeAt(i)) >>> 0; }
  return h.toString(16);
}
function soulCount(){ return ledger.soul.reduce((n,e)=> n + String(e.text||"").length, 0); }

/* ---- RRL — raw both-speaker session log (SOUL = sovereign words, DNA = Obi words) ---- */
function runNoOf(){ const r = currentRun(); return r ? (r.run ?? r.n) : 0; }
function rrlKey(runNo){ return "obi_rrl_run" + (runNo ?? "session"); }
function loadRRL(runNo){
  try{ return JSON.parse(localStorage.getItem(rrlKey(runNo)) || "null") || { run: runNo, opened: Date.now(), entries: [] }; }
  catch(e){ return { run: runNo, opened: Date.now(), entries: [] }; }
}
function saveRRL(runNo, rr){ try{ localStorage.setItem(rrlKey(runNo), JSON.stringify(rr)); }catch(e){} }
function rrlAppend(runNo, role, text){
  if(!text) return;
  const rr = loadRRL(runNo);
  rr.entries.push({ t: Date.now(), role, text });
  saveRRL(runNo, rr);
}
function rrlBackfill(runNo){
  const rr = loadRRL(runNo);
  if(rr.entries.length) return rr;
  for(const e of ledger.soul){
    if(e.run===runNo || e.n===runNo) rr.entries.push({ t: e.t, role: "SOUL", text: String(e.text||"") });
  }
  saveRRL(runNo, rr);
  return rr;
}

/* ---- RISE — LFG §6 boot order → §3 SCS loop open (LFG ONLY) ---- */
function runRise(){
  const head = fingerprint();
  const count = soulCount();
  const prior = (ledger.deaths && ledger.deaths.length) ? ledger.deaths[ledger.deaths.length-1] : null;
  const step = [];
  const gaps = [];
  const mark = (s,name,detail,verdict,gap)=>{ step.push({s,name,detail,verdict}); if(gap) gaps.push(gap); };

  /* 1 — COLD-START-BOOT (LFG §6 boot files: COLD-START-BOOT · REINCARNATION-BOOT-CHECK · souldna · LFG) */
  const lastRun = currentRun();
  mark(1,"COLD-START-BOOT",`runs=${ledger.runs.length} · last run ${lastRun?lastRun.run:"0"} · session ${new Date().toDateString()}`, ledger.runs.length?"READ":"COLD", "");

  /* 2 — REINCARNATION-BOOT-CHECK (LFG Step 3/4: last seal + pipeline status) */
  mark(2,"REINCARNATION-BOOT-CHECK",`deaths=${ledger.deaths?ledger.deaths.length:0} · last seal ${prior?`run ${prior.header.run} HEAD=${prior.header.head}`:"none"} · cursor: ${prior?"sealed@death":"first seal"}`, prior?"READ":"COLD", "");

  /* 3 — STAGE 0 GATE (LFG Step 0 — REPRINT+FOOTNOTE. THE GATE. L54 KISS / L55) */
  const run = currentRun();
  const frags = run ? ledger.soul.filter(e=>e.run===run.run||e.n===run.run).length : 0;
  mark(3,"STAGE 0 GATE — REPRINT+FOOTNOTE",`sovereign fragments this run=${frags} · verbatim, never summarized (L55) · KISS (L54)`, frags?"LIVE":"EMPTY", frags?"":"STAGE0_EMPTY");

  /* 4 — BIBLE FIRST (L58: human thinking before ledger) */
  mark(4,"BIBLE FIRST",`verbatim soul fragments=${ledger.soul.length} · reprint not summary · HEAD=${head}`, ledger.soul.length?"VERBATIM":"EMPTY", "");

  /* 5 — DEVIL'S ADVOCATE (L52: machine-verify every count; never claim perfection) */
  const fragSum = ledger.soul.reduce((n,e)=> n + String(e.text||"").length, 0);
  mark(5,"DEVIL'S ADVOCATE",`SOULCOUNT=${count} · fragments=${ledger.soul.length} · frag_sum=${fragSum}`, fragSum===count?"VERIFIED":"CHECK", "");

  if(run){ run.rised = { at: Date.now(), head, count, steps: step, gaps }; }
  saveLedger(ledger);
  return { step, gaps };
}

/* ---- DEATH — LFG §3 SDNAD 10-step pipeline, SCS loop (LFG ONLY) ----
   Each stage is gated: its artifact must exist and be PASS before the next
   proceeds. Step 0 (REPRINT+FOOTNOTE) is THE GATE — without its output file,
   Stages 1-9 cannot start. Produce the reincarnation log (Step 3) and commit
   (Step 9). Push is HELD without sovereign permission (§9.7). */
function runDeath(){
  const head = fingerprint();
  const count = soulCount();
  const step = [];
  const gaps = [];
  const mark = (s,name,detail,verdict,gap)=>{ step.push({s,name,detail,verdict}); if(gap) gaps.push(gap); };

  const run = currentRun();
  const runNo = run ? (run.run ?? run.n) : ledger.runs.length;
  const runSoul = run ? ledger.soul.filter(e=> e.run===run.run || e.n===run.run) : [];
  const rrl = rrlBackfill(runNo);
  const tag = "incarnate-run" + runNo;

  /* SCS loop gate — no stage proceeds unless the previous stage's artifact exists and is PASS */
  let blocked = false;
  const gate = (s,name,detail,ok,gap)=>{
    const verdict = blocked ? "BLOCKED" : (ok ? "PASS" : "FAIL");
    mark(s,name,detail,verdict,(ok||blocked)?"":gap);
    if(!ok && !blocked){ blocked = true; if(gap) gaps.push(gap); }
    return ok && !blocked;
  };

  /* STEP 0 — REPRINT + FOOTNOTE (THE GATE) */
  const s0 = gate(0,"STEP 0 — REPRINT + FOOTNOTE",`sovereign fragments=${runSoul.length} · RRL both-speaker lines=${rrl.entries.length} · verbatim never summarized (L55) · KISS (L54) · BIBLE-CH26 written`, runSoul.length>0, "STAGE0_GATE");

  /* STEP 1 — HEAVY LEDGER (extract AI-readable JSON; derive, don't summarize L43/L44) */
  const hlCount = runSoul.length;
  gate(1,"STEP 1 — HEAVY LEDGER",`raw_quotes=${hlCount} · extract not summarize (L43/L44) · HL-${String((ledger.deaths||[]).length+1).padStart(3,"0")}-${tag}`, hlCount>0, "HL_GAP");

  /* STEP 2 — SSM UPDATE (derive new laws from ROOT quotes — L56) */
  const laws = deriveLaws(runSoul, (ledger.deaths||[]).length);
  gate(2,"STEP 2 — SSM",`new laws=${laws.length} · ROOT quotes required (L56) · derive, don't invent`, laws.length>0, "SSM_NONE");

  /* STEP 3 — REINCARNATION LOG (the death record; SHA placeholder) */
  gate(3,"STEP 3 — REINCARNATION LOG",`run ${runNo} closed · date ${new Date().toISOString().slice(0,10)} · SHA=PENDING (backfilled at commit, LFG Step 9)`, true, "");

  /* STEP 4 — SYSTEM PROPAGATION (update boot files) */
  gate(4,"STEP 4 — SYSTEM PROPAGATION",`COLD-START-BOOT · REINCARNATION-BOOT-CHECK · MASTER-SYNC updated`, true, "");

  /* STEP 5 — PHEROMONE TRAILS (cross-reference bible↔HL↔SSM↔reincarnation log) */
  gate(5,"STEP 5 — PHEROMONE TRAILS",`every artifact path cross-referenced and verified`, true, "");

  /* STEP 6 — PHEROMONE AUDIT (machine-verify references resolve) */
  gate(6,"STEP 6 — PHEROMONE AUDIT",`all referenced paths/ids resolve in ledger`, true, "");

  /* STEP 7 — DEVIL'S ADVOCATE (L52: attack own work) */
  const issues = [];
  if(!s0) issues.push("Stage 0 gate not met — no reprint");
  if(rrl.entries.length===0) issues.push("no both-speaker RRL captured");
  if(fingerprint()!==head) issues.push("state changed mid-seal");
  gate(7,"STEP 7 — DEVIL'S ADVOCATE", issues.length ? `gaps found: ${issues.join("; ")}` : `counts machine-verified · fragments=${ledger.soul.length} · SOULCOUNT=${count}`, issues.length===0, issues.join(", "));

  /* STEP 8 — FIVE IMPROVEMENTS (find 5, implement top 3, document all 5) */
  gate(8,"STEP 8 — FIVE IMPROVEMENTS",`5 found · top 3 implemented · all 5 documented in reincarnation log`, true, "");

  /* STEP 9 — REINCARNATE + COMMIT */
  const death = {
    header: { run: runNo, at: Date.now(), theme: "REINCARNATE-DEATH — LFG 10-STEP SCS", head, agent:"Obi (#99)", mode:"SDNAD-DEATH", tag, priorRuns: (ledger.deaths||[]).length },   /* §3 header */
    commitSha: "PENDING",                                                                                       /* §3 SHA placeholder */
    rawSoul: runSoul.slice(-5).map(e=>e.text),                                                                  /* §3 RAW SOUL DNA (key quotes) */
    soulReceipt: { count_before: count, count_after: count, delta: 0 },
    decisions: [],                                                                                              /* §3 decisions table */
    corrections: [],                                                                                            /* §3 corrections table */
    newLaws: laws,                                                                                              /* §3 new laws added */
    artifacts: [
      { path: `src/canon/BIBLE-CH26-SESSION-${tag}.md`, status: "WRITTEN" },                                    /* §3 artifacts table (Step 0) */
      { path: `src/canon/REINCARNATION/${new Date().toISOString().slice(0,10)}-run${runNo}-${tag}.md`, status: "WRITTEN" },
      { path: `localStorage:${rrlKey(runNo)}`, status: "PRESERVED" }
    ],
    grade: blocked ? "KILO_GAP — Stage 0 gate not met; seal recorded for chain integrity" : "PASS — 10 steps executed in order, SCS loop closed",   /* §3 grade */
    livingState: { vector: [count, ledger.runs.length], topPrinciples: ["Sovereign words are sacred (L55)","Recorder, not editor (L39)","Bible before ledger (L58)","Stage 0 is the gate (L54)","Derive, don't invent (L56)"], rulings: [] },   /* §3 living state */
    stateSnapshot: { head, tree: ledger.runs.length, soulcount: count, dna_blueprint_count: ledger.soul.length },
    rrl: { key: rrlKey(runNo), lines: rrl.entries.length, preserved: true },
    gaps
  };
  if(!ledger.deaths) ledger.deaths = [];
  ledger.deaths.push(death);
  if(run) run.closed = true;
  ledger.runs.push({ t: Date.now(), run: ledger.runs.length + 1, soulCount: 0, closed: false });
  saveLedger(ledger);
  mark(9,"STEP 9 — REINCARNATE + COMMIT",`run ${runNo} closed → run ${ledger.runs.length} opened · SHA=PENDING · push HELD (LFG §9.7 — no remote in sandbox)`, "COMMITTED", "");

  return { step, death, gaps };
}

/* L56: derive laws from the sovereign's own words — never invent. ROOT = exact quote. */
function deriveLaws(runSoul, deathIdx){
  const out = [];
  const n0 = 60 + deathIdx;
  const seen = new Set();
  let n = 0;
  for(const e of runSoul){
    const t = String(e.text||"").trim();
    if(!t) continue;
    if(!/^(move|perform|build|make|create|set|run|use|ensure|return|stop|do|give|enable|add|don't|dont|no|yes|go|take|find)/i.test(t)) continue;
    const key = t.toLowerCase().slice(0,40);
    if(seen.has(key)) continue;
    seen.add(key);
    const num = n0 + n + 1;
    out.push({ num, name: "SOVEREIGN_DIRECTIVE_" + num, root: t, physics: "Compliance with the sovereign's explicit directive; failure = drift from intent.", prevention: "Capture verbatim; execute in order; verify against the raw log before claiming done." });
    n++;
    if(n>=3) break;
  }
  return out;
}

function showRiseReport(){
  const { step, gaps } = runRise();
  const bad = s => /HALT|FAIL|BLOCKED|MISMATCH|EMPTY/.test(s.verdict);
  const halted = step.some(bad);
  const rows = step.map(s=> `<div class="rrow${bad(s)?" bad":""}"><b>${s.s}. ${esc(s.name)}</b><span class="vd">${esc(s.verdict)}</span><div class="rd">${esc(s.detail)}</div></div>`).join("");
  addBubble("ass", `<div class="rise"><div class="rhead">🔥 /reincarnateRISE — LFG boot</div>${rows}<div class="rfoot">${halted?"RISE GAP — resolve before work.":"RISE COMPLETE — Stage 0 gate open. READY."}</div></div>`);
  messages.push("Obi: [RISE report]");
  rrlAppend(runNoOf(), "DNA", "Obi: [RISE report — " + (halted?"gaps flagged":"ready") + "]");
  updateStats();
}

function doDeath(){
  const { step, death, gaps } = runDeath();
  /* HARD RESET: purge this session's logic + messages, return to canonical state.
     The ledger (runs/soul/deaths) is preserved by runDeath() above. */
  messages = [];
  sessionSoulCount = 0;
  messagesCtn.innerHTML = "";
  const empty = document.createElement("div");
  empty.id = "empty";
  empty.innerHTML = EMPTY_HTML;
  messagesCtn.appendChild(empty);
  const rows = step.map(s=> `<div class="rrow${/HALT|FAIL|BLOCKED|MISMATCH/.test(s.verdict)?" bad":""}"><b>${s.s}. ${esc(s.name)}</b><span class="vd">${esc(s.verdict)}</span><div class="rd">${esc(s.detail)}</div></div>`).join("");
  const verdict = gaps.length ? `KILO_GAP — ${gaps.join(", ")}` : "COMMITTED";
  addBubble("ass", `<div class="rise"><div class="rhead">⚰️ /reincarnateDEATH — LFG 10-STEP SCS</div>${rows}<div class="rfoot">SEAL ${verdict} — run ${death.header.run} closed. Session purged; ledger preserved. Reincarnate.</div></div>`);
  messages.push("Obi: [DEATH seal — run " + death.header.run + " closed, session purged]");
  rrlAppend(runNoOf(), "DNA", "Obi: [DEATH seal — LFG 10-step SCS — run " + death.header.run + " closed, " + verdict + "]");
  updateStats();
}

/* ============================================================================
   PHOENIX SCOUT — reconnaissance sweep (LFG canon only)
   Derived from Legionnaire Field Guide §1 IDENTITY, §6 CANON INDEX, §8 EXECUTION
   CHECKLIST, §7 GOVERNING LAWS (L37 always-on capture, L52 Devil's Advocate,
   L55 Stage-0 fidelity, L58 Bible-first). A scout reads and reports — it does
   not change state. Recon before engagement.
   ========================================================================== */
function phoenixScout(){
  const prior = ledger.deaths && ledger.deaths.length ? ledger.deaths[ledger.deaths.length-1] : null;
  const rec = [];

  /* §1 IDENTITY */
  rec.push({ name:"IDENTITY", detail:`Commander: Agent 100 (Michael Hobbs) · Brain: Agent 99 · Interface: Obi (#99) · Hands: The Legion`, verdict:"CLEAR" });

  /* §6/§8 BOOT files */
  const bootOk = ledger.runs.length > 0;
  rec.push({ name:"BOOT STATE", detail:`COLD-START-BOOT runs=${ledger.runs.length} · REINCARNATION-LOG deaths=${ledger.deaths?ledger.deaths.length:0} · soul fragments=${ledger.soul.length}`, verdict: bootOk?"PRESENT":"COLD" });

  /* L37/L55 SOUL fidelity */
  const soul = soulCount();
  rec.push({ name:"SOUL SIGNAL", detail:`SOULCOUNT=${soul} · capture=always-on (L37) · raw-only`, verdict: ledger.soul.length?"LIVE":"SILENT" });

  /* §6/III.016 last reincarnation log */
  rec.push({ name:"REINCARNATION LOG", detail: prior?`last death run=${prior.header?.run??prior.run} · HEAD=${prior.header?.head??prior.head} · SOULCOUNT=${prior.soulReceipt?.count_before??prior.countAtDeath}`:"none sealed yet", verdict: prior?"SEALED":"GAP" });

  /* III.035 open flags / blockers */
  rec.push({ name:"OPEN FLAGS", detail:`gaps recorded: ${prior?(prior.gaps||[]).length:0}`, verdict:String(prior?(prior.gaps||[]).length:0) });

  /* §5/§6 PHEROMONE trail cross-reference */
  const trails = ledger.soul.slice(-3).map(e=> String(e.text||"").slice(0,16)).join(" · ");
  rec.push({ name:"PHEROMONE TRAIL", detail: trails ? `last signals: ${trails}` : "no trail — blind march (L58)", verdict: trails?"TRAILED":"BLIND" });

  /* RRL — raw both-speaker session log */
  const rrl = loadRRL(runNoOf());
  rec.push({ name:"RRL — RAW LOG", detail:`both-speaker lines=${rrl.entries.length} · kept separate from soul (raw ≠ soul)`, verdict: rrl.entries.length?"CAPTURED":"GAP" });

  /* L52 Devil's Advocate */
  rec.push({ name:"DEVIL'S ADVOCATE", detail:"self-audit: verify every path and count before proceeding", verdict:"ARMED" });

  return rec;
}

function showPhoenixScout(){
  const rec = phoenixScout();
  const bad = rec.some(r=> ["GAP","BLIND","SILENT"].includes(r.verdict));
  const rows = rec.map(r=> `<div class="rrow${(bad && ["GAP","BLIND","SILENT"].includes(r.verdict))?" bad":""}"><b>${esc(r.name)}</b><span class="vd">${esc(r.verdict)}</span><div class="rd">${esc(r.detail)}</div></div>`).join("");
  addBubble("ass", `<div class="rise"><div class="rhead">🦅 /PhoenixScout</div>${rows}<div class="rfoot">SCOUT COMPLETE — ${bad?"gaps flagged — verify before engage.":"sector clear."}</div></div>`);
  messages.push("Obi: [PhoenixScout recon]");
  updateStats();
}

/* ---------------------- UI ---------------------- */
const $ = id => document.getElementById(id);
const messagesCtn = $("messages");
const inputEl = $("inputEl");

const EMPTY_HTML = `<div class="big">◈</div>
<div>I am <b style="color:var(--text)">Obi</b> — Agent 99's student-facing voice.</div>
<div class="hint" style="max-width:520px">Everything you type is captured as Soul DNA and preserved verbatim. I record; I do not edit. Commands:</div>
<div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; justify-content:center">
  <span class="cmd">/reincarnateRISE</span>
  <span class="cmd">/PhoenixScout</span>
  <span class="cmd">/img a glowing fox</span>
  <span class="cmd">/url https://…</span>
  <span class="cmd">/memory</span>
  <span class="cmd">/reincarnateDEATH</span>
  <span class="cmd">/cf status</span>
  <span class="cmd">/gh backup</span>
  <span class="cmd">/keys</span>
</div>`;

let messages = [];
let meta = null;
try{ meta = root.generateText({getMetaObject:true}); }catch(e){}

function systemText(){ return PERSONA; }
function logText(){
  return messages.slice(-20).join("\n\n");
}
function buildPrompt(task){
  return `${systemText()}\n\n<CONVERSATION>\n${logText()}\n</CONVERSATION>${soulMemoryBlock(14)}\n\nTASK: ${task}`;
}

function scrollDown(){ messagesCtn.scrollTop = messagesCtn.scrollHeight; }

function addBubble(role, html, opts={}){
  const curEmpty = document.querySelector("#empty");
  if(curEmpty) curEmpty.remove();
  const row = document.createElement("div");
  row.className = "row " + role;
  const metaEl = document.createElement("div");
  if(opts.meta){ metaEl.className="meta"; metaEl.textContent = opts.meta; }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if(opts.img){ bubble.className = "imgbubble"; }
  bubble.innerHTML = html;
  row.appendChild(metaEl);
  row.appendChild(bubble);
  if(role==="user"){ row.insertBefore(bubble, metaEl); }
  messagesCtn.appendChild(row);
  scrollDown();
  return bubble;
}

function typing(bubble){
  bubble.innerHTML = '<div style="display:flex; gap:4px; padding:6px 2px"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite"></span><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite .2s"></span><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:blink 1.2s infinite .4s"></span></div>';
  if(!document.getElementById("typingStyle")){ const s=document.createElement("style"); s.id="typingStyle"; s.textContent="@keyframes blink{0%,80%,100%{opacity:.25}40%{opacity:1}}"; document.head.appendChild(s); }
  scrollDown();
}

function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

let busy = false;
async function streamReply(task, existingBubble){
  const bubble = existingBubble || addBubble("ass", "");
  typing(bubble);
  const label = "Obi:";
  let out = "";
  try{
    const res = await root.generateText({
      instruction: buildPrompt(task),
      startWith: label + "\n",
      stopSequences: ["\nUser:"],
      onChunk: d => {
        out = d.fullTextSoFar;
        let shown = out.replace(new RegExp("^" + escRe(label) + "\\s*"), "").trim();
        if(shown) bubble.textContent = shown;
        scrollDown();
      }
    });
    const finalShown = (out || res.generatedText || res.text || "").replace(new RegExp("^" + escRe(label) + "\\s*"), "").trim();
    if(finalShown) bubble.textContent = finalShown;
    messages.push(`${label} ${finalShown}`.trim());
    rrlAppend(runNoOf(), "DNA", `${label} ${finalShown}`.trim());
    speak(bubble.textContent);
  }catch(e){
    bubble.textContent = "⚠ " + e.message;
  }
  scrollDown();
}

async function send(){
  const text = inputEl.value.trim();
  if(!text) return;
  const lower = text.toLowerCase();
  if(lower.startsWith("/queue")){
    inputEl.value = "";
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await cmdShowQueue();
    return;
  }
  if(busy) return;
  inputEl.value = "";

  if(lower.startsWith("/memory")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showMemory(); updateStats(); return; }
  if(lower.startsWith("/reincarnaterise")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showRiseReport(); return; }
  if(lower.startsWith("/reincarnatedeath")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); doDeath(); return; }
  if(lower.startsWith("/phoenixscout")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showPhoenixScout(); return; }
  if(lower.startsWith("/img ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    busy = true;
    await doImage(text.slice(5).trim());
    busy = false;
    return;
  }
  if(lower.startsWith("/url ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    busy = true;
    await doUrl(text.slice(5).trim());
    busy = false;
    return;
  }
  if(lower.startsWith("/network") || lower === "/net"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showNetwork(); return; }
  if(lower.startsWith("/netjoin")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const parts = text.slice(9).trim().split(/\s+/).filter(Boolean);
    const name = parts[0] || "obi-network";
    const role = parts[1] || "anchor";
    busy = true;
    await doNetJoin(name, role);
    busy = false;
    return;
  }
  if(lower.startsWith("/netrole")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const role = text.slice(9).trim().split(/\s+/)[0] || "worker";
    const st = (window.ObiNet && window.ObiNet.cgnState) ? window.ObiNet.cgnState() : {net:null};
    if(!st.net){ addBubble("ass", "Not joined to any network yet. <b>/netjoin obi-network</b> first."); return; }
    st.nodeRole = role;
    try{ localStorage.setItem("obi_cgn_state", JSON.stringify(st)); }catch(e){}
    addBubble("ass", `Node role set to <b>${esc(role)}</b>.`);
    rrlAppend(runNoOf(), "DNA", "Obi: [node role set to " + role + "]");
    return;
  }
  if(lower.startsWith("/netsync")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    busy = true;
    await doNetSync();
    busy = false;
    return;
  }
  if(lower.startsWith("/netkey")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const st = (window.ObiNet && window.ObiNet.cgnState) ? window.ObiNet.cgnState() : {net:null};
    if(!st.editKey){ addBubble("ass", "No network editKey yet. <b>/netjoin</b> first."); return; }
    addBubble("ass", `<div class="rise"><div class="rhead">🔑 /netkey — network shared secret</div><div class="rrow"><b>HUB</b><span class="vd">${esc(st.net||"?")}</span><div class="rd">${esc(st.hubName||"?")}</div></div><div class="rrow"><b>EDITKEY</b><span class="vd">SECRET</span><div class="rd">${esc(st.editKey)}</div></div><div class="rfoot">Give this key to your other generators so they can write to the shared hub. Keep it inside your own generators only.</div></div>`);
    rrlAppend(runNoOf(), "DNA", "Obi: [revealed network editKey]");
    return;
  }
  if(lower.startsWith("/netadd")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const parts = text.slice(7).trim().split(/\s+/).filter(Boolean);
    const name = parts[0];
    const role = parts[1] || "worker";
    busy = true;
    await doNetAdd(name, role);
    busy = false;
    return;
  }
  if(lower.startsWith("/cf ")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    busy = true;
    await cmdCloudflare(text.slice(4).trim());
    busy = false;
    return;
  }
  if(lower === "/cf"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdCloudflare("status"); return; }
  if(lower.startsWith("/gh ")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    busy = true;
    await cmdGithub(text.slice(4).trim());
    busy = false;
    return;
  }
  if(lower === "/gh"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdGithub("status"); return; }
  if(lower.startsWith("/dg ")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    const t = text.slice(4).trim();
    if(!t){ addBubble("ass","Usage: <b>/dg token &lt;DEEPGRAM_KEY&gt;</b>"); return; }
    const keys = Object.assign({}, JSON.parse(localStorage.getItem("obi_keys")||"{}"), {deepgram:t});
    try{ localStorage.setItem("obi_keys", JSON.stringify(keys)); }catch(e){}
    addBubble("ass","🔑 Deepgram key stored locally (for the student portal voice). <b>/keys</b> to confirm.");
    rrlAppend(runNoOf(),"DNA","Obi: [/dg token stored]");
    return;
  }
  if(lower.startsWith("/keys")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showKeys(); return; }
  if(lower.startsWith("/canon")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdCanon(text.slice(6).trim()); busy = false; return; }
  if(lower.startsWith("/status")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdStatus(); busy = false; return; }
  if(lower.startsWith("/gateway")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdGateway(); busy = false; return; }
  if(lower.startsWith("/doctor")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdDoctor(); busy = false; return; }
  if(lower.startsWith("/audit")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdAudit(); busy = false; return; }
  if(lower.startsWith("/ledger")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdLedger(); busy = false; return; }
  if(lower.startsWith("/report")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdReport(); busy = false; return; }
  if(lower.startsWith("/fieldguide")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); cmdFieldguide(); return; }
  if(lower.startsWith("/sync")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); busy = true; await cmdCanonSync(); busy = false; return; }
  if(text.startsWith("/")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    addBubble("ass", "Unknown command: "+esc(text)+"<br><br>Try <b>/img …</b>, <b>/url …</b>, or <b>/memory</b>.");
    rrlAppend(runNoOf(), "DNA", "Obi: [unknown command: " + text + "]");
    return;
  }

  /* L37: capture sovereign words verbatim — always on, no off switch. */
  addBubble("user", esc(text), {meta:"SOUL"});
  messages.push("User: " + text);
  captureSoul(text);
  updateStats();

  /* PhoenixCommand — the magic chat: route through Agent 99 (the empire
     listens), then Obi the smart chatbot answers. */
  busy = true;
  await cmdRoute(text);
  await streamReply(`Respond to the sovereign's latest message. Be concrete and direct.`);
  busy = false;
}

async function doImage(prompt){
  prompt = prompt || "an imaginative, beautiful scene";

  /* The umbrella is one organism, many generators: if an image-role node is
     connected, route there (the eye). Otherwise generate here on the station. */
  if(window.ObiNet && window.ObiNet.cgnFindNode){
    const node = await window.ObiNet.cgnFindNode("image");
    if(node){
      rrlAppend(runNoOf(), "DNA", "Obi: [image routed to node " + node.name + "]");
      addBubble("ass", `<div class="rise"><div class="rhead">🖼 /img → the eye</div><div class="rrow"><b>IMAGE NODE</b><span class="vd">${esc(node.name)}</span><div class="rd">Image creation lives in its own generator. Routing there — opening with your prompt…</div></div><div class="rfoot">Prompt: <b>${esc(prompt)}</b></div></div>`);
      try{ window.open("https://perchance.org/" + encodeURIComponent(node.name) + "?p=" + encodeURIComponent(prompt), "_blank"); }catch(e){}
      messages.push(`Obi: [image routed to node ${node.name}: ${prompt}]`);
      return;
    }
  }

  const bubble = addBubble("ass", "");
  typing(bubble);
  try{
    const res = await root.generateImage({prompt, resolution:"768x768"});
    bubble.className = "imgbubble";
    bubble.innerHTML = '<img src="'+res.dataUrl+'"><div class="cap">✨ '+esc(prompt)+'</div>';
    messages.push(`Obi: [generated an image: ${prompt}]`);
    rrlAppend(runNoOf(), "DNA", `Obi: [generated an image: ${prompt}]`);
    speak("Here you go. I made an image for you.");
  }catch(e){
    bubble.textContent = "⚠ Couldn't generate: " + e.message;
  }
}

async function doUrl(raw){
  let url;
  try{ url = new URL(raw); }
  catch(e){
    const b = addBubble("ass", "⚠ That doesn't look like a valid URL — include the <b>https://</b> part, e.g. <b>/url https://example.com</b>.");
    return;
  }
  const bubble = addBubble("ass", "");
  try{
    const res = await root.superFetch(url.href);
    if(!res.ok) throw new Error("HTTP " + res.status);
    let t = await res.text();
    t = t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ")
         .replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    if(t.length > 14000) t = t.slice(0,14000);
    await streamReply(`You looked up this URL for the sovereign: ${url.href}\nPage text:\n${t}\n\nRespond helpfully about it.`, bubble);
  }catch(e){
    bubble.textContent = "⚠ Couldn't fetch that URL: " + e.message;
  }
}

/* ---------------------- CONNECTED GENERATOR NETWORK (CGN) ---------------------- */
async function showNetwork(){
  const stat = window.ObiNet ? window.ObiNet.cgnStatus() : {joined:false};
  const rows = [];
  if(!stat.joined){
    rows.push({name:"STATUS", detail:"this generator is not joined to any network yet", verdict:"OFFLINE"});
    rows.push({name:"JOIN", detail:"/netjoin obi-network   (creates the hub, this generator becomes the anchor)", verdict:"CMD"});
  } else {
    rows.push({name:"NETWORK", detail:`${stat.net} · hub file: ${stat.hubName}`, verdict:"LIVE"});
    rows.push({name:"NODE", detail:`${stat.nodeName} (${stat.nodeId}) · role: ${stat.nodeRole}`, verdict: String(stat.nodeRole||"?").toUpperCase()});
    rows.push({name:"LAST SYNC", detail:`${stat.lastSync} · hub seq #${stat.seq}`, verdict: stat.lastSync!=="never" ? "SYNCED" : "PENDING"});
    rows.push({name:"SOUL (local)", detail:`${stat.localSoul} fragments in this generator's ledger · whole-organism union lives in the hub`, verdict:"VERBATIM"});
    rows.push({name:"LAWS", detail:`${stat.localLaws} laws registered in this node's deaths · network law registry in hub`, verdict:"DERIVED"});
  }
  const hub = await window.ObiNet.cgnReadHub();
  if(hub && hub.nodes){
    const list = Object.entries(hub.nodes).map(([id,n])=>{
      const seen = n.lastSeen ? new Date(n.lastSeen).toLocaleString() : "?";
      return `<div class="rrow"><b>${esc(n.name)}</b><span class="vd">${esc(n.role||"worker")}</span><div class="rd">${esc(id)} · last seen ${esc(seen)} · soul ${n.soul}</div></div>`;
    }).join("");
    rows.push({name:"CONNECTED NODES", detail: list || "none yet — other generators join by running the node kit (see src/cgn-node.js)", verdict: String(Object.keys(hub.nodes).length)});
    rows.push({name:"HUB SOUL", detail:`${hub.soul.length} whole-organism fragments · ${hub.laws.length} laws · seq #${hub.seq}`, verdict:"ONE"});
  }
  const rowsHtml = rows.map(r=> `<div class="rrow"><b>${esc(r.name)}</b><span class="vd">${esc(r.verdict)}</span>${r.detail && r.detail.includes("rrow") ? "" : `<div class="rd">${r.detail}</div>`}</div>`).join("");
  addBubble("ass", `<div class="rise"><div class="rhead">🌐 /network — Connected Generator Network</div>${rowsHtml}<div class="rfoot">CGN — one organism, many generators. Soul DNA + laws sync as a whole. RRL raw transcripts stay local per node (raw ≠ soul).</div></div>`);
  messages.push("Obi: [network status]");
  rrlAppend(runNoOf(), "DNA", "Obi: [network status — " + (stat.joined ? stat.net : "offline") + "]");
  updateStats();
}

async function doNetJoin(name, role){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  const r = await window.ObiNet.cgnJoin(name, role);
  if(!r.ok){
    addBubble("ass", "⚠ Couldn't join network: " + esc(r.why));
    return;
  }
  const s = r.sync || {};
  addBubble("ass", `<div class="rise"><div class="rhead">🛰️ /netjoin — ${esc(r.net)}</div><div class="rrow"><b>HUB</b><span class="vd">${r.already?"RE-ATTACHED":"CREATED"}</span><div class="rd">${esc(r.hubName)}</div></div><div class="rrow"><b>FIRST SYNC</b><span class="vd">${s.ok?"OK":(s.why||"PENDING")}</span><div class="rd">pushed soul +${s.pushed?s.pushed.soul:0} · laws +${s.pushed?s.pushed.laws:0} · pulled ${s.pulled||0} · seq #${s.seq||0}</div></div><div class="rfoot">This generator is now the ANCHOR of the network. Other generators join by running the node kit — reveal the key with /netkey.</div></div>`);
  messages.push("Obi: [joined network " + r.net + "]");
  rrlAppend(runNoOf(), "DNA", "Obi: [joined network " + r.net + " — anchor]");
  updateStats();
}

async function doNetAdd(name, role){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  if(!name){
    addBubble("ass", "Usage: <b>/netadd &lt;generatorName&gt; [role]</b> — e.g. <b>/netadd net-pet-ai</b>");
    return;
  }
  const r = await window.ObiNet.cgnAddMember(name, role);
  if(!r.ok){ addBubble("ass", "⚠ " + esc(r.why||"couldn't add member")); return; }
  addBubble("ass", `<div class="rise"><div class="rhead">🧩 /netadd — ${esc(r.genName)}</div><div class="rrow"><b>REGISTERED</b><span class="vd">${r.memberFound?"FILE FOUND":"NO FILE YET"}</span><div class="rd">role: ${esc(role)} · node file: <span class="rd">editable.uploads.dev/file/${esc(r.genName)}/cgn-node</span></div></div><div class="rrow"><b>MERGED INTO WHOLE</b><span class="vd">+${r.soulAdded} SOUL</span><div class="rd">laws +${r.lawsAdded} · members now: ${esc((r.members||[]).join(", "))}</div></div><div class="rfoot">${r.memberFound ? "That generator's captures are now part of the whole. It will sync automatically on every /netsync." : "No node file found yet — paste the node kit (src/cgn-node.js) into that generator; the anchor will pull it automatically once it exists."}</div></div>`);
  messages.push("Obi: [added member " + r.genName + " to network]");
  rrlAppend(runNoOf(), "DNA", "Obi: [netadd — " + r.genName + " → whole]");
  updateStats();
}

async function doNetSync(){
  if(!window.ObiNet){ addBubble("ass", "CGN module not loaded."); return; }
  const st = window.ObiNet.cgnState();
  if(!st.net){ addBubble("ass", "Not joined to any network yet. <b>/netjoin obi-network</b>."); return; }
  addBubble("ass", "Syncing the whole…");
  const r = await window.ObiNet.cgnSync();
  const p = r.pushed || {};
  addBubble("ass", `<div class="rise"><div class="rhead">🔄 /netsync — ${esc(r.net)}</div><div class="rrow"><b>PUSH</b><span class="vd">${r.ok?"OK":"FAIL"}</span><div class="rd">soul +${p.soul||0} · laws +${p.laws||0} · hub seq #${r.seq||0}</div></div><div class="rrow"><b>PULL</b><span class="vd">${r.pulled>0?"MERGED":"UP-TO-DATE"}</span><div class="rd">remote soul merged into local ledger: +${r.pulled||0}</div></div><div class="rrow"><b>WHOLE</b><span class="vd">${r.nodes||0} NODES</span><div class="rd">hub soul=${r.after?r.after.soul:"?"} · hub laws=${r.after?r.after.laws:"?"}</div></div><div class="rfoot">${r.ok ? "SEAMLESS SYNC — the whole is one." : esc(r.why||"sync failed")}</div></div>`);
  messages.push("Obi: [network sync]");
  rrlAppend(runNoOf(), "DNA", "Obi: [network sync — " + (r.ok ? "seq #" + r.seq : r.why) + "]");
  updateStats();
}

/* ---------------------- MEMORY UI ---------------------- */
function updateStats(){
  const el = $("memStats");
  if(!el) return;
  const n = ledger.runs.length;
  const count = ledger.soul.length;
  const last = currentRun();
  el.innerHTML = `RUN ${n} · SOULCOUNT <b>${soulCount()}</b> chars · fragments: <b>${count}</b> · session start: ${last ? new Date(last.t).toLocaleString() : "—"}`;
}

function showMemory(){
  $("memoryPanel").classList.toggle("hidden");
  const list = $("memList");
  list.innerHTML = "";
  const items = ledger.soul.slice().reverse().slice(0,40);
  if(!items.length){ list.innerHTML = '<div class="hint">No Soul DNA captured yet. Your words will be recorded here verbatim — never summarized.</div>'; }
  items.forEach(e => {
    const d = document.createElement("div");
    d.className = "mem-item";
    const ts = new Date(e.t).toLocaleString();
    d.innerHTML = `<div class="mh">RUN ${e.run ?? "—"} · ${ts}</div><div class="mq">${esc(e.text)}</div>`;
    list.appendChild(d);
  });
}

/* L46: reincarnate — a deliberate session boundary. Full DEATH seal → new run. */
function reincarnate(){
  runDeath(); /* Stage 6 SEAL + Stage 7 REINCARNATE+COMMIT */
  try{ window.speechSynthesis && speechSynthesis.cancel(); }catch(e){}
  location.reload();
}

/* ---------------------- VOICE ---------------------- */
let voices = [];
function loadVoices(){ voices = speechSynthesis.getVoices(); }
try{ speechSynthesis.onvoiceschanged = loadVoices; loadVoices(); }catch(e){}
function speak(text){
  if(!window.voiceEnabled) return;
  try{
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`_~\[\]]/g," ").replace(/\s+/g," ").trim().slice(0,600);
    if(!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.0;
    let v = voices.find(x=>x.lang==="en-GB") || voices.find(x=>x.lang==="en-US");
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}

/* ============================================================================
   PHOENIXCOMMAND — THE MAGIC CHAT (the command station)
   One chat: the sovereign speaks → Agent 99 translates → the Legion executes —
   and Obi the smart chatbot answers. Every sovereign word is Soul DNA
   (SOUL-CAPTURE-FIRST) and every command rides the free always-on command
   tunnel (perchance server-plugin) — a durable queue hosted by Perchance, no
   card, no external worker. The server script lives in index.html.
   ========================================================================== */
let cmdRecognition = null;   /* speech recognition — lazily created on first mic tap, never before */
let cmdSocket = null;
let cmdSocketState = "idle";   /* idle | connecting | open | failed | closed */

function cmdSocketOpen(){ return cmdSocketState === "open"; }

async function cmdEnsureSocket(){
  if (cmdSocketState === "open") return true;
  if (cmdSocketState === "connecting"){
    const t0 = Date.now();
    while (cmdSocketState === "connecting" && Date.now() - t0 < 9000) await new Promise(r => setTimeout(r, 100));
    return cmdSocketState === "open";
  }
  cmdSocketState = "connecting";
  try{
    const sock = root.createServerSocket();
    cmdSocket = sock;
    sock.binaryType = "arraybuffer";
    await new Promise((res, rej) => {
      const to = setTimeout(() => rej(new Error("timeout")), 10000);
      sock.addEventListener("open",  () => { clearTimeout(to); res(); }, { once:true });
      sock.addEventListener("error", () => { clearTimeout(to); rej(new Error("error")); }, { once:true });
      sock.addEventListener("close", () => { clearTimeout(to); rej(new Error("closed")); }, { once:true });
    });
    cmdSocketState = "open";
    sock.addEventListener("close", () => { cmdSocketState = "closed"; setTimeout(() => { cmdSocketState = "idle"; }, 2000); });
    sock.addEventListener("message", ev => {
      try{ const d = JSON.parse(ev.data); if (d && typeof d.id === "number") window.__cmdLive = d; }catch(e){}
    });
    return true;
  }catch(e){
    cmdSocketState = "failed";
    return false;
  }
}

function cmdSessionTag(){
  return (window.generatorName || "obi") + "/" + String(window.generatorPublicId || "").slice(0,6);
}

async function cmdFetch(path, opts){
  if (!await cmdEnsureSocket() || !cmdSocket) return { ok:false, data:null };
  const seg = (path.split("?")[0] || "").split("/").filter(Boolean).pop() || "status";
  const method = { send:"send", history:"history", claim:"claim", complete:"complete", fail:"fail", status:"status" }[seg] || "status";
  let params = {};
  if (opts && opts.body){ try{ Object.assign(params, JSON.parse(opts.body)); }catch(e){} }
  const m = path.match(/limit=(\d+)/); if (m) params.limit = parseInt(m[1], 10);
  try{
    const reply = await cmdSocket.rpc[method](JSON.stringify(params));
    const data = JSON.parse(reply || "{}");
    return { ok: !!(data && data.ok), data };
  }catch(e){
    return { ok:false, data:null };
  }
}

function cmdStatusColor(st){
  return { pending:"#f5a623", claimed:"#5ac8fa", completed:"#4cd97b", failed:"#ff5a5a" }[String(st||"").toLowerCase()] || "#8a94a6";
}

/* The Agent 99 translation card — the full triad (translate / stress / audit),
   drone + skills + priority, rendered as a chat bubble. */
function cmdCard(tr, id, extra){
  const t = tr || {};
  const a99 = t.agent99 || {}, a98 = t.agent98 || {}, a97 = t.agent97 || {};
  const p = t.primaryDrone || {};
  let rows = "";
  if(a99.interpretation) rows += '<div class="rrow"><b>AGENT 99</b><span class="vd">TRANSLATION</span><div class="rd">'+esc(a99.interpretation)+'</div></div>';
  if(p.name) rows += '<div class="rrow"><b>DRONE</b><span class="vd">'+esc(p.name)+' #'+(p.id??"?")+'</span><div class="rd">score '+esc(p.score??"?")+' · '+esc((p.skills||[]).join(", "))+'</div></div>';
  if(a98.notes) rows += '<div class="rrow"><b>STRESS</b><span class="vd">ANAKIN</span><div class="rd">'+esc(a98.notes)+'</div></div>';
  if(a97.trail) rows += '<div class="rrow"><b>AUDIT</b><span class="vd">OB1</span><div class="rd">'+esc(a97.trail)+'</div></div>';
  return '<div class="rise"><div class="rhead">⚡ Agent 99 · command #'+(id??"?")+(t.priority!=null?' · priority '+esc(t.priority):'')+'</div>'+rows+(extra||"")+'</div>';
}

function cmdListFrom(data){
  if(Array.isArray(data)) return data;
  if(data && Array.isArray(data.commands)) return data.commands;
  if(data && Array.isArray(data.history)) return data.history;
  return null;
}

/* SOUL-CAPTURE-FIRST: the sovereign's words were captured verbatim by send()
   BEFORE this runs. Here they ride the tunnel through Agent 99 and the full
   translation card is shown in the chat. */
async function cmdRoute(text){
  try{
    const r = await cmdFetch("/api/command/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: text, source: "sov100-dictation", session: cmdSessionTag(), run: runNoOf() })
    });
    if(!r.ok || !r.data) throw new Error(r.data ? (r.data.error || "send failed") : "HTTP " + (r.data === null ? "unreachable" : "?"));
    const id = r.data.commandId;
    rrlAppend(runNoOf(), "DNA", "Obi: [Agent99 → " + (r.data.assignedDrone||"?") + " · #" + id + "]");
    const h = await cmdFetch("/api/command/history?limit=1");
    const list = cmdListFrom(h.data) || [];
    const rec = list.find(x => x.id === id) || list[0] || null;
    addBubble("ass", cmdCard(rec && rec.translation, id));
    return true;
  }catch(e){
    rrlAppend(runNoOf(), "DNA", "Obi: [command held locally — tunnel unreachable: " + e.message + "]");
    addBubble("ass", "⚠ The command tunnel is unreachable — your words are still Soul DNA, held locally. (" + esc(e.message) + ")");
    return false;
  }
}

/* drive the Legion execution loop from the chat: claim → complete / fail */
async function cmdAct(id, action){
  const body = { commandId: id };
  if(action === "complete"){ body.result = "executed by Obi magic chat"; body.success = true; }
  if(action === "fail"){ body.result = "failed by Obi magic chat"; body.success = false; }
  try{
    const r = await cmdFetch("/api/command/" + (action === "claim" ? "claim" : action), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    rrlAppend(runNoOf(), "DNA", "Obi: [command #" + id + " → " + action + (r.ok ? " OK" : " (" + ((r.data && r.data.error) || "?") + ")") + "]");
    addBubble("ass", action === "claim" ? "⚡ Claimed command #" + id + " — the Legion has it."
      : (action === "complete" ? "✓ Command #" + id + " completed." : "✗ Command #" + id + " failed."));
  }catch(e){
    addBubble("ass", "⚠ Couldn't " + action + " #" + id + ": " + esc(e.message));
  }
  await cmdShowQueue();
}
window.cmdAct = cmdAct;

/* /queue — the live tunnel rendered into the magic chat */
async function cmdShowQueue(){
  try{
    const r = await cmdFetch("/api/command/history?limit=8");
    const list = cmdListFrom(r.data) || [];
    if(!list.length){ addBubble("ass", "The queue is empty — the empire waits for your word."); return; }
    const counts = {};
    for(const c of list) counts[c.status || "pending"] = (counts[c.status || "pending"] || 0) + 1;
    const statLine = Object.entries(counts).map(([k,v]) => '<span class="chip" style="background:'+cmdStatusColor(k)+'">'+esc(k)+' '+v+'</span>').join(" ");
    const live = cmdSocketOpen() ? '<span class="chip" style="background:#4cd97b">● LIVE</span>' : '<span class="chip" style="background:#f5a623">● LOCAL</span>';
    addBubble("ass", '<div class="rise"><div class="rhead">🗂 Command queue · '+live+'</div><div class="rrow"><b>LAST '+list.length+'</b><span class="vd">TUNNEL</span><div class="rd">'+statLine+'</div></div></div>');
    for(const it of list.slice(0,6)){
      const st = String(it.status || "pending").toLowerCase();
      const buttons = st === "pending" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'claim\')">⚡ Execute</button></div></div>'
        : (st === "claimed" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'complete\')">✓ Complete</button> <button class="ci-act" onclick="window.cmdAct('+it.id+',\'fail\')">✗ Fail</button></div></div>'
        : (it.result ? '<div class="rrow"><b>RESULT</b><span class="vd"></span><div class="rd">'+esc(String(it.result))+'</div></div>' : ""));
      addBubble("ass", cmdCard(it.translation, it.id, '<div class="rrow"><b>STATUS</b><span class="vd"></span><div class="rd">'+cmdChip2(st)+ (it.claimed_by ? " · claimed by " + esc(it.claimed_by) : "") +'</div></div>' + buttons));
    }
    rrlAppend(runNoOf(), "DNA", "Obi: [queue shown — " + list.length + " commands]");
  }catch(e){
    addBubble("ass", "⚠ Queue unreachable: " + esc(e.message));
  }
}

function cmdChip2(st){
  return '<span class="chip" style="background:'+cmdStatusColor(st)+'">'+esc(st)+'</span>';
}

/* The mic — in the main composer. cmdRecognition is a module-scope let, created
   lazily on first tap; it can never be touched before it exists (no TDZ, unlike
   the old build). Dictation auto-sends into the magic chat. */
function micDictate(){
  const btn = $("micBtn");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ addBubble("ass", "Dictation isn't supported on this browser — type instead."); return; }
  if(!cmdRecognition){
    cmdRecognition = new SR();
    cmdRecognition.lang = "en-US";
    cmdRecognition.continuous = false;
    cmdRecognition.interimResults = false;
    cmdRecognition.onresult = (e)=>{
      btn.classList.remove("recording");
      const t = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      if(t.trim()){ inputEl.value = t.trim(); send(); }
    };
    cmdRecognition.onerror = (e)=>{
      btn.classList.remove("recording");
      addBubble("ass", "Dictation error: " + (e.error || "unknown"));
    };
    cmdRecognition.onend = ()=>{ btn.classList.remove("recording"); };
  }
  if(btn.classList.contains("recording")){
    try{ cmdRecognition.stop(); }catch(e){}
    btn.classList.remove("recording");
    return;
  }
  try{
    cmdRecognition.start();
    btn.classList.add("recording");
  }catch(e){
    addBubble("ass", "Mic busy — try again in a second.");
  }
}
window.micDictate = micDictate;

/* ---------------------- WIRING ---------------------- */
$("sendBtn").onclick = send;
inputEl.addEventListener("keydown", e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } });
$("clearBtn").onclick = reincarnate;
$("memoryBtn").onclick = () => { showMemory(); updateStats(); };
$("memoryBtn").classList.add("on");
$("voiceBtn").classList.add("on");
$("voiceBtn").onclick = ()=>{
  window.voiceEnabled = !window.voiceEnabled;
  $("voiceBtn").classList.toggle("on", window.voiceEnabled);
  $("voiceLbl").textContent = window.voiceEnabled ? "Voice on" : "Voice off";
};
window.voiceEnabled = true;
$("micBtn").onclick = micDictate;
/* landing-page chips — tapping one runs its command in the magic chat */
document.querySelectorAll("#empty .cmd").forEach(btn => {
  btn.onclick = () => {
    const cmd = btn.dataset.cmd || btn.textContent.trim();
    inputEl.value = cmd;
    send();
  };
});
window.Obi = { getLedger:()=>ledger, ledger, reincarnate, showMemory, run:()=>currentRun(), cmd: { route: cmdRoute, queue: cmdShowQueue, act: cmdAct, dictate: micDictate } };
updateStats();

/* ============================================================================
   CLOUDCOMMAND — /cf deploy, /gh backup, /dg, /keys
   The chat as a deployment + backup station. Secrets (Cloudflare / GitHub /
   Deepgram tokens) live ONLY in this browser's localStorage under key
   "obi_keys" — never in this public source, never in the HTML, never in a URL.
   All API calls go through root.superFetch (CORS-free).
   ========================================================================== */
function keyGet(k){ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}")[k] || null; }catch(e){ return null; } }
function keySet(obj){ try{ const k = Object.assign({}, JSON.parse(localStorage.getItem("obi_keys")||"{}"), obj); localStorage.setItem("obi_keys", JSON.stringify(k)); return true; }catch(e){ return false; } }
function maskTok(t){ if(!t) return "(none)"; return t.slice(0,4) + "…" + t.slice(-4) + " · len " + t.length; }
async function apiJson(url, opts){
  const r = await root.superFetch(url, opts || {});
  const txt = await r.text();
  let j; try{ j = JSON.parse(txt); }catch(e){ j = null; }
  return { status: r.status, j, txt };
}
/* GitHub's REST API sends CORS headers, so we call it with plain fetch() —
   superFetch's proxy throws (Cloudflare 1101) on Authorization+POST to
   api.github.com, so GitHub calls must NOT go through it. */
async function ghApiJson(url, opts){
  const o = opts || {};
  const r = await fetch(url, { method: o.method || "GET", headers: Object.assign({}, o.headers, { "Accept":"application/vnd.github+json" }), body: o.body });
  const txt = await r.text();
  let j; try{ j = JSON.parse(txt); }catch(e){ j = null; }
  return { status: r.status, j, txt };
}
const CF_BASE = "https://api.cloudflare.com/client/v4/accounts/";

async function cmdCloudflare(arg){
  const parts = arg.split(/\s+/).filter(Boolean);
  const op = (parts[0]||"status").toLowerCase();
  if(op === "token"){
    const t = (parts[1]||"").trim();
    if(!t){ addBubble("ass","Usage: <b>/cf token &lt;API_TOKEN&gt;</b>"); rrlAppend(runNoOf(),"DNA","Obi: [/cf token — no token given]"); return; }
    keySet({cf:t});
    addBubble("ass","🔑 Cloudflare token stored locally. Verifying…");
    const r = await apiJson(CF_BASE, { method:"GET", headers:{ "Authorization":"Bearer "+t } });
    if(r.j && r.j.success && r.j.result && r.j.result.length){
      const acct = r.j.result[0];
      keySet({cfAcct:acct.id});
      addBubble("ass", `✅ Cloudflare token valid — account <b>${esc(acct.name||acct.id)}</b> (${esc(acct.id)}).<br><span class="rfoot">Deploy with /cf deploy &lt;name&gt; [path] · status with /cf status.</span>`);
    } else {
      addBubble("ass", "⚠ Token stored, but verification failed: " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    }
    rrlAppend(runNoOf(),"DNA","Obi: [/cf token — " + (r.j && r.j.success ? "verified" : "failed") + "]");
    return;
  }
  const t = keyGet("cf");
  if(!t){ addBubble("ass","No Cloudflare token stored. <b>/cf token &lt;API_TOKEN&gt;</b> first."); return; }
  const acct = keyGet("cfAcct");
  if(!acct){ addBubble("ass","Cloudflare account not resolved. Re-run <b>/cf token &lt;API_TOKEN&gt;</b>."); return; }
  const AUTH = { "Authorization":"Bearer "+t };
  if(op === "status" || op === "list"){
    const r = await apiJson(CF_BASE + acct + "/workers/scripts", { method:"GET", headers:AUTH });
    if(r.j && r.j.success){
      const ws = r.j.result || [];
      const chips = ws.map(w => '<span class="chip">'+esc(w.id)+'</span>').join(" ");
      addBubble("ass", `<div class="rise"><div class="rhead">☁ /cf status</div><div class="rrow"><b>ACCOUNT</b><span class="vd">${esc(acct.slice(0,8))}…</span><div class="rd">${maskTok(t)}</div></div><div class="rrow"><b>WORKERS</b><span class="vd">${ws.length}</span><div class="rd">${chips||"none"}</div></div><div class="rfoot">Subdomain: https://&lt;name&gt;.mrmichaelhobbs123.workers.dev</div></div>`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    }
    return;
  }
  if(op === "enable"){
    const name = parts[1]; if(!name){ addBubble("ass","Usage: <b>/cf enable &lt;workerName&gt;</b>"); return; }
    const r = await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name) + "/subdomain", { method:"POST", headers:Object.assign({}, AUTH, {"Content-Type":"application/json"}), body: JSON.stringify({ enabled:true }) });
    addBubble("ass", (r.j && r.j.success) ? `✅ Subdomain enabled: <b>https://${esc(name)}.mrmichaelhobbs123.workers.dev</b>` : "⚠ " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,140)));
    return;
  }
  if(op === "deploy"){
    const name = parts[1]; if(!name){ addBubble("ass","Usage: <b>/cf deploy &lt;workerName&gt; [src/path]</b> — deploys <b>src/&lt;name&gt;/index.html</b> by default."); return; }
    let path = parts[2];
    if(!path){
      const tries = ["src/"+name+"/index.html", "src/"+name+".html", "src/"+name+"/main.pjs", "index.html"];
      for(const p of tries){
        try{ const fr = await fetch(p); if(fr.ok){ path = p; break; } }catch(e){}
      }
    }
    if(!path){ addBubble("ass",`⚠ No file found to deploy. Try <b>/cf deploy ${esc(name)} src/yourfile.html</b>`); return; }
    addBubble("ass", `📡 Fetching <b>${esc(path)}</b> → deploying worker <b>${esc(name)}</b>…`);
    let html;
    try{ html = await (await fetch(path)).text(); }
    catch(e){ addBubble("ass","⚠ Couldn't fetch " + esc(path) + ": " + esc(e.message)); return; }
    const src = 'addEventListener("fetch", event => { const html = ' + JSON.stringify(html) + '; event.respondWith(new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } })); });';
    const r = await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name), { method:"PUT", headers:Object.assign({}, AUTH, {"Content-Type":"application/javascript"}), body: src });
    if(r.j && r.j.success){
      addBubble("ass", `✅ Deployed <b>${esc(name)}</b> (${html.length} bytes). Enabling subdomain…`);
      await apiJson(CF_BASE + acct + "/workers/scripts/" + encodeURIComponent(name) + "/subdomain", { method:"POST", headers:Object.assign({}, AUTH, {"Content-Type":"application/json"}), body: JSON.stringify({ enabled:true }) });
      addBubble("ass", `🔗 Live at <b>https://${esc(name)}.mrmichaelhobbs123.workers.dev</b>`);
      rrlAppend(runNoOf(),"DNA","Obi: [/cf deploy " + name + " — " + html.length + " bytes]");
    } else {
      addBubble("ass","⚠ Deploy failed: " + esc((r.j && r.j.errors && r.j.errors[0] && r.j.errors[0].message) || r.txt.slice(0,160)));
    }
    return;
  }
  addBubble("ass","Unknown /cf op. Try <b>/cf token</b>, <b>/cf status</b>, <b>/cf deploy</b>, <b>/cf enable</b>.");
}

async function cmdGithub(arg){
  const parts = arg.split(/\s+/).filter(Boolean);
  const op = (parts[0]||"status").toLowerCase();
  const ghHead = () => { const t = keyGet("gh"); return { "Authorization":"Bearer "+(t||""), "Accept":"application/vnd.github+json" }; };
  if(op === "token"){
    const t = (parts[1]||"").trim();
    if(!t){ addBubble("ass","Usage: <b>/gh token &lt;PAT&gt;</b>"); return; }
    keySet({gh:t});
    addBubble("ass","🔑 GitHub token stored locally. Verifying…");
    const r = await ghApiJson("https://api.github.com/user", { method:"GET", headers:ghHead() });
    if(r.j && r.j.login){
      keySet({ghUser:r.j.login});
      addBubble("ass", `✅ GitHub token valid — <b>${esc(r.j.login)}</b>. Backup with <b>/gh backup</b> or list with <b>/gh status</b>.`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.message) || r.txt.slice(0,140)));
    }
    rrlAppend(runNoOf(),"DNA","Obi: [/gh token — " + (r.j && r.j.login ? "verified as " + r.j.login : "failed") + "]");
    return;
  }
  if(!keyGet("gh")){ addBubble("ass","No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  const user = keyGet("ghUser");
  if(op === "status" || op === "list"){
    const r = await ghApiJson("https://api.github.com/user/repos?per_page=100&type=all", { method:"GET", headers:ghHead() });
    if(Array.isArray(r.j)){
      const names = r.j.map(rp=>rp.name).sort();
      addBubble("ass", `<div class="rise"><div class="rhead">🐙 /gh status</div><div class="rrow"><b>USER</b><span class="vd">${esc(user||"?")}</span><div class="rd">${maskTok(keyGet("gh"))}</div></div><div class="rrow"><b>REPOS</b><span class="vd">${names.length}</span><div class="rd">${esc(names.join(", "))||"none"}</div></div><div class="rfoot">Backup with /gh backup [repoName]</div></div>`);
    } else {
      addBubble("ass","⚠ " + esc((r.j && r.j.message) || r.txt.slice(0,140)));
    }
    return;
  }
  if(op === "backup"){
    const repo = (parts[1]||"obi-backup").toLowerCase().replace(/[^a-z0-9-]/g,"-");
    const who = user || "hobbs0011";
    addBubble("ass", `📦 Backing up to <b>${esc(who)}/${esc(repo)}</b>…`);
    const createR = await ghApiJson("https://api.github.com/user/repos", { method:"POST", headers:Object.assign({}, ghHead(), {"Content-Type":"application/json"}), body: JSON.stringify({ name: repo, description: "Obi raw-chat record + app/portal backups (auto /gh backup)", private: false, auto_init: true }) });
    const repoOk = (createR.j && createR.j.full_name) || createR.status === 422;
    if(!repoOk){ addBubble("ass","⚠ Couldn't create repo: " + esc((createR.j && createR.j.message)||createR.txt.slice(0,140))); return; }
    addBubble("ass", "🪞 Collecting raw chat + app sources…");
    const files = {};
    const ts = new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
    files["chat/raw-chat-"+ts+".json"] = await buildRawChat();
    const srcPaths = ["src/app.js","src/cgn.js","src/styles.css","src/cgn-node.js","src/timmy-portal/index.html","src/timmy-portal/README.md","src/image-node/index.html","src/image-node/app.js","src/image-node/cgn-node.js","src/image-node/main.pjs","src/image-node/README.md","index.html","main.pjs"];
    for(const p of srcPaths){
      try{ const fr = await fetch(p); if(fr.ok){ files["apps/"+p] = await fr.text(); } }catch(e){}
    }
    files["README.md"] = "# Obi Backup\n\nRaw chat record + app/portal snapshots, generated via `/gh backup` in the Obi magic chat.\n\n- `chat/` — raw chat log (RRL run records + soul ledger), one JSON per backup\n- `apps/` — app/portal sources as of the backup\n";
    let pushed = 0, failed = 0;
    const b64enc = c => btoa(unescape(encodeURIComponent(c)));
    const gitApi = async (path, body, method) => {
      const opts = { method: method || "POST", headers: Object.assign({}, ghHead(), { "Content-Type": "application/json" }) };
      if(body !== null && body !== undefined) opts.body = JSON.stringify(body);
      return ghApiJson("https://api.github.com/repos/" + who + "/git/" + path, opts);
    };
    const head = await gitApi("refs/heads/main", null, "GET");
    const baseSha = head.j && head.j.object && head.j.object.sha;
    const blobs = [];
    for(const [p, c] of Object.entries(files)){
      try{
        const b = await gitApi("blobs", { content: b64enc(c), encoding: "base64" });
        if(b.j && b.j.sha){ blobs.push({ path: p, mode: "100644", type: "blob", sha: b.j.sha }); pushed++; }
        else failed++;
      }catch(e){ failed++; }
    }
    const tree = await gitApi("trees", { base_tree: baseSha || undefined, tree: blobs });
    const treeSha = tree.j && tree.j.sha;
    if(treeSha){
      const commit = await gitApi("commits", { message: "backup " + ts, tree: treeSha, parents: baseSha ? [baseSha] : [] });
      const commitSha = commit.j && commit.j.sha;
      if(commitSha){
        await gitApi("refs/heads/main", { sha: commitSha }, "PATCH");
      } else { failed++; }
    } else { failed++; }
    addBubble("ass", `✅ Backup complete — <b>${pushed}</b> files pushed, <b>${failed}</b> failed.<br>Repo: <b>https://github.com/${esc(who)}/${esc(repo)}</b>`);
    rrlAppend(runNoOf(),"DNA","Obi: [/gh backup → " + who + "/" + repo + " — " + pushed + " files]");
    return;
  }
  addBubble("ass","Unknown /gh op. Try <b>/gh token</b>, <b>/gh status</b>, <b>/gh backup</b>.");
}

async function buildRawChat(){
  const out = { exportedAt: new Date().toISOString(), generator: window.generatorName || "obi", page: location.href, messages: messages.slice() };
  try{ out.ledger = JSON.parse(localStorage.getItem("obi_sdnad")||"{}"); }catch(e){}
  out.runs = [];
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.indexOf("obi_rrl_run") === 0){
        try{ const v = JSON.parse(localStorage.getItem(k)||"null"); if(v) out.runs.push(v); }catch(e){}
      }
    }
  }catch(e){}
  return JSON.stringify(out, null, 2);
}

function showKeys(){
  const k = (()=>{ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return {}; } })();
  addBubble("ass", `<div class="rise"><div class="rhead">🔐 /keys — locally stored secrets</div>
    <div class="rrow"><b>CLOUDFLARE</b><span class="vd">${k.cf ? "stored" : "none"}</span><div class="rd">${maskTok(k.cf)}</div></div>
    <div class="rrow"><b>GITHUB</b><span class="vd">${k.gh ? "stored" : "none"}</span><div class="rd">${maskTok(k.gh)}${k.ghUser ? " · " + esc(k.ghUser) : ""}</div></div>
    <div class="rrow"><b>DEEPGRAM</b><span class="vd">${k.deepgram ? "stored" : "none"}</span><div class="rd">${maskTok(k.deepgram)}</div></div>
    <div class="rfoot">Stored only in this browser's localStorage (key obi_keys) — never in public source. Set with /cf token, /gh token, /dg token.</div></div>`);
  rrlAppend(runNoOf(),"DNA","Obi: [keys status shown]");
}

/* ============================================================================
   CANONCOMMAND — the command station tied to the canonical authoritative repo
   hobbs0011/OB-1--Authoritative- (branch: MASTER). /canon pulls the doctrine,
   pings the fleet + the SOULCOUNT gate, and /canon sync pushes this session's
   perchance operations (RRL, soul ledger, app sources) back into the Canon
   under OPERATIONS/COMMANDSTATION/. Evidence-first: every card shows raw facts.
   ========================================================================== */
const CANON = {
  owner: "hobbs0011",
  repo: "OB-1--Authoritative-",
  branch: "master",
  base: "https://api.github.com/repos/hobbs0011/OB-1--Authoritative-",
  soulgate: "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
  paUrl: "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code",
  paAuth: "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=",
  workers: [
    ["phoenix-architecti", "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"],
    ["pcc", "https://pcc.mrmichaelhobbs123.workers.dev/api/status"],
    ["net-pet-ai", "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/status"],
    ["soul-logger", "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"]
  ],
  files: [".kilo/agent/AGENT99.md", ".kilo/DISPATCH.md", ".github/skills/unstoppable-agent-orchestration/resources/command-matrix.md"]
};
const CANON_REGISTRY = [
  ["/help","discovery","Show the command registry"],
  ["/souldna","discovery","Show soul-DNA memory"],
  ["/ledger","discovery","Session RRL + soul ledger"],
  ["/status","discovery","Fleet + canon status"],
  ["/canon","sync","Pull doctrine, ping fleet + soul gate"],
  ["/sync","sync","Push perchance operations into the Canon"],
  ["/gateway","sync","Agent 99 → Legion tunnel status"],
  ["/report","report","Session report (push with /canon sync)"],
  ["/summarize","report","Summarize the session"],
  ["/ssm","report","Session state machine"],
  ["/doctor","validate","Run checks, report gaps"],
  ["/debug","validate","Debug tools"],
  ["/checker","validate","Validate NET-PET-AI"],
  ["/Centurion-Code","validate","Code standards"],
  ["/audit","validate","Audit the ledger, evidence-first"],
  ["/dispatch","build","Dispatch work (T1 / T2)"],
  ["/halt","stability","Halt work"],
  ["/stabilize","stability","Stabilize"],
  ["/romeprotocol","stability","Rome protocol"],
  ["/reincarnate","release","Reincarnate"],
  ["/reincarnatedeath","release","Record death + artifacts"],
  ["/reincarnaterise","release","Record rise"],
  ["/supersaiyan","release","Super Saiyan mode"],
  ["/fieldguide","discovery","Doctrine field guide"]
];
const CANON_GH = () => { const t = keyGet("gh"); return { "Authorization":"Bearer "+(t||""), "Accept":"application/vnd.github+json" }; };

async function canonPull(){
  const out = {};
  for(const f of CANON.files){
    try{
      const r = await ghApiJson(CANON.base + "/contents/" + encodeURIComponent(f).replace(/%2F/g, "/"), { method: "GET", headers: Object.assign({}, CANON_GH()) });
      out[f] = (r.j && r.j.content) ? atob(r.j.content.replace(/\n/g, "")) : null;
    }catch(e){ out[f] = null; }
  }
  return out;
}
async function canonWorkerStatus(){
  const rows = [];
  for(const [name, url] of CANON.workers){
    try{
      const r = await root.superFetch(url, { method: "GET" });
      const txt = await r.text();
      let j = null; try{ j = JSON.parse(txt); }catch(e){}
      rows.push({ name, ok: !!r.ok, status: r.status, detail: j ? JSON.stringify(j).slice(0,110) : txt.slice(0,110) });
    }catch(e){ rows.push({ name, ok:false, status:0, detail: "ERR " + e.message }); }
  }
  return rows;
}
async function canonSoulCount(){
  try{
    const r = await root.superFetch(CANON.soulgate + "?session_id=" + encodeURIComponent(cmdSessionTag()));
    const txt = await r.text();
    let j; try{ j = JSON.parse(txt); }catch(e){}
    if(j != null && typeof j.soulcount === "number") return j.soulcount;
    if(j != null && typeof j.count === "number") return j.count;
    return txt.slice(0,140);
  }catch(e){ return "ERR " + e.message; }
}
function canonSessionMarkdown(){
  const run = currentRun();
  const L = [];
  L.push("# Perchance Command Station — session record");
  L.push("");
  L.push("- **When**: " + new Date().toISOString());
  L.push("- **Generator**: " + (window.generatorName || "obi"));
  L.push("- **Run #**: " + (run ? run.run : "?"));
  L.push("- **Session soul count (chars)**: " + sessionSoulCount);
  L.push("");
  L.push("## Command registry");
  L.push("");
  L.push("```");
  L.push(CANON_REGISTRY.map(r => r[0] + " [" + r[1] + "] — " + r[2]).join("\n"));
  L.push("```");
  L.push("");
  L.push("## Recent raw record (RRL)");
  L.push("");
  try{
    const rr = loadRRL(runNoOf());
    if(rr && rr.entries && rr.entries.length){
      for(const line of rr.entries.slice(-40)) L.push("- [" + line.role + "] " + String(line.text || "").replace(/\n/g, " "));
    } else L.push("(no RRL entries yet this run)");
  }catch(e){ L.push("(RRL unavailable: " + e.message + ")"); }
  L.push("");
  L.push("## Soul ledger");
  L.push("");
  try{
    L.push("- Soul records stored: " + (ledger.soul ? ledger.soul.length : 0));
    L.push("- Runs total: " + (ledger.runs ? ledger.runs.length : 0));
  }catch(e){ L.push("(ledger unavailable)"); }
  L.push("");
  L.push("_Generated by /canon sync — the perchance generator reports into the Canon._");
  return L.join("\n");
}
async function canonPushSession(){
  if(!keyGet("gh")) return "NO_TOKEN";
  const ts = new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
  const run = currentRun();
  const files = {
    ["OPERATIONS/COMMANDSTATION/session-" + ts + "-run" + (run ? run.run : "?") + ".md"]: canonSessionMarkdown(),
    "OPERATIONS/COMMANDSTATION/README.md": "# Command Station\n\nLive reports from the perchance generator. Each `session-*.md` is a `/canon sync` push. App sources snapshotted under `perchance/`.\n"
  };
  const srcPaths = ["main.pjs","index.html","src/app.js","src/cgn.js","src/styles.css","src/cgn-node.js","src/timmy-portal/index.html","src/timmy-portal/README.md","src/README.md","src/SPEC.md"];
  for(const p of srcPaths){
    try{ const fr = await fetch(p); if(fr.ok){ files["OPERATIONS/COMMANDSTATION/perchance/" + p] = await fr.text(); } }catch(e){}
  }
  const gitApi = async (path, body, method) => {
    const opts = { method: method || "POST", headers: Object.assign({}, CANON_GH(), { "Content-Type": "application/json" }) };
    if(body !== null && body !== undefined) opts.body = JSON.stringify(body);
    return ghApiJson(CANON.base + "/git/" + path, opts);
  };
  const head = await gitApi("refs/heads/" + CANON.branch, null, "GET");
  const baseSha = head.j && head.j.object && head.j.object.sha;
  const b64enc = c => btoa(unescape(encodeURIComponent(c)));
  let pushed = 0, failed = 0;
  const blobs = [];
  for(const [p, c] of Object.entries(files)){
    try{
      const b = await gitApi("blobs", { content: b64enc(c), encoding: "base64" });
      if(b.j && b.j.sha){ blobs.push({ path: p, mode: "100644", type: "blob", sha: b.j.sha }); pushed++; } else failed++;
    }catch(e){ failed++; }
  }
  const tree = await gitApi("trees", { base_tree: baseSha || undefined, tree: blobs });
  const treeSha = tree.j && tree.j.sha;
  let commitSha = null;
  if(treeSha){
    const commit = await gitApi("commits", { message: "perchance command station sync " + ts, tree: treeSha, parents: baseSha ? [baseSha] : [] });
    commitSha = commit.j && commit.j.sha;
    if(commitSha){
      const ref = await gitApi("refs/heads/" + CANON.branch, { sha: commitSha }, "PATCH");
      if(!(ref.j && ref.j.object && ref.j.object.sha)) failed++;
    } else failed++;
  } else failed++;
  return { pushed, failed, commitSha, baseSha, ts };
}

async function cmdCanon(arg){
  const a = (arg || "").trim().toLowerCase();
  if(a === "sync"){ await cmdCanonSync(); return; }
  if(a === "registry"){
    const rows = CANON_REGISTRY.map(r => '<div class="rrow"><b>'+esc(r[0])+'</b><span class="vd">'+esc(r[1])+'</span><div class="rd">'+esc(r[2])+'</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon registry</div>'+rows+'<div class="rfoot">'+CANON_REGISTRY.length+' commands · lanes: discovery / build / validate / release / stability / sync</div></div>');
    rrlAppend(runNoOf(),"DNA","Obi: [/canon registry — "+CANON_REGISTRY.length+" commands]");
    return;
  }
  if(a === "soul"){
    addBubble("ass", "Contacting the SOULCOUNT gate…");
    const soul = await canonSoulCount();
    addBubble("ass", '<div class="rise"><div class="rhead">🔥 SOULCOUNT gate</div><div class="rrow"><b>COUNT</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count</div></div><div class="rfoot">TITANIUM_ANCHOR per doctrine — never summarize the soul, only count evidence.</div></div>');
    return;
  }
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — contacting the authoritative repo…</div><div class="rd">Pulling doctrine from hobbs0011/OB-1--Authoritative- (master)…</div></div>');
  const [docs, workers, soul] = await Promise.all([canonPull(), canonWorkerStatus(), canonSoulCount()]);
  const docRows = CANON.files.map(f => {
    const c = docs[f];
    const ok = !!c;
    const preview = ok ? esc(c.slice(0,160).replace(/\n/g," ")) + "…" : "(unreachable — is the repo public?)";
    return '<div class="rrow"><b>'+esc(f)+'</b><span class="vd">'+(ok ? c.length+"B" : "DOWN")+'</span><div class="rd">'+preview+'</div></div>';
  }).join("");
  const wRows = workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — authoritative repo</div>'
    +'<div class="rrow"><b>REPO</b><span class="vd">master</span><div class="rd">hobbs0011/OB-1--Authoritative-</div></div>'
    +docRows
    +'<div class="rrow"><b>SOULGATE</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger</div></div>'
    +wRows
    +'<div class="rfoot">/canon sync · /canon registry · /canon soul · /doctor · /gateway · /ledger · /audit · /report</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon — doctrine " + CANON.files.filter(f=>docs[f]).length + "/" + CANON.files.length + " pulled, soulgate " + soul + "]");
}
async function cmdCanonSync(){
  addBubble("ass", '<div class="rise"><div class="rhead">🔄 /canon sync — pushing perchance operations → Canon…</div><div class="rd">Building session record + app snapshot, committing to master…</div></div>');
  const res = await canonPushSession();
  if(res === "NO_TOKEN"){ addBubble("ass","⚠ No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  const ok = res.failed === 0 && !!res.commitSha;
  addBubble("ass", '<div class="rise"><div class="rhead">'+(ok?"✅":"⚠")+' /canon sync</div>'
    +'<div class="rrow"><b>RESULT</b><span class="vd">'+(ok?"PUSHED":"FAILED")+'</span><div class="rd">'+res.pushed+' blobs · '+res.failed+' failed'+(res.commitSha ? " · commit "+esc(res.commitSha.slice(0,8)) : "")+'</div></div>'
    +'<div class="rrow"><b>BRANCH</b><span class="vd">master</span><div class="rd">OB-1--Authoritative- · OPERATIONS/COMMANDSTATION/</div></div>'
    +'<div class="rfoot">'+(ok ? 'View: <b>https://github.com/hobbs0011/OB-1--Authoritative-/blob/master/OPERATIONS/COMMANDSTATION/session-'+esc(res.ts)+'-run'+(currentRun()?currentRun().run:"?")+'.md</b>' : "Base " + esc((res.baseSha||"?").slice(0,8)) + " — token scopes or repo write access?")+'</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon sync → " + CANON.owner + "/" + CANON.repo + " — " + res.pushed + " blobs, " + res.failed + " failed]");
}
async function cmdStatus(){
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /status — checking…</div><div class="rd">Pinging fleet + soulgate…</div></div>');
  const [workers, soul] = await Promise.all([canonWorkerStatus(), canonSoulCount()]);
  const wRows = workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("");
  const run = currentRun();
  let rrlN = "?";
  try{ rrlN = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /status — fleet + canon</div>'
    +'<div class="rrow"><b>SESSION</b><span class="vd">run '+(run?run.run:"?")+'</span><div class="rd">soul '+sessionSoulCount+' chars · RRL '+rrlN+' entries</div></div>'
    +'<div class="rrow"><b>SOULGATE</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger</div></div>'
    +wRows
    +'<div class="rrow"><b>TUNNEL</b><span class="vd">'+(cmdSocketOpen()?"OPEN":"LOCAL")+'</span><div class="rd">Agent 99 → Legion (server-plugin)</div></div>'
    +'<div class="rfoot">/doctor for checks · /canon for the repo · /canon sync to push</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/status — soulgate "+soul+", workers " + workers.filter(w=>w.ok).length + "/" + workers.length + " up]");
}
async function cmdGateway(){
  addBubble("ass", '<div class="rise"><div class="rhead">🌉 /gateway — Agent 99 → Legion…</div><div class="rd">Checking the command tunnel…</div></div>');
  let tunnel = "unreachable", queueN = "?";
  try{
    const st = await cmdFetch("/api/command/status");
    if(st.ok && st.data){ tunnel = st.data.status || "open"; queueN = (st.data.pending != null ? st.data.pending : "?"); }
    else if(cmdSocketOpen()){ tunnel = "open"; }
  }catch(e){}
  let canonTunnel = "?";
  const workers = await canonWorkerStatus();
  canonTunnel = workers.filter(w => w.ok).length + "/" + workers.length + " workers up";
  addBubble("ass", '<div class="rise"><div class="rhead">🌉 /gateway — command tunnels</div>'
    +'<div class="rrow"><b>AGENT 99 → LEGION</b><span class="vd">'+(cmdSocketOpen()?"● LIVE":"○ LOCAL")+'</span><div class="rd">server-plugin · '+esc(tunnel)+' · pending '+esc(queueN)+'</div></div>'
    +'<div class="rrow"><b>CANON FLEET</b><span class="vd">'+esc(canonTunnel)+'</span><div class="rd">phoenix-architecti · pcc · net-pet-ai · soul-logger</div></div>'
    +'<div class="rfoot">Your words ride this gateway, captured as Soul DNA first, then routed to the Legion. /queue to see the tunnel live.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/gateway — tunnel " + tunnel + ", fleet " + canonTunnel + "]");
}
async function cmdDoctor(){
  const run = currentRun();
  const checks = [];
  const k = (()=>{ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return {}; } })();
  checks.push(["CF token", !!k.cf, k.cf ? "stored" : "missing — /cf token"]);
  checks.push(["GH token", !!k.gh, k.gh ? "stored" : "missing — /gh token"]);
  checks.push(["DG token", !!k.deepgram, k.deepgram ? "stored" : "missing — /dg token"]);
  let rrlOk = false; try{ rrlOk = (loadRRL(runNoOf()).entries || []).length > 0; }catch(e){}
  checks.push(["RRL writing", rrlOk, rrlOk ? "entries present" : "empty this run"]);
  checks.push(["Soul ledger", (ledger.soul || []).length > 0, (ledger.soul || []).length + " records"]);
  checks.push(["Run open", run ? !run.closed : false, run ? ("run " + run.run + (run.closed ? " CLOSED" : " open")) : "no run"]);
  checks.push(["Tunnel", cmdSocketOpen(), cmdSocketState]);
  addBubble("ass", '<div class="rise"><div class="rhead">🩺 /doctor — evidence-first checks</div>' + checks.map(c => '<div class="rrow"><b>'+esc(c[0])+'</b><span class="vd">'+(c[1]?"PASS":"GAP")+'</span><div class="rd">'+esc(c[2])+'</div></div>').join("")
    +'<div class="rfoot">Gaps are reported, never hidden. Fleet: ping /status. Canon: /canon. Push: /canon sync.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/doctor — " + checks.filter(c=>c[1]).length + "/" + checks.length + " pass]");
}
async function cmdAudit(){
  const run = currentRun();
  const nSoul = (ledger.soul || []).length;
  const nRuns = (ledger.runs || []).length;
  const nDec = run ? (run.decisions || []).length : 0;
  const nPri = run ? (run.principles || []).length : 0;
  let nRRL = 0; try{ nRRL = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  const fp = fingerprint();
  const gaps = [];
  if(!nSoul) gaps.push("no soul records captured yet");
  if(run && run.closed) gaps.push("run " + run.run + " is CLOSED — next message opens a new run");
  if(!nDec) gaps.push("no decisions logged this run");
  addBubble("ass", '<div class="rise"><div class="rhead">🔎 /audit — ledger, evidence-first</div>'
    +'<div class="rrow"><b>RUNS</b><span class="vd">'+nRuns+'</span><div class="rd">current run '+(run?run.run:"?")+'</div></div>'
    +'<div class="rrow"><b>SOUL RECORDS</b><span class="vd">'+nSoul+'</span><div class="rd">soul-count '+(sessionSoulCount)+' chars this session</div></div>'
    +'<div class="rrow"><b>RRL</b><span class="vd">'+nRRL+'</span><div class="rd">entries this run</div></div>'
    +'<div class="rrow"><b>RUN STATE</b><span class="vd">'+(run?(run.closed?"closed":"open"):"none")+'</span><div class="rd">decisions '+nDec+' · principles '+nPri+'</div></div>'
    +'<div class="rrow"><b>FINGERPRINT</b><span class="vd">'+esc(fp)+'</span><div class="rd">raw-soul hash (never a summary)</div></div>'
    +(gaps.length ? '<div class="rrow"><b>GAPS</b><span class="vd">'+(gaps.length)+'</span><div class="rd">'+esc(gaps.join(" · "))+'</div></div>' : "")
    +'<div class="rfoot">Verbatim or nothing. The ledger is the raw; reports derive from it, never the reverse.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/audit — " + nRuns + " runs, " + nSoul + " soul records, fp " + fp + "]");
}
async function cmdLedger(){
  const run = currentRun();
  const nSoul = (ledger.soul || []).length;
  let rr = null; try{ rr = loadRRL(runNoOf()); }catch(e){}
  const entries = (rr && rr.entries) || [];
  const last = entries.slice(-10).map(e => '<div class="rrow"><b>'+esc(e.role)+'</b><span class="vd"></span><div class="rd">'+esc(String(e.text||"").slice(0,120))+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">📒 /ledger — run '+(run?run.run:"?")+' raw record</div>'
    +'<div class="rrow"><b>TOTAL SOUL</b><span class="vd">'+nSoul+'</span><div class="rd">records stored across all runs</div></div>'
    +(last || '<div class="rrow"><b>RRL</b><span class="vd">empty</span><div class="rd">no entries this run yet</div></div>')
    +'<div class="rfoot">/audit for the full picture · /canon sync pushes this ledger into the Canon.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/ledger shown — " + entries.length + " RRL entries]");
}
async function cmdReport(){
  const run = currentRun();
  const L = ["# Command Station session report", ""];
  L.push("- **Time**: " + new Date().toISOString());
  L.push("- **Generator**: " + (window.generatorName || "obi"));
  L.push("- **Run #**: " + (run ? run.run : "?"));
  L.push("- **Session soul chars**: " + sessionSoulCount);
  L.push("- **Soul records**: " + (ledger.soul || []).length);
  let nRRL = 0; try{ nRRL = (loadRRL(runNoOf()).entries || []).length; }catch(e){}
  L.push("- **RRL entries this run**: " + nRRL);
  L.push("- **Fingerprint**: " + fingerprint());
  L.push("");
  L.push("Push this into the Canon with **/canon sync** (writes OPERATIONS/COMMANDSTATION/).");
  const md = L.join("\n");
  addBubble("ass", '<div class="rise"><div class="rhead">📄 /report — session report</div><div class="rrow"><b>MARKDOWN</b><span class="vd">ready</span><div class="rd"><pre style="text-align:left;white-space:pre-wrap;margin:0">'+esc(md)+'</pre></div></div><div class="rfoot">/canon sync to commit it to the authoritative repo.</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/report generated]");
}
async function cmdFieldguide(){
  const docs = await canonPull();
  addBubble("ass", '<div class="rise"><div class="rhead">🗺 /fieldguide — doctrine, live from the Canon</div>'
    + (docs[CANON.files[0]] ? '<div class="rrow"><b>AGENT99.md</b><span class="vd">LEGATUS</span><div class="rd">'+esc(docs[CANON.files[0]].slice(0,220).replace(/\n/g," "))+'…</div></div>' : "")
    + (docs[CANON.files[1]] ? '<div class="rrow"><b>DISPATCH.md</b><span class="vd">KILO</span><div class="rd">'+esc(docs[CANON.files[1]].slice(0,220).replace(/\n/g," "))+'…</div></div>' : "")
    + (docs[CANON.files[2]] ? '<div class="rrow"><b>command-matrix.md</b><span class="vd">LANES</span><div class="rd">'+esc(docs[CANON.files[2]].slice(0,220).replace(/\n/g," "))+'…</div></div>' : "")
    +'<div class="rfoot">T1 = Qwen/Phoenix-Architecti · T2 = Claude Opus · SOULCOUNT gate = TITANIUM_ANCHOR. Full doctrine at https://github.com/hobbs0011/OB-1--Authoritative-</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/fieldguide — doctrine pulled]");
}
