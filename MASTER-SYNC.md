# PHOENIX RISING PROTOCOL — SOUL DNA SYNC v2

## Live Operating State — 2026-04-20

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
| OB-1 | hobbs0011 | CANONICAL — branch canon (default), HEAD 10882b2 — Run 311 |
| OB-1--Authoritative- | hobbs0011 | SYNCED — at 54bff5d (Run 309) |
| Phoenix-Rising-Protocol-Ultimate | hobbs-lab | SUPERSEDED |
| phoenix-ob1 | mrmichaelhobbs1234-lang | Public — SECURITY RISK (still unresolved) |

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

- [x] Marketing site live — naturalenglishtraining.pages.dev (CF Pages, Run 310) ✅
- [ ] **Custom domain activation** — Go to Squarespace Domains → naturalenglishtraining.com → Name Servers → **Use Custom Name Servers**:
  - `margaret.ns.cloudflare.com`
  - `mario.ns.cloudflare.com`
  (CF zone pre-staged, DNS records ready, Pages domains registered — NS flip is the only remaining action)
- [ ] Set phoenix-ob1 to PRIVATE (currently PUBLIC with secrets)
- [x] Rotate SOVEREIGN_KEY — ✅ 2026-04-19 (44-char base64, wrangler secret put)
- [ ] copilot-governance.md approval pending
- [ ] Push authoritative mirror — blocked by network TLS timeout 2026-04-19; retry next session
- [ ] ⚠️ CLOUDFLARE_API_TOKEN env var: must `Remove-Item Env:\CLOUDFLARE_API_TOKEN` before every `wrangler deploy`

### Worker State

| Worker | URL | Version | Status |
|---|---|---|---|
| net-pet-ai | https://net-pet-ai.mrmichaelhobbs123.workers.dev | 934ce2a9 | ✅ LIVE 2026-04-19 |

### Run History

| Run | HEAD | Date | Notes |
|---|---|---|---|
| Run 310 | 160505e | 2026-04-19 | 100-stage pipeline: CF Pages, workflow hardening, Notion guard, SOVEREIGN_KEY rotated |
| Run 311 | 10882b2 | 2026-04-20 | wrangler 4.80→4.83, phase4/5/6 snapshots, Phoenix-Rising-Ultimate 39 dead branches purged |
| Run 311b | pending | 2026-04-20 | CF zone naturalenglishtraining.com pre-staged, CNAME bypass — NS flip only |

### Cost Target

< $50/month total
