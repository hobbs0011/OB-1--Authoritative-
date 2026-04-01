# NET-PET-AI Intelligence Brief
**Authority:** AGENT-100_MICHAEL_HOBBS  
**Compiled by:** AGENT-99_OB1_NE0  
**Date:** 2026-04-02  
**Order:** SOUL → DNA → EXECUTION (SSM V8 Law: SP1)

---

## LAYER 1 — SOUL (Verbatim Hobbs, Highest Authority)

> *"NET Pet AI — their daily English coach, accountability partner, that'll track your progress, and help you, and help us, help you better."*

> *"Filling up these online and group classes with NET Pet AI will allow me to push to 120-150 Million dong a month."*

> *"Plans to upscale would be leaning into Net PET ai, and other automatic systems to help students."*

> *"goal: 1B VND revenue via NET (Natural English Training for Vietnamese families)"*

> *"we aim to be a daily coach for you, through our live teachers, our human teachers, but also through our NET Pet AI. That's what makes us different and sets us apart from the other alternatives in Vietnam."*

> *"That's why we have NET Pet AI to be that daily coach, accountability partner, that'll track your progress."*

> *"this system — the biggest problem — is the drift of the AI. And that's what I'm building with my system here is an anti drift system."*

> *"roblox is just a side hustle brother. The true money is in teaching (short term) and long term would be the natural command station with absolute drift solutions."*

### Soul Summary (from verbatim):
- NET-PET-AI is the **daily coach** for every student
- It is the **scale mechanism** → 120-150M VND/month target
- It is an **accountability partner** with streak/progress tracking
- It must be **anti-drift** by design — not a novelty, a system
- Student-facing brand: **Natural English Training** (never Phoenix Rising)
- Coach persona: **Obi**

---

## LAYER 2 — DNA (Plans, Architecture, Confirmed Tech Stack)

### Mission Lanes (V1)
1. **Lesson mode** — delivers NET lesson content
2. **Practice mode** — student practice with prompts
3. **Feedback mode** — coaching on student response

### Definition of Done (from historical playbooks)
- Lesson prompts pack
- Practice prompts pack  
- Feedback examples
- Teacher quickstart classroom flow

### Pedagogy Architecture
```
Gamification loop: not decorative — it is behavior architecture
Spaced repetition:  1-3-7-30 cadence
Streak mechanics:  check-in pressure + reset mechanics
Goal:              English lifestyle, not English learning
```

### Confirmed Tech Stack
```
Runtime:          Cloudflare Workers
State:            Durable Objects (SQLite-backed)
DOs:              SessionDO | ProfileDO | PetDO
Language:         JavaScript ESM
Node:             ≥20
Wrangler:         ^4
Deploy:           GitHub Actions → wrangler deploy
CI:               smoke verification step exists
Domain:           www.naturalenglishtraining.com (Cloudflare paid/active)
Frontend:         Static assets served through Worker (ASSETS binding)
```

### Durable Object Design
```
SessionDO   → tracks active lesson/practice/feedback session state
ProfileDO   → student onboarding data, learning history, goals
PetDO       → NET-PET state: streak, XP, mood, totalSessions
```

### Onboarding Data Model (confirmed from public/app.js)
```json
{
  "studentId": "string",
  "fullName": "string",
  "currentCity": "string",
  "birthplace": "string",
  "englishLevel": "string",
  "goals": "string",
  "confidenceAreas": "string",
  "occupation": "string",
  "fearTrigger": "string",
  "learningHistory": "string",
  "motivationNow": "string"
}
```

### PET State Model (confirmed from public/app.js renderPetPills)
```
streak       → days consecutive
XP           → experience points
mood         → current emotional state
totalSessions → cumulative count
```

### Check-in Payload (confirmed)
```json
{
  "studentId": "string",
  "minutes": "number",
  "confidence": "number (1-10)"
}
```

### API Routes (confirmed from README)
```
GET  /api/health
POST /api/onboarding
POST /api/lesson
POST /api/practice
POST /api/feedback
POST /api/netpet/checkin
GET  /api/netpet/state?studentId=...
POST /api/classroom/session/start
POST /api/classroom/event
GET  /api/classroom/session?classId=...&totalStudents=...
GET  /api/classroom/report?classId=...&totalStudents=...
```

### Classroom Lane (confirmed)
- Start class session with classId + totalStudents
- Log behavior events: `followed` or `broken` per student
- Rate limiting: 120 events/60s class-level | 20 events/60s per student
- Generate report text for school escalation
- HTTP 429 returned on rate limit with retry guidance

---

## LAYER 3 — EXECUTION (What Exists, What's Missing, What's Next)

### What Exists (confirmed in repo at APPS/NET-PET-AI/)
| File | Status |
|------|--------|
| `wrangler.toml` | ✅ Complete — bindings, DOs, vars configured |
| `package.json` | ✅ Complete — deps, scripts |
| `src/index.js` | ❌ **EMPTY (0 bytes)** — this is the critical gap |
| `public/index.html` | ✅ Dev UI scaffold |
| `public/app.js` | ✅ Full frontend test harness (all API calls wired) |
| `public/chat.js` | ✅ Chat UI helpers |
| `public/dev.html` | ✅ Dev panel |
| `scripts/predeploy.mjs` | ✅ Pre-deploy checks |
| `scripts/verify-cloudflare-token.mjs` | ✅ Token verification |
| `README.md` | ✅ Complete — stack, routes, deploy instructions |

### wrangler.toml Confirmed Config
```toml
name = "net-pet-ai"
main = "src/index.js"
compatibility_date = "2026-03-16"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./public"
binding = "ASSETS"

[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "SessionDO"

[[durable_objects.bindings]]
name = "PROFILES"
class_name = "ProfileDO"

[[durable_objects.bindings]]
name = "PETS"
class_name = "PetDO"

[[migrations]]
tag = "v1-net-pet-core"
new_sqlite_classes = ["SessionDO", "ProfileDO", "PetDO"]

[vars]
APP_NAME = "Natural English Training"
APP_COACH_NAME = "Obi"
```

### What's Missing (critical path to v1)
```
CRITICAL:
1. src/index.js — implement:
   - Router (handle all routes)
   - SessionDO class + SQLite schema
   - ProfileDO class + SQLite schema  
   - PetDO class + SQLite schema + streak/XP logic
   - /api/onboarding handler
   - /api/lesson handler (lesson content generation)
   - /api/practice handler (practice prompt generation)
   - /api/feedback handler (coaching response)
   - /api/netpet/checkin handler (streak update, XP award)
   - /api/netpet/state handler (read PET state)
   - /api/classroom/* handlers (session, event, report)
   - Rate limiting logic (classroom lane)
   - ASSETS passthrough for static frontend

NEEDED AFTER INDEX.JS:
2. AI integration — lesson/practice/feedback content
   (Cloudflare AI binding or external AI API call)
3. Domain routing: www.naturalenglishtraining.com → worker
4. Smoke test verification (CI already wired for it)
5. Secret: CLOUDFLARE_API_TOKEN in GitHub Actions secrets
```

### Drift Traps to Avoid
- Worker confusion: test canonical endpoint, not ghost/wrong endpoint
- Config drift: keep wrangler.toml as single source of truth
- Branding drift: student surface = "Natural English Training" + "Obi", never Phoenix Rising
- Secret exposure: `.dev.vars` and `.secret` must never enter commits or prompts

### Known Risks
- `.secret` file exists in repo root — **confirm it's in .gitignore, never commit**
- Historical archive files contain plaintext secrets — rotate before any new deploys
- AI content generation approach not decided — Cloudflare AI vs external API (UNKNOWN → needs Michael ruling)

---

## STATE SNAPSHOT (as of 2026-04-02)

```
scaffold:    EXISTS — APPS/NET-PET-AI/ (17 files)
index.js:    EMPTY — 0 bytes — BLOCKING all functionality
deployed:    NO
domain:      NOT wired
ui:          READY — full test harness in public/
ci:          WIRED — GitHub Actions deploy workflow exists
v1_lane:     lesson | practice | feedback | classroom
revenue_path: deploy → wire domain → fill classes → 120-150M VND/mo
```

### Priority Queue (in order)
```
🔴🔴 ACTIVE MISSION: implement src/index.js
🔴    Deploy to workers.dev → smoke test
🔴    Wire www.naturalenglishtraining.com
🟡    Integrate AI content generation (needs Michael ruling on provider)
🟡    Student-facing UI polish (mobile-first, NET brand)
🟢    Classroom teacher dashboard
🟢    Spaced repetition 1-3-7-30 scheduler
🟢    Streak/XP/mood progression tuning
```

---

*NET-PET-AI Intelligence Brief — SOUL confirmed | DNA confirmed | EXECUTION gap identified*  
*Next action: implement src/index.js → this is the ONLY blocker between scaffold and v1*
