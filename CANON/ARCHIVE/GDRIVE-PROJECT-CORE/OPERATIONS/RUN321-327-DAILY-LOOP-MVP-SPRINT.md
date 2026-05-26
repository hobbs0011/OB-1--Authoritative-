# RUN 321-327 — DAILY LOOP MVP SPRINT
**Start:** 2026-04-20  
**End:** 2026-04-27  
**Goal:** Ship a behavioral loop that changes user habits in 7 days  
**Thesis:** Users don't care about infrastructure. They care about: "Do I improve in 3 days?"

---

## THE REAL MVP (NOT PHILOSOPHY)

```
SPEAK → CORRECT → REPEAT → REMEMBER → RETURN
```

This loop. Nothing else. Everything else breaks it.

---

## RUN 321 — SOVEREIGNTY GATE (TODAY)

**Mission:** Verify 3 blocking gates + clean deployment state

| Gate | Status | Action |
|------|--------|--------|
| **GITHUB_TOKEN** | ✅ Present | Ready |
| **Cloudflare Worker** | ✅ Deployed | v1.5.0 LIVE at net-pet-ai-production.mrmichaelhobbs123.workers.dev |
| **Durable Objects** | ✅ 5/5 Configured | SESSIONS, PROFILES, PETS, LEDGER, ASSETS |

**Decision Point:**
- ✅ All gates pass → Proceed to Run 322
- ❌ Any gate fails → Debug + retry

**Deliverable:**
```bash
git log --oneline -1
# run321: Daily Loop MVP Sprint — gates verified, Worker live, ready for behavioral loop implementation
```

---

## RUN 322 — VOICE ENTRY ONLY (DAY 1-2)

**Scope:** Chrome extension button → STT → Worker → Response  
**Out of scope:** Memory, scoring, persistence (yet)

### What to build:

1. **Chrome Extension UI (public/extension/)**
   - Single button: "Speak"
   - Placeholder for transcribed text
   - Placeholder for response

2. **Worker Route: `/api/speak` (POST)**
   ```javascript
   POST /api/speak
   Body: { text: "I am student" }
   
   Response: {
     corrected: "I am a student",
     explanation: "Added article 'a' before 'student'",
     returned_text: "I am a student",
     retry_prompt: "Now say it again: I am a student"
   }
   ```

3. **LLM Prompt (simple)**
   ```
   Correct this English: "{user_text}"
   
   Return JSON:
   {
     "corrected": "...",
     "explanation": "...",
     "returned_text": "..."
   }
   ```

### Metrics:
- ✅ Chrome extension loads
- ✅ Mic input → text output
- ✅ Worker responds with correction
- ✅ Response shows in UI

### Git deliverable:
```
git commit -m "run322: Voice entry MVP — chrome extension speaks, worker corrects, UI renders response"
```

---

## RUN 323 — CORRECTION ENGINE (DAY 3)

**Scope:** Grammar feedback + pronunciation guidance (rule-based first)

### What to add:

1. **Better Correction Prompt**
   ```
   You are an English tutor for Vietnamese speakers.
   Student said: "{user_text}"
   Task: Correct & explain.
   
   Rules:
   - Be direct, not nice
   - Find 1 main error
   - Explain why (not "grammar rule name")
   - Pronunciation notes if applicable
   ```

2. **Response Format (now richer)**
   ```javascript
   {
     corrected: "I am a student",
     mistake: "Missing article 'a'",
     explanation: "In English, when speaking about a job/identity, use 'a'",
     pronunciation_note: "Stress: 'a STU-dent' not 'a STOO-dent'",
     repeat_instruction: "Now say: I am a student",
     confidence: 0.92
   }
   ```

3. **Edge cases**
   - Slang/colloquial → accept it, note the context
   - Accent issues → note but don't dogpile
   - Multiple errors → pick the most important one

### Metrics:
- ✅ LLM returns structured correction
- ✅ UI displays mistake + explanation
- ✅ Student sees what to repeat

### Git deliverable:
```
git commit -m "run323: Correction engine — mistake detection, explanation generation, pronunciation feedback"
```

---

## RUN 324 — REPETITION LOOP (DAY 4)

**Scope:** Force the student to repeat the corrected sentence  
**Key insight:** This is where retention forms

### What to add:

1. **Repetition Flow**
   ```
   Flow:
   1. Student speaks → gets corrected
   2. UI shows: "Now say: [corrected sentence]"
   3. Student speaks again
   4. System logs: { attempt: 1, success: boolean }
   5. If success → move to next exercise
   6. If fail → repeat up to 3x
   ```

2. **Worker Changes**
   - Add `/api/evaluate-repetition` endpoint
   - Compare student speech to target
   - Return pass/fail + score

3. **Durable Object Storage**
   ```javascript
   // Per student, per day:
   {
     student_id: "...",
     date: "2026-04-20",
     repetitions: [
       { original: "I am student", corrected: "I am a student", attempts: 2, success: true },
       // ... more
     ]
   }
   ```

### Metrics:
- ✅ Repetition UI works
- ✅ Student repeats until correct (or gives up)
- ✅ Data logged to Durable Object

### Git deliverable:
```
git commit -m "run324: Repetition loop — force student to repeat corrected sentence, log success rate"
```

---

## RUN 325 — MEMORY (FIRST VERSION) (DAY 5)

**Scope:** Track mistakes, not "Heavy Ledger crypto" — just SQLite persistence

### What to add:

1. **Student Mistake Log**
   ```javascript
   // Simple DB schema:
   CREATE TABLE mistakes (
     id INTEGER PRIMARY KEY,
     student_id TEXT,
     error_type TEXT,
     original_text TEXT,
     correction TEXT,
     repeat_count INTEGER,
     timestamp DATETIME
   );
   ```

2. **Weekly Weakness Detection**
   ```javascript
   // Group by error_type over last 7 days:
   {
     "article_missing": 12,
     "verb_tense": 8,
     "pronunciation_r_sound": 15
   }
   
   // Priority order = most frequent
   ```

3. **Worker Integration**
   - On every correction, write to Durable Object SQLite
   - On session start, fetch last 10 mistakes
   - Display to student: "Last week you struggled with [X]. Let's focus."

### Metrics:
- ✅ Mistakes logged per student
- ✅ Weakness ranking works
- ✅ Student sees their top 3 weaknesses

### Git deliverable:
```
git commit -m "run325: Simple memory — track mistakes by type, detect weakness patterns, display feedback"
```

---

## RUN 326 — BEHAVIORAL SCORING (DAY 6)

**Scope:** Simple return-trigger scoring (NOT Heavy Ledger)

### What to add:

1. **Tiger Score v1 (ultra-simple)**
   ```javascript
   score = (days_active * 2) + (correct_repeats * 3) + (streak_days * 5)
   
   display: "You're at 47 points. Next level at 60."
   ```

2. **Streak Logic**
   ```javascript
   // Did they return today?
   if (last_login < today) streak = 1
   else streak += 1
   
   if (streak == 0) show: "You lost your streak. Come back!"
   ```

3. **Return Triggers (CRITICAL)**
   - Push notification → "You're 2 mistakes away from level 5!"
   - Email → "Your streak is 7 days! Keep it going!"
   - In-app → Show progress bar visually

### Metrics:
- ✅ Score calculation works
- ✅ Streak tracking works
- ✅ Visual progress display works

### Git deliverable:
```
git commit -m "run326: Behavioral scoring — simple Tiger Score, streak tracking, progress visualization"
```

---

## RUN 327 — RETURN TRIGGERS (DAY 7)

**Scope:** Make the student WANT to come back (this is the moat)

### What to add:

1. **Psychological Compulsion Loop**
   ```
   Trigger: Student completed a speaking exercise
   
   → Show: "You're SO CLOSE to next level (+2 correct speaks needed)"
   → Show: "Your friends Mai & Quy completed today. You're -3 exercises behind"
   → Show: "Spend 10 min tomorrow → unlock new voice mode"
   
   Psychology: FOMO + progress visibility + achievement gap
   ```

2. **Push Notifications**
   - Default: 09:00 ICT (morning habit trigger)
   - Customizable: Student picks time
   - Message: "Your daily practice is waiting. 5 min to top up your score!"

3. **Streak Visuals**
   - Calendar showing: ✅✅✅❌✅ (last 5 days)
   - "8-day streak! Don't break it!"

4. **Social Proof (optional but powerful)**
   - "Quy just leveled up to Tiger!"
   - "Mai's 30-day streak is still going..."

### Metrics:
- ✅ Push notifications send
- ✅ Streak shown visually
- ✅ Progress gap visible
- ✅ Daily return rate measured

### Git deliverable:
```
git commit -m "run327: Return triggers — push notifications, streak visuals, social proof, daily habit loop shipped"
```

---

## SUCCESS CRITERIA (All must pass)

| Criterion | Metric | Target |
|-----------|--------|--------|
| **Daily Loop Works** | User can complete Speak→Correct→Repeat in <2 min | ✅ |
| **Correction Quality** | LLM returns actionable feedback (not generic) | 90%+ clarity score |
| **Retention** | User returns within 24 hours | >50% day-2 return |
| **Stress Test** | Worker handles 100 concurrent students | <200ms response |
| **No Memory Leaks** | Durable Object stays <10MB after 1K interactions | ✅ |
| **Git State Clean** | All 7 days committed to canon branch | ✅ |

---

## WHAT NOT TO BUILD (SCOPE WALLS)

- ❌ Heavy Ledger (add later)
- ❌ Cryptographic soul sealing (add later)
- ❌ Telegram escalation (add later)
- ❌ Multi-language routing (add later)
- ❌ API integrations (add later)
- ❌ Admin dashboards (add later)

**Focus:** One student, one day, one loop. Perfect it. Then scale.

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| LLM costs spiral | Cap at 100 calls/student/day. Log spending. Alert at $10/day. |
| Retention falls off Day 3 | Push notifications must send on Day 2 by 09:00 ICT. |
| Durable Object quotas exceeded | Monitor via /health endpoint. Alert if >80% quota used. |
| Chrome extension breaks with updates | Test on every commit. Pin Manifest v3. |
| Worker goes down | Setup auto-retry. Log downtime. Alert Michael immediately. |

---

## MICHAEL'S DECISION POINTS

**After this runs 321-327, Michael chooses next sprint:**

### Option A: Scale It
- Deploy to 50 students
- Measure retention curves
- Optimize based on real data

### Option B: Deepen It
- Add Heavy Ledger
- Add weakness prediction
- Add teacher dashboard

### Option C: Monetize It
- Add payment processing
- Create enterprise tier
- Build Zalo/Telegram bots for family accountability

---

## GIT CADENCE

Every run = 1 commit to `canon` branch.

```bash
git log --oneline
# run327: Return triggers — daily habit loop MVP shipped
# run326: Behavioral scoring — streak + progress
# run325: Simple memory — mistake tracking
# run324: Repetition loop — force repeat until success
# run323: Correction engine — LLM feedback quality
# run322: Voice entry MVP — speak → correct → display
# run321: Daily loop gates verified, Worker live
```

---

## STARTING NOW

**Run 321 gates check:**
- GITHUB_TOKEN: ✅
- Worker: ✅ LIVE
- Durable Objects: ✅ 5/5

**Michael, what's your call?**
- **GO?** (start Run 322 immediately)
- **PIVOT?** (different execution tier)
- **WAIT?** (need info first)
