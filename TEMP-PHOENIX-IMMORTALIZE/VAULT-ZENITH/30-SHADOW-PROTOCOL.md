# 30 — SHADOW PROTOCOL

> **Source**: Soul DNA Bible — Execution Safety, Shadow Protocol Specification v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Shadow Protocol is the execution safety layer that prevents untested writes from touching the production ledger. Every write in the Phoenix system begins life in the shadow ledger. Nothing reaches production by default. Production is the exception — shadow is the default. A write graduates from shadow to production only after satisfying a defined promotion decision tree. This is not a staging environment in the conventional software sense, where staging is a courtesy and production is just a bigger deployment. In the Phoenix system, the shadow ledger is a mandatory gate. Bypassing it is a Severity 4 drift event.

The shadow-first philosophy exists because the Phoenix ledger is append-only and permanent. A bad write to production cannot be deleted. It can be voided — marked invalid in the status column — but the record of the bad write remains. Voiding a bad production write creates an audit trail of the failure, imposes reconciliation overhead, and — most critically — may have already propagated to Merkle computations, consensus proofs, or downstream drone tasks that depended on the bad write before it was voided. The shadow ledger absorbs the cost of bad writes before that cost reaches production.

---

## Shadow Ledger Architecture

The shadow ledger is a parallel SQLite instance within the `PhoenixShadowDO` Durable Object. It mirrors the schema of the production `PhoenixLedgerDO` exactly, with two additions: a `shadow_status` column (PENDING | PROMOTED | REJECTED | DIVERGED) and a `promotion_attempt_at` timestamp. The shadow and production ledgers are separate Durable Object instances — they do not share storage. This isolation ensures that a crash in the shadow DO does not affect the production DO and vice versa.

```
WRITE FLOW:

  Agent/Pipeline → PhoenixShadowDO (shadow write)
                        ↓
                   Shadow validation suite
                        ↓
              [PASS]            [FAIL]
                ↓                  ↓
         Promotion attempt    REJECTED — logged,
                ↓             AGENT-99 notified
         PhoenixLedgerDO
         (production write)
```

The `PhoenixShadowDO` maintains its own Merkle chain — the shadow Merkle chain. This chain is used during the promotion decision to verify that the write being promoted produces a valid chain link in the production ledger at the time of promotion. Because the production ledger may have advanced since the shadow write was created (other writes may have been promoted ahead of it), the shadow write's Merkle leaf must be recomputed against the current production tip before promotion. A shadow write that produces a valid shadow chain link may not produce a valid production chain link if the production tip has advanced. The CASRetry shadow loop (see below) handles this case.

```sql
-- Shadow ledger entries table (mirrors production with two additions)
CREATE TABLE shadow_entries (
    entry_id          TEXT PRIMARY KEY,
    entry_type        TEXT NOT NULL,
    author_id         TEXT NOT NULL,
    author_priority   INTEGER NOT NULL,
    payload           TEXT NOT NULL,
    payload_hash      TEXT NOT NULL,
    parent_hash       TEXT NOT NULL,          -- shadow chain parent
    merkle_leaf_hash  TEXT NOT NULL,          -- shadow chain leaf
    shadow_status     TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | PROMOTED | REJECTED | DIVERGED
    promotion_parent  TEXT,                   -- production parent_hash at promotion time
    promotion_leaf    TEXT,                   -- recomputed production merkle_leaf_hash
    promotion_attempt_at INTEGER,
    promoted_at       INTEGER,
    rejected_at       INTEGER,
    rejection_reason  TEXT,
    validation_scores TEXT,                   -- JSON: metric scores from validation suite
    nonce_ref         TEXT,
    created_at        INTEGER NOT NULL
);
```

---

## The Promotion Decision Tree

A shadow entry is eligible for promotion when it is in PENDING status and has been in the shadow ledger for at least the minimum shadow soak time (default: 500ms; Stage 91+ operations: 2000ms). The promotion decision tree:

```
NODE 1: Shadow chain integrity check
  → Recompute merkle_leaf_hash from payload
  → Compare to stored shadow chain hash
  → FAIL: REJECT (shadow chain corrupted — this is a write pipeline bug)
  → PASS: proceed to Node 2

NODE 2: Signature verification
  → Verify author_id signature over payload_hash
  → FAIL: REJECT (unsigned or forged entry — Severity 3 drift event)
  → PASS: proceed to Node 3

NODE 3: Nonce validation
  → Query nonce registry: nonce must be CONSUMED and not EXPIRED
  → Verify nonce derivation matches event fields
  → FAIL: REJECT (nonce invalid — potential replay)
  → PASS: proceed to Node 4

NODE 4: Business rule validation
  → Entry type-specific validation suite (see metrics table below)
  → Score computed per metric (0.0 - 1.0)
  → Composite score computed (weighted average)
  → Composite score < 0.95: REJECT with score detail
  → Composite score ≥ 0.95: proceed to Node 5

NODE 5: Production tip acquisition (CAS operation)
  → Read current production ledger tip (last merkle_leaf_hash)
  → This is an atomic read — other promotions cannot interleave
  → Compute production parent_hash and production merkle_leaf_hash
  → Proceed to Node 6

NODE 6: CAS write to production
  → Attempt INSERT to PhoenixLedgerDO with computed production chain values
  → If INSERT succeeds (no concurrent modification): PROMOTED
  → If INSERT fails (concurrent modification — CAS failure): CASRetry loop
  → If CASRetry exhausted: DIVERGED (see divergence handling)
```

---

## Shadow-Production Divergence Detection

A shadow entry reaches DIVERGED status when it cannot be promoted to production despite passing all validation checks. This happens when the CASRetry loop exhausts its attempts due to continuous concurrent production writes that prevent the shadow entry from acquiring a stable production tip.

Divergence is not data loss — the shadow entry still exists in the shadow ledger. Divergence means the entry can no longer be promoted without manual intervention, because its content may have been made semantically obsolete by the intervening production writes that blocked its promotion.

Upon DIVERGED classification:

1. The entry is marked DIVERGED in `shadow_entries.shadow_status`.
2. AGENT-99 is notified with the full divergence context: what production writes interleaved, why the entry's content may be obsolete.
3. AGENT-99 evaluates the entry: is the content still valid given the interleaved production writes? If yes: AGENT-99 initiates a fresh shadow write with updated content and a new nonce. If no: AGENT-99 issues a formal rejection with reason code CONTENT_OBSOLETE.
4. Diverged entries are never automatically re-promoted. Human (AGENT-99 or AGENT-100) intervention is required.

Divergence detection also runs on a scheduled basis: every 5 minutes, the shadow ledger is compared against the production ledger to detect semantic drift — cases where shadow PENDING entries reference entities (session IDs, drone IDs, ledger entries) that have been voided or terminated in production. These entries are pre-emptively classified DIVERGED before their promotion attempt, avoiding wasted CAS cycles.

---

## The CASRetry Shadow Loop

CAS stands for Compare-And-Swap. The CASRetry loop is the retry mechanism for promotion attempts that fail due to concurrent writes racing to the same production ledger tip.

```typescript
async function casRetryPromote(
  shadowEntry: ShadowEntry,
  maxAttempts: number = 5,
  backoffMs: number = 50
): Promise<PromotionResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Read current production tip (atomic)
    const productionTip = await getProductionTip();

    // Recompute chain values against current production tip
    const promotionParent = productionTip.merkle_leaf_hash;
    const promotionLeaf = sha256(
      shadowEntry.entry_id + shadowEntry.payload_hash + promotionParent
    );

    // Attempt atomic CAS insert
    const result = await productionLedger.casInsert({
      ...shadowEntry,
      parent_hash: promotionParent,
      merkle_leaf_hash: promotionLeaf,
      expectedTip: productionTip.merkle_leaf_hash
    });

    if (result.success) {
      return { status: 'PROMOTED', promotionLeaf, attempts: attempt };
    }

    // CAS failed — concurrent write modified the tip
    if (attempt < maxAttempts) {
      // Exponential backoff with jitter
      await sleep(backoffMs * Math.pow(2, attempt - 1) + Math.random() * 20);
    }
  }

  return { status: 'DIVERGED', reason: 'CAS_EXHAUSTED', attempts: maxAttempts };
}
```

The default 5-attempt limit with 50ms base backoff means a CASRetry loop can run for up to approximately 1.6 seconds before declaring divergence. During high-throughput periods (many concurrent shadow promotions), the backoff jitter prevents thundering-herd retry storms where all failed CAS attempts retry simultaneously and collide again.

For Class 1-6 consensus-gated writes (Temporal Locks, Phase Anchors, Rome Protocol updates), the CASRetry limit is extended to 10 attempts with 200ms base backoff, because these writes are rare and must succeed — a diverged Phase Anchor would require a full Consensus Engine re-run to produce a replacement.

---

## Metrics That Must Pass Before Shadow-to-Production Promotion

The Node 4 business rule validation suite evaluates the following metrics, weighted by entry type:

| Metric | Weight | Pass Threshold | Measurement |
|--------|--------|---------------|-------------|
| Payload schema conformance | 0.20 | 1.0 (binary) | JSON schema validation against entry type definition |
| Author authority verification | 0.20 | 1.0 (binary) | author_priority matches entry type requirements |
| Ledger state consistency | 0.20 | ≥ 0.95 | Referenced IDs (session, drone, stage) exist and are ACTIVE |
| Nonce freshness | 0.15 | 1.0 (binary) | timestamp_ns within 30s window |
| Hash chain preimage validity | 0.15 | 1.0 (binary) | payload_hash = SHA256(canonical JSON) |
| Entropy epoch validity | 0.10 | 1.0 (binary) | Nonce epoch not expired at generation time |

Weighted composite score must be ≥ 0.95. Any binary metric (weight marked with a binary pass threshold) that fails produces an automatic composite score of 0.0 regardless of other metric scores. There is no partial credit for a forged signature or an invalid hash chain.

Entry types with elevated requirements (Stage 91+, Temporal Locks, Phase Anchors) apply a minimum composite threshold of 0.99 rather than 0.95. The additional scrutiny at critical stage operations reflects the permanent nature of the records being created.

---

## Shadow Protocol Integration with Reality-C

The Shadow Protocol and Reality-C (the simulation environment, document 18) share infrastructure but serve different functions. Reality-C simulates entire system states to test architectural hypotheses. The Shadow Protocol validates individual writes before production commitment.

The integration point: Reality-C sessions generate shadow writes. Every action taken in a Reality-C simulation produces a shadow ledger entry with `entry_type = 'SIMULATION_EVENT'`. These shadow entries are validated by the promotion decision tree — including full Merkle chain, nonce, and signature verification — but they are promoted to the production ledger only if the Reality-C session is flagged as a LIVE_SIMULATION (a simulation that is expected to produce production-grade artifacts, such as a stress test run that generates real performance metrics to be recorded).

For ANALYSIS_ONLY Reality-C sessions (the majority), shadow entries are validated but not promoted. They remain in the shadow ledger with status PENDING until the session closes, at which point they are marked REJECTED with reason code SIMULATION_ANALYSIS_ONLY and archived to R2. The validation still runs because the validation output — the per-metric scores — is used as the quality assessment of the simulation run. A simulation run that cannot produce shadow entries passing the promotion criteria at ≥ 0.90 composite is considered a low-quality simulation and is flagged in the Reality-C session report.

The Shadow Protocol cannot be disabled within Reality-C. There is no "simulation mode" that bypasses validation. Simulations run under the same rules as production, because simulations that run under weaker rules produce simulation artifacts that cannot be trusted as proxies for production behavior. If the simulation rules differ from production rules, the simulation's conclusions differ from production outcomes. The Phoenix system cannot afford that gap.
