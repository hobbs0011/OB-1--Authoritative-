#!/usr/bin/env bash
set -euo pipefail

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "❌ Missing required env: $name" >&2
    exit 1
  fi
}

require_bin() {
  local name="$1"
  command -v "$name" >/dev/null 2>&1 || { echo "❌ Missing required command: $name" >&2; exit 1; }
}

curl_json() {
  local method="$1"; shift
  local url="$1"; shift
  local key_header="${PHOENIX_HEADER_NAME:-x-sovereign-key}"
  local key_val="${SOVEREIGN_KEY:-}"
  local data="${1:-}"

  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "$url" \
      -H "$key_header: $key_val" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -sS -X "$method" "$url" \
      -H "$key_header: $key_val"
  fi
}

http_code() {
  local method="$1"; shift
  local url="$1"; shift
  local key_header="${PHOENIX_HEADER_NAME:-x-sovereign-key}"
  local key_val="${SOVEREIGN_KEY:-}"
  curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url" -H "$key_header: $key_val"
}

require_base() {
  require_env PHOENIX_BASE_URL
  require_env SOVEREIGN_KEY
}

ledger_append() {
  local payload_json="$1"
  curl_json POST "$PHOENIX_BASE_URL/ledgerappend" "$payload_json"
}

verifychain() {
  curl_json GET "$PHOENIX_BASE_URL/verifychain"
}
