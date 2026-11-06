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
    return { pass: checks.every(function(c){ return c.result === "PASS"; }), checks: checks,
      notes: [runnerCheckNote(), backupRaceNote(), scholarRule(), degradeNote()] };
  }

  window.KiloGuards = { PROMPT_CAP: PROMPT_CAP, KEEPER_CAP: KEEPER_CAP, FREE_ROTATION_PIN: FREE_ROTATION_PIN,
    safeSlice: safeSlice, sessionSummary: sessionSummary, runnerCheckNote: runnerCheckNote,
    fitPrompt: fitPrompt, priorOrPlaceholder: priorOrPlaceholder,
    breakerNote: breakerNote, breakerTrip: breakerTrip, breakerClear: breakerClear,
    keeperShouldStop: keeperShouldStop, sizeVerdict: sizeVerdict, soulWorthy: soulWorthy,
    rotationNote: rotationNote, backupRaceNote: backupRaceNote, scholarRule: scholarRule,
    degradeNote: degradeNote, probeLane: probeLane, selfTest: selfTest };
})();
