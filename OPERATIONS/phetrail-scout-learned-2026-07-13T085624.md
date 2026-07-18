# PHETRAIL — SCOUT LEARNED (sync-session zone)

**Scout:** PhoenixScout — sync/synch/soulsearch/mastermind session zone
**Date:** 2026-07-13T085624
**Triggers role change?** YES — routing doctrine upgraded.

## Learned: PhoenixSynch-Temp.md missing-artifact claims are UNRELIABLE

During this scout, `OPERATIONS/PhoenixSynch-Temp.md` (Run 161 intelligence) claimed the `/soulsearch`
execution script is **MISSING** (`SCRIPTS/soulsearch.ps1` and `SCRIPTS/soul-search.ps1` both absent,
lines 64-68). Disk verification proved otherwise:

- `SCRIPTS/soulsearch.ps1` (no hyphen) → DOES NOT EXIST
- `SCRIPTS/soul-search.ps1` (with hyphen) → **EXISTS** (Test-Path=True)

The canonical command doc `.kilo/command/SoulSearch.md:9` correctly references the hyphen variant,
which is present. The Backburner log (`OPERATIONS/BACKBURNER-PIPELINE-LOG.md:513`) references the
no-hyphen variant, which is the true ORPHAN.

### Routing doctrine upgrade
1. **Trust `.kilo/command/*.md` docs over `OPERATIONS/PhoenixSynch-Temp.md` for script-existence claims.**
2. **Always verify disk (Test-Path) before flagging ORPHAN/missing-script.** PhoenixSynch-Temp.md
   intelligence updates go stale fast and contain false-negative "missing" claims.
3. **Script-name divergence is the real finding**, not "script missing": `soulsearch.ps1` (Backburner)
   vs `soul-search.ps1` (doc/disk) vs `soul-search.ps1` present. Route naming conflict to detective.
4. **Batch-flag attestation gaps** in `CANON/ART-REGISTRY/art-sync-run*.json` (39/39 lack
   `no_fabrication`); do not enumerate individually in a single scout — mark NOT_WALKED for follow-up.

### Next-run lenses added
- DOMAIN: flag any `mrmichaelhobbs123` (no `4`) reference as legacy-domain DRIFT.
- BOOT-IDENTITY: verify COLD-START-BOOT.md actually holds run state, not GOSPEL text.
- DUP: flag Reincarnation synch files mirrored across `CANON/REINCARNATION/` and `REINCARNATION/`.
