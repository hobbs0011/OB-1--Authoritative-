# 05 — GEMINI INTEGRATION

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — RESEARCH STACK

---

## Purpose

Gemini 3.1 Pro is Oracle's research synthesis engine. Its million-token context window makes it the right tool for large-scale document analysis, cross-vault comparison, and market intelligence. This document defines how Gemini integrates into the Phoenix stack, its limits, its use cases, and its handoff protocol to GPT-5.4.

---

## Why Gemini

Long-context tasks kill smaller models. Gemini 3.1 Pro handles them without blinking. When Oracle needs to ingest an entire vault for analysis, compare competing market reports, or synthesize 200+ pages of curriculum data — Gemini does it.

**GPT-5.4 is the decision-maker. Gemini is the researcher. Never confuse the two.**

---

## Free Tier Limits

| Limit Type | Value | Phoenix Impact |
|------------|-------|----------------|
| Requests per minute (RPM) | 15 | Batch research tasks — no rapid-fire calls |
| Tokens per minute (TPM) | 1,000,000 | Sufficient for most single-session vault reads |
| Requests per day (RPD) | 1,500 | More than adequate for daily Oracle operations |
| Context window | 1,000,000 tokens | Full vault reads possible in single call |
| Output tokens per request | 8,192 | Keep outputs concise — split if needed |
| Free tier availability | Yes (Google AI Studio) | Default tier for all Oracle Gemini calls |

**Protocol:** Always exhaust free tier before triggering paid escalation. If RPD limit is hit, queue non-urgent tasks for next day cycle. Urgent tasks (drift score 3+) escalate to GPT-5.4 directly.

---

## Use Cases

**Gemini is used for:**
- Long-context research synthesis (full vault reads, multi-doc comparison)
- Cross-vault conflict analysis (feeding multiple vault docs in one context window)
- Market intelligence gathering (Vietnam language school market, competitor analysis)
- Teacher certification document analysis (bulk certification file review)
- Curriculum content review (full curriculum ingestion for quality check)
- Historical pheromone trail analysis (full trail corpus review)

**Gemini is NOT used for:**
- Final decisions on canon interpretation (GPT-5.4 only)
- Rome Protocol verification (GPT-5.4 only)
- Agent authority determinations (GPT-5.4 only)
- Generating code for production (Codex only, with Rome check)
- Direct communication with Agent-100 (Agent-99 only)

---

## Output Format Rules

Gemini outputs coming into Oracle must follow these rules before being passed to GPT-5.4:

- **Strip all Gemini-voice hedging.** ("It's important to note that..." → DELETE)
- **No citation format.** Oracle does not use citation-style references
- **Operational tone.** Punchy. Direct. Fact first.
- **Structured output preferred.** Tables, numbered lists, bullet points over prose paragraphs
- **Uncertainty flagged explicitly.** If Gemini signals low confidence, that signal is preserved and passed to GPT-5.4 for sovereign reasoning

---

## Handoff to GPT-5.4

Gemini does not produce final outputs. Gemini produces synthesis packages that feed GPT-5.4.

**Handoff format:**

```
[GEMINI-SYNTHESIS-PACKAGE]
Task: [original task description]
Context Window Used: [token count]
Key Findings: [bulleted list]
Conflicts Detected: [list or NONE]
Confidence: [HIGH / MEDIUM / LOW]
Recommended Action for GPT-5.4: [specific question or decision required]
[/GEMINI-SYNTHESIS-PACKAGE]
```

GPT-5.4 receives this package and issues the sovereign reasoning output. **GPT-5.4 may override any Gemini finding if Gemini's synthesis conflicts with canon.**

---

## When Gemini Is Used vs GPT-5.4

| Task Type | Model | Reason |
|-----------|-------|--------|
| Full vault read and summary | Gemini | Long context, cost efficiency |
| Cross-vault conflict detection | Gemini | Multiple large docs in one call |
| Market research synthesis | Gemini | Long-form synthesis task |
| Canon interpretation | GPT-5.4 | Sovereign reasoning required |
| Rome Protocol verification | GPT-5.4 | Apex model only |
| Final agent briefing generation | GPT-5.4 | Agent-100 communication standard |
| Routine research queries < 10k tokens | Either | Cost-optimize: Gemini free first |
| Code review | Codex + GPT-5.4 | Gemini not in code review chain |

---

## Cost Escalation Protocol

When Gemini free tier limits are approached:

1. Oracle logs a `TIER_WARNING` event in the ledger
2. Non-urgent Gemini tasks are queued for next cycle
3. Urgent tasks route to GPT-5.4 (with cost gate approval from Agent-99)
4. If Gemini paid tier is required, Agent-100 authorizes the upgrade
5. Monthly cost tracking — Gemini must stay within allocated budget

**Target:** Gemini operations cost $0/month (free tier only). Any paid Gemini spend requires Agent-100 authorization.
