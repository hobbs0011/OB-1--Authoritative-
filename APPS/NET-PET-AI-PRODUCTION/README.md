# net-pet-ai-production — RESCUED BUNDLE

**Worker:** `net-pet-ai-production`
**URL:** https://net-pet-ai-production.mrmichaelhobbs123.workers.dev
**Version deployed:** `1.6.2+v68.1-phase4-advanced`
**Last deployed:** ~2026-05-02 (May 2 etag)
**Rescued:** 2026-05-18

---

## CRITICAL — DO NOT OVERWRITE WITH CANON CODE

This slot runs a **completely different codebase** from `APPS/NET-PET-AI/` (which is v1.5.0).

Deploying the canon `wrangler.toml` to this slot would:
1. Downgrade from v1.6.2 to v1.5.0
2. Remove 26 DO class bindings that exist in production
3. **Orphan all live DO instances — data unrecoverable**

This slot requires its own deploy pipeline using the v1.6.2 source (not yet recovered).

---

## What's Different

The production slot is a monetization-layer build containing infrastructure absent from the canon codebase:

| Area | Details |
|---|---|
| Revenue | StripeCheckoutDO, RevenueCheckoutDO, AffiliateCommissionDO, CohortRevenueTrackingDO |
| Segmentation | StudentProfileDO, CohortAnalysisDO, phase6 schema (7 tables) |
| Behavioral | PheromoneTrailDO, ChurnModelDO, ReEngagementDO, StreakDO |
| Infrastructure | RateLimiterDO, QuotaEnforcementDO, WebhookResilienceDO, GitHubOAuthDO |
| Sessions | SessionSubscriptionDO, ControlledSynthesisDO, AdaptiveDifficultyDO |
| Student | StudentDO, StudentInfoDO, StudentBrainV2, PetPersonalityDO |
| Util | CacheDO, FastSealCursorDO, LocalizationGatewayDO, HeavyLedger, CommandDO |

**Total DO exports: 30**

**phase6-init.js** creates 7 SQLite tables inside DO storage:
`student_segments`, `cohort_definitions`, `cohort_membership`, `segment_transitions`,
`cohort_metrics`, `cohort_performance_history`, `student_profile_snapshots`

---

## Notion Status

The production slot pre-dates the NOTION_BLACKLISTED refactor. Live Notion API routes exist:
- `GET /api/notion/lessons`
- `GET /api/notion/progress`
- `POST /api/notion/progress`
- `POST /api/notion/sync`

`NOTION_API_KEY` secret is not set in this slot → all Notion calls fail gracefully.
`allOk` in health depends on `notionOk` → health returns `ok: false`.

---

## worker.js

`worker.js` in this directory is the bundled output from Cloudflare (retrieved via CF MCP API).
It is a reference only — not deployable as-is to this slot without reconstructing the proper
wrangler.toml with all 30+ DO bindings.

The actual v1.6.2 source (pre-bundle) is not in this repo. It needs to be recovered from
wherever it was built and committed here before this slot can be safely managed.
