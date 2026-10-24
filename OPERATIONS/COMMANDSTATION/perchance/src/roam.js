/* PORTED 2026-10-22 from phoenix-ai-solutions-promotions-mastermind (PaiS Promote station, save 2) — the whole-shelf ferry (/roam export/import/status). Byte-identical below this header; wired in app.js dispatch + help table, loaded in index.html after pushpull.js. Secrets/sealed/chains/identity rules enforced in code. */
/* ============================================================================
   RECOVERY ROAM (src/roam.js) — the whole-shelf ferry between stations of one
   owner sharing one browser. HQ lives in another helper chat and holds the
   roster + the HQ file; nothing here can reach HQ directly, so the human
   carries files by hand: EXPORT here → attach in HQ chat → IMPORT the merged
   file back here → paste the merge block back to HQ.

   COMMANDS (wired in app.js)
     /roam export    download the whole shelf as one JSON file (the ferry)
     /roam import    read a merged HQ file back in (file picker, never uploaded)
     /roam status    counts of the shelf (counts only, never contents)

   RULES, enforced in code, not in prose:
     · SECRETS NEVER ENTER THE FILE. localStorage `obi_keys` is never read,
       and no kv folder named `keys` is exported. The manifest says so.
     · SEALED STAYS SEALED. Import never writes `head` / `seal:*` keys and
       never seals or unseals — the I-LOG chain, its head and its seals are
       only ever read here.
     · CHAINS ARE NEVER OVERWRITTEN. Local I-LOG entries are never modified,
       deleted or overwritten; soul entries are only ADDED (union by t|text),
       runs only ADDED (by run number). Nothing local is removed.
     · THE FILE WINS PER KEY OTHERWISE. Every other kv key and the client
       pointer take the file's value on collision.
     · IDENTITY IS NOT FERRYABLE. The `masterlink` folder (role, parent,
       targets) is never imported — a station that imported HQ's config
       would reparent itself. Skipped and reported.
   ========================================================================== */
(function(){
  "use strict";
  var ROAM_V = 1;
  /* localStorage shelf — and ONLY this. obi_keys (secrets), obi_savewatch
     (this machine's log), voice/tab prefs: deliberately not here. */
  var LS_KEYS = ["obi_sdnad", "obi_ilog", "obi_client", "obi_clients_adopted"];
  /* kv shelf, read live. `ilog` + `masterlink` are in the manifest for HQ's
     merge math but are NEVER written on import (chain / identity). */
  var KV_FOLDERS = ["transcripts","summaries","lessons","lessonforge","intake",
    "clients","offers","pheromones","rubrics","curriculum","sites","fpm",
    "sessions","relay","scout","freewire","scholar","brain","omega","reviews",
    "writeups","notes","vault","cgn","masterlink","ilog"];

  function esc(s){ try{ if(typeof window.esc === "function") return window.esc(s); }catch(e){}
    return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function say(html){ try{ addBubble("ass", html); }catch(e){ console.log("[roam]", String(html).replace(/<[^>]*>/g,"")); } }
  function note(op, detail, result, ok){
    try{ if(typeof logOp === "function") logOp({ kind:"op", action:op, detail:detail, result:result, ok:ok === false ? false : true }); }catch(e){}
  }
  function selfName(){ try{ return window.generatorName || "?"; }catch(e){ return "?"; } }
  function selfUrl(){ return "https://perchance.org/" + selfName(); }
  function stamp(){
    var d = new Date(), p = function(n){ return String(n).padStart(2,"0"); };
    return d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }
  function kv(name){
    try{ if(typeof root !== "undefined" && root && root.kv) return root.kv[name] || null; }catch(e){}
    return null;
  }
  async function kvEntries(name){
    var f = kv(name);
    if(!f) return null;
    try{ return await f.entries(); }
    catch(e){ try{ var ks = await f.keys(); return ks.map(function(k){ return [k, null]; }); }catch(e2){ return null; } }
  }
  async function kvGet(name, key){
    var f = kv(name);
    if(!f) return undefined;
    try{ return await f.get(key); }catch(e){ return undefined; }
  }
  async function kvSet(name, key, val){
    var f = kv(name);
    if(!f) return false;
    try{ await f.set(key, val); return true; }catch(e){ return false; }
  }
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, v); return true; }catch(e){ return false; } }
  function soulKey(e){ return (e && e.t != null ? e.t : "?") + "|" + String((e && e.text) || ""); }
  function download(name, text, mime){
    var url = URL.createObjectURL(new Blob([text], { type: mime || "application/json" }));
    var a = document.createElement("a");
    a.href = url; a.download = name; a.style.display = "none";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 2500);
  }

  /* ------------------------------- census -------------------------------- */
  async function census(){
    var out = { ls:{}, kv:{}, secrets:"excluded (obi_keys never read)" };
    for(var i = 0; i < LS_KEYS.length; i++){
      var raw = lsGet(LS_KEYS[i]);
      out.ls[LS_KEYS[i]] = raw == null ? null : raw.length;
    }
    for(var j = 0; j < KV_FOLDERS.length; j++){
      var es = await kvEntries(KV_FOLDERS[j]);
      out.kv[KV_FOLDERS[j]] = es == null ? null : es.length;
    }
    return out;
  }

  /* -------------------------------- export -------------------------------- */
  async function doExport(){
    say("🎒 <b>/roam export</b> — reading the whole shelf…");
    var shelf = { ls:{}, kv:{} };
    for(var i = 0; i < LS_KEYS.length; i++){
      var raw = lsGet(LS_KEYS[i]);
      shelf.ls[LS_KEYS[i]] = raw == null ? null : raw;   /* raw strings — no parsing, no filtering needed: none of these keys holds secrets */
    }
    var counts = {};
    for(var j = 0; j < KV_FOLDERS.length; j++){
      var name = KV_FOLDERS[j];
      if(name === "keys"){ counts[name] = "skipped (secrets)"; continue; }  /* belt as well as braces */
      var es = await kvEntries(name);
      if(es == null){ shelf.kv[name] = null; counts[name] = "unreadable"; continue; }
      var obj = {};
      for(var k = 0; k < es.length; k++) obj[es[k][0]] = es[k][1];
      shelf.kv[name] = obj;
      counts[name] = es.length;
    }
    var file = {
      v: ROAM_V, kind: "roam-shelf",
      station: { url: selfUrl(), generator: selfName(), exportedAt: new Date().toISOString() },
      manifest: { counts: counts, lsBytes: (function(){ var o = {}; for(var k2 in shelf.ls) o[k2] = shelf.ls[k2] == null ? null : shelf.ls[k2].length; return o; })(),
        secrets: "excluded by design — obi_keys never read, kv folder `keys` never exported" },
      shelf: shelf
    };
    var body = JSON.stringify(file);
    var name = "roam-" + selfName() + "-" + stamp() + ".json";
    download(name, body, "application/json");
    var rows = Object.keys(counts).map(function(f){ return "<b>" + esc(f) + "</b> " + esc(String(counts[f])); }).join(" · ");
    say('<div class="rise"><div class="rhead">🎒 ROAM EXPORT — ' + esc(selfUrl()) + '</div>'
      + '<div class="rrow"><b>FILE</b><span class="vd">' + esc(name) + '</span><div class="rd">' + body.length + ' bytes — the download should have started</div></div>'
      + '<div class="rrow"><b>SHELF</b><span class="vd">counts only</span><div class="rd">' + rows + '</div></div>'
      + '<div class="rrow"><b>SECRETS</b><span class="vd">excluded</span><div class="rd">obi_keys never read — carry this file by hand: attach it in the HQ chat (the edtech-mastermind helper) for merging</div></div></div>');
    note("roam export", name, body.length + " bytes · " + Object.keys(counts).length + " folders", true);
    return { name: name, bytes: body.length, counts: counts };
  }

  /* -------------------------------- import -------------------------------- */
  function pickImport(){
    var inp = document.getElementById("roamImportFile");
    if(inp){ inp.value = ""; inp.click(); return; }
    inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json"; inp.style.display = "none";
    inp.onchange = function(){ if(inp.files && inp.files[0]) doImport(inp.files[0]); inp.remove(); };
    document.body.appendChild(inp); inp.click();
  }

  async function readFile(file){
    return new Promise(function(res, rej){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || "")); };
      r.onerror = function(){ rej(new Error("could not read that file")); };
      r.readAsText(file);
    });
  }

  async function doImport(file){
    var text;
    try{ text = await readFile(file); }
    catch(e){ say("🎒 <b>/roam import</b> — could not read that file."); return; }
    var f;
    try{ f = JSON.parse(text); }
    catch(e){ say("🎒 <b>/roam import</b> — not a JSON file. Pick the merged HQ file."); return; }
    if(!f || f.kind !== "roam-shelf" || !f.shelf){
      say("🎒 <b>/roam import</b> — that file is not a roam shelf (kind " + esc(String(f && f.kind)) + "). Pick the merged HQ file."); return;
    }
    say("🎒 <b>/roam import</b> — merging " + esc(String((f.station && f.station.url) || (f.station && f.station.generator) || "?")) + " → " + esc(selfUrl()) + "…");
    var applied = {}, added = {}, onlyHere = {}, skipped = {};
    var from = (f.station && (f.station.url || f.station.generator)) || "?";

    /* kv shelf: file wins per key — except chain + identity, never touched */
    var fk = (f.shelf && f.shelf.kv) || {};
    for(var name in fk){
      if(name === "ilog"){ skipped.ilog = "chain kept — local entries never overwritten"; continue; }
      if(name === "masterlink"){ skipped.masterlink = "identity kept — role/parent/targets are this station's own"; continue; }
      if(name === "keys"){ skipped.keys = "secrets never imported"; continue; }
      var incoming = fk[name] || {};
      var local = await kvEntries(name);
      var localKeys = {};
      if(local) for(var li = 0; li < local.length; li++) localKeys[local[li][0]] = true;
      var n = 0, only = 0;
      for(var k in incoming){
        if(await kvSet(name, k, incoming[k])) n++;
      }
      for(var lk in localKeys) if(!(lk in incoming)) only++;
      applied[name] = n;
      if(only) onlyHere[name] = only;
    }

    /* soul ledger: union-add only — existing entries never modified or deleted */
    var soulAdded = 0, runsAdded = 0, soulLocal = 0, runsLocal = 0;
    try{
      var raw = lsGet("obi_sdnad");
      var loc = raw ? JSON.parse(raw) : { runs:[], soul:[] };
      if(!Array.isArray(loc.soul)) loc.soul = [];
      if(!Array.isArray(loc.runs)) loc.runs = [];
      soulLocal = loc.soul.length; runsLocal = loc.runs.length;
      var fraw = f.shelf.ls && f.shelf.ls.obi_sdnad;
      var imp = fraw ? JSON.parse(fraw) : null;
      if(imp){
        var known = {};
        for(var si = 0; si < loc.soul.length; si++) known[soulKey(loc.soul[si])] = true;
        var isoul = Array.isArray(imp.soul) ? imp.soul : [];
        for(var ai = 0; ai < isoul.length; ai++){
          if(!known[soulKey(isoul[ai])]){ loc.soul.push(isoul[ai]); known[soulKey(isoul[ai])] = true; soulAdded++; }
        }
        var rknown = {};
        for(var ri = 0; ri < loc.runs.length; ri++) rknown[loc.runs[ri].run] = true;
        var iruns = Array.isArray(imp.runs) ? imp.runs : [];
        for(var rj = 0; rj < iruns.length; rj++){
          if(iruns[rj] && iruns[rj].run != null && !rknown[iruns[rj].run]){ loc.runs.push(iruns[rj]); rknown[iruns[rj].run] = true; runsAdded++; }
        }
        lsSet("obi_sdnad", JSON.stringify(loc));
      }
    }catch(e){ skipped.soul = "ledger unreadable — left untouched (" + String((e && e.message) || e).slice(0, 80) + ")"; }

    /* client pointer: file wins. Seals/head: never written (chain kept). */
    try{
      var fls = f.shelf.ls || {};
      if(fls.obi_client != null){ lsSet("obi_client", fls.obi_client); applied.client = 1; }
      if(fls.obi_clients_adopted != null){ lsSet("obi_clients_adopted", fls.obi_clients_adopted); applied.adopted = 1; }
    }catch(e){}

    /* seal state, read-only proof that sealed stayed sealed */
    var sealLine = "no seal read";
    try{
      if(window.ObiILog && window.ObiILog.head){
        var h = await window.ObiILog.head();
        sealLine = (h.sealedCount || 0) + " sealed · seg " + (h.seg || 1) + " · untouched";
      }
    }catch(e){}

    var locIlog = 0, fileIlog = 0;
    try{ var le = await kvEntries("ilog"); locIlog = le ? le.length : 0; }catch(e){}
    try{ var fi = fk.ilog || {}; fileIlog = Object.keys(fi).length; }catch(e){}

    var fmt = function(o){ var ks = Object.keys(o); return ks.length ? ks.map(function(k){ return k + " " + o[k]; }).join(" · ") : "—"; };
    var block = "ROAM MERGE — " + selfUrl() + "\n"
      + "from: " + from + " · file: " + (file.name || "?") + "\n"
      + "sittings: runs " + runsLocal + " local (+" + runsAdded + " added) · soul " + soulLocal + " local (+" + soulAdded + " added)\n"
      + "applied (file wins): " + fmt(applied) + "\n"
      + "only-here (local keys absent from file): " + fmt(onlyHere) + "\n"
      + "skipped: ilog chain kept (local " + locIlog + " keys vs file " + fileIlog + ") · masterlink identity kept" + (skipped.keys ? " · keys refused" : "") + (skipped.soul ? " · " + skipped.soul : "") + "\n"
      + "sealed: " + sealLine;
    say('<div class="rise"><div class="rhead">🎒 ROAM IMPORT — ' + esc(selfUrl()) + '</div>'
      + '<div class="rrow"><b>SITTINGS</b><span class="vd">' + runsLocal + ' runs · ' + soulLocal + ' soul</span><div class="rd">+' + runsAdded + ' runs · +' + soulAdded + ' soul added from the file — nothing local removed</div></div>'
      + '<div class="rrow"><b>APPLIED</b><span class="vd">file wins per key</span><div class="rd">' + esc(fmt(applied)) + '</div></div>'
      + '<div class="rrow"><b>ONLY HERE</b><span class="vd">counts only</span><div class="rd">' + esc(fmt(onlyHere)) + '</div></div>'
      + '<div class="rrow"><b>SKIPPED</b><span class="vd">chain + identity</span><div class="rd">ilog chain kept (local ' + locIlog + ' vs file ' + fileIlog + ') · masterlink identity kept · sealed: ' + esc(sealLine) + '</div></div>'
      + '<div class="rrow"><b>MERGE BLOCK</b><span class="vd">paste back to HQ</span><div class="rd"><pre style="white-space:pre-wrap">' + esc(block) + '</pre></div></div></div>');
    note("roam import", (file.name || "?") + " from " + from,
      "runs +" + runsAdded + " · soul +" + soulAdded + " · applied {" + fmt(applied) + "} · chain kept", true);
    return { applied: applied, onlyHere: onlyHere, soulAdded: soulAdded, runsAdded: runsAdded, block: block };
  }

  /* -------------------------------- status -------------------------------- */
  async function doStatus(){
    var c = await census();
    var rows = Object.keys(c.kv).map(function(f){ return "<b>" + esc(f) + "</b> " + esc(String(c.kv[f])); }).join(" · ");
    var soulN = "?", runsN = "?";
    try{ var l = JSON.parse(lsGet("obi_sdnad") || "null"); if(l){ soulN = (l.soul || []).length; runsN = (l.runs || []).length; } }catch(e){}
    say('<div class="rise"><div class="rhead">🎒 ROAM STATUS — ' + esc(selfUrl()) + '</div>'
      + '<div class="rrow"><b>SITTINGS</b><span class="vd">' + runsN + ' runs · ' + soulN + ' soul</span><div class="rd">local ledger, counts only</div></div>'
      + '<div class="rrow"><b>SHELF</b><span class="vd">kv folders</span><div class="rd">' + rows + '</div></div>'
      + '<div class="rrow"><b>SECRETS</b><span class="vd">' + esc(c.secrets) + '</span><div class="rd">counts only, everywhere on this card</div></div></div>');
  }

  async function cmd(arg){
    var a = String(arg || "").trim().toLowerCase();
    if(a === "export" || a === "backup" || a === "download") return doExport();
    if(a === "import" || a === "upload" || a === "restore"){ pickImport(); say("🎒 <b>/roam import</b> — pick the merged HQ file. It is read in this browser and never uploaded."); return; }
    if(a === "status" || a === "counts" || a === "") return doStatus();
    say('🎒 <b>/roam</b> — <b>export</b> (download the shelf) · <b>import</b> (read the merged file back) · <b>status</b> (counts). Sealed stays sealed, chains are never overwritten, the file wins per key.');
  }

  window.ObiRoam = { VERSION: "1.0.0", cmd: cmd, exportShelf: doExport, importFile: doImport, pickImport: pickImport, status: doStatus, census: census };

  /* Settings → Import backup picker (the export row runs /roam export via data-run) */
  function wireSettings(){
    try{
      var btn = document.getElementById("roamImportBtn");
      var inp = document.getElementById("roamImportFile");
      if(btn && inp && !btn.dataset.roamWired){
        btn.dataset.roamWired = "1";
        btn.onclick = function(){ inp.value = ""; inp.click(); };
        inp.onchange = function(){ if(inp.files && inp.files[0]) doImport(inp.files[0]); };
      }
    }catch(e){}
  }
  if(document.readyState !== "loading") wireSettings();
  else try{ document.addEventListener("DOMContentLoaded", wireSettings); }catch(e){}
  setTimeout(wireSettings, 3000);
})();
