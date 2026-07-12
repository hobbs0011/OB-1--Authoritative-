# Phetrail — Scout Learned
**Timestamp:** 2026-07-12T06:31:51+07:00
**Scout:** PhoenixScout
**Run Context:** Run 150 mastermind session — scouting run147 chain

## Learn 1: Orphan Pre-Check Requires Stat
Prior scout flagged `CANON/SYSTEM/ledger-index.json` with ORPHAN HL-147 because reference check did not verify disk existence. File EXISTS (430 bytes, mtime 2026-05-23T13:57:29).
**Rule update:** Before emitting ORPHAN status, run `Test-Path` / stat on the resolved path. False orphans consume downstream pipeline slots and break trust.

## Learn 2: HL-ID ≠ Run Numbering
HL-147 is a Heavy Ledger entry from Roman run7, not run147. Pipeline artifacts reference HL-147 for run147 as the run's ledger id, but the file content is run7 RRL-0 data.
**Rule update:** Pipeline must map `run_number → hl_id` through a lookup table, not `HL-{run_number}` direct interpolation.

## Learn 3: Empty DNA Needs Attestation
`CANON/SOUL/EXTRACT/dna-run147.json` is `[]` with no `no_fabrication` field. Prior scout flagged but no remediation followed.
**Rule update:** Empty DNA artifacts MUST include:
```json
{
  "schema_version": "2.1",
  "run_number": 147,
  "no_fabrication": true,
  "attested_at": "ISO8601",
  "reason": "KILO_HOLLOW"
}
```

## Learn 4: Registry Snapshot Schema Must Include Verified-At
`dna-registry-run147.json` has stale `generated_at` and multiple HEAD mismatches, plus legacy domain `mrmichaelhobbs1234` inside. Snapshot is 9.5MB of drift.
**Rule update:** Add `schema_verified_at` and `head_sha_at_generation` to registry schema; reject snapshots with >1 HEAD mismatch at audit.

## Learn 5: STATE-SNAPSHOT Drift Threshold
STATE-SNAPSHOT was off >12 runs (run145 vs run157). Treat >2 run delta as P1, automatically trigger regeneration.
**Rule update:** Scout stop rule — if snapshot.current != current run from REINCARNATION-LOG, emit P1 STALE and halt drill-down until snapshot is refreshed.

## Learn 6: PIPELINE-CURSOR Freeze Detection
PIPELINE-CURSOR.md last updated 2026-05-23 (Run 396). Current run 157. >30 days frozen.
**Rule update:** Add cron-style check: if (now - cursor.last_updated) > 30 days, emit FROZEN and trigger unfreeze protocol.

## Learn 7: Seal Copy-Paste Drift Pattern
`recent_seals` array in STATE-SNAPSHOT had identical long strings for runs 145, 135, 134. This copy-paste drift is invisible in normal scanning.
**Rule update:** Hash each seal text; alert on duplicate hash across distinct run IDs.
