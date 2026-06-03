# NET-PET-AI Hardening Pipeline
# Generated: Run 050 — 2026-06-03 ICT
# Baseline score: 68/100 | Target: 94-96/100
# See RISE-050 audit for gap analysis. Ordered: stop bleeding → safety net → refactor → optimize → observe.
# Canonical score ceiling for CF Workers edge app: ~94-96 (GraphQL/Kafka rubric items are arch mismatches, not deficiencies)

---

## RULES
- Phases are ordered. Never start Phase N+1 before Phase N gate passes.
- All code generation dispatches to PA T1 Qwen. No inline synthesis.
- DEV-first always. Promote to prod only after gate passes.
- Update status inline as each item completes.

---

## PHASE 0 — Revenue Loose Ends
**Score delta: +0 (not on rubric) | Revenue-critical | Done before any architecture work**

### P0-01 — Resend from-address fix
- Status: DONE (Run 050)
- What: `from: noreply@naturalenglishtraining.com` → `from: onboarding@resend.dev` (pre-verified by Resend, no domain setup needed)
- Also fixed: magic link now points to prod worker (`net-pet-ai`) instead of dev
- Deploy: submission-api v2c1c4532 — 2026-06-03
- File: APPS/WORKERS/submission-api/worker.js

### P0-02 — Funnel browser test (Michael action)
- Status: OPEN (deferred — Michael does at end)
- What: Open tigers-4room.pages.dev, fill name, submit → confirm email arrives at Gmail → OBI greets by name in taster chat
- Gate: Email arrives from `onboarding@resend.dev` with correct student name + magic link
- Why: Funnel has been live since Run 049 but email leg unverified. This is the revenue receipt.

---

## PHASE 1 — Security Hardening
**Score delta: Auth+Security 12 → 18 (+6) | Total: 74 | Risk: LOW | Dispatch: PA T1**

### P1-01 — Admin route auth gate
- Status: OPEN
- What: Add `WORKER_ADMIN_KEY` wrangler secret. Constant-time header check (`X-Admin-Key`) on:
  - `/api/teacher/dashboard` → 401 without key
  - `/api/error-log` (GET) → 401 without key
  - `/api/employer/create` → 401 without key
  - `/api/ledger/status` (write paths) → 401 without key
  - Leave `/api/error-report` OPEN (write-only, anonymous, already rate-limited)
- Implementation: Add `checkAdminKey(request, env)` helper in `src/security.js`, call at each route head
- Dispatch: PA T1 — `src/security.js` + route guards in `src/index.js`
- Gate: `curl /api/teacher/dashboard` → 401; `curl -H "X-Admin-Key: <key>" /api/teacher/dashboard` → 200

### P1-02 — HMAC student token server-side enforcement
- Status: OPEN
- What: `chat.js:30` references `studentToken` but server never verifies it. Wire server-side:
  - Onboarding issues: `HMAC-SHA256(studentId + "|" + issuedAt, STUDENT_SIGNING_SECRET)` (SubtleCrypto, stateless, edge-native)
  - Memory-write routes verify `X-Student-Token` before mutating: `/api/netpet/checkin`, `/api/practice`, soul/memory writes
  - Read routes remain lenient during rollout
- Dispatch: PA T1 — new `src/auth.js` module + onboarding route + write-route guards
- Gate: Memory write with missing/forged token → 401; valid token → 200

### P1-03 — Secret hygiene
- Status: OPEN
- What: RRL-049 + prior RRLs contain plaintext keys (Resend key confirmed in death seal §02). Rotate:
  - Resend key (already in submission-api secret — rotate via wrangler)
  - Any Dialagram/Deepgram keys that appeared in RRL plaintext
- Also: add gitleaks pre-commit hook to `.git/hooks/pre-commit` to catch future leaks
- Gate: `gitleaks detect` on HEAD returns 0 findings

**Phase 1 commit:** `feat: P1 security — admin auth gate + HMAC student token + gitleaks hook`

---

## PHASE 2 — Safety Net + Data Integrity
**Score delta: Data 13 → 19 (+6) | Total: 80 | Risk: MED | Dispatch: PA T1**
**PREREQUISITE: Phase 1 gate passed. Tests must exist before Phase 3 refactor.**

### P2-01 — Test harness (40 route smoke tests)
- Status: OPEN
- What: `vitest` + `@cloudflare/vitest-pool-workers` (runs inside actual workerd, D1/KV/DO mocked)
- Scope: smoke test every route — status code + response shape only. Not unit tests. This is the regression net for Phase 3.
- Dispatch: PA T1 — generate `test/` directory with 40 route smoke tests
- Gate: `vitest run` all green before Phase 3 begins

### P2-02 — Drizzle ORM + real migrations
- Status: OPEN
- What: Replace raw `env.SOUL_DB.prepare(sql)` with Drizzle (edge-native, ~5KB runtime, zero codegen cost)
  - Define schema: `soul_prompts`, `error_log`, employer tables
  - `drizzle-kit generate` → versioned SQL migrations
  - `wrangler d1 migrations apply` → replaces the commented-out `[[migrations]]` graveyard in wrangler.toml
- Decision point: Migrate `src/` to TypeScript incrementally alongside Drizzle (rename + `@ts-nocheck` escape hatch, tighten per-file). Recommended — Drizzle types + Phase 3 Zod deliver 3× value in TS.
- Dispatch: PA T1 — schema definitions + migration files + Drizzle client setup
- Gate: D1 migrations apply clean on DEV; error_log + soul writes verified through ORM; all Phase 2-01 smoke tests still green

**Phase 2 commit:** `feat: P2 — vitest harness (40 routes) + Drizzle ORM + D1 migration toolchain`

---

## PHASE 3 — API Layer Maturity
**Score delta: Core Infra 18 → 23 (+5), API 14 → 19 (+5) | Total: 90 | Risk: HIGH | Dispatch: PA T1, chunked ≤300 lines/call**
**PREREQUISITE: Phase 2 smoke tests all green. Never do this refactor without the net.**

### P3-01 — Hono framework (incremental migration)
- Status: OPEN
- What: Introduce Hono (CF-native, ~14KB). De-risk strategy:
  - Hono handles new routes immediately
  - `app.all('*', legacyHandler)` falls through to existing `handleAPI()` for unmigrated paths
  - Migrate route-group by route-group; smoke tests green at every step
  - Never a big-bang cutover
- Dispatch: PA T1 — Hono setup + migration of first 10 routes as proof of pattern
- Gate: All 40 smoke tests green after each migration batch

### P3-02 — API versioning
- Status: OPEN
- What: Hono route groups under `/api/v1/*`. Alias bare `/api/*` → v1 during transition.
- Gate: `/api/health` and `/api/v1/health` both return 200; deprecation header on bare routes

### P3-03 — Zod + OpenAPI contract
- Status: OPEN
- What: `@hono/zod-openapi` — Zod schemas validate request/response AND auto-generate OpenAPI spec. Serve Swagger UI at `/api/docs`.
- Dispatch: PA T1 — Zod schemas for all 40 routes + OpenAPI middleware
- Gate: Deliberately malformed body → 422 with Zod detail; `/api/docs` renders full spec

**Phase 3 commit:** `feat: P3 — Hono router + /api/v1 versioning + Zod/OpenAPI contract`

---

## PHASE 4 — Performance & Async
**Score delta: Background 7 → 10 (+3) | Total: 93 | Risk: LOW | Dispatch: PA T1**

### P4-01 — Non-blocking email (submission-api)
- Status: OPEN
- What: Resend email send in submission-api is currently synchronous inside request handler. Wrap in `ctx.waitUntil()` — student's form submit returns instantly even if Resend is slow/down.
- Gate: Form submit returns <200ms when Resend stubbed to 5s delay

### P4-02 — Cloudflare Queues
- Status: OPEN
- What: CF Queues as the edge-native message broker (replaces BullMQ/Celery at this scale)
  - Producer: heavy work triggers (report generation, escalation batches, soul-pipeline ingestion)
  - Consumer: separate queue worker processes in background
  - CF Queues is the correct architecture choice — not a workaround, it's the platform's blessed async primitive
- Gate: Queue consumer drains test batch; main worker response time unaffected by queue depth

### P4-03 — Edge caching
- Status: OPEN
- What: Cache API + `Cache-Control` on read-heavy GETs: `/api/teacher/dashboard`, lesson assets, `/api/ledger/status`
- KV already serves the Redis role for student profiles — this layer covers computed read views
- Gate: Second hit on cached routes served from CF edge without worker invocation

**Phase 4 commit:** `feat: P4 — CF Queues + non-blocking email + edge cache layer`

---

## PHASE 5 — Observability & CI/CD
**Score delta: DevOps 4 → 5 (+1) + closes monitoring gaps | Total: 94-96 | Risk: LOW | Dispatch: PA T1**

### P5-01 — Heartbeat alerting (wire the existing signal)
- Status: OPEN
- What: `src/index.js:321` already detects `SOUL_DRIFT_ALARM` and logs it — but only to console. Wire it to a real notification channel (Zalo push or Resend email to Michael). Detection without notification is silence.
- Gate: Forced SOUL drift (stub soul-logger to return low count) fires email/Zalo to Michael within 60s

### P5-02 — GitHub Actions CI/CD
- Status: OPEN
- What: On push to master:
  1. `node --check src/*.js`
  2. `vitest run`
  3. `gitleaks detect`
  4. `wrangler deploy` → DEV
  5. Manual approval gate → prod deploy
- Codifies the firewall doctrine (DEV-first, prod needs approval) in the pipeline — no longer enforced by hand
- Gate: Broken PR blocked by CI; prod deploy requires approval click

### P5-03 — Workers Observability / Sentry for Workers
- Status: OPEN
- What: Structured error sampling + distributed traces beyond the D1 `error_log`. CF Workers Observability (free tier available) or Sentry Workers SDK.
- Gate: Error sample rate >0 visible in dashboard; trace shows cross-worker call latency (net-pet-ai → soul-logger → submission-api)

**Phase 5 commit:** `feat: P5 — heartbeat alerting + GitHub Actions CI/CD + Workers observability`

---

## Score Trajectory

| Phase | Focus | Total |
|-------|-------|-------|
| — | Baseline (Run 050) | 68 |
| 0 | Revenue loose ends | 68 |
| 1 | Security holes closed | 74 |
| 2 | Tests + ORM + migrations | 80 |
| 3 | Hono + v1 + OpenAPI | 90 |
| 4 | Queues + async | 93 |
| 5 | Alerting + CI/CD | 94-96 |

## Why 94-96 is the real 100
CF Workers edge apps cannot honestly implement 3 rubric items without cargo-culting:
- GraphQL (~2 pts) — REST+Zod is correct at this route count; GraphQL adds complexity with no benefit
- Kafka/RabbitMQ-class brokers (~2 pts) — CF Queues is the canonical edge-native substitute; a VM-centric rubric may not score it at par
- Self-managed server/Nginx — CF edge is strictly better here; the rubric assumes a box you manage

Chasing these last 4-6 points makes the product worse. 94-96 is the ceiling worth building to.
