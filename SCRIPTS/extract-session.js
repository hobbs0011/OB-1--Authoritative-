const db = require('better-sqlite3')('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db', {readonly: true});
const fs = require('fs');

const session = db.prepare('SELECT id, time_created FROM session ORDER BY time_created DESC LIMIT 1').get();
console.log('Session:', session.id, '|', new Date(session.time_created).toISOString());

const msgs = db.prepare('SELECT id, data FROM message WHERE session_id = ? ORDER BY time_created ASC').all(session.id);
console.log('Messages:', msgs.length);

let output = '';
let userTurns = 0, assistantTurns = 0, totalBytes = 0;

for (const msg of msgs) {
    // Get role from message data
    let role = 'unknown';
    try {
        const msgData = JSON.parse(msg.data);
        role = msgData.role || 'unknown';
    } catch(e) {}

    // Get parts for this message
    const parts = db.prepare('SELECT data FROM part WHERE message_id = ? ORDER BY time_created ASC').all(msg.id);
    if (parts.length === 0) continue;

    // Join all part texts
    let text = '';
    for (const part of parts) {
        try {
            const partData = JSON.parse(part.data);
            if (partData.text) text += partData.text + '\n';
        } catch(e) {}
    }
    text = text.trim();
    if (!text) continue;

    if (role === 'user') userTurns++;
    else if (role === 'assistant') assistantTurns++;

    output += `## ${role.toUpperCase()}\n${text}\n\n`;
    totalBytes += Buffer.byteLength(text, 'utf8');
}

const path = 'D:\\OB-1-CANONICAL\\RRL\\RRL-175.txt';
fs.writeFileSync(path, output, 'utf8');
const size = fs.statSync(path).size;
console.log('Written:', size, 'bytes | User:', userTurns, '| Asst:', assistantTurns, '| Text:', totalBytes, 'chars');
db.close();