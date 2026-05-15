# PROOF - OPERATION(ZEN)-GPT-12(LAUNCHDAY) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-GPT-12(LAUNCHDAY).txt

* Create archive_legacy/
* Move any pre-existing worker entrypoints and wrangler files there
* Ensure only ONE entrypoint exists after the move (src/index.js or src/index.ts, not both)

If you leave both JS and TS entrypoints around, Wrangler will happily deploy the wrong one and youâ€™ll think the system is gaslighting you.

3. Wrangler config: Durable Objects + SQLite migration correctness
   This is the single most common drift point.

You have two migration styles in Cloudflare DO land:
