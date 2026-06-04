// ── Structured Error Logger for Cloudflare Workers ───────────────────────────
// Replaces scattered console.error with structured JSON logs.
// In production: writes to D1 error_log table (persistent, queryable).
// Fallback: console.warn with [ERR] prefix for wrangler tail visibility.
//
// Usage:
//   import { logError, logWarn, logInfo } from './logger.js';
//   logError('STT_FAIL', { studentId, status: 502 }, env);
//   logWarn('KV_MISS', { key: 'student_profile_xxx' }, env);
//   logInfo('SESSION_START', { studentId, turns: 0 }, env);

async function writeLog(level, tag, data, env) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    tag,
    ...data,
  };

  // Always print for wrangler tail visibility
  const line = `[${level}] ${tag} ${JSON.stringify(data)}`;
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN') console.warn(line);
  else console.log(line);

  // Persist to D1 if available
  if (env?.SOUL_DB) {
    try {
      await env.SOUL_DB.prepare(
        'INSERT INTO error_log (ts, level, tag, payload) VALUES (?, ?, ?, ?)'
      ).bind(entry.ts, level, tag, JSON.stringify(data)).run();
    } catch (e) {
      // D1 write failed — don't recurse, just note it
      console.error(`[LOGGER] D1 write failed for ${tag}: ${e.message}`);
    }
  }
}

export function logError(tag, data, env) { return writeLog('ERROR', tag, data || {}, env); }
export function logWarn(tag, data, env)  { return writeLog('WARN', tag, data || {}, env); }
export function logInfo(tag, data, env)  { return writeLog('INFO', tag, data || {}, env); }

// Block U: Audit log — admin action tracking
export async function logAudit(env, actor, action, target, metadata = {}) {
  if (!env?.SOUL_DB) {
    console.log(`[AUDIT] ${actor} ${action} ${target} ${JSON.stringify(metadata)}`);
    return;
  }
  try {
    await env.SOUL_DB.prepare(
      "INSERT INTO audit_log (id, ts, actor, action, target, metadata) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(),
      Date.now(),
      actor,
      action,
      target,
      JSON.stringify(metadata)
    ).run();
  } catch (e) {
    console.error(`[AUDIT] D1 write failed: ${e.message}`);
  }
}
