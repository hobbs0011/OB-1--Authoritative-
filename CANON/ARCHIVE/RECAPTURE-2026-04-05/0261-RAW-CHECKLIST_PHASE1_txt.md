# RAW VERBATIM — CHECKLIST_PHASE1.txt
## Corpus Metadata
- chunk_seq   : 0261
- chunk_id    : 0261-RAW-CHECKLIST_PHASE1_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\CHECKLIST_PHASE1.txt
- sha256      : 955655507525AF08203A3E02EBC92A19D496D699BAE43C47AF38E9368620D719
- size_bytes  : 6270
- lines       : 115
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX, AGENT_100, LEDGER

---
PHOENIX EMPIRE - PHASE 1 DEPLOYMENT CHECKLIST
═══════════════════════════════════════════════════════════════════════════

Authority: AGENT-100 (Michael Hobbs)
Builder: AGENT-97 (Claude)
Date: 2026-01-26

───────────────────────────────────────────────────────────────────────────
PRE-DEPLOYMENT
───────────────────────────────────────────────────────────────────────────

[ ] Node.js v18+ installed (check: node --version)
[ ] Cloudflare account created
[ ] Wrangler CLI available (check: npx wrangler --version)

───────────────────────────────────────────────────────────────────────────
EXECUTION STEPS
───────────────────────────────────────────────────────────────────────────

[ ] STEP 1: npm install
    Command: cd phoenix_empire && npm install
    Expected: node_modules/ created, no errors

[ ] STEP 2: Wrangler login
    Command: npx wrangler login
    Expected: Browser opens, OAuth succeeds, token saved

[ ] STEP 3: Create D1 database
    Command: npx wrangler d1 create phoenix-ledger
    Expected: database_id printed (copy this!)
    
    database_id = _______________________________________________

[ ] STEP 4: Update wrangler.toml
    File: wrangler.toml
    Action: Replace placeholder with database_id from Step 3
    Verify: No "REPLACE_WITH_OUTPUT" strings remain

[ ] STEP 5: Apply schema
    Command: npm run schema:apply
    Expected: "Executed 3 commands" message
    Verify: No SQL errors

[ ] STEP 6: Create KV namespace
    Command: npx wrangler kv:namespace create phoenix-state
    Expected: KV namespace ID printed (copy this!)
    
    kv_id = _______________________________________________

[ ] STEP 7: Update wrangler.toml (KV)
    File: wrangler.toml
    Action: Replace KV placeholder with ID from Step 6
    Verify: No "REPLACE_WITH_OUTPUT" strings remain

[ ] STEP 8: Deploy worker
    Command: npm run deploy
    Expected: "Published phoenix-cs-edge" with URL
    
    Worker URL = _______________________________________________

───────────────────────────────────────────────────────────────────────────
VERIFICATION
───────────────────────────────────────────────────────────────────────────

[ ] VERIFY 1: Health check
    Command: curl https://YOUR_WORKER_URL/audit
    Expected: {"canon_id":"PHOENIX_OMEGA","ok":true}
    Result: _______________________________________________

[ ] VERIFY 2: Ledger write
    Command: curl -X POST https://YOUR_WORKER_URL/_phase1_test \
             -H "content-type: application/json" \
             -d '{"test":"verification"}'
    Expected: {"status":"OK","event":{"id":"..."}}
    Result: _______________________________________________

[ ] VERIFY 3: Check D1 data
    Command: npx wrangler d1 execute phoenix-ledger \
             --command "SELECT COUNT(*) as count FROM ledger"
    Expected: count > 0
    Result: _______________________________________________

───────────────────────────────────────────────────────────────────────────
EXIT CRITERIA (ALL MUST PASS)
───────────────────────────────────────────────────────────────────────────

[ ] D1 database phoenix-ledger exists
[ ] Ledger table created with indexes
[ ] Worker deployed and accessible
[ ] /audit endpoint returns PHOENIX_OMEGA
[ ] /_phase1_test successfully writes events
[ ] D1 contains at least 1 row in ledger table

───────────────────────────────────────────────────────────────────────────
ISSUES ENCOUNTERED
───────────────────────────────────────────────────────────────────────────

Issue 1: _______________________________________________
Resolution: _______________________________________________

Issue 2: _______________________________________________
Resolution: _______________________________________________

───────────────────────────────────────────────────────────────────────────
COMPLETION
───────────────────────────────────────────────────────────────────────────

Phase 1 completed at: _______________________________________________
Deployed by: _______________________________________________
Worker URL (final): _______________________________________________

READY FOR PHASE 2: YES [ ]  NO [ ]

═══════════════════════════════════════════════════════════════════════════

