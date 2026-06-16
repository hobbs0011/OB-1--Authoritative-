# PHEROMONE TRAIL — OPENCLAW IDENTITY DIRECTORY
**Date:** 2026-06-17T00:32 ICT
**Strength: 70/100** | Type: RECON — device identity, authentication state

---

## §1 IDENTITY DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\identity\`
**Contents:**
- `device-auth.json`
- `device.json`

**Assessment:** OpenClaw maintains device identity and authentication state here. These files likely contain device fingerprints, auth tokens, or pairing certificates.

**Risk:** If compromised, attacker could impersonate this device to OpenClaw's services.

---

## §2 FLAGS

1. **OPENCLAW_DEVICE_IDENTITY** — device auth files present
2. **NEEDS_READ** — contents not yet examined
3. **DEVICE_IMPERSONATION_RISK** — if files leaked, device could be spoofed

---

`OPENCLAW IDENTITY DIR SEALED — 2026-06-17T00:32 ICT | DEVICE AUTH FILES FOUND | CONTENTS PENDING | IMPERSONATION RISK FLAGGED`
