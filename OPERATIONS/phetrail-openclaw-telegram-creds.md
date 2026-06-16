# PHEROMONE TRAIL — OPENCLAW TELEGRAM CREDENTIALS
**Date:** 2026-06-17T00:32 ICT
**Strength: 85/100** | Type: RECON — Telegram auth state, user ID exposure

---

## §1 TELEGRAM CREDENTIAL FILES

### File 1: `telegram-default-allowFrom.json`
```json
{
  "version": 1,
  "allowFrom": ["6395643035"]
}
```
**Contents:** Michael's Telegram user ID in plaintext.

### File 2: `telegram-pairing.json`
```json
{
  "version": 1,
  "requests": []
}
```
**Contents:** Empty — no pending pairing requests.

---

## §2 TELEGRAM INTEGRATION STATUS

**Bot token:** `8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s` (from openclaw.json)
**Owner user ID:** `6395643035` (Michael's Telegram ID)
**Pairing state:** No pending requests — fully paired

**How it works:**
- Michael messages the OpenClaw Telegram bot
- Bot checks if sender ID matches allowFrom list
- If matched, command is processed
- If not matched, ignored

---

## §3 FLAGS

1. **OPENCLAW_TELEGRAM_USER_ID_EXPOSED** — Michael's Telegram ID in plaintext JSON
2. **OPENCLAW_TELEGRAM_PAIRED** — no pending requests, fully configured
3. **TELEGRAM_AS_CONTROL_CHANNEL** — primary remote interface for OpenClaw

---

`OPENCLAW TELEGRAM CREDENTIALS SEALED — 2026-06-17T00:32 ICT | USER ID IN PLAINTEXT | BOT TOKEN IN OPENCLAW.JSON | PAIRING COMPLETE`
