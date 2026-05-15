# PROOF - Phoenix-Transend-PLX-1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Transend-PLX-1.txt

-H "x-chat-key: $CHAT_KEY" \
-d "{\"message\":\"$GREETING\",\"session_id\":\"test-$GREETING\",\"display\":\"Agent-100\"}" \
| jq -r '.response'
echo "---"
done

# Expected: All return <20 words, NO citations, provider="OBI (LOCAL)"

Step 51-55: Research Gate Tests
bash
