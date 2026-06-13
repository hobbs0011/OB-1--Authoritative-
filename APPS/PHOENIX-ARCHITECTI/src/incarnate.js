import { checkAdminKey } from './security.js';
import { createBBEntry } from './backburner.js';

// IncarnatePipeline — 6-Gate LostSoul Protection System
// Gate 1: DEATH Capture     — real-time RRL + state ingest
// Gate 2: LostSoul Scan     — Llama 70B directive extraction (broad)
// Gate 3: RISE Audit        — prior-run open LostSouls surfaced at boot
// Gate 4: Velocity Monitor  — urgency-pattern regex matcher (narrow, high precision)
// Gate 5: Completeness Audit— cross-check: asked vs executed
// Gate 6: Pattern Scanner   — recurring unresolved items across last N runs (cron)

const DIRECTIVE_PATTERNS = [
  /\b(add|build|create|write|make|implement|fix|update|change|rename|remove|delete|wire|connect|deploy|test|check|find|track|log|store|read|scan|generate|design|architect|define|set up|hook up|plug in|integrate)\b/i,
  /\b(I want|I need|we need|we should|you will|you should|you must|never|always|make sure|don't forget|remember to|start|stop|begin|end)\b/i,
  /\b(new edict|new law|new rule|protocol|mandate|directive|lock|freeze|halt|priority)\b/i,
];
const URGENCY_MARKERS = ['FUCK', '!!', 'URGENT', 'P0', 'IMMEDIATELY', 'LOCKED', 'MANDATE', 'EDICT', 'NOW', 'MUST'];

function extractUserMessages(rrl_text) {
  const lines = rrl_text.split('\n').filter(l => l.trim());
  const out = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.role === 'user' || obj.type === 'human') {
        out.push(obj.content || obj.text || '');
        continue;
      }
    } catch { /* not JSON */ }
    if (/^(Human:|SOV100:|Michael:)/i.test(line)) {
      out.push(line.replace(/^(Human:|SOV100:|Michael:)/i, '').trim());
    }
  }
  return out.join('\n');
}

// ============================================================
// Gate 1 — DEATH: ingest RRL + write run_state
// ============================================================
async function fetchAnchorSoul(env, userId = 'sov100-michael') {
  if (!env.SOUL_LOGGER_SVC) return null;
  try {
    const res = await env.SOUL_LOGGER_SVC.fetch(
      new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      })
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function gateDeathIngest(env, { run_number, rrl_text, ledger_tail_hash = '', phetrail_digest = '', metadata = '' }) {
  const now = new Date().toISOString();
  const lines = rrl_text.split('\n').length;
  const bytes = new TextEncoder().encode(rrl_text).length;

  // Fetch anchor SOUL from soul-logger (authoritative soulcount + recent prompts)
  const anchorSoul = await fetchAnchorSoul(env).catch(() => null);
  const soul_count = anchorSoul?.soulcount || anchorSoul?.total_chars || 0;
  const anchorKeywords = (anchorSoul?.top_keywords || []).slice(0, 20).map(k => k.keyword || k).join(', ');
  const anchorRecentPrompts = (anchorSoul?.sessions || []).slice(0, 3)
    .flatMap(s => (s.last_prompts || []).map(p => p.text || ''))
    .join(' | ')
    .slice(0, 1000);

  const rrlResult = await env.DB.prepare(
    'INSERT INTO rrl_archive (run_number, rrl_raw, line_count, byte_count, ingested_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(run_number, rrl_text, lines, bytes, now).run();

  const rrl_id = rrlResult.meta.last_row_id;

  const bbCount = await env.DB.prepare('SELECT COUNT(*) as cnt FROM backburner WHERE status = ?').bind('OPEN').first();
  const bb_open_count = bbCount?.cnt || 0;

  await env.DB.prepare(
    'INSERT INTO run_state (run_number, soul_count, ledger_tail_hash, bb_open_count, phetrail_digest, death_sealed_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(run_number, soul_count, ledger_tail_hash, bb_open_count, phetrail_digest, now,
    typeof metadata === 'string' ? metadata : JSON.stringify(metadata)).run();

  // Fire Gate 2 + Gate 4 + Gate 5 immediately, non-blocking — pass anchor soul context to Gate 2
  gateLostSoulScan(env, { rrl_id, run_number, rrl_text, anchorKeywords, anchorRecentPrompts }).catch(() => {});
  gateVelocityMonitor(env, { rrl_id, run_number, rrl_text }).catch(() => {});
  gateCompletenessAudit(env, { run_number, rrl_text }).catch(() => {});

  return { ok: true, rrl_id, run_number, lines, bytes, soul_count, bb_open_count, death_sealed_at: now };
}

// ============================================================
// Gate 2 — LostSoul Scan: Llama 70B extracts every directive
// ============================================================
async function gateLostSoulScan(env, { rrl_id, run_number, rrl_text, anchorKeywords = '', anchorRecentPrompts = '' }) {
  if (!env.AI) return { ok: false, reason: 'AI binding missing' };

  const userMessages = extractUserMessages(rrl_text) || rrl_text.slice(0, 8000);
  if (!userMessages.trim()) {
    await env.DB.prepare('UPDATE rrl_archive SET lostsoul_scan_done = 1, scanned_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), rrl_id).run();
    return { ok: true, lost_souls: 0 };
  }

  const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{
      role: 'user',
      content: `Read the session log below. Find every directive, demand, edict, or request from SOV100 that has NOT already been captured in the SOUL archive.

ALREADY CAPTURED IN SOUL ARCHIVE (do NOT flag these as lost):
Keywords: ${anchorKeywords || 'none'}
Recent prompts: ${anchorRecentPrompts || 'none'}

RULE: Return ONLY directives that appear NEW — not reflected in the archive above.
Return the EXACT verbatim text as SOV100 wrote it. Do not paraphrase. Do not reword. Copy character for character.

Return ONLY a JSON array of strings. Each string = one verbatim line. No other text.

SESSION (SOV100 messages):
${userMessages.slice(0, 6000)}`,
    }],
    max_tokens: 800,
  });

  let directives = [];
  try {
    const m = (result?.response || '').match(/\[[\s\S]*\]/);
    if (m) directives = JSON.parse(m[0]);
  } catch { /* parse failed */ }

  const scannedAt = new Date().toISOString();
  await env.DB.prepare('UPDATE rrl_archive SET lostsoul_scan_done = 1, lostsoul_count = ?, scanned_at = ? WHERE id = ?')
    .bind(directives.length, scannedAt, rrl_id).run();

  const created = [];
  for (const d of directives.slice(0, 20)) {
    if (typeof d === 'string' && d.length > 10) {
      const entry = await createBBEntry(env, {
        title: `LostSoul R${run_number}: ${d.slice(0, 80)}`,
        description: d,
        source: 'lostsoul',
        priority: '~',
        metadata: JSON.stringify({ run_number, rrl_id, gate: 2 }),
      }).catch(() => null);
      if (entry) created.push(entry.bb_id);
    }
  }

  return { ok: true, run_number, directives_found: directives.length, bb_created: created.length };
}

// ============================================================
// Gate 3 — RISE Audit: prior-run open LostSouls + state read
// ============================================================
async function gateRise(env) {
  const lastRun = await env.DB.prepare('SELECT * FROM run_state ORDER BY id DESC LIMIT 1').first();
  const lostSouls = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status = 'OPEN' AND source IN ('lostsoul','pattern-scan','completeness-audit','velocity-monitor') ORDER BY created_at DESC LIMIT 30"
  ).all();
  const openBB = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status = 'OPEN' ORDER BY created_at DESC LIMIT 20"
  ).all();

  const brief = await env.CACHE.get('actualizer:sov100-michael:brief').catch(() => null);

  const report = {
    ok: true,
    generated_at: new Date().toISOString(),
    last_run: lastRun ? {
      run_number: lastRun.run_number,
      soul_count: lastRun.soul_count,
      bb_open_at_death: lastRun.bb_open_count,
      sealed_at: lastRun.death_sealed_at,
    } : null,
    open_lost_souls: lostSouls.results?.length || 0,
    open_bb_total: openBB.results?.length || 0,
    lost_souls: (lostSouls.results || []).map(r => `[${r.source}/${r.priority}] ${r.title}`).join('\n') || 'NONE',
    top_bb: (openBB.results || []).slice(0, 10).map(r => `[${r.source}] ${r.title}`).join('\n') || 'NONE',
    actualizer_brief: brief || null,
  };

  if (lastRun) {
    await env.DB.prepare('UPDATE run_state SET rise_read_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), lastRun.id).run();
  }

  return report;
}

// ============================================================
// Gate 4 — Velocity Monitor: urgency-pattern regex
// ============================================================
async function gateVelocityMonitor(env, { rrl_id, run_number, rrl_text }) {
  const lines = rrl_text.split('\n');
  const hits = [];

  for (const line of lines) {
    const isDirective = DIRECTIVE_PATTERNS.some(p => p.test(line));
    const isUrgent = URGENCY_MARKERS.some(m => line.toUpperCase().includes(m));
    if (isUrgent && isDirective && line.length > 20) {
      hits.push(line.slice(0, 200).trim());
    }
  }

  const unique = [...new Set(hits)].slice(0, 10);
  for (const hit of unique) {
    await createBBEntry(env, {
      title: `VeloHit R${run_number}: ${hit.slice(0, 80)}`,
      description: hit,
      source: 'velocity-monitor',
      priority: '!!',
      metadata: JSON.stringify({ run_number, rrl_id, gate: 4 }),
    }).catch(() => {});
  }

  return { ok: true, hits: unique.length };
}

// ============================================================
// Gate 5 — Completeness Audit: asked vs executed
// ============================================================
async function gateCompletenessAudit(env, { run_number, rrl_text }) {
  if (!env.AI) return { ok: false };

  const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{
      role: 'user',
      content: `Audit this AI session. Find any directive or request from the user (Human/SOV100) that does NOT appear to have been executed by the assistant.

RULE: Return the EXACT verbatim text SOV100 wrote. Do not paraphrase. Do not summarize. Copy it exactly.

Return ONLY a JSON array of strings. Each string = verbatim line from SOV100 that was not executed. If everything was executed, return [].

TRANSCRIPT:
${rrl_text.slice(0, 7000)}`,
    }],
    max_tokens: 600,
  });

  let gaps = [];
  try {
    const m = (result?.response || '').match(/\[[\s\S]*\]/);
    if (m) gaps = JSON.parse(m[0]);
  } catch { /* parse failed */ }

  for (const g of gaps.slice(0, 10)) {
    if (typeof g === 'string' && g.length > 10) {
      await createBBEntry(env, {
        title: `CompAudit R${run_number}: ${g.slice(0, 80)}`,
        description: g,
        source: 'completeness-audit',
        priority: '!',
        metadata: JSON.stringify({ run_number, gate: 5 }),
      }).catch(() => {});
    }
  }

  return { ok: true, gaps_found: gaps.length };
}

// ============================================================
// Gate 6 — Pattern Scanner: recurring unresolved across runs (cron)
// ============================================================
export async function runPatternScanner(env) {
  if (!env.AI || !env.DB) return;

  const recent = await env.DB.prepare(
    'SELECT run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 5'
  ).all();

  if (!recent.results?.length) return;

  const combined = recent.results.map(r =>
    `=== RUN ${r.run_number} ===\n${r.rrl_raw.slice(0, 1500)}`
  ).join('\n\n');

  const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{
      role: 'user',
      content: `Analyze these session transcripts. Find topics or directives that RECUR across multiple sessions without being resolved.
Return ONLY a JSON array of strings. Each = one recurring pattern.
Example: ["PCC timing metrics requested 3 times, never implemented"]

TRANSCRIPTS:
${combined.slice(0, 8000)}`,
    }],
    max_tokens: 500,
  });

  let patterns = [];
  try {
    const m = (result?.response || '').match(/\[[\s\S]*\]/);
    if (m) patterns = JSON.parse(m[0]);
  } catch { /* parse failed */ }

  for (const p of patterns.slice(0, 8)) {
    if (typeof p === 'string' && p.length > 10) {
      await createBBEntry(env, {
        title: `PatternScan: ${p.slice(0, 80)}`,
        description: p,
        source: 'pattern-scan',
        priority: '!',
        metadata: JSON.stringify({ runs_scanned: recent.results.length, gate: 6 }),
      }).catch(() => {});
    }
  }
}

// ============================================================
// PCC Metrics: log + read performance data
// ============================================================
export async function logPccMetric(env, { task_preview, task_length, model = 'kilo-auto/free', duration_ms, output_length, passed, fail_reason = '' }) {
  if (!env.DB) return;
  const run_id = `pcc-${Date.now()}`;
  await env.DB.prepare(
    'INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(run_id, (task_preview || '').slice(0, 120), task_length || 0, model, duration_ms || 0, output_length || 0, passed ? 1 : 0, fail_reason || '').run().catch(() => {});
}

// ============================================================
// HTTP Handler
// ============================================================
export async function handleIncarnate(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;

  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  if (method === 'POST' && pathname === '/api/incarnate/death') {
    const body = await request.json().catch(() => ({}));
    if (!body.run_number || !body.rrl_text) {
      return Response.json({ error: 'run_number and rrl_text required' }, { status: 400 });
    }
    const result = await gateDeathIngest(env, body);
    return Response.json(result, { status: 201 });
  }

  if (method === 'GET' && pathname === '/api/incarnate/rise') {
    const report = await gateRise(env);
    return Response.json(report);
  }

  if (method === 'POST' && pathname === '/api/incarnate/lostsoul-scan') {
    const body = await request.json().catch(() => ({}));
    if (!body.rrl_id || !body.run_number || !body.rrl_text) {
      return Response.json({ error: 'rrl_id, run_number, rrl_text required' }, { status: 400 });
    }
    const result = await gateLostSoulScan(env, body);
    return Response.json(result);
  }

  if (method === 'POST' && pathname === '/api/incarnate/completeness') {
    const body = await request.json().catch(() => ({}));
    if (!body.run_number || !body.rrl_text) {
      return Response.json({ error: 'run_number and rrl_text required' }, { status: 400 });
    }
    const result = await gateCompletenessAudit(env, body);
    return Response.json(result);
  }

  if (method === 'POST' && pathname === '/api/incarnate/pattern-scan') {
    await runPatternScanner(env);
    return Response.json({ ok: true });
  }

  if (method === 'POST' && pathname === '/api/metrics/pcc') {
    const body = await request.json().catch(() => ({}));
    await logPccMetric(env, body);
    return Response.json({ ok: true });
  }

  if (method === 'GET' && pathname === '/api/metrics/pcc') {
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);
    const rows = await env.DB.prepare(
      'SELECT * FROM pcc_metrics ORDER BY id DESC LIMIT ?'
    ).bind(limit).all();
    const total = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics').first();
    const passed = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1').first();
    const avgMs = await env.DB.prepare('SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1').first();
    return Response.json({
      total: total?.cnt || 0,
      pass_rate: total?.cnt ? ((passed?.cnt || 0) / total.cnt * 100).toFixed(1) + '%' : 'N/A',
      avg_ms_on_pass: avgMs?.avg ? Math.round(avgMs.avg) : 0,
      recent: rows.results || [],
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
