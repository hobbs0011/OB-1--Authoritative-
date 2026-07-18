const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db');
const repo = 'D:\\OB-1-CANONICAL';
const rrlDir = path.join(repo, 'RRL');

function getLastDeathRun() {
  const { execSync } = require('child_process');
  const out = execSync('git log --oneline --grep "^death:" -1', { cwd: repo, encoding: 'utf8' }).trim();
  const m = out.match(/run\s*(\d+)/i);
  return m ? parseInt(m[1], 10) + 1 : 0;
}

function getLatestSession() {
  const row = db.prepare(`
    SELECT s.id, s.title, s.time_updated,
           COUNT(DISTINCT m.id) as msg_count
    FROM session s
    LEFT JOIN message m ON m.session_id = s.id
    GROUP BY s.id
    ORDER BY s.time_updated DESC
    LIMIT 1
  `).all()[0];
  return row;
}

function extractSession(sessionId) {
  const messages = db.prepare(`
    SELECT m.id, m.time_created, m.data as msg_data
    FROM message m
    WHERE m.session_id = ?
    ORDER BY m.time_created ASC
  `).all(sessionId);

  const parts = db.prepare(`
    SELECT p.message_id, p.data as part_data
    FROM part p
    WHERE p.session_id = ?
    ORDER BY p.time_created ASC
  `).all(sessionId);

  const partsByMsg = {};
  for (const p of parts) {
    if (!partsByMsg[p.message_id]) partsByMsg[p.message_id] = [];
    partsByMsg[p.message_id].push(p.part_data);
  }

  const lines = [];
  for (const msg of messages) {
    let msgObj;
    try { msgObj = JSON.parse(msg.msg_data); } catch { continue; }
    if (!msgObj.role) continue;

    const role = msgObj.role;
    const textParts = (partsByMsg[msg.id] || [])
      .map(p => { try { return JSON.parse(p); } catch { return null; } })
      .filter(p => p && p.type === 'text' && typeof p.text === 'string')
      .map(p => p.text.trim())
      .filter(t => t.length > 0);

    if (textParts.length === 0) continue;

    if (role === 'user') {
      lines.push('## User');
      lines.push(textParts.join('\n\n'));
    } else if (role === 'assistant') {
      lines.push('## Assistant');
      lines.push(textParts.join('\n\n'));
    }
  }

  return lines.join('\n\n');
}

const latest = getLatestSession();
if (!latest) {
  console.error('No sessions found in Kilo DB');
  process.exit(1);
}

console.log(`Latest session: ${latest.id} | ${latest.title} | msgs=${latest.msg_count} | updated=${new Date(latest.time_updated).toISOString()}`);

const run = getLastDeathRun();
const rrlPath = path.join(rrlDir, `RRL-${run}.txt`);
const transcript = extractSession(latest.id);

if (!transcript || transcript.trim().length === 0) {
  console.error('No transcript content extracted from session');
  process.exit(1);
}

fs.mkdirSync(rrlDir, { recursive: true });
fs.writeFileSync(rrlPath, transcript, 'utf8');
const bytes = Buffer.byteLength(transcript, 'utf8');
console.log(`RRL WRITTEN: ${rrlPath} - ${bytes} bytes (${transcript.split(/\n+/).length} lines)`);

db.close();
