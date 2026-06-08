# OBI RELIABILITY BLUEPRINT

North star: A student never taps the mic and hears nothing.

The failure this blueprint exists to kill: we ran dozens of audits that checked config in isolation, and OBI was dead in production the whole time. Every layer below is defined so that class of bug — a true product break that passes every "field exists" check — cannot ship or survive silently.

---

## LAYER 0 — THE DOCTRINE (the law everything else obeys)

**A check is real only if it hits the live dependency and asserts a real round-trip signal.**

"Field exists," "model string matches," "source contains X," "no syntax error" = theater. They do not count as tests. If a check can pass while a student hears silence, it is theater and must be deleted or rewritten.

This is already written into netpet-preflight.md in two places. It is the constitution. Every other layer is enforcement of it.

---

## LAYER 1 — PRE-COMMIT (cheap, local, fast — catches drift before it's even saved)

Runs in `.git/hooks/pre-commit`. Pure static, sub-second. Not the real defense — just the first sieve.

- Voice brain lock static check (`test/voice-brain-lock.test.mjs`) — provider strings unchanged.
- Lint / node --check on changed JS.
- New rule: if `src/index.js` voice settings block changed, pre-commit prints: "Voice Settings changed — GATE 2-4 must pass before deploy."

---

## LAYER 2 — PRE-DEPLOY FUNCTIONAL GATES (the heart — already built & verified green)

The 11-gate netpet-preflight.md pipeline. Every gate hits the live Deepgram WS / live worker:

| Gate | Check | Law |
|------|-------|-----|
| 0 | Key authenticates | POST /v1/projects validates API key |
| 1 | Token serves | GET /api/deepgram-token returns token+settings 200 |
| 2 | WS auth passes | Welcome received on wss://agent.deepgram.com |
| 3 | SettingsApplied | Deepgram ACCEPTS the payload (the Run 101 gate) |
| 4 | Audio streams | Binary audio chunk within 5s |
| 5 | Brain lock in served payload | speak=aura-2-zeus-en, think=gpt-4o-mini in-house, listen=nova-3 |
| 6 | Roster 403/200 | Inactive rejected, active passes |
| 7 | Cross-browser | 21/21 Chrome/FF/Edge/Safari/iOS/Android |
| 8 | Accessibility | axe-core WCAG 2.1 A/AA — 0 critical/serious |
| 9 | Lighthouse | perf/a11y/best-practices/SEO above threshold |
| 10 | Load / concurrency | autocannon student-scale → 0 non-2xx |

**Hard rule:** `wrangler deploy` forbidden unless gates 0–10 are green against dev first, then re-verified against prod.

---

## LAYER 3 — POST-DEPLOY VERIFY + AUTO-ROLLBACK (the safety net)

The gap that let OBI stay dead: nobody re-ran a functional check after deploy.

- After every `wrangler deploy`, GATE 2-4 runs against the just-deployed URL.
- Red → automatic `wrangler rollback` + HALT + alert.
- A bad deploy self-heals in under 60s instead of living for days.

**Implementation:** `test/post-deploy-verify.mjs` — imports preflight logic, auto-rolls back on red.

---

## LAYER 4 — CONTINUOUS SYNTHETIC CANARY (the layer that catches spec drift)

This is the most important new piece. The endpointing bug wasn't our code changing — it was Deepgram's API spec changing under us. No pre-deploy gate catches that, because we weren't deploying.

- Scheduled worker runs GATE 2-4 against prod every 5 minutes.
- Reuses existing cron infrastructure (`crons = ["*/5 * * * *"]`).
- Red → immediate alert with exact Deepgram `Error.description`.

**Implementation:**
- `src/index.js` — `/api/health/voice` endpoint (runs gates 1-4, returns JSON)
- `scheduled()` hook calls `/api/health/voice` every trigger
- Alert via `ALERT_WEBHOOK` env secret (Telegram webhook)
- Logs to D1 `error_log` table for persistence

---

## LAYER 5 — OBSERVABILITY THAT ACTUALLY FIRES

Every catch in the voice path logs structured JSON to D1 `error_log` table, not a console.error that evaporates.

- `/api/health/voice` endpoint — runs gates 0-4 on demand.
- Canary red + post-deploy red route to real alert channel (email/Telegram).
- Silent failure becomes structurally impossible.

---

## LAYER 6 — CROSS-PLATFORM TRUTH (already built — 21/21)

Chrome / Firefox / Edge / Safari(WebKit) / Safari iOS ×2 / Chrome Android. "Works on my Chrome" is banned as evidence.

---

## LAYER 6 — CROSS-PLATFORM TRUTH (already built — 21/21)

Chrome / Firefox / Edge / Safari(WebKit) / Safari iOS ×2 / Chrome Android. "Works on my Chrome" is banned as evidence.

---

---

## IMPLEMENTATION STATUS (2026-06-08)

| Layer | Status | Files |
|-------|--------|-------|
| 3 | GREEN | `test/post-deploy-verify.mjs`, `SCRIPTS/deploy-with-gates.mjs` |
| 4 | GREEN | `test/canary-check.mjs`, `wrangler.toml` cron trigger |
| 5 | GREEN | `src/index.js` `/api/health/voice` endpoint (HTTP-only, GATE 1 + 5) |
| F1 | MONITORED | Promise.all parallelized, p99 ~1.6s under 10-concurrent load |

**Research reference:** `CANON/SYSTEM/netpet-observability.md` — 134 lines of human-sourced research per layer

**Verification commands:**
```powershell
# Pre-deploy check
node test/preflight-ws.mjs

# Canary check (Node.js with ws)
node test/canary-check.mjs

# Load test
node test/preflight-load.mjs

# Dry-run deploy
npx wrangler deploy --dry-run --env=""
```

---

## OPEN FINDINGS THIS BLUEPRINT MUST RESOLVE

| # | Finding | Plan |
|---|---------|------|
| F1 | Token endpoint drops ~2% of requests (500) under 10-way load, avg ~1s latency | Split "mint token" (fast) from "build prompt" (cacheable). Parallelize static KV reads. Already parallelized via Promise.all. Add LRU cache for profile/lang/vocab. |
| F2 | Error logging is invisible | Layer 5 structured sink → D1 error_log |
| F3 | No post-deploy or continuous functional check | Layers 3 + 4 implemented |
| F4 | Deepgram API spec drift undetectable | Layer 4 canary |

---

## GOVERNANCE — HOW THIS STAYS TRUE

New gates are earned, not invented. When something breaks in prod:

1. Write the real round-trip check that would have caught it.
2. Add it to the BUG→GATE ledger.
3. It never breaks silently again.

The anti-theater rule: **"Does this hit a live dependency and assert a real success signal?"**