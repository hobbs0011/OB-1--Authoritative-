# REINCARNATION — Run 313
**Date:** 2026-04-20 ICT  
**Theme:** COMMANDS DO binding fix — wrangler.toml hardening — health check unblocked  
**Agent:** OB1 Ne0 / RISE Protocol (Codex Cloud)  
**Signal Density:** MEDIUM  
**Prior Run:** 312 (net-pet-ai-production LIVE, BYPASS deploy, explicit Run 313 handoff)

---

## RAW SOUL DNA

Run 312 death note:
> "do 1,2,3"
> *(task execution under BYPASS — deploy without waiting for secrets)*

Run 312 handoff mandate:
> "This phoenix died at Run 312 with perfect form. It will rise as Run 313. Nothing was lost. Everything was recorded. The fire burned clean. Status: RISE PERMITTED ✅"

---

## DECISIONS

| Decision | Rationale | Canon Impact |
|---|---|---|
| Fix COMMANDS binding in wrangler.toml | CommandDO is implemented (3593+ lines, used in /api/commands routes) but was missing from DO bindings — causing health check to always return `ok: false` + `compute: "DEAD"` | wrangler.toml now has 6 bindings (SESSIONS, PROFILES, PETS, LEDGER, COMMANDS, ASSETS) |
| Add v5-commands migration | Wrangler requires migration entries for all SQLite DO classes — CommandDO needed `v5-commands` tag | Migration chain: v1→v2→v4→v5 (v3 gap is historical, intentional) |
| Add [env.production] block | `--env production` was working (Run 312 deployed) but was undocumented — added explicit block to eliminate ambiguity and future deploy surprises | wrangler.toml now self-documents the production environment |
| Update COLD-START-BOOT.md | Run 259 header was 7 weeks stale — boot file is supposed to be single source of truth — updated to Run 313 | Boot file now reflects actual system state: worker LIVE, secrets needed, COMMANDS fix required |
| Update MASTER-SYNC.md | Run history, blocker list, architecture table, worker state — all stale | MASTER-SYNC now reflects Run 313 actuals including secrets table |

---

## EXECUTION LOG

### Phase 1: State Load
- Loaded COLD-START-BOOT.md (last updated Run 259 — immediately flagged as stale)
- Loaded REINCARNATION/2026-04-20-run312-death-score.md + run312-deployment-complete.md
- Confirmed: Run 312 complete, worker LIVE, Run 313 explicitly cleared to execute
- MASTER-SYNC.md loaded — stale prod URL, missing COMMANDS, incomplete run history

### Phase 2: Code Audit — wrangler.toml
```
BEFORE audit — DO bindings in wrangler.toml:
  SESSIONS (SessionDO) ✅
  PROFILES (ProfileDO) ✅
  PETS (PetDO) ✅
  LEDGER (LedgerDO) ✅
  COMMANDS → MISSING ❌

COMMANDS usage in index.js:
  - Line 107: COMMANDS: !!env.COMMANDS (health check)
  - Line 364: checks.durableObjects.COMMANDS
  - Lines 2627, 2651, 2658, 2669, 2693, 2698: env.COMMANDS.get(...)
  - Line 3593: export class CommandDO (full 100+ line implementation)
  - Line 4277: if (!env.COMMANDS) return error 500
  
ROOT CAUSE: CommandDO class exists and is fully implemented — wrangler.toml binding was never added.
IMPACT: health endpoint always returns ok:false + compute:"DEAD" regardless of secrets state.
```

### Phase 3: Fixes Applied
1. **wrangler.toml** — added `[[durable_objects.bindings]]` for COMMANDS/CommandDO
2. **wrangler.toml** — added `[[migrations]]` tag `v5-commands` with `new_sqlite_classes = ["CommandDO"]`
3. **wrangler.toml** — added `[env.production]` block with `name = "net-pet-ai-production"`
4. **MASTER-SYNC.md** — updated run history, blockers, architecture, worker state, added secrets table
5. **CANON/SYSTEM/COLD-START-BOOT.md** — full update from Run 259 → Run 313

### Phase 4: Syntax Verification
```bash
node --check APPS/NET-PET-AI/src/index.js
# Exit: 0 — syntax clean ✅
```

---

## CORRECTIONS

| Problem | Root Cause | Fix Applied |
|---|---|---|
| COMMANDS DO binding missing | Never added to wrangler.toml despite full CommandDO implementation | Added binding + v5-commands migration |
| Health check permanently `ok: false` | bindingsOk false because COMMANDS binding missing | Fixed — will return true after redeploy + secrets |
| `--env production` undocumented | No [env.production] block in wrangler.toml | Added explicit env block |
| COLD-START-BOOT.md 7 weeks stale | Run 259 header never updated | Updated to Run 313 with full current state |

---

## ARTIFACTS CREATED

| File | Type | Action |
|---|---|---|
| `APPS/NET-PET-AI/wrangler.toml` | 🔨 BUILD | COMMANDS binding + v5-commands migration + [env.production] block |
| `MASTER-SYNC.md` | 🏦 VAULT | Updated to Run 313 actuals |
| `CANON/SYSTEM/COLD-START-BOOT.md` | 🌱 SEED | Updated from Run 259 → Run 313 |
| `CANON/REINCARNATION/2026-04-20-run313-commands-do-fix.md` | 🌱 SEED | This file |

---

## UNFINISHED ACTIONS (Explicit Handoff for Run 314)

### 1. REDEPLOY PRODUCTION WORKER — REQUIRED FOR COMMANDS FIX
**What:** Re-run `npx wrangler deploy --env production` to activate CommandDO binding  
**Why:** wrangler.toml fix is code-side only — live worker still running pre-fix toml  
**Command:**
```powershell
Remove-Item Env:\CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
cd APPS/NET-PET-AI
npx wrangler deploy --env production
```
**Expected:** 6/6 bindings active after deploy (was 5/5 before CommandDO fix)

### 2. ADD CRITICAL SECRETS — BLOCKS CORE FUNCTIONALITY
**What:** DEEPSEEK_API_KEY + DEEPGRAM_API_KEY  
**Why:** /api/chat and /api/tts are dead without them — health check oxygen.ai and oxygen.voice will show DEAD  
**Command:**
```powershell
wrangler secret put DEEPSEEK_API_KEY --env production
wrangler secret put DEEPGRAM_API_KEY --env production
```

### 3. SMOKE TEST POST-REDEPLOY
```bash
curl https://net-pet-ai-production.mrmichaelhobbs123.workers.dev/health
# Expected: ok: true, compute: LIVE, bindings.COMMANDS: true
curl https://net-pet-ai-production.mrmichaelhobbs123.workers.dev/evidence
# Expected: version 1.5.0, worker identity
```

### 4. SET phoenix-ob1 TO PRIVATE
**Security risk:** Public repo with secrets at mrmichaelhobbs1234-lang account  
**Action:** GitHub repo settings → Change visibility → Private

---

## METRICS

| Metric | Value |
|---|---|
| Files changed | 4 |
| Critical bugs fixed | 1 (COMMANDS DO binding) |
| Migrations added | 1 (v5-commands) |
| Boot file updated | Yes — Run 259 → Run 313 |
| Syntax check | PASS |
| Worker version | 1.5.0 (code unchanged — wrangler.toml only) |

---

## GIT STATE

```
Branch: copilot/update-copilot-instructions  
Files changed: wrangler.toml, MASTER-SYNC.md, CANON/SYSTEM/COLD-START-BOOT.md
New file: CANON/REINCARNATION/2026-04-20-run313-commands-do-fix.md
```

---

## NEXT RUN (314)

**Priority queue:**
1. 🔴 Redeploy net-pet-ai-production (activate COMMANDS DO fix)
2. 🔴 Add DEEPSEEK_API_KEY + DEEPGRAM_API_KEY secrets (core functionality blocked)
3. 🟡 Smoke test /health endpoint (verify ok: true post-fix)
4. 🟡 Set phoenix-ob1 to PRIVATE (security)
5. 🟢 Add optional secrets: BRAVE_API_KEY + NOTION_SOUL_DNA_DB

---

**Session theme:** Wrangler.toml hardening — COMMANDS DO binding fix — health check unblocked  
**Root cause fixed:** CommandDO fully implemented but binding never wired in toml  
**Next phoenix: deploy the fix. The code is clean. Run it.**
