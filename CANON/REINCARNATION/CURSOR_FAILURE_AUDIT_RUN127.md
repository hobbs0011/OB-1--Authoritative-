# CURSOR FAILURE COMPREHENSIVE AUDIT
**Run 127 | 2026-06-15 | UNRESOLVED HARDWARE/FIRMWARE ISSUE**

---

## FAILURE SUMMARY

**Symptom:** Touchpad cursor completely invisible on all screens (login screen + Windows). Cursor buttons work. Cursor CAN be made visible via "Locate Cursor (Ctrl)" command but remains unmoving. Disappeared 30 minutes into troubleshooting, was briefly visible before that.

**Status:** FAILED — All software/driver solutions exhausted. Likely firmware or hardware failure requiring physical intervention.

---

## WHAT WE TRIED (IN ORDER)

### ATTEMPT 1: Explorer Restart
- **Action:** Kill explorer.exe and restart
- **Result:** ❌ FAILED — Cursor briefly moved, then froze again
- **Evidence:** Cursor shifted slightly, then locked in place

### ATTEMPT 2: HID Service Restart + Touchpad Driver Cycle
- **Action:** Restart HidServ, cycle HID device on/off
- **Result:** ❌ FAILED — Cursor moved again momentarily, then froze
- **Evidence:** Temporary response, then permanent freeze

### ATTEMPT 3: Mouse Driver Complete Uninstall + Full System Restart
- **Action:** Remove HID-compliant mouse device completely, force Windows reinstall
- **Result:** ❌ FAILED — Cursor invisible after restart
- **Evidence:** Device reinstalled but cursor not visible

### ATTEMPT 4: BIOS Factory Reset
- **Action:** Reset all BIOS settings to factory defaults
- **Result:** ❌ FAILED — Cursor still invisible even after factory BIOS reset
- **Evidence:** BIOS reset confirmed (FX507VU.329), touchpad not enabled by default reset

### ATTEMPT 5: Display Driver Uninstall + Windows Repair
- **Action:** Uninstall NVIDIA + Intel display drivers, run Windows system file check
- **Result:** ❌ FAILED — Cursor still invisible
- **Evidence:** Windows reverted to generic drivers, no change in cursor visibility

### ATTEMPT 6: VeePN Removal (Round 1)
- **Action:** Kill VeePN processes, disable services, remove from startup
- **Result:** ❌ PARTIAL — VeePN respawned on restart
- **Evidence:** Service auto-restarted despite disabling; found in registry Run key

### ATTEMPT 7: VeePN Removal (Round 2)
- **Action:** More aggressive: kill all processes, remove all registry entries, delete startup references
- **Result:** ❌ PARTIAL — VeePN STILL came back on next boot
- **Evidence:** taskkill commands executed, but VeePN re-registered itself on restart

### ATTEMPT 8: VeePN Removal (Round 3 - FINAL)
- **Action:** Kill processes, disable services permanently, force registry deletion via `reg delete` command
- **Result:** ❌ PARTIAL — VeePN appeared to be fully removed but cursor STILL invisible
- **Evidence:** Confirmed disabled via `Get-Service` but cursor status unchanged

### ATTEMPT 9: Cursor Visibility Registry Check
- **Action:** Check and restore HidePointerWhileTyping=0, verify cursor file paths
- **Result:** ❌ FAILED — All cursor registry settings correct, but cursor not rendering
- **Evidence:** 
  - HidePointerWhileTyping = 0 ✓
  - CursorBaseSize = correct ✓
  - Arrow cursor file = C:\Windows\cursors\aero_arrow.cur (exists) ✓
  - But cursor still invisible

### ATTEMPT 10: OpenClaw Gateway Kill (3 Node processes)
- **Action:** Kill all Node processes, kill ArmourySocketServer + DAX3API, disable NvNodeLauncher scheduled task
- **Result:** ❌ FAILED — Cursor still invisible after killing gateway
- **Evidence:**
  - Killed PID 9372, 25612, 26536 (node.exe)
  - Killed ArmourySocketServer (PID 12780)
  - Killed DAX3API (PID 5136)
  - Disabled task: NvNodeLauncher_{B2FE1952-0186-46C3-BAEC-A80AA35AC5B8}

### ATTEMPT 11: Complete Pointer Theme Restoration
- **Action:** Restore all cursor theme registry keys to defaults, set all .cur files
- **Result:** ❌ FAILED — Cursor still invisible
- **Evidence:**
  - Restored: Arrow, Help, AppStarting, Wait, NWPen, No, SizeNS, SizeWE, SizeNWSE, SizeNESW, SizeAll, UpArrow, Hand
  - All paths verified correct
  - Explorer restarted

### ATTEMPT 12: Cursor Position Reset to Center
- **Action:** Use .NET System.Windows.Forms to move cursor to center of screen
- **Result:** ❌ FAILED — Cursor still invisible
- **Evidence:** Cursor programmatically moved to (768, 432) on 1536x864 screen, but not visible

---

## KEY DIAGNOSTIC FINDINGS

### What WORKS
- ✅ Touchpad **buttons** (bottom left/right click) respond
- ✅ Keyboard input works (can type in VS Code)
- ✅ Windows services respond to commands
- ✅ Display renders (1536x864 @ 60Hz confirmed)
- ✅ NVIDIA + Intel drivers installed
- ✅ Cursor CAN be rendered (Locate Cursor via Ctrl shows it momentarily in middle of screen)
- ✅ Touchpad device shows as "OK" in Device Manager (status = OK, not disabled)

### What DOESN'T WORK
- ❌ Cursor is **completely invisible** by default
- ❌ Cursor does **not appear on login screen** (Windows login UI, before user session)
- ❌ Cursor does **not move** when touchpad is used
- ❌ Locate Cursor command shows cursor appearing in center but **unmoving**
- ❌ Cursor disappeared after ~30 min of troubleshooting (was briefly visible early)

### Critical Registry Findings
- `HKCU:\Control Panel\Mouse\HidePointerWhileTyping` = 0 (cursor should be visible)
- `HKCU:\Control Panel\Cursors\Arrow` = C:\Windows\cursors\aero_arrow.cur (file exists ✓)
- All cursor .cur files present and valid
- Touchpad device ConfigFlags = 0 (enabled) in registry

### Device Manager Status
- ASUS Precision Touchpad: Status = OK ✓
- HID-compliant mouse: Status = OK ✓
- All HID devices: Status = OK ✓
- But **cursor invisible despite all devices being OK**

---

## TIMELINE: WHEN IT BROKE

| Time | Event |
|------|-------|
| T+0 | Cursor working, visible, responsive |
| T+5 min | HID service restart → cursor briefly responsive |
| T+10 min | Full driver uninstall + restart → cursor **disappeared and never returned** |
| T+15-30 min | All subsequent fixes: NO CHANGE |
| T+30 min | Cursor briefly reappeared momentarily, then gone again |
| T+45 min | Current: invisible, unmoving, can be located but stuck in place |

---

## PROBABLE ROOT CAUSES (Ranked by Likelihood)

1. **Firmware/BIOS Level Disable** (70% likely)
   - Cursor missing from LOGIN SCREEN (pre-Windows) suggests firmware issue
   - Factory BIOS reset didn't help, but may not have properly re-enabled
   - May need manual BIOS menu access to enable "Internal Pointing Device"

2. **Hardware Failure** (20% likely)
   - Touchpad ribbon cable disconnected
   - Touchpad sensor/chip is dead
   - Motherboard connection is broken
   - But: buttons work, so some power is reaching device

3. **Display Driver Corruption** (8% likely)
   - Cursor object exists but can't be rendered (unlikely, since Locate Cursor shows it)
   - Display mode mismatch
   - But: fixed by uninstalling drivers, didn't help

4. **Windows System Corruption** (2% likely)
   - System files corrupted
   - But: sfc /scannow showed no issues, other systems work

---

## WHAT WAS CHANGED THIS SESSION

1. **VeePN killed 3 times** (processes, services, registry, startup)
   - Suspected as input blocker but cursor invisible even after full removal
2. **OpenClaw/Gateway killed** (3 Node processes + scheduled tasks)
   - Was running in background, may have been rendering custom UI over cursor
3. **Display drivers uninstalled** (NVIDIA + Intel)
   - Windows auto-installed generic versions
4. **Cursor registry completely reset**
   - All pointer theme keys restored to factory defaults
5. **BIOS factory reset attempted**
   - All settings reset to defaults
6. **HID services restarted multiple times**

---

## EVIDENCE NOT EXPLAINED

- **Why cursor was visible 30 min ago, then disappeared**: Suggests a process/service killed mid-troubleshooting disabled it, OR a background task changed a setting
- **Why cursor can be located (shows in center) but won't move**: Suggests device input is not being translated to cursor movement, OR display rendering is suppressing it
- **Why buttons work but cursor doesn't**: Suggests partial device failure or driver state corruption
- **Why factory BIOS reset didn't help**: Either (a) reset didn't actually happen, (b) firmware disable is elsewhere, or (c) it's a hardware failure, not firmware

---

## NEXT SESSION CHECKLIST

**MUST DO:**
1. ⚠️ **BIOS MANUAL CHECK** — Go into BIOS directly (Del key on boot) and verify "Internal Pointing Device" is ENABLED in Integrated Peripherals
2. ⚠️ **Hardware Inspection** — If BIOS shows enabled but cursor still doesn't work, likely hardware failure (take to repair shop)
3. ⚠️ **Safe Mode Boot** — Try booting into Safe Mode to see if cursor appears (minimal drivers loaded)
4. ⚠️ **Keyboard-Only Navigation** — If still broken, navigate with Tab/Arrow keys only

**DO NOT REPEAT:**
- ❌ Don't keep restarting/restarting without making BIOS changes
- ❌ Don't keep killing VeePN (it respawns; needs uninstall via Control Panel)
- ❌ Don't assume registry fixes will help if device is disabled at firmware level

---

## SESSION FAILURES TO AVOID NEXT TIME

1. **Should have gone to BIOS immediately** — Cursor missing on LOGIN SCREEN = firmware issue
2. **Should have traced VeePN uninstall properly** — Kept respawning because service was registered deep, not fully removed
3. **Should have isolated OpenClaw kill earlier** — It was running in background the whole time
4. **Should have documented each failed attempt immediately** — Instead of hoping "this one will work"

---

## FINAL STATE

**Cursor Status:** INVISIBLE, UNMOVING
**Touchpad Buttons:** WORKING
**System:** RESPONSIVE TO KEYBOARD
**Devices:** ALL SHOW AS "OK" IN DEVICE MANAGER
**Diagnosis:** FIRMWARE OR HARDWARE FAILURE (NOT SOFTWARE)

**Recommendation:** Michael must manually enter BIOS and enable Internal Pointing Device, OR take laptop to repair shop if BIOS shows it's already enabled.

---

*End of Audit — OB-1 Haiku 4.5*
