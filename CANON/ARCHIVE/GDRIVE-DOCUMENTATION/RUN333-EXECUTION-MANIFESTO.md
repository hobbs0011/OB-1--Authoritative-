# RUN 333 Execution Manifesto
**Mission:** Ship broken MVP + rebuild income, parallel tracks  
**Timeline:** 7 days (this week, starting immediately)  
**Acceptance:** $500k/week income proof + NET-PET-AI canary live

---

## Track A: ManyChat + Income Stabilization (3 Days)

### Phase 1: Sales Funnel Setup (Today + Tomorrow)

**Objective:** Prove $500k/week group class model  
**Platform:** ManyChat (or Paul's channel, if you mean something else)

**Spec:**
```
Input message: "I want to learn English"
  ↓ [ManyChat sequence]
  ↓ "Join our 12-week Tiger Program?"
  ↓ Pricing: $500,000 VND for 12 weeks
    (10 students × 90 min class + daily AI coaching + buddy system)
  ↓ [Calendar link]
  ↓ [Payment gateway - Stripe/Momo]
  ↓ Auto-enroll in OBI app
  ↓ Send class schedule + Gospel 444 lesson pack
```

**Copy (from marketing brand):**
```
"You've tried apps. You've tried tutors. You know what's missing? 
A human who won't disappear when you plateau, and an AI that never sleeps.

12 weeks. 90-min classes with me (Michael) + daily AI coaching.
Real English results, not burnout.

$500k/week (ask me about group discounts).

First class is free. You'll know in 10 minutes if this works for you."
```

**Traffic source:** Your existing student network + Discord/Telegram groups  
**Success metric:** 5 sign-ups this week  
**Expected revenue:** $2.5M this week (5 × $500k = $2.5M)

### Phase 2: Payment + Enrollment Automation (Day 2)

- Set Stripe account (2 hours)
- Configure ManyChat webhook to OBI app
- Auto-enroll confirmed payments into student dashboard
- Send email sequence (schedule, lesson pack, buddy assignment)

**Success metric:** First 3 paid enrollments = $1.5M revenue

---

## Track B: NET-PET-AI Chaos Canary Deploy (Parallel, 4 Days)

### Phase 1: Define MVP Scope (Today, 2-3 hours)

**Ask:** What is the absolute minimum to prove core concept?

**Answer:**
```
✓ OBI AI responds to greeting (Deepseek V3.2 via Cloudflare AI Gateway)
✓ Student can send message → OBI replies with personalized feedback
✓ Session SSM persists (ProfileDO stores name, level, lesson progress)
✓ Gospel 444 lesson delivers inline via API
✓ AI can check homework via StudentDO validation endpoint
✓ Student dashboard shows: this week's lessons, progress bar, next class date

✗ NOT included: full drone integration, bulk admin tools, analytics, payment retry logic, 
  multi-platform support, voice synthesis, TTS, chat history exports, etc.
```

**Acceptance Criteria (chaos engineering):**
- ✓ 3+ deploy cycles in production (iterate fast, fix leaks)
- ✓ Zero catastrophic failures (data loss = death; display lag = ok)
- ✓ 50 concurrent student sessions without crashing
- ✓ Deployment time < 5 min (wrangler deploy --env production)

### Phase 2: Canary Deploy to 50 Students (Day 3-4)

**Current student opt-ins:** Existing NET students who volunteered to test  
**Deploy steps:**
```
1. Run `wrangler deploy --env production` (2 min)
2. Roll out to 10 students first (observe 4 hours)
3. Scale to 50 students (observe 24 hours)
4. Gather feedback: Slack/Discord channel
5. Fix top 3 bugs (if any)
6. Lock version for main teaching schedule
```

**Success metric:** 50 students, zero unplanned downtime, at least 1 bug found + fixed

### Phase 3: Document Learnings (Day 4)

**Artifact:** `NET-PET-AI-CANARY-RUN333-POSTMORTEM.md`
- What worked
- What broke
- How we fixed it
- Drone integration readiness score (0-10 scale)

---

## Track C: First Drone Hire (Upwork, 2-3 Days)

### Job Posting Template

**Title:** "AI Platform Ops Support - Help Scale $500k/Week English Teaching Business"

**Description:**
```
We run a live English teaching platform powered by AI coaching (OBI).
We're hiring 2-3 ops people to:
- Manage student onboarding (ManyChat → OBI app → class schedule)
- Answer student questions (email/Discord/Slack)
- Track homework submissions + give feedback
- Monitor OBI responses for quality/tone

Why this matters: You're testing whether AI can operate at scale.
You'll learn how drones (AI + human ops) work in production.

$200-400/month per contractor (trial period 4 weeks)
Remote, async-first (report daily on Slack)
Skills: Customer support, attention to detail, can follow playbooks exactly

Bonus: If this works and scales, permanent team position + profit share.

Prove you can manage chaos. Attention to detail in high-volume scenarios.
```

**Budget:** $600-1200/month for 3 contractors (v1 ops team)  
**Success metric:** 3 hires by day 3, onboarded and handling first student tickets by day 5

---

## Track D: Heavy Ledger Consolidation (Async, 1-2 Hours Daily)

**Objective:** Convert RUN331 Soul DNA + 8.5 months of reincarnations into searchable knowledge base

**Artifact:** `SOUL-DNA-BIBLE-RUN333-CONSOLIDATION.md`
```
- Chapter 1: Core truths (immutable ledger, drones, Gospel 444 locked)
- Chapter 2: 500-stage pipeline status (completed, active, next)
- Chapter 3: Window closure thesis + urgency
- Chapter 4: Hierarchy of decisions (what changed my mind?)
- Chapter 5: Known bugs + workarounds
- Chapter 6: Metrics that matter (revenue, sessions, bug count)
```

**Append to:** `MASTER-SYNC.md` (so next reincarnation knows exactly where we stand)

**Time:** 30 min/day, can be done during ManyChat breaks

---

## Daily Execution Checklist (RUN 333)

### Day 1 (Today) — Gating, Scope, Go
- [ ] Define MVP scope (net-pet-ai): 2 hours
- [ ] Pull all ManyChat sequence templates (1 hour)
- [ ] Set up Stripe dev account (1 hour)
- [ ] Create Upwork job posting (1 hour)
- [ ] Commit this manifesto to Git (5 min)
- **EOD Check:** Can you describe MVP in one paragraph? Can you paste ManyChat copy from memory?

### Day 2 — Automation Setup
- [ ] ManyChat API wired to OBI app (2 hours)
- [ ] Payment webhook functional (Stripe → student dashboard) (1.5 hours)
- [ ] Email sequence drafted + tested (1 hour)
- [ ] First 2 Upwork applicants filtered (1 hour)
- **EOD Check:** Can you send a test ManyChat message and see it hit OBI API?

### Day 3 — Live Launch (Income + Canary)
- [ ] Go live: ManyChat funnel + payment link (30 min)
- [ ] Post to existing student network + 3 Telegram groups (30 min)
- [ ] NET-PET-AI canary deploy to 10 students (1 hour)
- [ ] Hire first 2 Upwork contractors + send onboarding (1.5 hours)
- [ ] Monitor: Revenue, deploy logs, student feedback (1 hour)
- **Target:** First $500k payment received by EOD

### Day 4 — Scale Canary + Revenue Check
- [ ] Scale NET-PET-AI to 50 students (30 min)
- [ ] Monitor production dashboard (1 hour, ongoing)
- [ ] First student ops ticket from drone hire #1 (30 min async)
- [ ] Gather feedback: Which Gospel 444 lessons work? (1 hour)
- **Target:** $1M+ revenue (2+ enrollments)

### Day 5 — Lock & Iterate
- [ ] Postmortem: What broke in canary? (1 hour)
- [ ] Fix top 3 bugs (if any) (2 hours max)
- [ ] Version lock for main teaching schedule (30 min)
- [ ] Update MASTER-SYNC.md with RUN333 results (30 min)
- **Target:** No unplanned downtime in production

### Days 6-7 — Consolidation + Bonus Output
- [ ] Draft SOUL-DNA-BIBLE-RUN333 (1.5 hours)
- [ ] Consolidate all reincarnations into searchable index (1 hour)
- [ ] Plan RUN334 (scope: agent.yaml, drone integration, ledger extraction) (1 hour)
- [ ] Record video: "Here's what we shipped this week" (20 min)

---

## Metrics That Matter (RUN333 Success)

### Revenue Track [Income Proof]
- [ ] $500k revenue (1 enrollment) — baseline
- [ ] $1M revenue (2 enrollments) — expected
- [ ] $2.5M revenue (5 enrollments) — target

### Deployment Track [MVP Proof]
- [ ] Canary deployed + live — binary ✓
- [ ] Zero unplanned downtime — binary ✓
- [ ] 50 concurrent sessions — threshold met ✓
- [ ] 1+ bug found + fixed — proof of iteration ✓

### Team Track [Drone Proof]
- [ ] 2 contractors hired (Upwork) — binary ✓
- [ ] First ops ticket handled — binary ✓
- [ ] Zero contractor no-shows — binary ✓

### Soul DNA Track [System Proof]
- [ ] RUN333 consolidated into canonical file — binary ✓
- [ ] All reincarnations indexed — binary ✓
- [ ] MASTER-SYNC.md updated — binary ✓

---

## Failure Modes + Mitigation

### "ManyChat converts 0 students"
- Mitigation: Fall back to direct Telegram DM campaign (existing students)
- Escalation: Hire copywriter on Upwork ($50/job to rewrite funnel)
- Recovery: Proof of concept is still valid if even 1 person pays

### "NET-PET-AI crashes under 50 users"
- Mitigation: Instant rollback (1 min)
- Observation: See what broke (logs + postmortem)
- Fix: Patch + redeploy (chaos engineering: break fast, fix fast)
- Contingency: Scale down to 10 users, fix, try again

### "First drone hire disappears"
- Mitigation: Upwork has escrow + reviews. Easy to report + hire replacement
- Escalation: Do ops yourself for week 1, hire backup immediately
- Lesson: Cheap to fail on hiring when it's contractors, not employees

### "Ledger consolidation takes 8+ hours"
- Mitigation: Don't do it this RUN. Defer to RUN334 (next iteration)
- Recovery: Do 30-min daily consolidation instead of binge session
- Principle: Ship broken is OK. Ship nothing is not.

---

## Non-Negotiable Rules (RUN333)

1. **No more than 12 hours work per day.** Sleep is part of production.
2. **Deploy every 48 hours.** No matter how small. Keeps momentum.
3. **Every bug gets a ticket in Ledger.** Even tiny ones. Pattern detection.
4. **Contractors know the rules before hire.** Async, daily standups, no flakes = termination.
5. **If you're stuck, ask ONE specific question.** Not three. Move forward.
6. **Income + App both go live this week.** Not optional.

---

## Next Gate (RUN 334)

**Opens when:**
- Revenue proof: $500k+ received
- Deployment proof: Canary live + stable  
- Team proof: First drone hired + producing

**Mission:** Scale drone integration + Heavy Ledger extraction

---

**Authored by:** Michael (chaos engineering mode active)  
**Locked at:** 2026-04-19  
**Commit signature:** "Ship it. Iterate. Repeat. Window closing fast."
