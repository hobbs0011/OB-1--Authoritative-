---
description: "Phoenix Architecti Agents — 5-tier dispatch system. T1=Qwen Max (free), T2=DeepSeek Flash, T3=DeepSeek Pro, T4=Gemini, T5=Opus. Specify tier with [T1]-[T5] prefix or default T1."
---

# /PAA — Phoenix Architecti Agents

**AGENT:** Phoenix-Architecti worker (CF) — routes to correct model per tier
**ENDPOINT:** `https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code`
**TIERS:**
| Tier | Model | Use when |
|------|-------|----------|
| T1 | Qwen 3.7 Max (Dialagram) — FREE | write / implement / generate / boilerplate |
| T2 | DeepSeek V4 Flash | fix / debug / refactor / integrate |
| T3 | DeepSeek V4 Pro | audit / analyze / architecture / deep synthesis |
| T4 | Gemini 3.5 Flash | heavy cross-domain / large context |
| T5 | Claude Opus 4.7 | ledger / doctrine / irreversible decisions |

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
    tier       = <1|2|3|4|5>
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
    -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
    -Method POST `
    -ContentType "application/json" `
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

T1 key: `Dialagram-Qwen ✓` means Qwen Max is live. If `NO KEY` → skip T1, start at T2.

---

## RULES

- Always read the target file before dispatching — pass real context, never empty
- T1 = Qwen Max via Dialagram — confirmed live and frontier-tier
- T2-T5 require paid keys — check status first if uncertain
- If $ARGUMENTS is empty: ask "What task, what tier, what file?"
- Cache: PA caches identical task+context for 1hr — add a unique token to bust if needed
- D1 row ID is the receipt — log it if the task is important
