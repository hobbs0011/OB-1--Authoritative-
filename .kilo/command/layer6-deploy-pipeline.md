# layer6-deploy-pipeline.md — Layer 6 KV Perf Deploy Pipeline

## Code Changes (4 in src/index.js)

1. **Line ~1019** — Add prompt cache key definition: `prompt_cache:{studentId}:{mode}`
2. **Line ~1023** — KV read with `cacheTtl: 300` before Promise.all
3. **Line ~1205** — Fire-and-forget cache write after successful payload build
4. **Lines ~1190, 1193** — DELETE circuit:deepgram:state writes (moved to canary)

## Local Checks (2)

```powershell
# Check 1 — Syntax
node --check src/index.js

# Check 2 — Cache logic compiles
node -e "const s = require('./src/index.js'); console.log('module loads')"
```

## Deploy Dev

```powershell
# Deploy to dev
cd APPS/NET-PET-AI
npx wrangler deploy --env=dev
```

## Dev Gates (4)

| Gate | Check | Expected |
|------|-------|----------|
| 1 | Cache miss timing | >500ms (full KV path) |
| 2 | Cache hit timing | <100ms (cached read) |
| 3 | Load test 0 500s | 50 requests, 0 non-2xx |
| 4 | WS round-trip still green | preflight-ws.mjs passes |

### Dev Gate Commands

```powershell
# Gate 1 — Initial call (cache miss)
$sw = Get-Date; Invoke-RestMethod "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic"; "Elapsed: $((Get-Date) - $sw)"

# Gate 2 — Second call (cache hit)  
$sw = Get-Date; Invoke-RestMethod "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic"; "Elapsed: $((Get-Date) - $sw)"

# Gate 3 — Load test
node test/preflight-load.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev

# Gate 4 — WS round-trip
node test/preflight-ws.mjs https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev
```

**Dev FAIL → HALT, fix, repeat from Step 3**

## Promote Prod

```powershell
# Promote to prod
npx wrangler deploy --env=""
```

## Prod Gates (4)

Same checks as Dev, but against `https://net-pet-ai.mrmichaelhobbs123.workers.dev`:

| Gate | Check | Expected |
|------|-------|----------|
| 1 | Cache miss timing | >500ms |
| 2 | Cache hit timing | <150ms |
| 3 | Load test 0 500s | 50 requests, 0 non-2xx |
| 4 | WS round-trip green | preflight-ws.mjs passes |

## Health Endpoint Confirm

```powershell
# Final confirmation
$r = Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/health/voice"
$r.ok -eq $true && $r.gates[5].ok -eq $true
```

**Prod FAIL → AUTOMATIC ROLLBACK via post-deploy-verify.mjs**

---

## Failure Table

| Failure Mode | Symptom | Fix |
|------------|---------|-----|
| Cache key typo | Cache never hits, latency unchanged | Check `prompt_cache:{studentId}:{mode}` key |
| Cache write before assert | Cache stored with wrong brain lock | Move cache write AFTER assertVoiceBrainLock |
| Circuit writes still in hot path | 500s under concurrent load | DELETE lines 1190 + 1193 |
| KV binding missing in dev | Cache returns undefined | Guard with `if (env.NET_PET_KV)` |
| Promise.all inside cache hit path | Never reached | Early return on cache hit |
| Cache TTL < 60 | KV rejects write | TTL >= 60 seconds (use 300) |

---

## Constraints

**Brain Lock Hardcoded (DO NOT CHANGE):**
```javascript
think:  { type: "open_ai", model: "gpt-4o-mini" }  // in-house Deepgram
listen: { type: "deepgram", model: "nova-3" }
speak:  { type: "deepgram", model: "aura-2-zeus-en" }
```

**Cache Key Format:** `prompt_cache:{studentId}:{mode}` where mode = `free|study|phonics`

**Cache TTL:** 300 seconds (5 minutes)

**No circuit writes in hot path** — Canary owns `circuit:deepgram:state`