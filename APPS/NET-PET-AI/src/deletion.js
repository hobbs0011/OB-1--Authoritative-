// src/deletion.js — P10: Student data erasure (GDPR-style)
// Purges all data for a student from D1 + KV + DO, logs to audit_log_v2.
// Tables with student_id: soul_prompts, error_log.

import { encryptField, decryptField } from './encryption.js';

export async function handleStudentErase(studentId, env, performedBy = 'admin') {
  const ts = Math.floor(Date.now() / 1000);
  let d1Rows = 0;
  let kvKeys = 0;
  let doDeleted = 0;

  // D1 purge — tables with student_id column
  const results = await env.SOUL_DB.batch([
    env.SOUL_DB.prepare('DELETE FROM soul_prompts WHERE student_id = ?').bind(studentId),
    env.SOUL_DB.prepare('DELETE FROM error_log WHERE student_id = ?').bind(studentId),
  ]);
  d1Rows = results.reduce((a, r) => a + (r.meta?.changes || 0), 0);

  // DO purge — PETS
  if (env.PETS) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      const r = await petStub.fetch(new Request('https://do/purge?studentId=' + studentId, { method: 'POST' }));
      const data = await r.json();
      if (data.ok) doDeleted++;
    } catch (e) {
      console.warn('PET_DO_PURGE_FAIL:', e.message);
    }
  }

  // DO purge — MEMORY
  if (env.MEMORY) {
    try {
      const memStub = env.MEMORY.get(env.MEMORY.idFromName(studentId));
      const r = await memStub.fetch(new Request('https://do/purge?studentId=' + studentId, { method: 'POST' }));
      const data = await r.json();
      if (data.ok) doDeleted++;
    } catch (e) {
      console.warn('MEMORY_DO_PURGE_FAIL:', e.message);
    }
  }

  // DO purge — LEDGER
  if (env.LEDGER) {
    try {
      const ledgerStub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const r = await ledgerStub.fetch(new Request('https://do/purge?studentId=' + studentId, { method: 'POST' }));
      const data = await r.json();
      if (data.ok) doDeleted++;
    } catch (e) {
      console.warn('LEDGER_DO_PURGE_FAIL:', e.message);
    }
  }

  // Audit log — record the erasure
  try {
    await env.SOUL_DB.prepare(
      'INSERT INTO audit_log_v2 (id, ts, action, target, performed_by, metadata) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts,
      'STUDENT_ERASE',
      studentId,
      performedBy,
      JSON.stringify({ student_id: studentId, ip: env.CF_IP || 'unknown' })
    ).run();
  } catch (e) {
    console.warn('audit_log insert failed:', e.message);
  }

  // KV purge — comprehensive student data keys
  const kvKeyPrefixes = [
    `student_profile_${studentId}`,
    `session_history_${studentId}`,
    `srs_data_${studentId}`,
    `phonics_progress_${studentId}`,
    `vocab_list_${studentId}`,
    `vocab_arc_${studentId}`,
    `lang:${studentId}`,
    `goals:${studentId}`,
    `subscription:${studentId}`,
    `student_pw_${studentId}`,
    `streak:${studentId}`,
    `anticheat:${studentId}:`,
    `chat_memory:${studentId}`,
    `srs:${studentId}:`,
    `saveface:${studentId}:`,
    `referral-list:${studentId}`,
  ];

  for (const key of kvKeyPrefixes) {
    try { await env.NET_PET_KV.delete(key); kvKeys++; } catch (_) {}
  }

  // Scan and delete remaining patterns
  for (const pattern of ['anticheat:', 'srs:', 'saveface:', 'referral-list:']) {
    let cursor;
    do {
      const listed = await env.NET_PET_KV.list({ prefix: pattern + studentId, cursor });
      await Promise.all(listed.keys.map(k => env.NET_PET_KV.delete(k.name)));
      kvKeys += listed.keys.length;
      cursor = listed.list_complete ? undefined : listed.cursor;
    } while (cursor);
  }

  // Scan class transcripts (one per class date)
  let classCursor;
  do {
    const listed = await env.NET_PET_KV.list({ prefix: `class_transcript_${studentId}_`, cursor: classCursor });
    await Promise.all(listed.keys.map(k => env.NET_PET_KV.delete(k.name)));
    kvKeys += listed.keys.length;
    classCursor = listed.list_complete ? undefined : listed.cursor;
  } while (classCursor);

  // KV purge — RATELIMIT quota keys (format: quota:{studentId}:{type}:{hourBucket})
  // EC-deleteguard + EC-deleteprefix: guard missing binding; correct prefix was studentId: (wrong), now quota:{studentId}
  if (env.RATELIMIT) {
    let cursor = undefined;
    do {
      const listed = await env.RATELIMIT.list({ prefix: `quota:${studentId}:`, cursor });
      await Promise.all(listed.keys.map(k => env.RATELIMIT.delete(k.name)));
      kvKeys += listed.keys.length;
      cursor = listed.list_complete ? undefined : listed.cursor;
    } while (cursor);
  }

  // STUDENT_MEMORY purge
  if (env.STUDENT_MEMORY) {
    try {
      const fullKey = `mem:${studentId}`;
      await env.STUDENT_MEMORY.delete(fullKey);
      kvKeys++;
    } catch (e) {
      console.warn('STUDENT_MEMORY_PURGE_FAIL:', e.message);
    }
  }

  return { ok: true, purged: { d1_rows: d1Rows, kv_keys: kvKeys, do_deleted: doDeleted, student_id: studentId, timestamp: ts } };
}