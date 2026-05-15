# PROOF - PhoenixFlightPlexy-2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixFlightPlexy-2.txt

http_json_strict() {
local method="$1"; shift
local url="$1"; shift
local data="${1:-}"

local tmp code
tmp="$(mktemp)"

if [[ -n "$data" ]]; then
code="$(curl -sS -o "$tmp" -w "%{http_code}" \
