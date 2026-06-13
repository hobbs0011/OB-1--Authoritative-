export async function logToD1(env, { action, task, result, tier, ip }) {
  if (!env.DB) return null;
  const id = 'PC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS phoenix_architecti_log (
        id TEXT PRIMARY KEY, tasktype TEXT, taskinput TEXT, result TEXT, createdat TEXT, ip TEXT
      )`
    ).run();
    await env.DB.prepare(
      `INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat, ip) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      action,
      (task || '').slice(0, 2000),
      (result || '').slice(0, 4000),
      new Date().toISOString(),
      ip || ''
    ).run();
    return id;
  } catch (err) {
    console.warn('logToD1 failed:', err.message);
    return null;
  }
}
