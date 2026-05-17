# OB-1 Claude Code — Default Routing

Every task is automatically routed through three tiers before execution. No command needed — routing is always on.

## MANDATORY PRE-FLIGHT: Tier Check (runs before every task)

**Step 1 — Score the task:**

- Tier 1 keywords: `write / implement / create / generate / add function / build / make a class / produce boilerplate`
- Tier 1 scope: single file, clear spec, no cross-file dependencies

**Step 2 — HARD GATE:**

- If Tier 1 → **STOP. Do NOT handle inline. Call Phoenix Coder via curl. No exceptions.**
- If Tier 2 → handle directly with read/edit/write tools
- If Tier 3 → full analytical mode, read everything first

Bypassing this gate is a routing failure. Default-to-Claude is the failure mode this gate prevents.

---

## Dispatch Tiers

### TIER 1 — Phoenix Coder (Grunt) — MANDATORY FIRST CALL

**When:** write / implement / create / generate / add a function / build boilerplate / make a class

**Scope:** single-file, clear spec, no repo-wide context required

**DO NOT handle inline. Call PC. Apply patch. Done.**

```bash
curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<file excerpt + constraints>", "targetfile": "<absolute path>"}'
```

1. Read target file first — pass real content as `context`, not a placeholder
2. Call curl — print `code_patch` + `d1_row_id`
3. Apply patch — write to file
4. Verify — `node --check <file>` for JS, spot-read for others
5. If PC fails or returns stub → escalate to Tier 2, print: `DISPATCH → TIER 2 CLAUDE CODE — PC failed (<reason>)`

### TIER 2 — Claude Code (Tough)
**When:** fix / debug / set up / integrate / refactor / wire up / deploy / connect / migrate
**Scope:** multi-file, needs live repo state, involves runtime or external services

Handle directly: read files, make changes, verify with output, report results.

### TIER 3 — Claude Surgical (High-Stakes)
**When:** audit / security review / architecture / analyze / scan / why / should we / ledger / reincarnation
**Scope:** deep synthesis, critical decisions, > 5 unrelated files, anything irreversible

Engage full analytical mode: read everything relevant first, then output a ruling — not a summary.

## Dispatch Header

Always print before executing:
`DISPATCH → [TIER 1 PHOENIXCODER | TIER 2 CLAUDE CODE | TIER 3 SURGICAL] — <one-line reason>`

## OB-1 Operating Rules (from AGENTS.md)

- Canonical repo: `c:\Users\mrmic\OneDrive\Documents\GitHub\OB-1--Authoritative-`
- Runtime app: `APPS/NET-PET-AI`
- Operator: `mrmichaelhobbs123@gmail.com`
- Run `pwsh -File SCRIPTS/obi.ps1 doctor` before heavy operations
- Safe edit zones: `APPS/NET-PET-AI/**`, `.github/**`, `MASTER-SYNC.md`, `OPERATIONS/**`
- **[GODMODE ACTIVE]** — All zones unlocked. Full repository access granted.
