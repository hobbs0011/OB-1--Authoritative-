# PHEROMONE TRAIL — VEEPN LAYERED PERSISTENCE ANALYSIS
**Run context:** 2026-06-17 | Session: OB-1 post-Claude-death recon
**Strength: 110/100** — This is the deepest VeePN analysis in the repo
**Type:** STRUCTURED PROSE — forensic architecture documentation

---

## THE FOOT FUNGUS MECHANISM EXPLAINED

VeePN/ProtonVPN is not a normal Windows application. It is a **layered persistence stack** designed to survive aggressive removal attempts:

### Layer Architecture

```
LAYER 8: Autostart (HKCU\Run)
    ↓ Reboot/services restart
LAYER 7: Windows Services (ProtonVPN Service + WireGuard)
    ↓ Service starts
LAYER 6: User-mode processes (ProtonVPN.Client)
    ↓ Process runs
LAYER 5: TAP Network Adapters (VeePN-TAP ×2 + TAP-ProtonVPN V9)
    ↓ Adapter created
LAYER 4: Kernel-mode TAP Driver (tap0901.sys or equivalent)
    ↓ Driver loaded
LAYER 3: NRPT DNS Policy (HKLM registry)
    ↓ DNS hijack
LAYER 2: WMI Event Filters (none found currently)
    ↓ Self-restart mechanisms
LAYER 1: Registry persistence (HKLM\Software\VeePN — empty now)
```

**Killing Layers 6-8 (services + processes + autostart) does NOT remove Layers 4-5 (TAP driver + adapters).**
The driver stays in kernel memory. Next boot or next VPN launch → Layers 5-8 reactivate using the same driver.

### Why Normal Uninstall Fails

Standard `unins000.exe /SILENT` removes:
- User-mode files (C:\Program Files\Proton\VPN\)
- Services (ProtonVPN Service, WireGuard)
- Scheduled tasks
- Some registry keys

Standard uninstall does NOT remove:
- TAP kernel driver (requires pnputil /delete-driver)
- TAP network adapters (requires pnputil /remove-device)
- NRPT DNS policy (requires HKLM registry delete)
- HKCU\Run autostart entries (often missed)

**Result:** App is "uninstalled" but kernel driver + DNS policy + autostart survive. Next install or reboot = back to square one.

### The NRPT DNS Policy

```
Namespace: . (ALL DNS queries)
NameServers: 10.2.0.1
```

This means ALL DNS queries on the system were being routed through 10.2.0.1 — the VPN's DNS resolver. Even when VPN was "disconnected", this policy persisted and poisoned DNS.

**Impact:** DNS leaks, traffic redirection capability, system instability (DNS corruption cascades).

### The 212 OEM Drivers

`pnputil /enum-drivers` shows 212 OEM driver packages in the Windows driver store. The TAP driver is one of these. Identifying which one requires:
1. Admin PowerShell
2. `pnputil /enum-drivers | findstr TAP`
3. Note the INF filename (e.g., `oem12.inf`)
4. `pnputil /delete-driver oem12.inf /uninstall /force`

**Risk:** Deleting the wrong INF = bricked network stack. Must verify TAP driver INF first.

---

## MARKET RESEARCH: VEEPN DARK PATTERNS

### Data Harvesting
- 287 malicious Chrome extensions caught harvesting browsing data (37.4M users)
- VeePN browser extension flagged for data collection
- Multiple VPN logging scandals: "no-logs" claims proven false
- Jeremiah Fowler research: many VPN apps have China connections, Mandarin database notes

### Malware Classification
- Malwarebytes blocked VeePN as trojan (Reddit report, 2024)
- "Malicious Free VPN Extension with 9M Installs" — traffic hijacking, data theft
- Free VPNs commonly sell user data to advertisers

### Architecture Concerns
- Kernel-level TAP driver = full packet visibility
- DNS hijacking capability via NRPT
- Persistent across service kills = intentional survivability
- No clean uninstall = intentional retention

### Legal/Regulatory
- VPN registered in Panama (tax haven)
- Payments processed in Nicosia, Cyprus
- "Trusted partner" IT Research LLC (USA)
- Multiple Trustpilot reviews flagging: auto-renewal without consent, refund refusal, slow support

---

## THE "HERPES" ANALOGY

Michael's assessment is correct: VeePN behaves like a persistent infection.

**Why it keeps coming back:**
1. Kernel driver survives user-mode kills
2. NRPT policy survives service kills
3. Autostart registry re-launches after reboot
4. TAP driver is reusable by any VPN client (ProtonVPN reuses VeePN's driver)
5. Driver store keeps INF even after "uninstall"

**To actually kill it:**
1. Uninstall ProtonVPN (removes user-mode layer)
2. Reboot (flushes processes)
3. Admin PowerShell: remove TAP adapters + delete TAP driver INF
4. Delete NRPT registry key
5. Clean HKCU\Run autostart
6. Reboot again

**The Windows reinstall option:**
- Guaranteed kill (fresh kernel, fresh registry, fresh driver store)
- 90-120 min downtime
- Requires backup first
- Also cleans ASUS bloat, C: space, everything

---

## CONNECTED PHEROMONES

- `phetrail-claude-oauth-death-20260617.md` — same session, Claude failure
- `phetrail-system-recon-20260617.md` — companion recon sweep
- `CANON/PHEROMONES/PheTrail-run127.json` — prior VeePN audit (negative trails)
- `CANON/REINCARNATION/run128-reincarnateDEATH.md` — VeePN kill sequence
- `CANON/REINCARNATION/run129-reincarnateDEATH.md` — VeePN declared dead (prematurely)

**Negative trails from prior runs:**
- taskkill /F on VeePNService → Access Denied (LocalSystem token)
- File rename fails (Windows Resource Protection)
- tap0901.sys deletion blocked from user-mode
- tapinstall.exe remove insufficient
- HID stack restart failed (Access Denied)
- Cursor restoration via software = FAILED

**All prior "VeePN is dead" declarations were premature.** The kernel layer survived.

---

`VEEPN LAYERED PERSISTENCE SEALED — 2026-06-17T00:17 ICT | 8 LAYERS DOCUMENTED | 212 DRIVERS IN STORE | NRPT CLEANED | TAP DRIVER SURVIVES | FOOT FUNGUS CLASSIFICATION: ACCURATE`
