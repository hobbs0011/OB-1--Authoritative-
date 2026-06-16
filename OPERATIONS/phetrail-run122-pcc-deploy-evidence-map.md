# PHEROMONE TRAIL — PCC DEPLOY EVIDENCE MAP
**Run 122 | 2026-06-13 | Append-only PCC evidence separation**
**Strength: 91/100** | Connects to: `phetrail-run122-audit-deploy.md`, `phetrail-run122-pcc-stack-recheck.md`, `phetrail-run122-pcc-identity-map.md`, `phetrail-run122-forceawareness-rename-map.md`

---

## EVIDENCE SEPARATION

`OPERATIONS/phetrail-run122-audit-deploy.md:30-42`

- net-pet-ai deploy succeeded.
- Architecti deploy failed on class ordering.
- PCC1 deploy failed on migration v2.

`OPERATIONS/phetrail-run122-pcc2-deadlock.md:24-39`

- PCC2 deadlock is CF migration metadata, not source syntax.

`OPERATIONS/phetrail-run122-pcc-stack-recheck.md:13-15`

- Dry-run passes for PCC1/PCC2/Architecti.
- Dry-run does not prove production deploy.
- Fresh production deploy or Dashboard inspection is needed.

---

## IDENTITY SEPARATION

`OPERATIONS/phetrail-run117-heart-of-claude.md:173-179`

- Run 117: PCC2 Student, PCC3 Ops, Architecti Orchestrator.

`APPS/PHOENIX-PCC-2/src/index.js:2`

- Current source: PCC2 Ops Task Fleet.

This is timeline separation, not overwrite.

---

## NEGATIVE TRAIL

Do not collapse history, source, dry-run, and production deploy into one claim.

---

## CONNECTING KEYWORDS

`history` → `source` → `dry-run` → `production deploy`

`Run 117 PCC2` → `Student Fleet` → `current PCC2 source` → `Ops Fleet`

`WatchdogAlarm` → `ForceAwarenessAlarm` → `CF metadata` → `Dashboard cleanup`
