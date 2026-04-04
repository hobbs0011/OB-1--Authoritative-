# 10 — SOLANA INTELLIGENCE LAYER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — ON-CHAIN MONITORING

---

## Purpose

Solana Actions & Blinks provide trustless, on-chain settlement for Phoenix revenue flows. Oracle's job is to watch those on-chain events, verify they match the Phoenix ledger, and flag any discrepancy before it becomes a problem. **On-chain is truth. If the Solana ledger and the Phoenix D1 ledger disagree, both are flagged and Agent-100 is notified.**

---

## Why Solana

Solana offers:
- Sub-second finality (transactions confirmed in ~400ms)
- Near-zero fees (~$0.00025 per transaction)
- Trustless settlement (no central authority can reverse a confirmed transaction)
- Actions & Blinks (composable transaction builders, shareable links for payments)

For Phoenix, Solana is the settlement layer. Franchise fees, revenue shares, agent compensation — any monetary flow that benefits from trustless confirmation goes on-chain via Solana.

---

## Oracle's Role in Solana Monitoring

Oracle does not generate Solana transactions. Oracle watches them.

**What Oracle monitors:**
- All incoming revenue transactions to Phoenix Solana addresses
- Franchise fee payment confirmations from NET nodes
- Revenue share disbursements to authorized recipients
- Any transaction that references a Phoenix wallet address

**What Oracle does when it detects a Solana event:**

1. Confirms transaction signature is valid (on-chain verification via Solana RPC)
2. Cross-checks transaction amount against expected payment from Phoenix D1 ledger
3. Assigns match status: CONFIRMED / DISCREPANCY / UNEXPECTED
4. Logs event to Oracle ledger
5. Updates Phoenix Merkle ledger with confirmed revenue entry
6. Escalates DISCREPANCY and UNEXPECTED events to Agent-99 immediately

---

## Event Monitoring Table

| Event Type | Trigger | Oracle Action | Ledger Entry |
|------------|---------|---------------|--------------|
| Franchise fee received | Solana tx to Phoenix wallet from node address | Verify amount vs D1 expected | `REVENUE_CONFIRM | node: [city] | amount: [SOL/USD]` |
| Unexpected inbound tx | Solana tx from unknown wallet | Flag UNEXPECTED, alert Agent-99 | `UNEXPECTED_TX | wallet: [address] | amount: [SOL]` |
| Revenue share disbursed | Outbound tx from Phoenix wallet | Verify recipient authorization + amount | `DISBURSEMENT | recipient: [role] | amount: [SOL]` |
| Failed transaction | Transaction rejected by Solana | Alert Agent-99, check retry protocol | `TX_FAIL | expected: [tx details] | reason: [error]` |
| Solana Actions trigger | Blink link used to initiate payment | Confirm transaction completes | `BLINK_TRIGGER | action: [name] | status: PENDING→CONFIRMED` |

---

## Revenue Confirmation Flow

```
NET franchise node generates student payment (VND/USD)
        ↓
Converted to SOL via approved exchange pathway
        ↓
Solana transaction sent to Phoenix wallet address
        ↓
Oracle detects incoming transaction via RPC monitoring
        ↓
Oracle verifies: amount | sender | reference ID
        ↓
Match confirmed? → Phoenix D1 revenue ledger updated
        ↓
Match failed? → Agent-99 alerted → Discrepancy investigation
        ↓
Oracle Merkle ledger entry added (hash of tx + D1 entry)
```

---

## Agent-99 Monitoring Protocol for Solana Transactions

Agent-99 runs a daily Solana reconciliation:

- Compare all Solana transactions in the last 24 hours against expected D1 entries
- Confirm all franchise fee payments arrived for the billing period
- Flag any node that missed a payment (>48 hours late = Agent-99 alert, >7 days late = Agent-100 alert)
- Verify no unauthorized outbound transactions occurred
- Daily summary pushed to Oracle ledger as: `SOLANA_RECONCILE | date: [date] | status: CLEAN / FLAG`

---

## Transaction Verification Protocol

Before any Solana transaction is treated as confirmed revenue:

1. **On-chain confirmation:** Transaction has ≥ 31 confirmations on Solana mainnet
2. **Signature validity:** Verified via Solana RPC `getTransaction` call
3. **Amount match:** Transaction amount matches D1 expected amount within 1% tolerance (exchange rate variance)
4. **Sender authorization:** Sender wallet is on the Phoenix approved wallet list
5. **Reference ID match:** Transaction memo field contains correct Phoenix reference ID

**All 5 checks must pass. One fail = transaction flagged as PENDING-REVIEW.**

---

## Solana-to-Phoenix Merkle Ledger Integration

Every confirmed Solana transaction produces a Merkle ledger entry:

```
{
  "timestamp": "[ISO 8601]",
  "event_type": "SOLANA_CONFIRM",
  "tx_signature": "[Solana tx signature]",
  "amount_sol": "[amount]",
  "amount_usd": "[estimated USD at time of tx]",
  "node": "[franchise node city]",
  "phoenix_ref": "[Phoenix reference ID]",
  "merkle_hash": "[hash of this entry + previous entry]"
}
```

These entries are immutable. Once written to the Merkle ledger, they cannot be modified. Any attempt to modify a Merkle entry is detected by hash chain verification and triggers a score-5 drift alert.
