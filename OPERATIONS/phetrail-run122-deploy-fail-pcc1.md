# PHEROMONE TRAIL — DEPLOY FAILURE: phoenix-pcc-1 migration conflict
**Run 122 | 2026-06-13 | Deploy attempt → migration error**
**Strength: 80/100** | Connects to: phetrail-pcc1-obi-full.md, phetrail-roman-s2pipeline-architecture.md

---

## WHAT HAPPENED

`npx wrangler deploy` for phoenix-pcc-1 failed with:
```
Cannot apply new-class migration to class 'LegionRunner' that is already 
depended on by existing Durable Objects [code: 10074]
```

## ROOT CAUSE

`wrangler.toml` has migration v2:
```toml
[[migrations]]
tag = "v2"
new_classes = ["LegionRunner"]
```

`LegionRunner` is already deployed as a DO in production (from prior deploys). Re-applying `new_classes = ["LegionRunner"]` migration fails because the class already has live DO instances bound to it.

## FIX

Remove or comment out the migration tag for already-deployed classes:
```toml
# [[migrations]]
# tag = "v2"
# new_classes = ["LegionRunner"]
```

Only NEW classes need migration entries. Existing classes (LegionRunner, ForceAwarenessAlarm) are already in production.

## CONNECTING KEYWORDS

`phoenix-pcc-1` → `LegionRunner` → `migration v2` → `DO already deployed` → `wrangler.toml cleanup`
`phetrail-pcc1-obi-full.md` → `LEGION_RUNNER DO` → `renamed from RaceRunner` → `naming consistency`
`phetrail-roman-s2pipeline-architecture.md` → `Stage VI VETERANI` → `DO persistence` → `migration state`

## NEGATIVE TRAIL

Adding `new_classes` migration for an already-deployed class = deploy blocker. Migration tags are one-time declarations. Do not re-add them.
