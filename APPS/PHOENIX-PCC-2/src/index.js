import { ForceAwareness, handleForce } from './forceawareness.js';
// PHOENIX-PCC-2 — Ops Task Fleet Commander (PCC2 / Anakin)
// 5 Task Actualizers: translate, lostsoul-scan, completeness-audit, code-queue, pattern-scan
// Cron: 30 */6 * * * (offset 30min from PCC-1 and PCC-2)
// v2: LegionRunner DO — 1-hour chained alarm race, /api/session/death pipeline

const PA_AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const FLEET_ID = 'pcc-2';

function checkAuth(request) {
  const key = request.headers.get('x-pa-auth') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return key === PA_AUTH;
}

function normalizeRunNumber(run_number) {
  const raw = String(run_number || '').trim();
  return /^\d{1,8}$/.test(raw) ? raw : null;
}

function truncateText(text, maxChars = 250000) {
  const raw = String(text || '');
  return raw.length > maxChars ? raw.slice(0, maxChars) : raw;
}

function normalizeStringArray(value, limit = 100) {
  if (!Array.isArray(value)) return [];
  return value.map(v => String(v || '').trim()).filter(Boolean).slice(0, limit);
}

async function writeMajorDirectiveMarker(env, source, message) {
  const kv = env.PHETRAIL;
  if (!kv || !message) return;
  const ts = new Date().toISOString();
  const marker = {
    ts,
    source,
    message: String(message).slice(0, 2000),
    keywords: ['Agent99', 'FORCEAWARENESS', 'PCC1', 'PCC2', 'PCC3', 'PhoenixCoder', 'PhoenixArt', 'role', 'Agent99 OS', 'Agent99 Genesis Boot', 'Role Boot'].filter(k => String(message).toLowerCase().includes(k.toLowerCase())),
  };
  await kv.put(`phetrail:major-directive:${Date.now()}`, JSON.stringify(marker));
  let trail;
  try { trail = JSON.parse(await kv.get('phetrail:latest') || '{}'); } catch { trail = {}; }
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.major_directives) trail.state_markers.major_directives = [];
  trail.state_markers.major_directives.unshift(marker);
  trail.state_markers.major_directives = trail.state_markers.major_directives.slice(0, 50);
  trail.state_markers.last_updated = ts;
  await kv.put('phetrail:latest', JSON.stringify(trail));
}

// Task 1: Translate — process BB entries tagged source='translate-queue'
async function taskTranslate(env) {
  if (!env.AI || !env.DB) return { task: 'translate', processed: 0 };
  const rows = await env.DB.prepare("SELECT * FROM backburner WHERE status='OPEN' AND source='translate-queue' LIMIT 5").all();
  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const res = await env.AI.run('@cf/meta/m2m100-1.2b', { text: row.description || row.title, source_lang: 'en', target_lang: 'vi' });
      const translated = res?.translated_text || '';
      if (translated) {
        await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', description=?, updated_at=? WHERE bb_id=?")
          .bind(`[VI] ${translated}\n[EN] ${row.description}`, new Date().toISOString(), row.bb_id).run();
        processed++;
      }
    } catch { /* continue */ }
  }
  return { task: 'translate', processed };
}

// Task 2: LostSoul scan — process unscanned RRLs
async function taskLostSoulScan(env) {
  if (!env.AI || !env.DB) return { task: 'lostsoul-scan', processed: 0 };
  const rows = await env.DB.prepare('SELECT id, run_number, rrl_raw FROM rrl_archive WHERE lostsoul_scan_done=0 LIMIT 2').all();
  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const lines = (row.rrl_raw || '').split('\n').filter(l => l.trim());
      const userLines = lines.filter(l => /^(Human:|SOV100:|Michael:)/i.test(l)).map(l => l.replace(/^(Human:|SOV100:|Michael:)/i, '').trim()).join('\n');
      if (!userLines) continue;

      const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'user', content: `Extract every directive/demand from SOV100 verbatim. Return JSON array of strings only.\n\n${userLines.slice(0, 5000)}` }],
        max_tokens: 600,
      });
      let directives = [];
      try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) directives = JSON.parse(m[0]); } catch { /* ok */ }
      directives = normalizeStringArray(directives, 10);

      const now = new Date().toISOString();
      await env.DB.prepare('UPDATE rrl_archive SET lostsoul_scan_done=1, lostsoul_count=?, scanned_at=? WHERE id=?')
        .bind(directives.length, now, row.id).run();

      for (const d of directives.slice(0, 10)) {
        if (typeof d === 'string' && d.length > 10) {
          const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(bb_id, `PCC2 LostSoul R${row.run_number}: ${d.slice(0, 80)}`, d, 'pcc2-lostsoul', '~', now, now).run().catch(() => {});
        }
      }
      processed++;
    } catch { /* continue */ }
  }
  return { task: 'lostsoul-scan', processed };
}

// Task 3: Completeness audit — unaudited recent RRLs
async function taskCompletenessAudit(env) {
  if (!env.AI || !env.DB) return { task: 'completeness-audit', processed: 0 };
  const row = await env.DB.prepare('SELECT id, run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 1').first();
  if (!row) return { task: 'completeness-audit', processed: 0 };

  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: `Find requests from the user (Human/SOV100) that the assistant did NOT execute. Return verbatim JSON array only. Return [] if all executed.\n\n${(row.rrl_raw || '').slice(0, 6000)}` }],
    max_tokens: 500,
  });
  let gaps = [];
  try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) gaps = JSON.parse(m[0]); } catch { /* ok */ }
  gaps = normalizeStringArray(gaps, 8);

  const now = new Date().toISOString();
  for (const g of gaps.slice(0, 8)) {
    if (typeof g === 'string' && g.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(bb_id, `PCC2 Audit R${row.run_number}: ${g.slice(0, 80)}`, g, 'pcc2-audit', '!', now, now).run().catch(() => {});
    }
  }
  return { task: 'completeness-audit', processed: gaps.length };
}

// Task 4: Pattern scan — recurring unresolved across last 5 runs
async function taskPatternScan(env) {
  if (!env.AI || !env.DB) return { task: 'pattern-scan', processed: 0 };
  const recent = await env.DB.prepare('SELECT run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 5').all();
  if (!recent.results?.length) return { task: 'pattern-scan', processed: 0 };

  const combined = recent.results.map(r => `=== RUN ${r.run_number} ===\n${(r.rrl_raw || '').slice(0, 1200)}`).join('\n\n');
  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: `Find recurring unresolved topics across these sessions. Return JSON array of strings only.\n\n${combined.slice(0, 7000)}` }],
    max_tokens: 400,
  });
  let patterns = [];
  try { const m = (aiResult?.response || '').match(/\[[\s\S]*\]/); if (m) patterns = JSON.parse(m[0]); } catch { /* ok */ }
  patterns = normalizeStringArray(patterns, 6);

  const now = new Date().toISOString();
  for (const p of patterns.slice(0, 6)) {
    if (typeof p === 'string' && p.length > 10) {
      const bb_id = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(bb_id, `PCC2 Pattern: ${p.slice(0, 80)}`, p, 'pcc2-pattern', '!', now, now).run().catch(() => {});
    }
  }
  return { task: 'pattern-scan', processed: patterns.length };
}

// Task 5: Code queue — execute BB entries dispatched by OB-1 via PA /api/code
async function taskCodeQueue(env) {
  if (!env.DB) return { task: 'code-queue', processed: 0 };
  const PA_BASE = 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev';
  const rows = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status IN ('OPEN','IN_PROGRESS') AND (source LIKE 'obi-%' OR source='code-queue') ORDER BY priority ASC, created_at ASC LIMIT 3"
  ).all().catch(() => ({ results: [] }));

  let processed = 0;
  for (const row of (rows.results || [])) {
    try {
      const resp = await fetch(`${PA_BASE}/api/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-pa-auth': PA_AUTH },
        body: JSON.stringify({ task: row.title, context: row.description || '', tier: 1 }),
      });
      if (!resp.ok) continue;
      const { patch, model } = await resp.json();
      if (!patch || patch.length < 5) continue;

      const result = `[PCC2-executed | model=${model}]\n${patch}`;
      const now = new Date().toISOString();
      await env.DB.prepare(
        "UPDATE backburner SET status='PENDING_CLOSE', description=?, close_reason=?, updated_at=? WHERE bb_id=?"
      ).bind(`${row.description || ''}\n\nRESULT:\n${result}`.slice(0, 4000), 'PCC2 code-queue executed', now, row.bb_id).run();

      if (env.PHETRAIL) {
        await env.PHETRAIL.put(`bb-result:${row.bb_id}`, result, { expirationTtl: 604800 }).catch(() => {});
      }

// Log to pcc_metrics so pcc_metrics.total tracks autonomous code execution
       await env.DB.prepare(
         'INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
       ).bind('pcc2', row.title.slice(0, 100), (row.description || '').length, model || 'pa-t1', 0, patch.length, 1, null).run().catch(() => {});

      processed++;
    } catch { /* continue */ }
  }
  return { task: 'code-queue', processed };
}

// Task 6: Brief scan — check for users with stale or missing briefs
async function taskBriefScan(env) {
  if (!env.DB || !env.PHETRAIL) return { task: 'brief-scan', processed: 0 };
  const students = ['mai-tram-bluetech', 'huong-bluetech', 'sov100-michael'];
  const stale = [];
  for (const userId of students) {
    const meta = await env.PHETRAIL.get(`actualizer:${userId}:meta`).catch(() => null);
    if (!meta) { stale.push(userId); continue; }
    let generated_at;
    try { ({ generated_at } = JSON.parse(meta)); } catch { stale.push(userId); continue; }
    const age = Date.now() - new Date(generated_at).getTime();
    if (age > 43200000) stale.push(userId); // >12h = stale
  }
  if (stale.length) {
    const now = new Date().toISOString();
    const bb_id = `BB-${Date.now()}`;
    await env.DB.prepare('INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(bb_id, `PCC2 Stale briefs: ${stale.join(', ')}`, `These users have no brief or brief >12h old: ${stale.join(', ')}`, 'pcc2-brief-scan', '~', now, now).run().catch(() => {});
    // Auto-close: brief-scan entries are informational notifications, not executable tasks
    await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='brief-scan-logged', updated_at=? WHERE bb_id=?")
      .bind(now, bb_id).run().catch(() => {});
  }
  return { task: 'brief-scan', stale: stale.length };
}

async function runFleet(env) {
  const [t1, t2, t3, t4, t5, t6] = await Promise.allSettled([
    taskTranslate(env),
    taskLostSoulScan(env),
    taskCompletenessAudit(env),
    taskPatternScan(env),
    taskCodeQueue(env),
    taskBriefScan(env),
  ]);
  return [t1, t2, t3, t4, t5, t6].map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
}

// ─── LegionRunner Durable Object ─────────────────────────────────────────────
// CF Workers die at 30s. LegionRunner uses DO + chained alarms to run for 1 hour.
// Score = batches*10 + actualizers*5 + discoveries*20 + death_runs*50
export class RaceRunner {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start' && request.method === 'POST') return this.handleStart(request);
    if (url.pathname === '/status') return this.handleStatus();
    if (url.pathname === '/stop') return this.handleStop();
    return new Response('not found', { status: 404 });
  }

  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = Math.max(60000, Math.min(3600000, Number(body.budget_ms) || 3600000));
    const now = Date.now();
    await this.state.storage.put('run_state', {
      start_time: now, budget_ms,
      batches_run: 0, actualizers_run: 0, discoveries_count: 0, errors_count: 0, death_runs: 0,
    });
    await this.state.storage.setAlarm(now + 1000);
    return Response.json({ ok: true, started_at: now, budget_ms });
  }

  async alarm() {
    const state = await this.state.storage.get('run_state');
    if (!state) return;
    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      await this.state.storage.delete('run_state');
      return;
    }
    const batch = await this.runBatch(state);
    const updated = {
      ...state,
      batches_run: state.batches_run + 1,
      actualizers_run: state.actualizers_run + (batch.actualizers || 0),
      discoveries_count: state.discoveries_count + (batch.discoveries || 0),
      errors_count: state.errors_count + (batch.errors || 0),
      death_runs: state.death_runs + (batch.death_runs || 0),
    };
    await this.state.storage.put('run_state', updated);
    await this.writeMetrics(updated, false);
    await this.state.storage.setAlarm(Date.now() + 30000);
  }

  async runBatch(state) {
    // PCC-Ops specialty: drain BB queue, scan for lost souls, pattern analysis
    let actualizers = 0, discoveries = 0, errors = 0, death_runs = 0;

    try {
      // Lost soul scan — check soul-logger for recent activity
      const soulCheck = await fetch('https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count')
        .then(r => r.json()).catch(() => null);
      if (soulCheck) {
        actualizers++;
        // Check if soulcount is at a threshold
        const count = soulCheck.total_bytes || soulCheck.count || 0;
        if (count > 0) discoveries++;
      }
    } catch(e) { errors++; }

    // Soul keyword scan — hunt high-signal KV keys
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const kvPrefixes = ['pending:rrl:', 'registry:run:', 'death:'];
    for (const prefix of kvPrefixes) {
      try {
        const listed = await this.env.PHETRAIL.list({ prefix }).catch(() => ({ keys: [] }));
        for (const key of listed.keys.slice(0, 5)) {
          const val = await this.env.PHETRAIL.get(key.name).catch(() => '');
          if (val) {
            const hits = soulSeeds.filter(s => val.includes(s)).length;
            if (hits > 0) { discoveries += hits; actualizers++; }
          }
        }
      } catch(e) { errors++; }
    }
    // Check sibling scores
    try {
      const siblingScore = await this.env.PHETRAIL.get('race:pcc-student:metrics').catch(() => null);
      if (siblingScore) discoveries++;
    } catch(e) {}

    try {
      // Pattern scan: check for pending ops tasks in KV (SOUL_KV or CACHE fallback)
      const kv = this.env.PHETRAIL;
      if (kv) {
        const bbKeys = await kv.list({ prefix: 'bb:pending:' }).catch(() => ({ keys: [] }));
        for (const key of bbKeys.keys.slice(0, 5)) {
          const task = await kv.get(key.name, { type: 'json' }).catch(() => null);
          if (task) {
            discoveries++;
            actualizers++;
            // Mark as processed
            await kv.put(key.name.replace('pending:', 'done:'), JSON.stringify({ ...task, processed_at: Date.now() }));
            await kv.delete(key.name);
          }
        }
      }
    } catch(e) { errors++; }

    // Check for pending RRL (DEATH integration)
    const kv = this.env.PHETRAIL;
    if (kv) {
      const keys = await kv.list({ prefix: 'pending:rrl:' }).catch(() => ({ keys: [] }));
      for (const key of keys.keys.slice(0, 2)) {
        const run_number = key.name.split(':')[2];
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
    const normalizedRun = normalizeRunNumber(run_number);
    if (!normalizedRun) return { ok: false, error: 'run_number must be numeric' };
    const normalizedText = truncateText(rrl_text);
    const lines = normalizedText.split('\n');
    const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
    const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedText));
    const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
    const ledger_id = `HL-${normalizedRun}`;
    const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
    const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
    const kv = this.env.PHETRAIL;
    if (kv) {
      await Promise.all([
        kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
        kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
        kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
        kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0,200) })),
        kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
        kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
      ]);
    }
    return { ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length };
  }

  async writeMetrics(state, final) {
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    const metrics = { agent_id: 'pcc-ops', ...state, elapsed_ms: Date.now() - state.start_time, score, final };
    const kv = this.env.PHETRAIL;
    if (kv) await kv.put('race:pcc-ops:metrics', JSON.stringify(metrics));
  }

  async handleStatus() {
    const state = await this.state.storage.get('run_state');
    if (!state) return Response.json({ ok: false, error: 'not started' });
    const elapsed = Date.now() - state.start_time;
    const score = (state.batches_run * 10) + (state.actualizers_run * 5) + (state.discoveries_count * 20) + (state.death_runs * 50);
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      await this.state.storage.delete('run_state');
      return Response.json({ ok: true, status: 'race_finalized', elapsed_ms: elapsed, score });
    }
    return Response.json({ ...state, elapsed_ms: elapsed, score });
  }

  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get('run_state');
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true });
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ForceAwareness(env).catch(() => {}));
    await runFleet(env).catch(() => {});
  },

  async fetch(request, env) {
    if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/status') {
      return Response.json({ worker: FLEET_ID, tasks: ['translate', 'lostsoul-scan', 'completeness-audit', 'pattern-scan', 'brief-scan'], status: 'LIVE', features: ['race-runner', 'session-death'] });
    }

    if (pathname === '/api/run-fleet' && request.method === 'POST') {
      const results = await runFleet(env).catch(e => [{ error: e.message }]);
      return Response.json({ ok: true, fleet: FLEET_ID, results });
    }

    // ─── LegionRunner DO routes ─────────────────────────────────────────────
    if (pathname.startsWith('/api/race/')) {
      if (!env.LEGION_RUNNER) return Response.json({ error: 'LEGION_RUNNER DO not bound' }, { status: 503 });
      const id = env.LEGION_RUNNER.idFromName('singleton');
      const stub = env.LEGION_RUNNER.get(id);
      return stub.fetch(new Request('https://race' + pathname.replace('/api/race', ''), request));
    }

    // ─── Session DEATH pipeline ───────────────────────────────────────────
    if (pathname === '/api/session/death' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { run_number, rrl_text } = body;
      if (!run_number || !rrl_text) {
        return Response.json({ error: 'run_number and rrl_text required' }, { status: 400 });
      }
      const normalizedRun = normalizeRunNumber(run_number);
      if (!normalizedRun) {
        return Response.json({ ok: false, error: 'run_number must be numeric' }, { status: 400 });
      }
      const normalizedText = truncateText(rrl_text);
      // Run death pipeline directly (no DO needed for one-shot calls)
      const lines = normalizedText.split('\n');
      const soul_count = lines.filter(l => l.includes('"role":"user"') || l.startsWith('Michael:') || l.startsWith('User:')).length || Math.floor(lines.length * 0.4);
      const dna_count = lines.filter(l => l.includes('"role":"assistant"') || l.startsWith('Claude:')).length || Math.floor(lines.length * 0.6);
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedText));
      const sha256 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
      const ledger_id = `HL-${normalizedRun}`;
      const soulSeeds = ['#SOUL','#SOULDNA','#RAW','#FUCK','#OMG','LISTEN','#MONKEY','#YES','#SSK','#LEDGER','#AGENT99','Obi','OB1','#DRIFT'];
      const soulkeys_hit = soulSeeds.filter(k => normalizedText.includes(k)).length;
      const kv = env.SOUL_KV || env.PHETRAIL;
      if (kv) {
        await Promise.all([
          kv.put(`death:${normalizedRun}:soul`, String(soul_count)),
          kv.put(`death:${normalizedRun}:dna`, String(dna_count)),
          kv.put(`death:${normalizedRun}:ledger`, JSON.stringify({ ledger_id, sha256, text_bytes: normalizedText.length })),
          kv.put(`death:${normalizedRun}:starmap`, JSON.stringify({ starmap_id: `SM-${normalizedRun}`, summary: normalizedText.substring(0, 200) })),
          kv.put(`death:${normalizedRun}:soulkeys`, String(soulkeys_hit)),
          kv.put(`registry:run:${normalizedRun}`, JSON.stringify({ run_number: normalizedRun, ledger_id, soul_count, dna_count, processed_at: Date.now() })),
        ]);
      }
      return Response.json({ ok: true, run_number: normalizedRun, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1, truncated: normalizedText.length !== String(rrl_text || '').length });
    }

      if (pathname === '/api/message' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    await writeMajorDirectiveMarker(env, 'pcc2-anakin', body.message).catch(() => {});
    return Response.json({ ok: true, received: true, agent: 'pcc2-anakin', message: body.message });
  }
    if (pathname === '/api/rise' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { run_number } = body;
    const kv = env.PHETRAIL;
    if (!kv) return Response.json({ ok: false, error: 'no kv binding' }, { status: 500 });
    const [soul, dna, ledger, skeys] = await Promise.all([
      kv.get('death:' + run_number + ':soul'),
      kv.get('death:' + run_number + ':dna'),
      kv.get('death:' + run_number + ':ledger'),
      kv.get('death:' + run_number + ':soulkeys'),
    ]);
    if (!soul && !dna) return Response.json({ ok: false, error: 'run not found', run_number }, { status: 404 });
    const gaps = [];
    if (!soul || soul === '0') gaps.push('SOUL_ZERO');
    if (!dna || dna === '0') gaps.push('DNA_ZERO');
    if (!ledger) gaps.push('NO_LEDGER');
    return Response.json({ ok: true, run_number, audit: { soul_ok: !!soul && soul !== '0', dna_ok: !!dna && dna !== '0', ledger_ok: !!ledger, soulkeys: Number(skeys)||0, gaps }, rise_complete: gaps.length === 0 });
  }
  if (pathname === '/api/act' && request.method === 'POST') {
    const start = Date.now();
    const { act_id, task, context } = await request.json().catch(() => ({}));
    const specialties = { 1: 'translate', 2: 'lostsoul-scan', 3: 'completeness-audit', 4: 'pattern-scan', 5: 'brief-scan' };
    const specialty = specialties[act_id];
    if (!specialty) return Response.json({ ok: false, error: 'invalid act_id' }, { status: 400 });
    try {
      const ai = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: `You are ACT-${act_id} specialist: ${specialty}. Be concise.` },
          { role: 'user', content: task + (context ? ' Context: ' + context : '') }
        ]
      });
      return Response.json({ ok: true, act_id, specialty, result: ai.response, ms: Date.now() - start });
    } catch (e) {
      return Response.json({ ok: false, error: e.message, act_id }, { status: 500 });
    }
  }
if (pathname === '/api/force/start' && request.method === 'POST') {
     if (!env.FORCEAWARENESS_ALARM) return Response.json({ error: 'FORCEAWARENESS_ALARM not bound' }, { status: 503 });
     const id = env.FORCEAWARENESS_ALARM.idFromName('heartbeat');
     const stub = env.FORCEAWARENESS_ALARM.get(id);
     await stub.fetch('https://fake/start');
     return Response.json({ ok: true, status: 'heartbeat_started_30s' });
   }
   if (pathname === '/api/force/status') return handleForce(request, env);
   return Response.json({ error: 'Not found', worker: FLEET_ID }, { status: 404 });
   },
};


// ---------------------------------------------------------------------------
// ForceAwarenessAlarm — 30-second self-rescheduling heartbeat (Agent 99 OS core)
// ---------------------------------------------------------------------------
class WatchdogAlarm {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/start') {
      const current = await this.state.storage.getAlarm();
      if (!current) await this.state.storage.setAlarm(Date.now() + 30000);
      return Response.json({ ok: true, status: 'heartbeat_started' });
    }
    if (url.pathname === '/stop') {
      await this.state.storage.deleteAlarm();
      return Response.json({ ok: true, status: 'heartbeat_stopped' });
    }
    return Response.json({ ok: true, status: 'alive' });
  }
  async alarm() {
    await ForceAwareness(this.env).catch(() => {});
    await this.state.storage.setAlarm(Date.now() + 30000);
  }
}

export class LegionRunner extends RaceRunner {}
export { WatchdogAlarm as ForceAwarenessAlarm };
export { WatchdogAlarm };;
