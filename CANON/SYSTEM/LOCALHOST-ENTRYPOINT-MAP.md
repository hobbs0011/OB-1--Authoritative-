# NET-PET-AI LOCALHOST ENTRYPOINT MAP

**CANONICAL BRANCH:** localhost-only  
**DATE:** 2026-07-02  
**CONTRACT:** REINCARNATION-CONTRACT §7 — Cloudflare forbidden

---

## 1. CURRENT RUNTIME (Cloudflare-only, FORBIDDEN)

| Component | Current Binding | Status |
|-----------|-----------------|--------|
| Worker runtime | `src/index.js` + `src/router.js` | Cloudflare Workers only |
| D1 database | `env.SOUL_DB` → D1 binding | No local fallback |
| KV store | `env.NET_PET_KV` | No local fallback |
| Durable Objects | `LedgerDO`, `PetDO`, `CommandDO`, `MemoryDO` | No local fallback |
| Cache API | `caches.default` | No local fallback |
| Prod URL | `https://net-pet-ai.mrmichaelhobbs123.workers.dev` | FORBIDDEN |
| Dev URL | `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev` | FORBIDDEN |
| soul-logger | `https://soul-logger.mrmichaelhobbs123.workers.dev` | FORBIDDEN |
| PA proxy | `https://phoenix-architecti.mrmichaelhobbs123.workers.dev` | FORBIDDEN |

---

## 2. LOCAL-ONLY ASSETS (already exist, no Cloudflare needed)

| Asset | Path | Status |
|-------|------|--------|
| Static login | `public/oktava-login/index.html` | Serves on any static server |
| Static classroom | `public/oktava-login/classroom.html` | Serves on any static server |
| Student portals | `public/*/index.html` | Serves on any static server |
| PowerShell orchestration | `SCRIPTS/obi.ps1`, `SCRIPTS/forcemarch.ps1` | Runs locally |
| RRL pipeline | `SCRIPTS/rrl-pipeline.ps1`, `rrl-failsafe.ps1` | Runs locally |
| Heavy Ledger | `CANON/HEAVY-LEDGER/HL-*.json` | JSON files on disk |
| Starmap | `CANON/STARMAP/starmap-run*.json` | JSON files on disk |
| Soul Keywords | `CANON/SOUL-KEYWORDS/rfkw-run*.txt` | Text files on disk |
| PheTrails | `CANON/PHEROMONES/PheTrail-run*.json` | JSON files on disk |
| DNA Registry | `CANON/DNA-REGISTRY/*.json` | JSON files on disk |
| Registry | `CANON/REGISTRY/*.json` | JSON files on disk |
| Boot/State | `CANON/SYSTEM/COLD-START-BOOT.md`, `STATE-SNAPSHOT.json` | Read-write local |
| Reincarnation | `CANON/REINCARNATION/*.md` | Read-write local |

---

## 3. REQUIRED ADAPTER LAYER (missing, DEATH task)

| Worker API | Local Adapter Needed | Suggested Shim |
|------------|----------------------|---------------|
| `env.SOUL_DB` (D1) | SQLite via `better-sqlite3` or Drizzle + Postgres | `local-d1.js` |
| `env.NET_PET_KV` | In-memory LRU + persistence to SQLite/JSON | `local-kv.js` |
| `LedgerDO`, `PetDO`, `CommandDO`, `MemoryDO` | In-memory classes with SQLite persistence | `local-do.js` |
| `caches.default` | `Map()` with TTL eviction | `local-cache.js` |
| `c.executionCtx.waitUntil()` | No-op in Node | Adapter shim |
| Workers `crypto` | Node `crypto` polyfill | Already available in Node 20+ |

---

## 4. DETERMINISTIC LOCALHOST STARTUP (desired end state)

```powershell
# Terminal 1: Local D1/KV/DO shim
node SCRIPTS/local-env.js --port 8788

# Terminal 2: Hono app on Node (no Workers bindings)
node src/node-server.js --port 8788

# Terminal 3: Static portal mirror
npx serve public -p 3000

# Terminal 4: Optional soul-logger replacement
node SCRIPTS/local-soul-logger.js --port 3001
```

**Actual current state:** None of the above exist. Only step 3 (static `public/`) can serve today.

---

## 5. WHAT IS MISSING

1. **No Node entrypoint** for `src/router.js` — currently imports `Hono` but assumes Worker runtime
2. **No SQLite database** for D1 tables — `CANON/DATA/` or `APPS/NET-PET-AI/data/` empty
3. **No KV shim** — session hints, SRS data, vocab lists only live in CF KV
4. **No Durable Object shim** — Pet/Ledger/Command/Memory state is volatile
5. **No local secrets** — `.env` with `DEEPGRAM_API_KEY`, `DEEPSEEK_API_KEY`, `PA_AUTH_KEY` not present in repo
6. **No static server manifest** — `wrangler.toml` assets binding maps to CF ASSETS, not local FS

---

## 6. FIRST WORKING LOCAL COMMANDS (today)

```powershell
# Serve static portals on localhost
npx serve public -p 3000

# Run local pipeline scans
pwsh -File SCRIPTS/forcemarch.ps1 --dry-run --zone CANON/HEAVY-LEDGER
pwsh -File SCRIPTS/obi.ps1 doctor

# Read current operational state
Get-Content CANON/SYSTEM/STATE-SNAPSHOT.json
Get-Content CANON/HEAVY-LEDGER/HL-720.json
```

---

## 7. DEATH PRIORITY (what to build first)

**P0:** `local-env.js` — single file that exports SOUL_DB, NET_PET_KV, PETS, LEDGER, MEMORY, COMMANDS as local shims  
**P1:** `node-server.js` — Node + Hono entrypoint that imports `src/router.js` with shimmed `env`  
**P1:** `local-soul-logger.js` — minimal `/api/soul/count` and `/api/soul/event` on localhost  
**P2:** `data/schema.sql` — D1 table DDL ported to SQLite  
**P2:** `.env.example` — enumerate all required secrets without values
