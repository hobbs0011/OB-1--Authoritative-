# netpet-observability.md — Research Layer by Layer

## L1 Canary — CF Cron Limits + Deepgram Reality

**Cloudflare Cron Triggers:**
- Minimum interval: 1 minute (`*/1 * * * *`)
- Actual limit: 5 minutes for most accounts (cron schedule rounded)
- Rate: 1000 invocations/day free tier, then $0.10/million

**Deepgram Failure Modes (John Vajda, GitHub #1433):**
- `FAILED_TO_SPEAK` = gpt-4o-mini internal outage
- Canary must assert audio chunk, NOT just `SettingsApplied`
- SettingsApplied green but no audio = Deepgram thinking layer dead

**Deepgram Status Page Reality:**
- 10-30 minute lag on dashboard
- Monitor our own endpoint responses, not their public status
- If `/api/health/voice` red for 3+ consecutive checks, alert immediately

---

## L2 Rollback — Wrangler Behavior + CF Deployment Model

**wrangler rollback:**
- Uses deployment ID from `wrangler versions list --json`
- Atomic 100% traffic flip (no canary/gradual)
- Old version must still exist in versions list
- Rollback creates new deployment pointing to old source

**Versions API Audit Trail:**
- `wrangler versions list --json` returns last 25 deployments
- Each has: `deployment_id`, `status`, `created_at`, `metadata`
- Store in D1 for cross-session analysis: which version introduced bugs

---

## L3 Logging — CF Analytics Engine + Compliance

**Analytics Engine (ae):**
- Write API via `env.AE.put()` (50k writes/day free, then $5/million)
- 31-day retention (extend via export/KV mirror)
- JSON line format, numeric indexes fast

**KV TTL Minimum:**
- 60 seconds minimum (`expirationTtl` cannot be < 60)
- For 5s retry-after, use 60s TTL + check timestamp
- `expiration` UNIX time acceptable, 60s floor applies

**Lexicographic Key Ordering:**
- KV keys sorted lexicographically
- `err:20260608:123456` > `err:20260608:99999` (numeric suffix must be zero-padded)
- For time-series: `YYYYMMDD:HHMMSS:uuid` works

**Vietnam Decree 13/2023:**
- Pseudonymization required for personal data
- Email hashed before log storage (SHA-256 + salt)
- `studentId` never logged raw — store hash in `s_id_h`

---

## L4 Telegram — Alerting Pattern

**Bot API Endpoint:**
- `https://api.telegram.org/bot<token>/sendMessage`
- Rate limit: 30 messages/second per bot
- JSON body: `{ chat_id, text, parse_mode: "Markdown" }`
- Recommended: send to operator chat_id + admin group

**State-Transition Alerting (suppress duplicate RED):**
- Store last alert state in KV: `canary:last_state` = "GREEN" | "RED"
- Only alert on transition RED→RED if 30+ minutes passed
- Store timestamp: `canary:last_red_ts`
- Prevents spam during extended outages

---

## L5 Degradation — Circuit Breaker + Fallback

**Martin Fowler Pattern (simplified for Workers):**
- `circuit:deepgram:state` = "closed" | "open" | "half-open"
- On 3 consecutive 5xx/timeout → open
- open blocks requests for 60s
- half-open: 1 probe request, then closed or back to open

**RFC 7231 503 + Retry-After:**
- Headers required: `Retry-After`, `Content-Type: application/json`
- Body: `{ error: "voice_unavailable", retryAfter: 60 }`
- Browser client must respect Retry-After (exponential backoff)

**Deepgram Recommended Fallback:**
- TTS outage → stream text via fetch + TTS in browser
- STT outage → disable voice input, show "try text mode"
- Documented: docs.deepgram.com/voice-agent/best-practices#degradation

---

## L6 KV Performance — Cache Hints + Concurrency

**cacheTtl Read Hint:**
- `kv.get(key, { cacheTtl: 300 })` eliminates cold start for 99%
- Workers KV cold read: 50-150ms, cached: <5ms
- cacheTtl: 300 (5 min) balances latency vs staleness

**Run 101 Load Test Root Cause:**
- Circuit breaker key write race under concurrency
- 10 concurrent → multiple writes to `circuit:deepgram:state`
- Fix: use atomic PUT with `expirationTtl` for idempotency
- Or: per-IP circuit keys instead of global

---

## L7 Health Check — IETF Pattern + Sources

**IETF Draft: application/health+json (RFC 8848 precursor):**
- Content-Type: `application/health+json`
- Body: `{ status: "pass" | "fail" | "warn", checks: {...}, ts: ISO }`
- `pass` = 200 OK, `fail` = 503

**Health Check Auth Pattern:**
- No auth required for basic health
- Auth required for `/api/health/deep` (X-Admin-Key)
- Canary runs unauthenticated (public endpoint)

**KV Eventual Consistency Caveat:**
- KV reads may be stale (seconds to minutes)
- DO reads are strongly consistent (use for automated failover)
- KV acceptable for human operator alerts (5-min lag acceptable)