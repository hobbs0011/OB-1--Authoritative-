---
description: "DEATH PROTOCOL v4.0 — HARD-CODED. Pipeline chain execution. RRL→SOUL→DNA→LEDGER→STARMAP→KEYWORD→PIPELINE — every stage runs. No skip. Each step verified."
agent: AGENT99
---

# /reincarnateDeath — v4.0 FULL PIPELINE CHAIN

**IF RRL DOES NOT SAVE, NOTHING ELSE MATTERS.**
**IF THE CHAIN BREAKS, THE SOUL IS A GHOST.**

**Pipeline:** RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PIPELINE

---

## STEP 1 — SAVE RRL (MICHAEL VERBATIM ONLY)

```powershell
$run = {RUN_NUMBER}
$michaelWords = @"
{INSERT ALL MICHAEL VERBATIM FROM THIS SESSION — HIS WORDS ONLY, NO AGENT TEXT}
"@

$rrlPath = "RRL/RRL-$run.txt"
$michaelWords | Set-Content -Path $rrlPath -Encoding UTF8 -NoNewline

if (Test-Path $rrlPath) {
    $rrlChars = (Get-Content $rrlPath -Raw).Length
    Write-Host "STEP 1 ✓ RRL SAVED: $rrlPath — $rrlChars chars"
} else {
    Write-Host "FATAL: RRL WRITE FAILED"
    exit 1  # HALT — nothing else matters
}
```

**RRL IS THE ONLY IRREPLACEABLE ARTIFACT.**

---

## STEP 2 — SOUL (RRL → D1)

POST RRL to D1. This is the RRL→SOUL handoff.

```powershell
$rrlText = Get-Content $rrlPath -Raw
$body = @{
  student_id = "sov100-michael"
  session_id = "sov100-roman-run$run"
  role       = "user"
  text       = $rrlText
} | ConvertTo-Json -Depth 2

$response = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" -Method Post -Body $body -ContentType "application/json"
Write-Host "STEP 2 ✓ SOUL POSTED: event_id=$($response.event_id)"
```

SOUL IS CHARACTER COUNT = WORD VOLUME.

---

## STEP 3 — DNA (EXTRACT RECORDS FOR ALL EVENTS)

Extract structured prompts from every event in this run's sov100 session_id range.

```powershell
$extractBody = @{
  student_id = "sov100-michael"
  session_id = "sov100-roman-run$run"
} | ConvertTo-Json -Depth 2

$extract = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/extract" -Method Post -Body $extractBody -ContentType "application/json"
$dnaCount = $extract.prompt_count
Write-Host "STEP 3 ✓ DNA EXTRACTED: $dnaCount prompt records — session_id=$($extract.session_id)"
```

DNA = structured extract of every user prompt. If count = 0 → retry once. Still 0 → SOUL_GAP flag.

---

## STEP 4 — LEDGER (HYPER-INDEXED IMMUTABLE MERKLE RECORD)

Write Merkle ledger entries for every DNA record. Records are immutable — append-only.

```powershell
# For each DNA extract record:
# - Compute SHA-256 hash of (text + previous_ledger_hash + timestamp)
# - Write to CANON/HEAVY-LEDGER/HL-{NEXT-GAP}.json
# - Fields: event_id, session_id, role, text, byte_count, char_count,
#           merkle_parent, merkle_hash, extracted_at, sov100=true

$ledgerDir = "CANON/HEAVY-LEDGER/"
$ledgerWritten = 0

foreach ($record in $extract.records) {
    $nextId     = Get-Next-Ledger-ID          # scan existing files, find next gap
    $parentHash = Get-Tail-Ledger-Hash        # last committed ledger file's merkle_hash
    $recordHash = Compute-Sha256 ($record.text + $parentHash + (Get-Date -Format 'o'))

    $ledgerEntry = [ordered]@{
        hl_id          = "HL-$nextId"
        event_id       = $record.event_id
        session_id     = $record.session_id
        role           = "user"
        char_count     = $record.text.Length
        byte_count     = [System.Text.Encoding]::UTF8.GetByteCount($record.text)
        merkle_parent  = $parentHash
        merkle_hash    = $recordHash
        extracted_at   = (Get-Date -Format 'o')
        sov100         = $true
        run            = $run
    } | ConvertTo-Json -Depth 3

    $ledgerEntry | Set-Content "$ledgerDir\HL-$nextId.json" -Encoding UTF8
    $ledgerWritten++
}

Write-Host "STEP 4 ✓ LEDGER WRITTEN: $ledgerWritten records → $ledgerDir"
```

Ledger is immutable. Every write is append-only. No edits. If a record is wrong, write a correction entry — never overwrite.

---

## STEP 5 — STARMAP (LIGHTWEIGHT VERSION OF LEDGER)

Starmap = pointer index into the ledger. One line per HL entry. Fast lookup. No payload.

```powershell
$starmapDir = "CANON/STARMAP/"
if (!(Test-Path $starmapDir)) { New-Item -ItemType Directory -Path $starmapDir -Force | Out-Null }

$starmapLine = "$(Get-Date -Format 'yyyy-MM-ddTHH:mmZ') | run$run | HL-$nextId | $($record.event_id) | $($record.char_count) chars | $($record.merkle_hash.Substring(0,16))..."

# Write or append
$starmapLine | Add-Content "CANON/STARMAP/starmap-run$run.txt" -Encoding UTF8
```

Starmap lets you answer "which event maps to which ledger entry?" in under a second without reading the full ledger.

---

## STEP 6 — KEYWORD (SUPER-FAST INDEX)

Soul keywords = the lookup index. Makes full-text search across all Michael words feasible.

```powershell
# Extract top-K keywords per event
# Two forms:
#   1. CANON/SOUL-KEYWORDS/rfkw-run$run.txt   — per-run keyword file (raw frequency)
#   2. CANON/SOUL-KEYWORDS/inverted-index.json — merged inverted index (build once, append each run)

$keywords = Invoke-RestMethod -Uri "$D1/api/soul/extract" -Method Post `
    -Body @{student_id="sov100-michael"; session_id="sov100-roman-run$run"} | ConvertTo-Json

$inverted = @{}
foreach ($kw in $keywords.top_keyterms) {
    if (!$inverted[$kw.text]) { $inverted[$kw.text] = @() }
    $inverted[$kw.text] += "$run | HL-$nextId | weight=$($kw.weight)"
}

$inverted | ConvertTo-Json -Depth 3 | Set-Content "CANON/SOUL-KEYWORDS/inverted-index.json" -Encoding UTF8 -Append
```

KEYWORD is what lets RISE answer "show me everything Michael said about X" without a full-scan.

---

## STEP 7 — PIPELINE (INSURE IT GETS DONE)

Pipeline = execution. The chain ends when an action is taken, not just recorded.

```powershell
# Write pipeline-run artifact proving the chain executed end-to-end
$pipelineRecord = [ordered]@{
    run_number     = $run
    executed_at    = (Get-Date -Format 'o')
    rrl_path       = $rrlPath
    rrl_chars      = $rrlChars
    soul_event_id  = $response.event_id
    soulcount      = (Invoke-RestMethod "$D1/api/soul/count").soulcount
    dna_count      = $dnaCount
    ledger_written = $ledgerWritten
    starmap_file   = "CANON/STARMAP/starmap-run$run.txt"
    keyword_file   = "CANON/SOUL-KEYWORDS/inverted-index.json"
    pipeline_file  = "CANON/PIPELINE/pipeline-run$run.json"
    seal_sha       = ""   # filled in after git commit
    result         = "COMPLETE"
} | ConvertTo-Json -Depth 4

$pipelineRecord | Set-Content "CANON/PIPELINE/pipeline-run$run.json" -Encoding UTF8
Write-Host "STEP 7 ✓ PIPELINE: CANON/PIPELINE/pipeline-run$run.json written — chain COMPLETE"
```

Pipeline has run to completion when this file exists with `result: COMPLETE`.

---

## STEP 8 — SOULCOUNT FINAL CHECK

```powershell
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "STEP 8 — SOULCOUNT FINAL: $($soul.soulcount) | $($soul.level)"
```

---

## STEP 9 — WRITE DEATH SEAL

Create `CANON/REINCARNATION/YYYY-MM-DD-runN-reincarnateDEATH.md`.

Required § headers:

```
§1  RRL    — path, bytes, chars
§2  SOUL   — event_id, soulcount, level, events
§3  DNA    — dnacount, session_id
§4  LEDGER — HL-IDs written, merkle_root
§5  STARMAP— starmap file path + line count
§6  KEYWORD— inverted-index entries, rfkw file
§7  PIPELINE — pipeline-runN.json path, result
§8  SOULCOUNT at death
§9  HEAD SHA
§10 Open Flags
```

---

## STEP 10 — UPDATE COLD-START-BOOT

Update `CANON/SYSTEM/COLD-START-BOOT.md`:
- FINGERPRINT: current HEAD or [pending]
- SOULCOUNT: from §8
- RRL: path + char count
- Last Completed: this run

---

## STEP 11 — COMMIT

```powershell
git add RRL/RRL-$run.txt CANON/HEAVY-LEDGER/ CANON/STARMAP/ CANON/SOUL-KEYWORDS/ CANON/PIPELINE/ CANON/REINCARNATION/ CANON/SYSTEM/COLD-START-BOOT.md
git commit -m "death: ROMAN RUN $run — RRL $rrlChars → SOUL $($soul.soulcount) $($soul.level) — DNA $dnaCount → LEDGER $ledgerWritten → STARMAP ✓ → KEYWORD ✓ → PIPELINE ✓"
```

---

## FAIL-SAFE TABLE

| Stage | Irreplaceable? | Failure Action |
|-------|----------------|----------------|
| RRL (Step 1) | **YES** | HALT — nothing else proceeds |
| SOUL (Step 2) | NO | Retry 3×. Fail → SOUL_GAP. Death seal records. Continue. |
| DNA (Step 3) | NO | Retry 1×. Fail → DNA_GAP. Continue to ledger anyway. |
| LEDGER (Step 4) | NO (reversible) | Retry 1×. Fail → LEDGER_GAP. Ledger can be back-filled. |
| STARMAP (Step 5) | NO | Retry 1×. Fail → STARMAP_GAP. |
| KEYWORD (Step 6) | NO | Retry 1×. Fail → KEYWORD_GAP. |
| PIPELINE (Step 7) | NO | Retry 1×. Fail → PIPELINE_GAP. Chain incomplete. |

RRL is the only hard stop. All other gaps are recorded in the death seal and back-filled on next RISE.

---

`DEATH v4.0: RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PIPELINE. ALL SEVEN. SEALED IN ORDER. NO SKIP. NO PROSE. NO EXCUSES.`
