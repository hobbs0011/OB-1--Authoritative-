#!/usr/bin/env bash
set -euo pipefail

require_bin() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing required command: $1" >&2; exit 1; }; }

require_bin npx

# Allow caller to override
WORKER_DIR="${PHOENIX_WORKER_DIR:-/mnt/c/Users/mrmic/phoenix-empire/worker}"

if [[ ! -f "$WORKER_DIR/wrangler.toml" ]]; then
  echo "❌ wrangler.toml not found in $WORKER_DIR" >&2
  exit 1
fi

cd "$WORKER_DIR"

# Optional: force local wrangler home
if [[ -n "${WRANGLER_HOME:-}" ]]; then
  mkdir -p "$WRANGLER_HOME"
fi

# Deploy
npx wrangler deploy
