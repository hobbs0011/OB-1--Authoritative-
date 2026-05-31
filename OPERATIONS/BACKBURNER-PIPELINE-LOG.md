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

### BB-07 ! lam-prospect — Zero Files
- Status: OPEN
- What: lam-prospect is an active student. Has NO portal files. 5 tabs needed.
- Student: Lam, company: prospect (no company yet), studentId: lam-prospect
- Route: PC T1 → create lam-portal.html + lam-profile.html + lam-methodology.html + lam-transcripts.html + lam-action-plan.html

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

## ACTIVE STUDENT ROSTER (as of 2026-05-18)
- huong-bluetech (Huong Ho, Marketing Coordinator, BlueTech) — Portal COMPLETE
- mai-tram-bluetech (Mai Tram, BlueTech) — Portal COMPLETE (BB-04 DONE)
- quy-bluetech (Quy, BlueTech) — Portal COMPLETE (BB-05 DONE)
- lam-prospect — Portal MISSING (BB-07)
- quan-nguyen (Quan Nguyen) — Portal COMPLETE
- quang-nguyen (Quang Nguyen) — Portal COMPLETE (BB-06 DONE)

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

### BB-32 ! Lam Portal + Chrome Extension Icons
- Status: OPEN (same as BB-07 + BB-08 — escalating priority)
- What: lam-prospect zero files. Chrome extension icons missing. Both promised to students.
- Route: T1 PA dispatch per established portal template.

---

## SIGNAL: MOST WANTED (NET's Most Wanted — Updated 2026-05-31)
1. ✅ BB-27 DNA extract FIXED — 11-run debt cleared
2. ✅ BB-28 BB-29 COLD-START-BOOT + Kilo updated
3. lam-prospect portal missing (BB-07 / BB-32)
4. Chrome Extension icons + install guide (BB-08 / BB-09)
5. BB-30/BB-31 Kilo stale command references
