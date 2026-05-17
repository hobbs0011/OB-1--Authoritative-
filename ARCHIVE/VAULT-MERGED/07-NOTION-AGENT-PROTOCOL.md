# 07 — NOTION AGENT PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — WORKFLOW AUTOMATION

---

## Purpose

Notion custom AI agents are the workflow automation layer of Phoenix. They handle the non-critical routing, status tracking, database triggers, and vault metadata updates that would otherwise clog Agent-99's attention. **Notion agents do not make decisions. They route and update.**

---

## What Notion Agents Do

Three categories of automation. Nothing outside these three.

1. **Database → Agent trigger:** A D1 or Notion database event (new franchise node status change, student enrollment update, revenue milestone) triggers a Notion agent that routes the notification to the correct vault and the correct agent.

2. **Task routing:** Notion agents receive task assignments from Agent-99 and route them to the appropriate execution layer (Cloudflare Worker, Codex, or manual Agent-98 action).

3. **Vault update pipeline:** When a vault document status changes (DRAFT → OPERATIONAL, or OPERATIONAL → ARCHIVED), Notion agents update the vault index and notify Oracle. Oracle then re-runs canon alignment check on the affected vault.

---

## Free Tier Usage

Notion AI agents operate on Notion's free tier by default. **No paid Notion upgrade without Agent-100 authorization.**

Free tier constraints:
- Limited AI response credits per month
- No custom API integrations on free tier (route through Cloudflare Workers instead)
- Workspace member limits apply (Agent-100 and Agent-99 only on free tier)

**Workaround for API limits:** Notion agents that need external data trigger a Cloudflare Worker via a webhook URL. The Worker fetches the data and returns it to Notion via a callback. This keeps Notion on free tier while allowing external integration.

---

## Database → Agent Trigger → Vault Update Pipeline

```
Event occurs (new franchise node, revenue update, enrollment change)
        ↓
Notion database entry updated (automated or manual)
        ↓
Notion agent trigger fires (based on property change condition)
        ↓
Agent routes notification to correct vault channel
        ↓
Vault metadata updated (status field, last-updated timestamp)
        ↓
Oracle notified of vault update
        ↓
Oracle runs drift check on updated content
        ↓
Ledger entry recorded
```

**Every trigger is logged. No silent automations.**

---

## Notion Agent Trigger Conditions

| Trigger | Condition | Agent Action | Confirmation Required |
|---------|-----------|--------------|----------------------|
| New franchise node status: APPROVED | Agent-100 updates status in Notion DB | Notify Agent-99, update VAULT-NET-SEEDS index | Agent-99 confirms receipt |
| Revenue milestone hit | D1 revenue log crosses threshold | Notify Agent-100 via Notion alert | Agent-100 acknowledges |
| Vault document status: DRAFT → OPERATIONAL | Author updates status field | Notify Oracle, trigger drift check | Oracle drift check PASS |
| Agent-98 task complete | Agent-98 marks task DONE | Route completion report to Agent-99 | Agent-99 reviews and closes |
| Cost alert: daily spend > $5 | Oracle ledger triggers Notion entry | Alert Agent-99 | Agent-99 reviews within 2 hours |

---

## Sync Protocol with VAULT-ORACLE

Notion agents sync with VAULT-ORACLE on a defined schedule. Sync is not continuous — it is triggered.

- **Sync trigger:** Any vault document status change, any new pheromone trail created, any drift alert scored 3+
- **Sync format:** Notion agent pushes a summary entry to the VAULT-ORACLE Notion database
- **Oracle response:** Oracle reads the Notion entry, cross-checks against D1 ledger, and confirms or flags discrepancies
- **Discrepancy action:** If Notion and D1 ledger disagree, D1 ledger wins. Notion is corrected. Drift score 2 assigned to the discrepancy event.

---

## Output Format Requirements

All Notion agent outputs that reach vault docs or Agent communications must follow:

- **No AI-generated fluff.** No "I've completed your request" padding
- **Status first.** Every output begins with current status: COMPLETE / PENDING / FAILED
- **Action taken.** What the agent did, in one sentence
- **Next step.** What needs to happen next, in one sentence
- **Ledger reference.** The D1 ledger entry ID for this event

**Example output format:**
```
STATUS: COMPLETE
ACTION: Franchise node Da Nang status updated to APPROVED in Notion DB and VAULT-NET-SEEDS index.
NEXT STEP: Agent-99 to initiate Q-G1 gate check for Da Nang launch sequence.
LEDGER REF: ORB-2024-0047
```

---

## What Notion Agents Cannot Do

- **Cannot modify SOUL-DNA-BIBLE or VAULT-SOVEREIGN documents.** Ever.
- **Cannot issue Rome declarations.** Agent-100 only.
- **Cannot authorize PHOENIXMASTERKEY operations.** Agent-100 only.
- **Cannot communicate directly with GPT-5.4.** Routing only — Agent-99 intermediates.
- **Cannot approve deployments.** Codex output requires Agent-99 + Agent-100 for production.

**Notion agents are fast and useful. They are not sovereign. Know the difference.**
