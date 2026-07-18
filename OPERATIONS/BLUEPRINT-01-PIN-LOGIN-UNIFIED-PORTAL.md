# BLUEPRINT-01: PIN Login + Unified Portal Entry

## Objective
Consolidate student portals under family/business accounts with PIN-based login. One entry point per family/company, not one per student.

## Active Students & Groups

| Group | Students | Current Portal Files | Auth |
|-------|----------|---------------------|------|
| BlueTech (staff) | mai-tram-bluetech, huong-bluetech | bluetech-portal.html, student/huong-bluetech.html, student/mai-tram.html | password |
| Quan & Quang Family | quan-bluetech, quang-bluetech | quan-portal.html, quang-portal.html | password |
| Quy (BlueTech) | quy-bluetech | quy-portal.html, student/quy-bluetech.html | password |
| Lam (BlueTech) | lam-bluetech | lam-portal.html | password |
| Minh | minh-bluetech | student/minh-private.html, deactivated/minh-parent-portal.html | password |
| Employer Portal | admin | employer-portal.html | PIN (works) |

## Existing Assets

- `public/bluetech-login/index.html` — single-page BlueTech family portal (run147, disconnected from routing)
- `public/quan-quang-login/index.html` — single-page Quan & Quang family portal (run147, disconnected from routing)
- `employer-portal.html` — PIN login pattern (SHA-256 hashed 4-6 digit PIN, working)
- `src/index.js:351-385` — `/api/employer/create` with PIN hash logic
- `src/index.js:1890-1918` — `/api/student/checkpw` and `/api/student/setpw` (password, not PIN)
- `src/index.js:4455-4466` — `portalMap` with mixed studentId formats

## Work Items

### 1. Student PIN Auth Endpoint
- Add `/api/student/checkpin` — accepts `{studentId, pin, groupCode}` 
- SHA-256 hash the PIN (same pattern as employer)
- Validate PIN against KV. If group PIN, allow all students in that group
- Store: `student_pin_{studentId}` or `group_pin_{groupCode}` in NET_PET_KV

### 2. Unified Family Portal Entry
- Build `/public/pin-portal.html` — single entry page
- User enters: Group Code (e.g. BLUETECH, QUANQUANG) + PIN
- On success, redirect to student-specific dashboard or group roster view
- Default PINs: BLUETECH2026, QUANQUANG2026

### 3. Reconnect Login Portals
- Add portalMap entries for `/bluetech-login/` and `/quan-quang-login/`
- Ensure these use PIN auth backed by KV
- Wire the login endpoint to `/api/student/checkpin`

### 4. Normalize StudentId Formats
- Chosen convention: `{name}-{group}` (e.g. `huong-bluetech`, `quan-bluetech`)
- Update portalMap in `src/index.js:4455`
- Update KV keys: `student_pin_{id}`, `student_profile_{id}`, `streak:{id}`
- Update portal HTML files to use canonical IDs

### 5. Clean Duplicate Portal Files
- `public/quang-portal.html` vs `public/deactivated/quang-portal.html` — decide which is live
- `public/student/` vs `public/` — consolidate to one root
- Remove or rename superseded files

## Files to Modify
- `src/index.js` — add `/api/student/checkpin`, update portalMap, add PIN routes
- `public/employer-portal.html` — reference pattern for PIN gate
- `public/bluetech-login/index.html` — upgrade to PIN auth
- `public/quan-quang-login/index.html` — upgrade to PIN auth
- `public/pin-portal.html` — NEW unified entry page
- `wrangler.toml` — verify NET_PET_KV binding exists

## Verification
1. `curl https://net-pet-ai.../api/student/checkpin -d '{"groupCode":"BLUETECH","pin":"BLUETECH2026"}'` returns 200
2. `/pin-portal.html` renders and accepts group code + PIN
3. `/bluetech-login/` and `/quan-quang-login/` work with PIN auth
4. Deploy with `npx wrangler deploy`