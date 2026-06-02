# PF-1 WIRE SPEC — Assessment → OBI Taster Handoff

**Run:** 047
**Owner:** Kilo (PA T1 / PCClaw)
**Auditor:** OB1 (grounded in live code 2026-06-02)
**Mission:** Close the single remaining funnel gap — assessment submits but cannot hand off to OBI.
**Parent docs:** OPERATIONS/PROSPECT-FUNNEL-SPEC.md · run046-reincarnateDEATH.md §05 PF-1

---

## 0. TARGET FILE — VERIFY FIRST (do not skip)

**Edit ONLY:** `APPS/NET-PET-AI/public/assets/js/assessment.js`

`net-tiger-assessment.html` loads it via `<script src="assets/js/assessment.js">` — CONFIRMED.
**DO NOT touch** `APPS/NET-PET-AI/public/assessment-assets/js/assessment.js` — that is a DEAD ORPHAN copy, not loaded by any live HTML. Wiring it = wiring nothing (Run 31 class failure).

Before editing, run: `node --check APPS/NET-PET-AI/public/assets/js/assessment.js` (baseline must be clean).

---

## 1. THE GAP (grounded, line-exact)

| Fn | Line | Current behavior | Problem |
|----|------|------------------|---------|
| `downloadResults()` | 353–420 | Builds `data`, computes `hash` (L400), builds `submissionReference` (L402), downloads pack, fire-and-forget `submitAssessmentPayload({...data, submissionReference})` (L419) | Never generates a studentId, never onboards, never redirects |
| `submitAssessmentPayload()` | 422–434 | POST `/api/submit`, swallows errors | Fine — leave its core intact (it feeds Michael's email via SUBMISSION-API) |
| `onSubmissionComplete()` | 436–439 | Redirects to `/magic-chat.html?submissionReference=...` | WRONG params (no `studentId`, no `taster=1`) AND **never called** |

**Backend contract — `handleOnboarding` (src/index.js:3467), route `POST /api/onboarding` (L1098):**
- Requires `body.studentId` (non-empty string) else 400.
- Optional: `fullName`, `englishLevel`/`level`, `currentCity`, `segment`, `source`, `assessmentRef`, `studyGoal`, `notifications`, `vocab`.
- Writes `NET_PET_KV.put('student_profile_<studentId>', ...)`.
- Returns `{ ok:true, studentId, studentToken, redirect:"/magic-chat.html?studentId=<id>&taster=1" }`.
- **The server already builds the correct taster redirect — the client should USE `data.redirect`, not hand-roll it.**

---

## 2. CHANGES (3 edits, same file)

### CHANGE 1 — Add prospect-ID helper
Insert immediately AFTER `safeName()` (currently ends L297). `safeName` keeps diacritics + caps 30 and does NOT lowercase, so it is NOT suitable for a URL/KV id — use this dedicated slug:

```js
function makeProspectId(name, hash) {
  const base = (name || 'prospect')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip Vietnamese diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'prospect';
  return `prospect-${base}-${hash.slice(0, 8)}`;
}
```
- `hash` is the full lowercase hex digest already computed at L400. Deterministic → same submission yields same id (no orphaned KV on re-submit).
- `prospect-` prefix keeps these distinct from real students (`quy-bluetech` etc.) — never collide with a live student id.

### CHANGE 2 — Wire the call site in `downloadResults`
Replace the single fire-and-forget line at **L419**:
```js
  submitAssessmentPayload({ ...data, submissionReference });
```
with:
```js
  const prospectId = makeProspectId(name, hash);
  await submitAssessmentPayload({ ...data, submissionReference, studentId: prospectId });
  await onSubmissionComplete({ studentId: prospectId, fullName: name, submissionReference });
```
`downloadResults` is already `async`; `submitAssessmentPayload` already catches its own errors (won't throw), so awaiting is safe. Both POSTs fire: `/api/submit` (Michael's email) AND `/api/onboarding` (OBI handoff, drives redirect).

### CHANGE 3 — Rewrite `onSubmissionComplete` (replace L436–439 entirely)
```js
async function onSubmissionComplete({ studentId, fullName, submissionReference }) {
  const endpoint = (typeof window !== 'undefined' && location.origin)
    ? `${location.origin}/api/onboarding` : '/api/onboarding';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        fullName,
        assessmentRef: submissionReference,
        source: 'assessment',
        segment: 'prospect'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.redirect) { location.href = data.redirect; return; }
    }
  } catch (error) {
    console.error('[assessment] onboarding handoff failed', error);
  }
  // Fallback: prospect still reaches OBI even if onboarding POST failed (degraded: no KV profile, no name greet)
  const params = new URLSearchParams({ studentId, taster: '1' });
  location.href = `/magic-chat.html?${params.toString()}`;
}
```

---

## 3. EDGE CASES (must hold)

- **EC-1 onboarding fails** → fallback redirect with locally-generated `studentId` + `taster=1`. Prospect never stranded.
- **EC-2 no double-redirect** → success path `return`s before fallback.
- **EC-3 dual-POST independence** → `/api/submit` (email) keeps firing even if onboarding fails; onboarding owns the redirect.
- **EC-4 determinism** → same `data` → same `hash` → same `studentId` → idempotent KV write.
- **EC-5 do NOT invent form fields** → there is no city input in the assessment form; `currentCity` stays unset (backend defaults to "").

---

## 4. GATES (in order)

1. `node --check APPS/NET-PET-AI/public/assets/js/assessment.js` → must print nothing / exit 0.
2. Grep-confirm: `onSubmissionComplete` is now `async`, called once from `downloadResults`, and POSTs `/api/onboarding`.
3. Report back: exact diff applied + syntax result. **Do NOT deploy.** DEV deploy + browser test is Michael's gate (PF-5).

---

## 5. OUT OF SCOPE (do not do)

- No prod deploy. No DEV deploy (Michael runs `npx wrangler deploy --config wrangler.dev.toml`).
- Do not touch `handleOnboarding` (backend already correct).
- Do not wire BUG-3 legacy routes (`/student/resolve`, `/student/create`) — separate item (run046 A5).
- Do not edit the dead `assessment-assets/` copy.

---

**DELIVERABLE:** modified `public/assets/js/assessment.js` (3 edits) + clean `node --check` + diff report. That closes PF-1 and makes the funnel end-to-end testable on DEV.
