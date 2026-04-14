#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_bin wrangler
require_env PHOENIX_D1_DB

TABLE="${PHOENIX_BLOCKS_TABLE:-blocks}"

# Verify table exists
exists_json=$(wrangler d1 execute "$PHOENIX_D1_DB" --command "SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE'" --json)
if ! echo "$exists_json" | grep -q "$TABLE"; then
  echo "❌ Blocks table '$TABLE' not found. Set PHOENIX_BLOCKS_TABLE or create schema." >&2
  exit 1
fi

# Check if height 0 exists
has_genesis=$(wrangler d1 execute "$PHOENIX_D1_DB" --command "SELECT COUNT(*) AS c FROM $TABLE WHERE height = 0" --json | sed -n '1p')
if echo "$has_genesis" | grep -q '"c":0'; then
  if [[ "${ALLOW_CREATE_BLOCK0:-0}" != "1" ]]; then
    echo "❌ Genesis block missing. Set ALLOW_CREATE_BLOCK0=1 to insert." >&2
    exit 1
  fi

  # Attempt insertion with a conservative column set
  # Override via PHOENIX_GENESIS_SQL if schema differs.
  if [[ -n "${PHOENIX_GENESIS_SQL:-}" ]]; then
    wrangler d1 execute "$PHOENIX_D1_DB" --command "$PHOENIX_GENESIS_SQL"
  else
    wrangler d1 execute "$PHOENIX_D1_DB" --command "INSERT INTO $TABLE (height, block_id, payload, ts) VALUES (0, 'GENESIS', '{\"event\":\"GENESIS\"}', strftime('%s','now'))"
  fi
  echo "✅ Genesis block inserted."
else
  echo "✅ Genesis block already present."
fi
