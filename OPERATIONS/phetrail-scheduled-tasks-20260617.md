# PHEROMONE TRAIL — SCHEDULED TASKS INVENTORY
**Date:** 2026-06-17T00:25 ICT
**Strength: 65/100** | Type: RECON — scheduled tasks, autostart triggers

---

## §1 TASK INVENTORY SUMMARY

**Total tasks found:** 130+ non-disabled tasks

### Running Tasks
| Task | Path | Notes |
|------|------|-------|
| RtkAudUService64_BG | `\` | Realtek audio background service |
| AcPowerNotification | `\ASUS\` | ASUS power notification daemon |
| SystemSoundsService | `\Microsoft\Windows\Multimedia\` | Windows system sounds |
| CacheTask | `\Microsoft\Windows\Wininet\` | IE/Edge cache maintenance |

### NVIDIA Tasks (10 total — all Ready)
- NVIDIA GeForce Experience SelfUpdate
- NvDriverUpdateCheckDaily
- NvNodeLauncher
- NvProfileUpdaterDaily
- NvProfileUpdaterOnLogon
- NvTmRep_CrashReport1-4

**Assessment:** Standard NVIDIA bloat. Self-updating, crash reporting, profile sync. Not malicious but noisy.

### ASUS Tasks (3 total — all Ready)
- ArmourySocketServer
- Aura Wallpaper Service
- P508PowerAgent_sdk

**Assessment:** ASUS control plane. Aura Wallpaper is the one crashing (Event 7034).

### Office Tasks (8 total — all Ready)
- Office Actions Server
- Office Automatic Updates 2.0
- Office Background Push Maintenance
- Office ClickToRun Service Monitor
- Office Feature Updates
- Office Feature Updates Logon
- Office Performance Monitor
- Office Startup Maintenance

**Assessment:** Standard Office telemetry/update machinery. Heavy footprint.

### Windows Defender Tasks (4 total)
- Windows Defender Cache Maintenance
- Windows Defender Cleanup
- Windows Defender Scheduled Scan
- Windows Defender Verification

**Assessment:** Expected. Defender is running.

### Google Tasks (3 total)
- Quick Share Relaunch
- RunPlatformExperienceHelperOnUnlock
- RunPlatformExperienceHelper_Daily
- RunPlatformExperienceHelper_Metrics

**Assessment:** Google Quick Share + Platform Experience telemetry.

### Microsoft Telemetry Cluster
- Consolidator (CEIP)
- UsbCeip (USB telemetry)
- DmClient / DmClientOnScenarioDownload (Feedback Hub)
- Microsoft Compatibility Appraiser Exp
- PcaPatchDbTask
- UsageDataFlushing / UsageDataReceiver / UsageDataReporting

**Assessment:** Heavy Microsoft telemetry. Normal for Windows but worth flagging.

### Other Notable Tasks
| Task | Risk | Notes |
|------|------|-------|
| BlueStacksHelper_nxt | MEDIUM | Android emulator helper — bloat if not using BlueStacks |
| MareBackup | LOW | Windows backup |
| BitLocker Encrypt All Drives | LOW | Expected if BitLocker enabled |
| FamilySafetyMonitor | LOW | Parental controls |
| XblGameSaveTask | LOW | Xbox save sync |
| .NET Framework NGEN | LOW | .NET optimization |

---

## §2 FLAGS FROM TASK INVENTORY

1. **BLUESTACKS_HELPER** — BlueStacks emulator task running. Is BlueStacks installed? If not, this is orphaned bloat.
2. **NVIDIA_10_TASKS** — heavy NVIDIA footprint, self-updating without user consent
3. **OFFICE_8_TASKS** — heavy Office telemetry
4. **ASUS_3_TASKS** — ASUS control plane, Aura Wallpaper crashing

---

`SCHEDULED TASKS INVENTORY SEALED — 2026-06-17T00:25 ICT | 130+ TASKS MAPPED | 4 RUNNING | BLUESTACKS FLAGGED | NVIDIA/OFFICE/ASUS CLUSTERS IDENTIFIED`
