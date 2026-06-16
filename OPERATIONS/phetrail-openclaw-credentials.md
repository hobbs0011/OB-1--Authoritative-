# PHEROMONE TRAIL — OPENCLAW CREDENTIALS
**Date:** 2026-06-17T00:31 ICT
**Strength: 90/100** | Type: RECON — credential storage, pairing state

---

## §1 CREDENTIALS DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\credentials\`
**Contents:**
- `telegram-default-allowFrom.json`
- `telegram-pairing.json`

**Assessment:** Telegram pairing/authentication state stored here. These files likely contain Telegram user IDs, session tokens, or pairing codes.

**Risk:** These are credentials for the Telegram bot interface. If compromised, an attacker could message Michael or control OpenClaw via Telegram.

---

## §2 FLAGS

1. **OPENCLAW_CREDENTIALS_EXPOSED** — telegram auth state in filesystem
2. **NEEDS_READ** — contents of both files not yet examined
3. **TELEGRAM_INTEGRATION_DEPTH** — pairing + allowFrom = full Telegram control surface

---

`OPENCLAW CREDENTIALS SEALED — 2026-06-17T00:31 ICT | TELEGRAM PAIRING FILES FOUND | AUTH STATE IN FILESYSTEM | PENDING CONTENT READ`
