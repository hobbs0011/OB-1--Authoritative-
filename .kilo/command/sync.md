---
description: Synchronize project state and produce drift summary
agent: AGENT99
---
Purpose: reconcile repository/runtime state (deeper than /status).

Actions:
1. Collect git status (staged/unstaged/untracked)
2. Collect branch tracking + ahead/behind
3. Compare expected runtime/config state vs current state
4. Return drift summary + prioritized next safe action

Output sections:
- STATE
- DRIFT
- RISKS
- NEXT_ACTION
