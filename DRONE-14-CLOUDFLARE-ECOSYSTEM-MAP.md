# DRONE 14 — Cloudflare Full Ecosystem Map (Past / Present / Future)

**Last updated:** 2026-03-24 | **Source:** Cloudflare official docs + pricing pages | **NO COPILOT — web research only**

---

## 🔥 What We Use NOW vs What's Untapped

| Product | Category | Status | We Use? | Free Tier | Paid ($5/mo base) | OBI Relevance |
|---------|----------|--------|---------|-----------|-------------------|---------------|
| **Workers** | Compute | GA | ✅ YES | 100K req/day, 10ms CPU | 10M req/mo, 30M CPU ms | 🔴 Core runtime — OBI lives here |
| **Durable Objects** | Stateful Compute | GA | ✅ YES | 100K req/day, 13K GB-s/day, 5GB SQL | $0.15/M req, $12.50/M GB-s | 🔴 Session state, conversation memory, Agents SDK runtime |
| **D1** | Database | GA | ✅ YES | 5M rows read/day, 100K writes/day, 5GB | $0.001/M rows read, $1/M writes | 🔴 User data, lesson progress, auth |
| **KV** | Key-Value Store | GA | ✅ YES | 100K reads/day, 1K writes/day, 1GB | 10M reads/mo + $0.50/M, 1GB + $0.50/GB | 🟡 Config, feature flags, session tokens |
| **R2** | Object Storage | GA | ✅ YES | 10GB, 1M Class A, 10M Class B, **zero egress** | $0.015/GB-mo, $4.50/M Class A | 🟡 Audio files, lesson assets, media |
| **Pages** | Frontend Hosting | GA | ✅ YES | Unlimited sites, 500 builds/mo | 5K builds/mo | 🟡 naturalenglishtraining.net frontend |
| **Agents SDK** | AI Agents | Beta | ❌ UNTAPPED | Runs on DO — same free tier | DO pricing | 🔴 **#1 UPGRADE PATH** — multi-agent OBI with state, tools, MCP |
| **Workflows** | Orchestration | GA | ❌ UNTAPPED | 100K req/day, 10ms CPU, 1GB state | Workers pricing | 🔴 Durable multi-step: onboarding flows, lesson chains, retry logic |
| **Vectorize** | Vector DB | GA | ❌ UNTAPPED | 30M queried dims/mo, 5M stored dims, 100 indexes | $0.01/M queried dims, $0.05/100M stored | 🔴 Semantic search over lessons, RAG for OBI tutor |
| **AI Gateway** | AI Proxy | GA | ❌ UNTAPPED | Core features free, 100K logs | 1M logs on paid, no per-request fee | 🔴 Caching, rate limiting, fallback routing for DeepSeek calls |
| **Workers AI** | AI Inference | GA | ❌ UNTAPPED | 10K Neurons/day (~free for small jobs) | $0.011/1K Neurons | 🟡 Fallback inference, embeddings, small models on-edge |
| **Queues** | Message Queue | GA | ❌ UNTAPPED | Available on free plan | Workers pricing | 🟡 Async audio processing, lesson generation pipeline |
| **Hyperdrive** | DB Accelerator | GA | ❌ UNTAPPED | Free on all plans | $0 on paid | 🟢 Connection pooling if we add external Postgres |
| **Browser Rendering** | Headless Chrome | GA | ❌ UNTAPPED | 10 min/day, 3 browsers | $0.09/hr, $2/browser | 🟡 Screenshot testing, lesson preview rendering |
| **Cron Triggers** | Scheduling | GA | ❌ UNTAPPED | Included with Workers, 15min CPU max | Workers pricing | 🟡 Scheduled lesson reminders, health checks, cleanup jobs |
| **Tail Workers** | Observability | GA | ❌ UNTAPPED | Included | Workers pricing | 🟢 Logging pipeline, audit trail for student interactions |
| **Logpush** | Observability | GA | ❌ UNTAPPED | Paid only | Included on paid | 🟢 Push logs to R2 or external for analytics |
| **Analytics Engine** | Analytics | GA | ❌ UNTAPPED | Available on free | Included | 🟡 Custom student usage metrics, lesson completion tracking |
| **Turnstile** | Bot Protection | GA | ❌ UNTAPPED | **Fully free**, unlimited challenges, 20 widgets | Enterprise for branding removal | 🟡 CAPTCHA replacement for signup/login — free forever |
| **Access (Zero Trust)** | Auth/Identity | GA | ❌ UNTAPPED | Free for up to 50 users | $7/user/mo | 🟢 Admin panel auth, internal tools protection |
| **WAF** | Security | GA | ❌ UNTAPPED | Basic rules on free plan | Pro $20/mo for advanced | 🟡 Protect naturalenglishtraining.net from attacks |
| **CDN** | Performance | GA | ✅ YES (auto) | Free with any plan | Free | 🟢 Auto-included, global edge caching |
| **DNS** | Infrastructure | GA | ✅ YES | Free | Free | 🟢 Domain management |
| **Registrar** | Domain | GA | UNKNOWN | At-cost pricing, no markup | At-cost | 🟢 Cheapest domain registration |
| **Email Routing** | Email | GA | ❌ UNTAPPED | Free — 25 dest addresses | Free | 🟡 Route student emails, support inbox |
| **Stream** | Video | GA | ❌ UNTAPPED | None (starts $5/mo) | $5/mo for 1K min stored | 🟡 Future: video lessons, student recordings |
| **Images** | Image CDN | GA | ❌ UNTAPPED | None (paid only) | $5/mo for 100K images | 🟢 Low priority — R2 handles this for now |
| **AI Search** | Search | Beta | ❌ UNTAPPED | Free during beta | TBD | 🟡 Full-stack search over lesson content |
| **Containers** | Compute | Beta | ❌ UNTAPPED | None (paid only) | $0.30/M req + CPU time | 🟢 Low priority — Workers handle our use case |
| **Zaraz** | Tag Manager | GA | ❌ UNTAPPED | Free | Free | 🟢 Third-party script management |
| **Snippets** | Edge Logic | GA | ❌ UNTAPPED | Free | Free | 🟢 Quick header/redirect rules without full Workers |
| **Constellation** | ML Runtime | **Deprecated** | ❌ | N/A | N/A | ⚫ Replaced by Workers AI |

---

## 🎯 Upgrade Path Priority — What to Activate Next

### Tier 1 — Activate NOW (highest leverage, lowest effort)
1. **AI Gateway** — One line of code. Wraps DeepSeek calls with caching, rate limiting, fallback, analytics. Free core.
2. **Agents SDK** — The endgame runtime for OBI. Multi-agent with persistent state on DO. Free tier.
3. **Vectorize** — RAG pipeline for lessons. 30M free queried dims/month.

### Tier 2 — Activate This Quarter
1. **Workflows** — Durable multi-step for student onboarding, lesson chains, retry logic. Free.
2. **Turnstile** — Free forever bot protection. Zero reason not to.
3. **Cron Triggers** — Scheduled health checks, lesson reminders, cleanup. Already included.
4. **Queues** — Async audio processing pipeline.

### Tier 3 — Future Quarter
1. **Analytics Engine** — Custom student metrics dashboard.
2. **Email Routing** — Support inbox and student notifications.
3. **Browser Rendering** — Automated lesson screenshot testing.
4. **Stream** — When we add video lessons.
5. **Access (Zero Trust)** — Admin panel protection (free up to 50 users).

---

## 💰 Cost Model — Current + Projected

| Scenario | Monthly Cost | What's Included |
|----------|-------------|-----------------|
| Free tier only | **$0** | 100K req/day, 10ms CPU, 5GB D1, 1GB KV, 10GB R2, basic DO |
| Workers Paid (current) | **$5/mo base** | 10M req/mo, 30M CPU ms, all products unlocked at usage rates |
| OBI at 100 students | **~$5-8/mo** | Well within paid tier included allotments |
| OBI at 1,000 students | **~$10-20/mo** | Moderate overage on Workers + DO + D1 |
| OBI at 10,000 students | **~$50-100/mo** | Still absurdly cheap for a full AI product at scale |

**Zero egress fees on R2.** That alone saves hundreds at scale compared to AWS S3.

---

## 📌 Key URLs
- Workers docs: developers.cloudflare.com/workers/
- Pricing master page: workers.cloudflare.com/pricing
- Agents SDK: developers.cloudflare.com/agents/
- AI Gateway: developers.cloudflare.com/ai-gateway/
- Vectorize: developers.cloudflare.com/vectorize/
- Workflows: developers.cloudflare.com/workflows/
- Dashboard: dash.cloudflare.com
