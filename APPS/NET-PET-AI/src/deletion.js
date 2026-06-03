// src/deletion.js — P10: Student data erasure (GDPR-style)
// Purges all data for a student from D1 + KV, logs to audit_log.
// Tables with student_id: soul_prompts, error_log.
// submissions.payload encryption is in submission-api worker (separate CF worker).

export async function handleStudentErase(studentId, env) {
  const ts = Math.floor(Date.now() / 1000);
  let d1Rows = 0;
  let kvKeys = 0;

  // D1 purge — tables with student_id column
  const results = await env.SOUL_DB.batch([
    env.SOUL_DB.prepare('DELETE FROM soul_prompts WHERE student_id = ?').bind(studentId),
    env.SOUL_DB.prepare('DELETE FROM error_log WHERE student_id = ?').bind(studentId),
  ]);
  d1Rows = results.reduce((a, r) => a + (r.meta?.changes || 0), 0);

  // Audit log — separate run so a missing table doesn't abort the purge
  try {
    await env.SOUL_DB.prepare(
      'INSERT INTO audit_log (ts, action, actor, target) VALUES (?, ?, ?, ?)'
    ).bind(ts, 'STUDENT_ERASE', 'admin', studentId).run();
  } catch (e) {
    console.warn('audit_log insert failed:', e.message);
  }

  // KV purge — NET_PET_KV (session hints, subscriptions, idempotency keys, etc.)
  let cursor;
  do {
    const listed = await env.NET_PET_KV.list({ prefix: studentId, cursor });
    await Promise.all(listed.keys.map(k => env.NET_PET_KV.delete(k.name)));
    kvKeys += listed.keys.length;
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  // KV purge — RATELIMIT (per-student quota counters)
  cursor = undefined;
  do {
    const listed = await env.RATELIMIT.list({ prefix: studentId + ':', cursor });
    await Promise.all(listed.keys.map(k => env.RATELIMIT.delete(k.name)));
    kvKeys += listed.keys.length;
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);

  return { ok: true, purged: { d1_rows: d1Rows, kv_keys: kvKeys } };
}
