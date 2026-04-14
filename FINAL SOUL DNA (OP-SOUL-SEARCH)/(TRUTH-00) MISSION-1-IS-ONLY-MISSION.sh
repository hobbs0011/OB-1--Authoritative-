#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# PHOENIX RISING PROTOCOL — verify.sh
# Read-only invariant check. Exits nonzero on drift.
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[✅ PASS]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠️  WARN]${NC} $1"; }
fail() { echo -e "${RED}[❌ FAIL]${NC} $1"; ERRORS=$((ERRORS + 1)); }
log()  { echo -e "${PURPLE}[VERIFY]${NC} $1"; }

ERRORS=0

# ── CONFIGURATION ────────────────────────────────────────────
WORKER_URL="${WORKER_URL:-https://phoenix-rising-protocol.YOURSUBDOMAIN.workers.dev}"
SOVEREIGN_KEY="${SOVEREIGN_KEY:-}"

log "Phoenix Rising Protocol — Verification Suite"
log "Target: $WORKER_URL"
log "─────────────────────────────────────────────"

# ── TEST 1: Health endpoint ──────────────────────────────────
log "Test 1: GET /health (public)"
HEALTH=$(curl -sf "$WORKER_URL/health" 2>/dev/null) || { fail "Health endpoint unreachable"; HEALTH="{}"; }

if echo "$HEALTH" | grep -q '"ok":true'; then
  ok "Health: ok=true"
else
  fail "Health: ok!=true — Response: $HEALTH"
fi

if echo "$HEALTH" | grep -q '"gospel":444'; then
  ok "Gospel: 444"
else
  fail "Gospel check failed — not 444"
fi

if echo "$HEALTH" | grep -q 'PHOENIX-RISING'; then
  ok "Version contains PHOENIX-RISING"
else
  fail "Version string drift"
fi

# ── TEST 2: 404 returns JSON ────────────────────────────────
log "Test 2: GET /nonexistent (404 JSON check)"
NOTFOUND=$(curl -sf -o /dev/null -w "%{content_type}" "$WORKER_URL/nonexistent" 2>/dev/null) || true
if echo "$NOTFOUND" | grep -q 'application/json'; then
  ok "404 returns JSON (no HTML leak)"
else
  fail "404 returns non-JSON content-type: $NOTFOUND"
fi

# ── TEST 3: Auth fail-closed ─────────────────────────────────
log "Test 3: POST /ledger/append without auth (should 401)"
AUTH_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/ledger/append" \
  -H "Content-Type: application/json" -d '{"blockid":"test"}' 2>/dev/null) || true
if [[ "$AUTH_CODE" == "401" ]]; then
  ok "Auth: 401 on missing key"
elif [[ "$AUTH_CODE" == "503" ]]; then
  ok "Auth: 503 (SOVEREIGN_KEY not configured — expected before secret is set)"
else
  fail "Auth: expected 401 or 503, got $AUTH_CODE"
fi

# ── TEST 4: Wrong key returns 403 ───────────────────────────
log "Test 4: POST /ledger/append with wrong key (should 403)"
WRONG_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/ledger/append" \
  -H "Content-Type: application/json" \
  -H "x-sovereign-key: DEFINITELY_WRONG_KEY" \
  -d '{"blockid":"test"}' 2>/dev/null) || true
if [[ "$WRONG_CODE" == "403" ]]; then
  ok "Auth: 403 on wrong key"
elif [[ "$WRONG_CODE" == "503" ]]; then
  ok "Auth: 503 (SOVEREIGN_KEY not configured yet)"
else
  fail "Auth: expected 403 or 503, got $WRONG_CODE"
fi

# ── TEST 5: Chain verification ───────────────────────────────
if [[ -n "$SOVEREIGN_KEY" ]]; then
  log "Test 5: GET /verifychain (admin)"
  VERIFY=$(curl -sf "$WORKER_URL/verifychain" \
    -H "x-sovereign-key: $SOVEREIGN_KEY" 2>/dev/null) || { fail "Verifychain unreachable"; VERIFY="{}"; }

  if echo "$VERIFY" | grep -q '"valid":true'; then
    ok "Chain: valid=true (Stone=Sky MATCH)"
  else
    fail "Chain: valid!=true — Response: $VERIFY"
  fi

  # Check genesis exists
  if echo "$VERIFY" | grep -q '"height":'; then
    HEIGHT=$(echo "$VERIFY" | grep -oP '"height":\s*\K[0-9]+' || echo "-1")
    ok "Chain height: $HEIGHT"
  fi
else
  warn "Test 5: SKIPPED (no SOVEREIGN_KEY in environment)"
fi

# ── TEST 6: Revenue total ───────────────────────────────────
if [[ -n "$SOVEREIGN_KEY" ]]; then
  log "Test 6: GET /revenue/total (admin)"
  REV=$(curl -sf "$WORKER_URL/revenue/total" \
    -H "x-sovereign-key: $SOVEREIGN_KEY" 2>/dev/null) || { fail "Revenue endpoint unreachable"; REV="{}"; }

  if echo "$REV" | grep -q '"ok":true'; then
    TOTAL=$(echo "$REV" | grep -oP '"total_vnd":\s*\K[0-9]+' || echo "0")
    ok "Revenue total: $TOTAL VND"
  else
    fail "Revenue total failed: $REV"
  fi
else
  warn "Test 6: SKIPPED (no SOVEREIGN_KEY)"
fi

# ── TEST 7: CORS headers ────────────────────────────────────
log "Test 7: OPTIONS preflight (CORS)"
CORS_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X OPTIONS "$WORKER_URL/health" 2>/dev/null) || true
if [[ "$CORS_CODE" == "204" ]]; then
  ok "CORS: 204 on OPTIONS"
else
  warn "CORS: expected 204, got $CORS_CODE"
fi

# ── SUMMARY ──────────────────────────────────────────────────
echo ""
log "═══════════════════════════════════════════════════"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "${GREEN}  🦅 ALL CHECKS PASSED — STONE = SKY${NC}"
else
  echo -e "${RED}  ❌ $ERRORS CHECK(S) FAILED — DRIFT DETECTED${NC}"
fi
log "═══════════════════════════════════════════════════"

exit $ERRORS
