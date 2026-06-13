const AUTH = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=';
const SELF = { name: 'pcc2-anakin', url: 'https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev' };
const PEERS = [
  { name: 'pcc1-obi',   url: 'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev' },
  { name: 'pcc3-windu', url: 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev' },
];

async function sendTelegram(env, msg) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
  }).catch(() => {});
}

async function pingPeers(env, alertMsg) {
  for (const peer of PEERS) {
    await fetch(`${peer.url}/api/message`, {
      method: 'POST',
      headers: { 'x-pa-auth': AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: alertMsg })
    }).catch(() => {});
  }
}

async function updatePheromoneTrail(env, pccName, delta = {}) {
  const trailKey = 'phetrail:latest';
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || '{}');
  const ts = new Date().toISOString();

  if (!trail.positive_trails) trail.positive_trails = [];
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.pcc_metrics) trail.state_markers.pcc_metrics = {};

  trail.state_markers.pcc_metrics[pccName] = { ts, ...delta };
  trail.state_markers.last_updated = ts;

  await env.PHETRAIL.put(trailKey, JSON.stringify(trail));
  return trail;
}

async function readPheromoneTrail(env) {
  const trailKey = 'phetrail:latest';
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || '{}');
  return trail;
}

export async function runWatchdog(env) {
  const now = Date.now();
  const results = [];
  const trail = await readPheromoneTrail(env);

  for (const pcc of PEERS) {
    const lastBatchesKey = `force:${pcc.name}:last_batches`;
    const restartsKey = `force:${pcc.name}:restarts`;
    let status = null;
    let dead = false;
    let reason = '';

    try {
      const r = await fetch(`${pcc.url}/api/race/status`, { headers: { 'x-pa-auth': AUTH } });
      if (!r.ok) { dead = true; reason = `status ${r.status}`; }
      else {
        status = await r.json();
        if (status.elapsed_ms >= status.budget_ms) { dead = true; reason = 'budget_exhausted'; }
        else {
          const lastBatches = parseInt(await env.PHETRAIL.get(lastBatchesKey) || '0');
          if (status.batches_run <= lastBatches && status.batches_run > 0) { dead = true; reason = 'stalled'; }
        }
      }
    } catch(e) { dead = true; reason = e.message; }

    if (status) await env.PHETRAIL.put(lastBatchesKey, String(status.batches_run));

    if (dead) {
      const alert = `🚨 *Agent 99 OS ALERT*\n${SELF.name} ForceAwareness: *${pcc.name}* is DOWN\nReason: ${reason}\nTime: ${new Date(now).toISOString()}`;
      await sendTelegram(env, alert);
      await pingPeers(env, `WATCHDOG ALERT from ${SELF.name}: ${pcc.name} is DOWN — reason: ${reason}. Auto-restart attempted.`);

      try {
        await fetch(`${pcc.url}/api/race/start`, {
          method: 'POST',
          headers: { 'x-pa-auth': AUTH, 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget_ms: 10800000 })
        });
        const restarts = parseInt(await env.PHETRAIL.get(restartsKey) || '0') + 1;
        await env.PHETRAIL.put(restartsKey, String(restarts));
        const log = JSON.parse(await env.PHETRAIL.get('force:log') || '[]');
        log.push({ ts: now, reporter: SELF.name, pcc: pcc.name, reason, restarted: true });
        if (log.length > 100) log.splice(0, log.length - 100);
        await env.PHETRAIL.put('force:log', JSON.stringify(log));
        results.push({ pcc: pcc.name, dead, reason, restarted: true });
      } catch(e) {
        results.push({ pcc: pcc.name, dead, reason, restart_error: e.message });
      }
    } else {
      results.push({ pcc: pcc.name, dead: false, batches: status?.batches_run, score: status?.score });
    }
  }

  await env.PHETRAIL.put('force:status', JSON.stringify({ checked_at: now, reporter: SELF.name, results }));
  await updatePheromoneTrail(env, SELF.name, { force_awareness: true, peers_checked: results.length, dead_count: results.filter(r => r.dead).length });
  return results;
}

export async function handleForce(request, env) {
  const status = await env.PHETRAIL.get('force:status', { type: 'json' });
  const log = await env.PHETRAIL.get('force:log', { type: 'json' });
  const restarts = {};
  for (const pcc of PEERS) {
    restarts[pcc.name] = parseInt(await env.PHETRAIL.get(`force:${pcc.name}:restarts`) || '0');
  }
  return Response.json({ reporter: SELF.name, status, log: (log || []).slice(-20), restarts });
}

export const ForceAwareness = runWatchdog;
export const runWatchdogLegacy = runWatchdog;
export const handleWatchdogAlias = handleForce;
