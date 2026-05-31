# OB-1 Kilo Dispatch — Read this at every session start

You are operating as LEGATUS backup (Kilo mode). Claude Code is down or unavailable.
All tier dispatch rules still apply. Route every task through the correct tier.

## Phoenix-Architecti (T1-T2) — ALWAYS call this first for write/create/generate tasks

```powershell
$body = @{ task="<task>"; context="<file content>"; targetfile="<path>"; tier=1 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
```

Response: `{ "code_patch": "<raw code>", "d1_row_id": "<id>" }`
Apply `code_patch` directly to the target file. No markdown fences in output.

## Tier Routing

| Tier | Model | When |
|------|-------|------|
| T1 | Qwen 3.7 Max (Dialagram) | ALL workhorse: write / implement / generate / fix / debug / refactor / audit / pipeline |
| T2 | Claude Opus 4.7 | Final rulings / irreversible decisions / arbitration only |

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

## PRE-CODE GATE — MANDATORY BEFORE ANY APPS/NET-PET-AI CHANGE

Run 31 car crash: agent touched chat.js/index.js WITHOUT reading docs. Destroyed 4 runs of uncommitted work.

Before dispatching T1 for any NET-PET-AI change, YOU MUST READ:
1. `OPERATIONS/STUDENT-PORTAL-DEV.md` — full file, not partial
2. `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md` — §2 at minimum

Pass both as context in the PA call. Skipping = L56 violation = Run 31 repeat.

### Deepgram Voice Agent — Invalid Fields (WILL BREAK SETTINGSAPPLIED)
Never add: `language_hints`, `smart_format`, `mip_opt_out`, `utterance_end_ms`, `audio.output.container`, `audio.output.sample_rate`
These are REST STT only — invalid in Voice Agent WS.

### Deepgram Voice Agent — Correct Protocol
- WS URL: `wss://agent.deepgram.com/v1/agent/converse`
- Text inject: `{type: "InjectUserMessage", content: "..."}`
- Agent inject: `{type: "InjectAgentMessage", message: "..."}`  (field = `message` not `content`)
- Prompt update: `{type: "UpdatePrompt", prompt: "..."}` (NOT UpdateInstructions)
- Context history: `agent.context.messages` (NOT root `messages`)
- TTS model: `aura-2-zeus-en` (DO NOT revert to asteria)

## L55 COMMIT_DONT_HOLD
Every verified working feature MUST be committed before session end.
Gapless audio v2+v3 was lost permanently because it ran uncommitted across 4 runs (Runs 27-31).

## Security Constraints
- DO NOT REMOVE CLOUDFLARE_API_TOKEN before deploy
- GAP-8 FROZEN: never touch net-pet-ai-production v1.6.2
- NOTION BLACKLISTED
- lam portal BB-07: DO NOT BUILD without explicit Michael direction
- Secrets restore: pwsh SCRIPTS/set-pa-secrets.ps1
- SOULCOUNT: 60,037,507 TITANIUM_ANCHOR (Run 32 — updated from stale 907,872)
- PA_AUTH_SECRET is set on phoenix-architecti — always include x-pa-auth header

## Soul/DNA Capture
Run at session start: `pwsh SCRIPTS/soul-watcher.ps1`
This posts Michael's words to soul-archive D1 in real-time.
