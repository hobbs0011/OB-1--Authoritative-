# PheTrail — PhoenixScout Learned
**Scout ID:** SC-20260715-student-portals  
**Timestamp:** 2026-07-15T00:53 ICT  
**Zone:** APPS/NET-PET-AI + CANON/  

## Learnings

1. **run147 login portals are preserved but disconnected**  
   `public/bluetech-login/index.html` and `public/quan-quang-login/index.html` still exist on disk and in git, but are absent from `portalMap` in `src/index.js`. They are not dead code; they are unadvertised entrypoints. Future scout must check both `public/` and `public/*/` trees, not just root-level portal files.

2. **StudentId format drift is a routing risk**  
   `portalMap` mixes `-bluetech`, `-nguyen`, `-private`, and bare-name formats. A single student/family may have multiple canonical IDs across KV keys, portal HTML, and portalMap. Normalization must happen before any unified family login is built.

3. **PIN auth gap: employer-only**  
   `employer-portal.html` has working PIN auth (SHA-256 hashed 4-6 digit PIN). Student portals use password auth via `/api/student/checkpw`. Michael’s stated requirement for student/family PIN login is not implemented. Do not assume PIN exists because run152 death seal claims it.

4. **Death-seal overstatement pattern**  
   `run152-reincarnateDEATH.md` claims “Bluetech parent portal consolidated with PIN sub-access” and “Quan & Quang parent portal consolidated with PIN sub-access”. Source verification shows these claims are unverifiable. Future scouts must cross-check death-seal claims against live source, not treat seals as truth.

5. **Legacy portal root coexistence**  
   `public/student/` contains portal HTML files (`quy-bluetech.html`, `mai-tram.html`, `huong-bluetech.html`, `minh-private.html`) that do not match `portalMap` routes. Both `public/` root and `public/student/` are partially active. This creates routing ambiguity for any unified entrypoint.

6. **Cloudflare liveness probe**  
   `https://net-pet-ai.mrmichaelhobbs123.workers.dev/health` returns HTTP 500. Scout cannot verify live deployment state from repo alone. Always treat worker health as external evidence, not git state.

## Role Upgrades
- Add `public/*/` and `public/student/` to default portal scan glob patterns.
- Add “death-seal claim vs source verification” as a standard DRIFT check.
- Add “mixed studentId format” as a CONFIG lens for portal maps and KV keys.
