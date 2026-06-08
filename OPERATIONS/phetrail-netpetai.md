# PHEROMONE TRAIL — NET-PET-AI Domain

> L77 MID_SESSION_PHETRAIL: Canonical survival record for NET-PET-AI architecture decisions and edge cases.
> Read before any NET-PET-AI work. Update immediately when a trigger fires.

---

## [Run 099/100 — 2026-06-08] VOICE BRAIN LOCK REINFORCED + ACTIVE ROSTER WHITELIST

**Trigger:** ARCHITECTURE CHANGED + SOUL DIRECTIVE SPOKEN + CONTEXT APPROACHING LIMIT

### SOUL DIRECTIVE (verbatim):
> "dont you dare change the deepgram in house models we have guard-railed, you are forbidden from rerouting the models outside deepgram.. reinforce this guardrail"

### Changes made (mid-session, NOT yet deployed):
1. **`src/security.js`** — Added `ACTIVE_STUDENT_ROSTER` Set (quy-bluetech, mai-tram-bluetech, huong-bluetech + test IDs) + `validateActiveStudent()` function exported
2. **`src/index.js`** — Added `assertVoiceBrainLock(settings)` function that throws at RUNTIME if:
   - think.provider ≠ `{ type: "open_ai", model: "gpt-4o-mini" }`
   - think.provider has `endpoint` (= external routing)
   - listen.provider ≠ `{ type: "deepgram", model: "nova-3" }`
   - speak.provider ≠ `{ type: "deepgram", model: "aura-2-zeus-en" }`
   Called immediately before the return in `/api/deepgram-token` — if provider is mutated, the endpoint throws 500, not silently serves the wrong model
3. **`src/index.js`** — Added format validation (`validateStudentId`) + roster check (`validateActiveStudent`) in `/api/deepgram-token` handler. Previously ANY studentId string could mint a Deepgram token — key leak vector. Now only active roster + sov100-* pass.
4. **Import updated:** `validateActiveStudent` added to security.js import in index.js

### STILL PENDING (incomplete — stop before deploy, do fresh session):
- [ ] Add `validateStudentId` + `validateActiveStudent` to `/api/agent/vocab` POST (line ~1174)
- [ ] Add `validateStudentId` to `/api/agent/session` GET and POST (lines ~1201, ~1215)
- [ ] Fix stale student rosters: lines 1896, 2012, 2319 still include lam/quan/quang/minh-bluetech (all inactive). Active roster = quy-bluetech, mai-tram-bluetech, huong-bluetech ONLY
- [ ] Portal XSS: `quy-portal.html` vocab widget uses `innerHTML` with API data — switch `w.word` and `w.meaning_vi` to `escapeHtml()`. Check huong/mai-tram portals for same pattern
- [ ] Art arsenal / visual polish: portals already Gospel 444. Next pass: hero banner image, better stats visualization, SRS streak UI
- [ ] Run `wrangler deploy` to dev (`net-pet-ai-dev`) after all changes, verify voice brain lock test passes, then promote to prod

### VOICE BRAIN LOCK STATUS:
- **Test guard:** `test/voice-brain-lock.test.mjs` — checks static source at build/commit time ✅
- **Pre-commit hook:** `.git/hooks/pre-commit` runs the test ✅
- **Runtime guard:** `assertVoiceBrainLock(settings)` — added this session, throws before token returns ✅ (new)
- **Active roster guard:** `validateActiveStudent()` — prevents unauthorized token minting ✅ (new)

### DEEPGRAM IN-HOUSE ARCHITECTURE (PERMANENT — DO NOT CHANGE):
- STT: `{ type: "deepgram", model: "nova-3" }` — Deepgram's own STT, fastest path
- Think: `{ type: "open_ai", model: "gpt-4o-mini" }` — "open_ai" = Deepgram IN-HOUSE model name, NOT external OpenAI. No endpoint = no external hop.
- TTS: `{ type: "deepgram", model: "aura-2-zeus-en" }` — Deepgram's own TTS

### NEGATIVE TRAIL (what was broken before this run):
- `/api/deepgram-token` had NO student roster check — any string as studentId got a token minted. KV data was fetched for arbitrary IDs. API key was effectively public.
- Voice brain lock was test-time only (no runtime guard) — a runtime mutation of the settings object would silently serve the wrong provider until someone noticed.

---

## MARKETING CORPUS BLUEPRINT (Run 099 — 2026-06-08)

**Trigger:** ARCHITECTURE CHANGED (marketing org), LEDGER SEALED (HL-626)

- `MARKETING/KILO-MARKETING-ORGANIZER-BLUEPRINT-2-3-4.md` — 8 new MASTER/ extraction targets for files _2, _3, _4
- `MARKETING/KILO-MARKETING-READER-BLUEPRINT.md` — Kilo reads files fresh (offset-based chunks), extracts independently
- MARKETING/ folder reorganized: MASTER/ FUNNEL/ SOCIAL/ CANONICAL/ RAW/
- All 7 items from blueprint-1 COMPLETE (Kilo Run 098)
- Items 8-14 PENDING — Kilo needs to run blueprint-2-3-4 extraction sessions
- Priority: active-listening-hooks → operational-playbook → bluetech-classroom-curriculum → messenger-bot-flows-extended → agent99-system-prompt → gospel-444-image-prompts → prais-brand-materials

---

## STUDENT PORTAL STATE (as of Run 098/099)

- Active students: **quy-bluetech, mai-tram-bluetech, huong-bluetech ONLY**
- Minh = NO LONGER CLIENT. Never include in pipelines, portals, audits.
- Lam = NOT active. Resume ONLY if Michael says "start Lam portal."
- Portal URLs: `https://net-pet-ai.mrmichaelhobbs123.workers.dev/{student}-portal.html?studentId={id}`
- Auth: localStorage `portal_auth_{student}` = 'true'. Default pw = bluetech2026.
- All student data in KV as `student_profile_{studentId}`

---
