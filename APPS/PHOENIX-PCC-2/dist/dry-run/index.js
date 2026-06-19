var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/forceawareness.js
var AUTH = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=";
var SELF = { name: "pcc2-anakin", url: "https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev" };
var PEERS = [
  { name: "pcc1-obi", url: "https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev" },
  { name: "pcc3-windu", url: "https://phoenix-architecti.mrmichaelhobbs123.workers.dev" }
];
async function sendTelegram(env, msg) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" })
  }).catch(() => {
  });
}
__name(sendTelegram, "sendTelegram");
async function pingPeers(env, alertMsg) {
  for (const peer of PEERS) {
    await fetch(`${peer.url}/api/message`, {
      method: "POST",
      headers: { "x-pa-auth": AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ message: alertMsg })
    }).catch(() => {
    });
  }
}
__name(pingPeers, "pingPeers");
async function updatePheromoneTrail(env, pccName, delta = {}) {
  const trailKey = "phetrail:latest";
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || "{}");
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  if (!trail.positive_trails) trail.positive_trails = [];
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.pcc_metrics) trail.state_markers.pcc_metrics = {};
  trail.state_markers.pcc_metrics[pccName] = { ts, ...delta };
  trail.state_markers.last_updated = ts;
  await env.PHETRAIL.put(trailKey, JSON.stringify(trail));
  return trail;
}
__name(updatePheromoneTrail, "updatePheromoneTrail");
async function readPheromoneTrail(env) {
  const trailKey = "phetrail:latest";
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || "{}");
  return trail;
}
__name(readPheromoneTrail, "readPheromoneTrail");
async function runWatchdog(env) {
  const now = Date.now();
  const results = [];
  const trail = await readPheromoneTrail(env);
  for (const pcc of PEERS) {
    const lastBatchesKey = `force:${pcc.name}:last_batches`;
    const restartsKey = `force:${pcc.name}:restarts`;
    let status = null;
    let dead = false;
    let reason = "";
    try {
      const r = await fetch(`${pcc.url}/api/race/status`, { headers: { "x-pa-auth": AUTH } });
      if (!r.ok) {
        dead = true;
        reason = `status ${r.status}`;
      } else {
        status = await r.json();
        if (status.elapsed_ms >= status.budget_ms) {
          dead = true;
          reason = "budget_exhausted";
        } else {
          const lastBatches = parseInt(await env.PHETRAIL.get(lastBatchesKey) || "0");
          if (status.batches_run <= lastBatches && status.batches_run > 0) {
            dead = true;
            reason = "stalled";
          }
        }
      }
    } catch (e) {
      dead = true;
      reason = e.message;
    }
    if (status) await env.PHETRAIL.put(lastBatchesKey, String(status.batches_run));
    if (dead) {
      const alert = `\u{1F6A8} *Agent 99 OS ALERT*
${SELF.name} ForceAwareness: *${pcc.name}* is DOWN
Reason: ${reason}
Time: ${new Date(now).toISOString()}`;
      await sendTelegram(env, alert);
      await pingPeers(env, `WATCHDOG ALERT from ${SELF.name}: ${pcc.name} is DOWN \u2014 reason: ${reason}. Auto-restart attempted.`);
      try {
        await fetch(`${pcc.url}/api/race/start`, {
          method: "POST",
          headers: { "x-pa-auth": AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({ budget_ms: 108e5 })
        });
        const restarts = parseInt(await env.PHETRAIL.get(restartsKey) || "0") + 1;
        await env.PHETRAIL.put(restartsKey, String(restarts));
        const log = JSON.parse(await env.PHETRAIL.get("force:log") || "[]");
        log.push({ ts: now, reporter: SELF.name, pcc: pcc.name, reason, restarted: true });
        if (log.length > 100) log.splice(0, log.length - 100);
        await env.PHETRAIL.put("force:log", JSON.stringify(log));
        results.push({ pcc: pcc.name, dead, reason, restarted: true });
      } catch (e) {
        results.push({ pcc: pcc.name, dead, reason, restart_error: e.message });
      }
    } else {
      results.push({ pcc: pcc.name, dead: false, batches: status?.batches_run, score: status?.score });
    }
  }
  await env.PHETRAIL.put("force:status", JSON.stringify({ checked_at: now, reporter: SELF.name, results }));
  await updatePheromoneTrail(env, SELF.name, { force_awareness: true, peers_checked: results.length, dead_count: results.filter((r) => r.dead).length });
  return results;
}
__name(runWatchdog, "runWatchdog");
async function handleForce(request, env) {
  const status = await env.PHETRAIL.get("force:status", { type: "json" });
  const log = await env.PHETRAIL.get("force:log", { type: "json" });
  const restarts = {};
  for (const pcc of PEERS) {
    restarts[pcc.name] = parseInt(await env.PHETRAIL.get(`force:${pcc.name}:restarts`) || "0");
  }
  return Response.json({ reporter: SELF.name, status, log: (log || []).slice(-20), restarts });
}
__name(handleForce, "handleForce");
var ForceAwareness = runWatchdog;

// src/index.js
var PA_AUTH = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=";
var FLEET_ID = "pcc-2";
function checkAuth(request) {
  const key = request.headers.get("x-pa-auth") || request.headers.get("Authorization")?.replace("Bearer ", "");
  return key === PA_AUTH;
}
__name(checkAuth, "checkAuth");
async function writeMajorDirectiveMarker(env, source, message) {
  const kv = env.PHETRAIL;
  if (!kv || !message) return;
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const marker = {
    ts,
    source,
    message: String(message).slice(0, 2e3),
    keywords: ["Agent99", "FORCEAWARENESS", "PCC1", "PCC2", "PCC3", "PhoenixCoder", "PhoenixArt", "role", "Agent99 OS", "Agent99 Genesis Boot", "Role Boot"].filter((k) => String(message).toLowerCase().includes(k.toLowerCase()))
  };
  await kv.put(`phetrail:major-directive:${Date.now()}`, JSON.stringify(marker));
  const trail = JSON.parse(await kv.get("phetrail:latest") || "{}");
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.major_directives) trail.state_markers.major_directives = [];
  trail.state_markers.major_directives.unshift(marker);
  trail.state_markers.major_directives = trail.state_markers.major_directives.slice(0, 50);
  trail.state_markers.last_updated = ts;
  await kv.put("phetrail:latest", JSON.stringify(trail));
}
__name(writeMajorDirectiveMarker, "writeMajorDirectiveMarker");
async function taskTranslate(env) {
  if (!env.AI || !env.DB) return { task: "translate", processed: 0 };
  const rows = await env.DB.prepare("SELECT * FROM backburner WHERE status='OPEN' AND source='translate-queue' LIMIT 5").all();
  let processed = 0;
  for (const row of rows.results || []) {
    try {
      const res = await env.AI.run("@cf/meta/m2m100-1.2b", { text: row.description || row.title, source_lang: "en", target_lang: "vi" });
      const translated = res?.translated_text || "";
      if (translated) {
        await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', description=?, updated_at=? WHERE bb_id=?").bind(`[VI] ${translated}
[EN] ${row.description}`, (/* @__PURE__ */ new Date()).toISOString(), row.bb_id).run();
        processed++;
      }
    } catch {
    }
  }
  return { task: "translate", processed };
}
__name(taskTranslate, "taskTranslate");
async function taskLostSoulScan(env) {
  if (!env.AI || !env.DB) return { task: "lostsoul-scan", processed: 0 };
  const rows = await env.DB.prepare("SELECT id, run_number, rrl_raw FROM rrl_archive WHERE lostsoul_scan_done=0 LIMIT 2").all();
  let processed = 0;
  for (const row of rows.results || []) {
    try {
      const lines = (row.rrl_raw || "").split("\n").filter((l) => l.trim());
      const userLines = lines.filter((l) => /^(Human:|SOV100:|Michael:)/i.test(l)).map((l) => l.replace(/^(Human:|SOV100:|Michael:)/i, "").trim()).join("\n");
      if (!userLines) continue;
      const aiResult = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "user", content: `Extract every directive/demand from SOV100 verbatim. Return JSON array of strings only.

${userLines.slice(0, 5e3)}` }],
        max_tokens: 600
      });
      let directives = [];
      try {
        const m = (aiResult?.response || "").match(/\[[\s\S]*\]/);
        if (m) directives = JSON.parse(m[0]);
      } catch {
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await env.DB.prepare("UPDATE rrl_archive SET lostsoul_scan_done=1, lostsoul_count=?, scanned_at=? WHERE id=?").bind(directives.length, now, row.id).run();
      for (const d of directives.slice(0, 10)) {
        if (typeof d === "string" && d.length > 10) {
          const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await env.DB.prepare("INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(bb_id, `PCC2 LostSoul R${row.run_number}: ${d.slice(0, 80)}`, d, "pcc2-lostsoul", "~", now, now).run().catch(() => {
          });
        }
      }
      processed++;
    } catch {
    }
  }
  return { task: "lostsoul-scan", processed };
}
__name(taskLostSoulScan, "taskLostSoulScan");
async function taskCompletenessAudit(env) {
  if (!env.AI || !env.DB) return { task: "completeness-audit", processed: 0 };
  const row = await env.DB.prepare("SELECT id, run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 1").first();
  if (!row) return { task: "completeness-audit", processed: 0 };
  const aiResult = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{ role: "user", content: `Find requests from the user (Human/SOV100) that the assistant did NOT execute. Return verbatim JSON array only. Return [] if all executed.

${(row.rrl_raw || "").slice(0, 6e3)}` }],
    max_tokens: 500
  });
  let gaps = [];
  try {
    const m = (aiResult?.response || "").match(/\[[\s\S]*\]/);
    if (m) gaps = JSON.parse(m[0]);
  } catch {
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const g of gaps.slice(0, 8)) {
    if (typeof g === "string" && g.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare("INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(bb_id, `PCC2 Audit R${row.run_number}: ${g.slice(0, 80)}`, g, "pcc2-audit", "!", now, now).run().catch(() => {
      });
    }
  }
  return { task: "completeness-audit", processed: gaps.length };
}
__name(taskCompletenessAudit, "taskCompletenessAudit");
async function taskPatternScan(env) {
  if (!env.AI || !env.DB) return { task: "pattern-scan", processed: 0 };
  const recent = await env.DB.prepare("SELECT run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 5").all();
  if (!recent.results?.length) return { task: "pattern-scan", processed: 0 };
  const combined = recent.results.map((r) => `=== RUN ${r.run_number} ===
${(r.rrl_raw || "").slice(0, 1200)}`).join("\n\n");
  const aiResult = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{ role: "user", content: `Find recurring unresolved topics across these sessions. Return JSON array of strings only.

${combined.slice(0, 7e3)}` }],
    max_tokens: 400
  });
  let patterns = [];
  try {
    const m = (aiResult?.response || "").match(/\[[\s\S]*\]/);
    if (m) patterns = JSON.parse(m[0]);
  } catch {
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const p of patterns.slice(0, 6)) {
    if (typeof p === "string" && p.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare("INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(bb_id, `PCC2 Pattern: ${p.slice(0, 80)}`, p, "pcc2-pattern", "!", now, now).run().catch(() => {
      });
    }
  }
  return { task: "pattern-scan", processed: patterns.length };
}
__name(taskPatternScan, "taskPatternScan");
async function taskCodeQueue(env) {
  if (!env.DB) return { task: "code-queue", processed: 0 };
  const PA_BASE = "https://phoenix-architecti.mrmichaelhobbs123.workers.dev";
  const rows = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status IN ('OPEN','IN_PROGRESS') AND (source LIKE 'obi-%' OR source='code-queue') ORDER BY priority ASC, created_at ASC LIMIT 3"
  ).all().catch(() => ({ results: [] }));
  let processed = 0;
  for (const row of rows.results || []) {
    try {
      const resp = await fetch(`${PA_BASE}/api/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pa-auth": PA_AUTH },
        body: JSON.stringify({ task: row.title, context: row.description || "", tier: 1 })
      });
      if (!resp.ok) continue;
      const { patch, model } = await resp.json();
      if (!patch || patch.length < 5) continue;
      const result = `[PCC2-executed | model=${model}]
${patch}`;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await env.DB.prepare(
        "UPDATE backburner SET status='PENDING_CLOSE', description=?, close_reason=?, updated_at=? WHERE bb_id=?"
      ).bind(`${row.description || ""}

RESULT:
${result}`.slice(0, 4e3), "PCC2 code-queue executed", now, row.bb_id).run();
      if (env.PHETRAIL) {
        await env.PHETRAIL.put(`bb-result:${row.bb_id}`, result, { expirationTtl: 604800 }).catch(() => {
        });
      }
      await env.DB.prepare(
        "INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind("pcc2", row.title.slice(0, 100), (row.description || "").length, model || "pa-t1", 0, patch.length, 1, null).run().catch(() => {
      });
      processed++;
    } catch {
    }
  }
  return { task: "code-queue", processed };
}
__name(taskCodeQueue, "taskCodeQueue");
async function taskBriefScan(env) {
  if (!env.DB || !env.PHETRAIL) return { task: "brief-scan", processed: 0 };
  const students = ["mai-tram-bluetech", "huong-bluetech", "sov100-michael"];
  const stale = [];
  for (const userId of students) {
    const meta = await env.PHETRAIL.get(`actualizer:${userId}:meta`).catch(() => null);
    if (!meta) {
      stale.push(userId);
      continue;
    }
    const { generated_at } = JSON.parse(meta);
    const age = Date.now() - new Date(generated_at).getTime();
    if (age > 432e5) stale.push(userId);
  }
  if (stale.length) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const bb_id = `BB-${Date.now()}`;
    await env.DB.prepare("INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(bb_id, `PCC2 Stale briefs: ${stale.join(", ")}`, `These users have no brief or brief >12h old: ${stale.join(", ")}`, "pcc2-brief-scan", "~", now, now).run().catch(() => {
    });
    await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='brief-scan-logged', updated_at=? WHERE bb_id=?").bind(now, bb_id).run().catch(() => {
    });
  }
  return { task: "brief-scan", stale: stale.length };
}
__name(taskBriefScan, "taskBriefScan");
async function runFleet(env) {
  const [t1, t2, t3, t4, t5, t6] = await Promise.allSettled([
    taskTranslate(env),
    taskLostSoulScan(env),
    taskCompletenessAudit(env),
    taskPatternScan(env),
    taskCodeQueue(env),
    taskBriefScan(env)
  ]);
  return [t1, t2, t3, t4, t5, t6].map((r) => r.status === "fulfilled" ? r.value : { error: r.reason?.message });
}
__name(runFleet, "runFleet");
var RaceRunner = class {
  static {
    __name(this, "RaceRunner");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/start" && request.method === "POST") return this.handleStart(request);
    if (url.pathname === "/status") return this.handleStatus();
    if (url.pathname === "/stop") return this.handleStop();
    return new Response("not found", { status: 404 });
  }
  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = body.budget_ms || 36e5;
    const now = Date.now();
    await this.state.storage.put("run_state", {
      start_time: now,
      budget_ms,
      batches_run: 0,
      actualizers_run: 0,
      discoveries_count: 0,
      errors_count: 0,
      death_runs: 0
    });
    await this.state.storage.setAlarm(now + 1e3);
    return Response.json({ ok: true, started_at: now, budget_ms });
  }
  async alarm() {
    const state = await this.state.storage.get("run_state");
    if (!state) return;
    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      return;
    }
    const batch = await this.runBatch(state);
    const updated = {
      ...state,
      batches_run: state.batches_run + 1,
      actualizers_run: state.actualizers_run + (batch.actualizers || 0),
      discoveries_count: state.discoveries_count + (batch.discoveries || 0),
      errors_count: state.errors_count + (batch.errors || 0),
      death_runs: state.death_runs + (batch.death_runs || 0)
    };
    await this.state.storage.put("run_state", updated);
    await this.writeMetrics(updated, false);
    await this.state.storage.setAlarm(Date.now() + 3e4);
  }
  async runBatch(state) {
    let actualizers = 0, discoveries = 0, errors = 0, death_runs = 0;
    try {
      const soulCheck = await fetch("https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count").then((r) => r.json()).catch(() => null);
      if (soulCheck) {
        actualizers++;
        const count = soulCheck.total_bytes || soulCheck.count || 0;
        if (count > 0) discoveries++;
      }
    } catch (e) {
      errors++;
    }
    const soulSeeds = ["#SOUL", "#SOULDNA", "#RAW", "#FUCK", "#OMG", "LISTEN", "#MONKEY", "#YES", "#SSK", "#LEDGER", "#AGENT99", "Obi", "OB1", "#DRIFT"];
    const kvPrefixes = ["pending:rrl:", "registry:run:", "death:"];
    for (const prefix of kvPrefixes) {
      try {
        const listed = await this.env.PHETRAIL.list({ prefix }).catch(() => ({ keys: [] }));
        for (const key of listed.keys.slice(0, 5)) {
          const val = await this.env.PHETRAIL.get(key.name).catch(() => "");
          if (val) {
            const hits = soulSeeds.filter((s) => val.includes(s)).length;
            if (hits > 0) {
              discoveries += hits;
              actualizers++;
            }
          }
        }
      } catch (e) {
        errors++;
      }
    }
    try {
      const siblingScore = await this.env.PHETRAIL.get("race:pcc-student:metrics").catch(() => null);
      if (siblingScore) discoveries++;
    } catch (e) {
    }
    try {
      const kv2 = this.env.PHETRAIL || this.env.PHETRAIL;
      if (kv2) {
        const bbKeys = await kv2.list({ prefix: "bb:pending:" }).catch(() => ({ keys: [] }));
        for (const key of bbKeys.keys.slice(0, 5)) {
          const task = await kv2.get(key.name, { type: "json" }).catch(() => null);
          if (task) {
            discoveries++;
            actualizers++;
            await kv2.put(key.name.replace("pending:", "done:"), JSON.stringify({ ...task, processed_at: Date.now() }));
            await kv2.delete(key.name);
          }
        }
      }
    } catch (e) {
      errors++;
    }
    const kv = this.env.PHETRAIL || this.env.PHETRAIL;
    if (kv) {
      const keys = await kv.list({ prefix: "pending:rrl:" }).catch(() => ({ keys: [] }));
      for (const key of keys.keys.slice(0, 2)) {
        const run_number = key.name.split(":")[2];
        const rrl_text = await kv.get(key.name);
        if (rrl_text) {
          const result = await this.runDeathPipeline(run_number, rrl_text);
          if (result.ok) {
            death_runs++;
            discoveries += result.discoveries || 0;
            await kv.delete(key.name);
          }
        }
      }
    }
    return { actualizers, discoveries, errors, death_runs };
  }
  async runDeathPipeline(run_number, rrl_text) {
    const lines = rrl_text.split("\n");
    const soul_count = lines.filter((l) => l.includes('"role":"user"') || l.startsWith("Michael:") || l.startsWith("User:")).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter((l) => l.includes('"role":"assistant"') || l.startsWith("Claude:")).length || Math.floor(lines.length * 0.6);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rrl_text));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const ledger_id = `HL-${run_number}`;
    const soulSeeds = ["#SOUL", "#SOULDNA", "#RAW", "#FUCK", "#OMG", "LISTEN", "#MONKEY", "#YES", "#SSK", "#LEDGER", "#AGENT99", "Obi", "OB1", "#DRIFT"];
    const soulkeys_hit = soulSeeds.filter((k) => rrl_text.includes(k)).length;
    const kv = this.env.PHETRAIL || this.env.PHETRAIL;
    if (kv) {
      await Promise.all([
        kv.put(`death:${run_number}:soul`, String(soul_count)),
        kv.put(`death:${run_number}:dna`, String(dna_count)),
        kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
        kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0, 200) })),
        kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() }))
      ]);
    }
    return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
  }
  async writeMetrics(state, final) {
    const score = state.batches_run * 10 + state.actualizers_run * 5 + state.discoveries_count * 20 + state.death_runs * 50;
    const metrics = { agent_id: "pcc-ops", ...state, elapsed_ms: Date.now() - state.start_time, score, final };
    const kv = this.env.PHETRAIL || this.env.PHETRAIL;
    if (kv) await kv.put("race:pcc-ops:metrics", JSON.stringify(metrics));
  }
  async handleStatus() {
    const state = await this.state.storage.get("run_state");
    if (!state) return Response.json({ ok: false, error: "not started" });
    const score = state.batches_run * 10 + state.actualizers_run * 5 + state.discoveries_count * 20 + state.death_runs * 50;
    return Response.json({ ...state, elapsed_ms: Date.now() - state.start_time, score });
  }
  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get("run_state");
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true });
  }
};
var index_default = {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ForceAwareness(env).catch(() => {
    }));
    await runFleet(env).catch(() => {
    });
  },
  async fetch(request, env) {
    if (!checkAuth(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/api/status") {
      return Response.json({ worker: FLEET_ID, tasks: ["translate", "lostsoul-scan", "completeness-audit", "pattern-scan", "brief-scan"], status: "LIVE", features: ["race-runner", "session-death"] });
    }
    if (pathname === "/api/run-fleet" && request.method === "POST") {
      const results = await runFleet(env).catch((e) => [{ error: e.message }]);
      return Response.json({ ok: true, fleet: FLEET_ID, results });
    }
    if (pathname.startsWith("/api/race/")) {
      if (!env.LEGION_RUNNER) return Response.json({ error: "LEGION_RUNNER DO not bound" }, { status: 503 });
      const id = env.LEGION_RUNNER.idFromName("singleton");
      const stub = env.LEGION_RUNNER.get(id);
      return stub.fetch(new Request("https://race" + pathname.replace("/api/race", ""), request));
    }
    if (pathname === "/api/session/death" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { run_number, rrl_text } = body;
      if (!run_number || !rrl_text) {
        return Response.json({ error: "run_number and rrl_text required" }, { status: 400 });
      }
      const lines = rrl_text.split("\n");
      const soul_count = lines.filter((l) => l.includes('"role":"user"') || l.startsWith("Michael:") || l.startsWith("User:")).length || Math.floor(lines.length * 0.4);
      const dna_count = lines.filter((l) => l.includes('"role":"assistant"') || l.startsWith("Claude:")).length || Math.floor(lines.length * 0.6);
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rrl_text));
      const sha256 = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const ledger_id = `HL-${run_number}`;
      const soulSeeds = ["#SOUL", "#SOULDNA", "#RAW", "#FUCK", "#OMG", "LISTEN", "#MONKEY", "#YES", "#SSK", "#LEDGER", "#AGENT99", "Obi", "OB1", "#DRIFT"];
      const soulkeys_hit = soulSeeds.filter((k) => rrl_text.includes(k)).length;
      const kv = env.SOUL_KV || env.PHETRAIL;
      if (kv) {
        await Promise.all([
          kv.put(`death:${run_number}:soul`, String(soul_count)),
          kv.put(`death:${run_number}:dna`, String(dna_count)),
          kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 })),
          kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id: `SM-${run_number}`, summary: rrl_text.substring(0, 200) })),
          kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit)),
          kv.put(`registry:run:${run_number}`, JSON.stringify({ run_number, ledger_id, soul_count, dna_count, processed_at: Date.now() }))
        ]);
      }
      return Response.json({ ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 });
    }
    if (pathname === "/api/message" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      await writeMajorDirectiveMarker(env, "pcc2-anakin", body.message).catch(() => {
      });
      return Response.json({ ok: true, received: true, agent: "pcc2-anakin", message: body.message });
    }
    if (pathname === "/api/rise" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { run_number } = body;
      const kv = env.PHETRAIL;
      if (!kv) return Response.json({ ok: false, error: "no kv binding" }, { status: 500 });
      const [soul, dna, ledger, skeys] = await Promise.all([
        kv.get("death:" + run_number + ":soul"),
        kv.get("death:" + run_number + ":dna"),
        kv.get("death:" + run_number + ":ledger"),
        kv.get("death:" + run_number + ":soulkeys")
      ]);
      if (!soul && !dna) return Response.json({ ok: false, error: "run not found", run_number }, { status: 404 });
      const gaps = [];
      if (!soul || soul === "0") gaps.push("SOUL_ZERO");
      if (!dna || dna === "0") gaps.push("DNA_ZERO");
      if (!ledger) gaps.push("NO_LEDGER");
      return Response.json({ ok: true, run_number, audit: { soul_ok: !!soul && soul !== "0", dna_ok: !!dna && dna !== "0", ledger_ok: !!ledger, soulkeys: Number(skeys) || 0, gaps }, rise_complete: gaps.length === 0 });
    }
    if (pathname === "/api/act" && request.method === "POST") {
      const start = Date.now();
      const { act_id, task, context } = await request.json().catch(() => ({}));
      const specialties = { 1: "translate", 2: "lostsoul-scan", 3: "completeness-audit", 4: "pattern-scan", 5: "brief-scan" };
      const specialty = specialties[act_id];
      if (!specialty) return Response.json({ ok: false, error: "invalid act_id" }, { status: 400 });
      try {
        const ai = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: [
            { role: "system", content: `You are ACT-${act_id} specialist: ${specialty}. Be concise.` },
            { role: "user", content: task + (context ? " Context: " + context : "") }
          ]
        });
        return Response.json({ ok: true, act_id, specialty, result: ai.response, ms: Date.now() - start });
      } catch (e) {
        return Response.json({ ok: false, error: e.message, act_id }, { status: 500 });
      }
    }
    if (pathname === "/api/force/start" && request.method === "POST") {
      const id = env.FORCEAWARENESS_ALARM.idFromName("heartbeat");
      const stub = env.FORCEAWARENESS_ALARM.get(id);
      await stub.fetch("https://fake/start");
      return Response.json({ ok: true, status: "heartbeat_started_30s" });
    }
    if (pathname === "/api/force/status") return handleForce(request, env);
    return Response.json({ error: "Not found", worker: FLEET_ID }, { status: 404 });
  }
};
var WatchdogAlarm = class {
  static {
    __name(this, "WatchdogAlarm");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/start") {
      const current = await this.state.storage.getAlarm();
      if (!current) await this.state.storage.setAlarm(Date.now() + 3e4);
      return Response.json({ ok: true, status: "heartbeat_started" });
    }
    if (url.pathname === "/stop") {
      await this.state.storage.deleteAlarm();
      return Response.json({ ok: true, status: "heartbeat_stopped" });
    }
    return Response.json({ ok: true, status: "alive" });
  }
  async alarm() {
    await ForceAwareness(this.env).catch(() => {
    });
    await this.state.storage.setAlarm(Date.now() + 3e4);
  }
};
var LegionRunner = class extends RaceRunner {
  static {
    __name(this, "LegionRunner");
  }
};
export {
  WatchdogAlarm as ForceAwarenessAlarm,
  LegionRunner,
  RaceRunner,
  WatchdogAlarm,
  index_default as default
};
//# sourceMappingURL=index.js.map
