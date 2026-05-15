# PROOF - PhoenixRisingThread6 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixRisingThread6.txt

op: e.g. "M2_REVENUE_EVENT",

nonce: per-actor strictly increasing,

payload: canonical JSON with VND amounts, channel, product, ManyChat IDs.

Treat any non-200 or PANIC* as â€œevent did not happenâ€; never update internal counters without a ledger block.
â€‹

5. Implement Tiger Confidence + SIGHT fields
