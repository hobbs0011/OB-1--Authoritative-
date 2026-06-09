# Layer 6 Deploy Pipeline — KV Perf Fix (F1)
## Full build → verify → deploy → confirm sequence for Kilo

**What this closes:** F1 from Run 101 load test. Token endpoint returns 500 on ~2% of requests under 10-way concurrency. Avg latency 1010ms, p99 1469ms. Students on Vietnamese 4G experience 1.6s silence before OBI speaks.

**Root cause (two bugs, one endpoint — `/api/deepgram-token` in `src/index.js`):**
1. 8 parallel cold KV reads + synchronous prompt build on every call = ~1000ms
2. Circuit breaker key written by every concurrent token request = write race = 500s under load

**What this does NOT touch:** voice brain lock, Deepgram WS settings, student data, any other endpoint.

---

## STEP 1 — CODE CHANGES (src/index.js only)

### 1a. Add prompt cache check BEFORE the existing 8-read Promise.all block

Location: find the line `const [rawProfile, rawLang, rawVocab...` — insert this ABOVE it.

```js
// L6 PROMPT CACHE — fast path: skip 8 KV reads if cached
const promptCacheKey = `prompt_cache:${studentId}:${sessionMode}`;
if (env.NET_PET_KV) {
  try {
    const cached = await env.NET_PET_KV.get(promptCacheKey, { cacheTtl: 300 });
    if (cached) {
      const { settings: cachedSettings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url } = JSON.parse(cached);
      assertVoiceBrainLock(cachedSettings);
      logInfo("PROMPT_CACHE_HIT", { studentId, sessionMode }, env);
      return addCors(json({ token: env.DEEPGRAM_API_KEY, settings: cachedSettings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }), request);
    }
  } catch (_) {
    // cache miss or parse error — fall through to full path
  }
}
```

### 1b. Capture the built prompt before it goes into settings

Location: find `prompt: buildAgentPrompt(...)` — change it to:

```js
// Before: prompt: buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData),
// After:
const _builtPrompt = buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData);
// then in the settings object use: prompt: _builtPrompt,
```

### 1c. Add fire-and-forget cache write AFTER assertVoiceBrainLock, BEFORE the return

Location: find `assertVoiceBrainLock(settings);` — add immediately after it:

```js
// L6 CACHE WRITE — non-blocking, does not delay response
if (env.NET_PET_KV) {
  ctx.waitUntil(
    env.NET_PET_KV.put(
      promptCacheKey,
      JSON.stringify({ settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }),
      { expirationTtl: 300 }
    ).catch(() => {})
  );
}
```

Note: `ctx` is the second argument to the Worker `fetch(request, env, ctx)` handler. It must be in scope. If the handler signature is currently `async fetch(request, env)` — change it to `async fetch(request, env, ctx)`.

### 1d. DELETE the two circuit breaker writes from the hot path

Find and delete (or comment out) both of these lines:

```js
// DELETE THIS — success path (~line 1190):
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'closed');

// DELETE THIS — error catch (~line 1193):
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'open', { expirationTtl: 60 });
```

Keep the READ at `env.NET_PET_KV.get('circuit:deepgram:state')` — that's correct and fast. Only remove the writes.

---

## STEP 2 — LOCAL VERIFY (before touching wrangler)

### 2a. Voice brain lock — must still pass after code change

```powershell
node test/voice-brain-lock.test.mjs
# expect: PASS — if this fails, undo 1a-1d before anything else
```

### 2b. Node syntax check

```powershell
node --check src/index.js
# expect: no output (clean parse)
```

---

## STEP 3 — DEPLOY TO DEV (firewall rule — always dev before prod)

```powershell
npx wrangler deploy --env dev
```

Wait 10 seconds for CF propagation.

---

## STEP 4 — VERIFY ON DEV (4 gates, all against dev URL)

Replace `{DEV}` with `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev` in each gate.

### Gate A — Cache miss timing (cold, first call)

```powershell
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$r = Invoke-RestMethod "{DEV}/api/deepgram-token?studentId=sov100-test-magic"
$sw.Stop()
Write-Host "Cache MISS: $($sw.ElapsedMilliseconds)ms | token=$($r.token -ne $null)"
# expect: 200-600ms (slow path — builds and caches)
```

### Gate B — Cache hit timing (second call, within 5 min)

```powershell
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$r = Invoke-RestMethod "{DEV}/api/deepgram-token?studentId=sov100-test-magic"
$sw.Stop()
Write-Host "Cache HIT: $($sw.ElapsedMilliseconds)ms | token=$($r.token -ne $null)"
# expect: 30-150ms (fast path)
# if still ~1000ms: cache write in 1c failed — check ctx.waitUntil, check NET_PET_KV binding on dev
```

### Gate C — Load test on dev (0 non-2xx expected)

```powershell
node test/preflight-load.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
# expect: 0 non-2xx (was 2% before fix), p99 < 500ms
# if still getting 500s: circuit breaker write was not fully removed — check 1d
```

### Gate D — WS round-trip still works on dev (Settings still accepted, OBI still speaks)

```powershell
# Edit test/preflight-ws.mjs: change PROD const to {DEV} URL, run, then change back
node test/preflight-ws.mjs
# expect: GATE 2 GREEN (Welcome) + GATE 3 GREEN (SettingsApplied) + GATE 4 GREEN (audio)
# if Gate 3 RED: a code change accidentally touched the settings object — check 1b, 1c
```

---

## STEP 5 — PROMOTE TO PROD

Only after all 4 dev gates are GREEN.

```powershell
npx wrangler deploy
```

Wait 10 seconds.

---

## STEP 6 — PROD CONFIRMATION (same 4 gates, prod URL)

Replace `{DEV}` with `https://net-pet-ai.mrmichaelhobbs123.workers.dev`.

Run Gate A → B → C → D in order. All must be green.

If Gate D is RED on prod → OBI is dead → rollback immediately:

```powershell
npx wrangler rollback
# wait 30s, then re-run Gate D to confirm rollback worked
```

---

## STEP 7 — HEALTH ENDPOINT CONFIRMATION

```powershell
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/health/voice
# expect: {"ok":true,"canary":{"state":"GREEN"},...}
# canary state should still be GREEN — the canary writes circuit:deepgram:state, not token requests
```

---

## WHAT CAN GO WRONG AND HOW TO FIX IT

| Symptom | Cause | Fix |
|---------|-------|-----|
| Gate B still ~1000ms | `ctx.waitUntil` not in scope (handler missing `ctx` arg) | Change `fetch(request, env)` to `fetch(request, env, ctx)` |
| Gate B still ~1000ms | `NET_PET_KV` not bound on dev | Check wrangler.toml dev env KV binding |
| Gate C still 2% 500s | Circuit write lines not deleted (just commented with wrong line numbers) | Search for `circuit:deepgram:state` writes — delete both that are inside the token handler |
| Gate D RED — SettingsApplied missing | Code change in 1b broke the settings object structure | Revert 1b and use inline buildAgentPrompt again |
| Gate D RED — no audio | Deepgram gpt-4o-mini outage | Check status.deepgram.com — not our code |
| `assertVoiceBrainLock` throws on cache hit path | Cached settings have wrong think.provider fields | Never write to cache in 1c before `assertVoiceBrainLock(settings)` passes |

---

## CONSTRAINTS (hardcoded — do not negotiate)

- `assertVoiceBrainLock(settings)` called on EVERY code path including cache hit path — non-negotiable
- `think.provider.type = "open_ai"` — locked
- `think.provider.model = "gpt-4o-mini"` — locked
- `think.provider.endpoint` — must be ABSENT (in-house Deepgram pipeline, not external)
- `speak.provider.model = "aura-2-zeus-en"` — locked
- `listen.provider.model = "nova-3"` — locked
- `listen.endpointing` — must remain ABSENT (the Run 101 bug)
- Dev before prod — always
- `sov100-test-magic` as the test studentId — never a real student ID

---

## FILES CHANGED

| File | Change |
|------|--------|
| `APPS/NET-PET-AI/src/index.js` | Add 1a (cache check), 1b (capture prompt), 1c (cache write), 1d (delete 2 circuit writes) |

No other files. No wrangler.toml change. No package.json change.

---

## EXPECTED METRICS AFTER FIX

| Metric | Before | After |
|--------|--------|-------|
| Token latency (cache miss) | ~1000ms avg | ~400ms (still does 8 reads, once) |
| Token latency (cache hit) | ~1000ms avg | ~50-150ms |
| 500 error rate under load | ~2% | 0% |
| Student time-to-first-word (4G) | ~1.6s | ~600ms |
| Canary still writing circuit state | Yes | Yes (unchanged) |
