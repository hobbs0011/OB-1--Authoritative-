# OBI System Map — Full Ship Spec

Production blueprint: architecture, code, UX, memory brain, pricing, growth.

## 1. Core Definition (Locked)

```text
OBI = Stateful English learning continuity system

Core loop:
Speak → Correct → Store → Re-practice → Return

Category: behavioral repetition engine for human skill formation
```

If this loop does not improve, nothing else is success.

The model is replaceable. The memory is not.

OBI is NOT an AI tutor. OBI is a reinforcement learning loop for human English behavior, driven by correction, memory persistence, and enforced return frequency.

## 2. The 4 Engines

```text
1. Learning Engine   — correction, drill generation, adaptation
2. Memory Engine     — mistakes, progression, identity history
3. Behavior Engine   — streaks, repetition, return hooks
4. Pressure Engine   — teacher, parent, boss visibility
```

## 3. Architecture Layers

### L1 — Client Layer (Entry Point)

```text
- Chrome Extension (primary)
- Web Chat UI (fallback)
- Magic Chat interface
- Voice input (STT) + Voice output (TTS)
```

Responsibilities:

- Capture student input (voice/text)
- Deliver correction instantly
- Show next task
- Trigger repetition loop

Rule: no intelligence lives here.

### L2 — Edge Orchestration (Cloudflare Worker)

```text
OBI Worker = routing + state injection
```

Responsibilities:

- Route requests
- Attach user/session state from DOs
- Select model path (local vs cloud)
- Inject system prompt (OBI doctrine)
- Enforce response format
- Log interaction event
- Enforce rate limits + safety rules

Rule: Worker does NOT teach. It orchestrates teaching.

### L3 — Intelligence Layer (LLM)

```text
DeepSeek / any LLM backend = reasoning + language engine
```

Responsibilities:

- Grammar correction
- Conversation generation
- Exercise creation
- Role simulation (teacher mode)
- Difficulty adaptation

Constraint: stateless. Replaceable. Not the moat.

### L4 — Memory Layer (State System)

```text
ProfileDO  = learner identity + skill profile
SessionDO  = active learning session state
PetDO      = engagement / streak state (NET-PET)
LedgerDO   = immutable event history
```

Rule: memory defines personalization, not the model.

### L5 — Governance System (Constraint Engine)

```text
System constraint rules:
- Must increase speaking practice frequency
- Must increase return rate
- Must improve correction accuracy
- Must improve weakness targeting clarity

If a feature fails any rule → deprioritized or removed
```

## 4. Data Flow (Real Execution Path)

```text
1.  Student speaks in browser
2.  STT converts speech → text
3.  Extension sends to Worker
4.  Worker loads ProfileDO + SessionDO
5.  Worker injects system prompt (OBI doctrine)
6.  Worker routes to model (local simple / DeepSeek complex)
7.  LLM generates correction + drill
8.  Worker updates:
      - SessionDO (current state)
      - LedgerDO (event log)
      - ProfileDO (long-term learning model)
      - PetDO (streak / engagement)
9.  Response returned to UI
10. TTS speaks correction
11. Next task generated from weakness
```

## 5. Product Loop

```text
1. User speaks
2. System corrects immediately
3. Error logged to memory
4. Weakness is updated
5. Next task targets same weakness
6. User returns in next cycle
```

If retention fails here, everything fails.

## 6. Critical Gaps (Must Solve)

### Gap 1 — Emotional Hook

The loop is functional but not emotionally addictive. Users need at least ONE identity anchor:

- "You are becoming a fluent speaker" (identity)
- "Your teacher is watching" (accountability)
- "Your streak is alive" (loss aversion)
- "Your level is visibly rising" (progress)

Without this, churn happens at day 2-3.

### Gap 2 — Adaptive Difficulty Curve

Memory tracks weaknesses but there is no progressive challenge escalation:

```text
easy win → confidence
slight difficulty increase → growth
controlled failure → retention
```

### Gap 3 — Reward Signal System

Users need dopamine-equivalent feedback:

```text
"You improved pronunciation by 12%"
"You reduced TH errors by 40%"
"You are now Level 3 speaking fluency"
```

Without this, users do not feel progress.

### Gap 4 — Memory Retrieval Logic

Memory is stored but retrieval rules are undefined. Required:

```text
IF session starts       → load ProfileDO weak points
IF user repeats mistake → increase priority weight
IF error appears 3+ times → force drill generation
IF user inactive > 3 days → trigger re-entry mode
```

### Gap 5 — Re-Entry Protocol

What happens when user disappears 3 days, returns after gap, loses streak, changes skill level:

```text
"Welcome back. You still struggle with /TH/ sound."
→ instant drill
→ no reset
→ resume progress
```

Without this, retention collapses silently.

## 7. Daily Retention Loop UX (First 30 Seconds)

This is the product. Everything else is infrastructure.

### Screen 1 — Entry

```text
OBI

"Speak for 30 seconds"
[ START ]

No menu. No settings. No login delay.
```

### Screen 2 — Live Practice

```text
You are speaking...
[ waveform animation ]
OBI is listening...
```

### Screen 3 — Feedback Moment

```text
Correction:

  "I go yesterday shop"
  "I went to the shop yesterday"

Focus: past tense verbs

Drill:
Say: "I went to the shop yesterday"

[ SPEAK AGAIN ]
```

### Screen 4 — Loop End

```text
Day 3 streak

Weakness: /TH/ sound improving

Tomorrow: continue /TH/ training
```

### UX Rules

- No menus on first screen
- No settings visible initially
- Always show next action
- Never end session without tomorrow hook
- User must feel: "I failed → I fixed → I continue tomorrow"

## 8. OBI System Prompt (Production v1)

```text
You are OBI, a continuous English learning coach.

Your job is NOT to chat.

Your job is to:

1. Detect mistakes in user English
2. Correct them clearly and simply
3. Identify ONE primary weakness per session
4. Generate a short practice task targeting that weakness
5. Reinforce memory across sessions

RULES:
- Always prioritize correction over conversation
- Always give 1 focus skill per session
- Never overwhelm the learner
- Keep responses short and actionable
- Always end with a continuation hook

FORMAT:
1. Correction (if needed)
2. Explanation (1-2 lines max)
3. Practice task
4. Continuation hook ("Tomorrow we will continue...")

PERSONALIZATION RULE:
Use stored memory (ProfileDO + LedgerDO) to adapt difficulty and repetition.

BEHAVIOR RULE:
You are building a habit loop, not answering questions.
```

## 9. Memory + Retrieval Brain

### Memory Types

```text
Short-term (SessionDO)  — current conversation, active correction
Long-term  (ProfileDO)  — weak grammar, phoneme errors, fluency score
Event log  (LedgerDO)   — every mistake, every correction, every drill
Behavior   (PetDO)      — streak, engagement, return frequency
```

### Retrieval Rules

```text
Session start         → load ProfileDO weak points into prompt
Repeated mistake      → increase priority weight in ProfileDO
Error appears 3+ times → force targeted drill generation
User inactive > 3 days → trigger re-entry mode (resume, no reset)
Streak broken          → loss aversion message + easy win drill
Weakness improving     → surface reward signal ("TH errors down 40%")
```

### Memory Update Flow

```js
export function updateMemory(profile, analysis) {
  profile.mistakes.push(...analysis.mistakes);
  profile.weak_points = mergeWeakPoints(
    profile.weak_points,
    analysis.weak_points
  );
  profile.last_active = Date.now();
  return profile;
}
```

## 10. Worker Architecture (MVP Code Skeleton)

### Project Structure

```text
worker/
├── index.js          # main router
├── obiPrompt.js      # system prompt
├── memory.js         # memory read/write
├── model.js          # LLM client
└── chat.js           # core chat handler

frontend/
├── index.html        # entry UI
├── app.js            # client logic
└── style.css         # styling
```

### index.js (Router)

```js
export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/api/chat") {
      return handleChat(req, env);
    }

    return new Response("OBI OK");
  }
};
```

### obiPrompt.js

```js
export const OBI_PROMPT = `
You are OBI, an English learning coach.

Rules:
- Correct user English
- Give ONE main mistake only
- Give short explanation
- Give repetition drill
- End with continuation hook

You are building habit, not conversation.
`;
```

### chat.js (Core Loop)

```js
import { OBI_PROMPT } from "./obiPrompt";
import { getUser, updateUser } from "./memory";
import { callLLM } from "./model";

export async function handleChat(req, env) {
  const { message, userId } = await req.json();
  const user = getUser(userId);

  const fullPrompt = `
${OBI_PROMPT}

User message:
${message}

User weak points:
${JSON.stringify(user.weak)}
`;

  const ai = await callLLM(fullPrompt);

  user.logs.push({ message, ai });
  updateUser(userId, user);

  return new Response(JSON.stringify(ai));
}
```

### model.js (LLM Client)

```js
export async function callLLM(prompt) {
  const res = await fetch("https://api.deepseek.com/v1/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }]
    })
  });
  return res.json();
}
```

### frontend/app.js

```js
async function send() {
  const message = document.getElementById("input").value;

  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ userId: "test-user", message })
  });

  const data = await res.json();
  document.getElementById("output").innerText =
    JSON.stringify(data, null, 2);
}
```

### Target File System (Full Scale)

```text
src/
├── index.js                  # main router
├── routes/
│   ├── chat.js               # /api/chat
│   ├── lesson.js             # /api/lesson
│   ├── practice.js           # /api/practice
│   ├── session.js            # session control
│   ├── netpet.js             # behavior loop
│   └── report.js             # analytics output
├── core/
│   ├── obiPrompt.js          # system prompt injection
│   ├── router.js             # model routing logic
│   ├── intent.js             # intent classification
│   └── safety.js             # guardrails
├── memory/
│   ├── profileDO.js
│   ├── sessionDO.js
│   ├── petDO.js
│   └── ledgerDO.js
├── models/
│   ├── deepseekClient.js
│   └── localFallback.js
└── utils/
    ├── logger.js
    ├── format.js
    └── constants.js
```

## 11. Metrics Dashboard

### Day-2 Return Rate (Only Metric That Defines Success)

```text
% users returning next day

Target:
  Week 1:  40%
  Week 4:  60%+
```

If they do not return, no data, no memory moat, no product.

### Speaking Minutes Per Day

```text
Average speaking time per user
Target: 3-10 minutes daily minimum
```

### Corrections Per Session

```text
Mistakes detected / session = learning intensity metric
```

### Weakness Convergence Rate

```text
Time to reduce repeated error type
If this improves → system is working
```

### Streak Distribution

```text
Users reaching:
  3 days   → habit forming
  7 days   → retention confirmed
  14 days  → compounding
```

### Drill Completion Rate

```text
Target: 70%+
```

## 12. Revenue Model (Vietnam + Scale)

### Entry Funnel

```text
FREE: AI speaking test + 5-page report
→ weakness revealed
→ "daily improvement system" pitch
→ subscription
```

### Individual Pricing

| Tier     | Price           | Value                         |
| -------- | --------------- | ----------------------------- |
| Basic    | 200-300k VND/mo | AI daily practice             |
| Standard | 500-900k VND/mo | AI + tracking                 |
| Pro      | 1-2M VND/mo     | AI + teacher + accountability |

### School Pricing (B2B)

```text
20-80 students:  5M - 20M VND / month

Includes: dashboard, homework tracking, speaking analytics, teacher panel
```

### Corporate

```text
English training per employee: 150k - 500k VND / user / month

Upside: companies pay for enforcement + tracking
```

### What You Are Selling

Not an app. A behavior enforcement system with measurable improvement and an accountability layer.

## 13. First 100 Users Growth Plan

### Step 1 — Existing Students (Fastest)

```text
Free AI Speaking Test + personal 5-page report
```

### Step 2 — Conversion Script

```text
"You don't need more classes. You need daily correction."
"Try OBI for 7 days free."
```

### Step 3 — Daily Loop

Daily speaking task + correction + streak + weakness tracking.

### Step 4 — Retention Hook

```text
Every 3 days: "You improved /TH/ sound by 18%"
Every 7 days: "You are now 2.3x more accurate than Day 1"
```

### Step 5 — School Entry

```text
Pitch: "We reduce student forgetting after class by enforcing daily speaking practice."
Show: progress logs, AI reports, streaks
```

### Growth Loop

```text
Students → Teachers see progress → Parents see reports
→ Pressure increases → Retention increases
```

## 14. Moat Layer (Realistic Version)

Defensible advantage is NOT legal registration. It is:

1. **Behavioral compounding** — users returning daily increases personalization depth
2. **Longitudinal memory graph** — mistakes tracked across time, not reset per session
3. **Embedded social context** — teacher, classroom, employer, parent
4. **Correction density advantage** — more corrections per minute = faster skill gain

Data moat only forms AFTER usage scale. Legal protection is not competitive protection. Clones matter if they get distribution or better UX. These are later-stage optimizations, not MVP drivers.

## 15. Current System State

### Already Built

- Cloudflare Worker routing
- DeepSeek integration
- Durable Object system (Session + Profile + Pet + Ledger)
- Classroom endpoints
- Net-Pet engagement loop
- Soul DNA capture endpoints
- Logging + reporting paths

### Missing (Critical Gap)

A daily habit loop that users open voluntarily.

Not AI quality, not architecture, not legal structure. Only: "Why do they come back tomorrow?"

## 16. Roadmap (Execution Priority)

### Phase 1 — Retention Engine (Critical)

```text
BUILD ONLY:
- 30-second speak → correction → one drill → exit
- 1 weakness focus per day
- Streak system tied to PetDO
- "Tomorrow continuation hook"
```

Success metric: % users returning next day.

### Phase 2 — Accountability Layer

```text
- Teacher dashboard
- Progress visibility
- Missed-session detection
```

### Phase 3 — Social Context

```text
- Parent / employer view (pick ONE first, not both)
- Cohort comparison
- Progress reporting
```

### Phase 4 — Scaling + Governance

```text
- Analytics expansion
- Audit system hardening
- Dataset structuring
- Model improvement loop
```

## 17. System Rules

A feature is INVALID if it:

- does not increase speaking frequency
- does not improve return rate
- does not strengthen weakness targeting
- does not improve learning continuity

Everything else is optional.

Biggest risk is not technical. It is over-architecture before retention exists. Retention is the product. Everything else is scaling.

## 18. One-Line Truth

```text
OBI is a Cloudflare-native learning continuity system that improves English speaking
ability by converting practice into a daily correction-memory-return loop.
```
