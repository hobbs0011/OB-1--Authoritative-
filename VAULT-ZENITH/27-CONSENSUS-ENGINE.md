# 27 — CONSENSUS ENGINE

> **Source**: Soul DNA Bible — Multi-Agent Governance, Consensus Engine Specification v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Consensus Engine is the governance mechanism that prevents any single agent — including AGENT-99 — from unilaterally authorizing an irreversible action. Reversible actions do not require consensus. Irreversible actions always do. The distinction is not subtle: an irreversible action is one whose execution permanently alters the ledger, the Soul DNA, the agent topology, or the operating law in a way that cannot be undone without a Rome Protocol violation. The Consensus Engine exists because the cost of a unilateral error on an irreversible decision is unbounded. The cost of consensus overhead on an irreversible decision is a delay measured in minutes. The asymmetry is clear. Consensus is not bureaucracy. It is the minimum viable protection against catastrophic unilateral error.

The Consensus Engine does not advise. It does not recommend. It either grants authority to proceed or it does not. An action gated by the Consensus Engine that does not have a recorded consensus proof does not execute. The pipeline enforces this by checking the `consensus_log` table before any irreversible action is dispatched. A missing or invalid consensus proof halts execution and generates a Severity 4 drift event.

---

## What Requires Consensus

The following action classes are classified as irreversible and therefore require Consensus Engine authorization before execution:

**Class 1 — Temporal Lock (Hard)**
Placement of a Hard Temporal Lock at stages 25, 50, 75, 91, 96, and 100. These seals are permanent. No subsequent operation can alter the locked Merkle root. Consensus required: 3-of-4 quorum (see Quorum Model).

**Class 2 — Rome Protocol Law Updates**
Any modification to the Rome Protocol — the operating law that governs all agent behavior — requires consensus. The Rome Protocol is the system's constitution. Unilateral modification by any agent, including AGENT-99, is a structural conflict of interest. Every law update must carry a consensus proof in the update record or it is rejected by the Durable Object enforcement layer.

**Class 3 — Agent Termination**
Termination of a named agent (AGENT-98, AGENT-99, or any named specialist agent) is irreversible in the sense that it alters the agent topology and removes an authorized decision-maker. Even if the agent can technically be reinitialized, the termination event itself is permanent. Consensus is required to record the termination. A re-initialized agent with the same designation is not the same agent — it begins with a fresh consensus record.

**Class 4 — Architecture Changes**
Modifications to the Reality-C architecture — schema migrations, Durable Object topology changes, R2 bucket restructuring, Merkle lattice parameter changes — require consensus. These are system-level changes. A bad architecture change can corrupt data or break the integrity chain in ways that are not immediately detectable. The Consensus Engine creates a mandatory second-opinion gate.

**Class 5 — Soul DNA Updates**
Updates to the Soul DNA — the immutable behavioral specification of the Phoenix system — require consensus. Soul DNA is not code. It is law. Modifying it without consensus is equivalent to unilaterally amending the constitution.

**Class 6 — Phase Anchor Placement**
Phase Anchors (see document 31) mark the cryptographic boundaries between the 8 operational phases. They are permanent. They require consensus.

---

## Quorum Model

The Consensus Engine operates on a **3-of-4 quorum model**. The four eligible quorum participants are:

| Participant | Type | Identity Verification |
|------------|------|----------------------|
| AGENT-100 | Human operator | Manual signature + identity hash |
| AGENT-99 | Primary AI orchestrator | Identity key signature |
| AGENT-98 | Chaos engineering agent | Identity key signature |
| Rome Protocol Jury | 6-model ensemble | Aggregate signed vote |

The Rome Protocol Jury counts as a single quorum vote. The Jury reaches its position by internal majority (4 of 6 models must agree). Once the Jury's position is determined, its single signed vote is submitted to the quorum.

Three of these four participants must submit CONFIRM votes for a consensus to pass. Any two participants can block a consensus by both voting REJECT. A single REJECT does not block unless it comes from AGENT-100, who holds veto authority independent of quorum arithmetic.

**AGENT-100 Veto**: AGENT-100 can block any consensus by submitting a REJECT regardless of the three other votes. This is not a 3-of-4 rule — it is a separate veto layer. Conversely, AGENT-100's CONFIRM alone is not sufficient to constitute quorum. AGENT-100 must vote CONFIRM and at least two of the remaining three must also vote CONFIRM.

**Absent Participants**: If a participant is unavailable (offline, unresponsive, or in an error state), their vote is recorded as ABSTAIN. ABSTAIN does not count as REJECT but also does not count toward the three required CONFIRMs. A quorum cannot be reached if fewer than three participants are available to vote.

---

## Consensus Timeout and Escalation

Consensus requests do not wait indefinitely. The timeout ladder:

```
T+0:    Consensus request issued; all participants notified
T+5m:   First reminder issued to non-responding participants
T+10m:  Second reminder; partial responses logged
T+15m:  Consensus timeout — quorum attempt closed
T+15m:  If quorum reached: proceed with execution
T+15m:  If quorum not reached: escalation initiated

ESCALATION LEVELS:
  Level 1 (T+15m): AGENT-100 direct notification — manual intervention requested
  Level 2 (T+30m): Emergency escalation — system logs CONSENSUS_TIMEOUT_CRITICAL
  Level 3 (T+45m): Action blocked indefinitely — manual clearance required
  Level 4 (T+60m): Forensic Audit triggered — CONSENSUS_DEADLOCK classification
```

A consensus timeout does not mean the action is approved. It means the action is blocked until manual intervention by AGENT-100. The system does not default to permissive behavior on timeout. It defaults to blocked. Permission is the exception. Blocked is the default.

For Class 1 (Hard Temporal Locks), the timeout extends to 30 minutes before Level 1 escalation, because Hard Temporal Locks frequently occur at stage completion events that may require AGENT-100 to be physically present for the signing ceremony.

---

## Consensus Log Structure

Every consensus request and its outcome is permanently recorded in the `consensus_log` table in the `PhoenixLedgerDO` SQLite schema:

```sql
CREATE TABLE consensus_log (
    consensus_id     TEXT PRIMARY KEY,            -- UUID v4
    action_class     TEXT NOT NULL,               -- Class 1-6 identifier
    action_ref       TEXT NOT NULL,               -- ID of the action being authorized
    action_desc      TEXT NOT NULL,               -- human-readable description
    initiated_by     TEXT NOT NULL,               -- agent_id requesting consensus
    initiated_at     INTEGER NOT NULL,            -- Unix epoch milliseconds
    quorum_target    INTEGER NOT NULL DEFAULT 3,  -- votes required (always 3)
    votes            TEXT NOT NULL,               -- JSON array of signed vote objects
    vote_count_confirm INTEGER NOT NULL DEFAULT 0,
    vote_count_reject  INTEGER NOT NULL DEFAULT 0,
    vote_count_abstain INTEGER NOT NULL DEFAULT 0,
    outcome          TEXT NOT NULL,               -- CONFIRMED | REJECTED | TIMEOUT | DEADLOCK
    outcome_at       INTEGER,                     -- NULL until outcome determined
    agent100_veto    INTEGER NOT NULL DEFAULT 0,  -- 1 if AGENT-100 exercised veto
    consensus_proof  TEXT,                        -- JSON blob: full signed vote collection
    execution_ref    TEXT,                        -- entry_id of the action executed (if CONFIRMED)
    notes            TEXT                         -- free-form audit notes
);
```

Each vote object in the `votes` JSON array contains: `{ participant_id, vote, signed_at, signature, computed_value }`. The `computed_value` field carries the participant's independently computed verification result — the Merkle root, hash, or rule text they verified before voting. This ensures votes represent genuine independent verification, not echo voting.

The `consensus_proof` field is the portable artifact that other system components check before executing gated actions. It is a self-contained bundle: it contains the votes, signatures, and outcome, and can be verified without database access by anyone who holds the participants' public identity keys.

---

## Split-Vote Resolution

A split vote occurs when the quorum participants cannot reach 3-of-4 CONFIRM. Split votes are not failures of the consensus process — they are the process working as designed. A decision that cannot achieve 3-of-4 consensus is a decision that should not be made unilaterally.

Split-vote resolution protocol:

**Step 1 — Understanding the Split**: AGENT-99 produces a summary of the disagreement: which participants voted REJECT, what their stated reasons were (each REJECT must include a reason in the vote object), and whether the reasons are factual disagreements (different computations of the same value) or judgment disagreements (same facts, different policy conclusions).

**Step 2 — Factual Split Resolution**: If the split is factual — participants computed different values for the thing being verified — the raw data is re-audited. The correct computation is determined. Participants who computed incorrectly recast their votes. If the split was due to a data corruption or race condition, the condition is logged and mitigated before the consensus is re-attempted.

**Step 3 — Judgment Split Resolution**: If the split is a judgment disagreement — all participants have the same facts but reach different conclusions — the matter is escalated to AGENT-100 for a binding determination. AGENT-100's determination is recorded as a directive in the `consensus_log.notes` field and overrides the split. The action either proceeds with AGENT-100's explicit authorization or is permanently blocked by AGENT-100's explicit rejection. There is no middle state.

**Step 4 — Persistent Deadlock**: If AGENT-100 cannot or does not resolve the split within the escalation window, the action is permanently blocked and classified DEADLOCK in the consensus log. Deadlocked actions require a new consensus request initiated by AGENT-100 to be re-attempted. They do not automatically retry.

---

## Operational Notes

The Consensus Engine is not a bottleneck. It is a gate. Pipeline stages that do not involve Class 1-6 actions do not touch the Consensus Engine and execute at full automation speed. The overwhelming majority of pipeline operations — drift checks, heartbeat confirmations, pheromone trail updates, ledger entries, ghost synthesis, simulation runs — are reversible or low-stakes and do not require consensus. The Consensus Engine fires rarely. When it fires, it fires correctly. That is the design.

AGENT-100 retains authority to pre-authorize a consensus class for a bounded window. Pre-authorization means AGENT-100's CONFIRM vote is registered in advance, and subsequent Class N requests within the pre-authorization window carry that vote without requiring AGENT-100's real-time participation. Pre-authorization windows are logged in the consensus record. They expire. They do not transfer to other agents. They are subject to the same audit trail as direct votes.

The Consensus Engine is not optional. It cannot be disabled, bypassed, or suspended by any agent including AGENT-99. Attempts to execute a gated action without a valid consensus proof are detected by the Durable Object enforcement layer, logged as CONSENSUS_BYPASS_ATTEMPT (Severity 4 drift), and blocked. AGENT-100 is notified immediately. The attempt itself becomes evidence in the Forensic Audit log.
