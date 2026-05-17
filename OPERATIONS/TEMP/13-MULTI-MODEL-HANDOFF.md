# 13 — MULTI-MODEL HANDOFF

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — AI STACK INTEGRATION

---

## Purpose

The Phoenix intelligence stack uses five AI models, and they hand off to each other in a defined sequence. GPT-5.4, Gemini 3.1 Pro, Notion AI agents, Codex, and Cloudflare Workers are not independent tools — they form a coordinated chain. This document defines how each model hands off to the next, what data is passed, what is stripped, and how every hop is logged.

**No model is an island. Every handoff is deliberate, formatted, and logged.**

---

## The Handoff Chain

```
Raw Input / Task
        ↓
Gemini 3.1 Pro (research synthesis)
        ↓ [GEMINI-SYNTHESIS-PACKAGE]
GPT-5.4 (sovereign reasoning)
        ↓ [GPT5-DECISION-PACKAGE]
Notion Agent (workflow routing, if needed)
        ↓ [NOTION-TASK-PACKAGE]
Codex (code generation, if needed)
        ↓ [CODEX-OUTPUT-PACKAGE]
Cloudflare Worker (deployment / execution)
        ↓ [WORKER-RESULT]
Ledger entry written
```

Not every task goes through every model. Short tasks may go directly to GPT-5.4. Code tasks skip Notion. The chain is sequential, not always complete.

---

## Handoff Format Table — Each Model Pair

| From | To | Trigger | Format | Confirmation |
|------|----|---------|--------|--------------|
| Raw Input | Gemini 3.1 Pro | Research task requiring >10K tokens context | Plain task description + source documents | Gemini returns synthesis package |
| Gemini 3.1 Pro | GPT-5.4 | Synthesis complete — decision required | `[GEMINI-SYNTHESIS-PACKAGE]` (see format below) | GPT-5.4 acknowledges receipt in output header |
| GPT-5.4 | Notion Agent | Workflow routing action required from decision | `[GPT5-DECISION-PACKAGE]` (see format below) | Notion agent confirms task created |
| GPT-5.4 | Codex | Code generation required from decision | `[GPT5-DECISION-PACKAGE]` with code spec | Codex returns code output package |
| Notion Agent | Codex | Workflow requires code generation | `[NOTION-TASK-PACKAGE]` | Codex confirms receipt |
| Codex | Cloudflare Worker | Code ready for deployment | `[CODEX-OUTPUT-PACKAGE]` (reviewed and gated) | Worker health check confirms deployment |
| Any model | Ledger | Any output worth logging | Standard Nexus ledger format | D1 write confirmation |

---

## Package Formats

### [GEMINI-SYNTHESIS-PACKAGE]

```
[GEMINI-SYNTHESIS-PACKAGE]
task_id: [UUID]
from: GEMINI-3.1-PRO
to: GPT-5.4
timestamp: [ISO 8601]
tokens_used: [number]
context_sources: [list of source names]
key_findings:
  - [finding 1]
  - [finding 2]
conflicts_detected: [list or NONE]
confidence: [HIGH / MEDIUM / LOW]
recommended_decision_for_gpt5: [specific question or decision framing]
[/GEMINI-SYNTHESIS-PACKAGE]
```

### [GPT5-DECISION-PACKAGE]

```
[GPT5-DECISION-PACKAGE]
task_id: [UUID]
from: GPT-5.4
to: [NOTION-AGENT / CODEX / AGENT-99]
timestamp: [ISO 8601]
tokens_used: [number]
decision: [the sovereign decision or output]
canon_check: [ALIGNED / FLAGGED]
rome_check: [PASSED / FLAGGED]
action_required: [specific action for next model or agent]
routing: [NOTION / CODEX / AGENT-99 / AGENT-100]
[/GPT5-DECISION-PACKAGE]
```

### [NOTION-TASK-PACKAGE]

```
[NOTION-TASK-PACKAGE]
task_id: [UUID]
from: NOTION-AGENT
to: [CODEX / AGENT-99]
timestamp: [ISO 8601]
task_type: [WORKFLOW / CODE_GEN / STATUS_UPDATE]
task_summary: [one sentence]
payload_ref: [Notion page URL or D1 reference]
confirmation_required: [true/false]
[/NOTION-TASK-PACKAGE]
```

### [CODEX-OUTPUT-PACKAGE]

```
[CODEX-OUTPUT-PACKAGE]
task_id: [UUID]
from: CODEX
to: AGENT-99 (for review)
timestamp: [ISO 8601]
code_type: [WORKER / D1_MIGRATION / R2_HANDLER / DURABLE_OBJECT / DEPLOYMENT_SCRIPT]
language: [JavaScript / TypeScript / Shell]
review_status: PENDING (AGENT-99 must set to APPROVED before deploy)
code: [code block]
test_required: [true/false]
[/CODEX-OUTPUT-PACKAGE]
```

---

## What Data Is Passed vs Stripped

**Passed between models:**
- Task IDs (for correlation and ledger tracking)
- Synthesized findings (the output of the model's work)
- Decision packages (structured decisions for the next model)
- Confidence and status flags

**Stripped between models:**
- Raw source documents (not passed downstream — synthesis is passed, not source)
- Token usage details (logged to Oracle ledger, not passed to next model)
- Any personally identifying information
- Any credential, API key, or PHOENIXMASTERKEY value
- Uncertainty hedging language (stripped from Gemini outputs before GPT-5.4 receives them)

---

## Ledger Entry Format for Model Handoffs

```
timestamp | from_model | to_model | task_id | handoff_type | status | tokens_used
```

**Example:**
```
2024-11-15T10:00:00Z | GEMINI-3.1-PRO | GPT-5.4 | task-a7b3c | SYNTHESIS | SUCCESS | 45000
2024-11-15T10:01:30Z | GPT-5.4 | CODEX | task-a7b3c | DECISION | SUCCESS | 2100
2024-11-15T10:02:00Z | CODEX | AGENT-99 | task-a7b3c | CODE_OUTPUT | PENDING_REVIEW | 0
```

Every model hop is logged. Oracle uses these entries to calculate total token cost per task and to track which models are being used at what frequency. Cost reports aggregate from these entries.
