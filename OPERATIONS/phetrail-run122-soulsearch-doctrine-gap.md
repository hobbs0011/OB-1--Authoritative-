# PHEROMONE TRAIL — SOULSEARCH DOCTRINE GAP REINFORCEMENT
**Run 122 | 2026-06-13 | Append-only doctrine index gap**
**Strength: 94/100** | Connects to: `phetrail-phase0-runA.md`, `phetrail-phase0-runCtoV.md`, `phetrail-batch-run120-scout.md`

---

## BROKEN TOOL

`OPERATIONS/phetrail-phase0-runA.md:21-25`

SoulSearch is broken for doctrine vocabulary because `inverted-index.json` lacks core Roman/Agent99 terms.

Missing terms include:

- `exploratores`
- `speculatores`
- `agmen`
- `antecores`
- `praesidia`
- `limitanei`
- `comitatenses`
- `veterani`
- `drones`
- `agent99`
- `modus operandi`
- `teachability`
- `flag and tag`
- `supply lines`
- `"go as far as you can see"`
- `horizon principle`
- `phase 0`
- `roman legion`

`OPERATIONS/phetrail-phase0-runCtoV.md:19-23`

The tool cannot locate the doctrine vocabulary domain because step 1 depends on the inverted index.

---

## STRUCTURAL FINDING

`OPERATIONS/phetrail-phase0-runCtoV.md:52-66`

BGE-m3 Vectorize path is the structural fix because it can retrieve semantic doctrine fragments even when exact tokens are absent from the keyword index.

Priority ingest targets:

- GOSPEL-999,
- BIBLE-CH08,
- EXPLORATORES-SCOUT-DOCTRINE.md,
- S2PIPELINE-ROMAN-LEGION-NAMING.md.

`OPERATIONS/phetrail-batch-run120-scout.md:59-69`

Two unknowns remain:

- deployment failure corpus location,
- `PHOENIX_SINGULARITY_V100.js` seed file location.

---

## NEGATIVE TRAIL

Do not use contaminated scout output.

`OPERATIONS/phetrail-phase0-runCtoV.md:79-81`

`CANON/PIPELINE/phase0-scout-B-K.json` is flagged as counterfeit batch output from premature Run B-K firing. Do not use it.

---

## CONNECTING KEYWORDS

`SoulSearch broken` → `inverted-index missing doctrine` → `BGE-m3 Vectorize ingest`

`GOSPEL-999` → `BIBLE-CH08` → `Agent99 law` → `semantic recall`

`Deployment Failure Corpus` → `8 past rollout failures` → `regression barriers`

`PHOENIX_SINGULARITY_V100.js` → `seed file not found` → `highest unknown`
