# NET Web Architecture — Ultimate Spec

> **Created:** 2026-03-25 23:00 ICT
> **Author:** Agent-99 (OB1) for SOV100
> **Status:** ACTIVE — under construction

---

## Domain Strategy

| Domain | Platform | Purpose | Status |
|--------|----------|---------|--------|
| `naturalenglishtraining.com` | Cloudflare Pages | Marketing site, landing page, brand | 🔨 BUILDING (was Squarespace "Coming Soon") |
| `naturalenglishtraining.net` | Cloudflare Workers | OBI app, student dashboard, Galaxy Lessons | ✅ LIVE (Worker running) |

**Two domains, two purposes:**
- `.com` = the storefront (marketing, trust, conversion)
- `.net` = the product (OBI, lessons, classroom tools)

Both on Cloudflare. Zero Squarespace. Zero Firebase dependency.

---

## Repository Structure

**Repo:** `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`

```
├── WEBSITE/                  → naturalenglishtraining.com (Cloudflare Pages)
│   ├── index.html            → Landing page (Gospel 444 branded)
│   ├── gallery.html          → Galaxy Lessons gallery
│   ├── about.html            → Methodology + about (TBD)
│   ├── contact.html          → Contact form + Turnstile (TBD)
│   ├── privacy.html          → Privacy policy (TBD)
│   ├── terms.html            → Terms of service (TBD)
│   └── 404.html              → Custom 404 (TBD)
│
├── GALAXY-LESSONS/           → Interactive lesson HTML files
│   ├── VOCAB-001-DAILY-SURVIVAL.html (76KB)
│   ├── NET-CLASSROOM-MANAGER.html (78KB)
│   ├── NET-Signal-Decode.html (41KB)
│   ├── NET-Feline-Linguistics-Academy.html (29KB)
│   ├── NET-Sarcasm-Academy.html (23KB)
│   ├── NET-Highschool-Careers.html (15KB)
│   ├── NET-Train-6-7-Omega-Archive.html (28KB)
│   └── ChattyNET-MOBILE-APP-V1.1.html (34KB via APPS/)
│
├── APPS/phoenix-ob1/         → OBI Worker source code
│   ├── src/                  → Worker source
│   ├── wrangler.toml         → Cloudflare config
│   └── package.json
│
├── CANON/                    → Soul DNA vault + architecture docs
├── .github/workflows/        → GitHub Actions deploy pipelines
└── ...
```

---

## Deploy Pipeline

```
GitHub push → GitHub Actions → Cloudflare

WEBSITE/ changes      → deploy to .com (Cloudflare Pages project)
GALAXY-LESSONS/ changes → deploy to .net/lessons/ (Pages or R2)
APPS/phoenix-ob1/ changes → wrangler deploy Worker to .net
```

### Prerequisites (Human Actions Required)
1. **Point .com DNS from Squarespace → Cloudflare** (transfer domain or change nameservers)
2. **Add `CLOUDFLARE_API_TOKEN`** as GitHub secret in `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`
3. **Add `CLOUDFLARE_ACCOUNT_ID`** as GitHub secret
4. **Create Cloudflare Pages project** for .com site (output dir: `WEBSITE/`)
5. **Cancel Squarespace** subscription once DNS is moved

---

## .COM Site Architecture

### Pages
| Page | File | Status | Description |
|------|------|--------|-------------|
| Landing | `index.html` | ✅ Built | Hero, features, OBI showcase, lessons preview, methodology, social proof, CTA |
| Gallery | `gallery.html` | ✅ Built | Full Galaxy Lessons browser with descriptions and launch links |
| About | `about.html` | 📋 Planned | Michael's methodology, Mouse→Tiger philosophy, teaching background |
| Contact | `contact.html` | 📋 Planned | Contact form with Cloudflare Turnstile (free bot protection) |
| Privacy | `privacy.html` | 📋 Planned | Privacy policy |
| Terms | `terms.html` | 📋 Planned | Terms of service |
| 404 | `404.html` | 📋 Planned | On-brand 404 page |

### Brand Spec (Gospel 444)
- **Void:** `#0f0f1a` (background)
- **Soul Purple:** `#a855f7` (primary accent)
- **Imperial Gold:** `#f59e0b` (CTAs, secondary accent)
- **NO BLUE** — anywhere, ever
- **Fonts:** Orbitron (display), Rajdhani (subheadings/nav), Inter (body)
- **Student-facing brand:** "Natural English Training" (never Phoenix Rising)
- **Effects:** Glassmorphism cards, star particle background, gradient text, scroll animations

---

## .NET App Architecture

### Current (LIVE)
- `/` → OBI chat interface (net-pet-ai Worker)
- `/api/chat` → DeepSeek AI inference
- `/api/tts` → Deepgram Aura 2 TTS
- D1 database for user data
- KV for config/session
- Durable Objects for stateful sessions
- R2 for media storage

### Planned Additions
- `/lessons/*` → Galaxy Lessons served as static HTML
- `/admin` → Classroom Manager (teacher dashboard)
- AI Gateway wrapping DeepSeek calls (caching, rate limiting, fallback)
- Turnstile on signup/login
- Cron Triggers for health checks and reminders

---

## Cloudflare Services Status

### Active (6)
Workers, Durable Objects, D1, KV, R2, Pages, CDN, DNS

### Next to Activate
1. **AI Gateway** — wrap DeepSeek calls (caching, rate limiting, analytics)
2. **Turnstile** — free bot protection on all forms
3. **Cron Triggers** — scheduled health checks, lesson reminders
4. **Workflows** — durable multi-step student onboarding

### Future Quarter
Vectorize (RAG), Analytics Engine, Email Routing, Stream (video), Access (Zero Trust admin)

---

## Cost Model

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| Current (dev) | $5/mo | Workers Paid plan base |
| 100 students | ~$5-8/mo | Within included allotments |
| 1,000 students | ~$10-20/mo | Moderate overage |
| 10,000 students | ~$50-100/mo | Still absurdly cheap for full AI product |

Zero egress fees on R2. No per-seat pricing on Workers.

---

## Security Considerations
- All secrets via GitHub Secrets + Cloudflare environment variables
- No secrets in repository
- Turnstile (free) on all public forms
- Zero Trust Access for admin panel (free up to 50 users)
- WAF basic rules on free plan
- SOVEREIGN_KEY rotation pending
- phoenix-ob1 legacy repo still PUBLIC with wrangler.toml — needs to go PRIVATE

---

*Architecture spec maintained by Agent-99. Append-first. Never overwrite.*
