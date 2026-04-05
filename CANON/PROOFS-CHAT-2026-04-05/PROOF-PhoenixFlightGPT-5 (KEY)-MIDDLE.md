# PROOF - PhoenixFlightGPT-5 (KEY) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixFlightGPT-5 (KEY).txt

  -d "$PAYLOAD")

# 3. FAIL-CLOSED LOGIC
if [[ "$HTTP_RESPONSE" =~ ^(200|201|409)$ ]]; then
    echo "[PHOENIX] SUCCESS ($HTTP_RESPONSE). CLEANING STAGE."
    rm "$STAGING_FILE" response_body.txt
elif [[ "$HTTP_RESPONSE" =~ ^(401|403)$ ]]; then
    echo "ðŸ›‘ [CRITICAL] AUTH_CONTRACT_VIOLATION ($HTTP_RESPONSE)"
    echo "DIAGNOSTICS: URL=$WRITE_URL | HDR=$HDR_NAME"
    exit 1
