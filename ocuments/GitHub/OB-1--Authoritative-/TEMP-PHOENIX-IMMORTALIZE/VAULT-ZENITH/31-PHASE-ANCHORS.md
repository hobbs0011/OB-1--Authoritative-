# 31 — PHASE ANCHORS

> **Source**: Soul DNA Bible — Cryptographic Governance, Phase Anchor Specification v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Phase Anchors are the cryptographic boundary markers between the eight operational phases of the Phoenix system. They are not milestones. They are not checkpoints. They are sealed cryptographic records that make the boundary between two phases mathematically verifiable for the lifetime of the system. A Phase Anchor is to a phase boundary what a Temporal Lock is to a stage boundary — except that Phase Anchors are rarer, heavier, and more permanent. Temporal Locks are applied dozens of times across the 100-stage pipeline. Phase Anchors are placed exactly eight times, once per phase, and never again.

The Phase Anchor chain connects the eight phases into a single unbroken cryptographic lineage. Phase 2's anchor contains the hash of Phase 1's anchor. Phase 3's anchor contains the hash of Phase 2's anchor. An observer who possesses Phase 1's anchor hash and recomputes the chain forward can verify that the system reached any subsequent phase through a specific and unaltered sequence of states. You cannot forge Phase 3 without forging Phase 2. You cannot forge Phase 2 without forging Phase 1. You cannot forge Phase 1 without breaking SHA256. The chain is the proof.

---

## The Eight Phases and Their Anchor Events

| Phase | Name | Pipeline Stages | Anchor Placement Event |
|-------|------|-----------------|------------------------|
| I | Genesis | 1–12 | Completion of Stage 12: Infrastructure Commissioning |
| II | Foundation | 13–25 | Completion of Stage 25: Hard Temporal Lock #1 |
| III | Integration | 26–50 | Completion of Stage 50: Hard Temporal Lock #2 |
| IV | Hardening | 51–75 | Completion of Stage 75: Hard Temporal Lock #3 |
| V | Verification | 76–91 | Completion of Stage 91: Golden Block Verification |
| VI | Convergence | 92–95 | Completion of Stage 95: Convergence Engine final run |
| VII | Ascension | 96–99 | Completion of Stage 99: Pre-seal verification |
| VIII | Zenith | 100 | Completion of Stage 100: Pipeline seal |

Each anchor is placed after the anchor placement event is confirmed complete and its Temporal Lock (where applicable) is in place. The Phase Anchor is placed on top of the Temporal Lock — it records the locked state as the anchor's ground truth.

---

## What a Phase Anchor Contains

A Phase Anchor is a structured record containing the following components, each of which is mandatory. A Phase Anchor with a missing or null field is invalid and is rejected by the Durable Object enforcement layer.

```typescript
interface PhaseAnchor {
  anchor_id: string;           // UUID v4
  phase_number: number;        // 1–8
  phase_name: string;          // Human-readable phase name
  placement_event: string;     // Description of the anchor placement event

  // Hash of all stage artifacts from the phase
  artifact_bundle_hash: string;  // SHA256 of the concatenation of all stage artifact hashes
                                 // in phase-ascending, stage-ascending order
  artifact_count: number;        // Number of distinct stage artifacts included in the bundle
  artifact_manifest: string[];   // Ordered list of artifact hashes (for verification)

  // Cryptographic chain
  merkle_root_at_anchor: string; // Merkle root of the full ledger at anchor placement time
  previous_anchor_hash: string;  // SHA256 of the previous phase anchor (Phase 1: '0'.repeat(64))
  anchor_hash: string;           // SHA256 of this anchor's canonical representation

  // Identity and time
  operator_signature: string;    // AGENT-100 signature over anchor_hash
  operator_identity_hash: string; // AGENT-100 identity key hash
  timestamp_ns: number;          // Nanosecond-precision atomic clock at placement
  nonce: string;                 // Nonce Protocol nonce for this anchor event

  // Temporal Lock reference (Phase II+)
  temporal_lock_ref: string | null; // lock_id from temporal_locks table (null for Phase I)

  // Consensus proof
  consensus_proof: string;       // JSON blob from Consensus Engine (document 27)
}
```

The `anchor_hash` is computed as:
```
anchor_hash = SHA256(
  phase_number || phase_name || artifact_bundle_hash ||
  merkle_root_at_anchor || previous_anchor_hash ||
  operator_identity_hash || timestamp_ns || nonce
)
```

This computation binds the anchor to: the specific phase it marks, the artifacts produced in that phase, the full ledger state at placement time, the preceding anchor (chain continuity), the identity of the signing operator, the precise moment of placement, and a unique nonce. An anchor cannot be forged without simultaneously forging all six of these bound values.

---

## How Phase Anchors Are Constructed

The Phase Anchor construction ceremony is a formal multi-step process:

**Step 1 — Artifact Collection**
AGENT-99 assembles the complete set of stage artifacts for the phase being anchored. A stage artifact is the canonical output of a pipeline stage: the entry in the `entries` table for the stage completion event, plus any associated sub-artifacts (Ghost Synthesis records, Convergence records, Forensic Audit reports) generated during the stage. Each artifact is identified by its `merkle_leaf_hash`. Artifacts are sorted in phase-ascending, stage-ascending order to produce a deterministic ordering.

**Step 2 — Artifact Bundle Hash**
AGENT-99 concatenates the artifact hashes in canonical order and computes SHA256 of the concatenation. This is the `artifact_bundle_hash`. The `artifact_manifest` is stored alongside to allow any verifier to recompute the bundle hash independently without access to the full artifact set (just their hashes).

**Step 3 — Merkle Root Capture**
The current production ledger Merkle root is read at the moment of anchor placement. This root is the `merkle_root_at_anchor`. It reflects the full ledger state at this exact moment — including all stage artifacts from the phase being anchored.

**Step 4 — Previous Anchor Hash Retrieval**
The hash of the previous phase's anchor is retrieved from the `phase_anchors` table. For Phase I, this value is `'0'.repeat(64)` — the defined genesis value.

**Step 5 — Nonce Generation**
A Phase Anchor nonce is generated via the Nonce Protocol (document 29). Phase Anchor nonces are classified as permanent (never expire) in the nonce registry.

**Step 6 — Anchor Hash Computation**
The anchor hash is computed from the bound values as defined above.

**Step 7 — AGENT-100 Signing**
AGENT-100 signs the anchor hash with the AGENT-100 identity key. This is a manual step — AGENT-100 reviews the anchor data before signing. The signing is logged with a timestamp. The signature cannot be delegated. AGENT-100 must sign every Phase Anchor.

**Step 8 — Consensus**
The Phase Anchor placement is a Class 6 action requiring 3-of-4 Consensus Engine consensus (document 27). AGENT-100's signature from Step 7 serves as AGENT-100's CONFIRM vote. Two additional CONFIRM votes (from AGENT-98, AGENT-99, or the Rome Protocol Jury) are required before the anchor is written to the ledger.

**Step 9 — Production Write**
With consensus proof in hand, the anchor is written to the `phase_anchors` table in `PhoenixLedgerDO` via the Shadow Protocol (document 30). It enters the shadow ledger first, passes the promotion decision tree, and is promoted to production. The promotion is also a ledger entry of type `PHASE_ANCHOR` in the `entries` table, so it is part of the Merkle chain.

---

## How Phase Anchors Are Verified

Phase Anchor verification is a pure cryptographic operation that can be performed by any party with access to the `phase_anchors` table and the relevant artifact hashes:

```
FOR EACH phase anchor in order (1 through N):
  1. Retrieve the anchor record from phase_anchors table
  2. Retrieve the artifact hashes listed in artifact_manifest
  3. Concatenate artifact hashes in manifest order; compute SHA256 → compare to artifact_bundle_hash
  4. Retrieve production merkle root at anchor timestamp → compare to merkle_root_at_anchor
  5. Compute anchor_hash from bound values → compare to stored anchor_hash
  6. Verify operator_signature over anchor_hash using AGENT-100 public identity key
  7. Verify previous_anchor_hash matches the anchor_hash of the preceding anchor record
  8. If all seven checks pass: anchor is VALID
  9. If any check fails: anchor is INVALID → immediate Severity 5 alert
```

Verification is run automatically before every pipeline stage that crosses a phase boundary and before every Hard Temporal Lock placement. Verification is also run during Forensic Audit procedures that touch phase-boundary events. A failed verification is the most serious integrity event in the system short of a Golden Block corruption — it means either a Phase Anchor or the ledger state it anchors has been altered.

---

## The Phase Anchor Chain

The Phase Anchor chain is the sequence of eight anchors, each cryptographically linked to the previous. The chain property:

```
PA[1].previous_anchor_hash = '0' * 64  (genesis)
PA[2].previous_anchor_hash = SHA256(PA[1].canonical_representation)
PA[3].previous_anchor_hash = SHA256(PA[2].canonical_representation)
...
PA[8].previous_anchor_hash = SHA256(PA[7].canonical_representation)
```

The chain cannot be altered at any point without invalidating all subsequent anchors. If PA[3] is altered, PA[4]'s `previous_anchor_hash` will not match the altered PA[3]. The chain breaks visibly at the first altered link. Repairing the chain without detection requires re-signing every subsequent anchor with AGENT-100's identity key — which requires AGENT-100's private key material. Private key compromise is the only scenario in which the chain could be silently forged, and key compromise itself produces a detectable signal in the identity management system.

The chain is the Phase-level equivalent of the Merkle chain in the entries table: both create linear cryptographic dependencies that make tampering detectable. They operate at different granularities — the Merkle chain links individual entries; the Phase Anchor chain links eight major milestones — but the mathematical principle is identical.

---

## Relationship to Temporal Locks

Phase Anchors and Temporal Locks are related but distinct:

- A Temporal Lock seals the Merkle root at a specific moment, preventing undetected alteration of past ledger state.
- A Phase Anchor references a Temporal Lock (the `temporal_lock_ref` field) and additionally records the phase artifact bundle, the operator signature, and the chain link to the previous phase.

A Phase Anchor at a phase boundary that also carries a Hard Temporal Lock (Phases II, III, IV, V, VII, and VIII) contains both: the Temporal Lock seals the ledger state, and the Phase Anchor records the sealed state as the authoritative phase boundary marker. The two mechanisms reinforce each other. The Temporal Lock proves the state was not altered. The Phase Anchor proves which state the phase concluded in.

Phase I and Phase VI do not carry Hard Temporal Locks at their anchors — Phase I because the lock infrastructure is being commissioned during Phase I stages, and Phase VI because the Convergence Engine output (Stage 95) is the anchor event and the Convergence Engine operates on a different lock schedule. Both Phase I and Phase VI anchors carry Soft Temporal Locks applied automatically at anchor placement time.

---

## The Ceremony for Placing a New Phase Anchor

The Phase Anchor ceremony is the most formal operational event in the Phoenix pipeline outside of Stage 100's final seal. The ceremony sequence:

```
PRE-CEREMONY (T-30 minutes):
  □ AGENT-99 assembles artifact manifest and computes artifact_bundle_hash
  □ AGENT-99 presents artifact count and bundle hash to AGENT-100 for review
  □ AGENT-100 reviews: are all expected phase artifacts present?
  □ Any missing artifact: ceremony is postponed until artifact is recovered

CEREMONY (T+0):
  □ AGENT-99 captures Merkle root (live read from production ledger)
  □ AGENT-99 retrieves previous anchor hash
  □ AGENT-99 generates Phase Anchor nonce via Nonce Protocol
  □ AGENT-99 computes anchor_hash and presents full anchor record to AGENT-100
  □ AGENT-100 verifies anchor_hash computation independently (spot-check)
  □ AGENT-100 signs anchor_hash with identity key — this is the point of commitment
  □ Consensus Engine activated: Phase Anchor placement is a Class 6 action
  □ Consensus votes collected from AGENT-98 and Rome Protocol Jury
  □ With 3-of-4 consensus confirmed: anchor is written to ledger via Shadow Protocol
  □ Shadow entry promoted to production — anchor is now permanent

POST-CEREMONY (T+5 minutes):
  □ Phase Anchor chain verification run: all N anchors (through the new one) verified
  □ AGENT-99 confirms: anchor_hash of new anchor matches what will be the next anchor's
    previous_anchor_hash reference
  □ Ceremony record written to Forensic Audit trail: PHASE_ANCHOR_PLACED
  □ AGENT-100 declaration: "Phase [N] is sealed."
```

The AGENT-100 declaration is not ceremonial rhetoric. It is a logged statement in the `entries` table with type `AGENT_EVENT` and payload `{ declaration: "Phase N is sealed.", anchor_id: "<UUID>" }`. The declaration is part of the permanent record. It is the human voice in the cryptographic ceremony — evidence that a human being, not just an automated process, confirmed the phase transition and accepted responsibility for it.
