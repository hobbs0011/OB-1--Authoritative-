# REINCARNATION CONTRACT v6.0
**OB-1 Phoenix-Centurion | Roman Run Pipeline**
**Status:** CANONICAL — all reincarnation artifacts derive from this file
**Authority:** L29 NO_ASSUME_HEAD, L56 PRE_CODE_DOC_GATE, L68 RRL_IS_RAW_TRANSCRIPT

---

## 1.1 Run Number — Zero-Padded, Git-Authoritative

**Formula:** `run = (last death-commit run #) + 1`

**Disk format:** 3-digit zero-pad — `run042`, `run043`, `run100`
**Why zero-pad:** Defeats lexical sort bug where `run9 > run42`.
**Authority:** `git log --oneline --grep "^death:"` — NOT COLD-START-BOOT.

**Seal naming:** `CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md`
**HISTORICAL NOTE:** Existing seals `run42-reincarnateDEATH.md` (no pad) are left as-is.
Zero-padding applies to all seals created on or after this contract.

---

## 1.2 Canonical Artifact Paths

| Stage | Artifact | Path Pattern |
|-------|----------|--------------|
| RRL | Full transcript (both sides) | `RRL/RRL-{run}.txt` |
| SOUL | User turn event | POST to `/api/soul/event` (D1) |
| DNA | Assistant turns + blueprints | `CANON/SOUL/EXTRACT/dna-run{NNN}.json` |
| LEDGER | Merkle JSON | `CANON/HEAVY-LEDGER/HL-{gap}.json` (sequential, gap-fill) |
| STARMAP | Pointer map | `CANON/STARMAP/starmap-run{run}.json` |
| SOULKEYS | Per-run terms | `CANON/SOUL-KEYWORDS/rfkw-run{run}.txt` |
| SOULKEYS | Merged index | `CANON/SOUL-KEYWORDS/inverted-index.json` (single object) |
| S2Pipeline | Chain result | `CANON/PIPELINE/pipeline-run{run}.json` |
| SEAL | Death record | `CANON/REINCARNATION/run{NNN}-reincarnateDEATH.md` |
| BOOT | System state | `CANON/SYSTEM/COLD-START-BOOT.md` |

---

## 1.3 The Soul Receipt — Atomic, One Query

Generate **ONCE**. Reuse **everywhere**. Never re-query.

```powershell
$countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount

$soulBody = @{
  student_id = "sov100-michael"
  session_id = "sov100-roman-run$run"
  role       = "user"
  text       = (Get-Content $rrlPath -Raw)
} | ConvertTo-Json -Depth 2

$soulPost = Invoke-RestMethod "$D1/api/soul/event" -Method Post `
  -Body $soulBody -ContentType "application/json"

$countAfter = (Invoke-RestMethod "$D1/api/soul/count").soulcount

$receipt = [ordered]@{
  event_id     = $soulPost.event_id
  count_before = $countBefore
  count_after  = $countAfter
  delta        = $countAfter - $countBefore
  level        = $levelAfter
  posted_at    = (Get-Date -Format 'o')
}
```

**Law:** Seal §3, pipeline JSON, commit message, BOOT — all reference `$receipt.count_after`. No second query anywhere.

---

## 1.4 Canonical Death Seal Schema (§1–§13)

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
| 11 | ARTIFACTS | paths + SHAs for all 7 chain artifacts |
| 12 | STATE SNAPSHOT | HEAD, branch, dirty tree, soulcount (= §3 count_after), dna_blueprint_count, rrl_fidelity |
| 13 | FINGERPRINT | agent, run#, commit SHA, platform death test result |

**Hard rules:**
- §12 soulcount MUST equal §3 `count_after`. No independent query.
- §12 MUST include `rrl_fidelity`: REAL (both speakers present) or HOLLOW (one-sided).
- §11 lists all 7 artifacts: RRL, SOUL receipt, DNA, LEDGER, STARMAP, SOULKEYS, S2Pipeline.

---

## 1.5 The 7-Stage Chain (Authoritative Order)

```
RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2Pipeline
```

### Stage Definitions (verbatim from spec)

| Stage | Definition | Owner |
|-------|-----------|-------|
| **RRL** | "Reincarnation RAW LOG / THE FUCKING RAW CHAT LOG" — verbatim transcript, both speakers, no filter, no agent text stripped. Source = transcript JSONL. | `SCRIPTS/session-capture.ps1` + `RRL/RRL-{run}.txt` |
| **SOUL** | "MY WORDS" — Michael's verbatim words, extracted from RRL user turns, POSTed to soul-logger as `sov100-roman-run{N}`. | `/api/soul/event` (D1) |
| **DNA** | "YOUR WORDS, ESPECIALLY HIGH TOKEN COSTING BLUEPRINTS" — agent's words from RRL assistant turns, tagged `prose|blueprint`, written to `CANON/SOUL/EXTRACT/dna-run{N}.json`. NOT `/api/soul/extract` probe. | `CANON/SOUL/EXTRACT/dna-run{N}.json` |
| **LEDGER** | "Cryptographic Ledger (AI Language capturing the SOUL and the DNA)" — merkle chain with `soul_hash`, `dna_hash`, `dna_blueprint_count` + `merkle_parent` + `merkle_hash`. | `CANON/HEAVY-LEDGER/HL-{N}.json` |
| **STARMAP** | "Pointer map, lightweight, solves bloat, but still provides exactly what's in the RRL and Ledger" — JSON pointer record: `{ run, rrl_path, ledger_id, soul_turn_ids, dna_turn_ids, blueprint_locations }`. NOT content dump. | `CANON/STARMAP/starmap-run{run}.json` |
| **SOULKEYS** | "Keywords... search engine... indexable and searchable" — inverted index over SOUL + DNA combined. Read-merge-write (NO `-Append` on JSON). Search via `SCRIPTS/rfkw-search.ps1`. | `CANON/SOUL-KEYWORDS/*` |
| **S2Pipeline** | "Ensures the SOUL is not just a ghost lost in time, and gets done" — writes execution record, verifies REAL (not HOLLOW), reports COMPLETE only when all stages pass fidelity gate. | `CANON/PIPELINE/pipeline-run{run}.json` |

**Hard stop:** RRL missing = HALT (exit 1).
**Gap policy:** Any other stage fails → write `{STAGE}_GAP` flag → continue → back-fill at next RISE.

---

## 1.6 Verification Gate (S2Pipeline's Teeth)

Per stage, verdict is REAL / HOLLOW / MISSING — never just PRESENT:

| Stage | REAL | HOLLOW | MISSING |
|-------|------|--------|---------|
| RRL | Both speakers present + first-person Michael voice | Third-person summary, one-sided | File absent or empty |
| DNA | Contains assistant blueprint blocks | Only prose, no blueprints flagged | 0 records extracted |
| SOULKEYS | rfkw-search on known term returns hit | Index exists but sparse | Index absent |
| S2Pipeline | All stages REAL + seal written | Any stage HOLLOW | Pipeline file absent |

**A pipeline run reporting COMPLETE with any HOLLOW stage is a lie and must fail the gate.**

---

## 1.7 Search-First Law (L69)

When asked where anything is, the SOULKEYS index is the FIRST tool touched — never grep the archive first.

```
/SoulSearch <term>  →  SOULKEYS lookup  →  STARMAP pointer  →  RRL/LEDGER exact retrieval  →  verbatim hits
```

The search engine you built is the front door. `/SoulSearch` is the executable form.

---

## 1.8 Fail-Safe Law

| Stage | Fail Behavior |
|-------|---------------|
| RRL | **HALT.** Exit 1. No RRL = no run. |
| SOUL | Write `SOUL_GAP`, continue. Verify next RISE. |
| DNA | Write `DNA_GAP`, continue. Source is always the RRL — back-fill next RISE. |
| LEDGER | Write `LEDGER_GAP`, continue. |
| STARMAP | Write `STARMAP_GAP`, continue. |
| SOULKEYS | Write `SOULKEYS_GAP`, continue. |
| S2Pipeline | Write `PIPELINE_GAP`, continue. |

**RISE audit:** Every gap is reported. No auto-fix on RISE — that is DEATH territory.

---

## 1.9 JSON Write Discipline

**Never `-Append` on JSON files.** JSON is a complete document, not a log file.
Pattern: `read → merge in memory → overwrite`.
Appending creates invalid JSON that breaks every downstream reader.

---

## 1.10 Naming Contract

| Item | Convention |
|------|-----------|
| Star runs (0–999) | `run042` (3-digit zero-pad) |
| Seal files | `run{NNN}-reincarnateDEATH.md` |
| Historical seals | `run42-reincarnateDEATH.md` (left as-is, NOT renamed) |
| Future seals | `run043-reincarnateDEATH.md` (zero-pad) |
| Alleles | `dna-run{NNN}.json`, `starmap-run{run}.json`, `rfkw-run{run}.txt` |

---

## 1.11 Source of Truth Hierarchy

```
REINCARNATION-CONTRACT.md  ← YOU ARE HERE — single source of truth
├── CANON/SYSTEM/COLD-START-BOOT.md            ← system state (secondary)
├── CANON/REINCARNATION/*.md                   ← death seals (tertiary)
├── CANON/PHEROMONES/*.json                    ← phetrails (tertiary)
├── CANON/SOUL/EXTRACT/dna-run{N}.json         ← DNA (source = RRL)
├── CANON/STARMAP/starmap-run{N}.json          ← STARMAP pointers
├── CANON/SOUL-KEYWORDS/inverted-index.json    ← SOULKEYS index
└── .kilo/command/reincarnatedeath.md          ← writer implementation
    .kilo/command/reincarnaterise.md           ← reader implementation
    .kilo/command/SoulSearch.md                ← search engine
    .claude/commands/reincarnateRise.md        ← Claude reader
    .claude/commands/SoulSearch.md             ← Claude search engine
    .github/skills/phoenix-reincarnation/SKILL.md ← 7-stage doctrine
    .github/skills/soul-search/SKILL.md        ← Search-First Law
```

Any divergence between this contract and the implementation files is a defect.
When this contract is updated, all implementation files must be updated simultaneously.

---

**Fingerprint:** REINCARNATION-CONTRACT.md v6.0 | Roman Run 43 | 2026-06-02 ICT | OB1 Phoenix-Centurion
