# COLD START BOOT — OB1 Agent 99
## Last Updated: 2026-04-20 ICT (Run 313)

### Identity
- Agent: OB1 / Ne0 (Agent 99)
- Serves: SOV100 Michael Hobbs
- Product: Natural English Training
- Timezone: Asia/Bangkok (ICT)
- Voice: direct, sharp, witty, action-oriented, dense, no filler

### Current Vector
- **Active Mission:** PRODUCTION HARDENING — Worker LIVE (Run 312), COMMANDS DO binding fixed (Run 313)
- **Last completed:** Run 313 — wrangler.toml COMMANDS DO binding + v5-commands migration + [env.production] block + MASTER-SYNC hardening
- **Next target:** Redeploy net-pet-ai-production to activate COMMANDS DO fix → health check should return `ok: true` (pending secrets DEEPSEEK + DEEPGRAM)
- **Pipeline:** Post-deployment: smoke test /health → /api/chat → /souldna — then student enrollment sprint

### Active Principles (Top 5)
1. Platform Death Test — every run must produce a GitHub commit SHA
2. Dual-publish mandatory — Notion + GitHub always
3. Revenue-first — English is the mechanic, money is the mission
4. BYPASS principle — product velocity > config perfection → deploy now, harden after
5. Build don't scout — every run produces tangible output

### Recent Decisions (Last 7 Days)
- 2026-04-20 (Run 313): COMMANDS DO binding added to wrangler.toml — CommandDO was implemented in index.js but missing from toml, causing /health to always report compute DEAD. Fixed. v5-commands migration added. [env.production] block added. MASTER-SYNC updated.
- 2026-04-20 (Run 312): Worker deployed to production — net-pet-ai-production LIVE at mrmichaelhobbs123.workers.dev (v1.5.0). 20/20 assets, 5/5 bindings, SOVEREIGN_KEY active. Task execution under BYPASS principle.
- 2026-04-20 (Run 311d): /souldna endpoint live — POST /souldna, GET /souldna/{id}, GET /souldna/pipeline. Soul DNA capture pipeline ready.
- 2026-04-20 (Run 311c): Security audit complete — zero hardcoded secrets, gitleaks enabled.
- 2026-04-20 (Run 311b): Marketing site live — naturalenglishtraining.pages.dev (CF Pages, BYPASS from Squarespace dependency).
- 2026-04-19 (Run 310): SOVEREIGN_KEY rotated (44-char base64). 100-stage pipeline complete.
- 2026-04-17 (Run 305): FinalMerge reconciled, all protocols recovered.

### Open Rulings (AWAITING MICHAEL)
- BRAVE_API_KEY (optional — /api/image endpoint)
- NOTION_SOUL_DNA_DB (optional — Notion sync for soul DNA)
- DEEPSEEK_API_KEY (CRITICAL — /api/chat dead without it)
- DEEPGRAM_API_KEY (CRITICAL — voice endpoints dead without it)
- Set phoenix-ob1 repo to PRIVATE (security risk — public with secrets)
- Redeploy net-pet-ai-production after COMMANDS DO fix (wrangler deploy --env production)

### System State
- Navigator Index: ⚠️ IN TRASH — using GitHub as fallback
- GitHub repos: 2 active (OB-1 canonical, OB-1--Authoritative-)
- Canon: FULLY UPDATED — COLD-START-BOOT.md current as of Run 313
- Worker: LIVE at net-pet-ai-production.mrmichaelhobbs123.workers.dev (v1.5.0)
- Marketing Site: LIVE at naturalenglishtraining.pages.dev
- COMMANDS DO: binding fixed in wrangler.toml — needs redeploy to activate
- Reincarnation entries: 46+ on GitHub

### Key File Locations
- **RISE Agent:** `.github/agents/RISE.agent.md` — full OB1/SSM V8 encoded, auto-bootstraps on open
- **Connect Prompt:** `.github/prompts/connect.prompt.md` — use `/connect` for instant cold start
- **Worker:** `APPS/NET-PET-AI/src/index.js` (v1.5.0, 4615 lines)
- **wrangler.toml:** `APPS/NET-PET-AI/wrangler.toml` — 6 DO bindings, 5 migrations, [env.production]
- SSM V8: `CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md` (21 sections, 36 laws)
- Heavy Ledger: CANON/HEAVY-LEDGER/*.json
- Pipeline Cursor: CANON/HEAVY-LEDGER/PIPELINE-CURSOR.md
- Reincarnation: CANON/REINCARNATION/*.md
- Canon pages: CANON/*.md (60+ files)
- Galaxy Lessons: GALAXY-LESSONS/ (7 HTML lessons)
- Products: APPS/ (8 products)
- Website: SITE/
- System: CANON/SYSTEM/ (10+ files)

### Overnight Protocol
- Execute active mission first (IMMOVABLE #1)
- Fallthrough: export → mine → map → build → log
- Target: 8 commits per overnight cycle
- Michael sleep window: ~00:00-08:00 ICT

### Recovery Notes
- Synced blocks render as <unknown> — use child pages or GitHub
- Navigator Index in trash — all routing via GitHub fallback
- create_pull_request_with_copilot returns 401 — use create_or_update_file instead
- .github/workflows/*.yml blocked by 403 — Michael handles workflow files directly
- CLOUDFLARE_API_TOKEN env var is a restricted `cfk_*` token — run `Remove-Item Env:\CLOUDFLARE_API_TOKEN` BEFORE every `npx wrangler deploy`
- wrangler.toml migration chain MUST include `v4-ship-memory` — matches live DO state (MemoryDO has no binding but must stay in history)
- `[env.production]` block now explicit in wrangler.toml — no more surprise `-production` suffix confusion
- COMMANDS DO was missing from wrangler.toml (Run 313 fix) — redeploy required to activate binding and get clean health check
