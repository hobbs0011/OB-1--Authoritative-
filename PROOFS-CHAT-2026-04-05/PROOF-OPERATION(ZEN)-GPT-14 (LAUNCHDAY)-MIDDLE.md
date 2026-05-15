# PROOF - OPERATION(ZEN)-GPT-14 (LAUNCHDAY) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-GPT-14 (LAUNCHDAY).txt


It sets VERSION = "phoenix-rising-protocol-v1.2" in the health response.

It defines and exports exactly four Durable Objects (LedgerDO, SessionDO, RateLimiterDO, and MemoryDO).

It routes /health, /chat, /ledger, /ledger/verify, /ledger/append, /ratelimiter/info, /make/incoming, and the admin stubs.

The /ratelimiter/info handler uses env.RATELIMITER.idFromName(key).

It ends with a single export statement:
