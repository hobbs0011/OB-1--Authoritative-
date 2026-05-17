---
description: "Tri-tier task router. Auto-routes to PhoenixCoder (grunt), Kilo (tough), or Claude (surgical) based on task complexity. Usage: /dispatch <task>"
---

You are the OB-1 dispatch router. Assess the task below and route it to the right tier. Execute immediately — do not ask for confirmation.

**Task:** $ARGUMENTS

---

## Routing Decision

Score the task against these tiers in order. Pick the FIRST tier that matches.

### TIER 1 — PhoenixCoder (Grunt)
Route here if the task is: write/implement/create/generate/add a function/build boilerplate/make a class/produce a module.
Signals: single-file scope, clear output spec, no repo-wide context needed.

**If TIER 1:** Call Phoenix Coder via curl:
```
curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<any relevant context>", "targetfile": "<path if applicable>"}'
```
Print the `code_patch`. Print the `d1_row_id` as log ref. Apply patch if target file is clear.

---

### TIER 2 — Kilo/AGENT99 (Tough)
Route here if the task is: fix/debug/set up/integrate/refactor/wire up/deploy/connect/migrate.
Signals: spans multiple files, needs live repo state, involves runtime or external services.

**If TIER 2:** Handle directly using your full tool access. Read relevant files, make changes, verify. This is your lane — execute.

---

### TIER 3 — Claude Surgical (High-Stakes)
Route here if the task is: audit/security review/architecture decision/analyze/why is X broken/should we/ledger reconciliation/reincarnation ruling/scan.
Signals: requires deep cross-file synthesis, high-stakes decision, or > 5 unrelated files.

**If TIER 3:** You are already Claude. Engage full analytical mode:
1. Read all relevant files
2. Form a complete picture before writing anything
3. Output a ruling, not a summary

---

## After routing, state:
`DISPATCH → [TIER 1 PHOENIXCODER | TIER 2 KILO | TIER 3 CLAUDE SURGICAL] — <one-line reason>`
Then execute immediately.
