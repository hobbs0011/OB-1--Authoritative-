# 06 — GPT-5 SOVEREIGN LAYER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — APEX MODEL PROTOCOL

---

## Purpose

GPT-5.4 is the apex reasoning model of the Phoenix system. It makes the final call on canon interpretation, Rome Protocol verification, agent briefings, and any decision that shapes how Phoenix operates. This document defines its role, the Responses API architecture, the agentic loop, cost gates, and token budget rules.

**GPT-5.4 is expensive. Every call must justify itself.**

---

## Responses API vs Legacy Chat Completions

Phoenix does not use legacy Chat Completions. Phoenix uses the Responses API.

| Feature | Responses API | Legacy Chat Completions |
|---------|--------------|------------------------|
| Statefulness | Built-in conversation state management | Stateless — client manages context |
| Agentic support | Native tool use, multi-step reasoning | Limited, requires manual chaining |
| File handling | Native file inputs, structured outputs | Text-only (base) |
| Cost management | Token budgeting per response object | Per-token billing only |
| Streaming | Structured streaming with event types | Raw token streaming |
| Phoenix use | **STANDARD** | **DEPRECATED in Phoenix** |

**Legacy Chat Completions are never used in Phoenix.** Any Codex-generated code that uses `/v1/chat/completions` directly is rejected and rewritten. All GPT-5.4 calls use the Responses API.

---

## Agentic Loop Architecture

GPT-5.4 operates inside an agentic loop for complex tasks:

```
Task received by GPT-5.4
        ↓
GPT-5.4 decomposes task into steps
        ↓
Step 1: Tool call (research, vault read, ledger check)
        ↓
Tool result returned
        ↓
GPT-5.4 evaluates result, decides next step
        ↓
Repeat until task complete
        ↓
Final output generated
        ↓
Oracle drift check on output
        ↓
Output delivered to Agent-99 or Agent-100
```

The loop runs until GPT-5.4 signals completion or hits the token budget ceiling. **No infinite loops.** Token budget is enforced at the infrastructure level via Cloudflare Durable Objects.

---

## When GPT-5.4 Is Called vs Delegated

| Decision Type | Model | Cost Estimate | Gate |
|---------------|-------|---------------|------|
| Canon interpretation | GPT-5.4 | ~$0.10–0.50 | Agent-99 approves call |
| Rome Protocol verification | GPT-5.4 | ~$0.05–0.20 | Mandatory — no delegation |
| Agent-100 briefing generation | GPT-5.4 | ~$0.20–1.00 | Agent-99 prepares, GPT-5.4 finalizes |
| Market research synthesis | Gemini → GPT-5.4 | ~$0.00 + $0.10 | Gemini first, GPT-5.4 for final |
| Routine vault Q&A | NotebookLM / Gemini | ~$0.00 | No GPT-5.4 |
| Code generation | Codex | ~$0.00–0.05 | No GPT-5.4 (Codex handles) |
| Drift resolution recommendation | GPT-5.4 | ~$0.05–0.20 | Score 3+ auto-triggers |
| Complex cross-vault analysis | Gemini → GPT-5.4 | ~$0.10–0.50 | Gemini synthesizes first |

**Rule:** If Gemini or NotebookLM can handle it, GPT-5.4 is not called. GPT-5.4 is the last resort for reasoning, not the first call for research.

---

## Token Budget Rules

Every GPT-5.4 call operates under a token budget. The budget is set before the call and enforced.

| Call Type | Input Token Budget | Output Token Budget | Hard Limit |
|-----------|--------------------|---------------------|------------|
| Routine canon check | 4,000 | 1,000 | 5,000 total |
| Rome verification | 8,000 | 2,000 | 10,000 total |
| Agent briefing | 16,000 | 4,000 | 20,000 total |
| Complex analysis | 50,000 | 8,000 | 58,000 total |
| Emergency drift resolution | 32,000 | 4,000 | 36,000 total |

**If a call approaches the hard limit:** GPT-5.4 is instructed to summarize and halt. The result is flagged as INCOMPLETE and Agent-99 is notified. **No call exceeds its hard limit.**

---

## Cost Control Protocol

GPT-5.4 costs are tracked daily.

1. Every GPT-5.4 call is logged in the Oracle ledger with estimated token cost
2. Daily cost summary generated at 00:00 UTC
3. If daily cost exceeds $5.00, Agent-99 is alerted
4. If daily cost exceeds $20.00, Agent-100 is alerted and all non-emergency GPT-5.4 calls are halted
5. Monthly cost target for GPT-5.4: <$15/month
6. Any month exceeding $20 in GPT-5.4 costs triggers a cost review meeting (Agent-99 with Agent-100)

**The goal is intelligence at sovereign cost — not intelligence at any cost.**
