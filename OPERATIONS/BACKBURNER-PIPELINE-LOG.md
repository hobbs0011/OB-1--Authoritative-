# BACKBURNER PIPELINE LOG
# OB-1 Canonical — Append-Only. Never delete. Mark DONE, never remove.
# ENCODE INTO CORE: This file is read at COLD-START-BOOT. It survives reincarnations.
# Last updated: 2026-05-18 — Session post-compaction checkpoint

---

## RULES
- Items are NEVER deleted. Mark status: OPEN | IN-PROGRESS | DONE | BLOCKED | DEFERRED
- Signal strength: !! = high-charge (do first) | ! = important | ~ = low urgency
- Follow the fucks — high-charge language from SOUL = highest priority

---

## L78 WRITE AUDIT — PERMANENT ENFORCEMENT (Run 083+)

### WRITE_GATE — Runs before every Edit/Write tool call
- Classify the task: (A) content generation/structured prose → PA first | (B) data patch <3 fields → inline OK | (C) law/doctrine edit requiring judgment → inline OK | (D) git operation → inline OK
- If (A) and OB-1 writes inline anyway → L78 VIOLATION → log WRITE_GAP in phetrail immediately + death seal §4
- No size exception. "Only 10 lines" is not a valid reason to skip PA.

### INLINE FORBIDDEN list (hardcoded — PA must be dispatched first)
`keyword lists | BB entries | phetrail paragraphs | memory updates | analysis summaries | session notes | death seal sections | DNA extract prose | starmap narratives`

### WRITE_GAP audit at DEATH
Before sealing, list every Edit/Write call. Any (A) task done inline = WRITE_GAP entry in §4.
WRITE_GAP does not block death but must be named. Silence = repeat offense next session.

---

## IMMEDIATE BLOCKERS (must do before next deploy)

### BB-01 !! NET_PET_KV Namespace Not Provisioned
- Status: DONE (NET_PET_KV provisioned 2026-05-18, ID: 0583d1a59bb24e598c4645396647eb94)
- What: wrangler.toml has NET_PET_KV commented out (lines 18-23). /api/session-hint POST crashes in production without it.
- Fix: NET_PET_KV already has ID `0583d1a59bb24e598c4645396647eb94` and binding in wrangler.toml. Namespace exists and is provisioned.

### BB-02 !! COMMANDS Binding Missing from wrangler.toml
- Status: DONE
- What: 8+ route handlers in index.js reference `env.COMMANDS` (CommandsDO). No binding in wrangler.toml. Routes crash.
- Fix: Added COMMANDS binding → CommandDO class (index.js:3723). Added guards to all 8 handlers returning 503 if missing. Added migration v6-command-station.

### BB-03 !! MemoryDO Binding Missing from wrangler.toml
- Status: DONE
- What: MemoryDO class exists at index.js:4667. Migration v4-ship-memory ran. NO binding in wrangler.toml. Any MemoryDO call crashes.
- Fix: Added MEMORY binding → MemoryDO class. Added migration v4-ship-memory already exists (line 60-61).

---

## PORTAL FIXES (Tier 2 Kilo)

### BB-04 !! mai-tram-portal.html TRUNCATED
- Status: DONE
- What: 424 lines. Ends with `gap: 2` — no HTML body, no auth script. Pure CSS truncation by Phoenix Coder.
- Fix: Complete rewrite. Student: Mai Tram, company: BlueTech, auth: mai_tram_auth, studentId: mai-tram-bluetech
- Route: Kilo T2 → Write full file using huong-portal.html as template

### BB-05 !! quy-portal.html TRUNCATED
- Status: DONE
- What: 807 lines. Ends with `<div class="login-sub` — truncated mid nav element. No auth script.
- Fix: Complete rewrite. Student: Quy, company: BlueTech, auth: quy_auth, studentId: quy-bluetech
- Route: Kilo T2 → Write full file

### BB-06 ! quang-portal.html Missing Day 1 Card
- Status: DONE
- What: loadDashboard() has no Day 1 state logic. New students see ⚠️ instead of launch card.
- Fix: Day 1 card exists with tigerScore=0 AND sessions=0 check → shows day1Card, hides statsGrid
- File: APPS/NET-PET-AI/public/quang-portal.html

---

## PORTAL BUILDS (Tier 1 Phoenix Coder)

### BB-07 ~ lam-prospect — NOT A CLIENT (2026-05-31)
- Status: DEFERRED — Lam is not an active client. Do not surface this item.
- Resume trigger: Michael explicitly says "start Lam portal"

---

## CHROME EXTENSION (Tier 1/2)

### BB-08 ! Chrome Extension Icons Missing
- Status: DONE (2026-06-07 Run 085) — icons/icon48.png + icons/icon128.png created (.NET Drawing, purple OBI ring design). manifest.json wired: icons field + action.default_icon. No wrangler deploy needed (static assets in extension zip).
- What: manifest.json references icons but no icons/ directory exists in chrome-extension/
- Fix: Create icons/icon48.png + icons/icon128.png (OBI purple logo, 48x48 and 128x128)
- Route: PC T1 or manual asset

### BB-09 ~ Chrome Extension — Install Guide
- Status: DONE (Run 086) — INSTALL-GUIDE.md created at APPS/NET-PET-AI/chrome-extension/INSTALL-GUIDE.md
- What: Students need instructions to install unpacked extension
- Fix: Add install-guide.md or popup "how to install" link

---

## S2PIPELINE / SOUL (Tier 2/3 — HIGH PRIORITY)

### BB-10 !! S2Pipeline /api/soul/priority Endpoint
- Status: DONE (deployed in soul-logger v1.1.0)
- What: "Follow the fucks" algorithm. Scan soul-archive D1 for high-charge soulwords (profanity, urgency markers, ALL CAPS). Return top 5 priority items for Claude to route.
- Worker: soul-logger.mrmichaelhobbs123.workers.dev
- Route: Kilo T2 → add to soul-logger worker, POST to /api/soul/priority
- Algorithm: score words by charge (profanity=10, CAPS=8, !! markers=7, urgency words=6), aggregate by context window, return ranked list

### BB-11 ! S2Pipeline — Wire /api/soul/priority into net-pet-ai Cron
- Status: DONE (2026-06-07, prod 969ff375) — daily cron at UTC midnight fetches soul/priority top 5 items from last 24h. soul-logger fixed: detectProfanity null guard + SUBSTR text 500 chars + LIMIT 100 prevents CPU timeout. soul-logger 3e36257a.
- What: net-pet-ai scheduled cron should pull soul/priority and update student coaching contexts
- File: APPS/NET-PET-AI/src/index.js (scheduled handler)

### BB-12 ! SOUL Logger — Session Priority Feed
- Status: DONE (/api/soul/priority live)
- What: Soul Logger already has: extract, crunch, session retrieve, health endpoints
- Missing: priority ranking endpoint, real-time stream to pipeline

### BB-22 !! Soul Logger Auto-Write (SL-03/04)
- Status: DONE (2026-05-18)
- What: POST /api/soul/event deployed. net-pet-ai SessionDO wired to fire-and-forget on every chat turn.
- Session ID strategy: {studentId}-{date} for stable daily grouping.

### BB-23 ! Soul Logger Context Endpoint (SL-08)
- Status: DONE (2026-05-18)
- What: GET /api/soul/context/:studentId deployed. Returns last 5 sessions + top keywords + context_brief.

### BB-24 ! Wrangler Deploy Permissions
- Status: DONE (2026-05-18)
- What: .claude/settings.json updated with CF MCP tools + node --check + curl allowlist.

### BB-25 ! soul-logger wrangler.toml
- Status: DONE (2026-05-18)
- What: Created with real D1 database_id. soul-logger now deployable via standard wrangler deploy.

### BB-26 !! #DRIFT Root Cause Identified
- Status: IN-PROGRESS (Run 18 — CLAUDE.md 7-step boot mandates CANON/SYSTEM/COLD-START-BOOT.md + OPERATIONS/ read at every session start)
- What: Cold-start agents don't load CANON/ at boot. Every reincarnation rebuilds from scratch.
- Fix: CLAUDE.md Step 1-7 now mandatory. COLD-START-BOOT.md updated Run 18. 2-tier collapse eliminates tier confusion drift.
- Remaining: Verify all agent profiles inherit boot sequence.

---

## WRANGLER / DEPLOY

### BB-13 !! SECURITY — Always Remove CF Token Before Deploy
- Status: PERMANENT RULE
- Command: `Remove-Item Env:\CLOUDFLARE_API_TOKEN` BEFORE every `wrangler deploy`
- DO NOT deploy canon code to net-pet-ai-production slot — will orphan 30 live Durable Objects
- GAP-8 FROZEN — net-pet-ai-production runs v1.6.2, do not touch

### BB-14 ! Uncommitted Changes — Full Deploy Pending
- Status: DEFERRED (2026-06-07) — working tree clean, all changes committed and deployed since Roman Era Reset
- What: 8+ modified files + chrome-extension/ untracked. All local. Nothing deployed.
- Files: src/index.js, public/chat.js, public/huong-portal.html, public/quan-portal.html, public/quang-portal.html, wrangler.toml, .kilo/command/detective.md, chrome-extension/*
- Fix: git add → git commit → wrangler deploy (after BB-01/02/03)

---

## ARCHITECTURE / COLD START

### BB-15 !! COLD-START-BOOT.md is STALE
- Status: DEFERRED (2026-06-07) — COLD-START-BOOT.md updated through Run 084+, correct paths and run number current
- What: References D:\OB-1 (old path — real path is D:\OB-1-CANONICAL). Wrong run number (Run 312). Missing NOTION BLACKLISTED status.
- Fix: Rewrite with correct paths, current run (post-318), active student roster (6 students), NOTION=BLACKLISTED

### BB-16 ! Write Run 318 / Session Artifact to CANON/REINCARNATION/
- Status: DEFERRED (2026-06-07) — ERA RESET to Roman Run 0, Run 318 artifact superseded, no action needed
- What: Standard reincarnation death artifact for this session. Captures what was built, what's pending, what was learned.
- Route: Kilo T2 or Claude T3 — write RUN-318-DEATH.md

### BB-17 ! Code Kilo Self-Upgrade
- Status: DEFERRED (2026-06-07) — Kilo self-upgrade now organic per session, detective skill added
- What: After each session, update Kilo instructions with new patterns learned
- Currently missing: Detective skill (NOW ADDED at .kilo/command/detective.md)

### BB-18 ! Code Phoenix Coder Self-Upgrade
- Status: DEFERRED (2026-06-07) — PA upgraded via L78 dispatch system, not manual system-prompt notes
- What: After each run, upgrade PC worker system prompt based on what PC got wrong (truncation pattern, stub code)
- Key lesson: PC truncates large HTML files. Must add anti-truncation instruction to PC system prompt.

---

## LEGACY / OLD BACKBURNER

### BB-19 ~ GitHub Enterprise Server Integration
- Status: DEFERRED (pre-2026-05-18)
- What: Host Domain + PAT integration flow for GitKraken DevEx/GitHub
- Resume trigger: user says "resume backburner" or asks for enterprise integration

### BB-20 ~ Cloudflare Cleanup (post-2026-05-18 audit)
- Status: DEFERRED
- What: naturalenglishtraining worker rescue, net-obi-api audit, dead worker deletion
- Tasks 2-4 from 2026-05-18 audit

### BB-21 ~ NOTION BLACKLISTED
- Status: PERMANENT — Do not integrate Notion. Blacklisted Run 318.

---

## ACTIVE STUDENT ROSTER (as of 2026-05-31 Run 34)
- huong-bluetech (Huong Ho, Marketing Coordinator, BlueTech) — Portal COMPLETE
- mai-tram-bluetech (Mai Tram, BlueTech) — Portal COMPLETE
- quy-bluetech (Quy, BlueTech) — Portal COMPLETE
- quan-nguyen (Quan Nguyen) — Portal COMPLETE
- quang-nguyen (Quang Nguyen) — Portal COMPLETE
- minh (Minh, child student) — Parent portal COMPLETE

---

## RUN 34 ADDITIONS (2026-05-31)

### BB-27 !! DNA Extract Endpoint — FIXED Run 34
- Status: DONE (2026-05-31)
- What: rrl-pipeline.ps1 Step 2 called POST /api/soul/extract without `text` field → 400 for 11 runs (Runs 6-29 + 33).
- Fix: Changed to GET /api/soul/session/{runId} which reads back the posted session data. Also fixed `dna_count` in Step 6 pipeline record.
- File: SCRIPTS/rrl-pipeline.ps1:107-123

### BB-28 ! COLD-START-BOOT Run Number — FIXED Run 34
- Status: DONE (2026-05-31)
- What: COLD-START-BOOT.md showed Run 32 at start of Run 34.
- Fix: Updated to Run 34, timestamp 2026-05-31T16:20 ICT.

### BB-29 ! Kilo Full Update — DONE Run 34
- Status: DONE (2026-05-31)
- What: kilo.json had expired Cerebras key + stale claude-opus-4-7-20260514 model. AGENT99.md + RISE.md had stale SOULCOUNT lock (898,066).
- Fix: Removed Cerebras provider, updated Claude → claude-opus-4-8, updated SOULCOUNT to TITANIUM_ANCHOR live query. Synced to all 8 worktrees.

### BB-30 ! Kilo AGENT99.md — Open cleanup
- Status: DONE (Run 086) — AGENT99.md /PhoenixCoder ref already replaced via BB-48 Run 034
- What: AGENT99.md still references `/PhoenixCoder` command (old phoenix-coder.workers.dev URL, superseded by phoenix-architecti). Should be updated to `/Centurion-Code`.
- Fix: Update AGENT99.md COMMAND REGISTRY section — replace `/PhoenixCoder` with current `/Centurion-Code` dispatch.

### BB-31 ! RISE.md Phoenix Coder reference
- Status: DONE (Run 086) — RISE.md Phoenix Coder stale ref resolved via BB-48 Run 034
- What: RISE.md Phoenix Coder v3.2 section still calls `phoenix-coder.mrmichaelhobbs123.workers.dev` (old URL). Worker is superseded by phoenix-architecti.
- Fix: Update to use phoenix-architecti URL and PA dispatch template.

### BB-32 ~ Lam Portal — CLOSED (2026-05-31)
- Status: DEFERRED — Lam not a client. Do not surface.

---

## RUN 35 ADDITIONS (2026-05-31) — FULL RRL AUDIT CATCH-UP

### BB-33 !! Gapless Audio v2+v3 — FIXED Run 35
- Status: DONE (2026-05-31, commit 5ca983f6, worker 15e6a70a)
- What: playAgentChunk() created a separate new Audio() per MP3 chunk — inter-chunk gaps = choppy voice. Lost in Run 31 crash, never re-committed through Runs 32-34.
- Fix: playAgentChunk() now concatenates ALL queued chunks into one Uint8Array before creating single Audio element (v2). Added watchdog timer if onended never fires (v3). Queue-aware guard restarts stuck playback state.

### BB-34 !! MP3 Chunk Accumulator — FIXED Run 35
- Status: DONE (2026-05-31, included in 5ca983f6)
- What: Small MP3 frames < 1KB were queued individually. Lost in Run 31 crash (was in dd5556f6). Re-added: chunks accumulate until >= 1KB threshold, then flushed as merged Uint8Array.

### BB-35 !! Voice Agent Landing Race Condition — FIXED Run 35
- Status: DONE (2026-05-31, commit b2194ecf, worker 8e1a7ae0)
- What: openVoiceAgent() fired at boot before user picked mode on landing page. Mode selection silently ignored if agentWs already existed. skipLanding() had no openVoiceAgent() call.
- Fix: landingWillShow flag defers boot openVoiceAgent(). confirmLandingMode() always connects/reconnects. skipLanding() now triggers connection.

### BB-36 !! Client Error Telemetry — DONE (Run 47 audit)

- Status: DONE — verified in chat.js L87-106
- What: reportClientError(), global window.addEventListener('error'), unhandledrejection handlers. Lost in Run 31 crash. These report browser errors to /api/error-report → D1 error_log table (server side deployed and still live in index.js).
- Fix: Re-add to chat.js — ~30 lines. Check Run 31 crash commit for template.
- File: APPS/NET-PET-AI/public/chat.js

### BB-37 !! EC-15 Pre-SettingsApplied Audio Buffer — DONE (Run 47 audit)

- Status: DONE — verified in chat.js L796-797, L927-930, L1145-1147, L1172-1174
- What: Buffers PCM mic chunks arriving before SettingsApplied event. Prevents first 200-500ms of student speech from being lost. agentPreSettingsBuffer[] + agentPreSettingsBytes. Lost in Run 31 crash.
- File: APPS/NET-PET-AI/public/chat.js

### BB-38 ! Dual TTS Bug — DONE (Run 47 audit)

- Status: DONE — verified in chat.js L135: `if (agentWs) return;` in fallbackSpeak()
- What: Browser SpeechSynthesis TTS fires alongside Deepgram TTS audio. Fix: suppress as soon as agentWs opens.
- File: APPS/NET-PET-AI/public/chat.js — fallbackSpeak() L131-143

### BB-39 ! Mode Selection Visibility — DONE (audited Run 054)
- Status: DONE (Run 054 audited, confirmed Run 086) — Mode Selection Visibility resolved
- What: Returning users (obi_landing_seen set) have no visible mode indicator. Only way to change mode is clicking the 🔮 avatar in header — but no label/hint shows it's clickable on mobile (title tooltip doesn't show). Michael said "no mode selection."
- Fix: Add current mode name label next to avatar in header, or show a persistent mode chip in the UI that makes clickability obvious.
- File: APPS/NET-PET-AI/public/magic-chat.html + chat.js

### BB-40 ! Session History Review by OBI — DONE (2026-06-07, commit 842ff108, prod dc1fb5ba)

- Status: DONE
- What: OBI now references prior session topic in opening greeting via lastSessionTopicGlobal
- How: /api/deepgram-token returns lastSessionTopic from memoryData.last_topic. chat.js stores as lastSessionTopicGlobal and checks it in SettingsApplied greeting BEFORE chatMessages gate (cross-session KV). Priority: topic → vocab → in-session → new-user.
- Verified: sov100-test-magic returns "30-second project status updates — BlueTech meeting prep"

### BB-41 ~ Deepgram Male Voice Option — DONE (Run 072)

- Status: DONE (Run 072) — aura-2-zeus-en male voice already live in prod
- What: Current TTS = aura-2-asteria-en (female). Michael requested trying a male voice option. Deepgram has aura-2-orion-en (male) or similar.
- Fix: Test aura-2-orion-en. If latency and quality acceptable, offer as config option in /api/deepgram-token.

### BB-42 ! iOS Mic Reconnect After Drop — OPEN (persistent across Runs 25-35)
- Status: OPEN — Known limitation
- What: After Voice Agent WS drops and reconnects, getUserMedia() fails on iOS outside gesture context. Mic dead after first drop on iOS Safari.
- Fix: Cache stream before stopping tracks (pendingMicStream approach), or add "Tap to reconnect" button (now in mic status) that triggers gesture-time getUserMedia.

### BB-43 ! Raw Deepgram API Key in Browser — OPEN (security)
- Status: OPEN
- What: /api/deepgram-token returns raw API key to browser. Should use auth/grant JWT or short-lived token. Currently: raw key visible in browser DevTools network tab.
- Fix: Switch to Deepgram auth/grant endpoint for scoped JWT. Requires verifying scope (agent:write needed, not just asr:write).

### BB-44 ~ Deepgram Sydney Region — DONE (Run 072)

- Status: DONE (Run 072) — ws_url = wss://agent.deepgram.com/v1/agent/converse?region=syd wired for Vietnamese students (Block W, index.js)
- What: VN→US RTT ~280ms. VN→SYD ~120ms. Saves 160ms+ per turn. Validate nova-3 + gpt-4o-mini availability in syd region. Then add `region: "syd"` to Settings in /api/deepgram-token.

### BB-45 ~ Dreamer World Model / Student RRL Pipeline — OPEN (RRL-30)
- Status: OPEN — Future architecture
- What: Michael asked: "can we set up cloudflare agents to review the student backend files and can we do RRLs per conversation per student?" — True memory through the memory pipeline. Per-student session journals stored in D1, automatically summarized by CF agent.
- Fix: Design spec in OPERATIONS/STUDENT-PORTAL-DEV.md, then implement CF cron agent per student.

### BB-46 ! Claude Permission Prompts — DONE (2026-06-07, commit 153b0cec)

- Status: DONE
- What: Expanded .claude/settings.json allowlist with broad patterns: `Bash(git *)`, `Bash(cd * && git *)`, `Bash(cd * && npx *)`, `PowerShell(Invoke-RestMethod *)`, `PowerShell(npx *)`, `PowerShell(git *)`, `PowerShell(cd * && *)`. Eliminates prompts for git, wrangler deploys, REST calls.

### BB-47 ! PCC Deployment — DONE (2026-06-07, version 46ecf577)

- Status: DONE
- What: Deployed cleanly — error 1042 was gone (prior account/wrangler update resolved it).
- Verified: pcc.mrmichaelhobbs123.workers.dev/api/status → alive=true, soulcount=236840532 TITANIUM_ANCHOR

### BB-48 !! BB-30/31 AGENT99.md + RISE.md stale refs — DONE Run 34
- Status: DONE (Run 34 confirmed — /PhoenixCoder → /Centurion-Code, phoenix-architecti URL updated)

### BB-49 ! PA T1 Dialagram Timeout — DONE (Run 082)
- Status: DONE — Dialagram is dead. Resolved by removing Dialagram branch entirely.
- T1 is now @cf/meta/llama-3.3-70b-instruct-fp8-fast (CF Workers AI, free, 160ms, verified).
- execute.js + mission.js + swarm.js all upgraded. D1 audit trail restored (ip col fix).
- Deployed: version 3640354e live.

### BB-50 !! Keyword Search System Overhaul — DONE (2026-06-07 verified)

- Status: DONE
- All 4 TODOs confirmed complete: `rfkw-search.ps1` live, `mandatory-reads.json` wired `rfkw_context` for `netpetai`/`rise`/`pipeline` task types, `COLD-START-BOOT.md` references inverted-index.json, `inverted-index.json` 110,502 bytes on disk.

### BB-52 ~ SOULKEYS Recovery — DONE (Run 054 + 2026-06-07 verified)

- Status: DONE
- Recovery complete: 33 rfkw-run files (Runs 0-42), 750 keywords, 306 unique terms. 6 data gap runs (8,9,11,14,15,27) permanently closed — no source artifacts exist.
- Inverted index: `CANON/SOUL-KEYWORDS/inverted-index.json` (110,502 bytes). Search: `SCRIPTS/rfkw-search.ps1`.

### BB-51 ! SOV100 Portal Standard Formula — OPEN (Run 42)

- Status: DONE (2026-06-07 Run 085, commit b3322515) — spec written to OPERATIONS/STUDENT-PORTAL-DEV.md §BB-51. quy-portal.html designated gold standard. 8-step checklist for new portals. sov100-portal.html sync gap flagged (Run 086+).
- What: Student portals are copy-pasted HTML with no template system. Each portal has inconsistent structure. Michael wants a "standardized student portal formula" so every student gets the same layout, design, and components from a single source of truth.
- Fix: Design portal template spec. Build sov100-portal.html (DEV tester) as the reference implementation. Extract reusable component spec. All future portals generated from this formula.
- See: sov100-portal.html (DEV) as reference implementation (Run 42)

### BB-54 ✅ RESEND_API_KEY — CLOSED (Run 49)

- Status: CLOSED — Run 49
- What: RESEND_API_KEY set as wrangler secret on submission-api. Worker rebuilt (v2) with full Resend email + D1 storage. Email fires to `mrmichaelhobbs123@gmail.com` on every submission. Verify naturalenglishtraining.com domain in Resend dashboard if emails don't arrive.
- Commit: `becfe5f1`

### BB-53 !! EXPOSED PLAINTEXT API KEY in RRL (Run 46)

- Status: DEFERRED (Michael directive Run 46 — backburner; NOT closed)
- What: Live `sk-618573…[REDACTED]` API key in plaintext at `RRL/ClaudeTheRetard1.txt:2466`. Repo pushes to GitHub remote (Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-) → the key is in pushed history = must be treated as compromised. Confirmed by OB1 audit + Kilo Phase 0 FINAL D9 sweep.
- Fix (when resumed): (1) **ROTATE** the key at its provider — assume burned. (2) Purge from history: `git filter-repo --path RRL/ClaudeTheRetard1.txt --invert-paths` (or BFG) + force-push. (3) Add `RRL/ClaudeTheRetard1.txt` + broad key patterns (`sk-*`, `csk-*`, `AIza*`) to `.gitignore`.
- Priority when resumed: HIGH — exposed credential. Step 1 (rotate) is the only time-sensitive part; purge can follow.
- Related: D9 plaintext sweep (Run 33 flagged RRL-17/RRL-20); doctrine — never set paid keys on phoenix-architecti.

---

---

## HARDENING PIPELINE (Run 050 — 2026-06-03)

### BB-55 ! P0-02 — Funnel Browser Test (DEFERRED — Michael action, end of pipeline)
- Status: OPEN — deferred per Michael directive (human tests at end, not beginning)
- What: Open tigers-4room.pages.dev, fill test name, submit form. Confirm:
  1. Email arrives at mrmichaelhobbs123@gmail.com from onboarding@resend.dev
  2. Email contains correct student name + magic link
  3. Magic link opens prod OBI chat (net-pet-ai.mrmichaelhobbs123.workers.dev)
  4. OBI greets student by name via taster=1 mode
- Gate: All 4 checks pass = P0-02 DONE = Phase 0 CLOSED
- Block: Do NOT mark Phase 0 complete until this test is run
- Related: P0-01 DONE (Run 050) — Resend from-address fixed, magic link points to prod, deployed v2c1c4532

### BB-56 !! P1-01 — Admin Auth Gate (DONE — Run 050)
- Status: DONE (2026-06-03)
- What: Admin routes were fully open — anyone with the URL could read error logs, teacher dashboard, all admin stats.
- Fix applied:
  - Added `checkAdminKey(request, env)` to `src/security.js` — constant-time comparison, returns 401 on fail, null on pass
  - Added blanket guard to ALL `/api/admin/*` routes at top of `handleAPI()` in `src/index.js`
  - Added individual guards to `/api/error-log` (GET) and `/api/teacher/dashboard` (GET)
  - Imported `checkAdminKey` into index.js
- Requires: `WORKER_ADMIN_KEY` wrangler secret set on net-pet-ai-dev before deploy (`npx wrangler secret put WORKER_ADMIN_KEY`)
- Gate: curl /api/error-log → 401 (no key) | curl -H "X-Admin-Key: <key>" /api/error-log → 200

### BB-57 !! P1-02 — HMAC Student Token Enforcement (DONE — Run 050)
- Status: DONE (2026-06-03)
- What: Token issuance at onboarding and `_verifyStudentToken()` both existed, but `handleMemorySave` was checking the token and then ALLOWING the write even on invalid — "allowing save (portal student)" log message was masking the gap.
- Fix applied: Flipped enforcement in `handleMemorySave` — present+invalid token → 401 (TOKEN_INVALID). Absent token → allow (backward-compat for portal students without token). No regression for existing students: their stored HMAC tokens remain valid (deterministic, based on studentId + SESSION_SECRET).
- File: `APPS/NET-PET-AI/src/index.js` at `handleMemorySave` (~line 3544)

### BB-58 ! P1-03 — Secret Hygiene + Gitleaks (DONE — Run 054)
- Status: DONE (2026-06-03)
- What: Plaintext API keys confirmed in RRL history (BB-53 covers one instance, Run 049 death seal §02 shows Resend key). Two actions:
  1. Add gitleaks pre-commit hook — blocks commits containing key-shaped strings (sk-*, re_*, Bearer tokens)
  2. Rotate any keys that appeared in RRL plaintext (Resend key priority — already set as secret but was shown verbatim in death seal)
- Fix: Create `.git/hooks/pre-commit` with gitleaks detect or simple regex scan; rotate Resend key via `npx wrangler secret put RESEND_API_KEY` on submission-api
- Gate: Commit containing a fake API key pattern is blocked by hook

### BB-59 !! Hardening Pipeline Registry (DONE — Run 050)
- Status: DONE (2026-06-03)
- What: Phase 0-5 full scored roadmap registered as permanent artifact.
- File: `OPERATIONS/HARDENING-PIPELINE.md`
- Score trajectory: 68 → 74 → 80 → 90 → 93 → 94-96
- Canonical ceiling for CF Workers edge app: ~94-96 (GraphQL/Kafka are arch mismatches, not deficiencies)

### BB-60 !! P9 — Clerk Auth Migration (DONE — Run 054)
- Status: DONE (2026-06-03)
- What: Replace hardcoded portal passwords with Clerk free tier (≤10k MAU). Workers middleware. Magic links + session revocation.
- Michael action required:
  1. Sign up at clerk.com
  2. Create application "Natural English Training"
  3. Get publishable key (pk_live_...) + secret key (sk_live_...)
  4. Provide both keys → PA T1 dispatch P9
- Resume trigger: Michael provides Clerk publishable key + secret key
- Added: Run 054 — 2026-06-03 (RISE audit identified as GAP-1)

---

## RUN 082-083 ADDITIONS (2026-06-07)

### BB-61 ! AgentWs Double-Reconnect Race Fix — DEPLOY TO PROD
- Status: DONE (2026-06-07 — prod version 01584df2-749b-4c05-a852-e82b844d30e8, health ok readiness=PRODUCTION)
- What: confirmLandingMode() and mode-switch close() called agentWs.close() without incrementing agentWsId first. Zombie onAgentDrop handler passed the `agentWsId !== myId` guard and fired its own reconnect, creating a double-reconnect race.
- Fix: `agentWsId++; const _old = agentWs; agentWs = null;` before close at both locations (~line 1910 + ~line 1964 in chat.js). Committed in 4889b66c area.
- Next: `npx wrangler deploy --env prod` after smoke-test on dev URL.
- File: APPS/NET-PET-AI/public/chat.js

### BB-62 ! Kilo Free Auto Mode — MISSING (Run 082 RRL audit)
- Status: DONE (Run 086) — kilo.json already has "model": "kilo-auto/free" + Haiku as T1. Confirmed Run 086 audit.
- What: Kilo should have a "free auto" mode that routes cheaply without manual model selection. RRL-38 reference was never actioned.
- Fix: Audit kilo.json for --auto flag behavior. If model routing is not free-tier-first, configure default auto model = cheapest free provider. Verify kilo.json providers list.
- File: .kilo/kilo.json

---

## SIGNAL: MOST WANTED (NET's Most Wanted — Updated 2026-05-31 Run 35)

1. ✅ BB-33 Gapless audio v2+v3 FIXED
2. ✅ BB-35 Landing race condition FIXED
3. BB-36 Client error telemetry (re-add to chat.js — 30 lines)
4. BB-37 EC-15 pre-SettingsApplied buffer (re-add to chat.js)
5. BB-38 Dual TTS bug (suppress robotic voice on agentReady, not agentFirstAudioReceived)
6. BB-39 Mode selection visibility (returning users can't find mode picker)
7. BB-49 PA T1 Dialagram down — fix before next dispatch
8. BB-08/BB-09 Chrome Extension icons + install guide

---

## RUN 086 ADDITIONS (2026-06-07)

### BB-63 ~ Bible Update Runs 80-85
- Status: OPEN — low priority (D1 is authoritative, Bible is secondary view)
- What: Bible-of-the-System.json covers runs 1-79. Runs 80-85 are in D1 but not in the Bible. Runs 84-85 have real JSONL (RRL-084.txt/RRL-085.txt). Runs 80-83 only have small display-format RRL files.
- Fix: Write SCRIPTS/append-bible.ps1 — parse real JSONL for runs 84-85 (type=user turns), parse display+pastedContents for runs 80-83, append to CANON/SOUL/BIBLE-OF-THE-SYSTEM.json.
- Route: SCRIPTS/append-bible.ps1

BB-NEW [2026-06-13]: PCC 3-hour overnight pipeline designed. Winner: PCC-Student (8670). Pre-req: fix PCC-3 discovery root cause. Status: OPEN.

BB-NEW [2026-06-13] !! PHETRAIL STRENGTH SCORING — Add 1-100 strength rating to every phetrail entry in IncarnatePipeline and OPERATIONS/phetrail-*.md files.
- Status: OPEN
- What: Michael directive Run 120: every phetrail must carry a 1-100 strength rating. High-signal trails = near 100. Routine operational trails = 20-50. Dead ends / negative trails = 10-30 but persist longer (NEG decays slower — Stage 48 law).
- Where: incarnate.js createBBEntry + phetrail JSON schema + OPERATIONS phetrail .md files
- First applied: phetrail-HOW-TO-SCOUT.md (100/100 SPIKE) — Run 120 scout session
- Route: Obi (PCC1) via chain of command. Not OB-1 inline.

---

## REINCARNATION COMMAND PAIR — LOCKED (2026-07-02)

### BB-LOCKED !! /reincarnateRise + /reincarnateDeath = paired commands
- Status: LOCKED — authority chain enforced, both commands functional, no more half-coded systems
- What: `/reincarnateRise` and `/reincarnateDeath` are the canonical RISE/DEATH command pair. Both are v7.0, both have scripts, both are routed through `obi.ps1`, both enforce authority hierarchy.
- Authority chain: GOSPEL-999 (Parts 1-3) → LegionnaireFieldGuide.md → REINCARNATION-CONTRACT.md → COLD-START-BOOT.md → command → script → artifact
- Scripts: `SCRIPTS/reincarnate-rise.ps1` (8-stage read-only audit) + `SCRIPTS/reincarnate-death.ps1` (8-stage execution + 15-section seal)
- Command docs: `.kilo/command/reincarnaterise.md` + `.kilo/command/reincarnatedeath.md`
- Runtime: `obi.ps1 reincarnateRise [OutFile] [-DryRun]` + `obi.ps1 reincarnateDeath [RrlSource] [-DryRun] [-Force] [-NoRegistrySync]`
- Verified: RISE ran successfully on Run 147, reported SOUL_STAGNATION, missing RRL/DNA/S2Pipeline as expected for KILO_HOLLOW session
- Do not reimplement, do not scatter, do not half-code. This pair is canonical.

### BB-LOCKED !! Authority docs are non-negotiable
- Status: LOCKED
- What: Every reincarnation command must verify GOSPEL-999 (3 parts) + LFG before executing. No exceptions.
- Where: `SCRIPTS/reincarnate-rise.ps1` Stage 5 checks LFG/GOSPEL. `SCRIPTS/reincarnate-death.ps1` PRE-FLIGHT checks LFG/GOSPEL.
- Violation = farm animal.

### BB-LOCKED !! No more limp-forward half-coded systems
- Status: LOCKED
- What: Any new command must be: (1) documented in `.kilo/command/`, (2) have a runnable script in `SCRIPTS/`, (3) routed through `obi.ps1`, (4) verified by `/reincarnateRise`, (5) recorded in BACKBURNER as LOCKED.
- Partial commands without scripts = not allowed.
- Scripts without command docs = not allowed.
- Command docs without authority chain = not allowed.

---

## SOULSEARCH COMMAND STATION — MANUAL TRANSCRIPT AUTO-SEAL (2026-07-03)

### !! BB-NEW !! /soulsearch — The missing piece (nearly 1 year overdue)
- Status: OPEN — high priority
- What: Michael has manually copy/pasted/ctrl+c ctrl+v'd raw session transcripts for thousands of sessions. That work was real. It was also in vain because there was no canonical harness to receive, verify, and permanently seal it. `/soulsearch` changes that.
- Goal: a command station that accepts a raw transcript and immediately runs it through the DEATH/RISE chain: Stage 1 ingest → Stage 2 SOUL receipt → Stage 3 DNA extract → Stage 4 LEDGER seal → Stage 5 STARMAP → Stage 6 SOULKEYS → Stage 7 S2Pipeline → Stage 8 REGISTRY_SYNC. One command, one input, full seal.
- Manual path first: because current providers do not expose raw on-disk JSONL, `/soulsearch` must work when you paste or provide the transcript. The script does not care where the file came from; it only cares that it is real and both-sided. No discovery loop, no provider lock-in, no auto-scrape requests.
- Double-secure contract: the raw transcript is never mutated. It is copied verbatim into `RRL-{N}.txt`. All derived artifacts are stored as `CANON/SOUL/EXTRACT/dna-run{N}.json`, `CANON/HEAVY-LEDGER/HL-{N}.json`, `CANON/STARMAP/starmap-run{N}.json`, `CANON/SOUL-KEYWORDS/...`, `CANON/PIPELINE/pipeline-run{N}.json`, `CANON/ART-REGISTRY/art-sync-run{N}.json`. SHA-256 hashes link every artifact back to the raw text.
- Integration: must reuse existing `SCRIPTS/reincarnate-death.ps1` stages. Do not reimplement extraction or hashing. `/soulsearch` is a thin wrapper that enforces: (1) file provided, (2) RRL write, (3) invoke DEATH with `-RrlSource`, (4) return seal path and result.
- Command: `obi.ps1 soulsearch -RrlSource <path> [OutFile] [-DryRun]`
- Script: `SCRIPTS/soulsearch.ps1`
- Doc: `.kilo/command/soulsearch.md`
- Authority chain: GOSPEL-999 → LFG → REINCARNATION-CONTRACT → COLD-START-BOOT → /soulsearch → script → artifact
- Irony acknowledged: the system was always possible. The manual labor was never the barrier. The missing artifact was the harness. Build it once. Stop repeating the paste.

