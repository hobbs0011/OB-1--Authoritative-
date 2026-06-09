# layer6-kv-perf.md — Token Endpoint Performance Fix

## Objective
Reduce token endpoint latency from ~1000ms to ~150ms and eliminate the 2% 500 error rate under 10-way concurrent load.

## Bug 1 — Missing Prompt Cache

### Current (Slow) Path
Every `/api/deepgram-token` call executes 8 parallel KV reads + prompt build synchronously. Cold KV reads: 50-150ms each. Total: ~1000ms.

### Fix
Add a prompt cache key BEFORE the existing KV block. Cache hit returns in ~50ms. Miss runs the full path then fire-and-forgets a write with 5min TTL.

```javascript
// Location: src/index.js, before line 1046 (Promise.all block)
// Add this check BEFORE the existing 8-read block

const promptCacheKey = `prompt_cache:${studentId}:${sessionMode}`;
if (env.NET_PET_KV) {
  try {
    const cached = await env.NET_PET_KV.get(promptCacheKey, { cacheTtl: 300 });
    if (cached) {
      const { settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url } = JSON.parse(cached);
      logInfo("PROMPT_CACHE_HIT", { studentId, sessionMode }, env);
      assertVoiceBrainLock(settings);
      return addCors(json({ token, settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }), request);
    }
  } catch (e) {
    // Cache miss or parse error — proceed to full path
  }
}

// After existing Promise.all block, add fire-and-forget cache write:
if (env.NET_PET_KV) {
  ctx.waitUntil(env.NET_PET_KV.put(promptCacheKey, JSON.stringify({ settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }), { expirationTtl: 300 }).catch(() => {}));
}
```

**Cache key format:** `prompt_cache:{studentId}:{mode}` where mode = `free|study|phonics`

---

## Bug 2 — Circuit Breaker Race Condition

### Current (Broken) Path
Lines 1190 and 1193 write to `circuit:deepgram:state` on BOTH success and error. Under 10-way concurrency, multiple requests write simultaneously, causing race conditions and 500 errors.

### Fix
DELETE both circuit:deepgram:state writes from the token endpoint hot path. The canary (scheduled hook) owns that key.

```javascript
// DELETE these two lines (or comment them out):
// Line ~1190 (success path): env.NET_PET_KV.put('circuit:deepgram:state', 'closed')
// Line ~1193 (error catch): env.NET_PET_KV.put('circuit:deepgram:state', 'open', { expirationTtl: 60 })
```

**Reason:** The canary (`/api/health/voice` + scheduled hook) actively probes the voice health. Any failure state should be set by the canary, not by individual token requests under concurrent load.

---

## Expected Result
- Token latency: ~1000ms → ~150ms (cache hit)
- 500 error rate under load: 2% → 0%
- Canary continues to own circuit breaker state

## Files to Modify
- `APPS/NET-PET-AI/src/index.js` — add prompt cache before line 1046, remove circuit writes at lines 1190/1193

## Verification
```powershell
# Before fix
node test/preflight-load.mjs  # record p99, error count

# After fix
node test/preflight-load.mjs  # expect p99 < 200ms, 0 500s
node test/canary-check.mjs   # must still pass
```