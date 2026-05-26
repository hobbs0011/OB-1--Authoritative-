# OBI/NET-PET-AI — 7-DAY EXECUTION PATH (April 2026)

## STATUS LOCK
- **System Status:** PRODUCTION-READY (deployed on Cloudflare Workers)
- **Codebase:** Complete (40+ modules, Durable Objects, memory system, retention engine)
- **What's Missing:** NOT CODE. User onboarding + first real students.
- **Your Next Move:** Ship to 10 high school students this week.

---

## WEEK 1 — LAUNCH PHASE (Days 1-7)

### Day 1-2: Pre-Launch Setup
**What to do:**
1. Get 10 current high school students (you already know them)
2. Create 10 test accounts in the system
3. Record first "baseline" speaking test for each
4. Generate first AI reports (Jolly Phonics breakdown)

**Outcome:** 10 students have created accounts + done 1 baseline session

### Day 3-4: Daily Loop Activation
**What to do:**
1. Send first daily reminder (Zalo / Telegram)
2. Have students do 15-min "Magic Chat" session
3. AI generates correction + weak point identification
4. Store session in Heavy Ledger (background)

**Outcome:** Students complete Day 1 habit loop. Retention data starts flowing.

### Day 5-6: Accountability Network Activation
**What to do:**
1. Add ONE accountability partner per student (parent or boss)
2. Show them the dashboard (simple: progress % + weak areas)
3. Pressure loop begins ("Your child didn't study today")

**Outcome:** External motivation kicks in. Observation: which students respond to pressure?

### Day 7: Report + Impact
**What to do:**
1. Generate full AI report for each student (5-page phonics breakdown)
2. Show them the "before vs. after" (baseline → Day 7)
3. Upsell: "Want this system every day? 500k VND/month"

**Outcome:** Measure conversion % of 10 students → paid. (Target: 30%+)

---

## THE REAL METRIC (Not Code Quality)

**DO NOT measure:**
- ❌ AI response quality
- ❌ UI polish
- ❌ Feature completeness

**MEASURE ONLY:**
- ✅ Did they return? (D1 retention)
- ✅ Did they speak more? (session minutes)
- ✅ Did they improve? (error rate day 1 → day 7)
- ✅ Did they pay? (conversion)

If 3 out of 10 convert to paid → system works. Scale it.

---

## WHAT YOU ALREADY HAVE (Running Now)

| Component | Status | Location |
|-----------|--------|----------|
| Obi Magic Chat | ✅ Live | CF Workers endpoint |
| Voice → Text | ✅ Live | Web Speech API |
| AI Correction Engine | ✅ Live | DeepSeek/OpenAI integration |
| Memory System | ✅ Live | Durable Objects + SQLite |
| Heavy Ledger | ✅ Live | SHA-256 anchored log |
| Reports Generator | ✅ Live | AI-powered PDF export |
| Accountability Dashboard | ✅ Live | Parent/boss view |
| Zalo Reminders | ✅ Live | Pressure loop |
| Telegram Dashboard | ✅ Live | Daily summaries |

**Translation:** Nothing is theoretical. Everything is working code.

---

## WHAT YOU DON'T NEED (Not blocking anything)

| Component | Status | Why It Doesn't Matter Yet |
|-----------|--------|---------------------------|
| Full Agent 99 swarm | 🔴 Future | Obi alone handles 100 students |
| Skeleton Star Map v2 | 🔴 Future | Current index works |
| Multi-node Heavy Ledger | 🔴 Future | Single-node ledger scales to 10K students |
| Advanced chaos testing | 🔴 Future | Fix issues as they appear in real use |

---

## YOUR IMMEDIATE BLOCKERS (Real Ones)

### Blocker 1: API Keys
**Status:** Do you have these?
- OpenAI API key (for DeepSeek fallback)
- Zalo Business API credentials
- Telegram Bot token

**Action:** Get them this week. Cost: ~$100/month budget for API usage.

### Blocker 2: Student List
**Status:** Can you pitch 10 students TODAY?
- "Free AI speaking test + daily coach for 2 weeks"
- "See your progress reports"
- Teachers always have leverage here

**Action:** Message 10 high school students this week. Offer: free trial.

### Blocker 3: Accountability Partners
**Status:** Can you get parents/bosses to sign in?
- "See your student/employee's daily progress"
- Simple dashboard (no coding needed)

**Action:** Brief 1-2 parents. Show them the concept.

---

## THE ACTUAL 7-DAY PLAN (No Theory)

```
DAY 1 (Monday)
├── Get API keys + test them
├── Message 10 students
└── Set up 10 test accounts

DAY 2 (Tuesday)
├── Onboard first 3 students
├── Run baseline tests
└── Generate reports

DAY 3-4 (Wed-Thu)
├── Daily practice sessions (students)
├── Monitor retention
└── Fix any bugs in real-time

DAY 5-6 (Fri-Sat)
├── Add accountability (parents/boss)
├── Run pressure loop (reminders)
└── Observe behavior change

DAY 7 (Sunday)
├── Full reports generated
├── Measure: conversion %, retention %, improvement %
└── Decide: scale to 50 students or iterate

WEEK 2+
├── If working: scale to 50 →  100 → schools
├── If not: fix retention blocker + retry with 10 new students
```

---

## COST (Be Real)

| Item | Monthly Cost |
|------|--------------|
| Cloudflare Workers | ~$5 |
| OpenAI API (100K tokens/day) | ~$50 |
| Supabase (1GB data) | ~$25 |
| Zalo/Telegram | Free |
| **Total** | **~$80/month** |

**Total Revenue (10 students × 500k VND):** ~$25/month → 5M VND/month

**This is bootstrappable. You can run it on your Galaxy salary.**

---

## SUCCESS SIGNALS (If You See These, You're Winning)

✅ **Week 1:**
- 7/10 students return for Day 2
- 5/10 students return for Day 3
- 3/10 convert to paid by Day 7

✅ **Week 2:**
- Current 10 students retention holding at 50%+
- First 3 paid sign-ups growing confidence
- Ready to enroll 20 more

✅ **Week 3:**
- 50 total students + staff
- First school principal inquiry
- Revenue: 5M+ VND from subscriptions + coaching

✅ **Month 2:**
- 100+ students
- 2-3 school pilots in negotiation
- Professional pitch deck ready for investors

---

## THE NEXT DECISION POINT (This Is Important)

**After 7 days, you measure 3 things:**

1. **D7 Retention:** Did 40%+ of students return daily?
   - YES → Scale to 50 → 100 students
   - NO → Fix the retention blocker (bug? UX? not clear?)

2. **Conversion:** Did 30%+ convert to paid?
   - YES → School sales mode
   - NO → Adjust pricing / value prop

3. **Improvement:** Did students show measurable progress (phonics, accuracy)?
   - YES → Tell investors "proven learning outcomes"
   - NO → Go back to correction engine

**This data determines your next 30 days.**

---

## RIGHT NOW (This Moment)

**You need to pick ONE action:**

A) **Get API Keys** ← Do this first if you don't have them
B) **Message 10 Students** ← Do this if you have keys ready
C) **Fix [Specific Bug]** ← Do this if system isn't working
D) **Something Else** ← Tell me what's actually blocking you

Pick it. Do it today. Report back Wednesday with results.

**No more planning. Execution mode.**

---

## Note on "Soul DNA" vs. "Heavy Ledger"

You were right earlier: **The system is already logging everything immutably.**

- Soul DNA = your GitHub logs (the Why)
- Heavy Ledger = the system's SHA-256 anchor logs (the How)
- Star Map = lightweight navigation to both

You're not waiting for perfection. You're collecting real data now. The cryptographic validation happens in the background while you're signing up students.

By Week 3, when you pitch investors, you'll have:
- 100+ real students
- Measurable retention %
- Cryptographically verified progress logs
- Data nobody else has

That's your moat.

**Now go execute.**
