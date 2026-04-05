# PROOF - OP(ZEN)-DEPLOY.FAIL-2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OP(ZEN)-DEPLOY.FAIL-2.txt

echo "Warmup /ledger/head"
hh="$(curl_get_small "$HEAD_URL")"; echo "  status=${hh%%|*} ms=$(cut -d'|' -f2 <<<"$hh")"
echo ""

END_EPOCH=$(( $(date +%s) + SECONDS ))

sleep_ms() {
  local ms="$1"
  (( ms <= 0 )) && return 0
  # bash-friendly ms sleep via python if present else fallback to 0.01 granularity
