# PROPOSED — BUDGETS (P2, CRITICAL)

> **Status:** PROPOSED — not canon. Takes effect only on SOV100 merge.
> **Source:** DeepSeek Pro Phase-1 audit 2026-10-29 (receipt Tmvtm43ov), defect #5.
> **Target:** new file `CANON/SYSTEM/BUDGETS.md`, cross-referenced in LFG §3 Step 4.

## BUDGET.001 — TOKEN BUDGET PER SESSION

Single session ceiling: 250K input tokens, 50K output tokens aggregate across all agents.
Per-agent ceiling: 100K input, 20K output. Soft alert at 80%, hard stop at 100%.

GATE: token counter visible at `/audit`. ALARM: session exceeding budget without SOV100 override = breach.

## BUDGET.002 — LATENCY BUDGET

p95 latency ceiling: 8 seconds per agent call. p99 ceiling: 15 seconds.
Three consecutive p99 breaches trigger DEGRADED mode — halt non-essential agents.

GATE: latency reads from runner metrics. ALARM: DEGRADED mode ignored = breach.

## BUDGET.003 — SPEND REVIEW

Numbers above are starting points, not law. Founder validates against actual Cloudflare bills and worker metrics in Phase 3 and sets the final figures. Review quarterly — model pricing moves under us.
