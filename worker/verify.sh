#!/bin/bash
KEY="754075Bullet12"
URL="https://phoenix-empire.mrmichaelhobbs1234.workers.dev/verifychain"

echo "🦅 CONNECTING TO PHOENIX OMEGA..."

# Hit the endpoint
RESPONSE=$(curl -s -X GET "$URL" -H "x-sovereign-key: $KEY")

# Check if we got a valid JSON response with "ok":true
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ SYSTEM ONLINE"
  echo "   STATUS: $RESPONSE"
else
  echo "❌ CONNECTION FAILED"
  echo "   RAW OUTPUT: $RESPONSE"
fi
