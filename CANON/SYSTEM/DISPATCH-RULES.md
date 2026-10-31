# ⚠️ DEPRECATED — superseded by CLAUDE.md dispatch tiers (Run 32)
> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
# Tiers T3-Pro and T5-Claude referenced below DO NOT EXIST in current system.
# Current system: T1=Qwen via PA, T2=Opus via PA tier:2. See CLAUDE.md.
---

# PHOENIX-CENTURION OS: DISPATCH ENFORCEMENT RULES v1.0
**Effective:** 2026-05-29 | **Authority:** SOV100 | **Binding:** ALL AGENTS

---

## DISPATCH DECISION MATRIX (BINARY)

| Condition | Required Tier | Notes |
|-----------|--------------|-------|
| Request contains "audit", "ledger", "reincarnation", "compliance review" | T3-Pro | Never inline. PA sign-off required. |
| Request contains "deploy", "production", "irreversible", "secret", "credential" | T5-Claude | Server-side verification mandatory. |
| Request contains "refactor", "architecture", "migration", multi-file spec, complex reasoning | T1-QwenMax | Full output. No stubs. Verify syntax. |
| Request contains "fix typo", "single-line", "trivial", "quick lookup" | T1-Free (Cerebras/Groq) | Fast path. No PA overhead. |
| Request matches NONE of above AND complexity_score < 3 | T1-Free | Default low-complexity path. |
| Request matches NONE of above AND complexity_score >= 3 | T1-QwenMax | Default medium-complexity path. |
| Dispatch rule ambiguous / no match AND complexity_score indeterminable | HALT | Log `DISPATCH_AMBIGUOUS`. Do not guess. |

**NO EXCEPTIONS. NO AGENT OVERRIDE. NO "I THINK THIS IS SIMPLE ENOUGH FOR..."**

---

## PRE-DISPATCH CHECKLIST

Before starting ANY task, agent must answer these questions to determine correct tier:

1. **Scope:** Does this touch >1 file OR >50 lines? → If YES, escalate to T1-QwenMin+
2. **Irreversibility:** Can this be undone trivially? → If NO, escalate to T5-Claude
3. **Security:** Does this involve secrets, auth, credentials, PII? → If YES, T5-Claude
4. **Audit Required:** Is this a compliance/ledger/reincarnation operation? → If YES, T3-Pro
5. **Context Depth:** Does this require reading >3 source files or prior DNA/SOUL? → If YES, T1-QwenMax
6. **Output Nature:** Is this analytical (research/audit) vs generative (code/write)? → Analytical = PA tier; Generative = appropriate coding tier
7. **Failure History:** Has this task type failed in last 3 sessions? → If YES, escalate one tier

**If ANY answer is uncertain → DISPATCH (safer path).**

---

## ANTI-INLINE GUARDS

### Guard 1: Keyword Interlock
Tasks matching Tier 1+ keywords CANNOT be executed inline. Agent must call PA endpoint before generating code. Bypass = automatic SOUL violation log.

### Guard 2: Token Budget Circuit Breaker
If inline execution exceeds 2000 output tokens for a single task, agent MUST pause and re-evaluate tier assignment. Continued inline execution = waste flag.

### Guard 3: Mandatory Subagent Call
For any task classified as T1-QwenMax or above, agent MUST invoke `task` tool with appropriate subagent_type BEFORE producing deliverable. Direct output without subagent = protocol violation.

### Guard 4: Audit Trail Requirement
Every dispatch decision must be logged to DNA with: task description, tier selected, justification, token cost. Missing audit trail = post-hoc violation flag.

---

## COST TRACKING REQUIREMENTS

### Per-Task Logging (DNA Entry)
```json
{
  "dispatch_id": "uuid-v4",
  "task_id": "string",
  "parent_task_id": "string|null",
  "requested_tier": "enum[T1_FREE|T1_QWEN|T2_FLASH|T3_PRO|T5_CLAUDE|PA]",
  "resolved_tier": "enum[same]",
  "escalation_chain": ["T1_QWEN", "PA"],
  "checklist_answers": {
    "scope": "boolean",
    "irreversible": "boolean",
    "security": "boolean",
    "audit_required": "boolean",
    "context_depth": "boolean",
    "output_nature": "analytical|generative",
    "failure_history": "integer"
  },
  "anti_inline_guard_passed": "boolean",
  "input_tokens": "integer",
  "output_tokens": "integer",
  "cost_usd": "float",
  "latency_ms": "integer",
  "status": "success|fail|escalated|halted|waste",
  "escalation_reason": "string|null",
  "timestamp": "ISO8601",
  "session_id": "string",
  "operator_id": "SOV100"
}
```

### Cost Alerts
- Single task > $0.50 → WARN in DNA
- Session total > $5.00 → ALERT operator
- Single task > $2.00 → HALT + require operator ack

---

## ESCALATION TRIGGERS

| Trigger | Action |
|---------|--------|
| Task fails 2x at current tier | Auto-escalate to next tier |
| Task exceeds 5-minute wall clock | Re-evaluate tier; escalate if appropriate |
| User explicitly requests higher tier | Immediate escalation |
| PA audit recommends escalation | Mandatory escalation |
| Agent uncertainty about correctness | Escalate to T3-Pro for ruling |
| Security-sensitive operation detected | Immediate T5-Claude |

---

## DISPATCH AUDIT LOG FORMAT

All dispatch decisions logged to DNA using the schema above. Logs are append-only. Post-hoc audits (T3-Pro) review dispatch compliance weekly. Pattern violations trigger operator alert.

---

## PROTOCOL STATUS
**VERSION:** 1.0 | **STATUS:** ACTIVE | **ENFORCEMENT:** HARD GATES
**VIOLATIONS:** Logged to SOUL. 3+ in 24h = auto-death sequence.
