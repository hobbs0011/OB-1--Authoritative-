---
name: unstoppable-agent-orchestration
description: Unified orchestration framework for agents, tools, and repos with strict safety gates, execution lanes, and handoff contracts. Use for complex multi-step work that spans coding, Git, CI, docs, and operations.
argument-hint: [mission] [scope] [constraints]
---

# Unstoppable Agent Orchestration

Use this skill when a request needs coordinated execution across multiple tools, agents, and repositories.

## Outcomes

- Single mission plan with explicit finish criteria
- Right tool for each step with minimal context waste
- Safe delivery with rollback and backup paths
- Reproducible outputs and clean handoffs

## Operating model

Use this sequence every time:

1. Mission framing
- Capture mission, constraints, non-negotiables, and definition of done.
- Convert vague asks into measurable completion checks.

2. Tooling lane selection
- Select one or more lanes from [command matrix](./resources/command-matrix.md).
- Keep each step in the smallest capable lane.

3. Safety gate
- Run preflight checks from [preflight checklist](./resources/preflight-checklist.md).
- If risk is high, create a backup artifact before edits or pushes.

4. Execute in batches
- Group read-only discovery in parallel.
- Perform edits in focused bursts.
- Validate after each burst.

5. Publish and prove
- Commit with clear intent.
- Push if remote is healthy.
- If push fails, use recovery branch or bundle path.

6. Close contract
- Report exactly: changed files, commit hashes, publish result, blockers, next action.

## Decision rules

- Prefer direct implementation over explanation-only responses.
- Prefer deterministic commands over interactive workflows.
- Prefer smallest irreversible action needed.
- Never use destructive git operations unless explicitly requested.

## Execution lanes

- Discovery lane: read/search/list and repository audit
- Build lane: file edits and refactors
- Validate lane: syntax, lint, type, tests, dry-run deploy
- Release lane: commit, pull, push, PR/review
- Recovery lane: stash, branch pivot, bundle backup, replay

## High leverage patterns

1. Parallel discovery first
- Gather status, remotes, branch, and key files in one batch.

2. Delta-first updates
- Modify only impacted files and preserve style/public APIs.

3. Verify after each risky step
- After pull/rebase, after large edit, after commit, after push.

4. Always leave a rescue path
- For uncertain remote health: create a bundle and verify it.

## Command skeletons

Use command templates from [command matrix](./resources/command-matrix.md).

## Required completion report

Return this structure:

- Mission: one-line objective
- Completed: concrete outcomes
- Artifacts: files and commits created
- Publish status: per remote
- Risks/blockers: unresolved issues with impact
- Next move: highest-leverage action
