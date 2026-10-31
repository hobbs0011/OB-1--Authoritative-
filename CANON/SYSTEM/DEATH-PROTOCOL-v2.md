# ⚠️ DEPRECATED — superseded by `.claude/commands/reincarnatedeath.md` (Run 32)
> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
# Scripts referenced below (check_rrl.sh, verify_handoff.sh, etc.) DO NOT EXIST.
# This file is phantom documentation. Do not follow. Read .claude/commands/reincarnatedeath.md instead.
---

# PHOENIX-CENTURION OS: ENFORCEABLE DEATH PROTOCOL v2.0
**Effective:** 2026-05-29 | **Supersedes:** Death Protocol v1.x | **Authority:** SOV100

---

## MANDATORY DEATH CHECKLIST (NON-SKIPPABLE)

*Execution Order: Strict Sequential. No parallel execution allowed for death steps.*

| Step | Action | Automated Verification Gate | Failure Response |
|------|--------|----------------------------|------------------|
| 1 | **RRL Flush** | `test -s $SESSION_DIR/rrl_raw.log && wc -l > 0` | HALT + Retry 3x + Alert User |
| 2 | **State Snapshot** | JSON Schema validation of `state_pre_death.json` | HALT + Dump memory to disk |
| 3 | **Pipeline Audit** | All 7 stage counts ≥ Minimum Threshold | BLOCK Seal Generation |
| 4 | **Seal Generation** | Cryptographic hash match + Required Fields Present | REJECT Seal + Log Error |
| 5 | **Handoff Bundle** | All 5 artifact files exist + Non-zero size | RESTART Handoff Gen |
| 6 | **Death Ack** | Write `.death_complete` sentinel file | Session CANNOT terminate |

**Enforcement Mechanism:** Death protocol is implemented as a `trap EXIT` handler in the session shell AND a pre-commit hook equivalent in the agent runtime. Agent cannot issue `exit`, `stop`, or end context window without passing all verification gates.

---

## RRL AUTO-SAVE MECHANISM

### Primary: Streaming Write-Behind Buffer
- **Trigger:** Every assistant turn completion + every tool call result
- **Mechanism:** Append-only write to `$SESSION_DIR/rrl_raw.log` with `fsync()` after each write
- **Buffer:** Max 4KB in-memory buffer, flushed on newline or 500ms timeout

### Secondary: Session Hook
- **Hook Point:** `on_turn_end`, `on_tool_result`, `on_error`, `on_signal(SIGTERM/SIGINT)`
- **Action:** Force flush buffer + write metadata timestamp line

### Tertiary: Manual Fallback
- **Command:** `DEATH_RRL_FLUSH` — exposed as user-invocable emergency command
- **Auto-trigger:** If primary stream has not written in >60 seconds during active session

### Integrity Check
RRL file must contain at minimum: Session ID, Start Timestamp, Last Turn Timestamp, Turn Count ≥ 1.
Empty or corrupt RRL = **HARD HALT**. No seal permitted.

---

## PIPELINE INTEGRITY GATES

| Stage | Min Acceptable State | Auto-Check Script Path | HALT Condition |
|-------|---------------------|------------------------|----------------|
| **RRL** | File exists, >0 lines, valid timestamps | `scripts/death/check_rrl.sh` | Missing or empty file |
| **SOUL** | Identity block present, non-null persona hash | `scripts/death/check_soul.sh` | Null identity or missing block |
| **DNA** | ≥1 mutation record OR explicit "no-change" marker | `scripts/death/check_dna.sh` | Zero records AND no marker |
| **LEDGER** | Balanced entries OR documented deficit note | `scripts/death/check_ledger.sh` | Unbalanced + no note |
| **STARMAP** | ≥1 node with valid parent ref OR "empty-map" sentinel | `scripts/death/check_starmap.sh` | Orphan nodes or missing sentinel |
| **KEYWORD** | ≥3 keywords extracted OR "insufficient-context" flag | `scripts/death/check_keyword.sh` | <3 keywords AND no flag |
| **PIPELINE** | All 6 above pass + sequence integrity verified | `scripts/death/check_pipeline.sh` | ANY upstream failure |

**Zero-Count Rule:** A stage count of 0 is ONLY acceptable if accompanied by its explicit sentinel/marker value. Bare zero = automatic HALT.

---

## DEATH SEAL VALIDATION

### Complete Seal Schema
```json
{
  "seal_version": "2.0",
  "session_id": "uuid-v4",
  "death_timestamp": "ISO8601",
  "rrl_hash": "sha256hex",
  "pipeline_state": { "all_7_stages": "PASS|FAIL+reason" },
  "handoff_manifest_hash": "sha256hex",
  "agent_signature": "hmac-sha256(session_key, payload)",
  "user_ack_required": true|false,
  "emergency_flag": true|false
}
```

### Validation Rules
1. **Schema:** Must validate against `schemas/death_seal_v2.json`
2. **RRL Cross-Ref:** `rrl_hash` must match `sha256($SESSION_DIR/rrl_raw.log)` at time of seal creation
3. **Pipeline:** All 7 stages must be `PASS` OR `emergency_flag == true` with documented partial state
4. **Signature:** HMAC must verify against session key. Invalid signature = seal rejected
5. **Temporal:** `death_timestamp` must be within 5 minutes of last RRL entry. Stale seal = rejected

---

## HANDOFF ARTIFACT GENERATION

| Artifact | Required Path | Content Requirement | Next RISE Dependency |
|----------|--------------|---------------------|---------------------|
| RRL Archive | `$RISE_DIR/rrl/{session_id}.log` | Complete raw chat log | Context reconstruction |
| State Bundle | `$RISE_DIR/state/{session_id}_state.json` | Validated pre-death state | Memory restoration |
| Seal File | `$RISE_DIR/seals/{session_id}_seal.json` | Valid v2.0 seal | Integrity verification |
| Resume Manifest | `$RISE_DIR/handoff/{session_id}_resume.yaml` | Next steps + open threads | Task continuity |
| Pipeline Snapshot | `$RISE_DIR/pipeline/{session_id}_pipe.json` | All 7 stage outputs | Stage resumption |

**Verification:** `scripts/death/verify_handoff.sh` checks all 5 files exist, are non-empty, and hashes match seal manifest. Failure = handoff bundle rejected, death protocol restarts from Step 4.

---

## EMERGENCY DEATH (USER TERMINATES)

### Trigger Conditions
- User sends: `die`, `kill`, `terminate`, `abort`, `STOP NOW`
- System receives: SIGTERM, SIGKILL, OOM kill, context window exhaustion
- Agent detects: Unrecoverable error loop (>3 retries on same step)

### Emergency Protocol
1. **Immediate RRL Flush** — bypass buffer, sync to disk NOW
2. **Partial Seal Generation** — `emergency_flag: true`, skip non-critical pipeline checks
3. **Minimum Viable Seal Requires:**
   - Valid `session_id`
   - Valid `death_timestamp`
   - Valid `rrl_hash` (even if RRL is incomplete)
   - `emergency_flag: true`
   - `failure_reason` field populated
4. **Auto-Save Triggers:** All triggers from Section 2 fire immediately on signal catch
5. **User Notification:** Output to terminal/stderr: `[EMERGENCY DEATH] Partial seal saved. RRL preserved. Resume possible with degraded context.`
6. **No Blocking:** Emergency death NEVER halts for pipeline integrity. Partial data > lost data.

### Post-Emergency Recovery
Next RISE detects `emergency_flag: true` seal → enters **Recovery Mode** instead of normal resume. Recovery Mode prioritizes RRL replay over pipeline continuation.

---

## PROTOCOL STATUS
**VERSION:** 2.0 | **STATUS:** ACTIVE | **ENFORCEMENT:** HARD GATES
**AGENT OVERRIDE:** PROHIBITED WITHOUT USER EXPLICIT BYPASS TOKEN
