---
description: Debug system issues — trace errors, find root cause, propose fixes
agent: RISE
---
Execute debug protocol:

**Step 1 — Capture error**:
- Get exact error message, stack trace
- Identify: runtime error | logic error | config error | permission error

**Step 2 — Trace root cause**:
- Use FULL-STACK FORENSICS skill
- Pass 1: Name the question (what exactly is broken)
- Pass 2: Semantic search for related code
- Pass 3: Exact-match grep for symbols
- Pass 4: Read primary sources
- Pass 5: Execute and validate

**Step 3 — Propose fix**:
- Show exact file + line
- Show before/after
- Explain WHY this fixes it (not just WHAT)
- Test if possible

**Output format**:
```
DEBUG: <issue_summary>
├── ROOT CAUSE: <file:line>
├── FIX: <proposed_change>
└── TEST: <verification_command>
```

Use $ARGUMENTS to specify error context or file path.