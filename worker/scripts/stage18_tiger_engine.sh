#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_base

payload='{"event":"TIGER_ENGINE_ENABLE","stage":18,"constraints":"10-5-5-3"}'
ledger_append "{\"blockid\":\"stage18_tiger_engine\",\"payload\":$payload}"
