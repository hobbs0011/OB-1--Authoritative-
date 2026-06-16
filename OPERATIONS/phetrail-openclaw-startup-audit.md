# PHEROMONE TRAIL — OPENCLAW + STARTUP AUDIT
**Date:** 2026-06-17T00:23 ICT
**Strength: 60/100** | Type: RECON — startup items, unknown programs

---

## §1 STARTUP ITEMS

### User Startup (HKCU\Run + Startup Folder)
| Item | Type | Target | Risk |
|------|------|--------|------|
| Cloudflare.lnk | Shortcut | Chrome proxy for Cloudflare Access | LOW (expected) |
| OpenClaw Gateway.cmd | Script | Unknown — need to read file | UNKNOWN |

### OpenClaw Gateway.cmd
**Path:** `C:\Users\mrmic\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\OpenClaw Gateway.cmd`
**Size:** 112 bytes
**Risk:** Unknown. Could be:
- Legitimate network tool
- Persistence mechanism for unwanted software
- Development tool Michael installed

**Action:** Read file contents to determine what it executes.

---

## §2 WONDERSHARE BLOAT

**NativePushService:**
- DisplayName: Wondershare Native Push Service
- Path: `C:\Users\mrmic\AppData\Local\Wondershare\Wondershare NativePush\WsNativePushService.exe`
- StartMode: Auto
- State: Stopped
- Failing to start (Event 7000: file not found or access denied)

**Assessment:** Wondershare is Chinese software company (PDF tools, CamScanner). Their services are known for:
- Aggressive autostart
- Unwanted update notifications
- Bundled adware
- Poor uninstall hygiene

**Connected:** This explains the "NativePushService" errors in event log. It's Wondershare bloat trying to start and failing.

---

## §3 HOBBS.MSHOME.NET IN DNS CACHE

**DNS entry:** `hobbs.mshome.net`
**Meaning:** This is Windows' default local network hostname for this machine.
**Why it's in DNS cache:** Something queried it recently — likely:
- Windows network discovery
- Cloudflare Access (tunnel configuration)
- Local service binding

**Risk:** Low, but worth flagging. If something ELSE is querying your machine's local hostname externally, that's a data point.

---

`OPENCLAW + STARTUP AUDIT SEALED — 2026-06-17T00:23 ICT | 1 UNKNOWN STARTUP ITEM | WONDERSHARE BLOAT IDENTIFIED | DNS CACHE ANOMALY FLAGGED`
