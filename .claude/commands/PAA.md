---
description: "Phoenix Architecti Agents — 4-tier dispatch system. T1=Qwen Max (free), T2=Opus 4.7, T3=DeepSeek Pro, T4=Gemini. Specify tier with [T1]-[T4] prefix or default T1."
---

# /PAA — Phoenix Architecti Agents

**AGENT:** Phoenix-Architecti worker (CF) — routes to correct model per tier
**ENDPOINT:** `https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code`
**TIERS:**
| Tier | Model | Use when |
|------|-------|----------|
| T1 | Qwen 3.7 Max (Dialagram) — FREE | write / implement / generate / boilerplate |
| T2 | Claude Opus 4.7 | fix / debug / refactor / integrate / high-quality generation |
| T3 | DeepSeek V4 Pro | audit / analyze / architecture / deep synthesis |
| T4 | Gemini 3.5 Flash | heavy cross-domain / large context |

---

## EXECUTION

Parse `$ARGUMENTS` for tier prefix and task:
- `[T1] implement a ...` → tier 1
- `[T2] fix the bug in ...` → tier 2
- No prefix → default tier 1

**Step 1 — Read target file (if task involves a file):**

Read the file before dispatching. Pass real content as `context`, never a placeholder.

**Step 2 — Dispatch:**

```powershell
$body = @{
    task       = "<TASK FROM ARGUMENTS>"
    context    = "<FILE CONTENT OR RELEVANT CONTEXT>"
    targetfile = "<ABSOLUTE TARGET FILE PATH>"
    tier       = <1|2|3|4>
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
    -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "x-pa-auth" = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=" } `
    -Body $body

Write-Output $result.code_patch
Write-Output "D1 Row: $($result.d1_row_id)"
```

**Step 3 — Apply patch:**

- Write `code_patch` to `targetfile`
- Run `node --check <file>` for JS, or equivalent syntax check
- If result is empty or contains "GENERATION_FAILED": escalate tier by 1, retry once

**Step 4 — Report:**

```
PAA ✅ — TIER <N> <MODEL>
TASK: <one-line summary>
D1: <d1_row_id>
APPLIED: <targetfile>
```

---

## TIER STATUS (live check)

```powershell
Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status" | ConvertTo-Json
```

T1 key: `Dialagram-Qwen3.7Max ✓` means Qwen Max is live. If `NO KEY` → skip T1, start at T2.

---

## RULES

- Always read the target file before dispatching — pass real context, never empty
- T1 = Qwen Max via Dialagram — confirmed live and frontier-tier
- T2-T4 require paid keys — check status first if uncertain
- If $ARGUMENTS is empty: ask "What task, what tier, what file?"
- Cache: PA caches identical task+context for 1hr — add a unique token to bust if needed
- D1 row ID is the receipt — log it if the task is important
