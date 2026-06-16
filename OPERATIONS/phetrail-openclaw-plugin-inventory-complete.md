# PHEROMONE TRAIL — OPENCLAW PLUGIN INVENTORY (PART 2)
**Date:** 2026-06-17T00:35 ICT
**Strength: 80/100** | Type: RECON — plugin inventory continuation

---

## §1 ADDITIONAL ENABLED PLUGINS (lines 1338-2676)

| Plugin | ID | Purpose |
|--------|----|---------|
| kimi-coding | kimi | Kimi coding provider |
| litellm | litellm | LiteLLM proxy provider |
| lmstudio | lmstudio | Local LM Studio provider |
| memory-core | memory-core | Active memory system (memory: true) |
| microsoft | microsoft | Microsoft Speech provider |
| microsoft-foundry | microsoft-foundry | Microsoft Foundry provider |
| minimax | minimax | MiniMax provider |
| mistral | mistral | Mistral provider |
| moonshot | moonshot | Moonshot provider |
| nvidia | nvidia | NVIDIA provider |
| ollama | ollama | Ollama local LLM provider |
| openai | openai | OpenAI provider |
| opencode | opencode | OpenCode provider |
| opencode-go | opencode-go | OpenCode Go provider |
| openrouter | openrouter | OpenRouter aggregator |
| phone-control | phone-control | Phone control (sidecar) |
| qianfan | qianfan | Baidu Qianfan provider |
| qwen | qwen | Alibaba Qwen provider |
| runway | runway | Runway provider |
| senseaudio | senseaudio | SenseAudio provider |
| sglang | sglang | SGLang provider |
| stepfun | stepfun | StepFun provider |
| synthetic | synthetic | Synthetic provider |
| talk-voice | talk-voice | Talk voice (sidecar) |
| telegram | telegram | Telegram channel (98KB manifest — largest plugin) |

### ADDITIONAL DISABLED PLUGINS
| Plugin | ID | Notes |
|--------|----|-------|
| llm-task | llm-task | LLM task plugin |
| mattermost | mattermost | Mattermost chat channel |
| memory-wiki | memory-wiki | Wiki memory (sidecar) |
| migrate-claude | migrate-claude | Claude migration tool |
| migrate-hermes | migrate-hermes | Hermes migration tool |
| oc-path | oc-path | OpenCode path |
| perplexity | perplexity | Perplexity provider |
| policy | policy | Policy plugin (sidecar) |
| searxng | searxng | SearXNG search |
| signal | signal | Signal channel |
| skill-workshop | skill-workshop | Skill workshop (sidecar) |
| tavily | tavily | Tavily search |

---

## §2 TOTAL PLUGIN COUNT

**Enabled:** 33 plugins
**Disabled:** 18 plugins
**Total:** 51 plugins

**Largest plugin:** telegram (98,108 bytes manifest)

**Memory plugins:**
- memory-core: ENABLED (memory: true)
- memory-wiki: DISABLED
- active-memory: DISABLED

**Sidecar plugins (run as separate processes):**
- browser, device-pair, file-transfer, llm-task, memory-wiki, phone-control, policy, skill-workshop, talk-voice

---

## §3 FLAGS

1. **OPENCLAW_51_PLUGINS** — massive plugin surface
2. **OPENCLAW_TELEGRAM_98KB** — largest plugin, primary channel
3. **OPENCLAW_MEMORY_CORE** — active memory system enabled
4. **OPENCLAW_SIDECAR_9** — 9 sidecar plugins
5. **PLUGIN_INVENTORY_COMPLETE** — full inventory captured

---

`OPENCLAW PLUGIN INVENTORY COMPLETE SEALED — 2026-06-17T00:35 ICT | 51 PLUGINS TOTAL | 33 ENABLED | 18 DISABLED | TELEGRAM 98KB | MEMORY CORE ACTIVE`
