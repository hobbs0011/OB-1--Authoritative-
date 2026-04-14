#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

require_base

# Placeholder: record migration request; actual ingest handled by external tool
payload='{"event":"STUDENT_MIGRATION","stage":17,"note":"Trigger external ingest"}'
ledger_append "{\"blockid\":\"stage17_migration\",\"payload\":$payload}"
