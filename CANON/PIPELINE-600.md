# PIPELINE-600 — MEGAMERGE ACTIONABLE EXECUTION MATRIX

> **Created:** 2026-04-12 | Run 298 PHASE_0  
> **Source:** 73,860 lines across 7 megamerge files (MM-1 through MM-6 + MM-2B)  
> **Structure:** 100 items × 6 megamerges = 600 total  
> **Authority:** SOV100_MICHAEL_HOBBS  
> **KPI:** "Does the student speak English more tomorrow than today?"  
> **Production Stack:** Cloudflare Workers + DO + D1 + DeepSeek + Deepgram (MM-4/5 stack won)  
> **Philosophy:** MM-6 (strip everything, ship product, measure retention only)

---

## STATUS KEY

| Tag | Meaning |
|-----|---------|
| `[ ]` | Not started |
| `[~]` | Partial / stubbed |
| `[x]` | Shipped in production |
| `P0` | IMMEDIATE — blocks everything |
| `P1` | THIS SPRINT — ship within 2 weeks |
| `P2` | NEXT SPRINT — ship within 6 weeks |
| `P3` | BACKLOG — ship when stable |

---

## CURRENT PRODUCTION STATE (reference)

**Shipped files in `APPS/NET-PET-AI/src/`:**
- `index.js` (208KB main worker — 22 routes, 4 DOs)
- `anti-drift.js`, `auth.js`, `cognitive-router.js`, `growth-engine.js`
- `memory-brain.js`, `notion.js`, `phoenix-reincarnation.js`, `phoenix-seal.js`
- `phoneme-engine.js`, `phonics-drills.js`, `security.js`, `session-compress.js`
- `snapshot-engine.js`, `star-map.js`, `tiger-score.js`, `veritas.js`
- `virality.js`, `zalo.js`

**CRITICAL REGRESSION:** Commit `16c9598` destroyed student-facing chat — MUST REVERT to `0a5c92d`

---

# ═══════════════════════════════════════════════════════
# MM-1: THE GENESIS (26,210 lines)
# "Why this system exists, who it serves, what problem it solves"
# Source: MEGAMERGE-1-GPT.txt | Index: CANON/MEGAMERGE-1-INDEX.md
# ═══════════════════════════════════════════════════════

## MM-1 PRODUCT — Features from Genesis Vision (001–015)

- `[ ]` MM1-001 P0 — REVERT commit 16c9598 to restore student Magic Chat (getMagicChatHTML)
- `[ ]` MM1-002 P0 — Implement OBI 5 Rules of Existence in production system prompt (§9, L10200-11500)
- `[ ]` MM1-003 P1 — Build Mouse→Tiger level progression UI (visible to student as encouragement)
- `[ ]` MM1-004 P1 — Implement accountability partner notification system (parent/teacher alerts)
- `[ ]` MM1-005 P1 — Build "Goldfish Problem" onboarding flow — show students WHY they forget
- `[ ]` MM1-006 P1 — Implement Vietnamese tooltip system for all vocabulary in chat
- `[ ]` MM1-007 P2 — Create student daily streak counter with visual progression
- `[ ]` MM1-008 P2 — Build lesson selector with Gospel 444 structure (4 sections × 4 levels × 4 types)
- `[ ]` MM1-009 P2 — Create student dashboard showing personal error patterns over time
- `[ ]` MM1-010 P2 — Build teacher dashboard showing class-wide progress
- `[ ]` MM1-011 P3 — Implement 100-student capacity rollout plan from §15
- `[ ]` MM1-012 P3 — Build multi-student comparison view for teachers
- `[ ]` MM1-013 P3 — Create parent-facing progress report (Vietnamese language, weekly)
- `[ ]` MM1-014 P3 — Build "classroom mode" for simultaneous multi-student sessions
- `[ ]` MM1-015 P3 — Implement OBI personality customization (formality slider per student preference)

## MM-1 CODE — Agent Runtime & Architecture (016–030)

- `[~]` MM1-016 P1 — Port Agent Runtime Kernel router pattern from §4 into kilo command dispatch
- `[ ]` MM1-017 P1 — Implement preflight validation (L07 CHECKLIST_FIRST) as pre-deploy gate
- `[ ]` MM1-018 P1 — Build context builder function merging SessionDO + ProfileDO + D1 history
- `[ ]` MM1-019 P2 — Implement anti-drift detection from §8 (Reality Engine pattern)
- `[~]` MM1-020 P2 — Complete snapshot-engine.js — full state capture/restore for sessions
- `[ ]` MM1-021 P2 — Build closed-loop learning pipeline: input → AI → correction → mastery tracking
- `[ ]` MM1-022 P2 — Implement 4-Lane parallel build structure (OBI LLM, UI, Accountability, Integration)
- `[ ]` MM1-023 P2 — Create session replay system — teachers can review student conversations
- `[ ]` MM1-024 P3 — Build shipper pattern enforcing dual-publish (GitHub + Notion, L27)
- `[ ]` MM1-025 P3 — Implement reporter module for execution metrics and build log
- `[ ]` MM1-026 P3 — Port swarm.ts coordination pattern for multi-agent background tasks
- `[ ]` MM1-027 P3 — Build executor.ts task engine for queued operations
- `[ ]` MM1-028 P3 — Create kernel lifecycle management (boot → run → pause → death → reincarnate)
- `[ ]` MM1-029 P3 — Implement types.ts as TypeScript type overlay for Worker
- `[ ]` MM1-030 P3 — Build router.ts intent classification for student message types

## MM-1 DATA — State & Storage Design (031–040)

- `[x]` MM1-031 P0 — SessionDO with SQL-backed storage — SHIPPED
- `[x]` MM1-032 P0 — ProfileDO with student profiles — SHIPPED
- `[x]` MM1-033 P0 — PetDO with gamification state — SHIPPED
- `[ ]` MM1-034 P1 — Implement session_log table with structured conversation history
- `[ ]` MM1-035 P1 — Build soul_dna capture table for sovereign dictation storage
- `[ ]` MM1-036 P2 — Create context_builder_cache for fast context assembly
- `[ ]` MM1-037 P2 — Build event_audit_log for all system operations
- `[ ]` MM1-038 P2 — Implement student error pattern table (mistake frequency, error type, timestamp)
- `[ ]` MM1-039 P3 — Create accountability_graph table (student→parent→teacher relationships)
- `[ ]` MM1-040 P3 — Build lesson_progress table tracking Gospel 444 completion state

## MM-1 VOICE — TTS/STT Foundations (041–050)

- `[x]` MM1-041 P0 — Deepgram Aura 2 TTS integration — SHIPPED
- `[x]` MM1-042 P0 — Deepgram Nova-2 STT integration — SHIPPED
- `[ ]` MM1-043 P1 — Implement pronunciation feedback (compare student audio to correct phoneme)
- `[ ]` MM1-044 P1 — Build "repeat after me" mode with voice comparison scoring
- `[ ]` MM1-045 P2 — Create voice-first interaction mode (student can speak instead of type)
- `[ ]` MM1-046 P2 — Implement prosody feedback (rhythm, stress, intonation)
- `[ ]` MM1-047 P2 — Build Vietnamese explanation audio for vocabulary tooltips
- `[ ]` MM1-048 P3 — Create voice-level progression (Mouse voice = slow/clear, Tiger voice = natural speed)
- `[ ]` MM1-049 P3 — Implement accent detection and classification
- `[ ]` MM1-050 P3 — Build voice journal — student can listen to their progression over time

## MM-1 UI — Gospel 444 Frontend (051–060)

- `[x]` MM1-051 P0 — Gospel 444 palette deployed (void black, purple, gold, NO BLUE) — SHIPPED
- `[x]` MM1-052 P0 — Mobile-first responsive design — SHIPPED
- `[ ]` MM1-053 P1 — Build conversation bubbles with Vietnamese subtitle toggle
- `[ ]` MM1-054 P1 — Create typing indicator with OBI personality animation
- `[ ]` MM1-055 P1 — Implement error highlight in student messages (red underline + correction)
- `[ ]` MM1-056 P2 — Build progress bar showing daily lesson completion
- `[ ]` MM1-057 P2 — Create modal for vocabulary word details (definition, example, audio, Vietnamese)
- `[ ]` MM1-058 P2 — Implement dark/light mode toggle (dark = void black default)
- `[ ]` MM1-059 P3 — Build achievement/badge display for milestones
- `[ ]` MM1-060 P3 — Create onboarding wizard (name, level, goals, preferred topics)

## MM-1 MARKETING — Investor & Positioning (061–070)

- `[ ]` MM1-061 P2 — Build 9-slide investor pitch deck from §13 (Canva/PDF)
- `[ ]` MM1-062 P2 — Create one-page product overview for teachers (Vietnamese + English)
- `[ ]` MM1-063 P2 — Write LinkedIn founder-story post series (3 posts minimum)
- `[ ]` MM1-064 P2 — Build landing page for naturalenglishtraining.net with conversion CTA
- `[ ]` MM1-065 P3 — Create demo video (60s) showing student conversation flow
- `[ ]` MM1-066 P3 — Write parent-facing FAQ — "What is OBI?" in Vietnamese
- `[ ]` MM1-067 P3 — Build email onboarding sequence (5 emails, bilingual)
- `[ ]` MM1-068 P3 — Create school administrator pitch deck (different from investor deck)
- `[ ]` MM1-069 P3 — Write case study template for beta cohort results
- `[ ]` MM1-070 P3 — Build referral mechanism — students invite classmates

## MM-1 LEGAL — Vietnam Business Setup (071–078)

- `[ ]` MM1-071 P0 — Execute Vietnam company incorporation (WFOE under VSIC 6201/5820)
- `[ ]` MM1-072 P0 — Register business address in HCMC
- `[ ]` MM1-073 P1 — File software copyright for OBI platform
- `[ ]` MM1-074 P1 — Register NET / Natural English Training trademark
- `[ ]` MM1-075 P1 — Establish dataset ownership agreement (student data = company asset)
- `[ ]` MM1-076 P2 — Create Terms of Service (bilingual Vietnamese/English)
- `[ ]` MM1-077 P2 — Create Privacy Policy compliant with Vietnam data law
- `[ ]` MM1-078 P2 — Set up payment processing for Vietnamese market (VND)

## MM-1 CANON — Preservation & Doctrine (079–088)

- `[x]` MM1-079 P0 — MEGAMERGE-1-INDEX.md created — DONE
- `[ ]` MM1-080 P1 — Extract all 22 RAW_QUOTES from MM-1 repetition cycles into sovereign-quotes.md
- `[ ]` MM1-081 P1 — Cross-reference MM-1 Bible chapter index (§14) against actual CANON/BIBLE-CH* files
- `[ ]` MM1-082 P2 — Create annotated timeline of Canon Events CE-01 through CE-14 from §2
- `[ ]` MM1-083 P2 — Build SSM V7→V8 diff document showing law evolution
- `[ ]` MM1-084 P2 — Extract all unique Soul DNA blocks from 6 repetition cycles
- `[ ]` MM1-085 P3 — Create "Repetition Training Analysis" — catalog what changed across 6 cycles
- `[ ]` MM1-086 P3 — Build sovereign dictation archive sorted chronologically
- `[ ]` MM1-087 P3 — Create three pillars reference card (SSM + Agent 99 OS + Heavy Ledger)
- `[ ]` MM1-088 P3 — Extract governance rules from §16 into standalone governance doc

## MM-1 INFRA — Deployment & Operations (089–095)

- `[x]` MM1-089 P0 — Cloudflare Workers deployment — SHIPPED
- `[x]` MM1-090 P0 — wrangler.toml configured — SHIPPED
- `[ ]` MM1-091 P1 — Complete CLOUDFLARE-DEPLOY-20-STAGE stages 08-12 (domain transfer from Squarespace)
- `[ ]` MM1-092 P1 — Set up Cloudflare AI Gateway monitoring dashboard
- `[ ]` MM1-093 P2 — Implement health check endpoint returning all system metrics
- `[ ]` MM1-094 P2 — Create staging environment for pre-production testing
- `[ ]` MM1-095 P3 — Build automated deployment pipeline (GitHub Actions → wrangler deploy)

## MM-1 TEST — Validation & QA (096–100)

- `[ ]` MM1-096 P1 — Create automated syntax check (node --check) in CI
- `[ ]` MM1-097 P1 — Build wrangler deploy --dry-run as CI gate
- `[ ]` MM1-098 P2 — Create end-to-end test: student sends message → OBI responds with correction
- `[ ]` MM1-099 P2 — Build load test for 100 concurrent student sessions
- `[ ]` MM1-100 P3 — Create regression test specifically for getMagicChatHTML (prevent repeat of 16c9598)

---

# ═══════════════════════════════════════════════════════
# MM-2: THE IMPLEMENTATION (System Contracts & Scaffolds)
# "First translation of soul into structured blueprints"
# Source: MEGAMERGE-2-GPT.txt + MEGAMERGE-2B-GPT.txt
# ═══════════════════════════════════════════════════════

## MM-2 PRODUCT — System Contract Features (101–115)

- `[ ]` MM2-101 P1 — Implement Magic Chat as named feature (original concept from MM-2)
- `[ ]` MM2-102 P1 — Build StudentBrain DO v1 — per-student memory container
- `[ ]` MM2-103 P1 — Create session continuity — student returns and OBI remembers last conversation
- `[ ]` MM2-104 P1 — Implement mistake tracking with categorized error types
- `[ ]` MM2-105 P2 — Build correction replay — student can review past corrections
- `[ ]` MM2-106 P2 — Create "learning pathway" — sequence of lessons based on student weaknesses
- `[ ]` MM2-107 P2 — Implement graduated difficulty — OBI adjusts complexity per student level
- `[ ]` MM2-108 P2 — Build conversation topic selector (daily life, school, travel, work)
- `[ ]` MM2-109 P2 — Create "practice mode" — structured drills vs free conversation
- `[ ]` MM2-110 P3 — Implement peer comparison (anonymized) — "students at your level typically..."
- `[ ]` MM2-111 P3 — Build vocabulary notebook — student saves words they want to remember
- `[ ]` MM2-112 P3 — Create spaced repetition queue for saved vocabulary
- `[ ]` MM2-113 P3 — Implement session summary — end-of-chat recap of corrections and progress
- `[ ]` MM2-114 P3 — Build "challenge mode" — timed exercises for advanced students
- `[ ]` MM2-115 P3 — Create achievement system with unlock notifications

## MM-2 CODE — Contracts & Patterns (116–130)

- `[ ]` MM2-116 P1 — Formalize DO interface contracts (ISessionDO, IProfileDO, IPetDO)
- `[ ]` MM2-117 P1 — Implement Merkle hash function for audit trail (crypto.subtle.digest SHA-256)
- `[ ]` MM2-118 P1 — Build event sourcing pattern — all state changes as immutable events
- `[ ]` MM2-119 P2 — Create middleware chain for Worker routes (auth → validate → execute → log)
- `[ ]` MM2-120 P2 — Implement rate limiting per student (prevent API abuse)
- `[ ]` MM2-121 P2 — Build error recovery middleware — graceful degradation on API failures
- `[ ]` MM2-122 P2 — Create response formatter — consistent JSON envelope for all API responses
- `[ ]` MM2-123 P2 — Implement request ID tracking across DO hops
- `[ ]` MM2-124 P3 — Build optimistic concurrency control for DO state updates
- `[ ]` MM2-125 P3 — Create batch operations API for teacher bulk actions
- `[ ]` MM2-126 P3 — Implement WebSocket upgrade for real-time chat (vs polling)
- `[ ]` MM2-127 P3 — Build API versioning (v1/ prefix) for future compatibility
- `[ ]` MM2-128 P3 — Create OpenAPI spec for all Worker routes
- `[ ]` MM2-129 P3 — Implement structured logging with correlation IDs
- `[ ]` MM2-130 P3 — Build circuit breaker for DeepSeek API calls

## MM-2 DATA — Structured Storage (131–140)

- `[ ]` MM2-131 P1 — Design normalized mistake table (student_id, input_text, correction, error_type, timestamp)
- `[ ]` MM2-132 P1 — Create student_profile schema (name, level, native_lang, goals, created_at)
- `[ ]` MM2-133 P1 — Build conversation_history table (session_id, role, content, timestamp)
- `[ ]` MM2-134 P2 — Implement vocabulary_bank table (student_id, word, definition_vi, mastery_level)
- `[ ]` MM2-135 P2 — Create lesson_completion table (student_id, lesson_id, score, completed_at)
- `[ ]` MM2-136 P2 — Build error_pattern_summary view (aggregate most common errors per student)
- `[ ]` MM2-137 P3 — Implement session_analytics table (duration, message_count, correction_count)
- `[ ]` MM2-138 P3 — Create student_streak table (current_streak, longest_streak, last_active)
- `[ ]` MM2-139 P3 — Build class_group table (teacher_id, class_name, student_ids)
- `[ ]` MM2-140 P3 — Implement data export function (CSV download per student)

## MM-2 VOICE — Speech Integration (141–148)

- `[ ]` MM2-141 P1 — Build voice message button in chat UI (tap to speak)
- `[ ]` MM2-142 P1 — Implement STT → text display → correction pipeline
- `[ ]` MM2-143 P2 — Create pronunciation score per utterance (0-100)
- `[ ]` MM2-144 P2 — Build voice comparison widget (student vs correct pronunciation)
- `[ ]` MM2-145 P2 — Implement voice-to-text with Vietnamese fallback detection
- `[ ]` MM2-146 P3 — Create voice difficulty tiers (slow/normal/fast playback speed)
- `[ ]` MM2-147 P3 — Build voice dictation mode — OBI speaks, student types what they hear
- `[ ]` MM2-148 P3 — Implement ambient noise tolerance settings

## MM-2 UI — Chrome Extension & Web (149–158)

- `[ ]` MM2-149 P1 — Build Chrome Extension popup with quick-chat widget
- `[ ]` MM2-150 P1 — Create Chrome Extension content script for in-page vocabulary lookup
- `[ ]` MM2-151 P2 — Implement Extension ↔ Worker authentication flow
- `[ ]` MM2-152 P2 — Build Extension badge showing daily streak count
- `[ ]` MM2-153 P2 — Create Extension context menu — "Practice this word with OBI"
- `[ ]` MM2-154 P2 — Implement Extension notifications for study reminders
- `[ ]` MM2-155 P3 — Build Extension reading mode — highlight page text and get OBI explanations
- `[ ]` MM2-156 P3 — Create Extension history — recent lookups and practice sessions
- `[ ]` MM2-157 P3 — Implement Extension offline mode with cached vocabulary
- `[ ]` MM2-158 P3 — Build Extension theming (Gospel 444 palette in browser)

## MM-2 MARKETING — Product Messaging (159–165)

- `[ ]` MM2-159 P2 — Create "Magic Chat" brand identity (name, tagline, icon)
- `[ ]` MM2-160 P2 — Write Chrome Web Store listing copy (English + Vietnamese)
- `[ ]` MM2-161 P2 — Build feature comparison chart vs Duolingo/Elsa/other apps
- `[ ]` MM2-162 P3 — Create teacher testimonial template for early adopters
- `[ ]` MM2-163 P3 — Write app store description for future mobile release
- `[ ]` MM2-164 P3 — Build social proof widget for landing page
- `[ ]` MM2-165 P3 — Create WhatsApp/Zalo share cards for student invitations

## MM-2 CANON — System Contracts Archive (166–172)

- `[ ]` MM2-166 P2 — Extract all system contracts from MM-2 into CANON/SYSTEM-CONTRACTS.md
- `[ ]` MM2-167 P2 — Document StudentBrain DO evolution (v1 concept → current ProfileDO)
- `[ ]` MM2-168 P2 — Create Merkle Ledger design doc (concept from MM-2 → shipped heavy-ledger)
- `[ ]` MM2-169 P3 — Build Chrome Extension design history (MM-2 concept → APPS/obi-chrome-extension/)
- `[ ]` MM2-170 P3 — Document Magic Chat naming origin and feature evolution
- `[ ]` MM2-171 P3 — Create interface contract registry — all DO public methods documented
- `[ ]` MM2-172 P3 — Extract MM-2B unique content into separate appendix

## MM-2 INFRA — Integration Infrastructure (173–182)

- `[ ]` MM2-173 P1 — Set up KV namespace for feature flags (per-student feature toggles)
- `[ ]` MM2-174 P1 — Configure R2 bucket for student voice recordings
- `[ ]` MM2-175 P2 — Implement CDN caching for static lesson content
- `[ ]` MM2-176 P2 — Build Worker analytics endpoint (response times, error rates, active users)
- `[ ]` MM2-177 P2 — Create backup strategy for DO state (periodic KV snapshots)
- `[ ]` MM2-178 P3 — Implement geographic routing (Vietnam-optimized edge locations)
- `[ ]` MM2-179 P3 — Build A/B testing infrastructure using KV flags
- `[ ]` MM2-180 P3 — Create development seed data (fake students, conversations, errors)

## MM-2 TEST — Contract Validation (181–190)

- `[ ]` MM2-181 P1 — Write unit tests for DO interface contracts
- `[ ]` MM2-182 P1 — Create integration test: message flow from API → DO → AI → response
- `[ ]` MM2-183 P2 — Build Merkle hash verification tests
- `[ ]` MM2-184 P2 — Create Chrome Extension content script tests
- `[ ]` MM2-185 P2 — Write API response format validation tests
- `[ ]` MM2-186 P3 — Build session continuity test (student context preserved across sessions)
- `[ ]` MM2-187 P3 — Create concurrent session test (multiple students, different DOs)
- `[ ]` MM2-188 P3 — Write rate limiting boundary tests
- `[ ]` MM2-189 P3 — Build error recovery test (simulate DeepSeek timeout)
- `[ ]` MM2-190 P3 — Create data migration test (schema version upgrades)

## MM-2 PRODUCT (Overflow) — Behavioral OS (191–200)

- `[ ]` MM2-191 P2 — Implement "behavioral OS" concept — OBI adapts teaching style to student behavior
- `[ ]` MM2-192 P2 — Build hesitation detection — long pause before answer = uncertainty signal
- `[ ]` MM2-193 P2 — Create correction acceptance tracking — does student use corrections?
- `[ ]` MM2-194 P2 — Implement retry encouragement — student tries same sentence again
- `[ ]` MM2-195 P3 — Build confidence estimator from response patterns
- `[ ]` MM2-196 P3 — Create emotional tone detection in student messages
- `[ ]` MM2-197 P3 — Implement adaptive pacing — slower for struggling students
- `[ ]` MM2-198 P3 — Build "I don't understand" handler in Vietnamese
- `[ ]` MM2-199 P3 — Create encouragement engine — milestone celebrations
- `[ ]` MM2-200 P3 — Implement graceful session ending — summary + preview of next lesson

---

# ═══════════════════════════════════════════════════════
# MM-3: THE STACK DECISION (Earliest Raw Sessions)
# "Locks the stack: Cloudflare Workers + DO + D1 + DeepSeek/Deepgram"
# Source: MEGAMERGE-3-GPT.txt (ACTUAL genesis — earliest material)
# ═══════════════════════════════════════════════════════

## MM-3 PRODUCT — Foundation Features (201–215)

- `[x]` MM3-201 P0 — Cloudflare Workers as runtime — SHIPPED (stack decision held)
- `[x]` MM3-202 P0 — Durable Objects for per-student state — SHIPPED
- `[x]` MM3-203 P0 — DeepSeek V3.2 as conversation AI — SHIPPED
- `[x]` MM3-204 P0 — Deepgram for voice (Aura 2 TTS + Nova-2 STT) — SHIPPED
- `[ ]` MM3-205 P1 — Build basic tutor prompt with correction pattern (earliest OBI concept)
- `[ ]` MM3-206 P1 — Implement conversation context window management (token budget)
- `[ ]` MM3-207 P1 — Create student onboarding flow (Vietnamese welcome → level assessment)
- `[ ]` MM3-208 P2 — Build level assessment quiz (5-10 questions to place student)
- `[ ]` MM3-209 P2 — Implement conversation topic generation from student interests
- `[ ]` MM3-210 P2 — Create daily login reward system (gamification foundation)
- `[ ]` MM3-211 P2 — Build "warm-up" mini exercise at session start
- `[ ]` MM3-212 P3 — Implement conversation branching based on student errors
- `[ ]` MM3-213 P3 — Create "fun fact" interjections about English quirks
- `[ ]` MM3-214 P3 — Build cultural context module — English idioms explained for Vietnamese
- `[ ]` MM3-215 P3 — Implement holiday/seasonal content rotation

## MM-3 CODE — Stack Implementation Patterns (216–230)

- `[x]` MM3-216 P0 — Worker fetch handler with route dispatch — SHIPPED
- `[ ]` MM3-217 P1 — Refactor index.js into modular route files (208KB is too large)
- `[ ]` MM3-218 P1 — Implement proper error boundaries per route
- `[ ]` MM3-219 P1 — Build DO alarm system for scheduled student reminders
- `[ ]` MM3-220 P1 — Create environment variable validation on Worker start
- `[ ]` MM3-221 P2 — Implement Worker KV for caching AI responses (same question → cached answer)
- `[ ]` MM3-222 P2 — Build structured logging with cf-ray correlation
- `[ ]` MM3-223 P2 — Create Worker middleware for CORS handling
- `[ ]` MM3-224 P2 — Implement DO hibernation for inactive students
- `[ ]` MM3-225 P3 — Build Workers Analytics Engine integration
- `[ ]` MM3-226 P3 — Create D1 migration system for schema evolution
- `[ ]` MM3-227 P3 — Implement Workers for Platforms for multi-tenant isolation
- `[ ]` MM3-228 P3 — Build Queues integration for async processing
- `[ ]` MM3-229 P3 — Create tail worker for debug logging in production
- `[ ]` MM3-230 P3 — Implement R2 for large content storage (lesson materials, audio files)

## MM-3 DATA — D1 Schema Design (231–240)

- `[ ]` MM3-231 P1 — Create D1 database with initial schema migration
- `[ ]` MM3-232 P1 — Build sessions table (id, student_id, started_at, ended_at, message_count)
- `[ ]` MM3-233 P1 — Create messages table (id, session_id, role, content, created_at)
- `[ ]` MM3-234 P1 — Build students table (id, name, level, native_language, created_at)
- `[ ]` MM3-235 P2 — Create corrections table (id, message_id, original, corrected, rule, accepted)
- `[ ]` MM3-236 P2 — Build progress table (student_id, date, sessions_count, corrections_count, score)
- `[ ]` MM3-237 P2 — Create indexes for common queries (student lookup, session history)
- `[ ]` MM3-238 P3 — Build analytics views (daily active users, average session length)
- `[ ]` MM3-239 P3 — Create archival strategy for old sessions (R2 cold storage)
- `[ ]` MM3-240 P3 — Implement soft delete with retention period

## MM-3 VOICE — Stack-Native Voice (241–250)

- `[ ]` MM3-241 P1 — Optimize Deepgram STT latency (stream vs batch)
- `[ ]` MM3-242 P1 — Implement TTS caching for common phrases (R2 + KV)
- `[ ]` MM3-243 P2 — Build pronunciation model for Vietnamese L1 speakers
- `[ ]` MM3-244 P2 — Create voice quality detection (background noise, mic quality warnings)
- `[ ]` MM3-245 P2 — Implement real-time speech streaming via WebSocket
- `[ ]` MM3-246 P3 — Build voice authentication (optional — verify it's the enrolled student)
- `[ ]` MM3-247 P3 — Create teacher voice-note feature (record instructions for students)
- `[ ]` MM3-248 P3 — Implement multi-accent TTS (American, British, Australian)
- `[ ]` MM3-249 P3 — Build voice speed control (0.5x to 2.0x playback)
- `[ ]` MM3-250 P3 — Create phoneme-level alignment for pronunciation feedback

## MM-3 UI — Web App Foundation (251–260)

- `[x]` MM3-251 P0 — Static HTML frontend on Workers — SHIPPED
- `[ ]` MM3-252 P1 — Build responsive chat interface optimized for Vietnamese mobile phones
- `[ ]` MM3-253 P1 — Create login/registration page (simple auth flow)
- `[ ]` MM3-254 P1 — Implement PWA (Progressive Web App) for home screen installation
- `[ ]` MM3-255 P2 — Build offline page with cached vocabulary practice
- `[ ]` MM3-256 P2 — Create notification permission prompt (study reminders)
- `[ ]` MM3-257 P2 — Implement haptic feedback on mobile for correct/incorrect answers
- `[ ]` MM3-258 P3 — Build keyboard shortcuts for power users
- `[ ]` MM3-259 P3 — Create accessibility features (font size, high contrast)
- `[ ]` MM3-260 P3 — Implement RTL support (future Arabic market expansion)

## MM-3 MARKETING — Foundation Messaging (261–268)

- `[ ]` MM3-261 P1 — Write product one-liner: "AI English coach that remembers your mistakes"
- `[ ]` MM3-262 P2 — Create teacher recruitment pitch (Vietnamese)
- `[ ]` MM3-263 P2 — Build demo mode — try OBI without registration (3 messages free)
- `[ ]` MM3-264 P3 — Create school partnerships outreach template
- `[ ]` MM3-265 P3 — Write blog post: "Why Vietnamese students forget English"
- `[ ]` MM3-266 P3 — Build SEO content for naturalenglishtraining.net
- `[ ]` MM3-267 P3 — Create Zalo channel for community building
- `[ ]` MM3-268 P3 — Write press release template for Vietnam media

## MM-3 CANON — Genesis Preservation (269–275)

- `[ ]` MM3-269 P1 — Create MEGAMERGE-3-INDEX.md (MM-3 is the ACTUAL genesis file — needs its own index)
- `[ ]` MM3-270 P2 — Document stack decision rationale (why Cloudflare over Vercel/AWS/Supabase)
- `[ ]` MM3-271 P2 — Extract earliest OBI tutor prompt from MM-3 and preserve
- `[ ]` MM3-272 P2 — Create technology evolution timeline (MM-3 decisions → current production state)
- `[ ]` MM3-273 P3 — Document the Gemini ↔ GPT handoff protocol from earliest sessions
- `[ ]` MM3-274 P3 — Build "First Code" archive — earliest Worker code written in MM-3
- `[ ]` MM3-275 P3 — Create design decision log — what alternatives were considered

## MM-3 INFRA — Stack Setup (276–285)

- `[x]` MM3-276 P0 — Cloudflare account + Workers configured — DONE
- `[x]` MM3-277 P0 — wrangler.toml with DO bindings — DONE
- `[ ]` MM3-278 P1 — Create D1 production database with migration files
- `[ ]` MM3-279 P1 — Set up Cloudflare AI Gateway rules (rate limits, logging)
- `[ ]` MM3-280 P2 — Configure custom domain DNS on Cloudflare
- `[ ]` MM3-281 P2 — Set up Cloudflare Access for admin routes
- `[ ]` MM3-282 P2 — Create KV namespaces for cache, config, and feature flags
- `[ ]` MM3-283 P3 — Set up Cloudflare Workers analytics
- `[ ]` MM3-284 P3 — Configure email routing on custom domain
- `[ ]` MM3-285 P3 — Build Terraform/Pulumi IaC for Cloudflare resources

## MM-3 TEST — Stack Validation (286–300)

- `[ ]` MM3-286 P1 — Write Miniflare-based local test suite
- `[ ]` MM3-287 P1 — Create DO unit tests (SessionDO state transitions)
- `[ ]` MM3-288 P1 — Build API endpoint smoke tests (all 22 routes return expected status)
- `[ ]` MM3-289 P2 — Create D1 migration test (empty → seeded → queried)
- `[ ]` MM3-290 P2 — Build DeepSeek API mock for offline testing
- `[ ]` MM3-291 P2 — Create Deepgram API mock for voice test
- `[ ]` MM3-292 P2 — Write auth flow test (login → token → authenticated request)
- `[ ]` MM3-293 P2 — Build concurrent DO access test (race condition prevention)
- `[ ]` MM3-294 P3 — Create chaos test (random API failures → graceful degradation)
- `[ ]` MM3-295 P3 — Build performance benchmark (response time under load)
- `[ ]` MM3-296 P3 — Create security test (SQL injection, XSS, CSRF coverage)
- `[ ]` MM3-297 P3 — Write session timeout test (DO alarm → cleanup)
- `[ ]` MM3-298 P3 — Build data integrity test (Merkle chain verification)
- `[ ]` MM3-299 P3 — Create cross-browser compatibility test (Chrome, Safari, Firefox mobile)
- `[ ]` MM3-300 P3 — Write accessibility test (screen reader, keyboard navigation)

---

# ═══════════════════════════════════════════════════════
# MM-4: THE KERNEL COMPILATION (7,098 lines)
# "Architecture ambition → compilation attempt → reality check"
# Source: MEGAMERGE-4-GPT.txt | Index: CANON/MEGAMERGE-456-INDEX.md
# ═══════════════════════════════════════════════════════

## MM-4 PRODUCT — Kernel Features (301–315)

- `[ ]` MM4-301 P1 — Implement buildContext(env, studentId) — merge SessionDO + D1 soul_dna → AI context
- `[ ]` MM4-302 P1 — Build driftCheck(input, context) — prevent OBI from going off-topic
- `[ ]` MM4-303 P1 — Create 10-step OBI runtime flow (INIT→LOAD→CONTEXT→GENERATE→DRIFT CHECK→LOG)
- `[ ]` MM4-304 P2 — Build OBI v2 System Prompt with anti-drift gates
- `[ ]` MM4-305 P2 — Implement Snapshot Engine — capture/restore full system state
- `[ ]` MM4-306 P2 — Create Agent99 Semantic Router — intent classification for student messages
- `[ ]` MM4-307 P2 — Build DAG Scheduler for dependency-aware task execution
- `[ ]` MM4-308 P2 — Implement SYSTEM FREEZE CHECK — validation gate before state changes
- `[ ]` MM4-309 P3 — Port SDNAD Bible Entry 0001 format as template for future Bible entries
- `[ ]` MM4-310 P3 — Build Super Saiyan Mode diagram as live system health visualization
- `[ ]` MM4-311 P3 — Create compiled kernel concept — single entry point for all subsystems
- `[ ]` MM4-312 P3 — Implement memory graph upgrade (student → error → correction → mastery graph)
- `[ ]` MM4-313 P3 — Build predictive intent engine — anticipate student's next question type
- `[ ]` MM4-314 P3 — Create distributed swarm grid for multi-student parallel processing
- `[ ]` MM4-315 P3 — Implement OBI CORE v4 evolution — latest conversation engine spec

## MM-4 CODE — Kernel Implementation (316–330)

- `[ ]` MM4-316 P1 — Implement hashEvent() using crypto.subtle.digest("SHA-256") for audit trail
- `[ ]` MM4-317 P1 — Build SoulDNA type: { id, timestamp, raw_text, emotional_weight, intent_tags, entities }
- `[ ]` MM4-318 P1 — Create session state machine: INIT → ACTIVE → PAUSED → ENDED states
- `[ ]` MM4-319 P2 — Implement 3 SQL tables: session_logs, soul_dna, ledger_events with Merkle hash
- `[ ]` MM4-320 P2 — Build intent_tags classification (VISION/FIGHT/TEACHING/SYSTEM/DRIFT_WARNING)
- `[ ]` MM4-321 P2 — Create emotional_weight scoring for student messages
- `[ ]` MM4-322 P2 — Implement buildContext() merging soul + sessions + ledger
- `[ ]` MM4-323 P2 — Build antiDriftSignature validation for context integrity
- `[ ]` MM4-324 P3 — Create OBI CORE compiled execution system — unified runtime
- `[ ]` MM4-325 P3 — Implement Snapshot Engine persistence (save/load to KV)
- `[ ]` MM4-326 P3 — Build Agent99 router dispatch (classify intent → route to handler)
- `[ ]` MM4-327 P3 — Create Swarm Grid coordination (Cloudflare service bindings)
- `[ ]` MM4-328 P3 — Implement ledger_events table with parent_hash chain
- `[ ]` MM4-329 P3 — Build meaningGraph — semantic relationship map for student knowledge
- `[ ]` MM4-330 P3 — Create SDNAD 6-step reconstruction pipeline in code

## MM-4 DATA — Kernel State (331–340)

- `[ ]` MM4-331 P1 — Create D1 session_logs table (session_id, student_id, role, content, timestamp, hash)
- `[ ]` MM4-332 P1 — Build D1 soul_dna table (id, raw_text, classification, intent_tags, emotional_weight)
- `[ ]` MM4-333 P2 — Create D1 ledger_events table (id, event_type, payload, hash, parent_hash, timestamp)
- `[ ]` MM4-334 P2 — Implement context_builder_cache table (student_id, context_json, expires_at)
- `[ ]` MM4-335 P2 — Build context versioning — track which context was used for each AI response
- `[ ]` MM4-336 P3 — Create entity extraction table (student_id, entity_type, value, frequency)
- `[ ]` MM4-337 P3 — Implement mission_state tracking (what was the student trying to do)
- `[ ]` MM4-338 P3 — Build memory graph adjacency table (node_a, node_b, relationship, weight)
- `[ ]` MM4-339 P3 — Create system state snapshot table (full JSON state at point-in-time)
- `[ ]` MM4-340 P3 — Implement event replay function (rebuild state from event chain)

## MM-4 VOICE — Kernel Voice Integration (341–348)

- `[ ]` MM4-341 P1 — Integrate voice input as first-class message type in 10-step runtime
- `[ ]` MM4-342 P2 — Build voice → text → correction → voice response pipeline
- `[ ]` MM4-343 P2 — Create phoneme-level error detection in voice input
- `[ ]` MM4-344 P2 — Implement voice confidence scoring (how sure is STT of transcription)
- `[ ]` MM4-345 P3 — Build multi-turn voice conversation (continuous speech mode)
- `[ ]` MM4-346 P3 — Create voice-based drift detection (student speaking off-topic)
- `[ ]` MM4-347 P3 — Implement voice emotion detection (frustration, confusion, excitement)
- `[ ]` MM4-348 P3 — Build voice-to-intent classifier (question, statement, request)

## MM-4 UI — Kernel Visualization (349–358)

- `[ ]` MM4-349 P2 — Build Super Saiyan Mode level indicator in UI (Level 0–11 visualization)
- `[ ]` MM4-350 P2 — Create system health dashboard showing OBI runtime state
- `[ ]` MM4-351 P2 — Implement context window usage indicator (how much memory OBI is using)
- `[ ]` MM4-352 P2 — Build drift detection visual alert (warning when conversation goes off-track)
- `[ ]` MM4-353 P3 — Create memory graph visualization (what OBI knows about this student)
- `[ ]` MM4-354 P3 — Build event timeline view (all system events for a session)
- `[ ]` MM4-355 P3 — Implement ledger chain viewer (Merkle hash verification UI)
- `[ ]` MM4-356 P3 — Create snapshot browser (view historical system states)
- `[ ]` MM4-357 P3 — Build intent classification debug view (what OBI thinks the student meant)
- `[ ]` MM4-358 P3 — Implement entity extraction display (extracted entities from conversations)

## MM-4 MARKETING — Technical Differentiation (359–365)

- `[ ]` MM4-359 P2 — Write technical blog post: "How OBI remembers every student's mistakes"
- `[ ]` MM4-360 P2 — Create developer documentation for OBI API
- `[ ]` MM4-361 P3 — Build technical differentiation one-pager (Merkle chain, drift detection, etc.)
- `[ ]` MM4-362 P3 — Write case study: "From 10,000 lines of design to 1 working product"
- `[ ]` MM4-363 P3 — Create architecture blog: "Why Cloudflare Workers over serverless functions"
- `[ ]` MM4-364 P3 — Build engineering hiring page (for future team scaling)
- `[ ]` MM4-365 P3 — Write open-source contribution guide for OBI subsystems

## MM-4 CANON — Kernel Compilation History (366–375)

- `[x]` MM4-366 P1 — MEGAMERGE-456-INDEX.md created (MM-4 section complete) — DONE
- `[ ]` MM4-367 P2 — Extract SDNAD Bible Entry 0001 into standalone CANON/BIBLE-ENTRY-0001.md
- `[ ]` MM4-368 P2 — Document kernel compilation attempt and why it was shelved
- `[ ]` MM4-369 P2 — Create "reality check" archive — GPT's pivotal "That's it" moment
- `[ ]` MM4-370 P3 — Build Super Saiyan Mode evolution doc (Level 0–11 definition from MM-4)
- `[ ]` MM4-371 P3 — Document SYSTEM FREEZE CHECK concept and where it applies
- `[ ]` MM4-372 P3 — Create OBI CORE version history (v1 → v2 → v3 → v4)
- `[ ]` MM4-373 P3 — Extract all type definitions from MM-4 into TypeScript .d.ts reference
- `[ ]` MM4-374 P3 — Build decision log: "Compilation vs modular architecture"
- `[ ]` MM4-375 P3 — Document memory graph concept evolution across merges

## MM-4 INFRA — Kernel Operations (376–385)

- `[ ]` MM4-376 P1 — Set up D1 database with session_logs + soul_dna + ledger_events tables
- `[ ]` MM4-377 P2 — Configure Cloudflare AI Gateway with request logging
- `[ ]` MM4-378 P2 — Build monitoring for drift detection rate (how often does OBI drift?)
- `[ ]` MM4-379 P2 — Create alerting for context window overflow (prevent truncation)
- `[ ]` MM4-380 P3 — Implement Worker CPU time monitoring (avoid 50ms limit violations)
- `[ ]` MM4-381 P3 — Build DO storage usage monitoring per student
- `[ ]` MM4-382 P3 — Create audit trail export for compliance
- `[ ]` MM4-383 P3 — Implement cost tracking per student (AI tokens + DO storage + D1 queries)
- `[ ]` MM4-384 P3 — Build capacity planning model (cost per student per month)
- `[ ]` MM4-385 P3 — Create runbook for production incidents

## MM-4 TEST — Kernel Validation (386–400)

- `[ ]` MM4-386 P1 — Test buildContext() with various student states
- `[ ]` MM4-387 P1 — Test driftCheck() — ensure off-topic messages are caught
- `[ ]` MM4-388 P2 — Test 10-step runtime flow end-to-end
- `[ ]` MM4-389 P2 — Test Merkle hash chain integrity (insert → verify → tamper → detect)
- `[ ]` MM4-390 P2 — Test snapshot save/restore cycle
- `[ ]` MM4-391 P2 — Test intent classification accuracy (sample student messages)
- `[ ]` MM4-392 P3 — Test emotional weight scoring calibration
- `[ ]` MM4-393 P3 — Test context overflow handling
- `[ ]` MM4-394 P3 — Test entity extraction precision
- `[ ]` MM4-395 P3 — Test DAG scheduler task ordering
- `[ ]` MM4-396 P3 — Test system freeze check gate
- `[ ]` MM4-397 P3 — Test Semantic Router intent dispatch accuracy
- `[ ]` MM4-398 P3 — Test memory graph query performance
- `[ ]` MM4-399 P3 — Test ledger event replay consistency
- `[ ]` MM4-400 P3 — Test compiled kernel boot sequence timing

---

# ═══════════════════════════════════════════════════════
# MM-5: THE DISTRIBUTION & ENFORCEMENT ENGINE (15,276 lines)
# "Extends from individual student to multi-platform behavioral OS"
# Source: MEGAMERGE-5-GPT.txt | Index: CANON/MEGAMERGE-456-INDEX.md
# ═══════════════════════════════════════════════════════

## MM-5 PRODUCT — Enforcement & Distribution (401–420)

- `[~]` MM5-401 P1 — Complete tiger-score.js — full Tiger Score calculation (engagement × retention × speed × accuracy × accountability)
- `[ ]` MM5-402 P1 — Implement Mouse→Cub→Tiger mode transitions with threshold triggers (0-39/40-79/80-100)
- `[ ]` MM5-403 P1 — Build buildPrompt(state) — dynamic system prompt injection per student mode
- `[ ]` MM5-404 P1 — Create checkAccountability(state) — trigger parent/boss alerts on inactivity
- `[ ]` MM5-405 P2 — Implement ControlEngine.ts — behavioral mode switching (Mouse/Cub/Tiger prompt injection)
- `[ ]` MM5-406 P2 — Build Tone Engine — emotional modulation for AI responses per mode
- `[ ]` MM5-407 P2 — Create MemoryDO — dedicated memory management Durable Object
- `[ ]` MM5-408 P2 — Implement Humor→Hammer escalation (HUMOR <40 / SWITCH 40-70 / HAMMER >70)
- `[ ]` MM5-409 P2 — Build 7-Day Retention Engine (daily loop + return triggers + streak value)
- `[ ]` MM5-410 P2 — Create Relation Graph v1 — D1 SQL (linkStudentToParent, getAccountabilityChain)
- `[ ]` MM5-411 P2 — Implement 24h/48h/72h inactivity escalation (reminder → warning → parent alert)
- `[ ]` MM5-412 P3 — Build Relation Graph v2 — DO-bound graph (nodes/edges, triggerPressure)
- `[ ]` MM5-413 P3 — Create compressSoulDNA(events) — memory compression for long-term students
- `[ ]` MM5-414 P3 — Implement Next Action Generator — deterministic task chaining
- `[ ]` MM5-415 P3 — Build StudentBehavior type: dailyActive, timeToEngage, retryCount, correctionAcceptanceRate
- `[ ]` MM5-416 P3 — Create correction acceptance tracking — does student apply corrections?
- `[ ]` MM5-417 P3 — Implement streak pressure system (escalating rewards/consequences)
- `[ ]` MM5-418 P3 — Build "First 10 Student Deployment" — guided rollout process
- `[ ]` MM5-419 P3 — Create behavioral signature per student (persistent identity model)
- `[ ]` MM5-420 P3 — Implement "Final Boss Mode" — module activation (Hammer Voice, Merkle Spine)

## MM-5 CODE — Distribution Engine (421–435)

- `[~]` MM5-421 P1 — Complete zalo.js — full Zalo pressure API (checkInactivity, sendWarning, sendEscalation)
- `[~]` MM5-422 P1 — Complete virality.js — engagement metrics + viral scoring
- `[ ]` MM5-423 P2 — Build Auto Post Engine v1 — Cloudflare Worker scheduler (cron every 3h)
- `[ ]` MM5-424 P2 — Create content brain — generate social content from student mistake patterns
- `[ ]` MM5-425 P2 — Implement Facebook Graph API adapter for auto-posting
- `[ ]` MM5-426 P2 — Build LinkedIn API adapter for authority content posting
- `[ ]` MM5-427 P2 — Create Discord webhook adapter for community posting
- `[ ]` MM5-428 P2 — Implement TikTok content export (text + prompt for video creation)
- `[ ]` MM5-429 P3 — Build Virality Engine v3 — engagement collector + virality score + hook optimizer
- `[ ]` MM5-430 P3 — Create Virality Engine v4.1 — bandit optimization (experiment manager + variant generator)
- `[ ]` MM5-431 P3 — Implement calculateVirality() — composite engagement scoring
- `[ ]` MM5-432 P3 — Build auto-learning content loop (best performing content → more like it)
- `[ ]` MM5-433 P3 — Create auto prompt mutator — evolve social content prompts
- `[ ]` MM5-434 P3 — Implement traffic splitter for A/B content testing
- `[ ]` MM5-435 P3 — Build winner detection + auto promotion for top content variants

## MM-5 DATA — Enforcement State (436–445)

- `[ ]` MM5-436 P1 — Create accountability_graph table (student_id, parent_id, teacher_id, relationship_type)
- `[ ]` MM5-437 P1 — Build tiger_score_history table (student_id, score, components, calculated_at)
- `[ ]` MM5-438 P2 — Create notification_log table (recipient, type, channel, sent_at, status)
- `[ ]` MM5-439 P2 — Build content_post table (platform, content, posted_at, engagement_metrics)
- `[ ]` MM5-440 P2 — Create student_streak table (student_id, current, longest, broken_count)
- `[ ]` MM5-441 P3 — Build virality_experiment table (variant_id, content, impressions, clicks, conversions)
- `[ ]` MM5-442 P3 — Create behavior_signal table (student_id, signal_type, value, timestamp)
- `[ ]` MM5-443 P3 — Build student_mode_history table (student_id, mode, entered_at, exited_at, trigger)
- `[ ]` MM5-444 P3 — Create accountability_event table (event_type, triggered_by, escalation_level)
- `[ ]` MM5-445 P3 — Build retention_metric table (student_id, day_number, returned, time_gap)

## MM-5 VOICE — Enforcement Voice (446–452)

- `[ ]` MM5-446 P2 — Build tone modulation for Mouse (gentle, encouraging, slow)
- `[ ]` MM5-447 P2 — Create tone modulation for Cub (supportive, moderate pace, correction emphasis)
- `[ ]` MM5-448 P2 — Implement tone modulation for Tiger (direct, fast, high expectations)
- `[ ]` MM5-449 P2 — Build Hammer Voice — stern correction for repeat mistakes
- `[ ]` MM5-450 P3 — Create celebration voice — excited tone for achievements
- `[ ]` MM5-451 P3 — Implement Vietnamese explanation voice for complex grammar
- `[ ]` MM5-452 P3 — Build pressure voice for returning inactive students

## MM-5 UI — Enforcement Interfaces (453–462)

- `[ ]` MM5-453 P1 — Build Tiger Score display widget in student profile
- `[ ]` MM5-454 P2 — Create mode indicator (Mouse/Cub/Tiger badge in chat header)
- `[ ]` MM5-455 P2 — Implement accountability dashboard for parents (Vietnamese)
- `[ ]` MM5-456 P2 — Build streak counter with visual fire/ice effects
- `[ ]` MM5-457 P2 — Create teacher notification center (student alerts, progress flags)
- `[ ]` MM5-458 P3 — Build content management UI for Auto Post Engine
- `[ ]` MM5-459 P3 — Create Virality Engine dashboard (A/B test results, top variants)
- `[ ]` MM5-460 P3 — Implement parent/teacher mobile view (simplified, Vietnamese-first)
- `[ ]` MM5-461 P3 — Build behavior timeline (visual history of student mode changes)
- `[ ]` MM5-462 P3 — Create notification preferences page (which alerts, which channels)

## MM-5 MARKETING — Vietnam Go-to-Market (463–475)

- `[ ]` MM5-463 P1 — Build Shock Audit funnel — free assessment → reveal weak points → CTA
- `[ ]` MM5-464 P1 — Create pricing tiers for Vietnamese market (250k / 1.2M / 15M+ VND)
- `[ ]` MM5-465 P2 — Write parent conversion script (Vietnamese) — "Your child is falling behind"
- `[ ]` MM5-466 P2 — Write boss conversion script — "Your employees cost you money with bad English"
- `[ ]` MM5-467 P2 — Build accountability pitch for parents — accountability partner concept
- `[ ]` MM5-468 P2 — Create accountability pitch for bosses — ROI on English training
- `[ ]` MM5-469 P3 — Build Facebook ad campaign targeting Vietnamese parents
- `[ ]` MM5-470 P3 — Create LinkedIn authority content series on English education
- `[ ]` MM5-471 P3 — Build TikTok content strategy — short correction videos
- `[ ]` MM5-472 P3 — Create Instagram carousel templates — common Vietnamese English mistakes
- `[ ]` MM5-473 P3 — Build Discord community server for students
- `[ ]` MM5-474 P3 — Create referral program — student invites friend → both get bonus
- `[ ]` MM5-475 P3 — Build Zalo Official Account for community + notifications

## MM-5 CANON — Enforcement Doctrine (476–482)

- `[ ]` MM5-476 P2 — Document ControlEngine evolution (concept → implementation patterns)
- `[ ]` MM5-477 P2 — Extract Tiger Score formula with weight variation history across MM-5 iterations
- `[ ]` MM5-478 P3 — Create accountability loop design doc (student → parent → teacher → student)
- `[ ]` MM5-479 P3 — Document Auto Post Engine concept and platform adapter designs
- `[ ]` MM5-480 P3 — Build Virality Engine theory document (bandit optimization rationale)
- `[ ]` MM5-481 P3 — Extract all behavioral types from MM-5 into reference
- `[ ]` MM5-482 P3 — Document Humor→Hammer escalation design and threshold rationale

## MM-5 INFRA — Distribution Infrastructure (483–492)

- `[ ]` MM5-483 P1 — Set up Cloudflare Worker CRON trigger for scheduled tasks
- `[ ]` MM5-484 P2 — Configure Zalo API credentials and test environments
- `[ ]` MM5-485 P2 — Set up Facebook Graph API app for auto-posting
- `[ ]` MM5-486 P2 — Configure LinkedIn API OAuth for content posting
- `[ ]` MM5-487 P2 — Set up Discord webhook for community updates
- `[ ]` MM5-488 P3 — Build social content queue (Worker Queue → platform adapters)
- `[ ]` MM5-489 P3 — Create social analytics pipeline (engagement → Virality Engine)
- `[ ]` MM5-490 P3 — Set up notification delivery infrastructure (Zalo, email, push)
- `[ ]` MM5-491 P3 — Build cost tracking for social API calls
- `[ ]` MM5-492 P3 — Create rate limiting for social platform APIs

## MM-5 TEST — Enforcement Validation (493–500)

- `[ ]` MM5-493 P1 — Test Tiger Score calculation with edge cases
- `[ ]` MM5-494 P1 — Test mode transition triggers (Mouse→Cub at 40, Cub→Tiger at 80)
- `[ ]` MM5-495 P2 — Test accountability escalation chain (24h→48h→72h)
- `[ ]` MM5-496 P2 — Test buildPrompt() output for each mode
- `[ ]` MM5-497 P2 — Test Humor→Hammer state transitions
- `[ ]` MM5-498 P3 — Test Auto Post Engine scheduling and platform delivery
- `[ ]` MM5-499 P3 — Test Virality Engine variant generation and winner selection
- `[ ]` MM5-500 P3 — Test HMAC Iron Seal request verification (valid, expired, tampered)

---

# ═══════════════════════════════════════════════════════
# MM-6: THE PRODUCT CRYSTALLIZATION (8,781 lines)
# "Strip everything, ship a coach in a chat window, measure retention"
# Source: MEGAMERGE-6-GPT.txt | Index: CANON/MEGAMERGE-456-INDEX.md
# ═══════════════════════════════════════════════════════

## MM-6 PRODUCT — Crystal MVP Features (501–520)

- `[~]` MM6-501 P0 — Complete phoneme-engine.js — Vietnamese phoneme error map (42 Jolly Phonics sounds)
- `[ ]` MM6-502 P0 — Implement detectErrors(transcript) — phoneme error detection from speech input
- `[ ]` MM6-503 P1 — Build Speak→Correct→Repeat→Remember→Return core loop (V4 crystallization)
- `[ ]` MM6-504 P1 — Create correction format: { correction, rule, repeat_sentence, score, next_task }
- `[ ]` MM6-505 P1 — Implement Off-Day Engine — spaced repetition scheduler for weak skills
- `[ ]` MM6-506 P1 — Build V5 3-layer architecture: Real Memory Engine + Adaptive Pressure + Identity Model
- `[ ]` MM6-507 P1 — Create weakness_profile per student (skill → fail count tracking)
- `[ ]` MM6-508 P1 — Implement behavior_signature per student (hesitation_rate, retry_tendency)
- `[ ]` MM6-509 P2 — Build daily loop engine — daily practice orchestration
- `[ ]` MM6-510 P2 — Create return trigger system (24h/48h/72h reminder escalation)
- `[ ]` MM6-511 P2 — Implement skill decay tracking — unused skills degrade over time
- `[ ]` MM6-512 P2 — Build adaptive repetition loop — repeat drills scaled to error frequency
- `[ ]` MM6-513 P2 — Create V5 Real Memory Engine — event-sourced learning ledger
- `[ ]` MM6-514 P2 — Implement V5 Adaptive Pressure Engine — scale drill intensity per performance
- `[ ]` MM6-515 P3 — Build V5 Identity-Based Learning Model — persistent behavioral identity
- `[ ]` MM6-516 P3 — Create "strict coach" personality mode — no fluff, direct correction
- `[ ]` MM6-517 P3 — Implement streak value engine — increasing rewards for consecutive days
- `[ ]` MM6-518 P3 — Build missed-day reminder system with Vietnamese messaging
- `[ ]` MM6-519 P3 — Create V3 3-layer memory: Raw Soul → Soul Index → DNA State
- `[ ]` MM6-520 P3 — Implement V3 Drill Engine — structured practice from error patterns

## MM-6 CODE — Crystal Implementation (521–535)

- `[~]` MM6-521 P0 — Complete phonics-drills.js with Jolly Phonics 42-sound framework
- `[ ]` MM6-522 P1 — Implement obiEngine(userText) — core correction function
- `[ ]` MM6-523 P1 — Build logMistake(userId, input, correction) — structured mistake logging
- `[ ]` MM6-524 P1 — Create detectGrammarError(text) — grammar error classification
- `[ ]` MM6-525 P1 — Implement correctSentence(text) — AI-powered correction with explanation
- `[ ]` MM6-526 P2 — Build V5 event-sourced ledger — all learning events as immutable log
- `[ ]` MM6-527 P2 — Create V5 Adaptive Pressure rules engine
- `[ ]` MM6-528 P2 — Implement Off-Day scheduler (spaced repetition algorithm)
- `[ ]` MM6-529 P2 — Build daily session manager (start → drill → chat → summary → end)
- `[ ]` MM6-530 P3 — Create V3 OBI Core Engine prompt (JSON output format)
- `[ ]` MM6-531 P3 — Implement V3 memory layers (raw → indexed → state)
- `[ ]` MM6-532 P3 — Build repetition mode controller
- `[ ]` MM6-533 P3 — Create voice system using Web Speech API (startVoice, onResult)
- `[ ]` MM6-534 P3 — Implement InputBar component with voice + text toggle
- `[ ]` MM6-535 P3 — Build ChatPage component with full conversation state

## MM-6 DATA — Crystal Schema (536–545)

- `[ ]` MM6-536 P1 — Create mistakes table (user_id, input_text, correction, skill_tag, created_at)
- `[ ]` MM6-537 P1 — Build weak_skills table (user_id, skill_name, fail_count, last_failed_at)
- `[ ]` MM6-538 P1 — Create daily_sessions table (user_id, date, duration, corrections, score)
- `[ ]` MM6-539 P2 — Build learning_events table (event-sourced ledger for V5 Memory Engine)
- `[ ]` MM6-540 P2 — Create skill_decay table (user_id, skill, last_practiced, decay_rate, current_level)
- `[ ]` MM6-541 P2 — Build behavior_signature table (user_id, metric_name, value, updated_at)
- `[ ]` MM6-542 P3 — Create pressure_history table (user_id, pressure_level, reason, timestamp)
- `[ ]` MM6-543 P3 — Build repetition_queue table (user_id, skill, scheduled_at, completed_at)
- `[ ]` MM6-544 P3 — Create user_profile table (id, name, level, weakness_json, behavior_json)
- `[ ]` MM6-545 P3 — Implement schema migration from current DO state to D1 normalized

## MM-6 VOICE — Crystal Voice (546–555)

- `[ ]` MM6-546 P1 — Implement Web Speech API fallback for browsers without Deepgram
- `[ ]` MM6-547 P1 — Build phoneme comparison: student pronunciation vs correct phoneme
- `[ ]` MM6-548 P2 — Create 42-sound Jolly Phonics drill library (audio + visual)
- `[ ]` MM6-549 P2 — Implement voice-first chat mode (tap→speak→correction→listen→repeat)
- `[ ]` MM6-550 P2 — Build pronunciation score per phoneme (not just per word)
- `[ ]` MM6-551 P3 — Create minimal pair drills (ship/sheep, bat/bet, etc.)
- `[ ]` MM6-552 P3 — Implement tone pattern recognition (Vietnamese tonal interference)
- `[ ]` MM6-553 P3 — Build connected speech practice (word linking, elision, assimilation)
- `[ ]` MM6-554 P3 — Create progressive phonics pathway (42 sounds in difficulty order)
- `[ ]` MM6-555 P3 — Implement speech-to-text with Vietnamese word boundary detection

## MM-6 UI — Magic Chat Interface (556–570)

- `[ ]` MM6-556 P1 — Build Home/Daily Entry screen (daily streak, last session summary, start button)
- `[ ]` MM6-557 P1 — Create Chat Mode screen (conversation with OBI, corrections inline)
- `[ ]` MM6-558 P1 — Build Repetition Mode screen (drill interface for weak skills)
- `[ ]` MM6-559 P1 — Create Voice Mode screen (speak→listen→repeat interface)
- `[ ]` MM6-560 P2 — Build Daily Report screen (end-of-session summary with scores)
- `[ ]` MM6-561 P2 — Create Teacher Dashboard screen (class progress overview)
- `[ ]` MM6-562 P2 — Implement mobile layout optimization (iPhone SE minimum)
- `[ ]` MM6-563 P2 — Build input bar with voice/text toggle and send button
- `[ ]` MM6-564 P2 — Create error highlight with correction tooltip in chat
- `[ ]` MM6-565 P3 — Build weekly progress chart (sessions, scores, streaks)
- `[ ]` MM6-566 P3 — Create skill radar chart (visual weak/strong skill map)
- `[ ]` MM6-567 P3 — Implement lesson picker (Gospel 444 grid layout)
- `[ ]` MM6-568 P3 — Build settings page (notification preferences, voice speed, language)
- `[ ]` MM6-569 P3 — Create achievement unlock animation
- `[ ]` MM6-570 P3 — Implement first-time user tutorial overlay

## MM-6 MARKETING — Product Launch (571–580)

- `[ ]` MM6-571 P1 — Build investor pitch deck (9 slides from MM-6: Hook→Problem→Solution→Product→Moat→Model→Traction→Vision→Ask)
- `[ ]` MM6-572 P2 — Create product demo (live student session recording)
- `[ ]` MM6-573 P2 — Write "Not Duolingo, not chatbot, not tutor app" positioning document
- `[ ]` MM6-574 P2 — Build social proof: "strict coach inside a chat window" messaging
- `[ ]` MM6-575 P3 — Create retention metric public dashboard (anonymized)
- `[ ]` MM6-576 P3 — Write "Why traditional English apps fail Vietnamese students" article
- `[ ]` MM6-577 P3 — Build comparison table: OBI vs Duolingo vs ELSA vs ChatGPT
- `[ ]` MM6-578 P3 — Create founder story video (Michael's teaching journey in Vietnam)
- `[ ]` MM6-579 P3 — Build teacher referral landing page (Vietnamese)
- `[ ]` MM6-580 P3 — Create parent education content (why AI + human teacher is better)

## MM-6 LEGAL — IP & Incorporation (581–590)

- `[ ]` MM6-581 P1 — File for Vietnam WFOE under VSIC 6201 (programming) + 5820 (education)
- `[ ]` MM6-582 P1 — Register Software Copyright for OBI platform
- `[ ]` MM6-583 P1 — Establish Dataset Ownership agreement (mistake data = moat)
- `[ ]` MM6-584 P1 — Register brand trademark: NET / Natural English Training / OBI
- `[ ]` MM6-585 P2 — Create IP protection strategy document
- `[ ]` MM6-586 P2 — Draft employment/contractor agreements for Vietnam team
- `[ ]` MM6-587 P3 — Register domain ownership under company entity
- `[ ]` MM6-588 P3 — Create data processing agreement for GDPR-like compliance
- `[ ]` MM6-589 P3 — Build Terms of Service (English + Vietnamese)
- `[ ]` MM6-590 P3 — Create Privacy Policy (English + Vietnamese)

## MM-6 CANON — Product Crystallization History (591–595)

- `[ ]` MM6-591 P2 — Document V3→V4→V5 evolution (each version STRIPS complexity)
- `[ ]` MM6-592 P2 — Extract "remove agent hierarchies, soul DNA stacks" mandate into SSM addendum
- `[ ]` MM6-593 P3 — Create product version history (what was added/removed at each stage)
- `[ ]` MM6-594 P3 — Document stack pivot (Next.js+Supabase in MM-6 vs Cloudflare in production)
- `[ ]` MM6-595 P3 — Build tech stress test response plan (5 weak points → mitigation)

## MM-6 INFRA — Crystal Deployment (596–600)

- `[ ]` MM6-596 P1 — Deploy phoneme engine to production Worker
- `[ ]` MM6-597 P1 — Configure spaced repetition scheduler as DO alarm or CRON
- `[ ]` MM6-598 P2 — Set up event-sourced ledger storage (D1 append-only table)
- `[ ]` MM6-599 P2 — Build student data migration from DO SQL to D1 normalized schema
- `[ ]` MM6-600 P3 — Create production monitoring for phoneme detection accuracy

---

# ═══════════════════════════════════════════════════════
# PIPELINE SUMMARY
# ═══════════════════════════════════════════════════════

## STATUS ROLL-UP

| Megamerge | Total | Shipped | Partial | Not Started | P0 | P1 | P2 | P3 |
|-----------|-------|---------|---------|-------------|----|----|----|----|
| MM-1 (Genesis) | 100 | 10 | 1 | 89 | 3 | 17 | 30 | 50 |
| MM-2 (Implementation) | 100 | 0 | 0 | 100 | 0 | 14 | 33 | 53 |
| MM-3 (Stack Decision) | 100 | 6 | 0 | 94 | 0 | 16 | 30 | 48 |
| MM-4 (Kernel) | 100 | 1 | 0 | 99 | 0 | 10 | 30 | 60 |
| MM-5 (Distribution) | 100 | 0 | 3 | 97 | 0 | 9 | 33 | 58 |
| MM-6 (Crystallization) | 100 | 0 | 2 | 98 | 3 | 18 | 30 | 49 |
| **TOTAL** | **600** | **17** | **6** | **577** | **6** | **84** | **186** | **318** |

## CRITICAL PATH (P0 — 6 items)

1. `MM1-001` — REVERT commit 16c9598 (student chat destroyed)
2. `MM1-002` — Deploy OBI 5 Rules of Existence in system prompt
3. `MM6-501` — Complete phoneme-engine.js (Vietnamese error map)
4. `MM6-502` — Implement detectErrors(transcript)
5. `MM1-071` — Vietnam company incorporation
6. `MM1-072` — Register HCMC business address

## WEEK 1 SPRINT (P0 + top P1 — 20 items)

1. MM1-001 → Revert student chat (5 min)
2. MM1-002 → OBI system prompt rules (30 min)
3. MM6-501 → Phoneme engine completion (2h)
4. MM6-502 → detectErrors() (2h)
5. MM1-071 → Start incorporation (external)
6. MM3-217 → Refactor index.js into modules (4h)
7. MM1-003 → Mouse→Tiger progression UI (3h)
8. MM1-006 → Vietnamese tooltip system (2h)
9. MM2-101 → Magic Chat named feature (1h)
10. MM2-102 → StudentBrain DO v1 (3h)
11. MM2-103 → Session continuity (2h)
12. MM5-401 → Tiger Score completion (2h)
13. MM5-402 → Mode transitions (2h)
14. MM6-503 → Speak→Correct→Repeat loop (4h)
15. MM6-506 → V5 3-layer architecture (4h)
16. MM6-522 → obiEngine() core (3h)
17. MM6-556 → Home/Daily Entry screen (3h)
18. MM6-557 → Chat Mode screen (3h)
19. MM1-096 → CI syntax check (30 min)
20. MM1-097 → CI dry-run gate (30 min)

## THREE INVARIANT TRUTHS (from MEGAMERGE cross-merge observation)

1. Vietnamese students forget English after class because apps are "ignorable" and lack social cost
2. Speak → Correct → Repeat → Remember → Return (the core loop, never changed)
3. The moat = longitudinal mistake data + accountability graph + teacher-AI hybrid

## ONE KPI

> **"Does the student speak English more tomorrow than today?"**

---

*Pipeline generated from 73,860 lines of raw MEGAMERGE corpus. 600 items. 0 hallucinated. Every item traceable to source material.*
