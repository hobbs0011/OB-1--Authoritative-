---
description: Phoenix Architecti Agents — 2-tier dispatch. T1=Primary Workhorse, T2=Opus 4.7. Prefix task with [T1]-[T2] to select tier.
agent: AGENT99
---
Purpose: Route task to the correct PA tier model via the Phoenix-Architecti CF worker.

Tier table:
- T1: Primary Workhorse (PA tier=1) — ALL workhorse tasks (write, implement, generate, fix, debug, refactor, audit, pipeline)
- T2: Claude Opus 4.7 — Final rulings, irreversible decisions, arbitration only

Flow:
1. Parse tier from argument prefix [T1]-[T2] — default T1 if none specified
2. Read target file if the task involves one — pass real content as context
3. POST to Phoenix-Architecti:
   - URL: http://localhost:3000/api/code
   - Header: x-pa-auth: ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=
   - Body: { task, context, targetfile, tier }
4. Apply code_patch to targetfile
5. Log d1_row_id as receipt

Output:
- PAA_TIER: T[N] — [model name]
- D1_ROW: [d1_row_id]
- RESULT: [applied to file | displayed]

Rules:
- Always read the target file before dispatching — context = real file content
- T1 confirmed live via PA worker ✓
- T2 requires paid key — set on CF worker
- Cache busts after 1hr — add unique token to task string if retry needed
- On empty result: escalate to T2, retry once
