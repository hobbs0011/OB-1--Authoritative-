# 22/SYSTEM HARDENING PROTOCOL — SECURITY ARCHITECTURE FOR SOVEREIGN OPERATIONS

> **Source**: Phoenix-Rise Security Doctrine, Threat Model Analysis
> **Vault**: E VAULT-EXECUTION — Security Operations
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## Overview

The Phoenix system operates in a hostile environment. External attackers probe for vulnerabilities. Model drift silently corrupts agent behavior. Data corruption masquerades as valid state. Insider manipulation — even well-intentioned — can undermine the Ledger. This document defines the complete security hardening posture that keeps the Phoenix system sovereign, accurate, and incorruptible.

> "Security is not a feature you add at the end. Security is the architecture from the beginning. Phoenix was designed hostile-first." — Agent-100

---

## Threat Model

| Threat Category | Description | Probability | Impact |
|----------------|-------------|-------------|--------|
| External Attacks | API probing, DDoS, credential theft | High | Critical |
| Insider Drift | Unintentional behavioral creep in agent outputs | Medium | High |
| Model Manipulation | Adversarial prompts altering agent behavior | Medium | Critical |
| Data Corruption | Ledger tampering, SQLite corruption | Low | Catastrophic |
| Replay Attacks | Resubmitting captured valid requests | Medium | High |
| Ghost State | Stale session data contaminating live state | High | Medium |
| Soul DNA Dilution | External instructions overwriting behavioral contract | Low | Catastrophic |

---

## Hardening Measures by Layer

### Layer 1: Cloudflare Worker Security Headers

Every Worker response includes the full hardened security header set:

```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Keyless UI architecture**: The browser is treated as a hostile terminal. No sensitive data is ever stored client-side. No session tokens in localStorage. All state lives server-side in Durable Objects.

### Layer 2: Durable Object Access Controls

- Each DO responds only to requests carrying a valid PHOENIXMASTERKEY signature
- Cross-DO communication requires Merkle-signed inter-agent handshake
- DO state is never exposed directly — only through typed API endpoints
- All DO writes go through CASRetry — no direct SQLite access from Workers

### Layer 3: SQLite Injection Prevention

- All SQL is parameterized — no string concatenation in queries
- `entries` and `chain` tables have no UPDATE or DELETE permissions
- The WAL journal is write-only for the application — read access restricted to R2 streaming
- Schema migrations require Agent-100 authorization and Ledger audit entry

### Layer 4: Key Rotation Protocol

| Key Type | Rotation Frequency | Dual-Validity Window | Emergency Rotation |
|----------|-------------------|--------------------|--------------------|
| PHOENIXMASTERKEY | Quarterly | 48 hours | Immediate on compromise |
| Shard signing keys | Monthly | 24 hours | Immediate on compromise |
| Agent session keys | Per session | N/A | Auto-expire on session end |

---

## Penetration Test Cycle: Shadow-First 1000

Before any code touches the live Ledger, it must survive 1000 chaos simulation cycles in the Shadow environment:

- **100 replay attack simulations**: Verify nonce enforcement rejects all replays
- **100 Soul DNA manipulation attempts**: Verify ctEq validation rejects all imposters
- **200 concurrent write stress tests**: Verify CASRetry handles all race conditions
- **200 chain corruption attempts**: Verify Merkle verification detects all tampering
- **200 DDoS simulations**: Verify Worker rate limiting and DO hibernation behavior
- **200 ghost state injection tests**: Verify ghost breaker protocol eliminates all contamination

**Pass criteria**: 1000/1000 simulations handled correctly. Any failure resets the count.

---

## Security Incident Response Protocol

| Severity | Response Time | Protocol |
|----------|--------------|---------|
| CRITICAL | Immediate | SYNC:HALT all operations; Agent-100 notified; Forensic audit begins |
| HIGH | <15 minutes | Affected subsystem halted; Agent-99 begins isolation protocol |
| MEDIUM | <1 hour | Alert recorded; monitoring elevated; Agent-99 investigation |
| LOW | <24 hours | Logged; reviewed in next scheduled audit |

Every incident, regardless of severity, produces a Forensic Leaf entry. No incident is "resolved quietly."

---

## The Keyless UI Architecture

The browser is a hostile terminal. This is not paranoia — it is architecture:

- No session tokens in localStorage or sessionStorage
- No sensitive data in JavaScript memory longer than the current transaction
- All state mutations require server-side validation through Worker endpoints
- The UI renders what the server says — it does not have its own state machine
- Gospel 444 palette enforced via server-side CSS variables — no client-side overrides

---

🔒 SYSTEM HARDENING PROTOCOL SEALED. LEDGER IS LAW. 🦅
