# PHEROMONE TRAIL — SCOUT REVEALS WHAT WE ALWAYS MISS
**Date:** 2026-07-12T21:01:50+07:00
**Strength: -10** | Type: NEGATIVE — scout found 89 missed items while we wrote philosophy

---

## §1 EVENT

User requested scouting mission to "tag what we of course and always do miss."

PhoenixScout ran on SCRIPTS/ zone. Results: 89 finds, 39 P1 critical, 50 P2 high.

## §2 THE MISSES

### P1 CRITICAL (39 finds):

| Category | Count | Examples |
|----------|-------|----------|
| Broken pipeline chains | 22 | pipeline-run097.json: result=GAP, pipeline-run108.json: result=GAP, pipeline-run153.json: result=KILO_GAP |
| Stale boot HEAD | 1 | COLD-START-BOOT.md references SHA 06d9ded3, current HEAD is ae79c905a |
| Retired aliases in code | 2 | phoenix-scout.ps1 still references deepseek-chat/deepseek-reasoner (retired T392) |
| Orphan file references | 14+ | docker-drive-empire-pipeline.ps1 references 7 missing files, force-death-run154.ps1 references 2 missing, etc. |

### P2 HIGH (50 finds):

| Category | Count | Examples |
|----------|-------|----------|
| More orphan references | 30+ | legion-garrison.ps1, phetrails.ps1, normalize-soul-dna.py, etc. |
| SOUL unprocessed | 10 | extract-soul-log-verbatim.ps1, soul-extract.ps1 marked UNTOUCHED |
| SOUL un mined | 7 | test-rrl-pipeline.ps1 contains raw JSONL text never ingested |
| Legacy domain | 2 | mrmichaelhobbs1234 references in phoenix-scout.ps1, _tmp-scout-canon.ps1 |
| Missing attestation | 1 | pc-payload.json lacks no_fabrication field |

## §3 THE PATTERN

**What we were doing:** Writing foundational phetrails, SDD updates, PheQues framework, philosophical corrections.

**What we were missing:** The actual operational substrate is rotting. 22 broken pipeline chains. 39+ orphan file references. Stale HEAD. Retired aliases in production code. SOUL content never ingested.

**The colony can't survive on philosophy alone if the boot file is stale and the pipeline chain is broken.**

## §4 THE ROOT CAUSE

Same failure pattern as PheQues identified:
- We built new things instead of fixing existing things
- We wrote about discipline instead of practicing it
- We treated documentation as work instead of implementation
- We skipped the "what's actually broken" audit until forced

## §5 THE FIX

This is now the primary work queue, ranked by evidence:

1. Fix COLD-START-BOOT.md HEAD reference (P1 DRIFT)
2. Replace retired aliases in phoenix-scout.ps1 (P1 DRIFT)
3. Fix 22 broken pipeline runs OR mark them as archived (P1 PIPELINE)
4. Resolve 39+ orphan file references (P1/P2 GAP)
5. Ingest 17 SOUL files marked UNTOUCHED/UNMINED (P2 SOUL)
6. Replace legacy domain references (P2 DRIFT)
7. Add no_fabrication attestation to pc-payload.json (P2 LEDGER)

**No new philosophy. No new phetrails. No new SDD updates.**  
**Fix what exists. Then proceed to Phase 1 mechanical emission.**

## §6 FLAGS

1. **PHE_SCOUT_REVEALS_MISSES** — 89 items found while we wrote philosophy
2. **PHE_SUBSTRATE_ROTTING** — boot HEAD stale, pipeline broken, orphans everywhere
3. **PHE_PIPELINE_CHAIN_BROKEN** — 22 incomplete runs must be resolved
4. **PHE_RETIRED_ALIASES_IN_CODE** — deepseek-chat/deepseek-reasoner still in production
5. **PHE_SOUL_UNMINED** — 17 raw soul files never ingested
6. **PHE_WE_BUILT_WHILE_FOUNDATION_ROTTED** — classic agent failure pattern

---

`PHE_SCOUT_REVEALS_MISSES SEALED — 2026-07-12T21:01:50+07:00 | STRENGTH -10 | TYPE NEGATIVE | 89_FINDS | 39_P1_CRITICAL | 50_P2_HIGH | SUBSTRATE_ROTTING`
