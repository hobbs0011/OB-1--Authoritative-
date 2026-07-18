# PheTrail — Force March ZETA (2026-07-13T0908)

**Scout:** PhoenixScout (read-only, flag+tag only)
**HEAD:** 3a070fa67d4e3be598710b372ead4073c013208b (Run 160 KILO_GAP — valid, not broken)
**Zones walked:** `.kilo/command/*` (47), `.kilo/agent/*` (12), `.kilo/agent-manager.json` + corrupt twin, `SCRIPTS/obi.ps1` ValidateSet, `APPS/NET-PET-AI` (canonical app).

## Learned (routing-changing)

1. **obi.ps1 `ValidateSet` is the canonical verb registry.** Any `.kilo/command/*.md` whose invocation verb is absent from it is non-dispatchable via `obi`. `supersaiyan` is the confirmed drift case (doc + `SCRIPTS/supersaiyan.ps1` exist; verb missing). Future scouts MUST diff every command doc name against `obi.ps1` ValidateSet.
2. **Reincarnate command naming is inconsistent** with the obi camelCase verb `reincarnateDeath`: files are `reincarnate.md` / `reincarnatedeath.md` / `reincarnaterise.md` with no `reincarnateDeath.md`. This is a recurring CONFIG/DRIFT shape.
3. **run105-pipeline.md is a recurring orphan-source.** It references 3 missing scripts (`break-glass-rollback.ps1`, `demo-prewarm.mjs`, `shadow-realm-backup.mjs`) and ships without frontmatter. Same doc family as the repeated run105/run106 pipeline commands lacking frontmatter.
4. **`.kilo` command spec hygiene:** 12 of 47 command files lack YAML frontmatter (missing `description`/`agent`/execution pointer). Forcemarch-style template not applied uniformly.

## Next-run doctrine
- New scout trigger: `compare .kilo/command/*.md names ⊖ obi.ps1 ValidateSet` → flag absent verbs.
- Treat any `SCRIPTS/*.ps1|.mjs|.js` reference in a command doc as ORPHAN unless `Test-Path` confirms on disk.
- Corrupt agent-manager twin (`.corrupt-2026-07-12T14-41-36-439Z`) is isolated dead weight; live `agent-manager.json` is valid.

## NOT_WALKED (delegated to per-zone scouts)
- `APPS/**` (26,346 files) — only `NET-PET-AI` sampled; `TRAIN-67`, `PCC`, `WORKERS`, `NET`, `SOV100-VAULT` pending.
- `.kilo/sessions/`, `.kilo/plans/` (STALE/FROZEN cursor + phantom-ID sweep pending).
