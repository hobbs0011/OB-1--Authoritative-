# PHEROMONE TRAIL — PCC STACK RECHECK: PLAN VS EVIDENCE
**Run 122 | 2026-06-13 | Re-read phetrails + local validation after Michael challenged the deploy-blocker conclusion**
**Strength: 92/100** | Connects to: `phetrail-run122-pcc2-deadlock.md`, `phetrail-run122-deploy-fail-architecti.md`, `phetrail-run122-deploy-fail-pcc1.md`, `phetrail-run122-audit-deploy.md`, `phetrail-run117-heart-of-claude.md`

---

## CORRECTION TO PRIOR CLAIM

The prior response over-stated current deploy status from local validation.

Corrected claim:

- `node --check` and `wrangler deploy --dry-run` pass for `phoenix-pcc-1`, `phoenix-pcc-2`, and `phoenix-architecti`.
- A dry-run is not proof that production deploy succeeds.
- The older phetrails still document real CF migration/deploy failures, so the CF metadata issue remains an unresolved historical blocker unless a fresh production deploy proves otherwise.

---

## PHETRAIL EVIDENCE READ

### PCC2 deadlock trail

`OPERATIONS/phetrail-run122-pcc2-deadlock.md:9-22`

- Documents 8 failed attempts around `WatchdogAlarm` / `ForceAwarenessAlarm`.
- States CF migration metadata tracks both class names.
- States code-only fixes failed because CF metadata can require either class to be exported, while source/export/build rules reject the conflicting combinations.

`OPERATIONS/phetrail-run122-pcc2-deadlock.md:24-39`

- Root cause is CF DO migration metadata, not local syntax.
- Resolution options documented there: CF Dashboard cleanup, rename-class migration, or new worker.

### Architecti class-hoisting trail

`OPERATIONS/phetrail-run122-deploy-fail-architecti.md:9-17`

- Documents a real CF validation failure: `ReferenceError: WatchdogAlarm is not defined` at `src/race.js:276`.

`OPERATIONS/phetrail-run122-deploy-fail-architecti.md:40-51`

- Root cause: class ordering/export evaluation in CF Workers, hidden by Node `--check`.
- Requires CF-layer validation, not just local syntax check.

### PCC1 migration trail

`OPERATIONS/phetrail-run122-deploy-fail-pcc1.md:9-24`

- Documents PCC1 deploy failure from re-applying `new_classes = ["LegionRunner"]` after the DO already existed.

`OPERATIONS/phetrail-run122-deploy-fail-pcc1.md:26-45`

- Fix documented: comment/remove the already-applied v2 migration.
- Negative trail: do not re-add migration tags for already-deployed DO classes.

### Full audit trail

`OPERATIONS/phetrail-run122-audit-deploy.md:30-42`

- Confirms historical deploy results:
  - `net-pet-ai` succeeded.
  - `phoenix-architecti` failed on `WatchdogAlarm` class ordering.
  - `phoenix-pcc-1` failed on `LegionRunner` migration conflict.

### PCC fleet identity trail

`OPERATIONS/phetrail-run117-heart-of-claude.md:173-207`

- Run 117 Lead PCC handoff says:
  - `phoenix-pcc-2` was Student Fleet.
  - `phoenix-pcc-3` was Ops Fleet.
  - `phoenix-architecti` was Orchestrator.

`OPERATIONS/phetrail-pcc1-obi-full.md:10-21`

- PCC1 is student-focused:
  - `/api/run-fleet`
  - `/api/brief/:userId`
  - `/api/session/death`
  - `STUDENT_FLEET = mai-tram-bluetech, huong-bluetech, sov100-michael, sov100-test-magic, net-student-next`.

---

## CURRENT LOCAL VALIDATION

Commands run from repo root / worker subdirs:

- `node --check APPS/PHOENIX-ARCHITECTI/src/index.js` — pass.
- `node --check APPS/PHOENIX-PCC-2/src/index.js` — pass.
- `node --check APPS/phoenix-pcc-1/src/index.js` — pass.
- `npx wrangler deploy --dry-run` in `APPS/PHOENIX-ARCHITECTI` — pass.
- `npx wrangler deploy --dry-run` in `APPS/PHOENIX-PCC-2` — pass.
- `npx wrangler deploy --dry-run` in `APPS/phoenix-pcc-1` — pass.

This proves local bundling/CF validation is currently clean enough for dry-run. It does **not** prove production deploy would succeed, because the documented failure mode is CF-side migration metadata.

---

## CURRENT SOURCE-OF-TRUTH STATUS

### PCC1

- Source still student fleet: `APPS/phoenix-pcc-1/src/index.js:7`, `APPS/phoenix-pcc-1/src/index.js:9-14`, `APPS/phoenix-pcc-1/src/index.js:261-267`.
- Phetrail agrees PCC1 is student-focused: `OPERATIONS/phetrail-pcc1-obi-full.md:10-14`.
- Historical blocker: stale `LegionRunner` v2 migration.
- Current `wrangler.toml` has v2 migration commented: `APPS/phoenix-pcc-1/wrangler.toml:27-30`.
- Current `wrangler.toml` still has v4 `new_classes = ["ForceAwarenessAlarm"]`: `APPS/phoenix-pcc-1/wrangler.toml:32-34`.

### PCC2

- Source is Ops fleet: `APPS/PHOENIX-PCC-2/src/index.js:2`, `APPS/PHOENIX-PCC-2/src/index.js:356-361`.
- Historical phetrail says PCC2 was Student Fleet in Run 117: `OPERATIONS/phetrail-run117-heart-of-claude.md:177-218`.
- This means the Ops fleet code is a later handoff/change, not the original Run 117 state.
- Historical blocker: `WatchdogAlarm` / `ForceAwarenessAlarm` migration metadata conflict: `OPERATIONS/phetrail-run122-pcc2-deadlock.md:24-39`.
- Current dry-run passes, but no fresh production deploy was attempted here.

### Architecti

- Race exports are now ordered before use in current source:
  - `RaceRunner`: `APPS/PHOENIX-ARCHITECTI/src/race.js:79`
  - `WatchdogAlarm`: `APPS/PHOENIX-ARCHITECTI/src/race.js:278`
  - `ForceAwarenessAlarm`: `APPS/PHOENIX-ARCHITECTI/src/race.js:300`
  - `LegionRunner`: `APPS/PHOENIX-ARCHITECTI/src/race.js:323`
- Historical class-hoisting failure is documented in `OPERATIONS/phetrail-run122-deploy-fail-architecti.md:9-17`.
- Current dry-run passes, but no fresh production deploy was attempted here.

---

## NEGATIVE TRAIL / LESSON

Do not convert phetrail history into a stronger claim than the evidence supports.

Correct phrasing:

- `CF migration metadata is the historical blocker documented by phetrails.`
- `Local dry-run currently passes.`
- `A fresh production deploy or CF Dashboard migration inspection is required to prove whether the metadata is still blocking.`

Incorrect phrasing:

- `PCC2 is definitely blocked right now` when only dry-run was checked.
- `Architecti is definitely deployable` when only dry-run was checked.
- `PCC1 is definitely deployable` when only dry-run was checked.

---

## CONNECTING KEYWORDS

`Michael challenge` → `read phetrails` → `separate history from current validation` → `dry-run is not production deploy` → `CF metadata must be inspected or fresh-deployed`

`PCC2` → `Ops fleet code now in APPS/PHOENIX-PCC-2` → `Run 117 PCC2 was Student Fleet` → `fleet identity changed after handoff`

`Architecti` → `race.js class order fixed locally` → `dry-run passes` → `historical WatchdogAlarm failure remains a phetrail fact`

`PCC1` → `student fleet confirmed` → `v2 migration commented` → `v4 ForceAwarenessAlarm migration still present`
