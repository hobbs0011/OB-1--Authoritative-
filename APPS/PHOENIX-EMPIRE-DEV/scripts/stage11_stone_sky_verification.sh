#!/bin/bash
echo "🦅 STAGE 11: STONE=SKY VERIFICATION"
require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing $1"; exit 1; }; }
require_cmd jq
require_cmd npx
TARGET_URL="https://phoenix-empire.mrmichaelhobbs1234.workers.dev"
D1_HEIGHT=$(npx wrangler d1 execute phoenix-ledger-main-db --command "SELECT MAX(height) as max_height FROM blocks" --json | jq -r '.[0].results[0].max_height // "NULL"' || echo "ERROR")
API_HEIGHT=$(curl -s "$TARGET_URL/verifychain" -H "x-sovereign-key: $SOVEREIGN_KEY" | jq -r '.height // "NULL"' || echo "ERROR")
echo "STONE (D1):  $D1_HEIGHT"
echo "SKY (API):   $API_HEIGHT"
if [[ "$D1_HEIGHT" == "$API_HEIGHT" && "$D1_HEIGHT" != "ERROR" ]]; then
  echo "✅ STONE=SKY VERIFIED"
else
  echo "❌ DRIFT DETECTED"
fi
