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
- Status: OPEN
- What: manifest.json references icons but no icons/ directory exists in chrome-extension/
- Fix: Create icons/icon48.png + icons/icon128.png (OBI purple logo, 48x48 and 128x128)
- Route: PC T1 or manual asset

### BB-09 ~ Chrome Extension — Install Guide
- Status: OPEN
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
- Status: IN-PROGRESS (soul events wiring deployed, cron pending)
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
- Status: OPEN
- What: 8+ modified files + chrome-extension/ untracked. All local. Nothing deployed.
- Files: src/index.js, public/chat.js, public/huong-portal.html, public/quan-portal.html, public/quang-portal.html, wrangler.toml, .kilo/command/detective.md, chrome-extension/*
- Fix: git add → git commit → wrangler deploy (after BB-01/02/03)

---

## ARCHITECTURE / COLD START

### BB-15 !! COLD-START-BOOT.md is STALE
- Status: OPEN
- What: References D:\OB-1 (old path — real path is D:\OB-1-CANONICAL). Wrong run number (Run 312). Missing NOTION BLACKLISTED status.
- Fix: Rewrite with correct paths, current run (post-318), active student roster (6 students), NOTION=BLACKLISTED

### BB-16 ! Write Run 318 / Session Artifact to CANON/REINCARNATION/
- Status: OPEN
- What: Standard reincarnation death artifact for this session. Captures what was built, what's pending, what was learned.
- Route: Kilo T2 or Claude T3 — write RUN-318-DEATH.md

### BB-17 ! Code Kilo Self-Upgrade
- Status: OPEN
- What: After each session, update Kilo instructions with new patterns learned
- Currently missing: Detective skill (NOW ADDED at .kilo/command/detective.md)

### BB-18 ! Code Phoenix Coder Self-Upgrade
- Status: OPEN
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
- Status: OPEN
- What: AGENT99.md still references `/PhoenixCoder` command (old phoenix-coder.workers.dev URL, superseded by phoenix-architecti). Should be updated to `/Centurion-Code`.
- Fix: Update AGENT99.md COMMAND REGISTRY section — replace `/PhoenixCoder` with current `/Centurion-Code` dispatch.

### BB-31 ! RISE.md Phoenix Coder reference
- Status: OPEN
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

### BB-39 ! Mode Selection Visibility — OPEN (returning users)
- Status: OPEN
- What: Returning users (obi_landing_seen set) have no visible mode indicator. Only way to change mode is clicking the 🔮 avatar in header — but no label/hint shows it's clickable on mobile (title tooltip doesn't show). Michael said "no mode selection."
- Fix: Add current mode name label next to avatar in header, or show a persistent mode chip in the UI that makes clickability obvious.
- File: APPS/NET-PET-AI/public/magic-chat.html + chat.js

### BB-40 ! Session History Review by OBI — OPEN (RRL-29: "why isnt obi reviewing last sessions?")
- Status: OPEN
- What: OBI doesn't recall or reference prior sessions in its opening. context.messages sends last 6 turns but OBI doesn't explicitly acknowledge or build on prior session themes.
- Fix: On SettingsApplied, send InjectAgentMessage with a brief session continuity reference: "Last time we talked about [last_topic]. How are you feeling about that today?"
- File: APPS/NET-PET-AI/public/chat.js (post-SettingsApplied handler) + /api/deepgram-token (include session history in Settings context.messages)

### BB-41 ~ Deepgram Male Voice Option — OPEN (RRL-29: "try a male agentic voice")
- Status: OPEN
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

### BB-44 ~ Deepgram Sydney Region — OPEN
- Status: OPEN
- What: VN→US RTT ~280ms. VN→SYD ~120ms. Saves 160ms+ per turn. Validate nova-3 + gpt-4o-mini availability in syd region. Then add `region: "syd"` to Settings in /api/deepgram-token.

### BB-45 ~ Dreamer World Model / Student RRL Pipeline — OPEN (RRL-30)
- Status: OPEN — Future architecture
- What: Michael asked: "can we set up cloudflare agents to review the student backend files and can we do RRLs per conversation per student?" — True memory through the memory pipeline. Per-student session journals stored in D1, automatically summarized by CF agent.
- Fix: Design spec in OPERATIONS/STUDENT-PORTAL-DEV.md, then implement CF cron agent per student.

### BB-46 ! Claude Permission Prompts — OPEN (RRL-32: "can you set it so I dont have to click yes every 10 seconds")
- Status: OPEN
- What: Michael is constantly approving basic tool permissions. Settings.json allowlist needs expansion for common read-only tools.
- Fix: Run /fewer-permission-prompts skill or add common PowerShell/Bash/MCP tools to .claude/settings.json allowlist.

### BB-47 ! PCC Deployment — OPEN (error 1042 persists)
- Status: OPEN
- What: Empire dashboard (APPS/PCC/) fails to deploy — error 1042 (worker not found on CF account).
- Fix: Check CF account for existing worker name conflict, or redeploy with correct account ID. Run: `cd APPS/PCC && npx wrangler deploy`

### BB-48 !! BB-30/31 AGENT99.md + RISE.md stale refs — DONE Run 34
- Status: DONE (Run 34 confirmed — /PhoenixCoder → /Centurion-Code, phoenix-architecti URL updated)

### BB-49 ! PA T1 Dialagram Timeout — OPEN (Run 35)
- Status: OPEN — BLOCKING all PA T1 dispatches
- What: Dialagram API consistently timing out at 30s. Even bare minimum request fails. PA status shows T1 "✓" (key is set) but Dialagram endpoint not responding.
- Fix: Check Dialagram platform status. Debug with direct curl to dialagram.me/router/v1/chat/completions. If persistent outage, evaluate switching T1 to an alternative provider (Groq Qwen? OpenRouter?) until Dialagram recovers.

### BB-50 !! Keyword Search System Overhaul — OPEN (Run 42)

- Status: OPEN
- What: rfkw-run*.txt files ARE being generated each run (CANON/SOUL-KEYWORDS/) but are NOT being used at boot or during research. Current format is too thin (keyword | run# | HL-### | weight=1) to enable real search. OB1 reads raw RRL files sequentially instead of using keyword index. This is the failure mode Michael called out: "why cant you search through keywords?? why do I have keywords if they dont work."
- Fix required:
  1. Upgrade rfkw format: add categories (portal, audio, auth, phonics, etc.), weight by Michael verbatim frequency, cross-link to run/HL
  2. Build keyword search script (SCRIPTS/rfkw-search.ps1): input = query string, output = ranked run numbers + excerpts
  3. Wire into context-bundle.ps1: on rise/research tasks, auto-search rfkw before reading raw RRL files
  4. COLD-START-BOOT Step 2: add "search rfkw for topic keywords BEFORE reading RRL files" as standard protocol
- Priority: HIGH — keyword system is foundational to RRL context retrieval efficiency

### BB-52 ~ SOULKEYS Recovery — DATA_GAP (Run 43)

- Status: OPEN
- What: Run 43 recovery produced 33 rfkw files from 43-run target. 6 runs missing source artifacts (no RRL/deathseal/pipeline found): 8, 9, 11, 14, 15, 27. Need to either recover from alternate source or tag as permanent gap.
- Fix: Search alternate RRL variants (RRL-8A, RRL-9b, etc.) + LEDGER cross-reference. If no source found, mark as permanent GAP and document.

- Status: RECOVERY DONE, INTEGRATION IN PROGRESS
- **Recovery Complete:**
  - 33 rfkw-run files rebuilt (Runs 0-42, with 6 data gaps: 8, 9, 11, 14, 15, 27)
  - 750 keyword lines total, 306 unique terms
  - Format: `weight | category | term` (categories: portal, audio, auth, phonics, pipeline, system, student, revenue, security, chrome, mobile, curriculum, core)
  - Inverted index rebuilt: CANON/SOUL-KEYWORDS/inverted-index.json
  - Manifest: CANON/SOUL-KEYWORDS/soulkeys-manifest.json
  - Search script: SCRIPTS/rfkw-search.ps1
- Fix required (complete checklist):
  1. `rfkw-search.ps1` added (`SCRIPTS/rfkw-search.ps1`). Query = ranked runs + categories. Run-block search available.
  2. **TODO: Rewire Context-Bundle.** `context-bundle.ps1` already loaded, but needs a `rfkw_overview` token block per run so on `rise`/`pipeline`/`netpetai` bundle types the query hits the keyword index before raw RRL.
  3. **TODO: Cold Start Boot metadata.** `COLD-START-BOOT` currently says KEYWORD exists by count; update to assert `searchable inverted-index.json exists`.
  4. Verify Ledger Manifest (`CANON/HEAVY-LEDGER/soulkeys-manifest.json` + `inverted-index.json`) is copied into build/deploy pipeline if cold-start is used on a fresh system.
- Priority: HIGH — keyword system is foundational to RRL context retrieval efficiency

### BB-51 ! SOV100 Portal Standard Formula — OPEN (Run 42)

- Status: OPEN
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

## SIGNAL: MOST WANTED (NET's Most Wanted — Updated 2026-05-31 Run 35)
1. ✅ BB-33 Gapless audio v2+v3 FIXED
2. ✅ BB-35 Landing race condition FIXED
3. BB-36 Client error telemetry (re-add to chat.js — 30 lines)
4. BB-37 EC-15 pre-SettingsApplied buffer (re-add to chat.js)
5. BB-38 Dual TTS bug (suppress robotic voice on agentReady, not agentFirstAudioReceived)
6. BB-39 Mode selection visibility (returning users can't find mode picker)
7. BB-49 PA T1 Dialagram down — fix before next dispatch
8. BB-08/BB-09 Chrome Extension icons + install guide
