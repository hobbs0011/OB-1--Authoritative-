# Architecture

## Stack Map (Workers / DO / D1 / R2)
- Cloudflare Worker: `src/index.js` is the entrypoint configured by `wrangler.toml` (`main = "src/index.js"`).
- Durable Objects (DO): binding `PHOENIX_LEDGER` -> class `PhoenixLedgerZenith`.
- DO Storage: SQLite via `state.storage.sql` inside the Durable Object.
- D1: not configured (no `[[d1_databases]]` binding in `wrangler.toml`).
- R2: not configured (no `[[r2_buckets]]` binding in `wrangler.toml`).

## Request Flow
- Worker receives all requests and forwards them to the singleton Durable Object instance:
  - `env.PHOENIX_LEDGER.idFromName("singleton")`.
- Durable Object handles routes and persists state in its SQLite database.

## Durable Object Data Model
Tables created in `PhoenixLedgerZenith.init()`:
- `blocks`: append-only ledger entries.
- `receipts`: commit receipts keyed by `receipt_id`.
- `idempotency`: de-duplication by `command_id` with 24h TTL.
- `student_progress`: per-student stats for Tiger scoring.

## HTTP Endpoints (DO)
- `GET /health`: status, version, and total block count.
- `POST /emit`: authenticated, rate-limited append to `blocks`, returns receipt + optional Tiger score.
- `GET /audit`: full ledger export ordered by height.
- `GET /stats`: aggregates for blocks and student scoring.

## Security & Integrity
- Auth: bearer token via env var `PHOENIX_MASTER_KEY`.
- Hashing: canonical JSON -> SHA-256 for block hashes and receipts.
- Replay protection: monotonic nonce per `actor`.
- Rate limit: in-memory bucket per actor (`CANON.RATE_LIMIT`, 100/min).

## Migrations
Defined in `wrangler.toml`:
- `v36-1-delete-old`: removed `PhoenixDO`.
- `v36-2-create-new`: created SQLite class `PhoenixLedgerZenith`.
