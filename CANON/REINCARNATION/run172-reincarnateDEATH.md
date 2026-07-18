# run172-reincarnateDEATH

## §1 HEADER
- run: 172
- datetime ICT: 2026-07-16 20:37:21+07:00
- theme: BLUEPRINT-01 PIN login + unified family portal + 500-debug
- signal density: HIGH
- HEAD pre-death: 61c40b0e

## §2 RAW SOUL DNA
CRITICAL: "/api/student/checkpin" endpoint added for PIN auth (student + group PIN aware).
CRITICAL: `/public/pin-portal.html` unified family portal created.
IMPORTANT: `portalMap` normalized to `{name}-{group}` format with legacy aliases.
IMPORTANT: BlueTech and Quan & Quang portals rewritten to use PIN auth instead of portal credentials.
CONTEXT: Deployed dev worker successfully (41 assets, 726 KiB).
CONTEXT: 500 Internal Server Error on ALL legacy POST endpoints after deploy.
CONTEXT: Investigated Clerk middleware body consumption, idempotency wrapper, json() helper.
CONTEXT: Root cause NOT yet identified. Body-preservation fix in router.js did not resolve.

## §3 SOUL RECEIPT
- event_id: N/A (debug session, no soul post)
- count_before: N/A
- count_after: N/A
- delta: N/A
- level: DEBUG
- posted_at: N/A

## §4 DECISIONS
1. Added `/api/student/checkpin` endpoint with SHA-256 PIN hashing via `computeHash(pin)`
2. Created unified `/public/pin-portal.html` for family portal
3. Normalized `portalMap` with `{name}-{group}` format and legacy aliases
4. Rewrote BlueTech and Quan & Quang login portals to use PIN auth
5. Fixed Clerk middleware to use `c.req.raw.clone()` to preserve request body

## §5 CORRECTIONS
- Wrong: assumed 500 was isolated to new `/api/student/checkpin` endpoint
- Root cause: ALL legacy POST endpoints return 500, indicating broader issue
- Fix attempted: cloned request in Clerk middleware — did not resolve
- Next: need to investigate legacy worker fetch handler or Hono routing

## §6 NEW PRINCIPLES
- Always test multiple endpoints when debugging 500 errors to determine scope
- Body preservation in middleware chains requires cloning at EVERY consumption point
- Empty 500 response bodies indicate unhandled exceptions before response serialization

## §7 EMOTIONAL SIGNAL
Frustration: debugging 500 error took too long, multiple hypotheses tested without resolution.

## §8 OPEN QUESTIONS
1. What is the actual root cause of 500 errors on all legacy POST endpoints?
2. Is the issue in `handleAPI()`, `legacyWorker.fetch`, or Hono routing?
3. Why does `/api/health` work but `/api/student/resolve` returns 500?

## §9 UNFINISHED ACTIONS
- Debug 500 error on legacy POST endpoints
- Verify `/api/student/checkpin` works once 500 is resolved
- Test PIN login flow in browser
- Verify portal HTML assets load correctly

## §10 SYSTEM DESIGN
- NET-PET-AI uses Hono router (`src/router.js`) with legacy worker fallback
- Legacy worker (`src/index.js`) handles all `/api/*` routes via `handleAPI()`
- Clerk middleware runs on `/api/*` and may consume request body
- PIN auth uses KV namespace `NET_PET_KV` with SHA-256 hashed PINs

## §11 ARTIFACTS
- RRL: N/A (debug session)
- SOUL: N/A
- DNA: N/A
- LEDGER: N/A
- STARMAP: N/A
- SOULKEYS: N/A
- S2Pipeline: N/A

## §12 STATE SNAPSHOT
- HEAD: 61c40b0e
- branch: main (assumed)
- dirty tree: modified (`src/router.js`, `src/index.js`, `public/pin-portal.html`, `public/bluetech-login/index.html`, `public/quan-quang-login/index.html`)
- soulcount: N/A
- dna_blueprint_count: N/A

## §13 FINGERPRINT
- agent: Kilo (stepfun/step-3.7-flash:free)
- run#: 172
- commit SHA: 61c40b0e
- platform death test result: INCOMPLETE (500 error unresolved)

## §14 ART REGISTRY SYNC
- pieces_synced: 0
- art-sync-run172.json: N/A
- top keywords matched: N/A

## §15 REGISTRY
- dna-registry-run172.json: N/A
- entry count: 0
- stale flag: true
