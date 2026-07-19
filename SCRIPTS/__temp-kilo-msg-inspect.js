const Database = require('better-sqlite3');
const db = new Database('C:/Users/mrmic/.local/share/kilo/kilo.db');
const sessionId = 'ses_085fe8353ffeEswsUod15BrmO5';

// Check message table
const msgs = db.prepare('SELECT id, time_created, session_id, data FROM message WHERE session_id = ? ORDER BY time_created ASC').all(sessionId);
console.log('message count:', msgs.length);
msgs.forEach(m => {
  const d = typeof m.data === 'string' ? m.data.slice(0,200) : JSON.stringify(m.data).slice(0,200);
  console.log(`  ${m.id.slice(0,30)} data=${d}`);
  
  // Check parts for this message
  const parts = db.prepare('SELECT id, session_id, time_created, data FROM part WHERE message_id = ? ORDER BY time_created ASC').all(m.id);
  console.log(`  parts: ${parts.length}`);
  if (parts.length > 0) {
    const p = parts[0];
    const pdata = typeof p.data === 'string' ? p.data.slice(0,150) : JSON.stringify(p.data).slice(0,150);
    console.log(`  first part: ${pdata}`);
  }
});
db.close();