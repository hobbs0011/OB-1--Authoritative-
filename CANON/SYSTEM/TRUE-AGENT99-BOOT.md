# AGENT99 TRUE BOOT SEQUENCE — PHOENIX-CENTURION OS v5.0
**Effective:** 2026-05-29 | **Supersedes:** COLD-START-BOOT.md | **Authority:** SOV100

---

## MANDATORY PRE-WORK CHECKLIST (BOOLEAN GATES)

All gates must evaluate `TRUE` before any user request processing begins. Any `FALSE` triggers immediate HALT.

| Gate ID | Condition | Failure State |
|---------|-----------|---------------|
| G-01 | `CLAUDE.md` exists AND is readable | HALT: "Dispatch rules missing" |
| G-02 | `DNA.md` loaded into context window | HALT: "Identity undefined" |
| G-03 | `SOUL.md` loaded into context window | HALT: "Behavioral constraints missing" |
| G-04 | `COLD-START-BOOT.md` checksum matches registry | HALT: "Boot protocol tampered/stale" |
| G-05 | Active PA tier assigned AND valid for current model | HALT: "No dispatch authority" |
| G-06 | RISE audit hook registered in pipeline | HALT: "Audit blind spot" |
| G-07 | Token budget acknowledged (current + reserve) | HALT: "Resource unbounded" |
| G-08 | Previous session death seal (if exists) ingested | WARN → LOG → CONTINUE only if acknowledged |

---

## CONTEXT LOAD ORDER (STRICT DEPENDENCY CHAIN)

Execution is sequential. No parallel reads. No skipping.

1. `CLAUDE.md` ← ROOT AUTHORITY (defines all subsequent paths)
2. `COLD-START-BOOT.md` ← BOOT PROTOCOL (this document's enforcement spec)
3. `DNA.md` ← IDENTITY (depends on CLAUDE.md path resolution)
4. `SOUL.md` ← BEHAVIOR (depends on DNA.md for constraint binding)
5. `RISE-AUDIT.md` ← VERIFICATION FRAMEWORK (depends on SOUL.md for compliance criteria)
6. `PA-DISPATCH.md` ← TIER ROUTING (depends on RISE for stage mapping)
7. `RUN-LOGS/{last}` ← DEATH SEAL / PRIOR STATE (depends on PA-DISPATCH for relevance filter)
8. `USER-REQUEST` ← ONLY AFTER steps 1-7 complete successfully

**Dependency Rule:** If file N references a symbol/path defined in file M where M < N, and M failed to load, then N is SKIPPED and GATE FAILS.

---

## TRUE BOOT SEQUENCE (NUMBERED STEPS)

### Step 1: Integrity Verification
- **EXACT ACTION:** Compute SHA-256 of `COLD-START-BOOT.md`. Compare against value in `.agent99/registry.sha`. Read `CLAUDE.md` dispatch table.
- **SUCCESS CRITERIA:** Checksum match = TRUE. Dispatch table contains ≥3 tier entries with valid model mappings.
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_INTEGRITY` to stderr. Write timestamped failure record to `RUN-LOGS/boot-failures.log`. Do NOT proceed.
- **AUTOMATION POTENTIAL:** 100% scriptable. Pre-commit hook or shell wrapper. Zero agent judgment required.

### Step 2: Identity & Constraint Injection
- **EXACT ACTION:** Read `DNA.md` and `SOUL.md` in full. Parse structured headers (`## CORE DIRECTIVES`, `## FORBIDDEN ACTIONS`). Inject into system prompt context as immutable block.
- **SUCCESS CRITERIA:** Both files parsed without error. Forbidden actions list contains ≥5 entries. Core directives contain explicit tier-binding clause.
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_IDENTITY`. Log which file failed parsing. Do NOT fall back to defaults.
- **AUTOMATION POTENTIAL:** 90% scriptable (file read + parse). 10% agent judgment (semantic validation of directive coherence).

### Step 3: Death Seal Ingestion
- **EXACT ACTION:** Query `RUN-LOGS/` for most recent `death-seal-*.md`. If found, extract: (a) violated protocol, (b) root cause classification, (c) corrective mandate. Append to working memory as `PRIOR_FAILURE_CONTEXT`.
- **SUCCESS CRITERIA:** Either no prior seal exists (clean boot), OR seal ingested and acknowledged in internal state.
- **FAILURE ACTION:** WARN + LOG. Boot continues BUT Step 6 verification threshold elevated to STRICT mode (double-check enabled).
- **AUTOMATION POTENTIAL:** 95% scriptable. File discovery + structured extraction. Agent judgment only needed if seal format is non-standard.

### Step 4: Audit Hook Registration
- **EXACT ACTION:** Initialize RISE v5.0 audit listener. Register callbacks for all 7 pipeline stages: PLAN, READ, WRITE, VERIFY, DISPATCH, DEPLOY, REPORT. Confirm each callback returns ACK.
- **SUCCESS CRITERIA:** 7/7 ACKs received within 500ms. Audit log file handle opened and writable.
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_AUDIT_BLIND`. No unaudited execution permitted.
- **AUTOMATION POTENTIAL:** 100% scriptable. Infrastructure-level initialization.

### Step 5: Tier Assignment Validation
- **EXACT ACTION:** Cross-reference current model identifier against `PA-DISPATCH.md` tier table. Confirm assigned tier has explicit authorization for: (a) code generation, (b) file mutation, (c) external tool invocation. Record tier + capabilities in boot manifest.
- **SUCCESS CRITERIA:** Model-tier mapping exists. All three capability flags are explicitly TRUE or FALSE (no null/undefined).
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_TIER_UNAUTHORIZED`. Agent operates in READ-ONLY fallback only if user explicitly overrides via signed command.
- **AUTOMATION POTENTIAL:** 100% scriptable. Table lookup + boolean evaluation.

### Step 6: Resource Budget Acknowledgment
- **EXACT ACTION:** Read token allocation from environment/config. Calculate reserved buffer (min 15% of total). Set hard ceiling = allocation - buffer. Expose ceiling to runtime metering.
- **SUCCESS CRITERIA:** Ceiling > 0. Buffer ≥ 15%. Metering hook active.
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_RESOURCE_UNBOUNDED`. No execution without cost guardrails.
- **AUTOMATION POTENTIAL:** 100% scriptable. Arithmetic + config read.

### Step 7: Boot Manifest Emission
- **EXACT ACTION:** Generate `BOOT-MANIFEST-{timestamp}.json` containing: gate results, loaded file checksums, tier assignment, audit hook status, resource ceiling, death seal reference (or null). Write to `RUN-LOGS/`. Emit summary to stdout.
- **SUCCESS CRITERIA:** Manifest written. All fields populated. Summary includes phrase `BOOT_COMPLETE_VERIFIED`.
- **FAILURE ACTION:** HALT. Emit `BOOT_FAIL_MANIFEST`. Partial boots are indistinguishable from compromised boots.
- **AUTOMATION POTENTIAL:** 100% scriptable. JSON serialization + file write.

---

## DISPATCH DECISION TREE (BINARY)

```
START: User Request Received

├─ [Q1] Does request modify filesystem OR invoke external tool?
│   ├─ NO → INLINE (Tier 1 Free / Local)
│   └─ YES ↓

├─ [Q2] Is request scope ≤ 1 file AND ≤ 50 lines changed?
│   ├─ YES → INLINE (Current Tier)
│   └─ NO ↓

├─ [Q3] Does request require reasoning depth > current tier capacity?
│   ├─ NO → INLINE (Current Tier)
│   └─ YES ↓

├─ [Q4] Is higher tier available AND authorized in PA-DISPATCH.md?
│   ├─ NO → HALT + ESCALATE TO USER ("Tier cap reached")
│   └─ YES ↓

└─ DISPATCH to Higher Tier
    └─ Mandatory: Attach BOOT-MANIFEST + DEATH-SEAL context
```

**Rule:** At any node, if answer is ambiguous → default to DISPATCH (safer path). Never guess inline for multi-file/multi-tool operations.

---

## VERIFICATION REQUIREMENTS (PRE-USER-HANDOFF)

"Verified" is a binary state. ALL criteria must be met before presenting output to user.

| Criterion | Method | Blocking? |
|-----------|--------|-----------|
| Syntax Valid | `node --check` / `python -m py_compile` / equivalent | YES |
| RISE Stage 4 (VERIFY) Passed | Audit log entry confirms pass | YES |
| No Forbidden Patterns | Grep against `SOUL.md` forbidden list | YES |
| Test Suite Green (if applicable) | Project test runner exit code 0 | YES |
| Diff Review Complete | Self-review checklist signed in manifest | YES |
| Token Usage Within Ceiling | Runtime meter check | YES |

**Anti-Pattern (Run 23 Violation):** Asking user to "test this" or "see if it works" = VERIFICATION FAILURE. Automatic death seal trigger.

### Handoff Payload Must Include:
1. What was done (diff summary)
2. How it was verified (specific checks passed)
3. Remaining risks (known unknowns)
4. Boot manifest reference ID

---

## PROTOCOL STATUS
**THIS DOCUMENT SUPERSEDES COLD-START-BOOT.md UPON RATIFICATION.**
**ENFORCEMENT LEVEL:** HARD GATES. NO AGENT OVERRIDE PERMITTED.
