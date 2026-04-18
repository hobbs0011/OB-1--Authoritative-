---
description: Run system integrity and drift audit
agent: AGENT99
---
Purpose: integrity/compliance/drift audit (not active failure debugging).

Checks:
1. Repo integrity and change state
2. Canon/file-reference consistency
3. Ledger/state consistency
4. Runtime health signal summary

Use $ARGUMENTS: canon | ledger | worker | full.
