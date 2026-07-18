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
const session = db.prepare('SELECT id, time_created FROM session ORDER BY time_created DESC LIMIT 1').get();
if (!session) {
  console.error('NO SESSION FOUND');
  process.exit(1);
}

const sessionId = session.id;
console.log('Session:', sessionId);

// Get messages for this session
const messages = db.prepare('SELECT id, time_created, data FROM message WHERE session_id = ? ORDER BY time_created ASC').all(sessionId);
console.log('Messages:', messages.length);

const lines = [];
for (const m of messages) {
  let role = 'unknown';
  let content = '';
  try {
    const data = JSON.parse(m.data);
    role = data.role || 'unknown';
    if (data.parts && Array.isArray(data.parts)) {
      content = data.parts.map(p => p.data || '').join('\n');
    } else if (typeof data.content === 'string') {
      content = data.content;
    } else {
      content = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    content = String(m.data);
  }

  const header = role === 'user' ? '## User' : role === 'assistant' ? '## Assistant' : `## ${role}`;
  lines.push(header);
  lines.push(content);
  lines.push('');
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, `RRL-${run}.txt`);
fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log('RRL written:', outPath);
console.log('Run:', run);
