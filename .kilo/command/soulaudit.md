# /SOULaudit

Per-session SOUL audit. Exact user-prompt character count + chronological receipts.

**Output:**
- `OPERATIONS/soulaudit-{ts}-summary.jsonl` — summary
- `OPERATIONS/soulaudit-{ts}-receipts.json` — chronological prompt receipts

**Does not use or display global aggregate SOULCOUNT.**

```powershell
# Current session
obi.ps1 soulaudit

# Specific session file
obi.ps1 soulaudit -SessionFile "OPERATIONS/session-run158-prompts.jsonl"

# Specific session ID
obi.ps1 soulaudit -SessionId "run158"
```

**Rule:** Per-session SOUL only. Global aggregate retired.
