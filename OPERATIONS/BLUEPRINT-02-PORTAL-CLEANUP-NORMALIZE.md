# BLUEPRINT-02: Portal Cleanup & Normalization

## Objective
Clean up duplicate, orphaned, and inconsistent portal files. Normalize studentId formats. Fix the Cloudflare worker health endpoint.

## Current State

### Portal Files on Disk
```
public/                             public/deactivated/          public/student/
├── bluetech-portal.html            ├── quang-portal.html        ├── quy-bluetech.html
├── bluetech-login/index.html       ├── quan-portal.html         ├── mai-tram.html
├── quan-quang-login/index.html     └── minh-parent-portal.html  ├── huong-bluetech.html
├── quy-portal.html                                                 └── minh-private.html
├── huong-portal.html
├── mai-tram-portal.html
├── quang-portal.html
├── quan-portal.html
├── lam-portal.html
├── employer-portal.html
├── sov100-portal.html
├── test-portal.html
├── admin.html
├── admin-dashboard.html
├── portal.css
├── portal-shared.js
└── assets/css/portal.css
```

### portalMap in src/index.js:4455
```
quy-bluetech  → /student/quy-bluetech
huong-bluetech → /student/huong-bluetech
mai-tram       → /student/mai-tram
lam-bluetech   → /lam-portal.html?studentId=lam-bluetech
quan-nguyen    → /quan-portal.html?studentId=quan-nguyen
quang-nguyen   → /quan-portal.html?studentId=quang-nguyen
minh-private   → /student/minh-private
```

### Student Roster in src/index.js:3065
```
huong-bluetech, mai-tram-bluetech, quy-bluetech, lam-bluetech,
quan-bluetech, quang-bluetech, minh-bluetech
```

## Work Items

### 1. Determine Live Portal Files
- Check each file for auth pattern, last modified date, and content freshness
- Choose one file per student as the canonical live version
- Mark the other as superseded

### 2. Normalize to One Portal Root
- Move all live portal files to `public/` root
- Delete or archive `public/student/` (or merge into `public/`)
- Delete or archive `public/deactivated/` (or clearly mark each file)

### 3. Update portalMap to Match Student Roster
- Align `portalMap` studentId format with `STUDENTS` array in leaderboard
- Use `{name}-bluetech` as the canonical format for all BlueTech students
- Ensure every student in roster has a portalMap entry

### 4. Fix /health Endpoint
- The worker returns 500 at `https://net-pet-ai.../health`
- Check `src/index.js` for `/health` route handler
- Fix any unhandled errors or missing env vars

### 5. Remove Dead Portal Files
- `public/lam-portal.html` — BB-07 says no portal for Lam without direction
- `public/test-portal.html` — test file, not for production
- `public/sov100-portal.html` — DEV tester, not a student portal

## Files to Modify
- `src/index.js` — update portalMap to match STUDENTS roster
- `src/index.js` — fix /health endpoint
- `public/` — remove/reorganize dead portal files
- `public/student/` — merge or archive
- `public/deactivated/` — archive or remove

## Files to NOT Touch
- `public/employer-portal.html` — PIN-based, works, separate system
- `public/admin.html`, `admin-dashboard.html` — admin tools, not student portals
- `public/portal.css`, `portal-shared.js` — shared infrastructure
- `public/bluetech-login/` and `public/quan-quang-login/` — handled by BLUEPRINT-01

## Verification
1. `node --check src/index.js` passes
2. Every student in roster has a corresponding portalMap entry
3. No duplicate portal files in active `public/` tree
4. `curl https://net-pet-ai.../health` returns 200