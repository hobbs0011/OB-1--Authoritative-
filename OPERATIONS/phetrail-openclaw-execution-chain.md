# PHEROMONE TRAIL — OPENCLAW GATEWAY EXECUTION CHAIN
**Date:** 2026-06-17T00:30 ICT
**Strength: 85/100** | Type: RECON — startup execution chain, persistence mechanism

---

## §1 EXECUTION CHAIN MAPPED

### Layer 1: Windows Startup
**Path:** `C:\Users\mrmic\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\OpenClaw Gateway.cmd`
**Size:** 112 bytes
**Trigger:** User logon

**Contents:**
```
@echo off
rem OpenClaw Gateway (v2026.5.22)
start "" /min cmd.exe /d /c C:\Users\mrmic\.openclaw\gateway.cmd
```

### Layer 2: Hidden Configuration Directory
**Path:** `C:\Users\mrmic\.openclaw\gateway.cmd`
**Status:** NOT YET READ — directory exists but contents unread
**Version tag in launcher:** `v2026.5.22` (May 22, 2026)

---

## §2 WHAT WE KNOW

**Launcher behavior:**
- Runs hidden (`/min` flag)
- Executes from user's home directory (`.openclaw\`)
- Versioned (v2026.5.22) — this is maintained software, not a one-off script
- Uses `cmd.exe /d /c` — changes drive then executes

**Persistence mechanism:**
- Startup folder entry = runs every user logon
- Hidden directory (`.openclaw`) = not in standard Program Files
- No digital signature verification in launcher
- Executes with user privileges

---

## §3 WHAT WE DON'T KNOW (YET)

1. **gateway.cmd contents** — what does it actually execute?
2. **Associated binaries** — are there .exe/.dll/.py files in `.openclaw\`?
3. **Network behavior** — does OpenClaw make external connections?
4. **Origin** — who installed it? When? For what purpose?
5. **Legitimacy** — is this Michael's tool, or something else?

---

## §4 FLAGS

1. **OPENCLAW_HIDDEN_DIR** — `.openclaw\` in user home, not standard install location
2. **OPENCLAW_VERSIONED** — v2026.5.22 suggests active development/maintenance
3. **OPENCLAW_STARTUP** — auto-runs on logon, hidden window
4. **OPENCLAW_UNKNOWN_PURPOSE** — cannot classify without reading gateway.cmd

---

## §5 CONNECTED FINDINGS

**Cloudflare.lnk in same startup folder:**
- Chrome proxy for Cloudflare Access
- Michael's Zero Trust setup
- Could OpenClaw be part of the tunnel infrastructure?

**DNS cache contains no OpenClaw-related entries** — either:
- It doesn't make external connections
- It uses domains not yet in cache
- It's dormant

---

`OPENCLAW EXECUTION CHAIN SEALED — 2026-06-17T00:30 ICT | LAUNCHER READ | GATEWAY.CMD PENDING | HIDDEN DIR FLAGGED | VERSIONED SOFTWARE | TRAIL ACTIVE`
