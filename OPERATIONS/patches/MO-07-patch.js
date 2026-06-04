export async function logToD1(env, {action, task, result, tier, ip}) {
  const sqlite3 = await import('sqlite3');
  const db = new sqlite3.Database('./database.db');
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS phoenix_architecti_log (
          id TEXT PRIMARY KEY,
          tasktype TEXT,
          taskinput TEXT,
          result TEXT,
          createdat TEXT,
          ip TEXT
        );
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    const id = "PC-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const taskinput = task.slice(0, 2000);
    const resultString = (result || "").slice(0, 4000);
    const createdat = new Date().toISOString();
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat, ip)
        VALUES (?, ?, ?, ?, ?, ?);
      `, [id, action, taskinput, resultString, createdat, ip], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    db.close();
    return id;
  } catch (err) {
    console.warn(err);
    return null;
  }
}
