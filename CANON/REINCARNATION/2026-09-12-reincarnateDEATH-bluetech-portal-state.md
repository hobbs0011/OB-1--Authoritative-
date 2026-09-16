# ReincarnateDEATH — Bluetech Portal State Handoff

**Date:** 2026-09-12  
**HEAD:** `cf945ecc9c2fd6e4ae80531ef1968bee8659a2ba`  
**Author:** OB1  
**Purpose:** Clean state capture for next session. No context overload — just what is true, what is missing, and what to do next.

---

## What Is True Right Now

### Completed
- Bluetech portal suite redesigned with Apple-minimalist aesthetic and NET branding.
- New portal pages committed under `public/`:
  - `public/bluetech-login/index.html` — role selector (Employee / Employer / Teacher) + PIN gate.
  - `public/bluetech-employee/index.html` — student-facing portal with progress, lessons, badges, accountability banner.
  - `public/bluetech-employer/index.html` — employer dashboard with stats, employee cards, CEFR/streak data.
  - `public/bluetech-cinematic/index.html` — cinematic/starfield landing experience.
- 100-point audit checklist added at:
  - `APPS/NET-PET-AI-legacy/public/bluetech-audit-100.md`
- Legacy portals still present under:
  - `APPS/NET-PET-AI-legacy/public/bluetech-portal.html`
  - `APPS/NET-PET-AI-legacy/public/employer-portal.html`
  - `APPS/NET-PET-AI-legacy/public/bluetech-dashboard.html`
- Student roster confirmed:
  - `quy-bluetech`
  - `huong-bluetech`
  - `mai-tram-bluetech`
- Session transcript exists and path verified:
  - `SESSIONS/session-260521-bluetech.json` ✅
- **Deploy fix (2026-09-16 continuation):**
  - New Bluetech portals were orphaned in root `public/` and NOT deployed.
  - Copied `public/bluetech-*` portals + `magic-chat.html` + brand assets into `NET-PET-AI/public/` so they are served by the active worker.
  - Patched deployed worker bundle `NET-PET-AI/deploy/net-pet-ai-fixed.router.js` to add missing `/api/employer/checkpin` route.
  - Added `/api/employer/auth` and `/api/employer/profile` routes to the bundle for legacy employer portal compatibility.
  - Dry-run validation passed: `wrangler deploy --dry-run` reads 17 asset files and produces 828KB bundle without errors.

### Current Gaps / Broken Links
- New employer portal (`public/bluetech-employer/index.html`) is static and does not call `/api/employer/auth` or `/api/employer/profile`.
- Legacy employer portal (`APPS/NET-PET-AI-legacy/public/employer-portal.html`) DOES call `/api/employer/auth` and `/api/employer/profile`, but is NOT currently deployed.
- Deployed worker bundle now includes:
  - `/api/employer/checkpin` (POST) — added 2026-09-16
  - `/api/employer/auth` (POST) — added 2026-09-16
  - `/api/employer/profile` (GET) — added 2026-09-16
- Bluetech portals are now present in `NET-PET-AI/public/` and will be served on next deploy.
- Remaining nav links in new portals (`/bluetech-story/`, `/bluetech-programs/`, `/bluetech-demo/`, `/bluetech-contact/`) do not yet exist — 404 until pages are created.

### Uncommitted Changes (Working Tree)
```
M  APPS/PAGES/michael-hobbs/package.json
D  APPS/PAGES/michael-hobbs/test/audit.spec.ts
M  CANON/SYSTEM/LegionnaireFieldGuide.md
M  WEBSITE/mailala/index.html
D  tmp/audit.js, tmp/audit2.js, tmp/audit3.js
D  tmp/checkpin.ps1, tmp/checkpin2.ps1, tmp/debugpin.ps1, tmp/setpins.ps1, tmp/testpins.ps1
?? APPS/PAGES/michael-hobbs/package-lock.json
?? APPS/PAGES/michael-hobbs/playwright.config.ts
?? APPS/PAGES/michael-hobbs/test/penthouse-audit.spec.ts
?? APPS/PAGES/michael-hobbs/test/playwright-report/
?? WEBSITE/mailala/assets/images/*.jpg
```
These are unrelated to the Bluetech portal work. Do not mix them into a portal fix commit.

---

## Next Session — Exact Actions

1. **✅ Wire missing employer API routes**
   - `/api/employer/checkpin`, `/api/employer/auth`, `/api/employer/profile` patched into deployed bundle `NET-PET-AI/deploy/net-pet-ai-fixed.router.js`.
   - Dry-run validated.

2. **✅ Deploy Bluetech portals to active assets**
   - Copied `public/bluetech-{login,employee,employer,cinematic}/index.html` + `magic-chat.html` + brand assets into `NET-PET-AI/public/`.
   - Next `wrangler deploy` from `NET-PET-AI/` will serve them.

3. **Audit portals against checklist**
   - Open `APPS/NET-PET-AI-legacy/public/bluetech-audit-100.md`.
   - Score each of the 100 items against the 4 portal pages.
   - Fix all items scoring 0.5 or 0 before launch.

4. **Deduplicate legacy vs new portals**
   - Decide whether `APPS/NET-PET-AI-legacy/public/` portals remain canonical or are replaced by `public/` portals.
   - Remove duplicate files and stale routes once canonical sources are confirmed.

5. **Create missing portal pages**
   - New portals nav links to `/bluetech-story/`, `/bluetech-programs/`, `/bluetech-demo/`, `/bluetech-contact/` — these do not exist yet.
   - Either create placeholder pages or remove nav links.

6. **Commit with reincarnateDEATH message**
   - Use message format: `reincarnateDEATH: <summary>`
   - Do not commit the unrelated `APPS/PAGES/michael-hobbs` or `WEBSITE/mailala` changes in the same commit.

---

## Key File Paths

- New employee portal: `public/bluetech-employee/index.html`
- New employer portal: `public/bluetech-employer/index.html`
- New login portal: `public/bluetech-login/index.html`
- Cinematic portal: `public/bluetech-cinematic/index.html`
- **Deployed portals (active):** `NET-PET-AI/public/bluetech-*/index.html`
- Legacy portals: `APPS/NET-PET-AI-legacy/public/bluetech-*.html`
- Audit checklist: `APPS/NET-PET-AI-legacy/public/bluetech-audit-100.md`
- Deployed worker bundle: `NET-PET-AI/deploy/net-pet-ai-fixed.router.js`
- Worker source (stale, do not deploy from): `APPS/NET-PET-AI-legacy/src/index.js`
- Student config registry: `public/bluetech-portal.html` (BT_STUDENTS object — may need migration)
- Session transcript: `SESSIONS/session-260521-bluetech.json` ✅

---

## Handoff Rules for Next Session

- Start here. Do not read the entire REINCARNATION-LOG.md unless debugging a soul-count issue.
- If the employer portal auth is the only blocker, fix only that first, then re-test.
- If audit scoring is requested, work through the checklist numerically and report score per section.
- Do not regenerate the portal from scratch; iterate on what is already committed.
