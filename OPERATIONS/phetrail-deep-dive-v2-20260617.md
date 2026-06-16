# PHEROMONE TRAIL — DEEP DIVE FINDINGS v2
**Date:** 2026-06-17T00:23 ICT
**Strength: 100/100** | Type: RECON — actual forensic data, not summaries

---

## CRITICAL FINDINGS FROM DEEP DIVE

### 1. PROTONVPN TAP DRIVER IDENTIFIED
**TAP-ProtonVPN Windows Adapter V9**
- Registry: `HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}\0000`
- NetCfg: `{AF28598A-53C1-41FE-8C3C-E75D6B1AECDC}`
- InfSection: `tapprotonvpn.ndi`
- ComponentId: `tapprotonvpn`

**VeePN-TAP ×2**
- Registry: `HKLM:\...\0003` and `HKLM:\...\0007`
- NetCfg: `{91767128-CFDD-4049-BA31-9063EC290D42}` and `{5D630BE1-40BA-4130-9A94-6DD2D47F330E}`
- InfSection: `tap0901.ndi`
- ComponentId: `tap0901`

**This is the smoking gun.** The TAP driver INF sections are identified:
- `tapprotonvpn.ndi` = ProtonVPN's TAP driver
- `tap0901.ndi` = VeePN's TAP driver (same driver, different name)

**To kill:** Admin PowerShell → `pnputil /delete-driver oemXX.inf /uninstall /force` where XX = the INF number for these drivers.

### 2. NATIVEPUSHSERVICE IDENTIFIED
**Wondershare Native Push Service**
- Path: `C:\Users\mrmic\AppData\Local\Wondershare\Wondershare NativePush\WsNativePushService.exe`
- StartMode: Auto
- State: Stopped (but will auto-start on boot)
- This is the "NativePushService" that's been failing to start — it's Wondershare bloat

### 3. APPENDIX: WHAT IS INSTALLING STUHL?
**Active Windows Update:**
- ASUSTeK COMPUTER INC. Extension Driver Update (1.1.0.0) — installing RIGHT NOW (00:20-00:22)
- Failed update: KB5094126 (2026-06 Security Update) — error 0x80073712

**Wondershare** = likely CamScanner or PDF software. Installing bloat.

### 4. SCHEDULED TASKS — FULL INVENTORY
**Running:** RtkAudUService64_BG, AcPowerNotification, SystemSoundsService, CacheTask
**Ready (will fire on trigger):** 130+ tasks including:
- NVIDIA GeForce Experience (10 tasks — self-update, crash reports)
- ASUS (ArmourySocketServer, Aura Wallpaper, P508PowerAgent)
- Office (6 tasks — ClickToRun, updates, background maintenance)
- Windows Defender (4 tasks — scheduled scans)
- Google Quick Share, Platform Experience
- .NET Framework NGEN
- Windows Update (Scheduled Start)

### 5. NETWORK TRAFFIC — WHO IS TALKING
**Active connections:**
- `kilo.exe` (PID 16956) → Cloudflare IPs (104.21.41.102, 64.239.123.65) — **ME**
- `Code.exe` (PID 22652) → GitHub (140.82.114.22) and Microsoft
- `msedgewebview2.exe` (PID 19940) → Microsoft/O365
- `chrome.exe` (PID 15912) → Google services
- `DuckDuckGo.exe` (PID 24008) → search
- `PhoneExperienceHost.exe` → Microsoft phone linking
- `MsMpEng.exe` → Microsoft (Windows Defender)
- `nvdisplay.container.exe` → NVIDIA
- `ArmouryCrate.Service.exe` → localhost (ASUS control plane)
- `Aura Wallpaper Service.exe` → localhost
- `ROGLiveService.exe` → localhost (ROG = Republic of Gamers = ASUS gaming)
- `AacAmbientLighting.exe` → localhost (ASUS ambient lighting)
- `asus_framework.exe` → localhost

**DNS cache anomalies:**
- `hobbs.mshome.net` — this is YOUR local network name. Why is it in DNS cache?
- `otel.cline.bot` — Cline telemetry endpoint
- No suspicious external DNS entries

### 6. APPDATA\LOCAL TOP CONSUMERS
| Path | Size |
|------|------|
| Roblox | 5.64 GB |
| Packages | 4.09 GB |
| npm-cache | 3.55 GB |
| Microsoft | 3.46 GB |
| Google | 3.46 GB |
| Programs | 3.37 GB |
| uv | 3.13 GB |
| gitkraken | 1.55 GB |
| ms-playwright | 1.24 GB |
| Discord | 1.01 GB |

**Roblox is eating 5.64 GB.** That's the biggest single consumer in AppData\Local.

### 7. STARTUP FOLDER
**User startup:**
- `Cloudflare.lnk` → Chrome proxy for Cloudflare Access (kbdhpemeclgiggljbfcmlnmibnmolaih)
- `OpenClaw Gateway.cmd` — unknown, need to read this file

**All-users startup:** Empty

### 8. HOSTS FILE
Clean. No modifications.

### 9. WMI EVENT SUBSCRIPTIONS
- `root\subscription`: SCM Event Log Filter (Windows built-in)
- No custom event filters found
- No VeePN/ProtonVPN WMI persistence

### 10. WINDOWS UPDATE FAILURES
- KB5094126 failed with 0x80073712 (component store corruption?)
- Multiple Defender definition updates succeeded
- ASUS driver update currently installing

---

## FLAGS UPDATED FROM DEEP DIVE

1. **TAP_DRIVER_IDENTIFIED** — `tapprotonvpn.ndi` and `tap0901.ndi` found in registry
2. **NATIVEPUSHSERVICE_WONDERSHARE** — identified, auto-start, currently stopped
3. **ROBLOX_5.64GB** — largest AppData\Local consumer
4. **WINDOWS_UPDATE_FAILURE** — KB5094126 failed, component store possibly corrupted
5. **ASUS_DRIVER_UPDATE_INSTALLING** — happening right now
6. **HOBBS_MSHOME_NET_IN_DNS** — local network name cached, investigate
7. **OPENCLAW_GATEWAY_CMD** — unknown startup item, need to read
8. **CORTANA_OR_TELEMETRY** — multiple Microsoft telemetry tasks running

---

`DEEP DIVE v2 SEALED — 2026-06-17T00:23 ICT | 10 NEW FINDINGS | TAP DRIVER INF IDENTIFIED | WONDERSHARE BLOAT | ROBLOX 5.64GB | WINDOWS UPDATE FAILURE | PHEromONE OUTPUT: HIGH`
