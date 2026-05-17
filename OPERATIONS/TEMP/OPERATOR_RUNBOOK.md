# PHOENIX OB-1 — OPERATOR RUNBOOK
## Zero-to-PHOENIX_RISEN Execution Pipeline

```
VERSION: v136-PRODUCTION-HARDENED → v137-PHOENIX-SEALED
PROTOCOL: PHOENIX RISING — ROME BALANCED FINALIZATION
DATE: 2026-03-10
CANONICAL_WORKER: phoenix-ob1-system
CANONICAL_URL: phoenix-ob1-system.mrmichaelhobbs1234.workers.dev
LAW: NO_SYSTEM_IS_COMPLETE_UNLESS_OPERATOR_CAN_EXECUTE_IT_FROM_ZERO
```

> ARCHIVE NOTE: This runbook references the original mrmichaelhobbs1234 worker URLs.
> For hobbs-lab deployment, update CANONICAL_URL to phoenix-ob1-system.hobbs-lab.workers.dev

Full runbook preserved. See source: github.com/mrmichaelhobbs1234-lang/phoenix-ob1/docs/OPERATOR_RUNBOOK.md

---

## KEY SECTIONS (summarized for archive)

- Prerequisites: node v18+, npm v9+, wrangler v3+
- 5 Pipeline Stages: Identity Seal → Runtime Hardening → Mining Logic → Docs/Benchmarks → Seal/Version Lock
- 5 Required Secrets: SOVEREIGN_KEY, CHAT_KEY, GITHUB_TOKEN, DEEPGRAM_API_KEY, SRCSHA256
- Migration tags v1-v5 are SACRED — never rename
- Gospel 444: void=#0f0f1a, soul=#a855f7, gold=#f59e0b, BLUE BANNED
- Chaos levels: OFF | LOW | MEDIUM | HIGH | SUPER_SAIYAN
