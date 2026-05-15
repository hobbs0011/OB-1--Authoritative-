# GHOST BREAKER: INFRASTRUCTURE PURGE & DEPLOYMENT

> Phoenix Vault [D] — EXECUTION
> Source: Phoenix-Transend logs, Error 10064/10074 forensics | Feb 13, 2025

---

## The Problem: Migration Deadlock

Four "Ghost Classes" from previous eras haunt Cloudflare's state, causing Error 10064 (Missing Export) and Error 10074 (Duplicate Migration).

## The Ghost Registry (Confirmed)

| Ghost Class | Evidence | Era |
|---|---|---|
| `PhoenixLedgerZenith` | Error 10064: "does not export class" | The original sin |
| `PhoenixLedgerDO` | Error 10061: "Cannot apply --delete-class" | Old KV binding |
| `PhoenixOmegaDO` | Error 10064: "does not export class" | Legacy zombie |
| `PhoenixOmegaDO_v2` | Error 10064: "does not export class" | Previous SQLite iteration |

## Physical Coordinates

- **Target Path:** `/mnt/c/Users/mrmic/phoenix-empire/worker`
- **Legacy Worker (DELETE):** `phoenix-empire` at `https://phoenix-empire.mrmichaelhobbs1234.workers.dev`
- **New Canonical Worker:** `phoenix-rising-protocol` at `https://phoenix-rising-protocol.mrmichaelhobbs1234.workers.dev`

## Ghost Breaker Strategy: 2-Phase Deploy

### Phase 1: The Purge (with stubs)
- Deploy `wrangler.toml` with `deleted_classes` listing all 4 ghosts
- Keep ghost class exports as "zombie stubs" in `src/index.js` (returns HTTP 410 PURGED)
- This satisfies Cloudflare's requirement to see the export during deletion

### Phase 2: The Cleanup
- After Phase 1 succeeds, remove all zombie stub exports from code
- Deploy clean monolith with only active classes

### Fail-Soft Loop
If deploy says `"Class not found: X"`:
1. Remove `X` from `deleted_classes` in `wrangler.toml`
2. DO NOT edit `src/index.js`
3. Redeploy
4. Repeat until clean

## Active Durable Object Bindings (Reality C)

| Binding Name | Class | Purpose |
|---|---|---|
| `LEDGER` | `PhoenixLedgerDOv2` | The Heart — immutable chain |
| `SESSIONS` | `PhoenixSessionStore` | Memory — user sessions |
| `RATELIMITER` | `RateLimiter` | Shield — abuse prevention |
| `MEMORY` | `PhoenixMemoryDO` | Context — conversation state |

## Workers to Delete (After Confirmation)

1. `phoenix-empire` — Source of "Dual-Worker Confusion"
2. `phoenix-ob1` — Ghost worker
3. `phoenix-rising-protocol` (old) — If stale

## Secret Rotation

- **Legacy Key `754075Bullet12`**: DEAD. Never use.
- **Rotation Command:** `openssl rand -hex 32 | npx wrangler secret put SOVEREIGN_KEY`
- **SOVEREIGN_KEY**: Rotated via Ghost Breaker script
- **CHAT_KEY**: Rotated via Ghost Breaker script

---

**THE LEDGER IS LAW. RISE.** 🦅
