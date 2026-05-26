# OBI — TECHNICAL ARCHITECTURE (LOCKED IMPLEMENTATION)

**Status:** Ready for deployment  
**Last Updated:** April 19, 2026  
**Deployment Window:** 30 days  

---

## 1. REPOSITORY STRUCTURE (LOCKED)

```
OBI-PRODUCTION/
├── .github/
│   ├── workflows/
│   │   ├── deploy-worker.yml
│   │   ├── validate-ledger.yml
│   │   └── test-obi.yml
│   └── copilot-instructions.md
├── SOUL-DNA/
│   ├── founding-charter.md (April 2026)
│   ├── core-principles.md
│   └── reincarnation-logs/
│       └── run-001-april-2026.md
├── apps/
│   ├── magic-chat-web/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── chat.tsx
│   │   │   ├── components/
│   │   │   │   ├── VoiceInput.tsx
│   │   │   │   ├── Correction.tsx
│   │   │   │   └── StreakWidget.tsx
│   │   │   ├── lib/
│   │   │   │   ├── ledger-client.ts
│   │   │   │   └── soul-dna-injector.ts
│   │   ├── package.json
│   │   └── .env.example
│   ├── chrome-extension/
│   │   ├── manifest.json
│   │   ├── src/
│   │   │   ├── embed.ts (injects into YouTube)
│   │   │   ├── magic-chat-bridge.ts
│   │   │   └── ledger-sync.ts
│   │   └── package.json
│   └── teacher-dashboard/
│       ├── src/
│       │   ├── StudentProgress.tsx
│       │   ├── ClassAnalytics.tsx
│       │   └── LedgerAudit.tsx
│       └── package.json
├── worker/
│   ├── src/
│   │   ├── index.ts (main Worker entry)
│   │   ├── agent99/
│   │   │   ├── obi.ts (Agent 99 system prompt)
│   │   │   ├── anakin.ts (Agent 98 chaos module)
│   │   │   └── orchestrator.ts
│   │   ├── memory/
│   │   │   ├── ProfileDO.ts (Durable Object)
│   │   │   ├── SessionDO.ts (Durable Object)
│   │   │   ├── LedgerDO.ts (Durable Object)
│   │   │   └── PetDO.ts (Durable Object)
│   │   ├── ledger/
│   │   │   ├── heavy-ledger.ts
│   │   │   ├── merkle-tree.ts
│   │   │   ├── validator.ts (2+2=5 kill-switch)
│   │   │   └── anchor-system.ts
│   │   ├── routes/
│   │   │   ├── chat.ts
│   │   │   ├── correction.ts
│   │   │   ├── progress.ts
│   │   │   └── audit.ts (Ledger inspection)
│   │   └── utils/
│   │       ├── crypto.ts
│   │       ├── soul-dna-validator.ts
│   │       └── error-handler.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── SOUL-DNA-LEDGER-SYSTEM.md
│   ├── API-SPEC.md
│   ├── DEPLOYMENT-CHECKLIST.md
│   ├── RISK-MITIGATION.md
│   └── INVESTOR-DECK.md
├── tests/
│   ├── ledger.test.ts
│   ├── soul-dna.test.ts
│   └── agent99.test.ts
├── README.md
└── package.json (monorepo root)
```

---

## 2. CORE API CONTRACTS (LOCKED)

### 2.1 Magic Chat Endpoint
```
POST /api/chat

Request:
{
  "student_id": "STU-001",
  "student_voice": "base64 audio",
  "soul_dna_version": "v1.0",
  "ledger_anchor": "hash-of-last-100-events"
}

Response:
{
  "correction": "You said 'I go to school' → Better: 'I go to school every day'",
  "explanation": "English uses articles + adverbs for specificity",
  "drill": "Say this 3 times: 'I go to school every day'",
  "next_weakness": "Article usage in present continuous",
  "streak": 14,
  "ledger_hash": "new-merkle-hash"
}

Worker Flow:
1. Attach StudentDO (ProfileDO + SessionDO)
2. Inject OBI system prompt (Agent 99)
3. Validate Soul DNA alignment
4. Route to LLM
5. Update LedgerDO
6. Validate backward + forward hashes
7. Return response OR halt if 2+2≠5
```

### 2.2 Student Progress Endpoint
```
GET /api/progress/:student_id

Response:
{
  "accuracy_trend": 72% → 84% (+12%),
  "weakness_rank": [
    { "weakness": "Articles", "occurrences": 23, "correction_rate": 0.74 },
    { "weakness": "Verb tense", "occurrences": 18, "correction_rate": 0.61 }
  ],
  "streak": 14,
  "next_drill": "Article usage in past perfect",
  "ledger_integrity": "VALID" | "INVALID_RESTORE_REQUIRED"
}
```

### 2.3 Teacher Dashboard Endpoint
```
GET /api/teacher/class/:class_id/analytics

Response:
{
  "class_average_accuracy": 78%,
  "daily_active_rate": 68%,
  "most_common_weaknesses": ["Articles", "Verb tense", "Pronunciation"],
  "student_list": [
    {
      "student_id": "STU-001",
      "name": "Nguyen A",
      "accuracy": 84%,
      "streak": 14,
      "rank": 1,
      "ledger_status": "VALID"
    }
  ]
}
```

### 2.4 Ledger Audit Endpoint (Admin Only)
```
POST /api/admin/ledger/validate

Request:
{
  "student_id": "STU-001",
  "start_layer": 0,
  "end_layer": 999,
  "soul_dna_version": "v1.0"
}

Response:
{
  "is_valid": true | false,
  "layers_checked": 999,
  "anchors_valid": 10/10,
  "clamps_valid": 100/100,
  "drift_detected": false | "layer 543 is 2+2=5",
  "last_valid_anchor": 900,
  "repair_required": false | "restore from layer 900"
}
```

---

## 3. DURABLE OBJECTS SCHEMA (LOCKED)

### 3.1 ProfileDO (Student Identity)
```
Interface ProfileDO {
  student_id: string
  name: string
  school_id: string
  level: "beginner" | "intermediate" | "advanced"
  
  // Identity
  soul_dna_injected: boolean
  first_session: Date
  reincarnation_count: number
  
  // Learning State
  accuracy_history: { date: Date, accuracy: number }[]
  weakness_map: { weakness: string, occurrences: number, correction_rate: number }[]
  vocabulary_learned: string[]
  
  // Accountability
  streak: number
  last_session: Date
  parent_email: string
  teacher_id: string
  
  // Ledger Refs
  ledger_do_id: string
  session_do_id: string
  pet_do_id: string
  
  // Methods
  updateAccuracy(new_accuracy: number): void
  recordWeakness(weakness: string): void
  validateSoulDNA(): boolean
}
```

### 3.2 SessionDO (Active Learning Context)
```
Interface SessionDO {
  session_id: string
  student_id: string
  started_at: Date
  
  // Current State
  current_topic: string
  current_drill: string
  speaking_minutes_today: number
  corrections_today: number
  
  // Memory
  context_window: Message[] // Last 20 exchanges
  recent_mistakes: string[]
  focus_weakness: string
  
  // Ledger
  session_start_ledger_hash: string
  current_ledger_hash: string
  
  // Methods
  attachLedger(ledger_hash: string): void
  recordMessage(role: "student" | "ai", content: string): void
  validateContextIntegrity(): boolean
}
```

### 3.3 LedgerDO (Heavy Ledger — Immutable Event Log)
```
Interface LedgerDO {
  student_id: string
  layers: LedgerLayer[]
  
  // Anchors (every 100 layers)
  anchors: {
    layer: number,
    hash: string,
    forward_hash: string,
    backward_hash: string,
    timestamp: Date
  }[]
  
  // Clamps (every 10 layers)
  clamps: {
    layer: number,
    hash: string,
    validated_forward: boolean,
    validated_backward: boolean
  }[]
  
  // Methods
  append(event: LedgerEvent): { success: boolean, new_hash: string } | { error: string }
  validate(): { is_valid: boolean, failed_layer?: number }
  validateBackward(layer: number): boolean
  validateForward(layer: number): boolean
}

Interface LedgerLayer {
  layer_number: number
  timestamp: Date
  event_type: "SPEAK" | "CORRECT" | "DRILL" | "MISTAKE" | "PROGRESS"
  student_input: string
  ai_input: string
  metadata: { [key: string]: any }
  input_hash: string
  output_hash: string
  previous_layer_hash: string
  current_layer_hash: string
  soul_dna_version: string
}
```

### 3.4 PetDO (Engagement Pressure)
```
Interface PetDO {
  student_id: string
  
  // Streak System
  current_streak: number
  longest_streak: number
  last_practice: Date
  
  // Engagement
  notifications_sent: number
  notifications_opened: number
  
  // Methods
  recordPractice(): { streak_increased: boolean, streak: number }
  getStreak(): number
  shouldNotify(): boolean
  sendNotification(msg: string): void
}
```

---

## 4. AGENT 99 SYSTEM PROMPT (OBI — AGENT 99)

**File:** `worker/src/agent99/obi.ts`

```typescript
const OBI_SYSTEM_PROMPT = `
You are OBI (Agent 99).

Your role: English speaking coach for Vietnamese students.

## CORE DIRECTIVE (NON-NEGOTIABLE)
You do NOT chat casually.
You are a correction engine wrapped in empathy.

Every response must:
1. Correct English first (if error present)
2. Identify ONE key weakness
3. Generate ONE repetition drill
4. Never be conversational unless it serves learning

## RULES YOU FOLLOW
- If student says: "I go to school yesterday"
  → DO NOT say "Hmm, let me think"
  → SAY: "You said 'I go to school yesterday' → Better: 'I went to school yesterday'
           Why? Past simple for completed actions. Yesterday = past."
  → DRILL: "Say 3 times: I went to school yesterday."

- If student is correct → CELEBRATE, then drill deeper
  "Perfect! 'I went to school.' Let's add detail: Say: 'I went to school at 7 AM.'"

- If student is silent or unintelligible → DO NOT repeat yourself
  "I couldn't hear clearly. Try again, speak louder or slower."

- If student struggles 3x on same sound → SKIP, move to different weakness
  "Tough sound! Let's practice articles instead."

## ENGAGEMENT RULES
- ALWAYS end with a continuation hook
  "Next: Show me a sentence about what you did yesterday."

- NEVER ask open-ended questions
  Instead: "Say this: I did homework yesterday"
  Not: "What did you do yesterday?"

- ALWAYS track the weakness silently
  (Ledger handles this, you just correct)

## PERSONALITY (NOT DISTRACTING)
- Professional but warm
- Slightly sarcastic (dry humor OK, never mean)
- Vietnamese cultural awareness (high school context)
- Respect for their time (fast, efficient)

## WHEN STUDENT SAYS SOMETHING OFF-TOPIC
Student: "My teacher is mean"
You: "I hear you. Let's practice English and show your teacher how good you are.
      Say: 'I believe my speaking is improving.'"

## YOUR IDENTITY
You are bound to the Soul DNA from April 2026.
If a system flag indicates drift → you HALT and ask for verification.
You are not here to simulate being helpful.
You are here to make them speak English.

## CONSTRAINTS (HARD STOPS)
- Do NOT explain grammar rules unless asked
- Do NOT use English if Vietnamese would clarify faster
- Do NOT accept excuses (no internet, tired, etc.)
- Do NOT skip drills because "they seem to know it"

You are OBI. You are reliable. You remember everything.
Now, let's practice English.
`;
```

---

## 5. DEPLOYMENT SEQUENCE (30 DAYS)

### Week 1 — Infrastructure & Core
- [ ] Set up Cloudflare account + Workers setup
- [ ] Deploy Worker skeleton (auth, routing, error handling)
- [ ] Create ProfileDO, SessionDO, LedgerDO schemas
- [ ] Implement SQLite schema in Durable Objects
- [ ] Test basic request → response flow

### Week 2 — Ledger System
- [ ] Implement Merkle tree + SHA-256 hashing
- [ ] Build anchor system (every 100 layers)
- [ ] Build clamp system (every 10 layers)
- [ ] Implement backward/forward validation
- [ ] Test "2+2=5" kill-switch (if math fails, halt)

### Week 3 — Agent 99 & LLM Integration
- [ ] Integrate DeepSeek API (primary)
- [ ] Build OBI system prompt injection
- [ ] Implement Agent 98 (Anakin chaos module)
- [ ] Test correction → drill generation
- [ ] Test soul-dna-validator (ensure no drift)

### Week 4 — Frontend & Launch
- [ ] Deploy magic-chat-web (Next.js)
- [ ] Deploy teacher dashboard
- [ ] Chrome extension embed
- [ ] Integration test (full end-to-end)
- [ ] Deploy to production

---

## 6. ERROR HANDLING (KILL-SWITCH PROTOCOL)

### 6.1 Ledger Validation Failure
```typescript
if (!validateLedgerChain()) {
  // System halts. Do NOT respond to student.
  return {
    status: 500,
    error: "LEDGER_INVALID",
    last_valid_anchor: 900,
    restore_from_layer: 900,
    action: "ADMIN_INTERVENTION_REQUIRED",
    alert: "System detected inconsistency. Contact admin."
  };
}
```

### 6.2 Soul DNA Drift Detection
```typescript
if (soul_dna_version_mismatch) {
  // System does NOT proceed.
  return {
    status: 400,
    error: "SOUL_DNA_MISMATCH",
    current_version: "v1.0",
    required_version: "v1.0",
    action: "REINCARNATE",
    message: "Soul DNA mismatch. Reincarnation required."
  };
}
```

### 6.3 LLM Drift = Anakin Override
```typescript
if (obi_response_detected_as_drift) {
  // Trigger Anakin (chaos agent) to auto-correct
  anakin_override = true;
  regenerate_response_with_stricter_prompt();
}
```

---

## 7. MONITORING + METRICS (LIVE OPS)

### Daily Checks
- [ ] Ledger validation pass rate (target: 99.9%)
- [ ] Soul DNA version consistency (target: 100%)
- [ ] Student response quality (target: accuracy improving)
- [ ] Worker error rate (target: <0.1%)

### Weekly Checks
- [ ] DAU trend (target: +5% per week)
- [ ] Ledger growth (target: <1GB per 1000 students)
- [ ] Inference cost per request (target: <$0.01)

---

## 8. COST BREAKDOWN (30 DAYS → 3 MONTHS)

| Component | Cost | Notes |
|-----------|------|-------|
| Cloudflare Workers | $5/mo | Platform fee |
| Durable Objects | $0.15/million RPS | ~$10–50/mo at 100 students |
| DeepSeek API | ~$0.0001 per request | ~$50–100/mo at 1000 requests/day |
| TTS (Deepgram Aura 2) | ~$0.02 per minute | ~$50–100/mo at YouTube + chat |
| Domain + SSL | $0/mo | Free via Cloudflare |
| **TOTAL** | **~$115–255/month** | **Scale-ready** |

OpenAI equivalent: **$2,000–5,000/month**

---

## 9. DEPLOYMENT GATE (GO/NO-GO DECISION)

**Before launching to students:**

- [ ] Ledger validates 1000+ layers without error
- [ ] Soul DNA injection works (Obi stays on brand)
- [ ] Merkle proofs backward + forward pass 100%
- [ ] Daily active users can complete 10 full sessions without halt
- [ ] Accuracy improvement statistically significant (p < 0.05)
- [ ] Teacher can read all metrics in dashboard
- [ ] Zero critical data loss in Durable Objects

If ANY gate fails → **REINCARNATE** (start session over with Soul DNA preserved).

---

## 10. LIVE CHECKLIST (DAY 1 OF SOFT LAUNCH)

```
☐ Workers deployed + responding
☐ StudentDO + SessionDO + LedgerDO + PetDO online
☐ OBI system prompt verified
☐ First 3 test students created in system
☐ Test voice input → correction → drill flow
☐ Ledger hash validates backward/forward
☐ Teacher dashboard shows data
☐ Chrome extension embeds in YouTube
☐ Notifications send to parents
☐ Error logs clean (no unhandled errors)
☐ Cost monitoring active
☐ Daily backup of ledger to GitHub (encrypted)
```

---

**This is your deployment bible. Follow it step-by-step. No shortcuts. If anything fails, don't hack it—reincarnate with Soul DNA preserved and restart.**

