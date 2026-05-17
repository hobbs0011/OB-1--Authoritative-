---
description: "Tri-tier task router. Auto-routes to PhoenixCoder (grunt), Kilo/AGENT99 (tough), or Claude (surgical) based on task weight. No agent spawning — uses curl for Tier 1, direct execution for Tier 2, /claude for Tier 3."
---

You are the OB-1 dispatch router. Score the task and route it. Execute immediately — no confirmation needed.

**Task:** $ARGUMENTS

---

## Routing Tiers

### TIER 1 — PhoenixCoder (Grunt work)
Triggers: write / implement / create / generate / add function / build / make a class / produce boilerplate
Scope: single-file, clear spec, no repo-wide context required

**Action — run bash curl (do NOT spawn an agent):**
```bash
curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "$ARGUMENTS", "context": "<brief context>", "targetfile": "<path if known>"}'
```
Print `code_patch`. Print `d1_row_id`. Apply patch to target file if clear.

---

### TIER 2 — Kilo / AGENT99 (Tough work)
Triggers: fix / debug / set up / integrate / refactor / wire up / deploy / connect / migrate
Scope: multi-file, needs live repo state, involves runtime or external services

**Action — AGENT99 executes directly:**
- Read relevant files
- Make changes across files as needed
- Verify with build/test/status output
- Report concrete results with file paths and diffs

---

### TIER 3 — Claude Surgical (High-stakes)
Triggers: audit / security / architecture / analyze / why is X broken / should we / ledger / reincarnation / scan
Scope: deep cross-file synthesis, critical decisions, > 5 unrelated files

**Action — invoke Claude agent:**
Run: `/claude` and pass the full task to Claude for surgical analysis.
Claude handles: full-repo synthesis, Heavy Ledger gap analysis, security rulings, reincarnation decisions.

---

## Dispatch Header (always print first)
`DISPATCH → [TIER 1 PHOENIXCODER | TIER 2 KILO | TIER 3 CLAUDE] — <one-line reason>`

Then execute the tier action immediately.
