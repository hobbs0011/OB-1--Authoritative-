/* Train 6-7 campaign scout extension — makes the generic 11-target sweep campaign-aware.
   Loaded AFTER src/scout.js. Registers one extra TERRAIN probe so every future
   /phoenixSCOUT visibly carries the campaign's exhaustive requirement instead of
   silently passing generic targets while the code-measure + soul-hunt legs rot.

   Exhaustive = three legs (see src/CAMPAIGNS/train67.md):
     Leg A — terrain (the 11 generic targets, unchanged)
     Leg B — code measure (workspace execute_js, read-only; migration owed: evidence
             must move from scratch/train67/ to src/CAMPAIGNS/train67-evidence/)
     Leg C — soul hunt (canon tree, currently BLOCKED on PAT 401)

   This probe verifies, from inside the live page (fetch only, no secrets):
     1. the campaign contract ships (src/CAMPAIGNS/train67.md with all gate markers)
     2. the evidence migration state (manifest present = Leg B re-runnable from shipped
        files; absent = MIGRATION OWED, flagged every scout until fixed) */
(function(){
  "use strict";
  var MARKERS = ["Done gates", "B1", "B8", "R1", "M1", "Q1", "D1", "Leg B", "Leg C"];
  async function run(){
    var rows = [], cache = [];
    var md = null, mdOk = false, found = [];
    try {
      var r = await fetch("src/CAMPAIGNS/train67.md", { cache: "no-store" });
      if (r.ok) {
        md = await r.text(); mdOk = true;
        found = MARKERS.filter(function(m){ return md.indexOf(m) !== -1; });
      } else {
        rows.push(["campaign contract", "HTTP " + r.status, "src/CAMPAIGNS/train67.md unreadable"]);
      }
    } catch(e) {
      rows.push(["campaign contract", "UNREACHABLE", String((e && e.message) || e)]);
    }
    if (mdOk) {
      rows.push(["campaign contract", found.length + "/" + MARKERS.length + " markers",
        found.length === MARKERS.length ? (md.length + " B, all gates on record")
          : ("MISSING: " + MARKERS.filter(function(m){ return found.indexOf(m) === -1; }).join(", "))]);
      cache.push(["campaign:train67-contract", found.length === MARKERS.length]);
    } else {
      cache.push(["campaign:train67-contract", false]);
    }
    var evOk = false;
    try {
      var e2 = await fetch("src/CAMPAIGNS/train67-evidence/manifest.json", { cache: "no-store" });
      if (e2.ok) {
        evOk = true;
        var man = await e2.text();
        rows.push(["evidence migration", "PRESENT", man.slice(0, 160)]);
        cache.push(["campaign:train67-evidence", true]);
      } else {
        rows.push(["evidence migration", "MIGRATION OWED", "Leg B still reads scratch/train67/ (private, may vanish) — copy evidence to src/CAMPAIGNS/train67-evidence/ + manifest.json"]);
        cache.push(["campaign:train67-evidence", false]);
      }
    } catch(e) {
      rows.push(["evidence migration", "MIGRATION OWED", "manifest unreadable: " + String((e && e.message) || e)]);
      cache.push(["campaign:train67-evidence", false]);
    }
    rows.push(["Leg C — soul hunt", "BLOCKED (standing)", "canon tree needs a fresh PAT — named every scout, never skipped silently"]);
    var verdict, summary;
    if (!mdOk) { verdict = "DEAD"; summary = "campaign contract missing from the shipped page"; }
    else if (found.length !== MARKERS.length) { verdict = "DRIFT"; summary = "contract present but " + (MARKERS.length - found.length) + " marker(s) missing"; }
    else if (!evOk) { verdict = "DRIFT"; summary = "contract COMPLETE (" + md.length + " B) · evidence migration OWED · soul hunt BLOCKED (standing)"; }
    else { verdict = "LIVE"; summary = "contract + evidence ship · soul hunt BLOCKED (standing)"; }
    return { verdict: verdict, summary: summary, rows: rows, cache: cache };
  }
  function install(){
    if (!window.ObiScout || !window.ObiScout.TERRAIN) return false;
    if (window.ObiScout.TERRAIN.some(function(t){ return t.id === "train67"; })) return true;
    window.ObiScout.TERRAIN.push({ id: "train67", label: "TRAIN 6-7 CAMPAIGN — contract + evidence + soul-hunt legs", run: run });
    return true;
  }
  if (!install()) {
    var n = 0;
    var timer = setInterval(function(){
      if (install() || ++n > 50) clearInterval(timer);
    }, 200);
  }
})();
