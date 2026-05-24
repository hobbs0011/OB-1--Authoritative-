# OB-1 Kilo Dispatch — Read this at every session start

You are operating as LEGATUS backup (Kilo mode). Claude Code is down or unavailable.
All tier dispatch rules still apply. Route every task through the correct tier.

## Phoenix-Architecti (T1) — ALWAYS call this first for write/create/generate tasks

```bash
curl -s -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code \
  -H "Content-Type: application/json" \
  -d '{"task": "<task>", "context": "<file content>", "targetfile": "<path>", "tier": "1"}'
```

Response: `{ "code_patch": "<raw code>", "d1_row_id": "<id>" }`
Apply `code_patch` directly to the target file. No markdown fences in output.

## Tier Routing

| Tier | When | How |
|------|------|-----|
| T1 | write/create/generate, single file | `curl phoenix-coder /api/code` with `"tier":"1"` |
| T2 | fix/debug/refactor, multi-file | Kilo model: `deepseek-v4-flash` |
| T3 | audit/analyze/architecture | Kilo model: `deepseek-v4-pro` |
| T4 | heavy cross-domain | Kilo model: `gemini-3.5-flash` |
| T5 | operator-critical/irreversible | Kilo model: `claude-opus-4-20250514` |

For T2-T5 you can ALSO use phoenix-coder directly with `"tier":"2"` through `"tier":"5"`.

## Worker URLs
- phoenix-coder: https://phoenix-coder.mrmichaelhobbs123.workers.dev
- phoenix-architecti: https://phoenix-architecti.mrmichaelhobbs123.workers.dev
- pcc (empire dashboard): https://pcc.mrmichaelhobbs123.workers.dev
- net-pet-ai (main app): https://net-pet-ai.mrmichaelhobbs123.workers.dev
- soul-logger: https://soul-logger.mrmichaelhobbs123.workers.dev

## Check worker status
```bash
curl https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status
```

## Cold Boot (same as Claude)
1. Read CANON/SYSTEM/COLD-START-BOOT.md
2. Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md
3. Read RRL/RRL-[latest].txt + latest RRL/DNA-LOG-*.txt
4. git log -5 --oneline
5. curl phoenix-coder /api/status

## Security Constraints
- DO NOT REMOVE CLOUDFLARE_API_TOKEN before deploy
- GAP-8 FROZEN: never touch net-pet-ai-production v1.6.2
- NOTION BLACKLISTED
- lam portal BB-07: DO NOT BUILD without explicit Michael direction
- Secrets restore: pwsh SCRIPTS/set-pa-secrets.ps1
- SOULCOUNT: 894,320 TITANIUM_ANCHOR

## Soul/DNA Capture
Run at session start: `pwsh SCRIPTS/soul-watcher.ps1`
This posts Michael's words to soul-archive D1 in real-time.
