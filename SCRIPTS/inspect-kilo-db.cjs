const Database = require('better-sqlite3');
const db = new Database('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => {
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  console.log(t.name + ': ' + cols.map(c => c.name).join(', '));
});
