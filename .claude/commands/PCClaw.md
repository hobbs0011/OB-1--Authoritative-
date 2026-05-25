---
description: "Direct dispatch to Phoenix-Centurion_Claw — Qwen 3.7 Max via Dialagram. Free, unlimited, frontier-tier. Use for T1 tasks: write, generate, implement, explain."
---

# /PCClaw — Phoenix-Centurion_Claw

**AGENT:** Qwen 3.7 Max via Dialagram ($5.50/wk unlimited, #3 globally, Alibaba Cloud)
**ROUTE:** Claude Code → Dialagram cloud → Qwen 3.7 Max (direct, no PA proxy)
**USE FOR:** T1 tasks — write / implement / generate / explain / boilerplate

---

## EXECUTION

Take the user's request from `$ARGUMENTS` and dispatch it to PCClaw now.

**Step 1 — Build the call:**

```powershell
$body = @{
    model      = "qwen-3.7-max"
    max_tokens = 4096
    messages   = @(@{ role = "user"; content = "<TASK>" })
} | ConvertTo-Json -Depth 5 -Compress

Invoke-RestMethod `
    -Uri "https://dialagram.me/router/v1/chat/completions" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer dgr_live_L4lv48wTGuIQJblOf30Fzgpmso8ohPXQ1Fc9gcIJzmHQjY1MsD" } `
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
PCCLAW ✅ — Qwen 3.7 Max
TASK: <one-line summary>
RESULT: <applied / displayed>
```

---

## RULES

- No tier check needed — PCClaw IS the T1 free model
- If $ARGUMENTS is empty: ask "What should PCClaw do?"
- Max tokens 4096 by default — increase to 8192 for long generation tasks
- If the task needs repo context: read relevant files first, inject into the message content
- Model identity confirmation: response starts with "I am Qwen3.7" or similar — that's correct
