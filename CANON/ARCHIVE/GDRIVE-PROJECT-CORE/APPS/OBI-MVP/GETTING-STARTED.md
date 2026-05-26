# OBI MVP — Getting Started

This is a **production-ready working prototype** of OBI (English AI Tutor).

## What This Is

- ✅ Full Next.js application (frontend + API)
- ✅ Real LLM integration (OpenAI API)
- ✅ Student state persistence (Postgres via Supabase)
- ✅ Memory system (Star Map with vector indexing)
- ✅ Deployable to Vercel / Railway / Cloudflare

## What This Is NOT

- ❌ A learning platform (that's phase 2)
- ❌ A mobile app (use Next.js web version)
- ❌ Fully polished UI (MVP-grade)
- ❌ Production-hardened (add auth, rate limiting, monitoring)

---

## 5-Minute Setup

### 1. Clone & Install

```bash
cd OBI-MVP
npm install
```

### 2. Setup Database

```bash
# Visit supabase.com, create free project
# Copy DATABASE_URL from project settings
```

### 3. Setup LLM

```bash
# Visit openai.com, create API key
```

### 4. Create `.env.local`

```bash
cp .env.local.example .env.local

# Edit .env.local with your values:
# OPENAI_API_KEY=(your OpenAI API key)
# SUPABASE_URL=(your Supabase project URL)
# SUPABASE_KEY=(your Supabase anon key)
# DATABASE_URL=(your PostgreSQL connection string)
```

### 5. Initialize Database

```bash
npx prisma db push
```

### 6. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## How to Use

### 1. Go to Web App

http://localhost:3000

### 2. Enter Student ID

```
student@example.com
```

### 3. Click "Start Session"

System will initialize a new student.

### 4. Type or Paste English

```
"I think sink is difficult"
```

### 5. Get Correction

```
OBI: "We say 'I think the 'th' sound is difficult.' The 'th' is a unique English sound..."
```

### 6. Repeat & Practice

The system tracks your mistakes and repeats them.

---

## System Architecture

```
┌──────────────────────┐
│  Browser / Frontend  │
│   (React + Next)     │
└──────────┬───────────┘
           │ POST /api/chat
           ↓
┌──────────────────────┐
│   API Route Handler  │
└──────────┬───────────┘
           │
      ┌────┴────┬─────────┬─────────┐
      ↓         ↓         ↓         ↓
   Memory   AI Engine  Database  Star Map
 (State)   (OpenAI)   (Postgres) (Vector)
```

---

## Core Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main chat UI |
| `app/api/chat/route.ts` | Main API endpoint |
| `src/lib/ai.ts` | LLM integration |
| `src/lib/memory.ts` | Student state + Star Map |
| `src/lib/prompts.ts` | OBI system prompt |
| `prisma/schema.prisma` | Database schema |

---

## Testing the API

### Test 1: Create Student

```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","action":"init"}'
```

Response:
```json
{
  "studentId": "xyz123",
  "level": "A1",
  "weakPoints": [],
  "streak": 0
}
```

### Test 2: Send Message

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "studentId":"xyz123",
    "message":"I think sink is very difficult"
  }'
```

Response:
```json
{
  "response": "We say: I think the 'th' sound is very difficult...",
  "mistakes": ["th_sound"],
  "weakPoints": ["th_sound"],
  "streak": 1
}
```

### Test 3: Get Student Profile

```bash
curl http://localhost:3000/api/student/xyz123
```

Response:
```json
{
  "student": {...},
  "recentSessions": [...],
  "topWeaknesses": [...]
}
```

---

## Understanding the Memory System

### Student State

Every student has:
- `level` — A1 (beginner) to C2 (fluent)
- `weakPoints` — array of problems ("th_sound", "past_tense")
- `streak` — consecutive practice days
- `totalSessions` — total practice count

### Sessions

Each conversation is saved:
- `input` — what user said
- `corrected` — what they should say
- `mistakes` — what was wrong
- `timestamp` — when it happened

### Star Map

The real magic: semantic weakness clustering
- `tag` — "th_sound", "past_tense"
- `severity` — how bad (0-1)
- `confidence` — how sure (0-1)
- `embedding` — vector representation
- `linkedSessions` — evidence

When user makes mistake:
1. System creates/updates Star Node
2. Severity increases
3. Next conversation prioritizes this weakness

---

## Next Steps

### Phase 2: Voice Integration
```typescript
// lib/speech.ts
const transcript = await recordAndTranscribe();
const response = await getOBIResponse(transcript);
await playAudioResponse(response);
```

### Phase 3: Teacher Dashboard
- Progress reports
- Class management
- Parent notifications

### Phase 4: Mobile App
- React Native wrapper
- Offline support
- Push notifications

---

## Troubleshooting

### "OpenAI API Error"
- Check API key in `.env.local`
- Verify you have API credits

### "Database connection failed"
- Check DATABASE_URL
- Verify Supabase project exists
- Run `npx prisma db push`

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### "Module not found"
```bash
npm install
npx prisma generate
```

---

## Production Deployment

See `DEPLOYMENT.md` for full guide.

Quick start:
```bash
# Deploy to Vercel
vercel deploy --prod

# Or Railway
railway deploy

# Or Docker
docker build -t obi . && docker run obi
```

---

## Important Notes

1. **OpenAI Costs:** Monitor API usage. Each conversation ~$0.001-$0.01
2. **Database:** Supabase free tier: 500MB storage, 2GB bandwidth
3. **Rate Limiting:** Not in MVP — add before public launch
4. **Authentication:** MVP has none — add for production

---

## Support

- **Documentation:** See README.md
- **Issues:** Check common errors above
- **Deployment:** See DEPLOYMENT.md
- **Code:** All source in `src/` and `app/`

---

**Built:** April 19, 2026  
**Status:** MVP Production Ready  
**Author:** Michael Hobbs / Phoenix Rising Protocol
