# CLOUDFLARE MANIFEST — OB-1 CANONICAL

**Account:** mrmichaelhobbs123@gmail.com  
**Account ID:** 3c7b1766bd8fdc9e01211d2b390315ea  
**Last audited:** 2026-05-17  

This file is the authoritative inventory of all live Cloudflare assets. Run `pwsh -File SCRIPTS/obi.ps1 cf-audit` to refresh (not yet implemented — see GAP-1).

---

## Workers (11)

| Worker | URL | Last Deploy | Health | Tracked in Repo | Notes |
|---|---|---|---|---|---|
| net-pet-ai | net-pet-ai.mrmichaelhobbs123.workers.dev | 2026-05-16 | ✅ 200 | ✅ APPS/NET-PET-AI | Primary worker — canon branch |
| net-pet-ai-production | net-pet-ai-production.mrmichaelhobbs123.workers.dev | 2026-05-02 | ✅ 200 | ⚠️ same source | Ghost assets present — see RESCUED |
| net-pet-ai-staging | net-pet-ai-staging.mrmichaelhobbs123.workers.dev | 2026-04-19 | ❌ 404 | ❌ | Staging slot, no health route |
| net-pet-ai-mvp | net-pet-ai-mvp.mrmichaelhobbs123.workers.dev | 2026-04-19 | ✅ 200 | ❌ | MVP build, untracked |
| net-obi-api | net-obi-api.mrmichaelhobbs123.workers.dev | 2026-04-14 | ❌ 404 | ❌ | Legacy API worker |
| net-core | net-core.mrmichaelhobbs123.workers.dev | 2026-04-14 | ❌ 404 | ❌ | Legacy core worker |
| phoenix-coder | phoenix-coder.mrmichaelhobbs123.workers.dev | 2026-05-17 | ❌ 404 | ❌ PROJECTS/phoenix-coder | Standalone repo, not APPS/ |
| soul-logger | soul-logger.mrmichaelhobbs123.workers.dev | 2026-05-06 | ✅ 200 | ❌ | Untracked — source unknown |
| submission-api | submission-api.mrmichaelhobbs123.workers.dev | 2026-05-05 | ✅ 200 | ❌ | Handles Tiger Assessment submissions |
| frosty-bush-c14f | frosty-bush-c14f.mrmichaelhobbs123.workers.dev | 2025-12-28 | ❓ | ❌ | Early prototype — likely orphaned |
| phoenix-v5-test | phoenix-v5-test.mrmichaelhobbs123.workers.dev | 2025-12-26 | ❌ 404 | ❌ | Early prototype — likely orphaned |

---

## Pages Projects (13)

| Project | URL | Last Deploy | Live | Tracked in Repo | Notes |
|---|---|---|---|---|---|
| net-tiger-assessment | net-tiger-assessment.pages.dev | 1 month ago | ✅ 200 | ✅ RESCUED → public/net-tiger-assessment.html | Bilingual (VI/EN) intake assessment |
| naturalenglishtraining | naturalenglishtraining.pages.dev | 4 weeks ago | ✅ 200 | ❌ | Marketing site — primary brand domain |
| net-marketing-landing | net-marketing-landing.pages.dev | 1 week ago | ✅ 200 | ❌ | Landing page |
| netpetai-presentation | netpetai-presentation.pages.dev | 4 days ago | ✅ 200 | ❌ | Presentation deck |
| tigers-4room | tigers-4room.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| cubs-4room | cubs-4room.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| professional-4room | professional-4room.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| career-4room | career-4room.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| university-4room | university-4room.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| tigers-selection | tigers-selection.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| professional-selection | professional-selection.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but empty/broken |
| net-marketing | net-marketing.pages.dev | 1 week ago | ❌ 404 | ❌ | Deployed but broken |
| obi-landing | obi-landing.pages.dev | 2 weeks ago | ❌ 404 | ❌ | Deployed but broken |

---

## KV Namespaces (3)

| Name | ID |
|---|---|
| SESSIONS | 4adc1924c50b49df8dc260e95efd68bf |
| WAITLIST | a30d57a9da6e4446a536aef7ccf8756f |
| CACHE | ea5c8e99cb584dee9ab4f9ba5ed421c9 |

---

## D1 Databases (2)

| Name | UUID | Created | Tables |
|---|---|---|---|
| soul-archive | c69a11bc-064b-478f-9b1f-e9b8e2431fb8 | 2026-05-05 | 0 (empty) |
| net-submissions | 1a7246ce-1227-4205-9234-76cbd036fa48 | 2026-05-05 | 0 (empty) |

---

## Ghost Assets Rescued (2026-05-17)

Files that existed in the deployed `net-pet-ai-production` worker but were absent from git. All rescued to `APPS/NET-PET-AI/public/`:

| File | Size | Status | Notes |
|---|---|---|---|
| minh-methodology.html | 22,284 bytes | ✅ RESCUED | Multi-tab portal — Methodology tab |
| minh-profile.html | 22,481 bytes | ✅ RESCUED | Multi-tab portal — Profile tab |
| minh-transcripts.html | 25,227 bytes | ✅ RESCUED | Multi-tab portal — Transcripts tab (Apr 13, Apr 24 sessions) |
| minh-action-plan.html | 26,759 bytes | ✅ RESCUED | Multi-tab portal — Action Plan tab |
| net-tiger-assessment.html | 35,213 bytes | ✅ RESCUED | Tiger Assessment app (bilingual VI/EN) |

**Pre-existing in repo (not ghost):**
- `public/minh-parent-portal.html` — Dashboard tab (was already in repo)
- `public/student/minh-private.html` — Simple card format (WRONG template, used for new students)

---

## Gaps / Action Items

| # | Gap | Impact | Fix |
|---|---|---|---|
| GAP-1 | `obi.ps1 doctor` has no Cloudflare API query | Audit blindspot for all 24 assets | Add `cf-audit` command to obi.ps1 |
| GAP-2 | 7 live Workers not tracked in repo | Source code invisible to canon | Audit each, add APPS/ entries or mark as intentional-external |
| GAP-3 | naturalenglishtraining.pages.dev not in repo | Marketing site is a ghost | Pull and add to APPS/ |
| GAP-4 | 7 Pages projects deployed but returning 404 | Dead deployments consuming CF quota | Investigate — delete or fix |
| GAP-5 | 2 D1 databases exist but have 0 tables | Created, never migrated | Run migrations or delete |
| GAP-6 | Mai Tram, Quy, Huong built on wrong template | Missing multi-tab portal experience | Rebuild against rescued minh portal |
| GAP-7 | submission-api and soul-logger untracked | Business-critical workers invisible | Locate source, add to APPS/ |
