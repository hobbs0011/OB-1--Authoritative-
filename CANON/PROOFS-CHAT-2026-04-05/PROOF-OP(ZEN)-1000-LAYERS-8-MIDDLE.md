# PROOF - OP(ZEN)-1000-LAYERS-8 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OP(ZEN)-1000-LAYERS-8.txt

It then derives an idempotency key like H = SHA-256(actor + commandid + payload_sha256).
â€‹

SQLite enforces a UNIQUE constraint on (actor, nonce) (and/or (actor, commandid)), returning 409 on conflict.
â€‹

Consequences:

Same actor + commandid + identical payload â†’ same hash, safe idempotent replay (e.g., retry after network glitch) returns prior result, does not double-execute.
â€‹
