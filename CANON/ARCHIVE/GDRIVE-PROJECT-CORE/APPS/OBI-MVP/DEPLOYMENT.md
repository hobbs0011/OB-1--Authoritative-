# OBI MVP — Deployment Guide

This guide covers deploying OBI MVP to different platforms.

## Recommended: Vercel (Easiest)

Vercel is optimized for Next.js and has built-in Postgres support.

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository with OBI MVP code
- Supabase account (free tier is fine for MVP)

### Steps

1. **Create Supabase project**
```bash
# At supabase.com, create new project
# Copy DATABASE_URL from project settings
```

2. **Push code to GitHub**
```bash
git init
git add .
git commit -m "OBI MVP initial commit"
git push origin main
```

3. **Link to Vercel**
- Go to https://vercel.com/new
- Select your GitHub repo
- Add environment variables:
  - `OPENAI_API_KEY` = your OpenAI key
  - `SUPABASE_URL` = your Supabase URL
  - `SUPABASE_KEY` = your Supabase anon key
  - `DATABASE_URL` = your Postgres URL

4. **Deploy**
```bash
vercel deploy --prod
```

### Migrate Database
```bash
# From your local machine
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## Alternative: Cloudflare Workers (Fast)

For edge deployment with sub-100ms latency globally.

### Prerequisites
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account
- External Postgres (Supabase, Render, Railway)

### Steps

1. **Create Cloudflare Worker**
```bash
wrangler init obi-worker
```

2. **Update `wrangler.toml`**
```toml
name = "obi-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
routes = [{ pattern = "obi.example.com/*", zone_name = "example.com" }]

[site]
bucket = ".next/static"
```

3. **Deploy**
```bash
wrangler deploy --env production
```

---

## Alternative: Railway (Simple)

Railway is simple and has great free tier.

### Steps

1. **Create Railway project**
- Visit railway.app
- Connect your GitHub repo
- Add environment variables

2. **Deploy**
Railway automatically deploys on push.

---

## Alternative: Docker (Full Control)

For complete control over deployment.

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy to any Docker-compatible host:
```bash
docker build -t obi-mvp .
docker run -e DATA BASE_URL=... -e OPENAI_API_KEY=... obi-mvp
```

---

## Production Checklist

### Before Going Live

- [ ] Test all API endpoints in staging
- [ ] Verify OpenAI API costs (set spending limits)
- [ ] Enable database backups (Supabase auto-backup)
- [ ] Add rate limiting if public
- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Monitor LLM latency
- [ ] Load test with multiple concurrent users
- [ ] Test database connection pooling

### Monitoring

```bash
# Vercel
vercel logs --tail

# Railway
railway logs

# Cloudflare
wrangler tail
```

### Scaling Considerations

If you expect > 100 concurrent users:

1. **Database Connection Pooling**
```bash
# Use PgBouncer or Supabase connection pooling
DATABASE_URL_POOLING=postgresql://...
```

2. **Redis Caching** (optional)
```bash
# Cache Star Map queries
REDIS_URL=redis://...
```

3. **Queue for Long Operations** (optional)
```bash
# Background jobs for embeddings
# Use Redis Queue or Bull
```

---

## Rollback Plan

If something breaks:

1. **Vercel:** Click "Deployments" → Select previous version
2. **Railway:** Go to "Deployments" → Redeploy previous
3. **Docker:** Roll back to previous image tag

---

##Cost Estimates (Monthly)

| Component | Free Tier | Paid |
|-----------|-----------|------|
| Hosting (Vercel) | $0 | $20+ |
| Database (Supabase) | $0 (500MB) | $25+ |
| OpenAI API | Pay-as-you-go | Depends on usage |
| CDN | Free | N/A |
| **Total** | ~$0.50 | ~$50+ |

---

## Getting Help

- **Vercel Issues:** vercel.com/support
- **Supabase Issues:** supabase.com/support
- **NextJS Issues:** nextjs.org/docs
- **Prisma Issues:** prisma.io/docs

---

**Last Updated:** April 19, 2026
