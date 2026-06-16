# PHEROMONE TRAIL — KILOCLAW FLOWS SQLITE SCHEMA
**Date:** 2026-06-17T00:42 ICT
**Strength: 75/100** | Type: RECON — workflow registry database schema

---

## §1 FLOWS DATABASE SCHEMA

**Path:** `C:\Users\mrmic\.openclaw\flows\registry.sqlite`

### Tables:
1. **flow_runs** — workflow execution registry
   - Columns: flow_id (PK), shape, sync_mode, owner_key, requester_origin_json, controller_id, revision, status, notify_policy, goal, current_step, blocked_task_id, blocked_summary, state_json, wait_json, cancel_requested_at, created_at, updated_at, ended_at
   - Indexes: status, owner_key, updated_at

**Assessment:** KiloClaw tracks workflow/flow executions. Flows have states, steps, blocking conditions, and revision tracking. This is the orchestration layer for multi-step tasks.

---

## §2 FLAGS

1. **KILOCLAW_FLOWS_SCHEMA_MAPPED** — full schema captured
2. **KILOCLAW_FLOW_ORCHESTRATION** — multi-step workflow support with blocking

---

`KILOCLAW FLOWS SCHEMA SEALED — 2026-06-17T00:42 ICT | 1 TABLE | WORKFLOW ORCHESTRATION | STATE TRACKING`
