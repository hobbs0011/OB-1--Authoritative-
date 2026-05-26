# 🚀 OBI — Product Launch Spec (HCMC Beta)

**Target:** Launch HCMC schools beta by **Month 1, Week 4**  
**Participants:** 3–5 schools, 100–200 students  
**Success Criterion:** 60%+ daily active users, 40% improvement in speaking fluency  

---

## PHASE 1: SOFT LAUNCH (Week 1–2)

### What Gets Deployed

**Live Infrastructure:**
- OBI web app (Gospel 444 UI)
- Speech recognition endpoint (Deepgram)
- Session state (Durable Objects)
- Student progress dashboard
- Teacher admin panel
- Parent notification system

**NOT in beta:**
- Advanced analytics (Phase 2)
- Multi-school reporting (Phase 3)
- API for third-party LMS (Phase 4)

### Participant Selection

**School #1 (Your Control)**
- A school you know well
- 50–100 students
- 3–5 committed teachers
- Principal who's already signed off

**School #2 (Your Contact's School)**
- Warm intro from a teacher or friend
- 30–50 students
- Open-minded principal

**School #3 (Cold Close)**
- Proves you can sell (most important)
- Any size
- Shows proof-of-concept works

### Pre-Launch Checklist

- [ ] Database schema for school, student, lesson data
- [ ] Deepgram API keys + rate limiting in place
- [ ] Gospel 444 UI theme implemented
- [ ] Error handling for speech timeouts
- [ ] Student onboarding flow (7 min max)
- [ ] Teacher dashboard live
- [ ] Parent weekly email template
- [ ] Mobile responsiveness tested iPhone 12+
- [ ] Vietnamese translation complete
- [ ] Zalo notification system (for homework reminders)

---

## PHASE 2: TEACHER TRAINING (Day 1–3)

### What Teachers Need to Know

**30-minute training pack (in-person):**

1. **How to log into dashboard** (3 min)
   - Show login screen
   - Show student list
   - Show progress tab

2. **How to assign homework** (5 min)
   - Create lesson
   - Set date/deadline
   - Send to class
   - Receive completion notifications

3. **How to read student reports** (7 min)
   - What the metrics mean
   - Common errors
   - How to intervene
   - How to share with parents

4. **How to troubleshoot** (5 min)
   - "Student can't hear audio" → Check phone volume
   - "Speech recognition not working" → Check microphone, restart app
   - "Lesson looks empty" → Refresh page
   - "I forgot my password" → Send reset link

5. **Q&A** (10 min)

**Deliverable:** Printed 1-page cheat sheet (Vietnamese)

---

## PHASE 3: STUDENT ONBOARDING (Day 1–7)

### Onboarding Flow (Mobile-First)

**Day 1 — Intro Video (2 min)**
```
"Hi, I'm OBI. I'm your English speaking coach.

My job: Help you speak English without fear.

How it works:
1. I ask you a question
2. You answer on voice
3. I correct you
4. We practice together
5. You get better

Let's start."
```

**Day 1 — First Lesson (5 min)**
```
Lesson type: Greetings

OBI: "Hello! What's your name?"
Student: [Speaks]
OBI: [Instant feedback]
"Good! You said 'My naim is...' 
The correct pronunciation is 'MY NAME IS...'

Say it with me: My Name Is..."
```

**Day 2–7 — Daily Mini-Lessons (5–10 min each)**

Target: 5–7 days of daily streaks before dropout risk

Type sequence:
- Day 1: Greetings
- Day 2: Introducing yourself
- Day 3: Numbers
- Day 4: Days/times
- Day 5: Food preferences
- Day 6: Hobbies
- Day 7: [Teacher's topic of the week]

**Gamification:**
- Streak counter (visible on home screen)
- Level progression (Easy→Medium→Hard)
- Achievements ("7 Day Streak!")
- Weekly leaderboard (class-wide, optional)

---

## PHASE 4: PARENT ENGAGEMENT (Week 1–4)

### Parent Touchpoint Strategy

**Email 1 — Day 1 (Product Intro)**
```
Subject: [School Name] launches AI speaking coach

Hi Parents,

[School] is using OBI, an AI English coach.

What it does:
- Your child gets 5–10 min daily English speaking practice
- AI corrects them in real-time
- You see progress reports weekly

Why:
- Speaking improves 40% FASTER with daily practice
- Traditional apps don't force practice (students quit)
- OBI keeps them coming back

How to help:
- Remind them daily: "Did you do your OBI?"
- Check the report link on Friday
- Celebrate wins

Report: [LINK TO VIEW STUDENT PROGRESS]

Questions? Reply to this email.

—[School]
```

**Email 2 — Week 1 (Progress Report)**
```
Subject: Your child's English progress (Week 1)

Hi [Parent Name],

Here's how [Student Name] did:

✅ Lessons completed: 5 / 7
✅ Accuracy: 72% → 78% (↑ 6 points!)
✅ Streak: 5 days running

Now speaking: Greetings, introductions, numbers

Next up: Days and times

Keep going! Consistency > perfection.

—OBI
```

**Email 3 — Week 4 (Milestone)**
```
Subject: [Student Name] hit 30-day streak!

Hi [Parent Name],

🔥 [Student Name] just completed 30 days of daily practice!

Result so far:
- Accuracy: 72% → 84% (↑ 12 points)
- Vocabulary: 30 words → 95 words
- Speaking confidence: ⭐⭐⭐⭐ (parents' feedback)

This is the point where real results show up.

Keep supporting at home (5 min daily reminder).

Next milestone: 60 days. Let's go!

—[School] + OBI
```

---

## PHASE 5: METRICS & TRACKING (Live Ops)

### Daily Tracking (School Admin Dashboard)

**Real-time:**
- Active users today (% of enrolled)
- Lessons started / completed (daily)
- Average session duration
- Speech recognition success rate (% of attempts that worked)

**Weekly rollup:**
- Total hours practiced
- Average accuracy improvement
- Top performers (students)
- Top performers (classes)
- Dropout risk (no login for 3+ days)

### Key Success Metrics (Month 1)

| Metric | Target | Threshold | Action |
|--------|--------|-----------|--------|
| **Daily Active Users** | 60%+ | <40% | Investigate, increase teacher reminders |
| **Avg Session Duration** | 8–10 min | <5 min | Reduce lesson complexity |
| **Accuracy Trend** | +5% per week | Flat | Review speech rec quality |
| **Parent Engagement** | 50% open rate | <30% | Simplify email, add call-to-action |
| **Retention (Day 30)** | 60%+ | <40% | Too hard, too easy, or boring |

### Qualitative Feedback (Weekly Interview)

**Ask 3 teachers each week:**
```
1. What's working?
2. What's broken?
3. What would make you use this MORE?
4. What would make students quit?
```

**Ask 5 students each week:**
```
1. Do you like OBI? Why / why not?
2. Is it too easy? Too hard?
3. Would you keep using it after beta?
4. What would make you quit?
```

---

## PHASE 6: LIVE SUPPORT & TROUBLESHOOTING (Week 1–4)

### Support Channels

**Slack channel:** `#obi-beta-schools`
- Teachers post problems in real-time
- You respond within 2 hours
- Log all issues for Week 2 hotfix sprint

**Whatsapp group:** OBI Beta School Principals
- Daily check-in message
- Celebrate wins
- Share student testimonials
- Address blockers same-day

### Common Issue Playbook

**"Students aren't logging in"**
→ Root causes:
- Teacher forgot to assign homework
- Student didn't get notification
- OBI link broken
- Student lost interest

**Fix:**
1. Check if teacher assigned (dashboard shows)
2. Ask teacher to manually remind via WhatsApp
3. Send push notification reminder
4. Check link works from phone
5. If all works but low engagement: lesson too hard or too boring

**"Speech recognition keeps failing"**
→ Root causes:
- Noisy classroom
- Microphone broken
- Deepgram timeout
- Student speaking too quietly

**Fix:**
1. Test microphone on a different app (record voice)
2. Quiet room best, but not required
3. Increase audio gain in Deepgram settings (+3dB)
4. Retry with clearer speech
5. If 3+ fails in a row: skip to next lesson

**"Teacher wants fewer/more lessons per week"**
→ Easy: Change in dashboard
→ Tell them: "You control frequency. Recommend 5 days/week."

---

## PHASE 7: WEEKLY REPORT CADENCE (Live Ops)

### Monday Morning (Your Ops Check)

**Review dashboard:**
- DAU trend (should be 60%+)
- Accuracy trends (should improve week-over-week)
- Top/bottom schools
- Any technical errors

**Send to schools:**
```
Subject: Week X OBI Report

Hello,

Here's the update from your students:

📊 Stats:
- Classes using OBI: 3
- Total sessions: 145
- Avg accuracy improvement: +4%

💡 Top performer: [Student Name] (18 lessons)

⚠️ Need attention: 3 students haven't logged in 2+ days
   (See attached list + suggested outreach)

Next: Week X+1 goal = 70% daily active

Questions? Reply or call.

—Michael
```

### End of Week (Friday)

**School Call (15 min, optional)**
- Share wins & wins
- Troubleshoot blockers
- Adjust anything (lesson difficulty, frequency, etc.)

---

## PHASE 8: PIVOT POINTS (If Things Go Wrong)

### If 40%+ Users Drop by Day 14

**Possible causes:**
1. Lesson difficulty too high → Reduce
2. No external reminder (teacher) → Automate via Zalo
3. Boring lessons → Increase gamification  
4. Breaking bugs → Hotfix
5. Insufficient teacher training → Retrain

**Response:**
- Pause new schools
- Full sprint on engagement fixes
- Re-launch with fixes in Week 3

### If Speech Recognition Fails >20% of Time

**Possible causes:**
1. Deepgram quality settings too strict → Lower threshold
2. Audio quality issues → Add mic check on onboarding
3. Specific accents not recognized → Deepgram model tuning

**Response:**
- Increase timeout + retry
- Log failures for analysis
- Contact Deepgram support
- Manual override option (text input fallback)

### If No Schools Convert to Paid After Pilot

**Possible causes:**
1. Results didn't show (students didn't use)
2. Pricing too high
3. Implementation too hard
4. Better competitor came in

**Response:**
- Full debrief with each pilot
- Adjust pricing
- Simplify setup
- Faster results (shorten pilot from 30 to 14 days)

---

## 🎯 LAUNCH CHECKLIST

**Pre-Launch (Week 1):**
- [ ] All 3 schools signed off on beta date
- [ ] Infrastructure in production (Cloudflare Worker)
- [ ] Deepgram API keys live + monitored
- [ ] Student onboarding video recorded (Vietnamese)
- [ ] Teacher cheat sheet printed
- [ ] Parent email template approved by schools
- [ ] Support Slack + WhatsApp groups created
- [ ] Weekly report template created
- [ ] Mobile app tested on iPhone 12, Samsung S21
- [ ] All ads/marketing point to landing page (not app yet)

**Launch Day (Week 2, Monday):**
- [ ] Send school #1 onboarding link at 8 AM
- [ ] Morning sync with all 3 school principals (30 min)
- [ ] Teacher training scheduled (Day 1 afternoon)
- [ ] First student gets onboarded (you demo live if needed)
- [ ] Slack / WhatsApp groups activated
- [ ] Daily check-in (10 min): "How's it going?"

**Week 2–4:**
- [ ] Daily DAU tracking
- [ ] Weekly reports to schools
- [ ] Weekly 1:1 with each school
- [ ] Log all feedback + bugs
- [ ] Weekly push notification to students ("Did your OBI today?")
- [ ] Monthly retrospective with schools (what to keep, what to change)

---

## 📈 SUCCESS DEFINITION

**Beta is successful if:**
- 60%+ daily active users (by Day 14)
- 40%+ improvement in speaking accuracy (by Day 30)
- 70%+ parent engagement (email opens)
- 2 of 3 schools ready to sign paid contracts (by Day 30)
- 0 critical bugs in production
- NPS ≥ 40 (would recommend to another school)

**If we hit this, Month 2 = Scale to 5–10 more schools.**

---

**This is your launch spec. Follow it day-by-day.**
