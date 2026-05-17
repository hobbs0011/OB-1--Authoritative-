#!/bin/bash
set -euo pipefail

# CONFIG
TARGET_URL="https://phoenix-empire.mrmichaelhobbs1234.workers.dev"

# CHECK KEY
if [[ -z "${SOVEREIGN_KEY:-}" ]]; then
  echo "❌ ERROR: SOVEREIGN_KEY is missing. Export it first."
  exit 1
fi

echo "🦅 PROBING GENESIS STATE (STONE vs SKY)..."

# QUERY STONE (D1)
# Note: Using the binding name from wrangler.toml
D1_OUT=$(npx wrangler d1 execute phoenix-ledger-main-db \
  --command "SELECT MAX(height) as h FROM blocks" --json)
STONE=$(echo "$D1_OUT" | jq -r '.[0].results[0].h')

if [[ "$STONE" == "null" ]]; then STONE=0; fi

# QUERY SKY (API)
SKY_JSON=$(curl -s "$TARGET_URL/verifychain" -H "x-sovereign-key: $SOVEREIGN_KEY")
SKY=$(echo "$SKY_JSON" | jq -r '.height')

echo "   STONE (D1):  $STONE"
echo "   SKY (API):   $SKY"

if [[ "$STONE" == "$SKY" ]]; then
  echo "✅ MATCH CONFIRMED: GENESIS ZERO."
else
  echo "❌ DRIFT DETECTED."
  exit 1
fi
