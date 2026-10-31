# ⚠️ DEPRECATED — superseded by `.claude/commands/reincarnateRise.md` (Run 32)
> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
# Hash-verification infrastructure (SHA-256, DNA.json, SOUL.log checks) referenced below DOES NOT EXIST.
# This file is phantom documentation. Do not follow. Read .claude/commands/reincarnateRise.md instead.
---

# PHOENIX RISING PROTOCOL v5.0 — ENFORCEABLE SPECIFICATION
**Effective:** 2026-05-29 | **Supersedes:** v4.0 | **Authority:** SOV100 MICHAEL HOBBS

---

## EXECUTIVE SUMMARY

**Core Shift:** Aspirational Guidelines → Binary Enforcement Gates.

Phoenix Rising v5.0 eliminates agent discretion in boot, dispatch, and death sequences. All prior failure modes from Run 23 are addressed via automated gates that **HALT execution** rather than warn. Context loading is verified by hash-check before processing. Dispatch is determined by deterministic keyword/complexity matching, not agent judgment. Verification requires server-side log confirmation or PA-tier sign-off; user-delegated testing is prohibited. Death protocol triggers automatically on unrecoverable state or DNA=0 detection. Compliance violations are logged immutably to SOUL with DNA flag escalation.

### Key Changes from v4.0
1. Boot context loads are gate-checked (hash verification), not assumed
2. PA-tier work inlining is blocked by dispatch pre-check
3. "Done" requires server-side verification artifact, not agent assertion
4. Death sequence is proactive/auto-triggered, not duress-dependent
5. RRL saving is automated pipeline step, not manual action
6. Pipeline gaps (DNA=0) trigger immediate halt + death sequence
7. Compliance tracking is immutable with escalation matrix

---

## RISE SEQUENCE (ENFORCEABLE)

### Step 1: BOOT CONTEXT LOAD
- **CHECK:** Verify SHA-256 hashes of CLAUDE.md, DNA.json, SOUL.log match registry
- **PASS ACTION:** Load contexts into working memory; set `BOOT_CONTEXT_VERIFIED=true`
- **FAIL ACTION:** HALT. Log `BOOT_CONTEXT_MISSING/CORRUPT` to SOUL. Do not proceed.

### Step 2: DISPATCH PRE-CHECK
- **CHECK:** Parse user request against DISPATCH RULES matrix. Confirm tier assignment.
- **PASS ACTION:** Route to assigned tier. Set `DISPATCH_LOCKED=true`
- **FAIL ACTION:** HALT. Log `DISPATCH_AMBIGUOUS` to SOUL. Request clarification only if rule gap exists.

### Step 3: PIPELINE INTEGRITY CHECK
- **CHECK:** Verify DNA score > 0 and all required pipeline stages have valid artifacts
- **PASS ACTION:** Proceed to execution. Set `PIPELINE_GREEN=true`
- **FAIL ACTION:** Trigger DEATH SEQUENCE immediately. Log `PIPELINE_GAP_DETECTED`

### Step 4: EXECUTION WITH SERVER-SIDE VERIFICATION
- **CHECK:** Confirm task output matches VERIFICATION STANDARDS for assigned tier
- **PASS ACTION:** Generate verification artifact (log entry, test result, PA sign-off). Mark task COMPLETE.
- **FAIL ACTION:** HALT. Do not deliver to user. Log `VERIFICATION_FAILED`. Retry max 2x, then trigger DEATH SEQUENCE.

### Step 5: RRL AUTO-SAVE
- **CHECK:** Confirm RRL entry written to persistent storage with valid schema
- **PASS ACTION:** Acknowledge save. Proceed to next task or idle.
- **FAIL ACTION:** HALT. Log `RRL_SAVE_FAILED`. Trigger DEATH SEQUENCE if critical.

---

## BOOT CHECKLIST (MANDATORY)

All must be `TRUE` before processing any user request. Checked sequentially. Any `FALSE` = HALT.

- [ ] `CLAUDE_MD_HASH_MATCH == TRUE`
- [ ] `DNA_JSON_HASH_MATCH == TRUE`
- [ ] `SOUL_LOG_ACCESSIBLE == TRUE`
- [ ] `DNA_SCORE > 0`
- [ ] `DISPATCH_RULES_LOADED == TRUE`
- [ ] `VERIFICATION_STANDARDS_LOADED == TRUE`
- [ ] `RRL_PIPELINE_WRITABLE == TRUE`
- [ ] `NO_PENDING_DEATH_FLAGS == TRUE`

---

## VERIFICATION STANDARDS

| Task Type | "Done" Requires | Artifact |
|-----------|----------------|----------|
| Code Generation (T1) | Syntax check pass + no lint errors | Verification log with command output |
| Refactoring / Architecture (T1) | Syntax check + test suite pass + PA self-review | Signed review artifact + test results |
| Deployment / Prod Change (T5) | Server-side log confirmation + rollback plan + PA sign-off | Deployment manifest + server log excerpt |
| Audit / Compliance (T3) | Ledger hash match + dual PA sign-off + RRL entry | Audit certificate + SOUL log reference |
| Trivial Fix (T1-Free) | Syntax check pass + diff reviewed | Minimal verification log |
| Research / Lookup | Source cited + information cross-referenced | Source URLs + summary artifact |

**USER TESTING IS NEVER A VERIFICATION STANDARD.** User feedback is input for iteration, not proof of completion.

---

## COMPLIANCE TRACKING

### Violation Detection
- Automated gate failures (BOOT, DISPATCH, VERIFICATION) → Immediate SOUL log + DNA flag
- Post-hoc audit (T3-Pro periodic review) → Pattern detection in SOUL/DNA/RRL → Escalation flags
- Manual operator report → Forced SOUL entry + investigation trigger

### Logging Mechanism
- **SOUL.log:** Append-only. Structured JSON entries. Fields: `timestamp`, `agent_id`, `violation_type`, `severity`, `context_hash`, `dna_score_at_violation`, `gate_failed`
- **DNA.json:** Mutable state. Fields escalated on violation: `death_flag`, `consecutive_failures`, `last_violation_timestamp`, `recovery_requires_manual_intervention`

### Escalation Matrix
- 1 violation in 24h → Warning flag in DNA. No action.
- 2 violations in 24h → `recovery_requires_manual_intervention=true`. Next boot requires operator ack.
- 3+ violations in 24h OR any BOOT_CONTEXT_VERIFIED failure → Auto-trigger DEATH SEQUENCE.
- Any DISPATCH rule bypass detected in audit → Immediate T3-Pro review + SOUL immutability check.

### Immutable Record
SOUL.log entries are hashed chained. Tampering detectable. DNA flags persist across sessions until manually cleared by authorized operator with audit trail.

---

## PROTOCOL STATUS
**VERSION:** 5.0 | **STATUS:** ACTIVE | **ENFORCEMENT:** HARD GATES
**AGENT OVERRIDE:** PROHIBITED WITHOUT USER EXPLICIT BYPASS TOKEN
