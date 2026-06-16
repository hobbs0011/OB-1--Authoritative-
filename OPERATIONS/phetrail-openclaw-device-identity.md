# PHEROMONE TRAIL — OPENCLAW DEVICE IDENTITY
**Date:** 2026-06-17T00:33 ICT
**Strength: 90/100** | Type: RECON — cryptographic identity, device fingerprint

---

## §1 DEVICE IDENTITY FILES

### File 1: `device.json`
```json
{
  "version": 1,
  "deviceId": "cbaa084aaf91d95cdd266f56b81229cc38433c97c05e84d0d042f4c0b3a1d158",
  "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA6LWvIYkxldG79N2Gu6fflzsLeLmlbpu9mGXVSyLZBmU=\n-----END PUBLIC KEY-----\n",
  "privateKeyPem": "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJZ5PAw7kr9JXtIMbul02DRz52w08K46gu5cl/SjWQh2\n-----END PRIVATE KEY-----\n",
  "createdAtMs": 1779631093161
}
```

**CRITICAL:** Private key in PLAINTEXT on disk.

### File 2: `device-auth.json`
```json
{
  "version": 1,
  "deviceId": "cbaa084aaf91d95cdd266f56b81229cc38433c97c05e84d0d042f4c0b3a1d158",
  "tokens": {
    "operator": {
      "token": "AEeNSkkLqF1zOFlrVp2l5UlGlRHwsgbfhD5smtfogNw",
      "role": "operator",
      "scopes": ["operator.read"],
      "updatedAtMs": 1779667666005
    }
  }
}
```

**Operator token in plaintext.**

---

## §2 CRYPTOGRAPHIC IDENTITY

**Device ID:** `cbaa084aaf91d95cdd266f56b81229cc38433c97c05e84d0d042f4c0b3a1d158`
**Key type:** Ed25519 (from `MCowBQYDK2VwAyE` header)
**Public key:** Used to identify this device to OpenClaw services
**Private key:** Used to sign requests — EXPOSED IN PLAINTEXT

**Operator token:** `AEeNSkkLqF1zOFlrVp2l5UlGlRHwsgbfhD5smtfogNw`
**Role:** operator
**Scopes:** operator.read
**Updated:** 2026-06-17T00:27:46 UTC (very recent!)

---

## §3 SECURITY IMPLICATIONS

**If private key is compromised:**
- Attacker can impersonate this device
- Sign requests as this device
- Access OpenClaw services with this device's identity

**If operator token is compromised:**
- Attacker can read operator-level data
- Limited scope (operator.read only) but still a breach

---

## §4 FLAGS

1. **OPENCLAW_PRIVATE_KEY_EXPOSED** — Ed25519 private key in plaintext file
2. **OPENCLAW_OPERATOR_TOKEN_EXPOSED** — operator token in plaintext
3. **DEVICE_IMPERSONATION_POSSIBLE** — private key leak = full device compromise

---

`OPENCLAW DEVICE IDENTITY SEALED — 2026-06-17T00:33 ICT | PRIVATE KEY IN PLAINTEXT | OPERATOR TOKEN EXPOSED | ED25519 KEYPAIR | CRITICAL SECRETS HYGIENE FAILURE`
