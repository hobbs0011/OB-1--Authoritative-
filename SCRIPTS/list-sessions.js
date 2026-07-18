const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\session-export.db');

const sessions = db.prepare("SELECT DISTINCT session_id, COUNT(*) as cnt, MAX(ts) as last_ts FROM event GROUP BY session_id ORDER BY last_ts DESC LIMIT 10").all();
console.log('RECENT SESSIONS:');
for (const s of sessions) {
  console.log(`  ${s.session_id}: ${s.cnt} events, last=${new Date(s.last_ts).toISOString()}`);
}

db.close();
