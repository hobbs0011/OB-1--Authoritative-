const AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const PCCS = [
  { name: 'pcc-student', url: 'https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev' },
  { name: 'pcc-ops',     url: 'https://phoenix-pcc-3.mrmichaelhobbs123.workers.dev' },
  { name: 'pcc-arch',    url: 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev' },
];

export async function runWatchdog(env) {
  const now = Date.now();
  const results = [];

  for (const pcc of PCCS) {
    const lastBatchesKey = `watchdog:${pcc.name}:last_batches`;
    const restartsKey = `watchdog:${pcc.name}:restarts`;

    let status = null;
    let dead = false;
    let reason = '';

    try {
      const r = await fetch(`${pcc.url}/api/race/status`, {
        headers: { 'x-pa-auth': AUTH }
      });
      if (!r.ok) { dead = true; reason = `status ${r.status}`; }
      else {
        status = await r.json();
        if (status.elapsed_ms >= status.budget_ms) { dead = true; reason = 'budget exhausted'; }
        else {
          const lastBatches = parseInt(await env.CACHE.get(lastBatchesKey) || '0');
          if (status.batches_run <= lastBatches && status.batches_run > 0) { dead = true; reason = 'stalled'; }
        }
      }
    } catch(e) { dead = true; reason = e.message; }

    if (status) await env.CACHE.put(lastBatchesKey, String(status.batches_run));

    if (dead) {
      try {
        await fetch(`${pcc.url}/api/race/start`, {
          method: 'POST',
          headers: { 'x-pa-auth': AUTH, 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget_ms: 10800000 })
        });
        const restarts = parseInt(await env.CACHE.get(restartsKey) || '0') + 1;
        await env.CACHE.put(restartsKey, String(restarts));
        const log = JSON.parse(await env.CACHE.get('watchdog:log') || '[]');
        log.push({ ts: now, pcc: pcc.name, reason, restarted: true });
        if (log.length > 100) log.splice(0, log.length - 100);
        await env.CACHE.put('watchdog:log', JSON.stringify(log));
        results.push({ pcc: pcc.name, dead, reason, restarted: true });
      } catch(e) {
        results.push({ pcc: pcc.name, dead, reason, restart_error: e.message });
      }
    } else {
      results.push({ pcc: pcc.name, dead: false, batches: status?.batches_run, score: status?.score });
    }
  }

  await env.CACHE.put('watchdog:status', JSON.stringify({ checked_at: now, results }));
  return results;
}

export async function handleWatchdog(request, env) {
  const status = await env.CACHE.get('watchdog:status', { type: 'json' });
  const log = await env.CACHE.get('watchdog:log', { type: 'json' });
  const restarts = {};
  for (const pcc of PCCS) {
    restarts[pcc.name] = parseInt(await env.CACHE.get(`watchdog:${pcc.name}:restarts`) || '0');
  }
  return Response.json({ status, log: (log || []).slice(-20), restarts });
}
