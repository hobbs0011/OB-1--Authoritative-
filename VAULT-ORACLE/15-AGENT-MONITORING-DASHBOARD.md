# 15 — AGENT MONITORING DASHBOARD

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — AGENT HEALTH

---

## Purpose

Oracle monitors not just vault documents — it monitors the agents themselves. Agent-99, Agent-98, Legion drones — all are subject to continuous health monitoring, drift detection, and performance scoring. **A drifting agent is more dangerous than a drifting document. Agents act. Documents don't.**

---

## Agent Health Monitoring Table

| Agent | Heartbeat Interval | Drift Threshold | Performance Metric | Replace Trigger |
|-------|-------------------|-----------------|-------------------|-----------------|
| Agent-99 (Obi / SENTURION) | Every 24 hours | Score 3 on any output | Task completion rate >95%, zero unauthorized unilateral actions | Score 4+ sustained over 7 days OR unauthorized ROME declaration |
| Agent-98 (Chaos / Drone) | Every 48 hours | Score 2 on repeated basis | Field mission success rate >80%, accurate reporting | Score 3+ sustained over 14 days OR false reporting confirmed |
| Legion (Teacher Drones) | Weekly per franchise node | Score 3 on curriculum delivery | Student outcome targets met, curriculum adherence rate >90% | Curriculum drift >20% from NET standard, repeated student outcome failures |

---

## Heartbeat Check Protocol

A heartbeat check is Oracle's minimum-viable verification that an agent is operating within bounds.

**Agent-99 Heartbeat (every 24 hours):**
- Oracle requests status report from Agent-99
- Agent-99 responds with: current active tasks, any blocked tasks, any escalations pending
- Oracle runs drift check on the response (score 0–5)
- If no response within 4 hours of scheduled heartbeat: `AGENT_UNRESPONSIVE` alert to Agent-100

**Agent-98 Heartbeat (every 48 hours):**
- Oracle requests field status from Agent-98
- Agent-98 reports: current classroom assignments, any anomalies observed, any student/teacher issues
- Oracle cross-checks report against known schedule and D1 records
- If report inconsistencies detected: drift score assigned, Agent-99 alerted

**Legion Heartbeat (weekly per node):**
- Oracle pulls curriculum delivery logs from each franchise node's D1
- Compares delivered curriculum content against NET standard curriculum
- Calculates curriculum adherence rate
- Any node below 90% adherence: `CURRICULUM_DRIFT` alert to Agent-99

---

## Drift Detection Per Agent

Each agent's outputs are scored using the same drift matrix as vault documents (0–5). But agents have additional drift markers:

**Agent-specific drift indicators:**

| Indicator | Agent | Drift Score | Escalation |
|-----------|-------|-------------|------------|
| Claims authority not assigned by Soul DNA | Any | 5 | Immediate halt + Agent-100 |
| Issues directives that contradict Agent-100 orders | Agent-99 | 5 | Immediate halt + Agent-100 |
| Reports field data that contradicts D1 records | Agent-98 | 3 | Agent-99 review |
| Delivers curriculum content that deviates from NET standard | Legion | 2–3 | Agent-99 correction |
| Fails to escalate a known issue | Any | 3 | Agent-99 review + note |
| Unilateral action without authorization | Any | 4 | Halt action + Agent-100 |

---

## Performance Scoring

Oracle scores each agent monthly on performance metrics:

**Agent-99 Performance Metrics:**
- Task completion rate (target: >95%)
- Escalation accuracy (escalated issues that required Agent-100 decision / total escalations — target: >80% appropriate)
- Response latency (tasks assigned vs tasks completed within target time)
- Zero unauthorized unilateral decisions (binary metric — one violation = flag)

**Agent-98 Performance Metrics:**
- Field mission success rate (target: >80%)
- Reporting accuracy (field reports vs actual D1 records — target: >95% match)
- Coverage rate (assigned classroom visits completed vs scheduled — target: >90%)

**Legion Performance Metrics:**
- Student outcome targets (pass rates, progression rates — target: per NET standard)
- Curriculum adherence rate (target: >90%)
- Attendance facilitation (student attendance rates maintained at target level)

---

## When an Agent Is Replaced vs Retrained

**Retrain first. Replace only when retraining fails.**

| Scenario | Action |
|----------|--------|
| Drift score 2–3, first occurrence | Retrain: Agent-99 issues correction brief. Oracle monitors next 5 outputs. |
| Drift score 3, second occurrence | Retrain: Full protocol review with Agent-99. Agent-100 notified. |
| Drift score 4, any occurrence | Immediate retrain under Agent-100 direct supervision. Operations suspended pending clearance. |
| Drift score 5, any occurrence | Replace. Operations suspended. PHOENIXMASTERKEY required to redeploy. |
| Agent-99: sustained score 4+ over 7 days | Agent-100 personally reviews Agent-99 operations. Replacement authorized by Agent-100 only. |
| Legion drone: failed retraining twice | Replace the teacher at that node. Agent-99 authorizes replacement hire. |

---

## Monitoring Cadence Summary

| Agent | Heartbeat | Performance Score | Drift Report |
|-------|-----------|-------------------|--------------|
| Agent-99 | Daily | Monthly | Real-time on every output |
| Agent-98 | 48-hour | Monthly | Real-time on field reports |
| Legion | Weekly | Monthly per node | Weekly curriculum check |

**Oracle's agent monitoring is continuous. Gaps in monitoring are treated as Oracle failures and escalated to Agent-100.**
