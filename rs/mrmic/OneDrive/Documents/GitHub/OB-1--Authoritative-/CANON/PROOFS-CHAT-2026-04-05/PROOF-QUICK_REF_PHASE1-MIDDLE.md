# PROOF - QUICK_REF_PHASE1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\QUICK_REF_PHASE1.txt

â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

# List databases
npx wrangler d1 list

# Query ledger (remote)
npx wrangler d1 execute phoenix-ledger \
  --command "SELECT * FROM ledger ORDER BY ts DESC LIMIT 5"

# Count rows
