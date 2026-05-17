# Cloudflare vs Firebase — Strategic Verdict

> **Date:** 2026-03-28
> **Decision by:** Michael Hobbs (SOV100) + OB1 analysis
> **Status:** DECIDED — Cloudflare is the stack. Firebase is backup/dormant.
> **Artifact class:** 🏦 VAULT

---

## The Question

Michael has:
- **Cloudflare** — $5/mo Workers Paid plan (active, OBI runtime lives here)
- **Firebase** — signed up (Spark free tier, project ID not yet set)

Which platform handles what?

## The Verdict: Cloudflare Does Everything

Firebase is redundant. Cloudflare's $5/mo paid tier already covers every capability Firebase offers on the free Spark plan, with higher limits and better architecture for OBI.

**Decision: Build EVERYTHING on Cloudflare. One stack. One bill. One dashboard. Keep Firebase account alive (it's free) but don't build on it.**

---

## Head-to-Head Comparison

### Database

| | Cloudflare D1 | Firebase Firestore |
|---|---|---|
| **Type** | SQLite (relational) | NoSQL (document) |
| **Free limits** | 5M reads/day, 100K writes/day, 5GB | 50K reads/day, 20K writes/day, 1GB |
| **Paid tier** | Included in $5/mo base | $0.06/100K reads on Blaze |
| **Query power** | Full SQL — JOIN, GROUP BY, subqueries | Limited NoSQL queries, no JOINs |
| **OBI verdict** | **WINNER** — 100x read capacity, SQL is better for student progress tracking, lesson analytics, teacher dashboards |

### Compute / Functions

| | Cloudflare Workers | Firebase Functions |
|---|---|---|
| **Invocations** | 10M req/mo on $5 plan | 125K/mo on Spark |
| **CPU time** | 30M CPU ms/mo | 40K GB-seconds/mo |
| **Cold starts** | None (V8 isolates) | Yes (Node.js containers) |
| **Edge locations** | 300+ cities globally | Single region |
| **Runtime** | JavaScript/TypeScript/Wasm | Node.js only |
| **OBI verdict** | **WINNER** — 80x capacity, zero cold starts, edge-native. OBI already runs on Workers. |

### Auth

| | Cloudflare | Firebase Auth |
|---|---|---|
| **Google Sign-In** | OAuth2 flow in Workers (~50 lines of code) | Drop-in UI widget |
| **Admin auth** | Access (Zero Trust) — free for 50 users | Custom claims |
| **Session management** | KV or D1 | Firebase SDK |
| **OBI verdict** | **Cloudflare** — slightly more code but no SDK dependency. Access gives free admin auth. Firebase Auth SDK is the ONE thing that's genuinely easier on Firebase, but not worth the second platform. |

### Hosting

| | Cloudflare Pages | Firebase Hosting |
|---|---|---|
| **Sites** | Unlimited | 1 per project |
| **Builds** | 500/mo (free), 5K/mo (paid) | 1/day (Spark) |
| **CDN** | 300+ edge nodes, auto-optimized | Google CDN |
| **Custom domains** | Yes, free SSL | Yes, free SSL |
| **OBI verdict** | **WINNER** — already hosts naturalenglishtraining.net |

### Storage

| | Cloudflare R2 | Firebase Storage |
|---|---|---|
| **Free tier** | 10GB, ZERO egress ever | 5GB, egress on Blaze |
| **Egress** | $0.00 always | $0.12/GB on Blaze |
| **OBI verdict** | **WINNER** — zero egress is a permanent cost advantage at scale |

### AI Capabilities

| | Cloudflare | Firebase |
|---|---|---|
| **AI Gateway** | Free — caching, rate limiting, fallback routing for DeepSeek | Nothing |
| **Workers AI** | On-edge inference, 10K Neurons/day free | Nothing |
| **Vectorize** | Vector DB for RAG, 30M dims/mo free | Nothing |
| **Agents SDK** | Multi-agent runtime on Durable Objects | Nothing |
| **OBI verdict** | **Cloudflare** — not even a contest. Firebase has zero AI infrastructure. |

### Security

| | Cloudflare | Firebase |
|---|---|---|
| **Bot protection** | Turnstile — free forever, unlimited | Nothing |
| **DDoS** | Enterprise-grade, included | Basic |
| **WAF** | Basic on free, advanced on Pro ($20) | Nothing |
| **Zero Trust** | Free for 50 users | Nothing |
| **OBI verdict** | **Cloudflare** — complete security stack included |

### Unique Cloudflare Capabilities (No Firebase Equivalent)

| Capability | What It Does for OBI | Cost |
|---|---|---|
| Durable Objects | Persistent stateful sessions, conversation memory | Included |
| Workflows | Durable multi-step onboarding flows, lesson chains | Included |
| Queues | Async audio processing pipeline | Included |
| Cron Triggers | Scheduled reminders, health checks | Included |
| Email Routing | Route student emails, support inbox | Free |
| Analytics Engine | Custom student usage metrics | Included |
| Browser Rendering | Headless Chrome for lesson previews | 10 min/day free |
| Tail Workers | Logging pipeline, audit trail | Included |

---

## Cost Projection

| Scale | Cloudflare Only | Cloudflare + Firebase |
|---|---|---|
| 0-100 students | $5/mo | $5/mo + complexity tax |
| 100-1,000 students | $5-10/mo | $5-10/mo + Firebase dashboard + SDK dependency |
| 1,000-10,000 students | $10-50/mo | $10-50/mo + Firebase Blaze ($0.06/100K reads) |
| Operational overhead | 1 dashboard, 1 CLI, 1 deploy pipeline | 2 dashboards, 2 CLIs, 2 deploy pipelines, 2 auth systems |

**Firebase adds complexity for zero additional capability.**

---

## When Firebase Makes Sense (Not Now)

Firebase would make sense if:
1. You needed the Firebase Auth drop-in UI widget for rapid prototyping (but OBI is past prototyping)
2. You needed Firestore's real-time sync for a collaborative feature (but D1 + Durable Objects handles this)
3. You needed Firebase Cloud Messaging for push notifications (but Chrome Extension can handle notifications natively)
4. You were NOT already on Cloudflare (but you ARE, and it's already paid)

**None of these apply to OBI's current state.**

---

## Final Architecture Decision

```
THE OBI STACK (One Platform)
│
├── Cloudflare ($5/mo — EVERYTHING)
│   ├── Workers → OBI runtime (naturalenglishtraining.net/api/chat)
│   ├── D1 → Student data, lesson progress, teacher dashboard
│   ├── Durable Objects → Session state, conversation memory
│   ├── KV → Config, feature flags, session tokens
│   ├── R2 → Audio, media, lesson assets (ZERO egress)
│   ├── Pages → Frontend (naturalenglishtraining.com)
│   ├── AI Gateway → DeepSeek caching + fallback
│   ├── Vectorize → RAG over lesson content
│   ├── Agents SDK → Multi-agent OBI (future)
│   ├── Turnstile → Bot protection (free forever)
│   ├── Cron Triggers → Reminders, health checks
│   └── DNS + CDN + WAF → Already active
│
├── Chrome Extension ($0 — Distribution)
│   ├── Gemini Nano → On-device AI ($0)
│   ├── Chrome Enterprise → Silent install ($0)
│   └── Backend fallback → Cloudflare Workers
│
└── Firebase (DORMANT — Keep Account, Don't Build)
    └── Reserved for: emergency backup, future real-time sync if needed
```

---

*Verdict by OB1. Analysis based on Cloudflare Drone 14 ecosystem map, Firebase scaffold audit, 4 reincarnation logs, and Michael's decision trail across 5 sessions. GitHub is truth.*
