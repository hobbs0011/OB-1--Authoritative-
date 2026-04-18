---
description: Reincarnation router — use /reincarnatedeath (session end) or /reincarnaterise (new chat start)
agent: AGENT99
---
Router behavior:
- End-of-session intent → route to `/reincarnatedeath`
- Start/new-session restore intent → route to `/reincarnaterise`
- If intent unclear: ask one clarifying detail, then route

Always return:
1. Route selected
2. Why route was selected
3. Immediate next action
