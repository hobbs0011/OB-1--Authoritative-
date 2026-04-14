# Inventory

## File Types
- `.js`: 1 file
- `.toml`: 1 file
- `.md`: 2 files

## Entry Points
- Worker entrypoint: `src/index.js` (from `wrangler.toml` `main`).
- Durable Object class: `PhoenixLedgerZenith` in `src/index.js` (bound as `PHOENIX_LEDGER`).

## Key Scripts / Config
- `wrangler.toml`: Cloudflare Workers/DO configuration, migrations, compatibility flags.

## Repository Layout
- `src/index.js`: Worker + Durable Object implementation.
- `ARCHITECTURE.md`: stack map.
- `INVENTORY.md`: this file.
