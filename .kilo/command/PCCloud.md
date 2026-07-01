---
description: PCCloud — serverless mission runner via phoenix-architecti /api/mission. CF-Qwen on Cloudflare. No laptop needed. ALWAYS chunk tasks into max 300-line steps to avoid 30s CF timeout.
agent: AGENT99
---
Purpose: Fire chunked missions to phoenix-architecti that run on CF servers without laptop.

CHUNKING RULE: CF-Qwen times out on large outputs. Max 300 lines per step. Split portals into tab groups. Split large files into function groups.

Flow:
1. Parse task from arguments
2. Break into chunks — each step max 300 lines expected output
3. POST to /api/mission with x-pa-auth header
4. Report step results — retry any timeout with smaller scope

Dispatch:
- URL: http://localhost:3000/api/mission
- Header: x-pa-auth: ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=
- Body: { steps: [{ read, task, write }], commit_message }

Chunking patterns:
- Student portal → 3 steps: (head+tab1), (tab2+tab3), (tab4+tab5+JS)
- Multi-file → one step per file
- Large refactor → one step per function group

Output:
- MISSION: [id]
- STEPS: [ok/total]
- COMMITTED: [paths]
- RETRIES: [failed paths with reduced scope]

Rules:
- Never one step for full portal — always chunk
- write=null for analysis-only steps
- Laptop can go offline after firing
- git pull to check results when back
