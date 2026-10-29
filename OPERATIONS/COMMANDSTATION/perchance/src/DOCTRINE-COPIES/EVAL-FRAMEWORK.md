# PROPOSED — EVAL-FRAMEWORK (P1, CRITICAL)

> **Status:** PROPOSED — not canon. Takes effect only on SOV100 merge into `CANON/SYSTEM/`.
> **Source:** DeepSeek Pro Phase-1 audit 2026-10-29 (receipt Tmvtm43ov), defect #4.
> **Target:** new file `CANON/SYSTEM/EVAL-FRAMEWORK.md` + insert pointer in GOSPEL-999 System VIII + LFG Step 7b.

## EVAL.001 — EVAL GATE BEFORE EVERY PUSH

Every push to the canon branch that modifies agent behavior, prompts, or pipeline logic must pass the eval suite:

- **GOLDEN_SOUL:** 50 canonical soul-DNA pairs with expected outputs (verbatim extraction, no drift). Founder blesses the 50 pairs (Phase 3).
- **LESSON_CHECK:** all checks shipped in the station validator (LSN laws).
- **COST_BUDGET:** per-session token count under the BUDGETS ceiling.
- **LATENCY_BUDGET:** p95 < 8s for any single agent call.

GATE: eval harness returns PASS. ALARM: push with failing or skipped eval = breach.

## EVAL.002 — GOLDEN SET MAINTENANCE

Golden pairs are versioned with the canon. Any mandate change that alters expected outputs must update the affected pairs in the same commit. Stale goldens fail the gate loudly, never silently.

GATE: golden-set version == canon version. ALARM: version skew = halt pushes until reconciled.

## EVAL.003 — NO SEALED-CONTENT EVALS

No eval may assert on sealed identity content (soul verbatim beyond extraction accuracy, SOV100-only authority lines). Evals measure machinery, never the sovereign.
