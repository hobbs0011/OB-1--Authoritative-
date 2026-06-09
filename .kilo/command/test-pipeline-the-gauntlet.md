# TEST PIPELINE BLUEPRINT — "THE GAUNTLET"
# OB-1 blueprint (Opus, inline). Kilo builds + runs + pastes receipts. OB-1 never self-certifies.
# Goal: test the app every which way, gated fast→slow / static→live, fail-fast, receipt per stage.
# Grounded in the real stack: Hono router.js → index.js (154 routes) + KV/D1/DO + voice WS + portals + extension.

## DESIGN LAW (Foundation Law applied)
Tests run in DEPTH ORDER: cheapest + most deterministic first, most expensive + flakiest last. A red at
any stage HALTS the march (Rome rear guard). Nothing promotes to prod until every gate below it is green.
The pre-commit hook owns the fast deterministic stages; the deploy script owns the live ones.

---

## PART A — THE 7-STAGE GAUNTLET

### STAGE 0 — STATIC TRUTH (instant, no network) · runs on EVERY commit
- `node --check src/index.js src/router.js src/*.js` — syntax gate. (Would have caught tonight's paren bug.)
- `npm run test:lock` — the 15 static invariant locks (voice brain, api-contract, circuit-isolation,
  roster, cache-key, speak-listen, + the 9 from Run 105/audit-addendum). Routing-aware: cors-auth→router.js.
- **secret scan (gitleaks — POWER-UP #4)** over the staged diff.
- PASS: all exit 0. This is the pre-commit hook. A red here physically blocks the commit.

### STAGE 1 — BEHAVIORAL (workerd, no prod) · pre-commit + pre-deploy · POWER-UP #1
Real runtime, real bindings, zero network. `@cloudflare/vitest-pool-workers` + Miniflare boot the worker
in workerd with seeded KV/D1/DO fixtures; Deepgram WS mocked (POWER-UP #5).
- token path: all 3 modes (`free`/`study`/`phonics`) → 200, voice-locked settings, ws_url, phonicsHint.
- bad mode → 400; quota path (real student) → 429 after N; erase → keys actually gone from seeded KV/D1/DO.
- student state loads; chat answers; memory read/write round-trips on the seeded bindings.
- PASS: vitest green. This is the bedrock Phase 0.8 promised — behavior, not string-match.

### STAGE 2 — PROPERTY / FUZZ (no network) · pre-commit · POWER-UP #3
`fast-check` throws thousands of generated inputs at the validation surface:
- `validateStudentId` (`security.js:143`), the mode allow-list (`index.js:1009`), payload size guard,
  CSRF origin set. Asserts: no input crashes the handler, no malformed id passes, no oversize body slips.
- PASS: no falsifying case found. Finds the edge cases humans never write.

### STAGE 3 — CONTRACT + SMOKE (dev worker) · pre-deploy
- `route-completeness` (reads router.js + index.js — the audit fix) confirms every critical route exists.
- `api-smoke.test.mjs` hits the demo click-path on `net-pet-ai-dev`: status, token×3 modes, student state.
- PASS: every smoke assertion 200/expected on dev.

### STAGE 4 — E2E BROWSER (dev) · pre-deploy · Playwright (already owned)
- `voice-agent-browser` drives the real mode landing page: pick purple/gold/teal, mic, assert socket opens.
- `voice-agent-a11y` (axe) — a11y regressions. Trace-on-failure ON so a red is debuggable.
- PASS: 3-mode click-path green; no critical a11y violations.

### STAGE 5 — PERF / LOAD (dev or prod-canary) · pre-deploy · autocannon (already owned)
- `preflight-load` against BOTH `sov100-test-magic` AND `keep-warm-ping` (the audit fix — keep-warm
  traverses the real `checkQuota` KV round-trip sov100 skips). 0/N non-2xx, p95 within budget.
- `perf-budget`: warm token <120ms p95, cache-hit >80%, voice first-audio <1500ms.
- PASS: zero non-2xx on both ids + budgets held.

### STAGE 6 — LIVE PROD GATES · post-deploy (rear guard)
- `canary-journey`: the `*/5` synthetic FULL voice journey (not a health ping); GREEN→RED emails Michael once.
- `post-deploy-verify` + `security:prod` (admin 401, CSRF rejected, rate-limit 429, secret-scan blocks fake key).
- Two RED canary ticks → auto-rollback to prior tag (Phoenix reflex).
- PASS: prod canary GREEN; rollback target verified BEFORE the push.

### STAGE 7 — META: MUTATION (slow, periodic — Run boundary, not every commit) · POWER-UP #2
`Stryker` mutates the source and re-runs Stages 0–2; every surviving mutant = a hole in the suite.
- PASS: mutation score ≥ threshold (start 60%, ratchet up). This is how we PROVE the suite has teeth —
  it grades the tests, not the code. Directly answers "make the suite more powerful."

---

## PART B — 5 OPEN-SOURCE POWER-UPS (real GitHub projects; pin + verify versions at integration)

| # | Tool | GitHub | What it adds | Why THIS app |
|---|------|--------|--------------|--------------|
| 1 | **@cloudflare/vitest-pool-workers + Miniflare** | `cloudflare/workers-sdk` | Run tests INSIDE workerd with real KV/D1/DO bindings + seeded fixtures | Already a devDependency (`package.json:31`) but UNUSED by the locks. Turns shallow string-match into real behavioral proof. The single biggest depth upgrade. |
| 2 | **Stryker Mutator** | `stryker-mutator/stryker-js` | Mutation testing — "tests the tests" by mutating source and checking the suite catches it | The audit proved string-locks are weak; Stryker would have flagged exactly that. The meta-gate that quantifies suite strength. |
| 3 | **fast-check** | `dubzzz/fast-check` | Property-based fuzzing of JS/TS inputs | The app is validation-heavy (studentId, mode, payloads, CSRF origins). Fuzzes the security surface with inputs no human writes. Pairs with zod if schemas added. |
| 4 | **gitleaks** | `gitleaks/gitleaks` | Battle-tested secret scanner for pre-commit | Replaces the hand-rolled regex the Run 105 blueprint planned (BB-53/BB-58). The exposed-key fear (BB-43/BB-53) gets an industry-standard gate, not a homemade one. |
| 5 | **MSW (Mock Service Worker)** | `mswjs/msw` | Intercept/mock HTTP **and WebSocket** (Deepgram Voice Agent WS, worker-to-worker fetches to soul-logger) | Lets the voice journey + 3 modes be tested deterministically with ZERO Deepgram quota burn and no network — the missing piece that makes Stage 1 voice tests possible and cheap. |

---

## WIRING (new npm scripts + gates)
```
"check":        "node --check src/index.js src/router.js"     # STAGE 0 syntax
"test:lock":    "<the 15 static locks>"                        # STAGE 0
"secrets":      "gitleaks protect --staged --redact"          # STAGE 0  (POWER-UP 4)
"test:unit":    "vitest run"                                  # STAGE 1+2 (pool-workers + fast-check)
"smoke":        "node test/api-smoke.test.mjs <dev-url>"      # STAGE 3
"e2e":          "playwright test"                             # STAGE 4
"perf":         "node test/preflight-load.mjs <url>"          # STAGE 5
"canary":       "node test/canary-check.mjs"                  # STAGE 6
"mutate":       "stryker run"                                 # STAGE 7 (POWER-UP 2)
"gauntlet":     "npm run check && npm run test:lock && npm run secrets && npm run test:unit"  # pre-commit
"gauntlet:dev": "npm run gauntlet && npm run smoke && npm run e2e && npm run perf"            # pre-deploy
```
- **pre-commit hook:** `npm run gauntlet` (Stages 0–2 — fast, deterministic, blocks bad commits).
- **deploy:safe:** `npm run gauntlet:dev` green on dev → promote → Stage 6 post-deploy → auto-rollback on 2 RED.
- **Run boundary (weekly):** `npm run mutate` → ratchet the mutation score. Score regression = a hole opened.

## RECEIPTS (L32 — Kilo runs, pastes; OB-1 never self-certifies)
Each stage prints a one-line GO/NO-GO with counts. The pipeline is "green" only when every stage's receipt
is pasted. "Should pass" is not a receipt. Run it. Paste it.

## SCOPE / SAFETY
Stages 0–2 + power-ups 1,3,5 are pure additions (test/ + devDeps) — zero risk to the live app. gitleaks +
Stryker are dev-only gates. Nothing here deploys or touches prod outside the explicit Stage 5/6 live probes,
which run against dev first. Do not ship any of it the day of a class — add it on a Run 106 branch.
