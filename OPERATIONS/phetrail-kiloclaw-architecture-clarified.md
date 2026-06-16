# PHEROMONE TRAIL — KILOCLAW ARCHITECTURE CLARIFIED
**Date:** 2026-06-17T00:39 ICT
**Strength: 100/100** | Type: CLARIFICATION — system lineage, deployment model

---

## §1 USER DIRECTIVE

**Verbatim:** "PCC is our KiloCLAW work and KiloCLAW is OPENCLAW fork"

**Interpretation:**
- **OpenClaw** = upstream/base project
- **KiloClaw** = Michael's fork of OpenClaw (customized)
- **PCC** = Michael's Cloudflare tunnel deployment of KiloClaw

---

## §2 ARCHITECTURE LINEAGE

```
OpenClaw (upstream)
    ↓ fork
KiloClaw (Michael's customized version)
    ↓ deployed via
PCC (Cloudflare Zero Trust tunnel)
    ↓ accessed via
Cloudflare Access (Chrome proxy)
    ↓ controlled via
Telegram bot (@Phoenix_Centurion_Bot)
```

---

## §3 WHAT THIS MEANS

**KiloClaw is NOT vanilla OpenClaw.** It's a fork with:
- Pre-configured providers (20+ LLM APIs)
- Pre-wired Cloudflare tunnel ("pcc")
- Telegram bot integration
- Device pairing + auth
- Custom plugins (51 bundled)
- Secrets pre-provisioned (API keys, tokens)
- Self-healing supervisor (schtask)

**PCC is the deployment target.** The Cloudflare tunnel exposes KiloClaw to Michael's devices without opening inbound ports.

---

## §4 STRATEGIC IMPLICATIONS

**Recon target:** KiloClaw fork, not OpenClaw upstream
**Deployment surface:** PCC tunnel + Cloudflare Access + Telegram
**Attack surface:** Cloudflare account, Telegram bot, physical machine

---

`KILOCLAW ARCHITECTURE CLARIFIED — 2026-06-17T00:39 ICT | OPENCLAW → KILOCLAW FORK → PCC DEPLOYMENT | STRATEGY LOCKED`
