#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_env PHOENIX_BASE_URL

MAGIC_CHAT_HTML="${PHOENIX_MAGIC_CHAT_HTML:-/mnt/c/Users/mrmic/phoenix-empire/magic-chat/index.html}"
CMD_STATION_HTML="${PHOENIX_COMMAND_STATION_HTML:-/mnt/c/Users/mrmic/phoenix-empire/command-station/index.html}"

patch_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    # Replace the API base if a const A=... exists
    sed -i "s|^const A=.*|const A=\"$PHOENIX_BASE_URL\";|" "$f" || true
  fi
}

patch_file "$MAGIC_CHAT_HTML"
patch_file "$CMD_STATION_HTML"

echo "✅ Magic Chat endpoints patched (if files present)."
