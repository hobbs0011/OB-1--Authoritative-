# Transcript Extraction Procedure — Canonical

> **Version:** 2.0.0  
> **Last verified:** 2026-07-18 run174  
> **Session ID format:** `ses_<hex>KchPjRZBqRSv2` or similar (22-char Kilo session IDs)  

## Overview

This document describes how to extract raw chat transcripts from Kilo sessions. Two verified methods are available. Method 1 (`kilo_local_recall`) is the preferred approach for completed sessions. Method 2 (SQLite) is the fallback when `kilo_local_recall` returns incomplete data.

---

## Method 1: kilo_local_recall (RECOMMENDED — completed sessions)

### Step 1: Search for the session

```
kilo_local_recall mode=search query="<distinctive phrase from session>"
```

Use a phrase you KNOW appeared in the session. For reincarnation sessions: `"reincarnateRise"` or `"What did we do so far"`.

The search returns matching session IDs with snippet previews. Note the `sessionID` of the target session.

### Step 2: Read the full transcript

```
kilo_local_recall mode=read sessionID=<sessionID>
```

The output is Markdown with `## User` / `## Assistant` role labels and tool call blocks.

### Step 3: Save to file

Save the output to `OPERATIONS/raw-transcript-YYYYMMDD-HHmmss.jsonl` or `OPERATIONS/raw-transcript.jsonl` for the most recent.

---

## Method 2: SQLite Database (FALLBACK — active or recently-ended sessions)

### Step 1: Locate the database

```
C:\Users\mrmic\.local\share\kilo\session-export.db
```

This is the canonical database path on Windows. Tools: `node:sqlite` (Node.js 22+ built-in) or `sqlite3` CLI.

### Step 2: Find your session ID

There are TWO ways to find your session ID:

**Option A — Check the most recent session via kilo_local_recall:**

Search for a distinctive phrase from your session. The returned sessionID is the correct one.

**Option B — Query the database for recent sessions:**

```sql
SELECT session_id, COUNT(*) as events 
FROM event 
GROUP BY session_id 
ORDER BY MAX(seq) DESC 
LIMIT 10;
```

The session with the most events that matches your timeframe is typically yours. Active Kilo sessions typically have 20-30 events.

**WARNING:** Do NOT guess the session ID. Hardcoded session IDs go stale immediately. Always search or query dynamically.

### Step 3: Extract the transcript

Use the script at `SCRIPTS/extract-current-session.js`. Before running, UPDATE the `sessionId` variable on line 7 to match your session ID.

```javascript
// SCRIPTS/extract-current-session.js
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

// CHANGE THIS to your session ID
const sessionId = 'ses_XXXXXXXXXXXXXXX';

const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\session-export.db');

// Query events ordered by sequence
const events = db.prepare(
  "SELECT type, data_json FROM event WHERE session_id = ? ORDER BY seq"
).all(sessionId);

const messages = [];

for (const event of events) {
  try {
    const data = JSON.parse(event.data_json);

    // Extract user and assistant messages from llm_request_started
    if (event.type === 'llm_request_started') {
      const input = data.input;
      if (input && input.messages) {
        for (const msg of input.messages) {
          if (msg.role === 'user' && msg.content) {
            // Deduplicate consecutive identical messages
            const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            if (messages.length === 0 || messages[messages.length-1].text !== text) {
              messages.push({ role: 'user', text });
            }
          } else if (msg.role === 'assistant' && msg.content) {
            const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            messages.push({ role: 'assistant', text });
          }
        }
      }
    }

    // Extract assistant text from llm_request_completed
    if (event.type === 'llm_request_completed') {
      const output = data.output;
      if (output && output.textParts && output.textParts.length > 0) {
        for (const part of output.textParts) {
          if (part) messages.push({ role: 'assistant', text: part });
        }
      }
    }

    // Extract tool output
    if (event.type === 'tool_executed') {
      if (data.tool_output && data.tool_output.content) {
        for (const part of data.tool_output.content) {
          if (part && part.text) {
            messages.push({ role: 'tool_output', text: part.text, tool: data.tool_name || 'unknown' });
          }
        }
      }
    }
  } catch (e) {
    // Skip unparseable events
    continue;
  }
}

const outputFile = 'D:\\OB-1-CANONICAL\\OPERATIONS\\this-session-transcript.jsonl';
fs.writeFileSync(outputFile, messages.map(m => JSON.stringify(m)).join('\n') + '\n');

console.log(`Extracted ${messages.length} messages to ${outputFile}`);
db.close();
```

Run it:
```powershell
node "SCRIPTS/extract-current-session.js"
```

### Step 4: Verify

```powershell
Get-Content "D:\OB-1-CANONICAL\OPERATIONS\this-session-transcript.jsonl" -TotalCount 5
```

Expect to see JSON objects with `role`, `text`, and optionally `tool` fields.

---

## Method 3: Log File Parsing (LAST RESORT)

If both database and recall fail, parse Kilo's log files:

### Step 1: Find logs
```
C:\Users\mrmic\.local\share\kilo\log\
```

### Step 2: Search for your session
```powershell
Get-ChildItem "C:\Users\mrmic\.local\share\kilo\log\" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 3 | 
  ForEach-Object { 
    Select-String -Path $_.FullName -Pattern "<your-session-id>" 
  }
```

---

## Database Schema Reference

```sql
CREATE TABLE event (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  type TEXT NOT NULL,  -- 'llm_request_started', 'llm_request_completed', 'tool_executed', 'session_degraded'
  data_json TEXT,      -- JSON blob with input/output/tool data
  created_at TEXT
);

CREATE INDEX idx_event_session ON event(session_id, seq);
```

Key `type` values:
- `llm_request_started` → `data_json.input.messages[]` — user prompts and assistant context
- `llm_request_completed` → `data_json.output.textParts[]` — assistant responses
- `tool_executed` → `data_json.tool_name`, `data_json.tool_output.content[]` — tool calls and results
- `session_degraded` → session ended or context truncated

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Hardcoded session ID | Always search/kilo_local_recall before extracting. Session IDs are ephemeral. |
| 0 events returned | The session ID is stale or wrong. Search for the correct ID. |
| `node:sqlite` not found | Requires Node.js 22+. Use `node --version` to verify. |
| Database locked | Kilo has the database open. Close VS Code or wait for session to end. |
| `kilo_local_recall` returns empty | The session hasn't been indexed yet. Wait 30-60 seconds and retry. |
| Duplicate messages | Use deduplication logic (skip consecutive identical texts) as shown in Method 2. |

---

## Files

| File | Purpose |
|---|---|
| `SCRIPTS/extract-current-session.js` | Node.js script — update `sessionId` variable before running |
| `OPERATIONS/this-session-transcript.jsonl` | Output — most recent session transcript |
| `OPERATIONS/raw-transcript-*.jsonl` | Output — archived session transcripts |
| `C:\Users\mrmic\.local\share\kilo\session-export.db` | Source — SQLite database |

---

## Revision History

| Version | Date | Run | Changes |
|---|---|---|---|
| 1.0.0 | 2026-07-18 | run165 | Initial — two methods, hardcoded session IDs |
| 2.0.0 | 2026-07-18 | run174 | Rewrite: added `kilo_local_recall` as primary method, corrected SQL schema, added dedup logic, added pitfalls table, parameterized session ID |
