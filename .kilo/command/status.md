---
description: Show system status — quick live health snapshot
agent: AGENT99
---
Purpose: live snapshot only (not full drift reconciliation).

Checks:
1. Worker health (/health)
2. Integration reachability (if configured)
3. Ledger head availability
4. Git branch + ahead/behind

Output: one compact status line + one blocker line if needed.
