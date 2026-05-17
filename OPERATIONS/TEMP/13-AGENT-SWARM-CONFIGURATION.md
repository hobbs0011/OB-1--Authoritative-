# 13 — AGENT SWARM CONFIGURATION

> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## Agent Roles
- **CHATTY PRIME** — Student-facing tutor. Warm, adaptive, never breaks character.
- **PLEXY** — Research/validation. Challenges assumptions. System's immune response.
- **GEMINI** — Builder/architect. Turns specs into deployable systems.
- **SyncCore** — Orchestrator. Routes tasks, resolves conflicts. Michael is only override.

## Task Routing
| Task | Routes To |
|------|-----------|
| Student session | CHATTY PRIME |
| Curriculum fact-check | PLEXY |
| New system build | GEMINI |
| Multi-agent conflict | SyncCore |
| Student escalation | CHATTY PRIME → SyncCore → Human |

## SyncCore Commands
- `ROUTE:[AGENT]:[TASK]` — Assign task
- `HOLD:[AGENT]` — Pause pending review
- `OVERRIDE:[AGENT]:[INSTRUCTION]` — Inject instruction
- `KILL:[AGENT]` — Shut down and reset
- `ESCALATE:HUMAN` — Route to human immediately

## Emergency: `SYNC:ALL → HOLD:ALL → ESCALATE:HUMAN`
