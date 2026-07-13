# KILOCLAW STANDARD OPERATING PROCEDURE
**Status:** ACTIVE | CANONICAL | NON-NEGOTIABLE  
**Authority:** SOV100 Michael Hobbs  
**Last Updated:** 2026-07-12  
**Run Context:** SupplyLines KiloClaw Integration Pipeline

---

## §1 IDENTITY

- **KiloClaw** = Phoenix-Centurion fork of Kilo/OpenCode
- **Dashboard URL:** https://i-a947dc7776e34f8d86d7fc3c24d694b9.kiloclaw.ai
- **Gateway Port:** 18789
- **Default Model:** `kilo-auto/free` (Minimax M2.5 + StepFun Step-3.5 via KiloClaw subscription)
- **Telegram Bot:** `@Phoenix_Centurion_Bot`
- **Bot Token:** `8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s` (ROTATE VIA BOTFATHER ONLY)

---

## §2 ARCHITECTURE

### Canonical Topology
```
┌─────────────────────────────────────────────────────────────┐
│                    OB-1 CANONICAL REPO                       │
│                     D:\OB-1-CANONICAL                        │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Local OpenClaw│    │ KiloClaw VM  │    │  Telegram    │  │
│  │ (MCP bridge)  │───▶│ (Gateway)    │───▶│  Bot         │  │
│  │ Port 18789    │    │ Port 18789   │    │  @Phoenix_   │  │
│  │ Startup item  │    │ Always-on    │    │  Centurion   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │         │
│         └────────────────────┼────────────────────┘         │
│                              │                              │
│                    ┌─────────▼─────────┐                    │
│                    │   KiloClaw API    │                    │
│                    │   (Dashboard)     │                    │
│                    │   Model routing   │                    │
│                    └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities
| Layer | System | Role | Status |
|-------|--------|------|--------|
| D1 | KiloClaw Dashboard | Model routing, Telegram gateway, API proxy | **PENDING CONFIG** |
| D2 | Local OpenClaw | MCP bridge to Claude Code only | INSTALLED |
| D3 | Telegram Bot | Operator messaging, session alerts, pipeline notifications | PAIRED |
| D4 | OB-1 Pipeline | SupplyLines, Ledger, DNA, Starmap, Pheromones | LIVE |

---

## §3 STANDARD OPERATING PROCEDURES

### 3.1 KiloClaw Dashboard Configuration (MICHAEL ACTION REQUIRED)

**This is the #1 unresolved action item since Run 10.**

1. Navigate to: https://i-a947dc7776e34f8d86d7fc3c24d694b9.kiloclaw.ai
2. Go to **Settings** → **Telegram Bot Token**
3. Paste: `8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s`
4. Set default model: `kilo-auto/free`
5. Click **Save** → **Redeploy**

**Verification:** After redeploy, send test message to `@Phoenix_Centurion_Bot` and confirm KiloClaw responds.

### 3.2 Model Fallback Chain (Telegram)

KiloClaw MUST follow this fallback order for Telegram sessions:
1. `kilo-auto/free` (Minimax M2.5 + StepFun Step-3.5) — PRIMARY
2. `openrouter/moonshotai/kimi-k2.5` (free, 28 models on OpenRouter) — SECONDARY
3. `google/gemini-2.5-flash-lite` (free 1,500/day) — TERTIARY
4. `llm7.io` (no auth, 40 RPM anonymous) — LAST RESORT

**Law:** Never fall back to paid models on Telegram without explicit operator approval.

### 3.3 OpenClaw Local Gateway

- **Installation:** `openclaw@2026.5.22` at `C:\Users\mrmic\AppData\Roaming\npm\openclaw.cmd`
- **Config:** `~\.openclaw\openclaw.json`
- **Daemon:** `C:\Users\mrmic\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\OpenClaw Gateway.cmd`
- **Port:** 18789
- **Role:** MCP bridge to Claude Code ONLY. NOT the Telegram gateway.
- **Model:** `kilo-auto/free` or `kilo-auto/balanced` (never deepseek-v4-flash for local gateway)

### 3.4 MCP Wiring (Pending)

`.claude/settings.json` must include OpenClaw MCP server for persistent memory bridge.

**Target config:**
```json
{
  "mcpServers": {
    "openclaw": {
      "command": "openclaw",
      "args": ["mcp", "serve"],
      "env": {
        "OPENCLAW_API_KEY": "<from kiloclaw dashboard>"
      }
    }
  }
}
```

### 3.5 Telegram Gateway Migration

**Current State:** Telegram paired with LOCAL OpenClaw (port 18789)  
**Target State:** Telegram gateway runs on KILOCLAW DASHBOARD (Phoenix-Centurion VM)

**Migration Steps:**
1. Configure KiloClaw dashboard Telegram bot token (3.1 above)
2. Unpair Telegram from local OpenClaw
3. Pair Telegram with KiloClaw dashboard
4. Verify message routing: Operator → Telegram → KiloClaw → Model → Telegram → Operator
5. Update all pipeline docs to reference KiloClaw as canonical Telegram gateway

---

## §4 INTEGRATION POINTS

### 4.1 SupplyLines Pipeline

All 6 stages of SupplyLines now include KiloClaw awareness:

| Stage | KiloClaw Action |
|-------|-----------------|
| I — EXPLORATORES | Scout KiloClaw dashboard + Telegram bot status |
| II — ANTECORES | Verify KiloClaw model catalog, pricing, availability |
| III — AGMEN | Extract KiloClaw-specific keywords, update system docs |
| IV — AGMEN NOVISSIMUM | Cross-check KiloClaw references, validate no duplicates |
| V — PRAESIDIA | Verify KiloClaw artifacts in pipeline, merkle roots |
| VI — LIMITANEI | Health sweep includes KiloClaw dashboard + Telegram reconnect |

### 4.2 Pipeline Script

**Canonical script:** `SCRIPTS/kiloclaw-integration-pipeline.ps1`

```powershell
# Status
pwsh -File SCRIPTS/kiloclaw-integration-pipeline.ps1 -Stage status

# Full march
pwsh -File SCRIPTS/kiloclaw-integration-pipeline.ps1 -Stage full-march

# Telegram reconnect only
pwsh -File SCRIPTS/kiloclaw-integration-pipeline.ps1 -Stage telegram-reconnect
```

### 4.3 Pheromone Trails

Every KiloClaw pipeline execution writes a phetrail:
- **Path:** `CANON/PHEROMONES/PheTrail-run{N}.json`
- **Stage key:** `kiloclaw-integration-status` | `kiloclaw-integration-full-march` | `telegram-reconnect`
- **Required fields:** `schema_version`, `run_number`, `stage`, `head_sha`, `soulcount`, `extracted_at`, `payload`

---

## §5 FREE MODEL META (KiloClaw Subscription)

| Provider | Model | Daily Free | Notes |
|----------|-------|------------|-------|
| KiloClaw | `kilo-auto/free` | Unlimited (subscription) | Minimax M2.5 + StepFun Step-3.5 |
| Cerebras | `cerebras/llama3.3-70b` | 1M tokens | No CC, native OpenClaw support |
| Groq | `groq/llama-3.3-70b-versatile` | 500k tokens | No CC |
| SambaNova | `sambanova/deepseek-r1` | 20M tokens | Dev tier |
| OpenRouter | `openrouter/moonshotai/kimi-k2.5` | 200 req/day | 28 free models |
| LLM7.io | `llm7/...` | 40 RPM | No auth, always-on fallback |

**Law:** KiloClaw subscription models take priority over free-tier models for operator sessions.

---

## §6 FAILURE PROTOCOLS

| Failure | Response |
|---------|----------|
| KiloClaw dashboard unreachable | HALT. Do not advance. Alert operator via alternative channel. |
| Telegram bot invalid | HALT. Bot token rotation required via BotFather. |
| Local OpenClaw dead | WARN. Continue with KiloClaw direct. Local is MCP bridge only. |
| Model ID not recognized | WARN. Fallback to `openai/` prefix. Log to phetrail. |
| MCP wiring missing | WARN. Document but do not block pipeline. |

---

## §7 UPDATES TO OTHER DOCS

This SOP supersedes and updates:
- `CANON/REINCARNATION/2026-05-24-run10-openclaw-telegram-spiral.md` — See this file for historical context only. Current SOP is this document.
- `CANON/SYSTEM/COLD-START-BOOT.md` — Updated with KiloClaw as standard component.

**Amendment authority:** SOV100 Michael Hobbs only.
