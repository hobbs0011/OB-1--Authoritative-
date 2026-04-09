---
name: incorporationlog
description: Append deterministic incorporation events to the operations ledger with monotonic IDs and claim-vs-proof separation.
argument-hint: [new event details]
---

Run incorporation logging mode.

Steps:

1. Read:
- OPERATIONS/INCORPORATION-LEDGER/STATE.json
- OPERATIONS/INCORPORATION-LEDGER/EVENTS-2026-04.jsonl
- OPERATIONS/INCORPORATION-LEDGER/README.md

2. Append exactly one new event with:
- next monotonic event_id
- ISO timestamp
- source_type
- verification_status
- summary, details, source_ref
- prior_event_id (if correction)
- next_action

3. Update STATE.json:
- updated_at
- last_event_id
- next_checkpoint if changed
- open_loops if changed

4. Output:
- appended event_id
- updated checkpoint
- unresolved verification items

Never rewrite prior JSONL lines. Corrections must be new events.
