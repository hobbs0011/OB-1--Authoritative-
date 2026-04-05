# PROOF - OPERATION(ZEN)-PLEXY-7 (RETARD) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-7 (RETARD).txt

echo "Cleaning up $TMP"
rm -rf "$TMP" || true
}
trap cleanup EXIT

echo "[warmup] /health"
curl -sS -w " code=%{http_code} time=%{time_total}\n" "$BASE/health" || true
echo "[warmup] /verifychain"
curl -sS -w " code=%{http_code} time=%{time_total}\n" "$BASE/verifychain" || true

