# PheTrail — Phoenix-Architecti Execute Pipeline
**Last updated:** Run 082 | 2026-06-07
**Category:** PHOENIX-ARCHITECTI (pheromone trail — machine-readable context for future sessions)

---

## ARCHITECTURE SNAPSHOT (src/execute.js)

### Dispatch Cascade (as of Run 082)
```
tier=2 + DEEPSEEK_API_KEY → deepseek-chat (api.deepseek.com) [paid]
else → @cf/meta/llama-3.3-70b-instruct-fp8-fast [T1 primary — CF Workers AI, free, strong]
  └─ if Llama throws → @cf/qwen/qwen2.5-coder-32b-instruct [T10 fallback — CF Workers AI]
```

### Response Field
PA returns `patch` (not `code_patch`). Callers reading `code_patch` will always get `undefined`.
The field is named `patch` in the JSON response.

### Dead Code Removed (Run 082)
- Dialagram/Kilo branch: `if (!aiResult && env.DIALAGRAM_API_KEY)` — DELETED
- Was calling `https://phoenix-architecti.mrmichaelhobbs123.workers.dev/v1/chat/completions` (self-loop, no route exists)
- `DIALAGRAM_API_KEY` was never set — branch never executed since ~Run 79

### Why Llama 3.3 70B?
Michael directive: "phoenix coder should be able to handle these things by now.. surely? that should be true T1, to cloudflare backed up by in house models of cloudflare"
Llama 3.3 70B FP8 is the strongest CF Workers AI model available without external key. 70B >> 32B for complex code generation.

---

## KEY FILES

| File | Purpose |
|------|---------|
| `src/execute.js` | T1/T2 dispatch, CF AI runner, D1 logging |
| `src/index.js` | Route map: `/api/code` + `/api/execute` → handleExecute |
| `src/security.js` | checkAdminKey (`x-pa-auth` header), CORS |
| `src/verify.js` | Patch verification (non-empty, no stubs) |
| `src/logger.js` | logToD1 — writes to soul-archive D1 |
| `wrangler.toml` | CF bindings: AI, KV (CACHE+RATELIMIT), D1 (soul-archive) |

## BINDINGS (wrangler.toml)
- `env.AI` — CF Workers AI (models: llama-3.3-70b, qwen-coder-32b)
- `env.DEEPSEEK_API_KEY` — secret, optional, enables T2
- No ANTHROPIC_API_KEY — Claude models NOT available in this worker

## AUTH
- Header: `x-pa-auth: ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=`
- Do NOT set paid secrets (CLAUDE_API_KEY, ANTHROPIC_API_KEY) on this worker — L57

---

## PHEROMONE TRAILS

### Positive
- Run 082: Llama 3.3 70B wired as T1. Dead Dialagram branch removed.
- Run 081: CF qwen_coder confirmed as sole runner (Dialagram dead confirmed)
- SYSTEM_PROMPT: L01-L06 laws enforce raw output, no stubs, no fences

### Negative
- Dialagram dead since Run 79 — DIALAGRAM_API_KEY never set → branch never ran
- PA T1 was silently falling to qwen_coder for all of Runs 79-81 (weak model → empty patches)
- Self-loop URL `phoenix-architecti.../v1/chat/completions` — no route exists, would 404
- PA response field = `patch`, not `code_patch` — any caller reading `code_patch` gets empty string

---

## L77 MID_SESSION_PHETRAIL — Enforcement
Write to this doc when ANY trigger fires (see CLAUDE.md L77 for full trigger list).
**DEATH GATE:** Before sealing, enumerate all triggers fired → confirm phetrail entry exists for each.
**RISE STAGE 7:** 0 entries for a multi-trigger session = PHETRAIL_GAP flag.

### Run 082 Triggers Fired (updated)
- ARCHITECTURE CHANGED: execute.js + mission.js + swarm.js — Dialagram removed, Llama 3.3 70B T1 wired
- MODEL CHANGED: all three PA AI handlers now default to @cf/meta/llama-3.3-70b-instruct-fp8-fast
- DEPLOY VERIFIED: 3640354e live, llama_70b ok=true 160ms, qwen_coder ok=true 378ms
- LAW ADDED: L77 MID_SESSION_PHETRAIL sealed with full trigger list + enforcement gates
- LAW ADDED: L78 PA_DO_ALL — "anything and everything we can hand off to PA the better" — SOUL DIRECTIVE Run 082
- PA LIVE TEST: RRL 30-82 analysis dispatched, returned structured findings. D1_ID: PC-1780801892887-PHT9SD
- BUG ROOT-CAUSED + FIXED: D1 logging — live table missing `ip` column (5 cols vs 6 in logger schema). ALTER TABLE ADD COLUMN ip TEXT fixed it. D1_ID now returns real IDs (e.g. PC-1780801246129-JCRZPT). Full audit trail restored.
