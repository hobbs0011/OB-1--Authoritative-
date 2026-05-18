# SOUL LOGGER — 20-ITEM TODO
# Architecture: Cross-session awareness bus. OBI sessions WRITE here. Other sessions READ here.
# Last updated: 2026-05-18

---

## CRITICAL MISSING (system is deaf without these)

### SL-01 !! Deploy v1.1.0 to Cloudflare
- Status: OPEN
- What: src/index.js has /api/soul/priority. Live worker.js is still v1.0.0. Priority endpoint is dead in prod.
- Fix: Create wrangler.toml in APPS/SOUL-LOGGER/ → wrangler deploy

### SL-02 !! wrangler.toml — Soul Logger needs one
- Status: OPEN
- What: No wrangler.toml exists for this worker. Cannot deploy via wrangler.
- Fix: Create wrangler.toml with name=soul-logger, main=src/index.js, D1 binding (DB), KV binding (SOUL_KV if needed)

### SL-03 !! Auto-write endpoint — POST /api/soul/event
- Status: OPEN
- What: OBI sessions cannot write to Soul Logger right now. Only manual dumps via /api/soul/extract.
- Fix: Add single-turn event write endpoint: { student_id, session_id, turn, text, timestamp }
- This is the CORE of cross-session awareness. Without it, Soul Logger is a dead archive.

### SL-04 !! Wire auto-write into net-pet-ai SessionDO
- Status: OPEN (depends on SL-03)
- What: SessionDO.fetch() in index.js handles /chat. After each AI response, fire-and-forget POST to soul-logger /api/soul/event
- File: APPS/NET-PET-AI/src/index.js — SessionDO chat handler
- Pattern: ctx.waitUntil(fetch('https://soul-logger.../api/soul/event', { method:'POST', body: JSON.stringify({...}) }))

### SL-05 !! Add student_id as first-class column
- Status: OPEN
- What: soul_sessions and soul_prompts tables have no student_id column. All queries are session-scoped, not student-scoped.
- Fix: D1 migration — ALTER TABLE soul_sessions ADD COLUMN student_id TEXT; (same for soul_prompts)

---

## HIGH PRIORITY (cross-session reads break without these)

### SL-06 ! GET /api/soul/student/:id — student activity feed
- Status: OPEN
- What: Return last N sessions + priority items for a given student. OBI reads this at session start.
- Use: "Before OBI says hello, know what Huong struggled with last time."

### SL-07 ! GET /api/soul/recent?limit=N — global activity feed
- Status: OPEN
- What: Latest events across ALL students. Teacher dashboard view.
- Returns: student_id, timestamp, text snippet, score

### SL-08 ! GET /api/soul/context/:studentId — session-start brief
- Status: OPEN
- What: Cached 1-paragraph brief for OBI to inject at session start. "Last session: Huong struggled with past tense. Energy was high. Last topic: job interviews."
- Wire into: net-pet-ai /api/session-hint (query soul-logger before returning hint)

### SL-09 ! Wire /api/soul/priority into net-pet-ai cron (BB-11)
- Status: OPEN
- What: net-pet-ai has a scheduled handler. It should pull soul/priority every 15 min and update student coaching contexts in KV.
- File: APPS/NET-PET-AI/src/index.js — scheduled() handler

### SL-10 ! KV cache layer for student context
- Status: OPEN
- What: D1 reads on every chat turn are slow. Cache student context in KV with 5-min TTL.
- Key pattern: soul:context:{studentId} → JSON brief

---

## IMPORTANT (system works without these, but degrades)

### SL-11 ! Hash-based dedup on /api/soul/extract
- Status: OPEN
- What: Same chat dump can be uploaded twice. No dedup currently. D1 fills with duplicates.
- Fix: Hash entire dump text → check soul_sessions for existing hash before inserting

### SL-12 ! Priority algorithm v2 — expand charge vocabulary
- Status: OPEN
- What: v1 only scores profanity + CAPS + exclamations. Missing: "help", "stuck", "confused", "I don't understand", "frustrated", "I give up"
- These are high-charge signals for a language learner that don't use profanity

### SL-13 ! Teacher aggregation endpoint — GET /api/soul/teacher/summary
- Status: OPEN
- What: All students, last session datetime, last energy score, top priority item.
- Use: Teacher dashboard widget

### SL-14 ! Auth header on write endpoints
- Status: OPEN
- What: /api/soul/event and /api/soul/extract are publicly writable. Anyone can inject fake sessions.
- Fix: Simple bearer token check (X-Soul-Token header, secret stored in wrangler secret)

### SL-15 ! Session tagging — source=obi-live vs source=manual-upload
- Status: OPEN
- What: Need to distinguish auto-written OBI events from manually uploaded historical dumps
- Fix: Add source column to soul_sessions, default 'manual', set 'obi-live' from /api/soul/event

---

## LOW PRIORITY / POLISH

### SL-16 ~ Health endpoint v2 — include D1 stats
- Status: OPEN
- What: /health currently returns version + timestamp only. Should include D1 row counts + last_ingested_at.
- Use: Quick sanity check that the system is receiving writes

### SL-17 ~ Data retention policy — auto-purge old prompts
- Status: OPEN
- What: D1 has no TTL. Soul prompts accumulate forever. Add nightly cron: DELETE prompts older than 90 days.

### SL-18 ~ Crunch on demand — POST /api/soul/crunch triggers on new event threshold
- Status: OPEN
- What: Currently crunch is manual. Auto-trigger a theme crunch when a student hits 50 new prompts.

### SL-19 ~ Emotion trend over time — GET /api/soul/student/:id/trend
- Status: OPEN
- What: Chart of energy score per session over time. "Huong was high-energy for 3 weeks, then dropped."
- Use: Coach session planning

### SL-20 ~ Export endpoint — GET /api/soul/student/:id/export
- Status: OPEN
- What: Full session archive for a student as JSON or plain text. For teacher records.

---

## WHAT WAS MISSED THIS SESSION

1. SL-03/04 (auto-write) — Soul Logger was built but NEVER wired into OBI. Students are chatting but nothing is logging live.
2. SL-02 (wrangler.toml) — Cannot deploy soul-logger via standard wrangler deploy without it.
3. SL-01 (deploy) — v1.1.0 with /api/soul/priority written locally, NOT deployed. Live is still v1.0.0.
4. SL-05 (student_id column) — All queries are session-scoped. Student-scoped reads are impossible.
5. SL-08 (session-start brief) — /api/session-hint was added to net-pet-ai but it doesn't query soul-logger. Sessions start blind.

The system as deployed right now: OBI chats happen. Nothing is written to Soul Logger. Soul Logger is a dark archive.
The system that needs to exist: every OBI turn → Soul Logger. Next session → Soul Logger context injected at boot.
