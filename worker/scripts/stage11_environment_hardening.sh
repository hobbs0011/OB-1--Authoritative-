#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_bin wrangler
require_env PHOENIX_D1_DB

TABLE="${PHOENIX_BLOCKS_TABLE:-blocks}"

# Check D1 connectivity
wrangler d1 execute "$PHOENIX_D1_DB" --command "SELECT 1;" >/dev/null

# Apply WAL + safety pragmas (idempotent)
wrangler d1 execute "$PHOENIX_D1_DB" --command "PRAGMA journal_mode=WAL;"
wrangler d1 execute "$PHOENIX_D1_DB" --command "PRAGMA synchronous=NORMAL;"
wrangler d1 execute "$PHOENIX_D1_DB" --command "PRAGMA busy_timeout=5000;"

# Verify table exists to confirm DB is accessible
exists_json=$(wrangler d1 execute "$PHOENIX_D1_DB" --command "SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE'" --json)
if ! echo "$exists_json" | grep -q "$TABLE"; then
  echo "⚠️  Blocks table '$TABLE' not found. WAL set but schema missing." >&2
fi

echo "✅ Stage 11 complete (WAL + safety pragmas applied)."
