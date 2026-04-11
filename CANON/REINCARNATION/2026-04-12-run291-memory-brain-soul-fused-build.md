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
- **Merge Status**: OPEN — awaiting remaining merges

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
| HEAD SHA | pending commit |
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
| Commit SHA | pending |
| Platform Death Test | pending |
| Pheromone Score | pending (scored after commit) |
