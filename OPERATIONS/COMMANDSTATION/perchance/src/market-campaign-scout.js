/* Market-research campaign scout probe — same pattern as src/train67-campaign-scout.js.
   Loaded AFTER src/scout.js. Registers one extra TERRAIN probe so every sweep visibly
   carries the external mission: contract present, evidence fresh, refusal log kept. */
(function(){
  "use strict";
  var MARKERS = ["Done gates", "Leg A", "Leg B", "Leg C", "Leg D", "comparables", "refusals"];
  async function run(){
    var rows = [], cache = [];
    var md = null, mdOk = false, found = [];
    try {
      var r = await fetch("src/CAMPAIGNS/market-research.md", { cache: "no-store" });
      if (r.ok) { md = await r.text(); mdOk = true; found = MARKERS.filter(function(m){ return md.indexOf(m) !== -1; }); }
      else rows.push(["campaign contract", "HTTP " + r.status, "src/CAMPAIGNS/market-research.md unreadable"]);
    } catch(e) { rows.push(["campaign contract", "UNREACHABLE", String((e && e.message) || e)]); }
    if (mdOk) {
      rows.push(["campaign contract", found.length + "/" + MARKERS.length + " markers",
        found.length === MARKERS.length ? (md.length + " B, all gates on record")
          : ("MISSING: " + MARKERS.filter(function(m){ return found.indexOf(m) === -1; }).join(", "))]);
      cache.push(["campaign:market-contract", found.length === MARKERS.length]);
    } else cache.push(["campaign:market-contract", false]);
    var evNote = "no pulls yet — Legs A-D unrun";
    try {
      var e2 = await fetch("src/CAMPAIGNS/market-evidence/manifest.json", { cache: "no-store" });
      if (e2.ok) {
        var man = JSON.parse(await e2.text());
        var n = (man.pulls || []).length;
        var stale = man.pulls.some(function(p){ return (Date.now() - p.at) > 7*24*3600*1000; });
        evNote = n + " pull(s)" + (stale ? " · STALE present (gate 4)" : " · fresh");
        rows.push(["evidence", n ? (stale ? "STALE" : "FRESH") : "EMPTY", evNote]);
        cache.push(["campaign:market-evidence", n > 0 && !stale]);
      } else { rows.push(["evidence", "EMPTY", evNote]); cache.push(["campaign:market-evidence", false]); }
    } catch(e) { rows.push(["evidence", "EMPTY", evNote]); cache.push(["campaign:market-evidence", false]); }
    var verdict, summary;
    if (!mdOk) { verdict = "DEAD"; summary = "market campaign contract missing from the shipped page"; }
    else if (found.length !== MARKERS.length) { verdict = "DRIFT"; summary = "contract present but markers missing"; }
    else { verdict = "LIVE"; summary = "contract on record (" + md.length + " B) · evidence: " + evNote; }
    return { verdict: verdict, summary: summary, rows: rows, cache: cache };
  }
  function install(){
    if (!window.ObiScout || !window.ObiScout.TERRAIN) return false;
    if (window.ObiScout.TERRAIN.some(function(t){ return t.id === "market"; })) return true;
    window.ObiScout.TERRAIN.push({ id: "market", label: "MARKET RESEARCH — external scouting mission (contract + evidence + refusals)", run: run });
    return true;
  }
  if (!install()) {
    var n = 0;
    var timer = setInterval(function(){ if (install() || ++n > 50) clearInterval(timer); }, 200);
  }
})();
