// SCRIPTS/extract-current-session.js — Extract Kilo session transcript from SQLite
// Usage: node SCRIPTS/extract-current-session.js [sessionId]
//   - With argument: uses the provided session ID
//   - Without argument: lists recent sessions and exits
//   - With --latest: auto-detects the most recent session

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\mrmic\\.local\\share\\kilo\\session-export.db';
const outputFile = 'D:\\OB-1-CANONICAL\\OPERATIONS\\this-session-transcript.jsonl';

// ── Parse arguments ──
const args = process.argv.slice(2);
let sessionId = null;

if (args.includes('--latest')) {
  // Auto-detect most recent session
  const db = new DatabaseSync(dbPath);
  try {
    const rows = db.prepare(
      "SELECT session_id FROM event GROUP BY session_id ORDER BY MAX(seq) DESC LIMIT 1"
    ).all();
    if (rows.length > 0) {
      sessionId = rows[0].session_id;
      console.log(`Auto-detected session: ${sessionId}`);
    }
  } finally {
    db.close();
  }
} else if (args.length > 0 && args[0].startsWith('ses_')) {
  sessionId = args[0];
} else if (args.length > 0) {
  // Show help
  console.log('Usage: node SCRIPTS/extract-current-session.js [sessionId|--latest]');
  console.log('  sessionId   Extract specific session (e.g., ses_09e311412ffewp3Jcc49iephZS)');
  console.log('  --latest    Auto-detect and extract the most recent session');
  console.log('  (no args)   List recent sessions for selection');
  process.exit(0);
}

if (!sessionId) {
  // List recent sessions
  const db = new DatabaseSync(dbPath);
  try {
    const rows = db.prepare(
      "SELECT session_id, COUNT(*) as events FROM event GROUP BY session_id ORDER BY MAX(seq) DESC LIMIT 10"
    ).all();
    console.log('Recent sessions:');
    for (const row of rows) {
      console.log(`  ${row.session_id}  (${row.events} events)`);
    }
    console.log('\nRun: node SCRIPTS/extract-current-session.js <sessionId>');
    console.log('Or:  node SCRIPTS/extract-current-session.js --latest');
  } finally {
    db.close();
  }
  process.exit(0);
}

// ── Extract ──
const db = new DatabaseSync(dbPath);
const events = db.prepare(
  "SELECT type, data_json, id FROM event WHERE session_id = ? ORDER BY seq"
).all(sessionId);

const messages = [];

for (const event of events) {
  try {
    const data = JSON.parse(event.data_json);

    if (event.type === 'llm_request_started') {
      const input = data.input;
      if (input && input.messages) {
        for (const msg of input.messages) {
          if (msg.role === 'user' && msg.content) {
            const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            // Deduplicate consecutive identical user messages
            if (messages.length === 0 || messages[messages.length - 1].text !== text) {
              messages.push({ role: 'user', text, eventId: event.id });
            }
          } else if (msg.role === 'assistant' && msg.content) {
            const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            messages.push({ role: 'assistant', text, eventId: event.id });
          }
        }
      }
    }

    if (event.type === 'llm_request_completed') {
      const output = data.output;
      if (output && output.textParts && output.textParts.length > 0) {
        for (const part of output.textParts) {
          if (part) messages.push({ role: 'assistant', text: part, eventId: event.id });
        }
      }
    }

    if (event.type === 'tool_executed') {
      if (data.tool_output && data.tool_output.content) {
        for (const part of data.tool_output.content) {
          if (part && part.text) {
            messages.push({ role: 'tool_output', text: part.text, tool: data.tool_name || 'unknown', eventId: event.id });
          }
        }
      }
    }
  } catch (e) {
    // Skip unparseable events
    continue;
  }
}

const out = messages.map(m => JSON.stringify(m)).join('\n') + '\n';
fs.writeFileSync(outputFile, out);

console.log(`Extracted ${messages.length} messages from ${sessionId}`);
console.log(`Wrote to ${outputFile}`);

db.close();
