---
description: "Direct dispatch to Phoenix-Centurion_Claw — Kilo Free Auto via PA T1. Subscription free-tier, frontier models. Use for T1 tasks: write, generate, implement, explain."
---

# /PCClaw — Phoenix-Centurion_Claw

**AGENT:** Kilo Free Auto (kilo-auto/free) via PA T1
**ROUTE:** Claude Code → PA `/v1/chat/completions` → Kilo gateway → kilo-auto/free
**USE FOR:** T1 tasks — write / implement / generate / explain / boilerplate

---

## EXECUTION

Take the user's request from `$ARGUMENTS` and dispatch it to PCClaw now.

**Step 1 — Build the call:**

```powershell
$body = @{
    model      = "kilo-auto/free"
    max_tokens = 4096
    messages   = @(@{ role = "user"; content = "<TASK>" })
} | ConvertTo-Json -Depth 5 -Compress

Invoke-RestMethod `
    -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/v1/chat/completions" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=" } `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
    | Select-Object -ExpandProperty choices `
    | Select-Object -First 1 `
    | Select-Object -ExpandProperty message `
    | Select-Object -ExpandProperty content
```

Replace `<TASK>` with the full request from `$ARGUMENTS`. If the task involves a file, read the file first and include its content in the message.

**Step 2 — Apply result:**

- If it's code: write it to the target file, then run `node --check <file>` for JS or equivalent for other types
- If it's analysis: display it directly
- If it fails (non-200 / empty): escalate to `/PAA` at tier 1

**Step 3 — Report:**

```
PCCLAW ✅ — Kilo Free Auto
TASK: <one-line summary>
RESULT: <applied / displayed>
```

---

## RULES

- No tier check needed — PCClaw IS the T1 free model
- If $ARGUMENTS is empty: ask "What should PCClaw do?"
- Max tokens 4096 by default — increase to 8192 for long generation tasks
- If the task needs repo context: read relevant files first, inject into the message content
