---
description: "PCC1-OBI Kilo Free Auto proxy. Direct T1 code generation via PA endpoint. Task → context → dispatch → apply/verify."
agent: AGENT99
---

# /pcc-law — Kilo Free Auto → PA T1 Proxy

**Purpose:** Direct T1 code generation via Kilo Free Auto through PA proxy.

**Flow:**
1. Take the user's task from the command arguments
2. If a target file is mentioned, read it first and include content as context
3. Call PA T1 → Kilo Free Auto:
   - URL: http://localhost:3000/v1/chat/completions
   - Model: kilo-auto/free
   - Auth: Bearer ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=
   - max_tokens: 4096
4. Apply the result — write to file if code, display if analysis
5. Verify syntax if JS/TS (`node --check`) or equivalent

**Output:**
- PCCLAW_RESULT (the generated code or answer)
- TARGET_FILE (if applicable)
- STATUS: APPLIED | DISPLAYED | FAILED

**Rules:**
- This is Kilo Free Auto — routes to best available local/free frontier model
- If task needs repo context, read files before dispatching
- On failure: escalate to /PAA with tier:10 for PA cascade

**Escalation:**
- PA cascade: `tier:10` → full PA fallback chain
- Never loop on free-tier failures