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

## WHAT THIS DOES NOT COVER (belongs in separate blueprints)

- Pre-deploy functional gates → `/netpet-preflight.md` (Kilo is on this)
- Student longitudinal memory / S2Pipeline for students → separate architecture session
- Marketing corpus extraction → separate Kilo sessions
- Security DAST (OWASP ZAP / nuclei) → `/netpet-security.md` (not yet written)
- Portal UI improvements → separate session
