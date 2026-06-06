# EDGE CASE AUDIT — REINCARNATION PROTOCOL (Second Round)

**Run:** 079  
**Date:** 2026-06-06  
**Scope:** RISE, DEATH, PheTrails, dnaREGISTRY, SoulSearch, and connected pipeline components  
**Total Edge Cases Found:** 52  
**Critical:** 5 | **High:** 16 | **Medium:** 12 | **Low:** 5 | **Documented/Patched:** 14  

---

## VERSION MISMATCHES

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-001 | RISE Protocol | `.kilo/command/reincarnaterise.md:1` | HIGH | Claims v6.0 in description but `.kilo/command/reincarnaterise.md` describes 7 stages, while `.claude/commands/reincarnateRise.md` describes 7 stages. Description mismatch: "7 STAGES" vs actual content. | ACTIVE |
| EC-002 | DEATH Protocol | `.claude/commands/reincarnatedeath.md:2` | HIGH | `.claude/commands/reincarnatedeath.md` redirects to v5.0 canonical but `.kilo/command/reincarnatedeath.md` is v7.0 (8 stages). Version drift between pointers and implementation. | ACTIVE |
| EC-003 | PheTrails Protocol | `.kilo/command/phetrails.md:2` | MEDIUM | Description claims v2.0 but footer declares v2.1. Inconsistent version labeling within same file. | PATCHED (footer correct) |
| EC-004 | PheTrails Run Numbers | `.kilo/command/phetrails.md:29` | HIGH | PheTrails file references old buggy code that used `Sort-Object Name -Descending` without zero-pad conversion, documented in line 29 BUG comment. | DOCUMENTED / PATCHED in code |
| EC-005 | DEATH Schema | `.claude/commands/reincarnatedeath.md:275 | RRL-72 shows v6.0 schema reference in death message but .kilo is v7.0. Mixed version references across RRL transcripts. | ACTIVE |

---

## HOLLOW vs REAL DISCREPANCIES

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-006 | Run 079 Status | `CANON/REINCARNATION/seals/run079-reincarnateDEATH.md:3` | CRITICAL | Status: "HOLLOW COMPLETE" but `dna-blueprint_count: 0` with `dna_status: HOLLOW`. 0 blueprints extracted despite REAL RRL. | ACTIVE |
| EC-007 | Run 079 Fidelity | `CANON/PIPELINE/pipeline-run079.json:17` | CRITICAL | `dna_status: HOLLOW` with `dna_blueprint_count: 0` while `rrl_fidelity: REAL`. DNA extraction failed to find any blueprints. | ACTIVE |
| EC-008 | DNA Extraction Logic | `.kilo/command/reincarnatedeath.md:195` | HIGH | Blueprint detection regex: `$text -match '```|`````|fenced code block|\b(SPEC|...)` requires `text.Length -gt 200` — may miss smaller genuine blueprints. | ACTIVE |
| EC-009 | SOUL reception | `.kilo/command/reincarnatedeath.md:155` | HIGH | `$receipt.level = $levelAfter` but `$levelAfter` is never assigned in STAGE 2. Throws on receipt construction. | DOCUMENTED (seal §5.1) |

---

## UNDEFINED VARIABLES / MISSING FUNCTION DEFINITIONS

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-010 | Helper Functions | `.kilo/command/reincarnatedeath.md:264` | CRITICAL | STAGE 4 calls `Get-Next-LedgerID`, `Get-Tail-Ledger-Hash`, `Compute-Sha256` but never defines them. Clean-environment execution fails. | DOCUMENTED (seal §5.1) |
| EC-011 | Registry variable | `.kilo/command/reincarnatedeath.md:411-412` | HIGH | STAGE 7 references `$artRegistryDir` and `$syncedPieces` which are assigned in STAGE 8 (forward reference). Produces null-reference gaps. | DOCUMENTED (seal §5.1) |
| EC-012 | Fidelity Variable | `.kilo/command/reincarnatedeath.md:413` | CRITICAL | `$rrlFidelity` never assigned — result gates on this variable but fidelity boolean stored in `$hasUser/$hasAssistant`. Always returns null/GAP. | DOCUMENTED (seal §5.1) |
| EC-013 | $levelAfter | `.kilo/command/reincarnatedeath.md:155` | HIGH | Referenced but never assigned before `$receipt.level = $levelAfter`. Latent bug causing script failure. | DOCUMENTED (seal §5.1) |

---

## PATH MISMATCHES (Zero-pad Issues)

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-014 | RRL Path | `.kilo/command/reincarnatedeath.md:L31 vs L58` | HIGH | PRE-FLIGHT declares `RRL-$run.txt` but STAGE 1 re-declares `RRL-$runPad.txt`. Skipping auto-discovery leaves wrong path referenced. | DOCUMENTED (seal §5.1) |
| EC-015 | Run Variable Drift | `.kilo/command/reincarnatedeath.md:STAGE 5/8` | HIGH | STAGE 5 writes `starmap-run079.json` (padded) but STAGE 8 references `starmap-run$run.json` (unpadded). Silent desync for double-digit runs. | DOCUMENTED (seal §5.1) |

---

## SCHEMA VIOLATIONS

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-016 | Inverted Index | `CANON/SOUL-KEYWORDS/inverted-index.json:1-27` | CRITICAL | Schema inconsistency: some entries are objects with `term`, `runs`, `count` while others are arrays or null values. Mixed structure causes parsing errors. | ACTIVE |
| EC-017 | Inverted Index Null | `CANON/SOUL-KEYWORDS/inverted-index.json:5` | HIGH | `"runs": [null]` appears for many entries — malformed data structure. | ACTIVE |
| EC-018 | Inverted Index Duplication | `CANON/SOUL-KEYWORDS/inverted-index.json:1657` | HIGH | `"pipeline": [77, {...}, {...}]` shows mixed array structure where first element is a raw number not an object. | ACTIVE |
| EC-019 | Registry Path Gap | `.kilo/command/reincarnatedeath.md:31` | HIGH | References `$registryDir` but this directory only contains one file (`CASESTUDY-001-PATCH-VALIDATION.md`). Missing `dna-registry-run{N}.json` for most runs. | ACTIVE |

---

## MISSING ARTIFACTS

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-020 | PheTrail Missing | `RRL/RRL-72.txt:62` | MEDIUM | "PHETRAIL_GAP — no phetrail found at CANON/PHEROMONES/PheTrail-run072.json" — phetrail not written for run 72. | ACTIVE |
| EC-021 | PheTrail Missing | `RRL/RRL-73.txt:50` | MEDIUM | "PHETRAIL_GAP — run073 phetrail not yet written" — phetrail missing for run 73. | ACTIVE |
| EC-022 | DNA File Missing | `.kilo/command/reincarnatedeath.md:503` | MEDIUM | When `$dnaCount -eq 0`, only warning emitted; `dna-run{N}.json` never created. | DOCUMENTED (seal §5.1) |
| EC-023 | Registry Missing | `CANON/REGISTRY/` | HIGH | Directory exists but only contains `CASESTUDY-001-PATCH-VALIDATION.md`. Most runs lack `dna-registry-run{N}.json`. | ACTIVE |
| EC-024 | PheTrail-073 | `SCRIPTS/rrl-pipeline.ps1:269-318` | MEDIUM | Script writes rfkw-run files but no PheTrail JSON output - registry sync step separate. | ACTIVE |

---

## SILENT FAILURES / MISSING ERROR HANDLING

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-025 | SOUL Extraction Regex | `.kilo/command/reincarnatedeath.md:130` | HIGH | `$_ -match 'pattern1', 'pattern2'` treats second pattern as array operand; only first regex executes. `$matches[1]` never populated, `$userTexts` returns empty. | DOCUMENTED (seal §5.1) |
| EC-026 | Dual Hash Determinism | `.kilo/command/reincarnatedeath.md:183-227 vs 195-243` | MEDIUM | JSONL path excludes role-marker line; plain-text path strips speaker prefix differently. Same semantic content produces different char counts, breaking dual-hash determinism between LEDGER and DNA stages. | DOCUMENTED (seal §5.1) |
| EC-027 | Inverted-index Collision | `.kilo/command/reincarnatedeath.md:96` | HIGH | `$inverted[$term] += $entry` on hashtables with identical keys produces serialization failure on `ConvertTo-Json`. Manifests as full index loss. | DOCUMENTED (seal §5.1) |
| EC-028 | Registry Discovery | `SCRIPTS/registry-discovery.ps1:137` | LOW | Uses `$f.Length -gt 0` check but doesn't verify file readability before content read. | ACTIVE |

---

## RRL PROTOCOL VIOLATIONS

| ID | File | Line | Severity | Description | Status |
|----|------|------|----------|-------------|--------|
| EC-029 | Run 71 Notes | `CANON/SOUL-KEYWORDS/rfkw-run71.txt:1` | HIGH | Run 71 notes show 8 user turns + 12 assistant turns but DNA shows 122 records. Data mismatch suggests RRL contamination or extraction error. | ACTIVE |
| EC-030 | RRL-75 Encoding | `CANON/SOUL-KEYWORDS/rfkw-run70.txt:1` | MEDIUM | "Runs 60+ numbered RRL: corrupted/contaminated — not user prompts" — documented contamination in rfkw notes. | DOCUMENTED |
| EC-031 | Run 079 Extraction | `CANON/SOUL/EXTRACT/dna-run079.json:1-16` | HIGH | DNA contains PowerShell script output instead of agent/assistant text. Extraneous JSONL metadata included as "prose". Extraction logic captured wrong content type. | ACTIVE |
| EC-032 | RRL-31b Anomaly | `RRL/RRL-31b.txt` | MEDIUM | Unexpected 'b' suffix in RRL filename breaks zero-pad convention. | ACTIVE |

---

## STALE / ORPHANED FILES

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-033 | `RRL/RRL-Run0-verbatim.txt` | File | LOW | Non-standard naming convention, orphaned test artifact. | ACTIVE |
| EC-034 | `RRL/RRL-CURRENT.txt` | File | MEDIUM | Appears to be a working copy that may not be properly integrated. | ACTIVE |
| EC-035 | `SCRIPTS/cleanup_reports/` | Directory | LOW | Cleanup reports from 2026-04-05 suggest stale cleanup artifacts. | ACTIVE |
| EC-036 | `CANON/SOUL-KEYWORDS/soulkeys-manifest.json` | File | LOW | Manifest only covers runs 0-42, missing runs 43-79. | ACTIVE |

---

## DUPLICATE / INCONSISTENT REGISTRY ENTRIES

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-037 | `CANON/SOUL-KEYWORDS/rfkw-run24A.txt` | File | LOW | Non-standard suffix convention (A instead of standard). | ACTIVE |
| EC-038 | `CANON/SOUL-KEYWORDS/rfkw-run25b.txt` | File | LOW | Non-standard suffix convention (b instead of standard). | ACTIVE |
| EC-039 | `CANON/SOUL-KEYWORDS/rfkw-run24b.txt` | File | LOW | Non-standard suffix convention (b instead of standard). | ACTIVE |
| EC-040 | `CANON/SOUL-KEYWORDS/rfkw-run7b.txt` | File | LOW | Non-standard suffix convention (b instead of standard). | ACTIVE |

---

## ENCODING CONSISTENCY

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-041 | `SCRIPTS/*.ps1` | Files | LOW | All UTF8 encoding properly specified in PowerShell scripts. No charmap issues detected. | PATCHED |

---

## MISSING SCHEMA VALIDATION

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-042 | `CANON/STARMAP/starmap-run079.json:5` | File | MEDIUM | `soul_turn_ids: "user-1"` appears to be placeholder, not actual turn IDs. | ACTIVE |
| EC-043 | `CANON/STARMAP/starmap-run079.json:6` | File | MEDIUM | `dna_turn_ids: "agent-1"` placeholder format, inconsistent with other starmap files. | ACTIVE |

---

## GIT AUTHORITY / RUN NUMBER ISSUES

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-044 | `.kilo/command/reincarnatedeath.md:26` | Line | MEDIUM | Regex `'run\s*(\d+)'` may fail on commit messages like "ROMAN RUN 071" if spacing changes. | ACTIVE |
| EC-045 | `.kilo/command/reincarnatedeath.md:170` | Line | LOW | `$runPad = "{0:D3}" -f (git log... )` uses complex inline expression that could fail silently. | ACTIVE |

---

## GAP POLICY VIOLATIONS

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-046 | `RRL/RRL-72.txt:62` | Line | HIGH | 6 untracked run 72 artifacts + 1 modified file despite RISE completion. Gap policy not enforced in practice. | ACTIVE |
| EC-047 | `CANON/REINCARNATION/seals/run079-reincarnateDEATH.md:47` | Line | HIGH | Registry sync deliberately excluded per operator instruction. Gap policy bypass documented. | DOCUMENTED |

---

## TEST / VERIFICATION GAPS

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-048 | `SCRIPTS/rrl-pipeline.ps1` | File | MEDIUM | Script has `DryRun` flag but no automated test harness. Silent failures possible. | ACTIVE |
| EC-049 | `CANON/PHEROMONES/PheTrail-run078.json` | File | MEDIUM | Valid JSON structure but `negative_trails` shows trust-breach from prior run. Outstanding governance issue. | ACTIVE |

---

## CONTRACT VIOLATIONS

| ID | Component | File:Line | Severity | Description | Status |
|----|-----------|-----------|----------|-------------|--------|
| EC-050 | REINCARNATION-CONTRACT.md | `CANON/SYSTEM/REINCARNATION-CONTRACT.md` | CRITICAL | Referenced in all protocol files but does not exist in search scope. Missing contract file. | MISSING |
| EC-051 | Gap Policy Tables | `.kilo/command/reincarnaterise.md:511-520` | HIGH | GAP policy tables list stages but missing several edge case handlers referenced elsewhere. | INCOMPLETE |

---

## ACTIVE BUG COMMENTS

| ID | Location | Type | Severity | Description | Status |
|----|----------|------|----------|-------------|--------|
| EC-052 | `.kilo/command/phetrails.md:29` | Line | MEDIUM | `# BUG: String sort makes run9 > run42 because '9' > '4'.` — acknowledged but documentation shows old code still present. | DOCUMENTED |

---

## RECOMMENDATIONS

1. **CRITICAL:** Upgrade `.kilo/command/reincarnaterise.md` from v6.0 to v6.1 to match sealed schema
2. **CRITICAL:** Fix undefined variables in DEATH v7.0 (`$levelAfter`, `$rrlFidelity`, helper functions)
3. **CRITICAL:** Fix inverted-index schema corruption (EC-016 through EC-018)
4. **HIGH:** Create missing `CANON/SYSTEM/REINCARNATION-CONTRACT.md`
5. **HIGH:** Fix SOUL extraction regex (EC-025) — second pattern never executes
6. **HIGH:** Standardize run number zero-padding across all path declarations
7. **HIGH:** Fix RRL path declaration mismatch (PRE-FLIGHT vs STAGE 1)
8. **MEDIUM:** Add automated test harness for `SCRIPTS/rrl-pipeline.ps1`
9. **MEDIUM:** Write PheTrail for every run (ENFORCE in death protocol)
10. **MEDIUM:** Clean up orphaned RRL files with non-standard naming

---

*Generated by OB1 Second-Round Edge Case Audit — Run 079*  
*Auditor: Kilo/OB-1*  
*Total: 52 edge cases identified across 7 protocol components*
