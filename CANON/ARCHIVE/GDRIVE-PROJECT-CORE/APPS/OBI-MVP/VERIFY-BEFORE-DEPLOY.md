# 🧪 PRE-DEPLOYMENT VERIFICATION CHECKLIST

Run this before deploying to Vercel. It'll catch 99% of issues before they hit production.

---

## ✅ Local Machine Setup

```bash
# 1. Node version (must be 18+)
node --version
# Should output: v18.x.x or v20.x.x

# 2. Install dependencies
npm install
# Should complete without errors

# 3. Build locally
npm run build
# Should complete without errors or warnings about prisma
```

---

## 🔑 Environment Variables

```bash
# 1. Copy template
cp .env.local.example .env.local

# 2. Verify all required vars are set:
cat .env.local | grep -E "OPENAI_API_KEY|SUPABASE_URL|DATABASE_URL"

# Should output 3 lines, no "undefined" values

# 3. Verify Supabase connectivity
npx prisma db push --skip-generate
# Should run schema migration successfully
```

---

## 🚀 Run Locally

```bash
# Start dev server
npm run dev

# In another terminal, check it's running
curl http://localhost:3000

# Should return HTML (not error)
```

---

## 🤖 Test AI Integration

```bash
# Open http://localhost:3000 in browser

# 1. Enter student ID: test-student-1
# 2. Type: "I go to shop yesterday"
# 3. Wait 3-5 seconds
# 4. OBI should respond with correction

# If you see a response → AI is working
# If you see "Error" → Check OPENAI_API_KEY
```

---

## 📊 Test Database

```bash
# Open Supabase dashboard → SQL Editor

# Run this query:
SELECT * FROM "Student";

# If you see a table structure → Database is connected
# If you see "object not found" → Prisma schema didn't push successfully
```

---

## 🎯 Ready for Vercel?

If all above checks pass:

```bash
# Deploy
vercel --prod

# Vercel will ask for:
# - OPENAI_API_KEY
# - SUPABASE_URL
# - SUPABASE_KEY
# - DATABASE_URL

# Copy-paste from .env.local
```

---

## 🔍 Post-Deployment Check

After Vercel deploys:

```bash
# 1. Visit your Vercel URL
https://obi-mvp-xxx.vercel.app

# 2. Should load without errors
# 3. Try the same test: enter student ID + send message
# 4. OBI should respond

# If Vercel works but OpenAI fails:
# → Go to Vercel dashboard → Settings → Environment Variables
# → Verify all 4 env vars are there
# → Redeploy
```

---

## 🚨 If Something Breaks

**"Build fails on Vercel"**
```bash
# Check locally first
npm run build
# If this works locally, Vercel will work

# If this fails locally:
npm install
npx prisma generate
npm run build
```

**"Chat endpoint returns 500"**
```bash
# Check Vercel logs
vercel logs --follow

# Look for:
# - OPENAI_API_KEY missing → Add to env vars
# - DATABASE_URL error → Verify connection string in Vercel settings
```

**"Can't load student data"**
```bash
# Verify Prisma schema was pushed
vercel env pull  # Get current env from Vercel
DATABASE_URL="your_url" npx prisma db push
```

---

## ✨ Final Gate

Before you declare "live":

- [ ] Local `npm run dev` works
- [ ] Typing to OBI gets a response
- [ ] Vercel deploy completes without errors
- [ ] Vercel URL loads in browser
- [ ] First message gets OBI response (takes 3-5 sec)
- [ ] No red errors in Vercel logs

**If all green → You are live and ready for students.**

