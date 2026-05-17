#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# auto-load env if present
ENV_FILE="${PHOENIX_ENV_FILE:-$ROOT_DIR/../config/phoenix.env}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

run_stage() {
  local name="$1"; shift
  echo "==> Running $name"
  "$@"
}

if [[ "${RUN_STAGE11:-1}" == "1" ]]; then run_stage "Stage11" "$SCRIPT_DIR/stage11_environment_hardening.sh"; fi
if [[ "${RUN_STAGE12:-0}" == "1" ]]; then run_stage "Stage12" "$SCRIPT_DIR/stage12_genesis_block.sh"; fi
if [[ "${RUN_STAGE13:-0}" == "1" ]]; then run_stage "Stage13" "$SCRIPT_DIR/stage13_deploy_monolith.sh"; fi
if [[ "${RUN_STAGE14:-0}" == "1" ]]; then run_stage "Stage14" "$SCRIPT_DIR/stage14_magic_chat_link.sh"; fi
if [[ "${RUN_STAGE15:-0}" == "1" ]]; then run_stage "Stage15" "$SCRIPT_DIR/stage15_drone_awakening.sh"; fi
if [[ "${RUN_STAGE16:-0}" == "1" ]]; then run_stage "Stage16" "$SCRIPT_DIR/stage16_revenue_ignition.sh"; fi
if [[ "${RUN_STAGE17:-0}" == "1" ]]; then run_stage "Stage17" "$SCRIPT_DIR/stage17_student_migration.sh"; fi
if [[ "${RUN_STAGE18:-0}" == "1" ]]; then run_stage "Stage18" "$SCRIPT_DIR/stage18_tiger_engine.sh"; fi
if [[ "${RUN_STAGE19:-0}" == "1" ]]; then run_stage "Stage19" "$SCRIPT_DIR/stage19_swarm_expansion.sh"; fi
if [[ "${RUN_STAGE20:-0}" == "1" ]]; then run_stage "Stage20" "$SCRIPT_DIR/stage20_immortality.sh"; fi

echo "✅ Pipeline complete (gated by RUN_STAGExx flags)"
