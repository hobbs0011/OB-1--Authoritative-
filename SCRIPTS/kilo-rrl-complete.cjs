const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db');
const repo = 'D:\\OB-1-CANONICAL';
const sessionId = 'ses_1161a41d0ffepxyVzjs98ME1fJ';
const outPath = path.join(repo, 'RRL', 'RRL-182-COMPLETE.jsonl');

const messages = db.prepare(`
  SELECT m.id, m.time_created, m.data as msg_data
  FROM message m
  WHERE m.session_id = ?
  ORDER BY m.time_created ASC
`).all(sessionId);

const parts = db.prepare(`
  SELECT p.id, p.message_id, p.session_id, p.time_created, p.time_updated, p.data
  FROM part p
  WHERE p.session_id = ?
  ORDER BY p.time_created ASC
`).all(sessionId);

const partsByMsg = {};
for (const p of parts) {
  if (!partsByMsg[p.message_id]) partsByMsg[p.message_id] = [];
  let parsed = null;
  if (p.data) {
    try { parsed = JSON.parse(p.data); } catch {}
  }
  partsByMsg[p.message_id].push({
    id: p.id,
    time_created: p.time_created,
    type: parsed && typeof parsed.type === 'string' ? parsed.type : 'unknown',
    data: p.data,
    text: parsed && typeof parsed.text === 'string' ? parsed.text : null
  });
}

const lines = [];
for (const msg of messages) {
  let msgObj;
  try { msgObj = JSON.parse(msg.msg_data); } catch { continue; }
  if (!msgObj || !msgObj.role) continue;

  const role = msgObj.role;
  const msgParts = partsByMsg[msg.id] || [];

  // Build a full content array preserving every part in order
  const content = [];
  for (const part of msgParts) {
    if (part.type === 'text' && part.text) {
      content.push({ type: 'text', text: part.text });
    } else if (part.type === 'reasoning' && part.text) {
      content.push({ type: 'reasoning', text: part.text });
    } else if (part.type === 'tool') {
      // Include tool call data verbatim
      let toolObj = null;
      try { toolObj = JSON.parse(part.data); } catch {}
      if (toolObj) {
        content.push({ type: 'tool', ...toolObj });
      } else {
        content.push({ type: 'tool', raw: part.data });
      }
    } else if (part.type === 'step-start') {
      content.push({ type: 'step-start', time: part.time_created });
    } else if (part.type === 'step-finish') {
      let finishObj = null;
      try { finishObj = JSON.parse(part.data); } catch {}
      content.push({ type: 'step-finish', ...finishObj, time: part.time_created });
    } else {
      // Unknown part type - preserve raw
      content.push({ type: part.type, raw: part.data, time: part.time_created });
    }
  }

  if (content.length === 0) continue;

  const envelope = {
    role,
    content
  };

  lines.push(JSON.stringify(envelope));
}

fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${lines.length} messages to ${outPath}`);
const stat = fs.statSync(outPath);
console.log(`Bytes: ${stat.size}`);
