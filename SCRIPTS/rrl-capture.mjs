const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db';
const outDir = 'RRL';
const run = 164;

if (!fs.existsSync(dbPath)) {
  console.error('DB MISSING:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

// Get latest session
const session = db.prepare('SELECT id, created_at FROM session ORDER BY created_at DESC LIMIT 1').get();
if (!session) {
  console.error('NO SESSION FOUND');
  process.exit(1);
}

const sessionId = session.id;
console.log('Session:', sessionId);

// Get messages for this session
const messages = db.prepare('SELECT id, role, created_at FROM message WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
console.log('Messages:', messages.length);

const lines = [];
for (const m of messages) {
  const header = m.role === 'user' ? '## User' : m.role === 'assistant' ? '## Assistant' : `## ${m.role}`;
  const parts = db.prepare('SELECT role, data FROM part WHERE message_id = ? ORDER BY created_at ASC').all(m.id);
  const body = parts.map(p => p.data).join('\n');
  lines.push(header);
  lines.push(body);
  lines.push('');
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, `RRL-${run}.txt`);
fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log('RRL written:', outPath);
console.log('Run:', run);
