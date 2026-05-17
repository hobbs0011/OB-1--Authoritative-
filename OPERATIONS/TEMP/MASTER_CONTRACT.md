# MASTER_CONTRACT.md
# Phoenix OB-1 — Governance Anchor
# Sealed: 2026-02-27
# Status: GOVERNANCE_ACTIVE

> This file is the governance/identity anchor for the Phoenix OB-1 system.
> It codifies operational law, deploy gates, and threat responses.

---

## DEPLOY GATE

ALL conditions must be true before any deploy:

```
HEATMAP.missing.gategroups.length === 0
HEATMAP.missing.eventcodes.length === 0
chaos_harness_coverage.missing_harnesses.length === 0
system_alerts empty OR only LOW severity
```

Violation → ABORT_SEV1

## OPERATIONAL LAWS

1. Fail-closed by default
2. ECHOLOOP detection mandatory (similarity >= 0.85)
3. Genesis lock — write-once verification
4. Secret leak detection — redact before write
5. Drift tracking → REINCARNATION_REQUIRED
6. HDMM — Humans Decide, Machines Move
7. Downward authority only — 100 → 99 → 98

## STUBBORN THREATS (9 identified)

1. Sovereign key hardcoded — PATCHED
2. Evidence self-fetching — PATCHED
3. Rate limiter fails open — KNOWN RISK
4. ECHOLOOP suppression — detection mandatory
5. KV placeholder not replaced — P0 BLOCKER
6. DO migration tag renumbering — IMMUTABLE
7. Benchmark state loss on rebuild — re-run required
8. Ghost worker stale references — update all URLs
9. Node version drift — unified to Node 20

## ROLLBACK
```bash
git revert HEAD --no-edit
npx wrangler deploy
```

---
*Governance anchor from phoenix-ob1-system, 2026-03-10*
