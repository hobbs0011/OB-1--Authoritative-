# DEPLOY REQUEST - net-pet-ai LIVE BUG (engineer/supplyline handoff)

Priority: BLOCKING - /api/deepgram-token returns 500 for ALL students, all modes. Voice chat broken.

## Root cause (verified against LIVE bundle, not repo)
assertVoiceBrainLock() requires ALL THREE providers (listen/speak/think) type "deepgram". The settings
builder was emitting think.provider.type = "open_ai" => throws => 500. Repo source is STALE vs deployed;
the deployed worker is newer. MAP != TERRAIN.

## Fix (model alignment - all three providers)
  think:  { type: "deepgram", model: "gemini-3.1-flash-lite" }
  listen: { type: "deepgram", model: "flux-general-en", version: "v2" }
  speak:  { type: "deepgram", model: "aura-2-odysseus-en" }
These match the worker's own /api/health/voice BRAIN_LOCK. (First pass only flipped open_ai->deepgram
keeping gpt-4o-mini - WRONG: gpt-4o-mini is an OpenAI model name.) KV prompt cache is safe: assert runs
before cache-write, broken settings never cached (300s TTL anyway).

## Artifact
NET-PET-AI/deploy/net-pet-ai-fixed.router.js - the EXACT live prod bundle + the fix, CLEAN (validated
with esbuild). sha256 5c5b94f6b71f3f25d85337ecd2e7891276cee3a9ed5658abb5eb2e4f5def7a3a.
Do NOT rebuild from src/index.js (STALE). Do not re-add the trailing boundary junk.

## Deploy options
1) wrangler (preferred, when available):
   cd NET-PET-AI && wrangler deploy --name net-pet-ai   # wrangler.toml now points main at the fixed bundle
2) CF Workers Scripts API (verified working, no wrangler needed):
   PUT /accounts/{ACCOUNT}/workers/scripts/{name}/script?bindings_inherit=strict&excludeScript=true
   multipart: part 1 "metadata" (application/json): main_module=router.js, compatibility_date=2026-03-16,
     compatibility_flags=[nodejs_compat], usage_model=standard, keep_assets=true,
     keep_bindings=["secret_text","plain_text","json"], bindings=[all NON-secret bindings verbatim from
     the live version's resources - DO bindings by namespace_id, KV by namespace_id, D1 by id, queue by name, assets]
   part 2 "router.js" (application/javascript+module) = the bundle bytes
   Secrets preserved via keep_bindings; assets preserved via keep_assets:true.

## Verify after deploy
  curl -s "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=<real-student>&mode=demo"
  expect 200 + settings.agent.think.provider.model == "gemini-3.1-flash-lite"
  Also: /api/health 200, GET / (portal HTML) still 200, /chat.js still 200 (assets intact).

## CI (fixed in this commit)
.github/workflows/deploy-net-pet-ai.yml: path APPS/NET-PET-AI/ -> NET-PET-AI/, deploys the fixed bundle
via wrangler.toml main, adds a /api/deepgram-token guardrail. Still needs CLOUDFLARE_API_TOKEN +
CLOUDFLARE_ACCOUNT_ID repo secrets (currently ZERO - CI cannot run until added).
