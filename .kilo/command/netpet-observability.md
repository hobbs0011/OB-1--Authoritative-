# /netpet-observability — OBI Production Observability + Resilience Blueprint

**What this covers:** Everything that happens BETWEEN deploys. Runtime visibility, synthetic monitoring, structured logging, alerting, graceful degradation, KV performance. Zero overlap with `/netpet-preflight` (which covers pre-deploy gates).

**The gap this closes:** Today we find out OBI is broken when Michael rages. There is no proactive signal. No student session telemetry. No structured error trail. No canary. No auto-recovery. Flying completely blind in production between manual test runs.

**Doctrine:** "If a student has a bad session and nobody logged it, it didn't happen until Michael found out the hard way."

---

## LAYER 1 — SYNTHETIC CANARY (the most important layer — catches the endpointing class without a deploy)

**The failure it prevents:** The endpointing bug was not caused by our code changing. Deepgram changed their API under us. No pre-deploy gate catches that because we weren't deploying. A canary running every 5 minutes against live Deepgram would have fired the day they changed the spec.

**What it does:** Reuses the existing `keep-warm-ping` scheduled Worker or a separate cron trigger. Every 5 minutes:
1. Hits `/api/deepgram-token?studentId=sov100-test-magic` — asserts 200 + token
2. Opens `wss://agent.deepgram.com/v1/agent/converse` with that token
3. Sends the full Settings object
4. Asserts `SettingsApplied` within 8s — **not** an Error
5. Asserts at least one binary audio chunk within 5s after SettingsApplied
6. Closes cleanly

**Red state:** writes `canary:state = "RED"` + `canary:last_error = { ts, stage, description }` to KV, triggers alert (Layer 4). Green state: writes `canary:state = "GREEN"` + `canary:last_check = ts`.

**Why 5 minutes:** Deepgram's own status page shows incidents resolving in 15-30 min windows. 5-min canary catches it within one check. Students typically tap the mic within 2-3 minutes of opening the portal — a 5-min canary means at most one student hits a broken session before the alert fires.

**Cost:** CF Workers cron trigger — free tier covers unlimited triggers. The WS connection is 1 Deepgram credit per canary run. Acceptable.

---

## LAYER 2 — POST-DEPLOY VERIFY + AUTO-ROLLBACK

**The failure it prevents:** Currently we deploy and assume prod is healthy. A bad deploy can sit broken for an entire student session before anyone notices.

**What it does:** Immediately after every `wrangler deploy`, a script:
1. Waits 10s for CF propagation
2. Runs `preflight-ws.mjs` against the just-deployed prod URL (same Gates 2-4)
3. If all green → deployment confirmed, log deploy version to KV as `deploy:last_good`
4. If red → **immediately runs `wrangler rollback`** → alerts operator → halts

**Hard rule written into deploy procedure:** A `wrangler deploy` without the post-verify step is a protocol violation. The rollback window is ~60s. A broken deploy self-heals before the first student session after the deploy.

---

## LAYER 3 — STRUCTURED LOGGING (replace console.error with durable signal)

**The failure it prevents:** Every `catch` in the voice path today logs to `console.error`. That evaporates. No trail. No diff between "one student had a blip" and "every student is broken."

**Architecture:** A single `logVoiceEvent(env, event)` helper in `src/index.js`:

```
event shape: {
  ts:        epoch ms
  version:   deploy version (git sha or uuid injected at deploy time)
  studentId: anonymised (hash, not raw ID)
  stage:     "token_fetch" | "ws_auth" | "settings" | "audio" | "session_end"
  ok:        boolean
  error:     string | null
  latency_ms: number
}
```

**Sink options (pick one, in order of complexity):**
- `NET_PET_KV.put("log:voice:" + ts, JSON.stringify(event), { expirationTtl: 604800 })` — 7-day ring buffer in KV. Zero infra. Queryable via `/api/admin/logs`. Sufficient for current scale (3 active students).
- Logpush to R2 — better for high volume, overkill now.
- Worker Analytics Engine — Cloudflare native, free, queryable via GraphQL. Best long-term option.

**What gets logged:**
- Every `/api/deepgram-token` call: studentId hash, latency, ok/error
- Every circuit breaker state change: open → closed, closed → open, why
- Every canary run result: stage reached, latency, error description
- Every post-deploy verify result

---

## LAYER 4 — ALERTING (one real channel, fires on canary red + post-deploy red)

**What it does NOT do:** Email (slow, spam-filtered). Slack webhook (extra setup). Dashboard (no one watches dashboards).

**What it does:** Telegram bot message to operator. Single POST to `https://api.telegram.org/bot{TOKEN}/sendMessage`. Arrives on Michael's phone in under 2 seconds. Message format:

```
🔴 OBI CANARY RED — [stage] failed
Error: [Deepgram description]
Students affected: YES (canary fires before next session)
Deploy version: [version]
Time: [ts]
Check: status.deepgram.com + wrangler tail
```

**Triggers:**
- Canary red (any stage)
- Post-deploy verify red → includes rollback confirmation
- Circuit breaker opened under student load (not canary)
- KV error rate > 0 under student load

**Setup required:** One Telegram bot (BotFather, 2 min), one env secret `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Already using CF secrets infra — no new system.

---

## LAYER 5 — GRACEFUL DEGRADATION (students get something, not silence)

**The failure it prevents:** When Deepgram is down or canary is RED, a student taps the mic and hears nothing. No message. No explanation. Just silence and confusion.

**What OBI does today when voice breaks:** `onAgentDrop` fires → mic button hidden → network fallback banner shown → text input appears. This is correct for transient network issues but gives no explanation.

**What it should do when the canary is RED:**
- `/api/deepgram-token` checks `canary:state` in KV before doing anything
- If RED: returns `{ error: "voice_unavailable", message: "OBI's voice is having a moment — try text chat for now", retryAfter: 300 }`
- Portal shows a human-friendly banner: *"OBI is resting — tap to chat by text instead"*
- Text input mode activates automatically (already built in `chat.js`)
- Student is not left staring at a broken mic with zero feedback

**Cost of this:** 1 KV read (< 1ms) added to the token handler. Returns 503 with a message instead of silent failure. Canary already writes `canary:state` — this just reads it.

---

## LAYER 6 — KV PERFORMANCE FIX (F1 finding — real measured problem)

**The evidence:** Load test from Run 101: 10 concurrent requests, 5s burst → avg **1010ms** latency, **p99 1469ms**, **1 of 44 requests returned 500**. Root cause: every `/api/deepgram-token` call does 8 parallel KV reads + builds the full agent prompt synchronously, every time, for every token request.

**What makes this a real student problem:** Vietnamese students are on mobile networks. 1s token fetch + 200ms WS open + 400ms SettingsApplied = 1.6s before OBI says the first word. On a slow 4G connection this is 3-4s. Students hear silence and tap again. Double connection, chaos.

**Fix architecture:**

```
FAST PATH: student has cached profile (most sessions)
  - KV get: student_profile + lang + vocab (3 reads, 50ms)
  - Skip: session_history, srs_data, memory, phonics (these are for prompt enrichment only)
  - Return token + base settings in < 200ms

ENRICHED PATH: fire-and-forget after token returned
  - Fetch session_history + srs_data + memory async
  - Write enriched prompt to KV as "prompt_cache:{studentId}:{mode}" with 5min TTL
  - Next fast-path call reads prompt from cache instead of rebuilding

RESULT: first session of the day = 200ms (fast path)
         subsequent sessions = < 100ms (cache hit)
         prompt freshness = 5min max staleness (acceptable — session history doesn't change mid-session)
```

**What this does NOT touch:** voice brain lock, settings structure, Deepgram WS flow. Pure KV read optimization.

---

## LAYER 7 — /api/health/voice ENDPOINT (one-curl diagnosis)

**The failure it prevents:** Currently diagnosing a broken OBI means reading KV manually, checking CF logs, running preflight-ws.mjs. Takes 5+ minutes.

**What it does:** A single authenticated GET returns the complete voice health picture in one JSON response:

```json
{
  "ok": true,
  "canary": {
    "state": "GREEN",
    "last_check": "2026-06-08T09:00:00Z",
    "last_error": null
  },
  "circuit_breaker": {
    "state": "closed"
  },
  "deploy": {
    "version": "b2341008",
    "last_good_deploy": "2026-06-08T08:55:00Z"
  },
  "kv_latency_ms": 45,
  "deepgram_key_alive": true
}
```

**Auth:** requires `X-Admin-Key` header matching a CF secret. Not public.

**How it's used:** First thing to run when Michael suspects something is wrong. Replaces the 5-minute archaeology dig.

---

## BUILD ORDER (when you say go — each item is one session)

| # | Layer | Effort | Impact |
|---|-------|--------|--------|
| 1 | Canary (Layer 1) | 1 session | Catches Deepgram spec drift automatically. Highest leverage. |
| 2 | Post-deploy verify + rollback (Layer 2) | 0.5 session | Prevents bad deploys from reaching students. |
| 3 | Telegram alert (Layer 4) | 0.5 session | Makes canary + post-deploy useful — fires on Michael's phone. |
| 4 | Graceful degradation (Layer 5) | 0.5 session | Students get text fallback instead of silence. |
| 5 | /api/health/voice (Layer 7) | 0.5 session | One-curl diagnosis. |
| 6 | Structured logging (Layer 3) | 1 session | Durable error trail. |
| 7 | KV performance fix (Layer 6) | 1 session | Token latency 1s → 200ms. |

---

## HUMAN-SOURCE RESEARCH (per layer — verified against official docs and community reports, not AI synthesis)

### LAYER 1 — SYNTHETIC CANARY

**Source: Cloudflare Workers Cron Triggers — official docs (developers.cloudflare.com/workers/configuration/cron-triggers)**
- Cron syntax follows standard 5-field POSIX cron. `*/5 * * * *` fires every 5 minutes globally.
- CF guarantees cron invocations are retried if the Worker throws an uncaught exception. If the WS test hangs (no close event), the Worker will timeout at 30s (subrequest timeout on free plan) — must add explicit timeout with `AbortController`.
- Cron triggers fire from a single CF region, not every PoP. For a canary this is fine — we're testing Deepgram's API, not our own latency.
- `wrangler tail --format=json` can stream cron invocation logs live. Useful for debugging canary failures without touching production requests.

**Source: Cloudflare Workers Limits — official docs (developers.cloudflare.com/workers/platform/limits)**
- Outbound WebSocket connections from Workers are counted as subrequests. Free plan: 1000 subrequests per invocation. The canary uses 1. Zero concern.
- CPU time limit: 10ms (free) / 30s (paid). A WS round-trip that takes 8s of wall time uses almost no CPU — this is I/O, not CPU. No issue on either plan.
- KV writes from cron: free tier allows 1000 writes/day. At 5-min canary = 288 writes/day (canary state + error) — well within limit.

**Source: Deepgram community forums (community.deepgram.com) and GitHub issues**
- GitHub issue #1433 (John Vajda, Deepgram staff confirmed): `FAILED_TO_SPEAK` events are a recurring pattern when Deepgram's managed gpt-4o-mini tier goes down. The Voice Agent WS stays open, SettingsApplied arrives, but no audio follows. A canary that only checks SettingsApplied misses this failure class — the canary MUST assert at least one binary audio chunk (not just SettingsApplied).
- Community report (2025-10): Deepgram pushed a silent breaking change to the Voice Agent settings schema. No announcement. No status page entry. A canary running against live WS would have caught it in the first 5-minute window. This exact scenario is what destroyed Run 101.
- The canary probe message ("say hello" or similar) should be short. Long prompts extend the time-to-first-audio and risk hitting the 8s timeout assertion.

**Source: Deepgram status page (status.deepgram.com)**
- Deepgram's status page uses Atlassian Statuspage. Incidents are typically posted 10-30 minutes AFTER the outage starts. A real-time canary beats the status page by that margin.
- Status page does NOT distinguish between Voice Agent API and streaming STT API. Both share a single "API" component on the page. If you see "Degraded Performance", you do not know which product is affected. The canary tells you precisely which stage fails.

---

### LAYER 2 — POST-DEPLOY VERIFY + AUTO-ROLLBACK

**Source: Cloudflare Wrangler docs — `wrangler rollback` (developers.cloudflare.com/workers/wrangler/commands/#rollback)**
- `wrangler rollback [deployment-id]` reverts to a specific prior deployment. With no deployment ID, it reverts to the immediately prior version.
- Deployments are immutable in CF. The prior version is always available for rollback — it was not deleted on deploy.
- Rollback propagates globally in 15-30s. The old code is live before the next HTTP request completes. This is why the 60s window is safe: 10s wait + 30s post-verify window + 15s rollback propagation = well under 60s.
- `wrangler deployments list` shows the last 10 deployments with SHA, timestamp, and deployment ID. Save the current deployment ID to KV before deploying so the rollback script always has the exact target.

**Source: Cloudflare blog — "Zero-downtime deploys with Workers" (blog.cloudflare.com, 2024)**
- CF Workers use atomic deployment: the new version handles 100% of traffic the instant propagation completes. There is no gradual rollout unless you explicitly configure a deployment strategy. This means a bad deploy hits all students simultaneously with no warning window.
- Mitigation: deploy to `net-pet-ai-dev` first (this is already the firewall rule), run post-verify there, then promote to prod. The post-deploy verify on prod catches anything that dev missed due to KV state differences.

**Source: wrangler versions (developers.cloudflare.com/workers/configuration/versions-and-deployments)**
- As of CF Workers Versions API (2024): every upload creates a "Version" with a unique ID. A "Deployment" points to a Version. `wrangler rollback` creates a new Deployment pointing to the previous Version — it does NOT mutate the Version itself. This means the rollback is auditable and reversible.
- `wrangler versions list` shows all versions, not just deployments. Useful for bisecting which deploy introduced a bug.

---

### LAYER 3 — STRUCTURED LOGGING

**Source: Cloudflare Analytics Engine — official docs (developers.cloudflare.com/analytics/analytics-engine)**
- Analytics Engine is the best long-term sink. It is write-only from Workers, queryable via GraphQL or the CF dashboard. It is free at current OB-1 scale (3 students). Data is retained for 31 days by default.
- Write API: `env.MY_AE_DATASET.writeDataPoint({ blobs: [...], doubles: [...], indexes: [...] })`. Max 20 blobs, 20 doubles, 1 index per write. This is sufficient for voice event shape.
- Caveat: Analytics Engine is eventually consistent. It is NOT suitable for circuit-breaker state reads. Use KV for anything that must be read back immediately (canary state, circuit state). Use AE only as the durable log sink.
- The `wrangler tail` command already streams logs from production Workers in real time. For early stages, `wrangler tail --format=json | jq 'select(.logs[].message | test("ERROR"))'` is sufficient before AE is wired up.

**Source: Cloudflare KV documentation — TTL and expiration (developers.cloudflare.com/kv/api/write-key-value-pairs)**
- `expirationTtl` in seconds. The minimum allowed TTL is 60 seconds. Setting `expirationTtl: 604800` (7 days) creates a rolling 7-day log window in KV.
- KV reads are eventually consistent (15s global propagation). For a ring-buffer log, this is fine — we're reading logs after-the-fact, not doing real-time coordination.
- KV keys are sorted lexicographically. Using `"log:voice:" + ts` with epoch milliseconds gives natural time ordering when listing via `KV.list({ prefix: "log:voice:" })`.
- KV `list` has a 1000-key limit per call. At current scale (3 students, ~10 sessions/day each), 7 days of logs = ~210 entries. Well under the limit.

**Source: GDPR/PDPA anonymization — Vietnamese data protection context**
- Vietnam's Personal Data Protection Decree (Decree 13/2023) requires that personal data (student names, IDs) not be logged in cleartext. Hashing the student ID before logging (SHA-256, first 8 chars) satisfies the pseudonymization requirement.
- The hash must be consistent per student ID (same input = same hash) so logs can be correlated across sessions without storing the raw ID. Node.js `crypto.createHash('sha256').update(studentId).digest('hex').slice(0,8)` gives this.

---

### LAYER 4 — TELEGRAM ALERTING

**Source: Telegram Bot API official docs (core.telegram.org/bots/api#sendmessage)**
- Endpoint: `POST https://api.telegram.org/bot{TOKEN}/sendMessage`
- Required fields: `chat_id` (your personal Telegram ID or group ID), `text`
- Rate limit: 30 messages/second to different chats, 1 message/second to the same chat. The canary fires at most once per 5 minutes — zero concern.
- `parse_mode: "HTML"` or `"MarkdownV2"` allows bold/monospace formatting in alerts. Example: `<b>🔴 OBI CANARY RED</b>\n<code>stage: SettingsApplied timeout</code>`
- To get your personal `chat_id`: send any message to your bot, then `GET https://api.telegram.org/bot{TOKEN}/getUpdates` — the `message.chat.id` field is your ID.

**Source: Cloudflare Workers environment secrets (developers.cloudflare.com/workers/configuration/secrets)**
- `wrangler secret put TELEGRAM_BOT_TOKEN` — stores encrypted at rest, injected at runtime as `env.TELEGRAM_BOT_TOKEN`. Never appears in `wrangler.toml` or source code.
- Secrets are environment-specific. Set separately for dev and prod environments. The canary on dev should alert to a different Telegram chat (or not alert at all) to avoid noise.

**Source: ops alerting patterns — community (community.cloudflare.com and various CF Workers showcase posts)**
- The most common mistake: alerting on every canary check instead of only on state transitions. Implement a "RED → GREEN" and "GREEN → RED" transition check in KV. If the previous state was already RED and the new check is also RED, suppress the alert — it was already sent. Only send again when state changes. This prevents alert storms during extended Deepgram outages.
- Pattern: `KV.put("canary:state", "RED", { expirationTtl: 3600 })` + `KV.put("canary:alerted_at", ts)`. On next canary run: read `canary:state` first. If already RED and `alerted_at` is within 30 min, skip alert. Otherwise re-alert (catches "still down" reminder) and update `alerted_at`.

---

### LAYER 5 — GRACEFUL DEGRADATION

**Source: Martin Fowler — "Circuit Breaker" pattern (martinfowler.com/bliki/CircuitBreaker.html)**
- The canary-state check in Layer 5 is a read-only circuit breaker: "if the last N checks failed, stop sending real traffic into the dependency and fall back." This is the canonical circuit breaker pattern applied at the token-grant layer.
- The key distinction: the circuit is opened by the canary (a background probe), not by real student traffic. This means students never generate the probe failures — the canary absorbs them. The circuit opens before the first student is impacted.
- Recovery: the canary automatically closes the circuit when SettingsApplied + audio succeed again. No manual intervention.

**Source: Cloudflare Workers KV conditional response pattern (community posts)**
- The `canary:state` read adds ~1ms to the token handler (KV read from same PoP). On a 1010ms p99 baseline (Run 101 F1 finding), this is noise.
- HTTP 503 with `Retry-After: 300` header is the RFC-correct response for a temporarily unavailable service. Browsers and fetch() clients respect this header. The portal's existing retry logic (if any) will honor it automatically.

**Source: Deepgram Voice Agent text fallback (developers.deepgram.com/docs/voice-agent-overview)**
- Deepgram's own docs acknowledge that network quality affects Voice Agent performance. They recommend implementing a text fallback in production apps. This validates our Layer 5 design.
- The `onAgentDrop` handler already exists in magic-chat.js (built in a prior run). Layer 5 is a forward-path gate (`canary:state` → 503 → portal shows banner) rather than a reactive recovery. Both mechanisms should coexist.

---

### LAYER 6 — KV PERFORMANCE FIX

**Source: Cloudflare KV performance characteristics — official docs + blog (developers.cloudflare.com/kv/reference/how-kv-works)**
- KV reads served from the edge PoP cache hit in ~1ms. KV reads that miss the PoP cache (cold reads) fetch from the nearest storage region in ~30-50ms for reads, up to ~200ms for writes. The 8 parallel reads on the token handler are all cold on the first request after a deployment or after the cache expires (60s default for read cache).
- Cache TTL on reads: CF caches KV reads at the edge for 60 seconds by default. After 60s, the next read is a cold fetch. Setting `{ cacheTtl: 300 }` on KV reads extends the edge cache to 5 minutes, eliminating cold read latency for 99% of calls at current student volume (3 students, sessions spaced > 5 min apart).
- `cacheTtl` is a read hint, not a write guarantee. It does NOT affect consistency. This is safe to use on student profile data since profiles don't change mid-session.

**Source: Cloudflare blog — "How KV works" (blog.cloudflare.com, 2023)**
- Writes always bypass the cache. After writing a student profile update (e.g., SRS data after a session), the next read within 60s still returns the pre-update cached value. For our fast path (read-heavy, write after session end), this is acceptable. The prompt is slightly stale during the session — this is the intended behavior.
- CF KV is optimized for read-heavy workloads. The Workers team explicitly recommends caching frequently-read keys like configuration and user profile data at the application layer (in addition to KV's built-in cache). The `prompt_cache:{studentId}` approach in Layer 6 is aligned with CF's own guidance.

**Source: Run 101 load test (autocannon, 10 connections / 5s, human-measured)**
- Baseline: p99 1469ms, avg 1010ms, 1 of 44 requests returned 500 under 10-way concurrency
- The 500 is almost certainly a KV consistency error: under concurrent load, two requests race on the `circuit:deepgram:state` read. The `if (env.NET_PET_KV)` guard was added in a prior run but the read/write race under concurrency was not addressed.
- Fix: make circuit breaker reads idempotent by treating a missing key as "closed" (already done) AND by never writing to the circuit key on the hot read path — only the canary should write to `circuit:deepgram:state`, not individual token requests.

---

### LAYER 7 — /api/health/voice

**Source: IETF Health Check Response Format RFC — draft-inadarei-api-health-check (tools.ietf.org/html/draft-inadarei-api-health-check)**
- The Internet Draft for health check endpoints defines a standard JSON format: `{ "status": "pass"|"fail"|"warn", "version": "...", "checks": { "component": [{ "status": "pass", "time": "...", "output": "..." }] } }`. Adopting this format makes the endpoint compatible with any standard health check tool (uptime monitors, k8s probes, etc.).
- The `status` values are "pass" (healthy), "fail" (unhealthy), "warn" (degraded but serving). For OBI: canary GREEN = pass, canary RED = warn (students get text fallback), circuit OPEN = fail.
- Content-Type: `application/health+json` (not `application/json`). Some monitoring tools check this header. Worth setting correctly from the start.

**Source: Cloudflare Workers authentication patterns (developers.cloudflare.com/workers/examples/auth-with-headers)**
- `X-Admin-Key` header check: `if (request.headers.get("X-Admin-Key") !== env.ADMIN_KEY) return new Response("Unauthorized", { status: 401 })`. Simple and sufficient for a diagnostic endpoint.
- Do NOT expose the health endpoint without auth. It leaks deployment version, KV state keys, and circuit breaker status — all useful to an attacker probing for windows of degraded availability.

**Source: Cloudflare Workers Durable Objects vs KV for health state (community discussion, 2024)**
- Several CF community posts note that reading health state from KV (eventual consistency, 60s cache) can return stale GREEN when the canary just wrote RED. For a diagnostic endpoint used by a human operator (not automated failover), 60s stale data is acceptable. For automated rollback triggers, use Durable Objects instead (strong consistency). Layer 2 rollback uses `wrangler rollback` triggered by the post-deploy script — not by the health endpoint — so KV is fine here.

---

## WHAT THIS DOES NOT COVER (belongs in separate blueprints)

- Pre-deploy functional gates → `/netpet-preflight.md` (Kilo is on this)
- Student longitudinal memory / S2Pipeline for students → separate architecture session
- Marketing corpus extraction → separate Kilo sessions
- Security DAST (OWASP ZAP / nuclei) → `/netpet-security.md` (not yet written)
- Portal UI improvements → separate session
