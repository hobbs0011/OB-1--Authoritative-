# PHEROMONE TRAIL — PCC IDENTITY MAP: RUN 117 VS CURRENT SOURCE
**Run 122 | 2026-06-13 | Append-only identity reconciliation**
**Strength: 90/100** | Connects to: `phetrail-run117-heart-of-claude.md`, `phetrail-pcc1-obi-full.md`, `phetrail-orchestrate.md`

---

## WHAT IS RECONCILED

The PCC identity map changed between Run 117 and the current working tree.

### Run 117 map

`OPERATIONS/phetrail-run117-heart-of-claude.md:173-179`

- `phoenix-pcc-2` = Student Fleet / PCC-Student.
- `phoenix-pcc-3` = Ops Fleet / PCC-Ops.
- `phoenix-architecti` = Orchestrator / PCC-Arch.

### Current source map

`APPS/phoenix-pcc-1/src/index.js:7-14`

- `phoenix-pcc-1` source is Student Fleet:
  - `mai-tram-bluetech`
  - `huong-bluetech`
  - `sov100-michael`
  - `sov100-test-magic`
  - `net-student-next`

`APPS/PHOENIX-PCC-2/src/index.js:2`

- `phoenix-pcc-2` source header says: `PHOENIX-PCC-2 — Ops Task Fleet Commander (PCC2 / Anakin)`.

`APPS/PHOENIX-PCC-2/src/index.js:356-361`

- PCC2 exposes Ops tasks:
  - `translate`
  - `lostsoul-scan`
  - `completeness-audit`
  - `pattern-scan`
  - `brief-scan`

---

## INTERPRETATION

This is not a contradiction if the working tree contains a later handoff after Run 117.

The correct timeline-aware statement is:

- Run 117 phetrail records the old/live architecture.
- Current source records a later intended architecture.
- The old trail must not be overwritten because it proves what was deployed/true at Run 117.
- The new trail must not overwrite the old trail; it should record the new source state and the gap between history and working tree.

---

## PCC1 STATUS

`OPERATIONS/phetrail-pcc1-obi-full.md:10-14`

- PCC1 endpoints and student fleet are confirmed in phetrail.
- Current source agrees.
- PCC1 remains student-facing.

`APPS/phoenix-pcc-1/src/index.js:261-267`

- `/api/status` returns `STUDENT_FLEET`.
- `/api/run-fleet` runs student actualizers.

---

## PCC2 STATUS

`APPS/PHOENIX-PCC-2/src/index.js:356-361`

- Current PCC2 source is Ops-facing.
- This conflicts with Run 117, where PCC2 was Student Fleet.
- That means either:
  1. PCC2 was later converted from Student to Ops, or
  2. current working tree contains an intended change not yet proven live.

This trail does not claim production identity; it records source identity only.

---

## ARCHITECTI STATUS

`APPS/PHOENIX-ARCHITECTI/wrangler.toml:29-39`

- Architecti has service bindings to both `phoenix-pcc-1` and `phoenix-pcc-2`.

`OPERATIONS/phetrail-orchestrate.md:7-15`

- Orchestrate classifies BB tasks:
  - student sources → PCC1
  - ops sources → PCC2
  - default → PCC2

`OPERATIONS/phetrail-orchestrate.md:22-27`

- Orchestrate only routes to PCC1 + PCC2.
- Architecti/Windu is not a dispatch target in the routing table.

---

## NEGATIVE TRAIL

Do not collapse all PCC identities into one timeline.

Incorrect:

- `PCC2 has always been Ops`.
- `PCC1 is the only student PCC because the current source says so`.
- `Run 117 is wrong because current source differs`.

Correct:

- `Run 117 is historical evidence.`
- `Current source is current working-tree evidence.`
- `A production identity claim requires live fetch or deploy verification, not either source alone.`

---

## CONNECTING KEYWORDS

`Run 117 PCC2` → `Student Fleet` → `current PCC2 source` → `Ops Task Fleet` → `identity changed after handoff`

`PCC1` → `student actualizers` → `/api/run-fleet` → `student fleet confirmed`

`Architecti` → `PCC1_SVC + PCC2_SVC` → `orchestrate routes PCC1/PCC2 only` → `Windu not dispatch target`
