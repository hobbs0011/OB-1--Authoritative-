# PHEROMONE TRAIL — UNKNOWN EXTERNAL IPs
**Date:** 2026-06-17T00:23 ICT
**Strength: 70/100** | Type: RECON — network endpoint identification

---

## §1 EXTERNAL IPs OBSERVED

### Currently Active (this session)
| IP | Port | Process | Owner | Likely Destination |
|----|------|---------|-------|-------------------|
| 52.70.55.108 | 443 | kilo.exe | Kilo extension | Cloudflare |
| 64.239.109.65 | 443 | kilo.exe | Kilo extension | Cloudflare |
| 104.21.41.102 | 443 | kilo.exe | Kilo extension | Cloudflare |
| 20.43.161.105 | 443 | DuckDuckGo.exe | Search | DuckDuckGo |
| 48.218.107.32 | 443 | msedgewebview2.exe | Microsoft | O365/Azure |
| 13.89.179.11 | 443 | msedgewebview2.exe | Microsoft | O365/Azure |
| 57.155.142.104 | 443 | MsMpEng.exe | Windows Defender | Microsoft update |
| 108.177.125.188 | 443 | chrome.exe | Google | Google services |
| 20.50.73.12 | 443 | Code.exe | VSCode | GitHub/Microsoft |
| 20.195.84.7 | 443 | PhoneExperienceHost.exe | Microsoft | Phone linking |
| 20.195.84.7 | 443 | CrossDeviceService.exe | Microsoft | Cross-device |
| 216.239.36.223 | 443 | nearby_share.exe | Google | Nearby Share |
| 13.67.9.5 | 443 | Code.exe | VSCode | GitHub |
| 4.213.25.240 | 443 | svchost.exe | Windows | Unknown (Azure?) |

### Previously Active (not currently connected)
| IP | Port | Last Seen | Notes |
|----|------|-----------|-------|
| 185.159.159.1 | 80 | Earlier session | HTTP (not HTTPS) — unusual |
| 48.218.104.163 | 443 | Earlier session | Unknown |
| 192.178.230.188 | 5228 | Earlier session | Google FCM (Firebase Cloud Messaging) |

---

## §2 FINDINGS

**kilo.exe is the biggest talker** — 3 Cloudflare connections. This is expected (Kilo extension).

**Microsoft ecosystem:** Phone linking, Defender, Edge WebView, Cross Device — all Microsoft telemetry/sync.

**Google ecosystem:** Chrome, Nearby Share, Firebase Cloud Messaging.

**185.159.159.1:80 (HTTP not HTTPS):**
- This is suspicious. Why is something connecting to port 80 (unencrypted)?
- Could be: Windows Update check, telemetry beacon, or something else
- Not currently active — was active earlier in session

**192.178.230.188:5228:**
- This is Google Firebase Cloud Messaging (FCM) port
- Owned by PID 15912 (chrome.exe) — Chrome push notifications
- Normal behavior

---

## §3 QUESTIONS

1. What was connecting to 185.159.159.1:80 and why HTTP?
2. What was connecting to 48.218.104.163:443?
3. Is 4.213.25.240:443 (svchost.exe) Azure/Windows Update or something else?

---

`UNKNOWN IPs SEALED — 2026-06-17T00:23 ICT | 14 ACTIVE CONNECTIONS MAPPED | 3 PREVIOUS | 185.159.159.1:80 FLAGGED AS HTTP ANOMALY | PURE TERRITORY MAPPING`
