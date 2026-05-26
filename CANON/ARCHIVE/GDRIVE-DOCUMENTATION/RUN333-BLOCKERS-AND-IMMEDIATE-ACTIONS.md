# RUN 333 Execution Blockers & Immediate Actions

## CRITICAL BLOCKERS (Must Resolve Before Shipping)

### 1. **ManyChat Integration Not Finalized**
**Status:** Template exists, API keys not validated  
**Action Required:** 
- [ ] Create ManyChat business account (takes 1 day to approve)
- [ ] Get API keys from ManyChat dashboard
- [ ] Test webhook to OBI app (test file send → verify in database)
- [ ] Validate: Message received in ManyChat = Student created in ProfileDO

**Owner:** You  
**Blocker:** Cannot launch income funnel without this  
**Timeline:** Must be done by EOD Day 1 (today)

---

### 2. **Stripe Webhook Flow Untested**
**Status:** Stripe dev account exists, webhook not live  
**Action Required:**
- [ ] Create Stripe product (NET-PET-AI Group Class, $500k VND)
- [ ] Create Stripe payment link
- [ ] Test: Make fake purchase → verify student enrolled in dashboard
- [ ] Configure: Successful payment → send email + class schedule + OBI app link
- [ ] Validate: Zero payment failures in first batch

**Owner:** You  
**Blocker:** Cannot accept money without this  
**Timeline:** Must be done by EOD Day 1

---

### 3. **NET-PET-AI Canary Scope Not Locked**
**Status:** Ideas exist, acceptance criteria unclear  
**Action Required:**
- [ ] Write 1-page spec: "THIS is what canary will do"
- [ ] Circle: Features INCLUDED vs EXCLUDED
- [ ] List: Top 3 risks (what could break?)
- [ ] Define: Success = "Students complete 1 lesson without errors"
- [ ] Validate: Can deploy in < 5 min?

**Owner:** You  
**Blocker:** Cannot deploy without clear scope  
**Timeline:** Must be done by EOD Day 1 (2-3 hours max)

---

### 4. **Wrangler Secrets Not Updated**
**Status:** May be stale or missing keys  
**Action Required:**
- [ ] List all required secrets: `API_KEY, DEEPSEEK_KEY, USER_DB_URL, etc.`
- [ ] Verify each secret is valid (not expired)
- [ ] Run: `npx wrangler secret list --env production`
- [ ] If any missing: Add them before canary deploy
- [ ] Test: Single API call in dev environment

**Owner:** You  
**Blocker:** Deploy will fail silently if secrets missing  
**Timeline:** Must be done by morning of Day 3 (canary deploy day)

---

### 5. **First Upwork Job Posting Not Published**
**Status:** Draft exists in brain, not online  
**Action Required:**
- [ ] Write job posting (use template from RUN333 manifesto)
- [ ] Post to Upwork (takes 10 min)
- [ ] Set: Budget $200-400/month, hire 2-3 people
- [ ] Monitor: Review applicants within 4 hours (fast response = quality filter)
- [ ] First interview: "Tell me about a time you dealt with customer chaos"

**Owner:** You  
**Blocker:** Cannot hire drones without posting first  
**Timeline:** Must be live by EOD Day 1

---

### 6. **Gospel 444 Lesson Pack Not Finalized**
**Status:** Partial lessons exist, pack not serialized  
**Action Required:**
- [ ] Compile: Which 4-5 lessons ship in canary? (not all 444)
- [ ] Format: JSON array with lesson_id, title, duration_min, quiz_questions
- [ ] Validate: Each lesson < 10 min (keep it tight)
- [ ] Test: OBI can fetch and render lesson inline to student
- [ ] Lock: Once canary goes live, these lessons cannot change (consistency)

**Owner:** You (or delegate to Upwork contractor after hire)  
**Blocker:** Cannot assess student progress without structured lessons  
**Timeline:** Must be done by Day 2

---

### 7. **OBI Deepseek Prompt Not Personalized for Students**
**Status:** Generic AI response template, not tuned for English learners  
**Action Required:**
- [ ] Write OBI system prompt: Personality, tone, when to praise, when to push
- [ ] Test: 5+ student scenarios (beginner asks, advanced asks, lost student)
- [ ] Validate: Responses feel human + personalized (not robotic)
- [ ] Lock: Deploy with this prompt, no changes mid-canary
- [ ] Measure: Student satisfaction (simple 1-5 emoji rating)

**Owner:** You (this is Soul DNA—only you can define it)  
**Blocker:** Bad AI experience = canary fails = feedback invalidated  
**Timeline:** Must be done by Day 2

---

## IMMEDIATE ACTIONS (Do These Today)

### Phase 1: Scope Lock (1 Hour)
- [ ] Paste this file into VS Code
- [ ] Edit: Define your NET-PET-AI MVP in plain English (1 page)
- [ ] Ask: What MUST work? What can break?
- [ ] Commit: "RUN333 MVP scope locked"

### Phase 2: Jobs Posted (1.5 Hours)
- [ ] Create ManyChat business account (or verify existing one)
- [ ] Copy ManyChat sequence template from RUN333 manifesto
- [ ] Paste into ManyChat (configure prompts, responses)
- [ ] Create Stripe product (NET-PET-AI Group Class, $500k)
- [ ] Post Upwork job (contractor hiring)
- [ ] Set phone reminder: "Check ManyChat in 3 hours for first signup"

### Phase 3: Secrets Audit (30 Minutes)
- [ ] Open terminal: `cd APPS/NET-PET-AI`
- [ ] Run: `npx wrangler secret list --env production`
- [ ] For each secret: Is it valid? Not expired?
- [ ] If missing any: Add them now (`npx wrangler secret put KEY --env production`)
- [ ] Test one API call in dev to validate flow

### Phase 4: Git Lock (5 Minutes)
- [ ] Commit these blocker files: `git add SOUL-DNA-RUN331-CONSOLIDATION.md RUN333-EXECUTION-MANIFESTO.md RUN333-BLOCKERS.md`
- [ ] Commit message: "RUN333: Execution gate locked. Ship this week."
- [ ] Push to main: `git push origin main`

---

## Contingency: If You Get Stuck

**If ManyChat approval takes > 2 days:**
- Fall back: Use existing Telegram group + send manual links
- Workaround: Test Stripe + payment flow offline with fake ManyChat data
- Recovery: Don't optimize this. Accept 1 day delay, move forward.

**If Stripe webhook fails:**
- Immediate: Manual enrollment (you add student to database directly)
- Validation: Payment was received, system is just asynchronous
- Timeline: Fix webhook while manual students learn in app
- Recovery: Automate tomorrow, teach today.

**If Upwork hiring takes > 3 days:**
- Immediate: Do first-week ops yourself
- Delegation: Hire offshore on Fiverr if Upwork too slow (gig basis, pay per ticket)
- Recovery: Prove concept works with you + 1 contractor, then scale

**If NET-PET-AI canary crashes:**
- Immediate: Rollback (1 min, zero data loss)
- Investigation: Check logs in Cloudflare dashboard
- Fix: Patch + redeploy (2 hours max)
- Recovery: Scale to 5 users instead of 50, validate again
- Principle: Acceptable to break. Not acceptable to not iterate.

---

## Success Signals (Celebrate These)

- [ ] ✅ First ManyChat message received
- [ ] ✅ First $500k VND payment cleared
- [ ] ✅ First student message in NET-PET-AI app
- [ ] ✅ OBI responds to student message
- [ ] ✅ First Upwork contractor says "I'm ready to start"
- [ ] ✅ Canary reaches 50 students without downtime

---

## The Timeter

**Current Time:** Day 0, Evening  
**Go-Live Window:** 7 calendar days (168 hours)

| Milestone | Target | Status |
|-----------|--------|--------|
| Blocker #1-3 Resolved | Day 1, EOD | ⬜ |
| ManyChat + Stripe live | Day 3, Morning | ⬜ |
| First payment received | Day 3, EOD | ⬜ |
| NET-PET-AI canary deployed | Day 3, Evening | ⬜ |
| First Upwork contractor hired | Day 4, Morning | ⬜ |
| 50 students on canary | Day 4, EOD | ⬜ |
| RUN333 postmortem + lock | Day 5, EOD | ⬜ |
| Revenue proof + app stability | Day 7, EOD | ⬜ |

---

## Do NOT Overfunc

- ❌ Don't build a perfect admin panel (not MVP)
- ❌ Don't audit all 444 Gospel lessons (use 4-5)
- ❌ Don't write comprehensive docs (verbatim is enough)
- ❌ Don't optimize for scale (optimize for shipping)
- ❌ Don't sleep less than 6 hours/night (broken brain = broken decisions)

---

## If This Feels Like Too Much

It's not. You've done 8.5 months of research. This is just execution.

**Truth:** You already know what to build. You know how to sell. You know why it matters.

**Ask yourself:** "Would I rather have a perfect plan or working proof?"

**Answer:** Working proof.

---

**Status:** EXECUTION GATE OPEN  
**Authority:** RUN331 Soul DNA consolidated and locked  
**Next Action:** Take one blocker from this list and finish it in the next 30 minutes  
**Proof of Work:** When you commit these files, you've crossed the Rubicon. No more planning.
