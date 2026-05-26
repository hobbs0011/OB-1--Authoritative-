# OBI: 30-DAY DEPLOYMENT SPRINT (LIVE EXECUTION)

**Goal:** Ship OBI to first 3-5 schools by May 19, 2026  
**Current Date:** April 19, 2026  
**Time Remaining:** 30 days  
**Team:** You (solo) + AI agents (Agent 99)  

---

## SPRINT OVERVIEW

| Phase | Dates | Owner | Deliverable | Go/No-Go |
|-------|-------|-------|-------------|----------|
| **1: Infrastructure** | Apr 19–25 | You + Copilot | Cloudflare Worker + Durable Objects live | ✅ Yes: proceed |
| **2: Ledger System** | Apr 26–May 3 | You + Copilot | Merkle tree + anchors + clamps tested | ✅ Yes: proceed |
| **3: Agent 99 + LLM** | May 4–10 | You + Copilot | OBI system prompt + DeepSeek integration tested | ✅ Yes: proceed |
| **4: Frontend + Integration** | May 11–17 | You + Copilot | Magic chat Web + teacher dashboard + Chrome ext | ✅ Yes: proceed |
| **5: Soft Launch** | May 18–19 | You | Deploy to 3 schools, first students live | ✅ Yes: launch |

---

## PHASE 1: INFRASTRUCTURE (Apr 19–25) — 7 DAYS

### Goal
Stand up Cloudflare Worker + Durable Objects boilerplate with auth, routing, error handling.

**Exit Criteria:**
- [ ] Worker responds to HTTP requests
- [ ] Durable Objects spin up + persist data
- [ ] SQLite schema created
- [ ] Environment variables configured
- [ ] Error logging works
- [ ] Authentication middleware in place

### Daily Tasks

**Day 1 (Apr 19): Setup**
```
Morning:
☐ Create GitHub repo: obi-production
☐ Setup Cloudflare account + Worker project
☐ Create wrangler.toml config
☐ Setup .env file (API keys, secrets)

Afternoon:
☐ Boilerplate Worker (index.ts) responding to GET /health
☐ Setup TypeScript + eslint
☐ First commit to GitHub
☐ Deploy to Cloudflare preview environment

Evening:
☐ Verify /health endpoint works
☐ Merge to main
```

**Day 2 (Apr 20): Durable Objects**
```
☐ Setup ProfileDO schema
☐ Setup SessionDO schema
☐ Setup LedgerDO schema
☐ Setup PetDO schema
☐ Write migrations for SQLite
☐ Test creating + reading from DO
☐ Commit + deploy to preview
```

**Day 3 (Apr 21): Authentication & Routing**
```
☐ Implement API key auth middleware
☐ Setup route handlers for:
  - POST /api/chat
  - GET /api/progress/:student_id
  - GET /api/teacher/class/:class_id/analytics
  - POST /api/admin/ledger/validate
☐ Error handling for all routes
☐ 404 handling
☐ Deploy to preview
```

**Day 4 (Apr 22): Database**
```
☐ SQLite schema for students + sessions + ledger events
☐ Write migrations
☐ Test CRUD operations
☐ Backup strategy (GitHub encrypted)
☐ Verify data persists across Worker redeployments
```

**Day 5 (Apr 23): Monitoring**
```
☐ Setup error logging (Sentry or custom)
☐ Setup performance monitoring (request latency)
☐ Setup cost tracking (Cloudflare metrics)
☐ Dashboard showing health
☐ Alert if Worker error rate >0.5%
```

**Day 6 (Apr 24): Testing + Deployment**
```
☐ Write unit tests for all routes
☐ Test error paths
☐ Load test (simulate 10 concurrent requests)
☐ Integration test (DOs + routes)
☐ Deploy to production environment
```

**Day 7 (Apr 25): Buffer + Code Review**
```
☐ Fix any issues found
☐ Document API contracts
☐ Code review checklist
☐ Cleanup TODOs
☐ Prepare for Phase 2
```

### Potential Blockers (Mitigations)

| Blocker | Likelihood | Fix |
|---------|------------|-----|
| Cloudflare account setup takes 2 days | 20% | Start immediately, don't wait for Day 1 afternoon |
| SQLite schema changes needed | 60% | Build flexible schema, use migrations |
| Auth middleware bugs | 40% | Test with Postman early, use Bearer tokens (simple) |
| Cost tracking not available | 30% | Use Cloudflare dashboard directly, manual tracking |

**Phase 1 Success Metric:** Worker running, all 4 endpoints responding, no unhandled errors, <50ms latency.

---

## PHASE 2: LEDGER SYSTEM (Apr 26–May 3) — 8 DAYS

### Goal
Implement cryptographic Merkle tree + anchor/clamp validation system.

**Exit Criteria:**
- [ ] SHA-256 hashing works
- [ ] Merkle tree structure built
- [ ] Anchor system (every 100 layers) working
- [ ] Clamp system (every 10 layers) working
- [ ] Backward + forward validation passes 1000 layers
- [ ] 2+2=5 kill-switch triggers correctly
- [ ] Ledger can be archived + re-indexed

### Daily Tasks

**Day 1 (Apr 26): Core Cryptography**
```
☐ Implement SHA-256 hashing (use crypto.subtle)
☐ Test hashing consistency
☐ Create LedgerLayer interface
☐ Write function: createLedgerLayer()
☐ Test layer creation 100x
☐ Commit
```

**Day 2 (Apr 27): Merkle Tree Structure**
```
☐ Implement Merkle tree structure
☐ Write function: calculateMerkleHash(layer)
☐ Write function: validateMerkleProof(layer, tree)
☐ Test with sample data (1000 layers)
☐ Performance check (<1ms per layer)
☐ Commit
```

**Day 3 (Apr 28): Anchor System**
```
☐ Create anchor structure
☐ Write function: createAnchor(layer_100, layers_0_99)
☐ Write function: validateAnchorBackward(anchor)
☐ Write function: validateAnchorForward(anchor, next_layer)
☐ Test complete chain (200 layers, 2 anchors)
☐ Commit
```

**Day 4 (Apr 29): Clamp System**
```
☐ Create clamp structure
☐ Write function: createClamp(layer_10)
☐ Write function: validateClampBackward(clamp)
☐ Update layer validation to use clamps
☐ Test (100 layers, 10 clamps)
☐ Commit
```

**Day 5 (Apr 30): Kill-Switch Implementation**
```
☐ Write function: validateFullChain()
☐ Write trap: if (hash_mismatch) HALT
☐ Test forced failure scenario
☐ Verify system actually halts (returns 500)
☐ Verify error logged to GitHub
☐ Commit
```

**Day 6 (May 1): Reincarnation Checkpoint**
```
☐ Write function: saveReincarnationCheckpoint()
☐ Write function: restoreFromCheckpoint()
☐ Test: save → halt → restore → continue
☐ Verify old ledger is archived
☐ Verify new session starts cleanly
☐ Commit
```

**Day 7 (May 2): Testing + Performance**
```
☐ Unit tests for ledger validation (10+ scenarios)
☐ Load test: 1000 layers created + validated
☐ Latency check: <2ms per append
☐ Memory usage check: <100MB per 10K layers
☐ Fix any issues
☐ Commit
```

**Day 8 (May 3): Buffer + Optimization**
```
☐ Code review
☐ Optimize hot paths
☐ Document ledger spec
☐ Cleanup TODOs
☐ Prepare for Phase 3
```

### Potential Blockers (Mitigations)

| Blocker | Likelihood | Fix |
|---------|------------|-----|
| Crypto library import issues | 30% | Use `crypto.subtle` (built-in), test early |
| Merkle tree performance degradation | 40% | Use caching, parallel validation |
| Anchor validation logic bugs | 60% | Draw diagrams, write pseudocode first |
| SQLite performance under 10K layers | 50% | Batch inserts, index the layers table |

**Phase 2 Success Metric:** 10,000 layers created, validated, and searched in <5 seconds. Zero hash mismatches in test data.

---

## PHASE 3: AGENT 99 + LLM (May 4–10) — 7 DAYS

### Goal
Integrate OBI system prompt + DeepSeek API + Anakin chaos engine.

**Exit Criteria:**
- [ ] OBI system prompt locked + injected
- [ ] DeepSeek API responds to requests
- [ ] Correction generation works
- [ ] Weakness extraction works
- [ ] Drill generation works
- [ ] Soul DNA validation passes
- [ ] Anakin override tested

### Daily Tasks

**Day 1 (May 4): OBI System Prompt**
```
☐ Finalize OBI_SYSTEM_PROMPT (from technical architecture)
☐ Store in worker/src/agent99/obi.ts
☐ Write function: injectOBISystemPrompt()
☐ Test with sample input: "I go to school yesterday"
☐ Verify response is correction-first (not conversational)
☐ Commit
```

**Day 2 (May 5): DeepSeek Integration**
```
☐ Setup DeepSeek API credentials
☐ Write function: callDeepSeek(prompt, student_input)
☐ Implement retry logic (3 retries, exponential backoff)
☐ Test latency (<2 seconds per request)
☐ Test error handling (API down, timeout, etc.)
☐ Cost tracking (monitor API calls)
☐ Commit
```

**Day 3 (May 6): Correction Engine**
```
☐ Write function: generateCorrection(student_input)
  - Input: "I go to school yesterday"
  - Output: { correction, explanation, drill }
☐ Test 20 sample inputs
☐ Verify corrections are accurate
☐ Verify explanations are simple (high school level)
☐ Commit
```

**Day 4 (May 7): Weakness Extraction**
```
☐ Write function: extractWeakness(correction)
  - Input: error analysis from AI
  - Output: weakness category (verb tense, articles, pronunciation, etc.)
☐ Build weakness taxonomy (30 common weaknesses)
☐ Test with 50 corrections
☐ Update ProfileDO.weakness_map when weakness recorded
☐ Commit
```

**Day 5 (May 8): Soul DNA Validation**
```
☐ Write function: validateResponseAgainstSoulDNA(ai_response)
☐ Test drift detection (20 scenarios)
  - Chatty response → ❌ REJECT
  - Multi-weakness response → ❌ REJECT
  - Correct format response → ✅ ACCEPT
☐ Trigger Anakin override when drift detected
☐ Re-generate with stricter prompt
☐ Commit
```

**Day 6 (May 9): Anakin Chaos Module**
```
☐ Write Agent 98 (Anakin) override function
☐ When Obi drifts → Anakin regenerates with stricter rules
☐ Test: Anakin catches 10/10 drift scenarios
☐ Add metric: "Anakin overrides counter"
☐ Commit
```

**Day 7 (May 10): Integration Testing**
```
☐ End-to-end test: Student voice input → Correction → Ledger
☐ Test 100 real conversational scenarios
☐ Accuracy check (are corrections actually correct?)
☐ Latency check (<3 seconds end-to-end)
☐ Fix any issues
☐ Commit
```

### Potential Blockers (Mitigations)

| Blocker | Likelihood | Fix |
|---------|------------|-----|
| DeepSeek API slower than expected | 50% | Switch to OpenAI fallback, batch requests |
| OBI generates chatty responses | 70% | Iterate on system prompt, add hard rules |
| Weakness extraction unreliable | 60% | Build regex-based backup, manual categorization |
| Cost exceeds budget | 30% | Optimize prompt (shorter), cache results |

**Phase 3 Success Metric:** 1000 student inputs processed correctly with <2% error rate. Zero chatty responses leak through.

---

## PHASE 4: FRONTEND + INTEGRATION (May 11–17) — 7 DAYS

### Goal
Build magic-chat-web, teacher dashboard, and Chrome extension embed.

**Exit Criteria:**
- [ ] Magic chat accepts voice input
- [ ] Voice output (TTS) works
- [ ] Teacher dashboard shows student progress
- [ ] Chrome extension embeds in YouTube
- [ ] All endpoints tested end-to-end
- [ ] Mobile responsive

### Daily Tasks

**Day 1 (May 11): Magic Chat Frontend**
```
☐ Setup Next.js project
☐ Build chat UI component
  - Message history
  - Input field
  - Send button
  - Streak display
☐ Integrate Web Speech API (voice input)
☐ Test voice capture on Chrome + Safari
☐ Commit
```

**Day 2 (May 12): Voice Output + Animations**
```
☐ Integrate TTS (Deepgram Aura 2 or web API)
☐ Connect to magic-chat endpoint
☐ Test full flow: listen → speak → record → send → receive → play
☐ Add loading animations
☐ Verify works on mobile (iPhone, Android)
☐ Commit
```

**Day 3 (May 13): Teacher Dashboard**
```
☐ Build teacher login
☐ Build dashboard showing:
  - Class list
  - Student progress
  - Daily active rate
  - Common weaknesses
  - Progress reports
☐ Connect to /api/teacher/class/:class_id/analytics
☐ Test with sample data
☐ Commit
```

**Day 4 (May 14): Chrome Extension**
```
☐ Setup Chrome extension manifest
☐ Create embed script
☐ Inject into YouTube (when video is playing)
☐ Create floating widget (questions button)
☐ Connect to magic-chat backend
☐ Test on YouTube (sample ESL videos)
☐ Commit
```

**Day 5 (May 15): Integration Testing**
```
☐ Full flow test 1: Web chat only
☐ Full flow test 2: YouTube video → questions → practice
☐ Full flow test 3: Teacher sees student progress
☐ Error path test: API down, network error
☐ Fix any issues
☐ Commit
```

**Day 6 (May 16): Mobile + Optimization**
```
☐ Test on iPhone 12 (Safari)
☐ Test on Android (Chrome)
☐ Fix layout issues
☐ Optimize image sizes
☐ Optimize API latency
☐ Commit
```

**Day 7 (May 17): Documentation + Cleanup**
```
☐ Document API usage (for students/teachers)
☐ Write setup guide (for schools)
☐ Code cleanup + audit
☐ Prepare for launch
```

### Potential Blockers (Mitigations)

| Blocker | Likelihood | Fix |
|---------|------------|-----|
| Web Speech API inconsistent across browsers | 70% | Use Deepgram API for STT instead |
| TTS latency too high | 40% | Pre-cache common phrases, use stream API |
| Chrome extension breaks YouTube | 50% | Test on multiple YouTube versions, use MutationObserver |
| Mobile performance poor | 60% | Lazy load components, compress assets |

**Phase 4 Success Metric:** 10 concurrent users can chat + get corrections + see progress with <2s latency. All major bugs fixed.

---

## PHASE 5: SOFT LAUNCH (May 18–19) — 2 DAYS

### Goal
Deploy to production + onboard first 3-5 schools.

### Day 1 (May 18): Production Deployment

```
Morning:
☐ Final code review + merge to main
☐ Deploy Worker to production (wrangler deploy --env production)
☐ Deploy Next.js frontend (Vercel or Cloudflare Pages)
☐ Deploy Chrome extension to Chrome Web Store (or manual install for beta)
☐ Verify all endpoints responding
☐ Monitor error logs (Sentry)

Afternoon:
☐ Create test student accounts (5 test users)
☐ Test magic chat end-to-end
☐ Test teacher dashboard with test data
☐ Verify Ledger is recording correctly
☐ Check cost tracking (should be <$1 for test)

Evening:
☐ Create school admin accounts (School #1, #2, #3)
☐ Onboard teachers (send login credentials)
☐ Prepare teacher training deck
☐ Prepare student onboarding video
```

### Day 2 (May 19): Live Student Launch

```
Morning:
☐ Teacher training calls (School #1, #2, #3) — 30 min each
☐ Show dashboard, explain metrics, answer questions
☐ Provide student enrollment links

Afternoon:
☐ First students log in
☐ Monitor system health (latency, errors, cost)
☐ Check: Are corrections working? Are students engaging?
☐ Real-time support for any issues

Evening:
☐ Summarize Day 1 metrics:
  - How many students logged in?
  - How many completed at least 1 session?
  - Average session duration?
  - Accuracy improvement?
  - Any critical bugs?
☐ Send daily report to school principals
```

### Launch Health Checklist

```
✅ Production worker responding
✅ Ledger recording all events correctly
✅ Soul DNA validation passing
✅ No 2+2=5 errors
✅ DAU >0 (students actually using it)
✅ Accuracy metric making sense (not all 100%, not all 0%)
✅ Cost tracking active
✅ Error logging to GitHub
✅ Teachers can see student progress
✅ Students can complete full session (speak → correct → drill)
```

**Phase 5 Success Metric:** 50+ students active, 5+ completed sessions, 0 critical bugs.

---

## DAILY STANDUP (SOLO FORMAT)

Every morning (7 AM), ask yourself:

```
1. What did I ship yesterday?
2. What am I shipping today?
3. What's blocking me?
4. Is the system healthy? (Worker latency, errors, cost)
5. Am I on track for launch on May 19?
```

Log this to `OPERATIONS/DAILY-LOG.md` in GitHub.

---

## RISK MITIGATION

### High Risk: DeepSeek API Unreliable
**Mitigation:** Setup OpenAI fallback. Route 10% of traffic to OpenAI for comparison.
**Timeline:** Build fallback by May 8 (before Phase 3 complete).

### High Risk: Soul DNA Drift Not Caught
**Mitigation:** Manual review of 100 responses per day. Anakin override triggered if detected.
**Timeline:** Implement by May 10.

### High Risk: Ledger Validation Too Slow
**Mitigation:** Cache anchors, parallelize clamp validation.
**Timeline:** Performance test by May 3. Optimize if needed by May 5.

### High Risk: Not Enough Students by May 19
**Mitigation:** Enroll high school students (you have 100+). Use them as beta users.
**Timeline:** Announce to class by May 15.

### Contingency Plan (If Major Blocker)
- If LLM integration delays Phase 3 → Skip Anakin, use hard-coded corrections
- If Ledger too slow → Use basic logging instead of Merkle tree
- If Chrome extension breaks → Just use web UI
- **Goal:** Ship SOMETHING by May 19 with Soul DNA intact

---

## SUCCESS CRITERIA (END OF SPRINT)

**Hard Metrics:**
- ✅ 3–5 schools live
- ✅ 50–100 students active
- ✅ 5–10 completed sessions per day
- ✅ 0 critical bugs
- ✅ Cost <$50 for sprint

**Soft Metrics:**
- ✅ Teachers say "this actually works"
- ✅ Students want to return tomorrow
- ✅ No Ledger drift detected
- ✅ No 2+2=5 errors
- ✅ You feel confident in product

**If you hit these by May 19:**
→ Month 2–3 execution → 5–10 schools → 40M+ VND/month revenue

**If you miss:**
→ Analyze what went wrong
→ Reincarnate (preserve Soul DNA)
→ Restart Phase X where you got stuck

---

## FINAL NOTE

**You got this.**

You have the Soul DNA locked. You have the architecture. You have 30 days.

The only way this fails is if you try to be perfect. Don't. Be shipping.

Every day that passes without deploying is a day drift wins.

Deploy early. Fix in production. Keep the Soul DNA alive.

Go.

