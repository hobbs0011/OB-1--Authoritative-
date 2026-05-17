# 11 — FREE STACK OPTIMIZER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — COST CONTROL

---

## Purpose

Phoenix runs lean. The goal is maximum intelligence, maximum infrastructure, maximum output — at minimum cost. This document is the master guide to running the Phoenix stack for less than $20/month at operational scale. Every free tier is documented, every limit is tracked, and every cost escalation has a protocol.

**The free stack is not a compromise. It is a discipline.**

---

## The Master Free Stack Table

| Platform | Service | Free Tier Limit | Phoenix Usage | Status |
|----------|---------|-----------------|---------------|--------|
| Cloudflare | Workers | 100,000 req/day | Curriculum delivery, franchise node APIs, Phoenix ledger API | ACTIVE — Free |
| Cloudflare | D1 (SQLite) | 5M rows read/day, 100K writes/day, 5GB storage | Oracle ledger, revenue ledger, franchise node DBs | ACTIVE — Free |
| Cloudflare | R2 Object Storage | 10GB storage, 1M Class A ops/month, 10M Class B ops/month | Cold backup (WAL archives, curriculum content) | ACTIVE — Free |
| Cloudflare | Pages | Unlimited static sites | Documentation hosting, NET public site | ACTIVE — Free |
| Cloudflare | Durable Objects | 400,000 GB-s compute/month, 1M requests/month | Session state, agentic loop state | ACTIVE — Free |
| Google | Gemini 3.1 Pro (AI Studio) | 15 RPM, 1,500 RPD, 1M TPM | Research synthesis, long-context analysis | ACTIVE — Free |
| Google | NotebookLM | 9 sources/notebook, limited notebooks | Vault ingestion assistant, canon Q&A | ACTIVE — Free |
| Notion | Workspace | Unlimited pages, limited AI credits | Workflow automation, vault metadata, task tracking | ACTIVE — Free |
| Notion | AI Agents | Limited actions/month (free tier) | Trigger routing, status updates | ACTIVE — Free |
| Microsoft | GitHub Copilot | Free for open source / individual (limited) | Code review assistance for Agent-99 | ACTIVE — Free |
| OpenAI | GPT-5.4 | No free tier — pay per token | Sovereign reasoning, Rome verification, critical decisions | ACTIVE — Cost-gated |
| Solana | Transactions | ~$0.00025/tx | Revenue settlement, franchise fee confirmation | ACTIVE — Near-free |
| GitHub | Repository + Actions | Free for public repos | Source control, CI/CD pipeline | ACTIVE — Free |

---

## Cloudflare Free Tier Deep Dive

Cloudflare is the infrastructure backbone of Phoenix. It runs almost entirely on the free tier.

**Workers:**
- 100,000 requests/day free
- Phoenix uses Workers for: curriculum API, franchise node endpoints, ledger write API, Oracle monitoring triggers
- At 7 franchise nodes × ~200 student interactions/day = ~1,400 API calls/day — well within free tier
- **Limit breach protocol:** If approaching 100K/day, optimize Worker logic to batch requests. Do not upgrade to paid without Agent-100 approval.

**D1:**
- 5GB storage free — sufficient for all Phoenix ledgers for the first 3 years at projected growth
- Read/write limits are generous — Phoenix's write volume is low (event-driven, not streaming)
- Daily backup via WAL streaming to R2 (also free)

**R2:**
- 10GB free — sufficient for curriculum content, cold backups, and WAL archives
- No egress fees (unlike AWS S3) — critical for cost control

**Durable Objects:**
- Used for stateful agent session management
- 400,000 GB-s compute/month free — more than sufficient for Phoenix's agent session load

---

## Google Free Tier Deep Dive

**Gemini 3.1 Pro:**
- The 1M TPM limit means Oracle can run large research tasks without hitting rate limits
- 1,500 RPD is the binding constraint — Oracle batches research tasks to stay under 50 calls/day (leaving >95% of daily limit unused)
- **If RPD limit approaches:** Queue non-urgent research tasks for next day cycle

**NotebookLM:**
- Strictly 9 sources per notebook — protocol enforces this
- Multiple notebooks permitted — segment by domain to maximize coverage

---

## OpenAI Cost Gates

GPT-5.4 is the only significant paid cost. Every call is cost-gated.

| Decision Level | Pre-authorized? | Cost Ceiling |
|----------------|-----------------|--------------|
| Routine canon check | Yes (Agent-99) | $0.50/call |
| Rome verification | Yes (mandatory — no ceiling waiver) | $0.20/call typical |
| Agent-100 briefing | Yes (per briefing event) | $1.00/call |
| Emergency drift resolution | Yes (auto-authorized at score 4+) | $0.50/call |
| Unrequested GPT-5.4 call | No — requires Agent-99 approval | $0.00 (blocked) |

**Monthly GPT-5.4 budget: $15. Hard ceiling: $20. Any spend above $20 triggers Agent-100 review.**

---

## Monthly Cost Target

| Component | Target Monthly Cost |
|-----------|---------------------|
| Cloudflare stack | $0 |
| Gemini / NotebookLM | $0 |
| Notion | $0 |
| GitHub | $0 |
| Solana fees | ~$1–2 (transaction fees) |
| GPT-5.4 | <$15 |
| **Total** | **<$20/month** |

---

## Cost Escalation Protocol

When any free tier is projected to be exceeded:

1. Agent-99 receives `TIER_WARNING` alert from Oracle
2. Agent-99 reviews usage and identifies optimization opportunities
3. If optimization cannot solve: Agent-99 presents upgrade case to Agent-100
4. Agent-100 authorizes or denies upgrade
5. If denied: Oracle implements usage throttling to stay within free tier
6. If authorized: Upgrade is tracked in cost ledger, monthly cost report updated

**No paid upgrade occurs without Agent-100's explicit authorization.**
