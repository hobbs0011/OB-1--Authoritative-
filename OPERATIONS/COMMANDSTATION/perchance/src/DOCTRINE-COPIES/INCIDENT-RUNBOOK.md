# PROPOSED — INCIDENT-RUNBOOK (P3, CRITICAL)

> **Status:** PROPOSED — not canon. Takes effect only on SOV100 merge.
> **Source:** DeepSeek Pro Phase-1 audit 2026-10-29 (receipt Tmvtm43ov), defect #6.
> **Target:** new file `CANON/SYSTEM/INCIDENT-RUNBOOK.md`. GOSPEL-999 preamble gains one line: "ALARM conditions map to incident severity per CANON/SYSTEM/INCIDENT-RUNBOOK.md."

## SEVERITY LEVELS

| Level | Meaning | Notify | Acknowledge | Resolve | Record |
|---|---|---|---|---|---|
| SEV0 | Soul-chain break, canon push to wrong branch, live secret in source | SOV100 directly, everything else halts | 15 min | 4 h | Full postmortem, sealed to canon |
| SEV1 | Secret found in pushed source, runner down > 30 min, soul-logger 5xx storm | SOV100 directly | 1 h | 24 h | Postmortem, sealed to canon |
| SEV2 | Lane down (free-tier hollow, single worker failing), budget hard-stop hit | I-LOG + station card | 4 h | 72 h | Postmortem-lite in I-LOG |
| SEV3 | Single failed push, transient 4xx/5xx, stale mirror | I-LOG entry | next session | 7 d | I-LOG entry only |
| SEV4 | Cosmetic, docs drift, single stale gauge | I-LOG entry | — | 30 d | I-LOG entry only |

## RULES

- Every ALARM in GOSPEL-999 maps to exactly one level. Unmapped ALARM = SEV3 by default until classified.
- Postmortem template: what happened / impact / root cause / fix / what would have caught it earlier / eval added.
- Notification paths (phone? email? I-LOG only?) are founder-confirmed in Phase 3 — the table above proposes, SOV100 disposes.
