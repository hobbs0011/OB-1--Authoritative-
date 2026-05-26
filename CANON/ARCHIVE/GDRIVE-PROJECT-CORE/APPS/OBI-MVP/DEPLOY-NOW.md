# 🚀 OBI MVP — DEPLOY NOW (5-STEP LIVE LAUNCH)

**Status:** Production-ready code. Ready to deploy today.

**Goal:** Get OBI running in production within the next few hours.

---

## ⚡ FASTEST PATH: Vercel + Supabase (Recommended)

This gets you live in ~15 minutes with zero infrastructure headache.

### Step 1: Create Supabase Database (3 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose a project name (e.g., `obi-english`)
4. Set a strong database password
5. Click **"Create new project"** (takes ~1–2 minutes)

**Save these values:**

- **Project URL** (looks like: `https://xyzabc.supabase.co`)
- **Anon Key** (in Settings → API Keys → `anon [public]`)
- **Database URL** (in Settings → Database → Connection String → PostgreSQL URI schema)

---

### Step 2: Migrate Database Schema (2 minutes)

After Supabase finishes:

```bash
# In this OBI-MVP directory

# Copy env example
cp .env.local.example .env.local

# Fill in your Supabase values
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_anon_key
# DATABASE_URL=postgresql://postgres:[password]@db.supabase.co:5432/postgres
```

**Then push the schema:**

```bash
npm install

# This creates all tables in Supabase
npx prisma db push
```

---

### Step 3: Get OpenAI API Key (2 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click **"API Keys"** in the left menu
3. Click **"Create new secret key"**
4. Copy it (you won't see it again)
5. Paste into `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

---

### Step 4: Test Locally (3 minutes)

```bash
npm run dev
```

Visit: http://localhost:3000

- [x] You should see "OBI English Coach" interface
- [x] Chat box should work
- [x] No red error messages in console

---

### Step 5: Deploy to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**During Vercel setup, add these environment variables:**

- `OPENAI_API_KEY` = your key from Step 3
- `SUPABASE_URL` = from Supabase (Step 1)
- `SUPABASE_KEY` = from Supabase (Step 1)
- `DATABASE_URL` = from Supabase (Step 1)

---

✅ **YOU ARE NOW LIVE**

Your app is running at: `https://obi-mvp-your-username.vercel.app`

---

## 🧪 Test Your Live Deployment

1. Open your Vercel URL
2. Enter any student ID (e.g., `student-1`)
3. Type: `"I go to school yesterday"`
4. OBI should respond: `"We say: I went to school yesterday..."` + explanation + drill

If you see this → **You're live!**

---

## 💰 First Users / Revenue

Now that you're live:

### Option A: Your Current Students

Send them the link:

> "Try the free AI speaking test. After, I'll enroll you in the premium plan for daily coaching."

### Option B: Schools in HCMC

Email template:

> "Hi [Principal],
>
> I've built an AI English coach that keeps students practicing between classes. It tracks homework compliance and gives you a dashboard to see if students are actually studying.
>
> Free trial: [Your Vercel URL]
>
> Want to see it for your students?"

### Option C: Pricing Options (Vietnam)

| Plan      | Price        | Usage      |
| --------- | ------------ | ---------- |
| Trial     | Free         | 1 test     |
| Student   | 200k VND/mo  | Daily chat |
| Standard  | 500k VND/mo  | + Reports  |
| Premium   | 1M+ VND/mo   | + Teacher  |

---

## ⚠️ Common Issues

### "Deploy fails with prisma error"

```bash
# Run this locally first
npm run build

# If that works, Vercel build will too
```

### "Chat endpoint returns 500"

1. Check `.env.local` in Vercel has all 3 required keys
2. Go to Vercel → Settings → Environment Variables
3. Redeploy: `vercel --prod`

### "Students say 'database not found'"

The Prisma client isn't connected. In Vercel:

1. Check `DATABASE_URL` is set
2. Delete the `.env.local` file from your repo (it should only be local)
3. Let Vercel use the env vars instead

---

## 🔄 What's Next

Once you're live:

### 1. Enroll first 5–10 students

### 2. Collect feedback for 1 week

### 3. Iterate based on their usage

### 4. Scale to schools

### 5. Expand to Southeast Asia

---

## 📊 System Architecture (What You Just Deployed)

```
Student Browser
      ↓
  Next.js Frontend (Vercel)
      ↓
  /api/chat → OpenAI API
      ↓
  Supabase (Postgres) → stores sessions + mistakes
      ↓
  Star Map memory system → tracks weaknesses
      ↓
  Next session: "You still struggle with /th/..."
```

---

## 🎯 Final Checklist

- [ ] Supabase project created
- [ ] `Database schema migrated (npx prisma db push)
- [ ] OpenAI API key added to `.env.local`
- [ ] Local test works (`npm run dev`)
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Live URL works and responds to chat
- [ ] First student enrolled and testing

---

## Questions?

If something breaks:

1. Check the Vercel deployment logs: `vercel logs`
2. Check Supabase connection: Supabase dashboard → Query Editor
3. Run locally first to verify: `npm run dev`

**You are running production-grade inference on OpenAI + Postgres. Treat it like a real system.**

---

**Ship it. Get feedback. Iterate. Win.**

