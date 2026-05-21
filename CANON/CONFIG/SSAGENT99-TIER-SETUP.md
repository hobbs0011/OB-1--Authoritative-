# SSAgent99 Tier System — Setup 2026-05-21
# Run SS Agent99 tier probes against each endpoint after reload

## Tier 1 — Step 3.5 Flash (free in Kilo)
# Model: step-3.5-flash
# API: StepFun gateway via stepfun provider in kilo.jsonc
# Cost: FREE in Kilo
# Status: PENDING — need StepFun API key (env:STEPFUN_API_KEY)
# Action: Obtain from StepFun dashboard, set env, reload VS Code

## Tier 2 — DeepSeek V4 Flash (new key, working)
# Model: deepseek-v4-flash
# Key: sk-d76a331cc55c424ba2afbf08f0e12984
# BaseURL: https://api.deepseek.com/v1
# Status: LIVE — 400 model-name fix applied

## Tier 3 — DeepSeek V4 Pro (same acct, heavier lifts)
# Model: n-v4-pro
# Key: sk-d76a331cc55c424ba2afbf08f0e12984 (same account)
# BaseURL: https://api.deepseek.com/v1
# Status: LIVE — 400 model-name fix applied

## Tier 4 — Gemini 3.5 Flash (no $$ loaded)
# Model: gemini-2.5-flash (via Gemini API)
# Key: AIzaSyApHRA8FIfnyl6OJihqZC9ZvHeSJFcWczw
# Status: KEY LIVE — model test PASS — no billing added yet
# WARNING: will 429/hard-block without credit. Do not call Tier 4 until loaded.

## Live endpoints (verify after reload)
# PHOENIX-CODER: https://n-coder.mrmichaelhobbs123.workers.dev/api/status
# SOUL-LOGGER:   https://n-logger.mrmichaelhobbs123.workers.dev/api/health
# SSHEartbeat:   n heartbeat probe with tier indicator
