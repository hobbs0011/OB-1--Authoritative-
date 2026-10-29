# STAGE PROTOCOL (server-side auto-seed)
Drop promotion candidates in /root/agent/stage/ as NEXT-LD11*.mjs or NEXT-WATER*.mjs (any transport: this station, Termius, anything).
The keeper, at each iteration start (driver never running then), node --checks the candidate: clean -> backup current (.bak-auto-ts) + promote + log AUTO-SEED; broken -> renamed .rejected-ts, current kept.
Never edit a RUNNING keeper script (bash re-reads). To change keeper itself: kill exact PID during its sleep, launch new file.
Caps: 20 runs each, exit 2 needs sovereign eyes. STOP / STOP-WATER files halt cleanly.
