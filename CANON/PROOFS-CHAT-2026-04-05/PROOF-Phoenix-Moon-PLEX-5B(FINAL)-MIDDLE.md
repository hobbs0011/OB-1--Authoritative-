# PROOF - Phoenix-Moon-PLEX-5B(FINAL) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Moon-PLEX-5B(FINAL).txt

const created_at = nowISO();

this.sql
.prepare(
`INSERT INTO blocks
(ledgerid, height, blockid, kind, agent, nonce, payload_canon, payload_hash, prev_hash, block_hash, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
)
.run(ledgerid, height, blockid, kind, agent, nonce, payload_canon, payload_hash, prev_hash, block_hash, created_at);

