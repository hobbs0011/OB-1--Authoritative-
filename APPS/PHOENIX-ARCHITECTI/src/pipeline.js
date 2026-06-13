import { checkAdminKey } from './security.js';

const SOUL_LOGGER_FALLBACK = 'https://soul-logger.mrmichaelhobbs123.workers.dev';

function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter(c => c.type === 'text').map(c => c.text || '').join('\n').trim();
  }
  return '';
}

export async function handlePipeline(request, env) {
  const authResponse = await checkAdminKey(request, env);
  if (authResponse !== null) return authResponse;

  const body = await request.json().catch(() => null);
  if (!body || !body.jsonl || !body.sessionId) {
    return Response.json({ error: 'jsonl and sessionId required' }, { status: 400 });
  }

  const { jsonl, sessionId, runNumber = 0 } = body;
  // Use Service Binding if available (bypasses CF loopback restriction), fallback to external URL
  const soulFetch = env.SOUL_LOGGER_SVC
    ? (path, opts) => env.SOUL_LOGGER_SVC.fetch(new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev${path}`, opts))
    : (path, opts) => fetch(`${SOUL_LOGGER_FALLBACK}${path}`, opts);

  const receipts = [];
  const lines = jsonl.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }

    // Only Michael's real turns — external user messages only
    if (entry.type !== 'user' || entry.userType !== 'external') continue;
    if (entry.message?.role !== 'user') continue;

    const text = extractText(entry.message.content);
    if (!text || text.length < 10) continue;

    try {
      const res = await soulFetch('/api/soul/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'sov100-michael',
          session_id: sessionId,
          role: 'user',
          text,
          timestamp: entry.timestamp || new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        receipts.push(data.event_id);
      } else {
        receipts.push(`ERR:${res.status}:${await res.text().catch(() => '?')}`);
      }
    } catch (e) { receipts.push(`EXC:${e.message}`); }
  }

  // #SSC gate — live soulcount after all posts
  let soulcount = null, level = null;
  try {
    const countRes = await soulFetch('/api/soul/count', { method: 'GET', headers: {} });
    const countData = await countRes.json();
    soulcount = countData.soulcount;
    level = countData.level;
  } catch { /* non-fatal */ }

  // Fix soul_turns_posted count — only count successful UUIDs, not error strings
  const successfulPosts = receipts.filter(r => !String(r).startsWith('ERR:') && !String(r).startsWith('EXC:')).length;

  return Response.json({
    ok: true,
    run: runNumber,
    soul_turns_posted: successfulPosts,
    soulcount,
    level,
    receipts,
  });
}
