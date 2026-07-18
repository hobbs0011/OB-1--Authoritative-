---
description: "RISE PROTOCOL v7.0 — 8-STAGE READ-ONLY AUDIT. Audits prior DEATH seal and pipeline fidelity. Never auto-fixes. Local-first. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
agent: AGENT99
---

# /reincarnateRise — v7.0 ROMAN RISE

**OB1 = AUDITOR. Reads what DEATH wrote. Never auto-fixes. Never executes production code.**

**Authority hierarchy:**
1. `CANON/SYSTEM/GOSPEL-999.md` + Parts 2/3 — ultimate authority, 999 mandates, eternal law
2. `.kilo/skills/LegionnaireFieldGuide.md` — immediate AI-facing field guide, single source of truth for commands/skills/paths
3. `CANON/SYSTEM/REINCARNATION-CONTRACT.md` — operational contract for RISE/DEATH
4. `CANON/SYSTEM/COLD-START-BOOT.md` — session state and active mission
5. `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — open deferred items, never open new threads while backburner is ignored
6. This command (`reincarnaterise.md`) — read-only audit protocol

**Canonical contract:** `CANON/SYSTEM/REINCARNATION-CONTRACT.md`
**Run authority:** `git log --oneline --grep "^death:"`
**Script:** `SCRIPTS/reincarnate-rise.ps1`
**Command:** `obi.ps1 reincarnateRise [OutFile] [-DryRun]`

---

## Authority Chain (do not scatter)

```
GOSPEL-999 ( Parts 1-3) — eternal law, 999 mandates
    ↓
LegionnaireFieldGuide.md — immediate how-to, commands ↔ skills ↔ paths
    ↓
REINCARNATION-CONTRACT.md — RISE/DEATH operational law
    ↓
COLD-START-BOOT.md — current session state, active mission, flags
    ↓
/reincarnateRise — 8-stage audit protocol
    ↓
reincarnate-rise-{timestamp}.jsonl — audit artifact
```

**RISE never overrides GOSPEL-999. RISE never invents new commands not in LFG. RISE never executes fixes not prescribed by DEATH.**

---

## What It Does

RISE performs an 8-stage read-only audit of the prior DEATH seal and full Pipeline Hatchery chain. It audits gaps, drift, and staleness. It does NOT execute fixes. Execution = DEATH territory.

RISE findings are NOT executed inline. They are appended as `BB-RISE-*` entries to `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` with a pheromone `SIGNAL` in the range `-10 .. +110`. A defect without a backburner entry is ignored.

## When to Use

- At session start, before any DEATH execution
- After `/reincarnateDeath` to verify the seal was written correctly
- When `obi.ps1 doctor` reports pipeline gaps
- Whenever BOOT drift or SOULCOUNT stagnation is suspected

## Mandatory Pre-Audit (RUN 182+ Standard)

Before any fidelity gate or gap call, RISE must:
1. Identify the prior DEATH seal by run number from `git log --oneline --grep "^death:"`.
2. Read that seal's recorded RRL path and verify the on-disk transcript is **complete** — not a single word missing, including AI reasoning and thinking text.
3. If the command spec, script, or audit output does not reference the prior DEATH run or RRL completeness, treat that as a **MISSING mandate** and append a `BB-RISE-MANDATE` entry to `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` before proceeding.

---

## Quick Invoke

```powershell
# Full audit, default report path
/obi reincarnateRise

# Custom report path
/obi reincarnateRise OPERATIONS/rise-run146.jsonl

# Dry run
/obi reincarnateRise -DryRun
```

---

## Protocol

```
I.  SOULCOUNT GATE       — query live SOUL count; detect KILO_HOLLOW session
II. GIT TRUTH            — derive run from last death commit
III. TRIPLE READ         — read prior seal, phetrail, BOOT
IV. SOUL AUDIT           — stagnation + drift + regression check
V.  BOOT + STALENESS     — BOOT drift vs git, active mission, flags
VI. AUTHORITY CHECK      — LFG + GOSPEL-999 present and REAL
VII. PIPELINE FIDELITY   — RRL, SOUL, DNA, LEDGER, STARMAP, SOULKEYS, S2Pipeline
VIII. PHETRAIL           — negative trail count
IX.  RISE REPORT         — JSONL artifact with verdicts and next action
```

---

## Fidelity Gate

| Stage | REAL = present/valid | HOLLOW/MISSING = absent/invalid |
|-------|----------------------|--------------------------------|
| LFG | `.kilo/skills/LegionnaireFieldGuide.md` exists | missing |
| GOSPEL | `GOSPEL-999.md` + Part2 + Part3 exist | missing |
| RRL | > 50KB + user + assistant turns | < 5KB or one-sided |
| SOUL | count_after > prior, event_id valid | delta=0 or regression |
| DNA | assistant turns + blueprints | MISSING or 0 records |
| LEDGER | HL-{N}.json exists + merkle_hash | missing |
| STARMAP | starmap-run{N}.json exists | missing |
| SOULKEYS | inverted-index.json populated | empty |
| S2Pipeline | pipeline-run{N}.json exists | missing |

**KILO_HOLLOW:** session without local JSONL transcript. RISE continues but marks stages as MISSING.

**Authority gate:** LFG and GOSPEL-999 must be REAL for any downstream stage to be considered valid.

---

## RISE Laws

- **L29 NO_ASSUME_HEAD** — `git log -1` is authoritative
- **L30 BOOT_FILE_AGE_SWEEP** — fires at ANY mismatch
- **L31 SOUL_IS_QUERY** — soulcount = `SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'`
- **L32 ASSUME_FAILURE** — assume prior checkpoint failed; cross-validate with 3 receipts
- **CONFIRM_DONT_FIX** — RISE audits. DEATH executes. Never reverse.

---

## Output

`reincarnate-rise-{timestamp}.jsonl` in `OPERATIONS/` or custom `-OutFile` path. Contains 8-stage audit with verdicts, fidelity map, and next action.

---

`RISE v7.0: 8-STAGE AUDIT. IDENTIFY GAPS. DO NOT EXECUTE.`
