// kilog-capture.js — Extract current session transcript from Kilo DB
// CANON/SCRIPTS/ — sole script repository. No exceptions.
// Usage: node CANON/SCRIPTS/kilog-capture.js [--session <id>]
// Output: RRL/<session-title>.txt (JSONL format, all parts: text/reasoning/tool)

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.KILO_DB || path.join(process.env.HOME || process.env.USERPROFILE, '.local/share/kilo/kilo.db');

function extractPartData(p) {
  let data = p.data, type = 'text';
  if (typeof data === 'string') {
    try { const parsed = JSON.parse(data); data = parsed; type = parsed.type || 'text'; } catch(e) {}
  }
  return { type, data };
}

function main() {
  const db = new Database(dbPath);
  const targetId = process.argv.find(a => a.startsWith('--session='))?.split('=')[1];

  let sessions;
  if (targetId) {
    sessions = db.prepare('SELECT id, title, agent, time_created FROM session WHERE id = ?').all(targetId);
  } else {
    sessions = db.prepare(`SELECT id, title, agent, time_created FROM session 
      WHERE agent != 'explore' ORDER BY time_created DESC LIMIT 1`).all();
  }

  if (!sessions.length) { console.error('No session found'); process.exit(1); }
  const session = sessions[0];

  // Extract from message table (has actual content).
  // Drizzle ORM stores Kilo messages in this table.
  const msgs = db.prepare('SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created ASC').all(session.id);
  const output = [];
  msgs.forEach(msg => {
    const meta = typeof msg.data === 'string' ? (() => { try { return JSON.parse(msg.data); } catch(e) { return {}; } })() : (msg.data || {});
    const role = meta.role || 'unknown';
    const parts = db.prepare('SELECT data FROM part WHERE message_id = ? ORDER BY time_created ASC').all(msg.id);
    const content = parts.map(extractPartData);
    output.push({ role, time: msg.time_created, content });
  });

  const safeTitle = (session.title || 'untitled').replace(/[^a-zA-Z0-9-_. ]/g, '-').trim();
  const dest = path.join('RRL', `${safeTitle}.txt`);
  const jsonl = output.map(e => JSON.stringify(e)).join('\n');
  fs.writeFileSync(dest, jsonl, 'utf8');

  const stats = fs.statSync(dest);
  console.log(JSON.stringify({ session: session.id, title: session.title, messages: output.length, parts: output.reduce((s,m) => s + m.content.length, 0), bytes: stats.size, dest }));
  db.close();
}

main();