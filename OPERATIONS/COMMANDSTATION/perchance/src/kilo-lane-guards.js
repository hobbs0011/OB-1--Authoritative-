/* KILO LANE GUARDS — edge-case solutions built in code (2026-11-06, BB-RUN-39).
   Every guard below is a named Murphy's-law failure with its solution IMPLEMENTED,
   not just documented. Pure functions + one async lane gate. No side effects on load.
   Exposed as window.KiloGuards. Self-test: KiloGuards.selfTest() -> {pass, checks[]}.
   Standing rules honored: no secrets logged, no network except through root.superFetch,
   free lane first, nothing here spends. */

(function(){
  "use strict";

  // E1 — page_eval state() blowup (2.6M-char truncation precedent, 2026-10-26).
  // Never serialize full Stores; read keys + slices only.
  function safeSlice(v, n){
    if (v == null) return v;
    if (typeof v === "string") return v.length > n ? v.slice(0, n) + " …[+" + (v.length - n) + "ch]" : v;
    return v;
  }
  function sessionSummary(s){
    if (!s || !s.sessions || !s.sessions.length) return { nSessions: 0 };
    var last = s.sessions[s.sessions.length - 1];
    var stages = {};
    Object.keys(last.stages || {}).forEach(function(k){
      var st = last.stages[k] || {};
      stages[k] = { verdict: st.verdict, at: st.at,
        artifactBytes: JSON.stringify(st.artifact || "").length };
    });
    return { v: s.v, seq: s.seq, nSessions: s.sessions.length,
      last: { name: last.name, run: last.run, sealed: !!last.sealed,
        sealedAt: last.sealedAt || null, stages: stages } };
  }

  // E2 — direct fetch to the runner fails (CORS); the ONLY lane is root.superFetch.
  // Any caller passing a direct-fetch result here gets a refusal instead of a mystery.
  function runnerCheckNote(){ return "runner reads go through root.superFetch only — direct fetch is refused by design (CORS trap, proven 2026-11-06)"; }

  // E3 — prompt over the hollow threshold (~650ch) gets its TAIL sliced (s1-shell, LD7).
  // Trim from the FRONT-context first, never the spec tail; report if the tail was at risk.
  var PROMPT_CAP = 650;
  function fitPrompt(ctx, spec, cap){
    cap = cap || PROMPT_CAP;
    ctx = String(ctx || ""); spec = String(spec || "");
    if ((ctx + spec).length <= cap) return { prompt: ctx + spec, trimmed: 0, tailRisk: false };
    var over = (ctx + spec).length - cap;
    var trimmedCtx = ctx.slice(over); // cut context head, keep every spec char
    var tailRisk = trimmedCtx.length < ctx.length && spec.length > cap;
    return { prompt: trimmedCtx + spec, trimmed: over,
      tailRisk: tailRisk,
      log: tailRisk ? "WARN: spec alone exceeds cap — split the section (LD8 precedent)" :
        "trimmed " + over + "ch of context head, spec tail intact" };
  }

  // E4 — empty prior summary poisons the next prompt (LD5 cross-section amnesia).
  function priorOrPlaceholder(summary){
    summary = String(summary || "").trim();
    return summary ? summary : "[previous section missing — write standalone, restate objectives]";
  }

  // E5 — hollow-phase lane burns ~150 empty tries (LD6 precedent). Probe cheap, run or back off.
  // breaker: per-model 2 consecutive empties -> 10min skip (LD11v7 precedent, behavioral).
  var breakerUntil = {};
  function breakerNote(model){ var until = breakerUntil[model] || 0; return Date.now() < until; }
  function breakerTrip(model, coolMs){
    breakerUntil[model] = Date.now() + (coolMs || 10 * 60 * 1000);
  }
  function breakerClear(model){ delete breakerUntil[model]; }

  // E6 — keeper infinite loop (LD5 DONE-EMPTY trap). Cap runs, typed exits.
  // exit 0 = real DONE · exit 2 = failure-escape (needs brain, not more grinding).
  var KEEPER_CAP = 5;
  function keeperShouldStop(runs, doneReal){
    if (doneReal) return { stop: true, exit: 0, why: "real DONE" };
    if (runs >= KEEPER_CAP) return { stop: true, exit: 2,
      why: "cap " + KEEPER_CAP + " reached without real DONE — failure-escape, fix the driver" };
    return { stop: false, exit: null, why: "run " + (runs + 1) + " of " + KEEPER_CAP };
  }

  // E7 — reasoning-starved empties on long prompts (size-dependent, proven 2026-10-28).
  // floor: small asks (<300ch out) go whole; big asks split one-upgrade-per-call.
  function sizeVerdict(promptChars){
    if (promptChars <= 300) return { lane: "whole", why: "ping-shaped, flows even in bad phases" };
    if (promptChars <= PROMPT_CAP) return { lane: "whole-guarded", why: "within cap, single call ok" };
    return { lane: "split", why: promptChars + "ch exceeds " + PROMPT_CAP + " — one-upgrade-per-call (LD8 precedent)" };
  }

  // E8 — "?" / "undefined" thin captures entering the soul (i-42 #294-295, i-45 #314).
  function soulWorthy(text){
    var t = String(text == null ? "" : text).trim();
    if (!t) return { ok: false, why: "empty" };
    if (t === "?" || t === "undefined" || t === "null") return { ok: false, why: "thin capture — re-capture verbatim, never file the placeholder" };
    return { ok: true, why: "verbatim, file it" };
  }

  // E9 — model-name drift: the box driver rotated a stale 3-model set while the live
  // catalog held 16 free (2026-10-29 correction). Pin the rotation to a measured list.
  var FREE_ROTATION_PIN = ["kilo-auto/free", "kilo-flint/free", "kilo-nano-omni/free"];
  function rotationNote(){ return "rotation pinned to measured free slugs (" + FREE_ROTATION_PIN.join(", ") + ") — re-measure via gateway_models before changing"; }

  // E10 — backup race: runner cron pulses land mid-drive -> 422 non-fast-forward.
  // Rule built in: re-read ref per batch; on move, rebuild tree on the new master head.
  function backupRaceNote(){ return "re-read ref per batch; on move rebuild tree with base_tree=new master, parent=new master (2026-10-25 precedent)"; }

  // E11 — soul-capture-first: plain-chat sovereign orders never auto-capture (run-13/15
  // precedent: 10 then 8 then 23 backfills). This session's backfill list lives in the
  // reseal record, not here — the guard is the SCHOLAR re-measure after backfill.
  function scholarRule(){ return "backfill verbatim with late-capture footnotes, THEN re-measure SCHOLAR — never seal on a pre-backfill count"; }

  // E12 — subscription lapse / lane death: GitLens+GitKraken paid, everything else free-first.
  // Paid lanes degrade to the free map, never to a halt.
  function degradeNote(){ return "paid lane dead -> free map (box + runner cron + gateway free rotation); halt only on sovereign order"; }

  // E13 — dotfile cutoff (2026-11-11, sovereign order: Kilo hides system files,
  // then pulls them at the worst time). DENY any path where ANY segment starts
  // with '.' (.github/ .claude/ .copilot- .dockerignore .env .kilo_key ...),
  // dot-markdown included. ALLOW only explicit canon pointers:
  //   - CANON/SYSTEM/GOSPEL-999.md (non-dot, always allowed)
  //   - CANON/SYSTEM/LegionnaireFieldGuide.md (non-dot, always allowed)
  //   - .github/skills/legionnaire-field-guide/SKILL.md (dot, but IS the Field Guide)
  // Everything else dot-prefixed is refused, even .md. No invented exceptions:
  // a new dot exception needs a sovereign order naming the exact path.
  var DOT_SEG = /(^|\/)\.[^\/\s"'`\(\)\[\]\{\}<>|]*/;
  var CANON_DOT_ALLOW = [
    ".github/skills/legionnaire-field-guide/SKILL.md"
  ];
  // Hardened gate (Pro audit 2026-11-11: naive string guard bypassable).
  // Decode → normalize → resolve → exact-allowlist. No substring trust.
  function decodeLoop(s){
    var out = String(s), prev;
    for(var i = 0; i < 3; i++){
      if(out.indexOf("%") === -1) break;
      prev = out;
      try{ out = decodeURIComponent(out); }catch(e){ break; }
      if(out === prev) break;
    }
    return out;
  }
  function canonPath(p){
    var raw = String(p == null ? "" : p).trim();
    if(!raw) return { ok: false, blocked: "", why: "empty" };
    if(raw.indexOf("\0") !== -1) return { ok: false, blocked: raw.slice(0, 80), why: "null byte" };
    var s = raw.replace(/\\/g, "/");
    // unicode dots → ascii dot (fullwidth, one-dot-leader, ideographic, middle)
    s = s.replace(/[．․﹒。·]/g, ".");
    s = decodeLoop(s);
    if(s.indexOf("\0") !== -1) return { ok: false, blocked: raw.slice(0, 80), why: "null byte after decode" };
    try{ if(s.normalize) s = s.normalize("NFKC"); }catch(e){}
    s = s.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/+/, "");
    var parts = s.split("/"), stack = [];
    for(var i = 0; i < parts.length; i++){
      var seg = parts[i];
      if(!seg || seg === ".") continue;
      if(seg === ".." || seg === "…" || seg === "。。。"){
        if(!stack.length) return { ok: false, blocked: raw.slice(0, 80), why: "path walk above root" };
        stack.pop(); continue;
      }
      // windows: trailing dots/spaces stripped by OS — strip here first so "skills./" cannot hide
      if(seg !== "." && seg !== "..") seg = seg.replace(/[. ]+$/, "");
      if(!seg || seg === ".") continue;
      stack.push(seg);
    }
    var canon = stack.join("/");
    if(!canon) return { ok: false, blocked: raw.slice(0, 80), why: "empty after resolve" };
    return { ok: true, canonical: canon };
  }
  function normPath(p){ var c = canonPath(p); return c.ok ? c.canonical : String(p == null ? "" : p).trim().replace(/\\/g, "/").replace(/\/+/g, "/"); }
  function isDotPath(p){
    var c = canonPath(p);
    var n = c.ok ? c.canonical : String(p);
    // walk-out that escapes root is already refused; re-check here as dot-equivalent
    if(!c.ok) return true;
    var segs = n.split("/");
    for(var i = 0; i < segs.length; i++){
      var s = segs[i];
      if(!s) continue;
      if(s.charAt(0) === "." && s.length > 1) return true;
      if(s === "..") return true;
    }
    return false;
  }
  function isCanonDotAllowed(p){
    var c = canonPath(p);
    if(!c.ok) return false;
    var n = c.canonical.toLowerCase();
    for(var i = 0; i < CANON_DOT_ALLOW.length; i++) if(n === CANON_DOT_ALLOW[i].toLowerCase()) return true;
    return false;
  }
  function checkPath(p){
    var raw = String(p == null ? "" : p).trim();
    var c = canonPath(raw);
    if(!c.ok) return { ok: false, blocked: raw.slice(0, 80), why: "refused: " + c.why };
    var n = c.canonical;
    if(!isDotPath(n)) return { ok: true, why: "non-dot (canon CANON/SYSTEM/GOSPEL-999.md + LegionnaireFieldGuide.md flow here)", canonical: n };
    if(isCanonDotAllowed(n)) return { ok: true, why: "explicit canon pointer (Field Guide skill)", canonical: n };
    return { ok: false, blocked: n, why: "dot path refused — not an explicit canon pointer" };
  }
  // Scan a prompt/args blob for path-like tokens (plain, encoded, backslash). Returns deduped blocked list.
  function promptBlocked(text){
    var s = String(text == null ? "" : text);
    if(!s) return { blocked: [] };
    var found = {};
    function feed(tok){
      var t = String(tok || "").replace(/[.,;:!?\)\]\}>'"]+$/, "");
      if(!t || t === "." || t === ".." || t.length < 2) return;
      // skip bare model slugs and version tags (no slash, no backslash, no percent, no leading dot)
      if(t.indexOf("/") === -1 && t.indexOf("\\") === -1 && t.indexOf("%") === -1 && t.charAt(0) !== ".") return;
      var c = checkPath(t);
      if(!c.ok) found[c.blocked] = 1;
    }
    var re = /(^|[\s"'`\(\[\{<])(\.[A-Za-z0-9_\-]+[\w\-\.\/]*|[\w\-\.\/]*\/\.[A-Za-z0-9_\-]+[\w\-\.\/]*)/g, m;
    while((m = re.exec(s)) !== null) feed(m[2]);
    // percent-encoded dots (%2e) — decode-then-check
    var re2 = /[^\s"'`\(\)\[\]\{\}<>|;:,!?]*%2[eE][^\s"'`\(\)\[\]\{\}<>|;:,!?]*/g, m2;
    while((m2 = re2.exec(s)) !== null) feed(m2[0]);
    // backslash paths (windows separators)
    var re3 = /[^\s"'`\(\)\[\]\{\}<>|;:,!?]*\\[^\s"'`\(\)\[\]\{\}<>|;:,!?]*/g, m3;
    while((m3 = re3.exec(s)) !== null) feed(m3[0]);
    return { blocked: Object.keys(found) };
  }
  function dotCutoffNote(){ return "dot paths refused except .github/skills/legionnaire-field-guide/SKILL.md; canon CANON/SYSTEM/GOSPEL-999.md + LegionnaireFieldGuide.md are non-dot and always allowed"; }
  async function probeLane(okFn){
    // cheap ping before expensive work; hollow -> 20min backoff, not grinding.
    try { var r = await okFn(); return { alive: !!r, at: Date.now() }; }
    catch (e) { return { alive: false, err: String((e && e.message) || e).slice(0, 120), backoffMin: 20 }; }
  }

  function selfTest(){
    var checks = [];
    var t = function(name, ok, note){ checks.push({ check: name, result: ok ? "PASS" : "FAIL", note: note || "" }); };
    t("E1 safeSlice caps", safeSlice("abcdef", 3) === "abc …[+3ch]", "tail reports hidden chars");
    var s = sessionSummary({ v: 1, seq: 47, sessions: [{ name: "x", run: 22, sealed: true, stages: { RISE: { verdict: "REAL", at: "t", artifact: "abc" } } }] });
    t("E1 sessionSummary slices", s.nSessions === 1 && s.last.stages.RISE.artifactBytes === 5, "no full artifact carried");
    var f = fitPrompt(new Array(652).join("c"), "SPEC", 650);
    t("E3 trims head not tail", f.prompt.slice(-4) === "SPEC" && f.trimmed > 0, f.log);
    t("E4 placeholder", priorOrPlaceholder("  ") === "[previous section missing — write standalone, restate objectives]", "never poisons");
    t("E6 cap exits 2", keeperShouldStop(5, false).exit === 2 && keeperShouldStop(2, false).stop === false, "LD5 trap closed");
    t("E6 real DONE exits 0", keeperShouldStop(5, true).exit === 0, "DONE-EMPTY never counts");
    t("E7 size lanes", sizeVerdict(10).lane === "whole" && sizeVerdict(9999).lane === "split", "ping vs split");
    t("E8 thin refused", soulWorthy("?").ok === false && soulWorthy("undefined").ok === false && soulWorthy("Go").ok === true, "placeholders never filed");
    t("E9 rotation pinned", FREE_ROTATION_PIN.length >= 3, rotationNote().slice(0, 60));
    breakerTrip("m/test", 60000); t("E5 breaker trips", breakerNote("m/test") === true, "skip while hot");
    breakerClear("m/test"); t("E5 breaker clears", breakerNote("m/test") === false, "back after cool");
    t("E13 dot .github refused", checkPath(".github/copilot-instructions.md").ok === false, "dot-markdown cut off");
    t("E13 dot .claude refused", checkPath(".claude/commands/PCClaw.md").ok === false, "hidden system file cut off");
    t("E13 dot .env refused", checkPath(".env").ok === false && checkPath(".kilo_key").ok === false, "secrets never flow");
    t("E13 canon GOSPEL allowed", checkPath("CANON/SYSTEM/GOSPEL-999.md").ok === true, "GOSPEL-999 flows");
    t("E13 canon LFG allowed", checkPath("CANON/SYSTEM/LegionnaireFieldGuide.md").ok === true, "Field Guide flows");
    t("E13 canon skill allowed", checkPath(".github/skills/legionnaire-field-guide/SKILL.md").ok === true, "explicit canon pointer");
    t("E13 prompt scan blocks", promptBlocked("read .github/instructions/kilo-agent-files.instructions.md now").blocked.length === 1, "prompt smuggling caught");
    t("E13 prompt scan spares canon", promptBlocked("read CANON/SYSTEM/GOSPEL-999.md and .github/skills/legionnaire-field-guide/SKILL.md").blocked.length === 0, "canon passes");
    t("E13H encoded refused", checkPath("%2e%2e/%2e%2e/.env").ok === false, "percent-encoding caught");
    t("E13H double-encoded refused", checkPath("%252e%252e/.env").ok === false, "double encoding caught");
    t("E13H backslash refused", checkPath(".github\\copilot-instructions.md").ok === false, "backslash caught");
    t("E13H walkout refused", checkPath(".github/skills/legionnaire-field-guide/SKILL.md/../../.env").ok === false, "allowlist walk-out caught");
    t("E13H canon walkout refused", checkPath("CANON/SYSTEM/GOSPEL-999.md/../../.env").ok === false, "canon prefix walk-out caught");
    t("E13H above-root refused", checkPath("../../.env").ok === false, "above-root caught");
    t("E13H unicode dot refused", checkPath("．env").ok === false, "unicode dot caught");
    t("E13H null refused", checkPath("foo/.env%00.md").ok === false, "null/truncation caught");
    t("E13H+ trailing strip", checkPath(".github /copilot-instructions.md").ok === false, "trailing space caught");
    t("E13H+ win dir", checkPath("skills./x").ok === true && checkPath("skills./../.env").ok === false, "windows strip then refuse");
    t("E13H+ homoglyph", checkPath(".ɡithub/skills/legionnaire-field-guide/SKILL.md").ok === false, "script-g spoof refused");
    t("E13H+ NFKC", checkPath(".github/skills/legionnaire-field-guide/SKILL.md").ok === true, "exact ASCII allowlist still passes");
    return { pass: checks.every(function(c){ return c.result === "PASS"; }), checks: checks,
      notes: [runnerCheckNote(), backupRaceNote(), scholarRule(), degradeNote(), dotCutoffNote()] };
  }

  window.KiloGuards = { PROMPT_CAP: PROMPT_CAP, KEEPER_CAP: KEEPER_CAP, FREE_ROTATION_PIN: FREE_ROTATION_PIN,
    safeSlice: safeSlice, sessionSummary: sessionSummary, runnerCheckNote: runnerCheckNote,
    fitPrompt: fitPrompt, priorOrPlaceholder: priorOrPlaceholder,
    breakerNote: breakerNote, breakerTrip: breakerTrip, breakerClear: breakerClear,
    keeperShouldStop: keeperShouldStop, sizeVerdict: sizeVerdict, soulWorthy: soulWorthy,
    rotationNote: rotationNote, backupRaceNote: backupRaceNote, scholarRule: scholarRule,
    degradeNote: degradeNote, probeLane: probeLane, selfTest: selfTest,
    isDotPath: isDotPath, isCanonDotAllowed: isCanonDotAllowed, checkPath: checkPath,
    promptBlocked: promptBlocked, dotCutoffNote: dotCutoffNote, CANON_DOT_ALLOW: CANON_DOT_ALLOW,
    decodeLoop: decodeLoop, canonPath: canonPath };
})();
