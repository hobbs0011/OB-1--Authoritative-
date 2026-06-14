// ORCHESTRATE — routes BB queue to OB1 (single PCC)
// L81 compliant: marks IN_PROGRESS, never self-grants DONE
// Triggered: cron every 6h + POST /api/orchestrate/dispatch

const PA_AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const OB1_URL = 'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev';

// Informational sources — auto-close, never dispatch
const SKIP_SOURCES = ['pcc1-actualizer', 'ob1-brief-scan', 'health-check', 'phedived', 'brief-scan'];

function isInformational(bb) {
  const src = (bb.source || '').toLowerCase();
  return SKIP_SOURCES.some(s => src.includes(s));
}

async function callOB1(env, taskIds) {
  const body = JSON.stringify({ triggered_by: 'orchestrator', task_ids: taskIds });
  const headers = { 'Content-Type': 'application/json', 'x-pa-auth': PA_AUTH };
  try {
    if (env.PCC1_SVC) {
      const res = await env.PCC1_SVC.fetch(new Request(`${OB1_URL}/api/run-fleet`, { method: 'POST', headers, body }));
      return res.ok ? res.json() : { error: `OB1 returned ${res.status}` };
    } else {
      const res = await fetch(`${OB1_URL}/api/run-fleet`, { method: 'POST', headers, body });
      return res.ok ? res.json() : { error: `OB1 returned ${res.status}` };
    }
  } catch (e) {
    return { error: e.message };
  }
}

export async function runOrchestrator(env) {
  if (!env.DB) return { ok: false, reason: 'no DB' };

  const now = new Date().toISOString();

  // Clean stale IN_PROGRESS (>10 min = abandoned)
  const staleAt = new Date(Date.now() - 600000).toISOString();
  await env.DB.prepare(
    "UPDATE backburner SET status='PENDING_CLOSE', close_reason='stale-in-progress', updated_at=? WHERE status='IN_PROGRESS' AND updated_at < ?"
  ).bind(now, staleAt).run().catch(() => {});

  const rows = await env.DB.prepare(
    "SELECT bb_id, title, source, priority FROM backburner WHERE status='OPEN' ORDER BY created_at ASC LIMIT 20"
  ).all();

  const allTasks = rows.results || [];

  // Auto-close informational entries
  const informational = allTasks.filter(t => isInformational(t));
  for (const t of informational) {
    await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='informational-auto-close', updated_at=? WHERE bb_id=?")
      .bind(now, t.bb_id).run().catch(() => {});
  }

  const tasks = allTasks.filter(t => !isInformational(t));
  if (!tasks.length) return { ok: true, dispatched: 0, informational_closed: informational.length, message: 'no executable tasks' };

  // Mark IN_PROGRESS before dispatch
  for (const t of tasks) {
    await env.DB.prepare("UPDATE backburner SET status='IN_PROGRESS', updated_at=? WHERE bb_id=?")
      .bind(now, t.bb_id).run().catch(() => {});
  }

  const result = await callOB1(env, tasks.map(t => t.bb_id));

  // Log dispatch cycle
  await env.DB.prepare(
    'INSERT INTO pcc_metrics (task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    `orchestrator → ob1: ${tasks.length} tasks`,
    tasks.length, 'orchestrator', 0,
    JSON.stringify(result).length, 1, null
  ).run().catch(() => {});

  return { ok: true, dispatched: tasks.length, informational_closed: informational.length, ob1: result };
}

export async function handleOrchestrate(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === '/api/orchestrate/dispatch' && request.method === 'POST') {
    return Response.json(await runOrchestrator(env));
  }

  if (pathname === '/api/orchestrate/status' && request.method === 'GET') {
    const recent = await env.DB.prepare(
      "SELECT bb_id, title, status, source, updated_at FROM backburner ORDER BY updated_at DESC LIMIT 10"
    ).all().catch(() => ({ results: [] }));
    const metrics = await env.DB.prepare(
      "SELECT task_preview, passed, duration_ms FROM pcc_metrics WHERE model='orchestrator' ORDER BY rowid DESC LIMIT 5"
    ).all().catch(() => ({ results: [] }));
    return Response.json({ recent_tasks: recent.results, recent_dispatches: metrics.results });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
