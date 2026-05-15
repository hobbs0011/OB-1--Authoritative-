# Agent99 Playbook: Notion Free Max-Benefit Strategy

Date: 2026-04-16
Mission: Maximize Notion Free for PhoenixRisingTech operating system while defining hard switch criteria to open-source or paid upgrades.

## 1. Ground Truth for This Stack

Current runtime behavior already matches a high-leverage pattern:
- Durable Objects / Ledger is source of truth.
- Notion is a non-blocking searchable mirror and control plane.
- If Notion is unavailable, core runtime still works.

This is ideal because:
- Product reliability does not depend on Notion uptime.
- Notion can stay in Free mode longer without hurting core operations.
- Replacement risk is low because data authority is already outside Notion.

## 2. What Notion Free Should Be Used For (Agent99 OS)

Use Notion Free only for high-value, low-write surfaces:

1. Operator Control Plane
- Ops dashboard pages
- Priority queue
- Runbooks/checklists
- Weekly KPI snapshots

2. Searchable Mirrors (not canonical)
- Lesson metadata indexes
- Student progress summaries
- Soul DNA index pointers (not full raw archives if volume explodes)

3. Human Workflow Layer
- Editorial/teacher review queues
- Approval tags
- Lightweight CRM notes

Do not use Notion Free as:
- Primary event store
- High-frequency chat/event stream store
- Binary asset store
- Ledger/canonical audit database

## 3. Notion Free Optimization Tactics (Immediate)

1. Keep writes sparse
- Mirror only summaries and pointers, not full transcripts by default.
- Store large text/audio in R2 and save links in Notion.

2. Batch writes
- Queue updates and flush every N minutes instead of per-event writes.
- Coalesce repeated updates for same student/session.

3. Use tiered retention
- Hot: recent 7 to 30 days in Notion index.
- Warm/cold: full data in Ledger/R2 with Notion pointer rows.

4. Strict schema discipline
- Use compact, stable properties.
- Avoid schema churn and excessive relation fields.

5. Protect API budget
- Add retry with exponential backoff.
- Add dead-letter queue for failed sync jobs.
- Avoid read-after-write calls unless required.

6. Operational observability
- Track sync lag, failed writes, and queue depth.
- Alert only on sustained backlog, not single-call failures.

## 4. Decision Gate: Stay Free, Pay, or Replace

Use this deterministic gate each month:

Stay on Notion Free if all are true:
- Notion remains non-blocking.
- Team collaboration limits are acceptable.
- Sync backlog remains low and recoverable.
- No critical workflow blocked by Free constraints.

Upgrade to paid Notion if either is true:
- Collaboration/permissions become the bottleneck.
- Faster execution is worth more than engineering migration cost.

Switch to open-source if either is true:
- Data ownership/self-hosting is mandatory.
- Notion constraints repeatedly block product velocity.

## 5. Open-Source Replacement Options (Ranked for Agent99)

## Option A (Best replacement for Notion-like docs + wiki)
AppFlowy (self-host)
- Strengths: Notion-like UX, local-first philosophy, open-source control.
- Tradeoff: API/integration maturity can vary by version.
- Best when: You want Notion feel with sovereignty.

## Option B (Best replacement for Notion database usage)
Baserow or NocoDB (self-host)
- Strengths: API-first tables, automation-friendly, strong for structured records.
- Tradeoff: Less "doc/wiki" native than Notion.
- Best when: progress/lesson indexes are mostly tabular.

## Option C (Best docs knowledge base with strong team UX)
Outline or Docmost (self-host)
- Strengths: clean docs/workflow collaboration.
- Tradeoff: weaker database-style workflows.
- Best when: docs are priority and database needs are externalized.

Recommended architecture if replacing Notion:
- Keep Ledger + DO + R2 as canonical.
- Add Baserow/NocoDB for operational tables.
- Add AppFlowy or Docmost for knowledge/ops docs.

## 6. Paid-If-Worth-It Guidance

Because you are willing to pay for serious advantage, use ROI-first logic:

Pay if it saves at least 4 to 8 engineering hours per month or unblocks revenue-critical flow.
Do not pay for convenience that does not improve student outcomes, shipping velocity, or reliability.

For NET mission (AI English tutor for Vietnamese learners), top paid priorities are typically:
1. Voice quality and reliability (Deepgram stack)
2. Payment conversion reliability (Stripe)
3. Content generation throughput (NotebookLM or equivalent)
4. Collaboration tooling only after product bottlenecks are solved

## 7. 30-Day Agent99 Execution Plan

Week 1
- Keep Notion Free.
- Enforce summary-plus-pointer mirror policy.
- Add sync metrics: lag, failures, backlog.

Week 2
- Add batch sync worker and dead-letter queue path.
- Cap Notion writes per session and per student.

Week 3
- Pilot one open-source alternative in parallel (Baserow recommended first).
- Mirror a subset of lesson/progress data into pilot.

Week 4
- Compare total operating friction:
  - Query speed
  - Sync reliability
  - Team usability
  - Maintenance burden
- Decide: stay Free, upgrade Notion, or cutover hybrid.

## 8. Hard Recommendation for PhoenixRisingTech Now

Recommended now:
- Continue using Notion Free immediately.
- Treat it strictly as searchable control-plane mirror.
- Start a parallel pilot of Baserow for structured operational records.

Why this is the best move today:
- Zero disruption to current runtime.
- Immediate cost discipline.
- Creates an exit path without forcing premature migration.
- Preserves speed while you invest paid budget in higher-ROI capabilities.

## 9. Optional Next Implementation Step

If approved, implement two code-level controls in runtime:
1. Mirror policy switch:
- full | summary | pointer-only
2. Batched Notion write queue with retry/dead-letter

These two controls extend Notion Free viability significantly and make replacement trivial later.
