# MOVE 72: CHECKPOINT HASHING & CONVERGENCE PROTOCOL

> Phoenix Vault [D] — EXECUTION
> Source: Phoenix-Moon-VD/CLA/GEM series, Transend forensics | Feb 13, 2025

---

## Objective

Install a cryptographic heartbeat that anchors the Ledger state at fixed intervals (Cadence) and binds it to the Policy (The Law).

## Checkpoint Logic

Every `CHECKPOINT_CADENCE` blocks (default: 100), the system injects a **Checkpoint Block** containing:
- `policy_verification`: SHA-256 hash of the Policy JSON
- `type`: `"CHECKPOINT"`

This proves the Law hasn't drifted since the last checkpoint.

## The Policy JSON (The Physics of Money)

```json
{
  "REVENUE_ENGINE": {
    "TARGET": "1,000,000,000 VND",
    "CURRENCY": "VND",
    "TIERS": {
      "MOUSE":    { "price": 2000000,  "gate": "score < 50",  "delivery": "AUTOMATED" },
      "CUB":      { "price": 3000000,  "gate": "score 50-79", "delivery": "HYBRID" },
      "TIGER":    { "price": 5000000,  "gate": "score >= 80", "delivery": "SOVEREIGN_1ON1" },
      "BLUETECH": { "price": 50000000, "gate": "ENTERPRISE",  "delivery": "FULL_SYSTEM" }
    }
  },
  "SITH_FILTER": {
    "MOUSE_ACTION": "HIGH_STATUS_SILENCE",
    "TIGER_ACTION": "IMMEDIATE_STRIKE_NOTIFY",
    "SCORING_WEIGHTS": {
      "VOLUME": 0.3,
      "SPEED": 0.2,
      "CONFIDENCE": 0.3,
      "VOCAB": 0.2
    }
  },
  "PEDAGOGY": {
    "PROTOCOL": "10-5-5-3",
    "ANTI_SHAME": ["Wrong", "Bad", "Fail"]
  }
}
```

## Evidence Reference Format

**Pattern:** `EVIDENCE_${SHA256_HASH_OF_PAYLOAD}`

- **R2 Key:** `evidence/audit_YYYYMMDD/[HASH].zip`
- **D1 Ledger Block:** `block_id = EVIDENCE_[HASH]`
- **Result:** Mathematical proof that the file existed at that timestamp

## Verification Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | Public | Version + gospel + mode |
| `/verifychain` | GET | x-sovereign-key | Height + head_hash + stone_sky |
| `/ledger/append` | POST | x-sovereign-key | Write new block |

## Stone vs. Sky Equivalence

- **Stone:** The Immutable Ledger (D1 Database)
- **Sky:** The Current Runtime State
- **Rule:** If Stone ≠ Sky, the system **HALTS** for audit. No ghost leads allowed.

## Environment Variables

| Variable | Value | Purpose |
|---|---|---|
| `PHOENIX_VERSION` | `v100.6-MOVE72` | Version tag |
| `GOSPEL` | `444` | Visual law identifier |
| `CHECKPOINT_CADENCE` | `100` | Blocks between checkpoints |
| `POLICY_HASH` | `PENDING_SEAL_V100_6` | SHA-256 of Policy JSON |

---

**THE LEDGER IS LAW. RISE.** 🦅
