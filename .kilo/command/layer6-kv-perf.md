# Layer 6 — KV Performance Fix (F1)
## Kilo Build Brief — Copy-paste this entire file

**Target file:** `APPS/NET-PET-AI/src/index.js`
**Deploy target:** `net-pet-ai-dev` first, then promote to prod after verify
**DO NOT TOUCH:** voice brain lock, settings structure, Deepgram WS fields, `assertVoiceBrainLock()`

---

## THE PROBLEM (measured, not guessed)

Run 101 load test: `autocannon` 10 connections / 5s against `/api/deepgram-token`
- avg **1010ms**, p99 **1469ms**, **1–2 of 44–52 requests return 500**

Root causes — two separate bugs, both in the `deepgram-token` handler:

**Bug 1 — 8 parallel cold KV reads on every call (lines 1020–1029 in index.js)**
```js
const [rawProfile, rawLang, rawVocab, rawArc, rawMemory, rawPhonics, rawSessionHistory, rawSrsData] = await Promise.all([
  env.NET_PET_KV.get("student_profile_" + studentId),
  env.NET_PET_KV.get("lang:" + studentId),
  env.NET_PET_KV.get("vocab_list_" + studentId),
  env.NET_PET_KV.get("vocab_arc_" + studentId),
  env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`mem:${studentId}`) : Promise.resolve(null),
  sessionMode === 'phonics' ? env.NET_PET_KV.get("phonics_progress_" + studentId) : Promise.resolve(null),
  env.NET_PET_KV.get("session_history_" + studentId),
  env.NET_PET_KV.get("srs_data_" + studentId)
]);
```
These 8 reads happen cold on every request. CF KV cold reads = 30–200ms each. In parallel they resolve to ~150–400ms just for the reads, before `buildAgentPrompt()` even runs.

**Bug 2 — circuit breaker write race under concurrency (lines 1190 + 1193)**
```js
// On success:
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'closed');
// On error:
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'open', { expirationTtl: 60 });
```
Under 10-way concurrency: 10 simultaneous requests each do a KV `put` on the same key. CF KV has no locking. One of those writes occasionally conflicts and returns 500. The 2% error rate under load is this race, not a logic bug. The circuit breaker key should only be written by the canary (which runs every 5 minutes) — not by every token request.

---

## THE FIX — TWO CHANGES

### Change 1: Prompt cache (eliminates Bug 1)

**Insert before the 8-read `Promise.all` block:**
```js
// L6 PROMPT CACHE — check before doing 8 KV reads
const cacheKey = `prompt_cache:${studentId}:${sessionMode}`;
const cachedPrompt = env.NET_PET_KV ? await env.NET_PET_KV.get(cacheKey) : null;
if (cachedPrompt) {
  // Fast path: skip all 8 reads, use cached prompt directly
  const access_token = env.DEEPGRAM_API_KEY;
  const settings = buildVoiceSettings(sessionMode, cachedPrompt);  // see note below
  assertVoiceBrainLock(settings);
  return addCors(json({ token: access_token, settings, phonicsHint: null, lastSessionVocab: [], lastSessionTopic: null, ws_url: null }), request);
}
```

**After returning the token (inside the success path, after `assertVoiceBrainLock(settings)`), add a fire-and-forget cache write:**
```js
// Fire-and-forget: cache the built prompt for 5 minutes (no await — don't block the response)
if (env.NET_PET_KV) {
  const builtPrompt = buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData);
  env.NET_PET_KV.put(cacheKey, builtPrompt, { expirationTtl: 300 }).catch(() => {});
}
```

Wait — `buildAgentPrompt` is already called at line 1158. Don't call it twice. Instead, capture the result when it's first called and reuse it:

```js
// Change line 1158 from:
prompt: buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData),

// To — capture the result:
const _builtPrompt = buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData);
// ... then in the settings object:
prompt: _builtPrompt,

// And after assertVoiceBrainLock(settings), before the return:
if (env.NET_PET_KV) {
  env.NET_PET_KV.put(`prompt_cache:${studentId}:${sessionMode}`, _builtPrompt, { expirationTtl: 300 }).catch(() => {});
}
```

**Result:** First call of the day = full 8 reads + build = ~400ms. Every subsequent call within 5 minutes = 1 cache read = ~50ms.

---

### Change 2: Remove circuit breaker write from hot path (eliminates Bug 2)

**Delete lines 1190 and 1193 entirely:**
```js
// DELETE THIS (line 1190 — success path):
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'closed');

// DELETE THIS (line 1193 — error catch):
if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'open', { expirationTtl: 60 });
```

The canary (`canary-check.mjs`, running every 5 minutes via cron) already writes `circuit:deepgram:state`. That is the correct and only writer. Token requests should only READ it (line 1013 — keep that read, it's correct and fast).

**Removing the writes from the hot path:**
- Eliminates the concurrent write race → 2% error rate drops to 0%
- Removes 1 `await` KV write from every successful token request → ~30ms savings
- Removes 1 `await` KV write from every error path → same savings

---

## COMPLETE DIFF SUMMARY

```
src/index.js changes:

+ const cacheKey = `prompt_cache:${studentId}:${sessionMode}`;
+ const cachedPrompt = env.NET_PET_KV ? await env.NET_PET_KV.get(cacheKey) : null;
+ if (cachedPrompt) {
+   // fast path — skip 8 reads, return cached prompt
+   const access_token = env.DEEPGRAM_API_KEY;
+   const settings = { /* full settings object with prompt: cachedPrompt */ };
+   assertVoiceBrainLock(settings);
+   return addCors(json({ token: access_token, settings, phonicsHint: null, lastSessionVocab: [], lastSessionTopic: null, ws_url: null }), request);
+ }
  
  // ... existing 8-read Promise.all stays ...
  
- prompt: buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData),
+ const _builtPrompt = buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData);
  // in settings object:
+ prompt: _builtPrompt,
  
  // after assertVoiceBrainLock(settings):
+ if (env.NET_PET_KV) {
+   env.NET_PET_KV.put(`prompt_cache:${studentId}:${sessionMode}`, _builtPrompt, { expirationTtl: 300 }).catch(() => {});
+ }
  
- if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'closed');   // DELETE
  return addCors(json({ token: access_token, settings, ... }), request);
  
  } catch (err) {
-   if (env.NET_PET_KV) await env.NET_PET_KV.put('circuit:deepgram:state', 'open', { expirationTtl: 60 }); // DELETE
    return addCors(json({ error: err.message }, 500), request);
  }
```

---

## CRITICAL: FAST PATH SETTINGS OBJECT

The fast path (cache hit) needs to return a complete settings object with the correct voice brain lock fields. Copy the existing settings construction logic from the slow path. Do NOT hardcode — the settings object is built from `sessionMode` and other factors. The simplest approach:

Extract the settings-building code into a helper function (or just duplicate it in the fast path). The critical constraint: `assertVoiceBrainLock(settings)` MUST be called on whatever settings object is returned, even from the fast path. If you skip it, the pre-commit hook will not catch a brain lock violation on the cached path.

Minimal fast-path settings (if extracting feels risky — just use a static safe template):
```js
const settings = {
  type: "SettingsConfiguration",
  audio: { input: { encoding: "linear16", sample_rate: 16000 }, output: { encoding: "mp3", sample_rate: 24000, container: "none" } },
  agent: {
    listen: { provider: { type: "deepgram", model: "nova-3" } },
    think: { provider: { type: "open_ai", model: "gpt-4o-mini" }, instructions: cachedPrompt },
    speak: { provider: { type: "deepgram", model: "aura-2-zeus-en" } }
  }
};
```
This is the voice brain lock. Do not change `model`, `type`, or provider values. `assertVoiceBrainLock(settings)` will throw if anything is wrong.

---

## VERIFICATION GATES

After deploy to dev:

**Gate 1 — cache miss timing (first call, cold):**
```bash
time curl "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic&mode=free"
# expect: 200-500ms (slow path, builds + caches)
```

**Gate 2 — cache hit timing (second call, within 5 min):**
```bash
time curl "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic&mode=free"
# expect: 50-150ms (fast path, cache hit)
```

**Gate 3 — load test (should be 0 non-2xx now):**
```bash
node test/preflight-load.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
# expect: 0 non-2xx, p99 < 500ms
```

**Gate 4 — voice brain lock still holds:**
```bash
node test/voice-brain-lock.test.mjs
# expect: PASS
```

**Gate 5 — health voice still returns 200:**
```bash
curl https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/health/voice
# expect: {"ok":true,...}
```

---

## DO NOT TOUCH
- `assertVoiceBrainLock(settings)` — call it on every code path including fast path
- `think.provider.type = "open_ai"`, `think.model = "gpt-4o-mini"` — locked
- `listen.provider.model = "nova-3"` — locked
- `speak.provider.model = "aura-2-zeus-en"` — locked
- `listen.endpointing` — must remain absent (the Run 101 bug)
- The circuit breaker READ at line 1013 — keep it
- `env.NET_PET_KV` null guards — keep all of them (dev has no KV binding)

---

## EXPECTED OUTCOME
- Token latency: 1000ms avg → 50-150ms avg (cache hit path)
- 500 error rate under load: 2% → 0% (circuit writer race eliminated)
- Students on Vietnamese 4G: 1.6s to first OBI word → <600ms
- No change to voice quality, session behaviour, or student data
