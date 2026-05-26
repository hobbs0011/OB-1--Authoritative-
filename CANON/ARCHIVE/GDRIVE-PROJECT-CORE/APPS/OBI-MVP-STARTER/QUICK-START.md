# ⚡ OBI MVP — 5-Minute Setup Guide

## TL;DR

```bash
cd APPS/OBI-MVP-STARTER
npm install
cp .env.local.example .env.local
# Edit .env.local: add DATABASE_URL + OPENAI_API_KEY or DEEPSEEK_API_KEY
npx prisma db push
npm run dev
# Go to http://localhost:3000
```

## Step-by-Step

### 1. Database Setup (3 types, pick one)

**Easiest: Supabase (Cloud PostgreSQL)**
```
1. Go to supabase.com → Sign up
2. Create project
3. Get connection string from dashboard
4. In .env.local:
   DATABASE_URL="postgresql://user:xxx@xxx.supabase.co:5432/postgres?schema=public&sslmode=require"
```

**Free: Local PostgreSQL (if you have it)**
```
1. Install PostgreSQL
2. Create database: createdb obi_db
3. In .env.local:
   DATABASE_URL="postgresql://localhost/obi_db"
```

**Docker: PostgreSQL in Container**
```bash
docker run --name obi-db -e POSTGRES_PASSWORD=password -d postgres:15
export DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
```

### 2. AI API Setup (pick ONE)

**DeepSeek (Cheapest: $0.14 per 1M tokens)**
```
1. Register at api.deepseek.com
2. Buy credits ($5+)
3. Get API key
4. In .env.local:
   DEEPSEEK_API_KEY="sk-..."
   DEEPSEEK_BASE_URL="https://api.deepseek.com/v1"
```

**OpenAI (Faster, but pricier: $2+ per 1M tokens)**
```
1. Go to api.openai.com
2. Get API key
3. In .env.local:
   OPENAI_API_KEY="sk-..."
```

### 3. Install + Run

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Start dev server
npm run dev

# Open browser to http://localhost:3000
```

### 4. Test It

Type in the chat:
```
I go yesterday market
```

OBI should respond:
```
CORRECTION: I went to the market yesterday.
FIX: Past tense
EXPLANATION: Use "went" for past, add "the" before location
DRILL: went to the market, yesterday, I went
```

Streak increments if you say it correctly ✅

---

## Minimal Database Option (No Setup)

If you want to test WITHOUT a real database first:

In `app/api/chat/route.ts`, comment out all `prisma.*` calls and use in-memory store:

```typescript
const store: { [key: string]: Student } = {};

// Instead of: await prisma.student.findUnique(...)
// Use:
let student = store[studentId] || { 
  id: studentId, 
  streakDays: 0, 
  weakPhonemes: [] 
};
```

Then it works instantly without DB setup. (But data won't persist between sessions.)

---

## Deployment (Pick One)

### Vercel (Easiest)
```bash
npm install -g vercel
vercel deploy
# Add DATABASE_URL + OPENAI_API_KEY in Vercel dashboard
```

### Railway
```
1. Connect GitHub repo
2. Railway auto-detects Next.js
3. Add env vars in dashboard
4. Done
```

### DigitalOcean
```bash
# Use DigitalOcean App Platform
# Connect GitHub
# Add env vars
# Deploy
```

---

## Errors?

| Error | Fix |
|-------|-----|
| `Cannot find module @prisma/client` | `npm install @prisma/client` + `npx prisma generate` |
| `Database connection failed` | Check `DATABASE_URL` in `.env.local` |
| `API key invalid` | Verify key is active on api.openai.com or api.deepseek.com |
| `localhost:3000 refused connection` | Make sure `npm run dev` is running |

---

## Success Criteria

✅ Chat loads  
✅ Type sentence → Get correction back  
✅ Streak count increments  
✅ Second message shows weak points  

If all ✅ = Ready to use with real students.

---

**That's it. Ship it.**
