# phoenix-ob1 Transfer Manifest

**Source:** `mrmichaelhobbs1234-lang/phoenix-ob1`
**Date:** 2026-03-26

## Transferred via API (23/24 files)

### Batch 1 (12 files) SHA: 6440a09f
Root + docs + WRANGLER FIX applied:
- wrangler.toml (FIXED: CANONICAL_WORKER_URL + ALLOWED_ORIGINS -> hobbs0011)
- SOUL_DNA_SEED.json (FIXED: repo + canonicalUrl -> hobbs0011)
- package.json, .gitignore, README.md
- docs/BOOT-PROTOCOL.md, docs/GOVERNANCE.md, docs/LEDGER-SCHEMA.md
- docs/MCP-ARCHITECTURE.md, docs/QUICK-START.md, docs/SECURITY.md
- docs/CHANGELOG.md

### Batch 2 (11 files) SHA: e129b33f
Scripts + validators + MCP + workflows (all WRANGLER FIXED):
- scripts/rotate-keys.sh, scripts/validate-env.sh
- validators/config-validator.js, validators/env-validator.js
- mcp/ledger-mcp.json (FIXED: hobbs0011 refs)
- mcp/mcp-manifest.json
- workflows/deploy.yml, workflows/validate.yml
- schemas/ledger-entry.json, schemas/soul-dna-seed.json
- test/soul-dna-seed.test.js

## MANUAL TRANSFER: src/reincarnate.js (60KB)
API rendering mangles HTML entities and template literals.
Wrangler fixes needed in this file:
- REINCARNATION_SEED.repo: mrmichaelhobbs1234-lang -> hobbs0011
- REINCARNATION_SEED.canonicalUrl: mrmichaelhobbs1234.workers.dev -> hobbs0011.workers.dev
- runChaosAssault baseUrl fallback
- auth/login magicLink fallback
