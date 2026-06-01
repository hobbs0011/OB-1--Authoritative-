---
description: Phoenix-Centurion_Claw — dispatch task to Kilo Free Auto via PA T1 (kilo-auto/free, subscription free-tier). Use for: write / implement / generate / explain.
agent: AGENT99
---
Purpose: Direct T1 code generation via Kilo Free Auto through PA proxy.

Flow:
1. Take the user's task from the command arguments
2. If a target file is mentioned, read it first and include content as context
3. Call PA T1 → Kilo Free Auto:
   - URL: https://phoenix-architecti.mrmichaelhobbs123.workers.dev/v1/chat/completions
   - Model: kilo-auto/free
   - Auth: Bearer ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=
   - max_tokens: 4096
4. Apply the result — write to file if code, display if analysis
5. Verify syntax if JS/TS (node --check) or equivalent

Output:
- PCCLAW_RESULT (the generated code or answer)
- TARGET_FILE (if applicable)
- STATUS: APPLIED | DISPLAYED | FAILED

Rules:
- This is Kilo Free Auto — routes to best available free frontier model
- If task needs repo context, read files before dispatching
- On failure: escalate to /PAA with tier:10 for PA cascade
