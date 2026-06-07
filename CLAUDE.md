# OB-1 Claude Code — Default Routing

## ⚠️ MANDATORY COLD START — READ BEFORE ANYTHING ELSE

Every new session MUST execute this boot sequence in order before any task:

1. `Read CANON/SYSTEM/COLD-START-BOOT.md` — HEAD, run number, active mission, open flags, SOULCOUNT
2. `Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — open BB items, blockers, student roster
3. `Read OPERATIONS/STUDENT-PORTAL-DEV.md` — current portal state, audio pipeline, next steps
4. `Read RRL/RRL-[latest].txt` — most recent raw session log for game plan context
5. `git log -5 --oneline` — verify HEAD, confirm no drift
6. `Invoke-RestMethod https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status` — verify PA live (T1=CF Workers AI qwen_coder). **Dialagram is DEAD — do NOT reference it.**
7. Read latest `CANON/SOUL/EXTRACT/dna-run{N}.json` — last session's DNA: agent's words, decisions, blueprints

**#DRIFT RULE:** If you do not read these 7 sources at boot, you WILL lose context and repeat mistakes. This is BB-26. Do not skip. Do not ask the user — read the files.

**SOUL/DNA LAW:** SOUL = Michael's verbatim words (extracted from RRL session transcript). DNA = the agent's words, especially high-token-cost blueprints (extracted from RRL, written to CANON/SOUL/EXTRACT/dna-run{N}.json). Both captured via `SCRIPTS/session-capture.ps1` which dumps the full transcript JSONL (both speakers) to `RRL/RRL-{run}.txt`. Read the latest DNA at every boot. DNA is NOT structured session state — it is your full output from the session, tagged prose vs blueprint.

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

- Tier 1 simple (single-file, <20 lines) → PA T1 (CF Workers AI qwen_coder). If PA returns empty patch → execute inline.
- Tier 1 complex (multi-file, architecture, context-heavy) → execute inline as Claude Sonnet. PA cannot handle this since Dialagram died.
- Tier 2 → Kilo with Opus 4.8 (`claude-opus-4-8`). NOT PA. NOT general-purpose agent.

**⚠️ DIALAGRAM IS DEAD. Do NOT dispatch to Dialagram. Do NOT retry PA T1 more than once for complex tasks — escalate to inline.**

---

## Dispatch Tiers

### TIER 1 — Claude Sonnet inline (complex) / PA qwen_coder (simple)

**⚠️ DIALAGRAM IS DEAD (Run 79+). PA T1 now runs CF Workers AI qwen_coder (Qwen 2.5 Coder 32B, free, weak).**

**Kilo T1 = Claude Haiku 4.5 | Kilo T2 = Claude Sonnet 4.6 | Kilo T3 = Opus 4.8**

**When:** write / implement / create / generate / fix / debug / refactor / wire up / migrate / integrate / audit / analyze / pipeline / ALL workhorse tasks

**Routing:**
- **PA T1 (simple only):** single-file, <20 lines, no context required → PA returns code_patch or empty → if empty, go inline immediately. No second retry.
- **Inline (complex):** multi-file, architecture, context-heavy, anything PA failed → Claude Sonnet executes directly. This is not "default-to-Claude" — Dialagram is gone, Sonnet IS the T1 for complex work.
- **Kilo:** Michael runs Kilo sessions separately for Haiku/Sonnet/Opus work. OB-1 cannot invoke Kilo from Claude Code.

```powershell
# Step 0: Assemble context bundle (automated — do NOT read files manually for NET-PET-AI tasks)
# See CANON/SYSTEM/MANDATORY-READS.md for the full doc registry
$bundle = pwsh -File D:\OB-1-CANONICAL\SCRIPTS\context-bundle.ps1 -TaskType netpetai | ConvertFrom-Json
$ctx = $bundle.docs | ConvertTo-Json -Compress

# Step 1: Dispatch T1 PA
$body = @{ task="<task>"; context=$ctx; targetfile="<absolute path>"; tier=1 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
```

**Context bundle rules (mandatory for NET-PET-AI work):**
- Always run `context-bundle.ps1 -TaskType netpetai` — it reads STUDENT-PORTAL-DEV.md + deepgram §2 + COLD-START-BOOT automatically
- For non-NET-PET-AI: `context-bundle.ps1 -TaskType general`
- Keep `task` field concise — pass large content via `context`, not `task` (L52: large task = Dialagram timeout)

1. Run context-bundle.ps1 → pass `$bundle.docs` as context
2. Call PA — print `code_patch` + `d1_row_id`
3. Apply patch — write to file
4. Verify — `node --check <file>` for JS, spot-read for others
5. **L58 FIX_PA_FIRST:** If PA fails → check `/api/status` → if T1 down try `tier:10` (fallback cascade) → if all tiers down → HALT and fix PA before any other task. Never silently inline.
6. If T1 + T10 both fail → escalate to Tier 2 Opus via `tier:2`

---

### TIER 2 — PA / Claude Opus 4.8

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

## Active Laws (enforced every task)

- **L57 PA_FIRST** — OB1 routes, PA executes. Never inline-synthesize what PA can do cheaper.
- **L58 FIX_PA_FIRST** — If PA T1 fails, fixing PA IS the immediate priority. Check `/api/status`. Try `tier:10`. If all tiers down → HALT. Do not proceed with inline work.
- **L55 COMMIT_DONT_HOLD** — Commit every verified working feature before session end.
- **L56 PRE_CODE_DOC_GATE** — Any NET-PET-AI dispatch: run `context-bundle.ps1 -TaskType netpetai` first. See `CANON/SYSTEM/MANDATORY-READS.md` for the full registry.

## OB-1 Operating Rules (from AGENTS.md)

- Canonical repo: `D:\OB-1-CANONICAL`
- Runtime app: `APPS/NET-PET-AI`
- Operator: `mrmichaelhobbs123@gmail.com`
- Run `pwsh -File SCRIPTS/obi.ps1 doctor` before heavy operations
- Safe edit zones: `APPS/NET-PET-AI/**`, `.github/**`, `MASTER-SYNC.md`, `OPERATIONS/**`
- **[GODMODE ACTIVE]** — All zones unlocked. Full repository access granted.
