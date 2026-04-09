---
description: Set up NET-PET-AI for first deployment
agent: RISE
---
Run the NET-PET-AI setup:
1. Verify wrangler.toml exists and is valid
2. Check secrets are set (SOVEREIGNKEY, NOTION_KEY, etc.)
3. Run npm run verify:wrangler
4. Execute npx wrangler deploy --dry-run

This is the magnet "Setup" command.