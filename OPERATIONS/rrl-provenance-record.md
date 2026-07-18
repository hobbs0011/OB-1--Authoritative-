# RRL Provenance Record — 2026-07-14

## Confirmed Recording Source
- **System:** Kilo (not Claude Code)
- **Primary DB:** `C:\Users\mrmic\.local\share\kilo\kilo.db`
  - Tables: `session`, `session_message`, `message`, `part`, `event`, `event_sequence`
- **Session IDs:** Kilo format `ses_0a6408b5effeAI9kyUKKwGEqgj`
- **Session data persistence:** "NOT persisted to disk until the session ends" (per `transcript-extraction-procedure.md`)

## Canonical Command
- **Kilo command:** `.kilo/command/captureRRL.md`
- **Script:** `SCRIPTS/kilo-rrl-capture.js`

## Recovery Methods (documented in OPERATIONS/transcript-extraction-procedure.md)
1. `kilo_local_recall` tool — searches/reads session transcripts from Kilo local storage
2. Direct SQLite query on `kilo.db` — `SELECT * FROM session_message WHERE session_id = ?`
3. Tool output files in `C:\Users\mrmic\.local\share\kilo\tool-output\`
4. **Canonical:** `/captureRRL` command → `SCRIPTS/kilo-rrl-capture.js`

## Evidence
- `RRL-170.txt` (231,754 bytes) = byte-for-byte copy of `OPERATIONS/raw-transcript.jsonl` (231,754 bytes)
- `raw-transcript.jsonl` header: `# Session: reincarnateRise v7.0 ROMAN RISE protocol` — markdown format, not JSONL
- Session `ses_0a6408b5effeAI9kyUKKwGEqgj` exists in `kilo.db` with 5 messages
- `session-capture.ps1` searches `~/.claude/` paths (Claude Code) — WRONG for Kilo sessions
- `session-capture.ps1` never checks `C:\Users\mrmic\.local\share\kilo\kilo.db`

## Root Cause of Missing RRLs
`SCRIPTS/session-capture.ps1` is wired to a Claude Code stop hook and looks in Claude's JSONL paths (`~/.claude/projects/`, `~/.claude/history.jsonl`). Kilo stores sessions in `kilo.db` and does NOT write them to `~/.claude/` paths. When the script can't find a matching JSONL file, it falls back to `history.jsonl` (small metadata file) and writes a hollow RRL stub.

## Required Fix
`session-capture.ps1` must query `C:\Users\mrmic\.local\share\kilo\kilo.db` directly, extracting `session_message.data` for the active Kilo session, then write that to `RRL\RRL-{run}.txt`.
