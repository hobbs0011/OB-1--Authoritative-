# BLUEPRINT — SCS Pipeline Hardening for Incarnate-10

**Target:** Incarnate-10
**From:** Incarnate-6-Auditor-LFG-Canon-Script
**Date:** 2026-08-02T01:26:00+07:00
**Status:** READY FOR EXECUTION

---

## Context

I-LOG-8 session (363 messages, SOUL=50/DNA=313/REASON=265) was processed through the SCS pipeline with multiple failures:
1. Duplicate artifacts created with invented identity "Run 187" / "Incarnate-6-Auditor"
2. Full 7-stage SCS loop not executed (only partial I-LOG preservation)
3. Keyword indexing (rfkw-run8.txt) missing
4. death.ps1 audit parsing bug
5. Reincarnate-Synch §IX-A had incorrect entry

This blueprint fixes the root causes so Incarnate-10 never repeats them.

---

## Phase 0 — Immediate Cleanup (1 commit)

**Goal:** Remove all duplicate/incorrect artifacts from prior incorrect DEATH execution.

**Actions:**
```
Remove:
  I-LOG/I-LOG-187.txt
  I-LOG/I-LOG-187-COLORIZED.md
  I-LOG/I-LOG-187-STATS.json
  CANON/REINCARNATION/pipeline-187.json
  CANON/REINCARNATION/handoff-187-to-188.json
  CANON/REINCARNATION/run187-reincarnateDEATH.md (if exists)

Keep:
  I-LOG/I-LOG-8.txt
  I-LOG/I-LOG-8-COLORIZED.md
  I-LOG/I-LOG-8-STATS.json
  CANON/REINCARNATION/pipeline-8.json
  CANON/REINCARNATION/handoff-8-to-9.json

Write:
  CANON/REINCARNATION/run8-reincarnateDEATH.md (correct identity: I-LOG-8 / Incarnate-8)
  CANON/SOUL-KEYWORDS/rfkw-run8.txt
```

**Identity rule:** Session = I-LOG-{N}. Run number = I-LOG number. Do NOT invent alternate identities.

**Commit message:** `death: I-LOG-8 — remove duplicate 187 artifacts, seal under correct identity`

---

## Phase 1 — Fix death.ps1 Audit Bug (1 commit)

**Bug:** Line 48 — `$auditOut = node $auditTmp $IlogSource 2>&1 | Out-String` produces `ConvertFrom-Json : Invalid JSON primitive: node.`

**Root cause:** PowerShell pipeline corrupts Node.js stdout when stderr is merged via `2>&1 | Out-String`.

**Fix options (pick one):**
```powershell
# Option A: Capture stdout only, handle stderr separately
$auditOut = node $auditTmp $IlogSource 2>$null | Out-String
if ($LASTEXITCODE -ne 0) { Write-Error "Audit script failed"; exit 1 }

# Option B: Use .NET to read file directly (no Node.js subprocess)
$auditObj = Get-Content $IlogSource -Raw | ConvertFrom-Json | ForEach-Object {
    [PSCustomObject]@{
        SOULcount = ($_ | Measure-Object).Count
        # ... actually count roles in JSON
    }
}

# Option C: Trim output before ConvertFrom-Json
$auditOut = (node $auditTmp $IlogSource 2>&1 | Out-String).Trim()
$auditObj = $auditOut | ConvertFrom-Json
```

**Recommended:** Option A (simplest, preserves existing script structure).

**Commit message:** `fix: death.ps1 — Node audit JSON parsing on PS 5.1`

---

## Phase 2 — Gate Session Identity (1 commit)

**Goal:** Prevent invented identities like "Run 187" for session "I-LOG-8".

**Changes to death.ps1:**
```powershell
param(
  [string]$Run,
  [string]$IlogSource,
  [string]$SessionName,        # NEW: explicit session name
  [string]$RiseDir = "CANON/REINCARNATION",
  [string]$IlogDir = "I-LOG"
)

# Identity gate
if (-not $SessionName) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($IlogSource)
    Write-Warning "SessionName not provided. Deriving from IlogSource: $baseName"
    $SessionName = $baseName
}

# Validate: IlogSource filename should contain SessionName
if ($IlogSource -notmatch [regex]::Escape($SessionName)) {
    Write-Warning "IlogSource '$IlogSource' does not match SessionName '$SessionName'"
}
```

**Changes to pipeline/handoff JSON:**
```json
{
  "session_name": "I-LOG-8",
  "run": "8",
  ...
}
```

**Changes to death seal template:**
Auto-generate `run{N}-reincarnateDEATH.md` with `$SessionName` as the identity.

**Commit message:** `feat: death.ps1 — session name identity gate + auto death seal template`

---

## Phase 3 — Backfill I-LOG-8 Stage Artifacts (optional, 5 commits)

**Goal:** Complete the 7-stage SCS loop for I-LOG-8 retroactively.

**Stages to backfill:**
- Stage 2 (SCOUT): `CANON/SCOUT/scout-I-LOG-8.md`
- Stage 3 (MARCH): `CANON/MARCH/march-I-LOG-8.md`
- Stage 4 (SCHOLAR): `CANON/SOUL/soul-I-LOG-8.md`
- Stage 5 (SUPPLY): `CANON/SUPPLY/supply-I-LOG-8.md`
- Stage 6 (ENGINEER): `CANON/ENGINEER/engineer-I-LOG-8.md`

**Each artifact must include:**
- Timestamp
- Stage name + SOUL/DNA/REASON counts
- Findings with [CATEGORY/SEVERITY] tags
- Handoff to next stage

**If backfill is impossible** (session ended, context lost), mark each stage as `NOT_WALKED` in the death seal.

**Commit messages:**
```
scout: I-LOG-8 stage 2 — territory scan
march: I-LOG-8 stage 3 — attestation sweep
scholar: I-LOG-8 stage 4 — SOUL preservation
supply: I-LOG-8 stage 5 — logistics audit
engineer: I-LOG-8 stage 6 — optimization
```

---

## Phase 4 — Prevent Recurrence (2 commits)

**4a. I-LOG/README.md identity guard**
```markdown
## Identity Rule
I-LOG-{N} must map to run-{N} in all downstream artifacts.
If I-LOG-8.txt exists, pipeline-8.json, handoff-8-to-9.json, and run8-reincarnateDEATH.md MUST exist.
Any mismatch is a CRITICAL identity violation.
```

**4b. Reincarnate-Synch §IX-A duplicate guard**
```powershell
# In death.ps1 before upload:
$existing = Get-Content Reincarnate-Synch.md | Select-String "I-LOG-8"
if ($existing) {
    Write-Warning "Duplicate entry detected for I-LOG-8 in §IX-A"
    # Abort or require --force flag
}
```

**4c. Pre-commit hook: duplicate I-LOG detection**
```powershell
# .git/hooks/pre-commit
$ilogFiles = Get-ChildItem I-LOG\I-LOG-*.txt | Select-Object -ExpandProperty BaseName
$duplicates = $ilogFiles | Group-Object | Where-Object Count -gt 1
if ($duplicates) {
    Write-Error "Duplicate I-LOG files detected: $($duplicates.Name)"
    exit 1
}
```

**Commit messages:**
```
feat: I-LOG identity guard rails — prevent duplicate I-LOG and run-number drift
feat: Reincarnate-Synch duplicate entry guard + pre-commit hook
```

---

## Execution Sequence for Incarnate-10

```
1. Read this blueprint
2. Read CANON/REINCARNATION/run187-reincarnateDEATH.md (this session's seal)
3. Execute Phase 0 cleanup
4. Execute Phase 1 fix
5. Execute Phase 2 identity gate
6. Optionally execute Phase 3 backfill
7. Execute Phase 4 prevention
8. Verify: one session = one identity = one I-LOG = one pipeline = one death seal
9. Commit with message: "death: {session-name} — SCS pipeline hardened per Incarnate-10 blueprint"
```

---

## "Perfection" Criteria

- [ ] No duplicate I-LOG artifacts exist
- [ ] No duplicate pipeline/handoff artifacts exist
- [ ] Every DEATH produces: I-LOG, COLORIZED, STATS, pipeline, handoff, death seal, rfkw, synch row
- [ ] death.ps1 runs without ConvertFrom-Json errors
- [ ] Session identity is immutable once stamped
- [ ] Reincarnate-Synch §IX-A has exactly one entry per session
- [ ] Full 7-stage SCS loop executes or explicitly marks stages NOT_WALKED
- [ ] Keyword indexing (rfkw) generated for every session
