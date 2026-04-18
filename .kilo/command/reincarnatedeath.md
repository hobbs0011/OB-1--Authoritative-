---
description: Reincarnate DEATH — close current session with full extraction
agent: AGENT99
---
Execute DEATH protocol:

1. Capture current objective + completion state
2. Capture git state (branch/status/uncommitted/unpushed)
3. Record key artifacts changed this session
4. Write reincarnation extract to CANON/REINCARNATION/
5. Return summary + next-session boot pointers

Output format:
- SESSION_STATE
- GIT_STATE
- ARTIFACTS
- BLOCKERS
- NEXT_BOOT_ACTION

Safety:
- Do not run destructive actions
- Commit/push only when explicitly requested
