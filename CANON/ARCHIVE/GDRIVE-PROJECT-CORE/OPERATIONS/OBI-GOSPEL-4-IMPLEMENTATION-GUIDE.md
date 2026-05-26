# OBI System — Gospel 4:4:4 Implementation Guide

**Version:** 2.0  
**Rendering:** Heaven → Earth → Infrastructure → Underworld → Persistence  
**Status:** LOCKED (Executive Phase)  
**Date:** April 19, 2026  

---

## SYSTEM DEFINITION (ONE SENTENCE)

> **OBI is a hierarchical learning continuity engine where founder intent (Heaven) flows through product reality (Earth) to infrastructure orchestration (Infrastructure), enforced via accountability networks (Underworld), and persisted through immutable memory (Persistence).**

---

## LAYER 1: HEAVEN (Founder Authority)

**What:** The Constitutional Layer — where system rules originate and never degrade.

### 🧬 Soul DNA (System Constitution)
- Michael Hobbs' 6 Teaching Laws (immutable)
- "No Freezy Rule" — never shame
- "Immediate Correction" — fix in real-time
- "Short Responses" — clarity first
- "The Deal" — 30 minutes is sacred
- "Keep Character" — OBI stays grounded
- **Owner:** Michael Hobbs (Founder)
- **Enforceable:** YES (non-negotiable feature gate)

### 👑 Gospel 444 (Michael's Intent)
- **Level 1 — WHY:** Teach real students, stop learning loss, build accountability
- **Level 2 — HOW:** Chrome → Web Speech → Local AI → Cloud reasoning → Memory
- **Level 3 — WHAT:** Voice tutor + dashboard + enforcement
- **Level 4 — NETWORK:** Daily return → Teacher sees → External pressure → Better class
- **Owner:** Michael Hobbs (Founder Philosophy)
- **Enforceable:** YES (architecture must follow this pattern)

### 🎯 Anti-Drift Rules (Non-Negotiable)
Feature is **INVALID** if it:
- [ ] Does not increase speaking frequency
- [ ] Does not improve return rate
- [ ] Does not strengthen weakness targeting
- [ ] Does not improve learning continuity
- [ ] Makes OBI feel generic instead of grounded

**Owner:** System Governance  
**Enforcer:** Architecture Review Board (Michael + CTO)  
**Cadence:** Weekly feature audit

### 🔐 Immutable Doctrine (Truth Source)
- Everything below this layer is implementation detail, not intent
- If a feature passes Anti-Drift Rules, it is allowed
- If a feature fails Anti-Drift Rules, it is **rejected immediately**
- LedgerDO (Persistence Layer) serves as permanent truth audit

**Owner:** Soul DNA Ledger  
**Enforcer:** LedgerDO verification system  

---

## LAYER 2: EARTH (Product Reality)

**What:** How humans experience OBI — the interface and the daily loop that determines retention.

### 📱 Voice Interface (Chrome + Web Speech)
**Responsibility:** Zero-friction input/output

- Web Speech API (STT) — native browser tech, zero latency
- Speech Synthesis (TTS) — high-quality natural voice
- No typing barrier — speaking is the entire UX
- Mobile responsive (responsive design)
- Offline capability via Gemini Nano (Phase 2)

**Metrics:**
- Input latency: < 200ms
- Output latency: < 500ms
- Uptime: 99.5%

**Owner:** Frontend Team  
**Success:** Users prefer speaking to typing (measure: speech % vs typing %)

---

### 🧠 OBI Agent (Natural Correction)
**Responsibility:** Deliver corrections that feel like Michael teaching, not AI lecturing

**Constraints:**
- Never generic ("You said wrong, correct it")
- Never long-winded (max 2 sentences per correction)
- Never shaming (redirect, don't punish)
- Always target the specific weakness
- Always include "why it matters"

**Pattern:**
```
CORRECTION: "We say: I think THESE ideas are difficult"
WHY: "The 'th' sound is pronounced between your teeth"
DRILL: "Repeat: these, that, this, thought"
NEXT: "Try again with the full sentence"
```

**Owner:** Prompt Engineering Team  
**Success:** Student feels heard and helped (measure: session completion rate)

---

### 🎮 Daily Loop (Speak → Correct → Repeat)
**Responsibility:** Psychological engine that makes returning inevitable

**Sequence:**
1. Student opens app (morning notification trigger)
2. OBI greets them by name + shows streak
3. "Your weakness today: [TH_SOUND]"
4. Student speaks (30 seconds of practice)
5. OBI corrects + explains
6. Drill task (3 repetitions)
7. Streak increments by 1
8. Next task previewed
9. Session closes with engagement hook

**Duration:** 3–7 minutes (not a 2-hour grind)  
**Frequency:** Daily (same time if possible)  
**Consequence:** Streak goes to 0 if missed (psychological pressure)

**Owner:** Product Manager  
**Success:** 7-day retention > 60%, 30-day retention > 40%

---

### 📊 Streak System (Psychological Hook)
**Responsibility:** Make visible progress the primary reward

**Mechanics:**
- Starts at 0
- +1 for each day of practice (consecutive)
- Resets to 0 if day is missed
- Visible on home screen (bold, large number)
- Accessible to accountability partners
- Monthly milestones trigger badges (7-day, 30-day, 60-day, 100-day)

**Psychology:**
- Sunk cost (don't want to break a 15-day streak)
- Social comparison (boss/parent see it)
- Gamification (visible progress)

**Owner:** Engagement Team  
**Success:** Users voluntarily return on day 2 (measure: 1-day retention = 85%)

---

## LAYER 3: INFRASTRUCTURE (Edge + Reasoning)

**What:** The orchestration brain that connects product reality to memory persistence.

### ☁️ Cloudflare Workers (Router Brain)
**Responsibility:** Route requests, inject context, orchestrate model calls

**Current Routes (17 active):**
```
GET  /api/health
POST /api/chat
POST /api/onboarding
POST /api/lesson
POST /api/practice
POST /api/feedback
POST /api/netpet/checkin
GET  /api/netpet/state
POST /api/classroom/session/start
POST /api/classroom/event
GET  /api/classroom/session
GET  /api/classroom/report
POST /api/session/log
GET  /api/session/latest
POST /api/soulDNA
GET  /api/soulDNA
GET  /api/digest
```

**Flow:**
```
Request
  ↓
Parse + Validate
  ↓
Load ProfileDO (student identity)
  ↓
Load SessionDO (active state)
  ↓
Load LedgerDO (verification)
  ↓
Inject OBI_SYSTEM_PROMPT (Soul DNA)
  ↓
Call Model Layer (DeepSeek)
  ↓
Format Response
  ↓
Update Memory (all DOs)
  ↓
Return to Client
```

**Performance Targets:**
- P50 latency: < 500ms
- P99 latency: < 2s
- Error rate: < 0.1%
- Cache hit rate: > 70% (Context Cache)

**Owner:** Backend Team  
**Success:** 99.5% uptime, < 500ms P50

---

### 🤖 DeepSeek V3.2 (Reasoning Engine)
**Responsibility:** Generate corrections, lessons, and conversational intelligence

**Model Configuration:**
- Model: DeepSeek V3.2 (or equivalent)
- Inference Cost: ~$0.14 / 1M tokens
- Context Window: 64K tokens
- Temperature: 0.7 (balanced creativity + consistency)
- Max Tokens Per Response: 300

**Used For:**
- Student correction generation
- Weakness explanation
- Drill task creation
- Lesson planning
- Teacher insight synthesis

**Constraints:**
- Never multi-turn conversation without StudentDO context
- Never suggest features not in Anti-Drift Rules
- Never generate "generic" corrections
- Always reference student's specific weakness history

**Owner:** ML/Data Team  
**Success:** 95%+ correction quality (measured via teacher audit)

---

### 💾 Durable Objects (State Machine)
**Responsibility:** Persistent, low-latency student state storage

**Four State Machines:**

#### ProfileDO (Who You Are)
```
struct Profile {
  studentId: string
  email: string
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  joinDate: timestamp
  totalSessions: number
  totalMinutes: number
  weakPoints: string[]  // sorted by severity
  progressTier: "mouse" | "cub" | "tiger"
  lastActive: timestamp
}
```

#### SessionDO (What Happened)
```
struct Session {
  sessionId: string
  studentId: string
  classContext: string  // which class this is tied to
  input: string
  corrected: string
  mistakes: string[]
  explanation: string
  drill: string
  duration: number  // seconds
  successful: boolean
  timestamp: timestamp
}
```

#### PetDO (Behavioral State)
```
struct Pet {
  studentId: string
  streak: number  // day counter
  lastCheckIn: timestamp
  level: "egg" | "hatchling" | "young" | "adult"  // motivational tier
  totalCheckIns: number
  energy: number  // 0-100
  mood: "thriving" | "stable" | "struggling"
  milestones: { 7: true, 30: false, 60: false, 100: false }
}
```

#### LedgerDO (Immutable Truth)
```
struct LedgerEntry {
  timestamp: timestamp
  studentId: string
  eventType: "session_complete" | "streak_change" | "milestone" | "escalation"
  payload: object  // full data for audit
  hash: string  // cryptographic proof
  previousHash: string  // chain integrity
}
```

**Owner:** Database Team  
**Success:** < 50ms read latency, 100% write consistency

---

### 📈 Context Caching (Cost Optimization)
**Responsibility:** Reduce token cost via smart context reuse

**Strategy:**
- Student's ProfileDO (rarely changes) = cached
- Recent 5 sessions (weak points) = cached
- OBI system prompt (immutable) = cached
- Result: 70-90% of request input is cached = 90% cost reduction

**Math:**
- Without caching: 1000 tokens/request × $0.14/M = $0.00014 per request
- With caching: 100 tokens/request (just new input) × $0.14/M = $0.000014 per request
- Savings: 90% of model cost

**Owner:** Infra Team  
**Success:** < $0.005 per student per day

---

## LAYER 4: UNDERWORLD (Accountability Network)

**What:** The social pressure layer that prevents skipping and creates external consequence.

### 👨‍🏫 Teacher Dashboard (Visibility Loop)
**Responsibility:** Show teachers their students' practice data

**Access:**
- Class roster with practice status
- Individual student session history (last 30 days)
- Top 3 weak points per student
- Streak status (at risk vs thriving)
- Optional: Drill recommendations

**Actions:**
- Mark student as "needs attention"
- Add notes for next class
- Send reminder via Zalo (Phase 2)

**Owner:** Teacher Onboarding Team  
**Success:** 80%+ of teachers log in weekly

---

### 👔 Boss/Parent Access (Social Pressure)
**Responsibility:** Create external accountability through people who matter

**Access Types:**

**Parent Mode:**
- Child's session summary (last 7 days)
- Streak status + motivation level
- Weak points needing focus
- Encouragement message template

**Boss Mode (Corporate Training):**
- Employee practice compliance (hours/week)
- ROI calculation (practice hours → speaking improvement)
- Team comparison (anonymized)
- Billing + seat usage

**Constraints:**
- Opt-in (student/parent agree explicitly)
- View-only (no editing student data)
- Privacy-first (no eavesdropping)

**Owner:** Accountability Product Manager  
**Success:** 50%+ of users attach an accountability partner

---

### 📋 Compliance Tracking (Ledger Truth)
**Responsibility:** Record participation + show who's actually practicing

**Tracked Metrics:**
- Daily check-in (yes/no)
- Session duration (minutes)
- Mistakes completed (count)
- Streak status (current number)
- Weakness progress (before/after severity)

**Visibility:**
- Student: sees own progress
- Teacher: sees class aggregate + individual
- Boss/Parent: sees assigned person's data
- System: audit trail in LedgerDO

**Owner:** Analytics Team  
**Success:** 100% of sessions recorded, zero data loss

---

### 🎖️ Escalation Signals (Consequence)
**Responsibility:** Make skipping visible to stakeholders

**Escalation Triggers:**

**Level 1 (Day 1 Miss):** Silent (streak resets, user sees it)

**Level 2 (Day 3 Miss):** Optional notification to accountability partner
- "Your [student/employee] has not practiced in 3 days"
- "Their [weakness name] is getting worse"

**Level 3 (Week 1 Miss):** Teacher gets alert
- "Student [name] has missed entire week"
- "Recommend check-in at next class"

**Level 4 (Month Miss):** Parent/Boss gets alert
- "No practice for 30 days"
- "Please follow up"

**No Harassment:** Escalation is informational, not punitive. OBI doesn't nag; stakeholders do.

**Owner:** Growth/Retention Team  
**Success:** 80% of escalations result in user returning within 2 days

---

## LAYER 5: PERSISTENCE (Memory Foundation)

**What:** The immutable foundation where all truth lives — the moat against forgetting.

### 👤 ProfileDO (Who You Are)
**Time Horizon:** Entire learning journey (6+ months to years)

**Contains:**
- Student identity + email
- Current language level
- Total practice record (never deleted)
- Top 10 historical weak points
- Progression tier (Mouse → Cub → Tiger)

**Immutability:** CAN update level/weak points, CANNOT delete historical record

**Owner:** Profile Management System  
**Truth:** Ground of record for student identity

---

### 🎓 SessionDO (What Happened)
**Time Horizon:** 90 days rolling window

**Contains:**
- Every correction session (input + output)
- Mistakes caught + targeted
- Explanation provided
- Drill task assigned
- Timestamp + duration

**Immutability:** APPEND-ONLY (never edit, never delete)

**Purpose:** 
- Weekly 90-day retention shows what student has practiced
- Trainers can audit "did we cover this 3 weeks ago?"
- LedgerDO references these for audit proof

**Owner:** Session Management System  
**Truth:** Ground of record for what was taught

---

### 🐾 PetDO (Behavioral State)
**Time Horizon:** 30-day rolling window (resets monthly)

**Contains:**
- Current streak (day counter)
- Motivation level (thriving/stable/struggling)
- Milestones hit this month (7-day, 30-day badges)
- Energy score (0-100, regenerates daily)
- Mood indication

**Immutability:** UPDATES DAILY (lossy data, not audit-critical)

**Purpose:**
- Psychological reinforcement (see your accomplishments)
- Gamification (milestones feel real)
- Motivation tracking (alert if mood = struggling)

**Owner:** Engagement System  
**Truth:** Ground of record for motivation state

---

### 📖 LedgerDO (Immutable Truth)
**Time Horizon:** FOREVER (blockchain-style append-only)

**Contains:**
- Every event: session_complete, streak_change, milestone, escalation
- Cryptographic hash of each entry
- Chain of custody (cannot tamper)
- Timestamps + context

**Immutability:** STRICTLY APPEND-ONLY (no edits, no deletes, ever)

**Purpose:**
- Audit trail (prove system never drifted into generic tutoring)
- Governance verification (show Soul DNA was respected)
- Data integrity proof (prove no manipulation)
- Investor confidence (system has real records)

**Query Examples:**
```
"Show all sessions where OBI corrected 'th_sound'" → 47 sessions
"Show all weeks where student missed 3+ days" → 2 weeks
"Verify no generic corrections were given" → 100% specific
"Prove streak system worked as intended" → ledger shows 15-day streak
```

**Owner:** Ledger + Governance Team  
**Truth:** Unbreakable system of record

---

## DATA FLOW (COMPLETE CYCLE)

```
1. Student opens app (9 AM)
   ↓
2. Browser loads /api/chat
   ↓
3. Cloudflare Worker receives request
   ↓
4. Load ProfileDO → Level: B1, WeakPoint: "th_sound", Streak: 5
   ↓
5. Load SessionDO → Last session: yesterday, 4 min duration, 2 mistakes
   ↓
6. Load PetDO → Mood: thriving, Energy: 80/100
   ↓
7. Load LedgerDO → Last 5 entries (verification)
   ↓
8. Inject OBI_SYSTEM_PROMPT (Soul DNA):
   - "No Freezy", "Immediate Correction", "Keep Character"
   ↓
9. Build context:
   - "Student speaks with [th_sound] weakness, streak at 5 days"
   - "Previous corrections show pattern: forgets with rapid speech"
   - "Recommend: slow-down drill + repetition"
   ↓
10. Call DeepSeek with merged prompt:
    Input: "I think sink is difficult"
    ↓
11. DeepSeek returns:
    {
      correction: "We say: I think THE sink is difficult",
      why: "The 'th' sound is pronounced between teeth",
      drill: "Repeat: think, sink, thank, thick",
      severity: 0.7
    }
   ↓
12. Worker updates memories:
    - SessionDO ← Add this correction
    - PetDO ← Increment streak
    - ProfileDO ← Update severity
    - LedgerDO ← Append event hash
   ↓
13. Format response for TTS:
    "We say: I think THE sink is difficult.
     The 'th' sound is pronounced between your teeth.
     Now repeat after me: think, sink, thank, thick"
   ↓
14. Return to browser
   ↓
15. Web Speech TTS reads correction aloud
   ↓
16. Student repeats drill (3 times)
   ↓
17. Streak becomes 6
   ↓
18. Teacher sees: [Student Name] practiced 4 min today
   ↓
19. Next day same time: notification "Your 6-day streak is waiting!"
```

**Total time:** < 1 second  
**Total cost:** < $0.005  
**Data integrity:** 100% (all layers written)

---

## PHASE BREAKDOWN (GOSPEL 4 PHASES)

### PHASE 1: Retention Proof (CRITICAL - Now → Week 2)
- [ ] Daily task generator (target 1 weakness/day)
- [ ] Voice correction loop (< 500ms)
- [ ] Streak visualization (prominent + bold)
- [ ] PetDO behavioral state (mood tracking)
- [ ] Test with 10 real students

**Success Metric:** 7-day retention > 60%

### PHASE 2: Accountability Pressure (Week 3-4)
- [ ] Teacher dashboard (class roster view)
- [ ] Escalation logic (day 3, day 7, day 30 miss alerts)
- [ ] Parent/Boss login (opt-in)
- [ ] Compliance tracking (linked to LedgerDO)

**Success Metric:** 30-day retention > 40%

### PHASE 3: Social Proof Loop (Week 5-6)
- [ ] Parent reporting (downloadable PDFs)
- [ ] Classroom comparison (anonymized)
- [ ] Milestone badges (7-day, 30-day, 60-day)
- [ ] Zalo integration (optional notifications)

**Success Metric:** 30-day active users x 1.5 (referral growth)

### PHASE 4: Governance Hardening (Week 7+)
- [ ] Ledger verification automation
- [ ] Soul DNA audit reports
- [ ] Anti-drift monitoring (weekly alert to CTO)
- [ ] Investor-grade security audit

**Success Metric:** System audit shows 0% drift from Anti-Drift Rules

---

## GOVERNANCE RULES (LOCKED)

**Daily (Every 24h):**
- [ ] Check: Any session shows generic correction? → Alert
- [ ] Check: Any day user marked inactive but streaked? → Audit
- [ ] Check: PetDO mood = struggling for 3+ days? → Escalate

**Weekly (Every 7 days):**
- [ ] Audit RandomSample(10%) of sessions vs OBI_SYSTEM_PROMPT
- [ ] Review all new Anti-Drift Rule violations → Reject feature
- [ ] Inspect LedgerDO chain for hash integrity

**Monthly (Every 30 days):**
- [ ] Generate compliance report for investors
- [ ] Run full LedgerDO verification
- [ ] CTO reviews system against Gospel 444 requirements

---

## SUCCESS METRICS (GOSPEL 4 COMPLIANCE)

### LEVEL 1 — WHY (Mission)
- ✅ Students return daily (measure: 1-day retention = 85%+)
- ✅ Stop learning loss (measure: weak point severity decreases week/week)
- ✅ Accountability is enforced (measure: 80%+ have accountability partner)

### LEVEL 2 — HOW (System)
- ✅ Voice input works (measure: < 200ms latency)
- ✅ OBI corrects immediately (measure: < 500ms end-to-end)
- ✅ Memory persists (measure: 100% of sessions stored)

### LEVEL 3 — WHAT (Product)
- ✅ Correction quality (measure: 95%+ teacher approval)
- ✅ Daily loop completes (measure: avg 5 min per session)
- ✅ Streak is visible (measure: 90%+ notice streak counter)

### LEVEL 4 — NETWORK (Impact)
- ✅ Teachers see progress (measure: 80%+ teacher engagement)
- ✅ External pressure works (measure: 50%+ have accountability partner)
- ✅ Next class impacts previous learning (measure: 70% fewer repeat mistakes)

---

## ANTI-TAMPERING COMPLIANCE

**OBI cannot degrade into generic AI tutoring because:**

1. **Soul DNA layer** prevents changes without Michael approval
2. **Anti-Drift Rules** reject features immediately
3. **LedgerDO** records every change (immutable)
4. **Weekly audits** detect drift automatically
5. **Governance loop** (Layer 5 → Layer 1) enforces doctrine

**Investor Confidence:** This system is **architecturally incapable** of becoming another generic EdTech app.

---

**Status:** LOCKED SPECIFICATION  
**Last Updated:** April 19, 2026  
**Next Review:** May 19, 2026  
**Owner:** Michael Hobbs (Founder)  

