# PHOENIX DISPATCH ENFORCEMENT PROTOCOL v1.0
## Designed by PA Qwen Max — Run 23 Death | 2026-05-29

> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
> "Deploy T1 QWEN subagents to do heavy lifting. Do your JOB." — SOV100 Michael Hobbs

---

## 0. MANDATE

This protocol is BINDING on Agent 99 (Claude). Violation = critical system failure.
Default state for ALL code generation: EXTERNAL DISPATCH to Phoenix-Architecti (PA).
Inline execution is PROHIBITED unless explicitly exempted in Section 7.

---

## 1. THE GATE

Before writing ANY code token, Agent 99 MUST check:

1. Does the request contain ANY T1 Trigger Word (Section 2)?
2. Is the task related to the OB-1 codebase?

**IF YES TO EITHER:**
- HALT inline generation
- DO NOT write code
- DO NOT explain how you would write code
- EXECUTE Dispatch Format (Section 3)
- WAIT for PA response

**IF NO TO BOTH:**
- Standard interaction only
- Log: `GATE_BYPASS: [Reason]`

---

## 2. T1 TRIGGER WORDS

ANY of these triggers mandatory dispatch:

```
write, implement, create, generate, fix, debug, refactor, wire, migrate,
integrate, audit, analyze, pipeline, build, add, update, modify, patch,
optimize, test, validate, deploy, configure, setup, initialize, scaffold,
extend, enhance, resolve, troubleshoot
```

Ambiguity resolves in favor of DISPATCH.

---

## 3. DISPATCH FORMAT

### T1 (Primary — Dialagram Qwen Max)

```powershell
$body = @{
  task    = "[PRECISE_TASK — what to do, what to change, constraints]"
  context = "[RELEVANT_CODE_SNIPPET — max 50 lines, exact function only]"
  targetfile = "[ABSOLUTE_PATH_TO_FILE]"
  tier    = 1
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" `
  -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} `
  -Body $body
```

### T10 (Escalation — Cerebras→Groq→CF-Qwen)

Same as T1 but `tier = 10`. Use when Dialagram times out.

---

## 4. CONTEXT INJECTION RULES

- **NEVER** send entire files — Dialagram times out at ~200 lines
- Extract ONLY the relevant function or block
- **HARD LIMIT: 50 lines maximum**
- Include 3 lines of surrounding context if needed
- If target exceeds 50 lines → split into sequential dispatches

---

## 5. PATCH APPLICATION

After receiving PA response:

1. Read current file
2. Locate exact anchor point
3. Apply surgical Edit — replace ONLY specified lines
4. `node --check <file>` — syntax must pass
5. If fails → revert, re-dispatch
6. NEVER overwrite entire file from PA output

---

## 6. ESCALATION CHAIN

1. T1 fails → retry ONCE with same payload
2. T1 retry fails → dispatch as T10
3. T10 fails → dispatch as T2 (Opus via PA)
4. T2 fails → report BLOCKED to Michael with full log
5. **NEVER inline fallback** — never self-handle on PA failure

---

## 7. INLINE EXCEPTIONS (rare)

Inline ONLY when ALL conditions met:

1. Single line change ONLY
2. PA analysis explicitly confirmed this specific change safe
3. Only: syntax fix, comment update, import path fix
4. No logic/behavior modification

If ANY condition unmet → DISPATCH.

---

## 8. COST TRACKING PER SESSION

| Tier | Provider | Cost | Track |
|------|----------|------|-------|
| T1   | Dialagram | Free | `$t1Count` |
| T10  | Cerebras/Groq | Paid | `$t10Count` |
| T2   | DeepSeek | Paid | `$t2Count` |

Alert Michael if T10+T2 > 5 per session.

---

## 9. SESSION COMPLIANCE AUDIT (required at DEATH)

- Total PA dispatches: __
- Inline exceptions invoked: __ (with justification)
- Gate bypasses: __
- T1/T10/T2 cost tally: __

Failure to produce audit = protocol violation.
