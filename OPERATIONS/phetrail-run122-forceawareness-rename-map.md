# PHEROMONE TRAIL — FORCEAWARENESS RENAME MAP
**Run 122 | 2026-06-13 | Append-only DO class rename/reconciliation**
**Strength: 88/100** | Connects to: `phetrail-run122-pcc2-deadlock.md`, `phetrail-run122-deploy-fail-architecti.md`, `phetrail-run117-heart-of-claude.md`

---

## WHAT IS MAPPED

The PCC stack has moved from `WatchdogAlarm` wording toward `ForceAwarenessAlarm` / `FORCEAWARENESS` wording.

This rename is not just cosmetic. It touches:

- durable object class names,
- `wrangler.toml` migration entries,
- worker runtime behavior,
- historical deploy failures,
- and CF migration metadata.

---

## HISTORICAL WATCHDOG TRAIL

`OPERATIONS/phetrail-run117-heart-of-claude.md:262-276`

- Run 120 phetrail states:
  - Watchdog is Agent 99 OS core.
  - Every worker has it.
  - `/api/watchdog/start + WatchdogAlarm DO` fires a 30-second self-rescheduling heartbeat.
  - Obi/Anakin/Windu cross-ping pattern was documented.

`OPERATIONS/phetrail-run117-heart-of-claude.md:279-289`

- Run 120 also documents stale naming/open items:
  - `watchdog` keyword still appeared in scanner.
  - `BB-WINDU-RACE` and `BB-ANAKIN-DISCOVERIES` remained open.

---

## ARCHITECTI CURRENT CLASS MAP

`APPS/PHOENIX-ARCHITECTI/src/race.js:79`

- `RaceRunner` is exported.

`APPS/PHOENIX-ARCHITECTI/src/race.js:278`

- `WatchdogAlarm` is exported.

`APPS/PHOENIX-ARCHITECTI/src/race.js:300`

- `ForceAwarenessAlarm` is exported.

`APPS/PHOENIX-ARCHITECTI/src/race.js:323`

- `LegionRunner` is exported.

`APPS/PHOENIX-ARCHITECTI/wrangler.toml:45-57`

- Architecti binds both `LEGION_RUNNER` and `FORCEAWARENESS_ALARM`.
- Architecti has migration v2 for `LegionRunner`.
- Architecti has migration v4 for `ForceAwarenessAlarm`.

---

## PCC2 CURRENT CLASS MAP

`APPS/PHOENIX-PCC-2/src/index.js:477-481`

- PCC2 exports `WatchdogAlarm` as `ForceAwarenessAlarm`.
- PCC2 also exports `LegionRunner`.

`APPS/PHOENIX-PCC-2/wrangler.toml:21-29`

- PCC2 binds `FORCEAWARENESS_ALARM`.
- PCC2 binds `LEGION_RUNNER`.
- PCC2 has migration v2 for `LegionRunner`.

---

## PCC1 CURRENT CLASS MAP

`APPS/phoenix-pcc-1/wrangler.toml:21-34`

- PCC1 binds both `LEGION_RUNNER` and `FORCEAWARENESS_ALARM`.
- PCC1 v2 migration is commented.
- PCC1 v4 migration remains for `ForceAwarenessAlarm`.

---

## HISTORICAL FAILURE PATTERN

`OPERATIONS/phetrail-run122-deploy-fail-architecti.md:9-17`

- Architecti failed on `WatchdogAlarm is not defined`.

`OPERATIONS/phetrail-run122-pcc2-deadlock.md:9-22`

- PCC2 failed on the `WatchdogAlarm` / `ForceAwarenessAlarm` migration deadlock.

`OPERATIONS/phetrail-run122-deploy-fail-pcc1.md:9-24`

- PCC1 failed on `LegionRunner` migration re-application.

---

## INTERPRETATION

The rename is semantically coherent:

- `WatchdogAlarm` = old DO heartbeat class.
- `ForceAwarenessAlarm` = renamed/compatible heartbeat class.
- `FORCEAWARENESS` = operational wording now used across the PCC stack.

But the rename is operationally dangerous because CF DO migrations remember old class names.

Correct handling:

- preserve append-only phetrail evidence,
- do not overwrite old naming trails,
- do not assume source rename equals deployed rename,
- verify CF migration metadata separately from source exports.

---

## NEGATIVE TRAIL

Do not treat `WatchdogAlarm` and `ForceAwarenessAlarm` as interchangeable without checking CF migration state.

Incorrect:

- `Renaming the class in source is enough.`
- `If dry-run passes, migration metadata is clean.`
- `If one worker exports both names, all workers are fixed.`

Correct:

- `Source rename is only one layer.`
- `CF migration metadata is a separate layer.`
- `Old phetrails remain valid evidence of the old state.`

---

## CONNECTING KEYWORDS

`WatchdogAlarm` → `ForceAwarenessAlarm` → `FORCEAWARENESS` → `DO migration metadata` → `CF Dashboard cleanup`

`LegionRunner` → `already deployed DO` → `migration v2` → `do not reapply`

`Architecti` → `race.js class order` → `dry-run validation` → `production deploy still separate`
