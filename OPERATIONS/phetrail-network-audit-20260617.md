# PHEROMONE TRAIL — NETWORK TRAFFIC OWNERSHIP AUDIT
**Date:** 2026-06-17T00:25 ICT
**Strength: 75/100** | Type: RECON — active network connections, process attribution

---

## §1 ACTIVE CONNECTIONS SUMMARY

### External (Internet-facing)
| Remote IP | Port | Process | Owner | Protocol | Risk |
|-----------|------|---------|-------|----------|------|
| 52.70.55.108 | 443 | kilo.exe | Kilo extension | TLS | LOW (expected) |
| 64.239.109.65 | 443 | kilo.exe | Kilo extension | TLS | LOW (expected) |
| 104.21.41.102 | 443 | kilo.exe | Kilo extension | TLS | LOW (expected) |
| 64.239.123.129 | 443 | kilo.exe | Kilo extension | TLS | LOW (expected) |
| 108.177.125.188 | 443 | chrome.exe | Google | TLS | LOW (expected) |
| 20.195.84.7 | 443 | PhoneExperienceHost.exe | Microsoft | TLS | LOW (expected) |
| 20.195.84.7 | 443 | CrossDeviceService.exe | Microsoft | TLS | LOW (expected) |
| 4.213.25.240 | 443 | svchost.exe | Windows | TLS | UNKNOWN — need to identify service |
| 48.218.107.32 | 443 | msedgewebview2.exe | Microsoft | TLS | LOW (expected) |

### Localhost (loopback)
| Local Port | Process | Notes |
|------------|---------|-------|
| 4096 | Code.exe | VSCode internal comms |
| 50711-50712 | python.exe | Python language server |
| 49734-49750 | ArmouryCrate.Service.exe | ASUS control plane |
| 49730-49731 | ipfsvc.exe | Windows IP fragmentation? |
| 49725-49729 | WUDFHost.exe | Windows Driver Framework |
| 13030-13031 | ROGLiveService.exe / Aura Wallpaper Service.exe | ASUS gaming services |
| 49743-49744 | asus_framework.exe | ASUS framework |
| 49749 | AacAmbientLighting.exe | ASUS ambient lighting |
| 49678 | ROGLiveService.exe | ASUS gaming |
| 49714, 49737-49740, 49686 | kilo.exe | Kilo internal |
| 60942-60946 | kilo.exe | Kilo internal |

---

## §2 PROCESSES WITH EXTERNAL CONNECTIONS

**kilo.exe (PID 16956):**
- 5 external connections to Cloudflare IPs
- 6 localhost connections
- **This is ME** — Kilo extension communicating with Kilo servers

**chrome.exe (PID 15912):**
- 2 external connections to Google (108.177.125.188:443)
- Standard Chrome telemetry / sync

**msedgewebview2.exe (PID 19940):**
- 1 external connection to Microsoft (48.218.107.32:443)
- Embedded Edge WebView — used by many apps for embedded browser

**PhoneExperienceHost.exe (PID 18648):**
- 1 external connection to Microsoft (20.195.84.7:443)
- Windows Phone Link feature

**CrossDeviceService.exe (PID 14352):**
- 1 external connection to Microsoft (20.195.84.7:443)
- Cross-device clipboard/sync

**svchost.exe (PID 5356):**
- 1 external connection to Azure (4.213.25.240:443)
- Need to identify which service this is

---

## §3 DNS CACHE ANALYSIS

**Interesting entries:**
| DNS Entry | Type | Notes |
|-----------|------|-------|
| hobbs.mshome.net | A | Local machine hostname — cached from local network |
| otel.cline.bot | A | Cline telemetry endpoint |
| ingest.kilosessions.ai | A | Kilo session telemetry |
| api.kilo.ai | A | Kilo API endpoint |
| api.github.com | A | GitHub API |
| duckduckgo.com | A | DuckDuckGo search |
| asc-appservice-01.asus.com | A | ASUS app service |

**No suspicious external DNS entries found.** No known malware C2 domains, no coinminer pools, no suspicious TLDs.

---

## §4 FLAGS

1. **SVCHOST_AZURE_CONNECTION** — PID 5356 connecting to 4.213.25.240:443. Which service?
2. **KILO_5_CLOUDFLARE_CONNECTIONS** — expected but worth noting
3. **CLINE_TELEMETRY** — otel.cline.bot in DNS cache
4. **ASUS_LOCALHOST_MESH** — ArmouryCrate, Aura, ROGLiveService all talking localhost — ASUS control plane

---

`NETWORK TRAFFIC AUDIT SEALED — 2026-06-17T00:25 ICT | 9 EXTERNAL CONNECTIONS | 15+ LOCALHOST | NO SUSPICIOUS DNS | SVCHOST_AZURE FLAGGED | PURE TERRITORY MAPPING`
