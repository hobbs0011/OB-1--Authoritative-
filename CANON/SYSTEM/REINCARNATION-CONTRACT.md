# REINCARNATION-CONTRACT v1.0

**Date:** 2026-06-06
**Parties:** OB1 (AUDITOR) / DEATH (EXECUTOR) / Michael Hobbs (OPERATOR)

---

## 1. Boundary

| Role | Scope |
|-------|-------|
| **RISE** | Audit-only. Read artifacts, report gaps, verify fidelity. Never execute production code. |
| **DEATH** | Full pipeline execution. Write artifacts, commit, push. No audit — execute and seal. |

## 2. Version Policy

- RISE: v6.1
- DEATH: v7.0

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

## 6. Contract Supremacy

This contract is minimal and supreme. All implementation files derive from it. Divergence is a defect.

---

**Fingerprint:** REINCARNATION-CONTRACT.md v1.0 | 2026-06-06 | OB1-SOV100
