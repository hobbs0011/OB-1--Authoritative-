# PHEROMONE TRAIL — PCC2 DEPLOY DEADLOCK: ForceAwarenessAlarm / WatchdogAlarm
**Run 122 | 2026-06-13 | Deploy fix attempts → CF migration metadata conflict**
**Strength: 80/100** | Connects to: phetrail-run122-deploy-fail-pcc1.md

---

## WHAT HAPPENED

After PCC1 and architecti were fixed and deployed successfully, PCC2 hit a persistent DO class export deadlock. CF's migration metadata tracks BOTH `WatchdogAlarm` (legacy) AND `ForceAwarenessAlarm` (from prior rename), but the source only exports one at a time.

## ATTEMPTED FIXES (chronological)

| Attempt | Change | Result |
|---------|--------|--------|
| 1 | Removed v4 migration from `wrangler.toml` | FAIL: `Cannot apply new-class migration to class 'ForceAwarenessAlarm' that is already depended on` |
| 2 | Changed binding `class_name` from `ForceAwarenessAlarm` → `WatchdogAlarm` | FAIL: TOML redefine error (duplicate `[migrations]` table) |
| 3 | Renamed source class `class WatchdogAlarm` → `class ForceAwarenessAlarm` | FAIL: CF still demands `WatchdogAlarm` export |
| 4 | Restored source class to `class WatchdogAlarm` + `export { WatchdogAlarm as ForceAwarenessAlarm }` | FAIL: CF sees both exports as duplicate |
| 5 | Added `export class ForceAwarenessAlarm extends WatchdogAlarm {}` (two classes) | FAIL: Symbol redeclaration / duplicate export error |
| 6 | Removed duplicate, kept alias only | FAIL: CF metadata still tracks `WatchdogAlarm` as DO |
| 7 | Removed FORCEAWARENESS_ALARM binding entirely from wrangler.toml | FAIL: `Cannot apply new-class migration to class 'ForceAwarenessAlarm' that is not exported` |
| 8 | Restored binding + changed migration to `new_classes = ["WatchdogAlarm"]` | FAIL: `Cannot apply new-class migration to class 'WatchdogAlarm' that is already depended on` |

## ROOT CAUSE

CF's migration metadata for this worker has BOTH:
- `ForceAwarenessAlarm` registered as a DO (from a rename-class migration on a different branch)
- `WatchdogAlarm` registered as a DO (from the original class)

The source can only export one class at a time. There is no wrangler.toml-only fix because:
- If `wrangler.toml` binds to `ForceAwarenessAlarm` → CF demands that class be exported
- If `wrangler.toml` binds to `WatchdogAlarm` → CF demands that class be exported
- Exporting both causes "duplicate export" build error
- Exporting neither causes "class not exported" error

## BLOCKER

PCC2 cannot deploy until CF migration metadata is cleaned up. Possible resolutions:
1. **CF Dashboard**: Manually delete the stale DO migration entry for the unwanted class
2. **rename-class migration**: Add explicit `rename_class` migration in wrangler.toml
3. **Create new worker**: Spin up `phoenix-pcc-2-v2` with clean DO state, migrate traffic

## CONNECTING KEYWORDS

`pcc2` → `deploy deadlock` → `ForceAwarenessAlarm` ↔ `WatchdogAlarm` → `CF migration metadata` → `DO rename conflict`
`phetrail-run122-deploy-fail-pcc1.md` → `migration v2 LegionRunner` → `solved by removing v2 from other workers` → `PCC2 different problem`

## NEGATIVE TRAIL

Attempted 8 different code+config combinations. None succeeded. CF migration state is the blocker, not source code. Lesson: when CF says "class already depended on", it means the migration TAG is cached, not that the code is wrong.
