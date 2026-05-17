#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_base

payload='{"event":"SWARM_EXPANSION","stage":19,"drones":10,"mode":"COLLECTOR"}'
ledger_append "{\"blockid\":\"stage19_swarm\",\"payload\":$payload}"
