# REROUTE-DEFINITION RECEIPT (PT5-C104, soul 682 "Execute all")

Parked orders 545–548 executed against live data 2026-11-15:
- hollowReport: hollow=false · soul=682 · runs=38 · dnaEntries=400 · dnaPresent=true
- defineReroute: defined=true · streams soul→ledger(0), dna→ledger(1), reason→ledger(2) · missing=[] —
  soul leads, dna follows, reason trails; sweeper may only move dna→soul gaps, never invent soul.
- sweep(plan): swept=true · moved=0 (v1 is a gate, not a mover; moving needs a manifest + order).
- selfTest: PASS (refuses without reroute, certifies with it).

The sweeper no longer refuses. Soul invention remains forbidden by the plan itself.
Record source: live `window.MerkleSweeper` return values, run 38.
