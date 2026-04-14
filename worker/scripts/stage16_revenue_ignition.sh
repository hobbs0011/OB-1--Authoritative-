#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_base

payload='{"event":"REVENUE_STRIKE","amount":10000000,"currency":"VND","stage":16}'
ledger_append "{\"blockid\":\"rev_000001\",\"payload\":$payload}"
