# PROOF - OPERATION(ZEN)-PLEXY-8 (PRELAUNCH KEY) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-8 (PRELAUNCH KEY).txt

Where: Worker router, /ledger/append and /verifychain block
Risk: Uses fixed actorId = "global" comment-saying dynamic in production; per-actor sharding invariant (â€œHOLE_5 CLOSEDâ€) is not actually enforced in this artifact.
Fix: Derive actorId deterministically from request (e.g., header x-actor-id or auth principal), reject missing/invalid actor IDs, and use that for idFromName('LEDGER_' + actorId).

Severity: P1
Where: /verifychain route mapping in worker vs DO
Risk: Worker forwards /verifychain to DO /verifychain, but scripts/verify.sh calls /verifychain directly on the worker, not /ledger/verifychain, creating surface mismatch with other Reality-C variants that use /ledger/verifychain.
Fix: Either expose /ledger/verifychain at worker level and update verify.sh accordingly, or alias /ledger/verifychain to the same handler to keep route naming consistent.

Severity: P1
