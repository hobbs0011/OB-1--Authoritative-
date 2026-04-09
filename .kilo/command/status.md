---
description: Show system status — NET-PET-AI worker, Notion, ledger state
agent: RISE
---
Show current system status for NET-PET-AI, including:

1. Worker health: curl the /health endpoint
2. Notion connection: query the agent database
3. Ledger head: get latest block hash
4. Git state: current branch + commits ahead/behind

Use $ARGUMENTS to specify what to check, or show all if no args.