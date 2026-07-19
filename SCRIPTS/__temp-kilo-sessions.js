const Database = require('better-sqlite3');
const db = new Database('C:/Users/mrmic/.local/share/kilo/kilo.db');
const sessions = db.prepare('SELECT id, title, agent, model, time_created FROM session ORDER BY time_created DESC LIMIT 3').all();
sessions.forEach(s => {
  console.log(JSON.stringify({ id: s.id, title: s.title, agent: s.agent, model: s.model, time: new Date(s.time_created).toISOString() }));
});
db.close();