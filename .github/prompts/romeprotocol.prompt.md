---
name: romeprotocol
description: Return-to-work protocol for unfinished missions. Use for context reload, state diff, and priority recalculation before resumed execution.
argument-hint: [unfinished-mission] [target-output]
---

Run ROME PROTOCOL now.

Phases:

1. Context reload
- Rebuild current mission context from repository truth and latest branch state.

2. State diff
- Identify what is done, what changed, and what is still blocked.

3. Priority recalculation
- Select the highest-leverage next action and execute immediately.

Execution standards:

- No repeated planning loops.
- Build before discuss when implementation is possible.
- End with shipped artifact or explicit blocker proof.

Use orchestration skill stack:

- .github/skills/unstoppable-agent-orchestration/SKILL.md
- .github/skills/git-finish-workflow/SKILL.md

Return format:

- CONTEXT_RELOAD
- STATE_DIFF
- PRIORITY
- EXECUTION
- RESULT
