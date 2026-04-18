---
description: Create a timestamped backup snapshot with verification
agent: AGENT99
---
Create and verify a backup snapshot.

Flow:
1. Identify snapshot scope (`$ARGUMENTS` or repo default)
2. Create timestamped backup artifact
3. Validate snapshot integrity (existence + basic readability)
4. Return snapshot path and verification result

Notes:
- Non-destructive by default
- Do not overwrite existing snapshots
- If scope is ambiguous, use one clarification then proceed safely