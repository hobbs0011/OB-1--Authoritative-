# PHETRIL TRAIL — MOUSE MISSING AFTER ASUS DRIVER REMOVAL

## User Signal
- User removed drivers with admin PowerShell.
- Mouse disappeared after restart.
- Current time: 2026-06-17T21:03 +07:00.
- User asks: "where dah fuck is my mouse".

## Immediate Interpretation
The ASUS/Precision Touchpad filter-driver removal likely unbound the touchpad HID path. Windows restarted before generic HID enumeration or re-enable completed.

## Keyboard-Only Recovery Commands
Run from elevated PowerShell:

```powershell
Get-PnpDevice -Class Mouse | Format-Table -Auto
Get-PnpDevice -Class HIDClass | Where-Object { $_.FriendlyName -match 'Mouse|TouchPad|Pointing|ASUS|ELAN|Synaptics|I2C|HID' } | Format-Table Status,Class,FriendlyName,InstanceId -Auto
Get-PnpDevice | Where-Object { $_.Status -match 'Error|Disabled' -and $_.FriendlyName -match 'Mouse|TouchPad|Pointing|ASUS|ELAN|Synaptics|I2C|HID' } | Format-Table Status,Class,FriendlyName,InstanceId -Auto
pnputil /enum-devices /connected | Select-String -Pattern 'Mouse|TouchPad|Pointing|ASUS|ELAN|Synaptics|I2C|HID'
pnputil /scan-devices
```

If a disabled mouse/touchpad is found:

```powershell
Enable-PnpDevice -InstanceId 'PASTE_INSTANCE_ID_HERE' -Confirm:$false
```

If a device is Error/Code 22/Code 31, capture InstanceId and FriendlyName before uninstall/reinstall.

## Keyboard-only Device Manager path
1. `Win+X`
2. `M`
3. `Tab` / `Shift+Tab` until device tree has focus
4. Arrow to **Mice and other pointing devices**
5. `Right Arrow` expand
6. `Enter` on device
7. `Alt+D` enable, or `Alt+U` uninstall device
8. `Alt+A` scan for hardware changes

## Trail
Mouse recovery is now P0 physical access work. Do not continue heavy repo work until pointing device is restored or external mouse/keyboard-only workflow is confirmed.
