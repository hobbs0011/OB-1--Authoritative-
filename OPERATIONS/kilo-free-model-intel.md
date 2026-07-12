# Kilo Free Model Intelligence — Live Intel
> Auto-refreshed from `https://api.kilo.ai/api/gateway/models`

## Verified Free Models (2026-07-12)
| Model ID | Provider | Context | Notes |
|----------|----------|---------|-------|
| `tencent/hy3:free` | Tencent | 262,144 | New free entry |
| `stepfun/step-3.7-flash:free` | StepFun | 262,144 | Your previous fixed choice |
| `poolside/laguna-xs-2.1:free` | Poolside | 262,144 | Newer Laguna variant |
| `cohere/north-mini-code:free` | Cohere | 256,000 | Code-focused |
| `nvidia/nemotron-3.5-content-safety:free` | NVIDIA | 128,000 | Trial, logs prompts |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | NVIDIA | 1,000,000 | Trial, logs prompts |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | NVIDIA | 256,000 | Reasoning variant |
| `poolside/laguna-m.1:free` | Poolside | 262,144 | Code-focused |
| `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA | 1,000,000 | Trial, logs prompts |
| `openrouter/free` | OpenRouter | 200,000 | Best available at runtime |
| `kilo-auto/free` | Kilo Gateway | 256,000 | Dynamic router over free pool |

## Auto Tiers
| Tier | Routing Strategy |
|------|-----------------|
| `kilo-auto/frontier` | Best paid models |
| `kilo-auto/balanced` | Cost/capability balance |
| `kilo-auto/efficient` | Cheapest capable model |
| `kilo-auto/free` | Best free model per session |
| `kilo-auto/small` | Small/fast model |

## Decision Rules
| Need | Pick | Why |
|------|------|-----|
| Consistency/reproducibility | `stepfun/step-3.7-flash:free` | Fixed model identity |
| Best available free now | `kilo-auto/free` | Server picks strongest per session |
| Code tasks | `poolside/laguna-m.1:free` or `cohere/north-mini-code:free` | Code-optimized |
| Long context free | `nvidia/nemotron-3-ultra-550b-a55b:free` | 1M ctx |
| Avoid prompt logging | Avoid NVIDIA via Auto Free | Data handling warning |
| High-volume automation | Monitor `kilo.ai/models` live | Catalog rotates |

## Rate Limits
- Anonymous: 200 req/hour per IP
- Authenticated: higher via Kilo account
