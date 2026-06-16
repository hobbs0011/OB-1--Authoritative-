# PHEROMONE TRAIL — KILOCLAW TASKS SQLITE SCHEMA
**Date:** 2026-06-17T00:41 ICT
**Strength: 75/100** | Type: RECON — task execution database schema

---

## §1 TASKS DATABASE SCHEMA

**Path:** `C:\Users\mrmic\.openclaw\tasks\runs.sqlite`

### Tables:
1. **task_runs** — main task execution history
   - Columns: task_id, runtime, task_kind, source_id, requester_session_key, owner_key, scope_kind, child_session_key, parent_flow_id, parent_task_id, agent_id, run_id, label, task, status, delivery_status, notify_policy, created_at, started_at, ended_at, last_event_at, cleanup_after, error, progress_summary, terminal_summary, terminal_outcome
   - Indexes: run_id, status, runtime_status, cleanup_after, last_event_at, owner_key, parent_flow_id, child_session_key

2. **task_delivery_state** — task delivery tracking
   - Columns: task_id, requester_origin_json, last_notified_event_at

**Assessment:** KiloClaw tracks every task execution with full audit trail. Supports parent/child task hierarchies, delivery tracking, error logging.

---

## §2 FLAGS

1. **KILOCLAW_TASKS_SCHEMA_MAPPED** — full schema captured
2. **KILOCLAW_TASK_HIERARCHY** — parent_flow_id + parent_task_id support

---

`KILOCLAW TASKS SCHEMA SEALED — 2026-06-17T00:41 ICT | 2 TABLES | FULL AUDIT TRAIL | TASK HIERARCHY SUPPORTED`
