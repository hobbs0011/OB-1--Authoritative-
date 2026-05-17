#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_base

payload='{"event":"IMMORTALITY_SEAL","stage":20,"note":"Auto mode enabled"}'
ledger_append "{\"blockid\":\"stage20_immortality\",\"payload\":$payload}"
