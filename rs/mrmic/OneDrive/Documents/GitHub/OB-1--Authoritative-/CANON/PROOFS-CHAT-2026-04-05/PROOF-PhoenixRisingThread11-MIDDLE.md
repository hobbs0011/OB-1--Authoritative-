# PROOF - PhoenixRisingThread11 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixRisingThread11.txt

â€‹
Finding 3: Alarms are at-least-once, retried with exponential backoff starting at 2 seconds, up to 6 retries, and only one alarm exists per DO; your â€œbatch flush every minuteâ€ will create unnecessary wakeups unless you schedule only when dirty.
â€‹
Finding 4: Analytics Engine is write-only for datapoints from Workers; itâ€™s observability, not enforcementâ€”â€œmilitant governanceâ€ must still be in DO code paths and storage constraints.
Finding 5: Your Bloom bit-ops currently update SQLite BLOB rows on first-miss per hash, which is worst-case 7 reads + up to 7 writes per request; that is the write amplification you claimed to eliminate. ]
â€‹
â€‹

[SOURCES:
[Rules of Durable Objects] - Cloudflare Developers - 2025-12-31 - 
