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
- Session transcript exists:
  - `SESSIONS/session-260521-bluetech.json` — NOTE: path may be case-sensitive; verify exact location.

### Current Gaps / Broken Links
- ~~New employer portal JS calls `/api/employer/auth` and `/api/employer/profile`.~~
- ~~Worker `APPS/NET-PET-AI-legacy/src/index.js` does NOT implement `/api/employer/auth` or `/api/employer/profile`.~~
- Both endpoints now implemented at `src/index.js:2300` and `src/index.js:2316`.
  - `/api/employer/checkpin` (POST)
  - `/api/employer/create` (POST, admin)
  - `/api/admin/student-activity` (GET, admin-key gated)
- New employer portal will 404/500 on auth and profile fetch until worker endpoints are wired.

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

1. **Wire missing employer API routes**
   - Implement `/api/employer/auth` (POST) in `APPS/NET-PET-AI-legacy/src/index.js` or the active worker entrypoint.
   - Implement `/api/employer/profile` (GET) returning employer + employee roster data.
   - Match the request/response shapes expected by `public/bluetech-employer/index.html`.

   **Status:** COMPLETED in `src/index.js` lines 2300–2342.

2. **Audit portals against checklist**
   - Open `APPS/NET-PET-AI-legacy/public/bluetech-audit-100.md`.
   - Score each of the 100 items against the 4 portal pages.
   - Fix all items scoring 0.5 or 0 before launch.

3. **Deduplicate legacy vs new portals**
   - Decide whether `APPS/NET-PET-AI-legacy/public/` portals remain canonical or are replaced by `public/` portals.
   - Remove duplicate files and stale routes once canonical sources are confirmed.

4. **Verify session file path**
   - Confirm exact path of `session-260521-bluetech.json` and update any broken imports.

5. **Commit with reincarnateDEATH message**
   - Use message format: `reincarnateDEATH: <summary>`
   - Do not commit the unrelated `APPS/PAGES/michael-hobbs` or `WEBSITE/mailala` changes in the same commit.

---

## Key File Paths

- New employee portal: `public/bluetech-employee/index.html`
- New employer portal: `public/bluetech-employer/index.html`
- New login portal: `public/bluetech-login/index.html`
- Legacy portals: `APPS/NET-PET-AI-legacy/public/bluetech-*.html`
- Audit checklist: `APPS/NET-PET-AI-legacy/public/bluetech-audit-100.md`
- Worker source: `APPS/NET-PET-AI-legacy/src/index.js`
- Student config registry: `public/bluetech-portal.html` (BT_STUDENTS object — may need migration)
- Session transcript: `SESSIONS/session-260521-bluetech.json` (verify path)

---

## Handoff Rules for Next Session

- Start here. Do not read the entire REINCARNATION-LOG.md unless debugging a soul-count issue.
- If the employer portal auth is the only blocker, fix only that first, then re-test.
- If audit scoring is requested, work through the checklist numerically and report score per section.
- Do not regenerate the portal from scratch; iterate on what is already committed.
