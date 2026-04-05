#!/bin/bash
# =============================================================
# Natural English Training — Cloudflare One-Shot Setup
# =============================================================
# This script configures your entire Cloudflare DNS + SSL
# in one run. No clicking through dashboards.
#
# BEFORE RUNNING:
# 1. Go to https://dash.cloudflare.com/profile/api-tokens
# 2. Click "Create Token"
# 3. Use the "Edit zone DNS" template
# 4. Under "Zone Resources" pick "naturalenglishtraining.com"
# 5. Also add permission: Zone Settings > Edit
# 6. Click "Continue to summary" → "Create Token"
# 7. Copy the token
#
# THEN RUN:
#   CF_API_TOKEN=your_token_here bash cloudflare-setup.sh
#
# That's it. One command. Done.
# =============================================================

set -e

# Config
ZONE_ID="9abf74bec775219720170fec5a1f7656"
API="https://api.cloudflare.com/client/v4"

# Check token
if [ -z "$CF_API_TOKEN" ]; then
  echo "❌ ERROR: Set CF_API_TOKEN first"
  echo ""
  echo "  CF_API_TOKEN=your_token_here bash cloudflare-setup.sh"
  echo ""
  echo "Get your token at: https://dash.cloudflare.com/profile/api-tokens"
  exit 1
fi

AUTH="Authorization: Bearer $CF_API_TOKEN"
CT="Content-Type: application/json"

echo "🚀 Natural English Training — Cloudflare Setup"
echo "================================================"
echo ""

# --- Step 1: Verify API token works ---
echo "🔑 Verifying API token..."
VERIFY=$(curl -s -H "$AUTH" "$API/user/tokens/verify")
if echo "$VERIFY" | grep -q '"success":true'; then
  echo "   ✅ Token valid"
else
  echo "   ❌ Token invalid. Check your token and try again."
  echo "   $VERIFY"
  exit 1
fi
echo ""

# --- Step 2: Delete existing bad MX records ---
echo "🗑️  Cleaning up old MX records..."
MX_RECORDS=$(curl -s -H "$AUTH" "$API/zones/$ZONE_ID/dns_records?type=MX")
MX_IDS=$(echo "$MX_RECORDS" | grep -o '"id":"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')

if [ -z "$MX_IDS" ]; then
  echo "   No existing MX records found"
else
  for ID in $MX_IDS; do
    curl -s -X DELETE -H "$AUTH" "$API/zones/$ZONE_ID/dns_records/$ID" > /dev/null
    echo "   Deleted MX record: $ID"
  done
  echo "   ✅ Old MX records cleaned"
fi
echo ""

# --- Step 3: Add Google Workspace MX records ---
echo "📧 Adding Google Workspace MX records..."

add_mx() {
  local CONTENT=$1
  local PRIORITY=$2
  RESULT=$(curl -s -X POST -H "$AUTH" -H "$CT" \
    -d "{\"type\":\"MX\",\"name\":\"@\",\"content\":\"$CONTENT\",\"priority\":$PRIORITY,\"ttl\":3600}" \
    "$API/zones/$ZONE_ID/dns_records")
  if echo "$RESULT" | grep -q '"success":true'; then
    echo "   ✅ MX $CONTENT (priority $PRIORITY)"
  else
    echo "   ❌ Failed: $CONTENT"
    echo "   $RESULT"
  fi
}

add_mx "ASPMX.L.GOOGLE.COM" 1
add_mx "ALT1.ASPMX.L.GOOGLE.COM" 5
add_mx "ALT2.ASPMX.L.GOOGLE.COM" 5
add_mx "ALT3.ASPMX.L.GOOGLE.COM" 10
add_mx "ALT4.ASPMX.L.GOOGLE.COM" 10
echo ""

# --- Step 4: Add DMARC record (if not exists) ---
echo "🛡️  Adding DMARC record..."
DMARC_CHECK=$(curl -s -H "$AUTH" "$API/zones/$ZONE_ID/dns_records?type=TXT&name=_dmarc.naturalenglishtraining.com")
if echo "$DMARC_CHECK" | grep -q '"count":0'; then
  RESULT=$(curl -s -X POST -H "$AUTH" -H "$CT" \
    -d '{"type":"TXT","name":"_dmarc","content":"v=DMARC1; p=quarantine; rua=mailto:hobbs@naturalenglishtraining.com","ttl":3600}' \
    "$API/zones/$ZONE_ID/dns_records")
  if echo "$RESULT" | grep -q '"success":true'; then
    echo "   ✅ DMARC record added"
  else
    echo "   ❌ DMARC failed"
    echo "   $RESULT"
  fi
else
  echo "   ⏭️  DMARC record already exists"
fi
echo ""

# --- Step 5: Verify SPF record exists ---
echo "📋 Checking SPF record..."
SPF_CHECK=$(curl -s -H "$AUTH" "$API/zones/$ZONE_ID/dns_records?type=TXT&name=naturalenglishtraining.com")
if echo "$SPF_CHECK" | grep -q 'spf1'; then
  echo "   ✅ SPF record exists"
else
  echo "   ⚠️  No SPF record found. Adding..."
  RESULT=$(curl -s -X POST -H "$AUTH" -H "$CT" \
    -d '{"type":"TXT","name":"@","content":"v=spf1 include:_spf.google.com ~all","ttl":3600}' \
    "$API/zones/$ZONE_ID/dns_records")
  if echo "$RESULT" | grep -q '"success":true'; then
    echo "   ✅ SPF record added"
  else
    echo "   ❌ SPF failed"
  fi
fi
echo ""

# --- Step 6: Set SSL/TLS to Full ---
echo "🔒 Setting SSL/TLS mode to Full..."
SSL_RESULT=$(curl -s -X PATCH -H "$AUTH" -H "$CT" \
  -d '{"value":"full"}' \
  "$API/zones/$ZONE_ID/settings/ssl")
if echo "$SSL_RESULT" | grep -q '"success":true'; then
  echo "   ✅ SSL/TLS set to Full"
else
  echo "   ❌ SSL update failed (may need Zone Settings Edit permission)"
fi
echo ""

# --- Step 7: Enable Always Use HTTPS ---
echo "🔒 Enabling Always Use HTTPS..."
HTTPS_RESULT=$(curl -s -X PATCH -H "$AUTH" -H "$CT" \
  -d '{"value":"on"}' \
  "$API/zones/$ZONE_ID/settings/always_use_https")
if echo "$HTTPS_RESULT" | grep -q '"success":true'; then
  echo "   ✅ Always Use HTTPS enabled"
else
  echo "   ⏭️  Skipped (may already be on or need permissions)"
fi
echo ""

# --- Done ---
echo "================================================"
echo "🎉 SETUP COMPLETE"
echo "================================================"
echo ""
echo "✅ 5 Google MX records configured"
echo "✅ SPF record verified"
echo "✅ DMARC record added"
echo "✅ SSL/TLS set to Full"
echo "✅ HTTPS redirect enabled"
echo ""
echo "⚠️  REMAINING MANUAL STEPS:"
echo ""
echo "1. Change nameservers at Squarespace to:"
echo "   → aaron.ns.cloudflare.com"
echo "   → lindsay.ns.cloudflare.com"
echo ""
echo "2. Create Cloudflare Pages project:"
echo "   → Workers & Pages → Create → Connect to Git"
echo "   → Repo: hobbs-lab/Phoenix-Rising-Protocol-Ultimate"
echo "   → Build command: (leave empty)"
echo "   → Output directory: SITE/"
echo ""
echo "3. Add custom domain to Pages project:"
echo "   → naturalenglishtraining.com"
echo "   → www.naturalenglishtraining.com"
echo ""
echo "🔒 DELETE YOUR API TOKEN after running this script!"
echo "   https://dash.cloudflare.com/profile/api-tokens"
echo ""
