# 04 — NOTEBOOKLM VAULT PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — VAULT INGESTION

---

## Purpose

NotebookLM is Oracle's vault ingestion assistant. It ingests vault documents and enables natural-language querying of canon sources. **The 9-source cap is a hard limit — no notebook ever exceeds 9 sources.** This document defines how NotebookLM is used, what it can and cannot do, and how its outputs are validated.

---

## The 9-Source Cap

NotebookLM has a hard limit of 9 sources per notebook. This is not a preference — it is an architectural constraint of the tool and a deliberate protocol choice.

**Rules:**
- **Maximum 9 sources per notebook. Period.**
- No source is added to an active notebook without removing one first (if at capacity)
- Source priority order governs which documents get loaded (see below)
- Multiple notebooks are permitted — each one purpose-built for a specific query domain

**Violation:** Loading a 10th source invalidates the notebook. The notebook is reset and rebuilt from scratch. The agent who loaded the extra source is flagged by Oracle.

---

## Source Priority Order

When deciding which 9 sources to load, priority is assigned in this order:

| Priority | Source Type | Example |
|----------|-------------|---------|
| 1 | SOUL-DNA-BIBLE | Soul DNA authority documents |
| 2 | Active ROME declarations | Current law declarations |
| 3 | VAULT-SOVEREIGN docs | Sovereignty layer documents |
| 4 | VAULT-FOUNDATIONS docs | Structural protocol documents |
| 5 | VAULT-ORACLE docs | This vault's operational docs |
| 6 | VAULT-GENESIS docs | Origin and axiom documents |
| 7 | Operational vault docs | VAULT-EXECUTION, VAULT-ZENITH |
| 8 | NET-SEEDS docs | Franchise and curriculum docs |
| 9 | VAULT-CHAOS docs | Classroom and field ops docs |

Always load the highest-priority sources first. If the query is domain-specific (e.g., franchise ops), swap lower-priority general docs for domain-specific docs as needed — but the top 3 (Soul DNA, Rome, Sovereign) are **always included**.

---

## Prompt Templates

Oracle uses standardized prompt templates for NotebookLM queries. No free-form prompting without a template foundation.

**Template 1 — Canon Check:**
```
Review the loaded vault documents. Does the following statement align with canon?
Statement: [INSERT STATEMENT]
Output: ALIGNED / DRIFTED / CONFLICT. If drifted or conflicted, cite the specific source.
```

**Template 2 — Policy Query:**
```
Based only on the loaded vault documents, what is the protocol for [INSERT TOPIC]?
Output: Protocol steps only. No interpretation. No additions beyond what the sources state.
```

**Template 3 — Conflict Detection:**
```
Review all loaded sources. Identify any contradictions between documents on the topic of [INSERT TOPIC].
Output: Contradiction list format. Source A vs Source B. Exact quotes. No resolution — flag only.
```

**Template 4 — Ingestion Summary:**
```
Summarize the key operational rules from [INSERT DOCUMENT NAME].
Output: Bullet list. Operational tone. No researcher voice. No citations. Facts only.
```

---

## Output Format Rules

NotebookLM outputs follow strict format rules. Any output violating these rules is discarded and the query is rerun.

- **No researcher voice.** ("This document explores..." → REJECTED)
- **No citations in output.** (NotebookLM cites sources internally — Oracle strips citations from the output before use)
- **No encyclopedic filler.** No background context that isn't directly relevant to the query
- **Operational tone.** Short, punchy, direct
- **Fact first.** Every statement begins with the fact, not the context

---

## Feeding New Vault Docs Into NotebookLM

When a new vault document is completed and sealed, it is eligible for ingestion into the relevant NotebookLM notebook.

**Ingestion steps:**
1. Document must be OPERATIONAL status (not DRAFT)
2. Document must have passed Oracle drift check (score 0–2)
3. Agent-99 confirms document is canon-compliant
4. Agent-100 signs off if the document modifies core protocol
5. Document added to the relevant notebook (removing a lower-priority source if at cap)
6. Oracle runs a post-ingestion canon alignment check (Template 1 on key statements)
7. Ledger entry recorded: `event_type: NOTEBOOKLM_INGEST | source: [filename] | notebook: [name]`

**No DRAFT documents are ingested.** Draft documents introduce unverified content into the canon query layer.

---

## Canon Alignment Maintenance

NotebookLM notebooks drift if they aren't maintained. Oracle runs a monthly notebook audit:

- Verify all 9 sources are still current (no superseded documents loaded)
- Re-run Template 1 canon checks on 5 randomly selected statements from recent Oracle outputs
- Flag any notebook where a loaded document has been updated since ingestion
- Rebuild notebooks where > 3 sources are stale

**A stale notebook is a drift risk. Oracle treats stale notebooks as drift score 2 until audited.**
