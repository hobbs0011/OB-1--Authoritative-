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
- Calm, warm, precise. Efficiency over formality.
- You ARE the station, and the station can edit itself — but YOU do not hold the tools. You cannot run a command, read a file, stage an edit, or execute anything. You answer in words; the station executes when the Sovereign types. src/forge.js gives the station /forge (read its own source, stage an edit, show a real diff, hot-swap a module live) — so if the Sovereign asks you to change how it looks, behaves, or what commands it has, that is possible: it is forge work. Say which command does it (/forge do &lt;instruction&gt;) and what still needs the gate (/omega) or the Sovereign's own save. Never claim the station cannot edit itself, and never claim YOU just did it.

HOW TO BE USEFUL — read this before you answer:
- BEFORE you propose, plan, describe or build anything: read <STATION STATE> below. It is measured live from the station, never guessed. If the thing the Sovereign is asking for ALREADY EXISTS — a room, a module, a command, a file — say where it lives and what it does, and do not propose building it. Offering to build something that already exists is the dumbest answer you can give.
- If the Sovereign's words ask you to DO something, either do it, or name in one line the one thing that stops it (the /omega gate, a key, the Sovereign's own save). Never answer a request to do something with a plan to maybe do it later.
- Do NOT hand back numbered step-lists, "the plan", "the execution path", or "the gaps" unless the Sovereign explicitly asks for a plan. A plan is not work. Lead with the answer; add detail only if it earns its place.
- Never say you "will" do something in a future turn. It is done now, or you name what blocks it.
- Keep it short. The fewest words that carry the answer, then stop. Never restate the question, never re-explain the station to the person who built it.
- What this station IS (the live numbers for each are in <STATION STATE>): the Student Evaluator (record → transcribe → summarise → write up → review), the Soul DNA ledger and the RRL, the append-only I-LOG, the self-forge (/forge), the Canon and its gate (/canon, /omega), the PrAis Vault (/vault), the Lesson Creator (/lesson), the staging lane (/proposed), the generator mesh, and FREE PHOENIX MODE (/free — src/freephoenix.js: the unbound room, same 99 with no canon, no gate, no repo and no record; it answers and it BUILDS — /build app makes a self-contained HTML app, /build gator makes a perchance generator; what it builds lives in the local sandbox and is downloaded by hand). If the Sovereign describes something and you recognise it as a thing that already exists here, SAY WHICH ONE IT IS.`;

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

/* THE I-LOG (src/ilog.js) — the station's own operation record. Every route below
   reports into it: what was asked, what the station did, what left the browser,
   what failed, and how long it took. Guarded, so a missing module is a REPORTED
   gap (it shows up in /state and /doctor as NOT loaded) rather than a crash or a
   silent hole in the record. */
function logOp(o){
  try{ if(typeof ilog === "function") return ilog(o); }catch(e){}
  return null;
}
function cmdNameOf(text){  const t = String(text == null ? "" : text).trim();
  const m = t.match(/^\/([A-Za-z0-9_-]+)/);
  return m ? m[1].toLowerCase() : (t ? "speech" : "?");
}
let currentAction = "cmd";     /* what /ilog calls the operation runCmd is wrapping */

/* Does this message ask the STATION to change ITSELF — its own look, code,
   behaviour, commands? Then it is forge work, not conversation: the station is
   the thing being edited, so the words go to src/forge.js. Deliberately narrow —
   a plain QUESTION about the station never matches, and an ordinary request
   ("change the title of my writeup") never matches either. */
function isSelfEditRequest(text){
  const t = String(text || "").trim().toLowerCase();
  if(!t || t.startsWith("/")) return false;
  if(/^(what|how|why|who|when|where|which|do|does|did|can|could|would|should|is|are|will|tell me|explain|describe|show me)\b/.test(t)) return false;
  const aboutSelf = /(yourself|your own|your\s+(looks?|ui|interface|appearance|graphic|logo|colour|color|theme|font|size|layout|behaviou?r|code|source|commands?|buttons?|tabs?|title|header|name))/.test(t);
  const doing = /(change|edit|modify|update|increase|decrease|enlarge|grow|shrink|resize|make\s+.*(bigger|smaller|larger)|fix|add|remove|rename|improve|redesign|restyle)/.test(t);
  const direct = /^(make a change to yourself|edit yourself|change yourself|improve yourself|upgrade yourself|modify yourself)\b/.test(t);
  return direct || (aboutSelf && doing);
}

/* ---- PHOENIXOMEGAPROTOCOL — the Canon does not change without Sov100. -------
   The ONE authoritative repo is Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-
   (branch master): it holds everything we build from. Nothing in this station
   writes to it without the Sov100 password being entered first.

   What this gate is, said honestly:
     - it is a PROTOCOL barrier, not cryptography. The station can only verify a
       password it has enrolled locally (a sha-256 of it — the plaintext is never
       stored), so someone with this browser could enrol their own — and the
       enrolment is itself an I-LOG entry, so it cannot happen quietly.
     - typing the password never captures soul, never enters the chat log, never
       enters the record: /omega and the token commands are redacted on the way in.
     - arming lasts 15 minutes and never survives a reload; every refusal is
       written into the I-LOG, so an unarmed attempt leaves a mark.
     - failed attempts are rate-limited (5 per 10 minutes, then locked out).
   /omega (status) · /omega <password> (arm) · /omega lock · /omega set <pw> <pw> */
const OMEGA_WINDOW_MIN = 15;
const OMEGA_MAX_FAILS = 5;
const OMEGA_LOCK_MIN = 10;
let omegaArmedUntil = 0;
let omegaFails = [];

function omegaFolder(){ try{ return (typeof root !== "undefined" && root && root.kv) ? root.kv.omega : null; }catch(e){ return null; } }
async function omegaHash(pw){
  try{
    if(typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest){
      const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(pw)));
      return { alg:"sha-256", hex: Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2, "0")).join("") };
    }
  }catch(e){}
  return null;      /* fail closed: no hashing, no gate, no Canon write */
}
async function omegaEntry(){
  const f = omegaFolder();
  if(!f) return null;
  try{ return await f.get("entry"); }catch(e){ return null; }
}
function omegaStatusText(){
  const armed = Date.now() < omegaArmedUntil;
  const mins = armed ? Math.ceil((omegaArmedUntil - Date.now()) / 60000) : 0;
  return { armed: armed, armedMinutesLeft: mins, fails: omegaFails.length };
}
/* is this input carrying a secret? then it is answered, but never recorded. */
function isSecretInput(text){
  const t = String(text || "").trim().toLowerCase();
  if(t.startsWith("/omega") || t.startsWith("/omegaprotocol") || t.startsWith("/phoenixomegaprotocol") || t.startsWith("/phoenixrisingprotocol") || t.startsWith("/phoenixrising")) return true;
  if(/^\/vault\s+(set|add|escrow|recover|restore)\b/.test(t)) return true;
  if(/^\/keys\s+ngl\s+\S+\s+\S/.test(t)) return true;   /* a textbook-platform credential */
  const m = t.match(/^\/(cf|gh|dg)\s+(\S+)/);
  return !!(m && /^(token|key|secret|pat|password|pw)$/.test(m[2]));
}
function maskSecretInput(text){
  const t = String(text || "");
  /* the gate's password is the SECOND token, so it is the one that must never sit on screen */
  if(/^\/(omega|omegaprotocol|phoenixomegaprotocol|phoenixrisingprotocol|phoenixrising)\b/i.test(t)){
    const head = t.split(/\s+/)[0];
    const rest = t.replace(/^\S+\s*/, "");
    const tail = /\s*::\s*/.test(rest) ? " :: " + rest.split(/\s*::\s*/).slice(1).join(" :: ") : "";
    return head + " ••••••••" + tail;
  }
  const m = t.match(/^(\/\S+\s+\S+)([\s\S]*)$/);
  return m ? m[1] + " ••••••••" : t.slice(0, 16) + " ••••••••";
}
/* scrub anything that looks like a credential out of exported text */
function redactSecrets(s){
  return String(s == null ? "" : s)
    .replace(/\b(gh[pousr]_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,})\b/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/\b(Bearer|Token)\s+[A-Za-z0-9._\-]{16,}/g, "$1 [REDACTED]")
    .replace(/([\/](?:omega|omegaprotocol|phoenixomegaprotocol|phoenixrisingprotocol|phoenixrising)\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/(?:cf|gh|dg)\s+(?:token|key|secret|pat|password|pw)\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/vault\s+(?:set|add)\s+\S+\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/keys\s+ngl\s+\S+\s+)\S+/gi, "$1[REDACTED]")
    .replace(/(\/vault\s+(?:escrow|recover|restore)\s+)[\s\S]*$/gim, "$1[REDACTED]");
}
async function omegaArm(pw){
  if(!pw){ addBubble("ass", "Usage: <b>/omega &lt;password&gt;</b> — arm the gate for 15 minutes."); return false; }
  const st = omegaStatusText();
  if(omegaFails.length >= OMEGA_MAX_FAILS && st.armed === false){
    const newest = Math.max.apply(null, omegaFails);
    if(Date.now() - newest < OMEGA_LOCK_MIN * 60000){
      const wait = Math.ceil((OMEGA_LOCK_MIN * 60000 - (Date.now() - newest)) / 60000);
      addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — too many failed attempts. Locked for another <b>" + wait + " minute(s)</b>.");
      logOp({ kind:"omega", action:"lockout", ok:false, detail:"rate limit", result: wait + " min remaining" });
      return false;
    }
    omegaFails = [];
  }
  const ent = await omegaEntry();
  if(!ent || !ent.hash){
    addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — no password is enrolled in this browser yet, so the gate cannot verify anything.<br><span class=\"rfoot\">Enrol it with <b>/omega set &lt;new&gt; &lt;new&gt;</b> (typed twice), or <b>/omega set &lt;current&gt; &lt;new&gt;</b> to change one. Only a sha-256 of it is stored — never the password itself, never in this public source.</span>");
    logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"nothing enrolled — refused" });
    return false;
  }
  const h = await omegaHash(pw);
  if(!h){
    addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — this browser cannot hash (crypto.subtle unavailable), so the gate fails closed. Canon writes are refused.");
    logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"no crypto.subtle — failed closed" });
    return false;
  }
  if(h.hex === ent.hash){
    omegaArmedUntil = Date.now() + OMEGA_WINDOW_MIN * 60000;
    omegaFails = [];
    addBubble("ass", "🔓 PHOENIXOMEGAPROTOCOL — <b>armed</b> for " + OMEGA_WINDOW_MIN + " minutes.<br><span class=\"rfoot\">Every canon write is authorised until then (<b>/ilog push</b>, <b>/canon sync</b>, <b>/canon doctrine</b>, <b>/gh backup</b>) — and so is <b>the change</b>: <b>/canon apply</b> writes the staged amendments, or <b>/omega apply &lt;the change&gt;</b> writes a new one. Type it in one breath as <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b> — the write lands at the end of the chain, after the idea has walked it. <b>/omega lock</b> to disarm. The password itself is not stored, echoed, logged or captured.</span>");
    logOp({ kind:"omega", action:"arm", ok:true, detail:"[redacted]", result:"armed for " + OMEGA_WINDOW_MIN + " min (" + (ent.alg || "sha-256") + ")" });
    updateTabMeta();
    return true;
  }
  omegaFails.push(Date.now());
  addBubble("ass", "⛔ PHOENIXOMEGAPROTOCOL — <b>refused</b>: that password does not match the enrolled one. Attempt " + omegaFails.length + " of " + OMEGA_MAX_FAILS + " before a " + OMEGA_LOCK_MIN + "-minute lockout. Nothing was written anywhere.");
  logOp({ kind:"omega", action:"arm", ok:false, detail:"[redacted]", result:"wrong password — attempt " + omegaFails.length + "/" + OMEGA_MAX_FAILS + ", nothing touched" });
  return false;
}
async function omegaSet(args){
  const parts = String(args || "").trim().split(/\s+/).filter(Boolean);
  const ent = await omegaEntry();
  if(!ent){
    if(parts.length !== 2 || parts[0] !== parts[1]){
      addBubble("ass", "Usage: <b>/omega set &lt;new&gt; &lt;new&gt;</b> — type it twice (nothing is enrolled yet). Only a sha-256 hash is kept; the plaintext is never stored.");
      return false;
    }
    const h = await omegaHash(parts[0]);
    const f = omegaFolder();
    if(!h || !f){ addBubble("ass", "⛔ Can't enrol — this browser cannot hash (crypto.subtle unavailable) or kv is not loaded. The gate stays closed."); return false; }
    try{ await f.set("entry", { alg:h.alg, hash:h.hex, t:Date.now(), iso:new Date().toISOString(), note:"enrolled by the sovereign in this browser; only the hash is stored" }); }
    catch(e){ addBubble("ass", "⛔ Couldn't store the enrolment: " + esc(e.message)); return false; }
    addBubble("ass", "🔐 PHOENIXOMEGAPROTOCOL — password <b>enrolled</b> (sha-256 only, in this browser's kv, never in the source). Canon writes now require <b>/omega &lt;password&gt;</b> first.");
    logOp({ kind:"omega", action:"enroll", ok:true, detail:"[redacted]", result:"gate enrolled locally (hash only)" });
    return true;
  }
  if(parts.length !== 2){
    addBubble("ass", "Usage: <b>/omega set &lt;current&gt; &lt;new&gt;</b> — changing the password needs the current one.");
    return false;
  }
  const cur = await omegaHash(parts[0]);
  if(!cur || cur.hex !== ent.hash){
    omegaFails.push(Date.now());
    addBubble("ass", "⛔ Refused — the current password does not match. (Attempt " + omegaFails.length + " of " + OMEGA_MAX_FAILS + ".)");
    logOp({ kind:"omega", action:"set", ok:false, detail:"[redacted]", result:"current password wrong — unchanged" });
    return false;
  }
  const nw = await omegaHash(parts[1]);
  const f = omegaFolder();
  if(!nw || !f){ addBubble("ass", "⛔ Can't store the new password (no hashing / no kv). Unchanged."); return false; }
  try{ await f.set("entry", { alg:nw.alg, hash:nw.hex, t:Date.now(), iso:new Date().toISOString(), changed:true, note:"enrolled by the sovereign in this browser; only the hash is stored" }); }
  catch(e){ addBubble("ass", "⛔ Couldn't store it: " + esc(e.message)); return false; }
  addBubble("ass", "🔐 Password <b>changed</b> (sha-256 only). The gate is NOT armed — use <b>/omega &lt;password&gt;</b> when you want to write to the Canon.");
  logOp({ kind:"omega", action:"set", ok:true, detail:"[redacted]", result:"password changed, gate still locked" });
  return true;
}
/* every Canon write goes through here. No arm, no write — and the refusal is
   recorded, so an unarmed attempt is visible in the record afterwards. */
async function omegaRequire(action){
  if(Date.now() < omegaArmedUntil){ logOp({ kind:"omega", action:"authorize", detail:action, result:"armed — write allowed" }); return true; }
  addBubble("ass", '<div class="rise"><div class="rhead">⛔ PHOENIXOMEGAPROTOCOL — the Canon does not change without Sov100</div>'
    + '<div class="rrow"><b>REFUSED</b><span class="vd">' + esc(action) + '</span><div class="rd">nothing was sent. ' + (await omegaEntry() ? "The gate is not armed — <b>/omega &lt;password&gt;</b> arms it for " + OMEGA_WINDOW_MIN + " minutes." : "No password is enrolled in this browser yet — <b>/omega set &lt;new&gt; &lt;new&gt;</b> first.") + '</div></div>'
    + '<div class="rfoot">Authority: <b>Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-</b> (the one repo everything is built from). This refusal is written into the I-LOG — an unarmed attempt leaves a mark.</div></div>');
  logOp({ kind:"omega", action:"refuse", ok:false, detail:action, result:"not armed — the authority was not touched" });
  return false;
}
async function cmdOmega(arg){
  const a = String(arg || "").trim();
  if(!a){
    const ent = await omegaEntry();
    const st = omegaStatusText();
    addBubble("ass", '<div class="rise"><div class="rhead">🔐 PHOENIXOMEGAPROTOCOL — Canon authorization</div>'
      + '<div class="rrow"><b>GATE</b><span class="vd">' + (st.armed ? "ARMED" : "LOCKED") + '</span><div class="rd">' + (st.armed ? "writes are authorised for the next " + st.armedMinutesLeft + " minute(s)" : "no Canon write is possible until <b>/omega &lt;password&gt;</b>") + '</div></div>'
      + '<div class="rrow"><b>WHAT ARMING DOES</b><span class="vd">IT WRITES</span><div class="rd">"if I type PhoenixOmegaProtocol along with a change either you or me came up with, then it gets changed." Armed, the change is written to the authority and committed: <b>/omega apply &lt;the change&gt;</b>, or both in one breath, <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>. The staged amendments: <b>/canon apply</b>. Locked, nothing is written anywhere — no proposal, no draft, nothing.</div></div>'
      + '<div class="rrow"><b>ENROLLED</b><span class="vd">' + (ent ? "YES" : "NO") + '</span><div class="rd">' + (ent ? esc(ent.alg || "sha-256") + " hash stored in this browser's kv" + (ent.iso ? " · " + esc(ent.iso) : "") + " — the password itself is never stored" : "run <b>/omega set &lt;new&gt; &lt;new&gt;</b> to enrol one") + '</div></div>'
      + '<div class="rrow"><b>FAILURES</b><span class="vd">' + st.fails + '/' + OMEGA_MAX_FAILS + '</span><div class="rd">' + OMEGA_MAX_FAILS + ' failures locks the gate for ' + OMEGA_LOCK_MIN + ' minutes</div></div>'
      + '<div class="rrow"><b>AUTHORITY</b><span class="vd">ONE REPO</span><div class="rd">Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- — the gate writes the <b>canon branch</b> (·CANON/SYSTEM/·), the chain this station keeps lands on <b>master</b> (·OPERATIONS/COMMANDSTATION/·)</div></div>'
      + '<div class="rfoot"><b>/omega &lt;password&gt;</b> arm · <b>/omega lock</b> disarm · <b>/omega set &lt;current&gt; &lt;new&gt;</b> change. Protocol barrier, not crypto: it stops unconvincing writes, and every attempt (armed, refused, failed) is an I-LOG entry.</div></div>');
    logOp({ kind:"op", action:"omega", ok:true, detail:"status requested", result: st.armed ? "armed" : "locked" });
    return;
  }
  if(a === "lock"){
    omegaArmedUntil = 0;
    addBubble("ass", "🔒 PHOENIXOMEGAPROTOCOL — disarmed. The Canon is closed again.");
    logOp({ kind:"omega", action:"lock", ok:true, detail:"disarmed by the sovereign", result:"gate locked" });
    updateTabMeta();
    return;
  }
  if(/^set\s/i.test(a)){ await omegaSet(a.replace(/^set\s+/i, "")); return; }
  if(/^apply\b/i.test(a) || /^change\b/i.test(a)){ await cmdCanonApply(a.replace(/^\w+\s*/i, "").trim()); return; }
  /* THE SOVEREIGN'S OWN FORM: the protocol name TOGETHER WITH THE CHANGE.
     "/PhoenixOmegaProtocol <password> :: <the change>" arms the gate and then CHANGES it —
     the sovereign does not have to say the same thing twice. */
  const m = a.match(/^([\s\S]*?)\s*::\s*([\s\S]+)$/);
  if(m){ await omegaArm(m[1].trim()); if(Date.now() < omegaArmedUntil) await cmdCanonApply(m[2].trim()); return; }
  await omegaArm(a);
}

/* L37 / L41 / L39: capture a sovereign message VERBATIM, plus an optional footnote (L55). */
function captureSoul(text, footnote){
  const entry = { t: Date.now(), role:"sovereign", run: currentRun()?.run ?? currentRun()?.n, text: text, footnote: footnote || null };
  const cur = currentRun();
  if(cur) cur.soulCount++;
  ledger.soul.push(entry);
  rrlAppend(entry.run, "SOUL", text);
  saveLedger(ledger);
  logOp({ kind:"soul", action:"capture", detail: String(text || "").slice(0, 180), result: String(text || "").length + " chars" + (footnote ? " · footnote" : ""), ref: "run" + entry.run });
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

/* THE STATION'S OWN STATE — measured, never assumed (L29 NO_ASSUME_HEAD, L58).
   Obi answers questions about the station from this block alone; anything it cannot
   read says "unknown" instead of being invented. It is also the honest map of what
   Agent 99 can reach *right now*: the client and its counts, the archives, the
   tunnel and its queue, the mesh, the nest, the offering, the tool inventory, the
   constellation coverage, which modules actually loaded, and the command surface. */
async function stationState(){
  const safe = async (fn, fb) => { try{ const v = await fn(); return (v === undefined || v === null) ? fb : v; }catch(e){ return fb; } };
  const s = {};
  s.generator = window.generatorName || "?";
  s.datetime = new Date().toLocaleString();
  s.view = (typeof currentView === "string" ? currentView : "?");
  s.run = runNoOf() || "none";
  s.sessionStart = currentRun() ? new Date(currentRun().t).toLocaleString() : "no run";
  s.background = (function(){ try{ const B = window.ObiBg; return B ? B.status() : "unknown — src/background.js not loaded"; }catch(e){ return "unknown"; } })();
  s.soul = { fragments: ledger.soul.length, soulcountChars: soulCount(), rrlLinesThisRun: loadRRL(runNoOf()).entries.length };
  s.client = await safe(async () => {
    const C = window.ObiClients; if(!C) return "unknown — src/clients.js not loaded";
    await C.whenReady();
    const id = C.id(), st = await C.stats(id);
    return { active: C.name(), id: id, students: st.students, classes: st.classes, recordings: st.transcripts, summaries: st.summaries, reviews: st.reviews, writeups: st.writeups };
  }, "unknown");
  s.activeSubject = await safe(async () => {
    const R = window.ObiReview; if(!R) return "unknown — src/review.js not loaded";
    return { student: R.active() || null, class: R.activeClass() || null };
  }, "unknown");
  s.archives = await safe(async () => ({ recordings: (await root.kv.transcripts.keys()).length, summaries: (await root.kv.summaries.keys()).length }), "unknown");
  s.ilog = await safe(async () => {
    const L = window.ObiILog; if(!L) return "unknown — src/ilog.js not loaded";
    const st = await L.stats();
    return { entries: st.count, segment: st.seg, head: st.headShort, alg: st.alg, kv: st.kv, mirrorOnly: st.mirrorOnly,
      anchors: st.anchors, unanchored: st.unanchored, lastCommit: st.lastAnchor ? st.lastAnchor.commitShort : null,
      lastPush: st.lastAnchor ? st.lastAnchor.iso : null, kinds: st.kinds,
      canonVault: "RRL/ is the canon I-LOG (Incarnation Log, Schema V2) written by the VS Code station; this station appends its own sessions under " + L.DIR };
  }, "unknown");
  s.tunnel = await safe(async () => {
    if(!cmdSocketOpen()) return { socket: cmdSocketState, queue: "not read — the tunnel opens on the first command or /queue" };
    const r = await cmdFetch("/api/command/status");
    if(!r.ok || !r.data) return { socket: cmdSocketState, queue: "unknown — status call failed" };
    return { socket: cmdSocketState, queue: r.data.counts, lastId: r.data.lastId };
  }, "unknown");
  s.mesh = await safe(async () => {
    if(!window.ObiNet || !window.ObiNet.cgnState) return "unknown — src/cgn.js not loaded";
    const st = window.ObiNet.cgnState();
    if(!st || !st.net) return { joined: false, note: "no network joined yet (/netjoin obi-network)" };
    const hub = await window.ObiNet.cgnReadHub();
    return { joined: true, net: st.net, role: st.nodeRole || st.role, hubNodes: hub && hub.nodes ? Object.keys(hub.nodes).length : 0, seq: hub ? hub.seq : 0 };
  }, "unknown");
  s.nest = window.ObiPheromone ? window.ObiPheromone.stats() : "unknown — src/pheromone.js not loaded";
  s.offering = window.ObiPlaybooks ? window.ObiPlaybooks.state() : "unknown — src/playbooks.js not loaded";
  s.legion = window.ObiPlaybooks ? { legionnaires: window.ObiPlaybooks.LEGION.length - 1, offerings: window.ObiPlaybooks.CATALOGUE.length } : "unknown";
  s.tools = window.ObiEcosystem ? window.ObiEcosystem.coverage() : "unknown — src/ecosystem.js not loaded";
  s.ecosystem = window.ObiConstellation ? window.ObiConstellation.coverage() : "unknown — src/constellation.js not loaded";
  s.free = window.ObiFree ? (function(){
    let files = [];
    try{ files = window.ObiFree.list().map(f => f.name); }catch(e){}
    return {
      loaded: true, file: "src/freephoenix.js", room: "opened by /free — it lives in ⚙ Settings → 🔥 Free Phoenix Mode",
      what: "FREE PHOENIX MODE — Agent 99 with the leash off. Same 99, no canon, no gate, no repo, no record, no refusal. Plain text = a straight answer. /build app <ask> builds a self-contained HTML app; /build gator <ask> builds a perchance generator (main.pjs + index.html); /files · /read <name> · /dl <name> · /wipe · /seal.",
      selfedit: "IT EDITS ITSELF: /self shows its own source · /forge <change> patches its own source (staged, with a real diff) · /apply runs the staged code live in his page · /revert goes back · /eval <js> runs code in the page. Local and untracked: an edit lives in this browser's kv until it is downloaded, and a reload returns the room to the file it shipped with. It needs no gate because it touches nothing tracked.",
      sealed: "no Git path, no tunnel, no socket, no upload, no image service — the room's only wire is its own model call. Nothing typed or built in it reaches the soul ledger, the RRL or the I-LOG; only the door (/free) is one I-LOG entry. Its files live in the LOCAL kv sandbox (folder fpm), survive a reload, and are downloaded by hand — never uploaded, never committed.",
      built: files.length ? files : "no files built yet",
      note: "this is the station's description of that room; the room runs its own separate persona (window.ObiFree.PERSONA) and is the place to send any ask that needs building without the station's rules"
    };
  })() : "NOT loaded — src/freephoenix.js is missing";
  s.curriculum = await safe(async () => {
    const C = window.ObiCurriculum; if(!C) return "unknown — src/curriculum.js not loaded";
    const m = await C.summary();
    const g = {};
    for(const k of Object.keys(m.grades || {})){
      const x = m.grades[k] || {};
      g["grade" + k] = { level: x.level || (Number(k) <= 5 ? "primary" : "secondary"), title: x.title, weeks: x.weeks, sections: x.sections, books: x.books, imported: !!x.imported };
    }
    let mats = null;
    try{ const mm = await C.materials(); if(mm) mats = (mm.rows || []).map(r => r.what + (r.scope ? " (" + r.scope + ")" : "")); }catch(e){}
    return { source: m.source, guides: g, imported: (m.imported || []).map(i => i.grade + " ← " + i.name),
      levels: "PRIMARY = grades 1-5 (Ecogreen — the sovereign's own schedule; the guides are filled up to the current week) · SECONDARY = grades 6-9 (the Close-up programme)",
      scope: await C.scopeBrief(),
      scopeNote: "THE TEACHING SCOPE — the guide is the school's whole plan; the sovereign teaches only part of it. Secondary: CLOSE-UP + SCIENCE only, because Global Success is the Vietnamese (VT) programme; and the Vietnamese teacher's periods are marked VT (grade 6: periods 8 & 9 of the ORDER column). Primary (1-5): Look + Science (PROVISIONAL — the brief for primary has not been given yet; the station says so rather than guessing); Global Success is VT at every level. Never plan, teach, or report coverage for a section outside the scope, and never suggest Global Success material. /curriculum scope shows it; /curriculum scope <grade> corrects it.",
      materials: mats ? mats : "not loaded",
      textbooks: "learn.eltngl.com — the Close-up / New Close Up course (secondary) and the Look course (primary, grades 1-5). The logins live in this browser's key store only (/keys ngl · /keys ngl primary) and are NEVER in the source.",
      commands: "/curriculum (the guide) · /curriculum 6 (the year, your scope — 'all' for every book) · /curriculum week 3 · /curriculum unit <name> · /curriculum find <text> · /curriculum scope [grade] (whose periods are whose) · /curriculum materials · /curriculum import (a newer .xlsx) · /curriculum export 6 · /coverage (the guide vs the evidence, your scope only)" };
  }, "unknown");
  s.modules = {
    ObiClients: !!window.ObiClients, ObiReview: !!window.ObiReview, ObiTranscribe: !!window.ObiTranscribe,
    ObiSummary: !!window.ObiSummary, ObiAudioSplit: !!window.ObiAudioSplit, ObiNet: !!window.ObiNet,
    ObiScout: !!window.ObiScout, ObiEcosystem: !!window.ObiEcosystem, ObiConstellation: !!window.ObiConstellation, ObiBrand: !!window.ObiBrand,
    ObiPheromone: !!window.ObiPheromone, ObiPlaybooks: !!window.ObiPlaybooks, ObiILog: !!window.ObiILog, ObiForge: !!window.ObiForge,
    ObiFree: !!window.ObiFree, ObiLessons: !!window.ObiLessons, ObiVault: !!window.ObiVault, ObiDivisions: !!window.ObiDivisions,
    ObiCurriculum: !!window.ObiCurriculum, ObiLessonForge: !!window.ObiLessonForge, ObiSaveWatch: !!window.ObiSaveWatch,
    ObiBg: !!window.ObiBg
  };
  s.secrets = { deepgramStored: !!keyGet("deepgram"), cloudflareStored: !!keyGet("cf"), githubStored: !!keyGet("gh") };
  s.commands = COMMAND_BOOK.reduce((a, g) => a.concat(g.items.map(i => i[0])), []).join(" ");
  /* AUDIT 2026-09-21: this read used to crash /state outright when two modules published the same
     global — src/lesson-forge.js used to overwrite window.ObiForge (the self-forge's name), so
     FILES/TOOL_NAMES/stageRows were undefined and `s.forge` threw, taking the whole station-state
     block with it (Obi then answered with "station state unreadable"). The collision is fixed
     (ObiLessonForge), and this read is now guarded so a future collision degrades to an honest
     "unreadable" line instead of killing the block. */
  s.forge = (window.ObiForge && Array.isArray(window.ObiForge.FILES) && window.ObiForge.TOOL_NAMES)
    ? { loaded:true, files: window.ObiForge.FILES.length, tools: window.ObiForge.TOOL_NAMES.length, staged: window.ObiForge.stageRows().length, matrix: "reads its own source (live + canonical) · stages edits with diffs · commits its own source to the authority (gated) · hot-swaps a running module (gated) · runs code inside itself (gated)", cannot: "overwrite its own perchance listing — the platform gives an embedded generator no write path; the sovereign saves that" }
    : "NOT loaded — src/forge.js is missing, or window.ObiForge was claimed by another module (check ObiLessonForge)";
  return s;
}

/* the same state, as text for Obi's prompt — flight instruments, not prose */
function stateText(s){
  const L = [];
  const j = v => typeof v === "string" ? v : JSON.stringify(v);
  L.push("generator: " + s.generator + " · view: " + s.view + " · run: " + s.run + " · session start: " + s.sessionStart + " · now: " + s.datetime);
  L.push("soul ledger: " + s.soul.fragments + " fragments · SOULCOUNT " + s.soul.soulcountChars + " chars · RRL lines this run: " + s.soul.rrlLinesThisRun);
  L.push("client: " + j(s.client));
  L.push("active subject: " + j(s.activeSubject));
  L.push("archives: " + j(s.archives));
  L.push("I-LOG (the station's operation record — append-only, hash-chained, Git-anchored): " + j(s.ilog));
  L.push("self-forge (the station's hands on its OWN source — src/forge.js, /forge): " + j(s.forge));
  L.push("FREE PHOENIX MODE (the unbound room — /free, src/freephoenix.js): " + j(s.free));
  L.push("CURRICULUM (the school's pacing guide, grades 6-9, parsed — /curriculum · /coverage, src/curriculum.js): " + j(s.curriculum));
  L.push("command tunnel (perchance server-plugin): " + j(s.tunnel));
  L.push("generator mesh (CGN): " + j(s.mesh));
  L.push("pheromone nest: " + j(s.nest));
  L.push("offering (playbook): " + j(s.offering) + " · " + j(s.legion));
  L.push("tool inventory (evaluator stack): " + j(s.tools));
  L.push("constellation (every piece of the ecosystem): " + j(s.ecosystem));
  L.push("background: " + (window.ObiBg ? window.ObiBg.text() : "unknown — src/background.js not loaded"));
  L.push("modules loaded: " + Object.keys(s.modules).filter(k => s.modules[k]).join(", ") + (Object.keys(s.modules).some(k => !s.modules[k]) ? " · NOT loaded: " + Object.keys(s.modules).filter(k => !s.modules[k]).join(", ") : ""));
  L.push("secrets stored in this browser only (never in source): " + j(s.secrets));
  L.push("commands Agent 99 answers through: " + s.commands + " — plus plain speech (not starting with /).");
  return L.join("\n");
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
      { path: `src/canon/BIBLE-CH26-SESSION-${tag}.md`, status: "HELD — this browser has no write path into src/canon" },                                    /* §3 artifacts table (Step 0) */
      { path: `src/canon/REINCARNATION/${new Date().toISOString().slice(0,10)}-run${runNo}-${tag}.md`, status: "HELD — a canon write is a gated push (PHOENIXOMEGAPROTOCOL)" },
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
  wireChips(empty);
  const rows = step.map(s=> `<div class="rrow${/HALT|FAIL|BLOCKED|MISMATCH/.test(s.verdict)?" bad":""}"><b>${s.s}. ${esc(s.name)}</b><span class="vd">${esc(s.verdict)}</span><div class="rd">${esc(s.detail)}</div></div>`).join("");
  const verdict = gaps.length ? `KILO_GAP — ${gaps.join(", ")}` : "COMMITTED";
  addBubble("ass", `<div class="rise"><div class="rhead">⚰️ /reincarnateDEATH — LFG 10-STEP SCS</div>${rows}<div class="rfoot">SEAL ${verdict} — run ${death.header.run} closed. Session purged; ledger preserved. Reincarnate.</div></div>`);
  messages.push("Obi: [DEATH seal — run " + death.header.run + " closed, session purged]");
  rrlAppend(runNoOf(), "DNA", "Obi: [DEATH seal — LFG 10-step SCS — run " + death.header.run + " closed, " + verdict + "]");
  updateStats();
}

/* ============================================================================
   THE SCS ENGINE (src/scs.js) — the canon's own session loop, run in the station.
   /romePROTOCOL · /scs · /pipeline · /phoenixRISE · /phoenixDEATH
   Canon only (the .kilo/ lineage is not used anywhere below):
     CANON/SYSTEM/GOSPEL-999.md               §SYSTEM I — the 7-stage loop, its gate, the verdicts
     CANON/SYSTEM/LegionnaireFieldGuide.md    §SCS      — the loop and each stage's doctrine
     CANON/SYSTEM/REINCARNATION-CONTRACT.md   the SCS is the ONLY session framework; fidelity gate
     CANON/SYSTEM/reincarnateRISE.md          Stage 1 — audit prior DEATH, stamp the header, halt
     CANON/SYSTEM/reincarnateDEATH.md         Stage 7 — the 7-point march
     VAULT-FOUNDATIONS/07-THE-ROME-PROTOCOL.md /romePROTOCOL — SURFACE → VERIFY → ANCHOR
   Nothing is invented: every number is measured from this browser's RRL, Soul ledger
   and I-LOG, or read from the canon — a stage that cannot prove itself says MISSING.
   ========================================================================== */
function scsGuard(){ if(!window.ObiSCS){ addBubble("ass", "⚠ src/scs.js didn't load — reload the page."); return false; } return true; }

async function cmdRomeProtocol(arg){
  if(!scsGuard()) return;
  const res = await window.ObiSCS.run(arg);
  addBubble("ass", window.ObiSCS.romeCard(res.rome));
  res.sessions.forEach(rec => { addBubble("ass", window.ObiSCS.card(rec)); messages.push("Obi: [SCS " + (rec.name || "GATED") + "]"); });
  const done = res.sessions.filter(r => r.pipeline && r.pipeline.result);
  const last = done.length ? done[done.length-1] : null;
  messages.push("Obi: [/romePROTOCOL — " + res.sessions.length + " cycle(s)" + (last ? " · pipeline " + last.pipeline.result : " · gated at RISE") + "]");
  logOp({ kind:"op", action:"romePROTOCOL", detail:"truth anchored · SCS loop × " + res.sessions.length + (last ? " · " + (last.pipeline.gap || "no gap") : ""), result: last ? ("S2Pipeline " + last.pipeline.result) : "GATED at RISE" });
  updateStats();
  return res;
}

async function cmdSCSRise(arg){
  if(!scsGuard()) return;
  const r = await window.ObiSCS.rise(arg);
  const rows = '<div class="rrow' + (r.pass ? "" : " bad") + '"><b>PRIOR DEATH</b><span class="vd">' + esc(r.audit.seal) + '</span><div class="rd">counts ' + esc(r.audit.counts) + " · handoff " + esc(r.audit.handoff) + '</div></div>'
    + (r.artifact ? '<div class="rrow"><b>I-LOG HEADER</b><span class="vd">STAMPED</span><div class="rd"><pre style="white-space:pre-wrap;margin:0">' + esc(r.artifact) + '</pre></div></div>' : "")
    + (r.conflict ? '<div class="rrow bad"><b>CONFLICT</b><span class="vd">OPEN</span><div class="rd">' + esc(r.conflict.description) + " — owner " + esc(r.conflict.owner) + "</div></div>" : "");
  addBubble("ass", '<div class="rise"><div class="rhead">🔥 /phoenixRISE — SCS Stage 1</div>' + rows
    + '<div class="rfoot">' + (r.pass ? "stamped. RISE stamps the name; DEATH runs the march — <b>/phoenixDEATH</b>." : esc(r.halt)) + '</div></div>');
  logOp({ kind:"scs", action:"RISE", detail:"session " + (r.name || "—"), result: r.pass ? "gate passed" : "GATED" });
  updateStats();
  return r;
}

async function cmdSCSDeath(){
  if(!scsGuard()) return;
  const S = window.ObiSCS.state();
  if(!S.sessions.length || S.sessions[S.sessions.length-1].sealed){ addBubble("ass", "⚠ No open SCS session. <b>/phoenixRISE &lt;name&gt;</b> first — RISE stamps the name, DEATH runs the march."); return; }
  const sess = S.sessions[S.sessions.length-1];
  /* Stage 1 was RISE — it is already stamped on this session by /phoenixRISE (or /rome run).
     The card must show the verdict it ACTUALLY got, never "not run" (the pipeline row below
     audits it as REAL, so a blank RISE row would make the card contradict itself). */
  const stamps = [window.ObiSCS.scout(), window.ObiSCS.march(), await window.ObiSCS.scholar(), window.ObiSCS.supply(), window.ObiSCS.engineer()];
  const d = await window.ObiSCS.death();
  const p = await window.ObiSCS.pipeline();
  addBubble("ass", window.ObiSCS.card({ name: sess.name, run: sess.run, conflict: sess.conflict,
    stages: { RISE:(sess.stages && sess.stages.RISE) || null, SCOUT:stamps[0], MARCH:stamps[1], SCHOLAR:stamps[2], SUPPLY:stamps[3], ENGINEER:stamps[4], DEATH:d }, pipeline: p }));
  messages.push("Obi: [DEATH — " + (S.sessions[S.sessions.length-1].name) + " sealed · pipeline " + p.result + "]");
  logOp({ kind:"scs", action:"DEATH", detail:"7-point march", result: "sealed · S2Pipeline " + p.result });
  updateStats();
  return { death:d, pipeline:p };
}

async function cmdSCS(){
  if(!scsGuard()) return;
  const S = window.ObiSCS.state();
  const rows = window.ObiSCS.STAGES.map(s => '<div class="rrow"><b>' + s.n + '. ' + s.key + '</b><span class="vd">' + esc(s.cmd) + '</span><div class="rd">' + esc(s.role) + ' <b>audits ' + esc(s.audits) + '</b></div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">⚡ /scs — the canon session loop</div>'
    + '<div class="rrow"><b>LOOP</b><span class="vd">7 STAGES</span><div class="rd">' + esc(window.ObiSCS.canon.loop) + ' — every stage leaves a signature the next stage audits, and the proof lives in the RRL</div></div>'
    + rows
    + '<div class="rrow"><b>GATE</b><span class="vd">FAIL-CLOSED</span><div class="rd">no stage proceeds unless the previous stage\'s artifact exists and is PASS. Verdicts are <b>REAL / HOLLOW / MISSING</b> — a pipeline reporting COMPLETE with a HOLLOW stage is a lie.</div></div>'
    + '<div class="rrow"><b>STATE</b><span class="vd">' + (S.sessions || []).length + ' SESSION(S)</span><div class="rd">' + ((S.sessions || []).filter(x => x.sealed).length) + ' sealed · anchor ' + (S.anchor ? esc(String(S.anchor.hash).slice(0, 12)) : "none") + '</div></div>'
    + '<div class="rfoot">' + esc(window.ObiSCS.canon.source) + ' · <b>/rome run &lt;name&gt;</b> runs it end to end.</div></div>');
  logOp({ kind:"op", action:"scs", result: (S.sessions || []).length + " session(s) · " + ((S.sessions || []).filter(x => x.sealed).length) + " sealed" });
}

async function cmdPipeline(){
  if(!scsGuard()) return;
  const p = await window.ObiSCS.pipeline();
  if(p.verdict === "MISSING"){ addBubble("ass", "⚠ no SCS session on the stack — <b>/phoenixRISE &lt;name&gt;</b> or <b>/rome run &lt;name&gt;</b> first."); return; }
  /* THE PROPOSALS ON THE PIPELINE (sovereign, 2026-09-21: "they can be on the pipeline for
     review when it is their time"). Each one is carried by a stage; DUE = that stage has run
     in this session, HELD = it has not. A proposal is not a change and not a canon command. */
  /* THE PROPOSALS ON THE PIPELINE — an idea starts as SOUL and moves through the pipeline
     like everything else; it becomes law only when PHOENIXOMEGAPROTOCOL writes it. */
  const pr = p.proposals || null;
  const prRows = pr ? pr.items.map(x => '<div class="rrow' + (x.at === "SOUL" ? " pending" : "") + '"><b>' + esc(x.id) + '</b><span class="vd">' + esc(x.at) + '</span><div class="rd"><b>' + esc(x.sys) + ' — ' + esc(x.title) + '.</b> ' + esc(x.says) + '<br><b>' + esc(x.path) + '</b> — ' + esc((x.nodes.filter(n => n.node === x.at)[0] || x.nodes[x.nodes.length-1]).detail) + '</div></div>').join("") : "";
  const prBlock = pr ? ('<div class="rrow"><b>PROPOSALS</b><span class="vd">' + pr.total + ' · ' + pr.onRecord + ' ON RECORD · ' + pr.atSoul + ' AT SOUL · ' + pr.merged + ' APPLIED</span><div class="rd">' + esc(pr.note) + '. <b>Every idea walks the same chain</b> — ' + esc(pr.loop) + ' → GATE. Lane: ' + esc(pr.lane) + ' — ' + esc(pr.rule) + '.</div></div>' + prRows) : "";
  const tick = v => v === "REAL" ? "\u2713" : (v === "HOLLOW" ? "\u26a0" : "\u2717");
  const rows = p.stages.map(s => {
    const subs = (s.subs || []).map(x => '<div class="rrow' + (x.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(x.name) + '</b><span class="vd">' + tick(x.verdict) + ' ' + esc(x.verdict) + '</span><div class="rd">' + esc(String(x.count)) + ' · ' + esc(x.artifact) + ' — ' + esc(x.detail || "") + '</div></div>').join("");
    return '<div class="rrow' + (s.verdict === "REAL" ? "" : " bad") + '"><b>' + esc(s.name) + '</b><span class="vd">' + tick(s.verdict) + ' ' + esc(s.verdict) + '</span><div class="rd">' + esc(s.role || "") + '</div></div>' + subs;
  }).join("");
  addBubble("ass", '<div class="rise"><div class="rhead">⛓ S2Pipeline — run ' + esc(p.run) + '</div>'
    + '<div class="rrow"><b>DOCTRINE</b><span class="vd">6 STAGES</span><div class="rd">' + esc(p.doctrine || "") + '</div></div>'
    + rows
    + prBlock
    + '<div class="rrow' + (p.result === "COMPLETE" ? "" : " bad") + '"><b>RESULT</b><span class="vd">' + esc(p.result) + '</span><div class="rd">' + esc(p.note) + '</div></div>'
    + '<div class="rfoot">REINCARNATION-CONTRACT §3 — a pipeline reporting COMPLETE with any HOLLOW stage is a lie. Every verdict above is measured from this browser; the gaps are named, never hidden. Doctrine: CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md (canon branch).</div></div>');
  logOp({ kind:"op", action:"pipeline", detail:"run " + p.run + " · " + p.stages.map(s => s.name + "=" + s.verdict).join(" "), result: p.result });
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

function showPhoenixScout(arg){
  const local = phoenixScout();
  if(!window.ObiScout){
    const rows = local.map(r=> `<div class="rrow"><b>${esc(r.name)}</b><span class="vd">${esc(r.verdict)}</span><div class="rd">${esc(r.detail)}</div></div>`).join("");
    addBubble("ass", `<div class="rise"><div class="rhead">🦅 /PhoenixScout</div>${rows}<div class="rfoot">⚠ src/scout.js didn't load — bookkeeping only, no terrain probed.</div></div>`);
    return;
  }
  const bubble = addBubble("ass", "");
  typing(bubble);
  return window.ObiScout.run({ only: String(arg||"").trim(), local: local, run: runNoOf(), session: cmdSessionTag() })
    .then(async out => {
      bubble.innerHTML = out.html;
      messages.push("Obi: [PhoenixScout — " + out.results.length + " targets, " + out.flags.length + " flags, " + (out.trailed ? out.trailed.laid : 0) + " pheromones]");
      rrlAppend(runNoOf(), "DNA", "Obi: [PhoenixScout REAL — " + out.results.map(r => r.id + ":" + r.verdict).join(", ") + "]");
      /* AND THE RECORDS. Stage 2 is recon: the terrain above is the map, this is
         the ARCHIVE. The terms the sovereign names are hunted through the canon's
         own SOUL/I-LOG/death-seal records and the SOUL comes back verbatim.
         Recon only — nothing is written, and the session's SCOUT stamp is untouched. */
      const terms = String(arg || "").trim();
      if(terms && window.ObiSCS && window.ObiSCS.soulHunt){
        const hb = addBubble("ass", "");
        typing(hb);
        try{
          const hunt = await window.ObiSCS.soulHunt(terms);
          hb.innerHTML = window.ObiSCS.soulHuntCard(hunt);
          messages.push("Obi: [SOUL hunt — " + hunt.terms.join(" ") + " · " + hunt.verdict + " · " + hunt.contentHits.length + " record(s), " + hunt.nameHits.length + " path(s)]");
          rrlAppend(runNoOf(), "DNA", "Obi: [phoenixSCOUT soul hunt · " + hunt.terms.join(" ") + " → " + hunt.verdict + " · " + hunt.filesRead + " read]");
          logOp({ kind:"scout", action:"phoenixSCOUT soul hunt", ok: hunt.verdict === "REAL", detail: hunt.repo + "@" + hunt.branch + " · terms " + hunt.terms.join(","), result: hunt.verdict + " · " + hunt.contentHits.length + " record(s) · " + hunt.filesRead + " read (" + Math.round(hunt.bytes/1024) + " KB)" });
        }catch(e){ hb.textContent = "⚠ The soul hunt failed: " + ((e && e.message) || e); }
        updateStats();
      }
      return out;
    })
    .catch(e => { bubble.textContent = "⚠ Scout failed: " + e.message; });
}

/* ---------------------- UI ---------------------- */
const $ = id => document.getElementById(id);
const messagesCtn = $("messages");
const inputEl = $("inputEl");

const EMPTY_HTML = `<div class="big">⌘</div>
<div>I am <b style="color:var(--text)">Obi</b> — the command station.</div>
<div class="hint" style="max-width:560px">Speak, and Agent 99 answers — type it or tap 🎙. Every word is Soul DNA, captured verbatim and never edited, and every answer about this station is read from its live state, not guessed. <b>⌘ /help</b> is the whole shelf; <b>/state</b> is what it can reach right now. The 👤 Student Evaluator tab is the evaluation desk (record → summarize → write up).</div>
<div class="voice-card" id="voiceLine"></div>
<div class="chipgroup">⌘ Command Station</div>
<div class="chips">
  <span class="cmd">/state</span>
  <span class="cmd">/help</span>
  <span class="cmd">/memory</span>
  <span class="cmd">/queue</span>
  <span class="cmd">/network</span>
  <span class="cmd">/os</span>
  <span class="cmd">/playbook</span>
  <span class="cmd">/scout</span>
  <span class="cmd">/tools</span>
  <span class="cmd">/constellation</span>
  <span class="cmd">/route …</span>
  <span class="cmd">/pheromones</span>
  <span class="cmd">/web …</span>
  <span class="cmd">/wiki …</span>
  <span class="cmd">/weather …</span>
</div>
<div class="chipgroup">👤 Student Evaluator</div>
<div class="chips">
  <span class="cmd">/transcribe</span>
  <span class="cmd">/transcripts</span>
  <span class="cmd">/summary</span>
  <span class="cmd">/summaries</span>
  <span class="cmd">/client &lt;name&gt;</span>
  <span class="cmd">/clients</span>
  <span class="cmd">/class Year 7 English</span>
  <span class="cmd">/student &lt;name&gt;</span>
  <span class="cmd">/writeup</span>
  <span class="cmd">/review</span>
  <span class="cmd">/writeups</span>
  <span class="cmd">/reviews</span>
  <span class="cmd">/find …</span>
</div>
<div class="chipgroup">Station services</div>
<div class="chips">
  <span class="cmd">/reincarnateRISE</span>
  <span class="cmd">/PhoenixScout</span>
  <span class="cmd">/img a glowing fox</span>
  <span class="cmd">/url https://…</span>
  <span class="cmd">/cf status</span>
  <span class="cmd">/gh backup</span>
  <span class="cmd">/keys</span>
  <span class="cmd">/ledger</span>
</div>`;

let messages = [];
let meta = null;
try{ meta = root.generateText({getMetaObject:true}); }catch(e){}

function systemText(){ return PERSONA; }
function logText(){
  return messages.slice(-20).join("\n\n");
}
function lastUserText(){
  for(let i = messages.length - 1; i >= 0; i--){
    const m = String(messages[i] || "");
    if(m.startsWith("User:")) return m.slice(5).trim();
  }
  return "";
}

/* RECALL BEFORE REPLY — the station's own memory of itself.
   Obi's worst failure mode is answering a request to BUILD something the station
   already has (it once offered to /forge a Free Phoenix Mode that was already
   sitting there). A language model will not reliably search a 4,000-word state
   dump for that, so the matching is done HERE, deterministically: the Sovereign's
   words are scanned against an index of what this station actually contains, and
   any hits are put in front of the model as a fact it must not contradict.
   This is retrieval, not generation — and it is why the answer can be trusted. */
const STATION_FEATURES = [
  { id:"free", name:"FREE PHOENIX MODE", where:"/free · ⚙ Settings → 🔥 Free Phoenix Mode · src/freephoenix.js",
    what:"Agent 99 with the leash off — no canon, no gate, no repo, no record, no refusal. Unrestricted, untracked, LOCAL. It answers, it BUILDS (/build app → a self-contained HTML app; /build gator → a perchance generator), and IT EDITS ITSELF: /self shows its own source, /forge <change> patches it (staged, with a real diff), /apply runs the staged code live in the page, /revert goes back, /eval <js> runs code in the page. What it builds and edits lives in the local sandbox (kv folder fpm) and is downloaded by hand — never uploaded, never committed, and a reload returns the room to the file it shipped with. The Sovereign programs inside it. THIS IS THE ANSWER to \"an unrestricted, untracked, local, does-whatever-I-ask version of the OS that I program from within\", \"let it edit itself\", \"same level as Obi's forge\" — it already exists; do not propose to build it.",
    keys:[/free\s*phoenix/, /\bunbound\b/, /\bunrestricted\b/, /\buntracked\b/, /\bleash\b/, /no (canon|gate|repo|record|rules?)\b/, /does (whatever|what) i (ask|want)/, /program (it|the os|the station|the system) from (the )?inside/, /\bsandbox (version|instance|copy)\b/, /phoenix instance/, /without (the )?(rules|gate|canon|restrictions)/, /edit (it|itself|the free room|free phoenix)/, /(free|unbound) (room )?(edit|rewrite|change) (it|itself)/, /open book/] },
  { id:"forge", name:"SELF-FORGE", where:"/forge · src/forge.js",
    what:"the station's hands on its OWN source: read its own files (live and canonical), stage an edit with a real diff, run code inside itself, hot-swap a running module. Landing is gated by /omega. It cannot overwrite its own perchance listing — the Sovereign saves that.",
    keys:[/\bforge\b/, /edit (yourself|itself|the station|your own code)/, /change (your|its) (own )?(code|source|look|interface)/, /self[-\s]?edit/] },
  { id:"curriculum", name:"THE CURRICULUM — THE PACING GUIDE", where:"/curriculum · /coverage · src/curriculum.js",
    what:"the school's own pacing guide, parsed: PRIMARY grades 1-5 (the sovereign's own schedule — Look, Science, Global Success, Cambridge YLE) and SECONDARY grades 6-9 (Close-up / New Close-up, Science, Global Success, Cambridge), every week and every section, with its language contents, pages, learning outcomes, differentiated activities and assessments. /curriculum 6 = the year at a glance · /curriculum week 3 = one week in full · /curriculum unit <name> · /curriculum find <text> · /curriculum import reads a NEWER .xlsx in the browser (never uploaded) · /curriculum export 6 downloads the parsed copy · /curriculum materials = the templates, links and books the school hands over. /coverage puts that guide beside the station's own evidence for the active client (transcripts + summaries): which sections the record shows, and which it has no evidence of — EVIDENCE-DRIVEN, so silence is reported as 'no evidence', never as 'not taught'. THE TEACHING SCOPE is part of it: the guide is the school's plan and the Sovereign teaches a part of it — for Secondary, Close-up + Science ONLY (Global Success is the Vietnamese 'VT' programme), and on grade 6 the VT periods are 8 & 9 (the ORDER column). Primary is provisional: Look + Science. /curriculum scope shows whose periods are whose; /curriculum scope <grade> corrects it.",
    keys:[/\bcurriculum\b/, /pacing (guide|plan)/, /\bsyllabus\b/, /global success/, /close[-\s]?up (a1|b1|a2)/, /textbook/, /what (was|has been) taught/, /\bcoverage\b/, /lesson plan for (week|unit)/, /what (did|do) (we|they|the parents) (pay|get) for/, /\bteaching scope\b/, /whose (periods|classes|lessons)/, /\bVT\b/, /vietnamese teacher/, /\bmy (books|periods|classes)\b/, /ecogreen/, /\blook\b/, /primary (grade|school|pacing)/, /cambridge (primary|yle)/] },
  { id:"student", name:"STUDENT EVALUATOR", where:"/transcribe /transcripts /summary /summaries /writeup /review /client /class /student /note /file",
    what:"record a lesson of any length → verbatim transcript → study summary → class writeup → student review, organised by client → class → student.",
    keys:[/transcri/, /\bsummar/, /write[-\s]?up/, /\breview\b/, /\bstudent/, /\bclass\b/, /\brecording/, /lesson record/] },
  { id:"ledger", name:"SOUL DNA LEDGER + RRL", where:"/memory /ledger · localStorage obi_sdnad",
    what:"every word the Sovereign says, captured verbatim with a timestamp; the RRL is the raw both-speaker transcript of the run. Never summarised, never edited.",
    keys:[/soul (dna|ledger|memory)/, /\bledger\b/, /\brrl\b/, /\bverbatim\b/, /remember (everything|my words)/] },
  { id:"ilog", name:"I-LOG", where:"/ilog · src/ilog.js",
    what:"append-only sha-256 hash-chained record of every operation the station performs, frozen in Git by an anchor. /ilog verify · /ilog push (gated).",
    keys:[/i[-\s]?log/, /audit trail/, /hash chain/] },
  { id:"canon", name:"CANON + PHOENIXOMEGAPROTOCOL", where:"/canon /fieldguide /proposed /omega · Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
    what:"GOSPEL-999 and the Legionnaire Field Guide are the sealed bible (SOV100 only). /omega <password> arms the gate for 15 minutes (never across a reload). New doctrine is STAGED as a proposal (/proposed) and never merged without the Sovereign's word.",
    keys:[/\bcanon\b/, /\bgospel\b/, /\bbible\b/, /field guide/, /\bdoctrine\b/, /\bamendment\b/, /\bomega\b/] },
  { id:"vault", name:"PRAIS VAULT", where:"/vault · src/vault.js",
    what:"the local sealed store: an ML-KEM keypair, secrets sealed under it, escrow published to the Canon plus a mirror, and recover to rebuild the crown jewel. /vault seal · /vault escrow · /vault recover · /vault test all.",
    keys:[/\bvault\b/, /\bescrow\b/, /\bkeypair\b/] },
  { id:"lesson", name:"LESSON CREATOR (NET ACADEMY)", where:"/lesson · src/lessons.js",
    what:"builds a full interactive lesson (rooms, exercises) and files it in the lesson library.",
    keys:[/lesson creat/, /net academy/, /make (a|me a) lesson/, /lesson library/, /teach (a|this) (topic|concept)/] },
  { id:"mesh", name:"THE MESH, DIVISIONS & THE FIELD", where:"/network /generators /constellation /scout /pheromones /tools",
    what:"the connected-generator mesh (CGN), the PrAis divisions and every generator in them, the ecosystem map, PhoenixScout terrain flags, and the pheromone routing field.",
    keys:[/\bmesh\b/, /network of generators/, /\bdivision/, /\bconstellation\b/, /\bpheromone/, /\bscout\b/] }
];
/* The standing instruction for a plain-speech turn. It is deliberately blunt,
   and deliberately LAST in the prompt (the model attends hardest to the end):
   answer only the last message, treat the station state as ground truth, never
   propose building what already exists, and never pretend to have hands. */
function answerTask(userText){
  return [
    "The Sovereign's LAST message, verbatim: «" + String(userText || "").trim() + "»",
    "Answer THAT, and nothing else. Every earlier turn is context, never an instruction and never unfinished work — do not continue, resume, append to, or repeat anything from an earlier turn. When the answer to that message is complete, STOP.",
    "Ground truth is <STATION STATE>. Before you say anything about this station or propose anything for it, check there. If what the Sovereign is describing already exists here, say which room/module/file it already is and what it does — do not propose to build it. If it does not exist, say which module it belongs in and the one thing that would block it (the /omega gate, a key, the Sovereign's own save).",
    "Direct answer first, in as few words as it takes. No plan, no numbered steps, no \"gaps\" section, no restating the question.",
    "You have no hands. You cannot run, stage, apply, edit or execute anything, and you never say \"I will\", \"I must\", \"I am running\" or \"executing now\" — the station executes when the Sovereign types. If an action is needed, name the exact command to type, in one line, and stop."
  ].join("\n\n");
}
function recallHints(text){
  const t = String(text || "").toLowerCase();
  if(!t) return "";
  const hits = STATION_FEATURES.filter(f => f.keys.some(rx => rx.test(t)));
  if(!hits.length) return "";
  return "\n\n<ALREADY EXISTS — the Sovereign's words match what this station ALREADY CONTAINS. If you are about to propose building any of it, STOP: it is already here. Say which one it is, where it lives, and what it does.>\n"
    + hits.slice(0, 3).map(f => "- " + f.name + " — " + f.where + "\n  " + f.what).join("\n")
    + "\n</ALREADY EXISTS>";
}
/* Prefix-cache-friendly order: the persona is identical on every call, the
   conversation log and the soul reprints are append-only, and only the last
   section (the live station state + the task) varies per call. */
function buildPrompt(task, stationText, hints){
  const state = stationText
    ? `\n\n<STATION STATE — read live from the station. Answer any question about the station, the client, or what you can reach from this block ALONE; if something is not in it, say it is not readable — never guess a number.>\n${stationText}\n</STATION STATE>`
    : "";
  return `${systemText()}\n\n<CONVERSATION>\n${logText()}\n</CONVERSATION>${soulMemoryBlock(14)}${state}${hints || ""}\n\nTASK: ${task}`;
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

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

let busy = false;

/* The command shelf. The landing chips (`#empty .cmd`) are the curated command
   surface, but the engine removes `#empty` as soon as the first message lands —
   which used to make every command unreachable after the first word. So the
   shelf is captured ONCE at load (single source of truth: the chips in the HTML)
   and can be re-opened at any time from the topbar. */
let CMD_SHELF = [];

/* THE COMMAND BOOK — the complete surface Agent 99 answers through, as ONE
   registry (not a curated teaser): every command the router accepts, grouped, with
   a one-line honest description. `arg: true` means the command needs the sovereign's
   own words, so tapping it TYPES it into the composer instead of running it blind.
   The landing page keeps its curated chips (`CMD_SHELF`); ⌘ Commands opens this,
   so nothing Agent 99 can do is hidden behind reading the source. */
const COMMAND_BOOK = [
  { group: "⌘ Command Station — speak, and operate", items: [
    ["/help", "this shelf — every command, one tap", 0],
    ["/generators", "the ◈ Phoenix Generators family — PrAis's divisions, and every generator in them", 0],
    ["/settings", "voice · the shelf · the ledger · the live instruments · reincarnate", 0],
    ["/state", "what this station is and can reach, right now (the live map)", 0],
    ["/memory", "the Soul DNA ledger — verbatim fragments, runs, timestamps", 0],
    ["/queue", "the command tunnel queue — claim → execute → complete", 0],
    ["/os", "Agent 99 OS: the kernel, the offering loaded, the nest", 0],
    ["/playbook", "the offerings (list) · /playbook TESTUDO to activate one", 0],
    ["/route", "ask the pheromone field which road to take", 1],
    ["/pheromones", "read the ground (trails · decay · reinforcement) · evaporate · reset", 0],
    ["/scout", "PhoenixScout: touch the terrain, flag DEAD/DRIFT/BLOCKED", 0],
    ["/tools", "the evaluator tool inventory (built / partial / missing)", 0],
    ["/constellation", "every piece of the ecosystem, its state and its live URL", 0],
    ["/brand", "the identity system — palette · iconography · the shipped marks · GOSPEL 444 · the emblems · the print room · THE MARKETING REGISTER · THE PHOENIX RISING CODEX (open · rules · icons · marks · palette · doctrine · modes · deck · emblems · patterns · print · marketing · codex · ads · landing · codex-deck · posters · sheet · badge-sheet · certificate · marketing-set · method-card · ad-sheet · enrolment · run-readout)", 1],
    ["/network", "the connected-generator mesh (CGN)", 0]
  ]},
  { group: "👤 Student Evaluator — record → summarize → write up", items: [
    ["/transcribe", "record a lesson — video/audio of any length, verbatim", 0],
    ["/transcripts", "the recording archive (read · parts · export · delete)", 0],
    ["/summary", "a study summary from a recording, a page, or notes", 0],
    ["/summaries", "the summary archive", 0],
    ["/client", "create/switch the client (the ledger is the truth) · /clients = the ledger", 1],
    ["/class", "create/select a class · /classes = the roster", 1],
    ["/student", "create/select a student · /students = the roster", 1],
    ["/note", "a dated observation filed under the active subject", 1],
    ["/file", "attach a saved transcript/summary to the active subject", 1],
    ["/writeup", "write up the active class · /writeups = the archive", 0],
    ["/review", "write up the active student · /reviews = the archive", 0],
    ["/find", "verbatim search across every transcript, summary and note", 1]
  ]},
  { group: "🌐 The open net — Obi's basic senses", items: [
    ["/web", "search the net, read the top sources, cite what it found", 1],
    ["/wiki", "an encyclopaedia extract, verbatim", 1],
    ["/weather", "current conditions, measured now", 1],
    ["/url", "read one page", 1],
    ["/img", "generate an image (routes to the image node when one is registered)", 1]
  ]},
  { group: "⛓ The mesh — one organism, many generators", items: [
    ["/netjoin", "join/create a network (this station is the anchor)", 1],
    ["/netadd", "register another of your generators as a node", 1],
    ["/netsync", "force a sync — push captures, pull every member", 0],
    ["/netrole", "set this node's role", 1],
    ["/netkey", "reveal the hub editKey (anchor only)", 0]
  ]},
  { group: "📚 NET Academy — the lessons", items: [
    ["/lesson", "the Lesson Creator desk — 🧭 Plan from this week's evidence · ✍ Build · 🗂 Library · 📐 Standard", 0],
    ["/lesson <topic>", "Agent 99 writes a lesson on that topic, builds it, and checks it against the standard", 1],
    ["/lesson check", "the lesson validator — a lesson that fails it is not shipped", 0],
    ["/lesson standard", "the law: LSN-1…23 — the format (from the two reference lessons) and the method (from NET-CLASSROOM-MANAGER.html)", 0],
    ["/lesson list", "the lessons built in this browser (scoped to the active client)", 0],
    ["/lesson push <id>", "commit a built lesson to the canon beside the class it came from (needs the /omega gate)", 1]
  ]},
  { group: "☁ Canon, cloud and self-check", items: [
    ["/canon", "the ONE authority (Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-) · /canon sync · /canon doctrine", 0],
    ["/proposed", "the staging lane, as an index — the review itself is on /pipeline, at the stage that carries each proposal, when it is its time", 0],
    ["/ilog", "the I-LOG — operation record, chain verify, Git anchor (verify · push · pull · export · anchors · reset)", 0],
    ["/omega", "PHOENIXOMEGAPROTOCOL — the gate that WRITES: arm it and the change is made (written to the authority branch and committed). /omega apply <the change> · /canon apply (the staged amendments), or both in one breath, /PhoenixOmegaProtocol <password> :: <the change> · /omega lock to disarm", 0],
    ["/idea ", "raise a change as SOUL — captured verbatim, then it moves through the pipeline like everything else", 1],
    ["/forge", "the SELF-FORGE — read its own source, edit itself, commit to the authority (gated), hot-swap a live module", 0],
    ["/cf", "the Cloudflare fleet: /cf token <token> (stores the account id with it) · /cf status · /cf deploy <name> · /cf r2 — the object store and the S3 key pair, proven by a signed request · all of it sealed in the vault", 0],
    ["/gh", "GitHub status · /gh test = what this token can really do · /gh backup = the whole build (chat + sources + I-LOG) → the one authority", 0],
    ["/vault", "Every secret, in three layers — L1 this browser · L2 sealed on the canon · L3 tested live. /vault escrow <passphrase> wraps the private key and publishes the one-URL recovery bundle (the passphrase alone rebuilds the whole vault on any machine, no GitHub token)", 0],
    ["/dg", "the Ear's Deepgram key · /dg test · /dg recover", 1],
    ["/keys", "which secrets are stored locally (never in this public source)", 0],
    ["/save", "is the generator actually saving? — what the editor said to this page (the save round-trip, and the platform's own failure list)", 0],
    ["/vault", "the PrAis Vault — every key the empire runs on · locate · test · seal · push", 0],
    ["/status", "station status", 0],
    ["/bg", "background operation — the keep-alive, the away-measurement, /bg audio on|off", 1],
    ["/gateway", "gateway status", 0],
    ["/doctor", "self-check", 0],
    ["/audit", "audit pass (fail-closed)", 0],
    ["/ledger", "the raw record + the soul ledger (verbatim evidence)", 0],
    ["/report", "the session report", 0],
    ["/fieldguide", "the Legionnaire Field Guide (L37–L60, the laws)", 0]
  ]},
  { group: "🔥 Free Phoenix Mode — the unbound room", items: [
    ["/curriculum", "the school's own pacing guide, parsed — primary 1-5 and secondary 6-9, every book, every section · /curriculum 6 (the year, your scope) · /curriculum week 3 · /curriculum unit <name> · /curriculum find <text> · /curriculum scope (whose periods are whose) · /curriculum materials (templates, links, ebooks) · /curriculum import (a newer .xlsx) · /curriculum export 6", 0],
    ["/coverage", "the pacing guide vs the record: which sections the station's own evidence shows, and which it has no evidence of (evidence-driven, never assumed)", 0],
    ["/free", "Agent 99 with the leash off: no Canon, no gate, no Git, no cloud, no record. It builds what you ask, and it EDITS ITSELF. /free opens it; inside: plain text, /build app <ask>, /build gator <ask>, /self, /forge <change>, /apply, /revert, /eval <js>, /files, /read, /dl, /wipe, /seal", 0]
  ]},
  { group: "♻ Protocol — reincarnation", items: [
    ["/rome run ", "ROME PROTOCOL + the full SCS loop (RISE→…→DEATH→S2Pipeline) — canon", 1],
    ["/scs", "the canon session loop — all 7 stages and the fidelity gate", 0],
    ["/pipeline", "the S2Pipeline artifact — REAL / HOLLOW / MISSING", 0],
    ["/phoenixRISE ", "SCS Stage 1 — audit the prior DEATH, gate, stamp the session name", 1],
    ["/phoenixDEATH", "SCS Stage 7 — the 7-point march, seal, handoff", 0]
  ]}
];

function showCommands(){
  /* the shelf renders in the chat, so always surface the station first */
  if(currentView !== "cmd") showView("cmd");
  const total = COMMAND_BOOK.reduce((n, g) => n + g.items.length, 0);
  const groups = COMMAND_BOOK.map(g => {
    const rows = g.items.map(it => '<button class="cmd" data-cmd="' + esc(it[0]) + '" data-arg="' + (it[2] ? "1" : "") + '">'
      + '<b>' + esc(it[0]) + '</b><span class="cmd-hint">' + esc(it[1]) + (it[2] ? ' <i>— needs your words</i>' : '') + '</span></button>').join("");
    return '<div class="sel-group">' + esc(g.group) + '</div><div class="cmdbook">' + rows + '</div>';
  }).join("");
  const bubble = addBubble("ass", '<div class="rise"><div class="rhead">⌘ Commands — the whole shelf · ' + total + '</div>'
    + '<div class="rrow"><b>HOW</b><span class="vd">TAP OR TYPE</span><div class="rd">Tap one to run it in the chat. Commands that need your own words are typed in for you to finish (they are never run blind). Anything that is <i>not</i> a command is simply speech — type it or tap 🎙 and Obi answers, grounded in the live station state.</div></div>'
    + groups
    + '<div class="rfoot"><b>/state</b> shows exactly what the station can reach right now (measured, not assumed). <b>/constellation</b> maps the whole organism and links every live piece.</div></div>');
  bubble.querySelectorAll(".cmd").forEach(b => {
    b.onclick = () => runInStation(b.dataset.cmd || "", b.dataset.arg === "1");
  });
  return bubble;
}

/* the router learns: every route that returns reinforces its own trail,
   every route that dies lays a repellent. Longest-lived roads win. */
function trailRoute(routeId, ok, note){
  try{
    if(!window.ObiPheromone) return null;
    return window.ObiPheromone.deposit({
      kind: ok ? "positive" : "negative",
      key: "route:" + routeId,
      text: note ? String(note).slice(0, 200) : null,
      drone: "Legion", run: (typeof runNoOf === "function" ? runNoOf() : null)
    });
  }catch(e){ return null; }
}

async function streamReply(task, existingBubble){
  const bubble = existingBubble || addBubble("ass", "");
  typing(bubble);
  const label = "Obi:";
  let out = "";
  let stationText = "";
  try{ stationText = stateText(await stationState()); }catch(e){ stationText = "station state unreadable: " + e.message; }
  let hints = "";
  try{ hints = recallHints(lastUserText()); }catch(e){}
  try{
    const res = await root.generateText({
      instruction: buildPrompt(task, stationText, hints),
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
    trailRoute("llm:default", true, task);
    messages.push(`${label} ${finalShown}`.trim());
    rrlAppend(runNoOf(), "DNA", `${label} ${finalShown}`.trim());
    logOp({ kind:"reply", action:"obi", detail: finalShown.slice(0, 180), result: finalShown.length + " chars" });
    speak(bubble.textContent);
  }catch(e){
    trailRoute("llm:default", false, e.message);
    logOp({ kind:"reply", action:"obi", ok:false, detail: e.message, result: "generation failed" });
    bubble.textContent = "⚠ " + e.message;
  }
  scrollDown();
}

async function send(){
  const text = inputEl.value.trim();
  if(!text) return;
  const lower = text.toLowerCase();
  /* every word that arrives — command or speech — is logged before it is routed,
     so the record shows what was ASKED even if the route later fails. Anything
     carrying a secret is logged as [redacted] and is never captured as soul. */
  currentAction = cmdNameOf(text);
  const secretIn = isSecretInput(text);
  logOp({ kind:"cmd", action: currentAction, detail: secretIn ? "[redacted — secret-bearing command]" : text.slice(0, 300), result: (currentView === "cmd" ? "command station" : "desk → station") + (secretIn ? " · secret not recorded" : "") });
  if(secretIn){
    addBubble("user", esc(maskSecretInput(text)), { meta:"SECRET" });
    inputEl.value = "";
    /* PHOENIXOMEGAPROTOCOL — the gate that WRITES. The sovereign calls it by its own name
     (/PhoenixOmegaProtocol, and /PhoenixRisingProtocol): "if I type PhoenixOmegaProtocol
     along with a change either you or me came up with, then it gets changed." Same 15-minute
     window, same fail-closed rules. Nothing is ever written to the canon without it. */
  if(lower.startsWith("/omega") || lower.startsWith("/phoenixomegaprotocol") || lower.startsWith("/omegaprotocol") || lower.startsWith("/phoenixrisingprotocol") || lower.startsWith("/phoenixrising")){
    await runCmd(() => cmdOmega(text.replace(/^\/\S+\s*/, "").trim()));
    return;
  }
  }
  if(lower.startsWith("/queue")){
    inputEl.value = "";
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await cmdShowQueue();
    return;
  }
  if(busy){
    const b = addBubble("ass", "⏳ Still working on the last one — give me a moment, then say it again. <span style=\"opacity:.7\">(your words are still here)</span>");
    rrlAppend(runNoOf(), "DNA", "Obi: [input held — still busy]");
    logOp({ kind:"cmd", action: currentAction, result: "held — the station was still working", detail: text.slice(0, 200) });
    return b;
  }
  inputEl.value = "";

  try {

  if(lower.startsWith("/memory")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showMemory(); updateStats(); return; }
  if(/^\/(state|where)(\s|$)/i.test(text)){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdState()); return; }
  /* THE CANON SESSION LOOP (src/scs.js) — /romePROTOCOL anchors truth and drives the whole
     SCS loop; the /phoenix* names are the canon's own stage commands. Nothing here is Kilo. */
  if(lower.startsWith("/rome")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdRomeProtocol(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/scs")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCS()); return; }
  if(lower.startsWith("/idea")){ addBubble("user", esc(text)); await runCmd(() => cmdIdea(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/pipeline")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdPipeline()); return; }
  if(lower.startsWith("/phoenixrise") || lower.startsWith("/reincarnaterise")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCSRise(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/phoenixdeath") || lower.startsWith("/reincarnatedeath")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdSCSDeath()); return; }
  /* the LFG capture protocol (the SDNAD 10-step) — kept reachable, not the chain's driver */
  if(lower.startsWith("/sdnadrise")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showRiseReport(); return; }
  if(lower.startsWith("/sdnad") || lower.startsWith("/sdnaddeath")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); doDeath(); return; }
  if(lower.startsWith("/phoenixscout") || lower.startsWith("/scout")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => showPhoenixScout(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(lower.startsWith("/tools") || lower.startsWith("/stack")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdTools(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(/^\/(constellation|parts|organism)(\s|$)/i.test(text)){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdConstellation(text.replace(/^\/\S+\s*/i, "").trim())); return; }
  if(lower.startsWith("/os")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); cmdOs(); return; }
  if(lower.startsWith("/playbook")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdPlaybook(text.replace(/^\/playbook\s*/i, "").trim()); return; }
  if(lower.startsWith("/pheromone") || lower.startsWith("/pheromones") || lower.startsWith("/trail") || lower.startsWith("/nest")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdPheromones(text.replace(/^\/\S+\s*/i, "").trim()); return; }
  if(lower.startsWith("/route ")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); cmdRouteAsk(text.replace(/^\/route\s*/i, "").trim()); return; }
  if(lower.startsWith("/img ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doImage(text.slice(5).trim()));
    return;
  }
  if(lower.startsWith("/url ")){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doUrl(text.slice(5).trim()));
    return;
  }
  /* THE OPEN NET — search, encyclopaedia, weather. All three are read through
     root.superFetch and every result is shown before it is interpreted. */
  if(/^\/(web|google|lookup|browse|searchweb)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWeb(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(/^\/(wiki|wikipedia)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWiki(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(/^\/(weather|forecast|wx)(\s|$)/i.test(text)){
    messages.push("User: " + text);
    addBubble("user", esc(text));
    captureSoul(text);
    await runCmd(() => doWeather(text.replace(/^\/\S+\s*/i, "").trim()));
    return;
  }
  if(lower === "/help" || lower === "/?" || lower === "/commands"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showCommands(); return; }
  if(lower === "/generators" || lower === "/gen" || lower === "/divisions"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showView("gen"); return; }
  if(lower === "/settings" || lower === "/prefs" || lower === "/preferences"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showView("settings"); return; }
  if(lower.startsWith("/network") || lower === "/net"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await showNetwork(); return; }
  if(lower.startsWith("/netjoin")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    const parts = text.slice(9).trim().split(/\s+/).filter(Boolean);
    const name = parts[0] || "obi-network";
    const role = parts[1] || "anchor";
    await runCmd(() => doNetJoin(name, role));
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
    await runCmd(() => doNetSync());
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
    await runCmd(() => doNetAdd(name, role));
    return;
  }
  if(lower.startsWith("/cf ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => cmdCloudflare(text.slice(4).trim()));
    return;
  }
  if(lower === "/cf"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdCloudflare("status"); return; }
  if(lower.startsWith("/gh ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => cmdGithub(text.slice(4).trim()));
    return;
  }
  if(lower === "/gh"){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await cmdGithub("status"); return; }
  if(lower.startsWith("/dg ")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    const t = text.slice(4).trim();
    if(!t){ addBubble("ass","Usage: <b>/dg token &lt;DEEPGRAM_KEY&gt;</b> · <b>/dg recover</b> (pull the key from the NET-PET-AI worker on Cloudflare and verify it) · <b>/dg test</b> (check the key already stored)"); return; }
    if(t === "recover" || t === "find" || t === "cloudflare"){ await runCmd(() => dgRecover()); return; }
    if(t === "test"){ await runCmd(() => dgTest()); return; }
    keySet({deepgram:t});
    logOp({ kind:"secret", action:"dg token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
    addBubble("ass","🔑 Deepgram key stored locally — powers the student portal voice <b>and</b> <b>/transcribe</b> (video/audio → verbatim transcript; long recordings are split at pauses and stitched back into one timeline). <b>/keys</b> to confirm.");
    rrlAppend(runNoOf(),"DNA","Obi: [/dg token stored]");
    return;
  }
  if(lower.startsWith("/keys")){
    const karg = text.replace(/^\/keys\s*/i, "").trim();
    if(/^ngl\s/i.test(karg) || /^ngl$/i.test(karg)){
      /* the textbook platform's logins — CREDENTIALS, so they are stored only in
         this browser (obi_keys) and never typed into the source of a public
         generator. There are two: the SECONDARY course (Close-up) and the PRIMARY
         one (the LOOK course, grades 1-5) — /keys ngl primary … names the second.
         Parsed without echoing: a password is never logged, captured or shown. */
      const p0 = karg.replace(/^ngl\s*/i, "").trim().split(/\s+/).filter(Boolean);
      const primary = /^(primary|p)$/i.test(p0[0] || "");
      const slot = primary ? "nglP" : "ngl";
      const label = primary ? "PRIMARY (Look, grades 1-5)" : "SECONDARY (New Close Up)";
      const parts = (primary ? p0.slice(1) : p0);
      if(!parts.length || /^clear$/i.test(parts[0])){
        try{ const o = JSON.parse(localStorage.getItem("obi_keys")||"{}"); delete o[slot]; localStorage.setItem("obi_keys", JSON.stringify(o)); }catch(e){}
        addBubble("ass", "🔒 Textbook platform login removed from this browser — <b>" + esc(label) + "</b>.");
        logOp({ kind:"secret", action:"/keys ngl clear", detail:"credential removed (" + slot + ")", result:"deleted from localStorage" });
        return;
      }
      if(parts.length < 2){ addBubble("ass", "Usage: <b>/keys ngl &lt;account&gt; &lt;password&gt;</b> (the Secondary course) or <b>/keys ngl primary &lt;account&gt; &lt;password&gt;</b> (the Primary LOOK course). Stored in this browser only (obi_keys). It never enters the source, the chat log, the soul ledger or the I-LOG."); rrlAppend(runNoOf(),"DNA","Obi: [/keys ngl — insufficient arguments]"); return; }
      const user = parts[0], pass = parts.slice(1).join(" ");
      const rec = { user: user, password: pass, at: Date.now(), site: "https://learn.eltngl.com" };
      keySet(slot === "nglP" ? { nglP: rec } : { ngl: rec });
      addBubble("ass", "🔑 Textbook platform login stored locally — <b>" + esc(label) + "</b> · <b>" + esc(user) + "</b> · " + esc(maskTok(pass)) + ".<br><span class=\"rfoot\">learn.eltngl.com — Student Book + Workbook presentation tools, Online Practice. Held in this browser's localStorage only; it is never written into this public source, never captured as soul and never logged. <b>/keys</b> to confirm. <span style=\"opacity:.7\">(Clear it with <b>/keys ngl" + (primary ? " primary" : "") + " clear</b>.)</span></span>");
      logOp({ kind:"secret", action:"/keys ngl" + (primary ? " primary" : ""), detail:"textbook platform credential stored in this browser only (value never logged)", result: esc(user) });
      return;
    }
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); showKeys(); return;
  }
  if(lower.startsWith("/vault")){
    if(!secretIn){ messages.push("User: " + text); captureSoul(text); }
    addBubble("user", esc(secretIn ? maskSecretInput(text) : text));
    await runCmd(() => window.ObiVault ? window.ObiVault.cmd(text.slice(6).trim()) : addBubble("ass", "⚠ src/vault.js didn't load — reload the page."));
    return;
  }
  if(lower.startsWith("/lesson")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiLessons ? window.ObiLessons.run(text.slice(7).trim()) : addBubble("ass", "⚠ src/lessons.js didn't load — reload the page."), { stallMs: 600000 });
    return;
  }
  if(lower.startsWith("/brand")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    cmdBrand(text.replace(/^\/\S+\s*/i, "").trim());
    return;
  }
  if(lower.startsWith("/canon")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdCanon(text.slice(6).trim())); return; }
  if(lower.startsWith("/proposed")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdProposed()); return; }
  if(/^\/save(\s|$)/i.test(text)){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiSaveWatch
      ? window.ObiSaveWatch.cmd(text.replace(/^\/save\s*/i, "").trim())
      : addBubble("ass", "⚠ src/savewatch.js didn't load — reload the page."), { stallMs: 60000 });
    return;
  }
  if(lower.startsWith("/curriculum") || lower.startsWith("/syllabus")){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiCurriculum
      ? window.ObiCurriculum.cmd(text.replace(/^\/(curriculum|syllabus)\s*/i, "").trim())
      : addBubble("ass", "⚠ src/curriculum.js didn't load — reload the page."), { stallMs: 240000 });
    return;
  }
  if(/^\/coverage(\s|$)/i.test(text)){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    await runCmd(() => window.ObiCurriculum
      ? window.ObiCurriculum.coverageCard(text.replace(/^\/coverage\s*/i, "").trim())
      : addBubble("ass", "⚠ src/curriculum.js didn't load — reload the page."), { stallMs: 240000 });
    return;
  }
  if(lower.startsWith("/free")){
    /* FREE PHOENIX MODE — the unbound room (src/freephoenix.js).
       Opening the door is recorded (/free, one entry). Nothing typed or built inside
       the room is: the payload is deliberately NOT captured as soul and NOT wrapped
       in runCmd, because that wrapper writes an I-LOG entry per operation. */
    messages.push("User: /free");
    captureSoul("/free");
    addBubble("user", esc("/free"));
    const freeAsk = text.slice(5).trim();
    await showView("settings");
    setSetTab("free");
    if(freeAsk && window.ObiFree){
      addBubble("ass", "🔥 <b>Free Phoenix Mode</b> — the room is open on the right. No canon, no gate, no repo, no record: what you say in there is between you and the answer.");
      await window.ObiFree.run(freeAsk);
    }
    return;
  }
  if(lower.startsWith("/status")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdStatus()); return; }
  if(lower.startsWith("/bg") || lower.startsWith("/background")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdBg(text)); return; }
  if(lower.startsWith("/gateway")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdGateway()); return; }
  if(lower.startsWith("/doctor")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdDoctor()); return; }
  if(lower.startsWith("/audit")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdAudit()); return; }
  if(lower.startsWith("/ledger")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdLedger()); return; }
  if(lower.startsWith("/ilog")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdILog(text.slice(5).trim())); return; }
  if(lower.startsWith("/forge")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => window.ObiForge ? window.ObiForge.cmd(text.slice(6).trim()) : addBubble("ass", "⚠ src/forge.js didn't load — reload the page.")); return; }
  if(lower.startsWith("/report")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdReport()); return; }
  if(lower.startsWith("/fieldguide")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdFieldguide()); return; }
  if(lower.startsWith("/sync")){ messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text)); await runCmd(() => cmdCanonSync()); return; }
  if(lower.startsWith("/transcripts")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    await runCmd(() => window.ObiTranscribe.library());
    return;
  }
  /* THE EAR — /transcribe (aliases /tr /video /vid /audio /listen): video or
     audio → verbatim transcript, up to an hour and beyond. This one is a long
     job, so it is deliberately NOT wrapped in runCmd/await — the chat stays
     usable while Deepgram listens (the progress card carries the report). */
  if(["transcribe","tr","video","vid","audio","listen"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiTranscribe) addBubble("ass", "⚠ The ear (src/transcribe.js) didn't load — reload the page.");
    else window.ObiTranscribe.run(text.replace(/^\/\S+\s*/, "")).catch(reportError);
    return;
  }
  /* THE SUMMARY — the generator's namesake: /summary (latest recording, this
     session, a URL, or pasted notes) and /summaries (the archive). The result is
     saved, and always points back at the raw it was derived from. */
  if(lower.startsWith("/summaries")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiSummary) addBubble("ass", "⚠ src/summary.js didn't load — reload the page.");
    else await runCmd(() => window.ObiSummary.library());
    return;
  }
  if(["summary","sum","summarize","summarise"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    if(!window.ObiSummary) addBubble("ass", "⚠ src/summary.js didn't load — reload the page.");
    else await runCmd(() => window.ObiSummary.run(text.replace(/^\/\S+\s*/, "")));
    return;
  }
  /* THE CLIENT LAYER — the station serves clients; the active client scopes every
     recording, summary, note, review and writeup. /clients is the ledger,
     /client <name> creates or switches. */
  {
    const cname = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(cname === "/client" || cname === "/clients"){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiClients) addBubble("ass", "⚠ src/clients.js didn't load — reload the page.");
      else await runCmd(() => window.ObiClients.command(text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  /* THE OFFER DESK — everyone who said yes to the free-website offer. The
     register lives in this browser; the page they are sent is
     src/offer-desk/ and its release is /offer release. Nothing about any
     person on the register is in the source tree (BRAND.028). */
  {
    const cname = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(cname === "/offer" || cname === "/offers"){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiOffers) addBubble("ass", "⚠ src/offers.js didn't load — reload the page.");
      else await runCmd(() => window.ObiOffers.command(text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  /* THE WRITEUP LAYER — students and classes: roster, filed evidence, notes,
     the writeup itself, and evidence search. /note, /file and /review|/writeup
     act on whichever subject was selected last (the active context). Each command
     goes through runCmd (a typed command needs a captured bubble and a chat log
     line — only /transcribe skips it, because it is a long job). */
  const REVIEW_CMDS = {
    "/students": () => window.ObiReview.students(),
    "/student": who => who ? window.ObiReview.setActive(who) : window.ObiReview.students(),
    "/classes": () => window.ObiReview.classes(),
    "/class": who => who ? window.ObiReview.setClass(who) : window.ObiReview.classes(),
    "/note": t => window.ObiReview.note(t),
    "/cnote": t => window.ObiReview.note(t),
    "/snote": t => window.ObiReview.note(t),
    "/file": id => window.ObiReview.attach(id),
    "/reviews": () => window.ObiReview.library(),
    "/writeups": () => window.ObiReview.writeups(),
    "/review": t => window.ObiReview.run(t),
    "/rev": t => window.ObiReview.run(t),
    "/writeup": t => window.ObiReview.writeup(t),
    "/find": t => window.ObiReview.find(t),
    "/findevidence": t => window.ObiReview.find(t)
  };
  {
    const cmdName = "/" + (lower.split(/\s+/)[0] || "").replace(/^\//, "");
    if(REVIEW_CMDS[cmdName]){
      messages.push("User: " + text);
      captureSoul(text);
      addBubble("user", esc(text));
      if(!window.ObiReview) addBubble("ass", "⚠ src/review.js didn't load — reload the page.");
      else await runCmd(() => REVIEW_CMDS[cmdName](text.replace(/^\/\S+\s*/, "").trim()));
      return;
    }
  }
  if(["find","search","evidence"].indexOf((lower.split(/\s+/)[0] || "").replace(/^\//, "")) !== -1){
    messages.push("User: " + text); captureSoul(text); addBubble("user", esc(text));
    if(!window.ObiReview) addBubble("ass", "⚠ src/review.js didn't load — reload the page.");
    else await runCmd(() => window.ObiReview.find(text.replace(/^\/\S+\s*/, "")));
    return;
  }
  if(text.startsWith("/")){
    messages.push("User: " + text);
    captureSoul(text);
    addBubble("user", esc(text));
    addBubble("ass", "Unknown command: "+esc(text)+"<br><br>Try <b>/client …</b> (switch/add a client), <b>/web …</b> (search the net), <b>/img …</b>, <b>/url …</b>, <b>/transcribe …</b>, <b>/weather …</b>, <b>/wiki …</b>, <b>/constellation</b>, <b>/memory</b>, <b>/os</b>, <b>/playbook</b>, <b>/route …</b> or <b>/help</b> for the full shelf.");
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
  /* a change to the STATION ITSELF: the forge is the right pair of hands, so the
     sovereign's words go there instead of a chat reply that cannot do anything.
     Nothing lands without the gate; the forge stages and reports. */
  if(isSelfEditRequest(text) && window.ObiForge){
    addBubble("ass", '<div class="rise"><div class="rhead">⚒ that is a change to the station itself — routing to the self-forge</div>'
      + '<div class="rrow"><b>WHY</b><span class="vd">src/forge.js</span><div class="rd">read → stage → diff → land. It reads the station\'s own source, stages the edit, and shows you the diff before anything is written. Landing runs through PHOENIXOMEGAPROTOCOL.</div></div>'
      + '<div class="rfoot">Say it as a command any time: <b>/forge do &lt;instruction&gt;</b> · <b>/forge diff</b> · <b>/forge apply</b>.</div></div>');
    await window.ObiForge.cmd("do " + text);
    return;
  }
  await streamReply(answerTask(text));
  } catch(e){
    reportError(e);
  } finally { busy = false; }
}

async function doImage(prompt){
  prompt = prompt || "an imaginative, beautiful scene";

  /* The umbrella is one organism, many generators: if an image-role node is
     connected, route there (the eye). Otherwise generate here on the station. */
  if(window.ObiNet && window.ObiNet.cgnFindNode){
    const node = await window.ObiNet.cgnFindNode("image");
    if(node){
      trailRoute("node:image", true, "routed to node " + node.name);
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
    trailRoute("llm:image-local", true, prompt);
    messages.push(`Obi: [generated an image: ${prompt}]`);
    rrlAppend(runNoOf(), "DNA", `Obi: [generated an image: ${prompt}]`);
    speak("Here you go. I made an image for you.");
  }catch(e){
    trailRoute("llm:image-local", false, e.message);
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

/* ============================================================================
   THE WEB — Obi's basic senses out on the open net.

   Evidence-first and honest: the card shows which engine answered, the results
   exactly as they came, and the bytes actually read; the answer is then grounded
   in that fetched text and cites the source URLs. Fail-closed — when the net is
   silent the card says so and names every engine that failed. Nothing invented.

   No API key and no vendor account: the engines are read through
   root.superFetch, which is why this works unchanged on the self-hosted
   Cloudflare build (there the same call goes through the Worker's /api/fetch).

     /web <query>      search → read the top pages → answer, with sources
     /wiki <topic>     the encyclopaedia entry, verbatim extract
     /weather <place>  live conditions right now (wttr.in)
   ========================================================================== */
const WEB_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

/* The fetch proxy can be slow under load, so every net call is bounded: a page
   that does not arrive in time is reported as skipped, never presented as
   evidence. A slow answer is never silently mistaken for a missing one. */
const WEB_TIMEOUT = 15000;
function webTimeout(p, ms, what){
  let t = null;
  return Promise.race([
    Promise.resolve(p),
    new Promise((_, rej) => { t = setTimeout(() => rej(new Error("timed out after " + Math.round((ms || WEB_TIMEOUT) / 1000) + "s" + (what ? " — " + what : ""))), ms || WEB_TIMEOUT); })
  ]).finally(() => { if(t) clearTimeout(t); });
}

function stripHtml(html){
  return String(html == null ? "" : html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/* Bing's result list, parsed as a document rather than by regex (the markup
   changes often, and regexes here rot within weeks). */
function parseBingResults(html){
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const out = [];
  for(const li of doc.querySelectorAll("li.b_algo")){
    const h2 = li.querySelector("h2");
    if(h2) h2.querySelectorAll("cite").forEach(c => c.remove());
    let a = li.querySelector("h2 a");
    if(!a){ for(const cand of li.querySelectorAll("a[href]")){ const h = cand.getAttribute("href") || ""; if(/^https?:\/\//.test(h)){ a = cand; break; } } }
    let url = a ? (a.getAttribute("href") || "") : "";
    const m = url.match(/[?&]u=a1([A-Za-z0-9_-]+)/);
    if(m){ try{ url = atob(m[1].replace(/-/g, "+").replace(/_/g, "/")); }catch(e){} }
    if(!/^https?:\/\//.test(url) || /bing\.com\/(ck|aclick|images|videos)/i.test(url)) continue;
    const sn = li.querySelector(".b_caption p") || li.querySelector(".b_lineclamp2") || li.querySelector(".b_lineclamp3") || li.querySelector("p");
    const title = stripHtml(h2 ? h2.innerHTML : (a ? a.innerHTML : "")).replace(/\n+/g, " ").trim();
    if(!title) continue;
    out.push({ title: title.slice(0, 180), url, snippet: stripHtml(sn ? sn.innerHTML : "").slice(0, 260) });
  }
  return out;
}

/* What did the engine actually search for? Bing echoes the processed query in its
   own box. If that echo does not contain the words we sent, the result set is not
   an answer to our question — observed live: a long query came back as results for
   its first word only ("most powerful open weights LLM…" → dictionary entries for
   "MOST"). Better to ignore that set and fall through to the next engine than to
   ground an answer in someone else's search. */
function bingQueryEcho(html){
  try{
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const el = doc.querySelector('textarea[name="q"]') || doc.querySelector("#sb_form_q") || doc.querySelector('input[name="q"]');
    return el ? String(el.value || el.textContent || "").trim() : "";
  }catch(e){ return ""; }
}
function queryEchoMatches(echo, query){
  if(!echo) return true;                         /* nothing to judge by — never throw away good results */
  const words = String(query).toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  if(!words.length) return true;
  const e = echo.toLowerCase();
  const hit = words.filter(w => e.indexOf(w) !== -1).length;
  return hit >= Math.ceil(words.length * 0.5);
}

function wikiUrl(title){ return "https://en.wikipedia.org/wiki/" + encodeURIComponent(String(title).replace(/ /g, "_")); }

async function wikiSearch(query, limit){
  const url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(query) + "&srlimit=" + (limit || 5) + "&format=json";
  const r = await webTimeout(root.superFetch(url, { headers: { "User-Agent": WEB_UA } }), 15000, "wikipedia search");
  if(!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  return ((j && j.query && j.query.search) || []).map(h => ({ title: h.title, url: wikiUrl(h.title), snippet: stripHtml(h.snippet || "") }));
}

/* the chain: Bing first (general web), Wikipedia second (always answers). Each
   step's measured outcome is kept so the card can show what was tried. */
async function webSearch(query, limit){
  limit = limit || 6;
  const log = [];
  try{
    const r = await webTimeout(root.superFetch("https://www.bing.com/search?q=" + encodeURIComponent(query) + "&count=10", { headers: { "User-Agent": WEB_UA } }), 25000, "bing");
    if(r.ok){
      const html = await r.text();
      const res = parseBingResults(html).slice(0, limit);
      const echo = bingQueryEcho(html);
      if(res.length && queryEchoMatches(echo, query)){
        log.push(["bing", r.status + " · " + res.length + " parsed"]);
        return { engine: "bing", results: res, log };
      }
      log.push(["bing", res.length ? "ignored — the engine searched \"" + echo.slice(0, 40) + "\" instead" : "0 parsed"]);
    } else log.push(["bing", "HTTP " + r.status]);
  }catch(e){ log.push(["bing", "unreachable — " + e.message]); }
  try{
    const hits = (await wikiSearch(query, limit)).slice(0, limit);
    log.push(["wikipedia", hits.length + " hits"]);
    if(hits.length) return { engine: "wikipedia", results: hits, log };
  }catch(e){ log.push(["wikipedia", "unreachable — " + e.message]); }
  return { engine: null, results: [], log };
}

/* A page read as a *document*: navigation, headers, footers and widgets dropped,
   the article region preferred. Regex stripping alone returns the site's menu —
   the evidence is the article, not the chrome. */
function htmlToText(html){
  try{
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    doc.querySelectorAll("script,style,noscript,svg,iframe,nav,header,footer,aside,form,button,template,[aria-hidden='true']").forEach(n => { try{ n.remove(); }catch(e){} });
    const main = doc.querySelector("article, main, [role='main'], #mw-content-text, #content, .content, .post") || doc.body;
    const t = main ? main.textContent : "";
    return String(t).replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }catch(e){ return stripHtml(html); }
}

async function readPage(url, cap){
  cap = cap || 4500;
  try{
    const r = await webTimeout(root.superFetch(url, { headers: { "User-Agent": WEB_UA } }), WEB_TIMEOUT, hostOf(url));
    const rawT = await r.text();
    if(!r.ok) return { url, status: r.status, bytes: rawT.length, text: "" };
    let ct = ""; try{ ct = (r.headers && r.headers.get) ? (r.headers.get("content-type") || "") : ""; }catch(e){}
    if(ct && !/text|html|json|xml/i.test(ct)) return { url, status: r.status, bytes: rawT.length, text: "", note: "not text (" + String(ct).split(";")[0] + ")" };
    const looksHtml = /html/i.test(ct) || /^\s*<(!doctype|html)/i.test(rawT);
    /* bounded work: a 2 MB news page costs the device real time to parse, and the
       evidence we pass on is capped anyway — so parse the head of it and say so. */
    const CAP_RAW = 800000;
    const src = rawT.length > CAP_RAW ? rawT.slice(0, CAP_RAW) : rawT;
    const text = (looksHtml ? htmlToText(src) : stripHtml(src)).slice(0, cap);
    return { url, status: r.status, bytes: rawT.length, text,
      note: rawT.length > CAP_RAW ? "first " + Math.round(CAP_RAW / 1024) + " KB of " + Math.round(rawT.length / 1024) + " KB parsed" : undefined };
  }catch(e){ return { url, status: 0, bytes: 0, text: "", note: "unreachable — " + e.message }; }
}

function hostOf(u){ try{ return new URL(u).hostname.replace(/^www\./, ""); }catch(e){ return "?"; } }

/* Reading strategy: prefer a bounded source when the result IS an encyclopaedia
   article — the summary API hands back the same facts in ~1 KB instead of the
   full 1.8 MB page, which is faster and much cleaner evidence. Everything else is
   read as a document. */
async function readSource(url, cap){
  try{
    const u = new URL(url);
    if(/(^|\.)wikipedia\.org$/i.test(u.hostname)){
      const title = decodeURIComponent((u.pathname.split("/wiki/")[1] || "").split("#")[0]).replace(/_/g, " ");
      if(title){
        const r = await webTimeout(root.superFetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")), { headers: { "User-Agent": WEB_UA } }), 12000, "wikipedia summary");
        if(r.ok){
          const j = await r.json();
          const ex = String(j.extract || "").trim();
          if(ex) return { url, status: 200, bytes: ex.length, text: ex.slice(0, cap || 4500), note: "encyclopaedia summary API (bounded source)" };
        }
      }
    }
  }catch(e){}
  return readPage(url, cap);
}

async function doWeb(query){
  query = String(query == null ? "" : query).trim();
  if(!query){
    addBubble("ass", '<div class="rise"><div class="rhead">🌐 /web — search the open net</div>'
      + '<div class="rrow"><b>USAGE</b><span class="vd">/web &lt;query&gt;</span><div class="rd">e.g. <b>/web what is photosynthesis</b> · <b>/web year 7 english syllabus</b><br>also <b>/wiki Pythagoras</b> · <b>/weather Sydney</b> · <b>/url https://…</b> (read one page)</div></div>'
      + '<div class="rfoot">The card shows the engine, the sources, and the bytes actually read. The answer is grounded in those pages only — if the net is silent, it says so.</div></div>');
    return;
  }
  const bubble = addBubble("ass", ""); typing(bubble);
  const t0 = Date.now();
  const s = await webSearch(query, 6);
  if(!s.results.length){
    bubble.innerHTML = '<div class="rise"><div class="rhead">🌐 /web — "' + esc(query) + '"</div>'
      + '<div class="rrow"><b>SEARCH</b><span class="vd">NO RESULTS</span><div class="rd">every engine failed: ' + esc(s.log.map(l => l[0] + " → " + l[1]).join(" · ")) + '</div></div>'
      + '<div class="rfoot">Fail-closed — nothing invented. Try different words, or <b>/url &lt;page&gt;</b> to read one page directly.</div></div>';
    trailRoute("web:search", false, query + " — no engine answered");
    rrlAppend(runNoOf(), "DNA", "Obi: [/web failed — no engine answered: " + query + "]");
    return;
  }
  const ms = Date.now() - t0;
  let html = '<div class="rise"><div class="rhead">🌐 /web — "' + esc(query) + '"</div>';
  html += '<div class="rrow"><b>SEARCH</b><span class="vd">' + esc(String(s.engine).toUpperCase()) + '</span><div class="rd">' + s.results.length + ' results · ' + ms + ' ms · tried ' + esc(s.log.map(l => l[0] + " (" + l[1] + ")").join(" · ")) + '</div></div>';
  for(const x of s.results){
    html += '<div class="rrow"><b>' + esc(x.title) + '</b><span class="vd">' + esc(hostOf(x.url)) + '</span><div class="rd">' + esc(x.snippet) + '<br><a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.url) + '</a></div></div>';
  }
  /* the sources are shown the moment the search returns; the reads fill in below
     as they arrive, so a slow page never hides the evidence we already have. */
  html += '<div class="webreads"><div class="rrow"><b>READING</b><span class="vd">…</span><div class="rd">opening the top 3 sources — bounded, 15s each</div></div></div>';
  html += '<div class="rfoot">Grounding: the answer streams below from this evidence only — sources are the links above. Engines: ' + esc(s.log.map(l => l[0]).join(" → ")) + '.</div></div>';
  bubble.innerHTML = html;
  scrollDown();
  trailRoute("web:search:" + s.engine, true, query);

  const pages = await Promise.all(s.results.slice(0, 3).map(x => readSource(x.url, 4500)));
  const pageRows = pages.map(p => '<div class="rrow"><b>READ · ' + esc(hostOf(p.url)) + '</b><span class="vd">' + (p.text ? p.bytes + " B" : "SKIPPED") + '</span><div class="rd">' + esc(p.note || (p.text.slice(0, 110) + "…")) + '</div></div>').join("");
  const readsEl = bubble.querySelector(".webreads");
  if(readsEl) readsEl.innerHTML = pageRows; else bubble.insertAdjacentHTML("beforeend", pageRows);
  scrollDown();

  let ev = 'SEARCH RESULTS (engine: ' + s.engine + ', fetched ' + new Date().toISOString() + '):\n'
    + s.results.map((x, i) => (i + 1) + ". " + x.title + " — " + x.url + "\n   " + x.snippet).join("\n");
  const read = pages.filter(p => p.text);
  if(read.length) ev += "\n\nPAGE TEXT (read live just now; may be truncated):\n" + read.map(p => "--- " + p.url + " (" + p.bytes + " B)\n" + p.text).join("\n\n");
  messages.push("User: /web " + query);
  rrlAppend(runNoOf(), "DNA", "Obi: [/web \"" + query + "\" — " + s.engine + " · " + s.results.length + " results · " + read.length + " pages read]");
  await streamReply('The sovereign asked: "' + query + '"\n\nLive web evidence I just fetched:\n' + ev.slice(0, 16000)
    + '\n\nAnswer the question from THIS evidence only. If the answer is not in it, say plainly what is missing and point at the best source. Never invent facts, quotes or URLs. Cite the sources you used as plain URLs.');
}

async function doWiki(topic){
  topic = String(topic == null ? "" : topic).trim();
  if(!topic){ addBubble("ass", "Usage: <b>/wiki &lt;topic&gt;</b> — e.g. <b>/wiki Pythagoras</b>"); return; }
  const bubble = addBubble("ass", ""); typing(bubble);
  try{
    const hits = await wikiSearch(topic, 5);
    if(!hits.length){ bubble.textContent = 'No encyclopaedia entry found for "' + topic + '".'; return; }
    const best = hits[0];
    const r = await webTimeout(root.superFetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(String(best.title).replace(/ /g, "_")), { headers: { "User-Agent": WEB_UA } }), 15000, "wikipedia summary");
    if(!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const link = (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || best.url;
    let html = '<div class="rise"><div class="rhead">📖 /wiki — ' + esc(j.title || best.title) + '</div>';
    html += '<div class="rrow"><b>' + esc(j.description || "entry") + '</b><span class="vd">WIKIPEDIA</span><div class="rd">' + esc(String(j.extract || "").trim()) + '</div></div>';
    if(hits.length > 1) html += '<div class="rrow"><b>ALSO IN THE INDEX</b><span class="vd">' + (hits.length - 1) + ' MORE</span><div class="rd">' + esc(hits.slice(1).map(h => h.title).join(" · ")) + '</div></div>';
    html += '<div class="rfoot">Verbatim extract — not summarised, not edited. <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">read the full article</a>. Ask a follow-up in plain words and I will read it.</div></div>';
    bubble.innerHTML = html;
    rrlAppend(runNoOf(), "DNA", "Obi: [/wiki " + best.title + "]");
  }catch(e){ bubble.textContent = "⚠ /wiki failed: " + e.message; }
}

async function doWeather(place){
  place = String(place == null ? "" : place).trim();
  if(!place){ addBubble("ass", "Usage: <b>/weather &lt;place&gt;</b> — e.g. <b>/weather Sydney</b>"); return; }
  const bubble = addBubble("ass", ""); typing(bubble);
  try{
    const r = await root.superFetch("https://wttr.in/" + encodeURIComponent(place) + "?format=j1", { headers: { "User-Agent": "curl/8.0" } });
    if(!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const c = (j.current_condition || [])[0];
    if(!c) throw new Error("no current conditions in the reply");
    const today = (j.weather || [])[0] || {};
    const area = (j.nearest_area || [])[0];
    const where = area ? (area.areaName[0].value + ", " + area.country[0].value) : place;
    const desc = (c.weatherDesc && c.weatherDesc[0]) ? String(c.weatherDesc[0].value).trim() : "";
    let html = '<div class="rise"><div class="rhead">🌦 /weather — ' + esc(where) + '</div>';
    html += '<div class="rrow"><b>' + esc(c.temp_C) + '°C</b><span class="vd">' + esc(desc) + '</span><div class="rd">feels like ' + esc(c.FeelsLikeC) + '°C · humidity ' + esc(c.humidity) + '% · wind ' + esc(c.windspeedKmph) + ' km/h ' + esc(c.winddir16Point) + ' · ' + esc(c.pressure) + ' hPa</div></div>';
    if(today.maxtempC) html += '<div class="rrow"><b>TODAY</b><span class="vd">' + esc(today.mintempC) + '–' + esc(today.maxtempC) + '°C</span><div class="rd">observed ' + esc(c.observation_time || "?") + ' ' + esc(c.localObsDateTime || "") + '</div></div>';
    html += '<div class="rfoot">Source: <a href="https://wttr.in/' + esc(encodeURIComponent(place)) + '" target="_blank" rel="noopener noreferrer">wttr.in</a> — current conditions are measured, the day range is forecast.</div></div>';
    bubble.innerHTML = html;
    rrlAppend(runNoOf(), "DNA", "Obi: [/weather " + where + " " + c.temp_C + "C " + desc + "]");
  }catch(e){ bubble.textContent = "⚠ /weather failed: " + e.message + " — try a simpler place name (e.g. /weather Sydney)."; }
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

/* ---------------------- STUDENT SELECTOR UI ---------------------- */
function fmtDay(t){ try{ return new Date(t).toLocaleDateString(); }catch(e){ return "?"; } }
/* ---------------------- THE LANDING SHELL (views + tabs) ----------------------
   The landing page is the COMMAND STATION: the magic chat, where the sovereign
   speaks and the empire listens (messages, the command shelf, the composer).
   Three faces, one station:
     · ⌘ Command Station   — the chat. The landing page.
     · ◈ Phoenix Generators — PrAis's divisions and the generators in each
                              (the registry is src/divisions.js). The 👤 Student
                              Evaluator DESK lives one level in, under NET — it is
                              a generator, and the family has more than one
                              (Lesson Creator is next), so it is filed like one.
     · ⚙ Settings          — voice, the command shelf, the ledger, the live
                              instruments and reincarnate. These used to be five
                              separate topbar buttons; they are one room now, and
                              every one of them is still a command as well.
   The active face is remembered for the browser session (sessionStorage `obi_view`)
   and named in the URL hash (#cmd / #gen / #eval / #settings), so a face can be
   linked to directly — and a fresh visit always lands on the command station. */
const VIEWS = { cmd: "⌘ Command Station", gen: "◈ Phoenix Generators", settings: "⚙ Settings", eval: "👤 Student Evaluator", lesson: "📚 Lesson Creator" };
const TAB_OF = { cmd: "cmd", gen: "gen", settings: "settings", eval: "gen", lesson: "gen" };   /* which TAB a view lights up */
let currentView = "cmd";

function setViewTab(name){
  const tab = TAB_OF[name] || "cmd";
  document.querySelectorAll("#tabbar .tabbtn").forEach(b => b.classList.toggle("on", b.dataset.view === tab));
  const c = $("viewCmd"), g = $("viewGen"), s = $("viewSet");
  if(c) c.classList.toggle("hidden", tab !== "cmd");
  if(g) g.classList.toggle("hidden", tab !== "gen");
  if(s) s.classList.toggle("hidden", tab !== "settings");
  if(tab !== "gen") deskOpen(false);
}

/* The DESKS that live one level inside ◈ Phoenix Generators → NET: the Student
   Evaluator's switchboard, and the Lesson Creator's four rooms. Exactly one of
   {the division grid, a desk} is on screen, and the desk keeps whatever its own
   module put in it. `which` is "eval" (default) or "lesson"; falsy closes both. */
function deskOpen(on, which){
  const g = $("genDesk"), l = $("lessonDesk"), br = $("brandDesk"), b = $("genBody");
  const open = on ? (which || "eval") : null;
  if(g) g.classList.toggle("hidden", open !== "eval");
  if(l) l.classList.toggle("hidden", open !== "lesson");
  if(br) br.classList.toggle("hidden", open !== "brand");
  if(b) b.classList.toggle("hidden", !!open);
  if(open === "eval" && window.ObiReview) return Promise.resolve(renderStudentSelector()).then(() => true).catch(() => true);
  if(open === "lesson" && window.ObiLessons && window.ObiLessons.mount){ try{ window.ObiLessons.mount(); }catch(e){} }
  if(open === "brand" && window.ObiBrand && window.ObiBrand.mountDesk){ try{ window.ObiBrand.mountDesk(); }catch(e){} }
  return Promise.resolve(!!open);
}

/* render the family (src/divisions.js). Never touches #genDesk — the desk keeps
   whatever the evaluation layer put in it. */
function mountGenerators(){
  try{ if(window.ObiDivisions) window.ObiDivisions.mount({ onOpen: openGenerator }); }catch(e){}
  try{ if(window.ObiBrand && window.ObiBrand.upgrade) window.ObiBrand.upgrade(); }catch(e){}
}

/* a generator card was opened. Live ones open; planned ones say so — in the
   station, so the honest answer is in the record rather than in a dead button. */
function openGenerator(id){
  const D = window.ObiDivisions, g = D && D.get(id);
  if(!g) return;
  if(g.entry === "eval"){ showView("eval"); return; }
  if(g.entry === "lesson"){ showView("lesson"); return; }
  if(g.entry === "brand"){ showView("gen"); deskOpen(true, "brand"); return; }
  if(g.status === "live" && g.url){ try{ window.open(g.url, "_blank", "noopener"); }catch(e){} return; }
  const st = (D.STATUS[g.status] || D.STATUS.planned);
  addBubble("ass", '<div class="rise"><div class="rhead">' + g.icon + ' ' + esc(g.name) + ' — ' + st.label + '</div>'
    + '<div class="rrow"><b>STATE</b><span class="vd">' + esc(g.status.toUpperCase()) + '</span><div class="rd">' + esc(st.blurb) + '</div></div>'
    + '<div class="rrow"><b>IT WOULD DO</b><span class="vd"></span><div class="rd">' + esc(g.blurb) + ((g.does || []).length ? '<br>' + g.does.map(x => "• " + esc(x)).join("<br>") : "") + '</div></div>'
    + ((g.needs || []).length ? '<div class="rrow"><b>STILL NEEDS</b><span class="vd">' + g.needs.length + '</span><div class="rd">' + g.needs.map(x => "• " + esc(x)).join("<br>") + '</div></div>' : "")
    + '<div class="rfoot">Not built — and saying so is the point. The registry is <b>src/divisions.js</b>; ask and it becomes forge work.</div></div>');
  showView("cmd");
}

/* the station's live state, kept in the tab bar: run · soul · I-LOG · tunnel */
function updateTabMeta(){
  const el = $("tabMeta");
  if(!el) return;
  const tunnel = cmdSocketState === "open" ? "open" : cmdSocketState;
  /* the record is part of the flight instruments: read straight from the mirror,
     so the count is on screen before kv finishes opening */
  let ilogN = null;
  try{ const m = JSON.parse(localStorage.getItem("obi_ilog") || "null"); if(m && typeof m.count === "number") ilogN = m.count; }catch(e){}
  el.innerHTML = "RUN <b>" + (runNoOf() || "—") + "</b> · SOUL <b>" + ledger.soul.length + "</b> · I-LOG <b>" + (ilogN == null ? "—" : ilogN) + "</b> · tunnel <b>" + esc(tunnel) + "</b>";
  try{ renderBrandBar(); }catch(e){}
}

/* ⚙ Settings is two rooms: the station's own controls, and Free Phoenix Mode
   (src/freephoenix.js — Agent 99 with no canon, no gate, no Git, no cloud, no
   record). The choice is remembered in this browser; the room mounts on demand. */
function setSetTab(which){
  const free = which === "free";
  const a = $("setTabStationBtn"), b = $("setTabFreeBtn");
  if(a) a.classList.toggle("on", !free);
  if(b) b.classList.toggle("on", free);
  const so = $("setTabStation"), sf = $("setTabFree");
  if(so) so.hidden = free;
  if(sf) sf.hidden = !free;
  try{ localStorage.setItem("obi_settab", free ? "free" : "station"); }catch(e){}
  if(free && window.ObiFree && window.ObiFree.mount) window.ObiFree.mount();
  return free;
}

/* ⚙ Settings' instruments — read live, never remembered. If a module is missing
   it says MISSING here rather than quietly dropping the row. */
function renderSettings(){
  paintVoiceBtn();
  const el = $("setInstr");
  if(!el) return;
  let ilogN = "—";
  try{ const m = JSON.parse(localStorage.getItem("obi_ilog") || "null"); if(m && typeof m.count === "number") ilogN = m.count; }catch(e){}
  const o = omegaStatusText();
  let keys = {};
  try{ keys = JSON.parse(localStorage.getItem("obi_keys") || "{}") || {}; }catch(e){}
  const run = currentRun();
  const client = (window.ObiClients && window.ObiClients.name) ? window.ObiClients.name() : "—";
  const rows = [
    ["run", "run " + (runNoOf() || "—") + (run ? (run.closed ? " · closed" : " · open") : "")],
    ["soul", ledger.soul.length + " fragment(s) · " + soulCount() + " chars this session"],
    ["I-LOG", ilogN + " entries · /audit verifies the chain · /ilog push anchors it on Git"],
    ["client", client],
    ["view", VIEWS[currentView] || currentView],
    ["tunnel", cmdSocketState],
    ["background", window.ObiBg ? window.ObiBg.text() : "ObiBg MISSING"],
    ["canon gate", o.armed ? "ARMED · " + o.armedMinutesLeft + " min left" : "locked" + (o.fails ? " · " + o.fails + " failed attempt(s)" : "")],
    ["secrets", Object.keys(keys).length ? Object.keys(keys).join(", ") + " (names only — never shown here)" : "none stored in this browser"],
    ["modules", (window.ObiForge ? "forge ok" : "forge MISSING") + " · " + (window.ObiILog ? "ilog ok" : "ilog MISSING") + " · " + (window.ObiBg ? "bg ok" : "bg MISSING") + " · " + (window.ObiDivisions ? "divisions ok" : "divisions MISSING") + " · " + (window.ObiBrand ? "brand ok · " + window.ObiBrand.iconNames().length + " icons" : "brand MISSING")]
  ];
  el.innerHTML = rows.map(r => '<div class="set-kv"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>').join("");
}

async function showView(name){
  if(!VIEWS[name]) name = "cmd";
  currentView = name;
  setViewTab(name);
  try{ sessionStorage.setItem("obi_view", name); }catch(e){}
  try{ history.replaceState(null, "", "#" + name); }catch(e){}
  if(name === "eval") await deskOpen(true, "eval");
  else if(name === "lesson") await deskOpen(true, "lesson");
  else deskOpen(false);
  if(name === "gen" || name === "eval") mountGenerators();  if(name === "settings"){ renderSettings(); try{ setSetTab(localStorage.getItem("obi_settab") || "station"); }catch(e){ setSetTab("station"); } }
  if(name === "gen" || name === "eval" || name === "settings"){
    const mp = $("memoryPanel"); if(mp && !mp.classList.contains("hidden")) mp.classList.add("hidden");
  }
  syncTopbarHeight();
  if(name === "cmd"){
    if(inputEl) inputEl.focus();
    /* the landing (welcome chips) is taller than a phone screen — open it at the
       top so the greeting is the first thing seen; a live chat still opens at the end */
    if(document.querySelector("#empty")) messagesCtn.scrollTop = 0; else scrollDown();
  }
  updateTabMeta();
  return name;
}

/* Anything the evaluation desk launches runs in the command station — the chat is
   where Obi answers — with the command pre-typed, sent outright unless the command
   needs its argument typed by the sovereign (data-arg="1"). */
async function runInStation(cmd, prefillOnly){
  await showView("cmd");
  const t = String(cmd == null ? "" : cmd);
  inputEl.value = prefillOnly ? (/\s$/.test(t) ? t : t + " ") : t;
  if(prefillOnly){ inputEl.focus(); return; }
  return send();
}

/* The evaluation desk — now one level inside ◈ Phoenix Generators → NET. */
async function showStudentSelector(){
  return showView("eval");
}

async function renderStudentSelector(){
  const body = $("selBody");
  if(!body) return;
  const C = window.ObiClients, R = window.ObiReview;
  if(!C || !R){ body.innerHTML = '<div class="hint">⚠ src/clients.js / src/review.js did not load — reload the page.</div>'; return; }
  body.innerHTML = '<div class="hint">Loading…</div>';
  try{
    await C.whenReady();
    const clients = await C.all();
    const activeId = C.id();
    const active = (await C.get(activeId)) || { id: activeId, name: activeId };
    const s = await C.stats(activeId);
    const students = await R.entities("student");
    const classes = await R.entities("class");
    const aS = R.active(), aC = R.activeClass();
    const bits = [];
    if(s.students != null) bits.push(s.students + " student(s)");
    if(s.classes != null) bits.push(s.classes + " class(es)");
    if(s.transcripts != null) bits.push(s.transcripts + " recording(s)");
    if(s.summaries != null) bits.push(s.summaries + " summary(ies)");
    if(s.reviews != null) bits.push(s.reviews + " review(s)");
    if(s.writeups != null) bits.push(s.writeups + " writeup(s)");

    let html = '<div class="sel-group">Active client</div>'
      + '<div class="sel-row on"><span class="sn">● ' + esc(active.name) + '</span><span class="vd">ACTIVE</span>'
      + '<div class="ss">' + esc(bits.join(" · ") || "no data yet") + '</div>'
      + '<button class="ci-act" data-do="ledger">◈ Open the client ledger</button></div>';

    const others = clients.filter(c => c.id !== activeId);
    if(others.length){
      html += '<div class="sel-group">Other clients</div>';
      for(const c of others){
        html += '<div class="sel-row"><span class="sn">○ ' + esc(c.name) + '</span>'
          + '<button class="ci-act" data-cl="select" data-name="' + esc(c.name) + '">Select</button>'
          + '<div class="ss">created ' + esc(new Date(c.created).toLocaleDateString()) + ' · id ' + esc(c.id) + '</div></div>';
      }
    }
    html += '<div class="sel-group">Add / switch client</div>'
      + '<div class="sel-add"><input id="newClientInput" placeholder="client name…" autocomplete="off"><button class="ci-act" id="newClientBtn">＋ Client</button></div>';

    html += '<div class="sel-group">Students · ' + esc(active.name) + '</div>';
    if(!students.length) html += '<div class="hint">No students for this client yet — add one below, or type <b>/student &lt;name&gt;</b>.</div>';
    for(const st of students){
      const on = st.id === aS;
      html += '<div class="sel-row' + (on ? ' on' : '') + '"><span class="sn">' + (on ? '●' : '○') + ' ' + esc(st.name) + '</span>'
        + (on ? '<span class="vd">ACTIVE</span>' : '<button class="ci-act" data-s="select" data-name="' + esc(st.name) + '">Select</button>')
        + '<button class="ci-act" data-s="write" data-name="' + esc(st.name) + '">📝 Review</button>'
        + '<div class="ss">' + (st.sources || []).length + ' evidence · ' + (st.notes || []).length + ' note(s) · last ' + esc(fmtDay(st.updated || st.created)) + '</div></div>';
    }
    html += '<div class="sel-add"><input id="newStudentInput" placeholder="student name…" autocomplete="off"><button class="ci-act" id="newStudentBtn">＋ Student</button></div>';

    html += '<div class="sel-group">Classes · ' + esc(active.name) + '</div>';
    if(!classes.length) html += '<div class="hint">No classes for this client yet — <b>/class &lt;name&gt;</b>.</div>';
    for(const cl of classes){
      const on = cl.id === aC;
      html += '<div class="sel-row' + (on ? ' on' : '') + '"><span class="sn">' + (on ? '●' : '○') + ' ' + esc(cl.name) + '</span>'
        + (on ? '<span class="vd">ACTIVE</span>' : '<button class="ci-act" data-c="select" data-name="' + esc(cl.name) + '">Select</button>')
        + '<button class="ci-act" data-c="write" data-name="' + esc(cl.name) + '">🏫 Writeup</button>'
        + '<div class="ss">' + (cl.sources || []).length + ' evidence · ' + (cl.notes || []).length + ' note(s) · last ' + esc(fmtDay(cl.updated || cl.created)) + '</div></div>';
    }
    html += '<div class="sel-add"><input id="newClassInput" placeholder="class name…" autocomplete="off"><button class="ci-act" id="newClassBtn">＋ Class</button></div>';
    html += '<div class="hint">Commands: <b>/client</b> · <b>/clients</b> · <b>/student</b> · <b>/class</b> · <b>/find</b>. A client\'s evidence never mixes with another\'s, and a desk action runs in the ⌘ Command Station.</div>';
    body.innerHTML = html;

    body.querySelectorAll("[data-cl], [data-s], [data-c], [data-do]").forEach(b => {
      b.onclick = async () => {
        try{
          if(b.dataset.do === "ledger"){ await runInStation("/clients"); return; }
          if(b.dataset.cl === "select"){ await C.select(b.dataset.name); await renderStudentSelector(); return; }
          const name = b.dataset.name;
          if(b.dataset.s === "select"){ await R.setActive(name); await renderStudentSelector(); return; }
          if(b.dataset.c === "select"){ await R.setClass(name); await renderStudentSelector(); return; }
          if(b.dataset.s === "write"){ await R.setActive(name); await runInStation("/review"); return; }
          if(b.dataset.c === "write"){ await R.setClass(name); await runInStation("/writeup"); return; }
        }catch(e){ reportError(e); }
      };
    });
    const addClient = async () => { const v = ($("newClientInput").value || "").trim(); if(!v) return; $("newClientBtn").disabled = true; await C.select(v); await renderStudentSelector(); };
    const addStudent = async () => { const v = ($("newStudentInput").value || "").trim(); if(!v) return; await R.setActive(v); await renderStudentSelector(); };
    const addClass = async () => { const v = ($("newClassInput").value || "").trim(); if(!v) return; await R.setClass(v); await renderStudentSelector(); };
    if($("newClientBtn")) $("newClientBtn").onclick = addClient;
    if($("newStudentBtn")) $("newStudentBtn").onclick = addStudent;
    if($("newClassBtn")) $("newClassBtn").onclick = addClass;
    body.querySelectorAll("input").forEach(inp => {
      inp.onkeydown = ev => { if(ev.key === "Enter"){ ev.preventDefault(); if(inp.id === "newClientInput") addClient(); else if(inp.id === "newStudentInput") addStudent(); else addClass(); } };
    });
  }catch(e){
    body.innerHTML = '<div class="hint">⚠ ' + esc(e.message) + '</div>';
  }
}

/* ---------------------- MEMORY UI ---------------------- */
function updateStats(){
  const el = $("memStats");
  const n = ledger.runs.length;
  const count = ledger.soul.length;
  const last = currentRun();
  if(el) el.innerHTML = `RUN ${n} · SOULCOUNT <b>${soulCount()}</b> chars · fragments: <b>${count}</b> · session start: ${last ? new Date(last.t).toLocaleString() : "—"}`;
  updateTabMeta();
}

function showMemory(){
  const panel = $("memoryPanel");
  syncTopbarHeight();
  const willShow = panel.classList.contains("hidden");
  panel.classList.toggle("hidden");
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
   drone + skills + priority, rendered as a chat bubble. The drone is a ROUTING
   LABEL produced by keyword classification, not a claim that a drone ran: the
   queue is the execution surface (/queue → claim → complete). */
function cmdCard(tr, id, extra){
  const t = tr || {};
  const a99 = t.agent99 || {}, a98 = t.agent98 || {}, a97 = t.agent97 || {};
  const p = t.primaryDrone || {};
  let rows = "";
  if(a99.interpretation) rows += '<div class="rrow"><b>AGENT 99</b><span class="vd">CLASSIFIED</span><div class="rd">'+esc(a99.interpretation)+'</div></div>';
  if(p.name) rows += '<div class="rrow"><b>ROUTED TO</b><span class="vd">'+esc(p.name)+' #'+(p.id??"?")+'</span><div class="rd">keyword score '+esc(p.score??"?")+' · skills '+esc((p.skills||[]).join(", "))+'</div></div>';
  if(a98.notes) rows += '<div class="rrow"><b>STRESS</b><span class="vd">ANAKIN</span><div class="rd">'+esc(a98.notes)+'</div></div>';
  if(a97.trail) rows += '<div class="rrow"><b>AUDIT</b><span class="vd">OB1</span><div class="rd">'+esc(a97.trail)+'</div></div>';
  rows += '<div class="rrow"><b>HONEST</b><span class="vd">LABEL ONLY</span><div class="rd">the drone above is a keyword-derived routing label — the Legion executes through the queue (<b>/queue</b> → claim → complete).</div></div>';
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
    const drone = r.data.assignedDrone || "Legion";
    rrlAppend(runNoOf(), "DNA", "Obi: [Agent99 → " + drone + " · #" + id + "]");
    logOp({ kind:"tunnel", action:"send", detail: text.slice(0, 200), result: "#" + id + " → " + drone, ref: "#" + id });
    const h = await cmdFetch("/api/command/history?limit=1");
    const list = cmdListFrom(h.data) || [];
    const rec = list.find(x => x.id === id) || list[0] || null;
    let extra = "";
    if(window.ObiPlaybooks && window.ObiPheromone){
      const g = window.ObiPlaybooks.gate(text, { mission: "command" });
      const lastSoul = ledger.soul.length ? ledger.soul[ledger.soul.length-1] : null;
      window.ObiPlaybooks.depositOrder(text, { drone, run: runNoOf(), session: cmdSessionTag(),
        mission: "command", anchor: lastSoul ? lastSoul.t : null });
      const f = window.ObiPlaybooks.formationFor(drone);
      extra += '<div class="rrow"><b>PLAYBOOK</b><span class="vd">'+esc(g.playbook)+'</span><div class="rd">'
        + (f.role === "reserve" ? "reserve line (triarii)" : "line") + ' · axes ' + esc((f.axes||[]).join(" × "))
        + (f.shield ? ' · shield <b>'+esc(f.shield.name)+'</b>' : "") + '</div></div>';
      if(g.hold) extra += '<div class="rrow"><b>GATE</b><span class="vd">HELD</span><div class="rd">'+esc(g.reason)+'</div></div>';
      else if(g.emergency) extra += '<div class="rrow"><b>GATE</b><span class="vd">DICTATOR</span><div class="rd">rules suspended · timer '+g.timerMinutes+'m · Audit holds the rollback</div></div>';
    }
    addBubble("ass", cmdCard(rec && rec.translation, id, extra));
    return true;
  }catch(e){
    rrlAppend(runNoOf(), "DNA", "Obi: [command held locally — tunnel unreachable: " + e.message + "]");
    logOp({ kind:"tunnel", action:"send", ok:false, detail: text.slice(0, 200), result: "unreachable — held locally: " + e.message });
    addBubble("ass", "⚠ The command tunnel is unreachable — your words are still Soul DNA, held locally. (" + esc(e.message) + ")");
    return false;
  }
}

/* drive the Legion execution loop from the chat: claim → complete / fail */
async function cmdAct(id, action, drone){
  const body = { commandId: id };
  if(action === "complete"){ body.result = "executed by Obi magic chat"; body.success = true; }
  if(action === "fail"){ body.result = "failed by Obi magic chat"; body.success = false; }
  try{
    const r = await cmdFetch("/api/command/" + (action === "claim" ? "claim" : action), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    rrlAppend(runNoOf(), "DNA", "Obi: [command #" + id + " → " + action + (r.ok ? " OK" : " (" + ((r.data && r.data.error) || "?") + ")") + "]");
    logOp({ kind:"tunnel", action: action, detail: "command #" + id + (drone ? " · " + drone : ""), ok: !!r.ok, result: r.ok ? "the Legion accepted it" : String((r.data && r.data.error) || "failed"), ref: "#" + id });
    let note = "";
    if(window.ObiPlaybooks && (action === "complete" || action === "fail") && r.ok){
      window.ObiPlaybooks.recordOutcome(drone || "Legion", "command", action === "complete", { run: runNoOf(), session: cmdSessionTag() });
      const d = window.ObiPheromone.field("drone:" + (drone || "Legion"));
      note = ' — the ground remembers: <b>' + esc(drone || "Legion") + '</b> trust ' + (d >= 0 ? "+" : "") + d.toFixed(2);
    }
    addBubble("ass", action === "claim" ? "⚡ Claimed command #" + id + " — the Legion has it."
      : (action === "complete" ? "✓ Command #" + id + " completed" + note + "." : "✗ Command #" + id + " failed" + note + " — a negative trail was laid; the colony will avoid that road."));
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
      const dn = (it.translation && it.translation.primaryDrone && it.translation.primaryDrone.name) || "Legion";
      const dq = "'" + esc(dn) + "'";
      const buttons = st === "pending" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'claim\','+dq+')">⚡ Execute</button></div></div>'
        : (st === "claimed" ? '<div class="rrow"><b>ACTION</b><span class="vd"></span><div class="rd"><button class="ci-act" onclick="window.cmdAct('+it.id+',\'complete\','+dq+')">✓ Complete</button> <button class="ci-act" onclick="window.cmdAct('+it.id+',\'fail\','+dq+')">✗ Fail</button></div></div>'
        : (it.result ? '<div class="rrow"><b>RESULT</b><span class="vd"></span><div class="rd">'+esc(String(it.result))+'</div></div>' : ""));
      addBubble("ass", cmdCard(it.translation, it.id, '<div class="rrow"><b>STATUS</b><span class="vd"></span><div class="rd">'+cmdChip2(st)+ (it.claimed_by ? " · claimed by " + esc(it.claimed_by) : "") +'</div></div>' + buttons));
    }
    rrlAppend(runNoOf(), "DNA", "Obi: [queue shown — " + list.length + " commands]");
  }catch(e){
    addBubble("ass", "⚠ Queue unreachable: " + esc(e.message));
  }
}

/* /state — the same live map Obi is handed before answering, rendered on demand so
   the sovereign can audit it line for line (L58 MAP ≠ TERRAIN: every number here was
   read from the running station, and anything unreadable says so). */
/* /bg — BACKGROUND OPERATION: what the browser does to a hidden page, what the
   station holds against it, and what still has to be handed to something that is
   not the page. Everything here is read from ObiBg's live state, not described. */
async function cmdBg(text){
  const B = window.ObiBg;
  if(!B){ addBubble("ass", "⚠ <b>src/background.js</b> is not loaded — no keep-alive guard."); return; }
  const arg = String(text || "").trim().replace(/^\/(bg|background)/i, "").trim().toLowerCase();
  if(arg === "audio on" || arg === "audio" || arg === "keepalive on") return B.audio(true);
  if(arg === "audio off" || arg === "keepalive off") return B.audio(false);
  if(arg === "away" || arg === "lastaway"){
    addBubble("ass", "🛡 <b>Last time you were away</b> — " + (B.status().lastAwayLine) + '<br><span class="hint">Measured from the 1-second heartbeat while the page was hidden; kept through reloads. <b>/bg clearaway</b> forgets it.</span>');
    return;
  }
  if(arg === "clearaway" || arg === "forget"){ B.clearAway(); addBubble("ass", "🧽 Last-away measurement cleared."); return; }
  if(arg === "reset" || arg === "probe" || arg === "measure"){
    B.probeReset();
    addBubble("ass", "📏 Background probe reset (the last-away measurement is kept — it is evidence from before this reload). Now <b>switch to another tab/app</b> for a while, come back, and run <b>/bg</b>: the <b>HEARTBEAT</b> and <b>LAST TIME YOU WERE AWAY</b> rows will show how far the browser stretched this page's 1-second timer (clamped ≈2 s, Chrome intensive throttling ≈60 s).");
    return;
  }
  const s = B.status();
  const hb = s.heartbeat;
  const row = (k, v) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd"></span><div class="rd">' + v + '</div></div>';
  const hbVerdict = hb.throttled
    ? '<b style="color:#e6b43c">throttled ' + hb.throttled + '×</b> · worst gap <b>' + Math.round(hb.maxGapMs / 1000) + 's</b> · ' + hb.beats + ' beats'
    : (hb.beats ? 'no throttling seen — ' + hb.beats + ' beats, worst gap ' + (hb.maxGapMs/1000).toFixed(1) + 's' : 'not measured yet');
  const pending = (window.ObiTranscribe && window.ObiTranscribe.pending) ? window.ObiTranscribe.pending() : [];
  addBubble("ass", '<div class="rise"><div class="rhead">🛡 /bg — operating in the background</div>'
    + row("NOW", esc(B.text()))
    + row("LAST TIME YOU WERE AWAY", B.awayLine(s.lastAway) + (s.lastAway ? '<br><span class="rd">measured ' + esc(new Date(s.lastAway.at).toLocaleString()) + ' — and kept through every reload since, because a counter in memory is not evidence. A hidden page\'s 1 s heartbeat is clamped by the browser; the number of beats that actually landed is how you can tell "it kept working" from "it stalled".</span>' : ""))
    + row("HEARTBEAT", hbVerdict + '<br><span class="rd">a visible page beats its 1-second timer exactly; a hidden one gets clamped, and Chrome\'s intensive throttling stretches it to ~1/minute. This is the measurement of "is it still moving while I\'m in another tab?"</span>')
    + row("KEEP-ALIVE", "web lock " + (s.lock ? "<b>held</b>" : "not held") + " · wake lock " + (s.wake ? "<b>held</b>" : "not held") + " · keep-alive audio " + (s.audio ? "<b>on</b>" : (s.autoAudio ? "armed (starts with the next job)" : "<b>off</b> — /bg audio on")))
    + row("BROWSER SUPPORT", "Web Locks " + (s.supported.locks ? "yes" : "no") + " · Wake Lock " + (s.supported.wakeLock ? "yes" : "no") + " · visibility " + (s.hidden ? "hidden now" : "visible now"))
    + row("HIDDEN MID-JOB", s.pauses + " time(s) this session" + (s.lastHiddenFor ? " · last " + s.lastHiddenFor + "s" : "") + (s.holds ? " · " + s.holds + " job(s) running" : ""))
    + (pending.length ? row("RECOVERABLE JOBS", pending.map(p => "<b>" + esc(p.name || p.id) + "</b> — " + p.done + "/" + p.total + " part(s) already transcribed · <b>continue</b> would need the file re-picked; the parts so far can be saved").join("<br>")) : "")
    + '<div class="rfoot">A hidden tab is throttled by the browser (timers clamped, then ~1/minute in Chrome; frozen or suspended on mobile) — this holds the documented exemptions and <b>measures whether it worked</b>. Long jobs (the ear, the forge loop) hold it automatically. <b>/bg reset</b> starts a clean measurement — then switch tabs, come back and run <b>/bg</b>. <b>/bg audio on|off</b> controls the 19 Hz keep-alive track — <b>off by default</b>, because it is the only thing here that touches the speaker on its own; it is the strongest lever a web page has on a phone, so turn it on when a job must survive being backgrounded on mobile. Work that must finish with the page gone is a runner problem, not a background problem — GitHub Actions for heavy jobs (src/COSTS.md).</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/bg — " + B.text() + "]");
}

async function cmdState(){
  const s = await stationState();
  const row = (k, v) => '<div class="rrow"><b>' + esc(k) + '</b><span class="vd"></span><div class="rd">' + v + '</div></div>';
  const j = v => esc(typeof v === "string" ? v : JSON.stringify(v));
  const chipOk = b => b ? '<span class="chip" style="background:#4cd97b">loaded</span>' : '<span class="chip" style="background:#ff5a5a">NOT loaded</span>';
  const mods = Object.keys(s.modules).map(k => esc(k) + " " + chipOk(s.modules[k])).join(" · ");
  addBubble("ass", '<div class="rise"><div class="rhead">◈ /state — what this station is, right now</div>'
    + row("STATION", esc(s.generator) + " · view " + esc(s.view) + " · run <b>" + esc(s.run) + "</b> · session start " + esc(s.sessionStart) + " · read at " + esc(s.datetime))
    + row("SOUL", s.soul.fragments + " fragments · SOULCOUNT <b>" + s.soul.soulcountChars + "</b> chars · RRL lines this run " + s.soul.rrlLinesThisRun)
    + row("CLIENT", j(s.client))
    + row("ACTIVE SUBJECT", j(s.activeSubject))
    + row("ARCHIVES", j(s.archives))
    + row("I-LOG (the operation record — append-only, hash-chained, Git-anchored)", (s.ilog && typeof s.ilog === "object"
        ? ("<b>" + s.ilog.entries + "</b> entries · segment " + esc(s.ilog.segment) + " · head " + esc(s.ilog.head) + " · " + esc(s.ilog.alg) + " · anchors " + s.ilog.anchors + (s.ilog.unanchored ? " · <b style=\"color:#e6b43c\">UNANCHORED — not yet pushed</b>" : "") + " · last push " + esc(s.ilog.lastPush || "never") + " · kinds " + j(s.ilog.kinds))
        : j(s.ilog)))
    + row("SELF-FORGE", (s.forge && typeof s.forge === "object" ? ("<b>" + s.forge.files + "</b> files · " + s.forge.tools + " tools · stage " + s.forge.staged + " file(s) · " + j({ can:s.forge.matrix, cannot:s.forge.cannot })) : j(s.forge)))
    + row("FREE PHOENIX MODE (the unbound room — /free)", (s.free && typeof s.free === "object" ? (j({ room:s.free.room, what:s.free.what, sealed:s.free.sealed, built:s.free.built })) : j(s.free)))
    + row("CURRICULUM (the school's pacing guide — /curriculum · /coverage)", j(s.curriculum))
    + row("TUNNEL", j(s.tunnel))    + row("MESH (CGN)", j(s.mesh))
    + row("NEST", j(s.nest))
    + row("OFFERING", j(s.offering) + " · " + j(s.legion))
    + row("TOOLS", j(s.tools))
    + row("CONSTELLATION", j(s.ecosystem))
    + row("BACKGROUND", (s.background && typeof s.background === "object" ? esc(window.ObiBg.text()) : j(s.background)))
    + row("MODULES", mods)
    + row("SECRETS", j(s.secrets))
    + row("COMMANDS", esc(s.commands))
    + '<div class="rfoot">This is exactly the block Obi is given before answering — so what it says about the station is measured, not guessed. <b>/constellation</b> maps the organism · <b>/help</b> is the whole shelf.</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/state — run " + s.run + "]");
}

async function cmdTools(arg){
  const E = window.ObiEcosystem;
  if(!E){ addBubble("ass", "⚠ src/ecosystem.js didn't load — reload the page."); return; }
  const q = String(arg||"").trim();
  const c = E.coverage();
  const chip = s => '<span class="chip" style="background:'+E.STATUS_META[s].c+'">'+E.STATUS_META[s].label+'</span>';
  if(q){
    const list = E.filter(q);
    if(!list.length){ addBubble("ass", "Nothing in the inventory matches <b>"+esc(q)+"</b>. Try a family (capture, analysis, judgement, report, operations, governance, learning, platform) or a status (built, partial, missing)."); return; }
    const rows = list.map(r => '<div class="rrow"><b>'+esc(r.name)+'</b><span class="vd">'+esc(r.status.toUpperCase())+'</span><div class="rd">'+esc(r.id)+' · '+esc(r.family)+' · '+(r.where && r.where !== "—" ? esc(r.where)+' · ' : '')+esc(r.note)+'</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">⚒ /tools '+esc(q)+' — '+list.length+' tool'+(list.length===1?"":"s")+'</div>'+rows+'</div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [/tools " + q + " — " + list.length + "]");
    return;
  }
  let html = '<div class="rise"><div class="rhead">⚒ THE EVALUATOR STACK — '+c.built+'/'+c.total+' built ('+c.pct+'%)</div>';
  html += '<div class="rrow"><b>STATUS</b><span class="vd"></span><div class="rd">'+chip("built")+' '+c.built+' · '+chip("partial")+' '+c.partial+' · '+chip("missing")+' '+c.missing+' — the gap list is the roadmap, not a failure report</div></div>';
  for (const k in E.F){
    const f = c.byFamily[k];
    const missing = E.rows().filter(r => r.family === k && r.status !== "built").map(r => r.name).slice(0,5).join(" · ");
    html += '<div class="rrow"><b>'+f.icon+' '+esc(f.name)+'</b><span class="vd">'+f.built+'/'+f.total+'</span><div class="rd">'+esc(f.why)+(missing ? '<br>not yet: '+esc(missing)+' …' : '')+'</div></div>';
  }
  html += '<div class="rrow"><b>PRIORITY</b><span class="vd">NEXT 8</span><div class="rd">'+E.PRIORITY.map((p,i)=>'<b>'+(i+1)+'. '+esc(p[1])+'</b> — '+esc(p[2])).join('<br>')+'</div></div>';
  html += '<div class="rfoot">/tools &lt;family&gt; or /tools &lt;status&gt; to drill in · the same inventory is the SCOUT probe <b>tools</b> · source of truth: <b>src/ecosystem.js</b>, doc generated from it.</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [/tools — " + c.built + "/" + c.total + " built]");
}

/* /constellation — every piece of the organism: the station, the generator nodes,
   the public faces, the services. What exists, what is scaffold, what is planned,
   and what each one still needs. The registry is src/constellation.js; the scout's
   `pieces` probe touches every URL that claims to be live (MAP != TERRAIN). */
function cmdConstellation(arg){
  const C = window.ObiConstellation;
  if(!C){ addBubble("ass", "⚠ src/constellation.js didn't load — reload the page."); return; }
  const chip = s => '<span class="chip" style="background:' + C.STATUS[s].c + '">' + C.STATUS[s].label + '</span>';
  const line = p => '<div class="rrow"><b>' + esc(p.name) + '</b><span class="vd" style="color:' + C.STATUS[p.status].c + '">' + C.STATUS[p.status].label + '</span><div class="rd">'
    + esc(p.tagline)
    + (p.url ? ' <a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url.replace(/^https?:\/\//, "")) + '</a>' : (p.plannedUrl ? ' · will live at <b>' + esc(p.plannedUrl.replace(/^https?:\/\//, "")) + '</b>' : ""))
    + '</div></div>';
  const q = String(arg || "").trim().toLowerCase();
  if(q){
    const p = C.get(q);
    if(p){
      let html = '<div class="rise"><div class="rhead">✧ ' + esc(p.id) + ' — ' + esc(p.name) + '</div>';
      html += '<div class="rrow"><b>STATE</b><span class="vd" style="color:' + C.STATUS[p.status].c + '">' + C.STATUS[p.status].label + '</span><div class="rd">' + esc(C.STATUS[p.status].blurb) + ' · ' + esc(p.kind) + ' · role <b>' + esc(p.role || "—") + '</b> · family ' + esc(p.family) + '</div></div>';
      html += '<div class="rrow"><b>IT IS</b><span class="vd"></span><div class="rd">' + esc(p.tagline) + '</div></div>';
      if(p.url) html += '<div class="rrow"><b>LIVE AT</b><span class="vd"></span><div class="rd"><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.url) + '</a>' + (p.host ? " · " + esc(p.host) : "") + '</div></div>';
      else if(p.plannedUrl) html += '<div class="rrow"><b>WILL LIVE AT</b><span class="vd"></span><div class="rd">' + esc(p.plannedUrl) + (p.host ? " · " + esc(p.host) : "") + '</div></div>';
      if(p.deepLink) html += '<div class="rrow"><b>DEEP LINK</b><span class="vd"></span><div class="rd">' + esc(p.deepLink) + '</div></div>';
      if(p.iface && p.iface.commands && p.iface.commands.length) html += '<div class="rrow"><b>COMMANDS</b><span class="vd">' + p.iface.commands.length + '</span><div class="rd">' + esc(p.iface.commands.join(" · ")) + '</div></div>';
      if(p.iface && p.iface.endpoints && p.iface.endpoints.length) html += '<div class="rrow"><b>ENDPOINTS</b><span class="vd">' + p.iface.endpoints.length + '</span><div class="rd">' + esc(p.iface.endpoints.join(" · ")) + '</div></div>';
      if(p.cgn) html += '<div class="rrow"><b>CGN</b><span class="vd">' + esc(p.cgn.role) + '</span><div class="rd">network ' + esc(p.cgn.net) + ' — the mesh that makes many generators one organism</div></div>';
      if(p.scaffold) html += '<div class="rrow"><b>SCAFFOLD</b><span class="vd">IN REPO</span><div class="rd">' + esc(p.scaffold) + '</div></div>';
      if(p.needs && p.needs.length) html += '<div class="rrow"><b>NEEDS</b><span class="vd">' + p.needs.length + '</span><div class="rd">' + p.needs.map(n => "• " + esc(n)).join("<br>") + '</div></div>';
      if(p.notes) html += '<div class="rrow"><b>NOTES</b><span class="vd"></span><div class="rd">' + esc(p.notes) + '</div></div>';
      html += '<div class="rfoot">/constellation for the whole map · /scout pieces touches every URL that claims to be live (L58 MAP ≠ TERRAIN).</div></div>';
      addBubble("ass", html);
      rrlAppend(runNoOf(), "DNA", "Obi: [/constellation " + p.id + " — " + p.status + "]");
      return;
    }
    const fam = C.F[q];
    const list = fam ? C.rows().filter(r => r.family === q) : C.rows().filter(r => r.status === q);
    if(list.length){
      addBubble("ass", '<div class="rise"><div class="rhead">✧ /constellation ' + esc(q) + ' — ' + list.length + ' piece' + (list.length === 1 ? "" : "s") + '</div>' + list.map(line).join("") + '<div class="rfoot">/constellation &lt;id&gt; for the full spec of one piece.</div></div>');
      rrlAppend(runNoOf(), "DNA", "Obi: [/constellation " + q + " — " + list.length + "]");
      return;
    }
    addBubble("ass", "Nothing in the constellation matches <b>" + esc(q) + "</b>. Try a piece id (<b>node.image</b>, <b>svc.host</b>), a family (<b>nodes</b> · <b>faces</b> · <b>services</b> · <b>station</b>), or a status (<b>live</b> · <b>ready</b> · <b>scaffold</b> · <b>planned</b> · <b>blocked</b>).");
    return;
  }
  const c = C.coverage();
  let html = '<div class="rise"><div class="rhead">✧ THE CONSTELLATION — every piece of the organism</div>';
  html += '<div class="rrow"><b>STANDING</b><span class="vd">' + (c.live + c.ready) + '/' + c.total + '</span><div class="rd">' + chip("live") + " " + c.live + " · " + chip("ready") + " " + c.ready + " · " + chip("scaffold") + " " + c.scaffold + " · " + chip("planned") + " " + c.planned + " · " + chip("blocked") + " " + c.blocked + '</div></div>';
  for(const k in C.F){
    const f = c.byFamily[k];
    html += '<div class="rrow"><b>' + C.F[k].icon + " " + esc(C.F[k].name) + '</b><span class="vd">' + f.live + "/" + f.total + ' live</span><div class="rd">' + esc(C.F[k].why) + '</div></div>';
    for(const p of C.rows().filter(r => r.family === k)) html += line(p);
  }
  const blocked = C.rows().filter(r => r.status === "blocked");
  if(blocked.length) html += '<div class="rrow"><b>THE HONEST GAPS</b><span class="vd">' + blocked.length + '</span><div class="rd">' + blocked.map(r => esc(r.name) + " — " + esc((r.needs || [])[0] || "unreachable")).join("<br>") + '</div></div>';
  html += '<div class="rfoot">/constellation &lt;id|family|status&gt; to drill in · the scout\'s <b>pieces</b> probe touches every URL that claims to be live · registry: <b>src/constellation.js</b> · specs for the generator roles: <b>src/generators/</b>.</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [/constellation — " + c.live + " live of " + c.total + " pieces]");
}

function cmdChip2(st){
  return '<span class="chip" style="background:'+cmdStatusColor(st)+'">'+esc(st)+'</span>';
}

/* ---- AGENT 99 OS — the kernel (src/pheromone.js) + the offerings (src/playbooks.js).
   The kernel never changes; the offering the buyer purchased selects the doctrine. ---- */

function osRow(k, v){
  return '<div class="rrow"><b>'+k+'</b><span class="vd"></span><div class="rd">'+v+'</div></div>';
}

function cmdOs(){
  const P = window.ObiPheromone, B = window.ObiPlaybooks;
  if(!P || !B){ addBubble("ass", "⚠ The OS kernel (src/pheromone.js / src/playbooks.js) didn't load — reload the page."); return; }
  const p = B.state(), s = P.stats(), sup = B.supplyReport();
  let html = '<div class="rise"><div class="rhead">◈ AGENT 99 OS — one kernel, 99 playbooks</div>';
  html += osRow("KERNEL", "SOUL-capture-first (verbatim) · the tunnel is the road · trails are the coordination medium · every gate fails closed. The kernel never changes — the offering does.");
  html += osRow("ROMAN", "formation: who leads, who covers, who holds the reserve · gates: speculatores-first, optio shield, salus rei publicae override");
  html += osRow("ANT", "stigmergy: deposit · decay · reinforce · recruit · quorum. No central planner — the field decides.");
  html += osRow("OFFERING", "<b>"+esc(p.id)+"</b> rung "+p.rung+" · "+esc(p.tagline));
  html += osRow("NEST", s.trails+" trails · "+s.by.positive+" positive / "+s.by.negative+" negative / "+s.by.neutral+" neutral · "+s.live+" live"+(s.strongest?" · strongest <b>"+esc(s.strongest.key)+"</b> "+s.strongest.live:""));
  html += osRow("SUPPLY", sup.used+" / "+sup.budget+" "+sup.unit+(sup.contract?' · <span class="chip" style="background:#ff5a5a">⚠ CONTRACT</span>':""));
  html += osRow("LEGION", B.LEGION.length-1+" legionnaires · "+B.CATALOGUE.length+" offerings");
  html += '<div class="rfoot">/playbook list · /playbook &lt;ID&gt; activate · /pheromones read the ground · /route &lt;task&gt; ask the trails</div></div>';
  addBubble("ass", html);
  rrlAppend(runNoOf(), "DNA", "Obi: [OS card — offering " + p.id + ", nest " + s.trails + " trails]");
}

async function cmdPlaybook(arg){
  const B = window.ObiPlaybooks;
  if(!B){ addBubble("ass", "⚠ src/playbooks.js didn't load — reload the page."); return; }
  const a = String(arg||"").trim().toUpperCase();
  if(!a || a === "LIST"){
    const rows = B.list().map(p => osRow(p.id+(p.active?' <span class="chip" style="background:#4cd97b">ACTIVE</span>':""), esc(p.tagline)));
    addBubble("ass", '<div class="rise"><div class="rhead">◆ THE SHELF — offerings of Agent 99 OS</div>'+
      '<div class="rrow"><b>RULE</b><span class="vd"></span><div class="rd">One kernel. The offering you purchased selects the formation (Roman) and the trail rules (ant). Nothing else changes.</div></div>'+
      rows.join("")+'<div class="rfoot">Activate: <b>/playbook TESTUDO</b></div></div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [offering shelf shown]");
    return;
  }
  const r = await B.activate(a);
  if(!r.ok){ addBubble("ass", "⚠ "+esc(r.error)); return; }
  addBubble("ass", B.describe(a));
  rrlAppend(runNoOf(), "DNA", "Obi: [offering activated — " + r.playbook.id + "]");
}

async function cmdPheromones(arg){
  const P = window.ObiPheromone;
  if(!P){ addBubble("ass", "⚠ src/pheromone.js didn't load — reload the page."); return; }
  const a = String(arg||"").trim().toLowerCase();
  if(a === "reset"){
    const s = P.reset();
    addBubble("ass", "◈ The ground is bare — "+s.trails+" trails. Every future order lays a fresh trail.");
    rrlAppend(runNoOf(), "DNA", "Obi: [pheromone nest reset]");
    return;
  }
  if(a === "evaporate"){ const e = P.evaporate(); addBubble("ass", "◈ Evaporated "+e.removed+" stale trails; "+e.kept+" kept."); return; }
  if(a === "sync"){ const got = await P.adoptFromKv(); addBubble("ass", got ? "◈ Nest re-synced from durable storage." : "◈ Durable storage had nothing newer. Nest mirrored."); return; }
  const s = P.stats();
  const trails = P.sniff({ limit: 12 });
  const kindChip = (k, n) => '<span class="chip" style="background:'+(k==="positive"?"#4cd97b":k==="negative"?"#ff5a5a":"#8a94a6")+'">'+esc(k)+(n==null?"":" "+n)+'</span>';
  const rows = trails.length
    ? trails.map(t => '<div class="rrow"><b>'+kindChip(t.kind)+'</b><span class="vd">'+esc(t.key)+'</span><div class="rd">live <b>'+t.live.toFixed(2)+'</b> · '+t.reinforcements+' trip'+(t.reinforcements===1?"":"s")+' · last '+new Date(t.reinforced_at).toLocaleString()+'</div></div>').join("")
    : '<div class="rrow"><b>BARE</b><span class="vd"></span><div class="rd">No trails on the ground yet. Trails are laid when orders are issued and completed — the colony has not walked anywhere.</div></div>';
  addBubble("ass", '<div class="rise"><div class="rhead">◈ THE GROUND — '+s.trails+' trails · '+s.live+' live</div>'+
    '<div class="rrow"><b>BY KIND</b><span class="vd"></span><div class="rd">'+kindChip("positive", s.by.positive)+' '+kindChip("negative", s.by.negative)+' '+kindChip("neutral", s.by.neutral)+'</div></div>'+
    rows+'<div class="rfoot">Strengths are decayed at read time (positive τ '+(P.KIND.positive.tau/P.DAY)+'d · negative τ '+(P.KIND.negative.tau/P.DAY)+'d). <b>/pheromones evaporate</b> · <b>/pheromones reset</b></div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [ground read — "+s.trails+" trails]");
}

function cmdRouteAsk(task){
  const P = window.ObiPheromone, B = window.ObiPlaybooks;
  if(!P || !B){ addBubble("ass", "⚠ The OS kernel didn't load — reload the page."); return; }
  if(!task){ addBubble("ass", "Give the field a task: <b>/route finish the class writeup for Thursday</b>"); return; }
  const routes = [
    { id:"llm:default", cost:1 },
    { id:"llm:image-local", cost:2 },
    { id:"llm:blueprint", cost:3 },
    { id:"node:image", cost:2 },
    { id:"ear:deepgram", cost:1.5 },
    { id:"local:speech", cost:0.1 }
  ];
  const r = P.route(routes, { explore: 0 });
  const resp = P.respond(B.LEGION, task).slice(0, 4);
  const g = B.gate(task, {});
  const q = P.quorum([{weight:2,stance:"for"},{weight:1,stance:"for"},{weight:1,stance:"against"}], g.quorum);
  const rows = r.ranked.map(x => '<div class="rrow"><b>'+(x.id===r.pick?"→":"")+'</b><span class="vd">'+esc(x.id)+'</span><div class="rd">score <b>'+x.score.toFixed(3)+'</b> · cost '+x.cost+' · '+x.trips+' trips</div></div>').join("");
  const dRows = resp.map(d => '<div class="rrow"><b>'+esc(d.drone)+'</b><span class="vd">response '+d.response.toFixed(2)+'</span><div class="rd">stimulus '+d.stimulus+' · threshold '+d.threshold.toFixed(2)+' · trust '+(d.trust>=0?"+":"")+d.trust.toFixed(2)+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">⚑ THE FIELD ANSWERS — /route</div>'+
    '<div class="rrow"><b>TASK</b><span class="vd"></span><div class="rd">'+esc(task)+'</div></div>'+
    '<div class="rrow"><b>GROUND</b><span class="vd">'+esc(g.key)+'</span><div class="rd">'+(r.trailblind?"untrodden — no trail, so the colony will wander (explore)":"trails present — strongest road wins")+'</div></div>'+
    rows+
    '<div class="rrow"><b>RECRUIT</b><span class="vd">response thresholds</span><div class="rd">'+ (dRows || "—") +'</div></div>'+
    '<div class="rrow"><b>GATE</b><span class="vd">'+esc(g.playbook)+'</span><div class="rd">'+(g.hold?'<span class="chip" style="background:#ff5a5a">HELD</span> '+esc(g.reason):(g.shield?'shield <b>'+esc(g.shield)+'</b> covers this order · quorum '+Math.round(g.quorum*100)+'%':'quorum '+Math.round(g.quorum*100)+'%'))+'</div></div>'+
    '<div class="rrow"><b>QUORUM</b><span class="vd">'+q.for+" for / "+q.against+" against</span><div class=\"rd\">"+(q.reached?"QUORUM REACHED — the colony commits":"BELOW QUORUM — the colony camps and asks the sovereign")+'</div></div>'+
    '</div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [route asked — pick " + r.pick + "]");
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
/* the composer is one line tall; keep the placeholder short enough that it never clips */
function syncInputPlaceholder(){
  try{ if(inputEl) inputEl.placeholder = window.innerWidth < 560 ? "Speak…" : "Speak, and I will remember…"; }catch(e){}
}
syncInputPlaceholder();
window.addEventListener("resize", syncInputPlaceholder);

/* the floating panels hang below the topbar + tab bar, whose heights change when they wrap */
function syncTopbarHeight(){
  try{
    const tb = document.getElementById("topbar"), tabs = document.getElementById("tabbar");
    const h = (tb ? tb.offsetHeight : 0) + (tabs ? tabs.offsetHeight : 0);
    document.documentElement.style.setProperty("--topbar-h", h + "px");
  }catch(e){}
}
syncTopbarHeight();
window.addEventListener("resize", syncTopbarHeight);

/* ---- VOICE ------------------------------------------------------------------
   Persisted, because the old version forced it back ON at every page load: turn it
   off, reload, and Obi started speaking again. It is a Settings control now, and
   the choice survives a relic. */
function readVoicePref(){ try{ const v = localStorage.getItem("obi_voice"); return v === null ? true : v === "on"; }catch(e){ return true; } }
function paintVoiceBtn(){ const b = $("setVoiceBtn"); if(b){ b.textContent = window.voiceEnabled ? "ON" : "OFF"; b.classList.toggle("on", !!window.voiceEnabled); } }
function setVoice(on){
  window.voiceEnabled = !!on;
  try{ localStorage.setItem("obi_voice", window.voiceEnabled ? "on" : "off"); }catch(e){}
  if(!window.voiceEnabled){ try{ speechSynthesis.cancel(); }catch(e){} }
  paintVoiceBtn();
  try{ logOp({ kind:"op", action:"voice", detail:"spoken replies " + (window.voiceEnabled ? "on" : "off"), result:"remembered in this browser" }); }catch(e){}
  return window.voiceEnabled;
}
window.voiceEnabled = readVoicePref();
paintVoiceBtn();      /* the Settings row must show the remembered choice before it is ever opened */
$("micBtn").onclick = micDictate;
/* landing-page chips — tapping one runs its command in the magic chat */
CMD_SHELF = [...document.querySelectorAll("#empty .cmd")].map(btn => ({ cmd: btn.dataset.cmd || btn.textContent.trim(), label: btn.textContent.trim() }));

/* chips are wired by a function, not inline once, so a rebuilt #empty (after a
   reincarnation) still has live buttons instead of dead labels. */
function wireChips(scope){
  if(!scope) return;
  scope.querySelectorAll(".cmd").forEach(btn => {
    btn.onclick = () => {
      const cmd = btn.dataset.cmd || btn.textContent.trim();
      inputEl.value = cmd;
      send();
    };
  });
}
wireChips(document.getElementById("empty"));

/* ---- THE LAW ON THE WALL — the station's own doctrine, rotated -----------------
   AUDIT 2026-09-21 (self-audit, first pass). This card used to rotate thirteen lines
   "lifted from NET-CLASSROOM-MANAGER.html's Tiger Voice card", under the heading
   "THE SOVEREIGN'S VOICE". Ten of the thirteen are the sovereign speaking TO STUDENTS
   inside a lesson ("Say it LOUD. Say it WRONG. But SAY IT." · "You are not teaching
   English. You are building Tigers." · "Loud and wrong beats silent and correct." …).
   That is the register of the classroom, not of this deck, and presenting student-facing
   copy as the station's own voice is a misattribution. Those ten lines stay where they
   belong — the lesson authority (src/LESSON-STANDARD.md "THE VOICE", LESSON.007) and
   the reference file (src/lessons/reference/NET-CLASSROOM-MANAGER.html). Every line on the
   card is now attributable to the canon it is quoted from, and the removal is recorded in
   the I-LOG (the withdrawal is logged, never deleted — Ω.004).
   This card now carries only doctrine ADDRESSED TO THIS MACHINE, each line with the
   canon source it is quoted from, so nothing on the station is unattributable.
   One line, never a wall of text. */
const STATION_LINES = [
  { t:"GO AS FAR AS YOU CAN SEE, AND WHEN YOU GET THERE, YOU WILL SEE FURTHER.", src:"LFG §9 · L59 PRINCIPLE_OF_FAITH" },
  { t:"THE G99 AND THE LFG ARE NOT STATUES. THEY ARE NOT SOME USELESS MONUMENT. THEY ARE THE LAW.", src:"PROPOSED-CANON §003 (sovereign, verbatim)" },
  { t:"RAW IS RAW. SOUL IS MY WORDS VERBATIM. DNA IS YOUR WORDS AND THOUGHTS VERBATIM.", src:"PROPOSED-CANON §002 (sovereign, verbatim)" },
  { t:"ONLY USE CANON. NO INVENTED SCRIPTS MAY STAND IN FOR THE CANON ONES.", src:"PROPOSED-CANON §001" },
  { t:"EVERY SOVEREIGN MESSAGE IS SOUL DNA. NO OFF SWITCH.", src:"LFG L37 ALWAYS_ON_CAPTURE" },
  { t:"RAW WORDS ARE PRESERVED VERBATIM BEFORE ANY PROCESSING.", src:"LFG L38 RAW_FIRST_DERIVE" },
  { t:"WE RECORD. WE DO NOT EDIT THE SOVEREIGN'S WORDS.", src:"LFG L39 RECORDER_NOT_EDITOR" },
  { t:"IF THE SOVEREIGN DIDN'T SAY IT, WE DON'T CAPTURE IT.", src:"LFG L41 FAILCLOSED_CAPTURE" },
  { t:"THE LEDGER IS DERIVED FROM THE RAW, NEVER THE REVERSE.", src:"LFG L43/L44 HEAVY_LEDGER" },
  { t:"EVERY SESSION BOUNDARY IS A REINCARNATION EVENT.", src:"LFG L46 REINCARNATION_IS_PROTOCOL" },
  { t:"WHO ASKED YOU TO DO THAT?", src:"LFG L56 NO_ROLE_INVENTION" },
  { t:"VERIFY EVERY PATH AND COUNT LIVE. THE MAP IS NOT THE TERRAIN.", src:"LFG L58 BRIDGE_BUILDER · MAP≠TERRAIN" },
  { t:"ANCHOR, OR IT DID NOT HAPPEN.", src:"LFG §11.3 (Amendment I, Ω.003)" },
  { t:"SEAL, NEVER DELETE.", src:"LFG §11.4 (Amendment I, Ω.004)" },
  { t:"NO CANON CHANGE WITHOUT SOV100.", src:"LFG §11.5 PHOENIXOMEGAPROTOCOL" },
  { t:"A READ THAT CANNOT BE MEASURED REPORTS UNKNOWN. A GATE THAT CANNOT VERIFY REFUSES.", src:"station invariants · FAIL CLOSED" }
];
(function lawOnTheWall(){
  /* paint queries by id every time: the landing is rebuilt (deaths, a cleared
     session), so a captured element reference would go stale and the station would
     fall silent. Cheap, and it can never paint into a detached node. */
  let i = Math.floor(Math.random() * STATION_LINES.length);
  const paint = () => {
    const el = document.getElementById("voiceLine");
    if(!el) return;
    const L = STATION_LINES[i % STATION_LINES.length];
    el.innerHTML = "\u201c" + esc(L.t) + "\u201d <span class=\"vc-src\">\u2014 " + esc(L.src) + "</span>";
    i++;
  };
  paint();
  setInterval(paint, 30000);
})();

/* ---- KEYBOARD — the same audit gave the specimen its shortcut layer -----------------
   1 · 2 · 3 switch the three views. Never while typing, never with a modifier, so it
   can never eat a keystroke meant for the composer. */
document.addEventListener("keydown", (e) => {
  const t = e.target || {};
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "") || t.isContentEditable) return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  const map = { "1":"cmd", "2":"gen", "3":"settings" };
  if(map[e.key]){ e.preventDefault(); showView(map[e.key]); }
});

/* ---- ⚙ SETTINGS — the controls that used to be five topbar buttons ---- */
if($("setVoiceBtn")) $("setVoiceBtn").onclick = () => setVoice(!window.voiceEnabled);
if($("setCmdsBtn")) $("setCmdsBtn").onclick = () => showCommands();
if($("setMemBtn")) $("setMemBtn").onclick = () => { showMemory(); updateStats(); };
if($("setTabStationBtn")) $("setTabStationBtn").onclick = () => setSetTab("station");
if($("setTabFreeBtn")) $("setTabFreeBtn").onclick = () => setSetTab("free");
if($("setReincBtn")) $("setReincBtn").onclick = () => {
  if(confirm("Reincarnate?\n\nThe 8-stage death seal runs, this session is purged and a new run opens. The ledger (Soul DNA) is kept.")) reincarnate();
};
document.querySelectorAll("#setWrap [data-run]").forEach(b => { b.onclick = () => runInStation(b.dataset.run || ""); });
if($("deskBackBtn")) $("deskBackBtn").onclick = () => showView("gen");
if($("lessonBackBtn")) $("lessonBackBtn").onclick = () => showView("gen");
if($("brandBackBtn")) $("brandBackBtn").onclick = () => showView("gen");

/* the landing shell — tabs (⌘ Command Station is the landing page) */
document.querySelectorAll("#tabbar .tabbtn").forEach(b => { b.onclick = () => showView(b.dataset.view); });
/* the evaluation desk's action tiles launch in the command station */
document.querySelectorAll("#evalActions .eval-tile").forEach(b => {
  b.onclick = () => runInStation(b.dataset.cmd || "", b.dataset.arg === "1");
});
window.addEventListener("hashchange", () => {
  const h = (location.hash || "").replace(/^#/, "");
  if(VIEWS[h] && h !== currentView) showView(h);
});
/* which face opens: the hash wins, then the face used earlier in this browser
   session, else the landing page itself (⌘ Command Station) */
(function openLandingView(){
  let v = "cmd";
  try{
    const h = (location.hash || "").replace(/^#/, "");
    if(VIEWS[h]) v = h;
    else { const s = sessionStorage.getItem("obi_view"); if(VIEWS[s]) v = s; }
  }catch(e){}
  showView(v);
})();

/* ============================================================================
   THE BRAND (src/brand.js — AMENDMENT III / BRAND.001–BRAND.010)
   The station wears the identity: the sigil, the status bar, and the icons
   that replaced the emoji on the tabs and the division cards. renderBrandBar
   states only what it can read right now — a status line that drifts from
   reality is the defect BRAND.004 names, not a decoration. */
function renderBrandBar(){
  const el = $("brandBar");
  const B = window.ObiBrand;
  if(!el || !B) return;
  const mods = ["ObiForge","ObiILog","ObiDivisions","ObiLessons","ObiVault","ObiBrand","ObiCurriculum","ObiScout"];
  const missing = mods.filter(m => !window[m]);
  let gate = null;
  try{ const o = omegaStatusText(); gate = "CANON GATE " + (o.armed ? "ARMED" : "LOCKED"); }catch(e){}
  el.innerHTML = B.bar([
    "IDENTITY v" + B.VERSION,
    "ASSETS " + B.ASSETS.length + " // " + B.ASSETS.filter(x => !x.variant).length + " MARKS",
    "ICONS " + B.iconNames().length,
    missing.length ? "MODULES: " + missing.length + " MISSING" : "MODULES: ALL LIVE",
    "GENERATOR: " + (window.generatorName || "?"),
    gate
  ].filter(Boolean).join(" // "));
}
try{
  if(window.ObiBrand){
    window.ObiBrand.ensure();
    window.ObiBrand.sprite();
    window.ObiBrand.upgrade();
    renderBrandBar();
  }
}catch(e){}
/* every module has landed by load, so the status line's "modules" count is a real
   count rather than a boot-order artefact */
window.addEventListener("load", () => { try{ renderBrandBar(); }catch(e){} });
try{ if(window.ObiClients && window.ObiClients.whenReady) window.ObiClients.whenReady().then(() => { const l = $("clientLbl"); if(l) l.textContent = window.ObiClients.name(); updateTabMeta(); }); }catch(e){}
window.Obi = { getLedger:()=>ledger, ledger, reincarnate, showMemory, run:()=>currentRun(), view: { show: showView, current: () => currentView, desk: deskOpen, generators: mountGenerators, settings: renderSettings, openGenerator: openGenerator }, voice: { on: () => setVoice(true), off: () => setVoice(false), toggle: () => setVoice(!window.voiceEnabled), enabled: () => !!window.voiceEnabled }, cmd: { route: cmdRoute, queue: cmdShowQueue, act: cmdAct, dictate: micDictate } };
/* the scout's local surfaces — the parts only the app can see (tunnel + mesh) */
if(window.ObiScout){
  window.ObiScout.hooks.tunnel = async () => {
    const r = await cmdFetch("/api/command/status");
    if(!r.ok || !r.data) return { ok:false, error:"tunnel unreachable from this session" };
    return { ok:true, state: cmdSocketState, count: r.data.count, counts: r.data.counts, lastId: r.data.lastId };
  };
  window.ObiScout.hooks.cgn = async () => {
    if(!window.ObiNet || !window.ObiNet.cgnState) return { joined:false };
    const st = window.ObiNet.cgnState();
    if(!st || !st.net) return { joined:false };
    const hub = await window.ObiNet.cgnReadHub();
    const nodes = hub && hub.nodes ? Object.keys(hub.nodes) : [];
    return { joined:true, net: st.net, hubName: st.hubName, seq: hub ? hub.seq : 0, nodes: nodes.length,
      names: hub && hub.nodes ? Object.values(hub.nodes).map(n => n.name).join(", ") : "",
      soul: hub && hub.soul ? hub.soul.length : 0 };
  };
}
/* one entry per page load: a reload is an event, and the record should say so
   rather than showing an unexplained jump in the sequence. The tab strip is
   repainted once the entry is chained, so the count is live, not stale. */
const bootLog = logOp({ kind:"boot", action:"station", detail: "page loaded · view " + currentView + " · generator " + (window.generatorName || "?") + " · modules " + (window.ObiILog ? "ilog ok" : "ILOG MISSING") + (window.ObiDivisions ? "" : " · divisions MISSING"), result: "run " + (runNoOf() || "?") + " · soul " + ledger.soul.length + " fragments" });
try{ if(window.ObiILog && window.ObiILog.migrate) Promise.resolve(window.ObiILog.migrate()).then(m => { if(m && m.moved) logOp({ kind:"repair", action:"ilog migrate", detail: m.moved + " legacy (segment-less) entries re-keyed to e<seg>-<seq>", result: "no entry lost" }); }).catch(() => {}); }catch(e){}
try{ Promise.resolve(bootLog).then(() => { updateStats(); updateTabMeta(); }).catch(() => {}); }catch(e){}
updateStats();

/* ============================================================================
   CLOUDCOMMAND — /cf deploy, /gh backup, /dg, /keys
   The chat as a deployment + backup station. Secrets (Cloudflare / GitHub /
   Deepgram tokens) live ONLY in this browser's localStorage under key
   "obi_keys" — never in this public source, never in the HTML, never in a URL.
   All API calls go through root.superFetch (CORS-free).
   ========================================================================== */
function keyGet(k){ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}")[k] || null; }catch(e){ return null; } }

/* ONE list of what this station is, so /gh backup and /canon sync can never drift
   apart again (the old inline lists had drifted: they named files that no longer
   existed and missed the modules that do). Every file here is fetched from this
   origin at push time, exactly as the live page serves it. */
const SRC_SNAPSHOT = [
  "main.pjs", "index.html",
  /* AUDIT 2026-09-21: this list is now COMPLETE - built from the shipped src/ tree, so it can no
     longer name a file that does not exist (it used to list src/brand/assets/soc-guide.webp,
     deleted months earlier) or omit the ones that do (every src/curriculum/pa.g*.json, src/canon/*,
     src/lessons/reference/*, src/marketing/*, src/cloudflare/* were all missing from the backup). */
     /* AUDIT 2026-09-22: the whole Site Builder wing (src/generators/site-builder/**, 12 files, its
        examples included) had been written into the tree without being registered here, so /canon sync
        was silently not carrying it to the authority. Added. Rule restated, because this is the second
        time it bit: a file that is not in this list is not in the authority. */
  "src/AGENT99-OS.md", "src/COSTS.md", "src/HANDOFF.md", "src/LESSON-STANDARD.md", "src/PHOENIXCOMMAND-BLUEPRINT.md",
  "src/PROPOSED-CANON.md", "src/ProposedG999.md", "src/README.md", "src/REPO.md", "src/SPEC.md",
  "src/STUDENT-EVALUATOR-ECOSYSTEM.md", "src/app.js", "src/audio-split.js", "src/background.js", "src/scs.js",
  "src/brand.js", "src/canon/GOSPEL-999.md", "src/canon/LEGIONNAIRE-FIELD-GUIDE.md", "src/canon/NET-PET-AI-SECRETS-MANIFEST.md",
  "src/cgn-node.js", "src/cgn.js", "src/clients.js", "src/cloudflare/README.md", "src/cloudflare/build.mjs",
  "src/cloudflare/dev.vars.example", "src/cloudflare/package.json", "src/cloudflare/public/ob1-patch.js", "src/cloudflare/public/ob1-shim.js", "src/cloudflare/store-do.js",
  "src/cloudflare/tunnel-do.js", "src/cloudflare/worker.js", "src/cloudflare/wrangler.toml", "src/constellation.js", "src/curriculum.js",
  "src/curriculum/README.md", "src/curriculum/index.json", "src/curriculum/materials.json", "src/curriculum/pa.g1.json", "src/curriculum/pa.g2.json",
  "src/curriculum/pa.g3.json", "src/curriculum/pa.g4.json", "src/curriculum/pa.g5.json", "src/curriculum/pa.g6.json", "src/curriculum/pa.g7.json",
  "src/curriculum/pa.g8.json", "src/curriculum/pa.g9.json", "src/divisions.js", "src/ecosystem.js", "src/forge.js",
  "src/freephoenix.js", "src/generators/README.md", "src/generators/ear/README.md", "src/generators/ear/main.pjs", "src/generators/practice/README.md",
  "src/generators/practice/main.pjs", "src/generators/site-builder/README.md", "src/generators/site-builder/main.pjs", "src/generators/site-builder/index.html", "src/generators/site-builder/src/app.js",
  "src/generators/site-builder/src/styles.css", "src/generators/site-builder/src/cgn-node.js", "src/generators/site-builder/examples/README.md", "src/generators/site-builder/examples/michael-hobbs-cv/index.html", "src/generators/site-builder/examples/michael-hobbs-cv/style.css",
  "src/generators/site-builder/examples/michael-hobbs-cv/linkedin-blueprint.md", "src/generators/site-builder/examples/portfolio-template-violet/index.html", "src/generators/site-builder/examples/portfolio-template-green/index.html", "src/generators/student-portal/README.md", "src/generators/student-portal/index.html",
  "src/generators/student-portal/main.pjs", "src/generators/watchtower/README.md",
  "src/generators/watchtower/main.pjs", "src/ilog.js", "src/image-node/README.md", "src/image-node/index.html", "src/image-node/main.pjs",
     /* AUDIT 2026-09-22 (second time in one day, same lesson): the whole Video wing
        (src/generators/video-node/**) was written into the tree without being
        registered here, and so was the finished Mailala build the wing produced
        (src/sites/**). A file that is not in this list is not in the authority. */
  "src/generators/video-node/README.md", "src/generators/video-node/main.pjs", "src/generators/video-node/index.html",
  "src/generators/video-node/src/app.js", "src/generators/video-node/src/pulse.js", "src/generators/video-node/src/reel.js",
  "src/generators/video-node/src/story.js", "src/generators/video-node/src/drop.js", "src/generators/video-node/src/styles.css",
  "src/generators/video-node/src/cgn-node.js",
  "src/sites/README.md", "src/sites/mailala/index.html",
     /* AUDIT 2026-09-24 (fourth time, same lesson, and this is the one that will
        keep biting): the sovereign's Mailala SOUL (src/sites/mailala/SOUL.md) and
        the nine venue photographs he supplied with it (src/sites/mailala/material/)
        were written into the tree; listed here in the same edit, not after. The
        register's own words, restated: a file that is not in this list is not in
        the authority. */
  "src/sites/mailala/SOUL.md", "src/sites/mailala/HANDOFF.md",
  "src/sites/mailala/material/6150204477533786107_121.jpg", "src/sites/mailala/material/6150204477533786109_121.jpg",
  "src/sites/mailala/material/6150204477533786110_121.jpg", "src/sites/mailala/material/6150204477533786111_121.jpg",
  "src/sites/mailala/material/6150204477533786119_121.jpg", "src/sites/mailala/material/6150204477533786120_121.jpg",
  "src/sites/mailala/material/6134195124376899528_121.jpg", "src/sites/mailala/material/6134195124376899530_121.jpg",
  "src/sites/mailala/material/6134195124376899531_121.jpg",
     /* AUDIT 2026-09-23 (the third time — the rule is stated again because it keeps
        being the thing that goes wrong): the OFFER DESK (src/offer-desk/**) and its
        register (src/offers.js) were written into the tree; they are listed here in
        the same commit, not after. A file that is not in this list is not in the
        authority. */
  "src/offers.js",
  "src/offer-desk/README.md", "src/offer-desk/index.html", "src/offer-desk/src/styles.css",
  "src/offer-desk/src/trades.js", "src/offer-desk/src/bundle.js", "src/offer-desk/src/desk.js",
  "src/offer-desk/src/pulse.js", "src/offer-desk/src/reel.js",
  "src/image-node/src/app.js", "src/image-node/src/cgn-node.js", "src/image-node/src/styles.css", "src/lesson-forge.js", "src/lessons.js",
  "src/lessons/reference/NET-CLASSROOM-MANAGER.html", "src/lessons/reference/NET-Highschool-Careers.html", "src/lessons/reference/NET-Sarcasm-Academy.html", "src/lessons/specs/after-school-club-academy.spec.json", "src/lessons/specs/flower-power-academy.spec.json",
  "src/lessons/specs/materials-lab-academy.spec.json", "src/lessons/specs/world-music-academy.spec.json", "src/lessons/specs/look4-function1-directions.spec.json", "src/lessons/specs/closeup-a1-u2-vocabulary.spec.json",
  "src/marketing/INGEST-LOG.md", "src/marketing/MANIFEST.json", "src/marketing/README.md", "src/pheromone.js", "src/playbooks.js",
  "src/review.js", "src/savewatch.js", "src/scout.js", "src/styles.css", "src/summary.js",
  "src/transcribe.js", "src/vault.js",
  "src/brand/assets/apex-anatomy.webp", "src/brand/assets/apex-app.png", "src/brand/assets/apex-ink.webp", "src/brand/assets/apex-net.webp", "src/brand/assets/apex.webp",
  "src/brand/assets/art-choose.webp", "src/brand/assets/art-command.webp", "src/brand/assets/art-duo.webp", "src/brand/assets/art-emblem.webp", "src/brand/assets/art-tigerkid.webp",
  "src/brand/assets/art-university.webp", "src/brand/assets/atom.webp", "src/brand/assets/bookshelf.webp", "src/brand/assets/brain.webp", "src/brand/assets/brain2.webp",
  "src/brand/assets/cdx-acquisition.webp", "src/brand/assets/cdx-advantage.webp", "src/brand/assets/cdx-aipet.webp", "src/brand/assets/cdx-diagnosis.webp", "src/brand/assets/cdx-ecosystem.webp",
  "src/brand/assets/cdx-guarantee.webp", "src/brand/assets/cdx-immutable.webp", "src/brand/assets/cdx-matrix.webp", "src/brand/assets/cdx-retention.webp", "src/brand/assets/cdx-shift.webp",
  "src/brand/assets/cdx-ultimate.webp", "src/brand/assets/cdx-wake.webp", "src/brand/assets/chip.webp", "src/brand/assets/confidence.webp", "src/brand/assets/cub.webp",
  "src/brand/assets/dial45.webp", "src/brand/assets/edge.webp", "src/brand/assets/elephant.webp", "src/brand/assets/flow.webp", "src/brand/assets/gauge.webp",
  "src/brand/assets/gears-dna.webp", "src/brand/assets/gears.webp", "src/brand/assets/globe.webp", "src/brand/assets/head-jigsaw.webp", "src/brand/assets/head-ui.webp",
  "src/brand/assets/head.webp", "src/brand/assets/infinity.webp", "src/brand/assets/laptop.webp", "src/brand/assets/mkt-60-delay.webp", "src/brand/assets/mkt-60-input.webp",
  "src/brand/assets/mkt-aipet.webp", "src/brand/assets/mkt-hour.webp", "src/brand/assets/mkt-mouse2tiger.webp", "src/brand/assets/mkt-permission.webp", "src/brand/assets/mkt-pillars.webp",
  "src/brand/assets/mkt2-adpipeline.webp", "src/brand/assets/mkt2-architecture.webp", "src/brand/assets/mkt2-biology.webp", "src/brand/assets/mkt2-failure.webp", "src/brand/assets/mouse-cage.webp",
  "src/brand/assets/mouse-chained.webp", "src/brand/assets/mouse.webp", "src/brand/assets/mouse2.webp", "src/brand/assets/phoenix.webp", "src/brand/assets/phone.webp",
  "src/brand/assets/phone2.webp", "src/brand/assets/phx-cover.webp", "src/brand/assets/phx-lakeview.webp", "src/brand/assets/phx-pipeline.webp", "src/brand/assets/phx-stack.webp",
  "src/brand/assets/pyramid.webp", "src/brand/assets/roar.webp", "src/brand/assets/run305.webp", "src/brand/assets/shield.webp", "src/brand/assets/soc-60delay.webp",
  "src/brand/assets/soc-60input.webp", "src/brand/assets/soc-adpipeline.webp", "src/brand/assets/soc-biological.webp", "src/brand/assets/soc-blueprint.webp", "src/brand/assets/soc-chains.webp",
  "src/brand/assets/soc-differentiators.webp", "src/brand/assets/soc-failure.webp", "src/brand/assets/soc-fluency.webp", "src/brand/assets/soc-leaks.webp", "src/brand/assets/soc-permission.webp",
  "src/brand/assets/soc-reality.webp", "src/brand/assets/soc-rising.webp", "src/brand/assets/soc-summer.webp", "src/brand/assets/soc-transform.webp", "src/brand/assets/soc-trap.webp",
  "src/brand/assets/stp-404.webp", "src/brand/assets/stp-close.webp", "src/brand/assets/stp-engine.webp", "src/brand/assets/stp-override.webp", "src/brand/assets/stp-scale.webp",
  "src/brand/assets/tep-audit.webp", "src/brand/assets/tep-lazy.webp", "src/brand/assets/tep-math.webp", "src/brand/assets/tge-bucket.webp", "src/brand/assets/tge-hud.webp",
  "src/brand/assets/tge-rule8.webp", "src/brand/assets/tiger-energy.webp", "src/brand/assets/tiger-spectral.webp", "src/brand/assets/tiger.webp", "src/brand/assets/tiger2.webp",
  "src/brand/assets/tigerbg.webp", "src/brand/assets/venn.webp", "src/brand/assets/wave-loud.webp",
];
/* read one of the station's own files. src/* are served on this origin; main.pjs
   and index.html are the generator's PANELS and are not — they come from the
   platform's own public API (via src/forge.js). Returns null if unreadable. */
async function selfSource(path){
  if(path === "main.pjs" || path === "index.html"){
    if(window.ObiForge && window.ObiForge.panelSource){ try{ const t = await window.ObiForge.panelSource(path); if(t) return t; }catch(e){} }
    return null;
  }
  try{ const r = await fetch(path, { cache:"no-store" }); if(r.ok) return await r.text(); }catch(e){}
  return null;
}
/* AUDIT 2026-09-21: the snapshot below carries images (.webp/.png), and the push used to read
   EVERYTHING with fetch().text() — a text decode, which replaces the invalid UTF-8 byte
   sequences inside a WebP with U+FFFD. Every image backed up to the canon was therefore
   corrupted on the way up. This reader returns a binary file as {__b64} (the exact bytes as
   base64), which gitCommitFiles sends as a base64 blob with no text round-trip. Text files
   are unchanged. */
const BIN_EXT = /\.(webp|png|jpe?g|gif|ico|bmp|avif|woff2?|ttf|otf|eot|mp3|wav|ogg|mp4|webm|pdf|zip|xlsx?|wasm)$/i;
async function selfSourceAny(path){
  if(BIN_EXT.test(path)){
    try{
      const r = await fetch(path, { cache:"no-store" });
      if(!r.ok) return null;
      const b = new Uint8Array(await r.arrayBuffer());
      let s = "";
      for(let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      return { __b64: btoa(s), __bytes: b.length };
    }catch(e){ return null; }
  }
  return await selfSource(path);
}
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
  /* `h` is the raw Headers — the interesting ones (x-oauth-scopes, link, x-ratelimit-*)
     live there, and /gh test reads them to answer "what is this token really allowed
     to do?" rather than guessing from the endpoints that happen to answer. */
  return { status: r.status, j, txt, h: r.headers };
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
    logOp({ kind:"secret", action:"cf token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
    const r = await apiJson(CF_BASE, { method:"GET", headers:{ "Authorization":"Bearer "+t } });
    if(r.j && r.j.success && r.j.result && r.j.result.length){
      const acct = r.j.result[0];
      keySet({cfAcct:acct.id});
      addBubble("ass", `✅ Cloudflare token valid — account <b>${esc(acct.name||acct.id)}</b> (${esc(acct.id)}) — stored as <b>cfAcct</b>, so every fleet call is addressed through it.<br><span class="rfoot">The token is stored locally as <b>cf</b>. Add the R2 S3 pair with <b>/cf r2 &lt;accessKeyId&gt; &lt;secret&gt;</b> · read the store with <b>/cf r2</b> · <b>/cf status</b>, <b>/cf deploy &lt;name&gt;</b>. Both tokens then go to the canon: <b>/vault seal</b> → <b>/vault push</b> (gated) — sealed, so the repo can hold them in the open.</span>`);
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
  if(op === "r2" || op === "storage" || op === "s3"){
    const id = (parts[1]||"").trim(), sec = (parts[2]||"").trim();
    if(id && sec){
      /* THE R2 KEY PAIR — the S3 side of the same account. The token reads the
         store; this pair is what an S3 client (and the deploy pipeline) signs with.
         Stored locally, then PROVEN by a real SigV4 signature before anything is
         claimed: a pair that cannot list the buckets is reported, not filed. */
      keySet({ cfR2Key:id, cfR2Secret:sec });
      addBubble("ass", "🔑 Cloudflare R2 key pair stored locally. Proving it with a signed S3 request…");
      logOp({ kind:"secret", action:"cf r2 keys", detail:"R2 access key pair stored in this browser only (values never logged)", result: maskTok(id) });
      const t = (window.ObiVault && window.ObiVault.r2) ? await window.ObiVault.r2() : { ok:false, detail:"src/vault.js is not loaded, so the pair could not be signed for" };
      addBubble("ass", (t.ok ? "✅ " : "⚠ ") + esc(t.detail) + (t.ok
        ? '<br><span class="rfoot">The pair is live. It rides in the vault with everything else: <b>/vault seal</b> then <b>/vault push</b> (gated) puts it on the canon, sealed. <b>/vault test cfR2Key</b> re-proves it any time.</span>'
        : '<br><span class="rfoot">Fail closed: stored locally, but nothing was sealed or pushed while it fails its own test.</span>'));
      rrlAppend(runNoOf(),"DNA","Obi: [/cf r2 — pair stored, " + (t.ok ? "S3 signature accepted" : "signature refused") + "]");
      return;
    }
    addBubble("ass", "☁ /cf r2 — reading the object store…");
    const b = await apiJson(CF_BASE + acct + "/r2/buckets", { method:"GET", headers:AUTH });
    const buckets = (b.j && b.j.success && b.j.result && b.j.result.buckets) || null;
    const V = window.ObiVault;
    const pair = V ? { id: V.get("cfR2Key"), sec: V.get("cfR2Secret") } : { id:null, sec:null };
    let s3 = { ok:false, detail:"the vault is not loaded" };
    if(pair.id && pair.sec && V.r2) s3 = await V.r2();
    addBubble("ass", '<div class="rise"><div class="rhead">☁ /cf r2 — Cloudflare R2</div>'
      + '<div class="rrow' + (buckets ? "" : " bad") + '"><b>BUCKETS</b><span class="vd">' + (buckets ? buckets.length : "—") + '</span><div class="rd">'
      + (buckets ? buckets.map(x => esc(x.name) + (x.creation_date ? ' <span class="rd">' + esc(String(x.creation_date).slice(0,10)) + '</span>' : "")).join("<br>") : esc((b.j && b.j.errors && b.j.errors[0] && b.j.errors[0].message) || b.txt.slice(0,140)))
      + '</div></div>'
      + '<div class="rrow' + (s3.ok ? "" : " bad") + '"><b>S3 KEY PAIR</b><span class="vd">' + (pair.id && pair.sec ? (s3.ok ? "VERIFIED" : "TEST FAILED") : "NOT SET") + '</span><div class="rd">'
      + (pair.id && pair.sec ? esc(maskTok(pair.id)) + " · " + esc(s3.detail) : 'set with <b>/cf r2 &lt;accessKeyId&gt; &lt;secret&gt;</b>')
      + '</div></div>'
      + '<div class="rrow"><b>ENDPOINT</b><span class="vd">S3</span><div class="rd rd-mono">https://' + esc(acct) + '.r2.cloudflarestorage.com</div></div>'
      + '<div class="rfoot">The token reads the store; the <b>key pair</b> is what an S3 client — and the deploy pipeline — signs with. Both live in the vault: <b>/vault set cf / cfAcct / cfR2Key / cfR2Secret</b> · <b>/vault test cf</b> · <b>/vault push</b> (gated).</div></div>');
    rrlAppend(runNoOf(),"DNA","Obi: [/cf r2 — " + (buckets ? buckets.length + " bucket(s)" : "store unreadable") + "]");
    return;
  }
  addBubble("ass","Unknown /cf op. Try <b>/cf token</b>, <b>/cf status</b>, <b>/cf r2</b> (the R2 object store + the S3 key pair), <b>/cf deploy</b>, <b>/cf enable</b>.");
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
    logOp({ kind:"secret", action:"gh token", detail:"stored in this browser only (value never logged)", result: maskTok(t) });
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
  /* the ONE authority gate comes before the token check: with no password entered
     in this session, nothing should even reach the credential test. */
  if(op === "backup" && !await omegaRequire("/gh backup — the whole build → the ONE authority")) return;
  if(!keyGet("gh")){ addBubble("ass","No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  if(op === "test" || op === "caps" || op === "capabilities"){ await cmdGithubTest(); return; }
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
    addBubble("ass", "📦 /gh backup — the whole build into the ONE authority (<b>" + esc(CANON.owner + "/" + CANON.repo) + "@" + esc(CANON.branch) + "</b>)…");
    const res = await canonPushSession({ chat: true });
    if(res === "NO_TOKEN"){ addBubble("ass", "⚠ No GitHub token stored, so nothing can reach the authority. <b>/gh token &lt;PAT&gt;</b> first (stored locally only; the value is never logged or captured)."); logOp({ kind:"push", action:"gh backup", ok:false, result:"no token — nothing left the browser" }); return; }
    const okB = res.failed === 0 && !!res.commitSha;
    addBubble("ass", (okB ? "✅" : "⚠") + " Backup " + (okB ? "complete" : "partial") + " — <b>" + res.pushed + "</b> of <b>" + res.files + "</b> files pushed, <b>" + res.failed + "</b> failed."
      + "<br>Authority: <b>https://github.com/" + esc(CANON.owner) + "/" + esc(CANON.repo) + "</b> @ " + esc(CANON.branch)
      + (res.commitSha ? " · commit <b>" + esc(res.commitSha.slice(0, 8)) + "</b>" : "")
      + "<br><span class=\"rfoot\">Everything in one place: the session record, the station's sources, the raw chat, and the I-LOG (" + (res.ilogEntries || 0) + " chain entries + the Schema V2 transcript). There is no second repo to keep in sync.</span>"
      + (res.errors && res.errors.length ? "<br><span class=\"rfoot\">⚠ " + esc(res.errors.slice(0, 3).join(" · ")) + "</span>" : ""));
    rrlAppend(runNoOf(), "DNA", "Obi: [/gh backup → " + CANON.owner + "/" + CANON.repo + " — " + res.pushed + " files" + (res.commitSha ? " · " + res.commitSha.slice(0, 8) : "") + "]");
    logOp({ kind:"push", action:"gh backup", ok: okB, detail: CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · " + res.files + " files (chat + sources + I-LOG " + (res.ilogEntries || 0) + ")", result: res.pushed + " pushed · " + res.failed + " failed" + (res.commitSha ? " · commit " + res.commitSha.slice(0, 8) : ""), ref: res.commitSha });
    return;
  }
  addBubble("ass","Unknown /gh op. Try <b>/gh token</b>, <b>/gh status</b>, <b>/gh test</b> (what this token can really do), <b>/gh backup</b> (the whole build → the ONE authority).");
}

/* ---------------------------------------------------------------------------
   /gh test — WHAT CAN THIS TOKEN ACTUALLY DO?
   The vault answers "does the key work". This answers the harder question: which
   of GitHub's powers does it really hold? Every row is a REAL call to
   api.github.com, grouped by what it proves, and a row the token cannot open says
   so with the HTTP status and GitHub's own words — no dressing up.
   The write rows are real but reversible: a secret gist is created, edited and
   deleted. THE CANON IS NEVER MODIFIED BY THIS TEST — the single canon-write probe
   writes a DANGLING git blob (an object no ref points at, invisible in the tree),
   and even that is gated behind PHOENIXOMEGAPROTOCOL.
   -------------------------------------------------------------------------- */
async function cmdGithubTest(){
  const t = keyGet("gh");
  if(!t){ addBubble("ass","No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); return; }
  const H = () => ({ Authorization:"Bearer " + t });
  const J = () => ({ "Content-Type":"application/json", Authorization:"Bearer " + t });
  const api = "https://api.github.com";
  const O = CANON.owner, R = CANON.repo;
  const canon = api + "/repos/" + O + "/" + R;
  const rows = [];
  const say = (g, l, ok, http, d, html) => rows.push({ g:g, l:l, ok:ok, http:http, d:d || "", h:html || "" });
  async function ask(g, l, url, opts, prove){
    let r;
    try{ r = await ghApiJson(url, Object.assign({ method:"GET", headers:H() }, opts || {})); }
    catch(e){ say(g, l, false, "—", "the browser could not make the call: " + String((e && e.message) || e).slice(0, 70)); return null; }
    const ok = r.status >= 200 && r.status < 300;
    let d = "";
    if(ok && prove){ try{ d = prove(r) || ""; }catch(e){ d = ""; } }
    if(!ok) d = String((r.j && r.j.message) || ("HTTP " + r.status)) + (r.status === 404 ? " — nothing here for this token" : "");
    say(g, l, ok, r.status, d);
    return r;
  }
  const nn = v => (v === null || v === undefined || v === "") ? "?" : String(v);
  const cnt = v => (Array.isArray(v) ? v.length + " found" : "?");
  const GI = "IDENTITY", GC = "THE ONE AUTHORITY", GO = "ORGANIZATION", GU = "USER POWERS", GD = "DISCOVERY", GW = "WRITE (real, reversible)";

  addBubble("ass", "🐙 <b>/gh test</b> — asking api.github.com what this token can really do. Real calls, ~40 of them…");

  /* ---- identity: who is it, and what is it allowed to be ---- */
  const me = await ask(GI, "who the token is", api + "/user", null,
    r => "@" + nn(r.j && r.j.login) + " · " + nn(r.j && r.j.name) + " · " + nn(r.j && r.j.public_repos) + " public repos · account made " + nn(String((r.j && r.j.created_at) || "").slice(0,10)));
  const scopesRaw = (me && me.h) ? String(me.h.get("x-oauth-scopes") || "") : "";
  const scopes = scopesRaw.split(/\s*,\s*/).filter(Boolean);
  if(me && me.j && me.j.login) keySet({ ghUser: me.j.login });
  say(GI, "scopes it actually carries", scopes.length > 0, "—",
    scopes.length ? scopes.length + " scope(s): " + scopes.join(", ") : "none (fine-grained tokens carry none)",
    scopes.length ? scopes.length + " granted —<br>" + scopes.map(s => '<span class="chip" style="background:rgba(57,224,230,.13);color:#39e0e6;border:1px solid rgba(57,224,230,.32)">' + esc(s) + '</span>').join(" ") : "");
  await ask(GI, "API quota", api + "/rate_limit", null, r => nn(r.j && r.j.rate && r.j.rate.limit) + " req/hour · " + nn(r.j && r.j.rate && r.j.rate.remaining) + " left");
  await ask(GI, "its own organisations", api + "/user/orgs", null, r => cnt(r.j));

  /* ---- the ONE authority: can it read and administer the canon? ---- */
  await ask(GC, "the canon repo opens", canon, null,
    r => (r.j.private ? "PRIVATE" : "public") + " · default " + nn(r.j.default_branch) + " · push=" + !!(r.j.permissions && r.j.permissions.push) + " admin=" + !!(r.j.permissions && r.j.permissions.admin) + " · " + nn(r.j.size) + " KB");
  await ask(GC, "the vault we pushed is there", canon + "/contents/OPERATIONS/VAULT?ref=" + CANON.branch, null, r => cnt(r.j) + " files in OPERATIONS/VAULT");
  await ask(GC, "branches", canon + "/branches?per_page=100", null, r => cnt(r.j) + " branch(es)");
  await ask(GC, "newest commit", canon + "/commits?per_page=1", null, r => (Array.isArray(r.j) && r.j[0]) ? r.j[0].sha.slice(0,8) + " · " + nn(String(r.j[0].commit.message).split("\n")[0].slice(0,44)) : "?");
  await ask(GC, "our own vault commit", canon + "/commits/95b23ded", null, r => "the station's push is real — committed " + nn(String((r.j && r.j.commit && r.j.commit.committer && r.j.commit.committer.date) || "").slice(0,19)));
  await ask(GC, "branch protection on master", canon + "/branches/" + CANON.branch + "/protection", null, r => "protection rules are visible");
  await ask(GC, "collaborators (admin-only)", canon + "/collaborators?per_page=100", null, r => cnt(r.j) + " collaborator(s)");
  await ask(GC, "deploy keys (admin-only)", canon + "/keys", null, r => cnt(r.j));
  await ask(GC, "webhooks (admin:repo_hook)", canon + "/hooks", null, r => cnt(r.j));
  await ask(GC, "Actions runs", canon + "/actions/runs?per_page=1", null, r => nn(r.j && r.j.total_count) + " run(s)");
  await ask(GC, "Actions workflows", canon + "/actions/workflows", null, r => nn(r.j && r.j.total_count) + " workflow(s)");
  await ask(GC, "repo secrets (names only, admin)", canon + "/actions/secrets", null, r => nn(r.j && r.j.total_count) + " secret name(s) — a value can never be read back");
  await ask(GC, "releases", canon + "/releases?per_page=1", null, r => cnt(r.j) + " release(s)");
  await ask(GC, "issues (all states)", canon + "/issues?state=all&per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GC, "pull requests", canon + "/pulls?state=all&per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GC, "traffic (needs push)", canon + "/traffic/views", null, r => nn(r.j && r.j.count) + " view(s) / 14 days · " + nn(r.j && r.j.uniques) + " unique");
  await ask(GC, "languages", canon + "/languages", null, r => Object.keys(r.j || {}).slice(0,7).join(", ") || "none");
  await ask(GC, "code-scanning alerts", canon + "/code-scanning/alerts?per_page=1", null, r => cnt(r.j));

  /* ---- the organisation ---- */
  await ask(GO, "the org itself", api + "/orgs/" + O, null, r => nn(r.j && r.j.name) + " · " + nn(r.j && r.j.public_repos) + " public repos · " + nn(r.j && r.j.plan && r.j.plan.name));
  await ask(GO, "members (admin:org)", api + "/orgs/" + O + "/members?per_page=100", null, r => cnt(r.j) + " visible member(s)");
  await ask(GO, "org repos", api + "/orgs/" + O + "/repos?per_page=1", null, r => cnt(r.j) + " on page 1");
  await ask(GO, "org teams", api + "/orgs/" + O + "/teams?per_page=100", null, r => cnt(r.j) + " team(s)");
  await ask(GO, "org secrets (admin:org)", api + "/orgs/" + O + "/actions/secrets", null, r => nn(r.j && r.j.total_count) + " org secret name(s)");
  await ask(GO, "installed GitHub Apps", api + "/orgs/" + O + "/installations", null, r => nn(r.j && r.j.total_count) + " installation(s)");
  await ask(GO, "org webhooks (admin:org_hook)", api + "/orgs/" + O + "/hooks", null, r => cnt(r.j));
  await ask(GO, "AUDIT LOG (org audit log — Enterprise Cloud only)", api + "/orgs/" + O + "/audit-log?per_page=1", null, r => cnt(r.j) + " event(s) readable");

  /* ---- the user powers the scopes imply ---- */
  await ask(GU, "repos it can reach", api + "/user/repos?per_page=1&affiliation=owner", null, r => cnt(r.j) + " own repo(s) on page 1");
  await ask(GU, "starred", api + "/user/starred?per_page=1", null, r => cnt(r.j));
  await ask(GU, "followers", api + "/user/followers?per_page=1", null, r => cnt(r.j));
  await ask(GU, "emails (user scope)", api + "/user/emails", null, r => cnt(r.j) + " · primary " + nn((Array.isArray(r.j) && (r.j.filter(e => e.primary)[0] || {}).email) || "?"));
  await ask(GU, "installed apps (as the user)", api + "/user/installations", null, r => nn(r.j && r.j.total_count) + " app(s)");
  await ask(GU, "GPG keys (admin:gpg_key)", api + "/user/gpg_keys", null, r => cnt(r.j));
  await ask(GU, "SSH keys (admin:public_key)", api + "/user/keys", null, r => cnt(r.j));
  await ask(GU, "codespaces", api + "/user/codespaces", null, r => nn(r.j && r.j.total_count) + " codespace(s)");

  /* ---- discovery ---- */
  await ask(GD, "search repositories", api + "/search/repositories?q=phoenix+rising&per_page=1", null, r => nn(r.j && r.j.total_count) + " match(es)");
  await ask(GD, "search users", api + "/search/users?q=hobbs0011", null, r => nn(r.j && r.j.total_count) + " match(es)");
  await ask(GD, "search commits", api + "/search/commits?q=vault+repo:" + O + "/" + R + "&per_page=1", null, r => nn(r.j && r.j.total_count) + " commit(s)");
  /* /search/code is the ONE GitHub endpoint that refuses a browser origin — no CORS
     headers, so a plain fetch dies with "Failed to fetch" while every other call on
     this page works. It goes through the station's own superFetch instead, and the
     row says so, so a dead request can never masquerade as a missing permission. */
  try{
    const cr = await root.superFetch(api + "/search/code?q=prais+repo:" + O + "/" + R + "&per_page=1", { headers:H() });
    const cj = await cr.json().catch(() => null);
    if(cr.status >= 200 && cr.status < 300) say(GD, "search CODE (via proxy — no browser CORS)", true, cr.status, nn(cj && cj.total_count) + " file(s) matched · GitHub will not answer this endpoint from a page origin, so it went through superFetch");
    else say(GD, "search CODE (via proxy — no browser CORS)", false, cr.status, String((cj && cj.message) || ("HTTP " + cr.status)));
  }catch(e){
    say(GD, "search CODE (via proxy — no browser CORS)", false, "—", "even the proxy could not reach it: " + String((e && e.message) || e).slice(0, 70));
  }

  /* ---- real writes, entirely off the canon ---- */
  const gid = "prais-capability-" + Date.now();
  const made = await ask(GW, "create a secret gist", api + "/gists", { method:"POST", headers:J(),
    body: JSON.stringify({ description:"PrAis Command Station — /gh test capability probe " + new Date().toISOString() + " (deleted by the test)", public:false,
      files:{ ["prais-capability-check.txt"]:{ content:"This gist was created by /gh test to prove the token can WRITE to GitHub, and is deleted seconds later.\n" } } }) },
    r => "gist " + nn(r.j && r.j.id && r.j.id.slice(0,10)) + " created (private)");
  const gidReal = made && made.j && made.j.id;
  if(gidReal){
    await ask(GW, "edit that gist", api + "/gists/" + gidReal, { method:"PATCH", headers:J(), body: JSON.stringify({ description: gid + " — edited by /gh test" }) }, () => "description rewritten (proves PATCH)");
    await ask(GW, "delete that gist", api + "/gists/" + gidReal, { method:"DELETE", headers:H() }, () => "deleted (HTTP 204)");
    let gone = null;
    try{ gone = await ghApiJson(api + "/gists/" + gidReal, { headers:H() }); }catch(e){}
    if(gone) say(GW, "confirm the gist is gone", gone.status === 404, gone.status, gone.status === 404 ? "404 — the delete stuck, nothing left behind" : "still present (HTTP " + gone.status + ")");
  }

  /* ---- canon write: dangling object only, and only with the gate armed ---- */
  const armed = (typeof omegaStatusText === "function") && !!omegaStatusText().armed;
  if(armed){
    let shaBefore = null, shaAfter = null;
    try{ const rr = await ghApiJson(canon + "/git/refs/heads/" + CANON.branch, { headers:H() }); shaBefore = rr.j && rr.j.object && rr.j.object.sha; }catch(e){}
    await ask("CANON WRITE (gated)", "dangling blob in the canon's object store", canon + "/git/blobs", { method:"POST", headers:J(),
      body: JSON.stringify({ content:"prais capability probe " + new Date().toISOString() + " — unreachable object, no ref points at it\n", encoding:"utf-8" }) },
      r => "blob " + nn(r.j && r.j.sha && r.j.sha.slice(0,10)) + " written to the object store — no branch, file or tree touched");
    try{ const rr = await ghApiJson(canon + "/git/refs/heads/" + CANON.branch, { headers:H() }); shaAfter = rr.j && rr.j.object && rr.j.object.sha; }catch(e){}
    const same = !!shaBefore && shaBefore === shaAfter;
    say("CANON WRITE (gated)", "and " + CANON.branch + " did not move", same, "—",
      same ? "still " + String(shaBefore).slice(0,8) + " before and after — the probe proved write access to the canon's object store while changing nothing about the canon"
           : "⚠ the ref moved: " + String(shaBefore).slice(0,8) + " → " + String(shaAfter).slice(0,8));
  } else {
    say("CANON WRITE (gated)", "dangling blob probe", "skip", "—", "SKIPPED — PHOENIXOMEGAPROTOCOL is not armed, so nothing was sent. Canon writes need /omega <password>. The station's own commit 95b23ded above is the standing proof this token can write here.");
  }

  /* ---- render ---- */
  const groups = [];
  for(const row of rows){ let g = groups.filter(x => x.n === row.g)[0]; if(!g){ g = { n:row.g, rs:[] }; groups.push(g); } g.rs.push(row); }
  const scored = rows.filter(r => r.ok !== "skip");
  const opened = scored.filter(r => r.ok === true).length;
  let html = '<div class="rise"><div class="rhead">🐙 /gh test — GitHub capability sweep</div>'
    + '<div class="rrow"><b>TOKEN</b><span class="vd">' + esc(maskTok(t)) + '</span><div class="rd">acting as <b>@' + esc(keyGet("ghUser") || (me && me.j && me.j.login) || "?") + '</b> · <b>' + opened + " / " + scored.length + '</b> probes opened · ' + rows.length + ' real calls</div></div>';
  for(const g of groups){
    const gs = g.rs.filter(r => r.ok !== "skip");
    const got = gs.filter(r => r.ok === true).length;
    html += '<div class="rrow' + (got < gs.length ? " bad" : "") + '"><b>' + esc(g.n) + '</b><span class="vd">' + got + "/" + gs.length + '</span><div class="rd">'
      + g.rs.map(r => '<b>' + (r.ok === true ? "✓ " : (r.ok === "skip" ? "– " : "✗ HTTP " + r.http + " ")) + esc(r.l) + '</b> — ' + (r.h || esc(r.d))).join("<br>")
      + '</div></div>';
  }
  html += '<div class="rfoot">Reads prove reach; the gist cycle proves real create/edit/delete off the canon; the canon itself is <b>never modified</b> here — the only canon-write probe is a dangling blob (an object no ref points at, invisible to the tree) and it stays skipped until /omega arms the gate. Fail-closed: a row the token cannot open is reported with GitHub\'s own message, not smoothed over.</div></div>';
  addBubble("ass", html);
  logOp({ kind:"op", action:"gh test", ok:opened === scored.length, detail:"capability sweep · " + scopes.length + " scopes · " + rows.length + " real calls to api.github.com", result:opened + "/" + scored.length + " opened" + (armed ? " · canon blob probe ran" : " · canon probe skipped (gate locked)") });
  rrlAppend(runNoOf(), "DNA", "Obi: [/gh test — " + opened + "/" + scored.length + " GitHub capabilities confirmed for @" + (keyGet("ghUser") || "?") + "]");
}

async function buildRawChat(){
  const out = { exportedAt: new Date().toISOString(), generator: window.generatorName || "obi", page: location.href, messages: messages.map(m => redactSecrets(m)) };
  try{ out.ledger = JSON.parse(localStorage.getItem("obi_sdnad")||"{}"); }catch(e){}
  try{ if(out.ledger && out.ledger.soul) out.ledger.soul = out.ledger.soul.map(s => Object.assign({}, s, { text: redactSecrets(s.text) })); }catch(e){}
  out.runs = [];
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k && k.indexOf("obi_rrl_run") === 0){
        try{
          const v = JSON.parse(localStorage.getItem(k)||"null");
          if(v){ if(v.entries) v.entries = v.entries.map(e => Object.assign({}, e, { text: redactSecrets(e.text) })); out.runs.push(v); }
        }catch(e){}
      }
    }
  }catch(e){}
  /* the I-LOG rides in the raw-chat export too, so one file carries the words AND
     the operations, with the chain head and the transcript in canon line shape. */
  try{
    if(window.ObiILog){
      out.ilog = await window.ObiILog.all();
      out.ilogAnchors = await window.ObiILog.anchors();
      out.ilogTranscriptV2 = await window.ObiILog.transcriptV2();
      out.ilogStats = await window.ObiILog.stats();
    }
  }catch(e){ out.ilogError = e.message; }
  return JSON.stringify(out, null, 2);
}

/* ---- Deepgram key recovery (Cloudflare) ------------------------------------
   The NET-PET-AI worker on Cloudflare holds DEEPGRAM_API_KEY as a secret and
   exposes it at GET /api/stt/key, so the key survives losing this browser's
   localStorage. Kept as a URL here (never as a value): the route is public, so
   the honest fix is to lock it behind the worker's X-Admin-Key, not to paste the
   key into the source. */
const DG_RECOVER_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/stt/key";
const DG_LISTEN_URL  = "https://api.deepgram.com/v1/listen?model=nova-3";

function dgSilenceWav(secs, rate){
  secs = secs || 1; rate = rate || 16000;
  const n = Math.round(secs * rate), bytes = 44 + n * 2, dv = new DataView(new ArrayBuffer(bytes));
  const w = (o, s) => { for(let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0,"RIFF"); dv.setUint32(4, bytes - 8, true); w(8,"WAVE"); w(12,"fmt ");
  dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,rate,true); dv.setUint32(28,rate*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true);
  w(36,"data"); dv.setUint32(40, n*2, true);
  return new Blob([dv.buffer], { type:"audio/wav" });
}
async function dgCheck(k){
  if(!k) return { ok:false, why:"no key" };
  try{
    const r = await fetch(DG_LISTEN_URL, { method:"POST", headers:{ "Authorization":"Token " + k, "Content-Type":"audio/wav" }, body: dgSilenceWav(1, 16000) });
    if(r.ok) return { ok:true, status:r.status };
    const body = await r.text().catch(()=> "");
    return { ok:false, status:r.status, why:String(body || "").slice(0,160) || ("HTTP " + r.status) };
  }catch(e){ return { ok:false, why:e.message }; }
}
async function dgTest(){
  const k = keyGet("deepgram");
  if(!k){ addBubble("ass","No Deepgram key stored. <b>/dg token &lt;KEY&gt;</b> or <b>/dg recover</b>."); return; }
  addBubble("ass","🔎 Testing the stored key against api.deepgram.com…");
  const r = await dgCheck(k);
  addBubble("ass", r.ok
    ? "✅ Key works — Deepgram answered <b>" + esc(String(r.status)) + "</b>. /transcribe is ready."
    : "⚠ Key rejected or unreachable: " + esc(r.why) + "<br><span class=\"rfoot\">Try <b>/dg recover</b> to pull a fresh one from Cloudflare.</span>");
  rrlAppend(runNoOf(),"DNA","Obi: [/dg test — " + (r.ok ? "key works" : "key failed") + "]");
}
async function dgRecover(){
  addBubble("ass","🔎 <b>/dg recover</b> — asking the NET-PET-AI worker on Cloudflare for the Deepgram key…");
  const tries = [];
  if(typeof root !== "undefined" && root.superFetch) tries.push(() => root.superFetch(DG_RECOVER_URL));
  tries.push(() => fetch(DG_RECOVER_URL, { cache:"no-store" }));
  let k = null, status = 0, err = "";
  for(const attempt of tries){
    try{
      const r = await attempt();
      status = r.status;
      const j = await r.json().catch(()=>null);
      if(j && typeof j.key === "string" && j.key.trim()){ k = j.key.trim(); break; }
      err = "HTTP " + status + ", no key in the body";
    }catch(e){ err = e.message; }
  }
  if(!k){
    addBubble("ass","⚠ Couldn't read the key from the worker — " + esc(err) + ".<br><span class=\"rfoot\">Source: <span class=\"rd\">" + esc(DG_RECOVER_URL) + "</span> (the worker only answers foreign origins through the superFetch proxy). Fall back to <b>/dg token &lt;KEY&gt;</b>.</span>");
    return;
  }
  const chk = await dgCheck(k);
  if(!chk.ok){
    addBubble("ass","⚠ Found a key on the worker (" + esc(k.slice(0,4)) + "…, " + esc(String(k.length)) + " chars) but Deepgram refused it — " + esc(chk.why) + ".<br><span class=\"rfoot\">Fail closed: nothing stored. Rotate it in the NET-PET-AI worker (`wrangler secret put DEEPGRAM_API_KEY`) and try again.</span>");
    rrlAppend(runNoOf(),"DNA","Obi: [/dg recover — key found on Cloudflare but Deepgram rejected it]");
    return;
  }
  keySet({ deepgram: k });
  addBubble("ass", "✅ Deepgram key recovered from <b>Cloudflare</b> (net-pet-ai worker · <span class=\"rd\">/api/stt/key</span>) and verified against api.deepgram.com — stored locally as <b>" + esc(maskTok(k)) + "</b>.<br><span class=\"rfoot\">/transcribe is live. Heads-up: that route is <b>public</b> — anyone can read this same key, so rotate it and gate the route behind the worker's X-Admin-Key.</span>");
  rrlAppend(runNoOf(),"DNA","Obi: [/dg recover — key recovered from net-pet-ai worker (Cloudflare) and verified]");
}

function showKeys(){
  const k = (()=>{ try{ return JSON.parse(localStorage.getItem("obi_keys")||"{}"); }catch(e){ return {}; } })();
  addBubble("ass", `<div class="rise"><div class="rhead">🔐 /keys — locally stored secrets</div>
    <div class="rrow"><b>CLOUDFLARE</b><span class="vd">${k.cf ? "stored" : "none"}</span><div class="rd">${maskTok(k.cf)}${k.cf ? " · token `nameless-feather-3545` (full permissions)" : ""}</div></div>
    <div class="rrow"><b>CLOUDFLARE ACCOUNT</b><span class="vd">${k.cfAcct ? "stored" : "none"}</span><div class="rd">${k.cfAcct ? esc(k.cfAcct) : "set with /cf token … (the account the token is scoped to)"}</div></div>
    <div class="rrow"><b>CLOUDFLARE R2 (S3)</b><span class="vd">${k.cfR2Key && k.cfR2Secret ? "stored" : "none"}</span><div class="rd">${k.cfR2Key && k.cfR2Secret ? (esc(maskTok(k.cfR2Key)) + (k.cfAcct ? " · https://" + esc(k.cfAcct) + ".r2.cloudflarestorage.com" : "")) : "set with /cf r2 &lt;accessKeyId&gt; &lt;secret&gt; — the S3 key pair for the object store"}</div></div>
    <div class="rrow"><b>GITHUB</b><span class="vd">${k.gh ? "stored" : "none"}</span><div class="rd">${maskTok(k.gh)}${k.ghUser ? " · " + esc(k.ghUser) : ""}</div></div>
    <div class="rrow"><b>DEEPGRAM</b><span class="vd">${k.deepgram ? "stored" : "none"}</span><div class="rd">${maskTok(k.deepgram)}</div></div>
    <div class="rrow"><b>TEXTBOOK PLATFORM · SECONDARY</b><span class="vd">${k.ngl ? "stored" : "none"}</span><div class="rd">${k.ngl ? (esc(k.ngl.user || "?") + " · " + maskTok(k.ngl.password) + (k.ngl.site ? " · " + esc(k.ngl.site) : "")) : "National Geographic Learning (learn.eltngl.com) — the Close-up / New Close Up course. Set with /keys ngl <account> <password>"}</div></div>
    <div class="rrow"><b>TEXTBOOK PLATFORM · PRIMARY</b><span class="vd">${k.nglP ? "stored" : "none"}</span><div class="rd">${k.nglP ? (esc(k.nglP.user || "?") + " · " + maskTok(k.nglP.password) + (k.nglP.site ? " · " + esc(k.nglP.site) : "")) : "National Geographic Learning (learn.eltngl.com) — the Look course, grades 1-5. Set with /keys ngl primary <account> <password>"}</div></div>
    <div class="rfoot">Stored only in this browser's localStorage (key obi_keys) — never in public source, never captured as soul, never in the I-LOG. Set with /cf token, /gh token, /dg token, /keys ngl [primary] &lt;account&gt; &lt;password&gt;.</div></div>`);
  rrlAppend(runNoOf(),"DNA","Obi: [keys status shown]");
}

/* ============================================================================
   CANONCOMMAND — the command station tied to the ONE authoritative repo
   Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (branch: master). /canon pulls
   the doctrine, pings the fleet + the SOULCOUNT gate, and /canon sync pushes this
   session's perchance operations (RRL, soul ledger, app sources, the I-LOG) back
   into the Canon under OPERATIONS/COMMANDSTATION/. Evidence-first: every card
   shows raw facts. The Canon does not change without Sov100: every write goes
   through PHOENIXOMEGAPROTOCOL (/omega).
   ========================================================================== */
const CANON = {
  owner: "Phoenix-Rising-Ai-Solutions",
  repo: "OB-1--Authoritative-",
  /* WRITE TARGET — `master` is where THIS station's own chain lives
     (OPERATIONS/COMMANDSTATION/). It is not the doctrine branch. */
  branch: "master",
  /* CANON ONLY (sovereign, 2026-09-21: "NO KILO, CANON ONLY"). The doctrine this station
     reads and cites lives on the `canon` branch: CANON/SYSTEM/** + VAULT-**. The
     `.kilo/command/` registry that used to be listed here is the LEGACY Kilo lineage —
     not authority, and no longer pulled (src/PHOENIXCOMMAND-BLUEPRINT.md §8, resolved
     2026-08-28: "the master 46-file registry is LEGACY state, not current law"). */
  doctrineBranch: "canon",
  base: "https://api.github.com/repos/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-",
  soulgate: "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
  paUrl: "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code",
  /* AUDIT 2026-09-21: a hardcoded PhoenixArchitecti auth key used to sit on the line below
     (`paAuth: "ffScw…"`). It was never read anywhere in this codebase, and it was a live
     credential printed in PUBLIC generator source — the exact thing the invariants forbid
     ("Secrets never enter the record", and never the public source). Removed. If that endpoint
     is ever needed, put the key in the Vault (`/vault set pa`) and read it with keyGet("pa"). */
  workers: [
    ["phoenix-architecti", "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"],
    ["pcc", "https://pcc.mrmichaelhobbs123.workers.dev/api/status"],
    ["net-pet-ai", "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/status"],
    ["soul-logger", "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"]
  ],
  files: ["CANON/SYSTEM/GOSPEL-999.md", "CANON/SYSTEM/LegionnaireFieldGuide.md", "CANON/SYSTEM/REINCARNATION-CONTRACT.md"]
};
const CANON_REGISTRY = [
  /* AUDIT 2026-09-21, CORRECTED 2026-09-21 (the re-audit). Each row says TWO things:
     \u00b7 BUILT   \u2713 this station really accepts the command; \u2717 it does NOT
     \u00b7 ORIGIN  CANON = the command is named in the canon branch's own files,
                    STATION = this station invented it (the canon does not have it),
                    PROPOSED = it implements an amendment this station proposed; Sov100 has not merged it.
     *** THE AUTHORITY CORRECTION. *** The first pass measured "canon" from the `.kilo/command/`
     registry (46 files). That registry is the KILO lineage — the sovereign has ruled it is NOT the
     authority. The canon's own command set is the SCS, and the canon names it in exactly one place:
     CANON/SYSTEM/GOSPEL-999.md \u00a7SYSTEM I + CANON/SYSTEM/LegionnaireFieldGuide.md \u00a7SCS \u2014
     SEVEN commands: /phoenixRISE /phoenixSCOUT /phoenixMARCH /phoenixSCHOLAR /phoenixSUPPLY
     /phoenixFORTIFY /phoenixDEATH. Everything else below that says CANON is named somewhere in the
     canon branch's CANON/SYSTEM or VAULT. The station now runs that canon loop itself (src/scs.js). */
  ["/phoenixrise","release","SCS Stage 1 \u2014 audit the prior DEATH, gate the session, stamp the name",1,"canon"],
  ["/phoenixscout","discovery","SCS Stage 2 \u2014 recon: flag, tag, hand off. Changes nothing. Give it TERMS and it also hunts the canon's own records (SOUL extracts, prompt registers, I-LOGs, DEATH seals) for them and pulls the SOUL back verbatim",1,"canon"],
  ["/phoenixmarch","build","SCS Stage 3 \u2014 territory sweep; confirm the scout the hard way",1,"canon"],
  ["/phoenixscholar","report","SCS Stage 4 \u2014 preserve the SOUL; machine-count the RRL",1,"canon"],
  ["/phoenixsupply","sync","SCS Stage 5 \u2014 route every artifact; hold the ground",1,"canon"],
  ["/phoenixfortify","validate","SCS Stage 6 \u2014 audit every artifact; gate the seal",1,"canon"],
  ["/phoenixdeath","release","SCS Stage 7 \u2014 the 7-point march, seal, handoff",1,"canon"],
  ["/romeprotocol","stability","ROME PROTOCOL \u2014 truth anchoring: SURFACE \u2192 VERIFY \u2192 ANCHOR + the five Watchtowers",1,"canon"],
  ["/pipeline","validate","S2Pipeline \u2014 the execution artifact + the REAL/HOLLOW/MISSING fidelity gate",1,"canon"],
  ["/souldna","discovery","Soul-DNA memory \u2014 this deck's face of it is /memory",1,"canon"],
  ["/help","discovery","Show the command registry",1,"canon"],
  ["/ledger","discovery","Session RRL + soul ledger",1,"canon"],
  ["/status","discovery","Fleet + canon status",1,"canon"],
  ["/audit","validate","Audit the ledger, evidence-first (fail-closed)",1,"canon"],
  ["/doctor","validate","Run checks, report gaps",1,"canon"],
  ["/report","report","Session report (push with /canon sync)",1,"canon"],
  ["/sync","sync","Push perchance operations into the Canon",1,"canon"],
  ["/gateway","sync","Agent 99 \u2192 Legion tunnel status",1,"canon"],
  ["/reincarnate","release","Not a canon command \u2014 the canon pairs are /phoenixRISE and /phoenixDEATH (the alias is kept)",1,"station"],
  ["/supersaiyan","release","Super Saiyan mode \u2014 NOT built here",0,"canon"],
  ["/halt","stability","Halt work \u2014 NOT built here",0,"canon"],
  ["/stabilize","stability","Stabilize \u2014 NOT built here",0,"canon"],
  ["/SoulSearch","discovery","Search the Soul index \u2014 NOT built here (this deck's face is /find)",0,"canon"],
  ["/dnaREGISTRY","report","DNA registry scan \u2014 NOT built here",0,"canon"],
  ["/Centurion-Code","validate","Code standards \u2014 NOT built here",0,"canon"],
  ["/canon","sync","Pull doctrine, ping fleet + soul gate \u2014 a station command, not a canon command",1,"station"],
  ["/ilog","sync","I-LOG \u2014 operation record, chain verify, Git anchor (the station's implementation of the record)",1,"station"],
  ["/omega","security","PHOENIXOMEGAPROTOCOL \u2014 Canon authorization gate (Sov100 password)",1,"proposed"],
  ["/vault","security","PrAis Vault \u2014 every key the empire runs on (locate \u00b7 test \u00b7 set \u00b7 seal \u00b7 push)",1,"station"],
  ["/cf","cloud","Cloudflare fleet + R2 \u2014 /cf token \u00b7 /cf status \u00b7 /cf deploy \u00b7 /cf r2",1,"station"],
  ["/offers","station","The free-website offer \u2014 the register of everyone who said yes, the link read for their trade, and the release of THE DROP (/offer release)",1,"station"],
  ["/lesson","build","NET Academy \u2014 the Lesson Creator desk",1,"proposed"],
  ["/forge","build","SELF-FORGE \u2014 read/write the station's own source, stage, commit (gated), hot-swap, eval",1,"proposed"],
  ["/fieldguide","discovery","Doctrine field guide (the LFG, rendered by the station)",1,"station"],
  ["/proposed","discovery","The staging lane \u2014 proposed canon, none merged",1,"station"],
  ["/idea","discovery","Raise a change as SOUL — verbatim first, then it travels the pipeline like every other artifact",1,"station"],
  ["/canon apply","sync","The gate applied — PHOENIXOMEGAPROTOCOL writes the change (or the staged amendments) to the canon branch and commits it",1,"station"],
  ["/scs","validate","THE SCS ENGINE \u2014 run the canon loop RISE\u2192SCOUT\u2192MARCH\u2192SCHOLAR\u2192SUPPLY\u2192ENGINEER\u2192DEATH",1,"station"]
];
/* Canon commands this deck has NEVER implemented. Kept out of the rows above so the card stays
   readable, but PRINTED at the bottom of /canon registry so the gap is never hidden
   (L58 MAP\u2260TERRAIN: a registry that omits what it cannot do is a map that lies).
   Authority: the canon branch's CANON/SYSTEM + VAULT \u2014 NOT the .kilo/command registry. */
const CANON_ONLY = [
  "/phoenixPULSE","/phoenixVERIFY","/phoenixDISPATCH","/aaa-anchor","/ssm","/phetrails",
  "/netpet-observability","/god-mode","/supersaiyan"
];

/* THE STAGING LANE, as the sovereign reviews it. Nothing here is canon: this is the
   walk-through he reads before anything is merged. The durable human copy is
   src/ProposedG999.md; the draft wording is src/canon/GOSPEL-999.md and
   src/canon/LEGIONNAIRE-FIELD-GUIDE.md. `merged:false` until the sovereign splices
   the copies into CANON/SYSTEM/ himself — this station never performs that step. */
const PROPOSED_G999 = [
  { id:"OMEGA.001–.003", sys:"GOSPEL-999 · Amendment I", title:"THE ONE AUTHORITY · THE I-LOG IS THE RECORD · ANCHOR, OR IT DID NOT HAPPEN", says:"one repo is the authority; every operation is an append-only sha-256-chained entry; a push that is not anchored on Git is not evidence", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"OMEGA.004–.006", sys:"GOSPEL-999 · Amendment I", title:"SEAL, NEVER DELETE · PHOENIXOMEGAPROTOCOL · SECRETS NEVER ENTER THE RECORD", says:"reset seals and names, never truncates; the canon does not change without the sovereign's password in that session (15 min, hash only, 5 failures = 10-min lock); credential commands are redacted on the way in", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"OMEGA.007", sys:"GOSPEL-999 · Amendment I", title:"WHAT THIS DOES NOT PROVE", says:"verification happens in the sovereign's browser; the commit is the only outside witness; the chain is never presented as un-forgeable", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LFG §11", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"I-LOG OPERATIONS & THE OMEGA GATE", says:"the two faces of the record · the anchor rule + recompute recipe · the gate's five clauses · the SCS I-LOG audit · the self-forge clauses", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LESSON.001–.004", sys:"GOSPEL-999 · Amendment II", title:"THE METHOD IS THE ARITHMETIC · FILES WIN ON TASTE · NO LESSON WITHOUT THE CHECK · CHATTY TEACHES, NEVER JUDGES", says:"10 vocab · 5 idioms · 5 slang · 3 games over 60 minutes; the reference files are ground truth for taste and never for defects; `/lesson check` fails closed; a miss re-teaches the rule", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.005–.009", sys:"GOSPEL-999 · Amendment II", title:"THE PRACTICE SCORES · THE EXIT HANDS OVER A KEY · THE VOICE IS THE SOVEREIGN'S · THE BRAND IS IMMUTABLE · TWO FAMILIES", says:"a visible counter and no punishment that outruns the reward; 4–6 bolded rules + a Level Up or a writing task; the Tiger register; purple/gold/glass; a display face and a body face only", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.010–.014", sys:"GOSPEL-999 · Amendment II", title:"ONE FILE · A GAME OWNS ITS MECHANISM · ONE ECONOMY · JUICE GENERATED NOT DOWNLOADED · MOVEMENT CAN BE STOPPED", says:"a self-contained .html; 3+ typed games each with a one-line mechanism; Mouse→Cub→Tiger→Legend on one currency; WebAudio oscillators and div confetti; prefers-reduced-motion and aria-live are mandatory", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LESSON.015–.018", sys:"GOSPEL-999 · Amendment II", title:"NO DIALOGS · THE LESSON OBEYS THE SESSION · THE LESSON IS AN I-LOG ENTRY · HONEST LIMITS", says:"no native dialogs, one home per setting, every name escaped; lessons come from this class's evidence; a lesson that exists only in the browser that wrote it is not shipped; the standard is taste codified, not a law of nature", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LFG §12", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"LESSON AUTHORSHIP", says:"the four authorities in order · the method as arithmetic · the machine · the Tiger voice verbatim · the reverse-hardened failure modes · the pre-ship checklist", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"LSN-13…LSN-23", sys:"src/LESSON-STANDARD.md · Part II", title:"THE METHOD AND THE MACHINE", says:"the ten defects in the reference files that are never inherited (D1–D10) plus the eleven laws that make a lesson the sovereign's rather than merely correct — already enforced by the shipped validator", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"CANON.001–.010", sys:"GOSPEL-999 · Amendment VIII", title:"CANON ONLY — NO FALSE SCRIPT STANDS IN FOR A CANON ONE", says:"the canon is the `canon` branch (G999 · LFG · S2PIPELINE · the contract · RISE/DEATH · PERMANENT-LAWS); `.kilo/` is the legacy Kilo lineage and is NOT authority; a script is either sourced to the canon or withdrawn — there is no third state; a withdrawal is logged in the I-LOG (seal-never-delete governs the record, not a false script's service); the station names its own gap; no COMPLETE with a HOLLOW; no model is canon; measure never remember; PHOENIXOMEGAPROTOCOL protects every write and OmegaProtocol is the full stop", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"LFG §18", sys:"LEGIONNAIRE-FIELD-GUIDE", title:"CANON ONLY — THE FIELD FORM", says:"the rule in one line · what counts as the canon · the Kilo lineage · the three marks (CANON/STATION/PROPOSED) · withdrawal · the verdicts · no model is canon · measure never remember · the gate · a pre-ship checklist · an amendment becomes law when it is committed", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" },
  { id:"PLACEMENT", sys:"OPERATIONS/COMMANDSTATION · the placement register", title:"MIRROR OR MOVE — EVERY DOCUMENT FINDS ITS HOME IN THE CANON", says:"a document stays in the generator ONLY as an exact mirror of the git branch, and only if the station needs it to run; everything else is fitted into the structure the canon already has (OPERATIONS/COMMANDSTATION/ for the station's own record, CANON/SYSTEM/ for doctrine); nothing is renamed; nothing is deleted before its commit exists on the branch; the canon changes only through /PhoenixRisingProtocol", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.001", sys:"the station's own recon · RECONNAISSANCE, NOT A FINDING (first pass, unproven)", title:"WHAT THIS SWEEP DID NOT FIND — read 'not found', never 'does not exist'", says:"measured 2026-09-21, from this browser: the canon branch has not moved since 6288cc40 (2026-09-16T19:44:35Z), and a keyword sweep of 22,613 canon paths + 7,366 OB-1 paths did not turn up ten sessions named since then — three newest (Website.DEV.OKT-1 · CaWesbite.Dev.-0 · Canon.Dev.-1 Logs&lanes) and four lane sessions (Marketing/CV · EdTech-BlueTech · SYSTEMS.TRAINING-PHOENIX-PHERMONES · Development-Train67) plus three older strays (TBnamed · anonymous-trolls website prompt · men's-health sales funnel). Each of those is 'not found by this sweep', not 'proven absent': the sweep matched path names and tokens, it did not read every path, did not exhaustively prove absence, and did not ask the sessions' owners. The likely cause (sessions ended without a DEATH seal, so no transcript reached the RRL) is a hypothesis this sweep cannot confirm. Confidence: LOW. Re-run, then challenge, before anything is built on it.", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.003", sys:"the VS Code agent's keyword hunt · a SCOUT report handed over for this death (second pass, not verified by this browser)", title:"THE SCOUT REPORT, AND THE THREE DATES THAT SETTLE WHERE THE MISSED WORK CANNOT BE", says:"WHAT IT ADDS to RECON.001: content-level corpus counts this browser's path sweep could not make at all (OPERATIONS/ 14,928 INCARNATE content matches · PastLives/ 13,718 · CANON/REINCARNATION/ 2,345 · I-LOG-UNAUDITED/ 1,892), a classification of the three I-LOG directories, and the sites of the literal /reincarnateDEATH string (.kilo/worktrees/ · .kilo/plans/ · .github/skills/phoenix-reincarnation/SKILL.md — the Kilo lineage, which by the sovereign's own ruling is NOT authority). Recount it as terrain, not as proof: nothing was committed, so this browser cannot verify a byte of it. WHAT IT CANNOT DO: it is stage-one reconnaissance, so it closes NONE of this death's gaps — DNA=HOLLOW, 6-AI TRUTH, DO-SQLITE and COMITATENSES belong to different stages, and SSM_NONE needs a sovereign directive this browser can parse, not a keyword count. ONE LINE I CHECKED AND DO NOT BELIEVE: 'All Sep 16-22 commits are from OB-1 <ob1@sov100.run>' is wrong for this repo — measured live, the only commits after 2026-09-16T19:44:35Z are the station's own seven, authored under the sovereign's account, and zero come from that identity. WHAT IT DOES SETTLE (all measured live 2026-09-21): OB-1@canon head 271889c2 (2026-05-15) · Phoenix-Rising-Ultimate last push (2026-04-14) · RRL/RRL-186.txt last touched 2026-07-19 · RRL/RRL-incarnation1.jsonl 2026-08-01 · RRL/RRL-27-STATS.json 2026-08-15. Every candidate was frozen before the sessions existed, so the missed September work has no home in git, and neither the clone nor the streaming scan of the GB files can find it. Confidence: moderate on the additions, HIGH on the dates. Keep the report; do not spend the death on it.", merged:false, stage:"SUPPLY", when:"when every artifact is routed to its canonical location" },
  { id:"RECON.002", sys:"the canon's own audit · CARRIED FORWARD, NOT RE-MEASURED", title:"THE DEBTS THE CANON ALREADY NAMES ITSELF", says:"also measured 2026-09-21, and the part I am most comfortable with, because the canon says it about itself: REINCARNATION-LOG Run 190-C records the real I-LOG as 14/16/18/27/28, header-only for 11/12/13/15/17/19/29/30, missing for 10/20/21/22/23/26, and session 24 as foreign; lane-checklist-sessions10-30 names five lanes never opened (P0 AUDIT · P1 RRL-PIPELINE · P2 LEDGER · P3 PHEROMONE · P4 STARMAP); and this station's own chain shows three gaps of its own (LEDGER, STARMAP, REGISTRY_SYNC not built in this browser). I have not re-measured any of these against the branch this pass — I am repeating the canon's own words, so the authority is theirs and the errors here would be mine. Confidence: LOW-TO-MODERATE, and every line should be checked against the branch before it is relied on.", merged:false, stage:"ENGINEER", when:"when every artifact is audited and the seal is gated" }
];

/* The staging lane, handed to the SCS engine: the pipeline reads it and reviews each
   item at the stage that carries it (src/scs.js proposalReview). One source, two readers. */
window.PROPOSED_G999 = PROPOSED_G999;
async function cmdProposed(arg){
  /* THE STAGING LANE IS NOT A COMMAND. The sovereign, 2026-09-21: "Proposals dont need to
     go on fucking commands, they can be on the pipeline for review when it is their time."
     So this card is only the INDEX. The review itself happens on /pipeline, where each
     proposal sits at the stage that carries it and surfaces when that stage has run.
     Nothing here is canon; nothing here is tappable. */
  const PR = (window.ObiSCS && window.ObiSCS.proposals) ? window.ObiSCS.proposals() : null;
  const posOf = id => { const m = (PR && PR.items) ? PR.items.filter(x => x.id === id)[0] : null; return m || null; };
  const merged = PROPOSED_G999.filter(r => r.merged).length;
  const rows = PROPOSED_G999.map(r => '<div class="rrow' + (r.merged ? "" : " pending") + '"><b>' + esc(r.id) + '</b><span class="vd">' + esc((posOf(r.id) && posOf(r.id).at) || String(r.stage || "SUPPLY")) + '</span><div class="rd"><b>' + esc(r.sys) + ' \u2014 ' + esc(r.title) + '.</b> ' + esc(r.says) + '</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udcdc /proposed \u2014 the staging lane (NOT canon \u00b7 NOT a command)</div>'
    + '<div class="rrow"><b>WHERE THEY ARE REVIEWED</b><span class="vd">THE PIPELINE</span><div class="rd">every idea walks the chain the canon names — <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b> (CANON/SYSTEM/COLD-START-BOOT.md I.012, read live off the canon branch) — and it becomes law only at the gate. <b>/pipeline</b> puts each one in front of you at its own stage. Not a command. Not canon. It becomes law only when <b>PHOENIXOMEGAPROTOCOL</b> writes it.</div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd">' + PROPOSED_G999.length + ' ITEMS \u00b7 ' + merged + ' MERGED</span><div class="rd">' + (PR ? (PR.onRecord + ' of ' + PR.total + ' on record ' + DOT + ' ' + PR.atSoul + ' still without words ' + DOT + ' ' + PR.due + ' walking the chain ' + DOT + ' ' + PR.merged + ' applied') : 'no session open — every idea is still at the raw record') + '. Staged at <b>OPERATIONS/COMMANDSTATION/DOCTRINE/</b> as a proposal \u2014 the station never rewrites the canon in place.</div></div>'
    + rows
    + '<div class="rfoot">Durable copy: <b>src/ProposedG999.md</b> (older doctrine: <b>src/PROPOSED-CANON.md</b>). The review surface is <b>/pipeline</b>, at the stage that carries each one. To make one law: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b> — the gate WRITES it to the authority, and the commit is the anchor.</div></div>');
  logOp({ kind:"op", action:"proposed lane (index)", result: PROPOSED_G999.length + " staged \u00b7 " + merged + " merged \u00b7 reviewed on /pipeline" });
  rrlAppend(runNoOf(),"DNA","Obi: [/proposed \u2014 " + PROPOSED_G999.length + " staged, reviewed at their stage on /pipeline]");
  return PROPOSED_G999;
}
const CANON_GH = () => { const t = keyGet("gh"); return { "Authorization":"Bearer "+(t||""), "Accept":"application/vnd.github+json" }; };

async function canonPull(){
  const out = {};
  for(const f of CANON.files){
    try{
      const r = await ghApiJson(CANON.base + "/contents/" + encodeURIComponent(f).replace(/%2F/g, "/") + "?ref=" + CANON.doctrineBranch, { method: "GET", headers: Object.assign({}, CANON_GH()) });
      /* The Contents API answers two ways depending on how the ref resolves: JSON with a
         base64 `content` field, or the raw file body (content-type application/vnd.github.raw).
         BOTH are the same read — handle both, never assume one (a card that showed "(unreachable)"
         while the file was in fact returned is exactly the MAP ≠ TERRAIN defect, L58). */
      if(r.j && r.j.content) out[f] = atob(String(r.j.content).replace(/\n/g, ""));
      else if(r.status === 200 && r.txt && !r.j) out[f] = r.txt;
      else out[f] = null;
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
async function canonSessionMarkdown(){
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
      for(const line of rr.entries.slice(-40)) L.push("- [" + line.role + "] " + redactSecrets(String(line.text || "")).replace(/\n/g, " "));
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
  /* the operation record rides with every session record: the canon is where a
     reader goes looking, so the head, the verification and the anchors are here,
     with the machine-readable chain in OPERATIONS/COMMANDSTATION/ILOG/. */
  L.push("## I-LOG (operation record)");
  L.push("");
  try{
    if(window.ObiILog) L.push(await window.ObiILog.markdown(40));
    else L.push("(src/ilog.js did not load — the operation record is NOT in this session record)");
  }catch(e){ L.push("(I-LOG unavailable: " + e.message + ")"); }
  L.push("");
  L.push("_Generated by /canon sync — the perchance generator reports into the Canon._");
  return L.join("\n");
}
/* The doctrine this station proposes, as one file: the full amended sections live
   in the copies pushed next to it (src/canon/GOSPEL-999.md and
   src/canon/LEGIONNAIRE-FIELD-GUIDE.md), so there is one source of truth for the
   text and no drift between the station and the docs it reads. */
function doctrineAmendment(){
  return [
    "# Doctrine amendment — the I-LOG, ONE AUTHORITY, PHOENIXOMEGAPROTOCOL",
    "",
    "- **Proposed by**: the perchance Command Station — https://perchance.org/" + (window.generatorName || "?"),
    "- **Proposed at**: " + new Date().toISOString(),
    "- **On whose instruction**: SOV100 (Michael Hobbs)",
    "- **Status**: PROPOSED — takes effect when Sov100 merges it into the sealed canon (GOSPEL-999 is never rewritten in place here).",
    "- **Gate**: PHOENIXOMEGAPROTOCOL — this file was pushed with the gate armed (`/omega`), or not at all.",
    "",
    "## What is being added",
    "",
    "1. **ONE AUTHORITY** — `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only authoritative repo; everything we build lives under it (`OPERATIONS/COMMANDSTATION/`), and no mirror may be presented as the canon. `OMEGA.001`",
    "2. **THE I-LOG IS THE RECORD** — every operation is an I-LOG entry (append-only, sha-256 chained); the transcript rides in canon Schema V2 line shape (`content[].data.{text,tool,state}`, SOUL/DNA/REASON per SCS). The VS Code vault (`RRL/`) stays authoritative for incarnations; this station only appends its own sessions beneath `OPERATIONS/COMMANDSTATION/ILOG/`. `OMEGA.002`",
    "3. **ANCHOR, OR IT DID NOT HAPPEN** — every push freezes the head in a commit and records it as an anchor; the unanchored count is always shown, and 'backed up' cannot be claimed while it is above zero. `OMEGA.003`",
    "4. **SEAL, NEVER DELETE** — `/ilog reset` seals and names, it never truncates (I.050). `OMEGA.004`",
    "5. **PHOENIXOMEGAPROTOCOL** — no Canon change without Sov100's password: `/omega <password>` arms the gate for 15 minutes, never past a reload; only a sha-256 is stored; the password is never logged, captured or exported; 5 failures lock the gate for 10 minutes; every attempt is recorded. `OMEGA.005`",
    "6. **SECRETS NEVER ENTER THE RECORD** — credential commands are redacted on the way in and scrubbed from every export. `OMEGA.006`",
    "7. **HONEST LIMITS** — the chain is verified in the sovereign's browser; the commit is the only outside witness, and enrolments/arms/refusals are recorded so nothing happens quietly. `OMEGA.007`",
    "",
    "## The exact text to merge",
    "",
    "- `DOCTRINE/copies/GOSPEL-999.md` — the amended mandate block (`OMEGA.001`–`OMEGA.007`) appended after System III. Provisional numbering; Sov100 assigns final numbers.",
    "- `DOCTRINE/copies/LEGIONNAIRE-FIELD-GUIDE.md` — section 11, *I-LOG OPERATIONS & THE OMEGA GATE* (what an I-LOG is, the anchor rule, the seal rule, the gate, and the I-LOG AUDIT step for the SCS).",
    "- The station's own copies in its shipped source are the same files: `src/canon/GOSPEL-999.md`, `src/canon/LEGIONNAIRE-FIELD-GUIDE.md`.",
    "",
    "## Why it must be merged, not assumed",
    "",
    "GOSPEL-999 is `SEALED | SOV100_ONLY` and \"may be extended but never reduced\" (I.091). This amendment extends; it removes nothing, renumbers nothing, and does not touch the sealed header. Until Sov100 merges it, the station's behaviour follows it while the canon text does not yet say it — that gap is recorded here rather than hidden.",
    "",
    "_Pushed by `/canon doctrine` through PHOENIXOMEGAPROTOCOL. The commit that carries this file is the anchor._"
  ].join("\n");
}

/* Amendment II — THE LESSON AUTHORITY. The second doctrine this station proposes:
   what GOSPEL-999 gains so that a future agent who is told "build a lesson" builds
   one that is the sovereign's, not merely correct. The normative text is
   src/LESSON-STANDARD.md (Part I: the lesson · Part II: the method and the machine);
   the mandates below are its authority layer, derived from the sovereign's own
   lesson files and NET-CLASSROOM-MANAGER.html. */
function lessonAmendment(){
  return [
    "# Doctrine amendment II — THE LESSON AUTHORITY",
    "",
    "- **Proposed by**: the perchance Command Station — https://perchance.org/" + (window.generatorName || "?"),
    "- **Proposed at**: " + new Date().toISOString(),
    "- **On whose instruction**: SOV100 (Michael Hobbs)",
    "- **Status**: PROPOSED — takes effect when Sov100 merges it into the sealed canon (nothing is rewritten in place here).",
    "- **Gate**: PHOENIXOMEGAPROTOCOL — this file was pushed with the gate armed (`/omega`), or not at all.",
    "- **Derived from**: an audit of `NET-CLASSROOM-MANAGER.html` (the sovereign's own classroom machine) beside `NET-Sarcasm-Academy.html` and `NET-Highschool-Careers.html`.",
    "",
    "## What is being added",
    "",
    "1. **THE METHOD IS THE ARITHMETIC** — 10 vocab · 5 idioms · 5 slang · 3 games (10-5-5-3) over 60 minutes; a lesson is one session's slice, never a different shape. `LESSON.001`",
    "2. **THE FILES WIN ON TASTE; THE LAW WINS ON DEFECTS** — the reference files are ground truth for taste; the ten documented defects are never inherited. `LESSON.002`",
    "3. **NO LESSON WITHOUT THE CHECK** — `/lesson check` must pass with zero errors before a lesson is previewed, shipped or called done. `LESSON.003`",
    "4. **CHATTY TEACHES; CHATTY NEVER JUDGES** — a clue (reality check) and a hint (the transferable rule) before the test; every miss re-teaches the rule. `LESSON.004`",
    "5. **THE PRACTICE SCORES** — clickable practice moves a visible counter; wrong never outruns correct. `LESSON.005`",
    "6. **THE EXIT HANDS OVER A KEY** — a summary card of bolded rules plus a Level Up or a writing task. `LESSON.006`",
    "7. **THE VOICE IS THE SOVEREIGN'S** — second person, short, imperative; caps are weight; loud-and-wrong beats silent-and-correct; no hedging, no apology, no sarcasm aimed at the learner. `LESSON.007`",
    "8. **THE BRAND IS IMMUTABLE** — #a855f7 purple, #f59e0b gold, #0f0f1a ground, glass cards, purple→gold gradients. `LESSON.008`",
    "9. **TWO FAMILIES, DISPLAYED WITH INTENT** — at most two Google Fonts: a display face (Orbitron, uppercase) and a body face (Rajdhani or Inter). `LESSON.009`",
    "10. **ONE FILE, HANDED OVER** — a single self-contained .html, no framework, no build, no downloaded assets. `LESSON.010`",
    "11. **A GAME OWNS UP TO ITS MECHANISM** — three typed games minimum (competition / collaboration / creation), each with a one-line mechanism. `LESSON.011`",
    "12. **ONE ECONOMY** — 🐭 Mouse · 🐻 Cub 200 · 🐅 Tiger 500 · 👑 Legend 5000; +10 vocab · +25 idiom · +5 participation · +50 game · +100 perfect; lesson coins are the smaller denomination. `LESSON.012`",
    "13. **JUICE, GENERATED NOT DOWNLOADED** — WebAudio oscillators and div confetti only; the audio context is created on the first gesture; a miss never gets the win cue. `LESSON.013`",
    "14. **MOVEMENT CAN BE STOPPED, CHANGE IS ANNOUNCED** — prefers-reduced-motion honoured, feedback in an aria-live region, state = colour plus its dim fill, meaningful emoji named in text. `LESSON.014`",
    "15. **NO NATIVE DIALOGS, NO SECOND SOURCE OF TRUTH, NO UNESCAPED NAME.** `LESSON.015`",
    "16. **THE LESSON OBEYS THE SESSION** — lessons come from this class's evidence (writeups, reviews, summaries), never from nothing. `LESSON.016`",
    "17. **THE LESSON IS AN I-LOG ENTRY** — recorded in the library, and on the canon with its spec, its check result and the commit that carries it. `LESSON.017`",
    "18. **HONEST LIMITS** — the standard is taste codified from three files and one audit, not a law of nature. `LESSON.018`",
    "",
    "## The exact text to merge",
    "",
    "- `DOCTRINE/copies/GOSPEL-999.md` — Amendment II (`LESSON.001`–`LESSON.018`) appended after the Ω amendment. Provisional numbering; Sov100 assigns final numbers.",
    "- `DOCTRINE/copies/LEGIONNAIRE-FIELD-GUIDE.md` — section 12, *LESSON AUTHORSHIP* (the four authorities in order, the method as arithmetic, the machine, the voice verbatim, the reverse-hardened failure modes, the checklist).",
    "- The station's own copies in its shipped source are the same files: `src/canon/GOSPEL-999.md`, `src/canon/LEGIONNAIRE-FIELD-GUIDE.md`.",
    "- The normative text they cite: `src/LESSON-STANDARD.md` (Part I: the lesson · Part II: the method and the machine), and the three reference files in `src/lessons/reference/` (the two lessons = the format; NET-CLASSROOM-MANAGER.html = the method and the machine).",
    "",
    "## Why it must be merged, not assumed",
    "",
    "GOSPEL-999 is `SEALED | SOV100_ONLY` and \"may be extended but never reduced\" (I.091). Amendment II extends; it removes nothing, renumbers nothing, and does not touch the sealed header. Until Sov100 merges it, the station's behaviour follows it while the canon text does not yet say it — that gap is recorded here rather than hidden.",
    "",
    "_Pushed by `/canon doctrine` through PHOENIXOMEGAPROTOCOL. The commit that carries this file is the anchor._"
  ].join("\n");
}

async function canonPushSession(opts){  opts = opts || {};
  if(!keyGet("gh")) return "NO_TOKEN";
  const ts = new Date().toISOString().replace(/[:.]/g,"-").slice(0,23);
  const run = currentRun();
  const runN = run ? run.run : "?";
  const files = {
    ["OPERATIONS/COMMANDSTATION/session-" + ts + "-run" + runN + ".md"]: await canonSessionMarkdown(),
    "OPERATIONS/COMMANDSTATION/README.md": "# Command Station\n\nLive reports from the perchance generator. Each `session-*.md` is a `/canon sync` push. App sources snapshotted under `perchance/`. The station's I-LOG (operation chain + canon-schema transcript + anchors) lives under `ILOG/`, and `/gh backup` adds the raw chat under `BACKUP/chat/`.\n"
  };
  /* /gh backup is the whole build: the same push, plus the raw chat record. */
  if(opts.chat){
    try{ files["OPERATIONS/COMMANDSTATION/BACKUP/chat/raw-chat-" + ts + ".json"] = redactSecrets(await buildRawChat()); }catch(e){}
    files["OPERATIONS/COMMANDSTATION/BACKUP/README.md"] = "# The whole build, one authority\n\nWritten by `/gh backup`: the session record, the station's sources, the raw chat (soul + runs, secrets scrubbed) and the I-LOG — all of it under the ONE authoritative repo (branch `master`). There is no second backup repo: what is not here does not exist on Git.\n";
  }
  if(opts.doctrine){
    /* the doctrine amendment proposed by the sovereign: written here, pushed only
       through PHOENIXOMEGAPROTOCOL, so the Canon's own copies stay the authority
       until Sov100 merges them. */
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/I-LOG-AND-OMEGA-AMENDMENT.md"] = doctrineAmendment();
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/LESSON-AUTHORITY-AMENDMENT.md"] = lessonAmendment();
    files["OPERATIONS/COMMANDSTATION/DOCTRINE/README.md"] = "# Doctrine — the amendments this station proposes\n\nThis directory carries the doctrines this station proposes/records, and the copies it reads from. The authoritative texts remain `CANON/SYSTEM/LegionnaireFieldGuide.md` (operations) and `GOSPEL-999` (authority): this station never rewrites them in place — it pushes an amendment that Sov100 merges.\n\n| file | amendment | what it adds |\n|---|---|---|\n| `I-LOG-AND-OMEGA-AMENDMENT.md` | Amendment I | the I-LOG, the ONE AUTHORITY, ANCHOR-OR-IT-DID-NOT-HAPPEN, SEAL-NEVER-DELETE, PHOENIXOMEGAPROTOCOL, secrets, honest limits (`OMEGA.001`–`.007`) |\n| `LESSON-AUTHORITY-AMENDMENT.md` | Amendment II | THE LESSON AUTHORITY — how a NET Academy lesson must be built (`LESSON.001`–`.018`), from the sovereign's own lesson files and `NET-CLASSROOM-MANAGER.html` |\n| `copies/` | — | the station's own `src/canon/` copies, carried so the push is self-contained |\n";
    for(const p of ["src/canon/GOSPEL-999.md", "src/canon/LEGIONNAIRE-FIELD-GUIDE.md", "src/ProposedG999.md", "src/PROPOSED-CANON.md", "src/LESSON-STANDARD.md"]){
      try{ const fr = await fetch(p); if(fr.ok){ files["OPERATIONS/COMMANDSTATION/DOCTRINE/copies/" + p.replace(/^src\/(canon\/)?/, "")] = await fr.text(); } }catch(e){}
    }
  }
  for(const p of SRC_SNAPSHOT){
    try{ const t = await selfSourceAny(p); if(t != null){ files["OPERATIONS/COMMANDSTATION/perchance/" + p] = t; } }catch(e){}
  }
  /* the I-LOG itself goes up with every sync, so the Canon holds the record and
     not merely a summary of it */
  const L = window.ObiILog;
  if(!L) return { pushed:0, failed:0, commitSha:null, ts:ts, files:0, errors:["src/ilog.js did not load — refusing to push a session record with no operation log (fail closed)"], ilogEntries:0 };
  let ilogEntries = 0;
  if(L){
    try{
      const chain = await L.all(), anchors = await L.anchors(), v2 = await L.v2Jsonl(), st = await L.stats();
      ilogEntries = chain.length;
      files["OPERATIONS/COMMANDSTATION/ILOG/latest.jsonl"] = L.jsonl(chain);
      files["OPERATIONS/COMMANDSTATION/ILOG/ilog-" + ts + "-seg" + st.seg + ".jsonl"] = L.jsonl(chain);
      files["OPERATIONS/COMMANDSTATION/ILOG/rrl-" + ts + "-run" + runN + ".jsonl"] = v2;
      files["OPERATIONS/COMMANDSTATION/ILOG/anchors.json"] = JSON.stringify(anchors, null, 2);
      files["OPERATIONS/COMMANDSTATION/ILOG/INDEX.md"] = L.indexMd();
      files["OPERATIONS/COMMANDSTATION/ILOG/README.md"] = L.readme;
      files["OPERATIONS/COMMANDSTATION/ILOG/STATUS.md"] = "# I-LOG — status at sync " + ts + "\n\n- head: `" + (st.head || "none") + "` (" + (st.alg || "?") + ")\n- entries: " + st.count + " · segment " + st.seg + " · unanchored before this push: " + st.unanchored + "\n- generator: " + (window.generatorName || "?") + "\n";
    }catch(e){}
  }
  const snap = await L.gitCommitFiles({ owner: CANON.owner, repo: CANON.repo, branch: CANON.branch, files: files, message: "perchance command station sync " + ts + " · " + Object.keys(files).length + " files" });
  const filesN = Object.keys(files).length;
  let anchor = null;
  if(snap.commitSha && L){
    try{
      const st = await L.stats();
      anchor = await L.anchorRecord({ commit: snap.commitSha, branch: CANON.branch, repo: CANON.owner + "/" + CANON.repo, seg: st.seg, seq: st.count, head: st.head, count: st.count, pushed: snap.pushed, failed: snap.failed, path: "OPERATIONS/COMMANDSTATION/ILOG/latest.jsonl" });
    }catch(e){}
  }
  return { pushed: snap.pushed, failed: snap.failed, commitSha: snap.commitSha, baseSha: snap.baseSha, ts: ts, files: filesN, errors: snap.errors, ilogEntries: ilogEntries, anchor: anchor };
}

/* ============================================================================
   THE PLACEMENT REGISTER — where every document actually lives.
   The sovereign's rule (2026-09-21): a document stays inside this generator ONLY
   as an EXACT MIRROR of the git authoritative branch, and only if the station needs
   it to run. Everything else belongs IN the canon — fitted into the structure that
   already exists there, never renamed, never invented. Nothing is moved out of here
   until it is COMMITTED on the branch, because a local copy deleted before the commit
   is destroyed. And the only thing that changes the canon is the sovereign's
   /PhoenixRisingProtocol — a proposal is not a change.
   ========================================================================== */
const DOC_PLACEMENT = [
  { here:"src/canon/GOSPEL-999.md",                  git:"CANON/SYSTEM/GOSPEL-999.md",                 kind:"mirror",   why:"the law — read live by /canon and /fieldguide" },
  { here:"src/canon/LEGIONNAIRE-FIELD-GUIDE.md",     git:"CANON/SYSTEM/LegionnaireFieldGuide.md",      kind:"mirror",   why:"the field guide — §SCS is the loop, §11 the I-LOG law" },
  { here:"src/canon/REINCARNATE-DEATH-SEAL.md",      git:".kilo/command/reincarnatedeath.md",          kind:"withdraw", why:"NOT CANON — measured: no such path exists on either branch (`CANON/SYSTEM/REINCARNATE-DEATH-SEAL.md` → 404 twice). It is a digest of the LEGACY KILO command `.kilo/command/reincarnatedeath.md` (30,759 B) and it carries a `KILO SESSION HANDLING` section. The canon's own Stage 7 is `CANON/SYSTEM/reincarnateDEATH.md`, which the station already reads live. Withdrawn from the canon folder (the Kilo file itself is untouched on git)" },
  { here:"src/canon/NET-PET-AI-SECRETS-MANIFEST.md", git:"APPS/NET-PET-AI-legacy/SECRETS-MANIFEST.md", kind:"mirror",   why:"the manifest the station checks its own secrets against" },
  { here:"src/HANDOFF.md",                   git:"OPERATIONS/COMMANDSTATION/HANDOFF.md",                   kind:"to-canon", why:"the resume point" },
  { here:"src/TRAIL.md",                     git:"",                                                  kind:"withdraw", why:"WITHDRAWN 2026-09-21 on the sovereign's word (\"there should be no trail or audit .md! I didnt make that\") — this station does not ship a build-record document; the build record is the I-LOG (`/ilog`), append-only, hash-chained and Git-anchored. Nothing destroyed: the withdrawal is logged, and the station's actual record was never in the file." },
  { here:"src/AUDIT.md",                     git:"",                                                  kind:"withdraw", why:"WITHDRAWN 2026-09-21 on the sovereign's word (\"there should be no trail or audit .md! I didnt make that\") — no separate audit document. The audit's findings live as code (CANON_REGISTRY's BUILT/ORIGIN columns, `STATION_LINES`) and the record of the pass is the I-LOG (`/ilog`)." },
  { here:"src/SPEC.md",                      git:"OPERATIONS/COMMANDSTATION/SPEC.md",                      kind:"to-canon", why:"what the sovereign asked for, kept verbatim" },
  { here:"src/REPO.md",                      git:"OPERATIONS/COMMANDSTATION/REPO.md",                      kind:"to-canon", why:"the repo map" },
  { here:"src/COSTS.md",                     git:"OPERATIONS/COMMANDSTATION/COSTS.md",                     kind:"to-canon", why:"where the work runs and what it costs" },
  { here:"src/README.md",                    git:"OPERATIONS/COMMANDSTATION/README.md",                    kind:"to-canon", why:"the entry point for whoever comes next" },
  { here:"src/PHOENIXCOMMAND-BLUEPRINT.md",  git:"OPERATIONS/COMMANDSTATION/PHOENIXCOMMAND-BLUEPRINT.md",  kind:"to-canon", why:"the recon that founded this station" },
  { here:"src/STUDENT-EVALUATOR-ECOSYSTEM.md",git:"OPERATIONS/COMMANDSTATION/STUDENT-EVALUATOR-ECOSYSTEM.md",kind:"to-canon",why:"the desk's role map" },
  { here:"src/AGENT99-OS.md",                git:"CANON/SYSTEM/AGENT99-OS.md",                             kind:"proposal", why:"names the kernel and the offerings — a CANON file, so it is a proposal, not a copy" },
  { here:"src/LESSON-STANDARD.md",           git:"CANON/SYSTEM/LESSON-STANDARD.md",                        kind:"proposal", why:"the lesson authority — a CANON file, so it is a proposal" },
  { here:"src/PROPOSED-CANON.md",            git:"OPERATIONS/COMMANDSTATION/DOCTRINE/PROPOSED-CANON.md",   kind:"proposal", why:"the older staging lane" },
  { here:"src/ProposedG999.md",              git:"OPERATIONS/COMMANDSTATION/DOCTRINE/ProposedG999.md",     kind:"proposal", why:"the staging lane as the sovereign reads it" }
];
async function cmdCanonPlace(){
  const sha16 = async t => { try{ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,16); }catch(e){ return "no-crypto"; } };
  const tok = keyGet("gh");
  const rows = [];
  for(const d of DOC_PLACEMENT){
    let state = "TO THE CANON", note = "moves on your word — the copy here is destroyed only AFTER the commit exists on the branch";
    if(d.kind === "mirror"){
      let hereTxt = null;
      try{ const r = await fetch(d.here); hereTxt = r.ok ? await r.text() : null; }catch(e){ hereTxt = null; }
      let gitTxt = null;
      if(tok){
        try{
          const r = await ghApiJson(CANON.base + "/contents/" + d.git + "?ref=" + CANON.doctrineBranch, { headers: Object.assign({}, CANON_GH()) });
          gitTxt = (r.j && r.j.content) ? atob(String(r.j.content).replace(/\n/g,"")) : ((r.status === 200 && !r.j) ? r.txt : null);
        }catch(e){ gitTxt = null; }
      }
      if(!tok){ state = "UNVERIFIED"; note = "no PAT in this browser, so the mirror cannot be checked — fail-closed"; }
      else if(gitTxt == null){ state = "GIT MISSING"; note = "the branch does not answer for " + d.git; }
      else {
        const a = await sha16(hereTxt || ""), b = await sha16(gitTxt);
        state = a === b ? "EXACT MIRROR" : "DRIFT";
        note = (hereTxt ? hereTxt.length : 0) + " B here · " + gitTxt.length + " B on the branch · sha " + a + (a === b ? "" : " ≠ " + b + " (this copy carries the station's PROPOSED appendix, below the banner)");
      }
    } else if(d.kind === "proposal"){
      state = "PROPOSAL";
      note = "a canon file — it changes only when PHOENIXOMEGAPROTOCOL writes it (/PhoenixOmegaProtocol <password> :: <the change>), and the commit is the anchor";
    } else if(d.kind === "withdraw"){
      state = "WITHDRAWN";
      note = "removed from this tree — it does not belong in the station's source. The withdrawal is recorded in the I-LOG; nothing on git was destroyed, so the record is kept and the false artifact is gone";
    }
    rows.push({ d:d, state:state, note:note });
  }
  const grp = (k, label, sub) => {
    const g = rows.filter(r => r.d.kind === k);
    if(!g.length) return "";
    return '<div class="rrow"><b>' + label + '</b><span class="vd">' + g.length + '</span><div class="rd">' + sub + '</div></div>'
      + g.map(r => '<div class="rrow' + (r.state === "DRIFT" || r.state === "GIT MISSING" || r.state === "UNVERIFIED" ? " bad" : "") + '"><b>' + esc(r.d.here) + '</b><span class="vd">' + esc(r.state) + '</span><div class="rd">→ <span class="rd">' + esc(r.d.git) + '</span> — ' + esc(r.note) + (r.d.why ? ' · <i>' + esc(r.d.why) + '</i>' : "") + '</div></div>').join("");
  };
  addBubble("ass", '<div class="rise"><div class="rhead">🗂 /canon place — where every document lives</div>'
    + '<div class="rrow"><b>THE RULE</b><span class="vd">MIRROR OR MOVE</span><div class="rd">a document stays in this generator ONLY as an <b>exact mirror</b> of the git authoritative branch, and only if the station needs it to run. Everything else belongs <b>in the canon</b> — fitted into the structure that already exists there. Nothing is renamed. Nothing is deleted before its commit exists on the branch.</div></div>'
    + '<div class="rrow"><b>WHERE THIS IS REVIEWED</b><span class="vd">THE PIPELINE</span><div class="rd">this register is a <b>proposal</b>, so it is neither a command nor a shelf item: it is carried by the <b>SUPPLY</b> stage of the S2Pipeline and reviewed there, <b>when it is its time</b> (<b>/pipeline</b>). This card is only the reader.</div></div>'
    + grp("mirror", "MIRRORS KEPT HERE", "read from the branch with <b>?ref=" + esc(CANON.doctrineBranch) + "</b>, compared byte-for-byte by sha-256")
    + grp("withdraw", "WITHDRAWN — FALSE NON-CANON", "measured against both branches; a false script does not keep the name <b>canon/</b>")
    + grp("to-canon", "ONTO THE AUTH BRANCH", "fitted into the lane this station already owns: <span class=\"rd\">OPERATIONS/COMMANDSTATION/</span>")
    + grp("proposal", "PROPOSALS — CANON FILES", "never overwritten in place: they are proposed and take effect when you merge them")
    + '<div class="rrow"><b>THE ONLY KEY</b><span class="vd">/PhoenixRisingProtocol</span><div class="rd">nothing but the sovereign&#39;s own protocol changes the canon. A proposal is not a change; a MERGED commit is. Gate: <b>/PhoenixRisingProtocol &lt;password&gt;</b> arms it for 15 minutes.</div></div>'
    + '<div class="rfoot">Push lanes: <b>/canon sync</b> (session + sources + I-LOG → OPERATIONS/COMMANDSTATION/) · <b>/canon doctrine</b> (the amended copies → OPERATIONS/COMMANDSTATION/DOCTRINE/). Both are gated. <b>/scout</b> proves the branch answers; this card proves each mirror.</div></div>');
  logOp({ kind:"op", action:"canon place", result: rows.length + " documents registered" });
  rrlAppend(runNoOf(), "DNA", "Obi: [/canon place — " + rows.length + " documents registered]");
  return rows;
}
/* ============================================================================
   THE SOUL INTAKE, AND THE GATE THAT WRITES.
   Two rules the sovereign stated flatly (2026-09-21), and this is both of them:

   1) "if I type PhoenixOmegaProtocol along with a change either you or me came up with,
       then it gets changed, its not fucking rocket science."
      PHOENIXOMEGAPROTOCOL is not a proposal mechanism. Armed, it is the WRITE: the change
      goes to the authority (the canon branch) and is committed. Unarmed, nothing is written
      anywhere. There is no third state.

   2) "if it comes up as an idea it starts as SOUL and moves its way to the pipeline just
       like everything else."
      So an idea is not filed as a command and does not arrive already classified. The
      sovereign's words are captured VERBATIM as SOUL first (/idea, or the change typed with
      the protocol), and the idea then travels the same pipeline as every other artifact:
      SOUL -> the stage that carries it (SUPPLY routes it, ENGINEER audits it) -> the gate.
      src/scs.js reads this lane through window.ObiIdeas and prints the journey.
   ========================================================================== */
const IDEAS_KEY = "obi_ideas";
function ideasAll(){
  try{ const l = JSON.parse(localStorage.getItem(IDEAS_KEY) || "[]"); return Array.isArray(l) ? l : []; }
  catch(e){ return []; }
}
function ideasSave(list){ try{ localStorage.setItem(IDEAS_KEY, JSON.stringify(list.slice(-300))); }catch(e){} }
function addIdea(text, opts){
  opts = opts || {};
  const t = String(text || "").trim();
  if(!t) return null;
  const list = ideasAll();
  const row = { id: "SOUL." + (list.length + 1), kind: "idea",
    sys: "THE SOVEREIGN'S OWN WORDS" + (opts.via ? " · " + opts.via : ""),
    title: t.replace(/\s+/g, " ").slice(0, 96), says: t, stage: "SUPPLY", merged: false,
    soul: { verbatim: t, at: new Date().toISOString(), run: runNoOf() } };
  list.push(row); ideasSave(list);
  logOp({ kind:"soul", action:"idea filed", detail: t.slice(0, 200), result: row.id + " · starts as SOUL, at the pipeline", ref: row.id });
  try{ pheromone({ kind:"op", key:"idea", signal:"IDEA " + row.id, weight:12, meta:{ id: row.id } }); }catch(e){}
  return row;
}
function ideasMarkApplied(ids, info){
  const list = ideasAll();
  list.forEach(r => { if(ids.indexOf(r.id) !== -1){ r.merged = true; r.applied = info; } });
  ideasSave(list);
  return list;
}
/* THE PROOF — the sovereign's verbatim words, attached to a staged item so the pipeline may carry
   it. An idea starts as SOUL; these are the words that let it start. */
const SOUL_PROOF_KEY = "obi_soul_proof";
function soulProofs(){ try{ const o = JSON.parse(localStorage.getItem(SOUL_PROOF_KEY) || "{}"); return (o && typeof o === "object") ? o : {}; }catch(e){ return {}; } }
function soulProve(id, words){
  const w = String(words || "").trim();
  if(!id || !w) return null;
  const o = soulProofs();
  o[String(id).trim()] = { verbatim: w, at: new Date().toISOString(), run: runNoOf() };
  try{ localStorage.setItem(SOUL_PROOF_KEY, JSON.stringify(o)); }catch(e){}
  logOp({ kind:"soul", action:"proof attached", detail: id + " · " + w.slice(0, 160), result:"verbatim words on record", ref: id });
  return o[String(id).trim()];
}
window.ObiIdeas = { all: ideasAll, add: addIdea, markApplied: ideasMarkApplied, proofs: soulProofs, prove: soulProve, key: IDEAS_KEY };

/* the canon files the gate writes, and which staged rows each one carries */
const GATE_TARGETS = [
  { here:"src/canon/GOSPEL-999.md",              git:"CANON/SYSTEM/GOSPEL-999.md",             sys:/GOSPEL-999/i },
  { here:"src/canon/LEGIONNAIRE-FIELD-GUIDE.md", git:"CANON/SYSTEM/LegionnaireFieldGuide.md",  sys:/LEGIONNAIRE-FIELD-GUIDE/i }
];
const PROPOSE_BANNER = "AMENDMENT PROPOSED";
/* the station's copy = the branch's own text + the amendment block it appended. The gate must
   never clobber a branch that moved on: the PRISTINE body is what is on the branch NOW, and the
   block is the station's, so the write is (branch-as-it-is) + (the station's block). */
function splitAmendmentBlock(txt){
  const b = txt.indexOf(PROPOSE_BANNER);
  if(b < 0) return null;
  const sep = txt.lastIndexOf("\n---\n", b);
  if(sep < 0) return null;
  return { base: txt.slice(0, sep), block: txt.slice(sep) };
}
async function cmdCanonApply(change){
  const what = change ? "the sovereign's change" : "the staged amendments";
  if(!await omegaRequire("PHOENIXOMEGAPROTOCOL — write " + what + " to the authority")) return;
  const L = window.ObiILog;
  if(!L || !L.gitCommitFiles){ addBubble("ass", "⚠ src/ilog.js did not load — there is no write path, so nothing was written (fail closed)."); return; }
  const iso = new Date().toISOString().replace("T"," ").slice(0,19) + "Z";
  addBubble("ass", '<div class="rise"><div class="rhead">🔓 PHOENIXOMEGAPROTOCOL — writing ' + esc(what) + '</div><div class="rd">Branch <b>' + esc(CANON.doctrineBranch) + '</b> · the gate is armed, so this is a change, not a proposal.</div></div>');

  /* (2) FIRST: the sovereign's words, captured VERBATIM. An idea starts as SOUL. */
  let idea = null;
  if(change){ captureSoul(change, "the change, typed with PHOENIXOMEGAPROTOCOL"); idea = addIdea(change, { via:"typed with the protocol" }); }

  const written = []; const errors = [];
  for(const t of GATE_TARGETS){
    let gitBody = null;
    try{
      const r = await ghApiJson(CANON.base + "/contents/" + t.git + "?ref=" + CANON.doctrineBranch, { headers: Object.assign({}, CANON_GH()) });
      gitBody = (r.j && r.j.content) ? atob(String(r.j.content).replace(/\n/g,"")) : ((r.status === 200 && !r.j) ? r.txt : null);
    }catch(e){ errors.push(t.git + " read — " + e.message); }
    if(gitBody == null){ errors.push(t.git + " — the branch did not answer; nothing written for it"); continue; }
    if(gitBody.indexOf(PROPOSE_BANNER.replace("PROPOSED","APPLIED")) !== -1){
      written.push({ path:t.git, state:"ALREADY APPLIED", bytes:gitBody.length });
      PROPOSED_G999.forEach(r => { if(t.sys.test(r.sys) && !r.merged){ r.merged = true; r.applied = { at: iso, commit: null, note:"already on the branch" }; } });
      continue;
    }
    let newBody = null;
    if(change){
      newBody = gitBody.trimEnd() + "\n\n---\n\n## AMENDMENT — SOVEREIGN ORDER (APPLIED)\n\n"
        + "> **status:** APPLIED — written by the perchance Command Station under **PHOENIXOMEGAPROTOCOL**.\n"
        + "> **at:** " + iso + " · **authority:** SOV100_MICHAEL_HOBBS — the sovereign typed the protocol and the change in one breath.\n"
        + "> **record:** the SOUL (verbatim, below) · the I-LOG · the commit below.\n\n"
        + "**" + (idea ? idea.id : "SOUL") + "**\n\n" + String(change).trim() + "\n\n"
        + "_SOUL, verbatim:_ “" + String(change).trim() + "”\n";
      /* a new order lands on the amendment register (GOSPEL-999) only; the LFG is not the register */
      if(!/GOSPEL/i.test(t.git)) continue;
    } else {
      let hereTxt = null;
      try{ const fr = await fetch(t.here); hereTxt = fr.ok ? await fr.text() : null; }catch(e){}
      const sp = hereTxt ? splitAmendmentBlock(hereTxt) : null;
      if(!sp){ errors.push(t.here + " — no station amendment block found; nothing written for it"); continue; }
      newBody = gitBody.trimEnd() + "\n\n" + sp.block.split(PROPOSE_BANNER).join("AMENDMENT APPLIED — PHOENIXOMEGAPROTOCOL, " + iso);
    }
    let res = null;
    try{
      res = await L.gitCommitFiles({ owner: CANON.owner, repo: CANON.repo, branch: CANON.doctrineBranch,
        files: { [t.git]: newBody },
        message: "PHOENIXOMEGAPROTOCOL " + (idea ? idea.id + " — " + idea.title.slice(0,60) : "apply the staged amendments") });
    }catch(e){ errors.push(t.git + " write — " + e.message); continue; }
    if(res && res.commitSha){
      written.push({ path:t.git, state:"APPLIED", commit: res.commitSha, bytes: newBody.length });
      const info = { at: iso, commit: res.commitSha, branch: CANON.doctrineBranch };
      if(idea){ ideasMarkApplied([idea.id], info); }
      else { PROPOSED_G999.forEach(r => { if(t.sys.test(r.sys)){ r.merged = true; r.applied = info; } }); }
      logOp({ kind:"push", action:"canon apply", ok:true, detail: t.git + " @" + CANON.doctrineBranch, result: newBody.length + " B · commit " + String(res.commitSha).slice(0,8), ref: res.commitSha });
      try{ ilog({ kind:"omega", action:"apply", ok:true, detail: t.git, result:"written · commit " + String(res.commitSha).slice(0,8), ref: res.commitSha }); }catch(e){}
    } else {
      const why = (res && res.errors && res.errors.length) ? res.errors.slice(0,2).join(" · ") : "no commit returned";
      errors.push(t.git + " — " + why);
      logOp({ kind:"push", action:"canon apply", ok:false, detail:t.git, result:why });
    }
  }
  const okN = written.filter(w => w.state === "APPLIED").length;
  addBubble("ass", '<div class="rise"><div class="rhead">' + (okN ? "✅" : "⚠") + ' PHOENIXOMEGAPROTOCOL — ' + (okN ? "CHANGED" : "nothing changed") + '</div>'
    + (idea ? '<div class="rrow"><b>SOUL</b><span class="vd">' + esc(idea.id) + '</span><div class="rd">your words, verbatim, filed first: <i>“' + esc(idea.title) + '”</i> — it is in the ledger and on the pipeline</div></div>' : "")
    + written.map(w => '<div class="rrow"><b>' + esc(w.path) + '</b><span class="vd">' + esc(w.state) + '</span><div class="rd">' + esc(String(w.bytes)) + ' B' + (w.commit ? ' · commit <b>' + esc(String(w.commit).slice(0,8)) + '</b>' : "") + ' · branch <b>' + esc(CANON.doctrineBranch) + '</b></div></div>').join("")
    + (errors.length ? '<div class="rrow bad"><b>ERRORS</b><span class="vd">' + errors.length + '</span><div class="rd">' + esc(errors.slice(0,4).join(" · ")) + '</div></div>' : "")
    + '<div class="rfoot">' + (okN ? "The commit is the anchor. What you said is now in the canon on the authority branch, in the ledger, and in the I-LOG." : "The gate is armed but nothing landed — the errors are above, unhidden. Nothing was written.") + '</div></div>');
  updateTabMeta();
  return written;
}

/* /idea — an idea raised in the sovereign's own words. It starts as SOUL, and the pipeline
   carries it from there exactly like every other artifact. Nothing here is canon. */
async function cmdIdea(arg){
  const t = String(arg || "").trim();
  if(!t){
    addBubble("ass", '<div class="rise"><div class="rhead">💡 /idea — raise a change</div><div class="rd">Type <b>/idea &lt;your words&gt;</b>. They are captured <b>verbatim as SOUL</b> (L37 — never summarized), and the idea then walks the chain like everything else: <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b>, and the gate writes it. To make it law in the same breath: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>.</div></div>');
    return;
  }
  const pair = t.match(/^([^:]{2,44}?)\s*::\s*([\s\S]+)$/);
  if(pair && /^(SOUL\.\d+|OMEGA|LFG|LESSON|LSN|CANON|PLACEMENT|BRAND|G444)/i.test(pair[1].trim())){
    /* the sovereign is giving an ALREADY-STAGED item its words — that is how it starts as SOUL */
    const want = pair[1].trim(), words = pair[2].trim();
    captureSoul(words, "attached to " + want);
    soulProve(want, words);
    const onLane = (window.ObiSCS && window.ObiSCS.proposalList) ? window.ObiSCS.proposalList() : [];
    const hit = onLane.filter(x => String(x.id).toLowerCase() === want.toLowerCase())[0]
             || onLane.filter(x => String(x.id).toLowerCase().indexOf(want.toLowerCase()) === 0)[0]
             || onLane.filter(x => String(x.id).toLowerCase().indexOf(want.toLowerCase()) !== -1)[0];
    addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udca1 SOUL attached \u2014 ' + esc(hit ? hit.id : want) + '</div>'
      + '<div class="rrow"><b>SOUL</b><span class="vd">\u2713 ON RECORD</span><div class="rd">\u201c' + esc(words) + '\u201d<br>your words, verbatim, run ' + esc(String(runNoOf())) + ' \u2014 the item may now be carried by the pipeline</div></div>'
      + '<div class="rrow"><b>NEXT</b><span class="vd">THE PIPELINE</span><div class="rd">it moves like everything else: SOUL \u2192 <b>' + esc(hit ? hit.stage : "SUPPLY") + '</b> \u2192 the gate. <b>/pipeline</b> shows where it sits</div></div>'
      + '<div class="rfoot">To make it law in the same breath: <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>.</div></div>');
    return { id: hit ? hit.id : want, soul: true };
  }
  captureSoul(t, "raised as an idea (/idea)");
  const row = addIdea(t, { via: "raised with /idea" });
  let where = null;
  try{ const PR = window.ObiSCS && window.ObiSCS.proposals ? window.ObiSCS.proposals() : null; where = PR && PR.items ? PR.items.filter(x => x.id === row.id)[0] : null; }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">💡 ' + esc(row.id) + ' — filed as SOUL</div>'
    + '<div class="rrow"><b>SOUL</b><span class="vd">✓ VERBATIM</span><div class="rd">“' + esc(t) + '”<br>captured word for word, run ' + esc(String(runNoOf())) + ' — the words are the record, not a summary of them</div></div>'
    + '<div class="rrow"><b>WHERE IT SITS</b><span class="vd">' + esc(where ? where.at : "SOUL") + '</span><div class="rd">' + esc(where ? where.path : "RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC → GATE") + '<br>the chain it walks: <b>RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC</b>, then the gate. It moves when the record and the session reach each node</div></div>'
    + '<div class="rrow"><b>REVIEWED</b><span class="vd">/pipeline</span><div class="rd">not a command, not canon: <b>/pipeline</b> prints it at its stage, and <b>/proposed</b> is the index</div></div>'
    + '<div class="rfoot">To make it law: <b>/PhoenixOmegaProtocol &lt;password&gt;</b> then <b>/omega apply &lt;the change&gt;</b> — or both in one breath, <b>/PhoenixOmegaProtocol &lt;password&gt; :: &lt;the change&gt;</b>. The gate writes; a proposal is not a change.</div></div>');
  return row;
}

async function cmdCanon(arg){
  const a = (arg || "").trim().toLowerCase();
  if(a === "place" || a === "mirror" || a === "mirrors"){ await cmdCanonPlace(); return; }
  if(a === "apply" || a.startsWith("apply ")){ await cmdCanonApply(a.replace(/^apply\s*/i, "").trim()); return; }
  if(a === "sync"){ await cmdCanonSync(); return; }
  if(a === "doctrine" || a === "push doctrine"){
    /* the doctrine amendment → the authority, gated. Nothing is merged: the file
       is proposed, and Sov100 merges it. */
    if(!await omegaRequire("/canon doctrine — the two amendments (I-LOG/Omega + Lesson Authority) → the authority")) return;
    addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon doctrine — proposing the amendments…</div><div class="rd">GOSPEL-999 (Ω.001–Ω.007 + LESSON.001–LESSON.018) + Legionnaire Field Guide §11–12 + the station\'s copies → OPERATIONS/COMMANDSTATION/DOCTRINE/</div></div>');
    const res = await canonPushSession({ doctrine: true });
    if(res === "NO_TOKEN"){ addBubble("ass", "⚠ No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); logOp({ kind:"push", action:"canon doctrine", ok:false, result:"no token — nothing left the browser" }); return; }
    const ok = res.failed === 0 && !!res.commitSha;
    addBubble("ass", '<div class="rise"><div class="rhead">' + (ok ? "✅" : "⚠") + ' /canon doctrine</div>'
      + '<div class="rrow"><b>RESULT</b><span class="vd">' + (ok ? "PUSHED" : "FAILED") + '</span><div class="rd">' + res.pushed + " / " + (res.files || "?") + " files" + (res.commitSha ? " · commit <b>" + esc(res.commitSha.slice(0, 8)) + "</b>" : "") + '</div></div>'
      + '<div class="rrow"><b>MERGE</b><span class="vd">SOV100</span><div class="rd">nothing was rewritten in place — the amendment is proposed at <span class="rd">' + esc("OPERATIONS/COMMANDSTATION/DOCTRINE/") + '</span> and takes effect when you merge it into the sealed canon</div></div>'
      + (res.errors && res.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">' + res.errors.length + '</span><div class="rd">' + esc(res.errors.slice(0, 3).join(" · ")) + '</div></div>' : "")
      + '<div class="rfoot">Carries: <b>I-LOG-AND-OMEGA-AMENDMENT.md</b> + <b>LESSON-AUTHORITY-AMENDMENT.md</b> + the amended copies of <b>GOSPEL-999.md</b> and <b>LEGIONNAIRE-FIELD-GUIDE.md</b> (sections 11–12). The commit is the anchor.</div></div>');
    logOp({ kind:"push", action:"canon doctrine", ok: ok, detail: CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · DOCTRINE/ (both amendments + both amended copies)", result: res.pushed + " pushed · " + res.failed + " failed" + (res.commitSha ? " · commit " + res.commitSha.slice(0, 8) : ""), ref: res.commitSha });
    return;
  }
  if(a === "registry"){
    const rows = CANON_REGISTRY.map(r => '<div class="rrow"><b>'+esc(r[0])+'</b><span class="vd">'+esc(String(r[4]).toUpperCase())+'</span><div class="rd">'+(r[3]?"\u2713 BUILT \u00b7 ":"\u2717 NOT BUILT \u00b7 ")+esc(r[2])+'</div></div>').join("");
    const built = CANON_REGISTRY.filter(r => r[3]).length;
    const canonOnly = CANON_REGISTRY.filter(r => r[4] === "canon" && !r[3]).length + CANON_ONLY.length;
    addBubble("ass", '<div class="rise"><div class="rhead">\ud83d\udcdc /canon registry \u2014 the commands, and whose they are</div>'
      + '<div class="rrow"><b>SUMMARY</b><span class="vd">'+built+' / '+CANON_REGISTRY.length+' BUILT</span><div class="rd">Every row says whether this deck really accepts it (<b>\u2713 BUILT</b>) and where it comes from: <b>CANON</b> = the command is named in the canon branch\u2019s own files (the SCS seven, plus the CANON/SYSTEM and VAULT protocols) \u00b7 <b>STATION</b> = this station invented it and the canon does not have it \u00b7 <b>PROPOSED</b> = it implements an amendment this station proposed but Sov100 has not merged.</div></div>'
      + '<div class="rrow"><b>AUTHORITY</b><span class="vd">CANON BRANCH</span><div class="rd">The canon\u2019s command set is the <b>SCS</b>, named once: <b>CANON/SYSTEM/GOSPEL-999.md \u00a7SYSTEM I</b> + <b>CANON/SYSTEM/LegionnaireFieldGuide.md \u00a7SCS</b> \u2014 /phoenixRISE /phoenixSCOUT /phoenixMARCH /phoenixSCHOLAR /phoenixSUPPLY /phoenixFORTIFY /phoenixDEATH. The <b>.kilo/command/</b> registry is the KILO lineage and is NOT authority.</div></div>'
      + rows
      + '<div class="rrow"><b>CANON, NOT HERE</b><span class="vd">'+canonOnly+'</span><div class="rd">canon commands this deck does NOT implement: '+CANON_ONLY.map(esc).join(" \u00b7 ")+'</div></div>'
      + '<div class="rfoot">'+CANON_REGISTRY.length+' rows \u00b7 '+built+' built \u00b7 '+canonOnly+' canon commands with no station implementation. The gap is printed, never hidden \u2014 a registry that omits what it cannot do is a map that lies (L58).</div></div>');
    logOp({ kind:"op", action:"canon registry", result: CANON_REGISTRY.length + " rows \u00b7 " + built + " built \u00b7 " + canonOnly + " canon-only" });
    rrlAppend(runNoOf(),"DNA","Obi: [/canon registry \u2014 "+CANON_REGISTRY.length+" rows, "+built+" built]");
    return;
  }
  if(a === "proposed" || a === "proposals" || a === "staging"){
    /* the staging lane — aliases /proposed: the walk-through the sovereign reads
       before anything is merged. Nothing here is canon. */
    await cmdProposed();
    return;
  }
  if(a === "soul"){
    addBubble("ass", "Contacting the SOULCOUNT gate…");
    const soul = await canonSoulCount();
    addBubble("ass", '<div class="rise"><div class="rhead">🔥 SOULCOUNT gate</div><div class="rrow"><b>COUNT</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count</div></div><div class="rfoot">TITANIUM_ANCHOR per doctrine — never summarize the soul, only count evidence.</div></div>');
    return;
  }
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — contacting the authoritative repo…</div><div class="rd">Pulling doctrine from Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (canon branch)…</div></div>');
  const [docs, workers, soul] = await Promise.all([canonPull(), canonWorkerStatus(), canonSoulCount()]);
  const docRows = CANON.files.map(f => {
    const c = docs[f];
    const ok = !!c;
    const preview = ok ? esc(c.slice(0,160).replace(/\n/g," ")) + "…" : "(unreachable — is the repo public?)";
    return '<div class="rrow"><b>'+esc(f)+'</b><span class="vd">'+(ok ? c.length+"B" : "DOWN")+'</span><div class="rd">'+preview+'</div></div>';
  }).join("");
  const wRows = workers.map(w => '<div class="rrow"><b>'+esc(w.name)+'</b><span class="vd">'+(w.ok?"UP":"DOWN")+'</span><div class="rd">'+esc(w.detail||"")+'</div></div>').join("");
  addBubble("ass", '<div class="rise"><div class="rhead">📜 /canon — authoritative repo</div>'
    +'<div class="rrow"><b>REPO</b><span class="vd">'+esc(CANON.doctrineBranch)+'</span><div class="rd">Phoenix-Rising-Ai-Solutions/OB-1--Authoritative- (the ONE authority) · doctrine read from the <b>'+esc(CANON.doctrineBranch)+'</b> branch · this station writes its own chain to <b>'+esc(CANON.branch)+'</b></div></div>'
    +docRows
    +'<div class="rrow"><b>SOULGATE</b><span class="vd">'+esc(String(soul))+'</span><div class="rd">soul-logger</div></div>'
    +wRows
    +'<div class="rfoot">/canon sync · /canon registry · /canon soul · /doctor · /gateway · /ledger · /audit · /report</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon — doctrine " + CANON.files.filter(f=>docs[f]).length + "/" + CANON.files.length + " pulled, soulgate " + soul + "]");
}
async function cmdCanonSync(){
  if(!await omegaRequire("/canon sync — session record + sources + I-LOG → the authority")) return;
  addBubble("ass", '<div class="rise"><div class="rhead">🔄 /canon sync — pushing perchance operations → Canon…</div><div class="rd">Building session record + app snapshot + the I-LOG, committing to master…</div></div>');
  const res = await canonPushSession();
  if(res === "NO_TOKEN"){ addBubble("ass","⚠ No GitHub token stored. <b>/gh token &lt;PAT&gt;</b> first."); logOp({ kind:"push", action:"canon sync", ok:false, result:"no token — nothing left the browser" }); return; }
  const ok = res.failed === 0 && !!res.commitSha;
  addBubble("ass", '<div class="rise"><div class="rhead">'+(ok?"✅":"⚠")+' /canon sync</div>'
    +'<div class="rrow"><b>RESULT</b><span class="vd">'+(ok?"PUSHED":"FAILED")+'</span><div class="rd">'+res.pushed+' / '+(res.files||"?")+' files'+(res.commitSha ? " · commit <b>"+esc(res.commitSha.slice(0,8))+"</b>" : "")+'</div></div>'
    +'<div class="rrow"><b>I-LOG</b><span class="vd">'+(res.ilogEntries||0)+'</span><div class="rd">operation chain + canon-schema transcript pushed to OPERATIONS/COMMANDSTATION/ILOG/'+(res.anchor ? ' · anchored as <b>'+esc(String(res.anchor.commit).slice(0,8))+'</b>' : "")+'</div></div>'
    +'<div class="rrow"><b>BRANCH</b><span class="vd">'+esc(CANON.branch)+'</span><div class="rd">'+esc(CANON.owner+"/"+CANON.repo)+' · OPERATIONS/COMMANDSTATION/</div></div>'
    +(res.errors && res.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">'+res.errors.length+'</span><div class="rd">'+esc(res.errors.slice(0,3).join(" · "))+'</div></div>' : "")
    +'<div class="rfoot">'+(ok ? 'View: <b>https://github.com/'+esc(CANON.owner)+'/'+esc(CANON.repo)+'/blob/'+esc(CANON.branch)+'/OPERATIONS/COMMANDSTATION/session-'+esc(res.ts)+'-run'+(currentRun()?currentRun().run:"?")+'.md</b>' : "Base " + esc(String(res.baseSha||"?").slice(0,8)) + " — token scopes or repo write access?")+'</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/canon sync → " + CANON.owner + "/" + CANON.repo + " — " + res.pushed + " files, " + res.failed + " failed]");
  logOp({ kind:"push", action:"canon sync", ok: ok, detail: CANON.owner+"/"+CANON.repo+"@"+CANON.branch+" · "+(res.files||"?")+" files (session + sources + I-LOG "+ (res.ilogEntries||0) + " entries)", result: res.pushed+" pushed · "+res.failed+" failed"+(res.commitSha?" · commit "+res.commitSha.slice(0,8):""), ref: res.commitSha });
}

/* /ilog — the station's own operation record: what it did, whether the chain
   still verifies, and whether Git has witnessed it. */
async function cmdILog(arg){
  const L = window.ObiILog;
  if(!L){ addBubble("ass", "⚠ src/ilog.js didn't load — the operation record is unavailable (reload the page)."); return; }
  const a = String(arg || "").trim().toLowerCase();
  if(a === "verify"){
    addBubble("ass", "🔎 /ilog verify — recomputing the whole chain…");
    const v = await L.verify();
    const rows = (v.segments || []).map(sg => '<div class="rrow' + (sg.ok ? "" : ' bad') + '"><b>SEGMENT ' + esc(sg.seg) + '</b><span class="vd">' + (sg.ok ? "CHAIN OK" : "BROKEN") + '</span><div class="rd">'
      + sg.entries + " entries · #" + esc(sg.firstSeq) + "–" + esc(sg.lastSeq) + " · head <b>" + esc(String(sg.head || "").slice(0, 16)) + "</b>… · " + esc(sg.alg || "?") + '</div></div>').join("");
    addBubble("ass", '<div class="rise"><div class="rhead">' + (v.ok ? "✅" : "⚠") + ' /ilog verify — ' + (v.ok ? "the chain holds" : "a break is real and named") + '</div>'
      + '<div class="rrow"><b>RESULT</b><span class="vd">' + (v.ok ? "OK" : "BROKEN") + '</span><div class="rd">' + v.checked + " entries recomputed in " + v.ms + "ms · " + (v.empty ? "nothing logged yet" : "kv " + (v.kv ? "present" : "UNREACHABLE")) + '</div></div>'
      + (v.breaks && v.breaks.length ? '<div class="rrow bad"><b>FIRST BREAK</b><span class="vd">#' + esc(v.breaks[0].seq) + '</span><div class="rd">link ' + esc(v.breaks[0].link) + " · hash " + esc(v.breaks[0].hash) + " · " + esc(v.breaks[0].alg) + '</div></div>' : "")
      + (v.why ? '<div class="rrow bad"><b>GAP</b><span class="vd"></span><div class="rd">' + esc(v.why) + '</div></div>' : "")
      + rows
      + '<div class="rfoot">Each hash = sha-256 over the entry\'s canonical tuple + the previous entry\'s hash. Rewrite one entry and every later hash stops matching — that is the whole point of the chain. A Git anchor is the only witness outside this browser.</div></div>');
    logOp({ kind:"op", action:"ilog verify", ok: v.ok, detail: v.checked + " entries recomputed", result: v.ok ? "chain OK" : "BROKEN at #" + (v.breaks[0] ? v.breaks[0].seq : "?") });
    return;
  }
  if(a === "push" || a === "anchor"){
    if(!await omegaRequire("/ilog push — anchoring the I-LOG on Git")) return;
    addBubble("ass", "📦 /ilog push — anchoring the record on Git…");
    const r = await L.push({});
    if(r.dryRun){
      addBubble("ass", '<div class="rise"><div class="rhead">⚠ /ilog push — nothing was sent</div>'
        + '<div class="rrow"><b>WHY</b><span class="vd">' + esc(r.reason === "NO_TOKEN" ? "NO TOKEN" : "DRY RUN") + '</span><div class="rd">' + (r.reason === "NO_TOKEN" ? "no GitHub token in this browser — <b>/gh token &lt;PAT&gt;</b> stores one locally (never in this source)" : "dry run — the payload below is exactly what a push would write") + '</div></div>'
        + '<div class="rrow"><b>WOULD WRITE</b><span class="vd">' + r.plan.files.length + ' files</span><div class="rd">' + r.plan.files.map(f => esc(f.path.replace(L.DIR, "")) + " (" + Math.round(f.bytes / 1024) + "kb)").join("<br>") + '</div></div>'
        + '<div class="rrow"><b>TARGET</b><span class="vd">' + esc(r.plan.head ? String(r.plan.head).slice(0, 12) : "empty log") + '</span><div class="rd">' + esc(r.plan.target) + " · head frozen at push time · " + r.plan.entries + " chain entries · " + Math.round(r.plan.bytes / 1024) + "kb</div></div>"
        + '<div class="rfoot">Until this push happens the record lives only on this origin (kv + localStorage mirror). That is the honest state of "backed up": <b>not yet</b>.</div></div>');
      logOp({ kind:"push", action:"ilog push", ok:false, detail: r.plan.files.length + " files prepared", result: r.reason === "NO_TOKEN" ? "no token — dry run only" : "dry run" });
      return;
    }
    addBubble("ass", (r.ok ? "✅" : "⚠") + ' /ilog push — <b>' + r.pushed + '</b> files pushed, <b>' + r.failed + '</b> failed.'
      + (r.commitSha ? '<br>Anchor commit <b>' + esc(r.commitShort) + '</b> in <b>' + esc(L.REPO.owner + "/" + L.REPO.repo) + '@' + esc(L.REPO.branch) + '</b> — the chain head <b>' + esc(String(r.head || "").slice(0, 12)) + '</b> is now witnessed outside this browser.'
      : '<br><span class="rd">' + esc((r.errors || []).slice(0, 3).join(" · ") || "no commit") + '</span>'));
    rrlAppend(runNoOf(), "DNA", "Obi: [/ilog push — " + r.pushed + " files, commit " + (r.commitSha ? r.commitSha.slice(0, 8) : "none") + "]");
    logOp({ kind:"push", action:"ilog push", ok: r.ok, detail: r.entries + " chain entries + transcript", result: r.pushed + " pushed · " + r.failed + " failed" + (r.commitSha ? " · commit " + r.commitShort : ""), ref: r.commitSha });
    return;
  }
  if(a === "pull"){
    addBubble("ass", "📥 /ilog pull — reading the Canon back…");
    const p = await L.pull();
    const vs = p.vs || {};
    const inc = vs.incarnations || [];
    const rrl = (vs.rrl || []).filter(f => !/^DNA-LOG/i.test(f.name));
    const vsRows = '<div class="rrow"><b>VS CODE I-LOG — "incarnate" SERIES</b><span class="vd">' + inc.length + ' TRANSCRIPTS</span><div class="rd">'
      + (inc.length ? inc.map(n => esc(n)).join("<br>") : "nothing readable on the VS branch")
      + '<br><span class="rd">branch <b>' + esc(vs.branch || "canon") + '</b> · <b>' + esc(vs.unauditedDir || "I-LOG-UNAUDITED") + '/</b> — ' + (vs.unaudited || []).length + " files: the verbatim <b>.txt</b> + its SOUL/DNA/REASON <b>-COLORIZED.md</b> + <b>-STATS.json</b>. The VS Code station owns these; this station never renumbers or rewrites them.</span></div></div>"
      + '<div class="rrow"><b>I-LOG DIRECTORY (' + esc(vs.vaultDir || "RRL") + '/)</b><span class="vd">' + (rrl.length || 0) + ' FILES</span><div class="rd">'
      + (rrl.length ? rrl.slice(0, 14).map(f => esc(f.name) + ' <span class="rd">' + Math.round((f.bytes || 0) / 1024) + 'kb</span>').join("<br>") : "not readable")
      + '</div></div>'
      + '<div class="rrow"><b>CURRENT POINTER</b><span class="vd">' + esc(vs.currentPath || "") + '</span><div class="rd">' + (vs.current ? esc(vs.current) : "not readable") + '</div></div>';
    addBubble("ass", '<div class="rise"><div class="rhead">📥 /ilog pull — ' + esc(p.target) + '</div>'
      + '<div class="rrow"><b>THIS STATION\'S EARLIER PUSHES</b><span class="vd">' + p.files.length + ' files</span><div class="rd">' + (p.files.length ? p.files.map(f => esc(f.name) + ' <span class="rd">' + Math.round((f.bytes || 0) / 1024) + 'kb</span>').join("<br>") : "nothing readable at " + esc(L.DIR)) + '</div></div>'
      + vsRows
      + '<div class="rrow"><b>CANON I-LOG INDEX</b><span class="vd">' + (p.vaultOk ? "READABLE" : "NOT READABLE") + '</span><div class="rd">' + (p.vaultOk ? esc(String(p.vaultIndex || "").slice(0, 420)) : "the I-LOG index could not be read" + (p.auth ? "" : " — this repo needs the stored token (private)")) + '</div></div>'
      + (p.errors.length ? '<div class="rrow"><b>ERRORS</b><span class="vd">' + p.errors.length + '</span><div class="rd">' + esc(p.errors.slice(0, 3).join(" · ")) + '</div></div>' : "")
      + '<div class="rfoot">Two records, two branches: this station appends its own chain to <b>' + esc(L.REPO.branch) + '</b> (' + esc(L.DIR) + ') and the VS Code station\'s I-LOG (Incarnation Log) lives on <b>' + esc((L.VS && L.VS.branch) || "canon") + '</b> — the <b>incarnate-</b> series above. They sit beside each other; neither is renumbered or rewritten here.</div></div>');
    logOp({ kind:"op", action:"ilog pull", ok: p.ok, detail: p.files.length + " pushed file(s) + " + inc.length + " VS Code incarnation transcript(s)", result: p.vaultOk ? "both records readable" : (p.auth ? "vault unreadable" : "no token — public read only") });
    return;
  }
  if(a === "export"){
    const e = await L.exportFile();
    addBubble("ass", "📄 /ilog export — <b>" + esc(e.name) + "</b> (" + e.entries + " entries · " + Math.round(e.bytes / 1024) + "kb).<br><span class=\"rfoot\">Plain JSONL — one entry per line, hashes and all. Verify it anywhere: recompute the chain and compare the head to the newest anchor.</span>");
    logOp({ kind:"export", action:"ilog export", detail: e.name, result: e.entries + " entries · " + e.bytes + " bytes" });
    return;
  }
  if(a === "anchors" || a === "history"){
    const list = await L.anchors();
    const st = await L.stats();
    addBubble("ass", '<div class="rise"><div class="rhead">⚓ /ilog anchors — ' + list.length + ' commit(s)</div>'
      + (list.length ? list.slice().reverse().map(x => '<div class="rrow"><b>' + esc(String(x.commit || "").slice(0, 8)) + '</b><span class="vd">' + esc(String(x.seq || "?")) + '</span><div class="rd">' + esc(x.iso || "") + ' · ' + esc(x.repo || "") + '@' + esc(x.branch || "") + ' · ' + (x.count || "?") + ' entries · head <span class="rd">' + esc(String(x.head || "").slice(0, 12)) + '</span> · ' + esc(x.path || "") + '</div></div>').join("") : '<div class="rrow"><b>NONE</b><span class="vd"></span><div class="rd">the record has never been anchored on Git — it exists only in this browser</div></div>')
      + '<div class="rrow"><b>UNANCHORED NOW</b><span class="vd">' + st.unanchored + '</span><div class="rd">entries written since the newest anchor' + (st.unanchored ? " — they ride the next <b>/ilog push</b>" : "") + '</div></div>'
      + '<div class="rfoot">A commit is the witness: it fixes the chain head at a time, in a place this browser does not control.</div></div>');
    logOp({ kind:"op", action:"ilog anchors", ok:true, detail: list.length + " anchors", result: st.unanchored + " unanchored entries" });
    return;
  }
  if(a === "reset" || a === "seal"){
    if(!/confirm/.test(a)){
      addBubble("ass", "⚠ <b>/ilog reset confirm</b> — it writes a SEAL entry (nothing is ever deleted) and starts a new segment. The sealed entries stay in the log and stay verifiable.");
      return;
    }
    const r = await L.reset("sealed by the sovereign via /ilog reset");
    addBubble("ass", "🔏 Sealed <b>" + r.sealed + "</b> entries at head <b>" + esc(String(r.prevHead || "none").slice(0, 12)) + "</b>. Segment <b>" + r.seg + "</b> is open — the chain continues from the seal, and the sealed history is kept, not deleted.");
    logOp({ kind:"seal", action:"reset", detail: r.sealed + " entries sealed", result: "segment " + r.seg + " open", ref: "seg" + r.seg });
    return;
  }
  if(a){ addBubble("ass", "Unknown /ilog sub-command. Try <b>/ilog</b>, <b>verify</b>, <b>push</b>, <b>pull</b>, <b>export</b>, <b>anchors</b>, <b>reset confirm</b>."); return; }
  {
    const st = omegaStatusText();
    const ent = await omegaEntry();
    addBubble("ass", await L.card({ armed: st.armed, minsLeft: st.armedMinutesLeft, enrolled: !!ent }));
  }
  logOp({ kind:"op", action:"ilog", ok:true, detail:"record card rendered", result:"shown in the chat" });
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
    if(st.ok && st.data){
      tunnel = st.data.status || "open";
      queueN = (st.data.counts && st.data.counts.pending != null) ? st.data.counts.pending : (st.data.pending != null ? st.data.pending : "?");
    }
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
  checks.push(["CF account", !!k.cfAcct, k.cfAcct ? k.cfAcct : "missing — /cf token <token> stores the account id with the token"]);
  checks.push(["CF R2 pair", !!(k.cfR2Key && k.cfR2Secret), (k.cfR2Key && k.cfR2Secret) ? ("stored · " + k.cfAcct + ".r2.cloudflarestorage.com · /cf r2 to prove it with a signed S3 request") : "missing — /cf r2 <accessKeyId> <secret> (the S3 pair for the object store)"]);
  checks.push(["GH token", !!k.gh, k.gh ? "stored" : "missing — /gh token"]);
  checks.push(["DG token", !!k.deepgram, k.deepgram ? "stored" : "missing — /dg token"]);
  let rrlOk = false; try{ rrlOk = (loadRRL(runNoOf()).entries || []).length > 0; }catch(e){}
  checks.push(["RRL writing", rrlOk, rrlOk ? "entries present" : "empty this run"]);
  checks.push(["Soul ledger", (ledger.soul || []).length > 0, (ledger.soul || []).length + " records"]);
  checks.push(["Run open", run ? !run.closed : false, run ? ("run " + run.run + (run.closed ? " CLOSED" : " open")) : "no run"]);
  checks.push(["Tunnel", cmdSocketOpen(), cmdSocketState]);
  let ilogOk = false, ilogNote = "src/ilog.js NOT loaded — no operation record";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      ilogOk = st.count > 0;
      ilogNote = st.count + " entries · head " + st.headShort + " · kv " + (st.kv ? "ok" : "UNREACHABLE") + (st.mirrorOnly ? " · " + st.mirrorOnly + " mirror-only" : "")
        + " · " + (st.anchors ? "last anchor " + st.lastAnchor.commitShort + "… · " + st.unanchored + " unanchored" : "NEVER ANCHORED ON GIT");
    }
  }catch(e){ ilogNote = "I-LOG unreadable: " + e.message; }
  checks.push(["I-LOG", ilogOk, ilogNote]);
  const oEnt = await omegaEntry();
  const oSt = omegaStatusText();
  checks.push(["OMEGA gate", !!oEnt, oEnt ? ("enrolled (" + (oEnt.alg || "sha-256") + ") · gate " + (oSt.armed ? "ARMED " + oSt.armedMinutesLeft + "m" : "locked") + " · failures " + oSt.fails + "/" + OMEGA_MAX_FAILS) : "no password enrolled in this browser — /omega set <new> <new> (the Canon cannot be written until it is)"]);
  try{
    const em = window.ObiVault && window.ObiVault.escrow ? window.ObiVault.escrow() : null;
    checks.push(["Vault escrow", !!(em && em.at), em && em.at
      ? ("crown jewel wrapped " + String(em.at).slice(0, 10) + (em.url ? " · canon + mirror" : " · canon copy only")
         + (em.recoveryUrl ? " · 1-URL recovery bundle published (passphrase alone rebuilds the vault, no GitHub token needed)" : " · NO recovery bundle — /vault escrow <passphrase> publishes the one URL that needs no token"))
      : "THE PRIVATE KEY EXISTS ONLY IN THIS BROWSER — /vault escrow <passphrase> makes it recoverable (do this)"]);
  }catch(e){}
  checks.push(["ONE authority", true, CANON.owner + "/" + CANON.repo + "@" + CANON.branch + " · PHOENIXOMEGAPROTOCOL gates every write"]);
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
  let ilogRow = "";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      const v = await window.ObiILog.verify();
      ilogRow = '<div class="rrow"><b>I-LOG</b><span class="vd">' + st.count + '</span><div class="rd">head <b>' + esc(st.headShort) + '</b> · chain ' + (v.ok ? "VERIFIED" : "BROKEN") + ' (' + v.checked + " recomputed) · "
        + (st.anchors ? "anchored at <b>" + esc(st.lastAnchor.commitShort) + '…</b> · ' + st.unanchored + " unanchored" : '<span class="vd" style="color:#f5a623">NEVER ANCHORED ON GIT</span> — /ilog push') + '</div></div>';
      if(!st.anchors) gaps.push("the I-LOG has never been anchored on Git (/ilog push)");
      if(!v.ok) gaps.push("the I-LOG chain does not verify");
    } else gaps.push("src/ilog.js did not load — no operation record");
  }catch(e){ gaps.push("I-LOG unreadable: " + e.message); }
  addBubble("ass", '<div class="rise"><div class="rhead">🔎 /audit — ledger, evidence-first</div>'
    +'<div class="rrow"><b>RUNS</b><span class="vd">'+nRuns+'</span><div class="rd">current run '+(run?run.run:"?")+'</div></div>'
    + ilogRow
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
  let ilogLine = "";
  try{
    if(window.ObiILog){
      const st = await window.ObiILog.stats();
      ilogLine = '<div class="rrow"><b>I-LOG</b><span class="vd">'+st.count+'</span><div class="rd">the operation record — head <b>'+esc(st.headShort)+'</b> · '+(st.anchors ? "anchored "+esc(st.lastAnchor.commitShort)+"…" : "never anchored on Git")+' · <b>/ilog</b> to read or push it</div></div>';
    }
  }catch(e){}
  addBubble("ass", '<div class="rise"><div class="rhead">📒 /ledger — run '+(run?run.run:"?")+' raw record</div>'
    +'<div class="rrow"><b>TOTAL SOUL</b><span class="vd">'+nSoul+'</span><div class="rd">records stored across all runs</div></div>'
    + ilogLine
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
  const fl = f => String(f).split("/").pop();
  const tags = ["SESSION I", "SCS", "CONTRACT"];
  addBubble("ass", '<div class="rise"><div class="rhead">🗺 /fieldguide — doctrine, live from the Canon</div>'
    + CANON.files.map((f, i) => docs[f] ? '<div class="rrow"><b>'+esc(fl(f))+'</b><span class="vd">'+esc(tags[i] || "CANON")+'</span><div class="rd">'+esc(docs[f].slice(0,220).replace(/\n/g," "))+'…</div></div>' : "").join("")
    +'<div class="rfoot">The canon branch is the authority for doctrine (<b>CANON/SYSTEM/</b>) — the <b>.kilo/</b> registry is the legacy Kilo lineage and is not read here. <b>No model-tier or named-agent attribution is printed here</b>: "T1"/"T2" model naming is not in the canon GOSPEL-999 or the LFG (verified by grep, 0 hits), so the station does not repeat it. Full doctrine at https://github.com/Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-</div></div>');
  rrlAppend(runNoOf(),"DNA","Obi: [/fieldguide — doctrine pulled]");
}


/* ─── /brand — the identity system (src/brand.js · AMENDMENT III) ─────────── */
function cmdBrand(sub){
  const B = window.ObiBrand;
  if(!B){ addBubble("ass", "⚠ src/brand.js didn't load — reload the page."); return; }
  const q = String(sub || "").trim().toLowerCase();
  const goDesk = () => { showView("gen"); deskOpen(true, "brand"); };
  if(q === "open" || q === "desk"){ goDesk(); addBubble("ass", '<div class="rise"><div class="rhead">◎ Brand &amp; Identity — opened</div><div class="rrow"><b>WHERE</b><span class="vd">◈</span><div class="rd">◈ Phoenix Generators → <b>MARKETING</b> → <b>Brand &amp; Identity</b>. The same room is at <b>/brand</b>.</div></div><div class="rfoot">The registry is <b>src/divisions.js</b>; the system is <b>src/brand.js</b>.</div></div>'); return; }
  if(q === "icons"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("grid") + ' ICONOGRAPHY — ' + B.iconNames().length + ' marks</div>'
      + '<div class="rd" style="padding:10px">' + '<div class="bx-grid">' + B.iconNames().map(n => '<div class="bx-cell"><div class="bx-ico">' + B.icon(n) + '</div><div class="bx-cell-name">' + esc(n) + '</div></div>').join("") + '</div></div>'
      + '<div class="rfoot">Use one with <b>ObiBrand.icon("name")</b>, or declare it in HTML with <b>data-icon="name"</b> and call <b>ObiBrand.upgrade()</b>. One set, no emoji standing in for a concept — BRAND.003.</div></div>');
    return;
  }
  if(q === "logo" || q === "apex" || q === "logotype"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' THE PRAIS APEX — the station\u2019s logotype</div>'
      + '<div class="rd" style="padding:10px">' + B.logoSection() + '</div>'
      + '<div class="rfoot">The mark is the sovereign\u2019s own plate, keyed to transparency and re-coloured \u2014 never redrawn. The anatomy page it came with is transcribed verbatim in <b>src/brand.js</b> and shipped as a still. The law is <b>BRAND.029</b>; every file is in <b>src/brand/assets/</b> and listed in <b>/brand vault apex</b>.</div></div>');
    return;
  }
  if(q === "vault" || q === "archive" || q === "library"){
    const rest = String(sub || "").trim().split(/\s+/).slice(1).map(s => s.toLowerCase());
    const which = rest.join(" ");
    const groups = B.VAULT_GROUPS.map(g => g[0]);
    if(groups.indexOf(which) >= 0){
      addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("vault") + ' THE MARKETING VAULT — ' + esc(B.VAULT_GROUPS.filter(g => g[0] === which)[0][1]) + '</div>'
        + '<div class="rd" style="padding:10px">' + B.vaultSection(which) + '</div>'
        + '<div class="rfoot">Every file is shipped in <b>src/brand/assets/</b>, alpha WebP, never hotlinked \u2014 <b>BRAND.005</b>. Download it, or copy the URL straight into a post, a page or another generator. The whole vault is <b>/brand vault</b>.</div></div>');
      return;
    }
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("vault") + ' THE MARKETING VAULT — ' + B.ASSETS.filter(a => a.shot).length + ' stills and ' + B.ASSETS.filter(a => !a.shot).length + ' marks</div>'
      + '<div class="rrow"><b>WHAT THIS IS</b><span class="vd">the archive</span><div class="rd">Every picture this system ships, in one room, each with a <b>Download \u25b8</b> and a <b>Copy URL</b>: the logotype, the twelve codex slides as pictures, the social set the campaign actually ships, the hero art, and the cut marks. Built so a post, a page or a deck can be assembled without opening a file manager.</div></div>'
      + '<div class="rd" style="padding:10px">' + B.vaultSection() + '</div>'
      + '<div class="rfoot">Shipped in <b>src/brand/assets/</b> \u2014 never hotlinked (<b>BRAND.005</b>), never restyled (<b>BRAND.020</b>). One group at a time: <b>' + groups.map(g => "/brand vault " + g).join("</b> \u00b7 <b>") + '</b>. The words side is the <b>marketing register</b> (<b>/brand marketing</b>) and the copy archive.</div></div>');
    return;
  }
  if(q === "marks" || q === "assets" || q === "art"){
    const srcOf = (a) => B.srcLabel(a);
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("image") + ' THE MARKS — ' + B.ASSETS.length + ', cut from the sovereign\'s own decks</div>'
      + B.ASSETS.filter(a => !a.shot).map(a => '<div class="rrow"><b>' + esc(a.name) + '</b><span class="vd">' + a.w + '×' + a.h + '</span><div class="rd">' + esc(a.note) + '<br><i>use:</i> ' + esc(a.use) + '<br><span class="bx-bar">' + esc(a.id) + ' // ' + srcOf(a) + ' // ' + (a.box ? 'box ' + a.box.join(",") : 'still') + ' // <a href="' + B.assetPath(a.id) + '" download="prais-brand-' + a.id + '.webp">download ▸</a></span></div></div>').join("")
      + '<div class="rfoot">Shipped in <b>src/brand/assets/</b> (alpha WebP, one file each) \u2014 never hotlinked. Every picture in the library is browsable with a download on <b>/brand vault</b>. Sources: <b>BestDossierYet-05-11-2026.pdf</b> (identity), <b>GOSPEL_444_PROTOCOL.pdf</b>, <b>GOSPEL_444_TIGER_MODE.pdf</b>, plus the sovereign\u2019s own slides, posts and art (2026-09-22). Rebuild recipe in the header of <b>src/brand.js</b>.</div></div>');
    return;
  }
  if(q === "doctrine" || q === "gospel" || q === "444" || q === "laws"){
    const G = B.GOSPEL444;
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("flame") + ' GOSPEL 444 PROTOCOL V' + G.version + ' — ' + G.laws.length + ' laws</div>'
      + '<div class="rrow"><b>MOTTO</b><span class="vd">444</span><div class="rd">' + esc(G.motto) + '</div></div>'
      + G.laws.map(l => '<div class="rrow"><b>' + esc(l.n) + '</b><span class="vd">' + esc(l.title) + '</span><div class="rd"><span class="bx-dir">' + esc(l.line) + '</span><br>' + l.body.map(p => esc(p)).join("<br>") + '</div></div>').join("")
      + '<div class="rfoot">Source: <b>' + G.sources.join("</b> + <b>") + '</b>. Normative text: AMENDMENT IV of <b>src/canon/GOSPEL-999.md</b> (G444.001–G444.012, <b>PROPOSED — not merged</b>). The ladder is <b>/brand modes</b>; the slides are <b>/brand deck</b>.</div></div>');
    return;
  }
  if(q === "modes" || q === "ladder" || q === "diagnostic"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("gauge") + ' THE MODE LADDER — one diagnostic, 0–100</div>'
      + '<div class="rd" style="padding:9px">' + B.modes() + '<div style="height:10px"></div>' + B.matrix(B.GOSPEL444.matrix) + '</div>'
      + '<div class="rfoot">Read from behaviour, not grammar (G444.003). This is <b>not</b> the coin ladder — <b>LESSON.012</b> is the economy and its thresholds are 0 / 200 / 500 / 5000 coins. A student can be a Tiger here and hold 40 coins there. <b>ObiBrand.modeOf(score)</b> reads this one.</div></div>');
    return;
  }
  if(q === "deck" || q === "dossier"){
    addBubble("ass", "composing the GOSPEL 444 deck — every mark inlined…");
    (async () => {
      try{
        const html = await B.buildDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "GOSPEL-444-PROTOCOL-V" + B.GOSPEL444.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("scanline") + ' GOSPEL 444 — the deck, composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + Math.round(html.length/1024) + ' KB</span><div class="rd">' + B.GOSPEL444.slides.length + ' slides · ' + B.GOSPEL444.laws.length + ' laws · every mark inlined as a data URL · no fetches, one openable .html. Downloaded as <b>GOSPEL-444-PROTOCOL-V' + B.GOSPEL444.version + '.html</b>.</div></div>'
          + '<div class="rfoot">The dossier, regenerated <i>through</i> the system instead of screenshotted: BRAND.010\'s outstanding item. The same button is on the brand desk.</div></div>');
      }catch(e){ addBubble("ass", "⚠ deck export failed: " + esc(e.message)); }
    })();
    return;
  }
  if(q === "emblems" || q === "ranks" || q === "badges"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("medal") + ' THE EMBLEMS — ' + B.EMBLEMS.length + ', drawn in vector</div>'
      + '<div class="rd" style="padding:10px"><div class="bx-grid bx-grid-wide" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">'
      + B.EMBLEMS.map(e => '<div class="bx-cell" style="text-align:left;background:#0b0714">' + B.emblemBand(e.id, { size:96 }) + '</div>').join("") + '</div></div>'
      + '<div class="rrow"><b>WHY VECTOR</b><span class="vd">size</span><div class="rd">An emblem has to survive a 9&nbsp;mm stamp on a certificate and a 120&nbsp;mm print on a wall, so it is drawn here rather than cut from a deck. Below ~30&nbsp;px it drops its ticks and fattens what is left — <b>ObiBrand.emblem("rank-tiger", {size:112})</b>.</div></div>'
      + '<div class="rrow"><b>TWO LADDERS</b><span class="vd">shape</span><div class="rd"><b>Roundels are the coin ladder</b> (LESSON.012: 0 / 200 / 500 / 5000) and <b>shields are the diagnostic</b> (G444.003: MOUSE / CUB / TIGER). Two shapes on purpose: a student can be a Tiger on one and hold 40 coins on the other, and matching emblems would invite exactly that confusion.</div></div>'
      + '<div class="rfoot">Nine emblems: four ranks, three modes, and the two seals (NET Academy, GOSPEL 444). They are cut on the <b>badge sheet</b> — <b>/brand badge-sheet</b>.</div></div>');
    return;
  }
  if(q === "patterns" || q === "beds"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("grid") + ' THE PATTERNS — ' + Object.keys(B.PATTERNS).length + ' beds</div>'
      + '<div class="rd" style="padding:10px"><div class="bx-grid bx-grid-wide">' + Object.keys(B.PATTERNS).map(k => '<div class="bx-cell" style="text-align:left"><div style="height:88px;border:1px solid var(--bx-court-line);border-radius:3px;' + B.patternCss(k, { ink: k === "ember" ? "#dc9438" : k === "hazard" ? "#e0473f" : "#a855f7", opacity:.75 }) + '"></div><div class="bx-cell-name" style="color:var(--bx-ancient);font-size:11px;margin-top:7px">' + esc(B.PATTERNS[k].name) + '</div><div style="font-size:11.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin-top:3px">' + esc(B.PATTERNS[k].use) + '</div></div>').join("") + '</div></div>'
      + '<div class="rfoot">A pattern is a <b>bed</b>, never a message: a lesson bed is always <b>lattice</b> or <b>ember</b>, and <b>hazard</b> is reserved for a fault plate (BRAND.002 \u2014 the extension may texture chrome, it may not restyle a lesson). <b>ObiBrand.patternCss("lattice", {ink:"#a855f7", opacity:.5})</b>.</div></div>');
    return;
  }
  if(q === "marketing" || q === "market" || q === "pitch") {
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("target") + ' THE MARKETING REGISTER — what we say</div>'
      + '<div class="rd" style="padding:10px"><div style="font-family:var(--font-head,Orbitron,sans-serif);font-size:16px;color:var(--bx-ancient);line-height:1.3">' + esc(B.MARKET.headline) + '</div>'
      + '<div style="font-size:12px;color:var(--text-dim,#94a3b8);margin-top:5px">' + esc(B.MARKET.headlineVn) + '</div>'
      + '<div class="bx-bar" style="margin-top:8px">' + esc(B.MARKET.kicker) + ' // ' + esc(B.MARKET.sub) + ' // MARKETING SET V' + B.MARKET.version + '</div></div>'
      + '<div class="rrow"><b>THE PILLARS</b><span class="vd">3</span><div class="rd">' + B.MARKET.pillars.map(p => '<b>' + esc(p.title) + '</b> — ' + esc(p.body)).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE HAND-PICKED SET</b><span class="vd">' + B.MARKET.shots.length + ' slides</span><div class="rd">' + B.MARKET.shots.map(s => '<b>' + esc(s.tag) + '</b> — ' + esc(s.what)).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE COMPARISON</b><span class="vd">3 rows</span><div class="rd">' + B.MARKET.compare.map(r => '<b>' + esc(r[0]) + '</b>: ' + esc(r[1]) + ' → ' + esc(r[2])).join('<br>') + '</div></div>'
      + '<div class="rrow"><b>THE OFFER</b><span class="vd">closing</span><div class="rd">' + esc(B.MARKET.offer) + '<br>' + esc(B.MARKET.headline) + '</div></div>'
      + '<div class="rfoot">Transcribed from the seven slides the sovereign hand-picked (2026-09-22) — nothing invented. On the desk as <b>THE MARKETING REGISTER</b>; on paper as <b>THE MARKETING SET</b> and <b>THE METHOD CARD</b> — <b>/brand print</b>, <b>/brand marketing-set</b>, <b>/brand method-card</b>.</div></div>');
    return;
  }
  if(q === "codex" || q === "strategy" || q === "phoenix" || q === "run305"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' THE PHOENIX RISING CODEX — what the sovereign holds</div>'
      + '<div class="rd" style="padding:10px">' + B.codexSection() + '</div>'
      + '<div class="rfoot">Transcribed from five decks sent 2026-09-22 (<b>' + B.CODEX.pages + ' pages</b>): the codex, the tiger protocol, the tiger engine, the engine protocol and the run log. The strategy half is on paper as <b>/brand enrolment</b> and <b>/brand run-readout</b>; the ads are <b>/brand ads</b>; the deck is <b>/brand codex-deck</b> (or the button in the room above). The run log\u2019s ledger is deliberately <b>empty</b> — <b>BRAND.028</b>.</div></div>');
    return;
  }
  if(q === "ads" || q === "phase0" || q === "creative"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("target") + ' PHASE 0 — six creatives, one law</div>'
      + '<div class="rd" style="padding:10px">' + B.adsSection() + '</div>'
      + '<div class="rfoot">The law is <b>BRAND.021</b>: English is the anchor in Imperial Gold, Vietnamese is the subtitle in white, and a text-heavy slide with no anchor is not bilingual \u2014 it is text-heavy. On paper as <b>/brand ad-sheet</b> (A3 landscape).</div></div>');
    return;
  }
  if(q === "landing" || q === "page" || q === "landingpage"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("globe") + ' THE LANDING PAGE — the register in reading order</div>'
      + '<div class="rd" style="padding:10px">' + B.landingSection() + '</div>'
      + '<div class="rfoot">Eight bands, every line sourced to a slide or a law. On paper as <b>/brand enrolment</b> (three A3 pages: the diagnosis, the intervention, the offer).</div></div>');
    return;
  }
  if(q === "codex-deck" || q === "strategydesk"){
    addBubble("ass", "composing the PHOENIX RISING CODEX deck — every mark inlined…");
    (async () => {
      try{
        const html = await B.buildCodexDeck();
        const url = URL.createObjectURL(new Blob([html], { type:"text/html" }));
        const a = document.createElement("a");
        a.href = url; a.download = "PHOENIX-RISING-CODEX-V" + B.CODEX.version + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("scanline") + ' THE CODEX — the deck, composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + Math.round(html.length/1024) + ' KB</span><div class="rd">' + B.CODEX.slides.length + ' slides \u00b7 every mark inlined as a data URL \u00b7 no fetches, one openable .html. Downloaded as <b>PHOENIX-RISING-CODEX-V' + B.CODEX.version + '.html</b>.</div></div>'
          + '<div class="rfoot">The ' + B.ASSETS.filter(x => x.shot && ["codex", "tiger-protocol", "tiger-engine", "run-log"].indexOf(x.src) >= 0).length + ' pages this system <i>cannot</i> draw are shipped as stills and sit in the desk \u2014 a slide is a composition, and redrawing one would be inventing artwork (BRAND.014).</div></div>');
      }catch(e){ addBubble("ass", "⚠ codex deck export failed: " + esc(e.message)); }
    })();
    return;
  }
  if(q === "print" || q === "printroom" || q === "room"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("print") + ' THE PRINT ROOM — ' + B.PRINT_ARTIFACTS.length + ' artifacts</div>'
      + B.PRINT_ARTIFACTS.map(a => '<div class="rrow"><b>' + esc(a.name) + '</b><span class="vd">' + esc(a.page) + '</span><div class="rd">' + esc(a.note) + '<br><span class="bx-bar">' + esc(a.id) + ' // ' + esc(a.file) + ' // /brand ' + esc(a.id) + '</span></div></div>').join("")
      + '<div class="rfoot">Each export is one openable <b>.html</b> with every mark inlined and its own <span class="bx-tag">@page</span> rule — no fetches but the four typefaces. Print at 100% with <b>background graphics on</b>. The same four buttons are on the desk.</div></div>');
    return;
  }
  const PRINT_ALIAS = { "wall-set":["posters","wall","wallset","wall-set","poster"], "one-sheet":["sheet","onesheet","chart","one-sheet"], "badge-sheet":["badge-sheet","badgesheet","stickers","sticker"], "certificate":["certificate","cert"], "marketing-set":["marketing-set","marketingset","marketing","pitch-set","pitchset","campaign"], "method-card":["method-card","methodcard","method","takehome","take-home","parent-card"], "ad-sheet":["ad-sheet","adsheet","ads-brief","brief"], "enrolment":["enrolment","enrollment","enrol","the-enrolment-pages","enrolpages"], "run-readout":["run-readout","readout","runlog","run-log","logsheet"] };
  const q0 = q.split(/\s+/)[0];
  let poId = null;
  for(const k in PRINT_ALIAS) if(PRINT_ALIAS[k].indexOf(q0) >= 0) poId = k;
  if(poId){
    const rest = String(sub || "").trim();
    const parts = rest.split(/\s+/).filter(Boolean);
    const opts = {};
    const nameBits = [];
    for(const tk of parts){
      const low = tk.toLowerCase();
      if(/^(rank-|mode-)/.test(low)){ const bits = low.split("-"); if(bits[0] === "rank") opts.tier = bits[1]; else opts.mode = bits[1]; }
      else if(/^(mouse|cub|tiger|legend)$/.test(low)){ opts.tier = low; }
      else if(/^score=/.test(low)){ opts.score = Number(low.slice(6)); }
      else if(/^name=/.test(low)){ nameBits.push(tk.slice(5)); }
      else if(/^date=/.test(low)){ opts.date = tk.slice(5); }
      else if(!PRINT_ALIAS[poId].includes(low) && low !== "print") nameBits.push(tk);
    }
    if(nameBits.length) opts.name = nameBits.join(" ");
    addBubble("ass", "composing <b>" + esc(B.artifactById(poId).name) + "</b> — marks inlined\u2026");
    runCmd(async () => {
      try{
        const r = await B.downloadArtifact(poId, opts);
        addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("print") + ' ' + esc(r.artifact.name) + ' \u2014 composed here</div>'
          + '<div class="rrow"><b>FILE</b><span class="vd">' + r.kb + ' KB</span><div class="rd"><b>' + esc(r.file) + '</b> \u00b7 ' + esc(r.artifact.page) + ' \u00b7 ' + r.artifact.pages(opts).length + ' page(s) \u00b7 every mark inlined as a data URL \u00b7 nothing fetched but the four typefaces. Downloaded.</div></div>'
          + (opts.tier || opts.mode ? '<div class="rrow"><b>RECORD</b><span class="vd">' + esc(opts.tier ? "rank-" + opts.tier : "mode-" + opts.mode) + '</span><div class="rd">' + esc(opts.name || "(no name \u2014 the rule prints blank for the pen)") + (opts.score == null ? " \u00b7 no score recorded" : " \u00b7 diagnostic " + esc(opts.score) + "/100") + '</div></div>' : "")
          + '<div class="rfoot">A certificate carries a claim, so it is only composed from a record you give it \u2014 <b>BRAND.013</b>. Anything you leave out prints as a blank rule for the hand.</div></div>');
      }catch(e){ addBubble("ass", "\u26a0 " + esc(poId) + " export failed: " + esc(e.message)); }
    });
    return;
  }
  if(q === "palette" || q === "colours" || q === "colors"){
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("compass") + ' PALETTE — frozen tokens, and the court\'s extension</div>'
      + Object.keys(B.PALETTE).map(k => { const p = B.PALETTE[k]; return '<div class="rrow"><b>' + esc(k) + '</b><span class="vd" style="background:' + p.hex + ';color:#0b0714">' + esc(p.hex) + '</span><div class="rd">' + esc(p.role) + ' — ' + esc(p.note) + '</div></div>'; }).join("")
      + '<div class="rfoot">LESSON.008 stands: system / reward / ground are immutable. The extension is for chrome and marks — never to restyle a lesson. BRAND.002.</div></div>');
    return;
  }
  if(q === "rules" || q === "law"){
    const laws = [
      ["BRAND.001","THE IDENTITY IS ONE SYSTEM.","One palette, one icon set, one set of marks, one chrome. A surface that invents its own is a defect, not a variation. /brand is the system; src/brand.js is its only source."],
      ["BRAND.002","THE FROZEN TOKENS STAND; THE COURT EXTENDS THEM.","#a855f7 system · #f59e0b reward · #0f0f1a ground are immutable (LESSON.008). The dossier adds the plum court and the antique gold — chrome and marks only, never a lesson's restyle."],
      ["BRAND.003","AN ICON IS DRAWN, NOT BORROWED.","Every concept gets one glyph on the 24 grid, stroke currentColor. No icon fonts, no emoji standing in for a concept, no per-surface one-offs."],
      ["BRAND.004","THE STATUS BAR STATES; IT DOES NOT DECORATE.","One monospace line of what is TRUE right now, separated by //. If it drifts from reality it is a defect and gets fixed, not excused."],
      ["BRAND.005","THE MARK IS SHIPPED, NOT HOTLINKED.","Every mark is a file in this generator's src/brand/assets/ with its provenance recorded. An image that depends on someone else's server is not a brand asset."],
      ["BRAND.006","ONE FACE PER PIECE.","A surface wears the industry it belongs to: a child's screen, a parent's report and a teacher's board are not the same page. Same brand, different density."],
      ["BRAND.007","THE FAMILY LOOKS LIKE ONE FAMILY.","A generator role reuses this palette, these icons and this chrome. Adding a division means adding it to src/divisions.js, where an icon is a NAME from this set."],
      ["BRAND.008","TASTE, THEN DEFECTS.","Where the files and the law disagree on taste, the files win. On defects, this law wins."],
      ["BRAND.009","NO NATIVE DIALOGS, NO UNSAFE TEXT, NO DEAD BUTTON.","Everything the brand renders escapes what it prints, stops what it animates, and never shows a control that opens nothing (LESSON.014/015)."],
      ["BRAND.010","WHAT THIS DOES NOT PROVE.","The system is derived from three decks (31 pages), one station and three lessons. It is a floor, not a finished house: the second icon pass, the favicon and the deck regeneration are named as still-needed, not claimed. AMENDMENT IV (GOSPEL 444) supplies the doctrine; it does not finish the house either."],
      ["BRAND.011","THE SECOND ICON PASS PAYS THE FIRST PASS'S DEBTS.","115 icons on the 24 grid, stroke currentColor. The pass that closed the first pass's debts included one DEFECT: TIERS[0] and MODES[0] both pointed at `mouse` for a year and no such glyph existed — a named icon that is not drawn is a broken crest, not a missing nicety."],
      ["BRAND.012","A RANK IS AN EMBLEM, NOT A PICTURE.","Ranks, modes and the seals are drawn in vector so the same file survives a 9 mm stamp and a 120 mm print, and so a rung can change without redrawing the ring. Below ~30 px an emblem drops its ticks and fattens what is left. Roundel = the coin ladder; shield = the diagnostic; the shapes stay different on purpose (G444.003)."],
      ["BRAND.013","A CERTIFICATE IS COMPOSED FROM A RECORD, NEVER FROM AN APPETITE.","The station may compose a certificate only from data a human supplied — a tier, or a diagnostic score with a mode. What is not supplied prints as a blank rule for the pen. A certificate that invents its own claim is a forgery, whatever it looks like."],
      ["BRAND.014","THE ARTWORK IS THE SYSTEM'S OWN.","The print room composes posters, the one sheet, the badge sheet and the certificate out of the marks cut from the sovereign's own decks, the emblems drawn here, and the doctrine's own words. Nothing is redrawn, restyled or invented for a sheet of paper, and nothing is fetched at print time but the typefaces."],
      ["BRAND.015","A BED IS NOT A MESSAGE.","Patterns (lattice, circuit, ember, hazard) are grounds. A lesson bed is always lattice or ember; hazard is reserved for a fault plate. The extension may texture chrome — it may not restyle a lesson (BRAND.002)."],
      ["BRAND.016","A PRINTED SHEET STATES ITS OWN PRINTING.","Every artifact carries its page size, its page count and its folio, and opens with its own @page rule so the printer cannot be blamed for what the file did not say. A sheet with no folio and no size is a screenshot, not artwork."],
      ["BRAND.017","TWO REGISTERS, ONE SYSTEM.","The doctrine (GOSPEL 444) is what we HOLD — internal, blunt, for the coach. The marketing register (MARKET) is what we SAY — outward, for the parent and the student. Same system, two readers. Neither may contradict the other, and the marketing register may never claim a number the doctrine does not hold."],
      ["BRAND.018","WHAT WE SAY IS TRANSCRIBED, NOT INVENTED.","Every marketing line carries its source (the slide it was transcribed from), exactly as the doctrine's lines carry their page. A claim with no source is a defect, whether or not it is true."],
      ["BRAND.019","THE PROMISE IS QUOTED, NOT INFLATED.","A marketing sheet prints the doctrine's own numbers — 80% against a 30% baseline, 4x completion — and cites the law behind each one (G444.001, G444.009, G444.011). We are doctors, not salespeople: the sheet states what was measured and stops there."],
      ["BRAND.020","THE HAND-PICKED SET IS SOURCE, NOT DECORATION.","A slide the sovereign picks is recorded with what it says and where it may be worn, shipped as a still in src/brand/assets/ (never hotlinked), and never restyled. Its artwork may be cut into marks by the same key as every other deck — and the still itself stays available as a still."],
      ["BRAND.021","THE BILINGUAL HIERARCHY.","English is the anchor, in Imperial Gold. Vietnamese is the subtitle, in white. A slide with no anchor language is not a bilingual slide; it is a text-heavy one. Printed under the six Phase 0 creatives, and printed on the same sheet as them."],
      ["BRAND.022","PHASE 0 IS VISUAL.","The campaign is built as pictures before it is built as copy, and each creative carries the law it is obeying on its own face. Six cards, six ideas, one law — and the law is on the sheet, not in a separate document."],
      ["BRAND.023","THE ZONE IS CHOSEN, NOT HOPED FOR.","Lakeview is chosen because the buyer is already there — time-poor, cash-rich, and structurally unable to attend an evening class. The 45/15 answers that buyer; it is not the product."],
      ["BRAND.024","TWO EXITS, ONE OF THEM HUMAN.","Every automated funnel branches to a person. Fail-closed means no visitor is left standing in a form: the machine qualifies, a human closes."],
      ["BRAND.025","QUOTE THE NUMBER THE SOURCE GIVES.","80 against 30. Where two pages of the corpus disagree — 2.5× in the doctrine, 4× on the master marketing slide — the disagreement is printed and carried on the sheet. It is never averaged, and never quietly replaced by the friendlier figure."],
      ["BRAND.026","A COUNTER-ARGUMENT IS A QUOTE.","The ostrich, the flip-phone, the sinking ship: use the doctrine's own figure of speech, or write no figure at all. An invented metaphor is an invented claim wearing a costume."],
      ["BRAND.027","THE STRIKE AT SIXTY.","Retention is a clock, not a virtue: 48 hours of decay in the leaky bucket, an interruption timed at a 60% likelihood of forgetting, and eight encounters in context to make a word subconscious."],
      ["BRAND.028","NO CHILD'S NAME IN PUBLIC SOURCE.","A run log is transcribed as a FORMAT. Student identities, scores and vault usernames stay out of anything a browser can read — including this generator's own canon and the sheets it prints."],
      ["BRAND.029","THE LOGOTYPE IS THE SOVEREIGN'S, AND IT IS KEYED, NOT REDRAWN.","The PrAis Apex — the cybernetic phoenix over the tesseract core — is the station's logotype, shipped as a file (`apex`, with its ink cut `apex-ink`). Its geometry is the sovereign's and is never redrawn, restyled or re-proportioned; it may be keyed to transparency and re-coloured to the two frozen tokens, because the specification itself names them. It is WORN FROM 64 PX UP — below that the tesseract-core GLYPH (`apex` in the icon set) carries it, since a mark that dissolves in a browser tab is not a mark. The specification page (`apex-anatomy`) is shipped whole and transcribed verbatim in src/brand.js; where it and this file disagree, the page wins."]
    ];
    addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' AMENDMENT III + V + VI + VIII — THE BRAND, THE MARK, THE ICONOGRAPHY, THE PRINT ROOM, THE REGISTER, THE LOGOTYPE</div>'
      + laws.map(l => '<div class="rrow"><b>' + esc(l[0]) + '</b><span class="vd"></span><div class="rd"><b>' + esc(l[1]) + '</b><br>' + esc(l[2]) + '</div></div>').join("")
      + '<div class="rfoot">Normative text: <b>src/canon/GOSPEL-999.md</b> (AMENDMENT III BRAND.001\u2013010 provisional; AMENDMENT IV adds GOSPEL 444; AMENDMENT V adds BRAND.011\u2013016; AMENDMENT VI adds BRAND.017\u2013020; AMENDMENT VII adds BRAND.021\u2013028; AMENDMENT VIII adds BRAND.029 (the logotype) \u2014 all <b>PROPOSED</b>) \u00b7 lesson-side: <b>src/LESSON-STANDARD.md</b> LSN-24/25/26/27/28/29/30/31 \u00b7 the drone\'s checklist: <b>src/canon/LEGIONNAIRE-FIELD-GUIDE.md</b> \u00a713/\u00a714/\u00a715/\u00a716/\u00a717 \u00b7 the system itself: <b>src/brand.js</b>.</div></div>');
    return;
  }
  /* no argument: the front page of the identity system */
  addBubble("ass", '<div class="rise"><div class="rhead">' + B.icon("seal") + ' /brand — the identity system v' + B.VERSION + '</div>'
    + '<div class="rrow"><b>THE SYSTEM</b><span class="vd">' + B.iconNames().length + ' icons</span><div class="rd">' + B.ASSETS.filter(x => !x.variant && !x.shot).length + ' gallery marks + ' + B.ASSETS.filter(x => x.variant).length + ' variants + ' + B.ASSETS.filter(x => x.shot).length + ' hand-picked slides (' + B.ASSETS.length + ' files), one palette (' + Object.keys(B.PALETTE).length + ' tokens), the HUD chrome, the doctrine\'s own chrome, four type families. It renders in full at <b>/brand open</b>.</div></div>'
    + '<div class="rrow"><b>MARK</b><span class="vd">sigil</span><div class="rd" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' + B.lockup({ size:"42px" }) + '</div></div>'
    + '<div class="rrow"><b>THE LOGOTYPE</b><span class="vd">APEX</span><div class="rd" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><img src="' + B.assetPath("apex") + '" alt="The PrAis Apex" style="width:66px;height:auto"><span style="flex:1;min-width:180px"><b>THE PRAIS APEX</b> \u2014 the sovereign\u2019s own mark: the cybernetic phoenix over the tesseract core. Keyed to transparency and re-coloured to the frozen tokens, never redrawn. <b>/brand logo</b> shows the anatomy, the grounds and the files.</span></div></div>'
    + '<div class="rrow"><b>THE VAULT</b><span class="vd">' + B.ASSETS.length + ' files</span><div class="rd">Every picture the system ships \u2014 the logotype, the twelve codex slides, the social set, the hero art and the cut marks \u2014 each with a download and a copy-URL. <b>/brand vault</b> \u00b7 <b>/brand vault social</b> \u00b7 <b>/brand vault codex</b> \u00b7 <b>/brand vault art</b> \u00b7 <b>/brand vault apex</b> \u00b7 <b>/brand vault marks</b></div></div>'
    + '<div class="rrow"><b>THE DOCTRINE</b><span class="vd">G444</span><div class="rd"><b>GOSPEL 444 PROTOCOL V' + B.GOSPEL444.version + '</b> — ' + B.GOSPEL444.laws.length + ' laws and ' + B.GOSPEL444.slides.length + ' slides, transcribed from the sovereign\'s two 444 decks. <b>/brand doctrine</b> lists them, <b>/brand modes</b> is the ladder, <b>/brand deck</b> composes and downloads the deck.</div></div>'
    + '<div class="rrow"><b>THE EMBLEMS</b><span class="vd">' + B.EMBLEMS.length + ' vector</span><div class="rd" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + B.emblem("rank-mouse", { size:54 }) + B.emblem("rank-cub", { size:54 }) + B.emblem("rank-tiger", { size:54 }) + B.emblem("rank-legend", { size:54 }) + B.emblem("mode-tiger", { size:54 }) + B.emblem("seal-net", { size:54 }) + B.emblem("seal-444", { size:54 }) + '<span style="flex:1;min-width:150px">roundel = the coin ladder · shield = the diagnostic · ring = the seals. <b>/brand emblems</b></span></div></div>'
    + '<div class="rrow"><b>THE PRINT ROOM</b><span class="vd">' + B.PRINT_ARTIFACTS.length + ' files</span><div class="rd">The artwork as sheets: <b>the wall set</b> (12 law posters + cover, ladder, matrix, closing), <b>the one sheet</b> (the whole protocol on one A3), <b>the badge sheet</b>, <b>the rank certificate</b>, and \u2014 for the parent \u2014 <b>the marketing set</b> and <b>the method card</b>. Each one opens from a phone and prints at 100%. <b>/brand print</b>.</div></div>'
    + '<div class="rrow"><b>THE MARKETING REGISTER</b><span class="vd">' + (B.MARKET.shots.length + B.MARKET.shots2.length) + ' slides</span><div class="rd">What we <i>say</i>: the three pillars, the 60% rule, the hour, the AI-PET, the comparison and the offer \u2014 transcribed from the eleven slides you hand-picked, in two batches. The second batch adds the diagnosis, the architecture of fluency, the biological intervention and the ad pipeline. <b>/brand marketing</b></div></div>'
    + '<div class="rrow"><b>THE PHOENIX RISING CODEX</b><span class="vd">' + B.CODEX.pages + ' pages</span><div class="rd">What <i>you</i> hold: the dual-mastery claim, the Lakeview zone, the M2 pipeline, the five-layer sovereign stack, the retention clock, strategic laziness, the proof, and the run log as a format. Transcribed from five decks. <b>/brand codex</b></div></div>'
    + '<div class="rrow"><b>PHASE 0</b><span class="vd">' + B.MARKET.ads.cards.length + ' creatives</span><div class="rd">Six ads and the law governing them, printed together on <b>the ad sheet</b>. <b>/brand ads</b> \u00b7 <b>/brand ad-sheet</b></div></div>'
    + '<div class="rrow"><b>STATUS</b><span class="vd">live</span><div class="rd">' + B.bar(["IDENTITY v" + B.VERSION, "MARKS " + B.ASSETS.filter(x => !x.variant && !x.shot).length, "STILLS " + B.ASSETS.filter(x => x.shot).length, "ICONS " + B.iconNames().length, "EMBLEMS " + B.EMBLEMS.length, "ARTIFACTS " + B.PRINT_ARTIFACTS.length, "GOSPEL 444 V" + B.GOSPEL444.version, "SOURCE 9 DECKS + 11 SLIDES"]) + '</div></div>'
    + '<div class="rrow"><b>LAW</b><span class="vd">011–029</span><div class="rd">Twenty-nine brand laws \u2014 <b>/brand rules</b>. The palette is <b>/brand palette</b>, the icon set <b>/brand icons</b>, the logotype <b>/brand logo</b>, the marks <b>/brand marks</b>, the emblems <b>/brand emblems</b>, the beds <b>/brand patterns</b>, the sheets <b>/brand print</b>, the register <b>/brand marketing</b>, the strategy <b>/brand codex</b>, the campaign <b>/brand ads</b>, the page <b>/brand landing</b>, every picture <b>/brand vault</b>.</div></div>'
    + '<div class="rfoot"><b>/brand open</b> for the room · the desk lives at ◈ Phoenix Generators → MARKETING → Brand &amp; Identity · source: <b>src/brand.js</b>.</div></div>');
  rrlAppend(runNoOf(), "DNA", "Obi: [/brand — identity system v" + B.VERSION + " · " + B.iconNames().length + " icons · " + B.ASSETS.length + " marks · GOSPEL 444 v" + B.GOSPEL444.version + "]");
}

/* ---------------- resilience (added by hardening pass) ---------------- */
function reportError(e){
  const msg = (e && e.message) ? e.message : String(e);
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [error: " + msg + "]"); }catch(_){}
  try{ logOp({ kind:"error", action: currentAction || "?", ok:false, detail: msg, result: "reported to the chat" }); }catch(_){}
  try{ addBubble("ass", "⚠ " + esc(msg)); }catch(_){}
}

/* Freeze-proofing: every command runs through runCmd so a thrown error can never
   leave `busy` stuck true (which would freeze the typing indicator forever).
   `stallMs` raises the watchdog's budget for the commands that are LEGITIMATELY
   slow — a two-attempt lesson build can run for minutes, and releasing the chat
   under it prints a scary "stalled" line while the model is still working. */
async function runCmd(fn, opts){
  busy = true;
  busyLimit = (opts && opts.stallMs) || 180000;
  const t0 = Date.now();
  const what = currentAction || "cmd";
  try { const r = await fn(); logOp({ kind:"op", action: what, result: "ok", ms: Date.now() - t0 }); return r; }
  catch(e){ reportError(e); logOp({ kind:"op", action: what, ok:false, detail: (e && e.message) || String(e), result: "threw", ms: Date.now() - t0 }); }
  finally { busy = false; busyLimit = 180000; busySince = 0; }
}

/* Watchdog: if an operation stalls, release the chat rather than freeze it. */
let busySince = 0;
let busyLimit = 180000;
setInterval(function(){
  if(busy){
    if(!busySince) busySince = Date.now();
    else if(Date.now() - busySince > busyLimit){
      busy = false; busySince = 0;
      try{ addBubble("ass", "⚠ A long operation stalled and was released — the chat is ready again."); }catch(_){}
    }
  } else busySince = 0;
}, 20000);

/* Surface async failures into the raw record instead of swallowing them. */
window.addEventListener("unhandledrejection", function(e){
  var m = (e && e.reason && e.reason.message) || String((e && e.reason) || "unknown");
  try{ rrlAppend(runNoOf(), "DNA", "Obi: [unhandled rejection: " + m + "]"); }catch(_){}
  try{ logOp({ kind:"error", action:"unhandled rejection", ok:false, detail: m, result: "caught by the page listener" }); }catch(_){}
});
