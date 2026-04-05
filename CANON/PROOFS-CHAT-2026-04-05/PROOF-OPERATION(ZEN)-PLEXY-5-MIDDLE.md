# PROOF - OPERATION(ZEN)-PLEXY-5 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-5.txt

scripts/multiprobe.sh hits /verifychain twice (or staging/prod) and compares height + root_hash, failing on mismatch.

CI job multi-pop-probe runs postâ€‘deploy and is required.

62 â€” WatchtowerDO as anomaly engine

Full DO storing snapshots and anomaly hashes; /watchtower reads from it, not adâ€‘hoc.

Any verifychain failure or severe anomaly is recorded and visible.

