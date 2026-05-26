# 🚀 OBI MVP — Deployment Guide (Pick Your Hosting)

---

## Option 1: Vercel (Easiest — 2 Minutes)

### Step 1: Prepare Repository

```bash
cd APPS/OBI-MVP-STARTER
git init
git add .
git commit -m "OBI MVP — Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/obi-mvp.git
git push -u origin main
```

### Step 2: Connect Vercel

1. Go to vercel.com
2. Click "New Project"
3. Select your GitHub repo
4. Framework: Next.js (auto-detected)
5. Click "Deploy"

### Step 3: Add Environment Variables

In Vercel dashboard:
```
Settings → Environment Variables

Add:
- DATABASE_URL = (your Supabase PostgreSQL string)
- OPENAI_API_KEY = sk-... OR DEEPSEEK_API_KEY = sk-...
```

### Step 4: Deploy Schema

Wait for Vercel to build (2–3 min), then:

```bash
# In your local terminal:
npx prisma db push --skip-generate --skip-validate
```

### Result
✅ Site live at `your-project.vercel.app`

---

## Option 2: Railway (Also Easy — 3 Minutes)

### Step 1: Push to GitHub (same as Vercel)

```bash
git push -u origin main
```

### Step 2: Connect Railway

1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your repo (obi-mvp)
5. Railway auto-detects Next.js

### Step 3: Add Services

**Database:**
- Click "Add Service"
- Select "PostgreSQL"
- Railway provisions it automatically

**Environment:**
- Click "Variables"
- Add: `OPENAI_API_KEY` or `DEEPSEEK_API_KEY`
- DATABASE_URL is auto-generated

### Step 4: Deploy

```bash
# Railway watches GitHub and deploys automatically
# Or click "Deploy" in dashboard
```

### Result
✅ Site live at `your-project.up.railway.app`

---

## Option 3: Docker + DigitalOcean (More Control — 10 Minutes)

### Step 1: Create Dockerfile

```dockerfile
# Already in root: APPS/OBI-MVP-STARTER/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
COPY prisma ./prisma/
COPY app ./app/
COPY public ./public/
COPY next.config.js tsconfig.json ./

# Install
RUN npm install

# Build
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 2: Build Image Locally

```bash
docker build -t obi-mvp:latest .
```

### Step 3: Deploy to DigitalOcean

**Option A: DigitalOcean App Platform (no Docker knowledge needed)**
1. Log into DigitalOcean
2. Click "Create" → "App"
3. Select GitHub repo
4. Select Dockerfile
5. Add env vars
6. Deploy

**Option B: DigitalOcean Droplet (DIY)**
```bash
# Create Ubuntu 22.04 droplet

# SSH into it
ssh root@your_droplet_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pull + run image
docker run -d \
  -e DATABASE_URL="..." \
  -e OPENAI_API_KEY="sk-..." \
  -p 80:3000 \
  obi-mvp:latest
```

### Result
✅ Site live at `your_droplet_ip` or custom domain

---

## Option 4: AWS Lambda (Serverless — 15 Minutes)

### Step 1: Install AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Deploy to Lambda

```bash
npm install -g serverless

serverless create --template aws-nodejs-typescript
# Edit serverless.yml for Next.js

serverless deploy
```

### Result
✅ Site live at AWS Lambda + API Gateway

---

## Option 5: Self-Hosted VPS (Maximum Control — 20 Minutes)

### Step 1: Rent VPS

- Linode (5$/mo)
- Hetzner (3€/mo)
- Contabo (4€/mo)

### Step 2: SSH In

```bash
ssh root@your_vps_ip
```

### Step 3: Setup Environment

```bash
# Install Node + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql

# Clone repo
git clone https://github.com/YOUR_USERNAME/obi-mvp.git
cd obi-mvp
npm install

# Create .env.prod
echo "DATABASE_URL=postgresql://..." > .env.production
echo "OPENAI_API_KEY=sk-..." >> .env.production

# Build + Start
npm run build
pm2 start "npm start" --name obi

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Step 4: SSL Certificate (Free)

```bash
sudo apt install certbot python3-certbot-nginx

# If using Nginx as reverse proxy:
sudo certbot certonly --standalone -d your-domain.com
```

### Result
✅ Site live at `your-domain.com`  
✅ Total cost: $5–10/mo + domain ($10/yr)

---

## Comparison Table

| Platform | Setup Time | Cost | Scaling | Database |
|----------|-----------|------|---------|----------|
| **Vercel** | 2 min | Free tier–$20/mo | Auto | Supabase |
| **Railway** | 3 min | Pay-as-you-go | Auto | Included |
| **DigitalOcean App** | 5 min | $12+/mo | Manual | Managed |
| **Docker + Droplet** | 15 min | $6+/mo | Manual | Self-managed |
| **AWS Lambda** | 15 min | Pay-as-you-go | Auto | RDS |
| **VPS (Self-hosted)** | 20 min | $5+/mo | Manual | Self-managed |

---

## Recommended for OBI

**Beginners:** Vercel + Supabase (simplest)  
**Scaling:** Railway (scales automatically)  
**Control:** DigitalOcean Droplet (cheapest long-term)  
**Investors:** AWS (professional + trusted)  

---

## Post-Deployment Checklist

- [ ] Site loads at deployed URL
- [ ] `/api/chat` accepts POST requests
- [ ] Database tables exist (`Student`, `Session`, `Mistake`)
- [ ] AI key works (test with dummy message)
- [ ] SSL certificate installed (https://)
- [ ] Error logging set up (Sentry or similar)
- [ ] Monitoring set up (Datadog or similar)

---

## Scaling Later (What to Change)

When you have 100+ users:
- Add Redis for session caching (< 100ms responses)
- Add CDN for static files (Cloudflare)
- Add read replicas for database (PostgreSQL replication)
- Add load balancer (if > 1000 requests/sec)

---

**Ship it. Test with real users. Scale later.**
