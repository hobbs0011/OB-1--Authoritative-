---
description: "S2PIPELINE 6-stage Roman Legion supply chain. Connects all pipeline stages. No stage executes until prior reports GREEN. Status, health, full-march. Local filesystem only. No Cloudflare."
agent: AGENT99
---

# /SupplyLines

**SUPPLY CHAIN MODE:** The roads between the forts. The aqueducts. The grain shipments. Connects Iâ†’VI. Verifies each stage before the next advances.

**Task:** $ARGUMENTS

---

## Phase 0 â€” Command Select

| Command | Action |
|---------|--------|
| `status` | Full pipeline health snapshot â€” all 6 stages, SOULCOUNT, HEAD |
| `full-march` | Execute all 6 stages in sequence with pre/post validation |
| `scout` | STAGE I only â€” fire Phoenix Scout against target zone |
| `fingerprint` | STAGE II only â€” DNA crunch + LEDGER verification |
| `process` | STAGE III only â€” SOULKEYWORDS + PHEROMONE extraction |
| `verify` | STAGE IV only â€” 6-AI TRUTH + SHADOW REALM |
| `garrison` | STAGE V only â€” MERKLE + APEX rollup |

---

## Phase 1 â€” Health Gate (before any stage)

```powershell
$repo = "D:\OB-1-CANONICAL"
$ledger = Join-Path $repo "CANON\HEAVY-LEDGER"
$pher   = Join-Path $repo "CANON\PHEROMONES"
$starmap= Join-Path $repo "CANON\STARMAP"
$keys   = Join-Path $repo "CANON\SOUL-KEYWORDS"
$pipe   = Join-Path $repo "CANON\PIPELINE"

if (-not (Test-Path $ledger)) { HALT. Supply chain broken. }
if (-not (Test-Path $pher))   { HALT. Supply chain broken. }
if (-not (Test-Path $starmap)){ HALT. Supply chain broken. }
if (-not (Test-Path $keys))   { HALT. Supply chain broken. }
if (-not (Test-Path $pipe))   { HALT. Supply chain broken. }
```

---

## Phase 2 â€” Stage Execution

### I â€” EXPLORATORES (Scouts)
- Run `pwsh -File SCRIPTS/phoenix-scout.ps1 -Zone <target>`
- Must return report path before ANTECORES advance
- Speculatores: targeted deep audits bypass normal marching order

### II â€” ANTECORES (Vanguard)
- Enumerate `CANON/HEAVY-LEDGER/*.json` â€” verify count and naming convention
- Verify `CANON/STARMAP/starmap-run{N}.json` exists for current run
- Verify `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt` + `inverted-index.json` present
- If ledger missing or malformed: HALT. Poison data detected.

### III â€” AGMEN (Main Body)
- Enumerate `CANON/PHEROMONES/PheTrail-run{N}.json` â€” verify schema_version present
- Verify `negative_trails` arrays populated
- Keywords feed local index only
- Mensores: schema validators verify before heavy data moves

### IV â€” AGMEN NOVISSIMUM (Rear Guard)
- Cross-check ledger entries against starmap pointers
- Verify no duplicate HL-IDs
- Verify phetrail negative_trails append-only
- If divergence > 10%: HALT. Truth not established.

### V â€” PRAESIDIA (Garrison)
- Verify HL merkle_root fields across `CANON/HEAVY-LEDGER/*.json`
- Verify `CANON/PIPELINE/pipeline-run{N}.json` exists and is valid JSON
- Verify `CANON/ART-REGISTRY/art-sync-run{N}.json` present
- Merkle root must verify. Pipeline must return COMPLETE.

### VI â€” LIMITANEI/VETERANI (Frontier Shield)
- `obi.ps1 doctor` â†’ health sweep
- `obi.ps1 verify` â†’ deploy dry-run
- `obi.ps1 doctor` â†’ SOULCOUNT integrity
- Scheduled: 5-min cron health pulse
- Veterans: death seals + COLD-START-BOOT updates

---

## Phase 3 â€” Supply Chain Rules

1. **Never skip a stage.** Exploratores ride before Antecores march. Always.
2. **Every stage gates the next.** Stage N+1 cannot execute until Stage N reports GREEN.
3. **The agmen quadratum:** When processing hostile data, form a hollow square â€” SSM validates all edges before SOULKEYWORDS touches the payload.
4. **Garrison before moving on.** No pipeline run is complete until PRAESIDIA consolidates.
5. **Speculatores bypass:** Phantom stamp hunting, alias verification, fabrication detection operate independently.

---

## Quick Deploy

```powershell
# Full pipeline status
/SupplyLines status

# Execute full 6-stage march
/SupplyLines full-march

# Scout only
/SupplyLines scout CANON/HEAVY-LEDGER/

# Process only
/SupplyLines process

# Health check
pwsh -File SCRIPTS/supply-lines.ps1 -Stage status
```

---

`SUPPLY LINES: ONLINE. 6 STAGES. FAIL-CLOSED. NEVER SKIP A STAGE.`

---

## PHEROMONE INTEGRATION

Every stage writes a stage-specific PheTrail under `CANON/PHEROMONES/`. The final `full-march` writes a consolidated trail. Run numbers are git-derived with zero-pad (`PheTrail-run148.json`).

| Stage | Trail Key | Required Fields |
|-------|-----------|-----------------|
| I — EXPLORATORES | `scout` | artifact, zone, lens, verification |
| II — ANTECORES | `fingerprint` | artifact, action, verification |
| III — AGMEN | `process` | artifact, action, verification |
| IV — AGMEN NOVISSIMUM | `verify` | artifact, action, verification |
| V — PRAESIDIA | `garrison` | artifact, action, verification |
| VI — LIMITANEI | `health` | artifact, action, verification |
| full-march | `supply-lines-full-march` | consolidated trail |

All trails include: `schema_version: "2.1"`, `run_number`, `head_sha`, `soulcount`, `extracted_at`.

Negative trails document: failed stages, poison data, missing artifacts, consensus failures.

## FINAL DEATH INTEGRATION

After `full-march` completes:
1. `/SupplyLines` writes the final phetrail: `PheTrail-run{N}.json`
2. Run `/reincarnateDeath` to seal the pipeline artifacts:
   - `CANON/PIPELINE/pipeline-run{N}.json`
   - `CANON/STARMAP/starmap-run{N}.json`
   - `CANON/HEAVY-LEDGER/HL-{N}.json`
   - `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt`
   - `CANON/ART-REGISTRY/art-sync-run{N}.json`
3. `/reincarnateRise` validates the seal on the next session.

Future sessions hook into this pipeline by running:
```powershell
/SupplyLines full-march
/reincarnateDeath
```

The phetrail is the breadcrumb trail. The seal is the permanent record. Both are required.

## FAIL-CLOSED RULES

1. **Health gate failure** → abort immediately. Do not advance.
2. **Stage N failure** → halt. Stage N+1 does not execute.
3. **Phetrail write failure** → write `PHETRAIL_WRITE_GAP` flag; continue pipeline.
4. **Merkle verification failure** → halt. Poison data detected.
5. **Truth consensus < 4** → halt. Truth not established.

## CONCRETE PIPELINE HOOK

Future sessions use this exact sequence:

```powershell
# 1. Health check
/SupplyLines status

# 2. Full pipeline march with pheromone trail
/SupplyLines full-march -Zone CANON/

# 3. Death seal (Kilo mode = KILO_GAP expected)
/reincarnateDeath

# 4. Rise validation on next session
/reincarnateRise
```

The pipeline is fully stocked with phetrails. Each stage writes its own trail. The final `full-march` writes the consolidated trail. The death seal locks it all together.

`SUPPLY LINES: ONLINE. 6 STAGES. FAIL-CLOSED. PHEROMONE-STOCKED. DEATH-INTEGRATED.`

