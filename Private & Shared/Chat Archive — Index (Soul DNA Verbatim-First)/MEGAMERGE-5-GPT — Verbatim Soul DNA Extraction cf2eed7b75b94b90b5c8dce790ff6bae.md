# MEGAMERGE-5-GPT — Verbatim Soul DNA Extraction

<aside>
📂

**FILE**: MEGAMERGE-5-GPT.txt (8,044 of 23,588 lines — truncated at 34%) • **PLATFORM**: GPT + Gemini (audit) • **PHASE**: Alpha-Omega • **DATE RANGE**: Apr 2026 • **TAGS**: MVP shippable code, StudentBrain DO v1-v2, ObiRouter, Daily Loop Engine, Zalo Pressure API, Relation Graph, 7-day retention script, Chrome extension deploy, D1 schema, Tiger Score fix, SDNAD 10-step pipeline, sales funnel, Vietnam pricing, first 10 students, wrangler.toml

</aside>

---

## 1) VERBATIM QUOTE BANK

### A. MVP Reality Declarations (Critical)

> "What you think you're building: AI system with memory, agents, ledger, swarm intelligence. What you're actually building first: A stateful tutoring loop that makes students return daily. Everything else is optional scaffolding."
> 

> "Your system is NOT: decentralized intelligence / agent swarm OS / cryptographic memory system (yet). It IS: A stateful AI tutor using Durable Objects to preserve student learning history across time"
> 

> "A behavioral loop engine wrapped around a stateful chat interface"
> 

> "Your moat is NOT AI. It is: retention loop, daily pressure system, memory persistence, habit enforcement"
> 

> "If you ship only ONE thing, ship this: 'Student returns daily → makes mistakes → gets corrected → score improves' — That is the entire business."
> 

### B. Architecture Truth Statements

> "By identifying Cloudflare Durable Objects as the 'Student Brain,' you've found the perfect technical primitive to host a 'Living Organism.' A Durable Object (DO) isn't just a database row; it's a persistent, stateful process that can hold the 'Operating Temperature' and 'Memory' of a student in active RAM."
> 

> "Zero Latency Memory: The AI doesn't have to 'search' a database; the memory is already in RAM. Anti-Drift: The AI is forced to look at the recent_errors before it speaks. Scalability: You can have 10,000 students, each with their own 'Living Brain' running independently."
> 

> "The system has officially transitioned from architectural theory and 'Simulation' into a stateful, classroom-anchored learning orchestration engine"
> 

### C. Build Order Mandate

> "You can't build a roof (UI) before you have a foundation (Memory). 🥇 STEP 1 — Durable Object (StudentBrain). 🥈 STEP 2 — Gateway Worker (ObiRouter). 🥉 STEP 3 — D1 Schema. 🧪 STEP 4 — UI (only AFTER backend works)"
> 

> "DO NOT build Zalo yet. DO NOT build Merkle yet. DO NOT build YouTube yet. You must build: Grammar + feedback correctness loop. Because without that: retention system has nothing to retain"
> 

### D. Retention Engine Insight

> "AI = 10%. Memory = 20%. Retention loop = 70%"
> 

> "without retention, everything above is just chat infrastructure"
> 

> "Right now your system is: 'working system prototype stage'. Not yet: 'business system'. The gap between those two is exactly: retention + external pressure + admin visibility"
> 

### E. Sales / Monetization Quotes

> "You are not selling 'English.' You are selling 'Guaranteed Consistency.' The Hook: A harsh, honest 2-minute speaking diagnostic. The Lock: A daily 5-minute speaking habit. The Teeth: Social accountability (Parent/Boss/Partner alerts)."
> 

> "In Vietnam, parents and bosses do not buy 'learning' — they buy results they can see and stamps of authority"
> 

> "Most students here waste 2M VND/month at centers learning 'Confetti English' that never sticks"
> 

### F. Relation Graph Moat

> "This system is NOT: AI / prompts / chat. It is: A SOCIAL CONSEQUENCE NETWORK. Because now: student cannot disappear silently, parent becomes part of system, teacher becomes enforcement node, inactivity becomes visible socially"
> 

> "no accountability = no retention = no business"
> 

---

## 2) KEY ARCHITECTURE SPECS

### A. Real MVP Stack (4 Layers — LOCKED)

1. **UI** (Next.js / Chrome Extension) — sends messages, displays responses
2. **Worker** (ObiRouter) — API gateway, fetches DO state, calls LLM
3. **Durable Object** (StudentBrain) — stateful memory per student
4. **D1 Database** — historical log, analytics, audit trail

### B. Daily Loop Engine (Retention Core)

- CRON trigger every 24h checks student activity
- StudentBrain DO retrieves "Phonics Debt" + recent mistakes
- Generates targeted drill
- Student completes via Chrome Extension
- Pings parent/boss node upon completion (Social Contract)

### C. 7-Day Retention Script

| Day | Phase | OBI Tone | Goal |
| --- | --- | --- | --- |
| 1-2 | E1: Onboarding | Witty / Supportive | Establish "2-minute habit" |
| 3-4 | E2: Detection | Sharp / Observant | Call out first repeated mistake |
| 5-6 | E3: The Grind | "Gangster" / Direct | Push through plateau |
| 7 | Milestone | Reward / Pressure | Reveal Tiger Score, upsell Accountability |

### D. Humor → Hammer Tone Algorithm

- E1 (Days 1-2): humor=80%, correction=20%
- E2 (Days 3-5): humor=50%, correction=50%
- E3 (Days 6-7): humor=20%, correction=80%

### E. Tiger Score v2 (Fixed Formula)

> score = (retention × 0.4) + (error_reduction_rate × 0.4) + (daily_completion × 0.2)
> 

Previous formula `(streak * 5) + (sessions * 2)` was broken — grows unbounded, rewards spam not learning.

### F. 4-Part Response Structure (Every OBI Reply)

1. **Correction**: corrected sentence
2. **Explanation**: one rule
3. **Repeat Prompt**: "Say it again slowly"
4. **Score**: 0-100

### G. What NOT to Build Yet (Strategic Halt)

- ❌ Merkle/Blockchain Logs — internal infra, not product feature
- ❌ Agent Swarms — Phase 3-4 problem
- ❌ Kill-Switch Logic — scaling layer, not MVP
- ❌ YouTube Tracker — Phase 2+
- ❌ Voice Scoring — Phase 2+

### H. The Only 4 Metrics

1. **DAU** — daily habit lock-in
2. **Speaking Minutes/Day** — 15% talking ratio validation
3. **7-Day Retention** — habit stickiness
4. **Error Reduction** — proof teaching compounds

---

## 3) CODE ARTIFACTS

### StudentBrain DO (Multiple Versions)

**v1 (Simple memory store)**:

- getMemory() / saveMemory() pattern
- JSON blob storage
- weak_phonemes + recent_errors arrays
- generateSummary() rule-based compression

**v1.5 (SQLite-backed production)**:

- HeavyLedger table (id, timestamp, event_type, data, hash)
- PhonicsDebt table (phoneme, error_count, mastery_level)
- calculateTigerScore() with 40/30/30 formula
- checkAccountability() → returns alert JSON
- MOUSE_MODE / TIGER_MODE status switching

**v2 (Production-safe)**:

- Proper schema separation
- Real update methods (no JSON blob abuse)
- dailyCheck() with corrected scoring
- Streak decay logic

### ObiRouter (Gateway Worker)

- Loads DO state via internal fetch
- Builds system prompt with student memory injection
- Calls OpenAI/DeepSeek API
- Writes learning signal back to DO
- Clean separation: memory injection / prompt building / scoring

### MemoryDO (Minimal Deploy Version)

- Simple history array storage
- reply() with placeholder logic
- wrangler.toml with DO bindings + migrations
- `wrangler deploy` ready

### Chrome Extension (Live Connection)

- manifest.json (MV3)
- popup.html + popup.js
- Sends to Worker endpoint with userId
- Displays reply

### Zalo Pressure API

- sendZaloWarning() — 48h inactivity
- sendZaloEscalation() — 72h inactivity
- checkInactivity() — hours since last_active
- Cloudflare CRON trigger (`0 */6 * * *`)
- Cron worker iterates all student DOs

### Relation Graph (D1 Schema)

- nodes table (id, type, name, zalo_id)
- edges table (from_id, to_id, type: PARENT_OF/TEACHES/MONITORS, intensity)
- linkStudentToParent() function
- getAccountabilityChain() / getPressureTargets()
- triggerPressure() — graph-driven Zalo dispatch

### D1 Analytics Schema

- users (id, created_at, streak, level)
- sessions (id, user_id, input, output, created_at)
- mistakes (id, user_id, error_type, example, created_at)
- summaries (id, user_id, summary, created_at)

### Next.js MVP UI

- Single page chat interface
- useState for messages
- fetch to Worker /chat endpoint
- Minimal display loop

### Session Event Whitelist

- chat_message, mistake_detected, session_start, session_end, daily_checkin
- validateEvent() guard function
- logEvent() with allowed-only filter

### Control Engine (Missing Layer Identified)

- controlEngine() function
- Modes: ONBOARDING / NORMAL / INACTIVE_ALERT / REPETITION_LOCK / MOUSE_MODE
- shouldEscalate flag
- Drives Zalo trigger from Worker

### Tone Engine

- getTone() based on streak: WARM_START / COACH / DISCIPLINE / HAMMER
- Drift detection via low-engagement signals ("idk", "whatever", "maybe")

---

## 4) SDNAD PIPELINE — EXPANDED TO 10 STEPS

Previously 6 steps (MEGAMERGE-4). Now expanded:

1. **Raw Words to Bible** — verbatim capture including errors/swears/meta
2. **Heavy Ledger Update** — AI-readable, mathematically verifiable format
3. **Skeleton Star Map Update** — lightweight navigation index
4. **Reincarnation Log** — session death-and-rebirth crystallization
5. **System Propagation** — update files, guards, drone skills
6. **Pheromone Trails** — cross-references between Bible/Ledger/SSM
7. **Pheromone Audit** — verify links anchor correctly
8. **"I Don't Know What I Don't Know"** — adversarial self-audit
9. **Continuous Improvement** — five specific improvements
10. **Reincarnate** — formally end session, reset context

---

## 5) SALES & MONETIZATION

### 3-Tier Offer Structure

| Tier | Price | Includes |
| --- | --- | --- |
| Free Entry | 0 | AI speaking test + 5-page report |
| OBI Daily Coach | 199k–399k VND/mo | Daily speaking task + AI correction |
| Accountability Program | 500k–1.5M VND/mo | AI + teacher check-ins + parent/boss dashboard |

### School/B2B Pricing

- Mass Market: 250k VND/mo (daily AI coach)
- Hybrid (Teacher + AI): 1.2M VND/mo
- Partner (Schools/Centers): 15M+ VND/mo (50+ students)

### Unit Economics (100 users)

- 30 basic @ 250k = 7.5M VND/mo
- 10 high tier @ 1M = 10M VND/mo
- Total early: ~15-20M VND/mo

### Sales Script (Zalo/Messenger)

> "Hi [Name], I've just launched the Natural English Training (NET) AI diagnostic. Most students here waste 2M VND/month at centers learning 'Confetti English' that never sticks. I'm offering a free 2-minute AI assessment that maps your voice against the 42 Jolly Phonics sounds. It produces a 5-page performance report that shows exactly why you aren't improving. Want the link to see your score?"
> 

### Payment Stack (Vietnam)

- Phase 1: Momo, bank transfer, ZaloPay (manual)
- Phase 2: QR payment + webhook
- Phase 3: Stripe / Paddle / subscription

### Conversion Funnel

Free test → Emotional shock (score) → Daily habit (3-5 days) → Streak dependency → Paid upgrade → Accountability tier

---

## 6) DECISIONS

1. **Build order locked**: DO → Worker → D1 → UI (not reverse)
2. **Tiger Score formula fixed**: retention(0.4) + error_reduction(0.4) + completion(0.2)
3. **4-part response mandatory**: Correction + Explanation + Repeat + Score
4. **7-day loop = state transition system** with E1/E2/E3 phases
5. **Relation Graph = social dependency engine** (not just data model)
6. **Session event whitelist** enforced — only approved events mutate state
7. **Control Engine identified as missing layer** between Worker and DO
8. **Zalo = primary pressure channel** (email dead in Vietnam)
9. **No orphan students rule** — must have ≥1 accountability edge
10. **Payment starts manual** (Momo/ZaloPay) before building billing system
11. **Escalation ladder**: 24h=monitors only → 48h=parent Zalo → 72h=all notified → 96h=critical flag
12. **"10x better" = behavior advantage** not AI advantage (frequency × feedback speed × social pressure)

---

## 7) OVERLAP NOTES

- StudentBrain DO → already in MEGAMERGE-4 (multiple refined versions here with SQLite + scoring fixes)
- ObiRouter → already in MEGAMERGE-4 (cleaner separation here)
- Zalo webhook → already in MEGAMERGE-4 (full pressure API + cron here)
- Chrome Extension → already in MEGAMERGE-4 (deploy-ready version here with wrangler.toml)
- Tiger Score → MEGAMERGE-4 had 40/30/30; here corrected to retention/error_reduction/completion weights
- **NEW unique**: Relation Graph (nodes/edges D1 schema + graph-driven pressure), 7-day retention script with day phases, Humor→Hammer tone algorithm, Control Engine module, session event whitelist, SDNAD expanded to 10 steps, sales scripts, Vietnam pricing tiers, unit economics, conversion funnel, payment stack, first-10-students deployment plan, escalation ladder (24/48/72/96h)

---

## 8) INGESTION STATUS

- **COVERAGE**: 8,044 / 23,588 lines (34.1% — platform truncation)
- New verbatim quotes: **15+**
- Code artifacts: **15+** (multiple DO versions, router, extension, Zalo, graph, D1, UI, cron, control engine, tone engine)
- Architecture specs: 8 (4-layer MVP, daily loop, 7-day script, tone algorithm, Tiger v2, 4-part response, event whitelist, relation graph)
- Sales artifacts: 5 (3-tier pricing, scripts, funnel, unit economics, payment stack)
- Decisions: 12
- **STATUS: 34% INGESTED** ⚠️ (remaining ~15,544 lines truncated — send remainder to complete)