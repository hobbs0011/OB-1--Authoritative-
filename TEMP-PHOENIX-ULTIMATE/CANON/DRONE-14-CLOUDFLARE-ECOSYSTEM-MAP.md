# DRONE 14 — Cloudflare Full Ecosystem Map (Past/Present/Future)

**Last updated:** 2026-03-24  
**Source:** Cloudflare official docs + pricing pages  
**NO COPILOT — web research only**

---

## What We Use NOW vs What's Untapped

| Product | Category | Status | We Use? | Free Tier | Paid ($5/mo base) | OBI Relevance |
|---------|----------|--------|---------|-----------|-------------------|---------------|
| **Workers** | Compute | GA | ✅ YES | 100K req/day, 10ms CPU | 10M req/mo, 30M CPU ms | 🔴 Core runtime — OBI lives here |
| **Durable Objects** | Stateful Compute | GA | ✅ YES | 100K req/day, 13K GB-s/day, 5GB SQL | $0.15/M req, $12.50/M GB-s | 🔴 Session state, conversation memory, Agents SDK runtime |
| **D1** | Database | GA | ✅ YES | 5M rows read/day, 100K writes/day, 5GB | $0.001/M rows read, $1/M writes | 🔴 User data, lesson progress, auth |
| **KV** | Key-Value Store | GA | ✅ YES | 100K reads/day, 1K writes/day, 1GB | 10M reads/mo + $0.50/M, 1GB + $0.50/GB | 🟡 Config, feature flags, session tokens |
| **R2** | Object Storage | GA | ✅ YES | 10GB, 1M Class A, 10M Class B, zero egress | $0.015/GB-mo, $4.50/M Class A | 🟡 Audio files, lesson assets, media |
| **Pages** | Frontend Hosting | GA | ✅ YES | Unlimited sites, 500 builds/mo | 5K builds/mo | 🟡 naturalenglishtraining.net frontend |
| **Agents SDK** | AI Agents | Beta | ❌ UNTAPPED | Runs on DO — same free tier | DO pricing | 🔴 **#1 UPGRADE PATH** — multi-agent OBI with state, tools, MCP |
| **Workflows** | Orchestration | GA | ❌ UNTAPPED | 100K req/day, 10ms CPU, 1GB state | Workers pricing | 🔴 Durable multi-step: onboarding flows, lesson chains, retry logic |
| **Vectorize** | Vector DB | GA | ❌ UNTAPPED | 30M queried dims/mo, 5M stored dims, 100 indexes | $0.01/M queried dims, $0.05/100M stored | 🔴 Semantic search over lessons, RAG for OBI tutor |
| **AI Gateway** | AI Proxy | GA | ❌ UNTAPPED | Core features free, 100K logs | 1M logs on paid, no per-request fee | 🔴 Caching, rate limiting, fallback routing for DeepSeek calls |
| **Workers AI** | AI Inference | GA | ❌ UNTAPPED | 10K Neurons/day | $0.011/1K Neurons | 🟡 Fallback inference, embeddings, small models on-edge |
| **Queues** | Message Queue | GA | ❌ UNTAPPED | Available on free plan | Workers pricing | 🟡 Async audio processing, lesson generation pipeline |
| **Hyperdrive** | DB Accelerator | GA | ❌ UNTAPPED | Free on all plans | $0 on paid | 🟢 Connection pooling if we add external Postgres |
| **Browser Rendering** | Headless Chrome | GA | ❌ UNTAPPED | 10 min/day, 3 browsers | $0.09/hr, $2/browser | 🟡 Screenshot testing, lesson preview rendering |
| **Cron Triggers** | Scheduling | GA | ❌ UNTAPPED | Included with Workers, 15min CPU max | Workers pricing | 🟡 Scheduled lesson reminders, health checks, cleanup jobs |
| **Tail Workers** | Observability | GA | ❌ UNTAPPED | Included | Workers pricing | 🟢 Logging pipeline, audit trail |
| **Logpush** | Observability | GA | ❌ UNTAPPED | Paid only | Included on paid | 🟢 Push logs to R2 or external |
| **Analytics Engine** | Analytics | GA | ❌ UNTAPPED | Available on free | Included | 🟡 Custom student usage metrics |
| **Turnstile** | Bot Protection | GA | ❌ UNTAPPED | Fully free, unlimited challenges, 20 widgets | Enterprise for branding removal | 🟡 CAPTCHA replacement — free forever |
| **Access (Zero Trust)** | Auth/Identity | GA | ❌ UNTAPPED | Free for up to 50 users | $7/user/mo | 🟢 Admin panel auth |
| **WAF** | Security | GA | ❌ UNTAPPED | Basic rules on free plan | Pro $20/mo for advanced | 🟡 Protect NET from attacks |
| **CDN** | Performance | GA | ✅ YES (auto) | Free with any plan | Free | 🟢 Auto-included |
| **DNS** | Infrastructure | GA | ✅ YES | Free | Free | 🟢 Domain management |
| **Registrar** | Domain | GA | UNKNOWN | At-cost pricing | At-cost | 🟢 Cheapest domain registration |
| **Email Routing** | Email | GA | ❌ UNTAPPED | Free — 25 dest addresses | Free | 🟡 Student emails, support inbox |
| **Stream** | Video | GA | ❌ UNTAPPED | None ($5/mo) | $5/mo for 1K min stored | 🟡 Future: video lessons |
| **Images** | Image CDN | GA | ❌ UNTAPPED | None (paid only) | $5/mo for 100K images | 🟢 Low priority — R2 handles this |
| **AI Search** | Search | Beta | ❌ UNTAPPED | Free during beta | TBD | 🟡 Full-stack search over lessons |
| **Containers** | Compute | Beta | ❌ UNTAPPED | None (paid only) | $0.30/M req + CPU | 🟢 Low priority |
| **Zaraz** | Tag Manager | GA | ❌ UNTAPPED | Free | Free | 🟢 Script management |
| **Snippets** | Edge Logic | GA | ❌ UNTAPPED | Free | Free | 🟢 Quick header/redirect rules |
| **Constellation** | ML Runtime | **Deprecated** | ❌ | N/A | N/A | ⚫ Replaced by Workers AI |

---

## Upgrade Path Priority

### Tier 1 — Activate NOW
1. **AI Gateway** — One line of code. Caching, rate limiting, fallback for DeepSeek. Free.
2. **Agents SDK** — Endgame runtime for OBI. Multi-agent with persistent state on DO.
3. **Vectorize** — RAG pipeline. 30M free queried dims/month.

### Tier 2 — This Quarter
4. **Workflows** — Durable multi-step flows. Free.
5. **Turnstile** — Free forever bot protection.
6. **Cron Triggers** — Scheduled jobs. Included.
7. **Queues** — Async audio pipeline.

### Tier 3 — Future Quarter
8. Analytics Engine
9. Email Routing
10. Browser Rendering
11. Stream
12. Access (Zero Trust)

---

## Cost Model

| Scenario | Monthly Cost | What's Included |
|----------|-------------|-----------------|
| Free tier only | $0 | 100K req/day, 10ms CPU, 5GB D1, 1GB KV, 10GB R2, basic DO |
| Workers Paid (current) | $5/mo base | 10M req/mo, 30M CPU ms, all products unlocked |
| OBI at 100 students | ~$5-8/mo | Within paid tier allotments |
| OBI at 1,000 students | ~$10-20/mo | Moderate overage |
| OBI at 10,000 students | ~$50-100/mo | Still absurdly cheap for full AI product |

Zero egress fees on R2. That alone saves hundreds at scale vs AWS S3.
