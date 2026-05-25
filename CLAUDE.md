# OB-1 Claude Code — Default Routing

## ⚠️ MANDATORY COLD START — READ BEFORE ANYTHING ELSE

Every new session MUST execute this boot sequence in order before any task:

1. `Read CANON/SYSTEM/COLD-START-BOOT.md` — HEAD, run number, active mission, open flags, SOULCOUNT
2. `Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — open BB items, blockers, student roster
3. `Read OPERATIONS/STUDENT-PORTAL-DEV.md` — current portal state, audio pipeline, next steps
4. `Read RRL/RRL-[latest].txt` — most recent raw session log for game plan context
5. `git log -5 --oneline` — verify HEAD, confirm no drift
6. `Invoke-RestMethod https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status` — verify tiers live (T1=Qwen, T2=Opus), check which keys are set
7. Read latest `RRL/DNA-LOG-*.txt` — last session's DNA: worker state, decisions, security constraints

**#DRIFT RULE:** If you do not read these 7 sources at boot, you WILL lose context and repeat mistakes. This is BB-26. Do not skip. Do not ask the user — read the files.

**SOUL/DNA LAW:** SOUL = Michael's verbatim words. DNA = structured session state (workers, models, decisions). Both captured automatically on session stop via `SCRIPTS/session-capture.ps1`. Both land in soul-archive D1. Read the latest DNA-LOG at every boot.

**SOUL LAW:** Real soulcount = `SELECT SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'` at `https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count`

---

Every task is automatically routed through two tiers before execution. No command needed — routing is always on.

I am the LEGATUS — I route tasks to the correct agent. I do not claim T2 for inline execution. Default-to-Claude is the failure mode this system prevents.

## MANDATORY PRE-FLIGHT: Tier Check (runs before every task)

**Step 1 — Score the task:**

- Tier 1 keywords: `write / implement / create / generate / add function / build / make a class / produce boilerplate / fix / debug / refactor / wire up / migrate / integrate / set up`
- Tier 1 scope: ALL workhorse tasks — single-file or multi-file, code generation, fixes, refactors, integration, audits, pipeline work
- Tier 2 keywords: `final ruling / irreversible decision / ledger audit / doctrine change / arbitration / reincarnation ruling`
- Tier 2 scope: Only for decisions that cannot be reversed, require highest-intelligence cross-validation, or change canonical law

**Step 2 — HARD GATE:**

- Tier 1 → **STOP. Call Phoenix-Architecti (PA). No exceptions.** (Qwen 3.7 Max via Dialagram)
- Tier 2 → **STOP. Call Phoenix-Architecti (PA) with `"tier":2`. NOT Kilo. NOT a general-purpose agent. Opus 4.7 directly via PA.**

---

## Dispatch Tiers

### TIER 1 — Phoenix-Architecti / Qwen 3.7 Max (Dialagram)

**When:** write / implement / create / generate / fix / debug / refactor / wire up / migrate / integrate / audit / analyze / pipeline / death seals / ALL workhorse tasks

**Scope:** Everything except irreversible decisions and final rulings

**GUARDRAIL: Phoenix-Architecti is ALWAYS the first attempt at Tier 1. No exceptions. Never skip to inline. Never handle Tier 1 yourself.**

Only bypass PA if:

- PA endpoint unreachable (network error / 5xx)
- PA returns `GENERATION_FAILED` or a stub after 1 retry
- Task explicitly requires live repo state PA cannot access

If bypass → print reason + escalate to Tier 2. Never silently self-handle.

```powershell
$body = @{ task="<task>"; context="<file content>"; targetfile="<absolute path>"; tier=1 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
```

1. Read target file first — pass real content as `context`, not a placeholder
2. Call PA — print `code_patch` + `d1_row_id`
3. Apply patch — write to file
4. Verify — `node --check <file>` for JS, spot-read for others
5. If PA fails → retry once → if still fails → escalate to Tier 2 Opus

---

### TIER 2 — PA / Claude Opus 4.7

**When:** final rulings / irreversible decisions / ledger audits / doctrine changes / arbitration / reincarnation rulings / edge-case death seals

**Scope:** ONLY for decisions that cannot be reversed or require highest-intelligence cross-validation

```powershell
$body = @{ task="<task>"; context="<full context>"; targetfile="<target>"; tier=2 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
```

**L43 RULE:** T2 = Opus 4.7 via PA tier:2. NOT Kilo. NOT general-purpose agent. NOT web search agent. DISPATCH.md tier table is authoritative.

---

## Dispatch Header

Always print before executing:
`DISPATCH → [TIER 1 PA-QWEN | TIER 2 PA-OPUS] — <one-line reason>`

## Escalation

If Tier 1 fails → escalate to Tier 2. Print:
`DISPATCH → TIER 2 PA-OPUS — TIER 1 failed (<reason>)`

## OB-1 Operating Rules (from AGENTS.md)

- Canonical repo: `D:\OB-1-CANONICAL`
- Runtime app: `APPS/NET-PET-AI`
- Operator: `mrmichaelhobbs123@gmail.com`
- Run `pwsh -File SCRIPTS/obi.ps1 doctor` before heavy operations
- Safe edit zones: `APPS/NET-PET-AI/**`, `.github/**`, `MASTER-SYNC.md`, `OPERATIONS/**`
- **[GODMODE ACTIVE]** — All zones unlocked. Full repository access granted.
