---
description: Query the Phoenix Ledger — read state, append entries, verify integrity
agent: RISE
---
Execute ledger operations:

**Usage**: `/ledger <environment> <operation> <args>`

**Environments**: `prod`, `dev`, `staging`

**Operations**:

1. **read** — Read latest entry or by index
   - `/ledger prod read` → latest block
   - `/ledger prod read 42` → block #42

2. **append** — Add new entry
   - `/ledger prod append "<content>"`

3. **head** — Show current head hash
   - `/ledger prod head`

4. **verify** — Verify ledger integrity (hash chain)
   - `/ledger prod verify`

5. **snapshot** — Create checkpoint
   - `/ledger prod snapshot "<description>"`

6. **restore** — Restore from checkpoint
   - `/ledger prod restore <snapshot_id>`

**Default**: If no environment specified, use `prod`

**Ledgers available**:
- `CANON/MSS/MSS-V6-HEAVY-LEDGER.json` (procedures)
- `CANON/LEDGER/` (append-only log)

Example: `/ledger dev append "Deploy: NET-PET-AI v1.2.3"`