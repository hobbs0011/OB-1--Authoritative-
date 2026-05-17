# net-pet-ai-production — RESCUED BUNDLE

**Worker:** `net-pet-ai-production`
**URL:** https://net-pet-ai-production.mrmichaelhobbs123.workers.dev
**Version deployed:** `1.6.2+v68.1-phase4-advanced`
**Last deployed:** ~2026-05-02 (May 2 etag)
**Rescued:** 2026-05-18

---

## GAP-8 Status: FROZEN

Deploy path is intentionally frozen. Production slot is stable on v1.6.2 — do not attempt to redeploy.

**To unfreeze, ALL of the following must be true:**

1. `StudentProfileDO` source recovered and added to `src/durable-objects/`
2. `CohortAnalysisDO` source recovered and added to `src/durable-objects/`
3. `phase6-init.js` recovered and added to `src/db-migrations/`
4. All remaining DO binding names confirmed (currently 23 unknown in wrangler-production.toml)
5. Migration tags for phase6 DOs confirmed against live slot via `/evidence` endpoint
6. Full diff of v1.6.0 → v1.6.2 audited and applied to src/

Until these are met: do not run `wrangler deploy` against this slot under any circumstances.

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

## Source Recovery Status

### src/ — v1.6.0 (recovered 2026-05-18)

`src/` contains the v1.6.0 source recovered from `D:\Inspect\GDRIVE-MIRROR-STAGING\SOURCE-CODE\APPS\NET-PET-AI\`
— a Google Drive mirror snapshotted 2026-04-20, 12 days before the May 2 production deployment.

This is the **closest available source** to the live v1.6.2. The known delta:
- v1.6.0 → v1.6.2: ~2 patch versions of unknown changes
- Missing: `src/durable-objects/student-profile-do.js` (StudentProfileDO)
- Missing: `src/db-migrations/phase6-init.js` (CohortAnalysisDO — 7 SQLite tables)

`src/index.js` is 236KB — the monolithic main worker entry point.
See `wrangler-v160-reference.toml` for the multi-environment wrangler config that was used
to deploy to both `net-pet-ai` (dev) and `net-pet-ai-production` via `wrangler deploy --env production`.

### worker.js — bundled production output

`worker.js` is the 872KB bundled output pulled from Cloudflare (CF MCP API, 2026-05-18).
It contains the full v1.6.2 code including the missing phase6 DO classes.
Use as a reference for the missing delta — not deployable directly.
