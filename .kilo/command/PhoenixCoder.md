---
description: "Send a coding task to Phoenix Coder (DeepSeek via Cloudflare worker). Pre-fetches real file context, calls the HTTP API, applies patch, verifies syntax. Supports /api/code, /api/review, /api/scaffold. Escalates to Tier 2/3 on failure or complexity."
agent: AGENT99
---

# /PhoenixCoder

**DO NOT spawn an agent. DO NOT use the Agent tool.**

Phoenix Coder is an HTTP API. You call it with curl, apply its patch, and verify the result.

**Task:** $ARGUMENTS

## Available Endpoints

- `POST /api/code` — Implement / add / generate code. Fields: `task`, `context`, `targetfile`
- `POST /api/review` — Review existing code, return issues + fixes. Fields: `code`, `filename`, `focus`
- `POST /api/scaffold` — Generate a full new file from spec. Fields: `task`, `filename`, `language`
- `GET /api/status` — Worker health + recent tasks
- `GET /api/log` — Task log from D1. Params: `limit`, `type`

---

## Phase 0 — Complexity Gate

Before calling the API, assess the task:

- If the task touches **more than 3 files** with interdependent logic → escalate immediately to **Tier 2** (AGENT99 handles directly). Print: `DISPATCH → TIER 2 KILO — task exceeds Phoenix Coder scope (multi-file interdependency)`
- If the task requires **audit, architecture, security review, or ledger analysis** → escalate immediately to **Tier 3** (run `/claude`). Print: `DISPATCH → TIER 3 CLAUDE — task requires surgical analysis`
- Otherwise: proceed to Phase 1.

Print: `DISPATCH → TIER 1 PHOENIXCODER — <one-line reason task fits grunt scope>`

---

## Phase 1 — Pre-Flight Context Gathering

Before calling the API, gather real context:

1. **Identify target file(s)** from the task. If ambiguous, glob/grep for the most likely candidate.

2. **Read each target file** (or the relevant section if large). Extract:
   - File path (absolute)
   - Relevant lines or the full file if under ~100 lines
   - Any imports or type signatures the patch will need to be compatible with

3. **Identify adjacent files** the patch may interact with (e.g., the test file, the type definition, the caller). Read just the signatures/exports — not the full body.

4. Compose a `context` string: file path + relevant excerpt + any key constraints noted above. Keep it under 2000 chars.

---

## Phase 2 — API Call

For each target file, call the API:

```bash
curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d "{\"task\": \"$ARGUMENTS\", \"context\": \"<context from Phase 1>\", \"targetfile\": \"<absolute path>\"}"
```

Parse the JSON response and print:

- `code_patch` — the implementation
- `d1_row_id` — log reference ID

If the response is an error or `code_patch` is empty → go to **Escalation**.

---

## Phase 3 — Patch Application

Apply `code_patch` to the target file:

- If patch is a full file replacement: write it directly.
- If patch is a diff/partial: apply to the correct lines.
- If the patch references a function or block that doesn't exist in the file: go to **Escalation**.

For multi-file tasks: apply each patch sequentially, verifying each before moving to the next.

---

## Phase 4 — Verification

After applying all patches:

1. **Syntax check**: if the file is JS/TS, run `node --check <file>` or `tsc --noEmit` if tsconfig exists. For other languages, use the appropriate linter/checker.
2. **Spot check**: read back the patched section and confirm the implementation matches the task intent.
3. **Regression guard**: if there is an adjacent test file, note it — do not run tests automatically, but flag it: `NOTE: run tests for <path> to verify no regression.`

Print the verification result:

```text
PHOENIX PATCH APPLIED
File: <path>
d1_row_id: <id>
Syntax: PASS | FAIL
Status: <one-line summary>
```

---

## Escalation — Tier 2 Handoff

Trigger escalation when:

- API is unreachable or returns an error
- `code_patch` is empty or a stub
- Patch cannot be applied cleanly (conflicts, missing targets)
- Syntax check fails and the error is non-trivial

On escalation:

```text
DISPATCH → TIER 2 KILO — Phoenix Coder failed (<reason>). AGENT99 handling directly.
```

Then AGENT99 takes the task and executes it directly using read/edit/write tools.

---

## Rules

- This is a curl/bash HTTP call — never the Agent tool or a spawned process.
- Pass real file content as context, not placeholder strings.
- Full implementation only — no stubs accepted. If Phoenix Coder returns a stub, escalate.
- `d1_row_id` must be printed for every successful call (audit trail).
- Canon Laws apply: no fabrication, no silent rewrites of restricted paths (`API-SHHHH*.txt`, `RAW-CHAT-LOGS/**`, `SOUL-DNA-BIBLE/**`).
