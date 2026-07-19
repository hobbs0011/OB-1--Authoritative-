const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('C:/Users/mrmic/.local/share/kilo/kilo.db');

// Get main sessions (not explore subagent)
const sessions = db.prepare(`SELECT id, title, agent, model, time_created, time_updated 
  FROM session WHERE agent != 'explore' 
  ORDER BY time_created DESC LIMIT 3`).all();

sessions.forEach(s => {
  const msgs = db.prepare(`SELECT id, time_created, data FROM session_message 
    WHERE session_id = ? ORDER BY seq ASC`).all(s.id);
  console.log(JSON.stringify({
    id: s.id,
    title: s.title,
    agent: s.agent,
    time: new Date(s.time_created).toISOString(),
    messages: msgs.length
  }));
});

db.close();