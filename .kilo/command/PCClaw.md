---
description: Phoenix-Centurion_Claw — dispatch task to Qwen 3.7 Max (Dialagram, frontier-tier, free unlimited). Use for: write / implement / generate / explain.
agent: AGENT99
---
Purpose: Direct T1 code generation via Qwen 3.7 Max through Dialagram.

Flow:
1. Take the user's task from the command arguments
2. If a target file is mentioned, read it first and include content as context
3. Call Dialagram/Qwen 3.7 Max:
   - URL: https://dialagram.me/router/v1/chat/completions
   - Model: qwen-3.7-max
   - Auth: Bearer dgr_live_L4lv48wTGuIQJblOf30Fzgpmso8ohPXQ1Fc9gcIJzmHQjY1MsD
   - max_tokens: 4096
4. Apply the result — write to file if code, display if analysis
5. Verify syntax if JS/TS (node --check) or equivalent

Output:
- PCCLAW_RESULT (the generated code or answer)
- TARGET_FILE (if applicable)
- STATUS: APPLIED | DISPLAYED | FAILED

Rules:
- This is Qwen 3.7 Max (#3 globally, Alibaba Cloud) — frontier tier, not a free lightweight model
- If task needs repo context, read files before dispatching
- On failure: escalate to /PAA with tier:1 for PA cascade
