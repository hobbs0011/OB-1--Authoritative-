# Run 105 — DEEP AUDIT ADDENDUM (verified against live source, post-blueprint)
# Augments .kilo/command/run105-pipeline.md. Does NOT replace it.
# Produced by OB-1 (Opus, read-only) while Kilo executes the P10 erasure fixes.
# Verified at HEAD a8671036, 2026-06-09. Every claim below has a file:line receipt.
#
# WHY THIS EXISTS: the run105 blueprint's GROUND TRUTH layer caught the obvious staleness,
# but a second deep pass found four classes of gap the first pass missed. Three of them
# (routing, F1-B proof, portal exposure) change what "demo-ready" means. Read before TASK 2.

---

## ⚠️ SECTION 1 — THE BLUEPRINT CONTRADICTS ITSELF (fix in the run105 deliverable)

The GROUND TRUTH layer is correct; the HEADER/CONTEXT above it was never updated to match.
These are errors in the Run 105 deliverable itself, so they ARE Run 105 scope.

| Line(s) | Says | Truth (receipt) | Fix |
|---|---|---|---|
| `:8`, `:41`, `:403` (TASK 2 title) | "**13** static lock tests" | GROUND TRUTH §B `:90` = **15** (6 existing + 7 new + migration-safety + data-contract) | s/13/15/ everywhere in header + TASK 2 title |
| `:27` | "voice brain lock (**1 test**). Everything else: ZERO coverage" | **6** lock tests on disk, all GREEN (§A `:84`) | Rewrite: "6 static locks exist; 9 more to build → 15." |
| `:65` | Active students = **4** (omits `keep-warm-ping`) | Roster Set = **5** incl `keep-warm-ping` (`security.js:159-166`) | Add keep-warm-ping to the inventory line |
| `:516` (TASK 2 A3 spec) | "roster is exactly **4** IDs" | On-disk `student-roster.test.mjs` uses **5** | The embedded spec is stale; the real test is right — say 5 |
| `:8`, `:44`, `:288` (TASK 1) | F1-B is OPEN ("close remaining 4/51") | **F1-B CLOSED on prod 0/52** at commits `7bf8dd8f`, `b9d6192c` BEFORE the blueprint commit | TASK 1 → VERIFY-ONLY (re-run preflight-load, confirm still 0/52) + read SECTION 3 |

---

## 🔴 SECTION 2 — ROUTING BLIND SPOT: THE LOCK TESTS READ THE WRONG FILE

`wrangler.toml:2` → `main = "src/router.js"`. **router.js is the real entry, NOT index.js.**
router.js (Hono, 189 lines) handles some routes itself and falls through to index.js for the rest
via `app.all('*') → legacyWorker.fetch` (`router.js:178-179`).

**Routes that live in router.js and NEVER reach index.js:**
| Route | router.js line | Handled by |
|---|---|---|
| `DELETE /api/student/:id/erase` | `:141-148` | `handleStudentErase` direct |
| `GET /api/v1/health` | `:152` | Hono (cached) |
| `GET /api/v1/version` | `:158` | Hono (hardcoded `score: 97`) |
| `GET /api/v1/metrics` | `:166` | Hono → `error_log` D1 |
| `GET /api/lead` | `:174` | Hono → 405 |

**Security/CORS that lives ONLY in router.js:**
- Security headers (X-Frame-Options, HSTS, Permissions-Policy) — `:14-27`
- CSRF origin guard + `TRUSTED_ORIGINS` set — `:29-45`
- Request-size limit (65 KB → 413) — `:49-55`
- Per-student quota on `/api/deepgram-token` + `/api/chat` — `:81-109`
- Clerk session soft-enforcement — `:133-137`

**CONSEQUENCE for TASK 2 — two lock tests target the wrong file and will be vacuous or wrong:**

1. **`route-completeness.test.mjs`** — if it reads only `index.js`, it MISSES all 5 router-native
   routes above. It must read **both** `router.js` and `index.js` and assert the union. Critical
   routes to pin: `/api/deepgram-token`, `/api/chat`, `/api/student/:id/erase`, `/api/v1/health`,
   `/api/v1/metrics`.

2. **`cors-auth-lock.test.mjs`** — CORS, CSRF, security headers, and `TRUSTED_ORIGINS` are ALL in
   `router.js`. A test reading `index.js` finds nothing → false PASS (vacuous green = worse than no
   test). This test MUST read `router.js`. Assert: `TRUSTED_ORIGINS` contains exactly the 3 known
   origins, CSRF middleware exists on `/api/*`, security-headers middleware exists.

**Undocumented 3rd trusted origin:** `https://tigers-4room.pages.dev` (`router.js:33`). The blueprint
stack inventory (`:54-55`) lists only the prod+dev workers. There is a Cloudflare Pages deployment in
the trust boundary that nothing in the blueprint accounts for. Document it or the cors-auth lock will
flag a "rogue" origin that is actually legitimate.

---

## 🔴 SECTION 3 — F1-B's "0/52" PROOF DOES NOT COVER THE REAL-STUDENT HOT PATH

`preflight-load.mjs:20` → `?studentId=sov100-test-magic`.
`router.js:83` → `if (studentId && !studentId.startsWith('sov100-'))` runs `checkQuota`.

**`sov100-test-magic` SKIPS the quota gate. Real students do not.**

So the F1-B load test never exercises the two KV ops that fire on EVERY real-student token request:
- `RATELIMIT.get(key)` — `quota.js:13`
- `RATELIMIT.put(key, …, {expirationTtl:7200})` — `quota.js:21` ← a **KV WRITE on the hot path**

This matters three ways:
1. The real-student path is strictly heavier than the path proven at 0/52. The proof is real but
   incomplete — it green-lit a lighter route than the one investors will watch quy/mai-tram/huong use.
2. A KV **write** per token request is exactly the hot-path-write shape that caused the Run 103-104
   circuit-isolation 500s. Different key, same failure class. Under burst, `RATELIMIT.put` is a suspect.
3. This reframes the `F1B-EC-1` diagnosis (`:151`): the residual under load is NOT only cold-isolate
   spin-up — the quota KV round-trip is a second, real-student-only suspect the cold test can't see.

**ADD TO TASK 1 (verify-only) + TASK 3 (perf):** run a load pass against a NON-sov100 id that DOES
traverse quota. Use `keep-warm-ping` (roster member, not a real person, not `sov100-`) so it exercises
`checkQuota` without touching a student's quota. Receipt required: `keep-warm-ping` load pass also
0/N non-2xx, p95 within budget WITH the quota KV round-trip included. Until that receipt exists,
"F1-B closed" means "closed for sov100 traffic only."

---

## 🔴 SECTION 4 — OFFBOARDED STUDENT DATA IS PUBLICLY SERVED (GDPR + demo hygiene)

`public/` still serves full portals + transcripts + profiles for people who are NOT clients:
- **lam-*** (`lam-portal.html`, 26 KB) — Lam is not active
- **minh-*** (`minh-parent-portal.html` 54 KB, minh-profile/methodology/transcripts/action-plan) — Minh removed 2026-06-07
- **quan-*** (`quan-portal.html` 52 KB + profile/transcripts/career) — offboarded
- **quang-*** (`quang-portal.html` 54 KB + profile/transcripts/career) — offboarded

These are static HTML at public URLs (`net-pet-ai.../quan-transcripts.html` etc.) containing personal
data. **The P10 erasure refactor Kilo is fixing purges KV/D1/DO but does NOT touch these files** — an
"erased" student's transcripts remain fetchable. Two-fold gap:
- **GDPR:** erasure that leaves PII at a public URL is not erasure.
- **Demo:** an investor (or a journalist) opening a portal URL can enumerate offboarded students.

**This is the job of the planned `deactivated-portals.test.mjs` (TASK 2) — but widen its mandate:**
it must not only assert active portals are intact; it must assert offboarded portals are **gone or
gated** (404 / auth-walled), not silently public. Decide policy first: delete the files, or move
behind `checkAdminKey`. Either way, the erasure pipeline (Kilo's P10 work) should also delete the
matching `public/{id}-*.html` set, or erasure is incomplete by design.

---

## 🟠 SECTION 5 — P10 ERASURE DEFECTS (Kilo's current task — cross-ref, do not duplicate)

Already handed to Kilo. Recorded here so the death seal can confirm each is closed:
- **A** — DO `/purge` endpoints don't exist (`durable_objects.js` has no `/purge`) → DO purge is a
  silent no-op. Fix: implement `POST /purge` in PetDO, MemoryDO, LedgerDO.
- **B** — `deletion.js` KV guard `if (key.includes(':') && !key.includes(studentId+':')) continue;`
  skips `lang:`, `goals:`, `subscription:`, `streak:`, `chat_memory:` → those survive erasure.
- **C** — `audit_log` schema rename under `CREATE TABLE IF NOT EXISTS` → INSERT fails silently if the
  prod table predates the rename. Needs a real migration, not IF NOT EXISTS. Note: `schema.js` and
  `security.js` disagreed on the table shape even before this change.
- **D** — duplicate `encryptField`/`decryptField` now in BOTH `encryption.js` (hex key) and
  `deletion.js` (UTF-8 key) — incompatible, won't roundtrip if imports cross. Delete the deletion.js
  copies; import from `encryption.js`.

---

## ✅ CORRECTED LOCK-TEST TARGET MAP (use this for TASK 2, supersedes any "read index.js" default)

| Test | Read these files | Why |
|---|---|---|
| voice-brain-lock | index.js | settings block lives in legacy handler ✓ |
| api-contract | index.js | settings block ✓ |
| speak-listen-lock | index.js | settings block ✓ |
| circuit-isolation | index.js | token handler is in legacy fallback ✓ |
| cache-key-format | index.js | prompt_cache key in legacy handler ✓ |
| student-roster | index.js + **security.js** | roster Set is in security.js ✓ |
| **route-completeness** | **router.js + index.js** | 5 routes are router-native (SECTION 2) |
| **cors-auth-lock** | **router.js** | CORS/CSRF/headers/origins are ALL in router.js (SECTION 2) |
| **security-scan** | repo-wide | secret regex over tracked files |
| **wrangler-integrity** | wrangler.toml | bindings/migrations |
| **migration-safety** | wrangler.toml + durable_objects.js | DO class ↔ binding ↔ migration parity |
| **data-contract** | memory-brain.js + index.js | memory/SRS/Tiger field names |
| **portal-integrity** | public/{quy,mai-tram,huong}-portal.html | active portals not truncated |
| **deactivated-portals** | public/ (lam/minh/quan/quang) | offboarded portals 404/gated (SECTION 4) |
| **extension-integrity** | chrome-extension/manifest.json + icons/ | manifest valid, icons present |

---

## SEQUENCING VERDICT (for the death seal)

1. Kilo finishes P10 erasure fixes (A–D) on its own branch/run — NOT folded into Run 105.
2. Run 105 deliverable gets the SECTION 1 header fixes (its own scope) → one clean commit.
3. SECTION 2/3/4 fold into TASK 1/2/3 specs of the run105 blueprint for the NEXT execution pass.
4. Run 105 dies on a CLEAN tree. The P10 work and the deferred SECTION 2-4 items become Run 106 scope.

The demo is safe to run as-is (none of SECTION 2-4 is on the investor click-path), BUT:
- "F1-B closed" should be stated as "closed for sov100 traffic; real-student quota path unproven" (§3)
- offboarded portals should be pulled or gated before any external eyes (§4)
- the P10 erasure path must NOT ship to prod until A–D are fixed — a deletion that doesn't delete is
  a worse liability than the old one (§5)
