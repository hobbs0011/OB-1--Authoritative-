# Kilo Model Decision Matrix — Wired & Actionable
> Source of truth. Verified: 2026-07-12 | 340 total models | 11 free | 5 auto tiers
> Rule: Edit this first. Then wire into `.kilo/kilo.json`.

## Immediate Actions Available Right Now

| What you want | Model to wire | Provider state | Action |
|---------------|---------------|----------------|--------|
| Deterministic free coding | `stepfun/step-3.7-flash:free` | **Not yet configured** | Add StepFun provider (free tier) to `.kilo/kilo.json` |
| Best available free | `kilo-auto/free` | ✅ Active default | **Risk:** routes to NVIDIA, logs prompts |
| Code-specific agentic | `poolside/laguna-m.1:free` | **Not yet configured** | Add Poolside provider or enable via Kilo Gateway |
| Long context reasoning | `nvidia/nemotron-3-ultra-550b-a55b:free` | **Not yet configured** | ⚠️ Logs prompts — trial only |
| Existing free fallback | `deepseek/deepseek-v4-flash` | ✅ Configured | Use now, no changes needed |

## Per-Model Wiring Instructions

### 1. `stepfun/step-3.7-flash:free`
- **Why:** Deterministic, no prompt logging, 262k context, multimodal
- **How to wire:**
  ```json
  "stepfun": {
    "options": { "apiKey": "YOUR_STEPFUN_KEY" },
    "models": {
      "stepfun/step-3.7-flash:free": { "name": "[FREE] Step 3.7 Flash — Daily coding, deterministic" }
    }
  }
  ```
- **Get key:** https://platform.stepfun.com — free tier available
- **Fallback if no key:** Use `kilo-auto/free`, accept routing variance

### 2. `poolside/laguna-m.1:free`
- **Why:** Code-heavy tasks, agentic workflows, 262k context
- **How to wire:**
  ```json
  "poolside": {
    "options": { "apiKey": "YOUR_POOLSIDE_KEY" },
    "models": {
      "poolside/laguna-m.1:free": { "name": "[FREE] Laguna M.1 — Code heavy" }
    }
  }
  ```
- **Get key:** https://poolside.ai — free tier available
- **Alternative:** Enable via Kilo Gateway if account linked

### 3. `deepseek/deepseek-v4-flash` (already wired)
- **Why:** Existing key works, fast, low cost
- **How to use:** Already in `.kilo/kilo.json` under `provider.openrouter`
- **Change default to this:**
  ```json
  "model": "deepseek/deepseek-v4-flash"
  ```

### 4. `kilo-auto/free` (current default)
- **Why now:** Zero config, rotates
- **Guardrail:** May route to NVIDIA, which logs prompts. Do not use for sensitive inputs.
- **If acceptable:** Keep as default
- **If not acceptable:** Pin to `stepfun/step-3.7-flash:free` or `openrouter/free`

### 5. NVIDIA free models
- **Status:** Trial only, logs prompts per NVIDIA API Trial Terms
- **Wiring:** Requires NVIDIA NGC API key
- **Hard rule:** Never use for personal/confidential data. Not debatable.

### 6. `openrouter/free`
- **How to wire:**
  ```json
  "openrouter": {
    "options": { "apiKey": "EXISTING_KEY" },
    "models": {
      "openrouter/free": { "name": "[FREE] OpenRouter Best Available — Random rotation" }
    }
  }
  ```
- **Note:** May work with existing OpenRouter key; verify before relying

## Recommended Wiring Priority

1. **Add `stepfun/step-3.7-flash:free`** — highest impact, deterministic, no logging
2. **Set default `model` to `stepfun/step-3.7-flash:free`** instead of auto router
3. **Keep `deepseek/deepseek-v4-flash` as fallback** — already wired, reliable
4. **Add `poolside/laguna-m.1:free`** for code-heavy runs
5. **Nuke `kilo-auto/free` from default** unless prompt-logging risk accepted

## Rules

1. **Edit this file first** before changing `kilo.json`.
2. **Get free API keys** for StepFun and Poolside before wiring.
3. **Never wire NVIDIA free** for non-public data.
4. **Re-run audit** after adding providers: `SCRIPTS/kilo-free-model-audit.ps1`
5. **Keep current paid Claude tiers** (`claude-sonnet-4-6`, `claude-opus-4-8`) — they bypass free-tier rate limits.
