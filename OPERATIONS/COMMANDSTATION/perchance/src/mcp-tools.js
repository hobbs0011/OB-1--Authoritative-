/* ============================================================================
   MCP TOOLS — THE TOOL LANE (src/mcp-tools.js)
   The registry, the executor and the receipts for remote hands called from
   this station. /tool (alias /mcp). Published as window.ObiMcp.

   LANES — every tool carries one, honestly:
     LIVE — runs now, from this browser (Gateway key in obi_keys.kilo).
     DOWN — named with its reason (no endpoint yet / no Cloudflare token in
       this browser). A DOWN tool is refused with the reason, never attempted.
   The Worker project that will serve these same tools over MCP lives staged
   (NOT deployed) at src/mcp-server/ — deploy needs /cf token, which is
   BLOCKED in this browser, and the DEPLOY.md there says so.

   SECRETS — the Kilo key lives ONLY in this browser's localStorage
   (obi_keys.kilo), set with /tool key <JWT>. It never enters public source,
   never the soul ledger, never the I-LOG, never a receipt. Receipts carry
   the model, byte counts, usage and timing — never the key, never the full
   prompt (500-char head only).
   ========================================================================== */
(function(){
"use strict";
var GATE = "https://ai-gateway.kilo.ai/api/v1";
var DEF_MODEL = "kilo-auto/free";
var OR_BASE = "https://openrouter.ai/api/v1";
var DEF_OR_MODEL = "deepseek/deepseek-v4-flash";
function folder(){ try{ return (root && root.kv) ? (root.kv.mcp || null) : null; }catch(e){ return null; } }
  function kiloKey(){ try{ return keyGet("kilo") || null; }catch(e){ return null; } }
  function orKey(){ try{ return keyGet("openrouter") || null; }catch(e){ return null; } }
function head(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }
async function gw(path, opts){
  var o = opts || {};
  var r = await root.superFetch(GATE + path, {
    method: o.method || "GET",
    headers: Object.assign({ "Authorization": "Bearer " + o.key }, o.json ? { "Content-Type": "application/json" } : {}),
    body: o.body
  });
  var txt = await r.text();
  var j = null; try{ j = JSON.parse(txt); }catch(e){}
  return { status: r.status, j: j, txt: txt };
}
async function runChat(a){
  var k = kiloKey();
  if(!k) throw new Error("no Kilo key in this browser — /tool key <JWT> first");
  var prompt = String((a && (a.prompt || a.text)) || "");
  if(!prompt.trim()) throw new Error("empty prompt");
  var model = (a && a.model) || DEF_MODEL;
  var max_tokens = Math.min(Math.max(parseInt((a && a.max_tokens) || "1000", 10) || 1000, 300), 2000); // floor 300: Kilo chat never starves the model — tiny budgets truncate replies (proven 2026-10-25)
  var r = await gw("/chat/completions", { key: k, method: "POST", json: true,
    body: JSON.stringify({ model: model, max_tokens: max_tokens, messages: [{ role: "user", content: prompt }] }) });
  if(r.status !== 200) throw new Error("gateway HTTP " + r.status + " — " + head(r.txt, 160));
  var txt = (r.j && r.j.choices && r.j.choices[0] && r.j.choices[0].message && r.j.choices[0].message.content) || "";
  return { model: model, reply: String(txt), usage: (r.j && r.j.usage) || null };
}
async function runModels(){
  var k = kiloKey();
  if(!k) throw new Error("no Kilo key in this browser — /tool key <JWT> first");
  var r = await gw("/models", { key: k });
  if(r.status !== 200) throw new Error("gateway HTTP " + r.status + " — " + head(r.txt, 160));
  var arr = (r.j && (r.j.data || r.j.models)) || [];
  var ids = arr.map(function(m){ return m.id || m.name; }).filter(Boolean);
  return { count: ids.length, free: ids.filter(function(id){ return /free/i.test(id); }), sample: ids.slice(0, 8) };
}
async function orAuth(key){
  var r = await root.superFetch(OR_BASE + "/auth/key", { headers: { "Authorization": "Bearer " + key } });
  var txt = await r.text();
  var j = null; try{ j = JSON.parse(txt); }catch(e){}
  return { status: r.status, j: j, txt: txt };
}
async function runOrChat(a){
  var k = orKey();
  if(!k) throw new Error("no OpenRouter key in this browser — paste it with /tool key <sk-or-…> (stored locally, never logged)");
  var prompt = String((a && (a.prompt || a.text)) || "");
  if(!prompt.trim()) throw new Error("empty prompt");
  var model = (a && a.model) || DEF_OR_MODEL;
  var max_tokens = Math.min(parseInt((a && a.max_tokens) || "1500", 10) || 1500, 8000);
  var body = { model: model, max_tokens: max_tokens, messages: [{ role: "user", content: prompt }] };
  var r = await root.superFetch(OR_BASE + "/chat/completions", {
    method: "POST", headers: Object.assign({ "Authorization": "Bearer " + k }, { "Content-Type": "application/json", "HTTP-Referer": "https://perchance.org", "X-Title": "PaiS-HQ-Command" }),
    body: JSON.stringify(body) });
  var txt = await r.text();
  var j = null; try{ j = JSON.parse(txt); }catch(e){}
  if(r.status !== 200) throw new Error("openrouter HTTP " + r.status + " — " + head(txt, 160));
  var m = (j && j.choices && j.choices[0] && j.choices[0].message) || {};
  var reply = String(m.content || "");
  if(!reply.trim()) throw new Error("the model returned nothing (reasoning-only cut? raise max_tokens)");
  return { model: model, reply: reply, usage: (j && j.usage) || null };
}
function downWhy(reason){ return async function(){ throw new Error("DOWN — " + reason); }; }
async function runCloudMcp(a){
  var base = null; try{ base = localStorage.getItem("obi_runner_url"); }catch(e){}
  if(!base) throw new Error("no runner URL remembered in this browser — /forge runner url <https://pais-mcp-cloud.…workers.dev> first");
  var tool = String((a && (a.tool || a.name)) || "");
  var args = (a && (a.arguments || a.args)) || {};
  if(!tool) throw new Error("usage: /tool run cloud_mcp '{\"tool\":\"openrouter_chat\",\"arguments\":{\"prompt\":\"…\"}}'");
  if(typeof args === "string"){ try{ args = JSON.parse(args); }catch(e){ throw new Error("arguments must be a JSON object"); } }
  var id = "c" + Date.now().toString(36);
  var r = await root.superFetch(String(base).replace(/\/+$/, "") + "/mcp", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id, method: "tools/call", params: { name: tool, arguments: args } }) });
  var txt = await r.text();
  var j = null; try{ j = JSON.parse(txt); }catch(e){ throw new Error("cloud runner HTTP " + r.status + " — " + head(txt, 120)); }
  if(!j) throw new Error("cloud runner HTTP " + r.status);
  if(j.error) throw new Error("cloud: " + String(j.error.message || JSON.stringify(j.error)).slice(0, 160));
  var res = j.result || {};
  return { via: "cloud_mcp", content: res.content, meta: res._meta || null };
}
var TOOLS = [
  { name: "gateway_chat", lane: "LIVE", desc: "chat completion via the Kilo Gateway (free lane first, usage metered)", run: runChat },
  { name: "gateway_models", lane: "LIVE", desc: "live model catalog: count + free lane + sample", run: runModels },
  { name: "openrouter_chat", lane: "LIVE", desc: "chat via OpenRouter (DeepSeek Flash default, Pro on request — metered, receipts carry cost)", run: runOrChat },
  { name: "edtech_build", lane: "DOWN", desc: "lesson build on the edtech desk", down: "no remote endpoint yet — the edtech desk has no callable lane; staged as tools/call edtech_build in src/mcp-server/worker.js for deploy day", run: downWhy("no remote endpoint yet — the edtech desk has no callable lane") },
  { name: "cloud_mcp", lane: "LIVE", desc: "the deployed runner's MCP over HTTPS (proxied tools/call) — the closed-browser brain, callable from here", run: runCloudMcp }
];
async function saveReceipt(rec){
  try{ var f = folder(); if(f) await f.set(rec.id, rec); }catch(e){}
}
function argsSummary(a){
  if(a == null) return {};
  var o = {};
  if(a.model) o.model = String(a.model).slice(0, 60);
  var p = a.prompt || a.text;
  if(p) { o.promptHead = head(p, 500); o.promptLen = String(p).length; }
  if(a.max_tokens) o.max_tokens = a.max_tokens;
  return o;
}
async function toolRun(name, args){
  var t = null, i;
  for(i = 0; i < TOOLS.length; i++) if(TOOLS[i].name === name) t = TOOLS[i];
  var at = Date.now();
  if(!t) return { ok: false, err: "unknown tool — /tool list" };
  if(t.lane !== "LIVE"){ var rec0 = { id: "T" + at.toString(36), at: at, tool: name, ms: 0, ok: false, err: t.down }; await saveReceipt(rec0); return { ok: false, err: t.down, receipt: rec0.id }; }
  var t0 = Date.now();
  try{
    var out = await t.run(args || {});
    var rec = { id: "T" + at.toString(36), at: at, tool: name, ms: Date.now() - t0, ok: true, args: argsSummary(args), out: out };
    await saveReceipt(rec);
    return { ok: true, receipt: rec.id, ms: rec.ms, out: out };
  }catch(e){
    var msg = String((e && e.message) || e).slice(0, 300);
    await saveReceipt({ id: "T" + at.toString(36), at: at, tool: name, ms: Date.now() - t0, ok: false, err: msg, args: argsSummary(args) });
    return { ok: false, err: msg };
  }
}
function laneBadge(t){ return t.lane === "LIVE" ? "LIVE" : "DOWN"; }
function card(){
  var k = kiloKey();
  var ok = orKey();
  var rows = TOOLS.map(function(t){
    return '<div class="rrow"><b>' + esc(t.name) + '</b><span class="vd">' + t.lane + '</span><div class="rd">' + esc(t.desc) + (t.down ? ' — <i>' + esc(t.down) + '</i>' : '') + '</div></div>';
  }).join("");
  addBubble("ass", '<div class="rise"><div class="rhead">🔧 Tool lane — remote hands, called from here</div>'
    + rows
    + '<div class="rrow"><b>KILO KEY</b><span class="vd">' + (k ? "held" : "missing") + '</span><div class="rd">' + (k ? esc(maskTok(k)) + ' — this browser only' : 'set with <b>/tool key &lt;JWT&gt;</b>') + '</div></div>'
    + '<div class="rrow"><b>OPENROUTER KEY</b><span class="vd">' + (ok ? "held" : "missing") + '</span><div class="rd">' + (ok ? esc(maskTok(ok)) + ' — this browser only · DeepSeek via <b>openrouter_chat</b>' : 'set with <b>/tool key &lt;sk-or-…&gt;</b>') + '</div></div>'
    + '<div class="rfoot">Use: <b>/tool list</b> · <b>/tool run &lt;name&gt; &lt;prompt-or-JSON&gt;</b> · <b>/tool key &lt;JWT&gt;|clear|test</b> · <b>/tool log [n]</b> · alias <b>/mcp</b>. Receipts in kv folder <b>mcp</b>.</div></div>');
}
async function cmd(arg){
  var text = String(arg || "").trim();
  var m = text.match(/^(\S+)([\s\S]*)$/);
  var op = (m ? m[1] : "").toLowerCase(), rest = (m ? m[2] : "").trim();
  if(!op){ card(); return; }
  if(op === "list"){
    addBubble("ass", '<div class="rise"><div class="rhead">🔧 Tools</div>' + TOOLS.map(function(t){
      return '<div class="rrow"><b>' + esc(t.name) + '</b><span class="vd">' + t.lane + '</span><div class="rd">' + esc(t.desc) + '</div></div>';
    }).join("") + '</div>');
    rrlAppend(runNoOf(), "DNA", "Obi: [/tool list — " + TOOLS.filter(function(t){return t.lane==="LIVE";}).length + " LIVE / " + TOOLS.length + "]");
    return;
  }
  if(op === "key"){
    var sub = rest.split(/\s+/).filter(Boolean);
    var verb = (sub[0] || "").toLowerCase();
    if(!verb){ addBubble("ass", "Usage: <b>/tool key &lt;JWT&gt;</b> · <b>/tool key clear</b> · <b>/tool key test</b> — stored in this browser only (obi_keys.kilo), never logged, never filed. Same slot as <b>/vault set kilo &lt;JWT&gt;</b> (sealed + recoverable)."); return; }
    if(verb === "clear"){
      var which = (sub[1] || "all").toLowerCase();
      try{ var o = JSON.parse(localStorage.getItem("obi_keys") || "{}"); if(which === "or" || which === "openrouter") delete o.openrouter; if(which === "kilo" || which === "all") delete o.kilo; localStorage.setItem("obi_keys", JSON.stringify(o)); }catch(e){}
      addBubble("ass", "🔒 Key removed from this browser (" + esc(which) + ").");
      logOp({ kind: "secret", action: "tool key clear", detail: "credential removed (" + which + ")", result: "deleted from localStorage" });
      return;
    }
    if(verb === "test"){
      var kk = kiloKey(), oo = orKey();
      if(!kk && !oo){ addBubble("ass", "No key stored. <b>/tool key &lt;JWT&gt;</b> or <b>/tool key &lt;sk-or-…&gt;</b> first."); return; }
      if(kk){
        addBubble("ass", "🔑 Testing the Kilo key — a free-lane chat (the /models catalog is public, so only inference proves a key)…");
        try{
          var out = await runModels();
          var proof = await toolRun("gateway_chat", { model:"kilo-auto/free", max_tokens:300, prompt:"Reply with exactly: ok" });
          if(!proof.ok) throw new Error(proof.err);
          var pu = (proof.out && proof.out.usage && proof.out.usage.total_tokens != null) ? " · " + proof.out.usage.total_tokens + " tokens" : "";
          addBubble("ass", "✅ Kilo live — proved by inference on <b>kilo-auto/free</b>" + pu + " · catalog <b>" + out.count + "</b> models, free lane " + out.free.length + ".<br><span class=\"rfoot\">" + esc(maskTok(kk)) + " · this browser only · receipt " + esc(proof.receipt) + "</span>");
          rrlAppend(runNoOf(), "DNA", "Obi: [/tool key test kilo — proved by inference, " + out.count + " models]");
        }catch(e){ addBubble("ass", "⚠ Kilo key held but the Gateway refused proof: " + esc(String((e && e.message) || e).slice(0, 200))); }
      }
      if(oo){
        addBubble("ass", "🔑 Testing the OpenRouter key — no-cost auth check (no inference)…");
        try{
          var chk = await orAuth(oo);
          if(chk.status !== 200) throw new Error("openrouter HTTP " + chk.status);
          var lbl = (chk.j && chk.j.data && chk.j.data.label) || "key ok";
          addBubble("ass", "✅ OpenRouter live — <b>" + esc(lbl) + "</b> · DeepSeek Flash/Pro ready via <b>openrouter_chat</b>.<br><span class=\"rfoot\">" + esc(maskTok(oo)) + " · this browser only</span>");
          rrlAppend(runNoOf(), "DNA", "Obi: [/tool key test openrouter — auth ok]");
        }catch(e){ addBubble("ass", "⚠ OpenRouter key held but refused: " + esc(String((e && e.message) || e).slice(0, 200))); }
      }
      return;
    }
    var jwt = sub.join(" ");
    if(/^sk-or-v1-[A-Za-z0-9]+$/.test(jwt)){
      var st2 = keyStore({ openrouter: jwt });
      if(!st2.ok){ addBubble("ass", "⛔ <b>NOT STORED.</b> " + esc(st2.why) + ". Nothing was saved."); return; }
      addBubble("ass", "🔑 OpenRouter key stored locally <span style=\"opacity:.7\">(written and read back)</span> — " + esc(maskTok(jwt)) + ".<br><span class=\"rfoot\">Held in this browser only; never in public source, never soul, never the I-LOG. <b>openrouter_chat</b> drives DeepSeek Flash by default, Pro on request. <b>/tool key test</b> to verify · <b>/tool key clear or</b> to remove.</span>");
      logOp({ kind:"secret", action:"tool key", detail:"openrouter stored in this browser only (value never logged)", result:maskTok(jwt) });
      rrlAppend(runNoOf(), "DNA", "Obi: [/tool key openrouter stored]");
      return;
    }
    if(!/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(jwt)){ addBubble("ass", "⛔ That looks like neither a Kilo JWT (eyJ…...…) nor an OpenRouter key (sk-or-v1-…). Nothing stored."); return; }
    var st = keyStore({ kilo: jwt });
    if(!st.ok){ addBubble("ass", "⛔ <b>NOT STORED.</b> " + esc(st.why) + ". Nothing was saved."); return; }
    addBubble("ass", "🔑 Kilo key stored locally <span style=\"opacity:.7\">(written and read back)</span> — " + esc(maskTok(jwt)) + ".<br><span class=\"rfoot\">Held in this browser only; never in public source, never soul, never the I-LOG. <b>/tool key test</b> to verify · <b>/tool key clear</b> to remove.</span>");
    logOp({ kind: "secret", action: "tool key", detail: "stored in this browser only (value never logged)", result: maskTok(jwt) });
    rrlAppend(runNoOf(), "DNA", "Obi: [/tool key stored]");
    return;
  }
  if(op === "run"){
    var parts = rest.split(/\s+/).filter(Boolean);
    var name = (parts[0] || "").toLowerCase();
    var tail = rest.slice(parts[0] ? parts[0].length : 0).trim();
    if(!name){ addBubble("ass", "Usage: <b>/tool run &lt;name&gt; &lt;prompt-or-JSON&gt;</b> — e.g. <b>/tool run gateway_chat Reply with exactly: relay ok</b>"); return; }
    var args = {};
    if(tail){
      try{ var pj = JSON.parse(tail); if(pj && typeof pj === "object") args = pj; else args = { prompt: tail }; }
      catch(e){ args = { prompt: tail }; }
    }
    addBubble("ass", "🔧 Calling <b>" + esc(name) + "</b>…");
    var res = await toolRun(name, args);
    if(!res.ok){ addBubble("ass", "⛔ <b>" + esc(name) + "</b> refused: " + esc(res.err) + (res.receipt ? ' <span style="opacity:.7">(receipt ' + esc(res.receipt) + ')</span>' : "")); rrlAppend(runNoOf(), "DNA", "Obi: [/tool run " + name + " — refused]"); return; }
    var o = res.out || {};
    if(name === "gateway_chat"){
      addBubble("ass", '<div class="rise"><div class="rhead">🔧 gateway_chat · ' + esc(o.model || "") + '</div><div class="rd">' + esc(o.reply || "(empty)") + '</div><div class="rfoot">receipt ' + esc(res.receipt) + ' · ' + res.ms + ' ms' + (o.usage ? ' · ' + esc(JSON.stringify(o.usage)) : '') + ' · kv folder <b>mcp</b></div></div>');
    }else if(name === "openrouter_chat"){
      var cost = (o.usage && o.usage.cost != null) ? "cost $" + Number(o.usage.cost).toFixed(6) + " · " : "", oReply = String(o.reply || "(empty)");
      addBubble("ass", '<div class="rise"><div class="rhead">OPENROUTER · ' + esc(o.model || "") + '</div><div class="rd">' + esc(oReply) + '</div><div class="rfoot">receipt ' + esc(res.receipt) + ' · ' + res.ms + ' ms · ' + esc(cost) + 'kv folder <b>mcp</b></div></div>');
    }else if(name === "gateway_models"){
      addBubble("ass", '<div class="rise"><div class="rhead">🔧 gateway_models · ' + o.count + ' models</div><div class="rrow"><b>FREE LANE</b><span class="vd">' + o.free.length + '</span><div class="rd">' + esc(o.free.slice(0, 10).join(", ")) + (o.free.length > 10 ? "…" : "") + '</div></div><div class="rrow"><b>SAMPLE</b><span class="vd">8</span><div class="rd">' + esc((o.sample || []).join(", ")) + '</div></div><div class="rfoot">receipt ' + esc(res.receipt) + ' · ' + res.ms + ' ms</div></div>');
    }else{
      addBubble("ass", '<div class="rise"><div class="rhead">🔧 ' + esc(name) + '</div><div class="rd">' + esc(JSON.stringify(o).slice(0, 2000)) + '</div><div class="rfoot">receipt ' + esc(res.receipt) + ' · ' + res.ms + ' ms</div></div>');
    }
    rrlAppend(runNoOf(), "DNA", "Obi: [/tool run " + name + " — ok, receipt " + res.receipt + "]");
    return;
  }
  if(op === "log"){
    var n = parseInt(rest, 10) || 5;
    n = Math.max(1, Math.min(n, 20));
    var ks = [];
    try{ var f = folder(); if(f) ks = await f.keys(); }catch(e){}
    ks = (ks || []).slice(-n).reverse();
    if(!ks.length){ addBubble("ass", "No tool receipts yet — <b>/tool run …</b> writes the first one."); return; }
    var rows = "";
    for(var i = 0; i < ks.length; i++){
      var r2 = null; try{ r2 = await folder().get(ks[i]); }catch(e){}
      if(!r2) continue;
      rows += '<div class="rrow"><b>' + esc(r2.tool || "?") + '</b><span class="vd">' + (r2.ok ? "ok" : "FAIL") + ' · ' + (r2.ms || 0) + 'ms</span><div class="rd">' + esc(r2.id) + ' · ' + new Date(r2.at).toLocaleString() + (r2.err ? ' · ' + esc(head(r2.err, 120)) : '') + '</div></div>';
    }
    addBubble("ass", '<div class="rise"><div class="rhead">🧾 Tool receipts (last ' + ks.length + ')</div>' + rows + '</div>');
    return;
  }
  addBubble("ass", "Usage: <b>/tool</b> · <b>list</b> · <b>run &lt;name&gt; &lt;args&gt;</b> · <b>key &lt;JWT&gt;|clear|test</b> · <b>log [n]</b>");
}
window.ObiMcp = { cmd: cmd, run: toolRun, list: function(){ return TOOLS.map(function(t){ return { name: t.name, lane: t.lane, desc: t.desc }; }); } };
})();
