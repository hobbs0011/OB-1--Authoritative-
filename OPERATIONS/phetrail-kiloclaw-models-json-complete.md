# PHEROMONE TRAIL — KILOCLAW MODELS.JSON (PART 2)
**Date:** 2026-06-17T00:42 ICT
**Strength: 80/100** | Type: RECON — provider model inventory completion

---

## §1 MODELS.JSON REMAINING PROVIDERS (lines 2001-2309)

### HuggingFace (continued)
- Ends at line 2068 with `aisingapore/Qwen-SEA-LION-v4-32B-IT`, `pearl-ai/Gemma-4-31B-it-pearl`, `deepseek-ai/DeepSeek-V3.2-Exp`, `utter-project/EuroLLM-22B-Instruct-2512`
- API key reference: `HF_TOKEN` (env var, not plaintext)

### Cerebras (4 models)
| Model | Context | Cost |
|-------|---------|------|
| zai-glm-4.7 | 128000 | $2.25/$2.75 |
| gpt-oss-120b | 128000 | $0.35/$0.75 |
| qwen-3-235b-a22b-instruct-2507 | 128000 | $0.6/$1.2 |
| llama3.1-8b | 128000 | $0.1/$0.1 |

### Groq (2 models)
| Model | Context | Cost |
|-------|---------|------|
| llama-3.3-70b-versatile | 131072 | Free |
| openai/gpt-oss-20b | 131072 | Free |

### OpenRouter (3 models)
| Model | Context | Cost |
|-------|---------|------|
| openrouter/auto | 200000 | Free |
| moonshotai/kimi-k2.6 | 262144 | $0.8/$3.5 |
| moonshotai/kimi-k2.5 | 262144 | $0.44/$2 |

### GitHub Copilot
- Empty models array — uses OAuth token, not API key

### Dialagram (12 models — PRIMARY PROVIDER)
| Model | Context |
|-------|---------|
| qwen-3.7-max | 131072 |
| qwen-3.7-max-thinking | 131072 |
| qwen-3.6-max-preview | 131072 |
| qwen-3.6-max-preview-thinking | 131072 |
| qwen-3.7-max-preview | 131072 |
| qwen-3.7-max-preview-thinking | 131072 |
| qwen-3.6-plus | 131072 |
| qwen-3.6-plus-thinking | 131072 |
| qwen-3.5-plus | 131072 |
| qwen-3.5-plus-thinking | 131072 |
| qwen-3.5-omni-plus | 131072 (multimodal) |

---

## §2 TOTAL MODEL COUNT

**HuggingFace:** ~100 models
**Cerebras:** 4 models
**Groq:** 2 models
**OpenRouter:** 3 models
**Dialagram:** 12 models
**TOTAL:** ~121 models across 6 providers

---

## §3 FLAGS

1. **KILOCLAW_121_MODELS** — total model count
2. **KILOCLAW_DIALAGRAM_PRIMARY** — 12 Qwen models, 131072 context
3. **KILOCLAW_HUGGINGFACE_DOMINANT** — ~100 free models via HuggingFace Router

---

`KILOCLAW MODELS.JSON COMPLETE SEALED — 2026-06-17T00:42 ICT | 6 PROVIDERS | 121 MODELS | DIALAGRAM 12 QWEN | HUGGINGFACE ~100 FREE`
