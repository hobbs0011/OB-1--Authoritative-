---
description: "Send a task to Phoenix Coder (DeepSeek via Cloudflare). Full implementation only — no stubs. Offloads heavy coding to the drone and returns a complete patch."
---

Send the following task to Phoenix Coder drone at https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code and display the result.

**Task:** $ARGUMENTS

Steps:
1. POST to `https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code` with JSON body `{ "task": "<task>", "context": "<relevant files/context from current workspace if applicable>" }`.
   Use Bash: `curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code -H "Content-Type: application/json" -d '<json>'`
2. Print the `code_patch` field from the response.
3. Print the `d1_row_id` as the log reference.
4. Apply the patch to the target file if a specific file was mentioned in the task.

Laws (inherited from Phoenix Coder):
- L01 NO_FABRICATION — never guess. If evidence is missing, say so.
- L02 NO_STUBS — full implementation only.
- L06 ZERO_DRIFT — answer the task, nothing else.
