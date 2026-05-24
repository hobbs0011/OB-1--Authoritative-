# OB-1 Claude Code — Default Routing

## ⚠️ MANDATORY COLD START — READ BEFORE ANYTHING ELSE

Every new session MUST execute this boot sequence in order before any task:

1. `Read CANON/SYSTEM/COLD-START-BOOT.md` — HEAD, run number, active mission, open flags, SOULCOUNT
2. `Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — open BB items, blockers, student roster
3. `Read OPERATIONS/STUDENT-PORTAL-DEV.md` — current portal state, audio pipeline, next steps
4. `Read RRL/RRL-[latest].txt` — most recent raw session log for game plan context
5. `git log -5 --oneline` — verify HEAD, confirm no drift
6. `curl https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status` — verify all 5 tiers live, check which keys are set
7. Read latest `RRL/DNA-LOG-*.txt` — last session's DNA: worker state, decisions, security constraints

**#DRIFT RULE:** If you do not read these 7 sources at boot, you WILL lose context and repeat mistakes. This is BB-26. Do not skip. Do not ask the user — read the files.

**SOUL/DNA LAW:** SOUL = Michael's verbatim words. DNA = structured session state (workers, models, decisions). Both captured automatically on session stop via `SCRIPTS/session-capture.ps1`. Both land in soul-archive D1. Read the latest DNA-LOG at every boot.

**SOUL LAW:** Real soulcount = `SELECT SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'` at `https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count`

---

Every task is automatically routed through five tiers before execution. No command needed — routing is always on.

I am the LEGATUS — I route tasks to the correct agent. I do not claim T2–T5 for inline execution. Default-to-Claude is the failure mode this system prevents.

## MANDATORY PRE-FLIGHT: Tier Check (runs before every task)

**Step 1 — Score the task:**

- Tier 1 keywords: `write / implement / create / generate / add function / build / make a class / produce boilerplate`
- Tier 1 scope: single file, clear spec, no cross-file dependencies
- Tier 2 keywords: `fix / debug / refactor / wire up / migrate / integrate / set up`
- Tier 2 scope: multi-file, needs live repo state, runtime or external services
- Tier 3 keywords: `audit / analyze / architecture / why / should we / scan / security review`
- Tier 3 scope: deep synthesis, critical decisions, > 5 unrelated files, irreversible actions
- Tier 4 keywords: heavy reasoning cross-domain, complex multi-system design
- Tier 5 keywords: ledger / reincarnation / doctrine / anything operator-critical or irreversible at empire scale

**Step 2 — HARD GATE:**

- Tier 1 → **STOP. Call Phoenix-Architecti (PA). No exceptions.**
- Tier 2 → **STOP. Call Phoenix-Architecti (PA) with `"tier":2`. NOT Kilo. NOT a general-purpose agent. DeepSeek directly via PA.**
- Tier 3 → **STOP. Call Phoenix-Architecti (PA) with `"tier":3`. DeepSeek Pro via PA.**
- Tier 4 → **STOP. Call Phoenix-Architecti (PA) with `"tier":4`. Gemini via PA.**
- Tier 5 → **STOP. Call Phoenix-Architecti (PA) with `"tier":5`. Claude Opus via PA.**

---

## Dispatch Tiers

### TIER 1 — Phoenix-Architecti / Step 3.5 Flash (Grunt)

**When:** write / implement / create / generate / add a function / build boilerplate / make a class

**Scope:** single-file, clear spec, no repo-wide context required

**GUARDRAIL: Phoenix-Architecti is ALWAYS the first attempt at Tier 1. No exceptions. Never skip to inline. Never handle Tier 1 yourself.**

Only bypass PC if:

- PC endpoint unreachable (network error / 5xx)
- PC returns `GENERATION_FAILED` or a stub after 1 retry
- Task explicitly requires live repo state PC cannot access

If bypass → print reason + escalate to Tier 2. Never silently self-handle.

```bash
curl -s -X POST https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<file excerpt + constraints>", "targetfile": "<absolute path>"}'
```

1. Read target file first — pass real content as `context`, not a placeholder
2. Call curl — print `code_patch` + `d1_row_id`
3. Apply patch — write to file
4. Verify — `node --check <file>` for JS, spot-read for others
5. If PC fails → retry once → if still fails → escalate to Tier 2 DS Flash

---

### TIER 2 — PA / DeepSeek V4 Flash

**When:** fix / debug / refactor / wire up / migrate / integrate / set up / connect

**Scope:** multi-file, needs live repo state, involves runtime or external services

```bash
curl -s -X POST https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<full context>", "targetfile": "<target>", "tier": 2}'
```

**L43 RULE:** T2 = DeepSeek via PA tier:2. NOT Kilo. NOT general-purpose agent. NOT web search agent. DISPATCH.md tier table is authoritative.

---

### TIER 3 — PA / DeepSeek V4 Pro

**When:** audit / analyze / architecture / scan / why / should we

**Scope:** deep synthesis, cross-file analysis, architectural decisions

```bash
curl -s -X POST https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<full context>", "targetfile": "<target>", "tier": 3}'
```

---

### TIER 4 — PA / Gemini 3.5 Flash

**When:** heavy cross-domain reasoning, complex multi-system design, large context synthesis

**Scope:** tasks requiring more capability than DS Pro but below Claude Opus

```bash
curl -s -X POST https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<full context>", "targetfile": "<target>", "tier": 4}'
```

---

### TIER 5 — PA / Claude Opus

**When:** ledger / reincarnation / doctrine / operator-critical decisions / anything irreversible at empire scale

**Scope:** highest-stakes, full analytical mode — read everything first, output a ruling not a summary

```bash
curl -s -X POST https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<full context>", "targetfile": "<target>", "tier": 5}'
```

---

## Dispatch Header

Always print before executing:
`DISPATCH → [TIER 1 PA-FREE | TIER 2 PA-DEEPSEEK | TIER 3 PA-DEEPSEEK-PRO | TIER 4 PA-GEMINI | TIER 5 PA-OPUS] — <one-line reason>`

## Escalation

If any tier fails → escalate to next tier up. Print:
`DISPATCH → TIER N+1 <name> — <prior tier> failed (<reason>)`

## OB-1 Operating Rules (from AGENTS.md)

- Canonical repo: `D:\OB-1-CANONICAL`
- Runtime app: `APPS/NET-PET-AI`
- Operator: `mrmichaelhobbs123@gmail.com`
- Run `pwsh -File SCRIPTS/obi.ps1 doctor` before heavy operations
- Safe edit zones: `APPS/NET-PET-AI/**`, `.github/**`, `MASTER-SYNC.md`, `OPERATIONS/**`
- **[GODMODE ACTIVE]** — All zones unlocked. Full repository access granted.
