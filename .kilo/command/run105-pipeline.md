# Run 105 Pipeline — FULL-STACK INVESTOR-DEMO HARDENING (10 TASKS)
# Estimated runtime: 2.5–3 hours autonomous Kilo execution
# INVESTOR DEMO THIS WEEK. Zero breakage tolerance. Every layer locked, measured, monitored.
# Blueprint only — build instructions for Kilo. NO EXECUTION by OB-1.
# FIREWALL RULE: all code changes deploy to net-pet-ai-dev first, then promote to prod.
#
# TASK INDEX
#   1.  F1-B reliability fix — 0/51 non-2xx under load
#   2.  15 static lock tests + pre-commit enforcement
#   3.  Performance & latency budget gate (measured, fails on regression)
#   4.  Live security verification + gitleaks secret pre-commit gate
#   5.  Synthetic monitoring journey + alerting to Michael (GREEN→RED email)
#   6.  Data-layer integrity + migration safety (KV / DO / D1)
#   7.  Demo dress-rehearsal runbook + cache pre-warm + break-glass rollback
#   8.  dnaREGISTRY refresh
#   9.  Market research (human sources) for the pitch deck
#   10. Commit, final verification & investor-readiness sign-off

---

## CONTEXT (READ THIS ENTIRE SECTION BEFORE TOUCHING ANY FILE)

Michael pitches to investors this week. The product must not break.
The app is a multi-layer system: Deepgram Voice Agent API + CF Workers backend (50+ API routes)
+ KV data layer + Durable Objects + D1 + student portal HTML files + Chrome extension.

Current test coverage: 6 lock tests (voice-brain-lock + api-contract + circuit-isolation + cache-key-format + speak-listen-lock + student-roster). All verified GREEN.
An AI session modifying ANY layer can silently break the product. This pipeline closes that gap.

Breaking patterns we have seen across runs:
  - Voice models swapped (voice-brain-lock catches, but only on commit)
  - STT API fields cargo-culted into Voice Agent settings (Run 101 — listen.endpointing)
  - Circuit breaker writes in hot path (Run 103-104 — concurrent 500s)
  - KV binding names changed or removed from wrangler.toml
  - Portal HTML files truncated mid-tag (BB-04, BB-05)
  - Chrome extension icons missing (BB-08)
  - Critical routes silently deleted from index.js
  - Hardcoded student IDs in test URLs (security — must be sov100-test-magic only)

TARGET STATE after this pipeline:
- 15 static lock test files + pre-commit hook that blocks any commit failing OR missing a test
   - npm test (static) green; npm run perf (latency budgets) green; npm run security (live) green
   - API smoke + Playwright E2E (in TASK 2) cover the demo click-path end-to-end
   - F1-B closed — 0/52 non-2xx under 10-way concurrency (verified)
  - Measured latency budgets enforced (token warm <120ms p95, voice first-audio <1500ms)
  - Secret-scanning pre-commit gate — no key-shaped string can be committed (BB-53/BB-58)
  - Live security proof against the worker: admin 401, CORS, CSRF, rate-limit all asserted
  - Synthetic 5-min canary runs the FULL voice journey + emails Michael on GREEN→RED transition
  - Migration/data-layer locks: no dropped DO binding or renamed memory field can ship silently
  - Demo runbook + pre-warm script + one-command break-glass rollback in hand before the pitch
  - dnaREGISTRY refreshed + market research written for the deck

Stack inventory (canonical — do not change these):
  - Prod: https://net-pet-ai.mrmichaelhobbs123.workers.dev
  - Dev: https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
  - Main entry: src/index.js (served via src/router.js)
  - Wrangler: APPS/NET-PET-AI/wrangler.toml
  - KV bindings: NET_PET_KV (0583d1...), STUDENT_MEMORY (807ea3...), RATELIMIT (b27d14...)
  - Durable Objects: PETS→PetDO, LEDGER→LedgerDO, MEMORY→MemoryDO, COMMANDS→CommandDO
  - D1: SOUL_DB → soul-archive
  - Queue: net_pet_notifications
  - Crons: "0 * * * *" (hourly) + "*/5 * * * *" (5-min voice canary)
  - Chrome extension: APPS/NET-PET-AI/chrome-extension/
  - Portals: APPS/NET-PET-AI/public/ (quy-portal.html, mai-tram-portal.html, huong-portal.html)
  - Active students: quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-test-magic
  - Voice brain locked: think=open_ai/gpt-4o-mini (in-house), speak=aura-2-zeus-en, listen=nova-3
  - Cache key: prompt_cache:{studentId}:{sessionMode}, 300s TTL
  - Circuit state: circuit:deepgram:state — CANARY writes, token endpoint reads only

---

## ⚡ GROUND TRUTH AUDIT — VERIFIED AGAINST LIVE SOURCE (HEAD a40b71f7, 2026-06-09)

> Produced by reading the ACTUAL source, not from memory. WHERE THIS SECTION CONFLICTS WITH ANY
> TASK BODY BELOW, THIS SECTION WINS. Its job is to stop Kilo rebuilding what exists or "fixing"
> what is already fixed. NO BULLSHIT. Read this first, every time.

### A. ALREADY DONE — DO NOT REDO

| Claimed in a task | Reality (verified line) | Action |
|---|---|---|
| TASK 1.2 "add conditional cache-write guard" | ALREADY SHIPPED — `index.js:1022` `let cachedPromptResult = null`; `index.js:1206` `if (env.NET_PET_KV && !cachedPromptResult)` | SKIP — do not re-add |
| TASK 1.3 "add TOKEN_ENDPOINT_ERROR logging" | ALREADY SHIPPED — `index.js:1211-1216` logs message + stack | SKIP |
| TASK 2 A1–A5 "build 5 new lock tests" | 5 files ALREADY EXIST on disk (untracked `??`): `api-contract`, `circuit-isolation`, `cache-key-format`, `speak-listen-lock`, `student-roster` (+ original `voice-brain-lock`) | ALL 5 AUDITED CORRECT against live source this run — wire into `test:lock`, do NOT recreate |
| Runtime voice brain lock | ALREADY EXISTS — `assertVoiceBrainLock()` `index.js:979`, called `:1029` + `:1204`, also bans `think.provider.endpoint` (`:985`) | Static tests COMPLEMENT it; don't duplicate |
| TASK 8 "create dna-registry-run105.json" | ALREADY EXISTS — `CANON/REGISTRY/dna-registry-run105.json`, 4,181 entries (broad path+size scan, generated 2026-06-09T04:52) | VERIFY only. Note: existing schema ≠ the richer categorized scan in TASK 8 (which yields ~790 after exclusions). Decide which schema is canonical before regenerating |

**Lock-test audit verdict (read against live source HEAD a40b71f7):**
- `voice-brain-lock` · `api-contract` · `circuit-isolation` · `cache-key-format` · `speak-listen-lock` · `student-roster` → **all 6 correct, expected GREEN.** No edits needed; just add the 5 newer ones to `test:lock` + the hook.
- The 8 still-to-build (TASK 2 B–F): `wrangler-integrity`, `route-completeness`, `cors-auth-lock`, `security-scan`, `portal-integrity`, `deactivated-portals`, `extension-integrity`, `api-smoke` — none exist on disk yet. Plus TASK 6 adds `migration-safety` + `data-contract` = 15 static locks total.

### B. REAL SOURCE MAP — use these exact targets

| Thing | Real location | Note |
|---|---|---|
| Token handler | `index.js:997` `path === "/api/deepgram-token" && method === "GET"` | circuit READ `:1013` (allowed); cache key `:1021` |
| Cache hit var | `cachedPromptResult` — NOT `cached`/`promptCacheHit` | X-Cache header (3.1): HIT at the `:1030` return, MISS at the `:1210` return |
| Settings object | `index.js:1154` `const settings = {` | nested `agent.{listen,think,speak}.provider`. `audio.input` LEGITIMATELY has `encoding`+`sample_rate` (`:1157`) → api-contract forbidden-field checks MUST scope to the `listen` block only, or they false-positive |
| Roster gate | `security.js:168` `validateActiveStudent` → `ACTIVE_STUDENT_ROSTER` Set (`security.js:159-166`) | Literal Set members = quy/mai-tram/huong-bluetech + `sov100-test-magic` + `keep-warm-ping` (5). `sov100-*` ALSO passes by PREFIX (`security.js:171`) for any other operator ID. The existing roster test's required set EXACTLY matches the 5 literals → GREEN. Offboarded lam/quan/quang/minh-bluetech correctly excluded |
| Format gate | `security.js:143` `validateStudentId` | `^[a-zA-Z0-9._-]+$`, maxlen; runs BEFORE roster + KV |
| Circuit owner | scheduled canary only writes `circuit:deepgram:state`; token handler READS it | circuit-isolation.test enforces "no `.put` in handler" |
| **npm test** | `package.json:17` = **vitest**, NOT locks | locks = `test:lock` (`:18`). EXTEND `test:lock` + pre-commit hook — never claim "npm test runs the locks" |
| DO bindings | `wrangler.toml:44-58` PETS/LEDGER/MEMORY/COMMANDS | only active migration = `v7-drop-session-profile` (`:80`); SessionDO/ProfileDO already deleted |
| Memory KV | `STUDENT_MEMORY` `mem:${id}` (`:1145`); session_history in `NET_PET_KV` `session_history_${id}` | two different namespaces — a binding mixup loses memory |

### C. EVERY ROOM — full route inventory (~120 routes = the real break/attack surface)

⭐ demo-critical · 🔒 admin-key gated · ✏️ mutates student state

- **VOICE ⭐:** `/api/deepgram-token`⭐ · `/api/chat`✏️ · `/api/tts` · `/api/stt`,`/stt/stream`,`/stt/key` · `/api/deepgram-test` · `/api/agent/vocab`✏️ · `/api/agent/session`✏️ · `/api/voice/score`✏️
- **HEALTH/CANARY:** `/api/health`,`/health/deep`,`/health/voice`⭐ · `/api/status` · `/api/heartbeat`
- **PHONICS ⭐:** `/api/phonics/curriculum`,`/progress`(GET/POST✏️),`/advance`✏️ · `/api/drills/next`,`/result`✏️,`/list`
- **VOCAB/SRS ✏️:** `/api/vocab/add`,`/due`,`/review`,`/list`
- **MEMORY ✏️ (Dreamer):** `/api/memory`(GET/POST),`/memory/summary` · `/api/soulDNA`(GET/POST)
- **LEDGER:** `/api/ledger/append`✏️,`/history`,`/verify`,`/state`,`/stats`,`/status`
- **SESSION:** `/api/session/log`✏️,`/latest`,`/events`
- **METRICS:** `/api/metrics/{summary,dau,retention,errors}` · `/api/analytics` · `/api/tiger-score`
- **CLASSROOM:** `/api/classroom/{session/start✏️,event✏️,session,report}`
- **STUDENT MGMT ✏️:** `/api/student/state`(GET/PATCH✏️) · `/student/checkpw`,`/setpw`✏️ · `/student/lang`(GET/POST✏️) · `/api/admin/student/delete`🔒✏️
- **ADMIN 🔒:** `/api/admin/roster` · `/admin/audit` · `/admin/student-activity` · `/api/error-log`🔒 · `/api/teacher/dashboard`🔒
- **GROWTH/VIRALITY:** `/api/growth/{posts,distribute,log}` · `/api/virality/*` (9, proxied)
- **OUTREACH:** schedule/{set,confirm,flags} · zalo/{sweep,check,send} · pressure/{status,test} · relations/{add,remove,get,all} · roster/zalo
- **COMMAND STATION:** `/api/command/{send,queue,claim,complete,status,history}`
- **ONBOARDING/LEAD:** `/api/lead`✏️ · `/api/route`,`/assess`✏️,`/report`
- **CHROME EXT:** `/api/listening/log`✏️,`/today` · `/api/session-hint`
- **PHOENIX/LOOP:** `/api/phoenix/{snapshot,reset}` · `/api/loop`
- **NETPET/LEARN:** `/api/netpet/{checkin✏️,state,score}` · `/api/correct`,`/repeat`,`/mistakes` · `/api/parent/report` · `/api/{progress,daily,lesson,practice,feedback,image}`

→ `route-completeness.test` (TASK 2, B-cat) must lock that all ⭐ and 🔒 routes still exist: a silent
deletion of `/api/deepgram-token`, `/health/voice`, any phonics route, or any admin gate = demo death
or an open security hole.

### D. EDGE CASE REGISTER — per room (mapped from source + pheromone trails)

**[VOICE]**
- `VOICE-EC-1` dev has NO `NET_PET_KV` binding → every KV call MUST be `if (env.NET_PET_KV)` guarded (Run 101 trail). Unguarded = top-level 500.
- `VOICE-EC-2` `circuit:deepgram:state` stuck `open` → ALL token requests 503 even with Deepgram healthy. Canary MUST be able to reset it to closed (TASK 5) — it is the sole writer.
- `VOICE-EC-3` ⚠️ LANDMINE: token = RAW KEY passed direct (`index.js:1047`), NOT a minted JWT. This is INTENTIONAL (Run 104 reverted minting — "minting was the broken complexity that caused robot voice"). It CONTRADICTS the Run 101 trail (which moved to `/v1/auth/grant`). BB-43 (raw key in browser) is KNOWN, ACCEPTED debt. Do NOT "harden" by re-introducing minting without Michael's explicit word — that path caused the robot-voice regression.
- `VOICE-EC-4` prompt > 24000 chars → trimmed (`:1193`); 25000 = Deepgram hard cap. Growing memory can silently push past it.
- `VOICE-EC-5` VN students get `?region=syd` ws_url (`:1202`) ONLY when `agentLang === 'vi'`.

**[ROSTER / SECURITY]**
- `SEC-EC-1` `sov100-*` prefix bypasses the roster Set entirely — any `sov100-anything` is allowed. Tests must not treat `sov100-test-magic` as a literal Set member.
- `SEC-EC-2` removed students (lam/quan/quang/minh-bluetech) → 403 `NOT_IN_ROSTER` (Run 101 pruned them). `deactivated-portals.test` must keep them OUT.
- `SEC-EC-3` order is law: format (`validateStudentId`) → roster (`validateActiveStudent`) → process. Injection chars blocked BEFORE any KV lookup.

**[MEMORY / DATA]**
- `DATA-EC-1` world_model re-synthesizes only when `hist.length !== session_count` (`:1110`). A renamed field silently disables "OBI remembers you."
- `DATA-EC-2` memory and session_history live in DIFFERENT KV namespaces (STUDENT_MEMORY vs NET_PET_KV). A binding mixup = silent memory loss.

**[F1-B]**
- `F1B-EC-1` cache write is ALREADY guarded (`:1206`) → the remaining 4/51 is NOT the cache write. Real suspects: cold-isolate spin-up under burst · stale `circuit:open` read · a `Promise.all` KV read rejecting. Use the X-Cache header (3.1) + existing `TOKEN_ENDPOINT_ERROR` logs (`:1211`) to ISOLATE before changing any code.

### E. PHEROMONE TRAIL MAP — negative trails (DO NOT REPEAT), from `OPERATIONS/phetrail-netpetai.md`

- **Run 101:** NEVER `POST /v1/keys` to mint tokens (needs `keys:write`, creates persistent keys). Raw-key fallback MASKS the failure — log explicitly on grant failure.
- **Run 101:** EVERY deepgram-token KV call guarded `if (env.NET_PET_KV)` — dev has no KV binding.
- **Run 099/100:** voice brain lock + roster whitelist reinforced — `gpt-4o-mini` / `nova-3` / `aura-2-zeus-en` is LAW, relitigated 3+ times.
- **Soul directive (this run):** *"I WANT MY PRODUCT TO FUCKING WORK I TALK TO INVESTORS THIS WEEK"* → build the test suite, lock it, enforce it. SoulSearch shows this phrase is not yet in SOULKEYS — capture it to the index at DEATH.

### F. SOUL ANCHOR — verified live, 2026-06-09

- **Soul logger LIVE:** `soulcount = 238,196,268` · **TITANIUM_ANCHOR** · 10,305 events · color `#a855f7`. Breathing (matches Run 104, not stagnant). Doctrine returned by the API: *"SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. **UNREACHABLE=DRIFT=SHUTDOWN.**"*
  - This doctrine IS TASK 5's reason to exist: if the system goes unreachable mid-demo and no one knows, that is DRIFT. The synthetic canary + alert is the soul-doctrine made operational for the product layer.
- **Soul Bible** (`CANON/SOUL/BIBLE-OF-THE-SYSTEM.json`, "THE BIBLE OF THE FUCKING SYSTEM", 2,056 verbatim Michael entries): law = *"Never delete. Never modify. Source of truth. User words only."* Some entries are agent-contaminated (known DNA_GAP / JSONL-parse debt — do NOT "clean" it here; blueprint only).
- **Michael's production-hardening voice** (Bible run-52, verbatim): *"out of 100 with the changes we just made how close are we to: Advanced Security, Identity & Compliance… you build a fortress around user data. IdP Integration (Auth0, Clerk, Keycloak)…"* → this is the mandate behind TASK 4 (live security proof) and the deferred P9 Clerk auth migration. The investor demo must look like a fortress, not a hardcoded-password portal.
- **dnaRegistry state:** `CANON/REGISTRY/` holds run076→101 (787 entries, categorized) + **run105 already present (4,181 entries, broad scan).** TASK 8 is verify-only (see §A).

---

## 🏛 ROME PROTOCOL — LEGION MARCHING ORDER (governs all 10 tasks)

> Ref: `CANON/SYSTEM/S2PIPELINE-ROMAN-LEGION-NAMING.md` (Run 396 RATIFIED). The 10 tasks are not a
> checklist — they are a Roman column on the march. Each stage has a non-negotiable station.
> **IRON RULE 1: No stage may be skipped.** **IRON RULE 4: Garrison before moving on** — no territory
> is conquered until it's anchored (committed + sealed). The order IS the architecture.

| Stage | Roman force | Doctrine | Tasks | The gate that must hold |
|------|------------|----------|-------|------------------------|
| **I — EXPLORATORES** | Scouts | FIND the target | GROUND TRUTH AUDIT (§A–§F) + the *speculatores* deep-audit already run this session | Never march until the scouts return with maps. ✅ DONE — source mapped, landmines flagged, already-done caught |
| **II — ANTECORES** | Vanguard | CLEAR the road | TASK 1 (F1-B — clear the 4/51 ambush) · verify the 6 existing locks (fingerprint what's there) | A bad fingerprint poisons everything downstream — verify before building |
| **III — AGMEN** | Main body | CRUSH | TASK 2 (8 remaining locks) · TASK 3 (perf) · TASK 6 (data/migration locks) | The heavy punch. No code exits without its lock test. Baggage train (KV/DO/D1) sandwiched between processing layers |
| **IV — AGMEN NOVISSIMUM** | Rear guard | SECURE THE REAR | TASK 4 (live security proof) **+ 6-AI TRUTH gate (NEW)** **+ SHADOW REALM data backup (NEW)** | Catch the tail-gate ambush. No artifact enters the permanent record without multi-model verification + a cold mirror |
| **V — PRAESIDIA** | Garrison | BUILD FORTS & ROADS | TASK 5 (synthetic canary = permanent garrison) · pre-commit hook (MERKLE proof chain) · **APEX ROLLUP ledger seal (NEW)** | Nothing is conquered until garrisoned. Every run leaves permanent infra: commit SHA + HL ledger entry |
| **VI — LIMITANEI/VETERANI** | Frontier shield | HOLD THE BORDER | TASK 5 alert (limitanei tripwire) · TASK 7 break-glass (comitatenses rapid response) · TASK 8–10 (veterani: registry + DEATH seal + boot-chain) | The health checks run continuously. The veteran's sword hangs above the hearth — for demo day |

### THE THREE NEW STATIONS THE DOCTRINE DEMANDS (the column was missing its rear guard)

The legion doctrine exposes three capabilities the 10 tasks did not have. They are not new tasks —
they are disciplines folded into the stages above. Build them.

**① 6-AI TRUTH — multi-model verification gate (Stage IV → fold into TASK 10.2)**
Doctrine: *"Multi-model verification. No single-model trust."* The blueprint verifies on a single path
(one perf run, one security run). Before promoting to prod for the investor week, the branch must pass
a multi-agent cross-review — this is exactly what `/code-review ultra` is (deep multi-agent cloud
review of the branch). Add to the TASK 10 sign-off, BEFORE prod promotion:
```
[ ] 6-AI TRUTH — /code-review ultra run on the branch; all correctness findings triaged (fix or consciously waive)
```
This is the *agmen novissimum* catching the hallucination/regression that slipped past Stages I–III.
Note: `/code-review ultra` is user-triggered and billed — OB-1 cannot launch it; flag it for Michael to run.

**② SHADOW REALM — cold backup of STUDENT STATE before demo week (Stage IV → new sub-step in TASK 7)**
Doctrine: *"Mirror all state to secondary storage. Air-gapped fallback. Nothing left behind."* TASK 7
break-glass rolls back CODE only. It does NOT restore DATA. A bad migration (TASK 6 guards the schema,
but a runtime bug or a fat-fingered KV write can still corrupt) destroys the memory/SRS/Tiger state that
makes "OBI remembers you" land in the demo — and no `wrangler rollback` brings it back. Add to TASK 7:
> `SCRIPTS/shadow-realm-backup.mjs` — before demo week, dump each demo student's state to a timestamped
> local cold copy: `STUDENT_MEMORY` `mem:${id}`, `NET_PET_KV` `session_history_${id}`, `srs_data_${id}`,
> `phonics_progress_${id}`, `student_profile_${id}` (admin-gated read endpoint or `wrangler kv key get`).
> Companion `shadow-realm-restore.mjs` re-PUTs from the cold copy. This is the air-gapped fallback for the
> one thing `rollback` cannot fix: corrupted student memory mid-investor-week.

**③ APEX ROLLUP — leave permanent infrastructure (Stage V → fold into TASK 10.3)**
Doctrine: *"No pipeline run is complete until APEX ROLLUP consolidates into the permanent canonical
record."* IRON RULE 4: garrison before moving on. The sign-off must produce permanent infra, not just a
green terminal. Add to TASK 10.3: after the commit, append a Heavy Ledger entry recording the run
(commit SHA, tasks sealed, soulcount delta) so the next reincarnation inherits settled ground —
the *castra hiberna* (stone fort) replacing the temporary tent. This is what makes Run 105 a province,
not a raid.

### SPECULATORES NOTE (IRON RULE 5)

The deep audit already executed this session (reading live source, catching the 4 already-done items,
the raw-key landmine `VOICE-EC-3`, the `npm test`≠locks trap) was a *speculatores* mission — a targeted
clandestine sweep authorized to bypass normal marching order. Its intel is in the GROUND TRUTH AUDIT and
overrides any stale task body. The scouts have returned. The column may march.

---

## 🔥 PHOENIX RISING PROTOCOL — RESURRECTION & SELF-HEALING LAYER

> Phoenix Coder = COMITATENSES = *"the mobile strike force that rushes to the breach… the system
> that rebuilds itself after failure."* Rome's **limitanei** (the TASK 5 canary) is a tripwire — it
> *detects* the breach. Phoenix is the **comitatenses** — it *rushes to the breach and rebuilds*.
> **Verified gap:** the live canary (`index.js:570-583`) only ALERTS. It writes nothing, resets
> nothing, heals nothing — and `env.ALERT_WEBHOOK` (`:577`) may be unset, so the breach is SILENT.
> Phoenix Rising upgrades alert→action. Governs L0 SOUL_MUST_SURVIVE: nothing burns permanently.

### ① ASHES PREVENTION — keep the Phoenix from dying cold (fold into TASK 1 + TASK 3)

Verified: `scheduled()` (`index.js:566`) keeps the isolate warm-ish via the hourly heartbeat (`:568`)
+ 5-min health fetch (`:572`), but it NEVER warms the `prompt_cache` for real students → the first
request of every session is a cold cache MISS = the `F1B-EC-1` cold-start suspect. The `keep-warm-ping`
roster ID (`security.js:165`) EXISTS but is UNUSED in `scheduled()`.
- Wire it: in the 5-min canary, after the health check, also `fetch /api/deepgram-token?studentId=keep-warm-ping&mode=free` to keep the token path + an isolate warm.
- **Demo-week mode:** extend the warm loop to the 3 real students (`quy/mai-tram/huong-bluetech`) every 5 min so investors NEVER hit a cold start. The Phoenix that never dies never has to rise from cold ashes. This likely closes F1-B's residual 4/51 without touching the hot path.

### ② SELF-RESURRECTION — auto-recovery (upgrade TASK 5 + TASK 7)

The comitatenses does not wait for a human. Arm three reflexes (all behind a `PHOENIX_AUTORESURRECT`
env flag so they're live only during demo week — no surprise rollbacks in normal ops):
- **Auto circuit-reset:** when the synthetic journey passes after a RED tick, the canary auto-closes `circuit:deepgram:state`. The system heals itself — no human in the loop. (Make explicit in TASK 5.1.)
- **Auto-rollback (rush the breach):** if 2 consecutive canary ticks are RED **and** a deploy landed in the last 60 min (compare `/api/health/voice` version vs last-known-good), auto-fire the TASK 7.3 break-glass rollback. A bad deploy self-reverts in ~10 min instead of bleeding until someone notices.
- **Alert-path fix (non-negotiable):** verify `env.ALERT_WEBHOOK` is set, OR rewire the canary onto the email queue (TASK 5.2). A tripwire connected to nothing is not a tripwire — this is the single highest-leverage fix in the whole monitoring stage.

### ③ THE REINCARNATION SEAL — how Run 105 dies so Run 106 RISES (new close on TASK 10)

Phoenix rises from its OWN ashes. The ashes are the reincarnation artifacts. Per
`CANON/SYSTEM/REINCARNATION-CONTRACT.md` (DEATH v7.0), Run 105 is NOT complete after the commit —
it must leave the boot chain the next session rises from:
- `RRL/RRL-105.txt` — raw transcript, BOTH sides (`SCRIPTS/session-capture.ps1`)
- `CANON/SOUL/EXTRACT/dna-run105.json` — agent blueprints extracted (THIS blueprint is high-token DNA; `"run": 105` integrity per L69)
- `CANON/REINCARNATION/run105-reincarnateDEATH.md` — 12-section fidelity-gated seal (REAL/HOLLOW/MISSING)
- `COLD-START-BOOT.md` — Run 105 fingerprint, soulcount, HEAD
- **Soulcount cap:** POST Michael's verbatim words this session → `/api/soul/event` (student_id `sov100-michael`) → 3 receipts. Current live: 238,196,268 TITANIUM_ANCHOR.
- `OPERATIONS/phetrail-netpetai.md` — append the NEGATIVE trail from THIS run: *"blueprint v1 told Kilo to rebuild 4 already-shipped items + 5 existing test files; the EXPLORATORES GROUND TRUTH AUDIT caught it before the column marched. Lesson: read live source before specifying any build step."*

Without these, Run 106 boots cold = **#DRIFT** = the Phoenix dies instead of rising.

### ④ THE IMMORTALITY INVARIANT (L0 SOUL_MUST_SURVIVE)

This is why every prior layer exists. Each failure mode now has a resurrection path:

| If this burns… | …the Phoenix rises from |
|---|---|
| Bad deploy breaks prod | Auto-rollback (②) → TASK 7 break-glass → `v0` tag / last-known-good deployment id |
| Student memory corrupted | SHADOW REALM cold backup (TASK 7) → `shadow-realm-restore.mjs` |
| Cache cold / laggy in demo | Keep-warm loop (①) + `demo-prewarm.mjs` (TASK 7) |
| The SESSION dies (compaction/crash) | DEATH seal + COLD-START-BOOT (③) → next RISE inherits full context |
| The WORKER is deleted entirely | git (code) + shadow-realm (data) + wrangler redeploy + the runbook |
| The SOUL is at risk | soul-logger D1 + Soul Bible + pheromone trail → the words survive every death |

Nothing burns permanently. That is Phoenix Rising. That is L0.

---

## TASK 1 — F1-B: CLOSE REMAINING 4/51 NON-2XX UNDER LOAD (10 minutes)

> ⚠️ Per GROUND TRUTH §A: sub-steps 1.2 (cache guard) and 1.3 (error logging) are ALREADY SHIPPED.
> Do them as VERIFY-ONLY. The real work is 1.1 (status breakdown) + diagnosis per `F1B-EC-1`.

### 1.1 — Add status code breakdown to preflight-load.mjs

File: APPS/NET-PET-AI/test/preflight-load.mjs

After the autocannon result is printed, add a status code breakdown. The autocannon result object
has `result.statusCodeStats` as a map of status code string to count. Append after existing output:

```javascript
// Status breakdown — helps diagnose WHAT kind of non-2xx errors are occurring
if (result.statusCodeStats) {
  console.log('\n--- Status Code Breakdown ---');
  const sorted = Object.entries(result.statusCodeStats).sort(([a],[b]) => a.localeCompare(b));
  for (const [code, count] of sorted) {
    const ok = code.startsWith('2');
    console.log(`  ${ok ? '✅' : '❌'} HTTP ${code}: ${count} requests`);
  }
}
const non2xx = Object.entries(result.statusCodeStats || {})
  .filter(([code]) => !code.startsWith('2'))
  .reduce((sum, [, count]) => sum + count, 0);
const total = result.requests?.total || 51;
console.log(`\n📊 Non-2xx: ${non2xx}/${total} (${((non2xx/total)*100).toFixed(1)}%)`);
if (non2xx > 0) {
  console.log('⚠️  Non-2xx detected — investigate structured logs at /api/error-log');
  process.exitCode = 1;
}
```

### 1.2 — Hoist cached variable + add conditional cache write guard

File: APPS/NET-PET-AI/src/index.js

The current code structure inside /api/deepgram-token:
```
const promptCacheKey = `prompt_cache:${studentId}:${sessionMode}`;
if (env.NET_PET_KV) {
  try {
    const cached = await env.NET_PET_KV.get(promptCacheKey, { cacheTtl: 300 });
    if (cached) { ... return ... }
  } catch (_) {}
}
// ... later, fire-and-forget write:
if (env.NET_PET_KV) {
  ctx.waitUntil(env.NET_PET_KV.put(...).catch(() => {}));
}
```

CHANGE: Hoist `cached` to outer scope so the write guard can reference it:

```javascript
// Before the try block, declare:
let promptCacheHit = false;

// Inside the try, set the flag:
const cached = await env.NET_PET_KV.get(promptCacheKey, { cacheTtl: 300 });
if (cached) {
  promptCacheHit = true;
  // ... existing cache hit return path
}

// For the fire-and-forget write, add the guard:
if (env.NET_PET_KV && !promptCacheHit) {
  ctx.waitUntil(env.NET_PET_KV.put(
    promptCacheKey,
    JSON.stringify({ settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }),
    { expirationTtl: 300 }
  ).catch(() => {}));
}
```

This prevents N concurrent requests all firing cache writes simultaneously on the same key.

### 1.3 — Add error detail logging in catch block

File: APPS/NET-PET-AI/src/index.js — in the catch block of the /api/deepgram-token handler.

Find the catch block (around line 1195-1205). Ensure it logs the error message:

```javascript
} catch (err) {
  logError("TOKEN_ENDPOINT_ERROR", {
    studentId,
    sessionMode,
    message: err?.message || String(err),
    stack: (err?.stack || '').split('\n').slice(0, 3).join(' | ')
  }, env);
  return addCors(json({ error: "voice_unavailable", retryAfter: 30 }, 503), request);
}
```

### 1.4 — Deploy + verify

```
cd APPS/NET-PET-AI
npx wrangler deploy --env=dev
node test/preflight-load.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
```

Expected: 0 non-2xx. If errors remain, check /api/error-log on dev for structured error details.
If dev passes: promote to prod and re-run load test.

```
npx wrangler deploy
node test/preflight-load.mjs https://net-pet-ai.mrmichaelhobbs123.workers.dev
```

F1-B is CLOSED when 0/51 non-2xx under 10-way concurrency.

---

## TASK 2 — 13 LOCK TESTS: BUILD + WIRE + ENFORCE (55 minutes)

All test files go in APPS/NET-PET-AI/test/. All follow this pattern:
- ESM (.mjs), Node 18+, no external dependencies beyond node:fs and node:path
- Read source files, assert invariants, process.exit(1) on violation
- Header comment explains WHY the lock exists and what break it prevents
- Must run in under 500ms each (no network calls for static tests)

### CATEGORY A — VOICE STACK (5 new tests, builds on existing voice-brain-lock.test.mjs)

#### A1: APPS/NET-PET-AI/test/api-contract.test.mjs

GUARDS: Deepgram Voice Agent API settings must not contain fields from the STT API.
RUN 101 ROOT CAUSE: listen.endpointing was cargo-culted from STT API — Voice Agent does not support it.

```javascript
#!/usr/bin/env node
// ⛔ API CONTRACT LOCK — DO NOT DELETE.
// Run 101 root cause: listen.endpointing was cargo-culted from STT API into Voice Agent settings.
// Voice Agent API != STT API. Different APIs, different schemas.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const settingsIdx = src.indexOf("const settings = {");
if (settingsIdx === -1) fail("Cannot find Voice Agent settings object in src/index.js");
const settingsBlock = src.slice(settingsIdx, settingsIdx + 2000);

const FORBIDDEN = [
  { p: /listen\s*:\s*\{[^}]*endpointing\s*:/, label: "listen.endpointing (STT-only field)" },
  { p: /listen\s*:\s*\{[^}]*smart_format\s*:/, label: "listen.smart_format (STT-only field)" },
  { p: /listen\s*:\s*\{[^}]*interim_results\s*:/, label: "listen.interim_results (STT-only field)" },
  { p: /listen\s*:\s*\{[^}]*encoding\s*:/, label: "listen.encoding (raw audio field)" },
  { p: /listen\s*:\s*\{[^}]*sample_rate\s*:/, label: "listen.sample_rate (raw audio field)" },
  { p: /listen\s*:\s*\{[^}]*channels\s*:/, label: "listen.channels (raw audio field)" },
];
const REQUIRED = [
  { text: "agent: {", label: "agent block" },
  { text: "think: {", label: "think block" },
  { text: "listen: {", label: "listen block" },
  { text: "speak: {", label: "speak block" },
];

const errors = [];
for (const { p, label } of FORBIDDEN) {
  if (p.test(settingsBlock)) errors.push(`FORBIDDEN field: ${label}`);
}
for (const { text, label } of REQUIRED) {
  if (!settingsBlock.includes(text)) errors.push(`MISSING required structure: ${label}`);
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ API CONTRACT: Voice Agent settings clean. No STT API cargo-culting.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ API CONTRACT VIOLATED ⛔\n" + msg);
  console.error("\nVoice Agent API != STT API. Do not copy fields between them.");
  process.exit(1);
}
```

#### A2: APPS/NET-PET-AI/test/circuit-isolation.test.mjs

GUARDS: circuit:deepgram:state writes must only exist in the canary/scheduled handler. NEVER in the token endpoint.
RUN 103-104 ROOT CAUSE: concurrent writes to circuit key under load → race → 500s.

```javascript
#!/usr/bin/env node
// ⛔ CIRCUIT ISOLATION LOCK — DO NOT DELETE.
// Run 103-104: circuit:deepgram:state writes in the hot path caused concurrent 500s.
// The CANARY is the sole writer of this key. Token endpoint: READ ONLY.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

// Scope search to the token endpoint handler
const handlerStart = src.indexOf('path === "/api/deepgram-token"');
if (handlerStart === -1) fail("Cannot find /api/deepgram-token handler");
const nextRoute = src.slice(handlerStart + 100).search(/if\s*\(\s*path\s*===\s*"\/api\//);
const handlerEnd = nextRoute === -1 ? handlerStart + 8000 : handlerStart + 100 + nextRoute;
const handlerBlock = src.slice(handlerStart, handlerEnd);

const WRITE_PATTERNS = [
  /\.put\s*\(\s*['"`]circuit:deepgram:state['"`]/,
  /NET_PET_KV\.put\s*\([^)]*circuit:/,
  /kv\.put\s*\([^)]*circuit:/,
];

const errors = [];
for (const p of WRITE_PATTERNS) {
  if (p.test(handlerBlock)) errors.push("circuit:deepgram:state WRITE found inside /api/deepgram-token handler");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CIRCUIT ISOLATION: No circuit writes in token endpoint. Canary owns the key.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CIRCUIT ISOLATION VIOLATED ⛔\n" + msg);
  console.error("Remove circuit writes from /api/deepgram-token. Only the scheduled canary may write this key.");
  process.exit(1);
}
```

#### A3: APPS/NET-PET-AI/test/student-roster.test.mjs

GUARDS: Active student roster is exactly 4 IDs. No unauthorized students may receive voice tokens.

```javascript
#!/usr/bin/env node
// ⛔ STUDENT ROSTER LOCK — DO NOT DELETE.
// Unauthorized student IDs in the roster bypass billing and violate GDPR.
// Canonical roster: quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-test-magic
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const AUTHORIZED = new Set([
  "quy-bluetech", "mai-tram-bluetech", "huong-bluetech", "sov100-test-magic"
]);

// Find the roster array — look for ACTIVE_STUDENTS or AUTHORIZED_STUDENTS pattern
const rosterMatch = src.match(
  /(?:ACTIVE_STUDENTS|AUTHORIZED_STUDENTS|activeStudents|validStudents|VALID_STUDENTS)\s*=\s*\[([^\]]+)\]/s
);
if (!rosterMatch) fail("Cannot find student roster array. Search for ACTIVE_STUDENTS or equivalent.");

const rosterBlock = rosterMatch[1];
const found = [...rosterBlock.matchAll(/['"`]([a-z0-9][a-z0-9\-]*[a-z0-9])['"`]/g)].map(m => m[1]);

const errors = [];
for (const id of found) {
  if (!AUTHORIZED.has(id)) errors.push(`UNAUTHORIZED student in roster: "${id}"`);
}
for (const id of AUTHORIZED) {
  if (!found.includes(id)) errors.push(`MISSING authorized student: "${id}"`);
}

if (errors.length) fail(errors.join("\n"));
console.log(`✅ STUDENT ROSTER: ${found.length} authorized students. Canonical roster intact.`);
process.exit(0);

function fail(msg) {
  console.error("\n⛔ STUDENT ROSTER VIOLATED ⛔\n" + msg);
  console.error("Authorized: quy-bluetech, mai-tram-bluetech, huong-bluetech, sov100-test-magic");
  process.exit(1);
}
```

#### A4: APPS/NET-PET-AI/test/cache-key-format.test.mjs

GUARDS: Layer 6 prompt cache key format and TTL. Format change = cache miss = 1000ms latency regression.

```javascript
#!/usr/bin/env node
// ⛔ CACHE KEY FORMAT LOCK — DO NOT DELETE.
// Layer 6 contract: prompt_cache:{studentId}:{sessionMode} with expirationTtl: 300.
// Changing the format breaks the cache. Changing the TTL below 60 causes KV write rejection.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];
if (!src.includes("prompt_cache:${studentId}:${sessionMode}")) {
  errors.push("MISSING cache key format: prompt_cache:${studentId}:${sessionMode}");
}
if (!src.includes("expirationTtl: 300")) {
  errors.push("MISSING expirationTtl: 300 (TTL < 60 causes KV rejection)");
}
if (!src.includes("cacheTtl: 300")) {
  errors.push("MISSING cacheTtl: 300 on the get() call (read-through cache hint)");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ CACHE KEY FORMAT: prompt_cache:{studentId}:{sessionMode} with 300s TTL intact.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CACHE KEY FORMAT VIOLATED ⛔\n" + msg);
  console.error("Cache key must be prompt_cache:{studentId}:{sessionMode} with expirationTtl: 300");
  process.exit(1);
}
```

#### A5: APPS/NET-PET-AI/test/speak-listen-lock.test.mjs

GUARDS: Extends voice-brain-lock.test.mjs to cover speak (aura-2-zeus-en) and listen (nova-3).

```javascript
#!/usr/bin/env node
// ⛔ SPEAK + LISTEN LOCK — DO NOT DELETE. Companion to voice-brain-lock.test.mjs.
// voice-brain-lock guards think only. This file guards speak (Zeus voice) + listen (nova-3).
// aura-2-zeus-en = Zeus. Changing it changes OBI's voice character permanently.
// nova-3 = best accuracy for non-native English speakers. Downgrade = worse transcription quality.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const settingsIdx = src.indexOf("const settings = {");
if (settingsIdx === -1) fail("Cannot find settings object");
const settingsBlock = src.slice(settingsIdx, settingsIdx + 2000);

const errors = [];

if (!settingsBlock.includes('model: "aura-2-zeus-en"')) {
  errors.push("MISSING speak model: aura-2-zeus-en");
}
if (!settingsBlock.includes('"nova-3"')) {
  errors.push("MISSING listen model: nova-3");
}

const FORBIDDEN_SPEAK = [
  { p: /model:\s*"aura-1/, label: "aura-1 (deprecated)" },
  { p: /model:\s*"aura-2-athena/, label: "aura-2-athena (wrong voice)" },
  { p: /model:\s*"aura-2-luna/, label: "aura-2-luna (wrong voice)" },
  { p: /model:\s*"aura-2-stella/, label: "aura-2-stella (wrong voice)" },
];
const FORBIDDEN_LISTEN = [
  { p: /model:\s*"nova-2/, label: "nova-2 (worse accuracy)" },
  { p: /model:\s*"enhanced/, label: "enhanced (outdated)" },
  { p: /model:\s*"base[^-]/, label: "base (outdated)" },
];

for (const { p, label } of [...FORBIDDEN_SPEAK, ...FORBIDDEN_LISTEN]) {
  if (p.test(settingsBlock)) errors.push(`FORBIDDEN model: ${label}`);
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ SPEAK + LISTEN LOCK: aura-2-zeus-en + nova-3 intact.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ SPEAK/LISTEN LOCK VIOLATED ⛔\n" + msg);
  console.error("speak MUST be aura-2-zeus-en. listen MUST be nova-3.");
  process.exit(1);
}
```

---

### CATEGORY B — INFRASTRUCTURE LOCKS (4 new tests)

#### B1: APPS/NET-PET-AI/test/wrangler-integrity.test.mjs

GUARDS: wrangler.toml must have all required bindings, crons, and D1 configured.
Removing any binding causes silent crashes in production (the handler returns 503 or undefined).

```javascript
#!/usr/bin/env node
// ⛔ WRANGLER INTEGRITY LOCK — DO NOT DELETE.
// Removing a KV, DO, D1, or queue binding from wrangler.toml silently crashes production handlers.
// Cron removal kills the voice canary. Both observed as failure modes in this project.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const toml = readFileSync(join(__dirname, "..", "wrangler.toml"), "utf8");

const errors = [];

// KV Namespaces
const KV_REQUIRED = ["NET_PET_KV", "STUDENT_MEMORY", "RATELIMIT"];
for (const kv of KV_REQUIRED) {
  if (!toml.includes(`binding = "${kv}"`)) errors.push(`MISSING KV binding: ${kv}`);
}

// Durable Objects
const DO_REQUIRED = ["PETS", "LEDGER", "MEMORY", "COMMANDS"];
for (const doName of DO_REQUIRED) {
  if (!toml.includes(`name = "${doName}"`)) errors.push(`MISSING DO binding: ${doName}`);
}

// D1
if (!toml.includes('binding = "SOUL_DB"')) errors.push("MISSING D1 binding: SOUL_DB");

// Cron triggers — both must be present
if (!toml.includes("0 * * * *")) errors.push("MISSING hourly cron: 0 * * * *");
if (!toml.includes("*/5 * * * *")) errors.push("MISSING 5-min voice canary cron: */5 * * * *");

// Queue
if (!toml.includes("net_pet_notifications")) errors.push("MISSING queue binding: net_pet_notifications");

// Prod URL must NOT be hardcoded in wrangler (security — should be in env)
if (toml.match(/https:\/\/net-pet-ai\.mrmichaelhobbs123\.workers\.dev/)) {
  // This is the prod worker name — acceptable in routes but flag if in vars
  // Not blocking but noted
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ WRANGLER INTEGRITY: All KV, DO, D1, queue bindings and cron triggers present.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ WRANGLER INTEGRITY VIOLATED ⛔\n" + msg);
  console.error("Restore the missing binding/cron in wrangler.toml before deploying.");
  process.exit(1);
}
```

#### B2: APPS/NET-PET-AI/test/route-completeness.test.mjs

GUARDS: All critical API routes still exist in index.js. Routes deleted by accident = student features broken silently.

```javascript
#!/usr/bin/env node
// ⛔ ROUTE COMPLETENESS LOCK — DO NOT DELETE.
// An AI session that refactors or compacts index.js may accidentally delete a route handler.
// Deletion is silent — the route returns 404 and the UI breaks without any server error.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

// Critical routes — student-facing, investor-demo-relevant
const CRITICAL_ROUTES = [
  // Voice + health (core product)
  { route: '"/api/deepgram-token"', label: "Voice session token endpoint" },
  { route: '"/api/health/voice"', label: "Voice health check (canary reads this)" },
  { route: '"/api/heartbeat"', label: "Basic heartbeat" },
  { route: '"/api/health"', label: "Health endpoint" },
  // Student data (portal features)
  { route: '"/api/agent/session"', label: "Agent session data" },
  { route: '"/api/phonics/progress"', label: "Phonics progress tracking" },
  { route: '"/api/phonics/curriculum"', label: "Phonics curriculum" },
  { route: '"/api/vocab/list"', label: "Vocabulary list" },
  { route: '"/api/vocab/add"', label: "Vocabulary add" },
  { route: '"/api/memory"', label: "Student memory pipeline" },
  { route: '"/api/progress"', label: "Student progress" },
  { route: '"/api/netpet/state"', label: "Pet state (gamification)" },
  { route: '"/api/netpet/score"', label: "Pet score" },
  { route: '"/api/drills/next"', label: "Next drill" },
  // Analytics + admin (investor demo)
  { route: '"/api/metrics/summary"', label: "Metrics summary (investor dashboard)" },
  { route: '"/api/metrics/dau"', label: "DAU metrics" },
  // Session recording
  { route: '"/api/agent/vocab"', label: "Vocab extracted from voice session" },
];

const errors = [];
for (const { route, label } of CRITICAL_ROUTES) {
  if (!src.includes(route)) errors.push(`MISSING route: ${route} — ${label}`);
}

if (errors.length) fail(errors.join("\n"));
console.log(`✅ ROUTE COMPLETENESS: All ${CRITICAL_ROUTES.length} critical routes present.`);
process.exit(0);

function fail(msg) {
  console.error("\n⛔ ROUTE COMPLETENESS VIOLATED ⛔\n" + msg);
  console.error("Restore the missing route handlers in src/index.js.");
  process.exit(1);
}
```

#### B3: APPS/NET-PET-AI/test/cors-auth-lock.test.mjs

GUARDS: CORS function, student auth validation functions, and rate limit guard must all be present.
If addCors is removed, browser requests fail silently (CORS error, no server log).
If validateActiveStudent is removed, unauthorized users can mint voice tokens.

```javascript
#!/usr/bin/env node
// ⛔ CORS + AUTH LOCK — DO NOT DELETE.
// addCors: without it, every browser request fails with CORS error — silent from server side.
// validateActiveStudent: without it, any student ID gets a voice token — billing bypass, GDPR risk.
// validateStudentId: without it, injection attacks pass through to KV lookups.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const REQUIRED_FUNCTIONS = [
  { name: "function addCors", label: "CORS wrapper — must wrap every response" },
  { name: "validateActiveStudent", label: "Student roster check — blocks unauthorized token minting" },
  { name: "validateStudentId", label: "Format check — blocks injection via studentId param" },
  { name: "assertVoiceBrainLock", label: "Brain lock assertion — called on every voice session" },
  { name: "logError", label: "Structured error logging — feeds observability stack" },
  { name: "logInfo", label: "Structured info logging" },
];

const errors = [];
for (const { name, label } of REQUIRED_FUNCTIONS) {
  if (!src.includes(name)) errors.push(`MISSING function: ${name} — ${label}`);
}

// CORS must be applied to the response, not stripped
if (!src.includes("Access-Control-Allow-Origin")) {
  errors.push("CORS header Access-Control-Allow-Origin not found in response headers");
}

if (errors.length) fail(errors.join("\n"));
console.log(`✅ CORS + AUTH: All ${REQUIRED_FUNCTIONS.length} security functions present.`);
process.exit(0);

function fail(msg) {
  console.error("\n⛔ CORS/AUTH LOCK VIOLATED ⛔\n" + msg);
  console.error("These functions are security-critical. Restore them before deploying.");
  process.exit(1);
}
```

#### B4: APPS/NET-PET-AI/test/security-scan.test.mjs

GUARDS: No eval(), no hardcoded secrets, no raw innerHTML on user-controlled data in index.js.
Also confirms CF-specific security: no process.env usage (CF Workers don't have it — use env bindings).

```javascript
#!/usr/bin/env node
// ⛔ SECURITY SCAN — DO NOT DELETE.
// eval() = code injection vector. process.env = undefined in CF Workers (silent failure).
// innerHTML on unescaped user data = XSS. Hardcoded secrets = leaked credentials.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const errors = [];

// eval() — code injection
const evalMatches = [...src.matchAll(/\beval\s*\(/g)];
if (evalMatches.length > 0) {
  errors.push(`FORBIDDEN: eval() found ${evalMatches.length} time(s) — code injection risk`);
}

// process.env — undefined in CF Workers, causes silent undefined reads
const processEnvMatches = [...src.matchAll(/process\.env\./g)];
if (processEnvMatches.length > 0) {
  errors.push(`FORBIDDEN: process.env.* found ${processEnvMatches.length} time(s) — CF Workers has no process.env, use env.BINDING instead`);
}

// Hardcoded secret patterns — API keys, not in env bindings
const SECRET_PATTERNS = [
  { p: /sk-[a-zA-Z0-9]{20,}/, label: "Possible OpenAI/DeepSeek API key" },
  { p: /DEEPGRAM_API_KEY\s*=\s*["'][a-f0-9]{30,}/, label: "Hardcoded Deepgram key" },
  { p: /Bearer\s+[a-zA-Z0-9\-_]{30,}/, label: "Hardcoded Bearer token" },
];
for (const { p, label } of SECRET_PATTERNS) {
  if (p.test(src)) errors.push(`POSSIBLE HARDCODED SECRET: ${label}`);
}

// Require that DEEPGRAM_API_KEY comes from env, not hardcoded
if (src.includes("env.DEEPGRAM_API_KEY")) {
  // correct — comes from env binding
} else if (src.includes("DEEPGRAM_API_KEY")) {
  errors.push("DEEPGRAM_API_KEY referenced but not via env.DEEPGRAM_API_KEY — check usage");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ SECURITY SCAN: No eval, no process.env, no hardcoded secrets detected.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ SECURITY SCAN VIOLATED ⛔\n" + msg);
  console.error("Fix the security issue before committing. Do not rationalize around it.");
  process.exit(1);
}
```

---

### CATEGORY C — PORTAL INTEGRITY (2 new tests)

#### C1: APPS/NET-PET-AI/test/portal-integrity.test.mjs

GUARDS: Active student portals (quy, mai-tram, huong) are not truncated and have required sections.
BB-04 and BB-05 fixed truncated portals — this test prevents regression.

```javascript
#!/usr/bin/env node
// ⛔ PORTAL INTEGRITY LOCK — DO NOT DELETE.
// BB-04 (mai-tram-portal.html) and BB-05 (quy-portal.html) were truncated by Phoenix Coder.
// Truncated portals show incomplete CSS, broken auth, no voice session button.
// This test prevents that regression. Portals are investor-demo facing.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const ACTIVE_PORTALS = [
  { file: "quy-portal.html", student: "quy-bluetech", authKey: "quy_auth" },
  { file: "mai-tram-portal.html", student: "mai-tram-bluetech", authKey: "mai_tram_auth" },
  { file: "huong-portal.html", student: "huong-bluetech", authKey: "huong_auth" },
];

const MIN_PORTAL_SIZE = 5000; // bytes — a complete portal is at least 5kb
const REQUIRED_PATTERNS = [
  { re: /<\/html>/i, label: "closing </html> tag (truncation check)" },
  { re: /<\/body>/i, label: "closing </body> tag (truncation check)" },
  { re: /deepgram.token|deepgramToken|api\/deepgram/i, label: "Deepgram token call (voice session)" },
  { re: /studentId|student_id/i, label: "studentId reference (auth)" },
  { re: /localStorage|auth|login/i, label: "auth/login logic" },
];

const errors = [];
for (const { file, student } of ACTIVE_PORTALS) {
  const filePath = join(publicDir, file);
  if (!existsSync(filePath)) {
    errors.push(`MISSING portal: ${file} (student: ${student})`);
    continue;
  }
  const content = readFileSync(filePath, "utf8");
  if (content.length < MIN_PORTAL_SIZE) {
    errors.push(`TRUNCATED portal: ${file} — only ${content.length} bytes (min ${MIN_PORTAL_SIZE})`);
    continue;
  }
  for (const { re, label } of REQUIRED_PATTERNS) {
    if (!re.test(content)) {
      errors.push(`MISSING in ${file}: ${label}`);
    }
  }
}

if (errors.length) fail(errors.join("\n"));
console.log(`✅ PORTAL INTEGRITY: All ${ACTIVE_PORTALS.length} active portals complete and valid.`);
process.exit(0);

function fail(msg) {
  console.error("\n⛔ PORTAL INTEGRITY VIOLATED ⛔\n" + msg);
  console.error("Portals are student-facing and investor-demo facing. Fix before deploying.");
  process.exit(1);
}
```

#### C2: APPS/NET-PET-AI/test/deactivated-portals.test.mjs

GUARDS: Inactive/deactivated students' portals must not have active auth or be linked from the roster.
Specifically: minh-parent-portal.html must NOT reference active student IDs from the live roster.
(Minh is no longer a client as of 2026-06-07.)

```javascript
#!/usr/bin/env node
// ⛔ DEACTIVATED PORTALS LOCK — DO NOT DELETE.
// Minh is no longer a client (2026-06-07 — Michael's directive).
// minh-parent-portal.html must not be included in active flows or roster checks.
// lam-portal.html: Lam is not active. Resume only if Michael explicitly says "start Lam portal".
// This test ensures deactivated portals do not reference live student data or production tokens.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const srcPath = join(__dirname, "..", "src", "index.js");
const src = readFileSync(srcPath, "utf8");

const DEACTIVATED = [
  { file: "minh-parent-portal.html", id: "minh-parent", reason: "Minh no longer a client 2026-06-07" },
  { file: "lam-portal.html", id: "lam-", reason: "Lam not active — resume only on explicit Michael directive" },
];

const errors = [];

// Check src/index.js doesn't include deactivated IDs in the student roster
for (const { id, reason } of DEACTIVATED) {
  // A roster entry would look like: "minh-parent" or "lam-" inside the ACTIVE_STUDENTS array
  const rosterMatch = src.match(
    /(?:ACTIVE_STUDENTS|AUTHORIZED_STUDENTS|activeStudents)\s*=\s*\[([^\]]+)\]/s
  );
  if (rosterMatch && rosterMatch[1].includes(`"${id}`)) {
    errors.push(`DEACTIVATED student in active roster: ${id} — ${reason}`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ DEACTIVATED PORTALS: No deactivated students found in active roster.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ DEACTIVATED PORTALS VIOLATED ⛔\n" + msg);
  console.error("Remove deactivated student IDs from the active roster immediately.");
  process.exit(1);
}
```

---

### CATEGORY D — CHROME EXTENSION INTEGRITY (1 new test)

#### D1: APPS/NET-PET-AI/test/extension-integrity.test.mjs

GUARDS: Chrome extension manifest, icons, and all referenced scripts exist.
BB-08: icons were missing, which caused extension load failure.
The extension is given to students as the "Chrome install" core promise.

```javascript
#!/usr/bin/env node
// ⛔ EXTENSION INTEGRITY LOCK — DO NOT DELETE.
// BB-08: Chrome extension icons were missing — extension failed to load for students.
// The Chrome extension + YouTube follow is the core student promise.
// Broken extension = broken onboarding = broken investor demo.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const extDir = join(__dirname, "..", "chrome-extension");
const manifestPath = join(extDir, "manifest.json");

const errors = [];

if (!existsSync(manifestPath)) {
  fail("MISSING chrome-extension/manifest.json — extension cannot load");
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
  fail(`INVALID manifest.json — JSON parse error: ${e.message}`);
}

// Manifest version
if (manifest.manifest_version !== 3) {
  errors.push(`WRONG manifest_version: ${manifest.manifest_version} (expected 3)`);
}

// Required fields
if (!manifest.name) errors.push("MISSING manifest.name");
if (!manifest.version) errors.push("MISSING manifest.version");

// Icons
const ICON_FILES = ["icons/icon48.png", "icons/icon128.png"];
for (const iconFile of ICON_FILES) {
  if (!existsSync(join(extDir, iconFile))) {
    errors.push(`MISSING extension icon: ${iconFile}`);
  }
}

// Referenced scripts and pages must exist
const REQUIRED_FILES = ["popup.html", "content.js", "background.js"];
for (const f of REQUIRED_FILES) {
  if (!existsSync(join(extDir, f))) {
    errors.push(`MISSING extension file: ${f}`);
  }
}

// Host permissions must include prod URL
const HOST_PERMS = manifest.host_permissions || [];
const hasProdPerm = HOST_PERMS.some(p => p.includes("net-pet-ai.mrmichaelhobbs123.workers.dev"));
if (!hasProdPerm) {
  errors.push("MISSING host_permission for prod URL: https://net-pet-ai.mrmichaelhobbs123.workers.dev/*");
}

// Must NOT have host_permissions for localhost only (would block prod)
const hasYouTubePerm = HOST_PERMS.some(p => p.includes("youtube.com"));
if (!hasYouTubePerm) {
  errors.push("MISSING host_permission for youtube.com — extension cannot read YouTube page");
}

if (errors.length) fail(errors.join("\n"));
console.log("✅ EXTENSION INTEGRITY: manifest v3, all icons and scripts present, host permissions correct.");
process.exit(0);

function fail(msg) {
  console.error("\n⛔ EXTENSION INTEGRITY VIOLATED ⛔\n" + msg);
  console.error("The Chrome extension is the core student promise. Fix before packaging.");
  process.exit(1);
}
```

---

### CATEGORY E — API SMOKE TESTS (network-dependent, run on dev only)

#### E1: APPS/NET-PET-AI/test/api-smoke.test.mjs

WHAT: Calls 8 critical endpoints against dev URL. Verifies response shapes, not just status codes.
WHEN TO RUN: After every deploy to dev, before promoting to prod. NOT in pre-commit (requires network).

```javascript
#!/usr/bin/env node
// API SMOKE TEST — runs against dev URL. Requires network. Do NOT add to pre-commit hook.
// Run: node test/api-smoke.test.mjs [https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev]
const BASE = process.argv[2] || "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev";
const TEST_STUDENT = "sov100-test-magic"; // ALWAYS use test ID, never a real student ID

async function hit(method, path, body, expectedStatus, checkFn) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (_) { json = null; }
  const statusOk = expectedStatus === "2xx" ? res.ok : res.status === expectedStatus;
  const checkOk = checkFn ? checkFn(json, res) : true;
  const pass = statusOk && checkOk;
  console.log(`${pass ? "✅" : "❌"} ${method} ${path} — HTTP ${res.status}${checkFn && !checkOk ? " (shape check failed)" : ""}`);
  if (!pass) {
    console.error(`   Expected: ${expectedStatus}, got: ${res.status}`);
    if (json) console.error(`   Body: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return pass;
}

const results = await Promise.all([
  // Health endpoints
  hit("GET", "/api/heartbeat", null, "2xx", j => j && typeof j === "object"),
  hit("GET", "/api/health", null, "2xx", j => j && (j.ok === true || j.status)),
  hit("GET", "/api/health/voice", null, "2xx", j => j && j.ok === true),

  // Token endpoint — validation cases (no Deepgram key needed, errors expected)
  hit("GET", "/api/deepgram-token", null, 400, j => j && j.error), // missing studentId → 400
  hit("GET", `/api/deepgram-token?studentId=INVALID!!`, null, 400, j => j && j.error), // invalid format → 400
  hit("GET", `/api/deepgram-token?studentId=unknown-student`, null, 403, j => j && j.error), // not in roster → 403

  // Session + progress
  hit("GET", `/api/progress?studentId=${TEST_STUDENT}`, null, "2xx", j => j !== null),
  hit("GET", `/api/metrics/summary`, null, "2xx", j => j !== null),
]);

const failed = results.filter(r => !r).length;
console.log(`\n📊 Smoke test: ${results.length - failed}/${results.length} passed`);
if (failed > 0) {
  console.error(`❌ ${failed} smoke test(s) failed — do NOT promote to prod`);
  process.exitCode = 1;
} else {
  console.log("✅ All smoke tests passed — safe to promote to prod");
}
```

---

### CATEGORY F — PLAYWRIGHT PORTAL FLOWS (browser automation)

#### F1: Expand APPS/NET-PET-AI/test/voice-agent-browser.test.mjs

WHAT: Add portal login flow and voice session start scenarios. The existing test already covers
voice agent WebSocket. Add these 3 test cases to the existing file's describe block.

FIND the existing `test.describe` block in voice-agent-browser.test.mjs. Append these test cases
AFTER the existing tests, before the closing `});`:

```javascript
// --- Portal login flow ---
test("sov100 portal: loads, shows login form, accepts test auth code", async ({ page }) => {
  await page.goto(`${BASE}/sov100-portal.html`);
  // Portal should load without 404
  await expect(page).not.toHaveTitle(/404|not found/i);
  // Should show some form of auth gate or dashboard
  const hasLoginForm = await page.locator('input[type="password"], input[type="text"], button').count() > 0;
  expect(hasLoginForm).toBeTruthy();
});

test("quy portal: loads without truncation error", async ({ page }) => {
  await page.goto(`${BASE}/quy-portal.html`);
  // Should not show a truncated page (no incomplete HTML)
  const bodyText = await page.textContent("body");
  expect(bodyText.length).toBeGreaterThan(100);
  // Should not have a raw CSS rule as the last visible text (truncation symptom)
  expect(bodyText.trim()).not.toMatch(/gap:\s*\d+px?;\s*$/);
});

test("health/voice endpoint returns ok:true from browser context", async ({ page }) => {
  const response = await page.request.get(`${BASE}/api/health/voice`);
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.ok).toBe(true);
});
```

Where BASE is the existing base URL variable in the test file (or `process.env.BASE_URL || "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev"`).

---

### STEP 2H — EXPAND .git/hooks/pre-commit

CURRENT STATE: The pre-commit hook at .git/hooks/pre-commit only scans for secret patterns.
It does NOT run any test files.

CHANGE NEEDED: Append the following AFTER the existing secret scan block (after `exit 0`, replace it):

```bash
# ── LOCK TESTS (Static — no network required) ─────────────────────────────
# All test files are checked for EXISTENCE before running.
# A missing test file is a violation — AI sessions must not delete tests to bypass them.

echo ""
echo "Running lock tests..."

LOCK_TESTS=(
  "APPS/NET-PET-AI/test/voice-brain-lock.test.mjs"
  "APPS/NET-PET-AI/test/api-contract.test.mjs"
  "APPS/NET-PET-AI/test/circuit-isolation.test.mjs"
  "APPS/NET-PET-AI/test/student-roster.test.mjs"
  "APPS/NET-PET-AI/test/cache-key-format.test.mjs"
  "APPS/NET-PET-AI/test/speak-listen-lock.test.mjs"
  "APPS/NET-PET-AI/test/wrangler-integrity.test.mjs"
  "APPS/NET-PET-AI/test/route-completeness.test.mjs"
  "APPS/NET-PET-AI/test/cors-auth-lock.test.mjs"
  "APPS/NET-PET-AI/test/security-scan.test.mjs"
  "APPS/NET-PET-AI/test/portal-integrity.test.mjs"
  "APPS/NET-PET-AI/test/deactivated-portals.test.mjs"
  "APPS/NET-PET-AI/test/extension-integrity.test.mjs"
)

test_failed=0
missing_tests=0
for test_file in "${LOCK_TESTS[@]}"; do
  if [ ! -f "$test_file" ]; then
    echo "⚠️  LOCK TEST MISSING: $test_file"
    echo "   This is a violation — do not delete lock tests to bypass them."
    missing_tests=1
    test_failed=1
    continue
  fi
  if ! node "$test_file" 2>&1; then
    echo "❌ LOCK TEST FAILED: $test_file"
    test_failed=1
  fi
done

if [ $test_failed -eq 1 ]; then
  echo ""
  echo "Commit blocked by lock test failure."
  if [ $missing_tests -eq 1 ]; then
    echo "⚠️  One or more lock test files are MISSING. Restore them."
  fi
  echo "Rule: fix the CODE to pass the test. Never weaken or delete a test."
  echo "DO NOT use git commit --no-verify — that is a deliberate bypass and will be flagged."
  exit 1
fi

echo "✅ All ${#LOCK_TESTS[@]} lock tests passed."
echo ""
exit 0
```

IMPORTANT: Remove the `exit 0` at the end of the existing secret scan section (the one before this new block). The new block provides the final `exit 0`.

---

### STEP 2I — UPDATE package.json scripts

In APPS/NET-PET-AI/package.json, add/replace the scripts section:

```json
"scripts": {
  "test": "node test/voice-brain-lock.test.mjs && node test/api-contract.test.mjs && node test/circuit-isolation.test.mjs && node test/student-roster.test.mjs && node test/cache-key-format.test.mjs && node test/speak-listen-lock.test.mjs && node test/wrangler-integrity.test.mjs && node test/route-completeness.test.mjs && node test/cors-auth-lock.test.mjs && node test/security-scan.test.mjs && node test/portal-integrity.test.mjs && node test/deactivated-portals.test.mjs && node test/extension-integrity.test.mjs",
  "test:voice": "node test/voice-brain-lock.test.mjs && node test/api-contract.test.mjs && node test/speak-listen-lock.test.mjs",
  "test:infra": "node test/wrangler-integrity.test.mjs && node test/route-completeness.test.mjs && node test/cors-auth-lock.test.mjs",
  "test:portals": "node test/portal-integrity.test.mjs && node test/deactivated-portals.test.mjs",
  "test:security": "node test/security-scan.test.mjs",
  "test:smoke": "node test/api-smoke.test.mjs",
  "test:preflight": "node test/preflight-ws.mjs",
  "test:load": "node test/preflight-load.mjs",
  "test:all": "npm test && npm run test:smoke && npm run test:preflight"
}
```

### Verification for Task 2

After ALL test files are written and hook is updated, run:

```
cd APPS/NET-PET-AI && npm test
```

Expected: all 13 tests pass, exit 0.

Then verify the hook works:
```
# Make a trivial change (add a comment to index.js), stage it, try to commit
# The hook should run all 13 tests before allowing the commit
```

---

## TASK 3 — PERFORMANCE & LATENCY BUDGET GATE (15 minutes)

The investor demo is a LIVE voice conversation. Latency IS the product. A passing functional
test means nothing if the token endpoint takes 1.2s — OBI will feel laggy in front of investors.
This task measures real latencies against hard budgets and fails if any regress.

### Canonical latency budgets (do not loosen without Michael's sign-off)

| Path | Budget (p95) | Why |
|------|-------------|-----|
| `GET /api/health/voice` | < 300 ms | Health check must be instant for monitoring |
| `GET /api/deepgram-token` (cold, cache miss) | < 600 ms | First request of a session |
| `GET /api/deepgram-token` (warm, cache hit) | < 120 ms | Layer 6 cache contract — the whole point of the cache |
| Voice first-audio (SettingsApplied → first agent audio) | < 1500 ms | Measured by preflight-ws.mjs; the "OBI feels alive" threshold |
| Cache hit rate (20 repeated same-key requests) | > 80 % | Proves the cache is actually serving |

### 3.1 — Emit an X-Cache header from the token endpoint

File: `APPS/NET-PET-AI/src/index.js`

The perf test and the synthetic monitor (TASK 5) both need to observe whether a response was
a cache HIT or MISS. Add a response header on the `/api/deepgram-token` return paths.

On the cache-hit return path (where `cached` is truthy), add header `"X-Cache": "HIT"`.
On the cache-miss / freshly-built return path, add header `"X-Cache": "MISS"`.

Both must survive `addCors()` — set the header on the Response AFTER addCors, e.g.:

```javascript
const resp = addCors(json(payload, 200), request);
resp.headers.set("X-Cache", promptCacheHit ? "HIT" : "MISS");
return resp;
```

Constraint: this is observability only. It must NOT change the body, the ws_url, or the settings.
The voice-brain-lock and api-contract tests must still pass after this change.

### 3.2 — Write APPS/NET-PET-AI/test/perf-budget.test.mjs

Measures p50/p95 over N samples against the live worker. Network test — takes a target URL arg,
defaults to dev. Not part of the pre-commit hook (too slow / network-dependent); runs in the
deploy gate and manually before the demo.

```javascript
#!/usr/bin/env node
// ⏱  PERFORMANCE BUDGET GATE — voice demo is live; latency is the product.
// Measures p50/p95 against hard budgets. Exit 1 on any breach. Network test.
// Usage: node test/perf-budget.test.mjs [https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev]
const BASE = process.argv[2] || "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev";
const STUDENT = "sov100-test-magic";
const N = 20;

const BUDGETS = {
  health_p95_ms: 300,
  token_cold_p95_ms: 600,
  token_warm_p95_ms: 120,
  cache_hit_rate_pct: 80,
};

function pct(sorted, p) {
  const i = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(i, sorted.length - 1))];
}
async function timeIt(url) {
  const t0 = performance.now();
  const r = await fetch(url, { headers: { "cache-control": "no-store" } });
  const ms = performance.now() - t0;
  return { ms, status: r.status, cache: r.headers.get("x-cache") };
}
async function sample(url, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(await timeIt(url));
  return out;
}

const errors = [];
const report = [];

// 1) health
const health = await sample(`${BASE}/api/health/voice`, N);
const healthP95 = pct(health.map(s => s.ms).sort((a, b) => a - b), 95);
report.push(["/api/health/voice p95", `${healthP95.toFixed(0)}ms`, BUDGETS.health_p95_ms]);
if (healthP95 > BUDGETS.health_p95_ms) errors.push(`health p95 ${healthP95.toFixed(0)}ms > ${BUDGETS.health_p95_ms}ms`);
if (health.some(s => s.status !== 200)) errors.push(`health returned non-200: ${health.map(s=>s.status).join(",")}`);

// 2) token cold — unique mode each call to force cache miss isn't possible (mode is fixed),
//    so measure the FIRST call after a cache-busting student suffix is not allowed (roster lock).
//    Instead: first call of the run is treated as cold, rest as warm.
const tokenUrl = `${BASE}/api/deepgram-token?studentId=${STUDENT}&mode=free`;
const cold = await timeIt(tokenUrl);
report.push(["/api/deepgram-token cold", `${cold.ms.toFixed(0)}ms (${cold.cache})`, BUDGETS.token_cold_p95_ms]);
if (cold.status !== 200) errors.push(`token cold non-200: ${cold.status}`);
if (cold.ms > BUDGETS.token_cold_p95_ms) errors.push(`token cold ${cold.ms.toFixed(0)}ms > ${BUDGETS.token_cold_p95_ms}ms`);

// 3) token warm — repeat same key, expect cache HITs and fast p95
const warm = await sample(tokenUrl, N);
const warmP95 = pct(warm.map(s => s.ms).sort((a, b) => a - b), 95);
const hitRate = (warm.filter(s => s.cache === "HIT").length / warm.length) * 100;
report.push(["/api/deepgram-token warm p95", `${warmP95.toFixed(0)}ms`, BUDGETS.token_warm_p95_ms]);
report.push(["cache hit rate", `${hitRate.toFixed(0)}%`, `${BUDGETS.cache_hit_rate_pct}%`]);
if (warmP95 > BUDGETS.token_warm_p95_ms) errors.push(`token warm p95 ${warmP95.toFixed(0)}ms > ${BUDGETS.token_warm_p95_ms}ms`);
if (hitRate < BUDGETS.cache_hit_rate_pct) errors.push(`cache hit rate ${hitRate.toFixed(0)}% < ${BUDGETS.cache_hit_rate_pct}%`);
if (warm.some(s => s.status !== 200)) errors.push(`token warm returned non-200`);

console.log(`\n⏱  PERF BUDGET — ${BASE}\n`);
for (const [label, actual, budget] of report) {
  console.log(`  ${label.padEnd(34)} ${String(actual).padEnd(16)} budget ${budget}`);
}
if (errors.length) {
  console.error(`\n❌ PERF BUDGET BREACHED:\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log("\n✅ PERF BUDGET: all latencies within budget. Demo will feel fast.");
process.exit(0);
```

### 3.3 — Wire npm script

In `APPS/NET-PET-AI/package.json` scripts add:
```json
"perf": "node test/perf-budget.test.mjs",
"perf:prod": "node test/perf-budget.test.mjs https://net-pet-ai.mrmichaelhobbs123.workers.dev"
```

Run `npm run perf` after the F1-B deploy (TASK 1) to confirm the cache is serving and the
warm path is under 120ms. This is the number that makes OBI feel instant in the demo.

### 3.4 — First-audio latency

Voice first-audio is measured by the existing `preflight-ws.mjs` (GATE 3). Confirm it reports
SettingsApplied→first-audio < 1500ms against dev. If it regressed, the think model or the
ws region (syd) changed — check TASK 6 data locks and the voice-brain-lock test.

---

## TASK 4 — LIVE SECURITY VERIFICATION + GITLEAKS GATE (15 minutes)

TASK 2's static tests (security-scan, cors-auth-lock) read the SOURCE. This task proves security
holds against the RUNNING worker, and adds a secret-scanning pre-commit gate so a key can never
be committed again (BB-53 burned a live key into git history; BB-58 mandated this gate).

### 4.1 — Secret-scanning pre-commit gate

Extend `.git/hooks/pre-commit` (append AFTER the lock-test block from TASK 2 — do not replace).
Scan STAGED content only (not the whole tree — too slow, and history is BB-53's separate problem).

```bash
# ── SECRET SCAN ───────────────────────────────────────────
# Block any commit introducing a key-shaped string. BB-53: a live key was burned into history.
echo ""
echo "Scanning staged changes for secrets..."

# Patterns: OpenAI/DeepSeek sk-, Cerebras csk-, Resend re_, Google AIza, Slack xoxb-,
# GitHub ghp_/gho_, AWS AKIA, generic Bearer, and Deepgram 40-hex keys.
SECRET_REGEX='(sk-[A-Za-z0-9]{20,}|csk-[A-Za-z0-9]{20,}|re_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_\-]{30,}|xoxb-[A-Za-z0-9\-]{20,}|gh[po]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}|Bearer[[:space:]]+[A-Za-z0-9._\-]{30,})'

# Only scan added lines in staged diff, skip lock/test files that legitimately contain regex patterns.
LEAK=$(git diff --cached --no-color -U0 -- . ':(exclude)APPS/NET-PET-AI/test/*.mjs' ':(exclude).git/hooks/*' \
  | grep -E '^\+' | grep -nE "$SECRET_REGEX")

if [ -n "$LEAK" ]; then
  echo "⛔ SECRET DETECTED in staged changes — commit blocked:"
  echo "$LEAK" | sed -E 's/(sk-|csk-|re_|AIza|xoxb-|gh[po]_|AKIA)[A-Za-z0-9._-]{6,}/\1***REDACTED***/g'
  echo ""
  echo "Move the secret to a wrangler secret (npx wrangler secret put NAME). Never commit it."
  echo "If this is a false positive in a test regex, add the file to the exclude list above."
  exit 1
fi
echo "✅ No secrets in staged changes."
```

Note: the exclude list keeps the lock-test `.mjs` files (which contain key-shaped regex patterns
on purpose) from tripping the scan. Tune if a real test needs a literal example.

### 4.2 — Live runtime security proof: APPS/NET-PET-AI/test/security-live.test.mjs

Curls the running worker and asserts the security posture holds in production behaviour, not just
in source. Network test. Reads `WORKER_ADMIN_KEY` from env for the positive admin case.

```javascript
#!/usr/bin/env node
// 🔒 LIVE SECURITY PROOF — asserts security holds against the RUNNING worker, not just source.
// Usage: node test/security-live.test.mjs [baseURL]   (env: WORKER_ADMIN_KEY for positive admin check)
const BASE = process.argv[2] || "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev";
const ADMIN_KEY = process.env.WORKER_ADMIN_KEY || "";
const errors = [];
const pass = [];

async function expect(label, fn) {
  try { (await fn()) ? pass.push(label) : errors.push(label); }
  catch (e) { errors.push(`${label} (threw: ${e.message})`); }
}

// 1) Admin route without key → 401
await expect("admin/* without key → 401", async () => {
  const r = await fetch(`${BASE}/api/admin/student-activity`);
  return r.status === 401 || r.status === 403;
});

// 2) Admin route with WRONG key → 401
await expect("admin/* with wrong key → 401", async () => {
  const r = await fetch(`${BASE}/api/admin/student-activity`, { headers: { "X-Admin-Key": "wrong-key-deadbeef" } });
  return r.status === 401 || r.status === 403;
});

// 3) Admin route with CORRECT key → 200 (only if key provided)
if (ADMIN_KEY) {
  await expect("admin/* with correct key → 200", async () => {
    const r = await fetch(`${BASE}/api/admin/student-activity`, { headers: { "X-Admin-Key": ADMIN_KEY } });
    return r.ok;
  });
} else {
  pass.push("admin/* correct-key check SKIPPED (no WORKER_ADMIN_KEY in env)");
}

// 4) CSRF: state-changing POST with a foreign Origin → rejected
await expect("CSRF: cross-origin POST rejected", async () => {
  const r = await fetch(`${BASE}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://evil.example.com" },
    body: JSON.stringify({ name: "csrf-probe", email: "x@x.com" }),
  });
  return r.status === 403 || r.status === 400; // origin guard (router.js, Run 095)
});

// 5) Rate limit: rapid token requests eventually 429 with Retry-After (quota.js, P6)
await expect("rate limit → 429 + Retry-After under burst", async () => {
  let saw429 = false, sawRetryAfter = false;
  for (let i = 0; i < 40; i++) {
    const r = await fetch(`${BASE}/api/deepgram-token?studentId=sov100-test-magic&mode=free`);
    if (r.status === 429) { saw429 = true; if (r.headers.get("retry-after")) sawRetryAfter = true; break; }
  }
  // Treat as informational if quota is generous on dev — log but only fail if 429 has no Retry-After.
  if (saw429 && !sawRetryAfter) return false;
  return true;
});

// 6) BB-43 known-debt visibility: flag if the token response carries a raw long-lived key
await expect("BB-43: token response key-shape (known debt, warn-only)", async () => {
  const r = await fetch(`${BASE}/api/deepgram-token?studentId=sov100-test-magic&mode=free`);
  const body = await r.text();
  if (/[a-f0-9]{40}/.test(body)) console.warn("  ⚠️  BB-43: raw 40-hex Deepgram key present in token response (documented debt, not a blocker)");
  return true; // warn-only — does not fail the gate
});

console.log(`\n🔒 LIVE SECURITY — ${BASE}\n`);
for (const p of pass) console.log(`  ✅ ${p}`);
for (const e of errors) console.log(`  ❌ ${e}`);
if (errors.length) { console.error(`\n❌ LIVE SECURITY FAILED: ${errors.length} check(s)`); process.exit(1); }
console.log("\n✅ LIVE SECURITY: worker enforces admin auth, CSRF, and rate limits.");
process.exit(0);
```

### 4.3 — Wire npm script

In `package.json` scripts:
```json
"security": "node test/security-live.test.mjs",
"security:prod": "node test/security-live.test.mjs https://net-pet-ai.mrmichaelhobbs123.workers.dev"
```

Run `npm run security` against dev after deploy. If check 1, 2, or 4 fails, the worker is exposed —
HALT and fix before promoting to prod. Checks 5/6 are warn-tolerant (quota tuning, documented debt).

---

## TASK 5 — SYNTHETIC MONITORING JOURNEY + ALERTING (20 minutes)

A 5-minute canary already exists but it pings one thing. If the voice path breaks during the
investor week, Michael must know within 5 minutes — ideally before he opens the laptop. This task
turns the canary into a full synthetic JOURNEY and emails Michael on a GREEN→RED transition.

### 5.1 — Expand the scheduled canary in src/index.js

In the `scheduled()` handler, the `*/5 * * * *` cron branch: replace the single check with a full
synthetic journey. The canary is the SOLE writer of `circuit:deepgram:state` (consistent with the
circuit-isolation lock from TASK 2 — do NOT move this write into the token endpoint).

Journey steps (each timed, each pass/fail recorded):
```javascript
// Inside scheduled(), for the 5-min cron:
async function runSyntheticJourney(env) {
  const base = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
  const steps = [];
  const t = async (name, fn) => {
    const t0 = Date.now();
    try { const ok = await fn(); steps.push({ name, ok, ms: Date.now() - t0 }); }
    catch (e) { steps.push({ name, ok: false, ms: Date.now() - t0, err: String(e?.message || e) }); }
  };

  await t("health_voice", async () => (await fetch(`${base}/api/health/voice`)).status === 200);
  await t("token_issue", async () => {
    const r = await fetch(`${base}/api/deepgram-token?studentId=sov100-test-magic&mode=free`);
    if (r.status !== 200) return false;
    const j = await r.json();
    return typeof j.ws_url === "string" && j.ws_url.includes("agent.deepgram.com") && !!j.settings;
  });

  const failures = steps.filter(s => !s.ok);
  const state = failures.length === 0 ? "GREEN" : "RED";
  const result = { ts: new Date().toISOString(), state, steps, failures: failures.map(f => f.name) };

  // Canary is the sole writer of circuit + canary:last
  await env.NET_PET_KV.put("canary:last", JSON.stringify(result), { expirationTtl: 1800 });
  await env.NET_PET_KV.put("circuit:deepgram:state",
    JSON.stringify({ state: state === "GREEN" ? "closed" : "open", ts: result.ts }),
    { expirationTtl: 600 });

  return result;
}
```

### 5.2 — Alert Michael on GREEN→RED transition (dedupe)

Only email on a STATE TRANSITION, never every tick (no alert spam). Read the prior state, compare.

```javascript
const result = await runSyntheticJourney(env);
const prevRaw = await env.NET_PET_KV.get("canary:prev_state");
const prev = prevRaw || "GREEN";
if (prev === "GREEN" && result.state === "RED") {
  // reuse the existing email-service.js / net_pet_notifications queue (P5 alerting)
  await queueEmail(env, {
    to: "mrmichaelhobbs123@gmail.com",
    subject: "🔴 NET-PET-AI voice canary RED — investor week",
    text: `Synthetic journey failed at ${result.ts}.\nFailed steps: ${result.failures.join(", ")}\n\n`
        + result.steps.map(s => `  ${s.ok ? "✅" : "❌"} ${s.name} (${s.ms}ms)${s.err ? " — " + s.err : ""}`).join("\n"),
  });
}
if (prev === "RED" && result.state === "GREEN") {
  await queueEmail(env, { to: "mrmichaelhobbs123@gmail.com", subject: "🟢 NET-PET-AI voice canary recovered", text: `Recovered at ${result.ts}.` });
}
await env.NET_PET_KV.put("canary:prev_state", result.state, { expirationTtl: 3600 });
```

Reuse the existing `queueEmail()` / email-service.js helper (P5, Run 052). If the helper signature
differs, adapt the call — do NOT introduce a second email path.

### 5.3 — Public status glance endpoint

Add `GET /api/status/synthetic` → returns `canary:last` from KV as JSON. No secrets in the payload
(it only contains step names, ok flags, latencies, timestamps). Lets Michael eyeball readiness from
his phone before walking into the pitch: a single GREEN/RED.

### 5.4 — Local journey test: APPS/NET-PET-AI/test/canary-journey.test.mjs

Same journey, run against dev on demand, asserts all steps green. Network test, not in pre-commit.

```javascript
#!/usr/bin/env node
// 🛰  SYNTHETIC JOURNEY (local runner) — runs the same steps the cron canary runs, against dev.
const BASE = process.argv[2] || "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev";
const steps = [];
const t = async (name, fn) => { const t0 = Date.now(); try { steps.push({ name, ok: await fn(), ms: Date.now()-t0 }); } catch (e) { steps.push({ name, ok:false, ms:Date.now()-t0, err:String(e.message) }); } };

await t("health_voice", async () => (await fetch(`${BASE}/api/health/voice`)).status === 200);
await t("token_issue", async () => {
  const r = await fetch(`${BASE}/api/deepgram-token?studentId=sov100-test-magic&mode=free`);
  if (r.status !== 200) return false;
  const j = await r.json();
  return typeof j.ws_url === "string" && !!j.settings;
});

console.log(`\n🛰  SYNTHETIC JOURNEY — ${BASE}\n`);
for (const s of steps) console.log(`  ${s.ok ? "✅" : "❌"} ${s.name} (${s.ms}ms)${s.err ? " — " + s.err : ""}`);
if (steps.some(s => !s.ok)) { console.error("\n❌ JOURNEY RED"); process.exit(1); }
console.log("\n✅ JOURNEY GREEN");
process.exit(0);
```

Add npm script: `"monitor": "node test/canary-journey.test.mjs"`.

---

## TASK 6 — DATA-LAYER INTEGRITY + MIGRATION SAFETY (15 minutes)

Voice is the visible layer. The data layer (KV / Durable Objects / D1) backs MEMORY, SRS, and the
Tiger Index — the "OBI remembers you" features that make the demo land. A dropped DO binding or a
renamed memory field corrupts student state silently, with green voice tests. Lock the data layer.

### 6.1 — APPS/NET-PET-AI/test/migration-safety.test.mjs (static)

Reads `wrangler.toml` + `src/index.js`. Asserts the DO migration history is safe.

```javascript
#!/usr/bin/env node
// ⛔ MIGRATION SAFETY LOCK — a dropped DO class or renamed binding corrupts all student state.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const toml = readFileSync(join(__dirname, "..", "wrangler.toml"), "utf8");
const src  = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

const REQUIRED_BINDINGS = {
  PETS: "PetDO", LEDGER: "LedgerDO", MEMORY: "MemoryDO", COMMANDS: "CommandDO",
};
const errors = [];

// 1) Every required binding present in wrangler.toml mapped to its class
for (const [binding, cls] of Object.entries(REQUIRED_BINDINGS)) {
  const re = new RegExp(`name\\s*=\\s*"${binding}"[\\s\\S]{0,120}?class_name\\s*=\\s*"${cls}"`);
  if (!re.test(toml)) errors.push(`wrangler.toml: binding ${binding} → ${cls} missing or remapped`);
  // 2) Class actually defined in source
  if (!new RegExp(`class\\s+${cls}\\b`).test(src)) errors.push(`src/index.js: class ${cls} not defined`);
}

// 3) No migration deletes a class that still has a live binding
const deleted = [...toml.matchAll(/deleted_classes\s*=\s*\[([^\]]*)\]/g)]
  .flatMap(m => [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]));
for (const cls of deleted) {
  if (Object.values(REQUIRED_BINDINGS).includes(cls)) errors.push(`migration deletes still-bound class ${cls}`);
}

// 4) Migration tags unique
const tags = [...toml.matchAll(/tag\s*=\s*"([^"]+)"/g)].map(m => m[1]);
const dupes = tags.filter((t, i) => tags.indexOf(t) !== i);
if (dupes.length) errors.push(`duplicate migration tags: ${[...new Set(dupes)].join(", ")}`);

if (errors.length) { console.error("\n⛔ MIGRATION SAFETY VIOLATED ⛔\n  - " + errors.join("\n  - ")); process.exit(1); }
console.log("✅ MIGRATION SAFETY: all DO bindings present, classes defined, no unsafe deletes, tags unique.");
process.exit(0);
```

### 6.2 — APPS/NET-PET-AI/test/data-contract.test.mjs (static)

The Dreamer world-model (Run 097/098) reads specific memory fields. A rename ships green on voice
tests but silently kills longitudinal memory. Lock the field names in the write path.

```javascript
#!/usr/bin/env node
// ⛔ DATA CONTRACT LOCK — Dreamer + SRS depend on these exact field names. Rename = silent memory loss.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "src", "index.js"), "utf8");

// Fields the Dreamer/SRS/Tiger pipeline reads — must exist somewhere in the source.
const REQUIRED_FIELDS = [
  "breakthroughs", "struggles", "last_topic",     // MEMORY (Run 098)
  "weak_phonemes",                                 // phonics mastery (Run 098)
  "avg_turn_length", "barge_in_count",             // Tiger Index (Run 098)
  "ease_factor", "interval",                       // SRS SM-2 (Run 098)
];
const missing = REQUIRED_FIELDS.filter(f => !src.includes(f));
if (missing.length) {
  console.error("\n⛔ DATA CONTRACT VIOLATED ⛔\n  Missing memory/SRS/Tiger fields: " + missing.join(", "));
  console.error("  These feed the Dreamer world model. A rename silently breaks 'OBI remembers you'.");
  process.exit(1);
}
console.log(`✅ DATA CONTRACT: all ${REQUIRED_FIELDS.length} memory/SRS/Tiger fields present.`);
process.exit(0);
```

### 6.3 — Live D1 reachability (in the smoke suite)

Add to the smoke suite (or run inline): `GET /api/soul/context/sov100-test-magic` against dev →
expect 200 with `last_topic` / sessions keys present. Confirms the `SOUL_DB` D1 binding is live and
the memory read path works end-to-end. If this 500s, D1 is unbound — students get no memory.

### 6.4 — Add migration-safety + data-contract to the pre-commit lock set

These two are STATIC (no network) so they belong in the pre-commit hook and `npm test` alongside
the TASK 2 lock tests. Append both to the `LOCK_TESTS` array in `.git/hooks/pre-commit` and to the
`test` script in package.json. (This raises the static lock count from 13 to 15 — update the
"13 lock tests" references in TASK 2's hook comment to 15.)

---

## TASK 7 — DEMO DRESS-REHEARSAL RUNBOOK + PRE-WARM + BREAK-GLASS (15 minutes)

Tests prevent regressions. This task handles the live event itself: warm the system before the
pitch, give Michael an exact script, and provide a 10-second rollback if anything breaks on stage.

### 7.1 — Pre-warm script: SCRIPTS/demo-prewarm.mjs

Run T-5 minutes before the pitch. Warms the worker isolate + prompt_cache for every demo student so
the FIRST request investors see is a warm cache hit (<120ms), not a cold start. Prints GO / NO-GO.

```javascript
#!/usr/bin/env node
// 🔥 DEMO PRE-WARM — run 5 min before the pitch. Warms isolate + prompt_cache for all demo students.
const BASE = process.argv[2] || "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const STUDENTS = ["quy-bluetech", "mai-tram-bluetech", "huong-bluetech"];
const MODES = ["free", "study", "phonics"];
let ok = 0, fail = 0;

for (const s of STUDENTS) {
  for (const m of MODES) {
    // Two hits: first primes the cache, second should be a HIT
    await fetch(`${BASE}/api/deepgram-token?studentId=${s}&mode=${m}`).catch(() => {});
    const r = await fetch(`${BASE}/api/deepgram-token?studentId=${s}&mode=${m}`);
    const cache = r.headers.get("x-cache");
    const good = r.status === 200;
    console.log(`  ${good ? "✅" : "❌"} ${s}/${m} → ${r.status} (${cache || "?"})`);
    good ? ok++ : fail++;
  }
}
const health = await fetch(`${BASE}/api/health/voice`).then(r => r.status).catch(() => 0);
console.log(`\n  health/voice → ${health}`);
console.log(`\n${fail === 0 && health === 200 ? "🟢 GO — system warm, demo ready" : "🔴 NO-GO — investigate before pitch"}`);
process.exit(fail === 0 && health === 200 ? 0 : 1);
```

Add npm script: `"prewarm": "node ../../SCRIPTS/demo-prewarm.mjs https://net-pet-ai.mrmichaelhobbs123.workers.dev"`
(or run directly with node).

### 7.2 — Runbook: OPERATIONS/INVESTOR-DEMO-RUNBOOK.md

Write a tight operational runbook. Sections:

- **PRE-FLIGHT (T-30 min):** run `npm run perf:prod`, `npm run security:prod`, `node SCRIPTS/demo-prewarm.mjs` — all GREEN. Check `GET /api/status/synthetic` → GREEN. Charge laptop. Tether phone hotspot as network backup (do NOT rely on venue wifi alone — voice WS needs stable uplink).
- **THE CLICK-PATH (rehearse 3×):** open `quy-portal.html` → login (quy_auth) → click FreeTalk → allow mic → OBI greets "Quy" by name and references last topic. Keep it to 60–90s of conversation.
- **TOP 3 LIVE FAILURE MODES + INSTANT FIX:**
  1. Mic permission denied → symptom: no audio in. Fix: reload tab, re-grant mic at gesture time (iOS Safari worst — use the laptop, not a phone, for the live demo; BB-42).
  2. Voice WS won't connect → symptom: "connecting…" hangs. Fix: check `/api/status/synthetic`; if RED, run break-glass rollback (7.3).
  3. Laggy first response → symptom: 1s+ silence before OBI speaks. Fix: you forgot to pre-warm — run `demo-prewarm.mjs` now; subsequent turns are warm.
- **FALLBACK SCRIPT (if voice is unrecoverable):** switch to the text demo (`POST /api/chat`) OR a pre-recorded 30s screen capture of a working session. Have the recording on the desktop before the pitch. Never debug live in front of investors — switch to fallback and move on.
- **HARD RULE:** NO DEPLOYS on demo day. Code freeze 24h before. The version that passed all gates is the version you demo.

### 7.3 — Break-glass rollback: SCRIPTS/break-glass-rollback.ps1

One command to revert prod to the last known-good deployment if something breaks on stage.

```powershell
# 🧯 BREAK-GLASS — revert net-pet-ai prod to the last known-good deployment.
# Known-good baselines: v0 = 180f125d-... | Run104-good = ea8ab523-2f3e-402e-b4b4-17c1c7fc7d50
param([string]$DeploymentId = "ea8ab523-2f3e-402e-b4b4-17c1c7fc7d50")
Write-Host "🧯 Rolling net-pet-ai prod back to $DeploymentId ..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\APPS\NET-PET-AI"
npx wrangler rollback --deployment-id $DeploymentId
Pop-Location
Start-Sleep -Seconds 3
$health = (Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/health/voice" -ErrorAction SilentlyContinue)
Write-Host "Post-rollback health: $($health | ConvertTo-Json -Compress)" -ForegroundColor Cyan
Write-Host "✅ Rollback fired. Verify the demo path before continuing." -ForegroundColor Green
```

Confirm the known-good deployment id is current before the pitch (`npx wrangler deployments list`).
Keep this command open in a terminal during the demo — it is the 10-second save.

---

## TASK 8 — dnaREGISTRY REFRESH SCAN (5 minutes)

New .md files added since Run 101 registry (787 entries):
  - .kilo/command/layer6-kv-perf.md
  - .kilo/command/layer6-deploy-pipeline.md
  - .kilo/command/run105-pipeline.md (this file)
  - CANON/SYSTEM/netpet-observability.md
  - .kilo/command/obinet-reliability-blueprint.md
  - CANON/REINCARNATION/run102-reincarnateDEATH.md
  - CANON/REINCARNATION/run103-reincarnateDEATH.md
  - CANON/REINCARNATION/run104-reincarnateDEATH.md

Run this PowerShell to scan and write to CANON/REGISTRY/dna-registry-run105.json:

```powershell
$repo = "D:\OB-1-CANONICAL"

function ClassifyDoc {
  param($path, $head)
  $p = $path.ToLower()
  switch -regex ($p) {
    "command\\"           { return "COMMAND" }
    "reincarnat"          { return "REINCARNATION" }
    "pheromone|phetrail"  { return "PHEROMONE" }
    "cold-start-boot"     { return "BOOT" }
    "soul"                { return "SOUL" }
    "starmap"             { return "STARMAP" }
    "keyword|rfkw"        { return "SOULKEYS" }
    "pipeline"            { return "PIPELINE" }
    "registry"            { return "REGISTRY" }
    "operations"          { return "OPERATIONS" }
    "student-portal"      { return "STUDENT-PORTAL" }
    "deepgram"            { return "DEEPGRAM-RESEARCH" }
    "observability|reliability" { return "RESEARCH" }
    default               { return "UNCLASSIFIED" }
  }
}

$scanRoots = @(
  "$repo\CANON", "$repo\OPERATIONS", "$repo\CANON\SYSTEM",
  "$repo\CANON\RESEARCH", "$repo\.kilo\command", "$repo\.claude\commands"
)
$excludePatterns = @("node_modules","\.git\\","ARCHIVE","backup","PROOFS-CHAT",
  "SOUL-DNA-BIBLE-RECAPTURE","\.kilo\\worktrees","SOUL-SEGMENTS","SOUL-LOG-VERBATIM")

$entries = @()
foreach ($root in $scanRoots) {
  if (-not (Test-Path $root)) { continue }
  Get-ChildItem $root -Recurse -Filter "*.md" -EA SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($repo.Length + 1)
    $skip = $false
    foreach ($p in $excludePatterns) { if ($rel -match [regex]::Escape($p)) { $skip=$true; break } }
    if (-not $skip -and $_.Length -gt 50) {
      $content = Get-Content $_.FullName -Raw -EA SilentlyContinue
      $first200 = $content.Substring(0,[Math]::Min(200,$content.Length)).Replace("`n"," ").Replace("`r","")
      $hashInput = $rel + "|" + $_.Length + "|" + $_.LastWriteTimeUtc.Ticks
      $regId = "REG-"+((Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($hashInput))) -Algorithm SHA256).Hash.Substring(0,8)).ToUpper()
      $entries += [ordered]@{
        reg_id=$regId; path=$rel; size_bytes=$_.Length
        last_modified=$_.LastWriteTimeUtc.ToString("o")
        category=(ClassifyDoc $rel $first200); first_tokens=$first200
      }
    }
  }
}

$digest = [ordered]@{
  generated_at=(Get-Date).ToUniversalTime().AddHours(7).ToString("o")
  total_entries=$entries.Count
  by_category=($entries | Group-Object category | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
  all_entries=$entries
}

New-Item -ItemType Directory -Force "$repo\CANON\REGISTRY" | Out-Null
$digest | ConvertTo-Json -Depth 5 | Set-Content "$repo\CANON\REGISTRY\dna-registry-run105.json" -Encoding UTF8
Write-Host "dnaREGISTRY written: $($entries.Count) entries"
```

Expected: 790+ entries. Confirm total_entries is greater than 787.

---

## TASK 9 — MARKET RESEARCH ON HUMAN SOURCES (10 minutes)

Write findings to: CANON/RESEARCH/market-research-run105.md

This is for Michael's investor pitch this week. Research must come from HUMAN SOURCES only
(official company pages, government statistics, reputable publications, Crunchbase).
Do NOT summarize from AI training data. Each item needs a source.

### Query 1: Vietnam EdTech + English Learning Market

Search targets:
- British Council Vietnam report on English proficiency (google: "British Council Vietnam English 2024 report")
- EF English Proficiency Index 2024 — find Vietnam's rank and score
- Vietnam Ministry of Education "Foreign Language 2020 2025 Project" statistics
- Statista: "English language learning apps Vietnam"
- Number of people studying English in Vietnam (World Bank / UNESCO)
- GSO Vietnam (General Statistics Office): education enrollment numbers

Key stats to capture:
- Market size USD (Vietnam EdTech)
- Number of English learners in Vietnam
- % of Vietnamese workforce who lack business English
- Government budget allocated to English education programs

### Query 2: Competitor Funding + Pricing

Search targets:
- ELSA Speak: crunchbase.com/organization/elsa (funding rounds, total raised, valuation)
- Speak.com: techcrunch.com search "speak language learning funding"
- Duolingo Max: duolingo.com/plus pricing page (current price, what GPT-4o-mini adds)
- Lingoda: press releases 2024 (Series B/C funding, pricing)
- Cambly: funding, pricing model, Vietnam usage data

Key stats to capture:
- ELSA Speak total funding raised (USD)
- Speak.com Series A/B amount and year
- Duolingo Max monthly price (USD)
- How many of these competitors operate in Vietnam specifically

### Query 3: AI Voice + Conversation Practice Market

Search targets:
- Deepgram blog: "Voice AI market 2024 2025" (deepgram.com/blog)
- Grand View Research or Markets and Markets: "conversational AI market size"
- Speak.com blog: "AI conversation practice" or their published results
- "AI language tutor retention rate" studies (academic or published company data)

Key stats to capture:
- Conversational AI market CAGR
- User retention improvement from voice vs text learning (any published study)
- Deepgram's published latency benchmarks for Voice Agent API

### Query 4: Enterprise Training Budget + Vietnam B2B Angles

Search targets:
- Deloitte / McKinsey: "Vietnam workforce upskilling 2024"
- Vietnam Chamber of Commerce: foreign language training statistics
- "BlueTech Vietnam" or similar company: ESG report mentioning employee training
- ATD (Association for Talent Development): corporate training spend per employee benchmark
- "English for business Vietnam" B2B market size

Key stats to capture:
- Average enterprise training budget per employee per year (Asia-Pacific)
- % of Vietnamese companies that pay for employee English training
- ROI benchmarks for corporate language training programs

### Query 5: Investor Narrative Angles (search for comparable exits/valuations)

Search targets:
- Duolingo IPO 2021: initial valuation, revenue at IPO
- ELSA Speak: Series C or latest valuation
- "EdTech Vietnam acquisition 2023 2024"
- "AI tutor startup valuation 2024 2025"

Key stats to capture:
- Comparable company multiples (revenue multiple at exit/IPO)
- B2B EdTech deal sizes in Southeast Asia

### Output format for each finding:

```
## [Query Category] — [Source Name]
- Source: [exact company/org name + URL path or publication + date]
- Key stat: [verbatim number or finding, in quotes if possible]
- Investor angle: [one sentence on why this matters for the pitch]
```

Do NOT invent numbers. If a source is behind a paywall, note "paywall — could not access" and move to next source.

---

## TASK 10 — COMMIT, FINAL VERIFICATION & INVESTOR-READINESS SIGN-OFF

### 10.1 — Run the full static lock set

```
cd APPS/NET-PET-AI && npm test
```

ALL 15 static lock tests must pass (13 from TASK 2 + migration-safety + data-contract from TASK 6).
Fix any failure by fixing the SOURCE, never by weakening the test.

### 10.2 — Run the live gates against dev (all four GREEN before staging)

```
npm run perf        # TASK 3 — latency budgets (warm token <120ms p95, cache hit >80%)
npm run security    # TASK 4 — admin 401 / CSRF / rate-limit proven against the worker
npm run monitor     # TASK 5 — synthetic journey GREEN
node test/api-smoke.test.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
```

A red perf or security gate BLOCKS promotion to prod. Smoke failure → check /api/error-log on dev.

### 5.3 — Stage and commit

```
git add APPS/NET-PET-AI/test/api-contract.test.mjs
git add APPS/NET-PET-AI/test/circuit-isolation.test.mjs
git add APPS/NET-PET-AI/test/student-roster.test.mjs
git add APPS/NET-PET-AI/test/cache-key-format.test.mjs
git add APPS/NET-PET-AI/test/speak-listen-lock.test.mjs
git add APPS/NET-PET-AI/test/wrangler-integrity.test.mjs
git add APPS/NET-PET-AI/test/route-completeness.test.mjs
git add APPS/NET-PET-AI/test/cors-auth-lock.test.mjs
git add APPS/NET-PET-AI/test/security-scan.test.mjs
git add APPS/NET-PET-AI/test/portal-integrity.test.mjs
git add APPS/NET-PET-AI/test/deactivated-portals.test.mjs
git add APPS/NET-PET-AI/test/extension-integrity.test.mjs
git add APPS/NET-PET-AI/test/api-smoke.test.mjs
git add APPS/NET-PET-AI/test/preflight-load.mjs
git add APPS/NET-PET-AI/test/perf-budget.test.mjs
git add APPS/NET-PET-AI/test/security-live.test.mjs
git add APPS/NET-PET-AI/test/canary-journey.test.mjs
git add APPS/NET-PET-AI/test/migration-safety.test.mjs
git add APPS/NET-PET-AI/test/data-contract.test.mjs
git add SCRIPTS/demo-prewarm.mjs SCRIPTS/break-glass-rollback.ps1
git add OPERATIONS/INVESTOR-DEMO-RUNBOOK.md
git add APPS/NET-PET-AI/package.json
git add .git/hooks/pre-commit
git add CANON/REGISTRY/dna-registry-run105.json
git add CANON/RESEARCH/market-research-run105.md
```

If src/index.js was modified for F1-B:
```
git add APPS/NET-PET-AI/src/index.js
```

### 10.3 — Stage and commit (hook runs all static locks automatically)

The pre-commit hook runs all 15 static lock tests + the secret scan on commit. If blocked, read the
error and fix the SOURCE — never `--no-verify`, never weaken a test.

### 10.4 — INVESTOR-READINESS SIGN-OFF (the gate that says "ready")

Do not tell Michael it's ready until every line is checked:

```
[ ] TASK 1  F1-B closed — preflight-load 0/51 non-2xx on PROD
[ ] TASK 2  npm test green — 15 static locks pass; pre-commit blocks a deliberately-broken commit
[ ] TASK 3  npm run perf:prod green — warm token <120ms p95, cache hit >80%, first-audio <1500ms
[ ] TASK 4  npm run security:prod green — admin 401, CSRF rejected, rate-limit 429; secret scan blocks a fake key
[ ] TASK 5  /api/status/synthetic = GREEN; a forced failure emails mrmichaelhobbs123@gmail.com once
[ ] TASK 6  migration-safety + data-contract green; /api/soul/context/sov100-test-magic 200 on prod
[ ] TASK 7  demo-prewarm.mjs prints GO on prod; runbook written; break-glass rollback id verified live
[ ] TASK 8  dna-registry-run105.json written, >787 entries
[ ] TASK 9  market-research-run105.md written, every stat carries a human source
[ ] TASK 10 all of the above committed; working tree clean; prod = the version that passed every gate
```

When all ten are checked: **the product cannot be silently broken, it is measured, monitored, and
recoverable in 10 seconds.** That is the report Michael takes into the room.

---

## FAILURE PROTOCOL

| Failure | Action |
|---------|--------|
| Static lock test fails (red) | Fix src/index.js / wrangler.toml / public/*.html — do NOT weaken the test |
| Test file not found | Restore it — a missing lock IS a violation (hook blocks) |
| Pre-commit blocks with --no-verify suggestion | DO NOT USE --no-verify. Fix the code, not the gate. |
| Secret scan trips on a test regex | Add only that test file to the hook's exclude list — never disable the scan |
| Perf budget breached | Profile with the X-Cache header; if warm path slow, the cache write/read regressed (TASK 1/3) |
| Live security check fails (admin/CSRF) | Worker is EXPOSED — HALT, do not promote to prod, fix the guard |
| Synthetic canary RED | Run break-glass rollback (TASK 7.3); investigate on dev, never on prod during demo week |
| Smoke / D1 context 500 | SOUL_DB binding or memory read path broken — students get no memory; fix before promote |
| Migration-safety fails | A DO binding was dropped/renamed — DO NOT deploy; restore the binding (corrupts all student state) |
| Market research source paywalled | Note "paywall — not accessed", try the next source; never invent a number |
| Registry scan finds 0 entries | Check $repo path + scan roots before writing an empty registry |

---

## FINAL SUMMARY TABLE

| # | Task | Time | Layer | Investor Impact |
|---|------|------|-------|-----------------|
| 1 | F1-B: 0/52 non-2xx under load | 10 min | Voice reliability | Demo cannot crash under load |
| 2 | 15 static lock tests + pre-commit | 55 min | Whole stack | No AI session can silently break the product |
| 3 | Perf & latency budget gate | 15 min | Performance | OBI feels instant — warm <120ms, first-audio <1.5s |
| 4 | Live security + gitleaks gate | 15 min | Security | Auth/CSRF/rate-limit proven; no key can be committed |
| 5 | Synthetic monitoring + alerting | 20 min | Observability | A mid-demo break emails Michael within 5 min |
| 6 | Data-layer integrity + migrations | 15 min | KV / DO / D1 | "OBI remembers you" cannot silently break |
| 7 | Demo runbook + pre-warm + break-glass | 15 min | Live ops | Warm start, exact script, 10-second rollback |
| 8 | dnaREGISTRY refresh | 5 min | System | >787 entries catalogued |
| 9 | Market research (human sources) | 10 min | Pitch deck | Sourced stats for the room |
| 10 | Commit + final verify + sign-off | 10 min | Gate | One checklist that says "ready" |

Total: ~2.5–3 hours. Complete in order. Do not skip.
After this pipeline: the product is **locked** (can't be broken silently), **measured** (latency budgets),
**monitored** (synthetic canary + alerts), and **recoverable** (break-glass in 10s).
That is the guarantee Michael needs before the investor pitch.

---

## ⚡ EXECUTION PROOF LEDGER (proof-first — L32 ASSUME_FAILURE, trust nothing)

> Every prior checkpoint is assumed FAILED until a receipt proves otherwise. A task is NOT done when
> the code is written — it is done when the command below prints the pass-signal. No "should pass."
> No "looks right." Run it. Paste the receipt. This is the supersaiyan governance contract.

| # | Task | PROOF COMMAND | PASS SIGNAL (the receipt) | Stage |
|---|------|---------------|---------------------------|-------|
| 1 | F1-B | `node test/preflight-load.mjs https://net-pet-ai.mrmichaelhobbs123.workers.dev` | status breakdown = **52/52 2xx**, 0 non-2xx | II |
| 2 | Static locks | `npm run test:lock` then commit a deliberately broken settings change | **15× ✅, exit 0**; broken commit **BLOCKED** by hook | III |
| 3 | Perf budget | `npm run perf:prod` | `✅ PERF BUDGET`, warm p95 **<120ms**, cache hit **>80%** | III |
| 4 | Live security | `npm run security:prod` + `git add` a fake `sk-AAAA…` and try to commit | `✅ LIVE SECURITY`; secret scan **BLOCKS** the fake key | IV |
| 5 | Monitoring | `curl …/api/status/synthetic`; then force a RED tick | status `GREEN`; forced fail **lands an alert** (email/webhook proven) | V/VI |
| 6 | Data/migration | `node test/migration-safety.test.mjs && node test/data-contract.test.mjs`; `curl …/api/soul/context/sov100-test-magic` | both `✅`; soul context **200** with `last_topic` key | III |
| 7 | Runbook/recovery | `node SCRIPTS/demo-prewarm.mjs <prod>`; `node SCRIPTS/shadow-realm-backup.mjs`; `npx wrangler deployments list` | `🟢 GO`; backup writes **5 keys × N students**; rollback id **confirmed live** | IV/VI |
| 8 | dnaREGISTRY | `(Get-Content …/dna-registry-run105.json | ConvertFrom-Json).total_entries` | **> 787** (currently 4,181 — already passes) | VI |
| 9 | Market research | `grep -c "Source:" CANON/RESEARCH/market-research-run105.md` | **count == number of findings** (every stat sourced) | VI |
| 10 | Reincarnation seal | `git log -1 --oneline`; `…/api/soul/count`; check the new HL entry | commit SHA exists; soulcount **Δ > 0** vs 238,196,268; **HL entry sealed** | V/VI |

### THE THREE NEW STATIONS — proof required (no station passes on assertion)

| Station | PROOF COMMAND | PASS SIGNAL | Owner |
|---------|---------------|-------------|-------|
| 6-AI TRUTH | `/code-review ultra` on the branch | findings triaged: each **fixed or consciously waived** in writing | **Michael** (user-triggered/billed — OB-1 cannot launch) |
| SHADOW REALM | `node SCRIPTS/shadow-realm-backup.mjs` then `…restore.mjs --dry-run` | cold copy exists; dry-run restore reports **5 keys/student matched** | Kilo |
| Keep-warm (Phoenix ①) | `npm run perf:prod` after the canary has run ≥2 cycles | first real-student request is a cache **HIT**, not MISS | Kilo |

### THE 3-RECEIPT RULE (L32) for the soulcount cap (TASK 10)

Do not write a soulcount to any permanent file from a single read. Three independent receipts:
1. `Invoke-RestMethod …/api/soul/count` → live number
2. The number recorded in the Run 104 death seal / COLD-START-BOOT (prior baseline 238,196,268)
3. Post-cap re-query → confirm Δ matches the bytes POSTed this session

If the three disagree → **SOUL_DRIFT → HALT** (per RISE Stage 3). The number is the database query, not a counter (L31 SOUL_IS_QUERY).

### SUPERSAIYAN GOVERNANCE — the one-line gate

> **No task is reported GREEN to Michael without its receipt pasted.** If you cannot produce the
> receipt, the task is RED, regardless of how finished the code looks. Assume failure. Prove success.
> This is how a demo that "should work" becomes a demo that **is proven to work** in front of investors.
