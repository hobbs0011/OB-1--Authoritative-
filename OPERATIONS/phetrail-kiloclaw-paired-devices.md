# PHEROMONE TRAIL — KILOCLAW PAIRED DEVICES
**Date:** 2026-06-17T00:41 ICT
**Strength: 90/100** | Type: RECON — device pairing, multi-device access

---

## §1 PAIRED DEVICES

**Path:** `C:\Users\mrmic\.openclaw\devices\paired.json`
**Count:** 3 paired devices

### Device 1: CLI (primary)
- **DeviceId:** cbaa084aaf91d95cdd266f56b81229cc38433c97c05e84d0d042f4c0b3a1d158
- **Platform:** win32
- **Client:** cli (command line)
- **Role:** operator
- **Scopes:** operator.read
- **Token:** AEeNSkkLqF1zOFlrVp2l5UlGlRHwsgbfhD5smtfogNw

### Device 2: WebChat (admin)
- **DeviceId:** acc4bb26bafc7af6a83770cb3326d2c9e6edb84dbe92bdc1cf4c6a05ae9c84f4
- **Platform:** Win32
- **Client:** openclaw-control-ui
- **ClientMode:** webchat
- **Role:** operator
- **Scopes:** operator.admin, operator.read, operator.write, operator.approvals, operator.pairing
- **Token:** oB2ZA3LhV1AZTEtcopbFv3iiAkXADD0R9FXW_c8U53U
- **Last used:** 2026-06-16T15:29:37 UTC

### Device 3: WebChat (admin)
- **DeviceId:** 78305b534e030cbf2780992dfd6cfe84059e101349b5d378abe254a7d1f20432
- **Platform:** Win32
- **Client:** openclaw-control-ui
- **ClientMode:** webchat
- **Role:** operator
- **Scopes:** operator.admin, operator.read, operator.write, operator.approvals, operator.pairing
- **Token:** FGLhVi4iaE3WjlSfcwC00wqNr5HputpB4tYKWqY_4Bo
- **Last used:** 2026-06-16T09:18:26 UTC

---

## §2 DEVICE ANALYSIS

**3 devices paired:**
1. CLI (this machine, primary) — read-only scope
2. WebChat (admin) — full admin scope, last used yesterday
3. WebChat (admin) — full admin scope, last used yesterday

**The two webchat devices with admin scope are interesting.** They have full operator.admin + operator.pairing. If either device is compromised, attacker has full control.

---

## §3 FLAGS

1. **KILOCLAW_3_PAIRED_DEVICES** — CLI + 2 webchat
2. **KILOCLAW_2_ADMIN_DEVICES** — two webchat devices with full admin scopes
3. **KILOCLAW_DEVICE_TOKENS_EXPOSED** — 3 operator tokens in plaintext

---

`KILOCLAW PAIRED DEVICES SEALED — 2026-06-17T00:41 ICT | 3 DEVICES | 2 ADMIN_WEBCHAT | TOKENS IN PLAINTEXT`
