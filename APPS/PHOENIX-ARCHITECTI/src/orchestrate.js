// ORCHESTRATE — PCClaw Mothership
// Reads BB queue, classifies by task type, dispatches to PCC1 (students) or PCC2 (ops)
// L81 compliant: marks IN_PROGRESS, never self-grants DONE
// Triggered: cron every 6h + POST /api/orchestrate/dispatch

const PA_AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const PCC1_URL = 'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev';
const PCC2_URL = 'https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev';

const STUDENT_SOURCES = ['pcc1-actualizer', 'pcc2-actualizer', 'student', 'mai-tram', 'huong', 'user-brief', 'brief-scan'];
const OPS_SOURCES = ['translate-queue', 'pcc2-lostsoul', 'pcc2-audit', 'pcc2-pattern', 'code-queue', 'health-check', 'lostsoul', 'pattern'];

function classifyTask(bb) {
  const src = (bb.source || '').toLowerCase();
  const title = (bb.title || '').toLowerCase();
  for (const s of STUDENT_SOURCES) {
    if (src.includes(s) || title.includes(s)) return 'pcc1';
  }
  for (const s of OPS_SOURCES) {
    if (src.includes(s) || title.includes(s)) return 'pcc2';
  }
  return 'pcc2'; // default: ops
}

async function callFleet(env, target, taskIds) {
  const svc = target === 'pcc1' ? env.PCC1_SVC : env.PCC2_SVC;
  const url = target === 'pcc1' ? PCC1_URL : PCC2_URL;
  const body = JSON.stringify({ triggered_by: 'orchestrator', task_ids: taskIds });
  const headers = { 'Content-Type': 'application/json', 'x-pa-auth': PA_AUTH };

  try {
    if (svc) {
      // Service binding: zero latency, no egress
      const res = await svc.fetch(new Request(`${url}/api/run-fleet`, { method: 'POST', headers, body }));
      return res.ok ? res.json() : { error: `${target} returned ${res.status}` };
    } else {
      // Fallback: external fetch
      const res = await fetch(`${url}/api/run-fleet`, { method: 'POST', headers, body });
      return res.ok ? res.json() : { error: `${target} returned ${res.status}` };
    }
  } catch (e) {
    return { error: e.message };
  }
}

export async function runOrchestrator(env) {
  if (!env.DB) return { ok: false, reason: 'no DB' };

  const rows = await env.DB.prepare(
    "SELECT bb_id, title, source, priority FROM backburner WHERE status='OPEN' ORDER BY created_at ASC LIMIT 20"
  ).all();

  const tasks = rows.results || [];
  if (!tasks.length) return { ok: true, dispatched: 0, message: 'queue empty' };

  const pcc1Tasks = tasks.filter(t => classifyTask(t) === 'pcc1');
  const pcc2Ops = tasks.filter(t => classifyTask(t) === 'pcc2');

  const now = new Date().toISOString();
  const dispatched = [];

  // Mark IN_PROGRESS before dispatch (L81 — agent cannot self-close, but CAN mark in-progress)
  for (const t of tasks) {
    await env.DB.prepare("UPDATE backburner SET status='IN_PROGRESS', updated_at=? WHERE bb_id=?")
      .bind(now, t.bb_id).run().catch(() => {});
    dispatched.push(t.bb_id);
  }

  const results = {};
  if (pcc1Tasks.length) results.pcc1 = await callFleet(env, 'pcc1', pcc1Tasks.map(t => t.bb_id));
  if (pcc2Ops.length) results.pcc2 = await callFleet(env, 'pcc2', pcc2Ops.map(t => t.bb_id));

  // Log dispatch cycle to pcc_metrics
  await env.DB.prepare(
    'INSERT INTO pcc_metrics (task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    `orchestrator: ${dispatched.length} tasks → pcc1:${pcc1Tasks.length} pcc2:${pcc2Ops.length}`,
    dispatched.length,
    'orchestrator',
    0,
    JSON.stringify(results).length,
    1,
    null
  ).run().catch(() => {});

  return { ok: true, dispatched: dispatched.length, pcc1: pcc1Tasks.length, pcc2: pcc2Ops.length, results };
}

export async function handleOrchestrate(request, env) {
  const { pathname, method } = Object.assign(new URL(request.url), { method: request.method });

  if (pathname === '/api/orchestrate/dispatch' && method === 'POST') {
    const result = await runOrchestrator(env);
    return Response.json(result);
  }

  if (pathname === '/api/orchestrate/status' && method === 'GET') {
    const recent = await env.DB.prepare(
      "SELECT bb_id, title, status, source, updated_at FROM backburner ORDER BY updated_at DESC LIMIT 10"
    ).all().catch(() => ({ results: [] }));
    const metrics = await env.DB.prepare(
      "SELECT task_preview, passed, duration_ms, output_length FROM pcc_metrics WHERE model='orchestrator' ORDER BY rowid DESC LIMIT 5"
    ).all().catch(() => ({ results: [] }));
    return Response.json({ recent_tasks: recent.results, recent_dispatches: metrics.results });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
