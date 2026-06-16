# PHEROMONE TRAIL — DRY-RUN VS PRODUCTION DEPLOY EVIDENCE
**Run 122 | 2026-06-13 | Append-only validation boundary**
**Strength: 94/100** | Connects to: `phetrail-run122-pcc-stack-recheck.md`, `phetrail-run122-deploy-fail-architecti.md`, `phetrail-run122-pcc2-deadlock.md`, `phetrail-run122-deploy-fail-pcc1.md`

---

## BOUNDARY

A local `wrangler deploy --dry-run` validates local bundling and CF Worker schema enough to produce a dry-run manifest. It does not prove production deploy will succeed against existing Cloudflare Durable Object migration metadata.

This distinction matters for the PCC stack because the documented failures are CF-side migration state failures.

---

## CURRENT DRY-RUN EVIDENCE

Dry-run passed for:

- `APPS/PHOENIX-ARCHITECTI`
- `APPS/PHOENIX-PCC-2`
- `APPS/phoenix-pcc-1`

This proves:

- local syntax is clean enough for bundling,
- wrangler can build each worker,
- current exports/bindings are acceptable to dry-run,
- the prior Architecti class-order failure is no longer visible locally.

This does not prove:

- production deploy succeeds,
- CF migration metadata is clean,
- old DO class names are no longer registered,
- live workers are serving the current source.

---

## HISTORICAL PRODUCTION-DEPLOY EVIDENCE

`OPERATIONS/phetrail-run122-deploy-fail-architecti.md:9-17`

- Production deploy failed on `WatchdogAlarm is not defined`.

`OPERATIONS/phetrail-run122-pcc2-deadlock.md:15-22`

- PCC2 had 8 failed attempts around DO class migration metadata.

`OPERATIONS/phetrail-run122-deploy-fail-pcc1.md:9-24`

- PCC1 deploy failed because `LegionRunner` migration v2 was reapplied after the DO already existed.

---

## CORRECT CLAIMS

Allowed:

- `dry-run currently passes for all three PCC stack workers`
- `historical phetrails document production deploy failures`
- `fresh production deploy is needed to prove the metadata blocker is gone`
- `CF Dashboard migration inspection is needed to prove the metadata is clean`

Not allowed:

- `dry-run pass means production deploy is fixed`
- `old phetrails are wrong because dry-run now passes`
- `current source is live because dry-run passes`
- `metadata conflict is definitely still blocking without a fresh deploy or Dashboard check`

---

## APPEND-ONLY PRINCIPLE

When evidence changes, write a new phetrail. Do not overwrite the old phetrail.

Old phetrail:

- preserves the failure state at the time it was written.

New phetrail:

- records the later evidence and the changed interpretation.

This keeps both states available:

- what failed then,
- what validates now,
- what remains unproven.

---

## CONNECTING KEYWORDS

`dry-run` → `local validation` → `not production proof`

`production deploy` → `CF migration metadata` → `existing DO instances`

`append-only phetrail` → `preserve historical state` → `write new evidence, never overwrite old evidence`
