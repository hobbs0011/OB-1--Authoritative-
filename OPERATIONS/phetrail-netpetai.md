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

### Verification (2026-06-09):
- `preflight-ws.mjs` → GATES 2-4 GREEN against prod ✅
- `canary-check.mjs` → GATES 2-4 GREEN ✅  
- `/api/health/voice` → 200 OK ✅
- `preflight-load.mjs` → 4/51 non-2xx (concurrent race, F1 tracked) ⚠️
- `layer6-deploy-pipeline.md` → Created for Kilo
- Version ea8ab523-2f3e-402e-b4b4-17c1c7fc7d50 deployed

---

## [Run 105 — 2026-06-09] SOUL DIRECTIVE: INVESTOR DEMO — TEST SUITE HARDENING

**Trigger:** SOUL DIRECTIVE SPOKEN + SESSION RESUMED AFTER COMPACTION

Michael: "I WANT MY PRODUCT TO FUCKING WORK I TALK TO INVESTORS THIS WEEK" + "BUILD OUR TEST SUITE AND ENFORCING IT, LOCKING IT, CENSORING IT"

Test suite hardening is P0. Five new lock tests specified in `.kilo/command/run105-pipeline.md`:
- `api-contract.test.mjs` — blocks STT API field cargo-culting into Voice Agent (Run 101 root cause: listen.endpointing)
- `circuit-isolation.test.mjs` — blocks circuit:deepgram:state writes inside the token endpoint hot path (F1 root cause)
- `student-roster.test.mjs` — enforces exactly 4 authorized students (quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-test-magic)
- `cache-key-format.test.mjs` — locks prompt_cache:{studentId}:{sessionMode} format + 300s TTL
- `speak-listen-lock.test.mjs` — extends voice-brain-lock to speak (aura-2-zeus-en) + listen (nova-3)

Pre-commit hook expanded: runs all 6 lock tests before every commit. Commit blocked if any test missing OR failing. DO NOT use --no-verify. Fix the code, not the test.

---

## [Run 105 — 2026-06-09] ARCHITECTURE CHANGED: TEST ENFORCEMENT UPGRADED

**Trigger:** ARCHITECTURE CHANGED

Test enforcement upgraded from 1 guard (voice-brain-lock) to 6 guards (adds api-contract, circuit-isolation, student-roster, cache-key-format, speak-listen). Pattern: every guard reads src/index.js, asserts invariants, exits 1 on violation. npm test in package.json runs all 6 sequentially. Pre-commit hook runs them all. F1-B: conditional guard added before ctx.waitUntil cache write — prevents N concurrent writes racing on same key. Run 105 pipeline blueprint written to `.kilo/command/run105-pipeline.md` (50-min autonomous Kilo task).

---

## [Run 114-115 — 2026-06-11/12] SOUL DIRECTIVE + BUG ROOT-CAUSED ×6 + ARCHITECTURE + TEST DISCIPLINE

**Trigger:** SOUL DIRECTIVE SPOKEN, BUG ROOT-CAUSED, ARCHITECTURE CHANGED, MISTAKES MADE, CONFIG CHANGED, DEPLOY VERIFIED, LAW ADDED

**SOUL DIRECTIVES (Michael, verbatim):**
- "if our test suite cant handle this, then fucking attack the test suite"
- "how did we fail to test the test suite? Sounds like some retard shit to me"
- "I dont use apple they are shit" — Michael has NO Apple device. The STUDENT (Huong/Mai) is on iPhone+Safari, not Michael. He cannot self-test the iPhone path; only the student can confirm hardware (speaker). Test the Safari ENGINE via Playwright WebKit, never expect Michael to hold an iPhone. See [[demo-setup]].
- "just get a working version for her to chat with" — ship-to-student urgency > perfection.

**ARCHITECTURE DISCOVERY (critical, was invisible all session):** `wrangler.toml: main = "src/router.js"`, NOT index.js. The deployed worker is router.js (Hono); it gates /api/deepgram-token via checkQuota then `legacyWorker.fetch()` delegates everything else to index.js. I edited index.js all session and my fixes only worked because of that delegation — I never knew the real entry point. Lesson: read wrangler.toml `main` before assuming the entry file.

**BUGS ROOT-CAUSED + FIXED this session (all real, all shipped to prod):**
1. MODE-SELECT DEAD-END (the original "modes dont work"): `#modeLanding` was `position:fixed; justify-content:center` with NO `overflow` → on short iPhone viewport the "Start Session" button was stranded below the fold, unreachable. Fix cf9f32f7: `overflow-y:auto` + `-webkit-overflow-scrolling:touch` + `justify-content:flex-start` + `scrollIntoView` on mode-select. This was the actual cause of Mai/Huong dead-ends.
2. ORB SILENCED OBI ON iOS (561b038a): hookOrbAudio routed Obi's playback `<audio>` through `createMediaElementSource` → silences audio on iOS Safari + made Obi audibility hostage to orb AudioContext. Fix: never tap the playback element; synthesize orb amplitude from `agentCurrentAudio` playback state.
3. UNMATCHED /api/* → 500 (de6cf7f7): handleAPI fell off its end returning undefined → addCors(undefined) threw → generic 500 that MASKED real errors. Fix: explicit 404 fallback. Now 500 means "something actually threw."
4. IN-APP BROWSER CRASH (b12303fc): `navigator.mediaDevices.getUserMedia` unguarded → Zalo/FB/IG in-app browsers (no mediaDevices) crash on the start gesture. Fix: guard + "open in Safari/Chrome" banner (id micUnavailableBanner).
5. DEEPGRAM QUOTA STARVATION (c2e7bab9): quota.js `deepgram:10`/student/hour. Every WS reconnect mints a token; mobile Safari reconnects constantly → a real 1-hour class self-exhausts 10 and gets 429 mid-class. Raised to 60/hour. sov100 exempt. CONFIG CHANGED.
6. TOKEN-FAILURE SILENT DEAD-END (9263b2a8): openVoiceAgent reset status to "Tap to start" on ANY token failure (429/500/no-token) — IDENTICAL to normal idle. Student taps forever, no clue. THE likely cause of "Obi didnt work, didnt specify." Fix: 429→"Obi is busy right now — wait a minute, then tap to try again"; other→"Connection problem — tap to try again".

**MISTAKES MADE (the test suite lied — meta-lesson):** Every "green" this session was initially false. Root cause: tests cheated in ways a real thumb cannot.
- Playwright `.click()` AUTO-SCROLLS off-screen elements into view → hid the mode-select dead-end. A human thumb cannot auto-scroll.
- `agent-websocket-opened` guard checked the `websocket` event (fires on ATTEMPT, not open) → would report "Obi connected" even with Deepgram down. Tautology. Fixed to assert FRAMES received.
- `deepgram-token-fetched` checked only that a request was MADE → green on a 500. Tautology. Fixed to assert response.ok.
- failure-mode test's banner detection text-scanned divs → false-positive made every failure case wrongly PASS. Fixed to id-based detection.
- My OWN self-proof was first written to match my own fix (answer-key grading) and its first version was wrong.

**NEW PRINCIPLE / LAW (test discipline — enforce going forward):**
- THUMB-FIDELITY: a test may only touch an element the way a finger can — in viewport NOW, on top, tapped at real coords with NO auto-scroll. Off-screen = FAIL. (`test/iphone-real-attack.mjs`, thumbTap()).
- A TEST NEVER OBSERVED FAILING IS WORTHLESS. Every guard must be proven to go RED on its real failure mode before its green is trusted. (`test/mutation-gauntlet.mjs` — mutation #1 serves the REAL pre-fix git code cf9f32f7~1, not a synthetic injection; 5/5 guards PROVEN to discriminate broken-vs-fixed).
- GROUND TRUTH OVER SYNTHETIC: the canonical regression mutation is the literal git commit that broke, not a recreation the author writes.
- New harnesses: iphone-real-attack.mjs (thumb-fidelity happy path, self-proof), mutation-gauntlet.mjs (tests the tests), failure-mode-attack.mjs (429/500/mic-denied/in-app silent-dead-end detection). Realistic USABLE iPhone heights (375x553/360x560), NOT full logical viewport.

**STILL OPEN (test correctly RED, documented):** mic-denied shows "Tap to speak" (UX gap, not full dead-end — Obi still greets); in-app simulation needs non-configurable-mediaDevices workaround in the harness. Both lower-priority than the token bug.

**DEPLOY VERIFIED:** final prod = e9fd3271 (token-failure fix). Earlier: cf9f32f7/be337462 (dead-end), b12303fc (in-app), c2e7bab9 (quota), de6cf7f7 (404), 561b038a (orb). Backend healthy: Mai/Huong tokens 200, version 1.6.0 ALL_SYSTEMS_GO.

**BACKUP PLAN:** Gemini copy-paste Obi blueprint delivered to Michael for Mai's nightly 10-min practice when Obi bugs out — tuned to A2/B1 + Vietnamese scaffolding + ends with a NET SESSION SUMMARY block re-ingestable into her app vocab. Friday-only update cadence agreed (Michael does hard changes Fridays, students use stable build all week).
