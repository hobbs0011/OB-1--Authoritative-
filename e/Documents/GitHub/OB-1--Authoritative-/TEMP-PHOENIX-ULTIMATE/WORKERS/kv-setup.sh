#!/bin/bash
# ============================================
# KV Namespace Setup — Natural English Training
# Run this in Ubuntu terminal with your Cloudflare API token
# ============================================

# CONFIGURE THESE
CF_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"  # Replace with your token
CF_ACCOUNT_ID="8717160562faa73b9eebb0a51f988785"

echo "🔧 Creating Cloudflare KV Namespaces..."
echo "=========================================="

# Create WAITLIST namespace
echo ""
echo "📋 Creating WAITLIST namespace..."
WAITLIST_RESULT=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"title": "NET-OBI-WAITLIST"}')

WAITLIST_ID=$(echo $WAITLIST_RESULT | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result']['id'] if r['success'] else 'FAILED: '+str(r.get('errors',[])))")
echo "   WAITLIST namespace ID: $WAITLIST_ID"

# Create SESSIONS namespace
echo ""
echo "💬 Creating SESSIONS namespace..."
SESSIONS_RESULT=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"title": "NET-OBI-SESSIONS"}')

SESSIONS_ID=$(echo $SESSIONS_RESULT | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result']['id'] if r['success'] else 'FAILED: '+str(r.get('errors',[])))")
echo "   SESSIONS namespace ID: $SESSIONS_ID"

echo ""
echo "=========================================="
echo "✅ DONE! Now update WORKERS/wrangler.toml:"
echo ""
echo "[[kv_namespaces]]"
echo "binding = \"WAITLIST\""
echo "id = \"$WAITLIST_ID\""
echo ""
echo "[[kv_namespaces]]"
echo "binding = \"SESSIONS\""
echo "id = \"$SESSIONS_ID\""
echo ""
echo "=========================================="
echo "Then deploy: wrangler deploy"
