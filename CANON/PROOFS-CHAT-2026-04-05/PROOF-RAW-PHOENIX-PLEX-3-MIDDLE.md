# PROOF - RAW-PHOENIX-PLEX-3 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\RAW-PHOENIX-PLEX-3.txt


// If bloom says â€œhitâ€, we already did deterministic check above; safe to proceed.

// Opportunistic purge every ~256 requests (no alarm dependency)
this.reqCounter = (this.reqCounter + 1) & 0xff;
if (this.reqCounter === 0) {
const cutoff = now - CANON.REPLAY_WINDOW_MS;
sql.exec(`DELETE FROM recent_nonces WHERE ts < ?`, cutoff);
}
}
