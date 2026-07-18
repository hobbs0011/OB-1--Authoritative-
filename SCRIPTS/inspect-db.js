const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\session-export.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('TABLES:', tables.map(t => t.name).join(', '));

const cols = db.prepare("PRAGMA table_info(event)").all();
console.log('EVENT COLS:', cols.map(c => c.name).join(', '));

const sample = db.prepare("SELECT * FROM event ORDER BY rowid DESC LIMIT 1").all();
console.log('LATEST EVENT:', JSON.stringify(sample[0], null, 2).slice(0, 500));

db.close();
