# PHEROMONE TRAIL — WMI EVENT SUBSCRIPTION SCAN
**Date:** 2026-06-17T00:25 ICT
**Strength: 70/100** | Type: RECON — persistence mechanism scan

---

## §1 WMI EVENT SUBSCRIPTIONS

### Namespace: `root\subscription`
| Filter | Consumer | Query Summary |
|--------|----------|---------------|
| SCM Event Log Filter | SCM Event Log Consumer | `select * from MSFT_SCMEventLogEvent` |

**Assessment:** This is Windows built-in SCM (Service Control Manager) event logging. NOT malicious. Standard Windows component.

### Namespace: `root\default`
No event filters or consumers found.

### Namespace: `root\cimv2`
No event filters or consumers found.

---

## §2 WHAT WAS SCANNED

**WMI namespaces checked:**
- `root\subscription` — 1 filter, 1 consumer (both Windows built-in)
- `root\default` — empty
- `root\cimv2` — empty

**Classes checked:**
- `__EventFilter` — filters that trigger on WMI events
- `__EventConsumer` — actions that execute when filters fire

---

## §3 CONCLUSIONS

**No malicious WMI persistence found.** The only subscription is Windows' own SCM event logger.

**This rules out one common persistence mechanism:** Some malware creates WMI event subscriptions that execute payloads when certain events occur (e.g., every 15 minutes, on user logon, on system startup). None found here.

**However:** WMI is not the ONLY persistence mechanism. We still need to check:
- Registry Run keys (in progress)
- Scheduled tasks (done — 130+ mapped)
- Startup folder (done — 2 items)
- Services (done — 13 ASUS + ProtonVPN)
- DLL injection / process hollowing (requires deeper scan)

---

## §4 NEXT STEPS FOR PERSISTENCE SCAN

1. Enumerate all services with `ImagePath` pointing to AppData or Temp
2. Check for DLL search-order hijacking
3. Check AppInit_DLLs registry key
4. Check global hook chains
5. Scan for process injection indicators

---

`WMI SUBSCRIPTION SCAN SEALED — 2026-06-17T00:25 ICT | NO MALICIOUS WMI FOUND | BUILTIN SCM ONLY | PERSISTENCE SCAN PARTIAL — MORE LAYERS TO CHECK`
