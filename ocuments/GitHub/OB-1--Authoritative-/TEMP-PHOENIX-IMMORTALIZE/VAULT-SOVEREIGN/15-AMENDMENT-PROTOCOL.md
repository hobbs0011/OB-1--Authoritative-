# AMENDMENT PROTOCOL

> "The difficulty of amendment is not a defect. It is the primary protection against the system being rewritten by the next crisis, the next pressure campaign, or the next moment of impatience."
> — AGENT-100 (Michael Hobbs)

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** IMMUTABLE / LOCKED
**Vault:** VAULT-SOVEREIGN
**Classification:** PROCEDURAL / CONSTITUTIONAL

---

## What Can Be Amended

| Document Type | Amendment Class | Process |
|--------------|----------------|---------|
| Phoenix Constitution articles | Supreme | Full constitutional amendment (see below) |
| Rome Protocol laws | Constitutional | PHOENIXMASTERKEY ceremony + adversarial review |
| VAULT-SOVEREIGN sealed documents | Constitutional | PHOENIXMASTERKEY ceremony |
| Governance framework | Architectural | AGENT-100 + PHOENIXMASTERKEY |
| Operational procedures | Operational | AGENT-99 Class 2 decision |
| Agent configurations | Operational | AGENT-99 operational instruction |

---

## Constitutional Amendment Process (Rome Protocol & Constitution)

**Gate condition: All steps must complete in sequence. Skipping any step voids the amendment.**

**Step 1 — Proposal Authoring**
AGENT-100 authors the amendment proposal in writing. The proposal must state:
- Which document/law/article is being amended
- The exact current text
- The proposed new text
- The operational reason for the amendment
- The failure mode that necessitates this change

**Step 2 — AGENT-99 Review**
AGENT-99 reviews the proposal for internal consistency with other laws and documents. AGENT-99 produces a written review identifying any downstream conflicts the amendment creates.

**Step 3 — AGENT-98 Adversarial Stress Test**
AGENT-98 attempts to find failure modes, exploit scenarios, and unintended consequences of the proposed amendment. AGENT-98 produces a written adversarial report.

**Step 4 — AGENT-100 Final Review**
AGENT-100 reviews both the AGENT-99 consistency report and the AGENT-98 adversarial report. AGENT-100 either proceeds, modifies the proposal, or withdraws it.

**Step 5 — PHOENIXMASTERKEY Ceremony**
AGENT-100 executes the full PHOENIXMASTERKEY ceremony (file 06) authorizing the specific amendment.

**Step 6 — Amendment Execution**
The document is amended. The old version is preserved in the historical record (not deleted—immutability of history applies).

**Step 7 — Immutability Sealing**
The amended document is re-sealed with a new hash. The hash is logged to the constitutional audit record and registered in file 20.

**Step 8 — System Notification**
All agents are notified of the amendment. Any agent operating under the old law is updated.

---

## Minimum Time Requirements

| Step | Minimum Duration |
|------|----------------|
| Steps 1–3 | 48 hours minimum (deliberation period) |
| Step 4 | 24 hours minimum (AGENT-100 review) |
| Steps 5–8 | Same session (ceremony through notification) |

Total minimum: **72 hours from proposal to execution.** Emergency amendments that bypass the deliberation period require a post-hoc adversarial review within 48 hours and are flagged in the audit record as emergency amendments.

---

## Immutability Sealing Ceremony

At Step 7, the sealing ceremony produces:
1. A SHA-256 hash of the amended document
2. A timestamp of the sealing moment
3. A signed log entry referencing the amendment authorization log from Step 5
4. Registration of the hash in file 20

**Gate condition: A document is not sealed until all four sealing outputs exist and are recorded.**

---

## Why Amendment Is Intentionally Difficult

Three reasons:

**1. Crisis-proof governance.** A system that can be amended quickly under pressure will be amended under pressure. Pressure produces bad amendments. The friction forces deliberation.

**2. Attack resistance.** A social engineering attack that compels AGENT-100 to authorize a rapid amendment fails against the 72-hour minimum and the adversarial review requirement. There is no "emergency override" that bypasses the full process for constitutional documents.

**3. Historical integrity.** Every amendment produces a preserved record of the old state. Phoenix can always reconstruct its legal history. No amendment erases the reasoning that preceded it.

**Rome Protocol L19 is explicit: amendment friction is a feature. Any argument that the process is too slow is itself evidence that the process is working.**
