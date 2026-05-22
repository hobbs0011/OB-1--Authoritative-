---
description: "Send a coding task to Phoenix Coder v3.2 (DeepSeek V4 Pro via Cloudflare worker). Reads real file context, calls HTTP API, applies patch, verifies syntax. Supports full-file and diffMode for large files. Escalates to Tier 2 on failure."
agent: AGENT99
---

# /PhoenixCoder

**DO NOT spawn an agent. DO NOT use the Agent tool.**

Phoenix Coder is an HTTP API. Call it with PowerShell, apply the patch, verify the result.

**Task:** $ARGUMENTS

---

## Phase 0 — Complexity Gate

- Task touches > 3 interdependent files → `DISPATCH → TIER 2 AGENT99 — multi-file scope`
- Task requires audit / architecture / security → `DISPATCH → TIER 3 DEEPSEEK PRO — analytical task`
- Otherwise → proceed. Print: `DISPATCH → TIER 1 PHOENIXCODER — <one-line reason>`

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
  maxTokens  = 8192
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" -Body $body

$result.code_patch | Set-Content -Path "D:\OB-1-CANONICAL\PATH\TO\FILE" -Encoding UTF8
Write-Host "D1: $($result.d1_row_id) | Mode: $($result.mode)"
```

### Diff mode (existing files > 200 lines — index.js, large portals)

```powershell
$fileContent = Get-Content "D:\OB-1-CANONICAL\APPS\NET-PET-AI\src\index.js" -Raw
$body = @{
  task       = "DESCRIBE THE CHANGE — what route/handler to add"
  context    = $fileContent
  targetfile = "APPS/NET-PET-AI/src/index.js"
  diffMode   = $true
  maxTokens  = 4096
} | ConvertTo-Json -Compress -Depth 5

$result = Invoke-RestMethod `
  -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" -Body $body

# result.code_patch contains <<<PATCH>>> blocks — apply manually
Write-Host $result.code_patch
```

### Worker status check

```powershell
Invoke-RestMethod -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status"
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
PHOENIX PATCH APPLIED
File: <path>
d1_row_id: <id>
Mode: full | diff
Syntax: PASS | FAIL
```

---

## Escalation — Tier 2 Handoff

Trigger when: API unreachable, `code_patch` empty/stub, patch conflicts, syntax fail.

```
DISPATCH → TIER 2 AGENT99 — Phoenix Coder failed (<reason>). Handling directly.
```

---

## Rules

- Pass real file content as `context` — never placeholder strings.
- Full implementation only — no stubs. Stub returned → escalate.
- Print `d1_row_id` for every successful call.
- No Notion. No `.html` on internal hrefs.
