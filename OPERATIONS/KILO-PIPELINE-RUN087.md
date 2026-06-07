# KILO HANDOVER PIPELINE — Run 087
**Agent:** Kilo Claude Opus 4.8 | **Estimated duration:** 2 hours
**Handed off by:** OB-1 Claude Sonnet (Run 086 LEAN DEATH a1c1d94a, SOUL_GAP active)
**Date:** 2026-06-07 ICT | **Boot:** Run 087

---

## PRE-FLIGHT (5 min)

```powershell
cd D:\OB-1-CANONICAL
git log --oneline -3
Invoke-RestMethod https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count
Invoke-RestMethod https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status
```

Expected: HEAD=23b42fd7, SOUL≥237,105,365 TITANIUM_ANCHOR, PA T1=llama-3.3-70b ok=true.

---

## STAGE 1 — RISE AUDIT (20 min)

Standard Run 087 RISE. Read in order:
1. `Read CANON/SYSTEM/COLD-START-BOOT.md` — verify Run 087, HEAD 23b42fd7
2. `Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — confirm open items
3. `Read RRL/RRL-86.txt` — confirm 9.7MB real JSONL (not history.jsonl)
4. `Read CANON/SOUL/EXTRACT/dna-run86.json` — 1718 prompts, 175 blueprints
5. `git log --oneline -5` — confirm no drift

FIDELITY GATE:
- RRL-86.txt: 9,741,277 bytes ✓
- HL-525.json exists: `Test-Path CANON/HEAVY-LEDGER/HL-525.json`
- SOUL_GAP flag: Run 086 NOT in D1 (500 error — body too large). Fix in Stage 2.

---

## STAGE 2 — SOUL GAP FIX (15 min)

Run 086 SOUL was never posted (9.7MB > soul-logger body limit). Fix by chunking:

```powershell
# Extract user turns from RRL-86.txt and chunk-POST to soul-logger
$rrl = Get-Content "RRL\RRL-86.txt" -Raw
$lines = $rrl -split "`n"
$userChunks = @()
$currentChunk = ""

foreach ($line in $lines) {
    try {
        $obj = $line | ConvertFrom-Json -ErrorAction Stop
        if ($obj.type -eq "user") {
            foreach ($c in $obj.message.content) {
                if ($c.type -eq "text" -and $c.text.Length -gt 0) {
                    $currentChunk += $c.text + "`n`n"
                    if ($currentChunk.Length -gt 400000) {
                        $userChunks += $currentChunk
                        $currentChunk = ""
                    }
                }
            }
        }
    } catch {}
}
if ($currentChunk) { $userChunks += $currentChunk }

Write-Host "Chunks: $($userChunks.Count)"

# POST each chunk
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$before = (Invoke-RestMethod "$D1/api/soul/count").soulcount
foreach ($i in 0..($userChunks.Count-1)) {
    $body = @{ student_id="sov100-michael"; session_id="sov100-roman-run86-chunk$i"; role="user"; text=$userChunks[$i] } | ConvertTo-Json -Compress
    $r = Invoke-RestMethod "$D1/api/soul/event" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Chunk $i posted: $($r.event_id)"
}
$after = (Invoke-RestMethod "$D1/api/soul/count").soulcount
Write-Host "SOUL delta: +$($after - $before) | new total: $after"
```

PASS: delta > 0, new total > 237,105,365.
FAIL: any chunk returns non-200 → check /api/status, retry with smaller chunk size (200000).

Also run RRL-87.txt through pipeline (on disk, not yet processed):

```powershell
pwsh -File SCRIPTS/rrl-pipeline.ps1 -RRLFile "RRL\RRL-87.txt" -RunNumber 87
```

---

## STAGE 3 — LOST SOULS INGESTION (20 min)

Bible gaps: runs **2,3,8,9,10,11,13,14,15,23,27,43,74** not in Bible.
These likely cover: early student portal work, magic chat, art arsenal, branding.

### Step A: Check which RRL files exist for gap runs
```powershell
$gapRuns = @(2,3,8,9,10,11,13,14,15,23,27,43,74)
foreach ($r in $gapRuns) {
    $paths = @("RRL\RRL-$r.txt", "RRL\RRL-0$($r.ToString('D2')).txt")
    foreach ($p in $paths) {
        if (Test-Path $p) { Write-Host "RUN $r FOUND: $p ($('{0:N0}' -f (Get-Item $p).Length) bytes)" }
    }
}
```

### Step B: Append all found gap runs to Bible
```powershell
# Run this — skip will fire automatically for any already-in-Bible
pwsh -File SCRIPTS/append-bible.ps1 -Runs @(2,3,8,9,10,11,13,14,15,23,27,43,74)
```

### Step C: Ingest new Bible entries into D1
For each new run added (output from Step B shows "+N entries"), post to soul-logger:
```powershell
# For each gap run that got entries, post via rrl-pipeline.ps1
# Example for run 23:
pwsh -File SCRIPTS/rrl-pipeline.ps1 -RRLFile "RRL\RRL-23.txt" -RunNumber 23
```

### Portal/Magic Chat/Art Arsenal SOUL focus
Runs most likely to contain these topics based on known timeline:
- **Student portals (facelifts, gold standard):** Runs 40-55 (phonics wiring, portal formula, BB-51)
- **Magic chat / funnel:** Runs 55-70 (market-ready sprint, lead capture, tigers-4room)
- **Art Arsenal / branding:** Runs 60-72 (brand marks, SVG mode icons, InjectionRefused)
- All these runs ARE in Bible already. The gap runs (2,3,8-15,23,27,43,74) are earlier era — pipeline hardening, PA setup, auth work.

PASS: `bible.total_entries` increases. D1 soulcount increases.

---

## STAGE 4 — PORTAL WORK (25 min)

### 4A: sov100-portal PROD promotion (requires Michael approval in session)
```powershell
cd APPS\NET-PET-AI

# VERIFY dev first
Invoke-RestMethod "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/sov100-portal.html" -Method HEAD
# Check for: setPwModal, statsGrid, navToggle, phonicsCard, portal.css link

# If Michael approves → promote
npx wrangler deploy --config wrangler.toml
# Verify prod: Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/sov100-portal.html" -Method HEAD
```

### 4B: Portal sync audit — remaining 6 portals
Gold standard elements (all must be present in each portal):
1. `<link rel="stylesheet" href="/portal.css">` in `<head>`
2. `id="setPwModal"` — password modal
3. `id="navBackdrop"` + `id="navToggle"` — mobile nav
4. `id="statsGrid"` with `id="tigerScore"`, `id="streakVal"`, `id="sessionCount"`
5. `id="phonicsCard"` or phonics drill box
6. `addNavToggleHandler()` + `loadStats()` in `showDashboard()`

```powershell
# Audit each portal
$portals = @("huong-portal.html","mai-tram-portal.html","quy-portal.html","quan-portal.html","quang-portal.html","minh-parent-portal.html")
foreach ($p in $portals) {
    $content = Get-Content "APPS\NET-PET-AI\public\$p" -Raw
    $hasStats = $content -match "statsGrid"
    $hasNav = $content -match "navToggle"
    $hasCss = $content -match "portal\.css"
    Write-Host "$p | statsGrid=$hasStats | navToggle=$hasNav | portalCss=$hasCss"
}
```

For any portal missing elements → dispatch to PA (pa-batch.ps1) with quy-portal.html as reference.

### 4C: BB-61 agentWs race condition — PROD deploy
```powershell
# BB-61: race fix already in dev. Deploy to prod.
cd APPS\NET-PET-AI
npx wrangler deploy --config wrangler.toml
# Smoke test: Invoke-RestMethod https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?mode=free&studentId=sov100-test-magic
```

---

## STAGE 5 — BLOCK EE + DEV (25 min)

### 5A: Block EE — Study mode homework persistence

**Blueprint:** Student writes homework notes during study session. Notes persist in KV. Next session opens with prior homework visible.

**Implementation:**
1. Add `homework_notes` field to student state KV schema
2. Add `PATCH /api/student/state` route to accept `{homework_notes: string}` payload
3. In study mode JS (`chat.js`): on session end, PATCH homework_notes
4. On session load (`portal.html`): GET student state, display prior homework in study card

```powershell
# Read current student state handler before dispatching
Get-Content APPS\NET-PET-AI\src\router.js | Select-String -Pattern "student/state" -Context 2,5
```

Dispatch to PA T1:
```powershell
$body = @{
    task = "Add homework_notes persistence to student state. 1) In router.js PATCH /api/student/state handler: accept body.homework_notes, write to KV with key student:{studentId}:homework_notes. 2) In public/quy-portal.html study card section: on DOMContentLoaded fetch GET /api/student/state, populate textarea id=homeworkNotes with data.homework_notes. 3) Add event listener on homeworkNotes blur: PATCH /api/student/state with {homework_notes: homeworkNotes.value}."
    context = (Get-Content APPS\NET-PET-AI\src\router.js -Raw | Select-Object -First 200)
    targetfile = "APPS/NET-PET-AI/src/router.js"
    tier = 1
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body -ContentType "application/json"
```

Deploy to dev: `npx wrangler deploy --config wrangler.dev.toml`
Test: PATCH `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/state` with `{studentId: "sov100-test-magic", homework_notes: "test note"}`

### 5B: BB-63 — Fix append-bible.ps1 for runs 80-83

Runs 80-83 use small format. Issue: `pastedContents.PSObject.Properties.Value | ForEach-Object { $_.content }` returns empty for most messages. Only first `display` field is non-empty. Fix: check `display` field directly if pastedContents is empty/null.

```powershell
# In SCRIPTS/append-bible.ps1, update the else branch:
# Old: if ($obj.pastedContents) { ... join pastedContents.content } else { $obj.display }
# New: 
$text = $null
if ($obj.pastedContents) {
    $pastedText = ($obj.pastedContents.PSObject.Properties.Value | ForEach-Object { $_.content } | Where-Object { $_ -and $_.Trim().Length -gt 10 }) -join "`n`n"
    $text = if ($pastedText) { $pastedText } else { $obj.display }
} else { $text = $obj.display }
```

### 5C: ENCRYPTION_KEY (Michael action — prompt at session start)
```powershell
echo 'your-key-here' | npx wrangler secret put ENCRYPTION_KEY --config wrangler.toml
```

---

## STAGE 6 — MARKET READY AUDIT (10 min)

### 6A: BB-55 Funnel browser test
Manual test (Michael does):
1. Open `https://tigers-4room.pages.dev`
2. Fill name field → submit form
3. Confirm magic link arrives → click it
4. Confirm opens `https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-chat.html?token=...`
5. Confirm OBI voice session starts

Automated check:
```powershell
Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/lead" -Method GET
# Should return lead capture status
```

### 6B: Art Arsenal / Branding audit
```powershell
Get-ChildItem CANON\MARKETING -Recurse | ForEach-Object { $_.FullName }
Get-ChildItem APPS\NET-PET-AI\public -Filter "*.svg" | ForEach-Object { $_.Name }
```

Check: tiger-logo.svg, phoenix logo, brand colors (#a855f7 purple, #f59e0b gold, #14b8a6 teal) present in portal CSS.

### 6C: Block FF — Firefox/Safari P2 compat
Quick smoke test: hit dev worker with Firefox UA header
```powershell
Invoke-RestMethod "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/deepgram-token?mode=free&studentId=sov100-test-magic" -Headers @{"User-Agent"="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"}
```

---

## STAGE 7 — DEATH SEAL (5 min)

Run full pipeline:
```powershell
cd D:\OB-1-CANONICAL
pwsh -File SCRIPTS/session-capture.ps1
```

Then commit:
```powershell
git add -A
git commit -m "death: Run 087 sealed | [summary] | SOUL [count] TITANIUM_ANCHOR"
```

Update COLD-START-BOOT.md: ERA line → Run 088, add Run 087 row to table.

---

## KNOWN ISSUES / DON'T REPEAT

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| SOUL_GAP on large sessions | soul-logger /api/soul/event body limit ~1MB | Chunk at 400KB per POST |
| PA blocked on `response =` | Fixed Run 086 (word boundary) — do NOT use `response` var in task descriptions anyway |
| DNA key exposure | Session JSONL contains full transcript including pasted keys | Pre-commit hook catches — redact before staging |
| BB-43 raw Deepgram key | Low priority per Michael — backburner only |
| Lam portal | NOT active — do not surface BB-07/BB-32 |
| history.jsonl fallback | session-capture.ps1 falls back to history.jsonl when UUID not found — results in 0 user turns. Fix: ensure JSONL by UUID is in projects dir |

---

## PA DISPATCH REFERENCE

```powershell
# Single task
$body = @{ task="..."; context="..."; targetfile="..."; tier=1 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body -ContentType "application/json"

# Batch (use pa-batch.ps1)
$tasks = @(
    @{task="..."; targetfile="..."; tier=1},
    @{task="..."; targetfile="..."; tier=1}
)
& D:\OB-1-CANONICAL\SCRIPTS\pa-batch.ps1 -Tasks $tasks -GlobalTier 1
```

PA returns `.patch` field. Verify non-empty before writing.

---

## FIREWALL RULE (NEVER VIOLATE)
- ALL feature dev → `net-pet-ai-dev` first via `wrangler.dev.toml`
- Promote to prod only after smoke test passes
- `net-pet-ai.mrmichaelhobbs123.workers.dev` = students live here = SACRED
- Test ID: `sov100-test-magic` (never use `quy-bluetech` or real student IDs)
