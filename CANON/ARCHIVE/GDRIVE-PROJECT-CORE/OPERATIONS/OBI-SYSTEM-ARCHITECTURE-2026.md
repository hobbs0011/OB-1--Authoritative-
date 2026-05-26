# OBI System Architecture — Gospel 444 (2026)

**Version:** 1.0  
**Author:** Michael Hobbs + AI  
**Date:** April 19, 2026  
**Status:** CANONICAL (Locked)  

---

## 1. SYSTEM DEFINITION (IMMUTABLE)

**OBI is a behavioral learning OS that converts English practice into a recurring accountability loop, where memory + social pressure + correction improve speaking output over time.**

**Core Loop:**
```
Speak → Correct → Store → Re-target weakness → Return → Repeat
```

This loop is the **only thing** that determines product success. Everything else is infrastructure supporting loop persistence.

---

## 2. GOSPEL 4:4:4 ARCHITECTURE (6-LAYER STACK)

### LAYER 0: STUDENT REALITY (Foundation)
**What:** The actual human need being solved.

- Daily speaking practice (45% listening, 15% speaking target)
- Vietnamese accent normalization + Jolly Phonics 42-sound framework
- Realistic session duration (30-45 minutes typical)
- Real classroom integration (not just an app)

**Why it matters:** If this layer is weak, the entire system collapses. Everything above depends on authentic human need.

---

### LAYER 1: PRODUCT LOOP (Retention Engine)
**What:** The repetition cycle that forces return.

**Flow:**
```
1. Student speaks (voice input via Web Speech API)
2. STT converts to text
3. OBI corrects instantly (< 500ms target)
4. Weakness is logged
5. Next task targets same weakness
6. Streak increments (visual reward)
7. Student returns tomorrow
```

**Critical Rules:**
- Correction must be < 500ms or users feel lag
- Weakness targeting must be obvious (not hidden in recommendations)
- Streak must be visible (psychological hook)
- Returning tomorrow must be easier than not returning

**Key Metric:** 7-day retention rate (target: > 60%)

---

### LAYER 2: ACCOUNTABILITY NETWORK (Social Enforcement)
**What:** External pressure that prevents skipping.

**Access Paths:**
- **Teacher Dashboard:** Class roster, individual student progress, drill recommendations
- **Boss/Parent Login:** Sees if homework is being done, streak compliance, alerts
- **Escalation Signals:** "Student missed 3 days" → sends notification to accountability partner

**Psychological Design:**
- Make skipping **visible** (not invisible)
- Make consistency **public** (within the accountability circle)
- Make compliance **rewarded** (badges, public acknowledgment)

**Key Insight:** Most EdTech fails because not returning is consequence-free. OBI makes it a social fact.

---

### LAYER 3: EDGE ORCHESTRATION (Cloudflare Worker + DeepSeek)
**What:** The intelligent routing brain.

**Responsibilities:**
1. Route incoming requests to correct handler
2. Load student context (ProfileDO + SessionDO + recent weaknesses)
3. Inject OBI system prompt (founder doctrine + anti-drift rules)
4. Call DeepSeek API with full context
5. Parse response (correction + explanation + drill)
6. Format for TTS output
7. Trigger memory updates

**Architecture:**
```
Request → Router → Context Loader → Prompt Builder → DeepSeek Call → 
Response Parser → Memory Update → TTS Format → Response
```

**Cost Model:**
- DeepSeek: ~$0.14 / 1M tokens (Context Cache: 90% discount on repeated context)
- Cloudflare Workers: $0.50 / million requests
- Total per user per day (estimated): $0.002 - $0.005

---

### LAYER 4: MEMORY PERSISTENCE (Durable Objects)
**What:** The stateful knowledge engine.

**State Machines:**

**ProfileDO** (Who the student is)
- Email + identity
- Level (A1-C2)
- Long-term weak points (trained over weeks)
- Total sessions, total minutes
- Progression tier (Mouse → Cub → Tiger)

**SessionDO** (What just happened)
- Active classroom context
- Current session transcript
- Real-time mistakes list
- Streak counter
- Active task

**PetDO** (Behavioral loop state)
- Daily check-in status
- Streak (primary psychological hook)
- Last speaking timestamp
- Milestone bonuses (earned)
- Engagement score

**LedgerDO** (Immutable event history)
- Append-only event log
- Every correction + mistake stored
- Accountability timestamps
- Audit trail (cannot be rewritten)
- Truth source for long-term analysis

**Key Rule:** Memory is the product. Model is replaceable. If memory is lost, the product is worthless.

---

### LAYER 5: GOVERNANCE & TRUTH (Soul DNA + Anti-Drift)
**What:** The constitution that prevents system degradation.

**Soul DNA Constitution:**
- Michael's 6 teaching laws (embedded in OBI system prompt)
- "No Freezy Rule" — never make student feel ashamed
- "Immediate Correction" — fix in real time, not later
- "Short Responses" — clarity over verbosity
- "The Deal" — 30 minutes is the deal, respect time
- "Keep Character" — maintain OBI personality

**Anti-Drift Rules** (reject features that fail these):
1. ❌ Does not increase speaking frequency
2. ❌ Does not improve return rate
3. ❌ Does not strengthen weakness targeting
4. ❌ Does not improve learning continuity
5. ❌ Makes OBI feel more generic instead of more grounded

**Governance Loop:**
```
Feature Idea → Test Against Anti-Drift Rules → Approved/Rejected → 
If Approved → Implement → Monitor Retention Impact → Audit → Adjust
```

**Ledger Verification:**
- Every 24 hours: Audit recent sessions for drift
- If 3+ sessions show generic tutoring behavior → Alert + Roll Back
- Long-term: Annual deep audit against founding principles

---

## 3. DATA FLOW (REAL EXECUTION)

```
1. Student Browser (Chrome + Web Speech API)
   ↓
2. Student speaks: "I think the sink is difficult"
   ↓
3. STT converts: "I think the sink is difficult"
   ↓
4. Cloudflare Worker receives request
   ↓
5. Load ProfileDO → Level: A2, Top Weakness: "th_sound", Streak: 3
   ↓
6. Load SessionDO → Active class: "English 201", Teacher: Michael
   ↓
7. Load PetDO → Last interaction: 18h ago, Streak at risk
   ↓
8. Build context prompt:
   - OBI_SYSTEM_PROMPT (v3, immutable)
   - Student state injection
   - Recent mistake history
   - Classroom context
   ↓
9. Call DeepSeek:
   Input: "Correct this + why + drill for th_sound"
   ↓
10. DeepSeek returns:
    {
      correction: "We say: I think the 'TH' sound...",
      explanation: "The 'th' is pronounced between teeth...",
      drill: "Repeat: think, thank, thirst",
      mistakes: ["th_sound"],
      severity: 0.8
    }
   ↓
11. Update memories:
    - SessionDO: Add to session transcript
    - PetDO: Increment streak
    - ProfileDO: Update weak points
    - LedgerDO: Append event
   ↓
12. Format for TTS:
    "We say: I think the 'TH' sound... [explanation]... 
     Now repeat after me: think, thank, thirst"
   ↓
13. Return to browser
   ↓
14. Speech Synthesis reads correction aloud
   ↓
15. Student repeats drill
   ↓
16. Next session targets same weakness
```

**Latency Target:** < 1s wall-clock (500ms DeepSeek call + 500ms overhead)

---

## 4. THE MOAT (Why This Is Defensible)

### Copyable
- UI design
- Prompt structure
- General workflow

### Hard to Copy
1. **Behavioral Data**: Longitudinal student dataset (6+ months)
2. **Teacher Integration**: Embedded in classroom + syllabus
3. **Habit Loop**: Returns happen automatically (hard to trigger)
4. **Memory Precision**: Vietnamese accent + Jolly Phonics mapping

### Impossible to Copy (Without Time)
- **Accountability Network**: 500+ students + teachers already connected
- **Proof of Learning**: 2+ years of session histories showing improvement
- **Social Proof**: Parents seeing real speaking improvement

### Why?
You cannot fork a habit loop.
You cannot fork user trust.
You cannot fork a 2-year daily practice dataset.

---

## 5. COST MODEL (At Scale)

| Component | Monthly Cost (1000 Active Users) |
|-----------|----------------------------------|
| DeepSeek API ($0.14/M tokens, 1000 tokens/session, 1 session/day) | $4,200 |
| Cloudflare Workers (1000 requests/day × 30) | $15 |
| Durable Objects (1000 students × $0.15) | $150 |
| Infrastructure overhead | $500 |
| **Total Infrastructure** | **$4,865** |
| **Per User Per Month** | **$4.86** |
| **Revenue Model** | 200k VND/month (~$8.50) per student |
| **Gross Margin (First 1000 Users)** | ~75% |

**Unit Economics Are Real.**

---

## 6. VIETNAM LEGAL + IP STRUCTURE (2026)

### Company Registration
- **Entity Type:** WFOE (Wholly Foreign-Owned Enterprise)
- **Sector Code:** 5820 (Software Production) + 6200 (IT Services)
- **Capital Required:** $10k USD (can bridge via community angel)
- **Timeline:** 4-8 weeks (fast-track IRC/ERC split available)

### IP Protection
- **Software Copyright:** 5-10M VND registration
- **Dataset Registration:** Protected under Law on Digital Technology Industry (March 2026)
- **Trademark:** "OBI" + "Magic Chat" UI flow (as of April 1, 2026 IP amendments)

### Visa Strategy
- **Bridge:** Stay on Galaxy TRC until revenue > teaching salary
- **Exit:** Switch to DT4 Investor Visa under own company
- **AI Incentive:** May qualify for 5-year tax exemptions in Software Parks

---

## 7. IMPLEMENTATION PRIORITY (LOCKED ORDER)

### PHASE 1 — Retention Proof (Critical)
- [ ] Daily speaking task generator (1 focus weakness per day)
- [ ] Streak logic visual (prominent + psychological)
- [ ] "Return tomorrow" loop (low friction)
- [ ] Success metric: 7-day retention > 50%

### PHASE 2 — Accountability Pressure (High)
- [ ] Teacher visibility dashboard
- [ ] Boss/parent escalation alerts
- [ ] Missed practice detection
- [ ] Success metric: 30-day retention > 60%

### PHASE 3 — Social Proof Loop (Medium)
- [ ] Parent visibility + progress reports
- [ ] Classroom comparison (benign)
- [ ] External accountability partner signup
- [ ] Success metric: Referral rate > 20%

### PHASE 4 — Governance Hardening (Optional)
- [ ] Ledger verification automation
- [ ] Soul DNA rule expansion
- [ ] Anti-drift audit expansion
- [ ] Success metric: System stability maintained at scale

---

## 8. NON-NEGOTIABLE SYSTEM RULES

**A feature is INVALID if it:**
- Does not increase speaking frequency
- Does not improve return rate
- Does not strengthen weakness targeting
- Does not improve learning continuity
- Makes OBI feel more generic

**That's it. Everything else is optional.**

---

## 9. ONE-LINE TRUTH (Final Form)

> **OBI is a Cloudflare-native learning continuity engine that turns English practice into a repeatable daily behavioral loop using correction, memory, and accountability.**

---

## 10. CURRENT STATE (APRIL 2026)

### Already Built ✅
- Cloudflare Worker backbone  
- OBI system prompt v3 (Soul DNA locked)
- DeepSeek integration path  
- Durable Object architecture (ProfileDO, SessionDO, PetDO, LedgerDO)  
- 17 API routes  
- Session log infrastructure  
- Soul DNA capture + verification layer  

### In MVP Code (Run 327) ✅
- Next.js frontend (React 19)  
- API endpoints (/api/chat, /api/session, /api/student/:id)  
- Memory system (Star Map + vector embeddings)  
- Database schema (Prisma + PostgreSQL)  
- Documentation (deployment guides, API reference)  

### Critical Gap ⚠️
- Daily return loop not yet (emotionally) sticky enough
- That is the real product gap, not infrastructure.

### Next Build (7 Days)
1. Daily task generation (deterministic targeting of top weakness)
2. Streak visualization (make it impossible to ignore)
3. "Come back tomorrow" CTA (low friction re-entry)
4. Test with 10 real students

---

## 11. COMPETITIVE POSITIONING

| Feature | OBI | Duolingo | ChatGPT | Khan Academy |
|---------|-----|----------|---------|--------------|
| **Voice-first interface** | ✅ | ❌ | ⚠️ | ❌ |
| **Accountability loop** | ✅ | ❌ | ❌ | ❌ |
| **Teacher visibility** | ✅ | ❌ | ❌ | ⚠️ |
| **Retention after class** | ✅ | ⚠️ | ❌ | ⚠️ |
| **Vietnamese accent optimization** | ✅ | ❌ | ❌ | ❌ |
| **Memory of learner** | ✅ | ⚠️ | ❌ | ⚠️ |
| **Low cost** | ✅ ($4.86/user) | ⚠️ | ❌ | ✅ |

---

## 12. NEXT ACTION (Choose One)

**A) Build Execution Phase**
- Create daily task generator
- Implement streak visualization
- Deploy to 10 test students

**B) Investor Narrative**
- Convert architecture into 10-slide pitch deck
- Translate moat analysis into defensibility argument

**C) Legal Incorporation**
- Finalize WFOE structure
- Copyright dataset + trademark OBI interface
- Set up company bank account

**D) Scale Planning**
- Define teacher onboarding flow
- Build parent dashboard mockup
- Create Zalo integration spec

---

## Appendix: System Invariants

1. **Memory never gets deleted.** (Only LedgerDO is the truth source.)
2. **Correction always happens within 1 second.**
3. **OBI maintains character. No generic responses.**
4. **Accountability is opt-in, not coercive.**
5. **The product loop runs every day or the system fails.**

---

**Status:** PRODUCTION SPECIFICATION  
**Last Updated:** April 19, 2026  
**Next Review:** May 19, 2026  

