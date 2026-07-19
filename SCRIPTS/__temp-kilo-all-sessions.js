const Database = require('better-sqlite3');
const db = new Database('C:/Users/mrmic/.local/share/kilo/kilo.db');
// Get recent sessions beyond just subagent ones
const recent = db.prepare('SELECT id, title, agent, model, time_created FROM session ORDER BY time_created DESC LIMIT 20').all();
recent.forEach(s => {
  console.log(JSON.stringify({ 
    id: s.id.substring(0,30), 
    title: (s.title||'').substring(0,60), 
    agent: s.agent, 
    time: new Date(s.time_created).toISOString() 
  }));
});
db.close();