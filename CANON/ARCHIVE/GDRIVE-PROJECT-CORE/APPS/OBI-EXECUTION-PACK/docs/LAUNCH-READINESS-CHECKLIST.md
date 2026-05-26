# OBI: LAUNCH READINESS CHECKLIST (GO/NO-GO DECISION POINT)

**Date:** May 18–19, 2026  
**Purpose:** Before any student uses OBI, verify system integrity + Soul DNA + Ledger  
**Decision Owner:** You (Michael)  

---

## SECTION A: SOUL DNA INTEGRITY (MUST PASS)

### A1 — soul DNA Version Locked
- [ ] SOUL-DNA/v1.0.json exists in GitHub
- [ ] Contains founding charter dated April 19, 2026
- [ ] Core principles documented
- [ ] OBI personality defined
- [ ] Non-negotiable rules listed
- [ ] Cannot be changed without reincarnation cycle

**Failure = REINCARNATE**

### A2 — OBI System Prompt Matches Soul DNA
- [ ] Read `worker/src/agent99/obi.ts`
- [ ] Verify system prompt enforces:
  - ✅ Correction-first (not conversational)
  - ✅ One weakness per response
  - ✅ One drill per response
  - ✅ Ends with continuation hook
- [ ] Cross-reference each rule against Soul DNA v1.0

**Failure = DO NOT LAUNCH. Rewrite prompt.**

### A3 — No Drift Detected in Test Data
- [ ] Run 100 test inputs through system
- [ ] Manually review 20 responses (random sample)
- [ ] Check: Is OBI still reliable? Or becoming chatty?
- [ ] Anakin override should trigger <5% of the time
- [ ] If Anakin triggers >10%, Soul DNA validation is weak

**Failure = DO NOT LAUNCH. Strengthen validation.**

---

## SECTION B: HEAVY LEDGER INTEGRITY (MUST PASS)

### B1 — Cryptography Working
- [ ] Test SHA-256 hashing (10,000 hashes, zero collisions)
- [ ] Test Merkle tree creation (1,000 layers)
- [ ] Test root hash stability (same input = same hash, always)

**Failure = DO NOT LAUNCH. Debug crypto module.**

### B2 — Anchor System Validated
- [ ] Create 1,000 test layers (triggers 10 anchors)
- [ ] Validate backward: Does layer 100 reference layer 99?
- [ ] Validate forward: Does layer 101 reference anchor 100?
- [ ] Verify all 10 anchors pass validation

**Failure = DO NOT LAUNCH. Debug anchor logic.**

### B3 — Clamp System Validated
- [ ] Create 1,000 test layers (triggers 100 clamps)
- [ ] Random sample 20 clamps
- [ ] Verify each clamp validates backward + forward
- [ ] No errors

**Failure = DO NOT LAUNCH. Debug clamp logic.**

### B4 — Kill-Switch (2+2=5) Tested
- [ ] Intentionally break a hash (change 1 character)
- [ ] System detects error
- [ ] System returns 500 error (not 200)
- [ ] Error logged to GitHub
- [ ] System halts (does NOT continue)

**Failure = DO NOT LAUNCH. Kill-switch is your guarantee.**

### B5 — Reincarnation Checkpoint Works
- [ ] Create 500 layers
- [ ] Save checkpoint
- [ ] Delete layers
- [ ] Restore checkpoint
- [ ] Verify layers 0–499 intact
- [ ] Start new session (layer 500+)
- [ ] Verify Soul DNA still v1.0

**Failure = DO NOT LAUNCH. Reincarnation is your safety net.**

### B6 — No Data Loss Under Load
- [ ] Simulate 10 concurrent students writing layers
- [ ] Each completes 50 sessions (500 layers total)
- [ ] Total: 5,000 layers
- [ ] After completion: validate full chain
- [ ] Verify 0 layers lost, 0 hash errors

**Failure = DO NOT LAUNCH. Durable Objects might be unstable.**

---

## SECTION C: TECHNICAL INFRASTRUCTURE (MUST PASS)

### C1 — Worker Deployment
- [ ] `npm run deploy` succeeds
- [ ] No deployment errors in Cloudflare dashboard
- [ ] Production domain resolves
- [ ] Worker responding to requests

**Failure = DO NOT LAUNCH. Debug deployment.**

### C2 — All API Endpoints Live
- [ ] POST /api/chat → 200 (with response)
- [ ] GET /api/progress/:student_id → 200 (with data)
- [ ] GET /api/teacher/class/:class_id/analytics → 200 (with data)
- [ ] POST /api/admin/ledger/validate → 200 (with validation)
- [ ] All error paths return appropriate error codes

**Failure = DO NOT LAUNCH. Debug routing.**

### C3 — Durable Objects Persisting
- [ ] Write to ProfileDO
- [ ] Restart Worker
- [ ] Read ProfileDO
- [ ] Data is still there

**Failure = DO NOT LAUNCH. DO schema might be wrong.**

### C4 — Latency Acceptable
- [ ] /api/chat latency: <3 seconds
- [ ] /api/progress latency: <500ms
- [ ] /api/teacher/analytics latency: <1 second
- [ ] 99th percentile latency <4 seconds

**Failure = DO NOT LAUNCH. Optimize queries.**

### C5 — Error Logging Working
- [ ] Trigger an error
- [ ] Verify error logged to Sentry / GitHub
- [ ] Verify error includes: timestamp, stack trace, user_id, request_id

**Failure = DO NOT LAUNCH. Without visibility, you're blind.**

### C6 — Cost Tracking Active
- [ ] Cloudflare dashboard showing estimated costs
- [ ] Cost per request visible
- [ ] Daily burn rate tracked
- [ ] Budget alarm set at $10/day

**Failure = DO NOT LAUNCH. You need cost visibility.**

---

## SECTION D: LLM + AGENT 99 (MUST PASS)

### D1 — DeepSeek Integration Working
- [ ] API key configured
- [ ] Request to DeepSeek succeeds
- [ ] Response latency <2 seconds
- [ ] Fallback to OpenAI working (tested)

**Failure = DO NOT LAUNCH. No AI = no product.**

### D2 — OBI Corrections Accurate
- [ ] Test 50 real English mistakes
- [ ] Verify 90%+ corrections are actually correct
- [ ] Spot-check 10 corrections manually
- [ ] Any errors? Fix system prompt

**Failure = DO NOT LAUNCH. Bad corrections = bad product.**

### D3 — Weakness Extraction Working
- [ ] Test 50 corrections
- [ ] Verify weakness categorized correctly
- [ ] Spot-check 10 weaknesses manually
- [ ] Update taxonomy if needed

**Failure = DO NOT LAUNCH. Can't track progress without accurate weakness extraction.**

### D4 — Drill Generation Working
- [ ] Test 50 drills
- [ ] Verify drills are always valid English sentences
- [ ] Verify drills are specific to the weakness
- [ ] Check: Are students actually practicing the right thing?

**Failure = DO NOT LAUNCH. Bad drills = students don't improve.**

### D5 — Anakin Override Catches Drift
- [ ] Test 20 intentionally bad responses from Obi
- [ ] Anakin should catch 18–20
- [ ] Re-generate should fix the drift
- [ ] Check: Did Anakin succeed?

**Failure = DO NOT LAUNCH. Soul DNA validation is weak.**

---

## SECTION E: FRONTEND + USER EXPERIENCE (MUST PASS)

### E1 — Magic Chat UI Works
- [ ] Chat interface loads
- [ ] Message history visible
- [ ] Streak counter visible
- [ ] Send button works

**Failure = DO NOT LAUNCH.**

### E2 — Voice Input Works
- [ ] Click "Speak" button
- [ ] Browser asks for microphone permission
- [ ] Speak a sentence
- [ ] Transcript captured
- [ ] Request sent to backend

**Failure = DO NOT LAUNCH. Core UX is broken.**

### E3 — Voice Output Works
- [ ] AI response comes back
- [ ] TTS converts to audio
- [ ] Audio plays automatically
- [ ] Student hears correction

**Failure = DO NOT LAUNCH. Students won't practice without hearing the correction.**

### E4 — Mobile Version Works
- [ ] Test on iPhone 12 (Safari)
- [ ] Test on Android (Chrome)
- [ ] All buttons clickable
- [ ] Voice input works
- [ ] Audio plays

**Failure = DO NOT LAUNCH. 80% of your users are on mobile.**

### E5 — Teacher Dashboard Works
- [ ] Login with teacher credentials
- [ ] See class list
- [ ] See student progress
- [ ] See daily active rate
- [ ] See common weaknesses
- [ ] Data updates in real-time

**Failure = DO NOT LAUNCH. Teachers need visibility.**

### E6 — Chrome Extension Works
- [ ] Extension installed
- [ ] Visit YouTube video (ESL topic)
- [ ] Extension loads floating widget
- [ ] Click widget → magic chat appears
- [ ] Can practice speaking while watching video
- [ ] After practice → back to video

**Failure = DO NOT LAUNCH. This is your unique advantage.**

---

## SECTION F: SCHOOL READINESS (MUST PASS)

### F1 — Teachers Trained
- [ ] Training calls completed (School #1, #2, #3)
- [ ] Teachers understand:
  - How to enroll students
  - How to read the dashboard
  - How to explain OBI to students
  - How to help struggling students
- [ ] Training materials sent (English + Vietnamese)

**Failure = DO NOT LAUNCH. Teachers need to be ready.**

### F2 — Student Enrollment Links Ready
- [ ] Enrollment flow tested
- [ ] 5 test students successfully enrolled
- [ ] Teachers can generate enrollment links
- [ ] Send links to teachers

**Failure = DO NOT LAUNCH.**

### F3 — Parent Communication Ready
- [ ] Parent email template created (Vietnamese)
- [ ] Explain: what is OBI? How does it help? What to do?
- [ ] Test sending email to yourself
- [ ] Verify it looks good on mobile

**Failure = DO NOT LAUNCH. Parents are your accountability partners.**

### F4 — First Session Flow Tested
- [ ] Test student enrolls
- [ ] Test student logs in
- [ ] Test student completes 1 full session (speak → correct → drill → completed)
- [ ] Verify streak increments
- [ ] Verify weakness recorded in ProfileDO
- [ ] Verify event logged to Ledger
- [ ] Verify teacher can see progress

**Failure = DO NOT LAUNCH. This is the core product loop.**

---

## SECTION G: DATA BACKUP + DISASTER RECOVERY (MUST PASS)

### G1 — Ledger Backed Up
- [ ] Nightly backup of all student ledgers to GitHub (encrypted)
- [ ] Test restore: can you recover any student's ledger?
- [ ] Backup size tracked
- [ ] Cleanup old backups (keep last 30 days)

**Failure = DO NOT LAUNCH. You're working with student data. No backups = no safety net.**

### G2 — ProfileDO Backed Up
- [ ] Nightly backup of all ProfileDOs to GitHub
- [ ] Test restore
- [ ] Verify streak + accuracy preserved

**Failure = DO NOT LAUNCH.**

### G3 — Disaster Recovery Plan Documented
- [ ] If Worker crashes → how to restore?
- [ ] If Durable Objects corrupt → how to rebuild from backup?
- [ ] If Ledger breaks → how to reincarnate?
- [ ] If Soul DNA drifts → how to reset?
- [ ] Document each scenario + steps

**Failure = DO NOT LAUNCH. You need to know how to recover.**

---

## SECTION H: SECURITY (MUST PASS)

### H1 — API Key Security
- [ ] API keys NOT in GitHub
- [ ] API keys stored in Cloudflare secrets
- [ ] API keys rotated monthly
- [ ] Fallback key ready for emergency

**Failure = DO NOT LAUNCH. API key leaks = game over.**

### H2 — Student Data Privacy
- [ ] Student data encrypted at rest (in Durable Objects)
- [ ] Student data encrypted in transit (HTTPS only)
- [ ] No student names in logs (UUID only)
- [ ] No student audio stored (only text transcript)

**Failure = DO NOT LAUNCH. Student privacy is non-negotiable.**

### H3 — Authentication Working
- [ ] Student login works
- [ ] Teacher login works
- [ ] Admin login works
- [ ] Unauthorized requests rejected
- [ ] Session tokens expire (24 hours)

**Failure = DO NOT LAUNCH.**

---

## DECISION POINT: GO / NO-GO

**PASS ALL SECTIONS A–H?**

### ✅ YES → LAUNCH
1. Deploy to production
2. Notify schools
3. Monitor first day closely
4. Log metrics to OPERATIONS/LAUNCH-METRICS.md

### ❌ NO → REINCARNATE
1. Identify failed section
2. Fix root cause
3. Re-test failed section
4. Update reincarnation log
5. Try again (you have time until May 25)

---

## LAUNCH DAY (MAY 19) CHECKLIST

**8 AM:**
- [ ] All systems healthy (check dashboards)
- [ ] No errors in logs
- [ ] Cost under budget
- [ ] Deploy any last-minute fixes

**9 AM:**
- [ ] Call School #1 principal — ready?
- [ ] Call School #2 principal — ready?
- [ ] Call School #3 principal — ready?

**10 AM:**
- [ ] Teachers send enrollment links to students
- [ ] Monitor for first student signup

**11 AM — 5 PM:**
- [ ] Monitor dashboard every 30 minutes
- [ ] If error → fix immediately
- [ ] If unexpected behavior → capture in log
- [ ] Daily report to schools at 5 PM

**After 5 PM:**
- [ ] Summarize Day 1:
  - Students enrolled?
  - Sessions completed?
  - Corrections accurate?
  - Ledger healthy?
  - Cost on track?
- [ ] Log to OPERATIONS/LAUNCH-METRICS.md
- [ ] Sleep

---

## IF LAUNCH FAILS (CONTINGENCY)

**If >1 critical bug found in first 24 hours:**

1. **HALT** — Stop accepting new students
2. **ISOLATE** — Identify exactly what broke
3. **REINCARNATE** — Create checkpoint, fix issue, restore
4. **COMMUNICATE** — Tell schools "brief maintenance, back online in 2 hours"
5. **RETRY** — Re-launch after fix verified

**This is why the Ledger + Soul DNA exists.** You can survive failure if you preserve the intent.

---

## FINAL TRUTH

**You will not be perfect on Day 1.**

There will be bugs. Students will find them. Teachers will complain. That's OK.

What matters is:

1. ✅ Soul DNA is preserved (you know what you're building)
2. ✅ Ledger is immutable (you have proof of what happened)
3. ✅ System can reincarnate (you can fix and restart)
4. ✅ Students are learning (that's your only real metric)

If you hit launch day with all Section A–H passing, you have everything you need.

Trust the system. Ship it. Fix it in production.

Go.

