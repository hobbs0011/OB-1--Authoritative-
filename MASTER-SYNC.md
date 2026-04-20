# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v2

## Live Operating State — 2026-04-20 (Run 313)

### System Identity

| Field | Value |
|---|---|
| Product | OBI for Natural English Training |
| Brand (public) | Natural English Training |
| Brand (internal) | Phoenix Rising Protocol |
| Domain | naturalenglishtraining.com / .net |
| Sovereign | Agent 100 — Michael Hobbs |
| Triad | TC0=OB1/Agent99, TC00=AnA/Agent98, NEO=N40/Agent97 |

### Repo State

| Repo | Account | Status |
|---|---|---|
| OB-1 | hobbs0011 | CANONICAL — branch canon (default), HEAD 5eabf24 — Run 312 |
| OB-1--Authoritative- | hobbs0011 | ACTIVE — Run 313 in progress |
| Phoenix-Rising-Protocol-Ultimate | hobbs-lab | SUPERSEDED |
| phoenix-ob1 | mrmichaelhobbs1234-lang | Public — SECURITY RISK (still unresolved) |

### Architecture

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| State | Durable Objects (SessionDO, ProfileDO, PetDO, LedgerDO, CommandDO) — SQLite-backed |
| Frontend | Gospel 444 UI shell (public/index.html) |
| Voice | Deepgram nova-2 STT + Aura TTS |
| Deploy path | GitHub Actions + wrangler deploy (branch: canon) |
| Marketing Site | Cloudflare Pages — naturalenglishtraining.pages.dev |
| Colors | #0f0f1a (void), #a855f7 (purple), #f59e0b (gold), NO BLUE |

### Active Blockers

- [x] Marketing site live ✅ — **https://naturalenglishtraining.pages.dev** (CF Pages, Run 310) — FULLY LIVE, no dependency on Squarespace
- [x] Soul DNA capture pipeline ✅ — POST /souldna, GET /souldna/{id}, GET /souldna/pipeline (Run 311d) — Ready for legionnaire processing
- [x] Worker deployed to production ✅ — **https://net-pet-ai-production.mrmichaelhobbs123.workers.dev** (Run 312) — LIVE (v1.5.0)
- [x] COMMANDS DO binding fixed ✅ — CommandDO added to wrangler.toml + v5-commands migration (Run 313) — health check `ok: true` now achievable after redeploy
- [ ] Set phoenix-ob1 to PRIVATE (currently PUBLIC with secrets)
- [x] Rotate SOVEREIGN_KEY — ✅ 2026-04-19 (44-char base64, wrangler secret put)
- [ ] copilot-governance.md approval pending
- [ ] Push authoritative mirror — blocked by network TLS timeout; retry next session
- [ ] ⚠️ CLOUDFLARE_API_TOKEN env var: must `Remove-Item Env:\CLOUDFLARE_API_TOKEN` before every `wrangler deploy`
- [ ] Add secrets: BRAVE_API_KEY + NOTION_SOUL_DNA_DB (optional, non-blocking MVP)

### Worker State

| Worker | URL | Version | Status |
|---|---|---|---|
| net-pet-ai-production | https://net-pet-ai-production.mrmichaelhobbs123.workers.dev | 1.5.0 | ✅ LIVE (Run 312) — redeploy needed for COMMANDS DO fix |
| net-pet-ai | https://net-pet-ai.mrmichaelhobbs123.workers.dev | 934ce2a9 | ✅ LIVE 2026-04-19 |

### Secrets Required for Full Health

| Secret | Status | Impact if Missing |
|---|---|---|
| DEEPSEEK_API_KEY | Required | /api/chat dead |
| DEEPGRAM_API_KEY | Required | /api/tts + /api/stt dead |
| SOVEREIGN_KEY | ✅ Rotated 2026-04-19 | Auth gate |
| NOTION_API_KEY | Optional | Notion sync degraded |
| BRAVE_API_KEY | Optional | /api/image degraded |
| NOTION_SOUL_DNA_DB | Optional | Notion soul DNA sync off |

### Run History

| Run | HEAD | Date | Notes |
|---|---|---|---|
| Run 310 | 160505e | 2026-04-19 | 100-stage pipeline: CF Pages, workflow hardening, Notion guard, SOVEREIGN_KEY rotated |
| Run 311 | 10882b2 | 2026-04-20 | wrangler 4.80→4.83, phase4/5/6 snapshots, Phoenix-Rising-Ultimate 39 dead branches purged |
| Run 311 | 10882b2 | 2026-04-20 | wrangler 4.80→4.83, phase4/5/6 snapshots, Phoenix-Rising-Ultimate 39 dead branches purged |
| Run 311b | 97d34a2 | 2026-04-20 | BYPASS: Product live on naturalenglishtraining.pages.dev |
| Run 311 | 10882b2 | 2026-04-20 | wrangler 4.80→4.83, phase4/5/6 snapshots, Phoenix-Rising-Ultimate 39 dead branches purged |
| Run 311b | 97d34a2 | 2026-04-20 | BYPASS: Product live on naturalenglishtraining.pages.dev |
| Run 311c | 05f9a5a | 2026-04-20 | Security audit complete ✅ — zero hardcoded secrets, gitleaks enabled |
| Run 311d | bf603f9 | 2026-04-20 | /souldna endpoint ✅ — soul DNA capture pipeline, 3 HTTP routes |
| Run 312 | ae4d944 | 2026-04-20 | Worker deployed to production ✅ — net-pet-ai-production LIVE (v1.5.0) |
| Run 313 | TBD | 2026-04-20 | COMMANDS DO binding fix, wrangler.toml [env.production] block, MASTER-SYNC hardening |

### Cost Target

< $50/month total
