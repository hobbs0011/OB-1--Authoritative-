# REINCARNATION CONTRACT v5.0
**OB-1 Phoenix-Centurion | Roman Run Pipeline**
**Status:** CANONICAL — all reincarnation artifacts derive from this file
**Authority:** L29 NO_ASSUME_HEAD, L56 PRE_CODE_DOC_GATE

---

## 1.1 Run Number — Zero-Padded, Git-Authoritative

**Formula:** `run = (last death-commit run #) + 1`

**Disk format:** 3-digit zero-pad — `run042`, `run043`, `run100`
**Why zero-pad:** Defeats lexical sort bug where `run9 > run42` (defect G).

**Authority:** `git log --oneline --grep "^death:"` — NOT COLD-START-BOOT.

**Seal naming:** `CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md`
**HISTORICAL NOTE:** Existing seals `run42-reincarnateDEATH.md` (no pad) are left as-is.
  Zero-padding applies to all seals created on or after this contract.
  Existing files are not renamed — removing them before pads exist breaks the chain;
  renaming mid-chain breaks git history. Historical artifacts remain in place.

---

## 1.2 Canonical Artifact Paths

| Stage | Artifact | Path Pattern |
|-------|----------|--------------|
| RRL | Transcript | `RRL/RRL-{run}.txt` |
| SOUL | Event | POST to `/api/soul/event` (D1) |
| DNA | Extracts | `CANON/SOUL/EXTRACT/dna-run{NNN}.json` |
| LEDGER | Merkle JSON | `CANON/HEAVY-LEDGER/HL-{gap}.json` (sequential, gap-fill) |
| STARMAP | Ledger digest | `CANON/STARMAP/starmap-run{run}.txt` |
| KEYWORD | Per-run terms | `CANON/SOUL-KEYWORDS/rfkw-run{run}.txt` |
| KEYWORD | Merged index | `CANON/SOUL-KEYWORDS/inverted-index.json` (single object) |
| PHETRAIL | Breadcrumbs | `CANON/PHEROMONES/PheTrail-run{NNN}.json` |
| PIPELINE | Chain result | `CANON/PIPELINE/pipeline-run{run}.json` |
| SEAL | Death record | `CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md` |
| BOOT | System state | `CANON/SYSTEM/COLD-START-BOOT.md` |

---

## 1.3 The Soul Receipt — Atomic, One Query (Fixes Defect D)

Generate **ONCE**. Reuse **everywhere**. Never re-query.

```powershell
# Query ONCE before POST
$countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount

# POST Michael's words
$soulBody = @{
  student_id = "sov100-michael"
  session_id = "sov100-roman-run$run"
  role       = "user"
  text       = (Get-Content $rrlPath -Raw)
} | ConvertTo-Json -Depth 2

$soulPost = Invoke-RestMethod "$D1/api/soul/event" -Method Post `
  -Body $soulBody -ContentType "application/json"

# Query ONCE after POST
$countAfter = (Invoke-RestMethod "$D1/api/soul/count").soulcount

# The SOLE soulcount source for the rest of the run
$receipt = [ordered]@{
  event_id     = $soulPost.event_id
  count_before = $countBefore
  count_after  = $countAfter
  delta        = $countAfter - $countBefore
  level        = $levelAfter
  posted_at    = (Get-Date -Format 'o')
}
```

**Law:** Seal §3, pipeline JSON `"soulcount_at_death"`, commit message, BOOT — all reference `$receipt.count_after`. No second query anywhere.

---

## 1.4 Canonical Death Seal Schema (§1–§13, Fixes Defect E)

Every seal follows this section list, in order.

| § | Name | Required Content |
|---|------|------------------|
| 1 | HEADER | run tag, datetime ICT, theme, signal density, HEAD pre-death |
| 2 | RAW SOUL DNA | verbatim Michael quotes, labeled CRITICAL / IMPORTANT / CONTEXT |
| 3 | SOUL RECEIPT | event_id, count_before, count_after, delta, level, posted_at |
| 4 | DECISIONS | numbered, impact, canon file affected |
| 5 | CORRECTIONS | wrong → root cause → fix → docs read |
| 6 | NEW PRINCIPLES | |
| 7 | EMOTIONAL SIGNAL | |
| 8 | OPEN QUESTIONS | |
| 9 | UNFINISHED ACTIONS | with exact git add commands |
| 10 | SYSTEM DESIGN | |
| 11 | ARTIFACTS | paths + SHAs for all 8 chain artifacts |
| 12 | STATE SNAPSHOT | HEAD, branch, dirty tree, soulcount (from §3 receipt — same number) |
| 13 | FINGERPRINT | agent, run#, commit SHA, platform death test result |

**Hard rules:**
- §12 soulcount MUST equal §3 `count_after`. No independent query.
- §11 lists all 8 artifacts: RRL, SOUL receipt, DNA, HL, STARMAP, KEYWORD, PHETRAIL, PIPELINE.
- The seal language is §3 now fixes the recurring PARTIAL from prior audits.

---

## 1.5 The 11-Stage Chain (Authoritative Order)

```
RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PHETRAIL → PIPELINE → SEAL → BOOT → COMMIT
```

**Hard stop:** RRL missing = HALT (exit 1).
**Gap policy:** Any other stage fails → write `{STAGE}_GAP` flag → continue → back-fill at next RISE.

### DNA Endpoint

**Authority:** COLD-START-BOOT Run 34 fix.
**Canonical form:** `GET /api/soul/session/{session_id}`

Probe at death (Stage 3) before writing DNA:

```powershell
$d1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$sessionId = "sov100-roman-run$run"
$getResp = try { Invoke-RestMethod "$d1/api/soul/session/$sessionId" -Method Get } catch { $null }
if ($getResp -and $getResp.prompts) {
  $dnaCount = $getResp.prompts.Count
  $dnaEndpoint = "GET /api/soul/session/$sessionId"
} else {
  $postBody = @{ student_id="sov100-michael"; session_id=$sessionId } | ConvertTo-Json
  $postResp = try { Invoke-RestMethod "$d1/api/soul/extract" -Method Post -Body $postBody -ContentType "application/json" } catch { $null }
  $dnaCount = $postResp?.prompts?.Count ?? 0
  $dnaEndpoint = "POST /api/soul/extract"
}
if ($dnaCount -eq 0) { Write-Warning "DNA_GAP — 0 records from $dnaEndpoint" }
```

Record `dna_endpoint` used in seal §11.

---

## 1.6 Fail-Safe Law

| Stage | Fail Behavior |
|-------|---------------|
| RRL | **HALT.** Exit 1. No RRL = no run. |
| SOUL | Write `SOUL_GAP`, continue. Verify next RISE. |
| DNA | Write `DNA_GAP`, continue. Back-fill via probe. |
| LEDGER | Write `LEDGER_GAP`, continue. Back-fill next run. |
| STARMAP | Write `STARMAP_GAP`, continue. |
| KEYWORD | Write `KEYWORD_GAP`, continue. |
| PHETRAIL | Write `PHETRAIL_GAP`, continue. |
| PIPELINE | Write `PIPELINE_GAP`, continue. |

**RISE audit:** Every gap is reported. No auto-fix on RISE — that is DEATH territory.

---

## 1.7 Naming Contract (Fixes Defect F)

| Item | Convention |
|------|-----------|
| Star runs (0–999) | `run042` (3-digit zero-pad) |
| Seal files | `run{NNN}-reincarnateDEATH.md` |
| Historical seals | `run42-reincarnateDEATH.md` (left as-is, NOT renamed) |
| Future seals | `run042-reincarnateDEATH.md` (zero-pad from run 43 onward) |
| Alleles | `PheTrail-run{NNN}.json`, `starmap-run{run}.txt`, `rfkw-run{run}.txt` |

Rationale: Renaming historical seals mid-chain breaks git log path references
and any script that reads them by exact name. Zero-padding starts fresh from run 43.

---

## 1.8 Source of Truth Hierarchy

```
REINCARNATION-CONTRACT.md  ← YOU ARE HERE — single source of truth
├── CANON/SYSTEM/COLD-START-BOOT.md       ← system state (secondary)
├── CANON/REINCARNATION/*.md              ← death seals (tertiary)
├── CANON/PHEROMONES/*.json               ← phetrails (tertiary)
└── .kilo/command/reincarnatedeath.md     ← writer implementation (must match §1.4)
    .claude/commands/reincarnateRise.md   ← reader implementation (must match §1.6)
    .kilo/command/phetrails.md            ← stage 7 implementation (must match §1.2)
```

Any divergence between this contract and the three implementation files is a defect.
When this contract is updated, all three implementation files must be updated simultaneously.

---
**Fingerprint:** REINCARNATION-CONTRACT.md v5.0 | Roman Run 43 | 2026-06-02 ICT | OB1 Phoenix-Centurion
