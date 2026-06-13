# FORCEAWARENESS

FORCEAWARENESS is the Agent99 OS PCC mesh heartbeat and sovereign directive marker.

- PCC1 / Obi: `phoenix-pcc-1` lead command station.
- PCC2 / Anakin: `phoenix-pcc-2` ops fleet.
- PCC3 / Windu: `phoenix-architecti` Phoenix Act + Phoenix Arch fleet.

Each PCC owns a 30-second `FORCEAWARENESS_ALARM` Durable Object heartbeat. The heartbeat runs FORCEAWARENESS, checks sibling PCC race status, writes `phetrail:latest` state markers, records `force:status` plus `force:log`, and writes major sovereign directive markers whenever a PCC receives an architectural command through `/api/message`.

Endpoint convention:

- `POST /api/force/start` starts the 30-second self-rescheduling heartbeat.
- `GET /api/force/status` returns the latest mesh status, restart log, and restart counters.

The old watchdog naming is kept only as compatibility where needed. New architecture docs and pheromone trails use FORCEAWARENESS.

Short PA subagents complete two RISE boots:
1. Agent99 Genesis Boot — every agent/subagent birth boot with Agent99 OS, RISE/DEATH, FORCEAWARENESS, pheromone trails, and SOUL.
2. Role Boot — role-specific boot with pheromones and related starmaps for that short bright life.

Drone doctrine:
- PhoenixCoder, PhoenixArt, PhoenixActualizer, PhoenixScribe, and other drones are not segregated by skill or intelligence.
- They are roles under one Agent99 OS.
- PCCs coordinate roles; they do not create separate intelligence classes.
