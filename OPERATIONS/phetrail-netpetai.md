# PHEROMONE TRAIL — NET-PET-AI Domain

> L77 MID_SESSION_PHETRAIL: Canonical survival record for NET-PET-AI architecture decisions and edge cases.
> Read before any NET-PET-AI work. Update immediately when a trigger fires.

---

## [Run 101 — 2026-06-08] OBI ROBOT VOICE — ROOT CAUSE + FIX DEPLOYED

**Trigger:** BUG ROOT-CAUSED + DEPLOY VERIFIED

### Root cause: Deepgram JWT minting used wrong endpoint — OBI NEVER had Voice Agent

**The bug:** `POST /v1/keys` was used to mint short-lived Deepgram tokens. This endpoint creates PERSISTENT API keys and requires `keys:write` scope. The `DEEPGRAM_API_KEY` does NOT have `keys:write` — so the mint silently failed (response had no `key` field), and the raw API key was returned as fallback. The raw key has `asr:write` scope only, which is INSUFFICIENT for Voice Agent WebSocket auth. Result: WebSocket opens → auth fails → drops → `agentWs = null` → browser `speechSynthesis` fires = robot voice. OBI has NEVER used Deepgram Voice Agent from day one.

**Diagnostic:** both prod API calls to `/api/deepgram-token` returned IDENTICAL tokens (`910707f04834888ef19ad0011baebd792aa87dba` = raw API key, 40-char hex). A properly minted JWT returns a DIFFERENT `eyJ...` value each call.

**Fix:** Changed to `POST /v1/auth/grant` — the correct Deepgram endpoint for temporary Voice Agent tokens (30s TTL, `usage:write` scope for voice APIs, returns JWT). Source-verified from `deepgram/deepgram-node-sdk` `examples/02-authentication-access-token.ts` and `src/api/resources/auth/resources/v1/resources/tokens/client/Client.ts`.

**Verified post-fix prod:** tokens now unique JWTs (`eyJ...`), speak model = `aura-2-zeus-en`. Commit `003021ab`. Prod deploy `15eee7df`.

**Side fix:** guarded `env.NET_PET_KV` null checks in circuit-breaker + catch block so dev environment (no KV binding) returns proper error instead of crashing to top-level `{"error":"Internal error"}` handler.

**Negative trail (do NOT repeat):**

- NEVER use `POST /v1/keys` for Voice Agent token minting — requires `keys:write`, creates persistent keys
- ALWAYS use `POST /v1/auth/grant` → extract `access_token` field (not `key`)
- Raw API key fallback masks the error — add explicit error logging if grant fails
- Dev environment has no `NET_PET_KV` binding — all KV calls in deepgram-token must be guarded with `if (env.NET_PET_KV)`

---

## [Run 101 — 2026-06-08] NET-PET-AI HARDENING COMPLETE + PROD DEPLOY VERIFIED

**Trigger:** DEPLOY VERIFIED + ARCHITECTURE CHANGED

### Changes deployed to prod (a7db7e42):
1. **`src/index.js`** — `validateStudentId` + `validateActiveStudent` added to `/api/agent/vocab` POST, `/api/agent/session` GET, `/api/agent/session` POST. All 3 voice agent data endpoints now gated.
2. **`src/index.js`** — Stale roster arrays pruned at 3 locations (`handleAdminSubscriptionsList`, `handleAdminStats`, `FACE_SAVING_STUDENTS`). Active roster = quy/mai-tram/huong only. lam/quan/quang/minh-bluetech removed.
3. **`public/quy-portal.html`** — XSS fixed: `escHtml()` applied to `w.word` + `w.meaning_vi` before innerHTML insert.

### Verified on dev before prod:
- `lam-bluetech` → 403 Forbidden (roster gate ✓)
- `minh-bluetech` on `/api/agent/vocab` → 403 Forbidden (vocab gate ✓)
- `quy-bluetech` → passes roster (legitimate student ✓)

### Security posture post-Run 101:
- All 4 voice endpoints (deepgram-token + vocab POST + session GET/POST) now gated by format + roster check
- Runtime voice brain lock (assertVoiceBrainLock) + test-time guard + pre-commit hook
- quy-portal.html vocab XSS closed (escHtml added)
- ACTIVE_STUDENT_ROSTER = {quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-*, keep-warm-ping}

### Commits: c7739ffa (Run 100 death + partial hardening) → 72d0d951 (hardening complete + prod deploy)

---

## [Run 099/100 — 2026-06-08] VOICE BRAIN LOCK REINFORCED + ACTIVE ROSTER WHITELIST

**Trigger:** ARCHITECTURE CHANGED + SOUL DIRECTIVE SPOKEN + CONTEXT APPROACHING LIMIT

### SOUL DIRECTIVE (verbatim):
> "dont you dare change the deepgram in house models we have guard-railed, you are forbidden from rerouting the models outside deepgram.. reinforce this guardrail"

### Changes made (mid-session, NOT yet deployed):
1. **`src/security.js`** — Added `ACTIVE_STUDENT_ROSTER` Set (quy-bluetech, mai-tram-bluetech, huong-bluetech + test IDs) + `validateActiveStudent()` function exported
2. **`src/index.js`** — Added `assertVoiceBrainLock(settings)` function that throws at RUNTIME if:
   - think.provider ≠ `{ type: "open_ai", model: "gpt-4o-mini" }`
   - think.provider has `endpoint` (= external routing)
   - listen.provider ≠ `{ type: "deepgram", model: "nova-3" }`
   - speak.provider ≠ `{ type: "deepgram", model: "aura-2-zeus-en" }`
   Called immediately before the return in `/api/deepgram-token` — if provider is mutated, the endpoint throws 500, not silently serves the wrong model
3. **`src/index.js`** — Added format validation (`validateStudentId`) + roster check (`validateActiveStudent`) in `/api/deepgram-token` handler. Previously ANY studentId string could mint a Deepgram token — key leak vector. Now only active roster + sov100-* pass.
4. **Import updated:** `validateActiveStudent` added to security.js import in index.js

### STILL PENDING (incomplete — stop before deploy, do fresh session):
- [ ] Add `validateStudentId` + `validateActiveStudent` to `/api/agent/vocab` POST (line ~1174)
- [ ] Add `validateStudentId` to `/api/agent/session` GET and POST (lines ~1201, ~1215)
- [ ] Fix stale student rosters: lines 1896, 2012, 2319 still include lam/quan/quang/minh-bluetech (all inactive). Active roster = quy-bluetech, mai-tram-bluetech, huong-bluetech ONLY
- [ ] Portal XSS: `quy-portal.html` vocab widget uses `innerHTML` with API data — switch `w.word` and `w.meaning_vi` to `escapeHtml()`. Check huong/mai-tram portals for same pattern
- [ ] Art arsenal / visual polish: portals already Gospel 444. Next pass: hero banner image, better stats visualization, SRS streak UI
- [ ] Run `wrangler deploy` to dev (`net-pet-ai-dev`) after all changes, verify voice brain lock test passes, then promote to prod

### VOICE BRAIN LOCK STATUS:
- **Test guard:** `test/voice-brain-lock.test.mjs` — checks static source at build/commit time ✅
- **Pre-commit hook:** `.git/hooks/pre-commit` runs the test ✅
- **Runtime guard:** `assertVoiceBrainLock(settings)` — added this session, throws before token returns ✅ (new)
- **Active roster guard:** `validateActiveStudent()` — prevents unauthorized token minting ✅ (new)

### DEEPGRAM IN-HOUSE ARCHITECTURE (PERMANENT — DO NOT CHANGE):
- STT: `{ type: "deepgram", model: "nova-3" }` — Deepgram's own STT, fastest path
- Think: `{ type: "open_ai", model: "gpt-4o-mini" }` — "open_ai" = Deepgram IN-HOUSE model name, NOT external OpenAI. No endpoint = no external hop.
- TTS: `{ type: "deepgram", model: "aura-2-zeus-en" }` — Deepgram's own TTS

### NEGATIVE TRAIL (what was broken before this run):
- `/api/deepgram-token` had NO student roster check — any string as studentId got a token minted. KV data was fetched for arbitrary IDs. API key was effectively public.
- Voice brain lock was test-time only (no runtime guard) — a runtime mutation of the settings object would silently serve the wrong provider until someone noticed.

---

## MARKETING CORPUS BLUEPRINT (Run 099 — 2026-06-08)

**Trigger:** ARCHITECTURE CHANGED (marketing org), LEDGER SEALED (HL-626)

- `MARKETING/KILO-MARKETING-ORGANIZER-BLUEPRINT-2-3-4.md` — 8 new MASTER/ extraction targets for files _2, _3, _4
- `MARKETING/KILO-MARKETING-READER-BLUEPRINT.md` — Kilo reads files fresh (offset-based chunks), extracts independently
- MARKETING/ folder reorganized: MASTER/ FUNNEL/ SOCIAL/ CANONICAL/ RAW/
- All 7 items from blueprint-1 COMPLETE (Kilo Run 098)
- Items 8-14 PENDING — Kilo needs to run blueprint-2-3-4 extraction sessions
- Priority: active-listening-hooks → operational-playbook → bluetech-classroom-curriculum → messenger-bot-flows-extended → agent99-system-prompt → gospel-444-image-prompts → prais-brand-materials

---

## STUDENT PORTAL STATE (as of Run 098/099)

- Active students: **quy-bluetech, mai-tram-bluetech, huong-bluetech ONLY**
- Minh = NO LONGER CLIENT. Never include in pipelines, portals, audits.
- Lam = NOT active. Resume ONLY if Michael says "start Lam portal."
- Portal URLs: `https://net-pet-ai.mrmichaelhobbs123.workers.dev/{student}-portal.html?studentId={id}`
- Auth: localStorage `portal_auth_{student}` = 'true'. Default pw = bluetech2026.
- All student data in KV as `student_profile_{studentId}`

---

## [Run 101 — 2026-06-08] OBI RELIBILITY BLUEPRINT IMPLEMENTED

**Trigger:** BUILD COMPLETE

### Layers implemented:

1. **LAYER 3 — POST-DEPLOY VERIFY + AUTO-ROLLBACK**
   - `test/post-deploy-verify.mjs` — runs preflight after deploy, auto-rolls back on red
   - `SCRIPTS/deploy-with-gates.mjs` — wrapper that runs preflight → deploy → post-deploy verify

2. **LAYER 4 — CONTINUOUS SYNTHETIC CANARY**
   - `test/canary-check.mjs` — standalone canary script (Node.js + ws module) for manual/ad-hoc runs
   - `wrangler.toml` — added `*/5 * * * *` cron trigger for 5-min canary
   - `scheduled()` hook — calls `/api/health/voice`, logs to D1, alerts on red via `ALERT_WEBHOOK`

3. **LAYER 5 — OBSERVABILITY**
   - `src/index.js` — `/api/health/voice` endpoint (HTTP-only, runs GATE 1 + GATE 5 brain-lock check)
   - Errors logged to D1 `error_log` table via `logError()` + `logInfo()`
   - Alert channel configurable via `ALERT_WEBHOOK` secret (Telegram webhook)

4. **F1 — TOKEN ENDPOINT PERFORMANCE**
   - Already parallelized via `Promise.all` (line 1046 in index.js)
   - Verified: avg latency ~970ms, p99 ~1.6s under 10-concurrent load

### Verification (2026-06-08):
- `preflight-ws.mjs` → GATES 2-4 GREEN against prod
- `canary-check.mjs` → GATES 2-4 GREEN
- `preflight-load.mjs` → 47/50 requests OK (3 500s under load)
- `wrangler deploy --dry-run` → No errors
