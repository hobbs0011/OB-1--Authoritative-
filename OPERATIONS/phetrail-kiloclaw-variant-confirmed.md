# PHEROMONE TRAIL — KILOCLAW IDENTIFIED AS ACTIVE VARIANT
**Date:** 2026-06-17T00:36 ICT
**Strength: 100/100** | Type: STRATEGY — system identity, operational variant

---

## §1 USER DIRECTIVE

**Verbatim:** "remember we use KILOCLAW as we found it to be a variation that has a lot of the shit done already"

**Interpretation:**
- The running system is **KILOCLAW**, not vanilla OpenClaw
- KiloClaw = OpenClaw + pre-configured providers, plugins, secrets, Cloudflare tunnel
- "Lot of the shit done already" = pre-wired for Michael's specific stack
- This is the OPERATIONAL VARIANT we're reconning

---

## §2 WHAT IS KILOCLAW?

**Evidence found:**
- `openclaw.json` references `dialagram/qwen-3.7-max` as primary model
- 51 plugins bundled (massive provider coverage)
- Pre-configured API keys for DeepSeek, Cerebras, Groq, Dialagram
- Telegram bot fully paired
- Cloudflare tunnel ("pcc") already set up
- Device identity + operator tokens already provisioned
- Supervisor schtask already running
- Memory-core + memory-wiki + active-memory plugins present

**Assessment:** KiloClaw is Michael's customized OpenClaw distribution. It's pre-provisioned with:
- Multi-provider LLM routing (20+ providers)
- Telegram remote control
- Cloudflare Zero Trust tunnel
- Device pairing + auth
- Memory systems
- Plugin ecosystem (51 plugins)

This is NOT a fresh OpenClaw install. It's a hardened, personalized AI orchestration platform.

---

## §3 STRATEGIC IMPLICATIONS

**What this means for recon:**
1. We're not auditing OpenClaw — we're auditing **KiloClaw**, Michael's personal AI stack
2. The "layered persistence" we found is INTENTIONAL — it's how KiloClaw stays running
3. Secrets in plaintext = Michael's local setup, not a hygiene failure (he controls the box)
4. The supervisor schtask + restart handoff = KiloClaw self-healing architecture

**What we're actually mapping:**
- KiloClaw's full surface area (plugins, channels, providers, memory)
- Network exposure (Cloudflare tunnel endpoints, Telegram bot)
- Secrets footprint (API keys, tokens, device keys)
- Persistence mechanisms (schtask, startup, services)
- Data stores (SQLite: flows, memory, tasks, sessions)

---

## §4 TRAIL INVENTORY — KILOCLAW RECON THIS SESSION

| Trail | Content | Strength |
|-------|---------|----------|
| phetrail-openclaw-cloudflare-tunnel.md | PCC = Cloudflare tunnel | 90 |
| phetrail-openclaw-secrets-exposure.md | 4 API keys + bot token | 100 |
| phetrail-openclaw-plugin-inventory-complete.md | 51 plugins mapped | 80 |
| phetrail-openclaw-device-identity.md | Ed25519 keypair + operator token | 90 |
| phetrail-openclaw-supervisor-restart.md | schtask self-healing | 80 |
| phetrail-openclaw-telegram-creds.md | Telegram bot + user ID | 85 |
| phetrail-openclaw-exec-approvals.md | Socket auth token | 85 |
| phetrail-openclaw-memory.md | SQLite memory store | 65 |
| phetrail-openclaw-flows.md | SQLite workflow registry | 65 |
| phetrail-openclaw-tasks.md | SQLite task history | 65 |
| phetrail-openclaw-sessions.md | 4 conversation sessions | 70 |
| phetrail-openclaw-delivery-queue.md | Failed message queue | 70 |
| phetrail-openclaw-devices.md | Device pairing state | 75 |
| phetrail-openclaw-workspace.md | Git repo + agent config | 85 |
| phetrail-openclaw-plugin-skills.md | Browser automation skill | 60 |
| phetrail-openclaw-agents-main.md | Agent runtime dir | 65 |
| phetrail-openclaw-identity.md | Device auth files | 70 |
| phetrail-openclaw-plugins.md | Plugin config | 60 |
| phetrail-openclaw-gateway-execution-chain.md | Startup → gateway.cmd | 85 |
| phetrail-openclaw-startup-audit.md | Startup folder items | 60 |
| phetrail-openclaw-unknown-ips.md | Network IP mapping | 70 |
| phetrail-openclaw-network-audit.md | Active connections | 75 |
| phetrail-mandate-real-time-secretion.md | User mandate | 100 |
| phetrail-scout-mission-directive.md | SCOUT ONLY | 100 |

**Total KiloClaw trails this session:** 24 files

---

## §5 CURRENT STRATEGY CONFIRMED

**Mission:** KiloClaw territory recon — map the full surface area
**Mode:** Scout only — find, mark, reinforce. No fixes.
**Output:** Phetrail for every finding
**Next:** Continue directory traversal of `.openclaw\workspace\` and remaining KiloClaw components

---

`KILOCLAW VARIANT CONFIRMED — 2026-06-17T00:36 ICT | STRATEGY LOCKED | 24 TRAILS THIS SESSION | PRE-PROVISIONED AI STACK | SCOUT MODE ACTIVE`
