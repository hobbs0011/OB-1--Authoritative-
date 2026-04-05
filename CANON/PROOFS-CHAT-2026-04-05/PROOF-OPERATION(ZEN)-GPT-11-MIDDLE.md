# PROOF - OPERATION(ZEN)-GPT-11 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-GPT-11.txt

  -X POST "$WORKER_URL/ledger/append" -H "content-type: application/json" \
  -d '{"actor_id":"chaos","nonce":1,"command_id":"cmd_freeze_1","type":"CHAOS","payload":{}}')"
test "$code" = "409" || { echo "expected 409 got $code"; cat /tmp/append.json; exit 1; }
jq -e '(.ok==false) and (.code=="FROZEN")' /tmp/append.json >/dev/null
echo "OK frozen append blocked"

echo "[5] freeze OFF (admin)"
curl -fsS -X POST "$WORKER_URL/admin/unfreeze" -H "$H_SOV" -H "content-type: application/json" \
  -d '{"reason":"chaos_smoke"}' | jq -e '(.ok==true) and (.frozen==false)' >/dev/null
echo "OK unfreeze"
