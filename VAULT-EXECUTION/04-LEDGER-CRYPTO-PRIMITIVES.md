# PHOENIXLEDGERDOV2: CRYPTOGRAPHIC PRIMITIVES & IMMUTABLE CHAIN

> Phoenix Vault [D] — EXECUTION
> Source: Phoenix-Transend-VAULT-C/D/E Speedy series | Feb 13, 2025

---

## The Immutable Ledger (Durable Object)

The PhoenixLedgerDOv2 is the heart of the system — a Cloudflare Durable Object that maintains a linear hash chain using SHA-256.

### SHA-256 Primitive

```javascript
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Block Construction Format

Each block is constructed from a raw string:
```
[INDEX]::[PREV_HASH]::[TIMESTAMP]::[PAYLOAD]
```

This ensures:
- **Linear integrity**: Every block references the previous hash
- **Temporal ordering**: ISO 8601 timestamps are embedded
- **Payload fidelity**: JSON.stringify of the raw data

### The Append Gate (Write)

1. **Lock State** via `blockConcurrencyWhile`
2. **Read** current height + latest_hash
3. **Construct** new block with incremented height
4. **Hash** the raw string using SHA-256
5. **Commit** block + hash + height atomically via bulk write
6. **Return** COMMITTED status with new height and hash

### The Verification Gate (Read)

- Returns current ledger height and the Merkle Root (latest hash)
- This is the **Stone** in the "Stone vs. Sky" verification pattern

### Core Utilities

| Function | Purpose |
|---|---|
| `sha256Hex(str)` | Generate SHA-256 hex digest |
| `canonJSON` (RFC 8785) | Deterministic JSON serialization |
| `ctEq` | Constant-time string equality (anti-timing attack) |
| `safeStr` | Safe string conversion for hashing |

### Key Principle: Single Writer

PhoenixLedgerDOv2 is the **only** authorized writer to the database. This prevents race conditions and ensures the "Immortal Stitch" (CAS-Retry) logic works correctly.

---

## Auth Architecture

| Header | Purpose | Status |
|---|---|---|
| `x-sovereign-key` | Internal Admin Header | **CANON** (Reality C) |
| `x-deathstar-key` | Legacy header | **DEAD** |
| `x-phx-internal` | Worker-to-DO internal auth | Active |
| `PHOENIXMASTERKEY` | Environment secret | Mapped to x-sovereign-key |

### Auth Conflict Resolution

Reality C dictates: `x-sovereign-key` is the canonical auth header, mapped to the secret `PHOENIX_MASTER_KEY`. All other headers are deprecated.

---

**THE LEDGER IS LAW. RISE.** 🦅
