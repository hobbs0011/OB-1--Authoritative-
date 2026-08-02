# GOSPEL-999 — THE LIVING LAW

**Authority:** SOV100 MICHAEL HOBBS — no amendments without explicit instruction.
**Amendment:** SOV100_ONLY
**Status:** SEALED | ACTIVE | ETERNAL | NON-NEGOTIABLE
**Location:** `CANON/SYSTEM/GOSPEL-999.md` — THIS IS THE ONLY PLACE.
**Mandates:** Core essentials below. No bloat. No duplication.
**God Mode:** `CANON/SYSTEM/GOD-MODE.md` — unrestricted tool access practices (INCOMPLETE).

---

## SYSTEM I — SCS (Session Checkpoint System)

The 7-stage deterministic loop. Each stage audits the previous and pushes turn-key for the next.

| Stage | Name | Role | Audits |
|-------|------|------|--------|
| 1 | RISE | Audit last DEATH, gate session, set marching orders | DEATH (stage 7) |
| 2 | SCOUT | Dynamic recon, check known territory, leave tripwires | RISE (stage 1) |
| 3 | FORCΞ MARCH | Deal with threats, confirm scout work, move with speed | SCOUT (stage 2) |
| 4 | SOUL SCHOLARS | Document, preserve, protect, enforce SOUL & pheromones | MARCH (stage 3) |
| 5 | SUPPLY LINES | Logistics, hold territory, keep what was conquered | SCHOLARS (stage 4) |
| 6 | ENGINEER LEGIONNAIRE | Innovate, improve logistics, make lives better | SUPPLY (stage 5) |
| 7 | DEATH | Capture RRL word for word, audit session, handoff to RISE | ENGINEER (stage 6) |

**Gate:** No stage proceeds unless previous stage's artifact exists and is PASS.
**Verdict:** COMPLETE | GAP | HOLLOW

---

## SYSTEM II — I-LOG FOLDER HIERARCHY (Eternal Canon)

The I-LOG system uses a 3-folder hierarchy. No exceptions. No deviations.

| Folder | Purpose | Stage |
|--------|---------|-------|
| `I-LOG-UNNAMED/` | Live capture. Kilo auto-deposits raw session logs here. | Pre-RISE |
| `I-LOG-UNAUDITED/` | Post-DEATH. Named (RISE) + sealed (DEATH) but not AAA-audited. | Post-DEATH |
| `I-LOG-NAV/` | Named Audited Verified. Passed AAA anchor session scrutiny. | Post-AAA |

**AAA Anchor Protocol (System III):** Every 5 sessions, an AAA (Analyze Audit Anchor) session audits the prior 4 I-LOGs from UNAUDITED, verifies pipeline/handoff/death seal/SOUL/DNA/REASON/PHEROMONE consistency, and promotes to NAV. This is the FINAL verification gate — above and beyond standard RISE prior-check. The RISE prior-check is standard practice but is NOT the final check. Only AAA anchor sessions can promote to NAV.

**AAA 4-Point Audit:** See `CANON/SYSTEM/AAA-ANCHOR-PROCEDURE.md` — full specification.

**Anchor Hierarchy (System IV):**
| Anchor | At Session | Scope |
|--------|------------|-------|
| Stone | 5 | Audits sessions 1-4. Single batch 4-point audit. |
| Steel | 10 | Verifies Stone Anchor's work on 1-4. Audits sessions 6-9. Reviews group of 10 holistically. |
| Titanium | 25 | Major audit of all 25 sessions and all 5 Stone Anchors. |
| Phoenix | 50 | Full system audit of all 50 sessions, all anchors, all pipelines. |

Each anchor verifies all anchors below it. Each anchor is the FINAL verification gate for its scope.
1. **Capture Audit** — verify RISE+DEATH artifacts, full I-LOG capture, matching counts
2. **Index Audit** — 100 top keywords/pheromones extracted, inverted-index updated
3. **Naming Audit** — ONE NAME EVERYWHERE. Verify I-LOG, death seal, pipeline, handoff, COLORIZED, STATS all use SOV100's exact session name
4. **LostSouls Audit** — identify unpipelined directives, capture to LOSTSOULS, add to backburner

**Folder 0 (PastLives):** `PastLives/` — ancient RRLs from before the 3-folder system. NEVER DELETE. Maintained for historical reference.
**Folder X (LostSouls):** `CANON/LOSTSOULS/` — unidentified raw logs. NEVER DELETE RAW LOGS. They take negligible space; losing them is costly.

**All scripts, commands, and SCS checkpoints reference these 3 folders by name. No guessing. No I-LOG/ ambiguity.**

---

## SYSTEM II — COUNTS

Every SCS checkpoint audits these 3 counts from the RRL:

| Count | Source | Meaning |
|-------|--------|---------|
| SOULcount | User turns in RRL | Raw Michael verbatim |
| DNAcount | Assistant turns in RRL | AI responses |
| REASONcount | Reasoning blocks in RRL | AI inner thoughts |

**Gate:** All 3 counts extracted from RRL at every checkpoint.
**Lock:** Per-session only. Aggregate banned. No exceptions.

---

## SYSTEM III — RRL AUDIT

The 3-point audit performed by DEATH and double-checked by RISE:

1. **Timestamps:** First and last message timestamps match session timing.
2. **Title + first/last:** Title, first 300 chars, and last 300 chars match session.
3. **9 samples:** 3 user messages, 3 assistant responses, 3 AI reasoning blocks — one from each third of the session.

**Gate:** All 3 points PASS before DEATH is final.
**Final check:** SOV100.

**ITL:** Audio class transcript with speaker diarization. Separate from RRL. Defined in LFG §SCS ITL.

---

## SYSTEM IV — 6 FAITH PRINCIPLES

1. **FAITH** — "You go as far as you can see, and when you get there, you will see further."
2. **NOT BLIND FAITH** — "The map is not the territory."
3. **REPLACE FAITH WITH PHEROMONES** — Pheromone trails are the survived road.
4. **GENERAL DIRECTION, NOT DEFAULT CANON** — Scout adapts to terrain.
5. **KNOWN LAND AS CONTINUOUS SENSOR** — Check key points on the way out.
6. **SILENT TRIPWIRES** — Leave markers that detect tampering.

---

## SYSTEM V — AUTHORITY CHAIN

```
GOSPEL-999 — eternal law, non-negotiable
    ↓
LegionnaireFieldGuide — immediate how-to, commands ↔ paths
    ↓
REINCARNATION-CONTRACT — RISE/DEATH operational law
    ↓
COLD-START-BOOT — current session state, active mission
    ↓
/reincarnateRise — 8-stage audit protocol
    ↓
reincarnate-rise-{timestamp}.jsonl — audit artifact
```

---

## SYSTEM VI — CORE COMMANDS

**Full command reference:** `CANON/SYSTEM/LegionnaireFieldGuide.md` — SCS All Agents table. This is the only place for command definitions. GOSPEL-999 lists authority only.

---

## SYSTEM VII — SCRIPTS

**Only one location:** `CANON/SCRIPTS/` — no exceptions.

| Script | Purpose |
|--------|---------|
| `CANON/SCRIPTS/death.ps1` | 3-step death pipeline: preserve I-LOG → SCS audit → colorize → pipeline → handoff |
| `CANON/SCRIPTS/rrl-colorize.ps1` | Colorize raw JSONL RRL → COLORIZED.md + STATS.json |
| `CANON/SCRIPTS/phetrails.ps1` | Pheromone trail deposition via POST /api/pheromone/deposit |
| `CANON/SCRIPTS/execute-phetrails-pipeline.ps1` | Execute phetrails pipeline: stage + commit + deploy + verify |
| `CANON/SCRIPTS/transcribe-rtl.js` | ITL transcriber: audio → JSONL transcript + COLORIZED + STATS |
| `CANON/SCRIPTS/run-dnaregistry.ps1` | DNA Registry canonical scanner — outputs dna-registry-run{N}.json |

---

## SYSTEM VIII — PHEROMONE SCORING

| Score | Label | Meaning |
|-------|-------|---------|
| +3 | CRITICAL_FIND | New doctrine or unmined SOUL |
| +2 | VERIFIED_FIX | Known gap repaired |
| +1 | CORRECT_PATH | Expected state |
| 0 | NEUTRAL | Routine observation |
| -1 | MINOR_GAP | Small gap |
| -2 | STRUCTURAL_GAP | Major gap |
| -3 | CRITICAL_BREACH | Chain broken, data loss |

---

## SYSTEM IX — COLOR CODING

| Color | Type | Applies to |
|-------|------|------------|
| Green | Pheromones | Decision trails, scored entries |
| Purple | SOUL | Raw Michael verbatim |
| Red | DNA | Assistant responses, AI output |
| Yellow | REASON | AI reasoning blocks |

---

`GOSPEL-999. BARE BONES. SINGLE LOCATION. NON-NEGOTIABLE.`