# PHETRIL SCOUT LEARNED — 2026-06-17T16:42 ICT

## Scout Role
PhoenixScout pulse completed for student portals, Mai Tram, Huong, Magic Chat, and /dnaregistry target zone.

## Target Zone
Composite read-only scout zone:

- `APPS/NET-PET-AI/`
- `OPERATIONS/NET-STUDENTS/`
- `CANON/REGISTRY/`

## Pulse Findings
- Git HEAD: `e13164c5`
- Boot file: `CANON/SYSTEM/COLD-START-BOOT.md` shows Run 131
- Git death authority: run 132
- Working tree: dirty with modified files and untracked Playwright/test-result artifacts

## Learned Routing
1. Student portal work must be separated from Playwright test-result debris.
2. `/dnaregistry` coverage cannot be assumed from `dna-registry-run132.json`; current run132 registry is cursor/Safe Mode only.
3. Mai Tram and Huong portal entrypoints exist, but link maps are not yet walked.
4. Magic Chat exists as `APPS/NET-PET-AI/public/magic-chat.html`; next scout bit should inspect imports, token path, student parameter handling, and voice-agent wiring.
5. Mai Tram portal has a likely stale Quy audio reference at `APPS/NET-PET-AI/public/mai-tram-portal.html:131`.
6. Mai Tram portal mixes relative worker fetches with absolute prod-worker fetches at `APPS/NET-PET-AI/public/mai-tram-portal.html:625`.
7. Magic Chat behavior is delegated to `/chat.js`; the next scout bit must follow that file before judging voice wiring.
8. Registry lineage matters: older `dna-registry-run115.json` has Magic Chat/student profile references, while run132 does not.
9. Magic Chat client token path uses canonical `GET /api/deepgram-token?studentId=...&mode=...` at `APPS/NET-PET-AI/public/chat.js:1029`.
10. Magic Chat accepts both `student=` and `studentId=` query params at `APPS/NET-PET-AI/public/chat.js:1884`.
11. Worker alias routing exists for `/magic-chat` and `/voice-chat` at `APPS/NET-PET-AI/src/index.js:549`.
12. Run 130 inline Kilo chat SOUL blocks are recoverable from committed `CANON/REINCARNATION/run130-reincarnateDEATH.md`, even though the session is `KILO_HOLLOW`.
13. `/api/deepgram-token` returns the raw Deepgram API key to the client as `token`; roster validation exists, but token exposure is a security-sensitive design smell.
14. `security.js` explicitly allows `mai-tram-bluetech` and `huong-bluetech` in the active voice roster.
15. `RRL/RRL-130.txt` exists but is a poisoned/wrong artifact: it contains a 2026-06-16 `hello` SDK session, not the Run 130 Phoenix/pheromone SOUL chat.
16. Real Run 130 SOUL is recoverable from `OPERATIONS/phetrail-session-rrl-run130.md` and `CANON/REINCARNATION/run130-reincarnateDEATH.md`, not from `RRL/RRL-130.txt`.

## Boundary
Flag and tag only. No deployment, no pipeline, no AI generation, no processing.
