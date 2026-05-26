# NET-PET-AI — OBI MVP System

**Status:** Ready for Deployment  
**Tech Stack:** Cloudflare Workers + Durable Objects + TypeScript  
**Date:** April 19, 2026  

---

## 🎯 WHAT THIS IS

A **stateful English tutoring system** that:
- Corrects pronunciation immediately
- Tracks weak phonemes across sessions
- Enforces daily repetition loops
- Maintains persistent student state (per Durable Object)
- Scales globally with zero infrastructure

## 🚀 QUICK START

### Prerequisites
```bash
# Install Node 20+
# Install Wrangler CLI
npm install -g @cloudflare/wrangler

# Login to Cloudflare
wrangler login
```

### Setup
```bash
# 1. Clone this repo
cd APPS/NETPET-MVP

# 2. Install dependencies
npm install

# 3. Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env.local

# 4. Test locally
npm run dev

# 5. Deploy to Cloudflare
npm run deploy
```

---

## 📊 API ENDPOINTS

### 1. Initialize Student
```bash
POST /init
{
  "student_id": "student_123",
  "level": "A1",  # A1, A2, B1, B2, C1, C2
  "name": "Linh"
}

Response:
{
  "status": "initialized",
  "memory": { ... student profile ... }
}
```

### 2. Chat (Main Loop)
```bash
POST /chat
{
  "student_id": "student_123",
  "message": "I think dis is easy"
}

Response:
{
  "reply": "Correction: 'this' (not 'dis'). The 'th' sound...",
  "corrections": [ { input, correction, type, timestamp } ],
  "next_focus": "θ sound",
  "streak_updated": true,
  "new_streak_count": 4
}
```

### 3. Get Daily Task
```bash
POST /daily
{
  "student_id": "student_123"
}

Response:
{
  "type": "speaking",
  "prompt": "Speak about your day for 2 minutes...",
  "focus_area": "θ sound",
  "difficulty": "medium",
  "duration_minutes": 15,
  "weak_areas_target": ["θ", "ð", "ŋ"]
}
```

### 4. Get Progress
```bash
GET /progress?student_id=student_123

Response:
{
  "daily_active": true,
  "session_count": 24,
  "streak": 4,
  "weak_phonemes": ["θ", "ð"],
  "improvement_areas": ["Improve θ pronunciation", ...],
  "retention_score": 0.78
}
```

### 5. Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": 1719283822
}
```

---

## 🧠 SYSTEM ARCHITECTURE

```
Chrome Extension / Web Client
    ↓
Cloudflare Worker (stateless router)
    ↓
Durable Object per Student (persistent state)
    ↓
    Memory:
    - Level
    - Daily streak
    - Weak phonemes
    - Recent errors
    - Summarized profile
    ↓
AI Model Call (OpenAI GPT-4 mini)
    ↓
OBI Response Formatter
    ↓
Back to Client
```

### Key Components

**Worker.ts (API Gateway)**
- Routes requests to correct endpoints
- Handles CORS
- Proxies to Durable Objects

**StudentDO.ts (Student Brain)**
- Maintains 1:1 state per student
- Runs correction loop
- Generates daily tasks
- Tracks progress

**OBI Prompt (Personality)**
- System prompt defining OBI behavior
- Incorporates student memory context
- Enforces correction loop
- Tracks weak areas

---

## 📈 CORE LEARNING LOOP

1. **Student Input** → speaks/writes message
2. **Memory Load** → retrieve student history
3. **OBI Process** → build prompt with context
4. **AI Call** → OpenAI generates correction
5. **Extract Corrections** → parse mistakes
6. **Memory Update** → store errors + update weak areas
7. **Response** → return correction + next focus
8. **Persist** → save updated state to Durable Object

---

## 🎯 SUCCESS METRICS (Track Only These 4)

1. **Daily Active Users** – sessions per day
2. **Session Completion Rate** – % of students who finish daily task
3. **7-Day Retention** – % returning after week 1
4. **Error Reduction** – improvement in weak phoneme accuracy

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Clone repo locally
- [ ] Install Node 20+
- [ ] `npm install`
- [ ] Add `OPENAI_API_KEY` to Wrangler secrets
- [ ] `wrangler login`
- [ ] `npm run dev` (test locally)
- [ ] `npm run deploy`
- [ ] Test endpoints with curl/Postman
- [ ] Connect Chrome extension to live Worker URL
- [ ] Invite first 10 students (QA)
- [ ] Monitor retention metrics

---

## 🔐 ENVIRONMENT SETUP

```bash
# Add secrets to Wrangler
wrangler secret put OPENAI_API_KEY
# Enter: sk-proj-...your-key...

# Verify
wrangler secret list
```

---

## 📝 DATABASE SCHEMA (Stored in Durable Object)

**Key: `student_memory`**
```json
{
  "student_id": "123",
  "level": "A2",
  "daily_streak": 4,
  "last_session_timestamp": 1719283822,
  "weak_phonemes": ["θ", "ð", "ŋ"],
  "recent_errors": [
    {
      "input": "think",
      "correction": "should be 'think' /θɪŋk/",
      "mistake_type": "phoneme",
      "timestamp": 1719283800,
      "session_id": "xyz-123"
    }
  ],
  "memory_summary": "Strong speaker, struggles with dental fricatives",
  "retention_score": 0.78,
  "total_sessions": 24,
  "joined_date": 1719000000
}
```

**Key: `session_events`**
```json
[
  {
    "session_id": "xyz-123",
    "event_type": "chat",
    "timestamp": 1719283822,
    "data": { "message": "...", "corrections": 1 }
  }
]
```

---

## ⚙️ CONFIGURATION

**OpenAI Model:** `gpt-4-turbo-mini`  
**Temperature:** 0.7 (balanced)  
**Max Tokens:** 500 per response  
**Retention:** Last 50 errors + 1000 logged events per student  

---

## 🧪 LOCAL TESTING

```bash
# Start dev server
npm run dev

# In another terminal, test:
curl -X POST http://localhost:8787/init \
  -H "Content-Type: application/json" \
  -d '{"student_id": "test_123", "level": "A1"}'

curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"student_id": "test_123", "message": "I is happy"}'
```

---

## 📱 CHROME EXTENSION INTEGRATION

**Worker URL:** `https://netpet-ai.yourdomain.workers.dev`

Example extension code (coming next):
```javascript
// Connect to Worker
const response = await fetch('https://netpet-ai.xxx.workers.dev/chat', {
  method: 'POST',
  body: JSON.stringify({
    student_id: 'student_123',
    message: userInput
  })
});
const data = await response.json();
```

---

## 🎓 NEXT PHASES

**Phase 1 (MVP — Now):**
- Deploy MVP to 10 test students
- Measure 7-day retention
- Validate correction loop

**Phase 2 (Growth):**
- Scale to 100 students
- Add spaced repetition algorithm
- Implement parent reporting

**Phase 3 (Advanced):**
- Add Merkle tree ledger validation
- Implement cryptographic anchors
- Scale phantom swarm (multi-agent)

---

## 📞 SUPPORT

**Issues?**
- Check `.env` has `OPENAI_API_KEY`
- Verify Wrangler is authenticated
- Run `npm run typecheck` for TypeScript errors  
- Check Cloudflare dashboard for Worker logs

**Questions?**
- Reference `/memories/repo/obi-canonical-system.md` for architecture
- See Wave 3 documentation for implementation details

---

**Ready to deploy?** Run:
```bash
npm run deploy
```

Your NET-PET-AI system is now live on Cloudflare. 🚀
