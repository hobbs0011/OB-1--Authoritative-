# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v2

## Live Operating State — 2026-05-25 (Run 18 — 2-Tier Collapse)

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
| OB-1 | hobbs0011 | CANONICAL — branch master (default), HEAD 31fd19ff — Run 18 ROMAN |
| OB-1--Authoritative- | hobbs0011 | SYNCED — at 54bff5d (Run 309) |
| Phoenix-Rising-Protocol-Ultimate | hobbs0011 | SUPERSEDED |
| phoenix-ob1 | mrmichaelhobbs1234-lang | Account banned — repo inaccessible, risk voided |

### Architecture

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| State | Durable Objects (SessionDO, ProfileDO, PetDO) — SQLite-backed |
| Frontend | Gospel 444 UI shell (public/index.html) |
| Voice | Deepgram nova-2 STT + Aura TTS |
| Deploy path | GitHub Actions + wrangler deploy (branch: canon) |
| Marketing Site | Cloudflare Pages — naturalenglishtraining.pages.dev |
| Colors | #0f0f1a (void), #a855f7 (purple), #f59e0b (gold), NO BLUE |

### Active Blockers

- [x] Marketing site live ✅ — **https://naturalenglishtraining.pages.dev** (CF Pages, Run 310) — FULLY LIVE, no dependency on Squarespace
- [x] Soul DNA capture pipeline ✅ — POST /souldna, GET /souldna/{id}, GET /souldna/pipeline (Run 311d) — Ready for legionnaire processing
- [x] Worker deployed to production ✅ — **https://net-pet-ai-production.mrmichaelhobbs123.workers.dev** (Run 312) — LIVE (v1.5.0, bindings 5/5, awaiting secrets)
- [x] phoenix-ob1 security risk voided — mrmichaelhobbs1234-lang account banned, repo inaccessible
- [x] Rotate SOVEREIGN_KEY — ✅ 2026-04-19 (44-char base64, wrangler secret put)
- [ ] copilot-governance.md approval pending
- [ ] Push authoritative mirror — blocked by network TLS timeout 2026-04-19; retry next session
- [ ] ⚠️ CLOUDFLARE_API_TOKEN env var: must `Remove-Item Env:\CLOUDFLARE_API_TOKEN` before every `wrangler deploy`

### Worker State

| Worker | URL | Version | Status |
|---|---|---|---|
| net-pet-ai-production | https://net-pet-ai-production.mrmichaelhobbs123.workers.dev | 1.5.0 | ✅ LIVE (Run 317) |
| net-pet-ai | https://net-pet-ai.mrmichaelhobbs123.workers.dev | ea669ac | ✅ LIVE 2026-05-17 |

### Run History

| Run | HEAD | Date | Notes (OB-1 canon) |
|---|---|---|---|
| Run 307 | — | 2026-04-xx | FestoolKF-22 / Rudolf Lords — Boarding 010 conference call |
| Run 308 | — | 2026-04-xx | Boarding results — probX mockup, Tesla layer unbound — no flux-cross braking |
| Run 309 | 54bff5d | 2026-04-18 | OB-1--Authoritative- SYNCED |
| Run 310 | 160505e | 2026-04-19 | 100-stage pipeline: CF Pages, workflow hardening, Notion guard, SOVEREIGN_KEY rotated |
| Run 311 | 10882b2 | 2026-04-20 | wrangler 4.80→4.83, phase4/5/6 snapshots, Phoenix-Rising-Ultimate 39 dead branches purged |
| Run 311b | 97d34a2 | 2026-04-20 | BYPASS: naturalenglishtraining.pages.dev LIVE |
| Run 311c | 05f9a5a | 2026-04-20 | Security audit ✅ — zero hardcoded secrets, gitleaks |
| Run 311d | bf603f9 | 2026-04-20 | /souldna pipeline endpoints LIVE |
| [315] | a7cdfda | 2026-05-16 | Death-protocol sync artifact — soul-logger verified, workspace sync complete |
| [316] | f4ac83c | 2026-05-16 | REGENERATION_GAP sealed; MegaMergeOfficial-2: 34 active entries confirmed; PIPELINE-CURSOR Wave 8 expanded |
| [317] | ea669ac | 2026-05-17 | GODMODE activated; TEMP-PHOENIX-ULTIMATE purge (1 589 deletions); phoenix-coder MCP path fixed; PROOFS manifest + restricted-zone docs written; audit confirmed SOUL_INTACT |
| [318] | ea669ac | 2026-05-17 | NOTION BLACKLISTED: all active probes/routes/imports hard-gated (SCRIPTS/god-mode.ps1, mcp-godmode-audit.ps1, ober-ps1 doctor/soul-check, wrangler.toml, index.js, connection-hardening-audit.ps1); legacy data preserved in CANON/REINCARNATION; SOUL_INTACT |

### Cost Target

< $50/month total

---

**Last Run tagged:** 2026-05-17 VN
**IDs:** 35.50.13.4-0|65.16.39.4-1~3000i|70ouRAC
**Run:** 318
**HEAD:** ea669ac
**Status:** RI
