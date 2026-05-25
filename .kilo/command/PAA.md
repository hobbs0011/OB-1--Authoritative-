---
description: Phoenix Architecti Agents — 5-tier dispatch. T1=Qwen Max (free), T2=DeepSeek Flash, T3=DeepSeek Pro, T4=Gemini, T5=Opus. Prefix task with [T1]-[T5] to select tier.
agent: AGENT99
---
Purpose: Route task to the correct PA tier model via the Phoenix-Architecti CF worker.

Tier table:
- T1: Qwen 3.7 Max (Dialagram) — write / implement / generate
- T2: DeepSeek V4 Flash — fix / debug / refactor / wire up
- T3: DeepSeek V4 Pro — audit / analyze / architecture / deep synthesis
- T4: Gemini 3.5 Flash — heavy cross-domain / large context
- T5: Claude Opus 4.7 — doctrine / ledger / irreversible decisions

Flow:
1. Parse tier from argument prefix [T1]-[T5] — default T1 if none specified
2. Read target file if the task involves one — pass real content as context
3. POST to Phoenix-Architecti:
   - URL: https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code
   - Body: { task, context, targetfile, tier }
4. Apply code_patch to targetfile
5. Log d1_row_id as receipt

Output:
- PAA_TIER: T[N] — [model name]
- D1_ROW: [d1_row_id]
- RESULT: [applied to file | displayed]

Rules:
- Always read the target file before dispatching — context = real file content
- T1 confirmed live: Dialagram-Qwen ✓ (verified Run 18)
- T2-T5 require paid keys — all set on CF worker
- Cache busts after 1hr — add unique token to task string if retry needed
- On empty result: escalate one tier up, retry once
