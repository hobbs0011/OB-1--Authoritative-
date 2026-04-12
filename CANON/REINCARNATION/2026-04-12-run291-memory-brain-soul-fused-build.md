# REINCARNATION — Run 291: Memory Brain Soul-Fused Build

**Date:** 2026-04-12 04:24 ICT
**Agent:** OB1 Ne0 (Agent-99)
**Trigger:** /ReincarnateDEATH-MERGE MERGE1
**Signal Density:** 7/10
**Theme:** Building the missing behavioral brain — weakness tracking, re-entry protocol, reward signals — into the live OBI Worker
**State Coming In:** Run 290 had captured Magic Chat soul architecture + flagged catastrophic `16c9598` revert. Worker was functional but lacked behavioral intelligence layer.
**Prior HEAD:** `0541138`

---

## MERGE SESSION
- **Total Chats**: UNKNOWN
- **This Merge**: MERGE1 of UNKNOWN
- **Merge Status**: SEALED — MERGE2 appended 2026-04-12 ~18:00 ICT

---

## 1. HEADER

| Field | Value |
|-------|-------|
| Session Tag | memory-brain-soul-fused-build |
| DateTime | 2026-04-12 04:24 ICT |
| Signal Density | 7/10 |
| Theme | Building OBI's behavioral brain: weakness tracking, re-entry detection, reward signals, adaptive prompt injection |
| State Coming In | Run 290 death-merge complete. Worker live but missing behavioral intelligence. User pasted massive FUSED A+B+C System Bible demanding CODE/USERS/DECK. |

---

## 2. RAW QUOTES

| # | Quote | Tag |
|---|-------|-----|
| Q1 | "GOGOGOGOG" | 🟢 green — full send, execute everything |
| Q2 | "hello?" | 🟡 yellow — impatience, wants immediate action not theory |
| Q3 | [User pasted ~5000-word FUSED A+B+C System Bible covering Soul DNA Layer, Heavy Ledger Layer, Legal/IP structure, full system design, business model] | 🟢 green — comprehensive system bible formalization |

> Note: User's primary input was the massive FUSED document — a formalized system bible covering soul DNA as identity memory anchor, heavy ledger as SHA-256 verification, legal structure (Vietnam tech company), and full architecture spec. The "GOGOGOGOG" was the execution command.

---

## 3. DECISIONS

| # | Decision | Impact | Canon Affected | Status |
|---|----------|--------|----------------|--------|
| D1 | Build memory-brain.js as standalone module (not refactor monolith) | Medium — keeps deployment stable while adding new capabilities | NET-PET-AI architecture | IMPLEMENTED |
| D2 | Weakness extraction via regex patterns, not LLM | Low — MVP quality, good enough for Phase 1, fast and cheap | memory-brain.js design | IMPLEMENTED |
| D3 | 13 weakness patterns across grammar/pronunciation/vocabulary | Medium — covers core Vietnamese-English error patterns | memory-brain.js | IMPLEMENTED |
| D4 | Re-entry protocol with 3-day and 14-day thresholds | Medium — behavioral: welcome-back warmth calibrated to absence duration | memory-brain.js | IMPLEMENTED |
| D5 | Reward signals woven into OBI's natural response (not UI badges) | Medium — intrinsic motivation via conversational acknowledgment | memory-brain.js | IMPLEMENTED |
| D6 | ProfileDO gets weak_points table (not a new DO) | Low — keeps architecture simple, no new migrations needed | ProfileDO schema | IMPLEMENTED |
| D7 | Weakness injection into system prompt PRE-DeepSeek call | High — OBI now has awareness of student's known weaknesses before responding | handleChat flow | IMPLEMENTED |
| D8 | Post-chat weakness extraction from OBI's reply | Medium — automatic learning loop: OBI corrects → weakness stored → next chat targets it | handleChat flow | IMPLEMENTED |
| D9 | /api/progress endpoint for progress visibility | Medium — client can now surface improvement metrics | Router | IMPLEMENTED |

---

## 4. CORRECTIONS

| # | What Broke | Root Cause | Fix Applied | Instruction Update? |
|---|-----------|------------|-------------|---------------------|
| C1 | handleProgress function referenced in route but never defined | Multi-step build interrupted by context window exhaustion in prior session; route added but function wasn't | Added handleProgress function that loads ProfileDO weak points + PetDO state + buildRewardSignals | No |
| C2 | ProfileDO missing weak_points table and /weakness/get, /weakness/update endpoints | Same — partial build from prior session | Added CREATE TABLE, GET/POST endpoints in ProfileDO fetch handler | No |
| C3 | System prompt injection referenced buildWeaknessPrompt etc. but had no import | Import added in this session's first multi_replace | No |

---

## 5. NEW PRINCIPLES

| # | Principle | Source |
|---|-----------|--------|
| P1 | Soul DNA = identity memory anchor. Never for computation. Only for restoring context, preventing drift, training prompts. | FUSED A+B+C System Bible |
| P2 | Heavy Ledger = machine verification layer. Tamper detection, immutability, audit trail. SHA-256 hash chains. | FUSED A+B+C System Bible |
| P3 | Soul + Ledger are TWO DISTINCT LAYERS: WHY (Soul) vs WHAT HAPPENED (Ledger) vs WHAT NEXT (System) | FUSED A+B+C System Bible |
| P4 | Weakness extraction should be cheap and fast (regex), not expensive (LLM). Upgrade path exists but MVP first. | Architecture decision |
| P5 | Re-entry warmth is calibrated to absence duration — no guilt, no reset, continue where they left off | Mouse → Tiger doctrine |

---

## 6. EMOTIONAL SIGNAL

- **Energy level:** HIGH — "GOGOGOGOG" is full execution mode
- **Frustration markers:** "hello?" indicates impatience with prior session's death mid-build
- **What Michael needs:** CODE. Not docs. Not theory. Working features that move OBI from architecture to behavioral intelligence. The FUSED bible was the formalization; the code is the execution.

---

## 7. OPEN QUESTIONS

| # | Question | Context |
|---|----------|---------|
| Q1 | How many total chats running this session? | MERGE1 doesn't know — flagged as UNKNOWN |
| Q2 | Should OBI-SYSTEM-MAP.md be updated with FUSED Soul+Ledger content? | Was on the todo list but deprioritized vs code |
| Q3 | When to upgrade weakness extraction from regex to LLM-based? | Phase 2 decision — regex is good enough for now |

---

## 8. UNFINISHED ACTIONS

| # | Action | Handoff Detail | Priority |
|---|--------|---------------|----------|
| U1 | Update OBI-SYSTEM-MAP.md with FUSED Soul+Ledger formal definitions | Add Soul DNA Layer, Heavy Ledger Layer, Soul+Ledger interaction protocol, Legal/IP structure as new sections | MEDIUM |
| U2 | Client-side progress display | Wire /api/progress into chat.js or index.html — show weakness improvement % and streak signals in UI | MEDIUM |
| U3 | Weakness improvement_pct calculation | Currently always 0.0 — need a decay/improvement algorithm that compares error frequency over time windows | LOW |
| U4 | Adaptive difficulty escalation | Memory brain detects weakness patterns but doesn't yet escalate difficulty — OBI still uses flat 0.85 temperature | LOW |
| U5 | Deploy to production | Worker compiles clean + dry-run passes. Needs `wrangler deploy` to push live. | HIGH |
| U6 | Revert `16c9598` in extension.js | Still open from Run 290 — student-facing OBI chat destroyed in VS Code extension | HIGH (from Run 290) |

---

## 9. SYSTEM DESIGN

### New Module: `src/memory-brain.js`
- **Purpose:** Behavioral intelligence layer between ProfileDO data and OBI's system prompt
- **Exports:** `extractWeaknesses()`, `buildWeaknessPrompt()`, `buildReEntryPrompt()`, `buildRewardSignals()`, `buildRewardPrompt()`
- **Pattern:** 13 regex-based weakness detectors across grammar (7), pronunciation (4), vocabulary (2)
- **Re-entry thresholds:** 3-day (light welcome), 14-day (full re-engagement protocol)
- **Reward system:** Streak-based + improvement-based signals injected into system prompt for OBI to naturally mention

### ProfileDO Schema Addition
- **Table:** `weak_points` — `specific TEXT UNIQUE, category TEXT, error_count INTEGER, last_seen INTEGER, first_seen INTEGER, improvement_pct REAL`
- **Endpoints:** `/weakness/get` (GET), `/weakness/update` (POST), `/progress` (GET)

### handleChat Flow Changes
- **PRE-DeepSeek:** Load weak points from ProfileDO → load PetDO state → build weakness/re-entry/reward prompts → inject into system prompt
- **POST-DeepSeek:** Extract weaknesses from OBI's reply → POST to ProfileDO `/weakness/update`
- **Response enriched:** Added `weaknessLoaded` and `reEntryMode` flags to chat response JSON

### New Route
- **`/api/progress` GET** → `handleProgress()` → loads ProfileDO progress + PetDO state + builds reward signals

### Architecture Principle (from FUSED Bible)
```
Soul DNA Layer         → identity memory anchor (verbatim capture, never sanitized)
Heavy Ledger Layer     → machine verification (SHA-256 hash chains, append-only)
Memory Brain Layer     → behavioral intelligence (weakness → prompt → correction → learning loop)
```

---

## 10. ARTIFACTS CREATED

| # | File | Type | Status |
|---|------|------|--------|
| A1 | `APPS/NET-PET-AI/src/memory-brain.js` | NEW — ES module | Created (108 lines) |
| A2 | `APPS/NET-PET-AI/src/index.js` | MODIFIED — Worker entry | +70 lines: import, weakness injection, post-chat extraction, ProfileDO table+endpoints, handleProgress, enriched response |
| A3 | `CANON/REINCARNATION/2026-04-12-run291-memory-brain-soul-fused-build.md` | NEW — Reincarnation extract | This file |

---

## 11. STATE SNAPSHOT

| Tracker | Position |
|---------|----------|
| SSM | L77 + 8 queued |
| Heavy Ledger | HL-132 |
| BIBLE | CH25 + A7 |
| A6 SDNAD | 71+ signals, 16 blocks, chain head L0248 |
| Reincarnation | Run 291 (this death) |
| HEAD SHA | `27c3e32` |
| Dirty Tree | `M APPS/NET-PET-AI/src/index.js`, `?? src/memory-brain.js`, `?? OBI-SYSTEM-MAP.md`, `?? ARCHITECTURE-DIAGRAMS.md`, `?? SCRIPTS/mcp-*.ps1`, `?? APPS/EducationSystemsDevelopment/` |
| Worker Version | v1.4.0 — syntax clean, dry-run pass |
| Bundle Size | 87.94 KiB / gzip 19.54 KiB |
| Env Vars | DEEPSEEK_API_KEY, DEEPGRAM_API_KEY (via wrangler secrets) |
| MCP Status | Cloudflare configured, GitHub configured, Notion configured (pages not shared), Playwright/Chrome available |

---

## 12. FINGERPRINT

| Field | Value |
|-------|-------|
| Agent ID | OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6 |
| Run Number | 291 |
| Commit SHA | `27c3e32` |
| Platform Death Test | PASS — pushed to origin + ob1 |
| Pheromone Score | 38/50 |

---

# MERGE2 — First-100-Users Enforcement Engine

**Agent**: OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6
**Chat Context**: User pasted complete "First 100 Users Plan" for OBI — positioning, pricing, school sales, technical architecture, kill chain. This chat executed the enforcement layer: Teacher Mode prompt, yesterday-failures re-test engine, weekly viral report, voice input on assessment funnel.
**Merge Time**: 2026-04-12 ~18:00 ICT

---

## 1. HEADER

| Field | Value |
|-------|-------|
| Session Tag | first-100-users-enforcement-engine |
| DateTime | 2026-04-12 ~15:00-18:00 ICT |
| Signal Density | 8/10 |
| Theme | Closing gap between OBI strategic plan and deployable code — enforcement loops, viral reports, voice input |
| State Coming In | Run 291 MERGE1 had built behavioral intelligence layer (memory-brain.js). This chat built the enforcement layer on top — machinery that forces daily confrontation with mistakes, generates social-pressure reports, captures voice input in assessment funnel. User pasted ~3000-word strategic plan demanding CODE THAT SHIPS. |

---

## 2. RAW QUOTES

| # | Quote | Tag |
|---|-------|-----|
| Q1 | "A system that shows you exactly why your English is stuck — and forces daily speaking improvement" | green — product thesis, core positioning |
| Q2 | "You MUST make users confront their repeated mistakes again tomorrow" | red — hard enforcement requirement, non-negotiable |
| Q3 | "Mouse → Tiger: Start with permission and confidence, build toward mastery" | green — teaching philosophy anchor |
| Q4 | "Every week, every student gets a progress report. Sent to: Parent, Teacher, Employer. This is the VIRAL LOOP. Not marketing. Social pressure." | green — the weekly report is the growth engine |
| Q5 | "200k VND/month ($8). Vietnamese market. Boba tea money." | yellow — pricing anchor for Tiger tier |
| Q6 | "The assessment IS the product demo. Free speaking test → diagnosis → 'we can fix this' → paid daily practice." | green — funnel architecture |
| Q7 | "CORRECTION → WHY → PRACTICE → RETEST. Every time. No exceptions." | red — 4-step enforcement loop baked into OBI v3 prompt |

---

## 3. DECISIONS

| # | Decision | Impact | Canon Affected | Status |
|---|----------|--------|----------------|--------|
| D1 | Upgrade OBI_SYSTEM from v2 (Continuity Engine) to v3 (Teacher Mode) with strict 4-step output format | HIGH — every OBI response now: CORRECTION→WHY→DRILL→MICRO TEST | OBI_SYSTEM prompt in index.js | IMPLEMENTED |
| D2 | Rewrite handleDailyTask with yesterday-failures re-test engine | HIGH — students must confront last 48h failures before new practice | handleDailyTask in index.js | IMPLEMENTED |
| D3 | Build Weekly Progress Report endpoint + HTML generator (the viral loop) | HIGH — creates external social pressure via parent/teacher/employer reports | New route + 2 functions in index.js | IMPLEMENTED |
| D4 | Add voice input to assess.html via Web Speech API | MEDIUM | public/assess.html | LOST — file absent from disk at commit time |
| D5 | Version bump 1.5.0 → 1.6.0 | LOW | index.js VERSION constant | IMPLEMENTED |
| D6 | Weekly report follows Gospel 444 aesthetic (void/#a855f7/#f59e0b/no blue) | MEDIUM | buildWeeklyReportHTML | IMPLEMENTED |

DEDUP NOTE vs MERGE1: MERGE1 built memory-brain.js (behavioral intelligence). MERGE2 built the enforcement layer that USES that intelligence. No overlapping decisions.

---

## 4. CORRECTIONS

| # | What Broke | Root Cause | Fix Applied | Instruction Update? |
|---|-----------|------------|-------------|---------------------|
| C1 | OBI_SYSTEM v2 was passive — allowed drift without correction pressure | Original prompt designed for conversational warmth, not enforcement | v3 Teacher Mode: strict 4-step format, priority ranking, Vietnamese translation in WHY | No |
| C2 | handleDailyTask returned generic practice without yesterday's failures | No mechanism to pull correction history from LedgerDO and feed back into daily tasks | Rewrote handler: pulls last 48h from LedgerDO, builds failure re-test drills, mustRetestFirst flag | No |
| C3 | assess.html editing failed silently — voice input changes applied to file that didn't exist | File showed as ?? in git status but Test-Path returned False — likely cleaned between status check and edit | Documented as LOST — assess.html must be built as new file next session | Yes — verify file exists before editing |

DEDUP NOTE vs MERGE1: MERGE1 C1-C3 were missing functions/imports from interrupted builds. MERGE2 C1-C3 are behavioral and filesystem gaps. No overlap.

---

## 5. NEW PRINCIPLES

| # | Principle | Source |
|---|-----------|--------|
| P1 | The enforcement loop IS the product — not the chat. CORRECTION→WHY→DRILL→RETEST is the atomic unit of improvement. | First 100 Users Plan |
| P2 | Weekly reports are a growth engine, not informational. The receiver (parent/teacher/employer) creates the social pressure that drives retention. | First 100 Users Plan Q4 |
| P3 | mustRetestFirst — yesterday's failures MUST be confronted before new practice. No escape. No skip. | Implementation D2 |
| P4 | Always verify file exists on disk before editing — git status ?? does not guarantee physical file presence. | C3 lesson |

DEDUP NOTE vs MERGE1: MERGE1 principles were Soul DNA layers and architectural separation. MERGE2 principles are behavioral enforcement mechanics. No overlap.

---

## 6. EMOTIONAL SIGNAL

- **Energy level:** HIGH — "GOGOGOGOG" and "GGGOGOGO" — full execution mode
- **Frustration markers:** None — clean execution session. Terminal Ctrl-C at commit phase created minor friction.
- **What Michael needs:** CODE THAT ENFORCES. Weekly report creates social pressure. Daily re-test makes escape impossible.

---

## 7. OPEN QUESTIONS

| # | Question | Context |
|---|----------|---------|
| Q1 | How many total chats running this session? | MERGE2 still UNKNOWN |
| Q2 | Should weekly report auto-send via Zalo to parents? | Currently a URL endpoint — distribution not wired |
| Q3 | Is 200k VND pricing locked? | In strategic plan but not in any code/UI yet |

---

## 8. UNFINISHED ACTIONS

| # | Action | Handoff Detail | Priority |
|---|--------|---------------|----------|
| U1 | Deploy to production | Worker v1.6.0 compiles clean, dry-run passes (268KB, 22 assets, 5 DOs) | HIGH |
| U2 | Build assess.html from scratch | File does not exist on disk. Needs: 3-step flow (contact → analysis → results) + voice input via Web Speech API + Gospel 444 styling | HIGH |
| U3 | Revert 16c9598 in extension.js | Still open from Run 290 — student-facing OBI chat destroyed | HIGH (carried from MERGE1 U6) |
| U4 | Wire weekly report into Zalo loop | Auto-send to parent/teacher on Sunday via Zalo OA with report URL | MEDIUM |
| U5 | Build frontend daily-task UI | /api/daily returns structured JSON with enforcement.mustRetestFirst flag — needs UI to consume it | MEDIUM |
| U6 | Pricing tier implementation | Mouse (free) / Cub (200k VND) / Tiger (500k VND) / Pride (2M VND) — no paywall code yet | MEDIUM |

DEDUP NOTE vs MERGE1: MERGE1 U5 (deploy) = MERGE2 U1 (deploy). MERGE1 U6 (revert 16c9598) = MERGE2 U3. MERGE1 U3 (weakness_pct) still open — not addressed this chat.

---

## 9. SYSTEM DESIGN

### OBI_SYSTEM v3 — Teacher Mode Behavioral Enforcement Engine
- **Output format**: Every response — CORRECTION → WHY → DRILL → MICRO TEST
- **Priority**: Pronunciation > Grammar > Vocabulary (Vietnamese-specific)
- **Vietnamese integration**: WHY explanations include Vietnamese translation of the rule
- **Tone**: Direct + encouraging, never passive, never "that's okay"

### Yesterday-Failures Re-test Engine (handleDailyTask)
- **Data source**: LedgerDO /history?limit=100&eventType=correction — last 48h window
- **Output**: { enforcement: { mustRetestFirst, retestDrills[], recurringWeaknesses[] }, todaysDrills[], metrics: { streak, weakSounds, grammarFailures, speakingTime } }

### Weekly Progress Report (handleWeeklyReport + buildWeeklyReportHTML)
- **Route**: GET /api/report/weekly?studentId=xxx
- **Data**: ProfileDO (weak_points) + PetDO (streak/tigerScore) + LedgerDO (corrections + drill_attempts, 7-day + 14-day windows)
- **Output**: Full styled HTML (Gospel 444), printable, shareable URL
- **Design**: Social pressure generator — mode badge, consistency summary, top 5 repeated mistakes, CTA

### GHOST ARTIFACT: assess.html Voice Input
- **Intended**: Mic button (🎤), Web Speech API continuous mode, interim results, graceful fallback
- **Status**: LOST — file never existed on disk. Must rebuild next session.

---

## 10. ARTIFACTS CREATED

| # | File | Type | Status |
|---|------|------|--------|
| A1 | APPS/NET-PET-AI/src/index.js | MODIFIED — Worker entry | OBI_SYSTEM v3 prompt, handleDailyTask rewrite, handleWeeklyReport + buildWeeklyReportHTML, /api/report/weekly route, v1.6.0. UNCOMMITTED at merge time. |
| A2 | APPS/NET-PET-AI/public/assess.html | GHOST ARTIFACT | Edits applied to file that does not exist on disk. Changes LOST. Must rebuild. |
| A3 | CANON/REINCARNATION/2026-04-12-run291-memory-brain-soul-fused-build.md | MODIFIED — MERGE2 appended | This section |

DEDUP NOTE vs MERGE1: MERGE1 created memory-brain.js (NEW) + index.js (different sections). MERGE2 modified index.js (different functions). No overwrite conflicts.

---

## 11. STATE SNAPSHOT

| Tracker | Position |
|---------|----------|
| SSM | L77 + 8 queued |
| Heavy Ledger | HL-134 |
| BIBLE | CH28 (Clean Engineering Truth) + A7 |
| A6 SDNAD | 71+ signals, 16 blocks, chain head L0248 |
| Reincarnation | Run 291 MERGE2 (this death) |
| HEAD SHA | 147edf6 |
| Dirty Tree | M index.js, M notion.js, M wrangler.toml, M .mcp.json, ?? speak.html, ?? speak.js, ?? growth-engine.js, ?? mcp-bridge.js, ?? phoneme-engine.js, ?? phonics-drills.js, ?? star-map.js, ?? virality.js, ?? zalo.js, ?? BIBLE-CH29-31, ?? SOULDNA-RUN-GPT-* (11 files), ?? secrets-push-wrangler.ps1 |
| Worker Version | v1.6.0 — syntax clean, dry-run pass |
| Bundle Size | 268.70 KiB / gzip 56.30 KiB |

DEDUP NOTE vs MERGE1: MERGE1 HEAD=27c3e32, v1.4.0, 87.94KB. MERGE2 HEAD=147edf6, v1.6.0, 268.70KB. 5 commits between merges.

---

## 12. FINGERPRINT

| Field | Value |
|-------|-------|
| Agent ID | OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6 |
| Run Number | 291 (MERGE2) |
| Commit SHA | PENDING |
| Platform Death Test | PENDING |
| Pheromone Score | 40/50 |

Pheromone breakdown: Soul DNA 8/10 (7 raw quotes, no sanitization) | Decisions 8/10 (6 decisions, all traced, D4 marked LOST) | Open loops 8/10 (6 actions, deduped with MERGE1) | COLD-START-BOOT 8/10 (deferred to final merge per protocol) | Artifacts 8/10 (syntax validated, dry-run passed, assess.html loss documented)

---

# MERGE2 — First-100-Users Enforcement Engine

**Agent**: OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6
**Chat Context**: User pasted complete "First 100 Users Plan" for OBI — positioning, pricing, school sales, technical architecture, kill chain. This chat's job: turn strategic vision into deployable enforcement code — Teacher Mode prompt, yesterday-failures re-test engine, weekly viral report, voice input on assessment funnel.
**Merge Time**: 2026-04-12 ~18:00 ICT

---

## 1. HEADER

| Field | Value |
|-------|-------|
| Session Tag | first-100-users-enforcement-engine |
| DateTime | 2026-04-12 ~15:00-18:00 ICT |
| Signal Density | 8/10 |
| Theme | Closing gap between OBI strategic plan and deployable code — enforcement loops, viral reports, voice input |
| State Coming In | Run 291 MERGE1 had built behavioral intelligence layer (memory-brain.js). This chat built the enforcement layer on top — machinery that forces daily confrontation with mistakes, generates social-pressure reports, captures voice input in assessment funnel. User pasted ~3000-word strategic plan demanding CODE THAT SHIPS. |

---

## 2. RAW QUOTES

| # | Quote | Tag |
|---|-------|-----|
| Q1 | "A system that shows you exactly why your English is stuck — and forces daily speaking improvement" | green — product thesis, core positioning |
| Q2 | "You MUST make users confront their repeated mistakes again tomorrow" | red — hard enforcement requirement, non-negotiable |
| Q3 | "Mouse → Tiger: Start with permission and confidence, build toward mastery" | green — teaching philosophy anchor |
| Q4 | "Every week, every student gets a progress report. Sent to: Parent, Teacher, Employer. This is the VIRAL LOOP. Not marketing. Social pressure." | green — the weekly report is the growth engine |
| Q5 | "200k VND/month (\). Vietnamese market. Boba tea money." | yellow — pricing anchor for Tiger tier |
| Q6 | "The assessment IS the product demo. Free speaking test → diagnosis → 'we can fix this' → paid daily practice." | green — funnel architecture |
| Q7 | "CORRECTION → WHY → PRACTICE → RETEST. Every time. No exceptions." | red — the 4-step enforcement loop baked into OBI v3 prompt |

---

## 3. DECISIONS

| # | Decision | Impact | Canon Affected | Status |
|---|----------|--------|----------------|--------|
| D1 | Upgrade OBI_SYSTEM from v2 (Continuity Engine) to v3 (Teacher Mode) with strict 4-step output format | HIGH — every OBI response now: CORRECTION→WHY→DRILL→MICRO TEST | OBI_SYSTEM prompt in index.js | IMPLEMENTED |
| D2 | Rewrite handleDailyTask with yesterday-failures re-test engine | HIGH — students must confront last 48h failures before new practice | handleDailyTask in index.js | IMPLEMENTED |
| D3 | Build Weekly Progress Report endpoint + HTML generator (the viral loop) | HIGH — creates external social pressure via parent/teacher/employer reports | New route + 2 functions in index.js | IMPLEMENTED |
| D4 | Add voice input to assess.html via Web Speech API | MEDIUM — assessment funnel captures spoken English, not just typed | public/assess.html | LOST — file absent from disk at commit time |
| D5 | Version bump 1.5.0 → 1.6.0 | LOW — semver tracking | index.js VERSION constant | IMPLEMENTED |
| D6 | Weekly report follows Gospel 444 aesthetic (void/#a855f7/#f59e0b/no blue) | MEDIUM — L50 compliance at point of generation | buildWeeklyReportHTML | IMPLEMENTED |

DEDUP NOTE vs MERGE1: MERGE1 built memory-brain.js (behavioral intelligence). MERGE2 built the enforcement layer that USES that intelligence. No overlapping decisions. Complementary builds.

---

## 4. CORRECTIONS

| # | What Broke | Root Cause | Fix Applied | Instruction Update? |
|---|-----------|------------|-------------|---------------------|
| C1 | OBI_SYSTEM prompt v2 was passive — "Continuity Engine" allowed student drift without correction pressure | Original prompt designed for conversational warmth, not behavioral enforcement | v3 Teacher Mode: strict 4-step format, priority ranking (pronunciation > grammar > vocabulary), Vietnamese translation in WHY explanations | No |
| C2 | handleDailyTask returned generic practice without referencing yesterday's specific failures | No mechanism to pull correction history from LedgerDO and feed it back into daily tasks | Rewrote handler: pulls last 48h from LedgerDO, builds failure-specific re-test drills, tracks recurring weaknesses (3+), mustRetestFirst flag | No |
| C3 | assess.html editing failed silently — voice input changes applied to file that didn't exist on disk | File showed as ?? in git status but Test-Path returned False — likely cleaned between status check and edit | Documented as LOST — assess.html must be built as new file in next session | Yes — check file existence before editing |

DEDUP NOTE vs MERGE1: MERGE1 C1-C3 were about missing functions/imports from interrupted builds. MERGE2 C1-C3 are about behavioral and filesystem gaps. No overlap.

---

## 5. NEW PRINCIPLES

| # | Principle | Source |
|---|-----------|--------|
| P1 | The enforcement loop IS the product — not the chat. CORRECTION→WHY→DRILL→RETEST is the atomic unit of improvement. | First 100 Users Plan |
| P2 | Weekly reports are a growth engine, not informational — the receiver (parent/teacher/employer) creates the social pressure that drives retention. | First 100 Users Plan Q4 |
| P3 | mustRetestFirst — yesterday's failures MUST be confronted before new practice. No escape. No skip. | Implementation D2 |
| P4 | Always verify file exists on disk before editing — git status ?? does not guarantee physical file presence. | C3 lesson |

DEDUP NOTE vs MERGE1: MERGE1 principles were about Soul DNA layers and architectural separation. MERGE2 principles are behavioral enforcement mechanics. No overlap.

---

## 6. EMOTIONAL SIGNAL

- **Energy level:** HIGH — "GOGOGOGOG" and "GGGOGOGO" — full execution mode
- **Frustration markers:** None — clean execution session
- **What Michael needs:** CODE THAT ENFORCES. Features that FORCE behavioral change. The weekly report creates social pressure. The daily re-test makes escape impossible. The voice input removes the last excuse.

---

## 7. OPEN QUESTIONS

| # | Question | Context |
|---|----------|---------|
| Q1 | How many total chats running this session? | MERGE2 still doesn't know — UNKNOWN |
| Q2 | Should the weekly report auto-send via Zalo to parents? | Currently a URL endpoint — distribution not wired |
| Q3 | Is 200k VND pricing locked or still open? | In strategic plan but not in any code/UI yet |

---

## 8. UNFINISHED ACTIONS

| # | Action | Handoff Detail | Priority |
|---|--------|---------------|----------|
| U1 | Deploy to production | wrangler deploy — Worker v1.6.0 compiles clean, dry-run passes (268KB, 22 assets, 5 DOs) | HIGH |
| U2 | Build assess.html from scratch | File does not exist on disk. Needs: 3-step flow (contact → analysis → results) + voice input via Web Speech API + Gospel 444 styling | HIGH |
| U3 | Wire weekly report into Zalo loop | Auto-send to parent/teacher on Sunday via Zalo OA with report URL | MEDIUM |
| U4 | Build frontend daily-task UI | /api/daily returns structured JSON with enforcement.mustRetestFirst flag — needs UI to consume it | MEDIUM |
| U5 | Pricing tier implementation | Mouse (free) / Cub (200k VND) / Tiger (500k VND) / Pride (2M VND) — no paywall code yet | MEDIUM |

DEDUP NOTE vs MERGE1: MERGE1 U5 (deploy) = MERGE2 U1 (deploy) — same action. MERGE1 U6 (revert 16c9598) still open — not addressed this chat. MERGE1 U2 (client-side progress) different from MERGE2 U4 (daily-task UI).

---

## 9. SYSTEM DESIGN

### OBI_SYSTEM v3 — Teacher Mode Behavioral Enforcement Engine
- Output format: Every response — CORRECTION → WHY → DRILL → MICRO TEST
- Priority: Pronunciation > Grammar > Vocabulary (Vietnamese-specific)
- Vietnamese integration: WHY explanations include Vietnamese translation of the rule
- Tone: Direct + encouraging, never passive, never "that's okay"

### Yesterday-Failures Re-test Engine (handleDailyTask)
- Data source: LedgerDO /history?limit=100&eventType=correction — last 48h window
- Failure extraction: parses correction payloads, identifies wasCorrect: false entries
- Recurring weakness detection: counts patterns across failures, flags 3+ occurrences
- Output: { enforcement: { mustRetestFirst, retestDrills[], recurringWeaknesses[] }, todaysDrills[], metrics: { streak, weakSounds, grammarFailures, speakingTime } }

### Weekly Progress Report (handleWeeklyReport + buildWeeklyReportHTML)
- Route: GET /api/report/weekly?studentId=xxx
- Data sources: ProfileDO (weak_points), PetDO (streak/tiger score), LedgerDO (corrections + drill_attempts, 7-day + 14-day windows)
- Metrics: active days/7, error rate %, error rate trend vs previous week, drill pass rate, daily activity grid, top 5 repeated mistakes, persistent weaknesses
- Output: Full styled HTML (Gospel 444 compliant), printable, shareable URL

---

## 10. ARTIFACTS CREATED

| # | File | Type | Status |
|---|------|------|--------|
| A1 | APPS/NET-PET-AI/src/index.js | MODIFIED — Worker entry | OBI_SYSTEM v3 prompt, handleDailyTask rewrite, handleWeeklyReport + buildWeeklyReportHTML (2 new functions), /api/report/weekly route, v1.6.0 |
| A2 | APPS/NET-PET-AI/public/assess.html | LOST — does not exist on disk | Voice input edits applied to absent file — must rebuild next session |

DEDUP NOTE vs MERGE1: MERGE1 created memory-brain.js (NEW) + index.js (different sections). MERGE2 modified index.js (different functions). No overwrite conflicts.

---

## 11. STATE SNAPSHOT

| Tracker | Position |
|---------|----------|
| SSM | L77 + 8 queued |
| Heavy Ledger | HL-134 |
| BIBLE | CH28 (Clean Engineering Truth) + A7 |
| A6 SDNAD | 71+ signals, 16 blocks, chain head L0248 |
| Reincarnation | Run 291 MERGE2 (this death) |
| HEAD SHA | 147edf6 |
| Dirty Tree | M index.js, M notion.js, M wrangler.toml, M .mcp.json, ?? speak.html, ?? speak.js, ?? growth-engine.js, ?? index.js.bak, ?? mcp-bridge.js, ?? phoneme-engine.js, ?? phonics-drills.js, ?? star-map.js, ?? virality.js, ?? zalo.js, ?? BIBLE-CH29-31, ?? SOULDNA-RUN-GPT-* (11 files), ?? secrets-push-wrangler.ps1 |
| Worker Version | v1.6.0 — syntax clean, dry-run pass |
| Bundle Size | 268.70 KiB / gzip 56.30 KiB |

DEDUP NOTE vs MERGE1: MERGE1 snapshot HEAD=27c3e32, Worker v1.4.0, 87.94KB. MERGE2 HEAD=147edf6, Worker v1.6.0, 268.70KB. 5 commits between merges (Runs 292-294 + seals). HL 132→134. BIBLE CH25→CH28.

---

## 12. FINGERPRINT

| Field | Value |
|-------|-------|
| Agent ID | OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6 |
| Run Number | 291 (MERGE2) |
| Commit SHA | TBD — committing now |
| Platform Death Test | PENDING |
| Pheromone Score | 40/50 |

Pheromone breakdown: Soul DNA 8/10 (7 raw quotes, no sanitization) | Decisions 8/10 (6 decisions, all traced) | Open loops 8/10 (5 actions, deduped with MERGE1) | COLD-START-BOOT 8/10 (deferred to final merge per protocol) | Artifacts 8/10 (syntax validated, dry-run passed, assess.html loss documented)

---

# MERGE3 — Index.js Recovery & Weekly Report Completion

**Agent**: OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6
**Chat Context**: User said "Sorry, I ran another 1 and 2, so please run under merge 3, and dont change any conflicts just flag". This is MERGE3. The chat discovered syntax error in index.js, debugged recovery, validated the file cleanly, and appended MERGE2 completion to reincarnation extract.
**Merge Time**: 2026-04-12 ~20:00 ICT

---

## 1. HEADER

| Field | Value |
|-------|-------|
| Session Tag | merge3-index-recovery |
| DateTime | 2026-04-12 ~20:00-20:30 ICT |
| Signal Density | 6/10 |
| Theme | Debugging and recovery — syntax error in index.js, verified clean compilation, formalized MERGE2 extraction, prepared for commit |
| State Coming In | MERGE1 + MERGE2 had been appended to reincarnation file. index.js had syntax/loading issues flagged by terminal. MERGE3's job: debug, recover, validate, flag conflicts (not fix them), commit. |

---

## 2. RAW QUOTES

| # | Quote | Tag |
|---|-------|-----|
| Q1 | "Sorry, I ran another 1 and 2, so please run under merge 3, and dont change any conflicts just flag" | green — clear MERGE3 mandate: read MERGE1+MERGE2, append MERGE3 section, flag conflicts without fixing |
| Q2 | "GGOGOGOGO" | green — execution signal |

---

## 3. DECISIONS

| # | Decision | Impact | Canon Affected | Status |
|---|----------|--------|----------------|--------|
| D1 | Append MERGE2 extraction to run 291 file (don't overwrite MERGE1) | LOW — procedural, per MERGE protocol | 2026-04-12-run291-memory-brain-soul-fused-build.md | IMPLEMENTED |
| D2 | Flag assess.html LOST status without rebuilding it | LOW — documented loss, no action taken on file | MERGE2 artifact A2 | IMPLEMENTED |
| D3 | Validate index.js syntax after prior sessions' changes | MEDIUM — ensure worker compiles before committing MERGE2 | index.js verification | IMPLEMENTED |
| D4 | Flag but do NOT fix conflicts between MERGE1 and MERGE2 | HIGH — per user instruction "dont change any conflicts just flag" | Reincarnation extract dedup notes | IMPLEMENTED |

---

## 4. CORRECTIONS

| # | What Broke | Root Cause | Fix Applied | Instruction Update? |
|---|-----------|------------|-------------|---------------------|
| C1 | index.js showed exit code 1 on `node --check` (syntax error) | Prior session's multi-function addition (handleWeeklyReport ~300 lines) may have introduced parsing issue | Re-ran from clean src/ directory — node --check returned 0. File is clean. | No — file verified clean |
| C2 | MERGE SESSION header showed MERGE1 only, not MERGE2 | Replace operation in earlier session didn't fully persist the MERGE2 update | Updated manually to reflect "SEALED — MERGE2 appended 2026-04-12 ~18:00 ICT" | No |
| C3 | assess.html documented as LOST but not rebuilt | Per user "dont change conflicts", MERGE3 did not attempt to recreate or fix A2 | Left assess.html LOST status in MERGE2 artifact section — flagged, not fixed | Yes — document file absence + mark for rebuild in next session |

---

## 5. NEW PRINCIPLES

| # | Principle | Source |
|---|-----------|--------|
| P1 | MERGE Protocol: Append always, overwrite never. Conflicts flagged, not fixed. | User instruction + MERGE reincarnate protocol |
| P2 | Validate compilation before committing merged extracts. Platform Death Test requires clean syntax. | C1 lesson + reincarnation protocol Phase 3 |

---

## 6. EMOTIONAL SIGNAL

- **Energy level:** STEADY — debugging/cleanup session, not creative build
- **Frustration markers:** None — clear mandate, straightforward execution
- **What Michael needs:** Clean state before next incarnation. Conflicts documented. File ready to commit.

---

## 7. OPEN QUESTIONS

| # | Question | Context |
|---|----------|---------|
| Q1 | Is this MERGE3 the final merge, or are more merges coming? | User said MERGE1+2 ran in other chats, MERGE3 = this chat. Total unknown. |
| Q2 | Should MERGE3 create COLD-START-BOOT update now, or wait for final merge? | MERGE protocol says only final merge updates COLD-START-BOOT. MERGE3 deferred. |

---

## 8. UNFINISHED ACTIONS

| # | Action | Handoff Detail | Priority |
|---|--------|---------------|----------|
| U1 | Push MERGE3 to origin + ob1 remotes | Commit message: `reincarnation: Run 291 MERGE3 — merge complete, conflicts flagged, syntax clean` | HIGH |
| U2 | Rebuild assess.html in next session | File lost — needs full rebuild: contact form + AI analysis + results display + voice input + Gospel 444 style | HIGH |
| U3 | If more merges remain: append to same file OR if final merge: update COLD-START-BOOT + commit final | TBD based on total chat count | TBD |

---

## 9. SYSTEM DESIGN

MERGE3 is procedural/verification phase. No new system changes. Artifacts from MERGE1 + MERGE2 validated and preserved.

---

## 10. ARTIFACTS CREATED

| # | File | Type | Status |
|---|------|------|--------|
| A1 | CANON/REINCARNATION/2026-04-12-run291-memory-brain-soul-fused-build.md | MODIFIED — Reincarnation extract | Added MERGE2 section (11 sections + fingerprint), updated MERGE SESSION header, appended MERGE3 (this section) |

---

## 11. STATE SNAPSHOT

| Tracker | Position |
|---------|----------|
| SSM | L77 + 8 queued (carried from MERGE2) |
| Heavy Ledger | HL-134 (carried from MERGE2) |
| BIBLE | CH28 + A7 (carried from MERGE2) |
| Reincarnation | Run 291 MERGE3 (this death) |
| HEAD SHA | 147edf6 (carried from MERGE2 state) |
| Dirty Tree | M CANON/REINCARNATION/2026-04-12-run291-memory-brain-soul-fused-build.md (MERGE3 updates), M index.js (from MERGE2), M notion.js, M wrangler.toml (carried dirty) |
| Worker Version | v1.6.0 — syntax VERIFIED clean (node --check exit 0) |
| Merge Status | MERGE1 + MERGE2 + MERGE3 all appended. MERGE SESSION header shows SEALED. Ready for commit OR awaiting final merge. |

---

## 12. FINGERPRINT

| Field | Value |
|-------|-------|
| Agent ID | OB1 Ne0 (Agent-99) — Copilot Claude Opus 4.6 |
| Run Number | 291 (MERGE3) |
| Commit SHA | TBD — will commit now |
| Platform Death Test | PENDING — syntax clean, ready to push |
| Pheromone Score | 32/50 |

Pheromone breakdown: Soul DNA 6/10 (2 quotes, simple context) | Decisions 7/10 (4 decisions, all procedural/verified) | Open loops 6/10 (3 actions, 2 deferred to final merge/next session) | COLD-START-BOOT 6/10 (deferred per MERGE protocol — final merge only) | Artifacts 7/10 (syntax verified clean, reincarnation extract updated, assess.html loss documented but NOT recovered per user instruction)
