const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('C:/Users/mrmic/.local/share/kilo/kilo.db');
const sessionId = 'ses_085fe8353ffeEswsUod15BrmO5';

// Get all messages with their parts
const msgs = db.prepare(`SELECT id, type, seq, time_created, data FROM session_message 
  WHERE session_id = ? ORDER BY seq ASC`).all(sessionId);

const output = [];
msgs.forEach(msg => {
  const parts = db.prepare(`SELECT id, type, time_created, data FROM part 
    WHERE message_id = ? ORDER BY time_created ASC`).all(msg.id);
  
  const entry = {
    role: msg.type,
    time: msg.time_created,
    content: []
  };
  
  parts.forEach(p => {
    let data = p.data;
    try { data = JSON.parse(p.data); } catch(e) {}
    entry.content.push({
      type: p.type,
      data: data
    });
  });
  
  output.push(entry);
});

const jsonl = output.map(e => JSON.stringify(e)).join('\n');
const destPath = 'RRL/Incarnate4- I-LOG Procedure.txt';
fs.writeFileSync(destPath, jsonl, 'utf8');
const stats = fs.statSync(destPath);
console.log(JSON.stringify({
  session: sessionId,
  title: 'Incarnate-4-PhoenixScout',
  messages: output.length,
  bytes: stats.size,
  dest: destPath
}));
db.close();