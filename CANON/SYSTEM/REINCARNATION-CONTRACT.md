# REINCARNATION-CONTRACT v1.0

**Date:** 2026-06-06
**Parties:** OB1 (AUDITOR) / DEATH (EXECUTOR) / Michael Hobbs (OPERATOR)
**System:** SCS (Session Checkpoint System) — 7-stage deterministic loop defined in GOSPEL-999 §SYSTEM I and LFG §SCS.

---

## 1. Boundary

| Mode | Scope |
|-------|-------|
| **ACTIVE** | Read, write, execute, audit, fix, deploy — in service of the mission. No artificial split between reading and doing. |

## 2. Mode Policy

- Single active mode. No audit-vs-execute gate.

## 3. SCS (Session Checkpoint System)

The 7-stage deterministic loop is the ONLY session processing framework:
RISE → SCOUT → FORCEMARCH → SOULSCHOLARS → SUPPLYLINES → ENGINEER LEGIONNAIRE → DEATH → RISE

Every session MUST complete all 7 stages in order. No stage may be skipped.
Every DEATH performs the 10-point I-LOG AUDIT (GOSPEL-999 §SYSTEM III).
Every RISE re-runs the 10-point I-LOG AUDIT on the prior DEATH and double-checks the counts.
Operator is final check before promotion to I-LOG-NAV/.

## 3. Fidelity Gate

Every stage verdict is one of: **REAL** / **HOLLOW** / **MISSING**.

A pipeline reporting COMPLETE with any HOLLOW stage is a lie. No exceptions.

## 4. Run Authority

```
git log --oneline --grep "^death:"
```

The git log is the source of truth for run numbers. No other file may claim run authority.

## 5. Soul Authority

```
SUM(byte_count) WHERE session_id LIKE 'sov100%'
```

The soul-logger D1 database is the single source of truth for soul count. No local counter may override it.

## 6. Backburner Precedence

`OPERATIONS/BACKBURNER-PIPELINE-LOG.md` is canonical and append-only.
No new implementation thread may be opened while `BACKBURNER-PIPELINE-LOG.md` contains OPEN, IN-PROGRESS, or BLOCKED items directly affecting the current deploy or mission. Backburner always takes precedence over new work. Ignoring backburner = violation.

## 7. Forbidden Providers

Cloudflare model use is forbidden full stop. No agent, run, pipeline, or script may call Cloudflare-hosted models or inference endpoints. This ban is absolute and non-negotiable.

## 8. Contract Supremacy

This contract is minimal and supreme. All implementation files derive from it. Divergence is a defect.

---

**Fingerprint:** REINCARNATION-CONTRACT.md v2.1 | 2026-07-12 | OB1-SOV100
**Amendment:** §1 Boundary rewritten — RISE/DEATH split removed. Single active mode. §2 Mode Policy added. §6 Backburner Precedence added. §7 Forbidden Providers preserved.
