const db = require('better-sqlite3')('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db', {readonly: true});
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t=>t.name).join(', '));
const sessions = db.prepare('SELECT * FROM session ORDER BY time_created DESC LIMIT 5').all();
sessions.forEach(s => console.log('Session:', (s.id||'').slice(-30), '| created:', s.time_created, '| msgs:', s.message_count));
db.close();