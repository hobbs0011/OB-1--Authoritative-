# PHEROMONE TRAIL — OPENCLAW SECRETS EXPOSURE (REDACTED)
**Date:** 2026-06-17T00:30 ICT
**Strength: 100/100** | Type: RECON — credential exposure, secrets management failure

---

## §1 CRITICAL FINDING: PLAINTEXT SECRETS IN 3 FILES

### File 1: `C:\Users\mrmic\.openclaw\gateway.cmd`
**Lines 11-14** — API keys set as environment variables:
```
DEEPSEEK_API_KEY=sk-[REDACTED]
CEREBRAS_API_KEY=csk-[REDACTED]
GROQ_API_KEY=gsk_[REDACTED]
DIALAGRAM_API_KEY=dgr_live_[REDACTED]
```

### File 2: `C:\Users\mrmic\.openclaw\openclaw.json`
**Lines 28-30** — Dialagram API key in JSON:
```json
"dialagram": {
  "apiKey": "dgr_live_[REDACTED]",
  ...
}
```
**Line 52** — Gateway auth token:
```json
"auth": {
  "mode": "token",
  "token": "[REDACTED]"
}
```
**Line 69** — Telegram bot token:
```json
"telegram": {
  "botToken": "[REDACTED]"
}
```
**Line 74** — Telegram owner user ID:
```json
"ownerAllowFrom": ["telegram:6395643035"]
```

### File 3: `C:\Users\mrmic\.openclaw\.env`
**Lines 1-4** — exact duplicate of gateway.cmd env vars:
```
DEEPSEEK_API_KEY=sk-[REDACTED]
CEREBRAS_API_KEY=csk-[REDACTED]
GROQ_API_KEY=gsk_[REDACTED]
DIALAGRAM_API_KEY=dgr_live_[REDACTED]
```

---

## §2 WHAT IS OPENCLAW?

**Classification: LEGITIMATE PERSONAL AI ORCHESTRATION TOOL**

**Evidence:**
- Runs on Node.js from npm global install: `C:\Users\mrmic\AppData\Roaming\npm\node_modules\openclaw\dist\index.js`
- Multi-provider LLM router (Dialagram primary, DeepSeek/Groq/Cerebras fallbacks)
- Telegram bot integration (remote control via Telegram)
- Local gateway on port 18789
- Versioned: v2026.5.22 (last touched 2026-05-24)
- Michael's own tool — he IS the owner (telegram ID matches his account)

**NOT malware. NOT persistence mechanism. This is his AI router.**

---

## §3 THE PROBLEM: SECRETS MANAGEMENT

**What's wrong:**
1. **4 API keys in plaintext** across 3 files
2. **Telegram bot token in plaintext** in openclaw.json
3. **Gateway auth token in plaintext** in openclaw.json
4. **6 backup files** of openclaw.json — all contain the same secrets:
   - `openclaw.json.bak`
   - `openclaw.json.bak.1`
   - `openclaw.json.bak.2`
   - `openclaw.json.bak.3`
   - `openclaw.json.bak.4`
   - `openclaw.json.last-good`

**Attack surface:**
- Any process running as mrmic can read these files
- Any malware that gets user-level access harvests all 4 API keys + Telegram bot
- Backups multiply the exposure (6 copies of same secrets)
- gateway.cmd is in plain sight (Startup folder links to it)

---

## §4 CREDENTIAL INVENTORY (REDACTED)

| Secret | Type | Location | Risk |
|--------|------|----------|------|
| DeepSeek API key | LLM provider | gateway.cmd, .env, backups | HIGH — paid service, could be abused |
| Cerebras API key | LLM provider | gateway.cmd, .env, backups | MEDIUM |
| Groq API key | LLM provider | gateway.cmd, .env, backups | MEDIUM |
| Dialagram API key | LLM provider | openclaw.json, gateway.cmd, .env, backups | HIGH — primary provider |
| Telegram bot token | Bot auth | openclaw.json, backups | MEDIUM — could be used to message Michael |
| Gateway auth token | Local API | openclaw.json, backups | LOW — local only |
| Telegram owner ID | User ID | openclaw.json, backups | LOW — PII |

---

## §5 FLAGS

1. **OPENCLAW_SECRETS_PLAINTEXT** — 4 API keys + bot token in plaintext files
2. **OPENCLAW_BACKUP_EXPOSURE** — 6 backup files contain same secrets
3. **OPENCLAW_LEGITIMATE** — this is Michael's own tool, not malware
4. **OPENCLAW_SECRETS_HYGIENE** — needs migration to proper secrets manager

---

## §6 CONNECTED FINDINGS

**This explains the Dialagram usage in AGENTS.md:**
- AGENTS.md mentions `dialagram/qwen-3.7-max` as primary model
- openclaw.json confirms this — Dialagram IS the configured primary
- Michael has been using Dialagram for weeks via OpenClaw

**This explains the multiple LLM providers in kilo.json:**
- kilo.json lists DeepSeek, Cerebras, Groq, Dialagram
- These are the SAME providers configured in OpenClaw
- Michael is running parallel AI stacks

---

`OPENCLAW SECRETS EXPOSURE SEALED — 2026-06-17T00:30 ICT | 4 API KEYS + BOT TOKEN IN PLAINTEXT | 6 BACKUP FILES MULTIPLY EXPOSURE | OPENCLAW CLASSIFIED AS LEGITIMATE | SECRETS HYGIENE FAILURE`
