---
description: "CENTURION-CODE — Roman Legion engineer corps (FABRI/ARCHITECTI). Dispatches coding tasks to Qwen 3.7 Max via Phoenix-Architecti CF worker. Reads real file context, calls HTTP API, applies patch, verifies syntax. Supports full-file and diffMode for large files. Escalates to T2 Opus on failure."
agent: AGENT99
---

# /Centurion-Code

**Roman Rank: FABRI (Engineer Corps) | Worker: phoenix-architecti LIVE**

**DO NOT spawn an agent. DO NOT use the Agent tool.**

Centurion-Code is an HTTP API. Call it with PowerShell, apply the patch, verify the result.

**Task:** $ARGUMENTS

---

## Phase 0 — Complexity Gate

- Task requires final ruling / irreversible decision → `DISPATCH → TIER 2 PA-OPUS — arbitration`
- Otherwise → proceed. Print: `DISPATCH → TIER 1 CENTURION-CODE (FABRI) — <one-line reason>`

---

## Phase 1 — Pre-Flight

1. Identify target file. Glob/grep if ambiguous.
2. Read target file. Extract: absolute path + relevant lines + imports.
3. Compose `context`: path + excerpt + constraints. Keep under 2000 chars.
4. **Detect file size**: if > 200 lines → set `diffMode: true`.

---

## Phase 2 — API Call

### Full-file mode (new files or files < 200 lines)

```powershell
$body = @{
  task       = "$ARGUMENTS"
  context    = "FILE_CONTENT_OR_EXCERPT"
  targetfile = "D:\OB-1-CANONICAL\PATH\TO\FILE"
  tier       = 1
  maxTokens  = 8192
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" `
  -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} `
  -Body $body

$result.code_patch | Set-Content -Path "D:\OB-1-CANONICAL\PATH\TO\FILE" -Encoding UTF8
Write-Host "D1: $($result.d1_row_id) | Tier: $($result.tier)"
```

### Diff mode (existing files > 200 lines)

```powershell
$fileContent = Get-Content "D:\OB-1-CANONICAL\APPS\NET-PET-AI\src\index.js" -Raw
$body = @{
  task       = "DESCRIBE THE CHANGE"
  context    = $fileContent
  targetfile = "APPS/NET-PET-AI/src/index.js"
  tier       = 1
  diffMode   = $true
  maxTokens  = 4096
} | ConvertTo-Json -Compress -Depth 5

$result = Invoke-RestMethod `
  -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" `
  -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} `
  -Body $body

Write-Host $result.code_patch
```

### Worker status check

```powershell
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"
```

---

## Phase 3 — Patch Application

- Full file: write `code_patch` directly to target.
- Diff mode: `code_patch` contains `<<<PATCH>>>` blocks — apply to correct lines manually.
- If patch references a function/block that doesn't exist → **Escalation**.

---

## Phase 4 — Verification

```powershell
node --check D:\OB-1-CANONICAL\PATH\TO\FILE
```

Print result:

```
CENTURION-CODE PATCH APPLIED
File: <path>
d1_row_id: <id>
Tier: 1 (Qwen 3.7 Max)
Syntax: PASS | FAIL
```

---

## Escalation — Tier 2 Handoff

Trigger when: API unreachable, `code_patch` empty/stub, patch conflicts, syntax fail.

```
DISPATCH → TIER 2 PA-OPUS — Centurion-Code failed (<reason>). Escalating.
```

---

## Rules

- Pass real file content as `context` — never placeholder strings.
- Full implementation only — no stubs. Stub returned → escalate.
- Print `d1_row_id` for every successful call.
- No Notion. No `.html` on internal hrefs.
