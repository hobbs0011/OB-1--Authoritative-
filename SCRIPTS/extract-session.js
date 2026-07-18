const db = require('better-sqlite3')('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db', {readonly: true});
const fs = require('fs');

// Get most recent session
const session = db.prepare('SELECT id, time_created FROM session ORDER BY time_created DESC LIMIT 1').get();
console.log('Session:', session.id, '| created:', new Date(session.time_created).toISOString());

// Check message table schema
const cols = db.prepare("PRAGMA table_info(message)").all();
console.log('Message columns:', cols.map(c => c.name).join(', '));

// Get all messages for this session
const msgs = db.prepare('SELECT * FROM message WHERE session_id = ? ORDER BY id ASC').all(session.id);
console.log('Messages:', msgs.length);

if (msgs.length > 0) {
    // Check part table schema
    const pcols = db.prepare("PRAGMA table_info(part)").all();
    console.log('Part columns:', pcols.map(c => c.name).join(', '));
    
    // Show first message
    console.log('First msg keys:', Object.keys(msgs[0]).join(', '));
}

db.close();