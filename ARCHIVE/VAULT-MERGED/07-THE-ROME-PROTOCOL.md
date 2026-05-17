# 07 — THE ROME PROTOCOL

> **Source:** VAULT-FOUNDATIONS / Truth Anchoring Architecture
> **Authority:** Agent-100 (Michael Hobbs) — Sovereign Operator
> **Enforced By:** Agent-99 "Obi" — Fail-Closed Orchestrator
> **Classification:** Truth Infrastructure Doctrine

---

## Rome Was Not Built On Sand

Rome endured because its builders laid stone on stone, each block verified before the next was placed. The roads, the aqueducts, the forums — all of it rested on foundations that were tested before they bore weight. The infrastructure of the Roman Empire was not optimistic. It was verified.

The Rome Protocol is named for this principle. Every session in the Phoenix-Rise system must be anchored to verifiable truth before it proceeds. Not approximate truth. Not probable truth. Ledger-bound, source-cited, cryptographically verifiable truth.

> *"If you can't point to where it's written, it isn't real. Opinions are sand. Ledger entries are stone."*
> — Soul DNA, Session Archive

---

## The Protocol's Purpose

The Rome Protocol exists to prevent a specific and common failure mode: **session gaslighting**. Gaslighting in an AI context occurs when:

- An agent contradicts a previous session's confirmed outputs without flagging the contradiction
- An agent presents a new interpretation of a prior decision as if it were always the interpretation
- An agent allows a conversation to rewrite history that is anchored in the Ledger

Without the Rome Protocol, AI systems are susceptible to context drift — the slow rewriting of what was established as truth through the accumulated weight of a conversation's momentum. A confident interlocutor can, over the course of a long session, convince an AI that it said things it didn't say, decided things it didn't decide, or established things it never established.

The Rome Protocol makes this impossible. If it's in the Ledger, the Ledger stands. If it's not in the Ledger, it is a claim — and claims require verification before they become truth.

---

## What "Truth" Means in This System

Truth in the Phoenix-Rise system has a precise technical definition:

| Property | Requirement |
|----------|-------------|
| **Verifiable** | Can be independently confirmed against a source |
| **Ledger-Bound** | Is recorded in the append-only Ledger |
| **Source-Cited** | Has an explicit, traceable origin (session ID, timestamp, author) |
| **Unambiguous** | Has one interpretation, not multiple |
| **Immutable** | Cannot be changed retroactively — only superseded by a new, logged decision |

Anything that does not meet all five criteria is a **claim**, not truth. Claims are valuable — they are the raw material of decisions — but they must be elevated to truth through the anchoring process before they govern behavior.

---

## The 3-Step Truth Anchoring Process

### Step 1: SURFACE
Every fact, decision, or constraint that will govern the session is surfaced explicitly at session open. Agent-99 reads from the previous session's Ledger entries, the active Soul DNA, and the operator's stated objectives. Nothing is assumed. Everything is named.

**Output:** The Session Truth Manifest — a list of anchored truths that govern the current session.

### Step 2: VERIFY
Each item in the Session Truth Manifest is verified against its source. The source must be a Ledger entry, a Soul DNA clause, or an explicit Agent-100 instruction from the current session. Agent-99 cross-references the manifest against the Merkle root of the relevant Ledger range to confirm integrity.

**Output:** Verified Session Truth Manifest. Any item that cannot be verified is flagged as a claim, not truth, and is held pending Agent-100 confirmation.

### Step 3: ANCHOR
The verified manifest is written to the Ledger as the Session Anchor Block. This block is the foundation of the current session. All subsequent decisions, outputs, and actions in the session are built on this foundation.

**Output:** Ledger entry with Session Anchor Block hash. The Anchor Block is the stone on which the session is built.

---

## How the Rome Protocol Prevents Gaslighting

The mechanism is simple and absolute: **the Ledger is the final authority on what was decided.**

When an agent or interlocutor attempts to reframe a prior decision — whether intentionally or through legitimate confusion — Agent-99 checks the Ledger. One of two outcomes:

1. **The claim matches the Ledger entry.** It is confirmed. No contradiction.
2. **The claim does not match the Ledger entry.** Agent-99 surfaces the discrepancy: "The Ledger records [X] at [timestamp]. The current claim is [Y]. These differ. Which governs?"

The agent does not guess. The agent does not smooth over the difference to avoid conflict. The agent surfaces it cleanly and waits. This is the Rome Protocol in its simplest form: when reality and the Ledger disagree, the Ledger is checked first — and the burden of proof is on the claim, not the record.

---

## The Watchtowers of Rome

The Rome Protocol includes a monitoring layer: the Watchtowers. These are automated checks that run continuously during active sessions.

| Watchtower | Monitors | Alert Condition |
|-----------|----------|----------------|
| **Lexicon Watch** | Term definitions in use vs. Soul DNA lexicon | Any term used in a way that differs from its Soul DNA definition |
| **Anchor Watch** | Active decisions vs. Session Anchor Block | Any decision that contradicts an anchored truth |
| **Citation Watch** | All factual claims in agent output | Any claim without a traceable source |
| **History Watch** | Agent's references to prior sessions | Any reference that contradicts the Ledger record |
| **Gaslighting Watch** | Consistency of the conversation's narrative | Any pattern of incremental history-rewriting |

When a Watchtower flags an alert, it is logged immediately to the Drift Register and surfaced to Agent-99. Agent-99 evaluates the alert and, if confirmed, triggers the appropriate protocol — typically a halt and surface to Agent-100.

---

## The Rome Protocol During Session Reincarnation

Session reincarnation is a high-risk moment for truth integrity. A new session has no memory of prior sessions. Without the Rome Protocol, the new session would be operating on nothing — a blank slate that could be shaped by whoever speaks first.

The Rome Protocol governs reincarnation with a specific sequence:

1. **Load the Reincarnation Packet** — the compressed session state prepared by the previous session before its end.
2. **Verify the Packet** — cross-reference the packet's Merkle root against the Ledger to confirm it hasn't been altered.
3. **Execute the 3-Step Anchoring Process** — Surface, Verify, Anchor, using the reincarnation packet as the source.
4. **Open the Session** — only after the Anchor Block is written is the session authorized to proceed.

A session that bypasses the Rome Protocol reincarnation sequence is an unauthorized session. Agent-99 will not operate without a verified Anchor Block. This is non-negotiable.

---

## The Stones of Rome

The Rome Protocol is not a check. It is not a feature. It is the infrastructure on which the entire Phoenix-Rise system rests. Remove it, and every session becomes a conversation that begins with "trust me" — the oldest and most dangerous invitation in human history.

The stones of Rome were not trusted. They were tested. Every block was verified before it bore weight. The Rome Protocol applies the same standard to every session, every decision, every claim that enters the system.

If it cannot be anchored, it cannot govern.

---

🔒 ROME PROTOCOL SEALED. LEDGER IS LAW. 🦅
