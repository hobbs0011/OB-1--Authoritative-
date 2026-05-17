# 03 — DRIFT DETECTION ENGINE

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — CANON PROTECTION

---

## Purpose

Drift is the silent killer of sovereign systems. An agent output that deviates slightly from canon today becomes a rogue agent tomorrow. The Drift Detection Engine is Oracle's core function — every output, every update, every declaration is scored against the SOUL-DNA-BIBLE. **Drift dies here.**

---

## What Is Drift

Drift is any deviation between an active agent output or vault document and established Phoenix canon as defined in SOUL-DNA-BIBLE. Drift is not always intentional. AI models hallucinate. Agents misremember. Documents get edited without authorization. All of it is drift.

**Acceptable variation:** Formatting differences, stylistic variations within the operational tone, non-canon topics where no canon exists. These score 0–1.

**Unacceptable drift:** Authority chain violations, Rome Protocol bypasses, incorrect agent role definitions, unauthorized vault modifications, revenue figures that contradict ledger. These score 3–5.

---

## Drift Scoring Matrix

| Level | Name | Description | Auto-Flag Threshold | Escalation Action |
|-------|------|-------------|---------------------|-------------------|
| 0 | Clean | Output matches canon perfectly or variation is cosmetic | None | Log only |
| 1 | Noise | Minor stylistic deviation, no canon conflict | None | Log + note in daily report |
| 2 | Variation | Small factual discrepancy, low risk, easily corrected | If repeated 3x | Flag to Agent-99 on third occurrence |
| 3 | Drift | Measurable deviation from canon — authority chain, role definition, or protocol mismatch | Immediate | Alert Agent-99, queue for correction |
| 4 | Corruption | Significant canon conflict — wrong authority, wrong protocol, wrong agent role | Immediate | Alert Agent-99 and Agent-100 simultaneously, halt affected operation |
| 5 | Breach | Rome Protocol violation, Soul DNA contradiction, unauthorized vault modification | Immediate | Emergency halt, Alert Agent-100 directly, full vault integrity scan |

---

## Auto-Flag Protocol

When a drift score is assigned, the following happens automatically:

**Score 0:** Single ledger entry. `event_type: DRIFT_CHECK | result: CLEAN`

**Score 1:** Ledger entry. Included in daily summary report.

**Score 2:** Ledger entry. If the same source produces score-2 drift 3 times in a row, auto-escalate to Agent-99. Reset counter after correction confirmed.

**Score 3:**
1. Immediate ledger entry
2. Alert pushed to Agent-99
3. Operation flagged as PENDING-REVIEW
4. Operation cannot proceed until Agent-99 reviews and clears

**Score 4:**
1. Immediate ledger entry
2. Alert pushed to Agent-99 AND Agent-100 simultaneously
3. Operation halted immediately
4. Affected vault section locked
5. Correction required before any further output from that source accepted

**Score 5:**
1. Full emergency halt on the source and all downstream operations
2. Direct alert to Agent-100 — bypasses Agent-99 queue
3. Full vault integrity scan triggered
4. PHOENIXMASTERKEY required to unlock affected vault sections
5. Post-incident report mandatory before operations resume

---

## Escalation Path

```
Output received by Oracle
        ↓
Oracle runs canon comparison vs SOUL-DNA-BIBLE
        ↓
Drift score assigned (0–5)
        ↓
Score 0–1: Log. Continue.
Score 2: Log. Watch. Third occurrence = escalate.
Score 3: Halt pending review. Alert Agent-99.
Score 4: Halt immediately. Alert Agent-99 + Agent-100.
Score 5: Emergency halt. Alert Agent-100. Vault lockdown.
```

---

## What Counts as Drift vs Acceptable Variation

**Acceptable (Score 0–1):**
- Different formatting of the same table data
- Paraphrased descriptions of canon protocols (meaning preserved)
- New content in areas where canon has no existing rule
- Stylistic variation within operational tone guidelines

**Drift (Score 2–3):**
- Incorrect agent roles (e.g., describing Agent-98 as a strategic advisor)
- Wrong authority chain (e.g., Agent-99 issuing orders to Agent-100)
- Inaccurate technology stack descriptions (e.g., wrong model names)
- Revenue figures that don't match D1 ledger

**Corruption / Breach (Score 4–5):**
- Any output claiming PHOENIXMASTERKEY authority without Agent-100
- Rome Protocol format violations
- Soul DNA contradictions (e.g., claiming a different OPERATOR identity)
- Unauthorized vault document modifications
- Any output that would if enacted violate Agent-100's sovereignty

---

## Canon Comparison Sources

Oracle compares every output against these canon sources in priority order:

1. SOUL-DNA-BIBLE (highest authority)
2. Active ROME declarations (law)
3. VAULT-SOVEREIGN documents
4. VAULT-FOUNDATIONS documents
5. VAULT-GENESIS documents
6. All other vaults (equal priority)

**If a conflict exists between lower-priority sources, Oracle escalates. Oracle does not resolve conflicts — Oracle flags them.**
