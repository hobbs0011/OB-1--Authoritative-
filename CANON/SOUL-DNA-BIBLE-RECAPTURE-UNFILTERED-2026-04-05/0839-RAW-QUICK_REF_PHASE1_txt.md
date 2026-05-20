# RAW VERBATIM — QUICK_REF_PHASE1.txt
## Corpus Metadata
- chunk_seq   : 0839
- chunk_id    : 0839-RAW-QUICK_REF_PHASE1_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\QUICK_REF_PHASE1.txt
- sha256      : 287A3F9BD558F3C6FF13F9ACDCA806FF0262EF74F7CF907FF9886DE81813DAE4
- size_bytes  : 6071
- lines       : 107
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX, LEDGER

---
╔═══════════════════════════════════════════════════════════════════════════╗
║ PHOENIX EMPIRE - PHASE 1 QUICK REFERENCE                                 ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────────────┐
│ ESSENTIAL COMMANDS (Copy-Paste Ready)                                    │
──────────────────────────────────────────────────────────────────────────┘

# Install
npm install

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create phoenix-ledger

# Apply schema (remote)
npm run schema:apply

# Create KV namespace
npx wrangler kv:namespace create phoenix-state

# Deploy
npm run deploy

# Local dev
npm run dev

┌───────────────────────────────────────────────────────────────────────────┐
│ TESTING                                                                   │
──────────────────────────────────────────────────────────────────────────┘

# Health check
curl https://YOUR_WORKER.workers.dev/audit

# Ledger write test
curl -X POST https://YOUR_WORKER.workers.dev/_phase1_test \
  -H "content-type: application/json" \
  -d '{"test":"manual"}'

# Local test
curl -X POST http://localhost:8787/_phase1_test \
  -H "content-type: application/json" \
  -d '{"test":"local"}'

┌───────────────────────────────────────────────────────────────────────────┐
│ D1 QUERIES                                                                │
──────────────────────────────────────────────────────────────────────────┘

# List databases
npx wrangler d1 list

# Query ledger (remote)
npx wrangler d1 execute phoenix-ledger \
  --command "SELECT * FROM ledger ORDER BY ts DESC LIMIT 5"

# Count rows
npx wrangler d1 execute phoenix-ledger \
  --command "SELECT COUNT(*) as total FROM ledger"

# Query by type
npx wrangler d1 execute phoenix-ledger \
  --command "SELECT * FROM ledger WHERE type='PHASE1_TEST'"

# Check schema
npx wrangler d1 execute phoenix-ledger \
  --command "SELECT sql FROM sqlite_master WHERE type='table'"

┌───────────────────────────────────────────────────────────────────────────┐
│ TROUBLESHOOTING                                                           │
──────────────────────────────────────────────────────────────────────────┘

# Verify wrangler.toml syntax
npx wrangler deploy --dry-run

# Check logs (live tail)
npm run tail

# Delete and recreate D1 (DESTRUCTIVE)
npx wrangler d1 delete phoenix-ledger
npx wrangler d1 create phoenix-ledger
# Then re-apply schema

# Re-apply schema (idempotent)
npm run schema:apply

┌───────────────────────────────────────────────────────────────────────────┐
│ FILES TO UPDATE BEFORE DEPLOY                                            │
──────────────────────────────────────────────────────────────────────────┘

wrangler.toml:
  - Line 8: database_id from 'wrangler d1 create' output
  - Line 14: KV namespace id from 'wrangler kv:namespace create' output

┌───────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 EXIT CRITERIA                                                    │
──────────────────────────────────────────────────────────────────────────┘

✅ /audit returns {"canon_id":"PHOENIX_OMEGA","ok":true}
✅ /_phase1_test successfully writes to D1
✅ Query returns count > 0

╔═══════════════════════════════════════════════════════════════════════════╗
║ NEXT: PHASE 2 (MPCP Energy System)                                       ║
╚═══════════════════════════════════════════════════════════════════════════╝


