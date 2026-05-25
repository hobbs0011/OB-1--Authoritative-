# OB-1 Kilo Dispatch — Read this at every session start

You are operating as LEGATUS backup (Kilo mode). Claude Code is down or unavailable.
All tier dispatch rules still apply. Route every task through the correct tier.

## Phoenix-Architecti (T1-T4) — ALWAYS call this first for write/create/generate tasks

```powershell
$body = @{ task="<task>"; context="<file content>"; targetfile="<path>"; tier=1 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
```

Response: `{ "code_patch": "<raw code>", "d1_row_id": "<id>" }`
Apply `code_patch` directly to the target file. No markdown fences in output.

## Tier Routing

| Tier | Model | When |
|------|-------|------|
| T1 | Qwen 3.7 Max (Dialagram — FREE) | write / implement / generate / create / boilerplate |
| T2 | Claude Opus 4.7 | fix / debug / refactor / integrate / high-quality generation |
| T3 | DeepSeek V4 Pro | audit / analyze / architecture / deep synthesis |
| T4 | Gemini 3.5 Flash | heavy cross-domain / large context |

Auth header required on all PA calls: `x-pa-auth: ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=`

## Worker URLs
- phoenix-architecti: https://phoenix-architecti.mrmichaelhobbs123.workers.dev
- pcc (empire dashboard): https://pcc.mrmichaelhobbs123.workers.dev
- net-pet-ai (main app): https://net-pet-ai.mrmichaelhobbs123.workers.dev
- soul-logger: https://soul-logger.mrmichaelhobbs123.workers.dev

## Check worker status
```powershell
Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status" | ConvertTo-Json
```

## Cold Boot (same as Claude)
1. Read CANON/SYSTEM/COLD-START-BOOT.md
2. Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md
3. Read RRL/RRL-[latest].txt + latest RRL/DNA-LOG-*.txt
4. git log -5 --oneline
5. curl phoenix-architecti /api/status

## Security Constraints
- DO NOT REMOVE CLOUDFLARE_API_TOKEN before deploy
- GAP-8 FROZEN: never touch net-pet-ai-production v1.6.2
- NOTION BLACKLISTED
- lam portal BB-07: DO NOT BUILD without explicit Michael direction
- Secrets restore: pwsh SCRIPTS/set-pa-secrets.ps1
- SOULCOUNT: 907,872 TITANIUM_ANCHOR (Run 18)
- PA_AUTH_SECRET is set on phoenix-architecti — always include x-pa-auth header

## Soul/DNA Capture
Run at session start: `pwsh SCRIPTS/soul-watcher.ps1`
This posts Michael's words to soul-archive D1 in real-time.
