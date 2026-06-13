import { checkAdminKey } from './security.js';
import { createBBEntry } from './backburner.js';

const SYSTEM_PROMPT = `You generate dense session preparation briefs for an AI agent about to meet with a user.
Analyze the provided session data and return a brief covering:
1. BUILDING: What this person is actively working on (2-3 sentences)
2. STYLE: Communication register — tone, profanity comfort (none/occasional/heavy), humor level
3. GUARD: How relaxed should the AI be? (corporate/casual/follow-the-fucks)
4. THREADS: Open questions or unresolved topics from recent sessions
5. WATCH: Emotional markers, recurring patterns, what to lean into

Be dense. No filler. Under 400 words. This is read at boot — make every word count.`;

const ACTIVE_USERS = ['sov100-michael', 'mai-tram-bluetech', 'huong-bluetech'];

export async function generateBrief(userId, env) {
  if (!env.SOUL_LOGGER_SVC) return null;

  const ctxRes = await env.SOUL_LOGGER_SVC.fetch(
    new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
      method: 'GET', headers: { 'Content-Type': 'application/json' },
    })
  );
  if (!ctxRes.ok) return null;

  const ctx = await ctxRes.json();
  const { last_active, sessions = [], top_keywords = [] } = ctx;
  if (sessions.length === 0) return null;

  const sessionSummaries = sessions.map((s, i) => {
    const prompts = s.last_prompts?.map(p => p.text).join(' | ') || '';
    return `Session ${i + 1} (${s.ingested_at?.slice(0, 10)}): ${prompts.slice(0, 300)}`;
  }).join('\n');

  const keywords = top_keywords.slice(0, 10).map(k => `${k.keyword}(${k.weight})`).join(', ');

  const promptText = `USER: ${userId}
LAST ACTIVE: ${last_active || 'unknown'}
SESSION COUNT: ${sessions.length}
TOP KEYWORDS (weight): ${keywords || 'none yet'}

RECENT SESSION DATA:
${sessionSummaries || 'No sessions yet'}

Generate the session preparation brief.`;

  const aiResult = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: promptText },
    ],
    max_tokens: 500,
  });

  const brief = (aiResult?.response || '').trim();
  if (!brief) return null;

  const generatedAt = new Date().toISOString();
  await env.CACHE.put(`actualizer:${userId}:brief`, brief, { expirationTtl: 86400 }).catch(() => {});
  await env.CACHE.put(`actualizer:${userId}:meta`, JSON.stringify({ generated_at: generatedAt, userId, session_count: sessions.length }), { expirationTtl: 86400 }).catch(() => {});

  // Extract THREADS section and log open items to BB
  const threadsMatch = brief.match(/THREADS[:\s]+(.+?)(?=\n\n|\n\*\*|$)/is);
  if (threadsMatch && threadsMatch[1].trim().length > 20 && env.DB) {
    await createBBEntry(env, {
      title: `Actualizer thread — ${userId}`,
      description: threadsMatch[1].trim().slice(0, 500),
      source: 'actualizer',
      priority: '~',
      metadata: JSON.stringify({ userId, generated_at: generatedAt }),
    }).catch(() => {});
  }

  return { brief, generated_at: generatedAt, session_count: sessions.length };
}

export async function refreshAllBriefs(env) {
  const results = [];
  for (const userId of ACTIVE_USERS) {
    const result = await generateBrief(userId, env).catch(() => null);
    results.push({ userId, ok: !!result });
  }
  return results;
}

export async function checkPccHealth(env) {
  if (!env.DB) return;
  try {
    const cutoff = new Date(Date.now() - 86400000).toISOString();
    const total = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics WHERE created_at >= ?').bind(cutoff).first();
    const passed = await env.DB.prepare('SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1 AND created_at >= ?').bind(cutoff).first();
    const avgMs = await env.DB.prepare('SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1 AND created_at >= ?').bind(cutoff).first();

    const totalCalls = total?.cnt || 0;
    const passRate = totalCalls > 0 ? (passed?.cnt || 0) / totalCalls * 100 : null;
    const avgDuration = avgMs?.avg ? Math.round(avgMs.avg) : null;

    let status = 'HEALTHY';
    let reason = '';
    if (totalCalls === 0) { status = 'SILENT'; reason = 'no PCC calls in last 24h'; }
    else if (passRate < 70) { status = 'DEGRADED'; reason = `pass rate ${passRate.toFixed(1)}% (threshold 70%)`; }
    else if (avgDuration > 8000) { status = 'DEGRADED'; reason = `avg latency ${avgDuration}ms (threshold 8000ms)`; }

    if (status !== 'HEALTHY') {
      await createBBEntry(env, {
        title: `PCC HEALTH ${status}: ${reason}`,
        description: `24h stats — calls: ${totalCalls}, pass rate: ${passRate !== null ? passRate.toFixed(1) + '%' : 'N/A'}, avg_ms: ${avgDuration || 'N/A'}`,
        source: 'health-check',
        priority: '!!',
        metadata: JSON.stringify({ status, totalCalls, passRate, avgDuration }),
      }).catch(() => {});
    }
  } catch { /* non-blocking */ }
}

export async function handleActualizer(request, env) {
  const authResult = await checkAdminKey(request, env);
  if (authResult !== null) return authResult;

  const url = new URL(request.url);
  const method = request.method;

  // GET /api/actualizer/:userId — return cached brief
  if (method === 'GET') {
    const userId = url.pathname.split('/').filter(Boolean)[2] || 'sov100-michael';
    const brief = await env.CACHE.get(`actualizer:${userId}:brief`).catch(() => null);
    const metaRaw = await env.CACHE.get(`actualizer:${userId}:meta`).catch(() => null);
    if (brief) {
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      return Response.json({ ok: true, userId, brief, cached: true, ...meta });
    }
    return Response.json({ ok: false, brief: null, cached: false }, { status: 404 });
  }

  // POST /api/actualizer — generate fresh brief
  const body = await request.json().catch(() => ({}));
  const userId = body.userId || 'sov100-michael';

  const result = await generateBrief(userId, env);
  if (!result) {
    return Response.json({ ok: false, error: !env.SOUL_LOGGER_SVC ? 'SOUL_LOGGER_SVC binding not available' : 'No session data or AI failed' }, { status: 500 });
  }

  return Response.json({ ok: true, userId, ...result });
}
