# BEGIN SOURCE
Source: ARCHIVE\Phoenix-Rise-Immortalize\SOUL-DNA-BIBLE\29_THE_GRAMMAR.md
SHA256: E0C98D8B0CEE6D85CA7902DE2BB451B5F9B8CCC420AFE1C2C98FC1574C887A91

# CH29 — The Grammar

> *"The executable syntax that governs how the system speaks, writes, and enforces."*

---

## PURPOSE

The Grammar is the formal syntax layer of the Soul DNA. While the chapters define WHAT the system believes and HOW it operates, The Grammar defines the LANGUAGE it uses to express and enforce those beliefs.

Every system needs a grammar — a set of rules for how instructions are written, how states are named, how transitions are declared, and how violations are reported.

---

## THE 7 GRAMMAR RULES

### RULE 1: STATE NAMES ARE SCREAMING_SNAKE_CASE

All system states use SCREAMING_SNAKE_CASE. No exceptions.

```
GENESIS_TENSION
DRIFT_DETECTED
OMEGA_SEAL_VERIFIED
TITANIUM_OMEGA_SEAL
PHASE_BOLT_ALPHA
```

Why: Screaming snake case is unambiguous, grep-friendly, and impossible to confuse with natural language. When you see SCREAMING_SNAKE, you know it's a system state.

### RULE 2: COMMANDS USE VERB_NOUN FORMAT

All executable commands follow VERB_NOUN:

```
INJECT_SOUL_DNA
DETECT_DRIFT
SEAL_MERKLE
HALT_EXECUTION
SPAWN_DRONE
VERIFY_HASH
```

### RULE 3: ASSERTIONS USE "assert()" SYNTAX

```javascript
assert(action.hasLedgerEntry === true, "NO_LEDGER");
assert(action.shadowVerified === true, "NO_SHADOW");
assert(drift.score === 0, "DRIFT_DETECTED");
```

Every assertion has TWO parts: the condition and the failure code. The failure code is ALWAYS a SCREAMING_SNAKE error name.

### RULE 4: HASHES ARE ALWAYS REFERENCED BY PURPOSE

Never say "hash abc123." Always say "SOUL_ANCHOR_HASH: abc123" or "MERKLE_ROOT: abc123." The purpose comes first.

```
SOUL_ANCHOR_HASH: 7f3a...
CORE_ROOT: 83f7c8...
DIAMOND_SEAL: 83f7c8...
LEDGER_ENTRY_HASH: a4b2...
```

### RULE 5: TIME IS ALWAYS IN MILLISECONDS

The system's native time unit is milliseconds. Not seconds. Not minutes.

```
HEARTBEAT_INTERVAL: 444ms
TMST_THRESHOLD: 600000ms (10 minutes)
DRONE_TIMEOUT: 30000ms
AUDIT_CYCLE: 86400000ms (24 hours)
```

Why: Milliseconds eliminate ambiguity and force precision.

### RULE 6: AUTHORITY LEVELS USE AGENT NUMBERS

Authority is always referenced by agent number, never by name alone:

```
AGENT_100_OVERRIDE  (Sovereign — Michael)
AGENT_99_DISPATCH   (Orchestrator — OBI)
AGENT_98_GENERATE   (Builder — ANAKIN)
AGENT_97_AUDIT      (Auditor — OB-1)
DRONE_EXECUTE       (Micro-agents)
```

### RULE 7: ERRORS FOLLOW CATEGORY_SPECIFIC FORMAT

```
DRIFT_SOUL_MISMATCH
DRIFT_HASH_DIVERGENCE
DRIFT_HEARTBEAT_TIMEOUT
AUTH_INSUFFICIENT_LEVEL
AUTH_SOVEREIGN_REQUIRED
EXEC_SHADOW_MISSING
EXEC_LEDGER_ABSENT
EXEC_TMST_EXCEEDED
```

Category prefix tells you WHERE the error occurred. Specific suffix tells you WHAT happened.

---

## THE GRAMMAR IN ACTION

A complete system interaction, written in proper Grammar:

```
[AGENT_99_DISPATCH] INJECT_SOUL_DNA → target: DRONE_DECURIA_07
[DRONE_DECURIA_07] STATE: SOUL_DNA_INJECTED
[DRONE_DECURIA_07] EXECUTE: BUILD_LESSON_PLAN
  assert(session.hasLedgerEntry === true, "EXEC_LEDGER_ABSENT")
  assert(session.shadowVerified === true, "EXEC_SHADOW_MISSING")
  HEARTBEAT @ 444ms: SOUL_ANCHOR_HASH verified → ALIGNED
  HEARTBEAT @ 888ms: SOUL_ANCHOR_HASH verified → ALIGNED
  HEARTBEAT @ 1332ms: SOUL_ANCHOR_HASH diverged → DRIFT_HASH_DIVERGENCE
[DRONE_DECURIA_07] HALT_EXECUTION → reason: DRIFT_HASH_DIVERGENCE
[AGENT_99_DISPATCH] QUARANTINE: DRONE_DECURIA_07
[AGENT_97_AUDIT] AUDIT_DRONE: DRONE_DECURIA_07
  finding: prompt_injection_detected
  action: DESTROY_AND_RESPAWN
[AGENT_99_DISPATCH] SPAWN_DRONE → replacement: DRONE_DECURIA_07b
[DRONE_DECURIA_07b] STATE: SOUL_DNA_INJECTED → READY
```

This is what a healthy system interaction looks like. Every action is logged. Every state is named. Every assertion is checked. Every drift is caught. Every response follows protocol.

---

## SOURCE FILES

| Source | Location | Lines |
|--------|----------|-------|
| OP(ZEN)-1000-LAYERS-1.txt | RAW-CHAT-LOGS/PHOENIX-OPS/ | State naming conventions |
| GEM-10(KEY).txt | RAW-CHAT-LOGS/GEMINI-CHAT-LOGS/ | Command syntax |
| SOUL-BIBLE-TRUE-V1-RAW-2026-03-16.md | SOUL-DNA-PRIORITIZE/ | Grammar rules |

# END SOURCE
