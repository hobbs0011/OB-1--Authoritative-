# PHEROMONE TRAIL — DEPLOY FAILURE: phoenix-architecti class hoisting
**Run 122 | 2026-06-13 | Deploy attempt → CF validation error**
**Strength: 85/100** | Connects to: phetrail-incarnate-pipeline.md, phetrail-run106.md

---

## WHAT HAPPENED

`npx wrangler deploy` for phoenix-architecti failed with:
```
Uncaught ReferenceError: WatchdogAlarm is not defined
  at null.<anonymous> (src/race.js:276:8)
```

## ROOT CAUSE

`src/race.js:276` exports `ForceAwarenessAlarm extends WatchdogAlarm` but `WatchdogAlarm` class is defined at line 192 of the SAME file. Node `--check` passes because class declarations are hoisted in V8. CF Workers runtime does NOT hoist across module boundaries the same way — the export evaluation order breaks.

## THE CODE

Lines 192-210 (WatchdogAlarm definition):
```js
class WatchdogAlarm {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) { ... }
  async alarm() {
    await ForceAwareness(this.env).catch(() => {});
    await this.state.storage.setAlarm(Date.now() + 30000);
  }
}
```

Line 276 (export referencing undefined class):
```js
export class ForceAwarenessAlarm extends WatchdogAlarm {}
```

`ForceAwarenessAlarm` extends `WatchdogAlarm` — but `WatchdogAlarm` calls `ForceAwareness(this.env)` in its `alarm()` method. There is a circular dependency: `WatchdogAlarm.alarm()` references `ForceAwareness` (from forceawareness.js), and `ForceAwarenessAlarm` extends `WatchdogAlarm`.

## FIX

Move `WatchdogAlarm` class definition BEFORE line 276. The class is defined mid-file at line 192 but referenced at line 276. Node hoisting hides this locally; CF Workers module evaluation order exposes it.

## CONNECTING KEYWORDS

`phoenix-architecti` → `race.js:276` → `WatchdogAlarm` → `class hoisting` → `CF Workers module order` → `deploy block`
`phetrail-incarnate-pipeline.md` → `race.js` DO classes → `LegionRunner / ForceAwarenessAlarm` → `migration conflict`

## NEGATIVE TRAIL

Local `node --check` is NOT sufficient for CF Workers deploy validation. Always run `wrangler deploy --dry-run` FIRST to catch CF-layer validation errors.
