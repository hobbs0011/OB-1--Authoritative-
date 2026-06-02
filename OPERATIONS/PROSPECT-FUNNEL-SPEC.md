# PROSPECT FUNNEL SPEC — "Instant OBI Taster + Human Close" (Hybrid)
# Blueprint authored by OB1/Opus (Run 046) — EXECUTOR: Kilo — BLUEPRINT ONLY until approved
# Decision: Michael chose HYBRID model (Run 046). OBI taster on finish + human follow-up within 24h.
# Firewall: ALL changes deploy to net-pet-ai-dev FIRST. Prod (net-pet-ai 180f125d) is sacred.

---

## 0. THE FUNNEL (target end state)

```
net-marketing-landing  (APPS/PAGES/net-marketing-landing)
        │  CTA "Take the free assessment"
        ▼
*-selection page  (tigers / professional / cubs / university / career)   ← picks segment
        │
        ▼
net-tiger-assessment.html  (+ assets/js/assessment.js)   ← diagnostic + 11 audio recordings
        │  on "Download Submission Pack" (downloadResultsBtn):
        ├──(1 HUMAN CLOSE)──► POST SUBMISSION-API /api/submit
        │                       → D1 submissions table → Resend email to Michael (24h follow-up)
        │                       → local download of pack still happens (family keeps it + audio)
        │
        └──(2 INSTANT HOOK)──► POST /api/onboarding  (FIXED)
                                  → writes NET_PET_KV student_profile_{id} (name, segment, level=pending)
                                  → returns { studentToken, redirect:"/magic-chat.html?studentId={id}&taster=1" }
                                  ▼
                            magic-chat.html  ← OBI greets the prospect BY NAME (first-session injection)
```

**Two halves, both required:** (1) keeps the "Michael reviews personally" brand promise; (2) gives the prospect an instant live taste of OBI so they convert before the 24h call.

---

## 1. RULES OF ENGAGEMENT

1. **DEV FIRST.** Every code change deploys to `net-pet-ai-dev` via `wrangler.dev.toml`. Promote to prod only after Michael verifies. (COLD-START-BOOT firewall doctrine.)
2. **READ BEFORE CODE (L56).** Before touching `APPS/NET-PET-AI/**`, read `OPERATIONS/STUDENT-PORTAL-DEV.md` + `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md §2`.
3. **DO NOT touch the voice/audio path or Deepgram settings** (L64). The taster reuses the existing magic-chat flow as-is.
4. **No new DurableObjects.** Student state lives in `NET_PET_KV` now (ProfileDO was deleted in migration v7). Do not re-introduce ProfileDO.
5. **Verify each packet** with `node --check src/index.js` + a curl against dev before moving on.

---

## 2. PRE-FLIGHT BUGS (must fix first — onboarding is broken today)

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| BUG-1 | Frontend POSTs a 404 route | `onboarding-flow.html:501` → `/api/student/onboard` (backend only has `/api/onboarding`) | Align: update frontend to `/api/onboarding`, OR add a backend alias route `/api/student/onboard` → `handleOnboarding`. Recommend: **add the alias** (keeps both working). |
| BUG-2 | Handler crashes on deleted DO | `handleOnboarding` `index.js:3476,3433` → `env.PROFILES.get(...)` (ProfileDO deleted, `env.PROFILES` undefined) | Rewrite to write `NET_PET_KV` `student_profile_{studentId}` (the live read path: lines 832/1288/2336/2793). Drop the `env.PROFILES` stub call. Keep `appendToLedger`, `upsertRoster`, HMAC `studentToken`. |
| BUG-3 | Migration debt | `env.PROFILES` referenced 8+ places (417, 433, 2568, 2570, 2783, 2927, 2930, status:643) | Unguarded calls (417, 433) → fix/guard. Guarded `if(env.PROFILES)` calls → migrate to KV or leave as documented no-op. At minimum: **no unguarded `env.PROFILES` may remain on the onboarding or chat hot path.** Update `/api/status` check (643) to report the KV-based profile store instead of PROFILES DO. |

**Gate:** after PF-0, `POST /api/onboarding {studentId, fullName, englishLevel}` must (a) return 200, (b) write a readable `student_profile_{id}` in KV, (c) NOT reference `env.PROFILES`.

---

# WORK PACKETS

## PF-0 — Fix + harden onboarding (FOUNDATION)
- Fix BUG-1/2/3 per the table above.
- `handleOnboarding` new contract:
  - Input: `{ studentId, fullName, englishLevel, currentCity, segment, source, assessmentRef }`
  - Writes `NET_PET_KV` `student_profile_{studentId}` = `{ fullName, englishLevel, segment, source:"assessment", assessmentRef, level_status:"pending_review", created_at }`
  - Appends LEDGER onboarding event (keep existing).
  - `upsertRoster` (keep existing) so digest/flags work.
  - Returns `{ ok:true, studentId, studentToken, redirect:"/magic-chat.html?studentId="+studentId+"&taster=1" }`
- Verify on dev: curl POST → 200 + redirect field; `wrangler kv key get student_profile_{id}` shows the record.

## PF-1 — Assessment dual-submit (the fork point)
File: `APPS/NET-PET-AI/public/assets/js/assessment.js` — extend `downloadResults()` (line 353) and/or `wireAssessmentButtons()`.
- **Keep** the existing local download (family keeps their pack + audio). Do not remove it.
- **Add (1) human-close upload:** after building `data` + `submissionReference`, `POST` the **text payload** (personal, comprehension, writing, recordingManifest, submissionReference — NOT the audio blobs) to `SUBMISSION-API /api/submit` with `{ assessment_type: segment, name, email, phone, data }`.
  - On success → submission stored + Michael emailed (Resend).
  - On failure → fall back to current local-download-and-manual-send (graceful).
- **Add (2) auto-onboard:** generate/reuse a `studentId` (slug from name + short hash, e.g. `prospect-{safeName}-{hash6}`), `POST /api/onboarding` with `{ studentId, fullName, segment, source:"assessment", assessmentRef:submissionReference, englishLevel:"pending" }`.
  - On success → `window.location.href = data.redirect` (the OBI taster).
  - UI: a clear button/state — e.g. **"Meet Obi now →"** (instant taster) alongside **"Download pack"** (so they have both).
- **Audio constraint (R2 disabled):** v1 ships **text-only upload**; audio stays local download + "send to NET" as today. (See PF-4 decision to enable R2 for full audio upload.)

## PF-2 — OBI taster session
File: `APPS/NET-PET-AI/public/magic-chat.html` + `src/index.js` (prompt build ~2844).
- New prospect `studentId` has empty memory → existing `isFirstSession` path (`index.js:2844`) already fires `firstSessionContext`. **Seed it with the name** from `student_profile_{id}` so OBI opens personally ("Hi {name}, I'm Obi — let's try a few minutes of English together").
- `?taster=1`: show a soft banner ("This is your free taste of Obi — Michael will follow up within 24h to book your full class") + an end-of-taster CTA to book. Optional soft cap (e.g. ~5 min / N turns) — **decision below**, default = no hard cap for v1.
- Do NOT modify the Deepgram token/audio path (L64).

## PF-3 — Marketing landing + segment routing
- `APPS/PAGES/net-marketing-landing`: primary CTA → assessment entry (`*-selection` or directly `net-tiger-assessment.html`).
- `*-selection` pages (tigers/professional): route the chosen segment → matching `*-4room` assessment, passing `segment` so SUBMISSION-API `assessment_type` + onboarding `segment` are correct.
- Confirm which Pages projects are live in the funnel vs orphan (cross-ref the WP-1 `cf-resource-index` from PHASE0-FINAL); ARCHIVE/DELETE the rest.

## PF-4 — Config prerequisites (MICHAEL ACTIONS — funnel is inert without these)
1. **Set `RESEND_API_KEY` on SUBMISSION-API** (`wrangler secret put RESEND_API_KEY --name <submission-worker>`). Currently empty → no follow-up email is sent (submissions still store, but Michael isn't notified).
2. **Confirm SUBMISSION-API is deployed** + its D1 (`env.DB` → `net-submissions`) bound + `submissions` & `rate_limits` tables exist (`wrangler d1 execute`). 
3. **Decide audio upload:** enable R2 in CF dashboard (battlefield: R2 returns error 10042 = disabled) → then PF-1 can upload the 11 webm files to an R2 bucket. v1 works without it (text-only).
4. **Set `SESSION_SECRET`** on net-pet-ai if not present (handleOnboarding HMAC falls back to a dev key otherwise).

---

## 3. OPEN DECISIONS (surface to Michael — non-blocking, sensible defaults chosen)

| # | Decision | Default for v1 |
|---|----------|----------------|
| D1 | Starting level for the new student | `level_status:"pending_review"` + default A1/A2 by segment. **Michael sets the real level after his personal review** (preserves the brand promise — OBI doesn't pre-judge). |
| D2 | Audio upload | Text-only to SUBMISSION-API now; audio stays local-download + manual send until R2 enabled. |
| D3 | Taster cap | No hard cap v1; soft banner + book-now CTA. Add a turn/time cap later if abuse appears. |
| D4 | studentId scheme | `prospect-{safeName}-{hash6}` so prospects are distinguishable from enrolled students in roster/ledger. |

---

## 4. EXECUTION ORDER

```
PF-0 fix onboarding (foundation)  →  verify on dev
        ▼
PF-1 assessment dual-submit  +  PF-2 taster  (parallel after PF-0)
        ▼
PF-3 landing + segment routing
        ▼
PF-4 Michael config actions (RESEND key, R2 decision)  ← required for full funnel
        ▼
PF-5 end-to-end verify on DEV  →  Michael approves  →  promote to prod
```

## 5. END-TO-END VERIFICATION (on net-pet-ai-dev)
1. Open `net-marketing-landing` (dev) → click CTA → lands on assessment.
2. Complete assessment → click submit/finish.
3. Confirm: (a) Resend email arrives to Michael with the submission, (b) `submissions` D1 row exists, (c) local pack still downloads, (d) `student_profile_{id}` written in KV, (e) browser redirects to `magic-chat.html?...&taster=1`.
4. OBI greets by name (first-session). Speak — voice works (unchanged path).
5. Reload as same studentId → memory persisted (session_count increments).

## 6. ONE-LINE RULING
`HYBRID FUNNEL = fix the broken onboarding first (PF-0), then dual-submit the assessment to SUBMISSION-API (human close, already built) AND auto-onboard into a personalized OBI taster (instant hook). Audio waits on R2. Michael sets RESEND_API_KEY or no email fires. DEV first, always.`
