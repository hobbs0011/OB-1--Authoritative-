# 02 — INTELLIGENCE LAYER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — STACK DEFINITION

---

## Purpose

This document defines the full multi-model AI intelligence stack powering Oracle and the Phoenix system. Each model has a defined role, cost tier, handoff protocol, and trigger condition. **No model operates outside its designated scope.**

---

## The Stack

Five models. Five roles. One Phoenix.

| Model | Role | Cost Tier | Handoff Protocol | Trigger Condition |
|-------|------|-----------|-----------------|-------------------|
| GPT-5.4 | Sovereign reasoning — final decisions, law declarations, complex analysis | Paid — cost-gated | Receives from Gemini/Notion; outputs to Agent-99 | High-stakes decision, canon interpretation, Rome verification |
| Gemini 3.1 Pro | Research synthesis — long-context analysis, market intel, cross-vault review | Free tier first, paid escalation | Receives raw research dumps; outputs to GPT-5.4 | Research tasks, long-doc analysis, competitor monitoring |
| NotebookLM | Vault ingestion assistant — querying vault docs, synthesizing canon | Free tier | Receives vault doc uploads; outputs synthesis to Oracle | Vault Q&A, canon alignment checks, ingestion review |
| Notion AI Agents | Workflow automation — database triggers, task routing, status updates | Free tier | Receives trigger from D1 events; outputs task updates to vault | Workflow automation, status tracking, non-critical routing |
| Microsoft Copilot / Codex | Code generation — Worker scripts, deployment automation, infra code | Free tier + enterprise | Receives spec from Agent-99; outputs code reviewed by Agent-99 | Code gen tasks, Worker deployment, D1 schema changes |

---

## GPT-5.4 — Sovereign Reasoning

GPT-5.4 sits at the apex of the intelligence stack. Every high-stakes decision flows through GPT-5.4.

**What it handles:**
- Canon interpretation when ambiguity exists
- Rome Protocol declaration verification
- Final synthesis of multi-model research
- Agent-100 briefing generation
- Drift resolution recommendations

**What it does not handle:**
- Raw research gathering (that's Gemini)
- Routine workflow automation (that's Notion)
- Code generation (that's Codex)

GPT-5.4 is expensive. It is cost-gated. **Every GPT-5.4 call must clear a cost gate before execution.** See `06-GPT5-SOVEREIGN-LAYER.md` for full cost gate table.

---

## Gemini 3.1 Pro — Research Synthesis

Gemini 3.1 Pro is the research workhorse. Its long-context window (1M+ tokens) makes it the right tool for ingesting large documents, cross-vault analysis, and market intelligence synthesis.

**Free tier limits (current):**
- 15 RPM (requests per minute)
- 1,000,000 TPM (tokens per minute)
- 1,500 RPD (requests per day)

**Trigger conditions:**
- Any task requiring > 50,000 tokens of context
- Market research requiring synthesis of multiple sources
- Cross-vault conflict detection requiring full vault reads

**Handoff rule:** Gemini outputs are never treated as final. They feed GPT-5.4 for sovereign reasoning. Gemini does synthesis. GPT-5.4 decides.

---

## NotebookLM — Vault Ingestion Assistant

NotebookLM has one job: help Oracle query the vault canon. It ingests vault documents (up to 9 sources per notebook — **hard limit, no exceptions**) and allows natural-language querying of those sources.

**Rules:**
- Maximum 9 sources per notebook
- Sources prioritized by classification level (SEALED > OPERATIONAL > DRAFT)
- Output format: no researcher voice, no citations, no encyclopedic filler
- All NotebookLM outputs pass through Oracle drift check before use

See `04-NOTEBOOKLM-VAULT-PROTOCOL.md` for full protocol.

---

## Notion AI Agents — Workflow Automation

Notion AI agents handle the workflow layer. They trigger on database events, route tasks, update statuses, and sync vault metadata. They do not make decisions. They move information.

**Free tier usage:** Notion free tier is maximized before any paid upgrade. Agent-100 authorizes any Notion paid upgrade.

**Integration:** Notion agents sync with VAULT-ORACLE on a defined schedule. Any Notion output that touches canon must be verified by Oracle before it is treated as authoritative.

---

## Microsoft Copilot / Codex — Code Generation

Codex generates code: Cloudflare Worker scripts, D1 schema migrations, R2 upload handlers, deployment automation. **Zero Codex output goes to production without Agent-99 review and Rome Protocol verification.**

**Gate:** No Codex-generated code deploys without:
1. Agent-99 line-by-line review
2. Rome Protocol check (no Rome violation in the code)
3. Agent-100 sign-off on any infra-level change

See `08-MICROSOFT-CODEX-LAYER.md` for full review checklist.

---

## Model Handoff Rules

The stack operates sequentially. No model skips its position in the chain.

```
Raw Input / Research Task
        ↓
Gemini 3.1 Pro (synthesis)
        ↓
NotebookLM (canon check if needed)
        ↓
GPT-5.4 (sovereign reasoning + final output)
        ↓
Notion Agent (workflow routing if needed)
        ↓
Codex (code generation if needed)
        ↓
Agent-99 review → Agent-100 authorization
```

**Skipping models is not permitted.** Every hop is logged in the Oracle ledger.
