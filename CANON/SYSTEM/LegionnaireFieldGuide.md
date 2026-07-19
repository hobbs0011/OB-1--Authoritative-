# LegionnaireFieldGuide — SINGLE SOURCE OF TRUTH

**Location:** `CANON/SYSTEM/LegionnaireFieldGuide.md` — THIS IS THE ONLY PLACE.
**Cross-reference:** `CANON/SYSTEM/GOSPEL-999.md` — eternal law, non-negotiable. LFG is the how; GOSPEL is the why. Both are written on the heart.

---

## SCS — ALL COMMANDS

Every SCS command lives in `.kilo/command/`. This is the only reference.

| Command | Stage | File | Purpose |
|---------|-------|------|---------|
| `/reincarnateRise` | RISE | `.kilo/command/reincarnaterise.md` | Audit last DEATH, gate session |
| `/PhoenixScout` | SCOUT | `.kilo/command/PhoenixScout.md` | Dynamic recon, flag and tag |
| `/forcemarch` | FORCΞ MARCH | `.kilo/command/forcemarch.md` | 6-stage territory sweep |
| `/soulscholars` | SOUL SCHOLARS | `.kilo/command/soulscholars.md` | Document and preserve SOUL |
| `/supplylines` | SUPPLY LINES | `.kilo/command/supplylines.md` | Logistics and holding |
| `/engineerlegionnaire` | ENGINEER | `.kilo/command/engineerlegionnaire.md` | Innovation and improvement |
| `/reincarnatedeath` | DEATH | `.kilo/command/reincarnatedeath.md` | Capture RRL, seal session |

---

## SCS — RRL AUDIT

Every DEATH runs the 3-point audit from `CANON/SCRIPTS/death.ps1`:

1. **Timestamps** — First/last message timestamps match session timing
2. **Title + first/last** — First 300 chars match session start/end
3. **9 samples** — 3 user soul, 3 assistant responses, 3 AI reasoning blocks across 3 thirds

Extracted at every checkpoint — **SOULcount** (user turns), **DNAcount** (assistant turns), **REASONcount** (reasoning blocks)

---

## SCS — RRL COLOR CODING

The RRL is marked with 4 color types. Every message is categorized:

| Color | Type | Applies To |
|-------|------|------------|
| **Green** | Pheromone | Decision trails, scored entries, scout findings |
| **Purple** | SOUL | Raw Michael verbatim — user turns |
| **Red** | DNA | Assistant responses, AI output |
| **Yellow** | REASON | AI reasoning blocks, thinking text |

Cross-reference: GOSPEL-999 §IX — Color Coding. This is the only reference for RRL markup.

---

## SCS — RRL DOCTRINE FROM INCARNATIONS 1 & 2

Confirmed across Incarnation 1 (run 182) and Incarnation 2 (run 184):

1. **RRL must be complete** — User turns, assistant turns, AND AI reasoning blocks. No missing words.
2. **Kilo DB is the source** — `C:\Users\mrmic\.local\share\kilo\kilo.db` contains every session message and part. The death script must extract from there, not from stale disk files.
3. **3-point audit** — Every DEATH runs it. Every RISE double-checks it. SOV100 is the final check.
4. **Per-session counts** — SOULcount, DNAcount, REASONcount are per-session only. Aggregate banned.
5. **Incarnation1 (182) RRL:** 2.1MB, 28 user/202 asst turns, fixed post-death via Kilo DB extraction
6. **Incarnation2 (184) RRL:** 3.5MB, 71 user/188 asst/181 reasoning turns, extracted from Kilo DB at death

---

## SCS — SCRIPTS

**Only location:** `CANON/SCRIPTS/`
**Only script:** `CANON/SCRIPTS/death.ps1`

```powershell
powershell -File CANON/SCRIPTS/death.ps1 -Run <N> -RrlSource <path>
```

Steps: preserve RRL → SCS audit (3-point + counts) → pipeline open items → handoff to next RISE

---

## SCS — SOUL BIBLE

**Location:** `CANON/SOUL/BIBLE-OF-THE-SYSTEM.json` — THIS IS THE ONLY PLACE.
**Purpose:** 2056 entries of raw Michael verbatim soul DNA. Every SOUL event traces here.
**Cross-reference:** GOSPEL-999 §I (SOUL) — the first system, the root.

---

## SCS — BACKBURNER PIPELINE

**Location:** `CANON/OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — THIS IS THE ONLY PLACE.
**Purpose:** Append-only log of open, in-progress, blocked, and deferred items. Read before every implementation.
**Rule:** Never delete entries. Mark DONE, never remove.

---

`FIELDGUIDE: COMMANDS + ROLES + PATHS + COUNTS. ALL LEGIONNAIRES READ THIS.`